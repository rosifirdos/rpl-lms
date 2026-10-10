# Instruksi Desain UI/UX: MVP 1
# SPADA (Learning Management System) Universitas PGRI Semarang (UPGRIS)
**Team Membangun Negeri — Panduan Perancangan Antarmuka Berbasis Google Stitch (100% Prompt-Driven UI Generation & Handoff)**

---

## 📌 Ringkasan Dokumen
- **Target Deliverable:** Rancangan Desain Antarmuka UI/UX High-Fidelity, Screen Generation, Interaksi Komponen, dan Desain Responsif untuk MVP 1 SPADA LMS UPGRIS yang **100% Dikerjakan di Google Stitch melalui rekayasa prompt (Prompt-Driven Design)** tanpa menggunakan Figma.
- **Acuan Utama:** [PRD.md](PRD.md) (*Bab 2, 3, 5, 7*), [SRS.md](SRS.md) (*Bab 3, 4, 10, 13, 21, 27, 28, 29, 30*), [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md) (Spesifikasi Desain Portal Login & Landing — Dark-Mode Navy, serta Token Operasional Permukaan Terang), dan [IMPLEMENTATION_PLAN_MVP1_BACKEND.md](IMPLEMENTATION_PLAN_MVP1_BACKEND.md).
- **Fokus Rilis MVP 1:** Sistem autentikasi terpadu multi-kredensial, app shell navigasi modular SPADA, dasbor kontekstual 3 peran (Mahasiswa, Dosen, Admin), pengelolaan profil pengguna mandiri, master akun pengguna & RBAC, master mata kuliah & pembukaan kelas, modul *direct enrollment* mahasiswa (aturan bisnis BR-002), serta peninjau jejak audit (*audit trail viewer*).

---

## 1. Tujuan & Metodologi Perancangan (100% Google Stitch Prompt-Driven)

### 1.1 Paradigma Pengerjaan Desain
Pengerjaan desain UI/UX pada proyek ini beralih sepenuhnya ke **Google Stitch**. Seluruh perancangan tidak lagi menggunakan perangkat manual grafis (seperti Figma), melainkan dieksekusi secara terstruktur melalui **Prompt Engineering UI** pada Google Stitch:
1. **Master Context Prompt Injection:** Menetapkan fondasi desain, aturan peran (*3 official roles*), token warna, tipografi, dan spasi 8pt ke dalam konteks proyek Google Stitch.
2. **Screen-by-Screen Structured Prompting:** Membangkitkan (*generating*) setiap layar, dialog modal, data table, dan widget menggunakan prompt terstruktur dengan hierarki layout, komponen, dan status visual yang presisi.
3. **Iterative Refinement via Conversational Prompting:** Melakukan penyesuaian detail (*fine-tuning*), perbaikan spasi, penajaman kontras aksesibilitas, dan tata letak seluler melalui prompt iteratif lanjutan di Google Stitch.
4. **Code & Asset Export Handoff:** Mengekspor hasil generasi antarmuka Google Stitch (struktur layout, kelas Tailwind CSS, komponen React, dan aset SVG) langsung untuk kebutuhan implementasi tim frontend.

### 1.2 Ruang Lingkup Modul MVP 1
Sesuai **SRS Bab 27** dan **PRD Bab 7**, ruang lingkup antarmuka MVP 1 mencakup:
1. **Modul Autentikasi & Sesi:** Login multi-kredensial (Username/NIM/NIDN/Email + Password), penolakan akun non-aktif/suspended, logout aman, dan alur lupa password.
2. **Modul Navigasi & App Shell SPADA:** Topbar informatif SPADA UPGRIS, sidebar navigasi terstruktur sesuai 3 peran pengguna resmi, dan layout responsif.
3. **Modul Dasbor Kontekstual 3 Peran:**
   - **Dasbor Mahasiswa:** Header profil & semester aktif, daftar kartu kelas perkuliahan yang dienroll oleh Admin (nama MK, SKS, nama dosen pengampu, tombol akses kelas), ringkasan aktivitas belajar.
   - **Dasbor Dosen:** Header profil dosen bergelar (NIDN), daftar kartu kelas yang diampu pada semester aktif, ringkasan jumlah mahasiswa terdaftar di tiap kelas.
   - **Dasbor Admin:** Header profil admin, 4 kartu statistik metrik utama sistem (Total Mahasiswa, Total Dosen, Total Mata Kuliah, Total Kelas & Enrollment Aktif), pintasan cepat kelola akun, mata kuliah, kelas, dan enrollment.
4. **Modul Pengelolaan Profil Pengguna Mandiri:** Biodata identitas, unggah/ganti foto profil (avatar maks 2MB), dan penggantian kata sandi mandiri (verifikasi kata sandi lama).
5. **Modul Master Data Akademik SPADA (Khusus Admin):**
   - **Manajemen Akun Pengguna:** Data table pengguna dengan pencarian, filter 3 peran, filter status (`ACTIVE`, `INACTIVE`, `SUSPENDED`), modal tambah/edit akun, dan modal ganti status/reset password.
   - **Master Mata Kuliah:** Data table mata kuliah, modal CRUD mata kuliah (Kode MK, Nama Mata Kuliah, Beban SKS 1–6, Deskripsi Kompetensi).
   - **Pembukaan Kelas Perkuliahan:** Data table penawaran kelas semester aktif, modal buka kelas (pilih Mata Kuliah, pilih Dosen Pengampu, Kode/Nama Kelas, Tahun Akademik, Semester Ganjil/Genap, Kapasitas Kuota).
6. **Modul Direct Enrollment Mahasiswa (Khusus Admin):**
   - Selector kelas perkuliahan aktif.
   - Panel Mahasiswa Terdaftar (*Enrolled Students*) dengan tombol unenroll (pencabutan).
   - Panel Mahasiswa Tersedia (*Available Students*) dengan fitur pencarian cepat dan *multi-select enrollment* (individual maupun batch) langsung ke dalam kelas.
   - Indikator kapasitas kuota terisi vs total daya tampung kelas.
7. **Modul Jejak Audit (Audit Trail Viewer - Khusus Admin):**
   - Data table pencatatan mutasi data (login, pembuatan/perubahan akun user, master data, dan enrollment mahasiswa).
   - Modal inspeksi detail JSON perbandingan nilai lama dan nilai baru (*Old Values vs New Values*).

### 1.3 Batasan Rilis (Out of Scope untuk MVP 1)
Fitur-fitur berikut **tidak** dimasukkan ke dalam pengerjaan desain MVP 1:
- Ruang kelas 16 pertemuan, distribusi materi pembelajaran, dan presensi digital (dialokasikan ke **MVP 2**).
- Modul tugas, validasi berkas keamanan (.pdf/.docx/.xlsx/.zip & 5MB–10MB), pengumpulan jawaban, dan penilaian skor SPADA 0–100 (dialokasikan ke **MVP 3**).
- Central Timeline kronologis, kuis interaktif, dan notifikasi internal (dialokasikan ke **MVP 4**).
- Evaluasi ujian (UTS P-8 & UAS P-16), gatekeeping kehadiran $\ge 70\%$, rekapitulasi nilai akhir kelas, dan ekspor data (dialokasikan ke **MVP 5**).
- **Modul yang Dihapus Selamanya (BR-001 & BR-002):** Sistem Informasi Akademik (SIA), Penerimaan Mahasiswa Baru (PMB), pengisian dan persetujuan KRS oleh Dosen Wali/PA, Kartu Hasil Studi (KHS), Transkrip Kumulatif, Sidang Skripsi, dan pembayaran UKT/Finansial.

---

## 2. Analisis Pengguna & Karakteristik Aktor (3 Persona Resmi)

Antarmuka SPADA LMS UPGRIS dirancang secara presisi untuk 3 aktor resmi (*SRS Bab 3 & PRD Bab 3*):

| Peran (Role) | Karakteristik Pengguna | Kebutuhan Utama pada MVP 1 | Prioritas Visual di Google Stitch |
|---|---|---|---|
| **Mahasiswa** | Peserta didik aktif sarjana/diploma di lingkungan UPGRIS | Masuk sistem dengan NIM/Email, memantau profil diri, melihat daftar kelas yang dienroll oleh Admin, dan bersiap mengikuti perkuliahan | Antarmuka bersih, ramah seluler (*mobile-friendly*), kontras tinggi, kartu kelas yang jelas dan mudah diakses |
| **Dosen** | Tenaga pendidik / pengampu perkuliahan bergelar akademik | Masuk sistem dengan NIDN/Email, memantau kelas-kelas yang diampu pada semester berjalan, dan memantau daftar mahasiswa terdaftar | Tampilan ringkas, jadwal kelas yang mudah dipindai, kartu kelas informatif dengan jumlah mahasiswa |
| **Admin** *(Role Tunggal)* | Pengelola teknis, data akademik, dan kepesertaan SPADA LMS | Mengelola akun user (3 role), mengelola master mata kuliah dan kelas, mendaftarkan mahasiswa ke kelas (*direct enrollment*), dan memantau jejak audit | Kerapian tabel data, efisiensi form modal, filter data cepat, kejelasan kuota kelas, inspeksi JSON audit log |

