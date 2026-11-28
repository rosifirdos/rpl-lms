# Implementation Plan: Backend MVP 3
# E-Learning Kampus (Learning Management System) Universitas
**Team Membangun Negeri — Rencana Eksekusi Teknis Backend: Penerbitan Tugas, Validasi Berkas Ketat, Submission & Penilaian Skor 0–100**

---

Dokumen ini memuat rencana implementasi teknis sisi **Backend** untuk mencapai target **MVP 3** secara presisi, diselaraskan dengan [SRS.md](SRS.md) (*FR-016–FR-022, FR-032–FR-035, FR-053–FR-054, FR-058; BR-005–BR-009, BR-013, BR-015; NFR-003–NFR-005, NFR-008–NFR-009; Bab 12, 13, 15, 21, 27, 29*) dan [PRD.md](PRD.md) (*Epic 6, Bab 5, 7*):

> **Definisi MVP 3 (SRS Bab 27 & PRD Bab 7):**
> *"Modul Tugas Perkuliahan (Penerbitan Tugas, Instruksi, File Soal, Deadline, Bobot), Sistem Validasi Berkas Keamanan (Filter Ekstensi .pdf/.docx/.xlsx/.zip dan Limit Ukuran 5MB–10MB), Pengumpulan Jawaban Mahasiswa & Pencatatan Stempel Waktu, serta Modul Penilaian Tugas E-Learning Kampus berbasis Skor Numerik (0–100) dan Feedback Dosen."*

Rencana ini adalah **kelanjutan langsung** dari [IMPLEMENTATION_PLAN_MVP1_BACKEND.md](IMPLEMENTATION_PLAN_MVP1_BACKEND.md) dan [IMPLEMENTATION_PLAN_MVP2_BACKEND.md](IMPLEMENTATION_PLAN_MVP2_BACKEND.md). Seluruh konvensi yang sudah berjalan **wajib dipertahankan tanpa perubahan perilaku**:

- Modular Express berlapis: `routes → middlewares → controller → service → Prisma`.
- Zod DTO melalui `validate.middleware.js`, envelop respons `apiResponse` (`success`, `message`, `data`, `meta`).
- Otorisasi kelas terpusat di `src/utils/ownership.js` (`ensureCanManageClass`, `ensureCanReadClass`, `ensureEnrolledInClass`).
- Audit Trail via `AuditLogService.record(...)` + konstanta `AUDIT_ENTITIES`.
- Penyimpanan privat di `storage/private/` dengan nama UUID, sanitasi nama, dan streaming unduh terproteksi.
- Pengujian `node:test` dengan database terisolasi `rpl_review`, `--test-concurrency=1`, dan pembersihan kelas berprefix `TEST-`/`KAP-`.
- Kontrak OpenAPI 3.0 di `backend/docs/openapi.yaml` yang divalidasi otomatis oleh `tests/phase6.test.js`.

**Baseline yang sudah tersedia dan dapat langsung dipakai ulang:** `Meeting` (16 pertemuan), `Material` + pola upload/streaming privat, `File` metadata, helper kepemilikan kelas, serta `resolveStorageSubdir('submission')` yang sudah dideklarasikan di `src/utils/storage.js`.

---

## 0. Protokol Pengerjaan & Tracking Progress (WAJIB untuk Agent)

**Aturan mutlak:** setiap agent/kontributor yang mengerjakan fase apa pun **wajib memperbarui dokumen ini** — saat mulai, saat menyelesaikan butir, dan saat fase selesai. Dokumen ini adalah satu-satunya sumber kebenaran status pengerjaan; laporan di chat/PR tidak menggantikan pembaruan di sini.

### 0.1 Legenda Status

| Simbol | Arti |
|---|---|
| ⬜ | Belum dikerjakan |
| 🔄 | Sedang dikerjakan |
| ⏸️ | Tertunda / terblokir prasyarat |
| ✅ | Selesai & terverifikasi |

### 0.2 Kewajiban Agent per Fase

1. **Sebelum mulai:**
   - Baca Bab 6 (klasifikasi sekuensial vs modular) dan pastikan seluruh prasyarat fase terpenuhi.
   - Ubah status fase di Bab 9.1 menjadi `🔄` dan isi tanggal mulai.
   - Bila prasyarat belum siap, jangan dipaksakan: set `⏸️` beserta alasannya.
2. **Saat mengerjakan:**
   - Ubah butir `[ ]` → `[x]` **hanya** untuk pekerjaan yang benar-benar selesai dan sudah diuji.
   - Bila ada keputusan baru atau penyimpangan dari rencana, catat di baris log (jangan menghapus riwayat).
3. **Saat fase selesai:**
   - Jalankan pengujian yang disyaratkan fase tersebut **dan** `npm test` untuk memastikan tidak ada regresi.
   - Ubah status fase menjadi `✅`, isi tanggal selesai, hasil tes terakhir, dan hash commit.
   - Tambahkan **satu baris baru** di Bab 9.2 (Log Progress) sesuai format acuan.
   - Fase **tidak boleh** ditandai `✅` bila masih ada butir `[ ]` atau ada tes yang gagal.
4. **Aturan tambahan:**
   - Jangan menghapus atau menulis ulang baris log lama; hanya menambah baris baru.
   - Bila cakupan berubah, perbarui Bab 1/4/6 terlebih dahulu, lalu catat perubahan tersebut di log.
   - Satu baris log = satu sesi kerja bermakna (bukan setiap perintah terminal).

### 0.3 Perintah Ringkas untuk Agent

```text
SEBELUM FASE : baca Bab 6 & 9 → cek prasyarat → set status 🔄 + tanggal mulai
SETELAH FASE : jalankan tes → centang [x] → set status ✅ + hasil tes + commit
                → tambahkan satu baris baru di Bab 9.2
```

---

## 1. Tujuan & Ruang Lingkup MVP 3 (Sisi Backend)

1. **Penerbitan Tugas Perkuliahan oleh Dosen (SRS FR-032, BR-005)**
   - Dosen pengampu (atau Admin) dapat menerbitkan tugas pada pertemuan pembelajaran mana pun (Pertemuan 1–7 dan 9–15; Pertemuan 8/16 adalah UTS/UAS dan bukan tugas biasa).
   - Atribut tugas: judul, instruksi pengerjaan, berkas soal (opsional), bobot penilaian (`weight_percentage`, 0–100%), `due_date` berbasis waktu server, opsi `allow_late`, dan status publikasi (`is_published`).
   - Tugas yang belum dipublikasikan **tidak boleh terlihat oleh mahasiswa** (BR-005), termasuk detail, unduhan soal, dan akses submission.

