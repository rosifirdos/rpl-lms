import { UserClassesService } from './user-classes.service.js';
import { apiResponse } from '../../utils/apiResponse.js';

export class UserClassesController {
  static async getUserClasses(req, res, next) {
    try {
      const result = await UserClassesService.getUserClasses(req.user, req.query);
      return apiResponse.success(res, {
        message: 'Daftar kelas berhasil diambil',
        data: result.items,
        meta: result.meta,
      });
    } catch (error) {
      return next(error);
    }
  }

  static async getClassDetail(req, res, next) {
    try {
      const result = await UserClassesService.getClassDetail(req.user, req.params.id);
      return apiResponse.success(res, {
        message: 'Detail kelas dan 16 pertemuan terstruktur berhasil diambil (BR-004)',
        data: result,
      });
    } catch (error) {
      return next(error);
    }
  }
}
