# SOFTWARE REQUIREMENT SYSTEM (SRS)

## SISTEM: SPADA (LEARNING MANAGEMENT SYSTEM)

### PGRI University of Semarang

#### TEAM MEMBANGUN NEGERI

**Dokumen System Analysis / Software Requirements Specification (SRS)**  
*Revisi Analisis Sistem: Fokus Eksklusif pada Modul SPADA / LMS*

Mencakup kebutuhan Pengguna: **Mahasiswa**, **Dosen**, dan **Admin (Role Tunggal)**.

---

# 1. PENDAHULUAN

## 1.1 Latar Belakang & Tujuan
Sistem dirancang murni sebagai **Learning Management System (LMS) berbasis SPADA** untuk mengelola proses pembelajaran secara terpusat, efektif, dan terstruktur. Berdasarkan arahan revisi analis sistem (*System Analyst*), seluruh portal dan sistem eksternal yang berada di luar kegiatan pembelajaran digital—seperti Sistem Informasi Akademik (SIA), Penerimaan Mahasiswa Baru (PMB), pengajuan KRS manual, KHS, transkrip, dan administrasi sidang tugas akhir—**telah resmi dihapus dari ruang lingkup sistem**.

Fokus utama SPADA adalah menyediakan sarana perkuliahan daring dan bauran (*blended learning*) yang handal bagi civitas akademika Universitas PGRI Semarang, mencakup pengelolaan profil pengguna, agenda timeline pembelajaran, distribusi materi ajar, pengumpulan tugas dengan validasi berkas yang ketat, evaluasi penilaian berstandar skor SPADA (0–100), kuis interaktif, presensi digital, serta pelaksanaan evaluasi UTS dan UAS berbasis pertemuan terstruktur.

## 1.2 Identifikasi Masalah
- Kebutuhan akan platform pembelajaran daring mandiri (*standalone*) yang tangkas tanpa ketergantungan birokrasi modul administrasi kampus yang kompleks.
- Mahasiswa dan dosen membutuhkan pusat visualisasi agenda (*Timeline*) terpadu untuk memantau tenggat waktu (*deadline*) tugas, jadwal kuis, pertemuan, dan ujian agar tidak terlewat.
- Proses pengumpulan berkas tugas dan materi membutuhkan proteksi keamanan melalui validasi otomatis terhadap tipe/ekstensi file dan pembatasan ukuran berkas (*size limit*) untuk mencegah kegagalan sistem dan celah keamanan.
- Penilaian tugas memerlukan standarisasi format nilai numerik (*score* 0–100) yang transparan dan seragam sesuai standar baku SPADA.
- Perlunya penyederhanaan manajemen kelas dan peserta perkuliahan (*enrollment*) yang dikelola langsung oleh administrator sistem tanpa alur pengisian dan persetujuan KRS manual.

## 1.3 Tujuan Sistem
- Menyediakan platform SPADA LMS independen dengan performa tinggi dan antarmuka yang intuitif.
- Mengelola data master pengguna, mata kuliah, kelas, dan kepesertaan (*enrollment*) mahasiswa secara terpusat oleh Admin.
- Menyediakan fitur Profil Pengguna mandiri bagi seluruh aktor (Admin, Dosen, Mahasiswa) untuk memperbarui identitas diri, foto profil, dan kata sandi.
- Menyediakan halaman Timeline Pembelajaran terpusat untuk menampilkan agenda dan tenggat waktu secara kronologis.
- Menyediakan ruang kelas berbasis siklus 16 pertemuan terstruktur (Pertemuan 1–7 pembelajaran, Pertemuan 8 UTS, Pertemuan 9–15 pembelajaran, Pertemuan 16 UAS).
- Menyediakan sistem manajemen tugas dengan validasi berkas otomatis (.pdf, .docx, .xlsx, .zip dan batasan 5MB–10MB) serta evaluasi berbasis skor numerik (0–100).
- Menyediakan pencatatan presensi digital yang dibuka dan ditutup langsung oleh dosen pengampu.
- Mengelola kuis daring dan evaluasi ujian (UTS & UAS) yang terintegrasi dengan validasi ambang kehadiran mahasiswa.

## 1.4 Ruang Lingkup Sistem
Ruang lingkup sistem SPADA LMS meliputi modul-modul berikut:
1. **Profil Pengguna:** Pembaruan data diri, pergantian kata sandi, dan pengelolaan foto profil pengguna.
2. **Timeline Akademik & Pembelajaran:** Pelacakan urutan kronologis batas waktu tugas, jadwal kuis, ujian, dan pertemuan kelas.
3. **Validasi File / Dokumen:** Mekanisme keamanan unggah berkas (tipe file yang diizinkan dan pembatasan ukuran berkas 5MB–10MB dengan penolakan otomatis).
4. **Manajemen Mata Kuliah & Kelas:** Pengelolaan kelas perkuliahan, penetapan dosen pengampu, dan pengaturan parameter kelas.
5. **Enrollment Mahasiswa:** Pendaftaran dan penempatan mahasiswa ke dalam kelas terkait secara langsung oleh Admin.
6. **Pertemuan Terstruktur (Pertemuan 1–16):** Pengaturan silabus pertemuan mingguan, materi, dan aktivitas belajar.
7. **Materi Pembelajaran:** Distribusi modul, bahan ajar, dan dokumen perkuliahan.
8. **Tugas & Penilaian SPADA:** Pembuatan tugas, pengumpulan submission mahasiswa, dan penilaian evaluasi dengan skor numerik 0–100 serta catatan feedback.
9. **Kuis Pembelajaran:** Pembuatan butir soal, pembatasan durasi, dan pengerjaan kuis interaktif.
10. **Presensi Perkuliahan:** Pembukaan sesi presensi oleh dosen, pengisian kehadiran oleh mahasiswa, dan penutupan sesi presensi.
11. **Evaluasi UTS (Pertemuan 8) & UAS (Pertemuan 16):** Pelaksanaan ujian dengan syarat kelayakan persentase kehadiran minimum.
12. **Pemantauan Progress & Nilai:** Ringkasan capaian aktivitas belajar dan rekap nilai mahasiswa.
13. **Administrasi & Keamanan:** Pengelolaan akun pengguna, manajemen peran tunggal Admin, audit log aktivitas, dan kontrol akses aman.

---

# 2. KONSEP DAN ARSITEKTUR SISTEM

Sistem SPADA beroperasi secara mandiri (*standalone*) sebagai Learning Management System. Seluruh entitas dan alur kerja berpusat pada penyelenggaraan proses belajar mengajar.

```
+---------------------------------------------------------------------------------+
|                                 SISTEM SPADA                                   |
|                                                                                 |
|  [ ADMIN ] -----> Master Data (User, Mata Kuliah, Kelas)                        |
|              -----> Direct Enrollment Mahasiswa ke Kelas                       |
|                                                                                 |
|  [ DOSEN ] -----> Kelola Ruang Kelas & 16 Pertemuan                             |
|              -----> Unggah Materi & Rilis Tugas (Bobot, Deadline)               |
|              -----> Buka/Tutup Presensi & Kelola Kuis/Ujian                     |
|              -----> Evaluasi Submission (Validasi File) -> Skor SPADA (0-100)   |
|                                                                                 |
|  [ MAHASISWA ] -> Dashboard & Central Timeline (Deadline, Kuis, Ujian)         |
|              -----> Akses Ruang Kelas (Enrollment Admin)                        |
|              -----> Unduh Materi & Isi Presensi (Saat Sesi Dibuka)              |
|              -----> Unggah Jawaban Tugas (Lolos Validasi Tipe & Ukuran File)     |
|              -----> Kerjakan Kuis & Ikuti UTS/UAS (Syarat Kehadiran)           |
|              -----> Pantau Progress Belajar & Perolehan Skor Numerik (0-100)    |
+---------------------------------------------------------------------------------+
```

Alur pembelajaran utama sistem:
1. **Inisiasi Kelas & Peserta:** Admin membuat data mata kuliah dan kelas, lalu melakukan *enrollment* mahasiswa ke kelas terkait.
2. **Penyusunan Pertemuan:** Dosen pengampu menyiapkan 16 pertemuan, mengunggah materi perkuliahan, dan menjadwalkan tugas atau kuis.
3. **Aktivitas Pembelajaran:** Mahasiswa memantau timeline, mengunduh materi, mengisi presensi yang telah dibuka dosen, dan mengunggah berkas jawaban tugas sebelum batas waktu.
4. **Validasi & Penilaian:** Berkas tugas divalidasi secara otomatis oleh sistem (ekstensi dan ukuran). Dosen memeriksa berkas jawaban dan memberikan nilai berbasis format skor numerik 0–100.
5. **Evaluasi Ujian:** Pada pertemuan 8 (UTS) dan pertemuan 16 (UAS), sistem memvalidasi kelayakan kehadiran mahasiswa sebelum mengizinkan pengerjaan ujian.

---

# 3. AKTOR DAN HAK AKSES

Berdasarkan revisi analis sistem, hak akses disederhanakan secara tegas menjadi **3 peran utama** (Peran Dosen Wali/PA resmi dihilangkan, dan seluruh varian Admin seperti Admin Akademik, Admin LMS, dan Super Admin dilebur menjadi satu peran tunggal Admin):

| Aktor | Deskripsi Peran & Hak Akses Utama |
| --- | --- |
| **Mahasiswa** | Pengguna yang terdaftar sebagai peserta didik pada kelas SPADA. Memiliki hak untuk:<br>- Mengelola profil pribadi (identitas, foto profil, ganti kata sandi).<br>- Memantau Timeline Pembelajaran (deadline tugas, jadwal kuis/ujian, pertemuan).<br>- Mengakses kelas-kelas yang telah dienroll oleh Admin.<br>- Mengunduh materi perkuliahan.<br>- Mengunggah berkas penyerahan (*submission*) tugas yang memenuhi validasi file.<br>- Mengisi presensi kehadiran saat sesi dibuka oleh dosen.<br>- Mengerjakan kuis interaktif.<br>- Mengikuti UTS (pertemuan 8) dan UAS (pertemuan 16) bila memenuhi ambang kehadiran.<br>- Melihat skor tugas (0–100), feedback dosen, dan progress pembelajaran kelas. |
| **Dosen** | Tenaga pendidik yang mengampu kelas perkuliahan. Memiliki hak untuk:<br>- Mengelola profil pribadi (identitas, foto profil, ganti kata sandi).<br>- Memantau Timeline kegiatan dan deadline tugas kelas yang diampu.<br>- Mengatur struktur 16 pertemuan pada kelas yang diampu.<br>- Mengunggah dan mengelola materi perkuliahan (dokumen, modul, tautan).<br>- Menerbitkan tugas perkuliahan, menentukan bobot penilaian, instruksi, dan deadline.<br>- Mengunduh dan memeriksa berkas submission mahasiswa.<br>- Memberikan penilaian berbasis skor numerik (0–100) dan feedback evaluasi.<br>- Membuka dan menutup sesi presensi perkuliahan serta merekap kehadiran.<br>- Membuat kuis interaktif dan memantau hasil pengerjaan kuis.<br>- Mengelola soal dan pelaksanaan ujian UTS (pertemuan 8) dan UAS (pertemuan 16).<br>- Memantau progress belajar dan rekap nilai seluruh mahasiswa di kelasnya. |
| **Admin** *(Role Tunggal)* | Pengelola teknis dan operasional sistem secara menyeluruh (menggantikan Super Admin, Admin LMS, dan Admin Akademik). Memiliki hak untuk:<br>- Mengelola data master pengguna (akun Mahasiswa, Dosen, dan sesama Admin).<br>- Mengelola master data mata kuliah dan kelas perkuliahan.<br>- Menetapkan dosen pengampu pada kelas perkuliahan.<br>- Melakukan **enrollment mahasiswa ke dalam kelas secara langsung** (meniadakan proses KRS manual).<br>- Mengelola konfigurasi global sistem (kebijakan ekstensi berkas, batas ukuran file upload, ambang batas presensi ujian).<br>- Memantau aktivitas pembelajaran dan penggunaan sistem.<br>- Mengakses jejak audit (*Audit Log*) dan integritas keamanan sistem. |

---

# 4. ALUR SISTEM BERDASARKAN AKTOR

## 4.1 Alur Admin
1. **Login:** Masuk ke sistem SPADA menggunakan kredensial akun Admin.
2. **Manajemen Pengguna:** Menambah, memperbarui, atau menonaktifkan data pengguna (Mahasiswa, Dosen, Admin).
3. **Pengelolaan Kelas & Mata Kuliah:** Membuat master mata kuliah dan membuka kelas pembelajaran untuk semester yang aktif.
4. **Penugasan Dosen:** Menetapkan satu atau lebih dosen pengampu pada masing-masing kelas.
5. **Enrollment Mahasiswa:** Memilih kelas dan mendaftarkan (*enroll*) mahasiswa ke dalam kelas tersebut. Menghapus alur pengajuan dan persetujuan KRS manual.
6. **Konfigurasi Sistem:** Menetapkan batas ukuran upload berkas (misal: default 5MB–10MB), daftar ekstensi file yang diizinkan (.pdf, .docx, .xlsx, .zip), dan ambang batas minimum presensi UTS/UAS (misal: 70%).
7. **Audit & Monitoring:** Memantau ringkasan aktivitas pembelajaran, memeriksa log aktivitas penting, dan memastikan sistem berjalan normal.

