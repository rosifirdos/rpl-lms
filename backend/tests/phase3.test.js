import test from 'node:test';
import assert from 'node:assert/strict';
import app from '../src/app.js';
import { AuditLogService } from '../src/modules/audit-log/audit-log.service.js';
import { extractClientInfo, auditInterceptor } from '../src/middlewares/audit.middleware.js';
import { generalLimiter, authLimiter } from '../src/middlewares/rateLimit.middleware.js';
import { auditLogQuerySchema } from '../src/modules/audit-log/audit-log.validation.js';
import { updateUserRolesSchema, updateUserStatusSchema, userListQuerySchema } from '../src/modules/users/users.validation.js';
import { requireRole, requirePermission, requireAnyPermission } from '../src/middlewares/rbac.middleware.js';
import { PERMISSIONS } from '../src/constants/permissions.js';
import { ROLES } from '../src/constants/roles.js';
import prisma from '../src/config/prisma.js';

let server;
let baseUrl;

test.before(async () => {
  await new Promise((resolve) => {
    server = app.listen(0, () => {
      const port = server.address().port;
      baseUrl = 'http://localhost:' + port;
      console.log('Test server Fase 3 listening on ' + baseUrl);
      resolve();
    });
  });
});

test.after(async () => {
  if (server) {
    await new Promise((resolve) => server.close(resolve));
  }
  try { await prisma.$disconnect(); } catch (e) {}
});
test('1. Security Headers: Helmet & CORS dikonfigurasi dengan benar', async () => {
  const res = await fetch(baseUrl + '/health');
  assert.equal(res.status, 200);
  assert.ok(res.headers.get('x-dns-prefetch-control'));
  assert.ok(res.headers.get('x-content-type-options'));
  assert.ok(res.headers.get('cross-origin-resource-policy'));
});

test('2. API v1 Catalog: Mengekpos endpoint auditLogs dan users', async () => {
  const res = await fetch(baseUrl + '/api/v1');
  const body = await res.json();
  assert.equal(res.status, 200);
  assert.equal(body.success, true);
  assert.equal(body.data.endpoints.auditLogs, '/api/v1/audit-logs');
  assert.equal(body.data.endpoints.users, '/api/v1/users');
});

test('3. Audit Middleware: extractClientInfo mengekstrak IP & user-agent', () => {
  const mockReqForwarded = {
    headers: {
      'x-forwarded-for': '103.25.10.1, 192.168.1.1',
      'user-agent': 'Mozilla/5.0 Chrome/120',
    },
  };
  const info1 = extractClientInfo(mockReqForwarded);
  assert.equal(info1.ipAddress, '103.25.10.1');
  assert.equal(info1.userAgent, 'Mozilla/5.0 Chrome/120');

  const mockReqDirect = {
    headers: {},
    ip: '127.0.0.1',
  };
  const info2 = extractClientInfo(mockReqDirect);
  assert.equal(info2.ipAddress, '127.0.0.1');
  assert.equal(info2.userAgent, null);
});

test('4. Audit Middleware: auditInterceptor mencatat mutasi saat respons berhasil', () => {
  let recordedPayload = null;
  const originalRecord = AuditLogService.record;
  AuditLogService.record = (payload) => { recordedPayload = payload; return Promise.resolve(null); };

  const interceptor = auditInterceptor({
    action: 'TEST_MUTETION',
    entity: 'kurikulum',
    getEntityId: () => 'k-001',
    getOldValues: () => ({ name: 'Lama' }),
    getNewValues: () => ({ name: 'Baru' }),
  });

  const req = {
    headers: { 'user-agent': 'AgentX' },
    ip: '10.0.0.1',
    user: { id: 'u-admin-1' },
  };
  const res = {
    statusCode: 200,
    json() { return this; },
  };

  interceptor(req, res, () => {});
  res.json({ success: true, message: 'Updated' });

  assert.ok(recordedPayload);
  assert.equal(recordedPayload.action, 'TEST_MUTETION');
  assert.equal(recordedPayload.entity, 'kurikulum');
  assert.equal(recordedPayload.entityId, 'k-001');
  assert.equal(recordedPayload.userId, 'u-admin-1');
  assert.deepEqual(recordedPayload.oldValues, { name: 'Lama' });
  assert.deepEqual(recordedPayload.newValues, { name: 'Baru' });

  AuditLogService.record = originalRecord;
});
test('5. Audit Validation: Skema validasi query audit log', async () => {
  const validQuery = { page: '2', limit: '50', action: 'LOGIN', sortBy: 'waktu', sortOrder: 'asc' };
  const parsed = await auditLogQuerySchema.query.parseAsync(validQuery);
  assert.equal(parsed.page, 2);
  assert.equal(parsed.limit, 50);
  assert.equal(parsed.action, 'LOGIN');
  assert.equal(parsed.sortBy, 'waktu');
  assert.equal(parsed.sortOrder, 'asc');

  await assert.rejects(async () => {
    await auditLogQuerySchema.query.parseAsync({ page: '0' });
  });
  await assert.rejects(async () => {
    await auditLogQuerySchema.query.parseAsync( { limit: '101' });
  });
  await assert.rejects(async () => {
    await auditLogQuerySchema.query.parseAsync({ sortBy: 'invalidField' });
  });
});

