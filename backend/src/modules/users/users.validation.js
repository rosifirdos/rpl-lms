import { z } from 'zod';
import { ALL_ROLES } from '../../constants/roles.js';

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
export const createUserSchema = {
  body: z.object({
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
  }),
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
 * Skema reset password pengguna oleh Admin (FR-044, SRS Bab 35)
 */
export const resetPasswordSchema = {
  params: z.object({
    id: z.string().uuid({ message: 'Format ID pengguna harus UUID valid' }),
  }),
  body: z.object({
    new_password: z
      .string({ required_error: 'Kata sandi baru wajib diisi' })
      .min(8, { message: 'Kata sandi baru minimal 8 karakter' }),
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
