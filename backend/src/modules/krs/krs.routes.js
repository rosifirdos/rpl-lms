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
  krsRequiredSemesterQuerySchema,
  krsSemesterQuerySchema,
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

export default router;
