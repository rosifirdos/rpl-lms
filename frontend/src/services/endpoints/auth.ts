/**
 * services/endpoints/auth.ts
 *
 * Endpoint autentikasi sesuai backend auth.routes.js (OpenAPI v1.4.1):
 * - POST /auth/login                    { identifier, password }
 * - POST /auth/logout                   { refreshToken } (opsional)
 * - POST /auth/forgot-password          { email } → pesan generik anti-enumerasi
 * - POST /auth/reset-password/validate  { token } → { valid, expires_at }
 * - POST /auth/reset-password           { token, new_password }
 *
 * Catatan: POST /auth/refresh ditangani khusus oleh services/http.ts
 * (mutex + antrean) dan tidak diekspos di sini.
 */

import { requestData } from '../http';
import type {
  LoginResponseData,
  ValidateResetTokenResponse,
} from '../../types/auth';

export const authApi = {
  async login(payload: { identifier: string; password: string }): Promise<LoginResponseData> {
    const { data } = await requestData<LoginResponseData>({
      method: 'POST',
      url: '/auth/login',
      data: payload,
    });
    return data;
  },

  /** Best-effort: kegagalan jaringan tidak boleh menggagalkan logout lokal. */
  async logout(refreshToken?: string | null): Promise<void> {
    try {
      await requestData({
        method: 'POST',
        url: '/auth/logout',
        data: refreshToken ? { refreshToken } : {},
      });
    } catch {
      /* token sudah dicabut di lokal; biarkan sesi bersih */
    }
  },

  async forgotPassword(email: string): Promise<string> {
    const { message } = await requestData<null>({
      method: 'POST',
      url: '/auth/forgot-password',
      data: { email },
    });
    return message;
  },

  async validateResetToken(token: string): Promise<ValidateResetTokenResponse> {
    const { data } = await requestData<ValidateResetTokenResponse>({
      method: 'POST',
      url: '/auth/reset-password/validate',
      data: { token },
    });
    return data;
  },

  async resetPassword(payload: { token: string; new_password: string }): Promise<string> {
    const { message } = await requestData<null>({
      method: 'POST',
      url: '/auth/reset-password',
      data: payload,
    });
    return message;
  },
};
