import test from 'node:test';
import assert from 'node:assert/strict';
import app from '../src/app.js';
import prisma from '../src/config/prisma.js';
import { hashPassword } from '../src/utils/password.js';

let server;
let baseUrl;
let tokenMahasiswa;
let tokenPA;
let tokenAdmin;
let tokenPABukanPemilik;
let tokenDosenBiasa;
let mahasiswaId;
let dosenWaliId;
let dosenLainId;
let semesterId;
let periodeUjiId;
let kelasNormalId;
let krsDiajukanId;
let activePeriodeSebelum = [];
let periodeOperationalSebelum;
const suffix = `phase9-${Date.now()}`;

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

  activePeriodeSebelum = await prisma.periodeKRS.findMany({ where: { is_aktif: true } });
  periodeOperationalSebelum = await prisma.periodeKRS.findUnique({
    where: { semester_id: operationalSemester.id },
  });
  await prisma.periodeKRS.updateMany({
    where: { is_aktif: true, semester_id: { not: operationalSemester.id } },
    data: { is_aktif: false },
  });

  const [roleMhs, roleDosenWali, roleAdmin, roleDosen, prodi, kurikulum, dosenSeed] = await Promise.all([
    prisma.role.findUnique({ where: { name: 'MAHASISWA' } }),
    prisma.role.findUnique({ where: { name: 'DOSEN_WALI' } }),
    prisma.role.findUnique({ where: { name: 'ADMIN_AKADEMIK' } }),
    prisma.role.findUnique({ where: { name: 'DOSEN' } }),
    prisma.programStudi.findFirst(),
    prisma.kurikulum.findFirst({ where: { is_active: true } }),
    prisma.dosen.findFirst(),
  ]);
  assert.ok(roleMhs && roleDosenWali && roleAdmin && roleDosen && prodi && kurikulum && dosenSeed, 'data seed MVP 1 harus tersedia');

  // PA pemilik (Dosen Wali untuk mahasiswa uji)
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
      nama: 'Dosen Wali Uji Fase 9',
      prodi_id: prodi.id,
      is_active: true,
    },
  });
  dosenWaliId = dosenWali.id;

  // PA bukan pemilik (Dosen Wali lain)
  const paBukanUser = await prisma.user.create({
    data: {
      username: `${suffix}-pa-bukan`,
      email: `${suffix}-pa-bukan@kampus.test`,
      password_hash: await hashPassword('Password123!'),
      status: 'ACTIVE',
      user_roles: { create: { role_id: roleDosenWali.id } },
    },
  });
  const dosenBukan = await prisma.dosen.create({
    data: {
      user_id: paBukanUser.id,
      nidn: `00${suffix.slice(-8)}02`,
      nip: `${suffix}-pa-bukan`,
      nama: 'Dosen Wali Bukan Pemilik',
      prodi_id: prodi.id,
      is_active: true,
    },
  });
  dosenLainId = dosenBukan.id;

  // Dosen biasa (role DOSEN saja — tidak punya krs:approve)
  const dosenBiasaUser = await prisma.user.create({
    data: {
      username: `${suffix}-dosen`,
      email: `${suffix}-dosen@kampus.test`,
      password_hash: await hashPassword('Password123!'),
      status: 'ACTIVE',
      user_roles: { create: { role_id: roleDosen.id } },
    },
  });
  await prisma.dosen.create({
    data: {
      user_id: dosenBiasaUser.id,
      nidn: `00${suffix.slice(-8)}03`,
      nip: `${suffix}-dosen`,
      nama: 'Dosen Biasa Fase 9',
      prodi_id: prodi.id,
      is_active: true,
    },
  });

  // Admin Akademik
  const adminUser = await prisma.user.create({
    data: {
      username: `${suffix}-admin`,
      email: `${suffix}-admin@kampus.test`,
      password_hash: await hashPassword('Password123!'),
      status: 'ACTIVE',
      user_roles: { create: { role_id: roleAdmin.id } },
    },
  });

  // Mahasiswa bimbingan PA pemilik
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
      nim: `95${Date.now().toString().slice(-8)}`,
      nama: 'Mahasiswa Uji Fase 9',
      prodi_id: prodi.id,
      angkatan: 2024,
      status_akademik: 'AKTIF',
      dosen_wali_id: dosenWali.id,
    },
  });
  mahasiswaId = mahasiswa.id;

  const periodeUji = await prisma.periodeKRS.upsert({
    where: { semester_id: operationalSemester.id },
    update: {
      tanggal_mulai: new Date(Date.now() - 24 * 60 * 60 * 1000),
      tanggal_selesai: new Date(Date.now() + 24 * 60 * 60 * 1000),
      sks_maks: 24,
      is_aktif: true,
    },
    create: {
      semester_id: operationalSemester.id,
      nama: 'Periode Uji Fase 9',
      tanggal_mulai: new Date(Date.now() - 24 * 60 * 60 * 1000),
      tanggal_selesai: new Date(Date.now() + 24 * 60 * 60 * 1000),
      sks_maks: 24,
      is_aktif: true,
    },
  });
  periodeUjiId = periodeUji.id;

  const mkNormal = await prisma.mataKuliah.create({
    data: { kurikulum_id: kurikulum.id, kode: `${suffix}-normal`, nama: 'MK Normal Fase 9', sks: 3, semester_paket: 1, is_active: true },
  });
  const kelasNormal = await prisma.kelas.create({
    data: { mata_kuliah_id: mkNormal.id, semester_id: semesterId, dosen_id: dosenSeed.id, kode_kelas: `${suffix}-A`, kapasitas: 20 },
  });
  kelasNormalId = kelasNormal.id;

  // Login seluruh persona
  tokenMahasiswa = await loginUser(`${suffix}-mhs`);
  tokenPA = await loginUser(`${suffix}-pa`);
  tokenPABukanPemilik = await loginUser(`${suffix}-pa-bukan`);
  tokenDosenBiasa = await loginUser(`${suffix}-dosen`);
  tokenAdmin = await loginUser(`${suffix}-admin`);

  // Siapkan satu KRS DIAJUKAN milik mahasiswa uji untuk skenario approve/return
  const tambah = await request(`/api/v1/krs/saya/items?semester_id=${semesterId}`, {
    method: 'POST',
    token: tokenMahasiswa,
    body: { kelas_id: kelasNormalId },
  });
  assert.equal(tambah.response.status, 201, 'setup tambah item gagal');
  krsDiajukanId = tambah.data.data.id;

  const submit = await request('/api/v1/krs/saya/submit', {
    method: 'POST',
    token: tokenMahasiswa,
    body: { semester_id: semesterId },
  });
  assert.equal(submit.response.status, 200, 'setup submit gagal');
});

