/**
 * pages/KelolaKls.jsx
 *
 * Halaman-level wrapper untuk Kelola Ruang Kelas (Dosen) E-Learning Kampus.
 */
import KelolaKls from '../features/dosen/KelolaKls';

export default function KelolaKlsPage({ onNavigate, onRoleChange, courseId }) {
  return (
    <KelolaKls
      onNavigate={onNavigate}
      onRoleChange={onRoleChange}
      courseId={courseId}
    />
  );
}
