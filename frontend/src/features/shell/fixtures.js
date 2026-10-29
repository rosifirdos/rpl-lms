/**
 * features/shell/fixtures.js
 *
 * Mock data dan konfigurasi navigasi untuk App Shell SPADA LMS.
 * Termasuk skema navigasi RBAC, metrik stat cards, linimasa perkuliahan, dan daftar mata kuliah.
 */

export const navSections = [
  {
    title: 'Menu Utama',
    role: 'mahasiswa',
    items: [
      { path: 'dasbor-mahasiswa', label: 'Dasbor', icon: 'grid_view' },
      { path: 'kelas-saya', label: 'Kelas Saya', icon: 'menu_book' },
      { path: 'panduan-belajar', label: 'Panduan Belajar', icon: 'explore' },
    ],
  },
  {
    title: 'Akademik',
    role: 'shared', // shared between mahasiswa & dosen
    items: [
      { path: 'central-timeline', label: 'Central Timeline', icon: 'calendar_today' },
      { path: 'rekap-nilai-dan-presensi', label: 'Rekap Nilai & Presensi', icon: 'check_circle' },
    ],
  },
  {
    title: 'Menu Dosen',
    role: 'dosen',
    items: [
      { path: 'dasbor-dosen', label: 'Kelas Diampu', icon: 'co_present' },
      { path: 'pemeriksaan-tugas', label: 'Pemeriksaan Tugas', icon: 'assignment_turned_in' },
    ],
  },
  {
    title: 'Administrasi SPADA',
    role: 'admin',
    items: [
      { path: 'manajemen-pengguna', label: 'Manajemen Pengguna', icon: 'group' },
      { path: 'master-mata-kuliah', label: 'Master Mata Kuliah', icon: 'local_library' },
      { path: 'pembukaan-kelas', label: 'Pembukaan Kelas', icon: 'edit_calendar' },
      { path: 'jejak-audit', label: 'Jejak Audit', icon: 'security' },
      { path: 'konfigurasi-sistem', label: 'Konfigurasi Sistem', icon: 'settings' },
    ],
  },
];

export const statCards = [
  {
    id: 'active-courses',
    title: 'Kelas Aktif',
    value: '6',
    unit: 'Mata Kuliah',
    icon: 'auto_stories',
    iconBg: 'bg-primary-container/20 text-primary',
    footnote: '18 SKS Terdaftar via Direct Enrollment',
    footnoteIcon: 'done_all',
    footnoteColor: 'text-secondary',
  },
  {
    id: 'ongoing-assignments',
    title: 'Tugas Berjalan',
    value: '3',
    unit: 'Tugas Belum Selesai',
    icon: 'assignment',
    iconBg: 'bg-secondary-container/20 text-secondary',
    footnote: 'Batas Waktu Terdekat: 2 Hari Lagi',
    footnoteIcon: 'alarm',
    footnoteColor: 'text-error',
  },
  {
    id: 'spada-score',
    title: 'Rata-rata Skor SPADA',
    value: '88.50',
    unit: '/ 100.00',
    valueColor: 'text-tertiary',
    icon: 'analytics',
    iconBg: 'bg-tertiary-container/20 text-tertiary',
    footnote: 'Transparan numerik otomatis dosen',
    footnoteIcon: 'verified',
    footnoteColor: 'text-on-surface-variant',
  },
  {
    id: 'attendance-rate',
    title: 'Presensi Kehadiran',
    value: '94.2%',
    unit: 'Memenuhi Syarat',
    unitBadge: true,
    icon: 'fact_check',
    iconBg: 'bg-surface-container-highest text-primary',
    footnote: 'Syarat UTS & UAS min. 70.0% terpenuhi',
    footnoteIcon: 'check_circle',
    footnoteColor: 'text-on-surface-variant',
  },
];

