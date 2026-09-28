/**
 * KRS Rules Engine (SRS FR-023, FR-025, Bab 6.1, Bab 33)
 *
 * Fungsi validasi untuk operasi KRS: jendela periode, eligibilitas,
 * kapasitas, akumulasi SKS, dan bentrok jadwal.
 */

import prisma from '../../config/prisma.js';
import { KRS_ERROR_CODES, KRS_ENROLLED_STATUSES } from '../../constants/krs.js';
import { detectConflictsBetweenClasses } from '../jadwal/konflik.service.js';

function periodError(kode, pesan, detail = undefined) {
  return { ok: false, error: { kode, pesan, ...(detail ? { detail } : {}) } };
}

/**
 * Ambil periode KRS aktif pada semester operasional yang masih dalam jendela waktu.
 */
export async function getActivePeriode(semesterId, client = prisma) {
  const now = new Date();
  const periode = await client.periodeKRS.findFirst({
    where: {
      semester_id: semesterId,
      is_aktif: true,
      semester: { is: { is_active: true } },
    },
    include: { semester: { include: { tahun_akademik: true } } },
  });

  if (!periode) {
    return periodError(
      KRS_ERROR_CODES.PERIODE_TIDAK_AKTIF,
      'Tidak ada periode KRS aktif untuk semester operasional ini',
      { semester_id: semesterId }
    );
  }

  const mulai = new Date(periode.tanggal_mulai);
  const selesai = new Date(periode.tanggal_selesai);
  if (now < mulai) {
    return periodError(
      KRS_ERROR_CODES.PERIODE_BELUM_BUKA,
      `Periode KRS belum dibuka. Mulai: ${mulai.toISOString()}`,
      { tanggal_mulai: mulai.toISOString() }
    );
  }
  if (now > selesai) {
    return periodError(
      KRS_ERROR_CODES.PERIODE_SUDAH_TUTUP,
      `Periode KRS sudah ditutup sejak ${selesai.toISOString()}`,
      { tanggal_selesai: selesai.toISOString() }
    );
  }

  const sisaHari = Math.ceil((selesai - now) / (1000 * 60 * 60 * 24));
  return { ok: true, periode: { ...periode, sisa_hari: sisaHari } };
}

/**
 * Cek apakah kelas eligible untuk diambil mahasiswa tertentu.
 */
