/**
 * tests/integration/auth.guard.test.tsx
 *
 * Guard peran (RequireRole): rute admin tidak dapat dibuka peran lain →
 * /403; peran sesuai → konten dirender. Guard RequireAuth untuk pengguna
 * anonim sudah tercakup smoke test.
 */

import { describe, expect, it, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { RequireRole } from '@/routes/RequireRole';
import { useAuthStore } from '@/stores/authStore';
import type { Role } from '@/types/auth';

function seedSession(role: Role) {
  useAuthStore.setState({
    user: { id: 'u-1', username: 'u', email: 'u@kampus.ac.id', role, name: 'U' },
    accessToken: 'token',
    token: 'token',
    status: 'authenticated',
    isAuthenticated: true,
  });
}

function renderAdminRoute() {
  return render(
    <MemoryRouter initialEntries={['/admin/panel']}>
      <Routes>
        <Route element={<RequireRole roles={['admin']} />}>
          <Route path="/admin/panel" element={<p>Konten Admin Rahasia</p>} />
        </Route>
        <Route path="/403" element={<p>403 — Akses Ditolak</p>} />
      </Routes>
    </MemoryRouter>
  );
}

describe('Guard peran (RBAC di rute)', () => {
  beforeEach(() => {
    window.sessionStorage.clear();
  });

  it('mahasiswa membuka rute admin → diarahkan ke /403', () => {
    seedSession('mahasiswa');
    renderAdminRoute();
    expect(screen.getByText(/403 — akses ditolak/i)).toBeInTheDocument();
    expect(screen.queryByText(/konten admin rahasia/i)).not.toBeInTheDocument();
  });

  it('dosen membuka rute admin → diarahkan ke /403', () => {
    seedSession('dosen');
    renderAdminRoute();
    expect(screen.getByText(/403 — akses ditolak/i)).toBeInTheDocument();
  });

  it('admin membuka rute admin → konten dirender', () => {
    seedSession('admin');
    renderAdminRoute();
    expect(screen.getByText(/konten admin rahasia/i)).toBeInTheDocument();
  });
});