test.after(async () => {
  try {
    await prisma.auditLog.deleteMany({
      where: { entity: 'krs', entity_id: { in: [krsDiajukanId].filter(Boolean) } },
    });
    await prisma.kRS.deleteMany({
      where: { mahasiswa: { user: { username: { startsWith: suffix } } } },
    });
    await prisma.kelas.deleteMany({ where: { kode_kelas: { startsWith: suffix } } });
    await prisma.mataKuliah.deleteMany({ where: { kode: { startsWith: suffix } } });
    await prisma.dosen.deleteMany({ where: { nip: { startsWith: suffix } } });
    await prisma.mahasiswa.deleteMany({ where: { user: { username: { startsWith: suffix } } } });
    await prisma.user.deleteMany({ where: { username: { startsWith: suffix } } });
    if (periodeOperationalSebelum) {
      await prisma.periodeKRS.update({
        where: { id: periodeOperationalSebelum.id },
        data: {
          nama: periodeOperationalSebelum.nama,
          tanggal_mulai: periodeOperationalSebelum.tanggal_mulai,
          tanggal_selesai: periodeOperationalSebelum.tanggal_selesai,
          sks_maks: periodeOperationalSebelum.sks_maks,
          is_aktif: periodeOperationalSebelum.is_aktif,
        },
      });
    }
    for (const periode of activePeriodeSebelum) {
      if (periodeOperationalSebelum && periode.id === periodeOperationalSebelum.id) continue;
      await prisma.periodeKRS.update({
        where: { id: periode.id },
        data: { is_aktif: true, nama: periode.nama, tanggal_mulai: periode.tanggal_mulai, tanggal_selesai: periode.tanggal_selesai, sks_maks: periode.sks_maks },
      });
    }
  } finally {
    await new Promise((resolve) => server?.close(resolve));
    await prisma.$disconnect();
  }
});

