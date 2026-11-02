/**
 * pages/DirectEnrollment.jsx
 *
 * Halaman-level wrapper untuk Direct Enrollment Mahasiswa SPADA LMS UPGRIS.
 * Menggunakan AppShell terpusat dengan RBAC enforcement.
 */
import DirectEnrollment from '../features/admin/DirectEnrollment';
import AppShell from '../components/AppShell';

export default function DirectEnrollmentPage({ onRoleChange, activeNavPath, onNavChange }) {
  return (
    <AppShell
      activeRole="admin"
      onRoleChange={onRoleChange}
      activeNavPath={activeNavPath || "direct-enrollment"}
      onNavChange={onNavChange}
    >
      <DirectEnrollment onRoleChange={onRoleChange} />
    </AppShell>
  );
}