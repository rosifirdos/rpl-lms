/**
 * pages/DaftarHadirKoreksi.jsx
 *
 * Halaman-level wrapper untuk Daftar Hadir & Koreksi Presensi (Dosen) E-Learning Kampus.
 */
import DaftarHadirKoreksi from '../features/dosen/DaftarHadirKoreksi';

export default function DaftarHadirKoreksiPage({ onNavigate, onRoleChange }) {
  return <DaftarHadirKoreksi onNavigate={onNavigate} onRoleChange={onRoleChange} />;
}
