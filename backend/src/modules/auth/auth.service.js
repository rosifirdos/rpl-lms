import prisma from '../../config/prisma.js';
import { hashPassword, comparePassword } from '../../utils/password.js';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  hashToken,
  getRefreshTokenExpiryDate,
} from '../../utils/token.js';
import { AppError } from '../../utils/errors.js';
import { AuditLogService } from '../audit-log/audit-log.service.js';

export class AuthService {
  /**
   * Autentikasi Pengguna (Login)
   */
  static async login({ identifier, password, ipAddress, userAgent }) {
    const user = await prisma.user.findFirst({
      where: {
        OR: [{ username: identifier }, { email: identifier }],
      },
      include: {
        user_roles: {
          include: {
            role: {
              include: {
                role_permissions: {
                  include: {
                    permission: true,
                  },
                },
              },
            },
          },
        },
        mahasiswa_profile: {
          include: {
            prodi: { select: { id: true, kode: true, nama: true, jenjang: true } },
          },
        },
        dosen_profile: {
          include: {
            prodi: { select: { id: true, kode: true, nama: true, jenjang: true } },
          },
        },
        admin_profile: true,
        calon_mhs_profile: {
          include: {
            prodi: { select: { id: true, kode: true, nama: true, jenjang: true } },
          },
        },
      },
    });

    if (!user) {
      throw new AppError('Kredensial tidak valid: username/email atau password salah', 401);
    }

    if (user.status !== 'ACTIVE') {
      const statusLabel =
        user.status === 'INACTIVE'
          ? 'tidak aktif'
          : user.status === 'SUSPENDED'
          ? 'ditangguhkan'
          : user.status.toLowerCase();
      throw new AppError(
        `Akses login ditolak: Akun Anda sedang berstatus ${statusLabel} (${user.status}). Silakan hubungi administrator kampus.`,
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

    // Ekstrak roles & permissions
    const roles = user.user_roles.map((ur) => ur.role.name);
    const permissionSet = new Set();
    user.user_roles.forEach((ur) => {
      ur.role.role_permissions.forEach((rp) => {
        if (rp.permission?.code) {
          permissionSet.add(rp.permission.code);
        }
      });
    });
    const permissions = Array.from(permissionSet);

    // Bentuk Token
    const tokenPayload = {
      sub: user.id,
      userId: user.id,
      username: user.username,
      email: user.email,
      roles,
      permissions,
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
        roles,
        timestamp: new Date().toISOString(),
      },
    });

    // Tentukan profil aktif
    let activeProfile = null;
    if (user.mahasiswa_profile) {
      activeProfile = { type: 'MAHASISWA', ...user.mahasiswa_profile };
    } else if (user.dosen_profile) {
      activeProfile = { type: 'DOSEN', ...user.dosen_profile };
    } else if (user.admin_profile) {
      activeProfile = { type: 'ADMIN', ...user.admin_profile };
    } else if (user.calon_mhs_profile) {
      activeProfile = { type: 'CALON_MAHASISWA', ...user.calon_mhs_profile };
    }

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        status: user.status,
        roles,
        permissions,
        profile: activeProfile,
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
        user: {
          include: {
            user_roles: {
              include: {
                role: {
                  include: {
                    role_permissions: {
                      include: {
                        permission: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!savedToken || savedToken.revoked_at !== null || savedToken.expires_at < new Date()) {
      throw new AppError('Refresh token tidak valid atau telah dicabut', 401);
    }

    const user = savedToken.user;
    if (!user || user.status !== 'ACTIVE') {
      throw new AppError('Akun pengguna tidak aktif atau tidak ditemukan', 403);
    }

    const roles = user.user_roles.map((ur) => ur.role.name);
    const permissionSet = new Set();
    user.user_roles.forEach((ur) => {
      ur.role.role_permissions.forEach((rp) => {
        if (rp.permission?.code) {
          permissionSet.add(rp.permission.code);
        }
      });
    });
    const permissions = Array.from(permissionSet);

    const accessToken = generateAccessToken({
      sub: user.id,
      userId: user.id,
      username: user.username,
      email: user.email,
      roles,
      permissions,
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
   * Lupa Kata Sandi (FR-015)
   */
  static async forgotPassword({ identifier, ipAddress, userAgent }) {
    const user = await prisma.user.findFirst({
      where: {
        OR: [{ username: identifier }, { email: identifier }],
      },
    });

    if (user) {
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
      message:
        'Jika akun terdaftar pada sistem kami, tautan verifikasi pemulihan kata sandi telah dikirimkan ke alamat email terkait.',
    };
  }
}
