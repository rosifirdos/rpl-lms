import { periodeService } from './periode.service.js';
import { apiResponse } from '../../utils/apiResponse.js';

function getReqMeta(req) {
  return {
    userId: req.user?.id,
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'],
  };
}

export const periodeController = {
  async list(req, res, next) {
    try {
      const { items, meta } = await periodeService.list(req.query);
      return apiResponse.success(res, {
        message: 'Daftar periode KRS berhasil diambil',
        data: items,
        meta,
      });
    } catch (err) {
      next(err);
    }
  },

  async detail(req, res, next) {
    try {
      const item = await periodeService.detail(req.params.id);
      return apiResponse.success(res, {
        message: 'Detail periode KRS berhasil diambil',
        data: item,
      });
    } catch (err) {
      next(err);
    }
  },

  async create(req, res, next) {
    try {
      const item = await periodeService.create(req.body, getReqMeta(req));
      return apiResponse.success(res, {
        statusCode: 201,
        message: 'Periode KRS berhasil dibuat',
        data: item,
      });
    } catch (err) {
      next(err);
    }
  },

  async update(req, res, next) {
    try {
      const item = await periodeService.update(req.params.id, req.body, getReqMeta(req));
      return apiResponse.success(res, {
        message: 'Periode KRS berhasil diperbarui',
        data: item,
      });
    } catch (err) {
      next(err);
    }
  },

  async activate(req, res, next) {
    try {
      const item = await periodeService.activate(req.params.id, getReqMeta(req));
      return apiResponse.success(res, {
        message: 'Periode KRS berhasil diaktifkan',
        data: item,
      });
    } catch (err) {
      next(err);
    }
  },
};
