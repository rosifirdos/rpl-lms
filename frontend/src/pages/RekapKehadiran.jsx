import { useState, useMemo, useEffect } from 'react';

// Data Rekapitulasi Kehadiran Kelas & Mahasiswa
// TODO: Hubungkan dengan pemanggilan API nyata: GET /api/kelas/:id/rekap-kehadiran
const CLASS_INFO = {
  mataKuliah: 'Rekayasa Perangkat Lunak',
  kode: 'IF3104',
  rombel: 'TI-A',
  labelLengkap: 'Rekayasa Perangkat Lunak (TI-A)',
  sks: '3 SKS Reguler Pagi',
  semester: 'Ganjil 2026/2027',
  dosen: 'Dr. Awan Rosi, M.Kom.',
  totalMahasiswa: 38,
  pertemuanSelesai: 12,
  totalPertemuan: 16,
  ambangBatas: 70, // 70% threshold (BR-012)
};

const KPI_DATA = {
  rataRata: 86.4,
  trenPekanLalu: '+2.1% dibanding pekan lalu • Stabil',
  memenuhiAmbang: 34,
  totalSiswa: 38,
  persenMemenuhi: 89.5,
  butuhPerhatian: 4,
  persenPerhatian: 10.5,
  sesiSelesai: 12,
  totalSesi: 16,
  persenSesi: 75,
};

const MATRIX_STUDENTS = [
  {
    no: 1,
    id: '24670001',
    nim: '24670001',
    nama: 'Dimas Arya Pratama',
    inisial: 'DA',
    verified: true,
    avatarBg: 'bg-primary-container',
    avatarText: 'text-on-primary-container',
    sessions: [
      'H', 'H', 'H', 'H', 'I', 'H', 'H',
      'H',
      'H', 'H', 'H', 'H',
      null, null, null,
      null
    ],
    hadir: 11,
    sakit: 0,
    izin: 1,
    alpa: 0,
    rasio: 91.7,
    status: 'safe',
    kelayakan: 'Memenuhi Syarat',
    kelayakanType: 'safe',
  },
  {
    no: 2,
    id: '24670002',
    nim: '24670002',
    nama: 'Ahmad Fauzi',
    inisial: 'AF',
    verified: false,
    avatarBg: 'bg-surface-container-high',
    avatarText: 'text-on-surface',
    sessions: [
      'H', 'H', 'S', 'H', 'H', 'I', 'H',
      'H',
      'H', 'H', 'H', 'H',
      null, null, null,
      null
    ],
    hadir: 10,
    sakit: 1,
    izin: 1,
    alpa: 0,
    rasio: 83.3,
    status: 'safe',
    kelayakan: 'Memenuhi Syarat',
    kelayakanType: 'safe',
  },
  {
    no: 3,
    id: '24670003',
    nim: '24670003',
    nama: 'Siti Nurhaliza',
    inisial: 'SN',
    verified: false,
    avatarBg: 'bg-surface-container-high',
    avatarText: 'text-on-surface',
    sessions: [
      'H', 'H', 'H', 'H', 'H', 'H', 'H',
      'H',
      'H', 'H', 'H', 'H',
      null, null, null,
      null
    ],
    hadir: 12,
    sakit: 0,
    izin: 0,
    alpa: 0,
    rasio: 100.0,
    status: 'safe',
    kelayakan: 'Sempurna',
    kelayakanType: 'perfect',
  },
  {
    no: 4,
    id: '24670005',
    nim: '24670005',
    nama: 'Kevin Sanjaya',
    inisial: 'KS',
    verified: false,
    avatarBg: 'bg-surface-container-high',
    avatarText: 'text-on-surface',
    sessions: [
      'H', 'H', 'H', 'I', 'H', 'H', 'H',
      'H',
      'H', 'H', 'H', 'H',
      null, null, null,
      null
    ],
    hadir: 11,
    sakit: 0,
    izin: 1,
    alpa: 0,
    rasio: 91.7,
    status: 'safe',
    kelayakan: 'Memenuhi Syarat',
    kelayakanType: 'safe',
  },
  {
    no: 5,
    id: '24670014',
    nim: '24670014',
    nama: 'Bagas Saputra',
    inisial: 'BS',
    verified: false,
    warning: true,
    avatarBg: 'bg-error-container',
    avatarText: 'text-on-error-container',
    sessions: [
      'H', 'S', 'A', 'H', 'A', 'H', 'S',
      'H',
      'H', 'A', 'H', 'H',
      null, null, null,
      null
    ],
    hadir: 7,
    sakit: 2,
    izin: 0,
    alpa: 3,
    rasio: 58.3,
    status: 'risk',
    kelayakan: 'Terancam Gagal',
    kelayakanType: 'risk',
  },
  {
    no: 6,
    id: '24670008',
    nim: '24670008',
    nama: 'Maya Anggraini',
    inisial: 'MA',
    verified: false,
    warning: true,
    avatarBg: 'bg-error-container',
    avatarText: 'text-on-error-container',
    sessions: [
      'H', 'A', 'H', 'I', 'A', 'H', 'I',
      'H',
      'A', 'H', 'A', 'H',
      null, null, null,
      null
    ],
    hadir: 6,
    sakit: 0,
    izin: 2,
    alpa: 4,
    rasio: 50.0,
    status: 'risk',
    kelayakan: 'Terancam Gagal',
    kelayakanType: 'risk',
  },
  {
    no: 7,
    id: '24670007',
    nim: '24670007',
    nama: 'Doni Setiawan',
    inisial: 'DS',
    verified: false,
    avatarBg: 'bg-surface-container-high',
    avatarText: 'text-on-surface',
    sessions: [
      'H', 'H', 'H', 'H', 'H', 'H', 'S',
      'H',
      'H', 'H', 'H', 'H',
      null, null, null,
      null
    ],
    hadir: 11,
    sakit: 1,
    izin: 0,
    alpa: 0,
    rasio: 91.7,
    status: 'safe',
    kelayakan: 'Memenuhi Syarat',
    kelayakanType: 'safe',
  },
  {
    no: 8,
    id: '24670006',
    nim: '24670006',
    nama: 'Rina Wulandari',
    inisial: 'RW',
    verified: false,
    avatarBg: 'bg-surface-container-high',
    avatarText: 'text-on-surface',
    sessions: [
      'H', 'H', 'H', 'H', 'H', 'H', 'H',
      'H',
      'H', 'H', 'H', 'H',
      null, null, null,
      null
    ],
    hadir: 12,
    sakit: 0,
    izin: 0,
    alpa: 0,
    rasio: 100.0,
    status: 'safe',
    kelayakan: 'Sempurna',
    kelayakanType: 'perfect',
  },
];

