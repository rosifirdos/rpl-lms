import { useState, useEffect, useMemo } from 'react';

/**
 * StatusPresensi Component (FR-023, FR-024, BR-010, BR-011, BR-012, FR-039)
 * Represents the 4 comparative attendance states:
 * - State A: Belum Dibuka (Locked)
 * - State B: Sesi Terbuka (Live / Countdown / Submit Action)
 * - State C: Terkonfirmasi Hadir (Validated / Token Proof)
 * - State D: Sesi Ditutup (Expired / Alpa / Correction Request)
 */
export default function StatusPresensi({ onNavigate }) {
  const [filter, setFilter] = useState('all'); // 'all' | 'state-a' | 'state-b' | 'state-c' | 'state-d'

  // Live server clock
  const [serverTime, setServerTime] = useState(new Date(2026, 9, 6, 9, 20, 14));

  // Live Countdown state for State B (in seconds, e.g. 582s = 09m : 42s)
  const [secondsRemaining, setSecondsRemaining] = useState(582);
  const [isTimerPaused, setIsTimerPaused] = useState(false);

  // Student attendance submission state (transitions State B -> State C)
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submissionTime, setSubmissionTime] = useState('09:18:22 WIB');

  // Correction Modal state (FR-039)
  const [isCorrectionModalOpen, setIsCorrectionModalOpen] = useState(false);
  const [correctionReason, setCorrectionReason] = useState('Kendala Jaringan / Perangkat Lab Bermasalah');
  const [correctionNote, setCorrectionNote] = useState('');
  const [isSubmittingCorrection, setIsSubmittingCorrection] = useState(false);

  // Toast alert notification state
  const [toast, setToast] = useState({
    visible: false,
    title: '',
    message: '',
    icon: 'check_circle',
    iconBg: 'bg-emerald-100 text-emerald-600'
  });

  // Highlight trigger state for simulation
  const [highlightActiveBtn, setHighlightActiveBtn] = useState(false);

  // Server clock ticking effect
  useEffect(() => {
    const timer = setInterval(() => {
      setServerTime(prev => new Date(prev.getTime() + 1000));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Countdown timer effect for active session tolerance (BR-011)
  useEffect(() => {
    if (isTimerPaused || secondsRemaining <= 0) return;
    const timer = setInterval(() => {
      setSecondsRemaining(prev => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [isTimerPaused, secondsRemaining]);

  // Formatted server time string
  const formattedServerTime = useMemo(() => {
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    const day = days[serverTime.getDay()];
    const date = String(serverTime.getDate()).padStart(2, '0');
    const month = months[serverTime.getMonth()];
    const year = serverTime.getFullYear();
    const hours = String(serverTime.getHours()).padStart(2, '0');
    const minutes = String(serverTime.getMinutes()).padStart(2, '0');
    const seconds = String(serverTime.getSeconds()).padStart(2, '0');
    return `${day}, ${date} ${month} ${year} • ${hours}:${minutes}:${seconds} WIB`;
  }, [serverTime]);

  // Formatted countdown (MMm : SSs)
  const formattedCountdown = useMemo(() => {
    const mins = Math.floor(secondsRemaining / 60);
    const secs = secondsRemaining % 60;
    return `${String(mins).padStart(2, '0')}m : ${String(secs).padStart(2, '0')}s`;
  }, [secondsRemaining]);

  // Progress bar percentage (900 seconds = 15 minutes)
  const countdownPercent = useMemo(() => {
    return Math.min(100, Math.max(0, (secondsRemaining / 900) * 100));
  }, [secondsRemaining]);

  // Toast notification helper
  const showToast = (title, message, icon = 'check_circle', iconBg = 'bg-emerald-100 text-emerald-600', duration = 4500) => {
    setToast({ visible: true, title, message, icon, iconBg });
    setTimeout(() => {
      setToast(prev => ({ ...prev, visible: false }));
    }, duration);
  };

  const dismissToast = () => {
    setToast(prev => ({ ...prev, visible: false }));
  };

  // Submit presence (State B -> State C transition)
  const handlePresenceSubmit = () => {
    const hours = String(serverTime.getHours()).padStart(2, '0');
    const minutes = String(serverTime.getMinutes()).padStart(2, '0');
    const seconds = String(serverTime.getSeconds()).padStart(2, '0');
    const nowStr = `${hours}:${minutes}:${seconds} WIB`;

    setIsSubmitted(true);
    setSubmissionTime(nowStr);

    showToast(
      'Presensi Berhasil Divalidasi!',
      `Timestamp: ${nowStr}. Status kehadiran Anda tercatat HADIR (State C).`,
      'check_circle',
      'bg-emerald-100 text-emerald-600'
    );
  };

  // Simulation highlight
  const handleTriggerInteractiveSimulation = () => {
    setFilter('all');
    setHighlightActiveBtn(true);
    setTimeout(() => {
      setHighlightActiveBtn(false);
      handlePresenceSubmit();
    }, 800);
  };

  // Submit correction mock (FR-039)
  const handleCorrectionSubmit = (e) => {
    e.preventDefault();
    setIsSubmittingCorrection(true);

    setTimeout(() => {
      setIsSubmittingCorrection(false);
      setIsCorrectionModalOpen(false);
      setCorrectionNote('');
      showToast(
        'Permohonan Koreksi Terkirim',
        'Menunggu verifikasi dan persetujuan Dr. Awan Rosi, M.Kom. (FR-039)',
        'outgoing_mail',
        'bg-blue-100 text-blue-600'
      );
    }, 600);
  };

  // Reset simulation
  const handleResetSimulation = () => {
    setIsSubmitted(false);
    setSecondsRemaining(582);
    showToast(
      'Simulasi Direset',
      'Status kartu kembali ke kondisi awal siklus perkuliahan.',
      'restart_alt',
      'bg-blue-100 text-blue-600',
      3000
    );
  };

  return (
    <div className="flex flex-col w-full pb-space-xl">
      {/* BREADCRUMB & CONTEXTUAL NAVIGATION */}
      <div className="flex flex-wrap items-center justify-between gap-space-sm mb-space-md">
        <nav aria-label="Breadcrumb" className="flex items-center gap-space-xs font-label-sm text-label-sm text-on-surface-variant">
          <button
            onClick={() => onNavigate && onNavigate('dasbor-mahasiswa')}
            className="hover:text-primary transition-colors cursor-pointer"
            type="button"
          >
            Dasbor
          </button>
          <span className="material-symbols-outlined text-[16px] text-outline">chevron_right</span>
          <button
            onClick={() => onNavigate && onNavigate('mata-kuliah-saya')}
            className="hover:text-primary transition-colors cursor-pointer"
            type="button"
          >
            Kelas Saya
          </button>
          <span className="material-symbols-outlined text-[16px] text-outline">chevron_right</span>
          <span className="text-on-surface-variant">Rekayasa Perangkat Lunak (TI-A)</span>
          <span className="material-symbols-outlined text-[16px] text-outline">chevron_right</span>
          <span className="text-primary font-semibold">Status Presensi</span>
        </nav>

        <div className="flex items-center gap-space-sm flex-wrap">
          <span className="inline-flex items-center gap-1.5 px-space-sm py-1 rounded-full bg-surface-container-high text-on-surface font-caption text-caption border border-outline-variant/20 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-tertiary animate-ping"></span>
            <span className="w-1.5 h-1.5 rounded-full bg-tertiary -ml-3"></span>
            <span>Waktu Server: {formattedServerTime}</span>
          </span>
          <span className="px-2 py-0.5 rounded bg-primary-container/20 text-primary font-caption text-caption uppercase tracking-wider font-semibold border border-primary/20">
            FR-023 • FR-024 Spec
          </span>
        </div>
      </div>

      {/* CLASS CONTEXT BANNER */}
      <section className="relative overflow-hidden rounded-xl bg-surface-container p-space-lg mb-space-xl shadow-lg border border-outline-variant/20">
        <div className="absolute -right-16 -top-16 w-80 h-80 rounded-full bg-primary/10 blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-space-md">
          <div className="flex flex-col gap-space-xs max-w-3xl">
            <div className="flex items-center gap-space-sm flex-wrap">
              <span className="px-space-sm py-0.5 rounded bg-secondary-container/20 text-secondary font-label-sm text-label-sm font-semibold border border-secondary/20">
                Tatap Muka Teori &amp; Praktik
              </span>
              <span className="text-on-surface-variant font-caption text-caption">•</span>
              <span className="text-on-surface-variant font-caption text-caption flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">location_on</span>
                Ruang: Lab Komputasi 3 (Gedung Pusat Lt. 4)
              </span>
            </div>
            <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight">
              Rekayasa Perangkat Lunak (TI-A) <span className="text-secondary font-normal">• Pertemuan 3</span>
            </h1>
            <p className="font-body-md text-body-md text-on-surface-variant">
              Topik Modul: <strong className="text-on-surface">Analisis Kebutuhan &amp; Spesifikasi SRS IEEE 830</strong>
            </p>
            <div className="flex items-center gap-space-sm mt-space-xs font-label-md text-label-md text-on-surface-variant">
              <div className="w-7 h-7 rounded-full bg-surface-container-highest flex items-center justify-center text-primary shadow-inner">
                <span className="material-symbols-outlined text-[18px]">badge</span>
              </div>
              <span>
                Dosen Pengampu: <strong className="text-on-surface">Dr. Awan Rosi, M.Kom.</strong>{' '}
                <span className="text-outline font-caption text-caption">(NIDN: 0612345601)</span>
              </span>
            </div>
          </div>

          {/* Quick Session Indicator Chipset */}
          <div className="flex flex-row lg:flex-col items-start lg:items-end justify-between gap-space-sm bg-surface-container-low p-space-md rounded-lg border border-outline-variant/20 shadow-inner">
            <div className="flex flex-col">
              <span className="font-caption text-caption text-outline uppercase tracking-wider">Masa Sesi Perkuliahan</span>
              <span className="font-title-md text-title-md text-on-surface font-bold">08:45 – 11:15 WIB</span>
            </div>
            <div className="flex items-center gap-space-xs text-tertiary font-label-sm text-label-sm">
              <span className="material-symbols-outlined text-[16px]">verified</span>
              <span>Sesi Terdaftar Akademik</span>
            </div>
          </div>
        </div>
      </section>

      {/* SHOWCASE HEADER & CONTROLS */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-md mb-space-lg">
        <div className="flex flex-col gap-space-xs max-w-2xl">
          <div className="flex items-center gap-space-xs text-secondary font-label-sm text-label-sm font-semibold">
            <span className="material-symbols-outlined text-[18px]">view_carousel</span>
            <span>MATRIKS KOMPARATIF ANTARMUKA MAHASISWA</span>
          </div>
          <h2 className="font-headline-md text-headline-md text-on-surface">
            Perbandingan Komparatif Status Presensi Mahasiswa (Siklus Sesi P-3)
          </h2>
          <p className="font-body-md text-body-md text-on-surface-variant">
            Matriks representasi antarmuka kartu presensi digital mandiri mahasiswa berdasarkan kontrol buka/tutup sesi oleh Dosen Pengampu (Sesuai Aturan Bisnis <span className="text-primary font-semibold">BR-010</span> &amp; <span className="text-primary font-semibold">BR-011</span>).
          </p>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-space-xs p-1 bg-surface-container-high rounded-lg border border-outline-variant/30 self-start md:self-end">
          <button
            className={`px-space-sm py-1.5 rounded font-label-sm text-label-sm transition-all ${
              filter === 'all'
                ? 'bg-primary-container text-on-primary-container font-bold shadow-sm'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
            onClick={() => setFilter('all')}
            type="button"
          >
            Semua State (4)
          </button>
          <button
            className={`px-space-sm py-1.5 rounded font-label-sm text-label-sm transition-all ${
              filter === 'state-b'
                ? 'bg-primary-container text-on-primary-container font-bold shadow-sm'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
            onClick={() => setFilter('state-b')}
            type="button"
          >
            Hanya Sesi Aktif
          </button>
          <button
            className={`px-space-sm py-1.5 rounded font-label-sm text-label-sm transition-all ${
              filter === 'state-c'
                ? 'bg-primary-container text-on-primary-container font-bold shadow-sm'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
            onClick={() => setFilter('state-c')}
            type="button"
          >
            Tervalidasi Hadir
          </button>
          <button
            className={`px-space-sm py-1.5 rounded font-label-sm text-label-sm transition-all ${
              filter === 'state-d'
                ? 'bg-primary-container text-on-primary-container font-bold shadow-sm'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
            onClick={() => setFilter('state-d')}
            type="button"
          >
            Ditutup / Alpa
          </button>
          <button
            className={`px-space-sm py-1.5 rounded font-label-sm text-label-sm text-secondary hover:text-on-surface transition-all flex items-center gap-1 border border-secondary/30 hover:border-secondary ${
              highlightActiveBtn ? 'ring-2 ring-secondary bg-secondary-container/20' : ''
            }`}
            onClick={handleTriggerInteractiveSimulation}
            type="button"
          >
            <span className="material-symbols-outlined text-[16px]">play_circle</span>
            Simulasi Realtime
          </button>
          {isSubmitted && (
            <button
              className="px-space-sm py-1.5 rounded font-label-sm text-label-sm text-on-surface-variant hover:text-error transition-all flex items-center gap-1"
              onClick={handleResetSimulation}
              title="Kembalikan simulasi ke kondisi awal"
              type="button"
            >
              <span className="material-symbols-outlined text-[16px]">restart_alt</span>
              Reset
            </button>
          )}
        </div>
      </div>

      {/* THE 4 COMPARATIVE ATTENDANCE CARDS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-space-lg items-stretch mb-space-xl">
        {/* ==================== CARD 1: STATE A ==================== */}
        {(filter === 'all' || filter === 'state-a') && (
          <div className="flex flex-col justify-between rounded-xl bg-white text-slate-800 p-space-lg shadow-xl relative overflow-hidden transition-all duration-300 hover:-translate-y-1 border border-slate-200">
            <div>
              {/* Top State Indicator Badge */}
              <div className="flex items-center justify-between mb-space-md">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 font-label-sm text-label-sm font-semibold tracking-wide border border-slate-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                  STATE A — BELUM DIBUKA (LOCKED)
                </span>
                <span className="text-slate-400 font-caption text-caption font-mono">BR-010-PRE</span>
              </div>

              {/* Card Header */}
              <div className="flex items-start justify-between gap-space-sm pb-space-sm mb-space-sm">
                <div className="flex items-center gap-space-sm">
                  <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600 shadow-sm">
                    <span className="material-symbols-outlined text-[24px]">event_available</span>
                  </div>
                  <div>
                    <h3 className="font-title-md text-title-md text-slate-900 font-bold leading-tight">Presensi Pertemuan 3</h3>
                    <span className="font-caption text-caption text-slate-500">Bobot: 1 SKS Praktika</span>
                  </div>
                </div>
              </div>

              {/* Status Pill */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-600 font-label-sm text-label-sm font-medium mb-space-md border border-slate-200">
                <span className="material-symbols-outlined text-[16px]">lock</span>
                <span>Sesi Belum Dibuka</span>
              </div>

              {/* Body Explanation */}
              <p className="font-body-sm text-body-sm text-slate-600 leading-relaxed mb-space-md">
                Dosen Pengampu belum membuka sesi presensi untuk pertemuan ini. Tombol kehadiran akan aktif secara otomatis saat sesi dibuka.
              </p>

              {/* Soft Lock Info Notice */}
              <div className="rounded-lg bg-slate-50 p-space-sm mb-space-lg border border-slate-200/80">
                <div className="flex items-start gap-space-xs text-slate-600 font-caption text-caption leading-snug">
                  <span className="material-symbols-outlined text-[16px] text-slate-500 mt-0.5">info</span>
                  <span>Status: Menunggu instruksi dosen pengampu di ruang Lab Komputasi 3.</span>
                </div>
              </div>
            </div>

            {/* Footer & Action */}
            <div className="flex flex-col gap-space-sm mt-auto pt-space-sm">
              <button
                aria-disabled="true"
                className="w-full h-12 rounded-lg bg-slate-200 text-slate-400 font-label-md text-label-md font-medium flex items-center justify-center gap-2 cursor-not-allowed select-none shadow-none"
                disabled
              >
                <span className="material-symbols-outlined text-[20px]">lock</span>
                <span>Isi Kehadiran</span>
              </button>
              <div className="flex items-center justify-center gap-1.5 text-slate-500 font-caption text-caption text-center">
                <span className="material-symbols-outlined text-[14px]">sync</span>
                <span>Terakhir diperbarui 09:10 WIB • Sinkronisasi otomatis</span>
              </div>
            </div>
          </div>
        )}

        {/* ==================== CARD 2: STATE B ==================== */}
        {(filter === 'all' || filter === 'state-b') && (
          <div className={`flex flex-col justify-between rounded-xl bg-white text-slate-800 p-space-lg shadow-xl relative overflow-hidden transition-all duration-300 hover:-translate-y-1 border ${
            isSubmitted ? 'border-emerald-300 ring-2 ring-emerald-400/40' : 'border-blue-300 ring-2 ring-blue-500/30'
          }`}>
            <div>
              {/* Top State Indicator Badge */}
              <div className="flex items-center justify-between mb-space-md">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-label-sm text-label-sm font-semibold tracking-wide border border-emerald-200">
                  <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
                  STATE B — SESI TERBUKA (LIVE / ACTIVE)
                </span>
                <span className="text-emerald-700 font-caption text-caption font-mono font-bold">FR-023</span>
              </div>

              {/* Card Header with highlight */}
              <div className="flex items-start justify-between gap-space-sm pb-space-sm mb-space-sm">
                <div className="flex items-center gap-space-sm">
                  <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 shadow-sm border border-blue-100">
                    <span className="material-symbols-outlined text-[24px]">event_available</span>
                  </div>
                  <div>
                    <h3 className="font-title-md text-title-md text-slate-900 font-bold leading-tight">Presensi Pertemuan 3</h3>
                    <span className="font-caption text-caption text-blue-700 font-semibold">Toleransi Berjalan (15 Mnt)</span>
                  </div>
                </div>
              </div>

              {/* Status Pill: Active Green */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 font-label-sm text-label-sm font-semibold mb-space-md border border-emerald-200">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span>Sesi Presensi Aktif</span>
              </div>

              {/* Countdown / Context Block */}
              <div className="rounded-lg bg-blue-50 p-space-sm mb-space-md flex flex-col gap-space-xs border border-blue-100">
                <div className="flex items-center gap-1.5 text-blue-700 font-caption text-caption font-semibold">
                  <span className="material-symbols-outlined text-[16px]">schedule</span>
                  <span>Dibuka 09:15 WIB • Ditutup otomatis 09:30 WIB</span>
                </div>
                <div className="flex items-baseline justify-between mt-1">
                  <span className="font-caption text-caption text-slate-600">Sisa Batas Waktu:</span>
                  <span className="font-mono text-blue-800 font-bold text-sm tracking-wide">
                    {formattedCountdown}
                  </span>
                </div>
                {/* Progress bar */}
                <div className="w-full h-1.5 bg-blue-200 rounded-full overflow-hidden mt-1">
                  <div
                    className="h-full bg-blue-600 rounded-full transition-all duration-1000"
                    style={{ width: `${countdownPercent}%` }}
                  ></div>
                </div>
              </div>

              <p className="font-body-sm text-body-sm text-slate-600 leading-relaxed mb-space-md">
                {isSubmitted ? (
                  <span className="text-emerald-700 font-semibold">
                    ✓ Kehadiran Anda berhasil tercatat pada sesi ini! Anda dapat melihat konfirmasi detail pada STATE C.
                  </span>
                ) : (
                  "Sesi presensi telah diaktifkan oleh Dosen Pengampu. Klik tombol di bawah untuk mencatat verifikasi kehadiran Anda."
                )}
              </p>
            </div>

            {/* Footer & Action */}
            <div className="flex flex-col gap-space-sm mt-auto pt-space-sm">
              {isSubmitted ? (
                <button
                  className="w-full h-12 rounded-lg bg-emerald-600 text-white font-label-md text-label-md font-semibold flex items-center justify-center gap-2 shadow-md cursor-default"
                  disabled
                >
                  <span className="material-symbols-outlined text-[20px]">check_circle</span>
                  <span>Sudah Terisi ({submissionTime})</span>
                </button>
              ) : (
                <button
                  className="w-full h-12 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 active:scale-[0.98] text-white font-label-md text-label-md font-semibold flex items-center justify-center gap-2 shadow-lg shadow-blue-500/30 transition-all cursor-pointer"
                  id="btn-submit-presence"
                  onClick={handlePresenceSubmit}
                  type="button"
                >
                  <span className="material-symbols-outlined text-[20px]">check</span>
                  <span>Isi Kehadiran Sekarang</span>
                </button>
              )}
              <div className="flex items-center justify-center gap-1.5 text-slate-500 font-caption text-caption text-center">
                <span className="material-symbols-outlined text-[14px]">info</span>
                <span>Sesi ditutup otomatis setelah batas toleransi berakhir (09:30 WIB).</span>
              </div>
            </div>
          </div>
        )}

        {/* ==================== CARD 3: STATE C ==================== */}
        {(filter === 'all' || filter === 'state-c') && (
          <div className="flex flex-col justify-between rounded-xl bg-white text-slate-800 p-space-lg shadow-xl relative overflow-hidden transition-all duration-300 hover:-translate-y-1 border border-sky-200">
            <div>
              {/* Top State Indicator Badge */}
              <div className="flex items-center justify-between mb-space-md">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-sky-100 text-sky-800 font-label-sm text-label-sm font-semibold tracking-wide border border-sky-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-sky-600"></span>
                  STATE C — TERKONFIRMASI HADIR (SUCCESS)
                </span>
                <span className="text-sky-700 font-caption text-caption font-mono font-bold">FR-024</span>
              </div>

              {/* Card Header */}
              <div className="flex items-start justify-between gap-space-sm pb-space-sm mb-space-sm">
                <div className="flex items-center gap-space-sm">
                  <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600 shadow-sm border border-emerald-200">
                    <span className="material-symbols-outlined text-[24px]">verified</span>
                  </div>
                  <div>
                    <h3 className="font-title-md text-title-md text-slate-900 font-bold leading-tight">Presensi Pertemuan 3</h3>
                    <span className="font-caption text-caption text-emerald-700 font-semibold">Tervalidasi Sistem</span>
                  </div>
                </div>
              </div>

              {/* Status Pill */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 font-label-sm text-label-sm font-semibold mb-space-md border border-emerald-200">
                <span className="material-symbols-outlined text-[16px]">check_circle</span>
                <span>HADIR (TERVALIDASI)</span>
              </div>

              {/* Detail Confirmed Row */}
              <div className="rounded-lg bg-emerald-50 p-space-sm mb-space-md flex flex-col gap-1 border border-emerald-100">
                <div className="flex items-center justify-between">
                  <span className="font-caption text-caption text-slate-600">Waktu Rekam:</span>
                  <span className="font-mono text-emerald-800 font-bold text-sm">
                    {isSubmitted ? submissionTime : '09:18:22 WIB'}
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 leading-tight pt-1">
                  IP: Kampus UPGRIS (Lab Komputasi 3) • Device: Desktop Browser Chrome 128.0
                </div>
              </div>

              {/* Verification Proof Badge */}
              <div className="rounded-lg bg-slate-50 p-space-sm mb-space-md flex items-start gap-space-xs text-slate-700 font-caption text-caption leading-snug border border-slate-200">
                <span className="material-symbols-outlined text-[16px] text-emerald-600 mt-0.5">shield</span>
                <span>Token Sesi Valid — Kehadiran disimpan permanen di database SPADA LMS UPGRIS.</span>
              </div>
            </div>

            {/* Footer & Action (Prevent Double Submission) */}
            <div className="flex flex-col gap-space-sm mt-auto pt-space-sm">
              <button
                aria-disabled="true"
                className="w-full h-12 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 font-label-md text-label-md font-semibold flex items-center justify-center gap-2 cursor-default select-none shadow-none"
                disabled
              >
                <span className="material-symbols-outlined text-[20px] text-emerald-600">task_alt</span>
                <span>Kehadiran Sudah Tercatat</span>
              </button>
              <div className="flex items-center justify-center gap-1.5 text-slate-500 font-caption text-caption text-center">
                <span className="material-symbols-outlined text-[14px]">auto_graph</span>
                <span>Dihitung ke syarat kelayakan ujian UTS P-8 (Bobot 100%).</span>
              </div>
            </div>
          </div>
        )}

        {/* ==================== CARD 4: STATE D ==================== */}
        {(filter === 'all' || filter === 'state-d') && (
          <div className="flex flex-col justify-between rounded-xl bg-white text-slate-800 p-space-lg shadow-xl relative overflow-hidden transition-all duration-300 hover:-translate-y-1 border border-rose-200">
            <div>
              {/* Top State Indicator Badge */}
              <div className="flex items-center justify-between mb-space-md">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-100 text-rose-800 font-label-sm text-label-sm font-semibold tracking-wide border border-rose-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-600"></span>
                  STATE D — SESI DITUTUP (EXPIRED)
                </span>
                <span className="text-rose-700 font-caption text-caption font-mono font-bold">BR-011</span>
              </div>

              {/* Card Header */}
              <div className="flex items-start justify-between gap-space-sm pb-space-sm mb-space-sm">
                <div className="flex items-center gap-space-sm">
                  <div className="w-10 h-10 rounded-lg bg-rose-50 flex items-center justify-center text-rose-600 shadow-sm border border-rose-100">
                    <span className="material-symbols-outlined text-[24px]">cancel</span>
                  </div>
                  <div>
                    <h3 className="font-title-md text-title-md text-slate-900 font-bold leading-tight">Presensi Pertemuan 3</h3>
                    <span className="font-caption text-caption text-rose-600 font-semibold">Toleransi Berakhir</span>
                  </div>
                </div>
              </div>

              {/* Status Pill: Slate Closed + Prominent Red Alpa */}
              <div className="flex flex-wrap items-center gap-2 mb-space-sm">
                <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-label-sm text-label-sm font-medium border border-slate-200">
                  <span className="material-symbols-outlined text-[14px]">lock_clock</span>
                  <span>Sesi Ditutup (09:30)</span>
                </div>
                <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 font-label-sm text-label-sm font-bold border border-rose-200">
                  <span className="material-symbols-outlined text-[14px]">cancel</span>
                  <span>STATUS: ALPA</span>
                </div>
              </div>

              {/* Body Explanation */}
              <p className="font-body-sm text-body-sm text-slate-600 leading-relaxed mb-space-md">
                Sesi presensi telah ditutup pukul 09:30 WIB dan Anda tidak mengisi kehadiran dalam masa toleransi. Status default tercatat ALPA.
              </p>

              {/* Warning Strip Threshold */}
              <div className="rounded-lg bg-amber-50 p-space-sm mb-space-md flex items-start gap-space-xs text-amber-900 font-caption text-caption leading-snug border border-amber-200">
                <span className="material-symbols-outlined text-[16px] text-amber-600 mt-0.5">warning</span>
                <span>Dapat mempengaruhi ambang batas kehadiran syarat UTS (Minimum 70% per BR-012).</span>
              </div>
            </div>

            {/* Footer & Action */}
            <div className="flex flex-col gap-space-sm mt-auto pt-space-sm">
              <button
                className="w-full h-12 rounded-lg bg-white hover:bg-slate-50 text-slate-700 font-label-md text-label-md font-semibold flex items-center justify-center gap-2 shadow-sm border border-slate-200 transition-colors cursor-pointer"
                onClick={() => setIsCorrectionModalOpen(true)}
                type="button"
              >
                <span className="material-symbols-outlined text-[20px] text-slate-500">assignment_late</span>
                <span>Ajukan Koreksi ke Dosen</span>
              </button>
              <div className="flex items-center justify-center gap-1.5 text-slate-500 font-caption text-caption text-center">
                <span className="material-symbols-outlined text-[14px]">gavel</span>
                <span>Koreksi hanya dapat disetujui Dosen Pengampu (FR-039).</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* REGULATORY & BUSINESS RULES ACCORDION MATRIX */}
      <section className="rounded-xl bg-surface-container p-space-lg mb-space-xl border border-outline-variant/20 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm mb-space-md pb-space-xs border-b border-outline-variant/10">
          <div className="flex items-center gap-space-sm">
            <div className="w-8 h-8 rounded-lg bg-secondary-container/20 text-secondary flex items-center justify-center border border-secondary/20">
              <span className="material-symbols-outlined text-[20px]">policy</span>
            </div>
            <div>
              <h3 className="font-title-lg text-title-lg text-on-surface">Spesifikasi Aturan Bisnis &amp; Regulasi Presensi (BR-010 s/d BR-012)</h3>
              <span className="font-body-sm text-body-sm text-on-surface-variant">Pedoman implementasi modul kehadiran mandiri berbasis waktu nyata pada SPADA UPGRIS</span>
            </div>
          </div>
          <span className="inline-flex items-center gap-1 px-space-sm py-1 rounded bg-surface-container-high text-tertiary font-label-sm text-label-sm font-semibold border border-tertiary/20 self-start sm:self-auto">
            <span className="w-1.5 h-1.5 rounded-full bg-tertiary"></span>
            Status: Aktif &amp; Teruji (100% Compliant)
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-space-md">
          {/* BR-010 */}
          <div className="flex flex-col gap-space-xs p-space-md rounded-lg bg-surface-container-low border border-outline-variant/15">
            <div className="flex items-center justify-between">
              <span className="font-label-md text-label-md text-primary font-bold">BR-010</span>
              <span className="px-2 py-0.5 rounded bg-surface-container font-caption text-caption text-on-surface-variant border border-outline-variant/20">
                Pembukaan Sesi
              </span>
            </div>
            <p className="font-body-sm text-body-sm text-on-surface leading-relaxed">
              Sesi presensi <strong>hanya dapat diaktifkan secara manual oleh Dosen Pengampu</strong> atau otomatis terjadwal jika diatur dalam RPS. Sebelum dibuka, status kartu mahasiswa adalah <em>LOCKED (State A)</em> tanpa akses klik.
            </p>
            <span className="font-caption text-caption text-outline mt-auto pt-space-xs flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
              Relevan: State A → State B Transition
            </span>
          </div>

          {/* BR-011 */}
          <div className="flex flex-col gap-space-xs p-space-md rounded-lg bg-surface-container-low border border-outline-variant/15">
            <div className="flex items-center justify-between">
              <span className="font-label-md text-label-md text-secondary font-bold">BR-011</span>
              <span className="px-2 py-0.5 rounded bg-surface-container font-caption text-caption text-on-surface-variant border border-outline-variant/20">
                Toleransi Waktu
              </span>
            </div>
            <p className="font-body-sm text-body-sm text-on-surface leading-relaxed">
              Masa pengisian kehadiran memiliki batas toleransi standar <strong>15 menit</strong> sejak penekanan tombol buka sesi. Bila batas waktu kadaluarsa tanpa submit, status otomatis dikonversi menjadi <em>ALPA (State D)</em>.
            </p>
            <span className="font-caption text-caption text-outline mt-auto pt-space-xs flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
              Relevan: State B Timer Expiry → State D
            </span>
          </div>

          {/* BR-012 */}
          <div className="flex flex-col gap-space-xs p-space-md rounded-lg bg-surface-container-low border border-outline-variant/15">
            <div className="flex items-center justify-between">
              <span className="font-label-md text-label-md text-tertiary font-bold">BR-012</span>
              <span className="px-2 py-0.5 rounded bg-surface-container font-caption text-caption text-on-surface-variant border border-outline-variant/20">
                Kelayakan Ujian (UTS)
              </span>
            </div>
            <p className="font-body-sm text-body-sm text-on-surface leading-relaxed">
              Total kehadiran minimum untuk dapat mengunduh kartu ujian UTS/UAS adalah <strong>70% dari akumulasi tatap muka</strong>. Kehadiran terkonfirmasi <em>(State C)</em> memberikan bobot kehadiran penuh 100% pada pertemuan bersangkutan.
            </p>
            <span className="font-caption text-caption text-outline mt-auto pt-space-xs flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
              Relevan: Validasi Akademik SiAkad Terintegrasi
            </span>
          </div>
        </div>
      </section>

      {/* LIVE SIMULATION TOAST NOTIFICATION */}
      <div
        className={`fixed bottom-6 right-6 z-50 transform transition-all duration-300 ${
          toast.visible ? 'translate-y-0 opacity-100 pointer-events-auto' : 'translate-y-32 opacity-0 pointer-events-none'
        }`}
      >
        <div className="bg-white text-slate-800 rounded-xl p-space-md shadow-2xl flex items-center gap-space-md max-w-md border border-slate-200">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${toast.iconBg}`}>
            <span className="material-symbols-outlined text-[24px]">{toast.icon}</span>
          </div>
          <div className="flex flex-col">
            <span className="font-title-md text-title-md font-bold text-slate-900 leading-tight">{toast.title}</span>
            <span className="font-caption text-caption text-slate-600 mt-0.5">{toast.message}</span>
          </div>
          <button
            aria-label="Tutup Notifikasi"
            className="text-slate-400 hover:text-slate-600 ml-auto shrink-0 p-1"
            onClick={dismissToast}
            type="button"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>
      </div>

      {/* MODAL FOR DISPENSATION / CORRECTION REQUEST (FR-039 DEMO) */}
      {isCorrectionModalOpen && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-space-md">
          <div className="bg-white text-slate-900 rounded-xl max-w-lg w-full p-space-lg shadow-2xl flex flex-col gap-space-md border border-slate-200 animate-scale-up">
            <div className="flex items-center justify-between pb-space-sm border-b border-slate-200">
              <div className="flex items-center gap-space-sm">
                <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
                  <span className="material-symbols-outlined text-[24px]">assignment_turned_in</span>
                </div>
                <div>
                  <h4 className="font-title-lg text-title-lg font-bold text-slate-900">Pengajuan Koreksi Presensi</h4>
                  <span className="font-caption text-caption text-slate-500">Sesuai Regulasi Akademik FR-039</span>
                </div>
              </div>
              <button
                aria-label="Tutup Dialog"
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg transition-colors"
                onClick={() => setIsCorrectionModalOpen(false)}
                type="button"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="text-slate-600 font-body-sm text-body-sm bg-slate-50 p-space-sm rounded-lg border border-slate-200">
              Anda mengajukan permohonan dispensasi presensi untuk <strong className="text-slate-800">Pertemuan 3: Rekayasa Perangkat Lunak (TI-A)</strong> kepada <strong className="text-slate-800">Dr. Awan Rosi, M.Kom.</strong>
            </div>

            <form onSubmit={handleCorrectionSubmit} className="flex flex-col gap-space-md">
              <div className="flex flex-col gap-space-xs">
                <label className="font-label-sm text-label-sm text-slate-700 font-semibold">
                  Alasan Keterlambatan / Ketidakhadiran <span className="text-red-500">*</span>
                </label>
                <select
                  className="w-full rounded-lg bg-slate-50 border border-slate-300 p-2.5 font-body-sm text-body-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  value={correctionReason}
                  onChange={(e) => setCorrectionReason(e.target.value)}
                >
                  <option>Kendala Jaringan / Perangkat Lab Bermasalah</option>
                  <option>Sakit dengan Surat Keterangan Dokter</option>
                  <option>Tugas Resmi Institusi / Delegasi Universitas</option>
                  <option>Lainnya (Perlu Verifikasi Lisan)</option>
                </select>
              </div>

              <div className="flex flex-col gap-space-xs">
                <label className="font-label-sm text-label-sm text-slate-700 font-semibold">
                  Catatan Tambahan untuk Dosen <span className="text-red-500">*</span>
                </label>
                <textarea
                  className="w-full rounded-lg bg-slate-50 border border-slate-300 p-2.5 font-body-sm text-body-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  placeholder="Tuliskan keterangan detail kendala Anda..."
                  rows="3"
                  value={correctionNote}
                  onChange={(e) => setCorrectionNote(e.target.value)}
                  required
                ></textarea>
              </div>

              <div className="flex items-center justify-end gap-space-sm pt-space-xs border-t border-slate-200">
                <button
                  className="px-space-md py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-label-md text-label-md font-medium transition-colors"
                  onClick={() => setIsCorrectionModalOpen(false)}
                  type="button"
                >
                  Batal
                </button>
                <button
                  className="px-space-md py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-label-md text-label-md font-semibold transition-colors flex items-center gap-1.5 shadow-md disabled:opacity-50"
                  disabled={isSubmittingCorrection}
                  type="submit"
                >
                  {isSubmittingCorrection ? (
                    <>
                      <span className="material-symbols-outlined text-[18px] animate-spin">refresh</span>
                      <span>Mengirimkan...</span>
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-[18px]">send</span>
                      <span>Kirim ke Dosen Pengampu</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
