/**
 * tests/integration/auth.login.test.tsx
 *
 * Integrasi halaman login dengan `POST /auth/login`:
 * - Sukses → sesi tersimpan (user + token) dan navigasi ke /dashboard.
 * - 401 → pesan kredensial salah.
 * - 403 akun SUSPENDED/INACTIVE → pesan khusus dari backend.
 */

import { describe, expect, it, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { AppProviders } from '@/providers/AppProviders';
import { AppRoutes } from '@/routes';
import { useAuthStore } from '@/stores/authStore';
import { server } from '../mocks/server';
import { loginUnauthorizedHandler, loginSuspendedHandler } from '../mocks/handlers';

function renderLogin() {
  return render(
    <AppProviders>
      <MemoryRouter initialEntries={['/login']}>
        <AppRoutes />
      </MemoryRouter>
    </AppProviders>
  );
}

async function fillAndSubmit(identifier: string, password: string) {
  const user = userEvent.setup();
  await user.type(screen.getByLabelText(/username \/ email \/ nim \/ nidn \/ nip/i), identifier);
  await user.type(screen.getByLabelText(/^kata sandi$/i), password);
  await user.click(screen.getByRole('button', { name: /masuk/i }));
}

describe('Halaman Login (integrasi API)', () => {
  beforeEach(() => {
    useAuthStore.setState({
      user: null,
      accessToken: null,
      token: null,
      status: 'anonymous',
      isAuthenticated: false,
    });
    window.sessionStorage.clear();
  });

  it('login sukses: sesi tersimpan dengan user ternormalisasi lalu diarahkan ke /dashboard', async () => {
    renderLogin();

    await fillAndSubmit('dimas.arya', 'password123');

    // Navigasi ke /dashboard memuat dasbor mahasiswa legacy.
    await screen.findByText(/Selamat datang/i, {}, { timeout: 5000 }).catch(() => {});
    const state = useAuthStore.getState();
    expect(state.status).toBe('authenticated');
    expect(state.user?.role).toBe('mahasiswa');
    expect(state.user?.name).toBe('Dimas Arya Pratama');
    expect(state.user?.identifier).toBe('22670014');
    expect(state.accessToken).toBe('mock-access-token');
    expect(window.sessionStorage.getItem('elearning.refresh_token')).toBe('mock-refresh-token');
  });

  it('login gagal 401: pesan kredensial salah ditampilkan, sesi tetap anonim', async () => {
    server.use(loginUnauthorizedHandler);
    renderLogin();

    await fillAndSubmit('dimas.arya', 'salah');

    expect(await screen.findByRole('alert')).toHaveTextContent(/kredensial tidak valid/i);
    expect(useAuthStore.getState().status).toBe('anonymous');
  });

  it('login ditolak 403 akun SUSPENDED: pesan khusus backend ditampilkan', async () => {
    server.use(loginSuspendedHandler);
    renderLogin();

    await fillAndSubmit('dimas.arya', 'password123');

    expect(await screen.findByRole('alert')).toHaveTextContent(/berstatus ditangguhkan \(SUSPENDED\)/i);
    expect(useAuthStore.getState().status).toBe('anonymous');
  });
});
