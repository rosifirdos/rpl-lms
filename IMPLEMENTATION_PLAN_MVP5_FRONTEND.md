# Implementation Plan: Frontend MVP 5
# E-Learning Kampus (Learning Management System) Universitas
**Team Membangun Negeri — Rencana Eksekusi Teknis Frontend: Evaluasi UTS/UAS, Gatekeeping Kehadiran, Rekap Nilai & Monitoring Audit**

---

> **Acuan:** [PRD.md](PRD.md) (*Bab 2, 3, 5, 7 — MVP 5*), [SRS.md](SRS.md) (*Bab 7.8, 8.7, FR-026/027/042/043/049–052/055/056/058, 27*), [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md), [IMPLEMENTATION_PLAN_MVP1_FRONTEND.md](IMPLEMENTATION_PLAN_MVP1_FRONTEND.md), [IMPLEMENTATION_PLAN_MVP4_FRONTEND.md](IMPLEMENTATION_PLAN_MVP4_FRONTEND.md), [IMPLEMENTATION_PLAN_MVP5_BACKEND.md](IMPLEMENTATION_PLAN_MVP5_BACKEND.md) (rencana & kontrak usulan backend), dan [backend/docs/openapi.yaml](backend/docs/openapi.yaml) **v1.4.1**.
>
> **Definisi MVP 5 (PRD Bab 7):** *"Evaluasi Ujian (UTS P-8 & UAS P-16), Gatekeeping Kehadiran & Audit Trail."*
>
> **⚠️ Status dependensi backend:** `IMPLEMENTATION_PLAN_MVP5_BACKEND.md` **sudah tersedia**, tetapi OpenAPI 1.4.1 **belum memuat** endpoint ujian, gatekeeping, rekap nilai, atau ekspor nilai (rencana belum diimplementasikan). Dokumen ini membedakan tegas:
> - **Dapat dikerjakan sekarang** — konfigurasi ambang kehadiran, monitoring audit, dan kesiapan UI yang memakai endpoint eksisting.
> - **Terblokir backend** — halaman ujian, gatekeeping, rekap nilai, ekspor. Kontrak di Bab 4.2 adalah **usulan** yang harus disepakati sebelum implementasi; jangan membuat mock permanen yang diklaim selesai.
>
> **Prasyarat:** Frontend MVP 1–4 selesai; backend MVP 5 tersedia dan terdokumentasi di OpenAPI.

---

## 0. Protokol Pengerjaan & Tracking Progress (WAJIB untuk Agent)

### 0.1 Legenda Status

| Simbol | Arti |
|---|---|
| ⬜ | Belum dikerjakan |
| 🔄 | Sedang dikerjakan |
| ⏸️ | Tertunda / terblokir prasyarat (backend) |
| ✅ | Selesai & terverifikasi |

### 0.2 Kewajiban Agent per Fase

1. **Sebelum mulai:** baca Bab 3, cek status backend pada Bab 1.3; fase yang terblokir **wajib** berstatus `⏸️`, bukan `🔄`.
2. **Saat mengerjakan:** centang `[x]` hanya untuk butir yang benar-benar selesai dan sudah diuji; catat deviasi pada log.
3. **Saat fase selesai:** jalankan `npm run typecheck`, `npm run test`, `npm run build`; ubah status fase menjadi `✅`; tambahkan **satu baris baru** di Bab 10.2.
4. **Aturan tambahan:** mock UI untuk fase terblokir hanya boleh berupa *design preview* di balik flag, tidak boleh dianggap selesai atau dirujuk RTM sebagai "Implemented".

### 0.3 Perintah Ringkas

```text
SEBELUM FASE : baca Bab 1.3 (kesiapan backend) & Bab 3 → set status 🔄/⏸️
SETELAH FASE : npm run typecheck && npm run test && npm run build → centang [x] → status ✅ → log 10.2
```

---

## 1. Tujuan & Ruang Lingkup MVP 5 (Frontend)

### 1.1 Tujuan

