import { Router } from 'express';
import { PortalController } from './portal.controller.js';
import { authenticateToken } from '../../middlewares/auth.middleware.js';

const router = Router();

// Seluruh endpoint portal mewajibkan autentikasi login (SRS Bab 9, 19, 31)
router.use(authenticateToken);

// GET /api/v1/portal/modules - Menampilkan modul kampus yang berhak diakses user (SIA, SPADA, PMB, Admin)
router.get('/modules', PortalController.getModules);

// GET /api/v1/portal/dashboard - Menyajikan agregasi metrik ringkas dasbor spesifik per role
router.get('/dashboard', PortalController.getDashboard);

export default router;
