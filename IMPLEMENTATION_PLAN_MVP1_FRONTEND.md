# Implementation Plan: Frontend MVP 1 (Pembaruan Status Eksekusi)
# SPADA (Learning Management System) Universitas PGRI Semarang (UPGRIS)
**Team Membangun Negeri — Rencana & Status Eksekusi Teknis Frontend: Fondasi, Akun, Master Data & Direct Enrollment**

> **Pembaruan terakhir:** 1 November 2026. Dokumen ini **diselaraskan dengan kondisi riil repository `main`** (45 berkas sumber di `frontend/src/`, build produksi sukses) dan dengan status pengerjaan desain: **seluruh 6 fase desain MVP 1 maupun MVP 2 di Google Stitch telah selesai (Delivered)** — lihat [DESIGN_INSTRUCTIONS_MVP1_UIUX.md](DESIGN_INSTRUCTIONS_MVP1_UIUX.md) dan [DESIGN_INSTRUCTIONS_MVP2_UIUX.md](DESIGN_INSTRUCTIONS_MVP2_UIUX.md). Input kode HTML design UI dari kedua dokumen tersebut adalah satu-satunya acuan visual yang dikonversi menjadi kode React.

---

## 📌 Ringkasan Eksekutif
- **Target Rilis:** Frontend Web Client MVP 1 SPADA LMS UPGRIS.
- **Acuan Utama:** [PRD.md](PRD.md) (*Bab 2, 3, 5, 7*), [SRS.md](SRS.md), [DESIGN_INSTRUCTIONS_MVP1_UIUX.md](DESIGN_INSTRUCTIONS_MVP1_UIUX.md) (**status desain: ✅ 6/6 fase Delivered**), [DESIGN_INSTRUCTIONS_MVP2_UIUX.md](DESIGN_INSTRUCTIONS_MVP2_UIUX.md) (**status desain: ✅ 6/6 fase Delivered**), [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md), dan [IMPLEMENTATION_PLAN_MVP1_BACKEND.md](IMPLEMENTATION_PLAN_MVP1_BACKEND.md).
- **Metodologi & Workflow Utama:** **Stitch HTML-to-React Conversion Pipeline.** Tim UI/UX merancang antarmuka 100% melalui prompt Google Stitch pada tiap fase (MVP 1 & MVP 2 selesai seluruhnya) dan mengekspor HTML semantik + Tailwind CSS. Tim Frontend Developer mengonversi, memodularisasi, dan menghubungkannya ke *tech stack* Vite + React 18 serta REST API Backend.
- **Kondisi Repository:** *multi-folder workspace* — `backend/` (Node.js/Express port 5000) berdampingan dengan `frontend/` (Vite port 5173 dengan reverse proxy `/api` → `http://localhost:5000`).
- **Status Eksekusi per Fase (aktual per 1 Nov 2026):**

| Fase | Lingkup | Status Eksekusi | Catatan Singkat |
|---|---|:---:|---|
| **Fase 1** | Setup workspace, tooling, proxy, arsitektur | ✅ Selesai | Vite + proxy `:5000` + Tailwind token aktif |
| **Fase 2** | Konversi UI kit primitives ke React | ⚠️ Sebagian | Konversi inline per halaman; pustaka `components/ui/` terpusat belum dibentuk |
| **Fase 3** | Autentikasi, App Shell, Profil | ⚠️ Sebagian | Login & Lupa Password UI ✅ (integrasi API menyusul); App Shell ✅; halaman `/profile` ❌ belum |
| **Fase 4** | Dasbor 3 peran + responsif mobile | ✅ Selesai | Mahasiswa, Dosen, Admin + widget + Status Presensi |
| **Fase 5** | Modul Admin (Users, Courses/Classes, Enrollment BR-002, Audit) | ⚠️ UI ✅ / API ⏳ | 4 modul lengkap secara antarmuka; data masih fixture lokal |
| **Fase 6** | Skeleton, error suite, WCAG, testing, build verification | ⚠️ Parsial | `npm run build` ✅ (exit 0); skeleton/error pages/test suite ❌ |

- **Capaian Terverifikasi:** build produksi sukses (`frontend/dist/` tergenerasi), routing multi-peran berbasis query string, 11 halaman + 4 modul admin lengkap (termasuk *split-view* Direct Enrollment & JSON Diff Inspector), topbar/sidebar RBAC, ganti password terhubung API, logout terhubung API.
- **Pekerjaan Terbesar Tersisa:** integrasi API riil (mayoritas data masih *fixture* lokal), halaman `/profile`, *silent refresh interceptor*, rangkaian skeleton & halaman error 401/403/404/500, audit WCAG, type-check TypeScript, dan unit/integration test.

---

## 1. Tujuan, Ruang Lingkup & Kondisi Repository Eksisting

### 1.1 Tujuan
Membangun antarmuka Single Page Application (SPA) yang berkinerja tinggi, intuitif, berintegritas data tinggi, bebas friksi birokrasi non-LMS, dan responsif. Aplikasi ini melayani sivitas akademika Universitas PGRI Semarang dalam mengakses gerbang pembelajaran digital, mengelola master data akademik SPADA, pendaftaran kepesertaan kelas (*direct enrollment* BR-002), manajemen profil mandiri, serta peninjau jejak audit untuk 3 peran resmi: **Mahasiswa**, **Dosen**, dan **Admin**.

### 1.2 Kondisi Repository Saat Ini (Aktual)
1. **Workspace Multi-Folder:**
   - Root repository `rpl-lms/` memuat modul `backend/` (Node.js Express, Prisma ORM v6+, PostgreSQL, Zod DTO, port `5000`).
   - Frontend berada di `frontend/` — diinisialisasi dari template Vite React-TS, lalu dikembangkan sebagai **komponen JavaScript/JSX** (TypeScript aktif hanya untuk `services/api.ts`, `stores/authStore.ts`, `utils/cn.ts`).
