import { Router } from 'express';
import { UsersController } from './users.controller.js';
import { authenticateToken } from '../../middlewares/auth.middleware.js';
import { requireRole, requirePermission } from '../../middlewares/rbac.middleware.js';
import { validate } from '../../middlewares/validate.middleware.js';
import { ROLES } from '../../constants/roles.js';

import { PERMISSIONS } from '../../constants/permissions.js';

import {
  createUserSchema,
  updateUserRolesSchema,
  updateUserStatusSchema,
  userListQuerySchema,
  userIdParamSchema,
} from './users.validation.js';

const router = Router();


// Seluruh endpoint pengguna memerlukan login berbasis JWT
router.use(authenticateToken);

/**
 * POST /api/v1/users
 * Pembuatan akun pengguna baru manual beserta profilnya
 * Akses: Super Admin
 */
router.post(
  '/',
  requireRole(ROLES.SUPER_ADMIN),
  validate(createUserSchema),
  UsersController.createUser
);

/**
* GET /api/v1/users
* List akun pengguna (hanya Admin & Super Admin)
*/
router.get(
  '/',
  requirePermission(PERMISSIONS.USER_MANAGE),
  validate(userListQuerySchema),
  UsersController.getUsers
);

/**
 * GET /api/v1/users/:id
 * Detail akun pengguna
 */
router.get(
  '/:id',
  requirePermission(PERMISSIONS.USER_MANAGE),
  validate(userIdParamSchema),
  UsersController.getUserById
);

/**
 * PUT /api/v1/users:/id/roles
 * Penugasan atau pencabutan role pengguna (mencatat ke audit_logs)
 * Akses: Super Admin
 */
router.put(
  '/:id/roles',
  requireRole(ROLES.SUPER_ADMIN),
  validate(updateUserRolesSchema),
  UsersController.updateRoles
);

/**
* PATCH /api/v1/users:/id/status
* Mengubah status akun (ACTIVE, INACTIVE, SUSPENDED) (mencatat ke audit_logs)
 * Akses: Super Admin
*/
router.patch(
  '/:id/status',
  requireRole(ROLES.SUPER_ADMIN),
  validate(updateUserStatusSchema),
  UsersController.updateStatus
);

export default router;
