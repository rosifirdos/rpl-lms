/**
 * stores/authStore.ts
 *
 * Store manajemen sesi otentikasi pengguna SPADA LMS UPGRIS.
 * Mendukung normalisasi peran RBAC (mahasiswa | dosen | admin).
 */

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

// Handler state lokal dengan observer subscriber untuk reaktivitas React
let state: AuthState = {
  user: null,
  token: typeof window !== 'undefined' ? localStorage.getItem('access_token') : null,
  isAuthenticated: typeof window !== 'undefined' ? Boolean(localStorage.getItem('access_token')) : false,
  setAuth: (user: User, token: string) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('access_token', token);
    }
    state = { ...state, user, token, isAuthenticated: true };
    listeners.forEach((listener) => listener(state));
  },
  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
    }
    state = { ...state, user: null, token: null, isAuthenticated: false };
    listeners.forEach((listener) => listener(state));
  },
  getCurrentRole: () => {
    const rawRole = (state.user?.role || 'mahasiswa').toLowerCase();
    if (rawRole === 'dosen') return 'dosen';
    if (rawRole === 'admin') return 'admin';
    return 'mahasiswa';
  },
};

const listeners = new Set<(s: AuthState) => void>();

// Export hook useAuthStore yang kompatibel dengan Zustand pattern
export const useAuthStore = Object.assign(
  function useAuthStore<T = AuthState>(selector?: (s: AuthState) => T): T {
    const [snapshot, setSnapshot] = typeof window !== 'undefined' && (window as any).React
      ? (window as any).React.useState(() => (selector ? selector(state) : (state as unknown as T)))
      : [selector ? selector(state) : (state as unknown as T), () => {}];

    // Jika di lingkungan browser React biasa
    if (typeof window !== 'undefined' && (window as any).React?.useEffect) {
      (window as any).React.useEffect(() => {
        const handler = (newState: AuthState) => {
          setSnapshot(selector ? selector(newState) : (newState as unknown as T));
        };
        listeners.add(handler);
        return () => {
          listeners.delete(handler);
        };
      }, [selector]);
    }

    return snapshot;
  },
  {
    getState: () => state,
    setState: (partial: Partial<AuthState>) => {
      state = { ...state, ...partial };
      listeners.forEach((listener) => listener(state));
    },
    subscribe: (listener: (s: AuthState) => void) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
  }
);
