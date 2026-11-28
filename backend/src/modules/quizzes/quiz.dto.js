import { z } from 'zod';
import {
  QUIZ_DURATION_LIMITS,
  QUIZ_POINTS_LIMITS,
  QUIZ_OPTION_LIMITS,
  QUIZ_QUESTION_TYPES,
} from '../../constants/quiz.js';

const uuid = (label) => z.string().uuid({ message: `Format ${label} harus UUID valid` });

const isoDateTime = (label) =>
  z
    .string({ message: `${label} wajib diisi` })
    .datetime({ offset: true, message: `${label} harus tanggal-waktu ISO 8601 dengan offset zona waktu` });

export const meetingIdParamSchema = {
  params: z.object({
    meetingId: uuid('ID pertemuan'),
  }),
};

export const classIdParamSchema = {
  params: z.object({
    classId: uuid('ID kelas'),
  }),
};

export const quizIdParamSchema = {
  params: z.object({
    id: uuid('ID kuis'),
  }),
};

export const quizQuestionParamSchema = {
  params: z.object({
    id: uuid('ID kuis'),
    questionId: uuid('ID soal'),
  }),
};

export const quizAttemptParamSchema = {
  params: z.object({
    attemptId: uuid('ID percobaan kuis'),
  }),
};

/** Payload pembuatan kuis (FR-025, FR-040). */
export const createQuizSchema = {
  body: z
    .object({
      title: z
        .string({ message: 'Judul kuis wajib diisi' })
        .trim()
        .min(1, 'Judul kuis tidak boleh kosong')
        .max(150, 'Judul kuis maksimal 150 karakter'),
      instructions: z.string().trim().max(2000, 'Instruksi maksimal 2000 karakter').optional(),
      duration_minutes: z
        .number({ message: 'Durasi kuis harus berupa angka' })
        .int('Durasi kuis harus bilangan bulat menit')
        .min(QUIZ_DURATION_LIMITS.MIN_MINUTES, `Durasi kuis minimal ${QUIZ_DURATION_LIMITS.MIN_MINUTES} menit`)
        .max(QUIZ_DURATION_LIMITS.MAX_MINUTES, `Durasi kuis maksimal ${QUIZ_DURATION_LIMITS.MAX_MINUTES} menit`),
      open_at: isoDateTime('Waktu buka kuis'),
      close_at: isoDateTime('Waktu tutup kuis'),
    })
    .strict()
    .refine((data) => new Date(data.open_at) < new Date(data.close_at), {
      message: 'Waktu buka kuis harus lebih awal daripada waktu tutup kuis',
      path: ['open_at'],
    }),
};

/** Payload pembaruan kuis (partial). */
export const updateQuizSchema = {
  body: z
    .object({
      title: z.string().trim().min(1, 'Judul kuis tidak boleh kosong').max(150, 'Judul kuis maksimal 150 karakter').optional(),
      instructions: z.string().trim().max(2000, 'Instruksi maksimal 2000 karakter').nullable().optional(),
      duration_minutes: z
        .number({ message: 'Durasi kuis harus berupa angka' })
        .int('Durasi kuis harus bilangan bulat menit')
        .min(QUIZ_DURATION_LIMITS.MIN_MINUTES, `Durasi kuis minimal ${QUIZ_DURATION_LIMITS.MIN_MINUTES} menit`)
        .max(QUIZ_DURATION_LIMITS.MAX_MINUTES, `Durasi kuis maksimal ${QUIZ_DURATION_LIMITS.MAX_MINUTES} menit`)
        .optional(),
      open_at: isoDateTime('Waktu buka kuis').optional(),
      close_at: isoDateTime('Waktu tutup kuis').optional(),
    })
    .strict()
    .refine((data) => Object.keys(data).length > 0, {
      message: 'Tidak ada data yang diperbarui',
    })
    .refine(
      (data) =>
        !data.open_at ||
        !data.close_at ||
        new Date(data.open_at) < new Date(data.close_at),
      {
        message: 'Waktu buka kuis harus lebih awal daripada waktu tutup kuis',
        path: ['open_at'],
      }
    ),
};

/** Payload publikasi kuis. */
export const publishQuizSchema = {
  body: z.object({
    is_published: z.boolean({ message: 'Status publikasi harus boolean' }),
  }),
};

/** Skema opsi pilihan ganda. */
const optionSchema = z.object({
  option_text: z
    .string({ message: 'Teks opsi wajib diisi' })
    .trim()
    .min(1, 'Teks opsi tidak boleh kosong')
    .max(500, 'Teks opsi maksimal 500 karakter'),
  is_correct: z.boolean({ message: 'Status kunci opsi harus boolean' }),
  order_index: z.number().int().min(1).optional(),
});

