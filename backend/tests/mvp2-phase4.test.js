import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import app from '../src/app.js';
import prisma from '../src/config/prisma.js';
import { ACADEMIC } from '../src/constants/academic.js';
import { AUDIT_ENTITIES } from '../src/constants/auditEntities.js';
import {
  ATTENDANCE_CLOSED_MESSAGE,
  AUTO_ABSENCE_NOTE,
} from '../src/modules/attendance/attendance.service.js';
import { cleanupTestArtifacts } from './setup.js';

describe('Fase 4 MVP 2: Sesi Presensi & Check-in Mandiri Mahasiswa', () => {
  let server;
  let baseUrl;

  let adminToken;
  let dosenToken;
  let dosenLainToken;
  let mahasiswa1Token;
  let mahasiswa2Token;
  let mahasiswaLuarToken;

  let admin;
  let lecturer;
  let student1;
  let student2;

  let testClass;
  let meeting1;
  let meeting2;
  let meeting3;
  let meeting4;

  let session1Id;
  let session2Id;
  let session3Id;
  let record1Id;
  let record2Id;
  const auditedEntityIds = new Set();

  const suffix = `${Date.now()}`.slice(-6);

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

  const openSession = (meetingId, token = dosenToken, body) =>
    request(`/api/meetings/${meetingId}/attendance/open`, { method: 'POST', token, body });

  const closeSession = (meetingId, token = dosenToken) =>
    request(`/api/meetings/${meetingId}/attendance/close`, { method: 'POST', token });

  const checkIn = (sessionId, token) =>
    request(`/api/attendance/${sessionId}/check-in`, { method: 'POST', token });

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
      mahasiswa1Token,
      mahasiswa2Token,
      mahasiswaLuarToken,
    ] = await Promise.all([
      login('admin'),
      login('198501152010121002'),
      login('199003202015042001'),
      login('2024001001'),
      login('2024001002'),
      login('2024001003'),
    ]);

    admin = await prisma.user.findUnique({ where: { username: 'admin' } });
    lecturer = await prisma.dosen.findUnique({ where: { nidn: '198501152010121002' } });
    const course = await prisma.course.findUnique({ where: { code: 'TIF101' } });

    const students = await prisma.mahasiswa.findMany({
      where: { nim: { in: ['2024001001', '2024001002'] } },
    });
    student1 = students.find((student) => student.nim === '2024001001');
    student2 = students.find((student) => student.nim === '2024001002');

    testClass = await prisma.class.create({
      data: {
        course_id: course.id,
        lecturer_id: lecturer.id,
        academic_year: '2026/2027',
        semester: 'ganjil',
        name: `TEST-ATT-${suffix}`,
        capacity: 40,
      },
    });

    await prisma.meeting.createMany({
      data: ACADEMIC.generate16Meetings().map((meeting) => ({
        class_id: testClass.id,
        meeting_number: meeting.meeting_number,
        title: meeting.title,
        is_exam: meeting.is_exam,
        exam_type: meeting.exam_type || 'NONE',
      })),
    });

    const meetings = await prisma.meeting.findMany({
      where: { class_id: testClass.id },
      orderBy: { meeting_number: 'asc' },
    });
    meeting1 = meetings[0];
    meeting2 = meetings[1];
    meeting3 = meetings[2];
    meeting4 = meetings[3];

    await prisma.enrollment.createMany({
      data: [student1, student2].map((student) => ({
        class_id: testClass.id,
        student_id: student.id,
        enrolled_by: admin.id,
      })),
    });
  });

  after(async () => {
    if (auditedEntityIds.size > 0) {
      await prisma.auditLog.deleteMany({
        where: { entity_id: { in: [...auditedEntityIds] } },
      });
    }

    if (testClass?.id) {
      await prisma.class.delete({ where: { id: testClass.id } }).catch(() => {});
    }

    await cleanupTestArtifacts(prisma);
    await new Promise((resolve) => server.close(resolve));
  });

  test('Mahasiswa tidak dapat membuka sesi presensi (403)', async () => {
    const response = await openSession(meeting1.id, mahasiswa1Token);
    assert.equal(response.status, 403);
  });

  test('Dosen yang bukan pengampu kelas ditolak membuka sesi (403)', async () => {
    const response = await openSession(meeting1.id, dosenLainToken);
    const payload = await response.json();

    assert.equal(response.status, 403);
    assert.match(payload.message, /hanya dosen pengampu kelas atau admin/i);
  });

  test('Dosen pengampu membuka sesi presensi pertemuan', async () => {
    const response = await openSession(meeting1.id);
    const payload = await response.json();

    assert.equal(response.status, 200);
    assert.equal(payload.data.status, 'OPEN');
    assert.ok(payload.data.opened_at, 'opened_at harus terisi');
    assert.equal(payload.data.meeting_id, meeting1.id);

    session1Id = payload.data.id;
    auditedEntityIds.add(session1Id);
  });

  test('Membuka sesi yang sudah OPEN ditolak (409)', async () => {
    const response = await openSession(meeting1.id);
    assert.equal(response.status, 409);
  });

  test('Mahasiswa di luar kelas ditolak melakukan check-in (403)', async () => {
    const response = await checkIn(session1Id, mahasiswaLuarToken);
    const payload = await response.json();

    assert.equal(response.status, 403);
    assert.match(payload.message, /tidak terdaftar/i);
  });

  test('Mahasiswa terdaftar berhasil check-in saat sesi OPEN', async () => {
    const response = await checkIn(session1Id, mahasiswa1Token);
    const payload = await response.json();

    assert.equal(response.status, 201);
    assert.equal(payload.data.status, 'HADIR');
    assert.equal(payload.data.student_id, student1.id);
    assert.ok(payload.data.recorded_at, 'recorded_at harus terisi');

    record1Id = payload.data.id;
    auditedEntityIds.add(record1Id);
  });

  test('Check-in ganda pada sesi yang sama ditolak (409)', async () => {
    const response = await checkIn(session1Id, mahasiswa1Token);
    const payload = await response.json();

    assert.equal(response.status, 409);
    assert.match(payload.message, /sudah melakukan check-in/i);
  });

  test('Dosen pengampu melihat daftar kehadiran termasuk yang belum check-in', async () => {
    const response = await request(`/api/attendance/${session1Id}/records`, {
      token: dosenToken,
    });
    const payload = await response.json();

    assert.equal(response.status, 200);
    assert.equal(payload.data.summary.total_students, 2);
    assert.equal(payload.data.summary.hadir, 1);
    assert.equal(payload.data.summary.not_recorded, 1);

    const record = payload.data.records.find((item) => item.student_id === student1.id);
    assert.equal(record.status, 'HADIR');

    const belumCheckIn = payload.data.records.find((item) => item.student_id === student2.id);
    assert.equal(belumCheckIn.id, null);
    assert.equal(belumCheckIn.status, null);
  });

  test('Mahasiswa dan dosen non-pengampu tidak dapat melihat daftar kehadiran (403)', async () => {
    const [asStudent, asOtherLecturer] = await Promise.all([
      request(`/api/attendance/${session1Id}/records`, { token: mahasiswa1Token }),
      request(`/api/attendance/${session1Id}/records`, { token: dosenLainToken }),
    ]);

    assert.equal(asStudent.status, 403);
    assert.equal(asOtherLecturer.status, 403);
  });

  test('Dosen pengampu menutup sesi presensi', async () => {
    const response = await closeSession(meeting1.id);
    const payload = await response.json();

    assert.equal(response.status, 200);
    assert.equal(payload.data.status, 'CLOSED');
    assert.ok(payload.data.closed_at, 'closed_at harus terisi');
  });

  test('Check-in setelah sesi ditutup ditolak dengan pesan yang disepakati (400)', async () => {
    const response = await checkIn(session1Id, mahasiswa2Token);
    const payload = await response.json();

    assert.equal(response.status, 400);
    assert.equal(payload.message, ATTENDANCE_CLOSED_MESSAGE);
  });

  test('Penutupan sesi menetapkan ALPA bagi mahasiswa yang belum check-in', async () => {
    const response = await request(`/api/attendance/${session1Id}/records`, {
      token: dosenToken,
    });
    const payload = await response.json();

    assert.equal(response.status, 200);
    assert.equal(payload.data.summary.alpa, 1);
    assert.equal(payload.data.summary.recorded_count, 2);
    assert.equal(payload.data.summary.not_recorded, 0);

    const record = payload.data.records.find((item) => item.student_id === student2.id);
    assert.equal(record.status, 'ALPA');
    assert.equal(record.notes, AUTO_ABSENCE_NOTE);

    record2Id = record.id;
    auditedEntityIds.add(record2Id);
  });

  test('Dosen mengoreksi status kehadiran mahasiswa beserta catatan', async () => {
    const response = await request(`/api/attendance/records/${record2Id}`, {
      method: 'PUT',
      token: dosenToken,
      body: { status: 'IZIN', notes: 'Surat izin orang tua' },
    });
    const payload = await response.json();

    assert.equal(response.status, 200);
    assert.equal(payload.data.status, 'IZIN');
    assert.equal(payload.data.notes, 'Surat izin orang tua');

    const stored = await prisma.attendanceRecord.findUnique({ where: { id: record2Id } });
    assert.equal(stored.status, 'IZIN');
  });

  test('Koreksi dengan status di luar enum ditolak (400)', async () => {
    const response = await request(`/api/attendance/records/${record2Id}`, {
      method: 'PUT',
      token: dosenToken,
      body: { status: 'BOLOS' },
    });
    const payload = await response.json();

    assert.equal(response.status, 400);
    assert.equal(payload.message, 'Validasi input gagal');
  });

  test('Dosen non-pengampu tidak dapat mengoreksi kehadiran (403)', async () => {
    const response = await request(`/api/attendance/records/${record2Id}`, {
      method: 'PUT',
      token: dosenLainToken,
      body: { status: 'HADIR' },
    });

    assert.equal(response.status, 403);
  });

  test('Parameter sesi presensi yang bukan UUID ditolak (400)', async () => {
    const response = await request('/api/attendance/bukan-uuid/records', {
      token: adminToken,
    });

    assert.equal(response.status, 400);
  });

  test('Pembukaan dan penutupan sesi tercatat pada audit_logs', async () => {
    const logs = await prisma.auditLog.findMany({
      where: {
        entity: AUDIT_ENTITIES.ATTENDANCE_SESSIONS,
        entity_id: session1Id,
      },
      orderBy: { created_at: 'asc' },
    });

    assert.deepEqual(
      logs.map((log) => log.action),
      ['OPEN_ATTENDANCE_SESSION', 'CLOSE_ATTENDANCE_SESSION']
    );
    assert.equal(logs[1].new_values.status, 'CLOSED');
  });

  test('Koreksi kehadiran tercatat pada audit_logs', async () => {
    const logs = await prisma.auditLog.findMany({
      where: {
        entity: AUDIT_ENTITIES.ATTENDANCE_RECORDS,
        entity_id: record2Id,
      },
    });

    assert.equal(logs.length, 1);
    assert.equal(logs[0].action, 'UPDATE_ATTENDANCE_RECORD');
    assert.equal(logs[0].old_values.status, 'ALPA');
    assert.equal(logs[0].new_values.status, 'IZIN');
  });

  test('Admin dapat membuka ulang sesi dan ALPA otomatis dibersihkan', async () => {
    const opened = await openSession(meeting2.id);
    const openedPayload = await opened.json();
    assert.equal(opened.status, 200);
    session2Id = openedPayload.data.id;
    auditedEntityIds.add(session2Id);

    const checkedIn = await checkIn(session2Id, mahasiswa1Token);
    assert.equal(checkedIn.status, 201);
    const checkedInPayload = await checkedIn.json();
    auditedEntityIds.add(checkedInPayload.data.id);

    const closed = await closeSession(meeting2.id);
    assert.equal(closed.status, 200);

    const beforeReopen = await request(`/api/attendance/${session2Id}/records`, {
      token: dosenToken,
    });
    const beforePayload = await beforeReopen.json();
    assert.equal(beforePayload.data.summary.alpa, 1);

    const reopened = await openSession(meeting2.id, adminToken);
    assert.equal(reopened.status, 200);
    assert.equal((await reopened.json()).data.status, 'OPEN');

    const afterReopen = await request(`/api/attendance/${session2Id}/records`, {
      token: dosenToken,
    });
    const afterPayload = await afterReopen.json();
    assert.equal(afterPayload.data.summary.hadir, 1);
    assert.equal(afterPayload.data.summary.not_recorded, 1);

    const secondChance = await checkIn(session2Id, mahasiswa2Token);
    const secondChancePayload = await secondChance.json();
    assert.equal(secondChance.status, 201);
    assert.equal(secondChancePayload.data.status, 'HADIR');
    auditedEntityIds.add(secondChancePayload.data.id);

    const finalClose = await closeSession(meeting2.id, adminToken);
    assert.equal(finalClose.status, 200);
  });

  /**
   * Penutup Blocker 1: `tolerance_minutes` yang dikirim dosen harus benar-benar
   * tersimpan dan dikembalikan apa adanya — bukan dibuang diam-diam sementara
   * respons tetap memuat field tersebut.
   */
  test('Dosen dapat menyetel batas toleransi menit saat membuka sesi', async () => {
    const response = await openSession(meeting3.id, dosenToken, { tolerance_minutes: 45 });
    const payload = await response.json();

    assert.equal(response.status, 200);
    assert.equal(payload.data.tolerance_minutes, 45);

    session3Id = payload.data.id;
    auditedEntityIds.add(session3Id);

    const stored = await prisma.attendanceSession.findUnique({ where: { id: session3Id } });
    assert.equal(stored.tolerance_minutes, 45);
  });

  test('Nilai toleransi menit di luar batas atau bukan angka ditolak (400)', async () => {
    const [nonNumeric, tooLarge, tooSmall, unknownField] = await Promise.all([
      openSession(meeting4.id, dosenToken, { tolerance_minutes: 'lima belas' }),
      openSession(meeting4.id, dosenToken, { tolerance_minutes: 5000 }),
      openSession(meeting4.id, dosenToken, { tolerance_minutes: 0 }),
      openSession(meeting4.id, dosenToken, { toleransi: 15 }),
    ]);

    for (const response of [nonNumeric, tooLarge, tooSmall, unknownField]) {
      assert.equal(response.status, 400);
      assert.equal((await response.json()).message, 'Validasi input gagal');
    }
  });

  /**
   * Penutup Blocker 2a: koreksi tanpa `notes` tidak boleh menyisakan catatan
   * penanda ALPA otomatis pada baris yang sudah dosen koreksi.
   */
  test('Koreksi tanpa catatan membersihkan penanda ALPA otomatis', async () => {
    const closed = await closeSession(meeting3.id);
    assert.equal(closed.status, 200);

    const records = await prisma.attendanceRecord.findMany({
      where: { session_id: session3Id, student_id: student1.id },
    });
    assert.equal(records.length, 1);
    assert.equal(records[0].notes, AUTO_ABSENCE_NOTE);
    assert.equal(records[0].is_auto_generated, true);

    const corrected = await request(`/api/attendance/records/${records[0].id}`, {
      method: 'PUT',
      token: dosenToken,
      body: { status: 'IZIN' },
    });
    const payload = await corrected.json();
    auditedEntityIds.add(records[0].id);

    assert.equal(corrected.status, 200);
    assert.equal(payload.data.status, 'IZIN');
    assert.equal(payload.data.notes, null, 'catatan penanda ALPA harus dibersihkan');

    const stored = await prisma.attendanceRecord.findUnique({ where: { id: records[0].id } });
    assert.equal(stored.notes, null);
    assert.equal(stored.is_auto_generated, false);
  });

  /**
   * Penutup Blocker 2b: ALPA yang sengaja ditetapkan dosen harus bertahan saat
   * sesi dibuka ulang — hanya ALPA buatan sistem yang boleh dibersihkan.
   */
  test('ALPA yang ditetapkan dosen bertahan saat sesi dibuka ulang', async () => {
    const records = await prisma.attendanceRecord.findMany({
      where: { session_id: session3Id, student_id: student2.id },
    });
    assert.equal(records.length, 1);
    assert.equal(records[0].is_auto_generated, true);

    // Dosen menetapkan ALPA secara eksplisit, tanpa catatan.
    auditedEntityIds.add(records[0].id);
    const corrected = await request(`/api/attendance/records/${records[0].id}`, {
      method: 'PUT',
      token: dosenToken,
      body: { status: 'ALPA' },
    });
    assert.equal(corrected.status, 200);

    const afterCorrection = await prisma.attendanceRecord.findUnique({
      where: { id: records[0].id },
    });
    assert.equal(afterCorrection.status, 'ALPA');
    assert.equal(afterCorrection.is_auto_generated, false);

    // Buka ulang: ALPA otomatis dibersihkan, ALPA manual dosen tetap ada.
    const reopened = await openSession(meeting3.id);
    assert.equal(reopened.status, 200);

    const survived = await prisma.attendanceRecord.findUnique({
      where: { id: records[0].id },
    });
    assert.ok(survived, 'ALPA yang ditetapkan dosen tidak boleh terhapus saat buka ulang');
    assert.equal(survived.status, 'ALPA');

    const autoRows = await prisma.attendanceRecord.findMany({
      where: { session_id: session3Id, is_auto_generated: true },
    });
    assert.equal(autoRows.length, 0, 'seluruh ALPA otomatis harus dibersihkan');
  });
});
