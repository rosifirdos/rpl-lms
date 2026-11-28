# Implementation Plan: Frontend MVP 4
# E-Learning Kampus (Learning Management System) Universitas
**Team Membangun Negeri — Rencana Eksekusi Teknis Frontend: Central Timeline, Widget Dasbor, Kuis Interaktif & Notifikasi Internal**

---

> **Acuan:** [PRD.md](PRD.md) (*Bab 2, 3, 5, 7 — MVP 4*), [SRS.md](SRS.md) (*Bab 6, 7.7, 8.6, 27*), [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md), [IMPLEMENTATION_PLAN_MVP4_BACKEND.md](IMPLEMENTATION_PLAN_MVP4_BACKEND.md), [IMPLEMENTATION_PLAN_MVP1_FRONTEND.md](IMPLEMENTATION_PLAN_MVP1_FRONTEND.md), [IMPLEMENTATION_PLAN_MVP2_FRONTEND.md](IMPLEMENTATION_PLAN_MVP2_FRONTEND.md), [IMPLEMENTATION_PLAN_MVP3_FRONTEND.md](IMPLEMENTATION_PLAN_MVP3_FRONTEND.md), dan [backend/docs/openapi.yaml](backend/docs/openapi.yaml) **v1.4.1**.
>
> **Definisi MVP 4 (PRD Bab 7):** *"Central Timeline Pembelajaran, Widget Dasbor & Kuis Interaktif."* Backend MVP 4 **sudah selesai, teruji (327/327), dan mematuhi PRD**; frontend MVP 4 **belum terintegrasi**: timeline masih statis, tidak ada halaman kuis, lonceng notifikasi statis. Dokumen ini adalah backlog eksekusi UI-nya.
>
> **Prasyarat:** MVP 1 Fase 0–3, MVP 2 Fase 1–4, MVP 3 Fase 1–4 selesai.

---

## 0. Protokol Pengerjaan & Tracking Progress (WAJIB untuk Agent)

### 0.1 Legenda Status

| Simbol | Arti |
|---|---|
| ⬜ | Belum dikerjakan |
| 🔄 | Sedang dikerjakan |
| ⏸️ | Tertunda / terblokir prasyarat |
| ✅ | Selesai & terverifikasi |

### 0.2 Kewajiban Agent per Fase

1. **Sebelum mulai:** baca Bab 3, pastikan prasyarat fase terpenuhi, ubah status fase di Bab 10.1 menjadi `🔄` dan isi tanggal mulai.
2. **Saat mengerjakan:** centang `[x]` hanya untuk butir yang benar-benar selesai dan sudah diuji; catat deviasi pada log.
3. **Saat fase selesai:** jalankan `npm run typecheck`, `npm run test`, `npm run build`; ubah status fase menjadi `✅`; tambahkan **satu baris baru** di Bab 10.2.
4. **Aturan tambahan:** jangan menandai `✅` bila masih ada butir `[ ]`, tes gagal, atau build gagal.

### 0.3 Perintah Ringkas

```text
SEBELUM FASE : baca Bab 3 & 10 → cek prasyarat → set status 🔄
SETELAH FASE : npm run typecheck && npm run test && npm run build → centang [x] → status ✅ → log 10.2
```

---

## 1. Tujuan & Ruang Lingkup MVP 4 (Frontend)

### 1.1 Tujuan

1. **Central Timeline** yang menampilkan urutan kronologis tugas, kuis, pertemuan, dan ujian (UTS/UAS) berdasarkan waktu server, dengan filter kelas/jenis/rentang waktu.
2. **Widget dasbor** yang membaca `timeline_preview` dan tugas/kuis mendatang, menggantikan widget hardcoded.
3. **Kuis interaktif**: dosen membuat kuis, menambah/mengubah/menghapus soal (PG & esai), menerbitkan, memantau roster, dan menilai esai; mahasiswa mengerjakan kuis dengan countdown server-side, menyimpan jawaban bertahap, submit, dan melihat hasil.
4. **Notifikasi internal**: lonceng menampilkan unread count, daftar notifikasi, tandai dibaca, dan navigasi ke deep-link.
5. **Status kelengkapan**: menutup gap review MVP 4 — timeline mock, tidak ada halaman kuis, lonceng statis, deep-link belum routable.

