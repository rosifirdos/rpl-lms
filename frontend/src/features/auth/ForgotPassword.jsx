import React, { useState, useEffect, useRef } from 'react';
import ThemeToggle from '../../components/ThemeToggle';

/**
 * ForgotPassword — feature component (auth)
 *
 * Digunakan sebagai komponen inti halaman pemulihan kata sandi SPADA LMS.
 * Mendukung navigasi SPA via props (onNavigate, onBack) serta API nyata:
 *   POST /api/auth/forgot-password  { email }
 *   POST /api/auth/resend-reset     { email }
 */
export default function ForgotPassword({ onNavigate, onBack }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);
  const cooldownTimerRef = useRef(null);
  const isMountedRef = useRef(true);

  // Countdown timer menggunakan useRef untuk menyimpan timer ID
  // Effect dengan dependency [resendCooldown] yang benar: hanya memulai timer saat cooldown > 0
  // Cleanup di return function memastikan tidak ada setState setelah unmount
  useEffect(() => {
    isMountedRef.current = true;

    // Hentikan timer yang sedang berjalan
    if (cooldownTimerRef.current) {
      clearTimeout(cooldownTimerRef.current);
      cooldownTimerRef.current = null;
    }

    // Mulai countdown hanya jika cooldown > 0
    if (resendCooldown > 0) {
      cooldownTimerRef.current = setTimeout(() => {
        if (isMountedRef.current) {
          setResendCooldown((prev) => prev - 1);
        }
      }, 1000);
    }

    // Cleanup: hentikan timer saat unmount atau saat resendCooldown berubah
    return () => {
      isMountedRef.current = false;
      if (cooldownTimerRef.current) {
        clearTimeout(cooldownTimerRef.current);
        cooldownTimerRef.current = null;
      }
    };
  }, [resendCooldown]); // Dependency: re-run effect saat cooldown berubah (termasuk saat berkurang via setTimeout callback)

  // Guard setState after unmount
  const safeSetResendCooldown = (value) => {
    if (isMountedRef.current) {
      setResendCooldown(value);
    }
  };

  /** Validasi & submit permintaan reset password */
  const handleSubmit = (e) => {
    e.preventDefault();
    // Guard: prevent double submission
    if (loading) return;
    setErrorMessage('');

    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      setErrorMessage('Harap masukkan alamat email resmi UPGRIS yang valid.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      setErrorMessage('Format email tidak valid. Gunakan email terdaftar UPGRIS.');
      return;
    }

    setLoading(true);

    // TODO: Ganti simulasi ini dengan pemanggilan API nyata:
    // await apiClient.post('/api/auth/forgot-password', { email: trimmedEmail });
    setTimeout(() => {
      setLoading(false);
      setSubmittedEmail(trimmedEmail);
      setEmail('');
      safeSetResendCooldown(60);
    }, 1100);
  };

  /** Kirim ulang tautan setelah cooldown habis */
  const handleResend = () => {
    if (resendCooldown > 0 || !submittedEmail || loading) return;
    setLoading(true);
    // TODO: await apiClient.post('/api/auth/resend-reset', { email: submittedEmail });
    setTimeout(() => {
      setLoading(false);
      safeSetResendCooldown(60);
    }, 1000);
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-surface font-body-md text-body-md text-on-surface relative overflow-x-hidden selection:bg-primary selection:text-on-primary">

      {/* Decorative Radial Ambient Glow */}
      <div className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgb(var(--primary)/0.15),rgb(var(--surface)/0))]" />

      {/* ── Header Portal ── */}
      <header className="relative z-10 w-full pt-margin-mobile md:pt-margin">
        <div className="w-full max-w-7xl mx-auto px-gutter-mobile md:px-gutter flex items-center justify-between">
          {/* Brand */}
          <div className="flex items-center gap-space-md">
            <div className="w-10 h-10 rounded-lg bg-surface-container-high flex items-center justify-center text-primary shadow-[0_1px_8px_rgb(var(--scrim)/0.04)]">
              <span className="material-symbols-outlined text-[24px]">school</span>
            </div>
            <div className="flex flex-col">
              <span className="font-title-lg text-title-lg text-on-surface tracking-tight">SPADA LMS</span>
              <span className="font-caption text-caption text-on-surface-variant uppercase tracking-wider">
                Universitas PGRI Semarang
              </span>
            </div>
          </div>

          {/* Pengalih tema + status aktif */}
          <div className="flex items-center gap-space-sm">
            <ThemeToggle variant="labeled" />
            <div className="hidden sm:flex items-center gap-space-xs px-space-md py-space-xs rounded-full bg-surface-container-low">
              <span className="w-2 h-2 rounded-full bg-tertiary animate-pulse" />
              <span className="font-label-sm text-label-sm text-tertiary">Sistem Aktif</span>
            </div>
          </div>
        </div>
      </header>

      {/* ── Main Content ── */}
      <main className="relative z-10 flex-1 flex items-center justify-center w-full px-gutter-mobile md:px-gutter py-space-xl">
        <div className="flex flex-col w-full items-center justify-center relative">

          {/* Glow Rings dekoratif di belakang kartu */}
          <div className="pointer-events-none absolute -top-16 left-1/2 -translate-x-1/2 w-[520px] h-[520px] bg-primary/10 rounded-full blur-3xl -z-10" />
          <div className="pointer-events-none absolute top-1/3 -right-20 w-80 h-80 bg-secondary/10 rounded-full blur-2xl -z-10" />

          {/* ── Recovery Container ── */}
          <div className="w-full max-w-[480px] mx-auto">

            {/* Card utama */}
            <div className="bg-surface rounded-2xl p-6 sm:p-8 shadow-[0_20px_35px_-10px_rgb(var(--scrim)/0.35),0_0_0_1px_rgb(var(--on-surface)/0.06)] relative overflow-hidden text-on-surface">

              {/* Accent bar institusional */}
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-primary via-secondary to-tertiary" />

              {/* Micro-chip institusi */}
              <div className="flex justify-center mb-6">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container text-on-surface-variant font-caption text-caption tracking-wider uppercase font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                  SPADA LMS &bull; UPGRIS
                </span>
              </div>

              {/* Icon & Judul */}
              <div className="flex flex-col items-center text-center mb-6">
                <div className="w-16 h-16 rounded-full bg-primary-container flex items-center justify-center text-primary shadow-inner mb-4 transition-transform hover:scale-105 duration-300">
                  <span className="material-symbols-outlined text-[32px]">lock_reset</span>
                </div>
                <h1 className="font-headline-md text-[22px] font-bold text-on-surface tracking-tight mb-2">
                  Pemulihan Kata Sandi
                </h1>
                <p className="font-body-md text-body-md text-outline leading-relaxed max-w-sm">
                  Masukkan email terdaftar Anda. Kami akan mengirimkan tautan untuk mengatur ulang
                  kata sandi akun SPADA Anda.
                </p>
              </div>

              {/* ── Notifikasi sukses (kondisional) ── */}
              {submittedEmail && (
                <div className="mb-6 p-4 rounded-xl bg-tertiary-container border border-tertiary/30 transition-all duration-300">
                  <div className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-tertiary text-[22px] flex-shrink-0 mt-0.5">
                      check_circle
                    </span>
                    <div className="flex-1">
                      <h4 className="font-title-md text-sm font-bold text-on-tertiary-container">
                        Tautan Berhasil Dikirim!
                      </h4>
                      <p className="font-body-sm text-body-sm text-on-tertiary-container/90 mt-1 leading-normal">
                        Kami telah mengirimkan instruksi ke{' '}
                        <span className="font-semibold text-on-tertiary-container">{submittedEmail}</span>.
                        Silakan periksa kotak masuk atau folder spam Anda.
                      </p>
                      <button
                        type="button"
                        onClick={handleResend}
                        disabled={resendCooldown > 0 || loading}
                        className={`mt-2 text-xs font-semibold underline transition-colors ${
                          resendCooldown > 0 || loading
                            ? 'text-outline cursor-not-allowed'
                            : 'text-tertiary hover:text-on-tertiary-container cursor-pointer'
                        }`}
                      >
                        {loading ? (
                          'Mengirim ulang tautan...'
                        ) : resendCooldown > 0 ? (
                          `Kirim ulang tautan jika belum diterima (${resendCooldown}s)`
                        ) : (
                          'Kirim ulang tautan sekarang'
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* ── Form Pemulihan ── */}
              <form className="space-y-4" onSubmit={handleSubmit} noValidate>

                {/* Input email */}
                <div className="space-y-1.5">
                  <label
                    htmlFor="recovery-email"
                    className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider"
                  >
                    EMAIL TERDAFTAR
                  </label>
                  <div className="relative rounded-lg shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-outline">
                      <span className="material-symbols-outlined text-[20px]">alternate_email</span>
                    </div>
                    <input
                      id="recovery-email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (errorMessage) setErrorMessage('');
                      }}
                      placeholder="contoh: mahasiswa@upgris.ac.id"
                      required
                      aria-describedby={errorMessage ? 'email-error' : undefined}
                      aria-invalid={!!errorMessage}
                      className={`w-full pl-10 pr-4 py-2.5 rounded-lg bg-surface text-on-surface placeholder-outline
                        font-body-md text-body-md shadow-sm transition-all outline-none border
                        focus:ring-2 focus:ring-primary/20 focus:border-primary
                        ${errorMessage ? 'border-error' : 'border-outline-variant'}`}
                    />
                  </div>
                  {errorMessage && (
                    <p id="email-error" role="alert" className="text-xs text-error font-medium mt-1">
                      {errorMessage}
                    </p>
                  )}
                </div>

                {/* Pill informasi keamanan */}
                <div className="p-3 bg-surface-container rounded-lg flex items-start gap-2.5 border border-outline-variant">
                  <span className="material-symbols-outlined text-outline text-[18px] flex-shrink-0 mt-0.5">
                    verified_user
                  </span>
                  <p className="font-body-sm text-[12px] leading-tight text-outline">
                    Tautan pemulihan berlaku selama <strong>60 menit</strong> dan hanya dapat
                    digunakan satu kali demi keamanan data akademik Anda.
                  </p>
                </div>

                {/* Tombol submit */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-11 px-4 py-2 bg-primary hover:bg-primary-hover active:bg-primary-active
                    disabled:opacity-80 disabled:cursor-not-allowed text-on-primary font-label-md text-label-md
                    rounded-lg font-medium shadow-[0_4px_12px_rgb(var(--primary)/0.3)]
                    hover:shadow-[0_6px_20px_rgb(var(--primary)/0.4)] transition-all
                    flex items-center justify-center gap-2 relative overflow-hidden group"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <svg
                        className="animate-spin h-5 w-5 text-on-primary"
                        fill="none"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                        aria-hidden="true"
                      >
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" d="M4 12a8 8 0 018-8v8H4z" fill="currentColor" />
                      </svg>
                      <span>Memproses...</span>
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <span>Kirim Tautan Pemulihan</span>
                      <span className="material-symbols-outlined text-[18px] transition-transform group-hover:translate-x-1">
                        send
                      </span>
                    </span>
                  )}
                </button>
              </form>

              {/* Divider */}
              <div className="relative my-6">
                <div className="h-px bg-outline-variant" />
              </div>

              {/* Link navigasi & helpdesk */}
              <div className="flex flex-col gap-3 text-center">
                <button
                  type="button"
                  onClick={(e) => {
                    if (onBack) {
                      onBack();
                    } else if (onNavigate) {
                      onNavigate('login');
                    }
                  }}
                  className="inline-flex items-center justify-center gap-1.5 text-sm font-semibold text-primary hover:text-primary-hover transition-colors py-1 group cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px] transition-transform group-hover:-translate-x-1">
                    arrow_back
                  </span>
                  <span>Kembali ke Halaman Masuk</span>
                </button>

                <div className="pt-2">
                  <p className="font-body-sm text-xs text-outline">
                    Butuh bantuan langsung?{' '}
                    <a
                      href="https://upt-ptik.upgris.ac.id"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-on-surface-variant hover:text-primary underline transition-colors"
                    >
                      Hubungi Helpdesk IT UPGRIS
                    </a>
                  </p>
                </div>
              </div>
            </div>

            {/* Metadata keamanan di bawah kartu */}
            <div className="mt-6 flex items-center justify-between px-2 text-on-surface-variant font-caption text-caption">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-tertiary" />
                <span>Autentikasi SSO Terpusat</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">vpn_lock</span>
                <span>Protokol TLS 1.3 Aktif</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* ── Footer ── */}
      <footer className="relative z-10 w-full pb-margin-mobile md:pb-margin pt-space-md">
        <div className="w-full max-w-7xl mx-auto px-gutter-mobile md:px-gutter flex flex-col sm:flex-row items-center justify-between gap-space-sm font-caption text-caption text-on-surface-variant">
          <div className="flex items-center gap-space-xs">
            <span className="material-symbols-outlined text-[16px] text-primary">verified_user</span>
            <span>Enkripsi 256-bit Terproteksi SSL &bull; Pusat Data Terpadu UPT PTIK UPGRIS</span>
          </div>
          <div>
            <span>&copy; {new Date().getFullYear()} SPADA LMS UPGRIS. Hak Cipta Dilindungi Undang-Undang.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
