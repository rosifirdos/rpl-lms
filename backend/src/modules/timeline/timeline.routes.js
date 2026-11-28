import { Router } from 'express';
import { TimelineController } from './timeline.controller.js';
import { authenticateToken } from '../../middlewares/auth.middleware.js';
import { requireRole } from '../../middlewares/rbac.middleware.js';
import { validate } from '../../middlewares/validate.middleware.js';
import { ROLES } from '../../constants/roles.js';
import { timelineQuerySchema } from './timeline.dto.js';

const router = Router();

router.use(authenticateToken);

/**
 * GET /api/timeline — Central Timeline (FR-009–FR-012).
 * Hak akses: Mahasiswa (kelas dienroll) dan Dosen (kelas diampu).
 */
router.get(
  '/',
  requireRole(ROLES.MAHASISWA, ROLES.DOSEN),
  validate(timelineQuerySchema),
  TimelineController.getTimeline
);

export default router;