### 1.2 In-Scope

- Halaman: `/timeline`, `/notifications`, `/classes/:classId/quizzes`, `/classes/:classId/quizzes/:quizId`, `/classes/:classId/quizzes/:quizId/edit`, `/classes/:classId/quizzes/:quizId/attempts`, `/quiz-attempts/:attemptId`.
- Komponen: timeline group per tanggal, filter bar, kartu item, widget dasbor, editor kuis & soal, countdown, navigator soal, autosave, dialog konfirmasi submit, roster & penilaian esai, dropdown notifikasi.
- Integrasi seluruh endpoint MVP 4 (Bab 4).
- Penanganan waktu: seluruh keputusan buka/tutup/deadline memakai `server_time` dari API.

### 1.3 Out-of-Scope

- Pengacakan soal & opsi (belum ada di backend — dicatat sebagai backlog kontrak).
- UTS/UAS formal & gatekeeping kehadiran (MVP 5).
- Push notification/browser notification.
- Forum diskusi.

---

## 2. Kondisi Frontend Saat Ini & Gap Analysis

| Komponen/Halaman | Berkas | Kondisi saat ini | Tindakan |
|---|---|---|---|
| Central Timeline | `features/akademik/CentralTimeline.jsx` | Data statis `timelineEvents` | `GET /timeline` + filter + deep-link |
| Widget Tugas | `components/AssignmentWidget.jsx` | Hardcoded | `timeline_preview` / daftar tugas |
| Widget Presensi | `components/AttendanceWidget.jsx` | Fixture | Ringkasan dari `/dashboard` + rekap |
| Loncing Notifikasi | `components/Header.jsx:193-199` | Statis | `GET /notifications`, unread-count, read/read-all |
| Halaman Kuis | belum ada | Tidak ada route/halaman | Bangun modul kuis lengkap |
| Dasbor | `features/*/Dasbor*.jsx` | Sebagian fixture | Pakai `timeline_preview` & metrik API |

### 2.1 Gap Review MVP 4 yang Wajib Ditutup

| # | Gap | Bukti | Rencana |
|---|---|---|---|
| G4-01 | Timeline masih statis | `CentralTimeline.jsx:10-91` | Fase 1 |
| G4-02 | Tidak ada halaman/route kuis | `App.jsx:93-120` | Fase 3–6 |
| G4-03 | Lonceng notifikasi statis | `Header.jsx:193-199` | Fase 2 |
| G4-04 | Deep-link notifikasi belum routable | `notification.templates.js` menghasilkan `/classes/:classId/...` | Fase 1–3 (rute sudah disiapkan MVP 2/3) |
| G4-05 | Widget tugas hardcoded | `AssignmentWidget.jsx:1-24` | Fase 2 |
| G4-06 | Filter timeline hanya `class_id`, tanpa preset | `timeline.dto.js` | Preset Hari Ini/7/30 hari dihitung klien (`from`/`to`) |
| G4-07 | Belum ada pengacakan soal | Backend belum menyediakan | Catat backlog; jangan mengklaim ada |
| G4-08 | `Need Grading`/progress dasbor belum lengkap | `dashboard.service.js` | Tampilkan bila field tersedia; fallback "—" |

---

## 3. Keputusan Arsitektur Khusus MVP 4

### 3.1 Rute

```text
/timeline
/notifications
/classes/:classId/quizzes
/classes/:classId/quizzes/:quizId
/classes/:classId/quizzes/:quizId/edit
/classes/:classId/quizzes/:quizId/attempts
/quiz-attempts/:attemptId
```

Deep-link backend yang harus cocok:
- `/classes/:classId/assignments/:assignmentId` (MVP 3)
- `/classes/:classId/quizzes/:quizId` (MVP 4)
- `/classes/:classId/meetings/:meetingId` (MVP 2)

### 3.2 Central Timeline

