/**
 * KRS Service (SRS FR-022 s/d FR-035, UC-03, UC-04)
 *
 * State machine KRS + ownership check + atomic transaction.
 * Transisi legal: DRAFT → DIAJUKAN → {DISETUJUI | DIKEMBALIKAN}, DIKEMBALIKAN → DIAJUKAN
 */

import prisma from '../../config/prisma.js';
import { AppError } from '../../utils/errors.js';
import { logAudit } from '../../utils/audit.js';
import {
  KRS_EDITABLE_STATES,
  isLegalTransition,
  illegalTransitionMessage,
} from '../../constants/krs.js';
import {
  getActivePeriode,
  checkEligibility,
  checkCapacity,
  recomputeTotalSKS,
  validateSubmission,
  getAvailableClasses,
} from './krs-rules.service.js';

// Include standar untuk mengembalikan KRS lengkap
const KRS_FULL_INCLUDE = {
  detail: {
    include: {
      kelas: {
        include: {
          mata_kuliah: true,
          dosen: true,
          ruangan: true,
          jadwal: true,
        },
      },
    },
  },
  semester: { include: { tahun_akademik: true } },
  periode_krs: true,
  mahasiswa: {
    include: {
      prodi: true,
      dosen_wali: true,
    },
  },
  disetujui_oleh: true,
};

async function lockTransaction(tx, key) {
  // Advisory locks make KRS/detail mutations and enrollment checks deterministic
  // without relying on stale read-modify-write values.
  await tx.$queryRaw`SELECT pg_advisory_xact_lock(hashtext(${key}))::text AS lock_acquired`;
}

function assertMahasiswaAktif(mahasiswa) {
  if (mahasiswa.status_akademik !== 'AKTIF') {
    throw new AppError(
      `Mahasiswa berstatus ${mahasiswa.status_akademik} tidak dapat mengisi KRS`,
      403
    );
  }
}

function assertPeriodeAktif(periodeResult) {
  if (!periodeResult.ok) {
    throw new AppError(periodeResult.error.pesan, 403);
  }
}

function isKrsIdentityConflict(error) {
  if (error?.code !== 'P2002') return false;
  const target = Array.isArray(error.meta?.target) ? error.meta.target.join(',') : String(error.meta?.target || '');
  return target.includes('mahasiswa_id') && target.includes('semester_id');
}

