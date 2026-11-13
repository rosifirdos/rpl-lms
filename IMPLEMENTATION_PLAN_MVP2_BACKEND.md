# Implementation Plan: Backend MVP 2
# E-Learning Kampus (Learning Management System) Universitas
**Team Membangun Negeri — Rencana Eksekusi Teknis Backend: Ruang Kelas 16 Pertemuan, Distribusi Materi & Presensi Digital**

---

Dokumen ini memuat rencana implementasi teknis sisi **Backend** untuk mencapai target **MVP 2** secara presisi, yang diselaraskan dengan spesifikasi pada [SRS.md](SRS.md) (*Bab 5, 8, 13, 21, 27*) serta [PRD.md](PRD.md) (*Bab 2, 4, 5, 7*):

> **Definisi MVP 2 (SRS Bab 27 & PRD Bab 7):**
> *"Antarmuka dan backend Ruang Kelas berbasis silabus 16 Pertemuan terstruktur, Modul Materi Pembelajaran (unggah dosen, unduh mahasiswa terproteksi), dan Modul Presensi Digital (buka sesi, pengisian kehadiran mahasiswa mandiri, tutup sesi, dan rekapitulasi kehadiran)."*

Rencana ini adalah **kelanjutan langsung** dari [IMPLEMENTATION_PLAN_MVP1_BACKEND.md](IMPLEMENTATION_PLAN_MVP1_BACKEND.md) — seluruh konvensi arsitektur backend MVP 1 (modular Express + Prisma ORM + PostgreSQL + Zod DTO + `AuditLog` + respons terstandar) dilanjutkan secara terpadu.

---

## 1. Tujuan & Ruang Lingkup MVP 2 (Sisi Backend)

1. **Ruang Kelas Berbasis Struktur 16 Pertemuan (SRS Bab 5 & Bab 27)**
   - Inisialisasi otomatis 16 pertemuan terstruktur saat kelas dibuka oleh Admin (Pertemuan 1 s.d. 16 per kelas).
   - Penandaan khusus jenis pertemuan:
     - **Pertemuan 1–7:** Pembelajaran Pra-UTS.
     - **Pertemuan 8:** Ujian Tengah Semester (UTS) — `is_exam = true`, `exam_type = 'UTS'`.
     - **Pertemuan 9–15:** Pembelajaran Pasca-UTS.
     - **Pertemuan 16:** Ujian Akhir Semester (UAS) — `is_exam = true`, `exam_type = 'UAS'`.
   - Dosen pengampu memiliki wewenang penuh memperbarui judul topik, deskripsi/instruksi, dan status publikasi (`is_published`) tiap pertemuan.
2. **Modul Distribusi Materi Pembelajaran (SRS Bab 5 & Bab 21)**
   - Dosen dapat mengunggah berkas materi pada setiap pertemuan (judul materi, deskripsi, file attachment).
   - Berkas materi disimpan di *isolated private storage* dan dicatat metadatanya di tabel `files`.
   - Mahasiswa yang terdaftar (*enrolled*) pada kelas berhak mengunduh berkas materi melalui streaming endpoint aman (`GET /api/materials/:id/download`).
   - Penolakan akses (HTTP 403 Forbidden) bagi mahasiswa yang tidak terdaftar pada kelas terkait.
3. **Modul Presensi Digital Terkendali (SRS Bab 8 & Bab 21)**
   - Model sesi presensi (`AttendanceSession`) terikat relasi 1:1 terhadap suatu `Meeting`.
   - Dosen pengampu mengendalikan status sesi secara eksplisit:
     - Buka sesi kehadiran (`POST /api/meetings/:id/attendance/open`) dengan batas toleransi waktu.
     - Tutup sesi kehadiran (`POST /api/meetings/:id/attendance/close`).
   - Mahasiswa terdaftar melakukan check-in mandiri (`POST /api/attendance/:sessionId/check-in`):
     - Validasi ketat: Check-in hanya diterima jika status sesi adalah `OPEN`.
     - Penolakan otomatis (HTTP 400/403) jika sesi belum dibuka atau sudah ditutup oleh dosen.
     - Pencegahan check-in ganda (unique constraint `[session_id, student_id]`).
   - Dosen pengampu dapat mengoreksi status kehadiran mahasiswa (`HADIR`, `SAKIT`, `IZIN`, `ALPA`) beserta catatan keterangan.
   - Endpoint rekapitulasi kehadiran kelas (`GET /api/classes/:id/attendance-recap`) yang menghitung persentase kehadiran per mahasiswa terhadap total pertemuan yang telah diselenggarakan:
     $$\text{Persentase Kehadiran} = \left(\frac{\text{Total Hadir}}{\text{Total Pertemuan Berlangsung}}\right) \times 100\%$$
     *(Data persentase ini disiapkan sebagai fondasi gatekeeping kehadiran $\ge 70\%$ pada evaluasi UTS/UAS di MVP 5).*
