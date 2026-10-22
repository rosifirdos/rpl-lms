import { ClassesService } from './classes.service.js';
import { apiResponse } from '../../utils/apiResponse.js';
import { extractClientInfo } from '../../middlewares/audit.middleware.js';

export class ClassesController {
  static async getClasses(req, res, next) {
    try {
      const result = await ClassesService.getClasses(req.query);
      return apiResponse.success(res, {
        message: 'Daftar kelas perkuliahan berhasil diambil',
        data: result.items,
        meta: result.meta,
      });
    } catch (error) {
      return next(error);
    }
  }

  static async getClassById(req, res, next) {
    try {
      const classRecord = await ClassesService.getClassById(req.params.id);
      return apiResponse.success(res, {
        message: 'Detail kelas perkuliahan berhasil diambil',
        data: classRecord,
      });
    } catch (error) {
      return next(error);
    }
  }

  static async createClass(req, res, next) {
    try {
      const { ipAddress, userAgent } = extractClientInfo(req);
      const classRecord = await ClassesService.createClass({
        adminId: req.user.id,
        classData: req.body,
        ipAddress,
        userAgent,
      });
      return apiResponse.success(res, {
        statusCode: 201,
        message: 'Kelas perkuliahan berhasil dibuka',
        data: classRecord,
      });
    } catch (error) {
      return next(error);
    }
  }

  static async updateClass(req, res, next) {
    try {
      const { ipAddress, userAgent } = extractClientInfo(req);
      const classRecord = await ClassesService.updateClass({
        adminId: req.user.id,
        classId: req.params.id,
        updateData: req.body,
        ipAddress,
        userAgent,
      });
      return apiResponse.success(res, {
        message: 'Kelas perkuliahan berhasil diperbarui',
        data: classRecord,
      });
    } catch (error) {
      return next(error);
    }
  }

  static async deleteClass(req, res, next) {
    try {
      const { ipAddress, userAgent } = extractClientInfo(req);
      const result = await ClassesService.deleteClass({
        adminId: req.user.id,
        classId: req.params.id,
        ipAddress,
        userAgent,
      });
      return apiResponse.success(res, {
        message: 'Kelas perkuliahan berhasil dihapus',
        data: result,
      });
    } catch (error) {
      return next(error);
    }
  }
}
