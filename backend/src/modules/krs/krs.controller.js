import { krsService } from './krs.service.js';
import { apiResponse } from '../../utils/apiResponse.js';

function getReqMeta(req) {
  return {
    userId: req.user?.id,
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'],
  };
}

export const krsController = {
  // ==========================================
  // Mahasiswa: Periode & Draft Lifecycle
  // ==========================================

  async getPeriodeAktif(req, res, next) {
    try {
      const data = await krsService.getPeriodeAktif();
      return apiResponse.success(res, {
        message: 'Informasi periode KRS aktif berhasil diambil',
        data,
      });
    } catch (err) {
      next(err);
    }
  },

  async getMyKRS(req, res, next) {
    try {
      const data = await krsService.getMyKRS(req.user.id, req.query?.semester_id, getReqMeta(req));
      return apiResponse.success(res, {
        message: 'Data KRS mahasiswa berhasil diambil',
        data,
      });
    } catch (err) {
      next(err);
    }
  },

  async getAvailableClasses(req, res, next) {
    try {
      const data = await krsService.getKelastersedia(req.user.id, req.query?.semester_id);
      return apiResponse.success(res, {
        message: 'Daftar kelas yang tersedia berhasil diambil',
        data,
      });
    } catch (err) {
      next(err);
    }
  },

  async addItem(req, res, next) {
    try {
      const data = await krsService.addItem(
        req.user.id,
        { ...req.body, semester_id: req.query.semester_id },
        getReqMeta(req)
      );
      return apiResponse.success(res, {
        statusCode: 201,
        message: 'Kelas berhasil ditambahkan ke draft KRS',
        data,
      });
    } catch (err) {
      next(err);
    }
  },

  async removeItem(req, res, next) {
    try {
      const data = await krsService.removeItem(req.user.id, req.params.detailId, getReqMeta(req));
      return apiResponse.success(res, {
        message: 'Kelas berhasil dihapus dari draft KRS',
        data,
      });
    } catch (err) {
      next(err);
    }
  },

  async submitKRS(req, res, next) {
    try {
      const result = await krsService.submitKRS(req.user.id, req.body?.semester_id, getReqMeta(req));
      if (!result.submitted) {
        return res.status(422).json({
          success: false,
          message: 'Pengajuan KRS ditolak',
          data: {
            errors: result.errors,
            warnings: result.warnings,
          },
        });
      }

      return apiResponse.success(res, {
        message: 'KRS berhasil diajukan untuk persetujuan Dosen Wali',
        data: result.krs,
        meta: result.warnings?.length ? { warnings: result.warnings } : undefined,
      });
    } catch (err) {
      next(err);
    }
  },

  // ==========================================
  // Dosen Wali / PA Persetujuan
  // ==========================================

  async getPengajuan(req, res, next) {
    try {
      const { items, meta } = await krsService.getPengajuan(req.user.id, req.query);
      return apiResponse.success(res, {
        message: 'Daftar pengajuan KRS mahasiswa bimbingan berhasil diambil',
        data: items,
        meta,
      });
    } catch (err) {
      next(err);
    }
  },

  async approveKRS(req, res, next) {
    try {
      const data = await krsService.approveKRS(req.user.id, req.params.id, getReqMeta(req));
      return apiResponse.success(res, {
        message: 'KRS mahasiswa berhasil disetujui',
        data,
      });
    } catch (err) {
      next(err);
    }
  },

  async returnKRS(req, res, next) {
    try {
      const data = await krsService.returnKRS(req.user.id, req.params.id, req.body.catatan, getReqMeta(req));
      return apiResponse.success(res, {
        message: 'KRS berhasil dikembalikan untuk revisi',
        data,
      });
    } catch (err) {
      next(err);
    }
  },

  // ==========================================
  // Admin Akademik Monitoring & Intervensi
  // ==========================================

  async monitorKRS(req, res, next) {
    try {
      const data = await krsService.monitorKRS(req.query);
      return apiResponse.success(res, {
        message: 'Data monitoring status KRS berhasil diambil',
        data: data.items,
        meta: { ...data.meta, summary: data.summary },
      });
    } catch (err) {
      next(err);
    }
  },

  async resetToDraft(req, res, next) {
    try {
      const data = await krsService.resetToDraft(req.params.id, getReqMeta(req));
      return apiResponse.success(res, {
        message: 'KRS berhasil direset kembali ke status DRAFT',
        data,
      });
    } catch (err) {
      next(err);
    }
  },

  // ==========================================
  // Scoped Detail KRS
  // ==========================================

  async getKRSById(req, res, next) {
    try {
      const data = await krsService.getKRSById(req.user.id, req.user.roles, req.params.id);
      return apiResponse.success(res, {
        message: 'Detail KRS berhasil diambil',
        data,
      });
    } catch (err) {
      next(err);
    }
  },
};
