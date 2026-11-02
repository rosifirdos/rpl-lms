import React, { useState } from 'react';
import AppShell from '../../components/AppShell';

/**
 * RekapKehadiran — Feature Component
 * Matriks Rekapitulasi Presensi 16 Pertemuan Terstruktur dan Gatekeeping Kelayakan Ujian (BR-012).
 * Berdasarkan desain rekap_kehadiran.html (MVP 2).
 */
export default function RekapKehadiran({ onNavigate, onRoleChange, activeRole = 'dosen' }) {
  const [filterType, setFilterType] = useState('all'); // 'all' | 'safe' | 'risk'
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const matrixData = [
    {
      id: 1,
      no: 1,
      nim: '2024001001',
      name: 'Dimas Arya Pratama',
      p: ['H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', '-', '-', '-', '-'],
      hadir: 12,
      sia: '0/0/0',
      ratio: '100%',
      isSafe: true,
      statusLabel: 'Memenuhi Syarat',
      statusClass: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    },
    {
      id: 2,
      no: 2,
      nim: '2024001002',
      name: 'Adinda Putri Maharani',
      p: ['H', 'H', 'H', 'H', 'S', 'H', 'H', 'H', 'H', 'H', 'H', 'H', '-', '-', '-', '-'],
      hadir: 11,
      sia: '1/0/0',
      ratio: '91.7%',
      isSafe: true,
      statusLabel: 'Memenuhi Syarat',
      statusClass: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    },
    {
      id: 3,
      no: 3,
      nim: '2024001003',
      name: 'Rian Bagus Santoso',
      p: ['H', 'A', 'S', 'H', 'A', 'H', 'H', 'H', 'A', 'H', 'A', 'H', '-', '-', '-', '-'],
      hadir: 7,
      sia: '1/0/4',
      ratio: '58.3%',
      isSafe: false,
      statusLabel: 'Beresiko (<70%)',
      statusClass: 'bg-rose-500/20 text-rose-400 border-rose-500/30 font-bold',
    },
    {
      id: 4,
      no: 4,
      nim: '2024001004',
      name: 'Nabila Zahra Khairunnisa',
      p: ['H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'I', 'H', 'H', 'H', '-', '-', '-', '-'],
      hadir: 11,
      sia: '0/1/0',
      ratio: '91.7%',
      isSafe: true,
      statusLabel: 'Memenuhi Syarat',
      statusClass: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    },
    {
      id: 5,
      no: 5,
      nim: '2024001005',
      name: 'Fajar Kurniawan',
      p: ['H', 'H', 'A', 'H', 'A', 'H', 'H', 'H', 'A', 'H', 'H', 'A', '-', '-', '-', '-'],
      hadir: 8,
      sia: '0/0/4',
      ratio: '66.7%',
      isSafe: false,
      statusLabel: 'Beresiko (<70%)',
      statusClass: 'bg-rose-500/20 text-rose-400 border-rose-500/30 font-bold',
    },
    {
      id: 6,
      no: 6,
      nim: '2024001006',
      name: 'Siti Nur Aisyah',
      p: ['H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', '-', '-', '-', '-'],
      hadir: 12,
      sia: '0/0/0',
      ratio: '100%',
      isSafe: true,
      statusLabel: 'Memenuhi Syarat',
      statusClass: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    },
    {
      id: 7,
      no: 7,
      nim: '2024001007',
      name: 'Muhammad Rizky Pratama',
      p: ['H', 'H', 'I', 'H', 'H', 'H', 'H', 'H', 'I', 'H', 'H', 'H', '-', '-', '-', '-'],
      hadir: 10,
      sia: '0/2/0',
      ratio: '83.3%',
      isSafe: true,
      statusLabel: 'Memenuhi Syarat',
      statusClass: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    },
    {
      id: 8,
      no: 8,
      nim: '2024001008',
      name: 'Dewi Lestari',
      p: ['H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', 'H', '-', '-', '-', '-'],
      hadir: 12,
      sia: '0/0/0',
      ratio: '100%',
      isSafe: true,
      statusLabel: 'Memenuhi Syarat',
      statusClass: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    },
  ];

  const filteredMatrix = matrixData.filter((row) => {
    const matchSearch =
      row.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      row.nim.toLowerCase().includes(searchQuery.toLowerCase());
    const matchFilter =
      filterType === 'all' ||
      (filterType === 'safe' && row.isSafe) ||
      (filterType === 'risk' && !row.isSafe);
    return matchSearch && matchFilter;
  });

  return (
    <AppShell
      activeRole={activeRole}
      onRoleChange={onRoleChange}
      activeNavPath="rekap-nilai-dan-presensi"
      onNavChange={onNavigate}
    >
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-surface-container-highest text-on-surface px-4 py-3 rounded-xl shadow-2xl border border-primary/30">
          <span className="material-symbols-outlined text-primary text-[20px]">info</span>
          <span className="font-label-md text-sm">{toastMessage}</span>
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
              onClick={() => onNavigate && onNavigate('kelas-diampu')}
              className="text-on-surface-variant hover:text-primary transition-colors"
            >
              Kelas Diampu
            </button>
            <span>/</span>
            <span className="text-secondary font-label-sm font-semibold">
              Rekapitulasi Kehadiran Kelas
            </span>
          </nav>
          <div className="flex items-center gap-space-sm bg-surface-container-high/80 px-3 py-1.5 rounded-lg shadow-sm">
            <span className="font-caption text-caption text-on-surface-variant font-mono">
              STANDAR NASIONAL DIKTI (OBE)
            </span>
            <span className="text-outline">|</span>
            <span className="font-label-sm text-label-sm text-secondary">AMBANG: 70%</span>
          </div>
        </div>

        {/* 4 KPI Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-md">
          {/* Card 1 */}
          <div className="p-space-md rounded-xl bg-surface-container-low border border-outline-variant/20 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="font-label-sm text-xs uppercase tracking-wider text-on-surface-variant">
                Rata-rata Kehadiran
              </span>
              <div className="w-9 h-9 rounded-lg bg-primary/20 text-primary flex items-center justify-center">
                <span className="material-symbols-outlined text-[20px]">analytics</span>
              </div>
            </div>
            <div className="mt-2">
              <div className="text-headline-lg font-bold text-on-surface">86.4%</div>
              <div className="flex items-center gap-1 text-xs text-tertiary mt-0.5">
                <span className="material-symbols-outlined text-[14px]">trending_up</span>
                <span>Stabil • 38 Mahasiswa</span>
              </div>
            </div>
            {/* Sparkline mini */}
            <div className="mt-2 pt-1 border-t border-outline-variant/20">
              <svg className="w-full h-6 text-primary" fill="none" viewBox="0 0 160 28">
                <path
                  d="M0 22L18 20L36 16L54 18L72 12L90 14L108 9L126 11L144 6L160 5"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                ></path>
              </svg>
            </div>
          </div>

          {/* Card 2 */}
          <div className="p-space-md rounded-xl bg-surface-container-low border border-outline-variant/20 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="font-label-sm text-xs uppercase tracking-wider text-on-surface-variant">
                Memenuhi Ambang (≥70%)
              </span>
              <div className="w-9 h-9 rounded-lg bg-tertiary-container/30 text-tertiary flex items-center justify-center">
                <span className="material-symbols-outlined text-[20px]">verified</span>
              </div>
            </div>
            <div className="mt-2">
              <div className="text-headline-lg font-bold text-tertiary">34 / 38</div>
              <div className="text-xs text-on-surface-variant mt-0.5">89.5% mahasiswa siap ujian</div>
            </div>
            <div className="mt-2 pt-1">
              <div className="w-full bg-surface-container rounded-full h-2 overflow-hidden">
                <div className="bg-tertiary h-2 rounded-full" style={{ width: '89.5%' }}></div>
              </div>
            </div>
          </div>

          {/* Card 3 */}
          <div className="p-space-md rounded-xl bg-surface-container-low border border-outline-variant/20 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="font-label-sm text-xs uppercase tracking-wider text-on-surface-variant">
                Butuh Perhatian (&lt;70%)
              </span>
              <div className="w-9 h-9 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center">
                <span className="material-symbols-outlined text-[20px]">warning</span>
              </div>
            </div>
            <div className="mt-2">
              <div className="text-headline-lg font-bold text-rose-400">4 / 38</div>
              <div className="text-xs text-rose-400 mt-0.5">Beresiko terkunci pada ujian</div>
            </div>
            <div className="mt-2 pt-1">
              <div className="w-full bg-surface-container rounded-full h-2 overflow-hidden">
                <div className="bg-rose-500 h-2 rounded-full" style={{ width: '10.5%' }}></div>
              </div>
            </div>
          </div>

          {/* Card 4 */}
          <div className="p-space-md rounded-xl bg-surface-container-low border border-outline-variant/20 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="font-label-sm text-xs uppercase tracking-wider text-on-surface-variant">
                Sesi Berjalan
              </span>
              <div className="w-9 h-9 rounded-lg bg-secondary-container/30 text-secondary flex items-center justify-center">
                <span className="material-symbols-outlined text-[20px]">calendar_month</span>
              </div>
            </div>
            <div className="mt-2">
              <div className="text-headline-lg font-bold text-secondary">12 / 16</div>
              <div className="text-xs text-on-surface-variant mt-0.5">P1 s.d. P12 Selesai</div>
            </div>
            <div className="mt-2 pt-1">
              <div className="w-full bg-surface-container rounded-full h-2 overflow-hidden">
                <div className="bg-secondary h-2 rounded-full" style={{ width: '75%' }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* BR-012 Notice Banner */}
        <div className="p-space-md rounded-xl bg-surface-container-low border-l-4 border-l-secondary border border-outline-variant/20 shadow-sm flex items-start gap-3">
          <span className="material-symbols-outlined text-secondary text-[24px] mt-0.5">verified_user</span>
          <div>
            <h3 className="font-title-md text-sm font-bold text-on-surface">
              Aturan Bisnis Kelayakan Evaluasi Akademik (BR-012)
            </h3>
            <p className="font-body-sm text-xs text-on-surface-variant mt-1 leading-relaxed">
              Ambang batas kehadiran minimum <strong>70%</strong> diberlakukan sebagai syarat gerbang pembukaan akses ujian UTS (P-8) dan UAS (P-16).
              Mahasiswa di zona merah dapat memulihkan rasio kehadiran sebelum pertemuan evaluasi resmi.
            </p>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="bg-surface-container-low rounded-xl p-space-md border border-outline-variant/20 flex flex-wrap items-center justify-between gap-space-md">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setFilterType('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                filterType === 'all'
                  ? 'bg-primary-container text-on-primary-container shadow-sm'
                  : 'bg-surface-container text-on-surface-variant hover:text-on-surface'
              }`}
            >
              Semua Mahasiswa (38)
            </button>
            <button
              type="button"
              onClick={() => setFilterType('safe')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                filterType === 'safe'
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                  : 'bg-surface-container text-on-surface-variant hover:text-on-surface'
              }`}
            >
              Aman ≥ 70% (34)
            </button>
            <button
              type="button"
              onClick={() => setFilterType('risk')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                filterType === 'risk'
                  ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                  : 'bg-surface-container text-on-surface-variant hover:text-on-surface'
              }`}
            >
              Beresiko &lt; 70% (4)
            </button>
          </div>

          <div className="relative min-w-[240px] max-w-sm flex-1">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[18px]">
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama atau NIM mahasiswa..."
              className="w-full bg-surface-container text-on-surface font-body-sm text-body-sm pl-9 pr-3 py-2 rounded-lg placeholder:text-outline border border-outline-variant/30 focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>

        {/* 16-Meeting Attendance Matrix Table */}
        <div className="bg-surface-container-low rounded-xl border border-outline-variant/20 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-surface-container text-on-surface uppercase tracking-wider font-semibold border-b border-outline-variant/20">
                  <th className="py-3 px-3 text-center w-10">No</th>
                  <th className="py-3 px-3 min-w-[180px]">Nama Mahasiswa</th>
                  <th className="py-3 px-3 min-w-[110px]">NIM</th>
                  {/* P1-P7 */}
                  {[1, 2, 3, 4, 5, 6, 7].map((num) => (
                    <th key={num} className="p-2 text-center w-8 text-on-surface-variant font-mono">
                      P{num}
                    </th>
                  ))}
                  {/* P8 UTS */}
                  <th className="p-2 text-center w-12 bg-secondary-container/30 text-secondary font-bold font-mono">
                    P8 (UTS)
                  </th>
                  {/* P9-P12 */}
                  {[9, 10, 11, 12].map((num) => (
                    <th key={num} className="p-2 text-center w-8 text-on-surface-variant font-mono">
                      P{num}
                    </th>
                  ))}
                  {/* P13-P15 */}
                  {[13, 14, 15].map((num) => (
                    <th key={num} className="p-2 text-center w-8 text-outline font-mono">
                      P{num}
                    </th>
                  ))}
                  {/* P16 UAS */}
                  <th className="p-2 text-center w-12 bg-rose-500/20 text-rose-300 font-bold font-mono">
                    P16 (UAS)
                  </th>
                  <th className="py-3 px-3 text-center">Hadir</th>
                  <th className="py-3 px-3 text-center">S/I/A</th>
                  <th className="py-3 px-3 text-center">Rasio</th>
                  <th className="py-3 px-3 text-center min-w-[140px]">Kelayakan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/15 font-body-sm">
                {filteredMatrix.map((row) => (
                  <tr key={row.id} className="hover:bg-surface-container/50 transition-colors">
                    <td className="py-2.5 px-3 text-center text-outline">{row.no}</td>
                    <td className="py-2.5 px-3 font-semibold text-on-surface whitespace-nowrap">{row.name}</td>
                    <td className="py-2.5 px-3 font-mono text-secondary">{row.nim}</td>
                    {/* Matrix P1-P16 cells */}
                    {row.p.map((val, idx) => (
                      <td
                        key={idx}
                        className={`p-1.5 text-center font-mono font-bold ${
                          idx === 7
                            ? 'bg-secondary-container/10'
                            : idx === 15
                            ? 'bg-rose-500/10'
                            : ''
                        }`}
                      >
                        <span
                          className={`inline-block w-6 h-6 leading-6 rounded ${
                            val === 'H'
                              ? 'bg-emerald-500/20 text-emerald-400'
                              : val === 'S'
                              ? 'bg-sky-500/20 text-sky-400'
                              : val === 'I'
                              ? 'bg-amber-500/20 text-amber-400'
                              : val === 'A'
                              ? 'bg-rose-500/20 text-rose-400'
                              : 'text-outline'
                          }`}
                        >
                          {val}
                        </span>
                      </td>
                    ))}
                    <td className="py-2.5 px-3 text-center font-mono font-bold text-on-surface">{row.hadir}</td>
                    <td className="py-2.5 px-3 text-center font-mono text-outline">{row.sia}</td>
                    <td className="py-2.5 px-3 text-center font-mono font-bold text-primary">{row.ratio}</td>
                    <td className="py-2.5 px-3 text-center">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${row.statusClass}`}
                      >
                        {row.statusLabel}
                      </span>
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
