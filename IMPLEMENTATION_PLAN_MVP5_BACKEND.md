# Implementation Plan: Backend MVP 5
# E-Learning Kampus (Learning Management System) Universitas
**Team Membangun Negeri — Rencana Eksekusi Teknis Backend: Evaluasi UTS/UAS, Gatekeeping Kehadiran, Rekap Nilai, Monitoring & Audit Lanjutan**

---

Dokumen ini adalah rencana eksekusi sisi **Backend** untuk **MVP 5** sesuai [SRS.md](SRS.md) (*FR-026, FR-027, FR-028, FR-042, FR-043, FR-049–FR-052, FR-055, FR-056, FR-058; BR-012; Bab 27*) dan [PRD.md](PRD.md) (*Bab 2, 3, 5, 7*). Dokumen ini melengkapi [IMPLEMENTATION_PLAN_MVP5_FRONTEND.md](IMPLEMENTATION_PLAN_MVP5_FRONTEND.md), yang sebelumnya menandai fase ujian/gatekeeping/rekap sebagai **terblokir backend**.

> **Status dokumen:** **rencana saja — belum ada implementasi.** Seluruh butir pada Bab 5 masih `⬜`. Endpoint yang diusulkan di Bab 3 **belum ada** di `backend/docs/openapi.yaml` (masih **1.4.1**) sampai fase terkait selesai dan kontrak diperbarui.

**Baseline terverifikasi saat dokumen dibuat (2026-11-28):**

- `npm test` → **327/327 lulus**, 59 suite, 0 gagal, 0 skip.
- `npx prisma validate` → valid; `prisma migrate status` → *"Database schema is up to date!"* (7 migrasi, tanpa drift).
- OpenAPI **1.4.1**; `tests/phase6.test.js` hijau.
- PR #80, #81, #82 sudah merge ke `main`. MVP 4 backend dinyatakan selesai.

Dokumen ini **melanjutkan** [IMPLEMENTATION_PLAN_MVP4_BACKEND.md](IMPLEMENTATION_PLAN_MVP4_BACKEND.md) dan mempertahankan seluruh konvensi backend yang berlaku:

- Modular Express berlapis: `routes → middlewares → controller → service → Prisma`.
- Validasi Zod melalui `validate.middleware.js`; envelope respons `apiResponse` (`success`, `message`, `data`, `meta`).
- Otorisasi terpusat di `src/utils/ownership.js` (`ensureCanManageClass`, `ensureCanReadClass`, `ensureEnrolledInClass`).
- Audit Trail via `AuditLogService.record(...)` + konstanta `AUDIT_ENTITIES`.
- Pengujian `node:test` dengan database terisolasi `rpl_review`, `--test-concurrency=1`, pembersihan artefak `TEST-`/`KAP-`.
- Kontrak OpenAPI 3.0 di `backend/docs/openapi.yaml` yang divalidasi otomatis oleh `tests/phase6.test.js`.

---

## 0. Protokol Pengerjaan & Tracking Progress (WAJIB untuk Agent)

**Aturan mutlak:** setiap agent/kontributor yang mengerjakan fase apa pun **wajib memperbarui dokumen ini** — saat mulai, saat menyelesaikan butir, dan saat fase selesai. Dokumen ini adalah satu-satunya sumber kebenaran status implementasi MVP 5 backend.

### 0.1 Legenda Status

| Simbol | Arti |
|---|---|
| ⬜ | Belum dikerjakan |
| 🔄 | Sedang dikerjakan |
| ⏸️ | Tertunda / terblokir prasyarat |
| ✅ | Selesai & terverifikasi |

### 0.2 Kewajiban Agent per Fase

1. **Sebelum mulai:**
   - Baca Bab 2 (keputusan desain) dan pastikan prasyarat fase terpenuhi.
   - Ubah status fase di Bab 8.1 menjadi `🔄` dan isi tanggal mulai.
   - Bila prasyarat belum siap, jangan dipaksakan: set `⏸️` beserta alasannya.
2. **Saat mengerjakan:**
   - Ubah butir `[ ]` → `[x]` **hanya** untuk pekerjaan yang benar-benar selesai dan sudah diuji.
   - Bila ada keputusan baru atau penyimpangan dari rencana, catat di baris log (jangan menghapus riwayat).
3. **Saat fase selesai:**
   - Jalankan pengujian yang disyaratkan fase tersebut **dan** `npm test` untuk memastikan tidak ada regresi.
   - Ubah status fase menjadi `✅`, isi tanggal selesai, hasil tes terakhir, dan hash commit.
   - Tambahkan **satu baris baru** di Bab 8.2 sesuai format acuan.
   - Fase **tidak boleh** ditandai `✅` bila masih ada butir `[ ]`, temuan `P1/P2` pada fase tersebut masih terbuka, atau ada tes yang gagal.
4. **Aturan tambahan:**
   - Jangan menghapus atau menulis ulang baris log lama; hanya menambah baris baru.
   - Seluruh kontrak baru wajib masuk `docs/openapi.yaml` **sebelum** fase dinyatakan selesai.
   - Jangan mengubah perilaku MVP 1–4 yang sudah dikonsumsi frontend; perubahan harus aditif atau didokumentasikan di Bab 9.

### 0.3 Perintah Ringkas untuk Agent

```text
SEBELUM FASE : baca Bab 2 & 8 → cek prasyarat → set status 🔄 + tanggal mulai
SETELAH FASE : jalankan tes → centang [x] → set status ✅ + hasil tes + commit
                → tambahkan satu baris baru di Bab 8.2
VERIFIKASI   : cd backend; npx prisma validate; npm test
KONTRAK      : pastikan operasi baru terdaftar di REQUIRED_OPERATIONS (tests/openapi.js)
```

---

## 1. Konteks, Ruang Lingkup & Kesiapan Fondasi

### 1.1 Ruang Lingkup

**In-scope (backend):**

1. **UTS/UAS (FR-026, FR-027, FR-042)** — dosen menyiapkan, menerbitkan, dan melaksanakan evaluasi pada Pertemuan 8 (UTS) dan Pertemuan 16 (UAS), termasuk butir soal, timer, attempt, penilaian, dan monitoring peserta.
2. **Gatekeeping kehadiran (FR-050, FR-055, FR-056, BR-012)** — sistem menghitung persentase kehadiran dan menolak akses ujian bila di bawah ambang; ambang dibaca dari `system_configs` (`attendance.threshold_percentage`, default 70).
3. **Rekap nilai akhir (FR-043)** — komponen tugas, kuis, presensi, UTS, UAS, dan nilai akhir per mahasiswa; dapat difilter per kelas/tahun akademik/semester.
4. **Progres pembelajaran (FR-028)** — indikator penyelesaian aktivitas per mahasiswa pada kelas.
5. **Ekspor (FR-043)** — rekap nilai dan roster ujian dalam `csv` (dan `xlsx` bila disetujui).
6. **Monitoring & audit lanjutan (FR-051, FR-052, FR-058)** — agregat aktivitas lintas kelas untuk Admin dan ekspor audit trail.

