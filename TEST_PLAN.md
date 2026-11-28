# Test Plan (Rencana Pengujian)
# E-Learning Kampus — Learning Management System Universitas

**Team Membangun Negeri — Rekayasa Perangkat Lunak 2026**

---

## Identitas Dokumen

| Item | Keterangan |
| --- | --- |
| **Nama Dokumen** | Test Plan — E-Learning Kampus (RPL LMS) |
| **Versi** | 1.1 |
| **Tanggal** | 26 November 2026 |
| **Status** | Aktif |
| **Pemilik** | Divisi Tester / QA (SRS Bab 28) |
| **Disetujui oleh** | Project Manager · Tech Lead · QA Lead |
| **Dokumen terkait** | [SRS.md](SRS.md) · [PRD.md](PRD.md) · [QA_TESTING_GUIDE.md](QA_TESTING_GUIDE.md) · [COLLABORATION_GUIDE.md](COLLABORATION_GUIDE.md) · [IMPLEMENTATION_PLAN_MVP1_BACKEND.md](IMPLEMENTATION_PLAN_MVP1_BACKEND.md) · [IMPLEMENTATION_PLAN_MVP2_BACKEND.md](IMPLEMENTATION_PLAN_MVP2_BACKEND.md) · Dokumentasi API (OpenAPI 3.0): [backend/docs/openapi.yaml](backend/docs/openapi.yaml) |

### Riwayat Revisi

| Versi | Tanggal | Penulis | Perubahan |
| --- | --- | --- | --- |
| 1.0 | 26 Nov 2026 | Divisi QA | Penyusunan awal Test Plan menyeluruh |
| 1.1 | 26 Nov 2026 | Divisi QA | Menambahkan referensi dokumentasi API OpenAPI (`backend/docs/openapi.yaml`) pada daftar dokumen terkait |

---

## 1. Pendahuluan

### 1.1 Tujuan Dokumen

Dokumen ini merupakan **rencana pengujian menyeluruh** untuk sistem E-Learning Kampus. Tujuannya:

1. Mendefinisikan **ruang lingkup pengujian** (in-scope dan out-of-scope) secara eksplisit.
2. Menetapkan **strategi, level, dan jenis pengujian** yang akan dilakukan.
3. Menyusun **jadwal** dan **pembagian sumber daya** (orang, perangkat, tools).
4. Menetapkan **test environment** yang konsisten dan dapat direproduksi.
5. Menetapkan **kriteria mulai (entry criteria)** dan **kriteria selesai (exit criteria)** untuk setiap siklus pengujian.
6. Menjadi acuan tunggal bagi QA, developer, dan stakeholder mengenai *apa yang diuji, kapan, oleh siapa, di mana, dan kapan pengujian dinyatakan selesai*.

### 1.2 Ringkasan Sistem

E-Learning Kampus adalah LMS standalone untuk universitas dengan 3 role (**Admin, Dosen, Mahasiswa**), siklus 16 pertemuan per kelas (Pertemuan 8 = UTS, Pertemuan 16 = UAS), dibangun di atas:

| Layer | Teknologi |
| --- | --- |
| Backend | Node.js 20+ (ESM), Express 4, Prisma 6, PostgreSQL 16+, JWT (access + refresh), Zod, Helmet, express-rate-limit, Multer |
| Frontend | React 18, Vite 5, Tailwind CSS 3.4, Axios |
| Pengujian backend | Node.js native test runner + embedded-postgres (database uji `rpl_review`) |
| Pengujian frontend | Belum terpasang (direncanakan Vitest/RTL) |

### 1.3 Acuan (References)

| Dokumen | Relevansi |
| --- | --- |
| SRS.md (Bab 9 FR, Bab 10 BR, Bab 14 NFR, Bab 21 API, Bab 22 Validation & Error, Bab 26 Test Case, Bab 28 QA, Bab 29 Traceability) | Sumber requirement & test case |
| PRD.md | Prioritas fitur & roadmap MVP |
| QA_TESTING_GUIDE.md | Prosedur eksekusi, test case manual, format pelaporan bug |
| backend/docs/openapi.yaml | Kontrak API sebagai basis pengujian kontrak |

