import { z } from 'zod';

const uuid = (label) => z.string().uuid({ message: `Format ${label} harus UUID valid` });

export const assignmentIdParamSchema = {
  params: z.object({ assignmentId: uuid('ID tugas') }),
};

export const submissionIdParamSchema = {
  params: z.object({ id: uuid('ID submission') }),
};

/**
 * Schema for grading a submission (`PUT /api/submissions/:id/grade`).
 *
 * - `score`: required numeric value in the range 0-100 with at most two decimal
 *   places. The `refine` guard guarantees the precision required by the SRS
 *   (FR-035).
 * - `feedback`: optional free-text comment up to 2000 characters. It may be
 *   omitted or sent as `null` to clear existing feedback.
 */
export const gradeSubmissionSchema = {
  params: z.object({ id: uuid('ID submission') }),
  body: z.object({
    score: z
      .number({ invalid_type_error: 'Score harus berupa angka' })
      .min(0, { message: 'Nilai harus berupa angka di antara 0 hingga 100' })
      .max(100, { message: 'Nilai harus berupa angka di antara 0 hingga 100' })
      // Enforce at most two decimal places (e.g. 87.25 is ok, 85.555 is not).
      // A small tolerance keeps legitimate two-decimal values (e.g. 0.29) from
      // being rejected because of binary floating-point representation.
      .refine((v) => Math.abs(v * 100 - Math.round(v * 100)) < 1e-9, {
        message: 'Score dapat memiliki maksimal 2 digit desimal',
      })
      .refine(Number.isFinite, { message: 'Nilai harus berupa angka di antara 0 hingga 100' }),
    // Optional; when present it may be `null` or a string up to 2000 characters.
    feedback: z.union([z.string().trim().max(2000, 'Feedback maksimal 2000 karakter'), z.null()]).optional(),
  }).strict(),
};