**Out-of-scope (tidak dikerjakan di MVP 5):**

- Forum diskusi, analitik pembelajaran lanjutan, integrasi SIA/KRS/KHS (Pengembangan Lanjutan).
- Perhitungan nilai di frontend (frontend hanya menampilkan nilai dari backend).
- Scheduler produksi untuk pengingat/penguncian ujian otomatis (tetap lazy/manual; lihat Bab 1.3).
- Penggantian mesin ujian hasil duplikasi frontend — backend tetap sumber kebenaran.

### 1.2 Kesiapan Fondasi (hasil audit kode `main`)

| Kapabilitas | Status | Bukti di kode | Dampak ke MVP 5 |
|---|---|---|---|
| Pertemuan ujian | ✅ Tersedia | `Meeting.is_exam`, `Meeting.exam_type` (`ExamType` UTS/UAS/NONE), generator `ACADEMIC.generate16Meetings()` | UTS/UAS tidak perlu tabel pertemuan baru |
| Jadwal pertemuan/ujian | ✅ Tersedia | `Meeting.scheduled_at`, OpenAPI 1.4.1, seed idempoten, timeline `MEETING`/`EXAM` | Timeline ujian dapat langsung dipakai |
| Ambang kehadiran global | ✅ Tersedia | `SystemConfig` + `ConfigService.getAttendanceThreshold()`, `GET/PUT /api/admin/config` | Gatekeeping memakai konfigurasi yang sama (FR-050) |
| Rekap kehadiran per kelas | ✅ Tersedia | `AttendanceService.getClassRecap()` — `GET /api/classes/:classId/attendance-recap` | Eligibility dapat menumpang perhitungan yang sama |
| Mesin kuis (soal, timer, attempt, penilaian) | ✅ Tersedia | `Quiz`, `QuizQuestion`, `QuizOption`, `QuizAttempt`, `QuizAnswer`; `mvp4-phase3/4` | UTS/UAS memakai mesin yang sama, bukan duplikasi |
| Audit trail | ✅ Tersedia | `AuditLogService`, `GET /api/admin/audit-logs[/:id]`, `AUDIT_ENTITIES` | Monitoring & ekspor audit tinggal menambah agregasi/ekspor |
| Notifikasi internal | ✅ Tersedia | `Notification`, template + deep-link, `mvp4-phase5` | Notifikasi ujian dapat ditambahkan aditif |
| Endpoint ujian, eligibility, rekap nilai, ekspor nilai, monitoring | ❌ Belum ada | Tidak ada di OpenAPI 1.4.1 | Seluruh ruang lingkup MVP 5 backend |
| Ambang kehadiran pada respons kelas | ⚠️ Perlu perbaikan | `user-classes.service.js` memakai `ACADEMIC.DEFAULT_ATTENDANCE_THRESHOLD` hardcoded (70), bukan `ConfigService` | Perbaiki di Fase 0 agar FR-050 konsisten end-to-end |

### 1.3 Keterbatasan MVP 4 yang Diterima (tidak boleh menjadi regresi)

| Keterbatasan | Perilaku saat ini | Sikap MVP 5 |
|---|---|---|
| Throttle pengingat in-memory | Materialisasi deadline maksimal sekali per 60 detik **per proses**; multi-instance dapat berjalan lebih sering | Diterima; dokumentasikan. Bila scheduler ditambahkan, jadikan pekerjaan terpisah |
| Dedupe berbasis `updated_at` | `grade:<submissionId>:<ISO>`; perubahan pada milidetik yang sama dapat terdedupe | Diterima; tetap pertahankan pola yang sama untuk notifikasi ujian |
| Pengingat lazy tanpa scheduler | Pengingat dibuat saat notifikasi dibaca, bukan oleh cron | Diterima; ujian **tidak** boleh bergantung pada scheduler untuk gatekeeping (gatekeeping selalu dievaluasi on-request) |
| Transport email `log` | Diizinkan eksplisit dengan `console.warn`; default produksi `smtp` + fail-fast | Tidak diubah; jangan pernah menurunkan pengaman ini |

### 1.4 Gap Analysis terhadap Kebutuhan SRS

| Kebutuhan | Kondisi saat ini | Gap yang ditutup |
|---|---|---|
| FR-026 / FR-027 | Belum ada akses ujian maupun validasi kehadiran | Endpoint eligibility + penolakan start attempt |
| FR-028 | Belum ada indikator progres | Endpoint `progress` per kelas |
| FR-042 | Kuis reguler ada, ujian belum dapat dikelola | CRUD ujian, publish, soal, monitoring |
| FR-043 | Rekap presensi ada, nilai akhir belum | `grade-recap` + ekspor |
| FR-050 | Konfigurasi ambang ada, tetapi respons kelas masih hardcoded 70 | Konsumsi `ConfigService` di seluruh jalur gatekeeping & respons kelas |
| FR-051 | Dashboard hanya agregat Admin | `GET /api/admin/monitoring` lintas kelas |
| FR-052 / FR-058 | Audit list/detail ada | Ekspor audit + pastikan mutasi ujian/nilai tercatat |
| FR-055 / FR-056 | Persentase kehadiran ada di rekap | Sampling persentase yang sama dipakai gatekeeping; tombol ujian ditolak server |
| BR-012 | Belum ditegakkan | Gatekeeping wajib di service, bukan hanya UI |

---

## 2. Keputusan Desain (Architecture Decisions)

1. **UTS/UAS memakai mesin kuis yang sudah ada.**
   Tambahkan enum `AssessmentType { QUIZ, UTS, UAS }` dan kolom `Quiz.assessment_type` (default `QUIZ`). Dengan demikian timer, autosave, submit, auto-submit, penilaian PG/esai, roster, dan audit dapat dipakai ulang. **Tidak** membuat tabel `Exam`/`ExamAttempt` baru — duplikasi mesin ujian ditolak karena berisiko divergensi aturan penilaian.

2. **Jenis ujian diturunkan dari pertemuan, bukan input bebas.**
   `POST /api/meetings/:meetingId/exams` hanya boleh pada pertemuan dengan `is_exam = true`. `assessment_type` diisi dari `meeting.exam_type` (`UTS` untuk P-8, `UAS` untuk P-16). Satu kelas hanya boleh memiliki satu UTS dan satu UAS, ditegakkan di service (`409`).

3. **Gatekeeping adalah keputusan server, fail-closed.**
   Eligibility dihitung di service dari data presensi dan konfigurasi. Endpoint attempt ujian **selalu** memeriksa ulang eligibility; kegagalan/ketiadaan data diperlakukan sebagai **tidak eligible**. Frontend hanya menampilkan hasil.

4. **Ambang tunggal dari `SystemConfig`.**
   Semua jalur (eligibility, respons kelas, rekap nilai) membaca `ConfigService.getAttendanceThreshold()`. Hardcode `ACADEMIC.DEFAULT_ATTENDANCE_THRESHOLD` pada `user-classes.service.js` dihapus; konstanta tetap menjadi nilai default bila baris konfigurasi tidak ada.

