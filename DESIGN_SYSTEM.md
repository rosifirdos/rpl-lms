# LAPORAN SPESIFIKASI DESIGN SYSTEM (UI/UX)
# SISTEM PEMBELAJARAN DARING (SPADA LMS) UNIVERSITAS PGRI SEMARANG
**Team Membangun Negeri — Spesifikasi Desain Antarmuka Terpadu (Design Tokens & Component Library)**

---

## 1. PENDAHULUAN & PRINSIP DESAIN

Design System ini menjadi acuan tunggal (*single source of truth*) dalam perancangan antarmuka visual **SPADA (Learning Management System) Universitas PGRI Semarang (UPGRIS)**. Sistem mengadopsi dua mode permukaan antarmuka yang terintegrasi harmonis:
1. **Portal Login & Landing Gateway:** Mengusung tema *Dark-Mode Professional Navy* dengan sentuhan *Electric Accent* untuk menghadirkan gerbang masuk pembelajaran digital yang modern, tepercaya, berwibawa, dan berkeamanan tinggi.
2. **Operasional Pembelajaran (App Shell, Dashboard, Ruang Kelas, Timeline):** Mengusung tema *Light Clean Surface* dengan kontras tinggi (WCAG 2.1 AA) untuk memaksimalkan kenyamanan membaca, fokus belajar, akses materi, serta efisiensi evaluasi tugas dan presensi bagi Mahasiswa, Dosen, dan Admin.

---

## 2. PALET WARNA (COLOR PALETTE)

### 2.1 Palet Portal Login & Landing (Dark-Mode Professional Navy)
Digunakan secara eksklusif pada halaman publik gerbang autentikasi (`/login`, `/forgot-password`, landing info).

| Kategori Warna | Kode Hex | Deskripsi & Penggunaan |
| --- | --- | --- |
| **Primary Background** | `#0D1B2A` – `#1B2A4A` | Gradient Biru Gelap / Deep Navy. Digunakan sebagai latar belakang utama halaman landing & login. |
| **Primary Accent** | `#3B82F6` / `#4F46E5` | Royal / Electric Blue. Digunakan pada tombol aksi utama ("Masuk Sekarang"), checkbox, dan tombol SSO. |
| **Secondary Accent** | `#38BDF8` / `#06B6D4` | Cyan / Aqua Blue. Digunakan untuk teks sorotan (*highlight*), garis aktif, dan aksen navigasi. |
| **Status & Security** | `#10B981` | Emerald Green. Digunakan untuk badge "Portal Resmi SPADA", indikator "SSL Terenkripsi", dan Help Center. |
| **Card Background** | `#FFFFFF` | Solid White. Kontainer utama form login agar kontras maksimal dengan latar belakang gelap (*floating card*). |
| **Text Primary** | `#1F2937` | Dark Slate / Neutral Gray. Teks utama pada form login (judul kartu dan label input). |
| **Text Muted** | `#6B7280` / `#9CA3AF` | Neutral Muted Gray. Digunakan untuk placeholder, deskripsi sekunder, dan hak cipta footer. |

### 2.2 Palet Operasional SPADA LMS (Light Clean Surface)
Digunakan pada seluruh halaman terotentikasi (Dasbor, Ruang Kelas 16 Pertemuan, Timeline, Lembar Penilaian, Manajemen Enrollment).

```text
[Brand Primary - Navy/Royal Blue]
Primary 900: #0F172A (Deep Slate - Topbar & Headings)
Primary 700: #1E3A8A (Brand Kampus UPGRIS)
Primary 600: #2563EB (Active Interactive / Buttons)
Primary 500: #3B82F6 (Primary Focus / Focus Rings)
Primary 100: #DBEAFE (Selected Background / Subtle Accent)
Primary 50:  #EFF6FF (Hover Light Background)

[Neutrals & Surfaces]
Surface 0 (White):   #FFFFFF (Card, Modal, & Dropzone Backgrounds)
Surface 50 (Slate):   #F8FAFC (App Page Main Background)
Border Subtlest:     #E2E8F0 (Table Borders, Dividers, Card Outlines)
Border Focused:      #CBD5E1 (Default Input Borders)
Text Primary:        #0F172A (High-Contrast Headings & Body Text)
Text Secondary:      #475569 (Metadata, Subtitles, Table Headers)
Text Tertiary:       #94A3B8 (Placeholders, Disabled Labels)

[Semantic & Learning Status]
Success / Hadir / On-Time:    #16A34A (Text/Icon) | #DCFCE7 (Badge Fill)
Warning / Izin / Late Submit:  #D97706 (Text/Icon) | #FEF3C7 (Badge Fill)
Destructive / Sakit / Alpa:    #DC2626 (Text/Icon) | #FEE2E2 (Badge Fill)
Info / Timeline / UTS & UAS:  #0284C7 (Text/Icon) | #E0F2FE (Badge Fill)
Locked / Syarat Presensi:      #7C3AED (Text/Icon) | #EDE9FE (Badge Fill)
```

