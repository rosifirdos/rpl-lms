import React from 'react';

export default function FloatingSaveNotice({ onCancel, onApply, isSaving }) {
  return (
    <div className="p-space-md rounded-xl bg-surface-container flex flex-col sm:flex-row items-center justify-between gap-space-md shadow-md">
      <div className="flex items-center gap-space-sm">
        <div className="w-8 h-8 rounded-full bg-secondary-container/20 text-secondary flex items-center justify-center shrink-0">
          <span className="material-symbols-outlined text-[20px]">sync_saved_locally</span>
        </div>
        <div className="flex flex-col">
          <span className="font-label-md text-label-md text-on-surface font-semibold">
            Dampak Kebijakan Global
          </span>
          <span className="font-caption text-caption text-on-surface-variant">
            Perubahan konfigurasi akan langsung berdampak pada seluruh sesi perkuliahan aktif dan dicatat ke dalam Jejak Audit (BR-015).
          </span>
        </div>
      </div>
      <div className="flex items-center gap-space-sm shrink-0">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSaving}
          className="px-space-md py-space-sm rounded-lg bg-surface-container-high hover:bg-surface-bright text-on-surface-variant hover:text-on-surface font-label-md text-label-md transition-colors cursor-pointer"
        >
          Batal
        </button>
        <button
          type="button"
          onClick={onApply}
          disabled={isSaving}
          className="px-space-md py-space-sm rounded-lg bg-primary hover:bg-primary-container text-on-primary-container font-label-md text-label-md font-bold transition-all shadow-sm flex items-center gap-1 cursor-pointer"
        >
          {isSaving ? (
            <>
              <span className="material-symbols-outlined text-[16px] animate-spin">refresh</span>
              <span>Menerapkan...</span>
            </>
          ) : (
            <span>Terapkan Sekarang</span>
          )}
        </button>
      </div>
    </div>
  );
}
