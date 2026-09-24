import prisma from '../../config/prisma.js';
import { ROLES } from '../../constants/roles.js';
import { AppError } from '../../utils/errors.js';

export class PortalService {
  /**
   * Menentukan modul-modul kampus yang berhak diakses oleh pengguna berdasarkan peran aktif
   * Mengacu pada PRD Section 2 & SRS Bab 9 & Bab 31
   * @param {object} user - Payload pengguna dari authenticateToken (id, roles, permissions)
   */
  static async getAccessibleModules(user) {
    const userRoles = user.roles || [];
    const isSuperAdmin = userRoles.includes(ROLES.SUPER_ADMIN);

    // Definisi master modul aplikasi kampus
    const modulesCatalog = [
      {
        id: 'portal',
        code: 'PORTAL',
        name: 'Portal Kampus Terpadu',
        description: 'Pusat navigasi akun, profil pengguna, dan informasi kalender akademik terpadu',
        icon: 'layout-dashboard',
        url: '/portal',
        allowed_roles: [
          ROLES.SUPER_ADMIN,
          ROLES.ADMIN_AKADEMIK,
          ROLES.ADMIN_LMS,
          ROLES.DOSEN,
          ROLES.DOSEN_WALI,
          ROLES.MAHASISWA,
          ROLES.CALON_MAHASISWA,
          ROLES.USER_UMUM,
        ],
        features: ['Dashboard Personal', 'Profil Mandiri', 'Kalender Akademik', 'Pengumuman'],
      },
      {
        id: 'sia',
        code: 'SIA',
        name: 'Sistem Informasi Akademik',
        description: 'Pengelolaan rencana studi (KRS), jadwal kuliah, penilaian, KHS, transkrip, dan sidang tugas akhir',
        icon: 'graduation-cap',
        url: '/sia',
        allowed_roles: [
          ROLES.SUPER_ADMIN,
          ROLES.ADMIN_AKADEMIK,
          ROLES.DOSEN,
          ROLES.DOSEN_WALI,
          ROLES.MAHASISWA,
        ],
        features: ['Kartu Rencana Studi (KRS)', 'Jadwal Perkuliahan', 'Kartu Hasil Studi (KHS)', 'Transkrip Nilai', 'Pendaftaran Sidang'],
      },
      {
        id: 'spada',
        code: 'SPADA',
        name: 'SPADA / LMS Kampus',
        description: 'Ruang kelas pembelajaran digital berbasis 16 pertemuan, materi, tugas berkas, kuis online, dan presensi',
        icon: 'book-open',
        url: '/spada',
        allowed_roles: [
          ROLES.SUPER_ADMIN,
          ROLES.ADMIN_LMS,
          ROLES.DOSEN,
          ROLES.MAHASISWA,
        ],
        features: ['16 Pertemuan Kelas', 'Distribusi Materi Kuliah', 'Pengumpulan Tugas Berkas', 'Kuis Online', 'Presensi Perkuliahan', 'UTS & UAS'],
      },
      {
        id: 'pmb',
        code: 'PMB',
        name: 'Penerimaan Mahasiswa Baru',
        description: 'Layanan informasi pendaftaran mahasiswa baru, pengisian formulir, unggah dokumen, dan seleksi masuk',
        icon: 'user-plus',
        url: '/pmb',
        allowed_roles: [
          ROLES.SUPER_ADMIN,
          ROLES.ADMIN_AKADEMIK,
          ROLES.CALON_MAHASISWA,
          ROLES.USER_UMUM,
        ],
        features: ['Informasi Jalur Seleksi', 'Pendaftaran Akun PMB', 'Unggah Berkas Persyaratan', 'Pengumuman Seleksi', 'Registrasi Ulang'],
      },
      {
        id: 'admin',
        code: 'ADMIN_PORTAL',
        name: 'Portal Manajemen & Administrasi',
        description: 'Pusat kendali master data kelembagaan, akun civitas, konfigurasi sistem, dan jejak audit trail',
        icon: 'shield-check',
        url: '/admin',
        allowed_roles: [
          ROLES.SUPER_ADMIN,
          ROLES.ADMIN_AKADEMIK,
          ROLES.ADMIN_LMS,
        ],
        features: ['Master Data Kelembagaan', 'Manajemen Akun Civitas', 'Konfigurasi Kalender & Semester', 'Monitoring Audit Log'],
      },
    ];

    // Evaluasi hak akses setiap modul berdasarkan peran pengguna
    const evaluatedModules = modulesCatalog.map((mod) => {
      const hasAccess = isSuperAdmin || mod.allowed_roles.some((role) => userRoles.includes(role));
      return {
        ...mod,
        is_accessible: hasAccess,
        badge: hasAccess ? 'Tersedia' : 'Akses Dibatasi',
      };
    });

    const accessibleOnly = evaluatedModules.filter((m) => m.is_accessible);

    return {
      total_modules: evaluatedModules.length,
      accessible_count: accessibleOnly.length,
      user_roles: userRoles,
      modules: evaluatedModules,
      accessible_modules: accessibleOnly,
    };
  }

