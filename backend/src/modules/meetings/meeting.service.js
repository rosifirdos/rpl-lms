import prisma from "../../config/prisma.js";
import { AppError } from "../../utils/errors.js";
import { AuditLogService } from "../audit-log/audit-log.service.js";
import { AUDIT_ENTITIES } from "../../constants/auditEntities.js";
import {
  canManageClass,
  ensureCanReadClass,
  ensureCanManageClass,
} from "../../utils/ownership.js";

/**
 * Relasi include standar untuk pertemuan.
 * Menyertakan class -> lecturer -> user (untuk ownership check)
 * serta jumlah materi dan info sesi presensi.
 */
const meetingInclude = {
  _count: { select: { materials: true } },
  attendance_session: {
    select: {
      id: true,
      status: true,
      opened_at: true,
      closed_at: true,
      tolerance_minutes: true,
    },
  },
};

const classIncludeForOwnership = {
  lecturer: {
    select: {
      id: true,
      user_id: true,
      user: {
        select: {
          id: true,
          username: true,
          email: true,
          profile: { select: { full_name: true } },
        },
      },
    },
  },
};

const meetingAuditValues = ({ id, title, description, is_published }) => ({
  id,
  title,
  description,
  is_published,
});

export class MeetingService {
  /**
   * Daftar 16 pertemuan terstruktur kelas (GET /api/classes/:classId/meetings).
   * Hak akses: Mahasiswa (enrolled), Dosen (pengampu), Admin.
   */
  static async getMeetingsByClassId({ classId, user }) {
    const classRecord = await prisma.class.findUnique({
      where: { id: classId },
      include: classIncludeForOwnership,
    });
    if (!classRecord) {
      throw new AppError("Kelas perkuliahan tidak ditemukan", 404);
    }

    // Otorisasi: hanya yang berhak membaca kelas
    await ensureCanReadClass({ user, classRecord, classId });

    const isManager = canManageClass(classRecord, user);

    const where = { class_id: classId };
    // Mahasiswa hanya melihat pertemuan yang sudah dipublikasikan
    if (!isManager) {
      where.is_published = true;
    }

    const meetings = await prisma.meeting.findMany({
      where,
      orderBy: { meeting_number: "asc" },
      include: meetingInclude,
    });

    return { meetings, classRecord };
  }

  /**
   * Detail pertemuan tertentu (GET /api/meetings/:id).
   * Hak akses: Mahasiswa (enrolled), Dosen (pengampu), Admin.
   */
  static async getMeetingById({ meetingId, user }) {
    const meeting = await prisma.meeting.findUnique({
      where: { id: meetingId },
      include: {
        ...meetingInclude,
        materials: {
          select: {
            id: true,
            title: true,
            description: true,
            created_at: true,
            file: {
              select: {
                id: true,
                original_name: true,
                mime_type: true,
                size_bytes: true,
              },
            },
          },
          orderBy: { created_at: "asc" },
        },
        class: {
          include: classIncludeForOwnership,
        },
      },
    });

    if (!meeting) {
      throw new AppError("Pertemuan tidak ditemukan", 404);
    }

    // Otorisasi
    await ensureCanReadClass({
      user,
      classRecord: meeting.class,
      classId: meeting.class_id,
    });

    const isManager = canManageClass(meeting.class, user);

    // Mahasiswa tidak boleh melihat pertemuan yang belum dipublikasikan
    if (!isManager && !meeting.is_published) {
      throw new AppError("Pertemuan tidak ditemukan", 404);
    }

    return meeting;
  }

  /**
   * Pembaruan topik/deskripsi/status publikasi (PUT /api/meetings/:id).
   * Hak akses: Dosen (pengampu), Admin.
   */
  static async updateMeeting({ meetingId, updateData, user, ipAddress, userAgent }) {
    const meeting = await prisma.meeting.findUnique({
      where: { id: meetingId },
      include: {
        class: {
          include: classIncludeForOwnership,
        },
      },
    });

    if (!meeting) {
      throw new AppError("Pertemuan tidak ditemukan", 404);
    }

    // Otorisasi: hanya dosen pengampu atau admin
    ensureCanManageClass(meeting.class, user);

    const updated = await prisma.meeting.update({
      where: { id: meetingId },
      data: updateData,
      include: meetingInclude,
    });

    // Audit trail
    await AuditLogService.record({
      userId: user.id,
      action: "UPDATE_MEETING",
      entity: AUDIT_ENTITIES.MEETINGS,
      entityId: meetingId,
      oldValues: meetingAuditValues(meeting),
      newValues: meetingAuditValues(updated),
      ipAddress,
      userAgent,
    });

    return updated;
  }
}