2. **Konektivitas Dev Server & Proxy (✅ aktif):**
   - Vite dev server port `5173`; `vite.config.js` mereverse-proxy `/api` → `http://localhost:5000` (mencegah CORS di dev).
   - Path alias `@/*` → `src/*` dan `@features/*` → `src/features/*`.
3. **Konfigurasi Build (✅ aktif):**
   - `npm run build` sukses (terverifikasi 1 Nov 2026, exit 0) menghasilkan `frontend/dist/` (index.html, CSS ±64 kB, JS ±334 kB).
   - Skrip `typecheck` dan `test` **belum tersedia** pada `package.json`.
4. **Aset Desain:**
   - `index.html` memuat font sesuai token desain: **Plus Jakarta Sans, Inter, JetBrains Mono**, ikon **Material Symbols Outlined** (pengganti inline SVG Stitch), dan kelas `dark` pada elemen `<html>`.
   - **Catatan:** direktori `frontend/stitch-handoff/` sengaja tidak dipertahankan di repo — berkas HTML hasil ekspor Stitch dikonversi **langsung** menjadi komponen React pada `src/` dan tidak ikut kompilasi.
5. **Routing Aktual:**
   - Menggunakan **router berbasis query string custom** (`?page=...` + `?role=...`, `pushState`/`popstate`) di `App.jsx` dengan whitelist rute `ROUTES` / `SPECIAL_ROUTES` — **bukan React Router** (keputusan implementasi aktual; lihat §5.3).

### 1.3 Ruang Lingkup Fitur Frontend MVP 1 (Dengan Status Realisasi)

1. **Autentikasi & Sesi Pengguna — ⚠️ Sebagian:**
   - Halaman login multi-kredensial (`/login` — NIM/NIDN/Username/Email + Password): **UI selesai**, saat ini masih *mock login* (belum memanggil `POST /api/auth/login`).
   - Lupa password (`/forgot-password`): **UI selesai**, panggilan API masih berupa komentar `TODO` (*simulasi*).
   - Penolakan akun `INACTIVE`/`SUSPENDED`, *remember me*: menunggu integrasi API.
   - Logout aman: **✅ terintegrasi** (`POST /api/auth/logout` + bersihkan token di `AppShell`).
   - *Silent refresh token*: **❌ belum** — interceptor Axios baru memasang Bearer token (lihat §5.2).
2. **App Shell & Navigasi Terstruktur SPADA — ✅ Selesai:**
   - `AppShell` tunggal (*single source of truth*): Header (logo, badge **"🟢 Semester Ganjil 2026/2027"**, pencarian, notifikasi, dropdown profil dengan aksi *Profil Saya* / *Ganti Kata Sandi* / *Keluar*), Sidebar lebar 260px dengan menu adaptif per RBAC, modal Ganti Password, dan Toast.
   - Navigasi per peran didefinisikan pada `features/shell/fixtures.js` (`navSections`): Mahasiswa (Dasbor, Kelas Saya, Panduan Belajar), Dosen (Kelas Diampu, Pemeriksaan Tugas), Admin (Direct Enrollment, Manajemen Pengguna, Master Mata Kuliah, Pembukaan Kelas, Jejak Audit, Konfigurasi Sistem), plus bagian Akademik bersama.
3. **Dasbor Kontekstual 3 Peran — ✅ Selesai:**
   - **Mahasiswa:** `GreetingBanner`, `SummaryCards`, `CourseCards` (kartu kelas + tombol akses), `AnnouncementBanner`, `AssignmentWidget`, `AttendanceWidget`.
   - **Dosen:** `DasborDosen` — header profil & NIDN, 3 metrik pengajaran, daftar kelas diampu; **sudah memanggil** `dosenApi` (metrics, classes, pending grading) dengan *fallback* data bila endpoint backend belum tersedia.
   - **Admin:** `DasborAdmin` — 4 kartu statistik sistem, *Quick Shortcuts Grid*, snapshot riwayat audit + filter aksi.
4. **Modul Pengelolaan Profil Pengguna Mandiri (`/profile`) — ❌ Belum dikerjakan:**
   - Tab Biodata Diri, upload avatar, Tab Ganti Password mandiri.
   - *Catatan:* fitur **Ganti Password** sudah tersedia lebih dulu sebagai `ChangePasswordModal` yang terhubung ke `PUT /api/profile/password` (fallback `/api/auth/change-password`) dan dipanggil dari menu Header — tinggal dipindahkan/diturunkan ke halaman `/profile`.
5. **Modul Master Data Akademik SPADA (Admin) — ✅ UI Selesai:**
   - **Manajemen Pengguna (`/admin/users`):** tabel + *server-style pagination*, search multi-kolom, filter role & status (`ACTIVE`/`INACTIVE`/`SUSPENDED`), modal tambah pengguna dinamis per role, modal ganti status, modal reset password. Data lokal `INITIAL_USERS` (1.315 baris kode).
   - **Master Mata Kuliah (`/admin/courses`):** tabel + modal CRUD (Kode MK, Nama, SKS 1–6, deskripsi).
   - **Pembukaan Kelas (`/admin/classes`):** tabel penawaran kelas + modal buka kelas (Mata Kuliah, Dosen Pengampu, kode kelas, tahun akademik, semester, kapasitas).
   - *Status API:* `adminApi` (courses/classes/users) **sudah tersedia** di `services/api.ts` tetapi **belum dipanggil** dari komponen — data komponen masih *fixture*.
6. **Modul Direct Enrollment (Admin — BR-002) — ✅ UI Selesai:**
   - `/admin/enrollments`: selector kelas + indikator kapasitas, **layout dua panel**: panel *Enrolled Students* (pencarian, filter, pagination, tombol Unenroll + modal konfirmasi) dan panel *Available Students* (*multi-select checkbox*, sticky bar **"Terpilih: N Mahasiswa"**, tombol **"Daftarkan Terpilih (Batch Enroll)"**, banner peringatan melebihi sisa kuota).
   - Data masih *fixture* (`INITIAL_CLASSES`, `INITIAL_AVAILABLE`).
