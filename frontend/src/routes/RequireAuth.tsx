/**
 * routes/RequireAuth.tsx
 *
 * Guard seluruh rute privat (Bab 3.5): sesi `anonymous` diarahkan ke
 * `/login` sambil menyimpan lokasi asal agar bisa kembali setelah login.
 * Status `booting` menampilkan splash agar tidak salah redirect.
 */

import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';

export function RequireAuth() {
  const status = useAuthStore((s) => s.status);
  const location = useLocation();

  if (status === 'booting') {
    return (
      <div role="status" className="min-h-screen flex items-center justify-center bg-background">
        <p className="font-label-md text-label-md text-on-surface-variant">Memeriksa sesi…</p>
      </div>
    );
  }

  if (status === 'anonymous') {
    return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />;
  }

  return <Outlet />;
}
