# Implementation Plan: Frontend MVP 1
# SPADA (Learning Management System) Universitas PGRI Semarang (UPGRIS)
**Team Membangun Negeri — Rencana Eksekusi Teknis Frontend: Fondasi, Akun, Master Data & Direct Enrollment**

---

## 📌 Ringkasan Eksekutif
- **Target Rilis:** Frontend Web Client MVP 1 SPADA LMS UPGRIS
- **Acuan Utama:** [PRD.md](PRD.md) (*Bab 2, 3, 5, 7*), [SRS.md](SRS.md) (*Bab 3, 4, 10, 13, 21, 27, 28, 29, 30*), [DESIGN_INSTRUCTIONS_MVP1_UIUX.md](DESIGN_INSTRUCTIONS_MVP1_UIUX.md), [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md) (Spesifikasi Portal Login & Landing — Dark-Mode Navy, serta Token Operasional Permukaan Terang), dan [IMPLEMENTATION_PLAN_MVP1_BACKEND.md](IMPLEMENTATION_PLAN_MVP1_BACKEND.md).
- **Fokus Utama:** Membangun antarmuka Single Page Application (SPA) modern, cepat, responsif, aman (*type-safe*), dan terintegrasi penuh dengan seluruh endpoint REST API backend MVP 1 untuk 3 peran resmi: **Mahasiswa**, **Dosen**, dan **Admin**.

---

## 1. Tujuan & Ruang Lingkup Frontend MVP 1

### 1.1 Tujuan
Membangun aplikasi web Single Page Application (SPA) yang cepat, intuitif, berintegritas tinggi, bebas friksi administratif, dan responsif untuk melayani sivitas akademika Universitas PGRI Semarang dalam mengakses sistem pembelajaran daring terpadu, mengelola master data akademik SPADA, direct enrollment kepesertaan kelas, manajemen profil mandiri, serta peninjau jejak audit.

### 1.2 Ruang Lingkup Fitur MVP 1 (Sisi Frontend)
1. **Autentikasi & Sesi Pengguna:**
   - Halaman login multi-kredensial bertema Dark-Mode Professional Navy (`/login` — NIM/NIDN/NIP/Username/Email + Password).
   - Penolakan akses untuk akun berstatus `INACTIVE` atau `SUSPENDED` disertai pesan informatif.
   - Fitur *remember me*, lupa password (`/forgot-password`), dan logout aman.
   - Mekanisme *silent refresh token* otomatis via Axios interceptor tanpa mengganggu interaksi pengguna.
2. **App Shell & Navigasi Terstruktur SPADA:**
   - Topbar informatif: Logo SPADA UPGRIS, indikator semester aktif, profil pengguna, dan menu logout.
   - Sidebar navigasi modular dan adaptif sesuai hak akses 3 peran resmi (Mahasiswa, Dosen, Admin).
3. **Dasbor Kontekstual 3 Peran Resmi:**
   - **Mahasiswa:** Header profil mahasiswa (NIM, semester aktif), kartu kelas perkuliahan yang dienroll oleh Admin (nama mata kuliah, kode kelas, SKS, nama dosen pengampu, tombol akses kelas), ringkasan aktivitas belajar.
   - **Dosen:** Header profil dosen bergelar (NIDN), kartu kelas yang diampu pada semester aktif, ringkasan jumlah mahasiswa terdaftar di tiap kelas.
   - **Admin:** Header admin, 4 kartu statistik metrik utama sistem (Total Mahasiswa, Total Dosen, Total Mata Kuliah, Total Kelas & Enrollment Aktif), pintasan cepat kelola akun, mata kuliah, kelas, dan enrollment.
4. **Modul Pengelolaan Profil Pengguna Mandiri (`/profile`):**
   - Tab Biodata Diri (identitas akun, kontak, bio).
   - Upload Foto Profil / Avatar (preview, validasi format gambar .jpg/.jpeg/.png, batas maksimal 2MB).
   - Tab Ganti Password mandiri (verifikasi kata sandi lama, indikator kekuatan kata sandi).
