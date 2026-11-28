# Implementation Plan: Backend MVP 4
# E-Learning Kampus (Learning Management System) Universitas
**Team Membangun Negeri — Rencana Perbaikan Pasca-Review PR #80: Timeline Terpusat, Kuis Interaktif & Notifikasi Internal**

---

Dokumen ini memuat rencana eksekusi teknis sisi **Backend** untuk menutup seluruh temuan review pada **PR #80** (`feat/backend-gap-closure-mvp4`). Implementasi MVP 4 sudah mendarat di PR tersebut; dokumen ini **bukan** rencana fitur baru, melainkan rencana perbaikan, pengerasan, dan pelengkapan bukti uji sebelum PR dinyatakan layak merge.

Acuan kebutuhan tetap [SRS.md](SRS.md) (*FR-003, FR-009–FR-012, FR-025, FR-040–FR-041, FR-049–FR-050, FR-057; BR-013; NFR-009; Bab 21, 24, 27, 29*) dan [PRD.md](PRD.md). Dokumen ini adalah **kelanjutan** dari [IMPLEMENTATION_PLAN_MVP3_BACKEND.md](IMPLEMENTATION_PLAN_MVP3_BACKEND.md) dan mempertahankan seluruh konvensi backend yang sudah berjalan:

- Modular Express berlapis: `routes → middlewares → controller → service → Prisma`.
- Validasi Zod melalui `validate.middleware.js`; envelop respons `apiResponse` (`success`, `message`, `data`, `meta`).
- Otorisasi terpusat di `src/utils/ownership.js` (`ensureCanManageClass`, `ensureCanReadClass`, `ensureEnrolledInClass`).
- Audit Trail via `AuditLogService.record(...)` + konstanta `AUDIT_ENTITIES`.
- Pengujian `node:test` dengan database terisolasi `rpl_review`, `--test-concurrency=1`, dan pembersihan artefak `TEST-`/`KAP-`.
- Kontrak OpenAPI 3.0 di `backend/docs/openapi.yaml` yang divalidasi otomatis oleh `tests/phase6.test.js`.

**Baseline PR #80 (terverifikasi saat review):** `npm test` → **302/302 lulus**, 58 suite, 0 gagal; seluruh suite MVP 1–3 hijau.

---

## 0. Protokol Pengerjaan & Tracking Progress (WAJIB untuk Agent)

**Aturan mutlak:** setiap agent/kontributor yang mengerjakan fase apa pun **wajib memperbarui dokumen ini** — saat mulai, saat menyelesaikan butir, dan saat fase selesai. Dokumen ini adalah satu-satunya sumber kebenaran status perbaikan; laporan di chat/PR tidak menggantikan pembaruan di sini.

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
   - Tambahkan **satu baris baru** di Bab 8.2 (Log Progress) sesuai format acuan.
   - Fase **tidak boleh** ditandai `✅` bila masih ada butir `[ ]`, temuan `P1/P2` pada fase tersebut masih terbuka, atau ada tes yang gagal.
4. **Aturan tambahan:**
   - Jangan menghapus atau menulis ulang baris log lama; hanya menambah baris baru.
   - Seluruh commit perbaikan masuk ke branch PR #80 atau branch turunan `fix/mvp4-review-followup` yang di-PR ke `main` setelah #80 merge.
   - Satu baris log = satu sesi kerja bermakna (bukan setiap perintah terminal).

### 0.3 Perintah Ringkas untuk Agent

```text
SEBELUM FASE : baca Bab 2 & 8 → cek prasyarat → set status 🔄 + tanggal mulai
SETELAH FASE : jalankan tes → centang [x] → set status ✅ + hasil tes + commit
                → tambahkan satu baris baru di Bab 8.2
VERIFIKASI   : cd backend; npx prisma validate; npm test
```

---

## 1. Konteks Review & Daftar Temuan

Review PR #80 menemukan **2 temuan P1 (wajib sebelum merge)**, **4 temuan P2**, dan **8 temuan P3**. Seluruh temuan dipetakan ke fase pengerjaan berikut:

| ID | Prioritas | Temuan | Lokasi utama | Fase |
|---|---|---|---|---|
| R-01 | **P1** | Skor esai salah & status `GRADED` keliru bila ada soal tidak dijawab | `quizzes/quiz.service.js:731-742`, `quizzes/quizAttempt.service.js:122-156` | 0 |
| R-02 | **P1** | Transport email default `log` membocorkan tautan/token reset ke log produksi | `config/env.js` (`MAIL.TRANSPORT`) | 0 |
| R-03 | P2 | Pengingat deadline dipindai **global** pada setiap baca notifikasi (N+1 lintas kelas) | `notifications/notification.service.js:114-161, 168, 213` | 1 |
| R-04 | P2 | `scheduled_at` tidak ada di OpenAPI dan tidak diisi seed → item timeline pertemuan/ujian kosong | `docs/openapi.yaml`, `prisma/seed.js`, `meetings/meeting.dto.js` | 1 |
| R-05 | P2 | Regrade tugas & koreksi presensi kedua tidak pernah memicu notifikasi (dedupe key statis) | `submissions/submission.service.js:362`, `attendance/attendance.service.js` | 1 |
| R-06 | P2 | Dua request start kuis bersamaan → `P2002` menjadi 500 | `quizzes/quizAttempt.service.js:224-231` | 1 |
| R-07 | P3 | Pesan enrollment memakai **kode** mata kuliah sebagai nama mata kuliah | `enrollments/enrollments.service.js:353-356` | 2 |
| R-08 | P3 | Detail attempt untuk dosen kehilangan `full_name` (relasi `profile` tidak di-select) | `quizzes/quizAttempt.service.js:29-31, 420-424` | 2 |
| R-09 | P3 | Seluruh notifikasi memakai `link: null` sehingga tidak dapat diklik | `notifications/notification.templates.js` | 2 |
| R-10 | P3 | Roster kuis hanya memuat mahasiswa yang sudah mulai; nama field `total_students` menyesatkan | `quizzes/quiz.service.js:583-623` | 2 |
| R-11 | P3 | `updateQuestion` mengizinkan penambahan `options` pada soal esai | `quizzes/quiz.service.js:506-533` | 2 |
| R-12 | P3 | `order_index` duplikat → `P2002` menjadi 500, bukan 409 yang informatif | `quizzes/quiz.service.js:436-469, 506-533` | 2 |
| R-13 | P3 | Token reset dikirim di query string `GET /auth/reset-password/validate` (berpotensi tercatat di access log) | `modules/auth/*`, `docs/openapi.yaml` | 2 |
| R-14 | P3 | Baris `password_reset_tokens` tidak pernah dibersihkan | `prisma/schema.prisma`, `scripts/` | 2 |

