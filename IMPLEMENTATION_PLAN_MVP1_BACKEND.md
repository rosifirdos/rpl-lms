# Implementation Plan: Backend MVP 1
# SPADA (Learning Management System) Universitas PGRI Semarang (UPGRIS)
**Team Membangun Negeri — Rencana Eksekusi Teknis Backend: Fondasi, Akun, Master Data & Direct Enrollment**

---

Dokumen ini memuat rencana implementasi teknis sisi **Backend** untuk mencapai target **MVP 1** secara presisi, yang diselaraskan dengan spesifikasi pada [SRS.md](SRS.md) (*Bab 3, 4, 10, 13, 21, 27, 28, 29*) dan [PRD.md](PRD.md) (*Bab 2, 3, 5, 7*):
> **Definisi MVP 1 (SRS Bab 27 & PRD Bab 7):**
> *"Fondasi arsitektur, autentikasi multi-kredensial & manajemen sesi, profil mandiri, master akun pengguna & RBAC 3 peran, master mata kuliah, pembukaan kelas perkuliahan, modul direct enrollment mahasiswa oleh Admin, dan peninjau jejak audit (audit trail)."*

---

## 1. Tujuan & Ruang Lingkup MVP 1 (Sisi Backend)

1. **Autentikasi Terpadu & Manajemen Sesi (SRS Bab 4 & Bab 21)**
   - Autentikasi multi-kredensial (`username` / NIM / NIDN / NIP atau `email` + `password`).
   - Penolakan akses secara otomatis untuk akun berstatus `INACTIVE` atau `SUSPENDED` (HTTP 403 Forbidden).
   - Pengelolaan sesi aman dengan JWT (Access Token umur pendek bertanda tangan kriptografis dan Refresh Token di database).
   - Fitur logout aman, pencabutan token, dan alur permohonan reset kata sandi (*forgot password*).
2. **Otorisasi Berbasis Peran & Matriks Akses (3 Peran Resmi SPADA):**
   - Mendukung 3 peran resmi terstandar: `mahasiswa`, `dosen`, dan `admin` (*Role Tunggal*).
   - Middleware otorisasi berbasis Role Guard (`authenticateToken`, `requireRole('admin')`, `requireRole(['dosen', 'admin'])`).
   - Penegakan prinsip hak akses minimum (*least privilege*).
3. **Manajemen Profil Mandiri (Mahasiswa, Dosen, Admin):**
   - Hak akses baca dan ubah data profil mandiri (`GET /api/profile` dan `PUT /api/profile`).
   - Unggah dan pembaharuan foto profil/avatar pengguna (`POST /api/profile/avatar`) dengan validasi format gambar (.jpg/.jpeg/.png) dan batasan ukuran maksimal 2MB.
   - Penggantian kata sandi mandiri (`PUT /api/profile/password`) dengan validasi kata sandi lama.
4. **Layanan Dasbor Kontekstual SPADA LMS (`GET /api/dashboard`):**
   - Endpoint agregasi ringkasan data dasbor yang disesuaikan secara presisi untuk 3 aktor:
     - **Mahasiswa:** semester aktif, status akademik, dan daftar kelas yang dienroll oleh Admin (id, nama mata kuliah, kode kelas, SKS, nama dosen pengampu).
     - **Dosen:** data profil dosen bergelar (NIDN), daftar kelas yang diampu pada semester aktif, dan jumlah mahasiswa terdaftar di tiap kelas.
     - **Admin:** ringkasan metrik statistik sistem (Total Mahasiswa, Total Dosen, Total Mata Kuliah, Total Kelas Pembelajaran, Total Enrollment Aktif).
