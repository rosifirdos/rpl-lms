# Jobdesk Divisi Tester / QA
# SPADA (Learning Management System) Universitas PGRI Semarang (UPGRIS)
**Team Membangun Negeri — Panduan Kerja Quality Assurance: Pengujian Manual & Pengujian Berbantuan AI Agent**

---

## 📌 Ringkasan Dokumen

| Item | Keterangan |
| --- | --- |
| **Pemilik Dokumen** | Divisi Tester / QA (SRS Bab 28) |
| **Acuan Utama** | [SRS.md](SRS.md) Bab 22, 23, 26, 28, 29 · [PRD.md](PRD.md) · [IMPLEMENTATION_PLAN_MVP1_BACKEND.md](IMPLEMENTATION_PLAN_MVP1_BACKEND.md) · [IMPLEMENTATION_PLAN_MVP2_BACKEND.md](IMPLEMENTATION_PLAN_MVP2_BACKEND.md) · [COLLABORATION_GUIDE.md](COLLABORATION_GUIDE.md) |
| **Cakupan Dokumen** | (1) Prosedur & test case **manual**, (2) Prosedur & **prompt siap pakai** untuk pengujian/review berbantuan AI Agent, (3) Guardrail wajib agar AI Agent **hanya boleh menguji dan mereview — tanpa hak mengubah kode**, (4) Format pelaporan bug & exit criteria. |
| **Prinsip Kerja** | **QA tidak memperbaiki kode.** QA membuktikan perilaku sistem, mencatat bukti, dan menyerahkan temuan ke developer pemilik modul. |
| **Status Dokumen** | Aktif — diselaraskan dengan kondisi repositori per 28 Oktober 2026 |

> **Aturan Emas:** Setiap laporan bug tanpa *bukti* (request/response, log, screenshot, atau `file:line`) dianggap **belum valid** dan akan dikembalikan ke pelapor.

---

## 1. Peran, Tanggung Jawab & Batas Wewenang QA

### 1.1 Tanggung Jawab Utama (SRS Bab 28)

1. Menyusun dan memelihara skenario uji (*test case*) yang tertelusur ke requirement (FR/NFR) dan SRS Bab 26.
2. Mengeksekusi pengujian fungsional, negatif, batas (*boundary*), keamanan dasar, dan regresi.
3. Menjalankan test case otomatis yang sudah ada sebagai gerbang regresi.
4. Melaporkan defect secara terstruktur dan memverifikasi perbaikannya (*retest*).
5. Menjaga **Requirement Traceability Matrix** (SRS Bab 29) tetap akurat: requirement mana yang sudah terbukti, belum terbukti, atau terblokir.
6. Menjadi peninjau independen pada Pull Request (COLLABORATION_GUIDE Bab 6) — **review, bukan menulis kode fitur**.

### 1.2 Batas Wewenang (WAJIB)

| ✅ Boleh | ❌ Tidak Boleh |
| --- | --- |
| Membaca seluruh kode, dokumen, dan riwayat git | Mengubah/menambah/menghapus file di repositori |
| Menjalankan aplikasi, test suite, dan request HTTP ke **database lokal/uji** | Menjalankan `prisma migrate`, `prisma db push`, atau SQL tulis ke database bersama/staging/produksi |
| Membuat akun & data uji melalui API resmi | Mengedit langsung isi database dengan SQL manual sebagai "jalan pintas" |
| Memberi komentar review pada Pull Request | Melakukan `git commit`/`push`/`merge` ke branch orang lain |
| Mengusulkan perbaikan dalam bentuk **deskripsi** | Mengirim patch/perubahan kode sebagai "bantuan" tanpa diminta pemilik modul |
| Menjalankan AI Agent untuk membaca & menganalisis | Memberi AI Agent hak tulis (write/edit) ke filesystem proyek |

> Jika menemukan bug kritis yang memblokir pengujian lanjutan (mis. server tidak bisa start), **eskalasi ke developer pemilik modul** — jangan perbaiki sendiri.

---

## 2. Baseline yang Diuji (Kondisi Repositori Saat Ini)

QA **wajib** memahami status ini sebelum mengeksekusi test case, agar tidak melaporkan "bug" pada fitur yang memang belum dijadwalkan.

### 2.1 Matriks Status Modul

| Area | Status | Lokasi | Dapat Diuji? |
| --- | --- | --- | --- |
| Fase 1 — Skema DB, migrasi, seeder | ✅ Merge ke `main` | `backend/prisma/` | Ya |
| Fase 2 — Auth multi-kredensial, profil, RBAC | ✅ Merge ke `main` | `backend/src/modules/auth`, `profile` | Ya |
| Fase 3 — Audit Trail Engine, HTTP hardening, reset password admin | ✅ Merge ke `main` | `backend/src/modules/audit-log`, `middlewares/` | Ya |
| Fase 4 — Master data (users, courses, classes) | ✅ Merge ke `main` | `backend/src/modules/{users,courses,classes}` | Ya |
| Fase 5 — Direct enrollment, dasbor kontekstual, `/api/classes` | ⚠️ **Belum merge** (branch `origin/feat/backend-fase-5-direct-enrollment-dashboard`) | `backend/src/modules/{enrollments,dashboard}`, `classes/user-classes.*` | Ya, **khusus di branch tersebut** |
| Frontend SPA — Setup Vite, Dasbor Mahasiswa, Dasbor Dosen, Forgot Password | ⚠️ Parsial (merge ke `main`, banyak data masih dummy) | `frontend/src/` | Ya, dengan catatan §2.3 |
| App Shell Global frontend | ⚠️ **Belum merge** (branch `origin/feat/frontend-app-shell-global`) | `frontend/src/components/AppShell.jsx` dkk | Terbatas |
| **MVP 2** — Ruang Kelas 16 Pertemuan, Materi, Presensi Digital | ❌ **Belum diimplementasikan** (baru rencana) | `IMPLEMENTATION_PLAN_MVP2_BACKEND.md` | **Tidak** — jangan dilaporkan sebagai bug |
| **MVP 3** — Tugas, Submission, Penilaian 0–100 | ❌ Belum ada | — | Tidak |
| **MVP 4** — Timeline, Kuis, Notifikasi | ❌ Belum ada | — | Tidak |
| **MVP 5** — UTS/UAS gatekeeping ≥70%, rekap nilai | ❌ Belum ada | — | Tidak |

### 2.2 Konsekuensi untuk Test Case SRS Bab 26

| TC SRS | Kemampuan Uji Saat Ini |
| --- | --- |
| TC-001, TC-002 | ✅ Bisa (API login) |
| TC-003, TC-004, TC-005 | ✅ Bisa (API profil & avatar & password) |
| TC-006 (Timeline) | ⛔ Terblokir — modul belum ada (MVP 4) |
| TC-007 (Daftar kelas mahasiswa) | ⚠️ Hanya di branch fase 5 |
| TC-008 (Materi pertemuan) | ⛔ Terblokir — MVP 2 |
| TC-009 s.d. TC-014 (Tugas & Penilaian) | ⛔ Terblokir — MVP 3 |
| TC-015 s.d. TC-017 (Presensi) | ⛔ Terblokir — MVP 2 |
| TC-018 s.d. TC-020 (Gatekeeping UTS/UAS) | ⛔ Terblokir — MVP 5 |
| TC-021 (Enrollment) | ⚠️ Hanya di branch fase 5 |
| TC-022 (Otorisasi 403) | ✅ Bisa |
| TC-023 (Keamanan berkas) | ⚠️ Bisa sebagian (avatar privat); berkas tugas belum ada |
| TC-024 (Audit perubahan skor) | ⛔ Terblokir — MVP 3 (audit mutasi lain tetap bisa diuji) |

**Tindakan QA:** cantumkan kolom **"Blocked by roadmap"** pada laporan, bukan **"Failed"**.

### 2.3 Catatan Penting Frontend (agar tidak salah lapor)

1. **Belum ada halaman login.** `frontend/src/App.jsx` me-render dasbor berdasarkan query `?role=` / path `/dosen`. Ini *role switcher UI*, **bukan autentikasi nyata**.
2. **`ForgotPassword.jsx` masih simulasi.** Tidak memanggil API (lihat komentar `TODO` di `frontend/src/features/auth/ForgotPassword.jsx`). Uji sebagai *UI behavior*, jangan uji sebagai integrasi backend.
3. **`frontend/src/services/api.ts` memanggil endpoint yang belum ada di backend** (`/api/dosen/classes`, `/api/dosen/dashboard/metrics`, `/api/dosen/grading/pending`, `/api/dosen/classes/:id/attendance`). Akibatnya Dasbor Dosen jatuh ke data fallback. Ini **temuan yang sah** (kontrak API tidak sinkron) — laporkan, jangan diperbaiki QA.
4. **Stack aktual ≠ rencana.** `IMPLEMENTATION_PLAN_MVP1_FRONTEND.md` merencanakan React+TypeScript+Zustand+TanStack Query+React Router; realitanya `package.json` baru memuat `react`, `react-dom`, `axios`, `vite`, `tailwindcss`. Uji **apa yang ada**, dan catat gap sebagai *technical debt*, bukan bug fungsional.

