/**
 * pages/RuangKls.jsx
 *
 * Halaman-level wrapper untuk Ruang Kelas Mahasiswa (16 Pertemuan) SPADA LMS UPGRIS.
 */
import RuangKls from '../features/mahasiswa/RuangKls';

export default function RuangKlsPage({ onNavigate, onRoleChange, courseId }) {
  return <RuangKls onNavigate={onNavigate} onRoleChange={onRoleChange} courseId={courseId} />;
}