/** Payload pembuatan butir soal (FR-040). */
export const createQuestionSchema = {
  body: z
    .object({
      question_text: z
        .string({ message: 'Teks soal wajib diisi' })
        .trim()
        .min(1, 'Teks soal tidak boleh kosong')
        .max(5000, 'Teks soal maksimal 5000 karakter'),
      type: z.enum([QUIZ_QUESTION_TYPES.MULTIPLE_CHOICE, QUIZ_QUESTION_TYPES.ESSAY], {
        message: 'Tipe soal harus MULTIPLE_CHOICE atau ESSAY',
      }),
      points: z
        .number({ message: 'Poin soal harus berupa angka' })
        .min(QUIZ_POINTS_LIMITS.MIN, `Poin soal minimal ${QUIZ_POINTS_LIMITS.MIN}`)
        .max(QUIZ_POINTS_LIMITS.MAX, `Poin soal maksimal ${QUIZ_POINTS_LIMITS.MAX}`)
        .optional(),
      answer_key: z.string().trim().max(5000, 'Kunci jawaban maksimal 5000 karakter').nullable().optional(),
      order_index: z.number().int().min(1).optional(),
      options: z.array(optionSchema).max(QUIZ_OPTION_LIMITS.MAX).optional(),
    })
    .strict()
    .refine(
      (data) => {
        if (data.type === QUIZ_QUESTION_TYPES.MULTIPLE_CHOICE) {
          const options = data.options ?? [];
          return (
            options.length >= QUIZ_OPTION_LIMITS.MIN &&
            options.length <= QUIZ_OPTION_LIMITS.MAX &&
            options.filter((option) => option.is_correct).length === 1
          );
        }
        // Esai: tidak boleh membawa opsi.
        return !data.options || data.options.length === 0;
      },
      {
        message: `Pilihan ganda wajib memiliki ${QUIZ_OPTION_LIMITS.MIN}–${QUIZ_OPTION_LIMITS.MAX} opsi dengan tepat satu kunci jawaban; esai tidak boleh memiliki opsi`,
        path: ['options'],
      }
    ),
};

/** Payload pembaruan butir soal (partial). */
export const updateQuestionSchema = {
  body: z
    .object({
      question_text: z.string().trim().min(1, 'Teks soal tidak boleh kosong').max(5000, 'Teks soal maksimal 5000 karakter').optional(),
      points: z
        .number({ message: 'Poin soal harus berupa angka' })
        .min(QUIZ_POINTS_LIMITS.MIN, `Poin soal minimal ${QUIZ_POINTS_LIMITS.MIN}`)
        .max(QUIZ_POINTS_LIMITS.MAX, `Poin soal maksimal ${QUIZ_POINTS_LIMITS.MAX}`)
        .optional(),
      answer_key: z.string().trim().max(5000, 'Kunci jawaban maksimal 5000 karakter').nullable().optional(),
      order_index: z.number().int().min(1).optional(),
      options: z.array(optionSchema).max(QUIZ_OPTION_LIMITS.MAX).optional(),
    })
    .strict()
    .refine((data) => Object.keys(data).length > 0, {
      message: 'Tidak ada data yang diperbarui',
    })
    .refine(
      (data) => {
        if (data.options === undefined) return true;
        return (
          data.options.length >= QUIZ_OPTION_LIMITS.MIN &&
          data.options.length <= QUIZ_OPTION_LIMITS.MAX &&
          data.options.filter((option) => option.is_correct).length === 1
        );
      },
      {
        message: `Pilihan ganda wajib memiliki ${QUIZ_OPTION_LIMITS.MIN}–${QUIZ_OPTION_LIMITS.MAX} opsi dengan tepat satu kunci jawaban`,
        path: ['options'],
      }
    ),
};

/** Payload penyimpanan jawaban mahasiswa (bisa parsial). */
export const saveAnswersSchema = {
  body: z.object({
    answers: z
      .array(
        z.object({
          question_id: uuid('ID soal'),
          selected_option_id: uuid('ID opsi').nullable().optional(),
          answer_text: z.string().trim().max(10000, 'Jawaban maksimal 10000 karakter').nullable().optional(),
        })
      )
      .min(1, 'Minimal satu jawaban harus dikirim'),
  }),
};

/** Payload penilaian esai oleh dosen/Admin (FR-041). */
export const gradeAttemptSchema = {
  body: z.object({
    answers: z
      .array(
        z.object({
          answer_id: uuid('ID jawaban'),
          points_awarded: z
            .number({ message: 'Poin yang diberikan harus berupa angka' })
            .min(0, 'Poin yang diberikan tidak boleh negatif'),
          feedback: z.string().trim().max(2000, 'Feedback maksimal 2000 karakter').nullable().optional(),
        })
      )
      .min(1, 'Minimal satu penilaian harus dikirim'),
  }),
};
