/**
 * Konvensi penamaan `audit_logs.entity` (Fase 0 MVP 2)
 *
 * Sumber kebenaran tunggal untuk nilai kolom `entity` pada tabel `audit_logs`.
 *
 * **Aturan:** huruf kecil, jamak, tanpa spasi — mengikuti nama tabel Prisma
 * (`@@map`) pada MVP 1: `users`, `classes`, `courses`, `enrollments`.
 *
 * Alasan aturan ini tidak boleh dilanggar:
 *   1. `GET /api/admin/audit-logs?entity=` menerapkan filter
 *      `contains ... insensitive` (lihat `AuditLogService.findAll`), sehingga
 *      penamaan yang tidak seragam (`Meeting`, `meeting`, `meetings`) membuat
 *      hasil filter tidak lengkap dan jejak audit sulit diaudit ulang.
 *   2. `AuditLogService.record` menurunkan `entity` menjadi huruf kecil, jadi
 *      nilai huruf besar pada kode pemanggil hanya tersimpan kebetulan dan
 *      menyembunyikan ketidakkonsistenan sampai ada filter yang dipakai.
 *   3. Modul MVP 2 dikerjakan paralel oleh beberapa orang; satu konstanta ini
 *      mencegah empat varian penamaan yang berbeda.
 *
 * Modul MVP 2 **wajib** memakai konstanta di bawah alih-alih literal string,
 * sehingga penamaan baru hanya ditambahkan di satu tempat.
 */
export const AUDIT_ENTITIES = {
  // MVP 1
  USERS: 'users',
  AUTH: 'auth',
  COURSES: 'courses',
  CLASSES: 'classes',
  ENROLLMENTS: 'enrollments',

  // MVP 2 (Fase 2–5)
  MEETINGS: 'meetings',
  MATERIALS: 'materials',
  ATTENDANCE_SESSIONS: 'attendance_sessions',
  ATTENDANCE_RECORDS: 'attendance_records',
};

/**
 * Daftar nilai `entity` yang sah — dipakai untuk validasi filter
 * `GET /api/admin/audit-logs?entity=` dan dokumentasi OpenAPI.
 */
export const AUDIT_ENTITY_VALUES = Object.values(AUDIT_ENTITIES);

/**
 * Normalisasi nilai `entity` ke konvensi kanonik.
 *
 * Fungsi ini sengaja tidak "menebak" bentuk jamak; ia hanya menormalkan
 * kapitalisasi agar pemanggil yang keliru huruf besar tidak menghasilkan
 * entri audit yang tidak dapat ditemukan melalui filter.
 *
 * @param {string} entity nilai mentah
 * @returns {string} nilai sesuai konvensi (huruf kecil)
 */
export function normalizeAuditEntity(entity) {
  return String(entity ?? '').trim().toLowerCase();
}

/**
 * Apakah nilai `entity` termasuk konvensi yang disepakati?
 *
 * @param {string} entity nilai mentah
 * @returns {boolean}
 */
export function isKnownAuditEntity(entity) {
  return AUDIT_ENTITY_VALUES.includes(normalizeAuditEntity(entity));
}