5. **Modul Master Data Akademik SPADA (Khusus Admin):**
   - **Manajemen Akun Pengguna:** Endpoint CRUD akun (Mahasiswa, Dosen, Admin), pencarian multi-kolom, filter 3 role, filter status akun (`ACTIVE`, `INACTIVE`, `SUSPENDED`), dan endpoint ganti status/reset password.
   - **Master Mata Kuliah:** Endpoint CRUD mata kuliah (Kode MK unik, Nama Mata Kuliah, Beban SKS 1–6, Deskripsi Kompetensi).
   - **Pembukaan Kelas Perkuliahan:** Endpoint pembukaan kelas semester aktif (relasi ke Mata Kuliah, Dosen Pengampu, Kode/Nama Kelas, Tahun Akademik, Semester Ganjil/Genap, Kapasitas Kuota).
6. **Modul Direct Enrollment Mahasiswa (Khusus Admin — Aturan Bisnis BR-002):**
   - Pendaftaran kepesertaan kelas mahasiswa langsung oleh Admin tanpa alur KRS atau persetujuan Dosen PA.
   - Endpoint melihat daftar mahasiswa terdaftar pada suatu kelas (`GET /api/admin/classes/:classId/enrollments`).
   - Endpoint melihat daftar mahasiswa yang belum terdaftar di kelas (`GET /api/admin/classes/:classId/available-students`).
   - Endpoint pendaftaran mahasiswa ke kelas (`POST /api/admin/enrollments`) dengan dukungan penambahan individual maupun *batch enrollment* (array `student_ids`), divalidasi terhadap kapasitas daya tampung kelas.
   - Endpoint pencabutan kepesertaan (*unenroll*) mahasiswa dari kelas (`DELETE /api/admin/enrollments/:id`).
7. **Keamanan & Jejak Audit (Audit Trail Engine - SRS Bab 10 & Bab 21):**
   - Penyimpanan hash password menggunakan *Argon2id* atau *Bcrypt* dengan salt aman.
   - Perekaman mutasi data penting ke tabel `audit_logs` (login, perubahan akun, mutasi master mata kuliah & kelas, aksi enrollment mahasiswa).
   - Endpoint peninjau audit log (`GET /api/admin/audit-logs`) dan inspeksi detail perbandingan JSON (`GET /api/admin/audit-logs/:id`).
   - Validasi data input ketat di sisi server menggunakan *Zod DTO*.

---

## 2. Arsitektur & Rekomendasi Tech Stack

- **Runtime & Bahasa:** Node.js (v20+ LTS) dengan TypeScript atau ES Modules modern.
- **Web Framework:** Express.js (arsitektur modular berlapis: Routes → Middlewares → Controllers → Services → Prisma Repository).
- **Database Relasional:** PostgreSQL (integritas referensial ACID, performa tinggi, indeks unik).
- **ORM & Migrasi:** Prisma ORM (manajemen skema `schema.prisma`, migrasi otomatis, dan seeder data awal).
- **Keamanan & Validasi:**
  - Password Hash: `argon2` / `bcryptjs`
  - Token Management: `jsonwebtoken` (Access Token umur pendek + Refresh Token bertanda tangan di DB)
  - HTTP Hardening: `helmet`, `cors`, `express-rate-limit`
  - Validasi Schema DTO: `zod`
- **File Storage (Avatar Pengguna MVP 1):**
  - Penyimpanan file lokal terproteksi (*private storage*) dengan sanitasi nama berkas unik (UUID) dan inspeksi MIME-type.
- **Audit & Logging:**
  - Structured Logging: `winston` / `morgan`
  - Audit Trail Engine: Service pencatat mutasi data ke tabel `audit_logs`.

---

## 3. Desain Skema Database (Mengacu pada SRS Bab 13 & Bab 28)