  /**
   * Menyajikan data ringkasan dasbor portal kontekstual berbasis peran
   * Mengacu pada SRS Bab 9 (Dashboard Mahasiswa) dan Bab 19 (Dashboard Admin & Dosen)
   * @param {object} user - Payload pengguna dari req.user
   */
  static async getDashboard(user) {
    const userRoles = user.roles || [];
    const userId = user.id;

    // 1. Ambil data semester aktif dan tahun akademik operasional
    const activeSemester = await prisma.semester.findFirst({
      where: { is_active: true },
      include: {
        tahun_akademik: true,
        kalender_akademik: {
          orderBy: { mulai: 'asc' },
        },
      },
    });

    // 2. Ambil agenda kalender yang sedang berjalan atau aktif
    const now = new Date();
    const currentAgenda = activeSemester?.kalender_akademik?.find((item) => {
      const mulai = new Date(item.mulai);
      const selesai = new Date(item.selesai);
      return (now >= mulai && now <= selesai) || item.status === 'BERJALAN';
    }) || null;

    const upcomingAgendas = activeSemester?.kalender_akademik?.slice(0, 5) || [];

    // Konteks umum semester dan agenda
    const systemContext = {
      tahun_akademik: activeSemester?.tahun_akademik ? {
        id: activeSemester.tahun_akademik.id,
        kode: activeSemester.tahun_akademik.kode,
        nama: activeSemester.tahun_akademik.nama,
      } : null,
      semester_aktif: activeSemester ? {
        id: activeSemester.id,
        tipe: activeSemester.tipe,
        tanggal_mulai: activeSemester.tanggal_mulai,
        tanggal_selesai: activeSemester.tanggal_selesai,
      } : null,
      agenda_aktif: currentAgenda,
      agenda_mendatang: upcomingAgendas,
    };

    const dashboardData = {
      system_context: systemContext,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        roles: user.roles,
      },
      role_dashboards: {},
    };