---

## 3. Fondasi Design System (Design Tokens untuk Injeksi Prompt Stitch)

Setiap prompt yang dimasukkan ke Google Stitch **wajib** menyertakan atau merujuk token desain dari [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md) dengan arsitektur dua mode permukaan:

### 3.1 Palet Warna (Color Palette)

#### 3.1.A Palet Portal Login & Landing (Dark-Mode Professional Navy)
Eksklusif digunakan pada halaman gerbang autentikasi (`/login`, `/forgot-password`).
```text
Primary Background:   Gradient Deep Navy #0D1B2A to #1B2A4A
Primary Accent:       Royal / Electric Blue #3B82F6 / #4F46E5 (Tombol aksi utama, SSO)
Secondary Accent:     Cyan / Aqua Blue #38BDF8 / #06B6D4 (Highlight teks & garis aktif)
Status & Security:    Emerald Green #10B981 (Badge Portal Resmi SPADA, SSL Terenkripsi, FAB)
Card Background:      Solid White #FFFFFF (Kontainer form login mengapung)
Text Primary:         Dark Slate #1F2937 (Judul kartu & label input)
Text Muted:           Neutral Muted Gray #6B7280 / #9CA3AF (Placeholder, footer)
```

#### 3.1.B Palet Operasional SPADA LMS (Light Clean Surface)
Digunakan pada seluruh halaman terotentikasi (Dasbor 3 Aktor, Profil, Master Data, Direct Enrollment, Audit Trail).
```text
Brand Primary:        Primary 900 #0F172A (Deep Slate), Primary 600 #2563EB (Active Interactive), Primary 500 #3B82F6 (Focus Ring)
Surfaces:             Surface 0 #FFFFFF (Card, Modal), Surface 50 #F8FAFC (Page Background)
Borders:              Border Subtlest #E2E8F0 (Table/Cards), Border Focused #CBD5E1 (Inputs)
Text:                 Text Primary #0F172A, Text Secondary #475569, Text Tertiary #94A3B8
Status Badges:        Active/Success #16A34A (Fill: #DCFCE7), Inactive #475569 (Fill: #F1F5F9), Suspended #7C3AED (Fill: #EDE9FE), Warning #D97706 (Fill: #FEF3C7)
```

### 3.2 Tipografi & Spatial Grid
- **Font Utama:** `Plus Jakarta Sans` / `Inter` (UI umum); `JetBrains Mono` (NIM, NIDN, Kode MK, JSON).
- **Spatial Grid:** Sistem spasi 8pt (`4px, 8px, 12px, 16px, 24px, 32px, 48px, 64px`).
- **Breakpoint Generasi:** Desktop (`1440px`), Tablet (`768px`), Mobile (`375px–390px`).

---

## 4. Master Context Prompt (System Prompt untuk Google Stitch)

Sebelum memulai pembuatan layar di Google Stitch, daftarkan **Master System Prompt** berikut ke dalam project environment Google Stitch:

```text
[GOOGLE STITCH SYSTEM PROMPT: SPADA LMS UPGRIS MVP 1]
You are a senior UI/UX Designer and Frontend Specialist generating production-grade web interfaces for "SPADA (Learning Management System) Universitas PGRI Semarang (UPGRIS) - Team Membangun Negeri".

CRITICAL ARCHITECTURE RULES:
1. ONLY 3 official roles exist: "Mahasiswa", "Dosen", and "Admin" (Single Admin Role). NEVER create, reference, or display Super Admin, Admin Akademik, Admin LMS, or Dosen Wali/PA.
2. ALL administrative modules outside LMS are strictly eliminated: NO SIA, NO PMB, NO KRS drafting/approvals by Dosen PA, NO KHS, NO Transkrip, NO Skripsi defense, NO UKT payments.
3. Class Enrollment strictly follows Business Rule BR-002: Direct enrollment managed exclusively by Admin (individually or batch), without student KRS or academic advisor approvals.
4. Two visual surface modes must be strictly respected:
   - Portal Login Gateway (/login, /forgot-password): Dark-Mode Professional Navy gradient (#0D1B2A to #1B2A4A), electric blue accents (#3B82F6/#4F46E5), cyan highlights (#38BDF8), emerald security badges (#10B981), and a floating solid white card (#FFFFFF, radius 16px, soft shadow).
   - Operational App (Dashboards, Shell, Tables, Direct Enrollment): Light Clean Surface (#F8FAFC page background, #FFFFFF cards, #0F172A slate text, #2563EB primary blue).
5. Accessibility: WCAG 2.1 AA compliant, 4.5:1 text contrast ratio, clear icon+label pairings, visible focus rings (2px blue), 44x44px mobile touch targets, and 8pt grid spacing.
```

---

## 5. Rincian Template Prompt Layar demi Layar (Screen-by-Screen Stitch Prompts)

### 5.1 Modul Autentikasi (Dark-Mode Professional Navy)

#### Layar 1: Halaman Login Portal (`/login`)
**Template Prompt Google Stitch:**
```text
Generate a modern, high-contrast, responsive Portal Login page for "SPADA LMS UPGRIS" (Universitas PGRI Semarang) on desktop (1440px) and mobile (375px).

SURFACE & PALETTE:
- Background: Gradient Dark Navy from #0D1B2A (top) to #1B2A4A (bottom).
- Layout: 2-column desktop layout with a top portal navbar and floating login card on the right.

NAVBAR (TOP):
- Left: University branding emblem + "SPADA UPGRIS" title + subtitle "Portal Pembelajaran Digital & Inovasi Belajar".
- Center: Search bar with placeholder "Cari mata kuliah atau panduan SPADA..." with magnifying glass icon.
- Right: Navigation links (Beranda, Fitur, Panduan, Kontak, FAQ) and a pill-shaped button "MASUK SSO" (#3B82F6).

LEFT COLUMN (HERO & HIGHLIGHTS):
- H1: "Membangun Negeri Melalui SPADA LMS UPGRIS" (Pure White #FFFFFF with Cyan #38BDF8 highlight on SPADA LMS).
- Subtitle badge: Cyan pill badge "LEARNING MANAGEMENT SYSTEM — UNIVERSITAS PGRI SEMARANG".
- Description paragraph: Concise welcoming text regarding unified online learning.
- 3 Stat Metric Blocks:
  1) "16 Pertemuan" - Silabus Terstruktur (UTS P-8 & UAS P-16)
  2) "0–100 Skor" - Standar Penilaian Numerik SPADA Transparan
  3) "24/7 Akses" - Central Timeline & Materi Pembelajaran
- Bottom Badge Container: 4 horizontal badges with icons:
  1) 🛡️ Validasi Berkas (.pdf, .docx, .xlsx, .zip maks 10MB)
  2) 📅 Central Timeline (Waktu Server Nyata)
  3) ⏱️ Presensi Digital (Terkendali Buka/Tutup)
  4) 🎓 Direct Enrollment (Pendaftaran Kelas Terpusat)

RIGHT COLUMN (FLOATING LOGIN CARD):
- Card: Solid White background (#FFFFFF), border radius 16px, soft elevation drop shadow (rgba(15, 23, 42, 0.25)).
- Card Header: "Masuk ke SPADA LMS" / "Single Sign On" in dark slate (#1F2937, 24px bold).
- Security Badges: Emerald Green (#10B981) badges with checkmark: "Portal Resmi SPADA" and "SSL Terenkripsi".
- Form Fields:
  1) Identity Input: Label "IDENTITAS PENGGUNA (NIM / NIDN / EMAIL)", left User icon, placeholder "NIM, NIDN, atau Email terdaftar".
  2) Password Input: Label "KATA SANDI", left Lock icon, right toggle Eye icon, placeholder "••••••••••••".
- Checkbox & Links: Checkbox "Ingat sesi saya" on left, link "Lupa kata sandi?" on right (#2563EB).
- Action Button: Full-width button "Masuk Sekarang" with gradient #3B82F6 to #4F46E5, white text, radius 8px, right arrow icon (→).
- Card Footer: Microtext helpdesk info "Kendala login? Hubungi Helpdesk IT Kampus".

FLOATING ACTION BUTTON (FAB):
- Bottom-right corner floating button, Emerald Green (#10B981), support icon, text "PUSAT BANTUAN SPADA / HELP CENTER".
```

