import { useState, useEffect, useCallback } from 'react';
import AppShell from './components/AppShell';
import Breadcrumb from './components/Breadcrumb';
import GreetingBanner from './components/GreetingBanner';
import SummaryCards from './components/SummaryCards';
import CourseCards from './components/CourseCards';
import AnnouncementBanner from './components/AnnouncementBanner';
import AssignmentWidget from './components/AssignmentWidget';
import AttendanceWidget from './components/AttendanceWidget';

// === Page Imports ===
import ForgotPasswordPage from './pages/ForgotPassword';
import LoginPage from './pages/Login';
import ProfilePage from './pages/Profile';

// Mahasiswa Pages
import StatusPresensiPage from './pages/StatusPresensi';
import KlsSayaMahasiswaPage from './pages/KlsSayaMahasiswa';
import RuangKelasPage from './pages/RuangKelas';
import PanduanBelajarPage from './pages/PanduanBelajar';

// Dosen Pages
import DasborDosenPage from './pages/DasborDosen';
import KelasDiampuPage from './pages/KelasDiampu';
import KelolaKlsPage from './pages/KelolaKls';
import DaftarHadirKoreksiPage from './pages/DaftarHadirKoreksi';
import ManajemenMaterialPage from './pages/ManajemenMaterial';
import UnggahMateriPage from './pages/UnggahMateri';
import PemeriksaanTugasPage from './pages/PemeriksaanTugas';

// Shared / Akademik (shared dosen & mahasiswa)
import RekapKehadiranPage from './pages/RekapKehadiran';
import CentralTimelinePage from './pages/CentralTimeline';

// Admin Pages
import DasborAdminPage from './pages/DasborAdmin';
import AppShellGlobalPage from './pages/AppShellGlobal';
import DirectEnrollmentPage from './pages/DirectEnrollment';
import ManajemenPenggunaPage from './pages/ManajemenPengguna';
import MasterMataKuliahPage from './pages/MasterMataKuliah';
import PembukaanKelasPage from './pages/PembukaanKelas';
import JejakAuditPage from './pages/JejakAudit';
import KonfigurasiSistemPage from './pages/KonfigurasiSistem';

// Peta rute yang tersedia (routing via query string ?page=... atau path-based)
// Keys harus match dengan Sidebar menu paths
const ROUTES = {
  // Mahasiswa
  'dasbor-mahasiswa': 'dasbor-mahasiswa',
  'kelas-saya': 'kelas-saya',
  'kelas-saya-mahasiswa': 'kelas-saya-mahasiswa',
  'ruang-kelas': 'ruang-kelas',
  'panduan-belajar': 'panduan-belajar',

  // Shared (Akademik)
  'central-timeline': 'central-timeline',
  'status-presensi': 'status-presensi',
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
  'dasbor-admin': 'dasbor-admin',
  'direct-enrollment': 'direct-enrollment',
  'manajemen-pengguna': 'manajemen-pengguna',
  'master-mata-kuliah': 'master-mata-kuliah',
  'pembukaan-kelas': 'pembukaan-kelas',
  'jejak-audit': 'jejak-audit',
  'konfigurasi-sistem': 'konfigurasi-sistem',

  // Profile, Shell & Auth routes
  'profile': 'profile',
  'login': 'login',
  'forgot-password': 'forgot-password',
  'app-shell': 'app-shell',
};

// Halaman khusus yang punya komponen sendiri (standalone, tidak menggunakan AppShell)
const SPECIAL_ROUTES = {
  'forgot-password': ForgotPasswordPage,
  'login': LoginPage,
};

