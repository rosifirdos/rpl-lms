import { useState, useEffect } from 'react';
import AppShell from './components/AppShell';
import Breadcrumb from './components/Breadcrumb';
import GreetingBanner from './components/GreetingBanner';
import SummaryCards from './components/SummaryCards';
import CourseCards from './components/CourseCards';
import AnnouncementBanner from './components/AnnouncementBanner';
import AssignmentWidget from './components/AssignmentWidget';
import AttendanceWidget from './components/AttendanceWidget';
import ForgotPasswordPage from './pages/ForgotPassword';
import DasborDosenPage from './pages/DasborDosen';
import DasborAdminPage from './pages/DasborAdmin';
import AppShellGlobalPage from './pages/AppShellGlobal';

function App() {
  // Sinkronisasi rute dan peran via URL
  const getRoleFromLocation = () => {
    const pathname = window.location.pathname;
    const searchParams = new URLSearchParams(window.location.search);
    const queryRole = searchParams.get('role');
    if (queryRole) return queryRole.toLowerCase();
    if (pathname.includes('/admin')) return 'admin';
    if (pathname.includes('/dosen')) return 'dosen';
    return 'mahasiswa';
  };

  const [activeRole, setActiveRole] = useState(getRoleFromLocation);

  // Penanganan browser back/forward buttons (popstate)
  useEffect(() => {
    const handlePopState = () => {
      setActiveRole(getRoleFromLocation());
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Handler terpusat untuk pergantian role dan URL
  const handleRoleChange = (newRole) => {
    const normalizedRole = newRole.toLowerCase();
    setActiveRole(normalizedRole);
    const url = new URL(window.location.href);
    url.searchParams.set('role', normalizedRole);
    window.history.pushState({}, '', url);
  };

  const pathname = window.location.pathname;
  const searchParams = new URLSearchParams(window.location.search);

  const isForgotPassword = pathname === '/forgot-password' || searchParams.get('page') === 'forgot-password';
  const isAppShellGlobal = pathname === '/app-shell' || searchParams.get('page') === 'app-shell';

  if (isForgotPassword) {
    return <ForgotPasswordPage />;
  }

  // Jika diminta rute atau pratinjau App Shell Global secara eksplisit
  if (isAppShellGlobal) {
    return (
      <AppShellGlobalPage
        currentRole={activeRole}
        onRoleChange={handleRoleChange}
      />
    );
  }

  // Jika role Admin aktif, render Dasbor Admin terdedikasi
  if (activeRole === 'admin') {
    return (
      <DasborAdminPage
        onRoleChange={handleRoleChange}
      />
    );
  }

  // Jika role Dosen aktif, render Dasbor Dosen terdedikasi
  if (activeRole === 'dosen') {
    return (
      <DasborDosenPage
        onRoleChange={handleRoleChange}
      />
    );
  }

  // Standar: Dasbor Mahasiswa menggunakan AppShell reusable tunggal
  return (
    <AppShell
      activeRole={activeRole}
      onRoleChange={handleRoleChange}
      activeNavPath="dasbor-mahasiswa"
    >
      {/* Dynamic Glow Scrim */}
      <div className="relative w-full">
        <div className="absolute -top-10 left-1/4 w-96 h-96 bg-primary-container/10 rounded-full blur-3xl pointer-events-none -z-10" />
        <div className="absolute top-48 right-10 w-80 h-80 bg-secondary-container/10 rounded-full blur-3xl pointer-events-none -z-10" />

        <Breadcrumb />
        <GreetingBanner />
        <SummaryCards />
        <CourseCards />
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

export default App;
