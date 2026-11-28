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
  resetTokenBodySchema,
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

// GET /api/auth/reset-password/validate — DEPRECATED (R-13): token sensitif
// pada query string berpotensi tercatat di access log. Gunakan POST dengan
// body `{ token }`; endpoint GET akan dihapus setelah frontend bermigrasi.
router.get(
  '/reset-password/validate',
  validate({ query: resetTokenQuerySchema }),
  AuthController.validateResetToken
);

// POST /api/auth/reset-password/validate (jalur resmi — R-13)
router.post(
  '/reset-password/validate',
  validate({ body: resetTokenBodySchema }),
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
