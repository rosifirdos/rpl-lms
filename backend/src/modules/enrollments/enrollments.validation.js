import { z } from 'zod';

export const enrollmentIdParamSchema = {
  params: z.object({
    id: z.string().uuid({ message: 'Format ID enrollment harus UUID valid' }),
  }),
};

export const classIdParamSchema = {
  params: z.object({
    classId: z.string().uuid({ message: 'Format ID kelas harus UUID valid' }),
  }),
};

export const createEnrollmentSchema = {
  body: z
    .object({
      class_id: z.string().uuid({ message: 'ID kelas harus UUID valid' }),
      student_id: z.string().uuid({ message: 'ID mahasiswa harus UUID valid' }).optional(),
      student_ids: z
        .array(z.string().uuid({ message: 'Setiap ID mahasiswa harus UUID valid' }))
        .min(1, 'Daftar ID mahasiswa tidak boleh kosong')
        .optional(),
    })
    .refine((data) => Boolean(data.student_id || (data.student_ids && data.student_ids.length > 0)), {
      message: 'student_id atau student_ids wajib disertakan',
    }),
};

export const enrollmentListQuerySchema = {
  query: z.object({
    page: z.coerce.number().int().positive().optional().default(1),
    limit: z.coerce.number().int().min(1).max(100).optional().default(20),
    search: z.string().trim().max(150).optional(),
  }),
};
