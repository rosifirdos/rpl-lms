import { defineConfig } from 'playwright/test';

/**
 * Konfigurasi Playwright (E2E) — dijalankan terhadap dev server Vite
 * yang mem-proxies /api ke backend lokal (lihat vite.config.js).
 * Skenario penuh (login → dasbor → CRUD → enrollment) ditulis Fase 6.
 */
export default defineConfig({
  testDir: './tests/e2e',
  timeout: 60_000,
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
  },
  webServer: process.env.CI
    ? {
        command: 'npm run dev',
        url: 'http://localhost:5173',
        reuseExistingServer: false,
        timeout: 120_000,
      }
    : undefined,
});
