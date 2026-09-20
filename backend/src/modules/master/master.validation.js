import { z } from 'zod';

export const listQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20).optional(),
  search: z.string().optional(),
  is_active: z
    .preprocess((val) => {
      if (val === 'true' || val === true) return true;
      if (val === 'false' || val === false) return false;
      return undefined;
    }, z.boolean().optional())
    .optional(),
});

// 1. FAKULTAS
export const createFakultasSchema = z.object({
  kode: z.string().min(2).max(20).transform((v) => v.trim().toUpperCase()),
  nama: z.string().min(2).max(100).transform((v) => v.trim()),
  is_active: z.boolean().default(true).optional(),
});

export const updateFakultasSchema = z.object({
  kode: z.string().min(2).max(20).transform((v) => v.trim().toUpperCase()).optional(),
  nama: z.string().min(2).max(100).transform((v) => v.trim()).optional(),
  is_active: z.boolean().optional(),
});

// 2. PROGRAM STUDI
export const createProdiSchema = z.object({
  fakultas_id: z.string().uuid({ message: 'fakultas_id harus berupa UUID valid' }),
  kode: z.string().min(2).max(20).transform((v) => v.trim().toUpperCase()),
  nama: z.string().min(2).max(100).transform((v) => v.trim()),
  jenjang: z.string().min(2).max(20).default('S1'),
  is_active: z.boolean().default(true).optional(),
});

export const updateProdiSchema = z.object({
  fakultas_id: z.string().uuid().optional(),
  kode: z.string().min(2).max(20).transform((v) => v.trim().toUpperCase()).optional(),
  nama: z.string().min(2).max(100).transform((v) => v.trim()).optional(),
  jenjang: z.string().min(2).max(20).optional(),
  is_active: z.boolean().optional(),
});

export const listProdiQuerySchema = listQuerySchema.extend({
  fakultas_id: z.string().uuid().optional(),
  jenjang: z.string().optional(),
});

// 3. TAHUN AKADEMIK
export const createTahunAkademikSchema = z.object({
  kode: z.string().min(4).max(20).transform((v) => v.trim()),
  nama: z.string().min(3).max(100).transform((v) => v.trim()),
  is_active: z.boolean().default(true).optional(),
});

export const updateTahunAkademikSchema = z.object({
  kode: z.string().min(4).max(20).transform((v) => v.trim()).optional(),
  nama: z.string().min(3).max(100).transform((v) => v.trim()).optional(),
  is_active: z.boolean().optional(),
});

// 4. SEMESTER
export const createSemesterSchema = z.object({
  tahun_akademik_id: z.string().uuid({ message: 'tahun_akademik_id harus berupa UUID valid' }),
  tipe: z.enum(['GANJIL', 'GENAP', 'ANTARA']),
  tanggal_mulai: z.string().datetime({ message: 'Format tanggal mulai harus ISO 8601' }),
  tanggal_selesai: z.string().datetime({ message: 'Format tanggal selesai harus ISO 8601' }),
  is_active: z.boolean().default(false).optional(),
}).refine((data) => new Date(data.tanggal_mulai) < new Date(data.tanggal_selesai), {
  message: 'Tanggal mulai harus lebih awal dari tanggal selesai',
  path: ['tanggal_mulai'],
});

export const updateSemesterSchema = z.object({
  tahun_akademik_id: z.string().uuid().optional(),
  tipe: z.enum(['GANJIL', 'GENAP', 'ANTARA']).optional(),
  tanggal_mulai: z.string().datetime({ message: 'Format tanggal mulai harus ISO 8601' }).optional(),
  tanggal_selesai: z.string().datetime({ message: 'Format tanggal selesai harus ISO 8601' }).optional(),
  is_active: z.boolean().optional(),
}).refine((data) => {
  if (data.tanggal_mulai && data.tanggal_selesai) {
    return new Date(data.tanggal_mulai) < new Date(data.tanggal_selesai);
  }
  return true;
}, {
  message: 'Tanggal mulai harus lebih awal dari tanggal selesai',
  path: ['tanggal_mulai'],
});

export const listSemesterQuerySchema = listQuerySchema.extend({
  tahun_akademik_id: z.string().uuid().optional(),
  tipe: z.enum(['GANJIL', 'GENAP', 'ANTARA']).optional(),
});

// 5. KURIKULUM
export const createKurikulumSchema = z.object({
  id: z.string().optional(),
  prodi_id: z.string().uuid({ message: 'prodi_id harus berupa UUID valid' }),
  nama: z.string().min(3).max(100).transform((v) => v.trim()),
  tahun_mulai: z.coerce.number().int().min(1900).max(2100),
  is_active: z.boolean().default(true).optional(),
});

