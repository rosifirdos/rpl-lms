/**
 * tests/e2e/auth.spec.ts
 *
 * Skenario E2E inti (dijalankan dengan `npm run test:e2e`; butuh
 * `npx playwright install` sekali di awal). Skenario lengkap lintas modul
 * diperluas pada Fase 6.
 */

import { test, expect } from '@playwright/test';

test.describe('Autentikasi', () => {
  test('halaman login dapat dibuka', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByRole('heading', { name: /masuk ke e-learning kampus/i })).toBeVisible();
  });
});