```prisma
// ==========================================
// 1. PENGGUNA, PROFIL & RBAC SPADA LMS
// ==========================================

model User {
  id            String      @id @default(uuid())
  username      String      @unique // NIM, NIDN, NIP, atau username unik
  email         String      @unique
  password_hash String
  role          UserRole    @default(mahasiswa) // mahasiswa, dosen, admin
  status        UserStatus  @default(ACTIVE)    // ACTIVE, INACTIVE, SUSPENDED
  last_login_at DateTime?
  created_at    DateTime    @default(now())
  updated_at    DateTime    @updated_at

  profile        Profile?
  mahasiswa      Mahasiswa?
  dosen          Dosen?
  refresh_tokens RefreshToken[]
  audit_logs     AuditLog[]
  uploaded_files File[]

  @@map("users")
}

enum UserRole {
  mahasiswa
  dosen
  admin
}

enum UserStatus {
  ACTIVE
  INACTIVE
  SUSPENDED
}

model Profile {
  id             String   @id @default(uuid())
  user_id        String   @unique
  full_name      String
  phone          String?
  bio            String?
  avatar_file_id String?
  created_at     DateTime @default(now())
  updated_at     DateTime @updated_at

  user        User  @relation(fields: [user_id], references: [id], onDelete: Cascade)
  avatar_file File? @relation("ProfileAvatar", fields: [avatar_file_id], references: [id], onDelete: SetNull)

  @@map("profiles")
}

model Mahasiswa {
  id         String   @id @default(uuid())
  user_id    String   @unique
  nim        String   @unique
  prodi      String   // Program Studi (misal: "Teknik Informatika")
  angkatan   Int      // Tahun Angkatan (misal: 2024)
  created_at DateTime @default(now())
  updated_at DateTime @updated_at

  user        User         @relation(fields: [user_id], references: [id], onDelete: Cascade)
  enrollments Enrollment[]

  @@map("mahasiswa")
}

model Dosen {
  id             String   @id @default(uuid())
  user_id        String   @unique
  nidn           String?  @unique
  nip            String?  @unique
  gelar_depan    String?
  gelar_belakang String?
  created_at     DateTime @default(now())
  updated_at     DateTime @updated_at

  user    User    @relation(fields: [user_id], references: [id], onDelete: Cascade)
  classes Class[] // Kelas-kelas yang diampu dosen

  @@map("dosen")
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
// 2. MASTER MATA KULIAH, KELAS & ENROLLMENT
// ==========================================

model Course {
  id          String   @id @default(uuid())
  code        String   @unique // Kode MK unik (misal: "TIF101")
  name        String   // Nama Mata Kuliah
  credits     Int      // Beban SKS (1 s.d. 6)
  description String?  // Deskripsi Kompetensi
  is_active   Boolean  @default(true)
  created_at  DateTime @default(now())
  updated_at  DateTime @updated_at

  classes Class[]

  @@map("courses")
}

model Class {
  id            String   @id @default(uuid())
  course_id     String
  lecturer_id   String
  academic_year String   // misal: "2026/2027"
  semester      Semester // ganjil, genap
  name          String   // Kode/Nama Kelas (misal: "TI-A")
  capacity      Int      @default(40)
  created_at    DateTime @default(now())
  updated_at    DateTime @updated_at

  course      Course       @relation(fields: [course_id], references: [id])
  lecturer    Dosen        @relation(fields: [lecturer_id], references: [id])
  enrollments Enrollment[]

  @@unique([course_id, academic_year, semester, name])
  @@map("classes")
}

enum Semester {
  ganjil
  genap
}

model Enrollment {
  id          String   @id @default(uuid())
  class_id    String
  student_id  String
  enrolled_by String   // ID Admin yang melakukan direct enrollment
  enrolled_at DateTime @default(now())

  class   Class     @relation(fields: [class_id], references: [id], onDelete: Cascade)
  student Mahasiswa @relation(fields: [student_id], references: [id], onDelete: Cascade)

  @@unique([class_id, student_id])
  @@map("enrollments")
}

// ==========================================
// 3. STORAGE BERKAS & AUDIT TRAIL
// ==========================================

model File {
  id            String   @id @default(uuid())
  original_name String
  storage_name  String   @unique
  file_path     String   // Lokasi internal storage yang terproteksi
  mime_type     String
  size_bytes    Int
  uploaded_by   String
  created_at    DateTime @default(now())

  uploader User      @relation(fields: [uploaded_by], references: [id], onDelete: Cascade)
  profiles Profile[] @relation("ProfileAvatar")

  @@map("files")
}

model AuditLog {
  id         String   @id @default(uuid())
  user_id    String?
  action     String   // "LOGIN", "LOGOUT", "CREATE", "UPDATE", "DELETE", "ENROLL", "UNENROLL"
  entity     String   // "User", "Course", "Class", "Enrollment", "Profile"
  entity_id  String?
  old_values Json?
  new_values Json?
  ip_address String?
  user_agent String?
  created_at DateTime @default(now())

  user User? @relation(fields: [user_id], references: [id], onDelete: SetNull)

  @@map("audit_logs")
}
```

