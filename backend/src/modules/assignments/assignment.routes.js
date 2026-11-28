import { Router } from 'express';
import { authenticateToken } from '../../middlewares/auth.middleware.js';
import { requireRole } from '../../middlewares/rbac.middleware.js';
import { uploadAssignmentFile, enforceConfiguredUploadPolicy } from '../../middlewares/upload.middleware.js';
import { validate } from '../../middlewares/validate.middleware.js';
import { ROLES } from '../../constants/roles.js';
import { AssignmentController } from './assignment.controller.js';
import {
  meetingIdParamSchema,
  classIdParamSchema,
  assignmentIdParamSchema,
  createAssignmentSchema,
  updateAssignmentSchema,
} from './assignment.dto.js';

export const meetingAssignmentRoutes = Router();
meetingAssignmentRoutes.use(authenticateToken);
meetingAssignmentRoutes.post(
  '/:meetingId/assignments',
  requireRole(ROLES.DOSEN, ROLES.ADMIN),
  validate(meetingIdParamSchema),
  uploadAssignmentFile,
  enforceConfiguredUploadPolicy({ kind: 'assignment' }),
  validate(createAssignmentSchema),
  AssignmentController.create
);

export const classAssignmentRoutes = Router();
classAssignmentRoutes.use(authenticateToken);
classAssignmentRoutes.get(
  '/:classId/assignments',
  requireRole(ROLES.MAHASISWA, ROLES.DOSEN, ROLES.ADMIN),
  validate(classIdParamSchema),
  AssignmentController.list
);

export const assignmentRoutes = Router();
assignmentRoutes.use(authenticateToken);
assignmentRoutes.get('/:id', requireRole(ROLES.MAHASISWA, ROLES.DOSEN, ROLES.ADMIN), validate(assignmentIdParamSchema), AssignmentController.detail);
assignmentRoutes.put('/:id', requireRole(ROLES.DOSEN, ROLES.ADMIN), validate(assignmentIdParamSchema), uploadAssignmentFile, enforceConfiguredUploadPolicy({ kind: 'assignment' }), validate(updateAssignmentSchema), AssignmentController.update);
assignmentRoutes.delete('/:id', requireRole(ROLES.DOSEN, ROLES.ADMIN), validate(assignmentIdParamSchema), AssignmentController.delete);
assignmentRoutes.get('/:id/download', requireRole(ROLES.MAHASISWA, ROLES.DOSEN, ROLES.ADMIN), validate(assignmentIdParamSchema), AssignmentController.download);
