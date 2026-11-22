import { Router } from 'express';
import { AttendanceController } from './attendance.controller.js';
import { authenticateToken } from '../../middlewares/auth.middleware.js';
import { requireRole } from '../../middlewares/rbac.middleware.js';
import { validate } from '../../middlewares/validate.middleware.js';
import { ROLES } from '../../constants/roles.js';
import {
  openAttendanceSessionSchema,
  closeAttendanceSessionSchema,
  sessionIdParamSchema,
  updateAttendanceRecordSchema,
} from './attendance.dto.js';

/**
 * Rute presensi berinduk pertemuan (dipasang di `/api/meetings`). Path
 * `/:meetingId/attendance/*` tidak bertabrakan dengan rute pertemuan Fase 2.
 */
export const meetingAttendanceRoutes = Router();

meetingAttendanceRoutes.use(authenticateToken);

meetingAttendanceRoutes.post(
  '/:meetingId/attendance/open',
  requireRole(ROLES.DOSEN, ROLES.ADMIN),
  validate(openAttendanceSessionSchema),
  AttendanceController.openSession
);

meetingAttendanceRoutes.post(
  '/:meetingId/attendance/close',
  requireRole(ROLES.DOSEN, ROLES.ADMIN),
  validate(closeAttendanceSessionSchema),
  AttendanceController.closeSession
);

/**
 * Rute presensi berbasis sesi dan rekaman kehadiran (dipasang di `/api/attendance`).
 */
export const attendanceRoutes = Router();

attendanceRoutes.use(authenticateToken);

attendanceRoutes.post(
  '/:sessionId/check-in',
  requireRole(ROLES.MAHASISWA),
  validate(sessionIdParamSchema),
  AttendanceController.checkIn
);

attendanceRoutes.get(
  '/:sessionId/records',
  requireRole(ROLES.DOSEN, ROLES.ADMIN),
  validate(sessionIdParamSchema),
  AttendanceController.getSessionRecords
);

attendanceRoutes.put(
  '/records/:id',
  requireRole(ROLES.DOSEN, ROLES.ADMIN),
  validate(updateAttendanceRecordSchema),
  AttendanceController.updateRecord
);