    // =========================================================================
    // A. DASHBOARD MAHASISWA (SRS Bab 9 & FR-018 s/d FR-022)
    // =========================================================================
    if (userRoles.includes(ROLES.MAHASISWA) || userRoles.includes(ROLES.SUPER_ADMIN)) {
      const mhsProfile = await prisma.mahasiswa.findUnique({
        where: { user_id: userId },
        include: {
          prodi: {
            include: { fakultas: true },
          },
          dosen_wali: {
            include: {
              user: {
                select: { email: true },
              },
            },
          },
        },
      });

      if (mhsProfile || userRoles.includes(ROLES.MAHASISWA)) {
        const isKrsOpen = currentAgenda
          ? currentAgenda.agenda.toLowerCase().includes('krs')
          : false;

        dashboardData.role_dashboards.mahasiswa = {
          title: 'Dasbor Akademik Mahasiswa',
          biodata: mhsProfile ? {
            nim: mhsProfile.nim,
            nama: mhsProfile.nama,
            angkatan: mhsProfile.angkatan,
            status_akademik: mhsProfile.status_akademik,
            prodi: mhsProfile.prodi?.nama || null,
            jenjang: mhsProfile.prodi?.jenjang || null,
            fakultas: mhsProfile.prodi?.fakultas?.nama || null,
          } : null,
          dosen_pembimbing: mhsProfile?.dosen_wali ? {
            id: mhsProfile.dosen_wali.id,
            nama: mhsProfile.dosen_wali.nama,
            gelar_depan: mhsProfile.dosen_wali.gelar_depan,
            gelar_belakang: mhsProfile.dosen_wali.gelar_belakang,
            nama_lengkap: `${mhsProfile.dosen_wali.gelar_depan ? mhsProfile.dosen_wali.gelar_depan + ' ' : ''}${mhsProfile.dosen_wali.nama}${mhsProfile.dosen_wali.gelar_belakang ? ', ' + mhsProfile.dosen_wali.gelar_belakang : ''}`,
            nidn: mhsProfile.dosen_wali.nidn,
            nip: mhsProfile.dosen_wali.nip,
            email: mhsProfile.dosen_wali.user?.email || null,
          } : null,
          status_krs: {
            periode_krs_buka: isKrsOpen,
            agenda_krs: isKrsOpen ? currentAgenda : null,
            keterangan: isKrsOpen
              ? 'Periode pengisian dan revisi KRS sedang dibuka'
              : 'Periode pengisian KRS belum dibuka atau telah berakhir',
          },
          modul_terkait: [
            {
              nama: 'Sistem Informasi Akademik (SIA)',
              url: '/sia',
              fitur: ['Pengisian KRS', 'Jadwal Kuliah', 'Kartu Hasil Studi (KHS)', 'Transkrip Nilai'],
            },
            {
              nama: 'SPADA / LMS Pembelajaran',
              url: '/spada',
              fitur: ['16 Pertemuan Kelas', 'Materi Kuliah', 'Pengumpulan Tugas Berkas', 'Presensi', 'Kuis Online'],
            },
          ],
        };
      }
    }

    // =========================================================================
    // B. DASHBOARD DOSEN & DOSEN WALI (SRS Bab 19 & Bab 31)
    // =========================================================================
    if (
      userRoles.includes(ROLES.DOSEN) ||
      userRoles.includes(ROLES.DOSEN_WALI) ||
      userRoles.includes(ROLES.SUPER_ADMIN)
    ) {
      const dosenProfile = await prisma.dosen.findUnique({
        where: { user_id: userId },
        include: {
          prodi: {
            include: { fakultas: true },
          },
          mahasiswa_bimbingan: {
            select: {
              id: true,
              nim: true,
              nama: true,
              status_akademik: true,
              angkatan: true,
            },
          },
          kelas_diampu: {
            where: activeSemester ? { semester_id: activeSemester.id } : {},
            include: {
              mata_kuliah: true,
              ruangan: true,
            },
          },
        },
      });

      if (dosenProfile || userRoles.includes(ROLES.DOSEN) || userRoles.includes(ROLES.DOSEN_WALI)) {
        dashboardData.role_dashboards.dosen = {
          title: 'Dasbor Akademik & Pengajaran Dosen',
          biodata: dosenProfile ? {
            nidn: dosenProfile.nidn,
            nip: dosenProfile.nip,
            nama_lengkap: `${dosenProfile.gelar_depan ? dosenProfile.gelar_depan + ' ' : ''}${dosenProfile.nama}${dosenProfile.gelar_belakang ? ', ' + dosenProfile.gelar_belakang : ''}`,
            prodi: dosenProfile.prodi?.nama || null,
            fakultas: dosenProfile.prodi?.fakultas?.nama || null,
          } : null,
          statistik: {
            total_kelas_diampu: dosenProfile?.kelas_diampu?.length || 0,
            total_mahasiswa_wali: dosenProfile?.mahasiswa_bimbingan?.length || 0,
          },
          kelas_semester_aktif: (dosenProfile?.kelas_diampu || []).map((k) => ({
            id: k.id,
            kode_kelas: k.kode_kelas,
            mata_kuliah: {
              kode: k.mata_kuliah.kode,
              nama: k.mata_kuliah.nama,
              sks: k.mata_kuliah.sks,
            },
            ruangan: k.ruangan?.nama || 'Belum Ditentukan',
            kapasitas: k.kapasitas,
          })),
          perwalian_aktif: userRoles.includes(ROLES.DOSEN_WALI) || (dosenProfile?.mahasiswa_bimbingan?.length > 0) ? {
            total_mahasiswa: dosenProfile?.mahasiswa_bimbingan?.length || 0,
            ringkasan_mahasiswa: (dosenProfile?.mahasiswa_bimbingan || []).slice(0, 10),
          } : null,
        };
      }
    }

