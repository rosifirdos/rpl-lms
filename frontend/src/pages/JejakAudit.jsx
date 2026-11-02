/**
 * pages/JejakAudit.jsx
 *
 * Halaman-level wrapper untuk Jejak Audit SPADA LMS UPGRIS.
 * Menggunakan AppShell terpusat dengan RBAC enforcement.
 */
import JejakAudit from '../features/admin/JejakAudit';
import AppShell from '../components/AppShell';

export default function JejakAuditPage({ onRoleChange, activeNavPath, onNavChange }) {
  return (
    <AppShell
      activeRole="admin"
      onRoleChange={onRoleChange}
      activeNavPath={activeNavPath || "jejak-audit"}
      onNavChange={onNavChange}
    >
      <JejakAudit onRoleChange={onRoleChange} />
    </AppShell>
  );
}