import { z } from 'zod';

const academicYear = z.string().trim().regex(/^\d{4}\/\d{4}$/, {
  message: 'Tahun akademik harus berformat YYYY/YYYY',
});

const classFields = {
  course_id: z.string().uuid({ message: 'ID mata kuliah harus UUID valid' }),
  lecturer_id: z.string().uuid({ message: 'ID dosen harus UUID valid' }),
  academic_year: academicYear,
  semester: z.enum(['ganjil', 'genap']),
  name: z.string().trim().min(1, 'Nama kelas wajib diisi').max(50),
  capacity: z.coerce.number().int().positive('Kapasitas harus lebih besar dari 0'),
};

export const classIdParamSchema = {
  params: z.object({
    id: z.string().uuid({ message: 'Format ID kelas harus UUID valid' }),
  }),
};

export const createClassSchema = {
  body: z.object(classFields),
};

export const updateClassSchema = {
  params: classIdParamSchema.params,
  body: z.object({
    course_id: classFields.course_id.optional(),
    lecturer_id: classFields.lecturer_id.optional(),
    academic_year: classFields.academic_year.optional(),
    semester: classFields.semester.optional(),
    name: classFields.name.optional(),
    capacity: classFields.capacity.optional(),
  }).refine((data) => Object.keys(data).length > 0, {
    message: 'Minimal satu data kelas harus diperbarui',
  }),
};

export const classListQuerySchema = {
  query: z.object({
    page: z.coerce.number().int().positive().optional().default(1),
    limit: z.coerce.number().int().min(1).max(100).optional().default(20),
    search: z.string().trim().max(150).optional(),
    academic_year: academicYear.optional(),
    semester: z.enum(['ganjil', 'genap']).optional(),
    course_id: z.string().uuid({ message: 'ID mata kuliah harus UUID valid' }).optional(),
    lecturer_id: z.string().uuid({ message: 'ID dosen harus UUID valid' }).optional(),
  }),
};