const STUDENT_PERSONAL_DATA = {
  nama: 'Dimas Arya Pratama',
  inisial: 'DA',
  nim: '24670001',
  krsStatus: 'Aktif KRS 2026/2027',
  prodi: 'Program Studi S1 Teknik Informatika • Kelas TI-A Pagi',
  dosenPA: 'Dr. Awan Rosi, M.Kom.',
  statusPresensi: 'TERVALIDASI',
  rasio: 91.7,
  hadir: 11,
  izin: 1,
  izinDetail: '1 Pertemuan Izin (P5)',
  alpa: 0,
  kelayakanText: 'SYARAT UJIAN TERPENUHI (≥70%)',
  sessions: [
    {
      pertemuan: 1,
      topik: 'P1 • Kontrak Kuliah',
      status: 'HADIR',
      deskripsi: 'Pengantar RPL, Silabus, dan Pembagian Kelompok Tugas Besar',
      waktu: '08:12 WIB',
      catatan: 'QR Presensi Valid',
    },
    {
      pertemuan: 2,
      topik: 'P2 • SDLC Models',
      status: 'HADIR',
      deskripsi: 'Waterfall vs Agile: Scrum Framework, Kanban, and Sprint Planning',
      waktu: '08:05 WIB',
      catatan: 'QR Presensi Valid',
    },
    {
      pertemuan: 3,
      topik: 'P3 • Kebutuhan Sistem',
      status: 'HADIR',
      deskripsi: 'Requirement Engineering: SRS Document IEEE Std 830-1998',
      waktu: '08:18 WIB',
      catatan: 'QR Presensi Valid',
    },
    {
      pertemuan: 4,
      topik: 'P4 • UML Modeling 1',
      status: 'HADIR',
      deskripsi: 'Use Case Diagram & Activity Diagram dalam perancangan modul user',
      waktu: '08:10 WIB',
      catatan: 'QR Presensi Valid',
    },
    {
      pertemuan: 5,
      topik: 'P5 • UML Modeling 2',
      status: 'IZIN RESMI',
      deskripsi: 'Class Diagram, Sequence Diagram, State Machine (Dispensasi Lomba)',
      waktu: 'Surat No. 104/HMP/TI',
      catatan: 'Disetujui Dosen',
      borderHighlight: true,
    },
    {
      pertemuan: 6,
      topik: 'P6 • Arsitektur Sistem',
      status: 'HADIR',
      deskripsi: 'Monolith vs Microservices & RESTful API Specification',
      waktu: '08:02 WIB',
      catatan: 'QR Presensi Valid',
    },
    {
      pertemuan: 7,
      topik: 'P7 • Review Pra-UTS',
      status: 'HADIR',
      deskripsi: 'Presentasi SRS Tim & Validasi Milestone Tahap 1 Proyek Perangkat Lunak',
      waktu: '08:14 WIB',
      catatan: 'QR Presensi Valid',
    },
    {
      pertemuan: 8,
      topik: 'P8 • Evaluasi UTS',
      status: 'HADIR & SUBMIT',
      deskripsi: 'Ujian Tengah Semester: Uji Teori & Desain Dokumen Arsitektur Perangkat Lunak',
      waktu: 'Skor: 88.5/100',
      catatan: 'Lulus Ambang UTS',
      isUts: true,
    },
    {
      pertemuan: 9,
      topik: 'P9 • Pengujian Blackbox',
      status: 'HADIR',
      deskripsi: 'Equivalence Partitioning & Boundary Value Analysis (BVA)',
      waktu: '08:20 WIB',
      catatan: 'QR Presensi Valid',
    },
    {
      pertemuan: 10,
      topik: 'P10 • Pengujian Whitebox',
      status: 'HADIR',
      deskripsi: 'Basis Path Testing & Cyclomatic Complexity Analysis',
      waktu: '08:11 WIB',
      catatan: 'QR Presensi Valid',
    },
    {
      pertemuan: 11,
      topik: 'P11 • CI/CD & DevOps',
      status: 'HADIR',
      deskripsi: 'Automated Testing Pipeline via GitHub Actions & Docker Build',
      waktu: '08:08 WIB',
      catatan: 'QR Presensi Valid',
    },
    {
      pertemuan: 12,
      topik: 'P12 • Manajemen Rilis',
      status: 'HADIR',
      deskripsi: 'Semantic Versioning, Rollback Strategy, dan Dokumentasi Deployment',
      waktu: '08:15 WIB',
      catatan: 'QR Presensi Valid',
    },
  ],
};