1. **Dosen** menyiapkan dan melaksanakan UTS (P-8) dan UAS (P-16), memantau peserta, serta menilai bila bentuk ujian esai.
2. **Mahasiswa** melihat kelayakan mengikuti ujian (persentase kehadiran vs ambang), mengerjakan ujian bila eligible, dan melihat hasil.
3. **Gatekeeping**: tombol akses UTS/UAS terkunci dengan penjelasan bila kehadiran < ambang; status eligibility berasal dari backend, bukan perhitungan klien.
4. **Rekapitulasi nilai & kehadiran** per kelas/semester: komponen tugas, kuis, presensi, UTS, UAS, nilai akhir; ekspor `.xlsx`/`.csv`.
5. **Admin**: konfigurasi ambang kehadiran, monitoring aktivitas pembelajaran lintas kelas, dan peninjauan audit trail lanjutan (filter, diff, ekspor).

### 1.2 In-Scope

- Halaman: Ujian per kelas, Detail/Lembar Ujian, Monitoring Ujian (dosen), Kelayakan Ujian (mahasiswa), Rekap Nilai & Kehadiran, Monitoring Aktivitas (admin), Audit Trail lanjutan.
- Integrasi endpoint eksisting: `GET/PUT /admin/config` (ambang), `GET /admin/audit-logs[/:id]`, `GET /classes/:classId/attendance-recap`.
- Integrasi endpoint baru (setelah backend tersedia): ujian, eligibility, rekap nilai, ekspor.
- Guard ketat: mahasiswa hanya melihat kelayakan & nilainya sendiri (BR-003).

### 1.3 Kesiapan Backend (Sumber Kebenaran Sebelum Mulai)

| Kapabilitas | Status backend | Bukti | Dampak frontend |
|---|---|---|---|
| Ambang kehadiran (`attendance.threshold_percentage`, 0–100, default 70) | ✅ Tersedia | `constants/config.js`, `GET/PUT /admin/config` | Fase 1 dapat dikerjakan |
| Audit log list/detail + filter | ✅ Tersedia | `GET /admin/audit-logs`, `GET /admin/audit-logs/:id` | Fase 2 dapat dikerjakan |
| Rekap kehadiran per kelas | ✅ Tersedia | `GET /classes/:classId/attendance-recap` | Sebagian Fase 4 dapat dikerjakan |
| Meeting UTS/UAS (`is_exam`, `exam_type`) | ✅ Data model tersedia | `Meeting.is_exam`, `ExamType` | UI dapat menandai P-8/P-16 |
| Endpoint ujian (buat/soal/attempt/gatekeeping) | ❌ Belum ada | Tidak ada di OpenAPI 1.4.1 | Fase 3 **⏸️** |
| Endpoint rekap nilai & ekspor | ❌ Belum ada | Tidak ada di OpenAPI 1.4.1 | Fase 4 **⏸️** sebagian |
| Monitoring aktivitas lintas kelas (FR-051) | ❌ Belum ada | `/dashboard` hanya agregat admin | Fase 5 **⏸️** |

**Aturan:** jangan memakai endpoint yang tidak ada di OpenAPI. Bila backend MVP 5 belum selesai, hentikan fase terkait dan laporkan, bukan membuat data palsu.

---

## 2. Kondisi Frontend Saat Ini & Gap Analysis

| Halaman | Berkas | Kondisi saat ini | Tindakan |
|---|---|---|---|
| Rekap Nilai & Presensi | `features/akademik/RekapNilaiDanPresensi.jsx` | Fixture | `GET /classes/:classId/attendance-recap` + rekap nilai (baru) |
| Rekap Kehadiran | `features/akademik/RekapKehadiran.jsx` | Fixture (MVP 2) | Selesaikan di MVP 2; MVP 5 menambah kolom kelayakan |
| Audit Trail | `features/admin/JejakAudit.jsx` | Fixture | `GET /admin/audit-logs` |
| Konfigurasi Sistem | `features/admin/KonfigurasiSistem.jsx` | Fixture | `GET/PUT /admin/config` termasuk ambang |
| Monitoring Admin | `features/admin/DasborAdmin.jsx` | Fixture | Metrik `/dashboard`; monitoring lintas kelas belum ada |
| Ujian | belum ada | — | Terblokir backend |

### 2.1 Gap Spesifik MVP 5

