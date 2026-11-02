import { useState } from 'react';
import StatusPresensi from '../features/mahasiswa/StatusPresensi';

/**
 * pages/StatusPresensi.jsx
 *
 * Page wrapper untuk tampilan Status Presensi Mahasiswa (FR-023 / FR-024).
 * Menggunakan AppShell terpusat dengan RBAC enforcement.
 */
export default function StatusPresensiPage({ onRoleChange, onNavigate }) {
  return (
    <StatusPresensi onNavigate={onNavigate} onRoleChange={onRoleChange} />
  );
}