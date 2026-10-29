/**
 * stores/authStore.ts
 *
 * Store manajemen sesi otentikasi pengguna SPADA LMS UPGRIS.
 * Mengimplementasikan pattern store kompatibel Zustand tanpa dependensi eksternal,
 * mendukung normalisasi peran RBAC (mahasiswa | dosen | admin).
 */

import { useSyncExternalStore } from 'react';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'mahasiswa' | 'dosen' | 'admin' | 'MAHASISWA' | 'DOSEN' | 'ADMIN';
  identifier?: string;
  avatarUrl?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
  getCurrentRole: () => 'mahasiswa' | 'dosen' | 'admin';
}

const getStoredToken = () => {
  if (typeof window !== 'undefined' && window.localStorage) {
    return localStorage.getItem('access_token');
  }
  return null;
};

// Handler state lokal
let state: AuthState = {
  user: null,
  token: getStoredToken(),
  isAuthenticated: Boolean(getStoredToken()),
  setAuth: (user: User, token: string) => {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem('access_token', token);
    }
    state = { ...state, user, token, isAuthenticated: true };
    emitChange();
  },
  logout: () => {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
    }
    state = { ...state, user: null, token: null, isAuthenticated: false };
    emitChange();
  },
  getCurrentRole: () => {
    const rawRole = (state.user?.role || 'mahasiswa').toLowerCase();
    if (rawRole === 'dosen') return 'dosen';
    if (rawRole === 'admin') return 'admin';
    return 'mahasiswa';
  },
};

const listeners = new Set<() => void>();

function emitChange() {
  for (const listener of listeners) {
    listener();
  }
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot(): AuthState {
  return state;
}

/**
 * useAuthStore Hook
 * Kompatibel dengan selector Zustand: const user = useAuthStore((s) => s.user)
 */
export const useAuthStore = Object.assign(
  function useAuthStore<T = AuthState>(selector?: (s: AuthState) => T): T {
    const current = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
    return selector ? selector(current) : (current as unknown as T);
  },
  {
    getState: () => state,
    setState: (partial: Partial<AuthState>) => {
      state = { ...state, ...partial };
      emitChange();
    },
    subscribe: (listener: () => void) => subscribe(listener),
  }
);
