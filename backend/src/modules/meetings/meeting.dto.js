import { z } from "zod";

const uuid = (label) => z.string().uuid({ message: `Format ${label} harus UUID valid` });

export const classIdParamSchema = {
  params: z.object({
    classId: uuid("ID kelas"),
  }),
};

export const meetingIdParamSchema = {
  params: z.object({
    id: uuid("ID pertemuan"),
  }),
};

export const updateMeetingSchema = {
  params: meetingIdParamSchema.params,
  body: z
    .object({
      title: z
        .string()
        .trim()
        .min(1, { message: "Judul pertemuan tidak boleh kosong" })
        .max(150, { message: "Judul pertemuan maksimal 150 karakter" })
        .optional(),
      description: z
        .string()
        .trim()
        .max(2000, { message: "Deskripsi maksimal 2000 karakter" })
        .nullable()
        .optional(),
      is_published: z
        .boolean({ message: "Status publikasi harus boolean" })
        .optional(),
    })
    .strict()
    .refine((data) => Object.keys(data).length > 0, {
      message: "Tidak ada data yang diperbarui",
    }),
};

