import React, { useState, useMemo } from 'react';
import AppShell from '../../components/AppShell';

export default function PemeriksaanTugas({ onRoleChange, onNavigate }) {
  const [selectedCourse, setSelectedCourse] = useState('rpl-ti-a');
  const [selectedTask, setSelectedTask] = useState('tugas-1');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'pending' | 'graded' | 'late'
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMessage, setToastMessage] = useState(null);

  // Modal grading state
  const [gradingModalOpen, setGradingModalOpen] = useState(false);
  const [currentSubmission, setCurrentSubmission] = useState(null);
  const [cpmk1Score, setCpmk1Score] = useState(85);
  const [cpmk2Score, setCpmk2Score] = useState(80);
  const [cpmk3Score, setCpmk3Score] = useState(90);
  const [feedbackNote, setFeedbackNote] = useState('');

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const courses = [
    { id: 'rpl-ti-a', name: 'TI-A • Rekayasa Perangkat Lunak (3 SKS)' },
    { id: 'web-ti-b', name: 'TI-B • Pemrograman Web Berbasis Komponen (3 SKS)' },
    { id: 'db-ti-a', name: 'TI-A • Basis Data Terdistribusi (2 SKS)' },
  ];

  const tasks = [
    { id: 'tugas-1', title: 'Tugas 01: Analisis Kebutuhan SRS & Diagram UML (CPMK-1, CPMK-2)', deadline: '10 Okt 2026, 23:59 WIB' },
    { id: 'tugas-2', title: 'Tugas 02: Desain Arsitektur Microservices & API Blueprint (CPMK-3)', deadline: '24 Okt 2026, 23:59 WIB' },
  ];

  const [submissions, setSubmissions] = useState([
    {
      id: 'sub-1',
      nim: '24670001',
      name: 'Dimas Arya Pratama',
      submittedAt: '09 Okt 2026, 20:15 WIB',
      isLate: false,
      fileName: 'SRS_DimasArya_24670001.pdf',
      fileSize: '2.4 MB',
      status: 'pending', // 'pending' | 'graded'
      score: null,
      feedback: '',
    },
    {
      id: 'sub-2',
      nim: '24670002',
      name: 'Ahmad Fauzi',
      submittedAt: '10 Okt 2026, 14:22 WIB',
      isLate: false,
      fileName: 'Tugas01_AhmadFauzi.pdf',
      fileSize: '3.1 MB',
      status: 'graded',
      score: 88,
      feedback: 'Analisis use case sangat detail dan sesuai notasi UML 2.5 standar.',
    },
    {
      id: 'sub-3',
      nim: '24670003',
      name: 'Alif Kurniawan',
      submittedAt: '10 Okt 2026, 22:50 WIB',
      isLate: false,
      fileName: 'SRS_AlifK_Rev1.pdf',
      fileSize: '1.9 MB',
      status: 'pending',
      score: null,
      feedback: '',
    },
    {
      id: 'sub-4',
      nim: '24670008',
      name: 'Siti Nurhaliza',
      submittedAt: '11 Okt 2026, 01:10 WIB',
      isLate: true,
      fileName: 'Tugas_SRS_SitiNur.zip',
      fileSize: '4.5 MB',
      status: 'pending',
      score: null,
      feedback: '',
    },
    {
      id: 'sub-5',
      nim: '24670014',
      name: 'Bagas Saputra',
      submittedAt: '10 Okt 2026, 19:30 WIB',
      isLate: false,
      fileName: 'SRS_Bagas_Final.pdf',
      fileSize: '2.8 MB',
      status: 'graded',
      score: 92,
      feedback: 'Luar biasa, diagram sequence dan activity sangat komprehensif.',
    },
    {
      id: 'sub-6',
      nim: '24670019',
      name: 'Kevin Sanjaya',
      submittedAt: '10 Okt 2026, 23:45 WIB',
      isLate: false,
      fileName: 'Tugas1_Kevin_TI.pdf',
      fileSize: '2.0 MB',
      status: 'graded',
      score: 78,
      feedback: 'Perlu diperbaiki relasi antar kelas pada diagram perancangan database.',
    },
  ]);

  const filteredSubmissions = useMemo(() => {
    return submissions.filter((sub) => {
      if (statusFilter === 'pending' && sub.status !== 'pending') return false;
      if (statusFilter === 'graded' && sub.status !== 'graded') return false;
      if (statusFilter === 'late' && !sub.isLate) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return sub.name.toLowerCase().includes(q) || sub.nim.includes(q);
      }
      return true;
    });
  }, [submissions, statusFilter, searchQuery]);

  const totalSubmitted = submissions.length;
  const pendingCount = submissions.filter((s) => s.status === 'pending').length;
  const gradedCount = submissions.filter((s) => s.status === 'graded').length;
  const averageScore = useMemo(() => {
    const graded = submissions.filter((s) => s.status === 'graded' && s.score !== null);
    if (!graded.length) return '0.0';
    const sum = graded.reduce((acc, curr) => acc + curr.score, 0);
    return (sum / graded.length).toFixed(1);
  }, [submissions]);

  const handleOpenGrading = (sub) => {
    setCurrentSubmission(sub);
    if (sub.score !== null) {
      setCpmk1Score(Math.min(100, Math.round(sub.score * 1.02)));
      setCpmk2Score(sub.score);
      setCpmk3Score(Math.max(60, Math.round(sub.score * 0.98)));
    } else {
      setCpmk1Score(85);
      setCpmk2Score(80);
      setCpmk3Score(85);
    }
    setFeedbackNote(sub.feedback || '');
    setGradingModalOpen(true);
  };

  const handleSaveGrading = (e) => {
    e.preventDefault();
    if (!currentSubmission) return;

    // Weighted score: 35% CPMK-1 + 35% CPMK-2 + 30% CPMK-3
    const finalScore = Math.round(cpmk1Score * 0.35 + cpmk2Score * 0.35 + cpmk3Score * 0.3);

    setSubmissions((prev) =>
      prev.map((s) =>
        s.id === currentSubmission.id
          ? {
              ...s,
              status: 'graded',
              score: finalScore,
              feedback: feedbackNote || 'Nilai berhasil diverifikasi oleh Dosen Pengampu.',
            }
          : s
      )
    );

    setGradingModalOpen(false);
    showToast(`Nilai mahasiswa ${currentSubmission.name} berhasil disimpan (${finalScore}/100).`);
  };

  return (
    <AppShell
      activeRole="dosen"
      onRoleChange={onRoleChange}
      activeNavPath="pemeriksaan-tugas"
      onNavChange={onNavigate}
    >
      {/* Toast Alert */}
      {toastMessage && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-surface-container-highest text-on-surface px-4 py-3 rounded-xl shadow-2xl border border-primary/30 animate-bounce"
        >
          <span className="material-symbols-outlined text-primary text-[20px]">info</span>
          <span className="font-label-md text-sm">{toastMessage}</span>
        </div>
      )}

      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-space-xs text-on-surface-variant font-label-sm text-label-sm mb-space-md">
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            onNavigate && onNavigate('dasbor-dosen');
          }}
          className="hover:text-primary transition-colors flex items-center gap-1"
        >
          <span className="material-symbols-outlined text-[16px]">home</span>
          <span>Dasbor Dosen</span>
        </a>
        <span className="material-symbols-outlined text-[14px] text-outline">chevron_right</span>
        <span className="text-secondary font-semibold">Pemeriksaan Rubrik Tugas</span>
      </nav>

      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-surface-container-high via-surface-container to-surface-container-low p-space-lg shadow-md mb-space-lg border border-outline-variant/20">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-space-md">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-primary-container text-on-primary-container font-label-sm text-[12px] font-bold">
                Penilaian OBE SPADA
              </span>
              <span className="font-caption text-caption text-on-surface-variant">
                Semester Ganjil 2026/2027
              </span>
            </div>
            <h1 className="font-headline-sm text-headline-sm text-on-surface font-bold tracking-tight">
              Pemeriksaan Tugas &amp; Evaluasi Rubrik
            </h1>
            <p className="font-body-md text-body-md text-on-surface-variant">
              Kelola berkas pengumpulan tugas mahasiswa, input skor numerik 0-100, dan pantau pemenuhan CPMK.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => showToast('Mengekspor seluruh rekap penilaian tugas ke Excel (.xlsx)...')}
              className="px-4 py-2 rounded-xl bg-surface-container-highest hover:bg-surface-bright text-on-surface font-label-md text-label-md font-semibold transition-all border border-outline-variant/30 flex items-center gap-1.5 shadow-sm"
            >
              <span className="material-symbols-outlined text-[18px]">download</span>
              <span>Ekspor Rekap Nilai</span>
            </button>
            <button
              type="button"
              onClick={() => onNavigate && onNavigate('kelola-kelas')}
              className="px-4 py-2 rounded-xl bg-primary text-on-primary font-label-md text-label-md font-bold hover:bg-primary/90 transition-all shadow-md flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[18px]">tune</span>
              <span>Kelola Kelas Terkait</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4 Metric Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-md mb-space-lg">
        <div className="p-space-md rounded-xl bg-surface-container-low border border-outline-variant/20 shadow-sm flex items-center gap-space-md">
          <div className="w-12 h-12 rounded-xl bg-primary-container/20 text-primary flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[24px]">assignment</span>
          </div>
          <div>
            <span className="font-caption text-caption text-on-surface-variant block font-medium">Total Berkas Terkumpul</span>
            <span className="font-title-lg text-title-lg font-bold text-on-surface">{totalSubmitted} Berkas</span>
          </div>
        </div>

        <div className="p-space-md rounded-xl bg-surface-container-low border border-outline-variant/20 shadow-sm flex items-center gap-space-md">
          <div className="w-12 h-12 rounded-xl bg-error-container/20 text-error flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[24px]">pending_actions</span>
          </div>
          <div>
            <span className="font-caption text-caption text-on-surface-variant block font-medium">Menunggu Penilaian</span>
            <span className="font-title-lg text-title-lg font-bold text-error">{pendingCount} Mahasiswa</span>
          </div>
        </div>

        <div className="p-space-md rounded-xl bg-surface-container-low border border-outline-variant/20 shadow-sm flex items-center gap-space-md">
          <div className="w-12 h-12 rounded-xl bg-tertiary-container/20 text-tertiary flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[24px]">task_alt</span>
          </div>
          <div>
            <span className="font-caption text-caption text-on-surface-variant block font-medium">Sudah Selesai Dinilai</span>
            <span className="font-title-lg text-title-lg font-bold text-tertiary">{gradedCount} Berkas</span>
          </div>
        </div>

        <div className="p-space-md rounded-xl bg-surface-container-low border border-outline-variant/20 shadow-sm flex items-center gap-space-md">
          <div className="w-12 h-12 rounded-xl bg-secondary-container/20 text-secondary flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[24px]">analytics</span>
          </div>
          <div>
            <span className="font-caption text-caption text-on-surface-variant block font-medium">Rata-rata Skor Sesi</span>
            <span className="font-title-lg text-title-lg font-bold text-secondary">{averageScore} / 100</span>
          </div>
        </div>
      </div>

      {/* Filters & Selector Bar */}
      <div className="bg-surface-container-low rounded-xl border border-outline-variant/20 p-space-md shadow-sm mb-space-md flex flex-col md:flex-row items-stretch md:items-center justify-between gap-space-md">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-space-sm flex-1">
          {/* Course Selector */}
          <select
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            className="px-3 py-2 rounded-lg bg-surface-container border border-outline-variant/30 text-on-surface font-label-md text-label-md font-medium focus:outline-none focus:ring-1 focus:ring-primary"
          >
            {courses.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>

          {/* Task Selector */}
          <select
            value={selectedTask}
            onChange={(e) => setSelectedTask(e.target.value)}
            className="px-3 py-2 rounded-lg bg-surface-container border border-outline-variant/30 text-on-surface font-label-md text-label-md font-medium focus:outline-none focus:ring-1 focus:ring-primary"
          >
            {tasks.map((t) => (
              <option key={t.id} value={t.id}>{t.title}</option>
            ))}
          </select>
        </div>

        {/* Search & Filter chips */}
        <div className="flex items-center gap-space-sm flex-wrap">
          <div className="flex items-center gap-1 bg-surface-container-high rounded-lg p-1 border border-outline-variant/20">
            <button
              type="button"
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1 rounded-md text-[12px] font-semibold transition-all ${
                statusFilter === 'all'
                  ? 'bg-primary-container text-on-primary-container shadow-sm'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              Semua ({totalSubmitted})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('pending')}
              className={`px-3 py-1 rounded-md text-[12px] font-semibold transition-all ${
                statusFilter === 'pending'
                  ? 'bg-error-container text-on-error-container shadow-sm'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              Menunggu ({pendingCount})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('graded')}
              className={`px-3 py-1 rounded-md text-[12px] font-semibold transition-all ${
                statusFilter === 'graded'
                  ? 'bg-tertiary-container text-on-tertiary-container shadow-sm'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              Selesai ({gradedCount})
            </button>
          </div>

          <div className="relative">
            <input
              type="text"
              placeholder="Cari NIM / Nama..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 rounded-lg bg-surface-container border border-outline-variant/30 text-on-surface text-label-sm placeholder:text-on-surface-variant focus:outline-none focus:ring-1 focus:ring-primary"
            />
            <span className="material-symbols-outlined absolute left-2 top-2 text-[16px] text-on-surface-variant">
              search
            </span>
          </div>
        </div>
      </div>

      {/* Submissions Table */}
      <div className="bg-surface-container-low rounded-xl border border-outline-variant/20 shadow-sm overflow-hidden mb-space-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container border-b border-outline-variant/20 text-on-surface-variant font-label-md text-[12px] uppercase tracking-wider">
                <th className="py-3 px-4 font-bold">Mahasiswa &amp; NIM</th>
                <th className="py-3 px-4 font-bold">Waktu Pengumpulan</th>
                <th className="py-3 px-4 font-bold">Berkas Tugas</th>
                <th className="py-3 px-4 font-bold text-center">Status &amp; Skor</th>
                <th className="py-3 px-4 font-bold text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/10 font-body-sm text-body-sm">
              {filteredSubmissions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-on-surface-variant">
                    <span className="material-symbols-outlined text-[36px] text-outline block mb-2">assignment_late</span>
                    Tidak ada data pengumpulan tugas yang cocok dengan filter.
                  </td>
                </tr>
              ) : (
                filteredSubmissions.map((sub) => (
                  <tr key={sub.id} className="hover:bg-surface-container/50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-primary-container/30 text-primary font-bold flex items-center justify-center text-xs">
                          {sub.name.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                        </div>
                        <div>
                          <span className="font-semibold text-on-surface block">{sub.name}</span>
                          <span className="font-mono text-[12px] text-on-surface-variant">NIM: {sub.nim}</span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4 text-on-surface-variant">
                      <div className="flex items-center gap-1.5">
                        <span>{sub.submittedAt}</span>
                        {sub.isLate && (
                          <span className="px-1.5 py-0.5 rounded bg-error-container text-error text-[10px] font-bold">
                            Terlambat
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <button
                        type="button"
                        onClick={() => showToast(`Mengunduh berkas: ${sub.fileName}`)}
                        className="inline-flex items-center gap-1.5 text-primary hover:underline font-medium"
                      >
                        <span className="material-symbols-outlined text-[18px]">description</span>
                        <span className="truncate max-w-[180px]">{sub.fileName}</span>
                        <span className="text-[11px] text-outline">({sub.fileSize})</span>
                      </button>
                    </td>

                    <td className="py-3 px-4 text-center">
                      {sub.status === 'graded' ? (
                        <div className="inline-flex flex-col items-center">
                          <span className="px-2.5 py-1 rounded-lg bg-tertiary-container/30 text-tertiary font-title-sm font-bold border border-tertiary/30">
                            {sub.score} / 100
                          </span>
                          <span className="text-[10px] text-tertiary font-semibold mt-0.5">Sudah Dinilai</span>
                        </div>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-error-container/20 text-error font-label-sm text-[12px] font-semibold border border-error/20">
                          <span className="material-symbols-outlined text-[14px]">schedule</span>
                          Belum Dinilai
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => handleOpenGrading(sub)}
                        className={`px-3 py-1.5 rounded-lg text-label-sm font-bold transition-all inline-flex items-center gap-1.5 shadow-sm ${
                          sub.status === 'graded'
                            ? 'bg-surface-container-high hover:bg-surface-bright text-on-surface border border-outline-variant/30'
                            : 'bg-primary text-on-primary hover:bg-primary/90'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[16px]">
                          {sub.status === 'graded' ? 'edit' : 'grading'}
                        </span>
                        <span>{sub.status === 'graded' ? 'Ubah Nilai' : 'Beri Nilai'}</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Interactive Rubric Grading Modal */}
      {gradingModalOpen && currentSubmission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-overlay backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-2xl bg-surface-container-low rounded-2xl shadow-2xl border border-outline-variant/30 p-space-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-space-sm border-b border-outline-variant/20 mb-space-md">
              <div>
                <h2 className="font-title-lg text-title-lg font-bold text-on-surface">
                  Lembar Penilaian &amp; Rubrik OBE
                </h2>
                <p className="font-caption text-caption text-on-surface-variant">
                  Mahasiswa: <span className="font-semibold text-on-surface">{currentSubmission.name}</span> ({currentSubmission.nim})
                </p>
              </div>
              <button
                type="button"
                onClick={() => setGradingModalOpen(false)}
                className="p-1 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high"
              >
                <span className="material-symbols-outlined text-[22px]">close</span>
              </button>
            </div>

            <form onSubmit={handleSaveGrading} className="flex flex-col gap-space-md">
              {/* CPMK Rubric 1 */}
              <div className="p-space-sm rounded-xl bg-surface-container border border-outline-variant/20">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-label-md text-label-md font-semibold text-on-surface">
                    1. Kelengkapan Analisis Kebutuhan &amp; SRS (Bobot 35%)
                  </span>
                  <span className="font-title-md font-bold text-primary">{cpmk1Score}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={cpmk1Score}
                  onChange={(e) => setCpmk1Score(Number(e.target.value))}
                  className="w-full accent-primary"
                />
                <span className="text-[11px] text-on-surface-variant">Capaian Pembelajaran: CPMK-1 (Pemahaman Spesifikasi Perangkat Lunak)</span>
              </div>

              {/* CPMK Rubric 2 */}
              <div className="p-space-sm rounded-xl bg-surface-container border border-outline-variant/20">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-label-md text-label-md font-semibold text-on-surface">
                    2. Akurasi &amp; Notasi Diagram UML Terdistribusi (Bobot 35%)
                  </span>
                  <span className="font-title-md font-bold text-primary">{cpmk2Score}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={cpmk2Score}
                  onChange={(e) => setCpmk2Score(Number(e.target.value))}
                  className="w-full accent-primary"
                />
                <span className="text-[11px] text-on-surface-variant">Capaian Pembelajaran: CPMK-2 (Pemodelan Sistem dengan Standar OMG UML)</span>
              </div>

              {/* CPMK Rubric 3 */}
              <div className="p-space-sm rounded-xl bg-surface-container border border-outline-variant/20">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-label-md text-label-md font-semibold text-on-surface">
                    3. Kerapihan Tata Tulis &amp; Format IEEE 830 (Bobot 30%)
                  </span>
                  <span className="font-title-md font-bold text-primary">{cpmk3Score}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={cpmk3Score}
                  onChange={(e) => setCpmk3Score(Number(e.target.value))}
                  className="w-full accent-primary"
                />
                <span className="text-[11px] text-on-surface-variant">Standar Dokumentasi Rekayasa Perangkat Lunak</span>
              </div>

              {/* Final Score Preview */}
              <div className="p-space-md rounded-xl bg-tertiary-container/20 border border-tertiary/30 flex items-center justify-between">
                <div>
                  <span className="font-label-md font-bold text-on-surface block">Kalkulasi Nilai Akhir Tugas</span>
                  <span className="font-caption text-caption text-on-surface-variant">
                    Formula: (CPMK1 × 35%) + (CPMK2 × 35%) + (CPMK3 × 30%)
                  </span>
                </div>
                <div className="text-right">
                  <span className="font-headline-md font-bold text-tertiary">
                    {Math.round(cpmk1Score * 0.35 + cpmk2Score * 0.35 + cpmk3Score * 0.3)}
                  </span>
                  <span className="font-label-sm text-outline block">/ 100</span>
                </div>
              </div>

              {/* Feedback Note */}
              <div>
                <label className="block font-label-md font-semibold text-on-surface mb-1">
                  Catatan Evaluator / Feedback Dosen
                </label>
                <textarea
                  rows={3}
                  value={feedbackNote}
                  onChange={(e) => setFeedbackNote(e.target.value)}
                  placeholder="Berikan umpan balik konstruktif bagi mahasiswa..."
                  className="w-full px-3 py-2 rounded-lg bg-surface-container border border-outline-variant/30 text-on-surface text-body-sm focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-space-sm pt-space-sm border-t border-outline-variant/20">
                <button
                  type="button"
                  onClick={() => setGradingModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-surface-container-high hover:bg-surface-bright text-on-surface font-label-md font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-primary text-on-primary font-label-md font-bold hover:bg-primary/90 transition-all shadow-md flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-[18px]">check_circle</span>
                  <span>Simpan &amp; Publikasikan Nilai</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppShell>
  );
}