| # | Gap | Dampak | Rencana |
|---|---|---|---|
| G5-01 | Belum ada endpoint ujian/eligibility | Tidak dapat membangun UI ujian riil | Tunggu backend; siapkan kontrak Bab 4.2 |
| G5-02 | Belum ada endpoint rekap nilai | Rekap tidak dapat dihitung benar | Tunggu backend; jangan menjumlahkan di klien sebagai sumber kebenaran |
| G5-03 | `JejakAudit.jsx` masih fixture | Admin tidak dapat menelusuri | Fase 2 |
| G5-04 | Ambang kehadiran belum dapat diubah dari UI | Gatekeeping tidak dapat dikonfigurasi | Fase 1 |
| G5-05 | Tidak ada UI kelayakan ujian | Mahasiswa tidak tahu alasan terkunci | Fase 3 (butuh API eligibility) |
| G5-06 | Ekspor belum ada | Tidak ada bukti rekap | Fase 4 (butuh API ekspor) |
| G5-07 | Monitoring aktivitas lintas kelas belum ada | Admin buta aktivitas | Fase 5 (butuh API) |

---

## 3. Keputusan Arsitektur Khusus MVP 5

### 3.1 Rute

```text
/classes/:classId/exams                          # daftar UTS/UAS kelas
/classes/:classId/exams/:examId                  # detail/lembar ujian
/classes/:classId/exams/:examId/monitor          # monitoring peserta (dosen)
/classes/:classId/eligibility                    # kelayakan ujian mahasiswa
/classes/:classId/grade-recap                    # rekap nilai & kehadiran
/admin/monitoring                                # monitoring aktivitas (admin)
/admin/audit-logs                                # audit trail
/admin/config                                    # termasuk ambang kehadiran
```

Rute ujian memakai pola yang sama dengan kuis MVP 4 agar komponen timer/attempt dapat dipakai ulang.

### 3.2 Prinsip Gatekeeping

- **Sumber kebenaran:** backend mengembalikan `eligible`, `attendance_percentage`, `threshold_percentage`, dan `reason`.
- Frontend **tidak** menghitung eligibility sendiri; hanya menampilkan dan menonaktifkan tombol.
- Bila `eligible=false`: tampilkan persentase saat ini, ambang, kekurangan, dan jumlah pertemuan yang perlu dihadiri (bila backend menyediakan).
- Bila data eligibility tidak tersedia (mis. error), tombol **nonaktif** dengan pesan "Kelayakan belum dapat diverifikasi" — fail-closed.
- Perubahan ambang oleh admin tidak boleh langsung "membuka" ujian di UI tanpa refetch eligibility.

### 3.3 Rekap Nilai

- Komponen nilai: tugas, kuis, presensi, UTS, UAS, nilai akhir; bobot mengikuti kebijakan backend.
- Tabel: NIM, nama, tiap komponen, nilai akhir, status kelayakan.
- **Jangan** menghitung nilai akhir di klien; tampilkan nilai yang dikirim backend. Bila backend hanya mengirim komponen, tampilkan komponen dan tandai nilai akhir "Belum tersedia".
- Filter: tahun akademik, semester, kelas, pencarian mahasiswa.
- Ekspor `.xlsx`/`.csv` via blob; hormati `Content-Disposition`.
- Mahasiswa: hanya barisnya sendiri; dosen: seluruh kelas diampu; admin: seluruh kelas.

### 3.4 Audit Trail

- Filter: rentang tanggal, aksi, entitas, aktor, pencarian.
- Detail: metadata (aktor, IP, user agent, waktu) + diff `old_values` vs `new_values`.
- Masking: jangan tampilkan hash password/token; backend sudah menyaring, frontend tetap melakukan allowlist field.
- Pagination server-side; ekspor bila tersedia.

### 3.5 Ujian (setelah backend tersedia)

- Dosen: buat ujian pada pertemuan 8/16, tentukan jendela waktu, durasi, jenis soal, publikasi.
- Mahasiswa: lihat eligibility → mulai → kerjakan dengan timer server-side → submit → lihat hasil.
- Dosen: monitoring peserta (status, sisa waktu, submit), penilaian esai.
- Komponen timer, navigator soal, autosave, dan dialog submit **dipakai ulang** dari modul kuis MVP 4; jangan menduplikasi logika.

