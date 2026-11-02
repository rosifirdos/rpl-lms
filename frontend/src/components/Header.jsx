import { useState, useEffect, useRef } from 'react';
import { useAuthStore } from '../stores/authStore';
import { userFixtures } from '../features/shell/fixtures';

function Header({
  onToggleSidebar,
  activeRole = 'mahasiswa',
  onRoleChange,
  onOpenChangePassword,
  onLogout,
}) {
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [serverTime, setServerTime] = useState('08:30 WIB');
  const profileMenuRef = useRef(null);
  const searchInputRef = useRef(null);

  // Dynamic server time clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      setServerTime(`${hours}:${minutes} WIB`);
    };
    updateTime();
    const timer = setInterval(updateTime, 30000);
    return () => clearInterval(timer);
  }, []);

  // Keyboard shortcut Ctrl+K / Cmd+K and Escape
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
      if (e.key === 'Escape') {
        setProfileDropdownOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target)) {
        setProfileDropdownOpen(false);
      }
    };
    window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, []);

  // Determine user identity from store or unified fixture
  const storeUser = useAuthStore((s) => s.user);
  const fixture = userFixtures[activeRole] || userFixtures.mahasiswa;

  const userName = storeUser?.name || fixture.name;
  const userSub = storeUser?.identifier
    ? `${storeUser.identifier} • ${storeUser.role}`
    : `${fixture.identifier} • ${fixture.sub}`;
  const userInitials = storeUser?.name
    ? storeUser.name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()
    : fixture.initials;

  const handleLogoutClick = (e) => {
    e.preventDefault();
    setProfileDropdownOpen(false);
    if (onLogout) {
      onLogout();
    }
  };

  const handleChangePasswordClick = (e) => {
    e.preventDefault();
    setProfileDropdownOpen(false);
    if (onOpenChangePassword) {
      onOpenChangePassword();
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-surface-container/90 backdrop-blur-xl z-50 shadow-[0_1px_8px_rgba(0,0,0,0.3)]">
      <div className="w-full h-16 px-gutter flex items-center justify-between gap-space-sm sm:gap-space-md">
        {/* Left: Menu + Logo + Semester Badge + Search */}
        <div className="flex items-center gap-space-xs sm:gap-space-md min-w-0">
          <button
            aria-label="Toggle Sidebar"
            className="p-space-xs rounded text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors shrink-0"
            type="button"
            onClick={onToggleSidebar}
          >
            <span className="material-symbols-outlined text-[24px]">menu</span>
          </button>
          <div className="flex items-center gap-space-sm shrink-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-primary-container flex items-center justify-center text-on-primary-container shrink-0">
              <span className="material-symbols-outlined text-[22px] sm:text-[24px]">school</span>
            </div>
            <div className="hidden sm:flex flex-col">
              <span className="font-title-md text-title-md text-on-surface tracking-tight leading-tight font-bold">
                SPADA UPGRIS
              </span>
              <span className="font-caption text-caption text-on-surface-variant leading-none hidden md:block">
                Sistem Pembelajaran Daring
              </span>
            </div>
          </div>

          {/* Semester Badge */}
          <div className="hidden 2xl:flex items-center gap-space-xs px-space-sm py-space-xs rounded-full bg-tertiary-container/20 text-tertiary font-label-sm text-label-sm shrink-0">
            <span className="material-symbols-outlined text-[14px]">circle</span>
            <span>Semester Ganjil 2026/2027</span>
          </div>

          {/* Global Search */}
          <div className="hidden md:flex items-center gap-space-xs bg-surface-container-high rounded-lg px-space-sm py-1.5 w-48 lg:w-64 border border-outline-variant/30 hover:border-outline-variant focus-within:border-primary transition-colors">
            <span className="material-symbols-outlined text-[18px] text-on-surface-variant">search</span>
            <input
              ref={searchInputRef}
              aria-label="Cari Mata Kuliah, Materi, atau Tugas"
              className="bg-transparent text-body-md font-body-md text-on-surface placeholder:text-on-surface-variant outline-none flex-1 min-w-0"
              placeholder="Cari kelas, tugas..."
              type="search"
            />
            <span className="font-caption text-caption text-outline bg-surface-container-highest px-1.5 py-0.5 rounded border border-outline-variant/40 hidden lg:block select-none">
              Ctrl K
            </span>
          </div>
        </div>

        {/* Right: Server Time + Role Switcher + Notifications + Profile */}
        <div className="flex items-center gap-space-xs sm:gap-space-sm shrink-0">
          <div className="hidden xl:flex items-center gap-space-xs text-on-surface-variant font-label-sm text-label-sm mr-1">
            <span className="material-symbols-outlined text-[16px]">schedule</span>
            <span>Server: {serverTime}</span>
          </div>

          {/* Role Switcher Pill */}
          <div
            role="tablist"
            aria-label="Pemilih Peran Pengguna"
            className="flex items-center bg-surface-container-low p-0.5 sm:p-space-xs rounded-lg gap-0.5 sm:gap-space-xs border border-outline-variant/30"
          >
            <button
              type="button"
              role="tab"
              aria-selected={activeRole === 'mahasiswa'}
              onClick={() => onRoleChange && onRoleChange('mahasiswa')}
              className={`px-2 sm:px-space-sm py-1 sm:py-space-xs rounded font-label-sm text-[12px] sm:text-label-sm transition-colors ${
                activeRole === 'mahasiswa'
                  ? 'bg-primary-container text-on-primary-container font-bold shadow-sm'
                  : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'
              }`}
            >
              Mhs
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeRole === 'dosen'}
              onClick={() => onRoleChange && onRoleChange('dosen')}
              className={`px-2 sm:px-space-sm py-1 sm:py-space-xs rounded font-label-sm text-[12px] sm:text-label-sm transition-colors ${
                activeRole === 'dosen'
                  ? 'bg-primary-container text-on-primary-container font-bold shadow-sm'
                  : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'
              }`}
            >
              Dosen
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeRole === 'admin'}
              onClick={() => onRoleChange && onRoleChange('admin')}
              className={`px-2 sm:px-space-sm py-1 sm:py-space-xs rounded font-label-sm text-[12px] sm:text-label-sm transition-colors ${
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
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-error border-2 border-surface-container" />
          </button>

          {/* Profile with Interactive Dropdown */}
          <div className="relative" ref={profileMenuRef}>
            <button
              aria-haspopup="menu"
              aria-expanded={profileDropdownOpen}
              aria-label="Menu Profil Pengguna"
              className="flex items-center gap-space-xs sm:gap-space-sm pl-space-xs sm:pl-space-sm border-l border-outline-variant/40 hover:bg-surface-container-high rounded-lg py-1 pr-space-xs transition-colors"
              type="button"
              onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-on-primary font-bold text-xs sm:text-sm shadow-sm shrink-0">
                {userInitials}
              </div>
              <div className="hidden md:flex flex-col text-left max-w-[130px] lg:max-w-[180px] truncate">
                <span className="font-label-md text-label-md text-on-surface leading-tight truncate">
                  {userName}
                </span>
                <span className="font-caption text-caption text-on-surface-variant leading-none uppercase">
                  {activeRole}
                </span>
              </div>
              <span className="material-symbols-outlined text-[18px] text-on-surface-variant hidden md:block">
                expand_more
              </span>
            </button>

            {/* Profile Dropdown Card */}
            {profileDropdownOpen && (
              <div
                role="menu"
                aria-label="Opsi Akun Pengguna"
                className="absolute right-0 top-12 mt-space-xs w-64 rounded-xl bg-surface-container-lowest p-space-sm shadow-2xl z-50 border border-outline-variant/30 animate-fadeIn"
              >
                <div className="px-space-sm py-space-xs mb-space-xs rounded-lg bg-surface-container-low">
                  <p className="font-title-md text-title-md text-on-surface font-semibold truncate">{userName}</p>
                  <p className="font-caption text-caption text-secondary truncate">{userSub}</p>
                </div>
                <div className="flex flex-col gap-0.5">
                  <a
                    href="#profile"
                    role="menuitem"
                    onClick={(e) => { e.preventDefault(); setProfileDropdownOpen(false); }}
                    className="flex items-center gap-space-sm px-space-sm py-space-xs rounded text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface font-label-md text-label-md transition-colors"
                  >
                    <span className="material-symbols-outlined text-[18px]">badge</span>
                    <span>Profil Saya</span>
                  </a>
                  <button
                    type="button"
                    role="menuitem"
                    onClick={handleChangePasswordClick}
                    className="w-full flex items-center gap-space-sm px-space-sm py-space-xs rounded text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface font-label-md text-label-md transition-colors text-left"
                  >
                    <span className="material-symbols-outlined text-[18px]">key</span>
                    <span>Ganti Kata Sandi</span>
                  </button>
                  <a
                    href="#notifications"
                    role="menuitem"
                    onClick={(e) => { e.preventDefault(); setProfileDropdownOpen(false); }}
                    className="flex items-center gap-space-sm px-space-sm py-space-xs rounded text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface font-label-md text-label-md transition-colors"
                  >
                    <span className="material-symbols-outlined text-[18px]">tune</span>
                    <span>Preferensi Notifikasi</span>
                  </a>
                  <div className="h-px bg-surface-container-high my-space-xs" />
                  <button
                    type="button"
                    role="menuitem"
                    onClick={handleLogoutClick}
                    className="w-full flex items-center gap-space-sm px-space-sm py-space-xs rounded text-error hover:bg-error-container/20 font-label-md text-label-md transition-colors text-left font-semibold"
                  >
                    <span className="material-symbols-outlined text-[18px]">logout</span>
                    <span>Keluar Sesi</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