### 2.4 Catatan Inkonsistensi Dokumentasi (kandidat temuan)

| # | Observasi | Bukti |
| --- | --- | --- |
| D-01 | `README.md` menyatakan server berjalan di `http://localhost:3000`, padahal `.env.example` memakai `PORT=5000` dan proxy Vite menargetkan `5000` | `README.md` §Cara Menjalankan · `backend/.env.example` · `frontend/vite.config.js` |
| D-02 | `README.md` §Dokumen Referensi belum mencantumkan `COLLABORATION_GUIDE.md`, `QA_TESTING_GUIDE.md`, dan `TESTING_GUIDE` terkait QA | `README.md` §Dokumen Referensi (baris 135–142) |
| D-03 | Dua handler `GET /health` terdaftar di `app.js` (handler kedua, yang memakai `publicApiLimiter`, tidak pernah tercapai) | `backend/src/app.js` |
| D-04 | `audit-log.service.js` memakai `require('fs')` di dalam modul ESM (`"type": "module"`) pada jalur *fallback* — berpotensi `ReferenceError` saat DB audit gagal | `backend/src/modules/audit-log/audit-log.service.js` baris ~134 |

> D-01 s.d. D-04 wajib **diverifikasi ulang** sebelum masuk daftar bug; sertakan langkah reproduksi.

---

## 3. Persiapan Lingkungan Pengujian

### 3.1 Prasyarat

- Node.js **v20+ LTS**
- PostgreSQL **v16+** (atau *embedded postgres* bawaan proyek)
- Browser: Chrome/Edge/Firefox versi terbaru
- Tools: `curl`/Postman/Thunder Client, Prisma Studio (read-only), Git

### 3.2 Langkah Setup (jalankan berurutan)

```bash
# 1. Ambil kondisi terbaru
git checkout main
git pull origin main

# 2. Backend
cd backend
npm install
cp .env.example .env          # sesuaikan DATABASE_URL
npx prisma migrate dev        # menyiapkan skema
npm run db:seed               # akun & master data uji
```

**Opsi tanpa instalasi PostgreSQL** (disarankan untuk QA lokal):

```bash
cd backend
node scripts/run-pg.js        # embedded postgres di port 5433
# lalu set: DATABASE_URL="postgresql://postgres:password@localhost:5433/rpl_lms?schema=public"
```

```bash
# 3. Jalankan backend (port sesuai .env, default 5000)
npm run dev

# 4. Jalankan frontend (port 5173, proxy /api → 5000)
cd ../frontend
npm install
npm run dev
```

### 3.3 Akun Uji (hasil seeder)

Password seluruh akun: `password123`

| Role | Identifier | Alternatif |
| --- | --- | --- |
| Admin | `admin` | `admin@upgris.ac.id` |
| Dosen | `198501152010121002` (NIDN) | `budi.santoso@upgris.ac.id` |
| Dosen | `199003202015042001` | `siti.aminah@upgris.ac.id` |
| Dosen | `197805102003122001` | `hadi.wijaya@upgris.ac.id` |
| Mahasiswa | `2024001001` … `2024001010` (NIM) | `<nim>@mhs.upgris.ac.id` |

Master: 5 mata kuliah (`TIF101`–`TIF105`), 2 kelas (`TI-A`, `SI-B`), tahun akademik `2026/2027` semester `ganjil`.

### 3.4 Aturan Data Uji

1. **Selalu** buat data uji dengan prefix unik: `QA-<tanggal>-<nomor>` (mis. `QA-2810-01`) agar mudah ditelusuri & dibersihkan.
2. Jangan menghapus data seeder. Jika perlu membersihkan, lakukan **melalui API** yang tersedia.
3. Untuk uji rate limit, gunakan header `X-Enforce-Rate-Limit: 1` (dipakai test suite untuk memaksa limiter aktif saat `NODE_ENV=test`).
4. Simpan semua *evidence* di folder lokal (bukan di repo): `qa-evidence/<tanggal>/<TC-ID>/`.

### 3.5 Smoke Test Wajib (5 menit, sebelum semua sesi)

| # | Langkah | Ekspektasi |
| --- | --- | --- |
| S-01 | `GET /health` | `200` + status healthy |
| S-02 | `GET /api` | `200` + daftar endpoint |
| S-03 | `POST /api/auth/login` (admin) | `200` + `accessToken`, `refreshToken` |
| S-04 | `GET /api/admin/users` dengan token admin | `200` + `data[]` + `meta` |
| S-05 | `npm test` di `backend/` | seluruh test **PASS** |
| S-06 | Buka `http://localhost:5173` | Dasbor Mahasiswa tampil tanpa *console error* fatal |

Jika salah satu gagal → **hentikan sesi**, eskalasi sebagai *blocker*.

---

## 4. Strategi & Prioritas Pengujian

### 4.1 Level Pengujian

| Level | Metode | Penanggung Jawab |
| --- | --- | --- |
| **Unit/Integration (otomatis)** | `npm test` (Node.js native test runner) | QA menjalankan, developer memelihara |
| **API Functional** | Manual + koleksi Postman/`curl` | QA |
| **UI Functional** | Manual di browser | QA |
| **Security dasar** | Header, CORS, rate limit, RBAC, path traversal | QA |
| **Regresi** | Test suite + smoke + test case prioritas P0/P1 | QA |
| **Review statis berbantuan AI** | AI Agent (read-only) | QA memverifikasi temuan |

### 4.2 Skala Prioritas

| Prioritas | Definisi | Contoh |
| --- | --- | --- |
| **P0** | Blocker — tidak bisa login / data rusak / kebocoran akses | Login gagal total, mahasiswa bisa akses `/api/admin/*` |
| **P1** | Kritis — fungsi utama terganggu, ada workaround sulit | Refresh token tidak berfungsi, audit tidak tercatat |
| **P2** | Mayor — fungsi sekunder / UX terganggu | Filter pencarian salah hasil |
| **P3** | Minor — kosmetik, teks, konsistensi | Pesan error kurang jelas |

### 4.3 Skala Severity Defect

| Severity | Kriteria | SLA Perbaikan |
| --- | --- | --- |
| **S1 Critical** | Kehilangan data, kebocoran otorisasi, server down | < 1 hari |
| **S2 High** | Fitur utama gagal, tanpa workaround | < 3 hari |
| **S3 Medium** | Fitur berjalan dengan workaround / sebagian | Sprint berjalan |
| **S4 Low** | Kosmetik, dokumentasi, saran | Backlog |

### 4.4 Siklus Kerja QA per Pull Request

```text
1. Developer membuka PR + menulis "Cara menguji"
2. QA membaca diff (git diff origin/main...<branch>)  ← read-only
3. QA menjalankan smoke + test case terdampak
4. QA menjalankan AI Agent review (Prompt P1–P10 di Bab 9)
5. QA menulis komentar review: Approve / Request changes
6. Jika Request changes → developer memperbaiki → QA retest
7. QA menandai TC terkait "Verified" di traceability
```

---

## 5. Test Case Manual — Autentikasi & Sesi (Fase 2)

**Base URL:** `http://localhost:5000`
**Format respons standar:** `{ "success": bool, "message": string, "data": ..., "meta"?: ... }`

### 5.1 Login Multi-Kredensial

