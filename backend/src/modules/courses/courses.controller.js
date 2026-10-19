import { CoursesService } from './courses.service.js';
import { apiResponse } from '../../utils/apiResponse.js';
import { extractClientInfo } from '../../middlewares/audit.middleware.js';

export class CoursesController {
  static async getCourses(req, res, next) {
    try {
      const result = await CoursesService.getCourses(req.query);
      return apiResponse.success(res, {
        message: 'Daftar mata kuliah berhasil diambil',
        data: result.items,
        meta: result.meta,
      });
    } catch (error) {
      return next(error);
    }
  }

  static async getCourseById(req, res, next) {
    try {
      const course = await CoursesService.getCourseById(req.params.id);
      return apiResponse.success(res, {
        message: 'Detail mata kuliah berhasil diambil',
        data: course,
      });
    } catch (error) {
      return next(error);
    }
  }

  static async createCourse(req, res, next) {
    try {
      const { ipAddress, userAgent } = extractClientInfo(req);
      const course = await CoursesService.createCourse({
        adminId: req.user.id,
        courseData: req.body,
        ipAddress,
        userAgent,
      });
      return apiResponse.success(res, {
        statusCode: 201,
        message: 'Mata kuliah berhasil ditambahkan',
        data: course,
      });
    } catch (error) {
      return next(error);
    }
  }

  static async updateCourse(req, res, next) {
    try {
      const { ipAddress, userAgent } = extractClientInfo(req);
      const course = await CoursesService.updateCourse({
        adminId: req.user.id,
        courseId: req.params.id,
        updateData: req.body,
        ipAddress,
        userAgent,
      });
      return apiResponse.success(res, {
        message: 'Mata kuliah berhasil diperbarui',
        data: course,
      });
    } catch (error) {
      return next(error);
    }
  }

  static async deleteCourse(req, res, next) {
    try {
      const { ipAddress, userAgent } = extractClientInfo(req);
      const course = await CoursesService.deleteCourse({
        adminId: req.user.id,
        courseId: req.params.id,
        ipAddress,
        userAgent,
      });
      return apiResponse.success(res, {
        message: 'Mata kuliah berhasil dinonaktifkan',
        data: course,
      });
    } catch (error) {
      return next(error);
    }
  }
}
