import { Router } from 'express';
import { ProfileController } from './profile.controller.js';
import { authenticateToken } from '../../middlewares/auth.middleware.js';
import { validate } from '../../middlewares/validate.middleware.js';
import { updateProfileSchema } from './profile.validation.js';

const router = Router();

// GET /api/v1/profile (Hak baca RW seluruh role - SRS Bab 31)
router.get('/', authenticateToken, ProfileController.getProfile);

// PUT /api/v1/profile (Hak tulis RW seluruh role - SRS Bab 31)
router.put('/', authenticateToken, validate(updateProfileSchema), ProfileController.updateProfile);

export default router;
