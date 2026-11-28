/**
 * Konstanta kuis interaktif E-Learning Kampus (FR-025, FR-040–FR-041).
 *
 * Timer kuis ditegakkan penuh di sisi server: `started_at`, `deadline_at`,
 * dan `submitted_at` seluruhnya dihitung backend — klien tidak pernah
 * menjadi sumber kebenaran waktu.
 */

/** Rentang durasi kuis dalam menit. */
export const QUIZ_DURATION_LIMITS = Object.freeze({ MIN_MINUTES: 1, MAX_MINUTES: 180 });

/** Rentang poin per soal (2 desimal, disimpan Decimal(5,2)). */
export const QUIZ_POINTS_LIMITS = Object.freeze({ MIN: 0.01, MAX: 100 });

/** Rentang jumlah opsi untuk soal pilihan ganda. */
export const QUIZ_OPTION_LIMITS = Object.freeze({ MIN: 2, MAX: 10 });

/** Rentang jumlah soal per kuis. */
export const QUIZ_QUESTION_LIMITS = Object.freeze({ MIN: 1, MAX: 100 });

/** Skor kuis disimpan sebagai persentase 0–100 dengan 2 desimal. */
export const QUIZ_SCORE_SCALE = Object.freeze({ MIN: 0, MAX: 100, DECIMALS: 2 });

/**
 * Status percobaan kuis.
 *
 *   - IN_PROGRESS : mahasiswa masih mengerjakan (sebelum submit).
 *   - SUBMITTED   : dikumpulkan, menunggu penilaian esai (bila ada).
 *   - GRADED      : seluruh soal telah dinilai (skor final terisi).
 */
export const QUIZ_ATTEMPT_STATUS = Object.freeze({
  IN_PROGRESS: 'IN_PROGRESS',
  SUBMITTED: 'SUBMITTED',
  GRADED: 'GRADED',
});

/** Tipe soal kuis. */
export const QUIZ_QUESTION_TYPES = Object.freeze({
  MULTIPLE_CHOICE: 'MULTIPLE_CHOICE',
  ESSAY: 'ESSAY',
});

/**
 * Bulatkan angka ke 2 desimal (skor kuis) dan kembalikan Number agar
 * serialisasi JSON tidak mengubah Decimal menjadi string.
 *
 * @param {number|string|bigint} value
 * @returns {number}
 */
export function roundQuizScore(value) {
  return Number(Number(value).toFixed(QUIZ_SCORE_SCALE.DECIMALS));
}
