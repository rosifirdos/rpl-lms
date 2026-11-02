import { useState, useEffect, useCallback } from 'react';
import AppShell from './components/AppShell';
import Breadcrumb from './components/Breadcrumb';
import GreetingBanner from './components/GreetingBanner';
import SummaryCards from './components/SummaryCards';
import CourseCards from './components/CourseCards';
import AnnouncementBanner from './components/AnnouncementBanner';
import AssignmentWidget from './components/AssignmentWidget';
import AttendanceWidget from './components/AttendanceWidget';

// === Page Imports (19 UI Designs + Auth) ===
import ForgotPasswordPage from './pages/ForgotPassword';
import LoginPage from './pages/Login';

// Mahasiswa Pages
import StatusPresensiPage from './pages/StatusPresensi';
import KlsSayaMahasiswaPage from './pages/KlsSayaMahasiswa';
import RuangKlsPage from './pages/RuangKls';

// Dosen Pages
import DasborDosenPage from './pages/DasborDosen';
import KlsDiampuPage from './pages/KlsDiampu';
import KelolaKlsPage from './pages/KelolaKls';
import DaftarHadirKoreksiPage from './pages/DaftarHadirKoreksi';
import MenejemenMaterialPage from './pages/MenejemenMaterial';
import UnggahMateriPage from './pages/UnggahMateri';

// Akademik (shared dosen/mahasiswa)
import RekapKehadiranPage from './pages/RekapKehadiran';

// Admin Pages
import DasborAdminPage from './pages/DasborAdmin';
import AppShellGlobalPage from './pages/AppShellGlobal';
import DirectEnrollmentPage from './pages/DirectEnrollment';
import ManajenenPenggunaPage from './pages/ManajemenPengguna';
import MasterMataKuliahPage from './pages/MasterMataKuliah';
import PembukaanKelasPage from './pages/PembukaanKelas';
import JejakAuditPage from './pages/JejakAudit';

// Peta rute yang tersedia (routing via query string ?page=... atau path-based)
// Keys harus match dengan Sidebar menu paths
const ROUTES = {
  // Mahasiswa
  'dasbor-mahasiswa': 'dasbor-mahasiswa',
  'kelas-saya': 'kelas-saya',
  'kelas-saya-mahasiswa': 'kelas-saya-mahasiswa',
  'ruang-kelas': 'ruang-kelas',
  'panduan-belajar': 'panduan-belajar',
  'central-timeline': 'central-timeline',
  'status-presensi': 'status-presensi',
  // Shared (Akademik)
  'rekap-nilai-dan-presensi': 'rekap-nilai-dan-presensi',
  'rekap-kehadiran': 'rekap-kehadiran',
  // Dosen
  'dasbor-dosen': 'dasbor-dosen',
  'kelas-diampu': 'kelas-diampu',
  'kelola-kelas': 'kelola-kelas',
  'daftar-hadir-koreksi': 'daftar-hadir-koreksi',
  'manajemen-materi': 'manajemen-materi',
  'unggah-materi': 'unggah-materi',
  'pemeriksaan-tugas': 'pemeriksaan-tugas',
  // Admin
  'direct-enrollment': 'direct-enrollment',
  'manajemen-pengguna': 'manajemen-pengguna',
  'master-mata-kuliah': 'master-mata-kuliah',
  'pembukaan-kelas': 'pembukaan-kelas',
  'jejak-audit': 'jejak-audit',
  'konfigurasi-sistem': 'konfigurasi-sistem',
  // Auth routes (not in sidebar but valid for navigation)
  'login': 'login',
  'forgot-password': 'forgot-password',
  'app-shell': 'app-shell',
};

// Halaman khusus yang punya komponen sendiri (standalone, tidak menggunakan AppShell)
const SPECIAL_ROUTES = {
  'forgot-password': ForgotPasswordPage,
  'login': LoginPage,
};

// Route → Component mapping for pages that use their own AppShell internally
const ROUTED_PAGES = {
  // Mahasiswa feature pages (each has AppShell built-in)
  'status-presensi': StatusPresensiPage,
  'kelas-saya-mahasiswa': KlsSayaMahasiswaPage,
  'ruang-kelas': RuangKlsPage,
  // Dosen feature pages (each has AppShell built-in)
  'dasbor-dosen': DasborDosenPage,
  'kelas-diampu': KlsDiampuPage,
  'kelola-kelas': KelolaKlsPage,
  'daftar-hadir-koreksi': DaftarHadirKoreksiPage,
  'manajemen-materi': MenejemenMaterialPage,
  'unggah-materi': UnggahMateriPage,
  // Akademik (shared — has AppShell built-in)
  'rekap-kehadiran': RekapKehadiranPage,
  'rekap-nilai-dan-presensi': RekapKehadiranPage,
  // Admin feature pages
  'direct-enrollment': DirectEnrollmentPage,
  'manajemen-pengguna': ManajenenPenggunaPage,
  'master-mata-kuliah': MasterMataKuliahPage,
  'pembukaan-kelas': PembukaanKelasPage,
  'jejak-audit': JejakAuditPage,
  'app-shell': AppShellGlobalPage,
};