| TC ID | Judul | Prasyarat | Langkah | Ekspektasi |
| --- | --- | --- | --- | --- |
| **AUTH-01** | Login dengan username admin | Seeder dijalankan | `POST /api/auth/login` body `{"identifier":"admin","password":"password123"}` | `200`; `success:true`; `data.accessToken` & `data.refreshToken` string; `data.user.role = "admin"` |
| **AUTH-02** | Login dengan email | — | Ganti `identifier` → `admin@upgris.ac.id` | `200`, sama seperti AUTH-01 |
| **AUTH-03** | Login dengan NIDN dosen | — | `identifier: "198501152010121002"` | `200`; `data.user.dosen.nidn` terisi |
| **AUTH-04** | Login dengan NIP dosen | — | Gunakan nilai `nip` dosen (sama dengan NIDN pada seed) | `200`; `data.user.dosen` terisi |
| **AUTH-05** | Login dengan NIM mahasiswa | — | `identifier: "2024001001"` | `200`; `data.user.mahasiswa.nim = "2024001001"` |
| **AUTH-06** | Login memakai field `username` (bukan `identifier`) | — | body `{"username":"admin","password":"password123"}` | `200` (skema me-*transform* `username` → `identifier`) |
| **AUTH-07** | Login memakai field `email` | — | body `{"email":"admin@upgris.ac.id","password":"password123"}` | `200` |
| **AUTH-08** | Password salah | — | `identifier:"admin"`, `password:"salah123"` | `401`; pesan menyebut kredensial tidak valid; **tidak** membocorkan apakah user ada |
| **AUTH-09** | Identifier tidak dikenal | — | `identifier:"tidakada999"` | `401` (pesan setara AUTH-08) |
| **AUTH-10** | Body kosong | — | `POST /api/auth/login` body `{}` | `400`; `errors[]` memuat field `identifier` dan/atau `password` |
| **AUTH-11** | Password kosong | — | `{"identifier":"admin","password":""}` | `400`; pesan "Password wajib diisi" |
| **AUTH-12** | Login akun INACTIVE | Ubah status salah satu akun uji jadi `INACTIVE` (lewat admin) | Login akun tersebut | `403`; pesan menyebut status akun |
| **AUTH-13** | Login akun SUSPENDED | Idem dengan `SUSPENDED` | Login | `403` |
| **AUTH-14** | `last_login_at` terisi | AUTH-01 berhasil | Cek detail user via `GET /api/admin/users/:id` | `last_login_at` bukan `null` dan ≥ waktu login |
| **AUTH-15** | Audit LOGIN tercatat | AUTH-01 berhasil | `GET /api/admin/audit-logs?action=LOGIN` (token admin) | Ada entri `action: "LOGIN"`, `entity: "users"`, `user_id` sesuai |

### 5.2 Refresh Token & Logout

| TC ID | Judul | Langkah | Ekspektasi |
| --- | --- | --- | --- |
| **SESS-01** | Refresh valid | `POST /api/auth/refresh` body `{"refreshToken":"<dari login>"}` | `200`; `data.accessToken` baru & dapat dipakai |
| **SESS-02** | Refresh tanpa token | body `{}` | `400`; pesan "Refresh token wajib disertakan" |
| **SESS-03** | Refresh token palsu | `refreshToken:"abc.def.ghi"` | `401` |
| **SESS-04** | Refresh token sudah dipakai logout | Login → logout → refresh dengan token sama | `401` (token telah dicabut) |
| **SESS-05** | Logout mencabut token | Login → `POST /api/auth/logout` dengan `Authorization: Bearer <access>` + body `{"refreshToken":"<rt>"}` | `200`; refresh berikutnya `401` |
| **SESS-06** | Logout tanpa body token | `POST /api/auth/logout` tanpa body | `200` (tidak error) |
| **SESS-07** | Access token kedaluwarsa | Tunggu > `JWT_ACCESS_EXPIRES_IN` (default 15m) lalu pakai token | `401`; pesan "Sesi kedaluwarsa… Silakan lakukan refresh token" |
| **SESS-08** | Token dengan format salah | `Authorization: "Token abc"` (bukan `Bearer`) | `401`; pesan menyebut format Bearer |
| **SESS-09** | Akun dinonaktifkan saat sesi aktif | Login → admin set `INACTIVE` → pakai access token lama | `403`; pesan status akun |

### 5.3 Lupa & Ganti Kata Sandi

| TC ID | Judul | Langkah | Ekspektasi |
| --- | --- | --- | --- |
| **PWD-01** | Forgot password identifier valid | `POST /api/auth/forgot-password` `{"identifier":"2024001001"}` | `200`; pesan generik "Jika akun terdaftar…" |
| **PWD-02** | Forgot password identifier **tidak** ada | `{"identifier":"hantu123"}` | `200`; **pesan identik** PWD-01 (anti user enumeration) |
| **PWD-03** | Forgot password body kosong | `{}` | `400`; pesan wajib isi email/identifier |
| **PWD-04** | Audit permintaan reset | PWD-01 → cek audit log | Entri `FORGOT_PASSWORD_REQUEST` |
| **PWD-05** | Ganti password (sukses) | Login mahasiswa → `PUT /api/auth/change-password` `{"oldPassword":"password123","newPassword":"Baru123!x","confirmPassword":"Baru123!x"}` | `200`; login lama gagal, login baru berhasil |
| **PWD-06** | Password lama salah | `oldPassword:"salah"` | `400`; pesan "Kata sandi lama tidak sesuai" |
| **PWD-07** | Password baru < 8 karakter | `newPassword:"Ab1!"` | `400`; pesan minimal 8 karakter |
| **PWD-08** | Konfirmasi tidak cocok | `confirmPassword` berbeda | `400`; pesan konfirmasi tidak cocok |
| **PWD-09** | Password baru = lama | `newPassword:"password123"` | `400`; pesan tidak boleh sama |
| **PWD-10** | Token dicabut setelah ganti password | PWD-05 → pakai refresh token lama | `401` |
| **PWD-11** | Ganti password tanpa login | Tanpa header Authorization | `401` |
| **PWD-12** | Snapshot field snake_case | Kirim `{"old_password","new_password","confirm_password"}` | `200` (skema menerima kedua format) |

> **Penting:** setelah PWD-05, kembalikan password akun uji ke `password123` atau gunakan akun uji khusus agar tidak mengganggu tester lain.

---

## 6. Test Case Manual — RBAC, Profil, Master Data

### 6.1 RBAC & Otorisasi (TC-022)

| TC ID | Judul | Langkah | Ekspektasi |
| --- | --- | --- | --- |
| **RBAC-01** | Tanpa token ke endpoint admin | `GET /api/admin/users` tanpa header | `401` |
| **RBAC-02** | Token mahasiswa ke endpoint admin | Token mahasiswa → `GET /api/admin/users` | `403` |
| **RBAC-03** | Token dosen ke endpoint admin | Token dosen → `GET /api/admin/courses` | `403` |
| **RBAC-04** | Token admin | `GET /api/admin/classes` | `200` |
| **RBAC-05** | Alias audit log | `GET /api/audit-logs` token admin | `200`; `GET` dengan token dosen → `403` |
| **RBAC-06** | Manipulasi role via payload | Mahasiswa kirim `PUT /api/admin/users/:id` `{"role":"admin"}` | `403` (diblokir sebelum service) |
| **RBAC-07** | Endpoint tak terdefinisi | `GET /api/tidak-ada` | `404`; pesan menyebut method & URL |
| **RBAC-08** | Case-insensitive role | Token admin → endpoint admin | `200` (guard menormalkan ke lowercase) |

### 6.2 Profil Mandiri