4. **Otorisasi & Jejak Audit (Audit Trail):**
   - Pemeriksaan kepemilikan kelas (*Ownership Check*): Hanya dosen pengampu kelas atau Admin yang berhak memodifikasi materi dan sesi presensi.
   - Mahasiswa hanya dapat mengakses materi dan mengisi presensi pada kelas yang telah dienroll oleh Admin.
   - Setiap mutasi materi (unggah, hapus) dan perubahan status sesi presensi dicatat ke tabel `audit_logs`.

---

## 2. Keputusan Desain Teknis (Architecture Decisions)

1. **Auto-Generation 16 Pertemuan:** Saat kelas (`Class`) berhasil dibuat atau diaktifkan oleh Admin, sistem otomatis meng-generate 16 baris rekaman pada tabel `meetings` dalam satu transaksi Prisma (`prisma.$transaction`), dengan Pertemuan 8 bertipe `UTS` dan Pertemuan 16 bertipe `UAS`.
2. **Penyimpanan Berkas Terproteksi:** File materi tidak diletakkan di public assets, melainkan di direktori privat terisolasi server (`storage/materials/`). Pengunduhan dilakukan melalui endpoint perantara yang memverifikasi JWT dan kepesertaan (*enrollment check*) sebelum melakukan pipe streaming (*res.download / res.sendFile*).
3. **State Machine Sesi Presensi:** Sesi presensi berstatus `CLOSED` secara default. Transisi status dikendalikan oleh dosen: `CLOSED → OPEN → CLOSED`. Check-in mahasiswa hanya valid saat `status == 'OPEN'`.
4. **Idempotensi & Pencegahan Konkurensi:** Pengecekan check-in ganda ditegakkan oleh unique composite constraint database `@@unique([session_id, student_id])` untuk menjamin tidak ada duplikasi data kehadiran.

---

## 3. Desain Skema Database Tambahan (Migrasi `add_elearning_mvp2_meetings_attendance`)

```prisma
// ==========================================
// 1. STRUKTUR 16 PERTEMUAN KELAS E-LEARNING KAMPUS
// ==========================================

model Meeting {
  id             String        @id @default(uuid()) @db.Uuid
  class_id       String        @db.Uuid
  meeting_number Int           // Angka 1 s.d. 16
  title          String        @db.VarChar(150) // Judul topik perkuliahan
  description    String?       @db.Text // Ringkasan instruksi & capaian pembelajaran
  is_exam        Boolean       @default(false)
  exam_type      ExamType      @default(NONE)
  is_published   Boolean       @default(true)
  created_at     DateTime      @default(now())
  updated_at     DateTime      @updatedAt

  class              Class              @relation(fields: [class_id], references: [id], onDelete: Cascade)
  materials          Material[]
  attendance_session AttendanceSession?

  @@unique([class_id, meeting_number])
  @@map("meetings")
}

enum ExamType {
  NONE
  UTS
  UAS
}

// ==========================================
// 2. MATERI PEMBELAJARAN (DISTRIBUSI MATERI)
// ==========================================

model Material {
  id          String   @id @default(uuid()) @db.Uuid
  meeting_id  String   @db.Uuid
  title       String   @db.VarChar(150) // Judul materi
  description String?  @db.Text // Deskripsi pengantar materi
  file_id     String   @db.Uuid // Relasi ke tabel File
  created_at  DateTime @default(now())
  updated_at  DateTime @updatedAt

  meeting Meeting @relation(fields: [meeting_id], references: [id], onDelete: Cascade)
  file    File    @relation(fields: [file_id], references: [id], onDelete: Restrict)

  @@map("materials")
}

// ==========================================
// 3. PRESENSI DIGITAL TERKENDALI
// ==========================================

model AttendanceSession {
  id                String           @id @default(uuid()) @db.Uuid
  meeting_id        String           @unique @db.Uuid // 1 Sesi Presensi per Pertemuan
  opened_at         DateTime?
  closed_at         DateTime?
  status            AttendanceStatus @default(CLOSED)
  tolerance_minutes Int              @default(15) // Batas toleransi menit
  created_at        DateTime         @default(now())
  updated_at        DateTime         @updatedAt

  meeting Meeting            @relation(fields: [meeting_id], references: [id], onDelete: Cascade)
  records AttendanceRecord[]

  @@map("attendance_sessions")
}

enum AttendanceStatus {
  OPEN
  CLOSED
}

model AttendanceRecord {
  id          String         @id @default(uuid()) @db.Uuid
  session_id  String         @db.Uuid
  student_id  String         @db.Uuid // Relasi ke Mahasiswa
  status      PresenceStatus @default(HADIR)
  recorded_at DateTime       @default(now())
  notes       String?        @db.Text // Catatan khusus (misal alasan sakit/izin)

  session AttendanceSession @relation(fields: [session_id], references: [id], onDelete: Cascade)
  student Mahasiswa         @relation(fields: [student_id], references: [id], onDelete: Cascade)

  @@unique([session_id, student_id])
  @@map("attendance_records")
}

enum PresenceStatus {
  HADIR
  SAKIT
  IZIN
  ALPA
}
```

