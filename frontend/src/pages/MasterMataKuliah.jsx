import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useToast, useKeyboardShortcuts } from '../hooks/useToast';
import Toast from '../components/Toast';
import { generatePrefixedId } from '../utils/uuid';

// Initial dataset matching SPADA UPGRIS Master Data
const initialCoursesData = [
  {
    id: 'mk-1',
    kode: 'TIF-101',
    nama: 'Rekayasa Perangkat Lunak',
    semester: 3,
    kategori: 'Wajib Program Studi',
    sks: 3,
    deskripsi:
      'Prinsip rekayasa perangkat lunak, siklus hidup SDLC, analisis kebutuhan SRS IEEE 830, pemodelan UML terstruktur, metrik pengujian ISO/IEC 25010.',
    silabusStatus: 'Silabus 16 Sesi Terisi',
    kelasDibuka: 2,
    status: 'aktif',
    kurikulum: 'kur-2024',
  },
  {
    id: 'mk-2',
    kode: 'TIF-204',
    nama: 'Pemrograman Web Lanjut',
    semester: 4,
    kategori: 'Praktikum Wajib',
    sks: 3,
    deskripsi:
      'Pengembangan aplikasi web arsitektur MVC, RESTful API, otentikasi token JWT, dan integrasi basis data modern relasional & document storage.',
    silabusStatus: 'Silabus 16 Sesi Terisi',
    kelasDibuka: 2,
    status: 'aktif',
    kurikulum: 'kur-2024',
  },
  {
    id: 'mk-3',
    kode: 'TIF-302',
    nama: 'Basis Data Terdistribusi',
    semester: 5,
    kategori: 'Pilihan Peminatan Data',
    sks: 2,
    deskripsi:
      'Konsep partisi data, replikasi master-slave, transaksi ACID terdistribusi, konsistensi CAP theorem, sharding, dan basis data NoSQL skala global.',
    silabusStatus: 'Silabus 16 Sesi Terisi',
    kelasDibuka: 1,
    status: 'aktif',
    kurikulum: 'kur-2024',
  },
  {
    id: 'mk-4',
    kode: 'TIF-308',
    nama: 'Kecerdasan Komputasi & AI',
    semester: 5,
    kategori: 'Wajib Konsentrasi AI',
    sks: 3,
    deskripsi:
      'Pembelajaran mesin, algoritma klasifikasi, neural networks dasar, natural language processing, computer vision, dan evaluasi matriks confusion.',
    silabusStatus: 'Silabus 16 Sesi Terisi',
    kelasDibuka: 1,
    status: 'aktif',
    kurikulum: 'kur-2024',
  },
  {
    id: 'mk-5',
    kode: 'TIF-105',
    nama: 'Algoritma & Struktur Data',
    semester: 2,
    kategori: 'Fondasi Utama CS',
    sks: 4,
    deskripsi:
      'Analisis kompleksitas algoritma Big-O, struktur data linked list, tree, binary search tree, graph traversal, sorting, dan manajemen alokasi memori.',
    silabusStatus: 'Silabus 16 Sesi Terisi',
    kelasDibuka: 3,
    status: 'aktif',
    kurikulum: 'kur-2024',
  },
  {
    id: 'mk-6',
    kode: 'TIF-401',
    nama: 'Arsitektur Perangkat Lunak Enterprise',
    semester: 7,
    kategori: 'Pilihan Tingkat Lanjut',
    sks: 2,
    deskripsi:
      'Desain sistem skala besar, microservices, domain-driven design (DDD), message broker Kafka, event-driven pattern, dan ketahanan sistem cloud.',
    silabusStatus: 'Silabus 16 Sesi Terisi',
    kelasDibuka: 1,
    status: 'aktif',
    kurikulum: 'kur-2024',
  },
  {
    id: 'mk-7',
    kode: 'UPG-101',
    nama: 'Pendidikan Karakter & PGRI',
    semester: 1,
    kategori: 'Wajib Universitas',
    sks: 2,
    deskripsi:
      'Pembentukan jati diri pendidik berintegritas, sejarah dan nilai kejuangan PGRI, etika profesi keilmuan, dan integritas akademik civitas UPGRIS.',
    silabusStatus: 'Silabus 16 Sesi Terisi',
    kelasDibuka: 4,
    status: 'aktif',
    kurikulum: 'kur-2024',
  },
];

