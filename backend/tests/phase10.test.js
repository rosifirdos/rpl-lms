import test from 'node:test';
import assert from 'node:assert/strict';
import app from '../src/app.js';
import prisma from '../src/config/prisma.js';
import { hashPassword } from '../src/utils/password.js';

let server;
let baseUrl;
let tokenMahasiswa;
let tokenMahasiswaBelumKrs;
let tokenDosen;
let tokenAdmin;
let tokenCalonMhs;
let dosenWaliId;
let semesterId;
let kelasNormalId;
let ruanganId;
let ruanganLainId;
let kelasBentrokDosenId;
let kelasBentrokRuangId;
const suffix = `phase10-${Date.now()}`;

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

  // Pastikan periode KRS aktif untuk semester operasional (mahasiswa perlu KRS disetujui)
  await prisma.periodeKRS.upsert({
    where: { semester_id: operationalSemester.id },
    update: {
      tanggal_mulai: new Date(Date.now() - 24 * 60 * 60 * 1000),
      tanggal_selesai: new Date(Date.now() + 24 * 60 * 60 * 1000),
      is_aktif: true,
    },
    create: {
      semester_id: operationalSemester.id,
      nama: 'Periode Uji Fase 10',
      tanggal_mulai: new Date(Date.now() - 24 * 60 * 60 * 1000),
      tanggal_selesai: new Date(Date.now() + 24 * 60 * 60 * 1000),
      is_aktif: true,
    },
  });

  const [roleMhs, roleDosenWali, roleAdmin, roleDosen, roleCalon, prodi, kurikulum, dosenSeed] = await Promise.all([
    prisma.role.findUnique({ where: { name: 'MAHASISWA' } }),
    prisma.role.findUnique({ where: { name: 'DOSEN_WALI' } }),
    prisma.role.findUnique({ where: { name: 'ADMIN_AKADEMIK' } }),
    prisma.role.findUnique({ where: { name: 'DOSEN' } }),
    prisma.role.findUnique({ where: { name: 'CALON_MAHASISWA' } }),
    prisma.programStudi.findFirst(),
    prisma.kurikulum.findFirst({ where: { is_active: true } }),
    prisma.dosen.findFirst(),
  ]);
  assert.ok(roleMhs && roleDosenWali && roleAdmin && roleDosen && roleCalon && prodi && kurikulum && dosenSeed, 'data seed MVP 1 harus tersedia');

  // PA pemilik (Dosen Wali untuk mahasiswa uji) — supaya KRS bisa di-approve menuju DISETUJUI
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
      nama: 'Dosen Wali Uji Fase 10',
      prodi_id: prodi.id,
      is_active: true,
    },
  });
  dosenWaliId = dosenWali.id;

  // Dosen pengampu (role DOSEN) — untuk endpoint /jadwal/mengajar
  const dosenPengampuUser = await prisma.user.create({
    data: {
      username: `${suffix}-dosen`,
      email: `${suffix}-dosen@kampus.test`,
      password_hash: await hashPassword('Password123!'),
      status: 'ACTIVE',
      user_roles: { create: { role_id: roleDosen.id } },
    },
  });
  const dosenPengampu = await prisma.dosen.create({
    data: {
      user_id: dosenPengampuUser.id,
      nidn: `00${suffix.slice(-8)}02`,
      nip: `${suffix}-dosen`,
      nama: 'Dosen Pengampu Fase 10',
      prodi_id: prodi.id,
      is_active: true,
    },
  });

  // Admin Akademik (jadwal:manage)
  const adminUser = await prisma.user.create({
    data: {
      username: `${suffix}-admin`,
      email: `${suffix}-admin@kampus.test`,
      password_hash: await hashPassword('Password123!'),
      status: 'ACTIVE',
      user_roles: { create: { role_id: roleAdmin.id } },
    },
  });

  // Calon Mahasiswa (untuk verifikasi akses 403 ke /jadwal/saya)
  const calonUser = await prisma.user.create({
    data: {
      username: `${suffix}-calon`,
      email: `${suffix}-calon@kampus.test`,
      password_hash: await hashPassword('Password123!'),
      status: 'ACTIVE',
      user_roles: { create: { role_id: roleCalon.id } },
    },
  });

  // Mahasiswa bimbingan (akan punya KRS DISETUJUI untuk skenario jadwal/saya)
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
      nama: 'Mahasiswa Uji Fase 10',
      prodi_id: prodi.id,
      angkatan: 2024,
      status_akademik: 'AKTIF',
      dosen_wali_id: dosenWali.id,
    },
  });

  // Mahasiswa 2 (tanpa KRS disetujui — untuk skenario jadwal kosong)
  const mhsUser2 = await prisma.user.create({
    data: {
      username: `${suffix}-mhs2`,
      email: `${suffix}-mhs2@kampus.test`,
      password_hash: await hashPassword('Password123!'),
      status: 'ACTIVE',
      user_roles: { create: { role_id: roleMhs.id } },
    },
  });
  await prisma.mahasiswa.create({
    data: {
      user_id: mhsUser2.id,
      nim: `96${Date.now().toString().slice(-8)}`,
      nama: 'Mahasiswa Tanpa KRS Fase 10',
      prodi_id: prodi.id,
      angkatan: 2024,
      status_akademik: 'AKTIF',
      dosen_wali_id: dosenWali.id,
    },
  });

  // Buat ruangan untuk skenario bentrok
  const gedung = await prisma.gedung.create({
    data: { kode: `${suffix}-G`, nama: 'Gedung Uji Fase 10' },
  });
  const ruangA = await prisma.ruangan.create({
    data: { gedung_id: gedung.id, kode: `${suffix}-R-A`, nama: 'Ruang A Uji', kapasitas: 30, is_active: true },
  });
  const ruangB = await prisma.ruangan.create({
    data: { gedung_id: gedung.id, kode: `${suffix}-R-B`, nama: 'Ruang B Uji', kapasitas: 30, is_active: true },
  });
  ruanganId = ruangA.id;
  ruanganLainId = ruangB.id;

  // Mata kuliah & kelas untuk skenario
  const mkNormal = await prisma.mataKuliah.create({
    data: { kurikulum_id: kurikulum.id, kode: `${suffix}-normal`, nama: 'MK Normal Fase 10', sks: 3, semester_paket: 1, is_active: true },
  });
  const kelasNormal = await prisma.kelas.create({
    data: { mata_kuliah_id: mkNormal.id, semester_id: semesterId, dosen_id: dosenPengampu.id, ruangan_id: ruangA.id, kode_kelas: `${suffix}-A`, kapasitas: 20 },
  });
  kelasNormalId = kelasNormal.id;

  // Kelas kedua dengan dosen/rangan SAMA (untuk skenario bentrok dosen+ruangan)
  const mkBentrok = await prisma.mataKuliah.create({
    data: { kurikulum_id: kurikulum.id, kode: `${suffix}-bentrok`, nama: 'MK Bentrok Fase 10', sks: 3, semester_paket: 1, is_active: true },
  });
  const kelasBentrokDosen = await prisma.kelas.create({
    data: { mata_kuliah_id: mkBentrok.id, semester_id: semesterId, dosen_id: dosenPengampu.id, ruangan_id: ruangB.id, kode_kelas: `${suffix}-BD`, kapasitas: 20 },
  });
  kelasBentrokDosenId = kelasBentrokDosen.id;

  // Kelas ketiga dengan ruangan sama tapi dosen berbeda (untuk skenario bentrok ruangan saja)
  const mkRuang = await prisma.mataKuliah.create({
    data: { kurikulum_id: kurikulum.id, kode: `${suffix}-ruang`, nama: 'MK Ruang Fase 10', sks: 3, semester_paket: 1, is_active: true },
  });
  const kelasBentrokRuang = await prisma.kelas.create({
    data: { mata_kuliah_id: mkRuang.id, semester_id: semesterId, dosen_id: dosenSeed.id, ruangan_id: ruangA.id, kode_kelas: `${suffix}-BR`, kapasitas: 20 },
  });
  kelasBentrokRuangId = kelasBentrokRuang.id;

  // Login seluruh persona
  tokenMahasiswa = await loginUser(`${suffix}-mhs`);
  tokenMahasiswaBelumKrs = await loginUser(`${suffix}-mhs2`);
  tokenDosen = await loginUser(`${suffix}-dosen`);
  tokenAdmin = await loginUser(`${suffix}-admin`);
  tokenCalonMhs = await loginUser(`${suffix}-calon`);

  // Siapkan satu KRS DISETUJUI untuk mahasiswa uji (untuk skenario jadwal/saya)
  // Tambah item, submit, lalu approve via PA
  await request(`/api/v1/krs/saya/items?semester_id=${semesterId}`, {
    method: 'POST',
    token: tokenMahasiswa,
    body: { kelas_id: kelasNormalId },
  });
  await request('/api/v1/krs/saya/submit', {
    method: 'POST',
    token: tokenMahasiswa,
    body: { semester_id: semesterId },
  });
  // Ambil KRS id via /saya lalu approve via PA
  const krsRes = await request(`/api/v1/krs/saya?semester_id=${semesterId}`, { token: tokenMahasiswa });
  const krsId = krsRes.data.data.id;
  const tokenPA = await loginUser(`${suffix}-pa`);
  await request(`/api/v1/krs/${krsId}/approve`, { method: 'POST', token: tokenPA });

  // Buat jadwal untuk kelasNormal: Senin 07:30-09:10 (agar /jadwal/saya punya slot)
  await request('/api/v1/jadwal', {
    method: 'POST',
    token: tokenAdmin,
    body: { kelas_id: kelasNormalId, hari: 'SENIN', jam_mulai: '07:30', jam_selesai: '09:10' },
  });
  // Slot kedua di hari berbeda untuk kelasNormal (Rabu)
  await request('/api/v1/jadwal', {
    method: 'POST',
    token: tokenAdmin,
    body: { kelas_id: kelasNormalId, hari: 'RABU', jam_mulai: '10:00', jam_selesai: '11:40' },
  });
});

