import crypto from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import prisma from '../../config/prisma.js';
import { ROLES } from '../../constants/roles.js';
import { AUDIT_ENTITIES } from '../../constants/auditEntities.js';
import { STORAGE } from '../../config/env.js';
import { AuditLogService } from '../audit-log/audit-log.service.js';
import { AppError } from '../../utils/errors.js';
import { ensureCanReadClass, ensureCanManageClass, ensureEnrolledInClass, getStudentRecordOrThrow } from '../../utils/ownership.js';
import { DOCUMENT_MIME_TYPES, generateStorageName, resolveStorageSubdir, sanitizeFilename } from '../../utils/storage.js';
import { assertDocumentSignature } from '../../utils/fileSignature.js';

const FILE_SELECT = {
  id: true,
  original_name: true,
  storage_name: true,
  file_path: true,
  mime_type: true,
  size_bytes: true,
};

function number(value) { return value == null ? null : Number(value); }

function statusFor(submission) {
  if (!submission) return 'NOT_SUBMITTED';
  if (submission.score != null) return 'GRADED';
  if (submission.is_late) return 'LATE';
  return 'SUBMITTED';
}

function serializeSubmission(submission) {
  return {
    id: submission.id,
    assignment_id: submission.assignment_id,
    student_id: submission.student_id,
    status: statusFor(submission),
    submitted_at: submission.submitted_at,
    is_late: submission.is_late,
    score: number(submission.score),
    feedback: submission.feedback,
    graded_at: submission.graded_at,
  };
}

function getSubmissionFilePath(file) {
  if (!file?.storage_name || path.basename(file.storage_name) !== file.storage_name) {
    throw new AppError('Metadata berkas submission tidak valid', 500);
  }
  const expected = path.join('submissions', file.storage_name);
  if (path.normalize(file.file_path) !== expected) {
    throw new AppError('Lokasi berkas submission tidak valid', 500);
  }
  return path.resolve(resolveStorageSubdir('submission'), file.storage_name);
}

async function writeSubmissionFile(file, userId) {
  const extension = path.extname(file.originalname).toLowerCase();
  const allowedMimes = DOCUMENT_MIME_TYPES[extension];
  if (!allowedMimes) {
    throw new AppError('Format berkas tidak didukung. Harap unggah file .pdf, .docx, .xlsx, atau .zip', 400);
  }
  if (file.size > STORAGE.SUBMISSION_MAX_SIZE) {
    throw new AppError(`Ukuran berkas melebihi batas maksimal (maks ${STORAGE.SUBMISSION_MAX_SIZE / 1024 / 1024}MB)`, 400);
  }
  if (file.mimetype !== 'application/octet-stream' && !allowedMimes.includes(file.mimetype)) {
    throw new AppError('Tipe berkas (MIME) tidak sesuai dengan ekstensi berkas', 400);
  }
  assertDocumentSignature(file.buffer, extension);
  const originalName = sanitizeFilename(file.originalname);
  if (!originalName || originalName.length > 255) {
    throw new AppError('Nama berkas jawaban harus berisi maksimal 255 karakter', 400);
  }
  const storageName = generateStorageName(file.originalname);
  const directory = resolveStorageSubdir('submission');
  await fs.mkdir(directory, { recursive: true });
  const destination = path.resolve(directory, storageName);
  await fs.writeFile(destination, file.buffer, { flag: 'wx' });
  return {
    destination,
    originalName,
    storageName,
    filePath: path.join('submissions', storageName),
    mimeType: DOCUMENT_MIME_TYPES[extension][0],
  };
}

