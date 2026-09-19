# Implementation Plan: Backend MVP 1
**Sistem Akademik Kampus Terintegrasi (Portal, SIA, SPADA/LMS, PMB)**

Dokumen ini memuat rencana implementasi teknis sisi **Backend** untuk mencapai target **MVP 1** secara presisi, yang diselaraskan dengan spesifikasi pada [SRS.md](SRS.md) (*Bab 3, 5, 9, 10, 11, 14, 15, 19, 28, 31, 32, 34, 35, dan 39*):
> **Definisi MVP 1 (SRS Bab 39 - Tabel 21):**
> *"Login, role, dashboard, profil, master data dasar."*

---

## 1. Tujuan & Ruang Lingkup MVP 1 (Sisi Backend)

1. **Autentikasi Terpadu & Manajemen Sesi (SRS FR-013 s/d FR-016, UC-01)**
   - Autentikasi multi-kredensial (`username` / NIM / NIDN / NIP atau `email` + `password`).
   - Penolakan akun dengan status tidak aktif (*BR/UC-01*).
   - Pengelolaan sesi aman dengan JWT (Access Token dan Refresh Token bertanda tangan kriptografis).
   - Fitur logout, perubahan kata sandi mandiri, dan dukungan pemulihan akun (*forgot password*).
2. **Otorisasi Berbasis Peran & Matriks Akses (SRS Bab 3 & Bab 31 - Tabel 15)**
   - Mendukung 8 aktor/role: `USER_UMUM` (Publik), `CALON_MAHASISWA`, `MAHASISWA`, `DOSEN`, `DOSEN_WALI`, `ADMIN_AKADEMIK`, `ADMIN_LMS`, dan `SUPER_ADMIN`.
   - Dukungan kepemilikan multi-role (misal seorang Dosen sekaligus menjabat Dosen Wali/PA).
   - Middleware otorisasi berbasis Role & Permission Guard sesuai prinsip *least privilege*.
3. **Manajemen Profil Mandiri (SRS FR-021, Bab 31 Tabel 15, Bab 32 Tabel 16)**
   - Hak baca-tulis profil (*RW*) bagi semua role pengguna (`GET /api/v1/profile` dan `PUT /api/v1/profile`).
   - Pengambilan profil dinamis yang menggabungkan data akun inti dengan profil entitas spesifik (biodata Mahasiswa, Dosen, Admin, Calon Mahasiswa).
4. **Layanan Dasbor Portal Berbasis Peran (SRS Bab 9 & Bab 19)**
   - Portal Gateway yang menyajikan daftar modul kampus yang berhak diakses (`GET /api/v1/portal/modules`).
   - Endpoint ringkasan metrik dasbor (`GET /api/v1/portal/dashboard`) dengan data kontekstual:
     - **Mahasiswa:** semester aktif, status akademik, info dosen PA, modul SIA & SPADA (Bab 9).
     - **Dosen / Dosen Wali:** kelas yang diampu, jumlah mahasiswa perwalian aktif.
     - **Admin Akademik:** total mahasiswa aktif, total dosen, total prodi, status semester & kalender (Bab 19.1).
     - **Admin LMS:** total kelas SPADA aktif, ringkasan monitoring sistem pembelajaran (Bab 19.2).
     - **Super Admin:** total user & status akun, rekap role/permission, status audit log (Bab 19.3).
5. **Modul Master Data Dasar & Kalender (SRS Bab 10, Bab 22, Bab 28.2 - Tabel 13)**
   - Kelembagaan: Fakultas dan Program Studi.
   - Waktu & Kalender: Tahun Akademik, Semester (penguncian semester operasional), dan Agenda Kalender Akademik.
   - Akademik: Kurikulum, Master Mata Kuliah (SKS, semester paket), dan Penawaran Kelas Dasar.
   - Fasilitas: Gedung dan Ruangan Kelas.
   - File & Dokumen: Tabel metadata berkas dengan perlindungan akses terotorisasi (*SRS Bab 35*).
