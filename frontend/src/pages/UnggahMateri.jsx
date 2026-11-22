/**
 * pages/UnggahMateri.jsx
 *
 * Halaman-level wrapper untuk Unggah Materi Pembelajaran (Dosen) E-Learning Kampus.
 */
import UnggahMateri from '../features/dosen/UnggahMateri';

export default function UnggahMateriPage({ onNavigate, onRoleChange }) {
  return <UnggahMateri onNavigate={onNavigate} onRoleChange={onRoleChange} />;
}
