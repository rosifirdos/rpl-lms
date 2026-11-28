# Matriks Ketertelusuran Kebutuhan (Requirement Traceability Matrix — RTM)
# E-Learning Kampus — Learning Management System (LMS) Universitas

**Team Membangun Negeri — Rekayasa Perangkat Lunak 2026**  
**Acuan:** [SRS.md](SRS.md) · [PRD.md](PRD.md) · [TEST_PLAN.md](TEST_PLAN.md) · [TEST_CASES.md](TEST_CASES.md) · [QA_TESTING_GUIDE.md](QA_TESTING_GUIDE.md)  
**Versi:** 1.0 | **Tanggal:** 26 November 2026 | **Status:** Baseline Aktif  

---

## 1. Pendahuluan

### 1.1 Definisi & Tujuan RTM
**Requirement Traceability Matrix (RTM)** adalah dokumen penjaminan mutu yang memetakan hubungan dua arah (*bi-directional traceability*) antara:
1. **Kebutuhan Pengguna & Produk (PRD)**
2. **Spesifikasi Kebutuhan Perangkat Lunak (SRS: Functional Requirements, Business Rules, Non-Functional Requirements)**
3. **Kasus Pengujian (Test Cases & Test Scenarios)**

Tujuan utama dokumen ini adalah memastikan **tidak ada kebutuhan sistem yang terlewat dari pengujian (*zero missed requirements*)**, memberikan transparansi kesiapan rilis per tahapan MVP, serta mengidentifikasi dampak perubahan requirement (*impact analysis*) terhadap cakupan uji.

### 1.2 Konvensi Status Pengujian
- ✅ **Verified**: Telah diuji dan lulus (*Pass*).
- 🟡 **Ready to Test**: Fitur telah terimplementasi di kode (MVP 1 & MVP 2), siap dieksekusi oleh tester.
- ⛔ **Blocked by Roadmap**: Fitur belum dijadwalkan pada rilis berjalan (direncanakan untuk MVP 3, MVP 4, atau MVP 5 sesuai SRS Bab 27). **Bukan cacat/bug**.
- ❌ **Failed**: Telah diuji namun tidak memenuhi ekspektasi (menghasilkan pelaporan bug).

---

## 2. Ringkasan Ketertelusuran per Modul Sistem

