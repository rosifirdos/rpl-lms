import React from 'react';

export default function AttendancePolicySection({ config, onChange }) {
  const handleThresholdChange = (val) => {
    const num = Math.max(50, Math.min(100, Number(val) || 50));
    onChange('attendanceThreshold', num);
  };

  return (
    <section
      id="sec-presensi"
      className="bg-surface-container-low rounded-xl p-space-lg shadow-sm flex flex-col gap-space-lg"
    >
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-space-sm">
          <div className="w-10 h-10 rounded-lg bg-secondary-container/20 text-secondary flex items-center justify-center">
            <span className="material-symbols-outlined text-[24px]">fact_check</span>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-space-xs flex-wrap">
              <h3 className="font-title-lg text-title-lg text-on-surface">
                2. Kebijakan Presensi &amp; Ambang Batas Ujian
              </h3>
              <span className="px-space-xs py-0.5 rounded bg-surface-container-highest text-outline font-caption text-caption">
                BR-010, BR-011, BR-012, FR-050
              </span>
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              Konfigurasi syarat kelayakan mahasiswa dalam mengikuti evaluasi tengah semester dan akhir semester.
            </p>
          </div>
        </div>
      </div>

      {/* Ambang Batas Meter Box */}
      <div className="flex flex-col gap-space-md bg-surface-container p-space-md rounded-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm">
          <div>
            <label className="font-label-md text-label-md text-on-surface font-semibold flex items-center gap-1">
              Ambang Batas Minimum Kehadiran Evaluasi (UTS &amp; UAS)
            </label>
            <p className="font-caption text-caption text-on-surface-variant mt-0.5">
              Mahasiswa dengan persentase kehadiran di bawah ambang ini terkunci otomatis saat mengakses ruang ujian UTS (P-8) dan UAS (P-16).
            </p>
          </div>
          <div className="flex items-center gap-2 bg-surface-container-lowest px-4 py-2 rounded-lg shrink-0">
            <input
              type="number"
              id="threshold-val"
              min="50"
              max="100"
              value={config.attendanceThreshold}
              onChange={(e) => handleThresholdChange(e.target.value)}
              className="w-12 text-center bg-transparent font-title-lg text-title-lg font-bold text-secondary focus:outline-none"
            />
            <span className="font-title-md text-title-md text-secondary font-bold">%</span>
          </div>
        </div>

        {/* Visual Bar Indicator */}
        <div className="flex flex-col gap-1.5">
          <div className="w-full bg-surface-container-highest h-3 rounded-full overflow-hidden flex relative">
            <div className="bg-error h-full" style={{ width: '50%' }} title="Diskualifikasi < 50%" />
            <div className="bg-amber-400 h-full" style={{ width: '20%' }} title="Peringatan 50%-70%" />
            <div className="bg-tertiary h-full" style={{ width: '30%' }} title="Memenuhi Syarat >= 70%" />
            {/* Dynamic Pointer Indicator based on state */}
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-white shadow-lg transition-all duration-200"
              style={{ left: `${Math.max(0, Math.min(100, config.attendanceThreshold))}%` }}
              title={`Ambang: ${config.attendanceThreshold}%`}
            />
          </div>

          <div className="flex justify-between font-caption text-caption text-outline">
            <span>0% (Terblokir Total)</span>
            <span className="text-error font-semibold">50% Batas Kritis</span>
            <span className="text-tertiary font-bold">{config.attendanceThreshold}% Ambang Berlaku</span>
            <span>100% Sempurna</span>
          </div>
        </div>

        {/* Academic Regulation Box */}
        <div className="p-space-sm rounded-lg bg-surface-container-high flex items-center gap-space-sm">
          <span className="material-symbols-outlined text-secondary text-[20px] shrink-0">gavel</span>
          <p className="font-caption text-caption text-on-surface-variant leading-relaxed">
            <strong className="text-on-surface">Regulasi Akademik UPGRIS BR-012:</strong> Mahasiswa wajib memenuhi minimal {config.attendanceThreshold}% kehadiran ({Math.round(16 * (config.attendanceThreshold / 100))} dari 16 pertemuan) agar ruang pengerjaan UTS dan UAS terbuka.
          </p>
        </div>
      </div>

      {/* Toleransi Presensi & Hak Koreksi */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md">
        {/* Dropdown Setting */}
        <div className="flex flex-col justify-between gap-space-sm p-space-md rounded-lg bg-surface-container">
          <div className="flex flex-col">
            <label className="font-label-md text-label-md text-on-surface font-semibold">
              Toleransi Waktu Presensi Mahasiswa
            </label>
            <p className="font-caption text-caption text-on-surface-variant mt-1">
              Jeda waktu diperbolehkan melakukan presensi mandiri terhitung sejak jadwal sesi kuliah dimulai.
            </p>
          </div>
          <div className="flex items-center gap-space-sm mt-space-sm">
            <select
              value={config.attendanceTolerance}
              onChange={(e) => onChange('attendanceTolerance', e.target.value)}
              className="w-full bg-surface-container-lowest font-body-md text-body-md text-on-surface px-space-md py-space-sm rounded-lg focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
            >
              <option value="10">10 Menit Sejak Kuliah Dibuka</option>
              <option value="15">15 Menit (Standar Universitas)</option>
              <option value="30">30 Menit (Toleransi Panjang)</option>
              <option value="fleksibel">Fleksibel (Sepanjang Sesi Terbuka)</option>
            </select>
          </div>
          <label className="flex items-center gap-2 mt-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={config.autoCloseAttendance}
              onChange={(e) => onChange('autoCloseAttendance', e.target.checked)}
              className="accent-primary w-4 h-4 rounded cursor-pointer"
            />
            <span className="font-caption text-caption text-on-surface">
              Tutup Sesi Otomatis Saat Toleransi Berakhir
            </span>
          </label>
        </div>

        {/* Hak Koreksi Presensi */}
        <div className="flex flex-col justify-between p-space-md rounded-lg bg-surface-container">
          <div className="flex items-start gap-space-sm">
            <div className="w-8 h-8 rounded-lg bg-tertiary-container/20 text-tertiary flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[18px]">edit_note</span>
            </div>
            <div className="flex flex-col">
              <span className="font-label-md text-label-md text-on-surface font-semibold">
                Kewenangan Koreksi Dosen
              </span>
              <p className="font-caption text-caption text-on-surface-variant mt-1">
                Dosen Pengampu berhak melakukan koreksi kehadiran dengan kewajiban mencantumkan catatan keterangan perizinan resmi (Sakit/Izin/Dispensasi).
              </p>
            </div>
          </div>
          <div className="mt-space-md flex items-center justify-between pt-space-xs text-outline font-caption text-caption">
            <span className="text-tertiary font-semibold">Kepatuhan FR-039 &amp; BR-011</span>
            <span className="px-2 py-0.5 rounded bg-surface-container-high text-on-surface">
              Audit Otomatis
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
