import test from 'node:test';
import assert from 'node:assert/strict';
import app from '../src/app.js';
import prisma from '../src/config/prisma.js';

let server;
let baseUrl;

// Tokens for role-based testing
let superAdminToken;
let adminAkademikToken;
let adminLmsToken;
let mahasiswaToken;
let dosenToken;

async function loginUser(identifier, password = 'Password123!') {
  const res = await fetch(`${baseUrl}/api/v1/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifier, password }),
  });
  const data = await res.json();
  return data.data?.accessToken;
}

test.before(async () => {
  await new Promise((resolve) => {
    server = app.listen(0, () => {
      const port = server.address().port;
      baseUrl = `http://localhost:${port}`;
      console.log(`\n?? Phase 4 Test server listening on ${baseUrl}\n`);
      resolve();
    });
  });

  superAdminToken = await loginUser('superadmin');
  adminAkademikToken = await loginUser('admin_akademik');
  adminLmsToken = await loginUser('admin_lms');
  mahasiswaToken = await loginUser('2024001001');
  dosenToken = await loginUser('198501152010121002');
});

test.after(async () => {
  if (server) {
    await new Promise((resolve) => server.close(resolve));
  }
  await prisma.$disconnect();
});

// =========================================================================
// 1. KEAMANAN & RBAC PADA MASTER DATA & KALENDER
// =========================================================================
test('1. Security & RBAC: Penolakan endpoint master & kalender tanpa token', async () => {
  const endpoints = [
    '/api/v1/master/fakultas',
    '/api/v1/master/prodi',
    '/api/v1/master/tahun-akademik',
    '/api/v1/master/semester',
    '/api/v1/master/kurikulum',
    '/api/v1/master/mata-kuliah',
    '/api/v1/master/gedung',
    '/api/v1/master/ruangan',
    '/api/v1/master/kelas',
    '/api/v1/calendar',
  ];

  for (const ep of endpoints) {
    const res = await fetch(`${baseUrl}${ep}`);
    assert.equal(res.status, 401, `Endpoint ${ep} seharusnya menolak request tanpa token`);
    const data = await res.json();
    assert.equal(data.success, false);
  }
});

test('2. Security & RBAC: Pembatasan hak akses role mahasiswa pada master data mutasi', async () => {
  // Mahasiswa dilarang membuat fakultas
  const resFak = await fetch(`${baseUrl}/api/v1/master/fakultas`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${mahasiswaToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ kode: 'FH', nama: 'Fakultas Hukum' }),
  });
  assert.equal(resFak.status, 403);

  // Mahasiswa dilarang membuat agenda kalender
  const resCal = await fetch(`${baseUrl}/api/v1/calendar`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${mahasiswaToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      semester_id: '00000000-0000-0000-0000-000000000000',
      agenda: 'Agenda Ilegal Mahasiswa',
      mulai: '2026-09-01T00:00:00.000Z',
      selesai: '2026-09-02T00:00:00.000Z',
    }),
  });
  assert.equal(resCal.status, 403);
});

// =========================================================================
// 2. CRUD MASTER FAKULTAS & PROGRAM STUDI
// =========================================================================
let testFakultasId;
let testProdiId;

test('3. Master Kelembagaan: CRUD Fakultas dengan validasi format dan keunikan', async () => {
  // A. Tambah Fakultas baru oleh Admin Akademik
  const resCreate = await fetch(`${baseUrl}/api/v1/master/fakultas`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${adminAkademikToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      kode: 'FEB',
      nama: 'Fakultas Ekonomi dan Bisnis',
      is_active: true,
    }),
  });
  const dataCreate = await resCreate.json();
  assert.equal(resCreate.status, 201);
  assert.equal(dataCreate.success, true);
  assert.equal(dataCreate.data.kode, 'FEB');
  testFakultasId = dataCreate.data.id;

  // B. Validasi duplikasi kode fakultas ditolak (409)
  const resDup = await fetch(`${baseUrl}/api/v1/master/fakultas`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${adminAkademikToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      kode: 'FEB',
      nama: 'Fakultas Ekonomi Bisnis Cabang',
    }),
  });
  assert.equal(resDup.status, 409);

  // C. Ambil daftar fakultas dengan standar pagination & search
  const resList = await fetch(`${baseUrl}/api/v1/master/fakultas?search=Ekonomi&page=1&limit=10`, {
    headers: { Authorization: `Bearer ${adminAkademikToken}` },
  });
  const dataList = await resList.json();
  assert.equal(resList.status, 200);
  assert.equal(dataList.success, true);
  assert.ok(dataList.meta);
  assert.equal(dataList.meta.page, 1);
  assert.ok(dataList.data.length >= 1);
  assert.equal(dataList.data[0].kode, 'FEB');

  // D. Ambil detail fakultas
  const resDetail = await fetch(`${baseUrl}/api/v1/master/fakultas/${testFakultasId}`, {
    headers: { Authorization: `Bearer ${adminAkademikToken}` },
  });
  const dataDetail = await resDetail.json();
  assert.equal(resDetail.status, 200);
  assert.equal(dataDetail.data.nama, 'Fakultas Ekonomi dan Bisnis');

  // E. Update nama fakultas
  const resUpdate = await fetch(`${baseUrl}/api/v1/master/fakultas/${testFakultasId}`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${adminAkademikToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      nama: 'Fakultas Ekonomi, Bisnis & Humaniora',
    }),
  });
  const dataUpdate = await resUpdate.json();
  assert.equal(resUpdate.status, 200);
  assert.equal(dataUpdate.data.nama, 'Fakultas Ekonomi, Bisnis & Humaniora');
});

