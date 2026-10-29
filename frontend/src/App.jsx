import { useState, useEffect, useRef, useCallback } from 'react';
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

// Peta rute yang tersedia (routing via query string ?page=...)
// Keys harus match dengan Sidebar menu paths
const ROUTES = {
  'dasbor-mahasiswa': 'dasbor-mahasiswa',
  'mata-kuliah-saya': 'mata-kuliah-saya',
  'sentral-penugasan': 'sentral-penugasan',
  'central-timeline': 'central-timeline',
  'rekap-nilai-dan-presensi': 'rekap-nilai-dan-presensi',
  'dasbor-dosen': 'dasbor-dosen',
  'pemeriksaan-tugas': 'pemeriksaan-tugas',
  'manajemen-pengguna': 'manajemen-pengguna',
  'master-mata-kuliah': 'master-mata-kuliah',
  'pembukaan-kelas': 'pembukaan-kelas',
  'jejak-audit': 'jejak-audit',
  'konfigurasi-sistem': 'konfigurasi-sistem',
  // Auth routes (not in sidebar but valid for navigation)
  'login': 'login',
  'forgot-password': 'forgot-password',
};

// Halaman khusus yang punya komponen sendiri
const SPECIAL_ROUTES = {
  'master-mata-kuliah': MasterMataKuliah,
  'pembukaan-kelas': PembukaanKelas,
  'jejak-audit': JejakAudit,
  'forgot-password': ForgotPasswordPage,
};

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Helper: normalize route to key (no leading slash, no query params, no hash)
  const normalizeRoute = useCallback((route) => {
    if (!route) return 'dasbor-mahasiswa';
    // Handle full URLs with hash (e.g., '#/page=foo' or '#foo')
    if (route.includes('#')) {
      const hashPart = route.split('#')[1] || '';
      // Handle hash-based query string like #?page=foo
      if (hashPart.startsWith('?') || hashPart.startsWith('page=')) {
        const searchParams = new URLSearchParams(hashPart.replace('?', ''));
        const pageParam = searchParams.get('page');
        if (pageParam) return pageParam;
      }
      // Handle hash path like #foo
      return hashPart.startsWith('/') ? hashPart.slice(1) : hashPart;
    }
    // Handle full URLs with query strings
    if (route.includes('?')) {
      const searchParams = new URLSearchParams(route.split('?')[1]);
      const pageParam = searchParams.get('page');
      if (pageParam) return pageParam;
    }
    // Strip leading slash if present
    return route.startsWith('/') ? route.slice(1) : route;
  }, []);

  // Dukungan routing reaktif untuk pratinjau halaman Lupa Password
  // SSR-safe: gunakan lazy initializer dengan check typeof window
  const [currentRoute, setCurrentRoute] = useState(() => {
    if (typeof window === 'undefined') return 'dasbor-mahasiswa';
    const searchParams = new URLSearchParams(window.location.search);
    const pageParam = searchParams.get('page');
    if (pageParam) return pageParam;
    // Path-based route: strip leading slash
    const path = window.location.pathname.startsWith('/') ? window.location.pathname.slice(1) : window.location.pathname;
    // Handle special path-based routes for backward compatibility
    if (path === 'forgot-password') return 'forgot-password';
    // Default to dashboard if empty (root path '/')
    return path || 'dasbor-mahasiswa';
  });

  // pushState tidak memicu popstate, jadi tidak perlu flag isProgrammaticNavigation
  // popstate hanya memicu saat user klik back/forward browser

  useEffect(() => {
    const handleLocationChange = () => {
      const searchParams = new URLSearchParams(window.location.search);
      const pageParam = searchParams.get('page');
      if (pageParam) {
        // Validate route against known routes before setting
        const isKnownRoute = pageParam in ROUTES || pageParam in SPECIAL_ROUTES;
        if (isKnownRoute) {
          setCurrentRoute(pageParam);
        } else {
          console.warn(`[App] Invalid route in URL: "${pageParam}". Redirecting to dashboard.`);
          window.history.replaceState({}, '', '?page=dasbor-mahasiswa');
          setCurrentRoute('dasbor-mahasiswa');
        }
        return;
      }
      const path = window.location.pathname.startsWith('/') ? window.location.pathname.slice(1) : window.location.pathname;
      // Handle special path-based routes for backward compatibility
      if (path === 'forgot-password') {
        setCurrentRoute('forgot-password');
        return;
      }
      setCurrentRoute(path || 'dasbor-mahasiswa');
    };

    window.addEventListener('popstate', handleLocationChange);
    return () => window.removeEventListener('popstate', handleLocationChange);
  }, []);

  const resolveTargetUrl = useCallback((route) => {
    // Normalisasi route ke query string format
    if (route === '/') {
      // Root path -> dashboard
      return `?page=dasbor-mahasiswa`;
    }
    if (route.startsWith('/')) {
      // Path-based route: strip leading slash
      return `?page=${route.slice(1)}`;
    }
    // Handle full query string (e.g., '?page=foo' or '?page=foo&tab=bar')
    if (route.startsWith('?')) {
      return route;
    }
    return `?page=${route}`;
  }, []);

  const navigateTo = useCallback((route) => {
    const targetUrl = resolveTargetUrl(route);
    const routeKey = normalizeRoute(route);

    // Validasi route: hanya izinkan route yang ada di ROUTES atau SPECIAL_ROUTES
    const isKnownRoute = routeKey in ROUTES || routeKey in SPECIAL_ROUTES;
    if (!isKnownRoute) {
      console.warn(`[App] Navigasi ke route tidak dikenal: "${routeKey}". Redirect ke dashboard.`);
      // Fallback ke dashboard
      window.history.pushState({}, '', '?page=dasbor-mahasiswa');
      setCurrentRoute('dasbor-mahasiswa');
      return;
    }

    // pushState tidak memicu popstate, langsung set state
    window.history.pushState({}, '', targetUrl);
    setCurrentRoute(routeKey);
  }, [resolveTargetUrl, normalizeRoute]);

  const handleBack = useCallback(() => {
    // Navigasi ke halaman yang sesuai berdasarkan route saat ini
    // Jika di halaman forgot-password, kembali ke login page
    // Jika di halaman lain (special routes), kembali ke dashboard
    const routeKey = normalizeRoute(currentRoute);
    if (routeKey === 'forgot-password') {
      navigateTo('login');
    } else {
      navigateTo('/');
    }
  }, [navigateTo, currentRoute]);

  // currentRoute tidak pernah memiliki leading slash karena normalizeRoute
  // dan initial state keduanya strip leading slash - cek cukup satu kondisi
  // Cek apakah route adalah halaman khusus yang punya komponen sendiri
  const routeKey = normalizeRoute(currentRoute);
  const SpecialPage = SPECIAL_ROUTES[routeKey];

  if (SpecialPage) {
    return (
      <SpecialPage
        onNavigate={navigateTo}
        onBack={handleBack}
      />
    );
  }

  // Cek apakah route valid (ada di ROUTES)
  const isValidRoute = routeKey in ROUTES;

  const mainWrapClass = sidebarOpen
    ? 'pl-64 transition-all duration-300'
    : 'pl-0 transition-all duration-300';

  // Default dashboard view untuk route valid yang bukan halaman khusus
  return (
    <div className="bg-background font-body-md text-on-surface antialiased">
      <Header onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      <Sidebar isOpen={sidebarOpen} activeRoute={routeKey} />

      <div className={mainWrapClass}>
        <main className="w-full pt-16 px-gutter bg-background min-h-screen">
          <div className="flex flex-col w-full pb-space-xl">
            {/* Dynamic Glow Scrim */}
            <div className="relative w-full">
              <div className="absolute -top-10 left-1/4 w-96 h-96 bg-primary-container/10 rounded-full blur-3xl pointer-events-none -z-10" />
              <div className="absolute top-48 right-10 w-80 h-80 bg-secondary-container/10 rounded-full blur-3xl pointer-events-none -z-10" />

              <Breadcrumb route={routeKey} onNavigate={navigateTo} />
              {isValidRoute ? (
                <>
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
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
                  <div className="w-20 h-20 rounded-full bg-surface-container-high flex items-center justify-center text-tertiary mb-6">
                    <span className="material-symbols-outlined text-[36px]">construction</span>
                  </div>
                  <h2 className="font-headline-md text-headline-md text-on-surface mb-3">
                    Halaman Belum Tersedia
                  </h2>
                  <p className="font-body-md text-body-md text-on-surface-variant max-w-md mb-6">
                    Halaman <code className="px-2 py-0.5 bg-surface-container-high rounded font-mono">{routeKey}</code>
                    sedang dalam pengembangan. Silakan kembali ke <button className="text-primary underline hover:text-primary-focus font-semibold" onClick={() => navigateTo('/')}>Beranda</button>
                    atau pilih menu lain dari sidebar.
                  </p>
                  <button
                    className="px-4 py-2 rounded-lg bg-primary-container text-on-primary-container font-label-md text-label-md font-semibold shadow-sm hover:brightness-110"
                    onClick={() => navigateTo('/')}
                  >
                    Kembali ke Beranda
                  </button>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;
