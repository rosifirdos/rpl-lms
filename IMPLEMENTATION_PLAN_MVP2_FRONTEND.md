# Implementation Plan: Frontend MVP 2
# E-Learning Kampus (Learning Management System) Universitas
**Team Membangun Negeri — Rencana Eksekusi Teknis Frontend: Ruang Kelas 16 Pertemuan, Distribusi Materi & Presensi Digital**

---

> **Acuan:** [PRD.md](PRD.md) (*Bab 2, 3, 5, 7 — MVP 2*), [SRS.md](SRS.md) (*Bab 5, 6, 7.3–7.6, 27*), [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md), [DESIGN_INSTRUCTIONS_MVP2_UIUX.md](DESIGN_INSTRUCTIONS_MVP2_UIUX.md), [IMPLEMENTATION_PLAN_MVP2_BACKEND.md](IMPLEMENTATION_PLAN_MVP2_BACKEND.md), [IMPLEMENTATION_PLAN_MVP1_FRONTEND.md](IMPLEMENTATION_PLAN_MVP1_FRONTEND.md), dan [backend/docs/openapi.yaml](backend/docs/openapi.yaml) **v1.4.1**.
>
> **Definisi MVP 2 (PRD Bab 7):** *"Ruang Kelas 16 Pertemuan, Distribusi Materi & Presensi Digital."* Backend MVP 2 **sudah selesai dan teruji**; frontend MVP 2 masih **mock/parsial** dan menjadi fokus dokumen ini.
>
> **Prasyarat:** seluruh Fase 0–3 pada [IMPLEMENTATION_PLAN_MVP1_FRONTEND.md](IMPLEMENTATION_PLAN_MVP1_FRONTEND.md) selesai (router path-based, HTTP client dengan refresh, auth store, UI kit, TanStack Query, guard RBAC).

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
2. **Saat mengerjakan:** centang `[x]` hanya untuk butir yang benar-benar selesai dan sudah diuji; catat deviasi pada log, jangan menghapus riwayat.
3. **Saat fase selesai:** jalankan `npm run typecheck`, `npm run test`, `npm run build`; ubah status fase menjadi `✅`; tambahkan **satu baris baru** di Bab 10.2.
4. **Aturan tambahan:** satu baris log = satu sesi kerja bermakna; jangan menandai `✅` bila masih ada butir `[ ]`, tes gagal, atau build gagal.

### 0.3 Perintah Ringkas

```text
SEBELUM FASE : baca Bab 3 & 10 → cek prasyarat (MVP 1 Fase 0–3) → set status 🔄 + tanggal mulai
SETELAH FASE : npm run typecheck && npm run test && npm run build
                → centang [x] → set status ✅ → tambahkan baris log 10.2
VERIFIKASI   : cd frontend; npm run typecheck; npm run test; npm run build
```

---

## 1. Tujuan & Ruang Lingkup MVP 2 (Frontend)

### 1.1 Tujuan

Menghubungkan antarmuka ruang kelas ke REST API sehingga:

1. **Mahasiswa** melihat daftar kelas yang dienroll, membuka ruang kelas 16 pertemuan, mengunduh materi, dan mengisi presensi saat sesi dibuka.
2. **Dosen** melihat kelas diampu, mengelola judul/deskripsi pertemuan, mengunggah/mengubah/menghapus materi, membuka & menutup sesi presensi, mengoreksi status kehadiran, dan melihat rekapitulasi.
3. **Admin** dapat meninjau kelas dan rekapitulasi kehadiran (read-only) untuk kebutuhan monitoring.

### 1.2 In-Scope

- Halaman: Daftar Kelas (mahasiswa & dosen), Ruang Kelas (detail + 16 pertemuan), Detail Pertemuan (materi + presensi), Rekap Kehadiran.
- Komponen: kartu kelas, timeline pertemuan vertikal, kartu materi, panel sesi presensi, tabel rekapitulasi kehadiran, badge status (HADIR/SAKIT/IZIN/ALPA, OPEN/CLOSED).
- Integrasi seluruh endpoint MVP 2 pada OpenAPI 1.4.1 (lihat Bab 4).
- Validasi berkas materi di klien (ekstensi & ukuran mengikuti `GET /admin/config`) + penanganan 400/413.
- Unduhan berkas terautentikasi (blob + `Content-Disposition`).
- Responsif 375/768/1440, empty state, skeleton, error state.

### 1.3 Out-of-Scope

