/**
 * KRS Routes — Fase 8: periode, katalog, dan siklus draft mahasiswa.
 */

import { Router } from 'express';
import { authenticateToken } from '../../middlewares/auth.middleware.js';
import { requirePermission } from '../../middlewares/rbac.middleware.js';
import { validate } from '../../middlewares/validate.middleware.js';
import { krsController } from './krs.controller.js';
import { periodeController } from './periode.controller.js';
import {
  createPeriodeSchema,
  hapusKrsItemParamsSchema,
  kembalikanKrsSchema,
  krsIdParamsSchema,
  krsRequiredSemesterQuerySchema,
  krsSemesterQuerySchema,
  monitorQuerySchema,
  pengajuanQuerySchema,
  periodeIdParamsSchema,
  periodeQuerySchema,
  submitKrsSchema,
  tambahKrsItemSchema,
  updatePeriodeSchema,
} from './krs.validation.js';

const router = Router();

// Seluruh endpoint KRS mengharuskan sesi login.
router.use(authenticateToken);

// Mahasiswa: periode dan siklus draft.
router.get('/periode-aktif', krsController.getPeriodeAktif);
router.get('/saya', validate({ query: krsSemesterQuerySchema }), krsController.getMyKRS);
router.get('/tersedia', validate({ query: krsSemesterQuerySchema }), krsController.getAvailableClasses);
router.post(
  '/saya/items',
  requirePermission('krs:submit'),
  validate({ query: krsRequiredSemesterQuerySchema, body: tambahKrsItemSchema }),
  krsController.addItem
);
router.delete(
  '/saya/items/:detailId',
  requirePermission('krs:submit'),
  validate({ params: hapusKrsItemParamsSchema }),
  krsController.removeItem
);
router.post(
  '/saya/submit',
  requirePermission('krs:submit'),
  validate(submitKrsSchema),
  krsController.submitKRS
);

// Admin Akademik: periode KRS (Fase 8).
router.get('/admin/periode', requirePermission('krs:manage'), validate({ query: periodeQuerySchema }), periodeController.list);
router.post('/admin/periode', requirePermission('krs:manage'), validate(createPeriodeSchema), periodeController.create);
router.put(
  '/admin/periode/:id',
  requirePermission('krs:manage'),
  validate({ params: periodeIdParamsSchema, body: updatePeriodeSchema }),
  periodeController.update
);
router.patch(
  '/admin/periode/:id/activate',
  requirePermission('krs:manage'),
  validate({ params: periodeIdParamsSchema }),
  periodeController.activate
);

// ==========================================
// Fase 9: Persetujuan PA & Monitoring Admin (SRS FR-031 s/d FR-035, FR-103)
// ==========================================

// Dosen Wali/PA: daftar pengajuan mahasiswa bimbingan (UC-04).
// Approver reguler hanya PA (Keputusan Desain #7); Super Admin bypass via middleware.
router.get(
  '/pengajuan',
  requirePermission('krs:approve'),
  validate({ query: pengajuanQuerySchema }),
  krsController.getPengajuan
);

// Admin Akademik: monitoring rekap status KRS (FR-103, Bab 31).
router.get(
  '/admin/monitor',
  requirePermission('krs:manage'),
  validate({ query: monitorQuerySchema }),
  krsController.monitorKRS
);

// Admin Akademik: intervensi reset ke DRAFT paksa (audit KRS_ADMIN_RESET).
router.post(
  '/admin/:id/reset-draft',
  requirePermission('krs:manage'),
  validate({ params: krsIdParamsSchema }),
  krsController.resetToDraft
);

// PA: approve & return KRS mahasiswa bimbingan (ownership check di service).
router.post(
  '/:id/approve',
  requirePermission('krs:approve'),
  validate({ params: krsIdParamsSchema }),
  krsController.approveKRS
);
router.post(
  '/:id/return',
  requirePermission('krs:approve'),
  validate({ params: krsIdParamsSchema, body: kembalikanKrsSchema }),
  krsController.returnKRS
);

// Scoped detail KRS: pemilik / PA pemilik / admin (SRS Bab 31 — least privilege).
router.get('/:id', validate({ params: krsIdParamsSchema }), krsController.getKRSById);

export default router;
