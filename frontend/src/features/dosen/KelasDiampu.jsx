import React, { useState, useEffect, useMemo, useRef } from 'react';
import AppShell from '../../components/AppShell';

/**
 * KelasDiampu — Feature Component
 *
 * Daftar kelas perkuliahan yang diampu dosen untuk semester aktif.
 * - Grid View & List View
 * - Filter semester & live search
 * - Aksi cepat presensi, agenda mengajar, ekspor CSV
 * - Modal detail & kelola ruang kelas
 */

const LECTURER = {
  name: 'Dr. Bayu Pratama, M.Kom.',
  nidn: '0612345601',
};

const DEFAULT_CLASSES = [
  {
    id: 'cls-1',
    courseId: 'rpl-ti-a',
    code: 'TI-A',
    courseName: 'Rekayasa Perangkat Lunak',
    credits: 3,
    category: 'Reguler Pagi',
    day: 'Senin',
    time: '08:00 - 10:30 WIB',
    room: 'Lab Komputasi 3 (Gedung B Lt. 3)',
    meetingsCount: 16,
    publishedMaterials: 5,
    enrolledStudents: 38,
    capacity: 40,
    attendanceStatus: 'active', // 'active' | 'closed'
    attendanceLabel: 'Presensi P-3: Sesi Aktif',
    attendanceNote: 'Tersisa 45 Menit',
    pendingGradingCount: 14,
    pendingGradingTask: 'Tugas UML',
  },
  {
    id: 'cls-2',
    courseId: 'pwl-ti-b',
    code: 'TI-B',
    courseName: 'Pemrograman Web Lanjut',
    credits: 3,
    category: 'Reguler Siang',
    day: 'Rabu',
    time: '10:30 - 13:00 WIB',
    room: 'Ruang Teori 402',
    meetingsCount: 16,
    publishedMaterials: 5,
    enrolledStudents: 40,
    capacity: 40,
    attendanceStatus: 'closed',
    attendanceLabel: 'Presensi Ditutup',
    attendanceNote: 'P-3 Belum Mulai',
    pendingGradingCount: 0,
    pendingGradingTask: 'Semua Dinilai',
  },
  {
    id: 'cls-3',
    courseId: 'jarkom-ti-a',
    code: 'TI-A',
    courseName: 'Jaringan Komputer & Keamanan Siber',
    credits: 3,
    category: 'Peminatan',
    day: 'Kamis',
    time: '13:00 - 14:40 WIB',
    room: 'Lab Rekayasa 2',
    meetingsCount: 16,
    publishedMaterials: 4,
    enrolledStudents: 36,
    capacity: 40,
    attendanceStatus: 'closed',
    attendanceLabel: 'Presensi Ditutup',
    attendanceNote: 'Jadwal Kamis',
    pendingGradingCount: 8,
    pendingGradingTask: 'Tugas MVC',
  },
];

