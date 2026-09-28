# Implementation Plan: Frontend MVP 1
**Sistem Akademik Kampus Terintegrasi (Portal, SIA, SPADA/LMS, PMB)**  
*Universitas PGRI Semarang (UPGRIS) — Team Membangun Negeri*

---

## 📌 Ringkasan Eksekutif
- **Target Rilis:** Frontend Web Client MVP 1
- **Acuan Utama:** [PRD.md](PRD.md) (*Bab 2, 3, 4, 5*), [SRS.md](SRS.md) (*Bab 3, 9, 10, 16, 19, 22, 28, 29, 30, 31, 32, 35, 39, 40*), [DESIGN_INSTRUCTIONS_MVP1_UIUX.md](DESIGN_INSTRUCTIONS_MVP1_UIUX.md), dan [backend/docs/openapi.yaml](backend/docs/openapi.yaml)
- **Fokus Utama:** Membangun antarmuka web modern, *responsive*, aman (*type-safe*), dan terintegrasi penuh dengan 37+ endpoint REST API backend MVP 1 yang telah teruji 100%.

---

## 1. Tujuan & Ruang Lingkup Frontend MVP 1

### 1.1 Tujuan
Membangun aplikasi web Single Page Application (SPA) yang cepat, intuitif, berintegritas tinggi, dan responsif untuk melayani seluruh peran sivitas akademika dalam mengakses portal terpusat, mengelola master data akademik dasar, kalender akademik, manajemen profil mandiri, serta manajemen akun dan jejak audit.

### 1.2 Ruang Lingkup Fitur MVP 1 (Sisi Frontend)
1. **Autentikasi & Sesi Pengguna:**
   - Halaman login multi-kredensial (Username, NIM, NIDN, NIP, atau Email + Password).
   - Penolakan akses untuk akun `INACTIVE` atau `SUSPENDED` disertai pesan informatif.
   - Fitur *remember me*, lupa password, dan ganti password mandiri di area profil.
   - Mekanisme *silent refresh token* otomatis tanpa mengganggu pengalaman pengguna.
2. **App Shell, Navigasi Global & Role Switcher:**
   - Topbar informatif: Indikator semester aktif, lonceng notifikasi, dan user menu.
   - *Role Switcher dropdown*: Memungkinkan pengguna dengan multi-role (misal Dosen sekaligus Dosen Wali) berpindah konteks kerja secara instan tanpa perlu login ulang.
   - Sidebar navigasi modular dan adaptif sesuai hak akses peran (*Role-based navigation*).
3. **Dasbor Kontekstual 6 Varian Aktor:**
   - Mahasiswa: Ringkasan akademik, info Dosen Wali/PA, status semester, launcher cepat SIA/SPADA.
   - Dosen & Dosen Wali: Metrik kelas mengajar, jadwal mengajar semester berjalan, statistik bimbingan PA.
   - Admin Akademik: Statistik kampus (mahasiswa, dosen, prodi, kelas), agenda kalender aktif, pintasan master data.
   - Admin LMS: Ringkasan operasional e-learning SPADA dan aktivitas kelas.
   - Super Admin: Statistik sebaran pengguna & status akun, kesehatan sistem, snapshot audit log terkini.
   - Calon Mahasiswa: Stepper 5 tahap seleksi PMB dan kartu informasi pendaftaran.
4. **Profil Mandiri & Pengaturan Keamanan:**
   - Tab Biodata Akun & Biodata Spesifik Entitas (Mahasiswa, Dosen, Admin, Calon Mhs).
   - Tab Ganti Password mandiri dengan indikator kekuatan kata sandi.
5. **Modul Master Data Akademik & Fasilitas (Admin Akademik):**
   - CRUD Fakultas & Program Studi.
   - CRUD Tahun Akademik & Semester operasional (disertai dialog konfirmasi aktivasi semester tunggal kampus).
   - CRUD Gedung & Ruangan perkuliahan.
   - CRUD Kurikulum & Master Mata Kuliah (rincian SKS teori/praktik).
   - Pembukaan Penawaran Kelas Kuliah untuk semester aktif.