---

## 4. Matriks Kontrak API MVP 5

### 4.1 Tersedia Sekarang (OpenAPI 1.4.1)

| Halaman | Aksi | Method & Endpoint | Peran | Catatan |
|---|---|---|---|---|
| Konfigurasi | Baca | `GET /admin/config` | Admin | Termasuk `attendance.threshold_percentage` |
| Konfigurasi | Ubah | `PUT /admin/config` | Admin | Ambang 0–100; dicatat audit |
| Audit | List | `GET /admin/audit-logs` | Admin | Filter + pagination |
| Audit | Detail | `GET /admin/audit-logs/:id` | Admin | Diff old/new |
| Rekap Kehadiran | Baca | `GET /classes/:classId/attendance-recap` | Semua | Mahasiswa hanya data sendiri |
| Kelas | Baca | `GET /classes`, `GET /classes/:id` | Semua | Menandai P-8/P-16 |

### 4.2 Usulan Kontrak Baru (WAJIB disepakati dengan backend MVP 5)

> Tabel ini **bukan** kontrak yang sudah berlaku. Jangan mengimplementasikan pemanggilan sebelum endpoint muncul di OpenAPI.

| Kapabilitas | Usulan Method & Endpoint | Peran | Payload/Respons kunci |
|---|---|---|---|
| Daftar ujian kelas | `GET /classes/:classId/exams` | Semua | `items[]`: id, meeting_number, exam_type, open_at, close_at, duration, is_published, eligibility |
| Detail ujian | `GET /exams/:id` | Semua | metadata + soal tersanitasi untuk peserta |
| Buat/ubah ujian | `POST /meetings/:meetingId/exams`, `PUT /exams/:id` | Dosen/Admin | jendela waktu, durasi, publikasi |
| Publikasi | `PATCH /exams/:id/publish` | Dosen/Admin | `{ is_published }` |
| Kelayakan | `GET /classes/:classId/exams/:examId/eligibility` | Mahasiswa | `{ eligible, attendance_percentage, threshold_percentage, reason }` |
| Mulai attempt | `POST /exams/:id/attempts` | Mahasiswa | 403 bila tidak eligible |
| Simpan jawaban | `PUT /exam-attempts/:attemptId/answers` | Mahasiswa | sama seperti kuis |
| Submit | `POST /exam-attempts/:attemptId/submit` | Mahasiswa | auto-score PG |
| Roster/monitor | `GET /exams/:id/attempts` | Dosen/Admin | status + sisa waktu |
| Nilai esai | `PUT /exam-attempts/:attemptId/grade` | Dosen/Admin | poin + feedback |
| Rekap nilai | `GET /classes/:classId/grade-recap?academic_year&semester` | Semua | komponen + nilai akhir + eligibility |
| Ekspor nilai | `GET /classes/:classId/grade-recap/export?format=xlsx|csv` | Dosen/Admin | blob |
| Monitoring aktivitas | `GET /admin/monitoring?academic_year&semester` | Admin | metrik lintas kelas |

**Aturan integrasi:** setiap endpoint baru harus memiliki skema Zod respons di frontend dan test kontrak MSW sebelum halaman dianggap selesai.

---

## 5. Struktur Berkas Target (Tambahan)

```text
frontend/src/
├── features/ujian/
│   ├── ExamListPage.tsx
│   ├── ExamDetailPage.tsx
│   ├── ExamMonitorPage.tsx
│   ├── ExamEligibilityPage.tsx
│   ├── components/
│   │   ├── ExamCard.tsx
│   │   ├── EligibilityGate.tsx
│   │   ├── ExamCountdown.tsx
│   │   ├── ExamAttemptRoster.tsx
│   │   └── ExamGradingPanel.tsx
│   └── hooks/
│       ├── useExams.ts
│       └── useEligibility.ts
├── features/nilai/
│   ├── GradeRecapPage.tsx
│   ├── components/
│   │   ├── GradeRecapTable.tsx
│   │   ├── GradeComponentBreakdown.tsx
│   │   └── ExportButton.tsx
│   └── hooks/useGradeRecap.ts
├── features/admin/monitoring/
│   ├── MonitoringPage.tsx
│   └── hooks/useMonitoring.ts
├── features/admin/config/
│   └── AttendanceThresholdCard.tsx
├── services/endpoints/
│   ├── exams.ts
│   ├── gradeRecap.ts
│   └── monitoring.ts
└── types/ujian.ts
```