    // =========================================================================
    // C. DASHBOARD ADMIN AKADEMIK (SRS Bab 19.1)
    // =========================================================================
    if (userRoles.includes(ROLES.ADMIN_AKADEMIK) || userRoles.includes(ROLES.SUPER_ADMIN)) {
      const [
        totalMahasiswa,
        totalMahasiswaAktif,
        totalDosen,
        totalDosenAktif,
        totalProdi,
        totalFakultas,
        totalMataKuliah,
        totalKelasAktif,
      ] = await Promise.all([
        prisma.mahasiswa.count(),
        prisma.mahasiswa.count({ where: { status_akademik: 'AKTIF' } }),
        prisma.dosen.count(),
        prisma.dosen.count({ where: { is_active: true } }),
        prisma.programStudi.count({ where: { is_active: true } }),
        prisma.fakultas.count({ where: { is_active: true } }),
        prisma.mataKuliah.count({ where: { is_active: true } }),
        activeSemester ? prisma.kelas.count({ where: { semester_id: activeSemester.id } }) : 0,
      ]);

      dashboardData.role_dashboards.admin_akademik = {
        title: 'Dasbor Tata Kelola Akademik (SIA)',
        metrik: {
          total_mahasiswa: totalMahasiswa,
          total_mahasiswa_aktif: totalMahasiswaAktif,
          total_dosen: totalDosen,
          total_dosen_aktif: totalDosenAktif,
          total_program_studi: totalProdi,
          total_fakultas: totalFakultas,
          total_mata_kuliah: totalMataKuliah,
          total_kelas_aktif_semester_ini: totalKelasAktif,
        },
        status_operasional: {
          tahun_akademik: activeSemester?.tahun_akademik?.nama || 'Belum Diatur',
          semester: activeSemester?.tipe || 'Belum Diatur',
          agenda_berjalan: currentAgenda ? currentAgenda.agenda : 'Tidak ada agenda berjalan',
        },
      };
    }

    // =========================================================================
    // D. DASHBOARD ADMIN LMS (SRS Bab 19.2)
    // =========================================================================
    if (userRoles.includes(ROLES.ADMIN_LMS) || userRoles.includes(ROLES.SUPER_ADMIN)) {
      const [totalKelasSpada, totalMataKuliahAktif, totalDosenPengampu] = await Promise.all([
        activeSemester ? prisma.kelas.count({ where: { semester_id: activeSemester.id } }) : 0,
        prisma.mataKuliah.count({ where: { is_active: true } }),
        prisma.dosen.count({
          where: {
            kelas_diampu: {
              some: activeSemester ? { semester_id: activeSemester.id } : {},
            },
          },
        }),
      ]);

      // Ambil distribusi kelas aktif per prodi
      const prodiList = await prisma.programStudi.findMany({
        where: { is_active: true },
        select: {
          id: true,
          kode: true,
          nama: true,
        },
      });

      dashboardData.role_dashboards.admin_lms = {
        title: 'Dasbor Monitoring SPADA / LMS',
        metrik: {
          total_kelas_spada_aktif: totalKelasSpada,
          total_mata_kuliah_tersedia: totalMataKuliahAktif,
          total_dosen_pengampu_aktif: totalDosenPengampu,
          siklus_pembelajaran: 'Berbasis 16 Pertemuan per Kelas Kuliah',
        },
        layanan_pembelajaran: [
          { nama: 'Manajemen Pertemuan (1-16)', status: 'Aktif' },
          { nama: 'Distribusi Bahan Ajar / Materi', status: 'Aktif' },
          { nama: 'Penugasan Berkas (Upload PDF/ZIP)', status: 'Aktif' },
          { nama: 'Kuis Online & Evaluasi Mandiri', status: 'Aktif' },
          { nama: 'Presensi Digital Perkuliahan', status: 'Aktif' },
          { nama: 'Evaluasi UTS & UAS Terpadu', status: 'Aktif' },
        ],
        rekap_prodi: prodiList.slice(0, 5),
      };
    }

