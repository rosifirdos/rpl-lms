/**
 * services/endpoints/profile.ts
 *
 * Endpoint profil mandiri (FR-005 s/d FR-008). Fase 1 hanya memakai
 * `getProfile` untuk bootstrap sesi; mutasi biodata/avatar/sandi
 * dikerjakan Fase 2.
 */

import { requestData } from '../http';
import type { BackendUser } from '../../types/auth';

export const profileApi = {
  async getProfile(): Promise<BackendUser> {
    const { data } = await requestData<BackendUser>({
      method: 'GET',
      url: '/profile',
    });
    return data;
  },
};
