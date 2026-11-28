/**
 * types/auth.ts
 *
 * Tipe sesi & pengguna mengikuti kontrak backend (auth.service.js):
 * login mengembalikan `{ accessToken, refreshToken, user }` dengan user
 * berbentuk `{ id, username, email, status, role, profile, mahasiswa, dosen }`.
 * Role memakai enum lowercase Prisma: `mahasiswa | dosen | admin`.
 */

export type Role = 'mahasiswa' | 'dosen' | 'admin';
export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';

/** Bentuk user mentah dari backend (login / GET /profile). */
export interface BackendUser {
  id: string;
  username: string;
  email: string;
  status: UserStatus;
  role: Role;
  profile?: {
    full_name?: string | null;
    phone?: string | null;
    bio?: string | null;
    avatar_file?: {
      id: string;
      original_name: string;
      mime_type: string;
      size_bytes: number;
    } | null;
  } | null;
  mahasiswa?: { nim: string; prodi: string; angkatan: number } | null;
  dosen?: { nidn?: string | null; nip?: string | null; gelar_depan?: string | null; gelar_belakang?: string | null } | null;
}

/** User ternormalisasi yang dipakai UI (authStore). */
export interface AuthUser {
  id: string;
  username: string;
  email: string;
  role: Role;
  /** Nama lengkap dari `profile.full_name`; dipertahankan sebagai `name` untuk kompatibilitas komponen lama. */
  name: string;
  /** NIM / NIDN / NIP tergantung peran. */
  identifier?: string;
  /** ID berkas avatar (blob terautentikasi via GET /profile/avatar). */
  avatarFileId?: string | null;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginResponseData {
  accessToken: string;
  refreshToken: string;
  user: BackendUser;
}

export interface RefreshResponseData {
  accessToken: string;
}

export interface ValidateResetTokenResponse {
  valid: boolean;
  expires_at: string;
}
