# Implementation Plan: Frontend MVP 1–5 (Indeks & Roadmap)
# E-Learning Kampus (Learning Management System) Universitas
**Team Membangun Negeri — Peta Eksekusi Frontend Lintas MVP**

---

> **Tujuan dokumen:** menjadi pintu masuk tunggal ke lima rencana eksekusi frontend. Setiap MVP memiliki dokumen rinci sendiri; dokumen ini mengatur **urutan kerja, prasyarat, konvensi lintas-MVP, cakupan kontrak API, dan backlog gap** agar tidak ada pekerjaan ganda atau klaim status yang keliru.
>
> **Konteks:** backend MVP 1–4 sudah selesai dan teruji (`npm test` 327/327). Frontend MVP 1–4 masih mock/parsial; backend MVP 5 belum ada.
>
> **Pembaruan terakhir:** 28 November 2026.

---

## 1. Daftar Dokumen Rencana

| MVP | Dokumen | Fokus frontend | Status backend | Kesiapan frontend |
|---|---|---|---|---|
| MVP 1 | [IMPLEMENTATION_PLAN_MVP1_FRONTEND.md](IMPLEMENTATION_PLAN_MVP1_FRONTEND.md) | Fondasi, autentikasi, profil, dasbor, master data, enrollment, audit | ✅ Selesai | ⬜ Belum (mock) |
| MVP 2 | [IMPLEMENTATION_PLAN_MVP2_FRONTEND.md](IMPLEMENTATION_PLAN_MVP2_FRONTEND.md) | Ruang kelas 16 pertemuan, materi, presensi digital, rekap kehadiran | ✅ Selesai | ⬜ Belum (mock) |
| MVP 3 | [IMPLEMENTATION_PLAN_MVP3_FRONTEND.md](IMPLEMENTATION_PLAN_MVP3_FRONTEND.md) | Tugas, validasi berkas, submission, penilaian 0–100 | ✅ Selesai | ⬜ Belum (mock) |
| MVP 4 | [IMPLEMENTATION_PLAN_MVP4_FRONTEND.md](IMPLEMENTATION_PLAN_MVP4_FRONTEND.md) | Central Timeline, widget dasbor, kuis interaktif, notifikasi | ✅ Selesai | ⬜ Belum (mock) |
| MVP 5 | [IMPLEMENTATION_PLAN_MVP5_FRONTEND.md](IMPLEMENTATION_PLAN_MVP5_FRONTEND.md) | UTS/UAS, gatekeeping, rekap nilai & ekspor, monitoring audit | ❌ Belum | ⏸️ Sebagian terblokir |

---

## 2. Urutan Eksekusi & Ketergantungan

```text
MVP 1 Fase 0  Fondasi (router, HTTP, auth store, UI kit, Query, test)
      │
MVP 1 Fase 1  Autentikasi & sesi
      │
MVP 1 Fase 2  App shell, RBAC, profil
      │
MVP 1 Fase 3  Dasbor 3 peran
      │
      ├── MVP 1 Fase 4–6  Master data, enrollment, audit, hardening
      │
MVP 2 Fase 1  Daftar & ruang kelas
      │
MVP 2 Fase 2–3  Pertemuan & materi
      │
MVP 2 Fase 4–6  Presensi, rekap, hardening
      │
MVP 3 Fase 1–2  Daftar/detail & pengelolaan tugas
      │
MVP 3 Fase 3–5  Submission, penilaian, hardening
      │
MVP 4 Fase 1–2  Timeline, widget, notifikasi
      │
MVP 4 Fase 3–7  Kuis: daftar, editor, pengerjaan, roster, hardening
      │
MVP 5 Fase 1–2  Ambang kehadiran & audit (dapat dikerjakan sekarang)
      │
MVP 5 Fase 3–5  Ujian, gatekeeping, rekap nilai, monitoring  ⏸️ menunggu backend
      │
MVP 5 Fase 6  Hardening & sinkronisasi RTM
```

**Aturan urutan:**
1. **Jangan mulai MVP N+1 sebelum Fase 0–3 MVP 1 selesai.** Fondasi dipakai seluruh MVP.
2. MVP 2 Fase 3 (materi) wajib selesai sebelum MVP 3 Fase 2 (file soal & submission) karena berbagi helper upload/download.
3. MVP 4 Fase 5 (pengerjaan kuis) wajib selesai sebelum MVP 5 Fase 3 (ujian) karena komponen timer/attempt dipakai ulang.
4. MVP 5 Fase 3–5 **tidak boleh** dimulai sebelum endpoint tersedia di OpenAPI; statusnya `⏸️`.

---

