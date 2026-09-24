# Backend API: Sistem Akademik Kampus Terintegrasi
*(Portal, SIA, SPADA/LMS, PMB)*

Implementasi backend REST API berbasis Node.js, Express, dan Prisma ORM dengan PostgreSQL, dirancang mengacu pada dokumen spesifikasi [PRD.md](../PRD.md) dan [SRS.md](../SRS.md).

## Fitur & Status Implementasi

### ✅ Fase 1: Setup Lingkungan & Skema Database (Selesai)
- [x] Inisialisasi proyek Node.js backend (`package.json`, `.gitignore`, `.env.example`).
- [x] Konfigurasi Prisma ORM dan koneksi ke PostgreSQL `rpl_lms`.
- [x] Migrasi skema database `init_mvp1` mencakup seluruh entitas kamus data SRS Bab 28.2.
- [x] Database seeder komprehensif (`prisma/seed.js`):
  - 8 Role resmi sistem: `SUPER_ADMIN`, `ADMIN_AKADEMIK`, `ADMIN_LMS`, `DOSEN`, `DOSEN_WALI`, `MAHASISWA`, `CALON_MAHASISWA`, `USER_UMUM`.
  - 11 Permission dasar dan relasi role-permission.
  - Akun awal untuk setiap peran (Super Admin, Admin Akademik, Admin LMS, Dosen Wali, Dosen, Mahasiswa, Calon Mahasiswa).
  - Master data rintisan: Fakultas (FILKOM, FT), Prodi (TIF, SI), Tahun Akademik 2026/2027, Semester Ganjil aktif, Kalender Akademik, Kurikulum 2024, Mata Kuliah, Gedung, Ruangan, dan Penawaran Kelas.
  - Pencatatan log audit inisialisasi di tabel `audit_logs`.

### ✅ Fase 2: Autentikasi, Profil & RBAC Engine (Selesai)
- [x] Helper hashing & verifikasi password bcrypt (`src/utils/password.js`).
- [x] Token management JWT (`src/utils/token.js`) dengan Access Token (15m), Refresh Token bertanda tangan kriptografis (7d) disimpan aman dalam bentuk hash SHA-256 di tabel database `refresh_tokens`.
- [x] Middleware proteksi:
  - `authenticateToken`: Verifikasi JWT, deteksi status akun aktif (*SRS UC-01/BR*), injeksi user, roles, dan permissions ke request context.
  - `requireRole`: Pembatasan endpoint berdasarkan role tertentu (mendukung multi-role dan bypass Super Admin).
  - `requirePermission` & `requireAnyPermission`: Otorisasi granular berbasis permission (*SRS Bab 31*).
  - `validate`: Middleware validasi request body/params/query berbasis skema Zod DTO.
  - `errorHandler`: Penanganan terpusat untuk `AppError`, validasi Zod, token JWT, Prisma conflict error (`P2002`), foreign key constraint (`P2003`), dan not found (`P2025`).
- [x] Modul Autentikasi (`/api/v1/auth`):
  - `POST /api/v1/auth/login`: Autentikasi multi-kredensial (username/NIM/NIDN/NIP atau email), pencatatan audit log `LOGIN`, pengembalian token dan ringkasan profil entitas aktif.
  - `POST /api/v1/auth/refresh`: Penerbitan access token baru dari refresh token valid.
  - `POST /api/v1/auth/logout`: Pencabutan status refresh token dan pencatatan audit `LOGOUT`.
  - `PUT /api/v1/auth/change-password`: Penggantian kata sandi mandiri (*FR-016*), verifikasi kata sandi lama, hashing kata sandi baru, pencabutan token aktif, dan pencatatan audit.
  - `POST /api/v1/auth/forgot-password`: Permintaan pemulihan akun (*FR-015*).
- [x] Modul Profil Mandiri (`/api/v1/profile`):
  - `GET /api/v1/profile`: Hak akses baca profil untuk seluruh role (*SRS Bab 31 Table 15: RW*), menyajikan data akun, roles, permissions, profil spesifik (Mahasiswa, Dosen, Admin, Calon Mahasiswa).
  - `PUT /api/v1/profile`: Pembaruan mandiri atribut profil (nama, gelar dosen, email, jalur PMB) disertai jejak audit `UPDATE_PROFILE`.
- [x] Endpoint Konseptual Alias (SRS Bab 32):
  - `POST /api/login` -> alias ke modul auth login.
  - `POST /api/logout` -> alias ke modul auth logout.
  - `GET /api/profile` dan `PUT /api/profile` -> alias ke modul profil.
- [x] Automated Integration Test Suite (`tests/phase2.test.js`) mencakup 13 skenario pengujian dengan status 100% lulus.

### ✅ Fase 3: Layanan Audit Trail & Keamanan Server (Selesai)
- [x] Modul Audit Log Query (`/api/v1/audit-logs`) dengan filter pagination, entitas, aksi, dan rentang tanggal.
- [x] Middleware Keamanan HTTP: Helmet yang disesuaikan, CORS terproteksi (*SRS Bab 35*).
- [x] Rate Limiter: General limiter untuk seluruh endpoint dan auth limiter untuk proteksi brute-force login.
- [x] Interceptor Audit Helper (`attachAuditHelper`) untuk otomatisasi pencatatan IP dan user-agent klien.

