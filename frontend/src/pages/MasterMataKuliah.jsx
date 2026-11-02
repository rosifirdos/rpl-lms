/**
 * pages/MasterMataKuliah.jsx
 *
 * Halaman-level wrapper untuk Master Mata Kuliah SPADA LMS UPGRIS.
 * Menggunakan AppShell terpusat dengan RBAC enforcement.
 */
import MasterMataKuliah from '../features/admin/MasterMataKuliah';
import AppShell from '../components/AppShell';

export default function MasterMataKuliahPage({ onRoleChange, activeNavPath, onNavChange }) {
  return (
    <AppShell
      activeRole="admin"
      onRoleChange={onRoleChange}
      activeNavPath={activeNavPath || "master-mata-kuliah"}
      onNavChange={onNavChange}
    >
      <MasterMataKuliah onRoleChange={onRoleChange} />
    </AppShell>
  );
}