export default function KelasDiampu({ onNavigate, onRoleChange }) {
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'
  const [selectedSemester, setSelectedSemester] = useState('Semester Ganjil 2026/2027');
  const [searchQuery, setSearchQuery] = useState('');
  const [classes, setClasses] = useState(DEFAULT_CLASSES);
  const [openMenuId, setOpenMenuId] = useState(null);

  const [toast, setToast] = useState({ visible: false, message: '', type: 'info' });
  const toastTimeoutRef = useRef(null);

  const [modalAgendaOpen, setModalAgendaOpen] = useState(false);
  const [modalManageClass, setModalManageClass] = useState(null);
  const [modalProdiOpen, setModalProdiOpen] = useState(false);

  const [isOpeningAttendance, setIsOpeningAttendance] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  const quickActionTimeoutRef = useRef(null);
  const syncTimeoutRef = useRef(null);

  // Bersihkan seluruh timer saat komponen dilepas.
  useEffect(() => {
    return () => {
      clearTimeout(toastTimeoutRef.current);
      clearTimeout(quickActionTimeoutRef.current);
      clearTimeout(syncTimeoutRef.current);
    };
  }, []);

  // Dismiss context menu on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('[data-dropdown-container]')) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  // Tutup modal apa pun dengan tombol Escape.
  const anyModalOpen = modalAgendaOpen || modalManageClass !== null || modalProdiOpen;
  useEffect(() => {
    if (!anyModalOpen) return undefined;
    const onKeyDown = (event) => {
      if (event.key !== 'Escape') return;
      setModalAgendaOpen(false);
      setModalManageClass(null);
      setModalProdiOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [anyModalOpen]);

  const showToast = (message, type = 'info') => {
    clearTimeout(toastTimeoutRef.current);
    setToast({ visible: true, message, type });
    toastTimeoutRef.current = setTimeout(() => {
      setToast((prev) => ({ ...prev, visible: false }));
      toastTimeoutRef.current = null;
    }, 3200);
  };

  const filteredClasses = useMemo(() => {
    if (!searchQuery.trim()) return classes;
    const q = searchQuery.toLowerCase();
    return classes.filter(
      (c) =>
        c.courseName.toLowerCase().includes(q) ||
        c.code.toLowerCase().includes(q) ||
        c.category.toLowerCase().includes(q) ||
        c.room.toLowerCase().includes(q) ||
        c.day.toLowerCase().includes(q)
    );
  }, [classes, searchQuery]);

  const totalSKS = useMemo(() => classes.reduce((sum, c) => sum + c.credits, 0), [classes]);

  const totalStudents = useMemo(
    () => classes.reduce((sum, c) => sum + c.enrolledStudents, 0),
    [classes]
  );

  const handleTogglePresensi = (classId) => {
    setClasses((prev) =>
      prev.map((cls) => {
        if (cls.id !== classId) return cls;
        const willBeActive = cls.attendanceStatus !== 'active';
        return {
          ...cls,
          attendanceStatus: willBeActive ? 'active' : 'closed',
          attendanceLabel: willBeActive ? 'Presensi P-3: Sesi Aktif' : 'Presensi Ditutup',
          attendanceNote: willBeActive ? 'Tersisa 60 Menit' : 'Sesi Telah Diakhiri',
        };
      })
    );
    showToast('Status presensi kelas berhasil diperbarui', 'success');
    setOpenMenuId(null);
  };

  const handleQuickAttendanceAction = () => {
    setIsOpeningAttendance(true);
    clearTimeout(quickActionTimeoutRef.current);
    quickActionTimeoutRef.current = setTimeout(() => {
      setIsOpeningAttendance(false);
      const target = classes[0];
      if (!target) return;
      setClasses((prev) =>
        prev.map((cls) =>
          cls.id === target.id
            ? {
                ...cls,
                attendanceStatus: 'active',
                attendanceLabel: 'Presensi P-3: Sesi Aktif',
                attendanceNote: 'Tersisa 60 Menit',
              }
            : cls
        )
      );
      showToast(`Presensi P-3 ${target.courseName} (${target.code}) berhasil dibuka!`, 'success');
    }, 800);
  };

  const handleExportCSV = () => {
    const headers = ['Kode', 'Mata Kuliah', 'SKS', 'Kategori', 'Jadwal', 'Ruang', 'Mahasiswa'];
    const rows = filteredClasses.map((c) => [
      c.code,
      `"${c.courseName}"`,
      c.credits,
      c.category,
      `"${c.day}, ${c.time}"`,
      `"${c.room}"`,
      `${c.enrolledStudents}/${c.capacity}`,
    ]);
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const link = document.createElement('a');
    link.setAttribute('href', encodeURI(csvContent));
    link.setAttribute('download', `Daftar_Kelas_Diampu_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Data kelas berhasil diekspor ke CSV', 'success');
  };

  const handleDownloadAttendanceCSV = (course) => {
    const headers = ['NIM', 'Nama Mahasiswa', 'Kelas', 'Kehadiran (%)', 'Status Presensi Terakhir'];
    const dummyRows = [
      ['23670001', '"Ahmad Fauzi"', course.code, '100%', '"Hadir Tepat Waktu"'],
      ['23670002', '"Budi Santoso"', course.code, '93.3%', '"Hadir Tepat Waktu"'],
      ['23670003', '"Citra Dewi"', course.code, '86.7%', '"Izin Sakit"'],
      ['23670004', '"Dimas Pratama"', course.code, '100%', '"Hadir Tepat Waktu"'],
      ['23670005', '"Eka Nur"', course.code, '80.0%', '"Hadir Mandiri"'],
    ];
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...dummyRows.map((e) => e.join(','))].join('\n');
    const link = document.createElement('a');
    link.setAttribute('href', encodeURI(csvContent));
    link.setAttribute(
      'download',
      `Berita_Acara_Presensi_${course.code}_${course.courseName.replace(/\s+/g, '_')}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(
      `Berita acara presensi ${course.courseName} (${course.code}) berhasil diunduh`,
      'success'
    );
  };

  const handleSyncSimAkad = () => {
    setIsSyncing(true);
    clearTimeout(syncTimeoutRef.current);
    syncTimeoutRef.current = setTimeout(() => {
      setIsSyncing(false);
      setClasses(DEFAULT_CLASSES);
      showToast('Sinkronisasi SIM-AKAD UPGRIS berhasil! 3 kelas siap diampu.', 'success');
    }, 1200);
  };

  const handleEnterManageClass = (cls) => {
    setModalManageClass(null);
    if (onNavigate) onNavigate(`kelola-kelas?course=${cls.courseId}`);
  };

  const handleEnterStudentRoom = (cls) => {
    setModalManageClass(null);
    if (onNavigate) onNavigate(`ruang-kelas?course=${cls.courseId}`);
  };

  return (
    <AppShell
      activeRole="dosen"
      onRoleChange={onRoleChange}
      activeNavPath="kelas-diampu"
      onNavChange={onNavigate}
    >
      <div className="w-full max-w-7xl mx-auto space-y-space-lg">
        {/* Toast Notification Banner */}
        {toast.visible && (
          <div className="fixed top-5 right-5 z-[9999]" role="status" aria-live="polite">
            <div
              className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl border ${
                toast.type === 'success'
                  ? 'bg-tertiary-container text-on-tertiary-container border-tertiary/40'
                  : 'bg-surface-container-highest text-on-surface border-outline/30'
              }`}
            >
              <span className="material-symbols-outlined text-[20px]">
                {toast.type === 'success' ? 'check_circle' : 'info'}
              </span>
              <span className="font-label-md text-label-md">{toast.message}</span>
              <button
                type="button"
                onClick={() => setToast((prev) => ({ ...prev, visible: false }))}
                aria-label="Tutup notifikasi"
                className="p-1 rounded hover:opacity-75"
              >
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            </div>
          </div>
        )}

        {/* Top Breadcrumb & Page Header Section */}
        <section className="bg-surface-container-low rounded-xl p-space-md sm:p-space-lg shadow-sm flex flex-col gap-space-md">
          <nav
            aria-label="Breadcrumb"
            className="flex items-center gap-space-xs text-on-surface-variant font-label-sm text-label-sm"
          >
            <button
              type="button"
              onClick={() => onNavigate && onNavigate('dasbor-dosen')}
              className="inline-flex items-center gap-1 hover:text-primary transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">home</span>
              <span>Dasbor</span>
            </button>
            <span className="material-symbols-outlined text-[14px] text-outline">chevron_right</span>
            <span className="text-on-surface font-label-md font-semibold">Kelas Diampu</span>
          </nav>

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-space-md">
            <div>
              <h1 className="font-headline-md text-headline-md text-on-surface tracking-tight font-bold">
                Kelas Perkuliahan Diampu
              </h1>
              <p className="font-body-md text-body-md text-on-surface-variant mt-1 flex flex-wrap items-center gap-1.5">
                <span className="inline-flex items-center gap-1 text-tertiary font-medium">
                  <span className="material-symbols-outlined text-[16px]">verified</span>
                  <span>{selectedSemester}</span>
                </span>
                <span className="text-outline">•</span>
                <span>
                  {classes.length} rombel kelas aktif diampu oleh{' '}
                  <strong className="text-on-surface font-semibold">{LECTURER.name}</strong>
                </span>
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-space-sm">
              <button
                type="button"
                onClick={handleQuickAttendanceAction}
                disabled={isOpeningAttendance || classes.length === 0}
                className="inline-flex items-center gap-space-xs px-3.5 py-2 rounded-lg bg-tertiary-container hover:bg-tertiary-container/90 text-on-tertiary-container font-label-sm text-label-sm transition-all shadow-sm font-medium cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <span
                  className={`material-symbols-outlined text-[18px] ${
                    isOpeningAttendance ? 'animate-spin' : ''
                  }`}
                >
                  {isOpeningAttendance ? 'refresh' : 'how_to_reg'}
                </span>
                <span>{isOpeningAttendance ? 'Membuka Sesi...' : '+ Buka Presensi Cepat'}</span>
              </button>
              <button
                type="button"
                onClick={() => setModalAgendaOpen(true)}
                className="inline-flex items-center gap-space-xs px-3.5 py-2 rounded-lg bg-surface-container-highest hover:bg-surface-bright text-on-surface font-label-sm text-label-sm transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px] text-secondary">today</span>
                <span>Agenda Mengajar Hari Ini</span>
              </button>
            </div>
          </div>

          {/* Filter, Search, and View Controls */}
          <div className="pt-space-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-space-sm">
            <div className="flex flex-wrap items-center gap-space-sm flex-1">
              <div className="relative min-w-[240px]">
                <label htmlFor="filter-semester" className="sr-only">
                  Filter semester
                </label>
                <select
                  id="filter-semester"
                  value={selectedSemester}
                  onChange={(e) => {
                    setSelectedSemester(e.target.value);
                    showToast(`Memuat data untuk ${e.target.value}...`);
                  }}
                  className="w-full bg-surface-container-high text-on-surface font-body-sm text-body-sm rounded-lg px-3 py-2 pr-9 appearance-none focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus:bg-surface-bright transition-colors cursor-pointer"
                >
                  <option>Semester Ganjil 2026/2027</option>
                  <option>Semester Genap 2025/2026</option>
                  <option>Semester Ganjil 2025/2026</option>
                  <option>Semester Pendek 2026</option>
                </select>
                <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-outline pointer-events-none text-[18px]">
                  unfold_more
                </span>
              </div>

              <div className="relative flex-1 min-w-[200px] max-w-md">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[18px]">
                  search
                </span>
                <label htmlFor="search-kelas" className="sr-only">
                  Cari kelas
                </label>
                <input
                  id="search-kelas"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-surface-container-high text-on-surface placeholder:text-outline font-body-sm text-body-sm rounded-lg pl-9 pr-8 py-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus:bg-surface-bright transition-colors"
                  placeholder="Cari kode kelas, mata kuliah, jadwal..."
                  type="text"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    aria-label="Hapus pencarian"
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface"
                  >
                    <span className="material-symbols-outlined text-[16px]">close</span>
                  </button>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between md:justify-end gap-space-sm shrink-0">
              <div className="flex items-center bg-surface-container-high p-1 rounded-lg">
                <button
                  type="button"
                  onClick={() => setViewMode('grid')}
                  aria-pressed={viewMode === 'grid'}
                  className={`px-2.5 py-1 rounded font-label-sm text-label-sm flex items-center gap-1 transition-all ${
                    viewMode === 'grid'
                      ? 'bg-primary text-on-primary shadow-sm font-semibold'
                      : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  <span className="material-symbols-outlined text-[16px]">grid_view</span>
                  <span className="hidden sm:inline">Grid</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('list')}
                  aria-pressed={viewMode === 'list'}
                  className={`px-2.5 py-1 rounded font-label-sm text-label-sm flex items-center gap-1 transition-all ${
                    viewMode === 'list'
                      ? 'bg-primary text-on-primary shadow-sm font-semibold'
                      : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  <span className="material-symbols-outlined text-[16px]">view_agenda</span>
                  <span className="hidden sm:inline">List</span>
                </button>
              </div>
              <button
                type="button"
                onClick={handleExportCSV}
                className="p-2 rounded-lg bg-surface-container-high hover:bg-surface-bright text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer"
                title="Ekspor Data Kelas ke CSV"
                aria-label="Ekspor data kelas ke CSV"
              >
                <span className="material-symbols-outlined text-[18px]">file_download</span>
              </button>
            </div>
          </div>
        </section>

        {/* ═════════ DAFTAR KELAS DIAMPU ═════════ */}
        <div className="space-y-space-lg">
          {filteredClasses.length === 0 ? (
            <div className="bg-surface-container-lowest rounded-xl p-12 text-center flex flex-col items-center justify-center max-w-2xl mx-auto shadow-sm">
              <div className="w-36 h-36 rounded-2xl bg-surface-container-high flex items-center justify-center text-primary-container mb-6 shadow-inner relative overflow-hidden">
                <div className="absolute inset-2 border-2 border-dashed border-outline/30 rounded-xl flex items-center justify-center">
                  <span className="material-symbols-outlined text-[64px] text-outline">co_present</span>
                </div>
              </div>
              <h3 className="font-headline-md text-headline-md text-on-surface font-semibold">
                {classes.length === 0 ? 'Belum Ada Kelas yang Diampu' : 'Tidak Ada Kelas yang Cocok'}
              </h3>
              <p className="font-body-md text-body-md text-on-surface-variant max-w-md mt-2">
                {classes.length === 0
                  ? 'Admin Program Studi atau BAAK belum menetapkan Anda sebagai dosen pengampu kelas pada semester aktif ini.'
                  : `Tidak ditemukan kelas dengan kata kunci "${searchQuery}".`}
              </p>
              <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                {classes.length === 0 ? (
                  <>
                    <button
                      type="button"
                      onClick={handleSyncSimAkad}
                      disabled={isSyncing}
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-surface-container-high hover:bg-surface-bright text-on-surface font-label-md text-label-md transition-colors cursor-pointer disabled:opacity-60"
                    >
                      <span
                        className={`material-symbols-outlined text-[18px] ${
                          isSyncing ? 'animate-spin' : ''
                        }`}
                      >
                        sync
                      </span>
                      <span>{isSyncing ? 'Sinkronisasi SIAKAD...' : 'Sinkronkan SIM-AKAD'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setModalProdiOpen(true)}
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-on-primary hover:bg-primary-hover transition-colors font-label-md text-label-md cursor-pointer font-semibold"
                    >
                      <span className="material-symbols-outlined text-[18px]">contact_support</span>
                      <span>Hubungi Operator Prodi</span>
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="px-4 py-2 rounded-lg bg-surface-container-high hover:bg-surface-bright text-primary font-label-sm"
                  >
                    Hapus Pencarian
                  </button>
                )}
              </div>
              {classes.length === 0 && (
                <div className="mt-8 pt-6 border-t border-outline/10 text-on-surface-variant font-caption text-caption flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px] text-secondary">
                    verified_user
                  </span>
                  <span>NIDN: {LECTURER.nidn} • Dosen Tetap Informatika UPGRIS</span>
                </div>
              )}
            </div>
          ) : (
            <div
              className={`transition-all duration-200 ${
                viewMode === 'grid'
                  ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6'
                  : 'grid grid-cols-1 gap-4'
              }`}
            >
              {filteredClasses.map((item) => (
                <article
                  key={item.id}
                  className={`bg-surface-container-lowest rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between ${
                    viewMode === 'list' ? 'border border-outline-variant/20' : ''
                  }`}
                >
                  <div className="space-y-4">
                    {/* Header Badges Row */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="px-2.5 py-0.5 rounded font-mono font-bold text-[12px] bg-primary-container text-on-primary-container">
                          {item.code}
                        </span>
                        <span className="px-2 py-0.5 rounded-full font-label-sm text-label-sm bg-surface-container text-secondary">
                          {item.credits} SKS
                        </span>
                        <span className="px-2 py-0.5 rounded font-caption text-caption bg-surface-container-high text-on-surface-variant">
                          {item.category}
                        </span>
                      </div>

                      {/* Dropdown Options Menu */}
                      <div className="relative" data-dropdown-container>
                        <button
                          type="button"
                          onClick={() => setOpenMenuId(openMenuId === item.id ? null : item.id)}
                          aria-expanded={openMenuId === item.id}
                          aria-label={`Opsi kelas ${item.courseName} ${item.code}`}
                          className="p-1 rounded hover:bg-surface-container text-outline hover:text-on-surface transition-colors cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[20px]">more_vert</span>
                        </button>

                        {openMenuId === item.id && (
                          <div className="absolute right-0 top-8 w-52 rounded-lg bg-surface-container-high shadow-xl py-1 z-30 font-label-sm text-label-sm text-on-surface border border-outline/20">
                            <button
                              type="button"
                              onClick={() => {
                                setOpenMenuId(null);
                                if (onNavigate) onNavigate(`kelola-kelas?course=${item.courseId}`);
                              }}
                              className="w-full flex items-center gap-2 px-3 py-2 hover:bg-surface-bright text-left cursor-pointer"
                            >
                              <span className="material-symbols-outlined text-[16px]">settings</span>
                              <span>Kelola Silabus & Sesi</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setModalManageClass(item);
                                setOpenMenuId(null);
                              }}
                              className="w-full flex items-center gap-2 px-3 py-2 hover:bg-surface-bright text-left cursor-pointer"
                            >
                              <span className="material-symbols-outlined text-[16px]">tune</span>
                              <span>Ringkasan & Opsi Cepat</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setOpenMenuId(null);
                                if (onNavigate) onNavigate('manajemen-materi');
                              }}
                              className="w-full flex items-center gap-2 px-3 py-2 hover:bg-surface-bright text-left cursor-pointer"
                            >
                              <span className="material-symbols-outlined text-[16px]">
                                folder_managed
                              </span>
                              <span>Manajemen Materi</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setOpenMenuId(null);
                                if (onNavigate) onNavigate('daftar-hadir-koreksi');
                              }}
                              className="w-full flex items-center gap-2 px-3 py-2 hover:bg-surface-bright text-left cursor-pointer"
                            >
                              <span className="material-symbols-outlined text-[16px]">fact_check</span>
                              <span>Koreksi Presensi</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setOpenMenuId(null);
                                handleDownloadAttendanceCSV(item);
                              }}
                              className="w-full flex items-center gap-2 px-3 py-2 hover:bg-surface-bright text-left cursor-pointer"
                            >
                              <span className="material-symbols-outlined text-[16px]">file_download</span>
                              <span>Unduh Rekap Absensi (.csv)</span>
                            </button>
                            <div className="my-1 border-t border-outline/20" />
                            <button
                              type="button"
                              onClick={() => handleTogglePresensi(item.id)}
                              className="w-full flex items-center gap-2 px-3 py-2 hover:bg-surface-bright text-left text-tertiary cursor-pointer"
                            >
                              <span className="material-symbols-outlined text-[16px]">
                                {item.attendanceStatus === 'active' ? 'lock' : 'how_to_reg'}
                              </span>
                              <span>
                                {item.attendanceStatus === 'active'
                                  ? 'Tutup Sesi Presensi'
                                  : 'Buka Sesi Presensi'}
                              </span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Subject Title & Schedule */}
                    <div>
                      <h2
                        onClick={() => {
                          if (onNavigate) onNavigate(`kelola-kelas?course=${item.courseId}`);
                        }}
                        title={`Buka kelola kelas ${item.courseName}`}
                        className="font-title-lg text-title-lg text-on-surface font-semibold hover:text-primary cursor-pointer transition-colors leading-snug"
                      >
                        {item.courseName}
                      </h2>
                      <div className="flex items-start gap-2 mt-2 font-body-sm text-body-sm text-on-surface-variant">
                        <span className="material-symbols-outlined text-secondary text-[18px] shrink-0 mt-0.5">
                          schedule
                        </span>
                        <span>
                          {item.day}, {item.time} • {item.room}
                        </span>
                      </div>
                    </div>

                    {/* Operational Summary Row */}
                    <div className="grid grid-cols-3 gap-2 p-2.5 rounded-lg bg-surface-container-high text-center">
                      <div className="flex flex-col items-center">
                        <span className="font-headline-md text-headline-md text-on-surface font-bold leading-none">
                          {item.meetingsCount}
                        </span>
                        <span className="font-caption text-caption text-outline mt-1">Pertemuan</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <span className="font-headline-md text-headline-md text-primary font-bold leading-none">
                          {item.publishedMaterials}
                        </span>
                        <span className="font-caption text-caption text-outline mt-1">Materi Terbit</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <span
                          className={`font-headline-md text-headline-md font-bold leading-none ${
                            item.enrolledStudents >= item.capacity
                              ? 'text-secondary'
                              : 'text-on-surface'
                          }`}
                        >
                          {item.enrolledStudents}
                          <span className="font-body-sm text-body-sm text-outline">
                            /{item.capacity}
                          </span>
                        </span>
                        <span className="font-caption text-caption text-outline mt-1">
                          {item.enrolledStudents >= item.capacity ? (
                            <span className="text-secondary font-semibold">Penuh</span>
                          ) : (
                            'Mahasiswa'
                          )}
                        </span>
                      </div>
                    </div>

                    {/* Operational Status Badges */}
                    <div className="flex flex-col gap-2 pt-1">
                      {item.attendanceStatus === 'active' ? (
                        <button
                          type="button"
                          onClick={() => onNavigate && onNavigate(`kelola-kelas?course=${item.courseId}`)}
                          title="Presensi aktif — klik untuk menuju sesi perkuliahan"
                          className="w-full text-left inline-flex items-center justify-between px-3 py-1.5 rounded-lg bg-tertiary-container/20 hover:bg-tertiary-container/30 text-tertiary font-label-sm text-label-sm transition-colors cursor-pointer"
                        >
                          <div className="flex items-center gap-2">
                            <span className="relative flex h-2 w-2">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-tertiary opacity-75" />
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-tertiary" />
                            </span>
                            <span>{item.attendanceLabel}</span>
                          </div>
                          <span className="font-caption text-caption font-semibold">
                            {item.attendanceNote}
                          </span>
                        </button>
                      ) : (
                        <div className="inline-flex items-center justify-between px-3 py-1.5 rounded-lg bg-surface-container text-on-surface-variant font-label-sm text-label-sm">
                          <div className="flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-[16px] text-outline">
                              lock_clock
                            </span>
                            <span>{item.attendanceLabel}</span>
                          </div>
                          <span className="font-caption text-caption text-outline">
                            {item.attendanceNote}
                          </span>
                        </div>
                      )}

                      {item.pendingGradingCount > 0 ? (
                        <button
                          type="button"
                          onClick={() => onNavigate && onNavigate('pemeriksaan-tugas')}
                          title="Buka Pemeriksaan Tugas Dosen"
                          className="w-full text-left inline-flex items-center justify-between px-3 py-1.5 rounded-lg bg-error-container/30 hover:bg-error-container/45 text-error font-label-sm text-label-sm transition-colors cursor-pointer"
                        >
                          <div className="flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-[16px]">
                              pending_actions
                            </span>
                            <span>{item.pendingGradingCount} Butuh Dinilai</span>
                          </div>
                          <span className="font-caption text-caption underline decoration-dotted font-medium">
                            {item.pendingGradingTask}
                          </span>
                        </button>
                      ) : (
                        <div className="inline-flex items-center justify-between px-3 py-1.5 rounded-lg bg-surface-container-high text-outline font-label-sm text-label-sm">
                          <div className="flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-[16px] text-tertiary">
                              check_circle
                            </span>
                            <span className="text-on-surface-variant">0 Tugas Menunggu</span>
                          </div>
                          <span className="font-caption text-caption text-tertiary font-semibold">
                            Semua Dinilai
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Footer Actions */}
                  <div className="mt-5 pt-3 flex items-center gap-2 border-t border-outline-variant/10">
                    <button
                      type="button"
                      onClick={() => {
                        if (onNavigate) {
                          onNavigate(`kelola-kelas?course=${item.courseId}`);
                        } else {
                          setModalManageClass(item);
                        }
                      }}
                      className="flex-1 py-2.5 px-4 rounded-lg bg-primary text-on-primary hover:bg-primary-hover transition-colors font-label-md text-label-md text-center inline-flex items-center justify-center gap-1.5 shadow-sm font-semibold cursor-pointer"
                    >
                      <span>Kelola Ruang Kelas</span>
                      <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setModalManageClass(item)}
                      title={`Ringkasan Cepat Kelas ${item.courseName}`}
                      aria-label={`Ringkasan Cepat Kelas ${item.courseName}`}
                      className="p-2.5 rounded-lg bg-surface-container-high hover:bg-surface-bright text-on-surface transition-colors cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[18px]">info</span>
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}

          {/* Quick Summary Footer Info */}
          <div className="p-space-md rounded-xl bg-surface-container-low flex flex-col sm:flex-row items-center justify-between gap-space-sm font-body-sm text-body-sm text-on-surface-variant">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[20px]">info</span>
              <span>
                Perlu membuka kelas tambahan atau pertukaran jadwal? Hubungi BAAK Fakultas Teknik.
              </span>
            </div>
            <div className="flex items-center gap-4 text-on-surface">
              <span>
                Total Beban: <strong className="text-tertiary">{totalSKS} SKS</strong>
              </span>
              <span>
                Total Mahasiswa: <strong className="text-secondary">{totalStudents} Orang</strong>
              </span>
            </div>
          </div>
        </div>

        {/* ── MODAL: Agenda Mengajar Hari Ini ── */}
        {modalAgendaOpen && (
          <div
            className="fixed inset-0 z-[100] bg-overlay backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setModalAgendaOpen(false)}
          >
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="modal-agenda-title"
              className="bg-surface-container-low border border-outline-variant/30 rounded-2xl max-w-lg w-full p-6 shadow-2xl"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="flex items-center justify-between pb-4 border-b border-outline-variant/15">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-secondary text-[24px]">today</span>
                  <h3
                    id="modal-agenda-title"
                    className="font-title-lg text-title-lg text-on-surface font-bold"
                  >
                    Agenda Mengajar Hari Ini
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setModalAgendaOpen(false)}
                  aria-label="Tutup dialog"
                  className="p-1 rounded-lg text-outline hover:text-on-surface hover:bg-surface-container transition-colors"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
              <div className="py-4 space-y-3 font-body-sm text-body-sm text-on-surface-variant">
                <div
                  onClick={() => {
                    setModalAgendaOpen(false);
                    if (onNavigate) onNavigate('kelola-kelas?course=rpl-ti-a');
                  }}
                  className="p-3 rounded-lg bg-surface-container border-l-4 border-primary hover:bg-surface-bright cursor-pointer transition-colors"
                  title="Buka kelola perkuliahan Rekayasa Perangkat Lunak (TI-A)"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[11px] font-bold text-primary">
                      TI-A • SENIN
                    </span>
                    <span className="px-2 py-0.5 rounded bg-tertiary-container/30 text-tertiary font-caption font-semibold">
                      Sedang Berlangsung
                    </span>
                  </div>
                  <div className="font-title-md text-title-md text-on-surface font-semibold mt-1">
                    Rekayasa Perangkat Lunak
                  </div>
                  <div className="text-outline text-caption mt-0.5">
                    08:00 - 10:30 WIB • Lab Komputasi 3 (Gedung B Lt. 3)
                  </div>
                </div>
                <div
                  onClick={() => {
                    setModalAgendaOpen(false);
                    if (onNavigate) onNavigate('kelola-kelas?course=pwl-ti-b');
                  }}
                  className="p-3 rounded-lg bg-surface-container-high hover:bg-surface-bright opacity-85 hover:opacity-100 cursor-pointer transition-all"
                  title="Buka kelola perkuliahan Pemrograman Web Lanjut (TI-B)"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[11px] text-outline">TI-B • RABU</span>
                    <span className="font-caption text-outline">Mendatang</span>
                  </div>
                  <div className="font-body-md text-on-surface font-medium mt-1">
                    Pemrograman Web Lanjut (10:30 - 13:00 WIB)
                  </div>
                  <div className="text-outline text-caption">Ruang Teori 402</div>
                </div>
              </div>
              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => setModalAgendaOpen(false)}
                  className="px-4 py-2 rounded-lg bg-primary text-on-primary font-label-md cursor-pointer"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── MODAL: Kelola Ruang Kelas ── */}
        {modalManageClass && (
          <div
            className="fixed inset-0 z-[100] bg-overlay backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setModalManageClass(null)}
          >
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="modal-kelola-title"
              className="bg-surface-container-low border border-outline-variant/30 rounded-2xl max-w-xl w-full p-6 shadow-2xl"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="flex items-center justify-between pb-4 border-b border-outline-variant/15">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded font-mono font-bold text-xs bg-primary-container text-on-primary-container">
                      {modalManageClass.code}
                    </span>
                    <h3
                      id="modal-kelola-title"
                      className="font-title-lg text-title-lg text-on-surface font-bold"
                    >
                      {modalManageClass.courseName}
                    </h3>
                  </div>
                  <p className="font-caption text-caption text-on-surface-variant mt-1">
                    {modalManageClass.day}, {modalManageClass.time} • {modalManageClass.room}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setModalManageClass(null)}
                  aria-label="Tutup dialog"
                  className="p-1 rounded-lg text-outline hover:text-on-surface hover:bg-surface-container transition-colors"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              <div className="py-4 space-y-3 font-body-sm text-body-sm">
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-surface-container rounded-lg">
                    <span className="font-caption text-outline">Total Mahasiswa Terdaftar</span>
                    <div className="font-headline-md text-headline-md text-on-surface font-bold mt-1">
                      {modalManageClass.enrolledStudents}/{modalManageClass.capacity}
                    </div>
                  </div>
                  <div className="p-3 bg-surface-container rounded-lg">
                    <span className="font-caption text-outline">Status Presensi Pertemuan 3</span>
                    <div className="font-title-md text-title-md text-tertiary font-bold mt-1">
                      {modalManageClass.attendanceStatus === 'active' ? 'Aktif' : 'Ditutup'}
                    </div>
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  <h4 className="font-label-md text-label-md text-on-surface font-semibold">
                    Tindakan Cepat Kelas
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        handleTogglePresensi(modalManageClass.id);
                        setModalManageClass(null);
                      }}
                      className="p-3 rounded-lg bg-surface-container-high hover:bg-surface-bright flex items-center gap-2.5 text-left transition-colors cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-tertiary">how_to_reg</span>
                      <div>
                        <div className="font-label-sm text-on-surface font-medium">
                          {modalManageClass.attendanceStatus === 'active'
                            ? 'Tutup Sesi Presensi'
                            : 'Buka Presensi Kelas'}
                        </div>
                        <div className="font-caption text-outline">Kode QR & PIN Mandiri</div>
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const targetId = modalManageClass.courseId;
                        setModalManageClass(null);
                        if (onNavigate) onNavigate(`kelola-kelas?course=${targetId}`);
                      }}
                      className="p-3 rounded-lg bg-surface-container-high hover:bg-surface-bright flex items-center gap-2.5 text-left transition-colors cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-primary">fact_check</span>
                      <div>
                        <div className="font-label-sm text-on-surface font-medium">
                          Kelola 16 Pertemuan
                        </div>
                        <div className="font-caption text-outline">Silabus OBE & Presensi Sesi</div>
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setModalManageClass(null);
                        if (onNavigate) onNavigate('unggah-materi');
                      }}
                      className="p-3 rounded-lg bg-surface-container-high hover:bg-surface-bright flex items-center gap-2.5 text-left transition-colors cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-primary">upload_file</span>
                      <div>
                        <div className="font-label-sm text-on-surface font-medium">
                          Unggah Materi Ajar
                        </div>
                        <div className="font-caption text-outline">Modul, PPT, & Silabus RPS</div>
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setModalManageClass(null);
                        if (onNavigate) onNavigate('pemeriksaan-tugas');
                      }}
                      className="p-3 rounded-lg bg-surface-container-high hover:bg-surface-bright flex items-center gap-2.5 text-left transition-colors cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-secondary">assignment_turned_in</span>
                      <div>
                        <div className="font-label-sm text-on-surface font-medium">
                          Pemeriksaan Tugas
                        </div>
                        <div className="font-caption text-outline">Penilaian tugas & kuis</div>
                      </div>
                    </button>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex flex-wrap items-center justify-end gap-2 border-t border-outline-variant/15">
                <button
                  type="button"
                  onClick={() => setModalManageClass(null)}
                  className="px-4 py-2 rounded-lg bg-surface-container-high text-on-surface font-label-md cursor-pointer"
                >
                  Tutup
                </button>
                <button
                  type="button"
                  onClick={() => handleEnterStudentRoom(modalManageClass)}
                  className="px-3.5 py-2 rounded-lg bg-surface-container-high hover:bg-surface-bright text-on-surface font-label-md inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Lihat modul dan materi dari sudut pandang mahasiswa"
                >
                  <span className="material-symbols-outlined text-[18px]">visibility</span>
                  <span>Tinjau Mahasiswa</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleEnterManageClass(modalManageClass)}
                  className="px-4 py-2 rounded-lg bg-primary text-on-primary hover:bg-primary-fixed font-label-md font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">settings</span>
                  <span>Kelola Ruang Kelas</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── MODAL: Hubungi Operator Prodi ── */}
        {modalProdiOpen && (
          <div
            className="fixed inset-0 z-[100] bg-overlay backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setModalProdiOpen(false)}
          >
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="modal-prodi-title"
              className="bg-surface-container-low border border-outline-variant/30 rounded-2xl max-w-md w-full p-6 shadow-2xl"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="flex items-center justify-between pb-3 border-b border-outline-variant/15">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">contact_support</span>
                  <h3
                    id="modal-prodi-title"
                    className="font-title-lg text-title-lg text-on-surface font-bold"
                  >
                    Kontak Operator Prodi
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setModalProdiOpen(false)}
                  aria-label="Tutup dialog"
                  className="p-1 rounded text-outline hover:text-on-surface"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
              <div className="py-4 space-y-3 font-body-sm text-body-sm text-on-surface-variant">
                <p>
                  Jika penugasan kelas Anda belum muncul di SPADA LMS, silakan verifikasi SK
                  Mengajar pada operator:
                </p>
                <div className="p-3 rounded-lg bg-surface-container space-y-1">
                  <div className="font-label-md text-on-surface font-semibold">
                    BAAK Fakultas Teknik Informatika UPGRIS
                  </div>
                  <div>Gedung B Lt. 2 • Telp: (024) 87654321 ext 204</div>
                  <div className="text-secondary">Email: prodi-ti@upgris.ac.id</div>
                </div>
              </div>
              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => setModalProdiOpen(false)}
                  className="px-4 py-2 rounded-lg bg-primary text-on-primary font-label-md"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}