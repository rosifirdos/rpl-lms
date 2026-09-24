import { PermissionsService } from './permissions.service.js';
import { apiResponse } from '../../utils/apiResponse.js';
import { extractClientInfo } from '../../middlewares/audit.middleware.js';

export class PermissionsController {
  static async getPermissions(req, res, next) {
    try {
      const permissions = await PermissionsService.getPermissions(req.query);
      return apiResponse.success(res, {
        statusCode: 200,
        message: 'Daftar permission sistem berhasil diambil',
        data: permissions,
      });
    } catch (error) {
      return next(error);
    }
  }

  static async getPermissionById(req, res, next) {
    try {
      const permission = await PermissionsService.getPermissionById(req.params.id);
      return apiResponse.success(res, {
        statusCode: 200,
        message: 'Detail permission sistem berhasil diambil',
        data: permission,
      });
    } catch (error) {
      return next(error);
    }
  }

  static async createPermission(req, res, next) {
    try {
      const adminId = req.user.id;
      const { ipAddress, userAgent } = extractClientInfo(req);

      const permission = await PermissionsService.createPermission({
        adminId,
        permissionData: req.body,
        ipAddress,
        userAgent,
      });

      return apiResponse.success(res, {
        statusCode: 201,
        message: 'Permission baru berhasil dibuat',
        data: permission,
      });
    } catch (error) {
      return next(error);
    }
  }
}