function renderStatusCell(status, isUts = false, isUas = false) {
  if (status === null || status === undefined) {
    const bgClass = isUas
      ? 'bg-error-container/10'
      : isUts
      ? 'bg-secondary-container/10'
      : '';
    return (
      <td className={`p-1 text-center ${bgClass}`}>
        <div className="w-7 h-7 mx-auto rounded bg-surface-container text-outline flex items-center justify-center text-caption select-none">
          —
        </div>
      </td>
    );
  }

  const bgHighlight = isUts ? 'bg-secondary-container/10' : '';

  if (status === 'H') {
    return (
      <td className={`p-1 text-center ${bgHighlight}`}>
        <div
          className="w-7 h-7 mx-auto rounded bg-tertiary-container/80 text-on-tertiary flex items-center justify-center"
          title="Hadir (100%)"
        >
          <span className="material-symbols-outlined text-[15px]">check</span>
        </div>
      </td>
    );
  }

  if (status === 'S') {
    return (
      <td className={`p-1 text-center ${bgHighlight}`}>
        <div
          className="w-7 h-7 mx-auto rounded bg-primary-container/80 text-on-primary-container flex items-center justify-center font-bold text-caption"
          title="Sakit"
        >
          S
        </div>
      </td>
    );
  }

  if (status === 'I') {
    return (
      <td className={`p-1 text-center ${bgHighlight}`}>
        <div
          className="w-7 h-7 mx-auto rounded bg-secondary-container/80 text-on-secondary-container flex items-center justify-center font-bold text-caption"
          title="Izin"
        >
          I
        </div>
      </td>
    );
  }

  if (status === 'A') {
    return (
      <td className={`p-1 text-center ${bgHighlight}`}>
        <div
          className="w-7 h-7 mx-auto rounded bg-error/90 text-on-error flex items-center justify-center"
          title="Alpa (Tanpa Keterangan)"
        >
          <span className="material-symbols-outlined text-[15px]">close</span>
        </div>
      </td>
    );
  }

  return (
    <td className="p-1 text-center">
      <div className="w-7 h-7 mx-auto rounded bg-surface-container text-outline flex items-center justify-center text-caption">
        —
      </div>
    </td>
  );
}

