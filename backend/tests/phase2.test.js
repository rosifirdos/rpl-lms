import test from 'node:test';
import assert from 'node:assert/strict';
import app from '../src/app.js';
import prisma from '../src/config/prisma.js';
import { hashPassword } from '../src/utils/password.js';
import { requireRole, requirePermission, requireAnyPermission } from '../src/middlewares/rbac.middleware.js';

let server;
let baseUrl;

test.before(async () => {
  await new Promise((resolve) => {
    server = app.listen(0, () => {
      const port = server.address().port;
      baseUrl = `http://localhost:${port}`;
      console.log(`\n🚀 Test server listening on ${baseUrl}\n`);
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

test('1. Auth: Berhasil login dengan multi-kredensial untuk role yang berbeda', async () => {
  // Test Super Admin
  const resAdmin = await fetch(`${baseUrl}/api/v1/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      identifier: 'superadmin',
      password: 'Password123!',
    }),
  });
  const dataAdmin = await resAdmin.json();

  assert.equal(resAdmin.status, 200);
  assert.equal(dataAdmin.success, true);
  assert.ok(dataAdmin.data.accessToken);
  assert.ok(dataAdmin.data.refreshToken);
  assert.equal(dataAdmin.data.user.username, 'superadmin');
  assert.ok(dataAdmin.data.user.roles.includes('SUPER_ADMIN'));
  assert.ok(dataAdmin.data.user.profile);
  assert.equal(dataAdmin.data.user.profile.type, 'ADMIN');

  // Test Mahasiswa (menggunakan NIM sebagai identifier)
  const resMhs = await fetch(`${baseUrl}/api/v1/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      identifier: '2024001001',
      password: 'Password123!',
    }),
  });
  const dataMhs = await resMhs.json();

  assert.equal(resMhs.status, 200);
  assert.equal(dataMhs.success, true);
  assert.ok(dataMhs.data.accessToken);
  assert.ok(dataMhs.data.user.roles.includes('MAHASISWA'));
  assert.equal(dataMhs.data.user.profile.type, 'MAHASISWA');
  assert.equal(dataMhs.data.user.profile.nim, '2024001001');

  // Test Dosen Wali (menggunakan NIP / Username)
  const resDosen = await fetch(`${baseUrl}/api/v1/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      identifier: '198501152010121002',
      password: 'Password123!',
    }),
  });
  const dataDosen = await resDosen.json();

  assert.equal(resDosen.status, 200);
  assert.ok(dataDosen.data.user.roles.includes('DOSEN'));
  assert.ok(dataDosen.data.user.roles.includes('DOSEN_WALI'));
});

test('2. Auth: Gagal login jika password salah', async () => {
  const res = await fetch(`${baseUrl}/api/v1/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      identifier: 'superadmin',
      password: 'WrongPassword!',
    }),
  });
  const data = await res.json();

  assert.equal(res.status, 401);
  assert.equal(data.success, false);
  assert.match(data.message, /kredensial tidak valid/i);
});

test('3. Auth: Penolakan akun dengan status tidak aktif (SRS UC-01 & BR)', async () => {
  const dummyPassword = await hashPassword('Password123!');
  const inactiveUser = await prisma.user.upsert({
    where: { username: 'user_nonaktif' },
    update: { status: 'INACTIVE', password_hash: dummyPassword },
    create: {
      username: 'user_nonaktif',
      email: 'nonaktif@kampus.ac.id',
      password_hash: dummyPassword,
      status: 'INACTIVE',
    },
  });

  const res = await fetch(`${baseUrl}/api/v1/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      identifier: 'user_nonaktif',
      password: 'Password123!',
    }),
  });
  const data = await res.json();

  assert.equal(res.status, 403);
  assert.equal(data.success, false);
  assert.match(data.message, /tidak aktif/i);

  // Bersihkan akun dummy
  await prisma.user.delete({ where: { id: inactiveUser.id } });
});

test('4. Auth: Refresh Token berhasil menerbitkan Access Token baru', async () => {
  const loginRes = await fetch(`${baseUrl}/api/v1/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      identifier: 'superadmin',
      password: 'Password123!',
    }),
  });
  const loginData = await loginRes.json();
  const refreshToken = loginData.data.refreshToken;

  const refreshRes = await fetch(`${baseUrl}/api/v1/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  });
  const refreshData = await refreshRes.json();

  assert.equal(refreshRes.status, 200);
  assert.equal(refreshData.success, true);
  assert.ok(refreshData.data.accessToken);

  // Akses dengan refresh token palsu
  const fakeRes = await fetch(`${baseUrl}/api/v1/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken: 'fake-refresh-token' }),
  });
  assert.equal(fakeRes.status, 401);
});

