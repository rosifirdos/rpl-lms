/**
 * pages/UnggahMateri.jsx
 *
 * Halaman-level wrapper untuk Unggah Materi Pembelajaran (Dosen) SPADA LMS UPGRIS.
 */
import UnggahMateri from '../features/dosen/UnggahMateri';

export default function UnggahMateriPage({ onNavigate, onRoleChange }) {
  return <UnggahMateri onNavigate={onNavigate} onRoleChange={onRoleChange} />;
}