6. **Keamanan & Jejak Audit (SRS Bab 15 & Bab 35)**
   - Hashing password dengan *Argon2id* atau *Bcrypt*.
   - Tabel `AuditLog` untuk mencatat setiap aksi krusial: pergantian role, aktivasi akun, dan mutasi master data.
   - Validasi input ketat di sisi server (Zod DTO) dan penanganan eror yang konsisten (*SRS Bab 32.1*).

---

## 2. Arsitektur & Rekomendasi Tech Stack

- **Runtime & Bahasa:** Node.js (v20+ LTS) dengan ES Modules atau TypeScript.
- **Web Framework:** Express.js (arsitektur modular, middleware terpisah, responsif).
- **Database Relasional:** PostgreSQL (relasi data kuat, integritas referensial ACID, performa andal).
- **ORM & Migrasi:** Prisma ORM (tipe data aman, manajemen skema `schema.prisma`, migrasi otomatis, dan seeder terintegrasi).
- **Keamanan & Otorisasi:**
  - Password Hash: `argon2` / `bcryptjs`
  - Token Management: `jsonwebtoken` (Access Token umur pendek + Refresh Token di database)
  - HTTP Headers & Hardening: `helmet`, `cors`, `express-rate-limit`
  - Validasi Input: `zod`
- **Audit & Logging:**
  - Structured Logging: `winston` / `morgan`
  - Audit Trail Engine: Interceptor/Service pencatat mutasi ke tabel database `audit_logs`.

---

## 3. Desain Skema Database (Mengacu pada Data Dictionary SRS Bab 28.2)

