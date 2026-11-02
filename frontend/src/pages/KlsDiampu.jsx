/**
 * pages/KlsDiampu.jsx
 *
 * Halaman-level wrapper untuk Kelas Diampu (Dosen) SPADA LMS UPGRIS.
 */
import KlsDiampu from '../features/dosen/KlsDiampu';

export default function KlsDiampuPage({ onNavigate, onRoleChange }) {
  return <KlsDiampu onNavigate={onNavigate} onRoleChange={onRoleChange} />;
}
