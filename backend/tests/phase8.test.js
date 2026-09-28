import test from 'node:test';
import assert from 'node:assert/strict';
import app from '../src/app.js';
import prisma from '../src/config/prisma.js';
import { hashPassword } from '../src/utils/password.js';

let server;
let baseUrl;
let tokenMahasiswa;
let mahasiswaId;
let semesterId;
let kelasNormalId;
let kelasBesarId;
let krsId;
let activePeriodeSebelum = [];
let tahunAkademikTestId;
const suffix = `phase8-${Date.now()}`;

async function request(path, { method = 'GET', token, body } = {}) {
  const response = await fetch(`${baseUrl}${path}`, {
    method,
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(body ? { 'Content-Type': 'application/json' } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });

  return { response, data: await response.json() };
}

test.before(async () => {
  await new Promise((resolve) => {
    server = app.listen(0, () => {
      baseUrl = `http://localhost:${server.address().port}`;
      resolve();
    });
  });

  activePeriodeSebelum = await prisma.periodeKRS.findMany({ where: { is_aktif: true } });
  await prisma.periodeKRS.updateMany({ where: { is_aktif: true }, data: { is_aktif: false } });

  const [role, prodi, kurikulum, dosen, tahunAkademik] = await Promise.all([
    prisma.role.findUnique({ where: { name: 'MAHASISWA' } }),
    prisma.programStudi.findFirst(),
    prisma.kurikulum.findFirst({ where: { is_active: true } }),
    prisma.dosen.findFirst(),
    prisma.tahunAkademik.findFirst(),
  ]);
  assert.ok(role && prodi && kurikulum && dosen && tahunAkademik, 'data seed MVP 1 harus tersedia');

  const user = await prisma.user.create({
    data: {
      username: suffix,
      email: `${suffix}@kampus.test`,
      password_hash: await hashPassword('Password123!'),
      status: 'ACTIVE',
      user_roles: { create: { role_id: role.id } },
    },
  });
  const mahasiswa = await prisma.mahasiswa.create({
    data: {
      user_id: user.id,
      nim: `98${Date.now().toString().slice(-8)}`,
      nama: 'Mahasiswa Uji Fase 8',
      prodi_id: prodi.id,
      angkatan: 2024,
      status_akademik: 'AKTIF',
    },
  });
  mahasiswaId = mahasiswa.id;

  const tahunAkademikTest = await prisma.tahunAkademik.create({
    data: { kode: `${suffix}-ta`, nama: 'Tahun Akademik Uji Fase 8', is_active: true },
  });
  tahunAkademikTestId = tahunAkademikTest.id;
  const semester = await prisma.semester.create({
    data: {
      tahun_akademik_id: tahunAkademikTest.id,
      tipe: 'ANTARA',
      tanggal_mulai: new Date(),
      tanggal_selesai: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      is_active: true,
    },
  });
  semesterId = semester.id;

  await prisma.periodeKRS.create({
    data: {
      semester_id: semesterId,
      nama: 'Periode Uji Fase 8',
      tanggal_mulai: new Date(Date.now() - 24 * 60 * 60 * 1000),
      tanggal_selesai: new Date(Date.now() + 24 * 60 * 60 * 1000),
      sks_maks: 24,
      is_aktif: true,
    },
  });

  const [mkNormal, mkBesar] = await Promise.all([
    prisma.mataKuliah.create({
      data: { kurikulum_id: kurikulum.id, kode: `${suffix}-normal`, nama: 'MK Normal Fase 8', sks: 3, semester_paket: 1, is_active: true },
    }),
    prisma.mataKuliah.create({
      data: { kurikulum_id: kurikulum.id, kode: `${suffix}-besar`, nama: 'MK Besar Fase 8', sks: 25, semester_paket: 1, is_active: true },
    }),
  ]);
  const [kelasNormal, kelasBesar] = await Promise.all([
    prisma.kelas.create({ data: { mata_kuliah_id: mkNormal.id, semester_id: semesterId, dosen_id: dosen.id, kode_kelas: `${suffix}-A`, kapasitas: 20 } }),
    prisma.kelas.create({ data: { mata_kuliah_id: mkBesar.id, semester_id: semesterId, dosen_id: dosen.id, kode_kelas: `${suffix}-B`, kapasitas: 20 } }),
  ]);
  kelasNormalId = kelasNormal.id;
  kelasBesarId = kelasBesar.id;

  const login = await request('/api/v1/auth/login', {
    method: 'POST',
    body: { identifier: suffix, password: 'Password123!' },
  });
  assert.equal(login.response.status, 200);
  tokenMahasiswa = login.data.data.accessToken;
});

test.after(async () => {
  if (krsId) await prisma.kRS.deleteMany({ where: { id: krsId } });
  await prisma.kRS.deleteMany({ where: { semester_id: semesterId } });
  await prisma.periodeKRS.deleteMany({ where: { semester_id: semesterId } });
  await prisma.kelas.deleteMany({ where: { semester_id: semesterId } });
  await prisma.mataKuliah.deleteMany({ where: { kode: { startsWith: suffix } } });
  await prisma.semester.delete({ where: { id: semesterId } });
  await prisma.tahunAkademik.delete({ where: { id: tahunAkademikTestId } });
  for (const periode of activePeriodeSebelum) {
    await prisma.periodeKRS.update({ where: { id: periode.id }, data: { is_aktif: true } });
  }
  await prisma.mahasiswa.deleteMany({ where: { id: mahasiswaId } });
  await prisma.user.deleteMany({ where: { username: suffix } });
  await new Promise((resolve) => server?.close(resolve));
  await prisma.$disconnect();
});

test('Fase 8: periode aktif dan katalog kelas tersedia untuk mahasiswa', async () => {
  const periode = await request('/api/v1/krs/periode-aktif', { token: tokenMahasiswa });
  assert.equal(periode.response.status, 200);
  assert.equal(periode.data.success, true);

  const katalog = await request(`/api/v1/krs/tersedia?semester_id=${semesterId}`, { token: tokenMahasiswa });
  assert.equal(katalog.response.status, 200);
  assert.equal(katalog.data.success, true);
  assert.ok(katalog.data.data.kelas.some((kelas) => kelas.id === kelasNormalId));
});

test('Fase 8: mahasiswa dapat membuat draft, menambah item, dan duplikat ditolak', async () => {
  const tambah = await request(`/api/v1/krs/saya/items?semester_id=${semesterId}`, {
    method: 'POST',
    token: tokenMahasiswa,
    body: { kelas_id: kelasNormalId },
  });
  assert.equal(tambah.response.status, 201);
  assert.equal(tambah.data.data.status, 'DRAFT');
  assert.equal(tambah.data.data.total_sks, 3);
  krsId = tambah.data.data.id;

  const duplikat = await request(`/api/v1/krs/saya/items?semester_id=${semesterId}`, {
    method: 'POST',
    token: tokenMahasiswa,
    body: { kelas_id: kelasNormalId },
  });
  assert.equal(duplikat.response.status, 409);
  assert.equal(duplikat.data.success, false);
});

test('Fase 8: draft boleh melampaui SKS, tetapi submit mengembalikan reasons terstruktur', async () => {
  const tambah = await request(`/api/v1/krs/saya/items?semester_id=${semesterId}`, {
    method: 'POST',
    token: tokenMahasiswa,
    body: { kelas_id: kelasBesarId },
  });
  assert.equal(tambah.response.status, 201);
  assert.equal(tambah.data.data.total_sks, 28);

  const submit = await request('/api/v1/krs/saya/submit', {
    method: 'POST',
    token: tokenMahasiswa,
    body: { semester_id: semesterId },
  });
  assert.equal(submit.response.status, 422);
  assert.equal(submit.data.success, false);
  assert.ok(submit.data.data.errors.some((error) => error.kode === 'SKS_MELEBIHI_BATAS'));
});

test('Fase 8: hapus item merekalkulasi SKS dan submit menutup siklus draft', async () => {
  const krs = await prisma.kRS.findUnique({
    where: { id: krsId },
    include: { detail: { where: { kelas_id: kelasBesarId } } },
  });
  assert.equal(krs.detail.length, 1);

  const hapus = await request(`/api/v1/krs/saya/items/${krs.detail[0].id}`, {
    method: 'DELETE',
    token: tokenMahasiswa,
  });
  assert.equal(hapus.response.status, 200);
  assert.equal(hapus.data.data.total_sks, 3);

  const submit = await request('/api/v1/krs/saya/submit', {
    method: 'POST',
    token: tokenMahasiswa,
    body: { semester_id: semesterId },
  });
  assert.equal(submit.response.status, 200);
  assert.equal(submit.data.data.status, 'DIAJUKAN');
  assert.ok(submit.data.data.diajukan_at);

  const audits = await prisma.auditLog.findMany({
    where: { entity: 'krs', entity_id: krsId, action: { in: ['CREATE_KRS_DRAFT', 'UPDATE_KRS_ITEM', 'SUBMIT_KRS'] } },
  });
  assert.ok(audits.some((audit) => audit.action === 'CREATE_KRS_DRAFT'));
  assert.ok(audits.some((audit) => audit.action === 'SUBMIT_KRS'));
});

test('Fase 8: mutasi paralel menyimpan total SKS sesuai detail akhir', async () => {
  const [mkSatu, mkDua] = await Promise.all([
    prisma.mataKuliah.create({
      data: { kurikulum_id: (await prisma.kurikulum.findFirst({ where: { is_active: true } })).id, kode: `${suffix}-parallel-1`, nama: 'MK Paralel Satu', sks: 2, semester_paket: 1, is_active: true },
    }),
    prisma.mataKuliah.create({
      data: { kurikulum_id: (await prisma.kurikulum.findFirst({ where: { is_active: true } })).id, kode: `${suffix}-parallel-2`, nama: 'MK Paralel Dua', sks: 4, semester_paket: 1, is_active: true },
    }),
  ]);
  const [kelasSatu, kelasDua] = await Promise.all([
    prisma.kelas.create({ data: { mata_kuliah_id: mkSatu.id, semester_id: semesterId, dosen_id: (await prisma.dosen.findFirst()).id, kode_kelas: `${suffix}-P1`, kapasitas: 20 } }),
    prisma.kelas.create({ data: { mata_kuliah_id: mkDua.id, semester_id: semesterId, dosen_id: (await prisma.dosen.findFirst()).id, kode_kelas: `${suffix}-P2`, kapasitas: 20 } }),
  ]);

  // KRS sebelumnya sudah DIAJUKAN, sehingga buat mahasiswa terpisah untuk race add/remove.
  const role = await prisma.role.findUnique({ where: { name: 'MAHASISWA' } });
  const prodi = await prisma.programStudi.findFirst();
  const user = await prisma.user.create({
    data: {
      username: `${suffix}-parallel`,
      email: `${suffix}-parallel@kampus.test`,
      password_hash: await hashPassword('Password123!'),
      status: 'ACTIVE',
      user_roles: { create: { role_id: role.id } },
    },
  });
  const mahasiswa = await prisma.mahasiswa.create({
    data: { user_id: user.id, nim: `97${Date.now().toString().slice(-8)}`, nama: 'Mahasiswa Paralel', prodi_id: prodi.id, angkatan: 2024, status_akademik: 'AKTIF' },
  });
  const login = await request('/api/v1/auth/login', {
    method: 'POST',
    body: { identifier: `${suffix}-parallel`, password: 'Password123!' },
  });
  const parallelToken = login.data.data.accessToken;

  const add = (kelasId) => request(`/api/v1/krs/saya/items?semester_id=${semesterId}`, {
    method: 'POST', token: parallelToken, body: { kelas_id: kelasId },
  });
  const added = await Promise.all([add(kelasSatu.id), add(kelasDua.id)]);
  assert.ok(added.every((result) => result.response.status === 201));

  const parallelKrs = await prisma.kRS.findUnique({
    where: { mahasiswa_id_semester_id: { mahasiswa_id: mahasiswa.id, semester_id: semesterId } },
    include: { detail: { include: { kelas: { include: { mata_kuliah: true } } } } },
  });
  assert.equal(parallelKrs.total_sks, 6);
  assert.equal(parallelKrs.detail.reduce((total, detail) => total + detail.kelas.mata_kuliah.sks, 0), 6);

  const removed = await Promise.all(parallelKrs.detail.map((detail) => request(`/api/v1/krs/saya/items/${detail.id}`, {
    method: 'DELETE', token: parallelToken,
  })));
  assert.ok(removed.every((result) => result.response.status === 200));

  const finalKrs = await prisma.kRS.findUnique({
    where: { id: parallelKrs.id },
    include: { detail: true },
  });
  assert.equal(finalKrs.detail.length, 0);
  assert.equal(finalKrs.total_sks, 0);

  await prisma.kRS.delete({ where: { id: parallelKrs.id } });
  await prisma.mahasiswa.delete({ where: { id: mahasiswa.id } });
  await prisma.user.delete({ where: { id: user.id } });
});

test('Fase 8: periode untuk semester nonaktif dan mahasiswa CUTI ditolak', async () => {
  const inactiveTahunAkademik = await prisma.tahunAkademik.create({
    data: { kode: `${suffix}-inactive`, nama: 'Tahun Akademik Nonaktif', is_active: false },
  });
  const inactiveSemester = await prisma.semester.create({
    data: {
      tahun_akademik_id: inactiveTahunAkademik.id,
      tipe: 'GANJIL',
      tanggal_mulai: new Date(),
      tanggal_selesai: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      is_active: false,
    },
  });
  await prisma.periodeKRS.create({
    data: {
      semester_id: inactiveSemester.id,
      nama: 'Periode Semester Nonaktif',
      tanggal_mulai: new Date(Date.now() - 60_000),
      tanggal_selesai: new Date(Date.now() + 60_000),
      is_aktif: false,
    },
  });
  const rejectedSemester = await request(`/api/v1/krs/saya/items?semester_id=${inactiveSemester.id}`, {
    method: 'POST', token: tokenMahasiswa, body: { kelas_id: kelasNormalId },
  });
  assert.equal(rejectedSemester.response.status, 403);

  await prisma.mahasiswa.update({ where: { id: mahasiswaId }, data: { status_akademik: 'CUTI' } });
  const rejectedCuti = await request(`/api/v1/krs/saya/items?semester_id=${semesterId}`, {
    method: 'POST', token: tokenMahasiswa, body: { kelas_id: kelasNormalId },
  });
  assert.equal(rejectedCuti.response.status, 403);
  await prisma.mahasiswa.update({ where: { id: mahasiswaId }, data: { status_akademik: 'AKTIF' } });

  await prisma.periodeKRS.delete({ where: { semester_id: inactiveSemester.id } });
  await prisma.semester.delete({ where: { id: inactiveSemester.id } });
  await prisma.tahunAkademik.delete({ where: { id: inactiveTahunAkademik.id } });
});
