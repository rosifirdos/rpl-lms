/**
 * providers/AuthProvider.tsx
 *
 * Pemilik siklus hidup sesi (Bab 3.4):
 * - Bootstrap saat aplikasi dimuat: refresh token di sessionStorage →
 *   `POST /auth/refresh` → `GET /profile` → sesi terisi; gagal → login
 *   tanpa error.
 * - `login(identifier, password)`: `POST /auth/login`, simpan sesi,
 *   lalu pemanggil menentukan tujuan navigasi.
 * - `logout()`: `POST /auth/logout` (best-effort), bersihkan state +
 *   query cache; guard RequireAuth mengarahkan ke /login.
 *
 * Selama `booting`, children belum dirender agar guard tidak salah
 * mengarahkan pengguna yang sesinya masih dipulihkan.
 */

import { createContext, useContext, useEffect, useMemo, type ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../stores/authStore';
import { refreshSession } from '../services/http';
import { authApi } from '../services/endpoints/auth';
import { profileApi } from '../services/endpoints/profile';
import { normalizeBackendUser } from '../lib/user';
import type { BackendUser } from '../types/auth';

interface AuthContextValue {
  user: ReturnType<typeof useAuthStore.getState>['user'];
  status: ReturnType<typeof useAuthStore.getState>['status'];
  login: (payload: { identifier: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
  /** Set ulang user dari data backend (dipakai Fase 2 setelah ubah profil). */
  syncUser: (raw: BackendUser) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const user = useAuthStore((s) => s.user);
  const status = useAuthStore((s) => s.status);
  const queryClient = useQueryClient();

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

      if (!tokens) {
        store.setStatus('anonymous');
        return;
      }

      try {
        // Access token harus masuk store SEBELUM GET /profile agar
        // interceptor menyisipkan Authorization.
        store.setSession({
          user: { id: '', username: '', email: '', role: 'mahasiswa', name: '' },
          accessToken: tokens.accessToken,
        });
        const profile = await profileApi.getProfile();
        if (cancelled) return;
        store.setSession({
          user: normalizeBackendUser(profile),
          accessToken: tokens.accessToken,
        });
      } catch {
        if (cancelled) return;
        store.clearSession();
      }
    }

    void bootstrap();
    return () => {
      cancelled = true;
    };
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      status,
      async login({ identifier, password }) {
        const result = await authApi.login({ identifier, password });
        useAuthStore.getState().setSession({
          user: normalizeBackendUser(result.user),
          accessToken: result.accessToken,
          refreshToken: result.refreshToken,
        });
      },
      async logout() {
        const store = useAuthStore.getState();
        await authApi.logout(store.getStoredRefreshToken());
        store.clearSession();
        // Bersihkan seluruh cache server-state milik sesi lama.
        queryClient.clear();
      },
      syncUser(raw) {
        useAuthStore.getState().setSession({
          user: normalizeBackendUser(raw),
          accessToken: useAuthStore.getState().accessToken ?? '',
        });
      },
    }),
    [user, status, queryClient]
  );

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

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth harus dipakai di dalam AuthProvider');
  }
  return ctx;
}