export const timelineItems = [
  {
    id: 'timeline-1',
    type: 'Tugas',
    badgeBg: 'bg-error-container text-on-error-container',
    deadline: 'Batas Waktu: Jumat, 23:59 WIB',
    deadlineColor: 'text-error',
    icon: 'assignment_late',
    iconBg: 'bg-error-container/20 text-error',
    title: 'Rekayasa Perangkat Lunak',
    desc: 'Tugas 02: Analisis Kebutuhan SRS & Diagram UML Sistem Terdistribusi',
    lecturer: 'Pengampu: Dr. Supriyono, M.Kom.',
    actionText: 'Kirim Berkas',
    actionClass: 'bg-primary text-on-primary hover:opacity-90',
  },
  {
    id: 'timeline-2',
    type: 'Presensi',
    badgeBg: 'bg-tertiary-container text-on-tertiary-container',
    deadline: 'Sesi Dibuka Dosen (Berakhir 10:00 WIB)',
    deadlineColor: 'text-tertiary',
    icon: 'how_to_reg',
    iconBg: 'bg-tertiary-container/20 text-tertiary',
    title: 'Pemrograman Web Berbasis Komponen',
    desc: 'Pertemuan 4: Implementasi Modularisasi & Lifecycle Management',
    lecturer: 'Lab Komputer 302 • Kelas Reguler A',
    actionText: 'Isi Presensi Hadir',
    actionClass: 'bg-tertiary text-on-tertiary hover:opacity-90',
  },
  {
    id: 'timeline-3',
    type: 'Kuis',
    badgeBg: 'bg-secondary-container text-on-secondary-container',
    deadline: 'Dibuka Besok Pukul 09:00 WIB',
    deadlineColor: 'text-secondary',
    icon: 'quiz',
    iconBg: 'bg-secondary-container/20 text-secondary',
    title: 'Basis Data Terdistribusi',
    desc: 'Kuis Singkat Modul 3: Replikasi & Sharding Data Skala Besar',
    lecturer: 'Durasi: 30 Menit • Percobaan: 1 Kali',
    actionText: 'Terkunci',
    actionClass: 'bg-surface-container-high text-outline cursor-not-allowed',
    disabled: true,
  },
];

export const courseList = [
  {
    id: 'course-inf308',
    code: 'INF308 • 3 SKS',
    title: 'Rekayasa Perangkat Lunak',
    lecturer: 'Dosen: Dr. Supriyono, M.Kom.',
    meetingBadge: 'Pertemuan 4 dari 16',
    progressPct: 68,
    progressColor: 'bg-primary',
    progressTextColor: 'text-primary',
    statusText: 'Presensi Sempurna (4/4)',
    statusIcon: 'task_alt',
    statusColor: 'text-tertiary',
  },
  {
    id: 'course-inf312',
    code: 'INF312 • 3 SKS',
    title: 'Pemrograman Web Berbasis Komponen',
    lecturer: 'Dosen: Ir. Nina Kartika, M.T.',
    meetingBadge: 'Pertemuan 4 dari 16',
    meetingBadgeColor: 'bg-tertiary-container/20 text-tertiary',
    progressPct: 82,
    progressColor: 'bg-tertiary',
    progressTextColor: 'text-tertiary',
    statusText: '1 Tugas Menunggu Submit',
    statusIcon: 'pending_actions',
    statusColor: 'text-secondary',
  },
];

export const userFixtures = {
  mahasiswa: {
    id: 'usr-mhs-01',
    name: 'Dimas Arya Pratama',
    role: 'mahasiswa',
    identifier: 'NIM: 22670014',
    sub: 'Informatika',
    initials: 'DP',
    email: 'dimas.arya@student.upgris.ac.id',
  },
  dosen: {
    id: 'usr-dsn-01',
    name: 'Dr. Awan Rosi, M.Kom.',
    role: 'dosen',
    identifier: 'NIDN: 0612345601',
    sub: 'Dosen Pengampu',
    initials: 'AR',
    email: 'awan.rosi@upgris.ac.id',
  },
  admin: {
    id: 'usr-adm-01',
    name: 'Administrator SPADA',
    role: 'admin',
    identifier: 'NIP: 19880101',
    sub: 'Admin PTIK UPGRIS',
    initials: 'AD',
    email: 'admin.spada@upgris.ac.id',
  },
};
