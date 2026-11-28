import { Router } from 'express';
import { AuthController } from './auth.controller.js';
import { validate } from '../../middlewares/validate.middleware.js';
import { authenticateToken } from '../../middlewares/auth.middleware.js';
import {
  loginSchema,
  refreshTokenSchema,
  changePasswordSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  resetTokenQuerySchema,
} from './auth.validation.js';

const router = Router();

const optionalAuth = (req, res, next) => {
  if (req.headers.authorization) {
    return authenticateToken(req, res, next);
  }
  return next();
};

// POST /api/auth/login
router.post('/login', validate(loginSchema), AuthController.login);

// POST /api/auth/refresh
router.post('/refresh', validate(refreshTokenSchema), AuthController.refresh);

// POST /api/auth/logout
router.post('/logout', optionalAuth, AuthController.logout);

// POST /api/auth/forgot-password
router.post('/forgot-password', validate(forgotPasswordSchema), AuthController.forgotPassword);

// GET /api/auth/reset-password/validate (precheck tautan reset — FR-003)
router.get(
  '/reset-password/validate',
  validate({ query: resetTokenQuerySchema }),
  AuthController.validateResetToken
);

// POST /api/auth/reset-password (selesaikan pemulihan kata sandi — FR-003)
router.post('/reset-password', validate(resetPasswordSchema), AuthController.resetPassword);

// PUT /api/auth/change-password (Wajib Login)
router.put(
  '/change-password',
  authenticateToken,
  validate(changePasswordSchema),
  AuthController.changePassword
);

export default router;
