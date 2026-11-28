import prisma from '../../config/prisma.js';
import { NotificationType } from '../../constants/notifications.js';

/**
 * Template pesan notifikasi internal (FR-057).
 *
 * Setiap builder menghasilkan `{ title, message, link }` siap simpan. Fungsi
 * template tidak pernah melakukan akses database agar mudah diuji.
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

/** Tugas baru diterbitkan (tugas langsung terbit saat dibuat). */
export function buildAssignmentCreatedNotification({ assignmentTitle, dueDate, className }) {
  return {
    type: NotificationType.ASSIGNMENT_CREATED,
    title: 'Tugas baru diterbitkan',
    message: `Tugas "${assignmentTitle}" pada kelas ${className} telah diterbitkan. Batas pengumpulan ${formatDateTime(dueDate)}.`,
    link: null,
  };
}

/** Tugas draft diubah menjadi terbit. */
export function buildAssignmentPublishedNotification({ assignmentTitle, dueDate, className }) {
  return {
    type: NotificationType.ASSIGNMENT_CREATED,
    title: 'Tugas baru diterbitkan',
    message: `Tugas "${assignmentTitle}" pada kelas ${className} kini telah diterbitkan. Batas pengumpulan ${formatDateTime(dueDate)}.`,
    link: null,
  };
}

/** Pengingat H-1 sebelum deadline tugas. */
export function buildDeadlineReminderNotification({ assignmentTitle, dueDate }) {
  return {
    type: NotificationType.DEADLINE_REMINDER,
    title: 'Pengingat deadline tugas',
    message: `Tugas "${assignmentTitle}" akan berakhir dalam 24 jam (${formatDateTime(dueDate)}). Segera kumpulkan jawaban Anda.`,
    link: null,
  };
}

/** Sesi presensi dibuka oleh dosen. */
export function buildAttendanceOpenedNotification({ meetingTitle, className }) {
  return {
    type: NotificationType.ATTENDANCE_OPENED,
    title: 'Presensi dibuka',
    message: `Sesi presensi untuk pertemuan "${meetingTitle}" pada kelas ${className} telah dibuka. Segera lakukan check-in.`,
    link: null,
  };
}

/** Status presensi mahasiswa dikoreksi dosen. */
export function buildAttendanceUpdatedNotification({ meetingTitle, newStatus }) {
  return {
    type: NotificationType.ATTENDANCE_UPDATED,
    title: 'Status presensi diperbarui',
    message: `Status presensi Anda pada pertemuan "${meetingTitle}" telah diperbarui menjadi ${newStatus}.`,
    link: null,
  };
}

/** Skor tugas dirilis dosen. */
export function buildGradePublishedNotification({ assignmentTitle, score }) {
  return {
    type: NotificationType.GRADE_PUBLISHED,
    title: 'Nilai tugas dirilis',
    message: `Nilai tugas "${assignmentTitle}" telah dirilis: ${score} / 100.`,
    link: null,
  };
}

/** Mahasiswa didaftarkan ke kelas baru. */
export function buildEnrollmentCreatedNotification({ className, courseName }) {
  return {
    type: NotificationType.ENROLLMENT_CREATED,
    title: 'Anda terdaftar pada kelas baru',
    message: `Anda telah didaftarkan pada kelas ${className} (${courseName}). Selamat belajar!`,
    link: null,
  };
}

/** Kuis diterbitkan dosen. */
export function buildQuizPublishedNotification({ quizTitle, closeAt, className }) {
  return {
    type: NotificationType.QUIZ_PUBLISHED,
    title: 'Kuis baru diterbitkan',
    message: `Kuis "${quizTitle}" pada kelas ${className} telah diterbitkan. Kerjakan sebelum ${formatDateTime(closeAt)}.`,
    link: null,
  };
}