#### Layar 2: Halaman Lupa Password (`/forgot-password`)
**Template Prompt Google Stitch:**
```text
Generate a clean, centered Password Recovery page for "SPADA LMS UPGRIS".
- Background: Gradient Deep Navy #0D1B2A to #1B2A4A.
- Layout: Centered solid white card (#FFFFFF, max-width 480px, border-radius 16px, soft shadow).
- Card Elements:
  - Top: Circular soft blue icon container with lock icon (#3B82F6).
  - Title: "Pemulihan Kata Sandi" (Dark Slate #1F2937, 22px bold).
  - Instruction: "Masukkan email terdaftar Anda. Kami akan mengirimkan tautan untuk mengatur ulang kata sandi akun SPADA Anda."
  - Input: Email with Mail icon prefix.
  - Primary Button: "Kirim Tautan Pemulihan" (#2563EB).
  - Footer link: "← Kembali ke Halaman Masuk" linking to /login.
```

---

### 5.2 App Shell & Dasbor Kontekstual 3 Peran (Light Clean Surface)

#### Layar 3: App Shell Global (Topbar & Sidebar Modular)
**Template Prompt Google Stitch:**
```text
Generate the core application shell for SPADA LMS UPGRIS on desktop (1440px) with Light Clean Surface theme.
- Main Background: Light Slate #F8FAFC.

TOPBAR (STICKY, 64PX):
- Surface: Solid White #FFFFFF, bottom border #E2E8F0.
- Left: Sidebar toggle icon + Campus logo emblem + "SPADA UPGRIS" text + Green pill badge "🟢 Semester Ganjil 2026/2027".
- Right: Notification bell icon + User menu (Avatar circular 40px, User Full Name, Role badge pill [MAHASISWA / DOSEN / ADMIN], dropdown caret).
- Dropdown menu options: "Profil Saya", "Ganti Kata Sandi", divider line, "Keluar" (Crimson red #DC2626).

SIDEBAR (WIDTH 260PX):
- Surface: Solid White #FFFFFF, right border #E2E8F0.
- Top: SPADA logo + "Team Membangun Negeri" sublabel.
- Dynamic Nav Menu (generate 3 variant visual previews for roles):
  1) Role Mahasiswa: [Dasbor, Kelas Saya, Panduan Belajar].
  2) Role Dosen: [Dasbor, Kelas Diampu, Panduan Dosen].
  3) Role Admin: [Dasbor, Manajemen Pengguna, Master Mata Kuliah, Pembukaan Kelas, Direct Enrollment, Jejak Audit].
- Active item indicator: #EFF6FF light blue background, #2563EB blue text and left vertical bar accent.
```

#### Layar 4A: Dasbor Mahasiswa
**Template Prompt Google Stitch:**
```text
Generate the Mahasiswa Dashboard screen inside the App Shell for SPADA LMS UPGRIS.
- Greeting Banner: "Selamat Datang, Ahmad Fauzi! (NIM: 24670001)" with current academic date.
- Summary Cards (Row of 3): Program Studi ("S1 Teknik Informatika"), Angkatan ("2024"), Status Akun ("AKTIF" - green badge).
- Enrolled Classes Grid (Title: "Kelas Perkuliahan Semester Ini"):
  - Grid of interactive cards representing classes enrolled by Admin:
    - Card 1: Badge "TI-A • 3 SKS" (Blue), Title "Rekayasa Perangkat Lunak", Lecturer "Dr. Awan Rosi, M.Kom.", Status "16 Pertemuan Terstruktur", Button "Buka Ruang Kelas →" (#2563EB).
    - Card 2: Badge "TI-B • 3 SKS", Title "Pemrograman Web Lanjut", Lecturer "Ir. Siti Aminah, M.T.", Status "16 Pertemuan Terstruktur", Button "Buka Ruang Kelas →".
    - Card 3: Badge "TI-A • 2 SKS", Title "Basis Data Terdistribusi", Lecturer "Budi Santoso, M.Cs.", Status "16 Pertemuan Terstruktur", Button "Buka Ruang Kelas →".
- Info Banner: Blue informative banner announcing operational schedule and timeline reminders.
```

#### Layar 4B: Dasbor Dosen
**Template Prompt Google Stitch:**
```text
Generate the Dosen Dashboard screen for SPADA LMS UPGRIS.
- Greeting: "Selamat Datang, Dr. Awan Rosi, M.Kom. (NIDN: 0612345601)".
- 3 Teaching Metric Cards:
  1) Total Kelas Diampu ("3 Kelas Aktif") with chalkboard icon.
  2) Beban SKS Semester Ini ("8 SKS") with award icon.
  3) Total Mahasiswa Terdaftar ("118 Mahasiswa") with users icon.
- Teaching Classes List (Tabel / Card List):
  - Columns: Kode Kelas, Mata Kuliah, SKS, Mahasiswa Terdaftar (e.g. 40/40 Kuota - Full, 38/40 Kuota), Akses Kelas button.
```

#### Layar 4C: Dasbor Admin
**Template Prompt Google Stitch:**
```text
Generate the Admin Dashboard screen for SPADA LMS UPGRIS.
- Header: "Dasbor Administrator SPADA LMS".
- 4 Primary Metric Cards (Grid 4 columns):
  1) Total Pengguna: "1,420" (Mahasiswa: 1,350 | Dosen: 70) with user icon.
  2) Total Mata Kuliah: "48 Mata Kuliah Aktif" with book-open icon.
  3) Kelas Perkuliahan: "36 Kelas Dibuka Semester Ini" with layout icon.
  4) Total Enrollment: "1,280 Kepesertaan Aktif" with user-check icon.
- Quick Operational Shortcuts (Grid of 4 action cards):
  - "Tambah Pengguna Baru", "Buka Kelas Baru", "Kelola Direct Enrollment", "Lihat Jejak Audit".
- Recent Activity Snapshot:
  - Table of last 5 audit entries (Timestamp, Actor, Action Badge, Target Entity, Detail).
```

---

### 5.3 Modul Master Data, Direct Enrollment & Audit (Khusus Admin)

#### Layar 5: Manajemen Pengguna (`/admin/users`)
**Template Prompt Google Stitch:**
```text
Generate the User Management screen for Admin in SPADA LMS UPGRIS.
- Filter Bar: Search input (Name, NIM, NIDN, Email) + Role Filter Dropdown (All, Mahasiswa, Dosen, Admin) + Status Filter Dropdown (All, Active, Inactive, Suspended) + Button "Tambah Pengguna Baru" (+ icon, #2563EB).
- Data Table:
  - Headers: Pengguna (Avatar + Nama Lengkap), Identitas Resmi (NIM/NIDN/Username monospace), Email, Role (Badge), Status (Badge: ACTIVE green, INACTIVE gray, SUSPENDED purple), Terakhir Login, Aksi (Edit, Status, Reset Password).
- Pagination Bar: "Menampilkan 1-10 dari 1,420 pengguna", rows per page (10, 25, 50), page navigation.
- Add User Modal Dialog:
  - Form: Role selector, dynamic fields based on role (NIM/Prodi/Angkatan for Mahasiswa; NIDN/Gelar for Dosen), Username, Full Name, Email, Password.
```

#### Layar 6: Master Mata Kuliah (`/admin/courses`) & Pembukaan Kelas (`/admin/classes`)
**Template Prompt Google Stitch:**
```text
Generate the Master Courses and Class Opening screens for Admin in SPADA LMS UPGRIS.
SCREEN A (MATA KULIAH):
- Data Table: Kode MK (monospace e.g. TIF101), Nama Mata Kuliah, Beban SKS (badge 1-6), Deskripsi Singkat, Status, Actions (Edit, Hapus).
- Modal CRUD Mata Kuliah: Input Kode MK, Nama MK, Number Input SKS (min 1 max 6), Textarea Deskripsi.

SCREEN B (PEMBUKAAN KELAS):
- Data Table: Kode/Nama Kelas ("TI-A"), Mata Kuliah, Dosen Pengampu Utama, Semester ("Ganjil 2026/2027"), Kapasitas Kuota, Jumlah Mahasiswa Terdaftar (e.g. 38/40 with progress bar), Actions ("Kelola Enrollment" primary button, Edit, Hapus).
- Modal Buka Kelas Baru: Combobox Pilih Mata Kuliah, Combobox Pilih Dosen Pengampu, Input Nama Kelas (e.g. "TI-A"), Input Tahun Akademik, Radio Semester (Ganjil/Genap), Number Input Kuota (e.g. 40).
```