---

## 4. Desain Spesifikasi API Endpoints MVP 1

### 4.1. Autentikasi & Manajemen Sesi (`/api/auth`)
| Method | Endpoint | Fungsi & Deskripsi | Hak Akses |
|---|---|---|---|
| `POST` | `/api/auth/login` | Login dengan username/email & password, validasi status akun, kembalikan JWT tokens & info user | Publik |
| `POST` | `/api/auth/logout` | Cabut refresh token dan akhiri sesi login | Login |
| `POST` | `/api/auth/refresh` | Perbarui access token menggunakan refresh token valid | Publik / Refresh |
| `POST` | `/api/auth/forgot-password` | Ajukan permohonan pemulihan kata sandi via email terdaftar | Publik |

### 4.2. Profil Pengguna Mandiri (`/api/profile`)
| Method | Endpoint | Fungsi & Deskripsi | Hak Akses |
|---|---|---|---|
| `GET` | `/api/profile` | Ambil data akun login, biodata profil, identitas mahasiswa/dosen | Login (Semua Role) |
| `PUT` | `/api/profile` | Perbarui nama lengkap, nomor telepon, bio profil mandiri | Login (Semua Role) |
| `POST` | `/api/profile/avatar` | Unggah/ganti foto profil (validasi format .jpg/.jpeg/.png, maks 2MB) | Login (Semua Role) |
| `PUT` | `/api/profile/password` | Ganti kata sandi mandiri dengan validasi kata sandi lama | Login (Semua Role) |

### 4.3. Dasbor Kontekstual SPADA (`/api/dashboard`)
| Method | Endpoint | Fungsi & Deskripsi | Hak Akses |
|---|---|---|---|
| `GET` | `/api/dashboard` | Ambil data agregasi dasbor spesifik peran: | Login (Semua Role) |
| | | - **Mahasiswa:** info profil, daftar kelas enrolled (id, nama MK, SKS, dosen) | |
| | | - **Dosen:** info dosen bergelar (NIDN), kelas diampu, jumlah mahasiswa terdaftar | |
| | | - **Admin:** 4 metrik sistem (Total Mhs, Dosen, Mata Kuliah, Kelas & Enrollment Aktif) | |

### 4.4. Kelas Pembelajaran Mahasiswa & Dosen (`/api/classes`)
| Method | Endpoint | Fungsi & Deskripsi | Hak Akses |
|---|---|---|---|
| `GET` | `/api/classes` | Mahasiswa: list kelas yang dienroll; Dosen: list kelas yang diampu | Mahasiswa, Dosen |
| `GET` | `/api/classes/:id` | Detail informasi kelas perkuliahan beserta dosen pengampu | Mahasiswa, Dosen, Admin |

