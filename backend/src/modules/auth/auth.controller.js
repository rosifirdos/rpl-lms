import { AuthService } from './auth.service.js';
import { apiResponse } from '../../utils/apiResponse.js';

export class AuthController {
  static async login(req, res, next) {
    try {
      const { identifier, password } = req.body;
      const ipAddress = req.ip || req.headers['x-forwarded-for'] || req.socket?.remoteAddress;
      const userAgent = req.headers['user-agent'];

      const result = await AuthService.login({
        identifier,
        password,
        ipAddress,
        userAgent,
      });

      return apiResponse.success(res, {
        statusCode: 200,
        message: 'Login berhasil. Selamat datang di portal akademik.',
        data: result,
      });
    } catch (error) {
      return next(error);
    }
  }

  static async refresh(req, res, next) {
    try {
      const { refreshToken } = req.body;
      const ipAddress = req.ip || req.headers['x-forwarded-for'];
      const userAgent = req.headers['user-agent'];

      const result = await AuthService.refresh({
        refreshTokenString: refreshToken,
        ipAddress,
        userAgent,
      });

      return apiResponse.success(res, {
        statusCode: 200,
        message: 'Access token baru berhasil diterbitkan.',
        data: result,
      });
    } catch (error) {
      return next(error);
    }
  }

  static async logout(req, res, next) {
    try {
      const refreshToken = req.body?.refreshToken;
      const userId = req.user?.id;
      const ipAddress = req.ip || req.headers['x-forwarded-for'];
      const userAgent = req.headers['user-agent'];

      const result = await AuthService.logout({
        refreshTokenString: refreshToken,
        userId,
        ipAddress,
        userAgent,
      });

      return apiResponse.success(res, {
        statusCode: 200,
        message: result.message,
      });
    } catch (error) {
      return next(error);
    }
  }

  static async changePassword(req, res, next) {
    try {
      const { oldPassword, newPassword } = req.body;
      const userId = req.user.id;
      const ipAddress = req.ip || req.headers['x-forwarded-for'];
      const userAgent = req.headers['user-agent'];

      const result = await AuthService.changePassword({
        userId,
        oldPassword,
        newPassword,
        ipAddress,
        userAgent,
      });

      return apiResponse.success(res, {
        statusCode: 200,
        message: result.message,
      });
    } catch (error) {
      return next(error);
    }
  }

  static async forgotPassword(req, res, next) {
    try {
      const { identifier } = req.body;
      const ipAddress = req.ip || req.headers['x-forwarded-for'];
      const userAgent = req.headers['user-agent'];

      const result = await AuthService.forgotPassword({
        identifier,
        ipAddress,
        userAgent,
      });

      return apiResponse.success(res, {
        statusCode: 200,
        message: result.message,
      });
    } catch (error) {
      return next(error);
    }
  }
}
