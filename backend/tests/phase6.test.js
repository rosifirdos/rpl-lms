import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import app from '../src/app.js';
import prisma from '../src/config/prisma.js';

describe('Fase 6: Kepatuhan MVP 1 & Handoff API', () => {
  let server;
  let baseUrl;
  let adminToken;
  let studentToken;

  const request = (path, { method = 'GET', token = adminToken, body } = {}) =>
    fetch(`${baseUrl}${path}`, {
      method,
      headers: {
        ...(body ? { 'Content-Type': 'application/json' } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });

  before(async () => {
    await new Promise((resolve) => {
      server = app.listen(0, '127.0.0.1', () => {
        baseUrl = `http://127.0.0.1:${server.address().port}`;
        resolve();
      });
    });

    const [adminLogin, studentLogin] = await Promise.all([
      request('/api/auth/login', {
        token: null,
        method: 'POST',
        body: { identifier: 'admin', password: 'password123' },
      }),
      request('/api/auth/login', {
        token: null,
        method: 'POST',
        body: { identifier: '2024001001', password: 'password123' },
      }),
    ]);

    adminToken = (await adminLogin.json()).data.accessToken;
    studentToken = (await studentLogin.json()).data.accessToken;
  });

  after(async () => {
    await new Promise((resolve) => server.close(resolve));
    await prisma.$disconnect();
  });

  test('OpenAPI 3.0 memuat endpoint MVP 1 yang menjadi handoff frontend', async () => {
    const specification = await readFile(new URL('../docs/openapi.yaml', import.meta.url), 'utf8');

    assert.match(specification, /^openapi: 3\.0\.3$/m);
    for (const endpoint of [
      '/auth/login:',
      '/admin/users:',
      '/admin/courses:',
      '/admin/classes:',
      '/admin/enrollments:',
      '/dashboard:',
      '/admin/audit-logs:',
    ]) {
      assert.ok(specification.includes(endpoint), `Dokumentasi belum memuat ${endpoint}`);
    }
  });

  test('Multi-role login dan penolakan akun suspended tetap konsisten', async () => {
    const student = await prisma.user.findFirst({
      where: { mahasiswa: { nim: '2024001001' } },
    });
    await prisma.user.update({
      where: { id: student.id },
      data: { status: 'SUSPENDED' },
    });

    const denied = await request('/api/auth/login', {
      token: null,
      method: 'POST',
      body: { identifier: '2024001001', password: 'password123' },
    });

    await prisma.user.update({
      where: { id: student.id },
      data: { status: 'ACTIVE' },
    });
    assert.equal(denied.status, 403);

    const allowed = await request('/api/auth/login', {
      token: null,
      method: 'POST',
      body: { identifier: '2024001001', password: 'password123' },
    });
    assert.equal(allowed.status, 200);
  });

  test('Endpoint dashboard, ruang kelas, audit log, dan RBAC dapat dipanggil', async () => {
    const dashboardStudent = await request('/api/dashboard', { token: studentToken });
    assert.equal(dashboardStudent.status, 200);

    const classesStudent = await request('/api/classes', { token: studentToken });
    assert.equal(classesStudent.status, 200);

    const auditStudent = await request('/api/admin/audit-logs', {
      token: studentToken,
    });
    assert.equal(auditStudent.status, 403);
  });

  test('Mutasi master dan enrollment menghasilkan jejak audit', async () => {
    const course = await prisma.course.findFirst({ where: { code: 'TIF101' } });
    const beforeCount = await prisma.auditLog.count({
      where: { entity: { in: ['courses', 'classes', 'enrollments'] } },
    });

    const response = await request(`/api/admin/courses/${course.id}`, {
      method: 'PUT',
      body: { description: `Validasi handoff fase 6 ${Date.now()}` },
    });

    assert.equal(response.status, 200);
    const afterCount = await prisma.auditLog.count({
      where: { entity: { in: ['courses', 'classes', 'enrollments'] } },
    });
    assert.ok(afterCount > beforeCount);
    assert.ok(await prisma.auditLog.findFirst({
      where: { entity: 'courses', entity_id: course.id },
      orderBy: { created_at: 'desc' },
    }));
  });
});