## 3. Prioritas & Modularitas

### 3.1 Legenda Prioritas

| Label | Arti | Aturan eksekusi |
|---|---|---|
| **P0** | **Prasyarat wajib (blocker)** | Harus selesai sebelum fase lain yang bergantung dimulai. Tidak boleh dilewati/diparalelkan dengan dependensinya. |
| **P1** | **Nilai inti** | Wajib selesai untuk rilis MVP tersebut, tetapi boleh berjalan paralel dengan P1 lain yang tidak berbagi dependensi. |
| **P2** | **Modular / dapat ditunda** | Dapat dikerjakan kapan saja setelah prasyaratnya, dicicil, atau digeser ke akhir tanpa memblokir fase lain. |
| **⏸** | **Terblokir backend** | Tidak boleh dimulai sebelum endpoint tersedia di OpenAPI. Status fase tetap `⏸️`. |

### 3.2 Matriks Prioritas per Fase

| MVP | Fase | Prioritas | Prasyarat utama | Catatan / boleh paralel dengan |
|---|---|---|---|---|
| 1 | F0 — Fondasi | **P0** | — | Akar seluruh pekerjaan; tidak boleh diparalelkan |
| 1 | F1 — Autentikasi & sesi | **P0** | F0 | — |
| 1 | F2 — Shell, RBAC, profil | **P0** | F1 | — |
| 1 | F3 — Dasbor 3 peran | **P1** | F2 | Paralel dengan F4 |
| 1 | F4 — Master data admin | **P1** | F2 | Modul users/courses/classes/config independen; paralel F3 |
| 1 | F5 — Enrollment & audit | **P1** | F4 (enrollment), F2 (audit) | Audit dapat dimulai sebelum enrollment selesai |
| 1 | F6 — Hardening & rilis | **P1** (gerbang akhir) | F1–F5 | Dicicil sejak F1; keputusan rilis menunggu semua P1 |
| 2 | F1 — Rute & daftar kelas | **P0** | MVP 1 F2 | Membuka seluruh deep-link kelas |
| 2 | F2 — Ruang kelas & 16 pertemuan | **P0** | F1 | Prasyarat tugas, kuis, presensi |
| 2 | F3 — Materi | **P1** | F2 | Paralel dengan F4; helper upload untuk MVP 3 |
| 2 | F4 — Presensi digital | **P1** | F2 | Paralel dengan F3 |
| 2 | F5 — Rekap kehadiran | **P2** | F4 | Dapat digeser setelah MVP 3; bagian kehadiran MVP 5 memakainya |
| 2 | F6 — Hardening & handoff | **P2** | F2–F5 | Dicicil |
| 3 | F1 — Daftar & detail tugas | **P1** | MVP 2 F2 | Dibutuhkan agar deep-link timeline ke tugas tidak jatuh ke fallback |
| 3 | F2 — Pengelolaan tugas (dosen) | **P1** | F1 + MVP 2 F3 | Paralel dengan F3 |
| 3 | F3 — Pengumpulan tugas (mahasiswa) | **P1** | F1 | Paralel dengan F2 |
| 3 | F4 — Pemeriksaan & penilaian | **P1** | F3 (data riil) | Dapat dibangun paralel F2 dengan submission hasil seed API |
| 3 | F5 — Hardening & handoff | **P2** | F1–F4 | Dicicil |
| 4 | F1 — Central Timeline | **P1** | MVP 2 F1–F2 (+ MVP 3 F1 untuk deep-link) | Paralel dengan F2 dan F3 |
| 4 | F2 — Widget & notifikasi | **P1** | MVP 1 F2 | Paralel dengan F1 dan F3 |
| 4 | F3 — Daftar & detail kuis | **P0** | MVP 2 F2 | Fondasi seluruh modul kuis |
| 4 | F4 — Editor kuis & bank soal | **P1** | F3 | Paralel dengan F5 bila kuis dibuat via API/seed |
| 4 | F5 — Pengerjaan kuis (timer) | **P0** | F3 + F4 | **Prasyarat MVP 5 F3** karena komponen attempt dipakai ulang |
| 4 | F6 — Roster & penilaian esai | **P1** | F5 | — |
| 4 | F7 — Hardening & handoff | **P2** | F1–F6 | Dicicil |
| 5 | F1 — Ambang kehadiran | **P1** | MVP 1 F4 (halaman config) | Dapat dikerjakan lebih awal, paralel dengan MVP 2–4 |
| 5 | F2 — Audit trail | **P1** | MVP 1 F2 (shell) | Dapat dikerjakan lebih awal, paralel dengan MVP 2–4 |
| 5 | F3 — Ujian & gatekeeping | **⏸ P1** | MVP 4 F5 + backend MVP 5 | Tidak boleh dimulai sebelum endpoint ada |
| 5 | F4 — Rekap nilai & ekspor | **⏸ P1** | Backend rekap nilai | Bagian kehadiran (P2) dapat dimulai setelah MVP 2 F5 |
| 5 | F5 — Monitoring admin | **⏸ P2** | Backend monitoring | Dapat ditunda sampai endpoint tersedia |
| 5 | F6 — Hardening & rilis | **P2** | Fase aktif MVP 5 | Gerbang akhir program |

