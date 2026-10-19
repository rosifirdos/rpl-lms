import { z } from 'zod';
import { ALL_ROLES } from '../../constants/roles.js';
import { validatePasswordComplexity } from '../../utils/password.js';

/**
 * Skema parameter ID pengguna (UUID)
 */
export const userIdParamSchema = {
  params: z.object({
    id: z.string().uuid({ message: 'Format ID pengguna harus UUID valid' }),
  }),
};

/**
 * Skema pembuatan pengguna baru (Admin only)
 */
const createUserBodySchema = z.object({
    username: z
      .string({ required_error: 'Username wajib diisi' })
      .trim()
      .min(3, { message: 'Username minimal 3 karakter' })
      .max(50, { message: 'Username maksimal 50 karakter' }),
    email: z
      .string({ required_error: 'Email wajib diisi' })
      .trim()
      .email({ message: 'Format email tidak valid' }),
    password: z
      .string({ required_error: 'Password wajib diisi' })
      .min(8, { message: 'Password minimal 8 karakter' }),
    status: z.enum(['ACTIVE', 'INACTIVE', 'SUSPENDED']).optional().default('ACTIVE'),
    role: z.enum(ALL_ROLES, {
      required_error: 'Role wajib diisi',
      message: `Role harus salah satu: ${ALL_ROLES.join(', ')}`,
    }),
    full_name: z
      .string()
      .trim()
      .min(2, { message: 'Nama lengkap minimal 2 karakter' })
      .max(150, { message: 'Nama lengkap maksimal 150 karakter' })
      .optional(),
    nim: z.string().trim().min(3).max(20).optional(),
    prodi: z.string().trim().min(2).max(150).optional(),
    angkatan: z.coerce.number().int().min(1900).max(9999).optional(),
    nidn: z.string().trim().min(1).max(20).optional(),
    nip: z.string().trim().min(1).max(30).optional(),
    gelar_depan: z.string().trim().max(30).optional(),
    gelar_belakang: z.string().trim().max(30).optional(),
  }).superRefine((user, ctx) => {
    if (user.role === 'mahasiswa') {
      for (const field of ['nim', 'prodi', 'angkatan']) {
        if (user[field] === undefined) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: [field],
            message: `Data ${field} wajib diisi untuk akun mahasiswa`,
          });
        }
      }
    }

    if (user.role === 'dosen' && !user.nidn && !user.nip) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['nidn'],
        message: 'NIDN atau NIP wajib diisi untuk akun dosen',
      });
    }
  });

export const createUserSchema = {
  body: createUserBodySchema,
};

/**
 * Skema update pengguna (Admin only)
 */
export const updateUserSchema = {
  params: z.object({
    id: z.string().uuid({ message: 'Format ID pengguna harus UUID valid' }),
  }),
  body: z.object({
    email: z.string().trim().email({ message: 'Format email tidak valid' }).optional(),
    role: z.enum(ALL_ROLES, {
      message: `Role harus salah satu: ${ALL_ROLES.join(', ')}`,
    }).optional(),
  }),
};

/**
 * Skema update status pengguna
 */
export const updateUserStatusSchema = {
  params: z.object({
    id: z.string().uuid({ message: 'Format ID pengguna harus UUID valid' }),
  }),
  body: z.object({
    status: z.enum(['ACTIVE', 'INACTIVE', 'SUSPENDED'], {
      message: 'Status harus ACTIVE, INACTIVE, atau SUSPENDED',
    }),
    reason: z.string().trim().optional(),
  }),
};

/**
 * Skema query list pengguna
 */
export const userListQuerySchema = {
  query: z.object({
    page: z.coerce.number().int().positive().optional().default(1),
    limit: z.coerce.number().int().min(1).max(100).optional().default(20),
    role: z.enum(ALL_ROLES).optional(),
    status: z.enum(['ACTIVE', 'INACTIVE', 'SUSPENDED']).optional(),
    search: z.string().trim().optional(),
  }),
};

export const resetPasswordSchema = {
  params: z.object({
    id: z.string().uuid({ message: 'Format ID pengguna harus UUID valid' }),
  }),
  body: z.object({
    new_password: z
      .string({ required_error: 'Password baru wajib diisi' })
      .min(8, { message: 'Password minimal 8 karakter' })
      .max(100, { message: 'Password maksimal 100 karakter' })
      .superRefine((password, ctx) => {
        const validation = validatePasswordComplexity(password);
        if (!validation.isValid) {
          ctx.addIssue({ code: z.ZodIssueCode.custom, message: validation.message });
        }
      }),
  }),
};