// ================================================================
// Skenario 1: PA pemilik melihat daftar pengajuan & detail scoped
// ================================================================

test('Fase 9: PA pemilik dapat melihat daftar pengajuan KRS mahasiswa bimbingan', async () => {
  const res = await request('/api/v1/krs/pengajuan', { token: tokenPA });
  assert.equal(res.response.status, 200);
  assert.equal(res.data.success, true);
  assert.ok(res.data.data.some((k) => k.id === krsDiajukanId));
  // Semua item harus milik mahasiswa bimbingan PA ini
  assert.ok(res.data.data.every((k) => k.mahasiswa?.dosen_wali_id === dosenWaliId));
});

test('Fase 9: PA pemilik dapat melihat detail KRS scoped (GET /:id)', async () => {
  const res = await request(`/api/v1/krs/${krsDiajukanId}`, { token: tokenPA });
  assert.equal(res.response.status, 200);
  assert.equal(res.data.data.id, krsDiajukanId);
  assert.equal(res.data.data.status, 'DIAJUKAN');
});

test('Fase 9: mahasiswa pemilik dapat melihat detail KRS sendiri', async () => {
  const res = await request(`/api/v1/krs/${krsDiajukanId}`, { token: tokenMahasiswa });
  assert.equal(res.response.status, 200);
  assert.equal(res.data.data.id, krsDiajukanId);
});

// ================================================================
// Skenario 2: Alur approve & return + event audit
// ================================================================

test('Fase 9: PA pemilik menyetujui KRS DIAJUKAN → DISETUJUI + event tercatat', async () => {
  // Siapkan KRS DIAJUKAN baru agar tidak bentrok dengan skenario lain
  const roleMhs = await prisma.role.findUnique({ where: { name: 'MAHASISWA' } });
  const prodi = await prisma.programStudi.findFirst();
  const kurikulum = await prisma.kurikulum.findFirst({ where: { is_active: true } });
  const dosenSeed = await prisma.dosen.findFirst();
  const u = await prisma.user.create({
    data: {
      username: `${suffix}-approve-mhs`,
      email: `${suffix}-approve-mhs@kampus.test`,
      password_hash: await hashPassword('Password123!'),
      status: 'ACTIVE',
      user_roles: { create: { role_id: roleMhs.id } },
    },
  });
  const mhs = await prisma.mahasiswa.create({
    data: { user_id: u.id, nim: `94${Date.now().toString().slice(-8)}`, nama: 'Mhs Approve', prodi_id: prodi.id, angkatan: 2024, status_akademik: 'AKTIF', dosen_wali_id: dosenWaliId },
  });
  const mk = await prisma.mataKuliah.create({ data: { kurikulum_id: kurikulum.id, kode: `${suffix}-approve-mk`, nama: 'MK Approve', sks: 3, semester_paket: 1, is_active: true } });
  const kelas = await prisma.kelas.create({ data: { mata_kuliah_id: mk.id, semester_id: semesterId, dosen_id: dosenSeed.id, kode_kelas: `${suffix}-APV`, kapasitas: 20 } });

  const mhsToken = await loginUser(`${suffix}-approve-mhs`);
  await request(`/api/v1/krs/saya/items?semester_id=${semesterId}`, { method: 'POST', token: mhsToken, body: { kelas_id: kelas.id } });
  const submit = await request('/api/v1/krs/saya/submit', { method: 'POST', token: mhsToken, body: { semester_id: semesterId } });
  assert.equal(submit.response.status, 200);
  const krsId = submit.data.data.id;

  const approve = await request(`/api/v1/krs/${krsId}/approve`, { method: 'POST', token: tokenPA });
  assert.equal(approve.response.status, 200);
  assert.equal(approve.data.data.status, 'DISETUJUI');
  assert.ok(approve.data.data.diproses_at);
  assert.equal(approve.data.data.disetujui_oleh_id, dosenWaliId);
  assert.equal(approve.data.data.total_sks, 3);

  // Event hook tercatat dalam transaksi (KRS_APPROVED_EVENT)
  const events = await prisma.auditLog.findMany({
    where: { entity: 'krs', entity_id: krsId, action: { in: ['APPROVE_KRS', 'KRS_APPROVED_EVENT'] } },
  });
  assert.ok(events.some((e) => e.action === 'APPROVE_KRS'));
  assert.ok(events.some((e) => e.action === 'KRS_APPROVED_EVENT'));

  // Cleanup
  await prisma.kRS.delete({ where: { id: krsId } });
  await prisma.kelas.delete({ where: { id: kelas.id } });
  await prisma.mataKuliah.delete({ where: { id: mk.id } });
  await prisma.mahasiswa.delete({ where: { id: mhs.id } });
  await prisma.user.delete({ where: { id: u.id } });
});

