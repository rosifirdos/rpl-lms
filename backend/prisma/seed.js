import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Memulai seeding database RPL-LMS...');

  // 1. ROLES RESMI SISTEM (SRS Bab 3 & Bab 31)
  const rolesData = [
    { name: 'SUPER_ADMIN', description: 'Pengelola akun, role, permission, konfigurasi sistem, dan audit' },
    { name: 'ADMIN_AKADEMIK', description: 'Pengelola data akademik, kurikulum, mata kuliah, jadwal, kalender, dan laporan' },
    { name: 'ADMIN_LMS', description: 'Pengelola konfigurasi dan monitoring sistem pembelajaran SPADA/LMS' },
    { name: 'DOSEN', description: 'Pengampu mata kuliah, pengelola materi, tugas, kuis, presensi, dan penilaian' },
    { name: 'DOSEN_WALI', description: 'Dosen penasihat akademik yang memvalidasi, menyetujui, atau merevisi KRS mahasiswa' },
    { name: 'MAHASISWA', description: 'Pengguna layanan akademik SIA dan pembelajaran aktif SPADA' },
    { name: 'CALON_MAHASISWA', description: 'Pendaftar akun PMB, pengunggah dokumen seleksi, dan registrasi ulang' },
    { name: 'USER_UMUM', description: 'Pengguna publik yang mengakses layanan portal informasi awal' },
  ];

  const roles = {};
  for (const r of rolesData) {
    const role = await prisma.role.upsert({
      where: { name: r.name },
      update: { description: r.description },
      create: r,
    });
    roles[r.name] = role;
  }
  console.log('✅ 8 Role resmi berhasil dibuat/diperbarui.');

  // 2. PERMISSIONS DASAR (SRS Bab 28.2 & Bab 31)
  const permissionsData = [
    { code: 'auth:login', name: 'Login ke Sistem' },
    { code: 'profile:read', name: 'Melihat Profil Sendiri' },
    { code: 'profile:update', name: 'Memperbarui Profil Sendiri' },
    { code: 'portal:view', name: 'Mengakses Dasbor Portal' },
    { code: 'user:manage', name: 'Mengelola Akun Pengguna' },
    { code: 'role:manage', name: 'Mengelola Role & Permission' },
    { code: 'master:academic:read', name: 'Melihat Master Data Akademik' },
    { code: 'master:academic:write', name: 'Mengelola Master Data Akademik' },
    { code: 'calendar:view', name: 'Melihat Kalender Akademik' },
    { code: 'calendar:manage', name: 'Mengelola Kalender Akademik' },
    { code: 'audit:view', name: 'Melihat Audit Log Aktivitas' },
    // MVP 2: KRS & Jadwal permissions (SRS Bab 31)
    { code: 'krs:submit', name: 'Menyerahkan KRS' },
    { code: 'krs:manage', name: 'Mengelola KRS (Intervensi Admin)' },
    { code: 'krs:approve', name: 'Menyetujui/Mengembalikan KRS' },
    { code: 'jadwal:manage', name: 'Mengelola Jadwal Kelas' },
    { code: 'jadwal:view', name: 'Melihat Jadwal Kuliah' },
  ];

  const permissions = {};
  for (const p of permissionsData) {
    const perm = await prisma.permission.upsert({
      where: { code: p.code },
      update: { name: p.name },
      create: p,
    });
    permissions[p.code] = perm;
  }

  // Petakan permission ke roles
  for (const role of Object.values(roles)) {
    // Setiap role berhak akses profile & portal (+ jadwal:view utk semua role login — MVP 2)
    const allowedCodes = ['profile:read', 'profile:update', 'portal:view', 'calendar:view', 'jadwal:view'];

    if (role.name === 'SUPER_ADMIN') {
      allowedCodes.push('user:manage', 'role:manage', 'master:academic:write', 'calendar:manage', 'audit:view');
      allowedCodes.push('krs:submit', 'krs:manage', 'krs:approve', 'jadwal:manage');
    } else if (role.name === 'ADMIN_AKADEMIK') {
      allowedCodes.push('master:academic:write', 'calendar:manage', 'audit:view');
      allowedCodes.push('krs:submit', 'krs:manage', 'jadwal:manage');
    } else if (role.name === 'ADMIN_LMS') {
      allowedCodes.push('master:academic:read', 'audit:view');
    } else if (role.name === 'MAHASISWA') {
      allowedCodes.push('krs:submit');
    } else if (role.name === 'DOSEN_WALI') {
      allowedCodes.push('krs:approve');
    }

    for (const code of allowedCodes) {
      const perm = permissions[code];
      if (perm) {
        await prisma.rolePermission.upsert({
          where: {
            role_id_permission_id: {
              role_id: role.id,
              permission_id: perm.id,
            },
          },
          update: {},
          create: {
            role_id: role.id,
            permission_id: perm.id,
          },
        });
      }
    }
  }
  console.log('✅ Permissions & Role-Permissions berhasil dipetakan.');

  // 3. MASTER DATA KELEMBAGAAN (FAKULTAS & PRODI)
  const filkom = await prisma.fakultas.upsert({
    where: { kode: 'FILKOM' },
    update: {},
    create: {
      kode: 'FILKOM',
      nama: 'Fakultas Ilmu Komputer',
      is_active: true,
    },
  });

  const ft = await prisma.fakultas.upsert({
    where: { kode: 'FT' },
    update: {},
    create: {
      kode: 'FT',
      nama: 'Fakultas Teknik',
      is_active: true,
    },
  });

  const prodiTif = await prisma.programStudi.upsert({
    where: { kode: 'TIF' },
    update: {},
    create: {
      fakultas_id: filkom.id,
      kode: 'TIF',
      nama: 'Teknik Informatika',
      jenjang: 'S1',
      is_active: true,
    },
  });

  const prodiSi = await prisma.programStudi.upsert({
    where: { kode: 'SI' },
    update: {},
    create: {
      fakultas_id: filkom.id,
      kode: 'SI',
      nama: 'Sistem Informasi',
      jenjang: 'S1',
      is_active: true,
    },
  });
  console.log('✅ Master Fakultas & Program Studi berhasil dibuat.');

  // 4. MASTER TAHUN AKADEMIK, SEMESTER & KALENDER AKADEMIK (SRS Bab 22)
  const ta2026 = await prisma.tahunAkademik.upsert({
    where: { kode: '2026/2027' },
    update: { is_active: true },
    create: {
      kode: '2026/2027',
      nama: 'Tahun Ajaran 2026/2027',
      is_active: true,
    },
  });

  const semesterGanjil = await prisma.semester.upsert({
    where: {
      tahun_akademik_id_tipe: {
        tahun_akademik_id: ta2026.id,
        tipe: 'GANJIL',
      },
    },
    update: { is_active: true },
    create: {
      tahun_akademik_id: ta2026.id,
      tipe: 'GANJIL',
      tanggal_mulai: new Date('2026-09-01T00:00:00.000Z'),
      tanggal_selesai: new Date('2027-01-31T23:59:59.000Z'),
      is_active: true,
    },
  });

  // Jendela periode KRS dibuat dinamis relatif terhadap waktu seed dijalankan
  // agar status "buka" selalu konsisten untuk demo & pengujian (MVP 2).
  const now = new Date();
  const addDays = (d, n) => new Date(d.getTime() + n * 24 * 60 * 60 * 1000);
  const periodeKrsMulai = addDays(now, -15);
  const periodeKrsSelesai = addDays(now, 45);

  const agendas = [
    { agenda: 'Masa Pengisian KRS Semester Ganjil', mulai: periodeKrsMulai, selesai: periodeKrsSelesai, status: 'BERJALAN', kategori: 'KRS' },
    { agenda: 'Masa Perkuliahan Semester Ganjil', mulai: new Date('2026-09-15'), selesai: new Date('2027-01-15'), status: 'DIJADWALKAN', kategori: 'PERKULIAHAN' },
    { agenda: 'Ujian Tengah Semester (UTS)', mulai: new Date('2026-11-02'), selesai: new Date('2026-11-14'), status: 'DIJADWALKAN', kategori: 'UTS' },
    { agenda: 'Ujian Akhir Semester (UAS)', mulai: new Date('2027-01-18'), selesai: new Date('2027-01-30'), status: 'DIJADWALKAN', kategori: 'UAS' },
  ];

  for (const ag of agendas) {
    const existing = await prisma.kalenderAkademik.findFirst({
      where: { semester_id: semesterGanjil.id, agenda: ag.agenda },
    });
    if (!existing) {
      await prisma.kalenderAkademik.create({
        data: {
          semester_id: semesterGanjil.id,
          ...ag,
        },
      });
    } else {
      // Backfill idempoten kolom kategori + sinkron rentang (MVP 2)
      await prisma.kalenderAkademik.update({
        where: { id: existing.id },
        data: { kategori: ag.kategori, ...ag },
      });
    }
  }
  console.log('✅ Master Tahun Akademik, Semester Ganjil, dan Kalender Akademik siap.');

  // 5. MASTER KURIKULUM, MATA KULIAH & FASILITAS
  const kurikulum2024 = await prisma.kurikulum.upsert({
    where: { id: 'kurikulum-tif-2024' },
    update: {},
    create: {
      id: 'kurikulum-tif-2024',
      prodi_id: prodiTif.id,
      nama: 'Kurikulum Merdeka TIF 2024',
      tahun_mulai: 2024,
      is_active: true,
    },
  });

  const matkulList = [
    { kode: 'TIF-201', nama: 'Rekayasa Perangkat Lunak', sks: 3, sks_teori: 2, sks_praktik: 1, semester_paket: 3, is_wajib: true },
    { kode: 'TIF-202', nama: 'Basis Data', sks: 3, sks_teori: 2, sks_praktik: 1, semester_paket: 3, is_wajib: true },
    { kode: 'TIF-203', nama: 'Pemrograman Web Terintegrasi', sks: 3, sks_teori: 1, sks_praktik: 2, semester_paket: 3, is_wajib: true },
    { kode: 'TIF-101', nama: 'Algoritma dan Pemrograman', sks: 4, sks_teori: 2, sks_praktik: 2, semester_paket: 1, is_wajib: true },
  ];

  const matkulObj = {};
  for (const m of matkulList) {
    const mk = await prisma.mataKuliah.upsert({
      where: { kode: m.kode },
      update: m,
      create: {
        kurikulum_id: kurikulum2024.id,
        ...m,
      },
    });
    matkulObj[m.kode] = mk;
  }

  const gedungF = await prisma.gedung.upsert({
    where: { kode: 'G-F' },
    update: {},
    create: {
      kode: 'G-F',
      nama: 'Gedung F Ilmu Komputer',
    },
  });

  const labTI = await prisma.gedung.upsert({
    where: { kode: 'LAB-TI' },
    update: {},
    create: {
      kode: 'LAB-TI',
      nama: 'Gedung Laboratorium Riset & Komputasi',
    },
  });

  const ruangF101 = await prisma.ruangan.upsert({
    where: { kode: 'RT-F101' },
    update: {},
    create: {
      gedung_id: gedungF.id,
      kode: 'RT-F101',
      nama: 'Ruang Teori F.101',
      kapasitas: 50,
      is_active: true,
    },
  });

  const ruangLab1 = await prisma.ruangan.upsert({
    where: { kode: 'LAB-KOM1' },
    update: {},
    create: {
      gedung_id: labTI.id,
      kode: 'LAB-KOM1',
      nama: 'Lab Komputasi dan Basis Data',
      kapasitas: 40,
      is_active: true,
    },
  });
  console.log('✅ Master Kurikulum, Mata Kuliah, Gedung, dan Ruangan siap.');

  // 6. AKUN CONTOH UNTUK SELURUH ROLE (Password: Password123!)
  const passwordHash = await bcrypt.hash('Password123!', 10);

  // A. Super Admin
  const superAdminUser = await prisma.user.upsert({
    where: { username: 'superadmin' },
    update: { password_hash: passwordHash, status: 'ACTIVE' },
    create: {
      username: 'superadmin',
      email: 'superadmin@kampus.ac.id',
      password_hash: passwordHash,
      status: 'ACTIVE',
    },
  });
  await prisma.userRole.upsert({
    where: { user_id_role_id: { user_id: superAdminUser.id, role_id: roles['SUPER_ADMIN'].id } },
    update: {},
    create: { user_id: superAdminUser.id, role_id: roles['SUPER_ADMIN'].id },
  });
  await prisma.adminProfile.upsert({
    where: { user_id: superAdminUser.id },
    update: {},
    create: {
      user_id: superAdminUser.id,
      nip: '198001012005011001',
      nama: 'Super Administrator Sistem',
      unit_kerja: 'Pusat Teknologi & Sistem Informasi Kampus',
    },
  });

  // B. Admin Akademik
  const adminAkademikUser = await prisma.user.upsert({
    where: { username: 'admin_akademik' },
    update: { password_hash: passwordHash, status: 'ACTIVE' },
    create: {
      username: 'admin_akademik',
      email: 'admin.akademik@kampus.ac.id',
      password_hash: passwordHash,
      status: 'ACTIVE',
    },
  });
  await prisma.userRole.upsert({
    where: { user_id_role_id: { user_id: adminAkademikUser.id, role_id: roles['ADMIN_AKADEMIK'].id } },
    update: {},
    create: { user_id: adminAkademikUser.id, role_id: roles['ADMIN_AKADEMIK'].id },
  });
  await prisma.adminProfile.upsert({
    where: { user_id: adminAkademikUser.id },
    update: {},
    create: {
      user_id: adminAkademikUser.id,
      nip: '198704122012031002',
      nama: 'Budi Prasetyo, S.Kom.',
      unit_kerja: 'Biro Administrasi Akademik & Kemahasiswaan',
    },
  });

  // C. Admin LMS
  const adminLmsUser = await prisma.user.upsert({
    where: { username: 'admin_lms' },
    update: { password_hash: passwordHash, status: 'ACTIVE' },
    create: {
      username: 'admin_lms',
      email: 'admin.lms@kampus.ac.id',
      password_hash: passwordHash,
      status: 'ACTIVE',
    },
  });
  await prisma.userRole.upsert({
    where: { user_id_role_id: { user_id: adminLmsUser.id, role_id: roles['ADMIN_LMS'].id } },
    update: {},
    create: { user_id: adminLmsUser.id, role_id: roles['ADMIN_LMS'].id },
  });
  await prisma.adminProfile.upsert({
    where: { user_id: adminLmsUser.id },
    update: {},
    create: {
      user_id: adminLmsUser.id,
      nip: '198908252014022001',
      nama: 'Dewi Lestari, M.Kom.',
      unit_kerja: 'Pusat Pengembangan Pembelajaran Digital (SPADA)',
    },
  });

  // D. Dosen 1 (Sekaligus Dosen Wali/PA)
  const dosenWaliUser = await prisma.user.upsert({
    where: { username: '198501152010121002' },
    update: { password_hash: passwordHash, status: 'ACTIVE' },
    create: {
      username: '198501152010121002',
      email: 'budi.santoso@kampus.ac.id',
      password_hash: passwordHash,
      status: 'ACTIVE',
    },
  });
  for (const rName of ['DOSEN', 'DOSEN_WALI']) {
    await prisma.userRole.upsert({
      where: { user_id_role_id: { user_id: dosenWaliUser.id, role_id: roles[rName].id } },
      update: {},
      create: { user_id: dosenWaliUser.id, role_id: roles[rName].id },
    });
  }
  const dosen1 = await prisma.dosen.upsert({
    where: { user_id: dosenWaliUser.id },
    update: {},
    create: {
      user_id: dosenWaliUser.id,
      nidn: '0015018502',
      nip: '198501152010121002',
      nama: 'Budi Santoso',
      gelar_depan: 'Dr. Ir.',
      gelar_belakang: 'M.T.',
      prodi_id: prodiTif.id,
      is_active: true,
    },
  });

  // E. Dosen 2 (Dosen Pengampu)
  const dosen2User = await prisma.user.upsert({
    where: { username: '199003202015042001' },
    update: { password_hash: passwordHash, status: 'ACTIVE' },
    create: {
      username: '199003202015042001',
      email: 'siti.aminah@kampus.ac.id',
      password_hash: passwordHash,
      status: 'ACTIVE',
    },
  });
  await prisma.userRole.upsert({
    where: { user_id_role_id: { user_id: dosen2User.id, role_id: roles['DOSEN'].id } },
    update: {},
    create: { user_id: dosen2User.id, role_id: roles['DOSEN'].id },
  });
  const dosen2 = await prisma.dosen.upsert({
    where: { user_id: dosen2User.id },
    update: {},
    create: {
      user_id: dosen2User.id,
      nidn: '0020039001',
      nip: '199003202015042001',
      nama: 'Siti Aminah',
      gelar_depan: '',
      gelar_belakang: 'M.Kom.',
      prodi_id: prodiTif.id,
      is_active: true,
    },
  });

  // F. Mahasiswa Aktif
  const mhsUser = await prisma.user.upsert({
    where: { username: '2024001001' },
    update: { password_hash: passwordHash, status: 'ACTIVE' },
    create: {
      username: '2024001001',
      email: 'ahmad.fauzi@student.kampus.ac.id',
      password_hash: passwordHash,
      status: 'ACTIVE',
    },
  });
  await prisma.userRole.upsert({
    where: { user_id_role_id: { user_id: mhsUser.id, role_id: roles['MAHASISWA'].id } },
    update: {},
    create: { user_id: mhsUser.id, role_id: roles['MAHASISWA'].id },
  });
  await prisma.mahasiswa.upsert({
    where: { user_id: mhsUser.id },
    update: {},
    create: {
      user_id: mhsUser.id,
      nim: '2024001001',
      nama: 'Ahmad Fauzi',
      prodi_id: prodiTif.id,
      angkatan: 2024,
      status_akademik: 'AKTIF',
      dosen_wali_id: dosen1.id,
    },
  });

  // G. Calon Mahasiswa (PMB)
  const calonMhsUser = await prisma.user.upsert({
    where: { username: 'PMB20260001' },
    update: { password_hash: passwordHash, status: 'ACTIVE' },
    create: {
      username: 'PMB20260001',
      email: 'rizky.pratama@gmail.com',
      password_hash: passwordHash,
      status: 'ACTIVE',
    },
  });
  await prisma.userRole.upsert({
    where: { user_id_role_id: { user_id: calonMhsUser.id, role_id: roles['CALON_MAHASISWA'].id } },
    update: {},
    create: { user_id: calonMhsUser.id, role_id: roles['CALON_MAHASISWA'].id },
  });
  await prisma.calonMahasiswa.upsert({
    where: { user_id: calonMhsUser.id },
    update: {},
    create: {
      user_id: calonMhsUser.id,
      no_pendaftaran: 'PMB20260001',
      nama: 'Rizky Pratama',
      status_seleksi: 'TERVERIFIKASI',
      prodi_pilihan_id: prodiTif.id,
      jalur_pendaftaran: 'Mandiri Prestasi',
    },
  });

  // F. Mahasiswa Aktif 2 (untuk skenario KRS berbeda)
  const mhsUser2 = await prisma.user.upsert({
    where: { username: '2024001002' },
    update: { password_hash: passwordHash, status: 'ACTIVE' },
    create: {
      username: '2024001002',
      email: 'siti.nurhaliza@student.kampus.ac.id',
      password_hash: passwordHash,
      status: 'ACTIVE',
    },
  });
  await prisma.userRole.upsert({
    where: { user_id_role_id: { user_id: mhsUser2.id, role_id: roles['MAHASISWA'].id } },
    update: {},
    create: { user_id: mhsUser2.id, role_id: roles['MAHASISWA'].id },
  });
  await prisma.mahasiswa.upsert({
    where: { user_id: mhsUser2.id },
    update: {},
    create: {
      user_id: mhsUser2.id,
      nim: '2024001002',
      nama: 'Siti Nurhaliza',
      prodi_id: prodiTif.id,
      angkatan: 2024,
      status_akademik: 'AKTIF',
      dosen_wali_id: dosen1.id,
    },
  });

  console.log('✅ Seluruh akun contoh (Super Admin, Admin, Dosen Wali, Mahasiswa, Calon Mhs) siap.');

  // 7. PENAWARAN KELAS DASAR (SRS Bab 28.1 & 28.2) — tambah kelas untuk skenario bentrok jadwal MVP 2
  const kelasRPL = await prisma.kelas.upsert({
    where: {
      mata_kuliah_id_semester_id_kode_kelas: {
        mata_kuliah_id: matkulObj['TIF-201'].id,
        semester_id: semesterGanjil.id,
        kode_kelas: 'TI-3A',
      },
    },
    update: {},
    create: {
      mata_kuliah_id: matkulObj['TIF-201'].id,
      semester_id: semesterGanjil.id,
      dosen_id: dosen1.id,
      ruangan_id: ruangF101.id,
      kode_kelas: 'TI-3A',
      kapasitas: 40,
    },
  });

  const kelasBasdat = await prisma.kelas.upsert({
    where: {
      mata_kuliah_id_semester_id_kode_kelas: {
        mata_kuliah_id: matkulObj['TIF-202'].id,
        semester_id: semesterGanjil.id,
        kode_kelas: 'TI-3A',
      },
    },
    update: {},
    create: {
      mata_kuliah_id: matkulObj['TIF-202'].id,
      semester_id: semesterGanjil.id,
      dosen_id: dosen2.id,
      ruangan_id: ruangLab1.id,
      kode_kelas: 'TI-3A',
      kapasitas: 40,
    },
  });

  // Kelas tambahan dengan bentrok ruangan/dosen (untuk skenario deteksi konflik MVP 2)
  const kelasWeb = await prisma.kelas.upsert({
    where: {
      mata_kuliah_id_semester_id_kode_kelas: {
        mata_kuliah_id: matkulObj['TIF-203'].id,
        semester_id: semesterGanjil.id,
        kode_kelas: 'TI-3B',
      },
    },
    update: {},
    create: {
      mata_kuliah_id: matkulObj['TIF-203'].id,
      semester_id: semesterGanjil.id,
      dosen_id: dosen1.id, // Bentrok dengan kelasRPL (dosen sama, waktu overlap dijamin via jadwal)
      ruangan_id: ruangF101.id, // Bentrok dengan kelasRPL (ruangan sama)
      kode_kelas: 'TI-3B',
      kapasitas: 40,
    },
  });

  console.log('✅ Penawaran kelas dasar untuk semester aktif siap.');

  // ==========================================
  // 8. SEED DATA MVP 2: PERIODE KRS, KRS CONTOH, & JADWAL KES (SRS Bab 6.1, 6.2, FR-100 s/d FR-101)
  // ==========================================

  // A. PeriodeKRS — satu periode terbuka untuk semester aktif (sks_maks: 24 SKS)
  const periodeKrs = await prisma.periodeKRS.upsert({
    where: { semester_id: semesterGanjil.id },
    update: {
      is_aktif: true,
      tanggal_mulai: periodeKrsMulai,
      tanggal_selesai: periodeKrsSelesai,
      sks_maks: 24,
    },
    create: {
      semester_id: semesterGanjil.id,
      nama: `Periode KRS Semester Ganjil ${semesterGanjil.tanggal_mulai.getFullYear()}/${new Date(semesterGanjil.tanggal_mulai.getTime() + (9 * 365 * 24 * 60 * 60 * 1000)).getFullYear()}`,
      tanggal_mulai: periodeKrsMulai,
      tanggal_selesai: periodeKrsSelesai,
      sks_maks: 24,
      is_aktif: true,
    },
  });
  console.log(`✅ Periode KRS (${periodeKrs.nama}) siap.`);

  // B. JadwalKelas untuk beberapa kelas (skenario bentrok sengaja dibuat untuk tes)
  // RPL: Senin & Rabu, 07:30 - 09:10
  const jadwalRPL = await prisma.jadwalKelas.upsert({
    where: { kelas_id_hari_jam_mulai: { kelas_id: kelasRPL.id, hari: 'SENIN', jam_mulai: '07:30' } },
    update: { kelas_id: kelasRPL.id, hari: 'SENIN', jam_mulai: '07:30', jam_selesai: '09:10' },
    create: {
      kelas_id: kelasRPL.id,
      hari: 'SENIN',
      jam_mulai: '07:30',
      jam_selesai: '09:10',
    },
  });

  // Basis Data: Senin & Rabu, 07:30 - 09:10 (bentrok dengan RPL pada Senin & Rabu — RUANGAN & DOSEN berbeda, waktu overlap)
  const jadwalBasdat = await prisma.jadwalKelas.upsert({
    where: { kelas_id_hari_jam_mulai: { kelas_id: kelasBasdat.id, hari: 'SELASA', jam_mulai: '07:30' } },
    update: { kelas_id: kelasBasdat.id, hari: 'SELASA', jam_mulai: '07:30', jam_selesai: '09:10' },
    create: {
      kelas_id: kelasBasdat.id,
      hari: 'SELASA',
      jam_mulai: '07:30',
      jam_selesai: '09:10',
    },
  });

  // Web Terintegrasi: Selasa, 08:00 - 09:40 (overlap dengan Basdat Senin/Selasa, tapi beda hari tidak bentrok; tetap buat untuk variasi)
  const jadwalWeb = await prisma.jadwalKelas.upsert({
    where: { kelas_id_hari_jam_mulai: { kelas_id: kelasWeb.id, hari: 'JUMAT', jam_mulai: '08:00' } },
    update: { kelas_id: kelasWeb.id, hari: 'JUMAT', jam_mulai: '08:00', jam_selesai: '09:40' },
    create: {
      kelas_id: kelasWeb.id,
      hari: 'JUMAT',
      jam_mulai: '08:00',
      jam_selesai: '09:40',
    },
  });
  console.log('✅ Jadwal Kelas (RPL, Basis Data, Web) siap.');

  // C. KRS contoh milik mahasiswa (MVP 2) — cari entitas mahasiswa terpisah dari user
  const mhsUserObj = await prisma.mahasiswa.findFirst({ where: { user_id: mhsUser.id } });
  const mhsUser2Obj = await prisma.mahasiswa.findFirst({ where: { user_id: mhsUser2.id } });

  if (!mhsUserObj || !mhsUser2Obj) throw new Error('Mahasiswa object not found');

  // C.1. KRS #1: Ahmad Fauzi — DRAFT dengan 2 item, belum submit (upsert untuk idempotensi)
  const krs1Draft = await prisma.kRS.upsert({
    where: {
      mahasiswa_id_semester_id: {
        mahasiswa_id: mhsUserObj.id,
        semester_id: semesterGanjil.id,
      },
    },
    update: {
      status: 'DRAFT',
      total_sks: 6,
      detail: {
        deleteMany: {},
        create: [
          { kelas_id: kelasRPL.id },
          { kelas_id: kelasBasdat.id },
        ],
      },
    },
    create: {
      mahasiswa_id: mhsUserObj.id,
      semester_id: semesterGanjil.id,
      periode_krs_id: periodeKrs.id,
      status: 'DRAFT',
      total_sks: 6, // RPL (3) + Basdat (3)
      detail: {
        create: [
          { kelas_id: kelasRPL.id },
          { kelas_id: kelasBasdat.id },
        ],
      },
    },
  });
  console.log(`✅ KRS Draft (#1) siap (${krs1Draft.id.slice(0,8)}...)`);

  // C.2. KRS #2: Ahmad Fauzi — DIAJUKAN (duplicate pada satu mahasiswa+semester di-upsert ke status berbeda untuk demo)
  const krs2Diajukan = await prisma.kRS.upsert({
    where: {
      mahasiswa_id_semester_id: {
        mahasiswa_id: mhsUserObj.id,
        semester_id: semesterGanjil.id,
      },
    },
    update: {
      status: 'DIAJUKAN',
      total_sks: 6,
      diajukan_at: new Date(),
      diproses_at: new Date(),
      disetujui_oleh_id: dosen1.id,
      catatan_dosen: null,
    },
    create: {
      mahasiswa_id: mhsUserObj.id,
      semester_id: semesterGanjil.id,
      periode_krs_id: periodeKrs.id,
      status: 'DIAJUKAN',
      total_sks: 6,
      diajukan_at: new Date(),
      diproses_at: new Date(),
      disetujui_oleh_id: dosen1.id,
      catatan_dosen: null,
    },
  });
  console.log(`✅ KRS Diajukan (#2) siap (${krs2Diajukan.id.slice(0,8)}...)`);

  // C.3. KRS #3: Siti Nurhaliza — DISETUJUI lengkap dengan 3 mata kuliah
  const krs3Disetujui = await prisma.kRS.upsert({
    where: {
      mahasiswa_id_semester_id: {
        mahasiswa_id: mhsUser2Obj.id,
        semester_id: semesterGanjil.id,
      },
    },
    update: {
      status: 'DISETUJUI',
      total_sks: 9,
      detail: {
        deleteMany: {},
        create: [
          { kelas_id: kelasRPL.id },
          { kelas_id: kelasBasdat.id },
          { kelas_id: kelasWeb.id },
        ],
      },
    },
    create: {
      mahasiswa_id: mhsUser2Obj.id,
      semester_id: semesterGanjil.id,
      periode_krs_id: periodeKrs.id,
      status: 'DISETUJUI',
      total_sks: 9, // RPL (3) + Basdat (3) + Web (3)
      diajukan_at: new Date(),
      diproses_at: new Date(),
      disetujui_oleh_id: dosen1.id,
      catatan_dosen: null,
      detail: {
        create: [
          { kelas_id: kelasRPL.id },
          { kelas_id: kelasBasdat.id },
          { kelas_id: kelasWeb.id },
        ],
      },
    },
  });
  console.log(`✅ KRS Disetujui (#3) siap (${krs3Disetujui.id.slice(0,8)}...)`);

  console.log('✅ Seed data KRS (DRAFT, DIAJUKAN, DISETUJUI) dan jadwal contoh siap.');

  // 9. AUDIT LOG INITIAL SEEDING — tag MVP 2
  await prisma.auditLog.create({
    data: {
      user_id: superAdminUser.id,
      action: 'SYSTEM_INITIAL_SEED',
      entity: 'system',
      entity_id: 'mvp2-init',
      new_values: {
        message: 'MVP 2 seeding completed: Periode KRS, KRS lifecycle data, and Jadwal Kelas examples added.',
        version: 'mvp2',
      },
      ip_address: '127.0.0.1',
      user_agent: 'Prisma Seeder Script',
    },
  });
  console.log('✅ Jejak audit MVP 2 terekam di AuditLog.');
  console.log('🎉 Seeding MVP 2 selesai dengan sukses!');
}

main()
  .catch((e) => {
    console.error('❌ Terjadi kesalahan saat seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });