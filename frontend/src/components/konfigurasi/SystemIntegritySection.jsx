import React from 'react';

export default function SystemIntegritySection({ config, onChange, onNavigate }) {
  const handleOpenAudit = (e) => {
    e.preventDefault();
    if (onNavigate) {
      onNavigate('jejak-audit');
    } else {
      window.location.href = '#jejak-audit';
    }
  };

  return (
    <section
      id="sec-integritas"
      className="bg-surface-container-low rounded-xl p-space-lg shadow-sm flex flex-col gap-space-lg"
    >
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-space-sm">
          <div className="w-10 h-10 rounded-lg bg-surface-bright/40 text-on-surface flex items-center justify-center">
            <span className="material-symbols-outlined text-[24px]">shield_with_heart</span>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-space-xs flex-wrap">
              <h3 className="font-title-lg text-title-lg text-on-surface">
                4. Integritas Sistem &amp; Jejak Audit
              </h3>
              <span className="px-space-xs py-0.5 rounded bg-surface-container-highest text-outline font-caption text-caption">
                BR-015, NFR-009
              </span>
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              Parameter logging kepatuhan audit BAN-PT, retensi histori perubahan nilai, dan integritas autentikasi.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md">
        {/* Tingkat Pencatatan Audit */}
        <div className="flex flex-col gap-space-sm p-space-md rounded-lg bg-surface-container">
          <label className="font-label-md text-label-md text-on-surface font-semibold">
            Tingkat Granularitas Audit (Logging Level)
          </label>
          <select
            value={config.auditLoggingLevel}
            onChange={(e) => onChange('auditLoggingLevel', e.target.value)}
            className="w-full bg-surface-container-lowest font-body-md text-body-md text-on-surface px-space-md py-space-sm rounded-lg focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
          >
            <option value="verbose">
              Full Verbose (Catat Nilai, Enrollment, User, &amp; Konfigurasi)
            </option>
            <option value="standard">Standard (Hanya Transaksi Nilai &amp; User)</option>
            <option value="security">Security Only (Autentikasi &amp; Otorisasi)</option>
          </select>
          <p className="font-caption text-caption text-on-surface-variant mt-1">
            Mode Verbose menjamin jejak rekam mutasi nilai tidak dapat diubah (Append-Only Immutable Records).
          </p>
        </div>

        {/* Retensi Log Audit */}
        <div className="flex flex-col gap-space-sm p-space-md rounded-lg bg-surface-container">
          <label className="font-label-md text-label-md text-on-surface font-semibold">
            Periode Retensi Jejak Audit
          </label>
          <div className="flex items-center gap-space-sm">
            <input
              type="text"
              readOnly
              value={config.auditRetention}
              className="w-full bg-surface-container-lowest font-body-md text-body-md text-on-surface px-space-md py-space-sm rounded-lg font-bold"
            />
            <span className="px-space-sm py-space-sm rounded-lg bg-surface-container-high text-tertiary font-label-sm text-label-sm font-semibold shrink-0">
              Kepatuhan Akreditasi
            </span>
          </div>
          <p className="font-caption text-caption text-outline mt-1">
            Sesuai standar audit BAN-PT dan LAM-INFOKOM untuk penjaminan mutu rekam jejak akademik universitas.
          </p>
        </div>
      </div>

      {/* Tombol Aksi Langsung ke Jejak Audit */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-space-md p-space-md rounded-lg bg-surface-container-highest/40">
        <div className="flex items-center gap-space-sm">
          <span className="material-symbols-outlined text-primary text-[24px]">history_edu</span>
          <div className="flex flex-col">
            <span className="font-label-md text-label-md text-on-surface font-semibold">
              Akses Langsung Ledger Jejak Audit
            </span>
            <span className="font-caption text-caption text-on-surface-variant">
              Tinjau 1,428 entri mutasi terverifikasi dengan cryptographic hash.
            </span>
          </div>
        </div>
        <a
          href="#jejak-audit"
          onClick={handleOpenAudit}
          className="px-space-md py-space-xs rounded-lg bg-surface-container-high hover:bg-surface-bright text-primary font-label-md text-label-md transition-colors flex items-center gap-1 shrink-0 cursor-pointer"
        >
          <span>Buka Jejak Audit</span>
          <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
        </a>
      </div>
    </section>
  );
}