2. **Sistem Validasi Berkas Keamanan (SRS FR-018, FR-019, FR-053, FR-054; BR-007, BR-008; NFR-003, NFR-004)**
   - Whitelist ekstensi: `.pdf`, `.docx`, `.xlsx`, `.zip`. Ekstensi lain ditolak otomatis dengan pesan baku.
   - Batas ukuran terkonfigurasi dalam rentang **5MB–10MB** (default 10MB) dan divalidasi di sisi server **sebelum** berkas menulis ke disk.
   - **Verifikasi ganda:** ekstensi + `mimetype` yang dideklarasikan + **pemeriksaan signature/magic-byte** berkas (PDF `%PDF-`, ZIP/DOCX/XLSX `PK\x03\x04`). Berkas `.exe` yang diubah namanya menjadi `.pdf` ditolak.
   - Seluruh berkas disimpan di direktori privat `storage/private/assignments/` (soal) dan `storage/private/submissions/` (jawaban), bukan di web root (BR-009, NFR-005).

3. **Pengumpulan Jawaban Mahasiswa (*Submission*) (SRS FR-016–FR-021, UC-05)**
   - Mahasiswa yang **ter-enroll** dapat mengunduh berkas soal dan mengunggah jawaban.
   - Sistem mencatat `submitted_at` dari **waktu server** dan menandai `is_late` bila melewati `due_date`.
   - Sebelum deadline, mahasiswa dapat **mengganti berkas** jawaban (resubmission); berkas lama dihapus dari storage privat.
   - Bila `allow_late = false`, unggahan setelah deadline ditolak `403`. Bila `allow_late = true`, unggahan tetap diterima dan ditandai `Late Submission`.
   - Submission yang sudah dinilai dikunci dari penggantian oleh mahasiswa (`409 Conflict`), agar nilai yang sudah diinput dosen tidak "menggantung" pada berkas yang berubah.

4. **Penilaian Tugas Skor Numerik 0–100 & Feedback (SRS FR-022, FR-035, UC-11; BR-006)**
   - Dosen pengampu/Admin melihat roster seluruh mahasiswa ter-enroll beserta status penyerahan (`NOT_SUBMITTED`, `SUBMITTED`, `LATE`, `GRADED`), waktu submit, dan tautan unduh berkas.
   - Dosen menginput `score` **0.00–100.00** (maks. 2 desimal) dan `feedback` opsional. Nilai di luar rentang ditolak `400` dengan pesan *"Nilai harus berupa angka di antara 0 hingga 100"*.
   - Mahasiswa hanya dapat melihat **submission, skor, dan feedback miliknya sendiri**.

5. **Otorisasi, Integritas & Jejak Audit (BR-003, BR-015, NFR-008, NFR-009)**
   - Tulis (penerbitan/ubah/hapus tugas, penilaian) hanya untuk **dosen pengampu kelas** atau Admin.
   - Mahasiswa hanya dapat mengakses tugas dan submission pada kelas tempat ia ter-enroll; mahasiswa lain ditolak `403`, termasuk saat mengunduh berkas jawaban orang lain (TC-023).
   - Setiap mutasi kritis dicatat ke `audit_logs`: pembuatan/perubahan/penghapusan tugas, unggah/resubmission, dan **perubahan skor** (`old_values` vs `new_values`), lengkap dengan pelaku, IP, dan timestamp.
   - Operasi multi-tabel (File + Assignment/Submission) dibungkus `prisma.$transaction`, dengan pembersihan berkas fisik bila transaksi gagal.

---

## 2. Keputusan Desain Teknis (Architecture Decisions)

1. **Pemisahan Modul `assignments` dan `submissions`.**
   Penerbitan tugas adalah domain dosen; pengumpulan dan penilaian adalah domain mahasiswa/dosen atas entitas submission. Keduanya dipisah agar tidak terjadi satu service gemuk, dan agar Fase 3/4 dapat dikerjakan paralel tanpa konflik berkas.

2. **Status submission diturunkan, bukan disimpan ganda.**
   SRS menyebut status *Submitted/Late/Graded* dan tabel `submissions` menyimpan `is_late`, `score`, serta `feedback`. Agar tidak ada dua sumber kebenaran yang bisa berbeda, kolom status tidak ditambahkan. Status dihitung saat serialisasi:
   - `score != null` → `GRADED`
   - `is_late == true` → `LATE`
   - selain itu → `SUBMITTED`
   - tidak ada baris submission → `NOT_SUBMITTED`

3. **Satu baris submission per (assignment, student).**
   Resubmission memakai `upsert` dengan unique constraint `@@unique([assignment_id, student_id])`, sehingga tidak pernah ada dua berkas aktif untuk satu mahasiswa pada satu tugas. Konkurensi ganda ditangani melalui `P2002 → 409`.

4. **Berkas soal ikut aturan whitelist yang sama.**
   Meskipun SRS menyebut berkas soal "umumnya PDF", BR-007 menetapkan whitelist berlaku untuk **seluruh** unggahan tugas. Karena itu soal menerima `.pdf/.docx/.xlsx/.zip` dengan batas ukuran yang sama.

5. **`due_date` dan `is_late` memakai jam server.**
   `due_date` disimpan sebagai `DateTime` (UTC) dan dibandingkan dengan `new Date()` di server, bukan jam klien. Ini menegakkan BR-013 (kronologi berbasis waktu server) dan mencegah manipulasi deadline dari perangkat mahasiswa.

6. **Batas ukuran submission dapat dikonfigurasi, divalidasi saat startup.**
   Tambahkan env `MAX_SUBMISSION_SIZE_MB` (default `10`). Nilai efektif dijepit/ditolak bila di luar rentang 5–10MB sesuai FR-019/BR-008, sehingga konfigurasi menyimpang tidak diam-diam diterima.

7. **Pemeriksaan signature tanpa dependensi baru.**
   Helper `src/utils/fileSignature.js` memeriksa magic-byte dari `file.buffer` (multer memory storage sudah dipakai). Ini memenuhi NFR-003 tanpa menambah paket npm dan tetap ringan.

8. **Bobot nilai tidak dipaksa berjumlah 100.**
   SRS/PRD hanya menetapkan rentang bobot per tugas (0–100%). Penjumlahan bobot seluruh tugas tidak divalidasi di MVP 3; kompilasi/rekapitulasi nilai kelas adalah lingkup MVP 5 (FR-043). Keputusan ini dicatat agar tidak menimbulkan penolakan yang tidak ada dasarnya di spesifikasi.

9. **Penghapusan tugas bersifat menyeluruh dan aman.**
   `DELETE /api/assignments/:id` menghapus tugas beserta submission (cascade), lalu membersihkan seluruh berkas fisik (soal + jawaban) dengan pola *quarantine → commit → unlink* seperti `MaterialService.deleteMaterial`, sehingga kegagalan DB tidak meninggalkan metadata tanpa berkas atau sebaliknya.

10. **Tidak ada perubahan perilaku MVP 1/MVP 2.**
    Refactor middleware upload dilakukan sebagai *factory* yang **mempertahankan** `uploadMaterial` dan pesan galat lamanya; suite MVP 1–2 harus tetap 190/190 lulus.

---

## 3. Desain Skema Database Tambahan (Migrasi `add_elearning_mvp3_assignments_submissions`)