| Modul Sistem | Cakupan SRS (FR / NFR / BR) | PRD Epic Terkait | Cakupan Test Case | Status Baseline |
| :--- | :--- | :--- | :--- | :--- |
| **Autentikasi & Sesi** | FR-001 s.d. FR-004, NFR-001, NFR-002 | Epic 1: Autentikasi & Akun | TC-AUTH-01 s.d. 07, AUTH-01 s.d. 15, SESS-01 s.d. 09 | 🟡 Ready to Test |
| **Profil & Avatar** | FR-005 s.d. FR-008, BR-014, NFR-003, NFR-005 | Epic 2: Profil Pengguna Mandiri | TC-PROF-01 s.d. 05, PROF-01 s.d. 15 | 🟡 Ready to Test |
| **Manajemen Pengguna** | FR-044, FR-058, NFR-002, NFR-009 | Epic 3: Tata Kelola Akun Admin | TC-USER-01 s.d. 04, USR-01 s.d. 25 | 🟡 Ready to Test |
| **Master Mata Kuliah** | FR-045, BR-004 | Epic 4: Manajemen Mata Kuliah | TC-CRSE-01 s.d. 03, CRS-01 s.d. 12 | 🟡 Ready to Test |
| **Pembukaan Kelas** | FR-046, BR-004 | Epic 4: Pengelolaan Kelas | TC-CLSS-01 s.d. 02, CLS-01 s.d. 13 | 🟡 Ready to Test |
| **Direct Enrollment** | FR-047, FR-048, BR-002, BR-003 | Epic 5: Direct Enrollment Admin | TC-ENRL-01 s.d. 03, ENR-01 s.d. 07 | 🟡 Ready to Test |
| **Ruang Kelas 16 Pertemuan** | FR-013, FR-014, FR-030, BR-004 | Epic 6: Ruang Kelas 16 Pertemuan | TC-CLSS-01, MTG-01 s.d. 05 | 🟡 Ready to Test |
| **Materi Perkuliahan** | FR-015, FR-031, BR-007, BR-009, NFR-003, NFR-005 | Epic 7: Materi Pembelajaran | TC-MATR-01 s.d. 03, MAT-01 s.d. 08 | 🟡 Ready to Test |
| **Presensi Digital** | FR-023, FR-024, FR-036 s.d. FR-039, FR-055, BR-010, BR-011 | Epic 10: Presensi Digital | TC-ATTN-01 s.d. 05, ATT-01 s.d. 10 | 🟡 Ready to Test |
| **Tugas & Validasi Berkas** | FR-016 s.d. FR-021, FR-032 s.d. FR-034, FR-053, FR-054, BR-006, BR-007, BR-008 | Epic 8: Tugas & Validasi File | TC-009 s.d. TC-012, mvp3-phase2..5 | ✅ Implemented (MVP 3) |
| **Penilaian Skor 0–100** | FR-022, FR-035, BR-006, FR-058 | Epic 9: Penilaian Skor E-Learning | TC-013, TC-014, mvp3-phase4..5 | ✅ Implemented (MVP 3) |
| **Timeline Pembelajaran** | FR-009 s.d. FR-012, BR-013 | Epic 3: Central Timeline | TC-006 | ⛔ Blocked by Roadmap (MVP 4) |
| **Kuis Interaktif** | FR-025, FR-040, FR-041 | Epic 11: Kuis Pembelajaran | - | ⛔ Blocked by Roadmap (MVP 4) |
| **Evaluasi UTS / UAS** | FR-026, FR-027, FR-042, FR-050, FR-056, BR-012 | Epic 11: Gatekeeping UTS/UAS | TC-018 s.d. TC-020 | ⛔ Blocked by Roadmap (MVP 5) |
| **Keamanan & Audit Trail** | FR-052, FR-058, NFR-001 s.d. NFR-009, BR-015 | Epic 13: Keamanan & Audit Trail | TC-SECR-01 s.d. 03, TC-AUDT-01, SEC-01 s.d. 13, AUD-01 s.d. 15 | 🟡 Ready to Test |

---

## 3. Matriks Pemetaan Kebutuhan Fungsional (Functional Requirements — FR)

