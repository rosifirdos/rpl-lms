# Implementation Plan: Frontend MVP 1
# E-Learning Kampus (Learning Management System) Universitas
**Team Membangun Negeri — Rencana Eksekusi Teknis Frontend: Fondasi, Autentikasi, Profil, Dasbor, Master Data & Direct Enrollment**

---

> **Dokumen ini menggantikan versi status 1 November 2026.** Seluruh catatan kondisi aktual dari versi lama telah diserap ke Bab 2. Fokus dokumen kini adalah **rencana eksekusi** yang dapat langsung dikerjakan, dengan papan status di Bab 10.
>
> **Acuan:** [PRD.md](PRD.md) (*Bab 2, 3, 5, 7 — MVP 1*), [SRS.md](SRS.md) (*Bab 3, 4, 10, 13, 21, 27, 28, 29*), [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md), [DESIGN_INSTRUCTIONS_MVP1_UIUX.md](DESIGN_INSTRUCTIONS_MVP1_UIUX.md), [DESIGN_INSTRUCTIONS_MVP2_UIUX.md](DESIGN_INSTRUCTIONS_MVP2_UIUX.md), [IMPLEMENTATION_PLAN_MVP1_BACKEND.md](IMPLEMENTATION_PLAN_MVP1_BACKEND.md), dan [backend/docs/openapi.yaml](backend/docs/openapi.yaml) **v1.4.1**.
>
> **Definisi MVP 1 (PRD Bab 7):** Fondasi, Autentikasi, Profil Pengguna & Direct Enrollment (Admin). Backend MVP 1 **sudah selesai dan teruji** (`npm test` 327/327); frontend MVP 1 masih **mock/parsial** dan menjadi fokus dokumen ini.

---

## 0. Protokol Pengerjaan & Tracking Progress (WAJIB untuk Agent)

### 0.1 Legenda Status

| Simbol | Arti |
|---|---|
| ⬜ | Belum dikerjakan |
| 🔄 | Sedang dikerjakan |
| ⏸️ | Tertunda / terblokir prasyarat |
| ✅ | Selesai & terverifikasi |

### 0.2 Kewajiban Agent per Fase

1. **Sebelum mulai:** baca Bab 3 (keputusan arsitektur), pastikan prasyarat fase terpenuhi, ubah status fase di Bab 10.1 menjadi `🔄` dan isi tanggal mulai.
2. **Saat mengerjakan:** centang `[x]` hanya untuk butir yang benar-benar selesai dan sudah diuji; catat deviasi pada baris log, jangan menghapus riwayat.
3. **Saat fase selesai:** jalankan `npm run typecheck`, `npm run test`, dan `npm run build`; ubah status fase menjadi `✅`; tambahkan **satu baris baru** di Bab 10.2.
4. **Aturan tambahan:** satu baris log = satu sesi kerja bermakna; jangan menandai `✅` bila masih ada butir `[ ]`, tes gagal, atau build gagal.

### 0.3 Perintah Ringkas

```text
SEBELUM FASE : baca Bab 3 & 10 → cek prasyarat → set status 🔄 + tanggal mulai
SETELAH FASE : npm run typecheck && npm run test && npm run build
                → centang [x] → set status ✅ → tambahkan baris log 10.2
VERIFIKASI   : cd frontend; npm run typecheck; npm run test; npm run build
```

---

## 1. Tujuan & Ruang Lingkup MVP 1 (Frontend)

### 1.1 Tujuan

Menghubungkan seluruh antarmuka MVP 1 ke REST API backend sehingga tiga peran resmi (**Mahasiswa**, **Dosen**, **Admin**) dapat:

1. Login dengan identifier unik (username/email/NIM/NIDN/NIP), mempertahankan sesi, logout aman, dan memulihkan kata sandi.
2. Mengelola profil mandiri: biodata, kontak, bio, foto profil (JPG/PNG maks 2 MB), dan ganti kata sandi.
3. Melihat dasbor kontekstual sesuai peran dari `GET /api/dashboard`.
4. Admin mengelola akun pengguna, master mata kuliah, pembukaan kelas, konfigurasi kebijakan berkas, dan meninjau audit log.
5. Admin mendaftarkan/mencabut mahasiswa ke kelas secara langsung (*direct enrollment*) — individual maupun batch — tanpa alur KRS.

### 1.2 In-Scope

- Refactor fondasi frontend: routing path-based, auth provider, HTTP client dengan refresh, server-state, UI kit, testing.
- Halaman: Login, Lupa Password, Reset Password, Profil, Dasbor 3 peran, Manajemen Pengguna, Master Mata Kuliah, Pembukaan Kelas, Direct Enrollment, Jejak Audit (baca), Konfigurasi Sistem (kebijakan berkas).
- Guard RBAC, penanganan 401/403/404/409/413/500, skeleton/empty state, responsif 375/768/1440, WCAG 2.1 AA dasar.
- Integrasi penuh seluruh endpoint MVP 1 pada OpenAPI 1.4.1.