test('Fase 9: PA pemilik mengembalikan KRS dengan catatan revisi wajib', async () => {
  const roleMhs = await prisma.role.findUnique({ where: { name: 'MAHASISWA' } });
  const prodi = await prisma.programStudi.findFirst();
  const kurikulum = await prisma.kurikulum.findFirst({ where: { is_active: true } });
  const dosenSeed = await prisma.dosen.findFirst();
  const u = await prisma.user.create({
    data: { username: `${suffix}-ret-mhs`, email: `${suffix}-ret-mhs@kampus.test`, password_hash: await hashPassword('Password123!'), status: 'ACTIVE', user_roles: { create: { role_id: roleMhs.id } } },
  });
  const mhs = await prisma.mahasiswa.create({ data: { user_id: u.id, nim: `93${Date.now().toString().slice(-8)}`, nama: 'Mhs Return', prodi_id: prodi.id, angkatan: 2024, status_akademik: 'AKTIF', dosen_wali_id: dosenWaliId } });
  const mk = await prisma.mataKuliah.create({ data: { kurikulum_id: kurikulum.id, kode: `${suffix}-ret-mk`, nama: 'MK Return', sks: 3, semester_paket: 1, is_active: true } });
  const kelas = await prisma.kelas.create({ data: { mata_kuliah_id: mk.id, semester_id: semesterId, dosen_id: dosenSeed.id, kode_kelas: `${suffix}-RET`, kapasitas: 20 } });

  const mhsToken = await loginUser(`${suffix}-ret-mhs`);
  await request(`/api/v1/krs/saya/items?semester_id=${semesterId}`, { method: 'POST', token: mhsToken, body: { kelas_id: kelas.id } });
  const submit = await request('/api/v1/krs/saya/submit', { method: 'POST', token: mhsToken, body: { semester_id: semesterId } });
  const krsId = submit.data.data.id;

  // Catatan terlalu pendek → ditolak validasi (Zod → 400)
  const short = await request(`/api/v1/krs/${krsId}/return`, { method: 'POST', token: tokenPA, body: { catatan: 'pendek' } });
  assert.equal(short.response.status, 400);

  // Catatan valid
  const ret = await request(`/api/v1/krs/${krsId}/return`, {
    method: 'POST',
    token: tokenPA,
    body: { catatan: 'Silakan revisi pemilihan kelas matkul wajib.' },
  });
  assert.equal(ret.response.status, 200);
  assert.equal(ret.data.data.status, 'DIKEMBALIKAN');
  assert.equal(ret.data.data.catatan_dosen, 'Silakan revisi pemilihan kelas matkul wajib.');
  assert.equal(ret.data.data.disetujui_oleh_id, dosenWaliId);

  // Event hook tercatat
  const events = await prisma.auditLog.findMany({ where: { entity: 'krs', entity_id: krsId, action: { in: ['RETURN_KRS', 'KRS_RETURNED_EVENT'] } } });
  assert.ok(events.some((e) => e.action === 'RETURN_KRS'));
  assert.ok(events.some((e) => e.action === 'KRS_RETURNED_EVENT'));

  // Resubmit dari DIKEMBALIKAN → DIAJUKAN (state machine legal)
  const resubmit = await request('/api/v1/krs/saya/submit', { method: 'POST', token: mhsToken, body: { semester_id: semesterId } });
  assert.equal(resubmit.response.status, 200);
  assert.equal(resubmit.data.data.status, 'DIAJUKAN');
  assert.equal(resubmit.data.data.catatan_dosen, null);

  await prisma.kRS.delete({ where: { id: krsId } });
  await prisma.kelas.delete({ where: { id: kelas.id } });
  await prisma.mataKuliah.delete({ where: { id: mk.id } });
  await prisma.mahasiswa.delete({ where: { id: mhs.id } });
  await prisma.user.delete({ where: { id: u.id } });
});

