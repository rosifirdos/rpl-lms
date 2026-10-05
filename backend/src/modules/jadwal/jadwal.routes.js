/**
 * Jadwal Kuliah Routes (SRS FR-036 s/d FR-038, FR-100 s/d FR-101)
 *
 *  - Admin Akademik: CRUD /api/v1/jadwal (deteksi bentrok ruangan/dosen)
 *  - Mahasiswa: GET /api/v1/jadwal/saya (dari KRS DISETUJUI)
 *  - Dosen: GET /api/v1/jadwal/mengajar
 *  - Login (scoped): GET /api/v1/jadwal/:id
 */

import { Router } from 'express';
import { authenticateToken } from '../../middlewares/auth.middleware.js';
import { requirePermission, requireRole } from '../../middlewares/rbac.middleware.js';
import { validate } from '../../middlewares/validate.middleware.js';
import { jadwalController } from './jadwal.controller.js';
import {
  createJadwalSchema,
  jadwalIdParamsSchema,
  jadwalQuerySchema,
  jadwalSayaQuerySchema,
  updateJadwalSchema,
} from './jadwal.validation.js';

const router = Router();

// Seluruh endpoint jadwal mengharuskan sesi login.
router.use(authenticateToken);

// Mahasiswa: jadwal mingguan dari KRS DISETUJUI (FR-036/037).
router.get('/saya', validate({ query: jadwalSayaQuerySchema }), jadwalController.getJadwalSaya);

// Dosen: jadwal kelas yang diampu (FR-038).
router.get('/mengajar', jadwalController.getJadwalMengajar);

// Admin Akademik: list penuh + filter semester/prodi/kelas/dosen (FR-100).
router.get(
  '/',
  requirePermission('jadwal:view'),
  validate({ query: jadwalQuerySchema }),
  jadwalController.list
);

// Admin Akademik: buat slot jadwal (deteksi bentrok run, FR-101).
router.post(
  '/',
  requirePermission('jadwal:manage'),
  validate(createJadwalSchema),
  jadwalController.create
);

// Admin Akademik: ubah slot jadwal (deteksi bentrok run, FR-101).
router.put(
  '/:id',
  requirePermission('jadwal:manage'),
  validate({ params: jadwalIdParamsSchema, body: updateJadwalSchema }),
  jadwalController.update
);

// Admin Akademik: hapus slot jadwal.
router.delete(
  '/:id',
  requirePermission('jadwal:manage'),
  validate({ params: jadwalIdParamsSchema }),
  jadwalController.remove
);

// Login (scoped): detail slot jadwal.
router.get('/:id', validate({ params: jadwalIdParamsSchema }), jadwalController.getById);

export default router;
