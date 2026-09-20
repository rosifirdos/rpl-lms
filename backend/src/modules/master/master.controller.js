import { fakultasService } from './kelembagaan/fakultas.service.js';
import { prodiService } from './kelembagaan/prodi.service.js';
import { tahunAkademikService } from './kalender-dasar/tahun-akademik.service.js';
import { semesterService } from './kalender-dasar/semester.service.js';
import { kurikulumService } from './akademik/kurikulum.service.js';
import { mataKuliahService } from './akademik/mata-kuliah.service.js';
import { kelasService } from './akademik/kelas.service.js';
import { gedungService } from './fasilitas/gedung.service.js';
import { ruanganService } from './fasilitas/ruangan.service.js';
import { apiResponse } from '../../utils/apiResponse.js';

function getReqMeta(req) {
  return {
    userId: req.user?.id,
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'],
  };
}

export const masterController = {
  // 1. FAKULTAS
  async listFakultas(req, res, next) {
    try {
      const { items, meta } = await fakultasService.list(req.query);
      return apiResponse.success(res, {
        message: 'Daftar fakultas berhasil diambil',
        data: items,
        meta,
      });
    } catch (err) { next(err); }
  },

  async detailFakultas(req, res, next) {
    try {
      const item = await fakultasService.detail(req.params.id);
      return apiResponse.success(res, {
        message: 'Detail fakultas berhasil diambil',
        data: item,
      });
    } catch (err) { next(err); }
  },

  async createFakultas(req, res, next) {
    try {
      const item = await fakultasService.create(req.body, getReqMeta(req));
      return apiResponse.success(res, {
        statusCode: 201,
        message: 'Fakultas baru berhasil dibuat',
        data: item,
      });
    } catch (err) { next(err); }
  },

  async updateFakultas(req, res, next) {
    try {
      const item = await fakultasService.update(req.params.id, req.body, getReqMeta(req));
      return apiResponse.success(res, {
        message: 'Fakultas berhasil diperbarui',
        data: item,
      });
    } catch (err) { next(err); }
  },

  async deleteFakultas(req, res, next) {
    try {
      await fakultasService.delete(req.params.id, getReqMeta(req));
      return apiResponse.success(res, { message: 'Fakultas berhasil dihapus' });
    } catch (err) { next(err); }
  },

  // 2. PROGRAM STUDI
  async listProdi(req, res, next) {
    try {
      const { items, meta } = await prodiService.list(req.query);
      return apiResponse.success(res, {
        message: 'Daftar program studi berhasil diambil',
        data: items,
        meta,
      });
    } catch (err) { next(err); }
  },

  async detailProdi(req, res, next) {
    try {
      const item = await prodiService.detail(req.params.id);
      return apiResponse.success(res, {
        message: 'Detail program studi berhasil diambil',
        data: item,
      });
    } catch (err) { next(err); }
  },

  async createProdi(req, res, next) {
    try {
      const item = await prodiService.create(req.body, getReqMeta(req));
      return apiResponse.success(res, {
        statusCode: 201,
        message: 'Program studi baru berhasil dibuat',
        data: item,
      });
    } catch (err) { next(err); }
  },

  async updateProdi(req, res, next) {
    try {
      const item = await prodiService.update(req.params.id, req.body, getReqMeta(req));
      return apiResponse.success(res, {
        message: 'Program studi berhasil diperbarui',
        data: item,
      });
    } catch (err) { next(err); }
  },

  async deleteProdi(req, res, next) {
    try {
      await prodiService.delete(req.params.id, getReqMeta(req));
      return apiResponse.success(res, { message: 'Program studi berhasil dihapus' });
    } catch (err) { next(err); }
  },

  // 3. TAHUN AKADEMIK
  async listTahunAkademik(req, res, next) {
    try {
      const { items, meta } = await tahunAkademikService.list(req.query);
      return apiResponse.success(res, {
        message: 'Daftar tahun akademik berhasil diambil',
        data: items,
        meta,
      });
    } catch (err) { next(err); }
  },

  async detailTahunAkademik(req, res, next) {
    try {
      const item = await tahunAkademikService.detail(req.params.id);
      return apiResponse.success(res, {
        message: 'Detail tahun akademik berhasil diambil',
        data: item,
      });
    } catch (err) { next(err); }
  },

  async createTahunAkademik(req, res, next) {
    try {
      const item = await tahunAkademikService.create(req.body, getReqMeta(req));
      return apiResponse.success(res, {
        statusCode: 201,
        message: 'Tahun akademik baru berhasil dibuat',
        data: item,
      });
    } catch (err) { next(err); }
  },

  async updateTahunAkademik(req, res, next) {
    try {
      const item = await tahunAkademikService.update(req.params.id, req.body, getReqMeta(req));
      return apiResponse.success(res, {
        message: 'Tahun akademik berhasil diperbarui',
        data: item,
      });
    } catch (err) { next(err); }
  },

  async deleteTahunAkademik(req, res, next) {
    try {
      await tahunAkademikService.delete(req.params.id, getReqMeta(req));
      return apiResponse.success(res, { message: 'Tahun akademik berhasil dihapus' });
    } catch (err) { next(err); }
  },

  // 4. SEMESTER
  async listSemester(req, res, next) {
    try {
      const { items, meta } = await semesterService.list(req.query);
      return apiResponse.success(res, {
        message: 'Daftar semester berhasil diambil',
        data: items,
        meta,
      });
    } catch (err) { next(err); }
  },

  async detailSemester(req, res, next) {
    try {
      const item = await semesterService.detail(req.params.id);
      return apiResponse.success(res, {
        message: 'Detail semester berhasil diambil',
        data: item,
      });
    } catch (err) { next(err); }
  },

  async createSemester(req, res, next) {
    try {
      const item = await semesterService.create(req.body, getReqMeta(req));
      return apiResponse.success(res, {
        statusCode: 201,
        message: 'Semester baru berhasil dibuat',
        data: item,
      });
    } catch (err) { next(err); }
  },

  async updateSemester(req, res, next) {
    try {
      const item = await semesterService.update(req.params.id, req.body, getReqMeta(req));
      return apiResponse.success(res, {
        message: 'Semester berhasil diperbarui',
        data: item,
      });
    } catch (err) { next(err); }
  },

  async activateSemester(req, res, next) {
    try {
      const item = await semesterService.activate(req.params.id, getReqMeta(req));
      return apiResponse.success(res, {
        message: 'Semester berhasil diaktifkan sebagai semester operasional kampus',
        data: item,
      });
    } catch (err) { next(err); }
  },

  async deleteSemester(req, res, next) {
    try {
      await semesterService.delete(req.params.id, getReqMeta(req));
      return apiResponse.success(res, { message: 'Semester berhasil dihapus' });
    } catch (err) { next(err); }
  },

  // 5. KURIKULUM
  async listKurikulum(req, res, next) {
    try {
      const { items, meta } = await kurikulumService.list(req.query);
      return apiResponse.success(res, {
        message: 'Daftar kurikulum berhasil diambil',
        data: items,
        meta,
      });
    } catch (err) { next(err); }
  },

  async detailKurikulum(req, res, next) {
    try {
      const item = await kurikulumService.detail(req.params.id);
      return apiResponse.success(res, {
        message: 'Detail kurikulum berhasil diambil',
        data: item,
      });
    } catch (err) { next(err); }
  },

  async createKurikulum(req, res, next) {
    try {
      const item = await kurikulumService.create(req.body, getReqMeta(req));
      return apiResponse.success(res, {
        statusCode: 201,
        message: 'Kurikulum baru berhasil dibuat',
        data: item,
      });
    } catch (err) { next(err); }
  },

  async updateKurikulum(req, res, next) {
    try {
      const item = await kurikulumService.update(req.params.id, req.body, getReqMeta(req));
      return apiResponse.success(res, {
        message: 'Kurikulum berhasil diperbarui',
        data: item,
      });
    } catch (err) { next(err); }
  },

  async deleteKurikulum(req, res, next) {
    try {
      await kurikulumService.delete(req.params.id, getReqMeta(req));
      return apiResponse.success(res, { message: 'Kurikulum berhasil dihapus' });
    } catch (err) { next(err); }
  },

  // 6. MATA KULIAH
  async listMataKuliah(req, res, next) {
    try {
      const { items, meta } = await mataKuliahService.list(req.query);
      return apiResponse.success(res, {
        message: 'Daftar mata kuliah berhasil diambil',
        data: items,
        meta,
      });
    } catch (err) { next(err); }
  },

  async detailMataKuliah(req, res, next) {
    try {
      const item = await mataKuliahService.detail(req.params.id);
      return apiResponse.success(res, {
        message: 'Detail mata kuliah berhasil diambil',
        data: item,
      });
    } catch (err) { next(err); }
  },

  async createMataKuliah(req, res, next) {
    try {
      const item = await mataKuliahService.create(req.body, getReqMeta(req));
      return apiResponse.success(res, {
        statusCode: 201,
        message: 'Mata kuliah baru berhasil dibuat',
        data: item,
      });
    } catch (err) { next(err); }
  },

  async updateMataKuliah(req, res, next) {
    try {
      const item = await mataKuliahService.update(req.params.id, req.body, getReqMeta(req));
      return apiResponse.success(res, {
        message: 'Mata kuliah berhasil diperbarui',
        data: item,
      });
    } catch (err) { next(err); }
  },

  async deleteMataKuliah(req, res, next) {
    try {
      await mataKuliahService.delete(req.params.id, getReqMeta(req));
      return apiResponse.success(res, { message: 'Mata kuliah berhasil dihapus' });
    } catch (err) { next(err); }
  },

  // 7. GEDUNG
  async listGedung(req, res, next) {
    try {
      const { items, meta } = await gedungService.list(req.query);
      return apiResponse.success(res, {
        message: 'Daftar gedung fasilitas berhasil diambil',
        data: items,
        meta,
      });
    } catch (err) { next(err); }
  },

  async detailGedung(req, res, next) {
    try {
      const item = await gedungService.detail(req.params.id);
      return apiResponse.success(res, {
        message: 'Detail gedung berhasil diambil',
        data: item,
      });
    } catch (err) { next(err); }
  },

  async createGedung(req, res, next) {
    try {
      const item = await gedungService.create(req.body, getReqMeta(req));
      return apiResponse.success(res, {
        statusCode: 201,
        message: 'Gedung baru berhasil dibuat',
        data: item,
      });
    } catch (err) { next(err); }
  },

  async updateGedung(req, res, next) {
    try {
      const item = await gedungService.update(req.params.id, req.body, getReqMeta(req));
      return apiResponse.success(res, {
        message: 'Gedung berhasil diperbarui',
        data: item,
      });
    } catch (err) { next(err); }
  },

  async deleteGedung(req, res, next) {
    try {
      await gedungService.delete(req.params.id, getReqMeta(req));
      return apiResponse.success(res, { message: 'Gedung berhasil dihapus' });
    } catch (err) { next(err); }
  },

  // 8. RUANGAN
  async listRuangan(req, res, next) {
    try {
      const { items, meta } = await ruanganService.list(req.query);
      return apiResponse.success(res, {
        message: 'Daftar ruangan kelas berhasil diambil',
        data: items,
        meta,
      });
    } catch (err) { next(err); }
  },

  async detailRuangan(req, res, next) {
    try {
      const item = await ruanganService.detail(req.params.id);
      return apiResponse.success(res, {
        message: 'Detail ruangan berhasil diambil',
        data: item,
      });
    } catch (err) { next(err); }
  },

  async createRuangan(req, res, next) {
    try {
      const item = await ruanganService.create(req.body, getReqMeta(req));
      return apiResponse.success(res, {
        statusCode: 201,
        message: 'Ruangan baru berhasil dibuat',
        data: item,
      });
    } catch (err) { next(err); }
  },

  async updateRuangan(req, res, next) {
    try {
      const item = await ruanganService.update(req.params.id, req.body, getReqMeta(req));
      return apiResponse.success(res, {
        message: 'Ruangan berhasil diperbarui',
        data: item,
      });
    } catch (err) { next(err); }
  },

  async deleteRuangan(req, res, next) {
    try {
      await ruanganService.delete(req.params.id, getReqMeta(req));
      return apiResponse.success(res, { message: 'Ruangan berhasil dihapus' });
    } catch (err) { next(err); }
  },

  // 9. KELAS
  async listKelas(req, res, next) {
    try {
      const { items, meta } = await kelasService.list(req.query);
      return apiResponse.success(res, {
        message: 'Daftar penawaran kelas berhasil diambil',
        data: items,
        meta,
      });
    } catch (err) { next(err); }
  },

  async detailKelas(req, res, next) {
    try {
      const item = await kelasService.detail(req.params.id);
      return apiResponse.success(res, {
        message: 'Detail kelas perkuliahan berhasil diambil',
        data: item,
      });
    } catch (err) { next(err); }
  },

  async createKelas(req, res, next) {
    try {
      const item = await kelasService.create(req.body, getReqMeta(req));
      return apiResponse.success(res, {
        statusCode: 201,
        message: 'Penawaran kelas perkuliahan berhasil dibuka',
        data: item,
      });
    } catch (err) { next(err); }
  },

  async updateKelas(req, res, next) {
    try {
      const item = await kelasService.update(req.params.id, req.body, getReqMeta(req));
      return apiResponse.success(res, {
        message: 'Kelas perkuliahan berhasil diperbarui',
        data: item,
      });
    } catch (err) { next(err); }
  },

  async deleteKelas(req, res, next) {
    try {
      await kelasService.delete(req.params.id, getReqMeta(req));
      return apiResponse.success(res, { message: 'Kelas perkuliahan berhasil dihapus' });
    } catch (err) { next(err); }
  },
};