function App() {
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

  // Deteksi peran aktif via URL / query param (?role=dosen|mahasiswa|admin)
  const pathname = window.location.pathname;
  const searchParams = new URLSearchParams(window.location.search);
  const initialRole = searchParams.get('role') ||
    (pathname.includes('/admin') ? 'admin' : pathname.includes('/dosen') ? 'dosen' : 'mahasiswa');
  const [activeRole, setActiveRole] = useState(initialRole);

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
    let targetUrl = resolveTargetUrl(route);
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

    // Auto-sync role berdasarkan route target
    const dosenRoutes = ['dasbor-dosen', 'kelas-diampu', 'kelola-kelas', 'daftar-hadir-koreksi', 'manajemen-materi', 'unggah-materi', 'pemeriksaan-tugas'];
    const adminRoutes = ['direct-enrollment', 'manajemen-pengguna', 'master-mata-kuliah', 'pembukaan-kelas', 'jejak-audit', 'konfigurasi-sistem'];
    const mahasiswaRoutes = ['dasbor-mahasiswa', 'kelas-saya', 'kelas-saya-mahasiswa', 'ruang-kelas', 'panduan-belajar', 'status-presensi'];

    if (dosenRoutes.includes(routeKey) && activeRole !== 'dosen') {
      setActiveRole('dosen');
    } else if (adminRoutes.includes(routeKey) && activeRole !== 'admin') {
      setActiveRole('admin');
    } else if (mahasiswaRoutes.includes(routeKey) && activeRole !== 'mahasiswa') {
      setActiveRole('mahasiswa');
    }

    // Pertahankan param role agar peran aktif tidak hilang saat navigasi
    const currentRole = new URLSearchParams(window.location.search).get('role');
    if (currentRole && !targetUrl.includes('role=')) {
      targetUrl += `${targetUrl.includes('?') ? '&' : '?'}role=${currentRole}`;
    }

    // pushState tidak memicu popstate, langsung set state
    window.history.pushState({}, '', targetUrl);
    setCurrentRoute(routeKey);
  }, [resolveTargetUrl, normalizeRoute, activeRole]);

  const handleBack = useCallback(() => {
    // Navigasi ke halaman yang sesuai berdasarkan route saat ini
    const routeKey = normalizeRoute(currentRoute);
    if (routeKey === 'forgot-password') {
      navigateTo('login');
    } else {
      navigateTo('/');
    }
  }, [navigateTo, currentRoute, normalizeRoute]);

  // Ganti peran (mahasiswa <-> dosen <-> admin) dan sinkronkan dengan URL ?role=...
  const handleRoleChange = useCallback((newRole) => {
    setActiveRole(newRole);
    const url = new URL(window.location.href);
    url.searchParams.set('role', newRole);
    window.history.pushState({}, '', url);

    // Auto-navigate ke default dashboard saat ganti peran
    const defaultPages = {
      mahasiswa: 'dasbor-mahasiswa',
      dosen: 'dasbor-dosen',
      admin: 'manajemen-pengguna',
    };
    const defaultPage = defaultPages[newRole] || 'dasbor-mahasiswa';
    setCurrentRoute(defaultPage);
    const targetUrl = `?page=${defaultPage}&role=${newRole}`;
    window.history.pushState({}, '', targetUrl);
  }, []);

  // === RENDERING LOGIC ===
  const routeKey = normalizeRoute(currentRoute);

  // 1. Auth route: halaman Lupa Password / Login selalu tampil standalone
  if (routeKey === 'forgot-password') {
    return <ForgotPasswordPage onNavigate={navigateTo} onBack={handleBack} />;
  }
  if (routeKey === 'login') {
    return <LoginPage onNavigate={navigateTo} onBack={handleBack} />;
  }

  // 2. Check if this route has a dedicated page component (dosen, admin, mahasiswa feature pages)
  const RoutedPage = ROUTED_PAGES[routeKey];
  if (RoutedPage) {
    // DasborDosenPage has a different prop signature
    if (routeKey === 'dasbor-dosen') {
      return <DasborDosenPage onRoleChange={handleRoleChange} onNavigate={navigateTo} />;
    }
    // DasborAdminPage has a different prop signature
    if (routeKey === 'manajemen-pengguna' || routeKey === 'direct-enrollment' ||
        routeKey === 'master-mata-kuliah' || routeKey === 'pembukaan-kelas' ||
        routeKey === 'jejak-audit' || routeKey === 'konfigurasi-sistem') {
      // Admin pages — check if the DasborAdmin component handles internal routing
      // If it's the admin dashboard page itself, render it with nav support
      return <DasborAdminPage
        onRoleChange={handleRoleChange}
        activeNavPath={routeKey}
        onNavChange={navigateTo}
      />;
    }
    // All other feature pages receive standard props
    return <RoutedPage onNavigate={navigateTo} onRoleChange={handleRoleChange} />;
  }

  // 3. Role-based default dashboards (when no specific route matched)
  if (activeRole === 'dosen') {
    return <DasborDosenPage onRoleChange={handleRoleChange} onNavigate={navigateTo} />;
  }

  if (activeRole === 'admin') {
    return <DasborAdminPage
      onRoleChange={handleRoleChange}
      activeNavPath={routeKey}
      onNavChange={navigateTo}
    />;
  }

  // 4. Default: Dasbor Mahasiswa dengan AppShell reusable
  return (
    <AppShell
      activeRole={activeRole}
      onRoleChange={handleRoleChange}
      activeNavPath={routeKey}
      onNavChange={navigateTo}
    >
      {/* Dynamic Glow Scrim */}
      <div className="relative w-full">
        <div className="absolute -top-10 left-1/4 w-96 h-96 bg-primary-container/10 rounded-full blur-3xl pointer-events-none -z-10" />
        <div className="absolute top-48 right-10 w-80 h-80 bg-secondary-container/10 rounded-full blur-3xl pointer-events-none -z-10" />

        <Breadcrumb />
        <GreetingBanner />
        <SummaryCards />
        <CourseCards onNavigate={navigateTo} />
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
