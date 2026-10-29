import React, { useState, useMemo, useEffect, useRef } from 'react';

// --- MOCK INITIAL USER DATA ---
const INITIAL_USERS = [
  {
    id: 'usr-1',
    nim: '24670001',
    name: 'Dimas Arya Pratama',
    initials: 'DA',
    avatarBg: 'bg-primary/20 text-primary',
    subtext: 'S1 Teknik Informatika • Angkatan 2024',
    email: 'dimas.arya@upgris.ac.id',
    phone: '+62 812-3490-1122',
    role: 'MAHASISWA',
    status: 'ACTIVE',
    lastLogin: '13 Okt 2026, 08:24 WIB',
    device: '103.24.55.12 • Chrome 132',
    prodi: 'TI',
    username: 'dimas.arya'
  },
  {
    id: 'usr-2',
    nim: '0612345601',
    name: 'Dr. Awan Rosi, M.Kom.',
    initials: 'AR',
    avatarBg: 'bg-secondary-container/30 text-secondary',
    subtext: 'Lektor Kepala • FPTIK',
    email: 'awan.rosi@upgris.ac.id',
    phone: '+62 813-8821-9003',
    role: 'DOSEN',
    status: 'ACTIVE',
    lastLogin: '13 Okt 2026, 08:15 WIB',
    device: '182.253.18.90 • Safari 18',
    prodi: 'TI',
    username: 'awan.rosi'
  },
  {
    id: 'usr-3',
    nim: '19820512',
    name: 'Admin Utama SPADA',
    initials: 'AD',
    avatarBg: 'bg-tertiary-container/40 text-tertiary',
    subtext: 'UPT Teknologi Informasi & Pangkalan Data',
    email: 'admin.spada@upgris.ac.id',
    phone: '+62 24-8711-209',
    role: 'ADMIN',
    status: 'ACTIVE',
    lastLogin: '13 Okt 2026, 08:30 WIB',
    device: '10.10.1.5 • Internal UPGRIS Net',
    prodi: 'UPT',
    username: 'admin.spada'
  },
  {
    id: 'usr-4',
    nim: '0628098701',
    name: 'Ir. Siti Aminah, M.T.',
    initials: 'SA',
    avatarBg: 'bg-secondary-container/30 text-secondary',
    subtext: 'Lektor • Rekayasa Perangkat Lunak',
    email: 'siti.aminah@upgris.ac.id',
    phone: '+62 815-6672-001',
    role: 'DOSEN',
    status: 'ACTIVE',
    lastLogin: '12 Okt 2026, 14:10 WIB',
    device: '36.72.100.4 • Edge 130',
    prodi: 'TI',
    username: 'siti.aminah'
  },
  {
    id: 'usr-5',
    nim: '24670002',
    name: 'Ahmad Fauzi',
    initials: 'AF',
    avatarBg: 'bg-primary/20 text-primary',
    subtext: 'S1 Teknik Informatika • Angkatan 2024',
    email: 'ahmad.fauzi@upgris.ac.id',
    phone: '+62 822-1092-4411',
    role: 'MAHASISWA',
    status: 'ACTIVE',
    lastLogin: '12 Okt 2026, 21:40 WIB',
    device: '180.252.12.5 • Firefox 131',
    prodi: 'TI',
    username: 'ahmad.fauzi'
  },
  {
    id: 'usr-6',
    nim: '0615048201',
    name: 'Budi Santoso, M.Cs.',
    initials: 'BS',
    avatarBg: 'bg-secondary-container/30 text-secondary',
    subtext: 'Asisten Ahli • Kecerdasan Komputasi',
    email: 'budi.santoso@upgris.ac.id',
    phone: '+62 812-7788-3410',
    role: 'DOSEN',
    status: 'ACTIVE',
    lastLogin: '11 Okt 2026, 17:05 WIB',
    device: '114.125.40.77 • Chrome 132',
    prodi: 'TI',
    username: 'budi.santoso'
  },
  {
    id: 'usr-7',
    nim: '24670045',
    name: 'Rina Wulandari',
    initials: 'RW',
    avatarBg: 'bg-surface-container-highest text-outline',
    subtext: 'S1 Sistem Informasi • Cuti Akademik',
    email: 'rina.wulan@upgris.ac.id',
    phone: '+62 857-9901-2299',
    role: 'MAHASISWA',
    status: 'INACTIVE',
    lastLogin: '01 Okt 2026, 09:12 WIB',
    device: '103.111.45.2 • Mobile Safari',
    prodi: 'SI',
    username: 'rina.wulan'
  },
  {
    id: 'usr-8',
    nim: '23670019',
    name: 'Kevin Sanjaya',
    initials: 'KS',
    avatarBg: 'bg-error-container/30 text-error',
    subtext: 'Akun Terkunci (Pelanggaran Presensi & Ujian)',
    email: 'kevin.s@upgris.ac.id',
    phone: '+62 821-4450-8902',
    role: 'MAHASISWA',
    status: 'SUSPENDED',
    lastLogin: '28 Sep 2026, 14:22 WIB',
    device: 'Diblokir Sistem RBAC',
    prodi: 'SI',
    username: 'kevin.s'
  },
  {
    id: 'usr-9',
    nim: '24670088',
    name: 'Putri Ayu Lestari',
    initials: 'PA',
    avatarBg: 'bg-primary/20 text-primary',
    subtext: 'S1 Pendidikan Bahasa Inggris • Angkatan 2024',
    email: 'putri.ayu@upgris.ac.id',
    phone: '+62 819-0128-4455',
    role: 'MAHASISWA',
    status: 'ACTIVE',
    lastLogin: '12 Okt 2026, 19:30 WIB',
    device: '182.253.22.10 • Chrome 132',
    prodi: 'PBI',
    username: 'putri.ayu'
  },
  {
    id: 'usr-10',
    nim: '24670092',
    name: 'Fajar Achmad',
    initials: 'FA',
    avatarBg: 'bg-primary/20 text-primary',
    subtext: 'S1 PGSD • Angkatan 2024',
    email: 'fajar.a@upgris.ac.id',
    phone: '+62 812-9988-1234',
    role: 'MAHASISWA',
    status: 'ACTIVE',
    lastLogin: '10 Okt 2026, 11:20 WIB',
    device: '180.252.88.1 • Chrome 132',
    prodi: 'PGSD',
    username: 'fajar.a'
  }
];