---

## 2. Ruang Lingkup Pengujian

### 2.1 In-Scope (Yang Diuji)

#### A. Modul fungsional (backend — status ✅ sudah terimplementasi)

| # | Modul | Item yang diuji |
| --- | --- | --- |
| 1 | Autentikasi & Sesi | Login multi-kredensial (username/email/NIM/NIDN/NIP), JWT access + refresh, refresh/logout/revocation, forgot & change password |
| 2 | Profil Pengguna | Data identitas/kontak/bio, avatar privat (JPG/PNG ≤ 2MB), ganti kata sandi |
| 3 | Manajemen Pengguna (Admin) | CRUD akun, filter role/status, pencarian, paginasi, reset password, status `ACTIVE/INACTIVE/SUSPENDED` |
| 4 | Master Mata Kuliah | CRUD, validasi SKS 1–6, penonaktifan tanpa menghapus riwayat |
| 5 | Pembukaan Kelas | CRUD kelas, penetapan dosen, validasi kapasitas, auto-generate 16 pertemuan (P-8 = UTS, P-16 = UAS) |
| 6 | Direct Enrollment | Enroll individu/batch, pencabutan, validasi duplikat & kapasitas |
| 7 | Ruang Kelas & 16 Pertemuan | Daftar/detail pertemuan, ubah topik/deskripsi/publikasi |
| 8 | Materi Perkuliahan | Unggah (PDF/DOCX/XLSX/ZIP ≤ 10MB), ubah metadata, hapus, unduh terproteksi (streaming) |
| 9 | Presensi Digital | Buka/tutup sesi, check-in saat `OPEN`, koreksi status, auto-close berbasis toleransi, penanda `is_auto_generated` |
| 10 | Rekap Kehadiran | Matriks 16 pertemuan, persentase kehadiran per mahasiswa |
| 11 | Dasbor Kontekstual | Metrik per role (Admin/Dosen/Mahasiswa) |
| 12 | Audit Trail | Pencatatan seluruh mutasi kritis, endpoint peninjauan + filter/paginasi |
| 13 | Keamanan HTTP | Helmet, CORS, rate limit, body limit, storage privat, anti user-enumeration, anti path traversal |

#### B. Frontend (status 🟡 UI selesai, data masih mock)

| # | Item yang diuji | Catatan |
| --- | --- | --- |
| 1 | UI fungsional semua halaman (dasbor 3 role, ruang kelas, modul admin/dosen/mahasiswa, profil, forgot password) | Diuji sebagai *UI behavior* |
| 2 | Responsivitas (375px / 768px / 1440px), tema terang/gelap, toggle sidebar | Manual |
| 3 | Build produksi (`npm run build` + `npm run preview`) | Gerbang CI manual |
| 4 | Integrasi API yang sudah terhubung (logout, `apiClient`, `authStore`) | Parsial — sesuai baseline §2.3 QA_TESTING_GUIDE |
| 5 | Aksesibilitas dasar (label, `aria-*`, fokus keyboard, kontras) | Audit ringkas |
| 6 | Konsistensi kontrak frontend↔backend (endpoint yang dipanggil vs yang tersedia) | Temuan gap dicatat sebagai *technical debt* |

#### C. Non-fungsional

| # | Jenis | Item |
| --- | --- | --- |
| 1 | Keamanan | RBAC/otorisasi 403, kebocoran data (`password_hash` tidak pernah muncul), CORS, rate limit, validasi berkas (NFR-003/004), storage privat (NFR-005), SQL injection (parameterized), XSS escaping di UI |
| 2 | Usability/UI | Alur utama 3 role, pesan error yang jelas, konsistensi design system |
| 3 | Kompatibilitas | Chrome, Edge, Firefox versi terbaru; viewport mobile/tablet/desktop |
| 4 | Regresi | `npm test` backend (Node native test runner, DB `rpl_review`) + smoke test + test case P0/P1 |
| 5 | Kontrak API | Kesesuaian respons dengan `openapi.yaml` |
| 6 | Auditabilitas | Kelengkapan `AuditLog` (NFR-009), immutability log |
| 7 | Dokumentasi | Kesesuaian README/klaim vs kenyataan repo (port, jumlah test, akun seeder) |

