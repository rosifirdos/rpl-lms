import { ProfileService } from './profile.service.js';
import { apiResponse } from '../../utils/apiResponse.js';

export class ProfileController {
  /**
   * Mengambil data profil lengkap milik pengguna saat ini (FR-005)
   */
  static async getProfile(req, res, next) {
    try {
      const userId = req.user.id;
      const profile = await ProfileService.getProfile(userId);

      return apiResponse.success(res, {
        statusCode: 200,
        message: 'Data profil berhasil diambil',
        data: profile,
      });
    } catch (error) {
      return next(error);
    }
  }

  /**
   * Memperbarui informasi kontak & biodata profil mandiri (FR-006)
   */
  static async updateProfile(req, res, next) {
    try {
      const userId = req.user.id;
      const updateData = req.body;
      const ipAddress = req.ip || req.headers['x-forwarded-for'];
      const userAgent = req.headers['user-agent'];

      const updatedProfile = await ProfileService.updateProfile(userId, updateData, {
        ipAddress,
        userAgent,
      });

      return apiResponse.success(res, {
        statusCode: 200,
        message: 'Profil berhasil diperbarui',
        data: updatedProfile,
      });
    } catch (error) {
      return next(error);
    }
  }

  /**
   * Mengunggah atau memperbarui avatar profil (FR-007)
   */
  static async uploadAvatar(req, res, next) {
    try {
      const userId = req.user.id;
      const file = req.file;
      const ipAddress = req.ip || req.headers['x-forwarded-for'];
      const userAgent = req.headers['user-agent'];

      const updatedProfile = await ProfileService.uploadAvatar(userId, file, {
        ipAddress,
        userAgent,
      });

      return apiResponse.success(res, {
        statusCode: 200,
        message: 'Foto profil berhasil diperbarui',
        data: updatedProfile,
      });
    } catch (error) {
      return next(error);
    }
  }

  /**
   * Mengunduh/melihat berkas avatar profil pengguna yang sedang login
   */
  static async getAvatar(req, res, next) {
    try {
      const userId = req.user.id;
      const avatar = await ProfileService.getAvatar(userId);

      res.setHeader('Content-Type', avatar.mimeType);
      res.setHeader('Content-Disposition', `inline; filename="${avatar.originalName}"`);
      return res.sendFile(avatar.filePath);
    } catch (error) {
      return next(error);
    }
  }

  /**
   * Mengganti kata sandi mandiri (FR-008)
   */
  static async changePassword(req, res, next) {
    try {
      const userId = req.user.id;
      const { oldPassword, newPassword } = req.body;
      const ipAddress = req.ip || req.headers['x-forwarded-for'];
      const userAgent = req.headers['user-agent'];

      const result = await ProfileService.changePassword({
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
}
