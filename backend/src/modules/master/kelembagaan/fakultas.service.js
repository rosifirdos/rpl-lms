import prisma from '../../../config/prisma.js';
import { AppError } from '../../../utils/errors.js';
import { logAudit } from '../../../utils/audit.js';

export const fakultasService = {
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
      prisma.fakultas.count({ where }),
      prisma.fakultas.findMany({
        where,
        skip,
        take: limit,
        orderBy: { kode: 'asc' },
        include: {
          _count: {
            select: { program_studi: true },
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
    const item = await prisma.fakultas.findUnique({
      where: { id },
      include: {
        program_studi: true,
      },
    });
    if (!item) {
      throw new AppError('Fakultas tidak ditemukan', 404);
    }
    return item;
  },

  async create(data, meta = {}) {
    const existing = await prisma.fakultas.findUnique({
      where: { kode: data.kode },
    });
    if (existing) {
      throw new AppError(`Fakultas dengan kode ${data.kode} sudah terdaftar`, 409);
    }

    const created = await prisma.fakultas.create({
      data: {
        kode: data.kode,
        nama: data.nama,
        is_active: data.is_active !== undefined ? data.is_active : true,
      },
    });

    await logAudit({
      userId: meta.userId,
      action: 'CREATE_FAKULTAS',
      entity: 'fakultas',
      entityId: created.id,
      newValues: created,
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
    });

    return created;
  },

  async update(id, data, meta = {}) {
    const existing = await prisma.fakultas.findUnique({ where: { id } });
    if (!existing) {
      throw new AppError('Fakultas tidak ditemukan', 404);
    }

    if (data.kode && data.kode !== existing.kode) {
      const conflict = await prisma.fakultas.findUnique({ where: { kode: data.kode } });
      if (conflict) {
        throw new AppError(`Fakultas dengan kode ${data.kode} sudah terdaftar`, 409);
      }
    }

    const updated = await prisma.fakultas.update({
      where: { id },
      data,
    });

    await logAudit({
      userId: meta.userId,
      action: 'UPDATE_FAKULTAS',
      entity: 'fakultas',
      entityId: id,
      oldValues: existing,
      newValues: data,
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
    });

    return updated;
  },

  async delete(id, meta = {}) {
    const existing = await prisma.fakultas.findUnique({
      where: { id },
      include: {
        _count: { select: { program_studi: true } },
      },
    });
    if (!existing) {
      throw new AppError('Fakultas tidak ditemukan', 404);
    }

    if (existing._count.program_studi > 0) {
      throw new AppError('Fakultas tidak dapat dihapus karena masih memiliki program studi terdaftar', 400);
    }

    await prisma.fakultas.delete({ where: { id } });

    await logAudit({
      userId: meta.userId,
      action: 'DELETE_FAKULTAS',
      entity: 'fakultas',
      entityId: id,
      oldValues: existing,
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
    });

    return true;
  },
};