**Kriteria merge PR #80:** seluruh R-01 dan R-02 selesai; R-03–R-06 selesai atau dipindahkan eksplisit ke issue lanjutan yang disetujui; suite regresi hijau.

---

## 2. Keputusan Desain Perbaikan (Architecture Decisions)

1. **Skor kuis dihitung dari himpunan soal penuh, bukan dari jawaban yang ada.**
   `QuizQuestion` adalah sumber kebenaran total poin. Baik `#finalizeSubmission` maupun `gradeAttempt` wajib menjumlahkan poin **seluruh soal kuis**. Ini menghilangkan inflasi skor ketika mahasiswa mengosongkan soal.

2. **Soal esai yang tidak dijawab tetap mendapat baris `QuizAnswer`.**
   Saat submit, sistem membuat baris jawaban kosong (`answer_text = null`, `points_awarded = null`) untuk setiap soal esai yang belum dijawab. Tujuannya agar dosen tetap dapat memberi nilai `0` dan status `GRADED` dapat dicapai tanpa mengubah kontrak API penilaian.

3. **Status `GRADED` hanya jika seluruh esai sudah dinilai.**
   `allGraded` dihitung dari seluruh soal esai pada kuis, bukan dari baris jawaban yang kebetulan ada. `total_score` dihitung dari total poin kuis.

4. **Transport email fail-fast di produksi.**
   Pada `NODE_ENV=production` tanpa `MAIL_TRANSPORT`, default menjadi `smtp` dan startup gagal bila `SMTP_HOST` kosong. `log` hanya boleh dipakai jika diminta eksplisit (`MAIL_TRANSPORT=log`). `NODE_ENV=test` tetap dipaksa `memory`.

5. **Pengingat deadline discope ke kelas mahasiswa pemanggil + throttle proses.**
   Materialisasi lazy hanya berjalan untuk peran `MAHASISWA`, dibatasi pada kelas yang dienroll, dan dieksekusi maksimal sekali per 60 detik per proses. Ini mempertahankan keputusan "tanpa scheduler" MVP 4 tanpa memindai seluruh database pada setiap polling notifikasi.

6. **Dedupe key memuat versi/keadaan baru.**
   Notifikasi nilai memakai `grade:<submissionId>:<submission.updated_at ISO>` dan hanya dikirim bila skor benar-benar berubah. Koreksi presensi tidak memakai dedupe key statis karena sudah digating oleh `existing.status !== record.status`.

7. **`scheduled_at` menjadi kontrak resmi pertemuan.**
   Field didokumentasikan di OpenAPI (request `PUT /api/meetings/{id}` dan respons pertemuan), diisi seed untuk data demo, dan diverifikasi oleh tes timeline agar item `MEETING`/`EXAM` benar-benar muncul.

8. **Notifikasi memakai deep-link yang sama dengan timeline.**
   Format link mengikuti konvensi timeline: `/classes/:classId/assignments/:id`, `/classes/:classId/quizzes/:id`, `/classes/:classId/meetings`.

9. **Perbaikan P3 tidak mengubah bentuk respons yang sudah dikonsumsi.**
   Penambahan field (mis. `total_enrolled`, `not_started`) bersifat aditif; field lama dipertahankan. Penggantian `GET` validasi token menjadi `POST` dikoordinasikan lewat Bab 9 (handoff frontend).

---

## 3. Spesifikasi Teknis per Temuan

### 3.1 R-01 — Perhitungan Skor & Penyelesaian Attempt Esai (P1)

**Perilaku saat ini**

- `gradeAttempt` menghitung `totalPoints` dan `allGraded` dari `refreshedAnswers` (hanya jawaban yang tersimpan).
- Contoh: kuis 2 PG (10+10) + 1 esai (10), mahasiswa hanya menjawab 2 PG → setelah dosen menilai esai kosong, skor menjadi `100`, seharusnya `33.33`.
- Submit tanpa satu pun jawaban esai membuat attempt tidak pernah bisa menjadi `GRADED`.

**Perilaku yang diharapkan**

- `totalPoints` = jumlah `points` seluruh `quiz.questions`.
- Skor akhir = `(total points_awarded seluruh jawaban / totalPoints) * 100`, dibulatkan 2 desimal (`roundQuizScore`).
- `allGraded` = setiap soal esai memiliki baris `QuizAnswer` dengan `points_awarded != null`; soal PG selalu dianggap final setelah submit.
- Attempt tanpa jawaban tetap dapat diselesaikan: esai kosong dinilai `0` oleh dosen.

**Langkah**

- [ ] `#finalizeSubmission` (`quizAttempt.service.js`): setelah penilaian PG, buat baris `QuizAnswer` kosong untuk setiap soal esai yang belum punya jawaban (`answer_text: null`, `points_awarded: null`) dalam transaksi yang sama dengan update attempt.
- [ ] `gradeAttempt` (`quiz.service.js`): ganti sumber `totalPoints` dan `allGraded` menjadi `attempt.quiz.questions`.
- [ ] Pastikan `serializeAttemptForStudent`/`serializeAttemptForGrader` menampilkan esai kosong sebagai `answer_text: null` dan `points_awarded: null` (tidak berubah).
- [ ] Tambahkan audit `GRADE_QUIZ_ATTEMPT` tetap mencatat `score` lama/baru.