## 4.2 Alur Dosen
1. **Login:** Masuk ke sistem SPADA menggunakan akun Dosen.
2. **Dashboard & Timeline:** Melihat daftar kelas yang diampu dan memeriksa Timeline terpusat untuk memantau agenda aktif serta deadline tugas yang sedang berjalan.
3. **Pengaturan Pertemuan:** Masuk ke ruang kelas dan menyusun rencana pembelajaran dari Pertemuan 1 hingga Pertemuan 16.
4. **Penerbitan Materi:** Mengunggah berkas materi ajar pada pertemuan yang bersesuaian dengan format dan ukuran yang diizinkan.
5. **Manajemen Tugas:** Membuat tugas pada pertemuan tertentu, menentukan judul, deskripsi instruksi, mengunggah soal (PDF/dokumen), menentukan persentase bobot nilai, dan menetapkan tanggal/waktu deadline.
6. **Pengelolaan Presensi:** Membuka sesi presensi ketika perkuliahan dimulai, memantau daftar mahasiswa yang melakukan presensi secara langsung (*real-time*), dan menutup sesi presensi setelah waktu toleransi berakhir.
7. **Pengelolaan Kuis:** Membuat instrumen kuis, menyusun butir soal, menentukan durasi pengerjaan, dan menerbitkan kuis pada pertemuan yang ditentukan.
8. **Pemeriksaan & Penilaian Tugas:** Membuka daftar penyerahan tugas (*submissions*), mengunduh file jawaban mahasiswa yang telah tervalidasi, serta memberikan evaluasi berupa **skor numerik berstandar SPADA (0–100)** dan catatan umpan balik (*feedback*).
9. **Pengelolaan Ujian:** Menyiapkan materi evaluasi untuk UTS pada pertemuan 8 dan UAS pada pertemuan 16.
10. **Rekapitulasi Nilai:** Memantau rekap skor tugas, kuis, presensi, dan ujian seluruh mahasiswa kelas.

## 4.3 Alur Mahasiswa
1. **Login:** Masuk ke sistem SPADA menggunakan akun Mahasiswa.
2. **Dashboard & Timeline:** Memantau halaman Timeline terpusat untuk melihat urutan kronologis dari batas waktu penyerahan tugas terdekat, jadwal kuis, pertemuan kuliah, dan ujian.
3. **Akses Ruang Kelas:** Membuka kelas perkuliahan yang telah dienroll oleh Admin. Mahasiswa dapat melihat informasi mata kuliah, dosen pengampu, dan daftar 16 pertemuan.
4. **Akses Materi:** Membuka pertemuan aktif dan mengunduh berkas materi yang disediakan oleh dosen.
5. **Pengisian Presensi:** Mengisi kehadiran pada pertemuan yang sedang berlangsung hanya apabila sesi presensi telah dibuka oleh dosen pengampu.
6. **Pengerjaan & Unggah Tugas:** Mengunduh berkas soal tugas, membaca instruksi, dan mengunggah berkas jawaban tugas sebelum batas waktu deadline. Sistem melakukan validasi keamanan berkas secara otomatis:
   - Jika tipe file tidak diizinkan (bukan .pdf, .docx, .xlsx, .zip) atau ukuran berkas melebihi batas maksimal konfigurasi (5MB–10MB), sistem secara otomatis **menolak unggahan** dan memberikan pesan kesalahan yang jelas.
   - Jika berkas memenuhi ketentuan, berkas berhasil disimpan dan sistem mencatat stempel waktu (*timestamp*) pengumpulan.
7. **Pengerjaan Kuis:** Mengerjakan kuis interaktif yang telah dibuka oleh dosen dalam batasan waktu yang ditentukan.
8. **Mengikuti Ujian (UTS & UAS):** Mengakses lembar UTS pada pertemuan 8 dan UAS pada pertemuan 16 apabila persentase kehadiran mahasiswa memenuhi ambang batas minimum.
9. **Pemantauan Nilai & Progress:** Melihat skor numerik (0–100) dan feedback tugas yang telah dinilai oleh dosen, serta memantau persentase kemajuan (*progress*) pembelajaran kelas.
10. **Pengelolaan Profil:** Membuka modul profil untuk memperbarui data identitas diri, mengganti kata sandi secara berkala, dan memperbarui foto profil.

---

# 5. STRUKTUR MODUL DAN FITUR UTAMA SISTEM

| Modul | Deskripsi dan Fitur Utama |
| --- | --- |
| **Profil Pengguna** | Modul mandiri yang memungkinkan setiap pengguna (Admin, Dosen, Mahasiswa) untuk melihat dan memperbarui informasi identitas diri, memperbarui kata sandi akun, dan mengunggah/mengganti foto profil. |
| **Timeline Pembelajaran** | Halaman dan widget terpusat pada dashboard mahasiswa dan dosen yang menampilkan urutan kronologis dari batas waktu (*deadline*) tugas, jadwal kuis, jadwal ujian (UTS/UAS), dan jadwal pertemuan kelas. |
| **Manajemen Tugas & Penilaian SPADA** | Fasilitas bagi dosen untuk menerbitkan tugas dengan bobot tertentu dan deadline. Sistem penilaian untuk tiap tugas wajib direpresentasikan menggunakan format **score numerik (skor angka 0–100)** persis seperti sistem standar SPADA. |
| **Validasi File (File Security)** | Implementasi sistem keamanan pada seluruh fitur unggah berkas (materi oleh dosen maupun jawaban tugas oleh mahasiswa):<br>1. **Tipe/Ekstensi File:** Sistem hanya menerima format yang diizinkan (misalnya: `.pdf`, `.docx`, `.xlsx`, `.zip`).<br>2. **Ukuran File (Size Limit):** Penolakan otomatis oleh sistem jika dokumen melebihi batas maksimal konfigurasi (default 5MB–10MB). |
| **Pembelajaran SPADA (Pertemuan 1–16)** | Modul inti ruang kelas yang membagi perkuliahan secara terstruktur ke dalam Pertemuan 1 sampai 16, mencakup distribusi Materi, Presensi (dibuka/ditutup dosen), Kuis, UTS (Pertemuan 8), dan UAS (Pertemuan 16). |
| **Presensi Perkuliahan** | Mekanisme pencatatan kehadiran digital per pertemuan. Dosen membuka sesi, mahasiswa mengisi kehadiran, dan dosen menutup sesi. Perhitungan persentase kehadiran terakumulasi otomatis. |
| **Kuis Pembelajaran** | Pengelolaan kuis interaktif per pertemuan dengan timer otomatis, pengacakan soal, dan kalkulasi skor otomatis atau manual. |
| **Evaluasi Ujian (UTS & UAS)** | Penyelenggaraan UTS pada pertemuan 8 dan UAS pada pertemuan 16 yang dilengkapi *gatekeeping* validasi syarat ambang batas persentase kehadiran mahasiswa. |
| **Manajemen Kelas & Enrollment (Admin)** | Pengelolaan master mata kuliah, kelas perkuliahan, penugasan dosen pengampu, dan pendaftaran (*enrollment*) mahasiswa secara langsung oleh Admin (tanpa alur KRS manual). |
| **Manajemen User & Autentikasi** | Pengelolaan akun pengguna, autentikasi sesi login/logout aman, reset kata sandi, dan penegakan peran tunggal (*RBAC: Mahasiswa, Dosen, Admin*). |
| **Notifikasi Pembelajaran** | Pengiriman pemberitahuan sistem terkait penerbitan tugas baru, pengingat deadline, pembukaan sesi presensi, publikasi skor nilai, dan pengumuman kelas. |
| **Keamanan & Audit Trail** | Pembatasan akses berbasis otorisasi ketat, penyimpanan berkas terlindungi tanpa URL publik langsung, dan pencatatan audit aktivitas penting pada sistem. |

---

# 6. ANALISIS RUANG KELAS DAN STRUKTUR PEMBELAJARAN

## 6.1 Konsep Mata Kuliah dan Kelas
- Mata Kuliah dan Kelas merupakan wadah (*container*) utama penyelenggaraan proses pembelajaran di SPADA.
- Setiap kelas memiliki kode kelas, nama mata kuliah, beban SKS, semester aktif, dan dosen pengampu yang ditetapkan oleh Admin.
- Daftar kelas yang tampil pada akun mahasiswa murni berasal dari data **enrollment yang dilakukan oleh Admin**. Mahasiswa tidak dapat menambahkan kelas secara manual atau mengajukan KRS mandiri.

## 6.2 Struktur Hirarki Pembelajaran
Hirarki organisasi pembelajaran di SPADA dirancang sebagai berikut:
$$\text{Mata Kuliah} \longrightarrow \text{Kelas Perkuliahan} \longrightarrow \text{Pertemuan (1 s.d. 16)} \longrightarrow \text{Aktivitas Pembelajaran}$$

Aktivitas pembelajaran pada tiap pertemuan terdiri dari:
1. **Materi Pembelajaran** (Dokumen PDF, modul, slide, referensi eksternal).
2. **Tugas Perkuliahan** (Instruksi, file soal, deadline, bobot, validasi upload jawaban, skor 0–100).
3. **Kuis Interaktif** (Pertanyaan terstruktur, batas waktu pengerjaan).
4. **Presensi Digital** (Pencatatan kehadiran berbasis sesi aktif).

## 6.3 Struktur Pertemuan 1–16
Kelas perkuliahan di SPADA mengikuti siklus standar akademik 16 pertemuan:
- **Pertemuan 1–7:** Sesi kegiatan pembelajaran aktif pra-UTS.
- **Pertemuan 8:** Pelaksanaan Ujian Tengah Semester (UTS).
- **Pertemuan 9–15:** Sesi kegiatan pembelajaran aktif pasca-UTS.
- **Pertemuan 16:** Pelaksanaan Ujian Akhir Semester (UAS).

Seluruh aktivitas (Materi, Tugas, Kuis, Presensi) bersifat fleksibel dan dapat dikonfigurasi oleh dosen pengampu pada pertemuan pembelajaran (1–7 dan 9–15). Aktivitas yang tidak diaktifkan atau belum diterbitkan oleh dosen tidak akan ditampilkan sebagai elemen kosong pada antarmuka mahasiswa.

---

# 7. FITUR UTAMA PEMBELAJARAN SPADA

## 7.1 Profil Pengguna
- Setiap pengguna (Admin, Dosen, Mahasiswa) memiliki halaman profil mandiri.
- Pengguna dapat melihat informasi akun (NIM/NIDN/NIP, Nama Lengkap, Email, Peran).
- Pengguna dapat memperbarui nomor kontak, bio singkat, dan mengunggah/mengganti foto profil (dengan validasi format gambar `.jpg`, `.jpeg`, `.png` dan batas ukuran maks 2MB).
- Pengguna dapat mengubah kata sandi akun dengan memvalidasi kata sandi lama terlebih dahulu.

## 7.2 Timeline Akademik & Pembelajaran
- Tersedia pada dashboard utama Mahasiswa dan Dosen sebagai pusat manajemen waktu.
- Menyajikan urutan agenda secara kronologis berdasarkan tanggal dan waktu server:
  - Batas waktu pengumpulan (*deadline*) tugas terdekat.
  - Jadwal kuis yang akan datang atau sedang berlangsung.
  - Jadwal pelaksanaan UTS (pertemuan 8) dan UAS (pertemuan 16).
  - Jadwal pertemuan kelas berjalan.
- Setiap entri agenda pada Timeline dilengkapi tautan langsung (*shortcut link*) menuju ruang kelas atau aktivitas terkait.
- Mahasiswa dapat memfilter agenda berdasarkan mata kuliah atau rentang waktu (Hari Ini, 7 Hari Mendatang, 30 Hari Mendatang).

## 7.3 Manajemen Materi Pembelajaran
- Dosen dapat menambahkan materi baru pada pertemuan aktif dengan menyertakan judul, deskripsi materi, dan berkas lampiran.
- File materi wajib melewati sistem validasi file (ekstensi yang diizinkan dan batasan ukuran berkas).
- Mahasiswa dapat membaca deskripsi materi dan mengunduh berkas materi secara aman melalui mekanisme kontrol akses sistem.

## 7.4 Manajemen Tugas & Penilaian SPADA (Skor 0–100)
- Dosen dapat menerbitkan tugas pada pertemuan yang ditentukan dengan atribut: judul tugas, instruksi pengerjaan, berkas soal (umumnya PDF), tanggal rilis, batas waktu pengumpulan (*deadline*), kebijakan toleransi keterlambatan, dan bobot nilai dalam persentase.
- Mahasiswa dapat mengunduh soal, mengerjakan tugas, dan mengunggah berkas jawaban (*submission*).
- Sistem mencatat stempel waktu (*timestamp*) pengumpulan dan status penyerahan (*Submitted*, *Late Submission*, *Draft*).
- Dosen dapat mengunduh berkas jawaban mahasiswa, memeriksa isi jawaban, dan menginputkan evaluasi.
- **Standar Penilaian SPADA:** Nilai tugas **wajib menggunakan format skor numerik 0–100** (misal: 85, 90, 100). Dosen juga dapat menyertakan catatan feedback perbaikan bagi mahasiswa.
- Mahasiswa dapat melihat skor numerik yang diperoleh serta catatan feedback secara transparan.

## 7.5 Sistem Validasi File (File Security)
Sistem menerapkan proteksi ketat pada seluruh fitur pengunggahan berkas:
1. **Validasi Tipe / Ekstensi File:**
   - Sistem hanya mengizinkan ekstensi dokumen yang sah, yaitu: `.pdf`, `.docx`, `.xlsx`, `.zip`.
   - Unggahan berkas dengan ekstensi selain daftar putih (*whitelist*) akan **ditolak secara otomatis** oleh sistem dengan notifikasi kesalahan: *"Format berkas tidak didukung. Harap unggah file berformat .pdf, .docx, .xlsx, atau .zip"*.
   - Validasi dilakukan berlapis pada sisi klien (*frontend*) dan diverifikasi ulang melalui MIME-type inspection di sisi server (*backend*).
2. **Validasi Ukuran File (Size Limit):**
   - Sistem membatasi ukuran maksimal per berkas unggahan sesuai konfigurasi (default: 5MB s.d. 10MB).
   - Berkas yang melebihi batas ukuran maksimal akan **ditolak seketika** dengan notifikasi: *"Ukuran berkas melebihi batas maksimal yang diizinkan (maks. 10MB)"*.
3. **Penyimpanan Berkas Terlindungi:**
   - Berkas submission mahasiswa tidak disimpan pada direktori publik terbuka (*public web root*).
   - Pengunduhan berkas wajib melalui endpoint terproteksi yang memverifikasi sesi dan hak akses pengguna (hanya dosen pengampu kelas dan mahasiswa pemilik berkas yang berhak mengunduh).