export const krsService = {
  // ================================================================
  // Helpers
  // ================================================================

  /**
   * Cari mahasiswa dari user_id (dari JWT req.user.id).
   * Throw 403 jika user bukan mahasiswa.
   */
  async _getMahasiswa(userId) {
    const mhs = await prisma.mahasiswa.findUnique({
      where: { user_id: userId },
      include: { prodi: true, dosen_wali: true },
    });
    if (!mhs) throw new AppError('Akun Anda tidak terdaftar sebagai mahasiswa', 403);
    return mhs;
  },

  /**
   * Cari dosen dari user_id (dari JWT req.user.id).
   * Throw 403 jika user bukan dosen.
   */
  async _getDosen(userId) {
    const dosen = await prisma.dosen.findUnique({
      where: { user_id: userId },
    });
    if (!dosen) throw new AppError('Akun Anda tidak terdaftar sebagai dosen', 403);
    return dosen;
  },

  /**
   * Ambil semester aktif. Throw 404 jika tidak ditemukan.
   */
  async _getActiveSemester() {
    const semester = await prisma.semester.findFirst({
      where: { is_active: true },
      include: { tahun_akademik: true },
    });
    if (!semester) throw new AppError('Tidak ada semester aktif saat ini', 404);
    return semester;
  },

  // ================================================================
  // Mahasiswa: GET /api/v1/krs/periode-aktif
  // ================================================================

  async getPeriodeAktif() {
    const semester = await this._getActiveSemester();
    const periodeResult = await getActivePeriode(semester.id);

    if (!periodeResult.ok) {
      // Tetap kembalikan info meski tidak ada periode aktif
      return {
        semester,
        periode: null,
        pesan: periodeResult.error.pesan,
      };
    }

    return {
      semester,
      periode: periodeResult.periode,
    };
  },

  // ================================================================
  // Mahasiswa: GET /api/v1/krs/saya
  // ================================================================

  async getMyKRS(userId, semesterId, meta = {}) {
    const mhs = await this._getMahasiswa(userId);

    // Gunakan semester_id dari query, atau semester aktif
    let semId = semesterId;
    if (!semId) {
      const activeSem = await this._getActiveSemester();
      semId = activeSem.id;
    }

    const existing = await prisma.kRS.findUnique({
      where: {
        mahasiswa_id_semester_id: {
          mahasiswa_id: mhs.id,
          semester_id: semId,
        },
      },
      include: KRS_FULL_INCLUDE,
    });
    if (existing) return existing;

    const periodeResult = await getActivePeriode(semId);
    if (!periodeResult.ok) return null;
    assertMahasiswaAktif(mhs);

    let createdDraft = false;
    let krs;
    try {
      const result = await prisma.$transaction(async (tx) => {
        await lockTransaction(tx, `krs:${mhs.id}:${semId}`);
        const again = await tx.kRS.findUnique({
          where: {
            mahasiswa_id_semester_id: {
              mahasiswa_id: mhs.id,
              semester_id: semId,
            },
          },
          include: KRS_FULL_INCLUDE,
        });
        if (again) return { krs: again, createdDraft: false };

        const livePeriode = await getActivePeriode(semId, tx);
        if (!livePeriode.ok) return { krs: null, createdDraft: false };

        const created = await tx.kRS.create({
          data: {
            mahasiswa_id: mhs.id,
            semester_id: semId,
            periode_krs_id: livePeriode.periode.id,
            status: 'DRAFT',
            total_sks: 0,
          },
          include: KRS_FULL_INCLUDE,
        });
        return { krs: created, createdDraft: true };
      });
      krs = result?.krs;
      createdDraft = Boolean(result?.createdDraft);
    } catch (error) {
      if (error.code === 'P2002') {
        return prisma.kRS.findUnique({
          where: {
            mahasiswa_id_semester_id: {
              mahasiswa_id: mhs.id,
              semester_id: semId,
            },
          },
          include: KRS_FULL_INCLUDE,
        });
      }
      throw error;
    }

    if (createdDraft && krs) {
      await logAudit({
        userId,
        action: 'CREATE_KRS_DRAFT',
        entity: 'krs',
        entityId: krs.id,
        newValues: {
          mahasiswa_id: mhs.id,
          semester_id: semId,
          status: 'DRAFT',
        },
        ipAddress: meta.ipAddress,
        userAgent: meta.userAgent,
      });
    }

    return krs;
  },

  // ================================================================
  // Mahasiswa: GET /api/v1/krs/tersedia
  // ================================================================

  async getKelastersedia(userId, semesterId) {
    const mhs = await this._getMahasiswa(userId);
    assertMahasiswaAktif(mhs);

    let semId = semesterId;
    if (!semId) {
      const activeSem = await this._getActiveSemester();
      semId = activeSem.id;
    }

    const periodeResult = await getActivePeriode(semId);
    assertPeriodeAktif(periodeResult);

    // Ambil katalog kelas
    const classes = await getAvailableClasses(mhs.id, semId);

    // Filter kelas yang sudah ada di KRS mahasiswa ini
    const existingKRS = await prisma.kRS.findUnique({
      where: {
        mahasiswa_id_semester_id: {
          mahasiswa_id: mhs.id,
          semester_id: semId,
        },
      },
      include: { detail: { select: { kelas_id: true } } },
    });

    const takenIds = new Set((existingKRS?.detail || []).map((d) => d.kelas_id));

    const filtered = classes
      .filter((c) => !takenIds.has(c.id))
      .filter((c) => c.slot_tersedia > 0);

    return {
      kelas: filtered,
      total: filtered.length,
      sks_sudah_diambil: existingKRS?.total_sks || 0,
      sks_maks: periodeResult.periode.sks_maks,
      sisa_hari: periodeResult.periode.sisa_hari,
    };
  },

  // ================================================================
  // Mahasiswa: POST /api/v1/krs/saya/items  (tambah kelas ke draft)
  // ================================================================

  async addItem(userId, { semester_id, kelas_id }, meta = {}) {
    const mhs = await this._getMahasiswa(userId);
    assertMahasiswaAktif(mhs);

    const periodeResult = await getActivePeriode(semester_id);
    assertPeriodeAktif(periodeResult);

    // Validate first so an invalid request cannot leave an unaudited empty draft.
    const eligResult = await checkEligibility(mhs.id, kelas_id, semester_id);
    if (!eligResult.ok) throw new AppError(eligResult.error.pesan, 409);

    let mutation;
    try {
      mutation = await prisma.$transaction(async (tx) => {
        await lockTransaction(tx, `krs:${mhs.id}:${semester_id}`);
        await lockTransaction(tx, `kelas:${kelas_id}`);

        const livePeriode = await getActivePeriode(semester_id, tx);
        assertPeriodeAktif(livePeriode);

        const liveElig = await checkEligibility(mhs.id, kelas_id, semester_id, tx);
        if (!liveElig.ok) throw new AppError(liveElig.error.pesan, 409);

        let krs = await tx.kRS.findUnique({
          where: {
            mahasiswa_id_semester_id: {
              mahasiswa_id: mhs.id,
              semester_id,
            },
          },
          include: { detail: true },
        });
        let createdDraft = false;
        if (!krs) {
          krs = await tx.kRS.create({
            data: {
              mahasiswa_id: mhs.id,
              semester_id,
              periode_krs_id: livePeriode.periode.id,
              status: 'DRAFT',
              total_sks: 0,
            },
            include: { detail: true },
          });
          createdDraft = true;
        }

        if (!KRS_EDITABLE_STATES.includes(krs.status)) {
          throw new AppError(
            `KRS dalam status ${krs.status} tidak dapat diubah. Status yang diizinkan: ${KRS_EDITABLE_STATES.join(', ')}`,
            400
          );
        }

        const existingDetail = await tx.kRSDetail.findUnique({
          where: { krs_id_kelas_id: { krs_id: krs.id, kelas_id } },
        });
        if (existingDetail) throw new AppError('Kelas sudah ada dalam KRS Anda', 409);

        const duplicateCourse = await tx.kRSDetail.findFirst({
          where: {
            krs_id: krs.id,
            kelas: { mata_kuliah_id: liveElig.kelas.mata_kuliah_id },
          },
        });
        if (duplicateCourse) {
          throw new AppError('Mata kuliah ini sudah diambil pada kelas lain', 409);
        }

        const capResult = await checkCapacity(kelas_id, liveElig.kelas.kapasitas, tx);
        if (!capResult.ok) throw new AppError(capResult.error.pesan, 409);

        await tx.kRSDetail.create({ data: { krs_id: krs.id, kelas_id } });
        const newSks = await recomputeTotalSKS(krs.id, tx);
        const updated = await tx.kRS.update({
          where: { id: krs.id },
          data: { total_sks: newSks },
          include: KRS_FULL_INCLUDE,
        });

        return {
          updated,
          createdDraft,
          krsId: krs.id,
          oldSks: krs.total_sks,
          oldItemCount: krs.detail.length,
          newSks,
        };
      });
    } catch (error) {
      if (isKrsIdentityConflict(error)) {
        throw new AppError('Terjadi konflik saat membuat draft KRS, silakan coba kembali', 409);
      }
      if (error.code === 'P2002') throw new AppError('Kelas sudah ada dalam KRS Anda', 409);
      throw error;
    }

    if (mutation.createdDraft) {
      await logAudit({
        userId,
        action: 'CREATE_KRS_DRAFT',
        entity: 'krs',
        entityId: mutation.krsId,
        newValues: { mahasiswa_id: mhs.id, semester_id, status: 'DRAFT' },
        ipAddress: meta.ipAddress,
        userAgent: meta.userAgent,
      });
    }
    await logAudit({
      userId,
      action: 'UPDATE_KRS_ITEM',
      entity: 'krs',
      entityId: mutation.krsId,
      oldValues: { total_sks: mutation.oldSks, item_count: mutation.oldItemCount },
      newValues: { total_sks: mutation.newSks, added_kelas_id: kelas_id },
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
    });

    return mutation.updated;
  },

  // ================================================================
  // Mahasiswa: DELETE /api/v1/krs/saya/items/:detailId  (hapus dari draft)
  // ================================================================

  async removeItem(userId, detailId, meta = {}) {
    const mhs = await this._getMahasiswa(userId);
    assertMahasiswaAktif(mhs);

    const initialDetail = await prisma.kRSDetail.findUnique({
      where: { id: detailId },
      include: { krs: true },
    });
    if (!initialDetail) throw new AppError('Detail KRS tidak ditemukan', 404);
    if (initialDetail.krs.mahasiswa_id !== mhs.id) {
      throw new AppError('Anda tidak memiliki akses untuk mengubah KRS ini', 403);
    }

    const periodeResult = await getActivePeriode(initialDetail.krs.semester_id);
    assertPeriodeAktif(periodeResult);

    const mutation = await prisma.$transaction(async (tx) => {
      await lockTransaction(tx, `krs:${mhs.id}:${initialDetail.krs.semester_id}`);
      const livePeriode = await getActivePeriode(initialDetail.krs.semester_id, tx);
      assertPeriodeAktif(livePeriode);
      const detail = await tx.kRSDetail.findUnique({
        where: { id: detailId },
        include: {
          krs: true,
          kelas: { include: { mata_kuliah: true } },
        },
      });
      if (!detail) throw new AppError('Detail KRS tidak ditemukan', 404);
      if (detail.krs.mahasiswa_id !== mhs.id) {
        throw new AppError('Anda tidak memiliki akses untuk mengubah KRS ini', 403);
      }
      if (!KRS_EDITABLE_STATES.includes(detail.krs.status)) {
        throw new AppError(`KRS dalam status ${detail.krs.status} tidak dapat diubah`, 400);
      }

      await tx.kRSDetail.delete({ where: { id: detailId } });
      const newSks = await recomputeTotalSKS(detail.krs.id, tx);
      const updated = await tx.kRS.update({
        where: { id: detail.krs.id },
        data: { total_sks: newSks },
        include: KRS_FULL_INCLUDE,
      });
      return {
        updated,
        krsId: detail.krs.id,
        oldSks: detail.krs.total_sks,
        newSks,
        kelasId: detail.kelas_id,
      };
    });

    await logAudit({
      userId,
      action: 'UPDATE_KRS_ITEM',
      entity: 'krs',
      entityId: mutation.krsId,
      oldValues: { total_sks: mutation.oldSks, removed_kelas_id: mutation.kelasId },
      newValues: { total_sks: mutation.newSks },
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
    });

    return mutation.updated;
  },

  // ================================================================
  // Mahasiswa: POST /api/v1/krs/saya/submit  (ajukan KRS)
  // ================================================================

  async submitKRS(userId, semester_id, meta = {}) {
    const mhs = await this._getMahasiswa(userId);
    assertMahasiswaAktif(mhs);

    const semId = semester_id || (await this._getActiveSemester()).id;

    const periodeResult = await getActivePeriode(semId);
    assertPeriodeAktif(periodeResult);

    let transactionResult;
    try {
      transactionResult = await prisma.$transaction(async (tx) => {
        await lockTransaction(tx, `krs:${mhs.id}:${semId}`);
        const livePeriode = await getActivePeriode(semId, tx);
        assertPeriodeAktif(livePeriode);
        const krs = await tx.kRS.findUnique({
          where: {
            mahasiswa_id_semester_id: {
              mahasiswa_id: mhs.id,
              semester_id: semId,
            },
          },
        });
        if (!krs) throw new AppError('KRS tidak ditemukan. Buat draft terlebih dahulu.', 404);
        if (!isLegalTransition(krs.status, 'DIAJUKAN')) {
          throw new AppError(illegalTransitionMessage(krs.status, 'DIAJUKAN'), 400);
        }

        const details = await tx.kRSDetail.findMany({
          where: { krs_id: krs.id },
          select: { kelas_id: true },
          orderBy: { kelas_id: 'asc' },
        });
        for (const detail of details) {
          await lockTransaction(tx, `kelas:${detail.kelas_id}`);
        }

        const validation = await validateSubmission({
          krsId: krs.id,
          semesterId: semId,
          mahasiswaId: mhs.id,
          sksMaks: livePeriode.periode.sks_maks,
          client: tx,
        });
        if (!validation.ok) return { submitted: false, validation };

        const result = await tx.kRS.updateMany({
          where: { id: krs.id, status: { in: ['DRAFT', 'DIKEMBALIKAN'] } },
          data: {
            status: 'DIAJUKAN',
            total_sks: validation.totalSks,
            diajukan_at: new Date(),
            catatan_dosen: null,
          },
        });
        if (result.count === 0) {
          throw new AppError('KRS sudah tidak dalam status yang dapat diajukan (konflik konkurensi)', 409);
        }

        const updated = await tx.kRS.findUnique({
          where: { id: krs.id },
          include: KRS_FULL_INCLUDE,
        });
        return { submitted: true, updated, validation, krs };
      });
    } catch (error) {
      if (error.code === 'P2034') {
        throw new AppError('Terjadi konflik saat mengajukan KRS, silakan coba kembali', 409);
      }
      throw error;
    }

    if (!transactionResult.submitted) {
      return {
        submitted: false,
        errors: transactionResult.validation.errors,
        warnings: transactionResult.validation.warnings,
      };
    }

    await logAudit({
      userId,
      action: 'SUBMIT_KRS',
      entity: 'krs',
      entityId: transactionResult.krs.id,
      oldValues: { status: transactionResult.krs.status },
      newValues: {
        status: 'DIAJUKAN',
        total_sks: transactionResult.validation.totalSks,
        diajukan_at: transactionResult.updated.diajukan_at,
      },
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
    });

    return {
      submitted: true,
      krs: transactionResult.updated,
      warnings: transactionResult.validation.warnings,
    };
  },

  // ================================================================
  // Scoped: GET /api/v1/krs/:id  (pemilik / PA pemilik / admin)
  // ================================================================

  async getKRSById(userId, roles = [], id) {
    const krs = await prisma.kRS.findUnique({
      where: { id },
      include: KRS_FULL_INCLUDE,
    });
    if (!krs) throw new AppError('KRS tidak ditemukan', 404);

    const roleSet = new Set(roles);
    if (roleSet.has('SUPER_ADMIN') || roleSet.has('ADMIN_AKADEMIK')) return krs;

    const mhs = await prisma.mahasiswa.findUnique({ where: { user_id: userId } });
    if (mhs && krs.mahasiswa_id === mhs.id) return krs;

    const dosen = await prisma.dosen.findUnique({ where: { user_id: userId } });
    if (dosen && krs.mahasiswa?.dosen_wali_id === dosen.id) return krs;

    throw new AppError('Anda tidak memiliki akses untuk melihat KRS ini', 403);
  },

  // ================================================================
  // PA: GET /api/v1/krs/pengajuan  (daftar KRS mahasiswa bimbingan)
  // ================================================================

  async getPengajuan(userId, query = {}) {
    const dosen = await this._getDosen(userId);

    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 20;
    const skip = (page - 1) * limit;

    const where = {
      mahasiswa: { dosen_wali_id: dosen.id },
    };
    if (query.status) where.status = query.status;
    if (query.semester_id) where.semester_id = query.semester_id;

    const [total, items] = await Promise.all([
      prisma.kRS.count({ where }),
      prisma.kRS.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ diajukan_at: 'desc' }],
        include: KRS_FULL_INCLUDE,
      }),
    ]);

    return {
      items,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) || 1 },
    };
  },

  // ================================================================
  // PA: POST /api/v1/krs/:id/approve  (setujui KRS)
  // ================================================================

  async approveKRS(userId, krsId, meta = {}) {
    const dosen = await this._getDosen(userId);

    const krs = await prisma.kRS.findUnique({
      where: { id: krsId },
      include: { mahasiswa: true },
    });
    if (!krs) throw new AppError('KRS tidak ditemukan', 404);

    // Ownership check: PA hanya untuk mahasiswa bimbingannya
    if (krs.mahasiswa.dosen_wali_id !== dosen.id) {
      throw new AppError('Anda hanya dapat menyetujui KRS mahasiswa bimbingan Anda', 403);
    }

    // State machine check
    if (!isLegalTransition(krs.status, 'DISETUJUI')) {
      throw new AppError(illegalTransitionMessage(krs.status, 'DISETUJUI'), 400);
    }

    // Guard + update atomik
    const updated = await prisma.$transaction(async (tx) => {
      const result = await tx.kRS.updateMany({
        where: { id: krsId, status: 'DIAJUKAN' },
        data: {
          status: 'DISETUJUI',
          diproses_at: new Date(),
          disetujui_oleh_id: dosen.id,
        },
      });
      if (result.count === 0) {
        throw new AppError('KRS sudah tidak dalam status DIAJUKAN (konflik konkurensi)', 409);
      }

      return tx.kRS.findUnique({
        where: { id: krsId },
        include: KRS_FULL_INCLUDE,
      });
    });

    // TODO MVP-3: onKrsApproved — pembentukan enrollment SPADA
    // TODO MVP-6: notifikasi

    await logAudit({
      userId,
      action: 'APPROVE_KRS',
      entity: 'krs',
      entityId: krsId,
      oldValues: { status: 'DIAJUKAN' },
      newValues: {
        status: 'DISETUJUI',
        diproses_at: updated.diproses_at,
        disetujui_oleh_id: dosen.id,
      },
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
    });

    return updated;
  },

  // ================================================================
  // PA: POST /api/v1/krs/:id/return  (kembalikan KRS untuk revisi)
  // ================================================================

  async returnKRS(userId, krsId, catatan, meta = {}) {
    const dosen = await this._getDosen(userId);

    const krs = await prisma.kRS.findUnique({
      where: { id: krsId },
      include: { mahasiswa: true },
    });
    if (!krs) throw new AppError('KRS tidak ditemukan', 404);

    // Ownership check
    if (krs.mahasiswa.dosen_wali_id !== dosen.id) {
      throw new AppError('Anda hanya dapat mengembalikan KRS mahasiswa bimbingan Anda', 403);
    }

    // State machine check
    if (!isLegalTransition(krs.status, 'DIKEMBALIKAN')) {
      throw new AppError(illegalTransitionMessage(krs.status, 'DIKEMBALIKAN'), 400);
    }

    // Guard + update atomik
    const updated = await prisma.$transaction(async (tx) => {
      const result = await tx.kRS.updateMany({
        where: { id: krsId, status: 'DIAJUKAN' },
        data: {
          status: 'DIKEMBALIKAN',
          catatan_dosen: catatan,
          diproses_at: new Date(),
          disetujui_oleh_id: dosen.id,
        },
      });
      if (result.count === 0) {
        throw new AppError('KRS sudah tidak dalam status DIAJUKAN (konflik konkurensi)', 409);
      }

      return tx.kRS.findUnique({
        where: { id: krsId },
        include: KRS_FULL_INCLUDE,
      });
    });

    // TODO MVP-6: notifikasi KRS dikembalikan

    await logAudit({
      userId,
      action: 'RETURN_KRS',
      entity: 'krs',
      entityId: krsId,
      oldValues: { status: 'DIAJUKAN' },
      newValues: {
        status: 'DIKEMBALIKAN',
        catatan_dosen: catatan,
      },
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
    });

    return updated;
  },

  // ================================================================
  // Admin: GET /api/v1/krs/admin/monitor
  // ================================================================

  async monitorKRS(query = {}) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 20;
    const skip = (page - 1) * limit;

    const where = {};
    if (query.semester_id) where.semester_id = query.semester_id;
    if (query.status) where.status = query.status;
    if (query.prodi_id) where.mahasiswa = { prodi_id: query.prodi_id };
    if (query.dosen_wali_id) {
      where.mahasiswa = { ...where.mahasiswa, dosen_wali_id: query.dosen_wali_id };
    }

    const [total, items] = await Promise.all([
      prisma.kRS.count({ where }),
      prisma.kRS.findMany({
        where,
        skip,
        take: limit,
        include: KRS_FULL_INCLUDE,
        orderBy: [{ status: 'asc' }, { diajukan_at: 'desc' }],
      }),
    ]);

    // Rekap per status
    const summary = await prisma.kRS.groupBy({
      by: ['status'],
      where,
      _count: { id: true },
    });

    const statusSummary = { DRAFT: 0, DIAJUKAN: 0, DISETUJUI: 0, DIKEMBALIKAN: 0 };
    summary.forEach((s) => { statusSummary[s.status] = s._count.id; });

    return {
      items,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) || 1 },
      summary: statusSummary,
    };
  },

  // ================================================================
  // Admin: POST /api/v1/krs/admin/:id/reset-draft
  // ================================================================

  async resetToDraft(krsId, meta = {}) {
    const krs = await prisma.kRS.findUnique({
      where: { id: krsId },
      include: { mahasiswa: true },
    });
    if (!krs) throw new AppError('KRS tidak ditemukan', 404);
    if (krs.status === 'DRAFT') throw new AppError('KRS sudah berstatus DRAFT', 400);

    const oldValues = {
      status: krs.status,
      total_sks: krs.total_sks,
      diajukan_at: krs.diajukan_at,
      diproses_at: krs.diproses_at,
      disetujui_oleh_id: krs.disetujui_oleh_id,
      catatan_dosen: krs.catatan_dosen,
      mahasiswa: `${krs.mahasiswa.nama} (${krs.mahasiswa.nim})`,
    };

    const { updated, recalc } = await prisma.$transaction(async (tx) => {
      await lockTransaction(tx, `krs:${krs.mahasiswa_id}:${krs.semester_id}`);
      const recalc = await recomputeTotalSKS(krsId, tx);
      const updated = await tx.kRS.update({
        where: { id: krsId },
        data: {
          status: 'DRAFT',
          total_sks: recalc,
          diajukan_at: null,
          diproses_at: null,
          disetujui_oleh_id: null,
          catatan_dosen: null,
        },
        include: KRS_FULL_INCLUDE,
      });
      return { updated, recalc };
    });

    await logAudit({
      userId: meta.userId,
      action: 'KRS_ADMIN_RESET',
      entity: 'krs',
      entityId: krsId,
      oldValues,
      newValues: { status: 'DRAFT', total_sks: recalc },
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
    });

    return updated;
  },
};
