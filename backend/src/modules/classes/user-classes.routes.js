import { Router } from "express";
import { UserClassesController } from "./user-classes.controller.js";
import { authenticateToken } from "../../middlewares/auth.middleware.js";
import { requireRole } from "../../middlewares/rbac.middleware.js";
import { validate } from "../../middlewares/validate.middleware.js";
import { classIdParamSchema, classListQuerySchema } from "./classes.validation.js";
import { ROLES } from "../../constants/roles.js";

const router = Router();

// Hanya Mahasiswa dan Dosen yang boleh akses /api/classes
// FIX F5: Tambah requireRole untuk fail-closed (bukan fail-open)
router.use(authenticateToken);
router.use(requireRole(ROLES.MAHASISWA, ROLES.DOSEN));

router.get("/", validate(classListQuerySchema), UserClassesController.getUserClasses);
router.get("/:id", validate(classIdParamSchema), UserClassesController.getClassDetail);

export default router;