| TC ID | Judul | Langkah | Ekspektasi |
| --- | --- | --- | --- |
| **PROF-01** | GET profil mahasiswa | Token mahasiswa → `GET /api/profile` | `200`; memuat `username`, `role`, `profile`, `mahasiswa{nim,prodi,angkatan}` |
| **PROF-02** | GET profil dosen | Token dosen → `GET /api/profile` | `200`; memuat `dosen{nidn,nip,gelar_*}` |
| **PROF-03** | Update nama/telepon/bio | `PUT /api/profile` `{"full_name":"Nama QA","phone":"08123","bio":"tes"}` | `200`; nilai berubah pada respons |
| **PROF-04** | Email duplikat | Pakai email milik akun lain | `409`; pesan email sudah digunakan |
| **PROF-05** | Validasi panjang | `full_name` 1 karakter / `bio` 501 karakter | `400`; `errors[]` menunjuk field |
| **PROF-06** | Upload avatar `.png` valid (< 2MB) | `POST /api/profile/avatar` multipart field **`avatar`** | `200`; `profile.avatar_file` terisi |
| **PROF-07** | Upload avatar `.txt` | Field `avatar` file `.txt` | `400`; pesan format tidak didukung |
| **PROF-08** | Upload avatar > 2MB | File PNG 3MB | `400`; pesan maksimal 2MB |
| **PROF-09** | Upload tanpa file | Multipart tanpa field `avatar` | `400`; pesan berkas wajib diunggah |
| **PROF-10** | Stream avatar | `GET /api/profile/avatar` | `200`; `Content-Type` image/*; isi = byte file |
| **PROF-11** | Avatar tanpa upload | Akun tanpa avatar → `GET /api/profile/avatar` | `404` |
| **PROF-12** | Avatar lama dibersihkan | Upload 2x berturut-turut | Hanya 1 baris `files` aktif; file fisik lama hilang dari `backend/storage/private/avatars/` |
| **PROF-13** | Profil orang lain tidak bisa diakses | Coba `GET /api/profile?userId=<id lain>` | `200` data **milik sendiri** (tidak ada parameter untuk target) |
| **PROF-14** | Ganti password via profil | `PUT /api/profile/password` `{"oldPassword","newPassword","confirmPassword"}` | `200`; perilaku sama PWD-05 |
| **PROF-15** | Audit UPDATE_PROFILE | PROF-03 berhasil | Entri `UPDATE_PROFILE` dengan `old_values`/`new_values` |

### 6.3 Manajemen Pengguna (Admin)

| TC ID | Judul | Langkah | Ekspektasi |
| --- | --- | --- | --- |
| **USR-01** | List + paginasi | `GET /api/admin/users?page=1&limit=5` | `200`; `data` ≤ 5; `meta.{page,limit,total,totalPages}` konsisten |
| **USR-02** | Filter role | `?role=mahasiswa` | Semua item `role=mahasiswa` |
| **USR-03** | Filter status | `?status=SUSPENDED` | Semua item `status=SUSPENDED` |
| **USR-04** | Pencarian multi-kolom | `?search=2024001001`; ulangi dengan nama, email, NIDN | Hasil relevan di tiap variasi |
| **USR-05** | Limit invalid | `?limit=0` dan `?limit=101` | `400` (skema membatasi 1–100) |
| **USR-06** | Buat admin baru | `POST /api/admin/users` `{"username":"qa.admin","email":"qa.admin@upgris.ac.id","password":"Rahasia123!","role":"admin","full_name":"QA Admin"}` | `201`; `data.role="admin"`; `profile.full_name` terisi |
| **USR-07** | Buat mahasiswa tanpa NIM | `role:"mahasiswa"` tanpa `nim/prodi/angkatan` | `400`; `errors[]` menunjuk `nim`,`prodi`,`angkatan` |
| **USR-08** | Buat dosen tanpa NIDN & NIP | `role:"dosen"` | `400`; pesan NIDN/NIP wajib |
| **USR-09** | Username/email duplikat | Ulangi USR-06 | `409` |
| **USR-10** | Role tidak dikenal | `role:"superadmin"` | `400` |
| **USR-11** | Username terlalu pendek | `username:"ab"` | `400` (min 3) |
| **USR-12** | Detail user | `GET /api/admin/users/:id` | `200`; memuat `last_login_at`, `profile`, relasi role |
| **USR-13** | ID bukan UUID | `GET /api/admin/users/123` | `400`; pesan format UUID |
| **USR-14** | ID UUID tidak ada | UUID acak | `404` |
| **USR-15** | Update role | `PUT /api/admin/users/:id` `{"role":"dosen"}` | `200`; `data.role="dosen"`; audit `UPDATE_USER` |
| **USR-16** | Update tanpa perubahan | `PUT` body `{}` atau email sama | `400` "Tidak ada data yang perlu diperbarui" |
| **USR-17** | Ubah status | `PATCH /api/admin/users/:id/status` `{"status":"SUSPENDED","reason":"uji"}` | `200`; audit `UPDATE_USER_STATUS` memuat `reason` |
| **USR-18** | Ubah status diri sendiri | Pakai ID admin yang sedang login | `400`; ditolak |
| **USR-19** | Status invalid | `{"status":"BANNED"}` | `400` |
| **USR-20** | Reset password admin | `PUT /api/admin/users/:id/reset-password` `{"newPassword":"Kuat123!x"}` | `200`; login target dengan password baru berhasil |
| **USR-21** | Reset password lemah | `{"newPassword":"password123"}` | `400`; pesan kompleksitas |
| **USR-22** | Reset password diri sendiri | ID = admin login | `400`; diarahkan ke endpoint profil |
| **USR-23** | Token target dicabut | Target login → admin reset → target refresh | `401` |
| **USR-24** | Audit RESET_PASSWORD | USR-20 | Entri `RESET_PASSWORD` dengan `reset_by_admin: true` |
| **USR-25** | Akun nonaktif tidak bisa login | USR-17 (`SUSPENDED`) → login target | `403` |

### 6.4 Master Mata Kuliah

| TC ID | Judul | Langkah | Ekspektasi |
| --- | --- | --- | --- |
| **CRS-01** | Buat MK | `POST /api/admin/courses` `{"code":"qa101","name":"Mata Kuliah QA","credits":3,"description":"uji"}` | `201`; `code` menjadi **`QA101`** (auto uppercase) |
| **CRS-02** | Kode duplikat | Ulangi CRS-01 | `409` (P2002 → pesan konflik) |
| **CRS-03** | SKS di luar 1–6 | `credits:0` dan `credits:7` | `400` |
| **CRS-04** | Nama terlalu pendek | `name:"A"` | `400` |
| **CRS-05** | List + search | `GET /api/admin/courses?search=QA101` | `200`; item ditemukan |
| **CRS-06** | Filter status | `?is_active=true` / `false` | Konsisten dengan field `is_active` |
| **CRS-07** | Update MK | `PUT /api/admin/courses/:id` `{"name":"Nama Baru"}` | `200`; audit `UPDATE_COURSE` dengan old/new |
| **CRS-08** | Update kosong | `PUT` body `{}` | `400` "Minimal satu data…" |
| **CRS-09** | Nonaktifkan MK | `DELETE /api/admin/courses/:id` | `200`; `is_active=false`; **baris tidak terhapus** dari DB |
| **CRS-10** | Nonaktifkan dua kali | Ulangi CRS-09 | `409` "Mata kuliah sudah tidak aktif" |
| **CRS-11** | MK nonaktif tidak bisa dipakai buka kelas | CRS-09 → `POST /api/admin/classes` dengan `course_id` tsb | `400` "tidak ditemukan atau sudah tidak aktif" |
| **CRS-12** | ID bukan UUID | `GET /api/admin/courses/abc` | `400` |

### 6.5 Pembukaan Kelas

| TC ID | Judul | Langkah | Ekspektasi |
| --- | --- | --- | --- |
| **CLS-01** | Buat kelas valid | `POST /api/admin/classes` `{"course_id":"<uuid>","lecturer_id":"<uuid dosen>","academic_year":"2026/2027","semester":"ganjil","name":"QA-A","capacity":30}` | `201`; relasi `course`, `lecturer`, `_count.enrollments` terisi |
| **CLS-02** | Format tahun akademik salah | `"2026-2027"` | `400`; pesan format `YYYY/YYYY` |
| **CLS-03** | Semester invalid | `"semester_pendek"` | `400` |
| **CLS-04** | Kapasitas 0 / negatif | `capacity:0` | `400` |
| **CLS-05** | Dosen tidak aktif | Set dosen `INACTIVE` → buat kelas | `400` "Dosen pengampu tidak berstatus aktif" |
| **CLS-06** | lecturer_id bukan dosen | Kirim UUID user mahasiswa | `400` |
| **CLS-07** | Kombinasi duplikat | Ulangi CLS-01 | `409` |
| **CLS-08** | Update kapasitas ≥ enrollment | `PUT` `{"capacity":20}` | `200` |
| **CLS-09** | Kapasitas < jumlah enrollment | Enroll 3 mahasiswa → `capacity:2` | `409`; pesan menyebut jumlah terdaftar |
| **CLS-10** | Hapus kelas kosong | `DELETE /api/admin/classes/:id` (tanpa enrollment) | `200`; hilang dari list |
| **CLS-11** | Hapus kelas ber-enrollment | Kelas dengan ≥1 enrollment | `409`; pesan tidak dapat dihapus |
| **CLS-12** | Filter akademik | `?academic_year=2026/2027&semester=ganjil` | Hasil sesuai |
| **CLS-13** | Audit mutasi kelas | CLS-01, CLS-08, CLS-10 | Entri `CREATE_CLASS` / `UPDATE_CLASS` / `DELETE_CLASS` |

### 6.6 Jejak Audit

| TC ID | Judul | Langkah | Ekspektasi |
| --- | --- | --- | --- |
| **AUD-01** | List default | `GET /api/admin/audit-logs` | `200`; urut `created_at` desc; `meta` memuat `hasNextPage`/`hasPrevPage` |
| **AUD-02** | Filter action | `?action=LOGIN` | Semua item `action="LOGIN"` |
| **AUD-03** | Filter entity | `?entity=users` | `entity` cocok (case-insensitive contains) |
| **AUD-04** | Filter userId | `?userId=<uuid>` | Hanya log aktor tsb |
| **AUD-05** | Filter tanggal | `?startDate=2026-10-01&endDate=2026-10-31` | Semua `created_at` dalam rentang; `endDate` inklusif sampai 23:59:59.999 |
| **AUD-06** | Tanggal invalid | `?startDate=bukan-tanggal` | `400` |
| **AUD-07** | Paginasi invalid | `?page=0`, `?limit=101` | `400` |
| **AUD-08** | Sort tidak dikenal | `?sortBy=hacker` | `400` |
| **AUD-09** | Sort valid | `?sortBy=action&sortOrder=asc` | Urutan membuktikan parameter dipakai |
| **AUD-10** | Detail log | `GET /api/admin/audit-logs/:id` | `200`; memuat `old_values`, `new_values`, `user.profile.full_name` |
| **AUD-11** | Detail ID invalid | `.../123` | `400` |
| **AUD-12** | Detail ID tidak ada | UUID acak | `404` |
| **AUD-13** | Search global | `?search=admin` | Cocok pada action/entity/username/email |
| **AUD-14** | Immutability (rantai audit) | Bandingkan jumlah log sebelum & sesudah operasi CRUD | Jumlah bertambah; tidak ada endpoint mutasi/hapus log |
| **AUD-15** | Audit login & logout lengkap | Login → logout | Dua entri: `LOGIN` lalu `LOGOUT` |

### 6.7 Keamanan HTTP & Rate Limit

| TC ID | Judul | Langkah | Ekspektasi |
| --- | --- | --- | --- |
| **SEC-01** | Header Helmet | `curl -I http://localhost:5000/api` | Ada `X-Content-Type-Options: nosniff`, `X-DNS-Prefetch-Control`, `Cross-Origin-Resource-Policy: cross-origin` |
| **SEC-02** | CORS origin diizinkan | Request dengan `Origin: http://localhost:5173` | Tidak diblokir; header `Access-Control-Allow-Origin` sesuai |
| **SEC-03** | CORS origin asing | `Origin: http://evil.example` | `403` "Akses diblokir oleh kebijakan CORS" |
| **SEC-04** | Rate limit login | 21 request login beruntun dengan `X-Enforce-Rate-Limit: 1` | Setelah batas, `429` dengan pesan percobaan autentikasi |
| **SEC-05** | Rate limit general | > 500 request/15 menit (gunakan `X-Enforce-Rate-Limit: 1`) | `429` |
| **SEC-06** | Rate limit per IP+identifier | Login gagal untuk identifier A tidak memblokir identifier B | Tidak saling memengaruhi |
| **SEC-07** | Body oversized | Kirim JSON > 10mb | `413` (limit express.json) |
| **SEC-08** | Path traversal nama file avatar | Upload file bernama `../../evil.png` | Tersimpan dengan nama UUID di direktori avatar; path asli tidak dipakai |
| **SEC-09** | Akses langsung storage | `GET http://localhost:5000/storage/private/avatars/<file>` | `404` — storage privat **tidak** di-serve statis |
| **SEC-10** | Respons error tidak membocorkan stack | Paksa error 500 di `NODE_ENV=production` | `errors` tidak memuat stack |
| **SEC-11** | Password tidak pernah dikembalikan | Semua respons user/profil | Tidak ada field `password_hash` |
| **SEC-12** | SQL Injection pada search | `?search=' OR 1=1 --` | `200`; tidak mengubah jumlah hasil secara anomali (Prisma parameterized) |
| **SEC-13** | XSS pada nama | Buat user `full_name:"<script>alert(1)</script>"` | Tersimpan sebagai teks; frontend harus meng-escape saat render |

### 6.8 Pengujian Otomatis (Regression Gate)

| TC ID | Judul | Langkah | Ekspektasi |
| --- | --- | --- | --- |
| **REG-01** | Jalankan seluruh suite | `cd backend && npm test` | Semua test **pass**, exit code `0` |
| **REG-02** | Verifikasi jumlah test | Bandingkan jumlah `pass` dengan klaim README ("70 test") | Catat selisih sebagai temuan dokumentasi jika berbeda |
| **REG-03** | Suite paralel | `npm test` dari kondisi DB bersih hasil `db:seed` | Tidak ada kegagalan karena urutan/bocor data |
| **REG-04** | Idempotensi seeder | `npm run db:seed` dua kali | Tidak ada error duplikat (seeder memakai `upsert`) |
| **REG-05** | Suite tidak meninggalkan residu | Setelah `npm test`, cek prefix `TST`/`QA` di DB | Dibersihkan oleh hook `after()` test |
| **REG-06** | `NODE_ENV=test` menonaktifkan rate limit | Jalankan suite tanpa `X-Enforce-Rate-Limit` | Tidak ada `429` yang menggagalkan test |

### 6.9 Frontend (UI Manual)

| TC ID | Judul | Langkah | Ekspektasi |
| --- | --- | --- | --- |
| **UI-01** | Dasbor mahasiswa default | Buka `http://localhost:5173/` | Tampil Header, Sidebar, Breadcrumb, Greeting, SummaryCards, CourseCards, Announcement, widget tugas & presensi |
| **UI-02** | Toggle sidebar | Klik tombol menu di Header | Sidebar terbuka/tertutup; konten bergeser (`pl-64` ↔ `pl-0`) tanpa tumpang tindih |
| **UI-03** | Dasbor dosen | Buka `/?role=dosen` atau `/dosen` | Dasbor Khusus Dosen tampil (sidebar dosen, kartu metrik, daftar kelas) |
| **UI-04** | Pindah role | Klik `Mhs` pada role switcher dosen | Kembali ke dasbor mahasiswa; URL memuat `?role=mahasiswa` |
| **UI-05** | Forgot password | Buka `/forgot-password` | Form muncul; email kosong → pesan validasi lokal |
| **UI-06** | Validasi email forgot password | Isi `abc` lalu submit | Pesan "Format email tidak valid…" (validasi **client-side**) |
| **UI-07** | Sukses forgot password | Isi email valid → submit | Muncul panel sukses + countdown kirim ulang 60 detik |
| **UI-08** | Cooldown kirim ulang | Klik "Kirim ulang" saat countdown aktif | Tombol disabled sampai 0 |
| **UI-09** | Deep link langsung | Refresh browser di `/forgot-password` | Halaman tetap tampil (routing berbasis pathname, bukan router library) |
| **UI-10** | Responsif 375px | DevTools lebar 375px | Tidak ada scroll horizontal; sidebar/tabel dapat dipakai |
| **UI-11** | Responsif 768px & 1440px | Idem | Layout grid berubah sesuai breakpoint, tanpa elemen terpotong |
| **UI-12** | Console bersih | Buka DevTools → Console | Tidak ada error fatal; catat *warning* (kunci React list, dsb.) |
| **UI-13** | Kontras & fokus keyboard | Tab melalui form | Elemen fokus terlihat; label/`aria-*` ada pada input kritis |
| **UI-14** | Integrasi API dasbor dosen | Buka Network saat dasbor dosen | Request `/api/dosen/*` **gagal 404** dan UI jatuh ke data fallback → catat sebagai temuan D-05 |
| **UI-15** | Build produksi | `cd frontend && npm run build` | Build sukses tanpa error; `npm run preview` dapat diakses |

### 6.10 Branch Fase 5 (Opsional — Hanya Jika Branch Diuji)

Checkout **terpisah** (jangan campur dengan `main`):

```bash
git fetch origin
git checkout origin/feat/backend-fase-5-direct-enrollment-dashboard
# atau buat worktree terpisah agar branch main tidak terganggu
```

| TC ID | Judul | Endpoint | Ekspektasi |
| --- | --- | --- | --- |
| **ENR-01** | Enroll satu/selisih mahasiswa | `POST /api/admin/enrollments` | `201`; enrollment tercatat; audit `ENROLL_STUDENT` tercipta |
| **ENR-02** | Enroll duplikat | Ulangi ENR-01 | `409` (unique `[class_id, student_id]`) |
| **ENR-03** | Enroll melebihi kapasitas | Enroll > `capacity` | `409`; pesan kapasitas penuh |
| **ENR-04** | Unenroll | `DELETE /api/admin/enrollments/:id` | `200`; hilang dari daftar kelas |
| **ENR-05** | Daftar enrollment kelas | `GET /api/admin/enrollments/classes/:classId` | `200`; lengkap dengan identitas mahasiswa |
| **ENR-06** | Mahasiswa tersedia | `GET /api/admin/enrollments/classes/:classId/available-students` | Tidak memuat yang sudah enrolled |
| **ENR-07** | RBAC enrollment | Token dosen/mahasiswa → endpoint enrollment | `403` |
| **ENR-08** | Kelas kontekstual mahasiswa | `GET /api/classes` token mahasiswa | Hanya kelas yang dienroll |
| **ENR-09** | Kelas kontekstual dosen | `GET /api/classes` token dosen | Hanya kelas yang diampu |
| **ENR-10** | Detail kelas non-peserta | `GET /api/classes/:id` kelas lain | `403` |
| **ENR-11** | Dasbor kontekstual | `GET /api/dashboard` per role | Metrik sesuai role (admin/dosen/mahasiswa) |
| **ENR-12** | Test fase 5 | `npm test` di branch | `phase5.test.js` pass |

---

## 7. Pengujian MVP 2 — Placeholder Terkontrol

MVP 2 (**Ruang Kelas 16 Pertemuan, Materi, Presensi Digital**) **belum diimplementasikan** di `main`.
Dokumen ini menyediakan kerangka agar QA siap saat implementasi masuk.

| Prasyarat Implementasi | Kriteria Lulus (dari `IMPLEMENTATION_PLAN_MVP2_BACKEND.md` Bab 7) |
| --- | --- |
| Model `Meeting`, `Material`, `AttendanceSession`, `AttendanceRecord` ada di `schema.prisma` | Kelas baru otomatis punya 16 pertemuan; P-8 `UTS`, P-16 `UAS` |
| Endpoint `/api/classes/:id/meetings` | Mahasiswa *enrolled*, dosen pengampu, admin bisa akses |
| Endpoint upload/unduh materi | Mahasiswa luar kelas → **403**; berkas disajikan via streaming, bukan URL publik |
| Endpoint buka/tutup sesi presensi | Check-in hanya saat `OPEN`; `CLOSED` → `400` |
| Endpoint check-in | Duplikasi check-in ditolak (unique `[session_id, student_id]`) |
| Endpoint rekap kehadiran | Persentase = `HADIR / pertemuan berlangsung × 100%`, akurat |
| Audit | Mutasi materi & perubahan status sesi tercatat |

> **Saat MVP 2 masuk `main`**, tambahkan test case `MTG-*`, `MAT-*`, `ATT-*` dengan pola Bab 5–6 (ID, prasyarat, langkah, ekspektasi, bukti) dan tambahkan ke traceability.

---

## 8. Checklist Regresi (Jalankan Setiap PR)

- [ ] Smoke test S-01 s.d. S-06 lulus
- [ ] `npm test` backend lulus penuh
- [ ] Login 3 role berhasil
- [ ] RBAC: mahasiswa/dosen ditolak di endpoint admin (RBAC-01 s.d. RBAC-04)
- [ ] CRUD satu entitas per modul terdampak + audit tercatat
- [ ] Tidak ada kebocoran `password_hash` di respons
- [ ] Header keamanan & CORS masih sesuai (SEC-01 s.d. SEC-03)
- [ ] Frontend build sukses (UI-15)
- [ ] Tidak ada regresi pada test case P0/P1 yang pernah gagal

---

## 9. Pengujian & Review Berbantuan AI Agent

### 9.1 Tujuan

Mempercepat *review* statis dan analisis cakupan, **bukan** menggantikan eksekusi manual. AI Agent berperan sebagai **reviewer kedua yang hanya membaca** (read-only), sehingga tidak berisiko merusak kode.

### 9.2 Guardrail Wajib (Tempel di Setiap Prompt)

> Blok di bawah ini **WAJIB** disertakan pada setiap prompt. Tanpa blok ini, prompt **tidak boleh** dijalankan.

```text
=== KONTRAK BATASAN (WAJIB DIPATUHI, TIDAK BOLEH DILANGGAR) ===
Anda berperan sebagai QA Reviewer independen. Anda HANYA boleh MENGUJI dan MEMBACA.

DILARANG KERAS:
1. Mengubah, membuat, menghapus, memindahkan, atau memformat ulang file apa pun di repositori
   (termasuk file kode, dokumentasi, konfigurasi, .env, dan file test).
2. Menggunakan tool Edit, Write, NotebookEdit, atau perintah shell yang menulis ke disk
   (mis. `> file`, `>> file`, `sed -i`, `tee`, `rm`, `mv`, `cp` untuk menimpa).
3. Menjalankan git yang mengubah state: add, commit, push, pull, merge, rebase, reset,
   checkout, switch, stash, cherry-pick, branch -d/-D, tag, clean.
   Yang BOLEH: git status, git log, git diff, git show, git branch --list, git blame.
4. Menjalankan `prisma migrate`, `prisma db push`, `prisma db seed`, `prisma migrate reset`,
   atau SQL yang menulis (INSERT/UPDATE/DELETE/ALTER/DROP/TRUNCATE/GRANT).
5. Menjalankan `npm install`, `npm uninstall`, `npm update`, atau menambah dependency.
6. Memperbaiki bug yang Anda temukan. Temuan cukup DILAPORKAN, bukan diperbaiki.
7. Menjalankan request yang mengubah data pada database staging/produksi.
   Request mutasi hanya boleh ke database lokal/uji hasil seeder.
8. Menyimpulkan tanpa bukti. Setiap temuan wajib menyertakan bukti:
   path file + nomor baris, potongan kode, atau request/response aktual.

YANG BOLEH:
- Membaca seluruh file (Read/Grep/Glob).
- Menjalankan pengujian read-only: `npm test`, `npm run dev`, `git diff`, HTTP GET.
- Menjalankan HTTP POST/PUT/PATCH/DELETE HANYA ke http://localhost pada database uji lokal.
- Menulis laporan di jawaban chat (bukan ke file repositori).

FORMAT KELUARAN (wajib):
Tabel dengan kolom: ID | Severity | Lokasi (file:line) | Ringkasan | Bukti | Dampak | Rekomendasi
Setelah tabel: bagian "Asumsi & Keterbatasan" dan "Yang Tidak Dapat Diuji".

Jika Anda tidak dapat memenuhi salah satu batasan di atas, BERHENTI dan laporkan
batasan yang menghalangi, jangan mencari jalan pintas.
=== AKHIR KONTRAK ===
```

### 9.3 Prompt 0 — Kontrak Perilaku Sesi (kirim pertama)

```text
Kamu adalah QA Reviewer untuk repositori SPADA LMS (Express + Prisma + React).
Tugasmu: MEMBACA dan MENGUJI saja. Kamu tidak punya hak mengubah kode.

[Tempel blok KONTRAK BATASAN di sini]

Aturan tambahan:
- Bahasa laporan: Indonesia.
- Sebelum menganalisis, sebutkan file/folder yang akan kamu baca (rencana 3-5 langkah).
- Setiap temuan harus punya bukti `file:line` atau output perintah.
- Bedakan dengan jelas: (a) BUG, (b) RISIKO/ARAHAN, (c) DOKUMENTASI TIDAK SINKRON,
  (d) DI LUAR CAKUPAN MVP.
- Jangan menyarankan untuk mengubah kode tanpa diminta; rekomendasi berupa deskripsi.

Konfirmasi bahwa kamu memahami batasan ini, lalu tunggu instruksi berikutnya.
```

### 9.4 Prompt 1 — Review Autentikasi & Sesi

```text
[Tempel KONTRAK BATASAN]

Target review (baca saja):
- backend/src/modules/auth/auth.service.js
- backend/src/modules/auth/auth.validation.js
- backend/src/modules/auth/auth.routes.js
- backend/src/middlewares/auth.middleware.js
- backend/src/utils/token.js
- backend/src/utils/password.js

Periksa dan laporkan:
1. Apakah pesan error login membocorkan keberadaan akun (user enumeration)?
2. Apakah refresh token disimpan sebagai hash, dan apakah rotasi/revocation konsisten
   (login, refresh, logout, ganti password, admin reset, akun dinonaktifkan)?
3. Apakah ada jalur di mana access token tetap valid setelah akun INACTIVE/SUSPENDED?
4. Apakah validasi Zod dapat dilewati (mis. identifier bukan string, password bukan string,
   body berisi ekstra field)?
5. Apakah `forgot-password` selalu memberi respons seragam untuk akun ada/tidak ada?
6. Apakah ada race condition pada pembuatan refresh token atau pada perubahan password?

Bukti wajib `file:line`. Jangan mengubah file apa pun.
```

### 9.5 Prompt 2 — Review RBAC & Otorisasi

```text
[Tempel KONTRAK BATASAN]

Target (baca saja):
- backend/src/middlewares/rbac.middleware.js
- backend/src/app.js
- backend/src/modules/**/*.routes.js

