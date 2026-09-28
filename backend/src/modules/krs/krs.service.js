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
  KRS_ERROR_CODES,
  KRS_EDITABLE_STATES,
  isLegalTransition,
  illegalTransitionMessage,
} from '../../constants/krs.js';
import {
  getActivePeriode,
  checkEligibility,
  checkCapacity,
  recomputeTotalSKS,
  checkSKSLimit,
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

  async getMyKRS(userId, semesterId) {
    const mhs = await this._getMahasiswa(userId);

    // Gunakan semester_id dari query, atau semester aktif
    let semId = semesterId;
    if (!semId) {
      const activeSem = await this._getActiveSemester();
      semId = activeSem.id;
    }

    // Cari KRS yang sudah ada
    let krs = await prisma.kRS.findUnique({
      where: {
        mahasiswa_id_semester_id: {
          mahasiswa_id: mhs.id,
          semester_id: semId,
        },
      },
      include: KRS_FULL_INCLUDE,
    });

    if (!krs) {
      // Belum ada KRS — cek apakah ada periode aktif
      const periodeResult = await getActivePeriode(semId);
      if (!periodeResult.ok) {
        // Tidak ada periode aktif: kembalikan null tanpa membuat draft
        return null;
      }

      // Auto-create DRAFT
      krs = await prisma.kRS.create({
        data: {
          mahasiswa_id: mhs.id,
          semester_id: semId,
          periode_krs_id: periodeResult.periode.id,
          status: 'DRAFT',
          total_sks: 0,
        },
        include: KRS_FULL_INCLUDE,
      });

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
      });
    }

    return krs;
  },

  // ================================================================
  // Mahasiswa: GET /api/v1/krs/tersedia
  // ================================================================

  async getKelastersedia(userId, semesterId) {
    const mhs = await this._getMahasiswa(userId);

    let semId = semesterId;
    if (!semId) {
      const activeSem = await this._getActiveSemester();
      semId = activeSem.id;
    }

    // Cek periode aktif
    const periodeResult = await getActivePeriode(semId);
    if (!periodeResult.ok) {
      throw new AppError(periodeResult.error.pesan, 409);
    }

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

    // Cek periode aktif
    const periodeResult = await getActivePeriode(semester_id);
    if (!periodeResult.ok) {
      throw new AppError(periodeResult.error.pesan, 403);
    }

    // Dapatkan atau buat KRS
    let createdDraft = false;
    let krs = await prisma.kRS.findUnique({
      where: {
        mahasiswa_id_semester_id: {
          mahasiswa_id: mhs.id,
          semester_id,
        },
      },
      include: { detail: true },
    });

    if (!krs) {
      // Auto-create DRAFT
      krs = await prisma.kRS.create({
        data: {
          mahasiswa_id: mhs.id,
          semester_id,
          periode_krs_id: periodeResult.periode.id,
          status: 'DRAFT',
          total_sks: 0,
        },
        include: { detail: true },
      });
      createdDraft = true;
    }

    // Hanya DRAFT dan DIKEMBALIKAN yang boleh diedit
    if (!KRS_EDITABLE_STATES.includes(krs.status)) {
      throw new AppError(
        `KRS dalam status ${krs.status} tidak dapat diubah. Status yang diizinkan: ${KRS_EDITABLE_STATES.join(', ')}`,
        400
      );
    }

    // Cek eligibilitas kelas
    const eligResult = await checkEligibility(mhs.id, kelas_id, semester_id);
    if (!eligResult.ok) {
      throw new AppError(eligResult.error.pesan, 409);
    }

    // Cek duplikat
    const existingDetail = await prisma.kRSDetail.findUnique({
      where: { krs_id_kelas_id: { krs_id: krs.id, kelas_id } },
    });
    if (existingDetail) {
      throw new AppError('Kelas sudah ada dalam KRS Anda', 409);
    }

    // Cek kapasitas
    const capResult = await checkCapacity(kelas_id, eligResult.kelas.kapasitas);
    if (!capResult.ok) {
      throw new AppError(capResult.error.pesan, 409);
    }

    // Draft boleh melampaui batas SKS; seluruh aturan akademik dikumpulkan saat submit.
    const currentSks = await recomputeTotalSKS(krs.id);
    const newSks = currentSks + eligResult.kelas.mata_kuliah.sks;

    // Tambah detail + update total SKS dalam transaksi
    const updated = await prisma.$transaction(async (tx) => {
      await tx.kRSDetail.create({
        data: { krs_id: krs.id, kelas_id },
      });

      return tx.kRS.update({
        where: { id: krs.id },
        data: { total_sks: newSks },
        include: KRS_FULL_INCLUDE,
      });
    });

    if (createdDraft) {
      await logAudit({
        userId,
        action: 'CREATE_KRS_DRAFT',
        entity: 'krs',
        entityId: krs.id,
        newValues: { mahasiswa_id: mhs.id, semester_id, status: 'DRAFT' },
        ipAddress: meta.ipAddress,
        userAgent: meta.userAgent,
      });
    }

    await logAudit({
      userId,
      action: 'UPDATE_KRS_ITEM',
      entity: 'krs',
      entityId: krs.id,
      oldValues: { total_sks: currentSks, item_count: krs.detail.length },
      newValues: { total_sks: newSks, added_kelas_id: kelas_id },
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
    });

    return updated;
  },

  // ================================================================
  // Mahasiswa: DELETE /api/v1/krs/saya/items/:detailId  (hapus dari draft)
  // ================================================================

  async removeItem(userId, detailId, meta = {}) {
    const mhs = await this._getMahasiswa(userId);

    // Cari detail beserta KRS-nya
    const detail = await prisma.kRSDetail.findUnique({
      where: { id: detailId },
      include: {
        krs: true,
        kelas: { include: { mata_kuliah: true } },
      },
    });

    if (!detail) throw new AppError('Detail KRS tidak ditemukan', 404);

    // Ownership check
    if (detail.krs.mahasiswa_id !== mhs.id) {
      throw new AppError('Anda tidak memiliki akses untuk mengubah KRS ini', 403);
    }

    // Status check
    if (!KRS_EDITABLE_STATES.includes(detail.krs.status)) {
      throw new AppError(
        `KRS dalam status ${detail.krs.status} tidak dapat diubah`,
        400
      );
    }

    const periodeResult = await getActivePeriode(detail.krs.semester_id);
    if (!periodeResult.ok) {
      throw new AppError(periodeResult.error.pesan, 403);
    }

    const removedSks = detail.kelas.mata_kuliah.sks;
    const oldSks = detail.krs.total_sks;
    const newSks = Math.max(0, oldSks - removedSks);

    // Hapus detail + update total SKS
    const updated = await prisma.$transaction(async (tx) => {
      await tx.kRSDetail.delete({ where: { id: detailId } });

      return tx.kRS.update({
        where: { id: detail.krs.id },
        data: { total_sks: newSks },
        include: KRS_FULL_INCLUDE,
      });
    });

    await logAudit({
      userId,
      action: 'UPDATE_KRS_ITEM',
      entity: 'krs',
      entityId: detail.krs.id,
      oldValues: { total_sks: oldSks, removed_kelas_id: detail.kelas_id },
      newValues: { total_sks: newSks },
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
    });

    return updated;
  },

  // ================================================================
  // Mahasiswa: POST /api/v1/krs/saya/submit  (ajukan KRS)
  // ================================================================

  async submitKRS(userId, semester_id, meta = {}) {
    const mhs = await this._getMahasiswa(userId);

    let semId = semester_id;
    if (!semId) {
      const activeSem = await this._getActiveSemester();
      semId = activeSem.id;
    }

    // Cek periode aktif
    const periodeResult = await getActivePeriode(semId);
    if (!periodeResult.ok) {
      throw new AppError(periodeResult.error.pesan, 403);
    }

    // Ambil KRS
    const krs = await prisma.kRS.findUnique({
      where: {
        mahasiswa_id_semester_id: {
          mahasiswa_id: mhs.id,
          semester_id: semId,
        },
      },
    });

    if (!krs) throw new AppError('KRS tidak ditemukan. Buat draft terlebih dahulu.', 404);

    // State machine check: hanya DRAFT dan DIKEMBALIKAN yang bisa disubmit
    if (!isLegalTransition(krs.status, 'DIAJUKAN')) {
      throw new AppError(illegalTransitionMessage(krs.status, 'DIAJUKAN'), 400);
    }

    // Validasi penuh (SKS, kapasitas, bentrok jam)
    const validation = await validateSubmission({
      krsId: krs.id,
      semesterId: semId,
      mahasiswaId: mhs.id,
      sksMaks: periodeResult.periode.sks_maks,
    });

    if (!validation.ok) {
      // Format SRS Bab 4.7 — reason terstruktur
      return {
        submitted: false,
        errors: validation.errors,
        warnings: validation.warnings,
      };
    }

    // Submit: guard status lama + update ke DIAJUKAN (optimistic lock)
    const updated = await prisma.$transaction(async (tx) => {
      const result = await tx.kRS.updateMany({
        where: {
          id: krs.id,
          status: { in: ['DRAFT', 'DIKEMBALIKAN'] },
        },
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

      return tx.kRS.findUnique({
        where: { id: krs.id },
        include: KRS_FULL_INCLUDE,
      });
    });

    await logAudit({
      userId,
      action: 'SUBMIT_KRS',
      entity: 'krs',
      entityId: krs.id,
      oldValues: { status: krs.status },
      newValues: { status: 'DIAJUKAN', total_sks: validation.totalSks, diajukan_at: updated.diajukan_at },
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
    });

    return {
      submitted: true,
      krs: updated,
      warnings: validation.warnings,
    };
  },

  // ================================================================
  // Scoped: GET /api/v1/krs/:id  (pemilik / PA pemilik / admin)
  // ================================================================

  async getKRSById(id) {
    const krs = await prisma.kRS.findUnique({
      where: { id },
      include: KRS_FULL_INCLUDE,
    });
    if (!krs) throw new AppError('KRS tidak ditemukan', 404);
    return krs;
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

    const updated = await prisma.kRS.update({
      where: { id: krsId },
      data: {
        status: 'DRAFT',
        diajukan_at: null,
        diproses_at: null,
        disetujui_oleh_id: null,
        catatan_dosen: null,
      },
      include: KRS_FULL_INCLUDE,
    });

    // Recompute total SKS dari detail yang masih ada
    const recalc = await recomputeTotalSKS(krsId);
    await prisma.kRS.update({
      where: { id: krsId },
      data: { total_sks: recalc },
    });
    updated.total_sks = recalc;

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
