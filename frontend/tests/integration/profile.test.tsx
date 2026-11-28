/**
 * tests/integration/profile.test.tsx
 *
 * Integrasi halaman Profil (Fase 2):
 * - Render data asli dari GET /profile (nama, NIM, email, badge peran).
 * - Update biodata → PUT /profile, sesi tersinkron.
 * - Avatar: validasi klien (tipe/ukuran), unggah sukses, 413 dari server.
 * - Ganti kata sandi: sukses → force logout → /login?password_changed=1;
 *   sandi lama salah (400) → sesi bertahan.
 */

import { describe, expect, it, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { http, HttpResponse } from 'msw';
import { AppProviders, queryClient } from '@/providers/AppProviders';
import { AppRoutes } from '@/routes';
import { useAuthStore } from '@/stores/authStore';
import { server } from '../mocks/server';
import { avatarTooLargeHandler, wrongOldPasswordHandler } from '../mocks/handlers';

const API = '/api';

function seedSession() {
  window.sessionStorage.setItem('elearning.refresh_token', 'mock-refresh-token');
  useAuthStore.setState({
    user: { id: 'u-1', username: 'dimas.arya', email: 'dimas.arya@kampus.ac.id', role: 'mahasiswa', name: 'Dimas Arya Pratama', identifier: '22670014' },
    accessToken: 'token',
    token: 'token',
    status: 'authenticated',
    isAuthenticated: true,
  });
}

function renderProfile() {
  return render(
    <AppProviders>
      <MemoryRouter initialEntries={['/profile']}>
        <AppRoutes />
      </MemoryRouter>
    </AppProviders>
  );
}

beforeEach(() => {
  // QueryClient singleton level modul — bersihkan cache antar test agar
  // ['profile'] tidak memakai data test sebelumnya.
  queryClient.clear();
  seedSession();
});

describe('Halaman Profil — render data asli', () => {
  it('menampilkan nama, NIM, email, dan badge peran dari GET /profile', async () => {
    renderProfile();

    expect(await screen.findByRole('heading', { name: /dimas arya pratama/i })).toBeInTheDocument();
    expect(screen.getByText(/nim 22670014/i)).toBeInTheDocument();
    expect(screen.getByText(/dimas\.arya@kampus\.ac\.id/i)).toBeInTheDocument();
    expect(screen.getAllByText('mahasiswa').length).toBeGreaterThan(0);
  });

  it('peran admin: identitas NIM tidak tampil, badge admin dirender', async () => {
    server.use(
      http.get(`${API}/profile`, async () =>
        HttpResponse.json({
          success: true,
          message: 'Profil ditemukan',
          data: {
            id: 'u-admin',
            username: 'admin',
            email: 'admin@kampus.ac.id',
            status: 'ACTIVE',
            role: 'admin',
            profile: { full_name: 'Admin Sistem', phone: null, bio: null, avatar_file: null },
            mahasiswa: null,
            dosen: null,
          },
        })
      )
    );
    useAuthStore.setState({
      user: { id: 'u-admin', username: 'admin', email: 'admin@kampus.ac.id', role: 'admin', name: 'Admin Sistem' },
      accessToken: 'token',
      token: 'token',
      status: 'authenticated',
      isAuthenticated: true,
    });

    renderProfile();

    expect(await screen.findByRole('heading', { name: /admin sistem/i })).toBeInTheDocument();
    expect(screen.getAllByText('admin').length).toBeGreaterThan(0);
    // Tanpa NIM/NIDN: input identitas read-only kosong (—).
    expect(screen.getByDisplayValue('—')).toBeInTheDocument();
    expect(screen.queryByDisplayValue('22670014')).not.toBeInTheDocument();
  });
});

describe('Halaman Profil — update biodata', () => {
  it('submit biodata → PUT /profile dengan payload benar dan sesi tersinkron', async () => {
    let putPayload: Record<string, unknown> | null = null;
    server.use(
      http.put(`${API}/profile`, async ({ request }) => {
        putPayload = (await request.json()) as Record<string, unknown>;
        return HttpResponse.json({
          success: true,
          message: 'Profil berhasil diperbarui',
          data: {
            ...useAuthStore.getState(),
            profile: { full_name: 'Dimas Arya Putra', phone: '081298765432', bio: 'Halo' },
          },
        });
      })
    );

    renderProfile();
    const user = userEvent.setup();

    const nameInput = await screen.findByLabelText(/nama lengkap/i);
    await user.clear(nameInput);
    await user.type(nameInput, 'Dimas Arya Putra');
    await user.type(screen.getByLabelText(/nomor whatsapp \/ telepon/i), '081298765432');
    await user.click(screen.getByRole('button', { name: /simpan perubahan biodata/i }));

    expect(await screen.findByText(/biodata berhasil disimpan/i)).toBeInTheDocument();
    expect(putPayload).toMatchObject({
      full_name: 'Dimas Arya Putra',
      phone: '081298765432',
    });
    // NIM read-only tetap tampil.
    expect(screen.getByText(/nim 22670014/i)).toBeInTheDocument();
  });

  it('nama terlalu pendek → validasi zod gagal tanpa memanggil API', async () => {
    let putCalls = 0;
    server.use(
      http.put(`${API}/profile`, async () => {
        putCalls += 1;
        return HttpResponse.json({ success: true, data: {} });
      })
    );

    renderProfile();
    const user = userEvent.setup();

    const nameInput = await screen.findByLabelText(/nama lengkap/i);
    await user.clear(nameInput);
    await user.type(nameInput, 'D');
    await user.click(screen.getByRole('button', { name: /simpan perubahan biodata/i }));

    expect(await screen.findByText(/nama lengkap minimal 2 karakter/i)).toBeInTheDocument();
    expect(putCalls).toBe(0);
  });
});

describe('Halaman Profil — avatar', () => {
  it('file bertipe tidak valid → ditolak di klien tanpa memanggil API', async () => {
    let uploadCalls = 0;
    server.use(
      http.post(`${API}/profile/avatar`, async () => {
        uploadCalls += 1;
        return HttpResponse.json({ success: true, data: {} });
      })
    );

    renderProfile();
    await screen.findByRole('heading', { name: /dimas arya pratama/i });

    // userEvent.upload tidak memicu onChange pada input file di jsdom —
    // pakai fireEvent.change (pola standar RTL untuk input berkas).
    const input = document.querySelector('#avatar-upload-input-btn') as HTMLInputElement;
    expect(input).not.toBeNull();
    fireEvent.change(input, { target: { files: [new File(['gif'], 'avatar.gif', { type: 'image/gif' })] } });

    expect(await screen.findByText(/format foto tidak valid/i)).toBeInTheDocument();
    expect(uploadCalls).toBe(0);
  });

  it('unggah valid → POST /profile/avatar multipart dipanggil', async () => {
    let receivedDisposition = '';
    let receivedType = '';
    server.use(
      http.post(`${API}/profile/avatar`, async ({ request }) => {
        // `request.formData()` undici menolak File jsdom (brand check) —
        // parsing manual cukup untuk asersi kontrak multipart.
        const body = await request.text();
        receivedDisposition = /name="avatar"; filename="([^"]*)"/.exec(body)?.[1] ?? '';
        receivedType = /Content-Type: ([^\r\n]+)/.exec(body)?.[1] ?? '';
        return HttpResponse.json({
          success: true,
          message: 'Foto profil berhasil diperbarui',
          data: {},
        });
      })
    );

    renderProfile();
    await screen.findByRole('heading', { name: /dimas arya pratama/i });
    const input = document.querySelector('#avatar-upload-input-btn') as HTMLInputElement;
    fireEvent.change(input, { target: { files: [new File(['png-bytes'], 'avatar.png', { type: 'image/png' })] } });

    expect(await screen.findByText(/foto profil berhasil diperbarui/i)).toBeInTheDocument();
    expect(receivedDisposition).toBe('avatar.png');
    expect(receivedType).toBe('image/png');
  });

  it('server menolak 413 → pesan ukuran ditampilkan', async () => {
    server.use(avatarTooLargeHandler);

    renderProfile();
    await screen.findByRole('heading', { name: /dimas arya pratama/i });
    const input = document.querySelector('#avatar-upload-input-btn') as HTMLInputElement;
    fireEvent.change(input, { target: { files: [new File(['png'], 'avatar.png', { type: 'image/png' })] } });

    expect(await screen.findByText(/melebihi batas maksimal/i)).toBeInTheDocument();
  });
});

