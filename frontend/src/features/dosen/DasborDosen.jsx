import React, { useState, useEffect, useCallback } from 'react';
import { dosenApi } from '../../services/api';

/**
 * DasborDosen — Feature Component
 * Implementasi React untuk Dasbor Dosen SPADA LMS UPGRIS
 * Mendukung kurikulum 16 Pertemuan Terstruktur, sinkronisasi SIAKAD,
 * pengelolaan presensi, dan penilaian rubrik tugas.
 */
export default function DasborDosen({ onRoleChange }) {
  const [activeMenu, setActiveMenu] = useState('dasbor-dosen');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMessage, setToastMessage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [teachingMetrics, setTeachingMetrics] = useState([]);
  const [classList, setClassList] = useState([]);
  const [pendingGrading, setPendingGrading] = useState([]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [metricsRes, classesRes, gradingRes] = await Promise.all([
        dosenApi.getDashboardMetrics().catch(() => ({ data: null })),
        dosenApi.getMyClasses().catch(() => ({ data: null })),
        dosenApi.getPendingGrading().catch(() => ({ data: null })),
      ]);

      // Transform metrics if available
      if (metricsRes.data) {
        setTeachingMetrics(metricsRes.data);
      }

      // Transform classes if available
      if (classesRes.data?.items) {
        setClassList(classesRes.data.items.map((cls, idx) => ({
          code: cls.code || `MK-${idx + 1}`,
          title: cls.name || cls.course?.name || 'Mata Kuliah',
          sks: `Bobot ${cls.course?.credits || 3} SKS • ${cls.course?.is_active ? 'Aktif' : 'Nonaktif'}`,
          badge: cls.is_active ? 'Sesi Presensi Aktif' : 'Tidak Aktif',
          badgeType: cls.is_active ? 'active' : 'inactive',
          alarm: cls.schedule ? `${cls.schedule.day}, ${cls.schedule.start_time} - ${cls.schedule.end_time} WIB` : 'Jadwal belum ditentukan',
          room: cls.room || 'Ruang belum ditentukan',
          currentMeeting: `Pertemuan ${cls.current_meeting || 1} dari 16`,
          progressPct: cls.progress_pct || Math.min(100, ((cls.current_meeting || 1) / 16) * 100),
          students: `${cls.enrolled_count || 0}/${cls.capacity || 0} Kuota (${cls.capacity ? Math.round((cls.enrolled_count || 0) / cls.capacity * 100) : 0}%)`,
          studentsPct: cls.capacity ? Math.round((cls.enrolled_count || 0) / cls.capacity * 100) : 0,
          quotaColor: cls.capacity && (cls.enrolled_count || 0) / cls.capacity >= 1 ? 'bg-tertiary' : 'bg-secondary',
          btnPresensiText: cls.is_active ? 'Kelola Presensi' : 'Jadwal Presensi',
          btnPresensiIcon: cls.is_active ? 'how_to_reg' : 'calendar_month',
        })));
      }

      // Transform grading if available
      if (gradingRes.data?.items) {
        setPendingGrading(gradingRes.data.items);
      }
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
      setError('Gagal memuat data dasbor');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const navMenuItems = [
    {
      group: 'Main Menu',
      items: [
        { id: 'dasbor-dosen', icon: 'space_dashboard', label: 'Dasbor Dosen' },
        { id: 'kelas-diampu', icon: 'class', label: 'Kelas Diampu' },
        { id: 'panduan-dosen', icon: 'menu_book', label: 'Panduan Dosen' },
      ],
    },
    {
      group: 'Akademik',
      items: [
        { id: 'central-timeline-jadwal', icon: 'calendar_clock', label: 'Central Timeline & Jadwal' },
        { id: 'pemeriksaan-tugas-skor', icon: 'assignment_turned_in', label: 'Pemeriksaan Tugas & Skor' },
        { id: 'rekap-presensi-nilai', icon: 'fact_check', label: 'Rekap Presensi & Nilai' },
      ],
    },
    {
      group: 'Manajemen Kelas',
      items: [
        { id: 'unggah-materi-ajar', icon: 'upload_file', label: 'Unggah Materi Ajar' },
        { id: 'bank-kuis-ujian', icon: 'quiz', label: 'Bank Kuis & Ujian (UTS/UAS)' },
      ],
    },
  ];

  // Default fallback metrics when API not available
  const defaultMetrics = [
    {
      title: 'Total Kelas Diampu',
      value: loading ? 'Memuat...' : '— Kelas Aktif',
      icon: 'co_present',
      iconBg: 'bg-primary-container/20 text-primary',
      subtitle: loading ? 'Mengambil data dari server...' : 'Belum ada data kelas',
      subIcon: 'domain',
      subColor: 'text-secondary',
    },
    {
      title: 'Beban SKS Semester Ini',
      value: loading ? 'Memuat...' : '— SKS',
      valColor: 'text-tertiary',
      icon: 'verified',
      iconBg: 'bg-tertiary-container/20 text-tertiary',
      subtitle: loading ? 'Mengambil data dari server...' : 'Belum ada beban SKS',
      subIcon: 'check_circle',
      subColor: 'text-on-surface-variant',
    },
    {
      title: 'Total Mahasiswa Terdaftar',
      value: loading ? 'Memuat...' : '— Mahasiswa',
      icon: 'groups',
      iconBg: 'bg-secondary-container/20 text-secondary',
      subtitle: loading ? 'Mengambil data dari server...' : 'Belum ada mahasiswa terdaftar',
      subIcon: 'how_to_reg',
      subColor: 'text-secondary-fixed',
    },
  ];

  const displayMetrics = teachingMetrics.length > 0 ? teachingMetrics : defaultMetrics;
  const displayClasses = classList.length > 0 ? classList : [];

  return (
    <div className="bg-surface font-body-md text-on-surface antialiased min-h-screen selection:bg-primary-container selection:text-on-primary">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-surface-container-highest text-on-surface px-4 py-3 rounded-xl shadow-2xl border border-primary/30 animate-bounce">
          <span className="material-symbols-outlined text-primary text-[20px]">info</span>
          <span className="font-label-md text-sm">{toastMessage}</span>
        </div>
      )}

      {/* ── Sidebar Navigasi Dosen ── */}
      <aside
        className={`fixed left-0 top-0 h-full w-[260px] bg-surface-container-low shadow-[0_1px_8px_rgba(0,0,0,0.04)] z-50 flex flex-col justify-between transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col flex-1 overflow-y-auto">
          {/* Logo & Brand */}
          <div className="px-space-md py-space-md bg-surface-container-lowest flex items-center gap-space-sm">
            <div className="w-9 h-9 rounded-lg bg-primary-container flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-on-primary-container text-[20px]">school</span>
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className="font-title-md text-title-md text-on-surface tracking-tight truncate">
                SPADA LMS UPGRIS
              </span>
              <span className="font-caption text-caption text-secondary truncate">
                Team Membangun Negeri
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 px-space-sm py-space-md space-y-space-md">
            {navMenuItems.map((section) => (
              <div key={section.group} className="space-y-space-xs">
                <div className="px-space-sm py-space-xs font-caption text-caption uppercase tracking-wider text-outline">
                  {section.group}
                </div>
                <div className="space-y-space-xs">
                  {section.items.map((item) => {
                    const isActive = activeMenu === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setActiveMenu(item.id)}
                        className={`w-full flex items-center gap-space-sm px-space-sm py-space-sm rounded-lg transition-colors text-left font-body-md text-body-md ${
                          isActive
                            ? 'bg-primary-container text-on-primary-container font-label-md font-bold'
                            : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[18px]">{item.icon}</span>
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>
        </div>

        {/* Sidebar Footer Helpdesk */}
        <div className="p-space-md bg-surface-container space-y-space-sm">
          <a
            href="https://upt-ptik.upgris.ac.id"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-space-xs w-full py-space-sm px-space-md rounded-lg bg-surface-container-highest font-label-sm text-label-sm text-on-surface hover:bg-surface-bright hover:text-on-surface transition-colors"
          >
            <span className="material-symbols-outlined text-[16px] text-secondary">support_agent</span>
            <span>IT Helpdesk</span>
          </a>
          <div className="text-center font-caption text-caption text-outline">
            SPADA UPGRIS v2.4 &bull; Standalone LMS
          </div>
        </div>
      </aside>

      {/* ── Main Wrapper ── */}
      <div className={`transition-all duration-300 ${sidebarOpen ? 'pl-[260px]' : 'pl-0'}`}>
        {/* Topbar Header */}
        <header
          className={`fixed top-0 right-0 h-16 bg-surface/85 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)] z-40 px-space-md flex items-center justify-between gap-space-md transition-all duration-300 ${
            sidebarOpen ? 'left-[260px]' : 'left-0'
          }`}
        >
          <div className="flex items-center gap-space-md min-w-0">
            {/* Toggle Sidebar Button */}
            <button
              type="button"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              aria-label="Toggle Sidebar"
              className="p-2 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface transition-colors"
            >
              <span className="material-symbols-outlined text-[20px]">
                {sidebarOpen ? 'menu_open' : 'menu'}
              </span>
            </button>

            <div className="flex items-center gap-space-sm truncate">
              <span className="font-title-md text-title-md text-on-surface font-headline-md tracking-tight hidden lg:inline truncate">
                SPADA UPGRIS - Sistem Pembelajaran Daring UPGRIS
              </span>
              <span className="font-title-md text-title-md text-on-surface font-headline-md tracking-tight lg:hidden truncate">
                SPADA UPGRIS
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-surface-container-high text-tertiary font-label-sm text-label-sm shrink-0">
                <span className="w-2 h-2 rounded-full bg-tertiary animate-pulse" />
                Semester Ganjil 2026/2027
              </span>
            </div>
          </div>

          {/* Central Search */}
          <div className="hidden xl:flex items-center gap-space-md flex-1 max-w-md mx-auto">
            <div className="relative w-full">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[18px]">
                search
              </span>
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-surface-container-high text-on-surface placeholder:text-outline font-body-sm text-body-sm rounded-lg pl-9 pr-14 py-2 focus:outline-none focus:ring-1 focus:ring-primary-container"
                placeholder="Cari mata kuliah, berkas, mahasiswa..."
                type="text"
              />
              <span className="absolute right-2.5 top-1/2 -translate-y-1/2 font-caption text-caption text-outline-variant bg-surface-container-highest px-1.5 py-0.5 rounded">
                Ctrl+K
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-on-surface-variant font-caption text-caption shrink-0 bg-surface-container px-2.5 py-1.5 rounded-lg">
              <span className="material-symbols-outlined text-[15px] text-primary">schedule</span>
              <span>Waktu Server: 08:30 WIB</span>
            </div>
          </div>

          {/* Right Header Controls */}
          <div className="flex items-center gap-space-md shrink-0">
            {/* Notification Button */}
            <button
              type="button"
              onClick={() => showToast('Tidak ada notifikasi baru')}
              className="relative p-2 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface transition-colors"
            >
              <span className="material-symbols-outlined text-[20px]">notifications</span>
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-error" />
            </button>

            {/* Role Switcher */}
            <div className="hidden sm:flex items-center bg-surface-container p-0.5 rounded-lg">
              <button
                type="button"
                className="px-2 py-1 rounded-md font-label-sm text-label-sm bg-primary text-on-primary shadow-sm font-semibold"
              >
                Dosen
              </button>
              <button
                type="button"
                onClick={() => onRoleChange && onRoleChange('mahasiswa')}
                className="px-2 py-1 rounded-md font-label-sm text-label-sm text-on-surface-variant hover:text-on-surface transition-colors"
              >
                Mhs
              </button>
              <button
                type="button"
                onClick={() => showToast('Beralih ke mode Tendik')}
                className="px-2 py-1 rounded-md font-label-sm text-label-sm text-on-surface-variant hover:text-on-surface transition-colors"
              >
                Tendik
              </button>
            </div>

            {/* Profile Avatar Card */}
            <div className="flex items-center gap-space-sm pl-space-xs">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-on-primary text-[18px]">person</span>
              </div>
              <div className="hidden md:flex flex-col text-left">
                <span className="font-label-md text-label-md text-on-surface leading-tight">
                  Dr. Awan Rosi, M.Kom.
                </span>
                <span className="font-caption text-caption text-tertiary leading-tight font-semibold">
                  DOSEN PENGAMPU
                </span>
              </div>
              <button
                type="button"
                onClick={() => showToast('Menu Profil Dosen')}
                className="text-on-surface-variant hover:text-on-surface transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">expand_more</span>
              </button>
            </div>
          </div>
        </header>

        {/* ── Main Dashboard Body ── */}
        <main className="w-full pt-16 bg-surface min-h-[calc(100vh-4rem)] p-space-md">
          <div className="flex flex-col w-full space-y-space-lg pb-space-xl">

            {/* Top Breadcrumb & Metadata Path */}
            <div className="flex flex-wrap items-center justify-between gap-space-sm text-on-surface-variant font-caption text-caption">
              <div className="flex items-center gap-space-xs">
                <a className="hover:text-primary transition-colors flex items-center gap-1" href="#home">
                  <span className="material-symbols-outlined text-[15px]">home</span>
                  <span>Beranda</span>
                </a>
                <span className="text-outline-variant font-bold">/</span>
                <span className="text-on-surface font-label-sm">Dasbor Dosen</span>
              </div>
              <div className="inline-flex items-center gap-2 bg-surface-container-high px-space-sm py-1 rounded-full text-secondary font-label-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-ping" />
                <span>Koneksi SIAKAD UPGRIS: Terhubung Penuh</span>
              </div>
            </div>

            {/* Hero Greeting Banner */}
            <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-surface-container-high via-surface-container to-surface-container-low p-space-lg shadow-xl">
              {/* Ambient decorative glow */}
              <div className="absolute -right-16 -top-16 w-80 h-80 rounded-full bg-primary-container/10 blur-3xl pointer-events-none" />
              <div className="absolute -left-12 -bottom-12 w-64 h-64 rounded-full bg-tertiary-container/10 blur-2xl pointer-events-none" />

              <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-space-lg">
                <div className="space-y-space-sm max-w-3xl">
                  <div className="inline-flex items-center gap-space-xs px-2.5 py-1 rounded-md bg-primary-container/20 text-primary font-caption uppercase tracking-wider font-semibold">
                    <span className="material-symbols-outlined text-[15px]">sync_saved_locally</span>
                    <span>PORTAL DOSEN PENGAMPU &bull; Sinkronisasi Terpusat Aktif</span>
                  </div>
                  <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight">
                    Selamat Datang, <span className="text-primary font-bold">Dr. Awan Rosi, M.Kom.</span>
                  </h1>
                  <p className="font-body-md text-body-md text-on-surface-variant flex flex-wrap items-center gap-y-1 gap-x-space-sm">
                    <span className="inline-flex items-center gap-1 font-mono text-tertiary">
                      <span className="material-symbols-outlined text-[16px]">badge</span>
                      NIDN: 0612345601
                    </span>
                    <span className="text-outline-variant">&bull;</span>
                    <span className="inline-flex items-center gap-1">
                      <span className="material-symbols-outlined text-[16px]">event_note</span>
                      Semester Ganjil 2026/2027
                    </span>
                    <span className="text-outline-variant">&bull;</span>
                    <span className="inline-flex items-center gap-1 text-secondary">
                      <span className="material-symbols-outlined text-[16px]">schedule</span>
                      Waktu Server: 08:30 WIB
                    </span>
                  </p>
                </div>

                {/* Right Academic Calendar Status Card */}
                <div className="shrink-0 rounded-lg bg-surface-container-highest/60 backdrop-blur-md p-space-md min-w-[280px] shadow-sm">
                  <div className="flex items-center justify-between pb-space-xs">
                    <span className="font-caption text-caption uppercase tracking-wider text-outline font-semibold">
                      Kalender Akademik
                    </span>
                    <span className="material-symbols-outlined text-secondary text-[18px]">calendar_today</span>
                  </div>
                  <div className="font-title-md text-title-md text-on-surface font-semibold">
                    Senin, 13 Oktober 2026
                  </div>
                  <div className="inline-flex items-center gap-1.5 mt-space-xs px-2 py-0.5 rounded bg-tertiary-container/30 text-tertiary font-label-sm text-label-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-tertiary" />
                    <span>Pekan Perkuliahan Ke-4 (Pra-UTS)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* ── 3 Teaching Metric Cards ── */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-space-md">
              {displayMetrics.map((metric) => (
                <div
                  key={metric.title}
                  className="relative overflow-hidden rounded-xl bg-surface-container p-space-md shadow-md transition-transform duration-200 hover:-translate-y-0.5"
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-space-xs">
                      <span className="font-caption text-caption text-outline uppercase tracking-wider">
                        {metric.title}
                      </span>
                      <div className={`font-headline-md text-headline-md font-bold ${metric.valColor || 'text-on-surface'}`}>
                        {metric.value}
                      </div>
                    </div>
                    <div className={`w-11 h-11 rounded-lg ${metric.iconBg} flex items-center justify-center shrink-0`}>
                      <span className="material-symbols-outlined text-[24px]">{metric.icon}</span>
                    </div>
                  </div>
                  <div className={`mt-space-sm pt-space-xs flex items-center gap-1.5 font-label-sm text-label-sm ${metric.subColor}`}>
                    <span className="material-symbols-outlined text-[16px]">{metric.subIcon}</span>
                    <span>{metric.subtitle}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* ── Teaching Classes Section ── */}
            <div className="space-y-space-md">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm">
                <div className="space-y-0.5">
                  <h2 className="font-title-lg text-title-lg text-on-surface font-bold flex items-center gap-2">
                    <span>Kelas Perkuliahan Diampu Semester Ini</span>
                    <span className="px-2 py-0.5 rounded-full bg-surface-container-high text-outline text-caption uppercase">
                      T.A. 2026/2027
                    </span>
                  </h2>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">
                    Daftar kelas aktif dengan kurikulum 16 Pertemuan Terstruktur (UTS Pertemuan 8 & UAS Pertemuan 16)
                  </p>
                </div>
                <div className="flex items-center gap-space-xs shrink-0">
                  <button
                    type="button"
                    onClick={() => showToast('Membuka jadwal mengajar lengkap')}
                    className="px-space-sm py-2 rounded-lg bg-surface-container-high hover:bg-surface-container-highest text-on-surface font-label-sm text-label-sm flex items-center gap-1.5 transition-colors"
                  >
                    <span className="material-symbols-outlined text-[18px]">calendar_view_week</span>
                    <span>Jadwal Mengajar Lengkap</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => showToast('Membuka kurikulum silabus 16 pertemuan')}
                    className="px-space-sm py-2 rounded-lg bg-surface-container-high hover:bg-surface-container-highest text-primary font-label-sm text-label-sm flex items-center gap-1.5 transition-colors"
                  >
                    <span className="material-symbols-outlined text-[18px]">account_tree</span>
                    <span>Kelola Silabus 16 Pertemuan</span>
                  </button>
                </div>
              </div>

              {/* Class Cards Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-space-md">
                {displayClasses.length > 0 ? (
                  displayClasses.map((cls) => (
                  <div
                    key={cls.code}
                    className="group flex flex-col justify-between rounded-xl bg-surface-container p-space-md shadow-md transition-all duration-200 hover:shadow-xl hover:bg-surface-container-high"
                  >
                    <div className="space-y-space-md">
                      <div className="flex items-start justify-between gap-space-xs">
                        <span className="px-2.5 py-1 rounded-md bg-primary/20 text-primary font-label-sm font-semibold tracking-wide">
                          {cls.code}
                        </span>
                        {cls.badgeType === 'active' ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-tertiary-container/20 text-tertiary font-caption font-semibold">
                            <span className="w-2 h-2 rounded-full bg-tertiary animate-pulse" />
                            {cls.badge}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-container-highest text-on-surface-variant font-caption">
                            <span className="w-1.5 h-1.5 rounded-full bg-outline" />
                            {cls.badge}
                          </span>
                        )}
                      </div>

                      <div>
                        <h3 className="font-title-md text-title-md text-on-surface font-bold group-hover:text-primary transition-colors">
                          {cls.title}
                        </h3>
                        <span className="font-label-sm text-label-sm text-secondary font-medium">{cls.sks}</span>
                      </div>

                      {/* Schedule & Room */}
                      <div className="rounded-lg bg-surface-container-lowest p-space-sm space-y-1">
                        <div className="flex items-center gap-2 text-on-surface-variant font-body-sm text-body-sm">
                          <span className="material-symbols-outlined text-primary text-[18px]">alarm</span>
                          <span>{cls.alarm}</span>
                        </div>
                        <div className="flex items-center gap-2 text-on-surface-variant font-body-sm text-body-sm">
                          <span className="material-symbols-outlined text-secondary text-[18px]">meeting_room</span>
                          <span>{cls.room}</span>
                        </div>
                      </div>

                      {/* Progress Info */}
                      <div className="space-y-1.5">
                        <div className="flex justify-between items-center font-caption text-caption">
                          <span className="text-on-surface-variant">Pertemuan Berjalan</span>
                          <span className="text-on-surface font-medium">{cls.currentMeeting}</span>
                        </div>
                        <div className="w-full bg-surface-container-highest rounded-full h-2 overflow-hidden">
                          <div
                            className="bg-primary h-full rounded-full transition-all duration-500"
                            style={{ width: `${cls.progressPct}%` }}
                          />
                        </div>
                      </div>

                      {/* Quota Enrollment */}
                      <div className="space-y-1">
                        <div className="flex justify-between items-center font-caption text-caption">
                          <span className="text-outline">Mahasiswa Terdaftar</span>
                          <span className="text-tertiary font-semibold">{cls.students}</span>
                        </div>
                        <div className="w-full bg-surface-container-highest rounded-full h-1.5 overflow-hidden">
                          <div
                            className={`${cls.quotaColor} h-full rounded-full`}
                            style={{ width: `${cls.studentsPct}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Action CTAs */}
                    <div className="pt-space-md mt-space-md grid grid-cols-2 gap-space-xs">
                      <button
                        type="button"
                        onClick={() => showToast(`Membuka presensi kelas: ${cls.code}`)}
                        className="w-full py-2 px-3 rounded-lg bg-surface-container-highest hover:bg-surface-bright text-on-surface font-label-sm text-label-sm flex items-center justify-center gap-1 transition-colors"
                      >
                        <span className="material-symbols-outlined text-[16px] text-tertiary">
                          {cls.btnPresensiIcon}
                        </span>
                        <span>{cls.btnPresensiText}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => showToast(`Masuk ruang kuliah daring: ${cls.title}`)}
                        className="w-full py-2 px-3 rounded-lg bg-primary text-on-primary hover:bg-primary-container font-label-sm text-label-sm flex items-center justify-center gap-1 shadow-sm transition-colors"
                      >
                        <span>Buka Kelas</span>
                        <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="lg:col-span-3 flex flex-col items-center justify-center py-12 text-on-surface-variant">
                  <span className="material-symbols-outlined text-[48px] mb-4">class</span>
                  <p className="font-body-md text-center">Belum ada kelas diampu semester ini</p>
                  <button
                    type="button"
                    onClick={() => setActiveMenu('kelas-diampu')}
                    className="mt-4 px-4 py-2 rounded-lg bg-primary text-on-primary hover:bg-primary-container font-label-sm"
                  >
                    Lihat Menu Kelas Diampu
                  </button>
                </div>
              )}
              </div>
            </div>

            {/* ── Bottom Two-Column Action Widgets ── */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-md pt-space-xs">
              {/* Left Column: Tasks Need Grading */}
              <div className="lg:col-span-7 flex flex-col justify-between rounded-xl bg-surface-container p-space-md shadow-md space-y-space-md">
                <div className="space-y-space-sm">
                  <div className="flex items-center justify-between pb-space-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-error-container/30 text-error flex items-center justify-center">
                        <span className="material-symbols-outlined text-[18px]">assignment_late</span>
                      </div>
                      <div>
                        <h3 className="font-title-md text-title-md text-on-surface font-bold">
                          Tugas Mahasiswa Butuh Pemeriksaan
                        </h3>
                        <p className="font-caption text-caption text-on-surface-variant">
                          Penilaian berbasis rubrik SPADA terintegrasi SIAKAD
                        </p>
                      </div>
                    </div>
                    <span className={`px-2 py-0.5 rounded bg-error/20 text-error font-caption font-semibold ${loading ? 'animate-pulse' : ''}`}>
                      {loading ? 'Memuat...' : pendingGrading.length > 0 ? `${pendingGrading.length} Tugas Prioritas` : '1 Tugas Prioritas'}
                    </span>
                  </div>

                  {pendingGrading.length > 0 ? (
                    pendingGrading.map((task, idx) => (
                      <div key={task.id || idx} className="rounded-lg bg-surface-container-low p-space-sm space-y-space-xs transition-colors hover:bg-surface-container-high">
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-space-xs">
                          <div className="space-y-0.5">
                            <span className="font-title-md text-title-md text-on-surface font-semibold hover:text-primary transition-colors cursor-pointer">
                              {task.title || `Tugas ${idx + 1}`}
                            </span>
                            <div className="flex flex-wrap items-center gap-2 text-on-surface-variant font-body-sm text-body-sm">
                              <span className="px-1.5 py-0.5 rounded bg-surface-container-highest text-secondary font-mono text-caption">
                                {task.class_code || task.course?.code || 'TIF-301'}
                              </span>
                              <span className="text-outline-variant">&bull;</span>
                              <span>Skor SPADA: {task.score_range || '0-100'}</span>
                            </div>
                          </div>
                          <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-error-container/20 text-error font-label-sm text-label-sm shrink-0">
                            <span className="material-symbols-outlined text-[15px]">pending_actions</span>
                            <span>{task.pending_count || 0} Belum Dinilai</span>
                          </div>
                        </div>

                        {/* Progress Submissions (if available) */}
                        {task.graded_count !== undefined && task.total_count !== undefined && (
                          <div className="space-y-1 pt-1">
                            <div className="flex justify-between items-center font-caption text-caption">
                              <span className="text-on-surface-variant">{task.graded_count} dari {task.total_count} Submissions Telah Dinilai</span>
                              <span className="text-primary font-semibold">{task.total_count > 0 ? Math.round((task.graded_count / task.total_count) * 100) : 0}% Selesai</span>
                            </div>
                            <div className="w-full bg-surface-container-highest rounded-full h-1.5 overflow-hidden">
                              <div className="bg-primary-container h-full rounded-full" style={{ width: `${task.total_count > 0 ? Math.round((task.graded_count / task.total_count) * 100) : 0}%` }} />
                            </div>
                          </div>
                        )}

                        <div className="flex justify-end pt-space-xs">
                          <button
                            type="button"
                            onClick={() => showToast(`Membuka lembar penilaian ${task.title || `Tugas ${idx + 1}`}`)}
                            className="px-3 py-1.5 rounded-md bg-primary-container hover:bg-primary text-on-primary-container hover:text-on-primary font-label-sm text-label-sm flex items-center gap-1.5 transition-colors"
                          >
                            <span className="material-symbols-outlined text-[16px]">rate_review</span>
                            <span>Periksa & Beri Nilai</span>
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <>
                      {/* Task Item 1: Pending Grading (fallback) */}
                      <div className="rounded-lg bg-surface-container-low p-space-sm space-y-space-xs transition-colors hover:bg-surface-container-high">
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-space-xs">
                          <div className="space-y-0.5">
                            <span className="font-title-md text-title-md text-on-surface font-semibold hover:text-primary transition-colors cursor-pointer">
                              Tugas 02: Analisis Kebutuhan SRS IEEE 830
                            </span>
                            <div className="flex flex-wrap items-center gap-2 text-on-surface-variant font-body-sm text-body-sm">
                              <span className="px-1.5 py-0.5 rounded bg-surface-container-highest text-secondary font-mono text-caption">
                                TIF-301 RPL TI-A
                              </span>
                              <span className="text-outline-variant">&bull;</span>
                              <span>Skor SPADA: 0-100</span>
                            </div>
                          </div>
                          <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-error-container/20 text-error font-label-sm text-label-sm shrink-0">
                            <span className="material-symbols-outlined text-[15px]">pending_actions</span>
                            <span>4 Belum Dinilai</span>
                          </div>
                        </div>

                        {/* Progress Submissions */}
                        <div className="space-y-1 pt-1">
                          <div className="flex justify-between items-center font-caption text-caption">
                            <span className="text-on-surface-variant">36 dari 40 Submissions Telah Dinilai</span>
                            <span className="text-primary font-semibold">90% Selesai</span>
                          </div>
                          <div className="w-full bg-surface-container-highest rounded-full h-1.5 overflow-hidden">
                            <div className="bg-primary-container h-full rounded-full" style={{ width: '90%' }} />
                          </div>
                        </div>
                        <div className="flex justify-end pt-space-xs">
                          <button
                            type="button"
                            onClick={() => showToast('Membuka lembar penilaian Tugas 02')}
                            className="px-3 py-1.5 rounded-md bg-primary-container hover:bg-primary text-on-primary-container hover:text-on-primary font-label-sm text-label-sm flex items-center gap-1.5 transition-colors"
                          >
                            <span className="material-symbols-outlined text-[16px]">rate_review</span>
                            <span>Periksa & Beri Nilai</span>
                          </button>
                        </div>
                      </div>

                      {/* Task Item 2: Completed Grading (fallback) */}
                      <div className="rounded-lg bg-surface-container-low p-space-sm space-y-space-xs opacity-90 hover:opacity-100 transition-opacity">
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-space-xs">
                          <div className="space-y-0.5">
                            <span className="font-title-md text-title-md text-on-surface font-semibold">
                              Tugas 01: Diagram Konteks & DFD Level 1
                            </span>
                            <div className="flex flex-wrap items-center gap-2 text-on-surface-variant font-body-sm text-body-sm">
                              <span className="px-1.5 py-0.5 rounded bg-surface-container-highest text-secondary font-mono text-caption">
                                TIF-305 RPL TI-B
                              </span>
                              <span className="text-outline-variant">&bull;</span>
                              <span className="text-tertiary">38/38 Submissions Dinilai Lengkap</span>
                            </div>
                          </div>
                          <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-tertiary-container/20 text-tertiary font-label-sm text-label-sm shrink-0">
                            <span className="material-symbols-outlined text-[15px]">done_all</span>
                            <span>Rata-rata 86.4/100</span>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>

                <div className="pt-space-xs">
                  <button
                    type="button"
                    onClick={() => showToast('Membuka seluruh lembar penilaian SPADA')}
                    className="inline-flex items-center gap-1.5 font-label-md text-label-md text-primary hover:text-primary-fixed transition-colors"
                  >
                    <span>Lihat Seluruh Lembar Penilaian SPADA</span>
                    <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                  </button>
                </div>
              </div>

              {/* Right Column: Quick Shortcuts */}
              <div className="lg:col-span-5 flex flex-col justify-between rounded-xl bg-surface-container p-space-md shadow-md space-y-space-md">
                <div className="space-y-space-sm">
                  <div className="flex items-center gap-2 pb-space-xs">
                    <div className="w-8 h-8 rounded-lg bg-secondary-container/30 text-secondary flex items-center justify-center">
                      <span className="material-symbols-outlined text-[18px]">bolt</span>
                    </div>
                    <div>
                      <h3 className="font-title-md text-title-md text-on-surface font-bold">
                        Pintasan Cepat Dosen Pengampu
                      </h3>
                      <p className="font-caption text-caption text-on-surface-variant">
                        Akses instan administrasi pembelajaran daring
                      </p>
                    </div>
                  </div>

                  {/* Quick Action 1 */}
                  <button
                    type="button"
                    onClick={() => showToast('Membuka modal kontrol presensi digital')}
                    className="w-full group flex items-center justify-between p-space-sm rounded-lg bg-surface-container-low hover:bg-surface-container-high transition-colors text-left"
                  >
                    <div className="flex items-center gap-space-sm">
                      <div className="w-9 h-9 rounded-md bg-tertiary-container/20 text-tertiary flex items-center justify-center group-hover:bg-tertiary group-hover:text-on-tertiary transition-colors shrink-0">
                        <span className="material-symbols-outlined text-[20px]">fingerprint</span>
                      </div>
                      <div>
                        <div className="font-label-md text-label-md text-on-surface font-medium group-hover:text-primary transition-colors">
                          Buka Sesi Presensi Digital
                        </div>
                        <div className="font-caption text-caption text-outline">
                          Kontrol cepat buka/tutup presensi pertemuan hari ini
                        </div>
                      </div>
                    </div>
                    <span className="material-symbols-outlined text-outline group-hover:text-on-surface text-[18px] transition-transform group-hover:translate-x-0.5">
                      chevron_right
                    </span>
                  </button>

                  {/* Quick Action 2 */}
                  <button
                    type="button"
                    onClick={() => showToast('Membuka dialog unggah materi ajar')}
                    className="w-full group flex items-center justify-between p-space-sm rounded-lg bg-surface-container-low hover:bg-surface-container-high transition-colors text-left"
                  >
                    <div className="flex items-center gap-space-sm">
                      <div className="w-9 h-9 rounded-md bg-primary-container/20 text-primary flex items-center justify-center group-hover:bg-primary-container group-hover:text-on-primary-container transition-colors shrink-0">
                        <span className="material-symbols-outlined text-[20px]">upload_file</span>
                      </div>
                      <div>
                        <div className="font-label-md text-label-md text-on-surface font-medium group-hover:text-primary transition-colors">
                          Unggah Materi Ajar Baru
                        </div>
                        <div className="font-caption text-caption text-outline">
                          Validasi berkas .pdf, .docx, .xlsx, .zip max 10MB
                        </div>
                      </div>
                    </div>
                    <span className="material-symbols-outlined text-outline group-hover:text-on-surface text-[18px] transition-transform group-hover:translate-x-0.5">
                      chevron_right
                    </span>
                  </button>

                  {/* Quick Action 3 */}
                  <button
                    type="button"
                    onClick={() => showToast('Membuka persiapan bank soal kuis UTS P-8')}
                    className="w-full group flex items-center justify-between p-space-sm rounded-lg bg-surface-container-low hover:bg-surface-container-high transition-colors text-left"
                  >
                    <div className="flex items-center gap-space-sm">
                      <div className="w-9 h-9 rounded-md bg-secondary-container/20 text-secondary flex items-center justify-center group-hover:bg-secondary-container group-hover:text-on-secondary-container transition-colors shrink-0">
                        <span className="material-symbols-outlined text-[20px]">quiz</span>
                      </div>
                      <div>
                        <div className="font-label-md text-label-md text-on-surface font-medium group-hover:text-primary transition-colors">
                          Siapkan Bank Soal Kuis / UTS P-8
                        </div>
                        <div className="font-caption text-caption text-outline">
                          Terintegrasi syarat kehadiran min. 70%
                        </div>
                      </div>
                    </div>
                    <span className="material-symbols-outlined text-outline group-hover:text-on-surface text-[18px] transition-transform group-hover:translate-x-0.5">
                      chevron_right
                    </span>
                  </button>
                </div>

                {/* Server & Security Info Box */}
                <div className="rounded-lg bg-surface-container-lowest p-space-sm flex items-start gap-2.5 text-on-surface-variant font-caption text-caption">
                  <span className="material-symbols-outlined text-secondary text-[18px] shrink-0 mt-0.5">
                    verified_user
                  </span>
                  <span>
                    <strong className="text-on-surface font-semibold">Sistem Keamanan Berkas Aktif:</strong> Format
                    diizinkan (.pdf, .docx, .xlsx, .zip) dengan kuota server 10MB per unggahan berkas modul kuliah.
                  </span>
                </div>
              </div>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}