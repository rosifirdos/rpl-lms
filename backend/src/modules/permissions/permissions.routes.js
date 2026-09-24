import { Router } from 'express';
import { PermissionsController } from './permissions.controller.js';
import { authenticateToken } from '../../middlewares/auth.middleware.js';
import { requireRole, requirePermission } from '../../middlewares/rbac.middleware.js';
import { validate } from '../../middlewares/validate.middleware.js';
import { ROLES } from '../../constants/roles.js';
import { PERMISSIONS } from '../../constants/permissions.js';
import {
  createPermissionSchema,
  permissionListQuerySchema,
  permissionIdParamSchema,
} from './permissions.validation.js';

const router = Router();

// Seluruh endpoint permissions memerlukan otentikasi JWT
router.use(authenticateToken);

/**
 * GET /api/v1/permissions
 * Daftar seluruh permission sistem
 */
router.get(
  '/',
  requirePermission(PERMISSIONS.ROLE_MANAGE),
  validate(permissionListQuerySchema),
  PermissionsController.getPermissions
);

/**
 * GET /api/v1/permissions/:id
 * Detail permission sistem berdasarkan ID
 */
router.get(
  '/:id',
  requirePermission(PERMISSIONS.ROLE_MANAGE),
  validate(permissionIdParamSchema),
  PermissionsController.getPermissionById
);

/**
 * POST /api/v1/permissions
 * Pembuatan permission baru (Super Admin)
 */
router.post(
  '/',
  requireRole(ROLES.SUPER_ADMIN),
  validate(createPermissionSchema),
  PermissionsController.createPermission
);

export default router;
