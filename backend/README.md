# Backend API: Sistem Akademik Kampus Terintegrasi
*(Portal, SIA, SPADA/LMS, PMB)*

Implementasi backend REST API berbasis Node.js, Express, dan Prisma ORM dengan PostgreSQL, dirancang mengacu pada dokumen spesifikasi [PRD.md](../PRD.md) dan [SRS.md](../SRS.md).

## Fitur & Status Implementasi

### ? Fase 1: Setup Lingkungan & Skema Database (Selesai)
- [x] Inisialisasi proyek Node.js backend (`package.json`, `.gitignore`, `.env.example`).
- [x] Konfigurasi Prisma ORM dan koneksi ke PostgreSQL `rpl_lms`.
- [x] Migrasi skema database `init_mvp1` mencakup seluruh entitas kamus data SRS Bab 28.2.
- [x] Database seeder komprehensif (`prisma/seed.js`):
  - 8 Role resmi sistem: `SUPER_ADMIN`, `ADMIN_AKADEMIK`, `ADMIN_LMS`, `DOSEN`, `DOSEN_WALI`, `MAHASISWA`, `CALON_MAHASISWA`, `USER_UMUM`.
  - 11 Permission dasar dan relasi role-permission.
  - Akun awal untuk setiap peran (Super Admin, Admin Akademik, Admin LMS, Dosen Wali, Dosen, Mahasiswa, Calon Mahasiswa).
  - Master data rintisan: Fakultas (FILKOM, FT), Prodi (TIF, SI, TE), Tahun Akademik 2026/2027, Semester Ganjil aktif, Kalender Akademik, Kurikulum 2024, Mata Kuliah, Gedung, Ruangan, dan Penawaran Kelas.
  - Pencatatan log audit inisialisasi di tabel `audit_logs`.

### ? Fase 2: Autentikasi, Profil & RBAC Engine (Selesai)
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

### ? Fase 4: Modul Master Data Dasar & Kalender Akademik (Selesai)
- [x] Skema validasi Zod DTO komprehensif untuk seluruh entitas master data (`src/modules/master/master.validation.js` & `src/modules/calendar/calendar.validation.js`).
- [x] Master Kelembagaan:
  - CRUD Fakultas (`/api/v1/master/fakultas`): Validasi kode unik uppercase, proteksi penghapusan jika masih memuat program studi.
  - CRUD Program Studi (`/api/v1/master/prodi`): Relasi berjenjang (D3/S1/S2/Profesi) ke Fakultas, proteksi integritas data mahasiswa/kurikulum.
- [x] Master Kalender Dasar & Validasi Bisnis Semester:
  - CRUD Tahun Akademik (`/api/v1/master/tahun-akademik`).
  - CRUD Semester (`/api/v1/master/semester`): Tipe GANJIL/GENAP/ANTARA, validasi rentang tanggal (`tanggal_mulai < tanggal_selesai`).
  - Aturan Bisnis Semester Aktif (`PATCH /api/v1/master/semester/:id/activate`): Transaksi atomik Prisma memastikan tepat satu semester yang berstatus aktif operasional di seluruh sistem kampus.
- [x] Master Fasilitas, Kurikulum, Mata Kuliah & Penawaran Kelas:
  - Fasilitas Gedung (`/api/v1/master/gedung`) & Ruangan Kelas (`/api/v1/master/ruangan`) dengan kontrol akses Admin Akademik & Admin LMS (*SRS Bab 4.5*).
  - Kurikulum Berbasis Prodi (`/api/v1/master/kurikulum`).
  - Mata Kuliah (`/api/v1/master/mata-kuliah`): Bobot SKS total, SKS teori, SKS praktik, semester paket, dan status wajib/pilihan.
  - Buka Penawaran Kelas Semester Aktif (`/api/v1/master/kelas`): Validasi relasi multi-entitas (Mata Kuliah, Semester, Dosen Pengampu, dan Ruangan) serta proteksi duplikasi kelas per semester.
- [x] Modul Kalender Akademik (*SRS Bab 22 & Bab 32*):
  - `GET /api/v1/calendar` & Alias Konseptual `GET /api/calendar`: Akses baca seluruh pengguna terautentikasi (*FR-130 & FR-131*).
  - `POST /api/v1/calendar`, `PUT /api/v1/calendar/:id`, `DELETE /api/v1/calendar/:id`: Pengelolaan agenda, tanggal periode, dan status (`DIJADWALKAN`, `BERJALAN`, `SELESAI`) oleh Admin Akademik & Super Admin (*FR-126 - FR-129*).
- [x] Standarisasi Respons API: Format terpadu `{ success: true, message: "...", data: ..., meta: { page, limit, total, totalPages } }`.
- [x] Audit Trail Logging: Perekaman otomatis setiap mutasi entitas master dan kalender pada tabel `audit_logs` (`src/utils/audit.js`).
- [x] Automated Integration Test Suite (`tests/phase4.test.js`): 11 skenario pengujian dengan status 100% lulus. Total 24 skenario pengujian suite backend lulus seluruhnya.

### ? Fase Berikutnya (Roadmap MVP 1)
- **Fase 3:** Layanan Audit Trail Query & Keamanan Server (Rate Limiting, Advanced HTTP security).
- **Fase 5:** Dasbor Portal & Integrator Modul (SRS Bab 9 & Bab 19).
- **Fase 6:** Pengujian E2E Kepatuhan SRS & Handoff.

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
npm test      # Menjalankan seluruh skenario pengujian otomatis
```

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
