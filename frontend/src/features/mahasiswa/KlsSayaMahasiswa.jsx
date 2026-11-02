import React, { useState, useMemo } from 'react';
import AppShell from '../../components/AppShell';
import { courseCatalog } from '../../data/courseCatalog';

/**
 * KlsSayaMahasiswa — Feature Component
 * Menampilkan daftar kelas perkuliahan aktif yang dienroll untuk Mahasiswa.
 * Berdasarkan desain kls_saya_mahasiswa.html (MVP 2).
 */
export default function KlsSayaMahasiswa({ onNavigate, onRoleChange }) {
  const [selectedSemester, setSelectedSemester] = useState('2026-ganjil');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const classes = useMemo(
    () =>
      courseCatalog.map((course) => ({
        id: course.id,
        code: course.code,
        className: course.classGroup,
        title: course.name,
        sks: course.sks,
        schedule: course.schedule,
        lecturer: {
          name: course.lecturer,
          nidn: course.nidn,
          avatar: course.avatar,
        },
        currentMeeting: course.currentMeeting,
        totalMeetings: course.totalMeetings,
        progressPct: course.meetingProgressPct,
        attendanceActive: course.attendanceActive,
        attendanceDeadline: course.attendanceDeadline,
        materialsCount: course.materialsCount,
        activeTasks: course.activeTasks,
      })),
    []
  );

  const totalSks = useMemo(() => classes.reduce((sum, cls) => sum + cls.sks, 0), [classes]);

  const filteredClasses = useMemo(() => {
    return classes.filter((cls) => {
      const matchSearch =
        cls.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cls.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cls.lecturer.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchSearch;
    });
  }, [classes, searchQuery]);

  return (
    <AppShell
      activeRole="mahasiswa"
      onRoleChange={onRoleChange}
      activeNavPath="kelas-saya"
      onNavChange={onNavigate}
    >
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-surface-container-highest text-on-surface px-4 py-3 rounded-xl shadow-2xl border border-primary/30">
          <span className="material-symbols-outlined text-primary text-[20px]">check_circle</span>
          <span className="font-label-md text-sm">{toastMessage}</span>
        </div>
      )}

      {/* Main Container */}
      <div className="flex flex-col w-full space-y-space-md">
        {/* Breadcrumb & Context Banner */}
        <div className="flex flex-wrap items-center justify-between gap-space-sm">
          <nav className="flex items-center gap-2 font-body-sm text-body-sm text-outline">
            <button
              onClick={() => onNavigate && onNavigate('dasbor-mahasiswa')}
              className="hover:text-primary transition-colors flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-[16px]">home</span>
              Dasbor
            </button>
            <span>/</span>
            <span className="text-secondary font-label-sm font-semibold">Kelas Saya</span>
          </nav>
          <div className="flex items-center gap-space-sm bg-surface-container-high/80 px-3 py-1.5 rounded-lg shadow-sm">
            <span className="w-2 h-2 rounded-full bg-tertiary animate-pulse"></span>
            <span className="font-caption text-caption text-on-surface-variant font-mono">
              DIRECT ENROLLMENT AKTIF
            </span>
            <span className="text-outline">|</span>
            <span className="font-label-sm text-label-sm text-secondary">NIM: 2024001001</span>
          </div>
        </div>

        {/* Page Hero Header */}
        <section className="bg-surface-container-low rounded-xl p-space-lg shadow-xl relative overflow-hidden border border-outline-variant/20">
          <div className="absolute -right-16 -top-16 w-80 h-80 rounded-full bg-primary/5 blur-3xl pointer-events-none"></div>
          <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-space-md">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-label-sm text-label-sm bg-primary-container text-on-primary-container px-2.5 py-0.5 rounded font-bold">
                  PORTAL MAHASISWA
                </span>
                <span className="font-label-sm text-label-sm bg-surface-container-highest text-secondary px-2.5 py-0.5 rounded">
                  {classes.length} Kelas Aktif ({totalSks} SKS)
                </span>
              </div>
              <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight font-bold">
                Kelas Perkuliahan Saya
              </h1>
              <p className="font-body-md text-body-md text-on-surface-variant mt-1">
                Daftar ruang kelas perkuliahan semester berjalan yang terdaftar secara resmi di SPADA UPGRIS.
              </p>
            </div>

            {/* Quick action to attendance */}
            <button
              type="button"
              onClick={() => onNavigate && onNavigate('status-presensi')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-tertiary-container/30 text-tertiary hover:bg-tertiary-container/50 border border-tertiary/30 font-label-md text-label-md transition-all self-start md:self-auto"
            >
              <span className="material-symbols-outlined text-[20px]">how_to_reg</span>
              <span>Cek Status Presensi</span>
            </button>
          </div>
        </section>

        {/* Filter Bar & Controls */}
        <div className="bg-surface-container-low rounded-xl p-space-md flex flex-wrap items-center justify-between gap-space-md shadow-sm border border-outline-variant/20">
          <div className="flex flex-wrap items-center gap-space-sm flex-1">
            {/* Semester Dropdown */}
            <div className="relative min-w-[220px]">
              <select
                value={selectedSemester}
                onChange={(e) => setSelectedSemester(e.target.value)}
                className="w-full appearance-none bg-surface-container text-on-surface font-label-md text-label-md pl-3 pr-9 py-2 rounded-lg cursor-pointer focus:outline-none focus:ring-1 focus:ring-primary transition-all border border-outline-variant/30"
              >
                <option value="2026-ganjil">Semester Ganjil 2026/2027 (Aktif)</option>
                <option value="2025-genap">Semester Genap 2025/2026</option>
                <option value="2025-ganjil">Semester Ganjil 2025/2026</option>
              </select>
              <span className="material-symbols-outlined pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">
                expand_more
              </span>
            </div>

            {/* Search Input */}
            <div className="relative flex items-center min-w-[240px] max-w-sm flex-1">
              <span className="material-symbols-outlined absolute left-3 text-outline text-[18px]">
                search
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari mata kuliah, kode, atau dosen..."
                className="w-full bg-surface-container text-on-surface font-body-sm text-body-sm pl-9 pr-3 py-2 rounded-lg placeholder:text-outline focus:outline-none focus:ring-1 focus:ring-primary transition-all border border-outline-variant/30"
              />
            </div>
          </div>

          {/* View Toggle */}
          <div className="flex items-center bg-surface-container p-1 rounded-lg border border-outline-variant/20">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded transition-all ${
                viewMode === 'grid'
                  ? 'bg-primary-container text-on-primary-container shadow-sm'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
              title="Tampilan Kisi"
            >
              <span className="material-symbols-outlined text-[18px] block">grid_view</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded transition-all ${
                viewMode === 'list'
                  ? 'bg-primary-container text-on-primary-container shadow-sm'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
              title="Tampilan Senarai"
            >
              <span className="material-symbols-outlined text-[18px] block">view_list</span>
            </button>
          </div>
        </div>

        {/* Classes Container */}
        {filteredClasses.length === 0 ? (
          <div className="bg-surface-container-low rounded-xl p-12 text-center border border-outline-variant/20">
            <span className="material-symbols-outlined text-outline text-[48px] mb-2 block">
              search_off
            </span>
            <h3 className="font-title-md text-title-md text-on-surface font-semibold">
              Tidak ada kelas ditemukan
            </h3>
            <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
              Silakan periksa kata kunci pencarian atau ganti filter semester Anda.
            </p>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 w-full">
            {filteredClasses.map((cls) => (
              <div
                key={cls.id}
                className="bg-surface-container-low rounded-2xl p-6 shadow-xl flex flex-col justify-between border border-outline-variant/20 transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 group"
              >
                <div className="flex flex-col gap-4">
                  {/* Top Badges */}
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold px-3 py-1 rounded-full bg-primary-container/30 text-primary">
                      {cls.className}
                    </span>
                    <span className="font-label-sm text-xs font-semibold px-2.5 py-1 rounded-full bg-surface-container-highest text-on-surface-variant">
                      {cls.sks} SKS • {cls.code}
                    </span>
                  </div>

                  {/* Course Title & Schedule */}
                  <div className="flex flex-col gap-1">
                    <h2
                      onClick={() => onNavigate && onNavigate(`ruang-kelas?course=${cls.id}`)}
                      className="font-title-lg text-[18px] font-semibold text-on-surface leading-snug line-clamp-1 group-hover:text-primary cursor-pointer transition-colors"
                    >
                      {cls.title}
                    </h2>
                    <div className="flex items-center gap-1.5 text-xs text-on-surface-variant font-medium">
                      <span className="material-symbols-outlined text-[15px] text-primary">schedule</span>
                      <span className="truncate">{cls.schedule}</span>
                    </div>
                  </div>

                  {/* Lecturer Profile */}
                  <div className="flex items-center gap-3 p-2.5 rounded-xl bg-surface-container border border-outline-variant/20">
                    <div className="w-10 h-10 rounded-full bg-primary-container/20 text-primary flex items-center justify-center font-bold font-title-md shrink-0">
                      <span className="material-symbols-outlined text-[20px]">person</span>
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-sm font-semibold text-on-surface truncate">
                        {cls.lecturer.name}
                      </span>
                      <span className="text-xs text-on-surface-variant font-mono">
                        NIDN: {cls.lecturer.nidn}
                      </span>
                    </div>
                  </div>

                  {/* Progress Block */}
                  <div className="flex flex-col gap-1.5 pt-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-on-surface-variant">Progres Perkuliahan</span>
                      <span className="font-semibold text-on-surface font-mono">
                        {cls.currentMeeting} dari {cls.totalMeetings} pertemuan ({cls.progressPct}%)
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-surface-container-highest overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all duration-500"
                        style={{ width: `${cls.progressPct}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Status & Activity Indicators */}
                  <div className="flex flex-col gap-2 pt-1">
                    {cls.attendanceActive ? (
                      <div className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-tertiary-container/20 border border-tertiary/30">
                        <div className="flex items-center gap-2">
                          <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-tertiary opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-tertiary"></span>
                          </span>
                          <span className="text-xs font-semibold text-tertiary">Sesi Presensi Aktif</span>
                        </div>
                        <span className="text-[11px] font-medium text-tertiary">{cls.attendanceDeadline}</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-surface-container text-on-surface-variant text-xs">
                        <div className="flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-[16px]">schedule</span>
                          <span>Presensi Terjadwal</span>
                        </div>
                        <span className="font-caption">{cls.attendanceDeadline}</span>
                      </div>
                    )}

                    {/* Materials & Tasks Count */}
                    <div className="grid grid-cols-2 gap-2 text-xs text-on-surface-variant">
                      <div className="flex items-center gap-1.5 py-1.5 px-2 rounded-lg bg-surface-container">
                        <span className="material-symbols-outlined text-[16px] text-primary">description</span>
                        <span className="font-medium">{cls.materialsCount} Materi</span>
                      </div>
                      <div className="flex items-center gap-1.5 py-1.5 px-2 rounded-lg bg-surface-container">
                        <span className="material-symbols-outlined text-[16px] text-secondary">assignment</span>
                        <span className="font-medium">{cls.activeTasks} Tugas Aktif</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Button */}
                <div className="pt-5 mt-2">
                  <button
                    type="button"
                    onClick={() => onNavigate && onNavigate(`ruang-kelas?course=${cls.id}`)}
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-primary text-on-primary font-medium text-sm transition-all duration-200 shadow-md hover:bg-primary-fixed hover:text-on-primary-fixed active:scale-[0.99]"
                  >
                    <span>Buka Ruang Kelas</span>
                    <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* List View */
          <div className="space-y-3">
            {filteredClasses.map((cls) => (
              <div
                key={cls.id}
                className="bg-surface-container-low rounded-xl p-4 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4 border border-outline-variant/20 hover:border-primary/40 transition-all"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-12 h-12 rounded-xl bg-primary-container/20 text-primary flex items-center justify-center font-bold shrink-0">
                    <span className="material-symbols-outlined text-[24px]">school</span>
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-title-md text-title-md text-on-surface font-semibold truncate">
                        {cls.title}
                      </h3>
                      <span className="font-mono text-xs px-2 py-0.5 rounded bg-primary-container/30 text-primary font-bold">
                        {cls.className}
                      </span>
                      <span className="text-xs text-outline font-mono">{cls.code}</span>
                    </div>
                    <p className="font-body-sm text-body-sm text-on-surface-variant flex items-center gap-2 mt-0.5">
                      <span>{cls.lecturer.name}</span>
                      <span>•</span>
                      <span>{cls.schedule}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end md:self-center shrink-0">
                  <div className="text-right hidden sm:block">
                    <span className="text-xs text-on-surface font-semibold block font-mono">
                      {cls.currentMeeting}/16 Pertemuan
                    </span>
                    <span className="text-caption text-outline">
                      {cls.materialsCount} Materi • {cls.activeTasks} Tugas
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => onNavigate && onNavigate(`ruang-kelas?course=${cls.id}`)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-on-primary font-label-md text-label-md hover:bg-primary-fixed hover:text-on-primary-fixed transition-colors"
                  >
                    <span>Masuk Kelas</span>
                    <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