---

## 3. TIPOGRAFI (TYPOGRAPHY)

Sistem tipografi menggunakan keluarga huruf **Sans-Serif Modern** (*Plus Jakarta Sans* atau *Inter*) untuk memastikan keterbacaan yang tinggi pada berbagai resolusi layar.

### 3.1 Hierarki Tipografi Portal Login & Landing
- **Hero Title (H1):**
  - **Ukuran:** 32pt – 36pt (42px – 48px), Line-height: 1.2
  - **Weight:** Bold (700)
  - **Warna:** Pure White (`#FFFFFF`) dengan Cyan Highlight (`#38BDF8`)
  - **Teks:** *"Membangun Negeri Melalui SPADA LMS UPGRIS"*
- **Card Title (H2):**
  - **Ukuran:** 20pt – 24pt (26px – 32px)
  - **Weight:** Bold / Semi-Bold (600–700)
  - **Warna:** Dark Slate (`#1F2937`)
  - **Teks:** *"Masuk ke SPADA LMS"* / *"Single Sign On"*
- **Section Header / Sub-title:**
  - **Ukuran:** 13pt – 15pt (17px – 20px)
  - **Weight:** Semi-Bold (600), Letter-spacing: +0.05em
  - **Warna:** Light Blue / Cyan (`#38BDF8`)
  - **Teks:** *"LEARNING MANAGEMENT SYSTEM — UNIVERSITAS PGRI SEMARANG"*
- **Form Labels & Captions:**
  - **Ukuran:** 10pt – 11pt (13px – 14px)
  - **Weight:** Semi-Bold (600), Uppercase
  - **Warna:** Gray (`#4B5563`)
  - **Teks:** *"IDENTITAS PENGGUNA (NIM / NIDN / EMAIL)"*, *"KATA SANDI"*
- **Body Text / Paragraph:**
  - **Ukuran:** 12pt – 14pt (16px – 18px)
  - **Weight:** Regular (400), Line-height: 1.5
  - **Warna:** Off-White / Muted Gray (`#94A3B8`)
  - **Penggunaan:** Teks deskripsi pengantar pembelajaran digital di sisi kiri hero landing.

### 3.2 Hierarki Tipografi Operasional Aplikasi
- **Display 1 (Dashboard Greeting / Title):** 28px, Bold, Line-height: 36px (`#0F172A`)
- **Section Title (H2 Pertemuan & Modul):** 20px, SemiBold, Line-height: 28px (`#0F172A`)
- **Card Subtitle (H3 Modal & Widget):** 16px, SemiBold, Line-height: 24px (`#1E293B`)
- **Body Regular (Instruksi Tugas, Materi):** 14px, Regular, Line-height: 20px (`#334155`)
- **Body Medium (Buttons, Nav Links):** 14px, Medium, Line-height: 20px (`#0F172A`)
- **Caption & Metadata (Timestamp, File Size):** 12px, Regular/Medium, Line-height: 16px (`#64748B`)
- **Monospace (NIM, NIDN, Kode MK, Skor 0–100):** *JetBrains Mono* / *Source Code Pro*, 13px–16px, SemiBold

---

## 4. PUSTAKA KOMPONEN (COMPONENT LIBRARY)

### 4.1 Komponen Gerbang Portal & Login

#### A. Navigasi Portal (Navbar)
- **Brand Logo & Label:** Terletak di pojok kiri atas, terdiri dari ikon emblem SPADA, nama sistem **"SPADA UPGRIS"**, dan sub-teks *"Portal Pembelajaran Digital & Inovasi Belajar"*.
- **Search Input Field:** Kolom pencarian di tengah navbar dengan ikon *magnifying glass* (Placeholder: *"Cari mata kuliah atau panduan SPADA..."*).
- **Navigation Links:** Menu navigasi horizontal: *Beranda*, *Fitur Pembelajaran*, *Panduan*, *Kontak*, dan *FAQ*.
- **Navbar Action Button:** Tombol berbentuk kapsul (*pill*) bertuliskan **"MASUK SSO"** di bagian kanan atas.

