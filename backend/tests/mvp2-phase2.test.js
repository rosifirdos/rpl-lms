import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import app from '../src/app.js';
import prisma from '../src/config/prisma.js';
import { cleanupTestArtifacts } from './setup.js';

describe('Fase 2 MVP 2: Service & API 16 Pertemuan Terstruktur', () => {
  let server;
  let baseUrl;

  let adminToken;
  let dosenToken;
  let dosenLainToken;
  let mahasiswaEnrolledToken;
  let mahasiswaLuarToken;

  let testClass;
  let course;
  let lecturer;
  let lecturer2;
  let studentEnrolled;
  let studentLuar;
  let meetings = [];

  const suffix = `${Date.now()}`.slice(-6);
  const className = `TEST-FASE2-${suffix}`;

  const request = (path, { method = 'GET', token, body } = {}) =>
    fetch(`${baseUrl}${path}`, {
      method,
      headers: {
        ...(body ? { 'Content-Type': 'application/json' } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });

  async function login(identifier) {
    const response = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier, password: 'password123' }),
    });
    const payload = await response.json();
    assert.equal(response.status, 200, `Login ${identifier} gagal: ${payload.message}`);
    return payload.data.accessToken;
  }

  before(async () => {
    await new Promise((resolve) => {
      server = app.listen(0, '127.0.0.1', () => {
        baseUrl = `http://127.0.0.1:${server.address().port}`;
        resolve();
      });
    });

    [
      adminToken,
      dosenToken,
      dosenLainToken,
      mahasiswaEnrolledToken,
      mahasiswaLuarToken,
    ] = await Promise.all([
      login('admin'),
      login('198501152010121002'),
      login('199003202015042001'),
      login('2024001001'),
      login('2024001002'),
    ]);

    course = await prisma.course.findFirst({ where: { is_active: true } });
    lecturer = await prisma.dosen.findUnique({ where: { nidn: '198501152010121002' } });
    lecturer2 = await prisma.dosen.findUnique({ where: { nidn: '199003202015042001' } });
    studentEnrolled = await prisma.mahasiswa.findUnique({ where: { nim: '2024001001' } });
    studentLuar = await prisma.mahasiswa.findUnique({ where: { nim: '2024001002' } });

    assert.ok(course && lecturer && lecturer2 && studentEnrolled && studentLuar);
  });

  after(async () => {
    await cleanupTestArtifacts(prisma);
    if (server) {
      await new Promise((resolve) => server.close(resolve));
    }
  });

  test('1. Auto-Generate 16 Pertemuan saat kelas baru dibuka oleh Admin', async () => {
    const res = await request('/api/admin/classes', {
      method: 'POST',
      token: adminToken,
      body: {
        course_id: course.id,
        lecturer_id: lecturer.id,
        academic_year: '2026/2027',
        semester: 'ganjil',
        name: className,
        capacity: 40,
      },
    });

    assert.equal(res.status, 201);
    const json = await res.json();
    assert.equal(json.success, true);
    testClass = json.data;
    assert.ok(testClass.id);

    // Ambil pertemuan dari DB untuk verifikasi auto-generate
    meetings = await prisma.meeting.findMany({
      where: { class_id: testClass.id },
      orderBy: { meeting_number: 'asc' },
    });

    assert.equal(meetings.length, 16, 'Jumlah pertemuan harus tepat 16');

    // Verifikasi Pertemuan 1 s.d. 7 (Pra-UTS)
    for (let i = 0; i < 7; i++) {
      assert.equal(meetings[i].meeting_number, i + 1);
      assert.equal(meetings[i].title, `Pertemuan ${i + 1}`);
      assert.equal(meetings[i].is_exam, false);
      assert.equal(meetings[i].exam_type, 'NONE');
      assert.equal(meetings[i].is_published, true);
    }

    // Verifikasi Pertemuan 8 (UTS)
    assert.equal(meetings[7].meeting_number, 8);
    assert.equal(meetings[7].is_exam, true);
    assert.equal(meetings[7].exam_type, 'UTS');

    // Verifikasi Pertemuan 9 s.d. 15 (Pasca-UTS)
    for (let i = 8; i < 15; i++) {
      assert.equal(meetings[i].meeting_number, i + 1);
      assert.equal(meetings[i].is_exam, false);
      assert.equal(meetings[i].exam_type, 'NONE');
    }

    // Verifikasi Pertemuan 16 (UAS)
    assert.equal(meetings[15].meeting_number, 16);
    assert.equal(meetings[15].is_exam, true);
    assert.equal(meetings[15].exam_type, 'UAS');

    // Enroll mahasiswa1 ke kelas uji ini
    const adminUser = await prisma.user.findFirst({ where: { role: 'admin' } });
    await prisma.enrollment.create({
      data: {
        class_id: testClass.id,
        student_id: studentEnrolled.id,
        enrolled_by: adminUser.id,
      },
    });
  });

  test('2. GET /api/classes/:classId/meetings - Akses oleh Admin & Dosen Pengampu & Mahasiswa Enrolled', async () => {
    // Admin
    const resAdmin = await request(`/api/classes/${testClass.id}/meetings`, { token: adminToken });
    assert.equal(resAdmin.status, 200);
    const jsonAdmin = await resAdmin.json();
    assert.equal(jsonAdmin.success, true);
    assert.equal(jsonAdmin.data.length, 16);

    // Dosen Pengampu
    const resDosen = await request(`/api/classes/${testClass.id}/meetings`, { token: dosenToken });
    assert.equal(resDosen.status, 200);
    const jsonDosen = await resDosen.json();
    assert.equal(jsonDosen.success, true);
    assert.equal(jsonDosen.data.length, 16);

    // Mahasiswa Enrolled
    const resMhs = await request(`/api/classes/${testClass.id}/meetings`, { token: mahasiswaEnrolledToken });
    assert.equal(resMhs.status, 200);
    const jsonMhs = await resMhs.json();
    assert.equal(jsonMhs.success, true);
    assert.equal(jsonMhs.data.length, 16);
  });

  test('3. GET /api/classes/:classId/meetings - Penolakan Otorisasi (403)', async () => {
    // Dosen Lain (bukan pengampu)
    const resDosenLain = await request(`/api/classes/${testClass.id}/meetings`, { token: dosenLainToken });
    assert.equal(resDosenLain.status, 403);
    const jsonDosenLain = await resDosenLain.json();
    assert.equal(jsonDosenLain.success, false);

    // Mahasiswa Luar (tidak terdaftar)
    const resMhsLuar = await request(`/api/classes/${testClass.id}/meetings`, { token: mahasiswaLuarToken });
    assert.equal(resMhsLuar.status, 403);
    const jsonMhsLuar = await resMhsLuar.json();
    assert.equal(jsonMhsLuar.success, false);
  });

  test('4. GET /api/classes/:classId/meetings - Validasi Parameter (400 & 404)', async () => {
    // Non-UUID classId
    const resInvalid = await request('/api/classes/invalid-uuid/meetings', { token: adminToken });
    assert.equal(resInvalid.status, 400);

    // Non-existent classId
    const fakeUuid = '00000000-0000-0000-0000-000000000000';
    const resNotFound = await request(`/api/classes/${fakeUuid}/meetings`, { token: adminToken });
    assert.equal(resNotFound.status, 404);
  });

  test('5. GET /api/meetings/:id - Detail Pertemuan & Akses', async () => {
    const meeting1 = meetings[0];

    // Detail oleh Dosen Pengampu
    const res = await request(`/api/meetings/${meeting1.id}`, { token: dosenToken });
    assert.equal(res.status, 200);
    const json = await res.json();
    assert.equal(json.success, true);
    assert.equal(json.data.id, meeting1.id);
    assert.equal(json.data.meeting_number, 1);
    assert.ok(Array.isArray(json.data.materials));
    assert.ok(json.data.attendance_session !== undefined);

    // Dosen Lain ditolak (403)
    const resDosenLain = await request(`/api/meetings/${meeting1.id}`, { token: dosenLainToken });
    assert.equal(resDosenLain.status, 403);

    // Mahasiswa Luar ditolak (403)
    const resMhsLuar = await request(`/api/meetings/${meeting1.id}`, { token: mahasiswaLuarToken });
    assert.equal(resMhsLuar.status, 403);
  });

  test('6. GET /api/meetings/:id - Validasi Parameter (400 & 404)', async () => {
    // Non-UUID id
    const resInvalid = await request('/api/meetings/invalid-uuid', { token: adminToken });
    assert.equal(resInvalid.status, 400);

    // Non-existent meeting
    const fakeUuid = '00000000-0000-0000-0000-000000000000';
    const resNotFound = await request(`/api/meetings/${fakeUuid}`, { token: adminToken });
    assert.equal(resNotFound.status, 404);
  });

  test('7. PUT /api/meetings/:id - Pembaruan Topik oleh Dosen Pengampu & Audit Log', async () => {
    const meeting1 = meetings[0];
    const newTitle = 'Pengenalan HTML5 & Arsitektur Web Modern';
    const newDescription = 'Pembahasan mengenai elemen-elemen semantik HTML5 dan arsitektur client-server.';

    // Dosen Pengampu memperbarui topik pertemuan
    const res = await request(`/api/meetings/${meeting1.id}`, {
      method: 'PUT',
      token: dosenToken,
      body: {
        title: newTitle,
        description: newDescription,
        is_published: true,
      },
    });

    assert.equal(res.status, 200);
    const json = await res.json();
    assert.equal(json.success, true);
    assert.equal(json.data.title, newTitle);
    assert.equal(json.data.description, newDescription);

    // Verifikasi audit log
    const auditLog = await prisma.auditLog.findFirst({
      where: {
        entity: 'meetings',
        entity_id: meeting1.id,
        action: 'UPDATE_MEETING',
      },
    });
    assert.ok(auditLog, 'Audit log UPDATE_MEETING harus tercatat');
  });

  test('8. PUT /api/meetings/:id - Otorisasi & Validasi Body', async () => {
    const meeting1 = meetings[0];

    // Mahasiswa mencoba memperbarui topik -> ditolak 403
    const resMhs = await request(`/api/meetings/${meeting1.id}`, {
      method: 'PUT',
      token: mahasiswaEnrolledToken,
      body: { title: 'Dosen Palsu' },
    });
    assert.equal(resMhs.status, 403);

    // Dosen Lain mencoba memperbarui topik -> ditolak 403
    const resDosenLain = await request(`/api/meetings/${meeting1.id}`, {
      method: 'PUT',
      token: dosenLainToken,
      body: { title: 'Dosen Lain' },
    });
    assert.equal(resDosenLain.status, 403);

    // Judul kosong -> ditolak 400
    const resEmptyTitle = await request(`/api/meetings/${meeting1.id}`, {
      method: 'PUT',
      token: dosenToken,
      body: { title: '' },
    });
    assert.equal(resEmptyTitle.status, 400);

    // Kolom tak dikenal (strict mode Zod) -> ditolak 400
    const resUnknownField = await request(`/api/meetings/${meeting1.id}`, {
      method: 'PUT',
      token: dosenToken,
      body: { is_exam: true },
    });
    assert.equal(resUnknownField.status, 400);

    // Body kosong -> ditolak 400 (tidak boleh menulis audit tanpa perubahan)
    const resEmptyBody = await request(`/api/meetings/${meeting1.id}`, {
      method: 'PUT',
      token: dosenToken,
      body: {},
    });
    assert.equal(resEmptyBody.status, 400);
    const jsonEmptyBody = await resEmptyBody.json();
    assert.equal(jsonEmptyBody.success, false);
  });

  test('9. Publikasi pertemuan menyembunyikan pertemuan dari mahasiswa (BR-004)', async () => {
    const meeting2 = meetings[1];

    // Dosen menarik publikasi Pertemuan 2
    const resUnpublish = await request(`/api/meetings/${meeting2.id}`, {
      method: 'PUT',
      token: dosenToken,
      body: { is_published: false },
    });
    assert.equal(resUnpublish.status, 200);
    assert.equal((await resUnpublish.json()).data.is_published, false);

    // Mahasiswa enrolled tidak lagi melihat Pertemuan 2 pada daftar
    const resMhsList = await request(`/api/classes/${testClass.id}/meetings`, {
      token: mahasiswaEnrolledToken,
    });
    assert.equal(resMhsList.status, 200);
    const mhsMeetings = (await resMhsList.json()).data;
    assert.equal(mhsMeetings.length, 15);
    assert.equal(
      mhsMeetings.some((m) => m.meeting_number === 2),
      false,
      'Pertemuan belum dipublikasikan tidak boleh muncul bagi mahasiswa'
    );

    // Detail pertemuan yang belum dipublikasikan -> 404 bagi mahasiswa
    const resMhsDetail = await request(`/api/meetings/${meeting2.id}`, {
      token: mahasiswaEnrolledToken,
    });
    assert.equal(resMhsDetail.status, 404);

    // Dosen pengampu tetap melihat seluruh 16 pertemuan
    const resDosenList = await request(`/api/classes/${testClass.id}/meetings`, {
      token: dosenToken,
    });
    assert.equal((await resDosenList.json()).data.length, 16);

    // Kembalikan publikasi agar tidak mengganggu pengujian berikutnya
    const resRepublish = await request(`/api/meetings/${meeting2.id}`, {
      method: 'PUT',
      token: dosenToken,
      body: { is_published: true },
    });
    assert.equal(resRepublish.status, 200);
  });
});