describe('Halaman Profil — ganti kata sandi', () => {
  async function fillPasswordForm(user: ReturnType<typeof userEvent.setup>) {
    await user.type(screen.getByLabelText(/^kata sandi saat ini$/i), 'SandiLama123!');
    await user.type(screen.getByLabelText(/^kata sandi baru$/i), 'SandiBaru456!');
    await user.type(screen.getByLabelText(/^konfirmasi kata sandi baru$/i), 'SandiBaru456!');
    await user.click(screen.getByRole('button', { name: /perbarui kata sandi/i }));
  }

  it('sukses → PUT /profile/password dipanggil, sesi dibersihkan, diarahkan ke /login?password_changed=1', async () => {
    let passwordPayload: Record<string, unknown> | null = null;
    server.use(
      http.put(`${API}/profile/password`, async ({ request }) => {
        passwordPayload = (await request.json()) as Record<string, unknown>;
        return HttpResponse.json({ success: true, message: 'Kata sandi berhasil diperbarui', data: null });
      })
    );

    renderProfile();
    const user = userEvent.setup();

    await screen.findByRole('heading', { name: /dimas arya pratama/i });
    await user.click(screen.getByRole('tab', { name: /keamanan & kata sandi/i }));
    await fillPasswordForm(user);

    expect(await screen.findByText(/kata sandi berhasil diperbarui\. silakan masuk/i)).toBeInTheDocument();
    expect(passwordPayload).toEqual({ oldPassword: 'SandiLama123!', newPassword: 'SandiBaru456!' });
    await waitFor(() => expect(useAuthStore.getState().status).toBe('anonymous'));
    expect(window.sessionStorage.getItem('elearning.refresh_token')).toBeNull();
  });

  it('kata sandi lama salah (400) → pesan error, sesi bertahan', async () => {
    server.use(wrongOldPasswordHandler);

    renderProfile();
    const user = userEvent.setup();

    await screen.findByRole('heading', { name: /dimas arya pratama/i });
    await user.click(screen.getByRole('tab', { name: /keamanan & kata sandi/i }));
    await fillPasswordForm(user);

    expect(await screen.findByText(/kata sandi lama tidak sesuai/i)).toBeInTheDocument();
    expect(useAuthStore.getState().status).toBe('authenticated');
  });

  it('konfirmasi tidak cocok → validasi klien gagal tanpa memanggil API', async () => {
    let putCalls = 0;
    server.use(
      http.put(`${API}/profile/password`, async () => {
        putCalls += 1;
        return HttpResponse.json({ success: true, data: null });
      })
    );

    renderProfile();
    const user = userEvent.setup();

    await screen.findByRole('heading', { name: /dimas arya pratama/i });
    await user.click(screen.getByRole('tab', { name: /keamanan & kata sandi/i }));
    await user.type(screen.getByLabelText(/^kata sandi saat ini$/i), 'SandiLama123!');
    await user.type(screen.getByLabelText(/^kata sandi baru$/i), 'SandiBaru456!');
    await user.type(screen.getByLabelText(/^konfirmasi kata sandi baru$/i), 'Beda12345!');
    await user.click(screen.getByRole('button', { name: /perbarui kata sandi/i }));

    expect(await screen.findByText(/konfirmasi kata sandi tidak cocok/i)).toBeInTheDocument();
    expect(putCalls).toBe(0);
  });
});