5. **Cakupan sesi untuk eligibility.**
   - UTS: sesi presensi **sebelum** Pertemuan 8 (P-1..P-7).
   - UAS: sesi presensi **sebelum** Pertemuan 16 (P-1..P-15), mengecualikan sesi pertemuan ujian.
   - Denomitor = sesi yang pernah dibuka dosen (`total_sessions`), konsisten dengan rekap presensi MVP 2.
   - Bila belum ada sesi: `attendance_percentage = 0`, `eligible = false`, `reason = "Belum ada sesi presensi"` (kecuali ambang 0).

6. **Kebijakan bobot nilai akhir terpusat di konstanta akademik.**
   `GRADE_WEIGHTS = { assignment: 30, quiz: 20, attendance: 10, uts: 20, uas: 20 }` (total 100) di `src/constants/academic.js`. Tidak menambah kolom bobot pada `Quiz`/`Exam`; bila kelak bobot perlu dikonfigurasi, dibuat pekerjaan terpisah dengan migrasi dan persetujuan produk.

7. **Komponen nilai yang belum ada wajib eksplisit.**
   `components.assignment` = rata-rata berbobot `Assignment.weight_percentage` dari submission yang sudah dinilai; `components.quiz` = rata-rata skor kuis terbit; `components.attendance` = persentase kehadiran; `components.uts`/`uas` = skor attempt ujian. Bila tidak ada aktivitas terkait, komponen bernilai `null`; `final_score` bernilai `null` dan `is_complete = false` — **tidak** diisi 0 secara diam-diam. Bila aktivitas ada tetapi mahasiswa tidak mengumpulkan, komponen bernilai `0`.

8. **Ekspor adalah streaming read-only.**
   `csv` dihasilkan native (UTF-8 + BOM, escaping RFC 4180). `xlsx` memakai library `exceljs` **hanya jika** dependensi disetujui pada Fase 0; bila belum, endpoint mengembalikan `400 format xlsx belum tersedia`. Ekspor tidak pernah memutasi data dan dibatasi jumlah baris (mis. 10.000) untuk mencegah beban tak terbatas.

9. **Monitoring Admin bersifat agregasi read-only.**
   `GET /api/admin/monitoring` menghitung metrik dari tabel yang ada (kelas, enrollment, tugas, submission, kuis, ujian, presensi) dan feed aktivitas dari `audit_logs`. Tidak ada tabel materialized view pada MVP 5; optimasi indeks dicatat sebagai risiko.

10. **Kontrak baru aditif dan terpusat di OpenAPI.**
    Endpoint `exams`/`exam-attempts` adalah pembungkus tipis yang mendelegasikan ke service kuis; endpoint kuis lama tetap berfungsi. OpenAPI naik dari `1.4.1` → **`1.5.0`**, dan `REQUIRED_OPERATIONS` di `tests/openapi.js` wajib diperbarui agar coverage dua arah tetap hijau.

11. **Notifikasi ujian memakai mesin notifikasi yang sama.**
    Tambahkan `NotificationType.EXAM_PUBLISHED`; publish ujian mengirim notifikasi ber-deep-link `/classes/:classId/exams/:examId` dengan dedupe `exam:<examId>:published`. Nilai ujian dirilis memakai `GRADE_PUBLISHED` yang sudah ada.

---

## 3. Spesifikasi Teknis

### 3.1 Skema Database & Migrasi (Fase 0)

**Perubahan skema (satu migrasi):**

```prisma
enum AssessmentType {
  QUIZ
  UTS
  UAS
}

model Quiz {
  // ... field yang ada
  assessment_type AssessmentType @default(QUIZ)
  @@index([assessment_type])
}

enum NotificationType {
  // ... nilai yang ada
  EXAM_PUBLISHED
}
```

- Nama migrasi: `add_elearning_mvp5_exam_assessment_type`.
- Migrasi bersifat **aditif**; seluruh baris `quizzes` lama otomatis `QUIZ`.
- Tidak ada tabel baru. Rekap nilai dan progres dihitung dari data yang ada.
- Terapkan ke `rpl_lms` (operasional) dan `rpl_review` (uji); catat di README/ops.

**Langkah:**

- [ ] Tambahkan `AssessmentType`, `Quiz.assessment_type`, indeks, dan `NotificationType.EXAM_PUBLISHED` pada `prisma/schema.prisma`.
- [ ] Buat migrasi `add_elearning_mvp5_exam_assessment_type`; verifikasi `npx prisma migrate status` tanpa drift.
- [ ] Tambahkan `GRADE_WEIGHTS`, `EXAM_MEETING_NUMBERS`, dan helper komponen nilai pada `src/constants/academic.js`.
- [ ] Perbarui `prisma/seed.js` bila perlu (tidak wajib: kuis demo tetap `QUIZ`).

### 3.2 Konfigurasi & Perhitungan Eligibility (Fase 0)

**Modul baru:** `src/modules/exams/examEligibility.service.js` (fungsi murni + query Prisma).

**Fungsi murni yang wajib diuji tanpa database:**

```text
computeEligibility({ attended, totalSessions, thresholdPercentage })
  → { attendance_percentage, threshold_percentage, eligible, reason,
      sessions_needed, shortfall_percentage }
```

**Aturan:**

- `attendance_percentage = totalSessions > 0 ? round2(attended / totalSessions * 100) : 0`.
- `eligible = totalSessions > 0 && attendance_percentage >= threshold_percentage` (batas inklusif).
- `sessions_needed = max(0, ceil(thresholdPercentage / 100 * totalSessions) - attended)`.
- `reason`: `null` bila eligible; `"Belum ada sesi presensi"` bila `totalSessions = 0`; `"Persentase kehadiran di bawah ambang batas"` bila tidak eligible.
- Status yang dihitung **HADIR**; `SAKIT`/`IZIN`/`ALPA` tidak menambah kehadiran (sesuai BR-012 & rekap MVP 2).
- Query sesi dibatasi pada kelas dan `meeting_number < exam.meeting_number`, `meeting.is_exam = false`.

**Langkah:**

- [ ] Implementasikan `computeEligibility` murni + `getExamEligibility({ user, classId, examId })`.
- [ ] Ganti hardcode ambang di `src/modules/classes/user-classes.service.js` dengan `ConfigService.getAttendanceThreshold()`.
- [ ] Pastikan `GET /api/classes/:classId` dan `GET /api/classes/:classId/meetings` menampilkan `attendance_required_percentage` dari konfigurasi (bukan 70 statis).
- [ ] Tambahkan unit test batas `69.99 / 70.00 / 70.01`, `totalSessions = 0`, dan ambang 0/100.
- [ ] Dokumentasikan rumus pada komentar service dan Bab 9.

### 3.3 Manajemen UTS/UAS (Fase 1)

**Endpoint (dipasang pada `app.js`):**

