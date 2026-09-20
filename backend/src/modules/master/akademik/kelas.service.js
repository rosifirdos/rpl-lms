import prisma from '../../../config/prisma.js';
import { AppError } from '../../../utils/errors.js';
import { logAudit } from '../../../utils/audit.js';

export const kelasService = {
  async list(query = {}) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 20;
    const skip = (page - 1) * limit;

    const where = {};
    if (query.semester_id) {
      where.semester_id = query.semester_id;
    } else {
      // Default: ambil penawaran kelas semester aktif
      const activeSemester = await prisma.semester.findFirst({ where: { is_active: true } });
      if (activeSemester) {
        where.semester_id = activeSemester.id;
      }
    }

    if (query.mata_kuliah_id) {
      where.mata_kuliah_id = query.mata_kuliah_id;
    }
    if (query.dosen_id) {
      where.dosen_id = query.dosen_id;
    }
    if (query.search) {
      where.OR = [
        { kode_kelas: { contains: query.search, mode: 'insensitive' } },
        { mata_kuliah: { nama: { contains: query.search, mode: 'insensitive' } } },
        { mata_kuliah: { kode: { contains: query.search, mode: 'insensitive' } } },
        { dosen: { nama: { contains: query.search, mode: 'insensitive' } } },
      ];
    }

    const [total, items] = await Promise.all([
      prisma.kelas.count({ where }),
      prisma.kelas.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ mata_kuliah: { kode: 'asc' } }, { kode_kelas: 'asc' }],
        include: {
          mata_kuliah: {
            include: { kurikulum: true },
          },
          semester: {
            include: { tahun_akademik: true },
          },
          dosen: true,
          ruangan: {
            include: { gedung: true },
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
    const item = await prisma.kelas.findUnique({
      where: { id },
      include: {
        mata_kuliah: {
          include: { kurikulum: true },
        },
        semester: {
          include: { tahun_akademik: true },
        },
        dosen: true,
        ruangan: {
          include: { gedung: true },
        },
      },
    });
    if (!item) {
      throw new AppError('Kelas perkuliahan tidak ditemukan', 404);
    }
    return item;
  },

  async create(data, meta = {}) {
    // Validasi keberadaan entitas relasi
    const [mk, semester, dosen] = await Promise.all([
      prisma.mataKuliah.findUnique({ where: { id: data.mata_kuliah_id } }),
      prisma.semester.findUnique({ where: { id: data.semester_id } }),
      prisma.dosen.findUnique({ where: { id: data.dosen_id } }),
    ]);

    if (!mk) throw new AppError('Mata kuliah tidak ditemukan', 404);
    if (!semester) throw new AppError('Semester tidak ditemukan', 404);
    if (!dosen) throw new AppError('Dosen pengampu tidak ditemukan', 404);

    if (data.ruangan_id) {
      const ruangan = await prisma.ruangan.findUnique({ where: { id: data.ruangan_id } });
      if (!ruangan) throw new AppError('Ruangan tidak ditemukan', 404);
    }

    const existing = await prisma.kelas.findUnique({
      where: {
        mata_kuliah_id_semester_id_kode_kelas: {
          mata_kuliah_id: data.mata_kuliah_id,
          semester_id: data.semester_id,
          kode_kelas: data.kode_kelas,
        },
      },
    });
    if (existing) {
      throw new AppError(
        `Kelas '${data.kode_kelas}' untuk mata kuliah '${mk.nama}' pada semester ini sudah ada`,
        409
      );
    }

    const created = await prisma.kelas.create({
      data: {
        mata_kuliah_id: data.mata_kuliah_id,
        semester_id: data.semester_id,
        dosen_id: data.dosen_id,
        ruangan_id: data.ruangan_id || null,
        kode_kelas: data.kode_kelas,
        kapasitas: data.kapasitas || 40,
      },
      include: {
        mata_kuliah: true,
        semester: true,
        dosen: true,
        ruangan: true,
      },
    });

    await logAudit({
      userId: meta.userId,
      action: 'CREATE_KELAS',
      entity: 'kelas',
      entityId: created.id,
      newValues: created,
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
    });

    return created;
  },

  async update(id, data, meta = {}) {
    const existing = await prisma.kelas.findUnique({ where: { id } });
    if (!existing) {
      throw new AppError('Kelas tidak ditemukan', 404);
    }

    const targetMk = data.mata_kuliah_id || existing.mata_kuliah_id;
    const targetSem = data.semester_id || existing.semester_id;
    const targetKode = data.kode_kelas || existing.kode_kelas;

    if (
      (data.mata_kuliah_id && data.mata_kuliah_id !== existing.mata_kuliah_id) ||
      (data.semester_id && data.semester_id !== existing.semester_id) ||
      (data.kode_kelas && data.kode_kelas !== existing.kode_kelas)
    ) {
      const conflict = await prisma.kelas.findUnique({
        where: {
          mata_kuliah_id_semester_id_kode_kelas: {
            mata_kuliah_id: targetMk,
            semester_id: targetSem,
            kode_kelas: targetKode,
          },
        },
      });
      if (conflict && conflict.id !== id) {
        throw new AppError(`Kelas '${targetKode}' untuk mata kuliah dan semester ini sudah ada`, 409);
      }
    }

    if (data.ruangan_id) {
      const ruangan = await prisma.ruangan.findUnique({ where: { id: data.ruangan_id } });
      if (!ruangan) throw new AppError('Ruangan tidak ditemukan', 404);
    }

    if (data.dosen_id) {
      const dosen = await prisma.dosen.findUnique({ where: { id: data.dosen_id } });
      if (!dosen) throw new AppError('Dosen tidak ditemukan', 404);
    }

    const updated = await prisma.kelas.update({
      where: { id },
      data,
      include: {
        mata_kuliah: true,
        semester: true,
        dosen: true,
        ruangan: true,
      },
    });

    await logAudit({
      userId: meta.userId,
      action: 'UPDATE_KELAS',
      entity: 'kelas',
      entityId: id,
      oldValues: existing,
      newValues: data,
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
    });

    return updated;
  },

  async delete(id, meta = {}) {
    const existing = await prisma.kelas.findUnique({ where: { id } });
    if (!existing) {
      throw new AppError('Kelas tidak ditemukan', 404);
    }

    await prisma.kelas.delete({ where: { id } });

    await logAudit({
      userId: meta.userId,
      action: 'DELETE_KELAS',
      entity: 'kelas',
      entityId: id,
      oldValues: existing,
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
    });

    return true;
  },
};