7. **Modul Jejak Audit (`/admin/audit-logs`) — ✅ UI Selesai:**
   - Tabel log + filter (tanggal/aksi/entitas/aktor), pagination, dan **Modal JSON Diff Inspector** side-by-side: "Nilai Lama (Old Values)" vs "Nilai Baru (Nilai Baru)" dengan format monospace.
8. **Halaman Pendukung Lain — ⚠️ Parsial:**
   - **Status Presensi (`/status-presensi`)** — mahasiswa, 4 state eksplisit (Locked / Open / Hadir terkonfirmasi / Alpa) sesuai BR-010 & BR-011: **✅ selesai** (814 baris; ini adalah satu-satunya modul konversi awal dari desain MVP 2).
   - Rute `kelas-saya`, `panduan-belajar`, `central-timeline`, `rekap-nilai-dan-presensi`, `pemeriksaan-tugas`, `konfigurasi-sistem` **terdaftar tetapi belum punya halaman khusus** (merender dasbor default) — di luar lingkup MVP 1 / menunggu MVP 2+.
9. **Error Handling, States & Responsive UI — ⏳ Sebagian:**
   - Responsif: drawer sidebar (toggle `translate-x`), breakpoint `md:`/`lg:` pada Header — **sebagian**; audit menyeluruh 375px belum.
   - Skeleton shimmer, empty state terstruktur, React Error Boundary, halaman kustom 401/403/404/500: **❌ belum**.

### 1.4 Status Design Handoff (Google Stitch)

| Dokumen Desain | Fase | Status | Implikasi untuk Frontend |
|---|---|:---:|---|
| [DESIGN_INSTRUCTIONS_MVP1_UIUX.md](DESIGN_INSTRUCTIONS_MVP1_UIUX.md) | 6 fase (tokens → UI kit → auth/shell/profil → dasbor → modul admin → states/error) | ✅ **Selesai (Delivered)** | Seluruh input HTML MVP 1 tersedia; konversi Fase 1–5 telah dikerjakan, **konversi Fase 6 (states & error suite) menyusul** |
| [DESIGN_INSTRUCTIONS_MVP2_UIUX.md](DESIGN_INSTRUCTIONS_MVP2_UIUX.md) | 6 fase (reaktivasi konteks → ekstensi UI kit → ruang kelas 16 pertemuan → materi → presensi & rekap → states/WCAG/handoff) | ✅ **Selesai (Delivered)** | Siap dikonversi pada tahap berikutnya (Ruang Kelas, Materi, Presensi, Rekapitulasi). Konversi awal: `StatusPresensi.jsx`. Dokumen rencana terpisah menyusul |

---

## 2. Tech Stack & Rationale (Aktual vs Rencana Awal)

Tabel berikut mencerminkan **stack yang benar-benar terpasang di repository** beserta deviasi yang direkam dari rencana awal:

| Layer / Kebutuhan | Pilihan Aktual | Versi | Status | Catatan Deviasi / Rationale |
|---|---|---|:---:|---|
| **Build Tool & Framework** | Vite + React | React 18.2 / Vite 5 | ✅ | Sesuai rencana; HMR sub-detik |
| **Bahasa Pemrograman** | JavaScript (JSX) + TypeScript parsial | TS aktif di `services/`, `stores/`, `utils/` | ⚠️ | Komponen dikonversi sebagai `.jsx` agar sinkron dengan ekspor HTML Stitch; `tsconfig.json` tersedia tetapi belum ada skrip `typecheck`. Menyusul |
| **CSS Framework** | Tailwind CSS | 3.4.1 | ✅ | Token kustom di `tailwind.config.js` (palet permukaan, spasi, tipografi Plus Jakarta Sans/Inter/JetBrains Mono) |
| **Ikonografi** | Material Symbols Outlined (Google Fonts) | — | ✅ | Pengganti inline SVG Stitch & rencana Lucide React; *tree-shaking* tidak berlaku (font) |
| **Routing & Navigasi** | Router query-string custom (`?page=`, `?role=`) di `App.jsx` | — | ✅ | **Bukan React Router** — whitelist rute + `pushState`/`popstate`; navigasi mempertahankan param `role`. RBAC penuh (guard 403) menyusul |
| **Client / Global State** | `authStore` kompatibel-Zustand via `useSyncExternalStore` | Tanpa dependensi eksternal | ✅ | API mirip Zustand (`useAuthStore(selector)`, `getState`, `setState`); alasan: minimalis tanpa boilerplate |
| **HTTP Client** | Axios (`services/api.ts`) | 1.20 | ✅ | Instance `apiClient` (baseURL `/api`, timeout 15s, interceptor injeksi `Bearer`); klien `dosenApi` & `adminApi` tersedia. **Silent refresh: menyusul** |
| **Server State & Caching** | `useEffect` + state lokal / fixture | — | ⚠️ | TanStack Query **belum dipakai**; data komponen mayoritas masih fixture. Menyusul bersama integrasi API |
| **Form & Validasi** | State manual React | — | ⚠️ | React Hook Form + Zod **belum dipakai**; validasi inline per halaman. Menyusul |
| **UI Primitives / Headless** | Komponen bespoke (inline Tailwind) | — | ⚠️ | Radix/shadcn belum dipakai; atom reusable yang ada: `Toast`, `Breadcrumb`, kartu, tabel inline |
| **Animasi & Transisi** | Utility Tailwind kustom | — | ⚠️ | `tailwindcss-animate` belum terpasang |
| **Format Waktu & Tanggal** | Formatter lokal (mis. `features/mahasiswa`) | — | ⚠️ | `date-fns` belum dipakai |
| **Testing Suite** | — | — | ❌ | Vitest + React Testing Library **belum terpasang** — item Fase 6 |

---

## 3. Workflow Kolaborasi: Stitch HTML-to-React Conversion Pipeline

Seluruh pengerjaan antarmuka frontend mengadopsi alur terstruktur dari berkas HTML hasil Google Stitch (MVP 1 & MVP 2 sudah Delivered) menjadi kode React:

```text
┌────────────────────────────────────────────────────────────────────────┐
│ TIM UI/UX DESIGNER (Google Stitch) — STATUS: 6/6 FASE MVP 1 ✅ &      │
│ 6/6 FASE MVP 2 ✅ (Delivered)                                         │
│ 1. Prompt terstruktur sesuai Fase di DESIGN_INSTRUCTIONS_MVP{1,2}_UIUX │
│ 2. Visual High-Fidelity & layout responsif                            │
│ 3. Ekspor berkas HTML Semantik + kelas Tailwind CSS                   │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ (Handoff Berkas HTML — tidak disimpan
                                    │  sebagai folder terpisah di repo)
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│ TIM FRONTEND DEVELOPER (React Conversion)                             │
│ 1. Parsing & Destrukturisasi: memecah HTML menjadi komponen React     │
│    (.jsx) di src/components/ dan src/features/ per modul              │
│ 2. Harmonisasi Styling: utility class Tailwind diselaraskan dengan    │
│    design tokens di tailwind.config.js                                │
│ 3. Ikonografi: inline SVG Stitch → Material Symbols Outlined          │
│ 4. State & Interaktivitas: state lokal + authStore (useSyncExternal-  │
│    Store) + modal & toast                                             │
│ 5. Binding Data: fixture lokal → transisi bertahap ke apiClient/      │
│    dosenApi/adminApi                                                  │
│ 6. Feedback States: loading lokal; skeleton/error suite menyusul      │
└────────────────────────────────────────────────────────────────────────┘
```

### Standar Konversi HTML Stitch ke Komponen React (berlaku):
1. **Penyesuaian Sintaksis JSX:** `class` → `className`, `for` → `htmlFor`, style inline dieliminasi ke utilitas Tailwind.
2. **Ekstraksi Komponen:** potongan berulang dikeluarkan ke `src/components/` (AppShell, Header, Sidebar, Breadcrumb, kartu-kartu dasbor) atau `src/features/<modul>/`.
3. **Penggantian Inline SVG:** seluruh SVG mentah Stitch diganti Material Symbols (font ikon) sesuai `index.html`.
4. **Binding Dinamis:** teks/dummy HTML diganti state & props React; transisi ke data API bertahap.
5. **Struktur Halaman:** setiap rute memiliki wrapper tipis di `src/pages/` yang mendelegasikan ke komponen fitur di `src/features/`.

---

## 4. Struktur Direktori Proyek Frontend (Aktual)

```text
frontend/
├── index.html                       # Template SPA: font token (Plus Jakarta Sans/Inter/
│                                    #   JetBrains Mono) + Material Symbols + class dark
├── package.json                     # Deps: react, react-dom, axios | Dev: vite, tailwind
├── tsconfig.json / tsconfig.node.json
├── vite.config.js                   # Alias @/*, @features/*; port 5173; proxy /api → :5000
├── tailwind.config.js               # Design tokens (palet permukaan, spasi, tipografi)
├── postcss.config.js
├── dist/                            # Output build produksi (✅ tergenerasi)
│
└── src/                             # 45 berkas sumber React (JSX + TS parsial)
    ├── main.jsx                     # Entry point
    ├── App.jsx                      # Router query-string (?page=, ?role=) + whitelist
    │                                #   ROUTES/SPECIAL_ROUTES + komposisi halaman
    ├── index.css                    # Tailwind base + reset global
    │
    ├── components/                  # Komponen global hasil konversi Stitch
    │   ├── AppShell.jsx             # Shell tunggal: Header + Sidebar + ChangePasswordModal
    │   │                            #   + Toast + logout API (RBAC sidebar)
    │   ├── Header.jsx               # Topbar: logo, badge semester, search, notifikasi,
    │   │                            #   dropdown profil (Profil/Ganti Sandi/Keluar)
    │   ├── Sidebar.jsx              # Sidebar 260px, drawer toggle, menu per peran
    │   ├── Breadcrumb.jsx           # Navigasi kontekstual
    │   ├── GreetingBanner.jsx       # Sambutan dasbor mahasiswa
    │   ├── SummaryCards.jsx         # Kartu ringkasan akademik
    │   ├── CourseCards.jsx          # Grid kartu kelas perkuliahan
    │   ├── AnnouncementBanner.jsx   # Banner info operasional
    │   ├── AssignmentWidget.jsx     # Widget tugas (mini timeline)
    │   └── AttendanceWidget.jsx     # Widget presensi kilat
    │
    ├── features/                    # Modul fitur bisnis (Feature-Driven)
    │   ├── auth/
    │   │   ├── ForgotPassword.jsx   # /forgot-password — UI ✅, API simulasi (TODO)
    │   │   └── ChangePasswordModal.jsx # ✅ terintegrasi PUT /profile/password
    │   ├── shell/
    │   │   ├── AppShellGlobal.jsx   # Varian shell global
    │   │   └── fixtures.js          # navSections RBAC + data mock dasbor
    │   ├── mahasiswa/
    │   │   └── StatusPresensi.jsx   # 4 state presensi BR-010/BR-011 (konversi MVP 2 awal)
    │   ├── dosen/
    │   │   └── DasborDosen.jsx      # ✅ terintegrasi dosenApi (dengan fallback)
    │   ├── admin/
    │   │   ├── DasborAdmin.jsx      # 4 metrik, quick shortcuts, snapshot audit
    │   │   ├── ManajemenPengguna.jsx# Tabel + filter + pagination + 3 modal (1.315 baris)
    │   │   ├── MasterMataKuliah.jsx # Tabel + modal CRUD mata kuliah
    │   │   ├── PembukaanKelas.jsx   # Tabel + modal buka kelas
    │   │   ├── DirectEnrollment.jsx # Split-view BR-002 + batch enroll (1.200 baris)
    │   │   └── JejakAudit.jsx       # Tabel log + JSON Diff Inspector
    │   ├── components/Toast.jsx     # Notifikasi toast bersama
    │   ├── hooks/useToast.js        # Hook toast + shortcut keyboard
    │   └── utils/uuid.js            # Generator ID berprefix
    │
    ├── pages/                       # Wrapper halaman per rute (11 halaman)
    │   ├── Login.jsx                # ✅ UI login (mock auth saat ini)
    │   ├── ForgotPassword.jsx, AppShellGlobal.jsx, DasborDosen.jsx, DasborAdmin.jsx
    │   ├── ManajemenPengguna.jsx, MasterMataKuliah.jsx, PembukaanKelas.jsx
    │   ├── DirectEnrollment.jsx, JejakAudit.jsx, StatusPresensi.jsx
    │
    ├── services/api.ts              # Axios apiClient + interceptor Bearer + dosenApi +
    │                                #   adminApi (courses, classes, users) — silent refresh ⏳
    ├── stores/authStore.ts          # Store sesi via useSyncExternalStore (token di
    │                                #   localStorage, normalisasi role RBAC)
    ├── hooks/useToast.js
    └── utils/                       # cn.ts (clsx+tw-merge util), uuid.js
```

