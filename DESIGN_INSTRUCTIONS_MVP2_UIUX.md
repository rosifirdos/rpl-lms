# Instruksi Desain UI/UX: MVP 2
# SPADA (Learning Management System) Universitas PGRI Semarang (UPGRIS)
**Team Membangun Negeri — Panduan Perancangan Antarmuka Berbasis Google Stitch (100% Prompt-Driven UI Generation & Handoff)**
**Lanjutan Langsung dari [DESIGN_INSTRUCTIONS_MVP1_UIUX.md](DESIGN_INSTRUCTIONS_MVP1_UIUX.md)**

---

## 📌 Ringkasan Dokumen
- **Target Deliverable:** Rancangan Desain Antarmuka UI/UX High-Fidelity, Screen Generation, Interaksi Komponen, State Presensi Real-Time, dan Desain Responsif untuk MVP 2 SPADA LMS UPGRIS yang **100% Dikerjakan di Google Stitch melalui rekayasa prompt (Prompt-Driven Design)** tanpa menggunakan Figma.
- **Acuan Utama:** [PRD.md](PRD.md) (*Bab 2, 4, 5, 7*), [SRS.md](SRS.md) (*Bab 5, 6, 7.3, 7.7, 8, 15, 16, 20, 21, 22*), [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md) (Spesifikasi Ruang Kelas 16 Pertemuan, Dropzone Validasi Berkas, Indikator Presensi & Gatekeeping), [IMPLEMENTATION_PLAN_MVP2_BACKEND.md](IMPLEMENTATION_PLAN_MVP2_BACKEND.md), serta melanjutkan token & komponen hasil **MVP 1**.
- **Fokus Rilis MVP 2:** Ruang Kelas berbasis silabus **16 Pertemuan terstruktur** (P-8 UTS, P-16 UAS), Modul **Distribusi Materi Pembelajaran** (unggah dosen, unduh mahasiswa terproteksi), Modul **Presensi Digital Terkendali** (buka/tutup sesi oleh dosen, check-in mandiri mahasiswa, koreksi kehadiran, rekapitulasi persentase kehadiran).
- **Status Prasyarat:** MVP 1 **telah selesai** (autentikasi, app shell, dasbor 3 peran, profil, master data, direct enrollment, audit trail). Seluruh token, komponen dasar, dan pola layout MVP 1 **diwarisi langsung** dan tidak boleh dirancang ulang dari nol.

---

## 1. Tujuan & Metodologi Perancangan (100% Google Stitch Prompt-Driven)

### 1.1 Paradigma Pengerjaan Desain
Pengerjaan desain UI/UX MVP 2 tetap **100% dieksekusi melalui Google Stitch** sebagai kelanjutan proyek Stitch MVP 1. Tidak ada perangkat manual grafis (Figma). Metodologi yang dijalankan:

1. **Context Continuity Injection:** Menginjeksi ulang **Master Context Prompt MVP 1** yang telah diperluas (*extended*) dengan aturan MVP 2 — struktur 16 pertemuan, state machine presensi, dan kebijakan validasi berkas — agar Stitch mempertahankan konsistensi visual lintas rilis.
2. **Library Extension Prompting:** Menambah *primitive* dan *molecule* baru (Meeting Accordion Row, Session Status Pill, Presence Badge, File Dropzone, Attendance Matrix) ke dalam UI Kit MVP 1 yang sudah ada, tanpa menduplikasi komponen lama.
3. **Screen-by-Screen Structured Prompting:** Membangkitkan setiap layar ruang kelas, panel materi, kartu presensi, tabel rekap, dan dialog modal dengan hierarki layout, komponen, serta status visual yang presisi.
4. **State-Transition Prompting:** Membangkitkan **seluruh state sesi presensi** (`CLOSED → OPEN → CLOSED`) secara eksplisit, termasuk state terkunci bagi mahasiswa saat sesi belum dibuka.
5. **Iterative Refinement & Handoff:** Melakukan penyesuaian detail (spasi, kontras aksesibilitas, densitas tabel matriks kehadiran), lalu mengekspor struktur React JSX + kelas Tailwind CSS ke tim frontend.

### 1.2 Ruang Lingkup Modul MVP 2
Sesuai **SRS Bab 27**, **PRD Bab 7**, dan **IMPLEMENTATION_PLAN_MVP2_BACKEND.md Bab 1**, ruang lingkup antarmuka MVP 2 mencakup:

1. **Modul Ruang Kelas 16 Pertemuan:**
   - Halaman daftar kelas yang diperkaya: kartu kelas Mahasiswa menampilkan progres pertemuan, kartu kelas Dosen menampilkan status sesi presensi & jumlah materi.
   - **Halaman Ruang Kelas** dengan header identitas kelas (Mata Kuliah, Kode Kelas, SKS, Dosen Pengampu, Semester) dan **akordeon Pertemuan 1 s.d. 16**.
   - Penandaan visual jenis pertemuan:
     - **Pertemuan 1–7:** Badge biru *"Pembelajaran Pra-UTS"*.
     - **Pertemuan 8:** Badge oranye *"Ujian Tengah Semester (UTS)"*.
     - **Pertemuan 9–15:** Badge biru *"Pembelajaran Pasca-UTS"*.
     - **Pertemuan 16:** Badge marun *"Ujian Akhir Semester (UAS)"*.
   - Ringkasan status per baris pertemuan: jumlah materi, status sesi presensi (`Buka`/`Ditutup`/`Belum Dibuka`), dan indikator publikasi.
   - **Detail Pertemuan:** judul topik, deskripsi/capaian pembelajaran, panel materi, panel presensi.
   - **Mode Kelola Dosen:** form edit judul & deskripsi pertemuan, toggle publikasi pertemuan.
2. **Modul Distribusi Materi Pembelajaran:**
   - Panel daftar materi per pertemuan (ikon jenis berkas, judul, deskripsi, ukuran berkas, timestamp unggah, tombol *Unduh*).
   - **Modal Unggah Materi** oleh Dosen: input judul, textarea deskripsi, **komponen Dropzone** dengan indikator whitelist ekstensi & batas ukuran, progress bar unggah, dan preview berkas terpilih.
   - **State umpan balik validasi klien:** format tidak didukung (shake + border merah), ukuran melebihi batas, dan state sukses (centang hijau).
   - **State unduh terproteksi:** tombol unduh tersedia bagi mahasiswa *enrolled*; state penolakan **403 Forbidden** (*"Anda tidak terdaftar pada kelas ini"*).
   - **Modal Edit & Konfirmasi Hapus Materi** dengan peringatan destruktif.
3. **Modul Presensi Digital Terkendali:**
   - **Panel Kontrol Sesi (Dosen):** tombol *Buka Sesi Presensi* / *Tutup Sesi Presensi*, input batas toleransi menit, indikator waktu buka, dan daftar kehadiran *live* (auto-refresh).
   - **Kartu Presensi (Mahasiswa):** tiga kondisi visual eksplisit —
     - `Belum Dibuka`: tombol *Isi Kehadiran* **disabled** dengan ikon gembok dan teks penjelas.
     - `OPEN`: badge hijau berdenyut *"Sesi Presensi Aktif"* + tombol **Isi Kehadiran** aktif.
     - `Sudah Mengisi` / `CLOSED`: badge status kehadiran personal (`HADIR`, `SAKIT`, `IZIN`, `ALPA`) dengan timestamp check-in.
   - **Tabel Kehadiran Pertemuan (Dosen):** daftar mahasiswa, status kehadiran, waktu check-in, catatan, dan aksi *Koreksi*.
   - **Modal Koreksi Status Kehadiran:** radio `HADIR`/`SAKIT`/`IZIN`/`ALPA` + textarea catatan keterangan.
   - **Tabel Rekapitulasi Kehadiran Kelas:** matriks kehadiran **Pertemuan 1 s.d. 16** per mahasiswa, total hadir, total pertemuan berlangsung, dan **persentase kehadiran**.
   - **Kartu Rekap Personal Mahasiswa:** persentase kehadiran diri sendiri dengan **progress ring**, plus keterangan status kesiapan ujian (*indikatif*, karena gatekeeping resmi baru aktif di MVP 5).
4. **Modul Pendukung:**
   - Navigasi sidebar diperbarui: menu **"Kelas Saya"** (Mahasiswa) / **"Kelas Diampu"** (Dosen) kini benar-benar aktif menuju ruang kelas.
   - Breadcrumb kontekstual: `Dasbor / Kelas Saya / Rekayasa Perangkat Lunak (TI-A) / Pertemuan 3`.
   - Empty states khusus MVP 2 (belum ada materi, belum ada mahasiswa terdaftar, seluruh pertemuan belum dibuka).
   - Pencatatan mutasi materi & sesi presensi tercermin sebagai entri baru pada halaman **Jejak Audit** (`MATERIAL_UPLOAD`, `MATERIAL_DELETE`, `ATTENDANCE_OPEN`, `ATTENDANCE_CLOSE`, `ATTENDANCE_CORRECT`).

### 1.3 Batasan Rilis (Out of Scope untuk MVP 2)
Fitur-fitur berikut **tidak** dimasukkan ke dalam pengerjaan desain MVP 2:

- Modul tugas perkuliahan, unggah jawaban, dan **penilaian skor numerik 0–100** (dialokasikan ke **MVP 3**).
- Aturan validasi berkas lanjutan untuk submission tugas, serta lembar penilaian dosen (dialokasikan ke **MVP 3**).
- **Central Timeline** kronologis penuh, widget agenda dasbor lanjutan, kuis interaktif, dan notifikasi internal (dialokasikan ke **MVP 4**).
- **Halaman pelaksanaan ujian UTS/UAS**, **gatekeeping kehadiran ≥ 70% yang mengeksekusi penguncian tombol ujian**, rekapitulasi nilai akhir, dan ekspor `.xlsx/.csv` (dialokasikan ke **MVP 5**).
  - *Catatan:* pada MVP 2, P-8 dan P-16 **tetap dirender sebagai pertemuan bertipe ujian** (badge + kerangka panel), namun **tanpa lembar soal, timer, atau penguncian akses ujian**. Persentase kehadiran hanya ditampilkan sebagai *informasi*, belum sebagai *gatekeeper*.
- **Modul yang Dihapus Selamanya (BR-001 & BR-002):** Sistem Informasi Akademik (SIA), Penerimaan Mahasiswa Baru (PMB), pengisian dan persetujuan KRS oleh Dosen Wali/PA, Kartu Hasil Studi (KHS), Transkrip Kumulatif, Sidang Skripsi, dan pembayaran UKT/Finansial.
- Pengelolaan akun, master mata kuliah, pembukaan kelas, direct enrollment, dan audit trail **sudah selesai di MVP 1** dan **tidak dirancang ulang** — hanya menerima penyesuaian minor (entri aksi audit baru, tautan "Kelola Ruang Kelas" dari tabel kelas Admin).

---

## 2. Analisis Pengguna & Karakteristik Aktor (Fokus MVP 2)

Antarmuka MVP 2 dirancang untuk 3 aktor resmi (*SRS Bab 3 & 16*), dengan penekanan pada perilaku baru yang muncul saat ruang kelas aktif:

