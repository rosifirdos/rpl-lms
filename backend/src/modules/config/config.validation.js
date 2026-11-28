import { z } from 'zod';

/**
 * Payload pembaruan konfigurasi sistem (FR-049, FR-050).
 *
 * Partial update: hanya bagian yang dikirim yang diubah. Validasi rentang
 * nilai dilakukan ganda — di sini (bentuk umum) dan di `ConfigService`
 * (aturan keamanan hard ceiling).
 */
export const updateConfigSchema = z
  .object({
    file: z
      .object({
        allowed_extensions: z.array(z.string()).optional(),
        max_size_mb: z.number({ message: 'Ukuran maksimal berkas harus berupa angka' }).int().optional(),
      })
      .optional(),
    attendance: z
      .object({
        threshold_percentage: z
          .number({ message: 'Ambang kehadiran harus berupa angka' })
          .int()
          .optional(),
      })
      .optional(),
  })
  .refine((data) => data.file !== undefined || data.attendance !== undefined, {
    message: 'Minimal satu konfigurasi harus dikirim',
  });
