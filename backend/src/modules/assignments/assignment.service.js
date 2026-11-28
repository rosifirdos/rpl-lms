import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import prisma from '../../config/prisma.js';
import { STORAGE } from '../../config/env.js';
import { ROLES } from '../../constants/roles.js';
import { AUDIT_ENTITIES } from '../../constants/auditEntities.js';
import { AuditLogService } from '../audit-log/audit-log.service.js';
import { NotificationService } from '../notifications/notification.service.js';
import { buildAssignmentCreatedNotification, buildAssignmentPublishedNotification } from '../notifications/notification.templates.js';
import { AppError } from '../../utils/errors.js';
import { ensureCanManageClass, ensureCanReadClass, getStudentRecordOrThrow } from '../../utils/ownership.js';
import { generateStorageName, resolveStorageSubdir, sanitizeFilename, DOCUMENT_MIME_TYPES } from '../../utils/storage.js';
import { assertDocumentSignature } from '../../utils/fileSignature.js';

const FILE_SELECT = {
  id: true,
  original_name: true,
  storage_name: true,
  file_path: true,
  mime_type: true,
  size_bytes: true,
};

const meetingInclude = {
  class: { include: { lecturer: { select: { user_id: true } } } },
};

function number(value) { return value == null ? null : Number(value); }

function serializeAssignment(assignment, extras = {}) {
  return {
    id: assignment.id,
    meeting_id: assignment.meeting_id,
    meeting_number: assignment.meeting?.meeting_number,
    title: assignment.title,
    instructions: assignment.instructions,
    weight_percentage: number(assignment.weight_percentage),
    due_date: assignment.due_date,
    allow_late: assignment.allow_late,
    is_published: assignment.is_published,
    soal: assignment.soal ? {
      id: assignment.soal.id,
      original_name: assignment.soal.original_name,
      size_bytes: assignment.soal.size_bytes,
      mime_type: assignment.soal.mime_type,
    } : null,
    ...extras,
  };
}

function validateDocumentFile(file, maxSize) {
  if (!file) return null;
  const extension = path.extname(file.originalname).toLowerCase();
  const allowedMimes = DOCUMENT_MIME_TYPES[extension];
  if (!allowedMimes) {
    throw new AppError('Format berkas tidak didukung. Harap unggah file .pdf, .docx, .xlsx, atau .zip', 400);
  }
  if (file.size > maxSize) {
    throw new AppError(`Ukuran berkas melebihi batas maksimal (maks ${maxSize / 1024 / 1024}MB)`, 400);
  }
  if (file.mimetype !== 'application/octet-stream' && !allowedMimes.includes(file.mimetype)) {
    throw new AppError('Tipe berkas (MIME) tidak sesuai dengan ekstensi berkas', 400);
  }
  assertDocumentSignature(file.buffer, extension);
  return extension;
}

function getFilePath(file) {
  if (!file?.storage_name || path.basename(file.storage_name) !== file.storage_name) {
    throw new AppError('Metadata berkas tugas tidak valid', 500);
  }
  const expected = path.join('assignments', file.storage_name);
  if (path.normalize(file.file_path) !== expected) {
    throw new AppError('Lokasi berkas tugas tidak valid', 500);
  }
  return path.resolve(resolveStorageSubdir('assignment'), file.storage_name);
}

async function writeAssignmentFile(file, userId) {
  const extension = validateDocumentFile(file, STORAGE.DOC_MAX_SIZE);
  if (!extension) return null;
  const originalName = sanitizeFilename(file.originalname);
  if (!originalName || originalName.length > 255) {
    throw new AppError('Nama berkas tugas harus berisi maksimal 255 karakter', 400);
  }
  const storageName = generateStorageName(file.originalname);
  const directory = resolveStorageSubdir('assignment');
  await fs.mkdir(directory, { recursive: true });
  const destination = path.resolve(directory, storageName);
  await fs.writeFile(destination, file.buffer, { flag: 'wx' });
  return { destination, originalName, storageName, filePath: path.join('assignments', storageName), extension };
}

