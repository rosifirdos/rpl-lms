import { Router } from 'express';
import { ClassesController } from './classes.controller.js';
import { authenticateToken } from '../../middlewares/auth.middleware.js';
import { requireRole } from '../../middlewares/rbac.middleware.js';
import { validate } from '../../middlewares/validate.middleware.js';
import { adminOperationsLimiter } from '../../middlewares/rateLimit.middleware.js';
import { ROLES } from '../../constants/roles.js';
import {
  classIdParamSchema,
  classListQuerySchema,
  createClassSchema,
  updateClassSchema,
} from './classes.validation.js';

const router = Router();

router.use(authenticateToken);
router.use(requireRole(ROLES.ADMIN));

router.get('/', validate(classListQuerySchema), ClassesController.getClasses);
router.post(
  '/',
  adminOperationsLimiter,
  validate(createClassSchema),
  ClassesController.createClass
);
router.get('/:id', validate(classIdParamSchema), ClassesController.getClassById);
router.put(
  '/:id',
  adminOperationsLimiter,
  validate(updateClassSchema),
  ClassesController.updateClass
);
router.delete(
  '/:id',
  adminOperationsLimiter,
  validate(classIdParamSchema),
  ClassesController.deleteClass
);

export default router;
