function Breadcrumb({ route = 'dasbor-mahasiswa', onNavigate }) {
  const routeLabels = {
    'dasbor-mahasiswa': 'Dasbor Pembelajaran Mahasiswa',
    'master-mata-kuliah': 'Master Mata Kuliah',
    'pembukaan-kelas': 'Pembukaan Kelas',
    'jejak-audit': 'Jejak Audit',
    'manajemen-pengguna': 'Manajemen Pengguna',
    'konfigurasi-sistem': 'Konfigurasi Sistem',
    'dasbor-dosen': 'Dasbor Dosen',
    'pemeriksaan-tugas': 'Pemeriksaan Tugas',
    'mata-kuliah-saya': 'Mata Kuliah Saya',
    'sentral-penugasan': 'Sentral Penugasan',
    'central-timeline': 'Central Timeline',
    'rekap-nilai-dan-presensi': 'Rekap Nilai & Presensi',
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
