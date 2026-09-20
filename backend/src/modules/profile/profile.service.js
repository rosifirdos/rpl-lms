import prisma from '../../config/prisma.js';
import { AppError } from '../../utils/errors.js';
import { AuditLogService } from '../audit-log/audit-log.service.js';

export class ProfileService {
  /**
   * Mengambil data profil lengkap milik pengguna yang sedang terautentikasi
   * @param {string} userId
   */
  static async getProfile(userId) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
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
            prodi: {
              include: { fakultas: true },
            },
            dosen_wali: {
              select: {
                id: true,
                nidn: true,
                nip: true,
                nama: true,
                gelar_depan: true,
                gelar_belakang: true,
              },
            },
          },
        },
        dosen_profile: {
          include: {
            prodi: {
              include: { fakultas: true },
            },
          },
        },
        admin_profile: true,
        calon_mhs_profile: {
          include: {
            prodi: {
              include: { fakultas: true },
            },
          },
        },
      },
    });

    if (!user) {
      throw new AppError('Profil pengguna tidak ditemukan', 404);
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

    // Identifikasi profil entitas aktif
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
      id: user.id,
      username: user.username,
      email: user.email,
      status: user.status,
      last_login_at: user.last_login_at,
      created_at: user.created_at,
      updated_at: user.updated_at,
      roles,
      permissions,
      profile: activeProfile,
      profiles: {
        mahasiswa: user.mahasiswa_profile,
        dosen: user.dosen_profile,
        admin: user.admin_profile,
        calon_mahasiswa: user.calon_mhs_profile,
      },
    };
  }

  /**
   * Memperbarui profil mandiri (telepon/biodata/email/nama yang diizinkan)
   * @param {string} userId
   * @param {object} updateData
   * @param {object} context (ipAddress, userAgent)
   */
  static async updateProfile(userId, updateData, { ipAddress, userAgent } = {}) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        mahasiswa_profile: true,
        dosen_profile: true,
        admin_profile: true,
        calon_mhs_profile: true,
      },
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

    // 2. Update Nama & Atribut Profil Entitas
    if (user.mahasiswa_profile) {
      const mhsData = {};
      if (updateData.nama && updateData.nama !== user.mahasiswa_profile.nama) {
        oldValues.nama = user.mahasiswa_profile.nama;
        mhsData.nama = updateData.nama;
        newValues.nama = updateData.nama;
      }
      if (Object.keys(mhsData).length > 0) {
        await prisma.mahasiswa.update({
          where: { user_id: userId },
          data: mhsData,
        });
      }
    }

    if (user.dosen_profile) {
      const dosenData = {};
      if (updateData.nama && updateData.nama !== user.dosen_profile.nama) {
        oldValues.nama = user.dosen_profile.nama;
        dosenData.nama = updateData.nama;
        newValues.nama = updateData.nama;
      }
      if (updateData.gelar_depan !== undefined && updateData.gelar_depan !== user.dosen_profile.gelar_depan) {
        oldValues.gelar_depan = user.dosen_profile.gelar_depan;
        dosenData.gelar_depan = updateData.gelar_depan;
        newValues.gelar_depan = updateData.gelar_depan;
      }
      if (
        updateData.gelar_belakang !== undefined &&
        updateData.gelar_belakang !== user.dosen_profile.gelar_belakang
      ) {
        oldValues.gelar_belakang = user.dosen_profile.gelar_belakang;
        dosenData.gelar_belakang = updateData.gelar_belakang;
        newValues.gelar_belakang = updateData.gelar_belakang;
      }
      if (Object.keys(dosenData).length > 0) {
        await prisma.dosen.update({
          where: { user_id: userId },
          data: dosenData,
        });
      }
    }

    if (user.admin_profile) {
      const adminData = {};
      if (updateData.nama && updateData.nama !== user.admin_profile.nama) {
        oldValues.nama = user.admin_profile.nama;
        adminData.nama = updateData.nama;
        newValues.nama = updateData.nama;
      }
      if (Object.keys(adminData).length > 0) {
        await prisma.adminProfile.update({
          where: { user_id: userId },
          data: adminData,
        });
      }
    }

    if (user.calon_mhs_profile) {
      const calonData = {};
      if (updateData.nama && updateData.nama !== user.calon_mhs_profile.nama) {
        oldValues.nama = user.calon_mhs_profile.nama;
        calonData.nama = updateData.nama;
        newValues.nama = updateData.nama;
      }
      if (
        updateData.jalur_pendaftaran !== undefined &&
        updateData.jalur_pendaftaran !== user.calon_mhs_profile.jalur_pendaftaran
      ) {
        oldValues.jalur_pendaftaran = user.calon_mhs_profile.jalur_pendaftaran;
        calonData.jalur_pendaftaran = updateData.jalur_pendaftaran;
        newValues.jalur_pendaftaran = updateData.jalur_pendaftaran;
      }
      if (Object.keys(calonData).length > 0) {
        await prisma.calonMahasiswa.update({
          where: { user_id: userId },
          data: calonData,
        });
      }
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
