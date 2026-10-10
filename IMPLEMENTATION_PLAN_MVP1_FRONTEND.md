# Implementation Plan: Frontend MVP 1
# SPADA (Learning Management System) Universitas PGRI Semarang (UPGRIS)
**Team Membangun Negeri — Rencana Eksekusi Teknis Frontend: Fondasi, Akun, Master Data & Direct Enrollment**

---

## 📌 Ringkasan Eksekutif
- **Target Rilis:** Frontend Web Client MVP 1 SPADA LMS UPGRIS.
- **Acuan Utama:** [PRD.md](PRD.md) (*Bab 2, 3, 5, 7*), [SRS.md](SRS.md) (*Bab 3, 4, 10, 13, 21, 27, 28, 29, 30*), [DESIGN_INSTRUCTIONS_MVP1_UIUX.md](DESIGN_INSTRUCTIONS_MVP1_UIUX.md), [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md) (Spesifikasi Portal Login & Landing — Dark-Mode Navy, serta Token Operasional Permukaan Terang), dan [IMPLEMENTATION_PLAN_MVP1_BACKEND.md](IMPLEMENTATION_PLAN_MVP1_BACKEND.md).
- **Metodologi & Workflow Utama:** **Stitch HTML-to-React Conversion Pipeline**. Tim UI/UX merancang antarmuka 100% menggunakan prompt Google Stitch pada tiap fase dan mengekspor hasilnya dalam berkas HTML semantik + Tailwind CSS. Tim Frontend Developer menerima berkas HTML tersebut, lalu mengonversi, memodularisasi, dan menghubungkannya ke dalam *tech stack* resmi (Vite + React 18+ + TypeScript + Tailwind CSS + Zustand + TanStack Query + React Hook Form + Zod + Lucide React) serta mengintegrasikannya dengan REST API Backend.
- **Kondisi Repository:** Struktur *multi-folder workspace* berdampingan dengan `backend/` (Node.js/Express di port 5000). Aplikasi frontend dibangun di dalam direktori `frontend/` (port 5173 dengan reverse proxy `/api` ke `http://localhost:5000`).

---

## 1. Tujuan, Ruang Lingkup & Kondisi Repository Eksisting

### 1.1 Tujuan
Membangun antarmuka Single Page Application (SPA) yang berkinerja tinggi, intuitif, berintegritas data tinggi, bebas friksi birokrasi non-LMS, dan responsif. Aplikasi ini melayani sivitas akademika Universitas PGRI Semarang dalam mengakses gerbang pembelajaran digital, mengelola master data akademik SPADA, pendaftaran kepesertaan kelas (*direct enrollment* BR-002), manajemen profil mandiri, serta peninjau jejak audit untuk 3 peran resmi: **Mahasiswa**, **Dosen**, dan **Admin**.

### 1.2 Kondisi Repository Saat Ini
1. **Workspace Multi-Folder:**
   - Root direktori repository `rpl-lms/` saat ini memuat modul `backend/` berbasis Node.js Express, Prisma ORM v6+, PostgreSQL, dan Zod DTO yang berjalan pada port `5000` (`http://localhost:5000`).
   - Direktori `frontend/` akan diinisialisasi di root repository menggunakan Vite React-TS (`npm create vite@latest frontend -- --template react-ts`).
2. **Konektivitas Dev Server & Proxy:**
   - Vite dev server dijalankan pada port `5173`.
   - `vite.config.ts` dikonfigurasi dengan reverse proxy `/api` mengarah ke backend port `5000` untuk menghindari kendala CORS pada lingkungan pengembangan lokal.
3. **Direktori Handoff Ekspor Stitch:**
   - Disediakan folder penampung artefak HTML dari tim UI/UX di `frontend/stitch-handoff/` yang dipisahkan per fase (`fase-1` s.d. `fase-6`).
   - Berkas di dalam `stitch-handoff/` berfungsi sebagai referensi murni dan dieksklusi dari kompilasi bundle produksi (*ignored in build*).

### 1.3 Ruang Lingkup Fitur Frontend MVP 1
1. **Autentikasi & Sesi Pengguna:**
   - Halaman login multi-kredensial bertema Dark-Mode Professional Navy (`/login` — NIM/NIDN/NIP/Username/Email + Password).
   - Penolakan akses untuk akun berstatus `INACTIVE` atau `SUSPENDED` disertai pesan informatif ramah.
   - Fitur *remember me*, lupa password (`/forgot-password`), dan logout aman.
   - Mekanisme *silent refresh token* otomatis via Axios interceptor mutex tanpa mengganggu alur kerja pengguna.
2. **App Shell & Navigasi Terstruktur SPADA:**
   - Topbar informatif: Logo SPADA UPGRIS, indikator semester aktif (*"🟢 Semester Ganjil 2026/2027"*), profil pengguna, dan menu logout.
   - Sidebar navigasi modular dan adaptif sesuai hak akses 3 peran resmi (Mahasiswa, Dosen, Admin).
3. **Dasbor Kontekstual 3 Peran Resmi:**
   - **Mahasiswa:** Header profil mahasiswa (NIM, semester aktif), kartu kelas perkuliahan yang dienroll oleh Admin (nama mata kuliah, kode kelas, SKS, nama dosen pengampu, tombol akses kelas), ringkasan status akademik.
   - **Dosen:** Header profil dosen bergelar (NIDN), 3 metrik pengajaran (kelas diampu, beban SKS, total mahasiswa), kartu kelas yang diampu pada semester aktif.
   - **Admin:** Header admin, 4 kartu statistik metrik utama sistem (Total Mahasiswa, Total Dosen, Total Mata Kuliah, Total Kelas & Enrollment Aktif), pintasan cepat operasional (*Quick Shortcuts Grid*), dan snapshot 5 riwayat audit log terbaru.
4. **Modul Pengelolaan Profil Pengguna Mandiri (`/profile`):**
   - Tab 1: Biodata Diri (identitas akun, kontak, bio).
   - Upload Foto Profil / Avatar (preview interaktif, validasi format .jpg/.jpeg/.png, batas maksimal 2MB).
   - Tab 2: Ganti Password mandiri (verifikasi kata sandi lama, indikator meter kekuatan kata sandi).
5. **Modul Master Data Akademik SPADA (Khusus Admin):**
   - **Manajemen Pengguna (`/admin/users`):** Data table dengan server-side pagination, search multi-kolom, filter 3 role, filter status (`ACTIVE`, `INACTIVE`, `SUSPENDED`), modal tambah pengguna dinamis sesuai peran, modal ganti status akun, modal reset password akun.
   - **Master Mata Kuliah (`/admin/courses`):** Data table, modal CRUD mata kuliah (Kode MK, Nama Mata Kuliah, Beban SKS 1–6, Deskripsi Kompetensi).
   - **Pembukaan Kelas Perkuliahan (`/admin/classes`):** Data table penawaran kelas semester aktif, modal buka kelas (pilih Mata Kuliah, pilih Dosen Pengampu, Kode/Nama Kelas misal "TI-A", Tahun Akademik, Semester Ganjil/Genap, Kapasitas Kuota).