```prisma
// ==========================================
// 1. AUTENTIKASI, AKUN, & RBAC (SRS Bab 28.2)
// ==========================================

model User {
  id            String          @id @default(uuid())
  username      String          @unique // NIM, NIDN, NIP, no_pendaftaran, atau username unik
  email         String          @unique
  password_hash String
  status        UserStatus      @default(ACTIVE) // ACTIVE, INACTIVE, SUSPENDED
  last_login_at DateTime?
  created_at    DateTime        @default(now())
  updated_at    DateTime        @updated_at

  user_roles    UserRole[]
  refresh_tokens RefreshToken[]
  audit_logs    AuditLog[]
  uploaded_files File[]

  // Profil relasional sesuai role (SRS Bab 28.1)
  mahasiswa_profile Mahasiswa?
  dosen_profile     Dosen?
  admin_profile     AdminProfile?
  calon_mhs_profile CalonMahasiswa?

  @@map("users")
}

enum UserStatus {
  ACTIVE
  INACTIVE
  SUSPENDED
}

model Role {
  id          String           @id @default(uuid())
  name        String           @unique // SUPER_ADMIN, ADMIN_AKADEMIK, ADMIN_LMS, DOSEN, DOSEN_WALI, MAHASISWA, CALON_MAHASISWA
  description String?
  created_at  DateTime         @default(now())

  user_roles       UserRole[]
  role_permissions RolePermission[]

  @@map("roles")
}

model Permission {
  id          String           @id @default(uuid())
  code        String           @unique // e.g. "user:read", "master:crud", "calendar:manage"
  name        String
  description String?
  created_at  DateTime         @default(now())

  role_permissions RolePermission[]

  @@map("permissions")
}

model UserRole {
  id         String   @id @default(uuid())
  user_id    String
  role_id    String
  created_at DateTime @default(now())

  user User @relation(fields: [user_id], references: [id], onDelete: Cascade)
  role Role @relation(fields: [role_id], references: [id], onDelete: Cascade)

  @@unique([user_id, role_id])
  @@map("user_roles")
}

model RolePermission {
  id            String   @id @default(uuid())
  role_id       String
  permission_id String

  role       Role       @relation(fields: [role_id], references: [id], onDelete: Cascade)
  permission Permission @relation(fields: [permission_id], references: [id], onDelete: Cascade)

  @@unique([role_id, permission_id])
  @@map("role_permissions")
}

model RefreshToken {
  id         String    @id @default(uuid())
  user_id    String
  token_hash String    @unique
  expires_at DateTime
  revoked_at DateTime?
  created_at DateTime  @default(now())

  user User @relation(fields: [user_id], references: [id], onDelete: Cascade)

  @@map("refresh_tokens")
}

// ==========================================
// 2. PROFIL PENGGUNA (SRS Bab 28.2)
// ==========================================

model Mahasiswa {
  id              String   @id @default(uuid())
  user_id         String   @unique
  nim             String   @unique
  nama            String
  prodi_id        String
  angkatan        Int
  status_akademik StatusAkademik @default(AKTIF) // AKTIF, CUTI, LULUS, DROP_OUT
  dosen_wali_id   String?
  created_at      DateTime @default(now())
  updated_at      DateTime @updated_at

  user       User         @relation(fields: [user_id], references: [id], onDelete: Cascade)
  prodi      ProgramStudi @relation(fields: [prodi_id], references: [id])
  dosen_wali Dosen?       @relation("DosenWaliMahasiswa", fields: [dosen_wali_id], references: [id])

  @@map("mahasiswa")
}

enum StatusAkademik {
  AKTIF
  CUTI
  LULUS
  DROP_OUT
}

model Dosen {
  id             String   @id @default(uuid())
  user_id        String   @unique
  nidn           String?  @unique
  nip            String?  @unique
  nama           String
  gelar_depan    String?
  gelar_belakang String?
  prodi_id       String?
  is_active      Boolean  @default(true)
  created_at     DateTime @default(now())
  updated_at     DateTime @updated_at

  user  User          @relation(fields: [user_id], references: [id], onDelete: Cascade)
  prodi ProgramStudi? @relation(fields: [prodi_id], references: [id])

  mahasiswa_bimbingan Mahasiswa[] @relation("DosenWaliMahasiswa")
  kelas_diampu        Kelas[]

  @@map("dosen")
}

model AdminProfile {
  id         String   @id @default(uuid())
  user_id    String   @unique
  nip        String?
  nama       String
  unit_kerja String   // "Akademik", "LMS/TI", "Pusat"
  created_at DateTime @default(now())
  updated_at DateTime @updated_at

  user User @relation(fields: [user_id], references: [id], onDelete: Cascade)

  @@map("admin_profiles")
}

model CalonMahasiswa {
  id                 String   @id @default(uuid())
  user_id            String   @unique
  no_pendaftaran     String   @unique
  nama               String
  status_seleksi     StatusSeleksi @default(MENUNGGU)
  prodi_pilihan_id   String?
  jalur_pendaftaran  String?
  created_at         DateTime @default(now())
  updated_at         DateTime @updated_at

  user  User          @relation(fields: [user_id], references: [id], onDelete: Cascade)
  prodi ProgramStudi? @relation(fields: [prodi_id], references: [id])

  @@map("calon_mahasiswa")
}

enum StatusSeleksi {
  MENUNGGU
  TERVERIFIKASI
  LULUS
  TIDAK_LULUS
  TERDAFTAR_ULANG
}

// ==========================================
// 3. MASTER DATA KELEMBAGAAN & KALENDER
// ==========================================

model Fakultas {
  id            String   @id @default(uuid())
  kode          String   @unique
  nama          String
  is_active     Boolean  @default(true)
  created_at    DateTime @default(now())
  updated_at    DateTime @updated_at

  program_studi ProgramStudi[]

  @@map("fakultas")
}

model ProgramStudi {
  id          String   @id @default(uuid())
  fakultas_id String
  kode        String   @unique
  nama        String
  jenjang     String   // "D3", "S1", "S2"
  is_active   Boolean  @default(true)
  created_at  DateTime @default(now())
  updated_at  DateTime @updated_at

  fakultas         Fakultas         @relation(fields: [fakultas_id], references: [id])
  kurikulum        Kurikulum[]
  mahasiswa        Mahasiswa[]
  dosen            Dosen[]
  calon_mahasiswa  CalonMahasiswa[]

  @@map("program_studi")
}

model TahunAkademik {
  id         String     @id @default(uuid())
  kode       String     @unique // "2026/2027"
  nama       String     // "Tahun Ajaran 2026/2027"
  is_active  Boolean    @default(true)
  created_at DateTime   @default(now())
  updated_at DateTime   @updated_at

  semester   Semester[]

  @@map("tahun_akademik")
}

model Semester {
  id                String       @id @default(uuid())
  tahun_akademik_id String
  tipe              SemesterTipe // GANJIL, GENAP, ANTARA
  tanggal_mulai     DateTime
  tanggal_selesai   DateTime
  is_active         Boolean      @default(false) // Hanya 1 semester operasional aktif
  created_at        DateTime     @default(now())
  updated_at        DateTime     @updated_at

  tahun_akademik    TahunAkademik      @relation(fields: [tahun_akademik_id], references: [id])
  kalender_akademik KalenderAkademik[]
  kelas             Kelas[]

  @@unique([tahun_akademik_id, tipe])
  @@map("semester")
}

enum SemesterTipe {
  GANJIL
  GENAP
  ANTARA
}

model KalenderAkademik {
  id          String         @id @default(uuid())
  semester_id String
  agenda      String         // Misal: "Periode KRS", "Perkuliahan", "UTS", "UAS"
  mulai       DateTime
  selesai     DateTime
  status      KalenderStatus @default(DIJADWALKAN) // DIJADWALKAN, BERJALAN, SELESAI
  created_at  DateTime       @default(now())
  updated_at  DateTime       @updated_at

  semester Semester @relation(fields: [semester_id], references: [id], onDelete: Cascade)

  @@map("kalender_akademik")
}

enum KalenderStatus {
  DIJADWALKAN
  BERJALAN
  SELESAI
}

// ==========================================
// 4. MASTER KURIKULUM, MATA KULIAH & KELAS
// ==========================================

model Kurikulum {
  id          String   @id @default(uuid())
  prodi_id    String
  nama        String   // "Kurikulum 2024"
  tahun_mulai Int
  is_active   Boolean  @default(true)
  created_at  DateTime @default(now())
  updated_at  DateTime @updated_at

  prodi       ProgramStudi  @relation(fields: [prodi_id], references: [id])
  mata_kuliah MataKuliah[]

  @@map("kurikulum")
}

model MataKuliah {
  id             String   @id @default(uuid())
  kurikulum_id   String
  kode           String   @unique
  nama           String
  sks            Int      // Bobot SKS total
  sks_teori      Int      @default(0)
  sks_praktik    Int      @default(0)
  semester_paket Int      @default(1)
  is_wajib       Boolean  @default(true)
  is_active      Boolean  @default(true)
  created_at     DateTime @default(now())
  updated_at     DateTime @updated_at

  kurikulum Kurikulum @relation(fields: [kurikulum_id], references: [id])
  kelas     Kelas[]

  @@map("mata_kuliah")
}

model Gedung {
  id         String    @id @default(uuid())
  kode       String    @unique
  nama       String
  created_at DateTime  @default(now())

  ruangan    Ruangan[]

  @@map("gedung")
}

model Ruangan {
  id         String   @id @default(uuid())
  gedung_id  String
  kode       String   @unique
  nama       String
  kapasitas  Int
  is_active  Boolean  @default(true)
  created_at DateTime @default(now())

  gedung     Gedung   @relation(fields: [gedung_id], references: [id])
  kelas      Kelas[]

  @@map("ruangan")
}

model Kelas {
  id             String   @id @default(uuid())
  mata_kuliah_id String
  semester_id    String
  dosen_id       String
  ruangan_id     String?
  kode_kelas     String   // "TI-A", "TI-B"
  kapasitas      Int      @default(40)
  created_at     DateTime @default(now())
  updated_at     DateTime @updated_at

  mata_kuliah MataKuliah @relation(fields: [mata_kuliah_id], references: [id])
  semester    Semester   @relation(fields: [semester_id], references: [id])
  dosen       Dosen      @relation(fields: [dosen_id], references: [id])
  ruangan     Ruangan?   @relation(fields: [ruangan_id], references: [id])

  @@unique([mata_kuliah_id, semester_id, kode_kelas])
  @@map("kelas")
}

// ==========================================
// 5. FILE & AUDIT TRAIL (SRS Bab 28.2 & Bab 35)
// ==========================================

model File {
  id         String   @id @default(uuid())
  nama       String
  path       String   // Lokasi internal storage yang terproteksi
  mime       String
  size       Int
  owner_id   String
  created_at DateTime @default(now())

  owner User @relation(fields: [owner_id], references: [id], onDelete: Cascade)

  @@map("files")
}

model AuditLog {
  id         String   @id @default(uuid())
  user_id    String?
  action     String   // "LOGIN", "LOGOUT", "CREATE", "UPDATE", "DELETE", "ROLE_CHANGE"
  entity     String   // Nama tabel / entitas target
  entity_id  String?
  old_values Json?
  new_values Json?
  ip_address String?
  user_agent String?
  waktu      DateTime @default(now())

  user User? @relation(fields: [user_id], references: [id], onDelete: SetNull)

  @@map("audit_logs")
}
```