---

## 6. Fase Eksekusi

### 6.0 Prioritas Fase (Ringkasan)

| Fase | Prioritas | Prasyarat | Dapat paralel dengan | Catatan |
|---|---|---|---|---|
| 1 — Ambang Kehadiran | **P1** | MVP 1 Fase 4 (halaman config) | MVP 2–4 | Dapat dikerjakan lebih awal |
| 2 — Audit Trail | **P1** | MVP 1 Fase 2 (shell) | MVP 2–4 | Tidak menunggu ujian/rekap |
| 3 — Ujian & Gatekeeping | **⏸ P1** | MVP 4 Fase 5 + backend MVP 5 | — | Wajib menunggu kontrak API |
| 4 — Rekap Nilai & Ekspor | **⏸ P1** | Backend rekap nilai | Fase 5 | Bagian kehadiran (P2) dapat mulai setelah MVP 2 Fase 5 |
| 5 — Monitoring Admin | **⏸ P2** | Backend monitoring | — | Dapat ditunda |
| 6 — Hardening & Rilis | **P2** | Fase aktif MVP 5 | — | Gerbang akhir program |

**Aturan:**
- **Fase 1–2 tidak terblokir** dan sengaja diprioritaskan lebih awal agar bisa berjalan paralel dengan MVP 2–4.
- **Fase 3–5 tetap `⏸️`** sampai endpoint tersedia; jangan membuat mock yang diklaim selesai.
- **Fase 4 memiliki bagian modular:** kolom kehadiran dapat dibangun sekarang dari `attendance-recap`; kolom nilai menunggu backend.
- **Fase 6** hanya menutup fase yang benar-benar aktif; jangan menandai rilis bila masih ada fase `⏸️` yang menjadi syarat MVP 5.

### Fase 1 — Konfigurasi Ambang Kehadiran (⬜, dapat dikerjakan sekarang)

- [ ] `AttendanceThresholdCard` di `/admin/config`: input 0–100 (default 70), penjelasan dampak pada akses UTS/UAS.
- [ ] Validasi klien + pemetaan error 400; simpan `PUT /admin/config`; invalidasi cache konfigurasi.
- [ ] Tampilkan nilai efektif dari `GET /admin/config` (bukan asumsi default).
- [ ] Konfirmasi perubahan disertai ringkasan sebelum/sesudah.
- [ ] Test: baca, ubah valid, ubah invalid, 403.

**DoD fase:** admin dapat mengubah ambang kehadiran dan UI menampilkan nilai efektif.

---

### Fase 2 — Audit Trail Terintegrasi (⬜, dapat dikerjakan sekarang)

- [ ] Ganti fixture `JejakAudit.jsx` dengan `GET /admin/audit-logs`.
- [ ] Filter tanggal/aksi/entitas/aktor + pencarian; pagination server-side.
- [ ] Detail: metadata + diff `old_values`/`new_values`; allowlist field sensitif.
- [ ] Empty state, skeleton, error state + retry.
- [ ] Test: filter, pagination, detail, masking, 403.

**DoD fase:** audit trail dapat ditelusuri tanpa mock.

---

### Fase 3 — Ujian UTS/UAS & Gatekeeping (⏸️ terblokir backend)

- [ ] **Prasyarat:** endpoint Bab 4.2 tersedia di OpenAPI + backend teruji.
- [ ] `ExamListPage`: kartu UTS (P-8) & UAS (P-16) per kelas dengan status jendela waktu.
- [ ] `EligibilityGate`: tampilkan persentase kehadiran, ambang, status eligible, alasan; fail-closed saat error.
- [ ] `ExamDetailPage` mahasiswa: lembar ujian memakai ulang komponen kuis MVP 4 (timer server-side, navigator, autosave, submit).
- [ ] `ExamMonitorPage` dosen: status peserta, sisa waktu, submission, penilaian esai.
- [ ] Tangani 403 (tidak eligible) dengan pesan yang menjelaskan cara memenuhi syarat.
- [ ] Test: eligible/not eligible, timer, submit, 403, monitoring.

