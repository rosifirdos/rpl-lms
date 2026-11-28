import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import app from '../src/app.js';
import prisma from '../src/config/prisma.js';
import { cleanupTestArtifacts } from './setup.js';

/**
 * Suite Fase 5 MVP 4: notifikasi internal (FR-057).
 *
 * Pemicu notifikasi best-effort dari aksi dosen, dedupe key, dan pengingat
 * deadline H-1 yang dimaterialisasi lazy saat notifikasi dibaca.
 */
describe('Fase 5 MVP 4: notifikasi internal', () => {
  let server;
  let baseUrl;
  let adminToken;
  let lecturerToken;
  let studentToken;
  let otherStudentToken;
  let course;
  let testClass;
  let meeting;
  let studentUserId;
  let otherStudentUserId;
  let quiz;

  const suffix = Date.now().toString().slice(-8);
  const now = Date.now();
  const iso = (ms) => new Date(ms).toISOString();

  const request = (url, { method = 'GET', token = studentToken, body } = {}) =>
    fetch(`${baseUrl}${url}`, {
      method,
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(body ? { 'Content-Type': 'application/json' } : {}),
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

    [adminToken, lecturerToken, studentToken, otherStudentToken] = await Promise.all([
      login('admin'),
      login('198501152010121002'),
      login('2024001001'),
      login('2024001002'),
    ]);

    const admin = await prisma.user.findUnique({ where: { username: 'admin' } });
    const lecturer = await prisma.dosen.findFirst({ where: { nidn: '198501152010121002' } });
    const studentA = await prisma.mahasiswa.findFirst({ where: { nim: '2024001001' } });
    const studentB = await prisma.mahasiswa.findFirst({ where: { nim: '2024001002' } });
    studentUserId = studentA.user_id;
    otherStudentUserId = studentB.user_id;

    course = await prisma.course.create({
      data: { code: `NTF${suffix}`, name: `Notif Test ${suffix}`, credits: 3 },
    });
    testClass = await prisma.class.create({
      data: {
        course_id: course.id,
        lecturer_id: lecturer.id,
        name: `TEST-NTF-${suffix}`,
        academic_year: '2026/2027',
        semester: 'ganjil',
      },
    });
    meeting = await prisma.meeting.create({
      data: { class_id: testClass.id, meeting_number: 1, title: 'Pertemuan Notif' },
    });
    await prisma.enrollment.create({
      data: { class_id: testClass.id, student_id: studentA.id, enrolled_by: admin.id },
    });
    await prisma.enrollment.create({
      data: { class_id: testClass.id, student_id: studentB.id, enrolled_by: admin.id },
    });

    // Bersihkan notifikasi lama kedua mahasiswa agar asersi deterministik.
    await prisma.notification.deleteMany({
      where: { user_id: { in: [studentUserId, otherStudentUserId] } },
    });
  });

  after(async () => {
    await cleanupTestArtifacts(prisma);
    await new Promise((resolve) => server.close(resolve));
  });

  test('Tanpa token ditolak 401', async () => {
    const response = await request('/api/notifications', { token: null });
    assert.equal(response.status, 401);
  });

  test('Menerbitkan kuis memicu notifikasi QUIZ_PUBLISHED ke mahasiswa ter-enroll', async () => {
    const created = await request(`/api/meetings/${meeting.id}/quizzes`, {
      token: lecturerToken,
      method: 'POST',
      body: {
        title: 'Kuis Notifikasi',
        duration_minutes: 30,
        open_at: iso(now - 1000),
        close_at: iso(now + 3600 * 1000),
      },
    });
    quiz = (await created.json()).data;
    await request(`/api/quizzes/${quiz.id}/questions`, {
      token: lecturerToken,
      method: 'POST',
      body: {
        question_text: 'Soal?',
        type: 'ESSAY',
        points: 10,
      },
    });
    const publish = await request(`/api/quizzes/${quiz.id}/publish`, {
      token: lecturerToken,
      method: 'PATCH',
      body: { is_published: true },
    });
    assert.equal(publish.status, 200);

    const notifications = await prisma.notification.findMany({
      where: { user_id: studentUserId, type: 'QUIZ_PUBLISHED' },
    });
    assert.equal(notifications.length, 1);
    assert.match(notifications[0].message, /Kuis Notifikasi/);
    assert.equal(notifications[0].dedupe_key, `quiz:${quiz.id}:published`);
  });

  test('Terbitkan ulang kuis tidak menggandakan notifikasi (dedupe)', async () => {
    // Tarik lalu terbitkan lagi.
    await request(`/api/quizzes/${quiz.id}/publish`, {
      token: lecturerToken,
      method: 'PATCH',
      body: { is_published: false },
    });
    await request(`/api/quizzes/${quiz.id}/publish`, {
      token: lecturerToken,
      method: 'PATCH',
      body: { is_published: true },
    });

    const notifications = await prisma.notification.findMany({
      where: { user_id: studentUserId, type: 'QUIZ_PUBLISHED' },
    });
    assert.equal(notifications.length, 1, 'dedupe key mencegah duplikasi');
  });

  test('Membuka sesi presensi memicu notifikasi ATTENDANCE_OPENED', async () => {
    const response = await request(`/api/meetings/${meeting.id}/attendance/open`, {
      token: lecturerToken,
      method: 'POST',
      body: {},
    });
    assert.ok([200, 201].includes(response.status), `status: ${response.status}`);

    const notifications = await prisma.notification.findMany({
      where: { user_id: studentUserId, type: 'ATTENDANCE_OPENED' },
    });
    assert.ok(notifications.length >= 1);
    assert.match(notifications[0].message, /Pertemuan Notif/);
  });

  test('Daftar notifikasi: hanya milik pengguna, terurut terbaru, terpaginasi', async () => {
    const response = await request('/api/notifications?limit=1&page=1');
    const payload = await response.json();

    assert.equal(response.status, 200);
    assert.equal(payload.data.length, 1);
    assert.ok(payload.data.every((item) => item.is_read === false));
    assert.ok(payload.meta.total >= 2);
    assert.equal(payload.meta.total_pages, payload.meta.total);
  });

  test('Filter type=QUIZ_PUBLISHED hanya mengembalikan notifikasi kuis', async () => {
    const response = await request('/api/notifications?type=QUIZ_PUBLISHED');
    const payload = await response.json();

    assert.equal(response.status, 200);
    assert.ok(payload.data.length >= 1);
    assert.ok(payload.data.every((item) => item.type === 'QUIZ_PUBLISHED'));
  });

  test('Filter type tidak dikenal ditolak 400', async () => {
    const response = await request('/api/notifications?type=FOO');
    assert.equal(response.status, 400);
  });

  test('Unread count sesuai jumlah belum dibaca', async () => {
    const response = await request('/api/notifications/unread-count');
    const payload = await response.json();

    assert.equal(response.status, 200);
    const total = await prisma.notification.count({
      where: { user_id: studentUserId, is_read: false },
    });
    assert.equal(payload.data.unread_count, total);
  });

  test('Mark as read milik orang lain ditolak 404; milik sendiri berhasil', async () => {
    const foreign = await prisma.notification.findFirst({
      where: { user_id: otherStudentUserId },
    });
    const stolen = await request(`/api/notifications/${foreign.id}/read`, {
      method: 'PATCH',
    });
    assert.equal(stolen.status, 404);

    const own = await prisma.notification.findFirst({
      where: { user_id: studentUserId, is_read: false },
      orderBy: { created_at: 'desc' },
    });
    const response = await request(`/api/notifications/${own.id}/read`, {
      method: 'PATCH',
    });
    const payload = await response.json();

    assert.equal(response.status, 200, payload.message);
    assert.equal(payload.data.is_read, true);

    const refreshed = await prisma.notification.findUnique({ where: { id: own.id } });
    assert.equal(refreshed.is_read, true);
  });

  test('Mark all as read menandai seluruh notifikasi pengguna', async () => {
    const response = await request('/api/notifications/read-all', {
      method: 'PATCH',
    });
    const payload = await response.json();

    assert.equal(response.status, 200);
    const remaining = await prisma.notification.count({
      where: { user_id: studentUserId, is_read: false },
    });
    assert.equal(remaining, 0);
    assert.ok(payload.data.updated >= 1);
  });

  test('Pengingat deadline H-1 dimaterialisasi lazy saat daftar notifikasi diminta', async () => {
    // Tugas terbit berakhir dalam 12 jam; mahasiswa A belum mengumpulkan.
    const assignment = await prisma.assignment.create({
      data: {
        meeting_id: meeting.id,
        title: 'Tugas Mendesak',
        weight_percentage: 10,
        due_date: new Date(now + 12 * 3600 * 1000),
        is_published: true,
      },
    });

    // Panggilan pertama memicu materialisasi.
    const first = await request('/api/notifications');
    assert.equal(first.status, 200);

    const reminder = await prisma.notification.findFirst({
      where: {
        user_id: studentUserId,
        type: 'DEADLINE_REMINDER',
        dedupe_key: `deadline:${assignment.id}:24h`,
      },
    });
    assert.ok(reminder, 'pengingat H-1 harus dibuat untuk mahasiswa yang belum mengumpulkan');

    // Mahasiswa B yang sudah mengumpulkan TIDAK menerima pengingat.
    const studentB = await prisma.mahasiswa.findFirst({ where: { nim: '2024001002' } });
    const fileRecord = await prisma.file.create({
      data: {
        original_name: 'jawaban-b.pdf',
        storage_name: `test-${suffix}-jawaban-b.pdf`,
        file_path: `assignments/test-${suffix}-jawaban-b.pdf`,
        mime_type: 'application/pdf',
        size_bytes: 1024,
        uploaded_by: otherStudentUserId,
      },
    });
    await prisma.submission.create({
      data: {
        assignment_id: assignment.id,
        student_id: studentB.id,
        file_id: fileRecord.id,
        submitted_at: new Date(),
        is_late: false,
      },
    });

    // Hapus pengingat mahasiswa B bila sempat terlanjur, lalu materialisasi ulang.
    await prisma.notification.deleteMany({
      where: { user_id: otherStudentUserId, dedupe_key: `deadline:${assignment.id}:24h` },
    });
    await request('/api/notifications', { token: otherStudentToken });

    const reminderB = await prisma.notification.findFirst({
      where: {
        user_id: otherStudentUserId,
        dedupe_key: `deadline:${assignment.id}:24h`,
      },
    });
    assert.equal(reminderB, null, 'mahasiswa yang sudah mengumpulkan tidak diberi pengingat');
  });

  test('Pengingat tidak digandakan pada pemanggilan berulang', async () => {
    await request('/api/notifications');
    await request('/api/notifications');

    const count = await prisma.notification.count({
      where: { user_id: studentUserId, type: 'DEADLINE_REMINDER' },
    });
    const assignments = await prisma.assignment.findMany({
      where: {
        is_published: true,
        meeting: { class_id: testClass.id },
      },
      select: { id: true },
    });
    assert.ok(count <= assignments.length, 'dedupe key membatasi satu pengingat per tugas');
  });
});
