import React, { useState, useEffect, useRef, useMemo } from 'react';
import AppShell from '../../components/AppShell';
import { getCourseById } from '../../data/courseCatalog';

/**
 * RuangKelas — Feature Component
 *
 * Ruang kelas mahasiswa untuk satu mata kuliah. Seluruh isi (identitas MK,
 * dosen, jadwal, 16 pertemuan, rekap presensi, RPS) dibaca dari
 * data/courseCatalog.js berdasarkan `courseId` yang diteruskan App.jsx, sehingga
 * mata kuliah yang tampil selalu sama dengan kartu yang diklik di dasbor.
 *
 * Tab:
 *   1. Pertemuan — daftar 16 sesi dari katalog, akordeon, unduh materi,
 *      presensi mandiri pada sesi yang sedang berjalan.
 *   2. Rekap Kehadiran — rekap presensi mahasiswa.
 *   3. Silabus & RPS — capaian dan rencana mingguan (CPL berbasis OBE).
 */

const BADGE_BY_STATUS = {
  HADIR: {
    className: 'bg-mvp-success-tint text-mvp-success-strong',
    icon: 'check_circle',
    label: 'HADIR',
  },
  SESI_AKTIF: {
    className: 'bg-mvp-primary-tint text-mvp-primary-strong',
    icon: 'timer',
    label: 'SESI TERBUKA',
  },
  TERKUNCI: {
    className: 'bg-mvp-subtle text-mvp-muted',
    icon: 'lock',
    label: 'TERKUNCI',
  },
  EVALUASI_UTS: {
    className: 'bg-mvp-warning-tint text-mvp-warning-ink',
    icon: 'fact_check',
    label: 'UTS',
  },
  EVALUASI_UAS: {
    className: 'bg-mvp-danger-tint text-mvp-danger-strong',
    icon: 'flag',
    label: 'UAS',
  },
};

const RPS_WEEKS = [
  { pl: 'CPL 01 • Pengetahuan', desc: 'Menguasai konsep, proses, dan metodologi rekayasa perangkat lunak.' },
  { pl: 'CPL 02 • Keterampilan Khusus', desc: 'Mampu memodelkan kebutuhan, merancang arsitektur, dan menguji sistem.' },
  { pl: 'CPL 03 • Sikap & Kerja Tim', desc: 'Berkolaborasi secara profesional dan akuntabel dalam tim pengembang.' },
];