**DoD fase:** ujian dan gatekeeping berfungsi end-to-end berdasarkan API riil.

---

### Fase 4 — Rekap Nilai & Kehadiran + Ekspor (⏸️ sebagian terblokir)

- [ ] Integrasikan `GET /classes/:classId/attendance-recap` untuk kolom kehadiran (dapat dikerjakan sekarang).
- [ ] **Prasyarat rekap nilai:** endpoint `grade-recap` tersedia.
- [ ] `GradeRecapTable`: NIM, nama, komponen tugas/kuis/presensi/UTS/UAS, nilai akhir, status kelayakan.
- [ ] Filter tahun/semester/kelas/pencarian; tampilan mahasiswa hanya baris sendiri.
- [ ] Ekspor `.xlsx`/`.csv` via blob; tampilkan progres & error.
- [ ] Jangan menghitung nilai akhir di klien; tampilkan `—` bila backend belum mengirim.
- [ ] Test: render per peran, filter, ekspor, data tidak lengkap.

**DoD fase:** rekap nilai dan kehadiran tersaji sesuai data backend serta dapat diekspor.

---

### Fase 5 — Monitoring Aktivitas Admin (⏸️ terblokir backend)

- [ ] **Prasyarat:** endpoint monitoring tersedia.
- [ ] `MonitoringPage`: metrik lintas kelas (kelas aktif, aktivitas terbaru, submission/kuis/ujian), filter semester.
- [ ] Tautan cepat ke audit trail dan detail kelas.
- [ ] Empty/error state; jangan menampilkan metrik yang tidak dikirim backend.
- [ ] Test: render metrik, filter, 403.

**DoD fase:** admin dapat memantau aktivitas pembelajaran lintas kelas.

---

### Fase 6 — Hardening & Rilis (⬜)

- [ ] Skeleton, empty, error state pada seluruh halaman MVP 5 yang aktif.
- [ ] Audit responsif 375/768/1440 (tabel rekap → kartu; gatekeeping jelas di mobile).
- [ ] Audit aksesibilitas: status eligible diumumkan (`aria-live`), tabel rekap dapat dinavigasi keyboard.
- [ ] Audit keamanan UI: tidak ada data mahasiswa lain untuk peran mahasiswa; tidak ada token/hash di diff.
- [ ] Hapus fixture MVP 5 yang tidak dipakai.
- [ ] `npm run typecheck`, `npm run test`, `npm run build` hijau.
- [ ] Sinkronkan status RTM hanya untuk halaman yang benar-benar terintegrasi API.

**DoD fase:** frontend MVP 5 siap demo tanpa mock dan status dokumen jujur.

---

## 7. Matriks Pengujian Frontend

| Level | Alat | Cakupan wajib |
|---|---|---|
| Unit | Vitest | Format persentase, ambang, label status ujian, masking diff |
| Integration | Vitest + RTL + MSW | Config ambang, audit list/detail, eligibility, exam attempt, rekap, ekspor |
| Contract | MSW + skema Zod | `audit-log`, `config`, (baru) `exam`, `eligibility`, `grade-recap` |
| E2E | Playwright | Admin ubah ambang → mahasiswa melihat gate; dosen ujian → mahasiswa kerjakan; ekspor rekap |
| Manual | QA_TESTING_GUIDE | Gatekeeping < ambang, responsif, keyboard, unduhan ekspor |

**Skenario gatekeeping wajib:**
1. Kehadiran 69% dengan ambang 70% → tombol terkunci + alasan.
2. Kehadiran 70% → tombol aktif (batas inklusif sesuai backend).
3. Error eligibility → tombol terkunci (fail-closed).
4. Admin menurunkan ambang → setelah refetch, status berubah sesuai backend.

---

## 8. Kriteria Keberhasilan (Definition of Done)