export class AssignmentService {
  static async createAssignment({ meetingId, payload, file, user, ipAddress, userAgent }) {
    const meeting = await prisma.meeting.findUnique({ where: { id: meetingId }, include: meetingInclude });
    if (!meeting) throw new AppError('Pertemuan tidak ditemukan', 404);
    ensureCanManageClass(meeting.class, user);
    if (meeting.is_exam) throw new AppError('Pertemuan UTS/UAS tidak dapat digunakan untuk tugas biasa', 400);

    const dueDate = new Date(payload.due_date);
    if (!Number.isFinite(dueDate.getTime()) || dueDate <= new Date()) {
      throw new AppError('due_date harus berada di masa depan', 400);
    }

    const written = file ? await writeAssignmentFile(file, user.id) : null;
    try {
      const result = await prisma.$transaction(async (tx) => {
        let fileRecord = null;
        if (written) {
          fileRecord = await tx.file.create({
            data: {
              original_name: written.originalName,
              storage_name: written.storageName,
              file_path: written.filePath,
              mime_type: DOCUMENT_MIME_TYPES[written.extension][0],
              size_bytes: file.size,
              uploaded_by: user.id,
            },
            select: FILE_SELECT,
          });
        }
        const created = await tx.assignment.create({
          data: {
            meeting_id: meetingId,
            title: payload.title,
            instructions: payload.instructions ?? null,
            weight_percentage: payload.weight_percentage,
            due_date: dueDate,
            allow_late: payload.allow_late,
            is_published: payload.is_published,
            file_soal_id: fileRecord?.id ?? null,
          },
          include: { meeting: true, soal: { select: FILE_SELECT } },
        });
        await AuditLogService.record({
          userId: user.id,
          action: 'CREATE_ASSIGNMENT',
          entity: AUDIT_ENTITIES.ASSIGNMENTS,
          entityId: created.id,
          newValues: { title: created.title, weight_percentage: number(created.weight_percentage), due_date: created.due_date, file_id: fileRecord?.id ?? null },
          ipAddress,
          userAgent,
          dbClient: tx,
        });
        return serializeAssignment(created);
      });
      // Notifikasi best-effort: tugas langsung terbit saat dibuat (FR-057).
      if (payload.is_published) {
        const [recipientIds, classRow] = await Promise.all([
          NotificationService.getEnrolledStudentUserIds(meeting.class_id),
          prisma.class.findUnique({
            where: { id: meeting.class_id },
            select: { name: true },
          }),
        ]);
        const template = buildAssignmentCreatedNotification({
          assignmentTitle: result.title,
          dueDate: result.due_date,
          className: classRow?.name ?? '',
          classId: meeting.class_id,
          assignmentId: result.id,
        });
        await NotificationService.notifyMany({
          userIds: recipientIds,
          type: template.type,
          title: template.title,
          message: template.message,
          link: template.link,
          dedupeKeyFor: () => `assignment:${result.id}:created`,
        });
      }
      return result;
    } catch (error) {
      if (written) await fs.unlink(written.destination).catch(() => {});
      throw error;
    }
  }

  static async listAssignments({ classId, user }) {
    const classRecord = await prisma.class.findUnique({ where: { id: classId }, include: { lecturer: { select: { user_id: true } } } });
    if (!classRecord) throw new AppError('Kelas perkuliahan tidak ditemukan', 404);
    await ensureCanReadClass({ user, classRecord, classId });

    const where = { meeting: { class_id: classId }, ...(user.role === ROLES.MAHASISWA ? { is_published: true } : {}) };
    const assignments = await prisma.assignment.findMany({
      where,
      orderBy: { due_date: 'asc' },
      include: {
        meeting: { select: { meeting_number: true } },
        soal: { select: FILE_SELECT },
        submissions: user.role === ROLES.MAHASISWA
          ? { where: { student: { user_id: user.id } } }
          : { select: { id: true } },
      },
    });
    return assignments.map((assignment) => {
      const submission = assignment.submissions?.[0] ?? null;
      const extras = user.role === ROLES.MAHASISWA
        ? { my_submission: submission ? { id: submission.id, status: submission.score != null ? 'GRADED' : submission.is_late ? 'LATE' : 'SUBMITTED', score: number(submission.score) } : null }
        : { _count: { submissions: assignment.submissions.length } };
      return serializeAssignment(assignment, extras);
    });
  }