- Sumber: `GET /timeline?from&to&class_id&types&limit`.
- Default: `from = now`, `to = now + 30 hari`, `limit = 50` (maks 100).
- Preset UI: **Hari Ini**, **7 Hari**, **30 Hari**, **Semua** (Semua mengirim rentang 1 tahun ke depan; tetap hormati `limit`).
- Filter jenis: `ASSIGNMENT`, `QUIZ`, `MEETING`, `EXAM` (multi-select).
- Filter kelas: dropdown dari `GET /classes`.
- Pengelompokan: Hari Ini / Besok / Minggu Ini / Mendatang / Sudah Lewat, berdasarkan label tanggal lokal.
- Status item (`UPCOMING`, `ONGOING`, `OVERDUE`, `PAST`) dirender sebagai badge; **jangan menghitung ulang status di klien** selain untuk label waktu.
- Item `OVERDUE` dan `ONGOING` diberi penekanan visual.
- Klik item → `link` dari backend; bila `link` null → fallback ke halaman kelas.
- Sinkronisasi waktu: gunakan `server_time` bila dikirim; jika tidak, offset dihitung dari header `Date` respons pertama dan disimpan di query cache.

### 3.3 Widget Dasbor

- Widget timeline: ambil `timeline_preview` dari `GET /dashboard`; jika kosong, tampilkan empty state dengan tautan `/timeline`.
- Widget tugas: daftar 3–5 tugas terdekat dari preview (tipe `ASSIGNMENT`) + status.
- Widget presensi: ringkasan kehadiran dari `/dashboard` bila tersedia; fallback ke `GET /classes/:classId/attendance-recap` untuk kelas utama.
- Tidak ada angka hardcoded; angka yang tidak tersedia dari backend ditampilkan sebagai `—` dengan tooltip "Belum tersedia".

### 3.4 Kuis — Sisi Dosen

**Editor kuis**
- Create: `POST /meetings/:meetingId/quizzes` dengan `title`, `instructions?`, `duration_minutes` (1–180), `open_at`, `close_at` (ISO ber-offset, `open_at < close_at`).
- Update: `PUT /quizzes/:id` (partial).
- Publish/unpublish: `PATCH /quizzes/:id/publish` `{ is_published }`; konfirmasi bahwa publikasi memicu notifikasi.
- Delete: `DELETE /quizzes/:id` dengan konfirmasi destruktif.

**Bank soal**
- Tambah: `POST /quizzes/:id/questions`.
  - `MULTIPLE_CHOICE`: 2–10 opsi, tepat satu `is_correct`, `points` 0.01–100, `answer_key` opsional.
  - `ESSAY`: tanpa opsi, `answer_key` opsional untuk pedoman penilaian.
- Ubah: `PUT /quizzes/:id/questions/:questionId`; Hapus: `DELETE ...`.
- Urutan soal via `order_index` (1..n); sediakan naik/turun dan renumber.
- Validasi: total soal 1–100 sebelum publikasi; tampilkan total poin.

**Roster & penilaian**
- `GET /quizzes/:id/attempts` — daftar percobaan (mahasiswa, status, skor, waktu).
- `GET /quizzes/:id/attempts/export` — unduh CSV via blob.
- `PUT /quiz-attempts/:attemptId/grade` — `answers[]` berisi `answer_id`, `points_awarded` (0..poin soal), `feedback?`.
- Tampilkan jawaban esai, kunci/pedoman, dan input poin per jawaban; validasi total tidak melebihi poin soal.

### 3.5 Kuis — Sisi Mahasiswa

**Mulai / lanjutkan**
- `POST /quizzes/:id/attempts` → `{ attempt, created }`; bila sudah ada percobaan berjalan, lanjutkan (bukan membuat baru).
- Tangani 403 (bukan peserta), 409 (kuis belum terbit/belum dibuka/tertutup), 404.