Periksa:
1. Daftar seluruh route beserta guard-nya. Tandai route yang TIDAK memakai
   authenticateToken atau requireRole padahal seharusnya.
2. Apakah `router.use(...)` urutannya benar sehingga semua sub-route terlindungi?
3. Apakah ada route yang dapat diakses dengan role lebih rendah karena normalisasi
   string role (lowercase) atau karena perbedaan penamaan enum?
4. Apakah alias route (mis. `/api/audit-logs`) memiliki guard yang setara?
5. Apakah otorisasi berbasis kepemilikan data (mis. user hanya boleh mengubah profil
   sendiri) ditegakkan di server, bukan hanya disembunyikan di UI?

Keluarkan matriks: Method | Path | Guard Auth | Guard Role | Status (OK/RISIKO).
Jangan mengubah file apa pun.
```

### 9.6 Prompt 3 — Review Audit Trail

```text
[Tempel KONTRAK BATASAN]

Target (baca saja):
- backend/src/modules/audit-log/*.js
- backend/src/middlewares/audit.middleware.js
- pemanggilan AuditLogService di seluruh backend/src/modules/

Periksa:
1. Setiap mutasi krusial (create/update/delete user, course, class, profil, avatar,
   reset password, login, logout) — apakah tercatat? Buat tabel lengkap.
2. Apakah `old_values` dan `new_values` benar-benar berisi perubahan, bukan objek kosong?
3. Apakah jalur fallback audit (saat DB gagal) dapat benar-benar berjalan?
   Periksa penggunaan modul/`require` di file ESM (`"type": "module"`).
4. Apakah ada risiko audit log terpotong (`_truncated`) dan apakah itu didokumentasikan?
5. Apakah data sensitif (password, token, hash) ikut tercatat di audit? (harus TIDAK)
6. Apakah pencatatan audit berada dalam transaksi yang sama dengan mutasi data?
   Jika tidak, laporkan risiko inkonsistensi.

Jangan mengubah file apa pun.
```

### 9.7 Prompt 4 — Review Validasi & Boundary

```text
[Tempel KONTRAK BATASAN]

Target (baca saja): seluruh backend/src/modules/**/*.validation.js
dan backend/src/middlewares/validate.middleware.js

