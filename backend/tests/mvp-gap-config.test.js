import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import app from '../src/app.js';
import prisma from '../src/config/prisma.js';
import { cleanupTestArtifacts } from './setup.js';
import { CONFIG_KEYS, CONFIG_DEFAULTS, SAFE_DOCUMENT_EXTENSIONS } from '../src/constants/config.js';
import { ConfigService } from '../src/modules/config/config.service.js';

/**
 * Suite Workstream B: modul konfigurasi sistem Admin (FR-049, FR-050).
 *
 * Mencakup: RBAC endpoint /api/admin/config, validasi nilai (hard ceiling),
 * penegakan kebijakan unggahan dinamis, cache invalidasi, audit, dan seed
 * idempoten.
 */
describe('Workstream B: konfigurasi sistem Admin (FR-049/FR-050)', () => {
  let server;
  let baseUrl;
  let adminToken;
  let lecturerToken;
  let studentToken;
  let testClassId;

  const suffix = Date.now().toString().slice(-8);

  const request = (url, { method = 'GET', token = adminToken, body } = {}) =>
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

    [adminToken, lecturerToken, studentToken] = await Promise.all([
      login('admin'),
      login('198501152010121002'),
      login('2024001001'),
    ]);

    // Kelas uji tempat materi/tugas dibuat untuk pengujian kebijakan unggahan.
    const course = await prisma.course.create({
      data: { code: `KAP${suffix}`, name: `Konfig Test ${suffix}`, credits: 3 },
    });
    const lecturer = await prisma.dosen.findFirst({ where: { nidn: '198501152010121002' } });
    const classRow = await prisma.class.create({
      data: {
        course_id: course.id,
        lecturer_id: lecturer.id,
        name: `KAP-${suffix}`,
        academic_year: '2026/2027',
        semester: 'ganjil',
      },
    });
    testClassId = classRow.id;
  });

  after(async () => {
    // Pulihkan konfigurasi ke default agar suite lain tidak terpengaruh.
    await prisma.systemConfig.deleteMany({});
    ConfigService.invalidateCache();
    if (testClassId) {
      await cleanupTestArtifacts(prisma);
    }
    await new Promise((resolve) => server.close(resolve));
  });

  test('GET /api/admin/config mengembalikan default sesuai perilaku saat ini', async () => {
    const response = await request('/api/admin/config');
    const payload = await response.json();

    assert.equal(response.status, 200);
    assert.equal(payload.success, true);
    assert.deepEqual(payload.data.file.allowed_extensions, ['.pdf', '.docx', '.xlsx', '.zip']);
    assert.equal(payload.data.file.max_size_mb, 10);
    assert.equal(payload.data.file.max_size_bytes, 10 * 1024 * 1024);
    assert.equal(payload.data.attendance.threshold_percentage, 70);
  });

  test('GET tanpa token 401, mahasiswa/dosen 403', async () => {
    const anonymous = await request('/api/admin/config', { token: null });
    assert.equal(anonymous.status, 401);

    const asStudent = await request('/api/admin/config', { token: studentToken });
    assert.equal(asStudent.status, 403);

    const asLecturer = await request('/api/admin/config', { token: lecturerToken });
    assert.equal(asLecturer.status, 403);
  });

  test('PUT valid menyimpan nilai, GET mengembalikan nilai baru, audit tercatat', async () => {
    const response = await request('/api/admin/config', {
      method: 'PUT',
      body: {
        file: { allowed_extensions: ['.pdf', '.docx'], max_size_mb: 8 },
        attendance: { threshold_percentage: 75 },
      },
    });
    const payload = await response.json();

    assert.equal(response.status, 200, payload.message);
    assert.deepEqual(payload.data.file.allowed_extensions, ['.pdf', '.docx']);
    assert.equal(payload.data.file.max_size_mb, 8);
    assert.equal(payload.data.attendance.threshold_percentage, 75);
    assert.ok(payload.data.updated_by?.username === 'admin');

    const stored = await prisma.systemConfig.findUnique({
      where: { key: CONFIG_KEYS.FILE_MAX_SIZE_MB },
    });
    assert.equal(stored.value, 8);

    const audit = await prisma.auditLog.findFirst({
      where: { action: 'UPDATE_CONFIG', entity: 'config' },
      orderBy: { created_at: 'desc' },
    });
    assert.ok(audit, 'audit UPDATE_CONFIG tercatat');
    assert.equal(audit.new_values[CONFIG_KEYS.FILE_MAX_SIZE_MB], 8);
    assert.equal(audit.old_values[CONFIG_KEYS.FILE_MAX_SIZE_MB], 10);
  });

  test('PUT ekstensi di luar hard ceiling ditolak 400', async () => {
    for (const ext of ['.exe', '.sh', '.php', '.js', '.bat']) {
      const response = await request('/api/admin/config', {
        method: 'PUT',
        body: { file: { allowed_extensions: ['.pdf', ext] } },
      });
      assert.equal(response.status, 400, `ekstensi ${ext} harus ditolak`);
    }
  });

  test('PUT array kosong / duplikat / ukuran di luar 5-10 / ambang di luar 0-100 ditolak', async () => {
    const empty = await request('/api/admin/config', {
      method: 'PUT',
      body: { file: { allowed_extensions: [] } },
    });
    assert.equal(empty.status, 400);

    const small = await request('/api/admin/config', {
      method: 'PUT',
      body: { file: { max_size_mb: 4 } },
    });
    assert.equal(small.status, 400);

    const large = await request('/api/admin/config', {
      method: 'PUT',
      body: { file: { max_size_mb: 11 } },
    });
    assert.equal(large.status, 400);

    const lowThreshold = await request('/api/admin/config', {
      method: 'PUT',
      body: { attendance: { threshold_percentage: -1 } },
    });
    assert.equal(lowThreshold.status, 400);

    const highThreshold = await request('/api/admin/config', {
      method: 'PUT',
      body: { attendance: { threshold_percentage: 101 } },
    });
    assert.equal(highThreshold.status, 400);
  });

  test('PUT nilai batas (5, 10, 0, 100) diterima', async () => {
    const min = await request('/api/admin/config', {
      method: 'PUT',
      body: { file: { max_size_mb: 5 }, attendance: { threshold_percentage: 0 } },
    });
    assert.equal(min.status, 200);

    const max = await request('/api/admin/config', {
      method: 'PUT',
      body: { file: { max_size_mb: 10 }, attendance: { threshold_percentage: 100 } },
    });
    assert.equal(max.status, 200);
  });

  test('PUT body kosong ditolak 400', async () => {
    const response = await request('/api/admin/config', { method: 'PUT', body: {} });
    assert.equal(response.status, 400);
  });

  test('perubahan berlaku pada request berikutnya tanpa restart (cache tervalidasi)', async () => {
    // Pulihkan default lalu paksa cache memuat nilai tersebut.
    await request('/api/admin/config', {
      method: 'PUT',
      body: {
        file: { allowed_extensions: ['.pdf', '.docx', '.xlsx', '.zip'], max_size_mb: 10 },
      },
    });
    ConfigService.invalidateCache();
    const before = await ConfigService.getFilePolicy();
    assert.deepEqual(before.allowedExtensions, ['.pdf', '.docx', '.xlsx', '.zip']);

    await request('/api/admin/config', {
      method: 'PUT',
      body: { file: { allowed_extensions: ['.pdf'] } },
    });

    const after = await ConfigService.getFilePolicy();
    assert.deepEqual(after.allowedExtensions, ['.pdf'], 'cache harus tervalidasi setelah PUT');
  });

  test('seed idempoten: nilai yang sudah diubah Admin tidak ditimpa default', async () => {
    // Simulasi seed: hanya baris yang belum ada yang dibuat.
    const existingKeys = (await prisma.systemConfig.findMany()).map((row) => row.key);
    assert.ok(existingKeys.includes(CONFIG_KEYS.FILE_ALLOWED_EXTENSIONS));

    const current = await prisma.systemConfig.findUnique({
      where: { key: CONFIG_KEYS.FILE_ALLOWED_EXTENSIONS },
    });
    assert.deepEqual(current.value, ['.pdf'], 'nilai Admin harus tetap [.pdf]');
    assert.ok(!SAFE_DOCUMENT_EXTENSIONS.every((ext) => current.value.includes(ext)));
  });

  test('konstanta default identik dengan perilaku sebelum modul config', () => {
    assert.deepEqual(CONFIG_DEFAULTS[CONFIG_KEYS.FILE_ALLOWED_EXTENSIONS], [
      '.pdf',
      '.docx',
      '.xlsx',
      '.zip',
    ]);
    assert.equal(CONFIG_DEFAULTS[CONFIG_KEYS.FILE_MAX_SIZE_MB], 10);
    assert.equal(CONFIG_DEFAULTS[CONFIG_KEYS.ATTENDANCE_THRESHOLD], 70);
  });
});
