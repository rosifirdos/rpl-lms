/**
 * ==========================================================================
 * FASE 6: Pengujian Integrasi End-to-End, Validasi Kepatuhan SRS & Handoff
 * ==========================================================================
 *
 * Test suite ini memvalidasi keseluruhan alur MVP 1 secara end-to-end:
 *  1. Alur login multi-kredensial → proteksi role → update profil
 *  2. Pencatatan mutasi di tabel audit_logs
 *  3. Kesesuaian endpoint konseptual SRS Bab 32
 *  4. Manajemen pengguna (CRUD user, role assignment, status management)
 *  5. Proteksi keamanan lintas modul (token, role, permission)
 *  6. Integritas respons standar JSON di seluruh endpoint
 *  7. Konsistensi data antara modul portal, profil, dan master data
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import app from '../src/app.js';
import prisma from '../src/config/prisma.js';
import { hashPassword } from '../src/utils/password.js';

let server;
let baseUrl;

// ============================================================
// Helper Login
// ============================================================
async function login(identifier, password = 'Password123!') {
  const res = await fetch(`${baseUrl}/api/v1/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifier, password }),
  });
  const data = await res.json();
  return {
    status: res.status,
    token: data?.data?.accessToken,
    refreshToken: data?.data?.refreshToken,
    user: data?.data?.user,
    data: data?.data,
    body: data,
  };
}

async function authHeaders(identifier, password = 'Password123!') {
  const { token } = await login(identifier, password);
  return { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
}

// ============================================================
// Setup & Teardown
// ============================================================
test.before(async () => {
  await new Promise((resolve) => {
    server = app.listen(0, () => {
      const port = server.address().port;
      baseUrl = `http://localhost:${port}`;
      console.log(`\n🧪 Fase 6 E2E Test server listening on ${baseUrl}\n`);
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

// ============================================================
// BAGIAN 1: ALUR AUTENTIKASI END-TO-END
// ============================================================

test('1.1 E2E Auth: Alur lengkap login → akses → refresh → change password → logout', async () => {
  // Buat user uji khusus Fase 6
  const pw = await hashPassword('Fase6Test123!');
  const testUser = await prisma.user.upsert({
    where: { username: 'fase6_test_user' },
    update: { password_hash: pw, status: 'ACTIVE' },
    create: {
      username: 'fase6_test_user',
      email: 'fase6test@kampus.ac.id',
      password_hash: pw,
      status: 'ACTIVE',
    },
  });

  // A. Login berhasil
  const loginResult = await login('fase6_test_user', 'Fase6Test123!');
  assert.equal(loginResult.status, 200, 'Login harus berhasil (200)');
  assert.ok(loginResult.token, 'Access token harus ada');
  assert.ok(loginResult.refreshToken, 'Refresh token harus ada');

  // B. Akses profil dengan token
  const profileRes = await fetch(`${baseUrl}/api/v1/profile`, {
    headers: { Authorization: `Bearer ${loginResult.token}` },
  });
  assert.equal(profileRes.status, 200, 'Akses profil harus 200');

  // C. Refresh token
  const refreshRes = await fetch(`${baseUrl}/api/v1/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken: loginResult.refreshToken }),
  });
  const refreshData = await refreshRes.json();
  assert.equal(refreshRes.status, 200, 'Refresh harus 200');
  assert.ok(refreshData.data.accessToken, 'Access token baru harus diterbitkan');

  // D. Change password
  const changePwRes = await fetch(`${baseUrl}/api/v1/auth/change-password`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${refreshData.data.accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      oldPassword: 'Fase6Test123!',
      newPassword: 'Fase6NewPw456!',
      confirmPassword: 'Fase6NewPw456!',
    }),
  });
  assert.equal(changePwRes.status, 200, 'Change password harus 200');

  // E. Login ulang dengan password baru
  const reloginResult = await login('fase6_test_user', 'Fase6NewPw456!');
  assert.equal(reloginResult.status, 200, 'Login dengan password baru harus 200');

  // F. Logout
  const logoutRes = await fetch(`${baseUrl}/api/v1/auth/logout`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${reloginResult.token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ refreshToken: reloginResult.refreshToken }),
  });
  assert.equal(logoutRes.status, 200, 'Logout harus 200');

  // G. Refresh setelah logout harus ditolak
  const postLogoutRefresh = await fetch(`${baseUrl}/api/v1/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken: reloginResult.refreshToken }),
  });
  assert.equal(postLogoutRefresh.status, 401, 'Refresh setelah logout harus ditolak (401)');

  // Cleanup
  await prisma.refreshToken.deleteMany({ where: { user_id: testUser.id } });
  await prisma.user.delete({ where: { id: testUser.id } });
});

test('1.2 E2E Auth: Multi-kredensial login untuk semua tipe identifier', async () => {
  // A. Login dengan username
  const adminLogin = await login('superadmin');
  assert.equal(adminLogin.status, 200);
  assert.ok(adminLogin.user.roles.includes('SUPER_ADMIN'));

  // B. Login dengan NIM (mahasiswa)
  const mhsLogin = await login('2024001001');
  assert.equal(mhsLogin.status, 200);
  assert.ok(mhsLogin.user.roles.includes('MAHASISWA'));
  assert.equal(mhsLogin.user.profile.type, 'MAHASISWA');

  // C. Login dengan NIDN (dosen)
  const dosenLogin = await login('198501152010121002');
  assert.equal(dosenLogin.status, 200);
  assert.ok(dosenLogin.user.roles.includes('DOSEN'));
  assert.ok(dosenLogin.user.roles.includes('DOSEN_WALI'));

  // D. Login dengan no_pendaftaran (calon mahasiswa)
  const calonLogin = await login('PMB20260001');
  assert.equal(calonLogin.status, 200);
  assert.ok(calonLogin.user.roles.includes('CALON_MAHASISWA'));
});

test('1.3 E2E Auth: Penolakan akun tidak aktif dan kredensial salah', async () => {
  // A. Password salah
  const wrongPwLogin = await login('superadmin', 'WrongPassword999!');
  assert.equal(wrongPwLogin.status, 401);
  assert.equal(wrongPwLogin.body.success, false);

  // B. User tidak ada
  const noUserLogin = await login('user_tidak_ada_xyz');
  assert.equal(noUserLogin.status, 401);
  assert.equal(noUserLogin.body.success, false);

  // C. Akun INACTIVE
  const pw = await hashPassword('Password123!');
  const inactiveUser = await prisma.user.upsert({
    where: { username: 'fase6_inactive' },
    update: { status: 'INACTIVE', password_hash: pw },
    create: {
      username: 'fase6_inactive',
      email: 'fase6inactive@kampus.ac.id',
      password_hash: pw,
      status: 'INACTIVE',
    },
  });
  const inactiveLogin = await login('fase6_inactive');
  assert.equal(inactiveLogin.status, 403);
  assert.match(inactiveLogin.body.message, /tidak aktif/i);

  // D. Akun SUSPENDED
  await prisma.user.update({ where: { id: inactiveUser.id }, data: { status: 'SUSPENDED' } });
  const suspendedLogin = await login('fase6_inactive');
  assert.equal(suspendedLogin.status, 403);

  // Cleanup
  await prisma.user.delete({ where: { id: inactiveUser.id } });
});

// ============================================================
// BAGIAN 2: PROFIL MANDIRI & PROTEKSI ROLE
// ============================================================

test('2.1 E2E Profil: GET & PUT profil untuk semua role pengguna', async () => {
  const roles = [
    { identifier: 'superadmin', profileType: 'ADMIN' },
    { identifier: 'admin_akademik', profileType: 'ADMIN' },
    { identifier: 'admin_lms', profileType: 'ADMIN' },
    { identifier: '198501152010121002', profileType: 'DOSEN' },
    { identifier: '2024001001', profileType: 'MAHASISWA' },
    { identifier: 'PMB20260001', profileType: 'CALON_MAHASISWA' },
  ];

  for (const { identifier, profileType } of roles) {
    const headers = await authHeaders(identifier);

    // GET profile
    const getRes = await fetch(`${baseUrl}/api/v1/profile`, { headers });
    const getData = await getRes.json();
    assert.equal(getRes.status, 200, `GET profile untuk ${identifier} harus 200`);
    assert.equal(getData.success, true);
    assert.equal(getData.data.profile.type, profileType, `Tipe profil ${identifier} harus ${profileType}`);
    assert.ok(getData.data.roles.length > 0, `${identifier} harus punya minimal 1 role`);
    assert.ok(getData.data.permissions.length > 0, `${identifier} harus punya minimal 1 permission`);
  }
});

test('2.2 E2E Profil: Update nama mahasiswa dan verifikasi konsistensi', async () => {
  const headers = await authHeaders('2024001001');

  // Update nama
  const updateRes = await fetch(`${baseUrl}/api/v1/profile`, {
    method: 'PUT',
    headers,
    body: JSON.stringify({ nama: 'Ahmad Fauzi Fase 6' }),
  });
  const updateData = await updateRes.json();
  assert.equal(updateRes.status, 200);
  assert.equal(updateData.data.profile.nama, 'Ahmad Fauzi Fase 6');

  // Verifikasi via GET
  const getRes = await fetch(`${baseUrl}/api/v1/profile`, { headers });
  const getData = await getRes.json();
  assert.equal(getData.data.profile.nama, 'Ahmad Fauzi Fase 6');

  // Kembalikan ke semula
  await fetch(`${baseUrl}/api/v1/profile`, {
    method: 'PUT',
    headers,
    body: JSON.stringify({ nama: 'Ahmad Fauzi' }),
  });
});

// ============================================================
// BAGIAN 3: PROTEKSI KEAMANAN LINTAS MODUL
// ============================================================

test('3.1 E2E Security: Semua endpoint terproteksi menolak akses tanpa token (401)', async () => {
  const protectedEndpoints = [
    { method: 'GET', url: '/api/v1/profile' },
    { method: 'PUT', url: '/api/v1/profile' },
    { method: 'GET', url: '/api/v1/portal/modules' },
    { method: 'GET', url: '/api/v1/portal/dashboard' },
    { method: 'GET', url: '/api/v1/audit-logs' },
    { method: 'GET', url: '/api/v1/users' },
    { method: 'GET', url: '/api/v1/calendar' },
    { method: 'GET', url: '/api/v1/master/fakultas' },
    { method: 'GET', url: '/api/v1/master/prodi' },
    { method: 'GET', url: '/api/v1/master/tahun-akademik' },
    { method: 'GET', url: '/api/v1/master/semester' },
    { method: 'GET', url: '/api/v1/master/kurikulum' },
    { method: 'GET', url: '/api/v1/master/mata-kuliah' },
    { method: 'GET', url: '/api/v1/master/gedung' },
    { method: 'GET', url: '/api/v1/master/ruangan' },
    { method: 'GET', url: '/api/v1/master/kelas' },
  ];

  for (const ep of protectedEndpoints) {
    const res = await fetch(`${baseUrl}${ep.url}`, { method: ep.method });
    assert.equal(res.status, 401, `${ep.method} ${ep.url} harus 401 tanpa token`);
    const body = await res.json();
    assert.equal(body.success, false);
  }
});

test('3.2 E2E Security: Token rusak/palsu ditolak (401)', async () => {
  const endpoints = ['/api/v1/profile', '/api/v1/portal/modules', '/api/v1/calendar'];

  for (const ep of endpoints) {
    const res = await fetch(`${baseUrl}${ep}`, {
      headers: { Authorization: 'Bearer invalid.fake.token' },
    });
    assert.equal(res.status, 401, `${ep} harus menolak token palsu`);
  }
});

test('3.3 E2E Security: Pembatasan role mahasiswa pada operasi mutasi', async () => {
  const mhsHeaders = await authHeaders('2024001001');

  // Mahasiswa tidak boleh CRUD master data
  const mutationEndpoints = [
    { method: 'POST', url: '/api/v1/master/fakultas', body: { kode: 'FAKE', nama: 'Fakultas Palsu' } },
    { method: 'POST', url: '/api/v1/master/prodi', body: { fakultas_id: '00000000-0000-0000-0000-000000000000', kode: 'FAKE', nama: 'Prodi Palsu', jenjang: 'S1' } },
    { method: 'POST', url: '/api/v1/calendar', body: { semester_id: '00000000-0000-0000-0000-000000000000', agenda: 'Ilegal', mulai: '2026-09-01T00:00:00Z', selesai: '2026-09-02T00:00:00Z' } },
  ];

  for (const ep of mutationEndpoints) {
    const res = await fetch(`${baseUrl}${ep.url}`, {
      method: ep.method,
      headers: mhsHeaders,
      body: JSON.stringify(ep.body),
    });
    assert.equal(res.status, 403, `Mahasiswa seharusnya 403 pada ${ep.method} ${ep.url}`);
  }

  // Mahasiswa tidak boleh akses manajemen user
  const usersRes = await fetch(`${baseUrl}/api/v1/users`, { headers: mhsHeaders });
  assert.equal(usersRes.status, 403, 'Mahasiswa seharusnya 403 pada GET /api/v1/users');

  // Mahasiswa tidak boleh akses audit logs
  const auditRes = await fetch(`${baseUrl}/api/v1/audit-logs`, { headers: mhsHeaders });
  assert.equal(auditRes.status, 403, 'Mahasiswa seharusnya 403 pada GET /api/v1/audit-logs');
});

test('3.4 E2E Security: Super Admin bypass semua guard role', async () => {
  const saHeaders = await authHeaders('superadmin');

  const endpoints = [
    '/api/v1/master/fakultas',
    '/api/v1/master/prodi',
    '/api/v1/master/tahun-akademik',
    '/api/v1/master/semester',
    '/api/v1/master/kurikulum',
    '/api/v1/master/mata-kuliah',
    '/api/v1/master/gedung',
    '/api/v1/master/ruangan',
    '/api/v1/master/kelas',
    '/api/v1/calendar',
    '/api/v1/users',
    '/api/v1/audit-logs',
    '/api/v1/portal/modules',
    '/api/v1/portal/dashboard',
  ];

  for (const ep of endpoints) {
    const res = await fetch(`${baseUrl}${ep}`, { headers: saHeaders });
    assert.equal(res.status, 200, `Super Admin harus 200 pada GET ${ep}`);
    const body = await res.json();
    assert.equal(body.success, true);
  }
});

// ============================================================
// BAGIAN 4: MANAJEMEN PENGGUNA (USER MANAGEMENT)
// ============================================================

test('4.1 E2E Users: List user dengan pagination, filter role, dan search', async () => {
  const saHeaders = await authHeaders('superadmin');

  // A. List semua user
  const resAll = await fetch(`${baseUrl}/api/v1/users?page=1&limit=10`, { headers: saHeaders });
  const dataAll = await resAll.json();
  assert.equal(resAll.status, 200);
  assert.ok(dataAll.meta.total >= 7, 'Minimal 7 user dari seeder');
  assert.ok(dataAll.meta.page === 1);
  assert.ok(dataAll.meta.totalPages >= 1);

  // B. Filter berdasarkan role
  const resRole = await fetch(`${baseUrl}/api/v1/users?role=DOSEN`, { headers: saHeaders });
  const dataRole = await resRole.json();
  assert.equal(resRole.status, 200);
  assert.ok(dataRole.data.length >= 2, 'Minimal 2 dosen dari seeder');

  // C. Search berdasarkan nama
  const resSearch = await fetch(`${baseUrl}/api/v1/users?search=ahmad`, { headers: saHeaders });
  const dataSearch = await resSearch.json();
  assert.equal(resSearch.status, 200);
  assert.ok(dataSearch.data.length >= 1, 'Search "ahmad" harus menemukan mahasiswa');
});

test('4.2 E2E Users: Detail user menampilkan profil entitas lengkap', async () => {
  const saHeaders = await authHeaders('superadmin');

  // Ambil mahasiswa
  const mhsUser = await prisma.user.findUnique({
    where: { username: '2024001001' },
    include: { mahasiswa_profile: true },
  });

  const res = await fetch(`${baseUrl}/api/v1/users/${mhsUser.id}`, { headers: saHeaders });
  const data = await res.json();

  assert.equal(res.status, 200);
  assert.equal(data.data.username, '2024001001');
  // getUserById mengembalikan raw user dengan user_roles[] dan profil relasional
  assert.ok(data.data.user_roles || data.data.roles, 'Harus ada data role (user_roles atau roles)');
  assert.ok(
    data.data.mahasiswa_profile || data.data.profile || data.data.profiles,
    'Harus ada profil entitas (mahasiswa_profile/profile/profiles)'
  );
});

test('4.3 E2E Users: Penugasan role oleh Super Admin & pencatatannya di audit', async () => {
  const saHeaders = await authHeaders('superadmin');

  // Buat user uji
  const pw = await hashPassword('Password123!');
  const testUser = await prisma.user.upsert({
    where: { username: 'fase6_role_test' },
    update: { password_hash: pw, status: 'ACTIVE' },
    create: {
      username: 'fase6_role_test',
      email: 'fase6role@kampus.ac.id',
      password_hash: pw,
      status: 'ACTIVE',
    },
  });

  // Assign role MAHASISWA + CALON_MAHASISWA
  const resRole = await fetch(`${baseUrl}/api/v1/users/${testUser.id}/roles`, {
    method: 'PUT',
    headers: saHeaders,
    body: JSON.stringify({ roles: ['MAHASISWA', 'CALON_MAHASISWA'] }),
  });
  const dataRole = await resRole.json();
  assert.equal(resRole.status, 200);
  assert.ok(dataRole.data.newRoles.includes('MAHASISWA'));
  assert.ok(dataRole.data.newRoles.includes('CALON_MAHASISWA'));

  // Verifikasi audit log tercatat
  const auditLog = await prisma.auditLog.findFirst({
    where: {
      entity_id: testUser.id,
      action: 'UPDATE_USER_ROLES',
    },
    orderBy: { waktu: 'desc' },
  });
  assert.ok(auditLog, 'Mutasi role harus tercatat di audit log');
  assert.deepEqual(auditLog.new_values.roles, ['MAHASISWA', 'CALON_MAHASISWA']);

  // Cleanup
  await prisma.userRole.deleteMany({ where: { user_id: testUser.id } });
  await prisma.refreshToken.deleteMany({ where: { user_id: testUser.id } });
  await prisma.user.delete({ where: { id: testUser.id } });
});

test('4.4 E2E Users: Perubahan status akun oleh Super Admin', async () => {
  const saHeaders = await authHeaders('superadmin');

  // Buat user uji
  const pw = await hashPassword('Password123!');
  const testUser = await prisma.user.upsert({
    where: { username: 'fase6_status_test' },
    update: { password_hash: pw, status: 'ACTIVE' },
    create: {
      username: 'fase6_status_test',
      email: 'fase6status@kampus.ac.id',
      password_hash: pw,
      status: 'ACTIVE',
    },
  });

  // Suspend user
  const resSuspend = await fetch(`${baseUrl}/api/v1/users/${testUser.id}/status`, {
    method: 'PATCH',
    headers: saHeaders,
    body: JSON.stringify({ status: 'SUSPENDED', reason: 'Pelanggaran akademik (uji Fase 6)' }),
  });
  assert.equal(resSuspend.status, 200);

  // Verifikasi user tidak bisa login
  const suspendedLogin = await login('fase6_status_test');
  assert.equal(suspendedLogin.status, 403, 'User suspended harus ditolak login');

  // Reaktivasi
  const resActivate = await fetch(`${baseUrl}/api/v1/users/${testUser.id}/status`, {
    method: 'PATCH',
    headers: saHeaders,
    body: JSON.stringify({ status: 'ACTIVE' }),
  });
  assert.equal(resActivate.status, 200);

  // Verifikasi bisa login lagi
  const reactivatedLogin = await login('fase6_status_test');
  assert.equal(reactivatedLogin.status, 200, 'User yang direaktivasi harus bisa login');

  // Cleanup
  await prisma.refreshToken.deleteMany({ where: { user_id: testUser.id } });
  await prisma.user.delete({ where: { id: testUser.id } });
});

test('4.5 E2E Users: Non-Super Admin ditolak kelola role & status', async () => {
  const admAkademikHeaders = await authHeaders('admin_akademik');

  const fakeUserId = '550e8400-e29b-41d4-a716-446655440000';

  // Admin Akademik tidak boleh update role
  const resRole = await fetch(`${baseUrl}/api/v1/users/${fakeUserId}/roles`, {
    method: 'PUT',
    headers: admAkademikHeaders,
    body: JSON.stringify({ roles: ['SUPER_ADMIN'] }),
  });
  assert.equal(resRole.status, 403);

  // Admin Akademik tidak boleh update status
  const resStatus = await fetch(`${baseUrl}/api/v1/users/${fakeUserId}/status`, {
    method: 'PATCH',
    headers: admAkademikHeaders,
    body: JSON.stringify({ status: 'SUSPENDED' }),
  });
  assert.equal(resStatus.status, 403);
});

// ============================================================
// BAGIAN 5: KESESUAIAN ENDPOINT KONSEPTUAL SRS BAB 32
// ============================================================

test('5.1 E2E SRS Bab 32: Endpoint alias /api/login → /api/v1/auth/login', async () => {
  const res = await fetch(`${baseUrl}/api/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifier: 'superadmin', password: 'Password123!' }),
  });
  const data = await res.json();
  assert.equal(res.status, 200);
  assert.ok(data.data.accessToken, 'Alias /api/login harus mengembalikan accessToken');
  assert.ok(data.data.user.roles.includes('SUPER_ADMIN'));
});

test('5.2 E2E SRS Bab 32: Endpoint alias /api/profile → /api/v1/profile', async () => {
  const headers = await authHeaders('2024001001');

  const res = await fetch(`${baseUrl}/api/profile`, { headers });
  const data = await res.json();
  assert.equal(res.status, 200);
  assert.equal(data.data.username, '2024001001');
  assert.equal(data.data.profile.type, 'MAHASISWA');
});

test('5.3 E2E SRS Bab 32: Endpoint alias /api/logout → /api/v1/auth/logout', async () => {
  const { token, refreshToken } = await login('admin_lms');

  const res = await fetch(`${baseUrl}/api/logout`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ refreshToken }),
  });
  assert.equal(res.status, 200);
});

test('5.4 E2E SRS Bab 32: Endpoint alias /api/calendar → /api/v1/calendar', async () => {
  const headers = await authHeaders('2024001001');

  const res = await fetch(`${baseUrl}/api/calendar`, { headers });
  const data = await res.json();
  assert.equal(res.status, 200);
  assert.ok(Array.isArray(data.data), 'Alias /api/calendar harus mengembalikan array');
});

test('5.5 E2E SRS Bab 32: Endpoint alias /api/dashboard → /api/v1/portal/dashboard', async () => {
  const headers = await authHeaders('superadmin');

  const res = await fetch(`${baseUrl}/api/dashboard`, { headers });
  const data = await res.json();
  assert.equal(res.status, 200);
  assert.ok(data.data.system_context, 'Alias /api/dashboard harus memiliki system_context');
  assert.ok(data.data.role_dashboards, 'Alias /api/dashboard harus memiliki role_dashboards');
});

test('5.6 E2E SRS Bab 32: Endpoint alias /api/portal/modules → /api/v1/portal/modules', async () => {
  const headers = await authHeaders('superadmin');

  const res = await fetch(`${baseUrl}/api/portal/modules`, { headers });
  const data = await res.json();
  assert.equal(res.status, 200);
  assert.ok(data.data.accessible_modules, 'Alias /api/portal/modules harus mengembalikan modul');
});

// ============================================================
// BAGIAN 6: INTEGRITAS DASBOR PORTAL & KONSISTENSI DATA ANTAR MODUL
// ============================================================

test('6.1 E2E Portal: Konsistensi data profil mahasiswa antara /profile dan /portal/dashboard', async () => {
  const headers = await authHeaders('2024001001');

  // Ambil dari profil
  const profileRes = await fetch(`${baseUrl}/api/v1/profile`, { headers });
  const profileData = await profileRes.json();

  // Ambil dari dashboard
  const dashboardRes = await fetch(`${baseUrl}/api/v1/portal/dashboard`, { headers });
  const dashboardData = await dashboardRes.json();

  const mhsDashboard = dashboardData.data.role_dashboards.mahasiswa;

  // NIM harus konsisten
  assert.equal(profileData.data.profile.nim, mhsDashboard.biodata.nim, 'NIM harus konsisten antara profil dan dashboard');

  // Status akademik harus konsisten
  assert.equal(profileData.data.profile.status_akademik, mhsDashboard.biodata.status_akademik,
    'Status akademik harus konsisten');
});

test('6.2 E2E Portal: Konsistensi data dosen antara /profile dan /portal/dashboard', async () => {
  const headers = await authHeaders('198501152010121002');

  const profileRes = await fetch(`${baseUrl}/api/v1/profile`, { headers });
  const profileData = await profileRes.json();

  const dashboardRes = await fetch(`${baseUrl}/api/v1/portal/dashboard`, { headers });
  const dashboardData = await dashboardRes.json();

  const dosenDashboard = dashboardData.data.role_dashboards.dosen;

  // NIDN harus konsisten
  assert.equal(profileData.data.profile.nidn, dosenDashboard.biodata.nidn,
    'NIDN harus konsisten antara profil dan dashboard');
});

test('6.3 E2E Portal: Jumlah modul portal sesuai peran', async () => {
  const testCases = [
    { identifier: 'superadmin', minModules: 5, requiredCodes: ['PORTAL', 'SIA', 'SPADA', 'PMB', 'ADMIN_PORTAL'] },
    { identifier: '2024001001', minModules: 3, requiredCodes: ['PORTAL', 'SIA', 'SPADA'] },
    { identifier: '198501152010121002', minModules: 3, requiredCodes: ['PORTAL', 'SIA', 'SPADA'] },
    { identifier: 'PMB20260001', minModules: 2, requiredCodes: ['PORTAL', 'PMB'] },
  ];

  for (const tc of testCases) {
    const headers = await authHeaders(tc.identifier);
    const res = await fetch(`${baseUrl}/api/v1/portal/modules`, { headers });
    const data = await res.json();

    assert.equal(res.status, 200);
    assert.ok(data.data.accessible_count >= tc.minModules,
      `${tc.identifier} harus memiliki >= ${tc.minModules} modul (aktual: ${data.data.accessible_count})`);

    const codes = data.data.accessible_modules.map((m) => m.code);
    for (const code of tc.requiredCodes) {
      assert.ok(codes.includes(code), `${tc.identifier} harus punya modul ${code}`);
    }
  }
});

test('6.4 E2E Portal: Dashboard Admin Akademik menampilkan metrik yang akurat', async () => {
  const headers = await authHeaders('admin_akademik');

  const dashRes = await fetch(`${baseUrl}/api/v1/portal/dashboard`, { headers });
  const dashData = await dashRes.json();
  const admin = dashData.data.role_dashboards.admin_akademik;

  // Cross-check metrik dengan query database langsung
  const dbMhsCount = await prisma.mahasiswa.count({ where: { status_akademik: 'AKTIF' } });
  const dbDosenCount = await prisma.dosen.count({ where: { is_active: true } });
  const dbProdiCount = await prisma.programStudi.count({ where: { is_active: true } });
  const dbFakultasCount = await prisma.fakultas.count({ where: { is_active: true } });

  assert.equal(admin.metrik.total_mahasiswa_aktif || admin.metrik.total_mahasiswa, dbMhsCount,
    'Metrik mahasiswa harus cocok dengan database');
  assert.equal(admin.metrik.total_dosen_aktif || admin.metrik.total_dosen, dbDosenCount,
    'Metrik dosen harus cocok dengan database');
  assert.equal(admin.metrik.total_program_studi, dbProdiCount,
    'Metrik prodi harus cocok dengan database');
  assert.equal(admin.metrik.total_fakultas, dbFakultasCount,
    'Metrik fakultas harus cocok dengan database');
});

// ============================================================
// BAGIAN 7: AUDIT TRAIL TERVERIFIKASI
// ============================================================

test('7.1 E2E Audit: Aksi autentikasi terekam lengkap di audit_logs', async () => {
  const auditLogs = await prisma.auditLog.findMany({
    where: {
      action: { in: ['LOGIN', 'LOGOUT', 'CHANGE_PASSWORD', 'FORGOT_PASSWORD_REQUEST'] },
    },
    orderBy: { waktu: 'desc' },
    take: 20,
  });

  const actions = [...new Set(auditLogs.map((l) => l.action))];
  assert.ok(actions.includes('LOGIN'), 'Aksi LOGIN harus terekam');

  // Verifikasi setiap log memiliki struktur lengkap
  for (const log of auditLogs) {
    assert.ok(log.action, 'Audit log harus punya action');
    assert.ok(log.entity, 'Audit log harus punya entity');
    assert.ok(log.waktu, 'Audit log harus punya timestamp');
  }
});

test('7.2 E2E Audit: Mutasi master data terekam di audit_logs', async () => {
  const masterAuditActions = [
    'CREATE_FAKULTAS', 'UPDATE_FAKULTAS',
    'CREATE_PRODI',
    'CREATE_TAHUN_AKADEMIK',
    'CREATE_SEMESTER', 'ACTIVATE_SEMESTER',
    'CREATE_KURIKULUM',
    'CREATE_MATA_KULIAH',
    'CREATE_GEDUNG',
    'CREATE_RUANGAN',
    'CREATE_KELAS',
    'CREATE_CALENDAR', 'UPDATE_CALENDAR', 'DELETE_CALENDAR',
  ];

  const audits = await prisma.auditLog.findMany({
    where: { action: { in: masterAuditActions } },
  });

  assert.ok(audits.length >= 5, 'Harus ada minimal 5 audit log untuk mutasi master data');
});

test('7.3 E2E Audit: Endpoint GET /api/v1/audit-logs tersedia untuk admin', async () => {
  const saHeaders = await authHeaders('superadmin');

  // List audit logs
  const res = await fetch(`${baseUrl}/api/v1/audit-logs?page=1&limit=10`, { headers: saHeaders });
  const data = await res.json();
  assert.equal(res.status, 200);
  assert.equal(data.success, true);
  assert.ok(Array.isArray(data.data));
  assert.ok(data.meta.total >= 1);
  assert.equal(data.meta.page, 1);

  // Detail audit log
  if (data.data.length > 0) {
    const logId = data.data[0].id;
    const detailRes = await fetch(`${baseUrl}/api/v1/audit-logs/${logId}`, { headers: saHeaders });
    const detailData = await detailRes.json();
    assert.equal(detailRes.status, 200);
    assert.equal(detailData.data.id, logId);
  }
});

test('7.4 E2E Audit: Filter audit logs berdasarkan action dan entity', async () => {
  const saHeaders = await authHeaders('superadmin');

  // Filter by action
  const resAction = await fetch(`${baseUrl}/api/v1/audit-logs?action=LOGIN`, { headers: saHeaders });
  const dataAction = await resAction.json();
  assert.equal(resAction.status, 200);
  if (dataAction.data.length > 0) {
    for (const log of dataAction.data) {
      assert.equal(log.action, 'LOGIN', 'Filter action=LOGIN harus benar');
    }
  }

  // Filter by entity
  const resEntity = await fetch(`${baseUrl}/api/v1/audit-logs?entity=users`, { headers: saHeaders });
  const dataEntity = await resEntity.json();
  assert.equal(resEntity.status, 200);
});

// ============================================================
// BAGIAN 8: STANDARISASI RESPONS JSON
// ============================================================

test('8.1 E2E Response: Semua endpoint mengembalikan format standar { success, data, message, meta }', async () => {
  const saHeaders = await authHeaders('superadmin');

  const listEndpoints = [
    '/api/v1/master/fakultas',
    '/api/v1/master/prodi',
    '/api/v1/master/tahun-akademik',
    '/api/v1/master/semester',
    '/api/v1/master/kurikulum',
    '/api/v1/master/mata-kuliah',
    '/api/v1/master/gedung',
    '/api/v1/master/ruangan',
    '/api/v1/master/kelas',
    '/api/v1/calendar',
    '/api/v1/users',
    '/api/v1/audit-logs',
  ];

  for (const ep of listEndpoints) {
    const res = await fetch(`${baseUrl}${ep}?page=1&limit=5`, { headers: saHeaders });
    const data = await res.json();

    assert.equal(res.status, 200, `${ep} harus 200`);
    assert.equal(typeof data.success, 'boolean', `${ep}: success harus boolean`);
    assert.ok('data' in data, `${ep}: harus ada field data`);
    assert.ok('message' in data, `${ep}: harus ada field message`);
    assert.ok('meta' in data, `${ep}: harus ada field meta`);
    assert.equal(typeof data.meta.page, 'number', `${ep}: meta.page harus number`);
    assert.equal(typeof data.meta.limit, 'number', `${ep}: meta.limit harus number`);
    assert.equal(typeof data.meta.total, 'number', `${ep}: meta.total harus number`);
    assert.equal(typeof data.meta.totalPages, 'number', `${ep}: meta.totalPages harus number`);
  }
});

test('8.2 E2E Response: Respons error memiliki format standar { success: false, message }', async () => {
  // 401 tanpa token
  const res401 = await fetch(`${baseUrl}/api/v1/profile`);
  const data401 = await res401.json();
  assert.equal(data401.success, false);
  assert.ok(data401.message, 'Error response harus memiliki message');

  // 404 route tidak ditemukan
  const res404 = await fetch(`${baseUrl}/api/v1/nonexistent`);
  const data404 = await res404.json();
  assert.equal(data404.success, false);
  assert.ok(data404.message.includes('tidak ditemukan'));

  // 403 forbidden
  const mhsHeaders = await authHeaders('2024001001');
  const res403 = await fetch(`${baseUrl}/api/v1/users`, { headers: mhsHeaders });
  const data403 = await res403.json();
  assert.equal(data403.success, false);
  assert.ok(data403.message);
});

// ============================================================
// BAGIAN 9: MASTER DATA INTEGRASI (Kalender, Mata Kuliah, Kelas)
// ============================================================

test('9.1 E2E Master: Kalender akademik semester aktif tersedia untuk semua role terautentikasi', async () => {
  const identifiers = ['superadmin', 'admin_akademik', 'admin_lms', '198501152010121002', '2024001001'];

  for (const id of identifiers) {
    const headers = await authHeaders(id);
    const res = await fetch(`${baseUrl}/api/v1/calendar`, { headers });
    const data = await res.json();
    assert.equal(res.status, 200, `${id} harus bisa melihat kalender (200)`);
    assert.equal(data.success, true);
    assert.ok(Array.isArray(data.data), 'Data kalender harus berupa array');
  }
});

test('9.2 E2E Master: Mata kuliah dan kelas seeder tersedia', async () => {
  const saHeaders = await authHeaders('superadmin');

  // List mata kuliah
  const resMk = await fetch(`${baseUrl}/api/v1/master/mata-kuliah`, { headers: saHeaders });
  const dataMk = await resMk.json();
  assert.equal(resMk.status, 200);
  assert.ok(dataMk.data.length >= 4, 'Minimal 4 mata kuliah dari seeder');

  // List kelas
  const resKelas = await fetch(`${baseUrl}/api/v1/master/kelas`, { headers: saHeaders });
  const dataKelas = await resKelas.json();
  assert.equal(resKelas.status, 200);
  assert.ok(dataKelas.data.length >= 2, 'Minimal 2 kelas dari seeder');
});

test('9.3 E2E Master: Fasilitas gedung dan ruangan seeder tersedia', async () => {
  const saHeaders = await authHeaders('superadmin');

  const resGedung = await fetch(`${baseUrl}/api/v1/master/gedung`, { headers: saHeaders });
  const dataGedung = await resGedung.json();
  assert.equal(resGedung.status, 200);
  assert.ok(dataGedung.data.length >= 2, 'Minimal 2 gedung dari seeder');

  const resRuangan = await fetch(`${baseUrl}/api/v1/master/ruangan`, { headers: saHeaders });
  const dataRuangan = await resRuangan.json();
  assert.equal(resRuangan.status, 200);
  assert.ok(dataRuangan.data.length >= 2, 'Minimal 2 ruangan dari seeder');
});

// ============================================================
// BAGIAN 10: HEALTH CHECK & API ROOT
// ============================================================

test('10.1 E2E Health: Health check endpoint operasional', async () => {
  const res = await fetch(`${baseUrl}/health`);
  const data = await res.json();
  assert.equal(res.status, 200);
  assert.equal(data.success, true);
  assert.ok(data.data.timestamp, 'Harus mengembalikan timestamp');
});

test('10.2 E2E API Root: Root API v1 menampilkan katalog endpoint', async () => {
  const res = await fetch(`${baseUrl}/api/v1`);
  const data = await res.json();
  assert.equal(res.status, 200);
  assert.equal(data.success, true);
  assert.ok(data.data.endpoints.auth);
  assert.ok(data.data.endpoints.profile);
  assert.ok(data.data.endpoints.portal);
  assert.ok(data.data.endpoints.auditLogs);
  assert.ok(data.data.endpoints.users);
  assert.ok(data.data.endpoints.calendar);
  assert.ok(data.data.endpoints.master);
});