| ID Req | Deskripsi Kebutuhan (SRS / PRD) | Aktor | MVP Stage | Test Case Terkait (Test ID) | Status Kesiapan |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **FR-001** | Login dengan multi-identifier (username/email/NIM/NIDN/NIP) & password | Semua | MVP 1 | TC-AUTH-01, TC-AUTH-02, AUTH-01..07, TC-001 | 🟡 Ready to Test |
| **FR-002** | Logout sesi pengguna dan pencabutan token aktif secara aman | Semua | MVP 1 | TC-AUTH-03, SESS-05, SESS-06 | 🟡 Ready to Test |
| **FR-003** | Lupa kata sandi (*forgot password*) dengan perlindungan anti-enumerasi | Semua | MVP 1 | TC-AUTH-02, PWD-01..04, UI-05..08 | 🟡 Ready to Test |
| **FR-004** | Pembatasan hak akses berbasis peran secara ketat (*RBAC*) | Semua | MVP 1 | TC-SECR-01, RBAC-01..08, TC-022 | 🟡 Ready to Test |
| **FR-005** | Modul profil mandiri untuk melihat data identitas akun | Semua | MVP 1 | TC-PROF-01, PROF-01, PROF-02 | 🟡 Ready to Test |
| **FR-006** | Pengguna dapat memperbarui data kontak dan bio profil mandiri | Semua | MVP 1 | TC-PROF-01, PROF-03, PROF-05 | 🟡 Ready to Test |
| **FR-007** | Unggah foto profil avatar (format `.png`/`.jpg`, ukuran maks 2MB) | Semua | MVP 1 | TC-PROF-01, TC-PROF-02, PROF-06..09, TC-003, TC-004 | 🟡 Ready to Test |
| **FR-008** | Pergantian kata sandi mandiri dengan validasi kata sandi lama | Semua | MVP 1 | TC-AUTH-03, PWD-05..12, TC-005 | 🟡 Ready to Test |
| **FR-009** | Halaman Timeline Pembelajaran terpusat pada dasbor | Mhs, Dsn | MVP 4 | TC-006 | ⛔ Blocked (MVP 4) |
| **FR-010** | Timeline menampilkan batas waktu (*deadline*) tugas secara kronologis | Mhs, Dsn | MVP 4 | TC-006 | ⛔ Blocked (MVP 4) |
| **FR-011** | Timeline menampilkan jadwal kuis dan jadwal ujian (UTS/UAS) | Mhs, Dsn | MVP 4 | TC-006 | ⛔ Blocked (MVP 4) |
| **FR-012** | Navigasi pintas dari Timeline langsung ke aktivitas terkait | Mhs, Dsn | MVP 4 | TC-006 | ⛔ Blocked (MVP 4) |
| **FR-013** | Mahasiswa melihat daftar kelas yang dienroll oleh Admin di dasbor | Mahasiswa | MVP 1/2 | TC-CLSS-01, ENR-08, TC-007 | 🟡 Ready to Test |
| **FR-014** | Membuka ruang kelas dan melihat silabus daftar 16 pertemuan | Mahasiswa | MVP 2 | TC-CLSS-01, MTG-01, MTG-02 | 🟡 Ready to Test |
| **FR-015** | Mahasiswa melihat dan mengunduh berkas materi perkuliahan terbitan dosen | Mahasiswa | MVP 2 | TC-MATR-01, TC-MATR-02, MAT-05, MAT-06, TC-008 | 🟡 Ready to Test |
| **FR-016** | Mahasiswa melihat instruksi tugas, bobot nilai, dan berkas soal | Mahasiswa | MVP 3 | TC-009, mvp3-phase2..5 | ✅ Implemented |
| **FR-017** | Mahasiswa mengunggah jawaban tugas (*submission*) sebelum deadline | Mahasiswa | MVP 3 | TC-009, TC-012, mvp3-phase3..5 | ✅ Implemented |
| **FR-018** | Validasi tipe file tugas hanya menerima `.pdf`, `.docx`, `.xlsx`, `.zip` | Sistem | MVP 3 | TC-010, mvp3-phase3 | ✅ Implemented |
| **FR-019** | Validasi ukuran berkas tugas maksimal 5MB–10MB dengan penolakan otomatis | Sistem | MVP 3 | TC-011, mvp3-phase3 | ✅ Implemented |
| **FR-020** | Pencatatan timestamp submission dan status keterlambatan (*Late*) | Sistem | MVP 3 | TC-012, mvp3-phase3..5 | ✅ Implemented |
| **FR-021** | Mahasiswa dapat memperbarui/mengganti file jawaban sebelum batas waktu | Mahasiswa | MVP 3 | TC-009, mvp3-phase3 | ✅ Implemented |
| **FR-022** | Mahasiswa melihat perolehan skor tugas numerik (0–100) dan feedback | Mahasiswa | MVP 3 | TC-013, mvp3-phase4..5 | ✅ Implemented |
| **FR-023** | Mahasiswa mengisi presensi hanya apabila sesi presensi telah dibuka dosen | Mahasiswa | MVP 2 | TC-ATTN-01, ATT-03, ATT-04, TC-015, TC-016 | 🟡 Ready to Test |
| **FR-024** | Mahasiswa memantau status kehadiran dan rekapitulasi presensi kelas | Mahasiswa | MVP 2 | TC-ATTN-02, ATT-08 | 🟡 Ready to Test |
| **FR-025** | Mahasiswa mengerjakan kuis interaktif sesuai durasi dan jadwal | Mahasiswa | MVP 4 | - | ⛔ Blocked (MVP 4) |
| **FR-026** | Gatekeeping akses UTS Pertemuan 8 dengan syarat kehadiran $\ge 70\%$ | Mahasiswa | MVP 5 | TC-018, TC-019 | ⛔ Blocked (MVP 5) |
| **FR-027** | Gatekeeping akses UAS Pertemuan 16 dengan syarat kehadiran $\ge 70\%$ | Mahasiswa | MVP 5 | TC-020 | ⛔ Blocked (MVP 5) |
| **FR-028** | Pemantauan progres pembelajaran (*course completion*) di kelas | Mahasiswa | MVP 5 | - | ⛔ Blocked (MVP 5) |
| **FR-029** | Dosen melihat daftar seluruh kelas yang diampunya pada dasbor | Dosen | MVP 1/2 | ENR-09, DASH-02 | 🟡 Ready to Test |
| **FR-030** | Dosen mengelola isi dan struktur silabus Pertemuan 1 s.d. 16 | Dosen | MVP 2 | TC-CLSS-01, MTG-03, MTG-04 | 🟡 Ready to Test |
| **FR-031** | Dosen mengunggah materi pembelajaran pada pertemuan yang ditentukan | Dosen | MVP 2 | TC-MATR-01, MAT-01..04, TC-008 | 🟡 Ready to Test |
| **FR-032** | Dosen menerbitkan tugas perkuliahan (bobot, deadline, file soal) | Dosen | MVP 3 | mvp3-phase2..5 | ✅ Implemented |
| **FR-033** | Dosen melihat daftar penyerahan tugas mahasiswa beserta statusnya | Dosen | MVP 3 | mvp3-phase3..5 | ✅ Implemented |
| **FR-034** | Dosen mengunduh berkas submission mahasiswa secara aman | Dosen | MVP 3 | TC-023, mvp3-phase3..5 | ✅ Implemented |
| **FR-035** | Dosen memberikan nilai evaluasi berbasis skor numerik (0–100) & feedback | Dosen | MVP 3 | TC-013, TC-014, mvp3-phase4..5 | ✅ Implemented |
| **FR-036** | Dosen membuka sesi presensi perkuliahan pada pertemuan berjalan | Dosen | MVP 2 | TC-ATTN-01, ATT-01, TC-016 | 🟡 Ready to Test |
| **FR-037** | Dosen memantau daftar kehadiran mahasiswa real-time saat sesi buka | Dosen | MVP 2 | TC-ATTN-01, ATT-05 | 🟡 Ready to Test |
| **FR-038** | Dosen menutup sesi presensi perkuliahan sewaktu-waktu | Dosen | MVP 2 | TC-ATTN-01, ATT-02, TC-017 | 🟡 Ready to Test |
| **FR-039** | Dosen mengoreksi status kehadiran mahasiswa (Hadir, Sakit, Izin, Alpa) | Dosen | MVP 2 | ATT-06, ATT-07 | 🟡 Ready to Test |
| **FR-040** | Dosen membuat instrumen kuis, bank soal, dan timer durasi | Dosen | MVP 4 | - | ⛔ Blocked (MVP 4) |
| **FR-041** | Dosen melihat dan mengunduh rekap hasil kuis mahasiswa | Dosen | MVP 4 | - | ⛔ Blocked (MVP 4) |
| **FR-042** | Dosen mengelola pelaksanaan evaluasi UTS (P-8) dan UAS (P-16) | Dosen | MVP 5 | TC-018..020 | ⛔ Blocked (MVP 5) |
| **FR-043** | Dosen melihat rekapitulasi nilai akhir perkuliahan kelas | Dosen | MVP 5 | - | ⛔ Blocked (MVP 5) |
| **FR-044** | Admin mengelola master akun pengguna (CRUD Mahasiswa, Dosen, Admin) | Admin | MVP 1 | TC-USER-01, USR-01..25 | 🟡 Ready to Test |
| **FR-045** | Admin mengelola master katalog mata kuliah (kode, nama, SKS) | Admin | MVP 1 | TC-CRSE-01, CRS-01..12 | 🟡 Ready to Test |
| **FR-046** | Admin membuka kelas perkuliahan dan menetapkan dosen pengampu | Admin | MVP 1/2 | TC-CLSS-01, CLS-01..13 | 🟡 Ready to Test |
| **FR-047** | Admin mendaftarkan (*enroll*) mahasiswa ke dalam kelas secara langsung | Admin | MVP 1 | TC-ENRL-01, ENR-01, TC-021 | 🟡 Ready to Test |
| **FR-048** | Admin mencabut (*unenroll*) kepesertaan mahasiswa dari kelas | Admin | MVP 1 | TC-ENRL-01, ENR-04 | 🟡 Ready to Test |
| **FR-049** | Admin mengonfigurasi batas berkas global (ekstensi & ukuran upload) | Admin | MVP 1 | SEC-07, PROF-08, MAT-02 | 🟡 Ready to Test |
| **FR-050** | Admin mengonfigurasi ambang kehadiran kelayakan UTS/UAS | Admin | MVP 5 | - | ⛔ Blocked (MVP 5) |
| **FR-051** | Admin memantau aktivitas pembelajaran seluruh kelas di sistem | Admin | MVP 1/2 | DASH-01, AUD-01..15 | 🟡 Ready to Test |
| **FR-052** | Admin meninjau riwayat mutasi kritis melalui Jejak Audit (*Audit Log*) | Admin | MVP 1 | TC-AUDT-01, AUD-01..15 | 🟡 Ready to Test |
| **FR-053** | Sistem menolak otomatis file dengan format di luar ekstensi yang diizinkan | Sistem | MVP 2/3 | TC-MATR-01, MAT-02, TC-010, mvp3-phase3 | ✅ Implemented |
| **FR-054** | Sistem menolak otomatis file dengan ukuran melebihi limit konfigurasi | Sistem | MVP 2/3 | TC-MATR-01, MAT-03, TC-011, mvp3-phase3 | ✅ Implemented |
| **FR-055** | Sistem mengalkulasi persentase kehadiran mahasiswa secara otomatis | Sistem | MVP 2 | TC-ATTN-02, ATT-08..10 | 🟡 Ready to Test |
| **FR-056** | Penguncian otomatis tombol UTS/UAS bila kehadiran di bawah ambang batas | Sistem | MVP 5 | TC-019, TC-020 | ⛔ Blocked (MVP 5) |
| **FR-057** | Notifikasi internal perkuliahan (tugas baru, presensi buka, nilai rilis) | Sistem | MVP 4 | - | ⛔ Blocked (MVP 4) |
| **FR-058** | Pencatatan otomatis ke tabel Audit Log pada setiap mutasi kritis | Sistem | MVP 1 | TC-AUDT-01, AUD-14, TC-024 | 🟡 Ready to Test |

