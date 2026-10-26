import React, { useState, useMemo, useEffect, useRef } from 'react';

const initialClassesData = [
  {
    id: 'cls-1',
    rombelLetter: 'A',
    rombel: 'TI-A',
    kodeKelas: 'TIF301-A',
    mataKuliah: 'Rekayasa Perangkat Lunak',
    kodeMK: 'TIF301',
    sks: 3,
    tipe: 'Teori & Praktik Komputasi',
    prodi: 'S1 Teknik Informatika',
    dosen: {
      nama: 'Dr. Awan Rosi, M.Kom.',
      inisial: 'AR',
      nidn: '0612345601',
    },
    jadwal: {
      hari: 'Senin',
      jam: '08:00 - 10:30 WIB',
    },
    ruangan: 'Lab Komputasi 3 (Gedung B Lt. 3)',
    kapasitas: 40,
    terdaftar: 40,
    semesterTawaran: 'Semester Ganjil 2026/2027 (Aktif)',
  },
  {
    id: 'cls-2',
    rombelLetter: 'B',
    rombel: 'TI-B',
    kodeKelas: 'TIF305-B',
    mataKuliah: 'Rekayasa Perangkat Lunak',
    kodeMK: 'TIF305',
    sks: 3,
    tipe: 'Teori & Praktik Komputasi',
    prodi: 'S1 Teknik Informatika',
    dosen: {
      nama: 'Dr. Awan Rosi, M.Kom.',
      inisial: 'AR',
      nidn: '0612345601',
    },
    jadwal: {
      hari: 'Rabu',
      jam: '10:30 - 13:00 WIB',
    },
    ruangan: 'Ruang Teori 402 (Gedung Utama Lt. 4)',
    kapasitas: 40,
    terdaftar: 38,
    semesterTawaran: 'Semester Ganjil 2026/2027 (Aktif)',
  },
  {
    id: 'cls-3',
    rombelLetter: 'A',
    rombel: 'TI-A',
    kodeKelas: 'TIF204-A',
    mataKuliah: 'Pemrograman Web Lanjut',
    kodeMK: 'TIF204',
    sks: 3,
    tipe: 'Laboratorium Praktikum',
    prodi: 'S1 Teknik Informatika',
    dosen: {
      nama: 'Ir. Siti Aminah, M.T.',
      inisial: 'SA',
      nidn: '0628098701',
    },
    jadwal: {
      hari: 'Selasa',
      jam: '13:00 - 15:30 WIB',
    },
    ruangan: 'Lab Software 1 (Gedung B Lt. 2)',
    kapasitas: 40,
    terdaftar: 39,
    semesterTawaran: 'Semester Ganjil 2026/2027 (Aktif)',
  },
  {
    id: 'cls-4',
    rombelLetter: 'B',
    rombel: 'TI-B',
    kodeKelas: 'TIF204-B',
    mataKuliah: 'Pemrograman Web Lanjut',
    kodeMK: 'TIF204',
    sks: 3,
    tipe: 'Laboratorium Praktikum',
    prodi: 'S1 Teknik Informatika',
    dosen: {
      nama: 'Ir. Siti Aminah, M.T.',
      inisial: 'SA',
      nidn: '0628098701',
    },
    jadwal: {
      hari: 'Kamis',
      jam: '08:00 - 10:30 WIB',
    },
    ruangan: 'Lab Software 1 (Gedung B Lt. 2)',
    kapasitas: 35,
    terdaftar: 32,
    semesterTawaran: 'Semester Ganjil 2026/2027 (Aktif)',
  },
  {
    id: 'cls-5',
    rombelLetter: 'A',
    rombel: 'TI-A',
    kodeKelas: 'TIF302-A',
    mataKuliah: 'Basis Data Terdistribusi',
    kodeMK: 'TIF302',
    sks: 2,
    tipe: 'Teori Sistem Database',
    prodi: 'S1 Teknik Informatika',
    dosen: {
      nama: 'Budi Santoso, M.Cs.',
      inisial: 'BS',
      nidn: '0615048201',
    },
    jadwal: {
      hari: 'Jumat',
      jam: '08:00 - 09:40 WIB',
    },
    ruangan: 'Lab Database (Gedung B Lt. 3)',
    kapasitas: 40,
    terdaftar: 36,
    semesterTawaran: 'Semester Ganjil 2026/2027 (Aktif)',
  },
  {
    id: 'cls-6',
    rombelLetter: 'A',
    rombel: 'TI-A',
    kodeKelas: 'TIF402-A',
    mataKuliah: 'Arsitektur Perangkat Lunak Enterprise',
    kodeMK: 'TIF402',
    sks: 2,
    tipe: 'Studi Kasus Industri',
    prodi: 'S1 Teknik Informatika',
    dosen: {
      nama: 'Dr. Awan Rosi, M.Kom.',
      inisial: 'AR',
      nidn: '0612345601',
    },
    jadwal: {
      hari: 'Kamis',
      jam: '13:00 - 14:40 WIB',
    },
    ruangan: 'Lab Rekayasa 2 (Gedung B Lt. 3)',
    kapasitas: 40,
    terdaftar: 40,
    semesterTawaran: 'Semester Ganjil 2026/2027 (Aktif)',
  },
];