### 4.5. Manajemen Pengguna SPADA (`/api/admin/users`)
| Method | Endpoint | Fungsi & Deskripsi | Hak Akses |
|---|---|---|---|
| `GET` | `/api/admin/users` | List akun pengguna (pagination, search, filter role 3 peran, filter status) | Admin |
| `POST` | `/api/admin/users` | Tambah pengguna baru (Mahasiswa, Dosen, Admin) beserta profil identitas | Admin |
| `GET` | `/api/admin/users/:id` | Detail lengkap akun pengguna dan profil terkait | Admin |
| `PUT` | `/api/admin/users/:id` | Perbarui informasi akun dan profil pengguna | Admin |
| `PATCH`| `/api/admin/users/:id/status`| Ubah status akun (`ACTIVE`, `INACTIVE`, `SUSPENDED`) *(Dicatat di Audit)* | Admin |
| `PUT` | `/api/admin/users/:id/reset-password` | Reset kata sandi akun pengguna oleh Admin *(Dicatat di Audit)* | Admin |

### 4.6. Master Mata Kuliah & Pembukaan Kelas (`/api/admin/courses` & `/api/admin/classes`)
| Method | Endpoint | Fungsi & Deskripsi | Hak Akses |
|---|---|---|---|
| `GET` | `/api/admin/courses` | List master mata kuliah dengan pencarian dan paginasi | Admin |
| `POST` | `/api/admin/courses` | Tambah mata kuliah baru (Kode unik, Nama, SKS 1–6, Deskripsi) | Admin |
| `GET` | `/api/admin/courses/:id` | Detail mata kuliah | Admin |
| `PUT` | `/api/admin/courses/:id` | Perbarui data mata kuliah | Admin |
| `DELETE`| `/api/admin/courses/:id`| Hapus/Nonaktifkan mata kuliah | Admin |
| `GET` | `/api/admin/classes` | List pembukaan kelas perkuliahan (filter semester & MK) | Admin |
| `POST` | `/api/admin/classes` | Buka kelas perkuliahan semester aktif (pilih MK, Dosen, Kuota) | Admin |
| `GET` | `/api/admin/classes/:id` | Detail kelas perkuliahan dan kuota daya tampung | Admin |
| `PUT` | `/api/admin/classes/:id` | Perbarui informasi kelas perkuliahan | Admin |
| `DELETE`| `/api/admin/classes/:id`| Hapus/Tutup kelas perkuliahan | Admin |

### 4.7. Modul Direct Enrollment Mahasiswa (`/api/admin/enrollments`)
| Method | Endpoint | Fungsi & Deskripsi | Hak Akses |
|---|---|---|---|
| `GET` | `/api/admin/classes/:classId/enrollments` | Ambil daftar mahasiswa yang telah terdaftar di kelas | Admin |
| `GET` | `/api/admin/classes/:classId/available-students` | Ambil daftar mahasiswa yang belum terdaftar di kelas (bisa dienroll) | Admin |
| `POST` | `/api/admin/enrollments` | Daftarkan mahasiswa ke kelas (dukungan *batch array* `student_ids`), validasi kuota | Admin |
| `DELETE`| `/api/admin/enrollments/:id` | Cabut kepesertaan (*unenroll*) mahasiswa dari kelas | Admin |

### 4.8. Peninjau Jejak Audit (`/api/admin/audit-logs`)
| Method | Endpoint | Fungsi & Deskripsi | Hak Akses |
|---|---|---|---|
| `GET` | `/api/admin/audit-logs` | Pantau seluruh rekaman audit sistem (filter tanggal, aksi, entitas, user) | Admin |
| `GET` | `/api/admin/audit-logs/:id` | Detail rekaman audit dengan perbandingan JSON (`old_values` vs `new_values`) | Admin |

---

## 5. Struktur Direktori Backend (Modular Architecture)

