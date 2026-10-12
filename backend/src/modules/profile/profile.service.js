import fs from 'fs';
import path from 'path';
import prisma from '../../config/prisma.js';
import { STORAGE } from '../../config/env.js';
import { generateStorageName, validateAvatar } from '../../utils/storage.js';
import { AppError } from '../../utils/errors.js';
import { AuditLogService } from '../audit-log/audit-log.service.js';
import { AuthService } from '../auth/auth.service.js';

/**
 * Layanan Profil SPADA LMS (FR-005 s/d FR-008)
 *
 * Menggunakan model Profile tunggal (full_name, phone, bio, avatar_file_id),
 * serta menyertakan identitas peran (Mahasiswa: NIM, prodi, angkatan; Dosen: NIDN, NIP, gelar).
 */
export class ProfileService {
  /**
   * Mengambil data profil lengkap milik pengguna yang sedang terautentikasi (FR-005)
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
        profile: {
          include: {
            avatar_file: {
              select: {
                id: true,
                original_name: true,
                storage_name: true,
                file_path: true,
                mime_type: true,
                size_bytes: true,
                created_at: true,
              },
            },
          },
        },
        mahasiswa: {
          select: {
            id: true,
            nim: true,
            prodi: true,
            angkatan: true,
          },
        },
        dosen: {
          select: {
            id: true,
            nidn: true,
            nip: true,
            gelar_depan: true,
            gelar_belakang: true,
          },
        },
      },
    });

    if (!user) {
      throw new AppError('Profil pengguna tidak ditemukan', 404);
    }

    return user;
  }

  /**
   * Memperbarui profil mandiri (email, full_name, phone, bio) — FR-006
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

  /**
   * Mengunggah atau memperbarui foto profil avatar (FR-007)
   */
  static async uploadAvatar(userId, file, { ipAddress, userAgent } = {}) {
    if (!file) {
      throw new AppError('Berkas foto profil (avatar) wajib diunggah', 400);
    }

    const validation = validateAvatar({
      originalname: file.originalname,
      size: file.size,
    });
    if (!validation.valid) {
      throw new AppError(validation.error, 400);
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: {
          include: {
            avatar_file: true,
          },
        },
      },
    });

    if (!user) {
      throw new AppError('Pengguna tidak ditemukan', 404);
    }

    // Pastikan direktori avatar ada di penyimpanan privat
    await fs.promises.mkdir(STORAGE.AVATAR_DIR, { recursive: true });

    const storageName = generateStorageName(file.originalname);
    const destinationPath = path.resolve(STORAGE.AVATAR_DIR, storageName);
    const relativeFilePath = path.join('avatars', storageName);

    // Tulis buffer ke berkas privat
    await fs.promises.writeFile(destinationPath, file.buffer);

    const oldAvatarFile = user.profile?.avatar_file;

    // Simpan metadata File dan hubungkan ke Profile
    const newFile = await prisma.file.create({
      data: {
        original_name: file.originalname,
        storage_name: storageName,
        file_path: relativeFilePath,
        mime_type: file.mimetype,
        size_bytes: file.size,
        uploaded_by: userId,
      },
    });

    await prisma.profile.upsert({
      where: { user_id: userId },
      update: {
        avatar_file_id: newFile.id,
      },
      create: {
        user_id: userId,
        avatar_file_id: newFile.id,
      },
    });

    // Jika ada avatar lama, hapus berkas fisik dan record lamanya
    if (oldAvatarFile) {
      try {
        const oldPhysicalPath = path.resolve(STORAGE.AVATAR_DIR, oldAvatarFile.storage_name);
        if (fs.existsSync(oldPhysicalPath)) {
          await fs.promises.unlink(oldPhysicalPath);
        }
        await prisma.file.delete({
          where: { id: oldAvatarFile.id },
        });
      } catch (cleanupErr) {
        console.warn('[Avatar Cleanup Warning]: Gagal membersihkan avatar lama:', cleanupErr.message);
      }
    }

    // Catat jejak audit
    await AuditLogService.record({
      userId,
      action: 'UPDATE_AVATAR',
      entity: 'users',
      entityId: userId,
      ipAddress,
      userAgent,
      newValues: {
        avatar_file_id: newFile.id,
        original_name: file.originalname,
        size_bytes: file.size,
      },
    });

    return await this.getProfile(userId);
  }

  /**
   * Mengambil data berkas avatar pengguna untuk di-stream ke respons
   */
  static async getAvatar(userId) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: {
          include: {
            avatar_file: true,
          },
        },
      },
    });

    if (!user || !user.profile?.avatar_file) {
      throw new AppError('Foto profil belum diunggah', 404);
    }

    const avatarFile = user.profile.avatar_file;
    const absolutePath = path.resolve(STORAGE.AVATAR_DIR, avatarFile.storage_name);

    if (!fs.existsSync(absolutePath)) {
      throw new AppError('Berkas fisik foto profil tidak ditemukan pada server', 404);
    }

    return {
      filePath: absolutePath,
      mimeType: avatarFile.mime_type,
      originalName: avatarFile.original_name,
    };
  }

  /**
   * Mengganti kata sandi mandiri (FR-008)
   */
  static async changePassword({ userId, oldPassword, newPassword, ipAddress, userAgent }) {
    return await AuthService.changePassword({
      userId,
      oldPassword,
      newPassword,
      ipAddress,
      userAgent,
    });
  }
}