| Method | Endpoint | Peran | Perilaku |
|---|---|---|---|
| `GET` | `/api/classes/:classId/exams` | Mahasiswa (enrolled), Dosen (pengampu), Admin | Daftar UTS/UAS kelas + `eligibility` ringkas untuk mahasiswa |
| `POST` | `/api/meetings/:meetingId/exams` | Dosen (pengampu), Admin | Buat ujian; hanya P-8/P-16; `assessment_type` dari `meeting.exam_type` |
| `GET` | `/api/exams/:id` | Mahasiswa, Dosen, Admin | Detail ujian (kunci jawaban tidak dikirim ke mahasiswa) |
| `PUT` | `/api/exams/:id` | Dosen, Admin | Ubah metadata/jendela waktu/durasi |
| `DELETE` | `/api/exams/:id` | Dosen, Admin | Hapus ujian bila belum ada attempt |
| `PATCH` | `/api/exams/:id/publish` | Dosen, Admin | Publikasi/nonaktifkan + notifikasi `EXAM_PUBLISHED` |
| `POST` | `/api/exams/:id/questions` | Dosen, Admin | Tambah butir soal (reuse logika kuis) |
| `PUT` | `/api/exams/:id/questions/:questionId` | Dosen, Admin | Ubah butir soal |
| `DELETE` | `/api/exams/:id/questions/:questionId` | Dosen, Admin | Hapus butir soal |

**Payload create:**

```json
{
  "title": "UTS Pemrograman Web",
  "instructions": "Kerjakan seluruh soal...",
  "duration_minutes": 90,
  "open_at": "2026-11-20T08:00:00+07:00",
  "close_at": "2026-11-20T10:00:00+07:00",
  "is_published": false
}
```

**Validasi & aturan:**

- Pertemuan harus ada, `is_exam = true`, dan `exam_type ∈ {UTS, UAS}`; selain itu `400`.
- `duration_minutes` 1–300; `open_at < close_at`; jendela waktu tidak boleh melewati `scheduled_at` pertemuan? **Tidak** dibatasi pada MVP 5 (dosen boleh menjadwalkan ulang), tetapi dicatat di audit.
- Satu ujian per `(class, assessment_type)` → `409` *"UTS/UAS untuk kelas ini sudah ada"*.
- Publish hanya bila memiliki minimal satu soal; selain itu `400`.
- Seluruh mutasi mencatat audit: `CREATE_EXAM`, `UPDATE_EXAM`, `DELETE_EXAM`, `PUBLISH_EXAM`, `CREATE_EXAM_QUESTION`, `UPDATE_EXAM_QUESTION`, `DELETE_EXAM_QUESTION`.
- Kuis reguler tetap **tidak boleh** dibuat pada pertemuan ujian (perilaku MVP 4 dipertahankan); ujian memakai endpoint `exams`.

**Langkah:**

- [ ] Tambahkan `AUDIT_ENTITIES.EXAM` dan konstanta aksi terkait.
- [ ] Buat `src/modules/exams/exam.service.js` yang mendelegasikan ke `QuizService` dengan penguncian `assessment_type` & pengecekan pertemuan.
- [ ] Buat DTO Zod (`exam.dto.js`) untuk create/update/publish/soal.
- [ ] Buat route/controller dengan RBAC + ownership yang sama seperti kuis.
- [ ] Tambahkan notifikasi `EXAM_PUBLISHED` (dedupe per ujian).
- [ ] Perbarui OpenAPI + `REQUIRED_OPERATIONS`.
- [ ] Tes integrasi CRUD, RBAC, validasi pertemuan, duplikasi, publish tanpa soal, dan audit.

### 3.4 Gatekeeping & Pelaksanaan Ujian (Fase 2)

**Endpoint:**

| Method | Endpoint | Peran | Perilaku |
|---|---|---|---|
| `GET` | `/api/classes/:classId/exams/:examId/eligibility` | Mahasiswa (own), Dosen, Admin | `{ eligible, attendance_percentage, threshold_percentage, attended, total_sessions, sessions_needed, shortfall_percentage, reason }` |
| `POST` | `/api/exams/:id/attempts` | Mahasiswa (enrolled) | Buat/lanjutkan attempt; **403 fail-closed** bila tidak eligible |
| `GET` | `/api/exams/:id/attempts` | Dosen, Admin | Roster/monitoring seluruh mahasiswa (termasuk `NOT_STARTED`) + sisa waktu |
| `GET` | `/api/exams/:id/attempts/export` | Dosen, Admin | CSV roster ujian |
| `GET` | `/api/exam-attempts/:attemptId` | Mahasiswa (own), Dosen, Admin | Detail attempt + jawaban |
| `PUT` | `/api/exam-attempts/:attemptId/answers` | Mahasiswa (own) | Simpan jawaban parsial (autosave) |
| `POST` | `/api/exam-attempts/:attemptId/submit` | Mahasiswa (own) | Submit; PG dinilai otomatis, esai menunggu dosen |
| `PUT` | `/api/exam-attempts/:attemptId/grade` | Dosen, Admin | Nilai esai (poin + feedback) |

**Aturan gatekeeping:**

- Diperiksa **sebelum** attempt dibuat dan **sebelum** melanjutkan attempt `IN_PROGRESS`.
- Respons `403` memakai envelope standar dengan `message` yang dapat ditampilkan:
  *"Akses ujian terkunci. Persentase kehadiran Anda (60%) tidak memenuhi ambang batas minimum (70%)"*.
- `data` menyertakan objek eligibility agar frontend tidak perlu menghitung ulang.
- Perubahan ambang oleh Admin langsung memengaruhi request berikutnya (tanpa cache lintas request).
- Mahasiswa non-enrolled → `403`; ujian draft → `404` untuk mahasiswa.

**Perilaku attempt (reuse mesin kuis):**

- `deadline_at = min(now + duration, close_at)` dihitung server; timer tidak dapat dimanipulasi klien.
- Auto-submit lazy saat `deadline_at` lewat (konsisten dengan MVP 4).
- `P2002` pada start paralel ditangani (baca ulang attempt; audit sekali).
- Skor dihitung dari total poin seluruh soal; esai kosong tetap dinilai 0 saat dosen menilai (R-01 dipertahankan).
- Roster memuat `NOT_STARTED` dan `eligible` per mahasiswa.
- Audit: `START_EXAM_ATTEMPT`, `SUBMIT_EXAM_ATTEMPT`, `GRADE_EXAM_ATTEMPT`.

**Langkah:**

- [ ] Buat `examAttempt.service.js` sebagai delegasi `QuizAttemptService` dengan `assessment_type` terverifikasi dan gatekeeping.
- [ ] Tambahkan penolakan eligibility pada start/lanjutkan attempt.
- [ ] Buat endpoint eligibility + roster/export/monitoring.
- [ ] Pastikan `exam-attempts` tidak dapat dipakai untuk kuis reguler dan sebaliknya (cek `assessment_type`).
- [ ] Tambahkan tes: eligible 70.00 tepat, 69.99 ditolak, 0 sesi ditolak, ambang diubah Admin, attempt paralel, autosave, submit, grading esai, RBAC, audit.
- [ ] Perbarui OpenAPI + `REQUIRED_OPERATIONS`.

