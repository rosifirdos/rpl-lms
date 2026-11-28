# E-Learning Kampus — Universitas

> **Sistem Pembelajaran Daring (Learning Management System)**
> **Team Membangun Negeri — RPL 2026**

---

## Tentang

E-Learning Kampus adalah sistem manajemen pembelajaran daring (*Learning Management System*) standalone untuk Universitas. Sistem ini mendukung perkuliahan daring dan *blended learning* dengan siklus **16 pertemuan terstruktur** per kelas (Pertemuan 8 = UTS, Pertemuan 16 = UAS).

Ruang lingkup sistem sengaja dipisahkan dari modul administrasi kampus (SIA, PMB, KRS manual, KHS, transkrip, sidang). Peran disederhanakan menjadi **3 role tunggal**: Admin, Dosen, dan Mahasiswa. Enrollment mahasiswa ke kelas dilakukan langsung oleh Admin tanpa proses KRS.

### Fitur yang tersedia

| Modul | Cakupan | Status |
| --- | --- | --- |
| **Autentikasi & Sesi** | Login multi-kredensial (username/email/NIM/NIDN/NIP), JWT access + refresh token, logout/revocation | ✅ Backend |
| **Profil Pengguna** | Data identitas, kontak, bio, avatar privat (JPG/PNG maks 2MB), ganti kata sandi | ✅ Backend |
| **Manajemen Pengguna** | CRUD akun, filter role/status, reset password, status `ACTIVE`/`INACTIVE`/`SUSPENDED` | ✅ Backend |
| **Master Mata Kuliah** | CRUD, validasi SKS 1–6, penonaktifan tanpa menghapus riwayat kelas | ✅ Backend |
| **Pembukaan Kelas** | CRUD kelas, penetapan dosen pengampu, validasi kapasitas, auto-generate 16 pertemuan | ✅ Backend |
| **Direct Enrollment** | Pendaftaran mahasiswa ke kelas (individu/batch), pencabutan kepesertaan | ✅ Backend |
| **Ruang Kelas & 16 Pertemuan** | Daftar pertemuan, detail pertemuan, pengubahan topik/deskripsi/publikasi oleh dosen | ✅ Backend |
| **Materi Perkuliahan** | Unggah (PDF/DOCX/XLSX/ZIP maks 10MB), ubah metadata, hapus, unduh terproteksi | ✅ Backend |
| **Presensi Digital** | Buka/tutup sesi, check-in mahasiswa saat sesi `OPEN`, koreksi status, auto-close berbasis toleransi | ✅ Backend |
| **Rekap Kehadiran** | Matriks kehadiran 16 pertemuan dan persentase kehadiran per mahasiswa | ✅ Backend |
| **Dasbor Kontekstual** | Ringkasan data sesuai role Admin, Dosen, dan Mahasiswa | ✅ Backend |
| **Audit Trail** | Pencatatan mutasi data sensitif + endpoint peninjauan audit untuk Admin | ✅ Backend |
| **Antarmuka UI** | Seluruh halaman dasbor, ruang kelas, modul admin, dosen, dan mahasiswa | 🟡 UI selesai, data masih mock |
| **Integrasi Frontend–API** | Koneksi HTTP client, sesi, dan pemanggilan endpoint | 🟡 Sebagian (logout terintegrasi) |
| **Tugas & Penilaian** | Penerbitan tugas, validasi berkas submission, penilaian skor 0–100 + feedback | ✅ Backend |
| **Timeline & Kuis Interaktif** | Timeline terpusat, bank soal PG/esai, attempt berbasis timer, roster lengkap & ekspor CSV | ✅ Backend |
| **Notifikasi Internal** | Notifikasi tugas, kuis, presensi, nilai rilis, dan pengingat deadline | ✅ Backend |
| **UTS/UAS & Rekap Nilai** | Gatekeeping kehadiran, rekap nilai akhir, ekspor, monitoring admin | ⬜ Belum (MVP 5) |

