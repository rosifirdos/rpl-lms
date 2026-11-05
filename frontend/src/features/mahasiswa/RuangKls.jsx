import React, { useState, useEffect, useRef } from 'react';
import AppShell from '../../components/AppShell';
import { getCourseById } from '../../data/courseCatalog';

/**
 * RuangKls — Feature Component
 *
 * Ruang Kelas Mahasiswa dengan 16 Pertemuan Terstruktur OBE, distribusi materi,
 * presensi digital terpadu, dan silabus RPS.
 * Terintegrasi penuh dengan AppShell, RBAC, dan CourseCatalog dinamis.
 */
export default function RuangKls({ onNavigate, onRoleChange, courseId }) {
  const course = getCourseById(courseId);
  const [activeTab, setActiveTab] = useState('pertemuan'); // 'pertemuan' | 'presensi' | 'silabus'

  // Accordion states for meetings
  const [openAccordions, setOpenAccordions] = useState(() => {
    const initial = {};
    course.meetings.forEach((m) => {
      initial[m.id] = m.status === 'SESI_AKTIF';
    });
    return initial;
  });

  // Toast notification with cleanup ref
  const [toastMessage, setToastMessage] = useState(null);
  const toastTimeoutRef = useRef(null);

  // Check-in and attendance states
  const [checkInDone, setCheckInDone] = useState(false);
  const [attendanceTime, setAttendanceTime] = useState('09:20 WIB');
  const [isSubmittingPresence, setIsSubmittingPresence] = useState(false);

  // Modal Tugas
  const [modalTugasOpen, setModalTugasOpen] = useState(false);
  const [selectedTugas, setSelectedTugas] = useState(null);

  // Countdown timer for active session (~28m 14s)
  const [remainingSeconds, setRemainingSeconds] = useState(1694);

  // Cleanup toast timeout on unmount
  useEffect(() => {
    return () => {
      if (toastTimeoutRef.current) {
        clearTimeout(toastTimeoutRef.current);
      }
    };
  }, []);

  // Countdown timer with proper cleanup
  useEffect(() => {
    if (remainingSeconds <= 0) return;
    const interval = setInterval(() => {
      setRemainingSeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatCountdown = (secs) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins} menit ${s < 10 ? '0' : ''}${s} detik`;
  };

  const showToast = (msg) => {
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }
    setToastMessage(msg);
    toastTimeoutRef.current = setTimeout(() => {
      setToastMessage(null);
      toastTimeoutRef.current = null;
    }, 3500);
  };

  const toggleAccordion = (id) => {
    setOpenAccordions((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const toggleAllMeetings = (open) => {
    const newState = {};
    course.meetings.forEach((m) => {
      newState[m.id] = open;
    });
    setOpenAccordions(newState);
    showToast(open ? 'Semua pertemuan dibuka' : 'Semua pertemuan ditutup');
  };

  const activeSession = course.meetings.find((m) => m.status === 'SESI_AKTIF');

  const handleCheckIn = () => {
    setIsSubmittingPresence(true);
    setTimeout(() => {
      setIsSubmittingPresence(false);
      setCheckInDone(true);
      const now = new Date();
      const timeStr = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB';
      setAttendanceTime(timeStr);
      showToast(
        `Presensi Pertemuan ${activeSession ? activeSession.number : course.currentMeeting} berhasil dicatat! Status: HADIR (${timeStr})`
      );
    }, 600);
  };

  const handleDownloadFile = (fileName) => {
    showToast(`Mengunduh berkas: ${fileName}`);
  };

  const handlePrintAttendance = () => {
    showToast('Menyiapkan Berita Acara Presensi untuk dicetak...');
    setTimeout(() => {
      window.print();
    }, 400);
  };

  const openDetailTugas = (tugas) => {
    setSelectedTugas(tugas);
    setModalTugasOpen(true);
  };

  const attended = checkInDone ? course.attendedSessions + 1 : course.attendedSessions;
  const conducted = course.conductedSessions;
  const attendancePct = Math.round((attended / conducted) * 100);
  const attendanceEligible = attendancePct >= 70;
  const dashOffset = 251.2 - (251.2 * attendancePct) / 100;
  const progressPct = Math.round((course.currentMeeting / course.totalMeetings) * 100);

  return (
    <AppShell
      activeRole="mahasiswa"
      onRoleChange={onRoleChange}
      activeNavPath="ruang-kelas"
      onNavChange={onNavigate}
    >
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-surface-container-highest text-on-surface px-4 py-3 rounded-xl shadow-2xl border border-primary/30 animate-fade-in">
          <span className="material-symbols-outlined text-primary text-[20px]">check_circle</span>
          <span className="font-label-md text-sm">{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="p-1 hover:opacity-75 cursor-pointer ml-2"
          >
            <span className="material-symbols-outlined text-[16px]">close</span>
          </button>
        </div>
      )}

      <div className="flex flex-col w-full space-y-space-md max-w-7xl mx-auto">
        {/* Breadcrumb Navigation */}
        <div className="flex flex-wrap items-center justify-between gap-space-sm">
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 font-body-sm text-body-sm text-outline">
            <button
              onClick={() => onNavigate && onNavigate('dasbor-mahasiswa')}
              className="hover:text-primary transition-colors flex items-center gap-1 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">home</span>
              Dasbor
            </button>
            <span>/</span>
            <button
              onClick={() => onNavigate && onNavigate('kelas-saya-mahasiswa')}
              className="text-on-surface-variant hover:text-primary transition-colors cursor-pointer"
            >
              Kelas Saya
            </button>
            <span>/</span>
            <span className="text-secondary font-label-sm font-semibold truncate max-w-xs sm:max-w-none">
              {course.name} ({course.classGroup})
            </span>
          </nav>
          <div className="flex items-center gap-space-sm bg-surface-container-high/80 px-3 py-1.5 rounded-lg shadow-sm">
            <span className="w-2 h-2 rounded-full bg-tertiary animate-pulse"></span>
            <span className="font-caption text-caption text-on-surface-variant">{course.semester}</span>
          </div>
        </div>

        {/* Hero Class Banner Card */}
        <section className="bg-surface-container-low rounded-xl p-space-lg shadow-xl relative overflow-hidden border border-outline-variant/20">
          <div className="absolute -right-16 -top-16 w-80 h-80 rounded-full bg-primary/5 blur-3xl pointer-events-none"></div>

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-space-lg">
            {/* Left Info */}
            <div className="flex-1 space-y-space-sm">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-label-sm text-label-sm bg-primary-container text-on-primary-container px-2.5 py-1 rounded font-bold">
                  {course.classGroup}
                </span>
                <span className="font-label-sm text-label-sm bg-surface-container-highest text-secondary px-2.5 py-1 rounded font-medium">
                  {course.sks} SKS • Teori &amp; Praktik
                </span>
                <span className="font-caption text-caption bg-surface-container-lowest text-outline px-2 py-1 rounded font-mono">
                  Kode MK: {course.code}
                </span>
              </div>

              <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight font-bold">
                {course.name}
              </h1>

              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-y-2 gap-x-4 pt-1 font-body-sm text-body-sm text-on-surface-variant">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px] text-secondary">person</span>
                  <span>{course.lecturer} (Dosen Pengampu)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px] text-tertiary">schedule</span>
                  <span>{course.schedule}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px] text-primary">auto_stories</span>
                  <span>{course.totalMeetings} Pertemuan Terstruktur (OBE)</span>
                </div>
              </div>
            </div>

            {/* Right Attendance Circular Gauge */}
            <div className="flex flex-row sm:flex-col items-center justify-center lg:pl-8 lg:border-l lg:border-outline-variant/20 gap-3 shrink-0 bg-surface-container p-4 rounded-xl lg:bg-transparent lg:p-0">
              <div className="relative w-24 h-24 flex items-center justify-center shrink-0">
                <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 96 96">
                  <circle cx="48" cy="48" fill="none" r="40" stroke="#334155" strokeWidth="8"></circle>
                  <circle
                    className="transition-all duration-700 ease-out"
                    cx="48"
                    cy="48"
                    fill="none"
                    r="40"
                    stroke="#38BDF8"
                    strokeDasharray="251.2"
                    strokeDashoffset={dashOffset}
                    strokeLinecap="round"
                    strokeWidth="8"
                  ></circle>
                </svg>
                <div className="absolute flex flex-col items-center justify-center">
                  <span className="text-xl font-bold font-headline-md text-on-surface leading-none">
                    {attendancePct}%
                  </span>
                  <span className="text-[10px] text-on-surface-variant font-medium mt-0.5">
                    {attended}/{conducted} Sesi
                  </span>
                </div>
              </div>
              <div className="text-left sm:text-center">
                <h3 className="text-sm font-bold text-on-surface">Kehadiran Saya</h3>
                <p
                  className={`text-xs font-semibold flex items-center sm:justify-center gap-1 mt-0.5 ${
                    attendanceEligible ? 'text-tertiary' : 'text-error'
                  }`}
                >
                  <span className="material-symbols-outlined text-[14px]">
                    {attendanceEligible ? 'verified' : 'error'}
                  </span>
                  <span>{attendanceEligible ? 'Memenuhi Syarat UTS' : 'Belum Memenuhi Syarat UTS'}</span>
                </p>
                <p className="text-[11px] text-outline mt-1 max-w-[170px]">
                  Batas minimum kehadiran 70% untuk akses evaluasi ujian.
                </p>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-6 pt-5 border-t border-outline-variant/20 flex flex-col gap-2">
            <div className="flex items-center justify-between text-xs text-on-surface-variant">
              <span>
                Progres Kelas:{' '}
                <strong className="text-primary font-bold">
                  {course.currentMeeting} / {course.totalMeetings} Pertemuan
                </strong>{' '}
                Terlaksana
              </span>
              <span className="font-mono text-outline font-semibold">{progressPct}% Selesai</span>
            </div>
            <div className="w-full bg-surface-container rounded-full h-2 overflow-hidden">
              <div
                className="bg-primary h-2 rounded-full transition-all duration-500"
                style={{ width: `${progressPct}%` }}
              ></div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-6 mt-6 border-b border-outline-variant/20 overflow-x-auto">
            <button
              type="button"
              onClick={() => setActiveTab('pertemuan')}
              className={`pb-3 text-sm font-bold flex items-center gap-1.5 transition-colors border-b-2 whitespace-nowrap cursor-pointer ${
                activeTab === 'pertemuan'
                  ? 'text-primary border-primary'
                  : 'text-on-surface-variant border-transparent hover:text-on-surface'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">calendar_view_week</span>
              <span>Pertemuan ({course.totalMeetings} Sesi)</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('presensi')}
              className={`pb-3 text-sm font-bold flex items-center gap-1.5 transition-colors border-b-2 whitespace-nowrap cursor-pointer ${
                activeTab === 'presensi'
                  ? 'text-primary border-primary'
                  : 'text-on-surface-variant border-transparent hover:text-on-surface'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">how_to_reg</span>
              <span>Rekap Kehadiran Saya</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('silabus')}
              className={`pb-3 text-sm font-bold flex items-center gap-1.5 transition-colors border-b-2 whitespace-nowrap cursor-pointer ${
                activeTab === 'silabus'
                  ? 'text-primary border-primary'
                  : 'text-on-surface-variant border-transparent hover:text-on-surface'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">article</span>
              <span>Silabus &amp; RPS</span>
            </button>
          </div>
        </section>

        {/* TAB 1: PERTEMUAN (ACCORDION MEETINGS) */}
        {activeTab === 'pertemuan' && (
          <div className="space-y-3">
            {/* Filter & Expand Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1 py-1">
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase tracking-wider font-bold text-outline">
                  Daftar Pertemuan Perkuliahan
                </span>
                <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-surface-container-high text-on-surface">
                  {course.totalMeetings} Sesi
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => toggleAllMeetings(true)}
                  className="px-2.5 py-1 rounded bg-surface-container hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface transition-colors font-medium border border-outline-variant/30 cursor-pointer"
                >
                  Buka Semua
                </button>
                <button
                  type="button"
                  onClick={() => toggleAllMeetings(false)}
                  className="px-2.5 py-1 rounded bg-surface-container hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface transition-colors font-medium border border-outline-variant/30 cursor-pointer"
                >
                  Tutup Semua
                </button>
              </div>
            </div>

            {/* Accordion Stack */}
            <div className="space-y-3">
              {course.meetings.map((m) => {
                const isOpen = openAccordions[m.id];
                const isCheckedIn = checkInDone && m.status === 'SESI_AKTIF';
                const statusClass = isCheckedIn
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : m.statusClass;
                const statusIcon = isCheckedIn ? 'check_circle' : m.icon;
                const statusLabel = isCheckedIn
                  ? 'HADIR'
                  : m.status === 'SESI_AKTIF'
                    ? 'SESI AKTIF'
                    : m.status;

                return (
                  <div
                    key={m.id}
                    className="rounded-xl bg-surface-container-low border border-outline-variant/20 shadow-sm overflow-hidden transition-all duration-200"
                  >
                    {/* Header */}
                    <button
                      type="button"
                      onClick={() => toggleAccordion(m.id)}
                      className="w-full text-left p-4 md:p-5 flex items-center justify-between gap-4 hover:bg-surface-container transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div className="w-10 h-10 rounded-lg bg-surface-container-highest flex items-center justify-center font-mono font-bold text-secondary text-sm shrink-0">
                          P{m.number}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-primary-container/20 text-primary">
                              {m.tag}
                            </span>
                            <span className="text-xs text-outline font-medium">• {m.date}</span>
                          </div>
                          <h3 className="text-sm md:text-base font-bold text-on-surface truncate">
                            {m.title}
                          </h3>
                          <p className="text-xs text-on-surface-variant mt-0.5">
                            {m.materialsCount} Materi Pembelajaran Tersedia
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${statusClass}`}
                        >
                          <span className="material-symbols-outlined text-[16px]">{statusIcon}</span>
                          <span className="hidden sm:inline">{statusLabel}</span>
                        </span>
                        <span
                          className={`material-symbols-outlined text-outline transition-transform duration-200 ${
                            isOpen ? 'rotate-180' : ''
                          }`}
                        >
                          expand_more
                        </span>
                      </div>
                    </button>

                    {/* Accordion Body */}
                    {isOpen && (
                      <div className="px-5 pb-5 pt-3 border-t border-outline-variant/20 bg-surface-container/40 space-y-4">
                        <div className="p-3.5 rounded-lg bg-surface-container-low text-on-surface-variant font-body-sm text-body-sm leading-relaxed border-l-2 border-primary">
                          {m.description}
                        </div>

                        {/* Interactive Attendance Action for active session */}
                        {m.status === 'SESI_AKTIF' && (
                          <div className="rounded-xl bg-gradient-to-br from-primary-container/20 to-secondary-container/10 p-4 sm:p-5 border border-primary/30 shadow-sm">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <span className="relative flex h-3 w-3">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                                  </span>
                                  <span className="text-xs font-bold tracking-wider text-emerald-400 uppercase">
                                    SESI PRESENSI AKTIF
                                  </span>
                                  <span className="text-xs text-outline">• Presensi Mandiri Mahasiswa</span>
                                </div>
                                <h4 className="text-base font-bold text-on-surface">
                                  Konfirmasi Kehadiran Kuliah Sesi P{m.number}
                                </h4>
                                <p className="text-xs text-on-surface-variant">
                                  Dibuka pukul 09:15 WIB oleh <strong>{course.lecturer}</strong> • Batas toleransi{' '}
                                  <span className="text-secondary font-semibold">
                                    (Tersisa {formatCountdown(remainingSeconds)})
                                  </span>
                                  .
                                </p>
                              </div>
                              <div className="shrink-0">
                                {isCheckedIn ? (
                                  <div className="px-4 py-2.5 rounded-lg bg-emerald-600 text-white font-label-md text-label-md font-bold shadow-md flex items-center justify-center gap-2">
                                    <span className="material-symbols-outlined text-[20px]">check_circle</span>
                                    <span>Kehadiran Berhasil Dicatat ({attendanceTime})</span>
                                  </div>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={handleCheckIn}
                                    disabled={isSubmittingPresence}
                                    className="w-full sm:w-auto px-5 py-2.5 rounded-lg bg-primary hover:opacity-90 active:opacity-100 text-on-primary font-label-md text-label-md font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                                  >
                                    <span className={`material-symbols-outlined text-[20px] ${isSubmittingPresence ? 'animate-spin' : ''}`}>
                                      {isSubmittingPresence ? 'refresh' : 'how_to_reg'}
                                    </span>
                                    <span>{isSubmittingPresence ? 'Mencatat Kehadiran...' : 'Isi Presensi Sekarang'}</span>
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Materials Section */}
                        {m.materials.length > 0 ? (
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-outline uppercase tracking-wider flex items-center gap-1.5">
                                <span className="material-symbols-outlined text-[16px] text-primary">folder_open</span>
                                <span>Berkas Materi Pembelajaran ({m.materials.length}):</span>
                              </span>
                              <span className="text-[11px] text-outline">Format PDF &amp; Bahan Tayang</span>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                              {m.materials.map((file, idx) => (
                                <div
                                  key={idx}
                                  className="p-3 bg-surface-container rounded-xl flex items-center justify-between gap-3 border border-outline-variant/20 hover:border-primary/40 transition-colors"
                                >
                                  <div className="flex items-center gap-2.5 min-w-0">
                                    <div className="w-9 h-9 rounded-lg bg-primary-container/20 text-primary flex items-center justify-center shrink-0">
                                      <span className="material-symbols-outlined text-[20px]">
                                        {file.type === 'pdf' ? 'picture_as_pdf' : 'description'}
                                      </span>
                                    </div>
                                    <div className="min-w-0">
                                      <span className="text-xs font-bold text-on-surface truncate block">
                                        {file.name}
                                      </span>
                                      <span className="text-[11px] text-outline font-mono">
                                        {file.size} • Diunggah Dosen
                                      </span>
                                    </div>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => handleDownloadFile(file.name)}
                                    className="p-2 rounded-lg bg-surface-container-high hover:bg-primary-container text-on-surface hover:text-on-primary-container transition-colors shrink-0 cursor-pointer"
                                    title={`Unduh ${file.name}`}
                                  >
                                    <span className="material-symbols-outlined text-[18px]">download</span>
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <p className="text-xs text-outline italic">
                            Belum ada materi pembelajaran yang diunggah untuk sesi ini.
                          </p>
                        )}

                        {/* Assignment Section if applicable */}
                        {(m.number === 3 || m.number === 8 || m.number === 16) && (
                          <div className="p-4 rounded-xl bg-surface-container border border-outline-variant/30 space-y-3">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                              <div className="flex items-center gap-2.5">
                                <div className="w-9 h-9 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                                  <span className="material-symbols-outlined text-[20px]">assignment</span>
                                </div>
                                <div>
                                  <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">
                                    Penugasan Terstruktur OBE
                                  </span>
                                  <h5 className="text-sm font-bold text-on-surface">
                                    {m.number === 3
                                      ? 'Tugas 01: Analisis Kebutuhan & Dokumen SRS'
                                      : m.number === 8
                                        ? 'Evaluasi Tengah Semester (UTS): Studi Kasus'
                                        : 'Evaluasi Akhir Semester (UAS): Portofolio Proyek'}
                                  </h5>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="px-2 py-0.5 rounded bg-surface-container-high text-on-surface text-xs font-semibold">
                                  Bobot: {m.number === 3 ? '15%' : '30%'}
                                </span>
                                <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 text-xs font-bold flex items-center gap-1">
                                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                                  <span>Tenggat Aktif</span>
                                </span>
                              </div>
                            </div>
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-on-surface-variant pt-2 border-t border-outline-variant/20">
                              <span className="flex items-center gap-1">
                                <span className="material-symbols-outlined text-[16px] text-outline">schedule</span>
                                <span>Batas Waktu: <strong>Jumat, 23:59 WIB</strong></span>
                              </span>
                              <button
                                type="button"
                                onClick={() =>
                                  openDetailTugas({
                                    title: m.number === 3
                                      ? 'Tugas 01: Analisis Kebutuhan & Dokumen SRS'
                                      : 'Evaluasi Sesi Perkuliahan',
                                    bobot: m.number === 3 ? '15%' : '30%',
                                    deadline: 'Jumat, 23:59 WIB',
                                    format: 'PDF (Maks. 10 MB)',
                                  })
                                }
                                className="px-3.5 py-1.5 rounded-lg bg-surface-container-highest hover:bg-primary hover:text-on-primary text-on-surface font-label-sm text-label-sm font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                              >
                                <span>Lihat Detail Tugas &amp; Upload</span>
                                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 2: REKAP KEHADIRAN MAHASISWA */}
        {activeTab === 'presensi' && (
          <div className="bg-surface-container-low rounded-xl p-space-lg border border-outline-variant/20 space-y-space-lg">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-title-lg text-title-lg text-on-surface font-bold">
                  Rekapitulasi Kehadiran Personal
                </h3>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  Histori kehadiran digital Anda pada mata kuliah {course.name} ({course.classGroup}).
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handlePrintAttendance}
                  className="px-3.5 py-2 rounded-lg bg-surface-container-high hover:bg-surface-container-highest text-on-surface font-label-sm text-label-sm transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">print</span>
                  <span>Cetak Berita Acara</span>
                </button>
                <button
                  type="button"
                  onClick={() => onNavigate && onNavigate('status-presensi')}
                  className="px-3.5 py-2 rounded-lg bg-primary text-on-primary hover:opacity-90 font-label-sm text-label-sm transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">how_to_reg</span>
                  <span>Status Presensi</span>
                </button>
              </div>
            </div>

            {/* Attendance Stat Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-4 bg-surface-container rounded-xl border border-outline-variant/20 text-center">
                <span className="text-caption text-outline font-medium block">Total Sesi Terlaksana</span>
                <span className="text-headline-md font-bold text-on-surface">{conducted} Sesi</span>
              </div>
              <div className="p-4 bg-emerald-500/10 rounded-xl border border-emerald-500/30 text-center text-emerald-400">
                <span className="text-caption font-medium block">Hadir Tervalidasi</span>
                <span className="text-headline-md font-bold">{attended} Sesi</span>
              </div>
              <div className="p-4 bg-surface-container rounded-xl border border-outline-variant/20 text-center text-secondary">
                <span className="text-caption font-medium block">Izin / Sakit</span>
                <span className="text-headline-md font-bold">0 Sesi</span>
              </div>
              <div className="p-4 bg-surface-container rounded-xl border border-outline-variant/20 text-center text-error">
                <span className="text-caption font-medium block">Alpa / Absen</span>
                <span className="text-headline-md font-bold">{conducted - attended} Sesi</span>
              </div>
            </div>

            {/* Validation Banner */}
            <div className="p-4 rounded-xl bg-surface-container border border-outline-variant/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[22px]">verified_user</span>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-on-surface">Validasi IP Jaringan Kampus UPGRIS</h4>
                  <p className="text-xs text-on-surface-variant">
                    Presensi otomatis mencatat geo-location dan IP subnet kampus untuk mencegah titip presensi.
                  </p>
                </div>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shrink-0 self-start sm:self-auto">
                IP: 10.20.14.88 (Terverifikasi)
              </span>
            </div>
          </div>
        )}

        {/* TAB 3: SILABUS & RPS */}
        {activeTab === 'silabus' && (
          <div className="bg-surface-container-low rounded-xl p-space-lg border border-outline-variant/20 space-y-space-md">
            <div>
              <h3 className="font-title-lg text-title-lg text-on-surface font-bold">
                Rencana Pembelajaran Semester (RPS) — OBE SN-Dikti
              </h3>
              <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed mt-1">
                {course.description}
              </p>
            </div>

            {/* Assessment Component Weights */}
            <div className="p-4 rounded-xl bg-surface-container border border-outline-variant/20 space-y-3">
              <h4 className="font-title-sm text-sm font-bold text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[18px]">balance</span>
                <span>Komponen &amp; Bobot Penilaian Semester</span>
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div className="p-3 bg-surface-container-low rounded-lg border border-outline-variant/10">
                  <span className="text-xs text-outline block">Kehadiran &amp; Sikap</span>
                  <span className="text-lg font-bold text-primary">15%</span>
                </div>
                <div className="p-3 bg-surface-container-low rounded-lg border border-outline-variant/10">
                  <span className="text-xs text-outline block">Tugas Terstruktur</span>
                  <span className="text-lg font-bold text-secondary">25%</span>
                </div>
                <div className="p-3 bg-surface-container-low rounded-lg border border-outline-variant/10">
                  <span className="text-xs text-outline block">Evaluasi UTS</span>
                  <span className="text-lg font-bold text-tertiary">30%</span>
                </div>
                <div className="p-3 bg-surface-container-low rounded-lg border border-outline-variant/10">
                  <span className="text-xs text-outline block">Evaluasi UAS</span>
                  <span className="text-lg font-bold text-on-surface">30%</span>
                </div>
              </div>
            </div>

            {/* Official RPS Download Card */}
            <div className="p-4 rounded-xl bg-surface-container border border-outline-variant/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-lg bg-red-500/10 text-red-400 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[28px]">picture_as_pdf</span>
                </div>
                <div>
                  <h4 className="font-title-md text-sm font-semibold text-on-surface">
                    Dokumen RPS Resmi — {course.name} 2026.pdf
                  </h4>
                  <span className="text-xs text-outline font-mono">1.8 MB • Disahkan Tim Kurikulum PTIK</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleDownloadFile(`Dokumen RPS ${course.name}.pdf`)}
                className="px-4 py-2 rounded-lg bg-primary text-on-primary hover:opacity-90 font-label-md text-label-md transition-colors flex items-center justify-center gap-2 cursor-pointer shrink-0"
              >
                <span className="material-symbols-outlined text-[18px]">download</span>
                <span>Unduh Dokumen RPS</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── MODAL: Detail Tugas & Upload ── */}
      {modalTugasOpen && selectedTugas && (
        <div className="fixed inset-0 z-[100] bg-surface-dim/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface-container-low border border-outline-variant/30 rounded-2xl max-w-lg w-full p-6 shadow-2xl animate-scale-in space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-outline-variant/15">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-amber-400 text-[24px]">assignment</span>
                <h3 className="font-title-lg text-title-lg text-on-surface font-bold">
                  {selectedTugas.title}
                </h3>
              </div>
              <button
                onClick={() => setModalTugasOpen(false)}
                className="p-1 rounded-lg text-outline hover:text-on-surface hover:bg-surface-container transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="space-y-3 font-body-sm text-body-sm text-on-surface-variant">
              <div className="p-3.5 rounded-xl bg-surface-container space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-outline">Batas Pengumpulan:</span>
                  <span className="font-semibold text-on-surface">{selectedTugas.deadline}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-outline">Bobot Nilai:</span>
                  <span className="font-semibold text-tertiary">{selectedTugas.bobot} dari Total Nilai</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-outline">Format Berkas:</span>
                  <span className="font-semibold text-on-surface">{selectedTugas.format}</span>
                </div>
              </div>
              <p className="leading-relaxed">
                Unggah dokumen berkas laporan penugasan kelompok Anda mengacu pada format standar RPS yang telah diinstruksikan oleh dosen pengampu.
              </p>
            </div>

            <div className="pt-2 flex justify-end gap-2 border-t border-outline-variant/15">
              <button
                type="button"
                onClick={() => setModalTugasOpen(false)}
                className="px-4 py-2 rounded-lg bg-surface-container-high text-on-surface font-label-md hover:bg-surface-container-highest transition-colors cursor-pointer"
              >
                Tutup
              </button>
              <button
                type="button"
                onClick={() => {
                  showToast('Berkas penugasan berhasil diunggah!');
                  setModalTugasOpen(false);
                }}
                className="px-4 py-2 rounded-lg bg-primary text-on-primary font-label-md font-semibold hover:opacity-90 transition-opacity flex items-center gap-1.5 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">cloud_upload</span>
                <span>Unggah Berkas</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
