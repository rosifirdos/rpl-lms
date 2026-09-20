import prisma from '../../../config/prisma.js';
import { AppError } from '../../../utils/errors.js';
import { logAudit } from '../../../utils/audit.js';

export const tahunAkademikService = {
  async list(query = {}) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 20;
    const skip = (page - 1) * limit;

    const where = {};
    if (query.search) {
      where.OR = [
        { kode: { contains: query.search, mode: 'insensitive' } },
        { nama: { contains: query.search, mode: 'insensitive' } },
      ];
    }
    if (typeof query.is_active === 'boolean') {
      where.is_active = query.is_active;
    }

    const [total, items] = await Promise.all([
      prisma.tahunAkademik.count({ where }),
      prisma.tahunAkademik.findMany({
        where,
        skip,
        take: limit,
        orderBy: { kode: 'desc' },
        include: {
          semester: {
            orderBy: { tipe: 'asc' },
          },
          _count: {
            select: { semester: true },
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
    const item = await prisma.tahunAkademik.findUnique({
      where: { id },
      include: {
        semester: {
          include: {
            _count: {
              select: { kalender_akademik: true, kelas: true },
            },
          },
        },
      },
    });
    if (!item) {
      throw new AppError('Tahun akademik tidak ditemukan', 404);
    }
    return item;
  },

  async create(data, meta = {}) {
    const existing = await prisma.tahunAkademik.findUnique({
      where: { kode: data.kode },
    });
    if (existing) {
      throw new AppError(`Tahun akademik dengan kode ${data.kode} sudah terdaftar`, 409);
    }

    const created = await prisma.tahunAkademik.create({
      data: {
        kode: data.kode,
        nama: data.nama,
        is_active: data.is_active !== undefined ? data.is_active : true,
      },
    });

    await logAudit({
      userId: meta.userId,
      action: 'CREATE_TAHUN_AKADEMIK',
      entity: 'tahun_akademik',
      entityId: created.id,
      newValues: created,
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
    });

    return created;
  },

  async update(id, data, meta = {}) {
    const existing = await prisma.tahunAkademik.findUnique({ where: { id } });
    if (!existing) {
      throw new AppError('Tahun akademik tidak ditemukan', 404);
    }

    if (data.kode && data.kode !== existing.kode) {
      const conflict = await prisma.tahunAkademik.findUnique({ where: { kode: data.kode } });
      if (conflict) {
        throw new AppError(`Tahun akademik dengan kode ${data.kode} sudah terdaftar`, 409);
      }
    }

    const updated = await prisma.tahunAkademik.update({
      where: { id },
      data,
    });

    await logAudit({
      userId: meta.userId,
      action: 'UPDATE_TAHUN_AKADEMIK',
      entity: 'tahun_akademik',
      entityId: id,
      oldValues: existing,
      newValues: data,
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
    });

    return updated;
  },

  async delete(id, meta = {}) {
    const existing = await prisma.tahunAkademik.findUnique({
      where: { id },
      include: {
        _count: { select: { semester: true } },
      },
    });
    if (!existing) {
      throw new AppError('Tahun akademik tidak ditemukan', 404);
    }

    if (existing._count.semester > 0) {
      throw new AppError('Tahun akademik tidak dapat dihapus karena masih memiliki relasi semester', 400);
    }

    await prisma.tahunAkademik.delete({ where: { id } });

    await logAudit({
      userId: meta.userId,
      action: 'DELETE_TAHUN_AKADEMIK',
      entity: 'tahun_akademik',
      entityId: id,
      oldValues: existing,
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
    });

    return true;
  },
};