```text
backend/
├── prisma/
│   ├── schema.prisma              # Definisi model database SPADA LMS MVP 1
│   ├── migrations/                # Riwayat migrasi database PostgreSQL
│   └── seed.js                    # Seeder Admin awal, Dosen contoh, Mahasiswa contoh & MK awal
├── src/
│   ├── config/                    # Konfigurasi env, database prisma, jwt, upload directory
│   ├── constants/                 # Role enums ('mahasiswa', 'dosen', 'admin'), HTTP status codes
│   ├── middlewares/
│   │   ├── auth.middleware.js     # Validasi JWT Access Token & verifikasi status user aktif
│   │   ├── rbac.middleware.js     # Role Guard (requireRole)
│   │   ├── audit.middleware.js    # Interceptor otomatis pencatat jejak mutasi
│   │   ├── upload.middleware.js   # Handler unggah berkas (multer) dengan validasi MIME & batas 2MB
│   │   ├── validate.middleware.js # Validasi Zod DTO
│   │   └── error.middleware.js    # Global error handler (standarisasi respons API)
│   ├── modules/
│   │   ├── auth/                  # Controller, Service, DTO: Login, Logout, Refresh, Forgot Password
│   │   ├── profile/               # Controller, Service: Profil mandiri, upload avatar, ganti password
│   │   ├── dashboard/             # Controller, Service: Agregasi metrik kontekstual 3 peran
│   │   ├── classes/               # Controller, Service: Akses kelas untuk Mahasiswa & Dosen
│   │   ├── admin/
│   │   │   ├── users/             # CRUD akun pengguna (3 peran), filter status, reset password
│   │   │   ├── courses/           # CRUD master mata kuliah
│   │   │   ├── classes/           # CRUD pembukaan kelas perkuliahan
│   │   │   ├── enrollments/       # Modul Direct Enrollment mahasiswa (individual & batch)
│   │   │   └── audit-log/         # Pemantauan jejak audit & inspeksi JSON diff
│   │   └── storage/               # File service: Penyimpanan aman & streaming berkas avatar
│   ├── utils/                     # Password hasher (argon2/bcrypt), token generator, api-response
│   └── app.js                     # Inisialisasi Express, routing, middleware
├── server.js                      # Entry point listener server HTTP
├── .env.example
├── package.json
└── README.md
```

---

## 6. Tahapan Eksekusi Pengerjaan (Step-by-Step Roadmap)

### Fase 1: Setup Lingkungan & Skema Database (Hari 1–2)
- Inisialisasi proyek Node.js backend (`package.json`, `.env.example`).
- Konfigurasi Prisma ORM dengan database PostgreSQL.
- Implementasi skema `schema.prisma` yang merefleksikan model User, Profile, Mahasiswa, Dosen, Course, Class, Enrollment, File, dan AuditLog.
- Eksekusi migrasi awal database (`npx prisma migrate dev --name init_spada_mvp1`).
- Pembuatan seeder awal (`seed.js`): Akun Admin utama, 3 akun Dosen contoh, 10 akun Mahasiswa contoh, 5 Master Mata Kuliah rintisan, dan 2 Pembukaan Kelas contoh.

### Fase 2: Autentikasi, Manajemen Sesi & RBAC Guard (Hari 3–4)
- Implementasi helper enkripsi password (Argon2 / Bcrypt) dan generator JWT token.
- Implementasi endpoint autentikasi: `POST /api/auth/login`, `/refresh`, `/logout`, `/forgot-password`.
- Penegakan aturan bisnis: Akun `INACTIVE` atau `SUSPENDED` ditolak saat login dengan pesan informatif.
- Pembuatan middleware `authenticateToken` dan `requireRole`.
- Implementasi modul profil mandiri: `GET /api/profile`, `PUT /api/profile`, `POST /api/profile/avatar`, `PUT /api/profile/password`.

### Fase 3: Layanan Audit Trail Engine (Hari 5)
- Pembuatan `AuditLogService` untuk mencatat mutasi data krusial secara terstruktur.
- Integrasi audit pada pembuatan akun, ganti status user, reset password, pembukaan kelas, dan aksi enrollment.
- Implementasi endpoint peninjau audit: `GET /api/admin/audit-logs` dan `GET /api/admin/audit-logs/:id`.
- Konfigurasi hardening HTTP: Helmet, CORS terproteksi, dan *express-rate-limit*.