### 3.3 Jalur Kritis (Critical Path)

Urutan yang **tidak boleh** dilompati karena memblokir fase berikutnya:

```text
MVP1 F0 → MVP1 F1 → MVP1 F2
        → MVP2 F1 → MVP2 F2
        → MVP3 F1 → MVP3 F3 → MVP3 F4
        → MVP4 F3 → MVP4 F4 → MVP4 F5
        → MVP5 F3 → MVP5 F4 → MVP5 F6
```

**Fase P0 saja (7 fase):** MVP 1 F0–F2, MVP 2 F1–F2, MVP 4 F3, MVP 4 F5.

**Artefak minimum yang harus ada lebih dulu:**
1. Router + guard + HTTP client + auth store (MVP 1 F0–F1).
2. Deep-link `/classes/:classId` dan `/classes/:classId/meetings/:meetingId` (MVP 2 F1–F2).
3. Halaman detail tugas (MVP 3 F1) agar notifikasi/timeline memiliki tujuan.
4. Modul kuis sampai pengerjaan (MVP 4 F3–F5) sebelum ujian MVP 5.

### 3.4 Paket Kerja Modular (Dapat Diparalelkan)

| Paket | Isi | Prasyarat | Catatan paralelisasi |
|---|---|---|---|
| **A — Admin Master Data** | Users, Courses, Classes, Config, Audit | MVP 1 F2 | Empat modul independen; satu modul tidak menunggu modul lain |
| **B — Konten Kelas** | Materi (MVP 2 F3) vs Presensi+Rekap (F4–F5) | MVP 2 F2 | Dua alur terpisah; hanya berbagi halaman pertemuan |
| **C — Tugas** | Pengelolaan dosen (F2) vs Pengumpulan mahasiswa (F3) vs Penilaian (F4) | MVP 3 F1 | F2 dan F3 paralel; F4 dapat dibangun dengan data seed API |
| **D — Engagement** | Timeline (F1), Notifikasi (F2), Kuis (F3–F6) | MVP 1 F2 / MVP 2 F2 | Timeline dan notifikasi tidak menunggu kuis; kuis tidak menunggu timeline |
| **E — Kuis internal** | Editor+bank soal (F4) vs Pengerjaan (F5) | MVP 4 F3 | Paralel bila kuis uji dibuat lewat API, bukan menunggu editor selesai |
| **F — Kesiapan MVP 5** | Ambang kehadiran (F1) + Audit trail (F2) | MVP 1 F2/F4 | Dapat dikerjakan **kapan saja**, bahkan saat MVP 2–4 berjalan |
| **G — Hardening** | Semua fase P2 | Fase terkait selesai | Dicicil per modul; bukan pekerjaan sekali jalan di akhir |

### 3.5 Rekomendasi Urutan untuk Satu Developer

1. Selesaikan **P0 berurutan** sampai MVP 2 F2 (fondasi + kelas).
2. Ambil **MVP 3 F1–F4** dan **MVP 4 F3–F5** sebagai rantai nilai utama (tugas → kuis).
3. Selipkan paket modular saat menunggu: **MVP 4 F1–F2** (timeline/notifikasi) dan **MVP 5 F1–F2** (config/audit).
4. Baru kerjakan P2: rekap kehadiran, hardening per modul, monitoring.
5. MVP 5 F3–F5 hanya setelah backend tersedia.

### 3.6 Vertical Slice Pertama (Target Demo Cepat)

Urutan tipis yang membuktikan integrasi end-to-end paling awal:

```text
Login → Dasbor → Daftar Kelas → Ruang Kelas → Pertemuan → Detail Tugas → Nilai
```

Semua langkah di atas hanya membutuhkan MVP 1 F0–F3, MVP 2 F1–F2, dan MVP 3 F1–F4. Timeline, notifikasi, kuis, dan presensi dapat menyusul tanpa menghambat demo ini.

---

## 4. Konvensi Lintas MVP

### 4.1 Fondasi Tunggal (dari MVP 1 Fase 0)

