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
  - Master data rintisan: Fakultas (FILKOM, FT), Prodi (TIF, SI, TE), Tahun Akademik 2026/2027, Semester Ganjil aktif, Kalender Akademik, Kurikulum 2024, Mata Kuliah, Gedung, Ruangan, dan Penawaran Kelas.
  - Pencatatan log audit inisialisasi di tabel `audit_logs`.

### ✅ Fase 2: Autentikasi, Profil & RBAC Engine (Selesai)
- [x] Helper hashing & verifikasi password bcrypt (`src/utils/password.js`).
- [x] Token management JWT (`src/utils/token.js`) dengan Access Token (15m), Refresh Token bertanda tangan kriptografis (7d) disimpan aman dalam bentuk hash SHA-256 di tabel database `refresh_tokens`.
- [x] Middleware proteksi:
  - `authenticateToken`: Verifikasi JWT, deteksi status akun aktif (*SRS UC-01/BR*), injeksi user, roles, dan permissions ke request context.
  - `requireRole`: Pembatasan endpoint berdasarkan role tertentu (mendukung multi-role dan bypass Super Admin).
  - `requirePermission` & `requireAnyPermission`: Otorisasi granular berbasis permission (*SRS Bab 31*).
  - `validate`: Middleware validasi request body/params/query berbasis skema Zod DTO.
  - `errorHandler`: Penanganan terpusat untuk `AppError`, validasi Zod, token JWT, dan Prisma conflict error.
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

### ⏳ Fase Berikutnya (Roadmap MVP 1)
- **Fase 3:** Layanan Audit Trail & Keamanan Server.
- **Fase 4:** Endpoint CRUD Master Data & Kalender Akademik.
- **Fase 5:** Dasbor Portal & Integrasi Launcher Modul.
- **Fase 6:** Pengujian Otomatis & Dokumentasi API.

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
