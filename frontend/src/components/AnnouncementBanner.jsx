function AnnouncementBanner() {
  return (
    <section
      aria-label="Informasi Akademik Penting"
      className="relative overflow-hidden rounded-xl bg-gradient-to-br from-surface-container-high via-surface-container to-surface-container-low p-space-lg shadow-xl mb-space-lg"
    >
      <div className="flex flex-col md:flex-row items-start gap-space-md relative z-10">
        {/* Icon */}
        <div className="w-12 h-12 rounded-xl bg-secondary-container/20 flex items-center justify-center text-secondary flex-shrink-0 shadow-inner">
          <span className="material-symbols-outlined text-[28px]">campaign</span>
        </div>

        <div className="flex-1 flex flex-col gap-space-xs">
          {/* Badge & Date */}
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-caption font-bold bg-secondary/10 text-secondary uppercase tracking-wider">
              Pemberitahuan Resmi
            </span>
            <span className="font-caption text-caption text-outline">Diterbitkan 10 Okt 2026</span>
          </div>

          {/* Title */}
          <h3 className="font-title-lg text-title-lg text-on-surface font-bold tracking-tight">
            Pengumuman Jadwal Operasional &amp; Central Timeline Pembelajaran
          </h3>

          {/* Body */}
          <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed text-justify md:text-left">
            Periode perkuliahan aktif Semester Ganjil 2026/2027 sedang berlangsung. Batas akhir
            pengumpulan{' '}
            <strong className="text-on-surface">Tugas 02</strong> dan persiapan Ujian Tengah
            Semester (UTS - Pertemuan 8) wajib dipantau melalui Central Timeline. Seluruh
            penyerahan berkas tugas diverifikasi dengan format{' '}
            <code className="px-1.5 py-0.5 rounded bg-surface-container-lowest text-secondary font-mono text-xs font-semibold">
              .pdf, .docx, .xlsx, .zip
            </code>{' '}
            maksimal 10MB.
          </p>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-space-sm pt-space-xs mt-1">
            <a
              href="#"
              className="inline-flex items-center gap-1.5 px-space-md py-2 rounded-lg bg-primary hover:bg-primary-fixed-dim text-on-primary font-label-md text-label-md font-bold transition-all shadow-md"
            >
              <span className="material-symbols-outlined text-[18px]">calendar_month</span>
              <span>Lihat Central Timeline Lengkap</span>
            </a>
            <a
              href="#"
              className="inline-flex items-center gap-1.5 px-space-md py-2 rounded-lg bg-surface-container-high hover:bg-surface-bright text-on-surface font-label-md text-label-md font-medium transition-colors"
            >
              <span className="material-symbols-outlined text-[18px] text-secondary">download</span>
              <span>Unduh Panduan Mahasiswa (PDF)</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

export default AnnouncementBanner;
