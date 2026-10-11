# Backend API: SPADA (Learning Management System)

Implementasi backend REST API berbasis Node.js, Express, dan Prisma ORM dengan PostgreSQL untuk **SPADA LMS — Universitas PGRI Semarang**.

Mengacu pada dokumen [SRS.md](../SRS.md) hasil revisi (fokus eksklusif modul SPADA/LMS).

> **Catatan revisi (BR-001 & BR-002):** Seluruh modul di luar kegiatan pembelajaran digital (SIA, PMB, KRS manual, KHS, transkrip, sidang) **telah dihapus dari ruang lingkup**. Peran disederhanakan menjadi **3 role tunggal**; Dosen Wali/PA dan varian Admin multirangkap ditiadakan. Enrollment mahasiswa ke kelas dilakukan langsung oleh Admin.

## Stack Teknologi

| Lapisan | Teknologi |
| --- | --- |
| Runtime | Node.js (v20+ LTS) + ESM (`"type": "module"`) |
| Web Framework | Express |
| ORM & Migrasi | Prisma |
| Database | PostgreSQL (v16+) database `rpl_lms` |
| Validasi | Zod |
| Autentikasi | JWT (Access + Refresh Token) + bcryptjs |
| Keamanan HTTP | Helmet, CORS terproteksi, express-rate-limit |

## Hak Akses (3 Role — SRS Bab 3)

| Role | Keterangan |
| --- | --- |
| `admin` | Pengelola teknis & operasional sistem (peran tunggal — menyatukan Super Admin, Admin Akademik, Admin LMS). |
| `dosen` | Tenaga pendidik pengampu kelas perkuliahan. |
| `mahasiswa` | Peserta didik yang terdaftar pada kelas SPADA (via enrollment Admin). |

## Struktur Modul

Modul usang telah dibersihkan (`krs`, `jadwal`, `calendar`, `master`, `portal`, `roles`, `permissions`). Berikut yang tersisa dan masih relevan dengan SRS baru:

```
backend/
├── prisma/
│   ├── schema.prisma          # 10 model: User, Profile, Mahasiswa, Dosen, RefreshToken,
│   │                          #            Course, Class, Enrollment, File, AuditLog
│   ├── migrations/            # Artefak migrasi Prisma
│   └── seed.js                # 1 Admin, 3 Dosen, 10 Mahasiswa, 5 Mata Kuliah, 2 Kelas
├── src/
│   ├── app.js                 # Express app + pendaftaran rute
│   ├── server.js
│   ├── config/                # env.js (STORAGE), prisma.js
│   ├── constants/             # roles.js (3 role lowercase), permissions.js
│   ├── middlewares/           # auth, rbac, audit, validate, error, rateLimit
│   ├── utils/                 # apiResponse, errors, password, token, storage
│   └── modules/
│       ├── auth/              # login, refresh, logout, forgot-password, change-password
│       ├── profile/           # getProfile, updateProfile
│       ├── users/             # CRUD manajemen akun (Admin only)
│       └── audit-log/         # query jejak audit (Admin only)
└── storage/private/           # Penyimpanan berkas terproteksi (BR-009)
    ├── avatars/               #   avatar (FR-007: .jpg/.png, maks 2MB)
    ├── materials/             #   materi (BR-007: .pdf/.docx/.xlsx/.zip, maks 10MB)
    └── submissions/           #   tugas mahasiswa
```

## Endpoint API (flat `/api` per SRS Bab 21)

| Method | Endpoint | Deskripsi | Otorisasi |
| --- | --- | --- | --- |
| `GET` | `/health` | Status server | Publik |
| `GET` | `/api` | Informasi selamat datang + daftar endpoint | Publik |
| `POST` | `/api/auth/login` | Autentikasi & pembuatan sesi | Publik |
| `POST` | `/api/auth/refresh` | Perpanjang access token | Terotentikasi |
| `POST` | `/api/auth/logout` | Cabut refresh token | Terotentikasi |
| `POST` | `/api/auth/forgot-password` | Pengajuan reset kata sandi (FR-003) | Publik |
| `PUT` | `/api/auth/change-password` | Ganti kata sandi (verifikasi sandi lama) | Terotentikasi |
| `GET` | `/api/profile` | Ambil data profil sendiri | Terotentikasi |
| `PUT` | `/api/profile` | Perbarui kontak & bio profil | Terotentikasi |
| `GET` | `/api/admin/users` | Daftar akun pengguna | Admin |
| `POST` | `/api/admin/users` | Buat akun baru (FR-044) | Admin |
| `GET` | `/api/admin/users/:id` | Detail akun pengguna | Admin |
| `PUT` | `/api/admin/users/:id` | Ubah data akun (termasuk role) | Admin |
| `PATCH` | `/api/admin/users/:id/status` | Ubah status akun (`ACTIVE`/`INACTIVE`/`SUSPENDED`) | Admin |
| `GET` | `/api/admin/audit-logs` | Riwayat jejak audit dengan filter (FR-052) | Admin |
| `GET` | `/api/admin/audit-logs/:id` | Detail log (old_values vs new_values) | Admin |

## Skema Database (Prisma)

`schema.prisma` merefleksikan MVP 1 (IMPLEMENTATION_PLAN Bab 3 & SRS Bab 13) — 3 role sebagai enum, tanpa entitas SIA/KRS:

| Model | Keterangan |
| --- | --- |
| `User` | Akun login: `username`, `email`, `password_hash`, `role` (enum), `status` |
| `Profile` | Data personal: `full_name`, `phone`, `bio`, `avatar_file_id` |
| `Mahasiswa` | `nim` (unique), `prodi`, `angkatan` — relasi 1:1 ke `User` |
| `Dosen` | `nidn`/`nip` (unique), `gelar_depan`, `gelar_belakang` — relasi 1:1 ke `User` |
| `RefreshToken` | Token refresh di-hash (SHA-256) dan disimpan di DB |
| `Course` | Master mata kuliah: `code` (unique), `name`, `credits`, `is_active` |
| `Class` | Pembukaan kelas: `course`, `lecturer` (Dosen), `academic_year`, `semester`, `capacity` |
| `Enrollment` | Pendaftaran mahasiswa ke kelas (BR-002, diinput Admin) — unique `(class_id, student_id)` |
| `File` | Metadata berkas terproteksi (BR-009) |
| `AuditLog` | Jejak audit: action, entity, old/new values, ip_address (NFR-009) |

## Panduan Menjalankan

### 1. Prasyarat
- Node.js (v20+ LTS)
- PostgreSQL (v16+) dengan database `rpl_lms`

### 2. Instalasi & Setup Database
```bash
cd backend
npm install
cp .env.example .env    # Sesuaikan konfigurasi DATABASE_URL
npm run db:migrate      # Eksekusi migrasi awal (init_spada_mvp1)
npm run db:seed         # Isi akun pengguna & master awal
```

### 3. Menjalankan Server
```bash
npm run dev             # Mode development (nodemon)
npm start               # Mode produksi
```

### 4. Database Alternatif (Embedded Postgres)
Tanpa instalasi PostgreSQL manual, `scripts/run-pg.js` menyediakan embedded-postgres di port 5433:
```bash
node scripts/run-pg.js
```

## Akun Bawaan Seeder

Password default seluruh akun: `password123`

| Role | Username | Email | Keterangan |
| --- | --- | --- | --- |
| Admin | `admin` | `admin@upgris.ac.id` | Administrator SPADA |
| Dosen | `198501152010121002` | `budi.santoso@upgris.ac.id` | NIDN sebagai username |
| Dosen | `199003202015042001` | `siti.aminah@upgris.ac.id` | NIDN sebagai username |
| Dosen | `197805102003122001` | `hadi.wijaya@upgris.ac.id` | NIDN sebagai username |
| Mahasiswa | `2024001001`–`2024001010` | `<nim>@mhs.upgris.ac.id` | NIM sebagai username |

Seeder juga membuat 5 master mata kuliah (`TIF101`–`TIF105`) dan 2 kelas perkuliahan (`TI-A`, `SI-B`) untuk tahun ajaran `2026/2027` semester `ganjil`.

## Status Pengerjaan Backend

Backend lama yang mengacu pada SRS sebelum revisi **sudah dibersihkan**. Yang tersisa saat ini adalah fondasi yang masih relevan dengan SRS baru:

- ✅ **Fase 1 selesai (skema & setup):** `schema.prisma` (10 model), `seed.js` (1 Admin, 3 Dosen, 10 Mahasiswa, 5 Mata Kuliah, 2 Kelas), konstanta role lowercase, konfigurasi storage (BR-009), utilitas validasi berkas, Prisma Client teregenerasi.
- ✅ **Dipertahankan:** Autentikasi (login/refresh/logout/forgot/change password), Profil, Manajemen User (Admin), Audit Log, middleware RBAC inti, konfigurasi, dan utilitas.
- 🗑️ **Dihapus:** Modul KRS manual, Jadwal, Kalender, seluruh Master Data SIA (Fakultas, Prodi, Kurikulum, Mata Kuliah, Gedung, Ruangan, Semester, Tahun Akademik), Portal gateway, modul Roles/Permissions, migrasi lama, `docs/openapi.yaml`, dan skrip coverage.
- ⚠️ **Catatan:** Test suite integrasi lama (`tests/phase2/3/4/6.test.js`) ikut dihapus karena seluruhnya menguji sistem yang sudah dihapus (8 role lama, endpoint `/api/v1/master/*`, permission `portal:view`/`calendar:view`).

### Modul SRS yang **belum diimplementasikan**

Sesuai prioritas MVP (SRS Bab 27), modul berikut belum dibangun dan menjadi pekerjaan selanjutnya:

| MVP | Modul | Entitas SRS |
| --- | --- | --- |
| **MVP 1** | Master Mata Kuliah & Kelas, Penugasan Dosen, Enrollment (FR-044 s.d. FR-048) | `Course`, `Class`, `Enrollment` |
| **MVP 2** | Ruang Kelas 16 Pertemuan, Materi, Presensi Digital (FR-013 s.d. FR-015, FR-023 s.d. FR-024, FR-030 s.d. FR-031, FR-036 s.d. FR-039) | `Meeting`, `Material`, `Attendance` |
| **MVP 3** | Tugas, Validasi File, Submission, Penilaian Skor 0–100 (FR-016 s.d. FR-022, FR-032 s.d. FR-035, FR-053 s.d. FR-054) | `Assignment`, `Submission` |
| **MVP 4** | Timeline Pembelajaran, Kuis, Notifikasi (FR-009 s.d. FR-012, FR-025, FR-040 s.d. FR-041, FR-057) | `Quiz`, `Notification` |
| **MVP 5** | UTS/UAS + Gatekeeping Presensi, Rekap Nilai, Audit Lanjut (FR-026 s.d. FR-027, FR-042 s.d. FR-043, FR-055 s.d. FR-056, FR-058) | exam gate, grade recap |