---

## 4. Desain Spesifikasi API Endpoints MVP 1

### 4.1. Autentikasi & Akun (`/api/v1/auth` & Konseptual SRS Bab 32)
| Method | Endpoint Standar | Alias Konseptual SRS | Fungsi & Deskripsi | Akses |
|---|---|---|---|---|
| `POST` | `/api/v1/auth/login` | `/api/login` | Autentikasi username/email & password, mengembalikan access token & profile | Publik |
| `POST` | `/api/v1/auth/logout` | `/api/logout` | Mencabut refresh token dan mengakhiri sesi pengguna | Login |
| `POST` | `/api/v1/auth/refresh` | - | Mendapatkan access token baru menggunakan refresh token yang valid | Publik / Valid Refresh |
| `POST` | `/api/v1/auth/forgot-password` | - | Mengajukan permintaan reset kata sandi (*FR-015*) | Publik |
| `PUT` | `/api/v1/auth/change-password` | - | Mengganti kata sandi akun yang sedang aktif (*FR-016*) | Login |

### 4.2. Profil Pengguna (`/api/v1/profile` - SRS Bab 31 & Bab 32)
| Method | Endpoint | Fungsi & Deskripsi | Akses (Tabel 15) |
|---|---|---|---|
| `GET` | `/api/v1/profile` | Mengambil data akun, profil entitas (Mahasiswa/Dosen/Admin), role, dan permission | Semua Role (R) |
| `PUT` | `/api/v1/profile` | Memperbarui profil mandiri (telepon, kontak darurat, alamat) | Semua Role (W) |