test('6. Users Validation: Skema validasi perubahan role & status', async () => {
  const validRoles = { roles: ['SUPER_ADMIN', 'DOSEN'] };
  const parsedRoles = await updateUserRolesSchema.body.parseAsync(validRoles);
  assert.deepEqual(parsedRoles.roles, ['SUPER_ADMIN', 'DOSEN']);

  await assert.rejects(async () => {
    await updateUserRolesSchema.body.parseAsync({ roles: [] });
  });
  await assert.rejects(async () => {
    await updateUserRolesSchema.body.parseAsync( { roles: ['HACKER_ROLE'] });
  });

  const validStatus = { status: 'SUSPENDED', reason: 'Pelanggaran etik' };
  const parsedStatus = await updateUserStatusSchema.body.parseAsync(validStatus);
  assert.equal(parsedStatus.status, 'SUSPENDED');
  assert.equal(parsedStatus.reason, 'Pelanggaran etik');

  await assert.rejects(async () => {
    await updateUserStatusSchema.body.parseAsync({ status: 'DELETED' });
  });
});

test('7. Route Protection: GEU /api/v1/audit-logs ditolak tanpa autentikasi (401)', async () => {
  const res = await fetch(baseUrl + '/api/v1/audit-logs');
  const body = await res.json();
  assert.equal(res.status, 401);
  assert.equal(body.success, false);
  assert.match(body.message, /akses ditolak/i);
});

test('8. Route Protection: PUT /api/v1/users/:id/roles ditolak tanpa autentikasi (401)', async () => {
  const res = await fetch(baseUrl + '/api/v1/users/550e8400-e29b-41d4-a716-446655440000/roles', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ roles: ['SUPER_ADMIN'] }),
  });
  assert.equal(res.status, 401);
});

test('9. Route Protection: PATCH /api/v1/users/:id/status ditolak tanpa autentikasi (401)', async () => {
  const res = await fetch(baseUrl + '/api/v1/users/550e8400-e29b-41d4-a716-446655440000/status', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status: 'SUSPENDED' }),
  });
  assert.equal(res.status, 401);
});
test('10. RBAC Protection: Akses audit log ditolak untuk Role MAHASISWA (403)', () => {
  const mhsUser = {
    id: 'u-mhs',
    roles: ['MAHASISWA'],
    permissions: ['profile:read', 'portal:view'],
  };
  const auditGuard = requireAnyPermission(PERMISSIONS.AUDIT_VIEW, PERMISSIONS.ROLE_MANAGE);
  let statusCode = null;
  let jsonBody = null;
  const resMock = {
    status(code) { statusCode = code; return this; },
    json(data) { jsonBody = data; return this; },
  };
  let nextCalled = false;
  auditGuard({ user: mhsUser }, resMock, () => { nextCalled = true; });

  assert.equal(nextCalled, false);
  assert.equal(statusCode, 403);
  assert.equal(jsonBody.success, false);
});

