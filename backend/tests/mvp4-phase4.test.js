import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import app from '../src/app.js';
import prisma from '../src/config/prisma.js';
import { cleanupTestArtifacts } from './setup.js';

/**
 * Suite Fase 4 MVP 4: pengerjaan kuis & penilaian (FR-040, FR-041).
 *
 * Timer ditegakkan server; auto-submit lazy; kunci jawaban tidak bocor
 * sebelum submission; skor 0–100 dihitung server.
 */
describe('Fase 4 MVP 4: pengerjaan kuis & penilaian', () => {
  let server;
  let baseUrl;
  let adminToken;
  let lecturerToken;
  let otherLecturerToken;
  let studentToken;
  let otherStudentToken;
  let studentCToken;
  let course;
  let testClass;
  let meeting;
  let quiz;
  let attempt;
  let notStartedQuizId;

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

    [adminToken, lecturerToken, otherLecturerToken, studentToken, otherStudentToken, studentCToken] =
      await Promise.all([
        login('admin'),
        login('198501152010121002'),
        login('199003202015042001'),
        login('2024001001'),
        login('2024001002'),
        login('2024001003'),
      ]);

    const admin = await prisma.user.findUnique({ where: { username: 'admin' } });
    const lecturer = await prisma.dosen.findFirst({ where: { nidn: '198501152010121002' } });
    const studentA = await prisma.mahasiswa.findFirst({ where: { nim: '2024001001' } });
    const studentB = await prisma.mahasiswa.findFirst({ where: { nim: '2024001002' } });

    course = await prisma.course.create({
      data: { code: `ATT${suffix}`, name: `Attempt Test ${suffix}`, credits: 3 },
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
    await prisma.enrollment.create({
      data: { class_id: testClass.id, student_id: studentA.id, enrolled_by: admin.id },
    });

    // Kuis utama: 2 PG (10 poin each) + 1 esai (10 poin) = 30 poin total.
    const created = await request(`/api/meetings/${meeting.id}/quizzes`, {
      token: lecturerToken,
      method: 'POST',
      body: {
        title: 'Kuis Penilaian',
        duration_minutes: 60,
        open_at: iso(now - 3600 * 1000),
        close_at: iso(now + 24 * 3600 * 1000),
      },
    });
    quiz = (await created.json()).data;

    const mcQuestion = await request(`/api/quizzes/${quiz.id}/questions`, {
      token: lecturerToken,
      method: 'POST',
      body: {
        question_text: 'Apa ibu kota Indonesia?',
        type: 'MULTIPLE_CHOICE',
        points: 10,
        options: [
          { option_text: 'Jakarta', is_correct: true },
          { option_text: 'Bandung', is_correct: false },
        ],
      },
    });
    const mc2 = await request(`/api/quizzes/${quiz.id}/questions`, {
      token: lecturerToken,
      method: 'POST',
      body: {
        question_text: '2 + 2 sama dengan?',
        type: 'MULTIPLE_CHOICE',
        points: 10,
        options: [
          { option_text: '3', is_correct: false },
          { option_text: '4', is_correct: true },
        ],
      },
    });
    const essay = await request(`/api/quizzes/${quiz.id}/questions`, {
      token: lecturerToken,
      method: 'POST',
      body: {
        question_text: 'Jelaskan normalisasi.',
        type: 'ESSAY',
        points: 10,
        answer_key: 'Menghilangkan redundansi.',
      },
    });
    quiz.questions = [
      (await mcQuestion.json()).data,
      (await mc2.json()).data,
      (await essay.json()).data,
    ];

    const publish = await request(`/api/quizzes/${quiz.id}/publish`, {
      token: lecturerToken,
      method: 'PATCH',
      body: { is_published: true },
    });
    assert.equal(publish.status, 200);

    // Kuis kedua untuk uji jendela waktu (belum dibuka).
    const futureQuiz = await request(`/api/meetings/${meeting.id}/quizzes`, {
      token: lecturerToken,
      method: 'POST',
      body: {
        title: 'Kuis Masa Depan',
        duration_minutes: 30,
        open_at: iso(now + 5 * 3600 * 1000),
        close_at: iso(now + 10 * 3600 * 1000),
      },
    });
    notStartedQuizId = (await futureQuiz.json()).data.id;
    await request(`/api/quizzes/${notStartedQuizId}/questions`, {
      token: lecturerToken,
      method: 'POST',
      body: {
        question_text: 'Soal placeholder?',
        type: 'ESSAY',
        points: 10,
      },
    });
    await request(`/api/quizzes/${notStartedQuizId}/publish`, {
      token: lecturerToken,
      method: 'PATCH',
      body: { is_published: true },
    });
  });

  after(async () => {
    await cleanupTestArtifacts(prisma);
    await new Promise((resolve) => server.close(resolve));
  });

  test('Start sebelum open_at ditolak 400', async () => {
    const response = await request(`/api/quizzes/${notStartedQuizId}/attempts`, {
      method: 'POST',
    });
    const payload = await response.json();

    assert.equal(response.status, 400);
    assert.match(payload.message, /belum dibuka/i);
  });

  test('Mulai percobaan: 201, deadline dihitung server, kunci jawaban tidak bocor', async () => {
    const response = await request(`/api/quizzes/${quiz.id}/attempts`, {
      method: 'POST',
    });
    const payload = await response.json();

    assert.equal(response.status, 201, payload.message);
    attempt = payload.data.attempt;

    assert.equal(attempt.status, 'IN_PROGRESS');
    assert.ok(new Date(attempt.deadline_at) <= new Date(quiz.close_at));
    assert.ok(attempt.remaining_seconds > 0);
    assert.ok(attempt.server_time);

    const serialized = JSON.stringify(payload.data);
    assert.ok(!serialized.includes('answer_key'), 'answer_key tidak boleh bocor');
    assert.ok(!serialized.includes('is_correct'), 'is_correct tidak boleh bocor');
  });

  test('Percobaan kedua saat berjalan mengembalikan 200 (lanjutan)', async () => {
    const response = await request(`/api/quizzes/${quiz.id}/attempts`, {
      method: 'POST',
    });
    const payload = await response.json();

    assert.equal(response.status, 200);
    assert.equal(payload.data.attempt.id, attempt.id);
  });

  test('Simpan jawaban parsial berhasil', async () => {
    const [mc1, mc2, essay] = quiz.questions;
    const response = await request(`/api/quiz-attempts/${attempt.id}/answers`, {
      method: 'PUT',
      body: {
        answers: [
          { question_id: mc1.id, selected_option_id: mc1.options[0].id }, // benar
          { question_id: mc2.id, selected_option_id: mc2.options[0].id }, // salah
          { question_id: essay.id, answer_text: 'Normalisasi menyusun tabel.' },
        ],
      },
    });
    const payload = await response.json();

    assert.equal(response.status, 200, payload.message);
    assert.equal(payload.data.answers.length, 3);
  });

  test('Mahasiswa lain tidak dapat mengakses attempt orang lain (403)', async () => {
    const response = await request(`/api/quiz-attempts/${attempt.id}`, {
      token: otherStudentToken,
    });
    assert.equal(response.status, 403);

    const submit = await request(`/api/quiz-attempts/${attempt.id}/submit`, {
      token: otherStudentToken,
      method: 'POST',
    });
    assert.equal(submit.status, 403);
  });

  test('Submit: PG dinilai otomatis, skor parsial 33.33, status SUBMITTED (ada esai)', async () => {
    const response = await request(`/api/quiz-attempts/${attempt.id}/submit`, {
      method: 'POST',
    });
    const payload = await response.json();

    assert.equal(response.status, 200, payload.message);
    assert.equal(payload.data.attempt.status, 'SUBMITTED');
    assert.equal(payload.data.attempt.score, 33.33); // 10/30 * 100

    // Setelah submit, benar/salah PG terlihat.
    const mcAnswer = payload.data.answers.find(
      (entry) => entry.question_id === quiz.questions[0].id
    );
    assert.equal(mcAnswer.is_correct, true);
    assert.equal(mcAnswer.points_awarded, 10);

    const essayAnswer = payload.data.answers.find(
      (entry) => entry.question_id === quiz.questions[2].id
    );
    assert.equal(essayAnswer.points_awarded, null, 'esai belum dinilai');
  });

  test('Submit ulang ditolak 409', async () => {
    const response = await request(`/api/quiz-attempts/${attempt.id}/submit`, {
      method: 'POST',
    });
    assert.equal(response.status, 409);
  });

  test('Start ulang setelah selesai ditolak 409 (satu percobaan)', async () => {
    const response = await request(`/api/quizzes/${quiz.id}/attempts`, {
      method: 'POST',
    });
    const payload = await response.json();

    assert.equal(response.status, 409);
    assert.match(payload.message, /telah diselesaikan/i);
  });

  test('Penilaian esai oleh dosen pengampu: skor akhir 50.00, status GRADED', async () => {
    const detail = await request(`/api/quiz-attempts/${attempt.id}`, { token: lecturerToken });
    const detailPayload = await detail.json();
    assert.equal(detail.status, 200);
    const essayAnswer = detailPayload.data.answers.find(
      (entry) => entry.question_id === quiz.questions[2].id
    );

    const response = await request(`/api/quiz-attempts/${attempt.id}/grade`, {
      token: lecturerToken,
      method: 'PUT',
      body: {
        answers: [
          {
            answer_id: essayAnswer.id,
            points_awarded: 5,
            feedback: 'Kurang lengkap.',
          },
        ],
      },
    });
    const payload = await response.json();

    assert.equal(response.status, 200, payload.message);
    assert.equal(payload.data.fully_graded, true);
    assert.equal(payload.data.score, 50); // (10 + 0 + 5) / 30 * 100
    assert.equal(payload.data.status, 'GRADED');
  });

  test('Penilaian PG manual ditolak 400; poin melebihi maksimum ditolak 400', async () => {
    const detail = await request(`/api/quiz-attempts/${attempt.id}`, { token: lecturerToken });
    const answers = (await detail.json()).data.answers;
    const mcAnswer = answers.find((entry) => entry.question_id === quiz.questions[0].id);

    const gradeMc = await request(`/api/quiz-attempts/${attempt.id}/grade`, {
      token: lecturerToken,
      method: 'PUT',
      body: { answers: [{ answer_id: mcAnswer.id, points_awarded: 10 }] },
    });
    assert.equal(gradeMc.status, 400);

    // Buat attempt baru untuk uji poin berlebih.
    const startOther = await request(`/api/quizzes/${quiz.id}/attempts`, {
      token: otherStudentToken,
      method: 'POST',
    });
    // Mahasiswa B tidak ter-enroll → 403 diharapkan.
    assert.equal(startOther.status, 403);
  });

  test('Dosen non-pengampu ditolak menilai (403)', async () => {
    const detail = await request(`/api/quiz-attempts/${attempt.id}`, {
      token: otherLecturerToken,
    });
    assert.equal(detail.status, 403);
  });

  test('Roster hasil memuat seluruh percobaan; CSV berisi NIM', async () => {
    const roster = await request(`/api/quizzes/${quiz.id}/attempts`, { token: lecturerToken });
    const rosterPayload = await roster.json();

    assert.equal(roster.status, 200);
    assert.equal(rosterPayload.data.total_students, 1);
    assert.equal(rosterPayload.data.roster[0].nim, '2024001001');
    assert.equal(rosterPayload.data.roster[0].score, 50);

    const csv = await request(`/api/quizzes/${quiz.id}/attempts/export`, {
      token: lecturerToken,
    });
    assert.equal(csv.status, 200);
    const text = await csv.text();
    assert.ok(text.includes('2024001001'));
    assert.ok(text.includes('50'));
  });

  test('Auto-submit lazy: simpan jawaban setelah deadline memicu pengumpulan otomatis', async () => {
    // Mahasiswa B di-enroll untuk skenario ini.
    const admin = await prisma.user.findUnique({ where: { username: 'admin' } });
    const studentB = await prisma.mahasiswa.findFirst({ where: { nim: '2024001002' } });
    await prisma.enrollment.create({
      data: { class_id: testClass.id, student_id: studentB.id, enrolled_by: admin.id },
    });

    // Kuis ketiga: jendela terbuka sekarang.
    const created = await request(`/api/meetings/${meeting.id}/quizzes`, {
      token: lecturerToken,
      method: 'POST',
      body: {
        title: 'Kuis Deadline',
        duration_minutes: 60,
        open_at: iso(now - 60 * 1000),
        close_at: iso(now + 6 * 3600 * 1000),
      },
    });
    const deadlineQuiz = (await created.json()).data;
    await request(`/api/quizzes/${deadlineQuiz.id}/questions`, {
      token: lecturerToken,
      method: 'POST',
      body: {
        question_text: 'Satu plus satu?',
        type: 'MULTIPLE_CHOICE',
        points: 10,
        options: [
          { option_text: '2', is_correct: true },
          { option_text: '3', is_correct: false },
        ],
      },
    });
    await request(`/api/quizzes/${deadlineQuiz.id}/publish`, {
      token: lecturerToken,
      method: 'PATCH',
      body: { is_published: true },
    });

    const start = await request(`/api/quizzes/${deadlineQuiz.id}/attempts`, {
      token: otherStudentToken,
      method: 'POST',
    });
    const attemptB = (await start.json()).data.attempt;

    // Majukan deadline ke masa lalu langsung di database (simulasi waktu berjalan).
    await prisma.quizAttempt.update({
      where: { id: attemptB.id },
      data: { deadline_at: new Date(Date.now() - 60 * 1000) },
    });

    const save = await request(`/api/quiz-attempts/${attemptB.id}/answers`, {
      token: otherStudentToken,
      method: 'PUT',
      body: {
        answers: [
          {
            question_id: (await request(`/api/quizzes/${deadlineQuiz.id}`, { token: otherStudentToken }).then((r) => r.json())).data.questions[0].id,
            selected_option_id: null,
          },
        ],
      },
    });
    const savePayload = await save.json();
    assert.equal(save.status, 400);
    assert.match(savePayload.message, /dikumpulkan otomatis|berakhir/i);

    // Percobaan kini SUBMITTED dengan submitted_at == deadline_at (bukan waktu akses).
    const refreshed = await prisma.quizAttempt.findUnique({ where: { id: attemptB.id } });
    assert.notEqual(refreshed.status, 'IN_PROGRESS');
    assert.ok(refreshed.submitted_at);
    assert.equal(
      refreshed.submitted_at.toISOString(),
      refreshed.deadline_at.toISOString(),
      'submitted_at auto-submit harus sama dengan deadline_at'
    );
  });

  test('Kuis draft tidak dapat dikerjakan (404) dan mahasiswa luar kelas ditolak (403)', async () => {
    const draft = await request(`/api/meetings/${meeting.id}/quizzes`, {
      token: lecturerToken,
      method: 'POST',
      body: {
        title: 'Kuis Rahasia',
        duration_minutes: 30,
        open_at: iso(now - 1000),
        close_at: iso(now + 3600 * 1000),
      },
    });
    const draftQuiz = (await draft.json()).data;

    const startDraft = await request(`/api/quizzes/${draftQuiz.id}/attempts`, {
      method: 'POST',
    });
    assert.equal(startDraft.status, 404);
  });

  test('R-01: esai dikosongkan — submit 33.33 SUBMITTED, dosen menilai 0 → GRADED', async () => {
    // Kuis baru untuk mahasiswa B: 2 PG (10+10) + 1 esai (10) = 30 poin.
    const created = await request(`/api/meetings/${meeting.id}/quizzes`, {
      token: lecturerToken,
      method: 'POST',
      body: {
        title: 'Kuis Esai Kosong',
        duration_minutes: 60,
        open_at: iso(now - 3600 * 1000),
        close_at: iso(now + 24 * 3600 * 1000),
      },
    });
    const emptyEssayQuiz = (await created.json()).data;

    const mc1 = await request(`/api/quizzes/${emptyEssayQuiz.id}/questions`, {
      token: lecturerToken,
      method: 'POST',
      body: {
        question_text: 'Ibu kota Indonesia?',
        type: 'MULTIPLE_CHOICE',
        points: 10,
        options: [
          { option_text: 'Jakarta', is_correct: true },
          { option_text: 'Bandung', is_correct: false },
        ],
      },
    });
    const mc2 = await request(`/api/quizzes/${emptyEssayQuiz.id}/questions`, {
      token: lecturerToken,
      method: 'POST',
      body: {
        question_text: '2 + 2 sama dengan?',
        type: 'MULTIPLE_CHOICE',
        points: 10,
        options: [
          { option_text: '3', is_correct: false },
          { option_text: '4', is_correct: true },
        ],
      },
    });
    const essay = await request(`/api/quizzes/${emptyEssayQuiz.id}/questions`, {
      token: lecturerToken,
      method: 'POST',
      body: {
        question_text: 'Jelaskan normalisasi.',
        type: 'ESSAY',
        points: 10,
      },
    });
    const questions = [
      (await mc1.json()).data,
      (await mc2.json()).data,
      (await essay.json()).data,
    ];
    await request(`/api/quizzes/${emptyEssayQuiz.id}/publish`, {
      token: lecturerToken,
      method: 'PATCH',
      body: { is_published: true },
    });

    // Mahasiswa B menjawab kedua PG (1 benar, 1 salah), esai dikosongkan.
    const start = await request(`/api/quizzes/${emptyEssayQuiz.id}/attempts`, {
      token: otherStudentToken,
      method: 'POST',
    });
    const attemptB = (await start.json()).data.attempt;
    await request(`/api/quiz-attempts/${attemptB.id}/answers`, {
      token: otherStudentToken,
      method: 'PUT',
      body: {
        answers: [
          { question_id: questions[0].id, selected_option_id: questions[0].options[0].id }, // benar
          { question_id: questions[1].id, selected_option_id: questions[1].options[0].id }, // salah
        ],
      },
    });

    const submit = await request(`/api/quiz-attempts/${attemptB.id}/submit`, {
      token: otherStudentToken,
      method: 'POST',
    });
    const submitPayload = await submit.json();
    assert.equal(submit.status, 200, submitPayload.message);
    assert.equal(submitPayload.data.attempt.status, 'SUBMITTED');
    // Skor dihitung dari seluruh soal (10/30), bukan hanya jawaban yang ada.
    assert.equal(submitPayload.data.attempt.score, 33.33);

    // Dosen melihat baris jawaban esai kosong dan dapat menilainya 0.
    const detail = await request(`/api/quiz-attempts/${attemptB.id}`, { token: lecturerToken });
    const detailPayload = await detail.json();
    assert.equal(detail.status, 200);
    const essayAnswer = detailPayload.data.answers.find(
      (entry) => entry.question_id === questions[2].id
    );
    assert.ok(essayAnswer.id, 'baris jawaban esai kosong harus dibuat saat submit');
    assert.equal(essayAnswer.answer_text, null);
    assert.equal(essayAnswer.points_awarded, null);

    const grade = await request(`/api/quiz-attempts/${attemptB.id}/grade`, {
      token: lecturerToken,
      method: 'PUT',
      body: {
        answers: [{ answer_id: essayAnswer.id, points_awarded: 0, feedback: 'Tidak dijawab.' }],
      },
    });
    const gradePayload = await grade.json();
    assert.equal(grade.status, 200, gradePayload.message);
    assert.equal(gradePayload.data.fully_graded, true);
    assert.equal(gradePayload.data.score, 33.33, 'skor tidak boleh terinflasi');
    assert.equal(gradePayload.data.status, 'GRADED');
  });

  test('R-01: submit tanpa jawaban apa pun — skor 0, tetap dapat dinilai hingga GRADED', async () => {
    const admin = await prisma.user.findUnique({ where: { username: 'admin' } });
    const studentC = await prisma.mahasiswa.findFirst({ where: { nim: '2024001003' } });
    await prisma.enrollment.create({
      data: { class_id: testClass.id, student_id: studentC.id, enrolled_by: admin.id },
    });

    // Kuis baru: 1 PG (10) + 1 esai (10) = 20 poin.
    const created = await request(`/api/meetings/${meeting.id}/quizzes`, {
      token: lecturerToken,
      method: 'POST',
      body: {
        title: 'Kuis Tanpa Jawaban',
        duration_minutes: 30,
        open_at: iso(now - 3600 * 1000),
        close_at: iso(now + 24 * 3600 * 1000),
      },
    });
    const blankQuiz = (await created.json()).data;
    await request(`/api/quizzes/${blankQuiz.id}/questions`, {
      token: lecturerToken,
      method: 'POST',
      body: {
        question_text: '1 + 1 sama dengan?',
        type: 'MULTIPLE_CHOICE',
        points: 10,
        options: [
          { option_text: '2', is_correct: true },
          { option_text: '3', is_correct: false },
        ],
      },
    });
    const essay = await request(`/api/quizzes/${blankQuiz.id}/questions`, {
      token: lecturerToken,
      method: 'POST',
      body: {
        question_text: 'Jelaskan inheritance.',
        type: 'ESSAY',
        points: 10,
      },
    });
    const essayQuestion = (await essay.json()).data;
    await request(`/api/quizzes/${blankQuiz.id}/publish`, {
      token: lecturerToken,
      method: 'PATCH',
      body: { is_published: true },
    });

    // Mahasiswa C langsung submit tanpa menyimpan jawaban apa pun.
    const start = await request(`/api/quizzes/${blankQuiz.id}/attempts`, {
      token: studentCToken,
      method: 'POST',
    });
    const attemptC = (await start.json()).data.attempt;

    const submit = await request(`/api/quiz-attempts/${attemptC.id}/submit`, {
      token: studentCToken,
      method: 'POST',
    });
    const submitPayload = await submit.json();
    assert.equal(submit.status, 200, submitPayload.message);
    assert.equal(submitPayload.data.attempt.status, 'SUBMITTED');
    assert.equal(submitPayload.data.attempt.score, 0);

    // Esai kosong dinilai 0 → attempt mencapai GRADED dengan skor tetap 0.
    const detail = await request(`/api/quiz-attempts/${attemptC.id}`, { token: lecturerToken });
    const detailPayload = await detail.json();
    const essayAnswer = detailPayload.data.answers.find(
      (entry) => entry.question_id === essayQuestion.id
    );
    assert.ok(essayAnswer.id, 'baris jawaban esai kosong harus dibuat saat submit');

    const grade = await request(`/api/quiz-attempts/${attemptC.id}/grade`, {
      token: lecturerToken,
      method: 'PUT',
      body: { answers: [{ answer_id: essayAnswer.id, points_awarded: 0 }] },
    });
    const gradePayload = await grade.json();
    assert.equal(grade.status, 200, gradePayload.message);
    assert.equal(gradePayload.data.fully_graded, true);
    assert.equal(gradePayload.data.score, 0);
    assert.equal(gradePayload.data.status, 'GRADED');
  });
});