## 7.6 Kuis Pembelajaran
- Dosen dapat membuat instrumen kuis per pertemuan dengan menentukan judul, durasi pengerjaan (dalam menit), batas waktu akses, dan susunan butir soal (pilihan ganda dan/atau esai singkat).
- Mahasiswa mengerjakan kuis dalam batasan waktu yang ditentukan oleh *countdown timer*.
- Sistem menyimpan jawaban mahasiswa secara otomatis dan menghitung skor pengerjaan pilihan ganda.
- Dosen dapat meninjau hasil evaluasi kuis dan melihat rekapitulasi capaian mahasiswa.

## 7.7 Presensi Digital
- Dosen memegang kendali penuh atas sesi presensi:
  - Dosen membuka sesi presensi pada pertemuan yang sedang berjalan.
  - Mahasiswa yang terdaftar pada kelas dapat mengisi status kehadiran (*Hadir*) selama sesi masih terbuka.
  - Dosen dapat menutup sesi presensi sewaktu-waktu atau mengatur penutupan otomatis berdasarkan durasi perkuliahan.
  - Mahasiswa **tidak dapat mengisi presensi** sebelum sesi dibuka oleh dosen atau setelah sesi dinyatakan ditutup.
- Dosen berwenang mengoreksi atau mengubah status kehadiran mahasiswa (Hadir, Izin, Sakit, Alpa) jika diperlukan.
- Sistem mengkalkulasi persentase kehadiran mahasiswa secara berkala untuk keperluan evaluasi kelayakan ujian.

## 7.8 Evaluasi UTS (Pertemuan 8) dan UAS (Pertemuan 16)
- Evaluasi UTS ditempatkan secara khusus pada Pertemuan 8 dan UAS pada Pertemuan 16.
- **Validasi Ambang Batas Kehadiran (Gatekeeping):**
  - Sebelum mahasiswa diizinkan mengakses soal dan lembar pengerjaan UTS/UAS, sistem memeriksa persentase kehadiran mahasiswa dari pertemuan-pertemuan sebelumnya.
  - Jika persentase kehadiran mahasiswa berada di bawah ambang batas minimum yang dikonfigurasi (misalnya < 70% atau < 75%), akses tombol ujian akan **terkunci otomatis** dan menampilkan peringatan ketidaklayakan kehadiran.
  - Mahasiswa yang memenuhi syarat kehadiran dapat mengakses dan mengumpulkan ujian sesuai jadwal yang ditetapkan.

---

# 8. RANCANGAN DASHBOARD PENGGUNA

## 8.1 Dashboard Mahasiswa
- **Header Profil Ringkas:** Menampilkan nama mahasiswa, NIM, foto profil, dan status semester aktif.
- **Widget Central Timeline:** Menampilkan daftar tugas dengan deadline terdekat, jadwal kuis yang akan datang, jadwal pertemuan perkuliahan, dan jadwal ujian.
- **Katalog Kelas Saya:** Kartu (*cards*) daftar mata kuliah dan kelas yang telah dienroll oleh Admin, dilengkapi nama dosen pengampu, indikator pertemuan berjalan, dan baris progres pembelajaran (*completion percentage*).
- **Aksi Cepat (*Quick Actions*):** Tombol pintas untuk menuju tugas yang belum dikerjakan, presensi pertemuan hari ini, dan riwayat skor nilai.

## 8.2 Dashboard Dosen
- **Header Profil Ringkas:** Menampilkan nama dosen, NIDN, foto profil, dan status jabatan fungsional.
- **Widget Timeline Kelas:** Menampilkan jadwal perkuliahan hari ini, daftar tugas mahasiswa yang membutuhkan pemeriksaan (*Need Grading*), serta jadwal penutupan kuis/tugas.
- **Daftar Kelas yang Diampu:** Kartu kelas yang menampilkan nama mata kuliah, ruangan/jadwal, jumlah mahasiswa terdaftar, dan status pertemuan aktif.
- **Aksi Cepat:** Pintasan untuk membuka sesi presensi kelas, mengunggah materi baru, membuat tugas, atau memeriksa berkas penyerahan tugas.

## 8.3 Dashboard Admin (Role Tunggal)
- **Ringkasan Metrik Sistem:** Menampilkan total mahasiswa aktif, total dosen, total kelas pembelajaran aktif, dan total berkas tersimpan.
- **Manajemen Cepat Master Data:** Pintasan menuju manajemen akun pengguna (Mahasiswa, Dosen, Admin), master mata kuliah, dan pembukaan kelas.
- **Pusat Enrollment Kelas:** Antarmuka khusus untuk memilih kelas perkuliahan dan mendaftarkan (*enroll*) mahasiswa secara cepat (baik per individu maupun massal/batch).
- **Konfigurasi Global SPADA:** Panel pengaturan kebijakan berkas (ekstensi diizinkan, batas maksimal ukuran file upload), ambang kehadiran ujian, dan pengaturan umum sistem.
- **Monitoring & Audit Log:** Pemantauan aktivitas login, penyerahan tugas, perubahan skor nilai, dan log keamanan server.

---

# 9. FUNCTIONAL REQUIREMENTS (FR)

| ID | Aktor | Deskripsi Kebutuhan Fungsional |
| --- | --- | --- |
| **FR-001** | Semua Pengguna | Sistem menyediakan antarmuka login menggunakan identifier (email/NIM/NIDN/username) dan kata sandi yang valid. |
| **FR-002** | Semua Pengguna | Sistem menyediakan fitur logout untuk mengakhiri sesi autentikasi pengguna secara aman. |
| **FR-003** | Semua Pengguna | Sistem menyediakan fitur lupa kata sandi (*forgot password*) dengan verifikasi token email. |
| **FR-004** | Semua Pengguna | Sistem membatasi hak akses fungsional dan data secara ketat berdasarkan peran pengguna (*Mahasiswa, Dosen, Admin*). |
| **FR-005** | Semua Pengguna | Sistem menyediakan modul Profil Pengguna untuk melihat data identitas diri akun masing-masing. |
| **FR-006** | Semua Pengguna | Pengguna dapat memperbarui data kontak dan informasi bio pada profil masing-masing. |
| **FR-007** | Semua Pengguna | Pengguna dapat mengunggah dan memperbarui foto profil dengan validasi ekstensi gambar (.jpg, .jpeg, .png) dan ukuran maksimal 2MB. |
| **FR-008** | Semua Pengguna | Pengguna dapat melakukan pergantian kata sandi dengan verifikasi kata sandi lama. |
| **FR-009** | Mahasiswa & Dosen | Sistem menyediakan halaman Timeline Pembelajaran terpusat pada dashboard. |
| **FR-010** | Mahasiswa & Dosen | Halaman Timeline menampilkan daftar batas waktu (*deadline*) tugas secara kronologis berdasarkan waktu server. |
| **FR-011** | Mahasiswa & Dosen | Halaman Timeline menampilkan jadwal kuis dan jadwal ujian (UTS/UAS) yang akan datang. |
| **FR-012** | Mahasiswa & Dosen | Halaman Timeline menyediakan tautan langsung (*shortcut navigation*) menuju aktivitas pembelajaran terkait. |
| **FR-013** | Mahasiswa | Mahasiswa dapat melihat daftar kelas perkuliahan yang telah dienroll oleh Admin pada dashboard SPADA. |
| **FR-014** | Mahasiswa | Mahasiswa dapat membuka ruang kelas perkuliahan dan melihat informasi mata kuliah, SKS, dosen pengampu, dan daftar 16 pertemuan. |
| **FR-015** | Mahasiswa | Mahasiswa dapat melihat dan mengunduh berkas materi pembelajaran yang telah diterbitkan oleh dosen. |
| **FR-016** | Mahasiswa | Mahasiswa dapat melihat detail tugas yang mencakup instruksi pengerjaan, bobot penilaian, dan mengunduh berkas soal. |
| **FR-017** | Mahasiswa | Mahasiswa dapat mengunggah berkas jawaban tugas (*submission*) sebelum batas waktu deadline. |
| **FR-018** | Sistem | Sistem melakukan validasi tipe/ekstensi berkas unggahan tugas mahasiswa dan hanya menerima format `.pdf`, `.docx`, `.xlsx`, `.zip`. |
| **FR-019** | Sistem | Sistem melakukan validasi ukuran berkas unggahan dan otomatis menolak berkas yang melebihi batas maksimal konfigurasi (5MB–10MB). |
| **FR-020** | Sistem | Sistem mencatat stempel waktu (*timestamp*) penyerahan tugas dan menandai status keterlambatan jika melewati batas deadline. |
| **FR-021** | Mahasiswa | Mahasiswa dapat memperbarui/mengganti berkas jawaban tugas selama masih dalam rentang waktu yang diizinkan sebelum deadline. |
| **FR-022** | Mahasiswa | Mahasiswa dapat melihat hasil evaluasi tugas berupa skor numerik berstandar SPADA (0–100) dan catatan feedback dari dosen. |
| **FR-023** | Mahasiswa | Mahasiswa dapat mengisi presensi kehadiran pada pertemuan aktif hanya apabila sesi presensi telah dibuka oleh dosen. |
| **FR-024** | Mahasiswa | Mahasiswa dapat melihat status dan rekapitulasi kehadiran pada kelas yang diikutinya. |
| **FR-025** | Mahasiswa | Mahasiswa dapat mengerjakan kuis yang diterbitkan oleh dosen dalam rentang waktu dan durasi yang ditentukan. |
| **FR-026** | Mahasiswa | Mahasiswa dapat mengakses evaluasi UTS pada Pertemuan 8 jika memenuhi ambang batas persentase kehadiran minimum. |
| **FR-027** | Mahasiswa | Mahasiswa dapat mengakses evaluasi UAS pada Pertemuan 16 jika memenuhi ambang batas persentase kehadiran minimum. |
| **FR-028** | Mahasiswa | Mahasiswa dapat memantau indikator progres pembelajaran (*course completion progress*) pada kelas yang diikutinya. |
| **FR-029** | Dosen | Dosen dapat melihat daftar seluruh kelas perkuliahan yang diampunya pada dashboard. |
| **FR-030** | Dosen | Dosen dapat mengelola struktur isi dari Pertemuan 1 sampai Pertemuan 16 pada masing-masing kelas. |
| **FR-031** | Dosen | Dosen dapat membuat, mengunggah berkas, dan menerbitkan materi pembelajaran pada pertemuan yang ditentukan. |
| **FR-032** | Dosen | Dosen dapat menerbitkan tugas dengan menentukan judul, instruksi, file soal, bobot penilaian, dan tanggal/waktu deadline. |
| **FR-033** | Dosen | Dosen dapat melihat daftar mahasiswa yang telah mengumpulkan tugas beserta status dan waktu pengumpulannya. |
| **FR-034** | Dosen | Dosen dapat mengunduh berkas jawaban tugas mahasiswa secara aman. |
| **FR-035** | Dosen | Dosen dapat memberikan penilaian evaluasi tugas menggunakan format skor numerik (0–100) dan komentar feedback perbaikan. |
| **FR-036** | Dosen | Dosen dapat membuka sesi presensi perkuliahan pada pertemuan yang sedang berjalan. |
| **FR-037** | Dosen | Dosen dapat melihat daftar kehadiran mahasiswa secara langsung (*real-time*) saat sesi presensi dibuka. |
| **FR-038** | Dosen | Dosen dapat menutup sesi presensi perkuliahan sewaktu-waktu. |
| **FR-039** | Dosen | Dosen dapat mengoreksi status presensi mahasiswa (Hadir, Sakit, Izin, Alpa) bila diperlukan. |
| **FR-040** | Dosen | Dosen dapat membuat instrumen kuis, menyusun butir pertanyaan, dan menetapkan durasi pengerjaan. |
| **FR-041** | Dosen | Dosen dapat melihat dan mengunduh rekap hasil pengerjaan kuis mahasiswa. |
| **FR-042** | Dosen | Dosen dapat mengelola pelaksanaan evaluasi UTS pada Pertemuan 8 dan UAS pada Pertemuan 16. |
| **FR-043** | Dosen | Dosen dapat melihat rekapitulasi nilai keseluruhan (tugas, kuis, presensi, ujian) mahasiswa di kelasnya. |
| **FR-044** | Admin | Admin dapat mengelola master akun pengguna (membuat, mengubah, menonaktifkan akun Mahasiswa, Dosen, dan Admin). |
| **FR-045** | Admin | Admin dapat mengelola master mata kuliah (kode, nama mata kuliah, bobot SKS, deskripsi). |
| **FR-046** | Admin | Admin dapat membuka kelas perkuliahan untuk semester aktif dan menetapkan dosen pengampu kelas. |
| **FR-047** | Admin | Admin dapat mendaftarkan (*enroll*) mahasiswa ke dalam kelas perkuliahan secara langsung (individual maupun batch). |
| **FR-048** | Admin | Admin dapat membatalkan atau mencabut (*unenroll*) kepesertaan mahasiswa dari kelas perkuliahan. |
| **FR-049** | Admin | Admin dapat mengatur konfigurasi global validasi file (daftar ekstensi yang diizinkan dan batas ukuran file maksimal). |
| **FR-050** | Admin | Admin dapat mengonfigurasi ambang batas minimum persentase kehadiran untuk syarat kelayakan ujian UTS dan UAS. |
| **FR-051** | Admin | Admin dapat memantau aktivitas pembelajaran seluruh kelas yang berjalan di SPADA. |
| **FR-052** | Admin | Admin dapat melihat riwayat jejak audit (*Audit Log*) atas tindakan-tindakan penting di dalam sistem. |
| **FR-053** | Sistem | Sistem secara otomatis menolak pengunggahan file jika format ekstensi tidak terdaftar dalam whitelist (.pdf, .docx, .xlsx, .zip). |
| **FR-054** | Sistem | Sistem secara otomatis menolak pengunggahan file jika ukuran berkas melebihi batas konfigurasi (5MB–10MB). |
| **FR-055** | Sistem | Sistem melakukan kalkulasi persentase kehadiran mahasiswa secara otomatis per kelas perkuliahan. |
| **FR-056** | Sistem | Sistem mengunci tombol akses UTS/UAS bagi mahasiswa yang persentase kehadirannya berada di bawah ambang batas yang ditetapkan. |
| **FR-057** | Sistem | Sistem mengirimkan notifikasi internal kepada mahasiswa saat tugas baru diterbitkan, presensi dibuka, atau skor nilai diinputkan. |
| **FR-058** | Sistem | Sistem mencatat seluruh perubahan nilai, mutasi enrollment, dan konfigurasi sistem ke dalam tabel Audit Log. |