| Lapisan | Lokasi target | Aturan |
|---|---|---|
| Router | `src/App.tsx`, `src/routes/` | Path-based; redirect legacy `?page=`; guard `RequireAuth`/`RequireRole` |
| HTTP | `src/services/http.ts` | Envelope `{ success, message, data, meta? }`; refresh mutex + queue; normalisasi `ApiError` |
| Server state | `src/hooks/queries`, TanStack Query | Tidak ada fetch manual di komponen baru |
| UI kit | `src/components/ui/` | Satu implementasi per komponen; token Tailwind; aksesibel |
| Form | `react-hook-form` + Zod | Skema mencerminkan aturan backend |
| Waktu | `src/lib/serverTime.ts` | Deadline/countdown memakai waktu server, bukan jam perangkat |
| Unduhan | `src/services/download.ts` | `responseType: 'blob'` + `Content-Disposition` |
| Testing | Vitest + RTL + MSW + Playwright | Setiap fase menambah test; build wajib hijau |

### 4.2 Peta Rute Final

```text
/login  /forgot-password  /reset-password  /dashboard  /profile
/admin/users  /admin/courses  /admin/classes  /admin/enrollments
/admin/config  /admin/audit-logs  /admin/monitoring
/classes  /classes/:classId
/classes/:classId/meetings/:meetingId
/classes/:classId/assignments  /classes/:classId/assignments/:assignmentId
/classes/:classId/assignments/:assignmentId/submissions
/classes/:classId/quizzes  /classes/:classId/quizzes/:quizId
/classes/:classId/quizzes/:quizId/edit
/classes/:classId/quizzes/:quizId/attempts
/quiz-attempts/:attemptId
/classes/:classId/exams  /classes/:classId/exams/:examId
/classes/:classId/exams/:examId/monitor
/classes/:classId/eligibility  /classes/:classId/grade-recap
/timeline  /notifications
/403  /404
```

**Deep-link backend yang wajib cocok:**
`/classes/:classId/assignments/:assignmentId` · `/classes/:classId/quizzes/:quizId` · `/classes/:classId/meetings/:meetingId`.

### 4.3 Matriks Peran (ringkas)

| Area | Mahasiswa | Dosen | Admin |
|---|---|---|---|
| Dasbor | kelas & tugas sendiri | kelas diampu | metrik sistem |
| Kelas | enrolled | diampu | semua |
| Materi | unduh | CRUD + unduh | read/unduh |
| Presensi | check-in + status sendiri | buka/tutup/koreksi/rekap | read |
| Tugas | kumpul + lihat nilai | CRUD + nilai | read |
| Kuis/Ujian | kerjakan + hasil sendiri | CRUD + roster + nilai esai | read |
| Enrollment/Master data | — | — | CRUD |
| Audit/Config/Monitoring | — | — | CRUD/read |

---

## 5. Cakupan Kontrak API per MVP

| MVP | Endpoint utama | Sumber |
|---|---|---|
| MVP 1 | `/auth/*`, `/profile*`, `/dashboard`, `/admin/users*`, `/admin/courses*`, `/admin/classes*`, `/admin/enrollments*`, `/admin/audit-logs*`, `/admin/config` | OpenAPI 1.4.1 |
| MVP 2 | `/classes*`, `/meetings*`, `/materials*`, `/attendance*`, `/classes/:id/attendance-recap` | OpenAPI 1.4.1 |
| MVP 3 | `/meetings/:id/assignments`, `/classes/:id/assignments`, `/assignments*`, `/submissions*` | OpenAPI 1.4.1 |
| MVP 4 | `/timeline`, `/notifications*`, `/quizzes*`, `/quiz-attempts*` | OpenAPI 1.4.1 |
| MVP 5 | `/admin/config` (ambang), `/admin/audit-logs*`, `/classes/:id/attendance-recap` | OpenAPI 1.4.1 |
| MVP 5 (usulan) | `/exams*`, `/exam-attempts*`, `/classes/:id/grade-recap*`, `/admin/monitoring` | **Belum ada — harus disepakati** |

**Larangan:** jangan memanggil endpoint yang tidak ada di OpenAPI (mis. `/api/dosen/*`). Jangan menganggap respons sukses selalu JSON untuk endpoint unduhan.

---

## 6. Backlog Gap Lintas MVP (Hasil Review)

