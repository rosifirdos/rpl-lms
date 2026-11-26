import React from 'react';

export default function Breadcrumb({
  onReset,
  onSave,
  unsavedCount = 0,
  isSaving = false,
  saveSuccess = false,
  onNavigate,
}) {
  return (
    <div className="flex flex-col gap-space-sm mb-space-lg">
      {/* Breadcrumb Trail */}
      <div className="flex items-center gap-space-xs font-caption text-caption text-outline">
        <a
          href="#dasbor"
          onClick={(e) => {
            e.preventDefault();
            if (onNavigate) onNavigate('dasbor-mahasiswa');
          }}
          className="hover:text-primary transition-colors cursor-pointer"
        >
          Dasbor
        </a>
        <span className="material-symbols-outlined text-[14px]">chevron_right</span>
        <span className="text-on-surface-variant">Konfigurasi Global</span>
        <span className="material-symbols-outlined text-[14px]">chevron_right</span>
        <span className="text-primary font-semibold">Pengaturan Sistem</span>
      </div>

      {/* Main Title and Action Buttons */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-space-md">
        <div className="flex flex-col">
          <div className="flex items-center gap-space-sm">
            <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight">
              Konfigurasi Sistem & Kebijakan Global
            </h1>
            <span className="px-space-sm py-0.5 rounded-full bg-primary/10 text-primary font-label-sm text-label-sm border border-primary/20 flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">verified</span>
              V2.4 Governance
            </span>
          </div>
          <p className="font-body-md text-body-md text-on-surface-variant max-w-4xl mt-0.5">
            Kelola parameter operasional, keamanan berkas, ambang presensi evaluasi akademik, dan integritas platform SPADA LMS UPGRIS.
          </p>
        </div>

        <div className="flex items-center gap-space-sm flex-wrap">
          {/* Reset Button */}
          <button
            type="button"
            id="btn-reset"
            onClick={onReset}
            className="px-space-md py-space-sm rounded-lg bg-surface-container-high hover:bg-surface-bright text-on-surface transition-colors font-label-md text-label-md flex items-center gap-space-xs shadow-sm cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">rotate_left</span>
            <span>Reset ke Default</span>
          </button>

          {/* Save Button */}
          <button
            type="button"
            id="btn-save"
            onClick={onSave}
            disabled={isSaving}
            className={`relative px-space-md py-space-sm rounded-lg font-label-md text-label-md font-bold transition-all shadow-md flex items-center gap-space-xs cursor-pointer ${
              saveSuccess
                ? 'bg-tertiary-container text-on-tertiary-container'
                : 'bg-primary hover:bg-primary-container text-on-primary-container'
            }`}
          >
            {isSaving ? (
              <>
                <span className="material-symbols-outlined text-[18px] animate-spin">refresh</span>
                <span>Menyimpan...</span>
              </>
            ) : saveSuccess ? (
              <>
                <span className="material-symbols-outlined text-[18px]">done</span>
                <span>Tersimpan!</span>
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[18px]">save</span>
                <span>Simpan Perubahan</span>
                {unsavedCount > 0 && (
                  <span className="ml-1 px-space-xs py-0.5 rounded bg-error-container text-on-error-container text-[11px] font-bold tracking-tight">
                    {unsavedCount} Belum Disimpan
                  </span>
                )}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
