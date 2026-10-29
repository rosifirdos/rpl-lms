import { Router } from 'express';
import { EnrollmentsController } from './enrollments.controller.js';
import { authenticateToken } from '../../middlewares/auth.middleware.js';
import { requireRole } from '../../middlewares/rbac.middleware.js';
import { validate } from '../../middlewares/validate.middleware.js';
import { adminOperationsLimiter } from '../../middlewares/rateLimit.middleware.js';
import { ROLES } from '../../constants/roles.js';
import {
  enrollmentIdParamSchema,
  classIdParamSchema,
  createEnrollmentSchema,
  enrollmentListQuerySchema,
} from './enrollments.validation.js';

const router = Router();

// Seluruh rute enrollment hanya dapat diakses oleh Admin (BR-002)
router.use(authenticateToken);
router.use(requireRole(ROLES.ADMIN));

router.post(
  '/',
  adminOperationsLimiter,
  validate(createEnrollmentSchema),
  EnrollmentsController.enrollStudents
);

router.delete(
  '/:id',
  adminOperationsLimiter,
  validate(enrollmentIdParamSchema),
  EnrollmentsController.unenrollStudent
);

// Alias rute akses kepesertaan via /api/admin/enrollments/classes/:classId
router.get(
  '/classes/:classId',
  validate(classIdParamSchema),
  validate(enrollmentListQuerySchema),
  EnrollmentsController.getClassEnrollments
);

router.get(
  '/classes/:classId/available-students',
  validate(classIdParamSchema),
  validate(enrollmentListQuerySchema),
  EnrollmentsController.getAvailableStudents
);

export default router;
