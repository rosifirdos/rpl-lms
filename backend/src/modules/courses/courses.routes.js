import { Router } from 'express';
import { CoursesController } from './courses.controller.js';
import { authenticateToken } from '../../middlewares/auth.middleware.js';
import { requireRole } from '../../middlewares/rbac.middleware.js';
import { validate } from '../../middlewares/validate.middleware.js';
import { adminOperationsLimiter } from '../../middlewares/rateLimit.middleware.js';
import { ROLES } from '../../constants/roles.js';
import {
  courseIdParamSchema,
  courseListQuerySchema,
  createCourseSchema,
  updateCourseSchema,
} from './courses.validation.js';

const router = Router();

router.use(authenticateToken);
router.use(requireRole(ROLES.ADMIN));

router.get('/', validate(courseListQuerySchema), CoursesController.getCourses);
router.post(
  '/',
  adminOperationsLimiter,
  validate(createCourseSchema),
  CoursesController.createCourse
);
router.get('/:id', validate(courseIdParamSchema), CoursesController.getCourseById);
router.put(
  '/:id',
  adminOperationsLimiter,
  validate(updateCourseSchema),
  CoursesController.updateCourse
);
router.delete(
  '/:id',
  adminOperationsLimiter,
  validate(courseIdParamSchema),
  CoursesController.deleteCourse
);

export default router;
