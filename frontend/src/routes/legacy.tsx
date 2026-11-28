/**
 * routes/legacy.tsx
 *
 * Lapisan kompatibilitas selama migrasi router (Bab 5 "Prinsip"):
 * halaman lama bertahan sebagai wrapper tipis dan dipasang pada rute
 * sementara berbasis slug. Navigasi legacy (`onNavigate('kelas-saya')`,
 * `?page=...`) diterjemahkan ke path baru React Router.
 *
 * Rute yang sudah menjadi rute resmi MVP 1 dipetakan lewat
 * `LEGACY_PATH_MAP`; rute MVP 2–5 dirender sementara pada slug lamanya
 * dan akan dihapus saat migrasi masing-masing MVP.
 */

import { useMemo, type ComponentType } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';

// ---------------------------------------------------------------------------
// Peta route legacy → path baru
// ---------------------------------------------------------------------------

/** Key `?page=` lama → path React Router resmi MVP 1. */
export const LEGACY_PATH_MAP: Record<string, string> = {
  'dasbor-mahasiswa': '/dashboard',
  'dasbor-dosen': '/dashboard',
  'dasbor-admin': '/dashboard',
  'profile': '/profile',
  'login': '/login',
  'forgot-password': '/forgot-password',
  'manajemen-pengguna': '/admin/users',
  'master-mata-kuliah': '/admin/courses',
  'pembukaan-kelas': '/admin/classes',
  'direct-enrollment': '/admin/enrollments',
  'jejak-audit': '/admin/audit-logs',
  'konfigurasi-sistem': '/admin/config',
};

// ---------------------------------------------------------------------------
// Halaman legacy MVP 2–5 (sementara, dihapus saat migrasi masing-masing)
// ---------------------------------------------------------------------------

import KlsSayaMahasiswaPage from '../pages/KlsSayaMahasiswa';
import RuangKelasPage from '../pages/RuangKelas';
import PanduanBelajarPage from '../pages/PanduanBelajar';
import StatusPresensiPage from '../pages/StatusPresensi';
import RekapKehadiranPage from '../pages/RekapKehadiran';
import CentralTimelinePage from '../pages/CentralTimeline';
import KelasDiampuPage from '../pages/KelasDiampu';
import KelolaKlsPage from '../pages/KelolaKls';
import DaftarHadirKoreksiPage from '../pages/DaftarHadirKoreksi';
import ManajemenMaterialPage from '../pages/ManajemenMaterial';
import UnggahMateriPage from '../pages/UnggahMateri';
import PemeriksaanTugasPage from '../pages/PemeriksaanTugas';
import AppShellGlobalPage from '../pages/AppShellGlobal';

/** Halaman yang membaca `?course=` untuk identitas mata kuliah/kelas. */
const COURSE_SCOPED_KEYS = new Set(['ruang-kelas', 'kelola-kelas']);

interface LegacyPageDef {
  /** Key `?page=` lama yang juga dipakai sebagai slug sementara. */
  key: string;
  component: ComponentType<any>;
}

export const LEGACY_PAGES: LegacyPageDef[] = [
  { key: 'kelas-saya', component: KlsSayaMahasiswaPage },
  { key: 'kelas-saya-mahasiswa', component: KlsSayaMahasiswaPage },
  { key: 'ruang-kelas', component: RuangKelasPage },
  { key: 'panduan-belajar', component: PanduanBelajarPage },
  { key: 'status-presensi', component: StatusPresensiPage },
  { key: 'rekap-kehadiran', component: RekapKehadiranPage },
  { key: 'rekap-nilai-dan-presensi', component: RekapKehadiranPage },
  { key: 'central-timeline', component: CentralTimelinePage },
  { key: 'kelas-diampu', component: KelasDiampuPage },
  { key: 'kelola-kelas', component: KelolaKlsPage },
  { key: 'daftar-hadir-koreksi', component: DaftarHadirKoreksiPage },
  { key: 'manajemen-materi', component: ManajemenMaterialPage },
  { key: 'unggah-materi', component: UnggahMateriPage },
  { key: 'pemeriksaan-tugas', component: PemeriksaanTugasPage },
  { key: 'app-shell', component: AppShellGlobalPage },
];

// ---------------------------------------------------------------------------
// Navigasi kompatibilitas
// ---------------------------------------------------------------------------

/**
 * Hook navigasi yang menerima format legacy (`'kelas-saya'`,
 * `'ruang-kelas?course=x'`, `'/login'`) dan menerjemahkannya ke path baru.
 * Dipass ke halaman lama sebagai `onNavigate` / `onNavChange`.
 */
export function useLegacyNavigate() {
  const navigate = useNavigate();

  return useMemo(
    () =>
      (route: string) => {
        if (!route) {
          navigate('/dashboard');
          return;
        }

        // URL absolut internal (mis. '/login') → teruskan apa adanya.
        if (route.startsWith('/')) {
          navigate(route);
          return;
        }

        const [rawKey, query = ''] = route.split('?');
        const key = rawKey.replace(/^#\/?/, '');
        const mapped = LEGACY_PATH_MAP[key];
        const target = mapped ?? `/${key}`;
        const search = query ? `?${query}` : '';
        navigate(`${target}${search}`);
      },
    [navigate]
  );
}

// ---------------------------------------------------------------------------
// Adapter halaman legacy
// ---------------------------------------------------------------------------

export interface LegacyPageAdapterProps {
  routeKey: string;
  component: ComponentType<any>;
}

/**
 * Adapter generik: menyambungkan props routing lama (onNavigate,
 * onRoleChange, activeRole, dst.) ke implementasi React Router.
 * Peran kini bersumber dari sesi (authStore), bukan query string.
 */
export function LegacyPageAdapter({ routeKey, component: Page }: LegacyPageAdapterProps) {
  const navigate = useLegacyNavigate();
  const role = useAuthStore((s) => s.getCurrentRole());
  const [searchParams] = useSearchParams();

  const courseId = COURSE_SCOPED_KEYS.has(routeKey) ? searchParams.get('course') : null;

  return (
    <Page
      onNavigate={navigate}
      onNavChange={navigate}
      onRoleChange={() => navigate('/dashboard')}
      activeRole={role}
      currentRole={role}
      activeNavPath={routeKey}
      courseId={courseId}
    />
  );
}
