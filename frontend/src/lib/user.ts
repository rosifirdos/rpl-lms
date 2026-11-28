/**
 * lib/user.ts
 *
 * Normalisasi user backend → AuthUser untuk UI.
 * `name` diisi dari `profile.full_name` (fallback username) dan `identifier`
 * dari NIM (mahasiswa) atau NIDN/NIP (dosen) agar komponen shell lama yang
 * membaca `user.name` / `user.identifier` tetap berfungsi.
 */

import type { AuthUser, BackendUser } from '../types/auth';

export function normalizeBackendUser(raw: BackendUser): AuthUser {
  return {
    id: raw.id,
    username: raw.username,
    email: raw.email,
    role: raw.role,
    name: raw.profile?.full_name?.trim() || raw.username,
    identifier:
      raw.mahasiswa?.nim ??
      raw.dosen?.nidn ??
      raw.dosen?.nip ??
      undefined,
    avatarFileId: raw.profile?.avatar_file?.id ?? null,
  };
}
