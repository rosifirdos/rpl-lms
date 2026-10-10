# Product Requirements Document (PRD) - SPADA (Learning Management System)

- **Nama Produk:** SPADA (Learning Management System)
- **Institusi:** Universitas PGRI Semarang (UPGRIS)
- **Tim Pengembang:** Team Membangun Negeri
- **Target Pengguna (Aktor):** Mahasiswa, Dosen, dan Admin (Role Tunggal)
- **Status Dokumen:** Revisi Produk Final — Fokus Eksklusif pada Modul SPADA LMS Standalone (Sesuai SRS.md & Arahan System Analyst)

---

## 1. Latar Belakang & Visi Produk

### 1.1 Visi Produk
Menyediakan platform **Learning Management System (SPADA LMS)** yang mandiri (*standalone*), tangkas, dan andal bagi civitas akademika Universitas PGRI Semarang. Sistem dirancang untuk menyederhanakan dan mengoptimalkan seluruh proses pembelajaran digital (daring maupun bauran/*blended learning*) tanpa ketergantungan pada birokrasi modul administrasi kampus yang kompleks.

### 1.2 Latar Belakang & Perubahan Ruang Lingkup
Berdasarkan arahan revisi analis sistem (*System Analyst*) dan penyesuaian pada dokumen **SRS.md**, seluruh modul dan portal eksternal yang berada di luar kegiatan pembelajaran digital—meliputi:
- Sistem Informasi Akademik (SIA),
- Penerimaan Mahasiswa Baru (PMB),
- Pengajuan dan persetujuan KRS manual oleh Dosen Wali/PA,
- Kartu Hasil Studi (KHS) dan Transkrip Nilai Akademik,
- Administrasi dan pendaftaran Sidang Tugas Akhir/Skripsi,

**resmi ditiadakan dan dikeluarkan dari ruang lingkup produk**.

Sistem SPADA kini beroperasi secara independen dan terfokus pada:
1. **Pengelolaan Profil Pengguna Mandiri:** Pembaruan data diri, kontak, foto profil, dan kata sandi akun secara mandiri.
2. **Central Timeline Pembelajaran:** Pusat visualisasi agenda dan tenggat waktu (*deadline*) tugas terdekat, jadwal kuis, pertemuan, dan ujian yang disinkronisasi waktu server.
3. **Sistem Validasi Berkas Keamanan (File Security):** Penolakan otomatis berkas unggahan di luar format `.pdf`, `.docx`, `.xlsx`, `.zip` atau melebihi batas ukuran (default 5MB–10MB) serta penyimpanan terproteksi (*private storage*).
4. **Standar Penilaian Tugas Berbasis Skor SPADA (0–100):** Evaluasi tugas mahasiswa menggunakan skor numerik transparan (0–100) disertai feedback dosen.
5. **Direct Enrollment Mahasiswa oleh Admin:** Penataan kepesertaan kelas dilakukan secara langsung oleh Admin tanpa alur pengisian/persetujuan KRS.
6. **Struktur Pembelajaran 16 Pertemuan Terstruktur:** Silabus perkuliahan baku yang membagi semester menjadi Pertemuan 1–7 (pembelajaran pra-UTS), Pertemuan 8 (UTS), Pertemuan 9–15 (pembelajaran pasca-UTS), dan Pertemuan 16 (UAS).
7. **Presensi Digital Terkendali:** Dosen memegang kendali pembukaan dan penutupan sesi kehadiran; akumulasi persentase kehadiran dihitung otomatis.
8. **Gatekeeping Evaluasi Ujian (UTS & UAS):** Persyaratan ambang batas kehadiran minimum (misal $\ge 70\%$) sebagai pengunci akses otomatis soal ujian.
9. **Jejak Audit (Audit Trail):** Pencatatan riwayat perubahan data sensitif (skor nilai, enrollment, user, konfigurasi sistem).

---

## 2. Ruang Lingkup Produk (Product Scope)

### 2.1 Modul Dalam Ruang Lingkup (In-Scope)
Produk SPADA LMS mencakup 13 modul fungsional inti:

1. **Modul Autentikasi & Akun:** Login terproteksi, logout, reset kata sandi, dan penegakan peran (*Role-Based Access Control*).
2. **Modul Profil Pengguna:** Pengelolaan informasi akun, identitas pribadi, foto profil (maks 2MB, format gambar), dan penggantian kata sandi.
3. **Modul Central Timeline:** Kalender kronologis dan widget dashboard untuk batas waktu tugas, jadwal kuis, ujian, dan sesi pertemuan aktif.
4. **Modul Manajemen Mata Kuliah & Kelas:** Pengelolaan master mata kuliah, kelas perkuliahan per semester, dan penetapan dosen pengampu oleh Admin.
5. **Modul Direct Enrollment (Admin):** Pendaftaran dan pencabutan mahasiswa ke kelas secara langsung (individual maupun batch) tanpa alur KRS manual.
6. **Modul Ruang Kelas 16 Pertemuan:** Organisasi silabus terstruktur Pertemuan 1 s.d. Pertemuan 16 (P-8 untuk UTS, P-16 untuk UAS).
7. **Modul Materi Pembelajaran:** Unggah bahan ajar, modul, dokumen perkuliahan oleh dosen, serta pengunduhan aman oleh mahasiswa terdaftar.
8. **Modul Tugas & Validasi Berkas:** Penerbitan penugasan, batas waktu, pengumpulan submission mahasiswa dengan validasi ketat (.pdf/.docx/.xlsx/.zip, 5MB–10MB), serta status keterlambatan (*Late Submission*).
9. **Modul Penilaian Tugas SPADA (Skor 0–100):** Lembar penilaian bagi dosen untuk menginput skor numerik (0–100) dan catatan feedback evaluasi.
10. **Modul Presensi Digital:** Pembukaan dan penutupan sesi presensi oleh dosen, pencatatan status kehadiran mahasiswa (Hadir, Izin, Sakit, Alpa), serta kalkulasi persentase kehadiran per kelas.
11. **Modul Kuis & Evaluasi Ujian (UTS/UAS):** Pengerjaan kuis interaktif dengan timer, serta ujian UTS (P-8) dan UAS (P-16) dengan sistem penguncian otomatis berbasis syarat presensi.
12. **Modul Notifikasi & Pelaporan:** Pemberitahuan sistem untuk deadline tugas, pembukaan presensi, publikasi skor nilai, serta rekapitulasi nilai dan kehadiran kelas.
13. **Modul Konfigurasi Global & Audit Trail:** Pengaturan kebijakan berkas, ambang presensi ujian, serta pencatatan mutasi data kritis sistem ke dalam Audit Log.

### 2.2 Modul di Luar Ruang Lingkup (Out-of-Scope)
Fitur-fitur berikut secara eksplisit **tidak termasuk** dalam sistem SPADA LMS:
- Sistem Penerimaan Mahasiswa Baru (PMB) dan seleksi calon mahasiswa.
- Pemilihan mata kuliah mandiri, pengajuan draf KRS, dan persetujuan KRS oleh Dosen Wali/PA.
- Penerbitan Kartu Hasil Studi (KHS) dan pencetakan Transkrip Akademik kumulatif institusi.
- Administrasi pendaftaran skripsi, pembagian dosen penguji, dan penjadwalan Sidang Tugas Akhir.
- Pengelolaan pembayaran UKT / administrasi keuangan kampus.

---

## 3. Pengguna & Persona Produk (User Personas & Role Matrix)

Sistem menyederhanakan hak akses secara tegas ke dalam **3 peran utama**:

| Peran Pengguna | Deskripsi & Tanggung Jawab Utama | Akses Fungsional Utama |
|---|---|---|
| **Mahasiswa** | Peserta didik yang mengikuti proses pembelajaran pada kelas-kelas SPADA yang telah didaftarkan. | - Memperbarui profil pribadi dan foto profil.<br>- Memantau Central Timeline (deadline tugas, kuis, ujian, pertemuan).<br>- Mengakses kelas hasil *enrollment* Admin.<br>- Mengunduh materi perkuliahan.<br>- Mengunggah berkas tugas yang lolos validasi ekstensi & ukuran.<br>- Mengisi presensi saat sesi dibuka dosen.<br>- Mengerjakan kuis interaktif.<br>- Mengikuti UTS & UAS jika memenuhi syarat kehadiran $\ge 70\%$.<br>- Melihat perolehan skor tugas (0–100) dan catatan feedback dosen. |
| **Dosen** | Tenaga pendidik yang mengampu kelas perkuliahan di SPADA. | - Memperbarui profil pribadi dan foto profil.<br>- Memantau Timeline agenda kelas yang diampu.<br>- Mengelola isi Pertemuan 1 sampai 16.<br>- Mengunggah materi perkuliahan.<br>- Menerbitkan tugas, mengatur bobot, instruksi, dan deadline.<br>- Mengunduh berkas jawaban mahasiswa.<br>- Menilai tugas dengan format skor numerik 0–100 dan feedback.<br>- Membuka dan menutup sesi presensi perkuliahan.<br>- Mengelola kuis dan evaluasi UTS (P-8) serta UAS (P-16).<br>- Melihat rekapitulasi nilai dan kehadiran mahasiswa di kelasnya. |
| **Admin** *(Role Tunggal)* | Pengelola teknis dan operasional sistem (peleburan peran Super Admin, Admin LMS, dan Admin Akademik). | - Mengelola data master pengguna (Mahasiswa, Dosen, Admin).<br>- Mengelola master mata kuliah dan pembukaan kelas perkuliahan.<br>- Menetapkan dosen pengampu pada kelas.<br>- Melakukan **enrollment mahasiswa ke kelas secara langsung**.<br>- Mengonfigurasi parameter sistem (ekstensi file, batas ukuran berkas, ambang kehadiran ujian).<br>- Memantau aktivitas pembelajaran dan audit log keamanan. |

---

## 4. Fitur Utama & Kebutuhan Fungsional (Epics)

### Epic 1: Autentikasi Pengguna & Pengelolaan Profil Mandiri
- **Autentikasi Aman:** Login menggunakan identifier unik (NIM/NIDN/email/username) dan kata sandi yang di-hash dengan Bcrypt/Argon2.
- **Manajemen Sesi:** Mekanisme token kedaluwarsa (JWT/Session Cookie) dan fitur logout aman.
- **Lupa Kata Sandi:** Alur pemulihan kata sandi menggunakan token verifikasi email.
- **Profil Pengguna Mandiri:** Halaman profil bagi setiap aktor untuk memperbarui nomor telepon, bio singkat, dan kata sandi (dengan verifikasi kata sandi lama).
- **Foto Profil / Avatar:** Unggah foto profil pengguna dengan validasi ketat format gambar (`.jpg`, `.jpeg`, `.png`) dan ukuran maksimal 2MB.

### Epic 2: Central Timeline & Dasbor Pembelajaran Cerdas
- **Central Timeline Terpusat:** Halaman dan widget terintegrasi pada dasbor Mahasiswa dan Dosen yang menyajikan seluruh batas waktu dan agenda mendatang secara kronologis berdasarkan waktu server.
- **Indikator Agenda:** Menampilkan batas waktu tugas terdekat, jadwal kuis aktif/mendatang, jadwal pertemuan kelas, dan jadwal UTS/UAS.
- **Aksi Cepat (*Quick Actions*):** Tautan navigasi langsung (*deep link*) dari kartu timeline menuju ruang kelas atau aktivitas penugasan terkait.
- **Filter Timeline:** Kemampuan menyaring agenda berdasarkan mata kuliah atau rentang waktu (Hari Ini, 7 Hari Mendatang, 30 Hari Mendatang).
- **Dasbor Kontekstual:** Menampilkan katalog kelas yang diampu/diikuti, kartu ringkasan aktivitas, indikator tugas yang membutuhkan penilaian (*Need Grading* bagi Dosen), dan persentase progres belajar.

### Epic 3: Manajemen Master Data & Direct Enrollment (Admin)
- **Master Akun Pengguna:** Pengelolaan data akun Mahasiswa, Dosen, dan Admin (tambah, ubah, nonaktifkan, reset kata sandi).
- **Master Mata Kuliah:** Pembuatan master mata kuliah (kode, nama mata kuliah, beban SKS, deskripsi kompetensi).
- **Master Kelas Perkuliahan:** Pembukaan kelas pada semester aktif dan penugasan dosen pengampu.
- **Direct Enrollment Mahasiswa:** Pendaftaran mahasiswa ke kelas secara langsung oleh Admin (baik per mahasiswa maupun secara massal/batch) tanpa alur pengajuan atau persetujuan KRS manual.
- **Pencabutan Kepesertaan (*Unenroll*):** Admin dapat membatalkan pendaftaran kelas mahasiswa jika terjadi perubahan administratif.

### Epic 4: Struktur Ruang Kelas & Silabus 16 Pertemuan Terstruktur
- **Siklus Baku 16 Pertemuan:** Setiap kelas terorganisasi secara wajib ke dalam 16 pertemuan terstruktur:
  - **Pertemuan 1–7:** Aktivitas pembelajaran aktif pra-UTS.
  - **Pertemuan 8:** Pelaksanaan evaluasi Ujian Tengah Semester (UTS).
  - **Pertemuan 9–15:** Aktivitas pembelajaran aktif pasca-UTS.
  - **Pertemuan 16:** Pelaksanaan evaluasi Ujian Akhir Semester (UAS).
- **Fleksibilitas Aktivitas Belajar:** Dosen dapat mengaktifkan materi, tugas, kuis, atau presensi pada tiap pertemuan sesuai rancangan perkuliahan. Aktivitas yang belum diterbitkan disembunyikan dari antarmuka mahasiswa.

### Epic 5: Distribusi Materi Pembelajaran
- **Penerbitan Materi:** Dosen mengunggah materi ajar (slide, modul, panduan praktikum, referensi PDF) pada pertemuan yang bersesuaian.
- **Validasi Berkas Materi:** Berkas materi wajib mematuhi aturan validasi tipe berkas dan batas ukuran maksimal.
- **Pengunduhan Aman:** Mahasiswa yang terdaftar dalam kelas dapat membaca ringkasan materi dan mengunduh berkas lampiran secara aman.

### Epic 6: Manajemen Tugas, Validasi File Ketat & Penilaian Skor SPADA (0–100)
- **Penerbitan Tugas:** Dosen membuat tugas baru dengan parameter: judul, instruksi pengerjaan, berkas soal (PDF), persentase bobot nilai, tenggat waktu (*deadline*), dan opsi toleransi keterlambatan (*allow late*).
- **Sistem Validasi Berkas Keamanan (File Security):**
  - **Format Berkas yang Diizinkan:** Sistem hanya menerima format `.pdf`, `.docx`, `.xlsx`, dan `.zip`. Berkas di luar whitelist ditolak otomatis dengan pesan galat yang jelas.
  - **Batas Ukuran Berkas (*Size Limit*):** Penolakan otomatis oleh sistem jika berkas melebihi batas konfigurasi (default 5MB–10MB).
  - **Verifikasi Ganda:** Validasi ekstensi di sisi klien dan verifikasi MIME-type asli di sisi server.
  - **Penyimpanan Terproteksi:** Berkas disimpan di direktori privat (*private storage*) dengan nama ter-hash unik tanpa akses tautan publik langsung.
- **Pengumpulan Tugas Mahasiswa:** Mahasiswa mengunggah jawaban; sistem mencatat stempel waktu server (*timestamp*) dan menandai status pengumpulan (*On-time* atau *Late Submission*).
- **Pembaruan Berkas Jawaban:** Mahasiswa dapat mengganti berkas jawaban selama belum melewati batas deadline.
- **Lembar Penilaian Skor SPADA (0–100):** Dosen mengunduh berkas jawaban dan menginputkan evaluasi dengan format **skor numerik (skor angka 0 s.d. 100)** beserta komentar feedback perbaikan. Nilai di luar rentang 0–100 ditolak oleh sistem.
- **Transparansi Nilai:** Mahasiswa dapat melihat perolehan skor angka dan catatan feedback dosen secara langsung.

### Epic 7: Presensi Digital & Pengendalian Sesi Perkuliahan
- **Kontrol Pembukaan Sesi:** Dosen membuka sesi presensi pada pertemuan yang sedang berlangsung.
- **Pengisian Presensi:** Mahasiswa yang terdaftar dalam kelas mengisi kehadiran (*Hadir*) saat sesi berstatus terbuka. Mahasiswa tidak dapat mengisi presensi sebelum sesi dibuka atau setelah sesi ditutup.
- **Penutupan Sesi:** Dosen menutup sesi presensi secara manual atau otomatis berdasarkan toleransi durasi kuliah.
- **Koreksi Kehadiran:** Dosen berwenang memperbarui status kehadiran mahasiswa (Hadir, Sakit, Izin, Alpa) jika diperlukan alasan khusus.
- **Akumulasi Persentase Kehadiran:** Sistem menghitung persentase kehadiran mahasiswa secara otomatis per kelas perkuliahan.

### Epic 8: Kuis Interaktif & Evaluasi Ujian Terstruktur (UTS & UAS)
- **Kuis Perkuliahan:** Dosen dapat menyusun kuis interaktif dengan timer otomatis, pengacakan soal, dan kalkulasi nilai otomatis untuk soal pilihan ganda.
- **Evaluasi UTS (Pertemuan 8) & UAS (Pertemuan 16):** Penyelenggaraan ujian terjadwal pada pertemuan khusus.
- **Gatekeeping Persyaratan Kehadiran Ujian:**
  - Sistem memvalidasi akumulasi persentase kehadiran mahasiswa sebelum mengizinkan akses ke lembar soal UTS/UAS.
  - Jika persentase kehadiran mahasiswa berada di bawah ambang batas minimum yang dikonfigurasi (misal $< 70\%$), tombol pengerjaan ujian otomatis **terkunci (*disabled*)** dan menampilkan notifikasi ketidaklayakan kehadiran.
  - Mahasiswa yang memenuhi syarat kehadiran dapat mengakses dan mengumpulkan lembar ujian sesuai jadwal.

### Epic 9: Notifikasi Pembelajaran Terpadu
- Mengirimkan pemberitahuan internal (*in-app notifications*) bagi pengguna saat:
  - Tugas baru diterbitkan pada kelas yang diikuti.
  - Pengingat batas waktu pengumpulan tugas (H-1 sebelum deadline).
  - Sesi presensi perkuliahan dibuka oleh dosen pengampu.
  - Dosen mempublikasikan skor nilai tugas (skor 0–100) dan feedback.
  - Status kehadiran mahasiswa diperbarui oleh dosen.
  - Admin mendaftarkan mahasiswa ke kelas baru (*enrollment notification*).

### Epic 10: Pelaporan, Rekapitulasi Nilai & Progress Belajar
- **Rekapitulasi Kehadiran Kelas:** Tabel rekap kehadiran per mahasiswa dari Pertemuan 1 s.d. 16 beserta persentase total dan status kelayakan ujian.
- **Rekapitulasi Penilaian Kelas:** Kompilasi seluruh skor tugas (0–100) per mahasiswa dalam satu semester untuk bahan penilaian akhir dosen.
- **Progress Pembelajaran:** Pelacakan visual tingkat penyelesaian aktivitas kelas bagi mahasiswa.
- **Ekspor Data:** Fitur ekspor tabel rekapitulasi nilai dan kehadiran ke format spreadsheet (`.xlsx` atau `.csv`).

### Epic 11: Keamanan, Konfigurasi Global & Audit Trail
- **Konfigurasi Global Sistem (Admin):** Panel pengaturan daftar ekstensi file yang diizinkan, batas maksimal ukuran file upload (5MB–10MB), dan ambang batas minimum presensi ujian.
- **Jejak Audit (*Immutable Audit Log*):** Pencatatan otomatis setiap mutasi data krusial:
  - Pengubahan skor nilai tugas mahasiswa.
  - Mutasi enrollment mahasiswa (pendaftaran & pencabutan).
  - Manajemen akun pengguna (pembuatan, perubahan status, pembaruan password).
  - Perubahan parameter konfigurasi global sistem.
- **Metadata Log:** Mencatat ID pengguna pelaku aksi, jenis aksi, entitas sasaran, rincian data sebelum/sesudah, alamat IP, dan stempel waktu server.

---

## 5. Aturan Bisnis Kunci (Key Business Rules)

| ID Aturan | Nama Aturan | Deskripsi & Penegakan Sistem |
|---|---|---|
| **BR-001** | **Independensi SPADA LMS** | Sistem beroperasi murni dan independen sebagai Learning Management System. Seluruh modul administratif di luar LMS (SIA, PMB, KRS, KHS, Transkrip, Sidang) resmi ditiadakan. |
| **BR-002** | **Direct Enrollment oleh Admin** | Pendaftaran mahasiswa ke kelas dikelola secara langsung oleh Admin. Alur pengisian draf dan persetujuan KRS oleh Dosen Wali/PA ditiadakan. |
| **BR-003** | **Otoritas Akses Kelas** | Mahasiswa hanya dapat mengakses ruang kelas, materi, dan aktivitas pada kelas di mana ia telah didaftarkan (*enrolled*) oleh Admin. |
| **BR-004** | **Struktur 16 Pertemuan Wajib** | Setiap kelas perkuliahan wajib memiliki struktur 16 pertemuan: Pertemuan 1–7 (pembelajaran pra-UTS), Pertemuan 8 (UTS), Pertemuan 9–15 (pembelajaran pasca-UTS), dan Pertemuan 16 (UAS). |
| **BR-005** | **Fleksibilitas Aktivitas Belajar** | Materi, Tugas, Kuis, dan Presensi bersifat opsional pada pertemuan pembelajaran (1–7 dan 9–15). Aktivitas yang belum diterbitkan tidak tampil pada antarmuka mahasiswa. |
| **BR-006** | **Standar Penilaian Skor SPADA (0–100)** | Format evaluasi penugasan mahasiswa wajib direpresentasikan menggunakan angka numerik bulat atau desimal dalam rentang 0.00 hingga 100.00 sesuai standar SPADA. |
| **BR-007** | **Whitelist Ekstensi Berkas** | Sistem wajib menolak otomatis unggahan berkas yang ekstensinya berada di luar format yang diizinkan: `.pdf`, `.docx`, `.xlsx`, `.zip`. |
| **BR-008** | **Limit Ukuran Berkas (Size Limit)** | Sistem wajib menolak otomatis unggahan berkas yang ukurannya melebihi batas konfigurasi (default 5MB s.d. 10MB). |
| **BR-009** | **Penyimpanan Berkas Terproteksi** | Seluruh berkas penyerahan tugas mahasiswa wajib disimpan pada penyimpanan privat (*private storage*) dan hanya dapat diunduh melalui endpoint terautentikasi oleh dosen pengampu dan mahasiswa bersangkutan. |
| **BR-010** | **Aturan Pembukaan Presensi** | Mahasiswa hanya dapat mengisi presensi kehadiran jika sesi presensi pertemuan tersebut telah dibuka secara aktif oleh dosen pengampu. |
| **BR-011** | **Aturan Penutupan Presensi** | Sesi presensi yang telah ditutup tidak dapat diisi lagi oleh mahasiswa. Koreksi kehadiran pasca penutupan sesi hanya dapat dilakukan oleh dosen pengampu kelas. |
| **BR-012** | **Gatekeeping Kehadiran UTS & UAS** | Mahasiswa hanya dapat mengakses soal dan lembar pengerjaan UTS (Pertemuan 8) dan UAS (Pertemuan 16) apabila persentase kehadirannya memenuhi ambang batas minimum sistem (default: $\ge 70\%$). |
| **BR-013** | **Kronologi Central Timeline** | Seluruh agenda pada Timeline (tugas, kuis, ujian, pertemuan) wajib diurutkan secara kronologis berdasarkan waktu server resmi guna menjamin keadilan tenggat waktu. |
| **BR-014** | **Pengelolaan Profil Mandiri** | Setiap pengguna (Mahasiswa, Dosen, Admin) berhak mengelola data diri, foto profil (maks 2MB), dan kata sandi akunnya sendiri. |
| **BR-015** | **Audit Trail Mutasi Kritis** | Seluruh tindakan mutasi data penting (skor nilai tugas, pendaftaran enrollment, manajemen akun, perubahan konfigurasi) wajib tercatat pada Audit Log yang tidak dapat diubah (*immutable*). |

---

## 6. Kebutuhan Non-Fungsional & Spesifikasi Keamanan (NFR)

1. **Keamanan Kredensial & Autentikasi (NFR-001):**
   - Kata sandi wajib dienkripsi menggunakan fungsi hash satu arah yang kuat (*Bcrypt* dengan salt rounds $\ge 10$ atau *Argon2id*).
   - Larangan keras menyimpan kata sandi dalam bentuk teks terbuka (*plaintext*).
2. **Kontrol Akses Berbasis Peran / RBAC (NFR-002):**
   - Seluruh endpoint API dan antarmuka web memvalidasi wewenang peran (*Mahasiswa, Dosen, Admin*) berdasarkan prinsip *least privilege*.
3. **Multi-tier File Upload Security (NFR-003):**
   - Validasi berkas dilakukan berlapis: verifikasi ekstensi pada frontend dan validasi MIME-type asli berkas pada backend untuk mencegah *file spoofing*.
   - Larangan mutlak pengunggahan skrip berbahaya (`.exe`, `.sh`, `.php`, `.js`, dll.).
4. **Pembatasan Ukuran Berkas di Sisi Server (NFR-004):**
   - Server membatasi ukuran request payload unggah berkas (maks 10MB) dan menghentikan transfer (*early termination*) dengan status HTTP 413 Payload Too Large jika melebihi batas.
5. **Isolasi Penyimpanan Berkas Privat (NFR-005):**
   - Berkas submission tugas disimpan di direktori privat non-publik dengan penamaan UUID acak.
   - Akses unduh berkas diverifikasi secara ketat melalui middleware otorisasi.
6. **Performa & Waktu Respons (NFR-006):**
   - Waktu respons API rata-rata $\le 2$ detik untuk query reguler dan $\le 3$ detik untuk proses unggah/unduh berkas standar pada beban normal.
7. **Ketersediaan Sistem (NFR-007):**
   - Target ketersediaan (*uptime*) minimal 99% selama jam aktif perkuliahan (07.00 s.d. 22.00 WIB).
8. **Integritas Data Transaksional (NFR-008):**
   - Menggunakan transaksi basis data (*database transactions*) dan integritas referensial (*foreign keys*) untuk memastikan konsistensi mutasi data enrollment, presensi, dan penilaian.
9. **Auditability (NFR-009):**
   - Seluruh tindakan mutasi data nilai, enrollment, dan akun dicatat ke tabel audit log yang bersifat *append-only*.
10. **Desain Antarmuka Responsif (NFR-010):**
    - Antarmuka web mendukung kenyamanan akses melalui layar desktop, tablet, maupun perangkat seluler pintar.

---

## 7. Strategi Peluncuran Produk (MVP Roadmap)

Mengacu pada Bab 27 Dokumen SRS, pengembangan SPADA LMS dibagi ke dalam 5 fase rilis bertahap:

```
[ MVP 1 ] -> Fondasi, Autentikasi, Profil Pengguna & Direct Enrollment (Admin)
    |
[ MVP 2 ] -> Ruang Kelas 16 Pertemuan, Distribusi Materi & Presensi Digital
    |
[ MVP 3 ] -> Manajemen Tugas, Validasi File Ketat & Penilaian Skor SPADA (0–100)
    |
[ MVP 4 ] -> Central Timeline Pembelajaran, Widget Dasbor & Kuis Interaktif
    |
[ MVP 5 ] -> Evaluasi Ujian (UTS P-8 & UAS P-16), Gatekeeping Kehadiran & Audit Trail
    |
[ Pasca-MVP ] -> Forum Diskusi Asinkron & Analitik Pembelajaran Lanjutan
```

### Rincian Fase Rilis:
- **MVP 1 (Fondasi, Akun & Enrollment):**
  - Autentikasi pengguna, manajemen sesi, dan RBAC (Mahasiswa, Dosen, Admin).
  - Modul Profil Pengguna (identitas, foto profil maks 2MB, ganti password).
  - Master data Pengguna, Mata Kuliah, dan pembukaan Kelas perkuliahan.
  - Modul Direct Enrollment mahasiswa ke kelas oleh Admin.
- **MVP 2 (Ruang Kelas, Materi & Presensi):**
  - Antarmuka Ruang Kelas berbasis silabus 16 Pertemuan terstruktur.
  - Modul Materi Pembelajaran (unggah dosen, unduh mahasiswa).
  - Modul Presensi Digital (buka sesi, pengisian kehadiran, tutup sesi, rekapitulasi).
- **MVP 3 (Tugas, Validasi Berkas & Penilaian SPADA):**
  - Modul Tugas Perkuliahan (instruksi, file soal, bobot, batas waktu deadline).
  - Sistem Validasi Berkas Keamanan (whitelist .pdf/.docx/.xlsx/.zip dan limit ukuran 5MB–10MB).
  - Pengumpulan jawaban mahasiswa, pencatatan timestamp, dan private storage.
  - Lembar Penilaian Tugas Dosen berbasis format **skor numerik (0–100)** dan catatan feedback.
- **MVP 4 (Central Timeline & Kuis):**
  - Halaman dan widget Central Timeline Pembelajaran (urutan kronologis deadline tugas, kuis, pertemuan).
  - Modul Kuis Interaktif (pembuatan butir soal, countdown timer, kalkulasi nilai).
  - Modul Notifikasi internal aktivitas pembelajaran.
- **MVP 5 (Evaluasi Ujian, Gatekeeping & Audit Trail):**
  - Pelaksanaan evaluasi UTS (Pertemuan 8) dan UAS (Pertemuan 16).
  - Sistem validasi kehadiran otomatis (*gatekeeping* kehadiran ujian $\ge 70\%$).
  - Rekapitulasi nilai dan kehadiran kelas per semester serta ekspor data (.xlsx/.csv).
  - Modul Audit Trail dan monitoring aktivitas sistem untuk Admin.
- **Pengembangan Pasca-MVP (Opsional):**
  - Forum diskusi interaktif asinkron per kelas atau per pertemuan.
  - Dasbor analitik pembelajaran lanjutan (*Learning Analytics*).

---

## 8. Keputusan Bisnis yang Telah Ditetapkan (Finalized Business Decisions)

Seluruh poin keputusan bisnis yang sebelumnya berstatus terbuka kini telah **ditetapkan secara final** sesuai dengan hasil analisis sistem pada **SRS.md (Bab 30)**:

1. **Cakupan Sistem Mandiri (Standalone LMS):**
   - **Keputusan:** Sistem resmi beroperasi murni sebagai SPADA Learning Management System. Seluruh modul SIA (KRS, KHS, Transkrip, Sidang) dan PMB ditiadakan dari ruang lingkup.
2. **Penyederhanaan Peran & Penghapusan Dosen PA:**
   - **Keputusan:** Hak akses disederhanakan menjadi 3 peran: **Mahasiswa**, **Dosen**, dan **Admin (Role Tunggal)**. Peran Dosen Wali/PA dan varian admin multirangkap resmi ditiadakan.
3. **Mekanisme Enrollment Kelas:**
   - **Keputusan:** Pendaftaran mahasiswa ke kelas dilakukan secara langsung (*direct enrollment*) oleh Admin tanpa proses pengisian draf atau persetujuan KRS manual.
4. **Standar Penilaian Tugas:**
   - **Keputusan:** Penilaian tugas wajib direpresentasikan menggunakan format **skor numerik berstandar SPADA (0–100)** disertai catatan feedback dosen.
5. **Kebijakan Keamanan & Format Berkas Tugas:**
   - **Keputusan:** Berkas unggahan wajib dibatasi pada ekstensi `.pdf`, `.docx`, `.xlsx`, `.zip` dengan batasan ukuran maksimal 5MB–10MB. Berkas di luar kriteria ditolak secara otomatis oleh sistem.
6. **Struktur Siklus Pertemuan:**
   - **Keputusan:** Perkuliahan menggunakan struktur baku 16 pertemuan, dengan alokasi khusus Pertemuan 8 untuk UTS dan Pertemuan 16 untuk UAS.
7. **Prasyarat & Gatekeeping Ujian:**
   - **Keputusan:** Mahasiswa wajib memenuhi ambang batas persentase kehadiran minimum (default $\ge 70\%$) untuk dapat membuka dan mengikuti evaluasi UTS dan UAS.
8. **Pengelolaan Profil Mandiri:**
   - **Keputusan:** Setiap pengguna memiliki wewenang untuk memperbarui data identitas pribadi, mengunggah foto profil (maks 2MB), dan memperbarui kata sandi secara mandiri.
9. **Kewajiban Jejak Audit (*Audit Trail*):**
   - **Keputusan:** Setiap mutasi data kritis (skor tugas, kepesertaan enrollment, akun pengguna, konfigurasi global) wajib dicatat dalam Audit Log yang bersifat *immutable*.

---

*Dokumen PRD ini disahkan sebagai pedoman acuan produk resmi yang selaras 100% dengan Software Requirements Specification (SRS.md) Universitas PGRI Semarang.*
