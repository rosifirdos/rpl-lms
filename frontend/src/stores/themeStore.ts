/**
 * stores/themeStore.ts
 *
 * Store preferensi tema (cerah/gelap) SPADA LMS UPGRIS.
 * Mengikuti pattern store kompatibel Zustand di `authStore.ts` (useSyncExternalStore)
 * tanpa dependensi eksternal.
 *
 * Default adalah CERAH. Preferensi disimpan di localStorage dengan key
 * `spada-theme` dan dibaca lebih dulu oleh skrip anti-flash di index.html,
 * sehingga tidak ada kedipan tema saat halaman dimuat.
 */

import { useSyncExternalStore } from 'react';

export type Theme = 'light' | 'dark';

export const THEME_STORAGE_KEY = 'spada-theme';
export const DEFAULT_THEME: Theme = 'light';

interface ThemeState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

/** Baca preferensi tersimpan; apa pun selain 'dark' dianggap cerah. */
function readStoredTheme(): Theme {
  if (typeof window === 'undefined' || !window.localStorage) return DEFAULT_THEME;
  try {
    return localStorage.getItem(THEME_STORAGE_KEY) === 'dark' ? 'dark' : DEFAULT_THEME;
  } catch {
    // localStorage bisa throw di private mode / saat storage diblokir.
    return DEFAULT_THEME;
  }
}

/**
 * Sinkronkan class `dark` dan `color-scheme` pada <html>.
 * `color-scheme` membuat kontrol bawaan browser (scrollbar, date picker,
 * autofill) ikut menyesuaikan mode.
 */
function applyThemeToDocument(theme: Theme): void {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  root.classList.toggle('dark', theme === 'dark');
  root.classList.toggle('light', theme === 'light');
  root.style.colorScheme = theme;
}

let state: ThemeState = {
  theme: readStoredTheme(),
  setTheme: (theme: Theme) => {
    if (theme !== 'light' && theme !== 'dark') return;
    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
      // Gagal menyimpan bukan alasan untuk membatalkan pergantian tema.
    }
    state = { ...state, theme };
    applyThemeToDocument(theme);
    emitChange();
  },
  toggleTheme: () => {
    state.setTheme(state.theme === 'dark' ? 'light' : 'dark');
  },
};

// Terapkan segera saat modul dimuat, agar store dan DOM tidak pernah berbeda
// (skrip inline di index.html sudah melakukannya lebih awal; ini jaring pengaman
// untuk dev/HMR dan untuk render pertama React).
applyThemeToDocument(state.theme);

/** Ikuti perubahan tema pada tab lain agar tidak terjadi konflik antar-tab. */
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (event) => {
    if (event.key !== THEME_STORAGE_KEY) return;
    const next: Theme = event.newValue === 'dark' ? 'dark' : DEFAULT_THEME;
    if (next === state.theme) return;
    state = { ...state, theme: next };
    applyThemeToDocument(next);
    emitChange();
  });
}

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

function getSnapshot(): ThemeState {
  return state;
}

/**
 * useThemeStore Hook
 * Kompatibel dengan selector Zustand: const theme = useThemeStore((s) => s.theme)
 */
export const useThemeStore = Object.assign(
  function useThemeStore<T = ThemeState>(selector?: (s: ThemeState) => T): T {
    const current = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
    return selector ? selector(current) : (current as unknown as T);
  },
  {
    getState: () => state,
    setState: (partial: Partial<ThemeState>) => {
      state = { ...state, ...partial };
      emitChange();
    },
    subscribe: (listener: () => void) => subscribe(listener),
  }
);
