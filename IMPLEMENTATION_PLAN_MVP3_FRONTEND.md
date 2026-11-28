# Implementation Plan: Frontend MVP 3
# E-Learning Kampus (Learning Management System) Universitas
**Team Membangun Negeri — Rencana Eksekusi Teknis Frontend: Manajemen Tugas, Validasi Berkas Ketat & Penilaian Skor 0–100**

---

> **Acuan:** [PRD.md](PRD.md) (*Bab 2, 3, 5, 7 — MVP 3*), [SRS.md](SRS.md) (*Bab 6, 7.4, 8.5, 27*), [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md), [IMPLEMENTATION_PLAN_MVP3_BACKEND.md](IMPLEMENTATION_PLAN_MVP3_BACKEND.md), [IMPLEMENTATION_PLAN_MVP1_FRONTEND.md](IMPLEMENTATION_PLAN_MVP1_FRONTEND.md), [IMPLEMENTATION_PLAN_MVP2_FRONTEND.md](IMPLEMENTATION_PLAN_MVP2_FRONTEND.md), dan [backend/docs/openapi.yaml](backend/docs/openapi.yaml) **v1.4.1**.
>
> **Definisi MVP 3 (PRD Bab 7):** *"Manajemen Tugas, Validasi File Ketat & Penilaian Skor E-Learning Kampus (0–100)."* Backend MVP 3 **sudah selesai dan teruji**; frontend MVP 3 masih **mock/parsial** dan menjadi fokus dokumen ini.
>
> **Prasyarat:** Fase 0–3 MVP 1 (fondasi) dan Fase 2–3 MVP 2 (ruang kelas + helper upload/download) selesai.

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
SEBELUM FASE : baca Bab 3 & 10 → cek prasyarat (MVP 1 Fase 0–3, MVP 2 Fase 2–3) → set status 🔄
SETELAH FASE : npm run typecheck && npm run test && npm run build → centang [x] → status ✅ → log 10.2
```

---

## 1. Tujuan & Ruang Lingkup MVP 3 (Frontend)

### 1.1 Tujuan

1. **Dosen** membuat, menerbitkan, mengubah, dan menghapus tugas pada sebuah pertemuan: judul, instruksi, bobot (0–100), deadline, izin keterlambatan, file soal.
2. **Mahasiswa** melihat daftar tugas kelas dan detail tugas, mengunggah jawaban (satu submission per tugas), melihat timestamp pengumpulan, skor, dan feedback.
3. **Dosen/Admin** memeriksa roster submission, mengunduh berkas jawaban, memberi skor numerik 0–100 (maks 2 desimal) dan feedback ≤ 2000 karakter.
4. Menegakkan validasi berkas di klien (whitelist `.pdf/.docx/.xlsx/.zip`, ukuran dari konfigurasi) dengan pesan yang jelas untuk 400/403/413.

### 1.2 In-Scope

- Halaman: Daftar Tugas per kelas, Detail Tugas (mahasiswa), Form Tugas (dosen), Pemeriksaan Tugas / Roster Submission, Panel Penilaian.
- Komponen: kartu tugas, countdown deadline, badge status (Belum dikumpulkan / Terkumpul / Terlambat / Dinilai), dropzone berkas, tabel roster, form skor+feedback.
- Integrasi seluruh endpoint MVP 3 (Bab 4).
- Penanganan konflik: submission ganda (409), deadline lewat (400/409 sesuai `allow_late`), berkas tidak valid (400/413).
- Responsif 375/768/1440, skeleton, empty state, error state.

### 1.3 Out-of-Scope

- Kuis & timeline (MVP 4).
- UTS/UAS, gatekeeping, rekap nilai akhir & ekspor (MVP 5).
- Forum diskusi (pasca-MVP).

---

## 2. Kondisi Frontend Saat Ini & Gap Analysis

| Halaman | Berkas | Kondisi saat ini | Tindakan |
|---|---|---|---|
| Daftar Tugas | `features/akademik/DaftarTugas.jsx` (bila ada) / `AssignmentWidget.jsx` | Hardcoded | `GET /classes/:classId/assignments` |
| Detail Tugas | belum ada | — | Halaman baru `/classes/:classId/assignments/:assignmentId` |
| Form Tugas | `features/dosen/ManajemenTugas.jsx` (mock) | Mock submit | `POST /meetings/:meetingId/assignments`, `PUT /assignments/:id` |
| Pemeriksaan Tugas | `features/dosen/PemeriksaanTugas.jsx` | Fixture | `GET /assignments/:assignmentId/submissions` |
| Submission Mahasiswa | `features/mahasiswa/PengumpulanTugas.jsx` (mock) | Mock | `POST /assignments/:assignmentId/submissions`, `GET .../submission` |
| Penilaian | `features/dosen/PemeriksaanTugas.jsx` | Mock | `PUT /submissions/:id/grade` |

### 2.1 Gap Teknis Spesifik MVP 3

| # | Gap | Dampak | Rencana |
|---|---|---|---|
| G3-01 | Tidak ada tipe data & service tugas/submission | Integrasi tidak konsisten | `types/tugas.ts`, `services/endpoints/assignments.ts`, `submissions.ts` |
| G3-02 | Tidak ada perhitungan "terlambat" berbasis waktu server | Status salah | Gunakan `due_date` + `server_time` dari API, bukan jam perangkat |
| G3-03 | Tidak ada validasi ukuran/ekstensi sebelum upload | Server menolak setelah upload besar | Validasi klien + config |
| G3-04 | Tidak ada konfirmasi timpa submission | Mahasiswa tidak tahu aturan | Tampilkan aturan sebelum unggah ulang |
| G3-05 | Input skor bebas (bisa >100 / 3 desimal) | 400 dari server | Validasi 0–100, 2 desimal |
| G3-06 | File soal tidak dapat diunduh | Tugas tanpa lampiran terbaca | `GET /assignments/:id/download` via blob |

---

## 3. Keputusan Arsitektur Khusus MVP 3

### 3.1 Rute

```text
/classes/:classId/assignments                                  # daftar tugas kelas
/classes/:classId/assignments/:assignmentId                     # detail tugas (mahasiswa/dosen)
/classes/:classId/assignments/:assignmentId/submissions         # roster submission (dosen/admin)
/classes/:classId/meetings/:meetingId/assignments/new           # form tugas (dosen)
/classes/:classId/assignments/:assignmentId/edit                # edit tugas (dosen)
```

Rute deep-link ini **wajib** cocok dengan `link` notifikasi backend (`/classes/:classId/assignments/:assignmentId`).

### 3.2 Query Key & Invalidasi

```text
['assignments', classId]
['assignment', assignmentId]
['my-submission', assignmentId]
['submission-roster', assignmentId, { page, search, status }]
```

Invalidasi setelah mutasi:
- buat/ubah/hapus tugas → `['assignments', classId]`, `['assignment', id]`, `['dashboard']`, `['timeline']`.
- unggah submission → `['my-submission', assignmentId]`, `['submission-roster', assignmentId]`.
- nilai submission → `['submission-roster', assignmentId]`, `['my-submission', assignmentId]`.

### 3.3 Aturan Status Tugas (Mahasiswa)

| Kondisi | Label | Warna |
|---|---|---|
| Belum ada submission, `now < due_date` | Belum dikumpulkan | netral |
| Belum ada submission, `now >= due_date` | Terlambat / Tidak dikumpulkan | merah |
| Submission ada, `submitted_at <= due_date` | Terkumpul | hijau |
| Submission ada, `submitted_at > due_date` | Terkumpul (terlambat) | kuning |
| `score != null` | Dinilai | biru |

### 3.4 Form Tugas

- Field: `title` (≤150), `instructions` (≤5000), `weight_percentage` (0–100, ≤2 desimal), `due_date` (ISO 8601 ber-offset), `allow_late`, `is_published`, file soal opsional.
- Konversi waktu lokal → ISO dengan offset perangkat (`date-fns` + helper `toIsoWithOffset`).
- Deadline harus di masa depan saat membuat tugas baru (peringatan, bukan hard-block bila backend mengizinkan).
- Tombol **Simpan sebagai draft** (`is_published=false`) dan **Terbitkan** (`is_published=true`).
- Peringatan bahwa menerbitkan memicu notifikasi ke mahasiswa (MVP 4).

### 3.5 Validasi & Unggah Submission

- Satu submission per mahasiswa per tugas; unggah ulang menimpa berkas sebelumnya (sesuai perilaku backend) — tampilkan konfirmasi.
- Validasi klien: ekstensi whitelist & ukuran dari `GET /admin/config`; MIME tidak dapat dipercaya sepenuhnya.
- `allow_late=false` dan `now > due_date` → tombol unggah dinonaktifkan dengan penjelasan; tetap tangani 400/409 dari server.
- Tampilkan `submitted_at` dalam zona lokal + label zona.
- Unduhan berkas jawaban memakai `downloadFile()`; dosen hanya dapat mengunduh submission milik kelas yang diampu (403 ditangani).

### 3.6 Penilaian

- Input skor `type="number"` `min=0 max=100 step=0.01`; validasi Zod: 0–100, maks 2 desimal.
- Feedback opsional ≤ 2000 karakter; kirim `null` eksplisit untuk mengosongkan (semantik backend).
- Setelah simpan: perbarui baris roster tanpa reload penuh; tampilkan siapa & kapan dinilai bila tersedia.
- Mahasiswa melihat skor + feedback read-only; jangan tampilkan kontrol penilaian.

---

## 4. Matriks Kontrak API MVP 3

| Halaman | Aksi | Method & Endpoint | Peran | Catatan kontrak |
|---|---|---|---|---|
| Form Tugas | Buat | `POST /meetings/:meetingId/assignments` | Dosen/Admin | Multipart `file?` + field tugas |
| Daftar Tugas | Baca | `GET /classes/:classId/assignments` | Semua | Mahasiswa hanya tugas `is_published` |
| Detail Tugas | Baca | `GET /assignments/:id` | Semua | Instruksi, bobot, deadline, file |
| Detail Tugas | Ubah | `PUT /assignments/:id` | Dosen/Admin | Partial; bisa ganti file |
| Detail Tugas | Hapus | `DELETE /assignments/:id` | Dosen/Admin | Konfirmasi destruktif |
| File Soal | Unduh | `GET /assignments/:id/download` | Semua | Blob |
| Submission | Unggah | `POST /assignments/:assignmentId/submissions` | Mahasiswa | Multipart `file`; 400/409/413 |
| Submission | Milik saya | `GET /assignments/:assignmentId/submission` | Mahasiswa | 404 bila belum ada |
| Submission | Roster | `GET /assignments/:assignmentId/submissions` | Dosen/Admin | Pagination + status |
| Submission | Unduh | `GET /submissions/:id/download` | Semua (sesuai hak) | Blob |
| Submission | Nilai | `PUT /submissions/:id/grade` | Dosen/Admin | `{ score, feedback? }`; skor 0–100 |

**Aturan:** semua respons sukses memakai envelope `{ success, message, data, meta? }`; endpoint unduhan tidak.

---

## 5. Struktur Berkas Target (Tambahan)

```text
frontend/src/
├── features/tugas/
│   ├── AssignmentListPage.tsx
│   ├── AssignmentDetailPage.tsx
│   ├── AssignmentFormPage.tsx
│   ├── SubmissionRosterPage.tsx
│   ├── components/
│   │   ├── AssignmentCard.tsx
│   │   ├── DeadlineCountdown.tsx
│   │   ├── SubmissionStatusBadge.tsx
│   │   ├── SubmissionUploadCard.tsx
│   │   ├── SubmissionRosterTable.tsx
│   │   └── GradeSubmissionDialog.tsx
│   └── hooks/
│       ├── useAssignments.ts
│       ├── useSubmission.ts
│       └── useGrading.ts
├── services/endpoints/
│   ├── assignments.ts
│   └── submissions.ts
└── types/tugas.ts
```

---

## 6. Fase Eksekusi

### 6.0 Prioritas Fase (Ringkasan)

| Fase | Prioritas | Prasyarat | Dapat paralel dengan | Catatan |
|---|---|---|---|---|
| 1 — Daftar & Detail Tugas | **P1** | MVP 2 Fase 2 | — | Wajib agar deep-link timeline/notifikasi ke tugas tidak jatuh ke fallback |
| 2 — Pembuatan & Pengelolaan Tugas | **P1** | Fase 1 + MVP 2 Fase 3 | Fase 3 | Berbagi helper upload materi |
| 3 — Pengumpulan Tugas | **P1** | Fase 1 | Fase 2 | Alur mahasiswa independen dari form dosen |
| 4 — Pemeriksaan & Penilaian | **P1** | Fase 3 (data riil) | Fase 2 | Dapat dibangun dengan submission hasil seed API |
| 5 — Hardening & Handoff | **P2** | Fase 1–4 | — | Dicicil |

**Aturan:**
- **Fase 1 adalah pintu masuk** seluruh modul tugas; jangan membangun Fase 2–4 tanpa daftar/detail yang stabil.
- **Fase 2 dan Fase 3 paralel**: keduanya hanya berbagi tipe data dan service; kontrak API sudah tersedia.
- **Fase 4** membutuhkan submission riil untuk uji end-to-end; bila Fase 3 belum selesai, gunakan data seed lewat API (bukan fixture permanen).
- **Fase 5** dicicil; jangan menunda seluruh aksesibilitas/responsif ke akhir.

### Fase 1 — Daftar & Detail Tugas (⬜)

- [ ] Tambah rute tugas (Bab 3.1) + tautan dari `MeetingDetailPage`.
- [ ] `AssignmentListPage`: kartu/tabel tugas (judul, bobot, deadline, status pengumpulan, skor bila ada), filter status, urut deadline.
- [ ] `AssignmentDetailPage`: instruksi lengkap, bobot, deadline + countdown berbasis waktu server, file soal (unduh), aturan keterlambatan.
- [ ] Mahasiswa: status submission pribadi + skor/feedback bila sudah dinilai.
- [ ] Dosen/Admin: tombol edit, hapus, dan "Lihat Submission".
- [ ] Empty state & skeleton; 404 bila tugas tidak ditemukan/tidak berhak.
- [ ] Test: render per peran, status badge, countdown, 404.

**DoD fase:** daftar dan detail tugas sepenuhnya dari API untuk ketiga peran.

---

### Fase 2 — Pembuatan & Pengelolaan Tugas (Dosen) (⬜)

- [ ] `AssignmentFormPage`: create & edit; field sesuai Bab 3.4; validasi Zod inline.
- [ ] Unggah file soal opsional (validasi ekstensi/ukuran), progress upload, hapus file saat edit bila didukung kontrak.
- [ ] Simpan draft vs terbitkan; konfirmasi saat mengubah tugas yang sudah memiliki submission (peringatan dampak).
- [ ] Hapus tugas dengan `ConfirmDialog` yang menyebut jumlah submission terdampak (bila tersedia).
- [ ] Setelah mutasi: invalidasi query + toast + navigasi kembali ke daftar/detail.
- [ ] Test: create valid/invalid, edit, publish/draft, delete, 400 field mapping.

**DoD fase:** dosen dapat mengelola siklus hidup tugas tanpa mock.

---

### Fase 3 — Pengumpulan Tugas (Mahasiswa) (⬜)

- [ ] `SubmissionUploadCard`: dropzone, nama file, ukuran, validasi klien, progress, batal.
- [ ] Aturan tampil: satu submission; unggah ulang → konfirmasi timpa; `allow_late=false` + lewat deadline → tombol nonaktif.
- [ ] Setelah unggah: tampilkan `submitted_at`, status (tepat waktu/terlambat), dan tombol unduh berkas sendiri.
- [ ] Tangani 400 (format), 403 (bukan peserta), 409 (konflik), 413 (ukuran).
- [ ] Tampilkan skor + feedback setelah dosen menilai (refetch saat halaman difokuskan).
- [ ] Test: upload sukses, unggah ulang, terlambat ditolak, 413, tampilan nilai.

**DoD fase:** mahasiswa dapat mengumpulkan dan melihat status tugas secara riil.

---

### Fase 4 — Pemeriksaan & Penilaian (Dosen/Admin) (⬜)

- [ ] `SubmissionRosterPage`: tabel mahasiswa (NIM, nama, waktu kumpul, status, skor, aksi), pencarian, filter (sudah/belum dikumpulkan, sudah/belum dinilai), pagination.
- [ ] Unduh berkas submission per baris; tampilkan indikator berkas tidak tersedia.
- [ ] `GradeSubmissionDialog`: skor 0–100 (2 desimal) + feedback ≤ 2000; validasi klien & pemetaan error server.
- [ ] Simpan penilaian → update baris + ringkasan (jumlah dinilai/total).
- [ ] Navigasi antar submission (sebelumnya/berikutnya) tanpa kehilangan filter.
- [ ] Test: roster, filter, unduh, nilai valid/invalid, 403.

**DoD fase:** dosen dapat memeriksa dan menilai seluruh submission dengan skor 0–100 dan feedback.

---

### Fase 5 — Hardening & Handoff (⬜)

- [ ] Skeleton, empty state, error state pada seluruh halaman MVP 3.
- [ ] Audit responsif: tabel roster → kartu di mobile; dropzone ramah sentuh.
- [ ] Audit aksesibilitas: label input skor, `aria-describedby` untuk error, fokus dialog.
- [ ] Pastikan tidak ada fixture pada modul tugas/submission.
- [ ] `npm run typecheck`, `npm run test`, `npm run build` hijau.
- [ ] Catat handoff ke MVP 4 (tugas muncul di timeline & memicu notifikasi) dan MVP 5 (skor tugas masuk rekap nilai).

**DoD fase:** modul MVP 3 siap demo tanpa data mock.

---

## 7. Matriks Pengujian Frontend

| Level | Alat | Cakupan wajib |
|---|---|---|
| Unit | Vitest | Validasi skor 0–100/2 desimal, status tugas, format ukuran & tanggal, konversi ISO offset |
| Integration | Vitest + RTL + MSW | Create/edit/delete tugas, upload submission, roster, grading, error 400/409/413 |
| Contract | MSW + skema Zod | Bentuk `assignment`, `submission`, `grade` |
| E2E | Playwright | Dosen buat tugas → mahasiswa unggah → dosen unduh & nilai → mahasiswa lihat skor |
| Manual | QA_TESTING_GUIDE | Unggah berkas besar/format salah, responsif, keyboard |

---

## 8. Kriteria Keberhasilan (Definition of Done)

1. Dosen dapat membuat, menerbitkan, mengubah, dan menghapus tugas beserta file soal.
2. Mahasiswa dapat mengunggah submission dengan validasi berkas yang benar dan melihat status/skor/feedback.
3. Dosen dapat mengunduh submission dan memberi skor 0–100 (2 desimal) + feedback.
4. Seluruh error 400/403/404/409/413 ditangani dengan pesan yang dapat ditindaklanjuti.
5. Tidak ada fixture pada modul MVP 3.
6. `npm run typecheck`, `npm run test`, `npm run build` hijau.
7. Responsif dan aksesibel pada 375/768/1440.

---

## 9. Dependensi, Risiko & Handoff

### 9.1 Dependensi

- Frontend MVP 1 Fase 0–3 dan MVP 2 Fase 2–3 selesai.
- Backend MVP 3 pada `main` (OpenAPI 1.4.1).
- `GET /admin/config` untuk kebijakan berkas (dosen dapat memakai default aman bila tidak berhak).

### 9.2 Risiko

| Risiko | Dampak | Mitigasi |
|---|---|---|
| Deadline dihitung dari jam perangkat | Mahasiswa salah menilai keterlambatan | Gunakan `server_time` + `due_date` dari API |
| Unggah ulang tidak disadari | Berkas lama tertimpa | Konfirmasi eksplisit + tampilkan berkas saat ini |
| Skor desimal dibulatkan berbeda | 400 dari server | Validasi 2 desimal di klien |
| Berkas besar memutus koneksi | Upload gagal | Progress + retry + pesan 413 |

### 9.3 Handoff ke MVP 4 & 5

- Kartu tugas & status tersedia untuk widget dasbor dan timeline.
- Skor tugas tersedia untuk rekap nilai MVP 5.
- Pola roster + dialog penilaian dapat dipakai ulang untuk penilaian esai kuis (MVP 4).

---

## 10. Status & Log Progress

### 10.1 Status per Fase

| Fase | Prioritas | Status | Tanggal mulai | Tanggal selesai | Tes terakhir | Catatan |
|---|---|---|---|---|---|---|
| 1 — Daftar & Detail Tugas | P1 | ⬜ | — | — | — | — |
| 2 — Pembuatan & Pengelolaan Tugas | P1 | ⬜ | — | — | — | Paralel dengan Fase 3 |
| 3 — Pengumpulan Tugas | P1 | ⬜ | — | — | — | Paralel dengan Fase 2 |
| 4 — Pemeriksaan & Penilaian | P1 | ⬜ | — | — | — | Butuh submission riil/seed |
| 5 — Hardening & Handoff | P2 | ⬜ | — | — | — | Dicicil |

### 10.2 Log Progress

| Tanggal | Fase | Ringkasan | File utama | Hasil tes | Commit |
|---|---|---|---|---|---|
| 2026-11-28 | — | Dokumen rencana frontend MVP 3 dibuat | `IMPLEMENTATION_PLAN_MVP3_FRONTEND.md` | — | — |

**Format baris baru:**

```text
| YYYY-MM-DD | <fase> | <ringkasan> | <file utama> | <perintah + hasil> | <hash / "belum commit"> |
```

---

## 11. Dokumen Terkait

[PRD.md](PRD.md) · [SRS.md](SRS.md) · [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md) · [IMPLEMENTATION_PLAN_MVP3_BACKEND.md](IMPLEMENTATION_PLAN_MVP3_BACKEND.md) · [IMPLEMENTATION_PLAN_MVP2_FRONTEND.md](IMPLEMENTATION_PLAN_MVP2_FRONTEND.md) · [IMPLEMENTATION_PLAN_MVP4_FRONTEND.md](IMPLEMENTATION_PLAN_MVP4_FRONTEND.md) · [QA_TESTING_GUIDE.md](QA_TESTING_GUIDE.md)
