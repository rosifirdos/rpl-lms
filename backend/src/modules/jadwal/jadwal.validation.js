/**
 * Skema validasi Zod untuk modul Jadwal Kuliah (SRS FR-036 s/d FR-038, FR-100 s/d FR-101)
 *
 * Waktu disimpan sebagai string "HH:mm" (VarChar(5)) karena Prisma tidak memiliki
 * tipe Time native (Keputusan Desain #4). Rentang jam operasional kampus 06:00–22:00.
 */

import { z } from 'zod';

export const HARI_JADWAL = ['SENIN', 'SELASA', 'RABU', 'KAMIS', 'JUMAT', 'SABTU'];

// Regex format "HH:mm" 24-jam zero-padded (SRS Bab 32.1 — perbandingan leksikografis aman)
const JAM_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;

const jamSchema = z
  .string({ required_error: 'jam wajib diisi' })
  .regex(JAM_PATTERN, { message: 'Format jam harus "HH:mm" (contoh: 07:30)' });

// Batas jam operasional kampus: 06:00 – 22:00 (SRS Bab 32.1)
const JAM_OPERASIONAL_MIN = '06:00';
const JAM_OPERASIONAL_MAX = '22:00';

const batasJamSchema = jamSchema.superRefine((value, ctx) => {
  if (value < JAM_OPERASIONAL_MIN) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: `Jam tidak boleh lebih awal dari ${JAM_OPERASIONAL_MIN} (jam operasional kampus)`,
    });
  }
  if (value > JAM_OPERASIONAL_MAX) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: `Jam tidak boleh lebih lambat dari ${JAM_OPERASIONAL_MAX} (jam operasional kampus)`,
    });
  }
});

const semesterId = z.string().uuid({ message: 'semester_id harus berupa UUID yang valid' });

// ================================
// Body: POST/PUT /api/v1/jadwal
// ================================

export const createJadwalSchema = z
  .object({
    kelas_id: z.string().uuid({ message: 'kelas_id harus berupa UUID yang valid' }),
    hari: z.enum(HARI_JADWAL, { message: `hari harus salah satu dari: ${HARI_JADWAL.join(', ')}` }),
    jam_mulai: batasJamSchema,
    jam_selesai: batasJamSchema,
  })
  .strict()
  .refine((data) => data.jam_mulai < data.jam_selesai, {
    message: 'jam_mulai harus lebih awal dari jam_selesai',
    path: ['jam_mulai'],
  });

export const updateJadwalSchema = z
  .object({
    kelas_id: z.string().uuid({ message: 'kelas_id harus berupa UUID yang valid' }).optional(),
    hari: z.enum(HARI_JADWAL, { message: `hari harus salah satu dari: ${HARI_JADWAL.join(', ')}` }).optional(),
    jam_mulai: batasJamSchema.optional(),
    jam_selesai: batasJamSchema.optional(),
  })
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    message: 'Minimal satu field jadwal harus diisi',
  })
  .refine(
    (data) => {
      // Bila keduanya diisi, validasi urutan; bila hanya salah satu, lolos (default lama dipakai).
      if (data.jam_mulai && data.jam_selesai) {
        return data.jam_mulai < data.jam_selesai;
      }
      return true;
    },
    { message: 'jam_mulai harus lebih awal dari jam_selesai', path: ['jam_mulai'] }
  );

// ================================
// Params & Query
// ================================

export const jadwalIdParamsSchema = z
  .object({ id: z.string().uuid({ message: 'id jadwal harus berupa UUID yang valid' }) })
  .strict();

export const jadwalQuerySchema = z
  .object({
    semester_id: semesterId.optional(),
    prodi_id: z.string().uuid().optional(),
    kelas_id: z.string().uuid().optional(),
    dosen_id: z.string().uuid().optional(),
    hari: z.enum(HARI_JADWAL).optional(),
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(50),
  })
  .strict();

export const jadwalSayaQuerySchema = z
  .object({
    view: z.enum(['list', 'calendar']).default('list'),
    semester_id: semesterId.optional(),
    mulai: z.string().datetime({ message: 'Format mulai harus ISO 8601' }).optional(),
    selesai: z.string().datetime({ message: 'Format selesai harus ISO 8601' }).optional(),
  })
  .strict()
  .refine((data) => !data.mulai || !data.selesai || new Date(data.mulai) <= new Date(data.selesai), {
    message: 'mulai tidak boleh lebih lambat dari selesai',
    path: ['mulai'],
  });