test('4. Master Kelembagaan: CRUD Program Studi dengan foreign key Fakultas', async () => {
  // A. Tambah Program Studi baru
  const resCreate = await fetch(`${baseUrl}/api/v1/master/prodi`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${adminAkademikToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      fakultas_id: testFakultasId,
      kode: 'MNJ',
      nama: 'Manajemen Bisnis Digital',
      jenjang: 'S1',
    }),
  });
  const dataCreate = await resCreate.json();
  assert.equal(resCreate.status, 201);
  assert.equal(dataCreate.success, true);
  assert.equal(dataCreate.data.kode, 'MNJ');
  assert.equal(dataCreate.data.fakultas_id, testFakultasId);
  testProdiId = dataCreate.data.id;

  // B. Fakultas tidak boleh dihapus jika masih ada Prodi terkait
  const resDelFak = await fetch(`${baseUrl}/api/v1/master/fakultas/${testFakultasId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${adminAkademikToken}` },
  });
  assert.equal(resDelFak.status, 400);

  // C. Update Program Studi
  const resUpdate = await fetch(`${baseUrl}/api/v1/master/prodi/${testProdiId}`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${adminAkademikToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      nama: 'Manajemen Keuangan & Bisnis Digital',
    }),
  });
  assert.equal(resUpdate.status, 200);
});

// =========================================================================
// 3. MASTER TAHUN AKADEMIK & SEMESTER + ATURAN BISNIS SATU SEMESTER AKTIF
// =========================================================================
let testTaId;
let testSemGanjilId;
let testSemGenapId;