### 1.3 Out-of-Scope (MVP berikutnya)

- Ruang kelas 16 pertemuan, materi, presensi (MVP 2).
- Tugas, submission, penilaian 0–100 (MVP 3).
- Central Timeline, kuis, notifikasi in-app (MVP 4).
- UTS/UAS, gatekeeping, rekap nilai ekspor, progress belajar, audit monitoring lanjutan (MVP 5).
- Forum diskusi dan analitik lanjutan (pasca-MVP).

---

## 2. Kondisi Frontend Saat Ini & Gap Analysis

### 2.1 Inventaris Halaman Aktual

| Halaman | Berkas | Kondisi saat ini | Tindakan pada MVP 1 |
|---|---|---|---|
| Login | `pages/Login.jsx` | UI selesai, **mock login** (`login({ name, role })`) | Ganti dengan `POST /api/auth/login`, redirect per peran |
| Lupa Password | `features/auth/ForgotPassword.jsx` | UI selesai, API disimulasikan | Hubungkan `POST /api/auth/forgot-password` |
| Profil | `features/profile/Profile.jsx` | UI biodata/avatar/password, data fixture | Hubungkan `GET/PUT /profile`, `POST /profile/avatar`, `PUT /profile/password` |
| App Shell | `components/AppShell.jsx`, `Header.jsx`, `Sidebar.jsx` | Berfungsi, logout sudah API | Tambah guard, refresh sesi, pusat notifikasi (placeholder MVP 4) |
| Dasbor Mahasiswa | `App.jsx` (inline) + `components/*` | Fixture (`fixtures.js`, `AssignmentWidget`) | Hubungkan `GET /api/dashboard` |
| Dasbor Dosen | `features/dosen/DasborDosen.jsx` | Memanggil `/api/dosen/*` yang **tidak ada di backend** | Ganti ke `GET /api/dashboard` |
| Dasbor Admin | `features/admin/DasborAdmin.jsx` | Fixture | Hubungkan `GET /api/dashboard` |
| Manajemen Pengguna | `features/admin/ManajemenPengguna.jsx` | UI lengkap, data `INITIAL_USERS` | Hubungkan `GET/POST/PUT/PATCH/PUT reset` |
| Master Mata Kuliah | `features/admin/MasterMataKuliah.jsx` | UI lengkap, fixture | Hubungkan CRUD `/admin/courses` |
| Pembukaan Kelas | `features/admin/PembukaanKelas.jsx` | UI lengkap, fixture | Hubungkan CRUD `/admin/classes` |
| Direct Enrollment | `features/admin/DirectEnrollment.jsx` | Split-view lengkap, fixture | Hubungkan enrolled/available/enroll/unenroll |
| Jejak Audit | `features/admin/JejakAudit.jsx` | UI + JSON Diff, fixture | Hubungkan `/admin/audit-logs` |
| Konfigurasi Sistem | `features/admin/KonfigurasiSistem.jsx` | UI, fixture | Hubungkan `GET/PUT /admin/config` (kebijakan berkas; ambang ujian di MVP 5) |

### 2.2 Gap Teknis yang Menghambat Semua MVP

| # | Gap | Dampak | Rencana |
|---|---|---|---|
| G-01 | Router query-string (`?page=`) tidak mendukung deep link backend `/classes/:id/...` | Notifikasi/timeline MVP 4 tidak bisa membuka halaman | Migrasi ke React Router 6 (Fase 0) |
| G-02 | Tidak ada `ProtectedRoute`/`RoleGuard`; role hanya filter menu | Halaman admin dapat dibuka dengan `?role=admin` | Guard berbasis sesi + peran |
| G-03 | Access token hanya dari `localStorage`, tidak ada refresh | Sesi mati setelah token kedaluwarsa | Interceptor refresh + antrean request |
| G-04 | Semua data fitur masih fixture | Fitur tidak dapat dipakai riil | Ganti per halaman dengan TanStack Query |
| G-05 | Tidak ada UI kit terpusat | Duplikasi 1.000+ baris per modul | Ekstraksi `components/ui/` |
| G-06 | Tidak ada test/typecheck/lint | Regresi tidak terdeteksi | Vitest + RTL + MSW + Playwright |
| G-07 | Tidak ada skeleton/empty/error boundary | UX buruk saat jaringan lambat/gagal | Fase 6 |
| G-08 | Frontend memanggil `/api/dosen/*` yang tidak ada | Dasbor dosen selalu fallback | Ganti ke `/api/dashboard` |

---

## 3. Keputusan Arsitektur Frontend (Berlaku Lintas MVP)

### 3.1 Routing — React Router 6 (path-based)

- Semua rute memakai URL path nyata, bukan query string.
- Rute legacy `?page=kelas-saya&role=mahasiswa` diarahkan (redirect 301 di client) ke path baru agar bookmark lama tetap hidup.
- Rute final MVP 1:

```text
/login
/forgot-password
/reset-password?token=...
/dashboard
/profile
/admin/users
/admin/courses
/admin/classes
/admin/enrollments
/admin/audit-logs
/admin/config
/403
/404
```

- Rute MVP 2–5 ditambahkan bertahap: `/classes`, `/classes/:classId`, `/classes/:classId/meetings/:meetingId`, `/classes/:classId/assignments/:assignmentId`, `/classes/:classId/quizzes/:quizId`, `/timeline`, `/notifications`, `/classes/:classId/grade-recap`, dst.
- Path deep link backend **wajib** cocok dengan pola frontend: `/classes/:classId/assignments/:assignmentId`, `/classes/:classId/quizzes/:quizId`, `/classes/:classId/meetings`.

### 3.2 Server State — TanStack Query v5

- `QueryClientProvider` global; `staleTime` 30 detik untuk data master, 10 detik untuk dasbor.
- Pola kunci query: `['dashboard']`, `['users', filters]`, `['courses', filters]`, `['classes', filters]`, `['enrollments', classId]`, `['audit-logs', filters]`.
- Mutasi memakai `useMutation` + invalidasi query terkait + toast sukses/gagal.
- Tidak ada `useEffect` fetch manual di komponen baru.

### 3.3 HTTP Client — Axios + Refresh Queue

Lokasi target: `frontend/src/services/http.ts` dan `frontend/src/services/endpoints/*.ts`.

1. `baseURL: '/api'`, timeout 20 detik.
2. Request interceptor: sisipkan `Authorization: Bearer <accessToken>` dari auth store (memori).
3. Response interceptor:
   - `401` dan bukan request `/auth/*` → coba `POST /auth/refresh` satu kali dengan **mutex** (`isRefreshing`) dan **antrean** request (`failedQueue`).
   - Refresh sukses → ulangi request asli dengan token baru.
   - Refresh gagal → `authStore.logout()` + redirect `/login?expired=1`.
4. Normalisasi error menjadi `ApiError`:

```ts
export interface ApiEnvelope<T> {
  success: boolean;
  message: string;
  data: T;
  meta?: { page: number; limit: number; total: number; total_pages?: number; totalPages?: number };
}

export interface ApiError {
  status: number;
  message: string;
  errors?: Array<{ field: string; message: string; path?: string[] }>;
}
```

5. **Envelope backend:** seluruh respons memakai `data`; pagination berada di `meta`.
6. **Unduhan berkas** tidak boleh lewat JSON interceptor: gunakan `responseType: 'blob'` lalu ekstrak `Content-Disposition` untuk nama berkas.

### 3.4 Sesi & Penyimpanan Token

- `access_token` disimpan **di memori** (auth store), tidak di `localStorage`.
- `refresh_token` disimpan di `sessionStorage` (bertahan saat reload, hilang saat tab ditutup) untuk MVP 1; migrasi ke HttpOnly cookie dicatat sebagai technical debt bila backend menyediakannya.
- Saat aplikasi dimuat: jika ada refresh token → `POST /auth/refresh` untuk bootstrap sesi; jika gagal → tampilkan login tanpa error.
- Setelah login: simpan user (`id`, `username`, `email`, `role`, `profile.full_name`, `avatar`) dan token.
- Logout: `POST /auth/logout`, hapus state, bersihkan query cache, redirect `/login`.

### 3.5 Auth Store & Guard

- `stores/authStore.ts` diperluas: simpan `user`, `accessToken`, `refreshToken`, `status` (`booting|authenticated|anonymous`).
- `RequireAuth` membungkus seluruh rute privat.
- `RequireRole roles={['admin']}` membungkus rute admin; peran tidak sesuai → `/403`.
- Navigasi sidebar dibangkitkan dari matriks peran, bukan dari state UI yang dapat dimanipulasi.

### 3.6 Form & Validasi

- `react-hook-form` + `zodResolver`; skema Zod frontend mencerminkan aturan backend (mis. password minimal 8, SKS 1–6, kapasitas > 0, bobot 0–100).
- Error `400` dipetakan ke field berdasarkan `errors[].field`/`path`.
- Semua tombol submit: disable saat pending + spinner; konfirmasi untuk aksi destruktif.

### 3.7 UI Kit Terpusat

Buat `frontend/src/components/ui/`:

`Button`, `IconButton`, `Input`, `PasswordInput`, `Select`, `Textarea`, `Checkbox`, `RadioGroup`, `Badge`, `Modal`, `ConfirmDialog`, `Tabs`, `Table`, `Pagination`, `FilterBar`, `Skeleton`, `EmptyState`, `ErrorState`, `Alert`, `ProgressBar`, `FileDropzone`, `Dropdown`, `Toast` (pindahkan yang sudah ada).

Aturan: seluruh komponen memakai token `tailwind.config.js`, mendukung `disabled`, `aria-*`, dan focus ring 2px.