```prisma
// ==========================================
// 1. TUGAS PERKULIAHAN (ASSIGNMENT)
// ==========================================

model Assignment {
  id                String   @id @default(uuid()) @db.Uuid
  meeting_id        String   @db.Uuid
  title             String   @db.VarChar(150)
  instructions      String?  @db.Text
  file_soal_id      String?  @db.Uuid // Berkas soal opsional
  weight_percentage Decimal  @db.Decimal(5, 2) // Bobot nilai 0.00–100.00
  due_date          DateTime // Deadline berbasis waktu server (BR-013)
  allow_late        Boolean  @default(false)
  is_published      Boolean  @default(true) // BR-005: draft tidak tampil ke mahasiswa
  created_at        DateTime @default(now())
  updated_at        DateTime @updatedAt

  meeting     Meeting      @relation(fields: [meeting_id], references: [id], onDelete: Cascade)
  soal        File?        @relation("AssignmentSoal", fields: [file_soal_id], references: [id], onDelete: SetNull)
  submissions Submission[]

  @@index([meeting_id])
  @@index([due_date])
  @@map("assignments")
}

// ==========================================
// 2. PENYERAHAN TUGAS MAHASISWA (SUBMISSION)
// ==========================================

model Submission {
  id            String    @id @default(uuid()) @db.Uuid
  assignment_id String    @db.Uuid
  student_id    String    @db.Uuid // Relasi ke Mahasiswa
  file_id       String    @db.Uuid // Berkas jawaban wajib ada
  submitted_at  DateTime  @default(now()) // Stempel waktu server
  is_late       Boolean   @default(false)
  score         Decimal?  @db.Decimal(5, 2) // 0.00–100.00, null = belum dinilai
  feedback      String?   @db.Text
  graded_at     DateTime?
  created_at    DateTime  @default(now())
  updated_at    DateTime  @updatedAt

  assignment Assignment @relation(fields: [assignment_id], references: [id], onDelete: Cascade)
  student    Mahasiswa  @relation(fields: [student_id], references: [id], onDelete: Cascade)
  file       File       @relation("SubmissionFile", fields: [file_id], references: [id], onDelete: Restrict)

  @@unique([assignment_id, student_id])
  @@index([student_id])
  @@map("submissions")
}
```

**Relasi balik yang wajib ditambahkan bersamaan (agar `prisma validate` lolos):**

```prisma
model Meeting {
  // ... field MVP 2 tetap ...
  assignments Assignment[]
}

model Mahasiswa {
  // ... field MVP 1–2 tetap ...
  submissions Submission[]
}

model File {
  // ... relasi MVP 1–2 tetap ...
  assignment_soal   Assignment[] @relation("AssignmentSoal")
  submission_files  Submission[] @relation("SubmissionFile")
}
```

> **Catatan migrasi:** kedua model harus mendarat dalam **satu migrasi** karena `schema.prisma` adalah satu berkas dan Submission bergantung pada Assignment. Nama migrasi: `add_elearning_mvp3_assignments_submissions`. Tidak ada kolom lama yang diubah sehingga migrasi bersifat aditif.

---

## 4. Desain Spesifikasi API Endpoints MVP 3

### 4.1. Penerbitan & Pengelolaan Tugas

| Method | Endpoint | Fungsi & Deskripsi | Hak Akses |
|---|---|---|---|
| `POST` | `/api/meetings/:meetingId/assignments` | Terbitkan tugas baru pada pertemuan (multipart: `title`, `instructions`, `weight_percentage`, `due_date`, `allow_late`, `is_published`, `file` soal opsional) | Dosen (pengampu), Admin |
| `GET` | `/api/classes/:classId/assignments` | Daftar tugas kelas; mahasiswa hanya menerima yang `is_published = true` beserta status submission miliknya | Mahasiswa (enrolled), Dosen (pengampu), Admin |
| `GET` | `/api/assignments/:id` | Detail tugas: instruksi, bobot, deadline, metadata soal, `my_submission` (mahasiswa) atau ringkasan roster (dosen/admin) | Mahasiswa (enrolled), Dosen (pengampu), Admin |
| `PUT` | `/api/assignments/:id` | Perbarui judul/instruksi/bobot/deadline/`allow_late`/`is_published`; dapat mengganti berkas soal | Dosen (pengampu), Admin |
| `DELETE` | `/api/assignments/:id` | Hapus tugas, submission terkait, dan seluruh berkas fisiknya | Dosen (pengampu), Admin |
| `GET` | `/api/assignments/:id/download` | Unduh berkas soal secara streaming terproteksi | Mahasiswa (enrolled & published), Dosen, Admin |

### 4.2. Pengumpulan Jawaban Mahasiswa (*Submission*)

| Method | Endpoint | Fungsi & Deskripsi | Hak Akses |
|---|---|---|---|
| `POST` | `/api/assignments/:assignmentId/submissions` | Unggah / ganti berkas jawaban (multipart field `file`). Mencatat `submitted_at` server dan `is_late` | Mahasiswa (enrolled) |
| `GET` | `/api/assignments/:assignmentId/submission` | Ambil submission **milik sendiri** (atau `data: null` bila belum mengumpulkan) | Mahasiswa (enrolled) |
| `GET` | `/api/assignments/:assignmentId/submissions` | Roster penilaian: seluruh mahasiswa ter-enroll, status, waktu submit, skor, feedback, tautan unduh | Dosen (pengampu), Admin |
| `GET` | `/api/submissions/:id/download` | Unduh berkas jawaban secara streaming terproteksi | Mahasiswa pemilik, Dosen (pengampu), Admin |

### 4.3. Penilaian Tugas (Skor 0–100)

| Method | Endpoint | Fungsi & Deskripsi | Hak Akses |
|---|---|---|---|
| `PUT` | `/api/submissions/:id/grade` | Simpan `score` (0.00–100.00) dan `feedback`; set `graded_at`; catat audit `GRADE_SUBMISSION` | Dosen (pengampu), Admin |

### 4.4. Kontrak Perilaku Penting (harus diuji)

| Situasi | Perilaku |
|---|---|
| Mahasiswa membuka tugas `is_published = false` | `404` (disamarkan seperti tidak ada) |
| Mahasiswa luar kelas membuka/mengunduh tugas | `403` |
| Unggah setelah deadline, `allow_late = false` | `403` — *"Batas waktu pengumpulan tugas telah berakhir"* |
| Unggah setelah deadline, `allow_late = true` | `201/200`, `is_late = true` |
| Unggah ulang sebelum deadline | `200`, `submitted_at` diperbarui, berkas lama dihapus |
| Unggah ulang setelah dinilai | `409` — *"Submission telah dinilai dan tidak dapat diubah"* |
| Ekstensi di luar whitelist | `400` — *"Format berkas tidak didukung. Harap unggah file .pdf, .docx, .xlsx, atau .zip"* |
| Ukuran melebihi konfigurasi | `400` — *"Ukuran berkas melebihi batas maksimal (maks 10MB)"* |
| Signature berkas tidak cocok dengan ekstensi | `400` — *"Isi berkas tidak sesuai dengan format yang dideklarasikan"* |
| Skor `< 0` atau `> 100` | `400` — *"Nilai harus berupa angka di antara 0 hingga 100"* |
| Mahasiswa mencoba menilai / melihat submission orang lain | `403` |
| Dosen non-pengampu menilai | `403` |

