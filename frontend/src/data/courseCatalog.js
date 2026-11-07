/**
 * data/courseCatalog.js
 *
 * Katalog mata kuliah terpusat untuk portal mahasiswa.
 * Dipakai oleh CourseCards (dashboard), KlsSayaMahasiswa, dan RuangKelas agar
 * halaman ruang kelas selalu menampilkan mata kuliah yang sesuai dengan card
 * yang diklik.
 */

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

const buildWeeklyDates = (startISO, count) => {
  const start = new Date(`${startISO}T00:00:00Z`);
  return Array.from({ length: count }, (_, i) => {
    const d = new Date(start.getTime() + i * 7 * 24 * 60 * 60 * 1000);
    return `${String(d.getUTCDate()).padStart(2, '0')} ${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
  });
};

// Jadwal mingguan semester ganjil 2026/2027 (P1 = 22 Sep 2026)
const SEMESTER_DATES = buildWeeklyDates('2026-09-22', 16);

const STATUS_STYLES = {
  HADIR: {
    statusClass: 'bg-success-solid/20 text-success-ink border border-success-solid/30',
    icon: 'check_circle',
  },
  SESI_AKTIF: {
    statusClass: 'bg-tertiary-container/30 text-tertiary border border-tertiary/40 animate-pulse',
    icon: 'timer',
  },
  TERKUNCI: {
    statusClass: 'bg-surface-container text-outline',
    icon: 'lock',
  },
  EVALUASI_UTS: {
    statusClass: 'bg-secondary-container/30 text-secondary border border-secondary/40 font-bold',
    icon: 'quiz',
  },
  EVALUASI_UAS: {
    statusClass: 'bg-error-container/40 text-error border border-error/40 font-bold',
    icon: 'verified',
  },
};

const getMeetingTag = (number) => {
  if (number === 8) return 'Evaluasi Tengah Semester (UTS)';
  if (number === 16) return 'Evaluasi Akhir Semester (UAS)';
  return number < 8 ? 'Pembelajaran Pra-UTS' : 'Pembelajaran Pasca-UTS';
};

const getMeetingDescription = (course, number) => {
  if (number === 8) {
    return `Evaluasi tertulis & praktik analisis ${course.name.toLowerCase()} berbasis studi kasus industri.`;
  }
  if (number === 16) {
    return `Presentasi dan demonstrasi hasil pembelajaran ${course.name} selama satu semester.`;
  }
  return `Pembahasan ${course.topics[number - 1]} melalui ceramah, studi kasus, dan latihan terbimbing pada mata kuliah ${course.name}.`;
};

const buildMeetings = (course) => {
  return Array.from({ length: course.totalMeetings }, (_, i) => {
    const number = i + 1;
    let status;

    if (number === 8) {
      status = 'EVALUASI_UTS';
    } else if (number === 16) {
      status = 'EVALUASI_UAS';
    } else if (number < course.currentMeeting) {
      status = 'HADIR';
    } else if (number === course.currentMeeting) {
      status = course.attendanceActive ? 'SESI_AKTIF' : 'HADIR';
    } else {
      status = 'TERKUNCI';
    }

    const detail = course.details && course.details[number];
    const isEvaluation = status === 'EVALUASI_UTS' || status === 'EVALUASI_UAS';
    const defaultMaterials =
      status === 'HADIR' && !isEvaluation
        ? [{ name: `Materi P${number} — ${course.name}.pdf`, size: '1.6 MB', type: 'pdf' }]
        : [];

    const materials = detail && detail.materials ? detail.materials : defaultMaterials;
    const style = STATUS_STYLES[status];
    const date = SEMESTER_DATES[i];

    return {
      id: `p${number}`,
      number,
      tag: getMeetingTag(number),
      date: status === 'SESI_AKTIF' ? `${date} (Hari Ini)` : date,
      title: `P${number} • ${course.topics[number - 1]}`,
      description: detail && detail.description ? detail.description : getMeetingDescription(course, number),
      materialsCount: materials.length,
      status,
      statusClass: style.statusClass,
      icon: style.icon,
      materials,
    };
  });
};

const rawCourses = [
  {
    id: 'rpl-ti-a',
    code: 'TIF-301',
    classGroup: 'TI-A',
    sks: 3,
    name: 'Rekayasa Perangkat Lunak',
    lecturer: 'Dr. Bayu Pratama, M.Kom.',
    nidn: '0612345601',
    schedule: 'Senin, 08:00 - 10:30 WIB • Lab Komputasi 3',
    semester: 'SEMESTER GANJIL 2026/2027',
    currentMeeting: 3,
    totalMeetings: 16,
    attendanceActive: true,
    attendanceDeadline: 'Hingga 10:15 WIB',
    attendedSessions: 3,
    conductedSessions: 4,
    materialsCount: 5,
    activeTasks: 1,
    showOnDashboard: true,
    badgeBg: 'bg-primary-container',
    badgeText: 'text-on-primary-container',
    hoverText: 'group-hover:text-primary',
    iconColor: 'text-primary',
    progressGradient: 'bg-gradient-to-r from-primary-container to-primary',
    description:
      'Mata kuliah Rekayasa Perangkat Lunak membekali mahasiswa dengan kemampuan merancang, menganalisis, membangun, dan menguji sistem perangkat lunak berskala industri menggunakan metodologi modern (Agile, Scrum, CI/CD, dan Standar IEEE 830).',
    topics: [
      'Pengenalan Rekayasa Perangkat Lunak & SDLC',
      'Proses Perangkat Lunak: Waterfall, Agile, Scrum',
      'Analisis Kebutuhan Sistem & Spesifikasi SRS IEEE 830',
      'Pemodelan Berorientasi Objek: Use Case & Activity Diagram',
      'Pemodelan Statis & Dinamis: Class & Sequence Diagram',
      'Arsitektur Perangkat Lunak: Layered, MVC, Microservices',
      'Perancangan Basis Data Relasional & Review Pra-UTS',
      'UJIAN TENGAH SEMESTER (UTS)',
      'User Experience (UX) & Design System LMS',
      'Pengujian Perangkat Lunak & Quality Assurance',
      'Manajemen Konfigurasi & Version Control',
      'DevOps & Continuous Integration/Delivery',
      'Manajemen Proyek Perangkat Lunak & Estimasi',
      'Keamanan Perangkat Lunak & OWASP',
      'Review Proyek Akhir & Persiapan UAS',
      'UJIAN AKHIR SEMESTER (UAS) & DEMO PROYEK',
    ],
    details: {
      1: {
        description:
          'Definisi perangkat lunak, krisis software masa lampau, evolusi SDLC, dan profesionalisme rekayasawan perangkat lunak sesuai ACM/IEEE guidelines.',
        materials: [
          { name: 'Slide 01 — Konsep Dasar & Evolusi RPL.pdf', size: '2.4 MB', type: 'pdf' },
          { name: 'Silabus & Kontrak Perkuliahan RPL 2026.pdf', size: '850 KB', type: 'pdf' },
        ],
      },
      2: {
        description:
          'Analisis perbandingan metode proses sekuensial vs iterative agile. Penerapan sprint planning dan stand-up meeting.',
        materials: [
          { name: 'Slide 02 — Model Proses Perangkat Lunak.pptx', size: '4.1 MB', type: 'ppt' },
          { name: 'Studi Kasus Scrum Framework di Startup.pdf', size: '1.2 MB', type: 'pdf' },
        ],
      },
      3: {
        description:
          'Teknik elisitasi kebutuhan pengguna (wawancara, kuesioner), pemisahan kebutuhan fungsional & non-fungsional, serta format baku dokumen SRS IEEE 830.',
        materials: [
          { name: 'Modul 03 — Elisitasi & Spesifikasi SRS IEEE 830.pdf', size: '3.1 MB', type: 'pdf' },
          { name: 'Template Dokumen SRS Standar UPGRIS.docx', size: '540 KB', type: 'doc' },
        ],
      },
      4: {
        description:
          'Prinsip OOP, pembuatan diagram use case, skenario alur utama/alternatif, dan pemodelan aktivitas bisnis.',
        materials: [{ name: 'Slide 04 — Unified Modeling Language (UML).pdf', size: '2.8 MB', type: 'pdf' }],
      },
    },
  },
  {
    id: 'pwl-ti-b',
    code: 'TIF-305',
    classGroup: 'TI-B',
    sks: 3,
    name: 'Pemrograman Web Lanjut',
    lecturer: 'Ir. Siti Aminah, M.T.',
    nidn: '0628098701',
    schedule: 'Selasa, 13:00 - 15:30 WIB • Lab Software 1',
    semester: 'SEMESTER GANJIL 2026/2027',
    currentMeeting: 4,
    totalMeetings: 16,
    attendanceActive: false,
    attendanceDeadline: 'Sesi berikutnya: Selasa',
    attendedSessions: 4,
    conductedSessions: 5,
    materialsCount: 4,
    activeTasks: 0,
    showOnDashboard: true,
    badgeBg: 'bg-secondary-container',
    badgeText: 'text-on-secondary-container',
    hoverText: 'group-hover:text-secondary',
    iconColor: 'text-secondary',
    progressGradient: 'bg-gradient-to-r from-secondary-container to-secondary',
    description:
      'Mata kuliah Pemrograman Web Lanjut membahas pengembangan aplikasi web modern berbasis komponen, state management, konsumsi API, keamanan sesi, hingga deployment dan optimasi performa.',
    topics: [
      'Pengenalan Pemrograman Web Lanjut & Arsitektur Modern',
      'Komponen UI & Modularisasi Frontend',
      'State Management & Lifecycle Komponen',
      'Routing & Navigation Single Page Application',
      'Konsumsi REST API & Asynchronous JavaScript',
      'Autentikasi & Otorisasi Berbasis Token',
      'Validasi Form & Penanganan Error',
      'UJIAN TENGAH SEMESTER (UTS)',
      'Realtime Web & WebSocket',
      'Progressive Web App & Dukungan Offline',
      'Optimasi Performa & Code Splitting',
      'Pengujian Frontend (Unit & End-to-End)',
      'Deployment & CI/CD Frontend',
      'Aksesibilitas & Responsive Design',
      'Review Proyek Akhir & Persiapan UAS',
      'UJIAN AKHIR SEMESTER (UAS) & DEMO PROYEK',
    ],
  },
  {
    id: 'bdt-ti-c',
    code: 'TIF-309',
    classGroup: 'TI-C',
    sks: 3,
    name: 'Basis Data Terdistribusi',
    lecturer: 'Prof. Hadi Wijaya, M.Sc.',
    nidn: '0615027503',
    schedule: 'Rabu, 09:30 - 12:00 WIB • Ruang Teori 402',
    semester: 'SEMESTER GANJIL 2026/2027',
    currentMeeting: 3,
    totalMeetings: 16,
    attendanceActive: false,
    attendanceDeadline: 'Selesai Pekan Lalu',
    attendedSessions: 3,
    conductedSessions: 5,
    materialsCount: 6,
    activeTasks: 2,
    showOnDashboard: true,
    badgeBg: 'bg-tertiary-container',
    badgeText: 'text-on-tertiary-container',
    hoverText: 'group-hover:text-tertiary',
    iconColor: 'text-tertiary',
    progressGradient: 'bg-gradient-to-r from-tertiary-container to-tertiary',
    description:
      'Mata kuliah Basis Data Terdistribusi membahas arsitektur, replikasi, fragmentasi, konsistensi, dan pemrosesan query pada sistem basis data yang tersebar di banyak node.',
    topics: [
      'Pengenalan Basis Data Terdistribusi',
      'Arsitektur & Topologi Sistem Terdistribusi',
      'Fragmentasi & Replikasi Data',
      'Konsistensi & Model Transaksi Terdistribusi',
      'Protokol Commit Terdistribusi (2PC & 3PC)',
      'Replikasi Master-Slave & Multi-Master',
      'Sharding & Partisi Horizontal',
      'UJIAN TENGAH SEMESTER (UTS)',
      'NoSQL & Basis Data Terdistribusi Modern',
      'CAP Theorem & Trade-off Konsistensi',
      'Distributed Query Processing',
      'Basis Data Cloud & Managed Services',
      'Rekam Jejak & Pemulihan Bencana',
      'Keamanan & Tata Kelola Data Terdistribusi',
      'Review Proyek Akhir & Persiapan UAS',
      'UJIAN AKHIR SEMESTER (UAS) & DEMO PROYEK',
    ],
  },
  {
    id: 'jarkom-ti-a',
    code: 'TIF-304',
    classGroup: 'TI-A',
    sks: 3,
    name: 'Jaringan Komputer & Keamanan Siber',
    lecturer: 'Budi Santoso, M.Kom.',
    nidn: '0619088102',
    schedule: 'Kamis, 08:00 - 10:30 WIB • Lab Jaringan',
    semester: 'SEMESTER GANJIL 2026/2027',
    currentMeeting: 3,
    totalMeetings: 16,
    attendanceActive: false,
    attendanceDeadline: 'Selesai Pekan Lalu',
    attendedSessions: 3,
    conductedSessions: 5,
    materialsCount: 3,
    activeTasks: 1,
    showOnDashboard: false,
    badgeBg: 'bg-primary-container',
    badgeText: 'text-on-primary-container',
    hoverText: 'group-hover:text-primary',
    iconColor: 'text-primary',
    progressGradient: 'bg-gradient-to-r from-primary-container to-primary',
    description:
      'Mata kuliah Jaringan Komputer & Keamanan Siber membahas model OSI/TCP-IP, routing, kriptografi, hingga praktik keamanan defensif dan forensik digital.',
    topics: [
      'Pengenalan Jaringan Komputer & Model OSI',
      'TCP/IP & Pengalamatan IP',
      'Routing & Switching',
      'Keamanan Jaringan Dasar & Firewall',
      'Kriptografi & Protokol Keamanan',
      'VPN & Tunneling',
      'Analisis Trafik & Monitoring Jaringan',
      'UJIAN TENGAH SEMESTER (UTS)',
      'Keamanan Siber & Threat Landscape',
      'Ethical Hacking & Penetration Testing',
      'Manajemen Insiden & Forensik Digital',
      'Keamanan Aplikasi Web & OWASP',
      'Keamanan Cloud & Infrastruktur',
      'Tata Kelola & Kepatuhan Keamanan',
      'Review Proyek Akhir & Persiapan UAS',
      'UJIAN AKHIR SEMESTER (UAS) & DEMO PROYEK',
    ],
  },
];

export const courseCatalog = rawCourses.map((course) => ({
  ...course,
  attendancePercent: Math.round((course.attendedSessions / course.conductedSessions) * 100),
  meetingProgressPct: Math.round((course.currentMeeting / course.totalMeetings) * 100),
  attendanceEligible: Math.round((course.attendedSessions / course.conductedSessions) * 100) >= 70,
  meetings: buildMeetings(course),
}));

export const getCourseById = (id) => courseCatalog.find((course) => course.id === id) || courseCatalog[0];

export const dashboardCourses = courseCatalog.filter((course) => course.showOnDashboard !== false);