| Peran (Role) | Karakteristik Pengguna | Kebutuhan Utama pada MVP 2 | Prioritas Visual di Google Stitch |
|---|---|---|---|
| **Mahasiswa** | Peserta didik yang sudah ter-enroll oleh Admin | Membuka ruang kelas, menelusuri 16 pertemuan, mengunduh materi yang dipublikasikan dosen, dan mengisi presensi **hanya** saat sesi dibuka | Akordeon pertemuan yang mudah dipindai, kartu presensi berstatus sangat jelas (aktif/terkunci), hierarki materi → unduh, progres kehadiran personal |
| **Dosen** | Pengampu kelas dengan wewenang penuh atas pertemuan | Mengedit topik tiap pertemuan, mengunggah/menghapus materi, membuka & menutup sesi presensi, mengoreksi kehadiran, dan membaca rekap kehadiran | Kepadatan informasi terkendali, kontrol sesi presensi yang sulit salah klik, tabel kehadiran *live*, matriks 16 pertemuan yang terbaca, konfirmasi destruktif eksplisit |
| **Admin** | Pengelola teknis & akademik | Memantau aktivitas ruang kelas (materi & presensi) dan menelusuri mutasi baru di jejak audit | Hanya penyesuaian minor: tautan "Kelola Ruang Kelas", badge aksi audit baru, tanpa perubahan struktur navigasi |

---

## 3. Fondasi Design System (Design Tokens untuk Injeksi Prompt Stitch)

Seluruh token dari [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md) dan hasil **MVP 1** tetap berlaku **tanpa perubahan**. MVP 2 **hanya menambah** token semantik khusus pembelajaran, presensi, dan berkas.

### 3.1 Palet Warna (Color Palette)

#### 3.1.A Token Warisan MVP 1 (Wajib Dipatuhi, Tidak Berubah)
```text
[Portal Gateway — Dark-Mode Professional Navy]
Background Gradient:  #0D1B2A → #1B2A4A
Primary Accent:       #3B82F6 / #4F46E5
Secondary Accent:     #38BDF8 / #06B6D4
Security Badge:       #10B981
Floating Card:        #FFFFFF (radius 16px, shadow rgba(15,23,42,0.25))

[Operational Surface — Light Clean]
Primary 900: #0F172A | Primary 600: #2563EB | Primary 500: #3B82F6
Primary 50:  #EFF6FF | Primary 100: #DBEAFE
Surface 0:   #FFFFFF | Surface 50: #F8FAFC
Border:      #E2E8F0 (subtlest) / #CBD5E1 (focused)
Text:        #0F172A / #475569 / #94A3B8
```

#### 3.1.B Token Semantik Baru MVP 2 (Ekstensi Resmi)
Didefinisikan agar status presensi dan jenis pertemuan **tidak bergantung pada warna saja** (WCAG 2.1 AA, SC 1.4.1) — setiap warna **wajib** dipasangkan dengan ikon dan label teks.

```text
[Status Kehadiran — Presence Status]
HADIR  : Text #16A34A | Fill #DCFCE7 | Border #BBF7D0 | Icon: check-circle
SAKIT  : Text #0284C7 | Fill #E0F2FE | Border #BAE6FD | Icon: hospital / thermometer
IZIN   : Text #D97706 | Fill #FEF3C7 | Border #FDE68A | Icon: file-text / clock
ALPA   : Text #DC2626 | Fill #FEE2E2 | Border #FECACA | Icon: x-circle

[Status Sesi Presensi — Attendance Session]
OPEN        : Text #16A34A | Fill #DCFCE7 | Dot #22C55E (pulse 2s) | Label "Sesi Presensi Aktif"
CLOSED      : Text #475569 | Fill #F1F5F9 | Dot #94A3B8 (static)  | Label "Sesi Ditutup"
NOT_OPENED  : Text #64748B | Fill #F8FAFC | Icon: lock          | Label "Sesi Belum Dibuka"

[Jenis Pertemuan — Meeting Type]
PRA_UTS  (P1–7)  : Text #2563EB | Fill #DBEAFE | Label "Pembelajaran Pra-UTS"
UTS      (P8)    : Text #D97706 | Fill #FEF3C7 | Label "Ujian Tengah Semester (UTS)"
PASCA_UTS(P9–15) : Text #2563EB | Fill #DBEAFE | Label "Pembelajaran Pasca-UTS"
UAS      (P16)   : Text #9F1239 | Fill #FFE4E6 | Label "Ujian Akhir Semester (UAS)"

[Status Berkas & Unduhan]
Berkas Valid   : #16A34A / #DCFCE7  (check-circle)
Berkas Ditolak : #DC2626 / #FEE2E2  (alert-triangle)
Unduhan Aman   : #7C3AED / #EDE9FE  (shield / lock) — label "Berkas Terproteksi"
```

#### 3.1.C Batas Kontras Wajib
- Semua pasangan `Text` di atas `Fill` **harus** lolos rasio ≥ 4.5:1. Jika gagal, gunakan `Text Primary #0F172A` di atas `Fill` dan pertahankan ikon berwarna sebagai pembeda.
- Badge status presensi **tidak boleh** hanya berupa titik warna; minimal memuat **ikon + teks status**.

### 3.2 Tipografi & Spatial Grid
- **Font Utama:** `Plus Jakarta Sans` / `Inter` (UI umum); `JetBrains Mono` (NIM, NIDN, Kode MK, Kode Kelas, angka persentase kehadiran, timestamp).
- **Hierarki MVP 2:**
  - Judul Ruang Kelas (nama MK): `24px / 700 / 1.3` — `#0F172A`
  - Judul Pertemuan pada akordeon: `16px / 600 / 1.4` — `#0F172A`
  - Label badge jenis pertemuan: `11px / 700 / uppercase / letter-spacing 0.05em`
  - Body materi & instruksi: `14px / 400 / 1.6` — `#334155`
  - Metadata berkas (ukuran, tanggal): `12px / 500` — `#64748B`
  - Angka persentase kehadiran: `JetBrains Mono 20px / 700`
- **Spatial Grid:** 8pt (`4, 8, 12, 16, 24, 32, 48, 64`).
- **Breakpoint Generasi:** Desktop (`1440px`), Tablet (`768px`), Mobile (`375px–390px`).

### 3.3 Komponen Warisan yang Wajib Diteruskan
Sebelum membuat layar baru, Stitch **wajib** menampilkan komponen MVP 1 yang sudah ada agar tidak terduplikasi:
`Button`, `IconButton`, `TextInput`, `PasswordInput`, `Select`, `Checkbox`, `RadioGroup`, `Badge/StatusPill`, `Avatar`, `Card`, `DataTable`, `Pagination`, `SearchFilterBar`, `Modal`, `Toast`, `Breadcrumb`, `EmptyState`, `Skeleton`, `ProgressBar`, `Tabs`.

---

## 4. Master Context Prompt (System Prompt Lanjutan untuk Google Stitch)

Daftarkan prompt berikut **setelah** Master Context MVP 1 pada project environment Google Stitch yang sama (`SPADA-LMS-UPGRIS-MVP1` → diperluas menjadi `SPADA-LMS-UPGRIS`):

```text
[GOOGLE STITCH SYSTEM PROMPT: SPADA LMS UPGRIS — MVP 2 EXTENSION]
You are continuing the production design system of "SPADA (Learning Management System) Universitas PGRI Semarang (UPGRIS) - Team Membangun Negeri".
All MVP 1 rules remain in force. Apply these ADDITIONAL constraints for MVP 2.

CRITICAL ARCHITECTURE RULES (MVP 2):
1. ONLY 3 official roles exist: "Mahasiswa", "Dosen", "Admin" (Single Admin Role). Never create Super Admin, Admin Akademik, Admin LMS, or Dosen Wali/PA.
2. Class enrollment is Admin-only (BR-002). Students NEVER self-enroll and NEVER see KRS/approval flows.
3. Every class contains EXACTLY 16 meetings:
   - Meetings 1–7: "Pembelajaran Pra-UTS" (blue badge)
   - Meeting 8: "Ujian Tengah Semester (UTS)" (amber badge) — exam type UTS
   - Meetings 9–15: "Pembelajaran Pasca-UTS" (blue badge)
   - Meeting 16: "Ujian Akhir Semester (UAS)" (maroon badge #9F1239 / fill #FFE4E6)
   Meeting rows must never be renumbered or omitted. Exam meetings show an exam badge but NO exam paper, timer, or access gate in MVP 2.

4. ATTENDANCE STATE MACHINE (strict, never simplified):
   CLOSED/NOT_OPENED -> Dosen opens -> OPEN -> Dosen closes -> CLOSED
   - Student check-in is ONLY possible while status == OPEN.
   - When not open, the student's check-in button is DISABLED with a lock icon and explicit helper text. Never show a clickable button.
   - Attendance statuses are exactly: HADIR (green), SAKIT (blue #0284C7), IZIN (amber #D97706), ALPA (red #DC2626).
   - Each status must pair its color with a DISTINCT ICON and TEXT LABEL. Color alone is never sufficient.

5. MATERIAL ACCESS & FILE VALIDATION:
   - Materials are uploaded by the Dosen Pengampu or Admin only, one file per material entry.
   - Allowed extensions: .pdf, .docx, .xlsx, .zip. Max size: 10MB (configurable 5–10MB).
   - Invalid format message: "Format berkas tidak didukung. Harap unggah file berformat .pdf, .docx, .xlsx, atau .zip"
   - Oversize message: "Ukuran berkas melebihi batas maksimal yang diizinkan (maks. 10MB)"
   - Downloads are protected: only enrolled Mahasiswa, the Dosen Pengampu, and Admin may download. Unauthorized access renders a 403 state, never a broken download link.
   - Never display a public/direct file URL. Use an "Unduh Berkas" action with a shield/lock indicator.

6. VISUAL SURFACES (unchanged from MVP 1):
   - Portal gateway stays Dark-Mode Professional Navy (#0D1B2A → #1B2A4A) — MVP 2 adds no public pages.
   - All classroom, material, attendance, and recap screens use the Light Clean Surface (#F8FAFC page, #FFFFFF cards, #0F172A text, #2563EB primary).
   - Market the classroom as a calm, readable reading surface: generous whitespace, clear section dividers, no dense decoration.

7. ACCESSIBILITY: WCAG 2.1 AA, 4.5:1 text contrast, icon+label pairings for every status, 2px blue (#3B82F6) focus rings with 2px offset, 44x44px mobile touch targets, 8pt spacing grid.

8. DATA REALISM: Use Indonesian academic microcopy, real-looking NIM (24670001) and NIDN (0612345601) in JetBrains Mono, and Indonesian date/time formats ("Senin, 6 Oktober 2026 • 09:15 WIB").

Acknowledge and extend the existing design tokens with the MVP 2 semantic tokens.
```

---

## 5. Rincian Template Prompt Layar demi Layar (Screen-by-Screen Stitch Prompts)

### 5.1 Modul Ruang Kelas & Struktur 16 Pertemuan (Light Clean Surface)