### 4.5. Bentuk Respons Utama

```json
// GET /api/assignments/:id (mahasiswa)
{
  "success": true,
  "message": "Detail tugas berhasil diambil",
  "data": {
    "id": "uuid",
    "meeting_id": "uuid",
    "meeting_number": 3,
    "title": "Tugas Analisis ERD",
    "instructions": "Kerjakan ...",
    "weight_percentage": 20,
    "due_date": "2026-12-01T16:59:00.000Z",
    "allow_late": false,
    "is_published": true,
    "soal": { "id": "uuid", "original_name": "soal.pdf", "size_bytes": 12345 },
    "my_submission": {
      "id": "uuid",
      "status": "GRADED",
      "submitted_at": "2026-11-27T08:00:00.000Z",
      "is_late": false,
      "score": 87.5,
      "feedback": "Struktur sudah baik, lengkapi kardinalitas."
    }
  }
}
```

> Semua nilai `Decimal` Prisma **wajib diserialisasi menjadi `number`** (`Number(value)`), bukan dibiarkan sebagai objek/string, agar frontend menerima `score: 87.5` dan `weight_percentage: 20`.

---

## 5. Struktur Direktori Penambahan Backend MVP 3

```text
backend/src/
├── modules/
│   ├── assignments/                  # Penerbitan & pengelolaan tugas
│   │   ├── assignment.controller.js  # Handler HTTP: create/list/detail/update/delete/download soal
│   │   ├── assignment.service.js     # Bisnis: validasi meeting, simpan soal, publikasi, audit
│   │   ├── assignment.dto.js         # Zod: payload tugas + param UUID
│   │   └── assignment.routes.js      # Router /api/classes, /api/meetings, /api/assignments
│   └── submissions/                  # Pengumpulan & penilaian
│       ├── submission.controller.js  # Handler: upload, my-submission, roster, download, grade
│       ├── submission.service.js     # Bisnis: deadline/late, upsert, kunci nilai, audit
│       ├── submission.dto.js         # Zod: param UUID + payload grade (0–100, 2 desimal)
│       └── submission.routes.js      # Router /api/assignments, /api/submissions
├── middlewares/
│   └── upload.middleware.js          # + uploadAssignmentFile, uploadSubmission (factory dokumen)
├── utils/
│   ├── fileSignature.js              # BARU: verifikasi magic-byte PDF/ZIP (DOCX/XLSX)
│   └── storage.js                    # + kategori 'assignment' & 'submission' (submission sudah ada)
├── config/
│   └── env.js                        # + STORAGE.SUBMISSION_MAX_SIZE (env, 5–10MB)
└── constants/
    └── auditEntities.js              # + ASSIGNMENTS, SUBMISSIONS

backend/tests/
├── mvp3-phase2.test.js               # Tugas: CRUD, publikasi, RBAC, unduh soal
├── mvp3-phase3.test.js               # Submission: validasi berkas, deadline, resubmission
├── mvp3-phase4.test.js               # Penilaian 0–100, feedback, audit, akses nilai
├── mvp3-phase5.test.js               # Integrasi lintas modul & matriks RBAC
└── phase6.test.js                    # Diperbarui: operasi & skema OpenAPI MVP 3
```

---

## 6. Tahapan Eksekusi Pengerjaan (Step-by-Step Roadmap MVP 3)

### 6.1 Klasifikasi Fase: Sekuensial (Wajib Urut) vs Modular (Boleh Paralel)

**Aturan pokok:**

- **Sekuensial (tidak boleh dilompati):** `Fase 0 → Fase 1 → (Fase 2/3/4) → Fase 5`.
- **Modular (boleh paralel):** Fase 2, Fase 3, dan **implementasi kode** Fase 4 — hanya boleh dimulai **setelah Fase 0 dan Fase 1 selesai**.
- **Fase 0 dan Fase 1** boleh dikerjakan bersamaan (satu atau dua orang), tetapi keduanya harus selesai sebelum fase modular dimulai. Fase 0 bukan gerbang *import*, namun tanpa helper/middleware/konstanta bersama, kode Fase 2–4 akan bercabang dan tidak konsisten.
- **Fase 5 selalu terakhir**, karena memvalidasi integrasi seluruh fase.

| Fase | Sifat | Prasyarat keras | Boleh berjalan bersamaan dengan | Tidak boleh dimulai sebelum |
|---|---|---|---|---|
| 0 — Prasyarat bersama | Sekuensial (fondasi) | — | Fase 1 | — |
| 1 — Migrasi Skema | Sekuensial (gerbang keras) | — | Fase 0 | — |
| 2 — Penerbitan Tugas | **Modular** | Fase 0 & 1 | Fase 3, Fase 4 (kode) | Fase 0 & 1 selesai |
| 3 — Submission & Validasi Berkas | **Modular** | Fase 0 & 1 | Fase 2, Fase 4 (kode) | Fase 0 & 1 selesai |
| 4 — Penilaian 0–100 | **Modular** (kode) / verifikasi menunggu | Fase 0 & 1 | Fase 2, Fase 3 | Fase 0 & 1 selesai; **verifikasi** setelah Fase 3 |
| 5 — Integrasi & Handoff | Sekuensial (penutup) | Fase 0–4 | — | Seluruh Fase 2–4 selesai |

```text
Fase 0 ∥ Fase 1  ──▶  Fase 2 ∥ Fase 3 ∥ (kode) Fase 4  ──▶  Fase 5
 (fondasi + migrasi)        (modular, berkas terpisah)        (wajib urut, penutup)
```

**Aturan praktis paralelisasi:**

1. **Kontrak dulu, kode kemudian.** Sebelum Fase 2/3/4 dilepas paralel, sepakati bentuk respons (Bab 4.5) dan nama field multipart (`file`). Perubahan kontrak setelah fase berjalan wajib dicatat di log.
2. **Satu pemilik `schema.prisma`.** Hanya Fase 1 yang boleh mengubah skema. Fase modular dilarang menambah kolom sendiri.
3. **Berkas tidak bertumpuk.** Fase 2 hanya menyentuh `modules/assignments/`; Fase 3–4 hanya `modules/submissions/`. Berkas bersama (`upload.middleware.js`, `storage.js`, `auditEntities.js`) dibekukan setelah Fase 0 selesai.
4. **Tes per fase wajib hijau** sebelum fase ditandai `✅`, walaupun fase lain masih berjalan.
5. **Verifikasi lintas fase ditunda, implementasi tidak.** Fase 4 boleh menulis service penilaian tanpa data submission; pengujian grading baru dijalankan setelah Fase 3 menghasilkan submission.

**Fase 1 adalah gerbang keras.** Tanpa model `Assignment` dan `Submission` beserta migrasinya, Prisma Client tidak memiliki delegate `prisma.assignment` dan `prisma.submission`; kode Fase 2–4 gagal saat *import*. Kedua model harus mendarat bersamaan dalam satu migrasi.

