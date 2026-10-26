import { EnrollmentsService } from './enrollments.service.js';
import { apiResponse } from '../../utils/apiResponse.js';
import { extractClientInfo } from '../../middlewares/audit.middleware.js';

export class EnrollmentsController {
  /**
   * Mengambil daftar mahasiswa yang telah terdaftar pada kelas
   */
  static async getClassEnrollments(req, res, next) {
    try {
      const classId = req.params.classId || req.params.id;
      const result = await EnrollmentsService.getClassEnrollments(classId, req.query);
      return apiResponse.success(res, {
        message: 'Daftar mahasiswa terdaftar berhasil diambil',
        data: result.items,
        meta: {
          class: result.class,
          ...result.meta,
        },
      });
    } catch (error) {
      return next(error);
    }
  }

  /**
   * Mengambil daftar mahasiswa yang tersedia untuk didaftarkan ke kelas
   */
  static async getAvailableStudents(req, res, next) {
    try {
      const classId = req.params.classId || req.params.id;
      const result = await EnrollmentsService.getAvailableStudents(classId, req.query);
      return apiResponse.success(res, {
        message: 'Daftar mahasiswa tersedia berhasil diambil',
        data: result.items,
        meta: {
          class: result.class,
          ...result.meta,
        },
      });
    } catch (error) {
      return next(error);
    }
  }

  /**
   * Mendaftarkan mahasiswa ke kelas secara langsung (individual maupun batch)
   */
  static async enrollStudents(req, res, next) {
    try {
      const { ipAddress, userAgent } = extractClientInfo(req);
      const { class_id, student_id, student_ids } = req.body;

      const targetStudentIds = student_ids && student_ids.length > 0 ? student_ids : [student_id];

      const enrollments = await EnrollmentsService.enrollStudents({
        adminId: req.user.id,
        classId: class_id,
        studentIds: targetStudentIds,
        ipAddress,
        userAgent,
      });

      return apiResponse.success(res, {
        statusCode: 201,
        message: `Berhasil mendaftarkan ${enrollments.length} mahasiswa ke dalam kelas (BR-002)`,
        data: enrollments.length === 1 && student_id ? enrollments[0] : enrollments,
      });
    } catch (error) {
      return next(error);
    }
  }

  /**
   * Mencabut (unenroll) kepesertaan mahasiswa dari kelas
   */
  static async unenrollStudent(req, res, next) {
    try {
      const { ipAddress, userAgent } = extractClientInfo(req);
      const result = await EnrollmentsService.unenrollStudent({
        adminId: req.user.id,
        enrollmentId: req.params.id,
        ipAddress,
        userAgent,
      });

      return apiResponse.success(res, {
        message: 'Kepesertaan mahasiswa berhasil dicabut dari kelas',
        data: result,
      });
    } catch (error) {
      return next(error);
    }
  }
}