> **Catatan:** Model `Class` (MVP 1) telah diperluas dengan `meetings Meeting[]`, dan model `File` (MVP 1) dengan `materials Material[]`. Model `Mahasiswa` (MVP 1) dengan `attendance_records AttendanceRecord[]`. Semua relasi balik (*back-relation*) sudah dideklarasikan eksisitif sehingga `prisma validate` lolos.

---

## 4. Desain Spesifikasi API Endpoints MVP 2

### 4.1. Ruang Kelas & 16 Pertemuan (`/api/classes/:id/meetings` & `/api/meetings`)
| Method | Endpoint | Fungsi & Deskripsi | Hak Akses |
|---|---|---|---|
| `GET` | `/api/classes/:classId/meetings` | Ambil daftar 16 pertemuan terstruktur kelas beserta status materi & presensi | Mahasiswa (enrolled), Dosen (pengampu), Admin |
| `GET` | `/api/meetings/:id` | Detail pertemuan tertentu, daftar materi terlampir, dan info sesi presensi | Mahasiswa (enrolled), Dosen (pengampu), Admin |
| `PUT` | `/api/meetings/:id` | Dosen memperbarui judul topik, deskripsi, atau toggle status publikasi pertemuan | Dosen (pengampu), Admin |

### 4.2. Distribusi Materi Pembelajaran (`/api/materials`)
| Method | Endpoint | Fungsi & Deskripsi | Hak Akses |
|---|---|---|---|
| `POST` | `/api/meetings/:meetingId/materials` | Dosen mengunggah materi perkuliahan baru (judul, deskripsi, upload berkas) | Dosen (pengampu), Admin |
| `PUT` | `/api/materials/:id` | Dosen memperbarui informasi materi perkuliahan | Dosen (pengampu), Admin |
| `DELETE`| `/api/materials/:id` | Dosen menghapus materi perkuliahan | Dosen (pengampu), Admin |
| `GET` | `/api/materials/:id/download` | Mengunduh berkas materi terproteksi (verifikasi kepesertaan kelas) | Mahasiswa (enrolled), Dosen (pengampu), Admin |

### 4.3. Presensi Digital Terkendali (`/api/attendance`)
| Method | Endpoint | Fungsi & Deskripsi | Hak Akses |
|---|---|---|---|
| `POST` | `/api/meetings/:meetingId/attendance/open` | Dosen membuka sesi presensi pertemuan (set status `OPEN`, catat `opened_at`) | Dosen (pengampu), Admin |
| `POST` | `/api/meetings/:meetingId/attendance/close`| Dosen menutup sesi presensi pertemuan (set status `CLOSED`, catat `closed_at`) | Dosen (pengampu), Admin |
| `POST` | `/api/attendance/:sessionId/check-in` | Mahasiswa mengisi presensi mandiri (hanya diterima jika sesi `OPEN`) | Mahasiswa (enrolled) |
| `GET` | `/api/attendance/:sessionId/records` | Dosen melihat daftar kehadiran mahasiswa pada pertemuan terkait | Dosen (pengampu), Admin |
| `PUT` | `/api/attendance/records/:id` | Dosen mengoreksi status presensi mahasiswa (`HADIR`, `SAKIT`, `IZIN`, `ALPA`) | Dosen (pengampu), Admin |
| `GET` | `/api/classes/:classId/attendance-recap`| Rekapitulasi kehadiran 16 pertemuan kelas & hitung persentase kehadiran mahasiswa | Mahasiswa (personal), Dosen, Admin |

