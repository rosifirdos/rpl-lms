import { z } from 'zod';

const uuid = (label) => z.string().uuid({ message: `Format ${label} harus UUID valid` });

export const meetingIdParamSchema = {
  params: z.object({ meetingId: uuid('ID pertemuan') }),
};

export const classIdParamSchema = {
  params: z.object({ classId: uuid('ID kelas') }),
};

export const assignmentIdParamSchema = {
  params: z.object({ id: uuid('ID tugas') }),
};

const weightSchema = z
  .union([z.number(), z.string()])
  .transform((value, ctx) => {
    const number = Number(value);
    if (!Number.isFinite(number)) {
      ctx.addIssue({ code: 'custom', message: 'Bobot tugas harus berupa angka' });
      return z.NEVER;
    }
    if (number < 0 || number > 100) {
      ctx.addIssue({ code: 'custom', message: 'Bobot tugas harus antara 0 hingga 100' });
      return z.NEVER;
    }
    // Maksimal dua desimal. Toleransi kecil mencegah nilai sah seperti 0.29
    // atau 1.1 ditolak karena representasi floating-point (0.29 * 100 =
    // 28.999999999999996), sejalan dengan validasi skor pada submission.
    if (Math.abs(number * 100 - Math.round(number * 100)) >= 1e-9) {
      ctx.addIssue({ code: 'custom', message: 'Bobot tugas maksimal memiliki 2 angka desimal' });
      return z.NEVER;
    }
    return number;
  });

/**
 * `due_date` menerima ISO 8601 dengan zona waktu eksplisit (`Z` maupun offset
 * seperti `+07:00`). Frontend mengirim waktu lokal ber-offset (handoff Bab
 * 10.2); service menyimpannya sebagai UTC dan membandingkannya dengan jam
 * server (BR-013).
 */
const dueDateSchema = z
  .string()
  .datetime({ offset: true, message: 'due_date harus format ISO 8601 dengan zona waktu' });

const booleanSchema = z.union([z.boolean(), z.enum(['true', 'false'])]).transform((value) => value === true || value === 'true');

export const createAssignmentSchema = {
  body: z.object({
    title: z.string().trim().min(1, 'Judul tugas wajib diisi').max(150, 'Judul tugas maksimal 150 karakter'),
    instructions: z.string().trim().max(5000, 'Instruksi maksimal 5000 karakter').optional().nullable(),
    weight_percentage: weightSchema,
    due_date: dueDateSchema,
    allow_late: booleanSchema.optional().default(false),
    is_published: booleanSchema.optional().default(true),
  }).strict(),
};

export const updateAssignmentSchema = {
  params: assignmentIdParamSchema.params,
  body: z.object({
    title: z.string().trim().min(1, 'Judul tugas tidak boleh kosong').max(150).optional(),
    instructions: z.string().trim().max(5000).nullable().optional(),
    weight_percentage: weightSchema.optional(),
    due_date: dueDateSchema.optional(),
    allow_late: booleanSchema.optional(),
    is_published: booleanSchema.optional(),
  }).strict(),
};