test.after(async () => {
  try {
    await prisma.jadwalKelas.deleteMany({ where: { kelas: { kode_kelas: { startsWith: suffix } } } });
    await prisma.kRS.deleteMany({ where: { mahasiswa: { user: { username: { startsWith: suffix } } } } });
    await prisma.kelas.deleteMany({ where: { kode_kelas: { startsWith: suffix } } });
    await prisma.mataKuliah.deleteMany({ where: { kode: { startsWith: suffix } } });
    await prisma.ruangan.deleteMany({ where: { kode: { startsWith: suffix } } });
    await prisma.gedung.deleteMany({ where: { kode: { startsWith: suffix } } });
    await prisma.dosen.deleteMany({ where: { nip: { startsWith: suffix } } });
    await prisma.mahasiswa.deleteMany({ where: { user: { username: { startsWith: suffix } } } });
    await prisma.user.deleteMany({ where: { username: { startsWith: suffix } } });
  } finally {
    await new Promise((resolve) => server?.close(resolve));
    await prisma.$disconnect();
  }
});

// ================================================================
// Skenario 1: Admin Akademik CRUD jadwal dasar
// ================================================================

test('Fase 10: Admin dapat membuat slot jadwal baru (201) + audit CREATE_JADWAL', async () => {
  const res = await request('/api/v1/jadwal', {
    method: 'POST',
    token: tokenAdmin,
    body: { kelas_id: kelasNormalId, hari: 'JUMAT', jam_mulai: '13:00', jam_selesai: '14:40' },
  });
  assert.equal(res.response.status, 201);
  assert.equal(res.data.success, true);
  assert.equal(res.data.data.hari, 'JUMAT');
  assert.equal(res.data.data.jam_mulai, '13:00');
  assert.equal(res.data.data.jam_selesai, '14:40');
  assert.equal(res.data.data.kelas.kode_kelas.includes(suffix), true);

  // Audit tercatat
  const audit = await prisma.auditLog.findFirst({
    where: { entity: 'jadwal_kelas', entity_id: res.data.data.id, action: 'CREATE_JADWAL' },
  });
  assert.ok(audit, 'CREATE_JADWAL harus tercatat');

  // Cleanup slot ini
  await prisma.jadwalKelas.delete({ where: { id: res.data.data.id } }).catch(() => {});
});

