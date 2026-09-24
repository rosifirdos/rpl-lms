import { z } from 'zod';

/**
 * Skema parameter ID permission (dipakai untuk validasi UUID pada GET /:id
 * agar id non-UUID ditolak 400, bukan 500).
 */
export const permissionIdParamSchema = {
  params: z.object({
    id: z.string().uuid({ message: 'Format ID permission harus UUID valid' }),
  }),
};

export const createPermissionSchema = {
  body: z.object({
    code: z
      .string({ required_error: 'Kode permission wajib diisi' })
      .trim()
      .min(3, { message: 'Kode permission minimal 3 karakter' })
      .max(50, { message: 'Kode permission maksimal 50 karakter' })
      .toLowerCase(),
    name: z
      .string({ required_error: 'Nama permission wajib diisi' })
      .trim()
      .min(3, { message: 'Nama permission minimal 3 karakter' })
      .max(100, { message: 'Nama permission maksimal 100 karakter' }),
    description: z.string().trim().optional(),
  }),
};

export const permissionListQuerySchema = {
  query: z.object({
    search: z.string().trim().optional(),
  }),
};