**Fase 2, 3, dan implementasi Fase 4 tidak saling memanggil.** Fase 2 hanya menulis tabel `assignments`/`files`; Fase 3 menulis `submissions`/`files` dan membaca `assignments`/`enrollments`; Fase 4 hanya meng-update baris `submissions`. Berkasnya terpisah (`modules/assignments/`, `modules/submissions/`) sehingga konflik merge praktis nihil.

> **Catatan verifikasi Fase 4:** untuk membuktikan skor tersimpan dan ter-audit dengan benar, dibutuhkan data submission yang diunggah Fase 3. Kode penilaian boleh dikerjakan paralel, tetapi pengujiannya baru dijalankan setelah Fase 3 selesai.

> **Penting — pengujian jangan ditumpuk ke Fase 5.** Setiap fase sudah memuat butir pengujiannya sendiri. Fase 5 hanya untuk uji lintas-modul (isolasi antar kelas, matriks RBAC gabungan), pemutakhiran OpenAPI, dan handoff frontend.

---

### Fase 0: Prasyarat Bersama Sebelum Paralelisasi (Hari 1, bersama Fase 1) — ✅ **SELESAI**

Komponen berikut dipakai berulang oleh Fase 2–4 dan harus selesai lebih dulu:

- [x] **Konstanta entitas audit baru** di `src/constants/auditEntities.js`:
  - `ASSIGNMENTS: 'assignments'`
  - `SUBMISSIONS: 'submissions'`
  - Pastikan `AUDIT_ENTITY_VALUES` ikut bertambah sehingga filter `GET /api/admin/audit-logs?entity=` mengenali entitas baru.
- [x] **Konfigurasi ukuran submission** di `src/config/env.js`:
  - `STORAGE.SUBMISSION_MAX_SIZE` dibaca dari `MAX_SUBMISSION_SIZE_MB`.
  - Default `10 * 1024 * 1024`; nilai di luar 5–10MB ditolak saat startup dengan pesan konfigurasi yang jelas (FR-019, BR-008).
- [x] **Helper signature berkas** `src/utils/fileSignature.js`:
  - `assertDocumentSignature(buffer, extension)` → melempar `AppError 400` bila magic-byte tidak cocok.
  - PDF: `%PDF-`; ZIP/DOCX/XLSX: `PK\x03\x04`.
  - Buffer kosong/terlalu pendek dianggap tidak valid.
- [x] **Middleware upload** di `src/middlewares/upload.middleware.js`:
  - Ekstrak factory `createDocumentUploader({ field, maxSize, label })` dengan whitelist `STORAGE.DOC_ALLOWED_EXTENSIONS`.
  - Pertahankan `uploadMaterial` **persis** seperti sekarang (regresi MVP 2 tidak boleh berubah).
  - Tambah `uploadAssignmentFile` (field `file`, batas 10MB) dan `uploadSubmission` (field `file`, batas `SUBMISSION_MAX_SIZE`).
  - Validasi `mimetype` yang dideklarasikan terhadap peta ekstensi→MIME yang sudah dipakai `MaterialService`.
- [x] **Kategori storage** di `src/utils/storage.js`:
  - `case 'assignment': path.resolve(STORAGE.UPLOAD_DIR, 'assignments')`
  - `case 'submission'` sudah ada; pastikan direktori `submissions/` dipakai konsisten.
- [x] **Verifikasi baseline** `npm test` tetap **190/190 lulus** setelah refactor middleware (hasil: 220/220 — 190 baseline + 30 tes baru Fase 0).

---

### Fase 1: Migrasi Skema Database MVP 3 (Hari 1) — GERBANG KERAS — ✅ **SELESAI**

- [x] Tambahkan model `Assignment` dan `Submission` pada `schema.prisma` sesuai Bab 3.
- [x] Tambahkan relasi balik: `assignments Assignment[]` pada `Meeting`, `submissions Submission[]` pada `Mahasiswa`, serta `assignment_soal Assignment[] @relation("AssignmentSoal")` dan `submission_files Submission[] @relation("SubmissionFile")` pada `File`.
- [x] Jalankan `npx prisma validate`.
- [x] Jalankan migrasi: `npx prisma migrate dev --name add_elearning_mvp3_assignments_submissions`.
- [x] Verifikasi `npx prisma migrate status` → *Database schema is up to date*.
- [x] Pastikan Prisma Client memiliki delegate baru: `prisma.assignment`, `prisma.submission`.
- [x] Terapkan juga ke database operasional `rpl_lms` (lihat catatan operasional di Bab 8).

---

### Fase 2: Service & API Penerbitan Tugas (Hari 2–3) — ✅ **SELESAI**
**Mulai:** 2026-11-28
**Selesai:** 2026-11-28

- [x] Implementasi `AssignmentService.createAssignment`:
  - Verifikasi `meeting` ada dan `class` dimuat untuk ownership check.
  - Tolak penerbitan tugas pada pertemuan ujian (`is_exam = true`) — UTS/UAS bukan tugas biasa (BR-004).
  - Validasi `due_date` berformat ISO dan berada di masa depan saat pembuatan.
  - Jika berkas soal dikirim: validasi ekstensi → ukuran → signature → tulis ke `storage/private/assignments/` → buat `File` → kaitkan `file_soal_id` dalam satu transaksi; hapus berkas fisik bila transaksi gagal.
  - Catat audit `CREATE_ASSIGNMENT` (entity `assignments`).
- [x] Implementasi `GET /api/classes/:classId/assignments`:
  - Otorisasi `ensureCanReadClass`; mahasiswa hanya menerima `is_published = true`.
  - Urutkan `due_date ASC`, sertakan `my_submission` untuk mahasiswa dan `_count.submissions` untuk dosen/admin.
- [x] Implementasi `GET /api/assignments/:id`:
  - Mahasiswa: `404` bila `is_published = false`; sertakan `my_submission` (null bila belum).
  - Dosen/Admin: sertakan ringkasan roster (`total_students`, `submitted`, `late`, `graded`, `not_submitted`).
- [x] Implementasi `PUT /api/assignments/:id`:
  - Hanya field yang dikirim yang diubah; mendukung toggle `is_published`.
  - Penggantian berkas soal memakai pola *quarantine → transaction → unlink* agar berkas lama tidak dihapus bila DB gagal.
  - Audit `UPDATE_ASSIGNMENT` dengan `old_values`/`new_values`.
- [x] Implementasi `DELETE /api/assignments/:id`:
  - Kumpulkan seluruh berkas fisik (soal + semua jawaban submission).
  - Hapus baris `Assignment` (cascade ke `Submission`), lalu hapus `File`, lalu unlink berkas.
  - Audit `DELETE_ASSIGNMENT`.
- [x] Implementasi `GET /api/assignments/:id/download`:
  - Otorisasi `ensureCanReadClass`; mahasiswa non-enrolled `403`; `is_published = false` → `404` untuk mahasiswa.
  - `res.attachment(...)` + `Content-Type` dari peta ekstensi + pipe `createReadStream`.
  - `404` bila tugas tidak punya soal atau berkas fisik hilang.