**Tes wajib (di `mvp4-phase4.test.js`)**

- [ ] Attempt menjawab 2 PG, esai dikosongkan → submit = `33.33`, status `SUBMITTED`.
- [ ] Dosen menilai esai kosong `0` → status `GRADED`, skor tetap `33.33`.
- [ ] Attempt submit tanpa jawaban apa pun → skor `0`, status `SUBMITTED`; setelah esai dinilai `0` → `GRADED`.
- [ ] Regresi: skenario 3 soal terjawab penuh tetap `50.00` seperti tes yang ada.

---

### 3.2 R-02 — Transport Email Fail-Fast (P1)

**Perilaku saat ini**

`MAIL.TRANSPORT` jatuh ke `'log'` bila `MAIL_TRANSPORT` tidak diset, termasuk di produksi. Transport `log` mencetak seluruh isi email, termasuk URL reset berisi token mentah, ke console/log agregator.

**Perilaku yang diharapkan**

| `NODE_ENV` | `MAIL_TRANSPORT` | Perilaku |
|---|---|---|
| `test` | apa pun | dipaksa `memory` (tidak berubah) |
| `production` | tidak diset | default `smtp`; gagal startup bila `SMTP_HOST` kosong |
| `production` | `log` | diizinkan tetapi menulis `console.warn` eksplisit bahwa token bocor ke log |
| `production` | `smtp` | gagal startup bila `SMTP_HOST` kosong (sudah ada) |
| development | tidak diset | `log` (tidak berubah) |

**Langkah**

- [ ] Refactor resolusi transport menjadi fungsi murni `resolveMailTransport(env)` di `src/config/env.js` agar dapat diuji tanpa `child_process`.
- [ ] Terapkan aturan tabel di atas; pertahankan `parsePasswordResetTtlMinutes`.
- [ ] Perbarui `backend/.env.example` dengan komentar bahwa `MAIL_TRANSPORT=log` hanya untuk development.
- [ ] Tambahkan unit test `tests/mvp4-review-config.test.js` untuk seluruh kombinasi tabel.

---

### 3.3 R-03 — Materialisasi Pengingat Deadline per Mahasiswa (P2)

**Perilaku saat ini**

`NotificationService.materializeDeadlineReminders()` dipanggil pada `listNotifications` dan `getUnreadCount` untuk **semua** peran. Fungsi ini memindai seluruh tugas terbit yang jatuh tempo <24 jam, lalu untuk tiap tugas menjalankan query enrollment + submission. Frontend yang melakukan polling `unread-count` akan memicu beban ini terus-menerus.

**Perilaku yang diharapkan**

- Hanya berjalan untuk `req.user.role === MAHASISWA`.
- Hanya memproses tugas pada kelas yang dienroll mahasiswa tersebut.
- Maksimal sekali per 60 detik per proses (throttle in-memory `lastRunAt`), dengan opsi `{ force: true }` untuk pengujian.
- Dedupe `(user_id, dedupe_key)` tetap dipertahankan.

**Langkah**

- [ ] Ubah signature menjadi `materializeDeadlineReminders({ userId, force = false })`.
- [ ] Resolve `mahasiswa` → daftar `class_id` → filter `assignment.meeting.class_id in (...)`.
- [ ] Pass `req.user` dari `notification.controller.js` (`listNotifications`, `getUnreadCount`).
- [ ] Pertahankan `console.error` best-effort; kegagalan tidak boleh menggagalkan pembacaan notifikasi.
- [ ] Catat di komentar bahwa alternatif jangka panjang adalah automation/cron (di luar MVP 4).

**Tes wajib (di `mvp4-phase5.test.js` atau suite baru)**

- [ ] Dosen membuka notifikasi → tidak ada materialisasi/notifikasi baru untuk mahasiswa.
- [ ] Mahasiswa hanya menerima pengingat untuk tugas di kelasnya, bukan kelas lain.
- [ ] Dua pemanggilan berurutan tetap menghasilkan satu notifikasi (dedupe + throttle).

---

### 3.4 R-04 — Kontrak & Data `scheduled_at` (P2)

**Perilaku saat ini**

- Kolom `scheduled_at` sudah dimigrasikan dan diterima `PUT /api/meetings/:id`, tetapi **tidak terdokumentasi** di OpenAPI.
- Seed tidak mengisi `scheduled_at`; meeting dibuat otomatis tanpa jadwal.
- Akibatnya item `MEETING`/`EXAM` di timeline kosong pada data demo, padahal FR-011 mensyaratkan jadwal pertemuan/ujian.

**Langkah**

- [ ] `backend/docs/openapi.yaml`: tambahkan `scheduled_at` (string `date-time`, nullable) pada skema body `PUT /api/meetings/{id}` dan pada skema respons pertemuan; naikkan versi ke `1.4.1`.
- [ ] `prisma/seed.js`: isi `scheduled_at` pada 16 pertemuan (mis. mingguan dari tanggal mulai semester yang dapat dikonfigurasi) **hanya bila masih `null`** agar idempoten dan tidak menimpa jadwal yang sudah disunting dosen.
- [ ] Pastikan `GET /api/classes/:classId/meetings` dan `GET /api/meetings/:id` mengembalikan `scheduled_at` (otomatis karena findMany tanpa select).
- [ ] Tambahkan tes timeline: update `scheduled_at` via API → `GET /api/timeline?types=MEETING,EXAM` memuat item dengan `starts_at` sesuai dan `status` benar.
- [ ] Perbarui `TEST_PLAN.md` bila skenario baru ditambahkan.

---

### 3.5 R-05 — Dedupe Regrade & Koreksi Presensi (P2)

**Perilaku saat ini**

- `grade:<submissionId>` mencegah notifikasi nilai kedua saat dosen memperbaiki skor.
- `attendance:<recordId>:updated` mencegah notifikasi koreksi kedua.

**Langkah**