### 4.3. Dasbor Portal (`/api/v1/portal` - SRS Bab 9 & Bab 19)
| Method | Endpoint | Fungsi & Deskripsi | Akses |
|---|---|---|---|
| `GET` | `/api/v1/portal/modules` | Menampilkan modul yang berhak diakses user (PMB, SIA, SPADA) | Login |
| `GET` | `/api/v1/portal/dashboard` | Menyajikan data agregasi ringkas spesifik berdasarkan role: | Login |
| | | - **Mahasiswa:** Status semester aktif, prodi, dosen wali, launcher SIA/SPADA | |
| | | - **Dosen/PA:** Daftar kelas aktif yang diampu, jumlah mahasiswa bimbingan PA | |
| | | - **Admin Akademik:** Total mahasiswa aktif, total dosen, total prodi, status kalender/KRS | |
| | | - **Admin LMS:** Total kelas aktif di SPADA, metrik aktivitas pembelajaran | |
| | | - **Super Admin:** Ringkasan user & status akun, rekap role, log aktivitas terkini | |

### 4.4. Master Kalender Akademik (`/api/v1/calendar` - SRS Bab 22 & Bab 32)
| Method | Endpoint | Alias Konseptual | Fungsi & Deskripsi | Akses (Tabel 15) |
|---|---|---|---|---|
| `GET` | `/api/v1/calendar` | `/api/calendar` | Mengambil daftar agenda kalender akademik semester aktif | Login (View) |
| `POST` | `/api/v1/calendar` | - | Membuat agenda kalender akademik baru | Admin Akademik, Super Admin |
| `PUT` | `/api/v1/calendar/:id` | - | Mengubah rincian agenda dan tanggal periode | Admin Akademik, Super Admin |
| `DELETE`| `/api/v1/calendar/:id` | - | Menghapus atau menonaktifkan agenda | Admin Akademik, Super Admin |

