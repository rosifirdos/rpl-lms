import prisma from '../../../config/prisma.js';
import { AppError } from '../../../utils/errors.js';
import { logAudit } from '../../../utils/audit.js';

export const mataKuliahService = {
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
    if (query.kurikulum_id) {
      where.kurikulum_id = query.kurikulum_id;
    }
    if (query.semester_paket) {
      where.semester_paket = Number(query.semester_paket);
    }
    if (typeof query.is_wajib === 'boolean') {
      where.is_wajib = query.is_wajib;
    }
    if (typeof query.is_active === 'boolean') {
      where.is_active = query.is_active;
    }

    const [total, items] = await Promise.all([
      prisma.mataKuliah.count({ where }),
      prisma.mataKuliah.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ semester_paket: 'asc' }, { kode: 'asc' }],
        include: {
          kurikulum: {
            include: { prodi: true },
          },
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
    const item = await prisma.mataKuliah.findUnique({
      where: { id },
      include: {
        kurikulum: {
          include: { prodi: true },
        },
        kelas: {
          include: {
            dosen: true,
            ruangan: true,
            semester: true,
          },
        },
      },
    });
    if (!item) {
      throw new AppError('Mata kuliah tidak ditemukan', 404);
    }
    return item;
  },

  async create(data, meta = {}) {
    const kurikulum = await prisma.kurikulum.findUnique({
      where: { id: data.kurikulum_id },
    });
    if (!kurikulum) {
      throw new AppError('Kurikulum tidak ditemukan', 404);
    }

    const existing = await prisma.mataKuliah.findUnique({
      where: { kode: data.kode },
    });
    if (existing) {
      throw new AppError(`Mata kuliah dengan kode ${data.kode} sudah terdaftar`, 409);
    }

    const created = await prisma.mataKuliah.create({
      data: {
        kurikulum_id: data.kurikulum_id,
        kode: data.kode,
        nama: data.nama,
        sks: data.sks,
        sks_teori: data.sks_teori !== undefined ? data.sks_teori : data.sks,
        sks_praktik: data.sks_praktik !== undefined ? data.sks_praktik : 0,
        semester_paket: data.semester_paket || 1,
        is_wajib: data.is_wajib !== undefined ? data.is_wajib : true,
        is_active: data.is_active !== undefined ? data.is_active : true,
      },
      include: {
        kurikulum: {
          include: { prodi: true },
        },
      },
    });

    await logAudit({
      userId: meta.userId,
      action: 'CREATE_MATA_KULIAH',
      entity: 'mata_kuliah',
      entityId: created.id,
      newValues: created,
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
    });

    return created;
  },

  async update(id, data, meta = {}) {
    const existing = await prisma.mataKuliah.findUnique({ where: { id } });
    if (!existing) {
      throw new AppError('Mata kuliah tidak ditemukan', 404);
    }

    if (data.kurikulum_id && data.kurikulum_id !== existing.kurikulum_id) {
      const kurikulum = await prisma.kurikulum.findUnique({ where: { id: data.kurikulum_id } });
      if (!kurikulum) {
        throw new AppError('Kurikulum tidak ditemukan', 404);
      }
    }

    if (data.kode && data.kode !== existing.kode) {
      const conflict = await prisma.mataKuliah.findUnique({ where: { kode: data.kode } });
      if (conflict) {
        throw new AppError(`Mata kuliah dengan kode ${data.kode} sudah terdaftar`, 409);
      }
    }

    const updated = await prisma.mataKuliah.update({
      where: { id },
      data,
      include: {
        kurikulum: {
          include: { prodi: true },
        },
      },
    });

    await logAudit({
      userId: meta.userId,
      action: 'UPDATE_MATA_KULIAH',
      entity: 'mata_kuliah',
      entityId: id,
      oldValues: existing,
      newValues: data,
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
    });

    return updated;
  },

  async delete(id, meta = {}) {
    const existing = await prisma.mataKuliah.findUnique({
      where: { id },
      include: {
        _count: { select: { kelas: true } },
      },
    });
    if (!existing) {
      throw new AppError('Mata kuliah tidak ditemukan', 404);
    }

    if (existing._count.kelas > 0) {
      throw new AppError('Mata kuliah tidak dapat dihapus karena masih memiliki penawaran kelas', 400);
    }

    await prisma.mataKuliah.delete({ where: { id } });

    await logAudit({
      userId: meta.userId,
      action: 'DELETE_MATA_KULIAH',
      entity: 'mata_kuliah',
      entityId: id,
      oldValues: existing,
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
    });

    return true;
  },
};
