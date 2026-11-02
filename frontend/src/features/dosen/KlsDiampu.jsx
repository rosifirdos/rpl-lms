import React, { useState } from 'react';
import AppShell from '../../components/AppShell';

/**
 * KlsDiampu — Feature Component
 * Menampilkan daftar kelas yang diampu oleh Dosen Pengampu pada semester berjalan.
 * Berdasarkan desain kls_diampu.html (MVP 2).
 */
export default function KlsDiampu({ onNavigate, onRoleChange }) {
  const [activeTab, setActiveTab] = useState('active'); // 'active' | 'empty' | 'loading'
  const [activeMenuId, setActiveMenuId] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const classes = [
    {
      id: 'rpl-ti-a',
      code: 'TIF-301',
      className: 'TI-A',
      title: 'Rekayasa Perangkat Lunak',
      sks: 3,
      program: 'Reguler Pagi',
      schedule: 'Senin, 08:00 - 10:30 WIB • Lab Komputasi 3 (Gedung B Lt. 3)',
      meetingsCount: 16,
      materialsCount: 5,
      enrolledCount: 38,
      capacity: 40,
      presenceStatus: 'Presensi P-3: Sesi Aktif',
      presenceRemaining: 'Tersisa 45 Menit',
      isPresenceActive: true,
      currentMeeting: 3,
    },
    {
      id: 'rpl-ti-b',
      code: 'TIF-301',
      className: 'TI-B',
      title: 'Rekayasa Perangkat Lunak',
      sks: 3,
      program: 'Reguler Siang',
      schedule: 'Rabu, 13:00 - 15:30 WIB • Ruang Kuliah 204 (Gedung C)',
      meetingsCount: 16,
      materialsCount: 5,
      enrolledCount: 35,
      capacity: 40,
      presenceStatus: 'Presensi P-3: Selesai',
      presenceRemaining: 'Ditutup 24 Okt',
      isPresenceActive: false,
      currentMeeting: 3,
    },
    {
      id: 'ap-ti-c',
      code: 'TIF-102',
      className: 'TI-C',
      title: 'Algoritma & Pemrograman Dasar',
      sks: 4,
      program: 'Reguler Pagi',
      schedule: 'Kamis, 08:00 - 11:30 WIB • Lab Komputasi 1 (Gedung B)',
      meetingsCount: 16,
      materialsCount: 7,
      enrolledCount: 40,
      capacity: 40,
      presenceStatus: 'Presensi P-4: Terjadwal',
      presenceRemaining: 'Mulai Kamis 08:00 WIB',
      isPresenceActive: false,
      currentMeeting: 4,
    },
  ];

  return (
    <AppShell
      activeRole="dosen"
      onRoleChange={onRoleChange}
      activeNavPath="kelas-diampu"
      onNavChange={onNavigate}
    >
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-surface-container-highest text-on-surface px-4 py-3 rounded-xl shadow-2xl border border-primary/30">
          <span className="material-symbols-outlined text-primary text-[20px]">info</span>
          <span className="font-label-md text-sm">{toastMessage}</span>
        </div>
      )}

      <div className="flex flex-col w-full space-y-space-md">
        {/* Breadcrumb & SIAKAD Status */}
        <div className="flex flex-wrap items-center justify-between gap-space-sm">
          <nav className="flex items-center gap-2 font-body-sm text-body-sm text-outline">
            <button
              onClick={() => onNavigate && onNavigate('dasbor-dosen')}
              className="hover:text-primary transition-colors flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-[16px]">home</span>
              Dasbor
            </button>
            <span>/</span>
            <span className="text-secondary font-label-sm font-semibold">Kelas Diampu</span>
          </nav>
          <div className="flex items-center gap-space-sm bg-surface-container-high/80 px-3 py-1.5 rounded-lg shadow-sm">
            <span className="w-2 h-2 rounded-full bg-tertiary animate-pulse"></span>
            <span className="font-caption text-caption text-on-surface-variant font-mono">
              SINKRONISASI SIAKAD: AKTIF
            </span>
            <span className="text-outline">|</span>
            <span className="font-label-sm text-label-sm text-secondary">NIDN: 0612345601</span>
          </div>
        </div>

        {/* Page Hero Header */}
        <section className="bg-surface-container-low rounded-xl p-space-lg shadow-xl relative overflow-hidden border border-outline-variant/20">
          <div className="absolute -right-16 -top-16 w-80 h-80 rounded-full bg-primary/5 blur-3xl pointer-events-none"></div>
          <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-space-md">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-label-sm text-label-sm bg-primary-container text-on-primary-container px-2.5 py-0.5 rounded font-bold">
                  PORTAL DOSEN PENGAMPU
                </span>
                <span className="font-label-sm text-label-sm bg-surface-container-highest text-secondary px-2.5 py-0.5 rounded">
                  Semester Ganjil 2026/2027
                </span>
              </div>
              <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight font-bold">
                Daftar Kelas Perkuliahan Diampu
              </h1>
              <p className="font-body-md text-body-md text-on-surface-variant mt-1">
                Kelola 16 pertemuan terstruktur, distribusi materi ajar mandiri, dan monitoring presensi digital mahasiswa.
              </p>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => onNavigate && onNavigate('unggah-materi')}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-surface-container-high hover:bg-surface-container-highest text-on-surface font-label-md text-label-md transition-all shadow-sm border border-outline-variant/30"
              >
                <span className="material-symbols-outlined text-[18px] text-secondary">cloud_upload</span>
                <span>Unggah Materi</span>
              </button>
              <button
                type="button"
                onClick={() => onNavigate && onNavigate('rekap-kehadiran')}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-primary-container text-on-primary-container hover:bg-primary font-label-md text-label-md shadow-md transition-all"
              >
                <span className="material-symbols-outlined text-[18px]">table_chart</span>
                <span>Matriks Rekap</span>
              </button>
            </div>
          </div>
        </section>

        {/* State Tabs Selector */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <button
            type="button"
            onClick={() => setActiveTab('active')}
            className={`px-3.5 py-1.5 rounded-full font-label-sm text-label-sm transition-all shrink-0 ${
              activeTab === 'active'
                ? 'bg-primary text-on-primary'
                : 'bg-surface-container-high text-on-surface-variant hover:text-on-surface'
            }`}
          >
            Tampilan Aktif (3 Kelas Diampu)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('empty')}
            className={`px-3.5 py-1.5 rounded-full font-label-sm text-label-sm transition-all shrink-0 ${
              activeTab === 'empty'
                ? 'bg-primary text-on-primary'
                : 'bg-surface-container-high text-on-surface-variant hover:text-on-surface'
            }`}
          >
            Empty State Demo
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('loading')}
            className={`px-3.5 py-1.5 rounded-full font-label-sm text-label-sm transition-all shrink-0 ${
              activeTab === 'loading'
                ? 'bg-primary text-on-primary'
                : 'bg-surface-container-high text-on-surface-variant hover:text-on-surface'
            }`}
          >
            Skeleton Loading State
          </button>
        </div>

        {/* TAB 1: ACTIVE CLASSES */}
        {activeTab === 'active' && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {classes.map((cls) => (
              <article
                key={cls.id}
                className="bg-surface-container-low rounded-xl p-5 shadow-lg border border-outline-variant/20 flex flex-col justify-between hover:border-primary/40 transition-all group"
              >
                <div className="space-y-4">
                  {/* Header badges */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2.5 py-0.5 rounded font-mono font-bold text-[12px] bg-primary-container text-on-primary-container">
                        {cls.className}
                      </span>
                      <span className="px-2 py-0.5 rounded-full font-label-sm text-label-sm bg-surface-container text-secondary">
                        {cls.sks} SKS
                      </span>
                      <span className="px-2 py-0.5 rounded font-caption text-caption bg-surface-container-high text-on-surface-variant">
                        {cls.program}
                      </span>
                    </div>

                    {/* Context menu */}
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setActiveMenuId(activeMenuId === cls.id ? null : cls.id)}
                        className="p-1 rounded hover:bg-surface-container text-outline hover:text-on-surface transition-colors"
                      >
                        <span className="material-symbols-outlined text-[20px]">more_vert</span>
                      </button>
                      {activeMenuId === cls.id && (
                        <div className="absolute right-0 top-8 w-48 rounded-lg bg-surface-container-high shadow-xl py-1 z-30 font-label-sm text-label-sm text-on-surface border border-outline-variant/30">
                          <button
                            type="button"
                            onClick={() => {
                              setActiveMenuId(null);
                              onNavigate && onNavigate('kelola-kelas');
                            }}
                            className="w-full text-left flex items-center gap-2 px-3 py-1.5 hover:bg-surface-bright"
                          >
                            <span className="material-symbols-outlined text-[16px]">tune</span>
                            <span>Pengaturan Kelas</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setActiveMenuId(null);
                              onNavigate && onNavigate('menejemen-material');
                            }}
                            className="w-full text-left flex items-center gap-2 px-3 py-1.5 hover:bg-surface-bright"
                          >
                            <span className="material-symbols-outlined text-[16px]">description</span>
                            <span>Kelola Materi</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setActiveMenuId(null);
                              onNavigate && onNavigate('rekap-kehadiran');
                            }}
                            className="w-full text-left flex items-center gap-2 px-3 py-1.5 hover:bg-surface-bright"
                          >
                            <span className="material-symbols-outlined text-[16px]">table_chart</span>
                            <span>Matriks Presensi</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Title & Schedule */}
                  <div>
                    <h2
                      onClick={() => onNavigate && onNavigate('kelola-kelas')}
                      className="font-title-lg text-title-lg text-on-surface font-semibold hover:text-primary cursor-pointer transition-colors leading-snug"
                    >
                      {cls.title}
                    </h2>
                    <div className="flex items-start gap-2 mt-2 font-body-sm text-body-sm text-on-surface-variant">
                      <span className="material-symbols-outlined text-secondary text-[18px] shrink-0 mt-0.5">
                        schedule
                      </span>
                      <span>{cls.schedule}</span>
                    </div>
                  </div>

                  {/* 3 Mini Stats */}
                  <div className="grid grid-cols-3 gap-2 p-2.5 rounded-lg bg-surface-container text-center border border-outline-variant/20">
                    <div className="flex flex-col items-center">
                      <span className="font-headline-md text-headline-md text-on-surface font-bold leading-none">
                        {cls.meetingsCount}
                      </span>
                      <span className="font-caption text-caption text-outline mt-1">Pertemuan</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <span className="font-headline-md text-headline-md text-primary font-bold leading-none">
                        {cls.materialsCount}
                      </span>
                      <span className="font-caption text-caption text-outline mt-1">Materi Terbit</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <span className="font-headline-md text-headline-md text-on-surface font-bold leading-none">
                        {cls.enrolledCount}
                        <span className="font-body-sm text-body-sm text-outline">/{cls.capacity}</span>
                      </span>
                      <span className="font-caption text-caption text-outline mt-1">Mahasiswa</span>
                    </div>
                  </div>

                  {/* Presence Status */}
                  <div className="pt-1">
                    {cls.isPresenceActive ? (
                      <div className="inline-flex items-center justify-between w-full px-3 py-1.5 rounded-lg bg-tertiary-container/20 text-tertiary font-label-sm text-label-sm border border-tertiary/30">
                        <div className="flex items-center gap-2">
                          <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-tertiary opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-tertiary"></span>
                          </span>
                          <span>{cls.presenceStatus}</span>
                        </div>
                        <span className="font-caption font-semibold">{cls.presenceRemaining}</span>
                      </div>
                    ) : (
                      <div className="inline-flex items-center justify-between w-full px-3 py-1.5 rounded-lg bg-surface-container text-on-surface-variant font-label-sm text-label-sm">
                        <div className="flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-[16px]">schedule</span>
                          <span>{cls.presenceStatus}</span>
                        </div>
                        <span className="font-caption">{cls.presenceRemaining}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Action Buttons */}
                <div className="grid grid-cols-2 gap-2 pt-5 mt-2 border-t border-outline-variant/20">
                  <button
                    type="button"
                    onClick={() => onNavigate && onNavigate('kelola-kelas')}
                    className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-surface-container-high hover:bg-surface-container-highest text-on-surface font-label-md text-label-md transition-all"
                  >
                    <span className="material-symbols-outlined text-[18px] text-primary">edit_note</span>
                    <span>Kelola Kelas</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onNavigate && onNavigate('daftar-hadir-koreksi')}
                    className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-primary-container text-on-primary-container hover:bg-primary font-label-md text-label-md shadow-sm transition-all"
                  >
                    <span className="material-symbols-outlined text-[18px]">how_to_reg</span>
                    <span>Presensi</span>
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}

        {/* TAB 2: EMPTY STATE DEMO */}
        {activeTab === 'empty' && (
          <div className="bg-surface-container-low rounded-xl p-12 text-center border border-outline-variant/20 flex flex-col items-center max-w-lg mx-auto">
            <div className="w-16 h-16 rounded-2xl bg-surface-container-high flex items-center justify-center text-outline mb-4">
              <span className="material-symbols-outlined text-[36px]">co_present</span>
            </div>
            <h3 className="font-title-lg text-title-lg text-on-surface font-bold">
              Belum Ada Penugasan Kelas Aktif
            </h3>
            <p className="font-body-md text-body-md text-on-surface-variant mt-2">
              Anda belum ditugaskan sebagai dosen pengampu pada semester ini. Silakan hubungi Administrator PTIK untuk sinkronisasi jadwal mengajar.
            </p>
            <button
              type="button"
              onClick={() => showToast('Menghubungi UPT-PTIK UPGRIS')}
              className="mt-6 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-surface-container-high hover:bg-surface-bright text-secondary font-label-md text-label-md transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">support_agent</span>
              <span>Hubungi UPT PTIK</span>
            </button>
          </div>
        )}

        {/* TAB 3: SKELETON LOADING DEMO */}
        {activeTab === 'loading' && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="bg-surface-container-low rounded-xl p-5 shadow-lg border border-outline-variant/20 animate-pulse space-y-4"
              >
                <div className="flex justify-between items-center">
                  <div className="w-16 h-5 bg-surface-container-highest rounded"></div>
                  <div className="w-20 h-5 bg-surface-container-highest rounded-full"></div>
                </div>
                <div className="w-3/4 h-6 bg-surface-container-highest rounded"></div>
                <div className="w-full h-4 bg-surface-container-highest rounded"></div>
                <div className="grid grid-cols-3 gap-2 p-2 bg-surface-container rounded-lg">
                  <div className="h-10 bg-surface-container-highest rounded"></div>
                  <div className="h-10 bg-surface-container-highest rounded"></div>
                  <div className="h-10 bg-surface-container-highest rounded"></div>
                </div>
                <div className="w-full h-8 bg-surface-container-highest rounded"></div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
