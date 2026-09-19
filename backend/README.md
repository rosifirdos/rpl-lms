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

### ⏳ Fase Berikutnya (Roadmap MVP 1)
- **Fase 2:** Autentikasi (`/auth/login`, `/refresh`, `/logout`), Manajemen Profil mandiri (`/profile`), & RBAC Guard.
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

### 3. Menjalankan Server
```bash
npm run dev   # Menjalankan server dalam mode development (nodemon)
npm start     # Menjalankan server dalam mode production
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