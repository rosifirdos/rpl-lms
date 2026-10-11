import prisma from '../../config/prisma.js';
import { AppError } from '../../utils/errors.js';
import { AuditLogService } from '../audit-log/audit-log.service.js';

/**
 * Layanan Profil SPADA LMS (FR-011 s/d FR-013)
 *
 * Revised: menggunakan model Profile tunggal (full_name, phone, bio, avatar_file_id).
 */
export class ProfileService {
  /**
   * Mengambil data profil lengkap milik pengguna yang sedang terautentikasi
   */
  static async getProfile(userId) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        email: true,
        status: true,
        role: true,
        last_login_at: true,
        created_at: true,
        updated_at: true,
        profile: true,
      },
    });

    if (!user) {
      throw new AppError('Profil pengguna tidak ditemukan', 404);
    }

    return user;
  }

  /**
   * Memperbarui profil mandiri (email, full_name, phone, bio)
   */
  static async updateProfile(userId, updateData, { ipAddress, userAgent } = {}) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true },
    });

    if (!user) {
      throw new AppError('Pengguna tidak ditemukan', 404);
    }

    const oldValues = {};
    const newValues = {};

    // 1. Update Email jika diberikan
    if (updateData.email && updateData.email !== user.email) {
      const existingEmail = await prisma.user.findFirst({
        where: {
          email: updateData.email,
          NOT: { id: userId },
        },
      });
      if (existingEmail) {
        throw new AppError('Email tersebut sudah digunakan oleh akun lain', 409);
      }
      oldValues.email = user.email;
      newValues.email = updateData.email;
      await prisma.user.update({
        where: { id: userId },
        data: { email: updateData.email },
      });
    }

    // 2. Update Profile fields (full_name, phone, bio)
    const profileData = {};
    const profileFields = ['full_name', 'phone', 'bio'];

    for (const field of profileFields) {
      if (updateData[field] !== undefined && updateData[field] !== (user.profile?.[field] ?? null)) {
        oldValues[field] = user.profile?.[field] ?? null;
        newValues[field] = updateData[field];
        profileData[field] = updateData[field];
      }
    }

    if (Object.keys(profileData).length > 0) {
      await prisma.profile.upsert({
        where: { user_id: userId },
        update: profileData,
        create: {
          user_id: userId,
          ...profileData,
        },
      });
    }

    // Catat mutasi pada AuditLog jika ada data yang berubah
    if (Object.keys(newValues).length > 0) {
      await AuditLogService.record({
        userId,
        action: 'UPDATE_PROFILE',
        entity: 'users',
        entityId: userId,
        oldValues,
        newValues,
        ipAddress,
        userAgent,
      });
    }

    return await this.getProfile(userId);
  }
}
