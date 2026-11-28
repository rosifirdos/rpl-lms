import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import app from '../src/app.js';
import prisma from '../src/config/prisma.js';
import { STORAGE } from '../src/config/env.js';
import { cleanupTestArtifacts } from './setup.js';

describe('Fase 2 MVP 3: penerbitan tugas', () => {
  let server;
  let baseUrl;
  let adminToken;
  let lecturerToken;
  let otherLecturerToken;
  let studentToken;
  let outsideToken;
  let testClass;
  let meeting;
  let student;
  let outsideStudent;

  const suffix = Date.now().toString().slice(-8);
  const request = (url, { method = 'GET', token = lecturerToken, body, form } = {}) => {
    if (form) {
      return fetch(`${baseUrl}${url}`, {
        method,
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: form,
      });
    }
    return fetch(`${baseUrl}${url}`, {
      method,
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(body ? { 'Content-Type': 'application/json' } : {}),
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });
  };

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
    [adminToken, lecturerToken, otherLecturerToken, studentToken, outsideToken] = await Promise.all([
      login('admin'),
      login('198501152010121002'),
      login('199003202015042001'),
      login('2024001001'),
      login('2024001003'),
    ]);
    const [course, lecturer, students, admin] = await Promise.all([
      prisma.course.findFirst({ where: { is_active: true } }),
      prisma.dosen.findUnique({ where: { nidn: '198501152010121002' } }),
      prisma.mahasiswa.findMany({ where: { nim: { in: ['2024001001', '2024001003'] } } }),
      prisma.user.findUnique({ where: { username: 'admin' } }),
    ]);
    student = students.find((item) => item.nim === '2024001001');
    outsideStudent = students.find((item) => item.nim === '2024001003');
    const created = await prisma.class.create({
      data: {
        course_id: course.id,
        lecturer_id: lecturer.id,
        academic_year: '2026/2027',
        semester: 'ganjil',
        name: `TEST-MVP3-P2-${suffix}`,
        capacity: 10,
      },
    });
    testClass = created;
    await prisma.enrollment.create({ data: { class_id: testClass.id, student_id: student.id, enrolled_by: admin.id } });
    await prisma.meeting.createMany({
      data: Array.from({ length: 16 }, (_, index) => ({
        class_id: testClass.id,
        meeting_number: index + 1,
        title: `Pertemuan ${index + 1}`,
        is_exam: index === 7 || index === 15,
        exam_type: index === 7 ? 'UTS' : index === 15 ? 'UAS' : 'NONE',
      })),
    });
    meeting = await prisma.meeting.findFirst({ where: { class_id: testClass.id, meeting_number: 3 } });
  });

  after(async () => {
    if (testClass) {
      const assignments = await prisma.assignment.findMany({
        where: { meeting: { class_id: testClass.id } },
        include: { soal: true, submissions: { include: { file: true } } },
      });
      for (const assignment of assignments) {
        const files = [assignment.soal, ...assignment.submissions.map((item) => item.file)].filter(Boolean);
        for (const file of files) await fs.rm(path.resolve(STORAGE.UPLOAD_DIR, file.file_path), { force: true });
      }
      await prisma.assignment.deleteMany({ where: { meeting: { class_id: testClass.id } } });
      await prisma.file.deleteMany({ where: { id: { in: assignments.flatMap((item) => [item.file_soal_id, ...item.submissions.map((sub) => sub.file_id)]).filter(Boolean) } } });
      await prisma.class.delete({ where: { id: testClass.id } });
    }
    if (server) {
      if (typeof server.closeAllConnections === 'function') server.closeAllConnections();
      await new Promise((resolve) => server.close(resolve));
    }
  });

  test('CRUD tugas, draft, unduh soal, dan audit bekerja lintas role', async () => {
    const form = new FormData();
    form.append('title', 'Tugas P2');
    form.append('instructions', 'Kerjakan dan unggah jawaban');
    form.append('weight_percentage', '20');
    form.append('due_date', new Date(Date.now() + 86400000).toISOString());
    form.append('allow_late', 'false');
    form.append('is_published', 'true');
    form.append('file', new Blob(['%PDF-1.4\nsoal'], { type: 'application/pdf' }), 'soal.pdf');

    const create = await request(`/api/meetings/${meeting.id}/assignments`, { method: 'POST', form });
    const createdPayload = await create.json();
    assert.equal(create.status, 201, createdPayload.message);
    const assignment = createdPayload.data;
    assert.equal(assignment.weight_percentage, 20);

    const invalidForms = [
      { title: '', weight_percentage: '20' },
      { title: 'Bobot invalid', weight_percentage: '101' },
      { title: 'Deadline lewat', due_date: new Date(Date.now() - 86400000).toISOString(), weight_percentage: '20' },
    ];
    for (const fields of invalidForms) {
      const invalidForm = new FormData();
      Object.entries(fields).forEach(([key, value]) => invalidForm.append(key, value));
      const invalid = await request(`/api/meetings/${meeting.id}/assignments`, { method: 'POST', form: invalidForm });
      assert.equal(invalid.status, 400);
    }

    const listStudent = await request(`/api/classes/${testClass.id}/assignments`, { token: studentToken });
    assert.equal(listStudent.status, 200);

    const listLecturer = await request(`/api/classes/${testClass.id}/assignments`, { token: lecturerToken });
    assert.equal(listLecturer.status, 200);
    const lecturerAssignments = (await listLecturer.json()).data;
    assert.equal(lecturerAssignments[0]._count.submissions, 0);
    assert.equal('submission_count' in lecturerAssignments[0], false);

    const outsideList = await request(`/api/classes/${testClass.id}/assignments`, { token: outsideToken });
    assert.equal(outsideList.status, 403);

    const download = await request(`/api/assignments/${assignment.id}/download`, { token: studentToken });
    assert.equal(download.status, 200);
    assert.match(download.headers.get('content-disposition'), /attachment/);

    const update = await request(`/api/assignments/${assignment.id}`, {
      method: 'PUT',
      body: { instructions: 'Instruksi diperbarui', is_published: false },
    });
    assert.equal(update.status, 200);

    const oldFileId = (await prisma.assignment.findUnique({ where: { id: assignment.id }, select: { file_soal_id: true } })).file_soal_id;
    const oldFile = await prisma.file.findUnique({ where: { id: oldFileId } });
    const fileOnlyForm = new FormData();
    fileOnlyForm.append('file', new Blob(['%PDF-1.4\nsoal revisi'], { type: 'application/pdf' }), 'soal-revisi.pdf');
    const fileOnlyUpdate = await request(`/api/assignments/${assignment.id}`, {
      method: 'PUT',
      form: fileOnlyForm,
    });
    assert.equal(fileOnlyUpdate.status, 200);
    const revised = await prisma.assignment.findUnique({ where: { id: assignment.id }, select: { file_soal_id: true } });
    assert.notEqual(revised.file_soal_id, oldFileId);
    assert.equal(await prisma.file.findUnique({ where: { id: oldFileId } }), null);
    await assert.rejects(fs.access(path.resolve(STORAGE.UPLOAD_DIR, oldFile.file_path)));

    const draftDetail = await request(`/api/assignments/${assignment.id}`, { token: studentToken });
    assert.equal(draftDetail.status, 404);

    assert.equal(await prisma.auditLog.count({
      where: { entity: 'assignments', action: 'CREATE_ASSIGNMENT', entity_id: assignment.id },
    }), 1);
    assert.equal(await prisma.auditLog.count({
      where: { entity: 'assignments', action: 'UPDATE_ASSIGNMENT', entity_id: assignment.id },
    }), 2);

    const remove = await request(`/api/assignments/${assignment.id}`, { method: 'DELETE' });
    assert.equal(remove.status, 200);
    assert.equal(await prisma.auditLog.count({
      where: { entity: 'assignments', action: 'DELETE_ASSIGNMENT', entity_id: assignment.id },
    }), 1);
  });

  test('Admin dapat membuat tugas tanpa soal dan mahasiswa hanya melihat tugas publik', async () => {
    const createForm = (title, isPublished) => {
      const form = new FormData();
      form.append('title', title);
      form.append('instructions', 'Tugas tanpa berkas soal');
      form.append('weight_percentage', '15');
      form.append('due_date', new Date(Date.now() + 2 * 86400000).toISOString());
      form.append('allow_late', 'false');
      form.append('is_published', String(isPublished));
      return form;
    };

    const publishedResponse = await request(`/api/meetings/${meeting.id}/assignments`, {
      method: 'POST',
      token: adminToken,
      form: createForm('Tugas Admin Publik', true),
    });
    assert.equal(publishedResponse.status, 201);
    const published = (await publishedResponse.json()).data;
    assert.equal(published.soal, null);

    const draftResponse = await request(`/api/meetings/${meeting.id}/assignments`, {
      method: 'POST',
      token: adminToken,
      form: createForm('Tugas Admin Draft', false),
    });
    assert.equal(draftResponse.status, 201);
    const draft = (await draftResponse.json()).data;

    const studentList = await request(`/api/classes/${testClass.id}/assignments`, {
      token: studentToken,
    });
    assert.equal(studentList.status, 200);
    const listed = (await studentList.json()).data;
    assert.ok(listed.some((item) => item.id === published.id));
    assert.ok(!listed.some((item) => item.id === draft.id));

    const draftDetail = await request(`/api/assignments/${draft.id}`, {
      token: studentToken,
    });
    assert.equal(draftDetail.status, 404);

    const updateDraft = await request(`/api/assignments/${draft.id}`, {
      method: 'PUT',
      token: adminToken,
      body: { title: 'Draft Admin Diperbarui' },
    });
    assert.equal(updateDraft.status, 200);

    const deleteDraft = await request(`/api/assignments/${draft.id}`, {
      method: 'DELETE',
      token: adminToken,
    });
    assert.equal(deleteDraft.status, 200);
    await prisma.assignment.delete({ where: { id: published.id } }).catch(() => {});
  });

  test('RBAC mutasi tugas dan unduh soal mengikuti kepemilikan kelas', async () => {
    const form = new FormData();
    form.append('title', 'Tugas RBAC');
    form.append('weight_percentage', '10');
    form.append('due_date', new Date(Date.now() + 86400000).toISOString());
    form.append('allow_late', 'false');
    form.append('is_published', 'true');

    const studentCreate = await request(`/api/meetings/${meeting.id}/assignments`, {
      method: 'POST',
      token: studentToken,
      form,
    });
    assert.equal(studentCreate.status, 403);

    const otherLecturerForm = new FormData();
    otherLecturerForm.append('title', 'Tugas dosen lain');
    otherLecturerForm.append('weight_percentage', '10');
    otherLecturerForm.append('due_date', new Date(Date.now() + 86400000).toISOString());
    otherLecturerForm.append('allow_late', 'false');
    otherLecturerForm.append('is_published', 'true');
    const otherLecturerCreate = await request(`/api/meetings/${meeting.id}/assignments`, {
      method: 'POST',
      token: otherLecturerToken,
      form: otherLecturerForm,
    });
    assert.equal(otherLecturerCreate.status, 403);

    const withFile = new FormData();
    withFile.append('title', 'Tugas RBAC Soal');
    withFile.append('weight_percentage', '10');
    withFile.append('due_date', new Date(Date.now() + 86400000).toISOString());
    withFile.append('allow_late', 'false');
    withFile.append('is_published', 'true');
    withFile.append('file', new Blob(['%PDF-1.4\nrbac'], { type: 'application/pdf' }), 'rbac.pdf');
    const lecturerCreate = await request(`/api/meetings/${meeting.id}/assignments`, {
      method: 'POST',
      token: lecturerToken,
      form: withFile,
    });
    assert.equal(lecturerCreate.status, 201);
    const assignment = (await lecturerCreate.json()).data;

    const otherLecturerUpdate = await request(`/api/assignments/${assignment.id}`, {
      method: 'PUT',
      token: otherLecturerToken,
      body: { title: 'Tidak boleh' },
    });
    assert.equal(otherLecturerUpdate.status, 403);

    const studentUpdate = await request(`/api/assignments/${assignment.id}`, {
      method: 'PUT',
      token: studentToken,
      body: { title: 'Tidak boleh' },
    });
    assert.equal(studentUpdate.status, 403);

    const outsideDownload = await request(`/api/assignments/${assignment.id}/download`, {
      token: outsideToken,
    });
    assert.equal(outsideDownload.status, 403);

    const unauthenticatedDownload = await request(`/api/assignments/${assignment.id}/download`, {
      token: null,
    });
    assert.equal(unauthenticatedDownload.status, 401);

    const otherLecturerDelete = await request(`/api/assignments/${assignment.id}`, {
      method: 'DELETE',
      token: otherLecturerToken,
    });
    assert.equal(otherLecturerDelete.status, 403);

    const studentDelete = await request(`/api/assignments/${assignment.id}`, {
      method: 'DELETE',
      token: studentToken,
    });
    assert.equal(studentDelete.status, 403);

    const lecturerDelete = await request(`/api/assignments/${assignment.id}`, {
      method: 'DELETE',
      token: lecturerToken,
    });
    assert.equal(lecturerDelete.status, 200);
  });

  test('kontrak due_date ber-offset, bobot dua desimal, dan penolakan pertemuan ujian', async () => {
    const pad = (value) => String(value).padStart(2, '0');
    // Instan target dibulatkan ke detik agar dapat dibandingkan dengan string
    // ISO 8601 yang tidak membawa milidetik.
    const target = new Date(Math.floor((Date.now() + 2 * 86400000) / 1000) * 1000);
    const local = new Date(target.getTime() + 7 * 3600 * 1000); // wall-clock +07:00
    const offsetDate =
      `${local.getUTCFullYear()}-${pad(local.getUTCMonth() + 1)}-${pad(local.getUTCDate())}` +
      `T${pad(local.getUTCHours())}:${pad(local.getUTCMinutes())}:${pad(local.getUTCSeconds())}+07:00`;

    const buildForm = ({ title = 'Tugas Kontrak', weight = '20', dueDate = offsetDate } = {}) => {
      const form = new FormData();
      form.append('title', title);
      form.append('weight_percentage', weight);
      form.append('due_date', dueDate);
      form.append('allow_late', 'false');
      form.append('is_published', 'true');
      return form;
    };

    // due_date dengan offset zona waktu (handoff Bab 10.2) harus diterima dan
    // disimpan sebagai instan UTC yang sama.
    const offsetResponse = await request(`/api/meetings/${meeting.id}/assignments`, {
      method: 'POST',
      form: buildForm({ title: 'Tugas Due Date Offset' }),
    });
    const offsetPayload = await offsetResponse.json();
    assert.equal(offsetResponse.status, 201, offsetPayload.message);
    assert.equal(new Date(offsetPayload.data.due_date).getTime(), target.getTime());

    const offsetUpdate = await request(`/api/assignments/${offsetPayload.data.id}`, {
      method: 'PUT',
      body: { due_date: offsetDate },
    });
    assert.equal(offsetUpdate.status, 200);

    // Bobot dua desimal yang sah tidak boleh ditolak karena floating-point.
    const createdIds = [offsetPayload.data.id];
    for (const [weight, expected] of [['1.1', 1.1], ['0.29', 0.29], ['33.33', 33.33]]) {
      const response = await request(`/api/meetings/${meeting.id}/assignments`, {
        method: 'POST',
        form: buildForm({ title: `Tugas Bobot ${weight}`, weight }),
      });
      const payload = await response.json();
      assert.equal(response.status, 201, payload.message);
      assert.equal(payload.data.weight_percentage, expected);
      createdIds.push(payload.data.id);
    }

    const tooPrecise = await request(`/api/meetings/${meeting.id}/assignments`, {
      method: 'POST',
      form: buildForm({ title: 'Tugas Bobot Tiga Desimal', weight: '1.111' }),
    });
    assert.equal(tooPrecise.status, 400);

    // Pertemuan UTS/UAS bukan tempat tugas biasa (BR-004).
    const examMeeting = await prisma.meeting.findFirst({
      where: { class_id: testClass.id, meeting_number: 8 },
    });
    const examResponse = await request(`/api/meetings/${examMeeting.id}/assignments`, {
      method: 'POST',
      form: buildForm({ title: 'Tugas pada UTS' }),
    });
    const examPayload = await examResponse.json();
    assert.equal(examResponse.status, 400);
    assert.match(examPayload.message, /UTS\/UAS/);

    for (const id of createdIds) {
      const removed = await request(`/api/assignments/${id}`, { method: 'DELETE' });
      assert.equal(removed.status, 200);
    }
  });
});
