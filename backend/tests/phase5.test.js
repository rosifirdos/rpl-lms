import test from 'node:test';
import assert from 'node:assert/strict';
import app from '../src/app.js';
import prisma from '../src/config/prisma.js';

let server;
let baseUrl;

// Helper login untuk mendapatkan access token
async function getAuthToken(identifier, password = 'Password123!') {
  const res = await fetch(`${baseUrl}/api/v1/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifier, password }),
  });
  const data = await res.json();
  return { status: res.status, token: data?.data?.accessToken, data: data?.data };
}

test.before(async () => {
  await new Promise((resolve) => {
    server = app.listen(0, () => {
      const port = server.address().port;
      baseUrl = `http://localhost:${port}`;
      console.log(`\n🚀 Test server (Phase 5) listening on ${baseUrl}\n`);
      resolve();
    });
  });
});

test.after(async () => {
  if (server) {
    await new Promise((resolve) => server.close(resolve));
  }
  await prisma.$disconnect();
});

test('1. Security: Penolakan endpoint portal tanpa token autentikasi (401)', async () => {
  const resModules = await fetch(`${baseUrl}/api/v1/portal/modules`);
  const dataModules = await resModules.json();
  assert.equal(resModules.status, 401);
  assert.equal(dataModules.success, false);

  const resDashboard = await fetch(`${baseUrl}/api/v1/portal/dashboard`);
  const dataDashboard = await resDashboard.json();
  assert.equal(resDashboard.status, 401);
  assert.equal(dataDashboard.success, false);
});