- [ ] `SubmissionService.gradeSubmission`: kirim notifikasi hanya bila `Number(submission.score) !== Number(payload.score)` (perbaikan skor nyata), dengan dedupe key `grade:<submissionId>:<updated.updated_at.toISOString()>`.
- [ ] `AttendanceService.updateRecord`: hapus `dedupeKey` statis (perubahan status sudah menjadi gerbang), atau sertakan status baru pada key.
- [ ] Tetap pertahankan dedupe untuk `ASSIGNMENT_CREATED`, `ATTENDANCE_OPENED`, `ENROLLMENT_CREATED`, `QUIZ_PUBLISHED`, dan `DEADLINE_REMINDER`.

**Tes wajib**

- [ ] Regrade 80 → 90 menghasilkan dua notifikasi dengan pesan skor masing-masing.
- [ ] Menyimpan skor yang sama tidak menghasilkan notifikasi baru.
- [ ] Koreksi presensi HADIR → IZIN → ALPA menghasilkan dua notifikasi.

---

### 3.6 R-06 — Race Pembuatan Attempt Kuis (P2)

**Perilaku saat ini**

`prisma.quizAttempt.create` tanpa penanganan `P2002`; dua request start bersamaan dapat menghasilkan 500.

**Langkah**

- [ ] Bungkus `create` dengan `try/catch`; pada `P2002`, baca ulang attempt dengan `quizAttemptInclude`.
- [ ] Bila ditemukan dan masih `IN_PROGRESS`, kembalikan `{ attempt, created: false }`; bila sudah selesai, lempar `409` dengan pesan yang sama seperti alur normal.
- [ ] Pastikan audit `START_QUIZ_ATTEMPT` hanya tercatat sekali (hanya pada `created: true`).

**Tes wajib**

- [ ] Dua `POST /api/quizzes/:id/attempts` paralel (`Promise.all`) → tidak ada 500, satu attempt id, satu baris audit.

---

### 3.7 R-07 — Nama Mata Kuliah pada Notifikasi Enrollment (P3)

- [ ] `enrollments.service.js`: ganti `courseName: enrollment.class.course.code` menjadi `enrollment.class.course.name`; bila ingin menampilkan keduanya, ubah template menjadi `"${courseName} (${courseCode}) – ${className}"`.
- [ ] Sesuaikan `buildEnrollmentCreatedNotification` bila field bertambah.
- [ ] Tes `mvp4-phase5.test.js`: pesan memuat nama mata kuliah, bukan kode.

---

### 3.8 R-08 — Profil Mahasiswa pada Detail Attempt (P3)

- [ ] `quizAttemptInclude.student.user` tambahkan `profile: { select: { full_name: true } }`.
- [ ] Tes: `GET /api/quiz-attempts/:id` oleh dosen mengembalikan `attempt.student.full_name` sesuai profil, bukan username.

---

### 3.9 R-09 — Deep-Link Notifikasi (P3)

- [ ] Ubah builder template agar menerima `link` (atau ID terkait) dan mengembalikannya:
  - Tugas terbit/publish → `/classes/<classId>/assignments/<assignmentId>`
  - Nilai dirilis → path yang sama
  - Presensi dibuka/dikoreksi → `/classes/<classId>/meetings`
  - Enrollment → `/classes/<classId>`
  - Kuis terbit → `/classes/<classId>/quizzes/<quizId>`
  - Pengingat deadline → path tugas
- [ ] Pass `class_id`/`assignment_id`/`quiz_id`/`meeting_id` dari service pemanggil.
- [ ] Perbarui tes notifikasi untuk meng-assert `link` tidak `null` dan formatnya benar.

---

### 3.10 R-10 — Kelengkapan Roster Kuis (P3)

**Perilaku saat ini**

`total_students = attempts.length`; mahasiswa yang belum memulai tidak muncul.

**Langkah**

- [ ] Ambil seluruh mahasiswa ter-enroll pada kelas kuis.
- [ ] Susun roster untuk **semua** mahasiswa; yang belum memulai diberi `status: 'NOT_STARTED'`, `attempt_id: null`, `score: null`.
- [ ] Tambahkan `total_enrolled` dan `total_started` (aditif); pertahankan `total_students` sebagai alias `total_started` untuk kompatibilitas, atau ganti nama dengan catatan handoff.
- [ ] Ekspor CSV ikut memuat baris `NOT_STARTED`.
- [ ] Perbarui OpenAPI skema respons roster dan `TEST_PLAN.md`.

---

### 3.11 R-11 — Larangan Opsi pada Soal Esai (P3)

- [ ] `updateQuestion`: muat `question.type`; bila `ESSAY` dan `payload.options` berisi data → `400` *"Soal esai tidak boleh memiliki opsi jawaban"*.
- [ ] Bila `MULTIPLE_CHOICE` dan `options` dikirim, validasi jumlah 2–10 dan tepat satu kunci (sudah ada di DTO; pastikan tetap berlaku).
- [ ] Tes: update soal esai dengan `options` → 400; update soal PG dengan opsi valid → 200.

---

### 3.12 R-12 — Konflik `order_index` (P3)

- [ ] `addQuestion`/`updateQuestion`: tangkap `P2002` pada unique `(quiz_id, order_index)` → `409` *"Nomor urut soal sudah dipakai"*.
- [ ] Jangan mengubah perilaku auto-increment `max + 1` yang sudah ada.
- [ ] Tes: dua soal dengan `order_index` sama → 409, bukan 500.

---

### 3.13 R-13 — Validasi Token Reset via Body (P3)

- [ ] Tambahkan `POST /api/auth/reset-password/validate` dengan body `{ token }` (schema Zod) sebagai jalur resmi.
- [ ] Pertahankan `GET` selama satu rilis sebagai *deprecated* (dokumentasikan di OpenAPI `deprecated: true`), lalu hapus setelah frontend bermigrasi.
- [ ] Pastikan middleware logging tidak merekam query string pada endpoint auth.
- [ ] Perbarui `auth.routes.js`, OpenAPI, tes `mvp-gap-auth-reset.test.js`, dan handoff frontend.

---

