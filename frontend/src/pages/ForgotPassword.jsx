import React, { useState, useEffect } from 'react';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    let timer;
    if (resendCooldown > 0) {
      timer = setTimeout(() => {
        setResendCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMessage('');

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setErrorMessage('Harap masukkan alamat email resmi UPGRIS yang valid.');
      return;
    }

    // Validasi format email dasar
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      setErrorMessage('Format email tidak valid. Gunakan email terdaftar UPGRIS.');
      return;
    }

    setLoading(true);

    // Simulasi pengiriman instruksi reset password (dapat dihubungkan ke apiClient POST /api/auth/forgot-password)
    setTimeout(() => {
      setLoading(false);
      setSubmittedEmail(trimmedEmail);
      setEmail('');
      setResendCooldown(60);
    }, 1100);
  };

  const handleResend = () => {
    if (resendCooldown > 0 || !submittedEmail) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setResendCooldown(60);
    }, 1000);
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-surface font-body-md text-body-md text-on-surface relative overflow-x-hidden selection:bg-primary selection:text-on-primary">
      {/* Decorative Radial Ambient Glow */}
      <div className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(59,130,246,0.15),rgba(255,255,255,0))]"></div>

      {/* Header Portal */}
      <header className="relative z-10 w-full pt-margin-mobile md:pt-margin">
        <div className="w-full max-w-7xl mx-auto px-gutter-mobile md:px-gutter flex items-center justify-between">
          <div className="flex items-center gap-space-md">
            <div className="w-10 h-10 rounded-lg bg-surface-container-high flex items-center justify-center text-primary shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
              <span className="material-symbols-outlined text-[24px]">school</span>
            </div>
            <div className="flex flex-col">
              <span className="font-title-lg text-title-lg text-on-surface tracking-tight">SPADA LMS</span>
              <span className="font-caption text-caption text-on-surface-variant uppercase tracking-wider">Universitas PGRI Semarang</span>
            </div>
          </div>
          <div className="flex items-center gap-space-xs px-space-md py-space-xs rounded-full bg-surface-container-low">
            <span className="w-2 h-2 rounded-full bg-tertiary animate-pulse"></span>
            <span className="font-label-sm text-label-sm text-tertiary">Sistem Aktif</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex-1 flex items-center justify-center w-full px-gutter-mobile md:px-gutter py-space-xl">
        <div className="flex flex-col w-full items-center justify-center relative">
          {/* Subtle Ambient Decorative Glow Rings behind card */}
          <div className="pointer-events-none absolute -top-16 left-1/2 -translate-x-1/2 w-[520px] h-[520px] bg-primary/10 rounded-full blur-3xl -z-10"></div>
          <div className="pointer-events-none absolute top-1/3 -right-20 w-80 h-80 bg-secondary/10 rounded-full blur-2xl -z-10"></div>

          {/* Main Recovery Container */}
          <div className="w-full max-w-[480px] mx-auto">
            {/* Elevated Floating Gateway Card */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-[0_20px_35px_-10px_rgba(2,15,30,0.7),0_0_0_1px_rgba(255,255,255,0.06)] relative overflow-hidden text-[#1F2937]">
              {/* Top Decorative Institutional Accent Bar */}
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#2563EB] via-[#38BDF8] to-[#10B981]"></div>

              {/* Institutional Micro-chip */}
              <div className="flex justify-center mb-6">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F1F5F9] text-[#475569] font-caption text-caption tracking-wider uppercase font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#2563EB]"></span>
                  SPADA LMS &bull; UPGRIS
                </span>
              </div>

              {/* Icon & Title Header */}
              <div className="flex flex-col items-center text-center mb-6">
                <div className="w-16 h-16 rounded-full bg-[#EFF6FF] flex items-center justify-center text-[#2563EB] shadow-inner mb-4 transition-transform hover:scale-105 duration-300">
                  <span className="material-symbols-outlined text-[32px]">lock_reset</span>
                </div>
                <h1 className="font-headline-md text-[22px] font-bold text-[#1F2937] tracking-tight mb-2">
                  Pemulihan Kata Sandi
                </h1>
                <p className="font-body-md text-body-md text-[#64748B] leading-relaxed max-w-sm">
                  Masukkan email terdaftar Anda. Kami akan mengirimkan tautan untuk mengatur ulang kata sandi akun SPADA Anda.
                </p>
              </div>

              {/* Dynamic Success Notification */}
              {submittedEmail && (
                <div className="mb-6 p-4 rounded-xl bg-[#ECFDF5] text-[#065F46] transition-all duration-300 border border-[#A7F3D0]">
                  <div className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-[#059669] text-[22px] flex-shrink-0 mt-0.5">check_circle</span>
                    <div className="flex-1">
                      <h4 className="font-title-md text-sm font-bold text-[#065F46]">Tautan Berhasil Dikirim!</h4>
                      <p className="font-body-sm text-body-sm text-[#047857] mt-1 leading-normal">
                        Kami telah mengirimkan instruksi ke <span className="font-semibold text-[#065F46]">{submittedEmail}</span>. Silakan periksa kotak masuk atau folder spam Anda.
                      </p>
                      <button
                        type="button"
                        onClick={handleResend}
                        disabled={resendCooldown > 0}
                        className={mt-2 text-xs font-semibold }
                      >
                        {resendCooldown > 0
                          ? Kirim ulang tautan jika belum diterima (s)
                          : 'Kirim ulang tautan sekarang'}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Recovery Form */}
              <form className="space-y-4" onSubmit={handleSubmit}>
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-[#475569] uppercase tracking-wider" htmlFor="recovery-email">
                    EMAIL TERDAFTAR
                  </label>
                  <div className="relative rounded-lg shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#64748B]">
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
                      className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-white text-[#1F2937] placeholder-[#94A3B8] font-body-md text-body-md shadow-sm transition-all outline-none border border-[#CBD5E1] focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/20"
                    />
                  </div>
                  {errorMessage && (
                    <p className="text-xs text-[#DC2626] font-medium mt-1">
                      {errorMessage}
                    </p>
                  )}
                </div>

                {/* Security Instruction Pill */}
                <div className="p-3 bg-[#F8FAFC] rounded-lg flex items-start gap-2.5 border border-[#E2E8F0]">
                  <span className="material-symbols-outlined text-[#64748B] text-[18px] flex-shrink-0 mt-0.5">verified_user</span>
                  <p className="font-body-sm text-[12px] leading-tight text-[#64748B]">
                    Tautan pemulihan berlaku selama <strong>60 menit</strong> dan hanya dapat digunakan satu kali demi keamanan data akademik Anda.
                  </p>
                </div>

                {/* Primary Action Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-11 px-4 py-2 bg-[#2563EB] hover:bg-[#1D4ED8] active:bg-[#1E40AF] disabled:opacity-80 disabled:cursor-not-allowed text-white font-label-md text-label-md rounded-lg font-medium shadow-[0_4px_12px_rgba(37,99,235,0.3)] hover:shadow-[0_6px_20px_rgba(37,99,235,0.4)] transition-all flex items-center justify-center gap-2 relative overflow-hidden group"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" d="M4 12a8 8 0 018-8v8H4z" fill="currentColor"></path>
                      </svg>
                      <span>Memproses...</span>
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <span>Kirim Tautan Pemulihan</span>
                      <span className="material-symbols-outlined text-[18px] transition-transform group-hover:translate-x-1">send</span>
                    </span>
                  )}
                </button>
              </form>

              {/* Divider */}
              <div className="relative my-6">
                <div className="h-px bg-[#E2E8F0]"></div>
              </div>

              {/* Navigation & Help Action Group */}
              <div className="flex flex-col gap-3 text-center">
                <a
                  href="/login"
                  className="inline-flex items-center justify-center gap-1.5 text-sm font-semibold text-[#2563EB] hover:text-[#1D4ED8] transition-colors py-1 group"
                >
                  <span className="material-symbols-outlined text-[18px] transition-transform group-hover:-translate-x-1">arrow_back</span>
                  <span>Kembali ke Halaman Masuk</span>
                </a>

                {/* IT Support / Helpdesk */}
                <div className="pt-2">
                  <p className="font-body-sm text-xs text-[#64748B]">
                    Butuh bantuan langsung?{' '}
                    <a
                      href="https://upt-ptik.upgris.ac.id"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-[#475569] hover:text-[#2563EB] underline transition-colors"
                    >
                      Hubungi Helpdesk IT UPGRIS
                    </a>
                  </p>
                </div>
              </div>
            </div>

            {/* Security & Status Metadata Under Card */}
            <div className="mt-6 flex items-center justify-between px-2 text-on-surface-variant font-caption text-caption">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-tertiary"></span>
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

      {/* Footer */}
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
