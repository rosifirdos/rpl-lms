import { ConfigService } from './config.service.js';
import { apiResponse } from '../../utils/apiResponse.js';

export class ConfigController {
  /**
   * GET /api/admin/config — konfigurasi efektif sistem (FR-049, FR-050).
   */
  static async getConfig(req, res, next) {
    try {
      const data = await ConfigService.getConfigForAdmin();

      return apiResponse.success(res, {
        statusCode: 200,
        message: 'Konfigurasi sistem berhasil diambil',
        data,
      });
    } catch (error) {
      return next(error);
    }
  }

  /**
   * PUT /api/admin/config — perbarui konfigurasi (partial update).
   */
  static async updateConfig(req, res, next) {
    try {
      const ipAddress = req.ip || req.headers['x-forwarded-for'];
      const userAgent = req.headers['user-agent'];

      const data = await ConfigService.updateConfig({
        payload: req.body,
        adminId: req.user.id,
        ipAddress,
        userAgent,
      });

      return apiResponse.success(res, {
        statusCode: 200,
        message: 'Konfigurasi sistem berhasil diperbarui',
        data,
      });
    } catch (error) {
      return next(error);
    }
  }
}
