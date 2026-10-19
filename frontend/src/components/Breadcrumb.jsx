function Breadcrumb() {
  return (
    <nav
      aria-label="Breadcrumb"
      className="flex items-center gap-space-xs text-on-surface-variant font-label-sm text-label-sm pt-space-md mb-space-md"
    >
      <a href="#" className="hover:text-primary transition-colors flex items-center gap-1">
        <span className="material-symbols-outlined text-[16px]">home</span>
        <span>Beranda</span>
      </a>
      <span className="material-symbols-outlined text-[14px] text-outline">chevron_right</span>
      <span className="text-secondary font-semibold">Dasbor Pembelajaran Mahasiswa</span>
    </nav>
  );
}

export default Breadcrumb;
