import { z } from 'zod';

/**
 * Skema parameter ID role (dipakai untuk validasi UUID pada GET /:id
 * dan PUT /:id/permissions agar id non-UUID ditolak 400, bukan 500).
 */
export const roleIdParamSchema = {
  params: z.object({
    id: z.string().uuid({ message: 'Format ID role harus UUID valid' }),
  }),
};

export const createRoleSchema = {
  body: z.object({
    name: z
      .string({ required_error: 'Nama role wajib diisi' })
      .trim()
      .min(2, { message: 'Nama role minimal 2 karakter' })
      .max(50, { message: 'Nama role maksimal 50 karakter' })
      .transform((val) => val.toUpperCase()),
    description: z.string().trim().optional(),
    /**
     * Array elemen permission. Setiap elemen dapat berisi **code** (mis.
     * 'audit:view') **ATAU** id (UUID) permission. Service akan melakukan
     * dedup serta validasi eksplisit per elemen sehingga format campuran
     * maupun duplikat ditangani dengan benar.
     */
    permissions: z
      .array(z.string().trim(), { message: 'Format permissions harus berupa array of string' })
      .optional()
      .default([]),
  }),
};

export const updateRolePermissionsSchema = {
  params: z.object({
    id: z.string().uuid({ message: 'Format ID role harus UUID valid' }),
  }),
  body: z.object({
    permissions: z
      .array(z.string().trim(), { message: 'Format permissions harus berupa array of string' })
      .min(0),
  }),
};

export const roleListQuerySchema = {
  query: z.object({
    search: z.string().trim().optional(),
  }),
};