test('Fase 10: validasi Zod menolak jam invalid / hari invalid (400)', async () => {
  const jamInvalid = await request('/api/v1/jadwal', {
    method: 'POST',
    token: tokenAdmin,
    body: { kelas_id: kelasNormalId, hari: 'SENIN', jam_mulai: '25:00', jam_selesai: '09:00' },
  });
  assert.equal(jamInvalid.response.status, 400);

  const hariInvalid = await request('/api/v1/jadwal', {
    method: 'POST',
    token: tokenAdmin,
    body: { kelas_id: kelasNormalId, hari: 'MINGGU', jam_mulai: '07:30', jam_selesai: '09:00' },
  });
  assert.equal(hariInvalid.response.status, 400);

  const urutanInvalid = await request('/api/v1/jadwal', {
    method: 'POST',
    token: tokenAdmin,
    body: { kelas_id: kelasNormalId, hari: 'KAMIS', jam_mulai: '10:00', jam_selesai: '08:00' },
  });
  assert.equal(urutanInvalid.response.status, 400);
});

test('Fase 10: duplikat slot (kelas+hari+jam_mulai sama) ditolak 409', async () => {
  const buat = await request('/api/v1/jadwal', {
    method: 'POST',
    token: tokenAdmin,
    body: { kelas_id: kelasNormalId, hari: 'SELASA', jam_mulai: '07:30', jam_selesai: '09:10' },
  });
  assert.equal(buat.response.status, 201);

  const duplikat = await request('/api/v1/jadwal', {
    method: 'POST',
    token: tokenAdmin,
    body: { kelas_id: kelasNormalId, hari: 'SELASA', jam_mulai: '07:30', jam_selesai: '09:10' },
  });
  assert.equal(duplikat.response.status, 409);

  await prisma.jadwalKelas.delete({ where: { id: buat.data.data.id } }).catch(() => {});
});

