import prisma from '../../config/prisma.js';
import { AppError } from '../../utils/errors.js';
import { hashPassword, validatePasswordComplexity } from '../../utils/password.js';
import { AuditLogService } from '../audit-log/audit-log.service.js';
import { ROLES } from '../../constants/roles.js';

/**
 * Layanan Manajemen Pengguna SPADA LMS (FR-044 s/d FR-048)
 *
 * Revised: role adalah enum tunggal pada User (ADMIN/DOSEN/MAHASISWA).
 */
export class UsersService {
  /**
   * Pembuatan akun pengguna baru (Admin only)
   */
  static async createUser({ adminId, userData, ipAddress, userAgent }) {
    const {
      username,
      email,
      password,
      status = 'ACTIVE',
      role,
      full_name,
      nim,
      prodi,
      angkatan,
      nidn,
      nip,
      gelar_depan,
      gelar_belakang,
    } = userData;

    // Validasi role
    if (!Object.values(ROLES).includes(role)) {
      throw new AppError(
        `Role tidak valid. Gunakan salah satu: ${Object.values(ROLES).join(', ')}`,
        400
      );
    }

    // Validasi keunikan username & email
    const existingByUsername = await prisma.user.findUnique({ where: { username } });
    if (existingByUsername) {
      throw new AppError('Username sudah digunakan oleh akun lain', 409);
    }
    const existingByEmail = await prisma.user.findUnique({ where: { email } });
    if (existingByEmail) {
      throw new AppError('Email sudah terdaftar pada sistem', 409);
    }

    // Hash password
    const password_hash = await hashPassword(password);

    // Buat user + profile dalam transaksi
    const createdUser = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          username,
          email,
          password_hash,
          status,
          role,
          profile: full_name ? { create: { full_name } } : undefined,
          mahasiswa: role === ROLES.MAHASISWA
            ? { create: { nim, prodi, angkatan } }
            : undefined,
          dosen: role === ROLES.DOSEN
            ? {
                create: {
                  nidn: nidn || null,
                  nip: nip || null,
                  gelar_depan: gelar_depan || null,
                  gelar_belakang: gelar_belakang || null,
                },
              }
            : undefined,
        },
      });

      return tx.user.findUnique({
        where: { id: newUser.id },
        select: {
          id: true,
          username: true,
          email: true,
          status: true,
          role: true,
          created_at: true,
          profile: true,
          mahasiswa: true,
          dosen: true,
        },
      });
    });

    if (!createdUser) {
      throw new AppError('Pengguna baru saja dibuat namun gagal diambil ulang', 500);
    }

    // Catat jejak audit pembuatan akun (SRS Bab 35, FR-044)
    await AuditLogService.logUserCreation({
      adminId,
      newUser: createdUser,
      ipAddress,
      userAgent,
    });

    return createdUser;
  }

  /**
   * Ubah Status Pengguna (ACTIVE, INACTIVE, SUSPENDED)
   */
  static async updateStatus({ adminId, targetUserId, newStatus, reason, ipAddress, userAgent }) {
    if (targetUserId === adminId) {
      throw new AppError('Tidak diizinkan mengubah status akun sendiri', 400);
    }

    const user = await prisma.user.findUnique({ where: { id: targetUserId } });
    if (!user) {
      throw new AppError('Pengguna tidak ditemukan', 404);
    }

    const oldStatus = user.status;

    const updatedUser = await prisma.user.update({
      where: { id: targetUserId },
      data: { status: newStatus },
      select: {
        id: true,
        username: true,
        email: true,
        status: true,
        role: true,
      },
    });

    // Cabut refresh token jika di-nonaktifkan/suspend
    if (newStatus !== 'ACTIVE') {
      await prisma.refreshToken.updateMany({
        where: { user_id: targetUserId, revoked_at: null },
        data: { revoked_at: new Date() },
      });
    }

    await AuditLogService.logStatusChange({
      adminId,
      targetUserId,
      oldStatus,
      newStatus,
      reason,
      ipAddress,
      userAgent,
    });

    return {
      user: updatedUser,
      oldStatus,
      newStatus,
      reason,
    };
  }

  /**
   * Update data pengguna (termasuk role) — Admin only
   */
  static async updateUser({ adminId, targetUserId, updateData, ipAddress, userAgent }) {
    if (targetUserId === adminId && updateData.role) {
      throw new AppError('Tidak diizinkan mengubah role akun sendiri', 400);
    }

    const user = await prisma.user.findUnique({ where: { id: targetUserId } });
    if (!user) {
      throw new AppError('Pengguna tidak ditemukan', 404);
    }

    const oldValues = {};
    const newValues = {};
    const data = {};

    if (updateData.role && updateData.role !== user.role) {
      if (!Object.values(ROLES).includes(updateData.role)) {
        throw new AppError(
          `Role tidak valid. Gunakan salah satu: ${Object.values(ROLES).join(', ')}`,
          400
        );
      }
      oldValues.role = user.role;
      newValues.role = updateData.role;
      data.role = updateData.role;
    }

    if (updateData.email && updateData.email !== user.email) {
      const existingEmail = await prisma.user.findFirst({
        where: { email: updateData.email, NOT: { id: targetUserId } },
      });
      if (existingEmail) {
        throw new AppError('Email sudah digunakan oleh akun lain', 409);
      }
      oldValues.email = user.email;
      newValues.email = updateData.email;
      data.email = updateData.email;
    }

    if (Object.keys(data).length === 0) {
      throw new AppError('Tidak ada data yang perlu diperbarui', 400);
    }

    const updatedUser = await prisma.user.update({
      where: { id: targetUserId },
      data,
      select: {
        id: true,
        username: true,
        email: true,
        status: true,
        role: true,
      },
    });

    await AuditLogService.logUserUpdate({
      adminId,
      targetUserId,
      oldValues,
      newValues,
      ipAddress,
      userAgent,
    });

    return updatedUser;
  }

  /**
   * Daftar Pengguna dengan paginasi dan filter
   */
  static async getUsers({ page = 1, limit = 20, role, status, search } = {}) {
    const currentPage = Math.max(1, parseInt(page, 10) || 1);
    const take = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
    const skip = (currentPage - 1) * take;

    const where = {};

    if (status) {
      where.status = status;
    }

    if (role) {
      where.role = role;
    }

    if (search) {
      where.OR = [
        { username: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { profile: { full_name: { contains: search, mode: 'insensitive' } } },
        { mahasiswa: { nim: { contains: search, mode: 'insensitive' } } },
        { dosen: { nidn: { contains: search, mode: 'insensitive' } } },
        { dosen: { nip: { contains: search, mode: 'insensitive' } } },
      ];
    }

    const [total, users] = await Promise.all([
      prisma.user.count({ where }),
      prisma.user.findMany({
        where,
        skip,
        take,
        orderBy: { created_at: 'desc' },
        select: {
          id: true,
          username: true,
          email: true,
          status: true,
          role: true,
          created_at: true,
          profile: {
            select: { full_name: true },
          },
          mahasiswa: {
            select: { nim: true, prodi: true, angkatan: true },
          },
          dosen: {
            select: { nidn: true, nip: true, gelar_depan: true, gelar_belakang: true },
          },
        },
      }),
    ]);

    const totalPages = Math.ceil(total / take);

    return {
      items: users.map((u) => ({
        id: u.id,
        username: u.username,
        email: u.email,
        status: u.status,
        role: u.role,
        full_name: u.profile?.full_name || null,
        mahasiswa: u.mahasiswa,
        dosen: u.dosen,
        createdAt: u.created_at,
      })),
      meta: {
        page: currentPage,
        limit: take,
        total,
        totalPages,
      },
    };
  }

  /**
   * Detail Pengguna berdasarkan ID
   */
  static async getUserById(id) {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        username: true,
        email: true,
        status: true,
        role: true,
        last_login_at: true,
        created_at: true,
        profile: true,
        mahasiswa: true,
        dosen: true,
      },
    });

    if (!user) {
      throw new AppError('Pengguna tidak ditemukan', 404);
    }

    return user;
  }

  /**
   * Reset kata sandi akun pengguna oleh Admin (FR-044, SRS Bab 35)
   * Mencakup validasi kompleksitas password dan pencabutan token aktif
   */
  static async resetPassword({ adminId, targetUserId, newPassword, ipAddress, userAgent }) {
    if (targetUserId === adminId) {
      throw new AppError('Gunakan endpoint profil mandiri untuk mengganti kata sandi sendiri', 400);
    }

    const user = await prisma.user.findUnique({ where: { id: targetUserId } });
    if (!user) {
      throw new AppError('Pengguna tidak ditemukan', 404);
    }

    // Validasi kompleksitas password
    const validation = validatePasswordComplexity(newPassword);
    if (!validation.isValid) {
      throw new AppError(validation.message, 400);
    }

    // Hash password baru
    const password_hash = await hashPassword(newPassword);

    // Eksekusi transaksi atomik: update password + cabut token
    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: targetUserId },
        data: { password_hash },
      });

      // Cabut seluruh refresh token pengguna untuk memaksa re-login
      await tx.refreshToken.updateMany({
        where: { user_id: targetUserId, revoked_at: null },
        data: { revoked_at: new Date() },
      });
    });

    // Catat ke AuditLog
    await AuditLogService.record({
      userId: adminId,
      action: 'RESET_PASSWORD',
      entity: 'users',
      entityId: targetUserId,
      newValues: { password_reset: true, reset_by_admin: true },
      ipAddress,
      userAgent,
    });

    return {
      userId: targetUserId,
      username: user.username,
      message: 'Password berhasil direset. Semua sesi aktif telah dicabut.',
    };
  }
}
