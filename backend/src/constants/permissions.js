/**
 * Permission codes untuk SPADA LMS
 *
 * Catatan: Dengan 3-role enum, permission-based access control bersifat opsional.
 * File ini dipertahankan untuk backward-compatibility dan granularity di masa depan.
 * Permission KRS, Jadwal, Portal, Calendar, dan Role Management telah dihapus
 * sesuai revisi spesifikasi (BR-001, BR-002).
 */
export const PERMISSIONS = {
  // Autentikasi & Profil
  AUTH_LOGIN: 'auth:login',
  PROFILE_READ: 'profile:read',
  PROFILE_UPDATE: 'profile:update',

  // Admin — Manajemen Pengguna (FR-044)
  USER_MANAGE: 'user:manage',

  // Admin — Master Data (Courses & Classes)
  MASTER_ACADEMIC_READ: 'master:academic:read',
  MASTER_ACADEMIC_WRITE: 'master:academic:write',

  // Admin — Enrollment Mahasiswa (FR-047)
  ENROLLMENT_MANAGE: 'enrollment:manage',

  // Admin — Audit Log (FR-052)
  AUDIT_VIEW: 'audit:view',
};

export const ALL_PERMISSIONS = Object.values(PERMISSIONS);