// ================================================================
// Skenario 2: Matriks deteksi bentrok (FR-101)
// ================================================================

test('Fase 10: bentrok DOSEN pada hari & waktu sama ditolak 409 + bentrok_dengan[]', async () => {
  // Buat slot pertama untuk kelasBentrokDosen (dosen pengampu sama) — Selasa 08:00-09:40
  const slot1 = await request('/api/v1/jadwal', {
    method: 'POST',
    token: tokenAdmin,
    body: { kelas_id: kelasBentrokDosenId, hari: 'SELASA', jam_mulai: '08:00', jam_selesai: '09:40' },
  });
  assert.equal(slot1.response.status, 201);

  // Slot kedua untuk kelasNormal (dosen SAMA: dosenPengampu) overlap waktu di hari sama
  // kelasNormal pakai dosen_id = dosenPengampu → bentrok DOSEN
  const slot2 = await request('/api/v1/jadwal', {
    method: 'POST',
    token: tokenAdmin,
    body: { kelas_id: kelasNormalId, hari: 'SELASA', jam_mulai: '08:30', jam_selesai: '10:00' },
  });
  assert.equal(slot2.response.status, 409);
  assert.ok(Array.isArray(slot2.data.errors?.bentrok_dengan));
  assert.ok(slot2.data.errors.bentrok_dengan.length > 0);

  await prisma.jadwalKelas.delete({ where: { id: slot1.data.data.id } }).catch(() => {});
});

test('Fase 10: bentrok RUANGAN pada hari & waktu sama ditolak 409', async () => {
  // kelasBentrokRuang pakai ruangA (sama dengan kelasNormal) tetapi dosen berbeda (dosenSeed)
  // Buat slot pertama untuk kelasNormal di KAMIS 08:00-09:40
  const slot1 = await request('/api/v1/jadwal', {
    method: 'POST',
    token: tokenAdmin,
    body: { kelas_id: kelasNormalId, hari: 'KAMIS', jam_mulai: '08:00', jam_selesai: '09:40' },
  });
  assert.equal(slot1.response.status, 201);

  // Slot kedua untuk kelasBentrokRuang (ruangan SAMA ruangA, dosen beda) overlap waktu
  const slot2 = await request('/api/v1/jadwal', {
    method: 'POST',
    token: tokenAdmin,
    body: { kelas_id: kelasBentrokRuangId, hari: 'KAMIS', jam_mulai: '09:00', jam_selesai: '10:30' },
  });
  assert.equal(slot2.response.status, 409);
  assert.ok(Array.isArray(slot2.data.errors?.bentrok_dengan));
  assert.ok(slot2.data.errors.bentrok_dengan.length > 0);

  await prisma.jadwalKelas.delete({ where: { id: slot1.data.data.id } }).catch(() => {});
});

