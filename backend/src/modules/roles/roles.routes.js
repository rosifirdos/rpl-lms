import { Router } from 'express';
import { RolesController } from './roles.controller.js';
import { authenticateToken } from '../../middlewares/auth.middleware.js';
import { requireRole, requirePermission } from '../../middlewares/rbac.middleware.js';
import { validate } from '../../middlewares/validate.middleware.js';
import { ROLES } from '../../constants/roles.js';
import { PERMISSIONS } from '../../constants/permissions.js';
import {
  createRoleSchema,
  updateRolePermissionsSchema,
  roleListQuerySchema,
} from './roles.validation.js';

const router = Router();

// Seluruh endpoint role memerlukan otentikasi JWT
router.use(authenticateToken);

/**
 * GET /api/v1/roles
 * Daftar seluruh role sistem
 */
router.get(
  '/',
  requirePermission(PERMISSIONS.ROLE_MANAGE),
  validate(roleListQuerySchema),
  RolesController.getRoles
);

/**
 * GET /api/v1/roles/:id
 * Detail role sistem berdasarkan ID
 */
router.get(
  '/:id',
  requirePermission(PERMISSIONS.ROLE_MANAGE),
  RolesController.getRoleById
);

/**
 * POST /api/v1/roles
 * Pembuatan role baru (Super Admin)
 */
router.post(
  '/',
  requireRole(ROLES.SUPER_ADMIN),
  validate(createRoleSchema),
  RolesController.createRole
);

/**
 * PUT /api/v1/roles/:id/permissions
 * Pembaruan hak akses (permissions) suatu role (Super Admin)
 */
router.put(
  '/:id/permissions',
  requireRole(ROLES.SUPER_ADMIN),
  validate(updateRolePermissionsSchema),
  RolesController.updateRolePermissions
);

export default router;
