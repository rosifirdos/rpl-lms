/**
 * pages/ManajemenPengguna.jsx
 *
 * Halaman-level wrapper untuk Manajemen Pengguna SPADA LMS UPGRIS.
 * Menggunakan AppShell terpusat dengan RBAC enforcement.
 */
import ManajemenPengguna from '../features/admin/ManajemenPengguna';

export default function ManajemenPenggunaPage({ onRoleChange }) {
  return (
    <AppShell
      activeRole="admin"
      onRoleChange={onRoleChange}
      activeNavPath="manajemen-pengguna"
    >
      <ManajemenPengguna onRoleChange={onRoleChange} />
    </AppShell>
  );
}