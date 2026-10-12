import { Router } from 'express';
import { ProfileController } from './profile.controller.js';
import { authenticateToken } from '../../middlewares/auth.middleware.js';
import { validate } from '../../middlewares/validate.middleware.js';
import { uploadAvatar } from '../../middlewares/upload.middleware.js';
import { updateProfileSchema, changeProfilePasswordSchema } from './profile.validation.js';

const router = Router();

// GET /api/profile (seluruh role terotentikasi — FR-005)
router.get('/', authenticateToken, ProfileController.getProfile);

// PUT /api/profile (seluruh role terotentikasi — FR-006)
router.put('/', authenticateToken, validate(updateProfileSchema), ProfileController.updateProfile);

// POST /api/profile/avatar (seluruh role terotentikasi — FR-007)
router.post('/avatar', authenticateToken, uploadAvatar, ProfileController.uploadAvatar);

// GET /api/profile/avatar (lihat/unduh avatar pengguna aktif)
router.get('/avatar', authenticateToken, ProfileController.getAvatar);

// PUT /api/profile/password (seluruh role terotentikasi — FR-008)
router.put(
  '/password',
  authenticateToken,
  validate(changeProfilePasswordSchema),
  ProfileController.changePassword
);

export default router;
