import prisma from '../../../config/prisma.js';
import { AppError } from '../../../utils/errors.js';
import { logAudit } from '../../../utils/audit.js';

export const semesterService = {
  async list(query = {}) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 20;
    const skip = (page - 1) * limit;

    const where = {};
    if (query.tahun_akademik_id) {
      where.tahun_akademik_id = query.tahun_akademik_id;
    }
    if (query.tipe) {
      where.tipe = query.tipe;
    }
    if (typeof query.is_active === 'boolean') {
      where.is_active = query.is_active;
    }

    const [total, items] = await Promise.all([
      prisma.semester.count({ where }),
      prisma.semester.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ tahun_akademik: { kode: 'desc' } }, { tipe: 'asc' }],
        include: {
          tahun_akademik: true,
          _count: {
            select: {
              kalender_akademik: true,
              kelas: true,
            },
          },
        },
      }),
    ]);

    return {
      items,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  },

  async detail(id) {
    const item = await prisma.semester.findUnique({
      where: { id },
      include: {
        tahun_akademik: true,
        kalender_akademik: {
          orderBy: { mulai: 'asc' },
        },
        _count: {
          select: { kelas: true },
        },
      },
    });
    if (!item) {
      throw new AppError('Semester tidak ditemukan', 404);
    }
    return item;
  },

  async create(data, meta = {}) {
    const ta = await prisma.tahunAkademik.findUnique({
      where: { id: data.tahun_akademik_id },
    });
    if (!ta) {
      throw new AppError('Tahun akademik tidak ditemukan', 404);
    }

    const existingTipe = await prisma.semester.findUnique({
      where: {
        tahun_akademik_id_tipe: {
          tahun_akademik_id: data.tahun_akademik_id,
          tipe: data.tipe,
        },
      },
    });
    if (existingTipe) {
      throw new AppError(
        `Semester tipe ${data.tipe} sudah terdaftar untuk tahun akademik ${ta.kode}`,
        409
      );
    }

    const result = await prisma.$transaction(async (tx) => {
      // Jika is_active diset true, pastikan semester lainnya dinonaktifkan
      if (data.is_active) {
        await tx.semester.updateMany({
          where: { is_active: true },
          data: { is_active: false },
        });
      }

      return tx.semester.create({
        data: {
          tahun_akademik_id: data.tahun_akademik_id,
          tipe: data.tipe,
          tanggal_mulai: new Date(data.tanggal_mulai),
          tanggal_selesai: new Date(data.tanggal_selesai),
          is_active: Boolean(data.is_active),
        },
        include: { tahun_akademik: true },
      });
    });

    await logAudit({
      userId: meta.userId,
      action: 'CREATE_SEMESTER',
      entity: 'semester',
      entityId: result.id,
      newValues: result,
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
    });

    return result;
  },

  async update(id, data, meta = {}) {
    const existing = await prisma.semester.findUnique({ where: { id } });
    if (!existing) {
      throw new AppError('Semester tidak ditemukan', 404);
    }

    const targetTaId = data.tahun_akademik_id || existing.tahun_akademik_id;
    const targetTipe = data.tipe || existing.tipe;

    if (
      (data.tahun_akademik_id && data.tahun_akademik_id !== existing.tahun_akademik_id) ||
      (data.tipe && data.tipe !== existing.tipe)
    ) {
      const conflict = await prisma.semester.findUnique({
        where: {
          tahun_akademik_id_tipe: {
            tahun_akademik_id: targetTaId,
            tipe: targetTipe,
          },
        },
      });
      if (conflict && conflict.id !== id) {
        throw new AppError(
          `Semester tipe ${targetTipe} sudah ada untuk tahun akademik terkait`,
          409
        );
      }
    }

    const payload = {};
    if (data.tahun_akademik_id) payload.tahun_akademik_id = data.tahun_akademik_id;
    if (data.tipe) payload.tipe = data.tipe;
    if (data.tanggal_mulai) payload.tanggal_mulai = new Date(data.tanggal_mulai);
    if (data.tanggal_selesai) payload.tanggal_selesai = new Date(data.tanggal_selesai);
    if (data.is_active !== undefined) payload.is_active = data.is_active;

    const result = await prisma.$transaction(async (tx) => {
      // Jika diaktifkan, nonaktifkan semester lain
      if (data.is_active) {
        await tx.semester.updateMany({
          where: { is_active: true, id: { not: id } },
          data: { is_active: false },
        });
      }

      return tx.semester.update({
        where: { id },
        data: payload,
        include: { tahun_akademik: true },
      });
    });

    await logAudit({
      userId: meta.userId,
      action: 'UPDATE_SEMESTER',
      entity: 'semester',
      entityId: id,
      oldValues: existing,
      newValues: payload,
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
    });

    return result;
  },

  async activate(id, meta = {}) {
    const existing = await prisma.semester.findUnique({
      where: { id },
      include: { tahun_akademik: true },
    });
    if (!existing) {
      throw new AppError('Semester tidak ditemukan', 404);
    }

    // Aturan bisnis: Hanya 1 semester aktif serentak di kampus
    const result = await prisma.$transaction(async (tx) => {
      await tx.semester.updateMany({
        where: { is_active: true, id: { not: id } },
        data: { is_active: false },
      });

      return tx.semester.update({
        where: { id },
        data: { is_active: true },
        include: { tahun_akademik: true },
      });
    });

    await logAudit({
      userId: meta.userId,
      action: 'ACTIVATE_SEMESTER',
      entity: 'semester',
      entityId: id,
      oldValues: { is_active: existing.is_active },
      newValues: { is_active: true },
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
    });

    return result;
  },

  async delete(id, meta = {}) {
    const existing = await prisma.semester.findUnique({
      where: { id },
      include: {
        _count: {
          select: { kalender_akademik: true, kelas: true },
        },
      },
    });
    if (!existing) {
      throw new AppError('Semester tidak ditemukan', 404);
    }

    if (existing.is_active) {
      throw new AppError('Semester aktif operasional tidak dapat dihapus', 400);
    }

    if (existing._count.kelas > 0) {
      throw new AppError('Semester tidak dapat dihapus karena masih memiliki kelas perkuliahan', 400);
    }

    await prisma.semester.delete({ where: { id } });

    await logAudit({
      userId: meta.userId,
      action: 'DELETE_SEMESTER',
      entity: 'semester',
      entityId: id,
      oldValues: existing,
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
    });

    return true;
  },
};