#### Layar 7: Direct Enrollment Mahasiswa (`/admin/enrollments` — BR-002)
**Template Prompt Google Stitch:**
```text
Generate the Direct Enrollment Management screen for Admin in SPADA LMS UPGRIS based on Business Rule BR-002 (Direct Admin Assignment without KRS).

TOP BAR / CLASS SELECTOR:
- Dropdown selector for active class: e.g. "TI-A • Rekayasa Perangkat Lunak (Dosen: Dr. Awan Rosi, M.Kom.)".
- Capacity Progress Widget: Visual meter showing "Terisi: 28 / Kuota: 40 Mahasiswa (Sisa 12 Kursi)" with a smooth progress bar.

TWO-COLUMN SPLIT VIEW LAYOUT:
LEFT PANEL - ENROLLED STUDENTS (MAHASISWA TERDAFTAR):
- Header: "Mahasiswa Terdaftar di Kelas" with count badge "28 Mahasiswa".
- Search input to filter enrolled students.
- Table: NIM (monospace), Nama Lengkap, Program Studi, Tanggal Terdaftar, Action button "Unenroll" (Red outline #DC2626).
- Confirmation Modal preview: "Apakah Anda yakin mencabut kepesertaan [Nama Mahasiswa] dari kelas ini?".

RIGHT PANEL - AVAILABLE STUDENTS (MAHASISWA TERSEDIA UNTUK DIENROLL):
- Header: "Daftar Mahasiswa Tersedia".
- Search & Filter bar: Search NIM/Nama + Filter Prodi/Angkatan.
- Table with Multi-Select Checkboxes: Select All checkbox, NIM, Nama Lengkap, Prodi, Angkatan.
- Bottom Action Sticky Bar: "Terpilih: 5 Mahasiswa", Primary Button "Daftarkan Mahasiswa Terpilih (Batch Enroll)" (#2563EB).
- Capacity Warning state: Banner warning if selected count > remaining class capacity.
```

#### Layar 8: Peninjau Jejak Audit (`/admin/audit-logs`) & Modal JSON Diff
**Template Prompt Google Stitch:**
```text
Generate the Audit Trail Viewer screen for Admin in SPADA LMS UPGRIS.
- Filter Bar: Date Range Picker, Action Filter (LOGIN, LOGOUT, CREATE, UPDATE, DELETE, ENROLL, UNENROLL), Entity Filter (User, Course, Class, Enrollment), Search Actor.
- Audit Log Table:
  - Columns: Timestamp (Server format), Aktor (Nama & Username), Aksi (Color-coded badge), Entitas & ID, IP Address & User Agent, Tombol "Lihat Detail JSON".
- JSON Diff Inspector Modal Dialog:
  - Modal title: "Inspeksi Perubahan Data: [Aksi] pada [Entitas]".
  - Side-by-side comparison view:
    - Left column: "Old Values (Nilai Lama)" in light red background with syntax highlighted JSON.
    - Right column: "New Values (Nilai Baru)" in light green background with syntax highlighted JSON.
```

---

## 6. Jobdesk Rinci & Prompt Siap Kirim pada Tiap Fase Pengerjaan (6 Fase Google Stitch)

Berikut adalah pembagian tugas dan rincian pekerjaan (*detailed jobdesk*) UI/UX Designer beserta **Prompt Siap Kirim (Ready-to-Send Prompts)** untuk setiap fase yang 100% dieksekusi melalui Google Stitch:

```text
Alur Eksekusi 6 Fase Desain UI/UX SPADA LMS via Google Stitch:
┌────────────────────────────────────────────────────────────────────────┐
│ Fase 1: Setup Proyek Google Stitch, Master Context & Sitemap SPADA     │
└───────────────────────────────────┬────────────────────────────────────┘
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│ Fase 2: Generasi Design System Tokens & UI Kit Primitives via Prompt   │
└───────────────────────────────────┬────────────────────────────────────┘
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│ Fase 3: Generasi Halaman Autentikasi (Dark Navy), Shell & Profil       │
└───────────────────────────────────┬────────────────────────────────────┘
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│ Fase 4: Generasi Dasbor Kontekstual 3 Peran (Mahasiswa, Dosen, Admin)  │
└───────────────────────────────────┬────────────────────────────────────┘
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│ Fase 5: Generasi Master Data, Direct Enrollment (Split-View) & Audit   │
└───────────────────────────────────┬────────────────────────────────────┘
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│ Fase 6: Generasi States/Edge Cases, Uji WCAG & Handoff Hasil Stitch    │
└────────────────────────────────────────────────────────────────────────┘
```

---

### 🗺️ Fase 1: Setup Proyek Google Stitch, Master Context & Sitemap SPADA

* **Tujuan Fase:** Mempersiapkan workspace Google Stitch, mengonfigurasi system rules, membuang artefak lama, dan memetakan arsitektur informasi SPADA LMS MVP 1.
* **Rincian Jobdesk Designer:**
  1. **Konfigurasi Workspace Google Stitch:**
     - Membuat project baru di Google Stitch: `SPADA-LMS-UPGRIS-MVP1`.
     - Menginjeksi **Master Context Prompt** ke dalam project setting Stitch untuk menjamin seluruh generasi prompt mematuhi 3 peran resmi dan aturan isolasi SPADA.
  2. **Eliminasi Artefak Warisan Non-LMS:**
     - Menghapus dan memblokir seluruh kata kunci non-LMS dari kamus prompt Stitch (SIA, PMB, Dosen Wali, persetujuan KRS, KHS, Transkrip, Skripsi, UKT).
  3. **Penyusunan Sitemap & Routing Prompt:**
     - Merumuskan sitemap teks untuk Google Stitch:
       - Public Gateway: `/login`, `/forgot-password`.
       - Authenticated Core: `/dashboard`, `/profile`, `/classes`.
       - Admin Management: `/admin/users`, `/admin/courses`, `/admin/classes`, `/admin/enrollments`, `/admin/audit-logs`.
  4. **Stitch Exploratory Prompting:**
     - Menguji generasi wireframe awal tata letak 2-kolom landing portal dan App Shell untuk memastikan Stitch memahami hierarki visual yang diminta.

#### 💬 Prompt Siap Kirim — Fase 1 (Salin & Kirim ke Google Stitch):

```text
[PROMPT SIAP KIRIM - GOOGLE STITCH FASE 1.1: PROJECT INITIALIZATION & SYSTEM RULES]
Initialize a new enterprise web project in Google Stitch titled "SPADA (Learning Management System) Universitas PGRI Semarang (UPGRIS) - Team Membangun Negeri".

Set the global design system context with the following strict constraints:
1. ACTOR ROLES: There are strictly ONLY THREE user roles: "Mahasiswa", "Dosen", and "Admin" (Single Administrator). Completely disallow and eliminate any legacy references to Super Admin, Admin Akademik, Admin LMS, or Dosen Wali/PA.
2. SCOPE SPECIALIZATION: Pure standalone LMS. Exclude all administrative non-LMS systems forever: NO SIA, NO PMB, NO KRS drafting/approvals, NO KHS, NO Transkrip, NO Skripsi, NO UKT payments.
3. CLASS ENROLLMENT: Governed by Business Rule BR-002: Direct enrollment performed exclusively by Admin (individually or batch). Students do not draft KRS.
4. TWO VISUAL THEME MODES:
   - Portal Gateway (/login, /forgot-password): Dark-Mode Professional Navy gradient (#0D1B2A to #1B2A4A), electric blue (#3B82F6), cyan (#38BDF8), emerald (#10B981), floating white card (#FFFFFF).
   - Operational LMS (Dashboards, Tables, Shell, Enrollment): Light Clean Surface (#F8FAFC page, #FFFFFF cards, #0F172A slate text, #2563EB primary blue).
5. DESIGN TOKENS: Typography Plus Jakarta Sans / Inter, JetBrains Mono for codes/IDs, 8pt spacing system, and WCAG 2.1 AA contrast compliance.

Acknowledge these project settings and prepare the foundational design tokens.
```