### 3.8 Format Tanggal & Waktu

- Gunakan `date-fns` dengan locale `id`; semua tampilan waktu mengikuti zona perangkat dan menampilkan label zona.
- Waktu dari server (`server_time`) dipakai untuk countdown (MVP 4) — jangan memakai jam perangkat untuk keputusan deadline.

### 3.9 Kualitas & Pengujian

- `npm run typecheck` → `tsc --noEmit` (bertahap; file `.jsx` boleh tetap, file baru `.tsx` bila memungkinkan).
- Unit/integration: Vitest + React Testing Library + MSW (mock API).
- E2E: Playwright untuk alur login → dasbor → admin CRUD → enrollment.
- `npm run build` wajib sukses sebelum fase ditandai selesai.

---

## 4. Matriks Kontrak API MVP 1

| Halaman | Aksi | Method & Endpoint | Peran | Catatan kontrak |
|---|---|---|---|---|
| Login | Masuk | `POST /auth/login` | Publik | Body `{ identifier, password }`; respons `{ accessToken, refreshToken, user }` (camelCase) |
| Sesi | Perpanjang | `POST /auth/refresh` | Publik (refresh token) | Body `{ refresh_token }` |
| Logout | Keluar | `POST /auth/logout` | Semua | Body `{ refresh_token }`; 200/204 |
| Lupa Password | Kirim tautan | `POST /auth/forgot-password` | Publik | Respons generik anti-enumerasi |
| Reset Password | Validasi token | `POST /auth/reset-password/validate` | Publik | Body `{ token }` (GET deprecated) |
| Reset Password | Simpan sandi | `POST /auth/reset-password` | Publik | Body `{ token, new_password }` |
| Profil | Baca | `GET /profile` | Semua | Profil + identitas per peran |
| Profil | Ubah | `PUT /profile` | Semua | `full_name`, `phone`, `bio`, dst. sesuai schema |
| Avatar | Unggah | `POST /profile/avatar` | Semua | Multipart `avatar`; JPG/JPEG/PNG ≤ 2 MB |
| Avatar | Tampil | `GET /profile/avatar` | Semua | Blob terautentikasi |
| Password | Ganti | `PUT /profile/password` | Semua | `{ current_password, new_password }` |
| Dasbor | Baca | `GET /dashboard` | Semua | Respons berbeda per peran |
| Pengguna | List/detail | `GET /admin/users`, `GET /admin/users/:id` | Admin | Filter `role`, `status`, `search`, pagination |
| Pengguna | Buat/ubah | `POST /admin/users`, `PUT /admin/users/:id` | Admin | Payload dinamis per role |
| Pengguna | Status | `PATCH /admin/users/:id/status` | Admin | `ACTIVE/INACTIVE/SUSPENDED` |
| Pengguna | Reset sandi | `PUT /admin/users/:id/reset-password` | Admin | Body `{ new_password }` |
| Mata kuliah | CRUD | `GET/POST/PUT/DELETE /admin/courses[/:id]` | Admin | SKS 1–6, kode unik |
| Kelas | CRUD | `GET/POST/PUT/DELETE /admin/classes[/:id]` | Admin | Dosen, tahun akademik, semester, kapasitas |
| Enrollment | Terdaftar | `GET /admin/classes/:classId/enrollments` | Admin | Pagination + pencarian |
| Enrollment | Tersedia | `GET /admin/classes/:classId/available-students` | Admin | Mahasiswa belum terdaftar |
| Enrollment | Daftarkan | `POST /admin/enrollments` | Admin | `{ class_id, student_ids: [] }` (batch) |
| Enrollment | Cabut | `DELETE /admin/enrollments/:id` | Admin | Konfirmasi destruktif |
| Audit | List/detail | `GET /admin/audit-logs`, `GET /admin/audit-logs/:id` | Admin | Filter aksi/entitas/aktor/tanggal |
| Config | Baca/ubah | `GET/PUT /admin/config` | Admin | MVP 1: ekstensi & ukuran berkas; ambang ujian di MVP 5 |

**Aturan integrasi:** jangan memakai endpoint yang tidak ada di OpenAPI. Endpoint lama `/api/dosen/*` dan `/api/admin/audit-logs` yang tidak sesuai kontrak harus diganti.

---

## 5. Struktur Berkas Target