test('11. RBAC Protection: Akses perubahan role ditolak untuk ADMIN_AKADEMIK non-SuperAdmin (403)', () => {
  const admUser = {
    id: 'u-adm',
    roles: ['ADMIN_AKADEMIK'],
    permissions: ['master:academic:write', 'audit:view'],
  };
  const roleGuard = requireRole(ROLES.SUPER_ADMIN);
  let statusCode = null;
  let jsonBody = null;
  const resMock = {
    status(code) { statusCode = code; return this; },
    json(data) { jsonBody = data; return this; },
  };
  let nextCalled = false;
  roleGuard({ user: admUser }, resMock, () => { nextCalled = true; });

  assert.equal(nextCalled, false);
  assert.equal(statusCode, 403);
  assert.equal(jsonBody.success, false);
});

test('12. AuditLogService: Helper logRoleChange & logStatusChange membuat payload mutasi akurat', async () => {
  let recordedAction = null;
  let recordedEntity = null;
  let recordedOld = null;
  let recordedNew = null;
  const origRecord = AuditLogService.record;
  AuditLogService.record = ({ action, entity, oldValues, newValues }) => {
    recordedAction = action;
    recordedEntity = entity;
    recordedOld = oldValues;
    recordedNew = newValues;
    return Promise.resolve({ id: 'dummy-log' });
  };

  await AuditLogService.logRoleChange({
    adminId: 'admin-1',
    targetUserId: 'target-1',
    oldRoles: ['MAHASISWA'],
    newRoles: ['MAHASISWA', 'CALON_MAHASISWA'],
  });
  assert.equal(recordedAction, 'UPDATE_USER_ROLES');
  assert.equal(recordedEntity, 'user_roles');
  assert.deepEqual(recordedOld, { roles: ['MAHASISWA'] });
  assert.deepEqual(recordedNew, { roles: ['MAHASISWA', 'CALON_MAHASISWA'] });

  await AuditLogService.logStatusChange({
    adminId: 'admin-1',
    targetUserId: 'target-1',
    oldStatus: 'ACTIVE',
    newStatus: 'SUSPENDED',
    reason: 'SP3',
  });
  assert.equal(recordedAction, 'UPDATE_USER_STATUS');
  assert.equal(recordedEntity, 'users');
  assert.deepEqual(recordedOld, { status: 'ACTIVE' });
  assert.deepEqual(recordedNew, { status: 'SUSPENDED', reason: 'SP3' });

  AuditLogService.record = origRecord;
});

test('13. Rate Limiter: Middleware rate limiter didefinisikan dengan konfigurasi standar', () => {
  assert.ok(generalLimiter);
  assert.ok(authLimiter);
  assert.equal(typeof generalLimiter, 'function');
  assert.equal(typeof authLimiter, 'function');
});
test('14. AuditLogService: findAll menghitung pagination meta dan filter secara akurat', async () => {
  const origCount = prisma.auditLog.count;
  const origFindMany = prisma.auditLog.findMany;

  let capturedWhere = null;
  prisma.auditLog.count = ({ where }) => { capturedWhere = where; return Promise.resolve(45); };
  prisma.auditLog.findMany = () => {
    return Promise.resolve([      { id: 'log-1', action: 'LOGIN', entity: 'users', waktu: new Date(), user: { id: 'u-1', username: 'superadmin' } },
    ]);
  };

  const result = await AuditLogService.findAll({
    page: 2,
    limit: 10,
    action: 'LOGIN',
    entity: 'users',
    search: 'super',
  });

  assert.equal(result.items.length, 1);
  assert.equal(result.meta.page, 2);
  assert.equal(result.meta.limit, 10);
  assert.equal(result.meta.total, 45);
  assert.equal(result.meta.totalPages, 5);
  assert.equal(result.meta.hasNextPage, true);
  assert.equal(result.meta.hasPrevPage, true);

  prisma.auditLog.count = origCount;
  prisma.auditLog.findMany = origFindMany;
});

test('15. AuditLogService: findById melempar error jika data tidak ditemukan', async () => {
  const origFindUnique = prisma.auditLog.findUnique;
  prisma.auditLog.findUnique = () => Promise.resolve(null);

  await assert.rejects(
    async () => {
      await AuditLogService.findById('non-existent-uuid');
    },
    (err) => {
      assert.equal(err.statusCode, 404);
      assert.match(err.message, /tidak ditemukan/i);
      return true;
    }
  );

  prisma.auditLog.findUnique = origFindUnique;
});