#### B. Kartu Formulir Login (Login Form Card)
- **Kontainer:** Background Solid White (`#FFFFFF`), Border Radius `16px` (*Rounded 2XL*), *Soft Elevation Drop Shadow* (`0px 20px 25px -5px rgba(15, 23, 42, 0.25)`).
- **Input Identitas Pengguna:**
  - Type: Text Input
  - Prefix Icon: User / Profile Icon
  - Border: Rounded Light Gray (`#D1D5DB`)
  - Placeholder: *"NIM, NIDN, atau Email terdaftar"*
- **Input Kata Sandi:**
  - Type: Password Input
  - Prefix Icon: Lock Icon
  - Suffix Icon: Eye Icon (Show/Hide Password Toggle)
  - Placeholder: ••••••••••••
- **Checkbox & Indikator Keamanan:**
  - Checkbox interaktif: *"Ingat sesi saya"*.
  - Badge keamanan: Indikator *"SSL Terenkripsi"* dan badge *"Portal Resmi SPADA"* (Emerald Green `#10B981`).
- **Primary Button ("Masuk Sekarang"):**
  - Type: Full-width Button
  - Background: Gradient Blue Accent (`#3B82F6` → `#4F46E5`), Teks Putih, Radius `8px`.
  - Icon: Right Arrow (→).

#### C. Modul Statistik & Fitur Unggulan SPADA
Tiga blok statistik ringkas di bawah teks utama hero landing:
- **16 Pertemuan:** Silabus Terstruktur (UTS P-8 & UAS P-16)
- **0–100 Skor:** Standar Penilaian Numerik SPADA Transparan
- **24/7 Akses:** Central Timeline & Materi Pembelajaran

#### D. Kontainer Badge Fitur SPADA
Container horizontal di bagian bawah sisi kiri hero yang menampilkan 4 pilar arsitektur SPADA:
- 🛡️ **Validasi Berkas:** Ketat .PDF, .DOCX, .XLSX, .ZIP (Limit 5MB–10MB)
- 📅 **Central Timeline:** Sinkronisasi Waktu Server Nyata
- ⏱️ **Presensi Digital:** Kontrol Buka/Tutup oleh Dosen Pengampu
- 🎓 **Direct Enrollment:** Pendaftaran Kelas Terpusat oleh Admin

#### E. Floating Action Button (FAB)
- Tombol melayang di pojok kanan bawah halaman.
- Background: Emerald Green (`#10B981`), Teks Putih, Ikon Support/Help Desk.
- Label: **"PUSAT BANTUAN SPADA / HELP CENTER"**.

---

### 4.2 Komponen Operasional SPADA LMS (App Shell & Modul Belajar)

#### A. Central Timeline Widget & Card
- **Fungsi:** Menampilkan urutan kronologis batas waktu penyerahan tugas terdekat, jadwal kuis, sesi presensi, dan ujian.
- **Anatomi Card:**
  - Kolom Tanggal: Format tanggal & jam server resmi (misal: *"Jumat, 15 Okt • 23:59 WIB"*).
  - Badge Tipe Aktivitas: `TUGAS` (Biru), `KUIS` (Ungu), `UTS` (Oranye), `PRESENSI` (Hijau).
  - Judul & Kelas: Nama aktivitas dan nama mata kuliah.
  - Shortcut Action: Tombol cepat menuju ruang kelas atau aktivitas terkait.

#### B. Struktur Ruang Kelas 16 Pertemuan (Accordion Card)
- **Organisasi Silabus:**
  - **Pertemuan 1–7:** Badge Biru *"Pembelajaran Pra-UTS"*.
  - **Pertemuan 8:** Badge Oranye *"Ujian Tengah Semester (UTS)"*.
  - **Pertemuan 9–15:** Badge Biru *"Pembelajaran Pasca-UTS"*.
  - **Pertemuan 16:** Badge Merah Marun *"Ujian Akhir Semester (UAS)"*.
- **Sub-komponen Tiap Pertemuan:**
  - Baris Materi: Ikon file, judul materi, deskripsi singkat, tombol *"Unduh Berkas"*.
  - Baris Tugas: Ikon tugas, judul, tenggat waktu, bobot nilai %, status penyerahan.
  - Baris Presensi: Status sesi (*Buka / Ditutup*), tombol presensi.
  - Baris Kuis: Ikon kuis, timer durasi, tombol mulai kuis.