5. **Modul Master Data Akademik SPADA (Khusus Admin):**
   - **Manajemen Pengguna (`/admin/users`):** Data table dengan server-side pagination, search multi-kolom, filter 3 role, filter status (`ACTIVE`, `INACTIVE`, `SUSPENDED`), modal tambah/edit pengguna, modal ganti status akun, modal reset password akun.
   - **Master Mata Kuliah (`/admin/courses`):** Data table, modal CRUD mata kuliah (Kode MK, Nama Mata Kuliah, Beban SKS 1–6, Deskripsi Kompetensi).
   - **Pembukaan Kelas Perkuliahan (`/admin/classes`):** Data table penawaran kelas semester aktif, modal buka kelas (pilih Mata Kuliah, pilih Dosen Pengampu, Kode/Nama Kelas misal "TI-A", Tahun Akademik, Semester Ganjil/Genap, Kapasitas Kuota).
6. **Modul Direct Enrollment Mahasiswa (Khusus Admin — Aturan Bisnis BR-002):**
   - Halaman Manajemen Enrollment Kelas (`/admin/enrollments`):
     - Selector kelas perkuliahan aktif.
     - Panel Mahasiswa Terdaftar (*Enrolled Students*) dengan tombol unenroll.
     - Panel Mahasiswa Tersedia (*Available Students*) dengan fitur pencarian cepat dan *multi-select batch enrollment* langsung ke kelas.
     - Indikator kapasitas kuota kelas terisi vs total daya tampung.
7. **Modul Jejak Audit (`/admin/audit-logs` - Khusus Admin):**
   - Tabel riwayat audit log (filter tanggal, aksi, entitas, user).
   - Modal inspeksi perbedaan data JSON (*Old Values* vs *New Values* Diff Inspector).
8. **Error Handling, States & Responsive UI:**
   - Skeleton loading shimmer effect, empty states ramah pengguna, error boundary, halaman kustom 401, 403, 404, 500.

---

## 2. Pemilihan Tech Stack & Rationale

