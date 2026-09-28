/**
 * KRS Rules Engine (SRS FR-023, FR-025, Bab 6.1, Bab 33)
 *
 * Fungsi validasi murni untuk operasi KRS:
 *  (1) Cek jendela waktu periode KRS
 *  (2) Eligibilitas kelas (kurikulum prodi, semester aktif)
 *  (3) Kapasitas kelas vs jumlah item DIAJUKAN/DISETUJUI
 *  (4) Akumulasi SKS vs batas periode
 *  (5) Bentrok jam antar item (via konflik.service.js)
 */

import prisma from '../../config/prisma.js';
import { KRS_ERROR_CODES, KRS_ENROLLED_STATUSES } from '../../constants/krs.js';
import { detectConflictsBetweenClasses } from '../jadwal/konflik.service.js';

// ================================================================
// (1) Cek jendela waktu periode KRS
// ================================================================

/**
 * Ambil periode KRS aktif untuk semester tertentu yang masih dalam jendela waktu.
 * @param {string} semesterId
 * @returns {Promise<{ok: boolean, periode?: Object, error?: Object}>}
 */
export async function getActivePeriode(semesterId) {
  const now = new Date();

  const periode = await prisma.periodeKRS.findFirst({
    where: {
      semester_id: semesterId,
      is_aktif: true,
    },
    include: {
      semester: { include: { tahun_akademik: true } },
    },
  });

  if (!periode) {
    return {
      ok: false,
      error: {
        kode: KRS_ERROR_CODES.PERIODE_TIDAK_AKTIF,
        pesan: 'Tidak ada periode KRS aktif untuk semester ini',
        detail: { semester_id: semesterId },
      },
    };
  }

  const mulai = new Date(periode.tanggal_mulai);
  const selesai = new Date(periode.tanggal_selesai);

  if (now < mulai) {
    return {
      ok: false,
      error: {
        kode: KRS_ERROR_CODES.PERIODE_BELUM_BUKA,
        pesan: `Periode KRS belum dibuka. Mulai: ${mulai.toISOString()}`,
        detail: { tanggal_mulai: mulai.toISOString() },
      },
    };
  }

  if (now > selesai) {
    return {
      ok: false,
      error: {
        kode: KRS_ERROR_CODES.PERIODE_SUDAH_TUTUP,
        pesan: `Periode KRS sudah ditutup sejak ${selesai.toISOString()}`,
        detail: { tanggal_selesai: selesai.toISOString() },
      },
    };
  }

  const sisaHari = Math.ceil((selesai - now) / (1000 * 60 * 60 * 24));

  return { ok: true, periode: { ...periode, sisa_hari: sisaHari } };
}

// ================================================================
// (2) Eligibilitas kelas
// ================================================================

/**
 * Cek apakah kelas eligible untuk diambil mahasiswa tertentu.
 * Kriteria: kelas ada, berada di semester yang diminta, mata kuliah dari
 * kurikulum prodi mahasiswa, dan mata kuliah aktif.
 *
 * @param {string} mahasiswaId
 * @param {string} kelasId
 * @param {string} semesterId
 * @returns {Promise<{ok: boolean, kelas?: Object, error?: Object}>}
 */
export async function checkEligibility(mahasiswaId, kelasId, semesterId) {
  const mahasiswa = await prisma.mahasiswa.findUnique({
    where: { id: mahasiswaId },
    include: {
      prodi: {
        include: {
          kurikulum: { where: { is_active: true } },
        },
      },
    },
  });

  if (!mahasiswa) {
    return {
      ok: false,
      error: {
        kode: KRS_ERROR_CODES.BUKAN_MAHASISWA,
        pesan: 'Data mahasiswa tidak ditemukan',
      },
    };
  }

  const kelas = await prisma.kelas.findUnique({
    where: { id: kelasId },
    include: {
      mata_kuliah: true,
      semester: true,
      dosen: true,
      ruangan: true,
      jadwal: true,
    },
  });

  if (!kelas) {
    return {
      ok: false,
      error: {
        kode: KRS_ERROR_CODES.KELAS_TIDAK_TERSEDIA,
        pesan: 'Kelas tidak ditemukan',
      },
    };
  }

  // Kelas harus berada di semester yang diminta
  if (kelas.semester_id !== semesterId) {
    return {
      ok: false,
      error: {
        kode: KRS_ERROR_CODES.KELAS_TIDAK_TERSEDIA,
        pesan: 'Kelas tidak tersedia untuk semester yang diminta',
        detail: { kelas_semester_id: kelas.semester_id, semester_id: semesterId },
      },
    };
  }

  // Mata kuliah harus dari kurikulum prodi mahasiswa
  const kurikulumIds = mahasiswa.prodi.kurikulum.map((k) => k.id);
  if (kurikulumIds.length > 0 && !kurikulumIds.includes(kelas.mata_kuliah.kurikulum_id)) {
    return {
      ok: false,
      error: {
        kode: KRS_ERROR_CODES.KELAS_DI_LUR_PRODI,
        pesan: `Mata kuliah ${kelas.mata_kuliah.nama} bukan bagian dari kurikulum prodi Anda`,
        detail: {
          mk_kurikulum_id: kelas.mata_kuliah.kurikulum_id,
          prodi_kurikulum_ids: kurikulumIds,
        },
      },
    };
  }

  // Tidak ada atribut semester studi mahasiswa pada skema MVP 2, sehingga
  // semester_paket hanya dapat dipakai sebagai informasi katalog, bukan batas eligibility.

  // Mata kuliah harus aktif
  if (!kelas.mata_kuliah.is_active) {
    return {
      ok: false,
      error: {
        kode: KRS_ERROR_CODES.KELAS_TIDAK_TERSEDIA,
        pesan: `Mata kuliah ${kelas.mata_kuliah.nama} tidak aktif`,
      },
    };
  }

  return { ok: true, kelas };
}