  static async getAssignmentDetail({ assignmentId, user }) {
    const assignment = await prisma.assignment.findUnique({
      where: { id: assignmentId },
      include: {
        meeting: { include: meetingInclude },
        soal: { select: FILE_SELECT },
        submissions: { select: { id: true, student_id: true, submitted_at: true, is_late: true, score: true, feedback: true } },
      },
    });
    if (!assignment) throw new AppError('Tugas tidak ditemukan', 404);
    await ensureCanReadClass({ user, classRecord: assignment.meeting.class, classId: assignment.meeting.class_id });
    if (user.role === ROLES.MAHASISWA) {
      if (!assignment.is_published) throw new AppError('Tugas tidak ditemukan', 404);
      const student = await getStudentRecordOrThrow(user.id);
      const submission = assignment.submissions.find((item) => item.student_id === student.id);
      return serializeAssignment(assignment, {
        my_submission: submission ? {
          id: submission.id,
          status: submission.score != null ? 'GRADED' : submission.is_late ? 'LATE' : 'SUBMITTED',
          submitted_at: submission.submitted_at,
          is_late: submission.is_late,
          score: number(submission.score),
          feedback: submission.feedback,
        } : null,
      });
    }
    const submitted = assignment.submissions.filter((item) => item.submitted_at);
    const late = submitted.filter((item) => item.is_late).length;
    const graded = submitted.filter((item) => item.score != null).length;
    const totalStudents = await prisma.enrollment.count({ where: { class_id: assignment.meeting.class_id } });
    const submittedCount = submitted.length;
    return serializeAssignment(assignment, {
      roster_summary: {
        total_students: totalStudents,
        submitted: submittedCount,
        late,
        graded,
        not_submitted: Math.max(totalStudents - submittedCount, 0),
      },
    });
  }

  static async updateAssignment({ assignmentId, payload, file, user, ipAddress, userAgent }) {
    const assignment = await prisma.assignment.findUnique({
      where: { id: assignmentId },
      include: { meeting: { include: meetingInclude }, soal: { select: FILE_SELECT } },
    });
    if (!assignment) throw new AppError('Tugas tidak ditemukan', 404);
    ensureCanManageClass(assignment.meeting.class, user);
    if (!file && Object.keys(payload).length === 0) {
      throw new AppError('Tidak ada data yang diperbarui', 400);
    }

    if (payload.due_date && new Date(payload.due_date) <= new Date()) {
      throw new AppError('due_date harus berada di masa depan', 400);
    }

    let written = null;
    let quarantined = null;
    let oldSourcePath = null;
    try {
      written = file ? await writeAssignmentFile(file, user.id) : null;
      const oldFile = assignment.soal;
      if (written && oldFile) {
        const oldPath = getFilePath(oldFile);
        oldSourcePath = oldPath;
        quarantined = `${oldPath}.replacing-${crypto.randomUUID()}`;
        try {
          await fs.rename(oldPath, quarantined);
        } catch (error) {
          if (error.code !== 'ENOENT') throw error;
          quarantined = null;
        }
      }

      const result = await prisma.$transaction(async (tx) => {
        let fileId = assignment.file_soal_id;
        if (written) {
          const fileRecord = await tx.file.create({
            data: {
              original_name: written.originalName,
              storage_name: written.storageName,
              file_path: written.filePath,
              mime_type: DOCUMENT_MIME_TYPES[written.extension][0],
              size_bytes: file.size,
              uploaded_by: user.id,
            },
            select: FILE_SELECT,
          });
          fileId = fileRecord.id;
          if (oldFile) await tx.file.delete({ where: { id: oldFile.id } });
        }
        const updated = await tx.assignment.update({
          where: { id: assignmentId },
          data: {
            ...(payload.title !== undefined ? { title: payload.title } : {}),
            ...(payload.instructions !== undefined ? { instructions: payload.instructions } : {}),
            ...(payload.weight_percentage !== undefined ? { weight_percentage: payload.weight_percentage } : {}),
            ...(payload.due_date !== undefined ? { due_date: new Date(payload.due_date) } : {}),
            ...(payload.allow_late !== undefined ? { allow_late: payload.allow_late } : {}),
            ...(payload.is_published !== undefined ? { is_published: payload.is_published } : {}),
            ...(written ? { file_soal_id: fileId } : {}),
          },
          include: { meeting: true, soal: { select: FILE_SELECT } },
        });
        await AuditLogService.record({
          userId: user.id,
          action: 'UPDATE_ASSIGNMENT',
          entity: AUDIT_ENTITIES.ASSIGNMENTS,
          entityId: assignmentId,
          oldValues: { title: assignment.title, weight_percentage: number(assignment.weight_percentage), is_published: assignment.is_published },
          newValues: { title: updated.title, weight_percentage: number(updated.weight_percentage), is_published: updated.is_published },
          ipAddress,
          userAgent,
          dbClient: tx,
        });
        return serializeAssignment(updated);
      });
      if (quarantined) await fs.unlink(quarantined).catch(() => {});
      // Notifikasi best-effort: transisi draft → terbit (FR-057).
      if (!assignment.is_published && payload.is_published === true && updated.is_published) {
        const [recipientIds, classRow] = await Promise.all([
          NotificationService.getEnrolledStudentUserIds(updated.meeting.class_id),
          prisma.class.findUnique({
            where: { id: updated.meeting.class_id },
            select: { name: true },
          }),
        ]);
        const template = buildAssignmentPublishedNotification({
          assignmentTitle: updated.title,
          dueDate: updated.due_date,
          className: classRow?.name ?? '',
          classId: updated.meeting.class_id,
          assignmentId: updated.id,
        });
        await NotificationService.notifyMany({
          userIds: recipientIds,
          type: template.type,
          title: template.title,
          message: template.message,
          link: template.link,
          dedupeKeyFor: () => `assignment:${updated.id}:published`,
        });
      }
      return result;
    } catch (error) {
      if (written) await fs.unlink(written.destination).catch(() => {});
      if (quarantined) {
        await fs.rename(quarantined, oldSourcePath).catch(() => {});
      }
      throw error;
    }
  }

