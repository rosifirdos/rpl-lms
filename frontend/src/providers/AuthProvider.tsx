/**
 * providers/AuthProvider.tsx
 *
 * Bootstrap sesi saat aplikasi dimuat (Bab 3.4):
 * - Bila refresh token ada di sessionStorage → `POST /auth/refresh`
 *   untuk menerbitkan access token baru, lalu status `authenticated`.
 * - Bila tidak ada / gagal → status `anonymous` TANPA error (pengguna
 *   cukup melihat halaman login).
 *
 * Selama `booting`, children belum dirender (splash minimal) agar guard
 * tidak salah mengarahkan pengguna yang sesinya masih dipulihkan.
 */

import { useEffect, type ReactNode } from 'react';
import { useAuthStore } from '../stores/authStore';
import { refreshSession } from '../services/http';

export function AuthProvider({ children }: { children: ReactNode }) {
  const status = useAuthStore((s) => s.status);

  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      const store = useAuthStore.getState();
      // Bersihkan sisa token localStorage dari implementasi lama.
      store.purgeLegacyStorage();

      if (!store.getStoredRefreshToken()) {
        store.setStatus('anonymous');
        return;
      }

      const tokens = await refreshSession();
      if (cancelled) return;

      if (tokens) {
        // Profil lengkap diambil Fase 1 (GET /profile); Fase 0 cukup sesi valid.
        store.setSession({
          user: {
            id: '',
            username: '',
            email: '',
            role: 'mahasiswa',
            name: '',
          },
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken ?? null,
        });
      } else {
        store.setStatus('anonymous');
      }
    }

    void bootstrap();
    return () => {
      cancelled = true;
    };
  }, []);

  if (status === 'booting') {
    return (
      <div
        role="status"
        aria-live="polite"
        className="min-h-screen flex items-center justify-center bg-background"
      >
        <div className="flex flex-col items-center gap-space-md">
          <div className="w-12 h-12 rounded-xl bg-primary-container flex items-center justify-center">
            <span className="material-symbols-outlined text-3xl text-on-primary-container animate-pulse">
              school
            </span>
          </div>
          <p className="font-label-md text-label-md text-on-surface-variant">Memuat sesi…</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
