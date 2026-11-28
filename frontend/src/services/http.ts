/**
 * services/http.ts
 *
 * HTTP client terpusat (Bab 3.3 IMPLEMENTATION_PLAN_MVP1_FRONTEND):
 * - baseURL `/api`, timeout 20 detik.
 * - Request interceptor menyisipkan `Authorization: Bearer <accessToken>`
 *   dari authStore (token hanya di memori).
 * - Response interceptor: pada `401` (di luar endpoint `/auth/*`) coba
 *   `POST /auth/refresh` SATU kali dengan mutex + antrean request paralel.
 *   Refresh gagal → sesi dibersihkan dan pengguna diarahkan ke
 *   `/login?expired=1`.
 * - Semua error dinormalisasi menjadi `HttpApiError` (status, message,
 *   errors[] per field) sesuai envelope backend.
 */

import axios, {
  AxiosError,
  AxiosHeaders,
  type AxiosInstance,
  type AxiosRequestConfig,
  type InternalAxiosRequestConfig,
} from 'axios';
import { HttpApiError, type ApiEnvelope, type ApiError } from '../types/api';
import { useAuthStore } from '../stores/authStore';

export const http: AxiosInstance = axios.create({
  baseURL: '/api',
  timeout: 20_000,
});

// Instance terpisah TANPA interceptor khusus untuk refresh agar tidak rekursif.
const refreshClient = axios.create({
  baseURL: '/api',
  timeout: 20_000,
});

// ---------------------------------------------------------------------------
// Request interceptor — sisipkan access token dari memori
// ---------------------------------------------------------------------------

http.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    const headers = AxiosHeaders.from(config.headers);
    headers.set('Authorization', `Bearer ${token}`);
    config.headers = headers;
  }
  return config;
});

// ---------------------------------------------------------------------------
// Refresh queue (mutex + antrean request paralel)
// ---------------------------------------------------------------------------

interface PendingCallback {
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}

let isRefreshing = false;
let failedQueue: PendingCallback[] = [];

function processQueue(error: unknown, token: string | null) {
  failedQueue.forEach((pending) => {
    if (error || !token) {
      pending.reject(error);
    } else {
      pending.resolve(token);
    }
  });
  failedQueue = [];
}

interface RefreshResponseShape {
  success?: boolean;
  data?: {
    accessToken?: string;
    access_token?: string;
    refreshToken?: string;
    refresh_token?: string;
  };
}

async function requestRefresh(): Promise<{ accessToken: string; refreshToken?: string }> {
  const refreshToken = useAuthStore.getState().getStoredRefreshToken();
  if (!refreshToken) {
    throw new Error('Tidak ada refresh token');
  }

  const { data } = await refreshClient.post<RefreshResponseShape>('/auth/refresh', {
    // Backend auth.validation.js memvalidasi `refreshToken` (camelCase).
    refreshToken,
  });

  const accessToken = data?.data?.accessToken || data?.data?.access_token;
  const nextRefresh = data?.data?.refreshToken || data?.data?.refresh_token;
  if (!accessToken) {
    throw new Error('Respons refresh tidak memuat access token');
  }
  return { accessToken, refreshToken: nextRefresh };
}

function handleSessionExpired(): void {
  useAuthStore.getState().clearSession();
  sessionExpiredHandler('/login?expired=1');
}

type SessionExpiredHandler = (redirectUrl: string) => void;

/** Default: hard redirect agar seluruh state UI ikut direset. */
let sessionExpiredHandler: SessionExpiredHandler = (redirectUrl) => {
  if (typeof window !== 'undefined') {
    window.location.assign(redirectUrl);
  }
};

/** Ganti penanganan sesi kedaluwarsa (dipakai test untuk memverifikasi redirect). */
export function setSessionExpiredHandler(handler: SessionExpiredHandler): () => void {
  const previous = sessionExpiredHandler;
  sessionExpiredHandler = handler;
  return () => {
    sessionExpiredHandler = previous;
  };
}

/**
 * Bootstrap sesi saat aplikasi dimuat (Bab 3.4): bila refresh token tersedia,
 * coba terbitkan access token baru. Dipakai AuthProvider; gagal → `null`
 * (tampilkan login tanpa error).
 */