---

# 10. BUSINESS RULES (BR)

| ID | Deskripsi Aturan Bisnis (Business Rules) |
| --- | --- |
| **BR-001** | **Independensi LMS SPADA:** Seluruh sistem dan portal di luar SPADA (SIA, PMB, KHS, Transkrip, Sidang) dihapus dari ruang lingkup. Sistem beroperasi murni dan independen sebagai Learning Management System (SPADA LMS). |
| **BR-002** | **Enrollment oleh Admin (Tanpa KRS):** Proses pengajuan dan persetujuan KRS oleh Dosen Wali/PA resmi ditiadakan. Kepesertaan (*enrollment*) mahasiswa ke dalam kelas perkuliahan dikelola secara langsung oleh Admin. |
| **BR-003** | **Otoritas Akses Kelas:** Mahasiswa hanya dapat mengakses ruang kelas, materi, dan aktivitas pada kelas perkuliahan di mana akun mahasiswa tersebut telah dienroll oleh Admin. |
| **BR-004** | **Struktur 16 Pertemuan:** Setiap kelas perkuliahan tersusun secara wajib ke dalam 16 pertemuan terstruktur, dengan siklus Pertemuan 1–7 (pembelajaran pra-UTS), Pertemuan 8 (UTS), Pertemuan 9–15 (pembelajaran pasca-UTS), dan Pertemuan 16 (UAS). |
| **BR-005** | **Fleksibilitas Aktivitas Belajar:** Materi, Tugas, Kuis, dan Presensi bersifat opsional pada pertemuan pembelajaran (1–7 dan 9–15) sesuai rancangan pengajaran dosen pengampu. Aktivitas yang belum diterbitkan tidak ditampilkan kepada mahasiswa. |
| **BR-006** | **Standar Penilaian Skor SPADA (0–100):** Sistem penilaian untuk setiap tugas mahasiswa wajib direpresentasikan menggunakan format nilai numerik (*score* angka bulat/desimal 0–100) sesuai standar baku SPADA. |
| **BR-007** | **Validasi Tipe File (Whitelist):** Sistem wajib menolak secara otomatis setiap berkas unggahan (baik materi maupun tugas) yang ekstensinya berada di luar format yang diizinkan: `.pdf`, `.docx`, `.xlsx`, `.zip`. |
| **BR-008** | **Validasi Ukuran File (Size Limit):** Sistem wajib menolak secara otomatis setiap berkas unggahan yang ukurannya melebihi ambang batas maksimal yang dikonfigurasi pada sistem (default: 5MB s.d. 10MB). |
| **BR-009** | **Penyimpanan Berkas Terproteksi:** Seluruh berkas penyerahan tugas mahasiswa wajib disimpan di area penyimpanan terproteksi (*private storage*) dan tidak boleh dapat diakses melalui URL publik tanpa verifikasi sesi otorisasi yang sah. |
| **BR-010** | **Aturan Pembukaan Presensi:** Mahasiswa hanya dapat melakukan pengisian kehadiran jika sesi presensi pertemuan tersebut telah dibuka secara aktif oleh dosen pengampu. |
| **BR-011** | **Aturan Penutupan Presensi:** Sesi presensi yang telah ditutup oleh dosen tidak dapat diisi lagi oleh mahasiswa. Koreksi kehadiran setelah penutupan sesi hanya dapat dilakukan oleh dosen pengampu kelas. |
| **BR-012** | **Prasyarat Kehadiran UTS & UAS:** Mahasiswa hanya berhak mengakses evaluasi UTS (pertemuan 8) dan UAS (pertemuan 16) apabila persentase kehadirannya memenuhi atau melampaui ambang batas minimum yang ditentukan sistem (default: $\ge 70\%$). |
| **BR-013** | **Kronologi Timeline:** Entitas pada Timeline Pembelajaran (tugas, kuis, ujian, pertemuan) wajib diurutkan secara kronologis berdasarkan waktu server resmi untuk menjamin kepastian tenggat waktu (*deadline*). |
| **BR-014** | **Pengelolaan Profil Mandiri:** Setiap pengguna (Admin, Dosen, Mahasiswa) memiliki wewenang untuk memperbarui data identitas pribadi, foto profil, dan kata sandi akunnya sendiri. |
| **BR-015** | **Audit Trail Mutasi Kritis:** Setiap tindakan yang memodifikasi data krusial—meliputi perubahan skor nilai tugas, pendaftaran/pembatalan enrollment kelas oleh Admin, manajemen akun pengguna, dan perubahan konfigurasi sistem—wajib tercatat pada tabel Audit Log beserta identitas pelaku dan stempel waktu. |

---

# 11. USE CASE UTAMA & USE CASE SPECIFICATION

## 11.1 Daftar Use Case Utama

| Kode Use Case | Aktor Utama | Nama Use Case |
| --- | --- | --- |
| **UC-01** | Semua Pengguna | Login & Otentikasi Sesi |
| **UC-02** | Semua Pengguna | Pengelolaan Profil Pengguna |
| **UC-03** | Mahasiswa & Dosen | Pemantauan Timeline Pembelajaran |
| **UC-04** | Mahasiswa | Akses Kelas & Materi Kuliah |
| **UC-05** | Mahasiswa | Pengumpulan Tugas dengan Validasi File |
| **UC-06** | Mahasiswa | Pengisian Presensi Perkuliahan |
| **UC-07** | Mahasiswa | Pengerjaan Kuis Pembelajaran |
| **UC-08** | Mahasiswa | Mengikuti Ujian UTS / UAS |
| **UC-09** | Dosen | Manajemen Struktur Pertemuan & Materi |
| **UC-10** | Dosen | Penerbitan Tugas Perkuliahan |
| **UC-11** | Dosen | Pemeriksaan & Penilaian Tugas (Skor 0–100) |
| **UC-12** | Dosen | Pengelolaan Sesi Presensi Perkuliahan |
| **UC-13** | Dosen | Pengelolaan Kuis & Evaluasi Ujian |
| **UC-14** | Admin | Manajemen Master User & Kelas |
| **UC-15** | Admin | Manajemen Enrollment Mahasiswa |
| **UC-16** | Admin | Pengaturan Konfigurasi Sistem & Audit Log |

## 11.2 Spesifikasi Use Case Terpilih

### UC-01: Login & Otentikasi Sesi
- **Aktor:** Mahasiswa, Dosen, Admin.
- **Pre-condition:** Akun pengguna telah terdaftar dan berstatus aktif.
- **Alur Utama:**
  1. Pengguna mengakses halaman login SPADA.
  2. Pengguna memasukkan username/email/NIM/NIDN dan kata sandi.
  3. Sistem memverifikasi kredensial menggunakan fungsi hash yang aman.
  4. Sistem memeriksa peran pengguna (*role*).
  5. Sistem membuat sesi terotentikasi dan mengarahkan pengguna ke dashboard yang sesuai (Dashboard Mahasiswa, Dosen, atau Admin).
- **Alur Alternatif:** Kredensial tidak cocok; sistem menampilkan pesan kesalahan *"Username atau kata sandi salah"* dan mencatat kegagalan login.

### UC-02: Pengelolaan Profil Pengguna
- **Aktor:** Mahasiswa, Dosen, Admin.
- **Pre-condition:** Pengguna telah berhasil login.
- **Alur Utama:**
  1. Pengguna membuka menu Profil Pengguna.
  2. Sistem menampilkan data identitas akun, foto profil, dan form ubah kata sandi.
  3. Pengguna memperbarui data kontak atau mengunggah foto profil baru.
  4. Sistem memvalidasi berkas foto (ekstensi .jpg/.png, maks 2MB).
  5. Pengguna menyimpan perubahan; sistem memperbarui data pada basis data.

### UC-05: Pengumpulan Tugas dengan Validasi File
- **Aktor:** Mahasiswa.
- **Pre-condition:** Mahasiswa terdaftar dalam kelas, tugas telah diterbitkan, dan sesi pengumpulan masih aktif.
- **Alur Utama:**
  1. Mahasiswa memilih kelas perkuliahan dan membuka aktivitas tugas yang dituju.
  2. Mahasiswa membaca instruksi tugas, mengunduh file soal (jika ada), dan memilih opsi *Upload Submission*.
  3. Mahasiswa memilih berkas jawaban dari perangkat lokal.
  4. **Pemeriksaan Sistem (Validasi File):**
     - Sistem memverifikasi ekstensi file terhadap daftar putih (`.pdf`, `.docx`, `.xlsx`, `.zip`).
     - Sistem memverifikasi ukuran berkas terhadap batas maksimal (5MB–10MB).
  5. Berkas dinyatakan valid; sistem mengunggah berkas ke direktori terproteksi.
  6. Sistem menyimpan metadata berkas, stempel waktu (*submitted_at*), dan status pengumpulan.
  7. Mahasiswa menerima konfirmasi bahwa tugas berhasil dikumpulkan.
- **Alur Alternatif (Validasi Gagal):**
  - Jika format berkas tidak sesuai: Sistem menolak unggahan dan menampilkan pesan *"Format berkas tidak didukung. Harap unggah file .pdf, .docx, .xlsx, atau .zip"*.
  - Jika ukuran berkas melebihi batas: Sistem menolak unggahan dan menampilkan pesan *"Ukuran berkas melebihi batas maksimal (maks 10MB)"*.
  - Pengumpulan tidak disimpan hingga berkas yang memenuhi syarat diunggah.

### UC-11: Pemeriksaan & Penilaian Tugas (Skor 0–100)
- **Aktor:** Dosen.
- **Pre-condition:** Tugas telah dibuat dan terdapat mahasiswa yang mengunggah jawaban.
- **Alur Utama:**
  1. Dosen membuka ruang kelas dan memilih tugas yang ingin dinilai.
  2. Sistem menampilkan daftar seluruh penyerahan tugas (*submissions*) mahasiswa.
  3. Dosen mengunduh dan memeriksa berkas jawaban mahasiswa terkait.
  4. Dosen memasukkan nilai evaluasi dalam format **skor numerik (0–100)** pada input nilai.
  5. Dosen memasukkan catatan feedback evaluasi pada kolom catatan.
  6. Dosen menekan tombol *Simpan Nilai*.
  7. Sistem memvalidasi bahwa nilai berada pada rentang numerik 0 s.d. 100.
  8. Sistem menyimpan skor dan catatan feedback, lalu memperbarui status penyerahan menjadi *Graded*.
  9. Sistem mencatat aksi penilaian ke dalam Audit Log.
- **Alur Alternatif:** Nilai yang dimasukkan < 0 atau > 100; sistem menolak penyimpanan dan menampilkan peringatan *"Nilai harus berupa angka di antara 0 hingga 100"*.

### UC-15: Manajemen Enrollment Mahasiswa oleh Admin
- **Aktor:** Admin.
- **Pre-condition:** Admin telah login; data mahasiswa dan kelas telah terdaftar di sistem.
- **Alur Utama:**
  1. Admin membuka menu *Manajemen Enrollment*.
  2. Admin memilih mata kuliah dan kelas yang dituju.
  3. Sistem menampilkan daftar mahasiswa yang belum terdaftar dan daftar mahasiswa yang sudah dienroll.
  4. Admin memilih satu atau beberapa mahasiswa dan menekan tombol *Enroll ke Kelas*.
  5. Sistem memvalidasi data dan membuat relasi enrollment aktif antara mahasiswa dan kelas.
  6. Sistem mencatat aktivitas enrollment ke dalam Audit Log.
  7. Mahasiswa yang bersangkutan secara instan dapat melihat kelas tersebut di dashboard SPADA masing-masing.

---

# 12. KONSEP DATA DAN ENTITAS

Berikut adalah entitas data yang dikelola dalam sistem SPADA LMS:

| Entitas | Deskripsi dan Peran Data |
| --- | --- |
| **User** | Entitas akun pengguna sistem yang menyimpan kredensial, email, identifier, status keaktifan, dan peran (*Mahasiswa, Dosen, Admin*). |
| **Profile** | Menyimpan data personal pengguna seperti nama lengkap, nomor telepon, biodata, dan referensi berkas foto profil. |
| **Mahasiswa** | Menyimpan data spesifik mahasiswa seperti NIM, program studi, tahun angkatan, yang terelasi dengan entitas User. |
| **Dosen** | Menyimpan data spesifik dosen seperti NIDN, NIP, keahlian, yang terelasi dengan entitas User. |
| **Mata Kuliah** | Master data mata kuliah yang memuat kode mata kuliah, nama mata kuliah, bobot SKS, dan deskripsi kompetensi. |
| **Kelas** | Kelas perkuliahan yang dibuka pada semester aktif, mengaitkan Mata Kuliah dengan Dosen pengampu. |
| **Enrollment** | Tabel relasi kepesertaan yang menghubungkan Mahasiswa dengan Kelas perkuliahan yang didaftarkan oleh Admin. |
| **Pertemuan** | Entitas silabus 16 pertemuan per kelas yang menyimpan nomor pertemuan (1–16), topik, deskripsi, tanggal pelaksanaan, dan status rilis. |
| **Materi** | Berkas atau referensi bahan ajar yang diterbitkan oleh dosen pada suatu pertemuan. |
| **Tugas** | Instrumen penugasan pada pertemuan tertentu yang memuat judul, deskripsi instruksi, file soal, bobot persentase nilai, dan batas waktu deadline. |
| **Submission** | Penyerahan berkas jawaban tugas oleh mahasiswa yang memuat relasi ke Tugas, berkas jawaban, waktu penyerahan (*timestamp*), status keterlambatan, skor numerik (0–100), dan feedback dosen. |
| **Kuis** | Instrumen kuis pada pertemuan tertentu yang memuat durasi pengerjaan, batas waktu akses, dan aturan skor. |
| **Soal Kuis & Jawaban** | Bank butir soal kuis beserta pilihan jawaban dan rekaman jawaban yang diserahkan mahasiswa. |
| **Presensi Sesi** | Sesi kehadiran pada pertemuan perkuliahan yang mencatat waktu pembukaan sesi, penutupan sesi, dan status keaktifan. |
| **Presensi Detail** | Rekaman kehadiran mahasiswa pada sesi presensi (status: Hadir, Sakit, Izin, Alpa) dan waktu mahasiswa melakukan presensi. |
| **File Metadata** | Menyimpan metadata teknis seluruh berkas yang diunggah (nama asli, nama file sistem, path penyimpanan terproteksi, MIME-type, ukuran berkas/size in bytes, dan pemilik berkas). |
| **Audit Log** | Rekaman jejak audit sistem yang mencatat identitas pengguna, tipe aksi (*CREATE, UPDATE, DELETE, GRADE*), entitas target, rincian data sebelum/sesudah, alamat IP, dan stempel waktu server. |
| **Notifikasi** | Pesan pemberitahuan internal untuk pengguna terkait aktivitas perkuliahan (tugas baru, pembukaan presensi, rilis nilai). |