test('5. Auth: Logout berhasil mencabut refresh token', async () => {
  const loginRes = await fetch(`${baseUrl}/api/v1/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      identifier: 'admin_akademik',
      password: 'Password123!',
    }),
  });
  const loginData = await loginRes.json();
  const { accessToken, refreshToken } = loginData.data;

  const logoutRes = await fetch(`${baseUrl}/api/v1/auth/logout`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ refreshToken }),
  });
  const logoutData = await logoutRes.json();

  assert.equal(logoutRes.status, 200);
  assert.equal(logoutData.success, true);

  // Mencoba refresh setelah token dicabut -> harus gagal 401
  const reRefreshRes = await fetch(`${baseUrl}/api/v1/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  });
  assert.equal(reRefreshRes.status, 401);
});

test('6. Profile: Hak baca mandiri (GET /api/v1/profile) untuk semua role', async () => {
  const loginRes = await fetch(`${baseUrl}/api/v1/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      identifier: '2024001001',
      password: 'Password123!',
    }),
  });
  const { accessToken } = (await loginRes.json()).data;

  const profileRes = await fetch(`${baseUrl}/api/v1/profile`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const profileData = await profileRes.json();

  assert.equal(profileRes.status, 200);
  assert.equal(profileData.success, true);
  assert.equal(profileData.data.username, '2024001001');
  assert.ok(profileData.data.roles.includes('MAHASISWA'));
  assert.ok(profileData.data.permissions.includes('profile:read'));
  assert.equal(profileData.data.profile.type, 'MAHASISWA');
  assert.ok(profileData.data.profile.prodi);
});

test('7. Profile: Hak tulis mandiri (PUT /api/v1/profile)', async () => {
  const loginRes = await fetch(`${baseUrl}/api/v1/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      identifier: '2024001001',
      password: 'Password123!',
    }),
  });
  const { accessToken } = (await loginRes.json()).data;

  const updateRes = await fetch(`${baseUrl}/api/v1/profile`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      nama: 'Ahmad Fauzi Updated',
    }),
  });
  const updateData = await updateRes.json();

  assert.equal(updateRes.status, 200);
  assert.equal(updateData.success, true);
  assert.equal(updateData.data.profile.nama, 'Ahmad Fauzi Updated');

  // Kembalikan ke nama awal
  await fetch(`${baseUrl}/api/v1/profile`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      nama: 'Ahmad Fauzi',
    }),
  });
});

test('8. Security & Auth: Penolakan endpoint terproteksi tanpa token atau token rusak', async () => {
  const noTokenRes = await fetch(`${baseUrl}/api/v1/profile`);
  assert.equal(noTokenRes.status, 401);

  const badTokenRes = await fetch(`${baseUrl}/api/v1/profile`, {
    headers: { Authorization: 'Bearer invalid.token.payload' },
  });
  assert.equal(badTokenRes.status, 401);
});

test('9. RBAC Middleware: Proteksi requireRole, requirePermission & requireAnyPermission', () => {
  const mhsUser = {
    id: 'u-mhs',
    roles: ['MAHASISWA'],
    permissions: ['profile:read', 'profile:update', 'portal:view', 'calendar:view'],
  };
  const admUser = {
    id: 'u-adm',
    roles: ['ADMIN_AKADEMIK'],
    permissions: ['master:academic:write', 'calendar:manage', 'audit:view'],
  };
  const saUser = {
    id: 'u-sa',
    roles: ['SUPER_ADMIN'],
    permissions: ['user:manage', 'role:manage'],
  };

  // 1. requireRole('ADMIN_AKADEMIK')
  const adminGuard = requireRole('ADMIN_AKADEMIK');

  let resMhsData = null;
  const resMhsMock = {
    status(code) { this.statusCode = code; return this; },
    json(data) { resMhsData = data; return this; },
  };
  let nextCalledMhs = false;
  adminGuard({ user: mhsUser }, resMhsMock, () => { nextCalledMhs = true; });

  assert.equal(nextCalledMhs, false);
  assert.equal(resMhsMock.statusCode, 403);
  assert.equal(resMhsData.success, false);

  // Admin Akademik diizinkan
  let nextCalledAdm = false;
  adminGuard({ user: admUser }, {}, () => { nextCalledAdm = true; });
  assert.equal(nextCalledAdm, true);

  // Super Admin bypass
  let nextCalledSa = false;
  adminGuard({ user: saUser }, {}, () => { nextCalledSa = true; });
  assert.equal(nextCalledSa, true);

  // 2. requirePermission('user:manage')
  const permGuard = requirePermission('user:manage');

  let resPermMhsData = null;
  const resPermMhsMock = {
    status(code) { this.statusCode = code; return this; },
    json(data) { resPermMhsData = data; return this; },
  };
  let nextCalledPermMhs = false;
  permGuard({ user: mhsUser }, resPermMhsMock, () => { nextCalledPermMhs = true; });

  assert.equal(nextCalledPermMhs, false);
  assert.equal(resPermMhsMock.statusCode, 403);
  assert.equal(resPermMhsData.success, false);

  // Super Admin bypass permission
  let nextCalledPermSa = false;
  permGuard({ user: saUser }, {}, () => { nextCalledPermSa = true; });
  assert.equal(nextCalledPermSa, true);

  // 3. requireAnyPermission
  const anyPermGuard = requireAnyPermission('calendar:view', 'master:academic:write');
  let nextAnyMhs = false;
  anyPermGuard({ user: mhsUser }, {}, () => { nextAnyMhs = true; });
  assert.equal(nextAnyMhs, true);
});

