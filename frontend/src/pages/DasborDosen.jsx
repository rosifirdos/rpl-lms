/**
 * pages/DasborDosen.jsx
 *
 * Halaman-level wrapper untuk rute /dosen atau dasbor peran dosen.
 * Menggunakan fitur komponen dari features/dosen/DasborDosen.
 */
import DasborDosen from '../features/dosen/DasborDosen';

export default function DasborDosenPage({ onRoleChange, onNavigate }) {
  return <DasborDosen onRoleChange={onRoleChange} onNavigate={onNavigate} />;
}
