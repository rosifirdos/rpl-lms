import { Router } from 'express';
import { masterController } from './master.controller.js';
import { authenticateToken } from '../../middlewares/auth.middleware.js';
import { requireRole } from '../../middlewares/rbac.middleware.js';
import { validate } from '../../middlewares/validate.middleware.js';
import { ROLES } from '../../constants/roles.js';
import {
  listQuerySchema,
  createFakultasSchema,
  updateFakultasSchema,
  createProdiSchema,
  updateProdiSchema,
  listProdiQuerySchema,
  createTahunAkademikSchema,
  updateTahunAkademikSchema,
  createSemesterSchema,
  updateSemesterSchema,
  listSemesterQuerySchema,
  createKurikulumSchema,
  updateKurikulumSchema,
  listKurikulumQuerySchema,
  createMataKuliahSchema,
  updateMataKuliahSchema,
  listMataKuliahQuerySchema,
  createGedungSchema,
  updateGedungSchema,
  createRuanganSchema,
  updateRuanganSchema,
  listRuanganQuerySchema,
  createKelasSchema,
  updateKelasSchema,
  listKelasQuerySchema,
} from './master.validation.js';

const router = Router();

// Seluruh endpoint master terproteksi autentikasi token
router.use(authenticateToken);

// Role izin kelola master data umum
const masterAdminRoles = [ROLES.SUPER_ADMIN, ROLES.ADMIN_AKADEMIK];
// Role izin kelola fasilitas gedung & ruangan (SRS Bab 4.5)
const facilityAdminRoles = [ROLES.SUPER_ADMIN, ROLES.ADMIN_AKADEMIK, ROLES.ADMIN_LMS];
// Role izin baca master data
const masterReadRoles = [ROLES.SUPER_ADMIN, ROLES.ADMIN_AKADEMIK, ROLES.ADMIN_LMS];

// -------------------------------------------------------------
// 1. FAKULTAS (/api/v1/master/fakultas)
// -------------------------------------------------------------
router.get('/fakultas', requireRole(...masterReadRoles), validate({ query: listQuerySchema }), masterController.listFakultas);
router.get('/fakultas/:id', requireRole(...masterReadRoles), masterController.detailFakultas);
router.post('/fakultas', requireRole(...masterAdminRoles), validate(createFakultasSchema), masterController.createFakultas);
router.put('/fakultas/:id', requireRole(...masterAdminRoles), validate(updateFakultasSchema), masterController.updateFakultas);
router.delete('/fakultas/:id', requireRole(...masterAdminRoles), masterController.deleteFakultas);

// -------------------------------------------------------------
// 2. PROGRAM STUDI (/api/v1/master/prodi)
// -------------------------------------------------------------
router.get('/prodi', requireRole(...masterReadRoles), validate({ query: listProdiQuerySchema }), masterController.listProdi);
router.get('/prodi/:id', requireRole(...masterReadRoles), masterController.detailProdi);
router.post('/prodi', requireRole(...masterAdminRoles), validate(createProdiSchema), masterController.createProdi);
router.put('/prodi/:id', requireRole(...masterAdminRoles), validate(updateProdiSchema), masterController.updateProdi);
router.delete('/prodi/:id', requireRole(...masterAdminRoles), masterController.deleteProdi);

// -------------------------------------------------------------
// 3. TAHUN AKADEMIK (/api/v1/master/tahun-akademik)
// -------------------------------------------------------------
router.get('/tahun-akademik', requireRole(...masterReadRoles), validate({ query: listQuerySchema }), masterController.listTahunAkademik);
router.get('/tahun-akademik/:id', requireRole(...masterReadRoles), masterController.detailTahunAkademik);
router.post('/tahun-akademik', requireRole(...masterAdminRoles), validate(createTahunAkademikSchema), masterController.createTahunAkademik);
router.put('/tahun-akademik/:id', requireRole(...masterAdminRoles), validate(updateTahunAkademikSchema), masterController.updateTahunAkademik);
router.delete('/tahun-akademik/:id', requireRole(...masterAdminRoles), masterController.deleteTahunAkademik);