```text
frontend/
├── src/
│   ├── App.tsx                        # Router + provider + route tree
│   ├── main.tsx
│   ├── routes/
│   │   ├── index.tsx                  # definisi rute
│   │   ├── RequireAuth.tsx
│   │   └── RequireRole.tsx
│   ├── providers/
│   │   ├── AppProviders.tsx           # QueryClient + Auth + Toast
│   │   └── AuthProvider.tsx           # bootstrap refresh, login/logout
│   ├── services/
│   │   ├── http.ts                    # axios + refresh queue + error normalizer
│   │   ├── storage.ts                 # sessionStorage helpers
│   │   └── endpoints/
│   │       ├── auth.ts
│   │       ├── profile.ts
│   │       ├── dashboard.ts
│   │       ├── users.ts
│   │       ├── courses.ts
│   │       ├── classes.ts
│   │       ├── enrollments.ts
│   │       ├── audit.ts
│   │       └── config.ts
│   ├── types/
│   │   ├── api.ts
│   │   ├── auth.ts
│   │   ├── dashboard.ts
│   │   └── master-data.ts
│   ├── components/
│   │   ├── ui/                        # kit terpusat
│   │   ├── AppShell.tsx
│   │   ├── Header.tsx
│   │   ├── Sidebar.tsx
│   │   └── ...
│   ├── features/
│   │   ├── auth/
│   │   │   ├── LoginPage.tsx
│   │   │   ├── ForgotPasswordPage.tsx
│   │   │   └── ResetPasswordPage.tsx
│   │   ├── profile/
│   │   ├── dashboard/
│   │   │   ├── MahasiswaDashboard.tsx
│   │   │   ├── DosenDashboard.tsx
│   │   │   └── AdminDashboard.tsx
│   │   ├── admin/
│   │   │   ├── users/
│   │   │   ├── courses/
│   │   │   ├── classes/
│   │   │   ├── enrollments/
│   │   │   ├── audit/
│   │   │   └── config/
│   │   └── shell/
│   ├── hooks/
│   │   ├── queries/
│   │   └── mutations/
│   └── lib/
│       ├── format.ts
│       └── validation.ts
└── tests/
    ├── unit/
    ├── integration/
    └── e2e/
```

**Prinsip:** `pages/` lama dipertahankan sebagai wrapper tipis selama migrasi, lalu dihapus setelah rute baru stabil.

---

## 6. Fase Eksekusi

### 6.0 Prioritas Fase (Ringkasan)

| Fase | Prioritas | Prasyarat | Dapat paralel dengan | Catatan |
|---|---|---|---|---|
| 0 — Fondasi | **P0** | — | — | Akar semua MVP; jangan dilewati |
| 1 — Autentikasi & Sesi | **P0** | Fase 0 | — | Blocker seluruh rute privat |
| 2 — Shell, RBAC & Profil | **P0** | Fase 1 | — | Blocker MVP 2–5 |
| 3 — Dasbor 3 Peran | **P1** | Fase 2 | Fase 4 | Nilai inti; tidak memblokir modul lain |
| 4 — Master Data Admin | **P1** | Fase 2 | Fase 3 | Modul users/courses/classes/config independen satu sama lain |
| 5 — Enrollment & Audit | **P1** | Fase 4 (enrollment), Fase 2 (audit) | Fase 6 | Audit dapat dimulai sebelum enrollment selesai |
| 6 — Hardening & Rilis | **P1** (gerbang) | Fase 1–5 | — | Dicicil sejak Fase 1; keputusan rilis menunggu semua P1 |

**Aturan:**
- **P0 wajib selesai lebih dulu.** MVP 2 tidak boleh dimulai sebelum Fase 0–2 selesai.
- **P1** boleh dikerjakan paralel bila tidak berbagi dependensi (mis. Fase 3 dan Fase 4).
- **Fase 4 modular per modul:** Manajemen Pengguna, Master Mata Kuliah, Pembukaan Kelas, dan Konfigurasi dapat dikerjakan dalam urutan bebas; jangan menunggu keempatnya selesai untuk memulai Fase 5 audit.
- **Fase 6 bukan pekerjaan sekali jalan:** skeleton/empty/error state ditambahkan saat modul dibuat, lalu diaudit ulang di akhir.

### Fase 0 — Fondasi: Dependency, Router, HTTP, Provider, UI Kit, Test Setup (✅)

**Tujuan:** menyiapkan pondasi yang dipakai seluruh MVP 1–5.

- [x] Pasang dependency: `react-router-dom`, `@tanstack/react-query`, `react-hook-form`, `zod`, `@hookform/resolvers`, `date-fns`, `clsx`, `tailwind-merge`.
- [x] Pasang dev dependency: `vitest`, `@testing-library/react`, `@testing-library/user-event`, `@testing-library/jest-dom`, `jsdom`, `msw`, `@playwright/test`, `typescript` (jika belum).
- [x] Tambahkan script `typecheck`, `test`, `test:watch`, `test:e2e`, `lint` (opsional).
- [x] Buat `services/http.ts` (refresh mutex + queue + error normalizer).
- [x] Buat `stores/authStore.ts` baru (memori + sessionStorage refresh + status booting).
- [x] Buat `AuthProvider`, `RequireAuth`, `RequireRole`.
- [x] Migrasi router ke React Router path-based; sediakan redirect legacy `?page=`.
- [x] Buat `components/ui/` minimal: Button, Input, Select, Modal, Table, Pagination, Badge, Skeleton, EmptyState, Alert, ConfirmDialog.
- [x] Aktifkan `QueryClientProvider` + Devtools (dev only).
- [x] Buat utilitas format tanggal/angka (`id-ID`) dan konversi waktu lokal → ISO 8601 ber-offset.
- [x] Setup MSW handlers dasar + 1 smoke test render App.

