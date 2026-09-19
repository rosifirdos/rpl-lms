import { z } from 'zod';

export const updateProfileSchema = z.object({
  email: z.string().email('Format email tidak valid').optional(),
  nama: z.string().min(2, 'Nama minimal 2 karakter').max(150, 'Nama maksimal 150 karakter').optional(),
  gelar_depan: z.string().max(30, 'Gelar depan maksimal 30 karakter').optional().nullable(),
  gelar_belakang: z.string().max(50, 'Gelar belakang maksimal 50 karakter').optional().nullable(),
  jalur_pendaftaran: z.string().max(100, 'Jalur pendaftaran maksimal 100 karakter').optional().nullable(),
});
