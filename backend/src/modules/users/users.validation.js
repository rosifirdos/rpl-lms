import { z } from 'zod';
import { ALL_ROLES } from '../../constants/roles.js';

/**
 * Skema parameter ID pengguna (dipakai untuk validasi UUID pada GET /:id,
 * PATCH /:id/status, dan PUT /:id/roles agar id non-UUID ditolak 400, bukan 500).
 */
export const userIdParamSchema = {
  params: z.object({
    id: z.string().uuid({ message: 'Format ID pengguna harus UUID valid' }),
  }),
};

export const updateUserRolesSchema = {
  params: z.object({
    id: z.string().uuid({ message: 'Format ID pengguna harus UUID valid' }),
  }),
  body: z.object({
    roles: z.array(z.enum(ALL_ROLES, { message: 'Nama role tidak valid' }))
      .min(1, { message: 'Pengguna minimal harus memiliki satu role' }),
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
    roles: z
      .array(z.enum(ALL_ROLES, { message: 'Nama role tidak valid' }))
      .min(1, { message: 'Pengguna minimal harus memiliki setidaknya satu role' }),
    mahasiswa_profile: z
      .object({
        nim: z.string().trim().min(1, 'NIM wajib diisi').optional(),
        nama: z.string().trim().min(1, 'Nama mahasiswa wajib diisi'),
        prodi_id: z.string().uuid({ message: 'Format prodi_id harus UUID valid' }),
        angkatan: z.coerce.number().int().positive().optional(),
        status_akademik: z.enum(['AKTIF', 'CUTI', 'LULUS', 'DROP_OUT']).optional(),
        dosen_wali_id: z.string().uuid({ message: 'Format dosen_wali_id harus UUID valid' }).nullable().optional(),
      })
      .optional(),
    dosen_profile: z
      .object({
        nidn: z.string().trim().nullable().optional(),
        nip: z.string().trim().nullable().optional(),
        nama: z.string().trim().min(1, 'Nama dosen wajib diisi'),
        gelar_depan: z.string().trim().nullable().optional(),
        gelar_belakang: z.string().trim().nullable().optional(),
        prodi_id: z.string().uuid({ message: 'Format prodi_id harus UUID valid' }).nullable().optional(),
        is_active: z.boolean().optional(),
      })
      .optional(),
    admin_profile: z
      .object({
        nip: z.string().trim().nullable().optional(),
        nama: z.string().trim().min(1, 'Nama admin wajib diisi'),
        unit_kerja: z.string().trim().min(1, 'Unit kerja wajib diisi'),
      })
      .optional(),
    calon_mhs_profile: z
      .object({
        no_pendaftaran: z.string().trim().min(1, 'Nomor pendaftaran wajib diisi').optional(),
        nama: z.string().trim().min(1, 'Nama calon mahasiswa wajib diisi'),
        status_seleksi: z.enum(['MENUNGGU', 'TERVERIFIKASI', 'LULUS', 'TIDAK_LULUS', 'TERDAFTAR_ULANG']).optional(),
        prodi_pilihan_id: z.string().uuid({ message: 'Format prodi_pilihan_id harus UUID valid' }).nullable().optional(),
        jalur_pendaftaran: z.string().trim().nullable().optional(),
      })
      .optional(),
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
