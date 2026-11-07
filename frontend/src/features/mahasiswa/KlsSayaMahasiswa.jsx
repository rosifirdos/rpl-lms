import React, { useState, useMemo, useEffect, useRef } from 'react';
import AppShell from '../../components/AppShell';
import { courseCatalog } from '../../data/courseCatalog';

/**
 * KlsSayaMahasiswa — Komponen React Kelas Perkuliahan Saya (Mahasiswa)
 * Menggunakan katalog terpusat courseCatalog (konsisten dengan Dashboard & Ruang Kelas),
 * mendukung filter pencarian, filter semester, tata letak grid/list, dan
 * navigasi ruang kelas per mata kuliah.
 */
export default function KlsSayaMahasiswa({ onNavigate, onRoleChange }) {
  // State interaktif
  const [layoutMode, setLayoutMode] = useState('grid'); // 'grid' | 'list'
  const [selectedSemester, setSelectedSemester] = useState(null); // null = semester terbaru
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMessage, setToastMessage] = useState(null);

  const toastTimeoutRef = useRef(null);

  // Bersihkan timer saat unmount agar tidak ada setState setelah komponen lepas.
  useEffect(() => () => clearTimeout(toastTimeoutRef.current), []);

  const showToast = (msg) => {
    clearTimeout(toastTimeoutRef.current);
    setToastMessage(msg);
    toastTimeoutRef.current = setTimeout(() => {
      setToastMessage(null);
      toastTimeoutRef.current = null;
    }, 3500);
  };

  // Sumber data kelas terpusat dari courseCatalog
  const classes = useMemo(
    () =>
      courseCatalog.map((course) => ({
        id: course.id,
        code: course.code,
        className: course.classGroup,
        title: course.name,
        semester: course.semester,
        sks: `${course.sks} SKS`,
        sksNumber: course.sks,
        schedule: course.schedule,
        lecturer: {
          name: course.lecturer,
          nidn: `NIDN: ${course.nidn}`,
        },
        progress: {
          current: course.currentMeeting,
          total: course.totalMeetings,
          percentage: course.meetingProgressPct,
        },
        attendance: {
          status: course.attendanceActive ? 'active' : 'inactive',
          label: course.attendanceActive ? 'Sesi Presensi Aktif' : 'Presensi Terjadwal',
          sublabel: course.attendanceDeadline,
        },
        materialsCount: course.materialsCount,
        activeTasks: course.activeTasks,
      })),
    []
  );

  // Pilihan semester diturunkan dari katalog agar label opsi tidak pernah
  // menyimpang dari data yang benar-benar dimiliki mahasiswa.
  const titleCaseSemester = (value) =>
    value
      .toLowerCase()
      .split(' ')
      .map((word) => (word ? word.charAt(0).toUpperCase() + word.slice(1) : word))
      .join(' ');

  const semesterOptions = useMemo(() => {
    const seen = new Map();
    classes.forEach((item) => {
      const value = item.semester.toLowerCase().replace(/\s+/g, '-');
      if (!seen.has(value)) seen.set(value, titleCaseSemester(item.semester));
    });
    return Array.from(seen, ([value, label]) => ({ value, label }));
  }, [classes]);

  // Filter kelas berdasarkan semester terpilih, lalu pencarian nama mata
  // kuliah, kode kelas, atau dosen. Opsi "semua" menampilkan seluruh kelas.
  const activeSemester = selectedSemester || (semesterOptions[0] ? semesterOptions[0].value : null);

  const filteredClasses = useMemo(() => {
    const bySemester =
      activeSemester && activeSemester !== 'semua'
        ? classes.filter((item) => item.semester.toLowerCase().replace(/\s+/g, '-') === activeSemester)
        : classes;
    if (!searchQuery.trim()) return bySemester;
    const q = searchQuery.toLowerCase();
    return bySemester.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.code.toLowerCase().includes(q) ||
        item.className.toLowerCase().includes(q) ||
        item.lecturer.name.toLowerCase().includes(q)
    );
  }, [classes, searchQuery, activeSemester]);

  const filteredSks = useMemo(
    () => filteredClasses.reduce((sum, cls) => sum + cls.sksNumber, 0),
    [filteredClasses]
  );

  const handleOpenRoom = (courseId) => {
    if (onNavigate) {
      onNavigate(`ruang-kelas?course=${courseId}`);
    } else {
      showToast(`Membuka ruang kelas ${courseId}...`);
    }
  };

  return (
    <AppShell
      activeRole="mahasiswa"
      onRoleChange={onRoleChange}
      activeNavPath="kelas-saya-mahasiswa"
      onNavChange={onNavigate}
    >
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-surface-container-highest text-on-surface px-4 py-3 rounded-xl shadow-2xl border border-primary/40"
          role="status"
          aria-live="polite"
        >
          <span className="material-symbols-outlined text-primary text-[20px]">info</span>
          <span className="font-label-md text-sm">{toastMessage}</span>
        </div>
      )}

      <div className="flex flex-col w-full pb-16">
        {/* BREADCRUMBS & CONTEXT PATHWAY */}
        <div className="flex items-center gap-space-xs text-on-surface-variant font-label-sm text-label-sm mb-space-sm pt-space-xs">
          <button
            type="button"
            onClick={() => onNavigate && onNavigate('dasbor-mahasiswa')}
            className="flex items-center gap-1 hover:text-primary transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">home</span>
            <span>Dasbor</span>
          </button>
          <span className="material-symbols-outlined text-[14px] text-outline">chevron_right</span>
          <span className="text-on-surface font-semibold">Kelas Saya</span>
        </div>

        {/* PAGE HERO HEADER & CONTROLS */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-space-md mb-space-lg">
          <div className="flex flex-col gap-1 max-w-xl">
            <div className="flex items-center gap-space-sm flex-wrap">
              <h1 className="font-headline-md text-headline-md text-on-surface tracking-tight font-bold">
                Kelas Perkuliahan Saya
              </h1>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-primary-container text-on-primary-container font-label-sm text-label-sm font-bold">
                {filteredClasses.length} Kelas ({filteredSks} SKS)
              </span>
            </div>
            <p className="font-body-md text-body-md text-on-surface-variant">
              Semester Ganjil 2026/2027 • Seluruh kelas terdaftar berdasarkan direct enrollment akademik
            </p>
          </div>

          {/* Filter & Controls Toolbar */}
          <div className="flex flex-wrap items-center gap-space-sm">
            {/* Semester Dropdown Selector */}
            <div className="relative min-w-[210px]">
              <select
                value={activeSemester || ''}
                onChange={(e) => setSelectedSemester(e.target.value)}
                aria-label="Pilih semester"
                className="w-full appearance-none bg-surface-container-low text-on-surface font-label-md text-label-md pl-3 pr-9 py-2 rounded-lg cursor-pointer focus:outline-none focus:bg-surface-container transition-all border border-outline-variant/20"
              >
                <option value="semua">Semua Semester</option>
                {semesterOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <span className="material-symbols-outlined pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">
                expand_more
              </span>
            </div>

            {/* Search Input */}
            <div className="relative flex items-center min-w-[240px] max-w-xs flex-1">
              <span className="material-symbols-outlined absolute left-3 text-outline text-[18px]">
                search
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari mata kuliah atau dosen..."
                className="w-full bg-surface-container-low text-on-surface font-body-sm text-body-sm pl-9 pr-3 py-2 rounded-lg placeholder-outline focus:outline-none focus:bg-surface-container transition-all border border-outline-variant/20"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 text-outline hover:text-on-surface"
                >
                  <span className="material-symbols-outlined text-[16px]">close</span>
                </button>
              )}
            </div>

            {/* Layout View Toggle */}
            <div className="flex items-center bg-surface-container-low p-1 rounded-lg border border-outline-variant/20">
              <button
                type="button"
                onClick={() => setLayoutMode('grid')}
                aria-label="Tampilan Kisi"
                className={`p-1.5 rounded transition-all cursor-pointer ${
                  layoutMode === 'grid'
                    ? 'bg-primary-container text-on-primary-container shadow-sm'
                    : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
                }`}
              >
                <span className="material-symbols-outlined text-[18px] block">grid_view</span>
              </button>
              <button
                type="button"
                onClick={() => setLayoutMode('list')}
                aria-label="Tampilan Senarai"
                className={`p-1.5 rounded transition-all cursor-pointer ${
                  layoutMode === 'list'
                    ? 'bg-primary-container text-on-primary-container shadow-sm'
                    : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
                }`}
              >
                <span className="material-symbols-outlined text-[18px] block">view_list</span>
              </button>
            </div>
          </div>
        </div>

        {/* DAFTAR KELAS */}
        {filteredClasses.length === 0 ? (
              <div className="w-full py-16 px-6 bg-surface-container-low rounded-3xl text-center">
                <span className="material-symbols-outlined text-outline text-[48px] mb-2 block">
                  search_off
                </span>
                <h3 className="font-title-lg text-on-surface font-semibold mb-1">
                  Tidak ada kelas yang cocok
                </h3>
                <p className="font-body-md text-on-surface-variant max-w-md mx-auto mb-4">
                  {searchQuery.trim()
                    ? `Tidak ditemukan hasil untuk kata kunci "${searchQuery}". Silakan coba kata kunci lain.`
                    : 'Tidak ada kelas terdaftar pada semester yang dipilih. Sesuai kebijakan BR-002, seluruh enrollment dilakukan secara terpusat oleh Biro Akademik.'}
                </p>
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="px-4 py-2 rounded-lg bg-surface-container-high text-on-surface hover:bg-surface-bright font-label-md text-sm transition-colors cursor-pointer"
                >
                  Reset Pencarian
                </button>
              </div>
            ) : layoutMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 w-full" id="state-normal">
                {filteredClasses.map((item) => (
                  <div
                    key={item.id}
                    className="bg-surface-container rounded-2xl p-6 shadow-xl flex flex-col justify-between transition-transform duration-300 hover:-translate-y-1 border border-outline-variant/20 hover:border-primary/40 group"
                  >
                    <div className="flex flex-col gap-4">
                      {/* Top Tags Row */}
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-bold px-3 py-1 rounded-full bg-primary-container text-on-primary-container">
                          {item.className} • {item.code}
                        </span>
                        <span className="font-label-sm text-xs font-semibold px-2.5 py-1 rounded-full bg-surface-container-high text-on-surface-variant">
                          {item.sks}
                        </span>
                      </div>

                      {/* Course Title */}
                      <div className="flex flex-col gap-1">
                        <h2
                          onClick={() => handleOpenRoom(item.id)}
                          className="font-title-lg text-[18px] font-bold text-on-surface leading-snug line-clamp-1 group-hover:text-primary cursor-pointer transition-colors"
                        >
                          {item.title}
                        </h2>
                        <div className="flex items-center gap-1.5 text-xs text-on-surface-variant font-medium">
                          <span className="material-symbols-outlined text-[15px] text-primary">
                            schedule
                          </span>
                          <span className="truncate">{item.schedule}</span>
                        </div>
                      </div>

                      {/* Lecturer Info Profile */}
                      <div className="flex items-center gap-3 p-2.5 rounded-xl bg-surface-container-low border border-outline-variant/20">
                        <span
                          className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0"
                          aria-hidden="true"
                        >
                          <span className="material-symbols-outlined text-[22px]">person</span>
                        </span>
                        <div className="flex flex-col min-w-0">
                          <span className="text-sm font-semibold text-on-surface truncate">
                            {item.lecturer.name}
                          </span>
                          <span className="text-xs text-on-surface-variant font-mono tracking-tight">
                            {item.lecturer.nidn}
                          </span>
                        </div>
                      </div>

                      {/* Progress Block */}
                      <div className="flex flex-col gap-1.5 pt-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-medium text-on-surface-variant">Progres Pertemuan</span>
                          <span className="font-semibold text-on-surface font-mono">
                            {item.progress.current} dari {item.progress.total} pertemuan ({item.progress.percentage}%)
                          </span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-surface-container-highest overflow-hidden">
                          <div
                            className="h-full bg-primary rounded-full transition-all duration-500"
                            style={{ width: `${item.progress.percentage}%` }}
                          />
                        </div>
                      </div>

                      {/* Status & Activity Indicators */}
                      <div className="flex flex-col gap-2 pt-1">
                        {item.attendance.status === 'active' ? (
                          <div className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-tertiary-container/10 border border-tertiary/30">
                            <div className="flex items-center gap-2">
                              <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-tertiary opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-tertiary"></span>
                              </span>
                              <span className="text-xs font-semibold text-tertiary">
                                {item.attendance.label}
                              </span>
                            </div>
                            <span className="text-[11px] font-medium text-tertiary">
                              {item.attendance.sublabel}
                            </span>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-surface-container-low border border-outline-variant/10">
                            <div className="flex items-center gap-2">
                              <span className="inline-flex rounded-full h-2 w-2 bg-outline"></span>
                              <span className="text-xs font-medium text-on-surface-variant">
                                {item.attendance.label}
                              </span>
                            </div>
                            <span className="text-[11px] font-medium text-outline">
                              {item.attendance.sublabel}
                            </span>
                          </div>
                        )}

                        {/* Material & Assignment Metrics */}
                        <div className="grid grid-cols-2 gap-2 text-xs text-on-surface-variant">
                          <div className="flex items-center gap-1.5 py-1.5 px-2 rounded-lg bg-surface-container-low">
                            <span className="material-symbols-outlined text-[16px] text-primary">
                              description
                            </span>
                            <span className="font-medium">{item.materialsCount} Materi</span>
                          </div>
                          <div className="flex items-center gap-1.5 py-1.5 px-2 rounded-lg bg-surface-container-low">
                            <span className="material-symbols-outlined text-[16px] text-secondary">
                              assignment
                            </span>
                            <span className="font-medium">{item.activeTasks} Tugas Aktif</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Action Button */}
                    <div className="pt-5 mt-2">
                      <button
                        onClick={() => handleOpenRoom(item.id)}
                        className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-primary hover:bg-primary-hover text-on-primary font-medium text-sm transition-all duration-200 shadow-md cursor-pointer active:scale-[0.99]"
                        type="button"
                      >
                        <span>Buka Ruang Kelas</span>
                        <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* List View representation */
              <div className="flex flex-col gap-3 w-full">
                {filteredClasses.map((item) => (
                  <div
                    key={item.id}
                    className="bg-surface-container rounded-xl p-4 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4 border border-outline-variant/20 hover:border-primary/40 transition-all group"
                  >
                    <div className="flex items-start md:items-center gap-4 min-w-0">
                      <span
                        className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0"
                        aria-hidden="true"
                      >
                        <span className="material-symbols-outlined text-[24px]">person</span>
                      </span>
                      <div className="flex flex-col min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-primary-container text-on-primary-container">
                            {item.className}
                          </span>
                          <span className="font-mono text-xs text-outline">{item.code}</span>
                          <span className="text-xs font-semibold px-2 py-0.5 rounded bg-surface-container-high text-on-surface-variant">
                            {item.sks}
                          </span>
                          <h2
                            onClick={() => handleOpenRoom(item.id)}
                            className="font-title-md text-base font-semibold text-on-surface truncate group-hover:text-primary cursor-pointer transition-colors"
                          >
                            {item.title}
                          </h2>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-on-surface-variant flex-wrap">
                          <span>{item.lecturer.name}</span>
                          <span>•</span>
                          <span>{item.schedule}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 self-end md:self-center shrink-0">
                      <div className="text-right hidden sm:block">
                        <span className="text-xs font-semibold text-on-surface block font-mono">
                          Pertemuan {item.progress.current}/{item.progress.total} ({item.progress.percentage}%)
                        </span>
                        <span className="text-xs text-on-surface-variant">
                          {item.materialsCount} Materi • {item.activeTasks} Tugas
                        </span>
                      </div>
                      <button
                        onClick={() => handleOpenRoom(item.id)}
                        type="button"
                        className="flex items-center justify-center gap-1.5 py-2 px-4 rounded-xl bg-primary hover:bg-primary-hover text-on-primary font-medium text-sm transition-all shadow-sm cursor-pointer"
                      >
                        <span>Buka Ruang Kelas</span>
                        <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

        {/* Bantuan akademik */}
        <div className="mt-12 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 bg-surface-container-low p-4 rounded-xl border border-outline-variant/20">
          <div className="flex items-center gap-2 text-on-surface-variant font-label-sm text-label-sm">
            <span className="material-symbols-outlined text-primary text-[18px]">help</span>
            <span>Ada kelas yang seharusnya terdaftar tetapi tidak muncul di sini?</span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => onNavigate && onNavigate('status-presensi')}
              className="px-3 py-1.5 rounded-lg bg-surface-container-high text-on-surface hover:text-primary font-label-sm text-label-sm transition-all cursor-pointer"
            >
              Cek Status Presensi
            </button>
            <button
              type="button"
              onClick={() => showToast('Membuka kontak layanan Biro Akademik (BAA)...')}
              className="px-3 py-1.5 rounded-lg bg-primary-container text-on-primary-container font-bold font-label-sm text-label-sm shadow-sm cursor-pointer"
            >
              Hubungi Biro Akademik
            </button>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
