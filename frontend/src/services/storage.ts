/**
 * services/storage.ts
 *
 * Helper penyimpanan refresh token di `sessionStorage` (Bab 3.4):
 * bertahan saat reload tab, hilang saat tab ditutup. Access token TIDAK
 * disimpan di storage apa pun — hanya di memori (authStore).
 *
 * Catatan technical debt (Bab 9.2): migrasi ke HttpOnly cookie bila backend
 * menyediakannya.
 */

const REFRESH_TOKEN_KEY = 'elearning.refresh_token';

export function getRefreshToken(): string | null {
  try {
    return window.sessionStorage.getItem(REFRESH_TOKEN_KEY);
  } catch {
    // sessionStorage bisa diblokir (private mode / SSR) — anggap tidak ada sesi.
    return null;
  }
}

export function setRefreshToken(token: string): void {
  try {
    window.sessionStorage.setItem(REFRESH_TOKEN_KEY, token);
  } catch {
    /* storage tidak tersedia; sesi hanya bertahan di memori */
  }
}

export function removeRefreshToken(): void {
  try {
    window.sessionStorage.removeItem(REFRESH_TOKEN_KEY);
  } catch {
    /* noop */
  }
}