export default function RuangKelas({ onNavigate, onRoleChange, courseId }) {
  const course = useMemo(() => getCourseById(courseId), [courseId]);

  const [activeTab, setActiveTab] = useState('pertemuan'); // 'pertemuan' | 'presensi' | 'silabus'
  const [expanded, setExpanded] = useState(() => new Set(['p3']));
  const [attendedIds, setAttendedIds] = useState(() => new Set());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(1694);
  const [modalTugasOpen, setModalTugasOpen] = useState(false);
  const [toast, setToast] = useState({ visible: false, message: '', type: 'info' });

  const toastTimeoutRef = useRef(null);
  const submitTimeoutRef = useRef(null);

  // Bersihkan semua timer saat komponen dilepas agar tidak ada setState
  // setelah unmount.
  useEffect(() => {
    return () => {
      clearTimeout(toastTimeoutRef.current);
      clearTimeout(submitTimeoutRef.current);
    };
  }, []);

  // Hitung mundur sesi presensi aktif. Dependensi kosong: interval dibuat sekali
  // dan nilai dibaca lewat updater, bukan memicu re-subscribe tiap detik.
  useEffect(() => {
    const interval = setInterval(() => {
      setRemainingSeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Tutup modal dengan tombol Escape.
  useEffect(() => {
    if (!modalTugasOpen) return undefined;
    const onKeyDown = (event) => {
      if (event.key === 'Escape') setModalTugasOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [modalTugasOpen]);

  const showToast = (message, type = 'info') => {
    clearTimeout(toastTimeoutRef.current);
    setToast({ visible: true, message, type });
    toastTimeoutRef.current = setTimeout(() => {
      setToast((prev) => ({ ...prev, visible: false }));
      toastTimeoutRef.current = null;
    }, 3200);
  };

  const formatCountdown = (secs) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins} menit ${s < 10 ? '0' : ''}${s} detik`;
  };

  const toggleAccordion = (id) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const setAllAccordions = (open) => {
    setExpanded(open ? new Set(course.meetings.map((m) => m.id)) : new Set());
  };

  const handleConfirmPresence = (meeting) => {
    setIsSubmitting(true);
    clearTimeout(submitTimeoutRef.current);
    submitTimeoutRef.current = setTimeout(() => {
      setIsSubmitting(false);
      setAttendedIds((prev) => new Set(prev).add(meeting.id));
      showToast(`Kehadiran ${meeting.title.split('•')[0].trim()} berhasil dicatat.`, 'success');
    }, 600);
  };

  const handleDownloadFile = (fileName) => {
    showToast(`Mengunduh berkas: ${fileName}`, 'info');
  };

  const handlePrintAttendance = () => {
    showToast('Menyiapkan berita acara presensi untuk dicetak...', 'info');
    setTimeout(() => window.print(), 400);
  };

  // Metrik kehadiran: sesi yang sudah dicatat + sesi aktif yang baru dikonfirmasi.
  const attendedCount = course.attendedSessions + attendedIds.size;
  const conductedCount = Math.max(course.conductedSessions, attendedCount);
  const attendancePct = conductedCount > 0 ? Math.round((attendedCount / conductedCount) * 100) : 0;
  const attendanceEligible = attendancePct >= 70;
  const progressPct = Math.round((course.currentMeeting / course.totalMeetings) * 100);

  const tabClass = (tab) =>
    `pb-3 text-sm whitespace-nowrap transition-colors flex items-center gap-1.5 cursor-pointer border-b-2 ${
      activeTab === tab
        ? 'text-mvp-primary-strong font-bold border-mvp-primary'
        : 'text-mvp-muted hover:text-mvp-ink font-medium border-transparent'
    }`;

  return (
    <AppShell
      activeRole="mahasiswa"
      onRoleChange={onRoleChange}
      activeNavPath="ruang-kelas"
      onNavChange={onNavigate}
    >
      <div className="flex flex-col w-full pb-16 space-y-6 pt-2 max-w-7xl mx-auto">
        {/* Toast Notification */}
        {toast.visible && (
          <div className="fixed top-5 right-5 z-[9999]" role="status" aria-live="polite">
            <div
              className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl border ${
                toast.type === 'success'
                  ? 'bg-mvp-success-tint text-mvp-success-strong border-mvp-success/40'
                  : 'bg-mvp-card text-mvp-ink border-mvp-line'
              }`}
            >
              <span className="material-symbols-outlined text-[20px]">
                {toast.type === 'success' ? 'check_circle' : 'info'}
              </span>
              <span className="font-label-md text-label-md">{toast.message}</span>
              <button
                type="button"
                onClick={() => setToast((prev) => ({ ...prev, visible: false }))}
                aria-label="Tutup notifikasi"
                className="p-1 rounded hover:opacity-75"
              >
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            </div>
          </div>
        )}

        {/* BREADCRUMB & STATUS BAR */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <nav
            aria-label="Breadcrumb"
            className="flex items-center space-x-2 text-on-surface-variant font-label-md text-label-md"
          >
            <button
              type="button"
              onClick={() => onNavigate && onNavigate('dasbor-mahasiswa')}
              className="hover:text-primary transition-colors flex items-center gap-1 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">home</span>
              <span>Dasbor</span>
            </button>
            <span className="material-symbols-outlined text-[16px] text-outline">chevron_right</span>
            <button
              type="button"
              onClick={() => onNavigate && onNavigate('kelas-saya-mahasiswa')}
              className="hover:text-primary transition-colors cursor-pointer"
            >
              Kelas Saya
            </button>
            <span className="material-symbols-outlined text-[16px] text-outline">chevron_right</span>
            <span className="text-on-surface font-semibold truncate max-w-xs md:max-w-none">
              {course.name} ({course.classGroup})
            </span>
          </nav>
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-container-high text-tertiary font-label-sm text-label-sm shadow-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-tertiary opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-tertiary" />
              </span>
              <span>{course.semester}</span>
              <span className="text-outline">•</span>
              <span className="font-bold text-on-surface">Enrolled Aktif</span>
            </div>
          </div>
        </div>

        {/* CLASS HEADER CARD */}
        <div className="bg-mvp-card rounded-xl shadow-xl p-6 md:p-8 text-mvp-ink transition-all">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="flex-1 space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-1 rounded-md bg-mvp-primary-tint text-mvp-primary-strong font-mono text-xs font-bold tracking-wide">
                  {course.classGroup}
                </span>
                <span className="px-2.5 py-1 rounded-md bg-mvp-subtle text-mvp-body text-xs font-semibold">
                  {course.sks} SKS
                </span>
                <span className="px-2.5 py-1 rounded-md bg-mvp-success-soft text-mvp-success-strong text-xs font-semibold">
                  Reguler Pagi
                </span>
                <span className="px-2.5 py-1 rounded-md bg-mvp-subtle text-mvp-body text-xs font-medium">
                  Kode MK: {course.code}
                </span>
              </div>

              <div>
                <h1 className="text-2xl md:text-3xl font-headline-lg font-bold text-mvp-ink tracking-tight">
                  {course.name}
                </h1>
                <p className="text-mvp-muted font-body-sm text-body-sm mt-1">
                  Program Studi S1 Teknik Informatika • Fakultas Pendidikan Matematika, Ilmu
                  Pengetahuan Alam dan Teknologi Informasi
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-mvp-primary-tint flex items-center justify-center text-mvp-primary-strong font-bold shrink-0">
                    <span className="material-symbols-outlined text-[20px]">person</span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-mvp-muted font-medium">Dosen Pengampu</p>
                    <p className="text-sm font-semibold text-mvp-ink truncate">{course.lecturer}</p>
                    <p className="text-xs text-mvp-muted font-mono">NIDN: {course.nidn}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-mvp-subtle flex items-center justify-center text-mvp-body shrink-0">
                    <span className="material-symbols-outlined text-[20px]">calendar_clock</span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-mvp-muted font-medium">Waktu Perkuliahan</p>
                    <p className="text-sm font-semibold text-mvp-ink">{course.schedule}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-mvp-primary-soft flex items-center justify-center text-mvp-primary-strong shrink-0">
                    <span className="material-symbols-outlined text-[20px]">menu_book</span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-mvp-muted font-medium">Struktur Kurikulum</p>
                    <p className="text-sm font-semibold text-mvp-ink">
                      {course.totalMeetings} Pertemuan Terstruktur
                    </p>
                    <p className="text-xs text-mvp-muted">Standar Nasional Dikti (OBE)</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Attendance Ring */}
            <div className="flex flex-row sm:flex-col items-center justify-center lg:pl-8 lg:border-l lg:border-mvp-line gap-4 shrink-0 bg-mvp-page p-4 rounded-xl lg:bg-transparent lg:p-0">
              <div className="relative w-24 h-24 flex items-center justify-center shrink-0">
                <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 96 96" aria-hidden="true">
                  <circle cx="48" cy="48" fill="none" r="40" className="stroke-mvp-line" strokeWidth="8" />
                  <circle
                    className="transition-all duration-700 ease-out stroke-mvp-primary"
                    cx="48"
                    cy="48"
                    fill="none"
                    r="40"
                    strokeDasharray="251.2"
                    strokeDashoffset={251.2 - (251.2 * attendancePct) / 100}
                    strokeLinecap="round"
                    strokeWidth="8"
                  />
                </svg>
                <div className="absolute flex flex-col items-center justify-center">
                  <span className="text-xl font-bold font-headline-md text-mvp-ink leading-none">
                    {attendancePct}%
                  </span>
                  <span className="text-[10px] text-mvp-muted font-medium mt-0.5">
                    {attendedCount}/{conductedCount} Sesi
                  </span>
                </div>
              </div>
              <div className="text-left sm:text-center">
                <h2 className="text-sm font-bold text-mvp-ink">Kehadiran Saya</h2>
                <p
                  className={`text-xs font-semibold flex items-center sm:justify-center gap-1 mt-0.5 ${
                    attendanceEligible ? 'text-mvp-success-strong' : 'text-mvp-danger-strong'
                  }`}
                >
                  <span className="material-symbols-outlined text-[14px]">
                    {attendanceEligible ? 'verified' : 'error'}
                  </span>
                  <span>{attendanceEligible ? 'Memenuhi Syarat UTS' : 'Di Bawah Syarat UTS'}</span>
                </p>
                <p className="text-[11px] text-mvp-muted mt-1 max-w-[170px]">
                  Batas minimum kehadiran 70% untuk akses ujian.
                </p>
              </div>
            </div>
          </div>

          {/* Course Progress Bar */}
          <div className="mt-6 pt-5 border-t border-mvp-line flex flex-col gap-2">
            <div className="flex items-center justify-between text-xs text-mvp-body">
              <span className="font-medium">
                Progres Kelas:{' '}
                <strong className="text-mvp-primary-strong font-bold">
                  {course.currentMeeting} / {course.totalMeetings} Pertemuan
                </strong>{' '}
                Terlaksana
              </span>
              <span className="font-mono text-mvp-muted font-semibold">{progressPct}% Selesai</span>
            </div>
            <div className="w-full bg-mvp-subtle rounded-full h-2 overflow-hidden">
              <div
                className="bg-mvp-primary h-2 rounded-full transition-all duration-500"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-6 mt-6 border-b border-mvp-line overflow-x-auto">
            <button type="button" onClick={() => setActiveTab('pertemuan')} className={tabClass('pertemuan')}>
              <span className="material-symbols-outlined text-[18px]">calendar_view_week</span>
              <span>Pertemuan ({course.totalMeetings} Sesi)</span>
            </button>
            <button type="button" onClick={() => setActiveTab('presensi')} className={tabClass('presensi')}>
              <span className="material-symbols-outlined text-[18px]">how_to_reg</span>
              <span>Rekap Kehadiran Saya</span>
            </button>
            <button type="button" onClick={() => setActiveTab('silabus')} className={tabClass('silabus')}>
              <span className="material-symbols-outlined text-[18px]">article</span>
              <span>Silabus &amp; Rencana Kuliah</span>
            </button>
          </div>
        </div>

        {/* ═════ TAB 1: PERTEMUAN ═════ */}
        {activeTab === 'pertemuan' && (
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1 py-1">
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase tracking-wider font-bold text-on-surface-variant">
                  Daftar Pertemuan Perkuliahan
                </span>
                <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-surface-container-high text-on-surface">
                  {course.totalMeetings} Sesi
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setAllAccordions(true)}
                  className="px-2.5 py-1 rounded bg-surface-container-low hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface transition-colors font-medium cursor-pointer"
                >
                  Buka Semua
                </button>
                <button
                  type="button"
                  onClick={() => setAllAccordions(false)}
                  className="px-2.5 py-1 rounded bg-surface-container-low hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface transition-colors font-medium cursor-pointer"
                >
                  Tutup Semua
                </button>
              </div>
            </div>

            {course.meetings.map((meeting) => {
              const badge = BADGE_BY_STATUS[meeting.status] || BADGE_BY_STATUS.TERKUNCI;
              const isOpen = expanded.has(meeting.id);
              const isLive = meeting.status === 'SESI_AKTIF';
              const isDone = meeting.status === 'HADIR' || attendedIds.has(meeting.id);
              const isEvaluation =
                meeting.status === 'EVALUASI_UTS' || meeting.status === 'EVALUASI_UAS';

              return (
                <div
                  key={meeting.id}
                  className={`rounded-xl bg-mvp-card text-mvp-ink overflow-hidden transition-all duration-200 ${
                    isLive
                      ? 'shadow-xl border-l-4 border-l-mvp-primary ring-2 ring-mvp-primary/20'
                      : 'shadow-sm'
                  } ${!isDone && !isLive ? 'opacity-90' : ''}`}
                >
                  <button
                    type="button"
                    onClick={() => toggleAccordion(meeting.id)}
                    aria-expanded={isOpen}
                    className="w-full text-left p-4 md:p-5 flex items-center justify-between gap-4 hover:bg-mvp-page/80 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center font-mono font-bold text-sm shrink-0 ${
                          isLive
                            ? 'bg-mvp-primary text-white shadow-md'
                            : isDone
                              ? 'bg-mvp-subtle text-mvp-body'
                              : 'bg-mvp-subtle text-mvp-muted'
                        }`}
                      >
                        P{meeting.number}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className="text-xs font-semibold px-2 py-0.5 rounded bg-mvp-primary-soft text-mvp-primary-strong">
                            {meeting.tag}
                          </span>
                          <span className="text-xs text-mvp-muted font-medium">• {meeting.date}</span>
                        </div>
                        <h3 className="text-sm md:text-base font-bold text-mvp-ink truncate">
                          {meeting.title}
                        </h3>
                        <p className="text-xs text-mvp-muted mt-0.5">
                          {isEvaluation
                            ? 'Evaluasi pembelajaran terjadwal'
                            : `${meeting.materialsCount} Materi Pembelajaran Tersedia`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${badge.className}`}
                      >
                        <span className="material-symbols-outlined text-[16px]">{badge.icon}</span>
                        <span className="hidden sm:inline">{badge.label}</span>
                      </span>
                      <span
                        className={`material-symbols-outlined text-mvp-muted transition-transform duration-200 ${
                          isOpen ? 'rotate-180' : ''
                        }`}
                      >
                        expand_more
                      </span>
                    </div>
                  </button>

                  {isOpen && (
                    <div className="px-5 pb-5 pt-2 border-t border-mvp-line bg-mvp-page/60 space-y-4">
                      <p className="text-xs text-mvp-body leading-relaxed">{meeting.description}</p>

                      {/* Presensi aktif */}
                      {isLive && (
                        <div className="rounded-xl bg-mvp-primary-soft p-4 md:p-5">
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="relative flex h-3 w-3">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-mvp-success opacity-75" />
                                  <span className="relative inline-flex rounded-full h-3 w-3 bg-mvp-success" />
                                </span>
                                <span className="text-xs font-bold tracking-wider text-mvp-success-strong uppercase">
                                  Sesi Presensi Aktif
                                </span>
                              </div>
                              <h4 className="text-base font-bold text-mvp-ink">
                                Konfirmasi Kehadiran {meeting.title.split('•')[0].trim()}
                              </h4>
                              <p className="text-xs text-mvp-body">
                                Dibuka oleh <strong>{course.lecturer}</strong> • Batas toleransi{' '}
                                <strong>{course.attendanceDeadline}</strong>{' '}
                                <span className="text-mvp-primary-strong font-semibold">
                                  (Tersisa {formatCountdown(remainingSeconds)})
                                </span>
                              </p>
                            </div>
                            <div className="shrink-0">
                              {isDone ? (
                                <div className="px-5 py-2.5 rounded-lg bg-mvp-success text-white font-label-md text-label-md font-bold shadow-md flex items-center justify-center gap-2">
                                  <span className="material-symbols-outlined text-[20px]">
                                    check_circle
                                  </span>
                                  <span>Kehadiran Berhasil Dicatat</span>
                                </div>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => handleConfirmPresence(meeting)}
                                  disabled={isSubmitting || remainingSeconds === 0}
                                  className="w-full sm:w-auto px-5 py-2.5 rounded-lg bg-mvp-primary hover:bg-mvp-primary-hover text-white font-label-md text-label-md font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                                >
                                  <span
                                    className={`material-symbols-outlined text-[20px] ${
                                      isSubmitting ? 'animate-spin' : ''
                                    }`}
                                  >
                                    {isSubmitting ? 'refresh' : 'check_circle'}
                                  </span>
                                  <span>
                                    {isSubmitting ? 'Mencatat Kehadiran...' : 'Isi Kehadiran Sekarang'}
                                  </span>
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Materi */}
                      {meeting.materials.length > 0 && (
                        <div className="space-y-2">
                          <h4 className="text-sm font-bold text-mvp-ink flex items-center gap-2">
                            <span className="material-symbols-outlined text-mvp-primary-strong text-[18px]">
                              folder_open
                            </span>
                            <span>Materi Pembelajaran ({meeting.materials.length} Berkas)</span>
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {meeting.materials.map((material) => (
                              <div
                                key={material.name}
                                className="p-3.5 rounded-xl bg-mvp-subtle flex items-start justify-between gap-3"
                              >
                                <div className="flex items-start gap-3 min-w-0">
                                  <div className="w-10 h-10 rounded-lg bg-mvp-card text-mvp-danger-ink flex items-center justify-center shrink-0">
                                    <span className="material-symbols-outlined text-[22px]">
                                      {material.type === 'pdf' ? 'picture_as_pdf' : 'description'}
                                    </span>
                                  </div>
                                  <div className="min-w-0">
                                    <p className="text-xs md:text-sm font-bold text-mvp-ink truncate">
                                      {material.name}
                                    </p>
                                    <p className="text-[11px] text-mvp-muted mt-0.5">
                                      {material.size} • Diunggah oleh {course.lecturer}
                                    </p>
                                  </div>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => handleDownloadFile(material.name)}
                                  aria-label={`Unduh ${material.name}`}
                                  className="p-2 rounded-lg bg-mvp-card text-mvp-body hover:text-mvp-primary-strong hover:bg-mvp-primary-soft transition-colors shrink-0 cursor-pointer"
                                >
                                  <span className="material-symbols-outlined text-[20px]">
                                    download
                                  </span>
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Tugas pada sesi berjalan */}
                      {isLive && course.activeTasks > 0 && (
                        <div className="p-4 rounded-xl bg-mvp-subtle space-y-3">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div className="flex items-center gap-2.5">
                              <div className="w-9 h-9 rounded-lg bg-mvp-warning-tint text-mvp-warning-ink flex items-center justify-center shrink-0">
                                <span className="material-symbols-outlined text-[20px]">
                                  assignment
                                </span>
                              </div>
                              <div>
                                <span className="text-xs font-bold text-mvp-warning-ink uppercase tracking-wider">
                                  Tugas Kelompok Terstruktur
                                </span>
                                <h5 className="text-sm font-bold text-mvp-ink">
                                  Tugas 01: Penyusunan Dokumen SRS Fungsional
                                </h5>
                              </div>
                            </div>
                            <span className="px-2.5 py-1 rounded-full bg-mvp-warning-soft text-mvp-warning-ink text-xs font-bold flex items-center gap-1 self-start sm:self-auto">
                              <span className="w-2 h-2 rounded-full bg-mvp-warning-base" />
                              <span>Belum Dikumpulkan</span>
                            </span>
                          </div>
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-mvp-body pt-2 border-t border-mvp-line">
                            <span className="flex items-center gap-1 text-mvp-muted">
                              <span className="material-symbols-outlined text-[16px]">schedule</span>
                              <span>
                                Tenggat: <strong className="text-mvp-ink">Senin, 19 Okt 2026 • 23:59 WIB</strong>
                              </span>
                            </span>
                            <button
                              type="button"
                              onClick={() => setModalTugasOpen(true)}
                              className="px-3.5 py-1.5 rounded-lg bg-mvp-primary hover:bg-mvp-primary-hover text-white font-label-sm text-label-sm font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                            >
                              <span>Lihat Detail Tugas &amp; Upload</span>
                              <span className="material-symbols-outlined text-[16px]">
                                arrow_forward
                              </span>
                            </button>
                          </div>
                        </div>
                      )}

                      {!isDone && !isLive && !isEvaluation && (
                        <p className="text-xs text-mvp-muted italic">
                          Materi dan sesi presensi akan diaktifkan otomatis saat jadwal perkuliahan
                          dimulai pada {meeting.date}.
                        </p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* ═════ TAB 2: REKAP KEHADIRAN ═════ */}
        {activeTab === 'presensi' && (
          <div className="space-y-4">
            <div className="bg-mvp-card rounded-xl shadow-lg p-6 text-mvp-ink space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-bold text-mvp-ink">Rekapitulasi Kehadiran Mahasiswa</h2>
                  <p className="text-xs text-mvp-muted">
                    Rekor presensi terintegrasi sistem server SPADA LMS UPGRIS.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handlePrintAttendance}
                  className="px-3 py-1.5 rounded-lg bg-mvp-subtle text-mvp-body hover:bg-mvp-line text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">print</span>
                  <span>Cetak Bukti Presensi</span>
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-mvp-subtle text-mvp-body font-bold border-b border-mvp-line">
                      <th className="py-2.5 px-3">Sesi</th>
                      <th className="py-2.5 px-3">Tanggal Kuliah</th>
                      <th className="py-2.5 px-3">Topik Perkuliahan</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3 text-right">Verifikasi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-mvp-line text-mvp-body">
                    {course.meetings
                      .filter((meeting) => meeting.status === 'HADIR' || meeting.status === 'SESI_AKTIF')
                      .map((meeting) => {
                        const recorded = meeting.status === 'HADIR' || attendedIds.has(meeting.id);
                        const badge = BADGE_BY_STATUS[recorded ? 'HADIR' : meeting.status];
                        return (
                          <tr key={meeting.id} className={!recorded ? 'bg-mvp-primary-soft/50' : ''}>
                            <td className="py-3 px-3 font-mono font-bold text-mvp-ink">
                              P{meeting.number}
                            </td>
                            <td className="py-3 px-3">{meeting.date}</td>
                            <td className="py-3 px-3 font-medium text-mvp-ink">
                              {meeting.title.replace(/^P\d+\s•\s/, '')}
                            </td>
                            <td className="py-3 px-3">
                              <span
                                className={`px-2 py-0.5 rounded-full font-bold text-[11px] ${badge.className}`}
                              >
                                {badge.label}
                              </span>
                            </td>
                            <td
                              className={`py-3 px-3 text-right font-medium ${
                                recorded ? 'text-mvp-success-strong' : 'text-mvp-muted'
                              }`}
                            >
                              {recorded ? 'Valid IP Kampus' : 'Menunggu Aksi'}
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ═════ TAB 3: SILABUS & RPS ═════ */}
        {activeTab === 'silabus' && (
          <div className="space-y-4">
            <div className="bg-mvp-card rounded-xl shadow-lg p-6 text-mvp-ink space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-bold text-mvp-ink">
                    Rencana Pembelajaran Semester (RPS)
                  </h2>
                  <p className="text-xs text-mvp-muted">
                    Capaian Pembelajaran Lulusan (CPL) dan rencana mingguan berstandar OBE.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleDownloadFile(`Silabus_RPS_${course.code}.pdf`)}
                  className="px-3.5 py-1.5 rounded-lg bg-mvp-primary hover:bg-mvp-primary-hover text-white text-xs font-bold flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">file_download</span>
                  <span>Unduh Silabus Lengkap (PDF)</span>
                </button>
              </div>

              <p className="text-xs text-mvp-body leading-relaxed">{course.description}</p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {RPS_WEEKS.map((item) => (
                  <div key={item.pl} className="p-4 rounded-xl bg-mvp-page space-y-2">
                    <h3 className="text-xs font-bold text-mvp-muted uppercase tracking-wider">
                      {item.pl}
                    </h3>
                    <p className="text-xs text-mvp-body font-medium">{item.desc}</p>
                  </div>
                ))}
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-mvp-subtle text-mvp-body font-bold border-b border-mvp-line">
                      <th className="py-2.5 px-3">Pertemuan</th>
                      <th className="py-2.5 px-3">Tanggal</th>
                      <th className="py-2.5 px-3">Bahan Kajian</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-mvp-line text-mvp-body">
                    {course.meetings.map((meeting) => (
                      <tr key={meeting.id}>
                        <td className="py-2.5 px-3 font-mono font-bold text-mvp-ink">
                          P{meeting.number}
                        </td>
                        <td className="py-2.5 px-3">{meeting.date}</td>
                        <td className="py-2.5 px-3">{meeting.tag}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Panduan Status Presensi */}
        <div className="pt-6">
          <div className="flex items-center gap-2 mb-3 px-1">
            <span className="material-symbols-outlined text-primary text-[20px]">info</span>
            <h2 className="text-sm font-bold text-on-surface">
              Panduan Status Presensi Perkuliahan (Siklus Sesi Mahasiswa)
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-xl bg-mvp-card p-5 text-mvp-ink shadow-md space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-mvp-subtle text-mvp-muted flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[22px]">lock</span>
                  </div>
                  <div>
                    <span className="text-xs font-bold text-mvp-muted uppercase tracking-wider">
                      State 1: Terkunci (Locked)
                    </span>
                    <h3 className="text-sm font-bold text-mvp-ink">Sesi Presensi Belum Dibuka</h3>
                  </div>
                </div>
              </div>
              <p className="text-xs text-mvp-body">
                Dosen pengampu belum membuka portal presensi untuk sesi ini. Tombol presensi otomatis
                terkunci hingga kelas dimulai.
              </p>
              <button
                type="button"
                disabled
                className="w-full py-2.5 px-4 rounded-lg bg-mvp-subtle text-mvp-muted font-label-md text-label-md font-semibold cursor-not-allowed flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-[18px]">lock</span>
                <span>Isi Kehadiran (Terkunci)</span>
              </button>
            </div>

            <div className="rounded-xl bg-mvp-card p-5 text-mvp-ink shadow-md space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-mvp-success-tint text-mvp-success-strong flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[22px]">check_circle</span>
                  </div>
                  <div>
                    <span className="text-xs font-bold text-mvp-success-strong uppercase tracking-wider">
                      State 2: Selesai (Confirmed)
                    </span>
                    <h3 className="text-sm font-bold text-mvp-ink">Kehadiran Berhasil Divalidasi</h3>
                  </div>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-mvp-success-tint text-mvp-success-strong flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">verified</span>
                  <span>Tervalidasi Server</span>
                </span>
              </div>
              <p className="text-xs text-mvp-body">
                Kehadiran Anda tercatat <strong>HADIR</strong> dan tervalidasi melalui IP kampus
                UPGRIS.
              </p>
              <div className="w-full py-2 px-4 rounded-lg bg-mvp-success-soft text-mvp-success-strong font-label-md text-label-md font-bold flex items-center justify-center gap-2">
                <span className="material-symbols-outlined text-[18px]">verified</span>
                <span>Status: Kehadiran Tersimpan Permanen</span>
              </div>
            </div>
          </div>
        </div>

        {/* MODAL: Detail Tugas */}
        {modalTugasOpen && (
          <div
            className="fixed inset-0 z-[100] bg-overlay backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setModalTugasOpen(false)}
          >
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="modal-tugas-title"
              className="bg-mvp-card rounded-2xl border border-mvp-line max-w-lg w-full p-6 shadow-2xl"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="flex items-center justify-between pb-4 border-b border-mvp-line">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-mvp-warning-ink text-[24px]">
                    assignment
                  </span>
                  <h3
                    id="modal-tugas-title"
                    className="font-title-lg text-title-lg text-mvp-ink font-bold"
                  >
                    Tugas 01: Penyusunan SRS Fungsional
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setModalTugasOpen(false)}
                  aria-label="Tutup dialog"
                  className="p-1 rounded-lg text-mvp-muted hover:text-mvp-ink hover:bg-mvp-subtle transition-colors"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
              <div className="py-4 space-y-3 font-body-sm text-body-sm text-mvp-body">
                <div className="p-3 rounded-lg bg-mvp-page space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-mvp-muted">Batas Pengumpulan:</span>
                    <span className="font-semibold text-mvp-ink">Senin, 19 Okt 2026, 23:59 WIB</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-mvp-muted">Bobot Nilai:</span>
                    <span className="font-semibold text-mvp-success-strong">
                      15% dari Total Nilai Akhir
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-mvp-muted">Ketentuan Format:</span>
                    <span className="font-semibold text-mvp-ink">PDF (Maks. 10 MB)</span>
                  </div>
                </div>
                <p>
                  Unggah dokumen SRS hasil elisitasi kelompok Anda mengacu pada template IEEE 830
                  yang telah disediakan pada berkas materi {course.name}.
                </p>
              </div>
              <div className="pt-2 flex justify-end gap-2 border-t border-mvp-line">
                <button
                  type="button"
                  onClick={() => setModalTugasOpen(false)}
                  className="px-4 py-2 rounded-lg bg-mvp-subtle text-mvp-body font-label-md"
                >
                  Tutup
                </button>
                <button
                  type="button"
                  onClick={() => {
                    showToast('Membuka formulir pengumpulan tugas...', 'info');
                    setModalTugasOpen(false);
                  }}
                  className="px-4 py-2 rounded-lg bg-mvp-primary text-white font-label-md font-semibold"
                >
                  Upload Berkas Tugas
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}