import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import app from '../src/app.js';
import prisma from '../src/config/prisma.js';
import { cleanupTestArtifacts } from './setup.js';
import { NotificationService } from '../src/modules/notifications/notification.service.js';

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
    // R-09: notifikasi membawa deep-link yang dapat dinavigasi.
    assert.equal(notifications[0].link, `/classes/${testClass.id}/quizzes/${quiz.id}`);
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
    // R-09: deep-link presensi mengikuti konvensi timeline.
    assert.equal(notifications[0].link, `/classes/${testClass.id}/meetings`);
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
    NotificationService.resetDeadlineReminderThrottle();

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
    // R-09: pengingat deadline memuat deep-link ke tugas.
    assert.equal(reminder.link, `/classes/${testClass.id}/assignments/${assignment.id}`);

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
    NotificationService.resetDeadlineReminderThrottle();
    await request('/api/notifications');
    NotificationService.resetDeadlineReminderThrottle();
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

  test('R-03: dosen membuka notifikasi tidak memicu materialisasi pengingat', async () => {
    // Tugas mendesak baru pada kelas yang diampu dosen ini.
    const assignment = await prisma.assignment.create({
      data: {
        meeting_id: meeting.id,
        title: 'Tugas Mendesak R03',
        weight_percentage: 10,
        due_date: new Date(now + 10 * 3600 * 1000),
        is_published: true,
      },
    });

    await prisma.notification.deleteMany({
      where: { user_id: studentUserId, type: 'DEADLINE_REMINDER' },
    });

    // Dosen membuka daftar notifikasi — tidak boleh memicu materialisasi.
    const response = await request('/api/notifications', { token: lecturerToken });
    assert.equal(response.status, 200);

    const reminder = await prisma.notification.findFirst({
      where: { user_id: studentUserId, type: 'DEADLINE_REMINDER' },
    });
    assert.equal(reminder, null, 'dosen tidak boleh memicu pengingat untuk mahasiswa');

    // Admin pun sama.
    await request('/api/notifications', { token: adminToken });
    const reminderAfterAdmin = await prisma.notification.findFirst({
      where: { user_id: studentUserId, type: 'DEADLINE_REMINDER' },
    });
    assert.equal(reminderAfterAdmin, null);
  });

  test('R-03: pengingat hanya untuk kelas yang dienroll mahasiswa (dedupe + throttle)', async () => {
    // Kelas kedua milik dosen lain; mahasiswa A TIDAK ter-enroll di sini.
    const otherLecturer = await prisma.dosen.findFirst({ where: { nidn: '199003202015042001' } });
    const course2 = await prisma.course.create({
      data: { code: `NTFB${suffix}`, name: `Notif Test B ${suffix}`, credits: 2 },
    });
    const class2 = await prisma.class.create({
      data: {
        course_id: course2.id,
        lecturer_id: otherLecturer.id,
        name: `TEST-NTFB-${suffix}`,
        academic_year: '2026/2027',
        semester: 'ganjil',
      },
    });
    const meeting2 = await prisma.meeting.create({
      data: { class_id: class2.id, meeting_number: 1, title: 'Pertemuan Kelas Lain' },
    });
    await prisma.assignment.create({
      data: {
        meeting_id: meeting2.id,
        title: 'Tugas Kelas Lain',
        weight_percentage: 10,
        due_date: new Date(now + 8 * 3600 * 1000),
        is_published: true,
      },
    });

    // Tugas mendesak di kelas yang benar-benar dienroll mahasiswa A.
    await prisma.assignment.create({
      data: {
        meeting_id: meeting.id,
        title: 'Tugas Kelas Sendiri',
        weight_percentage: 10,
        due_date: new Date(now + 9 * 3600 * 1000),
        is_published: true,
      },
    });

    await prisma.notification.deleteMany({
      where: { user_id: studentUserId, type: 'DEADLINE_REMINDER' },
    });
    NotificationService.resetDeadlineReminderThrottle();
    const first = await request('/api/notifications');
    assert.equal(first.status, 200);

    const reminders = await prisma.notification.findMany({
      where: { user_id: studentUserId, type: 'DEADLINE_REMINDER' },
    });
    assert.ok(reminders.length >= 1, 'pengingat untuk kelas sendiri harus dibuat');
    assert.ok(
      reminders.some((item) => item.message.includes('Tugas Kelas Sendiri')),
      'pengingat tugas kelas sendiri ada'
    );
    assert.ok(
      reminders.every((item) => !item.message.includes('Tugas Kelas Lain')),
      'tugas kelas lain tidak boleh bocor ke mahasiswa luar kelas'
    );

    // Dua pemanggilan berurutan: throttle + dedupe tidak menggandakan.
    NotificationService.resetDeadlineReminderThrottle();
    await request('/api/notifications');
    const after = await prisma.notification.count({
      where: { user_id: studentUserId, type: 'DEADLINE_REMINDER' },
    });
    assert.equal(after, reminders.length, 'pemanggilan berulang tidak menambah pengingat');
  });

  test('R-05: regrade 80 → 90 menghasilkan dua notifikasi; skor sama tidak menambah', async () => {
    // Tugas + submission mahasiswa A (dibuat langsung via Prisma).
    const assignment = await prisma.assignment.create({
      data: {
        meeting_id: meeting.id,
        title: 'Tugas Regrade',
        weight_percentage: 20,
        due_date: new Date(now + 48 * 3600 * 1000),
        is_published: true,
      },
    });
    const fileRecord = await prisma.file.create({
      data: {
        original_name: 'regrade.pdf',
        storage_name: `test-${suffix}-regrade.pdf`,
        file_path: `assignments/test-${suffix}-regrade.pdf`,
        mime_type: 'application/pdf',
        size_bytes: 1024,
        uploaded_by: studentUserId,
      },
    });
    const submission = await prisma.submission.create({
      data: {
        assignment_id: assignment.id,
        student_id: (await prisma.mahasiswa.findFirst({ where: { nim: '2024001001' } })).id,
        file_id: fileRecord.id,
        submitted_at: new Date(),
        is_late: false,
      },
    });

    const grade = (score) =>
      request(`/api/submissions/${submission.id}/grade`, {
        token: lecturerToken,
        method: 'PUT',
        body: { score },
      });

    // Penilaian pertama: satu notifikasi dengan skor 80.
    const first = await grade(80);
    assert.equal(first.status, 200, (await first.json()).message);
    const afterFirst = await prisma.notification.findMany({
      where: { user_id: studentUserId, type: 'GRADE_PUBLISHED' },
    });
    assert.equal(afterFirst.length, 1);
    assert.match(afterFirst[0].message, /80/);
    // R-09: notifikasi nilai memuat deep-link ke tugas terkait.
    assert.equal(afterFirst[0].link, `/classes/${testClass.id}/assignments/${assignment.id}`);

    // Regrade 80 → 90: notifikasi kedua dengan skor baru.
    const second = await grade(90);
    assert.equal(second.status, 200);
    const afterSecond = await prisma.notification.findMany({
      where: { user_id: studentUserId, type: 'GRADE_PUBLISHED' },
    });
    assert.equal(afterSecond.length, 2, 'regrade harus menghasilkan notifikasi kedua');
    assert.ok(
      afterSecond.some((item) => item.message.includes('90 / 100')),
      'notifikasi kedua memuat skor 90'
    );

    // Simpan skor yang sama: tidak ada notifikasi baru.
    const third = await grade(90);
    assert.equal(third.status, 200);
    const afterThird = await prisma.notification.count({
      where: { user_id: studentUserId, type: 'GRADE_PUBLISHED' },
    });
    assert.equal(afterThird, 2, 'skor tidak berubah tidak boleh menambah notifikasi');
  });

  test('R-05: koreksi presensi HADIR → IZIN → ALPA menghasilkan dua notifikasi', async () => {
    const session = await prisma.attendanceSession.findFirst({
      where: { meeting_id: meeting.id },
    });
    assert.ok(session, 'sesi presensi harus sudah dibuka oleh tes sebelumnya');

    const studentA = await prisma.mahasiswa.findFirst({ where: { nim: '2024001001' } });
    const record = await prisma.attendanceRecord.create({
      data: {
        session_id: session.id,
        student_id: studentA.id,
        status: 'HADIR',
        is_auto_generated: false,
      },
    });

    const updateStatus = (status) =>
      request(`/api/attendance/records/${record.id}`, {
        token: lecturerToken,
        method: 'PUT',
        body: { status },
      });

    // Koreksi pertama HADIR → IZIN: satu notifikasi.
    const first = await updateStatus('IZIN');
    assert.equal(first.status, 200, (await first.json()).message);
    const afterFirst = await prisma.notification.findMany({
      where: { user_id: studentUserId, type: 'ATTENDANCE_UPDATED' },
    });
    assert.equal(afterFirst.length, 1);
    assert.match(afterFirst[0].message, /IZIN/);

    // Koreksi kedua IZIN → ALPA: notifikasi kedua (dedupe statis tidak boleh
    // membungkam koreksi berikutnya).
    const second = await updateStatus('ALPA');
    assert.equal(second.status, 200);
    const afterSecond = await prisma.notification.findMany({
      where: { user_id: studentUserId, type: 'ATTENDANCE_UPDATED' },
    });
    assert.equal(afterSecond.length, 2, 'koreksi kedua harus menghasilkan notifikasi');
    assert.ok(afterSecond.some((item) => /ALPA/.test(item.message)));
    // R-09: koreksi presensi juga membawa deep-link.
    assert.ok(afterSecond.every((item) => item.link === `/classes/${testClass.id}/meetings`));
  });

  test('R-07: notifikasi enrollment memuat nama mata kuliah, bukan kode', async () => {
    // Kelas baru dengan nama mata kuliah yang berbeda dari kodenya.
    const admin = await prisma.user.findUnique({ where: { username: 'admin' } });
    const lecturer = await prisma.dosen.findFirst({ where: { nidn: '198501152010121002' } });
    const studentA = await prisma.mahasiswa.findFirst({ where: { nim: '2024001001' } });

    const courseNew = await prisma.course.create({
      data: { code: `ENR${suffix}`, name: `Rekayasa Perangkat Lunak ${suffix}`, credits: 3 },
    });
    const classNew = await prisma.class.create({
      data: {
        course_id: courseNew.id,
        lecturer_id: lecturer.id,
        name: `TEST-ENR-${suffix}`,
        academic_year: '2026/2027',
        semester: 'ganjil',
      },
    });

    await prisma.notification.deleteMany({
      where: { user_id: studentUserId, type: 'ENROLLMENT_CREATED' },
    });

    const response = await request('/api/admin/enrollments', {
      token: adminToken,
      method: 'POST',
      body: { class_id: classNew.id, student_id: studentA.id },
    });
    assert.ok([200, 201].includes(response.status), (await response.json()).message);

    const notifications = await prisma.notification.findMany({
      where: { user_id: studentUserId, type: 'ENROLLMENT_CREATED' },
    });
    assert.equal(notifications.length, 1, 'satu notifikasi enrollment terkirim');

    const message = notifications[0].message;
    assert.ok(
      message.includes(`Rekayasa Perangkat Lunak ${suffix}`),
      `pesan memuat nama mata kuliah: ${message}`
    );
    assert.ok(!message.includes(`(ENR${suffix})`), 'kode tidak menggantikan nama mata kuliah');
    assert.ok(message.includes(`TEST-ENR-${suffix}`), 'pesan memuat nama kelas');

    // R-09: deep-link ke halaman kelas.
    assert.equal(notifications[0].link, `/classes/${classNew.id}`);
  });
});