**Pengerjaan**
- Sumber waktu: `attempt.server_time`, `attempt.deadline_at`, `attempt.remaining_seconds`.
- Countdown dihitung dari `remaining_seconds` + selisih waktu lokal sejak respons; resinkronisasi setiap 60 detik dan saat tab kembali aktif.
- Saat mencapai 0: hentikan input, tampilkan "Waktu habis — mengumpulkan", panggil submit otomatis satu kali; backend juga melakukan auto-submit lazy.
- Simpan jawaban: `PUT /quiz-attempts/:attemptId/answers` dengan `answers[]` parsial; autosave debounce 1,5 detik setelah perubahan + simpan saat pindah soal + setiap 20 detik bila ada perubahan.
- Indikator status simpan: "Menyimpan…", "Tersimpan HH:mm", "Gagal menyimpan — coba lagi".
- Navigator soal: grid nomor, tandai terjawab/belum/ragu-ragu (ragu-ragu hanya state lokal).
- Konfirmasi submit menampilkan jumlah belum dijawab; setelah submit tampilkan skor (bila sudah dinilai) atau status "Menunggu penilaian esai".
- Cegah navigasi keluar tanpa peringatan saat masih `IN_PROGRESS` (beforeunload + guard route).

### 3.6 Notifikasi

- Lonceng: `GET /notifications/unread-count` setiap 60 detik + saat tab fokus.
- Dropdown: 5–10 notifikasi terbaru (`GET /notifications?limit=10`), item belum dibaca disorot.
- Tandai satu: `PATCH /notifications/:id/read`; semua: `PATCH /notifications/read-all`.
- Klik item: tandai dibaca lalu navigasi ke `link` (validasi bahwa path dikenal; jika tidak, buka `/notifications`).
- Halaman `/notifications`: filter `is_read` dan `type`, pagination, tombol tandai semua.
- Tipe ditampilkan dengan label manusiawi: tugas baru, pengingat deadline, presensi dibuka, nilai dipublikasikan, enrollment, kuis diterbitkan.
- Fallback saat `link` null: tetap tandai dibaca, tampilkan toast "Detail tidak tersedia".

### 3.7 Waktu & Zona

- Helper `serverNow()` mengembalikan waktu server terkoreksi offset.
- Semua countdown/deadline memakai helper ini; jangan memakai `Date.now()` langsung.
- Tampilkan label zona (mis. `WIB`) pada waktu absolut.

---

## 4. Matriks Kontrak API MVP 4

### 4.1 Timeline & Notifikasi

| Halaman | Aksi | Method & Endpoint | Peran | Catatan |
|---|---|---|---|---|
| Timeline | Baca | `GET /timeline?from&to&class_id&types&limit` | Mahasiswa/Dosen | `types` dipisah koma; `limit` 1–100 |
| Notifikasi | Unread | `GET /notifications/unread-count` | Semua | Polling 60 detik |
| Notifikasi | List | `GET /notifications?page&limit&is_read&type` | Semua | `is_read` = `true/false` |
| Notifikasi | Baca satu | `PATCH /notifications/:id/read` | Semua | Idempoten |
| Notifikasi | Baca semua | `PATCH /notifications/read-all` | Semua | — |

### 4.2 Kuis

| Halaman | Aksi | Method & Endpoint | Peran | Catatan |
|---|---|---|---|---|
| Daftar Kuis | Baca | `GET /classes/:classId/quizzes` | Semua | Mahasiswa hanya kuis terbit |
| Editor | Buat | `POST /meetings/:meetingId/quizzes` | Dosen/Admin | `duration_minutes` 1–180 |
| Detail | Baca | `GET /quizzes/:id` | Semua | Jawaban benar tidak dibocorkan ke mahasiswa |
| Editor | Ubah | `PUT /quizzes/:id` | Dosen/Admin | Partial |
| Editor | Hapus | `DELETE /quizzes/:id` | Dosen/Admin | Konfirmasi |
| Editor | Publikasi | `PATCH /quizzes/:id/publish` | Dosen/Admin | `{ is_published }` |
| Bank Soal | Tambah | `POST /quizzes/:id/questions` | Dosen/Admin | PG 2–10 opsi, 1 kunci |
| Bank Soal | Ubah | `PUT /quizzes/:id/questions/:questionId` | Dosen/Admin | — |
| Bank Soal | Hapus | `DELETE /quizzes/:id/questions/:questionId` | Dosen/Admin | — |
| Pengerjaan | Mulai/lanjut | `POST /quizzes/:id/attempts` | Mahasiswa | Kembalikan attempt + soal tersanitasi |
| Pengerjaan | Detail attempt | `GET /quiz-attempts/:attemptId` | Mahasiswa/Dosen/Admin | Mahasiswa: tersanitasi |
| Pengerjaan | Simpan jawaban | `PUT /quiz-attempts/:attemptId/answers` | Mahasiswa | Parsial, minimal 1 |
| Pengerjaan | Submit | `POST /quiz-attempts/:attemptId/submit` | Mahasiswa | Auto-score PG |
| Roster | Baca | `GET /quizzes/:id/attempts` | Dosen/Admin | — |
| Roster | Ekspor | `GET /quizzes/:id/attempts/export` | Dosen/Admin | Blob CSV |
| Penilaian | Nilai esai | `PUT /quiz-attempts/:attemptId/grade` | Dosen/Admin | `points_awarded`, `feedback?` |