// ================================================================
// Skenario 3: Ownership check — non-PA ditolak 403 (TC-019 pattern)
// ================================================================

test('Fase 9: PA bukan pemilik ditolak approve/return/detail (403)', async () => {
  const approve = await request(`/api/v1/krs/${krsDiajukanId}/approve`, { method: 'POST', token: tokenPABukanPemilik });
  assert.equal(approve.response.status, 403);

  const ret = await request(`/api/v1/krs/${krsDiajukanId}/return`, {
    method: 'POST', token: tokenPABukanPemilik, body: { catatan: 'Bukan pemilik bimbingan revisi.' },
  });
  assert.equal(ret.response.status, 403);

  const detail = await request(`/api/v1/krs/${krsDiajukanId}`, { token: tokenPABukanPemilik });
  assert.equal(detail.response.status, 403);
});

test('Fase 9: dosen biasa tanpa krs:approve ditolak akses pengajuan & approve (403)', async () => {
  const pengajuan = await request('/api/v1/krs/pengajuan', { token: tokenDosenBiasa });
  assert.equal(pengajuan.response.status, 403);

  const approve = await request(`/api/v1/krs/${krsDiajukanId}/approve`, { method: 'POST', token: tokenDosenBiasa });
  assert.equal(approve.response.status, 403);
});

// ================================================================
// Skenario 4: Konkurensi ganda approve → satu sukses, lain 409
// ================================================================

test('Fase 9: approve ganda konkuren — satu sukses, lainnya 409 (optimistic guard)', async () => {
  const roleMhs = await prisma.role.findUnique({ where: { name: 'MAHASISWA' } });
  const prodi = await prisma.programStudi.findFirst();
  const kurikulum = await prisma.kurikulum.findFirst({ where: { is_active: true } });
  const dosenSeed = await prisma.dosen.findFirst();
  const u = await prisma.user.create({
    data: { username: `${suffix}-race-mhs`, email: `${suffix}-race-mhs@kampus.test`, password_hash: await hashPassword('Password123!'), status: 'ACTIVE', user_roles: { create: { role_id: roleMhs.id } } },
  });
  const mhs = await prisma.mahasiswa.create({ data: { user_id: u.id, nim: `92${Date.now().toString().slice(-8)}`, nama: 'Mhs Race', prodi_id: prodi.id, angkatan: 2024, status_akademik: 'AKTIF', dosen_wali_id: dosenWaliId } });
  const mk = await prisma.mataKuliah.create({ data: { kurikulum_id: kurikulum.id, kode: `${suffix}-race-mk`, nama: 'MK Race', sks: 3, semester_paket: 1, is_active: true } });
  const kelas = await prisma.kelas.create({ data: { mata_kuliah_id: mk.id, semester_id: semesterId, dosen_id: dosenSeed.id, kode_kelas: `${suffix}-RACE`, kapasitas: 20 } });

  const mhsToken = await loginUser(`${suffix}-race-mhs`);
  await request(`/api/v1/krs/saya/items?semester_id=${semesterId}`, { method: 'POST', token: mhsToken, body: { kelas_id: kelas.id } });
  const submit = await request('/api/v1/krs/saya/submit', { method: 'POST', token: mhsToken, body: { semester_id: semesterId } });
  const krsId = submit.data.data.id;

  // PA pemilik klik ganda (klik 2x konkuren) → satu 200, satu 409 (optimistic guard)
  const [paRes1, paRes2] = await Promise.all([
    request(`/api/v1/krs/${krsId}/approve`, { method: 'POST', token: tokenPA }),
    request(`/api/v1/krs/${krsId}/approve`, { method: 'POST', token: tokenPA }),
  ]);
  const statuses = [paRes1.response.status, paRes2.response.status].sort();
  // Satu 200 (sukses), satu 409 (konflik konkurensi)
  assert.deepEqual(statuses, [200, 409], `harus 200+409, dapat ${statuses.join(',')}`);

  const final = await prisma.kRS.findUnique({ where: { id: krsId }, select: { status: true } });
  assert.equal(final.status, 'DISETUJUI');

  await prisma.kRS.delete({ where: { id: krsId } });
  await prisma.kelas.delete({ where: { id: kelas.id } });
  await prisma.mataKuliah.delete({ where: { id: mk.id } });
  await prisma.mahasiswa.delete({ where: { id: mhs.id } });
  await prisma.user.delete({ where: { id: u.id } });
});

