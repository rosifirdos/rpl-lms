import { AuditLogService } from './audit-log.service.js';
import { apiResponse } from '../../utils/apiResponse.js';

export class AuditLogController {
  /**
   * List daftar jejak audit sistem dengan paginasi & filter
   */
  static async getAuditLogs(req, res, next) {
    try {
      const result = await AuditLogService.findAll(req.query);
      return apiResponse.success(res, {
        statusCode: 200,
        message: 'Daftar rekaman jejak audit sistem berhasil diambil',
        data: result.items,
        meta: result.meta,
      });
    } catch (error) {
      return next(error);
    }
  }

  /**
   * Detail rekaman jejak audit berdasarkan ID
   */
  static async getAuditLogById(req, res, next) {
    try {
      const result = await AuditLogService.findById(req.params.id);
      return apiResponse.success(res, {
        statusCode: 200,
        message: 'Detail rekaman jejak audit berdasarkan ID berhasil diambil',
        data: result,
      });
    } catch (error) {
      return next(error);
    }
  }
}
