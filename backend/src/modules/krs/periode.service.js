/**
 * Periode KRS Service (SRS FR-102, Bab 6.1)
 *
 * CRUD + activate/deactivate periode KRS per semester.
 * Pola atomic-single-active mengikuti semester.service.js MVP 1.
 */

import prisma from '../../config/prisma.js';
import { AppError } from '../../utils/errors.js';
import { logAudit } from '../../utils/audit.js';

export const periodeService = {
  /**
   * List semua periode KRS dengan pagination & filter.
   */
  async list(query = {}) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 20;
    const skip = (page - 1) * limit;

    const where = {};
    if (query.semester_id) where.semester_id = query.semester_id;
    if (query.is_aktif === 'true') where.is_aktif = true;
    if (query.is_aktif === 'false') where.is_aktif = false;

    const [total, items] = await Promise.all([
      prisma.periodeKRS.count({ where }),
      prisma.periodeKRS.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ tanggal_mulai: 'desc' }],
        include: {
          semester: { include: { tahun_akademik: true } },
          _count: { select: { krs: true } },
        },
      }),
    ]);

    return {
      items,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) || 1 },
    };
  },

  /**
   * Detail periode KRS by ID.
   */
  async detail(id) {
    const item = await prisma.periodeKRS.findUnique({
      where: { id },
      include: {
        semester: { include: { tahun_akademik: true } },
        _count: { select: { krs: true } },
      },
    });
    if (!item) throw new AppError('Periode KRS tidak ditemukan', 404);
    return item;
  },

  /**
   * Buat periode KRS baru.
   * Satu semester hanya boleh punya satu periode (unique constraint).
   */
  async create(data, meta = {}) {
    // Cek semester exists dan pastikan satu periode resmi per semester.
    const semester = await prisma.semester.findUnique({ where: { id: data.semester_id } });
    if (!semester) throw new AppError('Semester tidak ditemukan', 404);
    if (data.is_aktif && !semester.is_active) {
      throw new AppError('Periode KRS hanya dapat diaktifkan pada semester operasional yang sedang berjalan', 400);
    }

    const existing = await prisma.periodeKRS.findUnique({ where: { semester_id: data.semester_id } });
    if (existing) {
      throw new AppError('Periode KRS untuk semester ini sudah terdaftar', 409);
    }

    let result;
    try {
      result = await prisma.$transaction(async (tx) => {
        // Jika is_aktif = true, nonaktifkan periode lain terlebih dahulu.
        if (data.is_aktif) {
          await tx.periodeKRS.updateMany({
            where: { is_aktif: true },
            data: { is_aktif: false },
          });
        }

        return tx.periodeKRS.create({
          data: {
            semester_id: data.semester_id,
            nama: data.nama,
            tanggal_mulai: new Date(data.tanggal_mulai),
            tanggal_selesai: new Date(data.tanggal_selesai),
            sks_maks: data.sks_maks ?? 24,
            is_aktif: Boolean(data.is_aktif),
          },
          include: {
            semester: { include: { tahun_akademik: true } },
          },
        });
      });
    } catch (error) {
      if (error.code === 'P2002') {
        throw new AppError(
          'Periode KRS untuk semester ini sudah terdaftar atau periode aktif lain masih terbuka',
          409
        );
      }
      throw error;
    }

    await logAudit({
      userId: meta.userId,
      action: 'CREATE_PERIODE_KRS',
      entity: 'periode_krs',
      entityId: result.id,
      newValues: {
        nama: result.nama,
        semester_id: result.semester_id,
        tanggal_mulai: result.tanggal_mulai,
        tanggal_selesai: result.tanggal_selesai,
        sks_maks: result.sks_maks,
        is_aktif: result.is_aktif,
      },
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
    });

    return result;
  },

  /**
   * Update periode KRS (nama, rentang tanggal, batas SKS).
   */
  async update(id, data, meta = {}) {
    const existing = await prisma.periodeKRS.findUnique({ where: { id } });
    if (!existing) throw new AppError('Periode KRS tidak ditemukan', 404);

    // Bangun payload hanya dari field yang dikirim
    const payload = {};
    if (data.nama !== undefined) payload.nama = data.nama;
    if (data.tanggal_mulai !== undefined) payload.tanggal_mulai = new Date(data.tanggal_mulai);
    if (data.tanggal_selesai !== undefined) payload.tanggal_selesai = new Date(data.tanggal_selesai);
    if (data.sks_maks !== undefined) payload.sks_maks = data.sks_maks;

    // Validasi silang tanggal (jika salah satu diubah)
    const finalMulai = payload.tanggal_mulai || existing.tanggal_mulai;
    const finalSelesai = payload.tanggal_selesai || existing.tanggal_selesai;
    if (new Date(finalSelesai) <= new Date(finalMulai)) {
      throw new AppError('tanggal_selesai harus lebih besar dari tanggal_mulai', 400);
    }

    const result = await prisma.periodeKRS.update({
      where: { id },
      data: payload,
      include: {
        semester: { include: { tahun_akademik: true } },
      },
    });

    await logAudit({
      userId: meta.userId,
      action: 'UPDATE_PERIODE_KRS',
      entity: 'periode_krs',
      entityId: id,
      oldValues: {
        nama: existing.nama,
        tanggal_mulai: existing.tanggal_mulai,
        tanggal_selesai: existing.tanggal_selesai,
        sks_maks: existing.sks_maks,
      },
      newValues: payload,
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
    });

    return result;
  },

  /**
   * Buka/aktifkan periode KRS (auto-close periode aktif lainnya, atomik).
   */
  async activate(id, meta = {}) {
    const existing = await prisma.periodeKRS.findUnique({
      where: { id },
      include: { semester: true },
    });
    if (!existing) throw new AppError('Periode KRS tidak ditemukan', 404);
    if (existing.is_aktif) throw new AppError('Periode KRS ini sudah aktif', 400);
    if (!existing.semester?.is_active) {
      throw new AppError('Periode KRS hanya dapat diaktifkan pada semester operasional yang sedang berjalan', 400);
    }

    let result;
    try {
      result = await prisma.$transaction(async (tx) => {
        await tx.periodeKRS.updateMany({
          where: { is_aktif: true, id: { not: id } },
          data: { is_aktif: false },
        });

        return tx.periodeKRS.update({
          where: { id },
          data: { is_aktif: true },
          include: {
            semester: { include: { tahun_akademik: true } },
          },
        });
      });
    } catch (error) {
      if (error.code === 'P2002') {
        throw new AppError('Konflik aktivasi periode KRS, silakan coba kembali', 409);
      }
      throw error;
    }

    await logAudit({
      userId: meta.userId,
      action: 'ACTIVATE_PERIODE_KRS',
      entity: 'periode_krs',
      entityId: id,
      oldValues: { is_aktif: false },
      newValues: { is_aktif: true },
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
    });

    return result;
  },
};