| Layer / Kebutuhan | Pilihan Teknologi | Versi | Alasan Pemilihan & Keunggulan |
|---|---|---|---|
| **Build Tool & Framework** | [Vite](https://vitejs.dev/) + [React](https://react.dev/) | React 18+ LTS / Vite 5+ | Kecepatan kompilasi instan, Hot Module Replacement (HMR) sub-detik, ringan, dan standar industri SPA modern. |
| **Bahasa Pemrograman** | [TypeScript](https://www.typescriptlang.org/) | `v5.0+` | Menjamin *type-safety*, mencegah *runtime error*, dan menyediakan *auto-complete* akurat yang selaras dengan DTO backend. |
| **CSS Framework** | [Tailwind CSS](https://tailwindcss.com/) | `v3.4+` | Efisiensi styling tinggi, kemudahan integrasi dengan *design tokens* (warna, spasi 8pt), serta hasil build CSS sangat ramping. |
| **Animasi & Transisi** | [tailwindcss-animate](https://github.com/emad/tailwindcss-animate) | Latest | Utilitas animasi (fade/slide/shimmer) selaras Tailwind; dipakai untuk *soft elevation*, skeleton loading, dan toast. |
| **UI Primitives / Kit** | [Radix UI](https://www.radix-ui.com/) / [shadcn/ui](https://ui.shadcn.com/) | Latest | Komponen *headless* berbasis standar aksesibilitas WAI-ARIA, fleksibel, mudah dikustomisasi, tanpa *lock-in*. |
| **Ikonografi** | [Lucide React](https://lucide.dev/) | Latest | Koleksi ikon SVG modern, konsisten, berukuran ringan, dan mendukung *tree-shaking*. |
| **Routing & Navigation** | [React Router DOM](https://reactrouter.com/) | `v6.22+` | Dukungan *nested routes*, *layout outlets*, dan proteksi rute berbasis otorisasi peran (*ProtectedRoute*, *RoleGuard*). |
| **Server State & Caching** | [TanStack Query](https://tanstack.com/query/latest) (React Query) | `v5+` | Pengelolaan data asinkron server otomatis: caching pintar, background re-fetching, pagination, mutasi data, dan status loading/error. |
| **Client / Global State** | [Zustand](https://zustand-demo.pmnd.rs/) | `v4.5+` | State manager minimalis (kurang dari 2KB), tanpa *boilerplate*, ideal untuk menyimpan sesi auth, token, dan profil aktif. |
| **Form & Validasi** | [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/) | RHF v7 + Zod v3 | Penanganan form efisien tanpa *re-render* berlebih, validasi skema deklaratif yang selaras dengan validasi backend Zod. |
| **HTTP Client** | [Axios](https://axios-http.com/) | `v1.7+` | Pengaturan *interceptors* terpusat untuk injeksi Bearer Token, penanganan otomatis refresh token saat 401, dan normalisasi error. |
| **Format Waktu & Tanggal** | [date-fns](https://date-fns.org/) | `v3+` | Library manipulasi tanggal modular dan ramah *tree-shaking* dengan dukungan lokal Bahasa Indonesia (`id`). |
| **Testing Suite** | [Vitest](https://vitest.dev/) + [React Testing Library](https://testing-library.com/) | Latest | Eksekusi unit/komponen test super cepat terintegrasi langsung dengan ekosistem Vite. |

---

## 3. Struktur Direktori Proyek Frontend

Struktur direktori dirancang dengan pendekatan **Feature-Based (Modular)**:

```text
frontend/
├── index.html                       # HTML Template utama
├── package.json                     # Konfigurasi dependensi dan script npm
├── tsconfig.json                    # Konfigurasi TypeScript compiler
├── vite.config.ts                   # Konfigurasi bundler Vite & path aliases (@/*)
├── tailwind.config.js               # Konfigurasi tema warna & design tokens
├── postcss.config.js
│
├── public/                          # Aset statis publik (Logo UPGRIS, Favicon)
│   ├── favicon.ico
│   └── logo-spada.svg
│
└── src/                             # Kode sumber utama
    ├── main.tsx                     # Entry point aplikasi & inisialisasi QueryClient
    ├── App.tsx                      # Root App component dengan Router Provider
    │
    ├── assets/                      # Ilustrasi SVG (Empty states, 404, 403, 500)
    │
    ├── components/                  # Komponen Reusable Global
    │   ├── ui/                      # Atoms & Molecules (Button, Input, Badge, Modal, dll.)
    │   │   ├── button.tsx
    │   │   ├── input.tsx
    │   │   ├── select.tsx
    │   │   ├── modal.tsx
    │   │   ├── badge.tsx
    │   │   ├── card.tsx
    │   │   ├── table.tsx
    │   │   ├── skeleton.tsx
    │   │   └── toast.tsx
    │   ├── feedback/                # EmptyState, ErrorBoundary, LoadingSpinner
    │   └── common/                  # Pagination, SearchFilterBar, ConfirmDialog
    │
    ├── layouts/                     # Layout Wrapper
    │   ├── AuthLayout.tsx           # Layout Login & Lupa Password (Dark-Mode Navy, gradient #0D1B2A→#1B2A4A)
    │   ├── AppLayout.tsx            # Shell utama SPADA (Topbar, Sidebar, Breadcrumb, Outlet)
    │   ├── Topbar.tsx               # Header global + User Menu + Badge Semester
    │   └── Sidebar.tsx              # Sidebar modular sesuai hak akses 3 peran resmi
    │
    ├── features/                    # Modul Fitur Bisnis (Feature-driven)
    │   ├── auth/                    # Modul Autentikasi
    │   │   ├── components/          # LoginForm, ForgotPasswordForm, PortalNavbar, LoginFormCard, StatistikCardModule, SystemBadgesContainer, FabHelpCenter
    │   │   ├── hooks/               # useAuth, useLogin, useLogout
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
    │       ├── enrollments/         # Modul Direct Enrollment Mahasiswa
    │       │   ├── components/      # EnrollmentManager, EnrolledList, AvailableStudentList
    │       │   └── services/        # enrollmentsAdminService.ts
    │       └── audit-log/           # Modul Jejak Audit
    │           ├── components/      # AuditLogTable, AuditDetailModal
    │           └── services/        # auditLogService.ts
    │
    ├── hooks/                       # Custom Global Hooks (useToast, useDebounce, dll.)
    ├── routes/                      # Konfigurasi Routing
    │   ├── index.tsx                # Definisi Rute Lengkap
    │   ├── ProtectedRoute.tsx       # Guard autentikasi token & status user
    │   └── RoleGuard.tsx            # Guard otorisasi peran (mahasiswa, dosen, admin)
    │
    ├── services/                    # Setup HTTP Client Terpusat
    │   └── api.ts                   # Axios instance dengan Request/Response Interceptors
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

## 4. Arsitektur Autentikasi, Sesi & RBAC Guard

### 4.1 Mekanisme Penyimpanan Token & Interceptor Otomatis
1. **Access Token (Masa Aktif 15 Menit):** Disimpan di memori runtime (`Zustand Store`) untuk proteksi maksimal dari XSS.
2. **Refresh Token (Masa Aktif 7 Hari):** Disimpan aman di `localStorage` / cookie terenkripsi.
3. **Axios Silent Refresh Mutex:**
   - Jika request mengembalikan HTTP `401 Unauthorized`, interceptor respons menahan request ke dalam antrean.
   - Mengirim request refresh ke `POST /api/auth/refresh`.
   - Jika refresh sukses: Token baru diinjeksikan ke header Authorization dan request yang tertahan diulang otomatis (*replay request*).
   - Jika refresh gagal: Sesi dibersihkan dan dialihkan ke `/login?expired=1`.

```typescript
// Alur Konseptual Axios Response Interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const newAccessToken = await refreshAccessToken();
        originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        useAuthStore.getState().logout();
        window.location.href = '/login?expired=1';
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);
```

### 4.2 Guard Routing Berbasis Peran (`ProtectedRoute` & `RoleGuard`)
- `ProtectedRoute`: Memeriksa apakah token valid dan akun berstatus `ACTIVE`. Jika tidak login, alihkan ke `/login`.
- `RoleGuard`: Memeriksa apakah `role` pengguna (`mahasiswa`, `dosen`, atau `admin`) diizinkan mengakses rute. Jika tidak, arahkan ke `403 Forbidden`.

```tsx
// Definisi Rute Terproteksi SPADA LMS MVP 1
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

## 5. Pemetaan Rute Frontend ke Endpoint Backend MVP 1

| Halaman Frontend | Rute Frontend | Metode | Endpoint Backend | Fungsi & Data yang Digunakan |
|---|---|---|---|---|
| **Login** | `/login` | `POST` | `/api/auth/login` | Mengirim username/email + password, menerima token dan profil. Tema Dark-Mode Navy, Login Form Card putih, Statistik Card, Badge Fitur SPADA, FAB Help Center. |
| **Lupa Password** | `/forgot-password` | `POST` | `/api/auth/forgot-password` | Mengirim email untuk permintaan pemulihan kata sandi. Tema Dark-Mode Navy, centered card putih. |
| **Profil & Biodata** | `/profile` | `GET` | `/api/profile` | Mengambil data akun, profil biodata, identitas mahasiswa/dosen |
| **Perbarui Profil** | `/profile` | `PUT` | `/api/profile` | Memperbarui nama lengkap, nomor telepon, dan bio profil |
| **Upload Avatar** | `/profile` | `POST` | `/api/profile/avatar` | Mengunggah foto profil baru (validasi format .jpg/.png, maks 2MB) |
| **Ganti Password** | `/profile` (Tab 2) | `PUT` | `/api/profile/password` | Memvalidasi kata sandi lama dan menyimpan kata sandi baru |
| **Logout** | Topbar / Modal | `POST` | `/api/auth/logout` | Mencabut refresh token dan mengakhiri sesi |
| **Dasbor SPADA** | `/dashboard` | `GET` | `/api/dashboard` | Mengambil data metrik kontekstual peran aktif (Mahasiswa, Dosen, Admin) |
| **Kelas Saya** | `/classes` | `GET` | `/api/classes` | Mengambil daftar kelas yang dienroll (Mahasiswa) atau diampu (Dosen) |
| **Detail Kelas** | `/classes/:id` | `GET` | `/api/classes/:id` | Mengambil info dasar kelas dan dosen pengampu |
| **Kelola Pengguna** | `/admin/users` | `GET`, `POST` | `/api/admin/users` | Menampilkan tabel user (pagination, search, filter) & tambah akun baru |
| **Detail Pengguna** | `/admin/users/:id` | `GET`, `PUT` | `/api/admin/users/:id` | Mengambil detail akun & memperbarui informasi akun |
| **Status Pengguna** | `/admin/users/:id` | `PATCH` | `/api/admin/users/:id/status` | Mengubah status akun (`ACTIVE`, `INACTIVE`, `SUSPENDED`) |
| **Reset Password User**| `/admin/users/:id`| `PUT` | `/api/admin/users/:id/reset-password` | Admin mereset kata sandi akun pengguna |
| **Master Mata Kuliah**| `/admin/courses` | `GET`, `POST` | `/api/admin/courses` | Menampilkan tabel & menambah master mata kuliah (SKS 1–6) |
| **Aksi Mata Kuliah** | `/admin/courses` | `PUT`, `DELETE`| `/api/admin/courses/:id` | Mengedit atau menghapus master mata kuliah |
| **Master Kelas** | `/admin/classes` | `GET`, `POST` | `/api/admin/classes` | Menampilkan daftar kelas semester aktif & membuka kelas baru |
| **Aksi Kelas** | `/admin/classes` | `PUT`, `DELETE`| `/api/admin/classes/:id` | Mengedit atau menghapus kelas perkuliahan |
| **List Mahasiswa Kelas**| `/admin/enrollments`| `GET` | `/api/admin/classes/:classId/enrollments` | Menampilkan daftar mahasiswa yang telah terdaftar di kelas |
| **Mahasiswa Tersedia** | `/admin/enrollments`| `GET` | `/api/admin/classes/:classId/available-students` | Menampilkan daftar mahasiswa belum terdaftar untuk batch enrollment |
| **Eksekusi Enrollment** | `/admin/enrollments`| `POST` | `/api/admin/enrollments` | Menambahkan mahasiswa ke kelas (individual maupun batch) |
| **Unenroll Mahasiswa** | `/admin/enrollments`| `DELETE`| `/api/admin/enrollments/:id` | Mencabut kepesertaan mahasiswa dari kelas perkuliahan |
| **Peninjau Audit** | `/admin/audit-logs` | `GET` | `/api/admin/audit-logs` | Menampilkan riwayat log audit (filter aksi, entitas, tanggal) |
| **Detail Audit JSON** | `/admin/audit-logs/:id`| `GET` | `/api/admin/audit-logs/:id` | Inspeksi detail perbandingan nilai lama vs nilai baru (*JSON Diff*) |

---

## 6. Tahapan Pengerjaan Frontend (6 Fase Bertahap)

```text
Fase 1: Setup Proyek, Tooling & Design System Primitives
  │
  ▼
Fase 2: Layanan API, Autentikasi (Dark Navy), Guard Rute & Shell Navigasi
  │
  ▼
Fase 3: Dasbor Kontekstual 3 Peran & Profil Pengguna Mandiri
  │
  ▼
Fase 4: Modul Master Data Akademik SPADA (Mata Kuliah & Kelas)
  │
  ▼
Fase 5: Modul Manajemen Pengguna, Direct Enrollment & Jejak Audit
  │
  ▼
Fase 6: Pengujian Kualitas, Error Boundary, Responsivitas & Handoff
```

---

### 🚀 Fase 1: Setup Proyek, Tooling & Design System Primitives
- [ ] Inisialisasi proyek menggunakan Vite + React + TypeScript di direktori `frontend/`.
- [ ] Konfigurasi `tailwind.config.js` dengan menyematkan seluruh *design tokens* dari [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md):
  - Token Portal Login & Landing: Dark-Mode Navy (bg `#0D1B2A→#1B2A4A`, accent `#3B82F6/#4F46E5`, secondary `#38BDF8`, status `#10B981`, card `#FFFFFF`, text primary `#1F2937`, text muted `#6B7280`).
  - Token Operasional SPADA: Permukaan terang (#F8FAFC, #FFFFFF), slate text (#0F172A), brand blue (#2563EB), semantic badges (Active, Inactive, Suspended), spacing 8pt, font Plus Jakarta Sans / Inter.
- [ ] Konfigurasi path aliases `@/*` pada `tsconfig.json` dan `vite.config.ts`.
- [ ] Instalasi dependensi: `axios`, `@tanstack/react-query`, `zustand`, `react-router-dom`, `lucide-react`, `react-hook-form`, `zod`, `@hookform/resolvers`, `date-fns`, `clsx`, `tailwind-merge`, `tailwindcss-animate`.
- [ ] Membangun komponen UI Primitives terstandar di `src/components/ui/`:
  - `Button` (Primary, Secondary, Destructive, Ghost, Icon, Loading; varian Primary Portal gradient).
  - `Input` & `PasswordInput` (toggle show/hide, prefix icons).
  - `Select` & `DropdownMenu`.
  - `Badge` (Status pill Active, Inactive, Suspended, Enrolled, Portal Resmi).
  - `Modal` (Dialog konfirmasi & Form dialog).
  - `Table` (Header sortable, hover rows).
  - `Skeleton` (Shimmer loading effect).
  - `Toast` (Pop-up alert Success, Error, Info).

---

### 🔐 Fase 2: Layanan API, Autentikasi, Guard Rute & Shell Navigasi
- [ ] Implementasi Axios Client singleton (`src/services/api.ts`) dengan baseURL, header Bearer token, dan response interceptor *silent refresh token queuing*.
- [ ] Pembuatan `useAuthStore` (Zustand) untuk menyimpan data `user`, `accessToken`, dan `role`.
- [ ] Pembuatan `ProtectedRoute` dan `RoleGuard` (`mahasiswa`, `dosen`, `admin`).
- [ ] Halaman Login (`/login`) bertema Dark-Mode Navy sesuai [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md):
  - `PortalNavbar` (Logo SPADA UPGRIS, Search Input, Nav Links, Pill Button "MASUK SSO").
  - Sisi kiri hero: `StatistikCardModule` (16 Pertemuan / 0–100 Skor / 24/7 Akses) & `SystemBadgesContainer` (Fitur Utama SPADA).
  - `LoginFormCard` (Solid White, Radius 16px, Soft Elevation Shadow): Judul SSO, badge Portal Resmi + SSL Terenkripsi, field identitas, field password, checkbox ingat saya, tombol "Masuk Sekarang".
  - Penanganan pesan kesalahan kredensial salah dan penolakan akun non-aktif/suspended.
- [ ] Halaman Lupa Password (`/forgot-password`) — Dark-Mode Navy, centered card putih, input email.
- [ ] Membangun kerangka navigasi aplikasi (`AppLayout`):
  - **Topbar:** Logo SPADA UPGRIS, badge semester aktif (*"🟢 Semester Ganjil 2026/2027"*), user profile menu, avatar, tombol logout.
  - **Sidebar:** Menu modular dinamis sesuai 3 peran resmi (Mahasiswa, Dosen, Admin).

---

### 📊 Fase 3: Dasbor Kontekstual 3 Peran & Profil Pengguna Mandiri
- [ ] Implementasi service layer `dashboardService.ts` untuk memanggil `GET /api/dashboard`.
- [ ] Pembuatan komponen dasbor kontekstual:
  - `MahasiswaDashboard`: Header sambutan, kartu profil mahasiswa, grid kartu kelas perkuliahan yang dienroll oleh Admin (nama MK, kode kelas, SKS, dosen pengampu, tombol buka kelas), ringkasan aktivitas belajar.
  - `DosenDashboard`: Header profil dosen bergelar (NIDN), 3 kartu statistik metrik (kelas diampu, beban SKS, total mahasiswa), daftar kelas yang diampu.
  - `AdminDashboard`: 4 kartu statistik metrik utama sistem (Total Mahasiswa, Total Dosen, Total Mata Kuliah, Total Kelas & Enrollment Aktif), pintasan cepat operasional.
- [ ] Halaman Kelas Pengguna (`/classes`): Grid kartu kelas untuk Mahasiswa (kelas enrolled) dan Dosen (kelas diampu).
- [ ] Halaman Profil Mandiri (`/profile`):
  - Tab 1: Biodata akun dan profil mandiri, form update profil (`PUT /api/profile`), dan komponen unggah avatar (`POST /api/profile/avatar`, validasi .jpg/.png maks 2MB).
  - Tab 2: Form Ganti Password mandiri (`PUT /api/profile/password`) dengan validasi password lama & meter kekuatan password.

---

### 🏫 Fase 4: Modul Master Data Akademik SPADA (Admin)
- [ ] Komponen Reusable `DataTableContainer` (pencarian instan, filter bar, pagination server-side, empty state).
- [ ] Halaman Master Mata Kuliah (`/admin/courses`):
  - Tabel master mata kuliah (Kode MK, Nama, Beban SKS 1–6, Deskripsi, Status).
  - Modal form CRUD Mata Kuliah dengan validasi Zod.
- [ ] Halaman Pembukaan Kelas Perkuliahan (`/admin/classes`):
  - Tabel penawaran kelas semester aktif (Kode Kelas, Mata Kuliah, Dosen Pengampu, Kapasitas, Jumlah Terdaftar).
  - Modal form pembukaan kelas: Pilih Mata Kuliah, Pilih Dosen Pengampu, Input Kode Kelas, Input Tahun Akademik & Semester, Input Kapasitas Kuota.

---

### 👥 Fase 5: Modul Manajemen Pengguna, Direct Enrollment & Jejak Audit (Admin)
- [ ] Halaman Manajemen Pengguna (`/admin/users`):
  - Tabel pengguna dengan pagination, search multi-kolom, filter role (`mahasiswa`, `dosen`, `admin`), filter status (`ACTIVE`, `INACTIVE`, `SUSPENDED`).
  - Modal Tambah Pengguna baru dengan input identitas spesifik peran (NIM/Prodi/Angkatan untuk Mahasiswa; NIDN/Gelar untuk Dosen).
  - Modal Ganti Status Akun dan Modal Reset Password oleh Admin.
- [ ] Halaman Modul Direct Enrollment Mahasiswa (`/admin/enrollments`):
  - Selector kelas perkuliahan aktif dengan visual progress bar kapasitas terisi vs total daya tampung.
  - Layout dua panel (*Split View*):
    - Panel Kiri (*Enrolled Students*): Tabel mahasiswa terdaftar di kelas dengan tombol pencabutan (*Unenroll*).
    - Panel Kanan (*Available Students*): Tabel mahasiswa tersedia dengan fitur pencarian dan *multi-select checkbox* untuk aksi **Batch Enroll**.
- [ ] Halaman Peninjau Jejak Audit (`/admin/audit-logs`):
  - Tabel riwayat audit log (filter tanggal, tipe aksi, entitas).
  - Modal Inspeksi JSON Diff (*Old Values* vs *New Values*) untuk melihat perubahan data secara transparan.

---

### ✨ Fase 6: Pengujian Kualitas, Error Boundary, Responsivitas & Handoff
- [ ] Penanganan Status Batas & Error:
  - React `ErrorBoundary` global untuk mencegah crash aplikasi.
  - Halaman kustom ramah pengguna: `401 Unauthorized`, `403 Forbidden`, `404 Not Found`, dan `500 Server Error`.
  - Komponen Skeleton Shimmer pada seluruh tabel dan kartu saat proses fetching data.
- [ ] Uji Kepatuhan Aksesibilitas & Responsivitas:
  - Verifikasi tampilan pada resolusi Mobile (375px), Tablet (768px), dan Desktop (1440px).
  - Verifikasi navigasi keyboard dan *focus-visible ring*.
- [ ] Automated Testing Frontend:
  - Unit test fungsi utilitas & auth store menggunakan Vitest.
  - Component test untuk form login, modal konfirmasi, dan tabel data menggunakan React Testing Library.
- [ ] Kesiapan Produksi & Build Verification:
  - `npm run build` berhasil tanpa TypeScript error (`tsc --noEmit`).
  - Dokumentasi frontend di `frontend/README.md`.

---

## 7. Standar Penanganan Respon API & Kesalahan (Error Handling)

```typescript
// Tipe Data Response Standar
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

### Aturan UX saat Terjadi Error:
1. **Error Validasi Form (HTTP 400 Bad Request):** Pesan error dipetakan langsung ke input field terkait menggunakan `react-hook-form` `setError()`.
2. **Error Otorisasi (HTTP 403 Forbidden):** Toast error merah: *"Wewenang Ditolak: Anda tidak memiliki hak untuk melakukan aksi ini."*
3. **Error Konflik Data (HTTP 409 Conflict):** Toast peringatan: *"Data duplikat: Kode atau identitas tersebut sudah digunakan di sistem."*
4. **Error Server (HTTP 500 Internal Server Error):** Toast error: *"Terjadi kendala pada server SPADA. Silakan coba beberapa saat lagi."*

---

## 8. Kriteria Penerimaan & Definisi Selesai (Definition of Done - DoD)

Fitur Frontend MVP 1 dinyatakan selesai (*Done*) apabila memenuhi seluruh kriteria berikut:
- [ ] **Kepatuhan Fungsional:** Seluruh 3 peran resmi (`mahasiswa`, `dosen`, `admin`) dapat login, mengakses dasbor kontekstual yang sesuai, dan menjalankan fitur sesuai wewenangnya.
- [ ] **Integrasi API 100%:** Seluruh interaksi data terhubung dengan endpoint backend MVP 1 tanpa data mock statis.
- [ ] **Kesesuaian Desain:** Tampilan visual presisi sesuai panduan desain di [DESIGN_INSTRUCTIONS_MVP1_UIUX.md](DESIGN_INSTRUCTIONS_MVP1_UIUX.md) dan spesifikasi Portal Login (Dark-Mode Navy) di [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md).
- [ ] **Direct Enrollment Berjalan:** Admin dapat mendaftarkan mahasiswa ke kelas perkuliahan (individual maupun batch) dan kuota kelas terverifikasi dengan tepat.
- [ ] **Bebas Error Konsol:** Tidak ada unhandled runtime exception atau error merah pada inspect console browser.
- [ ] **Type-Safe:** Lolos pengecekan kompilasi TypeScript (`tsc --noEmit`) tanpa penggunaan tipe `any` yang tidak perlu.
- [ ] **Responsif:** Tampilan berfungsi optimal di layar smartphone (375px+), tablet, dan desktop.
- [ ] **Dokumentasi Lengkap:** Panduan instalasi dan pengujian tersedia di `frontend/README.md`.
