import { Router } from 'express';
import { DashboardController } from './dashboard.controller.js';
import { authenticateToken } from '../../middlewares/auth.middleware.js';

const router = Router();

// Endpoint dasbor terproteksi untuk seluruh aktor terotentikasi (SRS Bab 21)
router.use(authenticateToken);
router.get('/', DashboardController.getDashboard);

export default router;
