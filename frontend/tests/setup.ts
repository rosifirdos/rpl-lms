/**
 * tests/setup.ts
 *
 * Setup global Vitest + MSW. Semua request HTTP dalam test ditangkap MSW;
 * request tanpa handler ditandai sebagai error agar kontrak API terjaga.
 */

import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, afterAll, beforeAll, vi } from 'vitest';
import { setupServer } from 'msw/node';
import { handlers } from './mocks/handlers';

export const server = setupServer(...handlers);

beforeAll(() => {
  server.listen({ onUnhandledRequest: 'error' });
});

afterEach(() => {
  cleanup();
  server.resetHandlers();
  window.sessionStorage?.clear?.();
  window.localStorage?.clear?.();
});

afterAll(() => {
  server.close();
});

// jsdom tidak mengimplementasikan matchMedia — dipakai AppShell (breakpoint sidebar).
if (typeof window !== 'undefined' && !window.matchMedia) {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));
}