### 4.5. Master Kelembagaan, Kurikulum, Mata Kuliah & Kelas (`/api/v1/master/*`)
| Method | Endpoint | Fungsi & Deskripsi | Akses |
|---|---|---|---|
| `GET/POST` | `/api/v1/master/fakultas` | List & Tambah Fakultas | Admin Akademik, Super Admin |
| `GET/PUT/DEL` | `/api/v1/master/fakultas/:id` | Detail, Update, Hapus Fakultas | Admin Akademik, Super Admin |
| `GET/POST` | `/api/v1/master/prodi` | List & Tambah Program Studi | Admin Akademik, Super Admin |
| `GET/PUT/DEL` | `/api/v1/master/prodi/:id` | Detail, Update, Hapus Program Studi | Admin Akademik, Super Admin |
| `GET/POST` | `/api/v1/master/tahun-akademik`| List & Tambah Tahun Akademik | Admin Akademik, Super Admin |
| `GET/POST` | `/api/v1/master/semester` | List & Tambah Semester | Admin Akademik, Super Admin |
| `PATCH` | `/api/v1/master/semester/:id/activate` | Mengaktifkan semester operasional utama kampus | Admin Akademik, Super Admin |
| `GET/POST` | `/api/v1/master/kurikulum` | List & Tambah Kurikulum | Admin Akademik |
| `GET/POST` | `/api/v1/master/mata-kuliah`| List & Tambah Mata Kuliah (*SRS Data Dictionary*) | Admin Akademik |
| `GET/PUT/DEL` | `/api/v1/master/mata-kuliah/:id` | Detail, Update, Hapus Mata Kuliah | Admin Akademik |
| `GET/POST` | `/api/v1/master/gedung` | List & Tambah Gedung | Admin Akademik, Admin LMS |
| `GET/POST` | `/api/v1/master/ruangan` | List & Tambah Ruangan Kelas | Admin Akademik, Admin LMS |
| `GET/POST` | `/api/v1/master/kelas` | List & Buka Penawaran Kelas untuk semester aktif | Admin Akademik |

### 4.6. Manajemen Pengguna & Hak Akses (`/api/v1/users` & `/api/v1/roles`)
| Method | Endpoint | Fungsi & Deskripsi | Akses (Tabel 15) |
|---|---|---|---|
| `GET` | `/api/v1/users` | List akun pengguna dengan pagination, filter role, & search | Super Admin, Admin |
| `POST` | `/api/v1/users` | Pembuatan akun baru manual beserta profilnya | Super Admin |
| `GET` | `/api/v1/users/:id` | Detail data akun, profil mahasiswa/dosen, dan hak akses | Super Admin, Admin |
| `PUT` | `/api/v1/users/:id/roles` | Penugasan atau pencabutan role pengguna (*Dicatat di Audit*) | Super Admin |
| `PATCH` | `/api/v1/users/:id/status`| Mengubah status akun (`ACTIVE`, `INACTIVE`, `SUSPENDED`) | Super Admin |
| `GET/POST` | `/api/v1/roles` | List dan kelola role sistem | Super Admin |
| `GET/POST` | `/api/v1/permissions` | List dan kelola permission/hak akses fungsi | Super Admin |

