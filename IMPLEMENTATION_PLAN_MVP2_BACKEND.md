# Implementation Plan: Backend MVP 2
# SPADA (Learning Management System) Universitas PGRI Semarang (UPGRIS)
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

## 3. Desain Skema Database Tambahan (Migrasi `add_spada_mvp2_meetings_attendance`)

```prisma
// ==========================================
// 1. STRUKTUR 16 PERTEMUAN KELAS SPADA
// ==========================================

model Meeting {
  id             String        @id @default(uuid())
  class_id       String
  meeting_number Int           // Angka 1 s.d. 16
  title          String        // Judul topik perkuliahan
  description    String?       // Ringkasan instruksi & capaian pembelajaran
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
  id          String   @id @default(uuid())
  meeting_id  String
  title       String   // Judul materi
  description String?  // Deskripsi pengantar materi
  file_id     String   // Relasi ke tabel File
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
  id                String           @id @default(uuid())
  meeting_id        String           @unique // 1 Sesi Presensi per Pertemuan
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
  id          String         @id @default(uuid())
  session_id  String
  student_id  String         // Relasi ke Mahasiswa
  status      PresenceStatus @default(HADIR)
  recorded_at DateTime       @default(now())
  notes       String?        // Catatan khusus (misal alasan sakit/izin)

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

### Fase 1: Migrasi Skema Database MVP 2 (Hari 1)
- Menambahkan model `Meeting`, `Material`, `AttendanceSession`, `AttendanceRecord`, serta enum `ExamType`, `AttendanceStatus`, `PresenceStatus` pada `schema.prisma`.
- Menjalankan migrasi database: `npx prisma migrate dev --name add_spada_mvp2_meetings_attendance`.
- Menambahkan hook auto-generate 16 pertemuan saat kelas dibuat di service kelas MVP 1.

### Fase 2: Service & API 16 Pertemuan Terstruktur (Hari 2–3)
- Implementasi generator 16 pertemuan otomatis (Pertemuan 1 s.d. 16, P-8 UTS, P-16 UAS).
- Implementasi endpoint `GET /api/classes/:classId/meetings` dan `GET /api/meetings/:id`.
- Implementasi endpoint pembaruan topik oleh dosen `PUT /api/meetings/:id` dengan verifikasi kepemilikan kelas.

### Fase 3: Modul Unggah & Distribusi Materi Terproteksi (Hari 4–5)
- Konfigurasi middleware upload file materi (penyimpanan direktori lokal terproteksi).
- Implementasi endpoint `POST /api/meetings/:meetingId/materials` dan `DELETE /api/materials/:id`.
- Implementasi endpoint aman `GET /api/materials/:id/download` dengan validasi:
  - Tolak (403) jika user bukan dosen pengampu atau bukan mahasiswa yang dienroll pada kelas tersebut.
  - Pipe streaming berkas dengan header `Content-Disposition`.
- Pencatatan mutasi materi ke `audit_logs`.

### Fase 4: Sesi Presensi & Check-in Mandiri Mahasiswa (Hari 6–7)
- Implementasi endpoint buka sesi presensi `POST /api/meetings/:meetingId/attendance/open` dan tutup sesi `close`.
- Implementasi endpoint check-in mahasiswa `POST /api/attendance/:sessionId/check-in`:
  - Pengecekan status sesi (`OPEN`). Jika `CLOSED`, tolak dengan status 400 Bad Request: *"Sesi presensi belum dibuka atau telah ditutup oleh Dosen Pengampu."*
  - Pengecekan kepesertaan: Mahasiswa wajib berstatus *enrolled* di kelas terkait.
  - Pencatatan kehadiran mandiri (`HADIR`).
- Implementasi endpoint koreksi kehadiran oleh dosen `PUT /api/attendance/records/:id`.

### Fase 5: Layanan Rekapitulasi Kehadiran & Kalkulasi Persentase (Hari 8)
- Implementasi endpoint rekapitulasi kehadiran kelas `GET /api/classes/:classId/attendance-recap`.
- Algoritma perhitungan persentase kehadiran mahasiswa:
  - Menghitung total pertemuan yang telah diselenggarakan (sesi presensi yang pernah dibuka).
  - Menghitung jumlah kehadiran status `HADIR` tiap mahasiswa.
  - Menghitung persentase kehadiran format desimal (`%`).
  - Mengembalikan daftar matrix kehadiran mahasiswa (Pertemuan 1 s.d. 16) untuk ditampilkan di tabel rekap dosen dan mahasiswa.

### Fase 6: Pengujian Unit/Integration, Validasi Keamanan & Handoff (Hari 9–10)
- Pengujian otomatis:
  - Verifikasi auto-generate 16 pertemuan saat pembukaan kelas baru.
  - Verifikasi unduh materi: Mahasiswa terdaftar sukses mengunduh, mahasiswa luar kelas ditolak (403).
  - Verifikasi presensi: Check-in berhasil saat status `OPEN`, gagal saat status `CLOSED`.
  - Verifikasi akurasi persentase kehadiran pada rekapitulasi.
- Dokumentasi API untuk frontend tim.

---

## 7. Kriteria Keberhasilan (Definition of Done MVP 2 Backend)

1. **16 Pertemuan Otomatis Terbentuk:** Setiap kelas baru otomatis memiliki 16 pertemuan lengkap dengan P-8 sebagai UTS dan P-16 sebagai UAS.
2. **Distribusi Materi Aman & Berjalan:** Dosen pengampu dapat mengunggah berkas materi dan mahasiswa terdaftar dapat mengunduh berkas materi secara aman. Mahasiswa luar kelas ditolak aksesnya (HTTP 403).
3. **Presensi Digital Terkendali:** Sesi presensi dapat dibuka dan ditutup oleh dosen. Mahasiswa hanya dapat melakukan check-in saat sesi berstatus `OPEN`.
4. **Koreksi & Rekapitulasi Kehadiran Akurat:** Dosen dapat mengoreksi status presensi, dan sistem mampu merekapitulasi persentase kehadiran seluruh mahasiswa kelas secara akurat sebagai persiapan syarat ujian $\ge 70\%$ pada MVP 5.
5. **Jejak Audit Terpelihara:** Aktivitas mutasi berkas materi dan pembukaan sesi presensi tercatat di tabel `audit_logs`.
