import React, { useState } from 'react';
import AppShell from '../../components/AppShell';
import { getCourseById } from '../../data/courseCatalog';

/**
 * RuangKls — Feature Component
 * Ruang Kelas Mahasiswa dengan 16 Pertemuan Terstruktur OBE, distribusi materi,
 * dan presensi digital terpadu.
 * Menampilkan mata kuliah sesuai card yang diklik (prop `courseId`).
 */
export default function RuangKls({ onNavigate, onRoleChange, courseId }) {
  const course = getCourseById(courseId);
  const [activeTab, setActiveTab] = useState('pertemuan'); // 'pertemuan' | 'presensi' | 'silabus'
  const [openAccordions, setOpenAccordions] = useState(() => {
    const initial = {};
    course.meetings.forEach((m) => {
      initial[m.id] = m.status === 'SESI_AKTIF';
    });
    return initial;
  });
  const [toastMessage, setToastMessage] = useState(null);
  const [checkInDone, setCheckInDone] = useState(false);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
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
    setCheckInDone(true);
    showToast(
      `Presensi Pertemuan ${activeSession ? activeSession.number : course.currentMeeting} berhasil dicatat! Status: HADIR (09:20 WIB)`
    );
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
      activeNavPath="kelas-saya"
      onNavChange={onNavigate}
    >
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-surface-container-highest text-on-surface px-4 py-3 rounded-xl shadow-2xl border border-primary/30">
          <span className="material-symbols-outlined text-primary text-[20px]">check_circle</span>
          <span className="font-label-md text-sm">{toastMessage}</span>
        </div>
      )}

      <div className="flex flex-col w-full space-y-space-md">
        {/* Breadcrumb */}
        <div className="flex flex-wrap items-center justify-between gap-space-sm">
          <nav className="flex items-center gap-2 font-body-sm text-body-sm text-outline">
            <button
              onClick={() => onNavigate && onNavigate('dasbor-mahasiswa')}
              className="hover:text-primary transition-colors flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-[16px]">home</span>
              Dasbor
            </button>
            <span>/</span>
            <button
              onClick={() => onNavigate && onNavigate('kelas-saya-mahasiswa')}
              className="text-on-surface-variant hover:text-primary transition-colors"
            >
              Kelas Saya
            </button>
            <span>/</span>
            <span className="text-secondary font-label-sm font-semibold">
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

          {/* Tabs */}
          <div className="flex items-center gap-6 mt-6 border-b border-outline-variant/20 overflow-x-auto">
            <button
              type="button"
              onClick={() => setActiveTab('pertemuan')}
              className={`pb-3 text-sm font-bold flex items-center gap-1.5 transition-colors border-b-2 whitespace-nowrap ${
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
              className={`pb-3 text-sm font-bold flex items-center gap-1.5 transition-colors border-b-2 whitespace-nowrap ${
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
              className={`pb-3 text-sm font-bold flex items-center gap-1.5 transition-colors border-b-2 whitespace-nowrap ${
                activeTab === 'silabus'
                  ? 'text-primary border-primary'
                  : 'text-on-surface-variant border-transparent hover:text-on-surface'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">article</span>
              <span>Silabus &amp; Kontrak Kuliah</span>
            </button>
          </div>
        </section>

        {/* TAB 1: ACCORDION MEETINGS */}
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
                  className="px-2.5 py-1 rounded bg-surface-container hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface transition-colors font-medium border border-outline-variant/30"
                >
                  Buka Semua
                </button>
                <button
                  type="button"
                  onClick={() => toggleAllMeetings(false)}
                  className="px-2.5 py-1 rounded bg-surface-container hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface transition-colors font-medium border border-outline-variant/30"
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
                      className="w-full text-left p-4 md:p-5 flex items-center justify-between gap-4 hover:bg-surface-container transition-colors"
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
                      <div className="px-5 pb-5 pt-2 border-t border-outline-variant/20 bg-surface-container/50 space-y-4">
                        <p className="text-xs text-on-surface-variant leading-relaxed">
                          {m.description}
                        </p>

                        {/* Attendance Action if session active */}
                        {m.status === 'SESI_AKTIF' && !checkInDone && (
                          <div className="p-4 rounded-xl bg-tertiary-container/20 border border-tertiary/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-tertiary/20 text-tertiary flex items-center justify-center shrink-0">
                                <span className="material-symbols-outlined text-[24px]">how_to_reg</span>
                              </div>
                              <div>
                                <h4 className="text-sm font-bold text-on-surface">
                                  Presensi Digital Pertemuan {m.number} Sedang Dibuka
                                </h4>
                                <p className="text-xs text-on-surface-variant">
                                  Batas toleransi kehadiran hingga 10:15 WIB. Klik tombol untuk check-in mandiri.
                                </p>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={handleCheckIn}
                              className="px-4 py-2 rounded-lg bg-tertiary text-on-tertiary hover:opacity-90 font-label-md text-label-md font-bold shadow-md transition-all shrink-0"
                            >
                              Isi Presensi Sekarang
                            </button>
                          </div>
                        )}

                        {/* Materials Section */}
                        {m.materials.length > 0 ? (
                          <div className="space-y-2">
                            <span className="text-xs font-bold text-outline uppercase tracking-wider block">
                              Berkas Materi Pembelajaran:
                            </span>
                            {m.materials.map((file, idx) => (
                              <div
                                key={idx}
                                className="p-3 bg-surface-container rounded-lg flex items-center justify-between gap-2 border border-outline-variant/20 hover:border-primary/40 transition-colors"
                              >
                                <div className="flex items-center gap-2.5 min-w-0">
                                  <span className="material-symbols-outlined text-primary text-[20px]">
                                    {file.type === 'pdf' ? 'picture_as_pdf' : 'description'}
                                  </span>
                                  <div className="min-w-0">
                                    <span className="text-xs font-medium text-on-surface truncate block">
                                      {file.name}
                                    </span>
                                    <span className="text-[11px] text-outline font-mono">
                                      Ukuran: {file.size}
                                    </span>
                                  </div>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => showToast(`Mengunduh berkas: ${file.name}`)}
                                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary-container text-on-primary-container hover:bg-primary font-label-sm text-label-sm shadow-sm transition-all shrink-0"
                                >
                                  <span className="material-symbols-outlined text-[16px]">download</span>
                                  <span>Unduh</span>
                                </button>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs text-outline italic">
                            Belum ada materi pembelajaran yang diunggah dosen untuk pertemuan ini.
                          </p>
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
          <div className="bg-surface-container-low rounded-xl p-space-md border border-outline-variant/20 space-y-space-md">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-title-md text-title-md text-on-surface font-bold">
                  Histori Presensi Perkuliahan Saya
                </h3>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  Rekapitulasi kehadiran personal mahasiswa pada mata kuliah {course.name}.
                </p>
              </div>
              <button
                type="button"
                onClick={() => onNavigate && onNavigate('status-presensi')}
                className="px-3 py-1.5 rounded-lg bg-primary-container text-on-primary-container hover:bg-primary font-label-sm text-label-sm transition-colors"
              >
                Buka Modul Status Presensi
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 bg-surface-container rounded-lg border border-outline-variant/20 text-center">
                <span className="text-caption text-outline font-medium block">Total Sesi Terlaksana</span>
                <span className="text-headline-md font-bold text-on-surface">{conducted} Sesi</span>
              </div>
              <div className="p-3 bg-tertiary-container/20 rounded-lg border border-tertiary/30 text-center text-tertiary">
                <span className="text-caption font-medium block">Hadir</span>
                <span className="text-headline-md font-bold">{attended} Sesi</span>
              </div>
              <div className="p-3 bg-surface-container rounded-lg border border-outline-variant/20 text-center text-secondary">
                <span className="text-caption font-medium block">Izin / Sakit</span>
                <span className="text-headline-md font-bold">0 Sesi</span>
              </div>
              <div className="p-3 bg-surface-container rounded-lg border border-outline-variant/20 text-center text-error">
                <span className="text-caption font-medium block">Alpa</span>
                <span className="text-headline-md font-bold">{conducted - attended} Sesi</span>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: SILABUS */}
        {activeTab === 'silabus' && (
          <div className="bg-surface-container-low rounded-xl p-space-lg border border-outline-variant/20 space-y-4">
            <h3 className="font-title-lg text-title-lg text-on-surface font-bold">
              Rencana Pembelajaran Semester (RPS) — OBE SN-Dikti
            </h3>
            <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
              {course.description}
            </p>
            <div className="p-4 rounded-xl bg-surface-container border border-outline-variant/20 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary text-[28px]">picture_as_pdf</span>
                <div>
                  <h4 className="font-title-md text-sm font-semibold text-on-surface">
                    Dokumen RPS Resmi — {course.name} 2026.pdf
                  </h4>
                  <span className="text-xs text-outline font-mono">1.8 MB • Disahkan Tim Kurikulum PTIK</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => showToast('Mengunduh dokumen RPS')}
                className="px-3.5 py-2 rounded-lg bg-primary-container text-on-primary-container hover:bg-primary font-label-md text-label-md transition-colors"
              >
                Unduh RPS
              </button>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
