import { useState, useEffect } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Breadcrumb from './components/Breadcrumb';
import GreetingBanner from './components/GreetingBanner';
import SummaryCards from './components/SummaryCards';
import CourseCards from './components/CourseCards';
import AnnouncementBanner from './components/AnnouncementBanner';
import AssignmentWidget from './components/AssignmentWidget';
import AttendanceWidget from './components/AttendanceWidget';
import ForgotPasswordPage from './pages/ForgotPassword';
import MasterMataKuliah from './pages/MasterMataKuliah';
import PembukaanKelas from './pages/PembukaanKelas';
import JejakAudit from './pages/JejakAudit';

// Tabel rute modul aplikasi LMS
const ROUTES = {
  'forgot-password': ForgotPasswordPage,
  'master-mata-kuliah': MasterMataKuliah,
  'pembukaan-kelas': PembukaanKelas,
  'jejak-audit': JejakAudit,
};

// Ekstrak route key bersih dari URL (query param ?page= atau pathname)
const getRouteKey = (
  pathname = typeof window !== 'undefined' ? window.location.pathname : '/',
  search = typeof window !== 'undefined' ? window.location.search : ''
) => {
  const searchParams = new URLSearchParams(search);
  const pageParam = searchParams.get('page');
  if (pageParam) return pageParam;

  const cleanPath = pathname.replace(/^\/+|\/+$/g, '');
  if (!cleanPath || cleanPath === 'dasbor-mahasiswa' || cleanPath === 'dashboard') {
    return 'dasbor-mahasiswa';
  }
  return cleanPath;
};

// Pastikan target URL selalu menggunakan root path absolut agar tidak nested/relatif
const resolveTargetUrl = (route) => {
  if (route === '/' || route === 'dasbor-mahasiswa' || route === 'dashboard') {
    return '/';
  }
  if (route.startsWith('/')) {
    return route;
  }
  return `/?page=${route}`;
};

function DashboardContent({ onNavigate }) {
  return (
    <div className="flex flex-col w-full pb-space-xl">
      {/* Dynamic Glow Scrim */}
      <div className="relative w-full">
        <div className="absolute -top-10 left-1/4 w-96 h-96 bg-primary-container/10 rounded-full blur-3xl pointer-events-none -z-10" />
        <div className="absolute top-48 right-10 w-80 h-80 bg-secondary-container/10 rounded-full blur-3xl pointer-events-none -z-10" />

        <Breadcrumb onNavigate={onNavigate} />
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
    </div>
  );
}

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Dukungan routing reaktif terhadap popstate dan URL SPA
  const [currentRoute, setCurrentRoute] = useState(() => getRouteKey());

  useEffect(() => {
    const handleLocationChange = () => {
      setCurrentRoute(getRouteKey());
    };

    window.addEventListener('popstate', handleLocationChange);
    return () => window.removeEventListener('popstate', handleLocationChange);
  }, []);

  const navigateTo = (route, options = {}) => {
    const targetUrl = resolveTargetUrl(route);
    const resolvedKey = getRouteKey(
      targetUrl.split('?')[0],
      targetUrl.includes('?') ? targetUrl.slice(targetUrl.indexOf('?')) : ''
    );

    if (options.replace) {
      window.history.replaceState({}, '', targetUrl);
    } else {
      window.history.pushState({}, '', targetUrl);
    }
    setCurrentRoute(resolvedKey);
  };

  const handleBack = () => {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      navigateTo('/');
    }
  };

  // Halaman standalone autentikasi (tanpa layout shell LMS)
  if (currentRoute === 'forgot-password') {
    return (
      <ForgotPasswordPage
        onNavigate={navigateTo}
        onBack={handleBack}
      />
    );
  }

  const PageComponent = ROUTES[currentRoute];

  const mainWrapClass = sidebarOpen
    ? 'pl-64 transition-all duration-300'
    : 'pl-0 transition-all duration-300';

  return (
    <div className="bg-background font-body-md text-on-surface antialiased">
      <Header onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      <Sidebar
        isOpen={sidebarOpen}
        currentRoute={currentRoute}
        onNavigate={navigateTo}
      />

      <div className={mainWrapClass}>
        <main className="w-full pt-16 px-gutter bg-background min-h-screen">
          {PageComponent ? (
            <PageComponent onNavigate={navigateTo} />
          ) : (
            <DashboardContent onNavigate={navigateTo} />
          )}
        </main>
      </div>
    </div>
  );
}

export default App;
