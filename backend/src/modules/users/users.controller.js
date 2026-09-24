import { UsersService } from './users.service.js';
import { apiResponse } from '../../utils/apiResponse.js';
import { extractClientInfo } from '../../middlewares/audit.middleware.js';

export class UsersController {
  static async createUser(req, res, next) {
    try {
      const adminId = req.user.id;
      const { ipAddress, userAgent } = extractClientInfo(req);

      const user = await UsersService.createUser({
        adminId,
        userData: req.body,
        ipAddress,
        userAgent,
      });

      return apiResponse.success(res, {
        statusCode: 201,
        message: 'Akun pengguna baru berhasil dibuat',
        data: user,
      });
    } catch (error) {
      return next(error);
    }
  }

  static async getUsers(req, res, next) {
    try {
      const result = await UsersService.getUsers(req.query);
      return apiResponse.success(res, {
        statusCode: 200,
        message: 'Daftar pengguna berhasil diambil',
        data: result.items,
        meta: result.meta,
      });
    } catch (error) {
      return next(error);
    }
  }

  static async getUserById(req, res, next) {
    try {
      const user = await UsersService.getUserById(req.params.id);
      return apiResponse.success(res, {
        statusCode: 200,
        message: 'Detail pengguna berhasil diambil',
        data: user,
      });
    } catch (error) {
      return next(error);
    }
  }

  static async updateRoles(req, res, next) {
    try {
      const { roles } = req.body;
      const targetUserId = req.params.id;
      const adminId = req.user.id;
      const { ipAddress, userAgent } = extractClientInfo(req);

      const result = await UsersService.updateRoles({
        adminId,
        targetUserId,
        newRoles: roles,
        ipAddress,
        userAgent,
      });

      return apiResponse.success(res, {
        statusCode: 200,
        message: 'Penugasan role pengguna berhasil diperbarii',
        data: result,
      });
    } catch (error) {
      return next(error);
    }
  }

  static async updateStatus(req, res, next) {
    try {
      const { status, reason } = req.body;
      const targetUserId = req.params.id;
      const adminId = req.user.id;
      const { ipAddress, userAgent } = extractClientInfo(req);

      const result = await UsersService.updateStatus({
        adminId,
        targetUserId,
        newStatus: status,
        reason,
        ipAddress,
        userAgent,
      });

      return apiResponse.success(res, {
        statusCode: 200,
        message: `Status pengguna berhasil diubah menjadi ${status}`,
        data: result,
      });
    } catch (error) {
      return next(error);
    }
  }
}
