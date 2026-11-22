import { Router } from "express";
import { EnrollmentsController } from "./enrollments.controller.js";
import { authenticateToken } from "../../middlewares/auth.middleware.js";
import { requireRole } from "../../middlewares/rbac.middleware.js";
import { validate } from "../../middlewares/validate.middleware.js";
import { adminOperationsLimiter } from "../../middlewares/rateLimit.middleware.js";
import { ROLES } from "../../constants/roles.js";
import {
  enrollmentIdParamSchema,
  createEnrollmentSchema,
} from "./enrollments.validation.js";

const router = Router();

// FIX F9: Hapus duplikasi rute alias - gunakan /api/admin/classes/:classId/enrollments dari classes.routes.js
// Modul enrollments hanya handle operasi POST (enroll) dan DELETE (unenroll)
// Seluruh rute enrollment hanya dapat diakses oleh Admin (BR-002)
router.use(authenticateToken);
router.use(requireRole(ROLES.ADMIN));

// Pendaftaran mahasiswa ke kelas (individual atau batch)
router.post(
  "/",
  adminOperationsLimiter,
  validate(createEnrollmentSchema),
  EnrollmentsController.enrollStudents
);

// Pencabutan kepesertaan mahasiswa dari kelas
router.delete(
  "/:id",
  adminOperationsLimiter,
  validate(enrollmentIdParamSchema),
  EnrollmentsController.unenrollStudent
);

export default router;