export default function MasterMataKuliah({ onNavigate }) {
  const [courses, setCourses] = useState(initialCoursesData);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [sksFilter, setSksFilter] = useState('all');
  const [curriculumFilter, setCurriculumFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Debounce search query to avoid excessive filtering on every keystroke
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Modal Dialog states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [viewingSyllabus, setViewingSyllabus] = useState(null);
  const [deleteConfirmCourse, setDeleteConfirmCourse] = useState(null);

  // Form states
  const [formData, setFormData] = useState({
    kode: '',
    sks: 3,
    nama: '',
    deskripsi: '',
    statusAktif: true,
    semester: 3,
    kategori: 'Wajib Program Studi',
  });

  const searchInputRef = useRef(null);

  // Use shared hooks
  const [toastMessage, showToast] = useToast();
  const handleEscape = () => {
    setIsModalOpen(false);
    setViewingSyllabus(null);
    setDeleteConfirmCourse(null);
  };
  useKeyboardShortcuts({
    findInputRef: searchInputRef,
    onEscape: handleEscape,
  });

  // Filtered List
  const filteredCourses = useMemo(() => {
    return courses.filter((c) => {
      if (debouncedSearchQuery.trim()) {
        const q = debouncedSearchQuery.toLowerCase().trim();
        const match =
          c.kode.toLowerCase().includes(q) ||
          c.nama.toLowerCase().includes(q) ||
          c.deskripsi.toLowerCase().includes(q);
        if (!match) return false;
      }
      if (sksFilter !== 'all' && Number(c.sks) !== Number(sksFilter)) {
        return false;
      }
      if (curriculumFilter !== 'all' && c.kurikulum !== curriculumFilter) {
        return false;
      }
      if (statusFilter === 'active-only' && c.status !== 'aktif') {
        return false;
      }
      if (statusFilter === 'archived-only' && c.status !== 'arsip') {
        return false;
      }
      return true;
    });
  }, [courses, debouncedSearchQuery, sksFilter, curriculumFilter, statusFilter]);

  // Derived metrics
  const totalAktif = useMemo(() => courses.filter((c) => c.status === 'aktif').length, [courses]);
  const totalSKS = useMemo(() => courses.filter((c) => c.status === 'aktif').reduce((acc, c) => acc + c.sks, 0), [courses]);
  const avgSKS = totalAktif > 0 ? (totalSKS / totalAktif).toFixed(1) : '0.0';

  const openAddModal = () => {
    setEditingCourse(null);
    setFormData({
      kode: '',
      sks: 3,
      nama: '',
      deskripsi: '',
      statusAktif: true,
      semester: 3,
      kategori: 'Wajib Program Studi',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (course) => {
    setEditingCourse(course);
    setFormData({
      kode: course.kode,
      sks: course.sks,
      nama: course.nama,
      deskripsi: course.deskripsi,
      statusAktif: course.status === 'aktif',
      semester: course.semester || 3,
      kategori: course.kategori || 'Wajib Program Studi',
    });
    setIsModalOpen(true);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!formData.kode.trim() || !formData.nama.trim()) return;

    if (editingCourse) {
      setCourses((prev) =>
        prev.map((c) =>
          c.id === editingCourse.id
            ? {
                ...c,
                kode: formData.kode.toUpperCase().trim(),
                sks: Number(formData.sks),
                nama: formData.nama.trim(),
                deskripsi: formData.deskripsi.trim(),
                status: formData.statusAktif ? 'aktif' : 'arsip',
                semester: Number(formData.semester),
                kategori: formData.kategori,
              }
            : c
        )
      );
      showToast(`Mata kuliah ${formData.kode} berhasil diperbarui!`);
    } else {
      const newCourse = {
        id: generatePrefixedId('mk-'),
        kode: formData.kode.toUpperCase().trim(),
        nama: formData.nama.trim(),
        sks: Number(formData.sks),
        semester: Number(formData.semester),
        kategori: formData.kategori,
        deskripsi: formData.deskripsi.trim(),
        silabusStatus: 'Silabus 16 Sesi Terisi',
        kelasDibuka: 1,
        status: formData.statusAktif ? 'aktif' : 'arsip',
        kurikulum: curriculumFilter === 'all' ? 'kur-2024' : curriculumFilter,
      };
      setCourses((prev) => [newCourse, ...prev]);
      showToast(`Mata kuliah ${newCourse.kode} berhasil didaftarkan!`);
    }

    setIsModalOpen(false);
  };

  const handleDelete = (course) => {
    setCourses((prev) => prev.filter((c) => c.id !== course.id));
    setDeleteConfirmCourse(null);
    showToast(`Mata kuliah ${course.kode} dihapus.`);
  };

  return (
    <div className="flex flex-col w-full pb-16">
      {/* Top Academic Navigation Breadcrumbs & Micro System Health */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-space-sm mb-space-md">
        <nav aria-label="Breadcrumb" className="flex items-center gap-space-xs font-caption text-caption text-on-surface-variant">
          <a className="hover:text-primary transition-colors flex items-center gap-1" href="#" onClick={(e) => { e.preventDefault(); onNavigate?.('dasbor-mahasiswa'); }}>
            <span className="material-symbols-outlined text-[15px]">home</span>
            <span>Beranda</span>
          </a>
          <span className="material-symbols-outlined text-[14px] text-outline">chevron_right</span>
          <span className="text-on-surface-variant">Administrasi SPADA</span>
          <span className="material-symbols-outlined text-[14px] text-outline">chevron_right</span>
          <span className="text-primary font-bold">Master Mata Kuliah</span>
        </nav>

        <div className="flex items-center gap-space-md">
          <div className="flex items-center gap-space-xs px-space-sm py-0.5 rounded-full bg-surface-container-high text-on-surface-variant font-caption text-caption border border-outline-variant/30">
            <span className="w-2 h-2 rounded-full bg-tertiary animate-pulse"></span>
            <span className="font-mono">DB Synced: 08:31:14 WIB</span>
          </div>
          <span className="text-outline font-caption text-caption hidden sm:inline">•</span>
          <div className="font-caption text-caption text-outline hidden sm:flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px] text-primary">verified_user</span>
            <span>Otoritas: Administrator Akademik</span>
          </div>
        </div>
      </div>

      {/* Page Header & Metrics Bento Banner */}
      <div className="relative overflow-hidden rounded-xl bg-surface-container p-space-lg mb-space-lg shadow-xl border border-outline-variant/20">
        <div className="absolute -right-16 -top-16 w-80 h-80 rounded-full bg-primary/10 blur-3xl pointer-events-none"></div>
        <div className="absolute right-1/3 -bottom-20 w-64 h-64 rounded-full bg-secondary-container/10 blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col xl:flex-row xl:items-center justify-between gap-space-lg">
          <div className="flex flex-col gap-space-xs max-w-2xl">
            <div className="flex items-center gap-space-sm">
              <span className="px-space-xs py-0.5 rounded bg-primary-container/20 text-primary font-label-sm text-label-sm tracking-wider uppercase border border-primary/20">
                FPTIK UPGRIS
              </span>
              <span className="text-outline font-caption text-caption">Katalog Kurikulum Terpusat</span>
            </div>
            <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight">
              Master Mata Kuliah SPADA
            </h1>
            <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
              Katalog kurikulum akademik terpusat, alokasi bobot SKS, dan konfigurasi silabus 16 pertemuan terintegrasi Standar Nasional Pendidikan Tinggi (SN-Dikti).
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-space-md">
            {/* Metric Snapshot Pills */}
            <div className="grid grid-cols-3 gap-space-xs bg-surface-container-lowest/80 p-space-xs rounded-lg border border-outline-variant/20">
              <div className="flex flex-col px-space-sm py-space-xs">
                <span className="font-caption text-caption text-outline uppercase font-semibold">Total MK</span>
                <div className="flex items-baseline gap-1">
                  <span className="font-title-lg text-title-lg text-on-surface font-bold">{totalAktif}</span>
                  <span className="font-caption text-caption text-tertiary">Aktif</span>
                </div>
              </div>

              <div className="flex flex-col px-space-sm py-space-xs border-l border-outline-variant/30">
                <span className="font-caption text-caption text-outline uppercase font-semibold">Beban SKS</span>
                <div className="flex items-baseline gap-1">
                  <span className="font-title-lg text-title-lg text-secondary font-bold">{totalSKS}</span>
                  <span className="font-caption text-caption text-on-surface-variant">SKS</span>
                </div>
              </div>

              <div className="flex flex-col px-space-sm py-space-xs border-l border-outline-variant/30">
                <span className="font-caption text-caption text-outline uppercase font-semibold">Rata-rata</span>
                <div className="flex items-baseline gap-1">
                  <span className="font-title-lg text-title-lg text-primary font-bold">{avgSKS}</span>
                  <span className="font-caption text-caption text-on-surface-variant">SKS/MK</span>
                </div>
              </div>
            </div>

            {/* Primary Action Button */}
            <button
              className="flex items-center justify-center gap-space-xs px-space-lg py-3 rounded-lg bg-primary-container text-on-primary-container font-label-md text-label-md font-bold shadow-lg shadow-primary-container/20 hover:brightness-110 active:scale-[0.99] transition-all cursor-pointer"
              type="button"
              onClick={openAddModal}
            >
              <span className="material-symbols-outlined text-[20px]">add_circle</span>
              <span>+ Tambah Mata Kuliah Baru</span>
            </button>
          </div>
        </div>
      </div>

      {/* Interactive Filter & Search Control Bar */}
      <div className="bg-surface-container-low rounded-xl p-space-md mb-space-lg shadow-md flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-space-md border border-outline-variant/20">
        <div className="relative flex-1 min-w-[280px]">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[20px]">
            search
          </span>
          <input
            ref={searchInputRef}
            className="w-full bg-surface-container rounded-lg pl-10 pr-16 py-2.5 font-body-sm text-body-sm text-on-surface placeholder:text-outline focus:outline-none focus:ring-1 focus:ring-primary border border-outline-variant/30"
            placeholder="Cari kode MK, nama mata kuliah, atau kata kunci deskripsi..."
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-0.5">
            <kbd className="px-1.5 py-0.5 rounded bg-surface-container-high text-on-surface-variant font-caption text-caption font-mono border border-outline-variant/40">
              ⌘F
            </kbd>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-space-sm">
          {/* SKS Filter */}
          <div className="relative">
            <select
              className="appearance-none bg-surface-container text-on-surface font-label-sm text-label-sm rounded-lg pl-3 pr-8 py-2.5 focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer border border-outline-variant/30"
              value={sksFilter}
              onChange={(e) => setSksFilter(e.target.value)}
            >
              <option value="all">Semua Bobot SKS</option>
              <option value="1">1 SKS (Praktikum Lapangan)</option>
              <option value="2">2 SKS (Teori / Umum)</option>
              <option value="3">3 SKS (Kompetensi Utama)</option>
              <option value="4">4 SKS (Praktek Intensif)</option>
              <option value="6">6 SKS (Tugas Akhir / Skripsi)</option>
            </select>
            <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-outline pointer-events-none text-[18px]">
              keyboard_arrow_down
            </span>
          </div>

          {/* Curriculum Filter */}
          <div className="relative">
            <select
              className="appearance-none bg-surface-container text-on-surface font-label-sm text-label-sm rounded-lg pl-3 pr-8 py-2.5 focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer border border-outline-variant/30"
              value={curriculumFilter}
              onChange={(e) => setCurriculumFilter(e.target.value)}
            >
              <option value="all">Semua Kurikulum</option>
              <option value="kur-2024">Kurikulum 2024 / MBKM</option>
              <option value="kur-2020">Kurikulum 2020 (Berjalan)</option>
              <option value="kur-pasca">Kurikulum Pascasarjana</option>
            </select>
            <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-outline pointer-events-none text-[18px]">
              expand_more
            </span>
          </div>

          {/* Status Filter */}
          <div className="relative">
            <select
              className="appearance-none bg-surface-container text-on-surface font-label-sm text-label-sm rounded-lg pl-3 pr-8 py-2.5 focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer border border-outline-variant/30"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">Semua Status (Aktif & Arsip)</option>
              <option value="active-only">Hanya Status Aktif</option>
              <option value="archived-only">Hanya Diarsipkan</option>
            </select>
            <span className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-outline pointer-events-none text-[18px]">
              filter_list
            </span>
          </div>

          {/* Export Action */}
          <button
            className="flex items-center gap-space-xs px-space-md py-2.5 rounded-lg bg-surface-container-high hover:bg-surface-bright text-secondary hover:text-on-surface font-label-sm text-label-sm transition-colors cursor-pointer"
            type="button"
            onClick={() => showToast('Katalog MK berhasil diunduh.')}
          >
            <span className="material-symbols-outlined text-[18px]">file_download</span>
            <span>Ekspor Katalog MK</span>
          </button>
        </div>
      </div>

      {/* Master Data Table Container */}
      <div className="w-full bg-surface-container rounded-xl shadow-xl overflow-hidden mb-space-md border border-outline-variant/20">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-surface-container-lowest/90 text-on-surface-variant font-label-sm text-label-sm uppercase tracking-wider border-b border-outline-variant/20">
                <th className="py-space-md px-space-lg w-28">KODE MK</th>
                <th className="py-space-md px-space-md min-w-[200px]">NAMA MATA KULIAH</th>
                <th className="py-space-md px-space-md w-28 text-center">BEBAN SKS</th>
                <th className="py-space-md px-space-md min-w-[320px]">DESKRIPSI SINGKAT & SILABUS</th>
                <th className="py-space-md px-space-md w-36 text-center">KELAS DIBUKA</th>
                <th className="py-space-md px-space-md w-28 text-center">STATUS</th>
                <th className="py-space-md px-space-lg w-32 text-right">AKSI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/10 text-on-surface font-body-sm text-body-sm">
              {filteredCourses.map((c, idx) => (
                <tr
                  key={c.id || c.kode}
                  className={`transition-colors group hover:bg-surface-container-high/60 ${
                    idx % 2 === 1 ? 'bg-surface-container-low/40' : ''
                  }`}
                >
                  <td className="py-space-md px-space-lg align-top">
                    <span className="font-mono font-bold text-primary px-space-xs py-1 rounded bg-primary-container/10">
                      {c.kode}
                    </span>
                  </td>
                  <td className="py-space-md px-space-md align-top">
                    <div className="flex flex-col">
                      <span className="font-title-md text-title-md text-on-surface font-semibold group-hover:text-primary transition-colors">
                        {c.nama}
                      </span>
                      <span className="font-caption text-caption text-on-surface-variant">
                        Semester {c.semester} • {c.kategori}
                      </span>
                    </div>
                  </td>
                  <td className="py-space-md px-space-md align-top text-center">
                    <span
                      className={`inline-flex items-center px-space-sm py-0.5 rounded-full font-label-sm text-label-sm font-bold ${
                        c.sks === 4
                          ? 'bg-tertiary-container/20 text-tertiary'
                          : c.sks === 3
                          ? 'bg-primary-container/20 text-primary'
                          : 'bg-secondary-container/20 text-secondary'
                      }`}
                    >
                      {c.sks} SKS
                    </span>
                  </td>
                  <td className="py-space-md px-space-md align-top">
                    <p className="text-on-surface-variant line-clamp-2 leading-relaxed">
                      {c.deskripsi}
                    </p>
                    <div className="flex items-center gap-space-sm mt-1">
                      <span className="text-tertiary font-caption text-caption flex items-center gap-0.5">
                        <span className="material-symbols-outlined text-[12px]">task_alt</span>
                        <span>{c.silabusStatus}</span>
                      </span>
                    </div>
                  </td>
                  <td className="py-space-md px-space-md align-top text-center">
                    <span className="inline-flex items-center gap-1 font-label-sm text-label-sm text-secondary bg-secondary-container/20 px-space-sm py-1 rounded-lg">
                      <span className="material-symbols-outlined text-[14px]">groups</span>
                      <span>{c.kelasDibuka} Kelas</span>
                    </span>
                  </td>
                  <td className="py-space-md px-space-md align-top text-center">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-tertiary-container/20 text-tertiary font-label-sm text-label-sm font-semibold">
                      <span className="w-1.5 h-1.5 rounded-full bg-tertiary"></span>
                      <span>{c.status === 'aktif' ? 'Aktif' : 'Arsip'}</span>
                    </span>
                  </td>
                  <td className="py-space-md px-space-lg align-top text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        className="p-1.5 rounded hover:bg-surface-bright text-on-surface-variant hover:text-secondary transition-colors cursor-pointer"
                        title="Detail Silabus"
                        type="button"
                        onClick={() => setViewingSyllabus(c)}
                      >
                        <span className="material-symbols-outlined text-[18px]">menu_book</span>
                      </button>
                      <button
                        className="p-1.5 rounded hover:bg-surface-bright text-on-surface-variant hover:text-primary transition-colors cursor-pointer"
                        title="Ubah Mata Kuliah"
                        type="button"
                        onClick={() => openEditModal(c)}
                      >
                        <span className="material-symbols-outlined text-[18px]">edit</span>
                      </button>
                      <button
                        className="p-1.5 rounded hover:bg-surface-bright text-on-surface-variant hover:text-error transition-colors cursor-pointer"
                        title="Hapus Mata Kuliah"
                        type="button"
                        onClick={() => setDeleteConfirmCourse(c)}
                      >
                        <span className="material-symbols-outlined text-[18px]">delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Institutional Pagination Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-space-md p-space-md bg-surface-container-lowest/80 text-on-surface-variant font-label-sm text-label-sm border-t border-outline-variant/10">
          <div className="flex items-center gap-space-md">
            <span>
              Menampilkan <strong className="text-on-surface">1 - {filteredCourses.length}</strong> dari{' '}
              <strong className="text-on-surface">{courses.length}</strong> mata kuliah terdaftar
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button className="p-1.5 rounded bg-surface-container-high text-outline cursor-not-allowed" disabled>
              <span className="material-symbols-outlined text-[18px]">chevron_left</span>
            </button>
            <button className="w-8 h-8 rounded bg-primary-container text-on-primary-container font-bold text-center">
              1
            </button>
            <button className="p-1.5 rounded bg-surface-container-high text-outline cursor-not-allowed" disabled>
              <span className="material-symbols-outlined text-[18px]">chevron_right</span>
            </button>
          </div>
        </div>
      </div>

      {/* Academic Notice Card */}
      <div className="rounded-xl bg-surface-container-low p-space-md flex items-start gap-space-md border border-outline-variant/20">
        <div className="w-10 h-10 rounded-lg bg-secondary-container/20 text-secondary flex items-center justify-center shrink-0">
          <span className="material-symbols-outlined text-[24px]">info</span>
        </div>
        <div className="flex flex-col gap-0.5">
          <h4 className="font-title-md text-title-md text-on-surface font-semibold">
            Pedoman Regulasi Master Kurikulum & Silabus
          </h4>
          <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
            Perubahan beban SKS dan kode mata kuliah pada katalog master akan otomatis mempengaruhi draft transkrip serta perencanaan KRS semester aktif. Pastikan verifikasi melalui Ketua Program Studi sebelum menonaktifkan kode mata kuliah yang telah memiliki kelas aktif.
          </p>
        </div>
      </div>

      {/* CRUD Modal Dialog */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-md flex items-center justify-center p-space-md animate-in fade-in duration-200" onClick={() => setIsModalOpen(false)} role="dialog" aria-modal="true" aria-labelledby="modal-course-heading">
          <div className="relative w-full max-w-xl bg-white text-gray-900 rounded-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
            <div className="h-1.5 w-full bg-gradient-to-r from-blue-600 to-indigo-600"></div>

            <div className="flex items-start justify-between p-space-lg pb-space-sm border-b border-gray-100">
              <div className="flex flex-col">
                <div className="flex items-center gap-space-xs text-blue-600 font-label-sm text-label-sm font-semibold uppercase">
                  <span className="material-symbols-outlined text-[16px]">school</span>
                  <span>Kurikulum SPADA 2024</span>
                </div>
                <h2 id="modal-course-heading" className="text-2xl font-bold text-gray-900 tracking-tight font-title-lg">
                  {editingCourse ? `Ubah Mata Kuliah ${editingCourse.kode}` : 'Tambah Mata Kuliah Baru'}
                </h2>
                <p className="text-sm text-gray-500 font-body-sm mt-0.5">
                  Daftarkan kurikulum baru ke master data akademik SPADA UPGRIS.
                </p>
              </div>
              <button
                className="p-1 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
                type="button"
                onClick={() => setIsModalOpen(false)}
                aria-label="Tutup modal mata kuliah"
              >
                <span className="material-symbols-outlined text-[24px]">close</span>
              </button>
            </div>

            <form className="p-space-lg pt-space-md flex flex-col gap-space-md" onSubmit={handleFormSubmit}>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-space-md">
                <div className="sm:col-span-1 flex flex-col gap-1.5">
                  <label className="font-label-sm text-label-sm text-gray-700 font-semibold flex items-center justify-between" htmlFor="mkKode">
                    <span>Kode MK *</span>
                    <span className="text-xs text-blue-600 font-normal">Kapital</span>
                  </label>
                  <input
                    className="w-full font-mono px-3 py-2 bg-gray-50 rounded-lg text-gray-900 placeholder:text-gray-400 font-body-md text-body-md focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm border border-gray-200"
                    id="mkKode"
                    placeholder="TIF-305"
                    required
                    type="text"
                    value={formData.kode}
                    onChange={(e) => setFormData({ ...formData, kode: e.target.value })}
                    onBlur={(e) => setFormData({ ...formData, kode: e.target.value.toUpperCase() })}
                    style={{ textTransform: 'uppercase' }}
                  />
                </div>
                <div className="sm:col-span-2 flex flex-col gap-1.5">
                  <label className="font-label-sm text-label-sm text-gray-700 font-semibold flex items-center justify-between" htmlFor="mkSks">
                    <span>Beban SKS *</span>
                    <span className="text-xs text-gray-500 font-normal">1 s.d. 6 SKS</span>
                  </label>
                  <div className="relative">
                    <input
                      className="w-full px-3 py-2 bg-gray-50 rounded-lg text-gray-900 font-body-md text-body-md focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm border border-gray-200"
                      id="mkSks"
                      max="6"
                      min="1"
                      required
                      type="number"
                      value={formData.sks}
                      onChange={(e) => setFormData({ ...formData, sks: e.target.value })}
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 font-label-sm text-label-sm pointer-events-none">
                      SKS Bobot
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-label-sm text-label-sm text-gray-700 font-semibold" htmlFor="mkNama">
                  Nama Mata Kuliah Lengkap *
                </label>
                <input
                  className="w-full px-3 py-2 bg-gray-50 rounded-lg text-gray-900 placeholder:text-gray-400 font-body-md text-body-md focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm border border-gray-200"
                  id="mkNama"
                  placeholder="Masukkan nama mata kuliah lengkap..."
                  required
                  type="text"
                  value={formData.nama}
                  onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <label className="font-label-sm text-label-sm text-gray-700 font-semibold" htmlFor="mkDeskripsi">
                    Deskripsi Singkat & CPL
                  </label>
                  <span className="text-xs text-gray-400 font-caption text-caption">Maks 300 karakter</span>
                </div>
                <textarea
                  className="w-full px-3 py-2 bg-gray-50 rounded-lg text-gray-900 placeholder:text-gray-400 font-body-sm text-body-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm leading-relaxed border border-gray-200"
                  id="mkDeskripsi"
                  placeholder="Deskripsi silabus kompetensi, capaian pembelajaran (CPL), dan ruang lingkup perkuliahan 16 pertemuan..."
                  rows={3}
                  value={formData.deskripsi}
                  onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })}
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 border border-gray-200">
                <div className="flex items-center gap-space-sm">
                  <span className="material-symbols-outlined text-green-600 text-[20px]">check_circle</span>
                  <div className="flex flex-col">
                    <span className="font-label-sm text-label-sm text-gray-900 font-semibold">Status Kurikulum Aktif</span>
                    <span className="font-caption text-caption text-gray-500">Mata kuliah ini langsung dapat dialokasikan pada modul Pembukaan Kelas</span>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    checked={formData.statusAktif}
                    className="sr-only peer"
                    type="checkbox"
                    onChange={(e) => setFormData({ ...formData, statusAktif: e.target.checked })}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-end gap-space-sm pt-space-sm border-t border-gray-100">
                <button
                  className="px-space-md py-2.5 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 font-label-md text-label-md font-medium transition-colors cursor-pointer"
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                >
                  Batal
                </button>
                <button
                  className="flex items-center gap-space-xs px-space-lg py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-label-md text-label-md font-bold shadow-lg shadow-blue-500/25 active:scale-[0.98] transition-all cursor-pointer"
                  type="submit"
                >
                  <span className="material-symbols-outlined text-[18px]">save</span>
                  <span>Simpan Mata Kuliah</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Syllabus Modal */}
      {viewingSyllabus && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-md flex items-center justify-center p-space-md" onClick={() => setViewingSyllabus(null)} role="dialog" aria-modal="true" aria-labelledby="modal-syllabus-heading">
          <div className="relative w-full max-w-2xl bg-surface-container text-on-surface rounded-xl shadow-2xl overflow-hidden border border-outline-variant/30 max-h-[85vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="h-1.5 w-full bg-gradient-to-r from-tertiary to-secondary"></div>
            <div className="flex items-start justify-between p-space-lg pb-space-sm border-b border-outline-variant/20">
              <div className="flex flex-col">
                <span className="font-mono text-primary font-bold text-xs">{viewingSyllabus.kode} ({viewingSyllabus.sks} SKS)</span>
                <h3 id="modal-syllabus-heading" className="text-xl font-bold font-title-lg">{viewingSyllabus.nama}</h3>
                <p className="text-xs text-on-surface-variant">{viewingSyllabus.deskripsi}</p>
              </div>
              <button
                className="p-1 rounded text-on-surface-variant hover:text-on-surface"
                onClick={() => setViewingSyllabus(null)}
                aria-label="Tutup modal silabus"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="p-space-lg overflow-y-auto flex-1 flex flex-col gap-2">
              <div className="text-sm font-semibold text-secondary">Rencana Pembelajaran Semester (16 Pertemuan):</div>
              {Array.from({ length: 16 }, (_, i) => (
                <div key={i} className="p-2 rounded bg-surface-container-low border border-outline-variant/20 flex items-center justify-between text-xs">
                  <span className="font-bold text-primary">Sesi {i + 1}</span>
                  <span className="text-on-surface">
                    {i === 7 ? 'Ujian Tengah Semester (UTS)' : i === 15 ? 'Ujian Akhir Semester (UAS)' : `Modul Perkuliahan Pekan ke-${i + 1}`}
                  </span>
                  <span className="text-outline">Tatap Muka & Praktikum</span>
                </div>
              ))}
            </div>
            <div className="p-space-md border-t border-outline-variant/20 flex justify-end">
              <button
                className="px-4 py-2 rounded bg-surface-container-high hover:bg-surface-bright text-on-surface text-sm font-semibold"
                onClick={() => setViewingSyllabus(null)}
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmCourse && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-md flex items-center justify-center p-space-md" onClick={() => setDeleteConfirmCourse(null)} role="dialog" aria-modal="true" aria-labelledby="modal-delete-course-heading">
          <div className="relative w-full max-w-md bg-surface-container text-on-surface rounded-xl shadow-2xl overflow-hidden border border-error/40 p-space-lg flex flex-col gap-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-2 text-error">
              <span className="material-symbols-outlined text-[24px]">warning</span>
              <h3 id="modal-delete-course-heading" className="font-title-lg text-lg font-bold">Konfirmasi Hapus</h3>
            </div>
            <p className="text-sm text-on-surface-variant">
              Apakah Anda yakin ingin menghapus mata kuliah <strong>{deleteConfirmCourse.kode} - {deleteConfirmCourse.nama}</strong>?
            </p>
            <div className="flex justify-end gap-2">
              <button
                className="px-4 py-2 rounded text-on-surface-variant hover:bg-surface-container-high text-sm font-medium"
                onClick={() => setDeleteConfirmCourse(null)}
              >
                Batal
              </button>
              <button
                className="px-4 py-2 rounded bg-error text-on-error hover:bg-error/90 text-sm font-bold shadow-md"
                onClick={() => handleDelete(deleteConfirmCourse)}
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      <Toast message={toastMessage} onClose={() => showToast(null)} />
    </div>
  );
}