// -------------------------------------------------------------
// 4. SEMESTER (/api/v1/master/semester)
// -------------------------------------------------------------
router.get('/semester', requireRole(...masterReadRoles), validate({ query: listSemesterQuerySchema }), masterController.listSemester);
router.get('/semester/:id', requireRole(...masterReadRoles), masterController.detailSemester);
router.post('/semester', requireRole(...masterAdminRoles), validate(createSemesterSchema), masterController.createSemester);
router.put('/semester/:id', requireRole(...masterAdminRoles), validate(updateSemesterSchema), masterController.updateSemester);
router.patch('/semester/:id/activate', requireRole(...masterAdminRoles), masterController.activateSemester);
router.delete('/semester/:id', requireRole(...masterAdminRoles), masterController.deleteSemester);

// -------------------------------------------------------------
// 5. KURIKULUM (/api/v1/master/kurikulum)
// -------------------------------------------------------------
router.get('/kurikulum', requireRole(...masterReadRoles), validate({ query: listKurikulumQuerySchema }), masterController.listKurikulum);
router.get('/kurikulum/:id', requireRole(...masterReadRoles), masterController.detailKurikulum);
router.post('/kurikulum', requireRole(...masterAdminRoles), validate(createKurikulumSchema), masterController.createKurikulum);
router.put('/kurikulum/:id', requireRole(...masterAdminRoles), validate(updateKurikulumSchema), masterController.updateKurikulum);
router.delete('/kurikulum/:id', requireRole(...masterAdminRoles), masterController.deleteKurikulum);

// -------------------------------------------------------------
// 6. MATA KULIAH (/api/v1/master/mata-kuliah)
// -------------------------------------------------------------
router.get('/mata-kuliah', requireRole(...masterReadRoles), validate({ query: listMataKuliahQuerySchema }), masterController.listMataKuliah);
router.get('/mata-kuliah/:id', requireRole(...masterReadRoles), masterController.detailMataKuliah);
router.post('/mata-kuliah', requireRole(...masterAdminRoles), validate(createMataKuliahSchema), masterController.createMataKuliah);
router.put('/mata-kuliah/:id', requireRole(...masterAdminRoles), validate(updateMataKuliahSchema), masterController.updateMataKuliah);
router.delete('/mata-kuliah/:id', requireRole(...masterAdminRoles), masterController.deleteMataKuliah);

// -------------------------------------------------------------
// 7. GEDUNG (/api/v1/master/gedung)
// -------------------------------------------------------------
router.get('/gedung', requireRole(...facilityAdminRoles), validate({ query: listQuerySchema }), masterController.listGedung);
router.get('/gedung/:id', requireRole(...facilityAdminRoles), masterController.detailGedung);
router.post('/gedung', requireRole(...facilityAdminRoles), validate(createGedungSchema), masterController.createGedung);
router.put('/gedung/:id', requireRole(...facilityAdminRoles), validate(updateGedungSchema), masterController.updateGedung);
router.delete('/gedung/:id', requireRole(...facilityAdminRoles), masterController.deleteGedung);

// -------------------------------------------------------------
// 8. RUANGAN (/api/v1/master/ruangan)
// -------------------------------------------------------------
router.get('/ruangan', requireRole(...facilityAdminRoles), validate({ query: listRuanganQuerySchema }), masterController.listRuangan);
router.get('/ruangan/:id', requireRole(...facilityAdminRoles), masterController.detailRuangan);
router.post('/ruangan', requireRole(...facilityAdminRoles), validate(createRuanganSchema), masterController.createRuangan);
router.put('/ruangan/:id', requireRole(...facilityAdminRoles), validate(updateRuanganSchema), masterController.updateRuangan);
router.delete('/ruangan/:id', requireRole(...facilityAdminRoles), masterController.deleteRuangan);

// -------------------------------------------------------------
// 9. KELAS PENAWARAN (/api/v1/master/kelas)
// -------------------------------------------------------------
router.get('/kelas', requireRole(...masterReadRoles), validate({ query: listKelasQuerySchema }), masterController.listKelas);
router.get('/kelas/:id', requireRole(...masterReadRoles), masterController.detailKelas);
router.post('/kelas', requireRole(...masterAdminRoles), validate(createKelasSchema), masterController.createKelas);
router.put('/kelas/:id', requireRole(...masterAdminRoles), validate(updateKelasSchema), masterController.updateKelas);
router.delete('/kelas/:id', requireRole(...masterAdminRoles), masterController.deleteKelas);

export default router;