```text
[PROMPT SIAP KIRIM - GOOGLE STITCH FASE 1.2: SITEMAP & LO-FI ARCHITECTURE OVERVIEW]
Generate an interactive visual Sitemap and Low-Fidelity Navigation Tree diagram for SPADA LMS UPGRIS MVP 1.
Display the clean separation of routes:
1. Public Portal Zone (Dark Navy):
   - /login (Multi-credential SSO Login + Highlights)
   - /forgot-password (Account Recovery)
2. Authenticated App Shell (Light Clean Surface):
   - /dashboard (Contextual for Mahasiswa, Dosen, and Admin)
   - /profile (Tab 1: Biodata & Avatar Upload; Tab 2: Security & Password)
   - /classes (Enrolled Classes for Mahasiswa / Taught Classes for Dosen)
3. Administrator Control Center:
   - /admin/users (User Accounts Management & RBAC)
   - /admin/courses (Master Courses SKS 1-6)
   - /admin/classes (Class Offerings & Opening)
   - /admin/enrollments (Direct Enrollment Two-Panel Split View)
   - /admin/audit-logs (Audit Trail & JSON Diff Inspector)

Render this sitemap as a clean, structured UI flowchart with role access badges tagged to each node.
```

---

### 🎨 Fase 2: Generasi Design System Tokens & UI Kit Primitives via Prompt