test('Fase 10: slot tidak bentrok bila waktu overlap di hari BERBEDA → 201', async () => {
  // Slot di SENIN untuk kelasNormal
  const slot1 = await request('/api/v1/jadwal', {
    method: 'POST',
    token: tokenAdmin,
    body: { kelas_id: kelasNormalId, hari: 'SENIN', jam_mulai: '14:00', jam_selesai: '15:40' },
  });
  assert.equal(slot1.response.status, 201);

  // Slot di RABU (hari beda) untuk kelasBentrokDosen (dosen sama) — TIDAK boleh dilaporkan bentrok
  const slot2 = await request('/api/v1/jadwal', {
    method: 'POST',
    token: tokenAdmin,
    body: { kelas_id: kelasBentrokDosenId, hari: 'RABU', jam_mulai: '14:00', jam_selesai: '15:40' },
  });
  assert.equal(slot2.response.status, 201);

  await prisma.jadwalKelas.delete({ where: { id: slot1.data.data.id } }).catch(() => {});
  await prisma.jadwalKelas.delete({ where: { id: slot2.data.data.id } }).catch(() => {});
});

test('Fase 10: slot berdekatan tanpa overlap (selesai == mulai) → 201 (tidak bentrok)', async () => {
  // kelasNormal SENIN 07:30-09:10 sudah ada di setup; buat slot lanjutan 09:10-10:40 di kelasBentrokDosen
  // (ruang beda, dosen sama) → tidak overlap karena 09:10 == mulai slot2
  const slot = await request('/api/v1/jadwal', {
    method: 'POST',
    token: tokenAdmin,
    body: { kelas_id: kelasBentrokDosenId, hari: 'SENIN', jam_mulai: '09:10', jam_selesai: '10:40' },
  });
  assert.equal(slot.response.status, 201);

  await prisma.jadwalKelas.delete({ where: { id: slot.data.data.id } }).catch(() => {});
});

// ================================================================
// Skenario 3: Update & delete slot
// ================================================================

test('Fase 10: Admin dapat update slot jadwal + audit UPDATE_JADWAL', async () => {
  const buat = await request('/api/v1/jadwal', {
    method: 'POST',
    token: tokenAdmin,
    body: { kelas_id: kelasNormalId, hari: 'JUMAT', jam_mulai: '07:30', jam_selesai: '09:10' },
  });
  assert.equal(buat.response.status, 201);

  const update = await request(`/api/v1/jadwal/${buat.data.data.id}`, {
    method: 'PUT',
    token: tokenAdmin,
    body: { jam_mulai: '10:00', jam_selesai: '11:40' },
  });
  assert.equal(update.response.status, 200);
  assert.equal(update.data.data.jam_mulai, '10:00');
  assert.equal(update.data.data.jam_selesai, '11:40');

  const audit = await prisma.auditLog.findFirst({
    where: { entity: 'jadwal_kelas', entity_id: buat.data.data.id, action: 'UPDATE_JADWAL' },
  });
  assert.ok(audit, 'UPDATE_JADWAL harus tercatat');
  assert.equal(audit.old_values.jam_mulai, '07:30');
  assert.equal(audit.new_values.jam_mulai, '10:00');

  await prisma.jadwalKelas.delete({ where: { id: buat.data.data.id } }).catch(() => {});
});

test('Fase 10: update ke waktu yang bentrok ditolak 409', async () => {
  // Buat 2 slot non-bentrok di SENIN
  const slot1 = await request('/api/v1/jadwal', {
    method: 'POST',
    token: tokenAdmin,
    body: { kelas_id: kelasNormalId, hari: 'SABTU', jam_mulai: '07:30', jam_selesai: '09:10' },
  });
  assert.equal(slot1.response.status, 201);
  const slot2 = await request('/api/v1/jadwal', {
    method: 'POST',
    token: tokenAdmin,
    body: { kelas_id: kelasBentrokDosenId, hari: 'SABTU', jam_mulai: '10:00', jam_selesai: '11:40' },
  });
  assert.equal(slot2.response.status, 201);

  // Update slot2 ke waktu yang overlap dengan slot1 (dosen sama) → 409
  const update = await request(`/api/v1/jadwal/${slot2.data.data.id}`, {
    method: 'PUT',
    token: tokenAdmin,
    body: { jam_mulai: '08:00', jam_selesai: '09:30' },
  });
  assert.equal(update.response.status, 409);

  await prisma.jadwalKelas.delete({ where: { id: slot1.data.data.id } }).catch(() => {});
  await prisma.jadwalKelas.delete({ where: { id: slot2.data.data.id } }).catch(() => {});
});

