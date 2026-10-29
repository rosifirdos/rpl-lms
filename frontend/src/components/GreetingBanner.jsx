import { useAuthStore } from '../stores/authStore';
import { userFixtures } from '../features/shell/fixtures';

function GreetingBanner() {
  const storeUser = useAuthStore((s) => s.user);
  const fallback = userFixtures.mahasiswa;

  const displayName = storeUser?.name || fallback.name;
  const displayIdentifier = storeUser?.identifier || fallback.identifier;

  return (
    <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-surface-container-high via-surface-container to-surface-container-low p-space-lg shadow-xl mb-space-lg border border-outline-variant/20">
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
              {displayName}!
            </span>
          </h1>

          {/* Meta Info */}
          <div className="flex flex-wrap items-center gap-x-space-md gap-y-1 text-on-surface-variant font-body-md text-body-md">
            <span className="flex items-center gap-1 text-on-surface font-semibold">
              <span className="material-symbols-outlined text-[18px] text-secondary">badge</span>
              {displayIdentifier}
            </span>
            <span className="text-outline">&bull;</span>
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-[18px] text-outline">school</span>
              Semester Ganjil 2026/2027
            </span>
            <span className="text-outline">&bull;</span>
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-[18px] text-tertiary">pace</span>
              Status:{' '}
              <span className="text-on-surface font-mono font-medium">Aktif Enrolled</span>
            </span>
          </div>
        </div>

        {/* Academic Date Capsule */}
        <div className="flex items-center gap-space-md bg-surface-container-lowest/70 backdrop-blur-md px-space-md py-space-sm rounded-lg self-start lg:self-center shadow-sm border border-outline-variant/30">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
            <span className="material-symbols-outlined text-[22px]">calendar_month</span>
          </div>
          <div className="flex flex-col text-left">
            <span className="font-label-md text-label-md text-on-surface font-semibold">
              Minggu Perkuliahan ke-4
            </span>
            <span className="font-caption text-caption text-on-surface-variant">
              Tahun Ajaran 2026/2027
            </span>
          </div>
        </div>
      </div>

      {/* Decorative Glow Elements */}
      <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-primary-container/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -left-10 -top-10 w-48 h-48 bg-secondary-container/20 rounded-full blur-2xl pointer-events-none" />
    </div>
  );
}

export default GreetingBanner;