* **Tujuan Fase:** Membangkitkan seluruh komponen dasar (*UI Primitives*) di Google Stitch menggunakan rekayasa prompt berbasis [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md).
* **Rincian Jobdesk Designer:**
  1. **Prompting Color Tokens & Theme Surfaces:**
     - Menginstruksikan Stitch untuk membentuk dua tema kontras (Dark Navy & Light Surface).
  2. **Prompting Komponen Atomik (Atoms):**
     - Menerbitkan prompt untuk tombol: Primary Blue, Primary Portal Gradient, Outline, Destructive Red (#DC2626), Ghost, dan Icon buttons beserta varian (*Default, Hover, Active, Focus Ring 2px, Disabled, Loading Spinner*).
     - Menerbitkan prompt untuk form inputs: Text input, Password input dengan icon mata toggle, Select dropdown, Custom Checkbox dengan centang putih.
     - Menerbitkan prompt untuk badges: Status pill (`ACTIVE`, `INACTIVE`, `SUSPENDED`), Role pill (`MAHASISWA`, `DOSEN`, `ADMIN`), dan Security badges (`Portal Resmi SPADA`, `SSL Terenkripsi`).
  3. **Prompting Komponen Molekul (Molecules):**
     - Menerbitkan prompt untuk Stat Metric Card, Search & Filter Bar terintegrasi, Pagination Bar, User Avatar dengan inisial fallback, dan Toast Notification (Success, Error, Warning, Info).

#### 💬 Prompt Siap Kirim — Fase 2 (Salin & Kirim ke Google Stitch):

```text
[PROMPT SIAP KIRIM - GOOGLE STITCH FASE 2.1: UI KIT PRIMITIVES (ATOMS)]
Generate a comprehensive UI Kit Component Showcase in Google Stitch containing atomic UI elements for SPADA LMS UPGRIS:

1. BUTTONS:
   - Primary Operational: Royal Blue #2563EB, white text, 8px radius, hover #1E3A8A.
   - Primary Portal: Full-width, gradient #3B82F6 to #4F46E5, white text, right arrow icon (→).
   - Secondary / Outline: Border #CBD5E1, text #0F172A, hover #F8FAFC.
   - Destructive: Crimson Red #DC2626, white text (for unenroll & delete).
   - Ghost / Icon: Transparent, hover #F1F5F9.
   - Generate all interactive states: Default, Hover, Focused (2px blue ring), Active, Disabled, Loading (16px spinner).

2. FORM INPUTS:
   - Text Input: Top label, placeholder #9CA3AF, border #CBD5E1, rounded 6px, left icon support.
   - Password Input: Left lock icon, right toggle eye icon (show/hide), masked dot styling.
   - Select Dropdown: Custom chevron down icon, clean popover list.
   - Checkbox: Custom rounded checkbox, royal blue background on check with crisp white tick.

3. STATUS PILLS & BADGES:
   - Account Status: ACTIVE (green #16A34A, bg #DCFCE7), INACTIVE (gray #475569, bg #F1F5F9), SUSPENDED (purple #7C3AED, bg #EDE9FE).
   - Role Badges: MAHASISWA (light blue), DOSEN (indigo), ADMIN (slate dark).
   - Security Badges: "Portal Resmi SPADA" & "SSL Terenkripsi" (emerald green #10B981, white text).

Render these components side-by-side in a design system catalog view with state labels.
```

```text
[PROMPT SIAP KIRIM - GOOGLE STITCH FASE 2.2: MOLECULAR COMPONENTS (MOLECULES)]
Generate the molecular component library in Google Stitch for SPADA LMS UPGRIS:

1. STAT METRIC CARD:
   - Background #FFFFFF, border #E2E8F0, rounded 12px, padding 20px.
   - Top: Circular colored icon badge (40px) + metric title in #64748B.
   - Middle: Large bold number (28px #0F172A).
   - Bottom: Short explanatory label or growth badge.

2. SEARCH & FILTER BAR:
   - Unified horizontal container: Full search input with magnifying glass + Role dropdown + Status dropdown + Reset Filter button.

3. PAGINATION BAR:
   - Left: Text "Menampilkan 1-10 dari 45 data" in #64748B.
   - Center: Rows per page selector (10, 25, 50).
   - Right: Page navigation buttons (Previous, 1, 2, 3, Next) with active page highlighted in blue #2563EB.

4. TOAST NOTIFICATIONS (TOP-RIGHT FLOATING):
   - Success (Green border/icon, "Aksi berhasil disimpan"), Error (Red border/icon, "Terjadi kesalahan"), Warning (Amber), Info (Blue).
```

---

### 🔐 Fase 3: Generasi Halaman Autentikasi (Dark Navy), Shell & Profil via Stitch

* **Tujuan Fase:** Membangkitkan halaman publik gerbang masuk sistem, kerangka navigasi aplikasi (*App Shell*), dan modul profil mandiri secara high-fidelity di Google Stitch.
* **Rincian Jobdesk Designer:**
  1. **Eksekusi Prompt Halaman Login Portal (`/login`):** Menjalankan prompt login 2-kolom, verifikasi floating card putih solid di atas navy, teks hero tajam, dan FAB help center.
  2. **Eksekusi Prompt Halaman Lupa Password (`/forgot-password`):** Menjalankan prompt pemulihan akun dengan centered card.
  3. **Eksekusi Prompt App Shell Terpadu:** Membangkitkan Topbar (status semester aktif) dan Sidebar dinamis (3 peran resmi).
  4. **Eksekusi Prompt Profil Pengguna Mandiri (`/profile`):** Membangkitkan Tab 1 Biodata + Avatar uploader (2MB) dan Tab 2 Ganti Password dengan Strength Meter.

#### 💬 Prompt Siap Kirim — Fase 3 (Salin & Kirim ke Google Stitch):

```text
[PROMPT SIAP KIRIM - GOOGLE STITCH FASE 3.1: PORTAL LOGIN PAGE (/login)]
Generate a high-fidelity, production-ready Portal Login page for "SPADA LMS UPGRIS" (Universitas PGRI Semarang) on Desktop (1440px):

SURFACE & PALETTE:
- Background: Gradient Dark Navy from #0D1B2A (top) to #1B2A4A (bottom).
- Layout: 2-column desktop layout with sticky top portal navbar.

NAVBAR (TOP):
- Left: University emblem + "SPADA UPGRIS" + subtitle "Portal Pembelajaran Digital & Inovasi Belajar".
- Center: Search bar with placeholder "Cari mata kuliah atau panduan SPADA..." and search icon.
- Right: Nav links (Beranda, Fitur, Panduan, Kontak, FAQ) + pill button "MASUK SSO" (#3B82F6).

LEFT COLUMN (HERO & HIGHLIGHTS):
- H1: "Membangun Negeri Melalui SPADA LMS UPGRIS" (Pure White #FFFFFF with Cyan #38BDF8 on SPADA LMS).
- Subtitle badge: Cyan pill "LEARNING MANAGEMENT SYSTEM — UNIVERSITAS PGRI SEMARANG".
- Welcoming paragraph explaining unified digital learning at UPGRIS.
- 3 Stat Metric Blocks:
  1) "16 Pertemuan" - Silabus Terstruktur (UTS P-8 & UAS P-16)
  2) "0–100 Skor" - Standar Penilaian Numerik SPADA Transparan
  3) "24/7 Akses" - Central Timeline & Materi Pembelajaran
- Bottom Badge Container: 4 horizontal badges with icons:
  1) 🛡️ Validasi Berkas (.pdf, .docx, .xlsx, .zip maks 10MB)
  2) 📅 Central Timeline (Waktu Server Nyata)
  3) ⏱️ Presensi Digital (Terkendali Buka/Tutup)
  4) 🎓 Direct Enrollment (Pendaftaran Kelas Terpusat)

RIGHT COLUMN (FLOATING WHITE LOGIN CARD):
- Container: Solid White #FFFFFF, border-radius 16px, soft elevation drop shadow (rgba(15, 23, 42, 0.25)), padding 32px.
- Card Header: "Masuk ke SPADA LMS" / "Single Sign On" in #1F2937 (24px bold).
- Security Badges: Emerald Green #10B981 badges: "Portal Resmi SPADA" and "SSL Terenkripsi".
- Input 1: Label "IDENTITAS PENGGUNA (NIM / NIDN / EMAIL)", left User icon, placeholder "NIM, NIDN, atau Email terdaftar".
- Input 2: Label "KATA SANDI", left Lock icon, right toggle Eye icon, placeholder "••••••••••••".
- Checkbox "Ingat sesi saya" (left) + Link "Lupa kata sandi?" (right, #2563EB).
- Button: Full-width "Masuk Sekarang" with gradient #3B82F6 to #4F46E5, white text, radius 8px, right arrow icon (→).
- Footer text: "Kendala login? Hubungi Helpdesk IT Kampus".

FLOATING ACTION BUTTON (FAB):
- Bottom-right corner floating button, Emerald Green #10B981, support icon, label "PUSAT BANTUAN SPADA / HELP CENTER".
```

```text
[PROMPT SIAP KIRIM - GOOGLE STITCH FASE 3.2: PASSWORD RECOVERY PAGE (/forgot-password)]
Generate the Password Recovery page for SPADA LMS UPGRIS:
- Background: Gradient Dark Navy from #0D1B2A to #1B2A4A.
- Layout: Centered solid white floating card (#FFFFFF, max-width 460px, border-radius 16px, soft shadow, padding 32px).
- Top: Soft blue circular container with key/lock icon (#3B82F6).
- Title: "Pemulihan Kata Sandi" in #1F2937 (22px bold).
- Description: "Masukkan alamat email akun SPADA Anda yang terdaftar. Sistem akan mengirimkan tautan verifikasi untuk membuat kata sandi baru."
- Input Field: Email with Mail icon prefix, placeholder "nama@upgris.ac.id".
- Action Button: Full-width button "Kirim Tautan Pemulihan" (Royal Blue #2563EB, white text).
- Navigation Link: "← Kembali ke Halaman Masuk" linking back to /login.
```

```text
[PROMPT SIAP KIRIM - GOOGLE STITCH FASE 3.3: GLOBAL APP SHELL (TOPBAR & SIDEBAR)]
Generate the operational App Shell for SPADA LMS UPGRIS on desktop (1440px) with Light Clean Surface theme:
- Main Background: Light Slate #F8FAFC.

TOPBAR (STICKY, HEIGHT 64PX):
- Surface: Solid White #FFFFFF, bottom border #E2E8F0.
- Left: Sidebar collapse toggle icon + UPGRIS campus logo + "SPADA UPGRIS" text + Active semester badge "🟢 Semester Ganjil 2026/2027" (green pill).
- Right: Notification bell icon (with unread badge) + User Profile Menu:
  - Circular avatar (40px) + User full name "Dr. Awan Rosi, M.Kom." + Role badge pill "DOSEN" + dropdown chevron.
  - Dropdown Menu: "Profil Saya", "Ganti Kata Sandi", separator line, "Keluar" (Crimson red #DC2626 with logout icon).

SIDEBAR (WIDTH 260PX):
- Surface: Solid White #FFFFFF, right border #E2E8F0.
- Header: SPADA logo + sublabel "Team Membangun Negeri".
- Render 3 separate visual menu variations based on active role:
  1) Mahasiswa: [Dasbor, Kelas Saya, Panduan Belajar].
  2) Dosen: [Dasbor, Kelas Diampu, Panduan Dosen].
  3) Admin: [Dasbor, Manajemen Pengguna, Master Mata Kuliah, Pembukaan Kelas, Direct Enrollment, Jejak Audit].
- Active Item Styling: Light blue background #EFF6FF, blue text #2563EB, left vertical blue bar accent.
```

```text
[PROMPT SIAP KIRIM - GOOGLE STITCH FASE 3.4: USER PROFILE & SECURITY (/profile)]
Generate the User Profile and Security Management screen inside the App Shell for SPADA LMS UPGRIS:
- Header Profile Card:
  - Left: Large circular avatar (80px) with camera icon overlay + button "Unggah Foto Baru" (valid format: .jpg, .jpeg, .png; max 2MB limit).
  - Right: User Full Name, Official ID (NIM/NIDN/Username monospace), Role Badge (MAHASISWA / DOSEN / ADMIN), Account Status ("AKTIF" green badge).
- Navigation Tabs: Tab 1 "Biodata Diri" and Tab 2 "Keamanan & Kata Sandi".

TAB 1 CONTENT (BIODATA DIRI):
- Form Grid: Official ID (Read-only), Registered Email (Read-only with verified check), Full Name (Editable), Phone Number / WhatsApp, Bio / Description textarea.
- Button: "Simpan Perubahan Biodata" (#2563EB).

TAB 2 CONTENT (KEAMANAN & GANTI KATA SANDI):
- Form: Current Password input (with show/hide toggle), New Password input, Password Strength Meter (Weak, Medium, Strong visual bar), Confirm New Password input.
- Button: "Perbarui Kata Sandi" (#2563EB).
```

---

### 📊 Fase 4: Generasi Dasbor Kontekstual 3 Peran via Prompt Stitch

* **Tujuan Fase:** Membangkitkan antarmuka dasbor beranda yang sepenuhnya adaptif dan kontekstual bagi masing-masing peran resmi (Mahasiswa, Dosen, Admin) di Google Stitch.
* **Rincian Jobdesk Designer:**
  1. **Generasi Dasbor Mahasiswa:** Header sambutan NIM, 3 ringkasan status, kartu kelas perkuliahan terdaftar (nama MK, SKS, dosen, 16 pertemuan, tombol buka kelas).
  2. **Generasi Dasbor Dosen:** Header nama dosen & NIDN, 3 metrik pengajaran, daftar kelas diampu.
  3. **Generasi Dasbor Admin:** 4 metrik utama sistem, 4 pintasan *Quick Actions Grid*, snapshot log audit terbaru.
  4. **Refinement Responsivitas Mobile:** Mengadaptasi seluruh dasbor ke tampilan smartphone 375px.

#### 💬 Prompt Siap Kirim — Fase 4 (Salin & Kirim ke Google Stitch):

```text
[PROMPT SIAP KIRIM - GOOGLE STITCH FASE 4.1: DASBOR MAHASISWA]
Generate the Mahasiswa Dashboard screen inside the App Shell for SPADA LMS UPGRIS:
- Greeting Banner:
  - Title: "Selamat Datang, Ahmad Fauzi! (NIM: 24670001)".
  - Subtitle: "Semoga perkuliahan semester ini berjalan lancar dan penuh prestasi." + Current server date.
- 3 Academic Summary Cards (Row):
  1) Program Studi: "S1 Teknik Informatika" with graduation cap icon.
  2) Angkatan / Semester: "2024 • Semester 3" with calendar icon.
  3) Status Keaktifan: "AKTIF" (green badge pill) with checkmark icon.
- Section Header: "Kelas Perkuliahan Semester Ini" with count badge "3 Kelas Terdaftar".
- Enrolled Classes Grid (3 interactive cards for classes enrolled by Admin):
  - Card 1: Badge "TI-A • 3 SKS" (Blue), Title "Rekayasa Perangkat Lunak", Lecturer "Dr. Awan Rosi, M.Kom.", Status Badge "16 Pertemuan Terstruktur", Button "Buka Ruang Kelas →" (#2563EB).
  - Card 2: Badge "TI-B • 3 SKS", Title "Pemrograman Web Lanjut", Lecturer "Ir. Siti Aminah, M.T.", Status Badge "16 Pertemuan Terstruktur", Button "Buka Ruang Kelas →".
  - Card 3: Badge "TI-A • 2 SKS", Title "Basis Data Terdistribusi", Lecturer "Budi Santoso, M.Cs.", Status Badge "16 Pertemuan Terstruktur", Button "Buka Ruang Kelas →".
- Info Banner (Bottom): Informative blue alert regarding operational SPADA guidelines.
```

```text
[PROMPT SIAP KIRIM - GOOGLE STITCH FASE 4.2: DASBOR DOSEN]
Generate the Dosen Dashboard screen inside the App Shell for SPADA LMS UPGRIS:
- Greeting: "Selamat Datang, Dr. Awan Rosi, M.Kom. (NIDN: 0612345601)".
- 3 Teaching Metric Cards (Horizontal Grid):
  1) Total Kelas Diampu: "3 Kelas Aktif" with chalkboard icon (#2563EB).
  2) Total Beban SKS: "8 SKS Semester Ini" with award icon (#10B981).
  3) Mahasiswa Terdaftar: "118 Mahasiswa" with users icon (#7C3AED).
- Section Header: "Daftar Kelas Perkuliahan yang Diampu" with filter selector for academic year.
- Teaching Classes Table / Card List:
  - Columns: Kode Kelas, Mata Kuliah, Beban SKS, Kapasitas & Terdaftar (e.g. "40 / 40 Kuota Penuh" with full bar; "38 / 40 Terisi" with progress bar), Action button "Kelola Ruang Kelas" (#2563EB).
```

```text
[PROMPT SIAP KIRIM - GOOGLE STITCH FASE 4.3: DASBOR ADMIN]
Generate the Administrator Dashboard screen for SPADA LMS UPGRIS:
- Header: "Dasbor Administrator SPADA LMS - UPGRIS".
- 4 Primary System Metric Cards (4-column grid):
  1) Total Pengguna: "1,420" (Mahasiswa: 1,350 | Dosen: 70) with user icon.
  2) Total Mata Kuliah: "48 Mata Kuliah Aktif" with book-open icon.
  3) Kelas Perkuliahan: "36 Kelas Dibuka Semester Ini" with layout icon.
  4) Total Enrollment: "1,280 Kepesertaan Aktif" with user-check icon.
- Quick Operational Shortcuts Grid (4 actionable cards):
  - Card 1: "Tambah Pengguna Baru" with user-plus icon.
  - Card 2: "Buka Kelas Baru" with folder-plus icon.
  - Card 3: "Kelola Direct Enrollment" with user-check icon.
  - Card 4: "Lihat Jejak Audit" with shield-check icon.
- Recent Activity Snapshot:
  - Table of last 5 system mutations: Timestamp, Actor (Name & Username), Action Badge (LOGIN, CREATE_USER, ENROLL, dll), Target Entity, Detail.
```

```text
[PROMPT SIAP KIRIM - GOOGLE STITCH FASE 4.4: MOBILE RESPONSIVE ADAPTATION (375PX)]
Adapt the generated dashboards (Mahasiswa, Dosen, Admin) for a 375px mobile screen width:
1. Stack all multi-column metric cards into vertical single-column cards with touch-friendly spacing (8pt grid).
2. Transform data tables into readable stacked card items with high-contrast text.
3. Topbar: Keep campus emblem, semester pill, and mobile hamburger menu trigger.
4. Replace desktop sidebar with a sliding drawer navigation overlay from the left.
5. Ensure all interactive buttons and click targets have a minimum dimension of 44px x 44px for accessibility.
```

---

### 👥 Fase 5: Generasi Master Data, Direct Enrollment (Split-View) & Audit via Stitch

* **Tujuan Fase:** Membangkitkan modul antarmuka data-intensif khusus Administrator yang mengutamakan kecepatan pencarian, efisiensi form modal, dan kejelasan verifikasi kuota kelas.
* **Rincian Jobdesk Designer:**
  1. **Generasi Manajemen Pengguna (`/admin/users`):** Filter bar, data table pengguna, modal tambah pengguna, modal status, modal reset password.
  2. **Generasi Master Mata Kuliah & Kelas:** Data table mata kuliah & modal SKS 1–6, data table penawaran kelas semester aktif & modal pembukaan kelas.
  3. **Generasi Direct Enrollment Mahasiswa (`/admin/enrollments` — BR-002):** Selector kelas aktif, Two-Panel Split View (Enrolled vs Available, batch selection).
  4. **Generasi Peninjau Jejak Audit (`/admin/audit-logs`):** Filter pencarian, tabel log audit, modal side-by-side JSON Diff Inspector.

#### 💬 Prompt Siap Kirim — Fase 5 (Salin & Kirim ke Google Stitch):

```text
[PROMPT SIAP KIRIM - GOOGLE STITCH FASE 5.1: USER MANAGEMENT (/admin/users)]
Generate the User Management screen for Admin in SPADA LMS UPGRIS:
- Filter Bar: Search input (Name, NIM, NIDN, Email) + Role Filter Dropdown (All, Mahasiswa, Dosen, Admin) + Status Filter Dropdown (All, Active, Inactive, Suspended) + Button "Tambah Pengguna Baru" (+ icon, #2563EB).
- Data Table:
  - Columns: Pengguna (Avatar + Nama Lengkap), Identitas Resmi (NIM/NIDN/Username monospace), Email, Role (Badge), Status (Badge: ACTIVE green, INACTIVE gray, SUSPENDED purple), Terakhir Login, Aksi (Edit, Status, Reset Password).
- Pagination Bar: "Menampilkan 1-10 dari 1,420 pengguna", rows per page selector, pagination buttons.
- Modal Dialog 1 - Tambah Pengguna Baru:
  - Role Selector (Radio: Mahasiswa / Dosen / Admin).
  - Dynamic fields: If Mahasiswa (NIM, Prodi, Angkatan); If Dosen (NIDN, Gelar Akademik); If Admin (NIP / Username).
  - Common fields: Full Name, Email, Initial Password.
- Modal Dialog 2 - Ganti Status Akun:
  - Status options: ACTIVE, INACTIVE, SUSPENDED + Textarea alasan penangguhan.
```

```text
[PROMPT SIAP KIRIM - GOOGLE STITCH FASE 5.2: MASTER COURSES & CLASS OPENING]
Generate the Master Courses and Class Offerings screen for Admin in SPADA LMS UPGRIS:

VIEW A: MASTER MATA KULIAH (/admin/courses):
- Data Table: Kode MK (monospace e.g. TIF101), Nama Mata Kuliah, Beban SKS (badge pill 1 to 6 SKS), Deskripsi Kompetensi, Status, Actions (Edit, Hapus).
- Modal Tambah Mata Kuliah: Input Kode MK (unique), Input Nama MK, Stepper Input Beban SKS (1-6), Textarea Deskripsi Capaian.

VIEW B: PEMBUKAAN KELAS PERKULIAHAN (/admin/classes):
- Data Table: Kode Kelas ("TI-A"), Mata Kuliah, Dosen Pengampu Utama, Semester ("Ganjil 2026/2027"), Kapasitas Kuota, Terdaftar (e.g. 38/40 with progress bar), Actions ("Kelola Enrollment" primary button, Edit, Hapus).
- Modal Buka Kelas Baru: Combobox Mata Kuliah, Combobox Dosen Pengampu, Input Nama Kelas (e.g. "TI-A"), Input Tahun Akademik, Radio Semester (Ganjil/Genap), Number Input Kapasitas Kuota (e.g. 40).
```

```text
[PROMPT SIAP KIRIM - GOOGLE STITCH FASE 5.3: DIRECT ENROLLMENT MANAGEMENT (/admin/enrollments)]
Generate the Direct Enrollment Management screen for Admin in SPADA LMS UPGRIS based on Business Rule BR-002:

TOP BAR:
- Class Selector Combobox: e.g. "TI-A • Rekayasa Perangkat Lunak (Dosen: Dr. Awan Rosi, M.Kom.)".
- Capacity Progress Indicator: Visual progress meter showing "Terisi: 28 / Kuota: 40 Mahasiswa (Sisa 12 Kursi)" with smooth color bar.

TWO-COLUMN SPLIT VIEW LAYOUT:
LEFT PANEL - MAHASISWA TERDAFTAR (ENROLLED STUDENTS):
- Header: "Mahasiswa Terdaftar di Kelas" with count badge "28 Mahasiswa".
- Search input to filter students inside the class.
- Table: NIM (monospace), Nama Lengkap, Program Studi, Tanggal Terdaftar, Action button "Unenroll" (Crimson Red outline #DC2626).
- Unenroll Confirmation Modal: "Peringatan: Mencabut kepesertaan [Nama Mahasiswa] akan menghapus aksesnya ke materi dan aktivitas kelas ini."

RIGHT PANEL - MAHASISWA TERSEDIA (AVAILABLE STUDENTS):
- Header: "Daftar Mahasiswa Tersedia untuk Dienroll".
- Search & Filter bar: Search NIM/Nama + Filter Prodi / Angkatan.
- Table with Multi-Select Checkboxes: Select All checkbox, NIM, Nama Lengkap, Prodi, Angkatan.
- Sticky Bottom Action Bar: "Terpilih: 5 Mahasiswa", Primary Button "Daftarkan Mahasiswa Terpilih (Batch Enroll)" (#2563EB).
- Capacity Warning Banner: Displays warning if selected students count > remaining seats.
```

```text
[PROMPT SIAP KIRIM - GOOGLE STITCH FASE 5.4: AUDIT TRAIL & JSON DIFF INSPECTOR (/admin/audit-logs)]
Generate the Audit Trail Viewer screen for Admin in SPADA LMS UPGRIS:
- Filter Bar: Date Range Picker, Action Type Filter (LOGIN, LOGOUT, CREATE, UPDATE, DELETE, ENROLL, UNENROLL), Entity Filter (User, Course, Class, Enrollment), Search Actor/IP.
- Audit Log Table:
  - Columns: Timestamp (Server format), Aktor (Nama & Username), Aksi (Badge), Entitas & ID, IP Address & User Agent, Action button "Lihat Detail JSON" (#2563EB).
- JSON Diff Inspector Modal Dialog:
  - Title: "Inspeksi Perubahan Data: [Aksi] pada [Entitas]".
  - Side-by-side comparison view:
    - Left Column: "Old Values (Nilai Lama)" in light red background (#FEE2E2) with syntax highlighted JSON.
    - Right Column: "New Values (Nilai Baru)" in light green background (#DCFCE7) with syntax highlighted JSON.
```

---

### ✨ Fase 6: Generasi States/Edge Cases, Validasi Responsif, Uji WCAG & Handoff

* **Tujuan Fase:** Membangkitkan seluruh variasi status batas (*loading, empty, error states*), menguji kepatuhan aksesibilitas, serta mengekspor kode dan aset untuk serah terima ke pengembang frontend.
* **Rincian Jobdesk Designer:**
  1. **Generasi Status Batas (States Prompting):** Efek Skeleton Shimmer, Empty States dengan CTA, dan Halaman Error (401, 403, 404, 500).
  2. **Audit Aksesibilitas WCAG 2.1 AA:** Uji kontras rasio minimal 4.5:1, kelengkapan ikon & teks, focus ring, area sentuh 44x44px.
  3. **Penyusunan Dokumentasi & Ekspor Handoff:** Ekstraksi struktur HTML semantik, kelas Tailwind CSS, komponen React JSX, dan log prompt.

#### 💬 Prompt Siap Kirim — Fase 6 (Salin & Kirim ke Google Stitch):

```text
[PROMPT SIAP KIRIM - GOOGLE STITCH FASE 6.1: SKELETON SHIMMER & EMPTY STATES]
Generate the loading and empty state variants for SPADA LMS UPGRIS:

1. SKELETON LOADING SHIMMER:
   - Dashboard Skeleton: Shimmering placeholders for greeting banner, 3 metric cards, and 3 class cards.
   - Table Skeleton: Shimmering rows for User Management and Enrollment tables (pulsing light gray bars with animation).

2. FRIENDLY EMPTY STATES:
   - Empty Enrolled Classes: Friendly illustration of an open book + text "Belum Ada Kelas yang Diikuti" + subtext "Administrator belum mendaftarkan Anda ke kelas semester ini."
   - Empty Search Results: Search icon with magnifying glass + text "Tidak Ada Data Ditemukan" + button "Reset Filter Pencarian".
   - Empty Available Students: Checkmark illustration + text "Seluruh Mahasiswa Telah Terdaftar".
```

```text
[PROMPT SIAP KIRIM - GOOGLE STITCH FASE 6.2: ERROR SCREENS SUITE (401, 403, 404, 500)]
Generate the complete set of responsive custom error screens for SPADA LMS UPGRIS:

1. 401 UNAUTHORIZED (MODAL & PAGE):
   - Expired session notice: Lock illustration, title "Sesi Masuk Telah Berakhir", button "Masuk Kembali" (#2563EB).
2. 403 FORBIDDEN:
   - Shield/lock illustration in amber, title "Akses Ditolak / Wewenang Tidak Mencukupi", subtext explaining role permissions, button "Kembali ke Dasbor".
3. 404 NOT FOUND:
   - Clean illustration of a missing page, title "Halaman Tidak Ditemukan", subtext, button "Kembali ke Beranda".
4. 500 INTERNAL SERVER ERROR:
   - Server wrench illustration, title "Kendala Teknis pada Server SPADA", subtext, button "Coba Muat Ulang".
```

```text
[PROMPT SIAP KIRIM - GOOGLE STITCH FASE 6.3: WCAG 2.1 AA ACCESSIBILITY AUDIT]
Perform a comprehensive accessibility check and refinement on all generated screens for SPADA LMS UPGRIS:
1. Verify color contrast ratio: Ensure all regular body text achieves at least 4.5:1 contrast against its background on both Dark Navy portal (#0D1B2A) and Light Clean Surface (#F8FAFC / #FFFFFF).
2. Non-color indicators: Ensure status badges (ACTIVE, INACTIVE, SUSPENDED) feature distinct icons alongside text labels.
3. Interactive focus rings: Render clear 2px solid royal blue (#3B82F6) focus rings with 2px offset for all inputs, buttons, and links.
4. Mobile touch targets: Guarantee all clickable elements are at least 44px x 44px on mobile viewport.
```

```text
[PROMPT SIAP KIRIM - GOOGLE STITCH FASE 6.4: CODE & ASSET EXPORT HANDOFF]
Export clean, production-ready frontend code snippets and asset structures from Google Stitch for SPADA LMS UPGRIS:
1. Extract semantic HTML5 and Tailwind CSS utility classes matching the project design tokens.
2. Structure React JSX components matching the frontend architecture:
   - src/components/ui/ (Button, Input, Badge, Modal, Table, Skeleton)
   - src/features/auth/ (PortalNavbar, LoginFormCard, StatistikCardModule, SystemBadgesContainer)
   - src/features/dashboard/ (MahasiswaDashboard, DosenDashboard, AdminDashboard)
   - src/features/admin/enrollments/ (EnrollmentManager, EnrolledList, AvailableStudentList)
3. Ensure no inline hardcoded styles are used; rely 100% on standard Tailwind CSS classes.
```

---

## 7. Standar Quality Gates Hasil Generasi Google Stitch

Setiap layar yang dihasilkan oleh Google Stitch dinyatakan selesai dan layak serah terima (*Production-Ready*) apabila memenuhi checklist kualitas berikut:

- [ ] **Bebas Artefak Non-LMS:** Tidak ada teks, field, menu, atau ikon terkait SIA, PMB, pengajuan/persetujuan KRS, Dosen PA/Wali, KHS, Transkrip, atau UKT.
- [ ] **Kepatuhan 3 Peran Resmi:** Navigasi dan data hanya diperuntukkan bagi Mahasiswa, Dosen, dan Admin.
- [ ] **Akurasi Tema Permukaan:**
  - Halaman `/login` dan `/forgot-password` menggunakan tema Dark-Mode Professional Navy gradient (#0D1B2A → #1B2A4A) dengan floating card putih solid (#FFFFFF) dan soft elevation.
  - Halaman Dasbor, Shell, Profil, dan Master Data menggunakan tema Light Clean Surface (#F8FAFC & #FFFFFF).
- [ ] **Direct Enrollment Sesuai BR-002:** Tampilan dua panel (*Split View*) menampilkan daftar mahasiswa terdaftar vs tersedia, fitur multi-select batch enroll, dan indikator kapasitas kuota kelas.
- [ ] **Responsif Multi-Device:** Tampilan berfungsi dan tertata rapi pada resolusi Desktop (1440px) dan Smartphone (375px/390px).
- [ ] **Aksesibilitas WCAG 2.1 AA:** Lolos uji kontras warna 4.5:1, status dilengkapi teks dan ikon, serta focus ring interaktif.
- [ ] **Kesiapan Ekspor Frontend:** Struktur elemen semantik dan kelas Tailwind CSS dapat disalin langsung oleh tim pengembang frontend tanpa ambiguitas styling.