### 3.5 Rekap Nilai, Progres & Ekspor (Fase 3)

**Endpoint:**

| Method | Endpoint | Peran | Perilaku |
|---|---|---|---|
| `GET` | `/api/classes/:classId/grade-recap` | Mahasiswa (own), Dosen, Admin | Komponen + nilai akhir + eligibility UTS/UAS per mahasiswa |
| `GET` | `/api/classes/:classId/grade-recap/export?format=csv\|xlsx` | Dosen, Admin | Unduh rekap; `Content-Disposition` sesuai format |
| `GET` | `/api/classes/:classId/progress` | Mahasiswa (own), Dosen, Admin | Progres aktivitas per mahasiswa |

**Respons `grade-recap` (ringkas):**

```json
{
  "class_id": "...",
  "academic_year": "2026/2027",
  "semester": "ganjil",
  "weights": { "assignment": 30, "quiz": 20, "attendance": 10, "uts": 20, "uas": 20 },
  "items": [
    {
      "student_id": "...",
      "nim": "2024001001",
      "full_name": "...",
      "components": { "assignment": 85.0, "quiz": 78.5, "attendance": 71.43, "uts": 80.0, "uas": null },
      "final_score": null,
      "is_complete": false,
      "eligibility": {
        "uts": { "eligible": true, "attendance_percentage": 71.43, "threshold_percentage": 70 },
        "uas": { "eligible": false, "attendance_percentage": 71.43, "threshold_percentage": 70 }
      }
    }
  ],
  "meta": { "total_students": 10, "generated_at": "...", "server_time": "..." }
}
```

**Aturan komponen (lihat Keputusan 7):**

- `assignment` = `Σ(score × weight_percentage) / Σ(weight_percentage)` untuk submission berstatus dinilai; hanya tugas `is_published = true`.
- `quiz` = rata-rata `QuizAttempt.score` untuk kuis `is_published = true` dan `assessment_type = QUIZ`; attempt belum dinilai (esai) membuat komponen `null` hingga selesai dinilai.
- `attendance` = persentase HADIR dari sesi yang pernah dibuka (sama dengan rekap MVP 2).
- `uts` / `uas` = `score` attempt ujian; `null` bila belum ada attempt/nilai.
- `final_score = Σ(component × weight) / 100` bila **seluruh** komponen non-null; selain itu `null`.
- Nilai dibulatkan 2 desimal (`round2`), konsisten dengan kuis.

**Progres (`progress`):**

```json
{
  "items": [
    {
      "student_id": "...",
      "nim": "...",
      "progress": {
        "attendance": { "completed": 5, "total": 7, "percentage": 71.43 },
        "assignments": { "completed": 3, "total": 4, "percentage": 75.0 },
        "quizzes": { "completed": 2, "total": 3, "percentage": 66.67 },
        "exams": { "completed": 1, "total": 2, "percentage": 50.0 }
      },
      "overall_percentage": 66.67
    }
  ]
}
```

- "completed" = ada kehadiran / submission / attempt; "total" = aktivitas terbit yang relevan.
- Tidak ada pelacakan "materi dibaca" pada MVP 5; progres materi ditandai `null` dan dijelaskan di handoff.
- Mahasiswa hanya menerima barisnya sendiri (BR-003).

**Ekspor:**

- CSV: header `NIM,Nama,Tugas,Kuis,Presensi,UTS,UAS,Nilai Akhir,Eligible UTS,Eligible UAS`.
- Nilai kosong ditulis `—` atau sel kosong yang konsisten; jangan menulis `0` untuk data yang belum ada.
- `xlsx`: gunakan `exceljs` bila dependensi disetujui; jika tidak, `400`.
- Nama file: `rekap-nilai-<kode-kelas>-<tahun>-<semester>.csv`.
- Audit ekspor tidak wajib (read-only), tetapi dicatat pada log aplikasi.

**Langkah:**

- [ ] Implementasikan `gradeRecap.service.js` dengan query agregat terbatas pada kelas.
- [ ] Implementasikan `progress.service.js` (reuse rekap/presensi/attempt).
- [ ] Implementasikan ekspor CSV (+ XLSX bila disetujui) dengan streaming.
- [ ] Tambahkan tes: bobot tugas tidak 100%, submission belum dinilai, esai belum dinilai, mahasiswa tanpa submission, kelas tanpa aktivitas, RBAC, format CSV, filter akademik.
- [ ] Perbarui OpenAPI + `REQUIRED_OPERATIONS`.

### 3.6 Monitoring Admin & Audit Lanjutan (Fase 4)

**Endpoint:**

| Method | Endpoint | Peran | Perilaku |
|---|---|---|---|
| `GET` | `/api/admin/monitoring?academic_year&semester&page&limit` | Admin | Agregat lintas kelas + tabel kelas + at-risk students |
| `GET` | `/api/admin/audit-logs/export?format=csv` | Admin | Ekspor audit dengan filter yang sama seperti list |

**Respons monitoring (ringkas):**

```json
{
  "summary": {
    "total_classes": 2,
    "total_students": 10,
    "total_lecturers": 3,
    "active_assignments": 6,
    "published_quizzes": 4,
    "published_exams": 2,
    "submission_rate": 68.5,
    "quiz_completion_rate": 55.0,
    "exam_completion_rate": 40.0,
    "average_attendance_percentage": 71.2,
    "at_risk_students": 3
  },
  "classes": [
    { "class_id": "...", "course": "TIF101", "class_name": "TI-A", "lecturer": "...",
      "enrolled": 10, "submission_rate": 70.0, "average_attendance": 72.1, "at_risk": 1 }
  ],
  "recent_activity": [ { "action": "...", "entity": "...", "created_at": "..." } ],
  "meta": { "page": 1, "limit": 20, "total": 2, "server_time": "..." }
}
```

**Aturan:**

- Read-only; hanya Admin.
- `at_risk` = mahasiswa dengan persentase kehadiran < ambang konfigurasi.
- Feed aktivitas diambil dari `audit_logs` (maks. 20 terbaru, field sensitif disaring).
- Ekspor audit menghormati filter list, maks. 10.000 baris, `text/csv` + BOM.
- Tidak ada endpoint mutasi baru di fase ini.

**Langkah:**

- [ ] Implementasikan `monitoring.service.js` (agregasi + paginasi kelas).
- [ ] Implementasikan `audit-log.controller.export` + streaming CSV.
- [ ] Tambahkan tes: RBAC non-admin 403, filter akademik, metrik konsisten dengan data uji, ekspor audit, tanpa kebocoran field sensitif.
- [ ] Perbarui OpenAPI + `REQUIRED_OPERATIONS`.

### 3.7 OpenAPI & Kontrak