- [x] **Pengujian `tests/mvp3-phase2.test.js`:**
  - Dosen pengampu membuat tugas dengan dan tanpa soal; Admin juga boleh.
  - Mahasiswa/dosen non-pengampu ditolak `403` saat membuat/mengubah/menghapus.
  - Mahasiswa enrolled melihat hanya tugas `is_published = true`; draft tersembunyi `404`.
  - `due_date` masa lalu, bobot di luar 0–100, dan judul kosong ditolak `400`.
  - Unduh soal: enrolled `200` + `Content-Disposition`; luar kelas `403`; tanpa token `401`.
  - Penggantian soal melalui multipart file-only berhasil, metadata lama dihapus, dan berkas fisik lama tidak tersisa.
  - Audit `CREATE/UPDATE/DELETE_ASSIGNMENT` tercatat.

---

### Fase 3: Modul Submission, Validasi Berkas & Aturan Deadline (Hari 4–5) — ✅ **SELESAI**
**Mulai:** 2026-11-28
**Selesai:** 2026-11-28

- [x] Implementasi `SubmissionService.uploadSubmission`:
  - Mahasiswa ter-enroll (via `ensureEnrolledInClass`); tugas harus `is_published = true` (selain itu `404`).
  - Tolak bila sudah dinilai (`score != null`) → `409`.
  - Tentukan `is_late = now > due_date`; bila terlambat dan `allow_late = false` → `403`.
  - Validasi berkas: ekstensi whitelist → ukuran (`SUBMISSION_MAX_SIZE`) → signature → MIME.
  - Simpan ke `storage/private/submissions/<uuid>.<ext>`; buat `File`; `upsert` `Submission` berdasarkan `(assignment_id, student_id)`.
  - Pada resubmission: hapus berkas lama setelah commit berhasil; `submitted_at` dan `is_late` diperbarui; `score`/`feedback` tetap null (belum dinilai).
  - Catat audit `CREATE_SUBMISSION` atau `UPDATE_SUBMISSION` dengan snapshot metadata berkas (bukan isi biner).
- [x] Implementasi `GET /api/assignments/:assignmentId/submission` (mahasiswa):
  - Kembalikan submission milik sendiri + `score`, `feedback`, `status` turunan; `data: null` bila belum ada.
- [x] Implementasi `GET /api/assignments/:assignmentId/submissions` (dosen/admin):
  - Roster seluruh mahasiswa ter-enroll (termasuk `NOT_SUBMITTED`), terurut NIM.
  - Sertakan `submission_id`, `submitted_at`, `is_late`, `score`, `feedback`, `status`, dan URL unduh.
  - Ringkasan: `total_students`, `submitted`, `late`, `graded`, `not_submitted`.
- [x] Implementasi `GET /api/submissions/:id/download`:
  - Dosen pengampu/Admin: boleh; Mahasiswa: hanya bila `submission.student_id` miliknya sendiri.
  - Mahasiswa lain → `403` (TC-023); tanpa token → `401`; berkas hilang → `404`.
- [x] **Pengujian `tests/mvp3-phase3.test.js`:**
  - Upload valid `.pdf/.docx/.xlsx/.zip` → `201`; resubmission sebelum deadline → `200`, berkas lama terhapus dari disk.
  - Ekstensi `.exe`/`.txt` ditolak `400`; berkas > batas ditolak `400`; `.pdf` palsu (isi bukan PDF) ditolak `400`.
  - Deadline `allow_late=false` dan waktu lewat → `403`; `allow_late=true` → diterima dengan `is_late=true`.
  - Mahasiswa luar kelas `403`; tanpa token `401`; submission yang sudah dinilai tidak dapat diganti `409`.
  - Roster terlambat yang sudah dinilai tetap menghitung `is_late=true` dan konsisten dengan ringkasan tugas.
  - Berkas tersimpan di `storage/private/submissions/`, bukan di web root; cleanup setelah uji.
  - Audit `CREATE_SUBMISSION`/`UPDATE_SUBMISSION` tercatat.

---

### Fase 4: Lembar Penilaian Skor 0–100 & Feedback (Hari 6) — ✅ **SELESAI**
**Mulai:** 2026-11-28
**Selesai:** 2026-11-28

- [x] Implementasi `PUT /api/submissions/:id/grade`:
  - Otorisasi `ensureCanManageClass` melalui `submission → assignment → meeting → class`.
  - Validasi Zod: `score` wajib, `min(0)`, `max(100)`, maksimal 2 desimal (refine `Number.isInteger(score * 100)`); `feedback` opsional maks. 2000 karakter, boleh `null` untuk mengosongkan.
  - Simpan `score`, `feedback`, `graded_at = new Date()`.
  - Audit `GRADE_SUBMISSION` dengan `old_values { score, feedback }` dan `new_values { score, feedback }` — wajib menangkap **perubahan skor** (FR-058, TC-024).
  - Kembalikan submission terserialisasi (score sebagai `number`).
- [x] Pastikan mahasiswa melihat hasil melalui `GET /api/assignments/:assignmentId/submission` dan detail tugas (`my_submission`) tanpa bisa mengubahnya.
- [x] **Pengujian `tests/mvp3-phase4.test.js`:**
  - Skor batas `0` dan `100` diterima; `0.5`/`87.25` diterima; `-0.01`, `100.01`, `85.555`, non-angka ditolak `400`.
  - `feedback` tersimpan dan terbaca mahasiswa; `feedback: null` mengosongkan.
  - Mahasiswa tidak dapat menilai (`403`); dosen non-pengampu (`403`); Admin boleh.
  - Perubahan skor (mis. 70 → 85) menghasilkan dua entri audit dengan nilai lama/baru yang benar.
  - Mahasiswa hanya membaca submission pribadi; submission mahasiswa lain tetap tak terlihat.

---

### Fase 5: Integrasi Lintas Modul, Validasi Keamanan & Handoff (Hari 7) — ⬜ **BELUM**

- [ ] **Pengujian integrasi `tests/mvp3-phase5.test.js`:**
  - Alur end-to-end: kelas baru → 16 pertemuan → dosen menerbitkan tugas pada Pertemuan 3 → mahasiswa enrolled mengunduh soal → mengunggah jawaban → dosen menilai 90 + feedback → mahasiswa melihat skor 90 dan feedback.
  - Isolasi antar kelas: mahasiswa kelas lain tidak dapat melihat tugas, mengunduh soal/jawaban, atau menilai; dosen non-pengampu ditolak.
  - RBAC gabungan: tanpa token `401`; mahasiswa `403` pada endpoint tulis; Admin dapat seluruh operasi.
  - Verifikasi `is_late` terhadap `due_date` aktual dan `submitted_at` server (bukan waktu klien).
  - Verifikasi penghapusan tugas membersihkan baris submission, metadata `files`, dan berkas fisik.
- [ ] **Pemutakhiran OpenAPI** di `backend/docs/openapi.yaml`:
  - Tambah 11 operasi Bab 4 beserta schema: `Assignment`, `AssignmentDetail`, `Submission`, `SubmissionRoster`, `GradeSubmissionRequest`, dan respons envelop yang sesuai.
  - Deklarasikan `multipart/form-data` untuk create assignment/upload submission serta respons biner untuk kedua endpoint unduh.
