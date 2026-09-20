import { z } from 'zod';

export const auditLogQuerySchema = {
  query: z.object({
    page: z
      .string()
      .optional()
      .transform((val) => (val ? parseInt(val, 10) : 1))
      .refine((val) => val > 0, { message: 'Halaman (page) harus lebih besar dari 0' }),
    limit: z
      .string()
      .optional()
      .transform((val) => (val ? parseInt(val, 10) : 20))
      .refine((val) => val > 0 && val <= 100, {
        message: 'Limit harus bernilai antara 1 hingga 100',
      }),
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
    sortBy: z.enum(['waktu', 'action', 'entity']).optional().default('waktu'),
    sortOrder: z.enum(['asc', 'desc', 'ASC', 'DESC']).optional().default('desc'),
  }),
};
