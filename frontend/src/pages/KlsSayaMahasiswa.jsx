/**
 * pages/KlsSayaMahasiswa.jsx
 *
 * Halaman-level wrapper untuk Kelas Saya (Mahasiswa) SPADA LMS UPGRIS.
 */
import KlsSayaMahasiswa from '../features/mahasiswa/KlsSayaMahasiswa';

export default function KlsSayaMahasiswaPage({ onNavigate, onRoleChange }) {
  return <KlsSayaMahasiswa onNavigate={onNavigate} onRoleChange={onRoleChange} />;
}
