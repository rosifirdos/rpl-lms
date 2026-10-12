/**
 * Peran pengguna SPADA LMS (SRS Bab 3 — Role Tunggal)
 *
 * Tiga peran resmi (IMPLEMENTATION_PLAN_MVP1_BACKEND.md Bab 3 & SRS Bab 13):
 *   - mahasiswa  : peserta didik yang terdaftar pada kelas SPADA
 *   - dosen      : tenaga pendidik pengampu kelas
 *   - admin      : pengelola teknis & operasional (role tunggal)
 */
export const ROLES = {
  ADMIN: 'admin',
  DOSEN: 'dosen',
  MAHASISWA: 'mahasiswa',
};

export const ALL_ROLES = Object.values(ROLES);

/**
 * Label peran untuk tampilan antarmuka (SRS Bab 3)
 */
export const ROLE_LABELS = {
  admin: 'Admin',
  dosen: 'Dosen',
  mahasiswa: 'Mahasiswa',
};
