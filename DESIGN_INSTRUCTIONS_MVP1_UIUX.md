# Instruksi Desain UI/UX: MVP 1
**Sistem Akademik Kampus Terintegrasi (Portal, SIA, SPADA/LMS, PMB)**  
*Universitas PGRI Semarang (UPGRIS) — Team Membangun Negeri*

---

## 📌 Ringkasan Dokumen
- **Target Deliverable:** Rancangan Desain UI/UX High-Fidelity & Interactive Prototype (Figma) untuk MVP 1
- **Acuan Utama:** [PRD.md](PRD.md) (*Bab 2, 3, 4, 5*), [SRS.md](SRS.md) (*Bab 3, 9, 10, 16, 19, 22, 28, 29, 30, 31, 32, 35, 39, 40*), [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md) (spesifikasi Portal Login & Landing — Dark-Mode Navy), dan [IMPLEMENTATION_PLAN_MVP1_BACKEND.md](IMPLEMENTATION_PLAN_MVP1_BACKEND.md)
- **Fokus Rilis MVP 1:** Autentikasi terpadu multi-kredensial, navigasi portal & role switcher, dasbor kontekstual 8 aktor, manajemen profil mandiri, manajemen master data akademik dasar, kalender akademik, manajemen pengguna & RBAC, serta penampil jejak audit (*audit trail*).

---

## 1. Tujuan & Ruang Lingkup Desain MVP 1

### 1.1 Tujuan Desain
Dokumen ini dirancang sebagai panduan kerja komprehensif bagi **UI/UX Designer** untuk menghasilkan antarmuka web modern, intuitif, berintegritas tinggi, dan konsisten (*design system-driven*), yang siap diserahkan (*handoff*) kepada tim pengembang frontend.

### 1.2 Ruang Lingkup Modul MVP 1
Sesuai **SRS Bab 39 (Tabel 21)** dan **PRD Bab 5**, ruang lingkup antarmuka MVP 1 mencakup:
1. **Modul Autentikasi Terpadu:** Login multi-kredensial, proteksi akun non-aktif, alur lupa password, dan ganti password mandiri.
2. **Modul Portal Gateway & Navigation Shell:** Header navigasi global, *role switcher* dinamis (multi-role), dan *sidebar* modular responsif.
3. **Modul Dasbor Kontekstual:** 6 ragam dasbor spesifik peran (Mahasiswa, Dosen/PA, Admin Akademik, Admin LMS, Super Admin, dan Calon Mahasiswa).
4. **Modul Profil Pengguna:** Kartu identitas, ringkasan biodata spesifik entitas, dan preferensi akun.
5. **Modul Master Data Akademik & Fasilitas (Admin Akademik):**
   - Kelembagaan: Fakultas & Program Studi.
   - Waktu: Tahun Akademik, Semester, dan mekanisme aktivasi semester operasional.
   - Fasilitas: Gedung dan Ruangan Kelas.
   - Kurikulum & Akademik: Kurikulum, Master Mata Kuliah, dan Pembukaan Kelas Dasar.
6. **Modul Kalender Akademik:** Penampil agenda operasional kampus dengan visualisasi status (Dijadwalkan, Berjalan, Selesai).
7. **Modul Manajemen Pengguna & RBAC (Super Admin):** Pengelolaan user, filter status akun, penugasan role/permission, dan matriks wewenang.
8. **Modul Jejak Audit (Audit Trail):** Penampil riwayat mutasi data sensitif dengan filter pencarian dan inspeksi detail perubahan JSON.

### 1.3 Batasan Rilis (Out of Scope untuk MVP 1)
Fitur-fitur berikut **tidak** dimasukkan ke dalam pengerjaan desain MVP 1 (dialokasikan untuk MVP 2 s/d MVP 6):
- Alur pengisian draf KRS, validasi bentrok jadwal, dan persetujuan KRS oleh Dosen PA (MVP 2).
- Ruang kelas SPADA 16 pertemuan, distribusi materi kuliah, dan sinkronisasi enrollment otomatis (MVP 3).
- Pengumpulan berkas tugas mahasiswa, kuis daring, dan presensi kuliah real-time (MVP 4).
- Pelaksanaan UTS/UAS, kalkulasi nilai akhir, penerbitan KHS, dan pencetakan transkrip kumulatif (MVP 5).
- Pendaftaran sidang skripsi/tugas akhir dan sistem notifikasi broadcast email/WA (MVP 6).

---

## 2. Analisis Pengguna & Karakteristik Aktor (8 Persona)

Antarmuka wajib mendukung adaptasi visual sesuai 8 peran resmi (*SRS Bab 3 & Bab 31*):

| Peran (Role) | Karakteristik Pengguna | Kebutuhan Utama pada MVP 1 | Prioritas Visual |
|---|---|---|---|
| **Super Admin** | Pengelola teknis sistem & keamanan IT kampus | Memantau kesehatan sistem, status pengguna, penugasan role, dan inspeksi jejak audit | Kerapian tabel data, kejelasan indikator status akun, visual inspector log |
| **Admin Akademik** | Staf operasional BAAK / Tata Usaha Fakultas | Mengelola struktur fakultas, prodi, tahun akademik, semester aktif, kurikulum, matakuliah, ruangan, dan kelas | Efisiensi CRUD form, data table berfilter cepat, konfirmasi dialog aman |
| **Admin LMS** | Pengelola infrastruktur pembelajaran digital | Memantau ringkasan metrik kelas SPADA, status perkuliahan, dan kesiapan sistem e-learning | Kartu analitik metrik (KPI cards), grafik monitoring visual |
| **Dosen & Dosen Wali (PA)** | Tenaga pengajar dan pembimbing akademik mahasiswa | Melihat rekap biodata akademik bergelar, jadwal mengajar semester aktif, dan statistik mahasiswa perwalian | Tampilan ringkas, jadwal yang mudah dipindai, kartu info mahasiswa bimbingan |
| **Dosen Pengampu** | Dosen tanpa tugas perwalian | Memantau kelas-kelas yang diampu pada semester berjalan | Daftar kartu kelas, info ruangan dan jadwal |
| **Mahasiswa** | Peserta didik aktif sarjana/diploma | Melihat status akademik, semester aktif, dosen PA, kalender akademik, dan launcher cepat ke SIA/SPADA | Modern, ramah seluler (*mobile-first*), kontras jelas, widget ringkasan |
| **Calon Mahasiswa** | Pendaftar jalur seleksi PMB | Melihat status verifikasi formulir dan memantau 5 tahapan pendaftaran PMB | Stepper progres pendaftaran yang bersahabat, penanda langkah jelas |
| **User Umum / Publik** | Masyarakat umum / pengunjung portal | Halaman login portal kampus terpadu yang informatif dan aman | Form login elegan, kredensial instruktif, branding kampus kuat |

---

## 3. Fondasi Design System (Design Tokens)

Desain wajib menggunakan prinsip **Design Tokens** yang terstruktur agar mudah diimplementasikan ke Tailwind CSS di sisi frontend.

### 3.1 Palet Warna (Color Palette)

Sistem menggunakan dua palet: **Portal Login & Landing** (Dark-Mode Professional Navy, acuan: `DESIGN_SYSTEM.md`) untuk gerbang autentikasi, dan **Operasional Aplikasi** (light surface) untuk dasbor, master data, RBAC, dan audit.

#### 3.1.A Palet Portal Login & Landing (Dark-Mode Professional Navy)

Antarmuka gerbang portal mengusung tema Dark-Mode Professional dengan sentuhan Electric Accent untuk menciptakan kesan tepercaya, modern, dan bernuansa teknologi tinggi.

