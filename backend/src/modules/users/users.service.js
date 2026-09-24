import prisma from '../../config/prisma.js';
import { AppError } from '../../utils/errors.js';
import { hashPassword } from '../../utils/password.js';
import { AuditLogService } from '../audit-log/audit-log.service.js';

/**
 * Layanan Manajemen Pengguna & Roles (IPM 4.6 & SRS Bab 31 & Bab 35)
 */
export class UsersService {
  /**
   * Pembuatan akun pengguna baru secara manual beserta profil entitasnya (Super Admin)
   */
  static async createUser({ adminId, userData, ipAddress, userAgent }) {
    const {
      username,
      email,
      password,
      status = 'ACTIVE',
      mahasiswa_profile,
      dosen_profile,
      admin_profile,
      calon_mhs_profile,
    } = userData;

    // 1. Validasi keunikan username & email — cek kedua field secara terpisah
    // agar tidak ada benturan username-vs-email antar akun (username seseorang
    // boleh sama dengan email orang lain sekalipun keduanya unik per-kolom).
    const existingByUsername = await prisma.user.findUnique({
      where: { username },
    });
    if (existingByUsername) {
      throw new AppError('Username sudah digunakan oleh akun lain', 409);
    }
    const existingByEmail = await prisma.user.findUnique({
      where: { email },
    });
    if (existingByEmail) {
      throw new AppError('Email sudah terdaftar pada sistem', 409);
    }

    // 2. Validasi keberadaan role di database (dengan dedup input)
    const roles = Array.from(new Set(userData.roles ?? []));
    if (roles.length === 0) {
      throw new AppError('Pengguna minimal harus memiliki setidaknya satu role', 400);
    }
    const roleRecords = await prisma.role.findMany({
      where: {
        name: { in: roles },
      },
    });

    if (roleRecords.length !== roles.length) {
      const foundNames = new Set(roleRecords.map((r) => r.name));
      const missing = roles.filter((r) => !foundNames.has(r));
      throw new AppError(
        `Role tidak ditemukan di sistem: [${missing.join(', ')}]`,
        400
      );
    }

    // 3. Validasi entitas profil spesifik bila disediakan
    if (mahasiswa_profile) {
      const nimToCheck = mahasiswa_profile.nim || username;
      const existingMhs = await prisma.mahasiswa.findUnique({
        where: { nim: nimToCheck },
      });
      if (existingMhs) {
        throw new AppError(`NIM '${nimToCheck}' sudah terdaftar untuk mahasiswa lain`, 409);
      }

      const prodi = await prisma.programStudi.findUnique({
        where: { id: mahasiswa_profile.prodi_id },
      });
      if (!prodi) {
        throw new AppError('Program studi mahasiswa tidak ditemukan', 404);
      }

      if (mahasiswa_profile.dosen_wali_id) {
        const dosenWali = await prisma.dosen.findUnique({
          where: { id: mahasiswa_profile.dosen_wali_id },
        });
        if (!dosenWali) {
          throw new AppError('Dosen wali yang dipilih tidak ditemukan', 404);
        }
        if (!dosenWali.is_active) {
          throw new AppError('Dosen wali yang dipilih sedang tidak aktif', 400);
        }
      }
    }

    if (dosen_profile) {
      if (dosen_profile.nidn) {
        const existingNidn = await prisma.dosen.findUnique({
          where: { nidn: dosen_profile.nidn },
        });
        if (existingNidn) {
          throw new AppError(`NIDN '${dosen_profile.nidn}' sudah terdaftar untuk dosen lain`, 409);
        }
      }
      if (dosen_profile.nip) {
        const existingNip = await prisma.dosen.findUnique({
          where: { nip: dosen_profile.nip },
        });
        if (existingNip) {
          throw new AppError(`NIP '${dosen_profile.nip}' sudah terdaftar untuk dosen lain`, 409);
        }
      }
      if (dosen_profile.prodi_id) {
        const prodi = await prisma.programStudi.findUnique({
          where: { id: dosen_profile.prodi_id },
        });
        if (!prodi) {
          throw new AppError('Program studi dosen tidak ditemukan', 404);
        }
      }
    }

    if (calon_mhs_profile) {
      const noPendaftaranToCheck = calon_mhs_profile.no_pendaftaran || username;
      const existingCalon = await prisma.calonMahasiswa.findUnique({
        where: { no_pendaftaran: noPendaftaranToCheck },
      });
      if (existingCalon) {
        throw new AppError(`Nomor pendaftaran '${noPendaftaranToCheck}' sudah terdaftar`, 409);
      }
      if (calon_mhs_profile.prodi_pilihan_id) {
        const prodi = await prisma.programStudi.findUnique({
          where: { id: calon_mhs_profile.prodi_pilihan_id },
        });
        if (!prodi) {
          throw new AppError('Program studi pilihan tidak ditemukan', 404);
        }
      }
    }

    // 4. Hash password
    const password_hash = await hashPassword(password);

    // 5. Eksekusi pembuatan user, user_roles, dan profil dalam transaksi Prisma
    const createdUser = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          username,
          email,
          password_hash,
          status,
        },
      });

      // Hubungkan user dengan roles
      await tx.userRole.createMany({
        data: roleRecords.map((role) => ({
          user_id: newUser.id,
          role_id: role.id,
        })),
      });

      // Buat profil entitas sesuai data
      if (mahasiswa_profile) {
        await tx.mahasiswa.create({
          data: {
            user_id: newUser.id,
            nim: mahasiswa_profile.nim || username,
            nama: mahasiswa_profile.nama,
            prodi_id: mahasiswa_profile.prodi_id,
            angkatan: mahasiswa_profile.angkatan || new Date().getFullYear(),
            status_akademik: mahasiswa_profile.status_akademik || 'AKTIF',
            dosen_wali_id: mahasiswa_profile.dosen_wali_id || null,
          },
        });
      }

      if (dosen_profile) {
        await tx.dosen.create({
          data: {
            user_id: newUser.id,
            nidn: dosen_profile.nidn || null,
            nip: dosen_profile.nip || null,
            nama: dosen_profile.nama,
            gelar_depan: dosen_profile.gelar_depan || null,
            gelar_belakang: dosen_profile.gelar_belakang || null,
            prodi_id: dosen_profile.prodi_id || null,
            is_active: dosen_profile.is_active !== undefined ? dosen_profile.is_active : true,
          },
        });
      }

      if (admin_profile) {
        await tx.adminProfile.create({
          data: {
            user_id: newUser.id,
            nip: admin_profile.nip || null,
            nama: admin_profile.nama,
            unit_kerja: admin_profile.unit_kerja,
          },
        });
      }

      if (calon_mhs_profile) {
        await tx.calonMahasiswa.create({
          data: {
            user_id: newUser.id,
            no_pendaftaran: calon_mhs_profile.no_pendaftaran || username,
            nama: calon_mhs_profile.nama,
            status_seleksi: calon_mhs_profile.status_seleksi || 'MENUNGGU',
            prodi_pilihan_id: calon_mhs_profile.prodi_pilihan_id || null,
            jalur_pendaftaran: calon_mhs_profile.jalur_pendaftaran || null,
          },
        });
      }

      // Ambil data lengkap pengguna di dalam transaksi (menjamin row ada,
      // sekaligus menghindari round-trip DB kedua di luar transaksi).
      return tx.user.findUnique({
        where: { id: newUser.id },
        include: {
          user_roles: {
            include: {
              role: {
                select: { id: true, name: true, description: true },
              },
            },
          },
          mahasiswa_profile: {
            include: {
              prodi: { select: { id: true, kode: true, nama: true, jenjang: true } },
              dosen_wali: { select: { id: true, nama: true, nidn: true } },
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
    });

    // Guard null defensif (meskipun fetch kini di dalam transaksi, jaga-jaga
    // bila row terhapus tepat setelah commit sebelum read kembali).
    if (!createdUser) {
      throw new AppError('Pengguna baru saja dibuat namun gagal diambil ulang', 500);
    }

    // 6. Catat jejak audit pembuatan akun (SRS Bab 35)
    await AuditLogService.record({
      userId: adminId,
      action: 'CREATE_USER',
      entity: 'users',
      entityId: createdUser.id,
      newValues: {
        username: createdUser.username,
        email: createdUser.email,
        roles,
        status: createdUser.status,
      },
      ipAddress,
      userAgent,
    });

    // Sanitasi output (sembunyikan password_hash)
    const { password_hash: _hash, user_roles, ...safeUser } = createdUser;
    return {
      ...safeUser,
      roles: user_roles.map((ur) => ur.role.name),
    };
  }

  /**
   * Ubah Role Pengguna (mencatat ke audit_logs)
   */
  static async updateRoles({ adminId, targetUserId, newRoles, ipAddress, userAgent }) {
    // Proteksi: tidak diizinkan mengubah role akun sendiri (mencegah lockout)
    if (targetUserId === adminId) {
      throw new AppError('Tidak diizinkan mengubah role akun sendiri', 400);
    }

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

    // Dedup input role sebelum validasi (mencegah false-negative saat
    // newRoles berisi duplikat seperti ['DOSEN', 'DOSEN'])
    const uniqueRoles = Array.from(new Set(newRoles ?? []));
    if (uniqueRoles.length === 0) {
      throw new AppError('Pengguna minimal harus memiliki setidaknya satu role', 400);
    }

    // Cari data role dari database
    const roleRecords = await prisma.role.findMany({
      where: {
        name: { in: uniqueRoles },
      },
    });

    if (roleRecords.length !== uniqueRoles.length) {
      const foundNames = new Set(roleRecords.map((r) => r.name));
      const missing = uniqueRoles.filter((r) => !foundNames.has(r));
      throw new AppError(
        `Role tidak ditemukan di sistem: [${missing.join(', ')}]`,
        400
      );
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
      newRoles: uniqueRoles,
      ipAddress,
      userAgent,
    });

    return {
      userId: targetUserId,
      username: user.username,
      oldRoles,
      newRoles: uniqueRoles,
    };
  }

  /**
   * Ubah Status Pengguna (ACTIVE, INACTIVE, SUSPENDED)
   */
  static async updateStatus({ adminId, targetUserId, newStatus, reason, ipAddress, userAgent }) {
    // Proteksi: tidak diizinkan mengubah status akun sendiri (mencegah
    // lockout diri sendiri, mis. men-suspend akun sendiri tanpa jalur pemulihan)
    if (targetUserId === adminId) {
      throw new AppError('Tidak diizinkan mengubah status akun sendiri', 400);
    }

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
    // cabut semua refresh token pengguna untuk memutus sesi aktif (security).
    // Catatan: access token (JWT) tetap valid sampai kedaluwarsa, namun
    // middleware authenticateToken (auth.middleware.js) mengecek status user
    // dari database di setiap request, sehingga user yang di-suspend/INACTIVE
    // langsung ditolak 403 terlepas dari masa berlaku access token.
    if (newStatus !== 'ACTIVE') {
      await prisma.refreshToken.updateMany({
        where: { user_id: targetUserId, revoked_at: null },
        data: { revoked_at: new Date() },
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
      // Perluas pencarian agar juga menjangkau `nama` pada seluruh tabel profil
      // relasional (mahasiswa/dosen/admin/calon-mahasiswa), bukan hanya
      // username & email.
      where.OR = [
        { username: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { mahasiswa_profile: { nama: { contains: search, mode: 'insensitive' } } },
        { dosen_profile: { nama: { contains: search, mode: 'insensitive' } } },
        { admin_profile: { nama: { contains: search, mode: 'insensitive' } } },
        { calon_mhs_profile: { nama: { contains: search, mode: 'insensitive' } } },
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
    // Gunakan `select` eksplisit (bukan `include`) agar `password_hash`
    // tidak ikut bocor ke response GET /api/v1/users/:id.
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        username: true,
        email: true,
        status: true,
        last_login_at: true,
        created_at: true,
        user_roles: {
          select: {
            role: { select: { id: true, name: true, description: true } },
          },
        },
        mahasiswa_profile: {
          include: {
            prodi: { select: { id: true, kode: true, nama: true, jenjang: true } },
            dosen_wali: { select: { id: true, nama: true, nidn: true } },
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
      throw new AppError('Pengguna tidak ditemukan', 404);
    }

    // Tambahkan field terderivasi `roles` (array of code) untuk konsistensi
    // dengan `getUsers` & `createUser`, sambil tetap mempertahankan `user_roles`.
    return {
      ...user,
      roles: user.user_roles.map((ur) => ur.role.name),
    };
  }
}