---

## 4. Matriks Pemetaan Aturan Bisnis (Business Rules — BR)

| ID BR | Deskripsi Aturan Bisnis | Implementasi Sistem | Test Case Pemverifikasi | Status |
| :--- | :--- | :--- | :--- | :--- |
| **BR-001** | Independensi LMS: modul SIA (KRS, KHS, Transkrip) & PMB resmi ditiadakan | Arsitektur mandiri | TC-CLSS-01, TC-ENRL-01 | 🟡 Ready to Test |
| **BR-002** | Direct Enrollment: penempatan mahasiswa langsung oleh Admin tanpa persetujuan KRS | Modul Enrollments Admin | TC-ENRL-01, ENR-01..07, TC-021 | 🟡 Ready to Test |
| **BR-003** | Otoritas Akses Kelas: mahasiswa hanya bisa akses kelas hasil enrollment | Middleware kelas | TC-MATR-02, ENR-08, ENR-10 | 🟡 Ready to Test |
| **BR-004** | Struktur Baku 16 Pertemuan: P-8 untuk UTS, P-16 untuk UAS otomatis terbuat | Auto-generate pertemuan | TC-CLSS-01, CLS-01, MTG-01 | 🟡 Ready to Test |
| **BR-005** | Fleksibilitas Aktivitas: item belum dipublikasi tidak tampak di mahasiswa | Kolom `is_published` | MTG-04, MAT-04 | 🟡 Ready to Test |
| **BR-006** | Standar Penilaian Skor Numerik E-Learning (0–100) | Validasi Zod rentang 0–100 | TC-013, TC-014 | ⛔ Blocked (MVP 3) |
| **BR-007** | Whitelist Ekstensi File: `.pdf`, `.docx`, `.xlsx`, `.zip` | Multer filter & MIME validation | TC-MATR-01, MAT-02, TC-010 | 🟡 Ready to Test |
| **BR-008** | Size Limit File: batas maksimal 5MB s.d. 10MB | Multer file size limits | TC-MATR-01, MAT-03, TC-011 | 🟡 Ready to Test |
| **BR-009** | Penyimpanan Terproteksi: berkas di private storage disajikan lewat streaming | Storage private, no static serve | TC-PROF-01, TC-MATR-02, SEC-09 | 🟡 Ready to Test |
| **BR-010** | Syarat Buka Presensi: mahasiswa hanya bisa check-in saat sesi `OPEN` | Sesi status check | TC-ATTN-01, ATT-03, TC-015 | 🟡 Ready to Test |
| **BR-011** | Penutupan Presensi: sesi `CLOSED` mengunci check-in mahasiswa | Guard session closed | TC-ATTN-01, ATT-04, TC-017 | 🟡 Ready to Test |
| **BR-012** | Ambang Kehadiran Ujian: kehadiran $\ge 70\%$ untuk akses UTS/UAS | Gatekeeping validator | TC-018, TC-019, TC-020 | ⛔ Blocked (MVP 5) |
| **BR-013** | Kronologi Timeline: urutan berbasis waktu server resmi | Query sort by timestamp | TC-006 | ⛔ Blocked (MVP 4) |
| **BR-014** | Profil Mandiri: pengguna bebas kelola data diri, kontak, avatar, password | Modul profile mandiri | TC-PROF-01, PROF-01..15 | 🟡 Ready to Test |
| **BR-015** | Immutabilitas Audit Trail: log mutasi kritis tidak dapat diubah/dihapus | Read-only audit log table | TC-AUDT-01, AUD-14, TC-024 | 🟡 Ready to Test |