**Selisih terhadap struktur rencana awal (direkam):** `layouts/`, `routes/`, `types/`, `assets/`, `components/ui/`, dan `stitch-handoff/` **belum dibentuk**; layout terkonsolidasi di `AppShell.jsx`, routing di `App.jsx`, atom UI masih inline per halaman.

---

## 5. Arsitektur Sesi, HTTP & RBAC Guard (Aktual)

### 5.1 Store Sesi (`stores/authStore.ts`)
1. **Access token** disimpan di `localStorage` (`access_token`) dan dibaca ulang saat muat aplikasi.
2. Store dibangun di atas `useSyncExternalStore` React dengan API kompatibel-Zustand (`useAuthStore(selector)`, `useAuthStore.getState()`, `.setState()`, `.subscribe()`) tanpa dependensi eksternal.
3. Normalisasi peran (`MAHASISWA`/`DOSEN`/`ADMIN` → `mahasiswa`/`dosen`/`admin`) via `getCurrentRole()`.
4. `logout()` membersihkan `access_token` + `refresh_token`.

### 5.2 HTTP Client (`services/api.ts`) — Status: **sebagian**
```typescript
export const apiClient = axios.create({
  baseURL: '/api',
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});
// Request interceptor: injeksi Authorization Bearer dari localStorage
// Response interceptor: (saat ini hanya reject) — silent refresh & queue MENYUSUL
```
- Klien siap pakai: **`dosenApi`** (classes, dashboard/metrics, grading/pending, attendance) dan **`adminApi`** (courses CRUD, classes CRUD, users).
- **Rencana (Fase 6 / sisa kerja):** melengkapi interceptor *silent refresh* dengan mutex + antrean request (pola `isRefreshing`/`failedQueue` seperti pada rencana awal §5.1 versi lama), redirect `/login?expired=1` saat refresh gagal.

### 5.3 Routing Terproteksi Berbasis Peran (Aktual — query-string router)
- `App.jsx` mendaftarkan `ROUTES` (dasbor-mahasiswa, dasbor-dosen, status-presensi, seluruh modul admin, dsb.) dan `SPECIAL_ROUTES` (`login`, `forgot-password`) — rute tak dikenal di-redirect ke dasbor.
- Navigasi: `navigateTo()` → `pushState('?page=...')`, mempertahankan `?role=` aktif; `popstate` didengarkan.
- **Peran:** `?role=mahasiswa|dosen|admin` (role switcher UI). RBAC aktual dieksekusi dengan:
  - **Penyaringan menu Sidebar** sesuai `navSections` per peran di `fixtures.js`;
  - **Pembungkusan halaman** — modul admin dirender melalui `AppShell activeRole="admin"` (mis. wrapper `pages/DirectEnrollment.jsx`);
  - **Guard token**: `authStore` + logout yang membersihkan sesi.
  - *Menyusul:* redirect otomatis ke `/login` saat token absen dan halaman **403** untuk peran yang tidak berwenang (padanan `ProtectedRoute`/`RoleGuard`).

### 5.4 Ganti Password & Logout (✅ Terintegrasi)
- `ChangePasswordModal` (dibuka dari Header): `PUT /api/profile/password` dengan fallback `PUT /api/auth/change-password`.
- `AppShell.handleLogout`: `POST /api/auth/logout` (diabaikan bila gagal) → `authStore.logout()` → bersihkan token → toast konfirmasi.

---

## 6. Pemetaan Rute Frontend ke Endpoint Backend MVP 1 (Dengan Status Integrasi)

