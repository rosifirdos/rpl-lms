import React, { useState } from 'react';
import AppShell from '../../components/AppShell';

export default function KonfigurasiSistem({ onRoleChange, onNavigate }) {
  const [toastMessage, setToastMessage] = useState(null);

  // Settings state
  const [academicYear, setAcademicYear] = useState('2026/2027 Ganjil');
  const [attendanceTolerance, setAttendanceTolerance] = useState(15); // minutes (BR-011)
  const [examEligibilityThreshold, setExamEligibilityThreshold] = useState(75); // % (BR-012)
  const [maxUploadSize, setMaxUploadSize] = useState(20); // MB
  const [sessionTimeout, setSessionTimeout] = useState(120); // minutes
  const [auditRetentionDays, setAuditRetentionDays] = useState(365);
  const [allowedExtensions, setAllowedExtensions] = useState('pdf, docx, pptx, zip, jpg, png');
  const [antiMalwareScan, setAntiMalwareScan] = useState(true);
  const [maintenanceMode, setMaintenanceMode] = useState(false);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleSaveConfig = (e) => {
    e.preventDefault();
    showToast('Konfigurasi sistem E-Learning Kampus berhasil diperbarui dan diterapkan ke seluruh klaster server.');
  };

  const handleResetDefaults = () => {
    setAttendanceTolerance(15);
    setExamEligibilityThreshold(75);
    setMaxUploadSize(20);
    setSessionTimeout(120);
    setAuditRetentionDays(365);
    setAllowedExtensions('pdf, docx, pptx, zip, jpg, png');
    setAntiMalwareScan(true);
    setMaintenanceMode(false);
    showToast('Parameter sistem telah dikembalikan ke standar rekomendasi Kampus.');
  };

  return (
    <AppShell
      activeRole="admin"
      onRoleChange={onRoleChange}
      activeNavPath="konfigurasi-sistem"
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
            onNavigate && onNavigate('dasbor-admin');
          }}
          className="hover:text-primary transition-colors flex items-center gap-1"
        >
          <span className="material-symbols-outlined text-[16px]">home</span>
          <span>Dashboard Admin</span>
        </a>
        <span className="material-symbols-outlined text-[14px] text-outline">chevron_right</span>
        <span className="text-secondary font-semibold">Konfigurasi Sistem &amp; Kebijakan E-Learning Kampus</span>
      </nav>

      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-surface-container-high via-surface-container to-surface-container-low p-space-lg shadow-sm mb-space-lg border border-outline-variant/20">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-space-md">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-primary-container text-on-primary-container font-label-sm text-[12px] font-bold">
                E-Learning Core System v2.4
              </span>
              <span className="font-caption text-caption text-on-surface-variant">
                Pengaturan Global LMS Kampus
              </span>
            </div>
            <h1 className="font-headline-sm text-headline-sm text-on-surface font-bold tracking-tight">
              Konfigurasi Sistem &amp; Parameter Global
            </h1>
            <p className="font-body-md text-body-md text-on-surface-variant">
              Kelola batas presensi (BR-011/012), batasan unggah berkas, kebijakan sesi, dan integrasi SIAKAD.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleResetDefaults}
              className="px-4 py-2 rounded-xl bg-surface-container-highest hover:bg-surface-bright text-on-surface font-label-md text-label-md font-semibold transition-all border border-outline-variant/30 flex items-center gap-1.5 shadow-sm"
            >
              <span className="material-symbols-outlined text-[18px]">restart_alt</span>
              <span>Reset Default</span>
            </button>
            <button
              type="button"
              onClick={() => showToast('Menjalankan tes koneksi SIAKAD API... Hasil: 200 OK (24ms latency)')}
              className="px-4 py-2 rounded-xl bg-tertiary-container/30 hover:bg-tertiary-container/50 text-tertiary font-label-md text-label-md font-bold transition-all border border-tertiary/30 flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[18px]">wifi</span>
              <span>Uji SIAKAD API</span>
            </button>
          </div>
        </div>
      </div>

      {/* Status Indicators Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-md mb-space-lg">
        <div className="p-space-md rounded-xl bg-surface-container-low border border-outline-variant/20 shadow-sm flex items-center justify-between">
          <div>
            <span className="font-caption text-caption text-on-surface-variant block">Status Server Web</span>
            <span className="font-title-md font-bold text-tertiary flex items-center gap-1 mt-0.5">
              <span className="w-2 h-2 rounded-full bg-tertiary animate-pulse" />
              ONLINE (100% Up)
            </span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-tertiary-container/20 text-tertiary flex items-center justify-center">
            <span className="material-symbols-outlined text-[22px]">dns</span>
          </div>
        </div>

        <div className="p-space-md rounded-xl bg-surface-container-low border border-outline-variant/20 shadow-sm flex items-center justify-between">
          <div>
            <span className="font-caption text-caption text-on-surface-variant block">Koneksi PostgreSQL</span>
            <span className="font-title-md font-bold text-on-surface block mt-0.5">14ms Latensi</span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-primary-container/20 text-primary flex items-center justify-center">
            <span className="material-symbols-outlined text-[22px]">database</span>
          </div>
        </div>

        <div className="p-space-md rounded-xl bg-surface-container-low border border-outline-variant/20 shadow-sm flex items-center justify-between">
          <div>
            <span className="font-caption text-caption text-on-surface-variant block">Kapasitas Penyimpanan</span>
            <span className="font-title-md font-bold text-secondary block mt-0.5">480 / 1.000 GB</span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-secondary-container/20 text-secondary flex items-center justify-center">
            <span className="material-symbols-outlined text-[22px]">cloud</span>
          </div>
        </div>

        <div className="p-space-md rounded-xl bg-surface-container-low border border-outline-variant/20 shadow-sm flex items-center justify-between">
          <div>
            <span className="font-caption text-caption text-on-surface-variant block">Sinkronisasi SIAKAD</span>
            <span className="font-title-md font-bold text-tertiary block mt-0.5">Otomatis Aktif</span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-tertiary-container/20 text-tertiary flex items-center justify-center">
            <span className="material-symbols-outlined text-[22px]">sync</span>
          </div>
        </div>
      </div>

      {/* Main Settings Form */}
      <form onSubmit={handleSaveConfig} className="flex flex-col gap-space-lg mb-space-xl">
        {/* Section 1: Aturan Presensi & Akademik (BR-011, BR-012) */}
        <div className="bg-surface-container-low rounded-2xl border border-outline-variant/20 p-space-lg shadow-sm">
          <div className="flex items-center gap-3 pb-space-sm border-b border-outline-variant/20 mb-space-md">
            <div className="w-9 h-9 rounded-lg bg-primary-container/20 text-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px]">how_to_reg</span>
            </div>
            <div>
              <h2 className="font-title-md text-title-md font-bold text-on-surface">
                1. Kebijakan Presensi &amp; Ambang Akademik (BR-011 / BR-012)
              </h2>
              <p className="font-caption text-caption text-on-surface-variant">
                Pengaturan ketat toleransi presensi mahasiswa dan gatekeeping ujian akhir semester.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-space-md">
            <div>
              <label htmlFor="input-academic-year" className="block font-label-md text-label-md font-semibold text-on-surface mb-1">
                Semester Perkuliahan Aktif
              </label>
              <select
                id="input-academic-year"
                value={academicYear}
                onChange={(e) => setAcademicYear(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg bg-surface-container border border-outline-variant/30 text-on-surface font-body-md focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="2026/2027 Ganjil">2026/2027 Ganjil (Aktif)</option>
                <option value="2026/2027 Genap">2026/2027 Genap (Mendatang)</option>
                <option value="2025/2026 Genap">2025/2026 Genap (Arsip)</option>
              </select>
            </div>

            <div>
              <label htmlFor="input-tolerance" className="block font-label-md text-label-md font-semibold text-on-surface mb-1">
                Toleransi Presensi Sesi (BR-011)
              </label>
              <div className="relative">
                <input
                  id="input-tolerance"
                  type="number"
                  min="5"
                  max="60"
                  value={attendanceTolerance}
                  onChange={(e) => setAttendanceTolerance(Number(e.target.value))}
                  className="w-full px-3 py-2.5 rounded-lg bg-surface-container border border-outline-variant/30 text-on-surface font-body-md focus:outline-none focus:ring-1 focus:ring-primary pr-16"
                />
                <span className="absolute right-3 top-2.5 text-on-surface-variant text-label-sm font-semibold">
                  Menit
                </span>
              </div>
              <span className="text-[11px] text-on-surface-variant mt-1 block">Waktu hitung mundur State B sebelum terkunci otomatis.</span>
            </div>

            <div>
              <label htmlFor="input-threshold" className="block font-label-md text-label-md font-semibold text-on-surface mb-1">
                Syarat Minimal UTS/UAS (BR-012)
              </label>
              <div className="relative">
                <input
                  id="input-threshold"
                  type="number"
                  min="50"
                  max="100"
                  value={examEligibilityThreshold}
                  onChange={(e) => setExamEligibilityThreshold(Number(e.target.value))}
                  className="w-full px-3 py-2.5 rounded-lg bg-surface-container border border-outline-variant/30 text-on-surface font-body-md focus:outline-none focus:ring-1 focus:ring-primary pr-12"
                />
                <span className="absolute right-3 top-2.5 text-on-surface-variant text-label-sm font-semibold">
                  %
                </span>
              </div>
              <span className="text-[11px] text-on-surface-variant mt-1 block">Ambang batas presensi untuk penerbitan kartu ujian.</span>
            </div>
          </div>
        </div>

        {/* Section 2: Kebijakan Berkas & Penyimpanan */}
        <div className="bg-surface-container-low rounded-2xl border border-outline-variant/20 p-space-lg shadow-sm">
          <div className="flex items-center gap-3 pb-space-sm border-b border-outline-variant/20 mb-space-md">
            <div className="w-9 h-9 rounded-lg bg-secondary-container/20 text-secondary flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px]">folder_zip</span>
            </div>
            <div>
              <h2 className="font-title-md text-title-md font-bold text-on-surface">
                2. Kebijakan Berkas &amp; Whitelist Ekstensi MIME
              </h2>
              <p className="font-caption text-caption text-on-surface-variant">
                Pengamanan berkas unggahan tugas mahasiswa dan materi ajar dosen.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md mb-space-md">
            <div>
              <label htmlFor="input-upload-size" className="block font-label-md text-label-md font-semibold text-on-surface mb-1">
                Batas Maksimal Ukuran Berkas
              </label>
              <div className="relative">
                <input
                  id="input-upload-size"
                  type="number"
                  min="5"
                  max="100"
                  value={maxUploadSize}
                  onChange={(e) => setMaxUploadSize(Number(e.target.value))}
                  className="w-full px-3 py-2.5 rounded-lg bg-surface-container border border-outline-variant/30 text-on-surface font-body-md focus:outline-none focus:ring-1 focus:ring-primary pr-14"
                />
                <span className="absolute right-3 top-2.5 text-on-surface-variant text-label-sm font-semibold">
                  MB
                </span>
              </div>
            </div>

            <div>
              <label htmlFor="input-extensions" className="block font-label-md text-label-md font-semibold text-on-surface mb-1">
                Whitelist Ekstensi yang Diizinkan
              </label>
              <input
                id="input-extensions"
                type="text"
                value={allowedExtensions}
                onChange={(e) => setAllowedExtensions(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg bg-surface-container border border-outline-variant/30 text-on-surface font-body-md focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <span className="text-[11px] text-on-surface-variant mt-1 block">Pisahkan dengan koma (contoh: pdf, docx, zip).</span>
            </div>
          </div>

          <label className="flex items-center gap-3 p-3 rounded-xl bg-surface-container cursor-pointer border border-outline-variant/20 hover:bg-surface-container-high transition-colors">
            <input
              type="checkbox"
              checked={antiMalwareScan}
              onChange={(e) => setAntiMalwareScan(e.target.checked)}
              className="w-4 h-4 accent-primary rounded"
            />
            <div>
              <span className="font-label-md font-semibold text-on-surface block">
                Aktifkan Pemeriksaan Otomatis Antivirus / Malware Upload
              </span>
              <span className="font-caption text-caption text-on-surface-variant block">
                Memindai header MIME dan payload berkas sebelum disimpan ke storage server.
              </span>
            </div>
          </label>
        </div>

        {/* Section 3: Keamanan Sesi & Server */}
        <div className="bg-surface-container-low rounded-2xl border border-outline-variant/20 p-space-lg shadow-sm">
          <div className="flex items-center gap-3 pb-space-sm border-b border-outline-variant/20 mb-space-md">
            <div className="w-9 h-9 rounded-lg bg-tertiary-container/20 text-tertiary flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px]">security</span>
            </div>
            <div>
              <h2 className="font-title-md text-title-md font-bold text-on-surface">
                3. Kebijakan Sesi &amp; Pemeliharaan Sistem
              </h2>
              <p className="font-caption text-caption text-on-surface-variant">
                Batas inaktivitas otentikasi JWT dan retensi jejak audit audit-log.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md mb-space-md">
            <div>
              <label htmlFor="input-session-timeout" className="block font-label-md text-label-md font-semibold text-on-surface mb-1">
                Batas Inaktivitas Sesi Pengguna
              </label>
              <div className="relative">
                <input
                  id="input-session-timeout"
                  type="number"
                  min="15"
                  max="480"
                  value={sessionTimeout}
                  onChange={(e) => setSessionTimeout(Number(e.target.value))}
                  className="w-full px-3 py-2.5 rounded-lg bg-surface-container border border-outline-variant/30 text-on-surface font-body-md focus:outline-none focus:ring-1 focus:ring-primary pr-16"
                />
                <span className="absolute right-3 top-2.5 text-on-surface-variant text-label-sm font-semibold">
                  Menit
                </span>
              </div>
            </div>

            <div>
              <label htmlFor="input-audit-retention" className="block font-label-md text-label-md font-semibold text-on-surface mb-1">
                Masa Simpan Jejak Audit (Audit Trail)
              </label>
              <div className="relative">
                <input
                  id="input-audit-retention"
                  type="number"
                  min="30"
                  max="730"
                  value={auditRetentionDays}
                  onChange={(e) => setAuditRetentionDays(Number(e.target.value))}
                  className="w-full px-3 py-2.5 rounded-lg bg-surface-container border border-outline-variant/30 text-on-surface font-body-md focus:outline-none focus:ring-1 focus:ring-primary pr-14"
                />
                <span className="absolute right-3 top-2.5 text-on-surface-variant text-label-sm font-semibold">
                  Hari
                </span>
              </div>
            </div>
          </div>

          <label className="flex items-center gap-3 p-3 rounded-xl bg-surface-container cursor-pointer border border-outline-variant/20 hover:bg-surface-container-high transition-colors">
            <input
              type="checkbox"
              checked={maintenanceMode}
              onChange={(e) => setMaintenanceMode(e.target.checked)}
              className="w-4 h-4 accent-error rounded"
            />
            <div>
              <span className="font-label-md font-semibold text-on-surface block">
                Mode Pemeliharaan (Maintenance Mode)
              </span>
              <span className="font-caption text-caption text-on-surface-variant block">
                Hanya akun Admin Kampus yang dapat mengakses antarmuka ketika mode ini diaktifkan.
              </span>
            </div>
          </label>
        </div>

        {/* Submit Actions */}
        <div className="flex items-center justify-end gap-space-sm pt-space-md border-t border-outline-variant/20">
          <button
            type="submit"
            className="px-8 py-3 rounded-xl bg-primary text-on-primary font-label-md text-label-md font-bold hover:bg-primary/90 transition-all shadow-md flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-[20px]">save</span>
            <span>Simpan Konfigurasi Sistem</span>
          </button>
        </div>
      </form>
    </AppShell>
  );
}
