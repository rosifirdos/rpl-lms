import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import app from '../src/app.js';
import prisma from '../src/config/prisma.js';
import { AuditLogService } from '../src/modules/audit-log/audit-log.service.js';
import { extractClientInfo, auditInterceptor, attachAuditHelper } from '../src/middlewares/audit.middleware.js';
import { generalLimiter, authLimiter, createRateLimiter } from '../src/middlewares/rateLimit.middleware.js';
import { auditLogQuerySchema, auditLogIdParamSchema } from '../src/modules/audit-log/audit-log.validation.js';
import { resetPasswordSchema } from '../src/modules/users/users.validation.js';
import { hashPassword } from '../src/utils/password.js';

describe('Fase 3: Layanan Audit Trail Engine & Keamanan Server', () => {
  let server;
  let baseUrl;
  let adminToken;
  let dosenToken;
  let mahasiswaToken;
  let adminUser;
  let dosenUser;
  let mahasiswaUser;
  let testMutationUser;

  before(async () => {
    // Start ephemeral server
    await new Promise((resolve) => {
      server = app.listen(0, '127.0.0.1', () => {
        const port = server.address().port;
        baseUrl = `http://127.0.0.1:${port}`;
        resolve();
      });
    });

    // Login sebagai Admin untuk memperoleh token
    const resAdmin = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        identifier: 'admin',
        password: 'password123',
      }),
    });
    const dataAdmin = await resAdmin.json();
    adminToken = dataAdmin.data.accessToken;
    adminUser = dataAdmin.data.user;

    // Login sebagai Dosen
    const resDosen = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        identifier: '198501152010121002',
        password: 'password123',
      }),
    });
    const dataDosen = await resDosen.json();
    dosenToken = dataDosen.data.accessToken;
    dosenUser = dataDosen.data.user;

    // Login sebagai Mahasiswa
    const resMhs = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        identifier: '2024001001',
        password: 'password123',
      }),
    });
    const dataMhs = await resMhs.json();
    mahasiswaToken = dataMhs.data.accessToken;
    mahasiswaUser = dataMhs.data.user;

    // Buat dedicated user untuk pengujian mutasi & audit
    const pwdHash = await hashPassword('password123');
    testMutationUser = await prisma.user.upsert({
      where: { username: 'testuser_fase3' },
      update: {
        password_hash: pwdHash,
        status: 'ACTIVE',
        role: 'mahasiswa',
      },
      create: {
        username: 'testuser_fase3',
        email: 'testuser_fase3@upgris.ac.id',
        password_hash: pwdHash,
        status: 'ACTIVE',
        role: 'mahasiswa',
        profile: {
          create: {
            full_name: 'Test User Fase 3',
          },
        },
      },
    });
  });

  after(async () => {
    // Cleanup user mutasi
    if (testMutationUser) {
      await prisma.user.deleteMany({
        where: { username: { in: ['testuser_fase3', 'user_audit_create_test'] } },
      });
    }

    if (server) {
      await new Promise((resolve) => server.close(resolve));
    }
  });

  // =========================================================================
  // 1. HTTP Security Hardening (Helmet, CORS, Rate Limit)
  // =========================================================================
  describe('1. HTTP Security Hardening (SRS Bab 35)', () => {
    test('Helmet menginjeksi header keamanan HTTP (X-Content-Type-Options, X-DNS-Prefetch, CORP)', async () => {
      const res = await fetch(`${baseUrl}/health`);
      assert.equal(res.status, 200);
      assert.equal(res.headers.get('x-content-type-options'), 'nosniff');
      assert.equal(res.headers.get('x-dns-prefetch-control'), 'off');
      assert.equal(res.headers.get('cross-origin-resource-policy'), 'cross-origin');
    });

    test('CORS mengizinkan origin yang terdaftar (http://localhost:3000)', async () => {
      const res = await fetch(`${baseUrl}/health`, {
        headers: {
          Origin: 'http://localhost:3000',
        },
      });
      assert.equal(res.status, 200);
      assert.equal(res.headers.get('access-control-allow-origin'), 'http://localhost:3000');
      assert.equal(res.headers.get('access-control-allow-credentials'), 'true');
    });

    test('CORS menolak request dari origin yang tidak diizinkan dengan 403', async () => {
      const res = await fetch(`${baseUrl}/api`, {
        headers: {
          Origin: 'http://attacker-site.com',
        },
      });
      assert.equal(res.status, 403);
      const body = await res.json();
      assert.equal(body.success, false);
      assert.match(body.message, /CORS/i);
    });

    test('Middleware Rate Limiter terdefinisi dengan konfigurasi standar', () => {
      assert.ok(generalLimiter);
      assert.ok(authLimiter);
      assert.equal(typeof generalLimiter, 'function');
      assert.equal(typeof authLimiter, 'function');
      assert.equal(typeof createRateLimiter, 'function');
    });

    test('Custom Rate Limiter memblokir request berlebih dengan status 429', async () => {
      const testApp = express();
      const testLimiter = createRateLimiter({
        windowMs: 60 * 1000,
        max: 2,
        message: 'Batas request tercapai',
      });
      testApp.use(testLimiter);
      testApp.get('/test-limit', (req, res) => res.json({ success: true }));

      let testServer;
      let testPort;
      await new Promise((resolve) => {
        testServer = testApp.listen(0, '127.0.0.1', () => {
          testPort = testServer.address().port;
          resolve();
        });
      });

      try {
        const res1 = await fetch(`http://127.0.0.1:${testPort}/test-limit`);
        assert.equal(res1.status, 200);
        const res2 = await fetch(`http://127.0.0.1:${testPort}/test-limit`);
        assert.equal(res2.status, 200);

        // Request ke-3 melebihi batas 2
        const res3 = await fetch(`http://127.0.0.1:${testPort}/test-limit`);
        assert.equal(res3.status, 429);
        const body3 = await res3.json();
        assert.equal(body3.success, false);
        assert.match(body3.message, /Batas request tercapai/i);
      } finally {
        await new Promise((resolve) => testServer.close(resolve));
      }
    });
  });

  // =========================================================================
  // 2. Audit Middleware (Client Extraction & Helpers)
  // =========================================================================
  describe('2. Audit Middleware (SRS Bab 35)', () => {
    test('extractClientInfo mengekstrak IP pertama dari x-forwarded-for dan user-agent', () => {
      const req = {
        headers: {
          'x-forwarded-for': '182.253.10.45, 10.0.0.1',
          'user-agent': 'Mozilla/5.0 SPADA-Test-Client',
        },
      };
      const info = extractClientInfo(req);
      assert.equal(info.ipAddress, '182.253.10.45');
      assert.equal(info.userAgent, 'Mozilla/5.0 SPADA-Test-Client');
    });

    test('extractClientInfo menggunakan req.ip ketika x-forwarded-for tidak tersedia', () => {
      const req = {
        headers: {},
        ip: '127.0.0.1',
      };
      const info = extractClientInfo(req);
      assert.equal(info.ipAddress, '127.0.0.1');
      assert.equal(info.userAgent, null);
    });

    test('attachAuditHelper menyematkan req.auditLog yang meneruskan ke AuditLogService', async () => {
      let recordedPayload = null;
      const originalRecord = AuditLogService.record;
      AuditLogService.record = (payload) => {
        recordedPayload = payload;
        return Promise.resolve(payload);
      };

      try {
        const req = {
          headers: { 'user-agent': 'UnitTester' },
          ip: '192.168.1.100',
          user: { id: adminUser.id },
        };
        const res = {};
        let nextCalled = false;

        attachAuditHelper(req, res, () => {
          nextCalled = true;
        });
        assert.equal(nextCalled, true);
        assert.equal(typeof req.auditLog, 'function');

        await req.auditLog('TEST_HELPER_ACTION', 'classes', {
          entityId: 'class-uuid-1',
          newValues: { nama_kelas: 'TI-A' },
        });

        assert.ok(recordedPayload);
        assert.equal(recordedPayload.action, 'TEST_HELPER_ACTION');
        assert.equal(recordedPayload.entity, 'classes');
        assert.equal(recordedPayload.entityId, 'class-uuid-1');
        assert.equal(recordedPayload.userId, adminUser.id);
        assert.equal(recordedPayload.ipAddress, '192.168.1.100');
        assert.equal(recordedPayload.userAgent, 'UnitTester');
      } finally {
        AuditLogService.record = originalRecord;
      }
    });

    test('auditInterceptor mencatat audit pada respons sukses (2xx) dan melewati respons gagal (4xx)', () => {
      let recordedCalls = [];
      const originalRecord = AuditLogService.record;
      AuditLogService.record = (payload) => {
        recordedCalls.push(payload);
        return Promise.resolve(payload);
      };

      try {
        const interceptor = auditInterceptor({
          action: 'CREATE_COURSE',
          entity: 'courses',
          getEntityId: (req, body) => body?.data?.id || 'default-id',
          getNewValues: (req, body) => body?.data,
        });

        // 1. Simulasi respons 201 (sukses)
        const reqSuccess = {
          headers: { 'user-agent': 'Chrome/120' },
          ip: '10.10.10.1',
          user: { id: adminUser.id },
        };
        const resSuccess = {
          statusCode: 201,
          json(body) {
            return this;
          },
        };

        interceptor(reqSuccess, resSuccess, () => {});
        resSuccess.json({ data: { id: 'course-123', nama: 'Pemrograman Web' } });

        assert.equal(recordedCalls.length, 1);
        assert.equal(recordedCalls[0].action, 'CREATE_COURSE');
        assert.equal(recordedCalls[0].entityId, 'course-123');

        // 2. Simulasi respons 400 (gagal) -> tidak boleh mencatat
        const reqFail = {
          headers: {},
          ip: '10.10.10.1',
          user: { id: adminUser.id },
        };
        const resFail = {
          statusCode: 400,
          json(body) {
            return this;
          },
        };

        interceptor(reqFail, resFail, () => {});
        resFail.json({ message: 'Validation error' });

        assert.equal(recordedCalls.length, 1); // Tetap 1, tidak bertambah
      } finally {
        AuditLogService.record = originalRecord;
      }
    });
  });

  // =========================================================================
  // 3. Audit Validation (Zod DTO)
  // =========================================================================
  describe('3. Audit Validation (Zod DTO)', () => {
    test('auditLogQuerySchema memvalidasi dan mengonversi query valid (termasuk waktu & string angka)', async () => {
      const validQuery = {
        page: '2',
        limit: '50',
        action: 'LOGIN',
        entity: 'auth',
        sortBy: 'waktu',
        sortOrder: 'asc',
        startDate: '2026-10-01',
        endDate: '2026-10-31',
      };
      const parsed = await auditLogQuerySchema.query.parseAsync(validQuery);
      assert.equal(parsed.page, 2);
      assert.equal(parsed.limit, 50);
      assert.equal(parsed.action, 'LOGIN');
      assert.equal(parsed.entity, 'auth');
      assert.equal(parsed.sortBy, 'waktu');
      assert.equal(parsed.sortOrder, 'asc');
    });

    test('auditLogQuerySchema menolak page <= 0', async () => {
      await assert.rejects(async () => {
        await auditLogQuerySchema.query.parseAsync({ page: '0' });
      });
    });

    test('auditLogQuerySchema menolak limit > 100', async () => {
      await assert.rejects(async () => {
        await auditLogQuerySchema.query.parseAsync({ limit: '101' });
      });
    });

    test('auditLogQuerySchema menolak sortBy tidak dikenal', async () => {
      await assert.rejects(async () => {
        await auditLogQuerySchema.query.parseAsync({ sortBy: 'unknown_column' });
      });
    });

    test('auditLogQuerySchema menolak format tanggal invalid', async () => {
      await assert.rejects(async () => {
        await auditLogQuerySchema.query.parseAsync({ startDate: 'bukan-tanggal-valid' });
      });
    });

    test('auditLogIdParamSchema menerima UUID valid dan menolak string sembarang', async () => {
      const validParams = { id: '550e8400-e29b-41d4-a716-446655440000' };
      const parsed = await auditLogIdParamSchema.params.parseAsync(validParams);
      assert.equal(parsed.id, '550e8400-e29b-41d4-a716-446655440000');

      await assert.rejects(async () => {
        await auditLogIdParamSchema.params.parseAsync({ id: 'bukan-uuid' });
      });
    });

    test('resetPasswordSchema memvalidasi UUID dan password minimal 8 karakter', async () => {
      const validPayload = {
        params: { id: '550e8400-e29b-41d4-a716-446655440000' },
        body: { new_password: 'newSecretPassword123' },
      };
      const parsedParams = await resetPasswordSchema.params.parseAsync(validPayload.params);
      const parsedBody = await resetPasswordSchema.body.parseAsync(validPayload.body);
      assert.equal(parsedParams.id, '550e8400-e29b-41d4-a716-446655440000');
      assert.equal(parsedBody.new_password, 'newSecretPassword123');

      // Password < 8 karakter harus ditolak
      await assert.rejects(async () => {
        await resetPasswordSchema.body.parseAsync({ new_password: 'short' });
      });
    });
  });

  // =========================================================================
  // 4. AuditLogService Methods & Structured Helpers
  // =========================================================================
  describe('4. AuditLogService Methods & Structured Helpers', () => {
    test('record() menyimpan mutasi ke database dengan format JSON terstruktur', async () => {
      const log = await AuditLogService.record({
        userId: adminUser.id,
        action: 'UNIT_TEST_ACTION',
        entity: 'test_entity',
        entityId: 'uuid-test-99',
        oldValues: { status: 'OLD' },
        newValues: { status: 'NEW' },
        ipAddress: '127.0.0.1',
        userAgent: 'NodeTestRunner',
      });

      assert.ok(log);
      assert.ok(log.id);
      assert.equal(log.action, 'UNIT_TEST_ACTION');
      assert.equal(log.entity, 'test_entity');
      assert.deepEqual(log.old_values, { status: 'OLD' });
      assert.deepEqual(log.new_values, { status: 'NEW' });

      // Clean up
      await prisma.auditLog.deleteMany({ where: { id: log.id } });
    });

    test('findAll() menghitung metadata paginasi dan mendukung filter action/entity', async () => {
      // Buat 3 log uji
      const log1 = await AuditLogService.record({
        userId: adminUser.id,
        action: 'FILTER_TEST_A',
        entity: 'courses',
        entityId: 'c-1',
      });
      const log2 = await AuditLogService.record({
        userId: adminUser.id,
        action: 'FILTER_TEST_A',
        entity: 'courses',
        entityId: 'c-2',
      });
      const log3 = await AuditLogService.record({
        userId: adminUser.id,
        action: 'FILTER_TEST_B',
        entity: 'classes',
        entityId: 'cl-1',
      });

      try {
        const result = await AuditLogService.findAll({
          action: 'FILTER_TEST_A',
          entity: 'courses',
          page: 1,
          limit: 10,
        });

        assert.ok(result.items.length >= 2);
        assert.equal(result.meta.page, 1);
        assert.equal(result.meta.limit, 10);
        assert.ok(result.meta.total >= 2);
        assert.ok(result.items.every((it) => it.action === 'FILTER_TEST_A'));
      } finally {
        await prisma.auditLog.deleteMany({
          where: { id: { in: [log1.id, log2.id, log3.id] } },
        });
      }
    });

    test('findById() mengembalikan detail audit log beserta profil aktor', async () => {
      const log = await AuditLogService.record({
        userId: adminUser.id,
        action: 'DETAIL_TEST_ACTION',
        entity: 'users',
        entityId: testMutationUser.id,
        newValues: { sample: 'data' },
      });

      try {
        const found = await AuditLogService.findById(log.id);
        assert.equal(found.id, log.id);
        assert.equal(found.action, 'DETAIL_TEST_ACTION');
        assert.ok(found.user);
        assert.equal(found.user.id, adminUser.id);
        assert.equal(found.user.username, 'admin');
      } finally {
        await prisma.auditLog.deleteMany({ where: { id: log.id } });
      }
    });

    test('findById() melempar AppError 404 ketika ID tidak ditemukan', async () => {
      await assert.rejects(
        async () => {
          await AuditLogService.findById('00000000-0000-0000-0000-000000000000');
        },
        (err) => {
          assert.equal(err.statusCode, 404);
          assert.match(err.message, /tidak ditemukan/i);
          return true;
        }
      );
    });

    test('Structured Helper Methods merekam payload secara akurat', async () => {
      const logsToClean = [];

      // 1. logStatusChange
      const logStatus = await AuditLogService.logStatusChange({
        adminId: adminUser.id,
        targetUserId: testMutationUser.id,
        oldStatus: 'ACTIVE',
        newStatus: 'SUSPENDED',
        reason: 'Uji coba helper status',
      });
      logsToClean.push(logStatus.id);
      assert.equal(logStatus.action, 'UPDATE_USER_STATUS');
      assert.deepEqual(logStatus.old_values, { status: 'ACTIVE' });
      assert.deepEqual(logStatus.new_values, { status: 'SUSPENDED', reason: 'Uji coba helper status' });

      // 2. logPasswordReset
      const logReset = await AuditLogService.logPasswordReset({
        adminId: adminUser.id,
        targetUserId: testMutationUser.id,
        targetUsername: testMutationUser.username,
      });
      logsToClean.push(logReset.id);
      assert.equal(logReset.action, 'RESET_PASSWORD');
      assert.deepEqual(logReset.new_values, { reset_by_admin: true, target_username: testMutationUser.username });

      // 3. logClassMutation
      const logClass = await AuditLogService.logClassMutation({
        userId: adminUser.id,
        action: 'CREATE_CLASS',
        classId: 'class-demo-1',
        newValues: { nama: 'TI-2026' },
      });
      logsToClean.push(logClass.id);
      assert.equal(logClass.action, 'CREATE_CLASS');
      assert.equal(logClass.entity, 'classes');

      // 4. logEnrollmentMutation
      const logEnroll = await AuditLogService.logEnrollmentMutation({
        userId: adminUser.id,
        action: 'ENROLL_STUDENT',
        enrollmentId: 'enroll-1',
        studentId: testMutationUser.id,
        classId: 'class-demo-1',
      });
      logsToClean.push(logEnroll.id);
      assert.equal(logEnroll.action, 'ENROLL_STUDENT');
      assert.equal(logEnroll.entity, 'enrollments');
      assert.equal(logEnroll.new_values.student_id, testMutationUser.id);

      await prisma.auditLog.deleteMany({
        where: { id: { in: logsToClean } },
      });
    });
  });

  // =========================================================================
  // 5. RBAC Protection pada Endpoint Jejak Audit
  // =========================================================================
  describe('5. RBAC Guard pada Endpoint Jejak Audit (FR-052)', () => {
    test('GET /api/admin/audit-logs ditolak tanpa autentikasi (401)', async () => {
      const res = await fetch(`${baseUrl}/api/admin/audit-logs`);
      assert.equal(res.status, 401);
      const body = await res.json();
      assert.equal(body.success, false);
    });

    test('GET /api/admin/audit-logs ditolak untuk role MAHASISWA (403)', async () => {
      const res = await fetch(`${baseUrl}/api/admin/audit-logs`, {
        headers: { Authorization: `Bearer ${mahasiswaToken}` },
      });
      assert.equal(res.status, 403);
      const body = await res.json();
      assert.equal(body.success, false);
      assert.match(body.message, /Akses ditolak/i);
    });

    test('GET /api/admin/audit-logs ditolak untuk role DOSEN (403)', async () => {
      const res = await fetch(`${baseUrl}/api/admin/audit-logs`, {
        headers: { Authorization: `Bearer ${dosenToken}` },
      });
      assert.equal(res.status, 403);
      const body = await res.json();
      assert.equal(body.success, false);
      assert.match(body.message, /Akses ditolak/i);
    });

    test('GET /api/admin/audit-logs diizinkan untuk role ADMIN (200) dengan struktur data dan meta', async () => {
      const res = await fetch(`${baseUrl}/api/admin/audit-logs?page=1&limit=5`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      assert.equal(res.status, 200);
      const body = await res.json();
      assert.equal(body.success, true);
      assert.ok(Array.isArray(body.data));
      assert.ok(body.meta);
      assert.equal(body.meta.page, 1);
      assert.equal(body.meta.limit, 5);
      assert.ok(typeof body.meta.total === 'number');
    });

    test('GET /api/audit-logs (alias flat endpoint) juga dapat diakses oleh ADMIN (200)', async () => {
      const res = await fetch(`${baseUrl}/api/audit-logs?limit=1`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      assert.equal(res.status, 200);
      const body = await res.json();
      assert.equal(body.success, true);
      assert.ok(Array.isArray(body.data));
    });

    test('GET /api/admin/audit-logs/:id mengembalikan 400 jika ID bukan format UUID', async () => {
      const res = await fetch(`${baseUrl}/api/admin/audit-logs/bukan-uuid`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      assert.equal(res.status, 400);
      const body = await res.json();
      assert.equal(body.success, false);
    });

    test('GET /api/admin/audit-logs/:id mengembalikan 404 jika ID UUID tidak ada', async () => {
      const res = await fetch(
        `${baseUrl}/api/admin/audit-logs/00000000-0000-0000-0000-000000000000`,
        {
          headers: { Authorization: `Bearer ${adminToken}` },
        }
      );
      assert.equal(res.status, 404);
      const body = await res.json();
      assert.equal(body.success, false);
      assert.match(body.message, /tidak ditemukan/i);
    });

    test('GET /api/admin/audit-logs/:id mengembalikan detail mutasi untuk ID yang valid', async () => {
      const sampleLog = await AuditLogService.record({
        userId: adminUser.id,
        action: 'INSPECT_TEST',
        entity: 'audit_test',
        oldValues: { val: 1 },
        newValues: { val: 2 },
      });

      try {
        const res = await fetch(`${baseUrl}/api/admin/audit-logs/${sampleLog.id}`, {
          headers: { Authorization: `Bearer ${adminToken}` },
        });
        assert.equal(res.status, 200);
        const body = await res.json();
        assert.equal(body.success, true);
        assert.equal(body.data.id, sampleLog.id);
        assert.equal(body.data.action, 'INSPECT_TEST');
        assert.deepEqual(body.data.old_values, { val: 1 });
        assert.deepEqual(body.data.new_values, { val: 2 });
      } finally {
        await prisma.auditLog.deleteMany({ where: { id: sampleLog.id } });
      }
    });
  });

  // =========================================================================
  // 6. Integrasi Jejak Audit pada Mutasi Akun & Pengguna
  // =========================================================================
  describe('6. Integrasi Jejak Audit pada Mutasi Akun (FR-044, SRS Bab 35)', () => {
    test('Admin membuat pengguna baru (POST /api/admin/users) otomatis mencatat CREATE_USER di AuditLog', async () => {
      const newUserPayload = {
        username: 'user_audit_create_test',
        email: 'user_audit_create_test@upgris.ac.id',
        password: 'password123',
        role: 'mahasiswa',
        full_name: 'Mahasiswa Audit Test',
      };

      const res = await fetch(`${baseUrl}/api/admin/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
          'User-Agent': 'IntegrationTester/1.0',
        },
        body: JSON.stringify(newUserPayload),
      });

      assert.equal(res.status, 201);
      const body = await res.json();
      assert.equal(body.success, true);
      const createdId = body.data.id;

      // Verifikasi baris di tabel audit_logs
      const auditEntry = await prisma.auditLog.findFirst({
        where: {
          action: 'CREATE_USER',
          entity_id: createdId,
        },
      });

      assert.ok(auditEntry, 'Entri CREATE_USER harus ada di audit_logs');
      assert.equal(auditEntry.user_id, adminUser.id);
      assert.equal(auditEntry.entity, 'users');
      assert.equal(auditEntry.new_values.username, newUserPayload.username);
      assert.equal(auditEntry.new_values.role, 'mahasiswa');
    });

    test('Admin mengubah status pengguna (PATCH /api/admin/users/:id/status) otomatis mencatat UPDATE_USER_STATUS', async () => {
      const res = await fetch(`${baseUrl}/api/admin/users/${testMutationUser.id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          status: 'SUSPENDED',
          reason: 'Pelanggaran etika akademik',
        }),
      });

      assert.equal(res.status, 200);
      const body = await res.json();
      assert.equal(body.success, true);
      assert.equal(body.data.user.status, 'SUSPENDED');

      // Verifikasi di AuditLog
      const auditEntry = await prisma.auditLog.findFirst({
        where: {
          action: 'UPDATE_USER_STATUS',
          entity_id: testMutationUser.id,
        },
        orderBy: { created_at: 'desc' },
      });

      assert.ok(auditEntry);
      assert.equal(auditEntry.user_id, adminUser.id);
      assert.deepEqual(auditEntry.old_values, { status: 'ACTIVE' });
      assert.equal(auditEntry.new_values.status, 'SUSPENDED');
      assert.equal(auditEntry.new_values.reason, 'Pelanggaran etika akademik');

      // Kembalikan ke ACTIVE
      await prisma.user.update({
        where: { id: testMutationUser.id },
        data: { status: 'ACTIVE' },
      });
    });

    test('Admin reset password pengguna (PUT /api/admin/users/:id/reset-password) mencatat RESET_PASSWORD dan mencabut token', async () => {
      // 1. Simulasikan pembuatan refresh token untuk user
      await prisma.refreshToken.create({
        data: {
          user_id: testMutationUser.id,
          token_hash: 'dummy-token-hash-fase3',
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
      });

      const res = await fetch(`${baseUrl}/api/admin/users/${testMutationUser.id}/reset-password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          new_password: 'brandNewPassword2026!',
        }),
      });

      assert.equal(res.status, 200);
      const body = await res.json();
      assert.equal(body.success, true);

      // Verifikasi di AuditLog
      const auditEntry = await prisma.auditLog.findFirst({
        where: {
          action: 'RESET_PASSWORD',
          entity_id: testMutationUser.id,
        },
        orderBy: { created_at: 'desc' },
      });

      assert.ok(auditEntry);
      assert.equal(auditEntry.user_id, adminUser.id);
      assert.equal(auditEntry.new_values.reset_by_admin, true);

      // Verifikasi bahwa refresh token aktif telah dicabut (revoked_at != null)
      const activeTokens = await prisma.refreshToken.findMany({
        where: {
          user_id: testMutationUser.id,
          revoked_at: null,
        },
      });
      assert.equal(activeTokens.length, 0, 'Seluruh refresh token lama harus dicabut');

      // Verifikasi login dengan password baru berhasil
      const resLogin = await fetch(`${baseUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier: testMutationUser.username,
          password: 'brandNewPassword2026!',
        }),
      });
      assert.equal(resLogin.status, 200);
    });

    test('Non-Admin (Mahasiswa) ditolak saat mencoba reset password pengguna lain (403)', async () => {
      const res = await fetch(`${baseUrl}/api/admin/users/${testMutationUser.id}/reset-password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${mahasiswaToken}`,
        },
        body: JSON.stringify({
          new_password: 'unauthorizedPassword123',
        }),
      });

      assert.equal(res.status, 403);
    });
  });
});
