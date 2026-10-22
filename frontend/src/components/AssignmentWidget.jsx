const assignments = [
  {
    icon: 'assignment',
    iconBg: 'bg-error-container/30',
    iconColor: 'text-error',
    title: 'Tugas 02: Analisis Kebutuhan SRS IEEE 830',
    course: 'Rekayasa Perangkat Lunak',
    lecturer: 'Dr. Awan Rosi, M.Kom.',
    deadline: 'Hari Ini, 23:59 WIB',
    deadlineColor: 'text-error',
    remaining: 'Sisa 15 jam lagi',
  },
  {
    icon: 'terminal',
    iconBg: 'bg-secondary-container/20',
    iconColor: 'text-secondary',
    title: 'Proyek 01: Setup REST API & Middleware JWT',
    course: 'Pemrograman Web Lanjut',
    lecturer: 'Ir. Siti Aminah, M.T.',
    deadline: 'Besok, 18:00 WIB',
    deadlineColor: 'text-secondary',
    remaining: 'Sisa 33 jam lagi',
  },
];

function AssignmentItem({ item }) {
  const iconWrapClass = 'w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ' + item.iconBg + ' ' + item.iconColor;
  const deadlineClass = 'font-label-sm text-label-sm font-bold flex items-center gap-1 ' + item.deadlineColor;
  return (
    <div className="flex items-center justify-between p-space-sm rounded-lg bg-surface-container-low hover:bg-surface-container-high transition-colors gap-space-sm">
      <div className="flex items-center gap-space-sm min-w-0">
        <div className={iconWrapClass}>
          <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
        </div>
        <div className="flex flex-col min-w-0">
          <span className="font-title-md text-title-md text-on-surface font-semibold truncate">
            {item.title}
          </span>
          <span className="font-caption text-caption text-on-surface-variant truncate">
            {item.course} &bull; {item.lecturer}
          </span>
        </div>
      </div>
      <div className="flex flex-col items-end flex-shrink-0">
        <span className={deadlineClass}>
          <span className="material-symbols-outlined text-[14px]">schedule</span>
          {item.deadline}
        </span>
        <span className="font-caption text-caption text-outline">{item.remaining}</span>
      </div>
    </div>
  );
}

function AssignmentWidget() {
  return (
    <div className="lg:col-span-2 rounded-xl bg-surface-container p-space-md shadow-md flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between pb-space-sm mb-space-sm">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-error text-[22px]">assignment_late</span>
            <h3
              className="font-title-md text-title-md text-on-surface font-bold"
              id="timeline-widget-heading"
            >
              Tugas Terdekat Menunggu Pengumpulan
            </h3>
          </div>
          <span className="px-2 py-0.5 rounded-full bg-error-container text-on-error-container font-label-sm text-label-sm font-bold">
            2 Tenggat Kritis
          </span>
        </div>
        <div className="flex flex-col gap-space-sm">
          {assignments.map((item, idx) => (
            <AssignmentItem key={idx} item={item} />
          ))}
        </div>
      </div>
      <div className="pt-space-sm mt-space-xs text-right">
        <a
          href="#"
          className="font-label-sm text-label-sm text-primary hover:underline inline-flex items-center gap-1"
        >
          Buka Sentral Penugasan LMS{' '}
          <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
        </a>
      </div>
    </div>
  );
}

export default AssignmentWidget;