> **Catatan status frontend:** seluruh halaman sudah tersedia dan dapat dinavigasi, tetapi sebagian besar masih memakai data *fixture*/*mock* lokal. Login saat ini masih berupa *mock login* di sisi klien, dan hanya aksi logout yang memanggil API backend. Integrasi penuh ke endpoint backend adalah pekerjaan lanjutan.

## Arsitektur

| Layer | Teknologi |
| --- | --- |
| Runtime Backend | Node.js v20+ (ES Modules) |
| Framework API | Express.js 4 |
| ORM | Prisma 6 |
| Database | PostgreSQL 16+ (database `rpl_lms`) |
| Autentikasi | JWT (access + refresh token) + bcryptjs |
| Validasi | Zod |
| Keamanan HTTP | Helmet, CORS terproteksi, express-rate-limit |
| Upload Berkas | Multer + penyimpanan privat di luar web root (BR-009) |
| Frontend | React 18 + Vite 5 |
| Styling | Tailwind CSS 3.4 (design token kustom) |
| HTTP Client | Axios |
| State Sesi | Store kompatibel-Zustand berbasis `useSyncExternalStore` |
| Pengujian Backend | Node.js native test runner + embedded-postgres |
| Pengujian Frontend | Belum terpasang |

## Struktur Repositori

```
rpl-lms/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma          # 24 model + 9 enum (MVP 1–4)
│   │   ├── migrations/            # 7 artefak migrasi
│   │   └── seed.js                # Seeder idempoten
│   ├── docs/
│   │   └── openapi.yaml           # Dokumentasi OpenAPI 3.0
│   ├── scripts/
│   │   ├── run-pg.js              # Embedded PostgreSQL (port 5433)
│   │   ├── backfill-meetings.js   # Backfill 16 pertemuan kelas lama
│   │   └── prune-password-reset-tokens.js # Housekeeping token reset (jalankan berkala)
│   ├── src/
│   │   ├── app.js                 # Express app + registrasi rute
│   │   ├── server.js              # Entry point
│   │   ├── config/                # env.js, prisma.js
│   │   ├── constants/             # roles, permissions, academic, auditEntities
│   │   ├── middlewares/           # auth, rbac, audit, validate, error, rateLimit, upload
│   │   ├── modules/               # auth, profile, users, courses, classes,
│   │   │                          # enrollments, meetings, materials, attendance,
│   │   │                          # assignments, submissions, timeline, quizzes,
│   │   │                          # notifications, config, dashboard, audit-log
│   │   └── utils/                 # apiResponse, errors, password, token, storage, ownership
│   ├── storage/private/           # Berkas privat: avatars, materials, submissions
│   └── tests/                     # Suite pengujian backend (MVP 1–4)
├── frontend/
│   ├── src/
│   │   ├── components/            # AppShell, Sidebar, Header, widget dasbor
│   │   ├── features/              # Implementasi halaman per role
│   │   │   ├── admin/             # DasborAdmin, ManajemenPengguna, MasterMataKuliah,
│   │   │   │                      # PembukaanKelas, DirectEnrollment, JejakAudit, KonfigurasiSistem
│   │   │   ├── dosen/             # DasborDosen, KelasDiampu, KelolaKls, UnggahMateri,
│   │   │   │                      # ManajemenMaterial, DaftarHadirKoreksi, PemeriksaanTugas
│   │   │   ├── mahasiswa/         # KlsSayaMahasiswa, StatusPresensi, PanduanBelajar
│   │   │   ├── akademik/          # CentralTimeline, RekapKehadiran
│   │   │   ├── kelas/             # RuangKelas
│   │   │   ├── profile/           # Profile
│   │   │   ├── auth/              # ChangePasswordModal, ForgotPassword
│   │   │   └── shell/             # AppShellGlobal, fixtures
│   │   ├── pages/                 # Wrapper tipis per rute
│   │   ├── services/api.ts        # Axios client + klien API
│   │   ├── stores/                # authStore, themeStore
│   │   └── utils/                 # cn, uuid
│   ├── index.html
│   ├── tailwind.config.js
│   └── vite.config.js             # Proxy /api → http://localhost:5000
├── designs/                       # Aset desain
├── SRS.md                         # Software Requirements Specification
├── PRD.md                         # Product Requirements Document
├── DESIGN_SYSTEM.md               # Design system dan token
├── QA_TESTING_GUIDE.md            # Panduan pengujian
└── COLLABORATION_GUIDE.md         # Panduan kolaborasi tim
```

## Peran Pengguna

| Role | Deskripsi |
| --- | --- |
| **Admin** | Pengelola teknis & operasional (peleburan Super Admin / Admin Akademik / Admin LMS). Mengelola pengguna, mata kuliah, kelas, enrollment, dan audit. |
| **Dosen** | Tenaga pendidik pengampu kelas. Mengelola pertemuan, materi, sesi presensi, dan koreksi kehadiran. |
| **Mahasiswa** | Peserta didik yang terdaftar pada kelas. Mengakses ruang kelas, mengunduh materi, dan melakukan check-in presensi. |

## Prasyarat

- Node.js v20+ dan npm
- PostgreSQL 16+ (atau gunakan *embedded PostgreSQL* bawaan repo)
- Git

## Quick Start

```bash
# 1. Backend
cd backend
cp .env.example .env        # Sesuaikan DATABASE_URL
npm install
npx prisma migrate dev
npm run db:seed
npm run dev                 # http://localhost:5000

# 2. Frontend (terminal terpisah)
cd frontend
npm install
npm run dev                 # http://localhost:5173
```

> PowerShell: gunakan `Copy-Item .env.example .env` sebagai pengganti `cp`.

Frontend mem-proxy seluruh permintaan `/api` ke backend di port **5000**, sehingga aplikasi dapat diakses melalui `http://localhost:5173` tanpa konfigurasi CORS tambahan.

## Cara Menjalankan

### 1. Backend (Server API)

**Persiapan:**
```bash
cd backend
cp .env.example .env
npm install
```

Sesuaikan variabel berikut di `backend/.env`:

| Variabel | Default / Contoh | Keterangan |
| --- | --- | --- |
| `PORT` | `5000` | Port server API |
| `NODE_ENV` | `development` | Mode lingkungan |
| `DATABASE_URL` | `postgresql://postgres:password@localhost:5432/rpl_lms?schema=public` | Koneksi database operasional |
| `DATABASE_URL_TEST` | `postgresql://postgres:password@localhost:5432/rpl_review?schema=public` | Database terisolasi untuk pengujian (opsional) |
| `JWT_ACCESS_SECRET` | — | Secret access token, minimal 32 karakter |
| `JWT_ACCESS_EXPIRES_IN` | `15m` | Masa berlaku access token |
| `JWT_REFRESH_SECRET` | — | Secret refresh token, minimal 32 karakter |
| `JWT_REFRESH_EXPIRES_IN` | `7d` | Masa berlaku refresh token |
| `CORS_ORIGIN` | `http://localhost:3000,http://localhost:5173` | Daftar origin yang diizinkan (dipisah koma) |

**Setup database:**
```bash
npx prisma migrate dev    # Jalankan seluruh migrasi
npm run db:seed           # Seed data awal (idempoten)
```

**Menjalankan server:**
```bash
npm run dev               # Development (nodemon, hot reload)
npm start                 # Production
```

Server berjalan di `http://localhost:5000`. Cek kesehatan melalui `GET /health`.

### 2. Frontend (Aplikasi React)

```bash
cd frontend
npm install
npm run dev               # Vite dev server → http://localhost:5173
npm run build             # Build production ke frontend/dist
npm run preview           # Preview hasil build
```

### 3. Menjalankan Keduanya

**Opsi A — dua terminal:**
```bash
# Terminal 1
cd backend && npm run dev

# Terminal 2
cd frontend && npm run dev
```

**Opsi B — satu baris (bash/zsh):**
```bash
(cd backend && npm run dev) & (cd frontend && npm run dev)
```

### 4. Database Alternatif (Embedded PostgreSQL)

Jika tidak ingin memasang PostgreSQL secara manual, repo menyediakan *embedded PostgreSQL* pada port **5433**:

```bash
cd backend
node scripts/run-pg.js
```

Sesuaikan `DATABASE_URL` menjadi `postgresql://postgres:password@localhost:5433/rpl_lms?schema=public`, lalu jalankan migrasi dan seeder.

## Script Berguna

### Backend

| Script | Keterangan |
| --- | --- |
| `npm run dev` | Development server dengan nodemon |
| `npm start` | Menjalankan server production |
| `npm test` | Menjalankan seluruh suite pengujian |
| `npm run db:migrate` | `prisma migrate dev` |
| `npm run db:push` | `prisma db push` (tanpa artefak migrasi) |
| `npm run db:seed` | Seed data awal |
| `npm run db:backfill-meetings` | Membuat 16 pertemuan untuk kelas lama yang belum memilikinya |
| `npm run prune:reset-tokens` | Menghapus token reset kata sandi yang terpakai/kedaluwarsa (>7 hari) |
| `npm run db:studio` | Membuka Prisma Studio |
| `npm run prisma:generate` | Regenerasi Prisma Client |

> **Operasional (R-14):** `npm run prune:reset-tokens` dijalankan berkala
> (cron/automation, mis. harian) di luar request path untuk membersihkan
> `password_reset_tokens` yang sudah terpakai atau kedaluwarsa lebih dari
> 7 hari. Skrip idempoten dan aman dijalankan berulang.

### Frontend

| Script | Keterangan |
| --- | --- |
| `npm run dev` | Vite dev server (hot reload) |
| `npm run build` | Build production |
| `npm run preview` | Preview hasil build |

## Pengujian

Backend menggunakan **Node.js native test runner**. Seluruh suite dijalankan secara serial (`--test-concurrency=1`) dan terhubung ke database terisolasi.

```bash
cd backend
npm test
```

### Isolasi Database Pengujian

`tests/setup.js` berjalan sebelum seluruh suite dan **memaksa pengujian memakai database non-operasional `rpl_review`**:

- Jika `DATABASE_URL` menunjuk `rpl_lms`, setup otomatis mengganti nama database menjadi `rpl_review`.
- `DATABASE_URL_TEST` dapat diisi eksplisit untuk memakai database uji lain.
- Guard terakhir menolak proses bila hasil resolusi tetap menunjuk `rpl_lms`.
- `cleanupTestArtifacts()` menyapu sisa kelas uji ber-prefix `TEST-` dan `KAP-`; data seed tidak tersentuh.

Siapkan database uji satu kali sebelum menjalankan pengujian:

```bash
createdb rpl_review
DATABASE_URL="postgresql://postgres:password@localhost:5432/rpl_review?schema=public" npx prisma migrate deploy
DATABASE_URL="postgresql://postgres:password@localhost:5432/rpl_review?schema=public" npm run db:seed
```

Suite yang tersedia mencakup:

- MVP 1: ownership & upload material, audit entity, autentikasi/RBAC, master data, enrollment, audit trail, dan kontrak OpenAPI.
- MVP 2: pertemuan, materi, presensi, auto-close sesi, serta rekapitulasi kehadiran.

## Akun Bawaan Seeder

Password default seluruh akun: **`password123`**

| Role | Username | Email | Keterangan |
| --- | --- | --- | --- |
| Admin | `admin` | `admin@kampus.ac.id` | Administrator E-Learning Kampus |
| Dosen | `198501152010121002` | `budi.santoso@kampus.ac.id` | NIDN sebagai username |
| Dosen | `199003202015042001` | `siti.aminah@kampus.ac.id` | NIDN sebagai username |
| Dosen | `197805102003122001` | `hadi.wijaya@kampus.ac.id` | NIDN sebagai username |
| Mahasiswa | `2024001001` – `2024001010` | `<nim>@mhs.kampus.ac.id` | NIM sebagai username |

Seeder juga membuat:

- 5 master mata kuliah: `TIF101` Pemrograman Web, `TIF102` Basis Data Relasional, `TIF103` Rekayasa Perangkat Lunak, `TIF104` Jaringan Komputer, `TIF105` Pemrograman Berorientasi Objek.
- 2 kelas contoh: `TI-A` (TIF101) dan `SI-B` (TIF102) untuk tahun akademik `2026/2027` semester `ganjil`.
- 16 pertemuan otomatis pada setiap kelas.

Seeder **tidak** membuat enrollment. Mahasiswa harus didaftarkan ke kelas oleh Admin melalui modul Direct Enrollment.

## API Endpoints

Seluruh endpoint menggunakan path flat `/api/...` (bukan `/api/v1/...`). Format respons konsisten melalui helper `apiResponse`.

### Umum

| Method | Endpoint | Deskripsi | Akses |
| --- | --- | --- | --- |
| `GET` | `/health` | Status server | Publik |
| `GET` | `/api` | Informasi API & daftar endpoint | Publik |

### Autentikasi

| Method | Endpoint | Deskripsi | Akses |
| --- | --- | --- | --- |
| `POST` | `/api/auth/login` | Login multi-kredensial & pembuatan sesi | Publik |
| `POST` | `/api/auth/refresh` | Perpanjang access token | Publik |
| `POST` | `/api/auth/logout` | Cabut refresh token | Terotentikasi (opsional) |
| `POST` | `/api/auth/forgot-password` | Pengajuan reset kata sandi | Publik |
| `PUT` | `/api/auth/change-password` | Ganti kata sandi dengan verifikasi sandi lama | Terotentikasi |

### Profil

| Method | Endpoint | Deskripsi | Akses |
| --- | --- | --- | --- |
| `GET` | `/api/profile` | Ambil data profil sendiri | Terotentikasi |
| `PUT` | `/api/profile` | Perbarui kontak & bio | Terotentikasi |
| `POST` | `/api/profile/avatar` | Unggah/ganti foto profil (JPG/PNG, maks 2MB) | Terotentikasi |
| `GET` | `/api/profile/avatar` | Stream foto profil privat | Terotentikasi |
| `PUT` | `/api/profile/password` | Ganti password mandiri | Terotentikasi |

### Dasbor

| Method | Endpoint | Deskripsi | Akses |
| --- | --- | --- | --- |
| `GET` | `/api/dashboard` | Data dasbor kontekstual sesuai role | Terotentikasi |

### Kelas, Pertemuan & Materi

| Method | Endpoint | Deskripsi | Akses |
| --- | --- | --- | --- |
| `GET` | `/api/classes` | Daftar kelas milik mahasiswa/dosen | Mahasiswa, Dosen |
| `GET` | `/api/classes/:id` | Detail kelas | Mahasiswa, Dosen |
| `GET` | `/api/classes/:classId/meetings` | 16 pertemuan + status materi & presensi | Mahasiswa (enrolled), Dosen (pengampu), Admin |
| `GET` | `/api/classes/:classId/attendance-recap` | Rekap kehadiran & persentase mahasiswa | Mahasiswa (enrolled), Dosen (pengampu), Admin |
| `GET` | `/api/meetings/:id` | Detail pertemuan | Mahasiswa (enrolled), Dosen (pengampu), Admin |
| `PUT` | `/api/meetings/:id` | Ubah topik, deskripsi, atau status publikasi | Dosen (pengampu), Admin |
| `POST` | `/api/meetings/:meetingId/materials` | Unggah materi (multipart form-data) | Dosen (pengampu), Admin |
| `PUT` | `/api/materials/:id` | Ubah metadata materi | Dosen (pengampu), Admin |
| `DELETE` | `/api/materials/:id` | Hapus materi | Dosen (pengampu), Admin |
| `GET` | `/api/materials/:id/download` | Unduh materi terproteksi | Mahasiswa (enrolled), Dosen, Admin |

### Presensi Digital

| Method | Endpoint | Deskripsi | Akses |
| --- | --- | --- | --- |
| `POST` | `/api/meetings/:meetingId/attendance/open` | Buka sesi presensi (status `OPEN`, catat `opened_at`) | Dosen (pengampu), Admin |
| `POST` | `/api/meetings/:meetingId/attendance/close` | Tutup sesi presensi (status `CLOSED`, catat `closed_at`) | Dosen (pengampu), Admin |
| `POST` | `/api/attendance/:sessionId/check-in` | Check-in mandiri mahasiswa saat sesi `OPEN` | Mahasiswa (enrolled) |
| `GET` | `/api/attendance/:sessionId/records` | Daftar rekaman kehadiran sesi | Dosen (pengampu), Admin |
| `PUT` | `/api/attendance/records/:id` | Koreksi status kehadiran (`HADIR`/`SAKIT`/`IZIN`/`ALPA`) | Dosen (pengampu), Admin |

Sesi presensi memiliki `tolerance_minutes` (default 15 menit). Sesi yang melewati batas toleransi ditutup otomatis, dan mahasiswa yang belum check-in dicatat `ALPA` dengan penanda `is_auto_generated`.

### Tugas & Submission (MVP 3)

| Method | Endpoint | Deskripsi | Akses |
| --- | --- | --- | --- |
| `POST` | `/api/meetings/:meetingId/assignments` | Terbitkan tugas (multipart: instruksi, file soal, bobot, deadline) | Dosen (pengampu), Admin |
| `GET` | `/api/classes/:classId/assignments` | Daftar tugas kelas | Mahasiswa (enrolled), Dosen, Admin |
| `GET` | `/api/assignments/:id` | Detail tugas | Mahasiswa (enrolled), Dosen, Admin |
| `PUT` | `/api/assignments/:id` | Ubah tugas | Dosen (pengampu), Admin |
| `DELETE` | `/api/assignments/:id` | Hapus tugas | Dosen (pengampu), Admin |
| `GET` | `/api/assignments/:id/download` | Unduh berkas soal terproteksi | Mahasiswa (enrolled), Dosen, Admin |
| `POST` | `/api/assignments/:assignmentId/submissions` | Unggah/resubmission jawaban | Mahasiswa (enrolled) |
| `GET` | `/api/assignments/:assignmentId/submission` | Submission milik mahasiswa | Mahasiswa (enrolled) |
| `GET` | `/api/assignments/:assignmentId/submissions` | Roster submission kelas | Dosen (pengampu), Admin |
| `GET` | `/api/submissions/:id/download` | Unduh berkas jawaban terproteksi | Mahasiswa (pemilik), Dosen, Admin |
| `PUT` | `/api/submissions/:id/grade` | Nilai tugas (skor 0–100 + feedback) | Dosen (pengampu), Admin |

### Timeline & Notifikasi (MVP 4)

| Method | Endpoint | Deskripsi | Akses |
| --- | --- | --- | --- |
| `GET` | `/api/timeline` | Timeline kronologis (`types`, `class_id`, rentang waktu) | Mahasiswa, Dosen |
| `GET` | `/api/notifications` | Daftar notifikasi pengguna (filter tipe, paginasi) | Terotentikasi |
| `GET` | `/api/notifications/unread-count` | Jumlah notifikasi belum dibaca | Terotentikasi |
| `PATCH` | `/api/notifications/:id/read` | Tandai satu notifikasi dibaca | Terotentikasi |
| `PATCH` | `/api/notifications/read-all` | Tandai seluruh notifikasi dibaca | Terotentikasi |

### Kuis Interaktif (MVP 4)

| Method | Endpoint | Deskripsi | Akses |
| --- | --- | --- | --- |
| `POST` | `/api/meetings/:meetingId/quizzes` | Buat kuis pada pertemuan reguler | Dosen (pengampu), Admin |
| `GET` | `/api/classes/:classId/quizzes` | Daftar kuis kelas (mahasiswa hanya yang terbit) | Mahasiswa, Dosen, Admin |
| `GET` | `/api/quizzes/:id` | Detail kuis (kunci jawaban tidak dikirim ke mahasiswa) | Mahasiswa, Dosen, Admin |
| `PUT` | `/api/quizzes/:id` | Ubah metadata kuis | Dosen (pengampu), Admin |
| `DELETE` | `/api/quizzes/:id` | Hapus kuis | Dosen (pengampu), Admin |
| `PATCH` | `/api/quizzes/:id/publish` | Publikasi/nonaktifkan kuis | Dosen (pengampu), Admin |
| `POST` | `/api/quizzes/:id/questions` | Tambah butir soal (PG/esai) | Dosen (pengampu), Admin |
| `PUT` | `/api/quizzes/:id/questions/:questionId` | Ubah butir soal | Dosen (pengampu), Admin |
| `DELETE` | `/api/quizzes/:id/questions/:questionId` | Hapus butir soal | Dosen (pengampu), Admin |
| `POST` | `/api/quizzes/:id/attempts` | Mulai percobaan kuis | Mahasiswa (enrolled) |
| `GET` | `/api/quizzes/:id/attempts` | Roster hasil kuis seluruh mahasiswa ter-enrolled | Dosen (pengampu), Admin |
| `GET` | `/api/quizzes/:id/attempts/export` | Ekspor roster kuis (CSV) | Dosen (pengampu), Admin |
| `GET` | `/api/quiz-attempts/:attemptId` | Detail percobaan & jawaban | Mahasiswa (pemilik), Dosen, Admin |
| `PUT` | `/api/quiz-attempts/:attemptId/answers` | Simpan jawaban parsial | Mahasiswa (pemilik) |
| `POST` | `/api/quiz-attempts/:attemptId/submit` | Kumpulkan percobaan (PG dinilai otomatis) | Mahasiswa (pemilik) |
| `PUT` | `/api/quiz-attempts/:attemptId/grade` | Nilai soal esai (poin + feedback) | Dosen (pengampu), Admin |

### Admin — Pengguna

| Method | Endpoint | Deskripsi |
| --- | --- | --- |
| `GET` | `/api/admin/users` | Daftar akun (filter role, status, pencarian) |
| `POST` | `/api/admin/users` | Buat akun baru (`nim`/`prodi`/`angkatan` atau `nidn`/`nip` sesuai role) |
| `GET` | `/api/admin/users/:id` | Detail akun |
| `PUT` | `/api/admin/users/:id` | Ubah data akun |
| `PATCH` | `/api/admin/users/:id/status` | Ubah status akun |
| `PUT` | `/api/admin/users/:id/reset-password` | Reset kata sandi pengguna |

### Admin — Mata Kuliah, Kelas & Enrollment

| Method | Endpoint | Deskripsi |
| --- | --- | --- |
| `GET` | `/api/admin/courses` | Daftar mata kuliah (pencarian, filter status, paginasi) |
| `POST` | `/api/admin/courses` | Tambah mata kuliah |
| `GET` | `/api/admin/courses/:id` | Detail mata kuliah |
| `PUT` | `/api/admin/courses/:id` | Perbarui mata kuliah |
| `DELETE` | `/api/admin/courses/:id` | Nonaktifkan mata kuliah |
| `GET` | `/api/admin/classes` | Daftar kelas (filter semester, tahun akademik, mata kuliah) |
| `POST` | `/api/admin/classes` | Buka kelas |
| `GET` | `/api/admin/classes/:id` | Detail kelas |
| `PUT` | `/api/admin/classes/:id` | Perbarui kelas (validasi kapasitas) |
| `DELETE` | `/api/admin/classes/:id` | Hapus kelas tanpa enrollment |
| `GET` | `/api/admin/classes/:classId/enrollments` | Daftar mahasiswa terdaftar |
| `GET` | `/api/admin/classes/:classId/available-students` | Mahasiswa yang belum terdaftar |
| `POST` | `/api/admin/enrollments` | Daftarkan mahasiswa (individu/batch) |
| `DELETE` | `/api/admin/enrollments/:id` | Cabut kepesertaan |

### Admin — Konfigurasi

| Method | Endpoint | Deskripsi |
| --- | --- | --- |
| `GET` | `/api/admin/config` | Baca konfigurasi global (validasi file & ambang kehadiran ujian) |
| `PUT` | `/api/admin/config` | Ubah konfigurasi (dicatat pada audit trail) |

### Admin — Jejak Audit

| Method | Endpoint | Deskripsi |
| --- | --- | --- |
| `GET` | `/api/admin/audit-logs` | Riwayat audit dengan filter & paginasi |
| `GET` | `/api/admin/audit-logs/:id` | Detail log (`old_values` vs `new_values`) |
| `GET` | `/api/audit-logs` | Alias flat endpoint audit |

Dokumentasi OpenAPI lengkap: [`backend/docs/openapi.yaml`](backend/docs/openapi.yaml).

## Skema Database

`schema.prisma` mencakup **24 model** dan **9 enum** (MVP 1–4):

| Model | Keterangan |
| --- | --- |
| `User` | Akun login: `username`, `email`, `password_hash`, `role`, `status`, `last_login_at` |
| `Profile` | Data personal: `full_name`, `phone`, `bio`, `avatar_file_id` |
| `Mahasiswa` | `nim` (unik), `prodi`, `angkatan` — relasi 1:1 ke `User` |
| `Dosen` | `nidn`/`nip` (unik), `gelar_depan`, `gelar_belakang` — relasi 1:1 ke `User` |
| `RefreshToken` | Token refresh di-hash (SHA-256) dan disimpan di database |
| `PasswordResetToken` | Token reset kata sandi (hash + kedaluwarsa), dibersihkan oleh skrip housekeeping |
| `Course` | Master mata kuliah: `code` (unik), `name`, `credits`, `is_active` |
| `Class` | Pembukaan kelas: `course`, `lecturer`, `academic_year`, `semester`, `capacity` |
| `Enrollment` | Kepesertaan mahasiswa, unik per `(class_id, student_id)` |
| `Meeting` | 16 pertemuan per kelas; `meeting_number`, `is_exam`, `exam_type`, `scheduled_at`, `is_published` |
| `Material` | Materi per pertemuan; metadata `File` + judul/deskripsi |
| `AttendanceSession` | Sesi presensi per pertemuan (1:1); `status` `OPEN`/`CLOSED`, `tolerance_minutes` |
| `AttendanceRecord` | Kehadiran mahasiswa per sesi; `HADIR`/`SAKIT`/`IZIN`/`ALPA`, `is_auto_generated` |
| `Assignment` | Tugas pada pertemuan; `weight_percentage`, `due_date`, `allow_late`, `is_published` |
| `Submission` | Jawaban mahasiswa; `file`, `submitted_at`, `is_late`, `score` (0–100), `feedback` |
| `File` | Metadata berkas privat: nama, path, mime, ukuran, pengunggah |
| `SystemConfig` | Konfigurasi global key-value (validasi file & ambang kehadiran) |
| `AuditLog` | Jejak audit: action, entity, old/new values, IP address |
| `Quiz` | Kuis terikat pertemuan; `duration_minutes`, `open_at`, `close_at`, `is_published` |
| `QuizQuestion` | Butir soal PG/esai; `points`, `answer_key`, `order_index` |
| `QuizOption` | Opsi pilihan ganda; `is_correct` hanya dipakai server |
| `QuizAttempt` | Percobaan mahasiswa; satu per `(quiz_id, student_id)`, `deadline_at`, `score`, `status` |
| `QuizAnswer` | Jawaban per soal; `points_awarded` untuk PG otomatis dan esai manual |
| `Notification` | Notifikasi internal per pengguna; `type`, `dedupe_key`, `is_read`, `link` |

Enum: `UserRole`, `UserStatus`, `Semester`, `ExamType`, `AttendanceStatus`, `PresenceStatus`, `QuizQuestionType`, `QuizAttemptStatus`, `NotificationType`.

### Migrasi

1. `20261012000000_init_spada_mvp1` — fondasi MVP 1.
2. `20261113125204_add_elearning_mvp2_meetings_attendance` — pertemuan, materi, presensi.
3. `20261116193012_add_is_auto_generated_attendance_record` — penanda kehadiran otomatis.
4. `20261127163147_add_elearning_mvp3_assignments_submissions` — tugas, submission, penilaian.
5. `20261128133547_add_password_reset_tokens` — token reset kata sandi.
6. `20261128133909_add_system_configs` — konfigurasi global (validasi file & ambang kehadiran).
7. `20261128134556_add_elearning_mvp4_quizzes_notifications` — kuis interaktif & notifikasi internal.

## Status Implementasi

### Backend

- ✅ **MVP 1** — Autentikasi, RBAC, profil, manajemen pengguna, mata kuliah, kelas, direct enrollment, dasbor, audit trail, keamanan HTTP, dokumentasi OpenAPI.
- ✅ **MVP 2** — 16 pertemuan terstruktur, distribusi materi terproteksi, sesi presensi, check-in mandiri, koreksi kehadiran, rekap persentase, auto-close sesi.
- ✅ **MVP 3** — Tugas, validasi berkas submission, penilaian skor 0–100 & feedback, audit perubahan nilai.
- ✅ **MVP 4** — Central Timeline, kuis interaktif (PG/esai, timer server, roster & CSV), notifikasi internal dengan deep-link, keamanan email/token reset.
- ⬜ **MVP 5** — UTS/UAS, *gatekeeping* kehadiran ≥70%, rekap nilai akhir, ekspor, dan monitoring audit lanjutan.

### Frontend

- ✅ Struktur aplikasi Vite + React 18 + Tailwind, routing berbasis query string (`?page=`, `?role=`).
- ✅ Dasbor kontekstual 3 role, App Shell, sidebar, header, tema terang/gelap.
- ✅ Halaman Admin: dasbor, manajemen pengguna, master mata kuliah, pembukaan kelas, direct enrollment, jejak audit, konfigurasi sistem.
- ✅ Halaman Dosen: dasbor, kelas diampu, kelola kelas, unggah & manajemen materi, daftar hadir & koreksi, pemeriksaan tugas.
- ✅ Halaman Mahasiswa: dasbor, kelas saya, ruang kelas, status presensi, panduan belajar, timeline, rekap kehadiran.
- ✅ Halaman Profil dan Lupa Password (UI).
- 🟡 Integrasi API masih parsial: `apiClient` dan `authStore` tersedia, logout sudah terhubung, tetapi login dan data halaman masih *mock*/*fixture*.
- ⬜ Pengujian frontend (Vitest/RTL), penyempurnaan *silent refresh*, dan guard RBAC penuh di sisi klien.

