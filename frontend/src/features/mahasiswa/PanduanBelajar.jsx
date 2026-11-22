import React, { useState, useMemo } from 'react';
import AppShell from '../../components/AppShell';

export default function PanduanBelajar({ onRoleChange, onNavigate, activeRole = 'mahasiswa' }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [openSectionId, setOpenSectionId] = useState('presensi');
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const guides = [
    {
      id: 'presensi',
      title: 'Tata Cara Presensi Perkuliahan & Toleransi 15 Menit (BR-011)',
      icon: 'how_to_reg',
      badge: 'Aturan Presensi',
      steps: [
        'Dosen pengampu membuka sesi presensi pada jam perkuliahan yang terjadwal.',
        'Status presensi mahasiswa akan berada pada State B (Sesi Terbuka) dengan timer hitung mundur selama 15 menit (BR-011).',
        'Klik tombol "Kirim Bukti Presensi" sebelum waktu toleransi berakhir.',
        'Setelah divalidasi oleh server, status berubah menjadi State C (Hadir Sah) dengan token bukti presensi.',
        'Apabila waktu habis dan Anda belum mengisi, sesi berpindah ke State D (Alpa/Terlambat).',
      ],
      tip: 'Pastikan koneksi internet stabil saat menekan tombol validasi kehadiran.',
    },
    {
      id: 'koreksi',
      title: 'Alur Pengajuan Koreksi Presensi Mahasiswa (FR-039)',
      icon: 'fact_check',
      badge: 'Dispensasi',
      steps: [
        'Jika Anda berhalangan hadir karena sakit, izin resmi, atau kendala teknis jaringan lab, buka halaman Status Presensi.',
        'Pada kartu pertemuan yang bersangkutan, klik tombol "Ajukan Koreksi Presensi".',
        'Pilih alasan permohonan (Sakit dengan Surat, Tugas Kampus/Lomba, atau Kendala Teknis).',
        'Tuliskan catatan penjelasan secara rinci untuk dosen pengampu.',
        'Dosen pengampu akan memverifikasi permohonan melalui menu "Daftar Hadir & Koreksi".',
      ],
      tip: 'Lampirkan bukti dokumen pendukung (surat dokter/dispensasi) jika diminta oleh dosen pengampu.',
    },
    {
      id: 'materi',
      title: 'Akses Ruang Kelas & Pengunduhan Materi Perkuliahan',
      icon: 'school',
      badge: 'Materi Kuliah',
      steps: [
        'Buka menu "Kelas Saya" atau klik "Buka Ruang Kelas" dari kartu dasbor.',
        'Pilih sesi pertemuan 1 hingga 16 sesuai jadwal silabus mingguan.',
        'Klik judul materi untuk mengunduh modul PDF, tayangan presentasi PPTX, atau membuka tautan video pembelajaran.',
        'Gunakan fitur penanda "Tandai Telah Dipelajari" untuk memantau progres belajar mandiri Anda.',
      ],
      tip: 'Seluruh materi perkuliahan terikat hak cipta akademik dan diperuntukkan bagi mahasiswa terdaftar.',
    },
    {
      id: 'tugas',
      title: 'Pengumpulan Tugas Terstruktur & Evaluasi Rubrik OBE',
      icon: 'assignment_turned_in',
      badge: 'Penugasan',
      steps: [
        'Perhatikan tanggal dan jam batas akhir (deadline) pengumpulan tugas.',
        'Siapkan berkas jawaban dalam format resmi yang diizinkan (.pdf, .docx, atau .zip) dengan ukuran maksimal 20MB.',
        'Buka sesi tugas yang sesuai lalu seret berkas ke dropzone atau klik "Pilih Berkas".',
        'Klik "Kirim Berkas Tugas" dan tunggu konfirmasi tanda terima sistem.',
        'Dosen akan memeriksa tugas berdasarkan rubrik CPMK dan memberikan nilai 0-100 beserta catatan evaluator.',
      ],
      tip: 'Pengumpulan tugas setelah tenggat waktu akan otomatis diberi label "Terlambat" oleh sistem E-Learning Kampus.',
    },
    {
      id: 'syarat-ujian',
      title: 'Syarat Kelayakan Mengikuti UTS & UAS (Minimal 75% Hadir - BR-012)',
      icon: 'verified',
      badge: 'Akademik',
      steps: [
        'Berdasarkan SK Rektor dan aturan BR-012, mahasiswa wajib memiliki persentase kehadiran minimal 75.0% dari total 16 pertemuan.',
        'Pantau rasio kehadiran Anda melalui menu "Rekap Nilai & Presensi" atau kartu metrik dasbor.',
        'Jika persentase kehadiran berada di bawah 75%, status kelayakan ujian akan ditandai "Beresiko / Tidak Memenuhi Syarat".',
        'Segera hubungi dosen pengampu atau ketua program studi apabila membutuhkan klarifikasi kehadiran.',
      ],
      tip: 'Presensi dengan status Izin atau Sakit yang disetujui dosen tetap dihitung dalam persentase toleransi kehadiran.',
    },
  ];

  const filteredGuides = useMemo(() => {
    if (!searchQuery) return guides;
    const q = searchQuery.toLowerCase();
    return guides.filter(
      (g) => g.title.toLowerCase().includes(q) || g.badge.toLowerCase().includes(q)
    );
  }, [guides, searchQuery]);

  return (
    <AppShell
      activeRole={activeRole}
      onRoleChange={onRoleChange}
      activeNavPath="panduan-belajar"
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
            onNavigate && onNavigate('dasbor-mahasiswa');
          }}
          className="hover:text-primary transition-colors flex items-center gap-1"
        >
          <span className="material-symbols-outlined text-[16px]">home</span>
          <span>Dashboard Mahasiswa</span>
        </a>
        <span className="material-symbols-outlined text-[14px] text-outline">chevron_right</span>
        <span className="text-secondary font-semibold">Panduan Belajar Mahasiswa</span>
      </nav>

      {/* Hero Greeting / Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-surface-container-high via-surface-container to-surface-container-low p-space-lg shadow-sm mb-space-lg border border-outline-variant/20">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-space-md">
          <div className="flex flex-col gap-1 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-primary-container text-on-primary-container font-label-sm text-[12px] font-bold">
                Pusat Bantuan E-Learning Kampus
              </span>
              <span className="font-caption text-caption text-on-surface-variant">
                Panduan Operasional Mahasiswa
              </span>
            </div>
            <h1 className="font-headline-sm text-headline-sm text-on-surface font-bold tracking-tight">
              Panduan Belajar &amp; Petunjuk Perkuliahan Daring
            </h1>
            <p className="font-body-md text-body-md text-on-surface-variant">
              Pelajari alur presensi 15 menit (BR-011), pengumpulan tugas, akses materi 16 sesi, dan syarat ujian (BR-012).
            </p>
          </div>

          <button
            type="button"
            onClick={() => showToast('Memulai pengunduhan Buku Pedoman Mahasiswa E-Learning Kampus (PDF 4.2 MB)...')}
            className="px-5 py-2.5 rounded-xl bg-primary text-on-primary font-label-md text-label-md font-bold hover:bg-primary/90 transition-all shadow-md flex items-center gap-2 self-start md:self-center shrink-0"
          >
            <span className="material-symbols-outlined text-[20px]">download</span>
            <span>Unduh Buku Panduan (PDF)</span>
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-surface-container-low rounded-xl border border-outline-variant/20 p-space-md shadow-sm mb-space-lg">
        <div className="relative">
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari topik panduan (contoh: presensi, tugas, koreksi, syarat ujian)..."
            className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-surface-container border border-outline-variant/30 text-on-surface placeholder:text-on-surface-variant text-body-md focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <span className="material-symbols-outlined absolute left-3 top-2.5 text-on-surface-variant text-[20px]">
            search
          </span>
        </div>
      </div>

      {/* Accordion List of Guides */}
      <div className="flex flex-col gap-space-md mb-space-xl">
        {filteredGuides.map((guide) => {
          const isOpen = openSectionId === guide.id;
          return (
            <div
              key={guide.id}
              className="bg-surface-container-low rounded-2xl border border-outline-variant/20 overflow-hidden shadow-sm transition-all"
            >
              <button
                type="button"
                onClick={() => setOpenSectionId(isOpen ? null : guide.id)}
                className="w-full p-space-md sm:p-space-lg flex items-center justify-between text-left hover:bg-surface-container/50 transition-colors"
              >
                <div className="flex items-center gap-space-md min-w-0">
                  <div className="w-11 h-11 rounded-xl bg-primary-container/20 text-primary flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[24px]">{guide.icon}</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="px-2 py-0.5 rounded bg-surface-container-high text-on-surface-variant font-caption text-[11px] font-bold uppercase">
                        {guide.badge}
                      </span>
                    </div>
                    <h2 className="font-title-md text-title-md font-bold text-on-surface">
                      {guide.title}
                    </h2>
                  </div>
                </div>
                <span className={`material-symbols-outlined text-[24px] text-on-surface-variant transition-transform shrink-0 ${isOpen ? 'rotate-180' : ''}`}>
                  expand_more
                </span>
              </button>

              {isOpen && (
                <div className="px-space-md sm:px-space-lg pb-space-lg pt-space-xs border-t border-outline-variant/10 animate-fadeIn">
                  <ol className="list-decimal list-inside space-y-2.5 text-body-md text-on-surface-variant mb-space-md pl-2">
                    {guide.steps.map((step, idx) => (
                      <li key={idx} className="leading-relaxed">
                        <span className="text-on-surface font-medium">{step}</span>
                      </li>
                    ))}
                  </ol>

                  {guide.tip && (
                    <div className="p-space-sm rounded-xl bg-surface-container flex items-start gap-2 text-body-sm text-secondary border border-outline-variant/20">
                      <span className="material-symbols-outlined text-[18px] shrink-0 text-primary">info</span>
                      <span><strong>Tips Mahasiswa:</strong> {guide.tip}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* IT Helpdesk Kampus Card */}
      <div className="p-space-lg rounded-2xl bg-surface-container-low border border-outline-variant/20 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-space-md">
        <div className="flex items-center gap-space-md text-center sm:text-left">
          <div className="w-12 h-12 rounded-xl bg-secondary-container/20 text-secondary flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[28px]">support_agent</span>
          </div>
          <div>
            <h3 className="font-title-md font-bold text-on-surface">Mengalami Kendala Teknis di Luar Jam Kuliah?</h3>
            <p className="font-body-sm text-on-surface-variant">
              Hubungi Unit IT Kampus Gedung B Lt. 2 atau kirim pesan melalui layanan helpdesk resmi.
            </p>
          </div>
        </div>

        <a
          href="https://helpdesk.kampus.ac.id"
          target="_blank"
          rel="noopener noreferrer"
          className="px-5 py-2.5 rounded-xl bg-surface-container-high hover:bg-surface-bright text-on-surface font-label-md text-label-md font-semibold transition-all border border-outline-variant/30 flex items-center gap-1.5 shrink-0 shadow-sm"
        >
          <span className="material-symbols-outlined text-[18px]">open_in_new</span>
          <span>Buka Tiket Helpdesk Kampus</span>
        </a>
      </div>
    </AppShell>
  );
}