export class SubmissionService {
  static async uploadSubmission({ assignmentId, file, user, ipAddress, userAgent }) {
    if (!file) throw new AppError('Berkas jawaban tugas wajib diunggah', 400);

    const assignment = await prisma.assignment.findUnique({
      where: { id: assignmentId },
      include: { meeting: { include: { class: { include: { lecturer: { select: { user_id: true } } } } } } },
    });
    if (!assignment) throw new AppError('Tugas tidak ditemukan', 404);
    if (!assignment.is_published) throw new AppError('Tugas tidak ditemukan', 404);

    await ensureEnrolledInClass({
      userId: user.id,
      classId: assignment.meeting.class_id,
    });
    const student = await getStudentRecordOrThrow(user.id);
    const existing = await prisma.submission.findUnique({
      where: { assignment_id_student_id: { assignment_id: assignmentId, student_id: student.id } },
      include: { file: { select: FILE_SELECT } },
    });
    if (existing?.score != null) {
      throw new AppError('Submission telah dinilai dan tidak dapat diubah', 409);
    }

    const now = new Date();
    const isLate = now > assignment.due_date;
    if (isLate && !assignment.allow_late) {
      throw new AppError('Batas waktu pengumpulan tugas telah berakhir', 403);
    }

    let written = null;
    let quarantined = null;
    try {
      written = await writeSubmissionFile(file, user.id);
      if (existing) {
        const oldPath = getSubmissionFilePath(existing.file);
        quarantined = `${oldPath}.replacing-${crypto.randomUUID()}`;
        try {
          await fs.rename(oldPath, quarantined);
        } catch (error) {
          if (error.code !== 'ENOENT') throw error;
          quarantined = null;
        }
      }
      const submission = await prisma.$transaction(async (tx) => {
        const fileRecord = await tx.file.create({
          data: {
            original_name: written.originalName,
            storage_name: written.storageName,
            file_path: written.filePath,
            mime_type: written.mimeType,
            size_bytes: file.size,
            uploaded_by: user.id,
          },
          select: FILE_SELECT,
        });

        const upserted = await tx.submission.upsert({
          where: { assignment_id_student_id: { assignment_id: assignmentId, student_id: student.id } },
          create: {
            assignment_id: assignmentId,
            student_id: student.id,
            file_id: fileRecord.id,
            submitted_at: now,
            is_late: isLate,
          },
          update: {
            file_id: fileRecord.id,
            submitted_at: now,
            is_late: isLate,
            score: null,
            feedback: null,
            graded_at: null,
          },
          include: { file: { select: FILE_SELECT } },
        });

        if (existing) {
          await tx.file.delete({ where: { id: existing.file_id } });
        }
        await AuditLogService.record({
          userId: user.id,
          action: existing ? 'UPDATE_SUBMISSION' : 'CREATE_SUBMISSION',
          entity: AUDIT_ENTITIES.SUBMISSIONS,
          entityId: upserted.id,
          oldValues: existing ? { file_id: existing.file_id, submitted_at: existing.submitted_at, is_late: existing.is_late } : null,
          newValues: { file_id: fileRecord.id, original_name: fileRecord.original_name, size_bytes: fileRecord.size_bytes, submitted_at: now, is_late: isLate },
          ipAddress,
          userAgent,
          dbClient: tx,
        });
        return upserted;
      });

      if (quarantined) await fs.unlink(quarantined).catch(() => {});
      return { created: !existing, submission: serializeSubmission(submission) };
    } catch (error) {
      if (written) await fs.unlink(written.destination).catch(() => {});
      if (quarantined) {
        await fs.rename(quarantined, getSubmissionFilePath(existing.file)).catch(() => {});
      }
      throw error;
    }
  }

  static async getMySubmission({ assignmentId, user }) {
    const assignment = await prisma.assignment.findUnique({
      where: { id: assignmentId },
      include: { meeting: { include: { class: { include: { lecturer: { select: { user_id: true } } } } } } },
    });
    if (!assignment) throw new AppError('Tugas tidak ditemukan', 404);
    if (!assignment.is_published) throw new AppError('Tugas tidak ditemukan', 404);
    await ensureEnrolledInClass({ userId: user.id, classId: assignment.meeting.class_id });
    const student = await getStudentRecordOrThrow(user.id);
    const submission = await prisma.submission.findUnique({
      where: { assignment_id_student_id: { assignment_id: assignmentId, student_id: student.id } },
    });
    return submission ? serializeSubmission(submission) : null;
  }

