import React, { useState, useEffect, useRef } from 'react';

/**
 * AppShellGlobal — Feature Component
 *
 * Implementasi React untuk App Shell Global SPADA LMS UPGRIS.
 * Mencakup Header Global, Sidebar Navigasi Multi-Peran (RBAC),
 * Dropdown Menu Profil Interaktif, Banner Sambutan, Role Visual Switcher,
 * Stat Cards, Central Timeline Perkuliahan, dan Akses Cepat Kelas.
 */
export default function AppShellGlobal({ currentRole = 'mahasiswa', onRoleChange }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeRole, setActiveRole] = useState(currentRole);
  const [activeNavPath, setActiveNavPath] = useState('dasbor-mahasiswa');
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [demoDropdownOpen, setDemoDropdownOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const profileRef = useRef(null);
  const demoRef = useRef(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Close dropdowns on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileDropdownOpen(false);
      }
      if (demoRef.current && !demoRef.current.contains(e.target)) {
        setDemoDropdownOpen(false);
      }
    };
    window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, []);

  // Sync external role change
  useEffect(() => {
    if (currentRole) {
      setActiveRole(currentRole);
    }
  }, [currentRole]);

  const handleRoleSelect = (role) => {
    setActiveRole(role);
    if (onRoleChange) {
      onRoleChange(role);
    }
    if (role === 'mahasiswa') setActiveNavPath('dasbor-mahasiswa');
    else if (role === 'dosen') setActiveNavPath('dasbor-dosen');
    else if (role === 'admin') setActiveNavPath('manajemen-pengguna');
    showToast(`Peran dialihkan ke: ${role.toUpperCase()}`);
  };

  const navSections = [
    {
      title: 'Menu Utama',
      items: [
        { path: 'dasbor-mahasiswa', label: 'Dasbor', icon: 'grid_view' },
        { path: 'kelas-saya', label: 'Kelas Saya', icon: 'menu_book' },
        { path: 'panduan-belajar', label: 'Panduan Belajar', icon: 'explore' },
      ],
    },
    {
      title: 'Akademik',
      items: [
        { path: 'central-timeline', label: 'Central Timeline', icon: 'calendar_today' },
        { path: 'rekap-nilai-dan-presensi', label: 'Rekap Nilai & Presensi', icon: 'check_circle' },
      ],
    },
    {
      title: 'Menu Dosen',
      items: [
        { path: 'dasbor-dosen', label: 'Kelas Diampu', icon: 'co_present' },
        { path: 'pemeriksaan-tugas', label: 'Pemeriksaan Tugas', icon: 'assignment_turned_in' },
      ],
    },
    {
      title: 'Administrasi SPADA',
      items: [
        { path: 'manajemen-pengguna', label: 'Manajemen Pengguna', icon: 'group' },
        { path: 'master-mata-kuliah', label: 'Master Mata Kuliah', icon: 'local_library' },
        { path: 'pembukaan-kelas', label: 'Pembukaan Kelas', icon: 'edit_calendar' },
        { path: 'jejak-audit', label: 'Jejak Audit', icon: 'security' },
        { path: 'konfigurasi-sistem', label: 'Konfigurasi Sistem', icon: 'settings' },
      ],
    },
  ];

  const statCards = [
    {
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

  const timelineItems = [
    {
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
      actionHandler: () => showToast('Membuka formulir pengiriman Tugas 02'),
    },
    {
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
      actionHandler: () => showToast('Presensi mandiri berhasil dicatat!'),
    },
    {
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
      actionHandler: () => {},
    },
  ];

  const courseList = [
    {
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

  return (
    <div className="bg-background font-body-md text-on-surface antialiased min-h-screen">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-surface-container-highest text-on-surface px-4 py-3 rounded-xl shadow-2xl border border-primary/30 animate-bounce">
          <span className="material-symbols-outlined text-primary text-[20px]">info</span>
          <span className="font-label-md text-sm">{toastMessage}</span>
        </div>
      )}

      {/* ── Topbar / Header ── */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-surface-container/90 backdrop-blur-xl z-50 shadow-[0_1px_8px_rgba(0,0,0,0.3)]">
        <div className="w-full h-16 px-gutter flex items-center justify-between gap-space-md">
          {/* Left: Menu Hamburger + Logo + Semester Badge */}
          <div className="flex items-center gap-space-md">
            <button
              aria-label="Toggle Sidebar"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-space-xs rounded text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors"
              type="button"
            >
              <span className="material-symbols-outlined text-[24px]">menu</span>
            </button>
            <div className="flex items-center gap-space-sm">
              <div className="w-10 h-10 rounded-lg bg-primary-container flex items-center justify-center text-on-primary-container">
                <span className="material-symbols-outlined text-[24px]">school</span>
              </div>
              <div className="flex flex-col">
                <span className="font-title-md text-title-md text-on-surface tracking-tight leading-tight">
                  SPADA UPGRIS
                </span>
                <span className="font-caption text-caption text-on-surface-variant leading-none">
                  Sistem Pembelajaran Daring
                </span>
              </div>
            </div>
            <div className="hidden xl:flex items-center gap-space-xs px-space-sm py-space-xs rounded-full bg-tertiary-container/20 text-tertiary font-label-sm text-label-sm">
              <span className="material-symbols-outlined text-[14px]">circle</span>
              <span>Semester Ganjil 2026/2027</span>
            </div>
          </div>

          {/* Center: Search input */}
          <div className="hidden md:flex flex-1 max-w-md mx-space-md items-center">
            <div className="w-full relative flex items-center bg-surface-container-low rounded-lg px-space-md py-space-xs focus-within:ring-1 focus-within:ring-primary">
              <span className="material-symbols-outlined text-outline mr-space-sm text-[20px]">search</span>
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent font-body-sm text-body-sm text-on-surface placeholder-outline focus:outline-none"
                placeholder="Cari mata kuliah, materi, atau tugas..."
                type="text"
              />
              <kbd className="hidden sm:inline-block px-space-xs py-0.5 rounded bg-surface-container font-caption text-caption text-on-surface-variant">
                Ctrl+K
              </kbd>
            </div>
          </div>

          {/* Right: Server time, Notifications, Role Switcher, Profile */}
          <div className="flex items-center gap-space-md">
            <div className="hidden lg:flex items-center gap-space-xs text-on-surface-variant font-label-sm text-label-sm">
              <span className="material-symbols-outlined text-[16px]">schedule</span>
              <span>Server: 08:30 WIB</span>
            </div>

            <button
              aria-label="Notifikasi"
              onClick={() => showToast('Tidak ada notifikasi baru')}
              className="relative p-space-xs rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors"
              type="button"
            >
              <span className="material-symbols-outlined text-[22px]">notifications</span>
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-error" />
            </button>

            {/* Role Switcher Pill */}
            <div className="hidden sm:flex items-center bg-surface-container-low p-space-xs rounded-lg gap-space-xs">
              <button
                type="button"
                onClick={() => handleRoleSelect('mahasiswa')}
                className={`px-space-sm py-space-xs rounded font-label-sm text-label-sm transition-colors ${
                  activeRole === 'mahasiswa'
                    ? 'bg-primary-container text-on-primary-container font-bold'
                    : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'
                }`}
              >
                Mahasiswa
              </button>
              <button
                type="button"
                onClick={() => handleRoleSelect('dosen')}
                className={`px-space-sm py-space-xs rounded font-label-sm text-label-sm transition-colors ${
                  activeRole === 'dosen'
                    ? 'bg-primary-container text-on-primary-container font-bold'
                    : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'
                }`}
              >
                Dosen
              </button>
              <button
                type="button"
                onClick={() => handleRoleSelect('admin')}
                className={`px-space-sm py-space-xs rounded font-label-sm text-label-sm transition-colors ${
                  activeRole === 'admin'
                    ? 'bg-primary-container text-on-primary-container font-bold'
                    : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'
                }`}
              >
                Admin
              </button>
            </div>

            {/* Profile Menu Dropdown */}
            <div className="relative flex items-center gap-space-sm pl-space-xs" ref={profileRef}>
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                <span className="material-symbols-outlined text-on-primary text-[18px]">person</span>
              </div>
              <div className="hidden md:flex flex-col text-left">
                <span className="font-label-md text-label-md text-on-surface leading-tight">
                  {activeRole === 'dosen' ? 'Dr. Awan Rosi, M.Kom.' : 'Dimas Arya Pratama'}
                </span>
                <span className="font-caption text-caption text-secondary uppercase font-semibold">
                  {activeRole.toUpperCase()}
                </span>
              </div>
              <button
                aria-label="Profile Options"
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="text-on-surface-variant hover:text-on-surface"
                type="button"
              >
                <span className="material-symbols-outlined text-[20px]">keyboard_arrow_down</span>
              </button>

              {/* Floating Dropdown Menu Card */}
              {profileDropdownOpen && (
                <div className="absolute right-0 top-12 mt-space-xs w-64 rounded-xl bg-surface-container-lowest p-space-sm shadow-xl z-50 border border-outline-variant/30">
                  <div className="px-space-sm py-space-xs mb-space-xs rounded-lg bg-surface-container-low">
                    <p className="font-title-md text-title-md text-on-surface">
                      {activeRole === 'dosen' ? 'Dr. Awan Rosi, M.Kom.' : 'Dimas Arya Pratama'}
                    </p>
                    <p className="font-caption text-caption text-secondary">
                      {activeRole === 'dosen' ? 'NIDN: 0612345601 • Dosen' : 'NIM: 22670014 • Informatika'}
                    </p>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <a
                      href="#profile"
                      onClick={(e) => { e.preventDefault(); showToast('Navigasi ke Profil Saya'); setProfileDropdownOpen(false); }}
                      className="flex items-center gap-space-sm px-space-sm py-space-xs rounded text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface font-label-md text-label-md transition-colors"
                    >
                      <span className="material-symbols-outlined text-[18px]">badge</span>
                      <span>Profil Saya</span>
                    </a>
                    <a
                      href="#password"
                      onClick={(e) => { e.preventDefault(); showToast('Navigasi ke Ganti Kata Sandi'); setProfileDropdownOpen(false); }}
                      className="flex items-center gap-space-sm px-space-sm py-space-xs rounded text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface font-label-md text-label-md transition-colors"
                    >
                      <span className="material-symbols-outlined text-[18px]">key</span>
                      <span>Ganti Kata Sandi</span>
                    </a>
                    <a
                      href="#notifications"
                      onClick={(e) => { e.preventDefault(); showToast('Navigasi ke Preferensi Notifikasi'); setProfileDropdownOpen(false); }}
                      className="flex items-center gap-space-sm px-space-sm py-space-xs rounded text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface font-label-md text-label-md transition-colors"
                    >
                      <span className="material-symbols-outlined text-[18px]">tune</span>
                      <span>Preferensi Notifikasi</span>
                    </a>
                    <div className="h-px bg-surface-container-high my-space-xs" />
                    <a
                      href="#logout"
                      onClick={(e) => { e.preventDefault(); showToast('Keluar sesi SPADA...'); setProfileDropdownOpen(false); }}
                      className="flex items-center gap-space-sm px-space-sm py-space-xs rounded text-error hover:bg-error-container/20 font-label-md text-label-md transition-colors"
                    >
                      <span className="material-symbols-outlined text-[18px]">logout</span>
                      <span>Keluar Sesi</span>
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* ── Sidebar ── */}
      <aside
        className={`fixed left-0 top-16 bottom-0 w-64 bg-surface-container-low z-40 flex flex-col justify-between overflow-y-auto transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col">
          {/* Brand Sub-header */}
          <div className="px-gutter py-space-md bg-surface-container-lowest/50 flex flex-col gap-0.5">
            <div className="flex items-center gap-space-xs">
              <span className="material-symbols-outlined text-primary text-[18px]">layers</span>
              <span className="font-title-md text-title-md text-on-surface font-bold">SPADA LMS</span>
            </div>
            <span className="font-caption text-caption text-outline uppercase tracking-wider">
              Team Membangun Negeri
            </span>
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-col px-space-sm py-space-sm gap-space-xs">
            {navSections.map((section) => (
              <React.Fragment key={section.title}>
                <div className="px-space-sm pt-space-md pb-space-xs font-caption text-caption text-outline uppercase tracking-wider font-semibold">
                  {section.title}
                </div>
                {section.items.map((item) => {
                  const isActive = activeNavPath === item.path;
                  return (
                    <a
                      key={item.path}
                      href={`#${item.path}`}
                      onClick={(e) => {
                        e.preventDefault();
                        setActiveNavPath(item.path);
                        if (item.path === 'dasbor-dosen' && activeRole !== 'dosen') {
                          handleRoleSelect('dosen');
                        } else if (item.path === 'dasbor-mahasiswa' && activeRole !== 'mahasiswa') {
                          handleRoleSelect('mahasiswa');
                        }
                      }}
                      className={`flex items-center gap-space-sm px-space-md py-space-sm rounded-lg transition-colors font-label-md text-label-md ${
                        isActive
                          ? 'bg-primary-container text-on-primary-container font-bold shadow-sm'
                          : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                      <span>{item.label}</span>
                    </a>
                  );
                })}
              </React.Fragment>
            ))}
          </nav>
        </div>

        {/* Footer */}
        <div className="p-space-md bg-surface-container-lowest/80 flex flex-col gap-space-sm">
          <div className="text-center font-caption text-caption text-outline">
            SPADA UPGRIS v2.4 &bull; Standalone LMS
          </div>
          <a
            href="https://upt-ptik.upgris.ac.id"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-space-xs py-space-xs rounded-lg bg-surface-container-high hover:bg-surface-bright text-secondary hover:text-on-surface transition-colors font-label-sm text-label-sm"
          >
            <span className="material-symbols-outlined text-[16px]">support_agent</span>
            <span>IT Helpdesk</span>
          </a>
        </div>
      </aside>

      {/* ── Main Content Area ── */}
      <div className={`transition-all duration-300 ${sidebarOpen ? 'pl-64' : 'pl-0'}`}>
        <main className="w-full pt-16 px-gutter bg-background min-h-screen">
          <div className="flex flex-col w-full pb-margin">

            {/* Interactive Topbar Dropdown Demonstration Overlay */}
            <div className="relative w-full mb-space-md pt-4">
              <div className="flex items-center justify-between bg-surface-container-high/60 backdrop-blur-md px-gutter py-space-sm rounded-xl border border-outline-variant/30">
                <div className="flex items-center gap-space-sm text-secondary">
                  <span className="material-symbols-outlined text-[20px]">info</span>
                  <span className="font-body-sm text-body-sm text-on-surface">
                    Pratinjau Navigasi Cepat Topbar: Simulasi menu interaktif profil mahasiswa.
                  </span>
                </div>
                <div className="relative" ref={demoRef}>
                  <button
                    type="button"
                    onClick={() => setDemoDropdownOpen(!demoDropdownOpen)}
                    className="flex items-center gap-space-xs px-space-md py-space-xs rounded-lg bg-surface-container-highest hover:bg-surface-bright text-on-surface font-label-sm text-label-sm shadow-sm transition-all"
                  >
                    <span className="material-symbols-outlined text-[18px] text-primary">account_circle</span>
                    <span>Aksi Menu Profil</span>
                    <span className="material-symbols-outlined text-[16px]">expand_more</span>
                  </button>

                  {/* Dropdown Card Floating Level 2 Demo */}
                  {demoDropdownOpen && (
                    <div className="absolute right-0 mt-space-xs w-64 rounded-xl bg-surface-container-lowest p-space-sm shadow-xl z-30 border border-outline-variant/30">
                      <div className="px-space-sm py-space-xs mb-space-xs rounded-lg bg-surface-container-low">
                        <p className="font-title-md text-title-md text-on-surface">Dimas Arya Pratama</p>
                        <p className="font-caption text-caption text-secondary">NIM: 22670014 • Informatika</p>
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <a
                          href="#profile"
                          onClick={(e) => { e.preventDefault(); showToast('Simulasi: Profil Saya'); setDemoDropdownOpen(false); }}
                          className="flex items-center gap-space-sm px-space-sm py-space-xs rounded text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface font-label-md text-label-md transition-colors"
                        >
                          <span className="material-symbols-outlined text-[18px]">badge</span>
                          <span>Profil Saya</span>
                        </a>
                        <a
                          href="#password"
                          onClick={(e) => { e.preventDefault(); showToast('Simulasi: Ganti Kata Sandi'); setDemoDropdownOpen(false); }}
                          className="flex items-center gap-space-sm px-space-sm py-space-xs rounded text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface font-label-md text-label-md transition-colors"
                        >
                          <span className="material-symbols-outlined text-[18px]">key</span>
                          <span>Ganti Kata Sandi</span>
                        </a>
                        <a
                          href="#notifications"
                          onClick={(e) => { e.preventDefault(); showToast('Simulasi: Preferensi Notifikasi'); setDemoDropdownOpen(false); }}
                          className="flex items-center gap-space-sm px-space-sm py-space-xs rounded text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface font-label-md text-label-md transition-colors"
                        >
                          <span className="material-symbols-outlined text-[18px]">tune</span>
                          <span>Preferensi Notifikasi</span>
                        </a>
                        <div className="h-px bg-surface-container-high my-space-xs" />
                        <a
                          href="#logout"
                          onClick={(e) => { e.preventDefault(); showToast('Simulasi: Keluar Sesi'); setDemoDropdownOpen(false); }}
                          className="flex items-center gap-space-sm px-space-sm py-space-xs rounded text-error hover:bg-error-container/20 font-label-md text-label-md transition-colors"
                        >
                          <span className="material-symbols-outlined text-[18px]">logout</span>
                          <span>Keluar Sesi</span>
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Breadcrumb & Greeting Banner */}
            <section className="relative w-full rounded-2xl bg-surface-container-low p-gutter overflow-hidden shadow-sm mb-space-lg">
              <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-primary-container/10 blur-3xl pointer-events-none" />
              <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-space-lg">
                <div className="flex flex-col gap-space-xs">
                  <nav className="flex items-center gap-space-xs font-caption text-caption text-outline">
                    <span className="hover:text-primary cursor-pointer transition-colors">Beranda</span>
                    <span className="material-symbols-outlined text-[14px]">chevron_right</span>
                    <span className="text-secondary font-medium">Dasbor Pembelajaran</span>
                  </nav>
                  <h1 className="font-headline-lg text-headline-lg text-on-surface mt-space-xs tracking-tight">
                    Selamat Datang Kembali, Dimas Arya Pratama!
                  </h1>
                  <p className="font-body-md text-body-md text-on-surface-variant">
                    Semester Ganjil 2026/2027 • Program Studi Pendidikan Informatika UPGRIS
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-space-sm">
                  <div className="flex items-center gap-space-xs px-space-md py-space-xs rounded-full bg-tertiary-container/15 text-tertiary font-label-sm text-label-sm">
                    <span className="w-2 h-2 rounded-full bg-tertiary animate-pulse" />
                    <span>Status: Aktif Enrolled</span>
                  </div>
                  <div className="flex items-center gap-space-xs px-space-md py-space-xs rounded-full bg-surface-container-high text-on-surface-variant font-label-sm text-label-sm">
                    <span className="material-symbols-outlined text-[16px] text-secondary">update</span>
                    <span>Waktu Server: 08:30 WIB (Sinkron Terpusat)</span>
                  </div>
                </div>
              </div>
            </section>

            {/* Sidebar Architecture Visual Switcher Tabs (RBAC Mode) */}
            <section className="flex flex-col gap-space-xs mb-space-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-space-xs">
                  <span className="material-symbols-outlined text-primary text-[20px]">account_tree</span>
                  <h2 className="font-title-md text-title-md text-on-surface font-semibold">
                    Arsitektur Navigasi Multi-Peran SPADA LMS
                  </h2>
                </div>
                <span className="font-caption text-caption text-outline">Role-Based Access Control Mode</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-space-sm p-space-xs bg-surface-container-low rounded-xl">
                {/* Tab 1: Mahasiswa */}
                <button
                  type="button"
                  onClick={() => handleRoleSelect('mahasiswa')}
                  className={`role-tab flex flex-col text-left p-space-md rounded-lg transition-all ${
                    activeRole === 'mahasiswa'
                      ? 'bg-surface-container-high text-on-surface shadow-sm'
                      : 'hover:bg-surface-container text-on-surface-variant'
                  }`}
                >
                  <div className="flex items-center justify-between mb-space-xs">
                    <span className="font-label-md text-label-md font-bold text-primary flex items-center gap-space-xs">
                      <span className="material-symbols-outlined text-[18px]">school</span>
                      Mahasiswa
                    </span>
                    {activeRole === 'mahasiswa' ? (
                      <span className="px-2 py-0.5 rounded bg-primary-container text-on-primary-container font-caption text-caption uppercase font-semibold">
                        Aktif
                      </span>
                    ) : (
                      <span className="font-caption text-caption text-outline">Pratinjau</span>
                    )}
                  </div>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">
                    Dasbor, Kelas Saya, Panduan Belajar, Central Timeline, Rekap Nilai & Presensi
                  </p>
                </button>

                {/* Tab 2: Dosen */}
                <button
                  type="button"
                  onClick={() => handleRoleSelect('dosen')}
                  className={`role-tab flex flex-col text-left p-space-md rounded-lg transition-all ${
                    activeRole === 'dosen'
                      ? 'bg-surface-container-high text-on-surface shadow-sm'
                      : 'hover:bg-surface-container text-on-surface-variant'
                  }`}
                >
                  <div className="flex items-center justify-between mb-space-xs">
                    <span className="font-label-md text-label-md font-bold text-on-surface flex items-center gap-space-xs">
                      <span className="material-symbols-outlined text-[18px]">co_present</span>
                      Dosen Pengampu
                    </span>
                    {activeRole === 'dosen' ? (
                      <span className="px-2 py-0.5 rounded bg-primary-container text-on-primary-container font-caption text-caption uppercase font-semibold">
                        Aktif
                      </span>
                    ) : (
                      <span className="font-caption text-caption text-outline">Pratinjau</span>
                    )}
                  </div>
                  <p className="font-body-sm text-body-sm text-outline">
                    Dasbor Dosen, Kelas Diampu, Panduan Dosen, Central Timeline, Pemeriksaan Tugas
                  </p>
                </button>

                {/* Tab 3: Admin */}
                <button
                  type="button"
                  onClick={() => handleRoleSelect('admin')}
                  className={`role-tab flex flex-col text-left p-space-md rounded-lg transition-all ${
                    activeRole === 'admin'
                      ? 'bg-surface-container-high text-on-surface shadow-sm'
                      : 'hover:bg-surface-container text-on-surface-variant'
                  }`}
                >
                  <div className="flex items-center justify-between mb-space-xs">
                    <span className="font-label-md text-label-md font-bold text-on-surface flex items-center gap-space-xs">
                      <span className="material-symbols-outlined text-[18px]">admin_panel_settings</span>
                      Administrator SPADA
                    </span>
                    {activeRole === 'admin' ? (
                      <span className="px-2 py-0.5 rounded bg-primary-container text-on-primary-container font-caption text-caption uppercase font-semibold">
                        Aktif
                      </span>
                    ) : (
                      <span className="font-caption text-caption text-outline">Pratinjau</span>
                    )}
                  </div>
                  <p className="font-body-sm text-body-sm text-outline">
                    Manajemen Pengguna, Master Mata Kuliah, Pembukaan Kelas, Direct Enrollment, Audit
                  </p>
                </button>
              </div>
            </section>

            {/* Overview Stat Cards */}
            <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-space-md mb-space-xl">
              {statCards.map((card) => (
                <div
                  key={card.title}
                  className="flex flex-col justify-between p-space-md rounded-xl bg-surface-container-low hover:bg-surface-container transition-colors shadow-sm"
                >
                  <div className="flex items-center justify-between mb-space-sm">
                    <span className="font-label-sm text-label-sm text-outline uppercase tracking-wider font-semibold">
                      {card.title}
                    </span>
                    <div className={`w-9 h-9 rounded-lg ${card.iconBg} flex items-center justify-center shrink-0`}>
                      <span className="material-symbols-outlined text-[20px]">{card.icon}</span>
                    </div>
                  </div>
                  <div className="flex items-baseline gap-space-xs">
                    <span className={`font-headline-lg text-headline-lg font-extrabold ${card.valueColor || 'text-on-surface'}`}>
                      {card.value}
                    </span>
                    {card.unitBadge ? (
                      <span className="font-caption text-caption text-tertiary font-semibold">
                        {card.unit}
                      </span>
                    ) : (
                      <span className="font-title-md text-title-md text-on-surface-variant">
                        {card.unit}
                      </span>
                    )}
                  </div>
                  <div className={`mt-space-sm pt-space-xs flex items-center gap-space-xs font-caption text-caption ${card.footnoteColor}`}>
                    <span className="material-symbols-outlined text-[14px]">{card.footnoteIcon}</span>
                    <span>{card.footnote}</span>
                  </div>
                </div>
              ))}
            </section>

            {/* Main Grid: Central Timeline Preview & Quick Classes */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
              {/* Left Column: Central Timeline */}
              <div className="lg:col-span-7 flex flex-col gap-space-md">
                <div className="flex items-center justify-between bg-surface-container-low px-space-md py-space-sm rounded-xl">
                  <div className="flex items-center gap-space-xs">
                    <div className="w-8 h-8 rounded-lg bg-primary-container flex items-center justify-center text-on-primary-container">
                      <span className="material-symbols-outlined text-[18px]">calendar_clock</span>
                    </div>
                    <div>
                      <h3 className="font-title-md text-title-md text-on-surface font-semibold">
                        Central Timeline Perkuliahan
                      </h3>
                      <p className="font-caption text-caption text-outline">
                        Batas waktu penugasan dan sesi perkuliahan aktif
                      </p>
                    </div>
                  </div>
                  <a
                    href="#timeline"
                    onClick={(e) => { e.preventDefault(); showToast('Membuka jadwal perkuliahan lengkap'); }}
                    className="flex items-center gap-0.5 text-primary hover:text-secondary font-label-sm text-label-sm transition-colors"
                  >
                    <span>Lihat Semua</span>
                    <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                  </a>
                </div>

                {/* Timeline Items */}
                <div className="flex flex-col gap-space-sm">
                  {timelineItems.map((item) => (
                    <div
                      key={item.title}
                      className="flex items-start gap-space-md p-space-md rounded-xl bg-surface-container-low hover:bg-surface-container transition-all shadow-sm"
                    >
                      <div className={`w-10 h-10 rounded-lg ${item.iconBg} flex items-center justify-center shrink-0`}>
                        <span className="material-symbols-outlined text-[22px]">{item.icon}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center justify-between gap-space-xs mb-1">
                          <span className={`px-space-xs py-0.5 rounded font-caption text-caption font-bold uppercase ${item.badgeBg}`}>
                            {item.type}
                          </span>
                          <span className={`font-caption text-caption font-medium ${item.deadlineColor}`}>
                            {item.deadline}
                          </span>
                        </div>
                        <h4 className="font-title-md text-title-md text-on-surface truncate font-semibold">
                          {item.title}
                        </h4>
                        <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                          {item.desc}
                        </p>
                        <div className="mt-space-sm flex items-center justify-between pt-space-xs">
                          <span className="font-caption text-caption text-outline">
                            {item.lecturer}
                          </span>
                          <button
                            type="button"
                            disabled={item.disabled}
                            onClick={item.actionHandler}
                            className={`px-space-md py-1 rounded-lg font-label-sm text-label-sm transition-opacity ${item.actionClass}`}
                          >
                            {item.actionText}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Column: Kelas Saya Quick Access & Progress Ring */}
              <div className="lg:col-span-5 flex flex-col gap-space-md">
                <div className="flex items-center justify-between bg-surface-container-low px-space-md py-space-sm rounded-xl">
                  <div className="flex items-center gap-space-xs">
                    <div className="w-8 h-8 rounded-lg bg-surface-container-high flex items-center justify-center text-primary">
                      <span className="material-symbols-outlined text-[18px]">menu_book</span>
                    </div>
                    <h3 className="font-title-md text-title-md text-on-surface font-semibold">
                      Kelas Saya (Akses Cepat)
                    </h3>
                  </div>
                  <a
                    href="#all-classes"
                    onClick={(e) => { e.preventDefault(); showToast('Membuka seluruh daftar kelas'); }}
                    className="font-label-sm text-label-sm text-primary hover:text-secondary transition-colors"
                  >
                    Semua Kelas (6)
                  </a>
                </div>

                {/* Course Cards */}
                {courseList.map((course) => (
                  <div
                    key={course.code}
                    className="flex flex-col p-space-md rounded-xl bg-surface-container-low hover:bg-surface-container transition-all shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-space-sm mb-space-sm">
                      <div className="flex flex-col">
                        <span className="font-caption text-caption text-secondary font-bold uppercase tracking-wide">
                          {course.code}
                        </span>
                        <h4 className="font-title-md text-title-md text-on-surface font-semibold">
                          {course.title}
                        </h4>
                        <p className="font-body-sm text-body-sm text-outline">
                          {course.lecturer}
                        </p>
                      </div>
                      <span className={`px-2 py-1 rounded-lg ${course.meetingBadgeColor || 'bg-primary-container/20 text-primary'} font-caption text-caption font-semibold whitespace-nowrap`}>
                        {course.meetingBadge}
                      </span>
                    </div>

                    {/* Progress Bar Indicator */}
                    <div className="flex flex-col gap-1 mb-space-md">
                      <div className="flex justify-between font-caption text-caption">
                        <span className="text-on-surface-variant">Progres Materi & Evaluasi</span>
                        <span className={`${course.progressTextColor} font-bold`}>{course.progressPct}%</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-surface-container-highest overflow-hidden">
                        <div
                          className={`h-full ${course.progressColor} rounded-full`}
                          style={{ width: `${course.progressPct}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-space-xs">
                      <span className={`font-caption text-caption ${course.statusColor} flex items-center gap-1`}>
                        <span className="material-symbols-outlined text-[14px]">{course.statusIcon}</span>
                        {course.statusText}
                      </span>
                      <button
                        type="button"
                        onClick={() => showToast(`Masuk ruang kelas: ${course.title}`)}
                        className="px-space-md py-1.5 rounded-lg bg-surface-container-high hover:bg-surface-bright text-on-surface font-label-sm text-label-sm flex items-center gap-1 transition-colors"
                      >
                        <span>Masuk Ruang Kelas</span>
                        <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                      </button>
                    </div>
                  </div>
                ))}

                {/* Quick Learning Guides Banner */}
                <div className="flex items-center gap-space-md p-space-md rounded-xl bg-gradient-to-r from-surface-container-low to-surface-container-high shadow-sm border border-outline-variant/20">
                  <div className="w-10 h-10 rounded-lg bg-primary-container flex items-center justify-center text-on-primary-container shrink-0">
                    <span className="material-symbols-outlined text-[20px]">menu_book</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-title-md text-title-md text-on-surface font-semibold">
                      Panduan Belajar Mahasiswa
                    </h4>
                    <p className="font-caption text-caption text-on-surface-variant">
                      Pedoman teknis submit tugas, kuis berbasis integritas, dan presensi mandiri.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => showToast('Mengunduh Panduan Belajar Mahasiswa (PDF)...')}
                    className="p-space-xs rounded-lg text-primary hover:bg-surface-container-highest transition-colors"
                  >
                    <span className="material-symbols-outlined text-[20px]">download</span>
                  </button>
                </div>
              </div>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}
