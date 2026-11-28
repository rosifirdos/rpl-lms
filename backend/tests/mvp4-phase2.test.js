import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import app from '../src/app.js';
import prisma from '../src/config/prisma.js';
import { cleanupTestArtifacts } from './setup.js';

/**
 * Suite Fase 2 MVP 4: Central Timeline (FR-009–FR-012, BR-013).
 */
describe('Fase 2 MVP 4: Central Timeline', () => {
  let server;
  let baseUrl;
  let adminToken;
  let lecturerToken;
  let studentToken;
  let outsideStudentToken;
  let course;
  let testClass;
  let outsideClass;
  let meeting;
  let examMeeting;
  let publishedAssignment;
  let draftAssignment;
  let publishedQuiz;

  const suffix = Date.now().toString().slice(-8);
  const now = Date.now();
  const iso = (ms) => new Date(ms).toISOString();

  const request = (url, { method = 'GET', token = lecturerToken } = {}) =>
    fetch(`${baseUrl}${url}`, {
      method,
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });

  async function login(identifier) {
    const response = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier, password: 'password123' }),
    });
    const payload = await response.json();
    assert.equal(response.status, 200, payload.message);
    return payload.data.accessToken;
  }

  before(async () => {
    await cleanupTestArtifacts(prisma);
    await new Promise((resolve) => {
      server = app.listen(0, '127.0.0.1', () => {
        baseUrl = `http://127.0.0.1:${server.address().port}`;
        resolve();
      });
    });

    [adminToken, lecturerToken, studentToken, outsideStudentToken] = await Promise.all([
      login('admin'),
      login('198501152010121002'),
      login('2024001001'),
      login('2024001003'),
    ]);

    const admin = await prisma.user.findUnique({ where: { username: 'admin' } });
    const lecturer = await prisma.dosen.findFirst({ where: { nidn: '198501152010121002' } });
    const otherLecturer = await prisma.dosen.findFirst({ where: { nidn: '199003202015042001' } });
    const student = await prisma.mahasiswa.findFirst({ where: { nim: '2024001001' } });
    const outsideStudent = await prisma.mahasiswa.findFirst({ where: { nim: '2024001003' } });

    course = await prisma.course.create({
      data: { code: `TML${suffix}`, name: `Timeline Test ${suffix}`, credits: 3 },
    });
    testClass = await prisma.class.create({
      data: {
        course_id: course.id,
        lecturer_id: lecturer.id,
        name: `TEST-${suffix}`,
        academic_year: '2026/2027',
        semester: 'ganjil',
      },
    });
    outsideClass = await prisma.class.create({
      data: {
        course_id: course.id,
        lecturer_id: otherLecturer.id,
        name: `TEST-OUT-${suffix}`,
        academic_year: '2026/2027',
        semester: 'ganjil',
      },
    });
    meeting = await prisma.meeting.create({
      data: {
        class_id: testClass.id,
        meeting_number: 1,
        title: 'Pertemuan Terjadwal',
        scheduled_at: new Date(now + 3 * 24 * 3600 * 1000),
      },
    });
    examMeeting = await prisma.meeting.create({
      data: {
        class_id: testClass.id,
        meeting_number: 2,
        title: 'UTS Semester',
        is_exam: true,
        exam_type: 'UTS',
        scheduled_at: new Date(now + 10 * 24 * 3600 * 1000),
      },
    });

    publishedAssignment = await prisma.assignment.create({
      data: {
        meeting_id: meeting.id,
        title: 'Tugas Terbit',
        weight_percentage: 20,
        due_date: new Date(now + 5 * 24 * 3600 * 1000),
        is_published: true,
      },
    });
    draftAssignment = await prisma.assignment.create({
      data: {
        meeting_id: meeting.id,
        title: 'Tugas Draft',
        weight_percentage: 20,
        due_date: new Date(now + 6 * 24 * 3600 * 1000),
        is_published: false,
      },
    });
    publishedQuiz = await prisma.quiz.create({
      data: {
        meeting_id: meeting.id,
        title: 'Kuis Terbit',
        duration_minutes: 30,
        open_at: new Date(now + 1 * 24 * 3600 * 1000),
        close_at: new Date(now + 2 * 24 * 3600 * 1000),
        is_published: true,
      },
    });
    await prisma.quiz.create({
      data: {
        meeting_id: meeting.id,
        title: 'Kuis Draft',
        duration_minutes: 30,
        open_at: new Date(now + 1 * 24 * 3600 * 1000),
        close_at: new Date(now + 2 * 24 * 3600 * 1000),
        is_published: false,
      },
    });

    await prisma.enrollment.create({
      data: { class_id: testClass.id, student_id: student.id, enrolled_by: admin.id },
    });
  });

  after(async () => {
    await cleanupTestArtifacts(prisma);
    await new Promise((resolve) => server.close(resolve));
  });

  test('Tanpa token ditolak 401; Admin ditolak 403 (khusus Mahasiswa & Dosen)', async () => {
    const anonymous = await request('/api/timeline', { token: null });
    assert.equal(anonymous.status, 401);

    const admin = await request('/api/timeline', { token: adminToken });
    assert.equal(admin.status, 403);
  });

  test('Mahasiswa melihat item kronologis terurut naik dan draft tersembunyi', async () => {
    const response = await request('/api/timeline', { token: studentToken });
    const payload = await response.json();

    assert.equal(response.status, 200);
    assert.ok(Array.isArray(payload.data));

    const titles = payload.data.map((item) => item.title);
    assert.ok(titles.includes('Kuis Terbit'), 'kuis terbit harus tampil');
    assert.ok(titles.includes('Tugas Terbit'), 'tugas terbit harus tampil');
    assert.ok(titles.includes('Pertemuan Terjadwal'), 'pertemuan terjadwal harus tampil');
    assert.ok(titles.includes('UTS Semester'), 'ujian harus tampil sebagai EXAM');
    assert.ok(!titles.includes('Tugas Draft'), 'tugas draft tersembunyi');
    assert.ok(!titles.includes('Kuis Draft'), 'kuis draft tersembunyi');

    const exam = payload.data.find((item) => item.title === 'UTS Semester');
    assert.equal(exam.type, 'EXAM');

    // Urutan kronologis berdasarkan starts_at.
    const startsAt = payload.data.map((item) => new Date(item.starts_at).getTime());
    const sorted = [...startsAt].sort((a, b) => a - b);
    assert.deepEqual(startsAt, sorted, 'item harus terurut starts_at menaik');

    // Konteks kelas & mata kuliah terisi.
    const first = payload.data[0];
    assert.equal(first.class_id, testClass.id);
    assert.equal(first.course_code, course.code);
    assert.ok(first.link);
  });

  test('Dosen melihat timeline kelas yang diampu', async () => {
    const response = await request('/api/timeline');
    const payload = await response.json();

    assert.equal(response.status, 200);
    assert.ok(payload.data.length > 0);
    assert.ok(payload.data.every((item) => item.class_id === testClass.id));
  });

  test('Mahasiswa luar kelas mendapat timeline kosong; filter kelas asing 403', async () => {
    const response = await request('/api/timeline', { token: outsideStudentToken });
    const payload = await response.json();
    assert.equal(response.status, 200);
    assert.equal(payload.data.length, 0, 'mahasiswa luar kelas tidak melihat apa pun');

    const filtered = await request(`/api/timeline?class_id=${testClass.id}`, {
      token: outsideStudentToken,
    });
    assert.equal(filtered.status, 403);
  });

  test('Filter types=ASSIGNMENT hanya mengembalikan tugas', async () => {
    const response = await request('/api/timeline?types=ASSIGNMENT', { token: studentToken });
    const payload = await response.json();

    assert.equal(response.status, 200);
    assert.ok(payload.data.length > 0);
    assert.ok(payload.data.every((item) => item.type === 'ASSIGNMENT'));
  });

  test('Filter rentang waktu mengecualikan item di luar jendela', async () => {
    const from = iso(now + 8 * 24 * 3600 * 1000);
    const to = iso(now + 12 * 24 * 3600 * 1000);
    const response = await request(`/api/timeline?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`, {
      token: studentToken,
    });
    const payload = await response.json();

    assert.equal(response.status, 200);
    assert.ok(payload.data.length > 0);
    assert.ok(payload.data.every((item) => item.title === 'UTS Semester'));
  });

  test('Parameter tidak valid ditolak 400', async () => {
    const badTypes = await request('/api/timeline?types=FOO', { token: studentToken });
    assert.equal(badTypes.status, 400);

    const badLimit = await request('/api/timeline?limit=1000', { token: studentToken });
    assert.equal(badLimit.status, 400);

    const badRange = await request(
      `/api/timeline?from=${encodeURIComponent(iso(now + 5000))}&to=${encodeURIComponent(iso(now))}`,
      { token: studentToken }
    );
    assert.equal(badRange.status, 400);
  });

  test('Meta memuat jendela waktu dan server_time (BR-013)', async () => {
    const response = await request('/api/timeline', { token: studentToken });
    const payload = await response.json();

    assert.ok(payload.meta?.server_time);
    assert.ok(payload.meta?.from);
    assert.ok(payload.meta?.to);
  });
});