---

## 5. Struktur Direktori Penambahan Backend MVP 2

```text
backend/src/modules/
├── meetings/                      # Modul Ruang Kelas 16 Pertemuan
│   ├── meeting.controller.js      # Handler HTTP pertemuan
│   ├── meeting.service.js         # Logika bisnis: auto-generate 16 pertemuan, update topik
│   └── meeting.dto.js             # Validasi Zod skema pertemuan
├── materials/                     # Modul Materi Perkuliahan
│   ├── material.controller.js     # Handler HTTP upload, update, delete & download materi
│   ├── material.service.js        # Logika simpan berkas, verifikasi hak unduh kelas
│   └── material.dto.js            # Validasi Zod payload materi
└── attendance/                    # Modul Presensi Digital
    ├── attendance.controller.js   # Handler buka/tutup sesi, check-in, koreksi, rekap
    ├── attendance.service.js      # Validasi status sesi OPEN/CLOSED, kalkulasi persentase
    └── attendance.dto.js          # Validasi Zod sesi & check-in
```

---

## 6. Tahapan Eksekusi Pengerjaan (Step-by-Step Roadmap MVP 2)

### Peta Dependensi & Modalitas Paralelisasi

Roadmap di bawah **tidak seluruhnya runtut**. Pola ketergantungannya:

```text
Fase 0 + 1  ──▶  Fase 2 ∥ Fase 3 ∥ Fase 4 ∥ (implementasi) Fase 5  ──▶  Fase 6
 (gerbang keras)         (modul independen, berkas terpisah)          (penutup)
```

| Fase | Butuh Fase 1? | Butuh fase lain? | Dapat diparalelkan |
|---|---|---|---|
| 1 — Migrasi Skema | — | — | ❌ Wajib lebih dulu (gerbang keras) |
| 2 — 16 Pertemuan | Ya (`Meeting`) | Tidak | ✅ |
| 3 — Materi | Ya (`Meeting`, `Material`) | Tidak | ✅ |
| 4 — Presensi | Ya (2 tabel presensi) | Tidak | ✅ |
| 5 — Rekapitulasi | Ya (2 tabel presensi) | **Verifikasi** menunggu Fase 4 | ⚠️ Kode boleh duluan |
| 6 — Pengujian & Handoff | Ya | Ya (seluruh fase) | ❌ Penutup |

**Fase 1 bersifat blocking mutlak.** Tanpa keempat tabel pada `schema.prisma` beserta migrasinya, Prisma Client tidak memiliki delegate `prisma.meeting`, `prisma.material`, `prisma.attendanceSession`, dan `prisma.attendanceRecord` — kode Fase 2–5 gagal saat *import*, bukan sekadar belum lengkap. Karena `schema.prisma` adalah satu berkas dengan satu migrasi, keempat model **harus mendarat bersamaan**; fase ini dikerjakan satu orang dan menjadi titik serialisasi proyek.

**Fase 2, 3, 4, dan implementasi Fase 5 tidak saling memanggil.** Fase 3 mengaitkan berkas ke `Meeting` dan memverifikasi kepesertaan dari data *enrollment* MVP 1; Fase 4 memverifikasi kepemilikan kelas melalui `meeting → class → lecturer` dan kepesertaan melalui *enrollment* yang sama; Fase 5 hanya membaca agregat tabel presensi. Tidak satu pun memanggil service fase lain, dan berkasnya terpisah (`modules/meetings/`, `modules/materials/`, `modules/attendance/`), sehingga konflik merge praktis nihil.

> **Catatan verifikasi Fase 5:** untuk membuktikan persentase kehadiran benar, dibutuhkan data sesi yang pernah dibuka/ditutup oleh Fase 4. Kode rekapitulasi boleh dikerjakan paralel, tetapi pengujiannya baru dapat dijalankan setelah Fase 4 selesai.

