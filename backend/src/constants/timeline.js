/**
 * Konstanta Central Timeline E-Learning Kampus (FR-009–FR-012, BR-013).
 *
 * Timeline bersifat kronologis berbasis waktu server (BR-013): seluruh
 * perbandingan waktu dilakukan backend, klien hanya merender.
 */

/** Jenis item timeline yang disediakan endpoint `GET /api/timeline`. */
export const TIMELINE_TYPES = Object.freeze({
  ASSIGNMENT: 'ASSIGNMENT',
  QUIZ: 'QUIZ',
  MEETING: 'MEETING',
  EXAM: 'EXAM',
});

/** Seluruh nilai jenis timeline yang sah untuk filter query `types`. */
export const TIMELINE_TYPE_VALUES = Object.freeze(Object.values(TIMELINE_TYPES));

/** Default jendela waktu timeline: dari sekarang hingga N hari ke depan. */
export const TIMELINE_DEFAULT_WINDOW_DAYS = 30;

/** Rentang jumlah item maksimum per permintaan. */
export const TIMELINE_LIMITS = Object.freeze({ MIN: 1, MAX: 100, DEFAULT: 50 });

/**
 * Status item timeline relatif terhadap waktu server.
 *
 *   - UPCOMING : belum dimulai (starts_at di masa depan).
 *   - ONGOING  : sedang berlangsung (khusus kuis: jendela open–close).
 *   - OVERDUE  : tenggat telah lewat namun item relevan (tugas belum due).
 *   - PAST     : telah selesai/berlalu.
 */
export const TIMELINE_ITEM_STATUS = Object.freeze({
  UPCOMING: 'UPCOMING',
  ONGOING: 'ONGOING',
  OVERDUE: 'OVERDUE',
  PAST: 'PAST',
});