---

# 13. DATA DICTIONARY & ERD KONSEPTUAL

## 13.1 Relasi Antar Entitas (ERD Konseptual)
- `User` (1) memiliki (1) `Profile`.
- `User` (1) dapat bertindak sebagai (1) `Mahasiswa`, `Dosen`, atau `Admin`.
- `Mata Kuliah` (1) memiliki banyak (N) `Kelas`.
- `Dosen` (1) mengampu banyak (N) `Kelas`.
- `Admin` (1) mengelola pendaftaran `Enrollment`.
- `Mahasiswa` (1) memiliki banyak (N) `Enrollment` pada berbagai `Kelas`.
- `Kelas` (1) memiliki 16 (N) `Pertemuan`.
- `Pertemuan` (1) dapat memiliki banyak (N) `Materi`.
- `Pertemuan` (1) dapat memiliki banyak (N) `Tugas`.
- `Pertemuan` (1) dapat memiliki (1) `Presensi Sesi`.
- `Pertemuan` (1) dapat memiliki banyak (N) `Kuis`.
- `Tugas` (1) memiliki banyak (N) `Submission` dari `Mahasiswa`.
- `Presensi Sesi` (1) memiliki banyak (N) `Presensi Detail` per `Mahasiswa`.
- `Submission` dan `Materi` memiliki relasi referensi ke `File Metadata`.

## 13.2 Data Dictionary Minimum

| Entitas | Atribut / Kolom Utama | Tipe Data | Deskripsi & Validasi |
| --- | --- | --- | --- |
| **users** | `id` (PK)<br>`username`<br>`email`<br>`password_hash`<br>`role`<br>`status`<br>`created_at`, `updated_at` | UUID / INT<br>VARCHAR(50)<br>VARCHAR(100)<br>VARCHAR(255)<br>ENUM('mahasiswa', 'dosen', 'admin')<br>ENUM('active', 'inactive')<br>TIMESTAMP | Identitas akun login. Password di-hash (Bcrypt/Argon2). Role строго terbagi 3. |
| **profiles** | `id` (PK)<br>`user_id` (FK)<br>`full_name`<br>`phone`<br>`avatar_file_id` (FK)<br>`bio` | UUID / INT<br>FK users.id<br>VARCHAR(150)<br>VARCHAR(20)<br>FK files.id (nullable)<br>TEXT | Data profil pengguna. Avatar divalidasi format gambar maks 2MB. |
| **courses** | `id` (PK)<br>`code`<br>`name`<br>`credits`<br>`description` | UUID / INT<br>VARCHAR(20)<br>VARCHAR(150)<br>INT<br>TEXT | Master mata kuliah. SKS integer positif (1–6). |
| **classes** | `id` (PK)<br>`course_id` (FK)<br>`lecturer_id` (FK)<br>`academic_year`<br>`semester`<br>`name` | UUID / INT<br>FK courses.id<br>FK users.id (Dosen)<br>VARCHAR(10)<br>ENUM('ganjil', 'genap')<br>VARCHAR(50) | Kelas perkuliahan yang diampu dosen pada semester berjalan. |
| **enrollments** | `id` (PK)<br>`class_id` (FK)<br>`student_id` (FK)<br>`enrolled_by` (FK)<br>`enrolled_at` | UUID / INT<br>FK classes.id<br>FK users.id (Mahasiswa)<br>FK users.id (Admin)<br>TIMESTAMP | Pendaftaran mahasiswa ke kelas yang dibuat langsung oleh Admin. |
| **meetings** | `id` (PK)<br>`class_id` (FK)<br>`meeting_number`<br>`title`<br>`description`<br>`is_exam`<br>`exam_type` | UUID / INT<br>FK classes.id<br>INT (1–16)<br>VARCHAR(150)<br>TEXT<br>BOOLEAN<br>ENUM('none', 'uts', 'uas') | Pertemuan terstruktur 1–16. Pertemuan 8 adalah UTS, pertemuan 16 adalah UAS. |
| **materials** | `id` (PK)<br>`meeting_id` (FK)<br>`title`<br>`description`<br>`file_id` (FK) | UUID / INT<br>FK meetings.id<br>VARCHAR(150)<br>TEXT<br>FK files.id | Materi pembelajaran yang diunggah oleh dosen. |
| **assignments** | `id` (PK)<br>`meeting_id` (FK)<br>`title`<br>`instructions`<br>`file_soal_id` (FK)<br>`weight_percentage`<br>`due_date`<br>`allow_late` | UUID / INT<br>FK meetings.id<br>VARCHAR(150)<br>TEXT<br>FK files.id (nullable)<br>DECIMAL(5,2)<br>TIMESTAMP<br>BOOLEAN | Tugas kuliah. Bobot nilai 0–100%. Due date berbasis waktu server. |
| **submissions** | `id` (PK)<br>`assignment_id` (FK)<br>`student_id` (FK)<br>`file_id` (FK)<br>`submitted_at`<br>`is_late`<br>`score`<br>`feedback` | UUID / INT<br>FK assignments.id<br>FK users.id (Mahasiswa)<br>FK files.id<br>TIMESTAMP<br>BOOLEAN<br>**DECIMAL(5,2)** (nullable)<br>TEXT (nullable) | Berkas penyerahan tugas mahasiswa. **Score bernilai 0.00 s.d. 100.00** standar SPADA. |
| **attendances** | `id` (PK)<br>`meeting_id` (FK)<br>`opened_at`<br>`closed_at`<br>`status` | UUID / INT<br>FK meetings.id<br>TIMESTAMP<br>TIMESTAMP (nullable)<br>ENUM('open', 'closed') | Sesi presensi per pertemuan yang dibuka dan ditutup oleh dosen. |
| **attendance_records** | `id` (PK)<br>`attendance_id` (FK)<br>`student_id` (FK)<br>`status`<br>`recorded_at` | UUID / INT<br>FK attendances.id<br>FK users.id (Mahasiswa)<br>ENUM('hadir', 'izin', 'sakit', 'alpa')<br>TIMESTAMP | Rekaman presensi per mahasiswa pada sesi presensi. |
| **files** | `id` (PK)<br>`original_name`<br>`storage_name`<br>`file_path`<br>`mime_type`<br>`size_bytes`<br>`uploaded_by` (FK) | UUID / INT<br>VARCHAR(255)<br>VARCHAR(255)<br>VARCHAR(500)<br>VARCHAR(100)<br>BIGINT<br>FK users.id | Metadata file terproteksi. Memvalidasi ekstensi dan batas ukuran file (5MB–10MB). |
| **audit_logs** | `id` (PK)<br>`user_id` (FK)<br>`action`<br>`entity`<br>`entity_id`<br>`details`<br>`ip_address`<br>`created_at` | UUID / INT<br>FK users.id<br>VARCHAR(50)<br>VARCHAR(50)<br>VARCHAR(50)<br>JSON / TEXT<br>VARCHAR(45)<br>TIMESTAMP | Jejak audit atas aksi-aksi penting sistem. |

---

# 14. NON-FUNCTIONAL REQUIREMENTS (NFR)

| ID | Kategori | Deskripsi Kebutuhan Non-Fungsional |
| --- | --- | --- |
| **NFR-001** | **Security (Hashing)** | Kata sandi wajib disimpan menggunakan algoritma hash satu arah yang kuat (Bcrypt dengan work factor $\ge 10$ atau Argon2id). Penyimpanan kata sandi plaintext dilarang keras. |
| **NFR-002** | **Authorization (RBAC)** | Sistem menerapkan kontrol akses ketat (*Role-Based Access Control*) pada setiap endpoint API dan halaman antarmuka. Mahasiswa dilarang keras mengakses fungsi manipulasi kelas, penilaian, atau administrasi. |
| **NFR-003** | **File Upload Security** | Sistem wajib memvalidasi tipe file melalui pemeriksaan ganda (ekstensi file dan header MIME-type berkas). Sistem hanya menerima `.pdf`, `.docx`, `.xlsx`, `.zip` untuk tugas/materi dan menolak format executable (`.exe`, `.sh`, `.php`, `.js`). |
| **NFR-004** | **File Size Limiting** | Sistem membatasi ukuran berkas yang diunggah secara ketat di sisi server (default 5MB–10MB). Permintaan pengunggahan yang melebihi ukuran akan dihentikan sebelum membebani penyimpanan server. |
| **NFR-005** | **Private File Storage** | Seluruh berkas penyerahan tugas dan lembar ujian wajib disimpan di direktori privat yang tidak dapat diakses langsung oleh publik. Pengunduhan wajib melalui endpoint terproteksi yang memverifikasi identitas pengguna. |
| **NFR-006** | **Performance** | Waktu respons rata-rata sistem (*response time*) pada kondisi beban operasional normal tidak boleh melebihi 2 detik untuk permintaan halaman biasa dan 3 detik untuk proses unggah/unduh berkas standar. |
| **NFR-007** | **Availability** | Ketersediaan sistem (*system uptime*) ditargetkan minimal 99% selama jam aktif perkuliahan (07.00 s.d. 22.00 WIB). |
| **NFR-008** | **Data Integrity** | Sistem menjamin konsistensi data kepesertaan kelas (*enrollment*), catatan kehadiran, dan skor tugas mahasiswa melalui penerapan transaksi basis data (*database transactions*) dan foreign key constraint. |
| **NFR-009** | **Auditability** | Seluruh tindakan kritis seperti perubahan skor nilai tugas mahasiswa, manipulasi kepesertaan (*enrollment/unenrollment*), dan perubahan akun pengguna wajib dicatat dalam Audit Log yang tidak dapat dimanipulasi (*immutable*). |
| **NFR-010** | **Usability & Responsiveness** | Desain antarmuka SPADA harus konsisten, intuitif, dan responsif sehingga dapat diakses dengan nyaman melalui peramban web desktop, tablet, maupun perangkat seluler (smartphone). |

---

# 15. KEBUTUHAN UI/UX & PAGE SPECIFICATION

| Nama Halaman | Komponen & Elemen Utama | Aksi Pengguna | Validasi & Respons Sistem |
| --- | --- | --- | --- |
| **Login SPADA** | Form input username/email, kata sandi, opsi remember me, tombol login, tombol lupa kata sandi. | Masukkan kredensial dan submit login. | Kredensial wajib diisi, akun aktif. Error message jika gagal. |
| **Dashboard Mahasiswa** | Header info mahasiswa, widget **Timeline Pembelajaran**, kartu daftar kelas aktif, notifikasi, progres belajar. | Klik agenda timeline, buka ruang kelas, klik tugas cepat. | Menampilkan kelas yang hanya terdaftar dalam enrollment mahasiswa. |
| **Dashboard Dosen** | Header info dosen, widget timeline perkuliahan, kartu kelas diampu, daftar tugas yang butuh dinilai (*Need Grading*). | Klik kelas, buka presensi cepat, buka lembar penilaian. | Menampilkan kelas yang diampu oleh dosen yang bersangkutan. |
| **Dashboard Admin** | Kartu metrik (total user, kelas, berkas), menu manajemen pengguna, menu master kelas, pintasan enrollment, audit log. | Kelola master data, buka form enrollment, monitor log. | Otoritas penuh khusus peran Admin. |
| **Profil Pengguna** | Data identitas, foto profil saat ini, tombol ganti avatar, formulir ganti kata sandi. | Unggah foto baru, input kata sandi baru. | Avatar maks 2MB (.jpg/.png). Verifikasi kata sandi lama wajib cocok. |
| **Timeline Pembelajaran** | Daftar kronologis deadline tugas, jadwal kuis, pertemuan, dan ujian. Filter waktu & filter kelas. | Klik kartu timeline untuk loncat ke aktivitas terkait. | Urutan tanggal dan waktu akurat berdasarkan waktu server. |
| **Ruang Kelas SPADA** | Informasi mata kuliah, nama dosen pengampu, bar progres kelas, daftar akordeon Pertemuan 1 s.d. 16. | Buka pertemuan, lihat materi, akses tugas/presensi. | Mahasiswa harus berstatus enrolled. Aktivitas tersembunyi/draft tidak tampil. |
| **Detail Tugas & Upload** | Judul, deskripsi instruksi, file soal (PDF), batas waktu, status submission, dropzone file upload, tombol submit. | Unduh soal, unggah berkas jawaban, simpan tugas. | **Validasi berkas:** Tolak jika bukan .pdf/.docx/.xlsx/.zip atau ukuran > 10MB. |
| **Lembar Penilaian Tugas (Dosen)** | Daftar mahasiswa, status penyerahan, waktu submit, tombol unduh file jawaban, **input skor numerik (0–100)**, teks feedback, tombol simpan. | Unduh jawaban, isi nilai skor angka, ketik feedback, simpan nilai. | **Validasi skor:** Angka numerik dalam rentang 0 s.d. 100. Peringatan jika di luar batas. |
| **Presensi Kelas** | Indikator status sesi (Buka/Tutup), tombol buka/tutup (dosen), tombol *Hadir* (mahasiswa), tabel rekap kehadiran. | Dosen: Buka/tutup sesi.<br>Mahasiswa: Klik tombol Hadir. | Mahasiswa hanya bisa klik saat status *Open*. Tolak jika status *Closed*. |
| **Halaman Kuis** | Informasi kuis, countdown timer, daftar soal, pilihan jawaban, tombol simpan & selesaikan kuis. | Jawab pertanyaan, navigasi soal, submit kuis. | Timer habis otomatis men-submit jawaban yang telah terisi. |
| **Halaman UTS / UAS** | Judul ujian, waktu pelaksanaan, status kelayakan kehadiran, lembar instruksi/soal ujian. | Buka lembar ujian, kumpulkan berkas ujian. | **Gatekeeping:** Jika persentase kehadiran < 70%, tombol ujian terkunci (*Disabled*). |
| **Manajemen Enrollment (Admin)** | Dropdown pilih kelas, tabel mahasiswa terdaftar (*enrolled*), tabel mahasiswa belum terdaftar, tombol Enroll/Unenroll. | Pilih mahasiswa dan lakukan pendaftaran ke kelas. | Mencegah duplikasi enrollment pada kelas yang sama. |

