import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import app from '../src/app.js';
import prisma from '../src/config/prisma.js';
import { STORAGE } from '../src/config/env.js';
import { cleanupTestArtifacts } from './setup.js';

describe('Fase 4 MVP 3: penilaian submission (skor 0-100 & feedback)', () => {
  let server;
  let baseUrl;
  let adminToken;
  let lecturerToken;
  let otherLecturerToken;
  let studentToken;
  let otherStudentToken;
  let testClass;
  let assignment;
  let student;
  let otherStudent;

  const suffix = Date.now().toString().slice(-8);
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
    return (await response.json()).data.accessToken;
  }

  async function upload(token, content, filename, mime = 'application/pdf') {
    const form = new FormData();
    form.append('file', new Blob([content], { type: mime }), filename);
    const response = await fetch(`${baseUrl}/api/assignments/${assignment.id}/submissions`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: form,
    });
    const payload = await response.json();
    return { response, payload };
  }

  before(async () => {
    await cleanupTestArtifacts(prisma);
    await new Promise((resolve) => {
      server = app.listen(0, '127.0.0.1', () => {
        baseUrl = `http://127.0.0.1:${server.address().port}`;
        resolve();
      });
    });
    [adminToken, lecturerToken, otherLecturerToken, studentToken, otherStudentToken] = await Promise.all([
      login('admin'),
      login('198501152010121002'),
      login('199003202015042001'),
      login('2024001001'),
      login('2024001002'),
    ]);
    const [course, lecturer, students, admin] = await Promise.all([
      prisma.course.findFirst({ where: { is_active: true } }),
      prisma.dosen.findUnique({ where: { nidn: '198501152010121002' } }),
      prisma.mahasiswa.findMany({ where: { nim: { in: ['2024001001', '2024001002'] } } }),
      prisma.user.findUnique({ where: { username: 'admin' } }),
    ]);
    student = students.find((item) => item.nim === '2024001001');
    otherStudent = students.find((item) => item.nim === '2024001002');
    testClass = await prisma.class.create({
      data: {
        course_id: course.id,
        lecturer_id: lecturer.id,
        academic_year: '2026/2027',
        semester: 'ganjil',
        name: `TEST-MVP3-P4-${suffix}`,
        capacity: 10,
      },
    });
    await prisma.meeting.createMany({
      data: Array.from({ length: 16 }, (_, index) => ({
        class_id: testClass.id,
        meeting_number: index + 1,
        title: `Pertemuan ${index + 1}`,
        is_exam: index === 7 || index === 15,
        exam_type: index === 7 ? 'UTS' : index === 15 ? 'UAS' : 'NONE',
      })),
    });
    await prisma.enrollment.createMany({
      data: [
        { class_id: testClass.id, student_id: student.id, enrolled_by: admin.id },
        { class_id: testClass.id, student_id: otherStudent.id, enrolled_by: admin.id },
      ],
    });
    const meeting = await prisma.meeting.findFirst({ where: { class_id: testClass.id, meeting_number: 3 } });
    assignment = await prisma.assignment.create({
      data: {
        meeting_id: meeting.id,
        title: 'Tugas penilaian',
        instructions: 'Kerjakan lalu kumpulkan',
        weight_percentage: 25,
        due_date: new Date(Date.now() + 86400000),
        allow_late: false,
        is_published: true,
      },
    });
  });

  after(async () => {
    if (assignment) {
      const submissions = await prisma.submission.findMany({
        where: { assignment_id: assignment.id },
        include: { file: true },
      });
      for (const submission of submissions) {
        if (submission.file) await fs.rm(path.resolve(STORAGE.UPLOAD_DIR, submission.file.file_path), { force: true });
      }
      await prisma.assignment.delete({ where: { id: assignment.id } }).catch(() => {});
      await prisma.file.deleteMany({ where: { id: { in: submissions.map((item) => item.file_id) } } });
    }
    if (testClass) await prisma.class.delete({ where: { id: testClass.id } }).catch(() => {});
    if (server) {
      if (typeof server.closeAllConnections === 'function') server.closeAllConnections();
      await new Promise((resolve) => server.close(resolve));
    }
  });

  test('menyimpan skor 0-100 & feedback, terserialisasi number, dan tercatat di audit', async () => {
    const { response: uploadResponse, payload: uploadPayload } = await upload(
      studentToken,
      '%PDF-1.4\njawaban fase 4',
      'jawaban-fase4.pdf'
    );
    assert.ok([200, 201].includes(uploadResponse.status));
    const submissionId = uploadPayload.data.id;

    const graded = await request(`/api/submissions/${submissionId}/grade`, {
      method: 'PUT',
      token: lecturerToken,
      body: { score: 87.25, feedback: 'Struktur sudah baik, lengkapi kardinalitas.' },
    });
    assert.equal(graded.status, 200);
    const gradedPayload = await graded.json();
    assert.equal(gradedPayload.data.score, 87.25);
    assert.equal(typeof gradedPayload.data.score, 'number');
    assert.equal(gradedPayload.data.status, 'GRADED');
    assert.equal(gradedPayload.data.feedback, 'Struktur sudah baik, lengkapi kardinalitas.');
    assert.ok(gradedPayload.data.graded_at);

    // Mahasiswa melihat skor & feedback miliknya sendiri
    const mine = await request(`/api/assignments/${assignment.id}/submission`, { token: studentToken });
    assert.equal(mine.status, 200);
    const minePayload = await mine.json();
    assert.equal(minePayload.data.score, 87.25);
    assert.equal(minePayload.data.feedback, 'Struktur sudah baik, lengkapi kardinalitas.');

    // Detail tugas (my_submission) juga menampilkan skor & feedback untuk mahasiswa
    const detail = await request(`/api/assignments/${assignment.id}`, { token: studentToken });
    assert.equal(detail.status, 200);
    const detailPayload = await detail.json();
    assert.equal(detailPayload.data.my_submission.score, 87.25);
    assert.equal(detailPayload.data.my_submission.feedback, 'Struktur sudah baik, lengkapi kardinalitas.');

    // Audit pertama: old null -> new 87.25
    const audits = await prisma.auditLog.findMany({
      where: { entity: 'submissions', action: 'GRADE_SUBMISSION', entity_id: submissionId },
      orderBy: { created_at: 'asc' },
    });
    assert.equal(audits.length, 1);
    assert.equal(audits[0].old_values.score, null);
    assert.equal(Number(audits[0].new_values.score), 87.25);

    // Batas 0 & 100 & dua desimal diterima
    for (const score of [0, 100, 0.5, 42.07]) {
      const ok = await request(`/api/submissions/${submissionId}/grade`, {
        method: 'PUT',
        token: lecturerToken,
        body: { score },
      });
      assert.equal(ok.status, 200, `skor ${score} harus diterima`);
      assert.equal((await ok.json()).data.score, score);
    }

    // Nilai tidak valid ditolak 400
    for (const body of [
      { score: -0.01 },
      { score: 100.01 },
      { score: 85.555 },
      { score: 'abc' },
      { score: null },
      { score: 80, feedback: 'x'.repeat(2001) },
      {},
    ]) {
      const bad = await request(`/api/submissions/${submissionId}/grade`, { method: 'PUT', token: lecturerToken, body });
      assert.equal(bad.status, 400, `body ${JSON.stringify(body)} harus ditolak`);
    }

    // Perubahan skor 70 -> 85 menghasilkan entri audit baru dengan nilai lama/baru benar
    const countBefore = await prisma.auditLog.count({ where: { action: 'GRADE_SUBMISSION', entity_id: submissionId } });
    await request(`/api/submissions/${submissionId}/grade`, { method: 'PUT', token: lecturerToken, body: { score: 70, feedback: null } });
    await request(`/api/submissions/${submissionId}/grade`, { method: 'PUT', token: lecturerToken, body: { score: 85, feedback: 'Ditingkatkan setelah revisi' } });
    const after = await prisma.auditLog.findMany({
      where: { action: 'GRADE_SUBMISSION', entity_id: submissionId },
      orderBy: { created_at: 'asc' },
    });
    assert.equal(after.length, countBefore + 2);
    const [first, second] = after.slice(-2);
    assert.equal(Number(first.old_values.score), 42.07);
    assert.equal(Number(first.new_values.score), 70);
    assert.equal(first.new_values.feedback, null);
    assert.equal(Number(second.old_values.score), 70);
    assert.equal(Number(second.new_values.score), 85);
    assert.equal(second.new_values.feedback, 'Ditingkatkan setelah revisi');

    // feedback null mengosongkan
    const cleared = await request(`/api/submissions/${submissionId}/grade`, { method: 'PUT', token: lecturerToken, body: { score: 85, feedback: null } });
    assert.equal((await cleared.json()).data.feedback, null);
  });

  test('pembatasan akses penilaian & isolasi submission antar mahasiswa', async () => {
    const { payload } = await upload(otherStudentToken, '%PDF-1.4\njawaban mahasiswa lain', 'jawaban-lain.pdf');
    const submissionId = payload.data.id;

    // Mahasiswa tidak boleh menilai (403), tanpa token 401
    const studentAttempt = await request(`/api/submissions/${submissionId}/grade`, { method: 'PUT', token: studentToken, body: { score: 90 } });
    assert.equal(studentAttempt.status, 403);
    const noToken = await request(`/api/submissions/${submissionId}/grade`, { method: 'PUT', token: null, body: { score: 90 } });
    assert.equal(noToken.status, 401);

    // Dosen non-pengampu ditolak 403
    const otherLecturer = await request(`/api/submissions/${submissionId}/grade`, { method: 'PUT', token: otherLecturerToken, body: { score: 90 } });
    assert.equal(otherLecturer.status, 403);

    // Admin boleh menilai
    const admin = await request(`/api/submissions/${submissionId}/grade`, { method: 'PUT', token: adminToken, body: { score: 90, feedback: 'Dinilai admin' } });
    assert.equal(admin.status, 200);
    assert.equal((await admin.json()).data.score, 90);

    // Mahasiswa hanya melihat submission pribadi, bukan milik mahasiswa lain
    const mine = await request(`/api/assignments/${assignment.id}/submission`, { token: studentToken });
    const minePayload = await mine.json();
    assert.notEqual(minePayload.data?.id, submissionId);
    assert.notEqual(minePayload.data?.score, 90);

    // Mahasiswa tidak boleh mengakses roster
    const roster = await request(`/api/assignments/${assignment.id}/submissions`, { token: studentToken });
    assert.equal(roster.status, 403);
  });
});
