import { useState } from 'react';

function AttendanceWidget() {
  const [attended, setAttended] = useState(false);

  const btnClass = attended
    ? 'mt-1 w-full py-1.5 rounded-lg font-label-sm text-label-sm font-bold transition-colors flex items-center justify-center gap-1 shadow-sm bg-surface-container-highest text-tertiary border border-tertiary/40 cursor-not-allowed'
    : 'mt-1 w-full py-1.5 rounded-lg font-label-sm text-label-sm font-bold transition-colors flex items-center justify-center gap-1 shadow-sm bg-tertiary text-on-tertiary hover:bg-tertiary-fixed';

  return (
    <div className="rounded-xl bg-surface-container p-space-md shadow-md flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between pb-space-sm mb-space-sm">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-tertiary text-[22px]">how_to_reg</span>
            <h3 className="font-title-md text-title-md text-on-surface font-bold">
              Presensi Kuliah Hari Ini
            </h3>
          </div>
          <span className="font-caption text-caption text-tertiary font-bold">1 Aktif</span>
        </div>

        <div className="flex flex-col gap-space-sm">
          <div className="p-space-sm rounded-lg bg-surface-container-low flex flex-col gap-space-xs">
            <div className="flex items-start justify-between gap-1">
              <div>
                <span className="font-label-md text-label-md text-on-surface font-bold block">
                  Rekayasa Perangkat Lunak
                </span>
                <span className="font-caption text-caption text-on-surface-variant">
                  Ruang Lab Komputasi 3 &amp; Hybrid
                </span>
              </div>
              <span className="px-2 py-0.5 rounded text-caption font-bold bg-tertiary-container text-on-tertiary-container">
                BUKA
              </span>
            </div>
            <div className="flex items-center justify-between text-caption font-caption text-outline pt-1">
              <span>08:00 - 10:30 WIB</span>
              <span className="text-tertiary font-medium">Validasi Geo-Lock OK</span>
            </div>
            <button
              type="button"
              onClick={() => setAttended(!attended)}
              className={btnClass}
              disabled={attended}
            >
              <span className="material-symbols-outlined text-[16px]">
                {attended ? 'check_circle' : 'touch_app'}
              </span>
              <span>{attended ? 'Presensi Tercatat!' : 'Klik Presensi Kehadiran'}</span>
            </button>
          </div>

          <div className="p-space-sm rounded-lg bg-surface-container-low/60 flex items-center justify-between text-on-surface-variant">
            <div>
              <span className="font-label-sm text-label-sm text-on-surface block font-medium">
                Basis Data Terdistribusi
              </span>
              <span className="font-caption text-caption text-outline">13:00 - 15:30 WIB</span>
            </div>
            <span className="font-caption text-caption text-outline bg-surface-container-high px-2 py-0.5 rounded">
              Belum Dibuka
            </span>
          </div>
        </div>
      </div>

      <div className="pt-space-sm mt-space-xs flex items-center justify-between font-caption text-caption text-outline">
        <span>
          Tingkat Presensi:{' '}
          <strong className="text-on-surface font-mono">100%</strong>
        </span>
        <a href="#" className="text-secondary hover:underline">
          Riwayat Lengkap
        </a>
      </div>
    </div>
  );
}

export default AttendanceWidget;