// ================================================================
// (3) Kapasitas kelas
// ================================================================

/**
 * Cek apakah kelas masih punya slot tersedia.
 * Menghitung jumlah KRSDetail dari KRS berstatus DIAJUKAN/DISETUJUI.
 *
 * @param {string} kelasId
 * @param {number} kapasitas - kapasitas kelas
 * @returns {Promise<{ok: boolean, terisi: number, tersedia: number, error?: Object}>}
 */
export async function checkCapacity(kelasId, kapasitas) {
  const terisi = await prisma.kRSDetail.count({
    where: {
      kelas_id: kelasId,
      krs: { status: { in: KRS_ENROLLED_STATUSES } },
    },
  });

  const tersedia = kapasitas - terisi;

  if (tersedia <= 0) {
    return {
      ok: false,
      terisi,
      tersedia: 0,
      error: {
        kode: KRS_ERROR_CODES.KELAS_PENUH,
        pesan: `Kelas sudah penuh (${terisi}/${kapasitas})`,
        detail: { kapasitas, terisi, tersedia: 0 },
      },
    };
  }

  return { ok: true, terisi, tersedia };
}

// ================================================================
// (4) Akumulasi SKS vs batas periode
// ================================================================

/**
 * Hitung total SKS dari detail KRS yang sudah ada + item baru.
 * @param {string} krsId
 * @param {number} [tambahSks=0] - SKS dari item yang akan ditambahkan
 * @returns {Promise<number>}
 */
export async function recomputeTotalSKS(krsId, tambahSks = 0) {
  const details = await prisma.kRSDetail.findMany({
    where: { krs_id: krsId },
    include: { kelas: { include: { mata_kuliah: true } } },
  });

  const total = details.reduce((sum, d) => sum + d.kelas.mata_kuliah.sks, 0);
  return total + tambahSks;
}

/**
 * Validasi apakah total SKS (termasuk item baru) melebihi batas periode.
 * @param {number} totalSks
 * @param {number} sksMaks
 * @returns {{ok: boolean, error?: Object}}
 */
export function checkSKSLimit(totalSks, sksMaks) {
  if (totalSks > sksMaks) {
    return {
      ok: false,
      error: {
        kode: KRS_ERROR_CODES.SKS_MELEBIHI_BATAS,
        pesan: `Total ${totalSks} SKS melebihi batas ${sksMaks} SKS periode ini`,
        detail: { total_sks: totalSks, sks_maks: sksMaks },
      },
    };
  }
  return { ok: true };
}

// ================================================================
// (5) Bentrok jam antar item KRS (saat submit)
// ================================================================

/**
 * Validasi submit: jalankan seluruh pengecekan sekaligus dan kumpulkan errors.
 *
 * @param {Object} params
 * @param {string} params.krsId
 * @param {string} params.semesterId
 * @param {string} params.mahasiswaId
 * @param {number} params.sksMaks - batas SKS dari periode
 * @returns {Promise<{ok: boolean, errors: Array, warnings: Array, totalSks: number}>}
 */
