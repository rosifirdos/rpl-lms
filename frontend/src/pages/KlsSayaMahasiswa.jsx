/**
 * pages/KlsSayaMahasiswa.jsx
 *
 * Halaman-level wrapper untuk Kelas Saya (Mahasiswa) E-Learning Kampus.
 */
import KlsSayaMahasiswa from '../features/mahasiswa/KlsSayaMahasiswa';

export default function KlsSayaMahasiswaPage({ onNavigate, onRoleChange }) {
  return <KlsSayaMahasiswa onNavigate={onNavigate} onRoleChange={onRoleChange} />;
}
