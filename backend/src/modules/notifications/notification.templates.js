import { NotificationType } from '../../constants/notifications.js';

/**
 * Template pesan notifikasi internal (FR-057).
 *
 * Setiap builder menghasilkan `{ title, message, link }` siap simpan. Fungsi
 * template tidak pernah melakukan akses database agar mudah diuji.
 *
 * R-09: setiap notifikasi membawa deep-link yang mengikuti konvensi path
 * timeline (`/classes/:classId/...`) agar dapat langsung dinavigasi frontend.
 * Bila ID terkait tidak tersedia, `link` jatuh ke `null` (perilaku lama).
 */

/** Format tanggal-waktu singkat berbahasa Indonesia untuk pesan notifikasi. */
function formatDateTime(value) {
  return new Date(value).toLocaleString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/** Deep-link detail tugas pada sebuah kelas. */
function assignmentLink(classId, assignmentId) {
  return classId && assignmentId ? `/classes/${classId}/assignments/${assignmentId}` : null;
}

/** Tugas baru diterbitkan (tugas langsung terbit saat dibuat). */
export function buildAssignmentCreatedNotification({
  assignmentTitle,
  dueDate,
  className,
  classId,
  assignmentId,
}) {
  return {
    type: NotificationType.ASSIGNMENT_CREATED,
    title: 'Tugas baru diterbitkan',
    message: `Tugas "${assignmentTitle}" pada kelas ${className} telah diterbitkan. Batas pengumpulan ${formatDateTime(dueDate)}.`,
    link: assignmentLink(classId, assignmentId),
  };
}

/** Tugas draft diubah menjadi terbit. */
export function buildAssignmentPublishedNotification({
  assignmentTitle,
  dueDate,
  className,
  classId,
  assignmentId,
}) {
  return {
    type: NotificationType.ASSIGNMENT_CREATED,
    title: 'Tugas baru diterbitkan',
    message: `Tugas "${assignmentTitle}" pada kelas ${className} kini telah diterbitkan. Batas pengumpulan ${formatDateTime(dueDate)}.`,
    link: assignmentLink(classId, assignmentId),
  };
}

/** Pengingat H-1 sebelum deadline tugas. */
export function buildDeadlineReminderNotification({
  assignmentTitle,
  dueDate,
  classId,
  assignmentId,
}) {
  return {
    type: NotificationType.DEADLINE_REMINDER,
    title: 'Pengingat deadline tugas',
    message: `Tugas "${assignmentTitle}" akan berakhir dalam 24 jam (${formatDateTime(dueDate)}). Segera kumpulkan jawaban Anda.`,
    link: assignmentLink(classId, assignmentId),
  };
}

/** Sesi presensi dibuka oleh dosen. */
export function buildAttendanceOpenedNotification({ meetingTitle, className, classId }) {
  return {
    type: NotificationType.ATTENDANCE_OPENED,
    title: 'Presensi dibuka',
    message: `Sesi presensi untuk pertemuan "${meetingTitle}" pada kelas ${className} telah dibuka. Segera lakukan check-in.`,
    link: classId ? `/classes/${classId}/meetings` : null,
  };
}

/** Status presensi mahasiswa dikoreksi dosen. */
export function buildAttendanceUpdatedNotification({ meetingTitle, newStatus, classId }) {
  return {
    type: NotificationType.ATTENDANCE_UPDATED,
    title: 'Status presensi diperbarui',
    message: `Status presensi Anda pada pertemuan "${meetingTitle}" telah diperbarui menjadi ${newStatus}.`,
    link: classId ? `/classes/${classId}/meetings` : null,
  };
}

/** Skor tugas dirilis dosen. */
export function buildGradePublishedNotification({
  assignmentTitle,
  score,
  classId,
  assignmentId,
}) {
  return {
    type: NotificationType.GRADE_PUBLISHED,
    title: 'Nilai tugas dirilis',
    message: `Nilai tugas "${assignmentTitle}" telah dirilis: ${score} / 100.`,
    link: assignmentLink(classId, assignmentId),
  };
}

/** Mahasiswa didaftarkan ke kelas baru. */
export function buildEnrollmentCreatedNotification({
  className,
  courseName,
  courseCode,
  classId,
}) {
  return {
    type: NotificationType.ENROLLMENT_CREATED,
    title: 'Anda terdaftar pada kelas baru',
    // R-07: pesan memuat NAMA mata kuliah (kode hanya pelengkap), bukan
    // sebaliknya, agar mahasiswa mengenali kelasnya.
    message: `Anda telah didaftarkan pada kelas ${className} (${courseName}${courseCode ? ` – ${courseCode}` : ''}). Selamat belajar!`,
    link: classId ? `/classes/${classId}` : null,
  };
}

/** Kuis diterbitkan dosen. */
export function buildQuizPublishedNotification({ quizTitle, closeAt, className, classId, quizId }) {
  return {
    type: NotificationType.QUIZ_PUBLISHED,
    title: 'Kuis baru diterbitkan',
    message: `Kuis "${quizTitle}" pada kelas ${className} telah diterbitkan. Kerjakan sebelum ${formatDateTime(closeAt)}.`,
    link: classId && quizId ? `/classes/${classId}/quizzes/${quizId}` : null,
  };
}