---

# 16. ROLE & PERMISSION MATRIX

| Fitur / Modul Fungsional | Mahasiswa | Dosen | Admin (Role Tunggal) |
| --- | :---: | :---: | :---: |
| **Autentikasi (Login/Logout)** | Akses Penuh | Akses Penuh | Akses Penuh |
| **Profil Pengguna (Identitas, Foto, Password)** | Kelola Milik Sendiri | Kelola Milik Sendiri | Kelola Milik Sendiri |
| **Timeline Pembelajaran** | Lihat (Kelas Sendiri) | Lihat (Kelas Diampu) | Lihat Seluruh Agenda |
| **Mata Kuliah & Kelas** | Lihat (Hanya Enrolled) | Kelola Pertemuan Kelas | **CRUD Master Kelas & Mata Kuliah** |
| **Enrollment Mahasiswa ke Kelas** | - | - | **CRUD Penuh (Pendaftaran & Pencabutan)** |
| **Materi Pembelajaran** | Lihat & Unduh | **CRUD (Unggah/Hapus)** | Monitoring |
| **Tugas Perkuliahan** | Lihat & Unduh Soal | **CRUD Tugas & Bobot** | Monitoring |
| **Penyerahan Jawaban Tugas (Submission)** | **Unggah & Ganti (Validasi File)** | Lihat & Unduh Semua | Monitoring |
| **Penilaian Tugas (Skor 0–100)** | Lihat Skor & Feedback | **Input / Update Skor (0–100)** | Monitoring & Audit |
| **Presensi Perkuliahan** | Isi Kehadiran (Sesi Buka) | **Buka, Tutup, Koreksi** | Monitoring |
| **Kuis Pembelajaran** | Kerjakan Kuis | **CRUD Kuis & Butir Soal** | Monitoring |
| **Evaluasi UTS (P-8) & UAS (P-16)** | Ikuti Ujian (Syarat Presensi) | **Kelola & Evaluasi Ujian** | Monitoring & Konfigurasi |
| **Manajemen User (Akun Pengguna)** | - | - | **CRUD Akun (Mahasiswa, Dosen, Admin)** |
| **Konfigurasi Sistem (File Size, Presensi)** | - | - | **Kelola Konfigurasi Global** |
| **Jejak Audit (Audit Log)** | - | - | **Lihat Seluruh Log Sistem** |

*Keterangan: CRUD = Create, Read, Update, Delete.*

---

# 17. MODEL PROSES SISTEM (DFD & CONTEXT DIAGRAM)

## 17.1 Context Diagram (Level 0)
Sistem SPADA LMS berinteraksi secara terpusat dengan 3 entitas eksternal:
- **Admin:** Mengirimkan data master user, master mata kuliah, penawaran kelas, pendaftaran enrollment, dan parameter konfigurasi. Menerima rekap data, laporan sistem, dan audit log.
- **Dosen:** Mengirimkan data struktur pertemuan, materi, instrumen tugas, pembukaan sesi presensi, butir kuis, soal UTS/UAS, dan skor penilaian (0–100). Menerima daftar penyerahan tugas, rekap presensi, dan data kelas.
- **Mahasiswa:** Mengirimkan berkas jawaban tugas (tervalidasi), konfirmasi presensi, jawaban kuis, dan lembar ujian. Menerima materi ajar, informasi timeline, status presensi, dan skor nilai tugas (0–100).

```
                      +---------------------------------------+
                      |                 ADMIN                 |
                      +---------------------------------------+
                        | Data User, Master Kelas,      ^
                        | Enrollment, Konfigurasi       | Laporan, Audit Log
                        v                               |
+---------------------------------------------------------------------------------+
|                                 SISTEM SPADA                                    |
|                                                                                 |
|  [P1: Auth & Profil]        [P2: Kelas & Enrollment]   [P3: Materi & Pertemuan] |
|  [P4: Tugas, Validasi, Skor][P5: Presensi Digital]     [P6: Kuis & Ujian]       |
|  [P7: Timeline & Notifikasi][P8: Audit & Konfigurasi]                           |
+---------------------------------------------------------------------------------+
   ^                                                           ^
   | Materi, Tugas, Presensi Buka,                             | Unduh Materi, Tugas, Presensi,
   | Skor SPADA (0-100), Kuis/Ujian                            | Kuis, Ujian, Data Profil
   v                                                           v
+---------------------------------------+           +---------------------------------------+
|                 DOSEN                 |           |               MAHASISWA               |
+---------------------------------------+           +---------------------------------------+
```

## 17.2 DFD Level 1 (Dekomposisi Proses)
1. **P1.0 Autentikasi & Profil Pengguna:** Memverifikasi kredensial login, mengelola token sesi, dan memfasilitasi pembaruan data profil serta kata sandi.
2. **P2.0 Manajemen Kelas & Enrollment:** Admin mengelola kelas perkuliahan dan mendaftarkan mahasiswa secara langsung ke kelas.
3. **P3.0 Manajemen Pertemuan & Materi:** Dosen mengunggah materi perkuliahan ke dalam struktur 16 pertemuan untuk diakses mahasiswa.
4. **P4.0 Manajemen Tugas & Penilaian:** Dosen merilis tugas, sistem memvalidasi unggahan berkas mahasiswa (.pdf/.docx/.xlsx/.zip, maks 10MB), dan dosen menginput skor numerik (0–100).
5. **P5.0 Pengelolaan Presensi:** Dosen membuka/menutup sesi kehadiran, mahasiswa mengisi kehadiran, sistem menghitung persentase kehadiran.
6. **P6.0 Kuis & Ujian (UTS/UAS):** Pengelolaan kuis interaktif serta gerbang ujian UTS (pertemuan 8) dan UAS (pertemuan 16) dengan validasi syarat kehadiran.
7. **P7.0 Timeline & Notifikasi:** Mengagregasikan seluruh deadline dan jadwal kegiatan ke dalam tampilan kronologis.
8. **P8.0 Konfigurasi & Audit Trail:** Menyimpan rekaman mutasi data sensitif dan konfigurasi global sistem.

---

# 18. ACTIVITY DIAGRAM UTAMA

## 18.1 Activity: Enrollment Mahasiswa oleh Admin
```
[Admin]                       [Sistem SPADA]                  [Database]
   |                                 |                             |
   |-- Pilih Menu Enrollment ------->|                             |
   |-- Pilih Kelas Perkuliahan ----->|-- Ambil Data Mahasiswa ---->|
   |                                 |<- Kirim Daftar -------------|
   |<- Tampilkan Daftar Mhs ---------|                             |
   |                                 |                             |
   |-- Pilih Mhs & Klik Enroll ----->|                             |
   |                                 |-- Validasi Duplikasi        |
   |                                 |-- Simpan Data Enrollment -->|
   |                                 |-- Catat Audit Log --------->|
   |<- Konfirmasi Berhasil ----------|                             |
```

## 18.2 Activity: Pengumpulan Tugas Mahasiswa & Validasi File
```
[Mahasiswa]                   [Sistem SPADA]                  [Storage & DB]
   |                                 |                             |
   |-- Buka Halaman Tugas ---------->|                             |
   |<- Tampilkan Form Pengumpulan ---|                             |
   |                                 |                             |
   |-- Pilih Berkas & Klik Upload -->|                             |
   |                                 |-- Cek Ekstensi File         |
   |                                 |   (Apakah .pdf/.docx/dll?)  |
   |                                 |   [TIDAK] -> Tolak Otomatis |
   |<- Tampilkan Error Ekstensi -----|                             |
   |                                 |   [YA]                      |
   |                                 |-- Cek Ukuran Berkas         |
   |                                 |   (Apakah <= 10MB?)         |
   |                                 |   [TIDAK] -> Tolak Otomatis |
   |<- Tampilkan Error Ukuran -------|                             |
   |                                 |   [YA]                      |
   |                                 |-- Simpan File ke Storage -->|
   |                                 |-- Simpan Submission & Jam ->|
   |<- Notifikasi Berhasil Submit ---|                             |
```

## 18.3 Activity: Penilaian Tugas dengan Format Skor SPADA (0–100)
```
[Dosen]                       [Sistem SPADA]                  [Database]
   |                                 |                             |
   |-- Buka Daftar Submission ------>|                             |
   |<- Tampilkan Berkas Mahasiswa ---|                             |
   |                                 |                             |
   |-- Unduh & Periksa Jawaban ----->|                             |
   |-- Masukkan Skor (0-100) --------|                             |
   |-- Masukkan Catatan Feedback --->|                             |
   |-- Klik Simpan Nilai ----------->|                             |
   |                                 |-- Validasi Rentang Skor     |
   |                                 |   (0 <= Skor <= 100)        |
   |                                 |   [TIDAK] -> Tolak Input    |
   |<- Tampilkan Error Nilai --------|                             |
   |                                 |   [YA]                      |
   |                                 |-- Update Skor & Feedback -->|
   |                                 |-- Catat Audit Log --------->|
   |<- Konfirmasi Nilai Tersimpan ---|                             |
```

---

# 19. SEQUENCE DIAGRAM UTAMA

## 19.1 Sequence Pengumpulan Tugas & Validasi Berkas
```
Mahasiswa -> UI Tugas: Pilih File Jawaban (upload)
UI Tugas -> FileValidator: Validasi Tipe File (whitelist: .pdf, .docx, .xlsx, .zip)
alt Tipe File Tidak Valid
    FileValidator --> UI Tugas: Reject (Error: "Tipe berkas tidak diizinkan")
    UI Tugas --> Mahasiswa: Tampilkan pesan gagal ekstensi
else Tipe File Valid
    FileValidator -> FileValidator: Validasi Ukuran (Size <= 10MB)
    alt Ukuran Melebihi Batas
        FileValidator --> UI Tugas: Reject (Error: "Ukuran berkas melebihi batas 10MB")
        UI Tugas --> Mahasiswa: Tampilkan pesan gagal ukuran
    else Ukuran Valid
        FileValidator -> StorageService: Simpan Berkas ke Direktori Privat
        StorageService --> FileValidator: Return file_id & metadata
        FileValidator -> AssignmentService: Submit Assignment (file_id, timestamp)
        AssignmentService -> Database: INSERT INTO submissions
        Database --> AssignmentService: Success
        AssignmentService --> UI Tugas: Submission Confirmed
        UI Tugas --> Mahasiswa: Tampilkan status "Berhasil Dikumpulkan"
    end
end
```

## 19.2 Sequence Penilaian Tugas Skor 0–100 oleh Dosen
```
Dosen -> UI Penilaian: Buka Penyerahan Tugas Mahasiswa
UI Penilaian -> AssignmentService: Get Submissions By Assignment ID
AssignmentService -> Database: SELECT * FROM submissions WHERE assignment_id = X
Database --> AssignmentService: Return List of Submissions
AssignmentService --> UI Penilaian: Render Submissions Table
Dosen -> UI Penilaian: Input Skor Numerik (0-100) & Feedback
Dosen -> UI Penilaian: Klik "Simpan Nilai"
UI Penilaian -> GradingService: SaveGrade(submission_id, score, feedback)
GradingService -> GradingService: Validate Range (0 <= score <= 100)
alt Nilai di luar batas
    GradingService --> UI Penilaian: Error ("Skor harus berada di antara 0 hingga 100")
    UI Penilaian --> Dosen: Tampilkan pesan kesalahan validasi
else Nilai Valid
    GradingService -> Database: UPDATE submissions SET score = Y, feedback = Z
    Database --> GradingService: Update Success
    GradingService -> AuditService: LogAction("GRADE_SUBMISSION", details)
    AuditService -> Database: INSERT INTO audit_logs
    GradingService --> UI Penilaian: Grade Saved Successfully
    UI Penilaian --> Dosen: Tampilkan notifikasi "Nilai berhasil disimpan"
end
```

---

# 20. SITEMAP DAN USER FLOW

## 20.1 Sitemap Mahasiswa
- **Login / Reset Password**
- **Dashboard Mahasiswa**
  - **Profil Saya** (Data Diri, Foto Profil, Ganti Password)
  - **Timeline Pembelajaran** (Urutan Deadline, Kuis, Ujian, Pertemuan)
  - **Daftar Kelas Saya**
    - **Halaman Ruang Kelas** (Pertemuan 1 s.d. 16)
      - Detail Pertemuan
      - Unduh Materi Pembelajaran
      - Presensi Perkuliahan (Isi Kehadiran saat sesi dibuka)
      - Detail Tugas (Unduh Soal, Upload Jawaban Tervalidasi, Lihat Skor 0–100 & Feedback)
      - Pengerjaan Kuis Interaktif
      - Halaman UTS (Pertemuan 8 - Cek Syarat Presensi)
      - Halaman UAS (Pertemuan 16 - Cek Syarat Presensi)
  - **Rekap Nilai & Progres Kelas**
- **Logout**