- Tugas, submission, penilaian (MVP 3).
- Timeline, kuis, notifikasi (MVP 4).
- UTS/UAS, gatekeeping, rekap nilai akhir (MVP 5).
- Forum diskusi (pasca-MVP).

---

## 2. Kondisi Frontend Saat Ini & Gap Analysis

| Halaman | Berkas | Kondisi saat ini | Tindakan |
|---|---|---|---|
| Kelas Saya (mahasiswa) | `features/mahasiswa/KelasSayaMahasiswa.jsx` | Fixture | Hubungkan `GET /classes` + filter/pagination |
| Kelas Diampu (dosen) | `features/dosen/KelasDiampu.jsx` | Memanggil endpoint tidak ada | Hubungkan `GET /classes` |
| Ruang Kelas | `features/akademik/RuangKelas.jsx` | Statis, pertemuan hardcoded | `GET /classes/:id`, `GET /classes/:classId/meetings` |
| Manajemen Materi | `features/dosen/ManajemenMateri.jsx` | Fixture | `GET /meetings/:id`, upload/update/delete/download |
| Unggah Materi | `features/dosen/UnggahMateri.jsx` | Mock submit | Multipart ke `POST /meetings/:meetingId/materials` |
| Daftar Hadir & Koreksi | `features/dosen/DaftarHadirKoreksi.jsx` | Fixture | `GET /attendance/:sessionId/records`, `PUT /attendance/records/:id` |
| Status Presensi (mahasiswa) | `features/akademik/StatusPresensi.jsx` | Fixture | `GET /classes/:classId/attendance-recap` |
| Rekap Kehadiran | `features/akademik/RekapKehadiran.jsx` | Fixture | `GET /classes/:classId/attendance-recap` |

### 2.1 Gap Teknis Spesifik MVP 2

| # | Gap | Dampak | Rencana |
|---|---|---|---|
| G2-01 | Tidak ada route `/classes/:classId` dan `/classes/:classId/meetings/:meetingId` | Deep-link notifikasi MVP 4 tidak berfungsi | Tambah rute path-based (Fase 1) |
| G2-02 | Tidak ada pemanggilan `GET /meetings/:id` (materi hanya mock) | Materi tidak dapat diunduh | Query detail pertemuan |
| G2-03 | Tidak ada penanganan blob download | Unduhan gagal karena envelope JSON | Helper `downloadFile()` (Bab 3.3) |
| G2-04 | Tidak ada indikator sesi presensi OPEN/CLOSED real-time | Mahasiswa tidak tahu kapan check-in | Polling ringan 15–30 detik saat halaman aktif |
| G2-05 | Tidak ada konfirmasi buka/tutup sesi & koreksi ALPA | Risiko salah operasi | `ConfirmDialog` + alasan opsional |
| G2-06 | Kebijakan berkas materi di-hardcode | Berbeda dengan konfigurasi admin | Baca `GET /admin/config` (cache 5 menit) |

---

## 3. Keputusan Arsitektur Khusus MVP 2

### 3.1 Rute

```text
/classes                              # daftar kelas (mahasiswa: dienroll; dosen: diampu)
/classes/:classId                     # ruang kelas + 16 pertemuan
/classes/:classId/meetings/:meetingId # detail pertemuan (materi + presensi + kuis MVP 4)
/classes/:classId/attendance          # rekap kehadiran kelas (dosen/admin)
/classes/:classId/my-attendance       # status presensi pribadi (mahasiswa)
```

Semua rute privat; `/classes` dan `/classes/:classId` dapat diakses ketiga peran dengan pembatasan data di backend. Guard peran hanya untuk aksi dosen/admin.

### 3.2 Struktur Data & Query Key

```text
['classes', { page, search, academic_year, semester }]
['class', classId]
['meetings', classId]
['meeting', meetingId]
['attendance-session', sessionId]
['attendance-recap', classId]
['upload-config']
```

- `staleTime`: daftar kelas 60 detik; detail pertemuan 30 detik; sesi presensi 0 (selalu segar saat dibuka).
- Polling sesi presensi: `refetchInterval: 20000` hanya saat `session.status === 'OPEN'` dan tab terlihat.

### 3.3 Helper Unduhan Berkas

```ts
// services/download.ts
export async function downloadFile(path: string, fallbackName: string) {
  const response = await http.get(path, { responseType: 'blob' });
  const disposition = response.headers['content-disposition'] ?? '';
  const name = /filename\*?=(?:UTF-8'')?"?([^";]+)"?/i.exec(disposition)?.[1] ?? fallbackName;
  const url = URL.createObjectURL(response.data);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = decodeURIComponent(name);
  anchor.click();
  URL.revokeObjectURL(url);
}
```

