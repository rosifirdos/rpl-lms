import { jadwalService } from './jadwal.service.js';
import { apiResponse } from '../../utils/apiResponse.js';

function getReqMeta(req) {
  return {
    userId: req.user?.id,
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'],
  };
}

export const jadwalController = {
  // ==========================================
  // Admin Akademik: CRUD Jadwal
  // ==========================================

  async list(req, res, next) {
    try {
      const { items, meta } = await jadwalService.list(req.query);
      return apiResponse.success(res, {
        message: 'Daftar jadwal kuliah berhasil diambil',
        data: items,
        meta,
      });
    } catch (err) {
      next(err);
    }
  },

  async create(req, res, next) {
    try {
      const data = await jadwalService.create(req.body, getReqMeta(req));
      return apiResponse.success(res, {
        statusCode: 201,
        message: 'Slot jadwal berhasil dibuat',
        data,
      });
    } catch (err) {
      next(err);
    }
  },

  async update(req, res, next) {
    try {
      const data = await jadwalService.update(req.params.id, req.body, getReqMeta(req));
      return apiResponse.success(res, {
        message: 'Slot jadwal berhasil diperbarui',
        data,
      });
    } catch (err) {
      next(err);
    }
  },

  async remove(req, res, next) {
    try {
      const data = await jadwalService.remove(req.params.id, getReqMeta(req));
      return apiResponse.success(res, {
        message: 'Slot jadwal berhasil dihapus',
        data,
      });
    } catch (err) {
      next(err);
    }
  },

  async getById(req, res, next) {
    try {
      const data = await jadwalService.getById(req.params.id);
      return apiResponse.success(res, {
        message: 'Detail jadwal berhasil diambil',
        data,
      });
    } catch (err) {
      next(err);
    }
  },

  // ==========================================
  // Mahasiswa: Jadwal dari KRS DISETUJUI
  // ==========================================

  async getJadwalSaya(req, res, next) {
    try {
      const data = await jadwalService.getJadwalSaya(req.user.id, req.query);
      return apiResponse.success(res, {
        message: 'Jadwal kuliah mahasiswa berhasil diambil',
        data,
      });
    } catch (err) {
      next(err);
    }
  },

  // ==========================================
  // Dosen: Jadwal kelas yang diampu
  // ==========================================

  async getJadwalMengajar(req, res, next) {
    try {
      const data = await jadwalService.getJadwalMengajar(req.user.id, req.query);
      return apiResponse.success(res, {
        message: 'Jadwal mengajar dosen berhasil diambil',
        data,
      });
    } catch (err) {
      next(err);
    }
  },
};