const availableCourses = [
  { kode: 'TIF301', nama: 'Rekayasa Perangkat Lunak', sks: 3, tipe: 'Teori & Praktik Komputasi' },
  { kode: 'TIF204', nama: 'Pemrograman Web Lanjut', sks: 3, tipe: 'Laboratorium Praktikum' },
  { kode: 'TIF302', nama: 'Basis Data Terdistribusi', sks: 2, tipe: 'Teori Sistem Database' },
  { kode: 'TIF402', nama: 'Arsitektur Perangkat Lunak Enterprise', sks: 2, tipe: 'Studi Kasus Industri' },
  { kode: 'TIF105', nama: 'Struktur Data & Algoritma', sks: 3, tipe: 'Kompetensi Fondasi' },
  { kode: 'TIF208', nama: 'Jaringan Komputer & Keamanan Siber', sks: 3, tipe: 'Laboratorium Jaringan' },
];

const availableLecturers = [
  { nama: 'Dr. Awan Rosi, M.Kom.', inisial: 'AR', nidn: '0612345601', homebase: 'Homebase TI' },
  { nama: 'Ir. Siti Aminah, M.T.', inisial: 'SA', nidn: '0628098701', homebase: 'Homebase TI' },
  { nama: 'Budi Santoso, M.Cs.', inisial: 'BS', nidn: '0615048201', homebase: 'Homebase TI' },
  { nama: 'Prof. Dr. Hendra Wijaya, M.T.', inisial: 'HW', nidn: '0601017502', homebase: 'Homebase TI' },
  { nama: 'Dewi Sartika, M.Kom.', inisial: 'DS', nidn: '0618059002', homebase: 'Homebase PTI' },
];

const availableRooms = [
  'Lab Komputasi 3 (Gedung B Lt. 3)',
  'Lab Software 1 (Gedung B Lt. 2)',
  'Lab Database (Gedung B Lt. 3)',
  'Lab Rekayasa 2 (Gedung B Lt. 3)',
  'Ruang Teori 402 (Gedung Utama Lt. 4)',
];

