const summaryData = [
  {
    icon: 'school',
    iconBg: 'bg-primary-container/20',
    iconColor: 'text-primary',
    label: 'Program Studi',
    title: 'S1 Teknik Informatika',
    subtitle: 'Fakultas Teknologi Informasi',
  },
  {
    icon: 'date_range',
    iconBg: 'bg-secondary-container/20',
    iconColor: 'text-secondary',
    label: 'Tahun Masuk / Angkatan',
    title: '2024',
    badge: 'Tingkat II',
    badgeColor: 'text-secondary',
    subtitle: 'Mahasiswa Reguler Aktif',
  },
  {
    icon: 'verified_user',
    iconBg: 'bg-tertiary-container/20',
    iconColor: 'text-tertiary',
    label: 'Status Akun',
    title: 'Aktif Terdaftar',
    subtitle: 'KRS Dikunci & Disetujui PA',
    badge: 'Terverifikasi',
    badgeColor: 'text-tertiary',
  },
];

function SummaryCard({ item }) {
  const iconContainerClass = 'w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ' + item.iconBg + ' ' + item.iconColor;
  return (
    <div className="flex items-center gap-space-md p-space-md rounded-xl bg-surface-container shadow-md transition-transform duration-200 hover:-translate-y-0.5">
      <div className={iconContainerClass}>
        <span className="material-symbols-outlined text-[28px]">{item.icon}</span>
      </div>
      <div className="flex flex-col min-w-0">
        <span className="font-caption text-caption text-outline uppercase tracking-wider font-semibold">
          {item.label}
        </span>
        <div className="flex items-baseline gap-space-xs">
          <span className="font-title-lg text-title-lg text-on-surface font-bold truncate">
            {item.title}
          </span>
          {item.badge && (
            <span className={'font-caption text-caption font-medium ' + item.badgeColor}>
              {item.badge}
            </span>
          )}
        </div>
        <span className="font-body-sm text-body-sm text-on-surface-variant truncate">
          {item.subtitle}
        </span>
      </div>
    </div>
  );
}

function SummaryCards() {
  return (
    <section aria-label="Identitas Akademik" className="grid grid-cols-1 md:grid-cols-3 gap-space-md mb-space-lg">
      {summaryData.map((item, idx) => (
        <SummaryCard key={idx} item={item} />
      ))}
    </section>
  );
}

export default SummaryCards;