1. Admin dapat mengubah ambang kehadiran dan audit trail dapat ditelusuri (bagian yang tidak terblokir).
2. UTS/UAS dan gatekeeping berfungsi end-to-end **setelah** backend MVP 5 tersedia, dengan status eligibility dari backend.
3. Rekap nilai/kehadiran akurat, sesuai hak akses, dan dapat diekspor.
4. Monitoring aktivitas admin tersedia bila endpoint tersedia.
5. Tidak ada data mock yang diklaim selesai; fase terblokir tetap `⏸️`.
6. `npm run typecheck`, `npm run test`, `npm run build` hijau.
7. Responsif dan aksesibel pada 375/768/1440.

---

## 9. Dependensi, Risiko & Handoff

### 9.1 Dependensi

- Backend MVP 5 (belum ada) + pembaruan OpenAPI.
- Frontend MVP 1–4 selesai.
- Kebijakan bobot nilai akhir harus disepakati agar UI tidak menebak.

### 9.2 Risiko

| Risiko | Dampak | Mitigasi |
|---|---|---|
| Frontend mendahului backend | Mock permanen, status palsu | Fase 3–5 `⏸️` sampai kontrak tersedia |
| Eligibility dihitung di klien | Salah buka/tutup ujian | Selalu pakai respons backend; fail-closed |
| Nilai akhir dihitung di klien | Perbedaan dengan keputusan akademik | Tampilkan hanya nilai backend |
| Ekspor besar | Timeout | Blob + progress + retry |
| Data sensitif di audit diff | Kebocoran | Allowlist field + masking |

### 9.3 Handoff / Penutup Program MVP

- Seluruh 5 MVP memiliki rencana frontend yang dapat dieksekusi dan dilacak.
- Setelah MVP 5 selesai, perbarui [RTM.md](RTM.md) agar status "Implemented" hanya untuk fitur yang terintegrasi end-to-end (backend + frontend).
- Backlog pasca-MVP: forum diskusi asinkron & analitik pembelajaran.

---

## 10. Status & Log Progress

### 10.1 Status per Fase

| Fase | Prioritas | Status | Tanggal mulai | Tanggal selesai | Tes terakhir | Catatan |
|---|---|---|---|---|---|---|
| 1 — Ambang Kehadiran | P1 | ⬜ | — | — | — | Dapat dikerjakan sekarang |
| 2 — Audit Trail | P1 | ⬜ | — | — | — | Dapat dikerjakan sekarang |
| 3 — Ujian & Gatekeeping | ⏸ P1 | ⏸️ | — | — | — | Menunggu backend MVP 5 |
| 4 — Rekap Nilai & Ekspor | ⏸ P1 | ⏸️ | — | — | — | Kehadiran bisa; nilai menunggu backend |
| 5 — Monitoring Admin | ⏸ P2 | ⏸️ | — | — | — | Menunggu endpoint monitoring |
| 6 — Hardening & Rilis | P2 | ⬜ | — | — | — | — |

### 10.2 Log Progress

| Tanggal | Fase | Ringkasan | File utama | Hasil tes | Commit |
|---|---|---|---|---|---|
| 2026-11-28 | — | Dokumen rencana frontend MVP 5 dibuat; fase terblokir ditandai ⏸️ | `IMPLEMENTATION_PLAN_MVP5_FRONTEND.md` | — | — |

**Format baris baru:**

```text
| YYYY-MM-DD | <fase> | <ringkasan> | <file utama> | <perintah + hasil> | <hash / "belum commit"> |
```

---

## 11. Dokumen Terkait

[PRD.md](PRD.md) · [SRS.md](SRS.md) · [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md) · [IMPLEMENTATION_PLAN_MVP4_FRONTEND.md](IMPLEMENTATION_PLAN_MVP4_FRONTEND.md) · [IMPLEMENTATION_PLAN_MVP3_FRONTEND.md](IMPLEMENTATION_PLAN_MVP3_FRONTEND.md) · [RTM.md](RTM.md) · [TEST_PLAN.md](TEST_PLAN.md) · [QA_TESTING_GUIDE.md](QA_TESTING_GUIDE.md)
