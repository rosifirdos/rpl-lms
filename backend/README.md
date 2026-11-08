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

Modul usang telah dibersihkan (`krs`, `jadwal`, `calendar`, `master`, `portal`, `roles`, `permissions`). Berikut modul yang relevan dengan SRS baru:

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
│       ├── profile/           # getProfile, updateProfile, avatar upload, password
│       ├── users/             # CRUD manajemen akun, status, reset password (Admin only)
│       ├── courses/           # CRUD master mata kuliah (Admin only)
│       ├── classes/           # CRUD pembukaan kelas (Admin only)
│       └── audit-log/         # query jejak audit, inspeksi JSON diff (Admin only)
└── storage/private/           # Penyimpanan berkas terproteksi (BR-009)
    ├── avatars/               #   avatar (FR-007: .jpg/.png, maks 2MB)
    ├── materials/             #   materi (BR-007: .pdf/.docx/.xlsx/.zip, maks 10MB)
    └── submissions/           #   tugas mahasiswa
```

## Endpoint API (flat `/api` per SRS Bab 21)

Pembuatan akun mahasiswa memerlukan `nim`, `prodi`, dan `angkatan`; pembuatan akun dosen memerlukan minimal `nidn` atau `nip`. Penghapusan mata kuliah bersifat nonaktif agar relasi kelas tetap terjaga. Kelas yang masih memiliki mahasiswa terdaftar tidak dapat dihapus, dan kapasitas tidak dapat diturunkan di bawah jumlah enrollment aktif.

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
| `POST` | `/api/profile/avatar` | Unggah/ganti foto profil (.jpg/.png, maks 2MB) | Terotentikasi |
| `GET` | `/api/profile/avatar` | Stream foto profil privat | Terotentikasi |
| `PUT` | `/api/profile/password` | Ganti password profil mandiri | Terotentikasi |
| `GET` | `/api/admin/users` | Daftar akun pengguna (filter role, status, pencarian) | Admin |
| `POST` | `/api/admin/users` | Buat akun baru (FR-044) | Admin |
| `GET` | `/api/admin/users/:id` | Detail akun pengguna | Admin |
| `PUT` | `/api/admin/users/:id` | Ubah data akun (termasuk role) | Admin |
| `PATCH` | `/api/admin/users/:id/status` | Ubah status akun (`ACTIVE`/`INACTIVE`/`SUSPENDED`) | Admin |
| `PUT` | `/api/admin/users/:id/reset-password` | Reset kata sandi pengguna oleh Admin (FR-044, SRS Bab 35) | Admin |
| `GET` | `/api/admin/courses` | Daftar mata kuliah dengan pencarian, filter status, dan paginasi | Admin |
| `POST` | `/api/admin/courses` | Tambah mata kuliah (kode unik, SKS 1–6) | Admin |
| `GET` | `/api/admin/courses/:id` | Detail mata kuliah | Admin |
| `PUT` | `/api/admin/courses/:id` | Perbarui mata kuliah | Admin |
| `DELETE` | `/api/admin/courses/:id` | Nonaktifkan mata kuliah tanpa menghapus riwayat kelas | Admin |
| `GET` | `/api/admin/classes` | Daftar kelas dengan filter semester, tahun akademik, dan mata kuliah | Admin |
| `POST` | `/api/admin/classes` | Buka kelas untuk mata kuliah aktif dan dosen aktif | Admin |
| `GET` | `/api/admin/classes/:id` | Detail kelas, dosen, mata kuliah, dan jumlah enrollment | Admin |
| `PUT` | `/api/admin/classes/:id` | Perbarui data kelas dan validasi kapasitas | Admin |
| `DELETE` | `/api/admin/classes/:id` | Hapus kelas yang belum memiliki enrollment | Admin |
| `GET` | `/api/admin/audit-logs` | Riwayat jejak audit dengan filter komprehensif & paginasi (FR-052) | Admin |
| `GET` | `/api/admin/audit-logs/:id` | Detail log audit (old_values vs new_values) | Admin |
| `GET` | `/api/audit-logs` | Alias flat endpoint jejak audit | Admin |

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

### 3. Menjalankan Server & Pengujian
```bash
npm run dev             # Mode development (nodemon)
npm start               # Mode produksi
npm test                # Menjalankan seluruh pengujian otomatis (70 test, Fase 2–4)
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

- ✅ **Fase 1: Setup Lingkungan & Skema Database (Selesai)**
  - `schema.prisma` (10 model), migrasi awal `init_spada_mvp1`, seeder idempoten, konfigurasi storage berkas privat (BR-009).
- ✅ **Fase 2: Autentikasi, Profil & RBAC Guard (Selesai — 24 test)**
  - Multi-credential login (username/email/NIM/NIDN/NIP), penolakan akun INACTIVE/SUSPENDED, refresh token & revocation, RBAC guard, modul profil mandiri, unggah avatar privat (2MB limit).
- ✅ **Fase 3: Layanan Audit Trail Engine & Keamanan Server (Selesai — 33 test)**
  - Layanan terpusat `AuditLogService` dengan pencatatan mutasi terstruktur (`record`, `findAll`, `findById`, structured helpers).
  - Integrasi pencatatan audit pada pembuatan akun (`CREATE_USER`), pengubahan status pengguna (`UPDATE_USER_STATUS`), pembaruan profil (`UPDATE_USER`), dan reset kata sandi oleh Admin (`RESET_PASSWORD`).
  - Endpoint peninjau jejak audit untuk Admin: `GET /api/admin/audit-logs` (filter tanggal, aksi, entitas, user, search, sorting, pagination) dan `GET /api/admin/audit-logs/:id` (detail JSON diff).
  - Endpoint reset password Admin: `PUT /api/admin/users/:id/reset-password`.
  - HTTP Security Hardening: Helmet security headers, CORS terproteksi dengan validasi origin ketat, general & auth rate limiting (`express-rate-limit`).
- ✅ **Fase 4: Master Data Akademik SPADA (Selesai — 5 test integrasi)**
  - Manajemen pengguna Admin: pencarian username/email/nama/NIM/NIDN/NIP, filter role/status, dan pembuatan akun dengan identitas mahasiswa/dosen.
  - CRUD mata kuliah dengan pencarian, paginasi, validasi SKS 1–6, dan penonaktifan yang mempertahankan relasi kelas.
  - CRUD kelas dengan filter akademik, validasi mata kuliah/dosen aktif, jejak audit, dan perlindungan kapasitas serta enrollment.
  - Seluruh pengujian otomatis Fase 2–4: **70 test**.

### Modul SRS yang **belum diimplementasikan**

Sesuai prioritas MVP (SRS Bab 27), modul berikut menjadi tahapan selanjutnya:

| MVP | Modul | Entitas SRS |
| --- | --- | --- |
| **MVP 1 (Fase 5)** | Direct Enrollment & Dasbor Kontekstual | `Enrollment` |
| **MVP 2** | Ruang Kelas 16 Pertemuan, Materi, Presensi Digital | `Meeting`, `Material`, `Attendance` |
| **MVP 3** | Tugas, Validasi File, Submission, Penilaian Skor 0–100 | `Assignment`, `Submission` |
| **MVP 4** | Timeline Pembelajaran, Kuis, Notifikasi | `Quiz`, `Notification` |
| **MVP 5** | UTS/UAS + Gatekeeping Presensi, Rekap Nilai, Audit Lanjut | exam gate, grade recap |
