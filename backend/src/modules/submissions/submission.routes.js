import { Router } from 'express';
import { authenticateToken } from '../../middlewares/auth.middleware.js';
import { requireRole } from '../../middlewares/rbac.middleware.js';
import { uploadSubmission } from '../../middlewares/upload.middleware.js';
import { validate } from '../../middlewares/validate.middleware.js';
import { ROLES } from '../../constants/roles.js';
import { SubmissionController } from './submission.controller.js';
import { assignmentIdParamSchema, gradeSubmissionSchema, submissionIdParamSchema } from './submission.dto.js';

export const assignmentSubmissionRoutes = Router();
assignmentSubmissionRoutes.use(authenticateToken);

assignmentSubmissionRoutes.post(
  '/:assignmentId/submissions',
  requireRole(ROLES.MAHASISWA),
  validate(assignmentIdParamSchema),
  uploadSubmission,
  SubmissionController.upload
);

assignmentSubmissionRoutes.get(
  '/:assignmentId/submission',
  requireRole(ROLES.MAHASISWA),
  validate(assignmentIdParamSchema),
  SubmissionController.mySubmission
);

assignmentSubmissionRoutes.get(
  '/:assignmentId/submissions',
  requireRole(ROLES.DOSEN, ROLES.ADMIN),
  validate(assignmentIdParamSchema),
  SubmissionController.roster
);

export const submissionRoutes = Router();
submissionRoutes.use(authenticateToken);
submissionRoutes.get(
  '/:id/download',
  requireRole(ROLES.MAHASISWA, ROLES.DOSEN, ROLES.ADMIN),
  validate(submissionIdParamSchema),
  SubmissionController.download
);

// Penilaian tugas (skor 0–100 & feedback) — hanya dosen pengampu/Admin (FR-035).
submissionRoutes.put(
  '/:id/grade',
  requireRole(ROLES.DOSEN, ROLES.ADMIN),
  validate(gradeSubmissionSchema),
  SubmissionController.grade
);
