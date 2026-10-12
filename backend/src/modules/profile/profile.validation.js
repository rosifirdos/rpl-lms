import { z } from 'zod';

export const updateProfileSchema = z.object({
  email: z.string().email('Format email tidak valid').optional(),
  full_name: z
    .string()
    .min(2, 'Nama lengkap minimal 2 karakter')
    .max(150, 'Nama lengkap maksimal 150 karakter')
    .optional(),
  phone: z
    .string()
    .max(20, 'Nomor telepon maksimal 20 karakter')
    .optional()
    .nullable(),
  bio: z
    .string()
    .max(500, 'Bio maksimal 500 karakter')
    .optional()
    .nullable(),
});

export const changeProfilePasswordSchema = z
  .object({
    oldPassword: z.string().optional(),
    old_password: z.string().optional(),
    newPassword: z.string().optional(),
    new_password: z.string().optional(),
    confirmPassword: z.string().optional(),
    confirm_password: z.string().optional(),
  })
  .refine((data) => data.oldPassword || data.old_password, {
    message: 'Kata sandi lama wajib diisi',
    path: ['oldPassword'],
  })
  .refine(
    (data) => {
      const np = data.newPassword || data.new_password;
      return typeof np === 'string' && np.length >= 8;
    },
    {
      message: 'Kata sandi baru minimal 8 karakter',
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
      message: 'Konfirmasi kata sandi baru tidak cocok dengan kata sandi baru',
      path: ['confirmPassword'],
    }
  )
  .transform((data) => ({
    oldPassword: data.oldPassword || data.old_password,
    newPassword: data.newPassword || data.new_password,
  }));
