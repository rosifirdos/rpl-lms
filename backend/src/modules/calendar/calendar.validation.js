import { z } from 'zod';

export const createCalendarSchema = z.object({
  semester_id: z.string().uuid({ message: 'semester_id harus berupa UUID yang valid' }),
  agenda: z.string().min(3, { message: 'Agenda minimal 3 karakter' }).max(200, { message: 'Agenda maksimal 200 karakter' }),
  mulai: z.string().datetime({ message: 'Format tanggal mulai harus ISO 8601 (contoh: 2026-09-01T00:00:00.000Z)' }),
  selesai: z.string().datetime({ message: 'Format tanggal selesai harus ISO 8601 (contoh: 2026-09-14T23:59:59.000Z)' }),
  status: z.enum(['DIJADWALKAN', 'BERJALAN', 'SELESAI']).default('DIJADWALKAN').optional(),
}).refine((data) => new Date(data.mulai) <= new Date(data.selesai), {
  message: 'Tanggal mulai tidak boleh melebihi tanggal selesai',
  path: ['mulai'],
});

export const updateCalendarSchema = z.object({
  semester_id: z.string().uuid({ message: 'semester_id harus berupa UUID yang valid' }).optional(),
  agenda: z.string().min(3, { message: 'Agenda minimal 3 karakter' }).max(200, { message: 'Agenda maksimal 200 karakter' }).optional(),
  mulai: z.string().datetime({ message: 'Format tanggal mulai harus ISO 8601' }).optional(),
  selesai: z.string().datetime({ message: 'Format tanggal selesai harus ISO 8601' }).optional(),
  status: z.enum(['DIJADWALKAN', 'BERJALAN', 'SELESAI']).optional(),
}).refine((data) => {
  if (data.mulai && data.selesai) {
    return new Date(data.mulai) <= new Date(data.selesai);
  }
  return true;
}, {
  message: 'Tanggal mulai tidak boleh melebihi tanggal selesai',
  path: ['mulai'],
});

export const getCalendarQuerySchema = z.object({
  semester_id: z.string().uuid().optional(),
  status: z.enum(['DIJADWALKAN', 'BERJALAN', 'SELESAI']).optional(),
  page: z.coerce.number().int().min(1).default(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(50).optional(),
  search: z.string().optional(),
});