| # | Gap | MVP | Dampak | Rencana |
|---|---|---|---|---|
| G-01 | Router query-string tidak mendukung deep-link | 1 | Notifikasi/timeline tidak dapat membuka halaman | MVP 1 Fase 0 |
| G-02 | Tidak ada guard rute; role hanya filter menu | 1 | Akses admin bocor | MVP 1 Fase 0–1 |
| G-03 | Tidak ada refresh token | 1 | Sesi mati saat token kedaluwarsa | MVP 1 Fase 0–1 |
| G-04 | Data fitur masih fixture | 1–5 | Fitur tidak dapat dipakai | Fase integrasi masing-masing |
| G-05 | Tidak ada UI kit terpusat | 1 | Duplikasi kode | MVP 1 Fase 0 |
| G-06 | Tidak ada test/typecheck | 1 | Regresi tidak terdeteksi | MVP 1 Fase 0 |
| G-07 | Frontend memanggil `/api/dosen/*` yang tidak ada | 1 | Dasbor dosen fallback | MVP 1 Fase 3 |
| G-08 | Timeline masih statis (`CentralTimeline.jsx`) | 4 | Fitur utama MVP 4 tidak ada | MVP 4 Fase 1 |
| G-09 | Tidak ada halaman/route kuis | 4 | Fitur MVP 4 tidak dapat dipakai | MVP 4 Fase 3–6 |
| G-10 | Lonceng notifikasi statis (`Header.jsx`) | 4 | Notifikasi tidak terlihat | MVP 4 Fase 2 |
| G-11 | Widget tugas hardcoded | 4 | Dasbor menyesatkan | MVP 4 Fase 2 |
| G-12 | Filter timeline tanpa preset & `course_id` | 4 | UX terbatas | Preset klien; `course_id` backlog backend |
| G-13 | Pengacakan soal belum ada | 4 | Tidak sesuai ekspektasi opsional | Backlog kontrak backend |
| G-14 | `Need Grading`/progress dasbor belum lengkap | 4 | Metrik tidak lengkap | Fallback `—`; backlog backend |
| G-15 | Endpoint ujian/gatekeeping/rekap nilai belum ada | 5 | MVP 5 tidak dapat dimulai | Menunggu backend MVP 5 |

---

## 7. Definition of Done Program (Lintas MVP)

1. Setiap halaman yang ditandai selesai **memanggil API riil** dan tidak memiliki fallback fixture tersembunyi.
2. Setiap mutasi memiliki state loading, sukses (toast), dan gagal (pesan field/global).
3. Setiap halaman menangani minimal: 400, 401, 403, 404, 409 (bila relevan), 413 (bila unggah), 500.
4. Setiap halaman responsif pada 375/768/1440 dan dapat dioperasikan dengan keyboard.
5. `npm run typecheck`, `npm run test`, `npm run build` hijau di akhir setiap fase.
6. [RTM.md](RTM.md) hanya menandai "Implemented" bila backend **dan** frontend terintegrasi; jika baru backend, tulis "Backend implemented".

---

## 8. Cara Melacak Progress

- Status per fase berada di **Bab 10.1** masing-masing dokumen, lengkap dengan kolom **Prioritas** (P0/P1/P2/⏸).
- Ringkasan prioritas, jalur kritis, dan paket modular berada di **Bab 3** dokumen ini.
- Log progress berada di **Bab 10.2** masing-masing dokumen; tambahkan satu baris per sesi kerja bermakna.
- Fase terblokir (MVP 5 Fase 3–5) tetap `⏸️` sampai endpoint tersedia; jangan menandai `🔄`.
- Setelah satu MVP selesai, perbarui tabel pada Bab 1 dokumen ini.

---

## 9. Dokumen Terkait

[PRD.md](PRD.md) · [SRS.md](SRS.md) · [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md) · [RTM.md](RTM.md) · [TEST_PLAN.md](TEST_PLAN.md) · [QA_TESTING_GUIDE.md](QA_TESTING_GUIDE.md) · [backend/docs/openapi.yaml](backend/docs/openapi.yaml)

Rencana backend: [MVP 1](IMPLEMENTATION_PLAN_MVP1_BACKEND.md) · [MVP 2](IMPLEMENTATION_PLAN_MVP2_BACKEND.md) · [MVP 3](IMPLEMENTATION_PLAN_MVP3_BACKEND.md) · [MVP 4](IMPLEMENTATION_PLAN_MVP4_BACKEND.md)

Rencana frontend: [MVP 1](IMPLEMENTATION_PLAN_MVP1_FRONTEND.md) · [MVP 2](IMPLEMENTATION_PLAN_MVP2_FRONTEND.md) · [MVP 3](IMPLEMENTATION_PLAN_MVP3_FRONTEND.md) · [MVP 4](IMPLEMENTATION_PLAN_MVP4_FRONTEND.md) · [MVP 5](IMPLEMENTATION_PLAN_MVP5_FRONTEND.md)
