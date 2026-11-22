import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import SwaggerParser from '@apidevtools/swagger-parser';
import app from '../src/app.js';
import prisma from '../src/config/prisma.js';
import { formatLecturerName } from '../src/utils/format.js';
import {
  BODYLESS_MUTATIONS,
  MULTIPART_MUTATIONS,
  MUTATING_METHODS,
  OPENAPI_PATH,
  collectRefs,
  listOperations,
  loadOpenApiDocument,
  resolveContentSchema,
  resolveJsonPointer,
  resolveOperationParameters,
} from './openapi.js';
import { TEST_DB } from './setup.js';

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

  describe('Kontrak OpenAPI 3.0 (divalidasi dengan parser YAML, bukan pencocokan substring)', () => {
    /** Dokumen OpenAPI ter-parse, dimuat sekali untuk seluruh pengujian kontrak. */
    let specification;

    before(async () => {
      specification = await loadOpenApiDocument();
    });

    test('Dokumen dapat diparse sebagai YAML dan mendeklarasikan OpenAPI 3.0.3', () => {
      assert.equal(typeof specification, 'object');
      assert.equal(specification.openapi, '3.0.3');
      assert.ok(specification.info?.title, 'info.title wajib didefinisikan');
      assert.ok(specification.info?.version, 'info.version wajib didefinisikan');
      assert.ok(specification.paths && typeof specification.paths === 'object');
    });

    test('Dokumen lolos validasi penuh OpenAPI 3.0 (swagger-parser)', async () => {
      // Validasi spesifikasi sesungguhnya: struktur, tipe, dan seluruh $ref.
      const api = await SwaggerParser.validate(fileURLToPath(OPENAPI_PATH));
      assert.equal(api.openapi, '3.0.3');
      assert.ok(api.info.title);
      assert.ok(Object.keys(api.paths).length >= 20);
    });

    test('Seluruh endpoint MVP 1 terdefinisi sebagai operasi HTTP nyata', () => {
      const required = [
        ['/auth/login', 'post'],
        ['/auth/refresh', 'post'],
        ['/auth/logout', 'post'],
        ['/auth/forgot-password', 'post'],
        ['/profile', 'get'],
        ['/profile', 'put'],
        ['/profile/avatar', 'post'],
        ['/profile/password', 'put'],
        ['/admin/users', 'get'],
        ['/admin/users', 'post'],
        ['/admin/courses', 'get'],
        ['/admin/courses', 'post'],
        ['/admin/classes', 'get'],
        ['/admin/classes', 'post'],
        ['/admin/enrollments', 'post'],
        ['/admin/classes/{classId}/enrollments', 'get'],
        ['/admin/classes/{classId}/available-students', 'get'],
        ['/dashboard', 'get'],
        ['/classes', 'get'],
        ['/admin/audit-logs', 'get'],
        // Modul MVP 2 (Fase 2 — 16 pertemuan terstruktur)
        ['/classes/{classId}/meetings', 'get'],
        ['/meetings/{id}', 'get'],
        ['/meetings/{id}', 'put'],
      ];

      for (const [path, method] of required) {
        assert.ok(specification.paths[path], `Path ${path} belum didefinisikan`);
        assert.ok(
          specification.paths[path][method],
          `Operasi ${method.toUpperCase()} ${path} belum didefinisikan`
        );
      }
    });

    test('Setiap operasi mutasi mendefinisikan requestBody dengan skema body yang sah', () => {
      const operations = listOperations(specification);

      for (const entry of operations) {
        if (!MUTATING_METHODS.includes(entry.method)) continue;
        const key = `${entry.method} ${entry.path}`;
        if (BODYLESS_MUTATIONS.has(key)) continue;

        const requestBody = entry.operation.requestBody;
        assert.ok(requestBody, `${key.toUpperCase()} ${entry.path} wajib mendefinisikan requestBody`);

        const resolvedBody = requestBody.$ref
          ? resolveJsonPointer(specification, requestBody.$ref)
          : requestBody;
        assert.ok(resolvedBody?.content, `${entry.method.toUpperCase()} ${entry.path}: requestBody tanpa content`);

        const mediaType = MULTIPART_MUTATIONS.get(key) ?? 'application/json';
        const bodySchema = resolveContentSchema(specification, resolvedBody, mediaType);
        assert.ok(
          bodySchema,
          `${entry.method.toUpperCase()} ${entry.path}: requestBody wajib memiliki skema ${mediaType}`
        );
        assert.equal(
          bodySchema.type,
          'object',
          `${entry.method.toUpperCase()} ${entry.path}: skema requestBody harus bertipe object`
        );
        assert.ok(
          bodySchema.properties && Object.keys(bodySchema.properties).length > 0,
          `${entry.method.toUpperCase()} ${entry.path}: skema requestBody wajib mendefinisikan properti`
        );
      }
    });

    test('Setiap operasi mendefinisikan respons dan memakai envelope ApiResponse', () => {
      const operations = listOperations(specification);

      for (const entry of operations) {
        const responses = entry.operation.responses;
        assert.ok(responses, `${entry.method.toUpperCase()} ${entry.path}: responses wajib ada`);
        assert.ok(
          Object.keys(responses).length > 0,
          `${entry.method.toUpperCase()} ${entry.path}: minimal satu respons harus didefinisikan`
        );

        const successStatus = Object.keys(responses).find((status) => status.startsWith('2'));
        assert.ok(
          successStatus,
          `${entry.method.toUpperCase()} ${entry.path}: wajib mendefinisikan minimal satu respons 2xx`
        );

        const successSchema = resolveContentSchema(specification, responses[successStatus]);
        assert.ok(
          successSchema,
          `${entry.method.toUpperCase()} ${entry.path}: respons ${successStatus} wajib memiliki skema application/json`
        );
        assert.ok(
          successSchema.properties?.success,
          `${entry.method.toUpperCase()} ${entry.path}: skema respons wajib memuat properti "success"`
        );
      }

      const envelope = specification.components?.schemas?.ApiResponse;
      assert.ok(envelope, 'components.schemas.ApiResponse wajib didefinisikan');
      assert.deepEqual([...(envelope.required ?? [])].sort(), ['message', 'success']);
    });

    test('Parameter operasi ter-resolve lengkap dengan tipe dan lokasi yang sah', () => {
      const operations = listOperations(specification);

      for (const entry of operations) {
        for (const parameter of resolveOperationParameters(specification, entry)) {
          assert.ok(parameter, `${entry.method.toUpperCase()} ${entry.path}: parameter $ref tidak dapat di-resolve`);
          assert.ok(parameter.name, `${entry.method.toUpperCase()} ${entry.path}: parameter tanpa name`);
          assert.ok(
            ['path', 'query', 'header', 'cookie'].includes(parameter.in),
            `${entry.method.toUpperCase()} ${entry.path}: parameter "${parameter.name}" memiliki "in" tidak sah (${parameter.in})`
          );
          assert.ok(
            parameter.schema,
            `${entry.method.toUpperCase()} ${entry.path}: parameter "${parameter.name}" tanpa schema`
          );
        }
      }

      // Setiap token `{...}` pada template path wajib dideklarasikan
      // sebagai parameter `in: path` pada operasi yang memakai path tersebut.
      for (const entry of operations) {
        const declaredPathParams = new Set(
          resolveOperationParameters(specification, entry)
            .filter((parameter) => parameter?.in === 'path')
            .map((parameter) => parameter.name)
        );

        for (const token of entry.path.match(/\{[^}]+\}/g) ?? []) {
          const name = token.slice(1, -1);
          assert.ok(
            declaredPathParams.has(name),
            `${entry.method.toUpperCase()} ${entry.path}: parameter path "${name}" belum dideklarasikan`
          );
        }
      }
    });

    test('Seluruh $ref menunjuk ke komponen yang benar-benar ada', () => {
      const refs = collectRefs(specification);
      assert.ok(refs.length > 0, 'Kontrak OpenAPI harus memakai $ref untuk komponen bersama');

      for (const ref of refs) {
        assert.ok(ref.startsWith('#/'), `Hanya $ref lokal yang didukung, ditemukan: ${ref}`);
        assert.ok(
          resolveJsonPointer(specification, ref) !== undefined,
          `$ref tidak dapat di-resolve (komponen tidak ada): ${ref}`
        );
      }
    });

    test('Skema utama yang dirujuk endpoint benar-benar terdefinisi', () => {
      for (const schemaName of [
        'ApiResponse',
        'PaginationMeta',
        'LoginRequest',
        'CreateUserRequest',
        'CreateCourseRequest',
        'CreateClassRequest',
        'CreateEnrollmentRequest',
      ]) {
        assert.ok(
          specification.components?.schemas?.[schemaName],
          `components.schemas.${schemaName} wajib didefinisikan`
        );
      }

      // CreateEnrollmentRequest harus mendukung pendaftaran tunggal maupun batch.
      const enrollment = specification.components.schemas.CreateEnrollmentRequest;
      assert.ok(enrollment.properties.class_id, 'CreateEnrollmentRequest.class_id wajib ada');
      assert.ok(
        enrollment.properties.student_id || enrollment.properties.student_ids,
        'CreateEnrollmentRequest wajib mendukung student_id atau student_ids'
      );
      assert.ok(
        enrollment.required?.includes('class_id'),
        'class_id wajib menjadi field required pada CreateEnrollmentRequest'
      );
    });
  });

  describe('Isolasi database pengujian (DoD B4)', () => {
    test('Suite terhubung ke database non-operasional', async () => {
      assert.equal(TEST_DB.name, 'rpl_review', 'Pengujian wajib berjalan pada database rpl_review');
      assert.ok(
        !TEST_DB.operational.includes(TEST_DB.name),
        `Pengujian tidak boleh berjalan pada database operasional: ${TEST_DB.name}`
      );

      // Bukti runtime: koneksi Prisma yang dipakai suite benar-benar ke rpl_review.
      const [{ current_database: currentDatabase }] = await prisma.$queryRaw`
        SELECT current_database()
      `;
      assert.equal(
        currentDatabase,
        TEST_DB.name,
        `Koneksi Prisma mengarah ke "${currentDatabase}", bukan "${TEST_DB.name}"`
      );
    });
  });

  test('Multi-role login dan penolakan akun suspended tetap konsisten (dengan teardown terjamin)', async () => {
    const student = await prisma.user.findFirst({
      where: { mahasiswa: { nim: '2024001001' } },
    });

    try {
      await prisma.user.update({
        where: { id: student.id },
        data: { status: 'SUSPENDED' },
      });

      const denied = await request('/api/auth/login', {
        token: null,
        method: 'POST',
        body: { identifier: '2024001001', password: 'password123' },
      });
      assert.equal(denied.status, 403);
    } finally {
      await prisma.user.update({
        where: { id: student.id },
        data: { status: 'ACTIVE' },
      });
    }

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

  test('Mutasi master dan enrollment menghasilkan jejak audit (dengan teardown data)', async () => {
    const course = await prisma.course.findFirst({ where: { code: 'TIF101' } });
    const originalDesc = course.description;
    const beforeCount = await prisma.auditLog.count({
      where: { entity: { in: ['courses', 'classes', 'enrollments'] } },
    });

    try {
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
    } finally {
      await prisma.course.update({
        where: { id: course.id },
        data: { description: originalDesc },
      });
    }
  });

  test('Enrollment konkuren tidak boleh melewati kapasitas kelas dan mengembalikan kode error terstruktur', async () => {
    const course = await prisma.course.findFirst();
    const lecturer = await prisma.dosen.findFirst();
    const students = await prisma.mahasiswa.findMany({
      where: { user: { status: 'ACTIVE' } },
      take: 3,
      select: { id: true },
    });
    assert.ok(students.length >= 3);

    const testClass = await prisma.class.create({
      data: {
        course_id: course.id,
        lecturer_id: lecturer.id,
        academic_year: '2026/2027',
        semester: 'ganjil',
        name: `KAP-${Date.now()}`,
        capacity: 1,
      },
    });

    try {
      const responses = await Promise.all(
        students.map((student) =>
          request('/api/admin/enrollments', {
            method: 'POST',
            body: { class_id: testClass.id, student_id: student.id },
          })
        )
      );

      const statuses = responses.map((response) => response.status);
      assert.equal(statuses.filter((status) => status === 201).length, 1);
      assert.ok(statuses.every((status) => status === 201 || status === 409));
      assert.equal(
        await prisma.enrollment.count({ where: { class_id: testClass.id } }),
        1
      );

      // Verifikasi bahwa status 409 memuat kode mesin CLASS_CAPACITY_FULL
      const rejectedResponses = responses.filter((res) => res.status === 409);
      for (const rej of rejectedResponses) {
        const body = await rej.json();
        assert.ok(
          body.code === 'CLASS_CAPACITY_FULL' || body.code === 'CONCURRENCY_CONFLICT',
          `Kode error harus terstruktur, didapat: ${body.code}`
        );
      }
    } finally {
      await prisma.class.delete({ where: { id: testClass.id } });
    }
  });

  test('Format nama dosen tidak menghasilkan duplikasi gelar', () => {
    // Kasus 1: data seed yang sudah bersih
    const dosenNormal = {
      gelar_depan: 'Dr.',
      gelar_belakang: 'M.Kom.',
      user: { profile: { full_name: 'Budi Santoso' } },
    };
    assert.strictEqual(formatLecturerName(dosenNormal), 'Dr. Budi Santoso, M.Kom.');

    // Kasus 2: data yang tidak sengaja memuat gelar ganda di full_name
    const dosenDuplicate = {
      gelar_depan: 'Dr.',
      gelar_belakang: 'M.Kom.',
      user: { profile: { full_name: 'Dr. Budi Santoso, M.Kom.' } },
    };
    assert.strictEqual(formatLecturerName(dosenDuplicate), 'Dr. Budi Santoso, M.Kom.');

    // Kasus 3: dosen tanpa gelar depan
    const dosenTanpaGelarDepan = {
      gelar_depan: '',
      gelar_belakang: 'S.Kom., M.T.',
      user: { profile: { full_name: 'Siti Aminah' } },
    };
    assert.strictEqual(formatLecturerName(dosenTanpaGelarDepan), 'Siti Aminah, S.Kom., M.T.');
  });
});