Aturan: **jangan** memakai instance axios JSON untuk unduhan; endpoint unduhan mengembalikan berkas mentah, bukan envelope `{ data }`.

### 3.4 Aturan Tampilan Presensi

- `HADIR` = hijau, `SAKIT` = kuning, `IZIN` = biru, `ALPA` = merah.
- Mahasiswa hanya melihat barisnya sendiri (backend sudah memfilter; frontend tidak boleh menampilkan tabel rekap kelas penuh untuk mahasiswa).
- Tombol **Check-in** hanya aktif bila `session.status === 'OPEN'` dan belum ada record; setelah sukses tampilkan status + waktu.
- Dosen: buka sesi (`tolerance_minutes` 1–180), tutup sesi (konfirmasi; ALPA otomatis), koreksi status + catatan (maks 1000 karakter).
- Sesi yang sudah `CLOSED` dapat dibuka ulang; UI memberi peringatan bahwa ALPA otomatis akan dibersihkan dan dapat diisi ulang.

### 3.5 Validasi Berkas Materi

- Ekstensi & ukuran mengikuti `GET /admin/config` (`allowed_extensions`, `max_file_size_mb`).
- Validasi klien bersifat UX; validasi final tetap backend (400/413).
- Tampilkan nama, ukuran, tipe, pengunggah, dan waktu unggah.
- Progress bar upload (`onUploadProgress`), batalkan (`AbortController`) bila pengguna menutup modal.

---

## 4. Matriks Kontrak API MVP 2

| Halaman | Aksi | Method & Endpoint | Peran | Catatan kontrak |
|---|---|---|---|---|
| Daftar Kelas | Baca | `GET /classes?page&limit&search&academic_year&semester` | Semua | `items` + `meta`; mahasiswa otomatis difilter enrollment |
| Ruang Kelas | Detail | `GET /classes/:id` | Semua | Berisi `course`, `lecturer`, `meetings[]`, `enrolled_count` |
| Ruang Kelas | Daftar pertemuan | `GET /classes/:classId/meetings` | Semua | 16 baris; `type=REGULAR/UTS/UAS`, `is_exam`, `attendance_session` |
| Detail Pertemuan | Baca | `GET /meetings/:id` | Semua | Materi, sesi presensi, metadata |
| Detail Pertemuan | Ubah | `PUT /meetings/:id` | Dosen/Admin | `title` (≤150), `description` (≤2000), `is_published` |
| Materi | Unggah | `POST /meetings/:meetingId/materials` | Dosen/Admin | Multipart `file` + `title` + `description` |
| Materi | Ubah | `PUT /materials/:id` | Dosen/Admin | `title`, `description` |
| Materi | Hapus | `DELETE /materials/:id` | Dosen/Admin | Konfirmasi destruktif |
| Materi | Unduh | `GET /materials/:id/download` | Semua | `responseType: 'blob'` |
| Presensi | Buka | `POST /meetings/:meetingId/attendance/open` | Dosen/Admin | Body `{ tolerance_minutes? }` (1–180) |
| Presensi | Tutup | `POST /meetings/:meetingId/attendance/close` | Dosen/Admin | Body `{}`; ALPA otomatis dibuat |
| Presensi | Check-in | `POST /attendance/:sessionId/check-in` | Mahasiswa | Tanpa body; 409 bila sudah check-in |
| Presensi | Records | `GET /attendance/:sessionId/records` | Dosen/Admin | Daftar mahasiswa + status |
| Presensi | Koreksi | `PUT /attendance/records/:id` | Dosen/Admin | `{ status, notes? }` |
| Rekap | Baca | `GET /classes/:classId/attendance-recap` | Semua | Mahasiswa menerima ringkasan pribadi |
| Konfigurasi | Baca | `GET /admin/config` | Admin | Untuk dosen, gunakan nilai default aman bila 403 |

**Catatan:** endpoint `GET /classes/:classId/attendance-recap` dipasang pada router meetings dan memerlukan peran Mahasiswa/Dosen/Admin.

---

## 5. Struktur Berkas Target (Tambahan)

