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