- Naikkan versi `docs/openapi.yaml` menjadi **1.5.0**.
- Daftarkan seluruh operasi baru pada `REQUIRED_OPERATIONS` dan `PUBLIC_OPERATIONS` (bila ada) di `tests/openapi.js`.
- Setiap operasi mutasi wajib memiliki `requestBody` + skema Zod yang sesuai.
- Skema respons baru: `ExamSummary`, `ExamDetail`, `ExamEligibility`, `ExamAttempt`, `GradeRecap`, `StudentProgress`, `AdminMonitoring`.
- Semua endpoint non-publik mendeklarasikan `security: bearerAuth`.
- `phase6.test.js` wajib hijau tanpa perubahan asersi yang melemahkan cakupan.

---

## 4. Struktur Berkas yang Tersentuh

| Area | Berkas | Fase |
|---|---|---|
| Skema | `backend/prisma/schema.prisma`, `backend/prisma/migrations/*` | 0 |
| Konstanta | `backend/src/constants/academic.js`, `backend/src/constants/auditEntities.js` | 0–1 |
| Eligibility | `backend/src/modules/exams/examEligibility.service.js` | 0 |
| Ujian | `backend/src/modules/exams/exam.service.js`, `exam.controller.js`, `exam.routes.js`, `exam.dto.js` | 1 |
| Attempt ujian | `backend/src/modules/exams/examAttempt.service.js`, `examAttempt.controller.js`, `examAttempt.dto.js` | 2 |
| Rekap/progres | `backend/src/modules/exams/gradeRecap.service.js`, `progress.service.js`, `export.service.js` | 3 |
| Monitoring | `backend/src/modules/monitoring/monitoring.service.js`, `monitoring.controller.js`, `monitoring.routes.js` | 4 |
| Audit | `backend/src/modules/audit-log/audit-log.controller.js`, `audit-log.routes.js`, `audit-log.service.js` | 4 |
| Notifikasi | `backend/src/modules/notifications/notification.templates.js`, pemanggil exam service | 1 |
| Kelas | `backend/src/modules/classes/user-classes.service.js` | 0 |
| App | `backend/src/app.js` | 1–4 |
| Dokumentasi | `backend/docs/openapi.yaml`, `backend/README.md`, `README.md`, `RTM.md`, `TEST_PLAN.md` | 5 |
| Tes | `backend/tests/mvp5-phase0..5.test.js`, `backend/tests/openapi.js`, `backend/tests/phase6.test.js` | 0–5 |

---

## 5. Tahapan Eksekusi (Roadmap)

**Aturan pokok:**

- **Sekuensial (wajib urut):** `Fase 0 → Fase 1 → Fase 2 → Fase 3 → Fase 4 → Fase 5`.
- **Fase 0 adalah prasyarat teknis** untuk seluruh fase lain (skema, konstanta, eligibility murni).
- **Fase 1 dan Fase 2 adalah inti MVP 5** dan menjadi gerbang "ujian dapat dilaksanakan".
- **Fase 3 dan Fase 4** boleh dipecah per PR setelah Fase 2 stabil, tetapi tidak boleh ditandai `✅` sebelum kontrak OpenAPI-nya diperbarui.
- **Fase 5 selalu terakhir** karena memvalidasi regresi, OpenAPI, dan handoff.

| Fase | Sifat | Prasyarat | Isi |
|---|---|---|---|
| 0 — Skema & Eligibility | Sekuensial | MVP 4 selesai | `AssessmentType`, migrasi, `GRADE_WEIGHTS`, `computeEligibility`, konsumsi `ConfigService` |
| 1 — Manajemen Ujian | Sekuensial | Fase 0 | CRUD ujian, soal, publish, notifikasi, audit |
| 2 — Gatekeeping & Pelaksanaan | Sekuensial | Fase 1 | Eligibility endpoint, start/submit/grade, roster, auto-submit, concurrency |
| 3 — Rekap Nilai, Progres & Ekspor | Sekuensial | Fase 2 | `grade-recap`, `progress`, CSV/XLSX |
| 4 — Monitoring Admin & Audit | Paralel dengan 3 (opsional) | Fase 2 | `admin/monitoring`, ekspor audit |
| 5 — Regresi, Kontrak & Handoff | Sekuensial (penutup) | Fase 0–4 | Tes penuh, OpenAPI 1.5.0, RTM/TEST_PLAN, handoff |

---

### Fase 0: Skema, Konfigurasi & Eligibility (⬜)

**Mulai:** — **Selesai:** —

- [ ] Tambahkan `AssessmentType`, `Quiz.assessment_type`, indeks, dan `NotificationType.EXAM_PUBLISHED`.
- [ ] Buat migrasi `add_elearning_mvp5_exam_assessment_type`; verifikasi tanpa drift.
- [ ] Tambahkan `GRADE_WEIGHTS` + helper komponen nilai di `constants/academic.js`.
- [ ] Implementasikan `computeEligibility` murni + `getExamEligibility`.
- [ ] Ganti hardcode ambang 70 di `user-classes.service.js` dengan `ConfigService.getAttendanceThreshold()`.
- [ ] Tambahkan `mvp5-phase0.test.js`: batas 69.99/70.00/70.01, 0 sesi, ambang 0/100, respons kelas mengikuti config.
- [ ] Jalankan `npm test` → tidak ada regresi MVP 1–4.

**Definition of Done fase:** skema termigrasi tanpa drift; eligibility dapat diuji sebagai fungsi murni; tidak ada lagi jalur yang memakai ambang hardcoded.

---

### Fase 1: Manajemen UTS/UAS (⬜)

**Mulai:** — **Selesai:** —

- [ ] Tambahkan `AUDIT_ENTITIES.EXAM` + aksi audit ujian/soal.
- [ ] Implementasikan `exam.service.js` (delegasi kuis, validasi P-8/P-16, satu UTS/UAS per kelas).
- [ ] Buat DTO, controller, dan route `/classes/:classId/exams`, `/meetings/:meetingId/exams`, `/exams/:id`, publish, dan soal.
- [ ] Tambahkan notifikasi `EXAM_PUBLISHED` ber-deep-link + dedupe.
- [ ] Perbarui OpenAPI 1.5.0 (operasi ujian) + `REQUIRED_OPERATIONS`.
- [ ] Tambahkan `mvp5-phase1.test.js`: CRUD, RBAC, pertemuan salah, duplikasi, publish tanpa soal, audit, notifikasi.
- [ ] Jalankan `npm test`.

**Definition of Done fase:** dosen dapat membuat, menyunting, menerbitkan, dan menghapus ujian beserta soalnya; seluruh mutasi tercatat dan terdokumentasi.

---

### Fase 2: Gatekeeping & Pelaksanaan Ujian (⬜)

**Mulai:** — **Selesai:** —

- [ ] Implementasikan endpoint eligibility per kelas/ujian.
- [ ] Implementasikan start/lanjutkan attempt dengan penolakan `403` fail-closed.
- [ ] Implementasikan autosave, submit, auto-submit, dan penilaian esai (reuse kuis).
- [ ] Implementasikan roster/monitoring ujian (`NOT_STARTED`, sisa waktu) + ekspor CSV.
- [ ] Tangani `P2002` start paralel dan audit sekali.
- [ ] Perbarui OpenAPI + `REQUIRED_OPERATIONS`.
- [ ] Tambahkan `mvp5-phase2.test.js`: eligible tepat batas, di bawah ambang, 0 sesi, perubahan ambang, paralel, autosave, submit, grading, RBAC, audit.
- [ ] Jalankan `npm test`.