```text
[Kategori Warna Portal]
Primary Background      #0D1B2A – #1B2A4A   Gradient Biru Gelap / Navy. Latar belakang utama halaman.
Primary Accent          #3B82F6 / #4F46E5    Royal / Electric Blue. Tombol aksi utama, checkbox, tombol SSO.
Secondary Accent        #38BDF8 / #06B6D4    Cyan / Aqua Blue. Teks highlight & garis aktif.
Status & Security       #10B981              Emerald Green. Badge "Portal Resmi", indikator "SSL Terenkripsi", tombol Help Center.
Card Background         #FFFFFF              Solid White. Kontainer utama form login agar kontras dengan latar gelap.
Text Primary            #1F2937              Dark Slate / Neutral Gray. Teks utama pada form login (heading & label).
Text Muted              #6B7280 / #9CA3AF    Neutral Muted Gray. Placeholder, deskripsi sekunder, teks footer.
```

#### 3.1.B Palet Operasional Aplikasi (Light Surface — Dasbor, Master Data, RBAC, Audit)

```text
[Brand Primary - Navy/Royal Blue]
Primary 900: #0F172A (Deep Slate Dark)
Primary 700: #1E3A8A (Primary Brand Kampus)
Primary 600: #2563EB (Active Interactive / Buttons)
Primary 500: #3B82F6 (Primary Focus)
Primary 100: #DBEAFE (Selected Background / Subtle Accent)
Primary 50:  #EFF6FF (Hover Light Background)

[Neutrals & Surfaces]
Surface 0 (White):   #FFFFFF (Card & Modal Backgrounds)
Surface 50 (Slate):   #F8FAFC (App Page Background)
Border Subtlest:     #E2E8F0 (Table Borders, Dividers)
Border Focused:      #CBD5E1 (Input Borders Default)
Text Primary:        #0F172A (High-Contrast Headings & Main Copy)
Text Secondary:      #475569 (Metadata, Subtitles, Table Headers)
Text Tertiary:       #94A3B8 (Placeholders, Disabled Labels)

[Semantic & Status Colors]
Success (Active/Done):      #16A34A (Text/Icon) | #DCFCE7 (Badge Fill)
Warning (Pending/Scheduled): #D97706 (Text/Icon) | #FEF3C7 (Badge Fill)
Destructive (Inactive/Fail):#DC2626 (Text/Icon) | #FEE2E2 (Badge Fill)
Info (Notice/Calendar):     #0284C7 (Text/Icon) | #E0F2FE (Badge Fill)
Suspended Account:          #7C3AED (Text/Icon) | #EDE9FE (Badge Fill)
```

> Catatan: Palet operasional (3.1.B) adalah token utama untuk seluruh layar aplikasi terotentikasi. Palet portal (3.1.A) eksklusif dipakai pada `/login`, `/forgot-password`, dan landing portal publik.

### 3.2 Tipografi (Typography Hierarchy)
Font utama: **Inter** atau **Plus Jakarta Sans** (bersih, keterbacaan tinggi di berbagai resolusi layar).

#### 3.2.A Hierarki Tipografi Portal Login & Landing

Keluarga huruf Sans-Serif Modern (Plus Jakarta Sans, Inter, atau Poppins) untuk memastikan keterbacaan tinggi pada berbagai ukuran layar.