export default function RekapKehadiran() {
  const [activeView, setActiveView] = useState('dosen');
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const counts = useMemo(() => {
    let safe = 0;
    let risk = 0;
    MATRIX_STUDENTS.forEach((s) => {
      if (s.status === 'safe') safe++;
      else if (s.status === 'risk') risk++;
    });
    return { total: MATRIX_STUDENTS.length, safe, risk };
  }, []);

  const filteredStudents = useMemo(() => {
    let list = [...MATRIX_STUDENTS];

    if (filterStatus !== 'all') {
      list = list.filter((s) => s.status === filterStatus);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (s) => s.nama.toLowerCase().includes(q) || s.nim.toLowerCase().includes(q)
      );
    }

    return list;
  }, [filterStatus, searchQuery]);

  return (
    <div className="flex flex-col w-full gap-space-lg text-on-surface">
      {/* TOP CONTEXT CONTROLLER & VIEW SWITCHER */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-space-md bg-surface-container-low p-space-md rounded-xl shadow-md">
        <div className="flex flex-col gap-space-xs">
          <div className="flex items-center gap-2 font-caption text-caption text-on-surface-variant flex-wrap">
            <span className="hover:text-primary cursor-pointer transition-colors">Dasbor</span>
            <span className="material-symbols-outlined text-[13px] text-outline">chevron_right</span>
            <span className="hover:text-primary cursor-pointer transition-colors">Kelas Diampu</span>
            <span className="material-symbols-outlined text-[13px] text-outline">chevron_right</span>
            <span className="hover:text-primary cursor-pointer transition-colors">
              {CLASS_INFO.labelLengkap}
            </span>
            <span className="material-symbols-outlined text-[13px] text-outline">chevron_right</span>
            <span className="text-secondary font-label-sm">Rekap Kehadiran</span>
          </div>
          <div className="flex items-center gap-space-sm mt-0.5">
            <div className="w-2.5 h-2.5 rounded-full bg-tertiary animate-pulse" />
            <span className="font-body-sm text-body-sm text-on-surface-variant">
              Siklus Berjalan Semester {CLASS_INFO.semester} • {CLASS_INFO.sks}
            </span>
          </div>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-surface-container rounded-lg self-start xl:self-auto shadow-inner">
          <button
            onClick={() => setActiveView('dosen')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-md font-label-md text-label-md transition-all ${
              activeView === 'dosen'
                ? 'bg-primary text-on-primary shadow-sm font-semibold'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
            type="button"
          >
            <span className="material-symbols-outlined text-[18px]">group</span>
            <span>Tampilan Dosen (Matriks Kelas {CLASS_INFO.totalMahasiswa} Mhs)</span>
          </button>
          <button
            onClick={() => setActiveView('mhs')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-md font-label-md text-label-md transition-all ${
              activeView === 'mhs'
                ? 'bg-primary text-on-primary shadow-sm font-semibold'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
            type="button"
          >
            <span className="material-symbols-outlined text-[18px]">person</span>
            <span>Tampilan Mahasiswa (Personal Dimas)</span>
          </button>
        </div>
      </div>

      {/* HEADER ACTION STRIP */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-space-md">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight font-bold">
              Rekapitulasi Kehadiran Kelas
            </h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-surface-container-high text-secondary font-label-sm text-label-sm">
              <span className="material-symbols-outlined text-[14px]">auto_stories</span>{' '}
              {CLASS_INFO.rombel} (RPL)
            </span>
          </div>
          <p className="font-body-md text-body-md text-on-surface-variant">
            Pertemuan yang telah diselenggarakan:{' '}
            <strong className="text-on-surface font-title-md">
              {CLASS_INFO.pertemuanSelesai} dari {CLASS_INFO.totalPertemuan}
            </strong>{' '}
            pertemuan tatap muka dan evaluasi terjadwal.
          </p>
        </div>

        <div className="flex items-center gap-space-sm flex-wrap shrink-0">
          <div className="relative">
            <button
              className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md text-label-md transition-colors shadow-sm"
              type="button"
            >
              <span className="material-symbols-outlined text-primary text-[18px]">category</span>
              <span>{CLASS_INFO.labelLengkap}</span>
              <span className="material-symbols-outlined text-[16px] text-outline">expand_more</span>
            </button>
          </div>

          <div className="relative group">
            <button
              disabled
              className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-surface-container text-outline opacity-60 cursor-not-allowed font-label-md text-label-md"
              type="button"
            >
              <span className="material-symbols-outlined text-[18px]">download_for_offline</span>
              <span>Unduh Rekap Spreadsheet</span>
            </button>
            <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 hidden group-hover:flex items-center gap-1 px-2.5 py-1 rounded bg-surface-bright text-on-surface font-caption text-caption shadow-xl whitespace-nowrap z-30 pointer-events-none">
              <span className="material-symbols-outlined text-[13px] text-secondary">info</span>
              <span>Ekspor tersedia pada MVP 5</span>
            </div>
          </div>
        </div>
      </div>

      {/* KPI STRIP */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-space-md">
        <div className="p-space-md rounded-xl bg-surface-container-low shadow-sm flex flex-col justify-between relative overflow-hidden group hover:bg-surface-container transition-colors">
          <div className="absolute -right-3 -top-3 w-20 h-20 bg-primary/10 rounded-full blur-xl pointer-events-none" />
          <div className="flex items-center justify-between gap-space-xs">
            <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant">
              Rata-rata Kehadiran Kelas
            </span>
            <div className="w-9 h-9 rounded-lg bg-primary/15 flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-[20px]">analytics</span>
            </div>
          </div>
          <div className="mt-space-sm space-y-1">
            <div className="font-headline-lg text-headline-lg text-on-surface font-bold tracking-tight">
              {KPI_DATA.rataRata}%
            </div>
            <div className="flex items-center gap-1.5 font-caption text-caption text-tertiary">
              <span className="material-symbols-outlined text-[14px]">trending_up</span>
              <span>{KPI_DATA.trenPekanLalu}</span>
            </div>
          </div>
          <div className="mt-3 pt-2">
            <svg className="w-full h-7 text-primary" fill="none" viewBox="0 0 160 28">
              <path
                d="M0 22L18 20L36 16L54 18L72 12L90 14L108 9L126 11L144 6L160 5"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
              />
              <path
                d="M0 22L18 20L36 16L54 18L72 12L90 14L108 9L126 11L144 6L160 5V28H0Z"
                fill="currentColor"
                fillOpacity="0.08"
              />
            </svg>
          </div>
        </div>

        <div className="p-space-md rounded-xl bg-surface-container-low shadow-sm flex flex-col justify-between relative overflow-hidden group hover:bg-surface-container transition-colors">
          <div className="absolute -right-3 -top-3 w-20 h-20 bg-tertiary/10 rounded-full blur-xl pointer-events-none" />
          <div className="flex items-center justify-between gap-space-xs">
            <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant">
              Memenuhi Ambang (≥ 70%)
            </span>
            <div className="w-9 h-9 rounded-lg bg-tertiary-container/20 flex items-center justify-center text-tertiary">
              <span className="material-symbols-outlined text-[20px]">verified</span>
            </div>
          </div>
          <div className="mt-space-sm space-y-1">
            <div className="font-headline-lg text-headline-lg text-tertiary font-bold tracking-tight">
              {KPI_DATA.memenuhiAmbang}{' '}
              <span className="text-on-surface-variant text-title-md font-body-md font-normal">
                / {KPI_DATA.totalSiswa} Mahasiswa
              </span>
            </div>
            <div className="font-caption text-caption text-on-surface-variant">
              {KPI_DATA.persenMemenuhi}% mahasiswa memenuhi syarat kelayakan ujian
            </div>
          </div>
          <div className="mt-3 pt-2">
            <div className="w-full bg-surface-container-highest rounded-full h-2 overflow-hidden">
              <div
                className="bg-tertiary h-2 rounded-full transition-all duration-700"
                style={{ width: `${KPI_DATA.persenMemenuhi}%` }}
              />
            </div>
          </div>
        </div>

        <div className="p-space-md rounded-xl bg-surface-container-low shadow-sm flex flex-col justify-between relative overflow-hidden group hover:bg-surface-container transition-colors">
          <div className="absolute -right-3 -top-3 w-20 h-20 bg-error/15 rounded-full blur-xl pointer-events-none" />
          <div className="flex items-center justify-between gap-space-xs">
            <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant">
              Butuh Perhatian (&lt; 70%)
            </span>
            <div className="w-9 h-9 rounded-lg bg-error-container/40 flex items-center justify-center text-error">
              <span className="material-symbols-outlined text-[20px]">warning</span>
            </div>
          </div>
          <div className="mt-space-sm space-y-1">
            <div className="font-headline-lg text-headline-lg text-error font-bold tracking-tight">
              {KPI_DATA.butuhPerhatian}{' '}
              <span className="text-on-surface-variant text-title-md font-body-md font-normal">
                / {KPI_DATA.totalSiswa} Mahasiswa
              </span>
            </div>
            <div className="font-caption text-caption text-error">
              Beresiko terkunci pada evaluasi ujian UTS/UAS
            </div>
          </div>
          <div className="mt-3 pt-2">
            <div className="w-full bg-surface-container-highest rounded-full h-2 overflow-hidden">
              <div
                className="bg-error h-2 rounded-full transition-all duration-700"
                style={{ width: `${KPI_DATA.persenPerhatian}%` }}
              />
            </div>
          </div>
        </div>

        <div className="p-space-md rounded-xl bg-surface-container-low shadow-sm flex flex-col justify-between relative overflow-hidden group hover:bg-surface-container transition-colors">
          <div className="absolute -right-3 -top-3 w-20 h-20 bg-secondary/10 rounded-full blur-xl pointer-events-none" />
          <div className="flex items-center justify-between gap-space-xs">
            <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant">
              Sesi Pertemuan
            </span>
            <div className="w-9 h-9 rounded-lg bg-secondary-container/20 flex items-center justify-center text-secondary">
              <span className="material-symbols-outlined text-[20px]">calendar_month</span>
            </div>
          </div>
          <div className="mt-space-sm space-y-1">
            <div className="font-headline-lg text-headline-lg text-secondary font-bold tracking-tight">
              {KPI_DATA.sesiSelesai}{' '}
              <span className="text-on-surface-variant text-title-md font-body-md font-normal">
                / {KPI_DATA.totalSesi} Sesi Selesai
              </span>
            </div>
            <div className="font-caption text-caption text-on-surface-variant">
              P1 s/d P12 ditutup • 4 Sesi mendatang tersisa
            </div>
          </div>
          <div className="mt-3 pt-2">
            <div className="w-full bg-surface-container-highest rounded-full h-2 overflow-hidden">
              <div
                className="bg-secondary h-2 rounded-full transition-all duration-700"
                style={{ width: `${KPI_DATA.persenSesi}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* INFORMATIONAL NOTE BANNER (BR-012) */}
      <div className="flex items-start gap-space-md p-space-md rounded-xl bg-surface-container-low shadow-sm relative overflow-hidden">
        <div className="w-1.5 absolute left-0 top-0 bottom-0 bg-secondary" />
        <div className="w-9 h-9 rounded-lg bg-secondary/15 flex items-center justify-center shrink-0 text-secondary mt-0.5">
          <span className="material-symbols-outlined text-[22px]">verified_user</span>
        </div>
        <div className="space-y-1 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-title-md text-title-md text-on-surface font-semibold">
              Aturan Bisnis Kelayakan Evaluasi Akademik (BR-012)
            </span>
            <span className="px-2 py-0.5 rounded bg-surface-container-high text-primary font-caption text-caption">
              SOP Akademik UPGRIS
            </span>
          </div>
          <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
            Ambang batas kehadiran minimum{' '}
            <strong className="text-on-surface">{CLASS_INFO.ambangBatas}%</strong> diberlakukan
            sebagai syarat gerbang pembukaan akses pengerjaan soal pada tahap evaluasi{' '}
            <strong className="text-secondary">UTS (Pertemuan 8)</strong> dan{' '}
            <strong className="text-secondary">UAS (Pertemuan 16)</strong>. Sesi P13–P16 masih dalam
            jadwal berjalan, mahasiswa dalam zona peringatan dapat memulihkan rasio kehadiran sebelum
            batas UAS terkunci.
          </p>
        </div>
      </div>

      {/* VIEW 1: DOSEN ATTENDANCE MATRIX */}
      {activeView === 'dosen' ? (
        <div className="flex flex-col gap-space-md" id="view-dosen">
          <div className="bg-surface-container-lowest rounded-xl p-space-md shadow-2xl flex flex-col gap-space-md">
            {/* Filter toolbar */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-space-md pb-space-sm">
              <div className="flex items-center gap-1.5 bg-surface-container-low p-1 rounded-lg self-start">
                <button
                  onClick={() => setFilterStatus('all')}
                  className={`px-3 py-1.5 rounded-md font-label-sm text-label-sm transition-all shadow-sm ${
                    filterStatus === 'all'
                      ? 'bg-primary-container text-on-primary-container font-semibold'
                      : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                  type="button"
                >
                  Semua Mahasiswa ({counts.total})
                </button>
                <button
                  onClick={() => setFilterStatus('safe')}
                  className={`px-3 py-1.5 rounded-md font-label-sm text-label-sm transition-all shadow-sm ${
                    filterStatus === 'safe'
                      ? 'bg-tertiary-container text-on-tertiary font-semibold'
                      : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                  type="button"
                >
                  Aman ≥ 70% ({counts.safe})
                </button>
                <button
                  onClick={() => setFilterStatus('risk')}
                  className={`px-3 py-1.5 rounded-md font-label-sm text-label-sm transition-all shadow-sm ${
                    filterStatus === 'risk'
                      ? 'bg-error text-on-error font-semibold'
                      : 'text-error hover:bg-error-container/30'
                  }`}
                  type="button"
                >
                  Beresiko &lt; 70% ({counts.risk})
                </button>
              </div>

              <div className="flex items-center gap-space-sm flex-1 max-w-sm">
                <div className="relative w-full">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[18px]">
                    search
                  </span>
                  <input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-surface-container text-on-surface placeholder:text-outline font-body-sm text-body-sm rounded-lg pl-9 pr-4 py-2 focus:outline-none focus:ring-1 focus:ring-primary transition-all"
                    placeholder="Cari nama atau NIM mahasiswa..."
                    type="text"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface"
                      type="button"
                    >
                      <span className="material-symbols-outlined text-[16px]">close</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Matrix Table */}
            <div className="relative overflow-x-auto rounded-lg shadow-inner bg-surface-container-low">
              <table className="w-full text-left border-collapse" id="attendance-table">
                <thead>
                  <tr className="bg-surface-container-high text-on-surface text-caption font-caption uppercase tracking-wider select-none">
                    <th className="sticky left-0 z-20 bg-surface-container-high py-3.5 px-3 text-center w-12 shadow-[2px_0_5px_rgba(0,0,0,0.15)]" scope="col">
                      No
                    </th>
                    <th className="sticky left-12 z-20 bg-surface-container-high py-3.5 px-4 min-w-[220px] shadow-[2px_0_5px_rgba(0,0,0,0.15)]" scope="col">
                      Nama Mahasiswa
                    </th>
                    <th className="sticky left-[268px] z-20 bg-surface-container-high py-3.5 px-3 min-w-[110px] shadow-[2px_0_5px_rgba(0,0,0,0.15)]" scope="col">
                      NIM
                    </th>
                    <th className="p-2 text-center w-[38px] font-title-md text-on-surface-variant" scope="col" title="Pertemuan 1">P1</th>
                    <th className="p-2 text-center w-[38px] font-title-md text-on-surface-variant" scope="col" title="Pertemuan 2">P2</th>
                    <th className="p-2 text-center w-[38px] font-title-md text-on-surface-variant" scope="col" title="Pertemuan 3">P3</th>
                    <th className="p-2 text-center w-[38px] font-title-md text-on-surface-variant" scope="col" title="Pertemuan 4">P4</th>
                    <th className="p-2 text-center w-[38px] font-title-md text-on-surface-variant" scope="col" title="Pertemuan 5">P5</th>
                    <th className="p-2 text-center w-[38px] font-title-md text-on-surface-variant" scope="col" title="Pertemuan 6">P6</th>
                    <th className="p-2 text-center w-[38px] font-title-md text-on-surface-variant" scope="col" title="Pertemuan 7">P7</th>
                    <th className="p-2 text-center w-[54px] bg-secondary-container/20 text-secondary font-bold font-title-md" scope="col" title="Ujian Tengah Semester">P8 (UTS)</th>
                    <th className="p-2 text-center w-[38px] font-title-md text-on-surface-variant" scope="col" title="Pertemuan 9">P9</th>
                    <th className="p-2 text-center w-[38px] font-title-md text-on-surface-variant" scope="col" title="Pertemuan 10">P10</th>
                    <th className="p-2 text-center w-[38px] font-title-md text-on-surface-variant" scope="col" title="Pertemuan 11">P11</th>
                    <th className="p-2 text-center w-[38px] font-title-md text-on-surface-variant" scope="col" title="Pertemuan 12">P12</th>
                    <th className="p-2 text-center w-[38px] font-title-md text-outline" scope="col" title="Pertemuan 13 (Mendatang)">P13</th>
                    <th className="p-2 text-center w-[38px] font-title-md text-outline" scope="col" title="Pertemuan 14 (Mendatang)">P14</th>
                    <th className="p-2 text-center w-[38px] font-title-md text-outline" scope="col" title="Pertemuan 15 (Mendatang)">P15</th>
                    <th className="p-2 text-center w-[54px] bg-error-container/30 text-error font-bold font-title-md" scope="col" title="Ujian Akhir Semester">P16 (UAS)</th>
                    <th className="py-3.5 px-3 text-center min-w-[70px]" scope="col">Hadir</th>
                    <th className="py-3.5 px-3 text-center min-w-[80px]" scope="col">S / I / A</th>
                    <th className="py-3.5 px-3 text-center min-w-[80px]" scope="col">Rasio</th>
                    <th className="sticky right-0 z-20 bg-surface-container-high py-3.5 px-4 text-center min-w-[160px] shadow-[-2px_0_5px_rgba(0,0,0,0.15)]" scope="col">Kelayakan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-container font-body-sm text-body-sm text-on-surface">
                  {filteredStudents.map((student, idx) => {
                    const isRisk = student.status === 'risk';
                    const rowBg = isRisk
                      ? 'bg-error-container/15 hover:bg-error-container/25'
                      : 'hover:bg-surface-container/60';

                    return (
                      <tr key={student.id} className={`${rowBg} transition-colors student-row`}>
                        <td className={`sticky left-0 z-10 bg-surface-container-low py-3 px-3 text-center font-label-sm ${isRisk ? 'text-error font-bold' : 'text-outline'}`}>
                          {idx + 1}
                        </td>
                        <td className="sticky left-12 z-10 bg-surface-container-low py-3 px-4 font-label-md text-label-md">
                          <div className="flex items-center gap-2.5">
                            <div className={`w-7 h-7 rounded-full ${student.avatarBg} ${student.avatarText} flex items-center justify-center font-bold text-caption shrink-0`}>
                              {student.inisial}
                            </div>
                            <span
                              onClick={() => setActiveView('mhs')}
                              className={`truncate font-medium cursor-pointer hover:underline ${isRisk ? 'text-error' : 'text-on-surface'}`}
                              title="Klik untuk detail personal"
                            >
                              {student.nama}
                            </span>
                            {student.verified && (
                              <span className="material-symbols-outlined text-tertiary text-[14px]">check_circle</span>
                            )}
                            {student.warning && (
                              <span className="material-symbols-outlined text-error text-[14px]">priority_high</span>
                            )}
                          </div>
                        </td>
                        <td className={`sticky left-[268px] z-10 bg-surface-container-low py-3 px-3 font-mono font-label-sm ${isRisk ? 'text-error' : 'text-secondary'}`}>
                          {student.nim}
                        </td>
                        {student.sessions.slice(0, 7).map((s, i) => (
                          <span key={i} className="contents">{renderStatusCell(s)}</span>
                        ))}
                        {renderStatusCell(student.sessions[7], true, false)}
                        {student.sessions.slice(8, 12).map((s, i) => (
                          <span key={i} className="contents">{renderStatusCell(s)}</span>
                        ))}
                        {student.sessions.slice(12, 15).map((s, i) => (
                          <span key={i} className="contents">{renderStatusCell(s)}</span>
                        ))}
                        {renderStatusCell(student.sessions[15], false, true)}
                        <td className={`p-3 text-center font-bold ${isRisk ? 'text-error' : 'text-on-surface'}`}>
                          {student.hadir}
                        </td>
                        <td className={`p-3 text-center font-caption ${isRisk ? 'text-error' : 'text-on-surface-variant'}`}>
                          {student.sakit} / {student.izin} / {student.alpa}
                        </td>
                        <td className={`p-3 text-center font-mono font-bold ${isRisk ? 'text-error' : 'text-tertiary'}`}>
                          {student.rasio}%
                        </td>
                        <td className="sticky right-0 z-10 bg-surface-container-low p-2 text-center">
                          {student.kelayakanType === 'risk' ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-error-container/60 text-error font-label-sm text-caption font-bold animate-pulse">
                              <span className="material-symbols-outlined text-[12px]">warning</span> Terancam Gagal
                            </span>
                          ) : student.kelayakanType === 'perfect' ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-tertiary/15 text-tertiary font-label-sm text-caption font-semibold">
                              <span className="w-1.5 h-1.5 rounded-full bg-tertiary" /> Sempurna
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-tertiary/15 text-tertiary font-label-sm text-caption font-semibold">
                              <span className="w-1.5 h-1.5 rounded-full bg-tertiary" /> Memenuhi Syarat
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Legend Bar */}
            <div className="flex flex-wrap items-center justify-between gap-space-md pt-space-xs text-caption font-caption text-on-surface-variant">
              <div className="flex flex-wrap items-center gap-space-md">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded bg-tertiary-container text-on-tertiary flex items-center justify-center font-bold text-[11px]">
                    <span className="material-symbols-outlined text-[13px]">check</span>
                  </div>
                  <span>Hadir (Bobot 100%)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded bg-primary-container text-on-primary-container flex items-center justify-center font-bold text-[11px]">
                    S
                  </div>
                  <span>Sakit (Dispensasi Dokter)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded bg-secondary-container text-on-secondary-container flex items-center justify-center font-bold text-[11px]">
                    I
                  </div>
                  <span>Izin (Dispensasi Resmi)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded bg-error text-on-error flex items-center justify-center font-bold text-[11px]">
                    <span className="material-symbols-outlined text-[13px]">close</span>
                  </div>
                  <span>Alpa (Tanpa Keterangan)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded bg-surface-container text-outline flex items-center justify-center text-[11px]">
                    —
                  </div>
                  <span>Belum Diselenggarakan</span>
                </div>
              </div>
              <div className="flex items-center gap-1 text-outline">
                <span className="material-symbols-outlined text-[14px]">touch_app</span>
                <span>Geser horizontal untuk seluruh 16 pertemuan</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* VIEW 2: MAHASISWA PERSONAL RECAP */
        <div className="flex flex-col gap-space-lg" id="view-mhs">
          <div className="p-space-lg rounded-xl bg-surface-container-low shadow-xl flex flex-col lg:flex-row items-center justify-between gap-space-xl relative overflow-hidden">
            <div className="absolute right-0 top-0 bottom-0 w-80 bg-gradient-to-l from-primary/10 via-primary/5 to-transparent pointer-events-none" />
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-space-md text-center sm:text-left z-10">
              <div className="relative">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-container to-secondary-container p-0.5 shadow-lg">
                  <div className="w-full h-full rounded-2xl bg-surface-container-lowest flex items-center justify-center text-primary font-headline-lg font-bold">
                    {STUDENT_PERSONAL_DATA.inisial}
                  </div>
                </div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-tertiary flex items-center justify-center text-on-tertiary shadow">
                  <span className="material-symbols-outlined text-[14px] font-bold">verified</span>
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 justify-center sm:justify-start">
                  <span className="px-2 py-0.5 rounded-full bg-surface-container-high text-tertiary font-label-sm text-caption">
                    {STUDENT_PERSONAL_DATA.krsStatus}
                  </span>
                  <span className="font-mono text-secondary text-caption">
                    NIM: {STUDENT_PERSONAL_DATA.nim}
                  </span>
                </div>
                <h2 className="font-headline-md text-headline-md text-on-surface font-bold">
                  {STUDENT_PERSONAL_DATA.nama}
                </h2>
                <p className="font-body-md text-body-md text-on-surface-variant">
                  {STUDENT_PERSONAL_DATA.prodi}
                </p>
                <div className="pt-1 flex items-center gap-3 text-caption font-caption text-outline justify-center sm:justify-start">
                  <span>Dosen PA: {STUDENT_PERSONAL_DATA.dosenPA}</span>
                  <span>•</span>
                  <span className="text-tertiary">
                    Status Presensi Terkini: {STUDENT_PERSONAL_DATA.statusPresensi}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-space-lg z-10 shrink-0">
              <div className="relative w-28 h-28 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                  <circle
                    className="text-surface-container-high"
                    cx="50"
                    cy="50"
                    fill="none"
                    r="40"
                    stroke="currentColor"
                    strokeWidth="8"
                  />
                  <circle
                    className="text-tertiary"
                    cx="50"
                    cy="50"
                    fill="none"
                    r="40"
                    stroke="currentColor"
                    strokeDasharray="251.32"
                    strokeDashoffset="20.85"
                    strokeLinecap="round"
                    strokeWidth="8"
                  />
                </svg>
                <div className="absolute flex flex-col items-center justify-center text-center">
                  <span className="font-headline-md text-headline-md font-bold text-on-surface font-mono">
                    {STUDENT_PERSONAL_DATA.rasio}%
                  </span>
                  <span className="font-caption text-caption text-outline">Rasio</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-tertiary" />
                  <span className="font-label-md text-label-md text-on-surface">
                    {STUDENT_PERSONAL_DATA.hadir} Pertemuan Hadir
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-secondary-container" />
                  <span className="font-label-md text-label-md text-on-surface-variant">
                    {STUDENT_PERSONAL_DATA.izinDetail}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-error" />
                  <span className="font-label-md text-label-md text-on-surface-variant">
                    {STUDENT_PERSONAL_DATA.alpa} Alpa / Tanpa Keterangan
                  </span>
                </div>
                <div className="pt-1">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-tertiary/15 text-tertiary font-label-sm text-caption font-bold">
                    <span className="material-symbols-outlined text-[15px]">check_circle</span>
                    {STUDENT_PERSONAL_DATA.kelayakanText}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Session Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-space-md">
            {STUDENT_PERSONAL_DATA.sessions.map((session) => {
              if (session.isUts) {
                return (
                  <div
                    key={session.pertemuan}
                    className="p-space-md rounded-xl bg-secondary-container/15 shadow-sm flex flex-col justify-between gap-space-sm relative group hover:bg-secondary-container/20 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-title-md text-title-md text-secondary font-bold">
                        {session.topik}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-tertiary-container/30 text-tertiary font-caption text-caption font-bold">
                        {session.status}
                      </span>
                    </div>
                    <p className="font-caption text-caption text-on-surface-variant">{session.deskripsi}</p>
                    <div className="flex items-center justify-between pt-2 text-caption text-outline font-caption">
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">task_alt</span>
                        {session.waktu}
                      </span>
                      <span className="text-secondary font-bold">{session.catatan}</span>
                    </div>
                  </div>
                );
              }

              if (session.borderHighlight) {
                return (
                  <div
                    key={session.pertemuan}
                    className="p-space-md rounded-xl bg-surface-container-low shadow-sm flex flex-col justify-between gap-space-sm relative group hover:bg-surface-container transition-colors border-l-4 border-secondary-container"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-title-md text-title-md text-on-surface font-bold">
                        {session.topik}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-secondary-container/30 text-secondary font-caption text-caption font-bold">
                        {session.status}
                      </span>
                    </div>
                    <p className="font-caption text-caption text-on-surface-variant">{session.deskripsi}</p>
                    <div className="flex items-center justify-between pt-2 text-caption text-outline font-caption">
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">verified</span>
                        {session.waktu}
                      </span>
                      <span className="text-secondary">{session.catatan}</span>
                    </div>
                  </div>
                );
              }

              return (
                <div
                  key={session.pertemuan}
                  className="p-space-md rounded-xl bg-surface-container-low shadow-sm flex flex-col justify-between gap-space-sm relative group hover:bg-surface-container transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-title-md text-title-md text-on-surface font-bold">
                      {session.topik}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-tertiary-container/30 text-tertiary font-caption text-caption font-bold">
                      {session.status}
                    </span>
                  </div>
                  <p className="font-caption text-caption text-on-surface-variant">{session.deskripsi}</p>
                  <div className="flex items-center justify-between pt-2 text-caption text-outline font-caption">
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">schedule</span>
                      {session.waktu}
                    </span>
                    <span className="text-tertiary">{session.catatan}</span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-space-md rounded-xl bg-surface-container flex flex-col sm:flex-row items-center justify-between gap-space-md text-caption font-caption text-on-surface-variant">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary text-[16px]">sync</span>
              <span>
                Rekapitulasi kehadiran bersifat informatif dan diperbarui otomatis setiap kali Dosen Pengampu menutup sesi perkuliahan.
              </span>
            </div>
            <button
              onClick={() => setActiveView('dosen')}
              className="px-3 py-1.5 rounded-lg bg-surface-container-high text-on-surface font-label-sm hover:text-primary transition-colors shrink-0"
              type="button"
            >
              Kembali ke Matriks Kelas
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