export default function ManajemenPengguna({ onRoleChange }) {
  // State Pengguna & Pilihan
  const [users, setUsers] = useState(INITIAL_USERS);
  const [selectedUserIds, setSelectedUserIds] = useState([]);
  const [toastMessage, setToastMessage] = useState(null);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [prodiFilter, setProdiFilter] = useState('ALL');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('ADD'); // 'ADD' or 'EDIT'
  const [editingUserId, setEditingUserId] = useState(null);
  const [deleteModalUser, setDeleteModalUser] = useState(null);

  // Form Fields
  const [formRole, setFormRole] = useState('Mahasiswa');
  const [formIdentifier, setFormIdentifier] = useState('');
  const [formProdi, setFormProdi] = useState('TI');
  const [formYear, setFormYear] = useState('2026/2027 Ganjil');
  const [formJalur, setFormJalur] = useState('Reguler Kampus Utama');
  const [formFullName, setFormFullName] = useState('');
  const [formUsername, setFormUsername] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formSendEmail, setFormSendEmail] = useState(true);
  const [formPassword, setFormPassword] = useState('UPGRIS#2026Secure!');
  const [formInitialStatus, setFormInitialStatus] = useState('ACTIVE');
  const [showPassword, setShowPassword] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const searchInputRef = useRef(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'f') {
        if (searchInputRef.current && document.activeElement !== searchInputRef.current) {
          e.preventDefault();
          searchInputRef.current.focus();
          searchInputRef.current.select();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const query = searchQuery.toLowerCase().trim();
      const matchesQuery =
        !query ||
        u.name.toLowerCase().includes(query) ||
        u.nim.toLowerCase().includes(query) ||
        u.email.toLowerCase().includes(query) ||
        (u.username && u.username.toLowerCase().includes(query));

      const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
      const matchesStatus = statusFilter === 'ALL' || u.status === statusFilter;
      const matchesProdi = prodiFilter === 'ALL' || u.prodi === prodiFilter;

      return matchesQuery && matchesRole && matchesStatus && matchesProdi;
    });
  }, [users, searchQuery, roleFilter, statusFilter, prodiFilter]);

  const totalPages = Math.ceil(filteredUsers.length / rowsPerPage) || 1;
  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return filteredUsers.slice(start, start + rowsPerPage);
  }, [filteredUsers, currentPage, rowsPerPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, roleFilter, statusFilter, prodiFilter, rowsPerPage]);

  const isAllSelected = useMemo(() => {
    if (paginatedUsers.length === 0) return false;
    return paginatedUsers.every((u) => selectedUserIds.includes(u.id));
  }, [paginatedUsers, selectedUserIds]);

  const handleToggleSelectAll = () => {
    if (isAllSelected) {
      const visibleIds = new Set(paginatedUsers.map((u) => u.id));
      setSelectedUserIds((prev) => prev.filter((id) => !visibleIds.has(id)));
    } else {
      const newSet = new Set(selectedUserIds);
      paginatedUsers.forEach((u) => newSet.add(u.id));
      setSelectedUserIds(Array.from(newSet));
    }
  };

  const handleToggleSelectRow = (id) => {
    setSelectedUserIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setRoleFilter('ALL');
    setStatusFilter('ALL');
    setProdiFilter('ALL');
    showToast('Filter pencarian telah direset');
  };

  const handleOpenAddModal = () => {
    setModalMode('ADD');
    setEditingUserId(null);
    setFormRole('Mahasiswa');
    setFormIdentifier('');
    setFormProdi('TI');
    setFormYear('2026/2027 Ganjil');
    setFormJalur('Reguler Kampus Utama');
    setFormFullName('');
    setFormUsername('');
    setFormEmail('');
    setFormPhone('');
    setFormPassword('UPGRIS#2026Secure!');
    setFormInitialStatus('ACTIVE');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (user) => {
    setModalMode('EDIT');
    setEditingUserId(user.id);
    const mappedRole = user.role === 'DOSEN' ? 'Dosen' : user.role === 'ADMIN' ? 'Admin' : 'Mahasiswa';
    setFormRole(mappedRole);
    setFormIdentifier(user.nim);
    setFormProdi(user.prodi || 'TI');
    setFormFullName(user.name);
    setFormUsername(user.username || user.email.split('@')[0]);
    setFormEmail(user.email);
    setFormPhone(user.phone);
    setFormInitialStatus(user.status);
    setIsModalOpen(true);
  };

  const handleSaveUser = (e) => {
    e.preventDefault();
    if (!formFullName || !formIdentifier || !formEmail) {
      showToast('Harap lengkapi semua kolom wajib (*)');
      return;
    }

    setIsSaving(true);
    setTimeout(() => {
      const roleUpper = formRole === 'Dosen' ? 'DOSEN' : formRole === 'Admin' ? 'ADMIN' : 'MAHASISWA';
      const initials = formFullName
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((w) => w[0].toUpperCase())
        .join('');

      let avatarBg = 'bg-primary/20 text-primary';
      if (roleUpper === 'DOSEN') avatarBg = 'bg-secondary-container/30 text-secondary';
      if (roleUpper === 'ADMIN') avatarBg = 'bg-tertiary-container/40 text-tertiary';

      const prodiName =
        formProdi === 'TI'
          ? 'S1 Teknik Informatika'
          : formProdi === 'SI'
          ? 'S1 Sistem Informasi'
          : formProdi === 'PBI'
          ? 'S1 Pendidikan Bahasa Inggris'
          : formProdi === 'PGSD'
          ? 'S1 PGSD'
          : 'UPT Teknologi Informasi';

      if (modalMode === 'EDIT') {
        setUsers((prev) =>
          prev.map((u) => {
            if (u.id === editingUserId) {
              return {
                ...u,
                name: formFullName,
                nim: formIdentifier,
                email: formEmail,
                phone: formPhone || u.phone,
                role: roleUpper,
                status: formInitialStatus,
                prodi: formProdi,
                username: formUsername || u.username,
                subtext: `${prodiName} • Terbarui`
              };
            }
            return u;
          })
        );
        showToast(`Data pengguna ${formFullName} berhasil diperbarui.`);
      } else {
        const newUser = {
          id: 'usr-' + Date.now(),
          nim: formIdentifier,
          name: formFullName,
          initials: initials || 'UP',
          avatarBg: avatarBg,
          subtext: `${prodiName} • Angkatan 2026`,
          email: formEmail,
          phone: formPhone || '+62 8xx xxxx xxxx',
          role: roleUpper,
          status: formInitialStatus,
          lastLogin: 'Baru Didaftarkan',
          device: 'Belum Ada Sesi Login',
          prodi: formProdi,
          username: formUsername || formEmail.split('@')[0]
        };
        setUsers((prev) => [newUser, ...prev]);
        showToast(`Pengguna baru ${formFullName} (${formIdentifier}) berhasil didaftarkan!`);
      }

      setIsSaving(false);
      setIsModalOpen(false);
    }, 600);
  };

  const handleToggleSuspend = (user) => {
    if (user.role === 'ADMIN') {
      showToast('Akun Administrator sistem terlindungi dan tidak dapat dinonaktifkan.');
      return;
    }

    const newStatus = user.status === 'SUSPENDED' ? 'ACTIVE' : 'SUSPENDED';
    setUsers((prev) =>
      prev.map((u) => (u.id === user.id ? { ...u, status: newStatus } : u))
    );

    if (newStatus === 'SUSPENDED') {
      showToast(`Akun ${user.name} (${user.nim}) telah ditangguhkan (Suspended).`);
    } else {
      showToast(`Akun ${user.name} (${user.nim}) telah dibuka dan aktif kembali.`);
    }
  };

  const handleResetPassword = (user) => {
    showToast(`Tautan pemulihan kata sandi telah dikirim ke email resmi: ${user.email}`);
  };

  const handleConfirmDelete = () => {
    if (!deleteModalUser) return;
    if (deleteModalUser.role === 'ADMIN') {
      showToast('Akun Administrator sistem tidak dapat dihapus.');
      setDeleteModalUser(null);
      return;
    }

    setUsers((prev) => prev.filter((u) => u.id !== deleteModalUser.id));
    setSelectedUserIds((prev) => prev.filter((id) => id !== deleteModalUser.id));
    showToast(`Akun ${deleteModalUser.name} telah berhasil dihapus dari sistem.`);
    setDeleteModalUser(null);
  };

  const handleBatchSuspend = () => {
    setUsers((prev) =>
      prev.map((u) =>
        selectedUserIds.includes(u.id) && u.role !== 'ADMIN'
          ? { ...u, status: 'SUSPENDED' }
          : u
      )
    );
    showToast(`${selectedUserIds.length} akun pengguna terpilih telah ditangguhkan.`);
    setSelectedUserIds([]);
  };

  const handleBatchNotify = () => {
    showToast(`Pesan notifikasi siaran telah dikirim ke ${selectedUserIds.length} pengguna terpilih.`);
  };

  const handleBatchDelete = () => {
    setUsers((prev) =>
      prev.filter((u) => !selectedUserIds.includes(u.id) || u.role === 'ADMIN')
    );
    showToast(`${selectedUserIds.length} akun pengguna terpilih telah dihapus.`);
    setSelectedUserIds([]);
  };

  const handleExportData = () => {
    setIsExporting(true);
    setTimeout(() => {
      setIsExporting(false);
      showToast(`Berkas data_pengguna_spada_${filteredUsers.length}.xlsx berhasil diunduh.`);
    }, 1200);
  };

  return (
    <div className="flex flex-col w-full pb-margin">
      {/* Toast Alert Lokal */}
      {toastMessage && (
        <div
          role="status"
          className="fixed bottom-6 right-6 z-50 flex items-center gap-space-sm bg-surface-container-highest text-on-surface px-space-md py-space-sm rounded-xl shadow-2xl border border-primary/40 animate-bounce"
        >
          <span className="material-symbols-outlined text-primary text-[20px]">verified</span>
          <span className="font-label-md text-sm">{toastMessage}</span>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="ml-2 text-on-surface-variant hover:text-on-surface p-0.5 rounded"
          >
            <span className="material-symbols-outlined text-[16px]">close</span>
          </button>
        </div>
      )}

      {/* Ambient Glow */}
      <div className="relative w-full">
        <div className="absolute -top-10 left-1/4 w-96 h-32 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -top-6 right-1/3 w-80 h-28 bg-secondary/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Top Navigation / Breadcrumbs & Summary Metric */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-space-md mb-space-lg pt-space-md">
        <div className="flex flex-col gap-space-xs">
          <nav className="flex items-center gap-space-xs font-caption text-caption text-on-surface-variant">
            <a className="hover:text-primary transition-colors flex items-center gap-1" href="#">
              <span className="material-symbols-outlined text-[14px]">home</span>
              <span>Beranda</span>
            </a>
            <span>/</span>
            <span className="text-on-surface-variant">Administrasi SPADA</span>
            <span>/</span>
            <span className="text-primary font-semibold">Manajemen Pengguna</span>
          </nav>

          <div className="flex items-baseline gap-space-sm flex-wrap">
            <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight font-bold">
              Manajemen Pengguna SPADA
            </h1>
            <span className="px-space-sm py-0.5 rounded-full bg-surface-container-high text-secondary font-label-sm text-label-sm border border-outline-variant/30">
              Role Tunggal & RBAC Terpusat
            </span>
          </div>

          <p className="font-body-md text-body-md text-on-surface-variant">
            Pengelolaan terpusat akun mahasiswa, dosen, dan administrator sistem SPADA LMS Universitas PGRI Semarang.
          </p>
        </div>

        {/* Stats Quick Pill */}
        <div className="flex items-center gap-space-md p-space-md rounded-xl bg-surface-container-low border border-outline-variant/20 shadow-sm self-start md:self-auto">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
            <span className="material-symbols-outlined text-[24px]">supervised_user_circle</span>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-space-xs">
              <span className="font-title-lg text-title-lg font-bold text-on-surface">{users.length}</span>
              <span className="font-caption text-caption text-tertiary flex items-center gap-0.5">
                <span className="material-symbols-outlined text-[14px]">check_circle</span>
                Aktif
              </span>
            </div>
            <span className="font-caption text-caption text-on-surface-variant">
              {users.filter((u) => u.role === 'MAHASISWA').length} Mahasiswa • {users.filter((u) => u.role === 'DOSEN').length} Dosen • {users.filter((u) => u.role === 'ADMIN').length} Admin
            </span>
          </div>
        </div>
      </div>

      {/* Operational Filter & Action Toolbar */}
      <div className="bg-surface-container-low p-space-md rounded-xl border border-outline-variant/25 mb-space-lg shadow-sm flex flex-col gap-space-md">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-space-md">
          {/* Search Input */}
          <div className="relative flex-1 min-w-[280px]">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[20px]">
              search
            </span>
            <input
              ref={searchInputRef}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-surface-container rounded-lg pl-10 pr-16 py-2.5 text-on-surface font-body-sm text-body-sm placeholder:text-outline border border-outline-variant/40 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
              placeholder="Cari nama lengkap, NIM, NIDN, email, atau username..."
              type="text"
            />
            {searchQuery ? (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            ) : (
              <div className="absolute right-2.5 top-1/2 -translate-y-1/2 hidden sm:flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-surface-container-high text-on-surface-variant font-caption text-[10px]">
                <span className="text-xs">⌘</span><span>F</span>
              </div>
            )}
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-space-sm flex-wrap">
            <button
              onClick={handleExportData}
              disabled={isExporting}
              className="flex items-center gap-space-xs px-space-md py-2.5 rounded-lg bg-surface-container-high hover:bg-surface-bright text-on-surface font-label-md text-label-md transition-all border border-outline-variant/30 active:scale-95 disabled:opacity-50"
              title="Unduh data dalam format CSV atau Excel"
              type="button"
            >
              <span className={`material-symbols-outlined text-[18px] ${isExporting ? 'animate-spin' : ''}`}>
                {isExporting ? 'downloading' : 'download'}
              </span>
              <span>{isExporting ? 'Mengekspor...' : 'Ekspor Data'}</span>
            </button>

            <button
              onClick={handleOpenAddModal}
              className="flex items-center gap-space-xs px-space-md py-2.5 rounded-lg bg-primary-container text-on-primary-container font-label-md text-label-md font-bold hover:brightness-110 transition-all shadow-md active:scale-95"
              type="button"
            >
              <span className="material-symbols-outlined text-[20px]">person_add</span>
              <span>+ Tambah Pengguna Baru</span>
            </button>
          </div>
        </div>

        {/* Filter Selectors */}
        <div className="flex items-center gap-space-sm flex-wrap pt-space-xs border-t border-outline-variant/15 text-body-sm font-body-sm">
          <div className="flex items-center gap-space-xs text-on-surface-variant text-caption font-semibold uppercase tracking-wider mr-1">
            <span className="material-symbols-outlined text-[16px]">filter_list</span>
            <span>Filter:</span>
          </div>

          {/* Role Filter */}
          <div className="relative inline-block">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="appearance-none bg-surface-container text-on-surface text-body-sm rounded-lg pl-3 pr-8 py-1.5 border border-outline-variant/30 focus:outline-none focus:border-primary cursor-pointer hover:bg-surface-container-high transition-colors"
            >
              <option value="ALL">Semua Peran ({users.length})</option>
              <option value="MAHASISWA">Mahasiswa ({users.filter((u) => u.role === 'MAHASISWA').length})</option>
              <option value="DOSEN">Dosen Pengampu ({users.filter((u) => u.role === 'DOSEN').length})</option>
              <option value="ADMIN">Administrator ({users.filter((u) => u.role === 'ADMIN').length})</option>
            </select>
            <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-[18px] text-outline">
              expand_more
            </span>
          </div>

          {/* Status Filter */}
          <div className="relative inline-block">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="appearance-none bg-surface-container text-on-surface text-body-sm rounded-lg pl-3 pr-8 py-1.5 border border-outline-variant/30 focus:outline-none focus:border-primary cursor-pointer hover:bg-surface-container-high transition-colors"
            >
              <option value="ALL">Semua Status Akun</option>
              <option value="ACTIVE">Aktif (Active)</option>
              <option value="INACTIVE">Tidak Aktif (Inactive)</option>
              <option value="SUSPENDED">Ditangguhkan (Suspended)</option>
            </select>
            <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-[18px] text-outline">
              expand_more
            </span>
          </div>

          {/* Prodi Filter */}
          <div className="relative inline-block">
            <select
              value={prodiFilter}
              onChange={(e) => setProdiFilter(e.target.value)}
              className="appearance-none bg-surface-container text-on-surface text-body-sm rounded-lg pl-3 pr-8 py-1.5 border border-outline-variant/30 focus:outline-none focus:border-primary cursor-pointer hover:bg-surface-container-high transition-colors"
            >
              <option value="ALL">Semua Program Studi / Unit</option>
              <option value="TI">S1 Teknik Informatika</option>
              <option value="SI">S1 Sistem Informasi</option>
              <option value="PBI">S1 Pendidikan Bahasa Inggris</option>
              <option value="PGSD">S1 PGSD</option>
              <option value="UPT">UPT Sumber Belajar & SI</option>
            </select>
            <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-[18px] text-outline">
              expand_more
            </span>
          </div>

          <button
            onClick={handleResetFilters}
            className="ml-auto text-primary hover:text-secondary text-caption font-semibold flex items-center gap-1 transition-colors"
            type="button"
          >
            <span className="material-symbols-outlined text-[14px]">restart_alt</span>
            <span>Reset Filter</span>
          </button>
        </div>
      </div>

      {/* Main User Data Table Card */}
      <div className="bg-surface-container-low rounded-xl border border-outline-variant/20 shadow-xl overflow-hidden flex flex-col">
        {/* Batch Actions Banner */}
        {selectedUserIds.length > 0 && (
          <div className="flex items-center justify-between px-space-md py-space-sm bg-primary-container text-on-primary-container transition-all animate-scale-up">
            <div className="flex items-center gap-space-sm font-label-md text-label-md">
              <span className="material-symbols-outlined text-[20px]">check_box</span>
              <span>{selectedUserIds.length} pengguna terpilih</span>
            </div>
            <div className="flex items-center gap-space-xs">
              <button
                onClick={handleBatchNotify}
                className="px-space-sm py-1 rounded bg-on-primary-container/20 hover:bg-on-primary-container/30 text-on-primary-container font-label-sm text-label-sm transition-colors"
                type="button"
              >
                Kirim Notifikasi
              </button>
              <button
                onClick={handleBatchSuspend}
                className="px-space-sm py-1 rounded bg-on-primary-container/20 hover:bg-on-primary-container/30 text-on-primary-container font-label-sm text-label-sm transition-colors"
                type="button"
              >
                Tangguhkan Akun
              </button>
              <button
                onClick={handleBatchDelete}
                className="px-space-sm py-1 rounded bg-error-container text-on-error font-label-sm text-label-sm transition-colors"
                type="button"
              >
                Hapus Pilihan
              </button>
            </div>
          </div>
        )}

        {/* Table Container */}
        <div className="w-full overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1040px]">
            <thead>
              <tr className="bg-surface-container-lowest/70 border-b border-outline-variant/20 text-on-surface-variant font-label-sm text-label-sm uppercase tracking-wider">
                <th className="py-3.5 px-4 w-12 text-center">
                  <input
                    checked={isAllSelected}
                    onChange={handleToggleSelectAll}
                    className="w-4 h-4 rounded bg-surface-container border-outline-variant text-primary focus:ring-0 focus:ring-offset-0 cursor-pointer accent-primary"
                    type="checkbox"
                  />
                </th>
                <th className="py-3.5 px-4">PENGGUNA</th>
                <th className="py-3.5 px-4">IDENTITAS RESMI</th>
                <th className="py-3.5 px-4">EMAIL KAMPUS & KONTAK</th>
                <th className="py-3.5 px-4">ROLE (PERAN)</th>
                <th className="py-3.5 px-4">STATUS AKUN</th>
                <th className="py-3.5 px-4">TERAKHIR LOGIN</th>
                <th className="py-3.5 px-4 text-center">AKSI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/15 font-body-md text-body-md">
              {paginatedUsers.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-16 text-center text-outline">
                    <span className="material-symbols-outlined text-4xl mb-2 opacity-50 block">group_off</span>
                    Tidak ada pengguna yang cocok dengan kriteria pencarian dan filter saat ini.
                  </td>
                </tr>
              ) : (
                paginatedUsers.map((user) => {
                  const isChecked = selectedUserIds.includes(user.id);
                  return (
                    <tr
                      key={user.id}
                      className={`transition-colors ${
                        isChecked
                          ? 'bg-primary-container/10 hover:bg-primary-container/15'
                          : user.status === 'SUSPENDED'
                          ? 'bg-error-container/5 hover:bg-surface-container/60'
                          : 'hover:bg-surface-container/60'
                      }`}
                    >
                      <td className="py-3.5 px-4 text-center">
                        <input
                          checked={isChecked}
                          onChange={() => handleToggleSelectRow(user.id)}
                          className="row-checkbox w-4 h-4 rounded bg-surface-container border-outline-variant text-primary focus:ring-0 cursor-pointer accent-primary"
                          type="checkbox"
                        />
                      </td>

                      {/* Pengguna */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-space-sm">
                          <div className={`w-10 h-10 rounded-full font-bold flex items-center justify-center text-label-md ${user.avatarBg}`}>
                            {user.initials}
                          </div>
                          <div className="flex flex-col">
                            <span className="font-title-md text-title-md text-on-surface font-semibold leading-snug">
                              {user.name}
                            </span>
                            <span className={`font-caption text-caption ${user.status === 'SUSPENDED' ? 'text-error font-medium' : 'text-on-surface-variant'}`}>
                              {user.subtext}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Identitas Resmi */}
                      <td className="py-3.5 px-4">
                        <span className={`px-2 py-1 rounded font-mono text-xs tracking-wider border ${
                          user.status === 'SUSPENDED'
                            ? 'bg-surface-container-high text-error border-error/30'
                            : 'bg-surface-container-high text-primary border-outline-variant/30'
                        }`}>
                          {user.nim}
                        </span>
                      </td>

                      {/* Email & Kontak */}
                      <td className="py-3.5 px-4">
                        <div className="flex flex-col">
                          <span className="text-on-surface text-body-sm font-medium">{user.email}</span>
                          <span className="text-caption text-on-surface-variant">{user.phone}</span>
                        </div>
                      </td>

                      {/* Role */}
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border font-label-sm text-label-sm font-semibold ${
                          user.role === 'ADMIN'
                            ? 'bg-tertiary-container/20 text-tertiary border-tertiary/30'
                            : user.role === 'DOSEN'
                            ? 'bg-secondary-container/20 text-secondary border-secondary/30'
                            : 'bg-primary-container/20 text-primary border-primary/30'
                        }`}>
                          <span className="material-symbols-outlined text-[14px]">
                            {user.role === 'ADMIN' ? 'shield_person' : user.role === 'DOSEN' ? 'co_present' : 'school'}
                          </span>
                          {user.role}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        {user.status === 'ACTIVE' && (
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-tertiary-container/20 text-tertiary border border-tertiary/30 font-caption text-caption font-bold tracking-wide">
                            <span className="w-1.5 h-1.5 rounded-full bg-tertiary animate-pulse" />
                            ACTIVE
                          </span>
                        )}
                        {user.status === 'INACTIVE' && (
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-surface-container-highest text-on-surface-variant border border-outline-variant/30 font-caption text-caption font-semibold">
                            <span className="w-1.5 h-1.5 rounded-full bg-outline" />
                            INACTIVE
                          </span>
                        )}
                        {user.status === 'SUSPENDED' && (
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-error-container/20 text-error border border-error/30 font-caption text-caption font-bold tracking-wide">
                            <span className="material-symbols-outlined text-[12px]">lock</span>
                            SUSPENDED
                          </span>
                        )}
                      </td>

                      {/* Terakhir Login */}
                      <td className="py-3.5 px-4">
                        <div className="flex flex-col">
                          <span className="text-on-surface font-label-sm text-label-sm">{user.lastLogin}</span>
                          <span className="font-caption text-caption text-outline">{user.device}</span>
                        </div>
                      </td>

                      {/* Aksi */}
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => handleOpenEditModal(user)}
                            className="p-1.5 rounded-lg text-on-surface-variant hover:text-primary hover:bg-surface-container-high transition-colors"
                            title="Ubah Pengguna"
                            type="button"
                          >
                            <span className="material-symbols-outlined text-[18px]">edit</span>
                          </button>

                          <button
                            onClick={() => handleResetPassword(user)}
                            className="p-1.5 rounded-lg text-on-surface-variant hover:text-secondary hover:bg-surface-container-high transition-colors"
                            title="Kirim Reset Password"
                            type="button"
                          >
                            <span className="material-symbols-outlined text-[18px]">lock_reset</span>
                          </button>

                          <button
                            onClick={() => handleToggleSuspend(user)}
                            disabled={user.role === 'ADMIN'}
                            className={`p-1.5 rounded-lg transition-colors ${
                              user.role === 'ADMIN'
                                ? 'text-outline cursor-not-allowed opacity-40'
                                : user.status === 'SUSPENDED'
                                ? 'text-tertiary hover:bg-surface-container-high'
                                : 'text-on-surface-variant hover:text-error hover:bg-surface-container-high'
                            }`}
                            title={user.role === 'ADMIN' ? 'Admin sistem tidak dapat dinonaktifkan' : user.status === 'SUSPENDED' ? 'Buka Kunci Akun' : 'Tangguhkan / Kunci Akun'}
                            type="button"
                          >
                            <span className="material-symbols-outlined text-[18px]">
                              {user.status === 'SUSPENDED' ? 'lock_open' : 'block'}
                            </span>
                          </button>

                          {user.role !== 'ADMIN' && (
                            <button
                              onClick={() => setDeleteModalUser(user)}
                              className="p-1.5 rounded-lg text-on-surface-variant hover:text-error hover:bg-surface-container-high transition-colors"
                              title="Hapus Pengguna"
                              type="button"
                            >
                              <span className="material-symbols-outlined text-[18px]">delete</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination & Meta Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-space-md p-space-md border-t border-outline-variant/20 bg-surface-container-lowest/60">
          <div className="flex items-center gap-space-sm text-body-sm font-body-sm text-on-surface-variant">
            <span>
              Menampilkan <strong className="text-on-surface font-semibold">{filteredUsers.length === 0 ? 0 : (currentPage - 1) * rowsPerPage + 1}-{Math.min(currentPage * rowsPerPage, filteredUsers.length)}</strong> dari <strong className="text-on-surface font-semibold">{filteredUsers.length}</strong> pengguna
            </span>
          </div>

          <div className="flex items-center gap-space-md flex-wrap justify-center">
            <div className="flex items-center gap-space-xs text-caption font-caption text-on-surface-variant">
              <span>Tampilkan:</span>
              <select
                value={rowsPerPage}
                onChange={(e) => setRowsPerPage(Number(e.target.value))}
                className="bg-surface-container text-on-surface text-caption rounded px-2 py-1 border border-outline-variant/30 focus:outline-none cursor-pointer"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
              <span>baris</span>
            </div>

            <nav aria-label="Pagination" className="flex items-center gap-1">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="p-1.5 rounded-md text-outline hover:bg-surface-container disabled:opacity-40 disabled:pointer-events-none transition-colors"
                type="button"
              >
                <span className="material-symbols-outlined text-[18px]">chevron_left</span>
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`w-8 h-8 rounded-md font-label-sm text-label-sm flex items-center justify-center transition-colors ${
                    currentPage === pageNum
                      ? 'bg-primary-container text-on-primary-container font-bold shadow'
                      : 'hover:bg-surface-container text-on-surface-variant'
                  }`}
                  type="button"
                >
                  {pageNum}
                </button>
              ))}

              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="p-1.5 rounded-md text-on-surface-variant hover:bg-surface-container disabled:opacity-40 disabled:pointer-events-none transition-colors"
                type="button"
              >
                <span className="material-symbols-outlined text-[18px]">chevron_right</span>
              </button>
            </nav>
          </div>
        </div>
      </div>

      {/* MODAL: TAMBAH / UBAH PENGGUNA */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-space-md">
          <div className="bg-surface-container-low border border-outline-variant/30 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-scale-up">
            <div className="flex items-center justify-between px-space-xl py-space-md border-b border-outline-variant/20 bg-surface-container">
              <div className="flex items-center gap-space-sm">
                <div className="w-9 h-9 rounded-lg bg-primary-container flex items-center justify-center text-on-primary-container">
                  <span className="material-symbols-outlined text-[22px]">
                    {modalMode === 'EDIT' ? 'edit' : 'person_add'}
                  </span>
                </div>
                <div className="flex flex-col">
                  <h2 className="font-title-lg text-title-lg text-on-surface font-bold leading-tight">
                    {modalMode === 'EDIT' ? 'Ubah Data Pengguna' : 'Tambah Pengguna Baru'}
                  </h2>
                  <span className="font-caption text-caption text-on-surface-variant">
                    Pendaftaran Akun Terpusat Civitas Academica UPGRIS
                  </span>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors"
                type="button"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <form onSubmit={handleSaveUser} className="p-space-xl overflow-y-auto flex flex-col gap-space-lg">
              <div className="flex flex-col gap-space-xs">
                <label className="font-label-md text-label-md text-on-surface font-semibold flex items-center justify-between">
                  <span>Pilih Peran Utama (Role) <span className="text-error">*</span></span>
                  <span className="font-caption text-caption text-outline">Role bersifat tunggal (RBAC ketat)</span>
                </label>
                <div className="grid grid-cols-3 gap-space-xs p-1 bg-surface-container rounded-xl border border-outline-variant/30">
                  <button
                    type="button"
                    onClick={() => setFormRole('Mahasiswa')}
                    className={`flex items-center justify-center gap-space-xs py-2 rounded-lg font-label-md text-label-md transition-all ${
                      formRole === 'Mahasiswa'
                        ? 'font-bold bg-primary-container text-on-primary-container shadow-sm'
                        : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[18px]">school</span>
                    <span>Mahasiswa</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormRole('Dosen')}
                    className={`flex items-center justify-center gap-space-xs py-2 rounded-lg font-label-md text-label-md transition-all ${
                      formRole === 'Dosen'
                        ? 'font-bold bg-primary-container text-on-primary-container shadow-sm'
                        : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[18px]">co_present</span>
                    <span>Dosen</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormRole('Admin')}
                    className={`flex items-center justify-center gap-space-xs py-2 rounded-lg font-label-md text-label-md transition-all ${
                      formRole === 'Admin'
                        ? 'font-bold bg-primary-container text-on-primary-container shadow-sm'
                        : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[18px]">shield_person</span>
                    <span>Administrator</span>
                  </button>
                </div>
              </div>

              <div className="p-space-md rounded-xl bg-surface-container border border-outline-variant/25 flex flex-col gap-space-md">
                <div className="flex items-center gap-space-xs font-label-sm text-label-sm text-primary font-semibold">
                  <span className="material-symbols-outlined text-[18px]">
                    {formRole === 'Mahasiswa' ? 'school' : formRole === 'Dosen' ? 'co_present' : 'shield_person'}
                  </span>
                  <span>
                    {formRole === 'Mahasiswa'
                      ? 'Data Akademik Mahasiswa'
                      : formRole === 'Dosen'
                      ? 'Data Kepegawaian & Akademik Dosen'
                      : 'Data Staf Administrator SPADA'}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md">
                  <div className="flex flex-col gap-1">
                    <label className="font-label-sm text-label-sm text-on-surface">
                      {formRole === 'Mahasiswa'
                        ? 'Nomor Induk Mahasiswa (NIM)'
                        : formRole === 'Dosen'
                        ? 'Nomor Induk Dosen Nasional (NIDN)'
                        : 'Nomor Induk Pegawai (NIP / NIK)'}{' '}
                      <span className="text-error">*</span>
                    </label>
                    <input
                      required
                      value={formIdentifier}
                      onChange={(e) => setFormIdentifier(e.target.value)}
                      className="w-full bg-surface-container-low rounded-lg px-3 py-2 font-body-sm text-body-sm text-on-surface border border-outline-variant/40 focus:outline-none focus:border-primary font-mono"
                      placeholder={formRole === 'Mahasiswa' ? 'Contoh: 24670102' : formRole === 'Dosen' ? 'Contoh: 0612345601' : 'Contoh: 19820512'}
                      type="text"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="font-label-sm text-label-sm text-on-surface">
                      {formRole === 'Mahasiswa'
                        ? 'Program Studi'
                        : formRole === 'Dosen'
                        ? 'Homebase Fakultas / Program Studi'
                        : 'Unit Kerja / Biro'}{' '}
                      <span className="text-error">*</span>
                    </label>
                    <select
                      value={formProdi}
                      onChange={(e) => setFormProdi(e.target.value)}
                      className="w-full bg-surface-container-low rounded-lg px-3 py-2 font-body-sm text-body-sm text-on-surface border border-outline-variant/40 focus:outline-none focus:border-primary"
                    >
                      <option value="TI">S1 Teknik Informatika</option>
                      <option value="SI">S1 Sistem Informasi</option>
                      <option value="PBI">S1 Pendidikan Bahasa Inggris</option>
                      <option value="PGSD">S1 PGSD</option>
                      <option value="UPT">UPT Sumber Belajar & SI</option>
                    </select>
                  </div>
                </div>

                {formRole === 'Mahasiswa' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md">
                    <div className="flex flex-col gap-1">
                      <label className="font-label-sm text-label-sm text-on-surface">Tahun Angkatan / Masuk</label>
                      <input
                        value={formYear}
                        onChange={(e) => setFormYear(e.target.value)}
                        className="w-full bg-surface-container-low rounded-lg px-3 py-2 font-body-sm text-body-sm text-on-surface border border-outline-variant/40 focus:outline-none focus:border-primary"
                        type="text"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="font-label-sm text-label-sm text-on-surface">Jalur Masuk</label>
                      <select
                        value={formJalur}
                        onChange={(e) => setFormJalur(e.target.value)}
                        className="w-full bg-surface-container-low rounded-lg px-3 py-2 font-body-sm text-body-sm text-on-surface border border-outline-variant/40 focus:outline-none focus:border-primary"
                      >
                        <option value="Reguler Kampus Utama">Reguler Kampus Utama</option>
                        <option value="Program Beasiswa KIP-K">Program Beasiswa KIP-K</option>
                        <option value="Alih Jenjang / Rekognisi">Alih Jenjang / Rekognisi</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-space-md">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md">
                  <div className="flex flex-col gap-1">
                    <label className="font-label-sm text-label-sm text-on-surface">
                      Nama Lengkap Civitas <span className="text-error">*</span>
                    </label>
                    <input
                      required
                      value={formFullName}
                      onChange={(e) => setFormFullName(e.target.value)}
                      className="w-full bg-surface-container rounded-lg px-3 py-2 font-body-sm text-body-sm text-on-surface border border-outline-variant/40 focus:outline-none focus:border-primary"
                      placeholder="cth: Bagas Kurniawan, S.Pd."
                      type="text"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="font-label-sm text-label-sm text-on-surface">
                      Username Sistem <span className="text-error">*</span>
                    </label>
                    <input
                      required
                      value={formUsername}
                      onChange={(e) => setFormUsername(e.target.value)}
                      className="w-full bg-surface-container rounded-lg px-3 py-2 font-body-sm text-body-sm text-on-surface border border-outline-variant/40 focus:outline-none focus:border-primary"
                      placeholder="cth: bagas.kurniawan"
                      type="text"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md">
                  <div className="flex flex-col gap-1">
                    <label className="font-label-sm text-label-sm text-on-surface">
                      Email Kampus Resmi (@upgris.ac.id) <span className="text-error">*</span>
                    </label>
                    <input
                      required
                      value={formEmail}
                      onChange={(e) => setFormEmail(e.target.value)}
                      className="w-full bg-surface-container rounded-lg px-3 py-2 font-body-sm text-body-sm text-on-surface border border-outline-variant/40 focus:outline-none focus:border-primary"
                      placeholder="bagas.kurniawan@upgris.ac.id"
                      type="email"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="font-label-sm text-label-sm text-on-surface">
                      Nomor WhatsApp / Seluler Aktif
                    </label>
                    <input
                      value={formPhone}
                      onChange={(e) => setFormPhone(e.target.value)}
                      className="w-full bg-surface-container rounded-lg px-3 py-2 font-body-sm text-body-sm text-on-surface border border-outline-variant/40 focus:outline-none focus:border-primary"
                      placeholder="+62 8xx xxxx xxxx"
                      type="tel"
                    />
                  </div>
                </div>

                <div className="p-space-md rounded-xl bg-surface-container/60 border border-outline-variant/20 flex flex-col gap-space-sm">
                  <div className="flex items-center justify-between">
                    <span className="font-label-sm text-label-sm text-on-surface font-semibold flex items-center gap-1">
                      <span className="material-symbols-outlined text-[16px] text-secondary">vpn_key</span>
                      Kredensial & Autentikasi
                    </span>
                    <label className="flex items-center gap-space-xs cursor-pointer text-caption text-on-surface-variant">
                      <input
                        checked={formSendEmail}
                        onChange={(e) => setFormSendEmail(e.target.checked)}
                        className="w-4 h-4 rounded text-primary border-outline-variant focus:ring-0 bg-surface-container accent-primary"
                        type="checkbox"
                      />
                      <span>Kirim kredensial via Email</span>
                    </label>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md pt-space-xs">
                    <div className="flex flex-col gap-1">
                      <label className="font-caption text-caption text-on-surface-variant">Kata Sandi Default</label>
                      <div className="relative">
                        <input
                          value={formPassword}
                          onChange={(e) => setFormPassword(e.target.value)}
                          className="w-full bg-surface-container-low rounded-lg pl-3 pr-10 py-2 font-body-sm text-body-sm text-on-surface border border-outline-variant/40 focus:outline-none focus:border-primary font-mono text-xs"
                          type={showPassword ? 'text' : 'password'}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface"
                        >
                          <span className="material-symbols-outlined text-[18px]">
                            {showPassword ? 'visibility_off' : 'visibility'}
                          </span>
                        </button>
                      </div>
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="font-caption text-caption text-on-surface-variant">Status Awal Akun</label>
                      <select
                        value={formInitialStatus}
                        onChange={(e) => setFormInitialStatus(e.target.value)}
                        className="w-full bg-surface-container-low rounded-lg px-3 py-2 font-body-sm text-body-sm text-on-surface border border-outline-variant/40 focus:outline-none focus:border-primary"
                      >
                        <option value="ACTIVE">Aktif Langsung (Dapat Login)</option>
                        <option value="INACTIVE">Nonaktif (Draft)</option>
                        <option value="SUSPENDED">Ditangguhkan (Terkunci)</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-space-md border-t border-outline-variant/20">
                <span className="font-caption text-caption text-outline hidden sm:inline">
                  Data akan disinkronkan ke SIAKAD Utama UPGRIS
                </span>
                <div className="flex items-center gap-space-sm ml-auto">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-space-md py-2 rounded-lg bg-surface-container-high hover:bg-surface-bright text-on-surface font-label-md text-label-md transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="flex items-center gap-space-xs px-space-lg py-2 rounded-lg bg-primary-container text-on-primary-container font-label-md text-label-md font-bold hover:brightness-110 shadow-md transition-all active:scale-95 disabled:opacity-50"
                  >
                    <span className={`material-symbols-outlined text-[18px] ${isSaving ? 'animate-spin' : ''}`}>
                      {isSaving ? 'refresh' : 'save'}
                    </span>
                    <span>{isSaving ? 'Menyimpan...' : modalMode === 'EDIT' ? 'Simpan Perubahan' : 'Simpan & Daftarkan Pengguna'}</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: KONFIRMASI HAPUS PENGGUNA */}
      {deleteModalUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-surface-dim/80 backdrop-blur-md p-space-md">
          <div className="w-full max-w-md bg-surface-container rounded-xl shadow-2xl overflow-hidden animate-scale-up border border-outline-variant/30">
            <div className="p-space-md bg-surface-container-high flex items-start gap-space-sm border-b border-outline-variant/20">
              <div className="w-12 h-12 rounded-xl bg-error-container text-error flex items-center justify-center shrink-0 shadow-inner">
                <span className="material-symbols-outlined text-[28px]">delete_forever</span>
              </div>
              <div className="flex-1">
                <h3 className="font-title-lg text-title-lg text-on-surface font-bold">
                  Hapus Akun Pengguna
                </h3>
                <span className="font-caption text-caption text-outline">
                  Tindakan Permanen & Jejak Audit
                </span>
              </div>
              <button
                onClick={() => setDeleteModalUser(null)}
                className="text-outline hover:text-on-surface p-1 rounded"
                type="button"
              >
                <span className="material-symbols-outlined text-[22px]">close</span>
              </button>
            </div>

            <div className="p-space-lg flex flex-col gap-space-sm">
              <p className="font-body-md text-body-md text-on-surface-variant">
                Apakah Anda yakin ingin menghapus akun pengguna <strong className="text-on-surface font-semibold text-primary">{deleteModalUser.name}</strong> ({deleteModalUser.nim})?
              </p>
              <p className="font-caption text-caption text-error bg-error-container/20 p-2.5 rounded-lg border border-error/20">
                Data akun, riwayat sesi login, dan hak akses SPADA LMS civitas ini akan dihapus dari basis data.
              </p>
            </div>

            <div className="p-space-md bg-surface-container-high flex items-center justify-end gap-space-sm border-t border-outline-variant/20">
              <button
                onClick={() => setDeleteModalUser(null)}
                className="px-space-md py-2 rounded-lg bg-surface-container hover:bg-surface-bright text-on-surface font-label-md text-label-md"
                type="button"
              >
                Batal
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-space-md py-2 rounded-lg bg-error text-on-error font-label-md text-label-md font-bold hover:brightness-110 active:scale-95 shadow-md"
                type="button"
              >
                Ya, Hapus Akun
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
