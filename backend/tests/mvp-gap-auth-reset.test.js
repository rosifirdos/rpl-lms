import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import app from '../src/app.js';
import prisma from '../src/config/prisma.js';
import { hashToken } from '../src/utils/token.js';
import { hashPassword } from '../src/utils/password.js';
import { getMailOutbox, clearMailOutbox } from '../src/utils/mailer.js';
import { ENV, PASSWORD_RESET_TTL_MINUTES } from '../src/config/env.js';

/**
 * Suite Workstream A: pemulihan kata sandi via email (FR-003).
 *
 * Membuat pengguna uji khusus (bukan pengguna seed) agar perubahan kata sandi
 * tidak mengganggu suite lain yang login memakai `password123`.
 */
describe('Workstream A: pemulihan kata sandi via email (FR-003)', () => {
  let server;
  let baseUrl;
  let testUser;

  const suffix = Date.now().toString().slice(-8);
  const username = `rstpw${suffix}`;
  const OLD_PASSWORD = 'password123';
  const NEW_PASSWORD = 'Kuat#2026Reset';

  const request = (url, { method = 'GET', body } = {}) =>
    fetch(`${baseUrl}${url}`, {
      method,
      headers: {
        ...(body ? { 'Content-Type': 'application/json' } : {}),
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });

  /** Minta tautan reset dan ekstrak token mentah dari outbox email. */
  async function requestResetToken(identifier) {
    clearMailOutbox();
    const response = await request('/api/auth/forgot-password', {
      method: 'POST',
      body: { identifier },
    });
    const payload = await response.json();
    assert.equal(response.status, 200, payload.message);
    assert.match(payload.message, /tautan pemulihan kata sandi telah dikirim/i);

    const outbox = getMailOutbox();
    assert.equal(outbox.length, 1, 'harus tepat satu email terkirim (transport memory)');
    const match = outbox[0].text.match(/token=([a-f0-9]{64})/);
    assert.ok(match, 'email harus memuat tautan dengan token 64 karakter hex');
    return { rawToken: match[1], email: outbox[0] };
  }

  before(async () => {
    await new Promise((resolve) => {
      server = app.listen(0, '127.0.0.1', () => {
        baseUrl = `http://127.0.0.1:${server.address().port}`;
        resolve();
      });
    });

    testUser = await prisma.user.create({
      data: {
        username,
        email: `${username}@test.local`,
        password_hash: await hashPassword(OLD_PASSWORD),
        role: 'mahasiswa',
        status: 'ACTIVE',
        profile: { create: { full_name: 'Tester Reset Password' } },
        mahasiswa: {
          create: { nim: `RST${suffix}`, prodi: 'Teknik Informatika', angkatan: 2024 },
        },
      },
      include: { profile: true, mahasiswa: true },
    });
  });

  after(async () => {
    if (testUser) {
      // Hapus pengguna uji (cascade: profile, mahasiswa, refresh & reset tokens).
      await prisma.user.delete({ where: { id: testUser.id } }).catch(() => {});
    }
    clearMailOutbox();
    await new Promise((resolve) => server.close(resolve));
  });

  test('identifier tidak dikenal tetap 200 generik tanpa email/token (anti-enumerasi)', async () => {
    clearMailOutbox();
    const response = await request('/api/auth/forgot-password', {
      method: 'POST',
      body: { identifier: `tidak-ada-${suffix}@test.local` },
    });
    const payload = await response.json();

    assert.equal(response.status, 200);
    assert.equal(payload.success, true);
    assert.match(payload.message, /tautan pemulihan kata sandi telah dikirim/i);
    assert.equal(getMailOutbox().length, 0, 'tidak boleh ada email untuk akun tak dikenal');
  });

  test('permintaan reset mengirim email dan DB hanya menyimpan hash token', async () => {
    const { rawToken, email } = await requestResetToken(username);

    assert.equal(email.to, `${username}@test.local`);
    assert.match(email.subject, /reset kata sandi/i);
    assert.ok(email.text.includes(ENV.FRONTEND_URL), 'tautan memakai FRONTEND_URL');

    const stored = await prisma.passwordResetToken.findUnique({
      where: { token_hash: hashToken(rawToken) },
    });
    assert.ok(stored, 'hash token tersimpan di database');
    assert.equal(stored.user_id, testUser.id);
    assert.equal(stored.used_at, null);
    assert.notEqual(stored.token_hash, rawToken, 'token mentah tidak boleh tersimpan');

    // Audit tidak boleh memuat token mentah.
    const audits = await prisma.auditLog.findMany({
      where: { user_id: testUser.id, action: 'FORGOT_PASSWORD_REQUEST' },
    });
    assert.ok(audits.length >= 1, 'audit FORGOT_PASSWORD_REQUEST tercatat');
    for (const audit of audits) {
      assert.ok(!JSON.stringify(audit).includes(rawToken), 'token mentah tidak boleh ada di audit');
    }
  });

  test('permintaan kedua mencabut token pertama; token lama ditolak', async () => {
    const first = await requestResetToken(username);
    const second = await requestResetToken(username);
    assert.notEqual(first.rawToken, second.rawToken);

    const firstRow = await prisma.passwordResetToken.findUnique({
      where: { token_hash: hashToken(first.rawToken) },
    });
    assert.ok(firstRow.used_at, 'token pertama harus ditandai terpakai/dicabut');

    const rejected = await request('/api/auth/reset-password', {
      method: 'POST',
      body: { token: first.rawToken, new_password: NEW_PASSWORD },
    });
    assert.equal(rejected.status, 400);
  });

  test('GET /reset-password/validate: token valid 200, token asing 400', async () => {
    const { rawToken } = await requestResetToken(username);

    const valid = await request(`/api/auth/reset-password/validate?token=${rawToken}`);
    const validPayload = await valid.json();
    assert.equal(valid.status, 200);
    assert.equal(validPayload.data.valid, true);
    assert.ok(validPayload.data.expires_at);

    const invalid = await request(`/api/auth/reset-password/validate?token=${'f'.repeat(64)}`);
    assert.equal(invalid.status, 400);
  });

  test('R-13: POST /reset-password/validate — token valid 200, invalid/tanpa token 400', async () => {
    const { rawToken } = await requestResetToken(username);

    const valid = await request('/api/auth/reset-password/validate', {
      method: 'POST',
      body: { token: rawToken },
    });
    const validPayload = await valid.json();
    assert.equal(valid.status, 200, validPayload.message);
    assert.equal(validPayload.data.valid, true);
    assert.ok(validPayload.data.expires_at);

    const invalid = await request('/api/auth/reset-password/validate', {
      method: 'POST',
      body: { token: 'f'.repeat(64) },
    });
    assert.equal(invalid.status, 400);

    // Token yang sudah terpakai ditolak (ditandai langsung di database agar
    // kata sandi pengguna uji tidak berubah dan suite lain tetap konsisten).
    await prisma.passwordResetToken.update({
      where: { token_hash: hashToken(rawToken) },
      data: { used_at: new Date() },
    });
    const reuse = await request('/api/auth/reset-password/validate', {
      method: 'POST',
      body: { token: rawToken },
    });
    assert.equal(reuse.status, 400);

    const missing = await request('/api/auth/reset-password/validate', {
      method: 'POST',
      body: {},
    });
    assert.equal(missing.status, 400);
  });

  test('R-14: prune token menghapus token terpakai/kedaluwarsa dan idempoten', async () => {
    const { prunePasswordResetTokens } = await import('../scripts/prune-password-reset-tokens.js');

    // Token aktif yang harus SELAMAT dari pembersihan.
    const { rawToken: freshToken } = await requestResetToken(username);
    const freshHash = hashToken(freshToken);

    // Baris buatan: terpakai dan kedaluwarsa lebih lama dari 7 hari.
    const staleExpired = await prisma.passwordResetToken.create({
      data: {
        user_id: testUser.id,
        token_hash: hashToken(`stale-expired-${suffix}`),
        expires_at: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
      },
    });

    const deleted = await prunePasswordResetTokens();
    assert.ok(deleted >= 2, `minimal dua baris terhapus (terpakai + kedaluwarsa): ${deleted}`);

    const goneExpired = await prisma.passwordResetToken.findUnique({
      where: { token_hash: staleExpired.token_hash },
    });
    assert.equal(goneExpired, null, 'token kedaluwarsa > 7 hari terhapus');

    const keptFresh = await prisma.passwordResetToken.findUnique({
      where: { token_hash: freshHash },
    });
    assert.ok(keptFresh, 'token aktif belum kedaluwarsa tidak terhapus');

    // Idempoten: eksekusi kedua tanpa baris baru mengembalikan 0.
    const deletedAgain = await prunePasswordResetTokens();
    assert.equal(deletedAgain, 0, 'eksekusi ulang tidak menghapus apa pun');
  });

  test('password lemah ditolak dan password lama tetap berlaku', async () => {
    const { rawToken } = await requestResetToken(username);

    const response = await request('/api/auth/reset-password', {
      method: 'POST',
      body: { token: rawToken, new_password: 'abcdefgh1' },
    });
    const payload = await response.json();
    assert.equal(response.status, 400);
    assert.match(payload.message, /password/i);

    // Password lama masih bisa dipakai login.
    const login = await request('/api/auth/login', {
      method: 'POST',
      body: { identifier: username, password: OLD_PASSWORD },
    });
    assert.equal(login.status, 200);
  });

  test('konfirmasi password tidak cocok ditolak', async () => {
    const { rawToken } = await requestResetToken(username);

    const response = await request('/api/auth/reset-password', {
      method: 'POST',
      body: {
        token: rawToken,
        new_password: NEW_PASSWORD,
        confirm_password: `${NEW_PASSWORD}x`,
      },
    });
    assert.equal(response.status, 400);
  });

  test('token kedaluwarsa ditolak', async () => {
    const { rawToken } = await requestResetToken(username);

    // Paksa kedaluwarsa langsung di database.
    await prisma.passwordResetToken.update({
      where: { token_hash: hashToken(rawToken) },
      data: { expires_at: new Date(Date.now() - 60 * 1000) },
    });

    const response = await request('/api/auth/reset-password', {
      method: 'POST',
      body: { token: rawToken, new_password: NEW_PASSWORD },
    });
    const payload = await response.json();
    assert.equal(response.status, 400);
    assert.match(payload.message, /tidak valid atau telah kedaluwarsa/i);
  });

  test('reset sukses: password berganti, refresh token lama dicabut, token tak bisa dipakai ulang', async () => {
    // Login dulu untuk mendapatkan refresh token yang aktif.
    const loginBefore = await request('/api/auth/login', {
      method: 'POST',
      body: { identifier: username, password: OLD_PASSWORD },
    });
    const beforePayload = await loginBefore.json();
    assert.equal(loginBefore.status, 200);
    const oldRefreshToken = beforePayload.data.refreshToken;

    const { rawToken } = await requestResetToken(username);

    const response = await request('/api/auth/reset-password', {
      method: 'POST',
      body: { token: rawToken, new_password: NEW_PASSWORD },
    });
    const payload = await response.json();
    assert.equal(response.status, 200, payload.message);
    assert.match(payload.message, /berhasil diperbarui/i);

    // Password lama ditolak, password baru diterima.
    const loginOld = await request('/api/auth/login', {
      method: 'POST',
      body: { identifier: username, password: OLD_PASSWORD },
    });
    assert.equal(loginOld.status, 401);

    const loginNew = await request('/api/auth/login', {
      method: 'POST',
      body: { identifier: username, password: NEW_PASSWORD },
    });
    assert.equal(loginNew.status, 200);

    // Refresh token lama tidak lagi berlaku.
    const refresh = await request('/api/auth/refresh', {
      method: 'POST',
      body: { refreshToken: oldRefreshToken },
    });
    assert.equal(refresh.status, 401);

    // Token sudah terpakai.
    const used = await prisma.passwordResetToken.findUnique({
      where: { token_hash: hashToken(rawToken) },
    });
    assert.ok(used.used_at, 'token harus ditandai terpakai');

    // Audit RESET_PASSWORD_SELF tercatat.
    const audit = await prisma.auditLog.findFirst({
      where: { user_id: testUser.id, action: 'RESET_PASSWORD_SELF' },
    });
    assert.ok(audit, 'audit RESET_PASSWORD_SELF tercatat');
    assert.ok(!JSON.stringify(audit).includes(NEW_PASSWORD), 'password baru tidak boleh ada di audit');
  });

  test('token dipakai ulang ditolak', async () => {
    const { rawToken } = await requestResetToken(username);

    const first = await request('/api/auth/reset-password', {
      method: 'POST',
      body: { token: rawToken, new_password: `${NEW_PASSWORD}2` },
    });
    assert.equal(first.status, 200);

    const second = await request('/api/auth/reset-password', {
      method: 'POST',
      body: { token: rawToken, new_password: `${NEW_PASSWORD}3` },
    });
    const payload = await second.json();
    assert.equal(second.status, 400);
    assert.match(payload.message, /tidak valid atau telah kedaluwarsa/i);
  });

  test('konfigurasi TTL terbaca pada rentang sah', () => {
    assert.ok(
      PASSWORD_RESET_TTL_MINUTES >= 5 && PASSWORD_RESET_TTL_MINUTES <= 120,
      'TTL harus berada pada rentang 5–120 menit'
    );
  });
});