```text
frontend/src/
├── features/kelas/
│   ├── ClassListPage.tsx
│   ├── ClassCard.tsx
│   ├── ClassDetailPage.tsx
│   ├── MeetingTimeline.tsx
│   ├── MeetingDetailPage.tsx
│   ├── components/
│   │   ├── MaterialList.tsx
│   │   ├── MaterialUploadDialog.tsx
│   │   ├── AttendanceSessionPanel.tsx
│   │   ├── AttendanceTable.tsx
│   │   └── AttendanceStatusBadge.tsx
│   └── hooks/
│       ├── useClasses.ts
│       ├── useClassDetail.ts
│       ├── useMeeting.ts
│       ├── useMaterials.ts
│       └── useAttendance.ts
├── services/endpoints/
│   ├── classes.ts
│   ├── meetings.ts
│   ├── materials.ts
│   └── attendance.ts
├── services/download.ts
└── types/kelas.ts
```

---

## 6. Fase Eksekusi

### 6.0 Prioritas Fase (Ringkasan)

| Fase | Prioritas | Prasyarat | Dapat paralel dengan | Catatan |
|---|---|---|---|---|
| 1 — Rute & Daftar Kelas | **P0** | MVP 1 Fase 2 | — | Membuka seluruh deep-link kelas |
| 2 — Ruang Kelas & 16 Pertemuan | **P0** | Fase 1 | — | Prasyarat materi, presensi, tugas, kuis |
| 3 — Materi Pembelajaran | **P1** | Fase 2 | Fase 4 | Menyediakan helper upload untuk MVP 3 |
| 4 — Presensi Digital | **P1** | Fase 2 | Fase 3 | Alur independen dari materi |
| 5 — Rekapitulasi Kehadiran | **P2** | Fase 4 | Fase 6 | Dapat digeser setelah MVP 3 |
| 6 — Hardening & Handoff | **P2** | Fase 2–5 | — | Dicicil per modul |

**Aturan:**
- **Fase 1–2 adalah P0**: tanpa keduanya, notifikasi/timeline tidak punya tujuan dan modul tugas/kuis tidak punya tempat.
- **Fase 3 dan Fase 4 dapat dikerjakan paralel** setelah Fase 2; keduanya hanya berbagi halaman detail pertemuan.
- **Fase 5 (rekap)** bersifat modular: dibutuhkan untuk tampilan kehadiran MVP 5, tetapi tidak menghambat tugas/kuis/timeline.
- **Fase 6** dicicil, bukan menunggu semua fitur selesai.

### Fase 1 — Rute & Daftar Kelas (⬜)

- [ ] Tambah rute `/classes`, `/classes/:classId`, `/classes/:classId/meetings/:meetingId`, `/classes/:classId/attendance`, `/classes/:classId/my-attendance`.
- [ ] `ClassListPage`: grid kartu kelas (kode, nama MK, SKS, dosen, tahun/semester, jumlah mahasiswa, kapasitas), search + filter tahun/semester, pagination.
- [ ] Mahasiswa: label "Kelas Saya"; dosen: "Kelas Diampu"; admin: daftar seluruh kelas.
- [ ] Empty state: "Belum ada kelas" + penjelasan; dosen diarahkan ke admin bila kelas kosong.
- [ ] Skeleton kartu (6 placeholder) saat loading; error state + retry.
- [ ] Test: render 3 peran, filter, pagination, empty state.

**DoD fase:** daftar kelas berasal dari API untuk ketiga peran; navigasi ke detail berfungsi.

---

### Fase 2 — Ruang Kelas & Timeline 16 Pertemuan (⬜)

- [ ] `ClassDetailPage`: header kelas (MK, dosen, tahun/semester, kapasitas, progress pertemuan).
- [ ] `MeetingTimeline`: 16 pertemuan vertikal/horizontal; tandai P-8 UTS dan P-16 UAS dengan badge khusus.
- [ ] Setiap item pertemuan menampilkan judul, tipe, jumlah materi, status sesi presensi, dan tautan detail.
- [ ] Pertemuan terkunci/`is_published=false` tidak menampilkan konten ke mahasiswa (backend sudah memfilter; UI tetap menandai "Belum dibuka").
- [ ] Dosen/Admin: form ubah judul (≤150), deskripsi (≤2000), dan status publikasi (`PUT /meetings/:id`) dengan validasi panjang.
- [ ] Navigasi "Pertemuan sebelumnya/berikutnya" di halaman detail.
- [ ] Test: 16 item dirender, badge UTS/UAS benar, edit pertemuan sukses/gagal.

**DoD fase:** ruang kelas menampilkan siklus 16 pertemuan dari API dan dosen dapat menyunting metadata pertemuan.

---

### Fase 3 — Materi Pembelajaran (⬜)