#### Layar 1: Daftar Kelas Saya / Kelas Diampu (`/classes`)
**Template Prompt Google Stitch:**
```text
Generate the "Kelas Saya" list page for Mahasiswa and the "Kelas Diampu" list page for Dosen inside the existing SPADA LMS UPGRIS App Shell (Light Clean Surface).

PAGE HEADER:
- Breadcrumb: "Dasbor / Kelas Saya" (Mahasiswa) or "Dasbor / Kelas Diampu" (Dosen).
- Title: "Kelas Perkuliahan Saya" (24px bold #0F172A).
- Subtitle: "Semester Ganjil 2026/2027 • 3 kelas terdaftar" (#475569, 14px).
- Right actions: Semester filter select ("Semester Ganjil 2026/2027") + View toggle (Grid / List icon buttons).

MAHASISWA VARIANT — CLASS CARD GRID (3 columns, gap 24px):
Each card: white #FFFFFF, border #E2E8F0, radius 12px, padding 20px, elevation-1.
- Top row: Class code pill "TI-A" (monospace, #EFF6FF bg / #2563EB text) + SKS pill "3 SKS".
- Title: Course name "Rekayasa Perangkat Lunak" (18px semibold).
- Lecturer row: small avatar + "Dr. Awan Rosi, M.Kom."
- Progress block: label "Progres Pertemuan" + "3 dari 16 pertemuan" + thin progress bar (25%, #2563EB on #E2E8F0).
- Status row: badge "Sesi Presensi Aktif" (green pulse) OR "Belum Ada Sesi Aktif" (slate) + material count icon "5 Materi".
- Footer action: primary button "Buka Ruang Kelas →" full width.

DOSEN VARIANT — CLASS CARD GRID (3 columns):
Same card anatomy but replace the progress block with an operational summary row of 3 mini stats:
- "16 Pertemuan" | "5 Materi" | "38 Mahasiswa"
- Status row: "Presensi P-3: Aktif" green badge or "Presensi Ditutup" slate badge.
- Footer: primary button "Kelola Ruang Kelas →" + ghost icon button (more menu).

SHARED STATES:
- Empty state (Mahasiswa): open-book illustration + "Belum Ada Kelas yang Diikuti" + subtext "Administrator belum mendaftarkan Anda ke kelas semester ini."
- Empty state (Dosen): chalkboard illustration + "Belum Ada Kelas yang Diampu".
- Skeleton state: 3 shimmering card placeholders.
```

#### Layar 2: Halaman Ruang Kelas — Mahasiswa (`/classes/:classId`)
**Template Prompt Google Stitch:**
```text
Generate the Mahasiswa Classroom page (Ruang Kelas) for SPADA LMS UPGRIS.

CLASS HEADER CARD (white, radius 12px, padding 24px):
- Left: Course code pill "TI-A" + SKS pill "3 SKS".
- Title: "Rekayasa Perangkat Lunak" (24px bold).
- Meta row with icons: Lecturer "Dr. Awan Rosi, M.Kom." | Semester "Ganjil 2026/2027" | "16 Pertemuan Terstruktur".
- Right side: Attendance summary ring — circular progress ring showing "75%" with label "Kehadiran Saya" and caption "12 dari 16 pertemuan".
- Below header: horizontal progress bar "Progres Kelas: 3 / 16 Pertemuan Selesai" with percentage.
- Tabs: "Pertemuan" (active), "Rekap Kehadiran Saya".

MEETING ACCORDION LIST (16 rows, vertical stack, gap 8px):
Each collapsed row: white card, radius 12px, border #E2E8F0, padding 16px 20px, hover #F8FAFC.
Row anatomy:
- Left: Circular meeting number badge "P1" (40px, #EFF6FF bg, #2563EB text, monospace).
- Middle: Title "Pengenalan Rekayasa Perangkat Lunak" (16px semibold) + type badge "Pembelajaran Pra-UTS" (blue pill, uppercase 11px).
- Micro row: 2 material icon "2 Materi" + presence pill "HADIR" (green, icon check) or "Belum Diisi" (slate).
- Right: chevron-down icon.
Highlight the CURRENT meeting row with a subtle left vertical bar (#2563EB) and a "Pertemuan Berjalan" tag.

EXPANDED ROW CONTENT (show Meeting 3 expanded in the mockup):
- Description paragraph: lesson objectives in #334155.
- Section "Materi Pembelajaran" with 2 material items:
  - Item: file-type icon (PDF red / DOCX blue accent), title "Modul 3 — Analisis Kebutuhan.pdf", metadata "1.2 MB • Diunggah 6 Okt 2026", action button "Unduh Berkas" (outline, download icon + shield icon).
- Section "Presensi Pertemuan 3" — Attendance Card:
  - State: session OPEN.
  - Badge with pulsing green dot "Sesi Presensi Aktif" + caption "Dibuka pukul 09:15 WIB • Toleransi 15 menit".
  - Primary button "Isi Kehadiran Sekarang" (#2563EB).
- Alternate attendance state examples (show as small variant previews below the accordion):
  1) Locked: gray card, lock icon, text "Sesi presensi belum dibuka oleh Dosen Pengampu", button DISABLED "Isi Kehadiran".
  2) Done: green confirmation card "Kehadiran Anda tercatat HADIR pukul 09:18 WIB".

MEETING TYPE VARIANTS (render all four in the list):
- P8: amber badge "Ujian Tengah Semester (UTS)" with calendar/flag icon; row shows "Lembar ujian tersedia pada tahap evaluasi" note instead of a start button.
- P16: maroon badge "Ujian Akhir Semester (UAS)" with same neutral note.

MOBILE (375px):
- Header card stacks: ring moves below the title.
- Accordion rows become full-width with the meeting number badge pinned left.
- Sticky bottom sheet action "Isi Kehadiran" appears only when a session is OPEN.
```

#### Layar 3: Halaman Ruang Kelas — Dosen (`/classes/:classId`)
**Template Prompt Google Stitch:**
```text
Generate the Dosen Classroom management page (Ruang Kelas — Mode Kelola) for SPADA LMS UPGRIS.

CLASS HEADER CARD:
- Title "Rekayasa Perangkat Lunak" + code pill "TI-A" + SKS pill.
- Meta: "38 Mahasiswa Terdaftar" | "Semester Ganjil 2026/2027" | "16 Pertemuan".
- Right: two primary actions — "Unggah Materi" (outline, upload icon) and "Rekap Kehadiran" (outline, table icon).
- Tabs: "Pertemuan" (active), "Rekap Kehadiran", "Daftar Mahasiswa".

MEETING ACCORDION LIST (16 rows, denser than student view):
Collapsed row anatomy:
- Meeting number badge "P1".
- Title + type badge.
- Status chips row: "5 Materi" | "Presensi: Aktif" (green) / "Ditutup" (slate) / "Belum Dibuka" (gray lock) | "Terbit" or "Draf" publication chip.
- Right: "Kelola" ghost button + chevron.

EXPANDED ROW (show Meeting 3 expanded):
- Inline edit block: Text input "Judul Topik Pertemuan", Textarea "Deskripsi / Capaian Pembelajaran".
- Toggle switch: "Publikasikan pertemuan ke mahasiswa" (on).
- Action row: "Simpan Perubahan" (primary) + "Batal" (ghost).
- Section "Materi Pembelajaran" with an upload dropzone plus a list of existing materials (each with Edit / Hapus icon buttons).

ATTENDANCE CONTROL PANEL (right-side sticky card on desktop, 360px):
- Title: "Kontrol Presensi — Pertemuan 3".
- State A (NOT_OPENED): lock icon, text "Sesi presensi belum dibuka", input "Batas toleransi (menit)" default 15, primary button "Buka Sesi Presensi".
- State B (OPEN): green pulse badge "Sesi Presensi Aktif", live counter "18 / 38 Mahasiswa sudah mengisi", elapsed time "00:12:40", primary button "Tutup Sesi Presensi" (destructive outline), secondary link "Lihat Daftar Kehadiran".
- State C (CLOSED): slate badge "Sesi Ditutup", summary "32 Hadir • 2 Sakit • 1 Izin • 3 Alpa", button "Buka Ulang Sesi" (outline) + link "Koreksi Kehadiran".

LIVE ATTENDANCE LIST (inside the control panel below the status):
- Compact rows: avatar initials, name, NIM monospace, status badge, check-in time.
- Auto-refresh indicator: small text "Diperbarui otomatis • 10 detik lalu" with a refresh icon.

MOBILE:
- Control panel collapses into a sticky bottom action bar with the current session state and the open/close button.
```

#### Layar 4: Detail Pertemuan (`/classes/:classId/meetings/:meetingId`)
**Template Prompt Google Stitch:**
```text
Generate the Meeting Detail page for SPADA LMS UPGRIS (Light Clean Surface).

PAGE HEADER:
- Breadcrumb: "Dasbor / Kelas Saya / Rekayasa Perangkat Lunak (TI-A) / Pertemuan 3".
- Back link "← Kembali ke Ruang Kelas" (ghost, arrow-left icon).
- Title row: meeting number badge "P3" + "Analisis Kebutuhan Sistem" (24px bold) + type badge "Pembelajaran Pra-UTS".
- Meta: "Diperbarui 6 Okt 2026 • 09:12 WIB" + publication chip "Terbit".

TWO-COLUMN LAYOUT (desktop 8/4 split, gap 24px):
LEFT COLUMN (main content):
1. Card "Deskripsi & Capaian Pembelajaran" — body paragraph, 14px, #334155, line-height 1.6.
2. Card "Materi Pembelajaran":
   - Header with count "2 Materi" + button "Unggah Materi" (only for Dosen/Admin).
   - Material row anatomy: file-type icon tile (40px), title, description, metadata "1.2 MB • PDF • 6 Okt 2026", right action "Unduh Berkas" (outline button with download + shield icon).
   - Material row hover state and a 403-restricted variant (lock icon + "Anda tidak terdaftar pada kelas ini" + disabled download).
   - Empty state: dashed-border zone + "Belum ada materi untuk pertemuan ini".

RIGHT COLUMN (sticky sidebar):
1. Attendance Card (see Layar 2 states for Mahasiswa / Layar 3 states for Dosen).
2. "Ringkasan Pertemuan" mini card: Total Materi, Status Presensi, Jumlah Hadir (dosen only), Tanggal.

DOSEN VARIANT:
- Replace the read-only description with inline editable fields and a "Simpan" action.
- Add a danger zone at the bottom: "Hapus Pertemuan?" — disabled with tooltip "Pertemuan terstruktur 1–16 tidak dapat dihapus."
```

---

### 5.2 Modul Distribusi Materi Pembelajaran