test('2. Portal Modules: Evaluasi hak akses modul kampus berbasis peran', async () => {
  // A. Super Admin berhak mengakses semua modul
  const { token: adminToken } = await getAuthToken('superadmin');
  const resAdmin = await fetch(`${baseUrl}/api/v1/portal/modules`, {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  const dataAdmin = await resAdmin.json();

  assert.equal(resAdmin.status, 200);
  assert.equal(dataAdmin.success, true);
  assert.equal(dataAdmin.data.accessible_count, 5);
  const adminAccessibleCodes = dataAdmin.data.accessible_modules.map((m) => m.code);
  assert.ok(adminAccessibleCodes.includes('PORTAL'));
  assert.ok(adminAccessibleCodes.includes('SIA'));
  assert.ok(adminAccessibleCodes.includes('SPADA'));
  assert.ok(adminAccessibleCodes.includes('PMB'));
  assert.ok(adminAccessibleCodes.includes('ADMIN_PORTAL'));

  // B. Mahasiswa berhak mengakses PORTAL, SIA, dan SPADA (tidak berhak ADMIN_PORTAL)
  const { token: mhsToken } = await getAuthToken('2024001001');
  const resMhs = await fetch(`${baseUrl}/api/v1/portal/modules`, {
    headers: { Authorization: `Bearer ${mhsToken}` },
  });
  const dataMhs = await resMhs.json();

  assert.equal(resMhs.status, 200);
  const mhsAccessibleCodes = dataMhs.data.accessible_modules.map((m) => m.code);
  assert.ok(mhsAccessibleCodes.includes('PORTAL'));
  assert.ok(mhsAccessibleCodes.includes('SIA'));
  assert.ok(mhsAccessibleCodes.includes('SPADA'));
  assert.equal(mhsAccessibleCodes.includes('ADMIN_PORTAL'), false);

  // C. Calon Mahasiswa berhak mengakses PORTAL dan PMB
  const { token: calonToken } = await getAuthToken('PMB20260001');
  const resCalon = await fetch(`${baseUrl}/api/v1/portal/modules`, {
    headers: { Authorization: `Bearer ${calonToken}` },
  });
  const dataCalon = await resCalon.json();

  assert.equal(resCalon.status, 200);
  const calonAccessibleCodes = dataCalon.data.accessible_modules.map((m) => m.code);
  assert.ok(calonAccessibleCodes.includes('PORTAL'));
  assert.ok(calonAccessibleCodes.includes('PMB'));
  assert.equal(calonAccessibleCodes.includes('SIA'), false);
  assert.equal(calonAccessibleCodes.includes('SPADA'), false);
});

test('3. Dashboard Mahasiswa: Menyajikan konteks akademik, Dosen Wali, status KRS, & modul SIA/SPADA (SRS Bab 9)', async () => {
  const { token } = await getAuthToken('2024001001');
  const res = await fetch(`${baseUrl}/api/v1/portal/dashboard`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();

  assert.equal(res.status, 200);
  assert.equal(data.success, true);
  assert.ok(data.data.system_context);
  assert.ok(data.data.system_context.semester_aktif);
  assert.equal(data.data.system_context.semester_aktif.tipe, 'GANJIL');

  const mhsDashboard = data.data.role_dashboards.mahasiswa;
  assert.ok(mhsDashboard);
  assert.equal(mhsDashboard.biodata.nim, '2024001001');
  assert.equal(mhsDashboard.biodata.status_akademik, 'AKTIF');
  assert.ok(mhsDashboard.biodata.prodi);
  assert.ok(mhsDashboard.dosen_pembimbing);
  assert.ok(mhsDashboard.dosen_pembimbing.nama_lengkap.includes('Budi Santoso'));
  assert.ok(mhsDashboard.status_krs);
  assert.equal(mhsDashboard.modul_terkait.length, 2);
});

test('4. Dashboard Dosen & PA: Menyajikan kelas diampu & mahasiswa perwalian (SRS Bab 19)', async () => {
  // Dosen Wali (Budi Santoso - NIDN 198501152010121002)
  const { token } = await getAuthToken('198501152010121002');
  const res = await fetch(`${baseUrl}/api/v1/portal/dashboard`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();

  assert.equal(res.status, 200);
  assert.equal(data.success, true);

  const dosenDashboard = data.data.role_dashboards.dosen;
  assert.ok(dosenDashboard);
  assert.ok(dosenDashboard.biodata.nama_lengkap.includes('Budi Santoso'));
  assert.ok(dosenDashboard.statistik.total_kelas_diampu >= 1);
  assert.ok(dosenDashboard.statistik.total_mahasiswa_wali >= 1);
  assert.ok(Array.isArray(dosenDashboard.kelas_semester_aktif));
  assert.ok(dosenDashboard.kelas_semester_aktif[0].mata_kuliah.nama);
  assert.ok(dosenDashboard.perwalian_aktif);
});

test('5. Dashboard Admin Akademik: Agregasi metrik kampus terpadu (SRS Bab 19.1)', async () => {
  const { token } = await getAuthToken('admin_akademik');
  const res = await fetch(`${baseUrl}/api/v1/portal/dashboard`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();

  assert.equal(res.status, 200);
  assert.equal(data.success, true);

  const adminAkademik = data.data.role_dashboards.admin_akademik;
  assert.ok(adminAkademik);
  assert.ok(adminAkademik.metrik.total_mahasiswa >= 1);
  assert.ok(adminAkademik.metrik.total_dosen >= 2);
  assert.ok(adminAkademik.metrik.total_program_studi >= 2);
  assert.ok(adminAkademik.metrik.total_fakultas >= 2);
  assert.ok(adminAkademik.status_operasional.tahun_akademik);
  assert.ok(adminAkademik.status_operasional.semester);
});

test('6. Dashboard Admin LMS: Monitoring operasional SPADA (SRS Bab 19.2)', async () => {
  const { token } = await getAuthToken('admin_lms');
  const res = await fetch(`${baseUrl}/api/v1/portal/dashboard`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();

  assert.equal(res.status, 200);
  assert.equal(data.success, true);

  const adminLms = data.data.role_dashboards.admin_lms;
  assert.ok(adminLms);
  assert.ok(adminLms.metrik.total_kelas_spada_aktif >= 1);
  assert.ok(adminLms.metrik.total_dosen_pengampu_aktif >= 1);
  assert.ok(adminLms.layanan_pembelajaran.length >= 6);
  assert.ok(Array.isArray(adminLms.rekap_prodi));
});

test('7. Dashboard Super Admin: Kendali akun, role distribusi, & jejak audit (SRS Bab 19.3)', async () => {
  const { token } = await getAuthToken('superadmin');
  const res = await fetch(`${baseUrl}/api/v1/portal/dashboard`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();

  assert.equal(res.status, 200);
  assert.equal(data.success, true);

  const superAdmin = data.data.role_dashboards.super_admin;
  assert.ok(superAdmin);
  assert.ok(superAdmin.metrik_pengguna.total_users >= 7);
  assert.ok(superAdmin.metrik_pengguna.users_aktif >= 7);
  assert.ok(superAdmin.distribusi_peran);
  assert.ok(superAdmin.sistem_keamanan.total_roles >= 8);
  assert.ok(superAdmin.sistem_keamanan.total_permissions >= 11);
  assert.ok(Array.isArray(superAdmin.audit_logs_terkini));
});

test('8. Dashboard Calon Mahasiswa: Status seleksi & tahapan PMB', async () => {
  const { token } = await getAuthToken('PMB20260001');
  const res = await fetch(`${baseUrl}/api/v1/portal/dashboard`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();

  assert.equal(res.status, 200);
  assert.equal(data.success, true);

  const calonMhs = data.data.role_dashboards.calon_mahasiswa;
  assert.ok(calonMhs);
  assert.equal(calonMhs.biodata_pendaftaran.no_pendaftaran, 'PMB20260001');
  assert.ok(calonMhs.biodata_pendaftaran.status_seleksi);
  assert.ok(calonMhs.tahapan_seleksi.length >= 5);
});

test('9. Conceptual Aliases: Verifikasi endpoint /api/dashboard & /api/portal/modules', async () => {
  const { token } = await getAuthToken('2024001001');

  // Test alias /api/dashboard
  const resAliasDashboard = await fetch(`${baseUrl}/api/dashboard`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const dataAliasDashboard = await resAliasDashboard.json();
  assert.equal(resAliasDashboard.status, 200);
  assert.equal(dataAliasDashboard.success, true);
  assert.ok(dataAliasDashboard.data.role_dashboards.mahasiswa);

  // Test alias /api/portal/modules
  const resAliasModules = await fetch(`${baseUrl}/api/portal/modules`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const dataAliasModules = await resAliasModules.json();
  assert.equal(resAliasModules.status, 200);
  assert.equal(dataAliasModules.success, true);
  assert.ok(dataAliasModules.data.accessible_modules);
});
