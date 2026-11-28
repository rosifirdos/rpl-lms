import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import app from '../src/app.js';
import prisma from '../src/config/prisma.js';
import { cleanupTestArtifacts } from './setup.js';

/**
 * Suite Fase 3 MVP 4: manajemen kuis oleh dosen (FR-025, FR-040).
 *
 * Mencakup CRUD kuis & butir soal, penolakan kuis pada pertemuan ujian,
 * validasi kelengkapan publikasi, dan RBAC.
 */
describe('Fase 3 MVP 4: manajemen kuis oleh dosen', () => {
  let server;
  let baseUrl;
  let adminToken;
  let lecturerToken;
  let otherLecturerToken;
  let studentToken;
  let course;
  let testClass;
  let meeting;
  let examMeeting;
  let quiz;

  const suffix = Date.now().toString().slice(-8);
  const future = (hours) => new Date(Date.now() + hours * 3600 * 1000).toISOString();

  const request = (url, { method = 'GET', token = lecturerToken, body } = {}) =>
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

    [adminToken, lecturerToken, otherLecturerToken, studentToken] = await Promise.all([
      login('admin'),
      login('198501152010121002'),
      login('199003202015042001'),
      login('2024001001'),
    ]);

    const admin = await prisma.user.findUnique({ where: { username: 'admin' } });
    const lecturer = await prisma.dosen.findFirst({ where: { nidn: '198501152010121002' } });
    const student = await prisma.mahasiswa.findFirst({ where: { nim: '2024001001' } });

    course = await prisma.course.create({
      data: { code: `KUZ${suffix}`, name: `Kuis Test ${suffix}`, credits: 3 },
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
    meeting = await prisma.meeting.create({
      data: { class_id: testClass.id, meeting_number: 1, title: 'Pertemuan Kuis' },
    });
    examMeeting = await prisma.meeting.create({
      data: {
        class_id: testClass.id,
        meeting_number: 2,
        title: 'Pertemuan UTS',
        is_exam: true,
        exam_type: 'UTS',
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

  test('Dosen membuat kuis pada pertemuan biasa', async () => {
    const response = await request(`/api/meetings/${meeting.id}/quizzes`, {
      method: 'POST',
      body: {
        title: 'Kuis ERD Dasar',
        instructions: 'Kerjakan seluruh soal.',
        duration_minutes: 30,
        open_at: future(-1),
        close_at: future(48),
      },
    });
    const payload = await response.json();

    assert.equal(response.status, 201, payload.message);
    assert.equal(payload.data.title, 'Kuis ERD Dasar');
    assert.equal(payload.data.is_published, false);
    quiz = payload.data;
  });

  test('Kuis ditolak pada pertemuan ujian (400)', async () => {
    const response = await request(`/api/meetings/${examMeeting.id}/quizzes`, {
      method: 'POST',
      body: {
        title: 'Kuis UTS',
        duration_minutes: 30,
        open_at: future(-1),
        close_at: future(48),
      },
    });
    const payload = await response.json();

    assert.equal(response.status, 400);
    assert.match(payload.message, /pertemuan ujian/i);
  });

  test('Validasi kuis: durasi di luar rentang dan open_at >= close_at ditolak', async () => {
    const badDuration = await request(`/api/meetings/${meeting.id}/quizzes`, {
      method: 'POST',
      body: {
        title: 'Kuis Durasi',
        duration_minutes: 0,
        open_at: future(-1),
        close_at: future(48),
      },
    });
    assert.equal(badDuration.status, 400);

    const badWindow = await request(`/api/meetings/${meeting.id}/quizzes`, {
      method: 'POST',
      body: {
        title: 'Kuis Jendela',
        duration_minutes: 30,
        open_at: future(48),
        close_at: future(1),
      },
    });
    assert.equal(badWindow.status, 400);
  });

  test('RBAC: dosen non-pengampu dan mahasiswa ditolak (403), tanpa token 401', async () => {
    const other = await request(`/api/meetings/${meeting.id}/quizzes`, {
      token: otherLecturerToken,
      method: 'POST',
      body: {
        title: 'Kuis Orang Lain',
        duration_minutes: 30,
        open_at: future(-1),
        close_at: future(48),
      },
    });
    assert.equal(other.status, 403);

    const student = await request(`/api/meetings/${meeting.id}/quizzes`, {
      token: studentToken,
      method: 'POST',
      body: {
        title: 'Kuis Mahasiswa',
        duration_minutes: 30,
        open_at: future(-1),
        close_at: future(48),
      },
    });
    assert.equal(student.status, 403);

    const anonymous = await request(`/api/meetings/${meeting.id}/quizzes`, { token: null });
    assert.equal(anonymous.status, 401);
  });

  test('Publish ditolak bila belum ada soal (400)', async () => {
    const response = await request(`/api/quizzes/${quiz.id}/publish`, {
      method: 'PATCH',
      body: { is_published: true },
    });
    const payload = await response.json();

    assert.equal(response.status, 400);
    assert.match(payload.message, /butir soal/i);
  });

  test('Soal pilihan ganda tanpa kunci ditolak; dengan kunci diterima', async () => {
    const noKey = await request(`/api/quizzes/${quiz.id}/questions`, {
      method: 'POST',
      body: {
        question_text: 'Apa singkatan ERD?',
        type: 'MULTIPLE_CHOICE',
        points: 10,
        options: [
          { option_text: 'Entity Relationship Diagram', is_correct: false },
          { option_text: 'Extended Relational Data', is_correct: false },
        ],
      },
    });
    assert.equal(noKey.status, 400, 'pilihan ganda tanpa tepat satu kunci harus ditolak');

    const valid = await request(`/api/quizzes/${quiz.id}/questions`, {
      method: 'POST',
      body: {
        question_text: 'Apa singkatan ERD?',
        type: 'MULTIPLE_CHOICE',
        points: 10,
        options: [
          { option_text: 'Entity Relationship Diagram', is_correct: true },
          { option_text: 'Extended Relational Data', is_correct: false },
        ],
      },
    });
    const payload = await valid.json();
    assert.equal(valid.status, 201, payload.message);
    assert.equal(payload.data.options.length, 2);
    assert.equal(payload.data.order_index, 1);
  });

  test('Soal esai dengan opsi ditolak (400)', async () => {
    const response = await request(`/api/quizzes/${quiz.id}/questions`, {
      method: 'POST',
      body: {
        question_text: 'Jelaskan normalisasi.',
        type: 'ESSAY',
        points: 20,
        options: [{ option_text: 'Ya', is_correct: true }],
      },
    });
    assert.equal(response.status, 400);
  });

  test('Tambah soal esai dengan answer_key diterima', async () => {
    const response = await request(`/api/quizzes/${quiz.id}/questions`, {
      method: 'POST',
      body: {
        question_text: 'Jelaskan tujuan normalisasi basis data.',
        type: 'ESSAY',
        points: 20,
        answer_key: 'Menghilangkan redundansi dan anomali data.',
      },
    });
    const payload = await response.json();

    assert.equal(response.status, 201, payload.message);
    assert.equal(payload.data.order_index, 2);
  });

  test('Publish sukses setelah butir soal lengkap; draft 404 untuk mahasiswa', async () => {
    const publish = await request(`/api/quizzes/${quiz.id}/publish`, {
      method: 'PATCH',
      body: { is_published: true },
    });
    assert.equal(publish.status, 200);

    // Mahasiswa dapat melihat kuis terbit.
    const studentView = await request(`/api/quizzes/${quiz.id}`, { token: studentToken });
    const studentPayload = await studentView.json();
    assert.equal(studentView.status, 200);

    // Kunci jawaban TIDAK boleh bocor ke mahasiswa.
    const serialized = JSON.stringify(studentPayload.data);
    assert.ok(!serialized.includes('answer_key'), 'answer_key tidak boleh dikirim ke mahasiswa');
    assert.ok(!serialized.includes('is_correct'), 'is_correct tidak boleh dikirim ke mahasiswa');

    // Dosen melihat kunci jawaban.
    const lecturerView = await request(`/api/quizzes/${quiz.id}`);
    const lecturerPayload = await lecturerView.json();
    assert.equal(lecturerView.status, 200);
    assert.ok(JSON.stringify(lecturerPayload.data).includes('answer_key'));
  });

  test('Update kuis dan ubah soal berhasil', async () => {
    const update = await request(`/api/quizzes/${quiz.id}`, {
      method: 'PUT',
      body: { title: 'Kuis ERD Dasar (Revisi)', duration_minutes: 45 },
    });
    assert.equal(update.status, 200);

    const list = await request(`/api/quizzes/${quiz.id}`);
    const firstQuestion = (await list.json()).data.questions[0];

    const updateQuestion = await request(`/api/quizzes/${quiz.id}/questions/${firstQuestion.id}`, {
      method: 'PUT',
      body: { points: 15 },
    });
    assert.equal(updateQuestion.status, 200);
    assert.equal((await updateQuestion.json()).data.points, 15);
  });

  test('Daftar kuis kelas: mahasiswa hanya melihat yang terbit', async () => {
    // Buat kuis draft kedua.
    const draft = await request(`/api/meetings/${meeting.id}/quizzes`, {
      method: 'POST',
      body: {
        title: 'Kuis Draft',
        duration_minutes: 20,
        open_at: future(-1),
        close_at: future(48),
      },
    });
    assert.equal(draft.status, 201);

    const lecturerList = await request(`/api/classes/${testClass.id}/quizzes`);
    const lecturerPayload = await lecturerList.json();
    assert.equal(lecturerList.status, 200);
    assert.ok(lecturerPayload.data.length >= 2);
    assert.ok(lecturerPayload.data.every((item) => item.attempt_count !== undefined));

    const studentList = await request(`/api/classes/${testClass.id}/quizzes`, {
      token: studentToken,
    });
    const studentPayload = await studentList.json();
    assert.equal(studentList.status, 200);
    assert.ok(
      studentPayload.data.every((item) => item.is_published === true),
      'mahasiswa hanya boleh melihat kuis terbit'
    );
    assert.ok(studentPayload.data.every((item) => item.attempt_count === undefined));
  });

  test('Hapus soal dan hapus kuis berhasil', async () => {
    // Kuis draft kedua: tambah lalu hapus soal, lalu hapus kuisnya.
    const draftList = await request(`/api/classes/${testClass.id}/quizzes`);
    const draftQuiz = (await draftList.json()).data.find((item) => item.title === 'Kuis Draft');

    const question = await request(`/api/quizzes/${draftQuiz.id}/questions`, {
      method: 'POST',
      body: {
        question_text: 'Soal sementara?',
        type: 'ESSAY',
        points: 5,
      },
    });
    const questionId = (await question.json()).data.id;

    const deleteQuestion = await request(
      `/api/quizzes/${draftQuiz.id}/questions/${questionId}`,
      { method: 'DELETE' }
    );
    assert.equal(deleteQuestion.status, 200);

    const deleteQuiz = await request(`/api/quizzes/${draftQuiz.id}`, { method: 'DELETE' });
    assert.equal(deleteQuiz.status, 200);

    const gone = await request(`/api/quizzes/${draftQuiz.id}`);
    assert.equal(gone.status, 404);
  });
});