## Roadmap

| Tahap | Fokus |
| --- | --- |
| **MVP 1** | Fondasi & Akun — ✅ selesai |
| **MVP 2** | Ruang Kelas & Materi, Presensi Digital — ✅ backend selesai; integrasi UI berjalan |
| **MVP 3** | Tugas, Validasi File, Submission, Penilaian 0–100 — ✅ backend selesai |
| **MVP 4** | Central Timeline, Kuis, Notifikasi — ✅ backend selesai |
| **MVP 5** | UTS/UAS, Gatekeeping Presensi ≥70%, Rekap Nilai, Audit Lanjutan — ⬜ berikutnya |

## Dokumen Referensi

- [`SRS.md`](SRS.md) — Software Requirements Specification (*single source of truth*)
- [`PRD.md`](PRD.md) — Product Requirements Document
- [`DESIGN_SYSTEM.md`](DESIGN_SYSTEM.md) — Design system dan token
- [`DESIGN_INSTRUCTIONS_MVP1_UIUX.md`](DESIGN_INSTRUCTIONS_MVP1_UIUX.md) — Instruksi desain UI/UX MVP 1
- [`DESIGN_INSTRUCTIONS_MVP2_UIUX.md`](DESIGN_INSTRUCTIONS_MVP2_UIUX.md) — Instruksi desain UI/UX MVP 2
- [`IMPLEMENTATION_PLAN_MVP1_BACKEND.md`](IMPLEMENTATION_PLAN_MVP1_BACKEND.md) — Rencana implementasi MVP 1 backend
- [`IMPLEMENTATION_PLAN_MVP2_BACKEND.md`](IMPLEMENTATION_PLAN_MVP2_BACKEND.md) — Rencana implementasi MVP 2 backend
- [`IMPLEMENTATION_PLAN_MVP1_FRONTEND.md`](IMPLEMENTATION_PLAN_MVP1_FRONTEND.md) — Rencana & status frontend
- [`QA_TESTING_GUIDE.md`](QA_TESTING_GUIDE.md) — Panduan pengujian QA
- [`COLLABORATION_GUIDE.md`](COLLABORATION_GUIDE.md) — Panduan kolaborasi tim
- [`backend/README.md`](backend/README.md) — Dokumentasi teknis backend
- [`backend/docs/openapi.yaml`](backend/docs/openapi.yaml) — Spesifikasi OpenAPI 3.0

## Tim

**Team Membangun Negeri** — Rekayasa Perangkat Lunak, Universitas
