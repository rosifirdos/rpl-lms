function Header({ onToggleSidebar, activeRole = 'mahasiswa', onRoleChange }) {
  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-surface-container/90 backdrop-blur-xl z-50 shadow-[0_1px_8px_rgba(0,0,0,0.3)]">
      <div className="w-full h-16 px-gutter flex items-center justify-between gap-space-md">
        {/* Left: Menu + Logo */}
        <div className="flex items-center gap-space-md">
          <button
            aria-label="Toggle Sidebar"
            className="p-space-xs rounded text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors"
            type="button"
            onClick={onToggleSidebar}
          >
            <span className="material-symbols-outlined text-[24px]">menu</span>
          </button>
          <div className="flex items-center gap-space-sm">
            <div className="w-10 h-10 rounded-lg bg-primary-container flex items-center justify-center text-on-primary-container">
              <span className="material-symbols-outlined text-[24px]">school</span>
            </div>
            <div className="flex flex-col">
              <span className="font-title-md text-title-md text-on-surface tracking-tight leading-tight">SPADA UPGRIS</span>
              <span className="font-caption text-caption text-on-surface-variant leading-none">Sistem Pembelajaran Daring</span>
            </div>
          </div>

          {/* Global Search */}
          <div className="hidden md:flex items-center gap-space-xs bg-surface-container-high rounded-lg px-space-sm py-1.5 w-72 border border-outline-variant/30 hover:border-outline-variant transition-colors">
            <span className="material-symbols-outlined text-[18px] text-on-surface-variant">search</span>
            <input
              aria-label="Cari Materi, Tugas, atau Kelas"
              className="bg-transparent text-body-md font-body-md text-on-surface placeholder:text-on-surface-variant outline-none flex-1 min-w-0"
              placeholder="Cari materi, tugas, atau kelas..."
              readOnly
              type="search"
            />
            <span className="font-caption text-caption text-outline bg-surface-container-highest px-1.5 py-0.5 rounded border border-outline-variant/40 hidden lg:block">
              Ctrl K
            </span>
          </div>
        </div>

        {/* Right: Role Switcher + Notifications + Profile */}
        <div className="flex items-center gap-space-sm">
          {/* Role Switcher Pill */}
          <div className="hidden sm:flex items-center bg-surface-container-low p-space-xs rounded-lg gap-space-xs border border-outline-variant/30">
            <button
              type="button"
              onClick={() => onRoleChange && onRoleChange('mahasiswa')}
              className={`px-space-sm py-space-xs rounded font-label-sm text-label-sm transition-colors ${
                activeRole === 'mahasiswa'
                  ? 'bg-primary-container text-on-primary-container font-bold shadow-sm'
                  : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'
              }`}
            >
              Mahasiswa
            </button>
            <button
              type="button"
              onClick={() => onRoleChange && onRoleChange('dosen')}
              className={`px-space-sm py-space-xs rounded font-label-sm text-label-sm transition-colors ${
                activeRole === 'dosen'
                  ? 'bg-primary-container text-on-primary-container font-bold shadow-sm'
                  : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'
              }`}
            >
              Dosen
            </button>
            <button
              type="button"
              onClick={() => onRoleChange && onRoleChange('admin')}
              className={`px-space-sm py-space-xs rounded font-label-sm text-label-sm transition-colors ${
                activeRole === 'admin'
                  ? 'bg-primary-container text-on-primary-container font-bold shadow-sm'
                  : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'
              }`}
            >
              Admin
            </button>
          </div>

          <button
            aria-label="Notifikasi"
            className="relative p-space-xs rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors"
            type="button"
          >
            <span className="material-symbols-outlined text-[22px]">notifications</span>
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-error border-2 border-surface-container" />
          </button>
          <button
            aria-label="Kalender"
            className="p-space-xs rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors hidden sm:flex"
            type="button"
          >
            <span className="material-symbols-outlined text-[22px]">calendar_today</span>
          </button>

          {/* Profile */}
          <button
            className="flex items-center gap-space-sm pl-space-sm border-l border-outline-variant/40 hover:bg-surface-container-high rounded-lg py-1 pr-space-xs transition-colors"
            type="button"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-on-primary font-bold text-sm">
              AF
            </div>
            <div className="hidden md:flex flex-col text-left">
              <span className="font-label-md text-label-md text-on-surface leading-tight">Ahmad Fauzi</span>
              <span className="font-caption text-caption text-on-surface-variant leading-none">Mahasiswa</span>
            </div>
            <span className="material-symbols-outlined text-[18px] text-on-surface-variant hidden md:block">expand_more</span>
          </button>
        </div>
      </div>
    </header>
  );
}

export default Header;
