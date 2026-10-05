import prisma from '../../config/prisma.js';
import { AppError } from '../../utils/errors.js';
import { logAudit } from '../../utils/audit.js';

export const calendarService = {
  async getCalendar(query = {}) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 50;
    const skip = (page - 1) * limit;

    const where = {};

    if (query.semester_id) {
      where.semester_id = query.semester_id;
    } else {
      // Default: ambil kalender semester aktif
      const activeSemester = await prisma.semester.findFirst({
        where: { is_active: true },
      });
      if (activeSemester) {
        where.semester_id = activeSemester.id;
      }
    }

    if (query.status) {
      where.status = query.status;
    }

    // Filter kategori agenda (SRS Bab 22 — kategori kalender operasional)
    if (query.kategori) {
      where.kategori = query.kategori;
    }

    if (query.search) {
      where.agenda = {
        contains: query.search,
        mode: 'insensitive',
      };
    }

    const [total, events] = await Promise.all([
      prisma.kalenderAkademik.count({ where }),
      prisma.kalenderAkademik.findMany({
        where,
        skip,
        take: limit,
        orderBy: { mulai: 'asc' },
        include: {
          semester: {
            include: {
              tahun_akademik: true,
            },
          },
        },
      }),
    ]);

    return {
      events,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  },

  async getCalendarById(id) {
    const event = await prisma.kalenderAkademik.findUnique({
      where: { id },
      include: {
        semester: {
          include: {
            tahun_akademik: true,
          },
        },
      },
    });

    if (!event) {
      throw new AppError('Agenda kalender akademik tidak ditemukan', 404);
    }

    return event;
  },

  async createCalendar(data, meta = {}) {
    const semester = await prisma.semester.findUnique({
      where: { id: data.semester_id },
    });

    if (!semester) {
      throw new AppError('Semester tidak ditemukan', 404);
    }

    const created = await prisma.kalenderAkademik.create({
      data: {
        semester_id: data.semester_id,
        agenda: data.agenda,
        mulai: new Date(data.mulai),
        selesai: new Date(data.selesai),
        status: data.status || 'DIJADWALKAN',
        kategori: data.kategori || 'LAINNYA',
      },
      include: {
        semester: {
          include: {
            tahun_akademik: true,
          },
        },
      },
    });

    await logAudit({
      userId: meta.userId,
      action: 'CREATE_CALENDAR',
      entity: 'kalender_akademik',
      entityId: created.id,
      newValues: {
        agenda: created.agenda,
        mulai: created.mulai,
        selesai: created.selesai,
        status: created.status,
        kategori: created.kategori,
        semester_id: created.semester_id,
      },
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
    });

    return created;
  },

  async updateCalendar(id, data, meta = {}) {
    const existing = await prisma.kalenderAkademik.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new AppError('Agenda kalender akademik tidak ditemukan', 404);
    }

    if (data.semester_id && data.semester_id !== existing.semester_id) {
      const semester = await prisma.semester.findUnique({
        where: { id: data.semester_id },
      });
      if (!semester) {
        throw new AppError('Semester tidak ditemukan', 404);
      }
    }

    const updatePayload = {};
    if (data.semester_id !== undefined) updatePayload.semester_id = data.semester_id;
    if (data.agenda !== undefined) updatePayload.agenda = data.agenda;
    if (data.mulai !== undefined) updatePayload.mulai = new Date(data.mulai);
    if (data.selesai !== undefined) updatePayload.selesai = new Date(data.selesai);
    if (data.status !== undefined) updatePayload.status = data.status;
    if (data.kategori !== undefined) updatePayload.kategori = data.kategori;

    const updated = await prisma.kalenderAkademik.update({
      where: { id },
      data: updatePayload,
      include: {
        semester: {
          include: {
            tahun_akademik: true,
          },
        },
      },
    });

    await logAudit({
      userId: meta.userId,
      action: 'UPDATE_CALENDAR',
      entity: 'kalender_akademik',
      entityId: updated.id,
      oldValues: {
        agenda: existing.agenda,
        mulai: existing.mulai,
        selesai: existing.selesai,
        status: existing.status,
        kategori: existing.kategori,
        semester_id: existing.semester_id,
      },
      newValues: updatePayload,
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
    });

    return updated;
  },

  async deleteCalendar(id, meta = {}) {
    const existing = await prisma.kalenderAkademik.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new AppError('Agenda kalender akademik tidak ditemukan', 404);
    }

    await prisma.kalenderAkademik.delete({
      where: { id },
    });

    await logAudit({
      userId: meta.userId,
      action: 'DELETE_CALENDAR',
      entity: 'kalender_akademik',
      entityId: id,
      oldValues: {
        agenda: existing.agenda,
        status: existing.status,
        kategori: existing.kategori,
        semester_id: existing.semester_id,
      },
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
    });

    return true;
  },

  /**
   * Agenda berjalan untuk semester aktif (atau semester_id dari query).
   * Endpoint /api/v1/calendar/aktif (SRS Bab 22) — dipakai portal & frontend.
   *
   * Mencakup: agenda dengan status BERJALAN, atau agenda yang rentang waktu
   * mencakup saat ini, untuk semester operasional aktif.
   */
  async getActiveAgenda(query = {}) {
    let semesterId = query.semester_id;
    let semester = null;

    if (!semesterId) {
      semester = await prisma.semester.findFirst({
        where: { is_active: true },
        include: { tahun_akademik: true },
      });
      if (!semester) {
        return {
          semester: null,
          agenda_berjalan: null,
          agenda_mendatang: [],
          pesan: 'Tidak ada semester aktif saat ini',
        };
      }
      semesterId = semester.id;
    } else {
      semester = await prisma.semester.findUnique({
        where: { id: semesterId },
        include: { tahun_akademik: true },
      });
      if (!semester) throw new AppError('Semester tidak ditemukan', 404);
    }

    const now = new Date();
    const allAgendas = await prisma.kalenderAkademik.findMany({
      where: { semester_id: semesterId },
      orderBy: { mulai: 'asc' },
      include: {
        semester: {
          include: {
            tahun_akademik: true,
          },
        },
      },
    });

    const isOngoing = (item) => {
      if (item.status === 'BERJALAN') return true;
      const mulai = new Date(item.mulai);
      const selesai = new Date(item.selesai);
      return now >= mulai && now <= selesai;
    };

    const berjalan = allAgendas.find(isOngoing) || null;
    const mendatang = allAgendas
      .filter((item) => new Date(item.mulai) > now && !isOngoing(item))
      .slice(0, 5);

    return {
      semester: {
        id: semester.id,
        tipe: semester.tipe,
        tahun_akademik: semester.tahun_akademik
          ? {
              id: semester.tahun_akademik.id,
              kode: semester.tahun_akademik.kode,
              nama: semester.tahun_akademik.nama,
            }
          : null,
        tanggal_mulai: semester.tanggal_mulai,
        tanggal_selesai: semester.tanggal_selesai,
      },
      agenda_berjalan: berjalan,
      agenda_mendatang: mendatang,
    };
  },
};
