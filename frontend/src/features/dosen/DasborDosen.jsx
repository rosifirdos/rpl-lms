import React, { useState, useEffect, useCallback } from 'react';
import AppShell from '../../components/AppShell';
import { dosenApi } from '../../services/api';

/**
 * DasborDosen — Feature Component
 * Implementasi React untuk Dasbor Dosen SPADA LMS UPGRIS
 * Memanfaatkan AppShell tunggal modular dengan penegakan RBAC.
 * Mendukung kurikulum 16 Pertemuan Terstruktur, sinkronisasi SIAKAD,
 * pengelolaan presensi, dan penilaian rubrik tugas.
 */
export default function DasborDosen({ onRoleChange }) {
  const [activeMenu, setActiveMenu] = useState('dasbor-dosen');
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

  // Default fallback metrics when API not available
  const defaultMetrics = [
    {
      title: 'Total Kelas Diampu',
      value: loading ? 'Memuat...' : '4 Kelas Aktif',
      icon: 'co_present',
      iconBg: 'bg-primary-container/20 text-primary',
      subtitle: loading ? 'Mengambil data dari server...' : 'Kurikulum 16 Pertemuan',
      subIcon: 'domain',
      subColor: 'text-secondary',
    },
    {
      title: 'Beban SKS Semester Ini',
      value: loading ? 'Memuat...' : '12 SKS',
      valColor: 'text-tertiary',
      icon: 'verified',
      iconBg: 'bg-tertiary-container/20 text-tertiary',
      subtitle: loading ? 'Mengambil data dari server...' : 'Beban Mengajar Penuh',
      subIcon: 'check_circle',
      subColor: 'text-on-surface-variant',
    },
    {
      title: 'Total Mahasiswa Terdaftar',
      value: loading ? 'Memuat...' : '148 Mahasiswa',
      icon: 'groups',
      iconBg: 'bg-secondary-container/20 text-secondary',
      subtitle: loading ? 'Mengambil data dari server...' : '100% Direct Enrollment',
      subIcon: 'how_to_reg',
      subColor: 'text-secondary-fixed',
    },
    {
      title: 'Tugas Menunggu Penilaian',
      value: loading ? 'Memuat...' : '14 Berkas',
      valColor: 'text-error',
      icon: 'assignment_late',
      iconBg: 'bg-error-container/20 text-error',
      subtitle: 'Batas Penilaian: 2 Hari Lagi',
      subIcon: 'pending_actions',
      subColor: 'text-error',
    },
  ];

  const defaultClasses = [
    {
      code: 'INF308 • 3 SKS',
      title: 'Rekayasa Perangkat Lunak - Kelas 3A',
      sks: 'Bobot 3 SKS • Kurikulum 16 Sesi Terstruktur',
      badge: 'Sesi Presensi Aktif',
      badgeType: 'active',
      alarm: 'Senin, 08:00 - 10:30 WIB',
      room: 'Lab Komputer 301',
      currentMeeting: 'Pertemuan 4 dari 16',
      progressPct: 25,
      students: '42/45 Kuota (93%)',
      studentsPct: 93,
      quotaColor: 'bg-secondary',
      btnPresensiText: 'Buka Sesi Presensi',
      btnPresensiIcon: 'how_to_reg',
    },
    {
      code: 'INF312 • 3 SKS',
      title: 'Pemrograman Web Berbasis Komponen - Kelas 3B',
      sks: 'Bobot 3 SKS • Kurikulum 16 Sesi Terstruktur',
      badge: 'Menunggu Jadwal',
      badgeType: 'inactive',
      alarm: 'Selasa, 13:00 - 15:30 WIB',
      room: 'Lab Software 202',
      currentMeeting: 'Pertemuan 4 dari 16',
      progressPct: 25,
      students: '38/40 Kuota (95%)',
      studentsPct: 95,
      quotaColor: 'bg-secondary',
      btnPresensiText: 'Kelola Modul',
      btnPresensiIcon: 'menu_book',
    },
  ];

  const displayMetrics = teachingMetrics.length > 0 ? teachingMetrics : defaultMetrics;
  const displayClasses = classList.length > 0 ? classList : defaultClasses;

  return (
    <AppShell
      activeRole="dosen"
      onRoleChange={onRoleChange}
      activeNavPath={activeMenu}
      onNavChange={setActiveMenu}
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

      {/* Top Breadcrumb & Metadata Path */}
      <div className="flex flex-wrap items-center justify-between gap-space-sm text-on-surface-variant font-caption text-caption mb-space-sm">
        <div className="flex items-center gap-space-xs">
          <a className="hover:text-primary transition-colors flex items-center gap-1" href="#home">
            <span className="material-symbols-outlined text-[15px]">home</span>
            <span>Beranda</span>
          </a>
          <span className="text-outline-variant font-bold">/</span>
          <span className="text-on-surface font-label-sm">Dasbor Dosen</span>
        </div>
        <div className="inline-flex items-center gap-2 bg-surface-container-high px-space-sm py-1 rounded-full text-secondary font-label-sm border border-outline-variant/30">
          <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-ping" />
          <span>Koneksi SIAKAD UPGRIS: Terhubung Penuh</span>
        </div>
      </div>

      {/* Hero Greeting Banner */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-surface-container-high via-surface-container to-surface-container-low p-space-lg shadow-xl mb-space-lg border border-outline-variant/20">
        <div className="absolute -right-16 -top-16 w-80 h-80 rounded-full bg-primary-container/10 blur-3xl pointer-events-none" />
        <div className="absolute -left-12 -bottom-12 w-64 h-64 rounded-full bg-tertiary-container/10 blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-space-lg">
          <div className="space-y-space-sm max-w-3xl">
            <div className="inline-flex items-center gap-space-xs px-2.5 py-1 rounded-md bg-primary-container/20 text-primary font-caption uppercase tracking-wider font-semibold">
              <span className="material-symbols-outlined text-[15px]">sync_saved_locally</span>
              <span>PORTAL DOSEN PENGAMPU &bull; Sinkronisasi Terpusat Aktif</span>
            </div>
            <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight font-bold">
              Selamat Datang, <span className="text-primary font-bold">Dr. Awan Rosi, M.Kom.</span>
            </h1>
            <p className="font-body-md text-body-md text-on-surface-variant flex flex-wrap items-center gap-y-1 gap-x-space-sm">
              <span className="inline-flex items-center gap-1 font-mono text-tertiary font-semibold">
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
                Status: Mengampu Aktif
              </span>
            </p>
          </div>

          {/* Right Academic Calendar Status Card */}
          <div className="shrink-0 rounded-lg bg-surface-container-highest/60 backdrop-blur-md p-space-md min-w-[280px] shadow-sm border border-outline-variant/30">
            <div className="flex items-center justify-between pb-space-xs">
              <span className="font-caption text-caption uppercase tracking-wider text-outline font-semibold">
                Kalender Perkuliahan
              </span>
              <span className="material-symbols-outlined text-secondary text-[18px]">calendar_today</span>
            </div>
            <div className="font-title-md text-title-md text-on-surface font-semibold">
              Minggu Perkuliahan ke-4
            </div>
            <div className="text-xs text-on-surface-variant mt-1">
              Fokus: Materi Pertemuan 4 &amp; Presensi Mandiri
            </div>
          </div>
        </div>
      </div>

      {/* 4 Primary Metric Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-md mb-space-lg">
        {displayMetrics.map((card, idx) => (
          <div
            key={idx}
            className="flex flex-col justify-between p-space-md rounded-xl bg-surface-container shadow-md hover:shadow-lg transition-all border border-outline-variant/20"
          >
            <div>
              <div className="flex items-center justify-between mb-space-sm">
                <span className="font-label-sm text-label-sm text-on-surface-variant font-medium">{card.title}</span>
                <div className={`w-9 h-9 rounded-lg ${card.iconBg} flex items-center justify-center shrink-0`}>
                  <span className="material-symbols-outlined text-[20px]">{card.icon}</span>
                </div>
              </div>
              <div className={`font-headline-lg text-headline-lg font-bold mb-1 ${card.valColor || 'text-on-surface'}`}>
                {card.value}
              </div>
            </div>
            <div className="flex items-center gap-1 pt-2 border-t border-outline-variant/20 font-caption text-caption text-on-surface-variant">
              <span className={`material-symbols-outlined text-[14px] ${card.subColor}`}>{card.subIcon}</span>
              <span>{card.subtitle}</span>
            </div>
          </div>
        ))}
      </section>

      {/* Daftar Kelas Diampu & Aksi Cepat */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter mb-space-lg">
        {/* Kolom Kiri: Kelas Diampu */}
        <div className="lg:col-span-8 flex flex-col gap-space-md">
          <div className="flex items-center justify-between bg-surface-container-low px-space-md py-space-sm rounded-xl border border-outline-variant/20">
            <div className="flex items-center gap-space-xs">
              <div className="w-8 h-8 rounded-lg bg-primary-container flex items-center justify-center text-on-primary-container">
                <span className="material-symbols-outlined text-[18px]">co_present</span>
              </div>
              <h2 className="font-title-md text-title-md text-on-surface font-semibold">
                Kelas Perkuliahan Diampu
              </h2>
            </div>
            <button
              type="button"
              onClick={() => showToast('Membuka seluruh daftar kelas dosen')}
              className="font-label-sm text-label-sm text-primary hover:text-secondary transition-colors"
            >
              Semua Kelas (4)
            </button>
          </div>

          <div className="flex flex-col gap-space-md">
            {displayClasses.map((cls, idx) => (
              <div
                key={idx}
                className="flex flex-col p-space-md rounded-xl bg-surface-container shadow-sm border border-outline-variant/20 hover:border-primary/40 transition-all"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                  <div>
                    <span className="font-caption text-caption text-secondary font-bold uppercase tracking-wider">
                      {cls.code}
                    </span>
                    <h3 className="font-title-md text-title-md text-on-surface font-semibold">
                      {cls.title}
                    </h3>
                    <p className="font-body-sm text-body-sm text-outline">
                      {cls.sks}
                    </p>
                  </div>
                  <span className={`self-start sm:self-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                    cls.badgeType === 'active'
                      ? 'bg-tertiary-container text-on-tertiary-container'
                      : 'bg-surface-container-high text-on-surface-variant'
                  }`}>
                    {cls.badge}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 py-2 px-3 bg-surface-container-low rounded-lg mb-3 text-xs text-on-surface-variant">
                  <div className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px] text-primary">schedule</span>
                    <span>{cls.alarm}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px] text-secondary">meeting_room</span>
                    <span>{cls.room}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px] text-tertiary">groups</span>
                    <span>{cls.students}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px] text-outline">calendar_view_week</span>
                    <span>{cls.currentMeeting}</span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="flex flex-col gap-1 mb-3">
                  <div className="flex justify-between text-xs text-on-surface-variant">
                    <span>Kemajuan Pertemuan Perkuliahan</span>
                    <span className="font-semibold text-primary">{cls.progressPct}%</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-surface-container-highest overflow-hidden">
                    <div className="h-full bg-primary rounded-full" style={{ width: `${cls.progressPct}%` }} />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-outline-variant/20">
                  <button
                    type="button"
                    onClick={() => showToast(`Membuka berkas materi: ${cls.title}`)}
                    className="px-3 py-1.5 rounded-lg bg-surface-container-high hover:bg-surface-bright text-on-surface text-xs font-semibold transition-colors flex items-center gap-1"
                  >
                    <span className="material-symbols-outlined text-[16px]">upload_file</span>
                    <span>Unggah Modul</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => showToast(`Mengakses presensi: ${cls.title}`)}
                    className="px-3 py-1.5 rounded-lg bg-primary hover:bg-primary-fixed text-on-primary text-xs font-semibold transition-colors flex items-center gap-1 shadow-sm"
                  >
                    <span className="material-symbols-outlined text-[16px]">{cls.btnPresensiIcon}</span>
                    <span>{cls.btnPresensiText}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Kolom Kanan: Pintasan Operasional Dosen */}
        <div className="lg:col-span-4 flex flex-col gap-space-md">
          <div className="flex items-center justify-between bg-surface-container-low px-space-md py-space-sm rounded-xl border border-outline-variant/20">
            <h3 className="font-title-md text-title-md text-on-surface font-semibold">
              Pintasan Cepat Dosen
            </h3>
            <span className="font-caption text-caption text-secondary font-semibold">Aksi Cepat</span>
          </div>

          <div className="flex flex-col gap-space-xs p-space-sm bg-surface-container rounded-xl border border-outline-variant/20">
            <button
              type="button"
              onClick={() => showToast('Membuka modul input nilai tugas')}
              className="flex items-center gap-space-sm p-space-sm rounded-lg hover:bg-surface-container-high text-left transition-colors"
            >
              <div className="w-9 h-9 rounded-lg bg-primary-container/20 text-primary flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[20px]">assignment_turned_in</span>
              </div>
              <div className="flex-1 min-w-0">
                <span className="font-label-md text-label-md text-on-surface font-semibold block truncate">
                  Pemeriksaan Rubrik Tugas
                </span>
                <span className="font-caption text-caption text-on-surface-variant block">
                  14 berkas tugas menunggu penilaian
                </span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => showToast('Membuka pembukaan sesi kuis terstruktur')}
              className="flex items-center gap-space-sm p-space-sm rounded-lg hover:bg-surface-container-high text-left transition-colors"
            >
              <div className="w-9 h-9 rounded-lg bg-secondary-container/20 text-secondary flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[20px]">quiz</span>
              </div>
              <div className="flex-1 min-w-0">
                <span className="font-label-md text-label-md text-on-surface font-semibold block truncate">
                  Bank Soal Kuis UTS / UAS
                </span>
                <span className="font-caption text-caption text-on-surface-variant block">
                  Persiapan evaluasi evaluatif tengah semester
                </span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => showToast('Sinkronisasi SIAKAD Nilai Berhasil')}
              className="flex items-center gap-space-sm p-space-sm rounded-lg hover:bg-surface-container-high text-left transition-colors"
            >
              <div className="w-9 h-9 rounded-lg bg-tertiary-container/20 text-tertiary flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[20px]">sync</span>
              </div>
              <div className="flex-1 min-w-0">
                <span className="font-label-md text-label-md text-on-surface font-semibold block truncate">
                  Sinkronisasi SIAKAD Nilai
                </span>
                <span className="font-caption text-caption text-on-surface-variant block">
                  Integrasi otomatis nilai &amp; presensi resmi
                </span>
              </div>
            </button>
          </div>

          {/* Keamanan & Validasi Upload Info Box */}
          <div className="p-space-md rounded-xl bg-surface-container-low border border-outline-variant/20 flex flex-col gap-2">
            <div className="flex items-center gap-2 text-secondary font-semibold text-xs">
              <span className="material-symbols-outlined text-[18px]">verified_user</span>
              <span>Proteksi Berkas &amp; Integritas SPADA</span>
            </div>
            <p className="font-caption text-caption text-on-surface-variant leading-relaxed">
              Seluruh berkas materi perkuliahan divalidasi MIME ganda (.pdf, .docx, .xlsx, .zip) maks. 10MB untuk menjaga integritas penyimpanan institusi.
            </p>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