- [ ] `MaterialList`: tabel/kartu materi (judul, deskripsi, nama berkas, ukuran, pengunggah, waktu), tombol unduh.
- [ ] `MaterialUploadDialog`: drag-and-drop + input file, validasi ekstensi/ukuran dari config, judul wajib, deskripsi opsional.
- [ ] Upload multipart dengan progress; tangani 400 (format), 413 (ukuran), 403 (bukan pengampu).
- [ ] Dosen/Admin: edit judul/deskripsi materi dan hapus dengan konfirmasi.
- [ ] Mahasiswa: tombol unduh saja (tanpa aksi ubah/hapus).
- [ ] Unduhan memakai `downloadFile()`; tampilkan toast sukses/gagal dan tetap sediakan tautan fallback bila nama berkas tidak terbaca.
- [ ] Test: validasi klien, upload sukses, 413, unduh blob, hapus.

**DoD fase:** dosen dapat mendistribusikan materi dan mahasiswa dapat mengunduhnya secara terautentikasi.

---

### Fase 4 — Presensi Digital (⬜)

- [ ] `AttendanceSessionPanel` (dosen): status sesi, waktu buka, toleransi, tombol **Buka Sesi** / **Tutup Sesi**.
- [ ] Buka sesi: modal toleransi 1–180 menit (default dari sesi sebelumnya atau 15), konfirmasi.
- [ ] Tutup sesi: konfirmasi yang menjelaskan ALPA otomatis bagi yang belum check-in.
- [ ] `AttendanceTable`: daftar mahasiswa (NIM, nama), status, waktu check-in, catatan, aksi koreksi.
- [ ] Koreksi status: pilih HADIR/SAKIT/IZIN/ALPA + catatan ≤ 1000 karakter; tampilkan penanda `is_auto_generated` sebagai "otomatis".
- [ ] Mahasiswa: kartu check-in dengan status sesi, countdown/pesan "Sesi ditutup", dan status kehadiran pribadi; tangani 400/409.
- [ ] Polling ringan saat sesi OPEN; hentikan polling saat tab tidak aktif.
- [ ] Test: buka/tutup, check-in sukses, check-in ganda 409, sesi tertutup 400, koreksi status.

**DoD fase:** siklus presensi lengkap berfungsi: dosen membuka → mahasiswa check-in → dosen menutup → ALPA otomatis → koreksi.

---

### Fase 5 — Rekapitulasi Kehadiran (⬜)

- [ ] `AttendanceRecapPage` (dosen/admin): matriks mahasiswa × pertemuan, total HADIR/SAKIT/IZIN/ALPA, persentase kehadiran.
- [ ] Filter pertemuan/rentang, pencarian mahasiswa, sticky header & kolom NIM/nama.
- [ ] Sorot mahasiswa di bawah ambang (nilai ambang ditampilkan sebagai informasi; keputusan gatekeeping final di MVP 5).
- [ ] Mahasiswa: halaman status presensi pribadi (ringkasan + daftar pertemuan + persentase).
- [ ] Ekspor CSV rekap (opsional MVP 2, wajib di MVP 5) — bila dibuat, gunakan unduhan blob.
- [ ] Test: persentase benar, filter, tampilan mahasiswa hanya data sendiri.

**DoD fase:** dosen dan mahasiswa dapat membaca rekapitulasi kehadiran dari API.

---

### Fase 6 — Hardening & Handoff (⬜)

- [ ] Skeleton, empty state, error state pada seluruh halaman MVP 2.
- [ ] Audit responsif 375/768/1440 (timeline pertemuan → daftar vertikal di mobile; tabel → kartu).
- [ ] Audit aksesibilitas: label tombol ikon, `aria-live` untuk status sesi, fokus modal.
- [ ] Pastikan tidak ada fixture tersisa di modul kelas/materi/presensi.
- [ ] `npm run typecheck`, `npm run test`, `npm run build` hijau.
- [ ] Catat handoff ke MVP 3 (slot tugas per pertemuan) dan MVP 4 (slot kuis + timeline).

**DoD fase:** modul MVP 2 siap demo tanpa data mock.

---

## 7. Matriks Pengujian Frontend

