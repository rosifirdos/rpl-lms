import { Router } from 'express';
import { UserClassesController } from './user-classes.controller.js';
import { authenticateToken } from '../../middlewares/auth.middleware.js';
import { validate } from '../../middlewares/validate.middleware.js';
import { classIdParamSchema, classListQuerySchema } from './classes.validation.js';

const router = Router();

// Seluruh pengguna terotentikasi dapat mengakses rute kelas kontekstual mereka
router.use(authenticateToken);

router.get('/', validate(classListQuerySchema), UserClassesController.getUserClasses);
router.get('/:id', validate(classIdParamSchema), UserClassesController.getClassDetail);

export default router;
