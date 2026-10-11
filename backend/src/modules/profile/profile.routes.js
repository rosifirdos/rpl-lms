import { Router } from 'express';
import { ProfileController } from './profile.controller.js';
import { authenticateToken } from '../../middlewares/auth.middleware.js';
import { validate } from '../../middlewares/validate.middleware.js';
import { updateProfileSchema } from './profile.validation.js';

const router = Router();

// GET /api/profile (seluruh role terotentikasi — FR-005)
router.get('/', authenticateToken, ProfileController.getProfile);

// PUT /api/profile (seluruh role terotentikasi — FR-006)
router.put('/', authenticateToken, validate(updateProfileSchema), ProfileController.updateProfile);

export default router;
