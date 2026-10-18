import { z } from 'zod';

export const auditLogQuerySchema = {
  query: z.object({
    page: z.coerce
      .number({ invalid_type_error: 'Halaman (page) harus berupa angka' })
      .int({ message: 'Halaman (page) harus bilangan bulat' })
      .positive({ message: 'Halaman (page) harus lebih besar dari 0' })
      .optional()
      .default(1),
    limit: z.coerce
      .number({ invalid_type_error: 'Limit harus berupa angka' })
      .int({ message: 'Limit harus bilangan bulat' })
      .min(1, { message: 'Limit harus bernilai antara 1 hingga 100' })
      .max(100, { message: 'Limit harus bernilai antara 1 hingga 100' })
      .optional()
      .default(20),
    action: z.string().trim().optional(),
    entity: z.string().trim().optional(),
    userId: z.string().uuid({ message: 'Format userId harus UUID valid' }).optional(),
    startDate: z
      .string()
      .optional()
      .refine((val) => !val || !isNaN(Date.parse(val)), {
        message: 'Format startDate harus tanggal yang valid',
      }),
    endDate: z
      .string()
      .optional()
      .refine((val) => !val || !isNaN(Date.parse(val)), {
        message: 'Format endDate harus tanggal yang valid',
      }),
    search: z.string().trim().optional(),
    sortBy: z.enum(['created_at', 'waktu', 'action', 'entity']).optional().default('created_at'),
    sortOrder: z.enum(['asc', 'desc', 'ASC', 'DESC']).optional().default('desc'),
  }),
};

export const auditLogIdParamSchema = {
  params: z.object({
    id: z.string().uuid({ message: 'Format ID jejak audit harus UUID valid' }),
  }),
};
