export const PERMISSIONS = {
  AUTH_LOGIN: 'auth:login',
  PROFILE_READ: 'profile:read',
  PROFILE_UPDATE: 'profile:update',
  PORTAL_VIEW: 'portal:view',
  USER_MANAGE: 'user:manage',
  ROLE_MANAGE: 'role:manage',
  MASTER_ACADEMIC_READ: 'master:academic:read',
  MASTER_ACADEMIC_WRITE: 'master:academic:write',
  CALENDAR_VIEW: 'calendar:view',
  CALENDAR_MANAGE: 'calendar:manage',
  AUDIT_VIEW: 'audit:view',

  // MVP 2 - KRS (SRS FR-022 s/d FR-103)
  KRS_SUBMIT: 'krs:submit',          // Mahasiswa: submit KRS, tambah/hapus draft
  KRS_APPROVE: 'krs:approve',        // Dosen Wali/PA: approve/return KRS
  KRS_MANAGE: 'krs:manage',          // Admin Akademik: kelola periode & monitor

  // MVP 2 - Jadwal (SRS FR-100 s/d FR-101)
  JADWAL_VIEW: 'jadwal:view',        // Semua role logged-in: lihat jadwal
  JADWAL_MANAGE: 'jadwal:manage',    // Admin Akademik: buat/edit jadwal
};

export const ALL_PERMISSIONS = Object.values(PERMISSIONS);
