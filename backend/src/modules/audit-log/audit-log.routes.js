import { Router } from 'express';
import { AuditLogController } from './audit-log.controller.js';

import { authenticateToken } from '../../middlewares/auth.middleware.js';

import { requirePermission, requireAnyPermission } from '../../middlewares/rbac.middleware.js';
import { validate } from '../../middlewares/validate.middleware.js';
import { PERMISSIONS } from '../../constants/permissions.js';

import { auditLogQuerySchema } from './audit-log.validation.js';

const router = Router();

// Seluruh endpoint audit log memerlukan autentikasi berbasis JWT
router.use(authenticateToken);

/**
-  GET /api/v1/audit-logs
-  Memantau seluruh rekaman jejak audit sistem (Super Admin, Admin Akademik)
-*/
router.get(
  '/',
  requireAnyPermission(PERMISSIONS.AUDIT_VIEW, PERMISSIONS.ROLE_MANAGE),
  validate(auditLogQuerySchema),
  AuditLogController.getAuditLogs
);

/**
- GET /api/v1/audit-logs/:id
- Detail riwayat perubahan (old_values vs new_values) (SRS Chapter 35 - Super Admin)
-*/
router.get(
  '/:id',
  requirePermission(PERMISSIONS.AUDIT_VIEW),
  AuditLogController.getAuditLogById
);

export default router;