test('5. Master Akademik: Tahun Akademik & Validasi Semester (Hanya 1 Semester Aktif)', async () => {
  // A. Tambah Tahun Akademik
  const resTa = await fetch(`${baseUrl}/api/v1/master/tahun-akademik`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${adminAkademikToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      kode: '2027/2028',
      nama: 'Tahun Ajaran 2027/2028',
    }),
  });
  const dataTa = await resTa.json();
  assert.equal(resTa.status, 201);
  testTaId = dataTa.data.id;

  // B. Tambah Semester Ganjil (status is_active: false)
  const resSem1 = await fetch(`${baseUrl}/api/v1/master/semester`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${adminAkademikToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      tahun_akademik_id: testTaId,
      tipe: 'GANJIL',
      tanggal_mulai: '2027-09-01T00:00:00.000Z',
      tanggal_selesai: '2028-01-31T23:59:59.000Z',
      is_active: false,
    }),
  });
  const dataSem1 = await resSem1.json();
  assert.equal(resSem1.status, 201);
  testSemGanjilId = dataSem1.data.id;

  // C. Tambah Semester Genap (status is_active: false)
  const resSem2 = await fetch(`${baseUrl}/api/v1/master/semester`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${adminAkademikToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      tahun_akademik_id: testTaId,
      tipe: 'GENAP',
      tanggal_mulai: '2028-02-01T00:00:00.000Z',
      tanggal_selesai: '2028-06-30T23:59:59.000Z',
      is_active: false,
    }),
  });
  const dataSem2 = await resSem2.json();
  assert.equal(resSem2.status, 201);
  testSemGenapId = dataSem2.data.id;

  // D. Validasi duplikasi tipe semester pada tahun akademik yang sama ditolak (409)
  const resDupSem = await fetch(`${baseUrl}/api/v1/master/semester`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${adminAkademikToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      tahun_akademik_id: testTaId,
      tipe: 'GANJIL',
      tanggal_mulai: '2027-09-01T00:00:00.000Z',
      tanggal_selesai: '2028-01-31T23:59:59.000Z',
    }),
  });
  assert.equal(resDupSem.status, 409);

  // E. Validasi urutan tanggal (tanggal_mulai harus < tanggal_selesai)
  const resInvalidDate = await fetch(`${baseUrl}/api/v1/master/semester`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${adminAkademikToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      tahun_akademik_id: testTaId,
      tipe: 'ANTARA',
      tanggal_mulai: '2028-08-01T00:00:00.000Z',
      tanggal_selesai: '2028-07-01T00:00:00.000Z', // Tanggal selesai lebih awal
    }),
  });
  assert.equal(resInvalidDate.status, 400);

  // F. UJI ATURAN BISNIS: Aktifkan Semester Ganjil 2027/2028
  const resAct1 = await fetch(`${baseUrl}/api/v1/master/semester/${testSemGanjilId}/activate`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${adminAkademikToken}` },
  });
  const dataAct1 = await resAct1.json();
  assert.equal(resAct1.status, 200);
  assert.equal(dataAct1.data.is_active, true);

  // Verifikasi hanya ada 1 semester aktif di seluruh sistem
  const activeCount1 = await prisma.semester.count({ where: { is_active: true } });
  assert.equal(activeCount1, 1, 'Harus tepat 1 semester aktif di seluruh database');

  // G. UJI ATURAN BISNIS: Aktifkan Semester Genap 2027/2028
  const resAct2 = await fetch(`${baseUrl}/api/v1/master/semester/${testSemGenapId}/activate`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${adminAkademikToken}` },
  });
  assert.equal(resAct2.status, 200);

  // Verifikasi semester ganjil otomatis menjadi tidak aktif
  const semGanjilUpdated = await prisma.semester.findUnique({ where: { id: testSemGanjilId } });
  const semGenapUpdated = await prisma.semester.findUnique({ where: { id: testSemGenapId } });
  assert.equal(semGanjilUpdated.is_active, false);
  assert.equal(semGenapUpdated.is_active, true);

  const activeCount2 = await prisma.semester.count({ where: { is_active: true } });
  assert.equal(activeCount2, 1, 'Hanya ada 1 semester aktif setelah mutasi');

  // Kembalikan ke semester bawaan seeder 2026/2027 Ganjil agar tidak merusak konteks data lain
  const seedSemester = await prisma.semester.findFirst({
    where: { tahun_akademik: { kode: '2026/2027' }, tipe: 'GANJIL' },
  });
  if (seedSemester) {
    await fetch(`${baseUrl}/api/v1/master/semester/${seedSemester.id}/activate`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${adminAkademikToken}` },
    });
  }
});

// =========================================================================
// 4. CRUD KURIKULUM, MATA KULIAH, FASILITAS (GEDUNG & RUANGAN), DAN KELAS
// =========================================================================
let testKurikulumId;
let testMatkulId;
let testGedungId;
let testRuanganId;
let testKelasId;

test('6. Master Fasilitas & Kurikulum: Gedung, Ruangan, Kurikulum, dan Mata Kuliah', async () => {
  // A. Admin LMS berhak mengelola Fasilitas Gedung (SRS Bab 4.5)
  const resGedung = await fetch(`${baseUrl}/api/v1/master/gedung`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${adminLmsToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      kode: 'G-MNJ',
      nama: 'Gedung Bisnis & Laboratorium Manajemen',
    }),
  });
  const dataGedung = await resGedung.json();
  assert.equal(resGedung.status, 201);
  testGedungId = dataGedung.data.id;

  // B. Tambah Ruangan Kelas oleh Admin LMS
  const resRuangan = await fetch(`${baseUrl}/api/v1/master/ruangan`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${adminLmsToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      gedung_id: testGedungId,
      kode: 'R-MNJ-101',
      nama: 'Ruang Seminar Manajemen 101',
      kapasitas: 45,
    }),
  });
  const dataRuangan = await resRuangan.json();
  assert.equal(resRuangan.status, 201);
  testRuanganId = dataRuangan.data.id;

  // C. Tambah Kurikulum oleh Admin Akademik
  const resKur = await fetch(`${baseUrl}/api/v1/master/kurikulum`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${adminAkademikToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      prodi_id: testProdiId,
      nama: 'Kurikulum OBE Manajemen 2026',
      tahun_mulai: 2026,
    }),
  });
  const dataKur = await resKur.json();
  assert.equal(resKur.status, 201);
  testKurikulumId = dataKur.data.id;

  // D. Tambah Mata Kuliah
  const resMk = await fetch(`${baseUrl}/api/v1/master/mata-kuliah`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${adminAkademikToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      kurikulum_id: testKurikulumId,
      kode: 'MNJ-101',
      nama: 'Pengantar Manajemen Strategis',
      sks: 3,
      sks_teori: 3,
      sks_praktik: 0,
      semester_paket: 1,
      is_wajib: true,
    }),
  });
  const dataMk = await resMk.json();
  assert.equal(resMk.status, 201);
  testMatkulId = dataMk.data.id;
});

test('7. Master Kelas: Buka penawaran kelas untuk semester aktif', async () => {
  // Ambil dosen pengampu dari seeder
  const dosen = await prisma.dosen.findFirst({ where: { is_active: true } });
  assert.ok(dosen, 'Dosen dari seeder harus ada');

  const activeSemester = await prisma.semester.findFirst({ where: { is_active: true } });
  assert.ok(activeSemester, 'Harus ada semester aktif untuk penawaran kelas');

  // Buka penawaran kelas baru
  const resKelas = await fetch(`${baseUrl}/api/v1/master/kelas`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${adminAkademikToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      mata_kuliah_id: testMatkulId,
      semester_id: activeSemester.id,
      dosen_id: dosen.id,
      ruangan_id: testRuanganId,
      kode_kelas: 'MNJ-1A',
      kapasitas: 40,
    }),
  });
  const dataKelas = await resKelas.json();
  assert.equal(resKelas.status, 201);
  assert.equal(dataKelas.success, true);
  assert.equal(dataKelas.data.kode_kelas, 'MNJ-1A');
  testKelasId = dataKelas.data.id;

  // Validasi duplikasi kode kelas pada mata kuliah & semester yang sama (409)
  const resDupKelas = await fetch(`${baseUrl}/api/v1/master/kelas`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${adminAkademikToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      mata_kuliah_id: testMatkulId,
      semester_id: activeSemester.id,
      dosen_id: dosen.id,
      kode_kelas: 'MNJ-1A',
    }),
  });
  assert.equal(resDupKelas.status, 409);

  // Ambil daftar penawaran kelas
  const resListKelas = await fetch(`${baseUrl}/api/v1/master/kelas?search=Pengantar`, {
    headers: { Authorization: `Bearer ${adminAkademikToken}` },
  });
  const dataListKelas = await resListKelas.json();
  assert.equal(resListKelas.status, 200);
  assert.ok(dataListKelas.data.length >= 1);
  assert.equal(dataListKelas.data[0].kode_kelas, 'MNJ-1A');
});

// =========================================================================
// 5. MODUL KALENDER AKADEMIK & ALIAS KONSEPTUAL
// =========================================================================
let testCalendarId;

test('8. Kalender Akademik: CRUD agenda akademik dan validasi kepatuhan SRS Bab 22', async () => {
  const activeSemester = await prisma.semester.findFirst({ where: { is_active: true } });

  // A. Admin Akademik membuat agenda baru
  const resCreate = await fetch(`${baseUrl}/api/v1/calendar`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${adminAkademikToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      semester_id: activeSemester.id,
      agenda: 'Masa Bimbingan Akademik & Pengajuan KRS Khusus',
      mulai: '2026-09-05T00:00:00.000Z',
      selesai: '2026-09-12T23:59:59.000Z',
      status: 'DIJADWALKAN',
    }),
  });
  const dataCreate = await resCreate.json();
  assert.equal(resCreate.status, 201);
  assert.equal(dataCreate.success, true);
  testCalendarId = dataCreate.data.id;

  // B. Mahasiswa dapat melihat kalender akademik (FR-130)
  const resViewMhs = await fetch(`${baseUrl}/api/v1/calendar`, {
    headers: { Authorization: `Bearer ${mahasiswaToken}` },
  });
  const dataViewMhs = await resViewMhs.json();
  assert.equal(resViewMhs.status, 200);
  assert.equal(dataViewMhs.success, true);
  assert.ok(dataViewMhs.data.length >= 1);

  // C. Dosen dapat melihat kalender akademik (FR-131)
  const resViewDosen = await fetch(`${baseUrl}/api/v1/calendar`, {
    headers: { Authorization: `Bearer ${dosenToken}` },
  });
  assert.equal(resViewDosen.status, 200);

  // D. Validasi Endpoint Konseptual SRS Bab 32: GET /api/calendar
  const resAlias = await fetch(`${baseUrl}/api/calendar`, {
    headers: { Authorization: `Bearer ${mahasiswaToken}` },
  });
  const dataAlias = await resAlias.json();
  assert.equal(resAlias.status, 200);
  assert.equal(dataAlias.success, true);
  assert.ok(Array.isArray(dataAlias.data));

  // E. Update agenda kalender
  const resUpdate = await fetch(`${baseUrl}/api/v1/calendar/${testCalendarId}`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${adminAkademikToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      status: 'BERJALAN',
    }),
  });
  const dataUpdate = await resUpdate.json();
  assert.equal(resUpdate.status, 200);
  assert.equal(dataUpdate.data.status, 'BERJALAN');

  // F. Hapus agenda kalender (FR-128)
  const resDel = await fetch(`${baseUrl}/api/v1/calendar/${testCalendarId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${adminAkademikToken}` },
  });
  assert.equal(resDel.status, 200);
});

// =========================================================================
// 6. STANDARISASI RESPON JSON & AUDIT TRAIL LOGGING
// =========================================================================
test('9. Response Standard: Struktur respons JSON konsisten { success, data, message, meta }', async () => {
  const res = await fetch(`${baseUrl}/api/v1/master/mata-kuliah?page=1&limit=5`, {
    headers: { Authorization: `Bearer ${adminAkademikToken}` },
  });
  const json = await res.json();

  assert.equal(res.status, 200);
  assert.equal(json.hasOwnProperty('success'), true);
  assert.equal(json.hasOwnProperty('data'), true);
  assert.equal(json.hasOwnProperty('message'), true);
  assert.equal(json.hasOwnProperty('meta'), true);
  assert.equal(typeof json.meta.page, 'number');
  assert.equal(typeof json.meta.limit, 'number');
  assert.equal(typeof json.meta.total, 'number');
  assert.equal(typeof json.meta.totalPages, 'number');
});

test('10. Audit Trail: Seluruh mutasi master data dan kalender terekam di AuditLog', async () => {
  const auditActions = await prisma.auditLog.findMany({
    where: {
      action: {
        in: [
          'CREATE_FAKULTAS',
          'CREATE_PRODI',
          'CREATE_TAHUN_AKADEMIK',
          'CREATE_SEMESTER',
          'ACTIVATE_SEMESTER',
          'CREATE_KURIKULUM',
          'CREATE_MATA_KULIAH',
          'CREATE_GEDUNG',
          'CREATE_RUANGAN',
          'CREATE_KELAS',
          'CREATE_CALENDAR',
          'UPDATE_CALENDAR',
          'DELETE_CALENDAR',
        ],
      },
    },
  });

  assert.ok(auditActions.length >= 10, 'Setiap mutasi penting harus memiliki entri audit');
  const sample = auditActions[0];
  assert.ok(sample.user_id, 'Audit log harus mencatat ID user pelaku mutasi');
  assert.ok(sample.entity, 'Audit log harus mencatat entitas target');
  assert.ok(sample.action, 'Audit log harus mencatat nama aksi');
});

// Bersihkan data uji setelah pengujian selesai
test('11. Cleanup: Menghapus data master pengujian secara cascading tertib', async () => {
  if (testKelasId) {
    await prisma.kelas.delete({ where: { id: testKelasId } }).catch(() => {});
  }
  if (testRuanganId) {
    await prisma.ruangan.delete({ where: { id: testRuanganId } }).catch(() => {});
  }
  if (testGedungId) {
    await prisma.gedung.delete({ where: { id: testGedungId } }).catch(() => {});
  }
  if (testMatkulId) {
    await prisma.mataKuliah.delete({ where: { id: testMatkulId } }).catch(() => {});
  }
  if (testKurikulumId) {
    await prisma.kurikulum.delete({ where: { id: testKurikulumId } }).catch(() => {});
  }
  if (testProdiId) {
    await prisma.programStudi.delete({ where: { id: testProdiId } }).catch(() => {});
  }
  if (testFakultasId) {
    await prisma.fakultas.delete({ where: { id: testFakultasId } }).catch(() => {});
  }
  if (testSemGanjilId) {
    await prisma.semester.delete({ where: { id: testSemGanjilId } }).catch(() => {});
  }
  if (testSemGenapId) {
    await prisma.semester.delete({ where: { id: testSemGenapId } }).catch(() => {});
  }
  if (testTaId) {
    await prisma.tahunAkademik.delete({ where: { id: testTaId } }).catch(() => {});
  }
});