#### D. Metode pengujian yang digunakan

- Pengujian otomatis backend (regression gate): `cd backend && npm test`.
- Pengujian API manual: curl/Postman/Thunder Client terhadap `http://localhost:5000`.
- Pengujian UI manual di browser (Chrome/Edge/Firefox).
- Review statis berbantuan AI Agent **read-only** (Prompt P0–P10 pada QA_TESTING_GUIDE Bab 9), dengan verifikasi manual setiap temuan.

### 2.2 Out-of-Scope (Yang Tidak Diuji)

| # | Item | Alasan |
| --- | --- | --- |
| 1 | Antarmuka Swagger UI (dokumentasi API interaktif) | Belum diekspos; kontrak terdokumentasi di openapi.yaml 1.4.0 |
| 2 | Modul MVP 5 — UTS/UAS, gatekeeping kehadiran ≥70%, rekap nilai akhir | Belum diimplementasikan |
| 3 | Load/stress testing & pengukuran throughput produksi | Tidak tersedia environment bertingkat; dilakukan pada fase rilis lanjutan |
| 4 | Penetration testing penuh / eksploitasi nyata | Di luar wewenang QA; cukup security review statis + uji dasar |
| 5 | Pengujian infrastruktur deployment (Docker/CD, domain, TLS) | Belum ada konfigurasi deployment |
| 6 | Pengujian email delivery nyata (forgot password) | Belum ada SMTP provider; diuji sebagai respons API |
| 7 | Pengujian mobile native | Tidak ada aplikasi native; hanya web responsif |
| 8 | Integrasi pihak ketiga (SSO kampus, payment, dsb.) | Tidak dalam lingkup sistem |
| 9 | Perbaikan kode oleh QA | Prinsip kerja: **QA tidak memperbaiki kode** — QA membuktikan perilaku dan melaporkan |

> **Aturan pelaporan:** fitur yang termasuk kategori out-of-scope **tidak dilaporkan sebagai bug**. Jika test case SRS Bab 26 terkait modul tersebut dieksekusi, gunakan status **"Blocked by roadmap"**, bukan "Failed" (lihat QA_TESTING_GUIDE §2.2).

### 2.3 Baseline yang Diuji

| Area | Status | Dapat Diuji? |
| --- | --- | --- |
| MVP 1 backend (auth, RBAC, profil, master data, audit, keamanan) | ✅ di `main` | Ya |
| MVP 2 backend (pertemuan, materi, presensi, rekap) | ✅ di `main` | Ya |
| MVP 3 backend (tugas, submission, validasi berkas, penilaian 0–100) | ✅ di `main` | Ya |
| Frontend SPA (semua halaman, data mock; logout terintegrasi) | 🟡 di `main` | Ya, dengan catatan data mock |
| Fase 5 (enrollment endpoint, dashboard) di branch `feat/backend-fase-5-...` | ⚠️ cek status merge saat eksekusi | Ya jika sudah merge; jika belum, uji di branch terpisah |
| MVP 4 backend (timeline, kuis, notifikasi) | ✅ di working tree (suite mvp4-phase2..5) | Ya |
| MVP 5 | ❌ belum ada | Tidak — out-of-scope |

---

## 3. Test Environment

### 3.1 Spesifikasi Environment

| Komponen | Spesifikasi |
| --- | --- |
| OS | Windows 10/11 (utama), macOS/Linux (opsional untuk kompatibilitas) |
| Runtime | Node.js v20+ LTS, npm |
| Database uji | PostgreSQL 16+ — database **`rpl_review`** (terisolasi, **bukan** `rpl_lms` operasional); alternatif: embedded-postgres bawaan repo (port 5433) via `node scripts/run-pg.js` |
| Backend | `npm run dev` → `http://localhost:5000` (`NODE_ENV=development`) |
| Frontend | `npm run dev` (Vite) → `http://localhost:5173`, proxy `/api` → port 5000 |
| Browser | Chrome, Edge, Firefox versi terbaru + DevTools |
| Tools API | curl / Postman / Thunder Client |
| Tools pendukung | Prisma Studio (read-only), Git, editor teks |