### Fase 4: Master Data Akademik SPADA (Hari 6–7)
- Validasi Zod schema untuk entitas User, Course, dan Class.
- Implementasi endpoint Manajemen Pengguna (`/api/admin/users`): list, search, filter role/status, create user, update status akun, reset password.
- Implementasi endpoint Master Mata Kuliah (`/api/admin/courses`): list, create, update, delete.
- Implementasi endpoint Pembukaan Kelas Perkuliahan (`/api/admin/classes`): list, create, update, delete, validasi kapasitas kuota.

### Fase 5: Modul Direct Enrollment & Dasbor Kontekstual (Hari 8–9)
- Implementasi endpoint Direct Enrollment Mahasiswa (`/api/admin/enrollments`):
  - Ambil daftar mahasiswa terdaftar per kelas.
  - Ambil daftar mahasiswa tersedia untuk dienroll.
  - Pendaftaran individual & batch enrollment dengan validasi batas kuota kelas.
  - Pencabutan (*unenroll*) mahasiswa dari kelas.
- Implementasi endpoint Dasbor Kontekstual (`GET /api/dashboard`):
  - Mahasiswa: profil & daftar kartu kelas yang dienroll.
  - Dosen: profil bergelar & kelas yang diampu beserta jumlah mahasiswa.
  - Admin: 4 metrik sistem utama dan pintasan cepat.
- Endpoint daftar kelas pengguna: `GET /api/classes` dan `GET /api/classes/:id`.

### Fase 6: Pengujian, Validasi Kepatuhan SRS & Handoff (Hari 10)
- Pengujian otomatis (Unit & Integration Test):
  - Alur login multi-kredensial & penolakan akun suspended.
  - Alur CRUD pengguna, mata kuliah, dan pembukaan kelas.
  - Alur direct enrollment (individual & batch) dan pencegahan over-capacity.
  - Pencatatan mutasi pada tabel `audit_logs`.
- Dokumentasi API (Postman Collection / Swagger OpenAPI 3.0) untuk tim frontend.

---

## 7. Kriteria Keberhasilan (Definition of Done MVP 1 Backend)

1. **Autentikasi & RBAC 3 Peran Berfungsi Sempurna:** Seluruh 3 peran (`mahasiswa`, `dosen`, `admin`) dapat login, menerima token JWT yang valid, dan rute terlindungi sesuai wewenang. Akun non-aktif/suspended ditolak otomatis.
2. **Kesesuaian Kamus Data Database:** Seluruh tabel inti MVP 1 (`users`, `profiles`, `mahasiswa`, `dosen`, `courses`, `classes`, `enrollments`, `files`, `audit_logs`) terimplementasi di PostgreSQL via Prisma.
3. **Manajemen Profil Mandiri Berjalan:** Pengguna dapat memperbarui biodata, mengunggah foto profil (maks 2MB), dan mengganti kata sandi dengan verifikasi kata sandi lama.
4. **Master Data & Pembukaan Kelas Siap Digunakan:** Admin dapat mengelola akun pengguna, master mata kuliah, dan membuka kelas perkuliahan baru.
5. **Direct Enrollment Mahasiswa Berhasil (Tanpa KRS):** Admin dapat mendaftarkan mahasiswa ke kelas secara langsung (individual maupun batch) dan kuota kelas terpantau akurat.
6. **Dasbor Kontekstual Menyajikan Data Akurat:** Endpoint `/api/dashboard` mengembalikan data spesifik yang relevan bagi Mahasiswa, Dosen, dan Admin.
7. **Jejak Audit Terverifikasi:** Setiap mutasi akun, data master, dan enrollment terekam di tabel `audit_logs` dengan data JSON lama dan baru yang lengkap.