#### Layar 5: Modal Unggah Materi (Dosen) & State Validasi Berkas
**Template Prompt Google Stitch:**
```text
Generate the "Unggah Materi Pembelajaran" modal dialog for Dosen in SPADA LMS UPGRIS.

MODAL SHELL:
- Overlay: rgba(15, 23, 42, 0.45) with 4px backdrop blur.
- Container: white #FFFFFF, max-width 640px, radius 16px, elevation-4, padding 24px.
- Header: title "Unggah Materi Baru" (20px semibold) + subtitle "Pertemuan 3 • Rekayasa Perangkat Lunak (TI-A)" + close icon button.
- Footer: right-aligned "Batal" (ghost) + "Unggah Materi" (primary #2563EB, upload icon).

FORM FIELDS:
1. Text input — Label "JUDUL MATERI" (required), placeholder "Contoh: Modul 3 — Analisis Kebutuhan Sistem".
2. Textarea — Label "DESKRIPSI MATERI" (optional, max 300 chars), character counter bottom-right.
3. FILE DROPZONE (the focal component):
   - Dashed 2px border #CBD5E1, radius 12px, background #F8FAFC, padding 32px, centered content.
   - Upload cloud icon (#2563EB, 40px) + primary text "Tarik & lepas berkas di sini, atau klik untuk memilih" + secondary link "Pilih Berkas".
   - Whitelist indicator row: badges ".pdf" ".docx" ".xlsx" ".zip" (gray pills) + text "Maksimal 10MB per berkas".

VALIDATION STATE VARIANTS (render all as separate frames):
A) DEFAULT: neutral dashed dropzone.
B) DRAG-OVER / HOVER: border #2563EB, background #EFF6FF, icon bounce hint.
C) INVALID FORMAT: border 2px solid #DC2626, background #FEF2F2, alert-triangle icon, message "Format berkas tidak didukung. Harap unggah file berformat .pdf, .docx, .xlsx, atau .zip", shake animation note.
D) OVERSIZE: border #DC2626, message "Ukuran berkas melebihi batas maksimal yang diizinkan (maks. 10MB)" with a size meter showing "12.4 MB / 10 MB".
E) UPLOADING: file chip row (file icon, name "Modul-3.pdf", "1.2 MB") + progress bar 64% (#2563EB) + cancel icon + disabled submit button.
F) SUCCESS: file chip with green check-circle, background #F0FDF4, border #BBF7D0, text "Berkas siap diunggah (1.2 MB)" + "Ganti Berkas" link.

ACCESSIBILITY NOTES TO RENDER:
- Dropzone is keyboard-focusable with a visible 2px #3B82F6 focus ring.
- Error text uses role="alert" styling (icon + red text), never color alone.
```

#### Layar 6: Modal Konfirmasi Hapus Materi & State Unduh Terproteksi
**Template Prompt Google Stitch:**
```text
Generate two related states for SPADA LMS UPGRIS materials.

STATE 1 — DELETE MATERIAL CONFIRMATION MODAL:
- Container: white, max-width 480px, radius 16px, padding 24px.
- Top: circular soft red icon container with trash icon (#DC2626 on #FEE2E2).
- Title: "Hapus Materi Pembelajaran?" (18px semibold).
- Body: "Materi 'Modul 3 — Analisis Kebutuhan Sistem' akan dihapus permanen dan tidak dapat diakses lagi oleh mahasiswa yang terdaftar."
- Warning strip: amber background #FEF3C7 with alert icon, text "Tindakan ini tidak dapat dibatalkan."
- Footer: "Batal" (ghost) + "Ya, Hapus Materi" (destructive #DC2626).

STATE 2 — PROTECTED DOWNLOAD DENIED (403):
- Render as an inline card replacement inside the material list, not a full page.
- Card: border #FECACA, background #FEF2F2, radius 12px, padding 16px.
- Lock icon + title "Akses Unduhan Ditolak" (semibold #991B1B).
- Body: "Akun Anda tidak terdaftar pada kelas ini, sehingga berkas materi tidak dapat diunduh."
- Action: "Kembali ke Dasbor" (outline).

STATE 3 — SECURE DOWNLOAD IN PROGRESS:
- Material row shows a spinner + "Mengunduh… 45%" with a thin progress bar; the shield icon tooltip reads "Berkas terproteksi — diverifikasi melalui sesi Anda".
```

---

### 5.3 Modul Presensi Digital Terkendali

#### Layar 7: Kartu Presensi Mahasiswa (3 State)
**Template Prompt Google Stitch:**
```text
Generate three explicit attendance card states for Mahasiswa in SPADA LMS UPGRIS. Render them side by side for comparison, each labeled.

ALL CARDS: white #FFFFFF, border #E2E8F0, radius 12px, padding 20px, consistent height.

STATE A — NOT OPENED (locked):
- Header: calendar-check icon + "Presensi Pertemuan 3".
- Status pill: gray "Sesi Belum Dibuka" with lock icon.
- Body text: "Dosen Pengampu belum membuka sesi presensi untuk pertemuan ini. Tombol kehadiran akan aktif secara otomatis saat sesi dibuka."
- Button: "Isi Kehadiran" — DISABLED (bg #E2E8F0, text #94A3B8, lock icon, cursor-not-allowed).
- Helper: "Terakhir diperbarui 09:10 WIB".

STATE B — OPEN (active):
- Header: calendar-check icon + "Presensi Pertemuan 3".
- Status pill: green #DCFCE7 with pulsing dot + "Sesi Presensi Aktif".
- Countdown/context: "Dibuka 09:15 WIB • Toleransi 15 menit • Ditutup otomatis 09:30 WIB" (clock icon).
- Button: "Isi Kehadiran Sekarang" (primary #2563EB, full width, check icon).
- Helper link: "Sesi ditutup otomatis setelah batas toleransi." (12px, #64748B).

STATE C — ALREADY CHECKED IN:
- Header: check-circle green icon + "Presensi Pertemuan 3".
- Status pill: green "HADIR" with check-circle icon.
- Detail row: "Tercatat pukul 09:18 WIB" in JetBrains Mono.
- Button: "Kehadiran Sudah Tercatat" (disabled, green outline) — no double submit.

STATE D — SESSION CLOSED WITHOUT RECORD:
- Status pill: slate "Sesi Ditutup".
- Body: "Sesi presensi telah ditutup dan Anda tercatat ALPA. Hubungi Dosen Pengampu jika terdapat kekeliruan."
- ALPA badge red with x-circle icon.
- Button: "Ajukan Koreksi ke Dosen" (ghost, informational only — no form).

MOBILE: cards are full-width; primary button height 48px to exceed the 44px touch target.
```

#### Layar 8: Tabel Kehadiran Pertemuan & Modal Koreksi (Dosen)
**Template Prompt Google Stitch:**
```text
Generate the per-meeting attendance table and correction modal for Dosen in SPADA LMS UPGRIS.

ATTENDANCE TABLE CARD:
- Header: "Daftar Kehadiran — Pertemuan 3" + session status badge ("Sesi Presensi Aktif" green pulse) + right-side buttons "Tutup Sesi" (destructive outline) and "Ekspor" (disabled with tooltip "Tersedia pada MVP 5").
- Summary strip above the table: 4 mini counters — Hadir 32 (green), Sakit 2 (blue), Izin 1 (amber), Alpa 3 (red), plus "Belum Mengisi 0".
- Filter bar: Search input (Nama / NIM) + Status filter select (Semua, Hadir, Sakit, Izin, Alpa, Belum Mengisi) + Refresh icon button with "Diperbarui otomatis" caption.

DATA TABLE:
- Columns: Mahasiswa (avatar + name), NIM (monospace), Status Kehadiran (badge with icon), Waktu Check-in (monospace, "—" if empty), Catatan (truncated with ellipsis), Aksi ("Koreksi" ghost button).
- Row hover: #F8FAFC. Alternating zebra rows optional but keep borders #E2E8F0.
- Empty row state: "Belum ada mahasiswa yang mengisi kehadiran. Bagikan sesi aktif kepada kelas Anda."
- Footer: "Menampilkan 1–10 dari 38 mahasiswa" + pagination.

CORRECTION MODAL DIALOG:
- Container: white, max-width 520px, radius 16px, padding 24px.
- Header: "Koreksi Status Kehadiran" + subtitle "Ahmad Fauzi • NIM 24670001".
- Radio group (cards, not plain radios), each a selectable tile with icon + label + helper:
  - HADIR (green check-circle) — "Hadir pada sesi perkuliahan"
  - SAKIT (blue hospital) — "Berhalangan karena sakit"
  - IZIN (amber file-text) — "Izin dengan keterangan"
  - ALPA (red x-circle) — "Tidak hadir tanpa keterangan"
- Selected tile: 2px #2563EB border + #EFF6FF background + check indicator.
- Textarea: Label "CATATAN KETERANGAN" placeholder "Contoh: Surat dokter terlampir (No. 421/SK/2026)" + counter.
- Footer: "Batal" + "Simpan Koreksi" (primary).
- Audit note under footer: "Perubahan akan tercatat pada Jejak Audit SPADA." (12px, #64748B).
```

#### Layar 9: Rekapitulasi Kehadiran Kelas (`/classes/:classId/attendance-recap`)
**Template Prompt Google Stitch:**
```text
Generate the Class Attendance Recap (Rekapitulasi Kehadiran) screen for Dosen and Mahasiswa in SPADA LMS UPGRIS.

HEADER:
- Breadcrumb: "Dasbor / Kelas Diampu / Rekayasa Perangkat Lunak (TI-A) / Rekap Kehadiran".
- Title: "Rekapitulasi Kehadiran Kelas".
- Subtitle: "Pertemuan yang telah diselenggarakan: 12 dari 16".
- Right controls: Class selector (if entered from sidebar), "Unduh Rekap" button (disabled with tooltip "Ekspor tersedia pada MVP 5").

KPI STRIP (4 metric cards, grid 4):
1) "Rata-rata Kehadiran Kelas" — 86.4% (monospace) with trend note.
2) "Mahasiswa ≥ 70%" — 34 dari 38 (green).
3) "Mahasiswa < 70%" — 4 dari 38 (red, icon alert).
4) "Sesi Terlaksana" — 12 / 16.

DETAIL TABLE — ATTENDANCE MATRIX (horizontally scrollable on smaller screens):
- Sticky left columns: #, Mahasiswa (avatar + name), NIM (monospace).
- Meeting columns P1…P16 rendered as compact 32px square cells:
  - HADIR: green filled square with white check icon.
  - SAKIT: blue square with white cross/thermometer icon.
  - IZIN: amber square with white file icon.
  - ALPA: red square with white x icon.
  - BELUM: gray outlined square with dash.
  - Exam columns P8 & P16 use a distinct header background (amber for UTS, maroon for UAS).
- Right sticky columns: "Hadir" count, "% Kehadiran" (monospace, colored: green ≥70, red <70), status pill "Memenuhi Syarat" / "Belum Memenuhi" (informational only).
- Column header tooltips label each meeting type.

LEGEND ROW BENEATH TABLE: five inline legend items with icon + label (Hadir, Sakit, Izin, Alpa, Belum Diisi).
INFORMATIONAL NOTE BANNER (blue #E0F2FE): "Ambang batas kehadiran 70% baru akan diberlakukan sebagai syarat akses ujian pada tahap evaluasi UTS/UAS."

MAHASISWA VARIANT:
- No full matrix. Instead a personal recap card: donut/progress ring "86%" + breakdown list (Hadir 10 • Sakit 1 • Izin 0 • Alpa 1) + per-meeting history list with badges.
- Caption: "Rekap bersifat informatif dan diperbarui otomatis setelah dosen menutup sesi."

MOBILE:
- Matrix becomes a vertical list per student; tapping a student opens a bottom sheet with the 16-meeting badge grid.
```

