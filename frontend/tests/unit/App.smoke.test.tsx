/**
 * tests/unit/App.smoke.test.tsx
 *
 * Smoke test Fase 0: aplikasi berjalan di router baru.
 * - Halaman /login dirender.
 * - Guard aktif: pengguna anonim di /dashboard diarahkan ke /login.
 */

import { describe, expect, it, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AppRoutes } from '@/routes';
import { useAuthStore } from '@/stores/authStore';

function renderRoute(initialPath: string) {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <AppRoutes />
    </MemoryRouter>
  );
}

describe('Smoke test router baru', () => {
  beforeEach(() => {
    useAuthStore.setState({
      user: null,
      accessToken: null,
      token: null,
      status: 'anonymous',
      isAuthenticated: false,
    });
  });

  it('merender halaman login pada /login', () => {
    renderRoute('/login');
    expect(screen.getByRole('heading', { name: /masuk ke e-learning kampus/i })).toBeInTheDocument();
  });

  it('merender halaman lupa password pada /forgot-password', () => {
    renderRoute('/forgot-password');
    expect(screen.getByRole('heading', { name: /pemulihan kata sandi/i })).toBeInTheDocument();
  });

  it('guard: pengguna anonim di /dashboard diarahkan ke /login', () => {
    renderRoute('/dashboard');
    expect(screen.getByRole('heading', { name: /masuk ke e-learning kampus/i })).toBeInTheDocument();
  });

  it('rute tidak dikenal menampilkan 404', () => {
    renderRoute('/halaman-tidak-ada');
    expect(screen.getByRole('heading', { name: /404/i })).toBeInTheDocument();
  });
});
