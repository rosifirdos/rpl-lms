import prisma from '../../../config/prisma.js';
import { AppError } from '../../../utils/errors.js';
import { logAudit } from '../../../utils/audit.js';

export const kurikulumService = {
  async list(query = {}) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 20;
    const skip = (page - 1) * limit;

    const where = {};
    if (query.search) {
      where.nama = { contains: query.search, mode: 'insensitive' };
    }
    if (query.prodi_id) {
      where.prodi_id = query.prodi_id;
    }
    if (typeof query.is_active === 'boolean') {
      where.is_active = query.is_active;
    }

    const [total, items] = await Promise.all([
      prisma.kurikulum.count({ where }),
      prisma.kurikulum.findMany({
        where,
        skip,
        take: limit,
        orderBy: { tahun_mulai: 'desc' },
        include: {
          prodi: true,
          _count: {
            select: { mata_kuliah: true },
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
    const item = await prisma.kurikulum.findUnique({
      where: { id },
      include: {
        prodi: true,
        mata_kuliah: {
          orderBy: [{ semester_paket: 'asc' }, { kode: 'asc' }],
        },
      },
    });
    if (!item) {
      throw new AppError('Kurikulum tidak ditemukan', 404);
    }
    return item;
  },

  async create(data, meta = {}) {
    const prodi = await prisma.programStudi.findUnique({
      where: { id: data.prodi_id },
    });
    if (!prodi) {
      throw new AppError('Program studi tidak ditemukan', 404);
    }

    const created = await prisma.kurikulum.create({
      data: {
        id: data.id || undefined,
        prodi_id: data.prodi_id,
        nama: data.nama,
        tahun_mulai: data.tahun_mulai,
        is_active: data.is_active !== undefined ? data.is_active : true,
      },
      include: { prodi: true },
    });

    await logAudit({
      userId: meta.userId,
      action: 'CREATE_KURIKULUM',
      entity: 'kurikulum',
      entityId: created.id,
      newValues: created,
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
    });

    return created;
  },

  async update(id, data, meta = {}) {
    const existing = await prisma.kurikulum.findUnique({ where: { id } });
    if (!existing) {
      throw new AppError('Kurikulum tidak ditemukan', 404);
    }

    if (data.prodi_id && data.prodi_id !== existing.prodi_id) {
      const prodi = await prisma.programStudi.findUnique({ where: { id: data.prodi_id } });
      if (!prodi) {
        throw new AppError('Program studi tidak ditemukan', 404);
      }
    }

    const updated = await prisma.kurikulum.update({
      where: { id },
      data,
      include: { prodi: true },
    });

    await logAudit({
      userId: meta.userId,
      action: 'UPDATE_KURIKULUM',
      entity: 'kurikulum',
      entityId: id,
      oldValues: existing,
      newValues: data,
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
    });

    return updated;
  },

  async delete(id, meta = {}) {
    const existing = await prisma.kurikulum.findUnique({
      where: { id },
      include: {
        _count: { select: { mata_kuliah: true } },
      },
    });
    if (!existing) {
      throw new AppError('Kurikulum tidak ditemukan', 404);
    }

    if (existing._count.mata_kuliah > 0) {
      throw new AppError('Kurikulum tidak dapat dihapus karena masih memuat daftar mata kuliah', 400);
    }

    await prisma.kurikulum.delete({ where: { id } });

    await logAudit({
      userId: meta.userId,
      action: 'DELETE_KURIKULUM',
      entity: 'kurikulum',
      entityId: id,
      oldValues: existing,
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
    });

    return true;
  },
};