  static async getSubmissionRoster({ assignmentId, user }) {
    const assignment = await prisma.assignment.findUnique({
      where: { id: assignmentId },
      include: { meeting: { include: { class: { include: { lecturer: { select: { user_id: true } } } } } } },
    });
    if (!assignment) throw new AppError('Tugas tidak ditemukan', 404);
    ensureCanManageClass(assignment.meeting.class, user);
    const enrollments = await prisma.enrollment.findMany({
      where: { class_id: assignment.meeting.class_id },
      orderBy: { student: { nim: 'asc' } },
      include: { student: { include: { user: { include: { profile: true } } } } },
    });
    const submissions = await prisma.submission.findMany({
      where: { assignment_id: assignmentId },
      include: { file: { select: FILE_SELECT } },
    });
    const byStudent = new Map(submissions.map((item) => [item.student_id, item]));
    const roster = enrollments.map((enrollment) => {
      const submission = byStudent.get(enrollment.student_id);
      return {
        student_id: enrollment.student_id,
        nim: enrollment.student.nim,
        full_name: enrollment.student.user?.profile?.full_name ?? null,
        submission_id: submission?.id ?? null,
        submitted_at: submission?.submitted_at ?? null,
        is_late: submission?.is_late ?? false,
        score: number(submission?.score),
        feedback: submission?.feedback ?? null,
        status: statusFor(submission),
        download_url: submission ? `/api/submissions/${submission.id}/download` : null,
      };
    });
    const submitted = roster.filter((item) => item.status !== 'NOT_SUBMITTED');
    return {
      total_students: roster.length,
      submitted: submitted.length,
      late: submitted.filter((item) => item.is_late).length,
      graded: submitted.filter((item) => item.status === 'GRADED').length,
      not_submitted: roster.length - submitted.length,
      roster,
    };
  }

  static async getSubmissionForDownload({ submissionId, user }) {
    const submission = await prisma.submission.findUnique({
      where: { id: submissionId },
      include: {
        file: { select: FILE_SELECT },
        assignment: { include: { meeting: { include: { class: { include: { lecturer: { select: { user_id: true } } } } } } } },
        student: { select: { id: true, user_id: true } },
      },
    });
    if (!submission) throw new AppError('Submission tidak ditemukan', 404);
    if (user.role === ROLES.MAHASISWA) {
      if (submission.student.user_id !== user.id) throw new AppError('Akses ditolak: Anda hanya dapat mengunduh submission milik sendiri', 403);
      await ensureEnrolledInClass({ userId: user.id, classId: submission.assignment.meeting.class_id });
    } else {
      ensureCanManageClass(submission.assignment.meeting.class, user);
    }
    const filePath = getSubmissionFilePath(submission.file);
    try { await fs.access(filePath); } catch { throw new AppError('Berkas jawaban tidak ditemukan', 404); }
    return { filePath, fileName: submission.file.original_name, mimeType: submission.file.mime_type };
  }

  static async gradeSubmission({ submissionId, payload, user, ipAddress, userAgent }) {
    const submission = await prisma.submission.findUnique({
      where: { id: submissionId },
      include: {
        assignment: {
          include: {
            meeting: {
              include: {
                class: {
                  include: {
                    lecturer: { select: { user_id: true } },
                  },
                },
              },
            },
          },
        },
      },
    });
    if (!submission) {
      throw new AppError('Submission tidak ditemukan', 404);
    }

    ensureCanManageClass(submission.assignment.meeting.class, user);

    const oldValues = {
      score: number(submission.score),
      feedback: submission.feedback,
    };

    const newFeedback = payload.feedback !== undefined ? payload.feedback : submission.feedback;
    const gradedAt = new Date();

    const updated = await prisma.$transaction(async (tx) => {
      const res = await tx.submission.update({
        where: { id: submissionId },
        data: {
          score: payload.score,
          feedback: newFeedback,
          graded_at: gradedAt,
        },
      });

      await AuditLogService.record({
        userId: user.id,
        action: 'GRADE_SUBMISSION',
        entity: AUDIT_ENTITIES.SUBMISSIONS,
        entityId: submissionId,
        oldValues,
        newValues: {
          score: number(payload.score),
          feedback: newFeedback,
        },
        ipAddress,
        userAgent,
        dbClient: tx,
      });

      return res;
    });

    return serializeSubmission(updated);
  }
}