### 3.2 Variabel Environment Kunci (backend/.env)

| Variabel | Nilai untuk pengujian |
| --- | --- |
| `PORT` | `5000` |
| `DATABASE_URL` | Menunjuk `rpl_review` (setup test memaksa; guard menolak `rpl_lms`) |
| `DATABASE_URL_TEST` | `postgresql://postgres:password@localhost:5432/rpl_review?schema=public` |
| `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET` | Minimal 32 karakter (nilai khusus uji) |
| `CORS_ORIGIN` | `http://localhost:3000,http://localhost:5173` |

### 3.3 Persiapan Environment (urutan wajib)

```bash
# 1. Sinkronkan kode
git checkout main && git pull origin main

# 2. Backend
cd backend
npm install
cp .env.example .env            # PowerShell: Copy-Item .env.example .env
npx prisma migrate dev
npm run db:seed

# (alternatif tanpa instalasi PostgreSQL)
node scripts/run-pg.js          # embedded postgres port 5433

# 3. Database uji terisolasi (sekali saja)
createdb rpl_review
DATABASE_URL="postgresql://postgres:password@localhost:5432/rpl_review?schema=public" npx prisma migrate deploy
DATABASE_URL="postgresql://postgres:password@localhost:5432/rpl_review?schema=public" npm run db:seed

# 4. Jalankan server
npm run dev

# 5. Frontend (terminal terpisah)
cd ../frontend && npm install && npm run dev
```

### 3.4 Data Uji

- Akun hasil seeder (password seluruh akun: `password123`): `admin`, dosen `198501152010121002`/`199003202015042001`/`197805102003122001`, mahasiswa `2024001001`–`2024001010`.
- Master data: 5 mata kuliah `TIF101`–`TIF105`, kelas `TI-A` & `SI-B` (2026/2027 ganjil), masing-masing 16 pertemuan.
- **Konvensi penamaan data uji buatan QA: prefix `QA-<tanggal>-<nomor>`** (mis. `QA-2611-01`) agar mudah ditelusuri dan dibersihkan. Data seeder tidak boleh dihapus; pembersihan hanya melalui API resmi.
- Uji rate limit memakai header `X-Enforce-Rate-Limit: 1` (khusus `NODE_ENV=test`).
- Bukti pengujian disimpan di `qa-evidence/<tanggal>/<TC-ID>/` (lokal, tidak di-commit).

### 3.5 Smoke Test Wajib (pra-syarat setiap sesi)

| # | Langkah | Ekspektasi |
| --- | --- | --- |
| S-01 | `GET /health` | 200 + status healthy |
| S-02 | `GET /api` | 200 + daftar endpoint |
| S-03 | `POST /api/auth/login` (admin) | 200 + accessToken + refreshToken |
| S-04 | `GET /api/admin/users` (token admin) | 200 + `data[]` + `meta` |
| S-05 | `cd backend && npm test` | Seluruh test PASS |
| S-06 | Buka `http://localhost:5173` | Aplikasi tampil tanpa console error fatal |

Jika salah satu gagal → sesi pengujian **ditunda** dan dieskalasi sebagai *blocker*.

---

## 4. Strategi Pengujian

### 4.1 Level & Jenis Pengujian

| Level | Metode | Penanggung Jawab |
| --- | --- | --- |
| Unit/Integration (otomatis) | `npm test` (Node native test runner, serial, DB `rpl_review`) | QA menjalankan; developer memelihara |
| API Functional | Manual + koleksi Postman/curl | QA |
| UI Functional | Manual di browser | QA |
| Keamanan dasar | Header, CORS, rate limit, RBAC, path traversal, enum-user | QA |
| Kontrak API | Pembandingan respons vs `openapi.yaml` | QA |
| Regresi | Test suite + smoke + P0/P1 setiap PR/merge | QA |
| Review statis berbantuan AI | AI Agent read-only (QA verifikasi temuan) | QA |

### 4.2 Prioritas & Severity

