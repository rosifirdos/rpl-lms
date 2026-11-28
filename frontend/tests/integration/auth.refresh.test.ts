/**
 * tests/integration/auth.refresh.test.ts
 *
 * Interceptor refresh di services/http.ts:
 * - 401 pada request biasa → refresh sekali → request asli diulang dengan
 *   token baru (antrean bekerja).
 * - Refresh gagal → sesi dibersihkan (status anonymous) dan pengguna
 *   diarahkan ke /login?expired=1.
 */

import { describe, expect, it, beforeEach, afterEach, vi } from 'vitest';
import { http, HttpResponse } from 'msw';
import { requestData, setSessionExpiredHandler } from '@/services/http';
import { useAuthStore } from '@/stores/authStore';
import { server } from '../mocks/server';
import { refreshFailureHandler } from '../mocks/handlers';

const API = '/api';

function seedSession() {
  window.sessionStorage.setItem('elearning.refresh_token', 'mock-refresh-token');
  useAuthStore.setState({
    user: { id: 'u-1', username: 'dimas.arya', email: 'x@kampus.ac.id', role: 'mahasiswa', name: 'Dimas' },
    accessToken: 'stale-token',
    token: 'stale-token',
    status: 'authenticated',
    isAuthenticated: true,
  });
}

describe('Refresh token otomatis', () => {
  beforeEach(() => {
    seedSession();
  });

  it('401 → refresh sukses → request asli diulang dengan token baru', async () => {
    let profileCalls = 0;
    server.use(
      http.get(`${API}/profile`, async () => {
        profileCalls += 1;
        if (profileCalls === 1) {
          return HttpResponse.json({ success: false, message: 'Token kedaluwarsa' }, { status: 401 });
        }
        return HttpResponse.json({ success: true, message: 'ok', data: { hello: 'world' } });
      })
    );

    const result = await requestData({ method: 'GET', url: '/profile' });

    expect(profileCalls).toBe(2);
    expect(result.data).toEqual({ hello: 'world' });
    expect(useAuthStore.getState().accessToken).toBe('mock-access-token-refreshed');
  });

  it('beberapa request paralel 401 hanya memicu satu refresh', async () => {
    let refreshCalls = 0;
    server.use(
      http.post(`${API}/auth/refresh`, async () => {
        refreshCalls += 1;
        // Beri jeda agar ketiga 401 benar-benar tiba bersamaan selama
        // refresh berjalan — kondisi produksi saat token kedaluwarsa.
        await new Promise((resolve) => setTimeout(resolve, 50));
        return HttpResponse.json({
          success: true,
          data: { accessToken: `refreshed-${refreshCalls}` },
        });
      }),
      http.get(`${API}/dashboard`, async ({ request }) => {
        await new Promise((resolve) => setTimeout(resolve, 10));
        // Request ulang pasca-refresh membawa token baru → berhasil.
        if (String(request.headers.get('authorization') ?? '').includes('refreshed-')) {
          return HttpResponse.json({ success: true, message: 'ok', data: { ok: true } });
        }
        return HttpResponse.json({ success: false, message: 'Token kedaluwarsa' }, { status: 401 });
      })
    );

    const [a, b, c] = await Promise.allSettled([
      requestData({ method: 'GET', url: '/dashboard' }),
      requestData({ method: 'GET', url: '/dashboard' }),
      requestData({ method: 'GET', url: '/dashboard' }),
    ]);

    expect(refreshCalls).toBe(1);
    expect(a.status).toBe('fulfilled');
    expect(b.status).toBe('fulfilled');
    expect(c.status).toBe('fulfilled');
  });

  it('refresh gagal → sesi dibersihkan dan redirect /login?expired=1', async () => {
    server.use(
      refreshFailureHandler,
      http.get(`${API}/profile`, async () =>
        HttpResponse.json({ success: false, message: 'Token kedaluwarsa' }, { status: 401 })
      )
    );

    const assignSpy = vi.fn();
    const restoreHandler = setSessionExpiredHandler(assignSpy);

    try {
      await expect(requestData({ method: 'GET', url: '/profile' })).rejects.toMatchObject({
        status: 401,
      });
    } finally {
      restoreHandler();
    }

    const state = useAuthStore.getState();
    expect(state.status).toBe('anonymous');
    expect(state.accessToken).toBeNull();
    expect(window.sessionStorage.getItem('elearning.refresh_token')).toBeNull();
    expect(assignSpy).toHaveBeenCalledWith('/login?expired=1');
  });
});