- [ ] **Perbarui `tests/phase6.test.js`:** daftar operasi wajib dan skema respons baru (termasuk skema grade/roster) harus ikut divalidasi parser.
- [ ] **Perbarui `TEST_PLAN.md`/`RTM.md`** (bila disyaratkan proses QA): status FR-016–FR-022, FR-032–FR-035, FR-053–FR-054 berubah dari *Blocked (MVP 3)* menjadi *Implemented*.
- [ ] **Handoff frontend:** catat kontrak `multipart/form-data`, nama field `file`, format `due_date` ISO 8601 UTC, dan bentuk respons `score` sebagai number.

---

### Strategi Pengerjaan Menurut Ukuran Tim

| Ukuran Tim | Strategi |
|---|---|
| **1 orang** | Runtut Fase 0 → 1 → 2 → 3 → 4 → 5. Estimasi 7–9 hari kerja. |
| **2 orang** | Fase 0 + 1 bersama (satu pemilik `schema.prisma`), lalu Orang A mengerjakan Fase 2, Orang B menyiapkan kerangka Fase 3 (tanpa menunggu Fase 2 selesai karena hanya membaca `assignments`), lalu bertukar review. |
| **3–4 orang** | Fase 0 + 1 bersama lebih dulu; setelah migrasi mendarat, Fase 2, 3, dan implementasi Fase 4 dilepas paralel; Fase 5 dikerjakan bersama di akhir. |

**Ringkasan ketergantungan:** Fase 0 + Fase 1 bersifat **sekuensial/fondasi** dan wajib selesai lebih dulu; Fase 2–4 bersifat **modular** dan boleh berjalan paralel setelah kontrak Bab 4 disepakati; verifikasi Fase 4 menunggu Fase 3; Fase 5 bersifat **sekuensial penutup** dan wajib terakhir.

---

## 7. Kriteria Keberhasilan (Definition of Done MVP 3 Backend)

1. **Penerbitan Tugas Berfungsi Penuh:** Dosen pengampu/Admin dapat menerbitkan, mengubah, mempublikasikan, dan menghapus tugas pada pertemuan pembelajaran, lengkap dengan soal, bobot, dan deadline; mahasiswa hanya melihat tugas yang dipublikasikan.
2. **Validasi Berkas Ketat & Terbukti:** Ekstensi di luar `.pdf/.docx/.xlsx/.zip`, berkas melebihi batas 5–10MB, dan berkas dengan signature tidak cocok ditolak otomatis dengan pesan baku; seluruh berkas tersimpan di private storage.
3. **Pengumpulan & Resubmission Akurat:** Mahasiswa ter-enroll dapat mengunggah dan mengganti jawaban sebelum deadline; `submitted_at` memakai waktu server; `is_late` benar untuk kedua mode `allow_late`; submission yang sudah dinilai terkunci.
4. **Penilaian 0–100 & Feedback Transparan:** Dosen dapat memberi/mengubah skor 0.00–100.00 dan feedback; nilai di luar rentang ditolak; mahasiswa hanya melihat skor dan feedback miliknya sendiri.
5. **Keamanan & Isolasi Antar Kelas:** Mahasiswa luar kelas, mahasiswa lain yang mencoba mengunduh jawaban, dan dosen non-pengampu ditolak `403`; akses tanpa token `401` (TC-023).
6. **Jejak Audit Lengkap:** Pembuatan/perubahan/penghapusan tugas, unggah/resubmission, dan **setiap perubahan skor** tercatat di `audit_logs` dengan pelaku, `old_values`/`new_values`, IP, dan timestamp (FR-058, TC-024).
7. **Kontrak OpenAPI & Suite Uji Hijau:** Seluruh endpoint MVP 3 terdokumentasi dan tervalidasi otomatis; suite `mvp3-phase2..5` lulus, dan **seluruh suite MVP 1–2 tetap lulus tanpa regresi**.

---

## 8. Catatan Operasional & Risiko

1. **Migrasi harus diterapkan juga ke `rpl_lms`.** Pengalaman MVP 2 menunjukkan pengujian dapat hijau di `rpl_review` sementara database operasional tertinggal. Setelah `prisma migrate dev`, jalankan `npx prisma migrate deploy` pada environment operasional dan verifikasi `prisma migrate status` bersih sebelum handoff.
2. **Serialisasi `Decimal`.** `weight_percentage`, `score` harus diubah ke `number` di service/controller. Bila tidak, frontend menerima string/objek dan validasi tampilan bisa salah.
3. **Zona waktu.** `due_date` disimpan UTC; frontend mengirim ISO 8601 dengan offset. Pengujian batas deadline harus memakai selisih waktu eksplisit (mis. `due_date = now - 1 menit`) agar tidak flaky.
4. **Kebersihan berkas fisik.** Setiap jalur gagal (validasi, transaksi, hapus) harus membersihkan berkas yang sudah ditulis. Pola *quarantine → commit → unlink* yang dipakai `MaterialService` wajib direplikasi.
5. **Ukuran maksimum.** `SUBMISSION_MAX_SIZE` default 10MB; konfigurasi di bawah 5MB atau di atas 10MB ditolak saat startup agar sesuai BR-008.
6. **Tidak ada timer latar.** Deadline bersifat *lazy*: status `LATE` dihitung saat submission dibuat, bukan lewat scheduler. Tidak ada pekerjaan terjadwal yang perlu dijalankan.
7. **Non-goals MVP 3 (jangan dikerjakan di fase ini):**
   - Kuis interaktif, Central Timeline, dan notifikasi internal (MVP 4).
   - Rekapitulasi nilai akhir kelas, gatekeeping kehadiran UTS/UAS, ekspor `.xlsx/.csv` (MVP 5, FR-043).
   - Perubahan bobot total menjadi 100% atau konfigurasi global ekstensi/ukuran oleh Admin (MVP 5).
8. **Kompatibilitas mundur.** Refactor `upload.middleware.js` wajib mempertahankan perilaku `uploadMaterial`; jalankan suite MVP 2 sebelum menutup Fase 0.

---

## 9. Status & Log Progress Pengerjaan (WAJIB Diperbarui oleh Agent)

> Bagian ini adalah papan status resmi. Setiap agent **wajib** memperbaruinya sesuai Protokol Bab 0.

### 9.1 Status per Fase

