/**
 * pages/PanduanBelajar.jsx
 *
 * Halaman-level wrapper untuk Panduan Belajar & Petunjuk Mahasiswa E-Learning Kampus.
 */
import PanduanBelajar from '../features/mahasiswa/PanduanBelajar';

export default function PanduanBelajarPage({ onNavigate, onRoleChange, activeRole }) {
  return (
    <PanduanBelajar
      onNavigate={onNavigate}
      onRoleChange={onRoleChange}
      activeRole={activeRole || 'mahasiswa'}
    />
  );
}
