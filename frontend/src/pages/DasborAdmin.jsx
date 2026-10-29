/**
 * pages/DasborAdmin.jsx
 *
 * Halaman-level wrapper untuk Dasbor Administrator SPADA LMS UPGRIS.
 * Membungkus komponen fitur dari features/admin/DasborAdmin.
 */
import DasborAdmin from '../features/admin/DasborAdmin';

export default function DasborAdminPage({ onRoleChange }) {
  return <DasborAdmin onRoleChange={onRoleChange} />;
}