### ✅ Fase 4: Modul Master Data Dasar & Kalender Akademik (Selesai)
- [x] Skema validasi Zod DTO komprehensif untuk seluruh entitas master data (`src/modules/master/master.validation.js` & `src/modules/calendar/calendar.validation.js`).
- [x] Master Kelembagaan:
  - CRUD Fakultas (`/api/v1/master/fakultas`): Validasi kode unik uppercase, proteksi penghapusan jika masih memuat program studi.
  - CRUD Program Studi (`/api/v1/master/prodi`): Relasi berjenjang ke Fakultas, proteksi integritas data mahasiswa/kurikulum.
- [x] Master Kalender Dasar & Validasi Bisnis Semester:
  - CRUD Tahun Akademik (`/api/v1/master/tahun-akademik`).
  - CRUD Semester (`/api/v1/master/semester`): Tipe GANJIL/GENAP/ANTARA, validasi rentang tanggal (`tanggal_mulai < tanggal_selesai`).
  - Aturan Bisnis Semester Aktif (`PATCH /api/v1/master/semester/:id/activate`): Transaksi atomik Prisma memastikan tepat satu semester yang berstatus aktif operasional di seluruh sistem kampus.
- [x] Master Fasilitas, Kurikulum, Mata Kuliah & Penawaran Kelas:
  - Fasilitas Gedung (`/api/v1/master/gedung`) & Ruangan Kelas (`/api/v1/master/ruangan`).
  - Kurikulum Berbasis Prodi (`/api/v1/master/kurikulum`).
  - Mata Kuliah (`/api/v1/master/mata-kuliah`): Bobot SKS total, SKS teori, SKS praktik, semester paket, dan status wajib/pilihan.
  - Buka Penawaran Kelas Semester Aktif (`/api/v1/master/kelas`): Validasi relasi multi-entitas (Mata Kuliah, Semester, Dosen Pengampu, dan Ruangan) serta proteksi duplikasi kelas per semester.
- [x] Modul Kalender Akademik (*SRS Bab 22 & Bab 32*):
  - `GET /api/v1/calendar` & Alias Konseptual `GET /api/calendar`: Akses baca seluruh pengguna terautentikasi (*FR-130 & FR-131*).
  - `POST /api/v1/calendar`, `PUT /api/v1/calendar/:id`, `DELETE /api/v1/calendar/:id`: Pengelolaan agenda, tanggal periode, dan status (`DIJADWALKAN`, `BERJALAN`, `SELESAI`) oleh Admin Akademik & Super Admin (*FR-126 - FR-129*).

### ✅ Fase 5: Dasbor Portal & Integrator Modul (Selesai)
- [x] Modul Portal Gateway (`src/modules/portal/`):
  - `GET /api/v1/portal/modules`: Layanan evaluasi hak akses modul kampus (PORTAL, SIA, SPADA, PMB, ADMIN_PORTAL) berbasis 8 peran pengguna dan prinsip *least privilege*.
  - `GET /api/v1/portal/dashboard`: Agregator data metrik kontekstual ringkas sesuai spesifikasi SRS Bab 9 & Bab 19:
    - **Mahasiswa:** Biodata akademik (NIM, prodi, status), info Dosen Wali/PA lengkap, status pembukaan periode KRS & kalender, tautan launcher SIA dan SPADA (*FR-018 s/d FR-022*).
    - **Dosen & Dosen Wali:** Rekap biodata bergelar, statistik & daftar kelas diampu semester berjalan (matakuliah, SKS, ruangan, kapasitas), serta ringkasan mahasiswa bimbingan PA aktif.
    - **Admin Akademik:** Metrik menyeluruh (total mahasiswa aktif, total dosen, total prodi, total fakultas, total matakuliah, kelas aktif), serta status kalender operasional (*SRS Bab 19.1*).
    - **Admin LMS:** Metrik platform pembelajaran SPADA (total kelas daring aktif, total dosen pengampu, daftar modul 16 pertemuan, tugas, kuis, presensi) (*SRS Bab 19.2*).
    - **Super Admin:** Metrik pengguna & sebaran status akun, distribusi peran civitas, status audit log, serta kesehatan sistem (*SRS Bab 19.3*).
    - **Calon Mahasiswa:** Status seleksi PMB, prodi pilihan, nomor pendaftaran, dan pemantauan 5 tahapan pendaftaran.
- [x] Endpoint Alias Konseptual:
  - `GET /api/dashboard` -> memetakan langsung ke agregator dasbor portal.
  - `GET /api/portal/modules` -> memetakan langsung ke launcher modul.
- [x] Automated Integration Test Suite (`tests/phase5.test.js`) mencakup 9 skenario pengujian dengan status 100% lulus.

