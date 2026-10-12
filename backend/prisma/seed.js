import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const ACADEMIC_YEAR = '2026/2027';
const SEMESTER = 'ganjil';
const DEFAULT_PASSWORD = 'password123';

/**
 * Seeder awal SPADA LMS — MVP 1 (IMPLEMENTATION_PLAN Bab 6, Fase 1)
 *
 * Membuat: 1 Admin, 3 Dosen, 10 Mahasiswa, 5 Master Mata Kuliah,
 * dan 2 Pembukaan Kelas perkuliahan contoh.
 *
 * Idempoten: menggunakan upsert berdasarkan identifier unik (NIM/NIDN/username/code).
 */
async function main() {
  console.log('🌱 Memulai seeding database SPADA LMS (MVP 1)...');

  const defaultPassword = await bcrypt.hash(DEFAULT_PASSWORD, 10);

  // ========= 1. ADMIN (Role Tunggal) =========
  const admin = await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      email: 'admin@upgris.ac.id',
      password_hash: defaultPassword,
      role: 'admin',
      status: 'ACTIVE',
      profile: {
        create: {
          full_name: 'Administrator SPADA',
        },
      },
    },
  });
  console.log(`  ✅ Admin: ${admin.username} (${admin.email})`);

  // ========= 2. DOSEN (3 contoh) =========
  const dosenData = [
    {
      nidn: '198501152010121002',
      nip: '198501152010121002',
      full_name: 'Dr. Budi Santoso, M.Kom.',
      gelar_depan: 'Dr.',
      gelar_belakang: 'M.Kom.',
      email: 'budi.santoso@upgris.ac.id',
    },
    {
      nidn: '199003202015042001',
      nip: '199003202015042001',
      full_name: 'Siti Aminah, S.Kom., M.T.',
      gelar_depan: '',
      gelar_belakang: 'S.Kom., M.T.',
      email: 'siti.aminah@upgris.ac.id',
    },
    {
      nidn: '197805102003122001',
      nip: '197805102003122001',
      full_name: 'Prof. Hadi Wijaya, M.Sc.',
      gelar_depan: 'Prof.',
      gelar_belakang: 'M.Sc.',
      email: 'hadi.wijaya@upgris.ac.id',
    },
  ];

  const dosen = [];
  for (const d of dosenData) {
    // Buat user dosen (username = NIDN untuk kemudahan login)
    const user = await prisma.user.upsert({
      where: { username: d.nidn },
      update: {},
      create: {
        username: d.nidn,
        email: d.email,
        password_hash: defaultPassword,
        role: 'dosen',
        status: 'ACTIVE',
        profile: {
          create: {
            full_name: d.full_name,
          },
        },
      },
    });

    // Buat record Dosen
    const dosenRecord = await prisma.dosen.upsert({
      where: { user_id: user.id },
      update: {},
      create: {
        user_id: user.id,
        nidn: d.nidn,
        nip: d.nip,
        gelar_depan: d.gelar_depan,
        gelar_belakang: d.gelar_belakang,
      },
    });
    dosen.push(dosenRecord);
    console.log(`  ✅ Dosen: ${dosenRecord.nidn} — ${d.full_name}`);
  }

  // ========= 3. MAHASISWA (10 contoh) =========
  const prodiList = ['Teknik Informatika', 'Sistem Informasi'];
  const namaDepan = ['Andi', 'Siti', 'Budi', 'Dewi', 'Eko', 'Fitri', 'Gunawan', 'Hana', 'Irfan', 'Joko'];
  const namaBelakang = ['Pratama', 'Nurhaliza', 'Saputra', 'Lestari', 'Wijaya', 'Anggraini', 'Kusuma', 'Safitri', 'Ramadhan', 'Susilo'];

  const mahasiswa = [];
  for (let i = 0; i < 10; i++) {
    const nim = `202400100${i + 1}`;
    const fullName = `${namaDepan[i]} ${namaBelakang[i]}`;

    // Buat user mahasiswa (username = NIM)
    const user = await prisma.user.upsert({
      where: { username: nim },
      update: {},
      create: {
        username: nim,
        email: `${nim}@mhs.upgris.ac.id`,
        password_hash: defaultPassword,
        role: 'mahasiswa',
        status: 'ACTIVE',
        profile: {
          create: {
            full_name: fullName,
          },
        },
      },
    });

    // Buat record Mahasiswa
    const mhs = await prisma.mahasiswa.upsert({
      where: { user_id: user.id },
      update: {},
      create: {
        user_id: user.id,
        nim,
        prodi: prodiList[i % 2 === 0 ? 0 : 1],
        angkatan: 2024,
      },
    });
    mahasiswa.push(mhs);
  }
  console.log(`  ✅ Mahasiswa: ${mahasiswa.length} akun (NIM 2024001001–2024001010)`);

  // ========= 4. MASTER MATA KULIAH (5 rintisan) =========
  const coursesData = [
    {
      code: 'TIF101',
      name: 'Pemrograman Web',
      credits: 4,
      description: 'Fundamental pengembangan aplikasi web: HTML, CSS, JavaScript, dan arsitektur client-server.',
    },
    {
      code: 'TIF102',
      name: 'Basis Data Relasional',
      credits: 4,
      description: 'Model relasional, SQL, normalisasi, dan manajemen transaksi basis data.',
    },
    {
      code: 'TIF103',
      name: 'Rekayasa Perangkat Lunak',
      credits: 3,
      description: 'Siklus pengembangan perangkat lunak, metodologi, dan praktik rekayasa perangkat lunak modern.',
    },
    {
      code: 'TIF104',
      name: 'Jaringan Komputer',
      credits: 3,
      description: 'Protokol jaringan, model OSI/TCP-IP, dan administrasi jaringan dasar.',
    },
    {
      code: 'TIF105',
      name: 'Pemrograman Berorientasi Objek',
      credits: 4,
      description: 'Konsep OOP, enkapsulasi, inheritance, polimorfisme, dan desain berbasis objek.',
    },
  ];

  const courses = [];
  for (const c of coursesData) {
    const course = await prisma.course.upsert({
      where: { code: c.code },
      update: {},
      create: {
        code: c.code,
        name: c.name,
        credits: c.credits,
        description: c.description,
      },
    });
    courses.push(course);
  }
  console.log(`  ✅ Mata Kuliah: ${courses.length} master (${courses.map((c) => c.code).join(', ')})`);

  // ========= 5. PEMBUKAAN KELAS (2 contoh) =========
  const classesData = [
    {
      course_code: 'TIF101',
      lecturer_nidn: dosen[0].nidn,
      name: 'TI-A',
      capacity: 40,
    },
    {
      course_code: 'TIF102',
      lecturer_nidn: dosen[1].nidn,
      name: 'SI-B',
      capacity: 35,
    },
  ];

  const classes = [];
  for (const cl of classesData) {
    const course = courses.find((c) => c.code === cl.course_code);
    const lecturer = dosen.find((d) => d.nidn === cl.lecturer_nidn);

    // Cari kelas yang sudah ada (unique: course + academic_year + semester + name)
    const existing = await prisma.class.findFirst({
      where: {
        course_id: course.id,
        academic_year: ACADEMIC_YEAR,
        semester: SEMESTER,
        name: cl.name,
      },
    });

    if (existing) {
      classes.push(existing);
      continue;
    }

    const newClass = await prisma.class.create({
      data: {
        course_id: course.id,
        lecturer_id: lecturer.id,
        academic_year: ACADEMIC_YEAR,
        semester: SEMESTER,
        name: cl.name,
        capacity: cl.capacity,
      },
    });
    classes.push(newClass);
  }
  console.log(
    `  ✅ Kelas: ${classes.length} kelas dibuka (${classes
      .map((c) => `${c.name}`)
      .join(', ')}) — ${ACADEMIC_YEAR} ${SEMESTER}`
  );

  console.log('');
  console.log('🎉 Seeding selesai!');
  console.log(`   Default password untuk seluruh akun: ${DEFAULT_PASSWORD}`);
  console.log('   Login Admin     : admin / admin@upgris.ac.id');
  console.log('   Login Dosen     : <NIDN> (mis. 198501152010121002)');
  console.log('   Login Mahasiswa : <NIM>  (mis. 2024001001)');
}

main()
  .catch((e) => {
    console.error('❌ Seeding gagal:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
