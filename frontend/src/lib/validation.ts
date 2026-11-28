/**
 * lib/validation.ts
 *
 * Skema Zod frontend — mencerminkan aturan validasi backend
 * (backend/src/modules/auth/auth.validation.js) untuk form login,
 * lupa password, dan reset password (Bab 3.6).
 */

import { z } from 'zod';

export const loginSchema = z.object({
  identifier: z
    .string()
    .trim()
    .min(1, 'Username, email, NIM, NIDN, atau NIP wajib diisi'),
  password: z.string().min(1, 'Kata sandi wajib diisi'),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

export const forgotPasswordSchema = z.object({
  email: z.string().trim().email('Format email tidak valid. Gunakan email terdaftar kampus.'),
});

export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

export const newPasswordSchema = z
  .object({
    new_password: z
      .string()
      .min(8, 'Kata sandi baru minimal 8 karakter'),
    confirm_password: z.string().min(1, 'Konfirmasi kata sandi wajib diisi'),
  })
  .refine((data) => data.new_password === data.confirm_password, {
    message: 'Konfirmasi kata sandi tidak cocok',
    path: ['confirm_password'],
  });

export type NewPasswordFormValues = z.infer<typeof newPasswordSchema>;