## 20.2 Sitemap Dosen
- **Login / Reset Password**
- **Dashboard Dosen**
  - **Profil Dosen** (Data Diri, Foto Profil, Ganti Password)
  - **Timeline Agenda Dosen** (Jadwal Mengajar, Deadline Tugas, Need Grading)
  - **Daftar Kelas Diampu**
    - **Ruang Kelas** (Pengaturan Pertemuan 1 s.d. 16)
      - Kelola Materi (Unggah/Edit/Hapus)
      - Kelola Presensi (Buka Sesi, Monitoring Real-time, Tutup Sesi, Koreksi)
      - Kelola Tugas (Buat Tugas, Atur Bobot, Tentukan Deadline)
        - Lembar Penilaian (Unduh Jawaban, Input Skor 0–100, Input Feedback)
      - Kelola Kuis (Buat Soal, Atur Timer, Hasil Kuis)
      - Kelola UTS (Pertemuan 8) & UAS (Pertemuan 16)
      - Rekapitulasi Nilai & Kehadiran Kelas
- **Logout**

## 20.3 Sitemap Admin (Role Tunggal)
- **Login SPADA**
- **Dashboard Admin**
  - **Profil Admin** (Data Diri, Foto Profil, Ganti Password)
  - **Manajemen Pengguna** (Data Mahasiswa, Data Dosen, Data Admin)
  - **Manajemen Akademik SPADA**
    - Master Mata Kuliah (Kode, Nama, SKS)
    - Master Kelas Perkuliahan (Penetapan Dosen Pengampu & Semester)
  - **Pusat Enrollment Mahasiswa** (Pendaftaran Mahasiswa ke Kelas & Pencabutan)
  - **Monitoring Pembelajaran SPADA** (Monitoring Aktivitas Kelas & Berkas)
  - **Konfigurasi Sistem** (Validasi Berkas: Ekstensi & Size Limit, Ambang Kehadiran Ujian)
  - **Jejak Audit (Audit Log)** (Pelacakan Aktivitas Sistem)
- **Logout**

---

# 21. API / SERVICE REQUIREMENTS

Sistem SPADA LMS mengimplementasikan antarmuka layanan berbasis RESTful API:

| HTTP Method | Endpoint API | Deskripsi Fungsi | Otorisasi Akses |
| --- | --- | --- | --- |
| `POST` | `/api/auth/login` | Autentikasi kredensial dan inisiasi sesi | Publik |
| `POST` | `/api/auth/logout` | Mengakhiri sesi aktif pengguna | Terotentikasi |
| `POST` | `/api/auth/forgot-password` | Pengajuan permintaan reset kata sandi | Publik |
| `GET` | `/api/profile` | Mengambil data profil pengguna yang login | Terotentikasi |
| `PUT` | `/api/profile` | Memperbarui data kontak dan bio profil | Terotentikasi |
| `POST` | `/api/profile/avatar` | Mengunggah dan memperbarui foto profil | Terotentikasi |
| `PUT` | `/api/profile/password` | Mengubah kata sandi akun | Terotentikasi |
| `GET` | `/api/timeline` | Mengambil daftar agenda timeline kronologis | Mahasiswa, Dosen |
| `GET` | `/api/classes` | Mengambil daftar kelas (Mahasiswa: enrolled, Dosen: diampu) | Terotentikasi |
| `GET` | `/api/classes/{id}` | Mengambil detail kelas dan daftar 16 pertemuan | Terotentikasi |
| `GET` | `/api/meetings/{id}` | Mengambil detail pertemuan dan aktivitasnya | Terotentikasi |
| `POST` | `/api/meetings/{id}/materials` | Mengunggah dan menerbitkan materi ajar | Dosen |
| `GET` | `/api/materials/{id}/download` | Mengunduh berkas materi perkuliahan | Terotentikasi (Enrolled/Dosen) |
| `POST` | `/api/meetings/{id}/assignments` | Membuat tugas baru pada pertemuan | Dosen |
| `GET` | `/api/assignments/{id}` | Mengambil detail tugas dan instruksi | Terotentikasi |
| `POST` | `/api/assignments/{id}/submissions` | Mengunggah berkas jawaban tugas (dengan validasi berkas) | Mahasiswa (Enrolled) |
| `GET` | `/api/assignments/{id}/submissions` | Mengambil daftar pengumpulan tugas mahasiswa | Dosen Pengampu |
| `GET` | `/api/submissions/{id}/file` | Mengunduh berkas jawaban tugas terproteksi | Mahasiswa Pemilik, Dosen |
| `POST` | `/api/submissions/{id}/grade` | Menyimpan evaluasi penilaian (**skor 0–100** dan feedback) | Dosen Pengampu |
| `POST` | `/api/meetings/{id}/attendance/open` | Membuka sesi presensi perkuliahan | Dosen Pengampu |
| `POST` | `/api/meetings/{id}/attendance/close` | Menutup sesi presensi perkuliahan | Dosen Pengampu |
| `POST` | `/api/attendance/{id}/check-in` | Mengisi kehadiran pada sesi presensi aktif | Mahasiswa (Enrolled) |
| `GET` | `/api/attendance/{id}/records` | Mengambil rekap kehadiran mahasiswa | Dosen Pengampu |
| `PUT` | `/api/attendance/records/{id}` | Mengoreksi status kehadiran mahasiswa | Dosen Pengampu |
| `GET` | `/api/meetings/{id}/exam/access` | Memeriksa kelayakan kehadiran untuk akses UTS/UAS | Mahasiswa (Enrolled) |
| `GET` | `/api/admin/users` | Mengambil daftar seluruh pengguna | Admin |
| `POST` | `/api/admin/users` | Membuat akun pengguna baru | Admin |
| `PUT` | `/api/admin/users/{id}` | Memperbarui data akun pengguna | Admin |
| `GET` | `/api/admin/courses` | Mengambil daftar master mata kuliah | Admin |
| `POST` | `/api/admin/courses` | Membuat master mata kuliah baru | Admin |
| `GET` | `/api/admin/classes` | Mengambil daftar seluruh kelas SPADA | Admin |
| `POST` | `/api/admin/classes` | Membuka kelas baru dan menugaskan dosen | Admin |
| `POST` | `/api/admin/enrollments` | Mendaftarkan mahasiswa ke kelas secara langsung | Admin |
| `DELETE` | `/api/admin/enrollments/{id}` | Menghapus kepesertaan mahasiswa dari kelas | Admin |
| `GET` | `/api/admin/config` | Mengambil data konfigurasi global sistem | Admin |
| `PUT` | `/api/admin/config` | Memperbarui konfigurasi berkas & kehadiran | Admin |
| `GET` | `/api/admin/audit-logs` | Mengambil riwayat log audit sistem | Admin |

---

# 22. VALIDATION & ERROR SCENARIO

| Fitur / Modul | Skenario Kondisi | Respons & Penanganan Sistem |
| --- | --- | --- |
| **Validasi Berkas** | Mahasiswa mengunggah file dengan format `.rar`, `.exe`, `.jpg`, atau `.php` pada tugas | Sistem otomatis menolak unggahan. Mengembalikan status HTTP 422 Unprocessable Entity dengan pesan: *"Format berkas tidak didukung. Harap unggah file .pdf, .docx, .xlsx, atau .zip"*. |
| **Validasi Berkas** | Mahasiswa/Dosen mengunggah berkas dengan ukuran > 10MB (misal 15MB) | Sistem otomatis menolak unggahan di gerbang pemeriksaan. Mengembalikan status HTTP 413 Payload Too Large dengan pesan: *"Ukuran berkas melebihi batas maksimal yang diizinkan (maks 10MB)"*. |
| **Penilaian Tugas** | Dosen memasukkan nilai numerik di luar rentang 0 s.d. 100 (misal: -10 atau 105) | Sistem menolak proses penyimpanan. Menampilkan pesan validasi: *"Nilai tugas wajib berupa angka antara 0 hingga 100"*. |
| **Penyerahan Tugas** | Mahasiswa mengunggah jawaban setelah batas deadline dan tugas tidak mengizinkan pengumpulan terlambat | Sistem menolak pengunggahan dengan pesan: *"Batas waktu pengumpulan tugas telah berakhir"*. |
| **Penyerahan Tugas** | Mahasiswa mengunggah jawaban setelah deadline pada tugas yang mengizinkan keterlambatan | Sistem menerima berkas, mencatat stempel waktu pengumpulan, dan otomatis menandai status penyerahan sebagai *"Terlambat (Late Submission)"*. |
| **Presensi** | Mahasiswa mencoba mengisi presensi saat sesi belum dibuka oleh dosen | Sistem menonaktifkan tombol presensi dan menolak request dengan pesan: *"Sesi presensi belum dibuka oleh dosen pengampu"*. |
| **Presensi** | Mahasiswa mengisi presensi setelah sesi ditutup | Tombol presensi berubah status menjadi *"Ditutup"*. Request ditolak dengan pesan: *"Sesi presensi telah ditutup"*. |
| **Akses Ujian (UTS/UAS)** | Mahasiswa dengan persentase kehadiran 60% mencoba mengakses ujian (ambang batas 70%) | Sistem mengunci tombol ujian dan menampilkan pesan peringatan: *"Akses ujian terkunci. Persentase kehadiran Anda (60%) tidak memenuhi ambang batas minimum (70%)"*. |
| **Keamanan Berkas** | Mahasiswa mencoba mengakses URL berkas jawaban milik mahasiswa lain | Sistem memverifikasi otorisasi sesi; jika bukan pemilik berkas dan bukan dosen pengampu kelas, sistem mengembalikan status HTTP 403 Forbidden (*"Akses ditolak"*). |
| **Akses Ruang Kelas** | Mahasiswa mencoba membuka kelas di mana ia belum dienroll oleh Admin | Sistem menolak akses masuk ke ruang kelas dan menampilkan pesan: *"Anda belum terdaftar dalam kelas perkuliahan ini"*. |

---

# 23. SYSTEM ARCHITECTURE & SECURITY DETAIL

## 23.1 Arsitektur Berlapis (Layered Architecture)
Sistem SPADA LMS dibangun menggunakan arsitektur modular berlapis:
1. **Presentation Layer (Frontend UI):** Dibangun menggunakan arsitektur web modern yang responsif, menyajikan antarmuka visual Dashboard, Timeline, Ruang Kelas, Form Upload dengan Drag-and-Drop, dan Lembar Penilaian.
2. **Application / Service Layer (Backend Logic):** Menyediakan RESTful API, menangani logika bisnis pembelajaran, validasi berkas otomatis, kalkulasi persentase presensi, kontrol akses peran, dan integrasi data.
3. **Storage & File Security Layer:** Layanan penyimpanan berkas terisolasi (*Dedicated Private Storage*). Berkas diberi nama unik (*hashed UUID filename*) untuk mencegah tabrakan nama dan potensi eksekusi skrip berbahaya.
4. **Data Layer (Database):** Basis data relasional yang menyimpan entitas pengguna, kelas, 16 pertemuan, tugas, submission, skor nilai numerik, presensi, dan jejak audit.

## 23.2 Aspek Keamanan Sistem
- **Kredensial & Autentikasi:** Menggunakan token berbasis JWT (*JSON Web Token*) atau session cookie aman (*HttpOnly, SameSite, Secure*). Password di-hash menggunakan algoritma Bcrypt/Argon2.
- **Prinsip Least Privilege:** Hak akses dibatasi secara ketat berdasarkan 3 peran utama (*Mahasiswa, Dosen, Admin*).
- **Inspeksi Berkas Berlapis:** Validasi file dilakukan dengan memeriksa ekstensi file di frontend, serta memverifikasi MIME-type asli berkas pada backend untuk mencegah manipulasi ekstensi palsu.
- **Sanitasi Input & Proteksi Injeksi:** Seluruh input dari formulir disanitasi untuk mencegah serangan *Cross-Site Scripting (XSS)* dan *SQL Injection*.
- **Audit Logging:** Setiap operasi penambahan, perubahan, dan penghapusan data krusial dicatat secara otomatis ke dalam tabel `audit_logs` yang mencakup user ID, tipe aksi, nama entitas, rincian perubahan, alamat IP, dan waktu server.

---

# 24. ANALISIS NOTIFIKASI

Sistem menyediakan modul notifikasi internal terpadu untuk menyampaikan informasi penting secara tepat waktu:

| Peristiwa / Pemicu (Trigger) | Penerima Notifikasi | Konten Notifikasi |
| --- | --- | --- |
| Dosen menerbitkan tugas baru | Mahasiswa pada kelas terkait | *"Tugas baru diterbitkan pada mata kuliah [Nama Mata Kuliah]: [Judul Tugas]. Batas waktu: [Deadline]"* |
| Pengingat deadline tugas (H-1 sebelum deadline) | Mahasiswa yang belum mengumpulkan | *"Pengingat: Tugas [Judul Tugas] pada kelas [Nama Kelas] akan berakhir dalam 24 jam"* |
| Dosen membuka sesi presensi | Mahasiswa pada kelas terkait | *"Sesi presensi untuk Pertemuan [X] mata kuliah [Nama Mata Kuliah] telah dibuka. Silakan lakukan presensi"* |
| Dosen memberikan penilaian tugas | Mahasiswa pemilik submission | *"Tugas [Judul Tugas] telah dinilai. Skor yang Anda peroleh: [Skor]/100"* |
| Dosen memperbarui/mengoreksi presensi | Mahasiswa terkait | *"Status kehadiran Anda pada Pertemuan [X] telah diperbarui menjadi [Status]"* |
| Admin melakukan enrollment ke kelas baru | Mahasiswa terkait | *"Anda telah didaftarkan ke dalam kelas perkuliahan [Nama Mata Kuliah - Kelas]"* |

---

# 25. LAPORAN & MONITORING PEMBELAJARAN

Sistem SPADA menyediakan fitur pemantauan dan rekapitulasi data untuk keperluan evaluasi akademik:
1. **Rekapitulasi Kehadiran Kelas:** Tabel rekapitulasi kehadiran per mahasiswa dari Pertemuan 1 hingga Pertemuan 16, menampilkan persentase total kehadiran dan status kelayakan ujian.
2. **Rekapitulasi Penilaian Tugas:** Tabel kompilasi perolehan skor tugas (skor 0–100) per mahasiswa untuk seluruh tugas yang diterbitkan dalam satu semester.
3. **Monitoring Progress Belajar:** Indikator visual tingkat ketuntasan aktivitas pembelajaran mahasiswa di kelas (materi diakses, tugas diserahkan, kuis diselesaikan).
4. **Laporan Aktivitas Kelas (Admin):** Ringkasan statistik aktivitas perkuliahan di SPADA, meliputi jumlah tugas aktif, total submission terkumpul, keaktifan presensi dosen, dan volume penyimpanan berkas.
5. **Ekspor Data:** Fitur ekspor rekapitulasi nilai dan presensi mahasiswa ke format spreadsheet (`.xlsx` atau `.csv`) untuk kemudahan pelaporan dosen.

