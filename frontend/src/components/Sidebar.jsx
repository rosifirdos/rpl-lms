import { useState } from 'react';

const menuMahasiswa = [
  { icon: 'dashboard', label: 'Dasbor Mahasiswa', path: 'dasbor-mahasiswa', active: true },
  { icon: 'auto_stories', label: 'Mata Kuliah Saya', path: 'mata-kuliah-saya' },
  { icon: 'assignment', label: 'Sentral Penugasan', path: 'sentral-penugasan' },
  { icon: 'calendar_today', label: 'Central Timeline', path: 'central-timeline' },
  { icon: 'check_circle', label: 'Rekap Nilai & Presensi', path: 'rekap-nilai-dan-presensi' },
];

const menuDosen = [
  { icon: 'co_present', label: 'Kelas Diampu (Dasbor Dosen)', path: 'dasbor-dosen' },
  { icon: 'assignment_turned_in', label: 'Pemeriksaan Tugas', path: 'pemeriksaan-tugas' },
];

const menuAdmin = [
  { icon: 'group', label: 'Manajemen Pengguna', path: 'manajemen-pengguna' },
  { icon: 'local_library', label: 'Master Mata Kuliah', path: 'master-mata-kuliah' },
  { icon: 'edit_calendar', label: 'Pembukaan Kelas', path: 'pembukaan-kelas' },
  { icon: 'security', label: 'Jejak Audit', path: 'jejak-audit' },
  { icon: 'settings', label: 'Konfigurasi Sistem', path: 'konfigurasi-sistem' },
];

function NavItem({ item, isActive, onClick }) {
  const baseClass = 'flex items-center gap-space-sm px-space-md py-space-sm rounded-lg transition-colors font-label-md text-label-md';
  const activeClass = 'bg-primary-container text-on-primary-container font-bold shadow-md';
  const inactiveClass = 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface';
  return (
    <a
      href="#"
      onClick={(e) => { e.preventDefault(); onClick(item.path); }}
      className={baseClass + ' ' + (isActive ? activeClass : inactiveClass)}
    >
      <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
      {item.label}
    </a>
  );
}

function Sidebar({ isOpen, activeRole = 'mahasiswa', onRoleChange }) {
  const [activePath, setActivePath] = useState(activeRole === 'dosen' ? 'dasbor-dosen' : 'dasbor-mahasiswa');
  const asideClass = 'fixed top-16 left-0 bottom-0 w-64 bg-surface-container-low z-40 flex flex-col border-r border-outline-variant/20 transition-transform duration-300 ' + (isOpen ? 'translate-x-0' : '-translate-x-full');

  const handleNavClick = (path) => {
    setActivePath(path);
    if (path === 'dasbor-dosen' && onRoleChange) {
      onRoleChange('dosen');
    } else if (path === 'dasbor-mahasiswa' && onRoleChange) {
      onRoleChange('mahasiswa');
    }
  };

  const renderGroup = (items) =>
    items.map((item) => (
      <NavItem
        key={item.path}
        item={item}
        isActive={activePath === item.path}
        onClick={handleNavClick}
      />
    ));

  return (
    <aside className={asideClass}>
      <div className="flex-1 overflow-y-auto py-space-md px-space-sm flex flex-col gap-space-xs">
        <div className="px-space-sm pt-space-xs pb-space-xs font-caption text-caption text-outline uppercase tracking-wider font-semibold">
          Menu Mahasiswa
        </div>
        {renderGroup(menuMahasiswa)}

        <div className="px-space-sm pt-space-md pb-space-xs font-caption text-caption text-outline uppercase tracking-wider font-semibold">
          Menu Dosen
        </div>
        {renderGroup(menuDosen)}

        <div className="px-space-sm pt-space-md pb-space-xs font-caption text-caption text-outline uppercase tracking-wider font-semibold">
          Administrasi SPADA
        </div>
        {renderGroup(menuAdmin)}
      </div>

      <div className="p-space-md bg-surface-container-lowest/80 flex flex-col gap-space-sm">
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
          <span>IT Helpdesk</span>
        </a>
      </div>
    </aside>
  );
}

export default Sidebar;
