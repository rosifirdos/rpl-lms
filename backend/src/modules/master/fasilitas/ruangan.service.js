import prisma from '../../../config/prisma.js';
import { AppError } from '../../../utils/errors.js';
import { logAudit } from '../../../utils/audit.js';

export const ruanganService = {
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
    if (query.gedung_id) {
      where.gedung_id = query.gedung_id;
    }
    if (typeof query.is_active === 'boolean') {
      where.is_active = query.is_active;
    }

    const [total, items] = await Promise.all([
      prisma.ruangan.count({ where }),
      prisma.ruangan.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ gedung: { kode: 'asc' } }, { kode: 'asc' }],
        include: {
          gedung: true,
          _count: {
            select: { kelas: true },
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
    const item = await prisma.ruangan.findUnique({
      where: { id },
      include: {
        gedung: true,
        kelas: {
          include: {
            mata_kuliah: true,
            semester: true,
            dosen: true,
          },
        },
      },
    });
    if (!item) {
      throw new AppError('Ruangan tidak ditemukan', 404);
    }
    return item;
  },

  async create(data, meta = {}) {
    const gedung = await prisma.gedung.findUnique({
      where: { id: data.gedung_id },
    });
    if (!gedung) {
      throw new AppError('Gedung tidak ditemukan', 404);
    }

    const existing = await prisma.ruangan.findUnique({
      where: { kode: data.kode },
    });
    if (existing) {
      throw new AppError(`Ruangan dengan kode ${data.kode} sudah terdaftar`, 409);
    }

    const created = await prisma.ruangan.create({
      data: {
        gedung_id: data.gedung_id,
        kode: data.kode,
        nama: data.nama,
        kapasitas: data.kapasitas,
        is_active: data.is_active !== undefined ? data.is_active : true,
      },
      include: { gedung: true },
    });

    await logAudit({
      userId: meta.userId,
      action: 'CREATE_RUANGAN',
      entity: 'ruangan',
      entityId: created.id,
      newValues: created,
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
    });

    return created;
  },

  async update(id, data, meta = {}) {
    const existing = await prisma.ruangan.findUnique({ where: { id } });
    if (!existing) {
      throw new AppError('Ruangan tidak ditemukan', 404);
    }

    if (data.gedung_id && data.gedung_id !== existing.gedung_id) {
      const gedung = await prisma.gedung.findUnique({ where: { id: data.gedung_id } });
      if (!gedung) {
        throw new AppError('Gedung tidak ditemukan', 404);
      }
    }

    if (data.kode && data.kode !== existing.kode) {
      const conflict = await prisma.ruangan.findUnique({ where: { kode: data.kode } });
      if (conflict) {
        throw new AppError(`Ruangan dengan kode ${data.kode} sudah terdaftar`, 409);
      }
    }

    const updated = await prisma.ruangan.update({
      where: { id },
      data,
      include: { gedung: true },
    });

    await logAudit({
      userId: meta.userId,
      action: 'UPDATE_RUANGAN',
      entity: 'ruangan',
      entityId: id,
      oldValues: existing,
      newValues: data,
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
    });

    return updated;
  },

  async delete(id, meta = {}) {
    const existing = await prisma.ruangan.findUnique({
      where: { id },
      include: {
        _count: { select: { kelas: true } },
      },
    });
    if (!existing) {
      throw new AppError('Ruangan tidak ditemukan', 404);
    }

    if (existing._count.kelas > 0) {
      throw new AppError('Ruangan tidak dapat dihapus karena masih digunakan dalam jadwal perkuliahan', 400);
    }

    await prisma.ruangan.delete({ where: { id } });

    await logAudit({
      userId: meta.userId,
      action: 'DELETE_RUANGAN',
      entity: 'ruangan',
      entityId: id,
      oldValues: existing,
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
    });

    return true;
  },
};