**Definition of Done fase:** tidak ada request start ujian yang lolos tanpa eligibility server; ujian dapat dikerjakan dan dinilai end-to-end.

---

### Fase 3: Rekap Nilai, Progres & Ekspor (⬜)

**Mulai:** — **Selesai:** —

- [ ] Implementasikan `gradeRecap.service.js` (komponen, bobot, `null` eksplisit, eligibility).
- [ ] Implementasikan `progress.service.js`.
- [ ] Implementasikan ekspor CSV (dan XLSX bila dependensi disetujui).
- [ ] Perbarui OpenAPI + `REQUIRED_OPERATIONS`.
- [ ] Tambahkan `mvp5-phase3.test.js`: bobot tugas, submission belum dinilai, esai belum dinilai, mahasiswa tanpa aktivitas, filter akademik, RBAC, format ekspor.
- [ ] Jalankan `npm test`.

**Definition of Done fase:** nilai akhir hanya dikirim backend, dapat diaudit komponennya, dan dapat diekspor tanpa data palsu.

---

### Fase 4: Monitoring Admin & Audit Lanjutan (⬜)

**Mulai:** — **Selesai:** —

- [ ] Implementasikan `GET /api/admin/monitoring` (agregat + paginasi + at-risk).
- [ ] Implementasikan ekspor audit CSV dengan filter yang sama seperti list.
- [ ] Pastikan tidak ada field sensitif (hash/token) pada respons dan ekspor.
- [ ] Perbarui OpenAPI + `REQUIRED_OPERATIONS`.
- [ ] Tambahkan `mvp5-phase4.test.js`: RBAC, filter, konsistensi metrik, ekspor, penyaringan field.
- [ ] Jalankan `npm test`.

**Definition of Done fase:** Admin dapat memantau aktivitas lintas kelas dan mengekspor audit tanpa membebani jalur transaksi.

---

### Fase 5: Regresi, Kontrak & Handoff (⬜)

**Mulai:** — **Selesai:** —

- [ ] Jalankan `npm test` penuh dan catat jumlah akhir (target: baseline 327 + tes baru, 0 gagal).
- [ ] Jalankan `npx prisma validate` dan `prisma migrate status`; pastikan tanpa drift.
- [ ] Finalisasi OpenAPI **1.5.0** dan pastikan `tests/phase6.test.js` hijau.
- [ ] Sinkronkan `RTM.md` (FR-026/027/028/042/043/051/055/056/058, BR-012) dan `TEST_PLAN.md`.
- [ ] Perbarui `README.md` root & `backend/README.md` (status MVP 5 selesai, migrasi baru, endpoint).
- [ ] Tulis ringkasan handoff frontend pada Bab 9.
- [ ] Perbarui tabel status 8.1 dan tambahkan baris log 8.2.

---

## 6. Rencana Pengujian (Test Matrix)

| Tes | Berkas | Skenario | Ekspektasi |
|---|---|---|---|
| T5-01 | `mvp5-phase0.test.js` | Kehadiran 69.99% vs ambang 70% | `eligible=false`, `reason` terisi |
| T5-02 | `mvp5-phase0.test.js` | Kehadiran tepat 70.00% | `eligible=true` (batas inklusif) |
| T5-03 | `mvp5-phase0.test.js` | Belum ada sesi presensi | `eligible=false`, `reason="Belum ada sesi presensi"` |
| T5-04 | `mvp5-phase0.test.js` | Ambang diubah Admin ke 60% | Eligibility & respons kelas mengikuti 60% |
| T5-05 | `mvp5-phase1.test.js` | Buat ujian pada P-8/P-16 | 201, `assessment_type` UTS/UAS |
| T5-06 | `mvp5-phase1.test.js` | Buat ujian pada pertemuan reguler | 400 |
| T5-07 | `mvp5-phase1.test.js` | Dua UTS pada kelas yang sama | 409 |
| T5-08 | `mvp5-phase1.test.js` | Publish tanpa soal | 400 |
| T5-09 | `mvp5-phase1.test.js` | Dosen non-pengampu / mahasiswa mengelola ujian | 403 |
| T5-10 | `mvp5-phase1.test.js` | Publish ujian | Notifikasi `EXAM_PUBLISHED` + deep-link, dedupe |
| T5-11 | `mvp5-phase2.test.js` | Start ujian eligible | 201, `deadline_at` dari server |
| T5-12 | `mvp5-phase2.test.js` | Start ujian tidak eligible | 403 + detail eligibility |
| T5-13 | `mvp5-phase2.test.js` | Mahasiswa luar kelas | 403 |
| T5-14 | `mvp5-phase2.test.js` | Dua start paralel | Satu attempt, tanpa 500 |
| T5-15 | `mvp5-phase2.test.js` | Submit esai kosong lalu dinilai 0 | Skor sesuai total poin penuh, `GRADED` |
| T5-16 | `mvp5-phase2.test.js` | Roster ujian | Baris `NOT_STARTED` + sisa waktu |
| T5-17 | `mvp5-phase3.test.js` | Rekap nilai dengan bobot tugas tidak 100% | Rata-rata berbobot benar |
| T5-18 | `mvp5-phase3.test.js` | Submission/esai belum dinilai | Komponen `null`, `final_score=null`, `is_complete=false` |
| T5-19 | `mvp5-phase3.test.js` | Mahasiswa tanpa aktivitas | Tidak diisi 0 diam-diam |
| T5-20 | `mvp5-phase3.test.js` | Ekspor CSV | Header & isi sesuai, `text/csv` |
| T5-21 | `mvp5-phase3.test.js` | Progres mahasiswa | Persentase konsisten dengan data |
| T5-22 | `mvp5-phase4.test.js` | Monitoring non-admin | 403 |
| T5-23 | `mvp5-phase4.test.js` | Monitoring & ekspor audit | Metrik konsisten, tanpa field sensitif |
| T5-24 | `phase6.test.js` | Kontrak OpenAPI 1.5.0 | Seluruh operasi baru terdaftar & tervalidasi |
| T5-25 | `mvp5-phase*` | Audit mutasi ujian/nilai | Baris audit dengan old/new values |

**Target regresi:** baseline **327 lulus** → **≥ 353 lulus, 0 gagal** (perkiraan 26+ tes baru; jumlah final dicatat di log).

---

## 7. Kriteria Keberhasilan (Definition of Done MVP 5 Backend)

