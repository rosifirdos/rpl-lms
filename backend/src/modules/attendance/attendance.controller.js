import { AttendanceService } from './attendance.service.js';
import { apiResponse } from '../../utils/apiResponse.js';
import { extractClientInfo } from '../../middlewares/audit.middleware.js';

export class AttendanceController {
  static async openSession(req, res, next) {
    try {
      const { ipAddress, userAgent } = extractClientInfo(req);
      const data = await AttendanceService.openSession({
        user: req.user,
        meetingId: req.params.meetingId,
        payload: req.body,
        ipAddress,
        userAgent,
      });

      return apiResponse.success(res, {
        message: 'Sesi presensi berhasil dibuka',
        data,
      });
    } catch (error) {
      return next(error);
    }
  }

  static async closeSession(req, res, next) {
    try {
      const { ipAddress, userAgent } = extractClientInfo(req);
      const data = await AttendanceService.closeSession({
        user: req.user,
        meetingId: req.params.meetingId,
        ipAddress,
        userAgent,
      });

      return apiResponse.success(res, {
        message: 'Sesi presensi berhasil ditutup',
        data,
      });
    } catch (error) {
      return next(error);
    }
  }

  static async checkIn(req, res, next) {
    try {
      const data = await AttendanceService.checkIn({
        user: req.user,
        sessionId: req.params.sessionId,
      });

      return apiResponse.success(res, {
        statusCode: 201,
        message: 'Kehadiran berhasil dicatat',
        data,
      });
    } catch (error) {
      return next(error);
    }
  }

  static async getSessionRecords(req, res, next) {
    try {
      const data = await AttendanceService.getSessionRecords({
        user: req.user,
        sessionId: req.params.sessionId,
      });

      return apiResponse.success(res, {
        message: 'Daftar kehadiran sesi presensi berhasil diambil',
        data,
      });
    } catch (error) {
      return next(error);
    }
  }

  static async updateRecord(req, res, next) {
    try {
      const { ipAddress, userAgent } = extractClientInfo(req);
      const data = await AttendanceService.updateRecord({
        user: req.user,
        recordId: req.params.id,
        payload: req.body,
        ipAddress,
        userAgent,
      });

      return apiResponse.success(res, {
        message: 'Status kehadiran mahasiswa berhasil diperbarui',
        data,
      });
    } catch (error) {
      return next(error);
    }
  }
}