export async function validateSubmission({ krsId, semesterId, mahasiswaId, sksMaks }) {
  const errors = [];
  const warnings = [];

  // Ambil detail KRS dengan jadwal
  const details = await prisma.kRSDetail.findMany({
    where: { krs_id: krsId },
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
  });

  // KRS harus punya item
  if (details.length === 0) {
    errors.push({
      kode: KRS_ERROR_CODES.KRS_KOSONG,
      pesan: 'KRS harus berisi minimal satu mata kuliah sebelum diajukan',
    });
    return { ok: false, errors, warnings, totalSks: 0 };
  }

  // Hitung total SKS
  const totalSks = details.reduce((sum, d) => sum + d.kelas.mata_kuliah.sks, 0);

  // Cek batas SKS
  const sksCheck = checkSKSLimit(totalSks, sksMaks);
  if (!sksCheck.ok) {
    errors.push(sksCheck.error);
  }

  // Cek kapasitas setiap kelas
  for (const d of details) {
    const capCheck = await checkCapacity(d.kelas_id, d.kelas.kapasitas);
    if (!capCheck.ok) {
      errors.push(capCheck.error);
    }
  }

  // Cek bentrok jadwal antar kelas yang dipilih
  const kelasIds = details.map((d) => d.kelas_id);
  const kelasWithSchedule = details.filter((d) => d.kelas.jadwal.length > 0);
  const kelasWithoutSchedule = details.filter((d) => d.kelas.jadwal.length === 0);

  // Warning jika ada kelas tanpa jadwal (bukan blocker, toleransi Fase 8)
  if (kelasWithoutSchedule.length > 0) {
    warnings.push({
      kode: 'KELAS_BELUM_BERJADWAL',
      pesan: `${kelasWithoutSchedule.length} kelas belum memiliki jadwal (bentrok jam tidak dapat dicek untuk kelas tersebut)`,
      detail: {
        kelas: kelasWithoutSchedule.map((d) => ({
          id: d.kelas_id,
          kode: d.kelas.kode_kelas,
          nama_mk: d.kelas.mata_kuliah.nama,
        })),
      },
    });
  }

  // Deteksi bentrok antar kelas yang sudah berjadwal
  if (kelasWithSchedule.length >= 2) {
    const scheduleIds = kelasWithSchedule.map((d) => d.kelas_id);
    const conflictResult = await detectConflictsBetweenClasses(scheduleIds);
    if (!conflictResult.ok) {
      errors.push(...conflictResult.conflicts);
    }
  }

  return { ok: errors.length === 0, errors, warnings, totalSks };
}

// ================================================================
// Katalog kelas tersedia untuk mahasiswa
// ================================================================

/**
 * Daftar kelas yang berhak diambil mahasiswa di semester tertentu.
 *
 * Filter: kurikulum prodi, mata kuliah aktif, semester cocok.
 * Setiap kelas dilengkapi info slot_tersedia.
 *
 * @param {string} mahasiswaId
 * @param {string} semesterId
 * @returns {Promise<Array>}
 */
export async function getAvailableClasses(mahasiswaId, semesterId) {
  const mahasiswa = await prisma.mahasiswa.findUnique({
    where: { id: mahasiswaId },
    include: {
      prodi: {
        include: {
          kurikulum: { where: { is_active: true } },
        },
      },
    },
  });

  if (!mahasiswa) return [];

  const kurikulumIds = mahasiswa.prodi.kurikulum.map((k) => k.id);
  if (kurikulumIds.length === 0) return [];

  const kelasList = await prisma.kelas.findMany({
    where: {
      semester_id: semesterId,
      mata_kuliah: {
        kurikulum_id: { in: kurikulumIds },
        is_active: true,
      },
    },
    include: {
      mata_kuliah: true,
      dosen: true,
      ruangan: true,
      jadwal: true,
    },
    orderBy: [
      { mata_kuliah: { semester_paket: 'asc' } },
      { mata_kuliah: { kode: 'asc' } },
      { kode_kelas: 'asc' },
    ],
  });

  // Hitung kapasitas tersedia per kelas (batch count)
  const kelasIds = kelasList.map((k) => k.id);
  const enrolledCounts = await prisma.kRSDetail.groupBy({
    by: ['kelas_id'],
    _count: { id: true },
    where: {
      kelas_id: { in: kelasIds },
      krs: { status: { in: KRS_ENROLLED_STATUSES } },
    },
  });

  const countMap = new Map(enrolledCounts.map((c) => [c.kelas_id, c._count.id]));

  return kelasList.map((k) => {
    const terisi = countMap.get(k.id) || 0;
    return {
      ...k,
      terisi,
      slot_tersedia: k.kapasitas - terisi,
    };
  });
}
