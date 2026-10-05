/**
 * Fase 11: Kalender Operasional + Integrasi Portal (SRS Bab 22, Bab 9, Bab 33)
 *
 * Cakupan (IMPLEMENTATION_PLAN_MVP2_BACKEND.md §6 Fase 11):
 *  1. Ekstensi modul calendar: filter `kategori`, endpoint `/aktif`.
 *  2. portal.service.js: PeriodeKRS sebagai sumber kebenaran status "KRS buka/tutup"
 *     (menggantikan heuristik pencocokan string 'krs'); dashboard mahasiswa kini
 *     menampilkan status KRS personal + sisa waktu periode + total SKS + catatan
 *     revisi bila dikembalikan; dashboard PA menampilkan antrian KRS menunggu.
 *  3. Backwards-compatible: shape `role_dashboards` lama tidak berubah, hanya
 *     bertambah field — suite phase5 tetap hijau.
 *  4. Kepatuhan SRS Bab 33: periode KRS tertutup → portal melaporkan tertutup.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import app from '../src/app.js';
import prisma from '../src/config/prisma.js';
import { hashPassword } from '../src/utils/password.js';

let server;
let baseUrl;
let tokenAdmin;
let tokenMahasiswa;
let tokenMahasiswaDikembalikan;
let tokenDosenWali;
let tokenCalonMhs;
let semesterId;
let periodeOperationalSebelum;
let activePeriodeSebelum = [];
const suffix = `phase11-${Date.now()}`;

async function request(path, { method = 'GET', token, body } = {}) {
  const response = await fetch(`${baseUrl}${path}`, {
    method,
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(body ? { 'Content-Type': 'application/json' } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  let data;
  try {
    data = await response.json();
  } catch {
    data = null;
  }
  return { response, data };
}

async function loginUser(identifier) {
  const login = await request('/api/v1/auth/login', {
    method: 'POST',
    body: { identifier, password: 'Password123!' },
  });
  assert.equal(login.response.status, 200, `login ${identifier} gagal`);
  return login.data.data.accessToken;
}

test.before(async () => {
  await new Promise((resolve) => {
    server = app.listen(0, () => {
      baseUrl = `http://localhost:${server.address().port}`;
      resolve();
    });
  });

  const operationalSemester = await prisma.semester.findFirst({
    where: { is_active: true },
    include: { tahun_akademik: true },
  });
  assert.ok(operationalSemester, 'semester operasional seed harus tersedia');
  semesterId = operationalSemester.id;

  // Snapshot & pastikan periode KRS seed aktif pada semester operasional
  activePeriodeSebelum = await prisma.periodeKRS.findMany({ where: { is_aktif: true } });
  periodeOperationalSebelum = await prisma.periodeKRS.findUnique({
    where: { semester_id: operationalSemester.id },
  });
  await prisma.periodeKRS.updateMany({
    where: { is_aktif: true, semester_id: { not: operationalSemester.id } },
    data: { is_aktif: false },
  });
  await prisma.periodeKRS.upsert({
    where: { semester_id: operationalSemester.id },
    update: {
      tanggal_mulai: new Date(Date.now() - 24 * 60 * 60 * 1000),
      tanggal_selesai: new Date(Date.now() + 24 * 60 * 60 * 1000),
      sks_maks: 24,
      is_aktif: true,
    },
    create: {
      semester_id: operationalSemester.id,
      nama: 'Periode Uji Fase 11',
      tanggal_mulai: new Date(Date.now() - 24 * 60 * 60 * 1000),
      tanggal_selesai: new Date(Date.now() + 24 * 60 * 60 * 1000),
      sks_maks: 24,
      is_aktif: true,
    },
  });

  const [roleMhs, roleDosenWali, roleAdmin, roleCalon, prodi, kurikulum, dosenSeed] = await Promise.all([
    prisma.role.findUnique({ where: { name: 'MAHASISWA' } }),
    prisma.role.findUnique({ where: { name: 'DOSEN_WALI' } }),
    prisma.role.findUnique({ where: { name: 'ADMIN_AKADEMIK' } }),
    prisma.role.findUnique({ where: { name: 'CALON_MAHASISWA' } }),
    prisma.programStudi.findFirst(),
    prisma.kurikulum.findFirst({ where: { is_active: true } }),
    prisma.dosen.findFirst(),
  ]);
  assert.ok(roleMhs && roleDosenWali && roleAdmin && roleCalon && prodi && kurikulum && dosenSeed, 'data seed MVP 1 harus tersedia');

  // PA pemilik untuk mahasiswa bimbingan uji
  const paUser = await prisma.user.create({
    data: {
      username: `${suffix}-pa`,
      email: `${suffix}-pa@kampus.test`,
      password_hash: await hashPassword('Password123!'),
      status: 'ACTIVE',
      user_roles: { create: { role_id: roleDosenWali.id } },
    },
  });
  const dosenWali = await prisma.dosen.create({
    data: {
      user_id: paUser.id,
      nidn: `00${suffix.slice(-8)}01`,
      nip: `${suffix}-pa`,
      nama: 'Dosen Wali Uji Fase 11',
      prodi_id: prodi.id,
      is_active: true,
    },
  });

  // Admin Akademik untuk manipulasi kalender
  const adminUser = await prisma.user.create({
    data: {
      username: `${suffix}-admin`,
      email: `${suffix}-admin@kampus.test`,
      password_hash: await hashPassword('Password123!'),
      status: 'ACTIVE',
      user_roles: { create: { role_id: roleAdmin.id } },
    },
  });

  // Calon Mahasiswa untuk verifikasi akses 401/403
  const calonUser = await prisma.user.create({
    data: {
      username: `${suffix}-calon`,
      email: `${suffix}-calon@kampus.test`,
      password_hash: await hashPassword('Password123!'),
      status: 'ACTIVE',
      user_roles: { create: { role_id: roleCalon.id } },
    },
  });

  // Mahasiswa bimbingan #1: KRS DIAJUKAN (untuk skenario antrian persetujuan PA)
  const mhsUser = await prisma.user.create({
    data: {
      username: `${suffix}-mhs`,
      email: `${suffix}-mhs@kampus.test`,
      password_hash: await hashPassword('Password123!'),
      status: 'ACTIVE',
      user_roles: { create: { role_id: roleMhs.id } },
    },
  });
  const mahasiswa = await prisma.mahasiswa.create({
    data: {
      user_id: mhsUser.id,
      nim: `97${Date.now().toString().slice(-8)}`,
      nama: 'Mahasiswa Uji Fase 11',
      prodi_id: prodi.id,
      angkatan: 2024,
      status_akademik: 'AKTIF',
      dosen_wali_id: dosenWali.id,
    },
  });

  // Mahasiswa bimbingan #2: KRS DIKEMBALIKAN (untuk skenario catatan revisi)
  const mhsUser2 = await prisma.user.create({
    data: {
      username: `${suffix}-mhs2`,
      email: `${suffix}-mhs2@kampus.test`,
      password_hash: await hashPassword('Password123!'),
      status: 'ACTIVE',
      user_roles: { create: { role_id: roleMhs.id } },
    },
  });
  const mahasiswa2 = await prisma.mahasiswa.create({
    data: {
      user_id: mhsUser2.id,
      nim: `98${Date.now().toString().slice(-8)}`,
      nama: 'Mahasiswa Revisi Fase 11',
      prodi_id: prodi.id,
      angkatan: 2024,
      status_akademik: 'AKTIF',
      dosen_wali_id: dosenWali.id,
    },
  });

  // Buat KRS DIAJUKAN untuk mahasiswa #1 (antrian persetujuan PA)
  await prisma.kRS.upsert({
    where: { mahasiswa_id_semester_id: { mahasiswa_id: mahasiswa.id, semester_id: semesterId } },
    update: {
      status: 'DIAJUKAN',
      total_sks: 6,
      diajukan_at: new Date(),
      catatan_dosen: null,
    },
    create: {
      mahasiswa_id: mahasiswa.id,
      semester_id: semesterId,
      status: 'DIAJUKAN',
      total_sks: 6,
      diajukan_at: new Date(),
      catatan_dosen: null,
    },
  });

  // Buat KRS DIKEMBALIKAN untuk mahasiswa #2 (skenario catatan revisi)
  await prisma.kRS.upsert({
    where: { mahasiswa_id_semester_id: { mahasiswa_id: mahasiswa2.id, semester_id: semesterId } },
    update: {
      status: 'DIKEMBALIKAN',
      total_sks: 3,
      diajukan_at: new Date(),
      diproses_at: new Date(),
      disetujui_oleh_id: dosenWali.id,
      catatan_dosen: 'Silakan revisi: ambil mata kuliah wajib yang kurang.',
    },
    create: {
      mahasiswa_id: mahasiswa2.id,
      semester_id: semesterId,
      status: 'DIKEMBALIKAN',
      total_sks: 3,
      diajukan_at: new Date(),
      diproses_at: new Date(),
      disetujui_oleh_id: dosenWali.id,
      catatan_dosen: 'Silakan revisi: ambil mata kuliah wajib yang kurang.',
    },
  });

  // Login seluruh persona
  tokenAdmin = await loginUser(`${suffix}-admin`);
  tokenMahasiswa = await loginUser(`${suffix}-mhs`);
  tokenMahasiswaDikembalikan = await loginUser(`${suffix}-mhs2`);
  tokenDosenWali = await loginUser(`${suffix}-pa`);
  tokenCalonMhs = await loginUser(`${suffix}-calon`);
});

test.after(async () => {
  try {
    // Cleanup data uji
    await prisma.kalenderAkademik.deleteMany({ where: { agenda: { startsWith: suffix } } });
    await prisma.kRS.deleteMany({ where: { mahasiswa: { user: { username: { startsWith: suffix } } } } });
    await prisma.mahasiswa.deleteMany({ where: { user: { username: { startsWith: suffix } } } });
    await prisma.dosen.deleteMany({ where: { nip: { startsWith: suffix } } });
    await prisma.user.deleteMany({ where: { username: { startsWith: suffix } } });

    // Pulihkan periode KRS seed. Test Skenario 19 dapat menghapus & membuat ulang
    // record PeriodeKRS (id baru), sehingga pemulihan harus berbasis semester_id,
    // bukan id snapshot yang mungkin sudah tidak ada.
    await prisma.periodeKRS.updateMany({ where: { is_aktif: true }, data: { is_aktif: false } });
    if (periodeOperationalSebelum) {
      await prisma.periodeKRS.upsert({
        where: { semester_id: periodeOperationalSebelum.semester_id },
        update: {
          nama: periodeOperationalSebelum.nama,
          tanggal_mulai: periodeOperationalSebelum.tanggal_mulai,
          tanggal_selesai: periodeOperationalSebelum.tanggal_selesai,
          sks_maks: periodeOperationalSebelum.sks_maks,
          is_aktif: periodeOperationalSebelum.is_aktif,
        },
        create: {
          semester_id: periodeOperationalSebelum.semester_id,
          nama: periodeOperationalSebelum.nama,
          tanggal_mulai: periodeOperationalSebelum.tanggal_mulai,
          tanggal_selesai: periodeOperationalSebelum.tanggal_selesai,
          sks_maks: periodeOperationalSebelum.sks_maks,
          is_aktif: periodeOperationalSebelum.is_aktif,
        },
      });
    }
    for (const periode of activePeriodeSebelum) {
      if (periodeOperationalSebelum && periode.semester_id === periodeOperationalSebelum.semester_id) continue;
      await prisma.periodeKRS.upsert({
        where: { semester_id: periode.semester_id },
        update: {
          is_aktif: true,
          nama: periode.nama,
          tanggal_mulai: periode.tanggal_mulai,
          tanggal_selesai: periode.tanggal_selesai,
          sks_maks: periode.sks_maks,
        },
        create: {
          semester_id: periode.semester_id,
          nama: periode.nama,
          tanggal_mulai: periode.tanggal_mulai,
          tanggal_selesai: periode.tanggal_selesai,
          sks_maks: periode.sks_maks,
          is_aktif: true,
        },
      });
    }
  } finally {
    await new Promise((resolve) => server?.close(resolve));
    await prisma.$disconnect();
  }
});

// ================================================================
// Skenario 1: Kalender Akademik — filter kategori (SRS Bab 22)
// ================================================================

test('Fase 11: GET /calendar menerima filter kategori (hanya agenda KRS)', async () => {
  const res = await request('/api/v1/calendar?kategori=KRS', { token: tokenAdmin });
  assert.equal(res.response.status, 200);
  assert.equal(res.data.success, true);
  assert.ok(Array.isArray(res.data.data));
  assert.ok(res.data.data.length > 0, 'seed harus menyediakan agenda KRS');
  // Semua item harus berkategori KRS
  for (const item of res.data.data) {
    assert.equal(item.kategori, 'KRS');
  }
});

test('Fase 11: filter kategori=PERKULIAHAN hanya mengembalikan agenda perkuliahan', async () => {
  const res = await request('/api/v1/calendar?kategori=PERKULIAHAN', { token: tokenAdmin });
  assert.equal(res.response.status, 200);
  assert.ok(res.data.data.length > 0);
  for (const item of res.data.data) {
    assert.equal(item.kategori, 'PERKULIAHAN');
  }
});

test('Fase 11: filter kategori invalid ditolak 400', async () => {
  const res = await request('/api/v1/calendar?kategori=INVALID', { token: tokenAdmin });
  assert.equal(res.response.status, 400);
  assert.equal(res.data.success, false);
});

// ================================================================
// Skenario 2: Kalender Akademik — endpoint /aktif (SRS Bab 22)
// ================================================================

test('Fase 11: GET /calendar/aktif menyajikan agenda berjalan untuk semester aktif', async () => {
  const res = await request('/api/v1/calendar/aktif', { token: tokenAdmin });
  assert.equal(res.response.status, 200);
  assert.equal(res.data.success, true);
  assert.ok(res.data.data.semester);
  assert.equal(res.data.data.semester.tipe, 'GANJIL');
  // agenda_berjalan bisa null bila tidak ada yang sedang berjalan, tapi field harus ada
  assert.ok('agenda_berjalan' in res.data.data);
  assert.ok('agenda_mendatang' in res.data.data);
  assert.ok(Array.isArray(res.data.data.agenda_mendatang));
});

test('Fase 11: GET /calendar/aktif tanpa token ditolak 401', async () => {
  const res = await request('/api/v1/calendar/aktif');
  assert.equal(res.response.status, 401);
});

test('Fase 11: /calendar/aktif dengan semester_id invalid ditolak 400', async () => {
  const res = await request('/api/v1/calendar/aktif?semester_id=bukan-uuid', { token: tokenAdmin });
  assert.equal(res.response.status, 400);
});

test('Fase 11: /calendar/aktif dengan semester_id tidak ditemukan → 404', async () => {
  const res = await request('/api/v1/calendar/aktif?semester_id=00000000-0000-0000-0000-000000000000', { token: tokenAdmin });
  assert.equal(res.response.status, 404);
});

// ================================================================
// Skenario 3: Kalender Akademik — CRUD kategori + audit
// ================================================================

test('Fase 11: Admin dapat membuat agenda dengan kategori=UTS + audit CREATE_CALENDAR', async () => {
  const mulai = new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString();
  const selesai = new Date(Date.now() + 12 * 24 * 60 * 60 * 1000).toISOString();
  const res = await request('/api/v1/calendar', {
    method: 'POST',
    token: tokenAdmin,
    body: {
      semester_id: semesterId,
      agenda: `${suffix} UTS Genap`,
      mulai,
      selesai,
      status: 'DIJADWALKAN',
      kategori: 'UTS',
    },
  });
  assert.equal(res.response.status, 201);
  assert.equal(res.data.data.kategori, 'UTS');

  const audit = await prisma.auditLog.findFirst({
    where: { entity: 'kalender_akademik', entity_id: res.data.data.id, action: 'CREATE_CALENDAR' },
  });
  assert.ok(audit, 'CREATE_CALENDAR harus tercatat');
  assert.equal(audit.new_values.kategori, 'UTS');

  await prisma.kalenderAkademik.delete({ where: { id: res.data.data.id } }).catch(() => {});
});

test('Fase 11: create agenda tanpa kategori default ke LAINNYA', async () => {
  const mulai = new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString();
  const selesai = new Date(Date.now() + 22 * 24 * 60 * 60 * 1000).toISOString();
  const res = await request('/api/v1/calendar', {
    method: 'POST',
    token: tokenAdmin,
    body: {
      semester_id: semesterId,
      agenda: `${suffix} Agenda Lain`,
      mulai,
      selesai,
    },
  });
  assert.equal(res.response.status, 201);
  assert.equal(res.data.data.kategori, 'LAINNYA');

  await prisma.kalenderAkademik.delete({ where: { id: res.data.data.id } }).catch(() => {});
});

test('Fase 11: update kategori agenda tercatat di audit old/new values', async () => {
  const mulai = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
  const selesai = new Date(Date.now() + 32 * 24 * 60 * 60 * 1000).toISOString();
  const buat = await request('/api/v1/calendar', {
    method: 'POST',
    token: tokenAdmin,
    body: { semester_id: semesterId, agenda: `${suffix} Update Kategori`, mulai, selesai, kategori: 'LAINNYA' },
  });
  assert.equal(buat.response.status, 201);

  const update = await request(`/api/v1/calendar/${buat.data.data.id}`, {
    method: 'PUT',
    token: tokenAdmin,
    body: { kategori: 'UAS' },
  });
  assert.equal(update.response.status, 200);
  assert.equal(update.data.data.kategori, 'UAS');

  const audit = await prisma.auditLog.findFirst({
    where: { entity: 'kalender_akademik', entity_id: buat.data.data.id, action: 'UPDATE_CALENDAR' },
  });
  assert.ok(audit);
  assert.equal(audit.old_values.kategori, 'LAINNYA');
  assert.equal(audit.new_values.kategori, 'UAS');

  await prisma.kalenderAkademik.delete({ where: { id: buat.data.data.id } }).catch(() => {});
});

// ================================================================
// Skenario 4: RBAC kalender
// ================================================================

test('Fase 11: mahasiswa boleh baca kalender (GET / & /aktif) tapi tidak boleh create (403)', async () => {
  const list = await request('/api/v1/calendar', { token: tokenMahasiswa });
  assert.equal(list.response.status, 200);

  const aktif = await request('/api/v1/calendar/aktif', { token: tokenMahasiswa });
  assert.equal(aktif.response.status, 200);

  const create = await request('/api/v1/calendar', {
    method: 'POST',
    token: tokenMahasiswa,
    body: {
      semester_id: semesterId,
      agenda: `${suffix} Terlarang`,
      mulai: new Date(Date.now() + 1000).toISOString(),
      selesai: new Date(Date.now() + 2000).toISOString(),
      kategori: 'LAINNYA',
    },
  });
  assert.equal(create.response.status, 403);
});

// ================================================================
// Skenario 5: Portal — PeriodeKRS sebagai sumber kebenaran status KRS
// ================================================================

test('Fase 11: dashboard mahasiswa memakai PeriodeKRS nyata (bukan heuristic string)', async () => {
  const res = await request('/api/v1/portal/dashboard', { token: tokenMahasiswa });
  assert.equal(res.response.status, 200);
  assert.equal(res.data.success, true);

  const sys = res.data.data.system_context;
  assert.ok(sys.periode_krs, 'system_context.periode_krs harus terisi (sumber kebenaran baru)');
  assert.equal(sys.periode_krs.is_aktif, true);
  assert.equal(sys.periode_krs.sedang_dibuka, true);
  assert.equal(typeof sys.periode_krs.sisa_hari, 'number');
  assert.ok(sys.periode_krs.sisa_hari >= 0);

  const mhs = res.data.data.role_dashboards.mahasiswa;
  assert.ok(mhs, 'dashboard mahasiswa harus ada');
  // Status KRS kini berbasis PeriodeKRS nyata
  assert.equal(mhs.status_krs.periode_krs_buka, true);
  assert.ok(mhs.status_krs.periode_krs, 'periode_krs nested harus terisi');
  assert.equal(mhs.status_krs.periode_krs.sks_maks, 24);
  assert.equal(typeof mhs.status_krs.periode_krs.sisa_hari, 'number');
});

test('Fase 11: dashboard mahasiswa menampilkan status KRS personal + total SKS (SRS Bab 9)', async () => {
  const res = await request('/api/v1/portal/dashboard', { token: tokenMahasiswa });
  const mhs = res.data.data.role_dashboards.mahasiswa;
  assert.ok(mhs.status_krs.krs_personal, 'krs_personal harus terisi');
  assert.equal(mhs.status_krs.krs_personal.status, 'DIAJUKAN');
  assert.equal(mhs.status_krs.krs_personal.total_sks, 6);
});

test('Fase 11: dashboard mahasiswa dengan KRS DIKEMBALIKAN menampilkan catatan revisi (FR-035)', async () => {
  const res = await request('/api/v1/portal/dashboard', { token: tokenMahasiswaDikembalikan });
  assert.equal(res.response.status, 200);
  const mhs = res.data.data.role_dashboards.mahasiswa;
  assert.equal(mhs.status_krs.krs_personal.status, 'DIKEMBALIKAN');
  assert.ok(mhs.status_krs.catatan_revisi, 'catatan_revisi harus terisi bila KRS dikembalikan');
  assert.ok(mhs.status_krs.catatan_revisi.includes('revisi'));
});

test('Fase 11: dashboard PA menampilkan jumlah_krs_menunggu_persetujuan dari KRS bimbingan', async () => {
  const res = await request('/api/v1/portal/dashboard', { token: tokenDosenWali });
  assert.equal(res.response.status, 200);
  const dosen = res.data.data.role_dashboards.dosen;
  assert.ok(dosen, 'dashboard dosen harus ada');
  assert.ok('jumlah_krs_menunggu_persetujuan' in dosen.statistik, 'field baru harus ada (additive)');
  // Mahasiswa #1 memiliki KRS DIAJUKAN → minimal 1 antrian
  assert.ok(dosen.statistik.jumlah_krs_menunggu_persetujuan >= 1, 'antrian persetujuan harus terdeteksi');
});

// ================================================================
// Skenario 6: Backwards compatibility — shape dashboard lama tetap utuh
// ================================================================

test('Fase 11: backwards-compatible — field dashboard lama tetap ada (phase5 hijau)', async () => {
  const res = await request('/api/v1/portal/dashboard', { token: tokenMahasiswa });
  const mhs = res.data.data.role_dashboards.mahasiswa;
  // Field lama tetap ada (tidak breaking)
  assert.equal(mhs.title, 'Dasbor Akademik Mahasiswa');
  assert.ok(mhs.biodata);
  assert.ok(mhs.dosen_pembimbing);
  assert.ok(mhs.modul_terkait.length, 2);
  assert.ok(mhs.status_krs.keterangan, 'keterangan lama tetap ada');

  // Dashboard dosen field lama tetap ada
  const resDosen = await request('/api/v1/portal/dashboard', { token: tokenDosenWali });
  const dosen = resDosen.data.data.role_dashboards.dosen;
  assert.equal(dosen.title, 'Dasbor Akademik & Pengajaran Dosen');
  assert.ok('total_kelas_diampu' in dosen.statistik);
  assert.ok('total_mahasiswa_wali' in dosen.statistik);
  assert.ok(dosen.perwalian_aktif, 'perwalian_aktif field lama tetap ada');
});

test('Fase 11: dashboard admin_akademik tetap menyajikan metrik lama + status operasional', async () => {
  const res = await request('/api/v1/portal/dashboard', { token: tokenAdmin });
  assert.equal(res.response.status, 200);
  const admin = res.data.data.role_dashboards.admin_akademik;
  assert.ok(admin.metrik.total_mahasiswa >= 1);
  assert.ok(admin.status_operasional.agenda_berjalan);
});

// ================================================================
// Skenario 7: Kepatuhan SRS Bab 33 — periode KRS tertutup → portal tertutup
// ================================================================

test('Fase 11: bila PeriodeKRS ditutup, portal melaporkan KRS tertutup (Bab 33)', async () => {
  // Tutup periode KRS untuk semester aktif
  await prisma.periodeKRS.updateMany({
    where: { semester_id: semesterId },
    data: { is_aktif: false },
  });

  const res = await request('/api/v1/portal/dashboard', { token: tokenMahasiswa });
  assert.equal(res.response.status, 200);
  const sys = res.data.data.system_context;
  // Periode tetap terlihat (untuk info), tapi sedang_dibuka = false
  assert.equal(sys.periode_krs.sedang_dibuka, false);
  assert.equal(sys.periode_krs.sisa_hari, null);

  const mhs = res.data.data.role_dashboards.mahasiswa;
  assert.equal(mhs.status_krs.periode_krs_buka, false);
  assert.ok(mhs.status_krs.keterangan.includes('belum dibuka atau telah berakhir'));

  // Pulihkan: buka kembali periode KRS untuk test selanjutnya
  await prisma.periodeKRS.update({
    where: { semester_id: semesterId },
    data: {
      tanggal_mulai: new Date(Date.now() - 24 * 60 * 60 * 1000),
      tanggal_selesai: new Date(Date.now() + 24 * 60 * 60 * 1000),
      is_aktif: true,
    },
  });
});

test('Fase 11: tanpa PeriodeKRS sama sekali, portal melaporkan periode_krs=null & tertutup', async () => {
  // Hapus sementara periode KRS untuk semester aktif
  const periodeHapus = await prisma.periodeKRS.findUnique({ where: { semester_id: semesterId } });
  if (periodeHapus) {
    await prisma.periodeKRS.delete({ where: { semester_id: semesterId } });

    const res = await request('/api/v1/portal/dashboard', { token: tokenMahasiswa });
    assert.equal(res.response.status, 200);
    const sys = res.data.data.system_context;
    assert.equal(sys.periode_krs, null);
    const mhs = res.data.data.role_dashboards.mahasiswa;
    assert.equal(mhs.status_krs.periode_krs_buka, false);
    assert.equal(mhs.status_krs.periode_krs, null);

    // Pulihkan
    await prisma.periodeKRS.create({
      data: {
        semester_id: semesterId,
        nama: 'Periode Uji Fase 11 (pulih)',
        tanggal_mulai: new Date(Date.now() - 24 * 60 * 60 * 1000),
        tanggal_selesai: new Date(Date.now() + 24 * 60 * 60 * 1000),
        sks_maks: 24,
        is_aktif: true,
      },
    });
  }
});

// ================================================================
// Skenario 8: Alias konseptual /api/calendar → /api/v1/calendar
// ================================================================

test('Fase 11: alias /api/calendar kompatibel dengan /api/v1/calendar (SRS Bab 32)', async () => {
  const res = await request('/api/calendar?kategori=KRS', { token: tokenAdmin });
  assert.equal(res.response.status, 200);
  assert.equal(res.data.success, true);
  assert.ok(Array.isArray(res.data.data));
});

// ================================================================
// Skenario 9: RBAC portal tetap utuh
// ================================================================

test('Fase 11: endpoint portal tanpa token ditolak 401', async () => {
  const res = await request('/api/v1/portal/dashboard');
  assert.equal(res.response.status, 401);
});

test('Fase 11: calon mahasiswa tetap dapat dashboard (tanpa KRS personal, tidak crash)', async () => {
  const res = await request('/api/v1/portal/dashboard', { token: tokenCalonMhs });
  assert.equal(res.response.status, 200);
  assert.ok(res.data.data.role_dashboards.calon_mahasiswa);
  // Calon mahasiswa tidak punya dashboard mahasiswa
  assert.equal(res.data.data.role_dashboards.mahasiswa, undefined);
});