**Catatan kontrak penting:**
- Soal PG memakai `selected_option_id`; esai memakai `answer_text` (≤ 10.000 karakter).
- `points` soal 0.01–100; skor akhir kuis adalah persentase 0–100 (2 desimal).
- Status attempt: `IN_PROGRESS`, `SUBMITTED`, `GRADED`.
- Timer sepenuhnya server-side; klien hanya merender `remaining_seconds`.

---

## 5. Struktur Berkas Target (Tambahan)

```text
frontend/src/
├── features/timeline/
│   ├── TimelinePage.tsx
│   ├── components/
│   │   ├── TimelineFilterBar.tsx
│   │   ├── TimelineGroup.tsx
│   │   ├── TimelineItemCard.tsx
│   │   └── TimelineStatusBadge.tsx
│   └── hooks/useTimeline.ts
├── features/notifications/
│   ├── NotificationsPage.tsx
│   ├── NotificationDropdown.tsx
│   ├── NotificationItem.tsx
│   └── hooks/useNotifications.ts
├── features/kuis/
│   ├── QuizListPage.tsx
│   ├── QuizDetailPage.tsx
│   ├── QuizEditorPage.tsx
│   ├── QuizAttemptPage.tsx
│   ├── QuizRosterPage.tsx
│   ├── components/
│   │   ├── QuizCard.tsx
│   │   ├── QuizCountdown.tsx
│   │   ├── QuestionEditor.tsx
│   │   ├── QuestionNavigator.tsx
│   │   ├── MultipleChoiceQuestion.tsx
│   │   ├── EssayQuestion.tsx
│   │   ├── SubmitQuizDialog.tsx
│   │   ├── AttemptRosterTable.tsx
│   │   └── EssayGradingPanel.tsx
│   └── hooks/
│       ├── useQuizzes.ts
│       ├── useQuizEditor.ts
│       ├── useQuizAttempt.ts
│       └── useQuizGrading.ts
├── services/endpoints/
│   ├── timeline.ts
│   ├── notifications.ts
│   └── quizzes.ts
├── lib/serverTime.ts
└── types/timeline.ts
```

---

## 6. Fase Eksekusi

### 6.0 Prioritas Fase (Ringkasan)

| Fase | Prioritas | Prasyarat | Dapat paralel dengan | Catatan |
|---|---|---|---|---|
| 1 — Central Timeline | **P1** | MVP 2 Fase 1–2 (+ MVP 3 Fase 1 untuk deep-link) | Fase 2, Fase 3 | Tidak menunggu kuis |
| 2 — Widget & Notifikasi | **P1** | MVP 1 Fase 2 | Fase 1, Fase 3 | Lonceng dapat aktif sebelum timeline selesai |
| 3 — Daftar & Detail Kuis | **P0** | MVP 2 Fase 2 | Fase 1, Fase 2 | Fondasi seluruh modul kuis |
| 4 — Editor Kuis & Bank Soal | **P1** | Fase 3 | Fase 5 | Paralel bila kuis uji dibuat via API |
| 5 — Pengerjaan Kuis | **P0** | Fase 3 + Fase 4 | Fase 6 (setelah ada attempt) | **Prasyarat MVP 5 Fase 3** |
| 6 — Roster & Penilaian Esai | **P1** | Fase 5 | — | — |
| 7 — Hardening & Handoff | **P2** | Fase 1–6 | — | Dicicil |

