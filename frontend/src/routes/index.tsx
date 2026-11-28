/**
 * routes/index.tsx
 *
 * Pohon rute React Router 6 path-based (Bab 3.1 IMPLEMENTATION_PLAN_MVP1_FRONTEND).
 *
 * - Rute resmi MVP 1: /login, /forgot-password, /reset-password, /dashboard,
 *   /profile, /admin/*, /403, /404.
 * - Bookmark lama `?page=...` diarahkan (replace) ke path baru agar tetap hidup.
 * - Rute MVP 2–5 dipasang sementara pada slug legacy di bawah RequireAuth.
 */

import { Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom';
import { RequireAuth } from './RequireAuth';
import { RequireRole } from './RequireRole';
import {
  LEGACY_PAGES,
  LegacyPageAdapter,
  useLegacyNavigate,
} from './legacy';

import LoginPage from '../features/auth/LoginPage';
import ResetPasswordPage from '../features/auth/ResetPasswordPage';
import ForgotPasswordPage from '../pages/ForgotPassword';
import ProfilePage from '../features/profile/ProfilePage';
import DasborAdminPage from '../pages/DasborAdmin';
import DasborDosenPage from '../pages/DasborDosen';
import ManajemenPenggunaPage from '../pages/ManajemenPengguna';
import MasterMataKuliahPage from '../pages/MasterMataKuliah';
import PembukaanKelasPage from '../pages/PembukaanKelas';
import DirectEnrollmentPage from '../pages/DirectEnrollment';
import JejakAuditPage from '../pages/JejakAudit';
import KonfigurasiSistemPage from '../pages/KonfigurasiSistem';
import MahasiswaDashboardLegacy from '../features/dashboard/MahasiswaDashboardLegacy';
import { useAuthStore } from '../stores/authStore';

// ---------------------------------------------------------------------------
// Redirect bookmark lama `?page=...&role=...` → path baru
// ---------------------------------------------------------------------------

function LegacyQueryParamRedirect() {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const page = params.get('page');

  if (!page) {
    return <Outlet />;
  }

  const course = params.get('course');
  const base =
    page === 'dasbor-mahasiswa' || page === 'dasbor-dosen' || page === 'dasbor-admin'
      ? '/dashboard'
      : `/${page}`;
  const target = course ? `${base}?course=${encodeURIComponent(course)}` : base;
  return <Navigate to={target} replace />;
}

// ---------------------------------------------------------------------------
// Halaman error
// ---------------------------------------------------------------------------

export function ForbiddenPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-gutter">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-error-container flex items-center justify-center">
          <span className="material-symbols-outlined text-3xl text-on-error-container">lock</span>
        </div>
        <h1 className="font-headline-lg text-headline-lg text-on-surface font-bold">403 — Akses Ditolak</h1>
        <p className="font-body-md text-body-md text-on-surface-variant mt-2">
          Anda tidak memiliki izin untuk membuka halaman ini.
        </p>
        <BackToDashboardLink />
      </div>
    </div>
  );
}

export function NotFoundPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-gutter">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-surface-container-high flex items-center justify-center">
          <span className="material-symbols-outlined text-3xl text-on-surface-variant">explore_off</span>
        </div>
        <h1 className="font-headline-lg text-headline-lg text-on-surface font-bold">404 — Halaman Tidak Ditemukan</h1>
        <p className="font-body-md text-body-md text-on-surface-variant mt-2">
          Alamat yang Anda tuju tidak tersedia atau telah dipindahkan.
        </p>
        <BackToDashboardLink />
      </div>
    </div>
  );
}

function BackToDashboardLink() {
  const navigate = useLegacyNavigate();
  const status = useAuthStore((s) => s.status);
  return (
    <button
      type="button"
      onClick={() => navigate(status === 'authenticated' ? '/dashboard' : '/login')}
      className="mt-space-lg inline-flex items-center gap-2 rounded-xl bg-primary text-on-primary px-4 py-2 font-label-md text-label-md hover:bg-primary-hover transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
    >
      <span className="material-symbols-outlined text-[18px]">arrow_back</span>
      Kembali
    </button>
  );
}

// ---------------------------------------------------------------------------
// Dasbor per peran (masih komponen legacy; diganti Fase 3)
// ---------------------------------------------------------------------------

function DashboardRouter() {
  const navigate = useLegacyNavigate();
  const role = useAuthStore((s) => s.getCurrentRole());

  if (role === 'admin') {
    return (
      <DasborAdminPage
        onRoleChange={() => navigate('/dashboard')}
        activeNavPath="dasbor-admin"
        onNavChange={navigate}
        onNavigate={navigate}
      />
    );
  }
  if (role === 'dosen') {
    return <DasborDosenPage onRoleChange={() => navigate('/dashboard')} onNavigate={navigate} />;
  }
  return <MahasiswaDashboardLegacy onNavigate={navigate} onRoleChange={() => navigate('/dashboard')} />;
}

// ---------------------------------------------------------------------------
// Adapter halaman auth
// ---------------------------------------------------------------------------

function ForgotPasswordPageAdapter() {
  const navigate = useLegacyNavigate();
  return <ForgotPasswordPage onNavigate={navigate} onBack={() => navigate('/login')} />;
}

// ---------------------------------------------------------------------------
// Pohon rute
// ---------------------------------------------------------------------------

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<LegacyQueryParamRedirect />}>
        {/* Rute publik */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPageAdapter />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />

        {/* Halaman error */}
        <Route path="/403" element={<ForbiddenPage />} />
        <Route path="/404" element={<NotFoundPage />} />

        {/* Rute privat */}
        <Route element={<RequireAuth />}>
          <Route path="/dashboard" element={<DashboardRouter />} />
          <Route path="/profile" element={<ProfilePage />} />

          {/* Rute admin — guard peran */}
          <Route path="/admin" element={<RequireRole roles={['admin']} />}>
            <Route index element={<Navigate to="/admin/users" replace />} />
            <Route
              path="users"
              element={<LegacyPageAdapter routeKey="manajemen-pengguna" component={ManajemenPenggunaPage} />}
            />
            <Route
              path="courses"
              element={<LegacyPageAdapter routeKey="master-mata-kuliah" component={MasterMataKuliahPage} />}
            />
            <Route
              path="classes"
              element={<LegacyPageAdapter routeKey="pembukaan-kelas" component={PembukaanKelasPage} />}
            />
            <Route
              path="enrollments"
              element={<LegacyPageAdapter routeKey="direct-enrollment" component={DirectEnrollmentPage} />}
            />
            <Route
              path="audit-logs"
              element={<LegacyPageAdapter routeKey="jejak-audit" component={JejakAuditPage} />}
            />
            <Route
              path="config"
              element={<LegacyPageAdapter routeKey="konfigurasi-sistem" component={KonfigurasiSistemPage} />}
            />
          </Route>

          {/* Rute legacy MVP 2–5 (sementara, dihapus saat migrasi) */}
          {LEGACY_PAGES.map(({ key, component }) => (
            <Route key={key} path={`/${key}`} element={<LegacyPageAdapter routeKey={key} component={component} />} />
          ))}
        </Route>

        {/* Root & fallback */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}

