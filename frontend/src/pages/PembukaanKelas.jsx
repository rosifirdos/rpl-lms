/**
 * pages/PembukaanKelas.jsx
 *
 * Halaman-level wrapper untuk Pembukaan Kelas E-Learning Kampus.
 * Menggunakan AppShell terpusat dengan RBAC enforcement.
 */
import PembukaanKelas from '../features/admin/PembukaanKelas';
import AppShell from '../components/AppShell';

export default function PembukaanKelasPage({ onRoleChange, activeNavPath, onNavChange }) {
  return (
    <AppShell
      activeRole="admin"
      onRoleChange={onRoleChange}
      activeNavPath={activeNavPath || "pembukaan-kelas"}
      onNavChange={onNavChange}
    >
      <PembukaanKelas onRoleChange={onRoleChange} />
    </AppShell>
  );
}