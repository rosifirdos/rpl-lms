import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'fs';
import path from 'path';
import app from '../src/app.js';
import prisma from '../src/config/prisma.js';
import { hashPassword } from '../src/utils/password.js';

describe('Fase 2: Autentikasi, Manajemen Sesi & RBAC Guard', () => {
  let server;
  let baseUrl;
  let adminToken;
  let dosenToken;
  let mahasiswaToken;
  let testUser;

  before(async () => {
    // Start ephemeral server
    await new Promise((resolve) => {
      server = app.listen(0, '127.0.0.1', () => {
        const port = server.address().port;
        baseUrl = `http://127.0.0.1:${port}`;
        resolve();
      });
    });

    // Create a dedicated test user for status tests & password tests
    const passwordHash = await hashPassword('password123');
    testUser = await prisma.user.upsert({
      where: { username: 'testuser_fase2' },
      update: {
        password_hash: passwordHash,
        status: 'ACTIVE',
        role: 'mahasiswa',
      },
      create: {
        username: 'testuser_fase2',
        email: 'testuser_fase2@upgris.ac.id',
        password_hash: passwordHash,
        status: 'ACTIVE',
        role: 'mahasiswa',
        profile: {
          create: {
            full_name: 'Test User Fase 2',
          },
        },
        mahasiswa: {
          create: {
            nim: '9999990001',
            prodi: 'Teknik Informatika',
            angkatan: 2024,
          },
        },
      },
      include: {
        profile: true,
        mahasiswa: true,
      },
    });
  });

  after(async () => {
    // Clean up test user & files
    if (testUser) {
      await prisma.user.deleteMany({
        where: { id: testUser.id },
      });
    }

    // Clean up test avatar file from disk & DB
    try {
      const testFiles = await prisma.file.findMany({
        where: { original_name: 'avatar_test.png' },
      });
      for (const tf of testFiles) {
        const p = path.resolve('storage/private/avatars', tf.storage_name);
        if (fs.existsSync(p)) {
          fs.unlinkSync(p);
        }
      }
      await prisma.file.deleteMany({
        where: { original_name: 'avatar_test.png' },
      });
    } catch {
      // ignore
    }

    if (server) {
      await new Promise((resolve) => server.close(resolve));
    }
  });

  describe('1. Multi-Credential Login (FR-001)', () => {
    test('Login dengan Username Admin harus berhasil dan mengembalikan token', async () => {
      const res = await fetch(`${baseUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier: 'admin',
          password: 'password123',
        }),
      });

      assert.equal(res.status, 200);
      const json = await res.json();
      assert.equal(json.success, true);
      assert.ok(json.data.accessToken);
      assert.ok(json.data.refreshToken);
      assert.equal(json.data.user.role, 'admin');
      adminToken = json.data.accessToken;
    });

    test('Login dengan Email Admin harus berhasil', async () => {
      const res = await fetch(`${baseUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier: 'admin@upgris.ac.id',
          password: 'password123',
        }),
      });

      assert.equal(res.status, 200);
      const json = await res.json();
      assert.equal(json.success, true);
      assert.equal(json.data.user.username, 'admin');
    });

    test('Login dengan NIDN/NIP Dosen harus berhasil dan menyertakan data dosen', async () => {
      const res = await fetch(`${baseUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier: '198501152010121002',
          password: 'password123',
        }),
      });

      assert.equal(res.status, 200);
      const json = await res.json();
      assert.equal(json.success, true);
      assert.equal(json.data.user.role, 'dosen');
      assert.ok(json.data.user.dosen);
      assert.equal(json.data.user.dosen.nidn, '198501152010121002');
      dosenToken = json.data.accessToken;
    });

    test('Login dengan NIM Mahasiswa harus berhasil dan menyertakan data mahasiswa', async () => {
      const res = await fetch(`${baseUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier: '2024001001',
          password: 'password123',
        }),
      });

      assert.equal(res.status, 200);
      const json = await res.json();
      assert.equal(json.success, true);
      assert.equal(json.data.user.role, 'mahasiswa');
      assert.ok(json.data.user.mahasiswa);
      assert.equal(json.data.user.mahasiswa.nim, '2024001001');
      mahasiswaToken = json.data.accessToken;
    });

    test('Login dengan password salah harus ditolak (401)', async () => {
      const res = await fetch(`${baseUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier: 'admin',
          password: 'wrongpassword',
        }),
      });

      assert.equal(res.status, 401);
      const json = await res.json();
      assert.equal(json.success, false);
    });

    test('Login dengan identifier tidak dikenal harus ditolak (401)', async () => {
      const res = await fetch(`${baseUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier: 'unknown_user_404',
          password: 'password123',
        }),
      });

      assert.equal(res.status, 401);
      const json = await res.json();
      assert.equal(json.success, false);
    });
  });

  describe('2. Aturan Bisnis: Penolakan Akun INACTIVE & SUSPENDED', () => {
    test('Akun INACTIVE harus ditolak saat login dengan 403 Forbidden', async () => {
      await prisma.user.update({
        where: { id: testUser.id },
        data: { status: 'INACTIVE' },
      });

      const res = await fetch(`${baseUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier: 'testuser_fase2',
          password: 'password123',
        }),
      });

      assert.equal(res.status, 403);
      const json = await res.json();
      assert.equal(json.success, false);
      assert.match(json.message, /tidak aktif/i);
    });

    test('Akun SUSPENDED harus ditolak saat login dengan 403 Forbidden', async () => {
      await prisma.user.update({
        where: { id: testUser.id },
        data: { status: 'SUSPENDED' },
      });

      const res = await fetch(`${baseUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier: 'testuser_fase2',
          password: 'password123',
        }),
      });

      assert.equal(res.status, 403);
      const json = await res.json();
      assert.equal(json.success, false);
      assert.match(json.message, /ditangguhkan/i);

      // Kembalikan status ke ACTIVE untuk pengujian selanjutnya
      await prisma.user.update({
        where: { id: testUser.id },
        data: { status: 'ACTIVE' },
      });
    });
  });

  describe('3. Manajemen Sesi: Refresh Token & Logout', () => {
    let refreshTok;

    test('Login harus mengembalikan refresh token yang valid', async () => {
      const res = await fetch(`${baseUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier: 'testuser_fase2',
          password: 'password123',
        }),
      });

      assert.equal(res.status, 200);
      const json = await res.json();
      refreshTok = json.data.refreshToken;
      assert.ok(refreshTok);
    });

    test('Refresh Token dapat menerbitkan Access Token baru', async () => {
      const res = await fetch(`${baseUrl}/api/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          refreshToken: refreshTok,
        }),
      });

      assert.equal(res.status, 200);
      const json = await res.json();
      assert.equal(json.success, true);
      assert.ok(json.data.accessToken);
    });

    test('Logout harus mencabut refresh token', async () => {
      const res = await fetch(`${baseUrl}/api/auth/logout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          refreshToken: refreshTok,
        }),
      });

      assert.equal(res.status, 200);
      const json = await res.json();
      assert.equal(json.success, true);

      // Coba refresh setelah logout harus ditolak (401)
      const refreshRes = await fetch(`${baseUrl}/api/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          refreshToken: refreshTok,
        }),
      });

      assert.equal(refreshRes.status, 401);
    });

    test('Forgot Password mengembalikan pesan aman', async () => {
      const res = await fetch(`${baseUrl}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier: 'testuser_fase2@upgris.ac.id',
        }),
      });

      assert.equal(res.status, 200);
      const json = await res.json();
      assert.equal(json.success, true);
      assert.match(json.message, /tautan verifikasi pemulihan kata sandi/i);
    });
  });

  describe('4. RBAC Guard & Otorisasi Endpoint', () => {
    test('Akses endpoint Admin tanpa token harus ditolak (401)', async () => {
      const res = await fetch(`${baseUrl}/api/admin/users`);
      assert.equal(res.status, 401);
      const json = await res.json();
      assert.equal(json.success, false);
    });

    test('Akses endpoint Admin dengan token Mahasiswa harus ditolak (403)', async () => {
      const res = await fetch(`${baseUrl}/api/admin/users`, {
        headers: {
          Authorization: `Bearer ${mahasiswaToken}`,
        },
      });
      assert.equal(res.status, 403);
      const json = await res.json();
      assert.equal(json.success, false);
    });

    test('Akses endpoint Admin dengan token Admin harus diizinkan (200)', async () => {
      const res = await fetch(`${baseUrl}/api/admin/users`, {
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      });
      assert.equal(res.status, 200);
      const json = await res.json();
      assert.equal(json.success, true);
    });
  });

  describe('5. Profil Pengguna Mandiri (FR-005 s/d FR-008)', () => {
    test('GET /api/profile mengembalikan identitas lengkap mahasiswa', async () => {
      const res = await fetch(`${baseUrl}/api/profile`, {
        headers: {
          Authorization: `Bearer ${mahasiswaToken}`,
        },
      });

      assert.equal(res.status, 200);
      const json = await res.json();
      assert.equal(json.success, true);
      assert.equal(json.data.role, 'mahasiswa');
      assert.ok(json.data.mahasiswa);
      assert.equal(json.data.mahasiswa.nim, '2024001001');
      assert.ok(json.data.profile);
    });

    test('GET /api/profile mengembalikan identitas lengkap dosen', async () => {
      const res = await fetch(`${baseUrl}/api/profile`, {
        headers: {
          Authorization: `Bearer ${dosenToken}`,
        },
      });

      assert.equal(res.status, 200);
      const json = await res.json();
      assert.equal(json.success, true);
      assert.equal(json.data.role, 'dosen');
      assert.ok(json.data.dosen);
      assert.equal(json.data.dosen.nidn, '198501152010121002');
    });

    test('PUT /api/profile memperbarui nama lengkap, nomor telepon, dan bio', async () => {
      const res = await fetch(`${baseUrl}/api/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${mahasiswaToken}`,
        },
        body: JSON.stringify({
          full_name: 'Ahmad Mahasiswa Terupdate',
          phone: '081234567890',
          bio: 'Mahasiswa aktif Teknik Informatika UPGRIS',
        }),
      });

      assert.equal(res.status, 200);
      const json = await res.json();
      assert.equal(json.success, true);
      assert.equal(json.data.profile.full_name, 'Ahmad Mahasiswa Terupdate');
      assert.equal(json.data.profile.phone, '081234567890');
      assert.equal(json.data.profile.bio, 'Mahasiswa aktif Teknik Informatika UPGRIS');
    });

    test('PUT /api/profile menolak jika email baru sudah digunakan orang lain (409)', async () => {
      const res = await fetch(`${baseUrl}/api/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${mahasiswaToken}`,
        },
        body: JSON.stringify({
          email: 'admin@upgris.ac.id', // Sudah dipakai oleh admin
        }),
      });

      assert.equal(res.status, 409);
      const json = await res.json();
      assert.equal(json.success, false);
      assert.match(json.message, /sudah digunakan/i);
    });

    test('POST /api/profile/avatar mengunggah foto profil valid (.png)', async () => {
      // 1x1 pixel PNG dummy buffer
      const pngBuffer = Buffer.from(
        'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
        'base64'
      );

      const formData = new FormData();
      formData.append(
        'avatar',
        new Blob([pngBuffer], { type: 'image/png' }),
        'avatar_test.png'
      );

      const res = await fetch(`${baseUrl}/api/profile/avatar`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${mahasiswaToken}`,
        },
        body: formData,
      });

      assert.equal(res.status, 200);
      const json = await res.json();
      assert.equal(json.success, true);
      assert.ok(json.data.profile.avatar_file);
      assert.equal(json.data.profile.avatar_file.mime_type, 'image/png');
    });

    test('GET /api/profile/avatar menyajikan foto profil yang baru diunggah', async () => {
      const res = await fetch(`${baseUrl}/api/profile/avatar`, {
        headers: {
          Authorization: `Bearer ${mahasiswaToken}`,
        },
      });

      assert.equal(res.status, 200);
      assert.equal(res.headers.get('content-type'), 'image/png');
      const arrayBuffer = await res.arrayBuffer();
      assert.ok(arrayBuffer.byteLength > 0);
    });

    test('POST /api/profile/avatar menolak berkas non-gambar (.txt) dengan 400', async () => {
      const txtBuffer = Buffer.from('Ini bukan gambar avatar');
      const formData = new FormData();
      formData.append(
        'avatar',
        new Blob([txtBuffer], { type: 'text/plain' }),
        'document.txt'
      );

      const res = await fetch(`${baseUrl}/api/profile/avatar`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${mahasiswaToken}`,
        },
        body: formData,
      });

      assert.equal(res.status, 400);
      const json = await res.json();
      assert.equal(json.success, false);
      assert.match(json.message, /Format berkas tidak didukung/i);
    });

    test('POST /api/profile/avatar menolak berkas > 2MB dengan 400', async () => {
      // 2.5 MB buffer
      const largeBuffer = Buffer.alloc(2.5 * 1024 * 1024, 0);
      const formData = new FormData();
      formData.append(
        'avatar',
        new Blob([largeBuffer], { type: 'image/png' }),
        'huge_avatar.png'
      );

      const res = await fetch(`${baseUrl}/api/profile/avatar`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${mahasiswaToken}`,
        },
        body: formData,
      });

      assert.equal(res.status, 400);
      const json = await res.json();
      assert.equal(json.success, false);
      assert.match(json.message, /melebihi batas maksimal/i);
    });

    test('PUT /api/profile/password mengganti kata sandi dengan verifikasi kata sandi lama', async () => {
      // Login testUser untuk mendapatkan tokennya
      const loginRes = await fetch(`${baseUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier: 'testuser_fase2',
          password: 'password123',
        }),
      });
      const loginJson = await loginRes.json();
      const testToken = loginJson.data.accessToken;

      // 1. Password lama salah
      const wrongOldRes = await fetch(`${baseUrl}/api/profile/password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${testToken}`,
        },
        body: JSON.stringify({
          old_password: 'passwordsalah',
          new_password: 'newpassword123',
          confirm_password: 'newpassword123',
        }),
      });
      assert.equal(wrongOldRes.status, 400);
      const wrongOldJson = await wrongOldRes.json();
      assert.match(wrongOldJson.message, /Kata sandi lama tidak sesuai/i);

      // 2. Password baru sama dengan password lama
      const sameOldRes = await fetch(`${baseUrl}/api/profile/password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${testToken}`,
        },
        body: JSON.stringify({
          old_password: 'password123',
          new_password: 'password123',
          confirm_password: 'password123',
        }),
      });
      assert.equal(sameOldRes.status, 400);
      const sameOldJson = await sameOldRes.json();
      assert.match(sameOldJson.message, /tidak boleh sama/i);

      // 3. Sukses ganti password
      const successRes = await fetch(`${baseUrl}/api/profile/password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${testToken}`,
        },
        body: JSON.stringify({
          old_password: 'password123',
          new_password: 'newpassword123',
          confirm_password: 'newpassword123',
        }),
      });
      assert.equal(successRes.status, 200);

      // 4. Login dengan password baru berhasil
      const newLoginRes = await fetch(`${baseUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier: 'testuser_fase2',
          password: 'newpassword123',
        }),
      });
      assert.equal(newLoginRes.status, 200);
    });
  });
});
