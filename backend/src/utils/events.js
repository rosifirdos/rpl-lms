/**
 * Event Hook Stub — KRS Lifecycle (SRS Bab 35 & Bab 36, FR-022 s/d FR-035)
 *
 * Hook idempoten untuk mutasi KRS: submitted, approved, returned.
 *
 * Karakteristik (Keputusan Desain MVP 2 #8 — idempotensi approve):
 *  - Dipanggil SETELAH `updateMany` ber-guard status asal berhasil (count > 0),
 *    sehingga pemanggilan ulang terhadap KRS yang sudah berstatus final (DISETUJUI)
 *    tidak pernah mencapai hook — transisi ditolak 409 lebih dulu oleh guard.
 *  - Dipanggil DALAM transaksi yang sama (`client = tx`) agar jejak event konsisten
 *    dengan transisi status: bila transaksi rollback, event juga rollback (SRS Bab 35).
 *  - Berbentuk STUB: saat ini hanya mencatat baris `audit_logs` ber-tipe event.
 *    Pengiriman notifikasi penuh (email/in-app, FR-125) & pembentukan enrollment
 *    SPADA (FR-117, TC-023) masuk cakupan MVP 3 / MVP 6 — ditandai TODO.
 *
 * Konvensi penamaan audit:
 *  - Aksi user dicatat oleh service (APPROVE_KRS, RETURN_KRS, SUBMIT_KRS) — best-effort
 *    di luar transaksi (pola MVP 1).
 *  - Hook ini mencatat baris EVENT terpisah (KRS_APPROVED_EVENT, dst.) sebagai
 *    jejak lifecycle yang terikat transaksi — lapis audit berlapis sesuai SRS Bab 35.
 */

import prisma from '../config/prisma.js';

/**
 * Hook: KRS diajukan mahasiswa (DRAFT/DIKEMBALIKAN → DIAJUKAN).
 * @param {Object} params
 * @param {string} params.krsId
 * @param {string} params.userId - user yang memicu (mahasiswa)
 * @param {Object} [params.mahasiswa] - record mahasiswa (untuk konteks notifikasi)
 * @param {Object} [params.meta] - { ipAddress, userAgent }
 * @param {import('@prisma/client').PrismaClient} [params.client] - tx agar konsisten
 */
export async function onKrsSubmitted({ krsId, userId, mahasiswa = null, meta = {}, client = prisma }) {
  // TODO MVP-6: kirim notifikasi "KRS Anda diajukan, menunggu persetujuan Dosen Wali"
  await client.auditLog.create({
    data: {
      user_id: userId,
      action: 'KRS_SUBMITTED_EVENT',
      entity: 'krs',
      entity_id: krsId,
      new_values: {
        event: 'KRS_SUBMITTED',
        mahasiswa_id: mahasiswa?.id ?? null,
        nim: mahasiswa?.nim ?? null,
        status: 'DIAJUKAN',
      },
      ip_address: meta.ipAddress || null,
      user_agent: meta.userAgent || null,
    },
  });
}

/**
 * Hook: KRS disetujui Dosen Wali/PA (DIAJUKAN → DISETUJUI).
 * @param {Object} params
 * @param {string} params.krsId
 * @param {string} params.userId - user yang memicu (PA)
 * @param {Object} [params.mahasiswa]
 * @param {number} [params.totalSks]
 * @param {string} [params.disetujuiOlehId] - dosen.id pemroses
 * @param {Object} [params.meta]
 * @param {import('@prisma/client').PrismaClient} [params.client]
 */
export async function onKrsApproved({ krsId, userId, mahasiswa = null, totalSks = null, disetujuiOlehId = null, meta = {}, client = prisma }) {
  // TODO MVP-3: pembentukan Enrollment SPADA dari setiap KRSDetail kelas yang disetujui
  //             (hook `onKrsApproved` ini sudah disiapkan sebagai titik integrasi idempoten).
  // TODO MVP-6: kirim notifikasi "KRS Anda disetujui"
  await client.auditLog.create({
    data: {
      user_id: userId,
      action: 'KRS_APPROVED_EVENT',
      entity: 'krs',
      entity_id: krsId,
      new_values: {
        event: 'KRS_APPROVED',
        mahasiswa_id: mahasiswa?.id ?? null,
        nim: mahasiswa?.nim ?? null,
        status: 'DISETUJUI',
        total_sks: totalSks,
        disetujui_oleh_id: disetujuiOlehId,
      },
      ip_address: meta.ipAddress || null,
      user_agent: meta.userAgent || null,
    },
  });
}

/**
 * Hook: KRS dikembalikan untuk revisi (DIAJUKAN → DIKEMBALIKAN).
 * @param {Object} params
 * @param {string} params.krsId
 * @param {string} params.userId - user yang memicu (PA)
 * @param {Object} [params.mahasiswa]
 * @param {string} [params.catatan] - alasan revisi wajib
 * @param {Object} [params.meta]
 * @param {import('@prisma/client').PrismaClient} [params.client]
 */
export async function onKrsReturned({ krsId, userId, mahasiswa = null, catatan = null, meta = {}, client = prisma }) {
  // TODO MVP-6: kirim notifikasi "KRS Anda dikembalikan untuk revisi" + tautan catatan
  await client.auditLog.create({
    data: {
      user_id: userId,
      action: 'KRS_RETURNED_EVENT',
      entity: 'krs',
      entity_id: krsId,
      new_values: {
        event: 'KRS_RETURNED',
        mahasiswa_id: mahasiswa?.id ?? null,
        nim: mahasiswa?.nim ?? null,
        status: 'DIKEMBALIKAN',
        catatan_dosen: catatan,
      },
      ip_address: meta.ipAddress || null,
      user_agent: meta.userAgent || null,
    },
  });
}

export const krsEventHooks = { onKrsSubmitted, onKrsApproved, onKrsReturned };