6. **Modul Kalender Akademik:**
   - Penampil agenda kampus (List & Timeline view) untuk seluruh pengguna.
   - CRUD agenda kalender (Admin Akademik & Super Admin).
7. **Modul Manajemen Pengguna & RBAC (Super Admin):**
   - Tabel pengguna dengan pencarian, filter status akun (`ACTIVE`, `INACTIVE`, `SUSPENDED`), dan filter role.
   - Modal penugasan role dan perubahan status akun.
   - Matriks wewenang visual Role & Permission.
8. **Modul Jejak Audit (Audit Trail Viewer):**
   - Tabel audit log dengan filter aksi, entitas, tanggal, dan aktor.
   - Modal inspeksi perbedaan data JSON (*Old vs New Values Diff Inspector*).

---

## 2. Pemilihan Tech Stack & Rationale

| Layer / Kebutuhan | Pilihan Teknologi | Versi | Alasan Pemilihan & Keunggulan |
|---|---|---|---|
| **Build Tool & Framework** | [Vite](https://vitejs.dev/) + [React](https://react.dev/) | React 18+ LTS / Vite 5+ | Kecepatan kompilasi instan, Hot Module Replacement (HMR) sub-detik, ringan, dan standar industri modern SPA. |
| **Bahasa Pemrograman** | [TypeScript](https://www.typescriptlang.org/) | `v5.0+` | Menjamin *type-safety*, mencegah *runtime error*, dan menyediakan *auto-complete* akurat yang selaras dengan DTO backend. |
| **CSS Framework** | [Tailwind CSS](https://tailwindcss.com/) | `v3.4+` | Efisiensi styling tinggi, kemudahan integrasi dengan *design tokens* (warna, spasi 8pt), serta hasil build CSS sangat ramping. |
| **UI Primitives / Kit** | [Radix UI](https://www.radix-ui.com/) / [shadcn/ui](https://ui.shadcn.com/) | Latest | Komponen *headless* berbasis standar aksesibilitas WAI-ARIA, fleksibel, mudah dikustomisasi, tanpa *lock-in*. |
| **Ikonografi** | [Lucide React](https://lucide.dev/) | Latest | Koleksi ikon SVG modern, konsisten, berukuran ringan, dan mendukung *tree-shaking*. |
| **Routing & Navigation** | [React Router DOM](https://reactrouter.com/) | `v6.22+` | Dukungan *Data Router*, *nested routes*, *layout outlets*, dan proteksi rute berbasis otorisasi peran (*ProtectedRoute*). |
| **Server State & Caching** | [TanStack Query](https://tanstack.com/query/latest) (React Query) | `v5+` | Pengelolaan data asinkron server otomatis: caching pintar, background re-fetching, pagination, mutasi data, dan status loading/error. |
| **Client / Global State** | [Zustand](https://zustand-demo.pmnd.rs/) | `v4.5+` | State manager minimalis (kurang dari 2KB), tanpa *boilerplate*, ideal untuk menyimpan sesi auth, token, dan peran aktif. |
| **Form & Validasi** | [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/) | RHF v7 + Zod v3 | Penanganan form efisien tanpa *re-render* berlebih, validasi skema deklaratif yang selaras dengan validasi backend Zod. |
| **HTTP Client** | [Axios](https://axios-http.com/) | `v1.7+` | Pengaturan *interceptors* terpusat untuk injeksi Bearer Token, penanganan otomatis refresh token saat 401, dan normalisasi error. |
| **Format Waktu & Tanggal** | [date-fns](https://date-fns.org/) | `v3+` | Library manipulasi tanggal modular dan ramah *tree-shaking* dengan dukungan lokal Bahasa Indonesia (`id`). |
| **Testing Suite** | [Vitest](https://vitest.dev/) + [React Testing Library](https://testing-library.com/) | Latest | Eksekusi unit/komponen test super cepat terintegrasi langsung dengan ekosistem Vite. |

---

## 3. Struktur Direktori Proyek Frontend

Struktur direktori dirancang dengan pendekatan **Feature-Based (Modular)** agar rapi, modular, dan mudah dikembangkan untuk MVP 2 hingga MVP 6.

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
│   └── logo-kampus.svg
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
    │   ├── AuthLayout.tsx           # Layout halaman Login & Lupa Password
    │   ├── AppLayout.tsx            # Shell utama (Topbar, Sidebar, Breadcrumb, Outlet)
    │   ├── Topbar.tsx               # Header global + Role Switcher + User Menu
    │   └── Sidebar.tsx              # Sidebar modular sesuai hak akses peran
    │
    ├── features/                    # Modul Fitur Bisnis (Feature-driven)
    │   ├── auth/                    # Modul Autentikasi
    │   │   ├── components/          # LoginForm, ForgotPasswordForm
    │   │   ├── hooks/               # useAuth, useLogin, useLogout
    │   │   ├── services/            # authService.ts
    │   │   └── types/               # auth.types.ts
    │   │
    │   ├── portal/                  # Modul Portal & Dasbor Kontekstual
    │   │   ├── components/          # MahasiswaDashboard, DosenDashboard, AdminDashboard, dll.
    │   │   ├── services/            # portalService.ts
    │   │   └── types/               # portal.types.ts
    │   │
    │   ├── profile/                 # Modul Profil & Keamanan
    │   │   ├── components/          # ProfileBiodataTab, ChangePasswordTab
    │   │   └── services/            # profileService.ts
    │   │
    │   ├── master/                  # Modul Master Data Dasar (Admin Akademik)
    │   │   ├── fakultas/            # Fakultas & Prodi Management
    │   │   ├── semester/            # Tahun Akademik & Semester Management
    │   │   ├── fasilitas/           # Gedung & Ruangan Management
    │   │   ├── kurikulum/           # Kurikulum & Mata Kuliah Management
    │   │   └── kelas/               # Pembukaan Penawaran Kelas
    │   │
    │   ├── calendar/                # Modul Kalender Akademik
    │   │   ├── components/          # CalendarAgendaList, CalendarModalForm
    │   │   └── services/            # calendarService.ts
    │   │
    │   ├── users/                   # Modul Manajemen Pengguna & RBAC (Super Admin)
    │   │   ├── components/          # UserTable, UserEditModal, RolePermissionMatrix
    │   │   └── services/            # usersService.ts
    │   │
    │   └── audit-log/               # Modul Jejak Audit
    │       ├── components/          # AuditLogTable, AuditDetailModal
    │       └── services/            # auditLogService.ts
    │
    ├── hooks/                       # Custom Global Hooks (useToast, useDebounce, dll.)
    ├── routes/                      # Konfigurasi Routing
    │   ├── index.tsx                # Definisi Rute Lengkap
    │   ├── ProtectedRoute.tsx       # Guard autentikasi token
    │   └── RoleGuard.tsx            # Guard otorisasi peran spesifik
    │
    ├── services/                    # Setup HTTP Client Terpusat
    │   └── api.ts                   # Axios instance dengan Request/Response Interceptors
    │
    ├── store/                       # Global State Store (Zustand)
    │   ├── useAuthStore.ts          # State autentikasi, token, profile, activeRole
    │   └── useAppStore.ts           # State UI (sidebar open/close, active semester)
    │
    ├── types/                       # Definisi TypeScript Global & API Response Standard
    │   └── api.types.ts             # ApiResponse<T>, PaginationMeta, ApiError
    │
    └── utils/                       # Utility Helpers (dateFormatter, currencyFormatter, tokenStorage)
```

---

## 4. Arsitektur Autentikasi, Sesi & RBAC Guard

### 4.1 Mekanisme Penyimpanan Token & Interceptor Otomatis
Sistem mengadopsi standar keamanan token ganda:
1. **Access Token (Masa Aktif 15 Menit):** Disimpan di memori runtime (`Zustand Store`) untuk proteksi maksimal dari serangan XSS.
2. **Refresh Token (Masa Aktif 7 Hari):** Disimpan aman di `localStorage` terenkripsi / `HttpOnly Cookie`.
3. **Axios Silent Refresh Mutex:**
   - Jika endpoint mengembalikan HTTP `401 Unauthorized`, interceptor respons akan menahan request yang gagal ke dalam antrean (*queue*).
   - Satu request eksekusi dikirim ke `POST /api/v1/auth/refresh`.
   - Jika refresh berhasil: Token baru diinjeksikan kembali ke header dan seluruh request yang tertahan diulang secara otomatis (*replay request*).
   - Jika refresh gagal: Pengguna otomatis di-logout, sesi dibersihkan, dan diarahkan ke `/login?session_expired=true`.

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
- `ProtectedRoute`: Memeriksa apakah token pengguna valid dan akun berstatus `ACTIVE`. Jika tidak login, alihkan ke `/login`.
- `RoleGuard`: Memeriksa apakah `activeRole` pengguna memenuhi daftar peran yang diizinkan untuk rute tersebut. Jika tidak diizinkan, alihkan ke tampilan `403 Forbidden`.

```tsx
// Contoh Pemakaian Rute
<Route element={<ProtectedRoute />}>
  <Route element={<AppLayout />}>
    <Route path="/dashboard" element={<DashboardPage />} />
    <Route path="/profile" element={<ProfilePage />} />
    <Route path="/calendar" element={<CalendarPage />} />
    
    {/* Rute Khusus Admin Akademik */}
    <Route element={<RoleGuard allowedRoles={['ADMIN_AKADEMIK', 'SUPER_ADMIN']} />}>
      <Route path="/master/fakultas" element={<FakultasPage />} />
      <Route path="/master/semester" element={<SemesterPage />} />
      <Route path="/master/fasilitas" element={<FasilitasPage />} />
      <Route path="/master/kurikulum" element={<KurikulumPage />} />
      <Route path="/master/kelas" element={<KelasPage />} />
    </Route>

    {/* Rute Khusus Super Admin */}
    <Route element={<RoleGuard allowedRoles={['SUPER_ADMIN']} />}>
      <Route path="/users" element={<UsersPage />} />
      <Route path="/roles" element={<RolesPage />} />
      <Route path="/audit-logs" element={<AuditLogsPage />} />
    </Route>
  </Route>
</Route>
```

### 4.3 Multi-Role Context & Role Switcher
- Seorang pengguna dapat memiliki lebih dari satu role (contoh: Dosen yang juga menjabat sebagai Dosen Wali).
- Global state `useAuthStore` menyimpan `roles: string[]` dan `activeRole: string`.
- Saat pengguna memilih peran lain di dropdown Topbar:
  - `activeRole` diperbarui di store.
  - Sidebar otomatis me-render menu yang sesuai dengan peran aktif tersebut.
  - Dasbor utama me-render widget konteks peran yang dipilih tanpa reload halaman (*instant zero-flicker re-render*).

---

## 5. Pemetaan Rute Frontend ke 37+ Endpoint Backend

Setiap layar frontend telah dipetakan secara presisi ke endpoint OpenAPI backend MVP 1:

| Halaman Frontend | Rute Frontend | Metode | Endpoint Backend | Fungsi & Data yang Digunakan |
|---|---|---|---|---|
| **Login** | `/login` | `POST` | `/api/v1/auth/login` | Mengirim username/email + password, menerima token dan profil |
| **Lupa Password** | `/forgot-password` | `POST` | `/api/v1/auth/forgot-password` | Mengirim email untuk permintaan pemulihan kata sandi |
| **Profil & Biodata** | `/profile` | `GET` | `/api/v1/profile` | Mengambil data akun dan profil entitas aktif |
| **Perbarui Profil** | `/profile` | `PUT` | `/api/v1/profile` | Memperbarui atribut mandiri profil pengguna |
| **Ganti Password** | `/profile` (Tab 2) | `PUT` | `/api/v1/auth/change-password` | Memvalidasi kata sandi lama dan menyimpan kata sandi baru |
| **Logout** | Modal / Topbar | `POST` | `/api/v1/auth/logout` | Mencabut refresh token di database dan membersihkan sesi |
| **Dasbor Kontekstual** | `/dashboard` | `GET` | `/api/v1/portal/dashboard` | Mengambil data agregasi metrik kontekstual peran aktif |
| **Launcher Modul** | Topbar / Portal | `GET` | `/api/v1/portal/modules` | Evaluasi hak akses modul kampus (PORTAL, SIA, SPADA, PMB) |
| **Master Fakultas** | `/master/fakultas` | `GET`, `POST` | `/api/v1/master/fakultas` | Menampilkan tabel & menambah master data fakultas |
| **Aksi Fakultas** | `/master/fakultas` | `PUT`, `DELETE`| `/api/v1/master/fakultas/:id` | Mengedit atau menghapus data fakultas |
| **Master Prodi** | `/master/fakultas` | `GET`, `POST` | `/api/v1/master/prodi` | Menampilkan daftar & menambah program studi |
| **Aksi Prodi** | `/master/fakultas` | `PUT`, `DELETE`| `/api/v1/master/prodi/:id` | Mengedit atau menghapus data program studi |
| **Tahun Akademik** | `/master/semester` | `GET`, `POST` | `/api/v1/master/tahun-akademik` | Menampilkan & mengelola data tahun akademik |
| **Master Semester** | `/master/semester` | `GET`, `POST` | `/api/v1/master/semester` | Mengelola periode semester (Ganjil/Genap/Antara) |
| **Aktivasi Semester** | `/master/semester` | `PATCH` | `/api/v1/master/semester/:id/activate` | Mengaktifkan semester operasional sistem secara atomik |
| **Gedung & Ruangan** | `/master/fasilitas`| `GET`, `POST` | `/api/v1/master/gedung`, `/ruangan` | Mengelola data fasilitas gedung dan kapasitas ruangan |
| **Kurikulum & MK** | `/master/kurikulum`| `GET`, `POST` | `/api/v1/master/kurikulum`, `/mata-kuliah`| Mengelola kurikulum dan master mata kuliah (SKS rincian) |
| **Penawaran Kelas** | `/master/kelas` | `GET`, `POST` | `/api/v1/master/kelas` | Membuka penawaran kelas semester aktif |
| **Kalender Akademik** | `/calendar` | `GET` | `/api/v1/calendar` | Menampilkan agenda kalender (List & Timeline view) |
| **Kelola Kalender** | `/calendar` | `POST`, `PUT`, `DELETE` | `/api/v1/calendar/:id` | Menambah, mengedit, dan menghapus agenda kalender |
| **Kelola Pengguna** | `/users` | `GET` | `/api/v1/users` | Menampilkan daftar user (pagination, search, filter) |
| **Detail Pengguna** | `/users/:id` | `GET` | `/api/v1/users/:id` | Mengambil detail lengkap akun & profil entitas |
| **Status Pengguna** | `/users/:id` | `PATCH` | `/api/v1/users/:id/status` | Mengubah status akun (`ACTIVE`, `INACTIVE`, `SUSPENDED`) |
| **Penugasan Role** | `/users/:id` | `PUT` | `/api/v1/users/:id/roles` | Menugaskan atau mencabut role pada akun pengguna |
| **Matriks RBAC** | `/roles` | `GET` | `/api/v1/roles`, `/api/v1/permissions` | Mengambil daftar seluruh role dan izin hak akses |
| **Peninjau Audit** | `/audit-logs` | `GET` | `/api/v1/audit-logs` | Menampilkan riwayat log audit (filter aksi, user, tanggal) |

---

## 6. Tahapan Pengerjaan Frontend (6 Fase Bertahap)

Pengembangan frontend dilakukan melalui 6 fase terstruktur yang dapat dilacak kemajuannya:

```text
Fase 1: Setup Proyek, Tooling & Design System Primitives
  │
  ▼
Fase 2: Layanan API, Autentikasi, Guard Rute & Shell Navigasi
  │
  ▼
Fase 3: Dasbor Portal Kontekstual & Profil Mandiri
  │
  ▼
Fase 4: Modul Master Data Dasar & Kalender Akademik
  │
  ▼
Fase 5: Modul Manajemen Pengguna, RBAC & Jejak Audit
  │
  ▼
Fase 6: Pengujian Kualitas, Error Boundary, Responsivitas & Handoff
```

---

### 🚀 Fase 1: Setup Proyek, Tooling & Design System Primitives
**Target:** Lingkungan proyek terkonfigurasi rapi dan pustaka komponen dasar (*UI Kit*) siap pakai.
- [ ] Inisialisasi proyek menggunakan Vite + React + TypeScript di direktori `frontend/`.
- [ ] Konfigurasi `tailwind.config.js` dengan menyematkan seluruh *design tokens* dari dokumen [DESIGN_INSTRUCTIONS_MVP1_UIUX.md](DESIGN_INSTRUCTIONS_MVP1_UIUX.md) (warna brand, neutral, semantic, spacing 8pt, font Inter/Plus Jakarta Sans).
- [ ] Konfigurasi path aliases `@/*` pada `tsconfig.json` dan `vite.config.ts`.
- [ ] Instalasi dependensi inti: `axios`, `@tanstack/react-query`, `zustand`, `react-router-dom`, `lucide-react`, `react-hook-form`, `zod`, `@hookform/resolvers`, `date-fns`, `clsx`, `tailwind-merge`.
- [ ] Membangun komponen UI Primitives terstandar di `src/components/ui/`:
  - `Button` (Primary, Secondary, Destructive, Ghost, Icon, Loading state).
  - `Input` & `PasswordInput` (dengan toggle show/hide).
  - `Select` & `DropdownMenu`.
  - `Badge` (Status pill untuk Active, Inactive, Suspended, Dijadwalkan, dll.).
  - `Modal` (Dialog konfirmasi & Form dialog).
  - `Table` (Header sortable, strip, hover rows).
  - `Skeleton` (Shimmer loading effect).
  - `Toast` (Notifikasi pop-up Success, Error, Info).

---

### 🔐 Fase 2: Layanan API, Autentikasi, Guard Rute & Shell Navigasi
**Target:** Alur login-logout bekerja mulus, sesi tersimpan aman, dan kerangka tata letak aplikasi terbentuk.
- [ ] Implementasi Axios Client singleton (`src/services/api.ts`) dengan konfigurasi `baseURL`, header default, dan request interceptor untuk injeksi Bearer Token.
- [ ] Implementasi response interceptor untuk penanganan HTTP `401 Unauthorized` dengan *silent refresh token queuing*.
- [ ] Pembuatan `useAuthStore` (Zustand) untuk menyimpan data `user`, `accessToken`, `roles`, dan `activeRole`.
- [ ] Pembuatan `ProtectedRoute` dan `RoleGuard` untuk pengamanan rute aplikasi.
- [ ] Halaman Login (`/login`) dengan form validasi Zod DTO:
  - Input multi-kredensial (Username / NIM / NIDN / NIP / Email).
  - Input Password dengan tombol lihat sandi.
  - Penanganan pesan kesalahan login kredensial tidak cocok dan akun non-aktif (*SRS BR/UC-01*).
- [ ] Halaman Lupa Password (`/forgot-password`).
- [ ] Membangun kerangka navigasi aplikasi (`AppLayout`):
  - **Topbar:** Logo UPGRIS, badge semester operasional, dropdown Role Switcher, lonceng notifikasi, dan avatar user menu.
  - **Sidebar:** Menu dinamis responsif (bisa diciutkan/expand) yang otomatis menyesuaikan isi menu berdasarkan `activeRole`.

---

### 📊 Fase 3: Dasbor Portal Kontekstual & Profil Mandiri
**Target:** Pengguna dapat melihat dasbor ringkasan sesuai perannya dan mengelola data profil mandiri.
- [ ] Implementasi service layer `portalService.ts` untuk memanggil `GET /api/v1/portal/dashboard` dan `GET /api/v1/portal/modules`.
- [ ] Pembuatan komponen dasbor modular berdasarkan 6 varian peran:
  - `MahasiswaDashboard`: Kartu ringkasan akademik, kartu info Dosen PA, status periode KRS, tombol akses cepat SIA dan SPADA.
  - `DosenDashboard`: Statistik kelas mengajar, jadwal mengajar semester berjalan, statistik mahasiswa perwalian.
  - `AdminAkademikDashboard`: Kartu metrik total mahasiswa, dosen, prodi, kelas, widget semester aktif, agenda kalender berjalan.
  - `AdminLmsDashboard`: Metrik operasional kelas SPADA daring dan indikator aktivitas.
  - `SuperAdminDashboard`: Statistik status user (Active/Inactive/Suspended), sebaran 8 role, dan 5 log aktivitas terkini.
  - `CalonMahasiswaDashboard`: Stepper 5 tahapan pendaftaran PMB dan status kelengkapan berkas.
- [ ] Halaman Profil Mandiri (`/profile`):
  - Tab 1: Penampil biodata akun dan biodata spesifik entitas, disertai tombol edit profil (`PUT /api/v1/profile`).
  - Tab 2: Form Ganti Password mandiri (`PUT /api/v1/auth/change-password`) dengan indikator kekuatan kata sandi.

---

### 🏫 Fase 4: Modul Master Data Dasar & Kalender Akademik (Admin Akademik)
**Target:** Admin Akademik dapat mengelola master data kelembagaan, waktu, fasilitas, kurikulum, dan kalender kampus secara menyeluruh.
- [ ] Komponen Reusable `DataTableContainer` (pencarian instan, filter bar, pagination, dan empty state).
- [ ] Halaman Master Kelembagaan (`/master/fakultas`):
  - Tabel dan modal CRUD Fakultas.
  - Tabel dan modal CRUD Program Studi bertingkat.
- [ ] Halaman Master Waktu & Semester (`/master/semester`):
  - Tabel dan modal CRUD Tahun Akademik.
  - Tabel dan modal CRUD Semester.
  - Tombol aksi **"Aktivasi Semester"** dengan modal konfirmasi bahaya (*Danger Confirmation*) memanggil `PATCH /api/v1/master/semester/:id/activate`.
- [ ] Halaman Fasilitas Kampus (`/master/fasilitas`):
  - Pengelolaan data Gedung dan Ruangan perkuliahan.
- [ ] Halaman Kurikulum & Mata Kuliah (`/master/kurikulum`):
  - Pengelolaan Kurikulum per program studi.
  - Master Mata Kuliah (SKS Total, rincian SKS Teori/Praktik, semester paket, status wajib/pilihan).
- [ ] Halaman Pembukaan Kelas (`/master/kelas`):
  - Tabel penawaran kelas semester aktif.
  - Modal form pembukaan kelas: Relasi multi-entitas (Mata Kuliah, Dosen Pengampu, Ruangan, Jadwal Hari/Jam).
- [ ] Halaman Kalender Akademik (`/calendar`):
  - Mode tampilan daftar agenda dan timeline.
  - CRUD agenda kalender dengan penanda status badge (`DIJADWALKAN`, `BERJALAN`, `SELESAI`).

---

### 🛡️ Fase 5: Modul Manajemen Pengguna, RBAC & Jejak Audit (Super Admin)
**Target:** Super Admin dapat mengelola akun pengguna, status akun, penugasan role, dan meninjau audit trail.
- [ ] Halaman Manajemen Pengguna (`/users`):
  - Tabel data pengguna terintegrasi server-side pagination, search, filter role, dan filter status akun.
  - Modal Edit Akun: Pengubahan status akun (`ACTIVE`, `INACTIVE`, `SUSPENDED`) dan penugasan multi-role (`PUT /api/v1/users/:id/roles`).
- [ ] Halaman Matriks RBAC (`/roles`):
  - Tampilan visual matriks silang antara 8 Role resmi dengan daftar Permission sistem.
- [ ] Halaman Peninjau Jejak Audit (`/audit-logs`):
  - Tabel riwayat audit dengan filter rentang tanggal, filter tipe aksi (`LOGIN`, `CREATE`, `UPDATE`, dll.), dan filter entitas.
  - Modal Inspeksi JSON Diff (*Old Values* vs *New Values*) untuk meninjau secara rinci perubahan data yang terjadi.

---

### ✨ Fase 6: Pengujian Kualitas, Error Boundary, Responsivitas & Handoff
**Target:** Aplikasi stabil, bebas regresi, memiliki UX tangguh (*robust*), dan siap produksi.
- [ ] Penanganan Status Batas & Error:
  - Implementasi React `ErrorBoundary` global untuk menangkap crash rendering.
  - Halaman kustom ramah pengguna: `403 Forbidden`, `404 Not Found`, dan `500 Server Error`.
  - Komponen Skeleton Shimmer pada seluruh tabel dan kartu metrik saat proses loading data.
- [ ] Uji Kepatuhan Aksesibilitas & Responsivitas:
  - Verifikasi tampilan pada resolusi Mobile (375px), Tablet (768px), dan Desktop (1440px).
  - Verifikasi navigasi keyboard dan *focus-visible ring*.
- [ ] Automated Testing Frontend:
  - Unit test fungsi utilitas & store auth menggunakan Vitest.
  - Component test untuk form login, modal konfirmasi, dan tabel data menggunakan React Testing Library.
  - Integration/E2E test alur login multi-role dan pergantian role menggunakan Playwright.
- [ ] Kesiapan Produksi & Build Verification:
  - `npm run build` berhasil tanpa TypeScript error (`tsc --noEmit`).
  - Pembuatan panduan menjalankan frontend di `frontend/README.md`.

---

## 7. Standar Penanganan Respon API & Kesalahan (Error Handling)

Seluruh respons dari server backend wajib ditangani secara seragam mengacu pada format standar:

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
1. **Error Validasi Form (HTTP 400 Bad Request):**
   - Pesan error dipetakan langsung ke input field terkait menggunakan `react-hook-form` `setError()`.
2. **Error Otorisasi (HTTP 403 Forbidden):**
   - Munculkan toast error merah: *"Wewenang Ditolak: Anda tidak memiliki hak untuk melakukan aksi ini."*
3. **Error Konflik Data (HTTP 409 Conflict):**
   - Munculkan toast peringatan: *"Data duplikat: Kode atau identitas tersebut sudah digunakan di sistem."*
4. **Error Server (HTTP 500 Internal Server Error):**
   - Munculkan toast: *"Terjadi kendala pada server kampus. Silakan coba beberapa saat lagi."*

---

## 8. Strategi Pengujian Otomatis (Automated Testing)

| Kategori Pengujian | Perkakas | Target Cakupan | Contoh Skenario Uji |
|---|---|---|---|
| **Unit Testing** | Vitest | Helper, Formatter, Token Storage, Zustand Store | - Penyimpanan & pembersihan token sesi di store<br>- Logika pemilihan activeRole default saat login |
| **Component Testing** | React Testing Library | Komponen UI Form, Button, Modal, Data Table | - Input login menampilkan pesan error saat dikosongkan<br>- Tombol switch password reveal bekerja dengan benar<br>- Modal konfirmasi memicu fungsi callback onDelete |
| **End-to-End (E2E)** | Playwright | Alur perjalanan pengguna krusial | - Login dengan kredensial Mahasiswa -> muncul Dasbor Mahasiswa<br>- Login Dosen Wali -> beralih role ke Dosen Pengampu pada Role Switcher<br>- Admin Akademik membuka modal dan membuat program studi baru |

---

## 9. Kriteria Penerimaan & Definisi Selesai (Definition of Done - DoD)

Fitur Frontend MVP 1 dinyatakan selesai (*Done*) apabila memenuhi seluruh kriteria berikut:
- [ ] **Kepatuhan Fungsional:** Seluruh 8 skenario aktor dapat login, mengakses dasbor yang sesuai, dan menjalankan fitur sesuai matriks wewenang.
- [ ] **Integrasi API 100%:** Seluruh interaksi data terhubung dengan 37+ endpoint backend tanpa data *mock/dummy* statis.
- [ ] **Kesesuaian Desain:** Tampilan visual presisi sesuai panduan desain di [DESIGN_INSTRUCTIONS_MVP1_UIUX.md](DESIGN_INSTRUCTIONS_MVP1_UIUX.md).
- [ ] **Bebas Error Konsol:** Tidak ada unhandled runtime exception atau error merah pada inspect console browser.
- [ ] **Type-Safe:** Lolos pengecekan kompilasi TypeScript (`tsc --noEmit`) tanpa penggunaan `any` sembarangan.
- [ ] **Responsif:** Tampilan berfungsi optimal di layar smartphone (375px+), tablet, dan desktop.
- [ ] **Automated Tests:** Seluruh skenario pengujian unit & integrasi frontend berjalan dan berstatus lulus (100% pass).
- [ ] **Dokumentasi Lengkap:** Tersedia dokumentasi instalasi dan panduan pengujian di `frontend/README.md`.
