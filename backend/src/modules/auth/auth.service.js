import crypto from 'node:crypto';
import prisma from '../../config/prisma.js';
import { ENV, PASSWORD_RESET_TTL_MINUTES } from '../../config/env.js';
import {
  hashPassword,
  comparePassword,
  validatePasswordComplexity,
} from '../../utils/password.js';
import { sendMail } from '../../utils/mailer.js';
import { buildPasswordResetEmail } from '../../utils/emailTemplates.js';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  hashToken,
  getRefreshTokenExpiryDate,
} from '../../utils/token.js';
import { AppError } from '../../utils/errors.js';
import { AuditLogService } from '../audit-log/audit-log.service.js';

/** Pesan aman anti-enumerasi untuk alur lupa kata sandi (FR-003). */
const FORGOT_PASSWORD_GENERIC_MESSAGE =
  'Jika akun terdaftar pada sistem kami, tautan pemulihan kata sandi telah dikirimkan ke alamat email terkait.';

/** Pesan baku ketika token reset tidak valid, kedaluwarsa, atau telah dipakai. */
const RESET_TOKEN_INVALID_MESSAGE =
  'Tautan reset kata sandi tidak valid atau telah kedaluwarsa.';

export class AuthService {
  /**
   * Autentikasi Pengguna (Login — FR-001)
   * Mendukung multi-kredensial: username, email, NIM (mahasiswa), NIDN/NIP (dosen)
   */
  static async login({ identifier, password, ipAddress, userAgent }) {
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { username: identifier },
          { email: identifier },
          { mahasiswa: { nim: identifier } },
          { dosen: { OR: [{ nidn: identifier }, { nip: identifier }] } },
        ],
      },
      include: {
        profile: {
          include: {
            avatar_file: true,
          },
        },
        mahasiswa: true,
        dosen: true,
      },
    });

    if (!user) {
      throw new AppError('Kredensial tidak valid: username/email/NIM/NIDN atau password salah', 401);
    }

    if (user.status !== 'ACTIVE') {
      const statusLabel =
        user.status === 'INACTIVE'
          ? 'tidak aktif'
          : user.status === 'SUSPENDED'
          ? 'ditangguhkan'
          : user.status.toLowerCase();
      throw new AppError(
        `Akses login ditolak: Akun Anda sedang berstatus ${statusLabel} (${user.status}). Silakan hubungi administrator.`,
        403
      );
    }

    const isMatch = await comparePassword(password, user.password_hash);
    if (!isMatch) {
      throw new AppError('Kredensial tidak valid: username/email atau password salah', 401);
    }

    // Update last_login_at
    await prisma.user.update({
      where: { id: user.id },
      data: { last_login_at: new Date() },
    });

    // Bentuk Token — role langsung dari enum
    const tokenPayload = {
      sub: user.id,
      userId: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
    };

    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken({ sub: user.id, userId: user.id });

    // Simpan hashed refresh token ke database
    const tokenHash = hashToken(refreshToken);
    const expiresAt = getRefreshTokenExpiryDate();

    await prisma.refreshToken.create({
      data: {
        user_id: user.id,
        token_hash: tokenHash,
        expires_at: expiresAt,
      },
    });

    // Catat jejak login di AuditLog (SRS Bab 35)
    await AuditLogService.record({
      userId: user.id,
      action: 'LOGIN',
      entity: 'users',
      entityId: user.id,
      ipAddress,
      userAgent,
      newValues: {
        username: user.username,
        role: user.role,
        timestamp: new Date().toISOString(),
      },
    });

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        status: user.status,
        role: user.role,
        profile: user.profile || null,
        mahasiswa: user.mahasiswa || null,
        dosen: user.dosen || null,
      },
    };
  }

  /**
   * Perbarui Access Token menggunakan Refresh Token
   */
  static async refresh({ refreshTokenString }) {
    let decoded;
    try {
      decoded = verifyRefreshToken(refreshTokenString);
    } catch {
      throw new AppError('Refresh token tidak valid atau telah kedaluwarsa', 401);
    }

    const tokenHash = hashToken(refreshTokenString);
    const savedToken = await prisma.refreshToken.findUnique({
      where: { token_hash: tokenHash },
      include: {
        user: true,
      },
    });

    if (!savedToken || savedToken.revoked_at !== null || savedToken.expires_at < new Date()) {
      throw new AppError('Refresh token tidak valid atau telah dicabut', 401);
    }

    const user = savedToken.user;
    if (!user || user.status !== 'ACTIVE') {
      throw new AppError('Akun pengguna tidak aktif atau tidak ditemukan', 403);
    }

    const accessToken = generateAccessToken({
      sub: user.id,
      userId: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
    });

    return {
      accessToken,
    };
  }

  /**
   * Logout Pengguna
   */
  static async logout({ refreshTokenString, userId, ipAddress, userAgent }) {
    if (refreshTokenString) {
      const tokenHash = hashToken(refreshTokenString);
      await prisma.refreshToken.updateMany({
        where: { token_hash: tokenHash, revoked_at: null },
        data: { revoked_at: new Date() },
      });
    }

    if (userId) {
      await AuditLogService.record({
        userId,
        action: 'LOGOUT',
        entity: 'users',
        entityId: userId,
        ipAddress,
        userAgent,
      });
    }

    return {
      message: 'Sesi berhasil diakhiri (logout berhasil)',
    };
  }

  /**
   * Ganti Kata Sandi Mandiri (FR-016)
   */
  static async changePassword({ userId, oldPassword, newPassword, ipAddress, userAgent }) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new AppError('Pengguna tidak ditemukan', 404);
    }

    const isMatch = await comparePassword(oldPassword, user.password_hash);
    if (!isMatch) {
      throw new AppError('Kata sandi lama tidak sesuai', 400);
    }

    const isSameAsOld = await comparePassword(newPassword, user.password_hash);
    if (isSameAsOld) {
      throw new AppError('Kata sandi baru tidak boleh sama dengan kata sandi lama', 400);
    }

    const newPasswordHash = await hashPassword(newPassword);

    await prisma.user.update({
      where: { id: userId },
      data: { password_hash: newPasswordHash },
    });

    // Cabut seluruh refresh token aktif untuk alasan keamanan
    await prisma.refreshToken.updateMany({
      where: { user_id: userId, revoked_at: null },
      data: { revoked_at: new Date() },
    });

    // Catat jejak audit
    await AuditLogService.record({
      userId,
      action: 'CHANGE_PASSWORD',
      entity: 'users',
      entityId: userId,
      ipAddress,
      userAgent,
    });

    return {
      message: 'Kata sandi berhasil diperbarui. Silakan login kembali dengan kata sandi baru.',
    };
  }

  /**
   * Lupa Kata Sandi (FR-003) — terbitkan token reset & kirim email.
   *
   * Anti-enumerasi: respons selalu generik, baik akun ada maupun tidak.
   * Kegagalan pengiriman email tidak mengubah respons (tetap 200) agar
   * keberadaan akun tidak dapat ditebak dari perbedaan perilaku.
   */
  static async forgotPassword({ identifier, ipAddress, userAgent }) {
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { username: identifier },
          { email: identifier },
          { mahasiswa: { nim: identifier } },
          { dosen: { OR: [{ nidn: identifier }, { nip: identifier }] } },
        ],
      },
      include: {
        profile: { select: { full_name: true } },
      },
    });

    if (user) {
      // Cabut seluruh token reset lama yang masih berlaku (sekali aktif per user).
      await prisma.passwordResetToken.updateMany({
        where: { user_id: user.id, used_at: null },
        data: { used_at: new Date() },
      });

      const rawToken = crypto.randomBytes(32).toString('hex');
      const tokenHash = hashToken(rawToken);
      const expiresAt = new Date(Date.now() + PASSWORD_RESET_TTL_MINUTES * 60 * 1000);

      await prisma.passwordResetToken.create({
        data: {
          user_id: user.id,
          token_hash: tokenHash,
          expires_at: expiresAt,
        },
      });

      const resetUrl = `${ENV.FRONTEND_URL}/reset-password?token=${rawToken}`;
      const email = buildPasswordResetEmail({
        recipientName: user.profile?.full_name,
        resetUrl,
        expiresAt,
      });

      try {
        await sendMail({ to: user.email, ...email });
      } catch (error) {
        // Jangan gagalkan request dan jangan bocorkan status akun.
        console.error('[AuthService] Gagal mengirim email reset kata sandi:', error.message);
      }

      // Catat jejak audit TANPA token mentah (hanya metadata permintaan).
      await AuditLogService.record({
        userId: user.id,
        action: 'FORGOT_PASSWORD_REQUEST',
        entity: 'users',
        entityId: user.id,
        ipAddress,
        userAgent,
        newValues: { identifier },
      });
    }

    // Mengembalikan pesan aman tanpa mengungkap eksistensi akun
    return {
      message: FORGOT_PASSWORD_GENERIC_MESSAGE,
    };
  }

  /**
   * Verifikasi token reset kata sandi (precheck frontend, FR-003).
   *
   * @returns {Promise<{valid: boolean, expires_at: string}>}
   */
  static async validateResetToken({ token }) {
    const resetToken = await this.#findActiveResetToken(token);
    return {
      valid: true,
      expires_at: resetToken.expires_at.toISOString(),
    };
  }

  /**
   * Reset kata sandi menggunakan token dari email (FR-003).
   *
   * Sekali pakai: token ditandai `used_at` dalam transaksi yang sama dengan
   * pembaruan kata sandi, lalu seluruh refresh token aktif dicabut agar
   * sesi lama tidak bertahan.
   */
  static async resetPassword({ token, newPassword, ipAddress, userAgent }) {
    const resetToken = await this.#findActiveResetToken(token);
    const user = resetToken.user;

    const validation = validatePasswordComplexity(newPassword);
    if (!validation.isValid) {
      throw new AppError(validation.message, 400);
    }

    const isSameAsOld = await comparePassword(newPassword, user.password_hash);
    if (isSameAsOld) {
      throw new AppError('Kata sandi baru tidak boleh sama dengan kata sandi lama', 400);
    }

    const newPasswordHash = await hashPassword(newPassword);

    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: user.id },
        data: { password_hash: newPasswordHash },
      });

      await tx.passwordResetToken.update({
        where: { id: resetToken.id },
        data: { used_at: new Date() },
      });

      // Cabut seluruh refresh token aktif untuk memaksa re-login.
      await tx.refreshToken.updateMany({
        where: { user_id: user.id, revoked_at: null },
        data: { revoked_at: new Date() },
      });
    });

    // Catat jejak audit tanpa nilai sensitif (token/password tidak disimpan).
    await AuditLogService.record({
      userId: user.id,
      action: 'RESET_PASSWORD_SELF',
      entity: 'users',
      entityId: user.id,
      ipAddress,
      userAgent,
      newValues: { password_reset: true, via: 'email_token' },
    });

    return {
      message: 'Kata sandi berhasil diperbarui. Silakan login kembali dengan kata sandi baru.',
    };
  }

  /**
   * Cari token reset yang masih aktif (belum dipakai & belum kedaluwarsa).
   *
   * @param {string} token token mentah dari tautan email
   * @returns {Promise<object>} baris `PasswordResetToken` beserta `user`
   * @throws {AppError} 400 bila token tidak valid/kedaluwarsa/terpakai
   */
  static async #findActiveResetToken(token) {
    if (!token || typeof token !== 'string') {
      throw new AppError(RESET_TOKEN_INVALID_MESSAGE, 400);
    }

    const tokenHash = hashToken(token.trim());
    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token_hash: tokenHash },
      include: { user: true },
    });

    if (!resetToken || resetToken.used_at !== null || resetToken.expires_at < new Date()) {
      throw new AppError(RESET_TOKEN_INVALID_MESSAGE, 400);
    }

    return resetToken;
  }
}
