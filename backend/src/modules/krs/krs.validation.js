/**
 * Skema validasi Zod untuk modul KRS (SRS FR-022 s/d FR-035, FR-102, FR-103)
 */

import { z } from 'zod';

const STATUS_KRS = ['DRAFT', 'DIAJUKAN', 'DISETUJUI', 'DIKEMBALIKAN'];

const semesterId = z.string().uuid({ message: 'semester_id harus berupa UUID yang valid' });

// ================================
// Mahasiswa — siklus draft
// ================================

export const krsSemesterQuerySchema = z
  .object({ semester_id: semesterId.optional() })
  .strict();

export const krsRequiredSemesterQuerySchema = z
  .object({ semester_id: semesterId })
  .strict();

// POST /api/v1/krs/saya/items
export const tambahKrsItemSchema = z
  .object({ kelas_id: z.string().uuid({ message: 'kelas_id harus berupa UUID yang valid' }) })
  .strict();

// DELETE /api/v1/krs/saya/items/:detailId
export const hapusKrsItemParamsSchema = z
  .object({ detailId: z.string().uuid({ message: 'detailId harus berupa UUID yang valid' }) })
  .strict();

// POST /api/v1/krs/saya/submit
export const submitKrsSchema = z
  .object({ semester_id: semesterId.optional() })
  .strict();

// ================================
// Dosen Wali/PA — persetujuan (Fase 9)
// ================================

export const krsIdParamsSchema = z.object({ id: z.string().uuid({ message: 'id KRS harus berupa UUID yang valid' }) }).strict();

export const kembalikanKrsSchema = z
  .object({
    catatan: z
      .string({ required_error: 'catatan wajib diisi saat mengembalikan KRS' })
      .min(10, { message: 'Catatan revisi minimal 10 karakter' })
      .max(500, { message: 'Catatan revisi maksimal 500 karakter' }),
  })
  .strict();

export const pengajuanQuerySchema = z
  .object({
    semester_id: semesterId.optional(),
    status: z.enum(STATUS_KRS).optional(),
    mahasiswa_id: z.string().uuid().optional(),
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
  })
  .strict();

// ================================
// Admin Akademik — periode KRS
// ================================

export const periodeQuerySchema = z
  .object({
    semester_id: semesterId.optional(),
    is_aktif: z.enum(['true', 'false']).optional(),
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
  })
  .strict();

export const createPeriodeSchema = z
  .object({
    semester_id: semesterId,
    nama: z.string({ required_error: 'nama periode wajib diisi' }).min(3).max(200),
    tanggal_mulai: z.string().datetime({ message: 'Format tanggal_mulai harus ISO 8601' }),
    tanggal_selesai: z.string().datetime({ message: 'Format tanggal_selesai harus ISO 8601' }),
    sks_maks: z.coerce.number().int().min(1).max(60).default(24),
    is_aktif: z.boolean().default(false),
  })
  .strict()
  .refine((data) => new Date(data.tanggal_mulai) < new Date(data.tanggal_selesai), {
    message: 'tanggal_mulai harus lebih awal dari tanggal_selesai',
    path: ['tanggal_mulai'],
  });

export const updatePeriodeSchema = z
  .object({
    nama: z.string().min(3).max(200).optional(),
    tanggal_mulai: z.string().datetime().optional(),
    tanggal_selesai: z.string().datetime().optional(),
    sks_maks: z.coerce.number().int().min(1).max(60).optional(),
  })
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    message: 'Minimal satu field periode harus diisi',
  })
  .refine(
    (data) => !data.tanggal_mulai || !data.tanggal_selesai || new Date(data.tanggal_mulai) < new Date(data.tanggal_selesai),
    { message: 'tanggal_mulai harus lebih awal dari tanggal_selesai', path: ['tanggal_mulai'] }
  );

export const periodeIdParamsSchema = z.object({ id: z.string().uuid({ message: 'id periode harus berupa UUID yang valid' }) }).strict();

// ================================
// Admin Akademik — monitoring (Fase 9)
// ================================

export const monitorQuerySchema = z
  .object({
    semester_id: semesterId.optional(),
    status: z.enum(STATUS_KRS).optional(),
    prodi_id: z.string().uuid().optional(),
    dosen_wali_id: z.string().uuid().optional(),
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
  })
  .strict();
