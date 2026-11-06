/**
 * Utility untuk format nama dosen dengan gelar
 * Mengkonsolidasikan logika yang ada di berbagai modul
 */

export function formatLecturerName(dosen) {
  if (!dosen) return null;

  const parts = [];

  // Gelar depan (Dr., Prof., dll)
  if (dosen.gelar_depan) {
    parts.push(dosen.gelar_depan);
  }

  // Nama dari user profile
  if (dosen.user?.profile?.full_name) {
    parts.push(dosen.user.profile.full_name);
  }

  // Gelar belakang (M.Kom., M.Sc., dll)
  if (dosen.gelar_belakang) {
    parts.push(dosen.gelar_belakang);
  }

  return parts.join(' ').trim();
}