### 4.7. Audit Log (`/api/v1/audit-logs` - SRS Bab 35)
| Method | Endpoint | Fungsi & Deskripsi | Akses (Tabel 15) |
|---|---|---|---|
| `GET` | `/api/v1/audit-logs` | Memantau seluruh rekaman jejak audit sistem | Super Admin, Admin (sesuai kewenangan) |
| `GET` | `/api/v1/audit-logs/:id` | Detail riwayat perubahan (`old_values` vs `new_values`) | Super Admin |

---

## 5. Struktur Direktori Backend (Modular Architecture)

```text
backend/
├── prisma/
│   ├── schema.prisma              # Definisi model lengkap sesuai SRS Bab 28.2
│   ├── migrations/                # Riwayat migrasi database PostgreSQL
│   └── seed.js                    # Seeder 8 Role, Super Admin, dan Master Data Awal
├── src/
│   ├── config/                    # Environment variables, database, JWT config
│   ├── constants/                 # Role enums, permissions code, error codes
│   ├── middlewares/
│   │   ├── auth.middleware.js     # Validasi JWT Access Token
│   │   ├── rbac.middleware.js     # Proteksi Role & Permission Guard (SRS Bab 31)
│   │   ├── audit.middleware.js    # Interceptor otomatis perekam jejak mutasi
│   │   ├── validate.middleware.js # Validasi Zod DTO
│   │   └── error.middleware.js    # Global error handler (standarisasi respons API)
│   ├── modules/
│   │   ├── auth/                  # Login, Logout, Refresh, Password
│   │   ├── profile/               # Manajemen Profil mandiri (GET/PUT)
│   │   ├── portal/                # Launcher modul & agregator Dashboard (Bab 9 & 19)
│   │   ├── calendar/              # Agenda Kalender Akademik (Bab 22)
│   │   ├── users/                 # Manajemen User, Profil, Roles & Permissions
│   │   ├── master/
│   │   │   ├── kelembagaan/       # Fakultas, Program Studi
│   │   │   ├── kalender-dasar/    # Tahun Akademik, Semester Aktif
│   │   │   ├── akademik/          # Kurikulum, Mata Kuliah, Kelas Dasar
│   │   │   └── fasilitas/         # Gedung, Ruangan
│   │   └── audit-log/             # Pemantauan Audit Trail
│   ├── utils/                     # Password hasher (argon2/bcrypt), token generator, api-response
│   └── app.js                     # Inisialisasi Express, routing, middleware
├── server.js                      # Entry point listener
├── .env.example
├── package.json
└── README.md
```

---

## 6. Tahapan Eksekusi Pengerjaan (Step-by-Step Backend Roadmap)

### Fase 1: Setup Lingkungan & Skema Database (Hari 1-2)
- Inisialisasi proyek Node.js backend (`package.json`, `.gitignore`, `.env.example`).
- Konfigurasi Prisma ORM dengan PostgreSQL.
- Implementasi skema `schema.prisma` yang merefleksikan seluruh kamus data SRS Bab 28.2.
- Eksekusi migrasi awal (`npx prisma migrate dev --name init_mvp1`).
- Pembuatan seeder komprehensif (`seed.js`):
  - 8 Role resmi sistem.
  - Akun `Super Admin` awal.
  - Master data rintisan: Fakultas, Program Studi, Tahun Akademik (misal 2026/2027), Semester Ganjil aktif, Mata Kuliah contoh, Gedung & Ruangan.

