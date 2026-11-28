/**
 * tests/mocks/handlers.ts
 *
 * Handler MSW dasar untuk endpoint auth & sesi (Fase 0).
 * Handler CRUD modul lain ditambahkan per fase mengikuti OpenAPI v1.4.1.
 */

import { http, HttpResponse } from 'msw';

const API = '/api';

export const mockUser = {
  id: 'u-1',
  username: 'mahasiswa',
  email: 'mahasiswa@kampus.ac.id',
  role: 'MAHASISWA',
  profile: { full_name: 'Dimas Arya Pratama' },
};

export const handlers = [
  http.post(`${API}/auth/login`, async () =>
    HttpResponse.json({
      success: true,
      message: 'Login berhasil',
      data: {
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token',
        user: mockUser,
      },
    })
  ),

  http.post(`${API}/auth/refresh`, async () =>
    HttpResponse.json({
      success: true,
      message: 'Token diperbarui',
      data: {
        accessToken: 'mock-access-token-2',
        refreshToken: 'mock-refresh-token-2',
      },
    })
  ),

  http.post(`${API}/auth/logout`, async () =>
    HttpResponse.json({ success: true, message: 'Sesi dicabut', data: null })
  ),

  http.post(`${API}/auth/forgot-password`, async () =>
    HttpResponse.json({
      success: true,
      message: 'Jika email terdaftar, tautan pemulihan telah dikirim.',
      data: null,
    })
  ),

  http.get(`${API}/profile`, async () =>
    HttpResponse.json({
      success: true,
      message: 'Profil ditemukan',
      data: mockUser,
    })
  ),

  http.get(`${API}/dashboard`, async () =>
    HttpResponse.json({
      success: true,
      message: 'Dasbor dimuat',
      data: { role: 'MAHASISWA' },
    })
  ),
];