> **Penting — pengujian jangan ditumpuk ke Fase 6.** Setiap fase di bawah sudah memuat butir pengujiannya sendiri; itulah yang membuat paralelisasi aman. Fase 6 hanya untuk uji lintas-modul (isolasi antar kelas, RBAC gabungan) dan pemutakhiran OpenAPI.

---

### Fase 0: Prasyarat Bersama Sebelum Paralelisasi (Hari 1, bersama Fase 1) ✅ **SELESAI**

Tiga komponen berikut dipakai berulang oleh Fase 2–5 namun **belum ada di MVP 1**. Telah diselesaikan dalam PR terpisah (merged ke `main`):

1. **Helper terpusat pemeriksaan kepemilikan kelas (*ownership check*).** (`src/utils/ownership.js`)
2. **Middleware `uploadMaterial`** pada `src/middlewares/upload.middleware.js` (batas 10MB, ekstensi `.pdf/.docx/.xlsx/.zip`).
3. **Konvensi penamaan `entity` pada `audit_logs`.** (`src/constants/auditEntities.js` — `meetings`, `materials`, `attendance_sessions`).

**Konvensi pengujian paralel:** suite memakai databases bersama `rpl_review` dengan `--test-concurrency=1`. `tests/setup.js` hanya menyapu sisa data kelas yang namanya berawalan `TEST-` atau `KAP-`.

---

### Fase 1: Migrasi Skema Database MVP 2 (Hari 1) ✅ **SELESAI**

- [x] Menambahkan model `Meeting`, `Material`, `AttendanceSession`, `AttendanceRecord`, serta enum `ExamType`, `AttendanceStatus`, `PresenceStatus` pada `schema.prisma`.
- [x] Menambahkan relasi balik yang diwajibkan Prisma: `meetings Meeting[]` pada model `Class`, `materials Material[]` pada model `File`, `attendance_records AttendanceRecord[]` pada model `Mahasiswa`.
- [x] Menjalankan `npx prisma validate`, lalu migrasi database: `npx prisma migrate dev --name add_elearning_mvp2_meetings_attendance`.
- [x] **Migrasi berhasil diterapkan** pada database `rpl_lms` (migration `20261113125204_add_elearning_mvp2_meetings_attendance`).
- [x] Prisma Client ter-generate ulang dengan delegate baru: `prisma.meeting`, `prisma.material`, `prisma.attendanceSession`, `prisma.attendanceRecord`.

---

### Fase 2: Service & API 16 Pertemuan Terstruktur (Hari 2–3)

- [ ] Implementasi hook auto-generate 16 pertemuan saat kelas dibuat di service kelas MVP 1 (di `ClassesService.createClass`).
- [ ] Implementasi endpoint `GET /api/classes/:classId/meetings` dan `GET /api/meetings/:id`.
- [ ] Implementasi endpoint pembaruan topik oleh dosen `PUT /api/meetings/:id` dengan verifikasi kepemilikan kelas (memakai helper Fase 0).

> **Hindari duplikasi generator:** butir "implementasi generator 16 pertemuan" **tidak lagi dicantumkan di sini** karena hook auto-generate sudah dikerjakan pada Fase 1. Sumber kebenaran tunggal struktur 16 pertemuan sudah tersedia di MVP 1 pada `src/constants/academic.js` (`TOTAL_MEETINGS: 16` dan `EXAM_MEETINGS { 8: 'UTS', 16: 'UAS' }`). Fase 2 hanya **membaca** hasil generate tersebut dari tabel `meetings`, tidak membuat generator kedua.

---

### Fase 3: Modul Unggah & Distribusi Materi Terproteksi (Hari 4–5)

- [ ] Konfigurasi middleware upload file materi (penyimpanan direktori lokal terproteksi).
- [ ] Implementasi endpoint `POST /api/meetings/:meetingId/materials` dan `DELETE /api/materials/:id`.
- [ ] Implementasi endpoint aman `GET /api/materials/:id/download` dengan validasi:
  - Tolak (403) jika user bukan dosen pengampu atau bukan mahasiswa yang dienroll pada kelas tersebut.
  - Pipe streaming berkas dengan header `Content-Disposition`.
- [ ] Pencatatan mutasi materi ke `audit_logs`.

---

### Fase 4: Sesi Presensi & Check-in Mandiri Mahasiswa (Hari 6–7)