**Aturan:**
- **Fase 3 dan Fase 5 adalah P0** karena membentuk rantai kuis → ujian MVP 5.
- **Timeline (Fase 1) dan Notifikasi (Fase 2) bersifat modular** dan dapat dikerjakan paralel dengan modul kuis; keduanya hanya membutuhkan rute kelas dan shell.
- **Fase 4 dan Fase 5 paralel** bila tim menyiapkan kuis uji lewat API; jangan menunggu editor selesai untuk mulai membangun timer/attempt.
- **Fase 6** bergantung pada attempt riil; **Fase 7** dicicil.

### Fase 1 — Central Timeline Terintegrasi (⬜)

- [ ] Ganti data statis `CentralTimeline.jsx` dengan `GET /timeline`.
- [ ] Filter: preset Hari Ini/7/30 Hari/Semua, jenis (multi), kelas (dropdown).
- [ ] Kelompokkan per tanggal; badge status; penekanan `OVERDUE`/`ONGOING`.
- [ ] Klik item → `link` (deep-link) dengan fallback aman.
- [ ] Simpan offset waktu server (`lib/serverTime.ts`).
- [ ] Skeleton, empty state ("Tidak ada agenda pada rentang ini"), error + retry.
- [ ] Test: filter mengirim query benar, pengelompokan, deep-link, empty/error.

**DoD fase:** tidak ada data timeline statis; seluruh item berasal dari API dan dapat diklik.

---

### Fase 2 — Widget Dasbor & Notifikasi (⬜)

- [ ] Ganti `AssignmentWidget` hardcoded dengan data `timeline_preview`/tugas terdekat.
- [ ] Widget timeline pada dasbor mahasiswa & dosen; tautan "Lihat semua" → `/timeline`.
- [ ] Widget presensi memakai data API; fallback `—` bila tidak tersedia.
- [ ] Lonceng Header: unread count, dropdown 10 terbaru, tandai dibaca, polling 60 detik.
- [ ] Halaman `/notifications`: filter `is_read`/`type`, pagination, read-all.
- [ ] Klik notifikasi → tandai dibaca → navigasi `link`; fallback `/notifications`.
- [ ] Test: unread count, baca satu/semua, deep-link, fallback link null.

**DoD fase:** dasbor dan lonceng tidak lagi statis; notifikasi dapat ditindaklanjuti.

---

### Fase 3 — Daftar & Detail Kuis (⬜)

- [ ] Tambah rute kuis (Bab 3.1) + tautan dari `MeetingDetailPage` dan `ClassDetailPage`.
- [ ] `QuizListPage`: kartu kuis (judul, durasi, jendela buka/tutup, status terbit, jumlah soal, percobaan saya).
- [ ] `QuizDetailPage` mahasiswa: instruksi, durasi, jendela waktu, aturan, tombol **Mulai Kuis** (atau **Lanjutkan**).
- [ ] `QuizDetailPage` dosen: metadata, jumlah soal, status publikasi, aksi edit/roster/hapus.
- [ ] Status kuis dihitung dari `open_at`/`close_at` + waktu server: Belum dibuka / Berlangsung / Ditutup.
- [ ] Test: render per peran, tombol mulai sesuai status, 403/404.

**DoD fase:** daftar & detail kuis berfungsi dari API untuk dosen dan mahasiswa.

---

### Fase 4 — Editor Kuis & Bank Soal (Dosen) (⬜)

- [ ] Form kuis: judul, instruksi, durasi 1–180, `open_at`, `close_at` (validasi urutan), draft/terbit.
- [ ] Editor soal: tambah/ubah/hapus PG & esai; PG 2–10 opsi dengan tepat satu kunci; poin 0.01–100.
- [ ] Urutkan soal (naik/turun) dan tampilkan total poin; validasi minimal 1 soal sebelum publikasi.
- [ ] Publikasi/unpublikasi dengan konfirmasi dampak notifikasi.
- [ ] Hapus kuis dengan konfirmasi destruktif.
- [ ] Test: create/update/delete kuis, validasi opsi & poin, publish, urutan soal.

