import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import app from '../src/app.js';
import prisma from '../src/config/prisma.js';

describe('Fase 5: Modul Direct Enrollment (BR-002), Dasbor Kontekstual & Ruang Kelas', () => {
  let server;
  let baseUrl;
  let adminToken;
  let dosenToken;
  let mahasiswa1Token;
  let mahasiswa2Token;
  let student1;
  let student2;
  let student3;
  let lecturer;
  let testCourse;
  let testClassSmall;
  let testClassMain;
  let enrolledRecord;

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

    // 1. Dapatkan token Admin, Dosen, dan 2 Mahasiswa dari data seed
    const [adminLogin, dosenLogin, mhs1Login, mhs2Login] = await Promise.all([
      request('/api/auth/login', {
        token: null,
        method: 'POST',
        body: { identifier: 'admin', password: 'password123' },
      }),
      request('/api/auth/login', {
        token: null,
        method: 'POST',
        body: { identifier: '198501152010121002', password: 'password123' },
      }),
      request('/api/auth/login', {
        token: null,
        method: 'POST',
        body: { identifier: '2024001001', password: 'password123' },
      }),
      request('/api/auth/login', {
        token: null,
        method: 'POST',
        body: { identifier: '2024001002', password: 'password123' },
      }),
    ]);

    const adminBody = await adminLogin.json();
    const dosenBody = await dosenLogin.json();
    const mhs1Body = await mhs1Login.json();
    const mhs2Body = await mhs2Login.json();

    adminToken = adminBody.data.accessToken;
    dosenToken = dosenBody.data.accessToken;
    mahasiswa1Token = mhs1Body.data.accessToken;
    mahasiswa2Token = mhs2Body.data.accessToken;

    // 2. Ambil data entitas terkait dari database
    lecturer = await prisma.dosen.findFirst({
      where: { nidn: '198501152010121002' },
    });

    const studentRecords = await prisma.mahasiswa.findMany({
      where: { nim: { in: ['2024001001', '2024001002', '2024001003'] } },
      orderBy: { nim: 'asc' },
    });
    student1 = studentRecords[0];
    student2 = studentRecords[1];
    student3 = studentRecords[2];

    testCourse = await prisma.course.findFirst({ where: { code: 'TIF101' } });

    // 3. Buat kelas uji khusus Fase 5 (satu kelas kuota 2 untuk tes kapasitas, satu kelas utama)
    const suffix = `${Date.now()}`.slice(-6);
    testClassSmall = await prisma.class.create({
      data: {
        course_id: testCourse.id,
        lecturer_id: lecturer.id,
        academic_year: '2026/2027',
        semester: 'ganjil',
        name: `TEST-KUOTA-${suffix}`,
        capacity: 2,
      },
    });

    testClassMain = await prisma.class.create({
      data: {
        course_id: testCourse.id,
        lecturer_id: lecturer.id,
        academic_year: '2026/2027',
        semester: 'ganjil',
        name: `TEST-MAIN-${suffix}`,
        capacity: 40,
      },
    });
  });

  after(async () => {
    // Bersihkan data uji fase 5
    if (testClassSmall?.id) {
      await prisma.enrollment.deleteMany({ where: { class_id: testClassSmall.id } });
      await prisma.class.delete({ where: { id: testClassSmall.id } }).catch(() => {});
    }
    if (testClassMain?.id) {
      await prisma.enrollment.deleteMany({ where: { class_id: testClassMain.id } });
      await prisma.class.delete({ where: { id: testClassMain.id } }).catch(() => {});
    }
    if (server) {
      await new Promise((resolve) => server.close(resolve));
    }
  });

  describe('1. Kontrol Akses & Guard Otorisasi Fase 5 (RBAC)', () => {
    test('POST /api/admin/enrollments ditolak tanpa token (401)', async () => {
      const res = await request('/api/admin/enrollments', {
        method: 'POST',
        token: null,
        body: { class_id: testClassMain.id, student_id: student1.id },
      });
      assert.strictEqual(res.status, 401);
    });

    test('POST /api/admin/enrollments ditolak untuk role MAHASISWA & DOSEN (403)', async () => {
      const resMahasiswa = await request('/api/admin/enrollments', {
        method: 'POST',
        token: mahasiswa1Token,
        body: { class_id: testClassMain.id, student_id: student1.id },
      });
      assert.strictEqual(resMahasiswa.status, 403);

      const resDosen = await request('/api/admin/enrollments', {
        method: 'POST',
        token: dosenToken,
        body: { class_id: testClassMain.id, student_id: student1.id },
      });
      assert.strictEqual(resDosen.status, 403);
    });

    test('DELETE /api/admin/enrollments/:id ditolak untuk selain Admin (403)', async () => {
      const res = await request(`/api/admin/enrollments/00000000-0000-0000-0000-000000000000`, {
        method: 'DELETE',
        token: mahasiswa1Token,
      });
      assert.strictEqual(res.status, 403);
    });

    test('GET /api/dashboard ditolak jika unauthenticated (401)', async () => {
      const res = await request('/api/dashboard', { token: null });
      assert.strictEqual(res.status, 401);
    });
  });

  describe('2. Direct Enrollment Mahasiswa (BR-002) & Penegakan Kapasitas', () => {
    test('Admin dapat mendaftarkan mahasiswa individual ke kelas (POST /api/admin/enrollments)', async () => {
      const res = await request('/api/admin/enrollments', {
        method: 'POST',
        token: adminToken,
        body: {
          class_id: testClassMain.id,
          student_id: student1.id,
        },
      });

      assert.strictEqual(res.status, 201);
      const json = await res.json();
      assert.strictEqual(json.success, true);
      assert.strictEqual(json.data.class_id, testClassMain.id);
      assert.strictEqual(json.data.student_id, student1.id);

      enrolledRecord = json.data;

      // Verifikasi tersimpan di tabel audit_logs
      const audit = await prisma.auditLog.findFirst({
        where: {
          action: 'ENROLL_STUDENT',
          entity: 'enrollments',
          entity_id: enrolledRecord.id,
        },
      });
      assert.ok(audit, 'Audit log ENROLL_STUDENT harus tercatat');
    });

    test('Mahasiswa terdaftar muncul di GET /api/admin/classes/:classId/enrollments', async () => {
      const res = await request(`/api/admin/classes/${testClassMain.id}/enrollments`, {
        token: adminToken,
      });
      assert.strictEqual(res.status, 200);
      const json = await res.json();
      assert.strictEqual(json.success, true);
      assert.ok(Array.isArray(json.data));
      assert.strictEqual(json.data.length, 1);
      assert.strictEqual(json.data[0].student.nim, student1.nim);
    });

    test('Mahasiswa yang sudah terdaftar tidak muncul di available-students', async () => {
      const res = await request(`/api/admin/classes/${testClassMain.id}/available-students`, {
        token: adminToken,
      });
      assert.strictEqual(res.status, 200);
      const json = await res.json();
      assert.strictEqual(json.success, true);
      const isStudent1Present = json.data.some((s) => s.id === student1.id);
      assert.strictEqual(isStudent1Present, false, 'Student 1 tidak boleh ada di daftar available');
    });

    test('Sistem menolak duplikasi pendaftaran mahasiswa ke kelas yang sama (409 Conflict)', async () => {
      const res = await request('/api/admin/enrollments', {
        method: 'POST',
        token: adminToken,
        body: {
          class_id: testClassMain.id,
          student_id: student1.id,
        },
      });
      assert.strictEqual(res.status, 409);
      const json = await res.json();
      assert.match(json.message, /sudah terdaftar/i);
    });

    test('Admin dapat melakukan batch enrollment mahasiswa (POST /api/admin/enrollments)', async () => {
      const res = await request('/api/admin/enrollments', {
        method: 'POST',
        token: adminToken,
        body: {
          class_id: testClassMain.id,
          student_ids: [student2.id, student3.id],
        },
      });
      assert.strictEqual(res.status, 201);
      const json = await res.json();
      assert.strictEqual(json.success, true);
      assert.ok(Array.isArray(json.data));
      assert.strictEqual(json.data.length, 2);
    });

    test('Sistem menolak enrollment jika melebihi batas kuota kelas (409 Conflict)', async () => {
      // testClassSmall memiliki capacity = 2
      // 1. Enroll mahasiswa 1
      const res1 = await request('/api/admin/enrollments', {
        method: 'POST',
        token: adminToken,
        body: { class_id: testClassSmall.id, student_id: student1.id },
      });
      assert.strictEqual(res1.status, 201);

      // 2. Enroll mahasiswa 2 (kuota penuh: 2/2)
      const res2 = await request('/api/admin/enrollments', {
        method: 'POST',
        token: adminToken,
        body: { class_id: testClassSmall.id, student_id: student2.id },
      });
      assert.strictEqual(res2.status, 201);

      // 3. Coba enroll mahasiswa 3 (harus ditolak karena over-capacity)
      const res3 = await request('/api/admin/enrollments', {
        method: 'POST',
        token: adminToken,
        body: { class_id: testClassSmall.id, student_id: student3.id },
      });
      assert.strictEqual(res3.status, 409);
      const json3 = await res3.json();
      assert.match(json3.message, /kapasitas kelas tidak mencukupi/i);
    });

    test('Admin dapat mencabut (unenroll) mahasiswa dari kelas (DELETE /api/admin/enrollments/:id)', async () => {
      const res = await request(`/api/admin/enrollments/${enrolledRecord.id}`, {
        method: 'DELETE',
        token: adminToken,
      });
      assert.strictEqual(res.status, 200);
      const json = await res.json();
      assert.strictEqual(json.success, true);
      assert.strictEqual(json.data.id, enrolledRecord.id);

      // Verifikasi terhapus dari kelas
      const verifyRes = await request(`/api/admin/classes/${testClassMain.id}/enrollments`, {
        token: adminToken,
      });
      const verifyJson = await verifyRes.json();
      const stillEnrolled = verifyJson.data.some((e) => e.id === enrolledRecord.id);
      assert.strictEqual(stillEnrolled, false);

      // Verifikasi audit log UNENROLL_STUDENT
      const audit = await prisma.auditLog.findFirst({
        where: {
          action: 'UNENROLL_STUDENT',
          entity: 'enrollments',
          entity_id: enrolledRecord.id,
        },
      });
      assert.ok(audit, 'Audit log UNENROLL_STUDENT harus tercatat');
    });
  });

  describe('3. Dasbor Kontekstual SPADA LMS (GET /api/dashboard)', () => {
    test('Dasbor Admin menyajikan 4 metrik sistem utama dan jalan pintas', async () => {
      const res = await request('/api/dashboard', { token: adminToken });
      assert.strictEqual(res.status, 200);
      const json = await res.json();

      assert.strictEqual(json.success, true);
      assert.strictEqual(json.data.role, 'admin');
      assert.ok(json.data.metrics.total_students >= 10);
      assert.ok(json.data.metrics.total_lecturers >= 3);
      assert.ok(json.data.metrics.total_courses >= 5);
      assert.ok(json.data.metrics.total_classes >= 2);
      assert.ok(Array.isArray(json.data.shortcuts));
      assert.ok(Array.isArray(json.data.recent_audit_logs));
    });

    test('Dasbor Dosen menyajikan data profil bergelar dan kelas yang diampu', async () => {
      const res = await request('/api/dashboard', { token: dosenToken });
      assert.strictEqual(res.status, 200);
      const json = await res.json();

      assert.strictEqual(json.success, true);
      assert.strictEqual(json.data.role, 'dosen');
      assert.strictEqual(json.data.profile.nidn, '198501152010121002');
      assert.match(json.data.profile.formatted_name, /Dr\./);
      assert.ok(Array.isArray(json.data.teaching_classes));
      assert.ok(json.data.teaching_classes.length > 0);
      assert.strictEqual(json.data.teaching_classes[0].total_meetings, 16);
    });

    test('Dasbor Mahasiswa menyajikan kartu kelas yang dienroll dan info semester', async () => {
      // student2 terdaftar pada testClassMain dari pengujian batch sebelumnya
      const res = await request('/api/dashboard', { token: mahasiswa2Token });
      assert.strictEqual(res.status, 200);
      const json = await res.json();

      assert.strictEqual(json.success, true);
      assert.strictEqual(json.data.role, 'mahasiswa');
      assert.strictEqual(json.data.profile.nim, '2024001002');
      assert.ok(Array.isArray(json.data.enrolled_classes));
      assert.ok(json.data.enrolled_classes.length > 0);
      assert.strictEqual(json.data.enrolled_classes[0].total_meetings, 16);
      assert.ok(json.data.summary.total_credits > 0);
    });
  });

  describe('4. Ruang Kelas Pengguna (GET /api/classes & GET /api/classes/:id)', () => {
    test('Mahasiswa hanya melihat kelas yang telah dienroll oleh Admin (BR-002, BR-003)', async () => {
      const res = await request('/api/classes', { token: mahasiswa2Token });
      assert.strictEqual(res.status, 200);
      const json = await res.json();

      assert.strictEqual(json.success, true);
      assert.ok(Array.isArray(json.data));
      const hasEnrolledClass = json.data.some((c) => c.id === testClassMain.id);
      assert.strictEqual(hasEnrolledClass, true);
    });

    test('Mahasiswa yang terdaftar dapat membuka detail kelas dengan 16 pertemuan (BR-004)', async () => {
      const res = await request(`/api/classes/${testClassMain.id}`, { token: mahasiswa2Token });
      assert.strictEqual(res.status, 200);
      const json = await res.json();

      assert.strictEqual(json.success, true);
      assert.strictEqual(json.data.total_meetings, 16);
      assert.strictEqual(json.data.meetings.length, 16);

      // Verifikasi Pertemuan 8 adalah UTS dan Pertemuan 16 adalah UAS (BR-004)
      const meeting8 = json.data.meetings.find((m) => m.meeting_number === 8);
      const meeting16 = json.data.meetings.find((m) => m.meeting_number === 16);
      const meeting1 = json.data.meetings.find((m) => m.meeting_number === 1);

      assert.strictEqual(meeting8.type, 'UTS');
      assert.strictEqual(meeting8.is_exam, true);
      assert.strictEqual(meeting8.attendance_required_percentage, 70);

      assert.strictEqual(meeting16.type, 'UAS');
      assert.strictEqual(meeting16.is_exam, true);
      assert.strictEqual(meeting16.attendance_required_percentage, 70);

      assert.strictEqual(meeting1.type, 'REGULAR');
      assert.strictEqual(meeting1.is_exam, false);
    });

    test('Mahasiswa yang TIDAK terdaftar ditolak mengakses ruang kelas (403 Forbidden - BR-003)', async () => {
      // student1 telah dicabut dari testClassMain di pengujian unenroll
      const res = await request(`/api/classes/${testClassMain.id}`, { token: mahasiswa1Token });
      assert.strictEqual(res.status, 403);
      const json = await res.json();
      assert.match(json.message, /tidak terdaftar/i);
    });
  });
});