test('10. Auth: Perubahan kata sandi mandiri (PUT /api/v1/auth/change-password)', async () => {
  const testPassword = await hashPassword('OldPassword123!');
  const testUser = await prisma.user.upsert({
    where: { username: 'test_pwd_user' },
    update: { password_hash: testPassword, status: 'ACTIVE' },
    create: {
      username: 'test_pwd_user',
      email: 'test_pwd@kampus.ac.id',
      password_hash: testPassword,
      status: 'ACTIVE',
    },
  });

  const loginRes = await fetch(`${baseUrl}/api/v1/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      identifier: 'test_pwd_user',
      password: 'OldPassword123!',
    }),
  });
  const { accessToken } = (await loginRes.json()).data;

  // Gagal jika oldPassword salah
  const failRes = await fetch(`${baseUrl}/api/v1/auth/change-password`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      oldPassword: 'WrongPassword!',
      newPassword: 'NewPassword123!',
      confirmPassword: 'NewPassword123!',
    }),
  });
  assert.equal(failRes.status, 400);

  // Berhasil jika valid
  const successRes = await fetch(`${baseUrl}/api/v1/auth/change-password`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      oldPassword: 'OldPassword123!',
      newPassword: 'NewPassword123!',
      confirmPassword: 'NewPassword123!',
    }),
  });
  const successData = await successRes.json();
  assert.equal(successRes.status, 200);
  assert.equal(successData.success, true);

  // Verifikasi login dengan password baru
  const newLoginRes = await fetch(`${baseUrl}/api/v1/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      identifier: 'test_pwd_user',
      password: 'NewPassword123!',
    }),
  });
  assert.equal(newLoginRes.status, 200);

  await prisma.user.delete({ where: { id: testUser.id } });
});

test('11. Auth: Permintaan lupa kata sandi (POST /api/v1/auth/forgot-password)', async () => {
  const res = await fetch(`${baseUrl}/api/v1/auth/forgot-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      identifier: 'superadmin',
    }),
  });
  const data = await res.json();

  assert.equal(res.status, 200);
  assert.equal(data.success, true);
  assert.ok(data.message);
});

test('12. SRS Bab 32: Validasi kesesuaian Endpoint Konseptual (/api/login, /api/profile, /api/logout)', async () => {
  // POST /api/login
  const resLogin = await fetch(`${baseUrl}/api/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      identifier: 'superadmin',
      password: 'Password123!',
    }),
  });
  const dataLogin = await resLogin.json();
  assert.equal(resLogin.status, 200);
  assert.ok(dataLogin.data.accessToken);

  const token = dataLogin.data.accessToken;

  // GET /api/profile
  const resProfile = await fetch(`${baseUrl}/api/profile`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const dataProfile = await resProfile.json();
  assert.equal(resProfile.status, 200);
  assert.equal(dataProfile.data.username, 'superadmin');

  // POST /api/logout
  const resLogout = await fetch(`${baseUrl}/api/logout`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      refreshToken: dataLogin.data.refreshToken,
    }),
  });
  assert.equal(resLogout.status, 200);
});

test('13. Audit Trail: Aktivitas autentikasi & mutasi profil tercatat di database', async () => {
  const auditLogs = await prisma.auditLog.findMany({
    where: {
      action: { in: ['LOGIN', 'UPDATE_PROFILE', 'CHANGE_PASSWORD', 'LOGOUT', 'FORGOT_PASSWORD_REQUEST'] },
    },
    orderBy: { waktu: 'desc' },
  });

  assert.ok(auditLogs.length > 0);
  const actions = auditLogs.map((log) => log.action);
  assert.ok(actions.includes('LOGIN'));
  assert.ok(actions.includes('UPDATE_PROFILE'));
});