| Level | Alat | Cakupan wajib |
|---|---|---|
| Unit | Vitest | Format ukuran berkas, persentase kehadiran, pemetaan status, validasi ekstensi |
| Integration | Vitest + RTL + MSW | Daftar kelas, detail kelas, upload materi, buka/tutup sesi, check-in, koreksi, rekap |
| Contract | MSW + skema Zod | Bentuk respons `classes`, `meetings`, `materials`, `attendance` |
| E2E | Playwright | Dosen upload materi → mahasiswa unduh; dosen buka sesi → mahasiswa check-in → dosen tutup & koreksi |
| Manual | QA_TESTING_GUIDE | Responsif, keyboard, unduhan di Chrome/Edge/Firefox |

---

## 8. Kriteria Keberhasilan (Definition of Done)

1. Daftar kelas, ruang kelas 16 pertemuan, dan detail pertemuan sepenuhnya dari API.
2. Dosen dapat upload/edit/hapus materi; mahasiswa dapat mengunduh dengan benar.
3. Presensi end-to-end berfungsi, termasuk ALPA otomatis dan koreksi.
4. Rekap kehadiran akurat dan hanya menampilkan data yang diizinkan per peran.
5. Tidak ada fixture pada modul MVP 2; seluruh error 400/403/404/409/413 ditangani dengan pesan jelas.
6. `npm run typecheck`, `npm run test`, `npm run build` hijau.
7. Responsif dan aksesibel pada 375/768/1440.

---

## 9. Dependensi, Risiko & Handoff

### 9.1 Dependensi

- Frontend MVP 1 Fase 0–3 selesai.
- Backend MVP 2 pada `main` (OpenAPI 1.4.1).
- Desain MVP 2 sudah Delivered (`DESIGN_INSTRUCTIONS_MVP2_UIUX.md`).

### 9.2 Risiko

| Risiko | Dampak | Mitigasi |
|---|---|---|
| Sesi presensi kedaluwarsa saat halaman terbuka | Mahasiswa gagal check-in | Auto-close backend + pesan jelas; polling status |
| Unduhan berkas besar | UI freeze | Streaming blob + progress/disabled state |
| Polling berlebihan | Beban server | Interval 20 detik, hanya saat OPEN & tab aktif |
| Perbedaan zona waktu | Salah tafsir jadwal | Tampilkan zona & gunakan waktu server |

### 9.3 Handoff ke MVP 3

- `MeetingDetailPage` menyediakan slot tab/section Tugas.
- Helper unduhan & upload multipart siap dipakai submission.
- Tabel roster mahasiswa dapat dipakai ulang untuk daftar submission.

---

## 10. Status & Log Progress

### 10.1 Status per Fase

| Fase | Prioritas | Status | Tanggal mulai | Tanggal selesai | Tes terakhir | Catatan |
|---|---|---|---|---|---|---|
| 1 — Rute & Daftar Kelas | P0 | ⬜ | — | — | — | — |
| 2 — Ruang Kelas & 16 Pertemuan | P0 | ⬜ | — | — | — | — |
| 3 — Materi Pembelajaran | P1 | ⬜ | — | — | — | Paralel dengan Fase 4 |
| 4 — Presensi Digital | P1 | ⬜ | — | — | — | Paralel dengan Fase 3 |
| 5 — Rekapitulasi Kehadiran | P2 | ⬜ | — | — | — | Dapat ditunda |
| 6 — Hardening & Handoff | P2 | ⬜ | — | — | — | Dicicil |

### 10.2 Log Progress

| Tanggal | Fase | Ringkasan | File utama | Hasil tes | Commit |
|---|---|---|---|---|---|
| 2026-11-28 | — | Dokumen rencana frontend MVP 2 dibuat | `IMPLEMENTATION_PLAN_MVP2_FRONTEND.md` | — | — |

**Format baris baru:**

```text
| YYYY-MM-DD | <fase> | <ringkasan> | <file utama> | <perintah + hasil> | <hash / "belum commit"> |
```

---

## 11. Dokumen Terkait

[PRD.md](PRD.md) · [SRS.md](SRS.md) · [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md) · [DESIGN_INSTRUCTIONS_MVP2_UIUX.md](DESIGN_INSTRUCTIONS_MVP2_UIUX.md) · [IMPLEMENTATION_PLAN_MVP2_BACKEND.md](IMPLEMENTATION_PLAN_MVP2_BACKEND.md) · [IMPLEMENTATION_PLAN_MVP1_FRONTEND.md](IMPLEMENTATION_PLAN_MVP1_FRONTEND.md) · [IMPLEMENTATION_PLAN_MVP3_FRONTEND.md](IMPLEMENTATION_PLAN_MVP3_FRONTEND.md) · [QA_TESTING_GUIDE.md](QA_TESTING_GUIDE.md)