---

## 5. Matriks Pemetaan Kebutuhan Non-Fungsional (Non-Functional Requirements — NFR)

| ID NFR | Kategori & Deskripsi | Parameter Pengujian | Test Case Pemverifikasi | Status |
| :--- | :--- | :--- | :--- | :--- |
| **NFR-001** | **Security (Hashing)**: Kata sandi wajib di-hash satu arah (Bcrypt work factor $\ge 10$) | Tidak ada password plaintext di DB & respons | SEC-11, USR-06 | 🟡 Ready to Test |
| **NFR-002** | **Authorization (RBAC)**: Penegakan hak akses pada setiap endpoint API | Pengujian akses silang role (403 Forbidden) | TC-SECR-01, RBAC-01..08, TC-022 | 🟡 Ready to Test |
| **NFR-003** | **File Upload Security**: Pemeriksaan ganda (ekstensi & MIME type) | Tolak ekstensi executable (`.exe`, `.sh`) | TC-MATR-01, MAT-02, PROF-07 | 🟡 Ready to Test |
| **NFR-004** | **File Size Limiting**: Pembatasan ukuran di sisi server sebelum diproses | Penolakan berkas melebihi kuota 2MB/10MB | TC-PROF-02, MAT-03, SEC-07 | 🟡 Ready to Test |
| **NFR-005** | **Private File Storage**: File tersimpan di luar direktori statis web publik | Akses URL langsung menghasilkan 404 | TC-PROF-01, TC-MATR-02, SEC-08, SEC-09 | 🟡 Ready to Test |
| **NFR-006** | **HTTP Hardening**: Penerapan header Helmet & CORS whitelist ketat | Header nosniff, CORS evil-origin blokir 403 | SEC-01, SEC-02, SEC-03 | 🟡 Ready to Test |
| **NFR-007** | **Rate Limiting**: Pencegahan serangan Brute-Force pada login & API publik | Limit 20 login/15m menghasilkan 429 | TC-SECR-02, SEC-04, SEC-05, SEC-06 | 🟡 Ready to Test |
| **NFR-008** | **Data Integrity & Anti-Injection**: Bebas dari SQLi dan celah XSS | Parameterized Prisma & escaping antarmuka | TC-SECR-03, SEC-12, SEC-13 | 🟡 Ready to Test |
| **NFR-009** | **Auditability**: Seluruh mutasi kritis terekam lengkap | Aksi mutasi tercatat dengan detail IP & user | TC-AUDT-01, AUD-01..15 | 🟡 Ready to Test |
| **NFR-010** | **Usability & Responsiveness**: Tampilan adaptif pada 375px, 768px, 1440px | Uji responsivitas UI mobile/tablet/desktop | UI-01, UI-10, UI-11 | 🟡 Ready to Test |

