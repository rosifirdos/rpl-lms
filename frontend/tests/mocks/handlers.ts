/**
 * tests/mocks/handlers.ts
 *
 * Handler MSW dasar untuk endpoint auth & sesi — bentuk respons mencerminkan
 * backend (auth.service.js / profile.service.js, OpenAPI v1.4.1).
 * Handler CRUD modul lain ditambahkan per fase.
 */

import { http, HttpResponse } from 'msw';

const API = '/api';

/** User mentah sesuai respons backend (role lowercase enum Prisma). */
export const mockBackendUser = {
  id: 'u-1',
  username: 'dimas.arya',
  email: 'dimas.arya@kampus.ac.id',
  status: 'ACTIVE' as const,
  role: 'mahasiswa' as const,
  profile: { full_name: 'Dimas Arya Pratama', phone: null, bio: null, avatar_file: null },
  mahasiswa: { nim: '22670014', prodi: 'Teknik Informatika', angkatan: 2022 },
  dosen: null,
};

export const mockAdminUser = {
  ...mockBackendUser,
  id: 'u-admin',
  username: 'admin',
  email: 'admin@kampus.ac.id',
  role: 'admin' as const,
  profile: { full_name: 'Admin Sistem', phone: null, bio: null, avatar_file: null },
  mahasiswa: null,
  dosen: null,
};

export const handlers = [
  http.post(`${API}/auth/login`, async () =>
    HttpResponse.json({
      success: true,
      message: 'Login berhasil',
      data: {
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token',
        user: mockBackendUser,
      },
    })
  ),

  http.post(`${API}/auth/refresh`, async () =>
    HttpResponse.json({
      success: true,
      message: 'Access token diperbarui',
      data: { accessToken: 'mock-access-token-refreshed' },
    })
  ),

  http.post(`${API}/auth/logout`, async () =>
    HttpResponse.json({ success: true, message: 'Sesi berhasil diakhiri', data: null })
  ),

  http.post(`${API}/auth/forgot-password`, async () =>
    HttpResponse.json({
      success: true,
      message: 'Jika email terdaftar, tautan pemulihan telah dikirimkan.',
      data: null,
    })
  ),

  http.post(`${API}/auth/reset-password/validate`, async () =>
    HttpResponse.json({
      success: true,
      message: 'Token valid',
      data: { valid: true, expires_at: new Date(Date.now() + 30 * 60_000).toISOString() },
    })
  ),

  http.post(`${API}/auth/reset-password`, async () =>
    HttpResponse.json({
      success: true,
      message: 'Kata sandi berhasil diperbarui',
      data: null,
    })
  ),

  http.get(`${API}/profile`, async () =>
    HttpResponse.json({
      success: true,
      message: 'Profil ditemukan',
      data: mockBackendUser,
    })
  ),

  http.put(`${API}/profile`, async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    return HttpResponse.json({
      success: true,
      message: 'Profil berhasil diperbarui',
      data: {
        ...mockBackendUser,
        profile: { ...mockBackendUser.profile, ...body },
      },
    });
  }),

  http.post(`${API}/profile/avatar`, async () =>
    HttpResponse.json({
      success: true,
      message: 'Foto profil berhasil diperbarui',
      data: {
        ...mockBackendUser,
        profile: {
          ...mockBackendUser.profile,
          avatar_file: {
            id: 'file-avatar-1',
            original_name: 'avatar.png',
            mime_type: 'image/png',
            size_bytes: 1024,
          },
        },
      },
    })
  ),

  http.get(`${API}/profile/avatar`, async () =>
    HttpResponse.arrayBuffer(new TextEncoder().encode('fake-png-bytes').buffer as ArrayBuffer, {
      headers: { 'Content-Type': 'image/png', 'Content-Disposition': 'inline; filename="avatar.png"' },
    })
  ),

  http.put(`${API}/profile/password`, async () =>
    HttpResponse.json({
      success: true,
      message: 'Kata sandi berhasil diperbarui. Silakan masuk kembali.',
      data: null,
    })
  ),

  http.get(`${API}/dashboard`, async () =>
    HttpResponse.json({
      success: true,
      message: 'Dasbor dimuat',
      data: { role: 'mahasiswa' },
    })
  ),
];

// ---------------------------------------------------------------------------
// Handler varian untuk skenario gagal (dipakai via server.use(...))
// ---------------------------------------------------------------------------

export const loginUnauthorizedHandler = http.post(`${API}/auth/login`, async () =>
  HttpResponse.json(
    { success: false, message: 'Kredensial tidak valid: username/email atau password salah' },
    { status: 401 }
  )
);

export const loginSuspendedHandler = http.post(`${API}/auth/login`, async () =>
  HttpResponse.json(
    {
      success: false,
      message:
        'Akses login ditolak: Akun Anda sedang berstatus ditangguhkan (SUSPENDED). Silakan hubungi administrator.',
    },
    { status: 403 }
  )
);

export const refreshFailureHandler = http.post(`${API}/auth/refresh`, async () =>
  HttpResponse.json(
    { success: false, message: 'Refresh token tidak valid atau telah dicabut' },
    { status: 401 }
  )
);

export const invalidResetTokenHandler = http.post(`${API}/auth/reset-password/validate`, async () =>
  HttpResponse.json(
    { success: false, message: 'Token reset tidak valid, telah digunakan, atau kedaluwarsa' },
    { status: 400 }
  )
);

// ---------------------------------------------------------------------------
// Handler varian profil (dipakai via server.use(...))
// ---------------------------------------------------------------------------

export const wrongOldPasswordHandler = http.put(`${API}/profile/password`, async () =>
  HttpResponse.json(
    { success: false, message: 'Kata sandi lama tidak sesuai' },
    { status: 400 }
  )
);

export const avatarTooLargeHandler = http.post(`${API}/profile/avatar`, async () =>
  HttpResponse.json(
    { success: false, message: 'Ukuran berkas melebihi batas maksimal yang diizinkan (maks. 2MB)' },
    { status: 413 }
  )
);

export const noAvatarHandler = http.get(`${API}/profile/avatar`, async () =>
  HttpResponse.json({ success: false, message: 'Foto profil belum diunggah' }, { status: 404 })
);
