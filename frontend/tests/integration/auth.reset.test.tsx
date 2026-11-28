/**
 * tests/integration/auth.reset.test.tsx
 *
 * Alur reset kata sandi (FR-003):
 * - Token valid → form kata sandi baru dirender.
 * - Token invalid → status error dengan tautan pemulihan baru.
 * - Submit valid → sukses dan diarahkan ke /login?reset=1.
 */

import { describe, expect, it, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { http, HttpResponse } from 'msw';
import ResetPasswordPage from '@/features/auth/ResetPasswordPage';
import { server } from '../mocks/server';
import { invalidResetTokenHandler } from '../mocks/handlers';

function renderReset(token = 'token-abc') {
  return render(
    <MemoryRouter initialEntries={[`/reset-password?token=${token}`]}>
      <Routes>
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        {/* Probe navigasi sukses: /login?reset=1 */}
        <Route path="/login" element={<p>HALAMAN-MASUK-PROBE</p>} />
      </Routes>
    </MemoryRouter>
  );
}

describe('Halaman Reset Password (integrasi API)', () => {
  beforeEach(() => {
    window.sessionStorage.clear();
  });

  it('token valid: form kata sandi baru + konfirmasi dirender', async () => {
    renderReset();
    expect(await screen.findByLabelText(/^kata sandi baru$/i)).toBeInTheDocument();
    expect(screen.getByText(/berlaku hingga/i)).toBeInTheDocument();
  });

  it('token tanpa query → status invalid', async () => {
    render(
      <MemoryRouter initialEntries={['/reset-password']}>
        <ResetPasswordPage />
      </MemoryRouter>
    );
    expect(await screen.findByText(/token tidak valid/i)).toBeInTheDocument();
  });

  it('token invalid/expired: pesan error dan tautan pemulihan baru', async () => {
    server.use(invalidResetTokenHandler);
    renderReset('token-rusak');
    expect(await screen.findByText(/token tidak valid/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /ajukan tautan pemulihan baru/i })).toBeInTheDocument();
  });

  it('konfirmasi kata sandi tidak cocok → validasi zod gagal tanpa memanggil API', async () => {
    let resetCalled = 0;
    server.use(
      http.post('/api/auth/reset-password', async () => {
        resetCalled += 1;
        return HttpResponse.json({ success: true, data: null });
      })
    );

    renderReset();
    const user = userEvent.setup();
    await user.type(await screen.findByLabelText(/^kata sandi baru$/i), 'PasswordAman1!');
    await user.type(screen.getByLabelText(/^konfirmasi kata sandi baru$/i), 'BedaTotally1!');
    await user.click(screen.getByRole('button', { name: /simpan kata sandi baru/i }));

    expect(await screen.findByText(/konfirmasi kata sandi tidak cocok/i)).toBeInTheDocument();
    expect(resetCalled).toBe(0);
  });

  it('submit valid → pesan sukses lalu navigasi ke /login?reset=1', async () => {
    renderReset();
    const user = userEvent.setup();
    await user.type(await screen.findByLabelText(/^kata sandi baru$/i), 'PasswordAman1!');
    await user.type(screen.getByLabelText(/^konfirmasi kata sandi baru$/i), 'PasswordAman1!');
    await user.click(screen.getByRole('button', { name: /simpan kata sandi baru/i }));

    expect(await screen.findByText(/kata sandi berhasil diubah/i)).toBeInTheDocument();

    // Navigasi otomatis setelah 1800 ms.
    await waitFor(
      () => expect(screen.getByText('HALAMAN-MASUK-PROBE')).toBeInTheDocument(),
      { timeout: 4000 }
    );
  });
});
