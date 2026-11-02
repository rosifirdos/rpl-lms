/**
 * pages/KelolaKls.jsx
 *
 * Halaman-level wrapper untuk Kelola Ruang Kelas (Dosen) SPADA LMS UPGRIS.
 */
import KelolaKls from '../features/dosen/KelolaKls';

export default function KelolaKlsPage({ onNavigate, onRoleChange }) {
  return <KelolaKls onNavigate={onNavigate} onRoleChange={onRoleChange} />;
}
