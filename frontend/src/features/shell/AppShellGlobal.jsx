import React, { useState, useEffect } from 'react';
import AppShell from '../../components/AppShell';
import { statCards, timelineItems, courseList } from './fixtures';
import { useAuthStore } from '../../stores/authStore';

/**
 * AppShellGlobal — Feature Component
 *
 * Implementasi React untuk App Shell Global SPADA LMS UPGRIS.
 * Memanfaatkan AppShell tunggal modular dengan penegakan RBAC,
 * role visual switcher, banner sambutan dinamis, stat cards,
 * central timeline perkuliahan, dan modul akses cepat kelas.
 */
export default function AppShellGlobal({ currentRole = 'mahasiswa', onRoleChange }) {
  const [activeRole, setActiveRole] = useState(currentRole);
  const [activeNavPath, setActiveNavPath] = useState(
    currentRole === 'dosen'
      ? 'dasbor-dosen'
      : currentRole === 'admin'
      ? 'manajemen-pengguna'
      : 'dasbor-mahasiswa'
  );
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Sync external role change
  useEffect(() => {
    if (currentRole) {
      setActiveRole(currentRole);
      if (currentRole === 'dosen') setActiveNavPath('dasbor-dosen');
      else if (currentRole === 'admin') setActiveNavPath('manajemen-pengguna');
      else setActiveNavPath('dasbor-mahasiswa');
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

  const storeUser = useAuthStore((s) => s.user);
  const studentName = storeUser?.name || 'Dimas Arya Pratama';
  const studentId = storeUser?.identifier || 'NIM: 22670014';

  return (
    <AppShell
      activeRole={activeRole}
      onRoleChange={handleRoleSelect}
      activeNavPath={activeNavPath}
      onNavChange={setActiveNavPath}
    >
      {/* Toast Notification Lokal */}
      {toastMessage && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-surface-container-highest text-on-surface px-4 py-3 rounded-xl shadow-2xl border border-primary/30 animate-bounce"
        >
          <span className="material-symbols-outlined text-primary text-[20px]">info</span>
          <span className="font-label-md text-sm">{toastMessage}</span>
        </div>
      )}

      {/* Breadcrumb & Greeting Banner */}
      <section className="relative w-full rounded-2xl bg-surface-container-low p-gutter overflow-hidden shadow-sm mb-space-lg border border-outline-variant/20">
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-primary-container/10 blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm mb-space-md">
          {/* Breadcrumb Navigation */}
          <nav aria-label="Breadcrumb" className="flex items-center gap-space-xs font-caption text-caption text-outline">
            <a
              href="#portal"
              onClick={(e) => { e.preventDefault(); showToast('Navigasi ke Portal Utama'); }}
              className="hover:text-primary transition-colors flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-[16px]">home</span>
              <span>SPADA UPGRIS</span>
            </a>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <span className="text-secondary font-semibold capitalize">App Shell Global ({activeRole})</span>
          </nav>

          {/* Sync Status Pill */}
          <div className="inline-flex items-center gap-space-xs px-space-sm py-1 rounded-full bg-tertiary-container/20 border border-tertiary/30">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-tertiary opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-tertiary" />
            </span>
            <span className="font-caption text-caption font-bold tracking-wider text-tertiary uppercase">
              Sinkronisasi Terpusat Aktif
            </span>
          </div>
        </div>

        {/* Greeting Heading */}
        <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-space-lg">
          <div className="flex flex-col gap-1 max-w-3xl">
            <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight font-bold">
              Selamat Datang,{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-secondary to-primary animate-gradient">
                {studentName}!
              </span>
            </h1>
            <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
              Tahun Ajaran 2026/2027 &bull; Semester Ganjil &bull; Status:{' '}
              <span className="font-semibold text-tertiary">Aktif Terdaftar (Direct Enrollment)</span>
            </p>
          </div>

          <div className="flex items-center gap-space-sm self-start xl:self-end">
            <div className="flex items-center gap-space-xs px-space-md py-space-xs rounded-lg bg-surface-container text-on-surface font-label-sm text-label-sm shadow-sm border border-outline-variant/30">
              <span className="material-symbols-outlined text-[18px] text-secondary">badge</span>
              <span>{studentId}</span>
            </div>
            <div className="flex items-center gap-space-xs px-space-md py-space-xs rounded-lg bg-surface-container text-on-surface font-label-sm text-label-sm shadow-sm border border-outline-variant/30">
              <span className="material-symbols-outlined text-[18px] text-primary">school</span>
              <span>Informatika</span>
            </div>
          </div>
        </div>
      </section>

      {/* Role Navigation Architecture Visualizer */}
      <section className="flex flex-col gap-space-sm mb-space-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-space-xs">
            <span className="material-symbols-outlined text-primary text-[20px]">account_tree</span>
            <h2 className="font-title-md text-title-md text-on-surface font-semibold">
              Arsitektur Navigasi Multi-Peran SPADA LMS
            </h2>
          </div>
          <span className="font-caption text-caption text-outline">Role-Based Access Control Mode</span>
        </div>
        <div
          role="tablist"
          aria-label="Pemilih Pratinjau Peran"
          className="grid grid-cols-1 md:grid-cols-3 gap-space-sm p-space-xs bg-surface-container-low rounded-xl border border-outline-variant/20"
        >
          {/* Tab 1: Mahasiswa */}
          <button
            type="button"
            role="tab"
            aria-selected={activeRole === 'mahasiswa'}
            onClick={() => handleRoleSelect('mahasiswa')}
            className={`flex flex-col text-left p-space-md rounded-lg transition-all ${
              activeRole === 'mahasiswa'
                ? 'bg-surface-container-high text-on-surface shadow-sm border border-primary/30'
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
              Dasbor, Kelas Saya, Panduan Belajar, Central Timeline, Rekap Nilai &amp; Presensi
            </p>
          </button>

          {/* Tab 2: Dosen */}
          <button
            type="button"
            role="tab"
            aria-selected={activeRole === 'dosen'}
            onClick={() => handleRoleSelect('dosen')}
            className={`flex flex-col text-left p-space-md rounded-lg transition-all ${
              activeRole === 'dosen'
                ? 'bg-surface-container-high text-on-surface shadow-sm border border-primary/30'
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
            role="tab"
            aria-selected={activeRole === 'admin'}
            onClick={() => handleRoleSelect('admin')}
            className={`flex flex-col text-left p-space-md rounded-lg transition-all ${
              activeRole === 'admin'
                ? 'bg-surface-container-high text-on-surface shadow-sm border border-primary/30'
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
            key={card.id || card.title}
            className="flex flex-col justify-between p-space-md rounded-xl bg-surface-container-low hover:bg-surface-container transition-colors shadow-sm border border-outline-variant/20"
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
          <div className="flex items-center justify-between bg-surface-container-low px-space-md py-space-sm rounded-xl border border-outline-variant/20">
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
                key={item.id || item.title}
                className="flex items-start gap-space-md p-space-md rounded-xl bg-surface-container-low hover:bg-surface-container transition-all shadow-sm border border-outline-variant/20"
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
                      onClick={() => showToast(`Aksi diproses: ${item.actionText}`)}
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
          <div className="flex items-center justify-between bg-surface-container-low px-space-md py-space-sm rounded-xl border border-outline-variant/20">
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
              key={course.id || course.code}
              className="flex flex-col p-space-md rounded-xl bg-surface-container-low hover:bg-surface-container transition-all shadow-sm border border-outline-variant/20"
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
                  <span className="text-on-surface-variant">Progres Materi &amp; Evaluasi</span>
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
    </AppShell>
  );
}
