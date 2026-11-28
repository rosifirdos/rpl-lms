import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import app from '../src/app.js';
import prisma from '../src/config/prisma.js';
import { STORAGE } from '../src/config/env.js';
import { cleanupTestArtifacts } from './setup.js';

/**
 * Fase 5 MVP 3 — integrasi lintas modul (assignments + submissions) dan
 * matriks RBAC gabungan. Tes ini sengaja memakai alur HTTP nyata end-to-end
 * (bukan memanggil service) supaya rantai route → middleware → controller →
 * service → Prisma ikut tervalidasi.
 */

const SOAL_CONTENT = Buffer.from('%PDF-1.4\nBerkas soal tugas integrasi Fase 5\n');
const JAWABAN_CONTENT = Buffer.from('%PDF-1.4\nJawaban mahasiswa integrasi Fase 5\n');

describe('Fase 5 MVP 3: integrasi lintas modul & matriks RBAC', () => {
  let server;
  let baseUrl;
  let adminToken;
  let lecturerToken;
  let otherLecturerToken;
  let studentToken;
  let secondStudentToken;
  let outsideStudentToken;
  let testClass;
  let meeting;
  let secondMeeting;
  let assignment;
  let submission;
  let adminAssignment;

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
    const response = await request('/api/auth/login', {
      method: 'POST',
      token: null,
      body: { identifier, password: 'password123' },
    });
    const payload = await response.json();
    assert.equal(response.status, 200, `Login ${identifier} gagal: ${payload.message}`);
    return payload.data.accessToken;
  }

  async function createAssignmentRequest(token, meetingId, fields, file) {
    const form = new FormData();
    for (const [key, value] of Object.entries(fields)) {
      if (value === undefined || value === null) continue;
      form.append(key, String(value));
    }
    if (file) {
      form.append('file', new Blob([file.content], { type: file.mime }), file.name);
    }
    const response = await fetch(`${baseUrl}/api/meetings/${meetingId}/assignments`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: form,
    });
    return { response, payload: await response.json() };
  }

  async function uploadAnswer(token, assignmentId, content, filename = 'jawaban.pdf') {
    const form = new FormData();
    form.append('file', new Blob([content], { type: 'application/pdf' }), filename);
    const response = await fetch(`${baseUrl}/api/assignments/${assignmentId}/submissions`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: form,
    });
    return { response, payload: await response.json() };
  }

  before(async () => {
    await cleanupTestArtifacts(prisma);
    await new Promise((resolve) => {
      server = app.listen(0, '127.0.0.1', () => {
        baseUrl = `http://127.0.0.1:${server.address().port}`;
        resolve();
      });
    });

    [
      adminToken,
      lecturerToken,
      otherLecturerToken,
      studentToken,
      secondStudentToken,
      outsideStudentToken,
    ] = await Promise.all([
      login('admin'),
      login('198501152010121002'),
      login('199003202015042001'),
      login('2024001001'),
      login('2024001002'),
      login('2024001003'),
    ]);

    const [course, lecturer, students, admin] = await Promise.all([
      prisma.course.findFirst({ where: { is_active: true } }),
      prisma.dosen.findUnique({ where: { nidn: '198501152010121002' } }),
      prisma.mahasiswa.findMany({
        where: { nim: { in: ['2024001001', '2024001002', '2024001003'] } },
      }),
      prisma.user.findUnique({ where: { username: 'admin' }, select: { id: true } }),
    ]);
    assert.ok(course && lecturer && admin && students.length === 3);

    const student1 = students.find(({ nim }) => nim === '2024001001');
    const student2 = students.find(({ nim }) => nim === '2024001002');

    const createdClass = await request('/api/admin/classes', {
      method: 'POST',
      token: adminToken,
      body: {
        course_id: course.id,
        lecturer_id: lecturer.id,
        academic_year: '2026/2027',
        semester: 'ganjil',
        name: `TEST-MVP3-P5-${suffix}`,
        capacity: 10,
      },
    });
    assert.equal(createdClass.status, 201);
    testClass = (await createdClass.json()).data;

    await prisma.enrollment.createMany({
      data: [student1, student2].map(({ id }) => ({
        class_id: testClass.id,
        student_id: id,
        enrolled_by: admin.id,
      })),
    });

    meeting = await prisma.meeting.findFirst({
      where: { class_id: testClass.id, meeting_number: 3 },
    });
    secondMeeting = await prisma.meeting.findFirst({
      where: { class_id: testClass.id, meeting_number: 4 },
    });
    assert.ok(meeting && secondMeeting);
  });

  after(async () => {
    if (testClass) {
      const meetings = await prisma.meeting.findMany({
        where: { class_id: testClass.id },
        select: { id: true },
      });
      const meetingIds = meetings.map(({ id }) => id);
      const assignments = await prisma.assignment.findMany({
        where: { meeting_id: { in: meetingIds } },
        include: { soal: true, submissions: { include: { file: true } } },
      });

      const files = [
        ...assignments.flatMap(({ soal }) => (soal ? [soal] : [])),
        ...assignments.flatMap(({ submissions }) => submissions.map(({ file }) => file)),
      ].filter(Boolean);

      for (const file of files) {
        await fs.rm(path.resolve(STORAGE.UPLOAD_DIR, file.file_path), { force: true });
      }

      const assignmentIds = assignments.map(({ id }) => id);
      const submissionIds = assignments.flatMap(({ submissions }) =>
        submissions.map(({ id }) => id)
      );
      await prisma.auditLog.deleteMany({
        where: {
          OR: [
            { entity: 'assignments', entity_id: { in: assignmentIds } },
            { entity: 'submissions', entity_id: { in: submissionIds } },
            { entity: 'classes', entity_id: testClass.id },
          ],
        },
      });
      await prisma.assignment.deleteMany({ where: { id: { in: assignmentIds } } });
      await prisma.file.deleteMany({ where: { id: { in: files.map(({ id }) => id) } } });
      await prisma.class.delete({ where: { id: testClass.id } }).catch(() => {});
    }

    if (server) {
      if (typeof server.closeAllConnections === 'function') server.closeAllConnections();
      await new Promise((resolve) => server.close(resolve));
    }
  });

  test('alur end-to-end: terbitkan tugas → unduh soal → kumpulkan → nilai → mahasiswa melihat skor', async () => {
    const created = await createAssignmentRequest(
      lecturerToken,
      meeting.id,
      {
        title: 'Tugas Analisis ERD',
        instructions: 'Kerjakan analisis ERD lalu kumpulkan dalam format PDF.',
        weight_percentage: 20,
        due_date: new Date(Date.now() + 3600_000).toISOString(),
        allow_late: false,
        is_published: true,
      },
      { content: SOAL_CONTENT, mime: 'application/pdf', name: 'soal-erd.pdf' }
    );
    assert.equal(created.response.status, 201, created.payload.message);
    assignment = created.payload.data;
    assert.equal(assignment.weight_percentage, 20);
    assert.equal(typeof assignment.weight_percentage, 'number');
    assert.equal(assignment.meeting_number, 3);
    assert.equal(assignment.soal?.original_name, 'soal-erd.pdf');
    assert.ok(assignment.soal?.id);

    // Mahasiswa yang terdaftar melihat tugas terpublikasi & mengunduh soal.
    const list = await request(`/api/classes/${testClass.id}/assignments`, {
      token: studentToken,
    });
    assert.equal(list.status, 200);
    const listPayload = await list.json();
    const listed = listPayload.data.find(({ id }) => id === assignment.id);
    assert.ok(listed, 'Tugas terpublikasi harus terlihat oleh mahasiswa terdaftar');
    assert.ok(listed.my_submission === null, 'Sebelum mengumpulkan, my_submission bernilai null');

    const downloadSoal = await request(`/api/assignments/${assignment.id}/download`, {
      token: studentToken,
    });
    assert.equal(downloadSoal.status, 200);
    assert.match(downloadSoal.headers.get('content-disposition'), /attachment/);
    assert.deepEqual(Buffer.from(await downloadSoal.arrayBuffer()), SOAL_CONTENT);

    // Mahasiswa mengumpulkan jawaban — timestamp memakai jam server.
    const startedAt = Date.now();
    const uploaded = await uploadAnswer(studentToken, assignment.id, JAWABAN_CONTENT);
    const finishedAt = Date.now();
    assert.ok([200, 201].includes(uploaded.response.status), uploaded.payload.message);
    submission = uploaded.payload.data;
    assert.equal(submission.is_late, false);
    assert.equal(submission.status, 'SUBMITTED');
    assert.equal(submission.score, null);

    const submittedAt = new Date(submission.submitted_at).getTime();
    assert.ok(Number.isFinite(submittedAt));
    assert.ok(
      submittedAt >= startedAt - 1000 && submittedAt <= finishedAt + 1000,
      `submitted_at harus berasal dari jam server (${submission.submitted_at})`
    );

    // Berkas jawaban benar-benar berada di private storage.
    const storedFile = await prisma.file.findUnique({
      where: { id: (await prisma.submission.findUnique({ where: { id: submission.id } })).file_id },
    });
    assert.ok(storedFile.file_path.startsWith(`submissions${path.sep}`) || storedFile.file_path.startsWith('submissions/'));
    const storedPath = path.resolve(STORAGE.UPLOAD_DIR, storedFile.file_path);
    assert.deepEqual(await fs.readFile(storedPath), JAWABAN_CONTENT);

    // Roster dosen menghitung mahasiswa yang belum mengumpulkan.
    const roster = await request(`/api/assignments/${assignment.id}/submissions`, {
      token: lecturerToken,
    });
    assert.equal(roster.status, 200);
    const rosterPayload = (await roster.json()).data;
    assert.equal(rosterPayload.total_students, 2);
    assert.equal(rosterPayload.submitted, 1);
    assert.equal(rosterPayload.not_submitted, 1);
    assert.equal(rosterPayload.late, 0);
    assert.equal(rosterPayload.graded, 0);
    const rosterRow = rosterPayload.roster.find(({ student_id }) => student_id === submission.student_id);
    assert.equal(rosterRow.status, 'SUBMITTED');
    assert.equal(rosterRow.download_url, `/api/submissions/${submission.id}/download`);
    const notSubmitted = rosterPayload.roster.find(({ student_id }) => student_id !== submission.student_id);
    assert.equal(notSubmitted.status, 'NOT_SUBMITTED');
    assert.equal(notSubmitted.submission_id, null);

    // Dosen menilai 90 + feedback.
    const graded = await request(`/api/submissions/${submission.id}/grade`, {
      method: 'PUT',
      token: lecturerToken,
      body: { score: 90, feedback: 'Analisis sudah runtut dan lengkap.' },
    });
    assert.equal(graded.status, 200);
    assert.equal((await graded.json()).data.score, 90);

    // Mahasiswa melihat skor & feedback miliknya sendiri.
    const mine = await request(`/api/assignments/${assignment.id}/submission`, {
      token: studentToken,
    });
    assert.equal(mine.status, 200);
    const minePayload = (await mine.json()).data;
    assert.equal(minePayload.score, 90);
    assert.equal(typeof minePayload.score, 'number');
    assert.equal(minePayload.status, 'GRADED');
    assert.equal(minePayload.feedback, 'Analisis sudah runtut dan lengkap.');

    const detail = await request(`/api/assignments/${assignment.id}`, { token: studentToken });
    assert.equal(detail.status, 200);
    const detailPayload = (await detail.json()).data;
    assert.equal(detailPayload.my_submission.score, 90);
    assert.equal(detailPayload.my_submission.feedback, 'Analisis sudah runtut dan lengkap.');

    // Submission yang sudah dinilai terkunci dari resubmission.
    const resubmission = await uploadAnswer(studentToken, assignment.id, JAWABAN_CONTENT, 'ulang.pdf');
    assert.equal(resubmission.response.status, 409);
    assert.equal(resubmission.payload.message, 'Submission telah dinilai dan tidak dapat diubah');

    // Audit lengkap: pembuatan tugas, unggah submission, dan penilaian.
    assert.ok(
      await prisma.auditLog.findFirst({
        where: { entity: 'assignments', action: 'CREATE_ASSIGNMENT', entity_id: assignment.id },
      })
    );
    assert.ok(
      await prisma.auditLog.findFirst({
        where: { entity: 'submissions', action: 'CREATE_SUBMISSION', entity_id: submission.id },
      })
    );
    assert.ok(
      await prisma.auditLog.findFirst({
        where: { entity: 'submissions', action: 'GRADE_SUBMISSION', entity_id: submission.id },
      })
    );
  });

  test('isolasi antar kelas, matriks RBAC gabungan, dan operasi Admin', async () => {
    // --- Tanpa token: 401 pada seluruh endpoint kunci ---
    for (const [url, options] of [
      [`/api/assignments/${assignment.id}`, {}],
      [`/api/assignments/${assignment.id}/download`, {}],
      [`/api/assignments/${assignment.id}/submission`, {}],
      [`/api/classes/${testClass.id}/assignments`, {}],
      [`/api/submissions/${submission.id}/download`, {}],
    ]) {
      const response = await request(url, { ...options, token: null });
      assert.equal(response.status, 401, `Tanpa token harus 401: ${url}`);
    }
    const noTokenGrade = await request(`/api/submissions/${submission.id}/grade`, {
      method: 'PUT',
      token: null,
      body: { score: 80 },
    });
    assert.equal(noTokenGrade.status, 401);

    // --- Mahasiswa di luar kelas: 403 untuk baca, unduh, dan unggah ---
    const outsideDetail = await request(`/api/assignments/${assignment.id}`, {
      token: outsideStudentToken,
    });
    assert.equal(outsideDetail.status, 403);

    const outsideList = await request(`/api/classes/${testClass.id}/assignments`, {
      token: outsideStudentToken,
    });
    assert.equal(outsideList.status, 403);

    const outsideSoal = await request(`/api/assignments/${assignment.id}/download`, {
      token: outsideStudentToken,
    });
    assert.equal(outsideSoal.status, 403);

    const outsideUpload = await uploadAnswer(outsideStudentToken, assignment.id, JAWABAN_CONTENT);
    assert.equal(outsideUpload.response.status, 403);

    // Mahasiswa lain pada kelas yang sama tidak boleh mengunduh jawaban orang lain (TC-023).
    const peerDownload = await request(`/api/submissions/${submission.id}/download`, {
      token: secondStudentToken,
    });
    assert.equal(peerDownload.status, 403);

    // Dosen pemilik submission tetap boleh mengunduh.
    const lecturerDownload = await request(`/api/submissions/${submission.id}/download`, {
      token: lecturerToken,
    });
    assert.equal(lecturerDownload.status, 200);
    assert.deepEqual(Buffer.from(await lecturerDownload.arrayBuffer()), JAWABAN_CONTENT);

    // --- Dosen non-pengampu: 403 pada baca dan tulis ---
    const otherLecturerDetail = await request(`/api/assignments/${assignment.id}`, {
      token: otherLecturerToken,
    });
    assert.equal(otherLecturerDetail.status, 403);
    const otherLecturerList = await request(`/api/classes/${testClass.id}/assignments`, {
      token: otherLecturerToken,
    });
    assert.equal(otherLecturerList.status, 403);
    const otherLecturerGrade = await request(`/api/submissions/${submission.id}/grade`, {
      method: 'PUT',
      token: otherLecturerToken,
      body: { score: 70 },
    });
    assert.equal(otherLecturerGrade.status, 403);
    const otherLecturerCreate = await createAssignmentRequest(
      otherLecturerToken,
      meeting.id,
      {
        title: 'Tugas ilegal',
        weight_percentage: 10,
        due_date: new Date(Date.now() + 86400_000).toISOString(),
      }
    );
    assert.equal(otherLecturerCreate.response.status, 403);

    // --- Mahasiswa ditolak (route-level RBAC) pada seluruh endpoint tulis ---
    const studentCreate = await createAssignmentRequest(studentToken, meeting.id, {
      title: 'Tugas ilegal',
      weight_percentage: 10,
      due_date: new Date(Date.now() + 86400_000).toISOString(),
    });
    assert.equal(studentCreate.response.status, 403);

    const studentUpdate = await request(`/api/assignments/${assignment.id}`, {
      method: 'PUT',
      token: studentToken,
      body: { title: 'Diubah mahasiswa' },
    });
    assert.equal(studentUpdate.status, 403);

    const studentDelete = await request(`/api/assignments/${assignment.id}`, {
      method: 'DELETE',
      token: studentToken,
    });
    assert.equal(studentDelete.status, 403);

    const studentRoster = await request(`/api/assignments/${assignment.id}/submissions`, {
      token: studentToken,
    });
    assert.equal(studentRoster.status, 403);

    const studentGrade = await request(`/api/submissions/${submission.id}/grade`, {
      method: 'PUT',
      token: studentToken,
      body: { score: 100 },
    });
    assert.equal(studentGrade.status, 403);

    // --- Admin dapat melakukan seluruh operasi ---
    const adminDetail = await request(`/api/assignments/${assignment.id}`, { token: adminToken });
    assert.equal(adminDetail.status, 200);
    const adminDetailPayload = (await adminDetail.json()).data;
    assert.deepEqual(adminDetailPayload.roster_summary, {
      total_students: 2,
      submitted: 1,
      late: 0,
      graded: 1,
      not_submitted: 1,
    });

    const adminSoal = await request(`/api/assignments/${assignment.id}/download`, {
      token: adminToken,
    });
    assert.equal(adminSoal.status, 200);
    assert.deepEqual(Buffer.from(await adminSoal.arrayBuffer()), SOAL_CONTENT);

    const adminSubmission = await request(`/api/submissions/${submission.id}/download`, {
      token: adminToken,
    });
    assert.equal(adminSubmission.status, 200);

    const adminGrade = await request(`/api/submissions/${submission.id}/grade`, {
      method: 'PUT',
      token: adminToken,
      body: { score: 90, feedback: 'Analisis sudah runtut dan lengkap.' },
    });
    assert.equal(adminGrade.status, 200);
    assert.equal((await adminGrade.json()).data.score, 90);

    // Admin membuat dan menghapus tugas (tanpa berkas soal) untuk membuktikan CRUD penuh.
    const adminCreated = await createAssignmentRequest(adminToken, secondMeeting.id, {
      title: 'Tugas admin sementara',
      instructions: 'Akan dihapus.',
      weight_percentage: 5,
      due_date: new Date(Date.now() + 86400_000).toISOString(),
      allow_late: true,
      is_published: false,
    });
    assert.equal(adminCreated.response.status, 201, adminCreated.payload.message);
    adminAssignment = adminCreated.payload.data;
    assert.equal(adminAssignment.soal, null);

    const adminDelete = await request(`/api/assignments/${adminAssignment.id}`, {
      method: 'DELETE',
      token: adminToken,
    });
    assert.equal(adminDelete.status, 200);
    assert.equal(await prisma.assignment.findUnique({ where: { id: adminAssignment.id } }), null);
    adminAssignment = null;
  });

  test('batas waktu memakai jam server: is_late akurat untuk allow_late true/false', async () => {
    async function publishAssignment(fields) {
      const created = await createAssignmentRequest(lecturerToken, secondMeeting.id, {
        title: 'Tugas batas waktu',
        instructions: 'Uji deadline.',
        weight_percentage: 10,
        due_date: new Date(Date.now() + 86400_000).toISOString(),
        ...fields,
      });
      assert.equal(created.response.status, 201, created.payload.message);
      return created.payload.data;
    }

    // due_date dimundurkan langsung di database agar batas waktunya terlewati
    // tanpa bergantung pada kecepatan eksekusi tes (menghindari flaky).
    const lateAllowed = await publishAssignment({ allow_late: true });
    await prisma.assignment.update({
      where: { id: lateAllowed.id },
      data: { due_date: new Date(Date.now() - 60_000) },
    });

    const lateUpload = await uploadAnswer(studentToken, lateAllowed.id, JAWABAN_CONTENT);
    assert.ok([200, 201].includes(lateUpload.response.status), lateUpload.payload.message);
    const lateSubmission = lateUpload.payload.data;
    assert.equal(lateSubmission.is_late, true);
    assert.equal(lateSubmission.status, 'LATE');

    const lateRoster = await request(`/api/assignments/${lateAllowed.id}/submissions`, {
      token: lecturerToken,
    });
    assert.equal(lateRoster.status, 200);
    const lateRosterPayload = (await lateRoster.json()).data;
    assert.equal(lateRosterPayload.late, 1);
    assert.equal(lateRosterPayload.submitted, 1);

    const lateDetail = await request(`/api/assignments/${lateAllowed.id}`, { token: lecturerToken });
    assert.equal((await lateDetail.json()).data.roster_summary.late, 1);

    // allow_late = false → unggahan setelah deadline ditolak 403 dengan pesan baku.
    const lateForbidden = await publishAssignment({ allow_late: false });
    await prisma.assignment.update({
      where: { id: lateForbidden.id },
      data: { due_date: new Date(Date.now() - 60_000) },
    });
    const rejected = await uploadAnswer(studentToken, lateForbidden.id, JAWABAN_CONTENT);
    assert.equal(rejected.response.status, 403);
    assert.equal(rejected.payload.message, 'Batas waktu pengumpulan tugas telah berakhir');

    // Timestamp submission tetap dari jam server (bukan nilai dari klien).
    const submittedAt = new Date(lateSubmission.submitted_at).getTime();
    assert.ok(Math.abs(Date.now() - submittedAt) < 120_000);
  });

  test('penghapusan tugas membersihkan submission, metadata files, dan berkas fisik', async () => {
    const storedAssignment = await prisma.assignment.findUnique({
      where: { id: assignment.id },
      include: { soal: true, submissions: { include: { file: true } } },
    });
    assert.ok(storedAssignment);
    assert.equal(storedAssignment.submissions.length, 1);

    const physicalPaths = [
      path.resolve(STORAGE.UPLOAD_DIR, storedAssignment.soal.file_path),
      path.resolve(STORAGE.UPLOAD_DIR, storedAssignment.submissions[0].file.file_path),
    ];
    const fileIds = [
      storedAssignment.soal.id,
      storedAssignment.submissions[0].file.id,
    ];
    for (const filePath of physicalPaths) {
      await fs.access(filePath); // wajib ada sebelum penghapusan
    }

    const deleted = await request(`/api/assignments/${assignment.id}`, {
      method: 'DELETE',
      token: lecturerToken,
    });
    assert.equal(deleted.status, 200);
    assert.equal((await deleted.json()).data.id, assignment.id);

    assert.equal(await prisma.assignment.findUnique({ where: { id: assignment.id } }), null);
    assert.equal(
      await prisma.submission.count({ where: { assignment_id: assignment.id } }),
      0
    );
    assert.equal(await prisma.file.count({ where: { id: { in: fileIds } } }), 0);
    for (const filePath of physicalPaths) {
      await assert.rejects(fs.access(filePath), 'Berkas fisik harus terhapus dari storage privat');
    }
    assert.ok(
      await prisma.auditLog.findFirst({
        where: { entity: 'assignments', action: 'DELETE_ASSIGNMENT', entity_id: assignment.id },
      })
    );

    // Tugas yang sudah dihapus tidak lagi dapat diakses.
    const afterDelete = await request(`/api/assignments/${assignment.id}`, { token: lecturerToken });
    assert.equal(afterDelete.status, 404);
  });
});