### 3.14 R-14 — Housekeeping Token Reset (P3)

- [ ] Tambahkan `backend/scripts/prune-password-reset-tokens.js`: hapus token `used_at != null` atau `expires_at < now - 7 hari`.
- [ ] Tambahkan script npm `prune:reset-tokens`.
- [ ] Catat di README/ops bahwa pembersihan dijalankan berkala (cron/automation), bukan di request path.
- [ ] Tes opsional: script mengembalikan jumlah baris terhapus dan bersifat idempoten.

---

## 4. Struktur Berkas yang Tersentuh

| Area | Berkas | Temuan |
|---|---|---|
| Kuis | `backend/src/modules/quizzes/quiz.service.js` | R-01, R-10, R-11, R-12 |
| Kuis | `backend/src/modules/quizzes/quizAttempt.service.js` | R-01, R-06, R-08 |
| Notifikasi | `backend/src/modules/notifications/notification.service.js` | R-03 |
| Notifikasi | `backend/src/modules/notifications/notification.templates.js` | R-09 |
| Notifikasi | `backend/src/modules/notifications/notification.controller.js` | R-03 |
| Konfigurasi | `backend/src/config/env.js`, `backend/.env.example` | R-02 |
| Meeting/Seed | `backend/prisma/seed.js`, `backend/src/modules/meetings/*` | R-04 |
| Tugas/Presensi | `backend/src/modules/submissions/submission.service.js`, `backend/src/modules/attendance/attendance.service.js` | R-05 |
| Enrollment | `backend/src/modules/enrollments/enrollments.service.js` | R-07 |
| Auth | `backend/src/modules/auth/auth.routes.js`, `backend/src/modules/auth/auth.validation.js` | R-13 |
| Skrip | `backend/scripts/prune-password-reset-tokens.js`, `backend/package.json` | R-14 |
| Dokumentasi | `backend/docs/openapi.yaml`, `TEST_PLAN.md`, `RTM.md` | R-04, R-10, R-13 |
| Tes | `backend/tests/mvp4-phase4.test.js`, `mvp4-phase5.test.js`, `mvp-gap-auth-reset.test.js`, `mvp4-review-config.test.js`, `phase6.test.js` | Semua |

**Tidak ada perubahan skema database wajib** untuk R-01–R-13. R-14 hanya operasional; bila ingin indeks tambahan, dibuat migrasi terpisah dan dicatat di log.

---

## 5. Tahapan Eksekusi (Roadmap Perbaikan)

**Aturan pokok:**

- **Sekuensial (wajib urut):** `Fase 0 → Fase 1 → Fase 2 → Fase 3`.
- **Fase 0 dan Fase 1 adalah gerbang merge PR #80.** Fase 2 boleh menyusul sebagai PR lanjutan bila disepakati, tetapi tidak boleh menutup PR sebelum R-01/R-02 selesai.
- **Fase 3 selalu terakhir** karena memvalidasi regresi, OpenAPI, dan handoff.

| Fase | Sifat | Prasyarat | Isi |
|---|---|---|---|
| 0 — Blocker P1 | Sekuensial (gerbang merge) | — | R-01, R-02 |
| 1 — Pengerasan P2 | Sekuensial | Fase 0 | R-03–R-06 |
| 2 — Kebersihan P3 | Modular (boleh paralel per modul) | Fase 0 | R-07–R-14 |
| 3 — Regresi & Handoff | Sekuensial (penutup) | Fase 0–2 | Tes penuh, OpenAPI, RTM/TEST_PLAN, handoff |

---

### Fase 0: Blocker P1 — Skor Kuis & Keamanan Email (✅)

**Mulai:** 2026-11-28 **Selesai:** 2026-11-28

- [x] **R-01** Perbaiki `gradeAttempt` agar memakai total poin seluruh soal dan syarat `GRADED` berbasis seluruh esai.
- [x] **R-01** Buat baris jawaban kosong untuk esai yang tidak dijawab saat `#finalizeSubmission`.
- [x] **R-01** Tambahkan 3 skenario tes esai kosong/attempt tanpa jawaban + regresi skor 50.00.
- [x] **R-02** Refactor `resolveMailTransport` dengan default aman per environment.
- [x] **R-02** Perbarui `.env.example` dan tambahkan unit test kombinasi environment.
- [x] **R-02** Pastikan `NODE_ENV=test` tetap `memory` dan suite auth reset tidak berubah perilaku.
- [x] Jalankan `npm test` → target **≥ 307 lulus, 0 gagal**. (Hasil: 315/315)

**Definition of Done fase:** tidak ada jalur yang dapat menghasilkan skor esai > 100 atau attempt `GRADED` dengan esai belum dinilai; startup produksi tidak mungkin mengirim token reset ke log tanpa peringatan eksplisit.

---

### Fase 1: Pengerasan P2 (✅)

**Mulai:** 2026-11-28 **Selesai:** 2026-11-28

- [x] **R-03** Scope + throttle `materializeDeadlineReminders`, pass `req.user` dari controller.
- [x] **R-03** Tes: dosen tidak memicu, kelas lain tidak bocor, dedupe tetap bekerja.
- [x] **R-04** Dokumentasikan `scheduled_at` di OpenAPI dan respons pertemuan.
- [x] **R-04** Isi `scheduled_at` di seed secara idempoten.
- [x] **R-04** Tes timeline memuat item `MEETING`/`EXAM`.
- [x] **R-05** Dedupe berbasis versi untuk regrade dan koreksi presensi.
- [x] **R-05** Tes regrade beruntun dan koreksi status beruntun.
- [x] **R-06** Tangani `P2002` pada pembuatan attempt + tes paralel.
- [x] Jalankan `npm test` → seluruh suite hijau, termasuk `phase6.test.js` setelah OpenAPI berubah. (Hasil: 321/321)

**Definition of Done fase:** polling notifikasi tidak lagi memicu pemindaian lintas seluruh kelas; regrade/koreksi kedua menghasilkan notifikasi; timeline demo menampilkan pertemuan/ujian; start kuis paralel tidak pernah 500.

