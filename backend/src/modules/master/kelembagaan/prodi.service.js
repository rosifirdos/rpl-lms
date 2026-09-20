import prisma from '../../../config/prisma.js';
import { AppError } from '../../../utils/errors.js';
import { logAudit } from '../../../utils/audit.js';

export const prodiService = {
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
    if (query.fakultas_id) {
      where.fakultas_id = query.fakultas_id;
    }
    if (query.jenjang) {
      where.jenjang = query.jenjang;
    }
    if (typeof query.is_active === 'boolean') {
      where.is_active = query.is_active;
    }

    const [total, items] = await Promise.all([
      prisma.programStudi.count({ where }),
      prisma.programStudi.findMany({
        where,
        skip,
        take: limit,
        orderBy: { kode: 'asc' },
        include: {
          fakultas: true,
          _count: {
            select: {
              mahasiswa: true,
              dosen: true,
              kurikulum: true,
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
    const item = await prisma.programStudi.findUnique({
      where: { id },
      include: {
        fakultas: true,
        kurikulum: true,
      },
    });
    if (!item) {
      throw new AppError('Program studi tidak ditemukan', 404);
    }
    return item;
  },

  async create(data, meta = {}) {
    const fakultas = await prisma.fakultas.findUnique({
      where: { id: data.fakultas_id },
    });
    if (!fakultas) {
      throw new AppError('Fakultas tidak ditemukan', 404);
    }

    const existing = await prisma.programStudi.findUnique({
      where: { kode: data.kode },
    });
    if (existing) {
      throw new AppError(`Program studi dengan kode ${data.kode} sudah terdaftar`, 409);
    }

    const created = await prisma.programStudi.create({
      data: {
        fakultas_id: data.fakultas_id,
        kode: data.kode,
        nama: data.nama,
        jenjang: data.jenjang || 'S1',
        is_active: data.is_active !== undefined ? data.is_active : true,
      },
      include: { fakultas: true },
    });

    await logAudit({
      userId: meta.userId,
      action: 'CREATE_PRODI',
      entity: 'program_studi',
      entityId: created.id,
      newValues: created,
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
    });

    return created;
  },

  async update(id, data, meta = {}) {
    const existing = await prisma.programStudi.findUnique({ where: { id } });
    if (!existing) {
      throw new AppError('Program studi tidak ditemukan', 404);
    }

    if (data.fakultas_id && data.fakultas_id !== existing.fakultas_id) {
      const fakultas = await prisma.fakultas.findUnique({ where: { id: data.fakultas_id } });
      if (!fakultas) {
        throw new AppError('Fakultas tidak ditemukan', 404);
      }
    }

    if (data.kode && data.kode !== existing.kode) {
      const conflict = await prisma.programStudi.findUnique({ where: { kode: data.kode } });
      if (conflict) {
        throw new AppError(`Program studi dengan kode ${data.kode} sudah terdaftar`, 409);
      }
    }

    const updated = await prisma.programStudi.update({
      where: { id },
      data,
      include: { fakultas: true },
    });

    await logAudit({
      userId: meta.userId,
      action: 'UPDATE_PRODI',
      entity: 'program_studi',
      entityId: id,
      oldValues: existing,
      newValues: data,
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
    });

    return updated;
  },

  async delete(id, meta = {}) {
    const existing = await prisma.programStudi.findUnique({
      where: { id },
      include: {
        _count: {
          select: { mahasiswa: true, dosen: true, kurikulum: true },
        },
      },
    });
    if (!existing) {
      throw new AppError('Program studi tidak ditemukan', 404);
    }

    if (existing._count.mahasiswa > 0 || existing._count.kurikulum > 0) {
      throw new AppError('Program studi tidak dapat dihapus karena masih memiliki data mahasiswa atau kurikulum aktif', 400);
    }

    await prisma.programStudi.delete({ where: { id } });

    await logAudit({
      userId: meta.userId,
      action: 'DELETE_PRODI',
      entity: 'program_studi',
      entityId: id,
      oldValues: existing,
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
    });

    return true;
  },
};
