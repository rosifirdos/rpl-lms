/**
 * stores/authStore.ts
 *
 * Store manajemen sesi otentikasi (Bab 3.4 & 3.5 IMPLEMENTATION_PLAN_MVP1_FRONTEND).
 *
 * Aturan penyimpanan:
 * - `accessToken` HANYA di memori (tidak pernah masuk localStorage/sessionStorage).
 * - `refreshToken` di `sessionStorage` via services/storage.ts (bertahan saat reload,
 *   hilang saat tab ditutup).
 * - `status` mengikuti siklus hidup sesi: `booting` → `authenticated` | `anonymous`.
 *
 * Pattern store kompatibel Zustand (useSyncExternalStore) dipertahankan agar
 * komponen lama berbasis selector tetap berfungsi selama migrasi bertahap:
 * snapshot yang dilihat hook memuat state + aksi sekaligus.
 */

import { useSyncExternalStore } from 'react';
import type { AuthUser, Role } from '../types/auth';
import {
  getRefreshToken,
  setRefreshToken,
  removeRefreshToken,
} from '../services/storage';

export type AuthStatus = 'booting' | 'authenticated' | 'anonymous';

export interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  status: AuthStatus;
  /** Kompatibilitas komponen lama: setara `status === 'authenticated'`. */
  isAuthenticated: boolean;
  /** Kompatibilitas komponen lama: alias `accessToken`. */
  token: string | null;
}

interface SetSessionPayload {
  user: AuthUser;
  accessToken: string;
  refreshToken?: string | null;
}

// ---------------------------------------------------------------------------
// Aksi publik
// ---------------------------------------------------------------------------

/** Simpan sesi baru (hasil login / refresh). */
function setSession({ user, accessToken, refreshToken }: SetSessionPayload): void {
  if (refreshToken) {
    setRefreshToken(refreshToken);
  }
  commit({
    user,
    accessToken,
    token: accessToken,
    status: 'authenticated',
    isAuthenticated: true,
  });
}

/** Hanya ubah status (dipakai AuthProvider saat bootstrap selesai). */
function setStatus(status: AuthStatus): void {
  commit({
    status,
    isAuthenticated: status === 'authenticated',
  });
}

/** Bersihkan sesi secara lokal (tanpa memanggil API). */
function clearSession(): void {
  removeRefreshToken();
  commit({
    user: null,
    accessToken: null,
    token: null,
    status: 'anonymous',
    isAuthenticated: false,
  });
}

/**
 * MOCK sementara Fase 0: dipakai halaman Login lama yang belum terhubung API.
 * AKAN DIGANTI di Fase 1 dengan `POST /auth/login` — jangan dibawa ke Fase 2.
 */
function loginMock(payload: { name: string; role: string }): void {
  const role = normalizeRole(payload.role);
  const user: AuthUser = {
    id: `mock-${role}`,
    username: payload.name,
    email: `${payload.name}@kampus.ac.id`,
    role,
    name: payload.name,
    identifier: role === 'mahasiswa' ? 'NIM 22670014' : undefined,
  };
  setSession({ user, accessToken: `mock-token-${Date.now()}` });
}

/** Kompatibilitas komponen lama yang memanggil setAuth(user, token). */
function setAuth(user: AuthUser, token: string): void {
  setSession({ user, accessToken: token });
}

function getCurrentRole(): Role {
  return normalizeRole(state.user?.role);
}

function normalizeRole(raw: string | undefined | null): Role {
  const lower = (raw || 'mahasiswa').toLowerCase();
  if (lower === 'dosen') return 'dosen';
  if (lower === 'admin') return 'admin';
  return 'mahasiswa';
}

/** Refresh token tersimpan (dibaca AuthProvider saat bootstrap). */
function getStoredRefreshToken(): string | null {
  return getRefreshToken();
}

const actions = {
  setSession,
  setStatus,
  clearSession,
  logout: clearSession,
  login: loginMock,
  setAuth,
  getCurrentRole,
  getStoredRefreshToken,
  /** Sesi lama menyimpan token di localStorage — bersihkan sisa migrasi. */
  purgeLegacyStorage: () => {
    try {
      window.localStorage.removeItem('access_token');
      window.localStorage.removeItem('refresh_token');
    } catch {
      /* noop */
    }
  },
};

export type AuthStoreApi = AuthState & typeof actions;

// ---------------------------------------------------------------------------
// State internal & snapshot
// ---------------------------------------------------------------------------

let state: AuthState = {
  user: null,
  accessToken: null,
  status: 'booting',
  isAuthenticated: false,
  token: null,
};

const listeners = new Set<() => void>();

// Snapshot hook = state + aksi (konvensi Zustand), di-cache agar
// useSyncExternalStore tidak melihat objek baru setiap render.
function buildSnapshot(): AuthStoreApi {
  return { ...state, ...actions };
}

let snapshot: AuthStoreApi = buildSnapshot();

function emitChange() {
  for (const listener of listeners) {
    listener();
  }
}

function commit(next: Partial<AuthState>) {
  state = { ...state, ...next };
  snapshot = buildSnapshot();
  emitChange();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot(): AuthStoreApi {
  return snapshot;
}

// ---------------------------------------------------------------------------
// Hook utama — kompatibel selector Zustand: useAuthStore((s) => s.user)
// ---------------------------------------------------------------------------

export const useAuthStore = Object.assign(
  function useAuthStore<T = AuthStoreApi>(selector?: (s: AuthStoreApi) => T): T {
    const current = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
    return selector ? selector(current) : (current as unknown as T);
  },
  {
    getState: (): AuthStoreApi => snapshot,
    setState: (partial: Partial<AuthState>) => commit(partial),
    subscribe,
    ...actions,
  }
);