| Prioritas | Definisi | Contoh |
| --- | --- | --- |
| P0 | Blocker | Login gagal total; mahasiswa bisa akses `/api/admin/*` |
| P1 | Kritis | Refresh token tidak berfungsi; audit tidak tercatat |
| P2 | Mayor | Filter/pencarian salah hasil; UX terganggu |
| P3 | Minor | Kosmetik, teks, konsistensi |

| Severity | Kriteria | SLA Perbaikan |
| --- | --- | --- |
| S1 Critical | Kehilangan data, kebocoran otorisasi, server down | < 1 hari |
| S2 High | Fitur utama gagal tanpa workaround | < 3 hari |
| S3 Medium | Berjalan sebagian / dengan workaround | Sprint berjalan |
| S4 Low | Kosmetik/dokumentasi | Backlog |

### 4.3 Teknik & Pendekatan

- **Black-box** untuk fungsional API & UI (berbasis test case SRS Bab 26 + test case manual QA_TESTING_GUIDE Bab 5–7).
- **White-box ringan** melalui review statis (AI Agent read-only) untuk celah RBAC, validasi Zod, audit, storage.
- **Negative & boundary testing**: input invalid, batas ukuran berkas, kapasitas kelas, paginasi, format tahun akademik.
- **Regression gate**: suite otomatis + checklist regresi (QA_TESTING_GUIDE Bab 8) pada setiap PR yang di-merge.

### 4.4 Kriteria Suspend & Resumption

**Pengujian ditunda (suspend) jika:**
1. Smoke test gagal (S-01 s.d. S-06).
2. Blocker S1 terbuka yang memblokir alur utama (server tidak bisa start, DB tidak tersedia).
3. Environment tidak konsisten (commit target berubah di tengah siklus tanpa pemberitahuan).

**Pengujian dilanjutkan (resumption) jika:**
1. Penyebab suspend telah diperbaiki dan diverifikasi ulang lewat smoke test.
2. QA Lead menyetujui pelanjutan dan mencatatnya di log sesi.

---

## 5. Jadwal Pengujian

> Perkiraan berbasis siklus sprint tim; tanggal disesuaikan dengan kalender sprint aktual. Total estimasi **4 minggu efektif** per rilis MVP.

| Fase | Aktivitas | Durasi | Output |
| --- | --- | --- | --- |
| **F1 — Persiapan** | Review requirement (SRS/PRD), finalisasi Test Plan & test case, setup environment | Minggu 1 (2 hari) | Test Plan disetujui; environment siap; smoke lulus |
| **F2 — Desain Test Case** | Penyusunan/perbaruan test case per modul (AUTH, SESS, PWD, PROF, USR, CRS, CLS, ENR, MTG, MAT, ATT, AUD, SEC, UI), RTM awal | Minggu 1 (3 hari) | Test case ditelusur ke FR/NFR; RTM draft |
| **F3 — Eksekusi Siklus 1** | API functional + keamanan dasar (backend MVP 1 & 2) + regresi otomatis | Minggu 2 | Laporan hasil siklus 1; daftar bug |
| **F4 — Eksekusi Siklus 2** | UI manual (3 role, responsif, a11y), kontrak frontend↔backend, review statis AI | Minggu 3 | Laporan hasil siklus 2; bug fix retest |
| **F5 — Retest & Regresi** | Retest defect, regresi penuh (suite + smoke + P0/P1), verifikasi exit criteria | Minggu 4 (awal) | RTM final; semua S1/S2 tertutup |
| **F6 — Penutupan** | Laporan QA akhir, arsip bukti `qa-evidence/`, sign-off exit criteria | Minggu 4 (akhir) | Test Summary Report; keputusan rilis |

### 5.1 Milestone

| Milestone | Kriteria | Target |
| --- | --- | --- |
| M1 — Environment Ready | Smoke S-01…S-06 lulus | Akhir Minggu 1 |
| M2 — Siklus 1 Selesai | 100% test case backend tereksekusi; bug tertriase | Akhir Minggu 2 |
| M3 — Siklus 2 Selesai | 100% test case UI tereksekusi; gap kontrak tercatat | Akhir Minggu 3 |
| M4 — Exit Criteria Terpenuhi | Semua syarat Bab 7.2 ✅ | Minggu 4 |
| M5 — Sign-off | Laporan akhir disetujui PM & Tech Lead | Akhir Minggu 4 |