**DoD fase:** aplikasi berjalan di router baru, login page masih mock tetapi guard sudah aktif, `npm run build` sukses, smoke test lulus.

---

### Fase 1 — Autentikasi & Manajemen Sesi (✅)

- [x] Login: identifier (username/email/NIM/NIDN/NIP) + password, show/hide password, remember me, loading, error 401/403.
- [x] Redirect setelah login sesuai peran: mahasiswa → `/dashboard`, dosen → `/dashboard`, admin → `/dashboard` (dasbor berbeda komponen).
- [x] Tangani akun `INACTIVE`/`SUSPENDED` dengan pesan khusus dari backend.
- [x] Lupa password: submit email → pesan generik; cooldown kirim ulang.
- [x] Reset password: baca token dari query, validasi via `POST /auth/reset-password/validate`, form sandi baru + konfirmasi, sukses → `/login?reset=1`.
- [x] Refresh token otomatis pada 401; antrekan request paralel; redirect `/login?expired=1` bila gagal.
- [x] Logout: panggil API, bersihkan query cache, redirect.
- [x] Sesi bootstrap saat reload: refresh token → `GET /profile` (atau data user dari respons refresh) → render.
- [x] Halaman `/403` dan `/404`; guard rute privat.
- [x] Test: login sukses/gagal, refresh sukses/gagal, guard peran, reset password valid/invalid.

**DoD fase:** tidak ada lagi mock login; sesi bertahan setelah reload; rute admin tidak dapat dibuka peran lain.

---

### Fase 2 — App Shell, RBAC & Profil Mandiri (⬜)

- [ ] AppShell memakai data user asli (nama, role, avatar) dan menu per peran.
- [ ] Header: server time (dari `/dashboard` atau endpoint waktu), lonceng notifikasi placeholder (diaktifkan MVP 4), dropdown profil.
- [ ] Profil — Tab Biodata: muat `GET /profile`, form `full_name`, `phone`, `bio`, NIM/NIDN read-only, simpan `PUT /profile`.
- [ ] Profil — Avatar: preview lokal, validasi `.jpg/.jpeg/.png` ≤ 2 MB di klien, unggah multipart, tampilkan dari blob terautentikasi, tangani 413/400.
- [ ] Profil — Keamanan: ganti sandi dengan verifikasi sandi lama, indikator kekuatan, logout paksa setelah sukses bila backend mencabut sesi.
- [ ] Modal ganti sandi lama di Header dipertahankan sebagai shortcut atau dihapus setelah halaman profil stabil.
- [ ] Indikator role badge dan data identitas per peran (NIM/prodi/angkatan vs NIDN/NIP).
- [ ] Test: render per peran, validasi avatar, sukses/gagal ubah profil & sandi.

**DoD fase:** profil dapat dibaca/diubah riil; avatar tersimpan dan tampil; sandi berganti.

---

### Fase 3 — Dasbor Kontekstual 3 Peran (⬜)

- [ ] Ganti `dosenApi` yang tidak ada dengan `GET /api/dashboard`; hapus fallback palsu.
- [ ] Dasbor Mahasiswa: kartu kelas enrolled, total SKS, semester, nama dosen, status; tautan ke ruang kelas (rute MVP 2).
- [ ] Dasbor Dosen: profil bergelar, kelas diampu, jumlah mahasiswa; tautan kelola kelas.
- [ ] Dasbor Admin: metrik total mahasiswa/dosen/mata kuliah/kelas/enrollment.
- [ ] Skeleton loading, empty state (belum ada kelas), error state + retry.
- [ ] Simpan `timeline_preview` untuk widget MVP 4 (render placeholder sekarang).
- [ ] Test: tiga peran merender data berbeda; error/empty state.

**DoD fase:** tidak ada data fixture pada dasbor; seluruh angka berasal dari API.

---

### Fase 4 — Master Data Admin & Konfigurasi Berkas (⬜)

- [ ] Manajemen Pengguna: list pagination + search + filter role/status; tambah/ubah akun dinamis per role; ubah status; reset sandi.
- [ ] Validasi form pengguna (username/email unik, password minimal, NIM/NIDN wajib sesuai role).
- [ ] Master Mata Kuliah: CRUD, kode unik, SKS 1–6, deskripsi; konfirmasi nonaktif/hapus.
- [ ] Pembukaan Kelas: CRUD, pilih mata kuliah & dosen (dropdown dari API), tahun akademik, semester, kapasitas; tampilkan jumlah enrolled.
- [ ] Konfigurasi Sistem (MVP 1): daftar ekstensi diizinkan, ukuran maksimum berkas (5–10 MB), simpan `PUT /admin/config`; tampilkan peringatan dampak.
- [ ] Semua mutasi → invalidasi query + toast + refresh tabel.
- [ ] Test: CRUD sukses, validasi 400, konflik 409, akses 403.

