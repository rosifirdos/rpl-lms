import { dashboardCourses } from '../data/courseCatalog';

function CourseCard({ course, onNavigate }) {
  return (
    <article className="flex flex-col justify-between rounded-xl bg-surface-container p-space-md shadow-lg transition-all duration-300 hover:shadow-2xl hover:bg-surface-container-high group">
      <div className="flex flex-col gap-space-sm">
        <div className="flex items-center justify-between gap-space-xs">
          <span className={course.badgeBg + ' ' + course.badgeText + ' px-2.5 py-1 rounded-md font-label-sm text-label-sm font-bold'}>
            {course.classGroup} &bull; {course.sks} SKS
          </span>
          <span className="font-caption text-caption text-outline font-mono">{course.code}</span>
        </div>

        <div className="mt-1">
          <h3 className={'font-title-lg text-title-lg text-on-surface font-bold transition-colors line-clamp-1 ' + course.hoverText}>
            {course.name}
          </h3>
          <p className="font-body-sm text-body-sm text-on-surface-variant flex items-center gap-1.5 mt-1">
            <span className={'material-symbols-outlined text-[16px] ' + course.iconColor}>person</span>
            {course.lecturer}
          </p>
        </div>

        <div className="bg-surface-container-low p-space-sm rounded-lg mt-space-xs flex flex-col gap-1.5">
          <div className="flex items-center justify-between font-label-sm text-label-sm">
            <span className="text-on-surface font-medium flex items-center gap-1">
              <span className={'material-symbols-outlined text-[16px] ' + course.iconColor}>event_available</span>
              Pertemuan {course.currentMeeting} dari {course.totalMeetings}
            </span>
            <span className={course.iconColor + ' font-bold'}>{course.meetingProgressPct}%</span>
          </div>
          <div className="w-full bg-surface-container-highest rounded-full h-2 overflow-hidden">
            <div
              className={course.progressGradient + ' h-2 rounded-full transition-all duration-500'}
              style={{ width: course.meetingProgressPct + '%' }}
            />
          </div>
          <span className="font-caption text-caption text-outline">
            {course.totalMeetings} Pertemuan Terstruktur (LMS Sync)
          </span>
        </div>
      </div>

      <div className="pt-space-md mt-space-sm">
        <button
          type="button"
          onClick={() => onNavigate && onNavigate(`ruang-kelas?course=${course.id}`)}
          className="w-full inline-flex items-center justify-center gap-space-xs py-2.5 px-space-md rounded-lg bg-primary-container hover:bg-primary text-on-primary-container hover:text-on-primary font-label-md text-label-md font-bold transition-all shadow-md hover:shadow-lg"
        >
          <span>Buka Ruang Kelas</span>
          <span className="material-symbols-outlined text-[18px] transition-transform duration-200 group-hover:translate-x-1">
            arrow_forward
          </span>
        </button>
      </div>
    </article>
  );
}

function CourseCards({ onNavigate }) {
  return (
    <section aria-label="Kelas Aktif Semester Ini" className="mb-space-lg">
      <div className="flex items-center justify-between mb-space-md">
        <div className="flex items-center gap-space-sm">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <span className="material-symbols-outlined text-primary text-[22px]">auto_stories</span>
          </div>
          <div>
            <h2 className="font-headline-md text-headline-md text-on-surface font-bold tracking-tight">
              Kelas Aktif Semester Ini
            </h2>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              Semester Ganjil 2026/2027 &mdash; {dashboardCourses.length} Mata Kuliah Terdaftar
            </p>
          </div>
        </div>
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            onNavigate && onNavigate('kelas-saya-mahasiswa');
          }}
          className="hidden sm:inline-flex items-center gap-1 px-space-md py-space-xs rounded-lg bg-surface-container-high hover:bg-surface-bright text-on-surface font-label-sm text-label-sm font-medium transition-colors"
        >
          Lihat Semua Kelas
          <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
        </a>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-space-md">
        {dashboardCourses.map((course) => (
          <CourseCard key={course.id} course={course} onNavigate={onNavigate} />
        ))}
      </div>
    </section>
  );
}

export default CourseCards;