// Route -> Component mapping for pages that use their own AppShell internally
const ROUTED_PAGES = {
  // Mahasiswa feature pages
  'status-presensi': StatusPresensiPage,
  'kelas-saya': KlsSayaMahasiswaPage,
  'kelas-saya-mahasiswa': KlsSayaMahasiswaPage,
  'ruang-kelas': RuangKelasPage,
  'panduan-belajar': PanduanBelajarPage,

  // Dosen feature pages
  'dasbor-dosen': DasborDosenPage,
  'kelas-diampu': KelasDiampuPage,
  'kelola-kelas': KelolaKlsPage,
  'daftar-hadir-koreksi': DaftarHadirKoreksiPage,
  'manajemen-materi': ManajemenMaterialPage,
  'unggah-materi': UnggahMateriPage,
  'pemeriksaan-tugas': PemeriksaanTugasPage,

  // Shared / Akademik
  'central-timeline': CentralTimelinePage,
  'rekap-kehadiran': RekapKehadiranPage,
  'rekap-nilai-dan-presensi': RekapKehadiranPage,

  // Admin feature pages
  'dasbor-admin': DasborAdminPage,
  'direct-enrollment': DirectEnrollmentPage,
  'manajemen-pengguna': ManajemenPenggunaPage,
  'master-mata-kuliah': MasterMataKuliahPage,
  'pembukaan-kelas': PembukaanKelasPage,
  'jejak-audit': JejakAuditPage,
  'konfigurasi-sistem': KonfigurasiSistemPage,

  // Profile & Shell
  'profile': ProfilePage,
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
      const [pathPart, queryPart] = route.split('?');
      const searchParams = new URLSearchParams(queryPart);
      const pageParam = searchParams.get('page');
      if (pageParam) return pageParam;
      // Route like "ruang-kelas?course=rpl-ti-a" -> key "ruang-kelas"
      const path = pathPart.startsWith('/') ? pathPart.slice(1) : pathPart;
      return path;
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

  // Dukungan routing reaktif untuk seluruh halaman E-Learning Kampus
  // SSR-safe: gunakan lazy initializer dengan check typeof window
  const [currentRoute, setCurrentRoute] = useState(() => {
    if (typeof window === 'undefined') return 'dasbor-mahasiswa';
    const searchParams = new URLSearchParams(window.location.search);
    const pageParam = searchParams.get('page');
    if (pageParam) {
      const course = searchParams.get('course');
      return course ? `${pageParam}?course=${encodeURIComponent(course)}` : pageParam;
    }
    // Path-based route: strip leading slash
    const path = window.location.pathname.startsWith('/') ? window.location.pathname.slice(1) : window.location.pathname;
    if (path === 'forgot-password') return 'forgot-password';
    if (path === 'login') return 'login';
    // Default to dashboard if empty (root path '/')
    return path || 'dasbor-mahasiswa';
  });

  useEffect(() => {
    const handleLocationChange = () => {
      const searchParams = new URLSearchParams(window.location.search);
      const pageParam = searchParams.get('page');
      const queryRole = searchParams.get('role');
      if (queryRole && ['mahasiswa', 'dosen', 'admin'].includes(queryRole)) {
        setActiveRole(queryRole);
      }
      if (pageParam) {
        // Validate route against known routes before setting
        const isKnownRoute = pageParam in ROUTES || pageParam in SPECIAL_ROUTES;
        if (isKnownRoute) {
          // Simpan route lengkap (dengan ?course=...) agar data mata kuliah ikut terbawa
          const course = searchParams.get('course');
          setCurrentRoute(course ? `${pageParam}?course=${encodeURIComponent(course)}` : pageParam);
        } else {
          console.warn(`[App] Invalid route in URL: "${pageParam}". Redirecting to dashboard.`);
          window.history.replaceState({}, '', '?page=dasbor-mahasiswa');
          setCurrentRoute('dasbor-mahasiswa');
        }
        return;
      }
      const path = window.location.pathname.startsWith('/') ? window.location.pathname.slice(1) : window.location.pathname;
      if (path === 'forgot-password') {
        setCurrentRoute('forgot-password');
        return;
      }
      if (path === 'login') {
        setCurrentRoute('login');
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
      return `?page=dasbor-mahasiswa`;
    }
    if (route.startsWith('/')) {
      route = route.slice(1);
    }
    // Handle full query string (e.g., '?page=foo' or '?page=foo&tab=bar')
    if (route.startsWith('?')) {
      return route;
    }
    // Handle route with extra params, e.g. 'ruang-kelas?course=rpl-ti-a'
    if (route.includes('?')) {
      const [path, query] = route.split('?');
      return `?page=${path}&${query}`;
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
      window.history.pushState({}, '', '?page=dasbor-mahasiswa');
      setCurrentRoute('dasbor-mahasiswa');
      return;
    }

    // Auto-sync role berdasarkan route target
    const dosenRoutes = ['dasbor-dosen', 'kelas-diampu', 'kelola-kelas', 'daftar-hadir-koreksi', 'manajemen-materi', 'unggah-materi', 'pemeriksaan-tugas'];
    const adminRoutes = ['dasbor-admin', 'direct-enrollment', 'manajemen-pengguna', 'master-mata-kuliah', 'pembukaan-kelas', 'jejak-audit', 'konfigurasi-sistem'];
    const mahasiswaRoutes = ['dasbor-mahasiswa', 'kelas-saya', 'kelas-saya-mahasiswa', 'ruang-kelas', 'panduan-belajar'];

    let targetRole = activeRole;
    if (dosenRoutes.includes(routeKey) && activeRole !== 'dosen') {
      targetRole = 'dosen';
      setActiveRole('dosen');
    } else if (adminRoutes.includes(routeKey) && activeRole !== 'admin') {
      targetRole = 'admin';
      setActiveRole('admin');
    } else if (mahasiswaRoutes.includes(routeKey) && activeRole !== 'mahasiswa') {
      targetRole = 'mahasiswa';
      setActiveRole('mahasiswa');
    }

    // Pertahankan param role agar peran aktif tidak hilang saat navigasi
    if (targetRole && !targetUrl.includes('role=')) {
      targetUrl += `${targetUrl.includes('?') ? '&' : '?'}role=${targetRole}`;
    }

    // pushState tidak memicu popstate, langsung set state.
    // Simpan route lengkap (termasuk query seperti ?course=...) agar
    // perpindahan antar mata kuliah di halaman yang sama tetap ter-render.
    const fullRoute = route && !route.startsWith('?') && route.includes('?') ? route : routeKey;
    window.history.pushState({}, '', targetUrl);
    setCurrentRoute(fullRoute);
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
    // Auto-navigate ke default dashboard saat ganti peran
    const defaultPages = {
      mahasiswa: 'dasbor-mahasiswa',
      dosen: 'dasbor-dosen',
      admin: 'dasbor-admin',
    };
    const defaultPage = defaultPages[newRole] || 'dasbor-mahasiswa';
    setCurrentRoute(defaultPage);
    const targetUrl = `?page=${defaultPage}&role=${newRole}`;
    window.history.pushState({}, '', targetUrl);
  }, []);

  // === RENDERING LOGIC ===
  const routeKey = normalizeRoute(currentRoute);

  // Ambil parameter ?course=... dari route aktif (atau dari URL browser)
  const extractCourseId = useCallback((route) => {
    try {
      if (route && route.includes('?')) {
        const queryPart = route.split('?')[1];
        const course = new URLSearchParams(queryPart).get('course');
        if (course) return course;
      }
      return new URL(window.location.href).searchParams.get('course') || null;
    } catch {
      return null;
    }
  }, []);

  // Halaman yang menampilkan satu mata kuliah tertentu: ruang kelas (mahasiswa)
  // dan kelola kelas (dosen). Keduanya membaca `?course=` dan memakai katalog
  // terpusat, sehingga identitas kelas tidak di-hardcode di komponen.
  const COURSE_SCOPED_ROUTES = ['ruang-kelas', 'kelola-kelas'];
  const courseId = COURSE_SCOPED_ROUTES.includes(routeKey) ? extractCourseId(currentRoute) : null;

  // 1. Auth route: halaman Lupa Password / Login selalu tampil standalone
  if (routeKey === 'forgot-password') {
    return <ForgotPasswordPage onNavigate={navigateTo} onBack={handleBack} />;
  }
  if (routeKey === 'login') {
    return <LoginPage onNavigate={navigateTo} onBack={handleBack} onRoleChange={handleRoleChange} />;
  }

  // 2. Check if this route has a dedicated page component (dosen, admin, mahasiswa, shared feature pages)
  const RoutedPage = ROUTED_PAGES[routeKey];
  if (RoutedPage) {
    if (routeKey === 'dasbor-dosen') {
      return <DasborDosenPage onRoleChange={handleRoleChange} onNavigate={navigateTo} />;
    }
    if (routeKey === 'dasbor-admin') {
      return (
        <DasborAdminPage
          onRoleChange={handleRoleChange}
          activeNavPath={routeKey}
          onNavChange={navigateTo}
          onNavigate={navigateTo}
        />
      );
    }
    // Pass courseId to course-scoped pages (key forces remount when course changes)
    if (COURSE_SCOPED_ROUTES.includes(routeKey)) {
      return (
        <RoutedPage
          key={courseId || 'default'}
          onNavigate={navigateTo}
          onRoleChange={handleRoleChange}
          courseId={courseId}
        />
      );
    }
    // All other feature pages receive standard props
    return (
      <RoutedPage
        onNavigate={navigateTo}
        onNavChange={navigateTo}
        onRoleChange={handleRoleChange}
        activeRole={activeRole}
        currentRole={activeRole}
        activeNavPath={routeKey}
      />
    );
  }

  // 3. Role-based default dashboards (when no specific route matched)
  if (activeRole === 'dosen') {
    return <DasborDosenPage onRoleChange={handleRoleChange} onNavigate={navigateTo} />;
  }

  if (activeRole === 'admin') {
    return (
      <DasborAdminPage
        onRoleChange={handleRoleChange}
        activeNavPath="dasbor-admin"
        onNavChange={navigateTo}
        onNavigate={navigateTo}
      />
    );
  }

  // 4. Default: Dasbor Mahasiswa dengan AppShell reusable
  return (
    <AppShell
      activeRole={activeRole}
      onRoleChange={handleRoleChange}
      activeNavPath="dasbor-mahasiswa"
      onNavChange={navigateTo}
    >
      {/* Dynamic Glow Scrim */}
      <div className="relative w-full">
        <div className="absolute -top-10 left-1/4 w-96 h-96 bg-primary-container/10 rounded-full blur-3xl pointer-events-none -z-10" />
        <div className="absolute top-48 right-10 w-80 h-80 bg-secondary-container/10 rounded-full blur-3xl pointer-events-none -z-10" />

        <Breadcrumb onNavigate={navigateTo} />
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
