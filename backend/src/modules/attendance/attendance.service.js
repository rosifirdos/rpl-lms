import prisma from '../../config/prisma.js';
import { AppError } from '../../utils/errors.js';
import { ROLES } from '../../constants/roles.js';
import { AUDIT_ENTITIES } from '../../constants/auditEntities.js';
import { AuditLogService } from '../audit-log/audit-log.service.js';
import {
  ensureCanManageClass,
  ensureCanReadClass,
  ensureEnrolledInClass,
  getStudentRecordOrThrow,
} from '../../utils/ownership.js';

/**
 * Pesan galat check-in saat sesi belum dibuka / sudah ditutup.
 * Dikunci oleh IMPLEMENTATION_PLAN_MVP2_BACKEND.md Fase 4 sehingga frontend
 * dapat menampilkannya apa adanya.
 */
export const ATTENDANCE_CLOSED_MESSAGE =
  'Sesi presensi belum dibuka atau telah ditutup oleh Dosen Pengampu.';

/**
 * Catatan keterangan yang disematkan pada ALPA otomatis saat dosen menutup sesi.
 *
 * Nilai ini **hanya** teks keterangan untuk dibaca manusia — bukan penanda baris.
 * Penanda strukturalnya adalah kolom `is_auto_generated` (lihat `openSession`
 * dan `updateRecord`), sebab `notes` juga diisi dosen saat mengoreksi sehingga
 * tidak dapat dipakai membedakan baris sistem dari keputusan dosen.
 */
export const AUTO_ABSENCE_NOTE = 'Tidak melakukan check-in sebelum sesi presensi ditutup';

const sessionMeetingInclude = {
  meeting: {
    select: {
      id: true,
      class_id: true,
      meeting_number: true,
      title: true,
      class: {
        select: {
          id: true,
          name: true,
          lecturer: { select: { id: true, user_id: true } },
        },
      },
    },
  },
};

const studentSummarySelect = {
  select: {
    id: true,
    nim: true,
    user: { select: { profile: { select: { full_name: true } } } },
  },
};

function serializeSession(session) {
  const payload = {
    id: session.id,
    meeting_id: session.meeting_id,
    status: session.status,
    opened_at: session.opened_at,
    closed_at: session.closed_at,
    tolerance_minutes: session.tolerance_minutes,
  };

  if (session.meeting) {
    payload.meeting = {
      id: session.meeting.id,
      meeting_number: session.meeting.meeting_number,
      title: session.meeting.title,
    };
  }

  return payload;
}

function serializeRecord(record, student) {
  return {
    id: record?.id ?? null,
    student_id: student.id,
    nim: student.nim,
    full_name: student.user?.profile?.full_name ?? null,
    status: record?.status ?? null,
    recorded_at: record?.recorded_at ?? null,
    notes: record?.notes ?? null,
  };
}

export class AttendanceService {

  static async #autoCloseExpiredSession(session) {
    if (session.status !== 'OPEN' || !session.opened_at) return session;

    const now = new Date();
    const expiryDate = new Date(session.opened_at.getTime() + session.tolerance_minutes * 60000);