**DoD fase:** dosen dapat menyusun kuis lengkap tanpa mock.

---

### Fase 5 — Pengerjaan Kuis (Mahasiswa) (⬜)

- [ ] Mulai/lanjutkan attempt; tangani 403/409.
- [ ] Render soal PG (radio) & esai (textarea) dengan navigator dan penanda terjawab.
- [ ] Countdown server-side + resinkronisasi; auto-submit saat habis.
- [ ] Autosave bertahap + indikator status simpan; retry saat gagal.
- [ ] Konfirmasi submit (jumlah belum dijawab); tampilkan status penilaian setelah submit.
- [ ] Guard navigasi keluar saat `IN_PROGRESS`.
- [ ] Test: mulai, simpan parsial, submit, waktu habis, jawaban kosong, resume attempt.

**DoD fase:** mahasiswa dapat mengerjakan kuis end-to-end dengan timer yang ditegakkan server.

---

### Fase 6 — Roster & Penilaian Esai (Dosen) (⬜)

- [ ] `QuizRosterPage`: tabel percobaan (mahasiswa, status, skor, waktu mulai/submit), pencarian, ekspor CSV.
- [ ] Panel penilaian: daftar jawaban esai + poin per soal + feedback; validasi 0..poin soal.
- [ ] Simpan penilaian → status `GRADED` dan skor diperbarui.
- [ ] Mahasiswa melihat skor final + feedback setelah dinilai.
- [ ] Test: roster, ekspor, penilaian valid/invalid, 403, status berubah.

**DoD fase:** dosen dapat menilai esai dan mahasiswa melihat hasil akhir.

---

### Fase 7 — Hardening & Handoff (⬜)

- [ ] Skeleton/empty/error pada seluruh halaman MVP 4.
- [ ] Audit responsif 375/768/1440 (editor soal, navigator kuis, tabel roster).
- [ ] Audit aksesibilitas: countdown `aria-live="polite"`, radio group berlabel, fokus dialog submit.
- [ ] Uji ketahanan: refresh saat attempt berjalan, koneksi terputus, tab background.
- [ ] Hapus fixture timeline/notifikasi/widget yang tidak dipakai.
- [ ] `npm run typecheck`, `npm run test`, `npm run build` hijau.
- [ ] Catat backlog kontrak: pengacakan soal/opsi, filter `course_id` timeline, preset rentang di backend.

**DoD fase:** modul MVP 4 siap demo tanpa data mock; gap review MVP 4 tertutup.

---

## 7. Matriks Pengujian Frontend

| Level | Alat | Cakupan wajib |
|---|---|---|
| Unit | Vitest | Pengelompokan tanggal, filter preset → `from`/`to`, countdown, map status, validasi opsi/poin |
| Integration | Vitest + RTL + MSW | Timeline, notifikasi, editor kuis, attempt + autosave + submit, roster + grading |
| Contract | MSW + skema Zod | `timeline`, `notifications`, `quiz`, `quiz-attempt` |
| E2E | Playwright | Dosen buat & terbitkan kuis → mahasiswa kerjakan & submit → dosen nilai esai → mahasiswa lihat skor; notifikasi deep-link |
| Manual | QA_TESTING_GUIDE | Timer (ubah jam perangkat), refresh di tengah kuis, responsif, keyboard |

**Skenario wajib timer:**
1. `remaining_seconds` 5 → submit otomatis terkirim sekali.
2. Jam perangkat dimajukan 1 jam → countdown tetap mengikuti server.
3. Koneksi putus saat autosave → indikator gagal + retry manual.

---

## 8. Kriteria Keberhasilan (Definition of Done)