| Fase | Status | Tanggal mulai | Tanggal selesai | Tes terakhir | Catatan / commit |
|---|---|---|---|---|---|
| 0 — Prasyarat bersama | ✅ | 2026-11-27 | 2026-11-27 | `npm test` 220/220 lulus | Fase 0 selesai; 30 tes baru (MVP 3 phase0) |
| 1 — Migrasi Skema | ✅ | 2026-11-27 | 2026-11-27 | `npx prisma validate` OK; `npm test` 220/220 lulus | Migrasi `20261127163147_add_elearning_mvp3_assignments_submissions` diterapkan ke `rpl_lms` & `rpl_review`; delegate `assignment`/`submission` terverifikasi |
| 2 — Penerbitan Tugas | ✅ | 2026-11-28 | 2026-11-28 | `mvp3-phase2.test.js` 3/3; `npm test` 225/225 lulus | Modul assignments + tes CRUD/publikasi/RBAC/unduh/filter draft; revisi temuan review |
| 3 — Submission & Validasi Berkas | ✅ | 2026-11-28 | 2026-11-28 | `mvp3-phase3.test.js` 2/2; `npm test` 225/225 lulus | Modul submissions + validasi magic-byte/deadline/private storage/resubmission; revisi temuan review |
| 4 — Penilaian 0–100 | ✅ | 2026-11-28 | 2026-11-28 | `mvp3-phase4.test.js` 2/2; `npm test` 227/227 lulus | Modul grading skor 0–100 + feedback + audit GRADE_SUBMISSION; DTO Zod + RBAC dosen/admin |
| 5 — Integrasi & Handoff | ⬜ | — | — | — | — |

### 9.2 Log Progress

| Tanggal | Fase | Ringkasan | File utama tersentuh | Hasil tes | Commit |
|---|---|---|---|---|---|
| 2026-11-27 | — | Dokumen plan MVP 3 dibuat (belum ada implementasi) | `IMPLEMENTATION_PLAN_MVP3_BACKEND.md` | — | — |
| 2026-11-27 | 0 | Prasyarat bersama MVP 3: entitas audit `assignments`/`submissions`, `MAX_SUBMISSION_SIZE_MB` (5–10MB), helper signature magic-byte, factory middleware unggah dokumen (soal opsional + submission), kategori storage `assignment` | `backend/src/constants/auditEntities.js`, `backend/src/config/env.js`, `backend/src/utils/fileSignature.js`, `backend/src/utils/storage.js`, `backend/src/middlewares/upload.middleware.js`, `backend/tests/mvp3-phase0.test.js`, `backend/.env.example` | `npm test` → 220/220 lulus (190 baseline + 30 baru) | 6a52fec |
| 2026-11-27 | 1 | Model `Assignment` & `Submission` + relasi balik `Meeting`/`Mahasiswa`/`File`; migrasi `add_elearning_mvp3_assignments_submissions` diterapkan ke `rpl_lms` (dev) dan `rpl_review` (deploy) | `backend/prisma/schema.prisma`, `backend/prisma/migrations/20261127163147_add_elearning_mvp3_assignments_submissions/migration.sql` | `prisma validate` OK; `prisma migrate status` up to date; delegate `assignment`/`submission` OK; `npm test` → 220/220 lulus | e4e9192 |
| 2026-11-28 | 2–3 | Implementasi API penerbitan tugas dan pengumpulan jawaban: CRUD tugas, draft/publikasi, unduh soal, resubmission, roster, download submission, validasi MIME/signature/ukuran/deadline, audit mutasi, dan cleanup berkas. | `backend/src/modules/assignments/*`, `backend/src/modules/submissions/*`, `backend/src/app.js`, `backend/tests/mvp3-phase2.test.js`, `backend/tests/mvp3-phase3.test.js` | Fase 0 30/30; Fase 2 1/1; Fase 3 1/1; `npm test` 222/222 lulus; `prisma validate` OK | a3775ae |
| 2026-11-28 | 2–3 | Perbaikan review: checklist tes permanen diperluas, late roster dihitung dari `is_late`, PUT file-only diizinkan, cleanup berkas dibungkus try/finally, kontras `_count.submissions` ditambah, dan validasi soal memakai `STORAGE.DOC_MAX_SIZE`. | `assignment.dto.js`, `assignment.service.js`, `submission.service.js`, `mvp3-phase2.test.js`, `mvp3-phase3.test.js`, `IMPLEMENTATION_PLAN_MVP3_BACKEND.md` | Fase 2–3 3/3 lulus; `npm test` 223/223 lulus; `prisma validate` OK | b9b071c |
| 2026-11-28 | 2–3 | Pelengkapan bukti review Fase 1: tambah tes Admin/tanpa soal, filter draft untuk mahasiswa, RBAC mutasi dosen lain/mahasiswa, unduh soal 403/401, dan assertion lokasi private storage submissions. | `backend/tests/mvp3-phase2.test.js`, `backend/tests/mvp3-phase3.test.js`, `IMPLEMENTATION_PLAN_MVP3_BACKEND.md` | Fase 2 3/3 dan Fase 3 2/2 lulus; `npm test` 225/225 lulus | e46a153 |
| 2026-11-28 | 2–3 | Perapian kontrak: hapus field duplikat `submission_count` dan pertahankan `_count.submissions`; pesan batas ukuran soal diturunkan dari `maxSize`. Tes daftar tugas dosen ikut mengunci bentuk kontrak. | `backend/src/modules/assignments/assignment.service.js`, `backend/tests/mvp3-phase2.test.js`, `IMPLEMENTATION_PLAN_MVP3_BACKEND.md` | `npm test` 225/225 lulus | 8ffa08a |
| 2026-11-28 | 4 | Implementasi PUT /api/submissions/:id/grade: Zod DTO score 0–100 (maks 2 desimal), feedback opsional 2000 karakter, service gradeSubmission dengan audit GRADE_SUBMISSION (old/new values), controller, route. Tes mencakup batas skor, feedback null, RBAC mahasiswa 403/dosen-lain 403/admin 200, perubahan skor multi-audit, isolasi submission antar mahasiswa. | `submission.dto.js`, `submission.service.js`, `submission.controller.js`, `submission.routes.js`, `mvp3-phase4.test.js`, `IMPLEMENTATION_PLAN_MVP3_BACKEND.md` | Fase 4 2/2 lulus; `npm test` 227/227 lulus | bbb2741 |

**Format acuan baris baru (jangan dihapus; tambahkan baris di bawah tabel):**

```text
| YYYY-MM-DD | <nomor fase> | <ringkasan perubahan> | <file utama> | <perintah + hasil> | <hash singkat / "belum commit"> |
```

Contoh:

```text
| 2026-12-01 | 1 | Model Assignment & Submission + migrasi add_elearning_mvp3_assignments_submissions | prisma/schema.prisma, prisma/migrations/... | prisma validate OK; npm test 190/190 | abc1234 |
```

### 9.3 Aturan Penutupan Fase

Sebuah fase baru boleh ditandai `✅` bila **semua** syarat berikut terpenuhi:

1. Seluruh butir `[ ]` pada fase tersebut sudah menjadi `[x]`.
2. Pengujian spesifik fase lulus.
3. `npm test` tidak menunjukkan regresi pada suite MVP 1–2.
4. Baris log Bab 9.2 sudah ditambahkan dengan hasil tes dan commit.
5. Status di Bab 9.1 sudah diperbarui (tanggal mulai/selesai + catatan).

Jika salah satu syarat belum terpenuhi, status tetap `🔄` (sedang dikerjakan) atau `⏸️` (tertunda) — **bukan** `✅`.