export async function checkEligibility(mahasiswaId, kelasId, semesterId, client = prisma) {
  const mahasiswa = await client.mahasiswa.findUnique({
    where: { id: mahasiswaId },
    include: {
      prodi: {
        include: { kurikulum: { where: { is_active: true } } },
      },
    },
  });

  if (!mahasiswa) {
    return periodError(KRS_ERROR_CODES.BUKAN_MAHASISWA, 'Data mahasiswa tidak ditemukan');
  }
  if (mahasiswa.status_akademik !== 'AKTIF') {
    return periodError(
      KRS_ERROR_CODES.MAHASISWA_TIDAK_AKTIF,
      `Mahasiswa berstatus ${mahasiswa.status_akademik} tidak dapat mengisi KRS`,
      { status_akademik: mahasiswa.status_akademik }
    );
  }

  const kelas = await client.kelas.findUnique({
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
    return periodError(KRS_ERROR_CODES.KELAS_TIDAK_TERSEDIA, 'Kelas tidak ditemukan');
  }
  if (kelas.semester_id !== semesterId) {
    return periodError(
      KRS_ERROR_CODES.KELAS_TIDAK_TERSEDIA,
      'Kelas tidak tersedia untuk semester yang diminta',
      { kelas_semester_id: kelas.semester_id, semester_id: semesterId }
    );
  }

  const kurikulumIds = mahasiswa.prodi.kurikulum.map((k) => k.id);
  if (kurikulumIds.length === 0) {
    return periodError(
      KRS_ERROR_CODES.KELAS_DI_LUR_PRODI,
      'Program studi Anda belum memiliki kurikulum aktif',
      { prodi_id: mahasiswa.prodi_id }
    );
  }
  if (!kurikulumIds.includes(kelas.mata_kuliah.kurikulum_id)) {
    return periodError(
      KRS_ERROR_CODES.KELAS_DI_LUR_PRODI,
      `Mata kuliah ${kelas.mata_kuliah.nama} bukan bagian dari kurikulum prodi Anda`,
      {
        mk_kurikulum_id: kelas.mata_kuliah.kurikulum_id,
        prodi_kurikulum_ids: kurikulumIds,
      }
    );
  }
  if (!kelas.mata_kuliah.is_active) {
    return periodError(
      KRS_ERROR_CODES.KELAS_TIDAK_TERSEDIA,
      `Mata kuliah ${kelas.mata_kuliah.nama} tidak aktif`
    );
  }

  return { ok: true, kelas };
}

/**
 * Cek apakah kelas masih punya slot tersedia.
 */
export async function checkCapacity(kelasId, kapasitas, client = prisma) {
  const terisi = await client.kRSDetail.count({
    where: {
      kelas_id: kelasId,
      krs: { status: { in: KRS_ENROLLED_STATUSES } },
    },
  });
  const tersedia = kapasitas - terisi;
  if (tersedia <= 0) {
    return periodError(
      KRS_ERROR_CODES.KELAS_PENUH,
      `Kelas sudah penuh (${terisi}/${kapasitas})`,
      { kapasitas, terisi, tersedia: 0 }
    );
  }
  return { ok: true, terisi, tersedia };
}

/**
 * Hitung ulang total SKS dari detail KRS.
 */
export async function recomputeTotalSKS(krsId, client = prisma) {
  const details = await client.kRSDetail.findMany({
    where: { krs_id: krsId },
    include: { kelas: { include: { mata_kuliah: true } } },
  });
  return details.reduce((sum, detail) => sum + detail.kelas.mata_kuliah.sks, 0);
}

export function checkSKSLimit(totalSks, sksMaks) {
  if (totalSks > sksMaks) {
    return periodError(
      KRS_ERROR_CODES.SKS_MELEBIHI_BATAS,
      `Total ${totalSks} SKS melebihi batas ${sksMaks} SKS periode ini`,
      { total_sks: totalSks, sks_maks: sksMaks }
    );
  }
  return { ok: true };
}

/**
 * Validasi submit dengan client transaksi opsional supaya pembacaan kapasitas
 * dapat diserialisasi bersama transisi status KRS.
 */
export async function validateSubmission({ krsId, semesterId, mahasiswaId, sksMaks, client = prisma }) {
  const errors = [];
  const warnings = [];
  const details = await client.kRSDetail.findMany({
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

  if (details.length === 0) {
    errors.push({
      kode: KRS_ERROR_CODES.KRS_KOSONG,
      pesan: 'KRS harus berisi minimal satu mata kuliah sebelum diajukan',
    });
    return { ok: false, errors, warnings, totalSks: 0 };
  }

  const totalSks = details.reduce((sum, detail) => sum + detail.kelas.mata_kuliah.sks, 0);
  const sksCheck = checkSKSLimit(totalSks, sksMaks);
  if (!sksCheck.ok) errors.push(sksCheck.error);

  const mataKuliahSeen = new Set();
  for (const detail of details) {
    if (mataKuliahSeen.has(detail.kelas.mata_kuliah_id)) {
      errors.push({
        kode: KRS_ERROR_CODES.KELAS_SUDAH_DIAMBIL,
        pesan: `Mata kuliah ${detail.kelas.mata_kuliah.nama} tercatat lebih dari satu kali pada KRS`,
        detail: { mata_kuliah_id: detail.kelas.mata_kuliah_id },
      });
    }
    mataKuliahSeen.add(detail.kelas.mata_kuliah_id);

    const capCheck = await checkCapacity(detail.kelas_id, detail.kelas.kapasitas, client);
    if (!capCheck.ok) errors.push(capCheck.error);
  }

  const kelasWithSchedule = details.filter((detail) => detail.kelas.jadwal.length > 0);
  const kelasWithoutSchedule = details.filter((detail) => detail.kelas.jadwal.length === 0);
  if (kelasWithoutSchedule.length > 0) {
    warnings.push({
      kode: 'KELAS_BELUM_BERJADWAL',
      pesan: `${kelasWithoutSchedule.length} kelas belum memiliki jadwal (bentrok jam tidak dapat dicek untuk kelas tersebut)`,
      detail: {
        kelas: kelasWithoutSchedule.map((detail) => ({
          id: detail.kelas_id,
          kode: detail.kelas.kode_kelas,
          nama_mk: detail.kelas.mata_kuliah.nama,
        })),
      },
    });
  }

  if (kelasWithSchedule.length >= 2) {
    const conflictResult = await detectConflictsBetweenClasses(
      kelasWithSchedule.map((detail) => detail.kelas_id),
      client
    );
    if (!conflictResult.ok) errors.push(...conflictResult.conflicts);
  }

  return { ok: errors.length === 0, errors, warnings, totalSks };
}

/**
 * Daftar kelas yang berhak diambil mahasiswa di semester tertentu.
 */
export async function getAvailableClasses(mahasiswaId, semesterId) {
  const mahasiswa = await prisma.mahasiswa.findUnique({
    where: { id: mahasiswaId },
    include: {
      prodi: {
        include: { kurikulum: { where: { is_active: true } } },
      },
    },
  });
  if (!mahasiswa || mahasiswa.status_akademik !== 'AKTIF') return [];

  const kurikulumIds = mahasiswa.prodi.kurikulum.map((kurikulum) => kurikulum.id);
  if (kurikulumIds.length === 0) return [];

  const kelasList = await prisma.kelas.findMany({
    where: {
      semester_id: semesterId,
      mata_kuliah: { kurikulum_id: { in: kurikulumIds }, is_active: true },
    },
    include: { mata_kuliah: true, dosen: true, ruangan: true, jadwal: true },
    orderBy: [
      { mata_kuliah: { semester_paket: 'asc' } },
      { mata_kuliah: { kode: 'asc' } },
      { kode_kelas: 'asc' },
    ],
  });

  const kelasIds = kelasList.map((kelas) => kelas.id);
  const enrolledCounts = await prisma.kRSDetail.groupBy({
    by: ['kelas_id'],
    _count: { id: true },
    where: {
      kelas_id: { in: kelasIds },
      krs: { status: { in: KRS_ENROLLED_STATUSES } },
    },
  });
  const countMap = new Map(enrolledCounts.map((item) => [item.kelas_id, item._count.id]));

  return kelasList.map((kelas) => {
    const terisi = countMap.get(kelas.id) || 0;
    return { ...kelas, terisi, slot_tersedia: Math.max(0, kelas.kapasitas - terisi) };
  });
}
