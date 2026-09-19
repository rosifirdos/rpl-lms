import { z } from 'zod';

export const loginSchema = z
  .object({
    identifier: z.string().optional(),
    username: z.string().optional(),
    email: z.string().optional(),
    password: z.string().min(1, 'Password wajib diisi'),
  })
  .refine((data) => data.identifier || data.username || data.email, {
    message: 'Username, email, atau kredensial identitas wajib diisi',
    path: ['identifier'],
  })
  .transform((data) => ({
    identifier: (data.identifier || data.username || data.email).trim(),
    password: data.password,
  }));

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token wajib disertakan'),
});

export const logoutSchema = z.object({
  refreshToken: z.string().optional(),
});

export const changePasswordSchema = z
  .object({
    oldPassword: z.string().min(1, 'Password lama wajib diisi'),
    newPassword: z.string().min(8, 'Password baru minimal 8 karakter'),
    confirmPassword: z.string().min(1, 'Konfirmasi password baru wajib diisi'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Konfirmasi password baru tidak cocok dengan password baru',
    path: ['confirmPassword'],
  });

export const forgotPasswordSchema = z
  .object({
    identifier: z.string().optional(),
    email: z.string().optional(),
  })
  .refine((data) => data.identifier || data.email, {
    message: 'Email atau username identitas akun wajib diisi',
    path: ['email'],
  })
  .transform((data) => ({
    identifier: (data.identifier || data.email).trim(),
  }));
