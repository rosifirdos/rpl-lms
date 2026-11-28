/**
 * types/auth.ts
 *
 * Tipe sesi & pengguna mengikuti kontrak `POST /auth/login` OpenAPI v1.4.1
 * (respons camelCase: accessToken / refreshToken / user).
 */

export type Role = 'mahasiswa' | 'dosen' | 'admin';

export interface AuthUser {
  id: string;
  username: string;
  email: string;
  role: Role;
  /** Nama lengkap dari `profile.full_name`; dipertahankan sebagai `name` untuk kompatibilitas komponen lama. */
  name: string;
  /** NIM / NIDN / NIP tergantung peran. */
  identifier?: string;
  avatarUrl?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginResponseData {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
}

export interface RefreshResponseData {
  accessToken: string;
  refreshToken?: string;
  user?: AuthUser;
}
