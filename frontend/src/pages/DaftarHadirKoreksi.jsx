/**
 * pages/DaftarHadirKoreksi.jsx
 *
 * Halaman-level wrapper untuk Daftar Hadir & Koreksi Presensi (Dosen) SPADA LMS UPGRIS.
 */
import DaftarHadirKoreksi from '../features/dosen/DaftarHadirKoreksi';

export default function DaftarHadirKoreksiPage({ onNavigate, onRoleChange }) {
  return <DaftarHadirKoreksi onNavigate={onNavigate} onRoleChange={onRoleChange} />;
}