#### Layar 10: Penyesuaian Jejak Audit & Tautan Admin (Minor)
**Template Prompt Google Stitch:**
```text
Update the existing MVP 1 screens with MVP 2 additions only — do not redesign them.

1. JEJAK AUDIT (/admin/audit-logs):
   - Extend the Action badge palette with new actions: MATERIAL_UPLOAD (blue), MATERIAL_DELETE (red), ATTENDANCE_OPEN (green), ATTENDANCE_CLOSE (slate), ATTENDANCE_CORRECT (amber).
   - Extend the Entity filter with: Material, Attendance Session, Attendance Record.
   - The JSON Diff modal must render attendance corrections as old/new pairs, e.g. old {"status":"ALPA"} → new {"status":"HADIR","notes":"Surat dokter"}.

2. PEMBUKAAN KELAS (/admin/classes):
   - Add a secondary action "Kelola Ruang Kelas" (outline, external-arrow icon) beside "Kelola Enrollment".
   - Add a small caption under the class row: "16 pertemuan dibuat otomatis saat kelas dibuka."

3. SIDEBAR:
   - Mahasiswa menu: "Kelas Saya" now navigates to /classes.
   - Dosen menu: "Kelas Diampu" now navigates to /classes.
   - No new admin menu items.
```

---

## 6. Jobdesk Rinci & Prompt Siap Kirim pada Tiap Fase Pengerjaan (6 Fase Google Stitch)

Berikut pembagian tugas dan rincian pekerjaan (*detailed jobdesk*) UI/UX Designer beserta **Prompt Siap Kirim (Ready-to-Send Prompts)** untuk setiap fase MVP 2. Seluruh eksekusi **100% melalui Google Stitch**, meneruskan project MVP 1.

```text
Alur Eksekusi 6 Fase Desain UI/UX MVP 2 SPADA LMS via Google Stitch:
┌────────────────────────────────────────────────────────────────────────┐
│ Fase 1: Reaktivasi Proyek Stitch, Master Context Extension & Sitemap   │
└───────────────────────────────────┬────────────────────────────────────┘
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│ Fase 2: Ekstensi UI Kit — Meeting, Presence, File & Matrix Primitives  │
└───────────────────────────────────┬────────────────────────────────────┘
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│ Fase 3: Generasi Ruang Kelas & Struktur Akordeon 16 Pertemuan          │
└───────────────────────────────────┬────────────────────────────────────┘
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│ Fase 4: Generasi Modul Distribusi Materi & Validasi Berkas             │
└───────────────────────────────────┬────────────────────────────────────┘
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│ Fase 5: Generasi Presensi Digital Terkendali & Rekapitulasi Kehadiran  │
└───────────────────────────────────┬────────────────────────────────────┘
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│ Fase 6: States/Edge Cases, Uji WCAG 2.1 AA & Handoff Frontend          │
└────────────────────────────────────────────────────────────────────────┘
```

---

### 🗺️ Fase 1: Reaktivasi Proyek Google Stitch, Master Context Extension & Sitemap MVP 2

* **Tujuan Fase:** Membuka kembali proyek Stitch MVP 1, menginjeksi aturan MVP 2, memetakan rute ruang kelas, dan memastikan tidak ada regenerasi komponen lama.
* **Rincian Jobdesk Designer:**
  1. **Reaktivasi Proyek:** Membuka project `SPADA-LMS-UPGRIS` dan memverifikasi seluruh token, halaman MVP 1, serta UI Kit masih utuh. Mengganti nama project menjadi `SPADA-LMS-UPGRIS-MVP2`.
  2. **Injeksi Master Context Extension:** Menambahkan aturan 16 pertemuan, state machine presensi, dan kebijakan validasi berkas ke project setting (Bab 4 dokumen ini).
  3. **Pemetaan Rute Baru:** Menyusun penambahan sitemap:
     - `/classes` (Daftar Kelas Saya / Kelas Diampu)
     - `/classes/:classId` (Ruang Kelas — akordeon 16 pertemuan)
     - `/classes/:classId/meetings/:meetingId` (Detail Pertemuan)
     - `/classes/:classId/attendance-recap` (Rekapitulasi Kehadiran)
     - Modal/overlay: `Unggah Materi`, `Edit Materi`, `Hapus Materi`, `Koreksi Kehadiran`, `Buka/Tutup Sesi`.
  4. **Audit Kesenjangan Visual:** Memeriksa bahwa komponen MVP 1 (Card, Badge, Table, Modal, Dropzone belum ada) dapat dipakai ulang; hanya menandai komponen yang benar-benar baru untuk Fase 2.

#### 💬 Prompt Siap Kirim — Fase 1 (Salin & Kirim ke Google Stitch):

```text
[PROMPT SIAP KIRIM - GOOGLE STITCH FASE 1.1: PROJECT REACTIVATION & MVP 2 SYSTEM RULES]
Reactivate the existing project "SPADA LMS UPGRIS" and extend it for MVP 2.

Confirm the following MVP 1 assets remain untouched: Portal Login (/login), Password Recovery (/forgot-password), App Shell, Mahasiswa/Dosen/Admin dashboards, User Profile, User Management, Master Courses, Class Opening, Direct Enrollment, Audit Trail, and the full UI Kit.

Then apply these MVP 2 rules to the project context:
1. Every class has EXACTLY 16 meetings. P1–7 Pembelajaran Pra-UTS, P8 UTS, P9–15 Pembelajaran Pasca-UTS, P16 UAS. Never renumber or omit.
2. Attendance state machine: NOT_OPENED -> OPEN -> CLOSED. Student check-in only while OPEN. Disabled (locked) button otherwise.
3. Presence statuses: HADIR (green #16A34A), SAKIT (blue #0284C7), IZIN (amber #D97706), ALPA (red #DC2626). Each must pair color + icon + text.
4. Materials: upload by Dosen Pengampu/Admin; allowed .pdf .docx .xlsx .zip; max 10MB; protected download for enrolled students only (403 state otherwise). Never expose a public file URL.
5. All MVP 2 screens use the Light Clean Surface theme. No new public/dark-navy pages.
6. Exam meetings (P8, P16) display an exam badge only — no exam sheet, timer, or access gate in MVP 2.

Acknowledge and list the reusable MVP 1 components before generating anything new.
```

```text
[PROMPT SIAP KIRIM - GOOGLE STITCH FASE 1.2: MVP 2 SITEMAP & NAVIGATION FLOW]
Generate an interactive visual sitemap and user-flow diagram for SPADA LMS UPGRIS MVP 2, showing only the NEW routes integrated with the existing shell.

Roles and flows:
1. MAHASISWA: Dasbor -> Kelas Saya (/classes) -> Ruang Kelas (/classes/:classId) -> Detail Pertemuan (/classes/:classId/meetings/:meetingId) -> [Unduh Materi | Isi Kehadiran (only when OPEN)] ; plus Rekap Kehadiran Saya (/classes/:classId/attendance-recap).
2. DOSEN: Dasbor -> Kelas Diampu (/classes) -> Ruang Kelas (/classes/:classId) -> Kelola Pertemuan (edit topik, publish toggle) -> [Unggah/Edit/Hapus Materi] ; Attendance Control (Buka/Tutup Sesi) -> Daftar Kehadiran -> Koreksi Kehadiran ; Rekap Kehadiran (/classes/:classId/attendance-recap).
3. ADMIN: Existing admin routes unchanged; only add an outbound link "Kelola Ruang Kelas" from /admin/classes and new Material/Attendance entities in /admin/audit-logs.

Annotate each node with a role-access badge and mark the three attendance states (NOT_OPENED, OPEN, CLOSED) as explicit decision points.
Render as a clean structured UI flowchart, not a code block.
```

---

### 🎨 Fase 2: Ekstensi Design System Tokens & UI Kit Primitives via Prompt

* **Tujuan Fase:** Menambahkan token semantik MVP 2 dan komponen baru (*molecules*) ke UI Kit yang sudah ada, tanpa merancang ulang komponen MVP 1.
* **Rincian Jobdesk Designer:**
  1. **Prompting Token Semantik Baru:** Mendaftarkan palet Status Kehadiran (4 status), Status Sesi Presensi (3 status), Jenis Pertemuan (4 tipe), dan Status Berkas (3 status).
  2. **Prompting Atoms Baru:**
     - `PresenceBadge` (HADIR/SAKIT/IZIN/ALPA) — ikon + label wajib.
     - `SessionStatusPill` (OPEN dengan pulse dot, CLOSED, NOT_OPENED dengan gembok).
     - `MeetingTypeBadge` (Pra-UTS, UTS, Pasca-UTS, UAS).
     - `FileTypeIcon` (PDF, DOCX, XLSX, ZIP) dengan warna pembeda namun tetap kontras.
     - `MeetingNumberBadge` (P1…P16, monospace).
  3. **Prompting Molecules Baru:**
     - `MeetingAccordionRow` — 3 state (collapsed, hover, expanded) × 2 varian (Mahasiswa read-only, Dosen kelola).
     - `MaterialListItem` — default, downloading, 403-restricted.
     - `FileDropzone` — 6 state (default, drag-over, invalid format, oversize, uploading, success).
     - `AttendanceControlPanel` — 3 state (NOT_OPENED, OPEN, CLOSED).
     - `AttendanceMatrixCell` + `AttendanceMatrixTable` — 5 cell states.
     - `ProgressRing` — persentase kehadiran personal.
     - `StatCounterStrip` — ringkasan Hadir/Sakit/Izin/Alpa/Belum.

#### 💬 Prompt Siap Kirim — Fase 2 (Salin & Kirim ke Google Stitch):

```text
[PROMPT SIAP KIRIM - GOOGLE STITCH FASE 2.1: MVP 2 SEMANTIC TOKENS & ATOMS]
Extend the existing SPADA LMS UPGRIS design system catalog with MVP 2 tokens and atoms. Do not regenerate MVP 1 atoms.

1. PRESENCE STATUS BADGES (color + icon + uppercase 11px label, radius full, padding 4px 10px):
   - HADIR: text #16A34A, fill #DCFCE7, border #BBF7D0, icon check-circle.
   - SAKIT: text #0284C7, fill #E0F2FE, border #BAE6FD, icon hospital.
   - IZIN:  text #D97706, fill #FEF3C7, border #FDE68A, icon file-text.
   - ALPA:  text #DC2626, fill #FEE2E2, border #FECACA, icon x-circle.
   - BELUM DIISI: text #64748B, fill #F8FAFC, border #E2E8F0, icon minus-circle.

2. SESSION STATUS PILLS:
   - OPEN: green pill, 8px pulsing dot #22C55E (2s ease-in-out repeat), label "Sesi Presensi Aktif".
   - CLOSED: slate pill, static dot #94A3B8, label "Sesi Ditutup".
   - NOT_OPENED: gray pill, lock icon, label "Sesi Belum Dibuka".

3. MEETING TYPE BADGES:
   - PRA-UTS: #2563EB on #DBEAFE — "Pembelajaran Pra-UTS".
   - UTS: #D97706 on #FEF3C7 — "Ujian Tengah Semester (UTS)".
   - PASCA-UTS: #2563EB on #DBEAFE — "Pembelajaran Pasca-UTS".
   - UAS: #9F1239 on #FFE4E6 — "Ujian Akhir Semester (UAS)".

4. FILE TYPE ICONS (40px tile, radius 8px): PDF (red accent), DOCX (blue accent), XLSX (green accent), ZIP (slate accent) — each with the extension label in JetBrains Mono.

5. MEETING NUMBER BADGE: 40px circle, #EFF6FF fill, #2563EB text, JetBrains Mono semibold. Include an "active/current" variant with a #2563EB solid fill and white text.

Render as a labeled token + atom sheet with exact hex values under each swatch.
```