1. **UTS/UAS berfungsi end-to-end** — dosen membuat/menerbitkan, mahasiswa mengerjakan, dosen menilai, nilai tersimpan.
2. **Gatekeeping tidak dapat dilewati** — tidak ada jalur start attempt ujian yang lolos tanpa eligibility server; fail-closed saat data tidak tersedia.
3. **Ambang tunggal** — seluruh jalur memakai `attendance.threshold_percentage` dari `ConfigService`; tidak ada hardcode 70 yang tersisa pada respons/gatekeeping.
4. **Rekap nilai akurat & auditable** — komponen dan bobot terdokumentasi; data yang belum ada bernilai `null`, bukan `0` palsu.
5. **Ekspor benar** — CSV sesuai kontrak, menghormati format, tanpa data sensitif.
6. **Monitoring Admin** — agregat lintas kelas dan ekspor audit tersedia, read-only, terpaginasi.
7. **Kontrak konsisten** — OpenAPI 1.5.0 memuat seluruh perubahan; `phase6.test.js` hijau; tidak ada regresi MVP 1–4.
8. **Dokumentasi sinkron** — RTM, TEST_PLAN, README, dan Bab 8–9 dokumen ini diperbarui.

**Kriteria merge:** seluruh fase `✅`, `npm test` hijau, `prisma validate`/`migrate status` bersih, dan OpenAPI 1.5.0 tervalidasi.

---

## 8. Status & Log Progress Pengerjaan

> Bagian ini adalah papan status resmi. Setiap agent **wajib** memperbaruinya sesuai Protokol Bab 0.

### 8.1 Status per Fase

| Fase | Status | Tanggal mulai | Tanggal selesai | Tes terakhir | Catatan / commit |
|---|---|---|---|---|---|
| 0 — Skema & Eligibility | ⬜ | — | — | — | — |
| 1 — Manajemen Ujian | ⬜ | — | — | — | — |
| 2 — Gatekeeping & Pelaksanaan | ⬜ | — | — | — | — |
| 3 — Rekap Nilai, Progres & Ekspor | ⬜ | — | — | — | — |
| 4 — Monitoring Admin & Audit | ⬜ | — | — | — | — |
| 5 — Regresi, Kontrak & Handoff | ⬜ | — | — | — | — |

### 8.2 Log Progress

| Tanggal | Fase | Ringkasan | File utama tersentuh | Hasil tes | Commit |
|---|---|---|---|---|---|
| 2026-11-28 | — | Dokumen rencana MVP 5 backend dibuat (belum ada implementasi); baseline MVP 4 terverifikasi 327/327, 59 suite, migrasi tanpa drift, OpenAPI 1.4.1 | `IMPLEMENTATION_PLAN_MVP5_BACKEND.md` | — | — |

**Format acuan baris baru (jangan dihapus; tambahkan baris di bawah tabel):**

```text
| YYYY-MM-DD | <nomor fase> | <ringkasan perubahan> | <file utama> | <perintah + hasil> | <hash singkat / "belum commit"> |
```

### 8.3 Aturan Penutupan Fase

Sebuah fase baru boleh ditandai `✅` bila **semua** syarat berikut terpenuhi:

1. Seluruh butir `[ ]` pada fase tersebut sudah menjadi `[x]`.
2. Pengujian spesifik fase lulus.
3. `npm test` tidak menunjukkan regresi pada suite MVP 1–4.
4. Operasi baru sudah terdokumentasi di OpenAPI dan `phase6.test.js` hijau.
5. Baris log Bab 8.2 sudah ditambahkan dengan hasil tes dan commit.
6. Status di Bab 8.1 sudah diperbarui (tanggal mulai/selesai + catatan).

---

## 9. Handoff Frontend & Catatan Dampak

Bagian ini merangkum kontrak yang **akan** tersedia setelah MVP 5 backend selesai. Sumber kebenaran tetap `backend/docs/openapi.yaml`.

1. **Endpoint ujian baru** — `/api/classes/:classId/exams`, `/api/exams/:id`, `/api/exams/:id/publish`, `/api/exams/:id/questions`, `/api/exams/:id/attempts`, `/api/exam-attempts/:attemptId`. Pola meniru kuis MVP 4 sehingga komponentimer/navigator/autosave dapat dipakai ulang.
2. **Eligibility** — `GET /api/classes/:classId/exams/:examId/eligibility` mengembalikan `eligible`, `attendance_percentage`, `threshold_percentage`, `attended`, `total_sessions`, `sessions_needed`, `shortfall_percentage`, dan `reason`. Frontend **tidak** menghitung sendiri dan wajib fail-closed bila request gagal.
3. **Penolakan start** — `POST /api/exams/:id/attempts` mengembalikan `403` dengan detail eligibility bila tidak memenuhi syarat; tampilkan pesan dan alasan dari server.
4. **Rekap nilai** — `GET /api/classes/:classId/grade-recap` mengirim komponen, bobot, nilai akhir, dan eligibility. Nilai `null` berarti data belum tersedia — frontend wajib menampilkan `—`, bukan `0`.
5. **Progres** — `GET /api/classes/:classId/progress` mengirim `attendance`, `assignments`, `quizzes`, `exams`, dan `overall_percentage`. Tidak ada progres "materi dibaca" pada MVP 5.
6. **Ekspor** — CSV/`xlsx` dikirim sebagai blob dengan `Content-Disposition`; hormati nama file server.
7. **Monitoring Admin** — `GET /api/admin/monitoring` mengirim ringkasan, tabel kelas, at-risk, dan feed aktivitas; `GET /api/admin/audit-logs/export` untuk ekspor audit.
8. **Kompatibilitas** — endpoint kuis MVP 4 tidak berubah; kuis reguler tetap ditolak pada pertemuan ujian. Semua endpoint baru memakai envelope `apiResponse` yang sama.

---

## 10. Catatan Operasional & Risiko

1. **Kebijakan bobot nilai** — `GRADE_WEIGHTS` (30/20/10/20/20) adalah keputusan teknis default; jika program studi memakai bobot berbeda, perubahan harus disetujui produk dan dicatat di log sebelum Fase 3 ditutup.
2. **Denominator kehadiran** — memakai sesi yang pernah dibuka (konsisten MVP 2). Bila kebijakan akademik menghendaki denominator 16 pertemuan penuh, perubahan dilakukan terpusat di eligibility + rekap dan diuji ulang.
3. **Dependensi `exceljs`** — menambah dependensi produksi; tinjau lisensi dan ukuran. Tanpa persetujuan, ekspor `xlsx` ditunda dan CSV tetap tersedia.
4. **Performa rekap** — query agregat lintas tabel dapat berat pada kelas besar. Wajib membatasi per kelas/filter, memakai `select` minimal, dan mencatat rencana indeks bila p95 melebihi target.
5. **Zona waktu** — seluruh jendela ujian dan `deadline_at` memakai waktu server (BR-013); frontend hanya menampilkan offset dari server.
6. **Keamanan** — kunci jawaban tidak pernah dikirim ke mahasiswa; hasil attempt milik mahasiswa lain `403`; ekspor hanya untuk pengampu/Admin; audit menyaring hash/token.
7. **Tidak ada scheduler baru** — gatekeeping dievaluasi on-request; pengingat tetap lazy. Bila scheduler produksi ditambahkan, itu pekerjaan terpisah di luar MVP 5.
8. **Backward compatibility** — migrasi aditif (`assessment_type` default `QUIZ`) sehingga kuis dan data lama tetap valid tanpa backfill.