### ✅ Fase 6: Pengujian, Validasi Kepatuhan SRS & Handoff (Selesai)
- [x] **Test Suite Integrasi End-to-End** (`tests/phase6.test.js`): 35 skenario yang memvalidasi keseluruhan alur MVP 1:
  - Alur lengkap siklus autentikasi (login → akses → refresh → *change password* → logout → penolakan token).
  - Multi-kredensial login (username, NIM, NIDN, No. Pendaftaran) untuk seluruh tipe aktor.
  - Penolakan akun `INACTIVE`/`SUSPENDED` dan kredensial tidak valid.
  - Profil mandiri (`GET`/`PUT /api/v1/profile`) untuk seluruh role.
  - Proteksi keamanan lintas modul (401 tanpa token, 403 untuk role tidak berwenang, *Super Admin bypass*).
  - Manajemen pengguna: list dengan pagination/filter/search, detail, penugasan role & perubahan status + verifikasi jejak audit.
  - Kesesuaian 6 endpoint alias konseptual SRS Bab 32 (`/api/login`, `/api/profile`, `/api/logout`, `/api/calendar`, `/api/dashboard`, `/api/portal/modules`).
  - Konsistensi data antara modul `/profile` dan `/portal/dashboard` untuk Mahasiswa & Dosen.
  - Pencatatan mutasi pada tabel `audit_logs` (autentikasi & master data).
  - Standarisasi respons JSON `{ success, data, message, meta }` di seluruh endpoint.
- [x] **Perbaikan bug kritis** yang ditemukan selama pengujian E2E:
  - `UsersService.updateStatus`: pencabutan refresh token keliru menggunakan field `revoked` (tidak ada di skema); diperbaiki ke `revoked_at` sesuai `schema.prisma`.
- [x] **Dokumentasi API OpenAPI 3.0** (`docs/openapi.yaml`): 37 path & 68 operasi terdokumentasi, mencakup seluruh modul MVP 1 (Auth, Profile, Portal, Users, Calendar, Master Data, Audit Log), skema request/response, kode error terstandar (401/403/404/409/400), dan skema keamanan Bearer JWT.
- [x] **Skrip Verifikasi Cakupan Dokumentasi** (`scripts/check-openapi-coverage.mjs`): memastikan tidak ada endpoint yang diuji di test suite tapi tidak terdokumentasi di OpenAPI (cakupan 100%).

### 🎉 Status MVP 1: **Selesai**
Seluruh 6 fase backend MVP 1 telah diimplementasikan dan terverifikasi melalui **83 skenario pengujian otomatis** dengan status 100% lulus.

## Panduan Menjalankan Backend

### 1. Prasyarat
- Node.js (v20+ LTS)
- PostgreSQL (v16+) dengan database `rpl_lms`

### 2. Instalasi & Setup Database
```bash
cd backend
npm install
cp .env.example .env # Sesuaikan konfigurasi DATABASE_URL
npm run db:migrate   # Menjalankan migrasi Prisma
npm run db:seed      # Mengisi data master awal & akun pengguna
```

### 3. Menjalankan Server & Pengujian
```bash
npm run dev   # Menjalankan server dalam mode development (nodemon)
npm start     # Menjalankan server dalam mode production
npm test      # Menjalankan seluruh skenario pengujian otomatis (83 test, 6 fase)
npm run docs:check  # Verifikasi cakupan dokumentasi OpenAPI vs endpoint yang diuji
```

### 4. Dokumentasi API (OpenAPI 3.0)
Spesifikasi API lengkap tersedia di [`docs/openapi.yaml`](./docs/openapi.yaml). Berkas dapat diimpor ke:
- [Swagger Editor](https://editor.swagger.io/)
- [Redoc](https://redocly.github.io/redoc/)
- Postman / Insomnia / Bruno (sebagai koleksi)
- Cursor, VS Code (OpenAPI extension), atau Stoplight Studio

Endpoint alias konseptual SRS Bab 32 (`/api/login`, `/api/profile`, `/api/logout`, `/api/calendar`, `/api/dashboard`, `/api/portal/modules`) didokumentasikan pada bagian `info.description`.

### Akun Bawaan Seeder
| Peran | Username | Email | Password Default |
|---|---|---|---|
| Super Admin | `superadmin` | `superadmin@kampus.ac.id` | `Password123!` |
| Admin Akademik | `admin_akademik` | `admin.akademik@kampus.ac.id` | `Password123!` |
| Admin LMS | `admin_lms` | `admin.lms@kampus.ac.id` | `Password123!` |
| Dosen & PA | `198501152010121002` | `budi.santoso@kampus.ac.id` | `Password123!` |
| Dosen Pengampu | `199003202015042001` | `siti.aminah@kampus.ac.id` | `Password123!` |
| Mahasiswa | `2024001001` | `ahmad.fauzi@student.kampus.ac.id` | `Password123!` |
| Calon Mahasiswa | `PMB20260001` | `rizky.pratama@gmail.com` | `Password123!` |