```text
[PROMPT SIAP KIRIM - GOOGLE STITCH FASE 2.2: MVP 2 MOLECULES]
Extend the SPADA LMS UPGRIS component library with these MVP 2 molecules. Show every state side by side with labels.

1. MEETING ACCORDION ROW (collapsed / hover / expanded) × (Mahasiswa read-only / Dosen kelola):
   - White card, radius 12px, border #E2E8F0, padding 16px 20px.
   - Left: MeetingNumberBadge. Middle: title 16px semibold + MeetingTypeBadge + meta chips (material count, presence pill). Right: chevron.
   - Current meeting: 4px left accent bar #2563EB + "Pertemuan Berjalan" tag.
   - Dosen variant adds "Terbit/Draf" chip and a "Kelola" ghost button.

2. MATERIAL LIST ITEM (default / downloading / 403-restricted / empty):
   - FileTypeIcon + title + description + metadata (size • type • date) + "Unduh Berkas" outline button with download + shield icon.
   - 403 variant replaces the button with a lock and red helper text.

3. FILE DROPZONE (default / drag-over / invalid-format / oversize / uploading / success):
   - Dashed 2px #CBD5E1, radius 12px, bg #F8FAFC, padding 32px.
   - Allowed-extension pills + "Maksimal 10MB" caption.
   - Error states use #DC2626 border with alert icon and the exact Indonesian error copy from SRS 7.5.
   - Success state uses #BBF7D0 border with a green check and a "Ganti Berkas" link.

4. ATTENDANCE CONTROL PANEL (NOT_OPENED / OPEN / CLOSED):
   - Sticky card 360px. Includes tolerance-minutes input, session timer, and live counter "18 / 38 Mahasiswa sudah mengisi".
   - OPEN state: green pulse pill + destructive-outline "Tutup Sesi Presensi".
   - CLOSED state: summary counters "32 Hadir • 2 Sakit • 1 Izin • 3 Alpa".

5. ATTENDANCE MATRIX CELL (hadir / sakit / izin / alpa / belum):
   - 32px square, radius 4px, centered white icon. Exam column headers use amber (#FEF3C7) for P8 and maroon (#FFE4E6) for P16.

6. PROGRESS RING: 96px circular ring, track #E2E8F0, progress #2563EB, center label "75%" in JetBrains Mono 20px bold with caption "Kehadiran Saya". Include a warning variant (<70%) in #DC2626.

7. STAT COUNTER STRIP: five inline counters with icon + number + label, separated by 1px #E2E8F0 dividers.

Render the full sheet on a Light Clean Surface (#F8FAFC) with state labels beneath each variant.
```

---

### 🔐 Fase 3: Generasi Ruang Kelas & Struktur Akordeon 16 Pertemuan

* **Tujuan Fase:** Membangkitkan halaman daftar kelas, ruang kelas (2 varian peran), dan detail pertemuan sebagai inti navigasi pembelajaran MVP 2.
* **Rincian Jobdesk Designer:**
  1. **Eksekusi Prompt Daftar Kelas (`/classes`):** Kartu kelas Mahasiswa dengan progres pertemuan; kartu kelas Dosen dengan ringkasan operasional.
  2. **Eksekusi Prompt Ruang Kelas Mahasiswa:** Header kelas + progress ring kehadiran + akordeon 16 pertemuan + state presensi terkunci/aktif/tercatat.
  3. **Eksekusi Prompt Ruang Kelas Dosen:** Tab Pertemuan/Rekap/Daftar Mahasiswa, akordeon versi kelola, panel kontrol presensi sticky.
  4. **Eksekusi Prompt Detail Pertemuan:** Layout 8/4, kartu deskripsi, panel materi, sidebar presensi, varian Dosen dengan inline edit.
  5. **Verifikasi Tipe Pertemuan:** Memastikan P-8 dan P-16 tampil dengan badge dan warna yang benar serta **tanpa** kontrol ujian.

#### 💬 Prompt Siap Kirim — Fase 3 (Salin & Kirim ke Google Stitch):

```text
[PROMPT SIAP KIRIM - GOOGLE STITCH FASE 3.1: CLASS LIST (/classes)]
Generate the class list page for SPADA LMS UPGRIS in two role variants (Mahasiswa "Kelas Saya" and Dosen "Kelas Diampu") inside the existing App Shell.

Header: breadcrumb, title, semester subtitle, semester filter select, and Grid/List view toggle.

Mahasiswa card (3-column grid, white, radius 12px, padding 20px):
- Code pill "TI-A" (monospace) + "3 SKS" pill.
- Course title 18px semibold.
- Lecturer row with small avatar.
- "Progres Pertemuan" label + "3 dari 16 pertemuan" + thin progress bar at 25%.
- Meta chips: presence status ("Sesi Presensi Aktif" green pulse / "Belum Ada Sesi Aktif" slate) + "5 Materi".
- Full-width primary button "Buka Ruang Kelas →".

Dosen card:
- Same header, but replace the progress bar with a 3-stat mini row: "16 Pertemuan" | "5 Materi" | "38 Mahasiswa".
- Presence chip: "Presensi P-3: Aktif" or "Presensi Ditutup".
- Primary button "Kelola Ruang Kelas →" + ghost more-menu icon.

Include empty states for both roles and a 3-card skeleton loading variant.
```

```text
[PROMPT SIAP KIRIM - GOOGLE STITCH FASE 3.2: MAHASISWA CLASSROOM (/classes/:classId)]
Generate the Mahasiswa Classroom page for SPADA LMS UPGRIS.

Header card: course code + SKS pills, "Rekayasa Perangkat Lunak" 24px bold, meta row (lecturer, semester, "16 Pertemuan Terstruktur"), and a 96px progress ring on the right labeled "75% Kehadiran Saya • 12 dari 16 pertemuan". Below it, a class progress bar "Progres Kelas: 3 / 16 Pertemuan Selesai". Tabs: "Pertemuan" (active), "Rekap Kehadiran Saya".

16-row meeting accordion:
- Collapsed row: 40px circular meeting number badge, title 16px semibold, MeetingTypeBadge (P1–7 blue Pra-UTS, P8 amber UTS, P9–15 blue Pasca-UTS, P16 maroon UAS), meta chips (material count, presence pill), chevron right.
- Mark Meeting 3 as current with a 4px left accent bar and "Pertemuan Berjalan" tag.
- Expand Meeting 3 to show: description paragraph; "Materi Pembelajaran" list with 2 items (file icon, title, "1.2 MB • 6 Okt 2026", "Unduh Berkas" button with shield icon); "Presensi Pertemuan 3" card in OPEN state (green pulsing pill, "Dibuka 09:15 WIB • Toleransi 15 menit", primary button "Isi Kehadiran Sekarang").
- Show two additional attendance-state previews beneath the accordion: locked ("Sesi presensi belum dibuka oleh Dosen Pengampu", disabled button) and already-checked-in ("Kehadiran Anda tercatat HADIR pukul 09:18 WIB").
- P8 and P16 rows: exam badge and a neutral note "Lembar ujian tersedia pada tahap evaluasi" — no start button, no timer.

Adapt to 375px: header stacks, ring moves below the title, sticky bottom sheet "Isi Kehadiran" appears only when a session is OPEN.
```

```text
[PROMPT SIAP KIRIM - GOOGLE STITCH FASE 3.3: DOSEN CLASSROOM MANAGEMENT (/classes/:classId)]
Generate the Dosen Classroom management page for SPADA LMS UPGRIS.

Header card: title + code/SKS pills, meta "38 Mahasiswa Terdaftar • Ganjil 2026/2027 • 16 Pertemuan", actions "Unggah Materi" and "Rekap Kehadiran" (outline), tabs "Pertemuan" (active) / "Rekap Kehadiran" / "Daftar Mahasiswa".

Dense 16-row accordion (Dosen variant):
- Row: meeting number badge, title, type badge, status chips ("5 Materi", presence state, "Terbit"/"Draf"), right-side "Kelola" ghost button + chevron.
- Expanded Meeting 3: inline editable "Judul Topik Pertemuan" input, "Deskripsi / Capaian Pembelajaran" textarea, toggle "Publikasikan pertemuan ke mahasiswa" (on), "Simpan Perubahan" + "Batal".
- Section "Materi Pembelajaran": upload dropzone + existing material rows with Edit/Hapus icon buttons.

Sticky right panel "Kontrol Presensi — Pertemuan 3" (360px) with three stacked state previews:
- NOT_OPENED: lock icon, tolerance-minutes input (15), primary "Buka Sesi Presensi".
- OPEN: green pulsing pill, live counter "18 / 38 Mahasiswa sudah mengisi", elapsed "00:12:40", destructive-outline "Tutup Sesi Presensi", link "Lihat Daftar Kehadiran".
- CLOSED: slate pill, summary "32 Hadir • 2 Sakit • 1 Izin • 3 Alpa", "Buka Ulang Sesi" + "Koreksi Kehadiran".

Include a compact live attendance list under the panel with avatar, name, NIM, presence badge, and check-in time, plus a caption "Diperbarui otomatis • 10 detik lalu".

On mobile, collapse the control panel into a sticky bottom bar showing the session state and the open/close action.
```

```text
[PROMPT SIAP KIRIM - GOOGLE STITCH FASE 3.4: MEETING DETAIL (/classes/:classId/meetings/:meetingId)]
Generate the Meeting Detail page for SPADA LMS UPGRIS with two role variants.

Header: breadcrumb "Dasbor / Kelas Saya / Rekayasa Perangkat Lunak (TI-A) / Pertemuan 3", back link, meeting number badge "P3", title "Analisis Kebutuhan Sistem" 24px bold, type badge "Pembelajaran Pra-UTS", meta "Diperbarui 6 Okt 2026 • 09:12 WIB", publication chip "Terbit".

Layout: 8/4 column split, gap 24px.
Left column:
1) Card "Deskripsi & Capaian Pembelajaran" with a readable paragraph.
2) Card "Materi Pembelajaran" with count header, "Unggah Materi" button (Dosen only), 2 material rows (file tile, title, description, "1.2 MB • PDF • 6 Okt 2026", "Unduh Berkas" outline button), plus an empty dashed state and a 403-restricted row variant.
Right sticky column:
1) Attendance card (Mahasiswa states: NOT_OPENED locked / OPEN active / checked-in).
2) "Ringkasan Pertemuan" mini card with Total Materi, Status Presensi, Jumlah Hadir (Dosen only), Tanggal.

Dosen variant: description becomes inline editable with "Simpan"; add a disabled danger zone "Hapus Pertemuan?" with tooltip "Pertemuan terstruktur 1–16 tidak dapat dihapus."
```

---

### 👥 Fase 4: Generasi Modul Distribusi Materi & Validasi Berkas

* **Tujuan Fase:** Membangkitkan seluruh alur materi — unggah, edit, hapus, unduh terproteksi — dengan penekanan pada kejelasan validasi berkas.
* **Rincian Jobdesk Designer:**
  1. **Eksekusi Prompt Modal Unggah Materi:** Form judul/deskripsi + Dropzone dengan 6 state validasi.
  2. **Eksekusi Prompt Modal Edit Materi:** Reuse form unggah tanpa field berkas wajib + opsi "Ganti Berkas".
  3. **Eksekusi Prompt Konfirmasi Hapus:** Dialog destruktif dengan peringatan permanen.
  4. **Eksekusi Prompt State Unduh:** Downloading, protected/secure indicator, dan 403 denied.
  5. **Verifikasi Copywriting Error:** Memastikan teks error persis sesuai SRS 7.5 dan dapat diterjemahkan langsung ke Zod/validation message.

