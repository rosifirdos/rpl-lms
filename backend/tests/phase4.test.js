import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import app from '../src/app.js';
import prisma from '../src/config/prisma.js';

describe('Fase 4: Master Data Akademik SPADA', () => {
  let server;
  let baseUrl;
  let adminToken;
  let mahasiswaToken;
  let course;
  let classRecord;
  let classId;
  let testUser;
  let lecturer;
  let students = [];

  const suffix = `${Date.now()}`;
  const courseCode = `TST${suffix.slice(-12)}`;
  const nim = `29${suffix.slice(-8)}`;

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
    mahasiswaToken = (await studentLogin.json()).data.accessToken;

    lecturer = await prisma.dosen.findFirst({
      where: { user: { status: 'ACTIVE' } },
      select: { id: true },
    });
    students = await prisma.mahasiswa.findMany({ take: 2, select: { id: true } });
  });

  after(async () => {
    if (classId) {
      await prisma.enrollment.deleteMany({ where: { class_id: classId } });
      await prisma.auditLog.deleteMany({ where: { entity_id: classId } });
      await prisma.class.deleteMany({ where: { id: classId } });
    }
    if (course) {
      await prisma.auditLog.deleteMany({ where: { entity_id: course.id } });
      await prisma.course.deleteMany({ where: { id: course.id } });
    }
    if (testUser) {
      await prisma.auditLog.deleteMany({ where: { entity_id: testUser.id } });
      await prisma.user.deleteMany({ where: { id: testUser.id } });
    }
    if (server) await new Promise((resolve) => server.close(resolve));
  });

  test('endpoint master data menerapkan autentikasi, role admin, dan validasi Zod', async () => {
    const unauthenticated = await request('/api/admin/courses', { token: null });
    assert.equal(unauthenticated.status, 401);

    const forbidden = await request('/api/admin/courses', { token: mahasiswaToken });
    assert.equal(forbidden.status, 403);

    const invalidCourse = await request('/api/admin/courses', {
      method: 'POST',
      body: { code: courseCode, name: 'Mata Kuliah', credits: 7 },
    });
    assert.equal(invalidCourse.status, 400);

    const invalidStudent = await request('/api/admin/users', {
      method: 'POST',
      body: {
        username: `invalid${suffix}`,
        email: `invalid${suffix}@test.upgris.ac.id`,
        password: 'TestAccount123!',
        role: 'mahasiswa',
      },
    });
    assert.equal(invalidStudent.status, 400);
  });

  test('admin dapat membuat, mencari, memperbarui, dan menonaktifkan mata kuliah dengan audit', async () => {
    const create = await request('/api/admin/courses', {
      method: 'POST',
      body: {
        code: courseCode.toLowerCase(),
        name: 'Pengujian Master Data',
        credits: 3,
        description: 'Data sementara untuk pengujian fase 4',
      },
    });
    assert.equal(create.status, 201);
    course = (await create.json()).data;
    assert.equal(course.code, courseCode);

    const list = await request(`/api/admin/courses?search=${courseCode}&page=1&limit=10`);
    const listed = await list.json();
    assert.equal(list.status, 200);
    assert.ok(listed.data.some((item) => item.id === course.id));
    assert.equal(listed.meta.page, 1);

    const detail = await request(`/api/admin/courses/${course.id}`);
    assert.equal(detail.status, 200);

    const update = await request(`/api/admin/courses/${course.id}`, {
      method: 'PUT',
      body: { credits: 4, description: null },
    });
    assert.equal(update.status, 200);
    assert.equal((await update.json()).data.credits, 4);

    const audit = await prisma.auditLog.findMany({
      where: { entity_id: course.id, entity: 'courses' },
      select: { action: true },
    });
    assert.deepEqual(
      new Set(audit.map((entry) => entry.action)),
      new Set(['CREATE_COURSE', 'UPDATE_COURSE'])
    );
  });

  test('admin dapat membuka kelas dan sistem mencegah kapasitas di bawah enrollment', async () => {
    assert.ok(course, 'Mata kuliah harus dibuat pada pengujian sebelumnya');
    assert.ok(lecturer, 'Database tes harus memiliki dosen aktif');
    assert.ok(students.length >= 2, 'Database tes harus memiliki dua mahasiswa');

    const create = await request('/api/admin/classes', {
      method: 'POST',
      body: {
        course_id: course.id,
        lecturer_id: lecturer.id,
        academic_year: '2026/2027',
        semester: 'ganjil',
        name: `F${suffix.slice(-4)}`,
        capacity: 2,
      },
    });
    assert.equal(create.status, 201);
    classRecord = (await create.json()).data;
    classId = classRecord.id;
    assert.equal(classRecord._count.enrollments, 0);

    const admin = await prisma.user.findUnique({ where: { username: 'admin' } });
    await prisma.enrollment.createMany({
      data: students.map((student) => ({
        class_id: classRecord.id,
        student_id: student.id,
        enrolled_by: admin.id,
      })),
    });

    const update = await request(`/api/admin/classes/${classRecord.id}`, {
      method: 'PUT',
      body: { capacity: 3 },
    });
    assert.equal(update.status, 200);
    assert.equal((await update.json()).data.capacity, 3);

    const lowerCapacity = await request(`/api/admin/classes/${classRecord.id}`, {
      method: 'PUT',
      body: { capacity: 1 },
    });
    assert.equal(lowerCapacity.status, 409);

    const deleteEnrolled = await request(`/api/admin/classes/${classRecord.id}`, {
      method: 'DELETE',
    });
    assert.equal(deleteEnrolled.status, 409);

    const filtered = await request(
      `/api/admin/classes?academic_year=2026%2F2027&semester=ganjil&course_id=${course.id}`
    );
    const filteredBody = await filtered.json();
    assert.ok(filteredBody.data.some((item) => item.id === classRecord.id));
    assert.equal(filteredBody.data.find((item) => item.id === classRecord.id)._count.enrollments, 2);

    const audit = await prisma.auditLog.findMany({
      where: { entity_id: classRecord.id, entity: 'classes' },
      select: { action: true },
    });
    assert.deepEqual(
      new Set(audit.map((entry) => entry.action)),
      new Set(['CREATE_CLASS', 'UPDATE_CLASS'])
    );

    await prisma.enrollment.deleteMany({ where: { class_id: classRecord.id } });
  });

  test('pembuatan akun mahasiswa menyimpan identitas dan mendukung filter pencarian', async () => {
    const create = await request('/api/admin/users', {
      method: 'POST',
      body: {
        username: nim,
        email: `${nim}@test.upgris.ac.id`,
        password: 'TestAccount123!',
        role: 'mahasiswa',
        full_name: 'Mahasiswa Fase Empat',
        nim,
        prodi: 'Teknik Informatika',
        angkatan: 2024,
      },
    });
    assert.equal(create.status, 201);
    testUser = (await create.json()).data;
    assert.equal(testUser.mahasiswa.nim, nim);

    const list = await request(
      `/api/admin/users?search=${nim}&role=mahasiswa&status=ACTIVE`
    );
    const listed = await list.json();
    assert.equal(list.status, 200);
    assert.ok(listed.data.some((user) => user.id === testUser.id));
  });

  test('penghapusan mata kuliah menonaktifkan tanpa memutus kelas', async () => {
    assert.ok(course);
    assert.ok(classRecord);
    const remove = await request(`/api/admin/courses/${course.id}`, { method: 'DELETE' });
    assert.equal(remove.status, 200);
    course = { ...course, is_active: false };

    const filtered = await request(`/api/admin/courses?is_active=false&search=${courseCode}`);
    const listed = await filtered.json();
    assert.ok(listed.data.some((item) => item.id === course.id && !item.is_active));

    const classDetail = await request(`/api/admin/classes/${classRecord.id}`);
    const classBody = await classDetail.json();
    assert.equal(classDetail.status, 200);
    assert.equal(classBody.data.course.is_active, false);

    const deleteEmptyClass = await request(`/api/admin/classes/${classRecord.id}`, {
      method: 'DELETE',
    });
    assert.equal(deleteEmptyClass.status, 200);
    const classDeleteAudit = await prisma.auditLog.findFirst({
      where: { entity_id: classRecord.id, action: 'DELETE_CLASS' },
    });
    assert.ok(classDeleteAudit);
    classRecord = null;

    const audit = await prisma.auditLog.findFirst({
      where: { entity_id: course.id, action: 'DEACTIVATE_COURSE' },
    });
    assert.ok(audit);
  });
});