export default function PembukaanKelas() {
  const [classes, setClasses] = useState(initialClassesData);
  const [searchQuery, setSearchQuery] = useState('');
  const [semesterFilter, setSemesterFilter] = useState('all');
  const [prodiFilter, setProdiFilter] = useState('all');
  const [statusKuotaFilter, setStatusKuotaFilter] = useState('all');

  // Modal Dialogs
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState(null);
  const [managingClass, setManagingClass] = useState(null);
  const [deletingClass, setDeletingClass] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    mataKuliahKode: 'TIF301',
    dosenNidn: '0612345601',
    rombel: 'TI-C',
    kapasitas: 40,
    hari: 'Senin',
    jam: '08:00 - 10:30 WIB',
    ruangan: 'Lab Komputasi 3 (Gedung B Lt. 3)',
  });

  const searchInputRef = useRef(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'f') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
      if (e.key === 'Escape') {
        setIsModalOpen(false);
        setManagingClass(null);
        setDeletingClass(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Filter logic
  const filteredClasses = useMemo(() => {
    return classes.filter((c) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const match =
          c.rombel.toLowerCase().includes(q) ||
          c.kodeKelas.toLowerCase().includes(q) ||
          c.mataKuliah.toLowerCase().includes(q) ||
          c.dosen.nama.toLowerCase().includes(q);
        if (!match) return false;
      }
      if (semesterFilter === 'ganjil-2026' && !c.semesterTawaran.includes('Ganjil')) return false;
      if (semesterFilter === 'genap-2025' && !c.semesterTawaran.includes('Genap')) return false;
      if (semesterFilter === 'pendek-2026' && !c.semesterTawaran.includes('Pendek')) return false;
      if (prodiFilter !== 'all' && c.prodi !== prodiFilter) return false;

      const pct = Math.round((c.terdaftar / c.kapasitas) * 100);
      if (statusKuotaFilter === 'full' && pct < 100) return false;
      if (statusKuotaFilter === 'almost-full' && (pct <= 90 || pct >= 100)) return false;
      if (statusKuotaFilter === 'available' && pct > 90) return false;

      return true;
    });
  }, [classes, searchQuery, semesterFilter, prodiFilter, statusKuotaFilter]);

  const openAddModal = () => {
    setEditingClass(null);
    setFormData({
      mataKuliahKode: 'TIF301',
      dosenNidn: '0612345601',
      rombel: 'TI-C',
      kapasitas: 40,
      hari: 'Senin',
      jam: '08:00 - 10:30 WIB',
      ruangan: availableRooms[0],
    });
    setIsModalOpen(true);
  };

  const openEditModal = (c) => {
    setEditingClass(c);
    setFormData({
      mataKuliahKode: c.kodeMK || 'TIF301',
      dosenNidn: c.dosen.nidn || '0612345601',
      rombel: c.rombel || 'TI-A',
      kapasitas: c.kapasitas || 40,
      hari: c.jadwal.hari || 'Senin',
      jam: c.jadwal.jam || '08:00 - 10:30 WIB',
      ruangan: c.ruangan || availableRooms[0],
    });
    setIsModalOpen(true);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    const selectedCourse = availableCourses.find((c) => c.kode === formData.mataKuliahKode) || availableCourses[0];
    const selectedLecturer = availableLecturers.find((l) => l.nidn === formData.dosenNidn) || availableLecturers[0];
    const cleanRombel = formData.rombel.trim().toUpperCase() || 'TI-A';
    const rombelLetter = cleanRombel.slice(-1);
    const kodeKelas = `${selectedCourse.kode}-${rombelLetter}`;

    if (editingClass) {
      setClasses((prev) =>
        prev.map((item) =>
          item.id === editingClass.id
            ? {
                ...item,
                rombelLetter,
                rombel: cleanRombel,
                kodeKelas,
                mataKuliah: selectedCourse.nama,
                kodeMK: selectedCourse.kode,
                sks: selectedCourse.sks,
                tipe: selectedCourse.tipe,
                dosen: {
                  nama: selectedLecturer.nama,
                  inisial: selectedLecturer.inisial,
                  nidn: selectedLecturer.nidn,
                },
                jadwal: { hari: formData.hari, jam: formData.jam },
                ruangan: formData.ruangan,
                kapasitas: Number(formData.kapasitas),
              }
            : item
        )
      );
      showToast(`Kelas ${kodeKelas} berhasil diperbarui!`);
    } else {
      const newClass = {
        id: `cls-${Date.now()}`,
        rombelLetter,
        rombel: cleanRombel,
        kodeKelas,
        mataKuliah: selectedCourse.nama,
        kodeMK: selectedCourse.kode,
        sks: selectedCourse.sks,
        tipe: selectedCourse.tipe,
        prodi: 'S1 Teknik Informatika',
        dosen: {
          nama: selectedLecturer.nama,
          inisial: selectedLecturer.inisial,
          nidn: selectedLecturer.nidn,
        },
        jadwal: { hari: formData.hari, jam: formData.jam },
        ruangan: formData.ruangan,
        kapasitas: Number(formData.kapasitas),
        terdaftar: 0,
        semesterTawaran: 'Semester Ganjil 2026/2027 (Aktif)',
      };
      setClasses((prev) => [newClass, ...prev]);
      showToast(`Kelas ${newClass.kodeKelas} berhasil dibuka!`);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (c) => {
    setClasses((prev) => prev.filter((item) => item.id !== c.id));
    setDeletingClass(null);
    showToast(`Kelas ${c.rombel} (${c.kodeKelas}) telah dihapus.`);
  };

  return (
    <div className="flex flex-col w-full pb-margin">
      {/* Breadcrumbs & Live PDDikti Status */}
      <div className="flex flex-wrap items-center justify-between gap-space-sm mb-space-md">
        <nav aria-label="Breadcrumb" className="flex items-center gap-space-xs font-body-sm text-body-sm text-on-surface-variant">
          <a className="hover:text-primary transition-colors flex items-center gap-1" href="#">
            <span className="material-symbols-outlined text-[16px]">home</span>
            <span>Beranda</span>
          </a>
          <span className="material-symbols-outlined text-[14px] text-outline">chevron_right</span>
          <span>Administrasi SPADA</span>
          <span className="material-symbols-outlined text-[14px] text-outline">chevron_right</span>
          <span className="font-label-sm text-label-sm text-primary font-semibold">Pembukaan Kelas</span>
        </nav>
        <div className="inline-flex items-center gap-space-xs px-3 py-1 rounded-full bg-surface-container-high text-on-surface font-caption text-caption shadow-sm border border-outline-variant/30">
          <span className="w-2 h-2 rounded-full bg-tertiary animate-pulse"></span>
          <span className="font-semibold text-tertiary">Sinkronisasi PDDikti:</span>
          <span className="text-on-surface-variant">Aktif • 09:14 WIB</span>
        </div>
      </div>

      {/* Page Header & Key Metrics Bento */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-space-lg mb-space-xl items-start">
        <div className="xl:col-span-7 flex flex-col gap-space-sm">
          <div className="inline-flex items-center gap-space-xs text-secondary font-label-sm text-label-sm tracking-wider uppercase">
            <span className="material-symbols-outlined text-[18px]">domain_verification</span>
            <span>Fakultas Teknik & Informatika • Tahun Akademik 2026/2027</span>
          </div>
          <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight">
            Pembukaan Kelas Perkuliahan
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant max-w-2xl leading-relaxed">
            Pengelolaan kelas perkuliahan semester ganjil 2026/2027, penetapan dosen pengampu definitif, alokasi ruangan komputasi, dan kontrol kapasitas kuota enrollment mahasiswa.
          </p>
          <div className="flex items-center gap-space-md pt-space-xs flex-wrap">
            <button
              className="inline-flex items-center gap-space-xs px-space-lg py-2.5 rounded-lg bg-primary-container text-on-primary-container font-label-md text-label-md font-bold shadow-md hover:bg-primary transition-all cursor-pointer"
              type="button"
              onClick={openAddModal}
            >
              <span className="material-symbols-outlined text-[20px]">add_circle</span>
              <span>+ Buka Kelas Baru</span>
            </button>
            <button
              className="inline-flex items-center gap-space-xs px-space-md py-2.5 rounded-lg bg-surface-container-high hover:bg-surface-bright text-on-surface font-label-md text-label-md transition-colors shadow-sm cursor-pointer border border-outline-variant/30"
              type="button"
              onClick={() => showToast('36 Rombel SIAKAD berhasil disinkronkan!')}
            >
              <span className="material-symbols-outlined text-[18px]">sync_alt</span>
              <span>Impor Rombel SIAKAD</span>
            </button>
          </div>
        </div>

        {/* Bento Metrics */}
        <div className="xl:col-span-5 grid grid-cols-3 gap-space-sm">
          <div className="p-space-md rounded-xl bg-surface-container flex flex-col justify-between shadow-sm border border-outline-variant/20">
            <div className="flex items-center justify-between text-secondary">
              <span className="material-symbols-outlined text-[22px]">calendar_view_week</span>
              <span className="font-caption text-caption px-1.5 py-0.5 rounded bg-secondary/10 text-secondary font-semibold">Reguler</span>
            </div>
            <div className="mt-space-md">
              <div className="font-display-hero text-headline-lg text-on-surface leading-none font-bold">36</div>
              <div className="font-caption text-caption text-on-surface-variant mt-1">Kelas Terbuka</div>
            </div>
            <div className="mt-space-xs font-caption text-caption text-tertiary flex items-center gap-0.5">
              <span className="material-symbols-outlined text-[12px]">trending_up</span>
              <span>100% Target Rombel</span>
            </div>
          </div>

          <div className="p-space-md rounded-xl bg-surface-container flex flex-col justify-between shadow-sm border border-outline-variant/20">
            <div className="flex items-center justify-between text-primary">
              <span className="material-symbols-outlined text-[22px]">groups</span>
              <span className="font-caption text-caption px-1.5 py-0.5 rounded bg-primary/10 text-primary font-semibold">Aktif</span>
            </div>
            <div className="mt-space-md">
              <div className="font-display-hero text-headline-lg text-on-surface leading-none font-bold">1,280</div>
              <div className="font-caption text-caption text-on-surface-variant mt-1">Mahasiswa Terdaftar</div>
            </div>
            <div className="mt-space-xs font-caption text-caption text-on-surface-variant">
              <span>Kapasitas: 1,320 Kursi</span>
            </div>
          </div>

          <div className="p-space-md rounded-xl bg-surface-container flex flex-col justify-between shadow-sm border border-outline-variant/20">
            <div className="flex items-center justify-between text-tertiary">
              <span className="material-symbols-outlined text-[22px]">assignment_ind</span>
              <span className="font-caption text-caption px-1.5 py-0.5 rounded bg-tertiary/10 text-tertiary font-semibold">Selesai</span>
            </div>
            <div className="mt-space-md">
              <div className="font-display-hero text-headline-lg text-on-surface leading-none font-bold">36/36</div>
              <div className="font-caption text-caption text-on-surface-variant mt-1">Dosen Terdistribusi</div>
            </div>
            <div className="mt-space-xs font-caption text-caption text-tertiary flex items-center gap-0.5">
              <span className="material-symbols-outlined text-[12px]">check</span>
              <span>Nol Jam Bentrok</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="p-space-md rounded-xl bg-surface-container shadow-sm mb-space-lg flex flex-col lg:flex-row items-center justify-between gap-space-md border border-outline-variant/20">
        <div className="relative w-full lg:w-96 flex items-center bg-surface-container-low rounded-lg px-space-md py-2 shadow-inner border border-outline-variant/30">
          <span className="material-symbols-outlined text-outline text-[20px] mr-space-sm pointer-events-none">search</span>
          <input
            ref={searchInputRef}
            className="w-full bg-transparent font-body-sm text-body-sm text-on-surface placeholder-outline focus:outline-none"
            placeholder="Cari kelas, kode MK, atau dosen pengampu..."
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <kbd className="hidden sm:inline-block px-1.5 py-0.5 rounded bg-surface-container font-caption text-caption text-on-surface-variant shadow-sm border border-outline-variant/40">
            ⌘F
          </kbd>
        </div>

        <div className="w-full lg:w-auto flex flex-wrap items-center gap-space-sm justify-start lg:justify-end">
          <div className="relative min-w-[200px] flex-1 sm:flex-initial">
            <select
              className="w-full appearance-none bg-surface-container-low text-on-surface font-label-sm text-label-sm rounded-lg px-space-md py-2.5 pr-8 focus:outline-none cursor-pointer border border-outline-variant/30"
              value={semesterFilter}
              onChange={(e) => setSemesterFilter(e.target.value)}
            >
              <option value="all">Semua Semester</option>
              <option value="ganjil-2026">Semester Ganjil 2026/2027 (Aktif)</option>
              <option value="genap-2025">Semester Genap 2025/2026 (Arsip)</option>
              <option value="pendek-2026">Semester Pendek 2026 (Arsip)</option>
            </select>
            <span className="material-symbols-outlined pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-outline text-[18px]">
              expand_more
            </span>
          </div>

          <div className="relative min-w-[200px] flex-1 sm:flex-initial">
            <select
              className="w-full appearance-none bg-surface-container-low text-on-surface font-label-sm text-label-sm rounded-lg px-space-md py-2.5 pr-8 focus:outline-none cursor-pointer border border-outline-variant/30"
              value={prodiFilter}
              onChange={(e) => setProdiFilter(e.target.value)}
            >
              <option value="all">Semua Program Studi</option>
              <option value="S1 Teknik Informatika">S1 Teknik Informatika</option>
              <option value="S1 Pendidikan TIK">S1 Pendidikan TIK</option>
              <option value="S1 Sistem Informasi">S1 Sistem Informasi</option>
              <option value="D3 Manajemen Informatika">D3 Manajemen Informatika</option>
            </select>
            <span className="material-symbols-outlined pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-outline text-[18px]">
              filter_alt
            </span>
          </div>

          <div className="relative min-w-[170px] flex-1 sm:flex-initial">
            <select
              className="w-full appearance-none bg-surface-container-low text-on-surface font-label-sm text-label-sm rounded-lg px-space-md py-2.5 pr-8 focus:outline-none cursor-pointer border border-outline-variant/30"
              value={statusKuotaFilter}
              onChange={(e) => setStatusKuotaFilter(e.target.value)}
            >
              <option value="all">Semua Status Kuota</option>
              <option value="full">Kelas Penuh (100%)</option>
              <option value="almost-full">Hampir Penuh (&gt;90%)</option>
              <option value="available">Tersedia (&le;90%)</option>
            </select>
            <span className="material-symbols-outlined pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-outline text-[18px]">
              pie_chart
            </span>
          </div>

          <button
            className="inline-flex items-center gap-space-xs px-space-md py-2.5 rounded-lg bg-surface-container-high hover:bg-surface-bright text-tertiary font-label-sm text-label-sm transition-colors shadow-sm cursor-pointer border border-tertiary/20"
            type="button"
            onClick={() => showToast('Ekspor berkas XLSX berhasil diunduh.')}
          >
            <span className="material-symbols-outlined text-[18px]">table_view</span>
            <span>Ekspor .XLSX</span>
          </button>
        </div>
      </div>

      {/* Table Container */}
      <div className="w-full rounded-2xl bg-surface-container shadow-xl overflow-hidden flex flex-col border border-outline-variant/20">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container-low font-caption text-caption text-outline uppercase tracking-wider border-b border-outline-variant/20">
                <th className="py-space-md px-space-md">KODE / ROMBEL</th>
                <th className="py-space-md px-space-md">MATA KULIAH</th>
                <th className="py-space-md px-space-md">DOSEN PENGAMPU UTAMA</th>
                <th className="py-space-md px-space-md">SEMESTER & JADWAL RUANG</th>
                <th className="py-space-md px-space-md text-center">KAPASITAS</th>
                <th className="py-space-md px-space-md w-56">MAHASISWA TERDAFTAR</th>
                <th className="py-space-md px-space-md text-right pr-6">AKSI OPERASIONAL</th>
              </tr>
            </thead>
            <tbody className="font-body-sm text-body-sm text-on-surface divide-y divide-outline-variant/10">
              {filteredClasses.map((c, idx) => {
                const percentage = Math.round((c.terdaftar / c.kapasitas) * 100);
                const isFull = percentage >= 100;
                return (
                  <tr
                    key={c.id || c.kodeKelas}
                    className={`transition-colors hover:bg-surface-container-high ${
                      idx % 2 === 1 ? 'bg-surface-container-low/40' : ''
                    }`}
                  >
                    <td className="py-space-md px-space-md">
                      <div className="flex items-center gap-space-xs">
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center font-title-md font-bold text-title-md ${
                            c.rombelLetter === 'A'
                              ? 'bg-primary-container/20 text-primary'
                              : 'bg-secondary/20 text-secondary'
                          }`}
                        >
                          {c.rombelLetter || c.rombel.slice(-1)}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-label-md text-label-md font-bold text-on-surface">{c.rombel}</span>
                          <span className="font-caption text-caption text-secondary">{c.kodeKelas}</span>
                        </div>
                      </div>
                    </td>

                    <td className="py-space-md px-space-md">
                      <div className="flex flex-col">
                        <span className="font-label-md text-label-md font-semibold text-on-surface">{c.mataKuliah}</span>
                        <span className="font-caption text-caption text-on-surface-variant flex items-center gap-1">
                          <span className="material-symbols-outlined text-[13px] text-primary">bookmark</span>
                          {c.sks} SKS • {c.tipe}
                        </span>
                      </div>
                    </td>

                    <td className="py-space-md px-space-md">
                      <div className="flex items-center gap-space-sm">
                        <div className="w-8 h-8 rounded-full bg-surface-bright flex items-center justify-center text-primary font-bold text-caption">
                          {c.dosen.inisial || 'DS'}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-label-sm text-label-sm font-semibold text-on-surface">{c.dosen.nama}</span>
                          <span className="font-caption text-caption text-outline">NIDN: {c.dosen.nidn}</span>
                        </div>
                      </div>
                    </td>

                    <td className="py-space-md px-space-md">
                      <div className="flex flex-col gap-0.5">
                        <span className="font-label-sm text-label-sm text-on-surface flex items-center gap-1">
                          <span className="material-symbols-outlined text-[14px] text-tertiary">schedule</span>
                          {c.jadwal.hari}, {c.jadwal.jam}
                        </span>
                        <span className="font-caption text-caption text-on-surface-variant flex items-center gap-1">
                          <span className="material-symbols-outlined text-[14px] text-outline">meeting_room</span>
                          {c.ruangan}
                        </span>
                      </div>
                    </td>

                    <td className="py-space-md px-space-md text-center">
                      <span className="px-2.5 py-1 rounded-md bg-surface-container-high font-label-sm text-label-sm text-on-surface font-semibold">
                        {c.kapasitas} Kursi
                      </span>
                    </td>

                    <td className="py-space-md px-space-md">
                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center justify-between font-caption text-caption">
                          <span className={`font-semibold ${isFull ? 'text-tertiary' : 'text-secondary'}`}>
                            {c.terdaftar} / {c.kapasitas} ({percentage}%)
                          </span>
                          {isFull ? (
                            <span className="px-1.5 py-0.2 rounded bg-tertiary-container/30 text-tertiary font-bold">FULL</span>
                          ) : (
                            <span className="text-secondary-fixed">Sisa {c.kapasitas - c.terdaftar} Kuota</span>
                          )}
                        </div>
                        <div className="w-full bg-surface-container-lowest h-2 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${isFull ? 'bg-tertiary' : 'bg-secondary'}`}
                            style={{ width: `${Math.min(percentage, 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>

                    <td className="py-space-md px-space-md text-right pr-6">
                      <div className="flex items-center justify-end gap-space-xs">
                        <button
                          className="px-3 py-1.5 rounded-lg bg-primary-container hover:bg-primary text-on-primary-container font-label-sm text-label-sm font-semibold transition-colors flex items-center gap-1 shadow-sm cursor-pointer"
                          type="button"
                          onClick={() => setManagingClass(c)}
                        >
                          <span className="material-symbols-outlined text-[16px]">group_add</span>
                          <span>Kelola Enrollment</span>
                        </button>
                        <button
                          aria-label="Edit Kelas"
                          className="p-1.5 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors cursor-pointer"
                          type="button"
                          onClick={() => openEditModal(c)}
                        >
                          <span className="material-symbols-outlined text-[18px]">edit</span>
                        </button>
                        <button
                          aria-label="Hapus Kelas"
                          className="p-1.5 rounded-lg text-outline hover:text-error hover:bg-surface-container-high transition-colors cursor-pointer"
                          type="button"
                          onClick={() => setDeletingClass(c)}
                        >
                          <span className="material-symbols-outlined text-[18px]">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="px-space-md py-3.5 bg-surface-container-low flex flex-col sm:flex-row items-center justify-between gap-space-md font-body-sm text-body-sm text-on-surface-variant border-t border-outline-variant/10">
          <div>
            Menampilkan <strong className="text-on-surface">1 - {filteredClasses.length}</strong> dari{' '}
            <strong className="text-on-surface">{classes.length}</strong> kelas aktif semester ini
          </div>
          <div className="flex items-center gap-space-xs">
            <button className="p-1.5 rounded-lg bg-surface-container text-outline opacity-50" disabled>
              <span className="material-symbols-outlined text-[18px]">chevron_left</span>
            </button>
            <button className="w-8 h-8 rounded-lg bg-primary-container text-on-primary-container font-label-sm text-label-sm font-bold flex items-center justify-center shadow-sm">
              1
            </button>
            <button className="p-1.5 rounded-lg bg-surface-container text-outline opacity-50" disabled>
              <span className="material-symbols-outlined text-[18px]">chevron_right</span>
            </button>
          </div>
        </div>
      </div>

      {/* Modal Dialog: Buka Kelas Baru / Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-surface-container-lowest/80 backdrop-blur-md p-space-md overflow-y-auto animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl bg-surface-container rounded-2xl shadow-2xl p-space-xl flex flex-col gap-space-lg my-auto border border-outline-variant/30">
            <div className="flex items-start justify-between">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-space-xs text-primary font-label-sm text-label-sm">
                  <span className="material-symbols-outlined text-[18px]">post_add</span>
                  <span>Konfigurasi Perkuliahan Baru</span>
                </div>
                <h2 className="font-headline-md text-headline-md text-on-surface font-bold">
                  {editingClass ? `Ubah Kelas ${editingClass.kodeKelas}` : 'Buka Kelas Perkuliahan Baru'}
                </h2>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  Konfigurasikan pembukaan kelas, tetapkan dosen pengampu definitif, dan kuota enrollment mahasiswa.
                </p>
              </div>
              <button
                className="p-1.5 rounded-lg bg-surface-container-high text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer"
                type="button"
                onClick={() => setIsModalOpen(false)}
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <form className="flex flex-col gap-space-md" onSubmit={handleFormSubmit}>
              <div className="flex flex-col gap-1">
                <label className="font-label-md text-label-md text-on-surface font-semibold flex items-center justify-between">
                  <span>Mata Kuliah Kurikulum</span>
                  <span className="font-caption text-caption text-secondary">Tersedia {availableCourses.length} Mata Kuliah Terdaftar</span>
                </label>
                <select
                  className="w-full bg-surface-container-low text-on-surface rounded-lg px-space-md py-2.5 font-body-sm text-body-sm focus:outline-none focus:ring-1 focus:ring-primary border border-outline-variant/30"
                  value={formData.mataKuliahKode}
                  onChange={(e) => setFormData({ ...formData, mataKuliahKode: e.target.value })}
                >
                  {availableCourses.map((c) => (
                    <option key={c.kode} value={c.kode}>
                      {c.kode} - {c.nama} ({c.sks} SKS)
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-label-md text-label-md text-on-surface font-semibold">Dosen Pengampu Utama (Definitif)</label>
                <select
                  className="w-full bg-surface-container-low text-on-surface rounded-lg px-space-md py-2.5 font-body-sm text-body-sm focus:outline-none focus:ring-1 focus:ring-primary border border-outline-variant/30"
                  value={formData.dosenNidn}
                  onChange={(e) => setFormData({ ...formData, dosenNidn: e.target.value })}
                >
                  {availableLecturers.map((l) => (
                    <option key={l.nidn} value={l.nidn}>
                      {l.nama} [NIDN: {l.nidn}] - {l.homebase}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md">
                <div className="flex flex-col gap-1">
                  <label className="font-label-md text-label-md text-on-surface font-semibold">Nama / Rombel Kelas</label>
                  <input
                    className="bg-surface-container-low text-on-surface rounded-lg px-space-md py-2.5 font-body-sm text-body-sm focus:outline-none focus:ring-1 focus:ring-primary uppercase border border-outline-variant/30"
                    type="text"
                    value={formData.rombel}
                    onChange={(e) => setFormData({ ...formData, rombel: e.target.value })}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="font-label-md text-label-md text-on-surface font-semibold">Kapasitas Kuota Mahasiswa</label>
                  <input
                    className="bg-surface-container-low text-on-surface rounded-lg px-space-md py-2.5 font-body-sm text-body-sm focus:outline-none focus:ring-1 focus:ring-primary border border-outline-variant/30"
                    type="number"
                    max={80}
                    min={5}
                    value={formData.kapasitas}
                    onChange={(e) => setFormData({ ...formData, kapasitas: Number(e.target.value) })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-space-sm">
                <select
                  className="bg-surface-container-low text-on-surface rounded-lg px-space-md py-2.5 font-body-sm text-body-sm border border-outline-variant/30"
                  value={formData.hari}
                  onChange={(e) => setFormData({ ...formData, hari: e.target.value })}
                >
                  {['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'].map((h) => (
                    <option key={h} value={h}>{h}</option>
                  ))}
                </select>
                <input
                  className="bg-surface-container-low text-on-surface rounded-lg px-space-md py-2.5 font-body-sm text-body-sm text-center border border-outline-variant/30"
                  type="text"
                  value={formData.jam}
                  onChange={(e) => setFormData({ ...formData, jam: e.target.value })}
                />
                <select
                  className="bg-surface-container-low text-on-surface rounded-lg px-space-md py-2.5 font-body-sm text-body-sm border border-outline-variant/30"
                  value={formData.ruangan}
                  onChange={(e) => setFormData({ ...formData, ruangan: e.target.value })}
                >
                  {availableRooms.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-space-md pt-space-md border-t border-outline-variant/20">
                <button
                  className="px-space-lg py-2.5 rounded-lg bg-surface-container-high hover:bg-surface-bright text-on-surface font-label-md text-label-md cursor-pointer"
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                >
                  Batal
                </button>
                <button
                  className="px-space-lg py-2.5 rounded-lg bg-primary-container text-on-primary-container font-label-md text-label-md font-bold shadow-md hover:bg-primary cursor-pointer flex items-center gap-1.5"
                  type="submit"
                >
                  <span className="material-symbols-outlined text-[18px]">check_circle</span>
                  <span>{editingClass ? 'Simpan Perubahan' : 'Buka Kelas Sekarang'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Enrollment Drawer / Modal */}
      {managingClass && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-surface-container-lowest/80 backdrop-blur-md p-space-md">
          <div className="relative w-full max-w-xl bg-surface-container text-on-surface rounded-2xl shadow-2xl p-space-lg flex flex-col gap-space-md border border-outline-variant/30">
            <div className="flex items-start justify-between border-b border-outline-variant/20 pb-2">
              <div>
                <span className="text-xs font-mono text-primary font-bold">{managingClass.kodeKelas} (Rombel {managingClass.rombel})</span>
                <h3 className="text-lg font-bold font-title-md">{managingClass.mataKuliah}</h3>
                <p className="text-xs text-on-surface-variant">Dosen: {managingClass.dosen.nama}</p>
              </div>
              <button className="p-1 rounded text-outline hover:text-on-surface" onClick={() => setManagingClass(null)}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="p-3 bg-surface-container-low rounded-lg flex items-center justify-between text-xs">
              <span>Kuota Terisi: <strong>{managingClass.terdaftar} / {managingClass.kapasitas} Mahasiswa</strong></span>
              <span className="font-bold text-tertiary">
                {Math.round((managingClass.terdaftar / managingClass.kapasitas) * 100)}%
              </span>
            </div>
            <div className="flex justify-end pt-2 border-t border-outline-variant/20">
              <button
                className="px-4 py-2 rounded-lg bg-surface-container-high hover:bg-surface-bright text-xs font-semibold"
                onClick={() => setManagingClass(null)}
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingClass && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-surface-container-lowest/80 backdrop-blur-md p-space-md">
          <div className="relative w-full max-w-md bg-surface-container text-on-surface rounded-xl shadow-2xl p-space-lg flex flex-col gap-3 border border-error/40">
            <div className="flex items-center gap-2 text-error">
              <span className="material-symbols-outlined text-[24px]">warning</span>
              <h3 className="font-title-lg text-lg font-bold">Hapus Kelas Perkuliahan?</h3>
            </div>
            <p className="text-sm text-on-surface-variant">
              Apakah Anda yakin ingin menghapus kelas <strong>{deletingClass.rombel} ({deletingClass.kodeKelas})</strong>?
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button className="px-4 py-2 rounded text-xs font-semibold hover:bg-surface-container-high" onClick={() => setDeletingClass(null)}>
                Batal
              </button>
              <button className="px-4 py-2 rounded bg-error text-on-error text-xs font-bold shadow-md hover:bg-error/90" onClick={() => handleDelete(deletingClass)}>
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-surface-container-high border border-tertiary/40 text-on-surface px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 animate-in slide-in-from-bottom-4">
          <span className="material-symbols-outlined text-tertiary text-[20px]">check_circle</span>
          <span className="text-sm font-semibold">{toastMessage}</span>
        </div>
      )}
    </div>
  );
}

