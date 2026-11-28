/**
 * features/dashboard/MahasiswaDashboardLegacy.jsx
 *
 * Dasbor mahasiswa hasil ekstraksi dari App.jsx lama (Fase 0).
 * Masih memakai komponen fixture; akan digantikan MahasiswaDashboard.tsx
 * berbasis `GET /api/dashboard` pada Fase 3.
 */
import AppShell from '../../components/AppShell';
import Breadcrumb from '../../components/Breadcrumb';
import GreetingBanner from '../../components/GreetingBanner';
import SummaryCards from '../../components/SummaryCards';
import CourseCards from '../../components/CourseCards';
import AnnouncementBanner from '../../components/AnnouncementBanner';
import AssignmentWidget from '../../components/AssignmentWidget';
import AttendanceWidget from '../../components/AttendanceWidget';

export default function MahasiswaDashboardLegacy({ onNavigate, onRoleChange }) {
  return (
    <AppShell
      activeRole="mahasiswa"
      onRoleChange={onRoleChange}
      activeNavPath="dasbor-mahasiswa"
      onNavChange={onNavigate}
    >
      {/* Dynamic Glow Scrim */}
      <div className="relative w-full">
        <div className="absolute -top-10 left-1/4 w-96 h-96 bg-primary-container/10 rounded-full blur-3xl pointer-events-none -z-10" />
        <div className="absolute top-48 right-10 w-80 h-80 bg-secondary-container/10 rounded-full blur-3xl pointer-events-none -z-10" />

        <Breadcrumb onNavigate={onNavigate} />
        <GreetingBanner />
        <SummaryCards />
        <CourseCards onNavigate={onNavigate} />
        <AnnouncementBanner />

        {/* Quick Metrics / Central Timeline Mini Widget */}
        <section
          aria-labelledby="timeline-widget-heading"
          className="grid grid-cols-1 lg:grid-cols-3 gap-space-md"
        >
          <AssignmentWidget />
          <AttendanceWidget />
        </section>
      </div>
    </AppShell>
  );
}