| Halaman Frontend | Rute | Metode | Endpoint Backend | Status Integrasi |
|---|---|---|---|:---:|
| **Login Portal** | `/login` (`?page=login`) | `POST` | `/api/auth/login` | ⏳ UI siap, *mock login* (belum memanggil API) |
| **Lupa Password** | `/forgot-password` | `POST` | `/api/auth/forgot-password` | ⏳ UI siap, API disimulasikan (komentar `TODO`) |
| **Profil & Biodata** | `/profile` | `GET` | `/api/profile` | ❌ Halaman belum ada |
| **Perbarui Profil** | `/profile` | `PUT` | `/api/profile` | ❌ Halaman belum ada |
| **Upload Avatar** | `/profile` | `POST` | `/api/profile/avatar` | ❌ Halaman belum ada |
| **Ganti Password** | Modal Header (→ nanti `/profile`) | `PUT` | `/api/profile/password` | ✅ Terintegrasi (fallback `/api/auth/change-password`) |
| **Logout Sesi** | Dropdown Header | `POST` | `/api/auth/logout` | ✅ Terintegrasi |
| **Dasbor Dosen** | `?page=dasbor-dosen` | `GET` | `/api/dosen/dashboard/metrics`, `/api/dosen/classes`, dst. | ⚠️ Terpanggil, jatuh ke *fallback* (endpoint backend belum tersedia di `main`) |
| **Dasbor Admin** | `?page=dasbor-mahasiswa` (role=admin) | `GET` | `/api/dashboard` (rencana) | ⏳ UI siap, data lokal (`adminApi` siap dipakai) |
| **Dasbor Mahasiswa** | `?page=dasbor-mahasiswa` | `GET` | `/api/dashboard` | ⏳ Data fixture (`fixtures.js`, `CourseCards`) |
| **Status Presensi** | `?page=status-presensi` | `GET`/`POST` | endpoint presensi (MVP 2) | ⏳ UI 4-state siap, data lokal |
| **Kelola Pengguna** | `?page=manajemen-pengguna` | `GET`, `POST` | `/api/admin/users` | ⏳ UI + `adminApi.getUsers` siap, belum dipanggil |
| **Status / Reset Password User** | modal di `/admin/users` | `PATCH`, `PUT` | `/api/admin/users/:id/status`, `/reset-password` | ⏳ UI modal siap |
| **Master Mata Kuliah** | `?page=master-mata-kuliah` | `GET`, `POST`, `PUT`, `DELETE` | `/api/admin/courses[/:id]` | ⏳ UI + `adminApi` CRUD siap |
| **Master Kelas** | `?page=pembukaan-kelas` | `GET`, `POST`, `PUT`, `DELETE` | `/api/admin/classes[/:id]` | ⏳ UI + `adminApi` CRUD siap |
| **Enrolled / Available / Enroll / Unenroll** | `?page=direct-enrollment` | `GET`, `POST`, `DELETE` | `/api/admin/classes/:classId/enrollments`, `/available-students`, `/api/admin/enrollments[/:id]` | ⏳ UI split-view + batch siap, data fixture |
| **Peninjau Audit + JSON Diff** | `?page=jejak-audit` | `GET` | `/api/admin/audit-logs[/:id]` | ⏳ UI + Diff Inspector siap, data fixture |

**Catatan backend:** endpoint Fase 5 (enrollments & dashboard) saat ini berada pada branch terpisah (`feat/backend-fase-5-direct-enrollment-dashboard`) — sinkronisasi kontrak API menjadi prasyarat integrasi (rujuk [QA_TESTING_GUIDE.md](QA_TESTING_GUIDE.md) §2.3).

---

## 7. Rencana Eksekusi Bertahap 6 Fase — Status Realisasi (Penyelarasan dengan Google Stitch)

> **Acuan desain:** seluruh fase desain MVP 1 **dan** MVP 2 di Google Stitch sudah **Selesai (Delivered)**. Konversi frontend mengikuti urutan fase di bawah ini; input HTML per fase berasal dari `DESIGN_INSTRUCTIONS_MVP1_UIUX.md` (dan untuk kelanjutan, `DESIGN_INSTRUCTIONS_MVP2_UIUX.md`).

```text
Fase 1: Setup Workspace & Arsitektur ................................. ✅ Selesai
Fase 2: Konversi UI Kit Primitives .................................. ⚠️ Sebagian
Fase 3: Autentikasi (Dark Navy), App Shell & Profil ................. ⚠️ Sebagian
Fase 4: Dasbor Kontekstual 3 Peran & Mobile 375px ................... ✅ Selesai
Fase 5: Modul Admin (Master Data, BR-002, Audit) .................... ⚠️ UI ✅ / API ⏳
Fase 6: States/Error, WCAG, Testing & Build Verification ........... ⚠️ Parsial
```

---

### 🚀 Fase 1: Setup Workspace Frontend, Tooling, Proxy Dev Server & Arsitektur Handoff

* **Status: ✅ Selesai**
* **Korelasi Desain:** Fase 1.1 & 1.2 `DESIGN_INSTRUCTIONS_MVP1_UIUX.md` — **✅ desain Delivered** (master context, sitemap ber-*role badge*).
* **Realisasi di Repository:**
  1. Project Vite React (template `react-ts`) di `frontend/` — komponen dikembangkan sebagai `.jsx`.
  2. Alias `@/*` & `@features/*` terkonfigurasi di `vite.config.js` + `tsconfig.json`.
  3. Reverse proxy `/api` → `http://localhost:5000` (port dev `5173`) ✅.
  4. Tailwind CSS 3.4 + `postcss`/`autoprefixer` terpasang; `tailwind.config.js` memuat design tokens (palet permukaan, radius, spacing, fontFamily Plus Jakarta Sans / Inter / JetBrains Mono) ✅.
  5. Dependensi runtime terpasang: `axios`, `react`, `react-dom`.
  6. Routing skeleton berupa query-string router di `App.jsx` dengan whitelist rute ✅.
* **Selisih / Menyusul:** folder `stitch-handoff/` tidak dipertahankan (HTML dikonversi langsung); `vitest`/Testing Library & `tailwindcss-animate` belum terpasang; skrip `typecheck` belum ada.

---

### 🎨 Fase 2: Konversi HTML UI Kit Primitives ke Komponen React

* **Status: ⚠️ Sebagian (terpenuhi per kebutuhan halaman)**
* **Korelasi Desain:** Fase 2.1 (Atoms) & 2.2 (Molecules) — **✅ desain Delivered** (katalog Button, Input, Badge, Stat Card, Filter Bar, Pagination, Toast).
* **Realisasi di Repository:**
  - Toast notifikasi (`features/components/Toast.jsx` + `hooks/useToast.js`) ✅.
  - Breadcrumb (`components/Breadcrumb.jsx`) ✅.
  - Stat/summary cards, kartu kelas, banner, widget ✅ (inline Tailwind mengikuti token).
  - Tabel data, pagination bar, filter bar, modal — direalisasikan **inline** di dalam tiap modul admin (`ManajemenPengguna`, `DirectEnrollment`, `JejakAudit`, dsb.).
* **Selisih / Menyusul:** pustaka atom terpusat `src/components/ui/` (button, input, select, checkbox, badge, skeleton, dll.) belum dibentuk — pilihan implementasi berbeda dari rencana awal; atom perlu diekstraksi ulang saat konversi Fase 6 & MVP 2 agar tidak terduplikasi.

---

### 🔐 Fase 3: Konversi HTML Autentikasi (Dark Navy), App Shell & Profil Mandiri

