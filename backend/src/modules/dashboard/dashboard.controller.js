import { DashboardService } from './dashboard.service.js';
import { apiResponse } from '../../utils/apiResponse.js';

export class DashboardController {
  /**
   * Endpoint dasbor kontekstual berdasarkan sesi pengguna yang login (FR-010, SRS Bab 4)
   */
  static async getDashboard(req, res, next) {
    try {
      const data = await DashboardService.getDashboard(req.user);
      return apiResponse.success(res, {
        message: `Dasbor kontekstual untuk peran ${req.user.role} berhasil dimuat`,
        data,
      });
    } catch (error) {
      return next(error);
    }
  }
}
