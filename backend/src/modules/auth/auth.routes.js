import { Router } from 'express';
import { AuthController } from './auth.controller.js';
import { validate } from '../../middlewares/validate.middleware.js';
import { authenticateToken } from '../../middlewares/auth.middleware.js';
import {
  loginSchema,
  refreshTokenSchema,
  changePasswordSchema,
  forgotPasswordSchema,
} from './auth.validation.js';

const router = Router();

const optionalAuth = (req, res, next) => {
  if (req.headers.authorization) {
    return authenticateToken(req, res, next);
  }
  return next();
};

// POST /api/v1/auth/login
router.post('/login', validate(loginSchema), AuthController.login);

// POST /api/v1/auth/refresh
router.post('/refresh', validate(refreshTokenSchema), AuthController.refresh);

// POST /api/v1/auth/logout
router.post('/logout', optionalAuth, AuthController.logout);

// POST /api/v1/auth/forgot-password
router.post('/forgot-password', validate(forgotPasswordSchema), AuthController.forgotPassword);

// PUT /api/v1/auth/change-password (Wajib Login)
router.put(
  '/change-password',
  authenticateToken,
  validate(changePasswordSchema),
  AuthController.changePassword
);

export default router;
