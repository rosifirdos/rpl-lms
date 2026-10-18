import { Router } from 'express';
import { UsersController } from './users.controller.js';
import { authenticateToken } from '../../middlewares/auth.middleware.js';
import { requireRole } from '../../middlewares/rbac.middleware.js';
import { validate } from '../../middlewares/validate.middleware.js';
import { ROLES } from '../../constants/roles.js';
import {
  createUserSchema,
  updateUserSchema,
  updateUserStatusSchema,
  resetPasswordSchema,
  userListQuerySchema,
  userIdParamSchema,
} from './users.validation.js';

const router = Router();

// Seluruh endpoint admin/users memerlukan login + role ADMIN
router.use(authenticateToken);
router.use(requireRole(ROLES.ADMIN));

/**
 * GET /api/admin/users
 * List akun pengguna (Admin only)
 */
router.get(
  '/',
  validate(userListQuerySchema),
  UsersController.getUsers
);

/**
 * POST /api/admin/users
 * Pembuatan akun pengguna baru (Admin only — FR-044)
 */
router.post(
  '/',
  validate(createUserSchema),
  UsersController.createUser
);

/**
 * GET /api/admin/users/:id
 * Detail akun pengguna
 */
router.get(
  '/:id',
  validate(userIdParamSchema),
  UsersController.getUserById
);

/**
 * PUT /api/admin/users/:id
 * Update data pengguna (termasuk role) — FR-044
 */
router.put(
  '/:id',
  validate(updateUserSchema),
  UsersController.updateUser
);

/**
 * PATCH /api/admin/users/:id/status
 * Mengubah status akun (ACTIVE, INACTIVE, SUSPENDED) — FR-044
 */
router.patch(
  '/:id/status',
  validate(updateUserStatusSchema),
  UsersController.updateStatus
);

/**
 * PUT /api/admin/users/:id/reset-password
 * Reset kata sandi pengguna oleh Admin (FR-044, SRS Bab 35)
 */
router.put(
  '/:id/reset-password',
  validate(resetPasswordSchema),
  UsersController.resetPassword
);

export default router;