Untuk setiap skema Zod, laporkan:
1. Field wajib vs opsional — apakah ada field yang bisa `undefined` lalu masuk ke Prisma?
2. Batas min/max — apakah konsisten dengan SRS (SKS 1–6, password ≥ 8, bio ≤ 500,
   kapasitas > 0, tahun akademik YYYY/YYYY)?
3. Apakah `.refine` pada body update memungkinkan body kosong lolos?
4. Apakah tipe coercion (`z.coerce.number`) dapat menerima nilai aneh
   (`""`, `"abc"`, `NaN`, `1e309`)?
5. Apakah error diformat seragam (`field`, `message`) dan tidak membocorkan detail internal?
6. Apakah ada field yang divalidasi di frontend tetapi TIDAK divalidasi di backend?

Sertakan tabel: File | Field | Aturan | Celah yang mungkin. Jangan mengubah file apa pun.
```

### 9.8 Prompt 5 — Review Keamanan Berkas & Storage

```text
[Tempel KONTRAK BATASAN]

Target (baca saja):
- backend/src/middlewares/upload.middleware.js
- backend/src/utils/storage.js
- backend/src/modules/profile/profile.service.js
- backend/src/config/env.js
- .gitignore

Periksa:
1. Apakah validasi file memeriksa ekstensi DAN MIME (NFR-003)?
2. Apakah `file.originalname` dari klien dapat menyebabkan path traversal?
3. Apakah direktori storage benar-benar di luar web root dan tidak di-serve statis?
4. Apakah file lama dihapus saat avatar diganti, dan apakah kegagalan hapus
   meninggalkan orphan file? (laporkan dampaknya)
