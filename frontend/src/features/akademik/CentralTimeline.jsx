import React, { useState, useMemo } from 'react';
import AppShell from '../../components/AppShell';

export default function CentralTimeline({ onRoleChange, onNavigate, activeRole = 'mahasiswa' }) {
  const [filterType, setFilterType] = useState('all'); // 'all' | 'tugas' | 'presensi' | 'kuis'
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const timelineEvents = [
    {
      id: 'ev-1',
      dateGroup: 'Hari Ini • Senin, 06 Nov 2026',
      time: '08:00 - 10:30 WIB',
      type: 'presensi',
      typeLabel: 'Sesi Presensi Terbuka',
      badgeBg: 'bg-tertiary-container text-on-tertiary-container',
      courseName: 'TI-A • Rekayasa Perangkat Lunak',
      title: 'Pertemuan 4: Analisis Kebutuhan Perangkat Lunak & Siklus Hidup SRS',
      lecturer: 'Dr. Bayu Pratama, M.Kom.',
      room: 'Lab Komputasi 301 (Gedung B Lt. 3)',
      actionText: 'Isi Presensi Hadir',
      actionIcon: 'how_to_reg',
      actionRoute: 'status-presensi',
      urgent: true,
      deadlineText: 'Sisa Toleransi: 09m : 42s (BR-011)',
    },
    {
      id: 'ev-2',
      dateGroup: 'Hari Ini • Senin, 06 Nov 2026',
      time: 'Tenggat 23:59 WIB',
      type: 'tugas',
      typeLabel: 'Batas Pengumpulan Tugas',
      badgeBg: 'bg-error-container text-error',
      courseName: 'TI-A • Rekayasa Perangkat Lunak',
      title: 'Tugas 01: Penyusunan Dokumen Spesifikasi Kebutuhan (SRS) & Diagram UML',
      lecturer: 'Pengumpulan berkas PDF format IEEE 830',
      actionText: 'Kirim Berkas Tugas',
      actionIcon: 'upload_file',
      actionRoute: 'ruang-kelas?course=rpl-ti-a',
      urgent: true,
      deadlineText: 'Batas Waktu: Hari ini pukul 23:59 WIB',
    },
    {
      id: 'ev-3',
      dateGroup: 'Besok • Selasa, 07 Nov 2026',
      time: '13:00 - 15:30 WIB',
      type: 'presensi',
      typeLabel: 'Kuliah Terjadwal',
      badgeBg: 'bg-secondary-container text-on-secondary-container',
      courseName: 'TI-B • Pemrograman Web Berbasis Komponen',
      title: 'Pertemuan 4: Modularisasi State Management & Lifecycle Hooks',
      lecturer: 'Ir. Nina Kartika, M.T.',
      room: 'Lab Software 202',
      actionText: 'Buka Ruang Kelas',
      actionIcon: 'school',
      actionRoute: 'ruang-kelas?course=web-ti-b',
      urgent: false,
    },
    {
      id: 'ev-4',
      dateGroup: 'Kamis • 09 Nov 2026',
      time: '09:00 - 10:00 WIB',
      type: 'kuis',
      typeLabel: 'Kuis Singkat Online',
      badgeBg: 'bg-primary-container text-on-primary-container',
      courseName: 'TI-A • Basis Data Terdistribusi',
      title: 'Kuis Evaluasi CPMK-1: Sharding & Replikasi Horizontal Database',
      lecturer: 'Dr. Supriyono, M.Kom.',
      room: 'Daring via SPADA LMS',
      actionText: 'Lihat Kisi-kisi Kuis',
      actionIcon: 'quiz',
      actionRoute: 'ruang-kelas?course=rpl-ti-a',
      urgent: false,
    },
    {
      id: 'ev-5',
      dateGroup: 'Minggu Depan • 16 Nov 2026',
      time: 'Tenggat 23:59 WIB',
      type: 'tugas',
      typeLabel: 'Tugas Terstruktur',
      badgeBg: 'bg-surface-container-highest text-on-surface-variant',
      courseName: 'TI-A • Rekayasa Perangkat Lunak',
      title: 'Tugas 02: Desain Arsitektur Microservices & API Gateway',
      lecturer: 'Dr. Bayu Pratama, M.Kom.',
      actionText: 'Buka Modul Tugas',
      actionIcon: 'assignment',
      actionRoute: 'ruang-kelas?course=rpl-ti-a',
      urgent: false,
    },
  ];

  const filteredEvents = useMemo(() => {
    if (filterType === 'all') return timelineEvents;
    return timelineEvents.filter((ev) => ev.type === filterType);
  }, [timelineEvents, filterType]);

  const handleAction = (ev) => {
    if (ev.actionRoute) {
      onNavigate && onNavigate(ev.actionRoute);
    } else {
      showToast(`Membuka agenda: ${ev.title}`);
    }
  };

  return (
    <AppShell
      activeRole={activeRole}
      onRoleChange={onRoleChange}
      activeNavPath="central-timeline"
      onNavChange={onNavigate}
    >
      {/* Toast Alert */}
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

      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-space-xs text-on-surface-variant font-label-sm text-label-sm mb-space-md">
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            onNavigate && onNavigate(`dasbor-${activeRole}`);
          }}
          className="hover:text-primary transition-colors flex items-center gap-1"
        >
          <span className="material-symbols-outlined text-[16px]">home</span>
          <span>Beranda</span>
        </a>
        <span className="material-symbols-outlined text-[14px] text-outline">chevron_right</span>
        <span className="text-secondary font-semibold">Central Timeline &amp; Linimasa Perkuliahan</span>
      </nav>

      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-surface-container-high via-surface-container to-surface-container-low p-space-lg shadow-sm mb-space-lg border border-outline-variant/20">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-space-md">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-primary-container text-on-primary-container font-label-sm text-[12px] font-bold">
                Linimasa Terpadu
              </span>
              <span className="font-caption text-caption text-on-surface-variant">
                Semester Ganjil 2026/2027
              </span>
            </div>
            <h1 className="font-headline-sm text-headline-sm text-on-surface font-bold tracking-tight">
              Central Timeline &amp; Agenda Akademik
            </h1>
            <p className="font-body-md text-body-md text-on-surface-variant">
              Pemantauan terpusat batas pengumpulan tugas, pembukaan sesi presensi 15 menit, dan agenda perkuliahan.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => showToast('Sinkronisasi agenda Google Calendar / iCal... Unduh berkas agenda.ics berhasil.')}
              className="px-4 py-2 rounded-xl bg-surface-container-highest hover:bg-surface-bright text-on-surface font-label-md text-label-md font-semibold transition-all border border-outline-variant/30 flex items-center gap-1.5 shadow-sm"
            >
              <span className="material-symbols-outlined text-[18px]">calendar_month</span>
              <span>Sinkron ke Kalender (.ics)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filter Chips Bar */}
      <div className="bg-surface-container-low rounded-xl border border-outline-variant/20 p-space-md shadow-sm mb-space-lg flex flex-wrap items-center justify-between gap-space-md">
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            type="button"
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 rounded-lg text-label-sm font-semibold transition-all ${
              filterType === 'all'
                ? 'bg-primary-container text-on-primary-container font-bold shadow-sm'
                : 'bg-surface-container hover:bg-surface-container-high text-on-surface-variant'
            }`}
          >
            Semua Agenda ({timelineEvents.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterType('presensi')}
            className={`px-3 py-1.5 rounded-lg text-label-sm font-semibold transition-all flex items-center gap-1 ${
              filterType === 'presensi'
                ? 'bg-tertiary-container text-on-tertiary-container font-bold shadow-sm'
                : 'bg-surface-container hover:bg-surface-container-high text-on-surface-variant'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">how_to_reg</span>
            <span>Presensi</span>
          </button>
          <button
            type="button"
            onClick={() => setFilterType('tugas')}
            className={`px-3 py-1.5 rounded-lg text-label-sm font-semibold transition-all flex items-center gap-1 ${
              filterType === 'tugas'
                ? 'bg-error-container text-error font-bold shadow-sm'
                : 'bg-surface-container hover:bg-surface-container-high text-on-surface-variant'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">assignment</span>
            <span>Batas Waktu Tugas</span>
          </button>
          <button
            type="button"
            onClick={() => setFilterType('kuis')}
            className={`px-3 py-1.5 rounded-lg text-label-sm font-semibold transition-all flex items-center gap-1 ${
              filterType === 'kuis'
                ? 'bg-secondary-container text-on-secondary-container font-bold shadow-sm'
                : 'bg-surface-container hover:bg-surface-container-high text-on-surface-variant'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">quiz</span>
            <span>Kuis &amp; Ujian</span>
          </button>
        </div>

        <span className="font-caption text-caption text-on-surface-variant">
          Menampilkan {filteredEvents.length} aktivitas terdekat
        </span>
      </div>

      {/* Timeline Event Feed */}
      <div className="flex flex-col gap-space-lg mb-space-xl">
        {filteredEvents.map((ev) => (
          <div
            key={ev.id}
            className={`bg-surface-container-low rounded-2xl border p-space-md sm:p-space-lg shadow-sm transition-all hover:shadow-md ${
              ev.urgent ? 'border-primary/40 bg-surface-container-low/90' : 'border-outline-variant/20'
            }`}
          >
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-space-md">
              <div className="flex items-start gap-space-md min-w-0">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${
                  ev.type === 'presensi'
                    ? 'bg-tertiary-container/30 text-tertiary'
                    : ev.type === 'tugas'
                    ? 'bg-error-container/30 text-error'
                    : 'bg-secondary-container/30 text-secondary'
                }`}>
                  <span className="material-symbols-outlined text-[24px]">
                    {ev.type === 'presensi' ? 'how_to_reg' : ev.type === 'tugas' ? 'alarm' : 'quiz'}
                  </span>
                </div>

                <div className="flex flex-col gap-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-surface-container-high text-on-surface-variant font-caption text-[11px] font-bold uppercase">
                      {ev.courseName}
                    </span>
                    <span className={`px-2 py-0.5 rounded font-caption text-[11px] font-bold ${ev.badgeBg}`}>
                      {ev.typeLabel}
                    </span>
                    {ev.urgent && (
                      <span className="px-2 py-0.5 rounded bg-error text-white font-caption text-[10px] font-bold animate-pulse">
                        Mendesak
                      </span>
                    )}
                  </div>

                  <h3 className="font-title-md text-title-md font-bold text-on-surface leading-snug">
                    {ev.title}
                  </h3>

                  <p className="font-body-sm text-body-sm text-on-surface-variant">
                    {ev.lecturer} {ev.room ? `• ${ev.room}` : ''}
                  </p>

                  <div className="flex items-center gap-3 mt-1 text-label-sm font-semibold">
                    <span className="text-primary flex items-center gap-1">
                      <span className="material-symbols-outlined text-[16px]">schedule</span>
                      {ev.dateGroup} ({ev.time})
                    </span>
                    {ev.deadlineText && (
                      <span className="text-error font-medium">{ev.deadlineText}</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="self-end md:self-center shrink-0">
                <button
                  type="button"
                  onClick={() => handleAction(ev)}
                  className={`px-5 py-2.5 rounded-xl text-label-md font-bold transition-all flex items-center gap-2 shadow-sm ${
                    ev.urgent
                      ? 'bg-primary text-on-primary hover:bg-primary/90'
                      : 'bg-surface-container-high hover:bg-surface-bright text-on-surface border border-outline-variant/30'
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]">{ev.actionIcon}</span>
                  <span>{ev.actionText}</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </AppShell>
  );
}