export async function refreshSession(): Promise<{ accessToken: string; refreshToken?: string } | null> {
  try {
    return await requestRefresh();
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Response interceptor — refresh sekali lalu ulangi request asli
// ---------------------------------------------------------------------------

interface RetriableRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

http.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as RetriableRequestConfig | undefined;
    const status = error.response?.status;
    const url = original?.url || '';
    const isAuthEndpoint = url.includes('/auth/');

    if (status !== 401 || !original || original._retry || isAuthEndpoint) {
      return Promise.reject(normalizeApiError(error));
    }

    if (isRefreshing) {
      // Antrekan request paralel sampai refresh yang sedang berjalan selesai.
      return new Promise((resolve, reject) => {
        failedQueue.push({
          resolve: (token: string) => {
            original.headers = AxiosHeaders.from(original.headers);
            original.headers.set('Authorization', `Bearer ${token}`);
            resolve(http(original));
          },
          reject,
        });
      });
    }

    original._retry = true;
    isRefreshing = true;

    try {
      const { accessToken, refreshToken } = await requestRefresh();
      const store = useAuthStore.getState();
      if (store.user) {
        store.setSession({ user: store.user, accessToken, refreshToken });
      } else {
        // Sesi tanpa profil (jarang): simpan token saja.
        store.setSession({
          user: {
            id: '',
            username: '',
            email: '',
            role: 'mahasiswa',
            name: '',
          },
          accessToken,
          refreshToken,
        });
      }
      processQueue(null, accessToken);

      original.headers = AxiosHeaders.from(original.headers);
      original.headers.set('Authorization', `Bearer ${accessToken}`);
      return http(original);
    } catch (refreshError) {
      processQueue(refreshError, null);
      handleSessionExpired();
      return Promise.reject(normalizeApiError(refreshError));
    } finally {
      isRefreshing = false;
    }
  }
);

// ---------------------------------------------------------------------------
// Normalisasi error → HttpApiError
// ---------------------------------------------------------------------------

interface ErrorBodyShape {
  message?: string;
  code?: string;
  errors?: ApiError['errors'];
}

export function normalizeApiError(error: unknown): HttpApiError {
  if (error instanceof HttpApiError) {
    return error;
  }

  if (axios.isAxiosError(error)) {
    const status = error.response?.status ?? 0;
    const body = (error.response?.data ?? {}) as ErrorBodyShape & { data?: ErrorBodyShape };
    // Envelope backend menaruh detail di root atau di dalam `data`.
    const detail = body.data ?? body;
    return new HttpApiError({
      status,
      message: detail.message || body.message || error.message || 'Terjadi kesalahan tak terduga',
      code: detail.code || body.code,
      errors: detail.errors || body.errors,
    });
  }

  return new HttpApiError({
    status: 0,
    message: error instanceof Error ? error.message : 'Terjadi kesalahan jaringan',
  });
}

// ---------------------------------------------------------------------------
// Helper envelope
// ---------------------------------------------------------------------------

/** Buka envelope `{ success, message, data, meta }` → `{ data, meta, message }`. */
export function unwrapEnvelope<T>(payload: ApiEnvelope<T>): { data: T; meta?: ApiEnvelope<T>['meta']; message: string } {
  return { data: payload.data, meta: payload.meta, message: payload.message };
}

/** Permintaan singkat yang langsung mengembalikan isi `data` envelope. */
export async function requestData<T>(config: AxiosRequestConfig): Promise<{ data: T; meta?: ApiEnvelope<T>['meta']; message: string }> {
  try {
    const response = await http.request<ApiEnvelope<T>>(config);
    return unwrapEnvelope(response.data);
  } catch (error) {
    throw normalizeApiError(error);
  }
}

/**
 * Unduhan berkas TIDAK boleh melewati interceptor JSON — gunakan `blob`
 * lalu ekstrak nama berkas dari `Content-Disposition` (Bab 3.3 poin 8).
 */
export async function downloadFile(url: string, config: AxiosRequestConfig = {}): Promise<{ blob: Blob; filename: string }> {
  try {
    const response = await http.get<Blob>(url, {
      ...config,
      responseType: 'blob',
    });
    const disposition = String(response.headers?.['content-disposition'] ?? '');
    const match = /filename\*?=(?:UTF-8'')?"?([^";]+)"?/i.exec(disposition);
    const filename = match ? decodeURIComponent(match[1]) : 'unduhan';
    return { blob: response.data, filename };
  } catch (error) {
    throw normalizeApiError(error);
  }
}
