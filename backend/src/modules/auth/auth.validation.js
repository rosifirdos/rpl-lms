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
    oldPassword: z.string().optional(),
    old_password: z.string().optional(),
    newPassword: z.string().optional(),
    new_password: z.string().optional(),
    confirmPassword: z.string().optional(),
    confirm_password: z.string().optional(),
  })
  .refine((data) => data.oldPassword || data.old_password, {
    message: 'Password lama wajib diisi',
    path: ['oldPassword'],
  })
  .refine(
    (data) => {
      const np = data.newPassword || data.new_password;
      return typeof np === 'string' && np.length >= 8;
    },
    {
      message: 'Password baru minimal 8 karakter',
      path: ['newPassword'],
    }
  )
  .refine(
    (data) => {
      const np = data.newPassword || data.new_password;
      const cp = data.confirmPassword || data.confirm_password;
      if (cp !== undefined) {
        return np === cp;
      }
      return true;
    },
    {
      message: 'Konfirmasi password baru tidak cocok dengan password baru',
      path: ['confirmPassword'],
    }
  )
  .transform((data) => ({
    oldPassword: data.oldPassword || data.old_password,
    newPassword: data.newPassword || data.new_password,
    confirmPassword: data.confirmPassword || data.confirm_password,
  }));

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