1. Central Timeline sepenuhnya dari API, mendukung filter dan deep-link.
2. Widget dasbor & lonceng notifikasi tidak lagi statis; unread count akurat.
3. Modul kuis lengkap: editor, bank soal, pengerjaan, timer server-side, autosave, submit, roster, penilaian esai.
4. Seluruh status/error 400/403/404/409 ditangani dengan pesan jelas.
5. Tidak ada data mock pada modul MVP 4.
6. `npm run typecheck`, `npm run test`, `npm run build` hijau.
7. Responsif dan aksesibel pada 375/768/1440.

---

## 9. Dependensi, Risiko & Handoff

### 9.1 Dependensi

- Frontend MVP 1–3 fase terkait selesai.
- Backend MVP 4 pada `main` (OpenAPI 1.4.1).
- Tidak ada desain Stitch khusus MVP 4; gunakan `DESIGN_SYSTEM.md` dan pola visual MVP 1–2.

### 9.2 Risiko

| Risiko | Dampak | Mitigasi |
|---|---|---|
| Timer klien dianggap sumber kebenaran | Jawaban di luar waktu | Selalu pakai `remaining_seconds`/`server_time`; server auto-submit |
| Autosave terlalu sering | Beban server | Debounce 1,5 detik + minimal 1 perubahan + interval 20 detik |
| Kehilangan jawaban saat refresh | Frustrasi mahasiswa | Resume attempt dari server; autosave sebelum unload |
| Deep-link tidak dikenal | Notifikasi tidak berguna | Validasi route + fallback `/notifications` |
| Publikasi kuis tanpa soal | Kuis tidak bermakna | Validasi minimal 1 soal sebelum publish |

### 9.3 Handoff ke MVP 5

- Timeline siap menampilkan item `EXAM` (UTS/UAS) tanpa perubahan struktur.
- Roster kuis & pola penilaian dapat dipakai untuk ujian.
- Notifikasi siap menerima tipe baru tanpa perubahan komponen (label berbasis map).
- Skor kuis & tugas tersedia sebagai input rekap nilai.

---

## 10. Status & Log Progress

### 10.1 Status per Fase

| Fase | Prioritas | Status | Tanggal mulai | Tanggal selesai | Tes terakhir | Catatan |
|---|---|---|---|---|---|---|
| 1 — Central Timeline | P1 | ⬜ | — | — | — | Modular; menutup G4-01 |
| 2 — Widget & Notifikasi | P1 | ⬜ | — | — | — | Modular; menutup G4-03, G4-05 |
| 3 — Daftar & Detail Kuis | P0 | ⬜ | — | — | — | Fondasi kuis; menutup G4-02 |
| 4 — Editor Kuis & Bank Soal | P1 | ⬜ | — | — | — | Paralel dengan Fase 5 |
| 5 — Pengerjaan Kuis | P0 | ⬜ | — | — | — | Timer server-side; prasyarat MVP 5 |
| 6 — Roster & Penilaian Esai | P1 | ⬜ | — | — | — | — |
| 7 — Hardening & Handoff | P2 | ⬜ | — | — | — | Dicicil |

### 10.2 Log Progress

| Tanggal | Fase | Ringkasan | File utama | Hasil tes | Commit |
|---|---|---|---|---|---|
| 2026-11-28 | — | Dokumen rencana frontend MVP 4 dibuat (menutup gap review UI MVP 4) | `IMPLEMENTATION_PLAN_MVP4_FRONTEND.md` | — | — |

**Format baris baru:**

```text
| YYYY-MM-DD | <fase> | <ringkasan> | <file utama> | <perintah + hasil> | <hash / "belum commit"> |
```

---

## 11. Dokumen Terkait

[PRD.md](PRD.md) · [SRS.md](SRS.md) · [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md) · [IMPLEMENTATION_PLAN_MVP4_BACKEND.md](IMPLEMENTATION_PLAN_MVP4_BACKEND.md) · [IMPLEMENTATION_PLAN_MVP3_FRONTEND.md](IMPLEMENTATION_PLAN_MVP3_FRONTEND.md) · [IMPLEMENTATION_PLAN_MVP5_FRONTEND.md](IMPLEMENTATION_PLAN_MVP5_FRONTEND.md) · [QA_TESTING_GUIDE.md](QA_TESTING_GUIDE.md)