* **Status: ⚠️ Sebagian (Shell ✅, Auth UI ✅, Profil ❌)**
* **Korelasi Desain:** Fase 3.1–3.4 — **✅ desain Delivered** (`login.html`, `forgot-password.html`, `app-shell.html`, `profile.html`).
* **Realisasi di Repository:**
  1. **Portal Login (`/login`)** — `pages/Login.jsx` + `features/auth`: form multi-kredensial, indikator loading, pesan error role alert. *Mock login* (belum `POST /api/auth/login`).
  2. **Lupa Password (`/forgot-password`)** — `features/auth/ForgotPassword.jsx`: centered card, cooldown kirim ulang, navigasi kembali ke login. *Simulasi API*.
  3. **App Shell** — `components/AppShell.jsx` + `Header.jsx` + `Sidebar.jsx`:
     - Topbar sticky: logo, **badge "🟢 Semester Ganjil 2026/2027"**, search, notifikasi, dropdown profil (Profil Saya, Ganti Kata Sandi, Keluar) ✅.
     - Sidebar 260px adaptif 3 peran + drawer toggle ✅.
     - `ChangePasswordModal` (meter kekuatan) terhubung API ✅.
     - Logout terhubung API ✅.
  4. **Profil (`/profile`)** — ❌ **belum dikerjakan** (lihat §1.3 butir 4).
* **Menyusul:** implementasi API login & forgot-password; halaman `/profile` (biodata, avatar ≤2MB, tab keamanan).

---

### 📊 Fase 4: Konversi HTML Dasbor Kontekstual 3 Peran & Adaptasi Mobile

* **Status: ✅ Selesai**
* **Korelasi Desain:** Fase 4.1–4.4 — **✅ desain Delivered** (dasbor Mahasiswa/Dosen/Admin + mobile 375px).
* **Realisasi di Repository:**
  1. **Dasbor Mahasiswa** — `GreetingBanner`, `SummaryCards`, `CourseCards` (badge kelas/SKS, dosen, tombol buka kelas), `AnnouncementBanner`, `AssignmentWidget`, `AttendanceWidget` ✅.
  2. **Dasbor Dosen** — `features/dosen/DasborDosen.jsx`: sambutan + NIDN, 3 metrik pengajaran, daftar kelas ber-kuota; **integrasi `dosenApi`** dengan fallback ✅.
  3. **Dasbor Admin** — `features/admin/DasborAdmin.jsx`: 4 kartu metrik, *Quick Shortcuts*, snapshot 5 log audit + filter ✅.
  4. **Halaman Pendukung** — `StatusPresensi` (4 state presensi, BR-010/BR-011) ✅.
  5. **Responsivitas** — sidebar drawer (toggle `translate-x`), breakpoint `md:`/`lg:` Header ✅ (audit 375px menyeluruh menyusul).
* **Menyusul:** halaman `kelas-saya`/`panduan-belajar` (scaffold rute sudah ada), penggantian fixture dasbor dengan `GET /api/dashboard`.

---

### 👥 Fase 5: Konversi HTML Modul Admin (Master Data, Direct Enrollment BR-002 & Audit)

* **Status: ⚠️ UI Selesai / Integrasi API Menyusul**
* **Korelasi Desain:** Fase 5.1–5.4 — **✅ desain Delivered** (`users.html`, `courses-classes.html`, `direct-enrollment.html`, `audit-logs.html`).
* **Realisasi di Repository:**
  1. **Manajemen Pengguna** — `ManajemenPengguna.jsx` (1.315 baris): pencarian multi-kolom, filter role/status, pagination + baris-per-halaman, modal tambah pengguna dinamis per role, modal ganti status, modal reset password, toast ✅.
  2. **Master Mata Kuliah & Pembukaan Kelas** — `MasterMataKuliah.jsx` (806) & `PembukaanKelas.jsx` (883): tabel + modal CRUD (SKS 1–6, kombobox dosen, semester, kapasitas) ✅.
  3. **Direct Enrollment (BR-002)** — `DirectEnrollment.jsx` (1.200 baris): selector kelas + meter kapasitas, **split-view** Enrolled (pencarian, filter, pagination, Unenroll + konfirmasi destruktif) vs Available (*multi-select*, sticky bar *"Terpilih: N Mahasiswa"*, tombol **Batch Enroll**, peringatan melebihi sisa kuota), tombol impor CSV ✅.
  4. **Jejak Audit** — `JejakAudit.jsx` (726 baris): filter (tanggal/aksi/entitas/aktor), tabel log, **JSON Diff Inspector** side-by-side Old vs New Values ✅.
* **Menyusul:** penggantian seluruh *fixture* lokal dengan pemanggilan `adminApi.*` (endpoint sudah disiapkan di `services/api.ts`) + sinkronisasi kontrak dengan backend Fase 5.

---

### ✨ Fase 6: Konversi HTML Status Batas, Error Boundary, Pengujian & Build Verification

* **Status: ⚠️ Parsial — baru Build Verification ✅**
* **Korelasi Desain:** Fase 6.1–6.4 `DESIGN_INSTRUCTIONS_MVP1_UIUX.md` — **✅ desain Delivered** (skeleton, empty states, error 401/403/404/500, ekspor Tailwind + React JSX).
* **Realisasi di Repository:**
  - **Build Verification:** `npm run build` sukses (exit 0, 1 Nov 2026) → `frontend/dist/` ✅.
* **Menyusul (seluruhnya):**
  1. `Skeleton` shimmer & `EmptyState` (input desain Fase 6.1 sudah Delivered).
  2. Halaman error kustom **401 / 403 / 404 / 500** + `ErrorBoundary` (input desain Fase 6.2 sudah Delivered).
  3. Audit WCAG 2.1 AA (kontras 4.5:1, indikator non-warna, focus ring 2px, touch target 44px).
  4. Skrip `typecheck` (`tsc --noEmit`) + unit/integration test (Vitest + RTL).
  5. *Silent refresh interceptor* pada `services/api.ts` (§5.2).

---

