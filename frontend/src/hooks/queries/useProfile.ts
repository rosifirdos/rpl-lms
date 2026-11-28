/**
 * hooks/queries/useProfile.ts
 *
 * Server-state profil (TanStack Query, Bab 3.2):
 * - ['profile'] — GET /profile, staleTime 30s (data master profil).
 * - ['avatar']  — blob GET /profile/avatar → object URL; 404 → null
 *   (belum ada avatar). Object URL di-revoke saat query diganti/dibuang.
 */

import { useQuery, useQueryClient, type UseQueryResult } from '@tanstack/react-query';
import { useEffect } from 'react';
import { profileApi } from '../../services/endpoints/profile';
import type { BackendUser } from '../../types/auth';

export function useProfileQuery(): UseQueryResult<BackendUser> {
  return useQuery({
    queryKey: ['profile'],
    queryFn: () => profileApi.getProfile(),
    staleTime: 30_000,
  });
}

async function fetchAvatarUrl(): Promise<string | null> {
  const blob = await profileApi.getAvatarBlob();
  if (!blob) return null;
  if (typeof URL === 'undefined' || typeof URL.createObjectURL !== 'function') {
    return null;
  }
  return URL.createObjectURL(blob);
}

export function useAvatarQuery(): UseQueryResult<string | null> {
  const query = useQuery({
    queryKey: ['avatar'],
    queryFn: fetchAvatarUrl,
    staleTime: 5 * 60_000,
    retry: false,
  });

  // Lepas object URL lama saat diganti/unmount agar memori tidak bocor.
  useEffect(() => {
    const previous = query.data;
    return () => {
      if (previous && typeof URL !== 'undefined' && typeof URL.revokeObjectURL === 'function') {
        URL.revokeObjectURL(previous);
      }
    };
  }, [query.data]);

  return query;
}

/** Invalidasi cache profil + avatar setelah mutasi berhasil. */
export function useInvalidateProfileCache(): () => void {
  const queryClient = useQueryClient();
  return () => {
    void queryClient.invalidateQueries({ queryKey: ['profile'] });
    void queryClient.invalidateQueries({ queryKey: ['avatar'] });
  };
}