6. **Modul Direct Enrollment Mahasiswa (Khusus Admin — Aturan Bisnis BR-002):**
   - Halaman Manajemen Enrollment Kelas (`/admin/enrollments`):
     - Selector kelas perkuliahan aktif dengan progress bar visual kapasitas terisi vs total daya tampung.
     - Layout dua panel (*Split View*):
       - Panel Kiri (*Enrolled Students*): Daftar mahasiswa terdaftar di kelas dengan tombol pencabutan (*Unenroll*).
       - Panel Kanan (*Available Students*): Daftar mahasiswa tersedia dengan pencarian dan *multi-select checkbox* untuk aksi **Batch Enroll** langsung ke kelas.
7. **Modul Jejak Audit (`/admin/audit-logs` — Khusus Admin):**
   - Tabel riwayat audit log (filter tanggal, aksi, entitas, aktor).
   - Modal inspeksi perbedaan data JSON (*Old Values* vs *New Values* Diff Inspector).
8. **Error Handling, States & Responsive UI:**
   - Skeleton loading shimmer effect, empty states ramah pengguna, React Error Boundary, halaman kustom 401, 403, 404, 500, serta adaptasi layar smartphone (375px+).

---

## 2. Pemilihan Tech Stack & Rationale

| Layer / Kebutuhan | Pilihan Teknologi | Versi | Alasan Pemilihan & Keunggulan |
|---|---|---|---|
| **Build Tool & Framework** | [Vite](https://vitejs.dev/) + [React](https://react.dev/) | React 18+ LTS / Vite 5+ | Kecepatan kompilasi instan, Hot Module Replacement (HMR) sub-detik, ringan, dan standar industri SPA modern. |
| **Bahasa Pemrograman** | [TypeScript](https://www.typescriptlang.org/) | `v5.0+` | Menjamin *type-safety*, mencegah *runtime error*, dan menyediakan *auto-complete* akurat yang selaras dengan DTO backend. |
| **CSS Framework** | [Tailwind CSS](https://tailwindcss.com/) | `v3.4+` | Efisiensi styling tinggi, kemudahan integrasi dengan *design tokens* (warna, spasi 8pt), serta hasil build CSS sangat ramping. |
| **Animasi & Transisi** | [tailwindcss-animate](https://github.com/emad/tailwindcss-animate) | Latest | Utilitas animasi (fade/slide/shimmer) selaras Tailwind; dipakai untuk *soft elevation*, skeleton loading, dan toast. |
| **UI Primitives / Headless** | [Radix UI](https://www.radix-ui.com/) / [shadcn/ui](https://ui.shadcn.com/) | Latest | Komponen *headless* berbasis standar aksesibilitas WAI-ARIA, fleksibel, mudah dikustomisasi dari kode HTML Stitch. |
| **Ikonografi** | [Lucide React](https://lucide.dev/) | Latest | Koleksi ikon SVG modern, konsisten, berukuran ringan, ramah *tree-shaking*, menggantikan inline SVG dari Stitch. |
| **Routing & Navigation** | [React Router DOM](https://reactrouter.com/) | `v6.22+` | Dukungan *nested routes*, *layout outlets*, dan proteksi rute berbasis otorisasi peran (*ProtectedRoute*, *RoleGuard*). |
| **Server State & Caching** | [TanStack Query](https://tanstack.com/query/latest) (React Query) | `v5+` | Pengelolaan data asinkron server otomatis: caching pintar, background re-fetching, pagination, mutasi data, dan status loading/error. |
| **Client / Global State** | [Zustand](https://zustand-demo.pmnd.rs/) | `v4.5+` | State manager minimalis (<2KB), tanpa *boilerplate*, ideal untuk menyimpan sesi auth, token, profil aktif, dan state UI. |
| **Form & Validasi** | [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/) | RHF v7 + Zod v3 | Penanganan form efisien tanpa *re-render* berlebih, validasi skema deklaratif yang selaras dengan validasi backend Zod. |
| **HTTP Client** | [Axios](https://axios-http.com/) | `v1.7+` | Pengaturan *interceptors* terpusat untuk injeksi Bearer Token, penanganan otomatis refresh token saat 401, dan normalisasi error. |
| **Format Waktu & Tanggal** | [date-fns](https://date-fns.org/) | `v3+` | Library manipulasi tanggal modular dan ramah *tree-shaking* dengan dukungan lokal Bahasa Indonesia (`id`). |
| **Testing Suite** | [Vitest](https://vitest.dev/) + [React Testing Library](https://testing-library.com/) | Latest | Eksekusi unit/komponen test super cepat terintegrasi langsung dengan ekosistem Vite. |

---

## 3. Workflow Kolaborasi: Stitch HTML-to-React Conversion Pipeline

Seluruh pengerjaan antarmuka frontend mengadopsi alur terstruktur dari berkas HTML hasil Google Stitch menjadi kode React TypeScript produksi:

```text
┌────────────────────────────────────────────────────────────────────────┐
│ TIM UI/UX DESIGNER (Google Stitch)                                    │
│ 1. Mengirim prompt terstruktur sesuai Fase 1 s.d. 6 di Stitch          │
│ 2. Menghasilkan visual High-Fidelity & layout responsif                │
│ 3. Mengekspor berkas HTML Semantik + kelas Tailwind CSS ke:            │
│    frontend/stitch-handoff/fase-{1..6}/*.html                          │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ (Handoff Berkas HTML)
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│ TIM FRONTEND DEVELOPER (React + TypeScript Conversion)                 │
│ 1. Parsing & Destrukturisasi: Memecah HTML monolitik menjadi komponen  │
│    React modular (.tsx) di src/components/ dan src/features/           │
│ 2. Harmonisasi Styling: Memastikan utility class Tailwind selaras      │
│    dengan design tokens di tailwind.config.js                          │
│ 3. Ikonografi: Mengganti inline SVG mentah Stitch dengan Lucide React  │
│ 4. State & Interaktivitas: Mengintegrasikan Zustand & React Hook Form  │
│ 5. Validasi: Menerapkan skema Zod pada seluruh form input              │
│ 6. Integrasi API: Menghubungkan komponen ke REST API via TanStack Query│
│ 7. Feedback States: Mengisi loading dengan Skeleton & error handling   │
└────────────────────────────────────────────────────────────────────────┘
```

### Standar Konversi HTML Stitch ke Komponen React:
1. **Penyesuaian Sintaksis JSX:** Mengubah atribut HTML standar (`class` → `className`, `for` → `htmlFor`, `tabindex` → `tabIndex`, style inline dieliminasi dan dikonversi ke utilitas Tailwind).
2. **Ekstraksi Reusable Atoms & Molecules:** Potongan elemen berulang pada HTML Stitch (misalnya button, badge, input field, data row) langsung diekstraksi ke `src/components/ui/`.
3. **Penggantian Inline SVG ke Lucide Icons:** Seluruh SVG mentah dari Stitch diganti dengan komponen Lucide React yang setara (misal `<svg>...</svg>` gembok diganti `<Lock className="w-5 h-5 text-gray-400" />`).
4. **Binding Dinamis:** Seluruh teks statis / data tabel dummy pada HTML Stitch diganti dengan properti React (*props*) dan *data mapping* dari TanStack Query.
5. **Validasi Skema Form:** Setiap `<form>` dari HTML Stitch dibungkus dengan `useForm` dari React Hook Form menggunakan resolver `zodResolver(formSchema)`.

---

## 4. Struktur Direktori Proyek Frontend & Handoff

```text
frontend/
├── index.html                       # HTML Template utama SPA
├── package.json                     # Dependensi dan script npm
├── tsconfig.json                    # Konfigurasi TypeScript compiler
├── vite.config.ts                   # Konfigurasi bundler Vite, aliases (@/*), & proxy backend :5000
├── tailwind.config.js               # Konfigurasi tema warna & design tokens (Dark Navy & Light Surface)
├── postcss.config.js
│
├── public/                          # Aset statis publik (Logo UPGRIS, Favicon)
│   ├── favicon.ico
│   └── logo-spada.svg
│
├── stitch-handoff/                  # [HANDOFF ZONE] Direktori berkas HTML dari tim UI/UX Stitch
│   ├── fase-1-primitives/           # Ekspor HTML sitemap & tokens
│   ├── fase-2-uikit/                # Ekspor HTML atoms & molecules (buttons, inputs, cards)
│   ├── fase-3-auth-shell-profile/   # Ekspor HTML login.html, forgot-password.html, shell.html, profile.html
│   ├── fase-4-dashboards/           # Ekspor HTML dashboard-mhs.html, dosen.html, admin.html
│   ├── fase-5-admin-modules/        # Ekspor HTML users.html, courses.html, enrollments.html, audit.html
│   └── fase-6-states-errors/        # Ekspor HTML skeletons.html, 401.html, 403.html, 404.html, 500.html
│
└── src/                             # Kode sumber aplikasi React TypeScript
    ├── main.tsx                     # Entry point aplikasi & inisialisasi QueryClient
    ├── App.tsx                      # Root App component dengan Router Provider
    │
    ├── assets/                      # Ilustrasi SVG & gambar lokal
    │
    ├── components/                  # Komponen Reusable Global (Hasil konversi HTML Stitch)
    │   ├── ui/                      # Atoms & Molecules
    │   │   ├── button.tsx           # Primary, Portal Gradient, Destructive, Ghost, Loading
    │   │   ├── input.tsx            # Text input, prefix icons
    │   │   ├── password-input.tsx   # Password input dengan toggle show/hide
    │   │   ├── select.tsx           # Custom select dropdown
    │   │   ├── checkbox.tsx         # Custom rounded checkbox
    │   │   ├── badge.tsx            # Status pills (Active, Inactive, Suspended, Security)
    │   │   ├── card.tsx             # Card kontainer (Light & Dark)
    │   │   ├── stat-card.tsx        # Stat metric card
    │   │   ├── modal.tsx            # Dialog form & konfirmasi
    │   │   ├── table.tsx            # Data table primitif
    │   │   ├── skeleton.tsx         # Shimmer loading effect
    │   │   └── toast.tsx            # Alert notification toast
    │   ├── feedback/                # EmptyState, ErrorBoundary, LoadingSpinner
    │   └── common/                  # PaginationBar, SearchFilterBar, ConfirmDialog
    │
    ├── layouts/                     # Layout Wrapper
    │   ├── AuthLayout.tsx           # Layout Dark-Mode Navy (#0D1B2A → #1B2A4A) untuk /login & /forgot-password
    │   ├── AppLayout.tsx            # Shell utama SPADA (Topbar, Sidebar, Breadcrumb, Outlet)
    │   ├── Topbar.tsx               # Header global + User Menu + Badge Semester
    │   └── Sidebar.tsx              # Sidebar modular sesuai hak akses 3 peran resmi
    │
    ├── features/                    # Modul Fitur Bisnis (Feature-Driven Architecture)
    │   ├── auth/                    # Modul Autentikasi
    │   │   ├── components/          # PortalNavbar, LoginFormCard, StatistikCardModule, SystemBadgesContainer, FabHelpCenter
    │   │   ├── hooks/               # useAuth, useLogin, useLogout, useForgotPassword
    │   │   ├── services/            # authService.ts
    │   │   └── types/               # auth.types.ts
    │   │
    │   ├── dashboard/               # Modul Dasbor Kontekstual SPADA
    │   │   ├── components/          # MahasiswaDashboard, DosenDashboard, AdminDashboard
    │   │   ├── services/            # dashboardService.ts
    │   │   └── types/               # dashboard.types.ts
    │   │
    │   ├── profile/                 # Modul Profil & Keamanan
    │   │   ├── components/          # ProfileBiodataTab, ChangePasswordTab, AvatarUploader
    │   │   └── services/            # profileService.ts
    │   │
    │   ├── classes/                 # Modul Ruang Kelas Pengguna (Mahasiswa & Dosen)
    │   │   ├── components/          # ClassCard, ClassList
    │   │   └── services/            # classesService.ts
    │   │
    │   └── admin/                   # Modul Khusus Administrator
    │       ├── users/               # Manajemen Akun Pengguna & RBAC
    │       │   ├── components/      # UserTable, UserModal, UserStatusModal, UserPasswordResetModal
    │       │   └── services/        # usersAdminService.ts
    │       ├── courses/             # Master Mata Kuliah
    │       │   ├── components/      # CourseTable, CourseModal
    │       │   └── services/        # coursesAdminService.ts
    │       ├── classes/             # Pembukaan Kelas Perkuliahan
    │       │   ├── components/      # ClassAdminTable, ClassModal
    │       │   └── services/        # classesAdminService.ts
    │       ├── enrollments/         # Modul Direct Enrollment Mahasiswa (BR-002)
    │       │   ├── components/      # EnrollmentManager, EnrolledList, AvailableStudentList, CapacityProgressBar
    │       │   └── services/        # enrollmentsAdminService.ts
    │       └── audit-log/           # Modul Jejak Audit
    │           ├── components/      # AuditLogTable, AuditDetailModal (JSON Diff Inspector)
    │           └── services/        # auditLogService.ts
    │
    ├── hooks/                       # Custom Global Hooks (useToast, useDebounce, dll.)
    ├── routes/                      # Konfigurasi Routing
    │   ├── index.tsx                # Definisi Rute Lengkap
    │   ├── ProtectedRoute.tsx       # Guard autentikasi token & status akun user
    │   └── RoleGuard.tsx            # Guard otorisasi peran (mahasiswa, dosen, admin)
    │
    ├── services/                    # Setup HTTP Client Terpusat
    │   └── api.ts                   # Axios instance dengan Interceptors & Silent Refresh Mutex
    │
    ├── store/                       # Global State Store (Zustand)
    │   ├── useAuthStore.ts          # State autentikasi, token, profile, role
    │   └── useAppStore.ts           # State UI (sidebar toggle, active semester)
    │
    ├── types/                       # Definisi TypeScript Global & API Response Standard
    │   └── api.types.ts             # ApiResponse<T>, PaginationMeta, ApiError
    │
    └── utils/                       # Utility Helpers (dateFormatter, fileValidator, tokenStorage)
```

---

## 5. Arsitektur Autentikasi, Sesi & RBAC Guard

### 5.1 Mekanisme Token & Axios Silent Refresh Interceptor
1. **Access Token (15 Menit):** Disimpan di memori runtime (`Zustand Store`) untuk pencegahan eksploitasi XSS.
2. **Refresh Token (7 Hari):** Disimpan di `localStorage` atau secure cookie.
3. **Silent Refresh Interceptor:** Menangani status HTTP `401 Unauthorized` dengan menahan request dalam antrean (*queue*), memperbarui access token ke `POST /api/auth/refresh`, lalu melakukan *replay request* otomatis.

```typescript
// src/services/api.ts
import axios from 'axios';
import { useAuthStore } from '@/store/useAuthStore';

export const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

let isRefreshing = false;
let failedQueue: Array<{ resolve: (token: string) => void; reject: (err: any) => void }> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token!);
    }
  });
  failedQueue = [];
};

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) throw new Error('No refresh token available');

        const { data } = await axios.post('/api/auth/refresh', { refreshToken });
        const newAccessToken = data.data.accessToken;

        useAuthStore.getState().setAccessToken(newAccessToken);
        processQueue(null, newAccessToken);

        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (refreshErr) {
        processQueue(refreshErr, null);
        useAuthStore.getState().logout();
        window.location.href = '/login?expired=1';
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  }
);
```

### 5.2 Routing Terproteksi Berbasis Peran
- `ProtectedRoute`: Memeriksa keberadaan token aktif dan status akun (`ACTIVE`). Jika tidak memenuhi, dialihkan ke `/login`.
- `RoleGuard`: Memeriksa apakah peran pengguna (`mahasiswa`, `dosen`, atau `admin`) tercakup dalam `allowedRoles`. Jika tidak berwenang, diarahkan ke halaman kustom `403 Forbidden`.

```tsx
// src/routes/index.tsx
<Route element={<ProtectedRoute />}>
  <Route element={<AppLayout />}>
    <Route path="/dashboard" element={<DashboardPage />} />
    <Route path="/profile" element={<ProfilePage />} />
    <Route path="/classes" element={<ClassesPage />} />
    
    {/* Rute Khusus Admin */}
    <Route element={<RoleGuard allowedRoles={['admin']} />}>
      <Route path="/admin/users" element={<AdminUsersPage />} />
      <Route path="/admin/courses" element={<AdminCoursesPage />} />
      <Route path="/admin/classes" element={<AdminClassesPage />} />
      <Route path="/admin/enrollments" element={<AdminEnrollmentsPage />} />
      <Route path="/admin/audit-logs" element={<AdminAuditLogsPage />} />
    </Route>
  </Route>
</Route>
```

---

## 6. Pemetaan Rute Frontend ke Endpoint Backend MVP 1

| Halaman Frontend | Rute Frontend | Metode | Endpoint Backend | Data & Fungsi yang Diintegrasikan |
|---|---|---|---|---|
| **Login Portal** | `/login` | `POST` | `/api/auth/login` | Kirim kredensial (NIM/NIDN/Email/User + Password), terima token JWT & data profil. |
| **Lupa Password** | `/forgot-password` | `POST` | `/api/auth/forgot-password` | Kirim email terdaftar untuk permintaan tautan pemulihan kata sandi. |
| **Profil & Biodata** | `/profile` (Tab 1) | `GET` | `/api/profile` | Ambil data akun, profil biodata, NIM/NIDN, dan status keaktifan. |
| **Perbarui Profil** | `/profile` (Tab 1) | `PUT` | `/api/profile` | Perbarui nama lengkap, nomor telepon, dan bio profil pengguna. |
| **Upload Avatar** | `/profile` (Tab 1) | `POST` | `/api/profile/avatar` | Unggah berkas gambar avatar (multipart/form-data, validasi .jpg/.png maks 2MB). |
| **Ganti Password** | `/profile` (Tab 2) | `PUT` | `/api/profile/password` | Validasi kata sandi lama dan perbarui kata sandi baru. |
| **Logout Sesi** | Topbar / Modal | `POST` | `/api/auth/logout` | Cabut refresh token di database backend dan bersihkan sesi lokal. |
| **Dasbor SPADA** | `/dashboard` | `GET` | `/api/dashboard` | Ambil data metrik kontekstual peran aktif (Mahasiswa, Dosen, atau Admin). |
| **Kelas Saya** | `/classes` | `GET` | `/api/classes` | Ambil daftar kelas yang dienroll (Mahasiswa) atau diampu (Dosen). |
| **Detail Kelas** | `/classes/:id` | `GET` | `/api/classes/:id` | Ambil informasi dasar kelas, mata kuliah, kuota, dan dosen pengampu. |
| **Kelola Pengguna** | `/admin/users` | `GET`, `POST` | `/api/admin/users` | Tampilkan tabel user (pagination, search, filter) & modal tambah user baru. |
| **Detail Pengguna** | `/admin/users/:id` | `GET`, `PUT` | `/api/admin/users/:id` | Ambil detail akun & perbarui informasi data profil akun. |
| **Status Pengguna** | `/admin/users/:id` | `PATCH` | `/api/admin/users/:id/status` | Ubah status akun (`ACTIVE`, `INACTIVE`, `SUSPENDED`). |
| **Reset Password** | `/admin/users/:id` | `PUT` | `/api/admin/users/:id/reset-password` | Admin mereset kata sandi akun pengguna terpilih. |
| **Master Mata Kuliah**| `/admin/courses` | `GET`, `POST` | `/api/admin/courses` | Tampilkan tabel & modal penambahan mata kuliah baru (SKS 1–6). |
| **Aksi Mata Kuliah** | `/admin/courses` | `PUT`, `DELETE`| `/api/admin/courses/:id` | Perbarui informasi mata kuliah atau hapus data mata kuliah. |
| **Master Kelas** | `/admin/classes` | `GET`, `POST` | `/api/admin/classes` | Tampilkan daftar kelas semester aktif & modal pembukaan kelas baru. |
| **Aksi Kelas** | `/admin/classes` | `PUT`, `DELETE`| `/api/admin/classes/:id` | Perbarui informasi kelas perkuliahan atau hapus kelas. |
| **List Enrolled Mhs**| `/admin/enrollments`| `GET` | `/api/admin/classes/:classId/enrollments` | Tampilkan daftar mahasiswa yang telah terdaftar di kelas perkuliahan. |
| **Available Students**| `/admin/enrollments`| `GET` | `/api/admin/classes/:classId/available-students` | Tampilkan daftar mahasiswa belum terdaftar untuk batch enrollment. |
| **Eksekusi Enroll** | `/admin/enrollments`| `POST` | `/api/admin/enrollments` | Daftarkan mahasiswa ke kelas (individual maupun batch enroll). |
| **Unenroll Mahasiswa**| `/admin/enrollments`| `DELETE`| `/api/admin/enrollments/:id` | Cabut kepesertaan mahasiswa dari kelas perkuliahan. |
| **Peninjau Audit** | `/admin/audit-logs` | `GET` | `/api/admin/audit-logs` | Tampilkan riwayat log audit mutasi data (filter aksi, entitas, tanggal). |
| **Detail Audit JSON** | `/admin/audit-logs/:id`| `GET` | `/api/admin/audit-logs/:id` | Inspeksi perbandingan nilai lama vs nilai baru (*JSON Diff Inspector*). |

---

## 7. Rencana Eksekusi Bertahap 6 Fase (Penyelarasan dengan Google Stitch)

Rencana pengerjaan frontend diselaraskan secara linear dengan 6 fase desain pada [DESIGN_INSTRUCTIONS_MVP1_UIUX.md](DESIGN_INSTRUCTIONS_MVP1_UIUX.md). Pada setiap fase, tim Frontend Developer mengonversi artefak HTML hasil ekspor Stitch ke dalam ekosistem React TypeScript.

```text
Fase 1: Setup Workspace Frontend, Tooling, Proxy Dev Server & Inisialisasi Arsitektur Handoff
  │
  ▼
Fase 2: Konversi HTML UI Kit Primitives (Atoms & Molecules) ke Reusable React Components
  │
  ▼
Fase 3: Konversi HTML Halaman Autentikasi (Dark Navy), App Shell & Profil Mandiri
  │
  ▼
Fase 4: Konversi HTML Dasbor Kontekstual 3 Peran & Adaptasi Mobile Responsive
  │
  ▼
Fase 5: Konversi HTML Modul Admin (Master Data, Direct Enrollment BR-002 & Audit Trail)
  │
  ▼
Fase 6: Konversi HTML Status Batas, Error Boundary, Pengujian Kualitas & Build Verification
```

---

### 🚀 Fase 1: Setup Workspace Frontend, Tooling, Proxy Dev Server & Inisialisasi Arsitektur Handoff

* **Korelasi Desain:** Selaras dengan **Fase 1.1 (Project Initialization & System Rules)** dan **Fase 1.2 (Sitemap & Lo-Fi Architecture)** di `DESIGN_INSTRUCTIONS_MVP1_UIUX.md`.
* **Input Tim Frontend:** Spesifikasi aturan arsitektur, sitemap rute, dan token desain di `DESIGN_SYSTEM.md`.
* **Tugas & Rincian Teknis:**
  1. **Inisialisasi Project Frontend:**
     - Menjalankan scaffold di root workspace: `npm create vite@latest frontend -- --template react-ts`.
     - Mengatur path alias `@/*` mengarah ke `src/*` pada `frontend/tsconfig.json` dan `frontend/vite.config.ts`.
  2. **Konfigurasi Reverse Proxy Dev Server ke Backend:**
     - Mengarahkan request `/api` ke `http://localhost:5000` di `frontend/vite.config.ts`:
       ```typescript
       export default defineConfig({
         plugins: [react()],
         resolve: { alias: { '@': path.resolve(__dirname, './src') } },
         server: {
           port: 5173,
           proxy: {
             '/api': { target: 'http://localhost:5000', changeOrigin: true },
           },
         },
       });
       ```
  3. **Konfigurasi Tailwind CSS & Design Tokens:**
     - Menginstal Tailwind: `npm install -D tailwindcss postcss autoprefixer tailwindcss-animate`.
     - Mengonfigurasi `tailwind.config.js` untuk memetakan dua mode permukaan sesuai `DESIGN_SYSTEM.md`:
       - **Portal Dark-Navy:** `#0D1B2A`, `#1B2A4A`, `#3B82F6`, `#4F46E5`, `#38BDF8`, `#10B981`.
       - **Operasional Light Surface:** `#F8FAFC`, `#FFFFFF`, `#0F172A`, `#2563EB`, `#E2E8F0`, `#CBD5E1`.
       - Spasi 8pt (`4px, 8px, 12px, 16px, 24px, 32px, 48px, 64px`).
       - Font family `Plus Jakarta Sans` / `Inter` dan `JetBrains Mono`.
  4. **Instalasi Dependensi Inti:**
     - Runtime: `axios`, `@tanstack/react-query`, `zustand`, `react-router-dom`, `lucide-react`, `react-hook-form`, `zod`, `@hookform/resolvers`, `date-fns`, `clsx`, `tailwind-merge`.
     - Development: `vitest`, `@testing-library/react`, `@testing-library/jest-dom`, `jsdom`.
  5. **Inisialisasi Direktori Handoff & Routing Skeleton:**
     - Membuat folder `frontend/stitch-handoff/fase-{1..6}/` untuk menerima file HTML dari tim UI/UX.
     - Membangun routing skeleton di `src/routes/index.tsx` sesuai diagram sitemap Fase 1.2.
* **Output Fase 1:** Proyek frontend Vite+TS aktif di port 5173, proxy API tersambung ke port 5000, token Tailwind terpasang, folder handoff siap menerima ekspor Stitch.

---

### 🎨 Fase 2: Konversi HTML UI Kit Primitives (Atoms & Molecules) ke Reusable React Components

* **Korelasi Desain:** Selaras dengan **Fase 2.1 (UI Kit Primitives / Atoms)** dan **Fase 2.2 (Molecular Components)** di `DESIGN_INSTRUCTIONS_MVP1_UIUX.md`.
* **Input Tim Frontend:** Berkas HTML ekspor Stitch di `frontend/stitch-handoff/fase-2-uikit/` (`atoms-showcase.html` dan `molecules-showcase.html`).
* **Tugas & Rincian Teknis:**
  1. **Konversi Komponen Atomik (`src/components/ui/`):**
     - `button.tsx`: Menerjemahkan varian tombol dari HTML Stitch (Primary Blue, Portal Gradient `#3B82F6→#4F46E5`, Outline, Destructive Red `#DC2626`, Ghost, Icon) dengan varian status (*Hover, Active, Focus Ring 2px, Loading Spinner*).
     - `input.tsx`: Mengonversi input teks dengan label, border `#CBD5E1`, dan kontainer icon prefix.
     - `password-input.tsx`: Mengonversi input kata sandi dengan tombol toggle mata (`Eye`/`EyeOff` dari Lucide React).
     - `select.tsx`: Mengonversi dropdown kustom dengan chevron down dan opsi menu yang rapi.
     - `checkbox.tsx`: Mengonversi checkbox rounded dengan centang putih saat aktif.
     - `badge.tsx`: Mengonversi badge status pill (`ACTIVE` green, `INACTIVE` gray, `SUSPENDED` purple) dan badge keamanan portal (`Portal Resmi SPADA`, `SSL Terenkripsi`).
  2. **Konversi Komponen Molekular (`src/components/`):**
     - `card.tsx`: Kontainer kartu putih dengan border `#E2E8F0`, padding fleksibel, dan varian floating card shadow.
     - `stat-card.tsx`: Kartu metrik dengan badge ikon circular, nilai angka bold besar (28px), dan label ringkas.
     - `search-filter-bar.tsx`: Bar pencarian gabungan input teks + dropdown filter role & status + tombol reset.
     - `pagination-bar.tsx`: Navigasi pagination dengan pemilih baris per halaman (10, 25, 50) dan tombol navigasi halaman.
     - `toast.tsx`: Notifikasi pop-up mengapung (Success, Error, Warning, Info) dengan animasi slide/fade.
  3. **Verifikasi Komponen:**
     - Memastikan seluruh inline SVG dari HTML Stitch digantikan oleh Lucide React.
     - Memastikan utilitas `cn()` (`clsx` + `tailwind-merge`) digunakan untuk penggabungan kelas styling dinamis.
* **Output Fase 2:** Pustaka komponen reusable (`src/components/ui/`) siap pakai yang 100% konsisten dengan desain Google Stitch Fase 2.

---

### 🔐 Fase 3: Konversi HTML Halaman Autentikasi (Dark Navy), App Shell & Profil Mandiri

* **Korelasi Desain:** Selaras dengan **Fase 3.1 (Portal Login `/login`)**, **Fase 3.2 (Password Recovery `/forgot-password`)**, **Fase 3.3 (App Shell Global)**, dan **Fase 3.4 (User Profile `/profile`)** di `DESIGN_INSTRUCTIONS_MVP1_UIUX.md`.
* **Input Tim Frontend:** Berkas HTML ekspor Stitch di `frontend/stitch-handoff/fase-3-auth-shell-profile/` (`login.html`, `forgot-password.html`, `app-shell.html`, `profile.html`).
* **Tugas & Rincian Teknis:**
  1. **Konversi Modul Portal Login (`/login`):**
     - `AuthLayout.tsx`: Mengadopsi latar belakang gradient Dark Navy `#0D1B2A` ke `#1B2A4A`.
     - `PortalNavbar.tsx`: Konversi logo UPGRIS, kolom pencarian materi, link navigasi, dan tombol pill "MASUK SSO".
     - `StatistikCardModule.tsx` & `SystemBadgesContainer.tsx`: Konversi 3 blok statistik (16 Pertemuan, 0–100 Skor, 24/7 Akses) dan 4 badge pilar SPADA.
     - `LoginFormCard.tsx`: Konversi kartu putih solid mengapung (radius 16px, soft shadow), form login multi-kredensial, checkbox ingat saya, dan tombol gradient "Masuk Sekarang".
     - `FabHelpCenter.tsx`: Tombol bantuan melayang di pojok kanan bawah.
     - Integrasi API: Menghubungkan form login ke `POST /api/auth/login` via React Hook Form + Zod, menyimpan token ke Zustand store & localStorage, menangani penolakan akun non-aktif/suspended.
  2. **Konversi Halaman Lupa Password (`/forgot-password`):**
     - Konversi centered card putih di atas Dark Navy, field email, tombol kirim tautan pemulihan, dan link kembali ke login.
     - Integrasi API: Menghubungkan ke `POST /api/auth/forgot-password`.
  3. **Konversi Kerangka Navigasi Aplikasi (`AppLayout`):**
     - `Topbar.tsx`: Header putih sticky (tinggi 64px), logo SPADA, badge pill semester aktif (*"🟢 Semester Ganjil 2026/2027"*), lonceng notifikasi, dan user menu dropdown (Profil, Ganti Password, Keluar).
     - `Sidebar.tsx`: Lebar 260px, navigasi adaptif sesuai 3 peran resmi (Mahasiswa, Dosen, Admin), highlight rute aktif.
     - `ProtectedRoute.tsx` & `RoleGuard.tsx`: Proteksi rute berdasarkan token dan wewenang peran.
  4. **Konversi Modul Profil Pengguna Mandiri (`/profile`):**
     - Header kartu profil: Avatar circular (80px), nama lengkap, identitas resmi, badge peran & status.
     - Tab 1 Biodata Diri: Form biodata diri terhubung ke `GET /api/profile` dan mutasi `PUT /api/profile`.
     - `AvatarUploader.tsx`: Komponen unggah foto dengan preview langsung, validasi tipe gambar .jpg/.png maks 2MB, terhubung ke `POST /api/profile/avatar`.
     - Tab 2 Keamanan: Form ganti password dengan meter indikator kekuatan kata sandi, terhubung ke `PUT /api/profile/password`.
* **Output Fase 3:** Halaman login, lupa password, kerangka navigasi aplikasi, dan modul profil mandiri berfungsi penuh dan terintegrasi dengan backend.

---

### 📊 Fase 4: Konversi HTML Dasbor Kontekstual 3 Peran & Adaptasi Mobile Responsive

* **Korelasi Desain:** Selaras dengan **Fase 4.1 (Dasbor Mahasiswa)**, **Fase 4.2 (Dasbor Dosen)**, **Fase 4.3 (Dasbor Admin)**, dan **Fase 4.4 (Mobile Responsive 375px)** di `DESIGN_INSTRUCTIONS_MVP1_UIUX.md`.
* **Input Tim Frontend:** Berkas HTML ekspor Stitch di `frontend/stitch-handoff/fase-4-dashboards/` (`dashboard-mahasiswa.html`, `dashboard-dosen.html`, `dashboard-admin.html`, `dashboard-mobile.html`).
* **Tugas & Rincian Teknis:**
  1. **Konversi Dasbor Mahasiswa (`MahasiswaDashboard.tsx`):**
     - Banner sambutan dengan NIM dan tanggal akademik saat ini.
     - 3 Kartu ringkasan akademik (Prodi, Angkatan/Semester, Status Keaktifan).
     - Grid kartu kelas perkuliahan terdaftar (nama mata kuliah, kode kelas, beban SKS, nama dosen pengampu, badge "16 Pertemuan Terstruktur", tombol "Buka Ruang Kelas →").
     - Integrasi TanStack Query memanggil `GET /api/dashboard`.
  2. **Konversi Dasbor Dosen (`DosenDashboard.tsx`):**
     - Header sambutan dengan NIDN dan gelar akademik.
     - 3 Kartu metrik pengajaran (Total Kelas Diampu, Beban SKS Semester Ini, Total Mahasiswa Terdaftar).
     - Tabel / list kelas yang diampu dengan indikator kapasitas kuota terisi.
  3. **Konversi Dasbor Admin (`AdminDashboard.tsx`):**
     - 4 Kartu metrik sistem: Total Pengguna (Mahasiswa/Dosen), Total Mata Kuliah, Kelas Perkuliahan Semester Ini, Total Enrollment Aktif.
     - Quick Operational Shortcuts: 4 kartu aksi cepat (Tambah Pengguna, Buka Kelas, Kelola Direct Enrollment, Lihat Jejak Audit).
     - Snapshot 5 log audit terakhir.
  4. **Halaman Kelas Pengguna (`/classes`):**
     - Grid kartu kelas interaktif untuk Mahasiswa (kelas yang dienroll) dan Dosen (kelas yang diampu).
  5. **Refinement Responsivitas Mobile (375px):**
     - Konversi drawer navigasi samping untuk tampilan mobile dengan overlay backdrop.
     - Mengubah grid multi-kolom menjadi tumpukan satu kolom dengan spasi 8pt.
     - Menjamin target sentuhan tombol minimal 44px x 44px.
* **Output Fase 4:** Tiga dasbor kontekstual berfungsi dinamis dengan data API backend, responsif di resolusi desktop (1440px) hingga mobile (375px).

---

### 👥 Fase 5: Konversi HTML Modul Admin (Master Data, Direct Enrollment BR-002 & Audit Trail)

* **Korelasi Desain:** Selaras dengan **Fase 5.1 (User Management)**, **Fase 5.2 (Master Courses & Class Opening)**, **Fase 5.3 (Direct Enrollment Management BR-002)**, dan **Fase 5.4 (Audit Trail & JSON Diff)** di `DESIGN_INSTRUCTIONS_MVP1_UIUX.md`.
* **Input Tim Frontend:** Berkas HTML ekspor Stitch di `frontend/stitch-handoff/fase-5-admin-modules/` (`users.html`, `courses-classes.html`, `direct-enrollment.html`, `audit-logs.html`).
* **Tugas & Rincian Teknis:**
  1. **Konversi Manajemen Pengguna (`/admin/users`):**
     - Data table pengguna dengan server-side pagination, sorting, search multi-kolom debounced, filter peran (Mahasiswa, Dosen, Admin), dan filter status (`ACTIVE`, `INACTIVE`, `SUSPENDED`).
     - Modal Dialog Tambah Pengguna Baru: Form dinamis berbasis peran (NIM/Prodi/Angkatan untuk Mahasiswa; NIDN/Gelar untuk Dosen; Username/NIP untuk Admin).
     - Modal Dialog Ganti Status Akun & Modal Reset Password oleh Admin.
     - Integrasi mutasi TanStack Query dengan invalidasi query cache otomatis.
  2. **Konversi Master Mata Kuliah & Pembukaan Kelas:**
     - `/admin/courses`: Data table master mata kuliah, modal CRUD mata kuliah (Kode MK, Nama, Stepper SKS 1–6, Deskripsi Capaian).
     - `/admin/classes`: Data table penawaran kelas, modal pembukaan kelas baru (pilih Mata Kuliah, pilih Dosen Pengampu, Kode Kelas, Semester Ganjil/Genap, Kuota Kapasitas).
  3. **Konversi Modul Direct Enrollment Mahasiswa (`/admin/enrollments` — BR-002):**
     - Selector kelas aktif dengan visual progress bar kapasitas terisi vs total daya tampung (*Capacity Progress Widget*).
     - **Layout Dua Panel (*Two-Column Split View*):**
       - **Panel Kiri (*Enrolled Students*):** Tabel mahasiswa terdaftar di kelas + pencarian + tombol aksi "Unenroll" (Crimson Red outline `#DC2626`) disertai modal konfirmasi pencabutan.
       - **Panel Kanan (*Available Students*):** Tabel mahasiswa belum terdaftar + pencarian & filter prodi + *checkbox multi-select* + tombol aksi bawah sticky *"Daftarkan Mahasiswa Terpilih (Batch Enroll)"*.
       - Warning banner jika jumlah mahasiswa terpilih melebihi sisa kapasitas kelas.
  4. **Konversi Peninjau Jejak Audit (`/admin/audit-logs`):**
     - Tabel riwayat audit log dengan filter rentang tanggal, jenis aksi (LOGIN, CREATE, UPDATE, DELETE, ENROLL, UNENROLL), dan entitas target.
     - **JSON Diff Inspector Modal Dialog:** Tampilan perbandingan *side-by-side* antara "Old Values (Nilai Lama)" berlatar merah lembut (`#FEE2E2`) dan "New Values (Nilai Baru)" berlatar hijau lembut (`#DCFCE7`) dengan format kode monospace.
* **Output Fase 5:** Seluruh modul operasional Administrator SPADA berjalan penuh, mendukung batch direct enrollment BR-002 dan transparansi audit log.

---

### ✨ Fase 6: Konversi HTML Status Batas, Error Boundary, Pengujian Kualitas & Build Verification

* **Korelasi Desain:** Selaras dengan **Fase 6.1 (Skeleton Shimmer & Empty States)**, **Fase 6.2 (Error Screens Suite)**, **Fase 6.3 (WCAG 2.1 AA Audit)**, dan **Fase 6.4 (Code & Asset Export Handoff)** di `DESIGN_INSTRUCTIONS_MVP1_UIUX.md`.
* **Input Tim Frontend:** Berkas HTML ekspor Stitch di `frontend/stitch-handoff/fase-6-states-errors/` (`skeleton-empty-states.html`, `error-screens.html`).
* **Tugas & Rincian Teknis:**
  1. **Konversi Status Batas (Loading & Empty States):**
     - `DashboardSkeleton.tsx` & `TableSkeleton.tsx`: Komponen shimmer loading menggunakan `tailwindcss-animate` yang aktif selama TanStack Query berstatus `isLoading`.
     - `EmptyState.tsx`: Komponen kartu kosong dengan ilustrasi SVG ramah pengguna (Belum ada kelas terdaftar, Hasil pencarian nihil, Seluruh mahasiswa telah terdaftar) disertai tombol call-to-action (CTA).
  2. **Konversi Rangkaian Halaman Error Kustom:**
     - `ErrorBoundary.tsx`: Menangkap runtime unhandled error pada komponen React dan menampilkan UI cadangan tanpa menyebabkan layar putih (*white screen*).
     - Halaman Error Kustom:
       - `401 Unauthorized`: Notifikasi sesi kedaluwarsa dengan tombol "Masuk Kembali".
       - `403 Forbidden`: Penolakan akses wewenang tidak mencukupi dengan tombol "Kembali ke Dasbor".
       - `404 Not Found`: Halaman tidak ditemukan dengan tombol navigasi beranda.
       - `500 Server Error`: Kendala teknis server dengan tombol coba muat ulang.
  3. **Audit Kepatuhan Aksesibilitas (WCAG 2.1 AA):**
     - Verifikasi rasio kontras teks minimal 4.5:1 pada Dark Navy portal maupun Light Clean Surface operasional.
     - Memastikan seluruh indikator status visual menyertakan teks dan ikon (bukan hanya warna).
     - Memastikan seluruh kontrol interaktif memiliki *focus-visible ring* biru 2px dengan offset 2px.
     - Memastikan tombol navigasi pada resolusi mobile berdimensi minimal 44px x 44px.
  4. **Automated Testing Frontend:**
     - Unit test utilitas (format tanggal, token storage) dan auth store menggunakan Vitest.
     - Integration/component test untuk LoginForm, EnrollmentManager, dan UserTable menggunakan React Testing Library.
  5. **Build Verification:**
     - Eksekusi pengecekan tipe: `npm run typecheck` (`tsc --noEmit`) tanpa error.
     - Eksekusi kompilasi produksi: `npm run build` sukses menghasilkan bundle teroptimasi di `frontend/dist/`.
* **Output Fase 6:** Aplikasi frontend teruji secara komprehensif, aman terhadap kesalahan runtime, ramah aksesibilitas, dan siap untuk integrasi sistem menyeluruh.

---

## 8. Standar Penanganan Respon API & Kesalahan (Error Handling & User Feedback)

```typescript
// src/types/api.types.ts
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiError {
  success: false;
  message: string;
  errors?: Array<{ field: string; message: string }>;
}
```

### Standar User Feedback saat Terjadi Error:
1. **Error Validasi Form (HTTP 400 Bad Request):**
   - Pesan kesalahan dari array `errors` backend dipetakan secara otomatis ke field input terkait melalui `setError()` pada React Hook Form. Field diberi outline merah dan teks bantuan merah muncul di bawah input.
2. **Error Sesi Kedaluwarsa (HTTP 401 Unauthorized):**
   - Interceptor mencoba *silent refresh*. Jika refresh token habis masa berlakunya, modal/toast sesi berakhir ditampilkan dan pengguna dialihkan ke `/login?expired=1`.
3. **Error Hak Akses (HTTP 403 Forbidden):**
   - Toast merah: *"Akses Ditolak: Anda tidak memiliki wewenang untuk menjalankan aksi ini."*
4. **Error Konflik Data (HTTP 409 Conflict):**
   - Toast peringatan oranye: *"Data Duplikat: Identitas, kode mata kuliah, atau NIM/NIDN sudah terdaftar di sistem."*
5. **Error Server (HTTP 500 Internal Server Error):**
   - Toast merah: *"Terjadi kendala teknis pada server SPADA. Silakan coba beberapa saat lagi."*

---

## 9. Kriteria Penerimaan & Definisi Selesai (Definition of Done - DoD)

Fitur Frontend MVP 1 dinyatakan selesai (*Done*) dan siap rilis apabila memenuhi seluruh kriteria berikut:
- [ ] **Kepatuhan Fungsional 3 Peran:** Seluruh aktor resmi (`Mahasiswa`, `Dosen`, `Admin`) dapat login, mengakses dasbor kontekstual yang sesuai, dan menjalankan fitur operasional sesuai wewenangnya.
- [ ] **Konversi HTML Stitch 100%:** Seluruh layar dan komponen yang diekspor tim UI/UX dari Google Stitch (Fase 1 s.d. 6) telah dikonversi secara bersih ke komponen React TypeScript tanpa meninggalkan elemen HTML monolitik mentah.
- [ ] **Integrasi API Riil 100%:** Seluruh interaksi data terhubung dengan endpoint backend MVP 1 yang berjalan di port 5000 melalui proxy Vite tanpa data tiruan (*mock*) statis.
- [ ] **Kesesuaian Desain & Tema Ganda:** Tampilan visual presisi sesuai [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md) (Portal Login bertema Dark-Mode Navy dan Operasional bertema Light Clean Surface).
- [ ] **Direct Enrollment Berjalan Sempurna (BR-002):** Admin dapat mendaftarkan mahasiswa ke kelas perkuliahan (individual maupun batch enroll) dengan verifikasi kuota kelas yang akurat dan visual progress bar.
- [ ] **Bebas Error Konsol:** Tidak ada *unhandled runtime exception* atau error merah pada inspect console browser selama alur pengujian normal maupun *edge cases*.
- [ ] **Type-Safe & Lolos Kompilasi:** Lolos validasi kompilasi TypeScript (`tsc --noEmit`) tanpa penggunaan tipe `any` yang tidak beralasan.
- [ ] **Responsif Multi-Device:** Antarmuka tertata rapi dan berfungsi optimal di resolusi Smartphone (375px+), Tablet (768px), dan Desktop (1440px).
- [ ] **Lolos Audit Aksesibilitas WCAG 2.1 AA:** Memenuhi rasio kontras warna minimal 4.5:1, indikator non-warna yang jelas, dan area sentuh minimal 44px x 44px pada layar seluler.
- [ ] **Build Produksi Sukses:** Perintah `npm run build` berhasil dijalankan dan berkas output produksi terkompilasi sempurna di direktori `frontend/dist/`.
