/**
 * Utility untuk format nama dosen dengan gelar
 * Mengkonsolidasikan logika yang ada di berbagai modul dan mencegah duplikasi gelar
 */

export function formatLecturerName(dosen) {
  if (!dosen) return null;

  let baseName = dosen.user?.profile?.full_name?.trim() || '';
  const gelarDepan = dosen.gelar_depan?.trim() || '';
  const gelarBelakang = dosen.gelar_belakang?.trim() || '';

  // Jika nama dasar sudah memuat gelar depan di awal, jangan tambahkan duplikat
  if (gelarDepan && baseName.startsWith(gelarDepan)) {
    baseName = baseName.slice(gelarDepan.length).trim();
  }

  // Jika nama dasar sudah memuat gelar belakang di akhir, jangan tambahkan duplikat
  if (gelarBelakang && baseName.endsWith(gelarBelakang)) {
    baseName = baseName.slice(0, -gelarBelakang.length).trim();
    baseName = baseName.replace(/,\s*$/, '').trim();
  }

  const parts = [];
  if (gelarDepan) parts.push(gelarDepan);
  if (baseName) parts.push(baseName);
  let result = parts.join(' ').trim();

  if (gelarBelakang) {
    result = result ? `${result}, ${gelarBelakang}` : gelarBelakang;
  }

  return result || null;
}
