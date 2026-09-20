import prisma from '../../config/prisma.js';
import { AppError } from '../../utils/errors.js';

import { AuditLogService } from '../audit-log/audit-log.service.js';

/**
- Layanan Manajemen Pengguna & Roles (IPM 4.6 & SRS Bab 31 & Bab 35)
-*/
export class UsersService {
  /**
   * Ubah Role Pengguna (mencatat ke audit_logs)
   */
  static async updateRoles({ adminId, targetUserId, newRoles, ipAddress, userAgent }) {
    const user = await prisma.user.findUnique({
      where: { id: targetUserId },
      include: {
        user_roles: {
          include: {
            role: true,
          },
        },
      },
    });

    if (!user) {
      throw new AppError('Pengguna tidak ditemukan', 404);
    }

    const oldRoles = user.user_roles.map((ur) => ur.role.name);

    // Cari data role dari database
    const roleRecords = await prisma.role.findMany({
      where: {
        name: { in: newRoles },
      },
    });

    if (roleRecords.length !== newRoles.length) {
      throw new AppError('Salah satu atau lebih role yang diminta tidak ditemukan di sistem', 400);
    }

    // Transaksi untuk mengganti role pengguna
    await prisma.$transaction(async (tx) => {
      await tx.userRole.deleteMany({
        where: { user_id: targetUserId },
      });

      await tx.userRole.createMany({
        data: roleRecords.map((role) => ({
          user_id: targetUserId,
          role_id: role.id,
        })),
      });
    });

    // Catat jejak audit perubahan role pengguna (SRS Chapter 35)
    await AuditLogService.logRoleChange({
      adminId,
      targetUserId,
      oldRoles,
      newRoles,
      ipAddress,
      userAgent,
    });

    return {
      userId: targetUserId,
      username: user.username,
      oldRoles,
      newRoles,
    };
  }

  /**
   * Ubah Status Pengguna (ACTIVE, INACTIVE, SUSPENDED)
   */
  static async updateStatus({ adminId, targetUserId, newStatus, reason, ipAddress, userAgent }) {
    const user = await prisma.user.findUnique({
      where: { id: targetUserId },
    });

    if (!user) {
      throw new AppError('Pengguna tidak ditemukan', 404);
    }

    const oldStatus = user.status;

    // Update status di database
    const updatedUser = await prisma.user.update({
      where: { id: targetUserId },
      data: {
        status: newStatus,
      },
      select: {
        id: true,
        username: true,
        email: true,
        status: true,
      },
    });

    // Jika status diubah menjadi INACTIVE atau SUSPENDED,
    // cabut semua refresh token pengguna untuk memutus sesi aktif (security)
    if (newStatus !== 'ACTIVE') {
      await prisma.refreshToken.updateMany({
        where: { user_id: targetUserId, revoked: false },
        data: { revoked: true },
      });
    }

    // Catat jejak audit perubahan status pengguna (SRS Chapter 35)
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
      where.user_roles = {
        some: {
          role: { name: role },
        },
      };
    }

    if (search) {
      where.OR = [
        { username: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
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
          created_at: true,
          user_roles: {
            select: {
              role: { select: { id: true, name: true, description: true } },
            },
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
        createdAt: u.created_at,
        roles: u.user_roles.map((ur) => ur.role.name),
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
      include: {
        user_roles: {
          include: {
            role: true,
          },
        },
        mahasiswa_profile: true,
        dosen_profile: true,
        admin_profile: true,
        calon_mhs_profile: true,
      },
    });

    if (!user) {
      throw new AppError('Pengguna tidak ditemukan', 404);
    }

    return user;
  }
}