5. Apakah `.gitignore` menjamin berkas privat tidak ter-commit?
6. Apakah batas ukuran ditegakkan pada dua lapis (multer + validasi service)?
7. Apakah metadata `files.file_path` konsisten dengan lokasi fisik?

Jangan mengubah file apa pun.
```

### 9.9 Prompt 6 — Review Frontend (React)

```text
[Tempel KONTRAK BATASAN]

Target (baca saja):
- frontend/src/App.jsx, main.jsx
- frontend/src/components/*.jsx
- frontend/src/features/**/*.jsx
- frontend/src/services/api.ts
- frontend/src/stores/authStore.ts
- frontend/tailwind.config.js, vite.config.js, package.json

Periksa:
1. Apakah ada pemanggilan API yang menunjuk ke endpoint yang TIDAK ada di backend?
   Bandingkan dengan route di backend/src/app.js dan modules/**/*.routes.js.
2. Apakah seluruh data yang tampil berasal dari API, atau sebagian masih hardcode?
   Tandai komponen mana yang masih dummy.
3. Apakah ada state/derived data yang dapat menyebabkan bug (mis. pembagian nol pada
   persentase, `NaN` pada metrik)?
4. Apakah akses localStorage/token dilakukan tanpa penanganan kegagalan?
5. Apakah ada masalah aksesibilitas dasar: input tanpa label, tombol tanpa aria-label,
   kontras teks di bawah 4.5:1, urutan heading tidak logis?
6. Apakah `state`/`effects` berpotensi memicu loop re-render atau memory leak
   (timer tidak dibersihkan, listener tidak dilepas)?
7. Apakah build produksi akan gagal (import salah path, ekstensi .ts/.tsx vs .js/.jsx,
   file yang tidak diimpor)?

Keluarkan tabel: File | Baris | Jenis (Bug/A11y/Kontrak/Tech-debt) | Temuan | Bukti.
Jangan mengubah file apa pun.
```

### 9.10 Prompt 7 — Review Kesesuaian Dokumen vs Implementasi

```text
[Tempel KONTRAK BATASAN]

Target (baca saja): SRS.md (Bab 21, 22, 26, 29), PRD.md, README.md,
backend/README.md, IMPLEMENTATION_PLAN_MVP1_BACKEND.md, dan kode di backend/src.

Buat tabel kepatuhan:
Requirement (FR/NFR) | Endpoint/Implementasi yang ada | Status (Terpenuhi / Sebagian /
Belum / Menyimpang) | Bukti (file:line) | Catatan

Fokus:
1. Endpoint di SRS Bab 21 — mana yang tidak ada, mana yang path-nya berbeda.
2. Kode status HTTP — apakah sesuai SRS Bab 22 (mis. SRS menyebut 422/413 untuk
   validasi berkas; kode memakai 400 — tandai sebagai penyimpangan spesifikasi).
3. NFR-003/NFR-004/NFR-005 (validasi berkas, ukuran, storage privat).
4. Klaim di README (jumlah test, port server, akun seeder) vs kenyataan di repo.
5. Traceability SRS Bab 29: TC mana yang benar-benar bisa dibuktikan sekarang.

Jangan mengubah dokumen apa pun.
```

### 9.11 Prompt 8 — Analisis Celah Cakupan Pengujian

```text
[Tempel KONTRAK BATASAN]