## 8. Standar Penanganan Respon API & Kesalahan (Berlaku untuk Sisa Integrasi)

```typescript
// src/types/api.types.ts (belum dibentuk — menyusul bersama integrasi API)
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  meta?: { page: number; limit: number; total: number; totalPages: number };
}

export interface ApiError {
  success: false;
  message: string;
  errors?: Array<{ field: string; message: string }>;
}
```

### Standar User Feedback saat Terjadi Error:
1. **Validasi Form (HTTP 400):** pesan `errors` backend dipetakan ke field terkait (outline merah + teks bantuan).
2. **Sesi Kedaluwarsa (HTTP 401):** interceptor mencoba *silent refresh*; bila gagal → toast/modal sesi berakhir + redirect `/login?expired=1`.
3. **Hak Akses (HTTP 403):** toast merah *"Akses Ditolak: Anda tidak memiliki wewenang untuk menjalankan aksi ini."* (+ halaman 403).
4. **Konflik Data (HTTP 409):** toast peringatan oranye *"Data Duplikat: Identitas, kode mata kuliah, atau NIM/NIDN sudah terdaftar di sistem."*
5. **Server (HTTP 500):** toast merah *"Terjadi kendala teknis pada server SPADA. Silakan coba beberapa saat lagi."*

---

## 9. Kriteria Penerimaan & Definisi Selesai (DoD) — Status Aktual

| # | Kriteria | Status | Catatan |
|---|---|:---:|---|
| 1 | **Kepatuhan Fungsional 3 Peran** | ⚠️ | Menu & halaman per peran berfungsi (RBAC sidebar + wrapper `activeRole`); autentikasi masih *mock* sehingga *guard* token penuh menyusul |
| 2 | **Konversi HTML Stitch MVP 1** | ⚠️ | Fase 1–5 terkonversi (11 halaman + modul admin); **Fase 6 (states/error) & halaman `/profile` belum** |
| 3 | **Integrasi API Riil** | ❌ | Baru: logout, ganti password, dasbor dosen (dengan fallback). Modul admin, login, dasbor mahasiswa masih *fixture* — `adminApi`/`dosenApi` siap dipakai |
| 4 | **Kesesuaian Desain & Tema Ganda** | ⚠️ | Token & tipografi sesuai desain; **permukaan aplikasi saat ini bertema gelap** — pemetaan eksplisit *Portal Dark-Navy* vs *Operasional Light Clean Surface* (`DESIGN_SYSTEM.md`) menyusul |
| 5 | **Direct Enrollment BR-002** | ⚠️ | UI split-view, batch enroll, meter kuota, konfirmasi unenroll **selesai**; belum terhubung backend |
| 6 | **Bebas Error Konsol** | ⏳ | Belum diverifikasi menyeluruh |
| 7 | **Type-Safe & Lolos Kompilasi** | ❌ | Komponen `.jsx`; belum ada skrip `typecheck` (TS aktif hanya pada 3 berkas utilitas) |
| 8 | **Responsif Multi-Device** | ⚠️ | Drawer sidebar + breakpoint Header/`md:`/`lg:` ada; audit 375px/768px/1440px menyeluruh belum |
| 9 | **WCAG 2.1 AA** | ⏳ | Belum diaudit |
| 10 | **Build Produksi Sukses** | ✅ | `npm run build` exit 0 (terverifikasi 1 Nov 2026), output di `frontend/dist/` |

---

## 10. Sisa Pekerjaan (Backlog Setelah Pembaruan Ini)

**Prioritas 1 — Integrasi API MVP 1:**
1. `POST /api/auth/login` (ganti mock) + penanganan akun `INACTIVE`/`SUSPENDED`; `POST /api/auth/forgot-password`.
2. Ganti seluruh *fixture* modul admin dengan `adminApi.*` (users, courses, classes, enrollments, audit-logs) + *silent refresh interceptor* di `api.ts`.
3. Halaman **`/profile`**: Tab Biodata (`GET`/`PUT /api/profile`), `AvatarUploader` (jpg/png ≤2MB), Tab Keamanan (turunkan `ChangePasswordModal` yang sudah terintegrasi).
4. Sinkronisasi kontrak endpoint Fase 5 (branch backend `feat/backend-fase-5-direct-enrollment-dashboard`).

**Prioritas 2 — Konversi Fase 6 (input desain sudah Delivered):**
5. Skeleton shimmer & EmptyState; halaman 401/403/404/500 + `ErrorBoundary`.
6. Audit WCAG 2.1 AA; responsif 375/768/1440px.

**Prioritas 3 — Quality Gates:**
7. Skrip `typecheck` + migrasi bertahap komponen ke TS; unit test (store, utils) & integration test (LoginForm, DirectEnrollment, UserTable) via Vitest + RTL.
8. Pemetaan tema dua permukaan `DESIGN_SYSTEM.md` (Portal Navy vs Operasional Light).

**Prioritas 4 — Konversi MVP 2 (desain ✅ Delivered):**
9. Ruang Kelas 16 pertemuan (akordeon P1–P16, badge UTS/UAS), Detail Pertemuan, Materi + Dropzone validasi (`.pdf/.docx/.xlsx/.zip` ≤10MB), Presensi (3 state sesi + koreksi dosen), Rekapitulasi Kehadiran + matriks 16 kolom — mengikuti pipeline §3; rencana eksekusi dicatat pada dokumen terpisah `IMPLEMENTATION_PLAN_MVP2_FRONTEND.md` (menyusul).

**Dokumen terkait:** [DESIGN_INSTRUCTIONS_MVP1_UIUX.md](DESIGN_INSTRUCTIONS_MVP1_UIUX.md) · [DESIGN_INSTRUCTIONS_MVP2_UIUX.md](DESIGN_INSTRUCTIONS_MVP2_UIUX.md) · [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md) · [IMPLEMENTATION_PLAN_MVP1_BACKEND.md](IMPLEMENTATION_PLAN_MVP1_BACKEND.md) · [QA_TESTING_GUIDE.md](QA_TESTING_GUIDE.md)