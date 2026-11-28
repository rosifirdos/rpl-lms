import { Router } from 'express';
import { ConfigController } from './config.controller.js';
import { authenticateToken } from '../../middlewares/auth.middleware.js';
import { requireRole } from '../../middlewares/rbac.middleware.js';
import { validate } from '../../middlewares/validate.middleware.js';
import { adminOperationsLimiter } from '../../middlewares/rateLimit.middleware.js';
import { ROLES } from '../../constants/roles.js';
import { updateConfigSchema } from './config.validation.js';

const router = Router();

// Seluruh endpoint konfigurasi sistem khusus Admin (FR-049, FR-050)
router.use(authenticateToken);
router.use(requireRole(ROLES.ADMIN));

/**
 * GET /api/admin/config
 * Konfigurasi efektif sistem (kebijakan unggahan & ambang kehadiran).
 */
router.get('/', ConfigController.getConfig);

/**
 * PUT /api/admin/config
 * Perbarui konfigurasi (partial update, dicatat di audit).
 */
router.put(
  '/',
  adminOperationsLimiter,
  validate(updateConfigSchema),
  ConfigController.updateConfig
);

export default router;
