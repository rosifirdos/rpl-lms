/**
 * Konflik Jadwal Service (SRS FR-101, Bab 6.2)
 *
 * Deteksi bentrok jadwal: ruangan & dosen pada rentang waktu overlap di hari sama.
 * Waktu disimpan sebagai string "HH:mm" (VarChar(5)); perbandingan leksikografis aman
 * karena format zero-padded 24-jam (SRS Bab 32.1 — waktu server sebagai kebenaran).
 *
 * Dipakai oleh:
 *  - Fase 8: submit KRS mahasiswa (bentrok antar item yang dipilih)
 *  - Fase 10: tulis jadwal oleh Admin Akademik (bentrok ruangan/dosen lintas kelas)
 */

import prisma from '../../config/prisma.js';
import { KRS_ERROR_CODES } from '../../constants/krs.js';

/**
 * Konversi "HH:mm" menjadi jumlah menit sejak tengah malam.
 * @param {string} time
 * @returns {number}
 */
export function timeToMinutes(time) {
  if (typeof time !== 'string' || !/^\d{2}:\d{2}$/.test(time)) {
    throw new Error(`Format waktu tidak valid: ${time}`);
  }
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

/**
 * Cek apakah dua rentang waktu saling overlap.
 * Aturan: overlap jika start1 < end2 AND end1 > start2 (rentang setengah-terbuka).
 * @param {string} s1
 * @param {string} e1
 * @param {string} s2
 * @param {string} e2
 * @returns {boolean}
 */
export function timesOverlap(s1, e1, s2, e2) {
  const start1 = timeToMinutes(s1);
  const end1 = timeToMinutes(e1);
  const start2 = timeToMinutes(s2);
  const end2 = timeToMinutes(e2);
  return start1 < end2 && end1 > start2;
}

/**
 * Deteksi bentrok antar jadwal milik sekumpulan kelas.
 * Berguna saat submit KRS: cek apakah kelas-kelas pilihan mahasiswa saling bentrok.
 *
 * Bentrok dihitung per hari yang sama: bila dua slot dari kelas berbeda overlap
 * waktunya pada hari yang sama, dilaporkan sebagai JAM_BENTROK.
 *
 * @param {string[]} kelasIds - daftar kelas_id yang akan diperiksa
 * @returns {Promise<{ok: boolean, conflicts: Array}>}
 *         conflicts: [{ kode, pesan, detail: { hari, jam, kelas_1, kelas_2 } }]
 */
export async function detectConflictsBetweenClasses(kelasIds, client = prisma) {
  if (!Array.isArray(kelasIds) || kelasIds.length < 2) {
    return { ok: true, conflicts: [] };
  }

  // Ambil seluruh jadwal untuk kelas-kelas terpilih beserta info kelas/mk/dosen/ruangan
  const jadwal = await client.jadwalKelas.findMany({
    where: { kelas_id: { in: kelasIds } },
    include: {
      kelas: {
        include: {
          mata_kuliah: true,
          dosen: true,
          ruangan: true,
        },
      },
    },
  });

  const conflicts = [];

  // Kelompokkan per hari, lalu pasangan-cek overlap dalam tiap kelompok
  const byHari = new Map();
  for (const slot of jadwal) {
    const arr = byHari.get(slot.hari) || [];
    arr.push(slot);
    byHari.set(slot.hari, arr);
  }

  for (const [, slots] of byHari) {
    for (let i = 0; i < slots.length; i++) {
      for (let j = i + 1; j < slots.length; j++) {
        const a = slots[i];
        const b = slots[j];
        if (a.kelas_id === b.kelas_id) continue;
        if (timesOverlap(a.jam_mulai, a.jam_selesai, b.jam_mulai, b.jam_selesai)) {
          conflicts.push({
            kode: KRS_ERROR_CODES.JAM_BENTROK,
            pesan: `Kelas ${a.kelas.kode_kelas} (${a.jam_mulai}-${a.jam_selesai}) bentrok dengan ${b.kelas.kode_kelas} (${b.jam_mulai}-${b.jam_selesai}) pada hari ${a.hari}`,
            detail: {
              hari: a.hari,
              jam_mulai: a.jam_mulai,
              jam_selesai: a.jam_selesai,
              kelas_1: {
                id: a.kelas_id,
                kode: a.kelas.kode_kelas,
                nama_mk: a.kelas.mata_kuliah.nama,
                dosen: a.kelas.dosen?.nama,
                ruangan: a.kelas.ruangan?.nama,
              },
              kelas_2: {
                id: b.kelas_id,
                kode: b.kelas.kode_kelas,
                nama_mk: b.kelas.mata_kuliah.nama,
                dosen: b.kelas.dosen?.nama,
                ruangan: b.kelas.ruangan?.nama,
              },
            },
          });
        }
      }
    }
  }

  return { ok: conflicts.length === 0, conflicts };
}

/**
 * Deteksi bentrok jadwal untuk satu kelas terhadap seluruh kelas lain di semester yang sama.
 * Dipakai saat Admin Akademik menulis/mengubah slot jadwal (Fase 10).
 *
 * Kriteria (FR-101):
 *  (a) ruangan sama + hari sama + waktu overlap
 *  (b) dosen sama + hari sama + waktu overlap
 *
 * @param {Object} params
 * @param {string} params.kelas_id
 * @param {string} params.hari
 * @param {string} params.jam_mulai
 * @param {string} params.jam_selesai
 * @param {string|null} [params.excludeJadwalId] - id slot yang sedang diupdate (untuk skip diri sendiri)
 * @returns {Promise<{ok: boolean, conflicts: Array}>}
 */
export async function detectConflictsForSlot({
  kelas_id,
  hari,
  jam_mulai,
  jam_selesai,
  excludeJadwalId = null,
}) {
  // Ambil kelas target untuk tahu dosen_id & ruangan_id
  const kelas = await prisma.kelas.findUnique({
    where: { id: kelas_id },
    include: { dosen: true, ruangan: true, mata_kuliah: true },
  });
  if (!kelas) {
    return {
      ok: false,
      conflicts: [
        {
          kode: KRS_ERROR_CODES.KELAS_TIDAK_TERSEDIA,
          pesan: 'Kelas tidak ditemukan',
          detail: { kelas_id },
        },
      ],
    };
  }

  // Kandidat bentrok: slot pada hari yang sama di kelas manapun (kecuali diri sendiri)
  const where = {
    hari,
    ...(excludeJadwalId ? { id: { not: excludeJadwalId } } : {}),
  };

  const candidates = await prisma.jadwalKelas.findMany({
    where,
    include: {
      kelas: {
        include: { dosen: true, ruangan: true, mata_kuliah: true },
      },
    },
  });

  const conflicts = [];

  for (const slot of candidates) {
    if (!timesOverlap(jam_mulai, jam_selesai, slot.jam_mulai, slot.jam_selesai)) {
      continue;
    }

    let jenisBentrok = null;
    // (a) ruangan sama (jika keduanya punya ruangan)
    if (kelas.ruangan_id && slot.kelas.ruangan_id && kelas.ruangan_id === slot.kelas.ruangan_id) {
      jenisBentrok = 'RUANGAN';
    }
    // (b) dosen sama
    if (kelas.dosen_id && slot.kelas.dosen_id && kelas.dosen_id === slot.kelas.dosen_id) {
      jenisBentrok = jenisBentrok ? `${jenisBentrok}+DOSEN` : 'DOSEN';
    }

    if (jenisBentrok) {
      conflicts.push({
        kode: KRS_ERROR_CODES.JAM_BENTROK,
        pesan: `Bentrok ${jenisBentrok}: ${kelas.kode_kelas} (${jam_mulai}-${jam_selesai}) dengan ${slot.kelas.kode_kelas} (${slot.jam_mulai}-${slot.jam_selesai}) pada ${hari}`,
        detail: {
          jenis: jenisBentrok,
          hari,
          slot_baru: {
            kelas_id: kelas.id,
            kode_kelas: kelas.kode_kelas,
            nama_mk: kelas.mata_kuliah.nama,
            jam_mulai,
            jam_selesai,
            dosen: kelas.dosen?.nama,
            ruangan: kelas.ruangan?.nama,
          },
          slot_bentrok: {
            jadwal_id: slot.id,
            kelas_id: slot.kelas_id,
            kode_kelas: slot.kelas.kode_kelas,
            nama_mk: slot.kelas.mata_kuliah.nama,
            jam_mulai: slot.jam_mulai,
            jam_selesai: slot.jam_selesai,
            dosen: slot.kelas.dosen?.nama,
            ruangan: slot.kelas.ruangan?.nama,
          },
        },
      });
    }
  }

  return { ok: conflicts.length === 0, conflicts };
}