import React from 'react';

export default function KpiCards({ config }) {
  const {
    allowedExtensions = ['.pdf', '.docx', '.xlsx', '.zip'],
    payloadLimit = 10,
    attendanceThreshold = 70,
  } = config;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-space-md mb-space-xl">
      {/* KPI 1 */}
      <div className="bg-surface-container rounded-xl p-space-md flex flex-col justify-between shadow-sm relative overflow-hidden group">
        <div className="absolute -right-4 -top-4 w-20 h-20 bg-tertiary/5 rounded-full blur-xl group-hover:bg-tertiary/10 transition-all" />
        <div className="flex items-center justify-between mb-space-sm">
          <span className="font-caption text-caption text-outline uppercase tracking-wider">
            Status Konfigurasi
          </span>
          <span className="p-1 rounded bg-tertiary-container/20 text-tertiary flex items-center justify-center">
            <span className="material-symbols-outlined text-[18px]">tune</span>
          </span>
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-tertiary animate-pulse" />
            <h2 className="font-title-lg text-title-lg text-on-surface font-bold">
              Aktif &amp; Tersinkron
            </h2>
          </div>
          <p className="font-caption text-caption text-on-surface-variant mt-1 flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px] text-tertiary">check_circle</span>
            100% Policy Compliant
          </p>
        </div>
        <div className="mt-space-md pt-space-xs text-outline font-caption text-caption">
          Oleh Admin Super &bull; 06 Okt 2026, 08:30 WIB
        </div>
      </div>

      {/* KPI 2 */}
      <div className="bg-surface-container rounded-xl p-space-md flex flex-col justify-between shadow-sm relative overflow-hidden group">
        <div className="absolute -right-4 -top-4 w-20 h-20 bg-secondary/5 rounded-full blur-xl group-hover:bg-secondary/10 transition-all" />
        <div className="flex items-center justify-between mb-space-sm">
          <span className="font-caption text-caption text-outline uppercase tracking-wider">
            Keamanan Berkas
          </span>
          <span className="p-1 rounded bg-secondary-container/20 text-secondary flex items-center justify-center">
            <span className="material-symbols-outlined text-[18px]">shield</span>
          </span>
        </div>
        <div>
          <h2 className="font-title-lg text-title-lg text-on-surface font-bold">
            {allowedExtensions.length} Format Diizinkan
          </h2>
          <p className="font-caption text-caption text-on-surface-variant mt-1 truncate">
            {allowedExtensions.join(', ')}
          </p>
        </div>
        <div className="mt-space-md pt-space-xs text-outline font-caption text-caption flex items-center gap-1">
          <span className="material-symbols-outlined text-[14px]">data_alert</span>
          Batas payload {payloadLimit} MB per file
        </div>
      </div>

      {/* KPI 3 */}
      <div className="bg-surface-container rounded-xl p-space-md flex flex-col justify-between shadow-sm relative overflow-hidden group">
        <div className="absolute -right-4 -top-4 w-20 h-20 bg-primary/5 rounded-full blur-xl group-hover:bg-primary/10 transition-all" />
        <div className="flex items-center justify-between mb-space-sm">
          <span className="font-caption text-caption text-outline uppercase tracking-wider">
            Gatekeeping Presensi
          </span>
          <span className="p-1 rounded bg-primary-container/20 text-primary flex items-center justify-center">
            <span className="material-symbols-outlined text-[18px]">lock_clock</span>
          </span>
        </div>
        <div>
          <h2 className="font-title-lg text-title-lg text-on-surface font-bold">
            Ambang {attendanceThreshold}%
          </h2>
          <p className="font-caption text-caption text-on-surface-variant mt-1">
            UTS (P-8) &amp; UAS (P-16) Auto-Lock
          </p>
        </div>
        <div className="mt-space-md pt-space-xs text-outline font-caption text-caption flex items-center gap-1">
          <span className="material-symbols-outlined text-[14px] text-tertiary">bolt</span>
          Regulasi Wajib BR-012 Aktif
        </div>
      </div>

      {/* KPI 4 */}
      <div className="bg-surface-container rounded-xl p-space-md flex flex-col justify-between shadow-sm relative overflow-hidden group">
        <div className="absolute -right-4 -top-4 w-20 h-20 bg-surface-bright/20 rounded-full blur-xl" />
        <div className="flex items-center justify-between mb-space-sm">
          <span className="font-caption text-caption text-outline uppercase tracking-wider">
            Jejak Audit
          </span>
          <span className="p-1 rounded bg-surface-container-high text-on-surface-variant flex items-center justify-center">
            <span className="material-symbols-outlined text-[18px]">history</span>
          </span>
        </div>
        <div>
          <h2 className="font-title-lg text-title-lg text-on-surface font-bold">
            Audit Logging Aktif
          </h2>
          <p className="font-caption text-caption text-on-surface-variant mt-1">
            Append-only secure storage
          </p>
        </div>
        <div className="mt-space-md pt-space-xs text-outline font-caption text-caption flex items-center gap-1">
          <span className="material-symbols-outlined text-[14px]">database</span>
          1,428 mutasi tercatat hari ini
        </div>
      </div>
    </div>
  );
}