#### 💬 Prompt Siap Kirim — Fase 4 (Salin & Kirim ke Google Stitch):

```text
[PROMPT SIAP KIRIM - GOOGLE STITCH FASE 4.1: UPLOAD MATERIAL MODAL & FILE VALIDATION STATES]
Generate the "Unggah Materi Pembelajaran" modal for Dosen in SPADA LMS UPGRIS.

Shell: overlay rgba(15,23,42,0.45) + 4px blur; white container max-width 640px, radius 16px, elevation-4, padding 24px. Header "Unggah Materi Baru" + subtitle "Pertemuan 3 • Rekayasa Perangkat Lunak (TI-A)" + close button. Footer "Batal" (ghost) + "Unggah Materi" (primary, upload icon).

Fields:
1) Text input "JUDUL MATERI" (required) placeholder "Contoh: Modul 3 — Analisis Kebutuhan Sistem".
2) Textarea "DESKRIPSI MATERI" with 300-char counter.
3) File dropzone: dashed 2px #CBD5E1, bg #F8FAFC, radius 12px, padding 32px, cloud icon #2563EB, text "Tarik & lepas berkas di sini, atau klik untuk memilih", link "Pilih Berkas", allowed-extension pills (.pdf .docx .xlsx .zip) and caption "Maksimal 10MB per berkas".

Render all six dropzone states as labeled frames:
A) Default  B) Drag-over (#2563EB border, #EFF6FF bg)  C) Invalid format (red 2px border, #FEF2F2 bg, alert icon, "Format berkas tidak didukung. Harap unggah file berformat .pdf, .docx, .xlsx, atau .zip")  D) Oversize ("Ukuran berkas melebihi batas maksimal yang diizinkan (maks. 10MB)" + size meter "12.4 MB / 10 MB")  E) Uploading (file chip "Modul-3.pdf • 1.2 MB", 64% progress bar, cancel icon, disabled submit)  F) Success (green check chip, #F0FDF4 bg, "Berkas siap diunggah (1.2 MB)", "Ganti Berkas" link).

Dropzone must be keyboard-focusable with a visible 2px #3B82F6 focus ring. Error text always includes BOTH icon and text, never color alone.
```

```text
[PROMPT SIAP KIRIM - GOOGLE STITCH FASE 4.2: EDIT & DELETE MATERIAL, PROTECTED DOWNLOAD STATES]
Generate the edit/delete material flows and protected download states for SPADA LMS UPGRIS.

1. EDIT MATERIAL MODAL:
   - Same shell as the upload modal, title "Edit Materi Pembelajaran".
   - Pre-filled title and description; current file chip shown with "Berkas saat ini: Modul-3.pdf (1.2 MB)" and a secondary "Ganti Berkas" link that reveals the dropzone collapsed.
   - Footer: "Batal" + "Simpan Perubahan".

2. DELETE MATERIAL CONFIRMATION:
   - White modal max-width 480px, radius 16px, padding 24px.
   - Soft red circular icon container with trash icon (#DC2626 on #FEE2E2).
   - Title "Hapus Materi Pembelajaran?", body naming the material, amber warning strip "Tindakan ini tidak dapat dibatalkan."
   - Footer: "Batal" + "Ya, Hapus Materi" (#DC2626).

3. PROTECTED DOWNLOAD STATES (inline material row variants):
   - Default: "Unduh Berkas" outline button with download + shield icons, tooltip "Berkas terproteksi — diverifikasi melalui sesi Anda".
   - Downloading: spinner replacing the icon + "Mengunduh… 45%" + thin progress bar.
   - Denied (403): row turns to a red-bordered card with lock icon, title "Akses Unduhan Ditolak", body "Akun Anda tidak terdaftar pada kelas ini, sehingga berkas materi tidak dapat diunduh.", action "Kembali ke Dasbor" (outline).
   - Never show a raw file URL or direct-link icon anywhere.
```

---

### 📊 Fase 5: Generasi Presensi Digital Terkendali & Rekapitulasi Kehadiran

* **Tujuan Fase:** Membangkitkan seluruh antarmuka presensi — kontrol sesi dosen, check-in mahasiswa, koreksi status, dan rekapitulasi/matriks kehadiran.
* **Rincian Jobdesk Designer:**
  1. **Eksekusi Prompt Kartu Presensi Mahasiswa:** 4 state (belum dibuka, aktif, sudah mengisi, ditutup/alpa).
  2. **Eksekusi Prompt Kontrol Sesi Dosen:** 3 state + live attendance list + timer.
  3. **Eksekusi Prompt Tabel Kehadiran & Modal Koreksi:** Tabel per pertemuan dengan filter status dan modal radio-card koreksi.
  4. **Eksekusi Prompt Rekap Kehadiran:** Matriks 16 pertemuan + KPI strip + legenda + banner informatif gatekeeping.
  5. **Eksekusi Prompt Rekap Personal Mahasiswa:** Progress ring + riwayat per pertemuan.
  6. **Verifikasi Aturan Bisnis:** Tombol check-in **tidak boleh** tampak aktif pada state apa pun selain `OPEN`.

#### 💬 Prompt Siap Kirim — Fase 5 (Salin & Kirim ke Google Stitch):

```text
[PROMPT SIAP KIRIM - GOOGLE STITCH FASE 5.1: STUDENT ATTENDANCE CARD (4 STATES)]
Generate four explicit attendance card states for Mahasiswa in SPADA LMS UPGRIS. Render side by side, each labeled.

All cards: white #FFFFFF, border #E2E8F0, radius 12px, padding 20px, equal height.

A) NOT_OPENED: calendar-check header + gray pill "Sesi Belum Dibuka" with lock icon; body "Dosen Pengampu belum membuka sesi presensi untuk pertemuan ini."; DISABLED button "Isi Kehadiran" (bg #E2E8F0, text #94A3B8, lock icon, cursor-not-allowed); helper "Terakhir diperbarui 09:10 WIB".
B) OPEN: green pulsing pill "Sesi Presensi Aktif"; context line "Dibuka 09:15 WIB • Toleransi 15 menit • Ditutup otomatis 09:30 WIB"; primary full-width button "Isi Kehadiran Sekarang"; helper "Sesi ditutup otomatis setelah batas toleransi."
C) CHECKED IN: green check-circle header; HADIR badge; "Tercatat pukul 09:18 WIB" in JetBrains Mono; disabled green-outline button "Kehadiran Sudah Tercatat".
D) CLOSED / ALPA: slate pill "Sesi Ditutup"; red ALPA badge with x-circle; body "Sesi presensi telah ditutup dan Anda tercatat ALPA. Hubungi Dosen Pengampu jika terdapat kekeliruan."; ghost button "Ajukan Koreksi ke Dosen" (informational).

On mobile, all primary buttons are 48px tall to exceed the 44px touch target.
```

```text
[PROMPT SIAP KIRIM - GOOGLE STITCH FASE 5.2: DOSEN SESSION CONTROL & LIVE ATTENDANCE TABLE]
Generate the Dosen attendance session control and per-meeting attendance table for SPADA LMS UPGRIS.

1. ATTENDANCE TABLE CARD:
   - Header "Daftar Kehadiran — Pertemuan 3" + session status badge + right actions "Tutup Sesi" (destructive outline) and "Ekspor" (disabled, tooltip "Tersedia pada MVP 5").
   - Summary strip: Hadir 32 (green) • Sakit 2 (blue) • Izin 1 (amber) • Alpa 3 (red) • Belum Mengisi 0.
   - Filter bar: search (Nama/NIM), status select (Semua, Hadir, Sakit, Izin, Alpa, Belum Mengisi), refresh icon with "Diperbarui otomatis".
   - Table columns: Mahasiswa (avatar + name), NIM (monospace), Status Kehadiran (badge with icon), Waktu Check-in (monospace, "—" if empty), Catatan (truncated), Aksi ("Koreksi" ghost).
   - Footer pagination "Menampilkan 1–10 dari 38 mahasiswa".
   - Empty state: "Belum ada mahasiswa yang mengisi kehadiran. Bagikan sesi aktif kepada kelas Anda."

2. CORRECTION MODAL:
   - White, max-width 520px, radius 16px, padding 24px. Header "Koreksi Status Kehadiran" + subtitle "Ahmad Fauzi • NIM 24670001".
   - Four selectable radio CARDS (not plain radios): HADIR (green check-circle), SAKIT (blue hospital), IZIN (amber file-text), ALPA (red x-circle). Selected card: 2px #2563EB border, #EFF6FF background, check indicator.
   - Textarea "CATATAN KETERANGAN" with placeholder "Contoh: Surat dokter terlampir (No. 421/SK/2026)".
   - Footer "Batal" + "Simpan Koreksi"; footnote "Perubahan akan tercatat pada Jejak Audit SPADA."

3. SESSION CONTROL PANEL:
   - Show the three states (NOT_OPENED with tolerance input, OPEN with live counter and elapsed timer, CLOSED with summary counters) as separate labeled frames.
```

```text
[PROMPT SIAP KIRIM - GOOGLE STITCH FASE 5.3: ATTENDANCE RECAP & 16-MEETING MATRIX (/classes/:classId/attendance-recap)]
Generate the class attendance recap screen for SPADA LMS UPGRIS (Dosen variant).

Header: breadcrumb, title "Rekapitulasi Kehadiran Kelas", subtitle "Pertemuan yang telah diselenggarakan: 12 dari 16", right actions class selector + "Unduh Rekap" (disabled with tooltip "Ekspor tersedia pada MVP 5").

KPI strip (4 cards): "Rata-rata Kehadiran Kelas 86.4%" (monospace), "Mahasiswa ≥ 70%: 34 dari 38" (green), "Mahasiswa < 70%: 4 dari 38" (red), "Sesi Terlaksana 12 / 16".

Attendance matrix table:
- Sticky left: row number, Mahasiswa (avatar + name), NIM (monospace).
- Columns P1…P16 as 32px square cells: HADIR green with white check, SAKIT blue with white cross, IZIN amber with white file icon, ALPA red with white x, BELUM gray outline with dash.
- P8 header uses amber background (#FEF3C7) labeled UTS; P16 header uses maroon (#FFE4E6) labeled UAS.
- Sticky right: "Hadir" count, "% Kehadiran" (monospace, green ≥70 / red <70), status pill "Memenuhi Syarat" / "Belum Memenuhi" (informational only).
- Legend row beneath with five icon+label items.
- Informational blue banner (#E0F2FE): "Ambang batas kehadiran 70% baru akan diberlakukan sebagai syarat akses ujian pada tahap evaluasi UTS/UAS."

Mahasiswa variant: no full matrix — a personal recap card with a 96px progress ring "86%", breakdown "Hadir 10 • Sakit 1 • Izin 0 • Alpa 1", and a per-meeting history list with badges.

Mobile: matrix becomes a per-student list; tapping a student opens a bottom sheet with a 16-meeting badge grid.
```

---

### ✨ Fase 6: Generasi States/Edge Cases, Validasi Responsif, Uji WCAG & Handoff

