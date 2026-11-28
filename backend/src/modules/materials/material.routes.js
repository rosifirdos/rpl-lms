import { Router } from 'express';
import { authenticateToken } from '../../middlewares/auth.middleware.js';
import { requireRole } from '../../middlewares/rbac.middleware.js';
import { uploadMaterial, enforceConfiguredUploadPolicy } from '../../middlewares/upload.middleware.js';
import { validate } from '../../middlewares/validate.middleware.js';
import { ROLES } from '../../constants/roles.js';
import { MaterialController } from './material.controller.js';
import {
  createMaterialSchema,
  materialIdParamSchema,
  meetingIdParamSchema,
  updateMaterialSchema,
} from './material.dto.js';

export const meetingMaterialRoutes = Router();
meetingMaterialRoutes.use(authenticateToken);

meetingMaterialRoutes.post(
  '/:meetingId/materials',
  requireRole(ROLES.DOSEN, ROLES.ADMIN),
  validate(meetingIdParamSchema),
  uploadMaterial,
  enforceConfiguredUploadPolicy({ kind: 'material' }),
  validate(createMaterialSchema),
  MaterialController.createMaterial
);

export const materialRoutes = Router();
materialRoutes.use(authenticateToken);

materialRoutes.put(
  '/:id',
  requireRole(ROLES.DOSEN, ROLES.ADMIN),
  validate(updateMaterialSchema),
  MaterialController.updateMaterial
);

materialRoutes.delete(
  '/:id',
  requireRole(ROLES.DOSEN, ROLES.ADMIN),
  validate(materialIdParamSchema),
  MaterialController.deleteMaterial
);

materialRoutes.get(
  '/:id/download',
  requireRole(ROLES.MAHASISWA, ROLES.DOSEN, ROLES.ADMIN),
  validate(materialIdParamSchema),
  MaterialController.downloadMaterial
);
