import { Router } from 'express';
import { AuditLogController } from './audit-log.controller.js';
import { authenticateToken } from '../../middlewares/auth.middleware.js';
import { requireRole } from '../../middlewares/rbac.middleware.js';
import { validate } from '../../middlewares/validate.middleware.js';
import { auditLogLimiter } from '../../middlewares/rateLimit.middleware.js';
import { ROLES } from '../../constants/roles.js';
import { auditLogQuerySchema, auditLogIdParamSchema } from './audit-log.validation.js';

const router = Router();

// Seluruh endpoint audit log memerlukan autentikasi + role ADMIN (FR-052)
router.use(authenticateToken);
router.use(requireRole(ROLES.ADMIN));

/**
 * GET /api/admin/audit-logs
 * Memantau seluruh rekaman jejak audit sistem (Admin only — FR-052)
 */
router.get(
  '/',
  auditLogLimiter,
  validate(auditLogQuerySchema),
  AuditLogController.getAuditLogs
);

/**
 * GET /api/admin/audit-logs/:id
 * Detail riwayat perubahan (old_values vs new_values)
 */
router.get(
  '/:id',
  validate(auditLogIdParamSchema),
  AuditLogController.getAuditLogById
);

export default router;