**DoD fase:** seluruh modul master data berfungsi tanpa fixture.

---

### Fase 5 — Direct Enrollment & Jejak Audit (⬜)

- [ ] Direct Enrollment: pilih kelas, tampilkan kapasitas/sisa, panel enrolled (search, pagination, unenroll + konfirmasi).
- [ ] Panel available: multi-select, pencarian, pilih semua halaman, sticky bar jumlah terpilih.
- [ ] Batch enroll: kirim `{ class_id, student_ids }`, tangani 409 kapasitas/duplikat, refres kedua panel.
- [ ] Unenroll: konfirmasi destruktif, tangani 404/409.
- [ ] Jejak Audit: list + filter tanggal/aksi/entitas/aktor, pagination, detail JSON diff (old vs new) dengan masking data sensitif.
- [ ] Test: batch sebagian gagal, kapasitas penuh, unenroll, render diff.

**DoD fase:** alur BR-002 berfungsi end-to-end; audit log dapat ditelusuri.

---

### Fase 6 — Hardening: States, Error, A11y, Responsif & Rilis (⬜)

- [ ] Skeleton shimmer pada semua tabel/kartu; empty state terstruktur.
- [ ] `ErrorBoundary` global + halaman 401/403/404/500.
- [ ] Peta error: 400 field, 401 sesi, 403 akses, 404 tidak ditemukan, 409 konflik, 413 berkas terlalu besar, 429 rate limit, 500 server.
- [ ] Audit responsif 375/768/1440; sidebar drawer; tabel → kartu di mobile.
- [ ] Audit WCAG: kontras 4.5:1, label/aria, fokus terlihat, navigasi keyboard, target sentuh 44px.
- [ ] Hapus `pages/` lama yang sudah tidak dipakai; hapus fixture yang tidak lagi diperlukan.
- [ ] Test E2E: login → dasbor → CRUD pengguna → enrollment → audit.
- [ ] `npm run typecheck`, `npm run test`, `npm run build` hijau.

**DoD fase:** rilis frontend MVP 1 siap demo tanpa data mock.

---

## 7. Matriks Pengujian Frontend

| Level | Alat | Cakupan wajib |
|---|---|---|
| Unit | Vitest | Formatter tanggal, normalizer error, auth store, guard logic |
| Integration | Vitest + RTL + MSW | Login, refresh, profil, avatar, CRUD users/courses/classes, enrollment, audit |
| Contract | MSW + skema Zod | Respons API sesuai OpenAPI 1.4.1 |
| E2E | Playwright | Alur 3 peran utama + direct enrollment + reset password |
| Manual | QA_TESTING_GUIDE | Responsif 375/768/1440, keyboard, screen reader dasar |

---

## 8. Kriteria Keberhasilan (Definition of Done)

1. Tidak ada data fixture pada halaman MVP 1; seluruh data berasal dari API.
2. Login/logout/refresh/reset password berfungsi tanpa mock.
3. RBAC ditegakkan di rute, bukan hanya menu; 403 tersedia.
4. Profil + avatar (≤ 2 MB, JPG/PNG) + ganti sandi berfungsi.
5. Admin dapat CRUD pengguna/mata kuliah/kelas dan melakukan batch enrollment.
6. Audit log dapat difilter dan detail diff ditampilkan.
7. `npm run typecheck`, `npm run test`, `npm run build` hijau; tidak ada error konsol.
8. Responsif dan aksesibel pada 375/768/1440.

---

## 9. Dependensi, Risiko & Handoff

### 9.1 Dependensi

- Backend MVP 1 pada `main` (OpenAPI 1.4.1).
- Desain MVP 1 & MVP 2 sudah Delivered (Stitch).
- Untuk MVP 2–5: desain MVP 3–5 **belum ada**; lihat plan masing-masing.

### 9.2 Risiko

| Risiko | Dampak | Mitigasi |
|---|---|---|
| Migrasi router merusak bookmark lama | Pengguna bingung | Redirect `?page=` → path baru |
| Refresh token di sessionStorage | Risiko XSS | CSP ketat; migrasi HttpOnly cookie |
| Perubahan kontrak backend | Frontend rusak | Zod parse respons + contract test |
| Halaman besar direfactor bersamaan | Regresi | Migrasi per modul + test |

### 9.3 Handoff ke MVP 2

- Router path-based dan guard siap.
- UI kit, HTTP client, auth, query client siap.
- `AppShell` siap menampung menu ruang kelas/materi/presensi.
- Placeholder notifikasi disiapkan untuk MVP 4.

---

## 10. Status & Log Progress

### 10.1 Status per Fase

