import { z } from 'zod';

const uuid = (label) => z.string().uuid({ message: `Format ${label} harus UUID valid` });

export const meetingIdParamSchema = {
  params: z.object({
    meetingId: uuid('ID pertemuan'),
  }),
};

export const sessionIdParamSchema = {
  params: z.object({
    sessionId: uuid('ID sesi presensi'),
  }),
};

export const attendanceRecordIdParamSchema = {
  params: z.object({
    id: uuid('ID catatan kehadiran'),
  }),
};

/**
 * Skema pembukaan sesi presensi (Fase 4).
 *
 * `tolerance_minutes` adalah satu-satunya masukan dosen pada endpoint ini.
 * Sebelum skema ini ada, rute `open` hanya memvalidasi `params` sehingga body
 * apa pun diterima dan `tolerance_minutes` dibuang tanpa peringatan — respons
 * 200 tetap menyertakan field tersebut, memberi kesan nilai tersimpan.
 *
 * `.strict()` menolak kolom asing; batas 1–180 menit menjaga nilai tetap masuk
 * akal (SRS Bab 8: penutupan sesi mengikuti durasi perkuliahan).
 */
export const openAttendanceSessionSchema = {
  params: meetingIdParamSchema.params,
  body: z
    .object({
      tolerance_minutes: z
        .number({
          invalid_type_error: 'Toleransi menit harus berupa angka',
          required_error: 'Toleransi menit wajib berupa angka',
        })
        .int({ message: 'Toleransi menit harus bilangan bulat' })
        .min(1, { message: 'Toleransi menit minimal 1 menit' })
        .max(180, { message: 'Toleransi menit maksimal 180 menit' })
        .optional(),
    })
    .strict(),
};

/**
 * Skema penutupan sesi presensi (Fase 4).
 *
 * Endpoint ini tidak menerima masukan apa pun. `.strict()` pada objek kosong
 * menolak body tak dikenal dengan 400 alih-alih diam-diam mengabaikannya.
 */
export const closeAttendanceSessionSchema = {
  params: meetingIdParamSchema.params,
  body: z.object({}).strict(),
};

export const updateAttendanceRecordSchema = {
  params: attendanceRecordIdParamSchema.params,
  body: z
    .object({
      status: z.enum(['HADIR', 'SAKIT', 'IZIN', 'ALPA'], {
        errorMap: () => ({
          message: 'Status presensi harus salah satu dari HADIR, SAKIT, IZIN, atau ALPA',
        }),
      }),
      notes: z
        .string()
        .trim()
        .max(1000, 'Catatan maksimal 1000 karakter')
        .nullable()
        .optional(),
    })
    .strict(),
};
