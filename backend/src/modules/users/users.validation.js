import { z } from 'zod';
import { ALL_ROLES } from '../../constants/roles.js';

export const updateUserRolesSchema = {
  params: z.object({
    id: z.string().uuid({ message: 'Format ID pengguna harus UUID valid' }),
  }),
  body: z.object({
    roles: z.array(z.enum(ALL_ROLES, { message: 'Nama role tidak valid' }))
      .min(1, { message: 'Pengguna minimal harus memiliki sampai satu role' }),
  }),
};

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

export const userListQuerySchema = {
  query: z.object({
    page: z.coerce.number().int().positive().optional().default(1),
    limit: z.coerce.number().int().min(1).max(100).optional().default(20),
    role: z.enum(ALL_ROLES).optional(),
    status: z.enum(['ACTIVE', 'INACTIVE', 'SUSPENDED']).optional(),
    search: z.string().trim().optional(),
  }),
};