// ================================================================
// Skenario 5: Transisi ilegal — approve KRS DISETUJUI → 400
// ================================================================

test('Fase 9: approve KRS yang sudah DISETUJUI ditolak (idempotensi 400/409)', async () => {
  const roleMhs = await prisma.role.findUnique({ where: { name: 'MAHASISWA' } });
  const prodi = await prisma.programStudi.findFirst();
  const kurikulum = await prisma.kurikulum.findFirst({ where: { is_active: true } });
  const dosenSeed = await prisma.dosen.findFirst();
  const u = await prisma.user.create({
    data: { username: `${suffix}-idem-mhs`, email: `${suffix}-idem-mhs@kampus.test`, password_hash: await hashPassword('Password123!'), status: 'ACTIVE', user_roles: { create: { role_id: roleMhs.id } } },
  });
  const mhs = await prisma.mahasiswa.create({ data: { user_id: u.id, nim: `91${Date.now().toString().slice(-8)}`, nama: 'Mhs Idempotent', prodi_id: prodi.id, angkatan: 2024, status_akademik: 'AKTIF', dosen_wali_id: dosenWaliId } });
  const mk = await prisma.mataKuliah.create({ data: { kurikulum_id: kurikulum.id, kode: `${suffix}-idem-mk`, nama: 'MK Idem', sks: 3, semester_paket: 1, is_active: true } });
  const kelas = await prisma.kelas.create({ data: { mata_kuliah_id: mk.id, semester_id: semesterId, dosen_id: dosenSeed.id, kode_kelas: `${suffix}-IDEM`, kapasitas: 20 } });

  const mhsToken = await loginUser(`${suffix}-idem-mhs`);
  await request(`/api/v1/krs/saya/items?semester_id=${semesterId}`, { method: 'POST', token: mhsToken, body: { kelas_id: kelas.id } });
  const submit = await request('/api/v1/krs/saya/submit', { method: 'POST', token: mhsToken, body: { semester_id: semesterId } });
  const krsId = submit.data.data.id;
  const approve1 = await request(`/api/v1/krs/${krsId}/approve`, { method: 'POST', token: tokenPA });
  assert.equal(approve1.response.status, 200);

  // KRS sudah DISETUJUI → transisi ilegal → 400 (bukan 200 no-op)
  const approve2 = await request(`/api/v1/krs/${krsId}/approve`, { method: 'POST', token: tokenPA });
  assert.ok([400, 409].includes(approve2.response.status), `harus 400/409, dapat ${approve2.response.status}`);

  await prisma.kRS.delete({ where: { id: krsId } });
  await prisma.kelas.delete({ where: { id: kelas.id } });
  await prisma.mataKuliah.delete({ where: { id: mk.id } });
  await prisma.mahasiswa.delete({ where: { id: mhs.id } });
  await prisma.user.delete({ where: { id: u.id } });
});

// ================================================================
// Skenario 6: Monitoring Admin & reset-draft intervensi
// ================================================================

test('Fase 9: Admin Akademik dapat memonitor rekap status KRS', async () => {
  const res = await request('/api/v1/krs/admin/monitor', { token: tokenAdmin });
  assert.equal(res.response.status, 200);
  assert.equal(res.data.success, true);
  assert.ok(res.data.meta.summary);
  assert.ok(Object.keys(res.data.meta.summary).includes('DIAJUKAN'));
  // Filter by semester_id menghasilkan summary konsisten
  const filtered = await request(`/api/v1/krs/admin/monitor?semester_id=${semesterId}`, { token: tokenAdmin });
  assert.equal(filtered.response.status, 200);
  const totalSum = Object.values(filtered.data.meta.summary).reduce((a, b) => a + b, 0);
  assert.equal(totalSum, filtered.data.meta.total);
});

