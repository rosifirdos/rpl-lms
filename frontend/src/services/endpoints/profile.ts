/**
 * services/endpoints/profile.ts
 *
 * Endpoint profil mandiri (FR-005 s/d FR-008, OpenAPI v1.4.1):
 * - GET  /profile            → profil + identitas per peran
 * - PUT  /profile            → { full_name?, phone?, bio?, email? }
 * - POST /profile/avatar     → multipart `avatar` (JPG/PNG ≤ 2 MB)
 * - GET  /profile/avatar     → blob terautentikasi (via downloadFile)
 * - PUT  /profile/password   → { oldPassword, newPassword }
 *
 * Catatan: mengganti kata sandi mencabut SEMUA refresh token aktif
 * (backend auth.service.js) — pemanggil wajib memaksa logout setelah sukses.
 */

import { downloadFile, requestData } from '../http';
import type { BackendUser } from '../../types/auth';

export interface UpdateProfilePayload {
  full_name?: string;
  phone?: string | null;
  bio?: string | null;
  email?: string;
}

export const profileApi = {
  async getProfile(): Promise<BackendUser> {
    const { data } = await requestData<BackendUser>({
      method: 'GET',
      url: '/profile',
    });
    return data;
  },

  async updateProfile(payload: UpdateProfilePayload): Promise<BackendUser> {
    const { data } = await requestData<BackendUser>({
      method: 'PUT',
      url: '/profile',
      data: payload,
    });
    return data;
  },

  /**
   * Unggah avatar multipart; backend memvalidasi JPG/JPEG/PNG ≤ 2 MB.
   *
   * Body multipart dibangun manual (bukan `FormData`) agar deterministik
   * di seluruh lingkungan — browser nyata maupun jsdom/MSW pada test —
   * karena serialisasi `FormData` bawaan axios bergantung pada kelas
   * global `FormData` yang berbeda antar-runtime.
   */
  async uploadAvatar(file: File): Promise<BackendUser> {
    const boundary = `----elearningBoundary${Date.now()}${Math.random().toString(16).slice(2)}`;
    const safeName = file.name.replace(/["\r\n]/g, '_') || 'avatar';
    const header = `--${boundary}\r\nContent-Disposition: form-data; name="avatar"; filename="${safeName}"\r\nContent-Type: ${file.type || 'application/octet-stream'}\r\n\r\n`;
    const footer = `\r\n--${boundary}--\r\n`;

    const headerBytes = new TextEncoder().encode(header);
    const footerBytes = new TextEncoder().encode(footer);
    const fileBytes = new Uint8Array(await file.arrayBuffer());

    const body = new Uint8Array(headerBytes.length + fileBytes.length + footerBytes.length);
    body.set(headerBytes, 0);
    body.set(fileBytes, headerBytes.length);
    body.set(footerBytes, headerBytes.length + fileBytes.length);

    const { data } = await requestData<BackendUser>({
      method: 'POST',
      url: '/profile/avatar',
      data: body.buffer,
      headers: {
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
      },
    });
    return data;
  },

  /**
   * Blob avatar terautentikasi. 404 (belum ada avatar) bukan error bagi
   * pemanggil — dikembalikan `null`.
   */
  async getAvatarBlob(): Promise<Blob | null> {
    try {
      const { blob } = await downloadFile('/profile/avatar');
      return blob;
    } catch {
      return null;
    }
  },

  async changePassword(payload: { oldPassword: string; newPassword: string }): Promise<string> {
    const { message } = await requestData<null>({
      method: 'PUT',
      url: '/profile/password',
      data: payload,
    });
    return message;
  },
};
