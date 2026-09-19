import { ProfileService } from './profile.service.js';
import { apiResponse } from '../../utils/apiResponse.js';

export class ProfileController {
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
}
