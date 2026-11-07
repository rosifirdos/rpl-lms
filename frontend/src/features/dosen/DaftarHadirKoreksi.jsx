import React, { useState } from 'react';
import AppShell from '../../components/AppShell';

/**
 * DaftarHadirKoreksi — Feature Component
 * Antarmuka Dosen Pengampu untuk memantau presensi langsung pertemuan tertentu,
 * dan melakukan koreksi status kehadiran mahasiswa (HADIR/SAKIT/IZIN/ALPA).
 * Berdasarkan desain daftar_hadir_koreksi.html (MVP 2).
 */
export default function DaftarHadirKoreksi({ onNavigate, onRoleChange }) {
  const [sessionActive, setSessionActive] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL'); // 'ALL' | 'HADIR' | 'SAKIT' | 'IZIN' | 'ALPA'
  const [correctionModal, setCorrectionModal] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState('HADIR');
  const [correctionNote, setCorrectionNote] = useState('');
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const [students, setStudents] = useState([
    { id: 1, nim: '2024001001', name: 'Dimas Arya Pratama', time: '09:18 WIB', status: 'HADIR', note: 'Check-in mandiri mahasiswa via mobile web' },
    { id: 2, nim: '2024001002', name: 'Adinda Putri Maharani', time: '09:20 WIB', status: 'HADIR', note: 'Check-in mandiri laboratorium' },
    { id: 3, nim: '2024001003', name: 'Rian Bagus Santoso', time: '-', status: 'SAKIT', note: 'Surat dokter terlampir (Klinik Pratama UPGRIS)' },
    { id: 4, nim: '2024001004', name: 'Nabila Zahra Khairunnisa', time: '09:25 WIB', status: 'HADIR', note: 'Check-in mandiri mahasiswa' },
    { id: 5, nim: '2024001005', name: 'Fajar Kurniawan', time: '-', status: 'ALPA', note: 'Tidak hadir tanpa keterangan' },
    { id: 6, nim: '2024001006', name: 'Siti Nur Aisyah', time: '09:16 WIB', status: 'HADIR', note: 'Check-in mandiri laboratorium' },
    { id: 7, nim: '2024001007', name: 'Muhammad Rizky Pratama', time: '-', status: 'IZIN', note: 'Dispensasi delegasi lomba karya tulis ilmiah' },
    { id: 8, nim: '2024001008', name: 'Dewi Lestari', time: '09:28 WIB', status: 'HADIR', note: 'Check-in mandiri mahasiswa' },
    { id: 9, nim: '2024001009', name: 'Bagas Aditya Nugraha', time: '09:19 WIB', status: 'HADIR', note: 'Check-in mandiri mahasiswa' },
    { id: 10, nim: '2024001010', name: 'Tri Wahyuni', time: '-', status: 'ALPA', note: 'Tidak hadir tanpa keterangan' },
  ]);

  const handleOpenCorrection = (student) => {
    setCorrectionModal(student);
    setSelectedStatus(student.status);
    setCorrectionNote(student.note);
  };

  const handleSaveCorrection = () => {
    if (!correctionModal) return;
    setStudents((prev) =>
      prev.map((s) =>
        s.id === correctionModal.id
          ? {
              ...s,
              status: selectedStatus,
              note: correctionNote || `Dikoreksi oleh Dosen Pengampu: Status diubah ke ${selectedStatus}`,
              time: selectedStatus === 'HADIR' && s.time === '-' ? '09:30 WIB (Koreksi)' : s.time,
            }
          : s
      )
    );
    showToast(`Presensi ${correctionModal.name} berhasil dikoreksi ke ${selectedStatus}`);
    setCorrectionModal(null);
  };

  // Metrics
  const hadirCount = students.filter((s) => s.status === 'HADIR').length;
  const sakitCount = students.filter((s) => s.status === 'SAKIT').length;
  const izinCount = students.filter((s) => s.status === 'IZIN').length;
  const alpaCount = students.filter((s) => s.status === 'ALPA').length;

  const filteredStudents = students.filter((s) => {
    const matchSearch =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.nim.toLowerCase().includes(searchQuery.toLowerCase());
    const matchFilter = filterStatus === 'ALL' || s.status === filterStatus;
    return matchSearch && matchFilter;
  });

  return (
    <AppShell
      activeRole="dosen"
      onRoleChange={onRoleChange}
      activeNavPath="kelas-diampu"
      onNavChange={onNavigate}
    >
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-surface-container-highest text-on-surface px-4 py-3 rounded-xl shadow-2xl border border-primary/30">
          <span className="material-symbols-outlined text-primary text-[20px]">check_circle</span>
          <span className="font-label-md text-sm">{toastMessage}</span>
        </div>
      )}

      {/* Correction Modal */}
      {correctionModal && (
        <div className="fixed inset-0 z-50 bg-overlay backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface-container rounded-2xl max-w-md w-full p-6 border border-outline-variant/30 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-outline-variant/20">
              <div>
                <h3 className="text-title-lg font-bold text-on-surface">Koreksi Presensi Mahasiswa</h3>
                <p className="text-body-sm text-on-surface-variant font-mono">
                  {correctionModal.nim} • {correctionModal.name}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setCorrectionModal(null)}
                className="text-outline hover:text-on-surface p-1"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* Radio Status Options */}
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-outline block">
                Pilih Status Kehadiran Baru:
              </span>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { key: 'HADIR', label: 'HADIR', bg: 'bg-success-soft text-success-ink border-success-border' },
                  { key: 'SAKIT', label: 'SAKIT', bg: 'bg-info-soft text-info-ink border-info-border' },
                  { key: 'IZIN', label: 'IZIN', bg: 'bg-warning-soft text-warning-ink border-warning-border' },
                  { key: 'ALPA', label: 'ALPA', bg: 'bg-danger-soft text-danger-ink border-danger-border' },
                ].map((item) => (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => setSelectedStatus(item.key)}
                    className={`p-2.5 rounded-lg border font-bold text-sm flex items-center justify-center gap-2 transition-all ${
                      selectedStatus === item.key
                        ? `${item.bg} ring-2 ring-primary`
                        : 'bg-surface-container-high text-on-surface-variant border-outline-variant/20 hover:bg-surface-bright'
                    }`}
                  >
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Notes Field */}
            <div>
              <label className="text-xs uppercase font-bold text-outline block mb-1">
                Alasan / Catatan Koreksi
              </label>
              <textarea
                rows="3"
                value={correctionNote}
                onChange={(e) => setCorrectionNote(e.target.value)}
                placeholder="Contoh: Mengikuti sesi pengganti atau surat izin telah diverifikasi..."
                className="w-full bg-surface-container-high text-on-surface p-2.5 rounded-lg border border-outline-variant/30 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              ></textarea>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setCorrectionModal(null)}
                className="px-4 py-2 rounded-lg bg-surface-container-high text-on-surface hover:bg-surface-bright text-sm"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSaveCorrection}
                className="px-4 py-2 rounded-lg bg-primary text-on-primary font-bold text-sm shadow-md"
              >
                Simpan Koreksi
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col w-full space-y-space-md">
        {/* Breadcrumb */}
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
              onClick={() => onNavigate && onNavigate('kelola-kelas')}
              className="text-on-surface-variant hover:text-primary transition-colors"
            >
              Rekayasa Perangkat Lunak (TI-A)
            </button>
            <span>/</span>
            <span className="text-secondary font-label-sm font-semibold">Daftar Hadir Pertemuan 3</span>
          </nav>
          <div className="flex items-center gap-space-sm bg-surface-container-high/80 px-3 py-1.5 rounded-lg shadow-sm">
            <span className="font-caption text-caption text-on-surface-variant">KOREKSI PRESENSI DOSEN</span>
            <span className="text-outline">|</span>
            <span className="font-label-sm text-label-sm text-secondary">NIDN: 0612345601</span>
          </div>
        </div>

        {/* Page Header */}
        <section className="bg-surface-container-low rounded-xl p-space-lg shadow-xl relative overflow-hidden border border-outline-variant/20">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-space-md">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-mono text-xs font-bold px-2.5 py-0.5 rounded bg-primary-container text-on-primary-container">
                  PERTEMUAN 3 (P-3)
                </span>
                {sessionActive ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-success-soft text-success-ink font-label-sm text-xs font-semibold border border-success-border">
                    <span className="w-2 h-2 rounded-full bg-success-solid animate-pulse"></span>
                    Sesi Presensi Aktif
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-surface-container text-outline font-label-sm text-xs font-semibold">
                    <span className="material-symbols-outlined text-[14px]">lock</span>
                    Sesi Ditutup
                  </span>
                )}
              </div>
              <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight font-bold">
                Lembar Kehadiran — Analisis Kebutuhan Sistem
              </h1>
              <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
                Dibuka 09:15 WIB (Toleransi 15 Mnt) • Verifikasi token dinamis laboratorium komputasi
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => {
                  setSessionActive(!sessionActive);
                  showToast(sessionActive ? 'Sesi presensi DITUTUP' : 'Sesi presensi DIBUKA kembali');
                }}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg font-label-md text-label-md transition-all ${
                  sessionActive
                    ? 'bg-danger-soft text-danger-ink hover:bg-danger-soft/60 border border-danger-border'
                    : 'bg-success-soft text-success-ink hover:bg-success-soft/60 border border-success-border'
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">
                  {sessionActive ? 'lock_clock' : 'timer'}
                </span>
                <span>{sessionActive ? 'Tutup Sesi Presensi' : 'Buka Kembali Sesi'}</span>
              </button>
              <button
                type="button"
                onClick={() => onNavigate && onNavigate('rekap-kehadiran')}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-surface-container-high hover:bg-surface-container-highest text-on-surface font-label-md text-label-md border border-outline-variant/30 transition-all"
              >
                <span className="material-symbols-outlined text-[18px] text-tertiary">table_chart</span>
                <span>Rekapitulasi Kelas</span>
              </button>
            </div>
          </div>
        </section>

        {/* 4 Summary Metrics Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-4 rounded-xl bg-success-soft border border-success-border flex items-center justify-between">
            <div>
              <span className="text-caption font-bold uppercase tracking-wider text-success-ink">HADIR</span>
              <div className="text-headline-md font-extrabold text-success-ink leading-tight mt-1">{hadirCount}</div>
            </div>
            <div className="w-10 h-10 rounded-full bg-success-soft text-success-ink flex items-center justify-center">
              <span className="material-symbols-outlined text-[22px]">check_circle</span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-info-soft border border-info-border flex items-center justify-between">
            <div>
              <span className="text-caption font-bold uppercase tracking-wider text-info-ink">SAKIT</span>
              <div className="text-headline-md font-extrabold text-info-ink leading-tight mt-1">{sakitCount}</div>
            </div>
            <div className="w-10 h-10 rounded-full bg-info-soft text-info-ink flex items-center justify-center">
              <span className="material-symbols-outlined text-[22px]">medical_services</span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-warning-soft border border-warning-border flex items-center justify-between">
            <div>
              <span className="text-caption font-bold uppercase tracking-wider text-warning-ink">IZIN</span>
              <div className="text-headline-md font-extrabold text-warning-ink leading-tight mt-1">{izinCount}</div>
            </div>
            <div className="w-10 h-10 rounded-full bg-warning-soft text-warning-ink flex items-center justify-center">
              <span className="material-symbols-outlined text-[22px]">description</span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-danger-soft border border-danger-border flex items-center justify-between">
            <div>
              <span className="text-caption font-bold uppercase tracking-wider text-danger-ink">ALPA</span>
              <div className="text-headline-md font-extrabold text-danger-ink leading-tight mt-1">{alpaCount}</div>
            </div>
            <div className="w-10 h-10 rounded-full bg-danger-soft text-danger-ink flex items-center justify-center">
              <span className="material-symbols-outlined text-[22px]">cancel</span>
            </div>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="bg-surface-container-low rounded-xl p-space-md flex flex-wrap items-center justify-between gap-space-md border border-outline-variant/20">
          <div className="flex flex-wrap items-center gap-1.5">
            {['ALL', 'HADIR', 'SAKIT', 'IZIN', 'ALPA'].map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setFilterStatus(st)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  filterStatus === st
                    ? 'bg-primary-container text-on-primary-container shadow-sm'
                    : 'bg-surface-container text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'
                }`}
              >
                {st === 'ALL' ? 'Semua' : st}
              </button>
            ))}
          </div>

          <div className="relative min-w-[240px] max-w-sm flex-1">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[18px]">
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama atau NIM..."
              className="w-full bg-surface-container text-on-surface font-body-sm text-body-sm pl-9 pr-3 py-2 rounded-lg placeholder:text-outline border border-outline-variant/30 focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>

        {/* Table */}
        <div className="bg-surface-container-low rounded-xl border border-outline-variant/20 overflow-hidden shadow-lg">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container text-on-surface text-caption uppercase tracking-wider font-semibold border-b border-outline-variant/20">
                  <th className="py-3 px-4 w-12 text-center">No</th>
                  <th className="py-3 px-4 min-w-[130px]">NIM</th>
                  <th className="py-3 px-4 min-w-[220px]">Nama Mahasiswa</th>
                  <th className="py-3 px-4 min-w-[120px]">Waktu Check-in</th>
                  <th className="py-3 px-4 min-w-[120px] text-center">Status</th>
                  <th className="py-3 px-4 min-w-[260px]">Catatan / Keterangan</th>
                  <th className="py-3 px-4 min-w-[110px] text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/15 text-body-sm">
                {filteredStudents.map((st, idx) => (
                  <tr key={st.id} className="hover:bg-surface-container/50 transition-colors">
                    <td className="py-3 px-4 text-center text-outline">{idx + 1}</td>
                    <td className="py-3 px-4 font-mono font-medium text-secondary">{st.nim}</td>
                    <td className="py-3 px-4 font-semibold text-on-surface">{st.name}</td>
                    <td className="py-3 px-4 font-mono text-xs text-on-surface-variant">{st.time}</td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          st.status === 'HADIR'
                            ? 'bg-success-soft text-success-ink'
                            : st.status === 'SAKIT'
                            ? 'bg-info-soft text-info-ink'
                            : st.status === 'IZIN'
                            ? 'bg-warning-soft text-warning-ink'
                            : 'bg-danger-soft text-danger-ink'
                        }`}
                      >
                        {st.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-xs text-on-surface-variant truncate max-w-xs">{st.note}</td>
                    <td className="py-3 px-4 text-center">
                      <button
                        type="button"
                        onClick={() => handleOpenCorrection(st)}
                        className="px-2.5 py-1 rounded bg-surface-container-high hover:bg-surface-bright text-primary font-label-sm text-xs font-semibold transition-colors border border-outline-variant/30"
                      >
                        Koreksi
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