    // =========================================================================
    // E. DASHBOARD SUPER ADMIN (SRS Bab 19.3)
    // =========================================================================
    if (userRoles.includes(ROLES.SUPER_ADMIN)) {
      const [
        totalUsers,
        activeUsers,
        inactiveUsers,
        suspendedUsers,
        totalRoles,
        totalPermissions,
        recentAuditLogs,
      ] = await Promise.all([
        prisma.user.count(),
        prisma.user.count({ where: { status: 'ACTIVE' } }),
        prisma.user.count({ where: { status: 'INACTIVE' } }),
        prisma.user.count({ where: { status: 'SUSPENDED' } }),
        prisma.role.count(),
        prisma.permission.count(),
        prisma.auditLog.findMany({
          take: 5,
          orderBy: { waktu: 'desc' },
          include: {
            user: {
              select: { username: true, email: true },
            },
          },
        }),
      ]);

      // Hitung distribusi akun per role
      const rolesWithUserCount = await prisma.role.findMany({
        select: {
          name: true,
          _count: {
            select: { user_roles: true },
          },
        },
      });

      const userDistribution = {};
      rolesWithUserCount.forEach((r) => {
        userDistribution[r.name] = r._count.user_roles;
      });

      dashboardData.role_dashboards.super_admin = {
        title: 'Pusat Kendali Eksekutif & Keamanan Sistem (Super Admin)',
        metrik_pengguna: {
          total_users: totalUsers,
          users_aktif: activeUsers,
          users_nonaktif: inactiveUsers,
          users_suspended: suspendedUsers,
        },
        distribusi_peran: userDistribution,
        sistem_keamanan: {
          total_roles: totalRoles,
          total_permissions: totalPermissions,
          audit_trail_aktif: true,
          integritas_database: 'Optimal (PostgreSQL 16 + Prisma ORM)',
        },
        audit_logs_terkini: recentAuditLogs.map((log) => ({
          id: log.id,
          action: log.action,
          entity: log.entity,
          actor: log.user ? log.user.username : 'SYSTEM',
          ip_address: log.ip_address,
          waktu: log.waktu,
        })),
      };
    }

    // =========================================================================
    // F. DASHBOARD CALON MAHASISWA (PMB)
    // =========================================================================
    if (userRoles.includes(ROLES.CALON_MAHASISWA)) {
      const calonProfile = await prisma.calonMahasiswa.findUnique({
        where: { user_id: userId },
        include: {
          prodi: {
            include: { fakultas: true },
          },
        },
      });

      dashboardData.role_dashboards.calon_mahasiswa = {
        title: 'Dasbor Pendaftaran Mahasiswa Baru (PMB)',
        biodata_pendaftaran: calonProfile ? {
          no_pendaftaran: calonProfile.no_pendaftaran,
          nama: calonProfile.nama,
          jalur_pendaftaran: calonProfile.jalur_pendaftaran,
          status_seleksi: calonProfile.status_seleksi,
          prodi_pilihan: calonProfile.prodi?.nama || 'Belum Dipilih',
          jenjang: calonProfile.prodi?.jenjang || 'S1',
        } : null,
        tahapan_seleksi: [
          { tahap: '1. Pembuatan Akun PMB', status: 'SELESAI' },
          { tahap: '2. Pengisian Formulir & Unggah Dokumen', status: calonProfile?.status_seleksi !== 'MENUNGGU' ? 'SELESAI' : 'BERJALAN' },
          { tahap: '3. Verifikasi Berkas oleh Panitia', status: calonProfile?.status_seleksi === 'TERVERIFIKASI' || calonProfile?.status_seleksi === 'LULUS' ? 'SELESAI' : 'MENUNGGU' },
          { tahap: '4. Pengumuman Kelulusan', status: calonProfile?.status_seleksi === 'LULUS' ? 'LULUS' : 'MENUNGGU' },
          { tahap: '5. Registrasi Ulang Mahasiswa Baru', status: calonProfile?.status_seleksi === 'TERDAFTAR_ULANG' ? 'SELESAI' : 'BELUM' },
        ],
      };
    }

    return dashboardData;
  }
}