---

### Fase 2: Kebersihan P3 (✅)

**Mulai:** 2026-11-28 **Selesai:** 2026-11-28

- [x] **R-07** Nama mata kuliah pada notifikasi enrollment + tes.
- [x] **R-08** `profile.full_name` pada include attempt dosen + tes.
- [x] **R-09** Deep-link seluruh template notifikasi + tes.
- [x] **R-10** Roster kuis lengkap (`NOT_STARTED`, `total_enrolled`, ekspor CSV) + tes + OpenAPI.
- [x] **R-11** Tolak opsi pada soal esai saat update + tes.
- [x] **R-12** Petakan `P2002` `order_index` menjadi 409 + tes.
- [x] **R-13** `POST /api/auth/reset-password/validate` (GET deprecated) + tes + OpenAPI.
- [x] **R-14** Skrip housekeeping token + script npm + catatan operasional.
- [x] Jalankan `npm test` → seluruh suite hijau. (Hasil: 327/327)

**Definition of Done fase:** seluruh temuan P3 tertutup atau dipindahkan eksplisit ke issue dengan persetujuan reviewer; tidak ada penurunan cakupan tes.

---

### Fase 3: Regresi, Kontrak & Handoff (✅)

**Mulai:** 2026-11-28 **Selesai:** 2026-11-28

- [x] Jalankan `npm test` penuh dan catat jumlah akhir. (Hasil: 327/327 lulus, 0 gagal, 59 suite)
- [x] Jalankan `npx prisma validate`; pastikan tidak ada drift migrasi. (Schema valid; `prisma migrate status`: "Database schema is up to date!", 7 migrasi)
- [x] Perbarui `backend/docs/openapi.yaml` (versi `1.4.1`) dan pastikan `tests/phase6.test.js` hijau. (Sudah dikerjakan pada Fase 1–2; terverifikasi hijau pada regresi penuh)
- [x] Sinkronkan `RTM.md` dan `TEST_PLAN.md` dengan skenario baru (R-01, R-03, R-04, R-05, R-10).
- [x] Tulis ringkasan handoff frontend pada Bab 9 (perubahan link notifikasi, roster `NOT_STARTED`, endpoint validasi token).
- [x] Perbarui tabel status 8.1 dan tambahkan baris log 8.2 dengan commit akhir.

---

## 6. Rencana Pengujian Tambahan (Test Matrix)

| Tes | Berkas | Skenario | Ekspektasi |
|---|---|---|---|
| T-01 | `mvp4-phase4.test.js` | Esai dikosongkan, 2 PG benar | Skor `33.33`, status `SUBMITTED` |
| T-02 | `mvp4-phase4.test.js` | Nilai esai kosong `0` | Skor `33.33`, status `GRADED` |
| T-03 | `mvp4-phase4.test.js` | Submit tanpa jawaban | Skor `0`, dapat dinilai hingga `GRADED` |
| T-04 | `mvp4-review-config.test.js` | Matriks environment mailer | `memory`/`smtp`/`log` sesuai tabel; startup gagal bila `SMTP_HOST` kosong di produksi |
| T-05 | `mvp4-phase5.test.js` | Dosen membuka notifikasi | Tidak ada materialisasi untuk mahasiswa |
| T-06 | `mvp4-phase5.test.js` | Dua mahasiswa kelas berbeda | Pengingat hanya untuk kelas masing-masing |
| T-07 | `mvp4-phase2.test.js` | Update `scheduled_at` lalu timeline | Item `MEETING`/`EXAM` muncul, urut kronologis |
| T-08 | `mvp4-phase5.test.js` | Regrade 80 → 90 | Dua notifikasi dengan skor berbeda |
| T-09 | `mvp4-phase4.test.js` | Dua start paralel | Satu attempt, tanpa 500 |
| T-10 | `mvp4-phase5.test.js` | Enrollment baru | Pesan memuat nama mata kuliah |
| T-11 | `mvp4-phase4.test.js` | Detail attempt oleh dosen | `full_name` terisi |
| T-12 | `mvp4-phase5.test.js` | Notifikasi tugas/kuis/presensi | `link` sesuai konvensi timeline |
| T-13 | `mvp4-phase3.test.js` | Roster kuis dengan mahasiswa belum mulai | Baris `NOT_STARTED` muncul; CSV memuatnya |
| T-14 | `mvp4-phase3.test.js` | Update soal esai dengan opsi | `400` |
| T-15 | `mvp4-phase3.test.js` | `order_index` duplikat | `409`, bukan 500 |
| T-16 | `mvp-gap-auth-reset.test.js` | Validasi token via `POST` | 200 untuk token valid, 400 untuk token invalid/terpakai |
| T-17 | `phase6.test.js` | Kontrak OpenAPI | Operasi & skema baru terdaftar, `scheduled_at` terdokumentasi |

**Target regresi:** baseline 302 → **≥ 319 tes lulus, 0 gagal** (perkiraan 17 tes baru; jumlah final dicatat di log).

---

## 7. Kriteria Keberhasilan (Definition of Done)

1. **Integritas Nilai Kuis:** skor selalu dihitung dari total poin seluruh soal; attempt dengan esai kosong dapat diselesaikan dan dinilai; tidak ada skor > 100.
2. **Keamanan Email:** token reset tidak pernah masuk ke log pada konfigurasi produksi default; startup gagal cepat bila SMTP belum dikonfigurasi.
3. **Performa Notifikasi:** pengingat deadline hanya diproses untuk kelas mahasiswa pemanggil dan tidak memindai seluruh database pada setiap polling.
4. **Timeline Lengkap:** jadwal pertemuan/ujian dapat diisi, terdokumentasi, di-seed, dan tampil di timeline sesuai BR-013.
5. **Notifikasi Akurat & Dapat Ditindaklanjuti:** regrade/koreksi berikutnya diberitakan; setiap notifikasi memiliki deep-link yang valid.
6. **Kontrak Konsisten:** OpenAPI 1.4.1 memuat seluruh perubahan; `tests/phase6.test.js` hijau; tidak ada regresi MVP 1–3.
7. **Kebersihan Operasional:** token reset kedaluwarsa dapat dibersihkan lewat skrip; tidak ada endpoint yang menerima token sensitif di query string tanpa status deprecated yang jelas.
8. **Dokumentasi Sinkron:** RTM, TEST_PLAN, dan Bab 9 dokumen ini diperbarui; log progress terisi.