---

## 6. Sumber Daya (Resources)

### 6.1 Peran & Tanggung Jawab

| Peran | Jumlah | Tanggung Jawab |
| --- | --- | --- |
| QA Lead | 1 | Memiliki Test Plan, koordinasi eksekusi, triase defect, keputusan suspend/resume, laporan akhir |
| QA Tester (manual API/UI) | 1–2 | Eksekusi test case, dokumentasi bukti, pelaporan bug sesuai template QA_TESTING_GUIDE Bab 10 |
| QA (otomasi/regresi) | 1 | Menjalankan & menganalisis `npm test`, memelihara catatan kegagalan suite |
| Tech Lead / Developer pemilik modul | sesuai tim | Menerima laporan bug, memperbaiki, mendukung retest |
| Project Manager | 1 | Persetujuan jadwal & sign-off rilis |

### 6.2 Batas Wewenang QA (ringkas)

| ✅ Boleh | ❌ Tidak Boleh |
| --- | --- |
| Membaca seluruh kode/dokumen/riwayat git | Mengubah file repositori |
| Menjalankan aplikasi, test suite, HTTP ke DB lokal/uji | `prisma migrate`/`db push`/SQL tulis ke DB bersama |
| Membuat data uji via API resmi (prefix `QA-`) | Edit database langsung dengan SQL |
| Komentar review pada PR | Commit/push/merge ke branch orang lain |

### 6.3 Perangkat & Tools

| Kategori | Item |
| --- | --- |
| Perangkat | Laptop developer/QA (Windows/macOS), RAM ≥ 8GB agar PostgreSQL + Node + browser berjalan bersamaan |
| Software | Node.js 20+, PostgreSQL 16+ (atau embedded), Git, browser modern |
| Test data | Seeder bawaan + data `QA-*` |
| Pelacakan | Issue tracker tim (atau tabel bug pada dokumen laporan QA) |
| Bukti | Folder `qa-evidence/<tanggal>/<TC-ID>/` (lokal) |

---

## 7. Kriteria Mulai dan Selesai (Entry & Exit Criteria)

### 7.1 Entry Criteria (Kriteria Mulai)

Pengujian suatu siklus **hanya dimulai** jika seluruh syarat berikut terpenuhi:

| # | Syarat | Verifikasi |
| --- | --- | --- |
| E1 | Kode yang diuji sudah di-merge/di-commit pada branch target dan tersedia di environment QA | `git log` menunjukkan commit target |
| E2 | Build backend & frontend sukses tanpa error | `npm run dev` (backend) dan `npm run build` (frontend) |
| E3 | Migrasi & seeder berhasil dijalankan di database uji | `npx prisma migrate dev` + `npm run db:seed` tanpa error |
| E4 | Smoke test S-01 s.d. S-06 **lulus penuh** | Bukti smoke tercatat |
| E5 | Test case untuk lingkup siklus sudah final & ditelusur ke requirement | RTM draft tersedia |
| E6 | Test environment siap & stabil (DB uji terisolasi `rpl_review`, port 5000/5173 bebas konflik) | Cek manual |
| E7 | Tidak ada defect S1 terbuka dari siklus sebelumnya yang memblokir alur yang akan diuji | Cek daftar bug |
| E8 | Developer menyerahkan "Cara menguji" untuk fitur baru (aturan PR, COLLABORATION_GUIDE Bab 6) | Deskripsi tersedia di PR |
| E9 | Test Plan disetujui QA Lead (dan PM untuk perubahan lingkup/jadwal) | Dokumen berstatus Aktif |

> Jika ada syarat yang belum terpenuhi, pengujian **ditunda** dan dicatat sebagai *blocked* beserta syarat yang belum terpenuhi.

### 7.2 Exit Criteria (Kriteria Selesai)

Suatu rilis/siklus dinyatakan **selesai dan layak** hanya jika seluruh syarat berikut terpenuhi:

| # | Syarat | Verifikasi |
| --- | --- | --- |
| X1 | **Tidak ada defect terbuka S1/S2** (S3/S4 boleh dibawa ke backlog dengan persetujuan QA Lead) | Daftar bug |
| X2 | Seluruh test case **P0 dan P1** berstatus ✅ lulus | RTM |
| X3 | `npm test` backend lulus **100%** pada database hasil `db:seed` | Output suite, exit code 0 |
| X4 | Smoke test lulus di environment bersih (fresh clone → setup → jalankan) | Bukti smoke |
| X5 | Tidak ada kebocoran otorisasi: RBAC-01 s.d. RBAC-08 semuanya lulus | RTM |
| X6 | Audit trail terbukti tercatat untuk seluruh mutasi kritis (AUD-01…15) | RTM |
| X7 | Frontend dapat di-build (`npm run build`) tanpa error | Log build |
| X8 | Coverage eksekusi: ≥ 95% test case dalam lingkup siklus tereksekusi; sisanya terblokir dengan alasan terdokumentasi | Ringkasan eksekusi |
| X9 | Setiap requirement in-scope pada RTM berstatus ✅ terverifikasi atau ⛔ blocked dengan alasan (roadmap) | RTM final |
| X10 | Dokumentasi status (README, backend/README) selaras dengan kenyataan, atau gap-nya tercatat resmi sebagai temuan | Daftar temuan dokumentasi |
| X11 | Laporan QA akhir (Test Summary Report) diserahkan & bukti diarsipkan ke `qa-evidence/` | Arsip |
| X12 | Rekomendasi rilis ("lanjut" / "tahan") ditetapkan QA Lead dan disetujui PM & Tech Lead | Sign-off |

### 7.3 Definisi Status Test Case

| Status | Arti |
| --- | --- |
| ✅ Pass | Hasil aktual sesuai ekspektasi, bukti terlampir |
| ❌ Fail | Hasil tidak sesuai; bug dilaporkan (satu bug = satu laporan) |
| ⛔ Blocked | Tidak dapat dieksekusi (dependensi belum ada / blocker / roadmap) — **bukan** gagal |
| ⏭ Skipped | Sengaja tidak dieksekusi pada siklus ini, dengan persetujuan QA Lead |
| 🔁 Retest | Menunggu verifikasi setelah perbaikan |

---

## 8. Deliverables (Artefak Pengujian)

| # | Artefak | Penanggung Jawab | Waktu |
| --- | --- | --- | --- |
| 1 | Test Plan (dokumen ini) | QA Lead | F1 |
| 2 | Test case + RTM (traceability FR/NFR ↔ TC ↔ status ↔ bukti) | QA | F2–F5 |
| 3 | Laporan hasil per siklus (pass/fail/blocked, temuan) | QA | F3, F4 |
| 4 | Laporan bug (template QA_TESTING_GUIDE Bab 10, wajib bukti) | QA | Sejak F3 |
| 5 | Bukti eksekusi (`qa-evidence/`) | QA | Berkelanjutan |
| 6 | Test Summary Report + rekomendasi rilis + sign-off | QA Lead | F6 |

---

## 9. Manajemen Defect

1. **Alur:** temuan → laporan (template wajib, dengan bukti) → triase QA Lead (prioritas/severity) → ditugaskan ke developer pemilik modul → perbaikan → **retest QA** → status Verified → RTM diperbarui.
2. **Aturan emas:** laporan tanpa bukti (request/response, log, screenshot, `file:line`) dianggap **belum valid** dan dikembalikan ke pelapor.
3. **Eskalasi:** bug kritis yang memblokir pengujian lanjutan dieskalasi segera ke developer pemilik modul — QA tidak memperbaiki sendiri.
4. **Temuan AI Agent** diberi label `[AI-review]` dan wajib diverifikasi manual sebelum masuk backlog.

---

## 10. Risiko Pengujian & Mitigasi