test('Fase 9: Admin Akademik reset-draft intervensi → KRS_ADMIN_RESET + rekalkulasi', async () => {
  const roleMhs = await prisma.role.findUnique({ where: { name: 'MAHASISWA' } });
  const prodi = await prisma.programStudi.findFirst();
  const kurikulum = await prisma.kurikulum.findFirst({ where: { is_active: true } });
  const dosenSeed = await prisma.dosen.findFirst();
  const u = await prisma.user.create({
    data: { username: `${suffix}-reset-mhs`, email: `${suffix}-reset-mhs@kampus.test`, password_hash: await hashPassword('Password123!'), status: 'ACTIVE', user_roles: { create: { role_id: roleMhs.id } } },
  });
  const mhs = await prisma.mahasiswa.create({ data: { user_id: u.id, nim: `90${Date.now().toString().slice(-8)}`, nama: 'Mhs Reset', prodi_id: prodi.id, angkatan: 2024, status_akademik: 'AKTIF', dosen_wali_id: dosenWaliId } });
  const mk = await prisma.mataKuliah.create({ data: { kurikulum_id: kurikulum.id, kode: `${suffix}-reset-mk`, nama: 'MK Reset', sks: 3, semester_paket: 1, is_active: true } });
  const kelas = await prisma.kelas.create({ data: { mata_kuliah_id: mk.id, semester_id: semesterId, dosen_id: dosenSeed.id, kode_kelas: `${suffix}-RESET`, kapasitas: 20 } });

  const mhsToken = await loginUser(`${suffix}-reset-mhs`);
  await request(`/api/v1/krs/saya/items?semester_id=${semesterId}`, { method: 'POST', token: mhsToken, body: { kelas_id: kelas.id } });
  const submit = await request('/api/v1/krs/saya/submit', { method: 'POST', token: mhsToken, body: { semester_id: semesterId } });
  const krsId = submit.data.data.id;
  await request(`/api/v1/krs/${krsId}/approve`, { method: 'POST', token: tokenPA });

  const reset = await request(`/api/v1/krs/admin/${krsId}/reset-draft`, { method: 'POST', token: tokenAdmin });
  assert.equal(reset.response.status, 200);
  assert.equal(reset.data.data.status, 'DRAFT');
  assert.equal(reset.data.data.diajukan_at, null);
  assert.equal(reset.data.data.diproses_at, null);
  assert.equal(reset.data.data.disetujui_oleh_id, null);
  assert.equal(reset.data.data.catatan_dosen, null);
  assert.equal(reset.data.data.total_sks, 3); // rekalkulasi dari detail

  const audit = await prisma.auditLog.findFirst({
    where: { entity: 'krs', entity_id: krsId, action: 'KRS_ADMIN_RESET' },
  });
  assert.ok(audit, 'KRS_ADMIN_RESET harus tercatat');
  assert.ok(audit.old_values?.status === 'DISETUJUI');
  assert.equal(audit.new_values?.status, 'DRAFT');

  // Reset KRS yang sudah DRAFT ditolak
  const resetAgain = await request(`/api/v1/krs/admin/${krsId}/reset-draft`, { method: 'POST', token: tokenAdmin });
  assert.equal(resetAgain.response.status, 400);

  await prisma.kRS.delete({ where: { id: krsId } });
  await prisma.kelas.delete({ where: { id: kelas.id } });
  await prisma.mataKuliah.delete({ where: { id: mk.id } });
  await prisma.mahasiswa.delete({ where: { id: mhs.id } });
  await prisma.user.delete({ where: { id: u.id } });
});

test('Fase 9: non-admin ditolak akses monitor & reset-draft (403)', async () => {
  const monitor = await request('/api/v1/krs/admin/monitor', { token: tokenMahasiswa });
  assert.equal(monitor.response.status, 403);

  const reset = await request(`/api/v1/krs/admin/${krsDiajukanId}/reset-draft`, { method: 'POST', token: tokenMahasiswa });
  assert.equal(reset.response.status, 403);
});
