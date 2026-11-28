/**
 * Tipe notifikasi internal E-Learning Kampus (FR-057).
 *
 * Harus identik dengan enum `NotificationType` pada `prisma/schema.prisma`.
 */
export const NotificationType = Object.freeze({
  ASSIGNMENT_CREATED: 'ASSIGNMENT_CREATED',
  DEADLINE_REMINDER: 'DEADLINE_REMINDER',
  ATTENDANCE_OPENED: 'ATTENDANCE_OPENED',
  ATTENDANCE_UPDATED: 'ATTENDANCE_UPDATED',
  GRADE_PUBLISHED: 'GRADE_PUBLISHED',
  ENROLLMENT_CREATED: 'ENROLLMENT_CREATED',
  QUIZ_PUBLISHED: 'QUIZ_PUBLISHED',
});
