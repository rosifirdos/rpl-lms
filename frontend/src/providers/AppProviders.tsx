/**
 * providers/AppProviders.tsx
 *
 * Provider global aplikasi (Bab 3.2): QueryClient (TanStack Query v5)
 * + AuthProvider. Devtools hanya aktif di lingkungan development.
 */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import type { ReactNode } from 'react';
import { AuthProvider } from './AuthProvider';

// staleTime default 30 detik (data master); dasbor menimpa dengan 10 detik
// pada query key-nya masing-masing (Bab 3.2).
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 0,
    },
  },
});

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>{children}</AuthProvider>
      {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  );
}
