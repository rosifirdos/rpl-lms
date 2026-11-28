/**
 * Konstanta konfigurasi sistem E-Learning Kampus (FR-049, FR-050).
 *
 * Tabel `system_configs` menyimpan nilai yang diubah Admin. Baris yang belum
 * ada berarti memakai `CONFIG_DEFAULTS` — sehingga default di sini HARUS
 * identik dengan perilaku yang sudah berjalan sebelum modul config ada.
 *
 * **Hard ceiling keamanan:** Admin hanya dapat memilih subset
 * `SAFE_DOCUMENT_EXTENSIONS`. Ekstensi berbahaya (`.exe`, `.sh`, `.php`,
 * `.js`, dll.) tidak pernah dapat diaktifkan melalui konfigurasi, dan batas
 * ukuran dokumen tetap terkunci pada rentang 5–10MB (FR-019, BR-008).
 */

/** Kunci konfigurasi yang dikenal sistem. */
export const CONFIG_KEYS = Object.freeze({
  FILE_ALLOWED_EXTENSIONS: 'file.allowed_extensions',
  FILE_MAX_SIZE_MB: 'file.max_size_mb',
  ATTENDANCE_THRESHOLD: 'attendance.threshold_percentage',
});

/**
 * Default perilaku sistem — identik dengan konstanta statis sebelum adanya
 * modul konfigurasi (lihat `STORAGE` pada `src/config/env.js` dan
 * `ACADEMIC.DEFAULT_ATTENDANCE_THRESHOLD`).
 */
export const CONFIG_DEFAULTS = Object.freeze({
  [CONFIG_KEYS.FILE_ALLOWED_EXTENSIONS]: ['.pdf', '.docx', '.xlsx', '.zip'],
  [CONFIG_KEYS.FILE_MAX_SIZE_MB]: 10,
  [CONFIG_KEYS.ATTENDANCE_THRESHOLD]: 70,
});

/**
 * Hard ceiling ekstensi dokumen yang aman (BR-007). Nilai konfigurasi Admin
 * wajib subset dari daftar ini.
 */
export const SAFE_DOCUMENT_EXTENSIONS = Object.freeze(['.pdf', '.docx', '.xlsx', '.zip']);

/** Rentang sah ukuran unggahan dokumen dalam MB (FR-019, BR-008). */
export const FILE_SIZE_LIMITS = Object.freeze({ MIN_MB: 5, MAX_MB: 10 });

/** Rentang sah ambang kehadiran ujian dalam persen (FR-050). */
export const ATTENDANCE_THRESHOLD_LIMITS = Object.freeze({ MIN: 0, MAX: 100 });

/** Umur cache in-memory konfigurasi (ms) sebelum dibaca ulang dari database. */
export const CONFIG_CACHE_TTL_MS = 30 * 1000;

const MEGABYTE = 1024 * 1024;

/** Ubah nilai MB menjadi byte. */
export function megabytesToBytes(megabytes) {
  return Math.round(megabytes * MEGABYTE);
}
