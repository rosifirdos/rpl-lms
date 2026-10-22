import { z } from 'zod';

const courseFields = {
  code: z.string().trim().min(1, 'Kode mata kuliah wajib diisi').max(20).transform((value) => value.toUpperCase()),
  name: z.string().trim().min(2, 'Nama mata kuliah minimal 2 karakter').max(150),
  credits: z.coerce.number().int().min(1).max(6),
  description: z.string().trim().max(10000).nullable().optional(),
};

export const courseIdParamSchema = {
  params: z.object({
    id: z.string().uuid({ message: 'Format ID mata kuliah harus UUID valid' }),
  }),
};

export const createCourseSchema = {
  body: z.object({
    code: courseFields.code,
    name: courseFields.name,
    credits: courseFields.credits,
    description: courseFields.description,
  }),
};

export const updateCourseSchema = {
  params: courseIdParamSchema.params,
  body: z.object({
    code: courseFields.code.optional(),
    name: courseFields.name.optional(),
    credits: courseFields.credits.optional(),
    description: courseFields.description,
  }).refine((data) => Object.keys(data).length > 0, {
    message: 'Minimal satu data mata kuliah harus diperbarui',
  }),
};

export const courseListQuerySchema = {
  query: z.object({
    page: z.coerce.number().int().positive().optional().default(1),
    limit: z.coerce.number().int().min(1).max(100).optional().default(20),
    search: z.string().trim().max(150).optional(),
    is_active: z.enum(['true', 'false']).transform((value) => value === 'true').optional(),
  }),
};
