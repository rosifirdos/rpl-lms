/**
 * pages/ManajemenPengguna.jsx
 *
 * Halaman-level wrapper untuk Manajemen Pengguna E-Learning Kampus.
 * Menggunakan AppShell terpusat dengan RBAC enforcement.
 */
import ManajemenPengguna from '../features/admin/ManajemenPengguna';
import AppShell from '../components/AppShell';

export default function ManajemenPenggunaPage({ onRoleChange, activeNavPath, onNavChange, onNavigate }) {
  return (
    <AppShell
      activeRole="admin"
      onRoleChange={onRoleChange}
      activeNavPath={activeNavPath || "manajemen-pengguna"}
      onNavChange={onNavChange || onNavigate}
    >
      <ManajemenPengguna onRoleChange={onRoleChange} onNavigate={onNavChange || onNavigate} />
    </AppShell>
  );
}