export const updateKurikulumSchema = z.object({
  prodi_id: z.string().uuid().optional(),
  nama: z.string().min(3).max(100).transform((v) => v.trim()).optional(),
  tahun_mulai: z.coerce.number().int().min(1900).max(2100).optional(),
  is_active: z.boolean().optional(),
});

export const listKurikulumQuerySchema = listQuerySchema.extend({
  prodi_id: z.string().uuid().optional(),
});

// 6. MATA KULIAH
export const createMataKuliahSchema = z.object({
  kurikulum_id: z.string({ message: 'kurikulum_id wajib diisi' }),
  kode: z.string().min(2).max(30).transform((v) => v.trim().toUpperCase()),
  nama: z.string().min(2).max(150).transform((v) => v.trim()),
  sks: z.coerce.number().int().min(1).max(12),
  sks_teori: z.coerce.number().int().min(0).max(12).default(0).optional(),
  sks_praktik: z.coerce.number().int().min(0).max(12).default(0).optional(),
  semester_paket: z.coerce.number().int().min(1).max(14).default(1).optional(),
  is_wajib: z.boolean().default(true).optional(),
  is_active: z.boolean().default(true).optional(),
});

export const updateMataKuliahSchema = z.object({
  kurikulum_id: z.string().optional(),
  kode: z.string().min(2).max(30).transform((v) => v.trim().toUpperCase()).optional(),
  nama: z.string().min(2).max(150).transform((v) => v.trim()).optional(),
  sks: z.coerce.number().int().min(1).max(12).optional(),
  sks_teori: z.coerce.number().int().min(0).max(12).optional(),
  sks_praktik: z.coerce.number().int().min(0).max(12).optional(),
  semester_paket: z.coerce.number().int().min(1).max(14).optional(),
  is_wajib: z.boolean().optional(),
  is_active: z.boolean().optional(),
});

export const listMataKuliahQuerySchema = listQuerySchema.extend({
  kurikulum_id: z.string().optional(),
  semester_paket: z.coerce.number().int().optional(),
  is_wajib: z.preprocess((val) => {
    if (val === 'true' || val === true) return true;
    if (val === 'false' || val === false) return false;
    return undefined;
  }, z.boolean().optional()).optional(),
});

// 7. GEDUNG
export const createGedungSchema = z.object({
  kode: z.string().min(1).max(20).transform((v) => v.trim().toUpperCase()),
  nama: z.string().min(2).max(100).transform((v) => v.trim()),
});

export const updateGedungSchema = z.object({
  kode: z.string().min(1).max(20).transform((v) => v.trim().toUpperCase()).optional(),
  nama: z.string().min(2).max(100).transform((v) => v.trim()).optional(),
});

// 8. RUANGAN
export const createRuanganSchema = z.object({
  gedung_id: z.string().uuid({ message: 'gedung_id harus berupa UUID valid' }),
  kode: z.string().min(1).max(30).transform((v) => v.trim().toUpperCase()),
  nama: z.string().min(2).max(100).transform((v) => v.trim()),
  kapasitas: z.coerce.number().int().min(1).max(1000),
  is_active: z.boolean().default(true).optional(),
});

export const updateRuanganSchema = z.object({
  gedung_id: z.string().uuid().optional(),
  kode: z.string().min(1).max(30).transform((v) => v.trim().toUpperCase()).optional(),
  nama: z.string().min(2).max(100).transform((v) => v.trim()).optional(),
  kapasitas: z.coerce.number().int().min(1).max(1000).optional(),
  is_active: z.boolean().optional(),
});

export const listRuanganQuerySchema = listQuerySchema.extend({
  gedung_id: z.string().uuid().optional(),
});

// 9. KELAS
export const createKelasSchema = z.object({
  mata_kuliah_id: z.string().uuid({ message: 'mata_kuliah_id harus berupa UUID valid' }),
  semester_id: z.string().uuid({ message: 'semester_id harus berupa UUID valid' }),
  dosen_id: z.string().uuid({ message: 'dosen_id harus berupa UUID valid' }),
  ruangan_id: z.string().uuid().nullable().optional(),
  kode_kelas: z.string().min(1).max(20).transform((v) => v.trim().toUpperCase()),
  kapasitas: z.coerce.number().int().min(1).max(500).default(40).optional(),
});

export const updateKelasSchema = z.object({
  mata_kuliah_id: z.string().uuid().optional(),
  semester_id: z.string().uuid().optional(),
  dosen_id: z.string().uuid().optional(),
  ruangan_id: z.string().uuid().nullable().optional(),
  kode_kelas: z.string().min(1).max(20).transform((v) => v.trim().toUpperCase()).optional(),
  kapasitas: z.coerce.number().int().min(1).max(500).optional(),
});

export const listKelasQuerySchema = listQuerySchema.extend({
  semester_id: z.string().uuid().optional(),
  mata_kuliah_id: z.string().uuid().optional(),
  dosen_id: z.string().uuid().optional(),
});