* **Tujuan Fase:** Melengkapi state batas khusus MVP 2, memverifikasi aksesibilitas penuh, dan mengekspor hasil untuk tim frontend.
* **Rincian Jobdesk Designer:**
  1. **Generasi States Khusus MVP 2:** Empty materi, empty mahasiswa terdaftar, sesi presensi kedaluwarsa, seluruh pertemuan belum diterbitkan, dan sesi ditutup saat check-in berlangsung.
  2. **Audit Aksesibilitas WCAG 2.1 AA:** Kontras badge status, indikator non-warna, focus ring dropzone & akordeon, touch target 44px, dan navigasi keyboard akordeon.
  3. **Uji Responsif:** Desktop 1440px, Tablet 768px (matriks dapat di-scroll horizontal), Mobile 375px (bottom sheet).
  4. **Penyusunan Dokumentasi & Ekspor Handoff:** Struktur React JSX per fitur + kelas Tailwind + daftar state yang harus diimplementasikan.

#### 💬 Prompt Siap Kirim — Fase 6 (Salin & Kirim ke Google Stitch):

```text
[PROMPT SIAP KIRIM - GOOGLE STITCH FASE 6.1: MVP 2 EMPTY, LOADING & RACE-CONDITION STATES]
Generate the edge-case states specific to SPADA LMS UPGRIS MVP 2:

1. EMPTY STATES:
   - No materials: dashed-border panel, document illustration, "Belum Ada Materi untuk Pertemuan Ini", subtext "Dosen Pengampu belum mengunggah materi. Silakan periksa kembali nanti." + "Muat Ulang" ghost button.
   - No students enrolled: users illustration, "Belum Ada Mahasiswa Terdaftar", "Hubungi Administrator untuk mendaftarkan mahasiswa ke kelas ini."
   - No meetings published: calendar illustration, "Belum Ada Pertemuan yang Diterbitkan", "Dosen Pengampu belum mempublikasikan pertemuan."
   - No attendance records: clipboard illustration, "Belum Ada Mahasiswa yang Mengisi Kehadiran. Bagikan sesi aktif kepada kelas Anda."

2. LOADING STATES:
   - Classroom skeleton: header block + 6 shimmering accordion rows.
   - Attendance matrix skeleton: 8 shimmering rows × 16 columns.
   - Session control panel skeleton: pill + 3 shimmering rows.

3. RACE / TIMING STATES:
   - Check-in attempted after close: modal alert amber, title "Sesi Presensi Telah Ditutup", body "Dosen Pengampu menutup sesi sebelum kehadiran Anda tersimpan. Hubungi dosen untuk koreksi manual.", button "Mengerti".
   - Duplicate check-in: green info toast "Kehadiran Anda sudah tercatat pada pertemuan ini." with the existing timestamp.
   - Upload interrupted: red inline alert in the dropzone "Unggahan terputus. Periksa koneksi Anda dan coba lagi." + "Ulangi Unggahan".
   - Material unavailable: inline row state "Berkas tidak ditemukan. Hubungi Dosen Pengampu." with a disabled download.
   - Capacity/ownership denied (403): reuse the Admin/Dosen ownership-denied card: "Anda bukan pengampu kelas ini sehingga tidak dapat mengubah materi."
```

```text
[PROMPT SIAP KIRIM - GOOGLE STITCH FASE 6.2: WCAG 2.1 AA ACCESSIBILITY AUDIT FOR MVP 2]
Perform a comprehensive accessibility audit and refinement pass on all MVP 2 screens for SPADA LMS UPGRIS:

1. CONTRAST: Verify every presence badge passes 4.5:1 text-to-fill contrast: HADIR #16A34A on #DCFCE7, SAKIT #0284C7 on #E0F2FE, IZIN #D97706 on #FEF3C7, ALPA #DC2626 on #FEE2E2. If any fails, switch to #0F172A text while keeping the colored icon. Verify UAS #9F1239 on #FFE4E6 as well.
2. NON-COLOR INDICATORS: Every attendance status, session status, meeting type, and file-validation state must include a distinct ICON and a TEXT label. Matrix cells need tooltips or an accessible label describing the meeting and status.
3. FOCUS VISIBILITY: Add 2px solid #3B82F6 focus rings with 2px offset to accordion headers, dropzone, matrix cells, radio cards, and all icon buttons. Ensure focus is trapped inside modals and restored after close.
4. KEYBOARD: Accordion headers must be operable with Enter/Space and expose aria-expanded. Dropzone must be reachable by Tab and openable by Enter.
5. TOUCH TARGETS: All mobile controls (check-in button, session toggle, matrix cell tap targets) must be at least 44px × 44px.
6. ARIA: Session status pills announce changes via a live region ("Sesi presensi telah dibuka"). Progress rings expose aria-valuenow for the attendance percentage.
```

```text
[PROMPT SIAP KIRIM - GOOGLE STITCH FASE 6.3: CODE & ASSET EXPORT HANDOFF (MVP 2)]
Export clean, production-ready frontend code and asset structures from Google Stitch for SPADA LMS UPGRIS MVP 2:

1. Export semantic HTML5 + Tailwind CSS only — no inline hardcoded styles. Reuse the existing MVP 1 tokens for colors, spacing, and typography.
2. Structure React JSX components to match this frontend architecture:
   - src/components/ui/ (PresenceBadge, SessionStatusPill, MeetingTypeBadge, FileTypeIcon, MeetingNumberBadge, ProgressRing, FileDropzone, AttendanceMatrix)
   - src/features/classroom/ (ClassroomHeader, MeetingAccordion, MeetingAccordionRow, MeetingDetailPanel, ClassListCard)
   - src/features/classroom/materials/ (MaterialList, MaterialListItem, UploadMaterialModal, EditMaterialModal, DeleteMaterialDialog)
   - src/features/classroom/attendance/ (AttendanceCard, AttendanceControlPanel, AttendanceTable, CorrectionModal, AttendanceRecapTable, AttendanceMatrix, PersonalRecapCard)
3. Provide a state mapping table for each component so the frontend team knows exactly which visual state maps to which API condition:
   - session status: NOT_OPENED / OPEN / CLOSED
   - presence: HADIR / SAKIT / IZIN / ALPA / BELUM
   - material: DEFAULT / UPLOADING / SUCCESS / ERROR / RESTRICTED_403
   - meeting: PRA_UTS / UTS / PASCA_UTS / UAS
4. Export the SVG icon set used for presence statuses, file types, and meeting types as a single sprite or individual files.
```

---

## 7. Standar Quality Gates Hasil Generasi Google Stitch (MVP 2)

Setiap layar MVP 2 dinyatakan selesai dan layak serah terima (*Production-Ready*) apabila memenuhi checklist berikut:

- [ ] **Bebas Artefak Non-LMS:** Tidak ada teks, field, menu, atau ikon terkait SIA, PMB, pengajuan/persetujuan KRS, Dosen PA/Wali, KHS, Transkrip, atau UKT.
- [ ] **Kepatuhan 3 Peran Resmi:** Navigasi dan data hanya diperuntukkan bagi Mahasiswa, Dosen, dan Admin. Mahasiswa tidak pernah melihat kontrol pengelolaan materi atau sesi presensi.
- [ ] **Struktur 16 Pertemuan Utuh:** Ruang kelas selalu menampilkan **16 baris pertemuan** tanpa penomoran ulang. P-8 berbadge UTS dan P-16 berbadge UAS dengan warna yang benar.
- [ ] **Tipe Pertemuan Sesuai:** P1–7 *Pembelajaran Pra-UTS* (biru), P8 *UTS* (amber), P9–15 *Pembelajaran Pasca-UTS* (biru), P16 *UAS* (marun).
- [ ] **State Machine Presensi Dipatuhi:**
  - Tombol check-in mahasiswa **hanya aktif** saat status sesi `OPEN`.
  - State `NOT_OPENED` dan `CLOSED` menampilkan tombol *disabled* + ikon gembok + teks penjelas.
  - State sudah check-in tidak menampilkan tombol yang dapat diklik ulang.
  - Keempat status kehadiran (`HADIR`, `SAKIT`, `IZIN`, `ALPA`) selalu disertai ikon + label teks.
- [ ] **Validasi Berkas Tampil Lengkap:** Dropzone memiliki state default, drag-over, format tidak didukung, ukuran melebihi batas, uploading, dan success — dengan **copywriting error persis** sesuai SRS 7.5 (`.pdf, .docx, .xlsx, .zip` & `maks. 10MB`).
- [ ] **Unduhan Terproteksi:** Tidak ada URL berkas publik yang ditampilkan; tersedia indikator shield/lock dan state penolakan 403 yang jelas.
- [ ] **Rekapitulasi Akurat Secara Visual:** Matriks mencakup seluruh 16 kolom pertemuan, kolom P8/P16 dibedakan, serta menampilkan total hadir dan persentase kehadiran. Persentase ditampilkan sebagai informasi, bukan pengunci akses.
- [ ] **Akurasi Tema Permukaan:** Seluruh layar MVP 2 menggunakan Light Clean Surface (#F8FAFC & #FFFFFF). Tidak ada halaman publik baru bergaya Dark Navy.
- [ ] **Responsif Multi-Device:** Tampilan berfungsi dan tertata rapi pada Desktop (1440px), Tablet (768px, matriks dapat di-scroll), dan Smartphone (375px/390px, bottom sheet presensi).
- [ ] **Aksesibilitas WCAG 2.1 AA:** Lolos uji kontras 4.5:1, indikator non-warna pada semua badge, focus ring 2px, target sentuh 44px, dan akordeon dapat dioperasikan dengan keyboard.
- [ ] **Kesiapan Ekspor Frontend:** Struktur semantik, kelas Tailwind CSS, dan tabel pemetaan state dapat disalin langsung oleh tim pengembang frontend tanpa ambiguitas styling.

---

## 8. Keterkaitan dengan Rilis Berikutnya

| Aspek Desain MVP 2 | Dilanjutkan pada | Catatan Keterkaitan |
|---|---|---|
| Akordeon pertemuan & Detail Pertemuan | **MVP 3** | Baris Tugas dan baris Kuis akan ditambahkan ke dalam akordeon yang sama. |
| Panel Materi & Dropzone | **MVP 3** | Dropzone yang sama dipakai ulang untuk unggah jawaban tugas (validasi identik). |
| Persentase kehadiran & kartu rekap | **MVP 5** | Berubah dari *informasi* menjadi *gatekeeper* UTS/UAS ≥ 70% (badge terkunci + tombol ujian disabled). |
| Kartu/label sesi presensi | **MVP 4** | Sesi presensi aktif akan muncul sebagai entri pada Central Timeline dan notifikasi internal. |
| Badge aksi audit baru | **MVP 5** | Dilanjutkan dengan entri penilaian tugas, perubahan skor, dan ekspor data. |

**Dokumen terkait:**
- Prasyarat & fondasi: [DESIGN_INSTRUCTIONS_MVP1_UIUX.md](DESIGN_INSTRUCTIONS_MVP1_UIUX.md)
- Acuan teknis backend: [IMPLEMENTATION_PLAN_MVP2_BACKEND.md](IMPLEMENTATION_PLAN_MVP2_BACKEND.md)
- Token & komponen global: [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md)
