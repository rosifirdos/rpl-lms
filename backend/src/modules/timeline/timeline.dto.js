import { z } from 'zod';
import { TIMELINE_TYPE_VALUES, TIMELINE_LIMITS } from '../../constants/timeline.js';

const uuid = (label) => z.string().uuid({ message: `Format ${label} harus UUID valid` });

/**
 * Query `GET /api/timeline` (FR-009–FR-012).
 *
 * `from`/`to` ISO 8601 dengan offset; default `now` s.d. `now + 30 hari`.
 * `types` berupa daftar dipisah koma, mis. `ASSIGNMENT,QUIZ`.
 */
export const timelineQuerySchema = {
  query: z
    .object({
      from: z
        .string()
        .datetime({ offset: true, message: 'Parameter from harus tanggal-waktu ISO 8601 dengan offset zona waktu' })
        .optional(),
      to: z
        .string()
        .datetime({ offset: true, message: 'Parameter to harus tanggal-waktu ISO 8601 dengan offset zona waktu' })
        .optional(),
      class_id: uuid('ID kelas').optional(),
      types: z.string().optional(),
      limit: z.coerce
        .number({ message: 'Parameter limit harus berupa angka' })
        .int('Parameter limit harus bilangan bulat')
        .min(TIMELINE_LIMITS.MIN, `Parameter limit minimal ${TIMELINE_LIMITS.MIN}`)
        .max(TIMELINE_LIMITS.MAX, `Parameter limit maksimal ${TIMELINE_LIMITS.MAX}`)
        .optional(),
    })
    .transform((data) => ({
      from: data.from,
      to: data.to,
      class_id: data.class_id,
      types: data.types
        ? data.types
            .split(',')
            .map((type) => type.trim().toUpperCase())
            .filter(Boolean)
        : undefined,
      limit: data.limit,
    }))
    .refine(
      (data) =>
        !data.types ||
        data.types.every((type) => TIMELINE_TYPE_VALUES.includes(type)),
      {
        message: `Parameter types hanya menerima nilai: ${TIMELINE_TYPE_VALUES.join(', ')}`,
        path: ['types'],
      }
    )
    .refine(
      (data) => !data.from || !data.to || new Date(data.from) <= new Date(data.to),
      {
        message: 'Parameter from harus lebih awal atau sama dengan parameter to',
        path: ['from'],
      }
    ),
};
