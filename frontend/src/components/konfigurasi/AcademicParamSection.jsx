import React from 'react';

export default function AcademicParamSection({ config, onChange }) {
  return (
    <section
      id="sec-akademik"
      className="bg-surface-container-low rounded-xl p-space-lg shadow-sm flex flex-col gap-space-lg"
    >
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-space-sm">
          <div className="w-10 h-10 rounded-lg bg-primary-container/20 text-primary flex items-center justify-center">
            <span className="material-symbols-outlined text-[24px]">calendar_month</span>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-space-xs flex-wrap">
              <h3 className="font-title-lg text-title-lg text-on-surface">
                3. Parameter Akademik &amp; Enrollment
              </h3>
              <span className="px-space-xs py-0.5 rounded bg-surface-container-highest text-outline font-caption text-caption">
                BR-002, BR-004
              </span>
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              Konfigurasi siklus semester berjalan, cetak biru jumlah pertemuan, dan tata kelola pendaftaran kelas.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md">
        {/* Tahun Akademik & Semester Aktif */}
        <div className="flex flex-col gap-space-sm p-space-md rounded-lg bg-surface-container">
          <label className="font-label-md text-label-md text-on-surface font-semibold">
            Tahun Akademik &amp; Semester Aktif
          </label>
          <div className="grid grid-cols-2 gap-space-sm">
            <div className="flex flex-col gap-1">
              <span className="font-caption text-caption text-outline">Tahun Berjalan</span>
              <input
                type="text"
                value={config.academicYear}
                onChange={(e) => onChange('academicYear', e.target.value)}
                className="bg-surface-container-lowest font-body-md text-body-md text-on-surface px-space-md py-space-sm rounded-lg focus:outline-none focus:ring-1 focus:ring-primary font-bold"
              />
            </div>
            <div className="flex flex-col gap-1">
              <span className="font-caption text-caption text-outline">Semester</span>
              <div className="flex items-center gap-space-sm h-full">
                <label className="flex items-center gap-1 cursor-pointer font-label-sm text-label-sm text-on-surface select-none">
                  <input
                    type="radio"
                    name="semester"
                    value="ganjil"
                    checked={config.semester === 'ganjil'}
                    onChange={() => onChange('semester', 'ganjil')}
                    className="accent-primary cursor-pointer"
                  />
                  <span>Ganjil</span>
                </label>
                <label className="flex items-center gap-1 cursor-pointer font-label-sm text-label-sm text-on-surface-variant select-none">
                  <input
                    type="radio"
                    name="semester"
                    value="genap"
                    checked={config.semester === 'genap'}
                    onChange={() => onChange('semester', 'genap')}
                    className="accent-primary cursor-pointer"
                  />
                  <span>Genap</span>
                </label>
              </div>
            </div>
          </div>
          <span className="font-caption text-caption text-outline mt-1">
            Perubahan semester akan mempengaruhi visibilitas dasbor mahasiswa dan pembukaan kelas daring aktif.
          </span>
        </div>

        {/* Struktur Siklus Pertemuan Terkunci */}
        <div className="flex flex-col justify-between p-space-md rounded-lg bg-surface-container">
          <div>
            <div className="flex items-center justify-between">
              <label className="font-label-md text-label-md text-on-surface font-semibold">
                Struktur Siklus Pertemuan Baku
              </label>
              <span className="material-symbols-outlined text-outline text-[18px]">lock</span>
            </div>
            <div className="mt-2 flex items-center gap-space-sm">
              <div className="px-space-md py-space-xs rounded-lg bg-surface-container-highest text-on-surface font-title-md text-title-md font-bold">
                16 Pertemuan Baku
              </div>
              <span className="font-label-sm text-label-sm text-tertiary font-semibold">
                (P-1 s.d. P-16)
              </span>
            </div>
            <p className="font-caption text-caption text-outline mt-2 leading-relaxed">
              Terkunci permanen sesuai regulasi SN-Dikti &amp; BR-004: 14 Pertemuan Pembelajaran, 1 UTS (Pertemuan 8), dan 1 UAS (Pertemuan 16).
            </p>
          </div>
          <div className="pt-space-xs flex items-center gap-1 text-outline font-caption text-caption">
            <span className="material-symbols-outlined text-[14px]">info</span>
            <span>Parameter Sistem Statis</span>
          </div>
        </div>
      </div>

      {/* Direct Enrollment Setting */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-md p-space-md rounded-lg bg-surface-container">
        <div className="flex flex-col max-w-2xl">
          <div className="flex items-center gap-space-xs">
            <span className="font-label-md text-label-md text-on-surface font-semibold">
              Direct Enrollment Eksklusif Admin
            </span>
            <span className="px-space-xs py-0.5 rounded bg-tertiary-container/20 text-tertiary font-caption text-caption font-semibold">
              BR-002
            </span>
          </div>
          <p className="font-caption text-caption text-on-surface-variant mt-1 leading-relaxed">
            SPADA UPGRIS beroperasi sebagai Standalone LMS berbasis penugasan langsung. Pengisian KRS mahasiswa dan approval Dosen PA dinonaktifkan secara otomatis. Semua mahasiswa ditempatkan ke kelas oleh Administrator via impor CSV/API.
          </p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer shrink-0">
          <input
            type="checkbox"
            checked={config.directEnrollment}
            onChange={(e) => onChange('directEnrollment', e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-surface-container-highest peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary" />
        </label>
      </div>
    </section>
  );
}
