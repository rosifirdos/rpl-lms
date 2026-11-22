function Breadcrumb({ route = 'dasbor-mahasiswa', onNavigate }) {
  const routeLabels = {
    'dasbor-mahasiswa': 'Dashboard Pembelajaran Mahasiswa',
    'kelas-saya': 'Kelas Saya',
    'kelas-saya-mahasiswa': 'Kelas Saya',
    'ruang-kelas': 'Ruang Kelas Perkuliahan',
    'panduan-belajar': 'Panduan Belajar Mahasiswa',
    'central-timeline': 'Central Timeline Perkuliahan',
    'status-presensi': 'Status Presensi Mahasiswa',
    'rekap-nilai-dan-presensi': 'Rekap Nilai & Presensi',
    'rekap-kehadiran': 'Rekapitulasi Kehadiran 16 Sesi',
    'dasbor-dosen': 'Dashboard Dosen',
    'kelas-diampu': 'Kelas Perkuliahan Diampu',
    'kelola-kelas': 'Kelola Ruang Kelas',
    'daftar-hadir-koreksi': 'Daftar Hadir & Koreksi Presensi',
    'manajemen-materi': 'Manajemen Materi Pembelajaran',
    'unggah-materi': 'Unggah Materi Kuliah',
    'pemeriksaan-tugas': 'Pemeriksaan Rubrik Tugas',
    'dasbor-admin': 'Dashboard Administrator',
    'direct-enrollment': 'Direct Enrollment Mahasiswa',
    'manajemen-pengguna': 'Manajemen Pengguna & Akun',
    'master-mata-kuliah': 'Master Mata Kuliah',
    'pembukaan-kelas': 'Pembukaan Kelas Perkuliahan',
    'jejak-audit': 'Jejak Audit & Log Aktivitas',
    'konfigurasi-sistem': 'Konfigurasi Sistem & Kebijakan',
    'profile': 'Profil Pengguna Mandiri',
    'app-shell': 'App Shell Global',
  };

  const currentLabel = routeLabels[route] || 'Beranda';

  const handleHomeClick = (e) => {
    e.preventDefault();
    if (onNavigate) {
      onNavigate('dasbor-mahasiswa');
    }
  };

  return (
    <nav
      aria-label="Breadcrumb"
      className="flex items-center gap-space-xs text-on-surface-variant font-label-sm text-label-sm pt-space-md mb-space-md"
    >
      <a href="#" className="hover:text-primary transition-colors flex items-center gap-1" onClick={handleHomeClick}>
        <span className="material-symbols-outlined text-[16px]">home</span>
        <span>Beranda</span>
      </a>
      <span className="material-symbols-outlined text-[14px] text-outline">chevron_right</span>
      <span className="text-secondary font-semibold">{currentLabel}</span>
    </nav>
  );
}

export default Breadcrumb;
