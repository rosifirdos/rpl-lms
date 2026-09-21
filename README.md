# Sistem Akademik Kampus Terintegrasi (RPL-LMS)
> **Portal Terpadu • Sistem Informasi Akademik (SIA) • SPADA / LMS • Penerimaan Mahasiswa Baru (PMB)**  
> **Universitas PGRI Semarang (UPGRIS) — Team Membangun Negeri**

---

## 📖 Daftar Isi
1. [Tentang Proyek](#-tentang-proyek)
2. [Ringkasan Tech Stack](#-ringkasan-tech-stack)
3. [Deskripsi Lengkap Tech Stack](#-deskripsi-lengkap-tech-stack)
   - [1. Backend Runtime & Bahasa Pemrograman](#1-backend-runtime--bahasa-pemrograman)
   - [2. Web Framework & Arsitektur Server](#2-web-framework--arsitektur-server)
   - [3. Database Relasional & ORM](#3-database-relasional--orm)
   - [4. Autentikasi, Sesi & Kriptografi](#4-autentikasi-sesi--kriptografi)
   - [5. Otorisasi Berbasis Peran (RBAC Engine)](#5-otorisasi-berbasis-peran-granular-rbac-engine)
   - [6. Validasi Data & Penanganan Kesalahan](#6-validasi-data--penanganan-kesalahan)
   - [7. Keamanan HTTP & Server Hardening](#7-keamanan-http--server-hardening)
   - [8. Logging, Audit Trail & Observability](#8-logging-audit-trail--observability)
   - [9. Development Tooling & Automated Testing](#9-development-tooling--automated-testing)
   - [10. Ekosistem Frontend & Integrasi Antarmuka](#10-ekosistem-frontend--integrasi-antarmuka)
4. [Arsitektur Sistem & Alur Integrasi](#-arsitektur-sistem--alur-integrasi)
5. [Struktur Direktori Proyek](#-struktur-direktori-proyek)
6. [Panduan Instalasi & Menjalankan Proyek](#-panduan-instalasi--menjalankan-proyek)
7. [Daftar Akun Pengujian (Seeder)](#-daftar-akun-pengujian-seeder)
8. [Dokumentasi Terkait](#-dokumentasi-terkait)

---

## 🌟 Tentang Proyek

**Sistem Akademik Kampus Terintegrasi (RPL-LMS)** adalah platform digital terpusat yang dirancang untuk mengintegrasikan seluruh tata kelola proses administrasi akademik dan kegiatan pembelajaran digital kampus ke dalam satu kesatuan sistem modern.

Platform ini memadukan empat pilar layanan utama kampus:
- **Portal Terpadu / Dashboard Gateway:** Pintu gerbang *Single Sign-On* (SSO) untuk seluruh sivitas akademika dengan personalisasi menu navigasi dan metrik ringkasan berdasarkan peran aktif pengguna.
- **Sistem Informasi Akademik (SIA):** Pengelolaan administrasi akademik menyeluruh (KRS, persetujuan Dosen Wali/PA, jadwal perkuliahan, penilaian, KHS, transkrip nilai, hingga administrasi pendaftaran sidang tugas akhir).
- **SPADA / LMS (Sistem Pembelajaran Daring):** Ruang kelas digital terstruktur berbasis siklus 16 pertemuan perkuliahan, distribusi bahan ajar, manajemen penugasan berkas mandiri, kuis online, presensi real-time, UTS/UAS, dan pemantauan progres belajar mahasiswa.
- **Penerimaan Mahasiswa Baru (PMB):** Layanan pendaftaran calon mahasiswa, seleksi berkas, pengumuman hasil seleksi, dan registrasi ulang yang otomatis bermutasi menjadi data mahasiswa aktif pada SIA.

---

## ⚡ Ringkasan Tech Stack

| Kategori | Teknologi / Library | Versi | Peran & Tanggung Jawab Utama |
|---|---|---|---|
| **Runtime Environment** | [Node.js](https://nodejs.org/) | `v20+ LTS` | Lingkungan eksekusi JavaScript sisi server berbasis event-driven non-blocking I/O. |
| **Module System** | ECMAScript Modules (ESM) | Modern ES2022+ | Standar modular native (`import`/`export`) dengan konfigurasi `"type": "module"`. |
| **Backend Web Framework** | [Express.js](https://expressjs.com/) | `^4.21.2` | Kerangka kerja HTTP minimalis, cepat, dan modular untuk RESTful API. |
| **Database Engine** | [PostgreSQL](https://www.postgresql.org/) | `v16+` | RDBMS relasional enterprise berintegritas tinggi dengan kepatuhan penuh ACID. |
| **ORM & Data Layer** | [Prisma ORM](https://www.prisma.io/) | `^6.4.1` | Pemodelan data deklaratif, migrasi otomatis, query builder type-safe, dan Prisma Studio. |
| **Token Management** | [JSON Web Token (JWT)](https://jwt.io/) | `^9.0.2` | Pengelolaan token sesi nir-keadaan (Access Token 15m & Refresh Token ter-hash 7d). |
| **Password Hashing** | [Bcryptjs](https://github.com/dcodeIO/bcrypt.js) | `^3.0.2` | Algoritma hashing adaptif dengan salt 12 rounds untuk penyimpanan kata sandi aman. |
| **Role-Based Access** | Native RBAC Engine | In-House Architecture | Otorisasi granular multi-role (8 peran resmi kampus) & per-permission guard. |
| **Schema Validation** | [Zod](https://zod.dev/) | `^3.24.2` | Validasi skema runtime DTO (Data Transfer Object) untuk body, params, dan query. |
| **Security Headers** | [Helmet](https://helmetjs.github.io/) | `^8.0.0` | Perlindungan HTTP response header (CSP, HSTS, X-Content-Type, X-Frame-Options). |
| **CORS Management** | [CORS](https://expressjs.com/en/resources/middleware/cors.html) | `^2.8.5` | Kontrol kebijakan pembatasan domain lintas-asal untuk klien web frontend. |
| **Rate Limiting** | [Express Rate Limit](https://github.com/express-rate-limit/express-rate-limit) | `^7.5.0` | Mitigasi serangan brute force, DDoS, dan penyalahgunaan request berlebih. |
| **HTTP Logger** | [Morgan](https://github.com/expressjs/morgan) | `^1.10.0` | Pencatatan lalu lintas request HTTP untuk pemantauan performa dan debugging. |
| **Audit Trail Engine** | In-House Database Audit | Native Prisma | Pencatatan mutasi data krusial secara persisten ke tabel `audit_logs`. |
| **Config Management** | [Dotenv](https://github.com/motdotla/dotenv) | `^16.4.7` | Manajemen konfigurasi variabel lingkungan (`.env`) yang aman dan terpusat. |
| **Dev Live Reload** | [Nodemon](https://nodemon.io/) | `^3.1.9` | Auto-restart server saat mendeteksi perubahan berkas kode selama masa pengembangan. |
| **Test Runner** | Node.js Test Runner (`node --test`) | Native v20+ | Eksekusi automated integration test tanpa overhead dependensi eksternal. |
| **Frontend Ecosystem** | Modern Web Client (SPA/SSR) | Target Integrasi | Target antarmuka web modern (Vite + React / Next.js) terkoneksi via REST API. |

---

## 🛠 Deskripsi Lengkap Tech Stack

### 1. Backend Runtime & Bahasa Pemrograman

#### Node.js (v20+ LTS)
- **Alasan Pemilihan:** Node.js menyediakan lingkungan eksekusi JavaScript sisi server berbasis mesin V8 Google. Arsitektur *asynchronous event-driven* miliknya sangat efisien dalam menangani konkurensi I/O tinggi secara *non-blocking*.
- **Kebutuhan Sistem:** Karakteristik sistem akademik melibatkan beban kerja dengan lonjakan serentak (*traffic spikes*) pada waktu-waktu krusial, seperti pembukaan periode Kartu Rencana Studi (KRS), pengumpulan tugas serentak menjelang batas waktu (*deadline*), pembukaan presensi kuliah, dan pelaksanaan kuis massal. Node.js mampu melayani banyak koneksi bersamaan dengan jejak konsumsi memori yang sangat hemat.
- **Karakteristik Implementasi:**
  - Mengadopsi versi **LTS (Long Term Support)** untuk menjamin kestabilan produksi, dukungan keamanan jangka panjang, dan kompatibilitas dependensi.
  - Memanfaatkan fitur bawaan Node.js modern, antara lain modul `node:crypto` untuk pembuatan hash kriptografis SHA-256 pada refresh token dan `node:test` untuk testing otomatis terintegrasi.

#### ECMAScript Modules (ESM)
- **Alasan Pemilihan:** Seluruh basis kode dikembangkan menggunakan standar resmi JavaScript modern dengan konfigurasi `"type": "module"` pada berkas `backend/package.json`.
- **Keunggulan:**
  - Sintaksis `import` dan `export` yang bersih, konsisten, dan mudah dipahami.
  - Isolasi *scope* variabel yang lebih ketat dibanding CommonJS.
  - Analisis statis (*static analysis*) yang lebih baik oleh perkakas editor dan linter.
  - Peningkatan efisiensi waktu kompilasi dan tree-shaking dependensi.

---

### 2. Web Framework & Arsitektur Server

#### Express.js (v4.21.2)
- **Alasan Pemilihan:** Express.js merupakan kerangka kerja web paling matang, teruji, dan fleksibel dalam ekosistem Node.js. Melalui sistem *middleware chaining*, Express memungkinkan isolasi logika autentikasi, logging, validasi skema, dan penanganan kesalahan secara berurutan dan terstruktur.
- **Pola Arsitektur yang Diterapkan:**
  - **Controller-Service-Repository Pattern:**
    - **Routes (`*.routes.js`):** Mendefinisikan spesifikasi rute API, mengikat middleware autentikasi, otorisasi peran, dan skema validasi DTO.
    - **Controllers (`*.controller.js`):** Menangani siklus HTTP request dan response, mengekstrak data masukan, mendelegasikan pemrosesan ke service layer, dan mengembalikan format respons standar.
    - **Services (`*.service.js`):** Menampung seluruh logika bisnis inti (*core business logic*), transaksi database, enkripsi, dan penulisan jejak audit.
    - **Database/Repository:** Akses data terisolasi menggunakan Prisma Client singleton (`src/config/prisma.js`).
  - **Modular Architecture:** Setiap modul fitur dikelompokkan ke dalam direktori independen (`src/modules/auth`, `src/modules/profile`, dll.), mempermudah kolaborasi tim dan pemeliharaan jangka panjang.
  - **Standardized API Response Handler (`src/utils/apiResponse.js`):** Menjamin konsistensi struktur respons JSON untuk seluruh endpoint sistem:
    ```json
    {
      "success": true,
      "message": "Deskripsi respon berhasil",
      "data": { ... },
      "meta": { ... }
    }
    ```

---

### 3. Database Relasional & ORM

#### PostgreSQL (v16+)
- **Alasan Pemilihan:** PostgreSQL dipilih sebagai basis data utama karena keunggulannya dalam integritas data transaksional (**ACID Compliance**), skalabilitas, serta kemampuan pengelolaan relasi data yang kompleks.
- **Penerapan pada Domain Akademik:**
  - Menjamin integritas referensial data akademik yang rumit (relasi antara mahasiswa, semester, KRS, penawaran kelas, jadwal ruangan, presensi, kuis, dan nilai akhir).
  - Mencegah inkonsistensi data seperti bentrokan ruangan kuliah (*room double-booking*), kuota kelas melebihi kapasitas, dan pembentukan duplikasi *enrollment* SPADA.
- **Fitur Database yang Dimanfaatkan:**
  - Penggunaan identifier **UUID v4** sebagai *Primary Key* pada seluruh tabel untuk keamanan identitas data dan mencegah serangan enumerasi (*ID enumeration attack*).
  - Relasi *Foreign Key* dengan konfigurasi `CASCADE` atau `RESTRICT` yang ketat untuk menjaga keutuhan data historis akademik (nilai, KHS, transkrip).
  - Definisi tipe data `Enum` untuk status akun (`ACTIVE`, `INACTIVE`, `SUSPENDED`), jenis kelamin, dan semester.

#### Prisma ORM (v6.4.1)
- **Alasan Pemilihan:** Prisma menyediakan lapisan abstraksi database modern yang mengedepankan keamanan tipe data (*type safety*) dan efisiensi pengembang:
  - **Declarative Schema Modeling (`prisma/schema.prisma`):** Menjadi *Single Source of Truth* untuk 22+ tabel entitas (User, Role, Permission, Mahasiswa, Dosen, AdminProfile, CalonMahasiswa, Fakultas, ProgramStudi, TahunAkademik, Semester, KalenderAkademik, Kurikulum, MataKuliah, Gedung, Ruangan, Kelas, File, AuditLog).
  - **Prisma Client (`@prisma/client`):** Menghasilkan client query otomatis dengan perlindungan built-in terhadap celah SQL Injection melalui parameterized queries.
  - **Prisma Migrate (`prisma migrate dev`):** Mengelola riwayat migrasi skema database secara otomatis, terstruktur, dan terdokumentasi rapi di folder `prisma/migrations`.
  - **Database Seeder (`prisma/seed.js`):** Script inisialisasi otomatis untuk mengisi 8 peran resmi, 11 permission sistem, akun pengujian awal untuk seluruh aktor, dan master data akademik rintisan.
  - **Prisma Studio (`npm run db:studio`):** Dashboard antarmuka visual berbasis web untuk mempermudah inspeksi dan manipulasi data saat pengembangan lokal.

---

### 4. Autentikasi, Sesi & Kriptografi

#### Dual-Token JSON Web Token (JWT - `jsonwebtoken` v9.0.2)
- **Alasan Pemilihan:** Menggunakan arsitektur autentikasi nir-keadaan (*stateless*) modern dengan memisahkan siklus hidup token akses dan token penyegaran (mengacu pada SRS FR-013 s/d FR-016):
  - **Access Token:** Berumur pendek (**15 menit**), membawa klaim payload terenkripsi (`userId`, `username`, `roles`, `permissions`) yang diverifikasi langsung pada setiap request tanpa membebani database.
  - **Refresh Token:** Berumur panjang (**7 hari**), digunakan untuk menerbitkan access token baru secara transparan tanpa memaksa pengguna melakukan login berulang.
- **Keamanan Kriptografis Refresh Token (SHA-256 Hashing):**
  - Untuk mencegah pencurian sesi jika database terekspos, Refresh Token tidak pernah disimpan dalam bentuk teks biasa (*plaintext*).
  - Sistem mengonversi token menjadi nilai hash **SHA-256** sebelum disimpan di tabel `refresh_tokens` (`src/utils/token.js`).
  - Mendukung mekanisme pencabutan instan (*revocation*) saat pengguna melakukan logout atau mengganti kata sandi mandiri.

#### Bcryptjs (v3.0.2)
- **Alasan Pemilihan:** Algoritma hashing kata sandi satu arah (*one-way salted hash*) yang adaptif dan terbukti kebal terhadap serangan *rainbow table* maupun serangan akselerasi perangkat keras khusus GPU.
- **Konfigurasi:** Menggunakan salt rounds sebesar **12 rounds**, memberikan standar keamanan industri terbaik sekaligus menjaga performa server tetap responsif.

---

### 5. Otorisasi Berbasis Peran (Granular RBAC Engine)

Sistem mengadopsi prinsip **Least Privilege** dan **Defense in Depth** dengan memadukan validasi berbasis Role dan Permission (mengacu pada SRS Bab 3 & Bab 31):

1. **Dukungan Multi-Role:** Pengguna dapat mengemban lebih dari satu peran (misal: seorang `DOSEN` yang sekaligus bertindak sebagai `DOSEN_WALI` mahasiswa angkatan tertentu).
2. **8 Peran Resmi Sistem:**
   - `SUPER_ADMIN`: Administrator pusat kendali penuh atas sistem, user, role, permission, dan audit log.
   - `ADMIN_AKADEMIK`: Pengelola master data kelembagaan, kurikulum, KRS, jadwal, nilai, dan transkrip.
   - `ADMIN_LMS`: Penanggung jawab operasional, monitoring, dan konfigurasi platform SPADA.
   - `DOSEN`: Pengampu mata kuliah, pengelola 16 pertemuan SPADA, pembuat materi, tugas, kuis, presensi, dan nilai.
   - `DOSEN_WALI`: Pembimbing akademik yang memiliki wewenang memeriksa, menyetujui, atau mengembalikan KRS mahasiswa.
   - `MAHASISWA`: Pengguna layanan akademik SIA (KRS, jadwal, KHS) dan peserta kelas pembelajaran SPADA.
   - `CALON_MAHASISWA`: Akun pelamar seleksi PMB, pengunggah dokumen pendaftaran, dan pemantau hasil seleksi.
   - `USER_UMUM`: Pengguna publik yang mengakses beranda, informasi kampus, dan profil program studi.
3. **Middleware Otorisasi Granular:**
   - `authenticateToken`: Mengekstrak Bearer token JWT, memvalidasi masa aktif, memastikan status akun `ACTIVE` (*SRS UC-01/BR*), serta menyematkan identitas pengguna ke `req.user`.
   - `requireRole([...roles])`: Membatasi rute untuk peran spesifik dengan mekanisme bypass wewenang penuh bagi `SUPER_ADMIN`.
   - `requirePermission(permission)` & `requireAnyPermission([...permissions])`: Otorisasi tingkat lanjut berbasis hak akses operasional (misal: `krs:approve`, `grades:input`, `audit:read`).

---

### 6. Validasi Data & Penanganan Kesalahan

#### Zod (v3.24.2)
- **Alasan Pemilihan:** Library deklarasi skema TypeScript-first/JavaScript dengan inferensi tipe data runtime yang presisi, performa validasi tinggi, dan pesan kesalahan yang mudah dipahami.
- **Penerapan DTO (Data Transfer Object):** Seluruh masukan pengguna divalidasi secara ketat sebelum menyentuh lapisan service:
  - **Body Validation:** Format email, kompleksitas kata sandi minimal 8 karakter, kelengkapan form profil.
  - **Params Validation:** Memastikan format ID sesuai spesifikasi UUID v4.
  - **Query Validation:** Sanitasi parameter pagination, sorting, dan filter pencarian.

#### Centralized Error Handling (`src/middlewares/error.middleware.js`)
- Sistem penanganan kesalahan terpusat yang secara konsisten menangkap dan menerjemahkan berbagai jenis error:
  - `AppError` kustom dengan kode status HTTP dan pesan spesifik.
  - `ZodError` untuk menghasilkan detail kesalahan per field input yang ramah bagi antarmuka pengguna.
  - Prisma Database Known Errors (seperti kode `P2002` untuk pelanggaran unique constraint dan `P2025` untuk data yang tidak ditemukan).
  - Kesalahan autentikasi JWT (`TokenExpiredError`, `JsonWebTokenError`).

---

### 7. Keamanan HTTP & Server Hardening

1. **Helmet (v8.0.0):**
   - Mengamankan aplikasi dari kerentanan umum web dengan mengonfigurasi header HTTP esensial (Content Security Policy, Cross-Origin-Embedder-Policy, Strict-Transport-Security, X-Frame-Options: SAMEORIGIN, X-Content-Type-Options: nosniff).
2. **CORS (Cross-Origin Resource Sharing v2.8.5):**
   - Membatasi akses request lintas-domain hanya dari alamat origin antarmuka frontend yang terdaftar pada konfigurasi `CORS_ORIGIN`, lengkap dengan dukungan pengiriman kredensial otorisasi (`credentials: true`).
3. **Express Rate Limit (v7.5.0):**
   - Membatasi laju request per IP address untuk melindungi server dari serangan brute-force login, DDoS ringan, dan eksploitasi otomatis.
4. **Proteksi File & Dokumen (SRS Bab 35):**
   - Sistem menyimpan berkas penugasan dan dokumen PMB dengan perlindungan akses terotorisasi; tidak menggunakan URL publik langsung untuk berkas jawaban mahasiswa.

---

### 8. Logging, Audit Trail & Observability

#### Morgan (v1.10.0)
- Middleware pencatat lalu lintas HTTP request yang mencatat metode HTTP, rute URL, kode status respon, durasi latensi eksekusi, dan ukuran payload response pada terminal saat pengembangan.

#### Persistent Database Audit Trail Engine (`src/utils/auditLogger.js`)
- Sesuai amanat **SRS Bab 15 & Bab 35**, setiap perubahan status penting dan aksi administratif krusial dicatat secara persisten ke tabel `audit_logs` di PostgreSQL.
- Parameter jejak audit mencakup:
  - `user_id`: Pengguna yang menginisiasi aksi.
  - `action`: Tipe tindakan (`LOGIN`, `LOGOUT`, `UPDATE_PROFILE`, `CHANGE_PASSWORD`, dll.).
  - `entity`: Nama entitas yang terpengaruh (`User`, `KRS`, `Kelas`, dll.).
  - `entity_id`: ID rekaman data yang dimodifikasi.
  - `ip_address` & `user_agent`: Alamat IP asal dan identitas perangkat/browser klien.
  - `metadata`: Snapshot JSON rincian mutasi data.

#### Health Check Endpoint
- Menyediakan rute pemantauan status `/health` dan `/api/v1` untuk memeriksa kesiapan operasional server (*readiness probe*).

---

### 9. Development Tooling & Automated Testing

#### Nodemon (v3.1.9)
- Memantau perubahan kode sumber di direktori `src/` secara berkala dan melakukan restart otomatis pada proses Node.js untuk mempercepat siklus *feedback* pengembang.

#### Dotenv (v16.4.7)
- Memuat konfigurasi dari berkas `.env` ke dalam lingkungan eksekusi secara aman, kemudian diorganisir dan divalidasi oleh modul `src/config/env.js`.

#### Node.js Native Test Runner (`node --test`)
- **Filosofi:** Memanfaatkan runner pengujian bawaan Node.js v20+ bersama modul assertion `node:assert/strict`. Pendekatan ini memberikan kecepatan eksekusi tinggi, ringan, dan menghilangkan overhead paket eksternal besar.
- **Cakupan Automated Integration Tests (`tests/phase2.test.js`):**
  - Verifikasi autentikasi multi-kredensial (Username, NIM, NIDN, Email).
  - Penolakan login jika password salah atau akun non-aktif (*SRS UC-01*).
  - Siklus penerbitan access token baru via refresh token valid.
  - Pencabutan token sesi saat logout.
  - Pengujian hak akses baca dan pembaruan mandiri data profil.
  - Validasi penolakan akses endpoint terproteksi tanpa Bearer token valid.
  - Pengujian unit fungsi RBAC (`requireRole`, `requirePermission`, `requireAnyPermission`).
  - Pengujian pergantian kata sandi mandiri dan forgot password.
  - Validasi kesesuaian endpoint konseptual alias SRS Bab 32 (`/api/login`, `/api/logout`, `/api/profile`).
  - Verifikasi pencatatan jejak audit ke tabel database.

---

### 10. Ekosistem Frontend & Integrasi Antarmuka

Backend dirancang sepenuhnya terpisah (*decoupled architecture*) sebagai penyedia layanan RESTful API murni, siap dihubungkan dengan berbagai jenis antarmuka modern:

- **Target Frontend:** Single Page Application (SPA) atau Server-Side Rendered (SSR) berbasis **React + Vite** atau **Next.js**.
- **Whitelist Origin Default:** Telah siap melayani `http://localhost:5173` (Vite) dan `http://localhost:3000` (Next.js / CRA).
- **Rencana Modul Antarmuka (SRS Bab 16, 29, 30):**
  - **Portal Gateway:** Tampilan dasbor navigasi utama setelah login.
  - **Sistem Informasi Akademik (SIA):** Antarmuka mahasiswa (KRS, KHS, Transkrip, Jadwal), antarmuka Dosen Wali (persetujuan KRS), dan antarmuka Admin Akademik.
  - **SPADA / LMS:** Ruang kelas perkuliahan berbasis 16 pertemuan, fitur materi, unduh soal tugas, unggah jawaban file, form presensi, kuis online, dan UTS/UAS.
  - **PMB Portal:** Portal pendaftaran publik, formulir isian calon mahasiswa, dan unggah berkas seleksi.

---

## 🏗 Arsitektur Sistem & Alur Integrasi

### Diagram Arsitektur Lapisan (Layered Architecture)

```text
+-------------------------------------------------------------------------------+
|                       PRESENTATION LAYER (Frontend Clients)                   |
|   +-------------------+  +-------------------+  +-------------------------+   |
|   |  Portal / Gateway |  |   SIA Web Client  |  |   SPADA / LMS Web Client|   |
|   +-------------------+  +-------------------+  +-------------------------+   |
+-------------------------------------------------------------------------------+
                                        │  (HTTPS / JSON REST API)
                                        ▼
+-------------------------------------------------------------------------------+
|                      BACKEND APPLICATION LAYER (Express.js)                   |
|                                                                               |
|   [Security & Hardening]   -> Helmet, CORS, Express-Rate-Limit                |
|   [Request Logging]        -> Morgan HTTP Logger                              |
|   [Auth & RBAC Middleware] -> JWT Verifier, Active Status Guard, Role Guard   |
|   [Validation Middleware]  -> Zod DTO Schema Validator                        |
|                                                                               |
|   +-----------------------------------------------------------------------+   |
|   |                         Modular API Controllers                       |   |
|   |  • Auth Module       • Profile Module    • Portal Gateway             |   |
|   |  • Academic (SIA)    • LMS Module (SPADA)• PMB Module                 |   |
|   +-----------------------------------------------------------------------+   |
|                                       │
|                                       ▼
|   +-----------------------------------------------------------------------+   |
|   |                         Core Business Services                        |   |
|   |  • AuthService       • ProfileService    • EnrollmentSyncService      |   |
|   |  • AuditLogService   • FileService       • AcademicRuleEngine         |   |
|   +-----------------------------------------------------------------------+   |
|                                       │
+-------------------------------------------------------------------------------+
                                        │
                                        ▼
+-------------------------------------------------------------------------------+
|                       DATA PERSISTENCE LAYER (Prisma ORM)                     |
|                                                                               |
|   +-----------------------------------------------------------------------+   |
|   |                        Prisma Client Query Engine                     |   |
|   |  • Parameterized SQL Queries  • Automatic Relations  • ACID Tx        |   |
|   +-----------------------------------------------------------------------+   |
|                                       │
|                                       ▼
|   +-----------------------------------------------------------------------+   |
|   |                      PostgreSQL 16 Relational DB                      |   |
|   |  • users / roles / permissions   • fakultas / prodi / matakuliah      |   |
|   |  • krs / krs_detail / enrollment • pertemuan / materi / tugas / kuis  |   |
|   |  • audit_logs                    • refresh_tokens / files             |   |
|   +-----------------------------------------------------------------------+   |
+-------------------------------------------------------------------------------+
```

### Alur Integrasi Antar Modul (End-to-End Workflow)

```text
[PMB: Registrasi Calon Mahasiswa & Seleksi Berkas]
                       │
                       ▼
[Diterima & Registrasi Ulang: Pembuatan Akun Mahasiswa Aktif]
                       │
                       ▼
[Mahasiswa Login ke Portal & Mengisi Rencana Studi (KRS) di SIA]
                       │
                       ▼
[Pemeriksaan & Persetujuan KRS oleh Dosen Wali / PA]
                       │
         ┌─────────────┴─────────────────────────────┐
         ▼                                           ▼
[Jadwal Kuliah Mahasiswa Aktif di SIA]     [Otomatisasi Enrollment SPADA]
                                                     │
                                                     ▼
                                      [Ruang Kelas SPADA: 16 Pertemuan]
                                      (Materi, Tugas, Kuis, Presensi, UTS/UAS)
                                                     │
                                                     ▼
                                      [Pengolahan Nilai oleh Dosen]
                                                     │
                                                     ▼
                                      [Sinkronisasi Nilai Akhir ke SIA]
                                                     │
                                                     ▼
                                      [Penerbitan KHS & Transkrip Akademik]
```

---

## 📂 Struktur Direktori Proyek

```text
rpl-lms/
├── PRD.md                           # Dokumen Product Requirements Document
├── SRS.md                           # Dokumen Software Requirements Specification
├── IMPLEMENTATION_PLAN_MVP1_BACKEND.md # Rencana kerja teknis implementasi backend
├── README.md                        # Dokumentasi teknis proyek & deskripsi lengkap tech stack
│
└── backend/                         # Layanan backend REST API
    ├── package.json                 # Konfigurasi dependensi dan script npm
    ├── .env                         # Berkas konfigurasi lingkungan lokal
    ├── .env.example                 # Template konfigurasi variabel lingkungan
    ├── README.md                    # Dokumentasi spesifik modul backend
    │
    ├── prisma/                      # Konfigurasi & skema basis data
    │   ├── schema.prisma            # Definisi 22+ entitas model database
    │   ├── seed.js                  # Script inisialisasi master data & akun seeder
    │   └── migrations/              # Riwayat migrasi DDL database PostgreSQL
    │
    ├── src/                         # Kode sumber aplikasi utama
    │   ├── server.js                # Titik masuk server HTTP & inisialisasi Prisma
    │   ├── app.js                   # Konfigurasi Express app, middleware global, & rute
    │   │
    │   ├── config/                  # Konfigurasi aplikasi terpusat
    │   │   ├── env.js               # Validasi & parsing variabel lingkungan
    │   │   └── prisma.js            # Instansiasi Prisma Client singleton
    │   │
    │   ├── constants/               # Konstanta sistem
    │   │   ├── roles.js             # Definisi 8 peran resmi kampus
    │   │   └── permissions.js       # Definisi kode permission sistem
    │   │
    │   ├── middlewares/             # Middleware rantai pipa Express
    │   │   ├── auth.middleware.js   # Verifikasi Access Token JWT & status akun
    │   │   ├── rbac.middleware.js   # Proteksi otorisasi Role & Permission Guard
    │   │   ├── validate.middleware.js # Validasi DTO masukan berbasis Zod
    │   │   └── error.middleware.js  # Global error handler terpusat
    │   │
    │   ├── modules/                 # Modul fitur bisnis
    │   │   ├── auth/                # Modul autentikasi (login, refresh, logout, password)
    │   │   │   ├── auth.controller.js
    │   │   │   ├── auth.service.js
    │   │   │   ├── auth.routes.js
    │   │   │   └── auth.validation.js
    │   │   └── profile/             # Modul profil mandiri pengguna
    │   │       ├── profile.controller.js
    │   │       ├── profile.service.js
    │   │       ├── profile.routes.js
    │   │       └── profile.validation.js
    │   │
    │   └── utils/                   # Pustaka utilitas pembantu
    │       ├── apiResponse.js       # Format respon JSON standar
    │       ├── errors.js            # Kelas AppError & status HTTP
    │       ├── password.js          # Utilitas hashing & perbandingan Bcrypt
    │       ├── token.js             # Utilitas pembuatan JWT & hashing token
    │       └── auditLogger.js       # Utilitas pencatatan audit log database
    │
    └── tests/                       # Automated Integration Test Suite
        └── phase2.test.js           # 13 skenario pengujian otomatis auth, profil, & RBAC
```

---

## 🚀 Panduan Instalasi & Menjalankan Proyek

### 1. Prasyarat Sistem
Pastikan sistem operasi Anda telah memiliki:
- **Node.js:** Versi `>= 20.0.0 LTS` ([Download Node.js](https://nodejs.org/))
- **PostgreSQL:** Versi `>= 16.0` ([Download PostgreSQL](https://www.postgresql.org/))
- **Git:** Versi terbaru

### 2. Persiapan Basis Data PostgreSQL
Buat database baru pada server PostgreSQL lokal:
```sql
CREATE DATABASE rpl_lms;
```

### 3. Konfigurasi Lingkungan (.env)
Pindah ke direktori `backend` dan salin berkas `.env.example` menjadi `.env`:
```bash
cd backend
cp .env.example .env
```

Sesuaikan isi berkas `.env` dengan konfigurasi mesin lokal:
```env
PORT=5000
NODE_ENV=development

# URL Koneksi PostgreSQL
DATABASE_URL="postgresql://postgres:password@localhost:5432/rpl_lms?schema=public"

# Kunci Rahasia JWT (Gunakan minimal 32 karakter acak yang kuat)
JWT_ACCESS_SECRET="super-secret-access-key-minimum-32-chars"
JWT_ACCESS_EXPIRES_IN="15m"
JWT_REFRESH_SECRET="super-secret-refresh-key-minimum-32-chars"
JWT_REFRESH_EXPIRES_IN="7d"

# Domain Frontend yang Diizinkan (CORS)
CORS_ORIGIN="http://localhost:3000,http://localhost:5173"
```

### 4. Instalasi Dependensi, Migrasi & Seeder
```bash
# 1. Unduh dan instal seluruh library dependensi
npm install

# 2. Sinkronisasikan skema Prisma ke PostgreSQL lokal
npm run db:migrate

# 3. Jalankan Database Seeder untuk mengisi data master & akun awal
npm run db:seed
```

### 5. Menjalankan Server & Pengujian
```bash
# Menjalankan server dalam mode development (Nodemon dengan live-reload)
npm run dev

# Menjalankan server dalam mode production
npm start

# Menjalankan rangkaian Automated Integration Tests (13 skenario uji lulus 100%)
npm test
```

Akses endpoint untuk memverifikasi server:
- **Health Check Status:** `http://localhost:5000/health`
- **API Welcome Root:** `http://localhost:5000/api/v1`
- **Prisma Studio (Visual DB Explorer):** `npm run db:studio` (dapat diakses pada `http://localhost:5555`)

---

## 👥 Daftar Akun Pengujian (Seeder)

Database seeder (`prisma/seed.js`) telah menyediakan akun awal siap pakai untuk seluruh peran sistem. Seluruh akun default menggunakan kata sandi: `Password123!`

| Peran (Role) | Kredensial Login (Username / NIK / NIM / Email) | Email Terdaftar | Password Default |
|---|---|---|---|
| **Super Admin** | `superadmin` | `superadmin@kampus.ac.id` | `Password123!` |
| **Admin Akademik** | `admin_akademik` | `admin.akademik@kampus.ac.id` | `Password123!` |
| **Admin LMS** | `admin_lms` | `admin.lms@kampus.ac.id` | `Password123!` |
| **Dosen & PA** | `198501152010121002` | `budi.santoso@kampus.ac.id` | `Password123!` |
| **Dosen Pengampu** | `199003202015042001` | `siti.aminah@kampus.ac.id` | `Password123!` |
| **Mahasiswa** | `2024001001` | `ahmad.fauzi@student.kampus.ac.id` | `Password123!` |
| **Calon Mahasiswa** | `PMB20260001` | `rizky.pratama@gmail.com` | `Password123!` |

> **Catatan Login:** Endpoint `/api/v1/auth/login` dan `/api/login` mendukung multi-kredensial: pengguna dapat masuk menggunakan **Username / Nomor Induk (NIM / NIDN / NIP)** maupun alamat **Email** terdaftar.

---

## 📚 Dokumentasi Terkait

- **[PRD.md](PRD.md):** *Product Requirements Document* — Latar belakang, sasaran pengguna, ruang lingkup modul, dan fungsionalitas sistem.
- **[SRS.md](SRS.md):** *Software Requirements Specification* — Analisis sistem komprehensif, use case, activity diagram, sequence diagram, data dictionary (ERD), role-permission matrix, dan page specification.
- **[IMPLEMENTATION_PLAN_MVP1_BACKEND.md](IMPLEMENTATION_PLAN_MVP1_BACKEND.md):** Rencana detail tahapan implementasi teknis MVP 1 sisi backend.
- **[backend/README.md](backend/README.md):** Dokumentasi teknis khusus modul backend, daftar endpoint API, dan status fase pengembangan.