- [ ] Implementasi endpoint buka sesi presensi `POST /api/meetings/:meetingId/attendance/open` dan tutup sesi `close`.
- [ ] Implementasi endpoint check-in mahasiswa `POST /api/attendance/:sessionId/check-in`:
  - Pengecekan status sesi (`OPEN`). Jika `CLOSED`, tolak dengan status 400 Bad Request: *"Sesi presensi belum dibuka atau telah ditutup oleh Dosen Pengampu."*
  - Pengecekan kepesertaan: Mahasiswa wajib berstatus *enrolled* di kelas terkait.
  - Pencatatan kehadiran mandiri (`HADIR`).
- [ ] Implementasi endpoint koreksi kehadiran oleh dosen `PUT /api/attendance/records/:id`.

---

### Fase 5: Layanan Rekapitulasi Kehadiran & Kalkulasi Persentase (Hari 8)

- [ ] Implementasi endpoint rekapitulasi kehadiran kelas `GET /api/classes/:classId/attendance-recap`.
- [ ] Algoritma perhitungan persentase kehadiran mahasiswa:
  - Menghitung total pertemuan yang telah diselenggarakan (sesi presensi yang pernah dibuka).
  - Menghitung jumlah kehadiran status `HADIR` tiap mahasiswa.
  - Menghitung persentase kehadiran format desimal (`%`).
  - Mengembalikan daftar matrix kehadiran mahasiswa (Pertemuan 1 s.d. 16) untuk ditampilkan di tabel rekap dosen dan mahasiswa.
- [ ] **Implementasi boleh dikerjakan paralel dengan Fase 2–4**, namun verifikasinya menunggu Fase 4 (butuh data sesi yang pernah dibuka/ditutup).

---

### Fase 6: Pengujian Unit/Integration, Validasi Keamanan & Handoff (Hari 9–10)

- [ ] Pengujian otomatis:
  - Verifikasi auto-generate 16 pertemuan saat pembukaan kelas baru.
  - Verifikasi unduh materi: Mahasiswa terdaftar sukses mengunduh, mahasiswa luar kelas ditolak (403).
  - Verifikasi presensi: Check-in berhasil saat status `OPEN`, gagal saat status `CLOSED`.
  - Verifikasi akurasi persentase kehadiran pada rekapitulasi.
- [ ] Dokumentasi API untuk frontend tim.

---

### Strategi Pengerjaan Menurut Ukuran Tim

| Ukuran Tim | Strategi |
|---|---|
| **1 orang** | Kerjakan runtut Fase 0 → 1 → 2 → 3 → 4 → 5 → 6. Paralelisasi tidak memberi keuntungan; dokumen ini memang disusun untuk satu jalur eksekusi 10 hari. |
| **3–4 orang** | Kerjakan **Fase 0 + Fase 1 bersama-sama lebih dulu** (satu orang sebagai pemilik `schema.prisma`), baru lepas Fase 2, 3, 4, dan implementasi Fase 5 secara paralel. Fase 6 dikerjakan bersama di akhir. |

**Ringkasan ketergantungan:** Fase 1 adalah gerbang keras yang wajib diselesaikan lebih dulu; Fase 2–5 dapat berjalan paralel; verifikasi Fase 5 dan seluruh Fase 6 bersifat menunggu.

---

## 7. Kriteria Keberhasilan (Definition of Done MVP 2 Backend)

1. **16 Pertemuan Otomatis Terbentuk:** Setiap kelas baru otomatis memiliki 16 pertemuan lengkap dengan P-8 sebagai UTS dan P-16 sebagai UAS.
2. **Distribusi Materi Aman & Berjalan:** Dosen pengampu dapat mengunggah berkas materi dan mahasiswa terdaftar dapat mengunduh berkas materi secara aman. Mahasiswa luar kelas ditolak aksesnya (HTTP 403).
3. **Presensi Digital Terkendali:** Sesi presensi dapat dibuka dan ditutup oleh dosen. Mahasiswa hanya dapat melakukan check-in saat sesi berstatus `OPEN`.
4. **Koreksi & Rekapitulasi Kehadiran Akurat:** Dosen dapat mengoreksi status presensi, dan sistem mampu merekapitulasi persentase kehadiran seluruh mahasiswa kelas secara akurat sebagai persiapan syarat ujian $\ge 70\%$ pada MVP 5.
5. **Jejak Audit Terpelihara:** Aktivitas mutasi berkas materi dan pembukaan sesi presensi tercatat di tabel `audit_logs`.