---

## 6. Analisis Cakupan Uji (Coverage Analysis Summary)

```
+-------------------------------------------------------------------------------+
|                            RTM COVERAGE SUMMARY                               |
| Total Functional Requirements (FR)       : 58 Kebutuhan                       |
|   - Siap Diuji (MVP 1 & MVP 2 In-Scope)  : 39 Kebutuhan (67.2%) -> 100% Ada TC |
|   - Blocked by Roadmap (MVP 3, 4, 5)     : 19 Kebutuhan (32.8%) -> Status Aman|
|                                                                               |
| Total Business Rules (BR)                : 15 Aturan                          |
|   - Siap Diuji (MVP 1 & MVP 2 In-Scope)  : 11 Aturan    (73.3%) -> 100% Ada TC |
|   - Blocked by Roadmap (MVP 3, 4, 5)     :  4 Aturan    (26.7%) -> Status Aman|
|                                                                               |
| Total Non-Functional Requirements (NFR)  : 10 Persyaratan                     |
|   - Siap Diuji Seluruhnya                : 10 Persyaratan (100%) -> 100% Ada TC|
|                                                                               |
| KESIMPULAN GAP: ZERO UNTESTED IN-SCOPE REQUIREMENTS (0 Celah Uji)             |
+-------------------------------------------------------------------------------+
```

---

## 7. Referensi Silang & Penelusuran Dokumen
- **Skenario & Detail Kasus Uji:** [TEST_CASES.md](TEST_CASES.md)
- **Rencana & Strategi Pengujian:** [TEST_PLAN.md](TEST_PLAN.md)
- **Panduan Operasional & Prosedur QA:** [QA_TESTING_GUIDE.md](QA_TESTING_GUIDE.md)
- **Spesifikasi Kebutuhan Sistem:** [SRS.md](SRS.md)
- **Dokumen Kebutuhan Produk:** [PRD.md](PRD.md)