    if (now > expiryDate) {
      return await prisma.$transaction(async (tx) => {
        const updated = await tx.attendanceSession.update({
          where: { id: session.id },
          data: { status: 'CLOSED', closed_at: now },
        });

        const enrollments = await tx.enrollment.findMany({
          where: { class_id: session.meeting.class_id },
          select: { student_id: true },
        });

        if (enrollments.length > 0) {
          await tx.attendanceRecord.createMany({
            data: enrollments.map((e) => ({
              session_id: session.id,
              student_id: e.student_id,
              status: 'ALPA',
              recorded_at: now,
              notes: AUTO_ABSENCE_NOTE,
              is_auto_generated: true,
            })),
            skipDuplicates: true,
          });
        }
        return updated;
      });
    }
    return session;
  }
  static async #findMeetingOrThrow(meetingId) {
    const meeting = await prisma.meeting.findUnique({
      where: { id: meetingId },
      include: {
        class: {
          select: {
            id: true,
            name: true,
            lecturer: { select: { id: true, user_id: true } },
          },
        },
        attendance_session: true,
      },
    });

    if (!meeting) {
      throw new AppError('Pertemuan tidak ditemukan', 404);
    }

    return meeting;
  }

  /**
   * Dosen membuka sesi presensi pertemuan (state machine CLOSED → OPEN).
   *
   * `payload.tolerance_minutes` (opsional) menyetel batas toleransi sesi. Sebelum
   * perbaikan ini field tersebut dibuang diam-diam sementara respons tetap
   * mengembalikannya, sehingga frontend mengira nilainya tersimpan.
   */
  static async openSession({ user, meetingId, payload = {}, ipAddress, userAgent }) {
    const meeting = await this.#findMeetingOrThrow(meetingId);
    ensureCanManageClass(meeting.class, user);

    const previous = meeting.attendance_session;
    if (previous?.status === 'OPEN') {
      throw new AppError('Sesi presensi pertemuan ini sudah dalam status dibuka', 409);
    }

    const toleranceMinutes = payload.tolerance_minutes ?? previous?.tolerance_minutes;
    const openedAt = new Date();
    const session = await prisma.$transaction(async (tx) => {
      if (previous?.status === 'CLOSED') {
        // Sesi dibuka ulang: hapus HANYA ALPA yang dibuat sistem agar mahasiswa
        // bisa check-in lagi. Penanda `is_auto_generated` — bukan teks catatan —
        // yang membedakannya, sebab `notes` juga diisi dosen saat mengoreksi.
        // Dengan begitu ALPA yang sengaja ditetapkan dosen tetap utuh.
        await tx.attendanceRecord.deleteMany({
          where: {
            session_id: previous.id,
            is_auto_generated: true,
          },
        });
      }

      return tx.attendanceSession.upsert({
        where: { meeting_id: meetingId },
        create: {
          meeting_id: meetingId,
          status: 'OPEN',
          opened_at: openedAt,
          ...(toleranceMinutes !== undefined && { tolerance_minutes: toleranceMinutes }),
        },
        update: {
          status: 'OPEN',
          opened_at: openedAt,
          closed_at: null,
          ...(toleranceMinutes !== undefined && { tolerance_minutes: toleranceMinutes }),
        },
      });
    });

    await AuditLogService.record({
      userId: user.id,
      action: 'OPEN_ATTENDANCE_SESSION',
      entity: AUDIT_ENTITIES.ATTENDANCE_SESSIONS,
      entityId: session.id,
      oldValues: previous ? { status: previous.status, closed_at: previous.closed_at } : null,
      newValues: { status: session.status, opened_at: session.opened_at },
      ipAddress,
      userAgent,
    });

    return serializeSession(session);
  }

  /**
   * Dosen menutup sesi presensi (OPEN → CLOSED). Mahasiswa terdaftar yang belum
   * check-in ditandai ALPA agar dapat dikoreksi lewat PUT /attendance/records/:id.
   */
  static async closeSession({ user, meetingId, ipAddress, userAgent }) {
    const meeting = await this.#findMeetingOrThrow(meetingId);
    ensureCanManageClass(meeting.class, user);

    const previous = meeting.attendance_session;
    if (!previous) {
      throw new AppError('Sesi presensi pertemuan ini belum pernah dibuka', 409);
    }
    if (previous.status === 'CLOSED') {
      throw new AppError('Sesi presensi pertemuan ini sudah ditutup', 409);
    }

    const closedAt = new Date();
    const session = await prisma.$transaction(async (tx) => {
      const updated = await tx.attendanceSession.update({
        where: { id: previous.id },
        data: { status: 'CLOSED', closed_at: closedAt },
      });

      const enrollments = await tx.enrollment.findMany({
        where: { class_id: meeting.class_id },
        select: { student_id: true },
      });

      if (enrollments.length > 0) {
        await tx.attendanceRecord.createMany({
          data: enrollments.map((enrollment) => ({
            session_id: updated.id,
            student_id: enrollment.student_id,
            status: 'ALPA',
            recorded_at: closedAt,
            notes: AUTO_ABSENCE_NOTE,
            // Penanda sistem: baris inilah yang boleh dibersihkan saat sesi
            // dibuka ulang. `updateRecord` menurunkannya menjadi false begitu
            // dosen mengoreksi, sehingga keputusan dosen tidak ikut terhapus.
            is_auto_generated: true,
          })),
          skipDuplicates: true,
        });
      }

      return updated;
    });

    await AuditLogService.record({
      userId: user.id,
      action: 'CLOSE_ATTENDANCE_SESSION',
      entity: AUDIT_ENTITIES.ATTENDANCE_SESSIONS,
      entityId: session.id,
      oldValues: { status: previous.status, opened_at: previous.opened_at },
      newValues: { status: session.status, closed_at: session.closed_at },
      ipAddress,
      userAgent,
    });

    return serializeSession(session);
  }

  /**
   * Mahasiswa terdaftar melakukan check-in mandiri (hanya saat sesi OPEN).
   */
  static async checkIn({ user, sessionId }) {
    let session = await prisma.attendanceSession.findUnique({
      where: { id: sessionId },
      include: { meeting: { select: { id: true, class_id: true } } },
    });

    if (!session) {
      throw new AppError('Sesi presensi tidak ditemukan', 404);
    session = await this.#autoCloseExpiredSession(session);
    }

    // Kepesertaan diperiksa lebih dulu agar mahasiswa luar kelas tidak bisa
    // memakai endpoint ini untuk menebak status sesi.
    const student = await getStudentRecordOrThrow(user.id);
    await ensureEnrolledInClass({ userId: user.id, classId: session.meeting.class_id });

    if (session.status !== 'OPEN') {
      throw new AppError(ATTENDANCE_CLOSED_MESSAGE, 400);
    }

    const existing = await prisma.attendanceRecord.findUnique({
      where: {
        session_id_student_id: { session_id: session.id, student_id: student.id },
      },
      select: { id: true },
    });

    if (existing) {
      throw new AppError('Anda sudah melakukan check-in pada sesi presensi ini', 409);
    }

    try {
      const record = await prisma.attendanceRecord.create({
        data: {
          session_id: session.id,
          student_id: student.id,
          status: 'HADIR',
        },
        include: { student: studentSummarySelect },
      });

      return serializeRecord(record, record.student);
    } catch (error) {
      if (error.code === 'P2002') {
        throw new AppError('Anda sudah melakukan check-in pada sesi presensi ini', 409);
      }
      throw error;
    }
  }

  /**
   * Daftar kehadiran satu sesi, lengkap dengan mahasiswa yang belum mencatat.
   */
  static async getSessionRecords({ user, sessionId }) {
    let session = await prisma.attendanceSession.findUnique({
      where: { id: sessionId },
      include: {
        ...sessionMeetingInclude,
        records: {
          include: { student: studentSummarySelect },
        },
      },
    });
    session = await this.#autoCloseExpiredSession(session);

    if (!session) {
      throw new AppError('Sesi presensi tidak ditemukan', 404);
    }

    ensureCanManageClass(session.meeting.class, user);

    const enrollments = await prisma.enrollment.findMany({
      where: { class_id: session.meeting.class_id },
      orderBy: { student: { nim: 'asc' } },
      include: { student: studentSummarySelect },
    });

    const recordByStudent = new Map(session.records.map((record) => [record.student_id, record]));

    const records = enrollments.map((enrollment) =>
      serializeRecord(recordByStudent.get(enrollment.student_id), enrollment.student)
    );

    const summary = {
      total_students: records.length,
      recorded_count: records.filter((record) => record.id).length,
      hadir: records.filter((record) => record.status === 'HADIR').length,
      sakit: records.filter((record) => record.status === 'SAKIT').length,
      izin: records.filter((record) => record.status === 'IZIN').length,
      alpa: records.filter((record) => record.status === 'ALPA').length,
      not_recorded: records.filter((record) => !record.status).length,
    };

    return {
      session: serializeSession(session),
      summary,
      records,
    };
  }

  /**
   * Dosen mengoreksi status kehadiran mahasiswa beserta catatan.
   */
  static async updateRecord({ user, recordId, payload, ipAddress, userAgent }) {
    const existing = await prisma.attendanceRecord.findUnique({
      where: { id: recordId },
      include: {
        session: { include: sessionMeetingInclude },
      },
    });

    if (!existing) {
      throw new AppError('Catatan kehadiran tidak ditemukan', 404);
    }

    ensureCanManageClass(existing.session.meeting.class, user);

    const data = {
      status: payload.status,
      // Begitu dosen menyentuh baris ini, ia bukan lagi catatan sistem —
      // sehingga pembukaan ulang sesi tidak akan menghapusnya.
      is_auto_generated: false,
    };

    if (payload.notes !== undefined) {
      data.notes = payload.notes ?? null;
    } else if (existing.is_auto_generated) {
      // Catatan penanda ALPA otomatis dibersihkan bila dosen tidak mengirim
      // catatan sendiri. Tanpa ini, baris berstatus IZIN/SAKIT/HADIR tetap
      // membawa teks "Tidak melakukan check-in ..." — keterangan yang salah.
      data.notes = null;
    }

    const record = await prisma.attendanceRecord.update({
      where: { id: recordId },
      data,
      include: {
        student: studentSummarySelect,
        session: { select: { id: true, meeting_id: true, status: true } },
      },
    });

    await AuditLogService.record({
      userId: user.id,
      action: 'UPDATE_ATTENDANCE_RECORD',
      entity: AUDIT_ENTITIES.ATTENDANCE_RECORDS,
      entityId: record.id,
      oldValues: { status: existing.status, notes: existing.notes },
      newValues: { status: record.status, notes: record.notes },
      ipAddress,
      userAgent,
    });

    return serializeRecord(record, record.student);
  }

  static async getAttendanceRecap({ user, classId }) {
    const classRecord = await prisma.class.findUnique({
      where: { id: classId },
      include: {
        lecturer: { select: { id: true, user_id: true } },
        enrollments: {
          orderBy: { student: { nim: 'asc' } },
          include: { student: studentSummarySelect },
        },
      },
    });

    if (!classRecord) throw new AppError('Kelas tidak ditemukan', 404);
    await ensureCanReadClass({ user, classRecord, classId });

    const sessions = await prisma.attendanceSession.findMany({
      where: { meeting: { class_id: classId } },
      orderBy: { meeting: { meeting_number: 'asc' } },
      include: {
        meeting: { select: { id: true, meeting_number: true } },
        records: { include: { student: { select: { id: true } } } },
      },
    });

    const totalSessions = sessions.length;

    // Mahasiswa hanya melihat data pribadinya (BR-003)
    if (user?.role === ROLES.MAHASISWA) {
      const student = await getStudentRecordOrThrow(user.id);
      const enrollment = classRecord.enrollments.find((e) => e.student_id === student.id);
      if (!enrollment) {
        throw new AppError('Akses ditolak: Anda tidak terdaftar pada kelas perkuliahan ini', 403);
      }

      const records = sessions.map((s) =>
        s.records.find((r) => r.student_id === student.id)
      );
      const hadirCount = records.filter((r) => r?.status === 'HADIR').length;
      const percentage = totalSessions > 0 ? (hadirCount / totalSessions) * 100 : 0;

      return {
        total_sessions: totalSessions,
        recap: [
          {
            student_id: student.id,
            nim: student.nim,
            full_name: student.user?.profile?.full_name ?? null,
            total_hadir: hadirCount,
            percentage: Number(percentage.toFixed(2)),
            matrix: sessions.map((s, index) => ({
              meeting_number: s.meeting.meeting_number,
              status: records[index]?.status ?? null,
            })),
          },
        ],
      };
    }

    // Dosen & Admin melihat seluruh kelas
    const recap = classRecord.enrollments.map((enrollment) => {
      const student = enrollment.student;
      const records = sessions.map((s) => s.records.find((r) => r.student_id === student.id));
      const hadirCount = records.filter((r) => r?.status === 'HADIR').length;
      const percentage = totalSessions > 0 ? (hadirCount / totalSessions) * 100 : 0;

      return {
        student_id: student.id,
        nim: student.nim,
        full_name: student.user?.profile?.full_name ?? null,
        total_hadir: hadirCount,
        percentage: Number(percentage.toFixed(2)),
        matrix: sessions.map((s, index) => ({
          meeting_number: s.meeting.meeting_number,
          status: records[index]?.status ?? null,
        })),
      };
    });

    return {
      total_sessions: totalSessions,
      recap,
    };
  }
}