---

# 26. STRATEGI PENGUJIAN & TEST CASES (TC)

| ID | Modul / Area | Skenario Pengujian | Hasil yang Diharapkan (*Expected Result*) |
| --- | --- | --- | --- |
| **TC-001** | Autentikasi | Login dengan kredensial yang valid | Pengguna berhasil masuk dan diarahkan ke dashboard sesuai role (Mahasiswa, Dosen, Admin). |
| **TC-002** | Autentikasi | Login dengan kata sandi yang salah | Sistem menolak login dan menampilkan pesan kesalahan yang sesuai. |
| **TC-003** | Profil | Pengguna memperbarui foto profil dengan format `.jpg` (ukuran 1MB) | Foto profil berhasil diunggah dan diperbarui pada antarmuka pengguna. |
| **TC-004** | Profil | Pengguna mengunggah foto profil dengan ukuran > 2MB | Sistem menolak unggahan foto dan menampilkan pesan batas ukuran file. |
| **TC-005** | Profil | Pengguna mengubah kata sandi dengan kata sandi lama yang valid | Kata sandi berhasil diubah; login berikutnya menggunakan kata sandi baru. |
| **TC-006** | Timeline | Mahasiswa membuka halaman Timeline | Sistem menampilkan urutan deadline tugas, kuis, dan pertemuan secara kronologis. |
| **TC-007** | Kelas | Mahasiswa membuka daftar kelas | Sistem hanya menampilkan kelas-kelas yang telah dienroll oleh Admin. |
| **TC-008** | Pertemuan | Dosen menyusun materi pada Pertemuan 1 s.d. 16 | Materi tersimpan dan mahasiswa yang terdaftar dapat melihat serta mengunduh berkas materi. |
| **TC-009** | Validasi File | Mahasiswa mengunggah jawaban tugas dengan file `.pdf` (ukuran 4MB) | Berkas lolos validasi, submission berhasil disimpan dengan stempel waktu server. |
| **TC-010** | Validasi File | Mahasiswa mengunggah jawaban tugas dengan format tidak sah (misal: `.exe` atau `.rar`) | **Sistem otomatis menolak unggahan** dan menampilkan pesan format berkas tidak didukung. |
| **TC-011** | Validasi File | Mahasiswa mengunggah jawaban tugas dengan ukuran melebihi batas (misal: 12MB pada limit 10MB) | **Sistem otomatis menolak unggahan** dan menampilkan pesan ukuran melebihi batas. |
| **TC-012** | Tugas | Mahasiswa mengunggah jawaban sebelum deadline | Submission tercatat tepat waktu (*On Time*). |
| **TC-013** | Penilaian | Dosen menginputkan skor evaluasi tugas sebesar `85` dan feedback | Nilai tersimpan dan mahasiswa dapat melihat perolehan skor `85/100` beserta catatan feedback. |
| **TC-014** | Penilaian | Dosen menginputkan skor evaluasi tugas sebesar `120` atau `-5` | **Sistem menolak input** dan menampilkan peringatan bahwa skor wajib berada pada rentang 0–100. |
| **TC-015** | Presensi | Mahasiswa mencoba mengisi presensi saat sesi belum dibuka oleh dosen | Tombol presensi tidak aktif dan sistem menolak permintaan kehadiran. |
| **TC-016** | Presensi | Dosen membuka sesi presensi dan mahasiswa mengisi kehadiran | Kehadiran mahasiswa berhasil tercatat dengan status *Hadir* dan stempel waktu akurat. |
| **TC-017** | Presensi | Dosen menutup sesi presensi | Mahasiswa yang belum presensi tidak dapat lagi mengisi kehadiran. |
| **TC-018** | Evaluasi UTS | Mahasiswa dengan persentase kehadiran $\ge 70\%$ mengakses UTS Pertemuan 8 | Sistem mengizinkan akses ke lembar ujian UTS. |
| **TC-019** | Evaluasi UTS | Mahasiswa dengan persentase kehadiran $< 70\%$ mengakses UTS Pertemuan 8 | **Sistem mengunci akses UTS** dan menampilkan peringatan ketidaklayakan kehadiran. |
| **TC-020** | Evaluasi UAS | Pengujian akses UAS pada Pertemuan 16 berdasarkan persentase kehadiran | Akses hanya terbuka bagi mahasiswa yang memenuhi ambang batas kehadiran minimum. |
| **TC-021** | Enrollment | Admin mendaftarkan mahasiswa ke suatu kelas | Mahasiswa langsung terdaftar dan kelas tersebut muncul pada dashboard mahasiswa secara instan. |
| **TC-022** | Otorisasi | Mahasiswa mencoba mengakses endpoint API administrasi atau URL admin | Sistem menolak akses dan mengembalikan status HTTP 403 Forbidden. |
| **TC-023** | Keamanan Berkas| Pengguna tanpa hak akses mencoba mengunduh berkas jawaban tugas mahasiswa lain | Sistem menolak permintaan unduhan (*Unauthorized / Forbidden*). |
| **TC-024** | Audit Log | Dosen mengubah skor tugas mahasiswa | Tindakan perubahan skor tercatat secara otomatis pada tabel `audit_logs`. |

---

# 27. PRIORITAS IMPLEMENTASI MVP (MINIMUM VIABLE PRODUCT)

Untuk menjamin kelancaran siklus pengembangan perangkat lunak, implementasi SPADA LMS dibagi ke dalam tahapan rilis bertahap:

| Tahapan Rilis | Fokus Fungsional & Modul Utama |
| --- | --- |
| **MVP 1 (Fondasi & Akun)** | - Sistem Autentikasi & RBAC (3 Peran: Mahasiswa, Dosen, Admin).<br>- Pengelolaan Profil Pengguna (Identitas, Foto Profil, Ganti Kata Sandi).<br>- Master Data Pengguna, Mata Kuliah, dan Pembukaan Kelas Perkuliahan.<br>- Modul Enrollment Mahasiswa ke Kelas oleh Admin (Direct Enrollment). |
| **MVP 2 (Ruang Kelas & Materi)** | - Antarmuka Ruang Kelas berbasis Struktur 16 Pertemuan.<br>- Modul Materi Perkuliahan (Unggah Materi Dosen, Unduh Materi Mahasiswa).<br>- Modul Presensi Digital (Buka Sesi, Pengisian Mahasiswa, Tutup Sesi, Rekap Kehadiran). |
| **MVP 3 (Tugas & Validasi File)** | - Modul Tugas Perkuliahan (Penerbitan Tugas, Instruksi, File Soal, Deadline, Bobot).<br>- Sistem Validasi Berkas Keamanan (Filter Ekstensi .pdf/.docx/.xlsx/.zip dan Limit Ukuran 5MB–10MB).<br>- Pengumpulan Jawaban Mahasiswa & Pencatatan Stempel Waktu.<br>- Modul Penilaian Tugas SPADA berbasis Skor Numerik (0–100) dan Feedback Dosen. |
| **MVP 4 (Timeline & Kuis)** | - Halaman & Widget Central Timeline Pembelajaran (Deadline Tugas, Kuis, Pertemuan).<br>- Modul Kuis Interaktif (Pembuatan Butir Soal, Countdown Timer, Rekap Hasil).<br>- Notifikasi Internal Sistem Pembelajaran. |
| **MVP 5 (Evaluasi Ujian & Audit)**| - Pelaksanaan UTS (Pertemuan 8) dan UAS (Pertemuan 16).<br>- Sistem Validasi Kehadiran Otomatis (*Gatekeeping* Presensi Ujian $\ge 70\%$).<br>- Rekapitulasi Nilai Akhir Kelas & Progres Pembelajaran.<br>- Modul Audit Trail & Monitoring Aktivitas Sistem untuk Admin. |
| **Pengembangan Lanjutan** | - Forum Diskusi Asinkron per Kelas / Pertemuan.<br>- Analitik Pembelajaran Lanjutan (*Learning Analytics*).<br>- Ekspor Laporan Rekapitulasi Nilai & Presensi Lanjutan ke Excel/PDF. |

---

# 28. PEMBAGIAN HANDOFF TIM

Dokumen SRS ini menjadi acuan kerja resmi bagi seluruh anggota tim pengembangan:

| Peran Tim | Tanggung Jawab & Output Utama |
| --- | --- |
| **System Analyst** | Menetapkan spesifikasi kebutuhan (SRS), aturan bisnis, alur proses DFD, diagram aktivitas, ERD, dan memverifikasi kesesuaian implementasi sistem terhadap kebutuhan SPADA LMS. |
| **UI/UX Designer** | Merancang arsitektur informasi, sitemap, wireframe, prototipe interaktif (*Figma*), antarmuka Dashboard, Widget Timeline, Ruang Kelas 16 Pertemuan, Form Upload Tugas, dan Lembar Penilaian Skor 0–100 dengan desain yang modern, konsisten, dan responsif. |
| **Programmer / Developer** | Mengimplementasikan skema basis data, RESTful API backend, logika validasi file (ekstensi & size limit), algoritma presensi & skor SPADA (0–100), antarmuka frontend, integrasi kontrol akses RBAC, dan penyimpanan berkas terproteksi. |
| **Tester / QA** | Menyusun skenario uji, mengeksekusi test case fungsional (termasuk kasus batas validasi file, penolakan file ilegal, pembatasan skor 0–100, penguncian ujian oleh presensi), pelaporan bug (*defect tracking*), dan regression testing. |

---

# 29. REQUIREMENT TRACEABILITY MATRIX

| ID Requirement | Modul Sistem Terkait | Kode Use Case | Skenario Pengujian (TC) |
| --- | --- | --- | --- |
| FR-001 s.d. FR-004 | Autentikasi & RBAC | UC-01 | TC-001, TC-002, TC-022 |
| FR-005 s.d. FR-008 | Profil Pengguna | UC-02 | TC-003, TC-004, TC-005 |
| FR-009 s.d. FR-012 | Timeline Pembelajaran | UC-03 | TC-006 |
| FR-013 s.d. FR-015, FR-030 s.d. FR-031 | Ruang Kelas & Materi (16 Pertemuan) | UC-04, UC-09 | TC-007, TC-008 |
| FR-016 s.d. FR-021, FR-032 s.d. FR-034 | Tugas & Pengumpulan Jawaban | UC-05, UC-10 | TC-009, TC-012 |
| FR-018, FR-019, FR-053, FR-054 | Sistem Validasi File (Tipe & Ukuran) | UC-05 | TC-010, TC-011 |
| FR-022, FR-035 | Penilaian Tugas Skor SPADA (0–100) | UC-11 | TC-013, TC-014 |
| FR-023 s.d. FR-024, FR-036 s.d. FR-039 | Presensi Perkuliahan | UC-06, UC-12 | TC-015, TC-016, TC-017 |
| FR-025, FR-040 s.d. FR-041 | Kuis Pembelajaran | UC-07, UC-13 | - |
| FR-026 s.d. FR-027, FR-042, FR-056 | Evaluasi UTS (P-8) & UAS (P-16) | UC-08, UC-13 | TC-018, TC-019, TC-020 |
| FR-044 s.d. FR-048 | Master Data & Enrollment (Admin) | UC-14, UC-15 | TC-021 |
| FR-049 s.d. FR-052, FR-058 | Konfigurasi, Keamanan & Audit Log | UC-16 | TC-023, TC-024 |

---

# 30. BUSINESS DECISIONS & KESIMPULAN REVISI ANALYST

## 30.1 Keputusan Bisnis yang Telah Ditetapkan (Finalized)
1. **Pelepasan Modul Eksternal:** Sistem resmi berdiri murni sebagai **SPADA Learning Management System (LMS)**. Seluruh modul SIA (KRS, KHS, Transkrip, Sidang) dan PMB ditiadakan.
2. **Penyederhanaan Peran:** Peran disederhanakan menjadi **Mahasiswa**, **Dosen**, dan **Admin (Role Tunggal)**. Peran Dosen Wali/PA dan pembagian admin multirangkap resmi ditiadakan.
3. **Mekanisme Enrollment:** Pendaftaran mahasiswa ke kelas dilakukan secara langsung oleh **Admin** tanpa alur pengajuan dan persetujuan KRS manual.
4. **Standar Penilaian Tugas:** Format penilaian tugas menggunakan format **skor numerik berstandar SPADA (0–100)**.
5. **Standar Keamanan Berkas:** Sistem wajib menolak otomatis berkas unggahan yang berada di luar ekstensi `.pdf`, `.docx`, `.xlsx`, `.zip` atau melebihi batas ukuran 5MB–10MB.
6. **Struktur Pembelajaran:** Kelas perkuliahan menggunakan struktur baku 16 pertemuan, dengan UTS di Pertemuan 8 dan UAS di Pertemuan 16.
7. **Prasyarat Ujian:** Akses ujian UTS dan UAS mewajibkan pemenuhan ambang batas persentase kehadiran minimum (default: $\ge 70\%$).

## 30.2 Kesimpulan Pembaruan
Dengan dilakukannya revisi analisis sistem ini, dokumen **Software Requirements Specification (SRS)** untuk **SPADA (Learning Management System) Universitas PGRI Semarang** telah diselaraskan sepenuhnya dengan dokumen pengarah `revisi_analyst.docx`. Dokumen ini menjadi pedoman baku tunggal (*single source of truth*) yang solid bagi tim UI/UX Designer dalam merancang antarmuka, tim Programmer dalam membangun arsitektur backend dan frontend, serta tim Quality Assurance dalam melaksanakan pengujian fungsional dan keamanan sistem.

---

**— END OF REVISED SRS —**