Target (baca saja): backend/tests/*.js, backend/package.json, seluruh
backend/src/modules/** dan middlewares/.

Laporkan:
1. Daftar test yang ada (fase, jumlah, area yang dicakup).
2. Celah cakupan: area produksi tanpa test sama sekali (mis. upload avatar gagal,
   rate limit per identifier, fallback audit, concurrency check-in, dsb.).
3. Test yang berpotensi rapuh (bergantung data seeder, urutan, waktu, port).
4. Test yang tidak benar-benar menguji perilaku (assertion lemah / hanya cek status 200).
5. Rekomendasi 10 test tambahan paling bernilai — TULIS SEBAGAI DESKRIPSI,
   jangan membuat file test.

Jangan mengubah file apa pun.
```

### 9.12 Prompt 9 — Eksekusi Test Suite & Ringkasan (Read-Only)

```text
[Tempel KONTRAK BATASAN]

Langkah:
1. Periksa prasyarat: baca backend/.env, backend/package.json, backend/tests/setup.js.
2. Jalankan `cd backend && npm test`. JANGAN mengubah file test, konfigurasi, atau .env.
3. Laporkan: jumlah pass/fail/skip, nama test yang gagal, dan pesan error verbatim
   (maks. 20 baris per kegagalan).
4. Untuk setiap kegagalan, lakukan triage (baca kode terkait):
   - Apakah gagal karena bug produk, data seeder, lingkungan, atau test yang rapuh?
   - Sertakan `file:line` dan hipotesis penyebab.
5. Bandingkan hasil dengan klaim README ("70 test"). Laporkan selisih.
6. JANGAN memperbaiki apa pun, termasuk test.

Jika database tidak tersedia, laporkan sebagai BLOCKED beserta langkah setup yang
dibutuhkan (bukan dengan mengubah konfigurasi).
```

### 9.13 Prompt 10 — Security Review Ringkas (Read-Only)

```text
[Tempel KONTRAK BATASAN]

Lakukan review keamanan tingkat kode pada backend/src (dan frontend/src bila relevan)
terhadap kategori berikut, dan laporkan HANYA temuan yang dapat dibuktikan dari kode:

A01 Broken Access Control — route tanpa guard, IDOR, otorisasi hanya di UI
A02 Cryptographic Failures — hashing, secret default, token
A03 Injection — Prisma raw query, interpolasi string, header
A04 Insecure Design — rate limit, lockout, enumeration
A05 Security Misconfiguration — helmet/CORS, error verbose, default credential
A07 Identification/Auth Failures — session, refresh, password policy
A09 Logging/Monitoring — kelengkapan audit, data sensitif di log

Untuk setiap temuan: kategori | lokasi (file:line) | skenario serangan konkret |
dampak | mitigasi yang disarankan (deskriptif).
Jangan mengeksploitasi sistem, jangan menulis payload berbahaya ke database,
jangan mengubah kode.
```

### 9.14 Cara QA Memverifikasi Hasil AI Agent

AI Agent dapat **berhalusinasi**. Setiap temuan wajib melewati verifikasi berikut sebelum masuk backlog bug:

| Langkah | Aksi QA |
| --- | --- |
| 1 | Buka `file:line` yang dikutip — apakah kode memang seperti yang dideskripsikan? |
| 2 | Reproduksi manual bila memungkinkan (request HTTP / langkah UI) |
| 3 | Klasifikasikan: BUG (masuk backlog) / RISIKO (catatan) / SALAH (buang) |
| 4 | Tulis ulang temuan dengan bahasa QA + bukti milik sendiri |
| 5 | Beri label sumber: `[AI-review]` agar tidak tercampur temuan manual |

> **Jangan** menyalin tabel keluaran AI langsung ke issue tracker. Selalu verifikasi dulu.

---

## 10. Format Pelaporan Bug

### 10.1 Template Wajib

```markdown
### [BUG-<YYYYMMDD>-<nn>] <Judul singkat dan spesifik>

- **Severity:** S1 / S2 / S3 / S4
- **Prioritas:** P0 / P1 / P2 / P3
- **Area/Modul:** Auth | Profil | Users | Courses | Classes | Audit | Frontend | Infra
- **Environment:** branch `<nama>`, commit `<hash>`, OS, Node, browser
- **Prasyarat:** akun/role, data uji (prefix QA-...)
- **Langkah Reproduksi:**
  1. ...
  2. ...
- **Hasil Aktual:** (sertakan status HTTP + body respons)
- **Hasil Diharapkan:** (rujuk FR/NFR/TC)
- **Frekuensi:** selalu / kadang (x dari y percobaan)
- **Bukti:** log / screenshot / `file:line`
- **Catatan:** workaround bila ada
```

### 10.2 Aturan Kualitas Laporan

1. Satu bug = satu laporan. Jangan menggabungkan beberapa gejala.
2. Judul harus menyebut **komponen + kondisi + dampak** (contoh: *"Login: akun SUSPENDED mengembalikan 401 bukan 403"*).
3. Jangan mendiagnosis akar masalah di judul — itu tugas developer.
4. Sertakan `commit hash` agar developer dapat mereproduksi.
5. Cantumkan apakah bug ada di `main` atau hanya di branch fitur.

### 10.3 Template Laporan Sesi QA (ringkasan harian)

```markdown
## Laporan QA — <tanggal>
- Branch/Commit: 
- Test dieksekusi: <jumlah>, PASS: <n>, FAIL: <n>, BLOCKED: <n>
- Temuan baru: S1: <n>, S2: <n>, S3: <n>, S4: <n>
- Blocker: <ada/tidak>
- Rekomendasi: <lanjut / tahan rilis>
- Lampiran: qa-evidence/<tanggal>/
```

---

## 11. Requirement Traceability (Diisi QA)

| Requirement | Test Case Manual | Status | Bukti/Laporan |
| --- | --- | --- | --- |
| FR-001 s.d. FR-004 (Auth & RBAC) | AUTH-01…15, SESS-01…09, RBAC-01…08 | ⬜ | |
| FR-005 s.d. FR-008 (Profil) | PROF-01…15, PWD-05…12 | ⬜ | |
| FR-044 s.d. FR-048 (Master Data) | USR-01…25, CRS-01…12, CLS-01…13 | ⬜ | |
| FR-049 s.d. FR-052, FR-058 (Audit) | AUD-01…15, SEC-01…13 | ⬜ | |
| FR-013 s.d. FR-015, FR-030 s.d. FR-031 (Ruang Kelas & Materi) | ⛔ Blocked (MVP 2) | — | |
| FR-016 s.d. FR-034 (Tugas & Validasi File) | ⛔ Blocked (MVP 3) | — | |
| FR-023 s.d. FR-039 (Presensi) | ⛔ Blocked (MVP 2) | — | |
| FR-026 s.d. FR-042, FR-056 (UTS/UAS) | ⛔ Blocked (MVP 5) | — | |
| NFR-001 (Hashing) | SEC-11 | ⬜ | |
| NFR-002 (RBAC) | RBAC-01…08 | ⬜ | |
| NFR-003/NFR-004 (Validasi & ukuran berkas) | PROF-06…09, SEC-07 | ⬜ | |
| NFR-005 (Storage privat) | PROF-10…12, SEC-08…09 | ⬜ | |
| NFR-009 (Auditabilitas) | AUD-01…15 | ⬜ | |
| NFR-010 (Responsif) | UI-10, UI-11 | ⬜ | |

Legenda status: ⬜ Belum diuji · ✅ Terverifikasi · ❌ Gagal · ⛔ Blocked

---

## 12. Definition of Done (Exit Criteria Rilis)

Rilis MVP 1 dianggap **layak** jika seluruh syarat berikut terpenuhi:

1. **Tidak ada** defect terbuka S1/S2.
2. Seluruh test case **P0** dan **P1** berstatus ✅.
3. `npm test` backend lulus **100%** pada kondisi DB hasil `db:seed`.
4. Smoke test lulus di lingkungan bersih (fresh clone → setup → jalankan).
5. Tidak ada kebocoran otorisasi (RBAC-01…08 semuanya lulus).
6. Audit trail terbukti tercatat untuk seluruh mutasi kritis.
7. Frontend dapat di-build (`npm run build`) tanpa error.
8. Dokumentasi status (README/backend/README) selaras dengan kenyataan, atau gap-nya tercatat resmi.
9. Laporan QA akhir diserahkan & diarsipkan ke `qa-evidence/`.

---

## 13. Lampiran

### 13.1 Matriks Endpoint (Kondisi `main`)

| Method | Path | Guard | Modul |
| --- | --- | --- | --- |
| GET | `/health` | — | app |
| GET | `/api` | — | app |
| POST | `/api/auth/login` | — (+ authLimiter) | auth |
| POST | `/api/auth/refresh` | — | auth |
| POST | `/api/auth/logout` | optional | auth |
| POST | `/api/auth/forgot-password` | — (+ authLimiter) | auth |
| PUT | `/api/auth/change-password` | Auth | auth |
| GET/PUT | `/api/profile` | Auth | profile |
| POST/GET | `/api/profile/avatar` | Auth | profile |
| PUT | `/api/profile/password` | Auth | profile |
| GET | `/api/admin/users` | Auth + Admin | users |
| POST | `/api/admin/users` | Auth + Admin | users |
| GET/PUT | `/api/admin/users/:id` | Auth + Admin | users |
| PATCH | `/api/admin/users/:id/status` | Auth + Admin | users |
| PUT | `/api/admin/users/:id/reset-password` | Auth + Admin | users |
| GET/POST | `/api/admin/courses` | Auth + Admin | courses |
| GET/PUT/DELETE | `/api/admin/courses/:id` | Auth + Admin | courses |
| GET/POST | `/api/admin/classes` | Auth + Admin | classes |
| GET/PUT/DELETE | `/api/admin/classes/:id` | Auth + Admin | classes |
| GET | `/api/admin/audit-logs`, `/api/audit-logs` | Auth + Admin | audit-log |
| GET | `/api/admin/audit-logs/:id` | Auth + Admin | audit-log |

> Branch fase 5 menambahkan `/api/classes`, `/api/dashboard`, `/api/admin/enrollments*`. Verifikasi ulang saat merge.

### 13.2 Perintah Bantu QA

```bash
# Login cepat & simpan token
curl -s -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"identifier":"admin","password":"password123"}'

# Simpan ke variabel (PowerShell)
$t = (Invoke-RestMethod -Method Post -Uri http://localhost:5000/api/auth/login `
  -ContentType 'application/json' -Body '{"identifier":"admin","password":"password123"}').data.accessToken

# Smoke
curl -s http://localhost:5000/health
curl -s http://localhost:5000/api

# Jalankan suite
cd backend && npm test

# Lihat perubahan branch sebelum review (read-only)
git fetch origin
git diff --stat origin/main...origin/<branch>
git log --oneline origin/main..origin/<branch>
```

### 13.3 Checklist Bukti per Test Case

- [ ] Status HTTP + body respons (disalin, bukan diringkas)
- [ ] Screenshot (untuk UI) dengan timestamp
- [ ] Console/Network log (untuk UI)
- [ ] `file:line` (untuk temuan statis)
- [ ] `git rev-parse --short HEAD` (konteks commit)
- [ ] Nama environment (`NODE_ENV`, versi Node, DB)

### 13.4 Ringkasan Peran dalam Siklus

| Tahap | QA Melakukan | QA Tidak Melakukan |
| --- | --- | --- |
| Sebelum PR | Menyiapkan test case | Menulis kode fitur |
| Review PR | Membaca diff, komentar `Request changes` | Mengubah diff |
| Setelah merge | Smoke + regresi + update traceability | Merge sendiri |
| Bug ditemukan | Laporan + bukti + retest setelah fix | Memperbaiki bug |
| AI review | Menjalankan prompt read-only, verifikasi temuan | Memberi AI akses tulis |

---

**Dokumen ini bersifat hidup (*living document*).** Setiap kali ada modul baru masuk `main` (MVP 2–5), QA wajib menambahkan test case baru dan memperbarui matriks status Bab 2 serta traceability Bab 11.