- **Hero Title (H1):** 32pt – 36pt, Weight Bold (700), Warna Pure White (#FFFFFF) & Cyan Highlight (#38BDF8). Penggunaan: Judul utama ("Membangun Negeri Melalui Merdeka Belajar").
- **Card Title (H2):** 20pt – 24pt, Weight Bold/Semi-Bold (600–700), Warna Dark Slate (#1F2937). Penggunaan: Judul formulir SSO ("Single Sign On").
- **Section Header / Sub-title:** 13pt – 15pt, Weight Semi-Bold (600), Warna Light Blue/Cyan (#38BDF8). Penggunaan: Badge kategori ("TRANSFORMASI PENDIDIKAN INDONESIA").
- **Form Labels & Captions:** 10pt – 11pt, Weight Semi-Bold (600), Uppercase, Warna Gray (#4B5563). Penggunaan: Label field ("NIM / ID PENGGUNA", "KATA SANDI").
- **Body Text / Paragraph:** 12pt – 14pt, Weight Regular (400), Warna Off-White/Muted Gray. Penggunaan: Teks deskripsi di sisi kiri landing.

#### 3.2.B Hierarki Tipografi Operasional Aplikasi

- **Display 1 (H1 Dashboard / Welcome):** 28px (Bold, line-height 36px)
- **Title (H2 Section Headings):** 20px (SemiBold, line-height 28px)
- **Subtitle (H3 Modal / Card Headers):** 16px (SemiBold, line-height 24px)
- **Body Regular (Main text, table rows):** 14px (Regular, line-height 20px)
- **Body Medium (Buttons, navigation links):** 14px (Medium, line-height 20px)
- **Caption / Metadata (Badges, timestamps):** 12px (Regular/Medium, line-height 16px)
- **Monospace (NIM, NIDN, Kode Ruangan, UUID):** JetBrains Mono / Source Code Pro, 13px (Regular)

### 3.3 Sistem Spasi & Grid (8pt Spatial Grid)
Gunakan kelipatan 4px / 8px secara ketat:
- **Spacing Scale:** `4px (0.5)`, `8px (1)`, `12px (1.5)`, `16px (2)`, `20px (2.5)`, `24px (3)`, `32px (4)`, `48px (6)`, `64px (8)`.
- **Desktop Grid:** 12 Kolom, Max Width `1440px`, Gutter `24px`, Margin Kiri/Kanan `32px`.
- **Tablet Grid:** 8 Kolom, Gutter `16px`, Margin Kiri/Kanan `24px`.
- **Mobile Grid:** 4 Kolom, Gutter `12px`, Margin Kiri/Kanan `16px` (berlaku pula untuk Portal Login & Landing pada 375px).

### 3.4 Sudut & Bayangan (Radius & Elevations)
- **Border Radius:**
  - `sm` (4px): Badges, tooltips, tags kecil.
  - `md` (6px): Input fields, select box, button umum.
  - `lg` (8px): Dropdown menu, popover, alert box.
  - `xl` (12px): Cards, containers, data tables container.
  - `2xl` (16px): Modal dialogs, slide-over panels.
  - `full` (9999px): User avatar, rounded pill tags.
- **Elevations (Shadows):**
  - `Elevation-1 (Cards default):` `0px 1px 3px rgba(15, 23, 42, 0.08)`
  - `Elevation-2 (Hover state cards & tables):` `0px 4px 6px -1px rgba(15, 23, 42, 0.1)`
  - `Elevation-3 (Dropdowns & Popovers):` `0px 10px 15px -3px rgba(15, 23, 42, 0.12)`
  - `Elevation-4 (Modals & Dialogs):` `0px 20px 25px -5px rgba(15, 23, 42, 0.15)`

### 3.5 Aksesibilitas (WCAG 2.1 Level AA)
- Rasio kontras teks reguler terhadap latar belakang minimal **4.5:1**; untuk teks tebal/besar minimal **3:1**.
- Seluruh elemen interaktif wajib memiliki state fokus visual yang jelas (*Focus Ring: 2px solid #3B82F6 dengan offset 2px*).
- Setiap status tidak boleh hanya direpresentasikan oleh warna saja (wajib menyertakan teks atau ikon pendukung, misalnya badge "Aktif" dengan ikon centang).

---

## 4. Arsitektur Komponen Desain (Atomic Design)

### 4.1 Atoms
1. **Buttons:**
   - *Primary:* Solid Royal Blue (#2563EB), teks putih, hover #1E3A8A.
   - *Primary (Portal Login & Landing):* Full-width, Blue Accent (#3B82F6) dengan gradient halus ke #4F46E5, teks putih, Radius 8px, ikon Right Arrow (→). Penggunaan: tombol "Masuk Sekarang".
   - *Secondary / Outline:* Border #CBD5E1, teks #0F172A, hover #F8FAFC.
   - *Destructive:* Solid Crimson (#DC2626), teks putih.
   - *Ghost / Icon Button:* Tanpa border, hover #F1F5F9.
   - *States:* Default, Hover, Focused, Active/Pressed, Disabled, Loading (dengan spinner 16px).
2. **Form Inputs:**
   - *Text Input:* Label atas, placeholder abu-abu, helper text / inline error text merah, support left-icon (misal ikon Search/Mail) dan right-icon (tombol eye show/hide password).
   - *Text Input (Portal Login):* Prefix Icon (User/Profile Icon), Border Rounded Light Gray (#D1D5DB), placeholder contoh "24670097". Berada di dalam Login Form Card berlatar putih.
   - *Password Input (Portal Login):* Type Password Input, Prefix Icon (Lock Icon), Suffix Icon (Eye Icon — Show/Hide Password Toggle), placeholder ••••••••.
   - *Select Dropdown:* Custom dropdown dengan chevron icon, menu dengan batas scroll jika > 6 item.
   - *Switch / Toggle:* Digunakan untuk aksi status on/off instan (misal status aktif akun).
3. **Badges / Status Pills:**
   - `ACTIVE` / `BERJALAN`: Latar hijau muda (#DCFCE7), teks hijau tua (#16A34A).
   - `INACTIVE` / `SELESAI`: Latar abu-abu (#F1F5F9), teks abu-abu (#475569).
   - `SUSPENDED`: Latar ungu muda (#EDE9FE), teks ungu tua (#7C3AED).
   - `DIJADWALKAN`: Latar kuning muda (#FEF3C7), teks oranye tua (#D97706).
   - `Portal Resmi` (Portal Login & Landing): Latar Emerald Green (#10B981) teks putih. Penggunaan: badge kepercayaan portal.
4. **Avatars:**
   - User profile image dengan inisial nama fallback (*Contoh: "AF" untuk Ahmad Fauzi*), dilengkapi status indicator dot hijau di pojok kanan bawah.

### 4.2 Molecules
1. **Search & Filter Bar:**
   - Kombinasi kolom pencarian kata kunci (*search input*) + 1-3 dropdown filter cepat (misal filter Fakultas, filter Role, filter Status) + Tombol Reset.
2. **Stat Metric Card:**
   - Kartu metrik dasbor berisi: Ikon tema dalam lingkaran berwarna lembut, judul label metrik, angka statistik utama berukuran 24px-30px, dan keterangan tambahan / status tren.
3. **Statistik Card Module (Portal Login & Landing):**
   - Tiga blok statistik ringkas di bawah teks utama hero: **40+** Mitra Industri Aktif, **100%** Konversi SKS Diakui, **24/7** Akses Portal Terpadu. Angka besar bertanda bold, keterangan ringkas di bawahnya.
4. **Integrasi Sistem Badges Container (Portal Login & Landing):**
   - Modul khusus di bagian bawah yang memuat daftar sistem terintegrasi (SIA, SPADA, SIP, SIKAP, SI-KEMAS, GC) sebagai badge/kartu kecil sejajar.
5. **Pagination Bar:**
   - Informasi rentang data aktif (*"Menampilkan 1-10 dari 45 data"*), selector jumlah baris per halaman (*10, 25, 50*), dan tombol navigasi halaman (*Previous, 1, 2, 3, Next*).
6. **Toast Notification:**
   - Banner mengambang di pojok kanan atas layar (*Top-Right*), auto-dismiss 4 detik, mendukung 4 ragam: Success (hijau), Error (merah), Warning (kuning), Info (biru).

### 4.3 Organisms
1. **Global App Topbar:**
   - Logo UPGRIS & Nama Sistem ("Portal Terintegrasi").
   - Badge Semester Aktif Terpasang (*Contoh: "Semester Ganjil 2026/2027"*).
   - Role Switcher Dropdown (jika user memiliki >1 role, misal Dosen & Dosen Wali).
   - Tombol Notifikasi (Ikon lonceng dengan unread dot).
   - Menu Profil User (Avatar, Nama lengkap, Role aktif, opsi "Profil Saya", "Ganti Password", dan "Keluar/Logout").
2. **Portal Navbar (Login & Landing Publik):**
   - *Brand Logo & Label:* Terletak di pojok kiri atas, terdiri dari ikon portal, nama sistem "Membangun Negeri", dan sub-teks "Portal Kampus Merdeka & Inovasi Belajar".
   - *Search Input Field:* Kolom pencarian di tengah navbar dengan ikon *magnifying glass* ("Cari program Merdeka Belajar...").
   - *Navigation Links:* Menu navigasi horizontal yang mencakup: *Beranda* (aktif/terpilih), *Program*, *Kegiatan*, *Berita*, *Kontak*, dan *FAQ*.
   - *Navbar Action Button:* Tombol berbentuk kapsul (*pill*) bertuliskan **"MASUK SSO"** di bagian kanan atas.
3. **Login Form Card (Portal Login & Landing):**
   - Background Solid White (#FFFFFF), Border Radius 16px (Rounded Large).
   - *Soft Elevation Drop Shadow* untuk memberikan efek mengapung dari background gelap (navy).
   - Berisi: Logo/judul SSO, Field NIM/ID Pengguna, Field Kata Sandi, Checkbox "Ingat sesi saya", dan tombol Primary Button "Masuk Sekarang".
4. **Responsive Sidebar:**
   - Mode Desktop: Lebar `260px`, fixed di sebelah kiri, collapsible menjadi `72px` (icon-only mode).
   - Mode Mobile/Tablet: Drawer mengambang dari kiri dengan overlay latar belakang gelap.
   - Pengelompokan menu rapi berdasarkan hak akses peran (*Role-based navigation*).
5. **Responsive Data Table:**
   - Header tabel dengan indikator pengurutan (*sortable indicator*).
   - Baris zebra halus atau pemisah garis halus.
   - Kolom aksi terstandar (*View detail, Edit, Delete / Activate*).
   - Empty state bawaan dengan ilustrasi dan tombol aksi tambah data jika tabel kosong.
6. **Modal Dialog System:**
   - Ukuran: *Sm (400px)* untuk konfirmasi bahaya, *Md (560px)* untuk form standar, *Lg (800px)* untuk form kompleks bertab.
   - Header jelas, tombol close (X) di pojok kanan atas, body area terpisah, dan footer aksi dengan tombol Batal & Simpan.
7. **Floating Action Button (FAB) (Portal Login & Landing):**
   - Tombol melayang di pojok kanan bawah halaman.
   - Color: Emerald Green (#10B981).
   - Icon: WhatsApp / Support Icon.
   - Text: **"PUSAT LAYANAN / HELP CENTER"**.

---

## 5. Arsitektur Informasi & Struktur Navigasi

### 5.1 Struktur Rute & Sitemap Navigasi MVP 1

```text
[Akses Publik]
├── /login                         # Login Portal Terpadu Multi-Kredensial
└── /forgot-password               # Permintaan Reset Kata Sandi

[Area Terotentikasi / Portal App Shell]
├── /dashboard                     # Dasbor Kontekstual Sesuai Peran Aktif
├── /profile                       # Profil Mandiri Pengguna
│   ├── Tab: Biodata Pribadi
│   └── Tab: Keamanan & Ganti Password
├── /calendar                      # Kalender Akademik Kampus
│
├── [Area Admin Akademik - Master Data]
│   ├── /master/fakultas           # Master Fakultas & Program Studi
│   ├── /master/semester           # Master Tahun Akademik & Semester Operasional
│   ├── /master/fasilitas          # Master Gedung & Ruangan Kuliah
│   ├── /master/kurikulum          # Master Kurikulum & Mata Kuliah
│   └── /master/kelas              # Penawaran Kelas Semester Berjalan
│
├── [Area Super Admin - Sistem & Akses]
│   ├── /users                     # Manajemen Pengguna & Status Akun
│   ├── /roles                     # Matriks Role & Permissions
│   └── /audit-logs                # Peninjau Jejak Audit Sistem
│
└── [Shortcut Modul Terintegrasi]
    ├── /sia                       # Pintu gerbang Sistem Informasi Akademik
    ├── /spada                     # Pintu gerbang Learning Management System
    └── /pmb                       # Pintu gerbang Penerimaan Mahasiswa Baru
```

---

## 6. Spesifikasi Layar & Wireframe Guideline (Screen-by-Screen)

### 6.1 Modul Autentikasi

> **Catatan tema:** Layar autentikasi portal (`/login`, `/forgot-password`) wajib menggunakan tema **Dark-Mode Professional Navy** (palet §3.1.A & tipografi §3.2.A) sesuai `DESIGN_SYSTEM.md`. Palet operasional terang (§3.1.B) hanya berlaku di area terotentikasi.

#### Layar 1: Halaman Login Portal (`/login`)
- **Tujuan:** Gerbang masuk utama seluruh sivitas akademika kampus, dengan tampilan portal publik informatif bertema Dark-Mode Professional Navy.
- **Latar & Tata Letak:**
  - Latar belakang utama: *Gradient Navy* (#0D1B2A → #1B2A4A) memberikan kesan tepercaya, modern, dan bernuansa teknologi tinggi.
  - Tata letak dua kolom pada Desktop: *Sisi Kiri* berisi konten branding/hero, *Sisi Kanan* berisi Login Form Card (kartu putih mengambang dengan *Soft Elevation Drop Shadow*, Border Radius 16px).
- **Navbar Portal (pojok atas):**
  - *Brand Logo & Label:* Ikon portal, nama sistem "Membangun Negeri", sub-teks "Portal Kampus Merdeka & Inovasi Belajar" di pojok kiri atas.
  - *Search Input Field:* Kolom pencarian di tengah navbar dengan ikon *magnifying glass* (placeholder: *"Cari program Merdeka Belajar..."*).
  - *Navigation Links:* *Beranda* (aktif/terpilih), *Program*, *Kegiatan*, *Berita*, *Kontak*, *FAQ*.
  - *Navbar Action Button:* Tombol kapsul (*pill*) **"MASUK SSO"** di kanan atas.
- **Sisi Kiri (Hero / Branding):**
  - *Hero Title (H1):* **"Membangun Negeri Melalui Merdeka Belajar"** (Pure White #FFFFFF & Cyan Highlight #38BDF8, 32–36pt Bold).
  - *Section Header / Sub-title:* Badge kategori cyan (mis. *"TRANSFORMASI PENDIDIKAN INDONESIA"*).
  - *Body Text:* Deskripsi deskriptif portal (Off-White/Muted Gray, 12–14pt Regular).
  - *Statistik Card Module:* Tiga blok statistik ringkas — **40+** Mitra Industri Aktif, **100%** Konversi SKS Diakui, **24/7** Akses Portal Terpadu.
  - *Integrasi Sistem Badges Container:* Daftar sistem terintegrasi (SIA, SPADA, SIP, SIKAP, SI-KEMAS, GC) di bagian bawah.
- **Sisi Kanan — Login Form Card (Solid White #FFFFFF):**
  - *Card Title (H2):* Judul formulir SSO — *"Single Sign On"* (Dark Slate #1F2937, 20–24pt Bold/Semi-Bold).
  - *Badge Kepercayaan:* Badge "Portal Resmi" dan indikator "SSL Terenkripsi" (Emerald Green #10B981).
  - *Field NIM / ID Pengguna:* Text Input, Prefix Icon (User/Profile Icon), Border Rounded Light Gray (#D1D5DB), placeholder *"24670097"*. Label Form: *"NIM / ID PENGGUNA"* (Uppercase, Semi-Bold, Gray #4B5563, 10–11pt).
  - *Field Kata Sandi:* Password Input, Prefix Icon (Lock Icon), Suffix Icon (Eye Icon — Show/Hide Password Toggle), placeholder ••••••••. Label Form: *"KATA SANDI"*.
  - *Checkbox:* Interaktif untuk fitur "Ingat sesi saya", berdampingan dengan indikator status keamanan "SSL Terenkripsi".
  - Tautan *"Lupa kata sandi?"* di samping kanan area password.
  - *Primary Button:* **"Masuk Sekarang"** — Full-width, Blue Accent (#3B82F6) dengan gradient halus ke #4F46E5, teks putih, Radius 8px, ikon Right Arrow (→).
  - Footer card: Teks hak cipta & informasi bantuan kontak IT kampus.
- **Floating Action Button (FAB):**
  - Tombol melayang di pojok kanan bawah halaman, Emerald Green (#10B981), ikon WhatsApp/Support, teks **"PUSAT LAYANAN / HELP CENTER"**.
- **Status & Validasi UX:**
  - Jika kredensial salah: Alert merah di atas form: *"Username atau kata sandi tidak sesuai"*.
  - Jika akun `INACTIVE` atau `SUSPENDED`: Alert amber/ungu: *"Akun Anda sedang dinonaktifkan. Silakan hubungi Administrator Akademik."*
  - Saat request berlangsung: Tombol menampilkan animasi spinner dan ter-disable.

#### Layar 2: Halaman Lupa Password (`/forgot-password`)
- **Tujuan:** Pengajuan pemulihan akun bagi pengguna yang kehilangkan akses.
- **Tema:** Dark-Mode Navy (§3.1.A) — konsisten dengan Landing Portal.
- **Komponen:**
  - Latar gradient navy (#0D1B2A → #1B2A4A) dengan Login Form Card putih terpusat (*Centered Card layout*, Border Radius 16px, *Soft Elevation Drop Shadow*).
  - Ikon kunci gembok (*Key Icon*) dalam lingkaran biru lembut (#3B82F6/#4F46E5).
  - Judul: *"Pemulihan Kata Sandi"* (Dark Slate #1F2937). Subtitle instruktif (Text Muted).
  - Input *"Email Terdaftar"* dengan Prefix Icon (Mail Icon), Border Rounded Light Gray (#D1D5DB).
  - Tombol *"Kirim Tautan Pemulihan"* (Primary Button: Blue Accent gradient, teks putih, Radius 8px).
  - Tautan kembali ke halaman login.
  - State Berhasil: Menampilkan kartu konfirmasi pengiriman instruksi ke email dengan tombol kembali.

---

### 6.2 Navigasi Utama & Shell Aplikasi (App Shell)

- **Header / Topbar:**
  - Tinggi `64px`, sticky di bagian atas dengan bayangan halus.
  - Sisi Kiri: Tombol toggle sidebar (hamburger menu pada mobile) + Nama modul aktif.
  - Sisi Tengah: Badge status semester aktif (*Contoh: "🟢 Semester Ganjil 2026/2027 (Operasional)"*).
  - Sisi Kanan:
    - Selector Multi-role: Dropdown dinamis jika pengguna memiliki lebih dari 1 role (misal Dosen beralih peran ke Dosen Wali).
    - Ikon notifikasi (lonceng).
    - User Menu Dropdown: Foto profil, nama pengguna, role aktif, separator, link *"Profil Saya"*, link *"Ganti Kata Sandi"*, tombol *"Keluar"* (beraksen merah).
- **Sidebar Kiri:**
  - Lebar `260px` (dapat diciutkan menjadi `72px`).
  - Bagian Atas: Logo kampus dan teks "PORTAL KAMPUS".
  - Bagian Menu Utama:
    - Dasbor (Dashboard Home).
    - Kalender Akademik.
  - Bagian Modul Terintegrasi (Berdasarkan hak akses):
    - SIA (Sistem Informasi Akademik).
    - SPADA (Learning Management System).
    - PMB (Penerimaan Mahasiswa Baru).
  - Bagian Pengaturan & Kelola Data (Khusus Admin/Super Admin):
    - Master Data (Sub-menu: Fakultas & Prodi, Semester, Fasilitas, Kurikulum & MK, Kelas).
    - Manajemen Akun (Sub-menu: Pengguna, Role & Permission).
    - Jejak Audit (Audit Trail).

---

### 6.3 Dasbor Kontekstual Berdasarkan 8 Peran

#### Layar 3A: Dasbor Mahasiswa
- **Header Sambutan:** *"Selamat Datang, [Nama Mahasiswa]! (NIM: 2024001001)"* dengan tanggal hari ini.
- **Kartu Ringkasan Akademik (3 Kolom):**
  - *Kartu 1 (Status Akademik):* Program Studi Teknik Informatika, Jenjang S1, Status: `AKTIF`, Semester 1.
  - *Kartu 2 (Dosen Wali / PA):* Foto dosen PA, Nama lengkap bergelar (Dr. Budi Santoso, M.Kom.), NIDN, tombol aksi cepat *"Hubungi Dosen PA"*.
  - *Kartu 3 (Status Registrasi KRS):* Badge status periode KRS aktif/tutup, peringatan batas akhir pengisian.
- **Launcher Akses Cepat Modul Utama (2 Card Besar Berwarna):**
  - *SIA Gateway Card:* Ikon akademik, deskripsi: *"Kelola KRS, lihat jadwal kuliah, pantau KHS dan transkrip nilai"*, tombol *"Buka Layanan SIA"*.
  - *SPADA LMS Gateway Card:* Ikon buku digital, deskripsi: *"Akses ruang kelas 16 pertemuan, materi, tugas, dan presensi kuliah"*, tombol *"Buka Layanan SPADA"*.
- **Widget Kalender Akademik Terdekat:** List 3-4 agenda kampus terdekat dengan penanda tanggal dan badge status agenda.

#### Layar 3B: Dasbor Dosen & Dosen Wali (PA)
- **Header Sambutan:** *"Selamat Datang, [Nama Dosen bergelar] (NIDN: ...)"*.
- **Baris Metrik Dosen (3 Kartu):**
  - Total Kelas Diampu Semester Ini (*Contoh: 3 Kelas*).
  - Total Beban SKS Semester Ini (*Contoh: 9 SKS*).
  - Total Mahasiswa Bimbingan PA (*Khusus Dosen Wali, misal 24 Mahasiswa*).
- **Jadwal Mengajar Semester Aktif (Tabel / Card List):**
  - Menampilkan Mata Kuliah, Kode Kelas, Hari/Jam, Gedung & Ruangan, serta Jumlah Mahasiswa terdaftar.
- **Widget Perwalian Akademik (Khusus Dosen Wali):**
  - Ringkasan status bimbingan mahasiswa wali dan tombol cepat akses ke modul bimbingan.

#### Layar 3C: Dasbor Admin Akademik
- **Baris Statistik Utama (4 Kartu Metrik):**
  - Total Mahasiswa Aktif.
  - Total Dosen Aktif.
  - Total Program Studi & Fakultas.
  - Total Kelas Kuliah Semester Aktif.
- **Status Kalender & Periode Operasional:**
  - Kartu khusus penanda Semester Aktif berjalan dilengkapi tanggal mulai dan tanggal berakhir.
- **Pintasan Cepat Master Data (Quick Action Buttons):**
  - Tombol pintas: *"Tambah Program Studi"*, *"Buka Penawaran Kelas"*, *"Kelola Ruangan"*, *"Update Kalender"*.
- **Tabel Log Agenda Kampus Berjalan.**

#### Layar 3D: Dasbor Admin LMS
- **Baris Metrik SPADA:**
  - Total Kelas Daring Aktif.
  - Total Dosen Pengajar Aktif di LMS.
  - Ringkasan Modul Pertemuan (Total Pertemuan 1–16 yang telah terbit).
  - Indikator Aktivitas Penugasan & Kuis.
- **Daftar Kelas Pembelajaran Terpopuler / Teraktif.**

#### Layar 3E: Dasbor Super Admin
- **Baris Metrik Sistem (4 Kartu):**
  - Total Pengguna Terdaftar (Pecahan: Active, Inactive, Suspended).
  - Distribusi Akun Berdasarkan 8 Role Resmi.
  - Total Log Aktivitas Hari Ini.
  - Status Integritas Database & Layanan.
- **Snapshot Jejak Audit Terkini (5 Entri Terakhir):**
  - Tabel ringkas: Waktu, Aktor, Aksi, Entitas yang diubah, dan Alamat IP.
- **Pintasan Pengelolaan Keamanan & Pengguna.**

#### Layar 3F: Dasbor Calon Mahasiswa (PMB)
- **Header:** Nomor Pendaftaran PMB dan Program Studi Pilihan.
- **Stepper 5 Tahap Seleksi PMB (Progress Bar Interaktif):**
  1. Pengisian Formulir (Selesai - Hijau).
  2. Unggah Dokumen Persyaratan (Dalam Proses - Biru).
  3. Verifikasi Berkas oleh Panitia (Menunggu).
  4. Pengumuman Kelulusan (Terkunci).
  5. Registrasi Ulang Mahasiswa Baru (Terkunci).
- **Pemberitahuan Status Berkas:** Peringatan dokumen apa saja yang masih wajib dilengkapi.

---

### 6.4 Modul Profil Pengguna & Keamanan

#### Layar 4: Halaman Profil Saya (`/profile`)
- **Header Profil:**
  - Cover banner kampus minimalis.
  - Avatar pengguna besar (80px), nama lengkap, role badge utama, dan tanggal bergabung.
- **Tab Navigasi Profil:**
  - *Tab 1: Biodata Akun & Profil Entitas:*
    - Informasi Akun: Username, Email terdaftar, Status akun.
    - Informasi Spesifik Entitas:
      - Mahasiswa: NIM, NIK, Program Studi, Angkatan, Alamat, Nomor HP.
      - Dosen: NIDN, NIP, Gelar Depan, Gelar Belakang, Program Studi Homebase.
      - Admin: NIP, Bagian / Divisi Kerja.
    - Tombol *"Perbarui Data Profil"* (membuka form edit inline atau modal dialog).
  - *Tab 2: Keamanan & Ganti Password:*
    - Form penggantian kata sandi mandiri (*SRS FR-016*).
    - Input: *"Kata Sandi Saat Ini"*, *"Kata Sandi Baru"*, dan *"Konfirmasi Kata Sandi Baru"*.
    - Visual indikator kekuatan password (*Password Strength Meter*).
    - Tombol *"Simpan Kata Sandi Baru"*.
    - Peringatan keamanan: *"Mengganti kata sandi akan mengeluarkan Anda dari sesi aktif di perangkat lain."*

---

### 6.5 Modul Master Data Dasar & Kalender (Khusus Admin Akademik)

Setiap halaman master data wajib menggunakan pola desain **Standard CRUD View**:
- Bagian Atas: Judul Halaman + Breadcrumb + Tombol Utama *"Tambah Data"* (Primary Blue dengan ikon +).
- Bagian Tengah: Search Bar + Filter Bar.
- Bagian Utama: Responsive Data Table dengan paginasi, aksi baris (Lihat/Edit/Hapus).
- Form Aksi: Modal Dialog interaktif dengan validasi form ketat.

#### Layar 5A: Fakultas & Program Studi (`/master/fakultas`)
- **Tabel Fakultas:** Kode Fakultas (FILKOM), Nama Fakultas (Fakultas Ilmu Komputer), Jumlah Prodi, Aksi.
- **Tabel Program Studi:** Kode Prodi (TIF), Nama Prodi (Teknik Informatika), Jenjang (S1), Fakultas Terkait, Aksi.
- **Validasi UX Modal:**
  - Tombol hapus fakultas dinonaktifkan atau memunculkan peringatan jika fakultas tersebut masih memiliki relasi program studi aktif.

#### Layar 5B: Tahun Akademik & Semester (`/master/semester`)
- **Tabel Semester:** Nama Semester (Ganjil 2026/2027), Tahun Akademik, Tipe (GANJIL / GENAP / ANTARA), Tanggal Mulai, Tanggal Selesai, Status (AKTIF / TIDAK AKTIF).
- **Interaksi Kritis (Aktivasi Semester Operasional):**
  - Switch toggle atau tombol *"Set Aktif"*.
  - Membuka modal konfirmasi bahaya (*Danger Confirmation Modal*): *"Peringatan: Mengaktifkan semester ini akan secara otomatis menonaktifkan semester sebelumnya di seluruh sistem kampus. Lanjutkan?"*

#### Layar 5C: Kalender Akademik (`/calendar`)
- **Pilihan Tampilan (View Toggle):** Tampilan Agenda / List View dan Tampilan Timeline / Kalender Bulanan.
- **Elemen Entri Agenda:**
  - Judul Kegiatan (misal: *"Periode Pengisian KRS Mahasiswa"*).
  - Tipe Agenda (KRS, Perkuliahan, UTS, UAS, Nilai, Registrasi Ulang).
  - Rentang Tanggal: `dd MMMM yyyy s/d dd MMMM yyyy`.
  - Status Badge: `DIJADWALKAN` (kuning), `BERJALAN` (hijau), `SELESAI` (abu-abu).
- **Modal Tambah/Edit Agenda:** Form tanggal dengan datepicker range yang intuitif.

#### Layar 5D: Fasilitas Gedung & Ruangan (`/master/fasilitas`)
- **Tab 1 - Gedung:** Kode Gedung, Nama Gedung, Jumlah Lantai, Lokasi.
- **Tab 2 - Ruangan:** Kode Ruangan (LAB-01), Nama Ruangan, Gedung, Kapasitas Mahasiswa, Status Keaktifan.

#### Layar 5E: Kurikulum & Master Mata Kuliah (`/master/kurikulum`)
- **Tabel Kurikulum:** Nama Kurikulum (Kurikulum 2024), Program Studi, Tahun Berlaku, Status Keaktifan.
- **Tabel Mata Kuliah:** Kode MK (TIF101), Nama Mata Kuliah, SKS Total, Rincian SKS (Teori & Praktik), Semester Paket, Jenis (Wajib / Pilihan).

#### Layar 5F: Penawaran Kelas Semester Berjalan (`/master/kelas`)
- **Filter Bar Wajib:** Filter Semester Aktif (default terpilih) + Filter Program Studi.
- **Tabel Kelas:** Kode Kelas (TIF101-A), Nama Mata Kuliah, Dosen Pengampu Utama, Ruangan Kelas, Hari & Jam Perkuliahan, Kapasitas & Kuota Terisi.
- **Modal Buka Kelas:** Form relasi bertingkat (Pilih MK -> Pilih Dosen -> Pilih Ruangan -> Tentukan Jadwal & Kapasitas).

---

### 6.6 Modul Manajemen Pengguna & RBAC (Khusus Super Admin)

#### Layar 6A: Manajemen Pengguna (`/users`)
- **Filter & Search Bar:** Kolom cari (Nama, Username, Email) + Filter Dropdown Role (8 Role) + Filter Status Akun (`ACTIVE`, `INACTIVE`, `SUSPENDED`).
- **Tabel Pengguna:**
  - Kolom: Avatar & Nama Lengkap, Username/NIM/NIDN, Email, Role yang Dimiliki (menampilkan badge multi-role jika > 1), Status Akun (Switch toggle / Badge), Waktu Terakhir Login, Aksi.
- **Modal Detail & Edit Pengguna:**
  - Area informasi akun dasar.
  - Multi-select Checkbox: Penugasan Role (Super Admin, Admin Akademik, Dosen, Mahasiswa, dll.).
  - Radio button status akun: `ACTIVE`, `INACTIVE`, `SUSPENDED` beserta kolom alasan status jika di-suspend.

#### Layar 6B: Matriks Role & Permissions (`/roles`)
- **Matriks Wewenang Visual:**
  - Tabel silang (Grid): Baris memuat daftar Permission sistem (misal `USER_READ`, `MASTER_WRITE`, `CALENDAR_MANAGE`), kolom memuat 8 Role resmi.
  - Indikator visual centang hijau (memiliki hak) dan strip abu-abu (tidak memiliki hak).

---

### 6.7 Modul Jejak Audit (Audit Trail Viewer)

#### Layar 7: Peninjau Audit Log (`/audit-logs`)
- **Filter Pencarian:**
  - Rentang Tanggal (*Date Range Picker*).
  - Filter Aksi (Dropdown: `LOGIN`, `LOGOUT`, `CREATE`, `UPDATE`, `DELETE`, `STATUS_CHANGE`).
  - Filter Entitas (Dropdown: `User`, `Fakultas`, `Semester`, `Kelas`, dll.).
  - Search Input: Cari berdasarkan username aktor atau IP address.
- **Tabel Audit Log:**
  - Kolom: Waktu & Tanggal Server, Aktor (Nama & Username), Aksi (Badge berwarna sesuai tipe aksi), Entitas & ID Record, Alamat IP & User-Agent, Tombol Aksi *"Detail"*.
- **Modal Inspeksi Perubahan (Diff Inspector Modal):**
  - Tampilan visual perbandingan data: **Data Lama (*Old Values*) vs Data Baru (*New Values*)** dalam format JSON terformat rapi atau visual side-by-side diff.

---

## 7. Desain Status Interaksi & Kasus Batas (States & Edge Cases)

Setiap komponen dan layar wajib menyertakan perancangan status interaksi:

### 7.1 Loading States
- **Data Table:** Dilarang menggunakan halaman kosong saat memuat data. Gunakan **Skeleton Rows** (5 baris kotak abu-abu berkedip halus *shimmer effect*).
- **Card Metrik:** Tampilkan *skeleton pulse* pada angka dan label kartu.
- **Button Loading:** Teks tombol berganti atau berdampingan dengan spinner putar 16px, tombol berstatus `disabled`.

### 7.2 Empty States (Kondisi Kosong)
- Tampilkan ilustrasi SVG bergaya minimalis bersih.
- Judul ramah: *"Belum ada data mata kuliah yang ditambahkan"*.
- Deskripsi penjelas dan tombol aksi langsung (CTA), misalnya: *"Mulai buat mata kuliah pertama Anda dengan menekan tombol di bawah."*

### 7.3 Inline Form Errors & Validasi
- Pesan kesalahan muncul tepat di bawah input terkait dengan teks merah 12px dan ikon peringatan kecil.
- Border input berubah menjadi merah lembut (#DC2626).
- Validasi bersifat real-time setelah pengguna meninggalkan kolom (*onBlur*) atau saat form disubmit (*onSubmit*).

### 7.4 Penanganan Kesalahan Sistem (Error Pages)
1. **Error 401 (Sesi Berakhir / Unauthenticated):**
   - Modal pop-up mengambang: *"Sesi Anda telah berakhir demi keamanan. Silakan masuk kembali."* disertai tombol redirect ke `/login`.
2. **Error 403 (Akses Ditolak / Forbidden):**
   - Halaman khusus dengan ilustrasi perisai gembok: *"Anda tidak memiliki wewenang untuk mengakses halaman ini."* + Tombol *"Kembali ke Dasbor"*.
3. **Error 404 (Halaman Tidak Ditemukan):**
   - Ilustrasi angka 404 modern + tombol panduan menuju halaman utama portal.
4. **Error 500 (Kendala Server / Error Boundary):**
   - Banner penjelas ramah: *"Terjadi kendala saat memuat data. Tim IT telah mencatat masalah ini."* + Tombol *"Coba Muat Ulang"*.

---

## 8. Tahapan & Fase Pembuatan Desain UI/UX (6 Fase Bertahap)

Pengerjaan desain UI/UX untuk MVP 1 dirancang dalam 6 fase terstruktur yang selaras dengan siklus handoff tim (*SRS Bab 40*) dan rencana implementasi frontend:

```text
Fase 1: Riset Analisis, User Flow & Information Architecture (IA)
  │
  ▼
Fase 2: Design System Foundations & UI Kit Primitives (Figma Library)
  │
  ▼
Fase 3: Wireframe & Hi-Fi Mockup: Autentikasi, App Shell & Profil
  │
  ▼
Fase 4: Hi-Fi Mockup: 6 Varian Dasbor Kontekstual Berbasis Role
  │
  ▼
Fase 5: Hi-Fi Mockup: Master Data Dasar, Kalender, RBAC & Jejak Audit
  │
  ▼
Fase 6: Prototyping Interaktif, States/Edge Cases, Review & Developer Handoff
```

---

### 🔍 Fase 1: Riset Analisis, User Flow & Information Architecture (IA)
**Fokus:** Memastikan pemahaman mendalam terhadap kebutuhan 8 persona pengguna, aturan bisnis akademik, dan alur perjalanan pengguna (*user journeys*).
- **Aktivitas Utama:**
  - Membedah spesifikasi pada PRD (*Bab 2, 3, 5*) dan SRS (*Bab 3, 4, 9, 10, 22, 28, 29, 30, 31*).
  - Menyusun **User Flow Diagram** komprehensif:
    1. *Alur Autentikasi:* Login multi-kredensial, penolakan akun inaktif, lupa password, ganti password mandiri.
    2. *Alur Navigasi Portal & Multi-Role:* Login -> Evaluasi modul -> Masuk Dashboard -> Switch Peran aktif via Topbar -> Re-render navigasi.
    3. *Alur Master Data & Semester Operasional (Admin Akademik):* Input master data -> Aktivasi Semester -> Konfirmasi bahaya.
    4. *Alur RBAC & Manajemen Akun (Super Admin):* Filter user -> Ganti status akun -> Edit role wewenang -> Verifikasi audit trail.
  - Memvalidasi **Information Architecture (IA)** dan Sitemap Portal MVP 1 (*SRS Bab 29*).
  - Merancang sketsa cepat / *Low-Fidelity Wireframes* untuk validasi tata letak awal bersama System Analyst.
- **Deliverables / Output:**
  - Dokumen/Frame User Flow Diagram di Figma.
  - Wireframe Lo-Fi layout dasar App Shell dan Login.
  - Konfirmasi baseline IA dari tim pengembang dan analis sistem.

---

### 🎨 Fase 2: Design System Foundations & UI Kit Primitives (Figma Library)
**Fokus:** Membangun fondasi visual, token desain, dan pustaka komponen atomik yang terstandarisasi sebelum mendesain layar penuh.
- **Aktivitas Utama:**
  - Setup **Figma Color Styles & Variables** dua palet: (1) Portal Login & Landing — Dark-Mode Navy (Primary Background gradient #0D1B2A→#1B2A4A, Primary Accent #3B82F6/#4F46E5, Secondary Accent #38BDF8/#06B6D4, Status & Security #10B981, Card Background #FFFFFF, Text Primary #1F2937, Text Muted #6B7280/#9CA3AF) sesuai `DESIGN_SYSTEM.md`; (2) Operasional — Brand Primary Navy/Royal Blue, Neutrals (Surface 0-900), Semantic Status (Active/Success, Warning, Destructive, Info, Suspended).
  - Setup **Typography Scale** ganda: Inter / Plus Jakarta Sans — hierarki Portal (Hero Title H1, Card Title H2, Section Header/Sub-title, Form Labels & Captions, Body Text) dan Operasional (Display, Title, Subtitle, Body, Caption, Monospace) dengan line-height dan letter-spacing presisi.
  - Setup **Spatial Tokens**: Grid 8pt (kelipatan 4px/8px), batas padding, gutter, margin breakpoint (Desktop 1440px, Tablet 768px, Mobile 375px).
  - Setup **Elevation & Border Radius Tokens**: Radius `sm`, `md`, `lg`, `xl`, `2xl`, `full` dan bayangan 4 level; tambahan *Soft Elevation Drop Shadow* khusus Login Form Card portal.
  - Pembuatan komponen **Atomic Design** dengan varian lengkap dan *Auto Layout*:
    - *Atoms:* Button (Primary [termasuk Primary Portal gradient], Outline, Destructive, Ghost, Icon, Loading), Input Field, Password Input (Show/Hide), Dropdown/Select, Checkbox, Switch Toggle, Badges (termasuk "Portal Resmi" Emerald), Avatar, Tooltip.
    - *Molecules:* Search & Filter Bar, Stat Metric Card, Statistik Card Module (Portal: 40+/100%/24/7), Integrasi Sistem Badges Container, Pagination Controls, Toast Alert Banner.
    - *Organisms:* Portal Navbar (Brand Logo/Search/Nav Links/Pill "MASUK SSO"), Login Form Card, Data Table container (Header sortable, row hover, action icons), Modal Dialog primitives (Confirm Danger & Form Modal), Floating Action Button (FAB Help Center).
- **Deliverables / Output:**
  - Halaman `02. Foundations` dan `03. Component Library` lengkap di file Figma.
  - Komponen mendukung penuh Figma *Variants*, *Component Properties*, dan *Auto Layout 5.0*.

---

### 🔐 Fase 3: Wireframe & Hi-Fi Mockup: Autentikasi, App Shell & Profil
**Fokus:** Merancang titik masuk utama sistem, kerangka antarmuka global, dan halaman manajemen identitas pengguna.
- **Aktivitas Utama:**
  - **Modul Autentikasi:**
    - Desain Layar Login Desktop (Dark-Mode Navy gradient #0D1B2A→#1B2A4A; dua kolom: hero/branding di kiri, Login Form Card putih mengambang di kanan dengan *Soft Elevation Drop Shadow*, Border Radius 16px; Portal Navbar, Statistik Card Module, Integrasi Sistem Badges Container, dan FAB Help Center).
    - Desain Layar Login Mobile (Single column: navbar, hero, lalu Login Form Card putih bersih responsif pada latar navy).
    - Desain Layar Lupa Password (Dark-Mode Navy, Login Form Card putih terpusat) & Konfirmasi Pengiriman Instruksi Email.
  - **App Shell & Global Navigation:**
    - Global Topbar: Logo resmi, nama portal, badge semester aktif terpasang (*"🟢 Semester Ganjil 2026/2027"*), Role Switcher dropdown dinamis, unread notification bell, menu user dropdown.
    - Responsive Sidebar: Mode expanded (260px) dan mode icon-only collapsed (72px) pada desktop; mode slide-over drawer pada mobile/tablet.
    - Breadcrumb navigation & page header banner.
  - **Modul Profil Pengguna & Keamanan (`/profile`):**
    - Cover banner minimalis, avatar besar, badge role utama.
    - Tab 1: Biodata Akun & Biodata Entitas Spesifik (Mahasiswa, Dosen, Admin, Calon Mhs) beserta form edit inline/modal.
    - Tab 2: Keamanan Akun & Form Ganti Password Mandiri dilengkapi *Password Strength Meter* dan indikator syarat keamanan.
- **Deliverables / Output:**
  - Halaman `04. Auth Flow`, `05. App Shell & Navigation`, dan `07. Profile & Security` di Figma.
  - Tersedia varian desktop (1440px) dan mobile (375px).

---

### 📊 Fase 4: Hi-Fi Mockup: 6 Varian Dasbor Kontekstual Berbasis Role
**Fokus:** Menghadirkan pengalaman personal (*personalized dashboard experience*) yang disesuaikan secara presisi dengan kebutuhan masing-masing dari 6 varian aktor.
- **Aktivitas Utama:**
  - **Dasbor Mahasiswa:** Header salam personal, Kartu Ringkasan Akademik (Prodi, Semester, Status Aktif), Kartu Kontak Dosen PA/Wali, Banner Status KRS & Kalender, Launcher Card SIA & SPADA, List kalender agenda terdekat.
  - **Dasbor Dosen & Dosen Wali:** Rekap biodata bergelar, 3 kartu metrik pengajaran (Kelas diampu, Beban SKS, Total Mahasiswa PA), Tabel/Card jadwal mengajar semester aktif, Widget ringkasan mahasiswa bimbingan PA.
  - **Dasbor Admin Akademik:** 4 Kartu metrik utama (Total Mhs aktif, Dosen aktif, Prodi/Fakultas, Kelas aktif), Kartu penanda status semester operasional berjalan, Tombol pintasan master data (*Quick Actions*), Tabel log agenda berjalan.
  - **Dasbor Admin LMS:** 4 Kartu metrik e-learning SPADA (Kelas daring aktif, Dosen LMS aktif, Pertemuan terbit, Penugasan/Kuis berjalan), Ringkasan aktivitas pembelajaran harian.
  - **Dasbor Super Admin:** 4 Kartu metrik sistem (Total user dengan rincian status, Distribusi 8 role, Log aktivitas hari ini, Status integritas sistem), Snapshot 5 jejak audit terkini, Pintasan kelola akun.
  - **Dasbor Calon Mahasiswa (PMB):** Kartu identitas pendaftaran (No. Pendaftaran & Prodi pilihan), Stepper 5 tahapan pendaftaran PMB interaktif, Alert status kelengkapan berkas.
- **Deliverables / Output:**
  - Halaman `06. Contextual Dashboards` di Figma memuat 6 varian lengkap untuk resolusi desktop dan mobile.

---

### 🏫 Fase 5: Hi-Fi Mockup: Master Data Dasar, Kalender, RBAC & Jejak Audit
**Fokus:** Merancang antarmuka operasional data intensif (*data-dense screens*) dengan kemudahan input, pencarian cepat, dan kejelasan alur manipulasi data bagi Admin dan Super Admin.
- **Aktivitas Utama:**
  - **Modul Master Kelembagaan & Fasilitas:**
    - Master Fakultas & Program Studi (Data table, filter fakultas, modal add/edit prodi bertingkat).
    - Master Fasilitas: Gedung dan Ruangan Kelas (Tab switch, kapasitas, status).
  - **Modul Master Waktu & Akademik:**
    - Master Tahun Akademik & Semester: Tabel data dan interaksi tombol **Aktivasi Semester** dengan modal peringatan konfirmasi bahaya (*Danger Modal Confirmation*).
    - Master Kurikulum & Mata Kuliah: Tabel kurikulum, tabel mata kuliah dengan rincian SKS Teori/Praktik, filter prodi.
    - Pembukaan Penawaran Kelas: Tabel penawaran semester aktif, form modal pembukaan kelas (pilih MK, Dosen, Ruangan, Jam).
  - **Modul Kalender Akademik:**
    - Penampil Kalender Agenda List view dan Timeline view dengan badge status agenda (`DIJADWALKAN`, `BERJALAN`, `SELESAI`).
    - Modal tambah/edit agenda kampus.
  - **Modul Manajemen Pengguna & RBAC (Super Admin):**
    - Tabel pengguna (Server pagination, search multi-koleksi, filter role & status akun).
    - Modal Edit Pengguna (Toggle status `ACTIVE`/`INACTIVE`/`SUSPENDED`, multi-select penugasan role).
    - Matriks Visual Wewenang Role & Permission.
  - **Modul Jejak Audit (Audit Trail):**
    - Tabel riwayat log audit (Filter tanggal, aksi, entitas, user).
    - Modal Inspeksi JSON Diff (*Old Values vs New Values Diff Inspector*).
- **Deliverables / Output:**
  - Halaman `08. Master Data Akademik & Fasilitas`, `09. Kalender Akademik`, dan `10. User Management & Audit Log` di Figma.

---

### ✨ Fase 6: Prototyping Interaktif, States/Edge Cases, Review & Developer Handoff
**Fokus:** Menghubungkan alur prototipe interaktif, mendesain seluruh status batas (*edge cases*), melakukan validasi keselarasan dengan PRD/SRS, serta menyiapkan aset serah terima (*handoff*) untuk tim frontend.
- **Aktivitas Utama:**
  - **Desain Status Batas & Interaksi (States & Edge Cases):**
    - *Loading State:* Komponen Skeleton Shimmer untuk seluruh tabel data dan kartu metrik dasbor.
    - *Empty State:* Ilustrasi SVG minimalis ramah pengguna untuk tabel/list yang belum memiliki data beserta tombol CTA.
    - *Validation Error:* Inline error message di bawah form input dan border merah lembut.
    - *Error Screens:* Layar kustom responsif untuk `401 Unauthorized`, `403 Forbidden`, `404 Not Found`, dan `500 Server Error`.
  - **Interactive Prototyping (Figma Smart Animate):**
    - Alur login kredensial -> redirect ke Dasbor peran terkait.
    - Interaksi Role Switcher pada Topbar untuk beralih konteks peran secara instan.
    - Interaksi buka modal (Tambah Data, Konfirmasi Aktivasi Semester, Edit User, Inspeksi Audit Diff).
    - Interaksi expand/collapse sidebar navigasi.
  - **Design Review & Quality Gates:**
    - Verifikasi kepatuhan terhadap [PRD.md](PRD.md) dan [SRS.md](SRS.md) (*Bab 30 Page Specification & Bab 31 Role Matrix*).
    - Verifikasi kontras warna WCAG 2.1 AA menggunakan plugin Figma (*Stark / Contrast Checker*).
  - **Developer Handoff Preparation:**
    - Penataan layer rapi dengan penamaan semantik (*PascalCase* untuk komponen, deskriptif untuk frame).
    - Penambahan anotasi teknis (*Dev Mode Notes*): Spesifikasi spasi, padding, perilaku hover, aturan validasi, dan rujukan endpoint backend yang terkait.
    - Ekspor aset grafis (Logo UPGRIS, favicon, ilustrasi empty state) dalam format SVG dan WebP.
- **Deliverables / Output:**
  - Link Figma Interactive Prototype siap uji.
  - Halaman `11. States, Edge Cases & Error Screens` selesai.
  - Dokumentasi Handoff Checklist yang telah disetujui oleh Lead Designer, System Analyst, dan Frontend Lead.

---

## 9. Panduan File Serah Terima Figma (Design Deliverables Checklist)

UI/UX Designer wajib menyusun file Figma sesuai standar serah terima berikut:

### 8.1 Struktur Halaman File Figma
```text
📦 RPL-LMS Figma Project
├── 🎨 01. Cover & Project Info
├── 📐 02. Foundations (Colors, Typography, Elevation, Spacing, Icons)
├── 🧩 03. Component Library (Atoms, Molecules, Organisms)
├── 🔐 04. Auth Flow (Login, Forgot Password, Reset Password)
├── 🧭 05. App Shell & Navigation (Topbar, Sidebar Responsive)
├── 📊 06. Contextual Dashboards (6 Varian Role)
├── 👤 07. Profile & Security
├── 🏫 08. Master Data Akademik & Fasilitas
├── 📅 09. Kalender Akademik
├── 🛡️ 10. User Management & Audit Log
└── ⚠️ 11. States, Edge Cases & Error Screens
```

### 8.2 Checklist Kualitas Desain (Quality Gates)
- [ ] Seluruh komponen menggunakan fitur **Auto Layout** (Figma) dengan padding dan gap yang konsisten sesuai kelipatan 8pt.
- [ ] Seluruh warna dan gaya font terdaftar sebagai **Figma Styles / Variables** resmi (tidak ada hardcoded hex di luar token).
- [ ] Seluruh komponen input dan button memiliki varian lengkap: *Default, Hover, Active, Focus, Disabled, Loading*.
- [ ] Tersedia mockup responsif minimal untuk 2 breakpoint: **Desktop (1440px)** dan **Mobile (375px/390px)**.
- [ ] Prototipe interaktif mencakup alur login, pergantian role pada role switcher, pembukaan modal tambah data, dan filter data table.
- [ ] Spesifikasi teks penjelasan (*Design Notes*) telah dicantumkan di samping frame untuk memandu developer frontend mengenai aturan interaksi.