  static async deleteAssignment({ assignmentId, user, ipAddress, userAgent }) {
    const assignment = await prisma.assignment.findUnique({
      where: { id: assignmentId },
      include: {
        meeting: { include: meetingInclude },
        soal: { select: FILE_SELECT },
        submissions: { include: { file: { select: FILE_SELECT } } },
      },
    });
    if (!assignment) throw new AppError('Tugas tidak ditemukan', 404);
    ensureCanManageClass(assignment.meeting.class, user);

    const paths = [];
    if (assignment.soal) paths.push({ source: getFilePath(assignment.soal), quarantine: null });
    for (const submission of assignment.submissions) {
      paths.push({ source: getSubmissionFilePath(submission.file), quarantine: null });
    }
    for (const item of paths) {
      item.quarantine = `${item.source}.deleting-${crypto.randomUUID()}`;
      try { await fs.rename(item.source, item.quarantine); } catch (error) { if (error.code !== 'ENOENT') throw error; item.quarantine = null; }
    }
    try {
      await prisma.$transaction(async (tx) => {
        await tx.assignment.delete({ where: { id: assignmentId } });
        for (const file of [assignment.soal, ...assignment.submissions.map((s) => s.file)]) {
          if (file) await tx.file.deleteMany({ where: { id: file.id } });
        }
        await AuditLogService.record({
          userId: user.id,
          action: 'DELETE_ASSIGNMENT',
          entity: AUDIT_ENTITIES.ASSIGNMENTS,
          entityId: assignmentId,
          oldValues: { title: assignment.title, file_ids: [assignment.file_soal_id, ...assignment.submissions.map((s) => s.file_id)].filter(Boolean) },
          ipAddress,
          userAgent,
          dbClient: tx,
        });
      });
      for (const item of paths) if (item.quarantine) await fs.unlink(item.quarantine).catch(() => {});
      return { id: assignmentId };
    } catch (error) {
      for (const item of paths) if (item.quarantine) await fs.rename(item.quarantine, item.source).catch(() => {});
      throw error;
    }
  }

  static async getAssignmentFileForDownload({ assignmentId, user }) {
    const assignment = await prisma.assignment.findUnique({
      where: { id: assignmentId },
      include: { meeting: { include: meetingInclude }, soal: { select: FILE_SELECT } },
    });
    if (!assignment) throw new AppError('Tugas tidak ditemukan', 404);
    await ensureCanReadClass({ user, classRecord: assignment.meeting.class, classId: assignment.meeting.class_id });
    if (user.role === ROLES.MAHASISWA && !assignment.is_published) throw new AppError('Tugas tidak ditemukan', 404);
    if (!assignment.soal) throw new AppError('Tugas tidak memiliki berkas soal', 404);
    const filePath = getFilePath(assignment.soal);
    try { await fs.access(filePath); } catch { throw new AppError('Berkas soal tidak ditemukan', 404); }
    return { filePath, fileName: assignment.soal.original_name, mimeType: assignment.soal.mime_type };
  }
}

function getSubmissionFilePath(file) {
  if (!file?.storage_name || path.basename(file.storage_name) !== file.storage_name) throw new AppError('Metadata berkas submission tidak valid', 500);
  const expected = path.join('submissions', file.storage_name);
  if (path.normalize(file.file_path) !== expected) throw new AppError('Lokasi berkas submission tidak valid', 500);
  return path.resolve(resolveStorageSubdir('submission'), file.storage_name);
}
