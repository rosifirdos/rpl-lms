import { RolesService } from './roles.service.js';
import { apiResponse } from '../../utils/apiResponse.js';
import { extractClientInfo } from '../../middlewares/audit.middleware.js';

export class RolesController {
  static async getRoles(req, res, next) {
    try {
      const roles = await RolesService.getRoles(req.query);
      return apiResponse.success(res, {
        statusCode: 200,
        message: 'Daftar role sistem berhasil diambil',
        data: roles,
      });
    } catch (error) {
      return next(error);
    }
  }

  static async getRoleById(req, res, next) {
    try {
      const role = await RolesService.getRoleById(req.params.id);
      return apiResponse.success(res, {
        statusCode: 200,
        message: 'Detail role sistem berhasil diambil',
        data: role,
      });
    } catch (error) {
      return next(error);
    }
  }

  static async createRole(req, res, next) {
    try {
      const adminId = req.user.id;
      const { ipAddress, userAgent } = extractClientInfo(req);

      const role = await RolesService.createRole({
        adminId,
        roleData: req.body,
        ipAddress,
        userAgent,
      });

      return apiResponse.success(res, {
        statusCode: 201,
        message: 'Role baru berhasil dibuat',
        data: role,
      });
    } catch (error) {
      return next(error);
    }
  }

  static async updateRolePermissions(req, res, next) {
    try {
      const adminId = req.user.id;
      const roleId = req.params.id;
      const { permissions } = req.body;
      const { ipAddress, userAgent } = extractClientInfo(req);

      const role = await RolesService.updateRolePermissions({
        adminId,
        roleId,
        permissions,
        ipAddress,
        userAgent,
      });

      return apiResponse.success(res, {
        statusCode: 200,
        message: 'Permission role berhasil diperbarui',
        data: role,
      });
    } catch (error) {
      return next(error);
    }
  }
}
