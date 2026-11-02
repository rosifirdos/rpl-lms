import React, { useState } from 'react';
import AppShell from '../../components/AppShell';

/**
 * KelolaKls — Feature Component
 * Antarmuka Dosen Pengampu untuk mengelola 16 Pertemuan Silabus OBE,
 * distribusi materi ajar, dan kontrol sesi presensi digital.
 * Berdasarkan desain kelola_kls.html (MVP 2).
 */
export default function KelolaKls({ onNavigate, onRoleChange }) {
  const [activeTab, setActiveTab] = useState('pertemuan'); // 'pertemuan' | 'rekap' | 'mahasiswa'
  const [openAccordions, setOpenAccordions] = useState({ p1: false, p2: false, p3: true });
  const [sessionActive, setSessionActive] = useState(true);
  const [toastMessage, setToastMessage] = useState(null);
  const [editMeetingModal, setEditMeetingModal] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const toggleAccordion = (id) => {
    setOpenAccordions((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const toggleAll = (open) => {
    const nextState = {};
    for (let i = 1; i <= 16; i++) {
      nextState[`p${i}`] = open;
    }
    setOpenAccordions(nextState);
    showToast(open ? 'Semua pertemuan diperluas' : 'Semua pertemuan ditutup');
  };

  const handleToggleSession = () => {
    if (sessionActive) {
      setSessionActive(false);
      showToast('Sesi presensi Pertemuan 3 telah DITUTUP.');
    } else {
      setSessionActive(true);
      showToast('Sesi presensi Pertemuan 3 telah DIBUKA (Toleransi 15 Menit).');
    }
  };

  const meetings = [
    {
      id: 'p1',
      number: 1,
      tag: 'Pra-UTS',
      title: 'Pengenalan Rekayasa Perangkat Lunak & SDLC',
      materialsCount: 2,
      attendanceInfo: 'Ditutup (36/38)',
      isPublished: true,
      attendanceStatus: 'CLOSED',
    },
    {
      id: 'p2',
      number: 2,
      tag: 'Pra-UTS',
      title: 'Model Proses Perangkat Lunak (Agile & Waterfall)',
      materialsCount: 3,
      attendanceInfo: 'Ditutup (37/38)',
      isPublished: true,
      attendanceStatus: 'CLOSED',
    },
    {
      id: 'p3',
      number: 3,
      tag: 'Pra-UTS',
      title: 'Analisis Kebutuhan Sistem & Spesifikasi SRS IEEE 830',
      materialsCount: 2,
      attendanceInfo: sessionActive ? 'Aktif (32/38 Hadir)' : 'Ditutup (32/38)',
      isPublished: true,
      attendanceStatus: sessionActive ? 'OPEN' : 'CLOSED',
    },
    {
      id: 'p4',
      number: 4,
      tag: 'Pra-UTS',
      title: 'Pemodelan Berorientasi Objek: Use Case & Activity Diagram',
      materialsCount: 1,
      attendanceInfo: 'Belum Dibuka',
      isPublished: true,
      attendanceStatus: 'UNOPENED',
    },
    {
      id: 'p5',
      number: 5,
      tag: 'Pra-UTS',
      title: 'Pemodelan Statis & Dinamis: Class & Sequence Diagram',
      materialsCount: 0,
      attendanceInfo: 'Belum Dibuka',
      isPublished: false,
      attendanceStatus: 'UNOPENED',
    },
    {
      id: 'p8',
      number: 8,
      tag: 'UTS',
      title: 'UJIAN TENGAH SEMESTER (UTS)',
      materialsCount: 0,
      attendanceInfo: 'Jadwal 10 Nov',
      isPublished: false,
      attendanceStatus: 'UNOPENED',
      isExam: true,
    },
    {
      id: 'p16',
      number: 16,
      tag: 'UAS',
      title: 'UJIAN AKHIR SEMESTER (UAS) & DEMO PROYEK',
      materialsCount: 0,
      attendanceInfo: 'Jadwal 05 Jan',
      isPublished: false,
      attendanceStatus: 'UNOPENED',
      isExam: true,
    },
  ];

  const students = [
    { nim: '2024001001', name: 'Dimas Arya Pratama', status: 'HADIR', time: '08:15 WIB' },
    { nim: '2024001002', name: 'Adinda Putri Maharani', status: 'HADIR', time: '08:18 WIB' },
    { nim: '2024001003', name: 'Rian Bagus Santoso', status: 'SAKIT', time: '-' },
    { nim: '2024001004', name: 'Nabila Zahra', status: 'HADIR', time: '08:22 WIB' },
    { nim: '2024001005', name: 'Fajar Kurniawan', status: 'ALPA', time: '-' },
  ];

  return (
    <AppShell
      activeRole="dosen"
      onRoleChange={onRoleChange}
      activeNavPath="kelas-diampu"
      onNavChange={onNavigate}
    >
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-surface-container-highest text-on-surface px-4 py-3 rounded-xl shadow-2xl border border-primary/30">
          <span className="material-symbols-outlined text-primary text-[20px]">info</span>
          <span className="font-label-md text-sm">{toastMessage}</span>
        </div>
      )}

      {/* Edit Topic Modal */}
      {editMeetingModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface-container rounded-2xl max-w-lg w-full p-6 border border-outline-variant/30 shadow-2xl">
            <h3 className="text-title-lg font-bold text-on-surface mb-2">
              Ubah Topik Pertemuan {editMeetingModal.number}
            </h3>
            <p className="text-body-sm text-on-surface-variant mb-4">
              Perbarui judul materi dan capaian pembelajaran sesuai Rencana Pembelajaran Semester.
            </p>
            <div className="space-y-3">
              <div>
                <label className="text-xs uppercase font-bold text-outline">Judul Pertemuan</label>
                <input
                  type="text"
                  defaultValue={editMeetingModal.title}
                  className="w-full mt-1 bg-surface-container-high text-on-surface p-2.5 rounded-lg border border-outline-variant/30 focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <div>
                <label className="text-xs uppercase font-bold text-outline">Capaian Pembelajaran (CPMK)</label>
                <textarea
                  rows="3"
                  defaultValue="Mahasiswa mampu merumuskan spesifikasi kebutuhan fungsional dan non-fungsional sesuai standar IEEE 830."
                  className="w-full mt-1 bg-surface-container-high text-on-surface p-2.5 rounded-lg border border-outline-variant/30 focus:outline-none focus:ring-1 focus:ring-primary text-sm"
                ></textarea>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button
                type="button"
                onClick={() => setEditMeetingModal(null)}
                className="px-4 py-2 rounded-lg bg-surface-container-high text-on-surface hover:bg-surface-bright"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  setEditMeetingModal(null);
                  showToast('Topik pertemuan berhasil disimpan');
                }}
                className="px-4 py-2 rounded-lg bg-primary text-on-primary font-bold shadow-md"
              >
                Simpan Perubahan
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col w-full space-y-space-md">
        {/* Breadcrumb & Context Banner */}
        <div className="flex flex-wrap items-center justify-between gap-space-sm">
          <nav className="flex items-center gap-2 font-body-sm text-body-sm text-outline">
            <button
              onClick={() => onNavigate && onNavigate('dasbor-dosen')}
              className="hover:text-primary transition-colors flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-[16px]">home</span>
              Dasbor
            </button>
            <span>/</span>
            <button
              onClick={() => onNavigate && onNavigate('kelas-diampu')}
              className="text-on-surface-variant hover:text-primary transition-colors"
            >
              Kelas Diampu
            </button>
            <span>/</span>
            <span className="text-secondary font-label-sm font-semibold">
              Rekayasa Perangkat Lunak (TI-A)
            </span>
            <span>/</span>
            <span className="text-primary font-label-sm bg-surface-container-high px-2 py-0.5 rounded">
              Mode Kelola Dosen
            </span>
          </nav>
          <div className="flex items-center gap-space-sm bg-surface-container-high/80 px-3 py-1.5 rounded-lg shadow-sm">
            <span className="w-2 h-2 rounded-full bg-tertiary animate-ping"></span>
            <span className="font-caption text-caption text-on-surface-variant">SINKRONISASI SIAKAD: AKTIF</span>
            <span className="text-outline">|</span>
            <span className="font-label-sm text-label-sm text-secondary">NIDN: 0612345601</span>
          </div>
        </div>

        {/* Class Header Banner */}
        <section className="bg-surface-container-low rounded-xl p-space-lg shadow-xl relative overflow-hidden border border-outline-variant/20">
          <div className="absolute -right-16 -top-16 w-80 h-80 rounded-full bg-primary/5 blur-3xl pointer-events-none"></div>

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-start lg:justify-between gap-space-lg">
            {/* Left Badges & Title */}
            <div className="flex-1 space-y-space-sm">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-label-sm text-label-sm bg-primary-container text-on-primary-container px-2.5 py-1 rounded font-bold">
                  TI-A
                </span>
                <span className="font-label-sm text-label-sm bg-surface-container-highest text-secondary px-2.5 py-1 rounded font-medium">
                  3 SKS • Teori &amp; Praktik
                </span>
                <span className="font-label-sm text-label-sm bg-surface-container text-on-surface-variant px-2.5 py-1 rounded">
                  Reguler Pagi
                </span>
                <span className="font-caption text-caption bg-surface-container-lowest text-outline px-2 py-1 rounded font-mono">
                  Kode MK: TIF-301
                </span>
              </div>

              <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight font-bold">
                Rekayasa Perangkat Lunak
              </h1>

              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-y-2 gap-x-4 pt-1 font-body-sm text-body-sm text-on-surface-variant">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px] text-secondary">group</span>
                  <span>38 Mahasiswa Terdaftar (Maks: 40)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px] text-tertiary">calendar_month</span>
                  <span>Semester Ganjil 2026/2027</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px] text-primary">auto_stories</span>
                  <span>16 Pertemuan (SN-Dikti OBE)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px] text-secondary">schedule</span>
                  <span>Senin, 08:00 - 10:30 WIB • Lab 3</span>
                </div>
              </div>
            </div>

            {/* Right Quick Actions */}
            <div className="flex flex-wrap items-center gap-space-sm shrink-0">
              <button
                type="button"
                onClick={() => onNavigate && onNavigate('unggah-materi')}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-surface-container-high hover:bg-surface-container-highest text-on-surface font-label-md text-label-md transition-all shadow-sm border border-outline-variant/30"
              >
                <span className="material-symbols-outlined text-[18px] text-secondary">cloud_upload</span>
                <span>Unggah Materi Cepat</span>
              </button>
              <button
                type="button"
                onClick={() => onNavigate && onNavigate('rekap-kehadiran')}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-surface-container-high hover:bg-surface-container-highest text-on-surface font-label-md text-label-md transition-all shadow-sm border border-outline-variant/30"
              >
                <span className="material-symbols-outlined text-[18px] text-tertiary">table_chart</span>
                <span>Rekap Presensi &amp; Nilai</span>
              </button>
              <button
                type="button"
                onClick={() => showToast('Membuka wizard pembuatan tugas baru (MVP 3)')}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary-container text-on-primary-container hover:bg-primary font-label-md text-label-md shadow-md transition-all font-semibold"
              >
                <span className="material-symbols-outlined text-[18px]">add_circle</span>
                <span>+ Buat Tugas Baru</span>
              </button>
            </div>
          </div>

          {/* Navigation Tabs Bar */}
          <div className="flex items-center gap-6 mt-6 border-b border-outline-variant/20 overflow-x-auto">
            <button
              type="button"
              onClick={() => setActiveTab('pertemuan')}
              className={`pb-3 text-sm font-bold flex items-center gap-1.5 transition-colors border-b-2 whitespace-nowrap ${
                activeTab === 'pertemuan'
                  ? 'text-primary border-primary'
                  : 'text-on-surface-variant border-transparent hover:text-on-surface'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">view_timeline</span>
              <span>Pertemuan (16 Sesi)</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('rekap')}
              className={`pb-3 text-sm font-bold flex items-center gap-1.5 transition-colors border-b-2 whitespace-nowrap ${
                activeTab === 'rekap'
                  ? 'text-primary border-primary'
                  : 'text-on-surface-variant border-transparent hover:text-on-surface'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">how_to_reg</span>
              <span>Rekap Kehadiran (38 Mhs)</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('mahasiswa')}
              className={`pb-3 text-sm font-bold flex items-center gap-1.5 transition-colors border-b-2 whitespace-nowrap ${
                activeTab === 'mahasiswa'
                  ? 'text-primary border-primary'
                  : 'text-on-surface-variant border-transparent hover:text-on-surface'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">group</span>
              <span>Daftar Mahasiswa (Enrolled)</span>
            </button>
          </div>
        </section>

        {/* 2-COLUMN MAIN WORKSPACE */}
        <div className="flex flex-col lg:flex-row gap-space-lg items-start">
          {/* LEFT COLUMN: 16-MEETINGS ACCORDION MANAGER (~70%) */}
          <div className="flex-1 w-full space-y-space-md min-w-0">
            {/* Header Controls */}
            <div className="bg-surface-container-low rounded-xl p-space-md flex flex-wrap items-center justify-between gap-space-sm shadow-sm border border-outline-variant/20">
              <div className="flex items-center gap-space-sm flex-wrap">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-[20px]">account_tree</span>
                  <span className="font-title-md text-title-md text-on-surface font-semibold">
                    Silabus &amp; Sesi Perkuliahan
                  </span>
                </div>
                <span className="font-label-sm text-label-sm bg-tertiary-container/30 text-tertiary px-2.5 py-0.5 rounded-full font-medium">
                  3 / 16 Terlaksana
                </span>
                <span className="font-caption text-caption text-outline">OBE-Compliant 2026</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => toggleAll(true)}
                  className="text-on-surface-variant hover:text-primary font-caption text-caption px-2.5 py-1 rounded bg-surface-container hover:bg-surface-container-high transition-colors border border-outline-variant/20"
                >
                  Perluas Semua
                </button>
                <button
                  type="button"
                  onClick={() => toggleAll(false)}
                  className="text-on-surface-variant hover:text-primary font-caption text-caption px-2.5 py-1 rounded bg-surface-container hover:bg-surface-container-high transition-colors border border-outline-variant/20"
                >
                  Tutup Semua
                </button>
              </div>
            </div>

            {/* Accordion Rows */}
            <div className="space-y-space-sm">
              {meetings.map((m) => {
                const isOpen = openAccordions[m.id];
                return (
                  <div
                    key={m.id}
                    className="bg-surface-container-low rounded-xl border border-outline-variant/20 shadow-sm overflow-hidden transition-all hover:border-primary/30"
                  >
                    <div className="p-4 flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-full bg-surface-container-highest text-secondary flex items-center justify-center font-title-md text-title-md font-bold shrink-0">
                          P{m.number}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-label-md text-label-md text-on-surface font-semibold truncate">
                              {m.title}
                            </span>
                            <span className="font-caption text-caption bg-surface-container text-outline px-2 py-0.5 rounded">
                              {m.tag}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 mt-1 flex-wrap text-caption text-on-surface-variant">
                            <span className="flex items-center gap-1">
                              <span className="material-symbols-outlined text-[14px] text-primary">description</span>
                              {m.materialsCount} Materi
                            </span>
                            <span className="text-outline">•</span>
                            <span className="flex items-center gap-1">
                              <span className="material-symbols-outlined text-[14px]">fact_check</span>
                              {m.attendanceInfo}
                            </span>
                            <span className="text-outline">•</span>
                            <span
                              className={`px-1.5 py-0.5 rounded font-caption ${
                                m.isPublished
                                  ? 'bg-tertiary-container/20 text-tertiary'
                                  : 'bg-surface-container text-outline'
                              }`}
                            >
                              {m.isPublished ? 'Terbit' : 'Draf'}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => setEditMeetingModal(m)}
                          className="px-2.5 py-1 rounded bg-surface-container-high hover:bg-surface-container-highest font-caption text-caption text-on-surface transition-colors"
                        >
                          Ubah
                        </button>
                        <button
                          type="button"
                          onClick={() => onNavigate && onNavigate('menejemen-material')}
                          className="px-2.5 py-1 rounded bg-primary-container text-on-primary-container font-caption text-caption transition-colors"
                        >
                          Materi
                        </button>
                        <button
                          type="button"
                          onClick={() => toggleAccordion(m.id)}
                          className="text-outline hover:text-on-surface"
                        >
                          <span
                            className={`material-symbols-outlined text-[20px] transition-transform ${
                              isOpen ? 'rotate-180' : ''
                            }`}
                          >
                            expand_more
                          </span>
                        </button>
                      </div>
                    </div>

                    {/* Expanded Detail */}
                    {isOpen && (
                      <div className="px-5 pb-5 pt-2 border-t border-outline-variant/20 bg-surface-container/40 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-outline uppercase tracking-wider">
                            Rincian Pertemuan &amp; Aktivitas
                          </span>
                          <button
                            type="button"
                            onClick={() => onNavigate && onNavigate('daftar-hadir-koreksi')}
                            className="text-xs text-secondary hover:underline flex items-center gap-1"
                          >
                            <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                            Buka Daftar Hadir &amp; Koreksi Presensi
                          </button>
                        </div>
                        <p className="text-xs text-on-surface-variant leading-relaxed">
                          Topik ini mencakup pengenalan konsep dan implementasi praktikum di laboratorium komputasi.
                          Seluruh mahasiswa wajib menyelesaikan studi kasus yang telah diunggah.
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* RIGHT COLUMN: QUICK ATTENDANCE & METRIC CONTROLLER (~30%) */}
          <div className="w-full lg:w-80 space-y-space-md shrink-0">
            {/* Quick Session Controller */}
            <div className="bg-surface-container-low rounded-xl p-space-md border border-outline-variant/20 shadow-md space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-outline-variant/20">
                <span className="text-caption font-bold text-outline uppercase tracking-wider">
                  Kontrol Presensi Langsung
                </span>
                <span className="material-symbols-outlined text-primary text-[18px]">how_to_reg</span>
              </div>

              <div>
                <span className="text-xs text-on-surface font-semibold block">Pertemuan 3 (P-3)</span>
                <p className="text-caption text-on-surface-variant mt-0.5">
                  Topik: Analisis Kebutuhan Sistem &amp; SRS IEEE 830
                </p>
              </div>

              <div className="p-3 rounded-lg bg-surface-container border border-outline-variant/20 flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-outline block">Status Sesi:</span>
                  <span className={`text-xs font-bold ${sessionActive ? 'text-tertiary' : 'text-error'}`}>
                    {sessionActive ? 'DIBUKA (Aktif)' : 'DITUTUP'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleToggleSession}
                  className={`px-3 py-1.5 rounded-lg font-label-sm text-xs font-bold transition-all shadow-sm ${
                    sessionActive
                      ? 'bg-error-container text-on-error-container hover:bg-error hover:text-on-error'
                      : 'bg-tertiary-container text-on-tertiary-container hover:bg-tertiary hover:text-on-tertiary'
                  }`}
                >
                  {sessionActive ? 'Tutup Sesi' : 'Buka Sesi Presensi'}
                </button>
              </div>

              <button
                type="button"
                onClick={() => onNavigate && onNavigate('daftar-hadir-koreksi')}
                className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-surface-container-high hover:bg-surface-container-highest text-on-surface font-label-sm text-xs transition-colors"
              >
                <span className="material-symbols-outlined text-[16px] text-secondary">fact_check</span>
                <span>Buka Lembar Kehadiran &amp; Koreksi</span>
              </button>
            </div>

            {/* Attendance Matrix Quick Card */}
            <div className="bg-surface-container-low rounded-xl p-space-md border border-outline-variant/20 shadow-md space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-outline-variant/20">
                <span className="text-caption font-bold text-outline uppercase tracking-wider">
                  Rasio Kehadiran Kelas
                </span>
                <span className="material-symbols-outlined text-tertiary text-[18px]">analytics</span>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-headline-lg font-bold text-on-surface">86.4%</span>
                <span className="text-xs text-tertiary font-semibold">34 / 38 Aman (≥70%)</span>
              </div>
              <button
                type="button"
                onClick={() => onNavigate && onNavigate('rekap-kehadiran')}
                className="w-full py-2 rounded-lg bg-primary-container text-on-primary-container hover:bg-primary font-label-sm text-xs font-semibold transition-colors text-center block"
              >
                Lihat Matriks 16 Pertemuan
              </button>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