| Fase | Prioritas | Status | Tanggal mulai | Tanggal selesai | Tes terakhir | Catatan |
|---|---|---|---|---|---|---|
| 0 — Fondasi & Router | P0 | ✅ | 2026-11-28 | 2026-11-28 | typecheck ✅ · test 4/4 ✅ · build ✅ | `lint` (opsional) belum dibuat; script `test:e2e` siap, browser Playwright belum di-install |
| 1 — Autentikasi & Sesi | P0 | ✅ | 2026-11-28 | 2026-11-28 | typecheck ✅ · test 21/21 ✅ · build ✅ | Login API riil (identifier+password, error 401/403), forgot/reset password terhubung backend, refresh mutex+queue dengan redirect `?expired=1`, bootstrap sesi via `GET /profile`, logout + `queryClient.clear()`; smoke test dibungkus `AppProviders` |
| 2 — Shell & Profil | P0 | ⬜ | — | — | — | — |
| 3 — Dasbor 3 Peran | P1 | ⬜ | — | — | — | — |
| 4 — Master Data Admin | P1 | ⬜ | — | — | — | Modular per modul |
| 5 — Enrollment & Audit | P1 | ⬜ | — | — | — | Audit dapat lebih dulu |
| 6 — Hardening & Rilis | P1 | ⬜ | — | — | — | Gerbang akhir |

### 10.2 Log Progress

| Tanggal | Fase | Ringkasan | File utama | Hasil tes | Commit |
|---|---|---|---|---|---|
| 2026-11-28 | — | Dokumen rencana frontend MVP 1 dibuat ulang (menggantikan versi status lama) | `IMPLEMENTATION_PLAN_MVP1_FRONTEND.md` | — | — |
| 2026-11-28 | 0 | Fondasi selesai: React Router 6 path-based + redirect legacy `?page=`, guard RequireAuth/RequireRole, http.ts (refresh mutex+queue, ApiError), authStore baru (memori+sessionStorage, status booting, login mock sementara), AppProviders (QueryClient+Devtools), UI kit `components/ui/` (11 komponen), `lib/format.ts` (id-ID, ISO 8601 ber-offset), MSW handlers + smoke test 4 kasus; `App.jsx`/`main.jsx` diganti `.tsx`, halaman lama jadi adapter di `routes/legacy.tsx` | `src/routes/index.tsx`, `src/services/http.ts`, `src/stores/authStore.ts`, `src/components/ui/` | `npm run typecheck` 0 error · `npm run test` 4/4 · `npm run build` ✅ | [`6f87b7f`](https://github.com/rosifirdos/rpl-lms/pull/84) |
| 2026-11-28 | 1 | Autentikasi riil: `LoginPage.tsx` (react-hook-form+zod, show/hide password, remember me, error 401/403 pesan backend, notifikasi `?expired=1`/`?reset=1`), `ResetPasswordPage.tsx` (validate token → form sandi baru → `/login?reset=1`), `ForgotPassword.jsx` terhubung `POST /auth/forgot-password` (resend = endpoint sama + cooldown 60s), `services/endpoints/auth.ts` + `profile.ts`, `lib/user.ts` (normalisasi BackendUser→AuthUser), `lib/validation.ts` (zod), AuthProvider login/logout riil + bootstrap `refresh → GET /profile`, authStore hapus shim mock, http.ts body refresh camelCase + `setSessionExpiredHandler` (testable), AppShell logout via `useAuth`, rute `/reset-password` menggantikan placeholder, halaman `pages/Login.jsx` dihapus, MSW handlers + 17 test integrasi baru (login/refresh/guard/reset/forgot) | `src/features/auth/LoginPage.tsx`, `src/features/auth/ResetPasswordPage.tsx`, `src/services/endpoints/auth.ts`, `src/providers/AuthProvider.tsx`, `src/stores/authStore.ts` | `npm run typecheck` 0 error · `npm run test` 21/21 · `npm run build` ✅ | belum commit |

**Format baris baru:**

```text
| YYYY-MM-DD | <fase> | <ringkasan> | <file utama> | <perintah + hasil> | <hash / "belum commit"> |
```

---

## 11. Dokumen Terkait

[PRD.md](PRD.md) · [SRS.md](SRS.md) · [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md) · [DESIGN_INSTRUCTIONS_MVP1_UIUX.md](DESIGN_INSTRUCTIONS_MVP1_UIUX.md) · [DESIGN_INSTRUCTIONS_MVP2_UIUX.md](DESIGN_INSTRUCTIONS_MVP2_UIUX.md) · [IMPLEMENTATION_PLAN_MVP1_BACKEND.md](IMPLEMENTATION_PLAN_MVP1_BACKEND.md) · [IMPLEMENTATION_PLAN_MVP2_FRONTEND.md](IMPLEMENTATION_PLAN_MVP2_FRONTEND.md) · [QA_TESTING_GUIDE.md](QA_TESTING_GUIDE.md)
