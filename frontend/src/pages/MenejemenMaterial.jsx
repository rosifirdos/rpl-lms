/**
 * pages/MenejemenMaterial.jsx
 *
 * Halaman-level wrapper untuk Manajemen Materi Pembelajaran (Dosen) SPADA LMS UPGRIS.
 */
import MenejemenMaterial from '../features/dosen/MenejemenMaterial';

export default function MenejemenMaterialPage({ onNavigate, onRoleChange }) {
  return <MenejemenMaterial onNavigate={onNavigate} onRoleChange={onRoleChange} />;
}