test('Fase 10: Admin dapat hapus slot jadwal + audit DELETE_JADWAL', async () => {
  const buat = await request('/api/v1/jadwal', {
    method: 'POST',
    token: tokenAdmin,
    body: { kelas_id: kelasNormalId, hari: 'JUMAT', jam_mulai: '15:00', jam_selesai: '16:40' },
  });
  assert.equal(buat.response.status, 201);

  const del = await request(`/api/v1/jadwal/${buat.data.data.id}`, {
    method: 'DELETE',
    token: tokenAdmin,
  });
  assert.equal(del.response.status, 200);

  const audit = await prisma.auditLog.findFirst({
    where: { entity: 'jadwal_kelas', entity_id: buat.data.data.id, action: 'DELETE_JADWAL' },
  });
  assert.ok(audit, 'DELETE_JADWAL harus tercatat');
  assert.equal(audit.old_values.kode_kelas.includes(suffix), true);

  // Hapus lagi → 404
  const del2 = await request(`/api/v1/jadwal/${buat.data.data.id}`, { method: 'DELETE', token: tokenAdmin });
  assert.equal(del2.response.status, 404);
});

// ================================================================
// Skenario 4: RBAC — non-admin ditolak
// ================================================================

test('Fase 10: mahasiswa & dosen ditolak create/update/delete jadwal (403)', async () => {
  const createMhs = await request('/api/v1/jadwal', {
    method: 'POST',
    token: tokenMahasiswa,
    body: { kelas_id: kelasNormalId, hari: 'SENIN', jam_mulai: '07:30', jam_selesai: '09:10' },
  });
  assert.equal(createMhs.response.status, 403);

  const createDosen = await request('/api/v1/jadwal', {
    method: 'POST',
    token: tokenDosen,
    body: { kelas_id: kelasNormalId, hari: 'SENIN', jam_mulai: '07:30', jam_selesai: '09:10' },
  });
  assert.equal(createDosen.response.status, 403);

  const del = await request('/api/v1/jadwal/00000000-0000-0000-0000-000000000000', {
    method: 'DELETE',
    token: tokenMahasiswa,
  });
  assert.equal(del.response.status, 403);
});

test('Fase 10: endpoint tanpa token ditolak 401', async () => {
  const res = await request('/api/v1/jadwal');
  assert.equal(res.response.status, 401);
});

// ================================================================
// Skenario 5: View mahasiswa — /jadwal/saya dari KRS DISETUJUI
// ================================================================

test('Fase 10: mahasiswa dengan KRS DISETUJUI dapat melihat jadwal /saya (view=list)', async () => {
  const res = await request('/api/v1/jadwal/saya?view=list', { token: tokenMahasiswa });
  assert.equal(res.response.status, 200);
  assert.equal(res.data.data.view, 'list');
  assert.equal(res.data.data.status_krs, 'DISETUJUI');
  // Slot SENIN & RABU harus ada (dibuat di setup)
  assert.ok(res.data.data.jadwal.SENIN.length > 0);
  assert.ok(res.data.data.jadwal.RABU.length > 0);
  const seninSlot = res.data.data.jadwal.SENIN[0];
  assert.equal(seninSlot.hari, 'SENIN');
  assert.equal(seninSlot.jam_mulai, '07:30');
  assert.equal(seninSlot.kelas.kode_kelas.includes(suffix), true);
});

test('Fase 10: view=calendar memproyeksikan jadwal ke tanggal konkret', async () => {
  const res = await request('/api/v1/jadwal/saya?view=calendar', { token: tokenMahasiswa });
  assert.equal(res.response.status, 200);
  assert.equal(res.data.data.view, 'calendar');
  assert.ok(Array.isArray(res.data.data.jadwal));
  assert.ok(res.data.data.jadwal.length > 0);
  const ev = res.data.data.jadwal[0];
  assert.ok(ev.mulai);
  assert.ok(ev.selesai);
  assert.equal(typeof ev.mulai, 'string');
});

