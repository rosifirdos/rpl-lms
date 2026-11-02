/**
 * pages/RekapKehadiran.jsx
 *
 * Halaman-level wrapper untuk Matriks Rekapitulasi Presensi 16 Pertemuan (BR-012) SPADA LMS UPGRIS.
 */
import RekapKehadiran from '../features/akademik/RekapKehadiran';

export default function RekapKehadiranPage({ onNavigate, onRoleChange }) {
  return <RekapKehadiran onNavigate={onNavigate} onRoleChange={onRoleChange} />;
}