### Fase 2: Autentikasi, Profil & RBAC Engine (Hari 3-4)
- Helper enkripsi kata sandi menggunakan Argon2 atau Bcrypt dengan penanganan salt aman.
- Generator JWT (Access Token 15 menit, Refresh Token 7 hari tersimpan aman di database).
- Implementasi modul autentikasi: `POST /api/v1/auth/login`, `/refresh`, `/logout`, `/change-password`.
- Middleware proteksi: `authenticateToken` dan `requireRole(...)`.
- Implementasi modul profil pengguna mandiri: `GET /api/v1/profile` dan `PUT /api/v1/profile` dengan hak akses RW untuk semua role.

### Fase 3: Layanan Audit Trail & Keamanan Server (Hari 5)
- Pembuatan `AuditLogService` asinkron untuk mencatat mutasi data krusial tanpa memperlambat respons API.
- Integrasi audit pada perubahan role pengguna, aktivasi/penonaktifan user, dan mutasi master data.
- Implementasi endpoint `GET /api/v1/audit-logs`.
- Konfigurasi keamanan HTTP: Helmet, CORS terproteksi, dan pembatasan frekuensi request (*rate limiting*).

### Fase 4: Modul Master Data Dasar & Kalender Akademik (Hari 6-8)
- Validasi skema Zod untuk setiap entitas master data.
- Implementasi endpoint CRUD Fakultas & Program Studi.
- Implementasi endpoint CRUD Tahun Akademik & Semester (dengan validasi bisnis: hanya 1 semester berstatus aktif serentak).
- Implementasi endpoint CRUD Kurikulum, Mata Kuliah, dan Ruangan Kelas.
- Implementasi endpoint Kalender Akademik (`GET /api/v1/calendar`, `POST /api/v1/calendar`).
- Standardisasi respons JSON: `{ success: true, data: ..., message: "...", meta: { page, limit, total } }`.

### Fase 5: Dasbor Portal & Integrator Modul (Hari 9)
- Layanan deteksi hak akses modul kampus (`/api/v1/portal/modules`) sesuai aktor login.
- Implementasi agregator dasbor (`/api/v1/portal/dashboard`) sesuai spesifikasi SRS Bab 9 & Bab 19:
  - Return data spesifik untuk Mahasiswa, Dosen, Admin Akademik, Admin LMS, dan Super Admin.

### Fase 6: Pengujian, Validasi Kepatuhan SRS & Handoff (Hari 10)
- Pengujian otomatis (Unit/Integration Test) alur Login, proteksi role, dan update profil.
- Pengujian pencatatan mutasi pada tabel `audit_logs`.
- Validasi kesesuaian endpoint konseptual SRS Bab 32 (`/api/login`, `/api/profile`, `/api/calendar`).
- Dokumentasi API (OpenAPI 3.0 / Swagger atau Postman Collection).

---

## 7. Kriteria Keberhasilan (Definition of Done MVP 1 Backend)

1. **Kepatuhan Autentikasi & RBAC:** Seluruh 8 role aktor dapat terautentikasi dan menerima respons modul serta izin akses yang sesuai (*SRS Bab 3 & Bab 31*). Akun tidak aktif ditolak otomatis.
2. **Kesesuaian Kamus Data:** Seluruh tabel inti MVP 1 (`User`, `Role`, `Permission`, `Mahasiswa`, `Dosen`, `ProgramStudi`, `MataKuliah`, `Kelas`, `Semester`, `KalenderAkademik`, `File`, `AuditLog`) terimplementasi sesuai SRS Bab 28.2.
3. **Manajemen Profil Mandiri Berfungsi:** Endpoint `GET /api/v1/profile` dan `PUT /api/v1/profile` berjalan untuk semua role pengguna (*SRS Bab 31 Tabel 15*).
4. **Dasbor Portal Menghasilkan Metrik Relevan:** Endpoint portal mengembalikan navigasi modul yang valid dan ringkasan metrik statistik sesuai spesifikasi masing-masing admin (*SRS Bab 19*).
5. **Jejak Audit Terverifikasi:** Setiap perubahan role pengguna dan mutasi master data sensitif terekam akurat di tabel `audit_logs` (*SRS Bab 35*).