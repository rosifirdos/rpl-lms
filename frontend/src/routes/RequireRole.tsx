/**
 * routes/RequireRole.tsx
 *
 * Guard peran (Bab 3.5): rute dibungkus `RequireRole roles={['admin']}`;
 * peran tidak sesuai → `/403`. Navigasi sidebar dibangkitkan dari matriks
 * peran, bukan dari state UI yang dapat dimanipulasi.
 */

import { Navigate, Outlet } from 'react-router-dom';
import type { Role } from '../types/auth';
import { useAuthStore } from '../stores/authStore';

export function RequireRole({ roles }: { roles: Role[] }) {
  const status = useAuthStore((s) => s.status);
  const role = useAuthStore((s) => s.getCurrentRole());

  if (status === 'booting') {
    return (
      <div role="status" className="min-h-screen flex items-center justify-center bg-background">
        <p className="font-label-md text-label-md text-on-surface-variant">Memeriksa sesi…</p>
      </div>
    );
  }

  if (!roles.includes(role)) {
    return <Navigate to="/403" replace />;
  }

  return <Outlet />;
}
