import { useState, useEffect } from 'react';
import { navSections } from '../features/shell/fixtures';

function NavItem({ item, isActive, onClick }) {
  const baseClass = 'flex items-center gap-space-sm px-space-md py-space-sm rounded-lg transition-colors font-label-md text-label-md';
  const activeClass = 'bg-primary-container text-on-primary-container font-bold shadow-md';
  const inactiveClass = 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface';
  return (
    <a
      href={`#${item.path}`}
      onClick={(e) => {
        e.preventDefault();
        onClick(item.path);
      }}
      className={`${baseClass} ${isActive ? activeClass : inactiveClass}`}
    >
      <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
      <span>{item.label}</span>
    </a>
  );
}

function Sidebar({ isOpen, activeRole = 'mahasiswa', onRoleChange, activeNavPath, onNavChange }) {
  const getDefaultPath = (role) => {
    if (role === 'dosen') return 'dasbor-dosen';
    if (role === 'admin') return 'manajemen-pengguna';
    return 'dasbor-mahasiswa';
  };

  const [internalPath, setInternalPath] = useState(() => activeNavPath || getDefaultPath(activeRole));

  // Sync with activeRole and external activeNavPath
  useEffect(() => {
    if (activeNavPath) {
      setInternalPath(activeNavPath);
    } else {
      setInternalPath(getDefaultPath(activeRole));
    }
  }, [activeRole, activeNavPath]);

  const asideClass = `fixed top-16 left-0 bottom-0 w-64 bg-surface-container-low z-40 flex flex-col border-r border-outline-variant/20 transition-transform duration-300 ${
    isOpen ? 'translate-x-0' : '-translate-x-full'
  }`;

  const handleNavClick = (path) => {
    setInternalPath(path);
    if (onNavChange) {
      onNavChange(path);
    }
    // Sinkronisasi peran bila navigasi menuju dasbor terdedikasi
    if (path === 'dasbor-dosen' && activeRole !== 'dosen') {
      onRoleChange && onRoleChange('dosen');
    } else if (path === 'dasbor-mahasiswa' && activeRole !== 'mahasiswa') {
      onRoleChange && onRoleChange('mahasiswa');
    } else if (
      (path === 'direct-enrollment' ||
        path === 'manajemen-pengguna' ||
        path === 'master-mata-kuliah' ||
        path === 'pembukaan-kelas' ||
        path === 'jejak-audit' ||
        path === 'konfigurasi-sistem') &&
      activeRole !== 'admin'
    ) {
      onRoleChange && onRoleChange('admin');
    }
  };

  // STRICT RBAC FILTERING: Memastikan mahasiswa tidak melihat menu admin/dosen dan sebaliknya
  const getVisibleSections = () => {
    return navSections.filter((section) => {
      if (activeRole === 'mahasiswa') {
        return section.role === 'mahasiswa' || section.role === 'shared';
      }
      if (activeRole === 'dosen') {
        return section.role === 'dosen' || section.role === 'shared';
      }
      if (activeRole === 'admin') {
        return section.role === 'admin';
      }
      return false;
    });
  };

  const visibleSections = getVisibleSections();

  return (
    <aside className={asideClass}>
      {/* Brand Sub-header */}
      <div className="px-space-md py-space-sm bg-surface-container-lowest/50 border-b border-outline-variant/20 flex flex-col gap-0.5">
        <div className="flex items-center gap-space-xs">
          <span className="material-symbols-outlined text-primary text-[18px]">security</span>
          <span className="font-label-md text-label-md text-on-surface font-bold capitalize">
            Akses: {activeRole}
          </span>
        </div>
        <span className="font-caption text-[11px] text-outline uppercase tracking-wider">
          SPADA UPGRIS &bull; RBAC Mode
        </span>
      </div>

      <nav className="flex-1 overflow-y-auto py-space-sm px-space-sm flex flex-col gap-space-xs">
        {visibleSections.map((section) => (
          <div key={section.title}>
            <div className="px-space-sm pt-space-sm pb-space-xs font-caption text-caption text-outline uppercase tracking-wider font-semibold">
              {section.title}
            </div>
            {section.items.map((item) => (
              <NavItem
                key={item.path}
                item={item}
                isActive={internalPath === item.path}
                onClick={handleNavClick}
              />
            ))}
          </div>
        ))}
      </nav>

      <div className="p-space-md bg-surface-container-lowest/80 flex flex-col gap-space-sm border-t border-outline-variant/20">
        <div className="text-center font-caption text-caption text-outline">
          SPADA UPGRIS v2.4 &bull; Standalone LMS
        </div>
        <a
          href="https://upt-ptik.upgris.ac.id"
          target="_blank"
          rel="noopener noreferrer"
          className="w-full flex items-center justify-center gap-space-xs py-space-xs rounded-lg bg-surface-container-high hover:bg-surface-bright text-secondary hover:text-on-surface transition-colors font-label-sm text-label-sm"
        >
          <span className="material-symbols-outlined text-[16px]">support_agent</span>
          <span>IT Helpdesk PTIK</span>
        </a>
      </div>
    </aside>
  );
}

export default Sidebar;