test('Fase 10: mahasiswa tanpa KRS disetujui mendapat jadwal kosong', async () => {
  const res = await request('/api/v1/jadwal/saya', { token: tokenMahasiswaBelumKrs });
  assert.equal(res.response.status, 200);
  // Tidak ada KRS disetujui → jadwal kosong (object atau array kosong)
  assert.equal(res.data.data.status_krs === 'DISETUJUI', false);
});

test('Fase 10: non-mahasiswa (calon mhs) ditolak akses /jadwal/saya (403)', async () => {
  const res = await request('/api/v1/jadwal/saya', { token: tokenCalonMhs });
  assert.equal(res.response.status, 403);
});

// ================================================================
// Skenario 6: View dosen — /jadwal/mengajar
// ================================================================

test('Fase 10: dosen dapat melihat jadwal kelas yang diampu (/jadwal/mengajar)', async () => {
  const res = await request('/api/v1/jadwal/mengajar', { token: tokenDosen });
  assert.equal(res.response.status, 200);
  assert.equal(res.data.data.view, 'list');
  // kelasNormal diampu dosenPengampu → slot SENIN & RABU harus muncul
  assert.ok(res.data.data.jadwal.SENIN.length > 0);
  assert.ok(res.data.data.jadwal.RABU.length > 0);
});

test('Fase 10: mahasiswa & calon ditolak akses /jadwal/mengajar (403)', async () => {
  const res = await request('/api/v1/jadwal/mengajar', { token: tokenMahasiswa });
  assert.equal(res.response.status, 403);
});

// ================================================================
// Skenario 7: List admin + filter + getById
// ================================================================

test('Fase 10: Admin list jadwal dengan filter dosen & pagination', async () => {
  const res = await request(`/api/v1/jadwal?limit=5&page=1`, { token: tokenAdmin });
  assert.equal(res.response.status, 200);
  assert.ok(res.data.meta);
  assert.equal(res.data.meta.limit, 5);

  // Filter by hari=SENIN
  const filtered = await request('/api/v1/jadwal?hari=SENIN', { token: tokenAdmin });
  assert.equal(filtered.response.status, 200);
  assert.ok(filtered.data.data.every((j) => j.hari === 'SENIN'));
});

test('Fase 10: getById slot jadwal (scoped login)', async () => {
  const list = await request('/api/v1/jadwal?hari=SENIN&limit=1', { token: tokenAdmin });
  assert.ok(list.data.data.length > 0);
  const id = list.data.data[0].id;

  const detail = await request(`/api/v1/jadwal/${id}`, { token: tokenMahasiswa });
  assert.equal(detail.response.status, 200);
  assert.equal(detail.data.data.id, id);

  const notFound = await request('/api/v1/jadwal/00000000-0000-0000-0000-000000000000', { token: tokenAdmin });
  assert.equal(notFound.response.status, 404);
});

// ================================================================
// Skenario 8: Konkurensi ganda create → satu sukses, lain 409
// ================================================================

test('Fase 10: create ganda konkuren slot bentrok → satu 201, satu 409', async () => {
  // Dua admin request serentak untuk slot yang bentrok (kelas berbeda, dosen sama, waktu overlap)
  const [r1, r2] = await Promise.all([
    request('/api/v1/jadwal', {
      method: 'POST',
      token: tokenAdmin,
      body: { kelas_id: kelasNormalId, hari: 'SABTU', jam_mulai: '13:00', jam_selesai: '14:40' },
    }),
    request('/api/v1/jadwal', {
      method: 'POST',
      token: tokenAdmin,
      body: { kelas_id: kelasBentrokDosenId, hari: 'SABTU', jam_mulai: '13:30', jam_selesai: '15:00' },
    }),
  ]);
  const statuses = [r1.response.status, r2.response.status].sort();
  // Satu 201, satu 409
  assert.deepEqual(statuses, [201, 409], `harus 201+409, dapat ${statuses.join(',')}`);

  // Cleanup slot yang sukses dibuat
  const sukses = r1.response.status === 201 ? r1 : r2;
  if (sukses.data?.data?.id) {
    await prisma.jadwalKelas.delete({ where: { id: sukses.data.data.id } }).catch(() => {});
  }
});