---

## 8. Status & Log Progress Pengerjaan (WAJIB Diperbarui oleh Agent)

> Bagian ini adalah papan status resmi. Setiap agent **wajib** memperbaruinya sesuai Protokol Bab 0.

### 8.1 Status per Fase

| Fase | Status | Tanggal mulai | Tanggal selesai | Tes terakhir | Catatan / commit |
|---|---|---|---|---|---|
| 0 — Blocker P1 | ✅ | 2026-11-28 | 2026-11-28 | `npm test` 315/315 | R-01, R-02 — commit `9d847ca` |
| 1 — Pengerasan P2 | ✅ | 2026-11-28 | 2026-11-28 | `npm test` 321/321 | R-03–R-06 — commit `ef8964c` |
| 2 — Kebersihan P3 | ✅ | 2026-11-28 | 2026-11-28 | `npm test` 327/327 | R-07–R-14 — commit `436c8e2` |
| 3 — Regresi & Handoff | ✅ | 2026-11-28 | 2026-11-28 | `npm test` 327/327 | Regresi penuh + RTM/TEST_PLAN + handoff — commit `ac6e626` |

### 8.2 Log Progress

| Tanggal | Fase | Ringkasan | File utama tersentuh | Hasil tes | Commit |
|---|---|---|---|---|---|
| 2026-11-28 | — | Dokumen plan perbaikan pasca-review PR #80 dibuat (belum ada implementasi) | `IMPLEMENTATION_PLAN_MVP4_BACKEND.md` | — | — |
| 2026-11-28 | 0 | R-01: skor kuis dihitung dari total poin seluruh soal, esai tak dijawab mendapat baris `QuizAnswer` kosong saat submit (dalam transaksi), syarat `GRADED` berbasis seluruh esai; R-02: `resolveMailTransport` murni — produksi default `smtp` + gagal cepat tanpa `SMTP_HOST`, `log`/`memory` di produksi selalu `console.warn`, `test` tetap `memory`. Catatan: T-01 dieksekusi sebagai "2 PG dijawab, 1 benar" agar konsisten dengan ekspektasi skor 33.33 pada R-01/T-02 | `quiz.service.js`, `quizAttempt.service.js`, `env.js`, `.env.example`, `mvp4-phase4.test.js`, `mvp4-review-config.test.js` | `npm test` 315/315 lulus, 0 gagal (baseline 302 + 13 baru) | `9d847ca` |
| 2026-11-28 | 1 | R-03: materialisasi pengingat hanya untuk MAHASISWA, discope ke kelas ter-enroll pemanggil + throttle 60 detik/proses (opsi `force` untuk uji); R-04: `scheduled_at` di OpenAPI 1.4.1 + seed idempoten mingguan dari `SEMESTER_START_DATE`; R-05: notifikasi regrade berbasis versi `updated_at`, koreksi presensi tanpa dedupe statis; R-06: `P2002` start kuis ditangani (rival dibaca ulang / 409, audit sekali). Penyimpangan kecil: signature service memakai `{ user, force }` (bukan `{ userId, force }`) agar pemeriksaan role ada di service | `notification.service.js`, `notification.controller.js`, `submission.service.js`, `attendance.service.js`, `quizAttempt.service.js`, `openapi.yaml`, `seed.js`, `mvp4-phase2/4/5.test.js` | `npm test` 321/321 lulus, 0 gagal (315 + 6 baru) | `ef8964c` |
| 2026-11-28 | 2 | R-07: pesan enrollment memakai nama mata kuliah (`courseName` + `courseCode` sebagai pelengkap); R-08: `quizAttemptInclude` memuat `profile.full_name`; R-09: seluruh 8 template notifikasi menerima ID terkait dan mengembalikan deep-link konvensi timeline (`/classes/:classId/...`), semua pemanggil (assignment, attendance, submission, quiz, enrollment, deadline reminder) meneruskan ID; R-10: roster memuat seluruh mahasiswa ter-enroll — baris `NOT_STARTED` (`attempt_id`/`started_at` null), field aditif `total_enrolled`/`total_started`, `total_students` dipertahankan sebagai alias `total_started`, CSV ikut memuat baris NOT_STARTED, skema OpenAPI diperbarui; R-11: `updateQuestion` menolak opsi pada soal esai tersimpan (400) — validasi bentuk PG tetap di DTO; R-12: `P2002` unique `(quiz_id, order_index)` pada add/update question dipetakan ke 409 "Nomor urut soal sudah dipakai"; R-13: `POST /api/auth/reset-password/validate` dengan body `{ token }` sebagai jalur resmi, GET ditandai deprecated di route & OpenAPI, token dibaca dari body ?? query, morgan `url` token menghapus query string pada `/api/auth/*`, `REQUIRED_OPERATIONS` + `PUBLIC_OPERATIONS` diperbarui; R-14: `scripts/prune-password-reset-tokens.js` (ekspor `prunePasswordResetTokens`, idempoten, retensi 7 hari) + script npm `prune:reset-tokens` + catatan operasional README. Catatan tes: asersi nama profil tidak memakai nama eksak karena suite lain yang berbagi database `rpl_review` dapat mengubahnya — cukup diverifikasi bukan username | `notification.templates.js`, `enrollments.service.js`, `quizAttempt.service.js`, `quiz.service.js`, `auth.routes.js`, `auth.validation.js`, `auth.controller.js`, `app.js`, `prune-password-reset-tokens.js`, `package.json`, `openapi.yaml`, `tests/openapi.js`, `README.md`, `mvp4-phase3/4/5.test.js`, `mvp-gap-auth-reset.test.js` | `npm test` 327/327 lulus, 0 gagal (321 + 6 baru) | `436c8e2` |
| 2026-11-28 | 3 | Fase penutup: regresi penuh `npm test` → 327/327 lulus, 0 gagal, 59 suite (baseline 302 + 25 tes baru dari R-01..R-14), termasuk `phase6.test.js` hijau terhadap OpenAPI 1.4.1; `npx prisma validate` lulus dan `prisma migrate status` menyatakan "Database schema is up to date!" (7 migrasi, tanpa drift); `RTM.md` disinkronkan (FR-003, FR-011, FR-025, FR-040, FR-041, FR-057 kini merujuk tes R-01/R-03/R-04/R-05/R-10/R-11/R-12/R-13); `TEST_PLAN.md` naik ke v1.2 — modul MVP 4 (timeline, kuis, notifikasi, keamanan email/token reset) masuk in-scope §2.1, baseline §2.3 diperbarui ke `main`, kerangka RTM §11 memuat 4 baris MVP 4; ringkasan handoff frontend Bab 9 terverifikasi akhir (link notifikasi, roster `NOT_STARTED`, `POST /auth/reset-password/validate`, `scheduled_at`). Seluruh kriteria merge PR #80 terpenuhi: R-01/R-02 selesai, R-03–R-14 selesai, suite regresi hijau | `IMPLEMENTATION_PLAN_MVP4_BACKEND.md`, `RTM.md`, `TEST_PLAN.md` | `npm test` 327/327 lulus, 0 gagal; `npx prisma validate` OK; `prisma migrate status` up to date | `ac6e626` |