#### C. Dropzone Pengumpulan Tugas & Validasi Berkas
- **Area Drag & Drop:** Border putus-putus (`border-dashed 2px #CBD5E1`), background `#F8FAFC`, hover `#EFF6FF`.
- **Indikator Whitelist Ekstensi:** Badge teks jelas: *"Hanya format .pdf, .docx, .xlsx, .zip yang diizinkan"*.
- **Indikator Ukuran:** *"Maksimal ukuran berkas 10MB"*.
- **Feedback Validasi Klien:**
  - Jika format tidak valid: Animasi goyang (*shake*), border merah `#DC2626`, pesan: *"Format berkas tidak didukung. Harap unggah file .pdf, .docx, .xlsx, atau .zip"*.
  - Jika ukuran > 10MB: Pesan merah: *"Ukuran berkas melebihi batas maksimal yang diizinkan (maks. 10MB)"*.
  - Jika valid: Progress bar unggah, nama file, ukuran file, icon centang hijau.

#### D. Lembar Penilaian Skor SPADA (Dosen)
- **Komponen Input Skor:**
  - Input angka khusus dengan rentang ketat **0.00 s.d. 100.00**.
  - Font Monospace besar (18px, Bold).
  - Validasi seketika: Jika input < 0 atau > 100, field diberi highlight merah dan tombol simpan dinonaktifkan.
- **Komponen Feedback:** Textarea untuk memberikan catatan umpan balik kualitatif bagi mahasiswa.

#### E. Indikator Presensi & Gatekeeping Ujian
- **Status Presensi:**
  - Sesi Buka: Badge Hijau menyala (*Pulse dot*) bertuliskan *"Sesi Presensi Aktif"*, tombol *"Isi Kehadiran"*.
  - Sesi Tutup: Badge Abu-abu bertuliskan *"Sesi Ditutup"*.
- **Gatekeeper Ujian (UTS P-8 & UAS P-16):**
  - Jika persentase kehadiran $\ge 70\%$: Badge Hijau *"Memenuhi Syarat (85%)"*, tombol *"Buka Soal Ujian"* aktif.
  - Jika persentase kehadiran $< 70\%$: Badge Merah/Ungu Terkunci *"Kehadiran Kurang (60% / Min. 70%)"*, tombol ujian dinonaktifkan (*disabled*) dengan ikon gembok terkunci.

---

## 5. SPASIAL, GRID & ELEVASI

### 5.1 Sistem Spasi (8pt Spatial System)
- **Scale:** `4px (0.5)`, `8px (1)`, `12px (1.5)`, `16px (2)`, `24px (3)`, `32px (4)`, `48px (6)`, `64px (8)`.
- **Desktop Layout:** 12 Kolom, Max Width `1440px`, Gutter `24px`, Margin Samping `32px`.
- **Tablet Layout:** 8 Kolom, Gutter `16px`, Margin Samping `24px`.
- **Mobile Layout:** 4 Kolom, Gutter `12px`, Margin Samping `16px` (kompatibel penuh pada lebar 375px–390px).

### 5.2 Sudut & Bayangan (Radius & Elevations)
- **Border Radius:**
  - `sm` (4px): Badge kecil, tooltip, tag status.
  - `md` (6px): Input field, select dropdown, button standar.
  - `lg` (8px): Dropdown menu, tombol aksi utama, popover.
  - `xl` (12px): Kartu ruang kelas, timeline cards, data table container.
  - `2xl` (16px): Login form card (portal), modal dialog pengerjaan tugas & kuis.
  - `full` (9999px): User avatar, badge pill.
- **Elevasi (Shadows):**
  - `Elevation-1 (Cards):` `0px 1px 3px rgba(15, 23, 42, 0.08)`
  - `Elevation-2 (Hover State):` `0px 4px 6px -1px rgba(15, 23, 42, 0.1)`
  - `Elevation-3 (Dropdowns / Flyout):` `0px 10px 15px -3px rgba(15, 23, 42, 0.12)`
  - `Elevation-4 (Modals & Portal Login Card):` `0px 20px 25px -5px rgba(15, 23, 42, 0.18)`

---

## 6. AKSESIBILITAS & KEPATUHAN STANDAR (WCAG 2.1 AA)

1. **Rasio Kontras:** Kontras teks terhadap latar belakang minimal **4.5:1** untuk teks reguler dan **3:1** untuk teks tebal/besar pada kedua tema (Portal Navy maupun Operasional Terang).
2. **Indikator Non-Warna:** Status sistem (Kehadiran, Kelulusan Ujian, Validasi File) tidak boleh hanya bergantung pada warna, wajib menyertakan ikon dan label teks deskriptif (misal: badge merah dilengkapi ikon tanda seru dan teks *"Tidak Memenuhi Syarat"*).
3. **Fokus Interaktif:** Seluruh elemen interaktif memiliki *focus-visible ring* berwarna biru cerah (`2px solid #3B82F6` dengan offset `2px`).
4. **Sentuhan Ramah Seluler:** Target klik minimum berukuran `44px x 44px` untuk tombol navigasi seluler dan formulir pada tampilan smartphone.
