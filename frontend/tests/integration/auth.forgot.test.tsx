/**
 * tests/integration/auth.forgot.test.tsx
 *
 * Halaman lupa password terhubung `POST /auth/forgot-password`:
 * - Submit email → pesan sukses generik (anti-enumerasi) + cooldown 60s.
 * - Kirim ulang memakai endpoint yang sama setelah cooldown.
 */

import { describe, expect, it, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { http, HttpResponse } from 'msw';
import ForgotPasswordPage from '@/pages/ForgotPassword';
import { server } from '../mocks/server';

function renderForgot() {
  return render(
    <MemoryRouter>
      <ForgotPasswordPage />
    </MemoryRouter>
  );
}

describe('Halaman Lupa Password (integrasi API)', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    window.sessionStorage.clear();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('submit email valid → pesan sukses + tombol kirim ulang masuk cooldown', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    renderForgot();

    await user.type(screen.getByLabelText(/email terdaftar/i), 'mahasiswa@kampus.ac.id');
    await user.click(screen.getByRole('button', { name: /kirim tautan pemulihan/i }));

    expect(await screen.findByText(/tautan berhasil dikirim/i)).toBeInTheDocument();
    expect(screen.getByText(/mahasiswa@kampus.ac.id/i)).toBeInTheDocument();

    // Tombol kirim ulang nonaktif selama cooldown.
    const resend = screen.getByRole('button', { name: /kirim ulang/i });
    expect(resend).toBeDisabled();
  });

  it('email gagal divalidasi klien → pesan error tanpa memanggil API', async () => {
    let calls = 0;
    server.use(
      http.post('/api/auth/forgot-password', async () => {
        calls += 1;
        return HttpResponse.json({ success: true, data: null });
      })
    );

    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    renderForgot();

    await user.type(screen.getByLabelText(/email terdaftar/i), 'bukan-email');
    await user.click(screen.getByRole('button', { name: /kirim tautan pemulihan/i }));

    expect(await screen.findByRole('alert')).toHaveTextContent(/format email tidak valid/i);
    expect(calls).toBe(0);
  });

  it('kirim ulang setelah cooldown memanggil endpoint yang sama', async () => {
    let calls = 0;
    server.use(
      http.post('/api/auth/forgot-password', async () => {
        calls += 1;
        return HttpResponse.json({ success: true, message: 'ok', data: null });
      })
    );

    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    renderForgot();

    await user.type(screen.getByLabelText(/email terdaftar/i), 'mahasiswa@kampus.ac.id');
    await user.click(screen.getByRole('button', { name: /kirim tautan pemulihan/i }));
    await screen.findByText(/tautan berhasil dikirim/i);

    // Maju 61 detik agar cooldown habis, lalu kirim ulang.
    await vi.advanceTimersByTimeAsync(61_000);

    const resend = screen.getByRole('button', { name: /kirim ulang/i });
    await waitFor(() => expect(resend).toBeEnabled());
    await user.click(resend);

    await waitFor(() => expect(calls).toBe(2));
  });
});
