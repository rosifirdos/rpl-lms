import { PortalService } from './portal.service.js';
import { apiResponse } from '../../utils/apiResponse.js';

export class PortalController {
  /**
   * Mengambil daftar modul kampus yang berhak diakses oleh user aktif
   * GET /api/v1/portal/modules
   */
  static async getModules(req, res, next) {
    try {
      const data = await PortalService.getAccessibleModules(req.user);
      return apiResponse.success(res, {
        statusCode: 200,
        message: 'Daftar modul kampus yang dapat diakses berhasil dimuat',
        data,
      });
    } catch (error) {
      return next(error);
    }
  }

  /**
   * Mengambil data agregasi ringkas dasbor portal berbasis peran aktif
   * GET /api/v1/portal/dashboard
   */
  static async getDashboard(req, res, next) {
    try {
      const data = await PortalService.getDashboard(req.user);
      return apiResponse.success(res, {
        statusCode: 200,
        message: 'Data dasbor portal terintegrasi berhasil dimuat',
        data,
      });
    } catch (error) {
      return next(error);
    }
  }
}
