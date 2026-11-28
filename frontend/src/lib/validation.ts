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

/** Biodata mandiri — mencerminkan updateProfileSchema backend (FR-006). */
export const biodataSchema = z.object({
  full_name: z
    .string()
    .trim()
    .min(2, 'Nama lengkap minimal 2 karakter')
    .max(150, 'Nama lengkap maksimal 150 karakter'),
  phone: z
    .string()
    .trim()
    .max(20, 'Nomor telepon maksimal 20 karakter')
    .optional()
    .or(z.literal('')),
  bio: z
    .string()
    .max(500, 'Bio maksimal 500 karakter')
    .optional()
    .or(z.literal('')),
});

export type BiodataFormValues = z.infer<typeof biodataSchema>;

/** Ganti kata sandi mandiri — mencerminkan changeProfilePasswordSchema backend (FR-008). */
export const changePasswordSchema = z
  .object({
    oldPassword: z.string().min(1, 'Kata sandi lama wajib diisi'),
    newPassword: z.string().min(8, 'Kata sandi baru minimal 8 karakter'),
    confirmPassword: z.string().min(1, 'Konfirmasi kata sandi wajib diisi'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Konfirmasi kata sandi tidak cocok dengan kata sandi baru',
    path: ['confirmPassword'],
  })
  .refine((data) => data.newPassword !== data.oldPassword, {
    message: 'Kata sandi baru harus berbeda dari kata sandi lama',
    path: ['newPassword'],
  });

export type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>;

/**
 * Skor kekuatan kata sandi (0–4): panjang ≥ 8, huruf besar, angka,
 * karakter non-alfanumerik. Dipakai indikator kekuatan di form sandi.
 */
export function passwordStrength(password: string): { score: number; label: string; color: string } {
  if (!password) return { score: 0, label: 'Kosong', color: 'bg-outline-variant' };
  let points = 0;
  if (password.length >= 8) points += 1;
  if (/[A-Z]/.test(password)) points += 1;
  if (/[0-9]/.test(password)) points += 1;
  if (/[^A-Za-z0-9]/.test(password)) points += 1;

  if (points <= 1) return { score: 25, label: 'Lemah', color: 'bg-error' };
  if (points === 2) return { score: 50, label: 'Cukup', color: 'bg-warning-solid' };
  if (points === 3) return { score: 75, label: 'Kuat', color: 'bg-secondary' };
  return { score: 100, label: 'Sangat Kuat', color: 'bg-tertiary' };
}
