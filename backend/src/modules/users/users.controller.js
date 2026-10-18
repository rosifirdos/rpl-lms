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

  static async updateUser(req, res, next) {
    try {
      const targetUserId = req.params.id;
      const adminId = req.user.id;
      const { ipAddress, userAgent } = extractClientInfo(req);

      const result = await UsersService.updateUser({
        adminId,
        targetUserId,
        updateData: req.body,
        ipAddress,
        userAgent,
      });

      return apiResponse.success(res, {
        statusCode: 200,
        message: 'Data pengguna berhasil diperbarui',
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

  static async resetPassword(req, res, next) {
    try {
      const targetUserId = req.params.id;
      const adminId = req.user.id;
      const { ipAddress, userAgent } = extractClientInfo(req);

      const result = await UsersService.resetPassword({
        adminId,
        targetUserId,
        newPassword: req.body.new_password,
        ipAddress,
        userAgent,
      });

      return apiResponse.success(res, {
        statusCode: 200,
        message: 'Kata sandi pengguna berhasil direset oleh Admin',
        data: result,
      });
    } catch (error) {
      return next(error);
    }
  }
}
