# LAPORAN SPESIFIKASI DESAIN SYSTEM (UI/UX)

# DOKUMEN PERANCANGAN HALAMAN LOGIN & LANDING PORTAL "MEMBANGUN NEGERI"

## 1. PALET WARNA (COLOR PALETTE)

Penggunaan warna pada antarmuka ini mengusung tema *Dark-Mode Professional* dengan sentuhan *Electric Accent* untuk menciptakan kesan tepercaya, modern, dan bernuansa teknologi tinggi.

| Kategori Warna | Kode Hex | Deskripsi & Penggunaan |
| --- | --- | --- |
| Primary Background | #0D1B2A – #1B2A4A | Gradient Biru Gelap / Navy. Digunakan sebagai latar belakang utama halaman. |
| Primary Accent | #3B82F6 / #4F46E5 | Royal / Electric Blue. Digunakan pada tombol aksi utama (Masuk Sekarang), checkbox, dan tombol SSO. |
| Secondary Accent | #38BDF8 / #06B6D4 | Cyan / Aqua Blue. Digunakan untuk teks highlight ("Melalui Merdeka Belajar") dan garis aktif. |
| Status & Security | #10B981 | Emerald Green. Digunakan untuk badge "Portal Resmi", indikator "SSL Terenkripsi", dan tombol Help Center. |
| Card Background | #FFFFFF | Solid White. Digunakan sebagai kontainer utama form login agar kontras dengan latar belakang. |
| Text Primary | #1F2937 | Dark Slate / Neutral Gray. Teks utama pada form login (heading dan label). |
| Text Muted | #6B7280 / #9CA3AF | Neutral Muted Gray. Digunakan untuk placeholder, deskripsi sekunder, dan teks footer. |

## 3. TIPOGRAFI (TYPOGRAPHY)

Sistem tipografi menggunakan keluarga huruf **Sans-Serif Modern** (seperti *Plus Jakarta Sans*, *Inter*, atau *Poppins*) untuk memastikan keterbacaan yang tinggi pada berbagai ukuran layar.
- **Hero Title (H1):**
  - **Ukuran:** 32pt – 36pt
  - **Weight:** Bold (700)
  - **Warna:** Pure White (#FFFFFF) & Cyan Highlight (#38BDF8)
  - **Penggunaan:** Judul Utama ("Membangun Negeri Melalui Merdeka Belajar")
- **Card Title (H2):**
  - **Ukuran:** 20pt – 24pt
  - **Weight:** Bold / Semi-Bold (600–700)
  - **Warna:** Dark Slate (#1F2937)
  - **Penggunaan:** Judul Formulir SSO ("Single Sign On")
- **Section Header / Sub-title:**
  - **Ukuran:** 13pt – 15pt
  - **Weight:** Semi-Bold (600)
  - **Warna:** Light Blue / Cyan (#38BDF8)
  - **Penggunaan:** Badge Kategori ("TRANSFORMASI PENDIDIKAN INDONESIA")
- **Form Labels & Captions:**
  - **Ukuran:** 10pt – 11pt
  - **Weight:** Semi-Bold (600), Uppercase
  - **Warna:** Gray (#4B5563)
  - **Penggunaan:** Label field ("NIM / ID PENGGUNA", "KATA SANDI")
- **Body Text / Paragraph:**
  - **Ukuran:** 12pt – 14pt
  - **Weight:** Regular (400)
  - **Warna:** Off-White / Muted Gray
  - **Penggunaan:** Teks deskripsi deskriptif di sebelah kiri

## 4. PUSTAKA KOMPONEN (COMPONENT LIBRARY)

### 4.1 Navigasi (Navbar)

- **Brand Logo & Label:** Terletak di pojok kiri atas, terdiri dari ikon portal, nama sistem "Membangun Negeri", dan sub-teks "Portal Kampus Merdeka & Inovasi Belajar".
- **Search Input Field:** Kolom pencarian di tengah navbar dengan ikon *magnifying glass* ("Cari program Merdeka Belajar...").
- **Navigation Links:** Menu navigasi horizontal yang mencakup: *Beranda* (aktif/terpilih), *Program*, *Kegiatan*, *Berita*, *Kontak*, dan *FAQ*.
- **Navbar Action Button:** Tombol berbentuk kapsul (*pill*) bertuliskan **"MASUK SSO"** di bagian kanan atas.

### 4.2 Form Input (Input Form)

- **Field NIM / ID Pengguna:**
  - Type: Text Input
  - Prefix Icon: User / Profile Icon
  - Border: Rounded Light Gray (#D1D5DB)
  - Placeholder: "24670097"
- **Field Kata Sandi:**
  - Type: Password Input
  - Prefix Icon: Lock Icon
  - Suffix Icon: Eye Icon (Show/Hide Password Toggle)
  - Placeholder: ••••••••••••
- **Checkbox:**
  - Checkbox interaktif untuk fitur "Ingat sesi saya", berdampingan dengan indikator status keamanan "SSL Terenkripsi".

### 4.3 Kartu & Modul (Card Components)

- **Login Form Card:**
  - Background: Solid White (#FFFFFF)
  - Border Radius: 16px (Rounded Large)
  - Shadow: *Soft Elevation Drop Shadow* untuk memberikan efek mengapung dari background gelap.
- **Statistik Card Module:**
  - Tiga blok statistik ringkas di bawah teks utama hero:
  - **40+** Mitra Industri Aktif
  - **100%** Konversi SKS Diakui
  - **24/7** Akses Portal Terpadu
- **Integrasi Sistem Badges Container:**
  - Modul khusus di bagian bawah yang memuat daftar sistem terintegrasi (SIA, SPADA, SIP, SIKAP, SI-KEMAS, GC).

### 4.4 Tombol & Tautan (Button & Links)

- **Primary Button ("Masuk Sekarang"):**
  - Type: Full-width Button
  - Color: Blue Accent (#3B82F6)
  - Radius: 8px / Rounded
  - Icon: Right Arrow (→)
- **Floating Action Button (FAB):**
  - Tombol melayang di pojok kanan bawah halaman.
  - Color: Emerald Green (#10B981)
  - Icon: WhatsApp / Support Icon
  - Text: **"PUSAT LAYANAN / HELP CENTER"**
- **Text Links:**
  - Tautan interaktif mencakup: "Buat Akun", "Reset Password via Email", dan "Panduan Login".