**Format acuan baris baru (jangan dihapus; tambahkan baris di bawah tabel):**

```text
| YYYY-MM-DD | <nomor fase> | <ringkasan perubahan> | <file utama> | <perintah + hasil> | <hash singkat / "belum commit"> |
```

Contoh:

```text
| 2026-11-29 | 0 | Perbaikan skor esai & status GRADED; default mailer aman di produksi | quiz.service.js, quizAttempt.service.js, env.js, mvp4-phase4.test.js | npm test 307/307 | abc1234 |
```

### 8.3 Aturan Penutupan Fase

Sebuah fase baru boleh ditandai `✅` bila **semua** syarat berikut terpenuhi:

1. Seluruh butir `[ ]` pada fase tersebut sudah menjadi `[x]`.
2. Pengujian spesifik fase lulus.
3. `npm test` tidak menunjukkan regresi pada suite MVP 1–3.
4. Baris log Bab 8.2 sudah ditambahkan dengan hasil tes dan commit.
5. Status di Bab 8.1 sudah diperbarui (tanggal mulai/selesai + catatan).

Jika salah satu syarat belum terpenuhi, status tetap `🔄` (sedang dikerjakan) atau `⏸️` (tertunda) — **bukan** `✅`.

---

## 9. Handoff Frontend & Catatan Dampak

Bagian ini merangkum perubahan yang **terlihat oleh frontend** setelah perbaikan selesai. Sumber kebenaran tetap `backend/docs/openapi.yaml`.

1. **Kuis esai kosong:** tidak ada perubahan kontrak; `points_awarded` dapat bernilai `0` untuk esai yang tidak dijawab. Frontend hanya perlu memastikan tampilan menangani `0` (bukan `null`).
2. **Roster kuis:** baris dengan `status: "NOT_STARTED"` dan `attempt_id: null` akan muncul. Frontend wajib menampilkan status ini, bukan menganggap semua baris memiliki attempt.
3. **Notifikasi:** field `link` kini berisi path internal; frontend dapat langsung menavigasi. Path mengikuti pola timeline (`/classes/:classId/...`).
4. **Validasi token reset:** migrasi dari `GET /api/auth/reset-password/validate?token=` ke `POST` body `{ token }`. Endpoint lama ditandai deprecated dan akan dihapus setelah frontend bermigrasi.
5. **Jadwal pertemuan:** `scheduled_at` (ISO 8601 dengan offset) tersedia pada respons pertemuan dan dapat diubah lewat `PUT /api/meetings/:id`; timeline menampilkannya sebagai `MEETING`/`EXAM`.
6. **Pengingat deadline:** tidak ada endpoint baru; perilaku berubah hanya dari sisi beban server dan cakupan kelas.

---

## 10. Catatan Operasional & Risiko

1. **Migrasi database:** perbaikan ini tidak menambah tabel/kolom wajib. Bila R-14 menambah indeks, buat migrasi terpisah dan terapkan ke `rpl_lms` (operasional) serta `rpl_review` (uji).
2. **OpenAPI:** perubahan versi `1.4.0 → 1.4.1` wajib disertai pembaruan `REQUIRED_OPERATIONS` bila ada operasi baru (`POST /auth/reset-password/validate`), agar uji cakupan dua arah tetap hijau.
3. **Throttle in-memory:** `lastRunAt` bersifat per proses; pada deployment multi-instance, maksimal materialisasi adalah satu per instance per 60 detik. Untuk skala lebih besar, ganti dengan job terjadwal.
4. **Dedupe key berbasis timestamp:** `updated_at` beresolusi milidetik; regrade yang terjadi pada milidetik yang sama sangat kecil kemungkinannya, tetapi bila terjadi, notifikasi kedua dapat terdedupe. Catat sebagai keterbatasan yang diterima.
5. **Seed idempoten:** pengisian `scheduled_at` hanya untuk baris `null`, sehingga menjalankan ulang seed tidak menimpa jadwal yang sudah disunting dosen.
6. **Non-goals:** gatekeeping kehadiran UTS/UAS (MVP 5), rekap nilai akhir, forum diskusi, dan scheduler notifikasi produksi tidak termasuk dalam plan ini.
7. **Backward compatibility:** seluruh field respons lama dipertahankan; penambahan field bersifat aditif. Perubahan perilaku yang disengaja (dedupe regrade, link notifikasi, roster `NOT_STARTED`) dicatat di Bab 9.
