import { Router } from "express";
import { MeetingController } from "./meeting.controller.js";
import { authenticateToken } from "../../middlewares/auth.middleware.js";
import { requireRole } from "../../middlewares/rbac.middleware.js";
import { validate } from "../../middlewares/validate.middleware.js";
import { ROLES } from "../../constants/roles.js";
import {
  classIdParamSchema,
  meetingIdParamSchema,
  updateMeetingSchema,
} from "./meeting.dto.js";

/**
 * Rute pertemuan berinduk kelas (dipasang di `/api/classes`).
 */
export const classMeetingsRoutes = Router();

classMeetingsRoutes.use(authenticateToken);

classMeetingsRoutes.get(
  "/:classId/meetings",
  requireRole(ROLES.MAHASISWA, ROLES.DOSEN, ROLES.ADMIN),
  validate(classIdParamSchema),
  MeetingController.getMeetingsByClassId
);

/**
 * Rute pertemuan berbasis ID pertemuan (dipasang di `/api/meetings`).
 */
export const meetingRoutes = Router();

meetingRoutes.use(authenticateToken);

meetingRoutes.get(
  "/:id",
  requireRole(ROLES.MAHASISWA, ROLES.DOSEN, ROLES.ADMIN),
  validate(meetingIdParamSchema),
  MeetingController.getMeetingById
);

meetingRoutes.put(
  "/:id",
  requireRole(ROLES.DOSEN, ROLES.ADMIN),
  validate(updateMeetingSchema),
  MeetingController.updateMeeting
);

