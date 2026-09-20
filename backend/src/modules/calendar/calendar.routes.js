import { Router } from 'express';
import { calendarController } from './calendar.controller.js';
import { authenticateToken } from '../../middlewares/auth.middleware.js';
import { requireRole } from '../../middlewares/rbac.middleware.js';
import { validate } from '../../middlewares/validate.middleware.js';
import { ROLES } from '../../constants/roles.js';
import {
  createCalendarSchema,
  updateCalendarSchema,
  getCalendarQuerySchema,
} from './calendar.validation.js';

const router = Router();

// Seluruh rute kalender memerlukan autentikasi login (SRS Bab 22 & Bab 32)
router.use(authenticateToken);

// GET /api/v1/calendar - Melihat kalender akademik (semua pengguna yang login)
router.get('/', validate({ query: getCalendarQuerySchema }), calendarController.list);

// GET /api/v1/calendar/:id - Melihat detail agenda tertentu
router.get('/:id', calendarController.detail);

// Mutasi kalender hanya untuk Admin Akademik & Super Admin (SRS Bab 22 FR-126 - FR-129)
router.post(
  '/',
  requireRole(ROLES.SUPER_ADMIN, ROLES.ADMIN_AKADEMIK),
  validate(createCalendarSchema),
  calendarController.create
);

router.put(
  '/:id',
  requireRole(ROLES.SUPER_ADMIN, ROLES.ADMIN_AKADEMIK),
  validate(updateCalendarSchema),
  calendarController.update
);

router.delete(
  '/:id',
  requireRole(ROLES.SUPER_ADMIN, ROLES.ADMIN_AKADEMIK),
  calendarController.delete
);

export default router;
