function GreetingBanner() {
  return (
    <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-surface-container-high via-surface-container to-surface-container-low p-space-lg shadow-xl mb-space-lg">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-space-md relative z-10">
        <div className="flex flex-col gap-space-xs max-w-3xl">
          {/* Tags */}
          <div className="flex flex-wrap items-center gap-space-xs mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-primary-container/30 text-primary font-caption text-caption uppercase tracking-wider font-bold">
              Portal Mahasiswa Terpadu
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-tertiary-container/20 text-tertiary font-caption text-caption font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-tertiary animate-pulse" />
              Sinkronisasi Terpusat Aktif
            </span>
          </div>

          {/* Greeting */}
          <h1 className="font-display-hero text-display-hero text-on-surface tracking-tight">
            Selamat Datang,{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
              Ahmad Fauzi!
            </span>
          </h1>

          {/* Meta Info */}
          <div className="flex flex-wrap items-center gap-x-space-md gap-y-1 text-on-surface-variant font-body-md text-body-md">
            <span className="flex items-center gap-1 text-on-surface font-semibold">
              <span className="material-symbols-outlined text-[18px] text-secondary">badge</span>
              NIM: 24670001
            </span>
            <span className="text-outline">&bull;</span>
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-[18px] text-outline">school</span>
              Semester Ganjil 2026/2027
            </span>
            <span className="text-outline">&bull;</span>
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-[18px] text-tertiary">pace</span>
              Waktu Server:{' '}
              <span className="text-on-surface font-mono font-medium">08:30 WIB</span>
            </span>
          </div>
        </div>

        {/* Academic Date Capsule */}
        <div className="flex items-center gap-space-md bg-surface-container-lowest/70 backdrop-blur-md px-space-md py-space-sm rounded-lg self-start lg:self-center shadow-sm">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
            <span className="material-symbols-outlined text-[22px]">calendar_month</span>
          </div>
          <div className="flex flex-col text-left">
            <span className="font-caption text-caption text-outline uppercase tracking-wider">
              Kalender Akademik
            </span>
            <span className="font-title-md text-title-md text-on-surface font-bold">
              Senin, 13 Oktober 2026
            </span>
          </div>
        </div>
      </div>

      {/* Subtle Geometric Corner Accent SVG */}
      <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none">
        <svg fill="none" height="120" viewBox="0 0 240 120" width="240" xmlns="http://www.w3.org/2000/svg">
          <circle className="text-primary" cx="200" cy="120" r="100" stroke="currentColor" strokeWidth="2" />
          <circle className="text-secondary" cx="200" cy="120" r="60" stroke="currentColor" strokeWidth="2" />
          <path className="text-outline" d="M120 120L200 40" stroke="currentColor" strokeWidth="2" />
        </svg>
      </div>
    </div>
  );
}

export default GreetingBanner;