| # | Risiko | Dampak | Probabilitas | Mitigasi |
| --- | --- | --- | --- | --- |
| R1 | Frontend masih memakai data mock → hasil UI tidak merepresentasikan integrasi nyata | Sedang | Tinggi | Uji UI sebagai *UI behavior*; catat gap integrasi sebagai temuan kontrak/tech-debt, bukan bug fungsional |
| R2 | Data uji QA saling mengganggu antar tester | Sedang | Sedang | Konvensi prefix `QA-<tanggal>-<nomor>`; pembersihan hanya via API |
| R3 | Pengujian tidak sengaja menulis ke DB operasional `rpl_lms` | Tinggi | Rendah | Guard `tests/setup.js` memaksa `rpl_review`; verifikasi `DATABASE_URL` sebelum eksekusi |
| R4 | Port 5000/5173/5433 bentrok di mesin QA | Rendah | Sedang | Matikan proses lain; gunakan embedded-postgres bila perlu |
| R5 | Perubahan cepat di `main` membuat hasil siklus basi | Sedang | Sedang | Kunci commit target per siklus; catat `git rev-parse --short HEAD` di setiap bukti |
| R6 | Keterbatasan personel QA | Sedang | Sedang | Prioritaskan P0/P1; manfaatkan review statis AI read-only untuk memperluas cakupan |
| R7 | Test suite rapuh (tergantung seeder/urutan/waktu) | Sedang | Sedang | Jalankan dari kondisi DB hasil `db:seed`; laporkan test rapuh sebagai temuan terpisah |
| R8 | Modul baru (MVP 3+) masuk di tengah siklus | Sedang | Rendah | Modul baru otomatis out-of-scope siklus berjalan; masuk siklus berikutnya setelah Test Plan diperbarui |

---

## 11. Requirement Traceability Matrix (Kerangka)

| Requirement | Test Case | Status | Bukti/Laporan |
| --- | --- | --- | --- |
| FR-001–FR-004 (Auth & RBAC) | AUTH-01…15, SESS-01…09, RBAC-01…08 | ⬜ | |
| FR-005–FR-008 (Profil) | PROF-01…15, PWD-05…12 | ⬜ | |
| FR-044–FR-048 (Master Data) | USR-01…25, CRS-01…12, CLS-01…13 | ⬜ | |
| FR-049–FR-052, FR-058 (Audit) | AUD-01…15, SEC-01…13 | ⬜ | |
| FR-013–FR-015, FR-030–FR-031 (Ruang Kelas & Materi — MVP 2) | MTG-*, MAT-* (menyusul implementasi) | ⬜ | |
| FR-023–FR-039 (Presensi — MVP 2) | ATT-* (menyusul implementasi) | ⬜ | |
| FR-016–FR-035 (Tugas, Submission & Validasi File — MVP 3) | TC-009…014, TC-023, mvp3-phase2…5 | ✅ Terverifikasi | `backend/tests/mvp3-phase2..5.test.js` |
| FR-026–FR-042, FR-056 (UTS/UAS — MVP 5) | ⛔ Blocked by roadmap | — | |
| NFR-001 (Hashing) | SEC-11 | ⬜ | |
| NFR-002 (RBAC) | RBAC-01…08 | ⬜ | |
| NFR-003/NFR-004 (Validasi & ukuran berkas) | PROF-06…09, SEC-07, MAT-* | ⬜ | |
| NFR-005 (Storage privat) | PROF-10…12, SEC-08…09 | ⬜ | |
| NFR-009 (Auditabilitas) | AUD-01…15 | ⬜ | |
| NFR-010 (Responsif) | UI-10, UI-11 | ⬜ | |

Legenda: ⬜ Belum diuji · ✅ Terverifikasi · ❌ Gagal · ⛔ Blocked

---

## 12. Persetujuan

| Peran | Nama | Persetujuan | Tanggal |
| --- | --- | --- | --- |
| QA Lead | ____________ | ☐ Setuju | ________ |
| Tech Lead | ____________ | ☐ Setuju | ________ |
| Project Manager | ____________ | ☐ Setuju | ________ |

---

> **Dokumen hidup:** setiap kali modul baru (MVP 3–5) masuk `main`, Test Plan ini wajib diperbarui — lingkup (Bab 2), jadwal (Bab 5), dan exit criteria (Bab 7) disesuaikan, dan test case baru ditambahkan ke RTM (Bab 11).
