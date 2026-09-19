# Product Requirements Document (PRD) - Sistem Akademik Kampus Terintegrasi

- **Nama Produk:** Portal Terintegrasi, SIA, SPADA/LMS, dan PMB Kampus
- **Target Pengguna:** Calon Mahasiswa, Mahasiswa Aktif, Dosen, Dosen Wali/PA, Admin Akademik, Admin LMS, dan Super Admin

---

## 1. Latar Belakang & Tujuan Produk

Sistem Akademik Kampus Terintegrasi dirancang sebagai satu portal utama terpusat untuk mengelola seluruh proses administratif, akademik, dan kegiatan pembelajaran kampus. Sistem ini diciptakan untuk memecahkan masalah tersebarnya data pada sistem yang berbeda dengan memastikan alur data yang konsisten dari sejak masa penerimaan mahasiswa baru, pengisian KRS, pelaksanaan pembelajaran, hingga pendaftaran sidang tingkat akhir.

Tujuan utama pengembangan produk ini meliputi:
- Menyediakan portal akses terintegrasi antara Sistem Informasi Akademik (SIA) dan sistem manajemen pembelajaran atau SPADA.
- Menghubungkan secara otomatis validasi akademik dengan akses pembelajaran, di mana persetujuan KRS secara langsung akan membentuk enrollment mata kuliah mahasiswa di dalam SPADA.
- Mendukung otomatisasi pelaporan nilai akhir dari SPADA ke SIA untuk diubah menjadi Kartu Hasil Studi (KHS) dan transkrip nilai.

---

## 2. Ruang Lingkup Modul & Target Pengguna

Akses ke dalam modul produk akan dibagi secara ketat menggunakan Role-Based Access Control (RBAC) bagi setiap tipe pengguna.

- **Modul PMB (Penerimaan Mahasiswa Baru):** Digunakan oleh Calon Mahasiswa untuk melihat informasi pendaftaran, membuat akun, mengunggah dokumen syarat, melihat hasil seleksi, hingga melakukan registrasi ulang.
- **Modul SIA (Sistem Informasi Akademik):** Digunakan oleh Mahasiswa untuk mengajukan KRS, melihat jadwal, dan mengunduh transkrip/KHS. Dosen Wali/PA menggunakan modul ini untuk menyetujui, memberi catatan, atau merevisi draf KRS. Admin Akademik mengelola keseluruhan jadwal, kurikulum, serta syarat pendaftaran sidang.
- **Modul SPADA / LMS:** Digunakan oleh Mahasiswa untuk mengakses materi, mengunduh file tugas, mengerjakan kuis, dan mengisi kehadiran. Dosen menggunakan modul ini untuk membuka/menutup sesi presensi, mendistribusikan soal ujian, serta memeriksa jawaban tugas. Admin LMS memantau jalannya aktivitas sistem kelas SPADA.
- **Modul Kalender Akademik & Konfigurasi:** Digunakan oleh Admin Akademik dan Super Admin untuk mengatur periode agenda kampus (seperti masa KRS atau masa UTS) yang akan menjadi validasi sistem pengunci otomatis berdasarkan waktu server.

---

## 3. Fitur Utama & Kebutuhan Fungsional (Epic & Stories)

### Epic 1: Pengelolaan KRS & Integrasi Enrollment
- Sistem akan memvalidasi pengisian KRS berdasarkan periode kalender akademik yang aktif.
- Setelah Dosen Wali/PA menyetujui KRS, sistem harus menduplikasi data tersebut untuk membentuk akses kelas (enrollment) mahasiswa yang bersangkutan ke dalam SPADA tanpa perlu input manual kembali.

### Epic 2: Pembelajaran Digital & Evaluasi di SPADA
- **Struktur Kelas:** Setiap mata kuliah dibagi ke dalam 16 pertemuan, di mana pertemuan ke-8 dialokasikan untuk Ujian Tengah Semester (UTS) dan pertemuan ke-16 untuk Ujian Akhir Semester (UAS).
- **Presensi:** Sesi presensi mahasiswa hanya dapat diisi jika dosen telah membukanya secara sistem, dan mahasiswa tidak dapat mengubahnya lagi setelah dosen menutup sesi tersebut.
- **Akses Ujian (Gatekeeping):** Sebelum menampilkan tombol mulai UTS atau UAS, sistem wajib memvalidasi ambang batas kehadiran mahasiswa (misalnya 70%) secara otomatis.
- **Manajemen Tugas:** Dosen dapat mengunggah instruksi tugas (berupa PDF), dan sistem akan mencatat jejak waktu setiap file jawaban yang diunggah oleh mahasiswa.

### Epic 3: Manajemen Nilai & Sidang
- Seluruh komponen nilai (tugas, kuis, kehadiran, UTS, dan UAS) dari SPADA akan diekstraksi ke SIA untuk membentuk nilai akhir.
- Mahasiswa tingkat akhir menggunakan SIA untuk mengunggah dokumen prasyarat pendaftaran sidang dan memantau status penjadwalannya.

---

## 4. Keamanan Sistem (Non-Functional Requirements)

- **Privasi File:** File hasil unggahan tugas dan ujian dari mahasiswa dilarang menggunakan tautan URL publik (harus divalidasi dengan otorisasi pengakses yang berwenang).
- **Audit Trail:** Segala jenis perubahan data krusial, seperti manipulasi nilai ujian, persetujuan KRS, atau perubahan wewenang Role, harus tersimpan di dalam fitur Audit Log yang dapat dilacak.
- **Validasi Keamanan:** Sistem menerapkan hashing pada kata sandi pengguna dan memvalidasi ukuran serta format data dari dokumen yang diunggah sistem.

---

## 5. Strategi Peluncuran Produk (MVP)

Pengembangan produk dilakukan secara inkremental dalam enam tahap (MVP):
- **MVP 1:** Pembuatan dasbor portal, autentikasi login berdasarkan role, serta modul master data.
- **MVP 2:** Peluncuran fitur pengajuan KRS, fungsi persetujuan Dosen Wali/PA, penjadwalan kelas, serta kalender akademik.
- **MVP 3:** Integrasi persetujuan KRS untuk pembuatan enrollment ke LMS SPADA, berikut akses pembagian pertemuan dan materi kelas.
- **MVP 4:** Peluncuran interaksi pembelajaran harian meliputi fitur tugas mahasiswa, kuis, dan pencatatan presensi digital.
- **MVP 5:** Rilis sistem pelaksanaan evaluasi ujian (UTS & UAS), perhitungan nilai akhir, pembentukan KHS, dan pencetakan transkrip akademik.
- **MVP 6:** Pembuatan layanan pendaftaran tugas akhir/sidang, integrasi modul notifikasi interaktif, sistem pelaporan terstruktur, dan fitur rekam audit (audit log).

---

## 6. Keputusan Bisnis Terbuka (Open Questions)

Sebelum System Analyst melakukan finalisasi ke Programmer, tim bisnis universitas perlu mengonfirmasi poin-poin keputusan berikut:
- Format validasi, jenis prasyarat, dan siapa otoritas paling berwenang secara resmi dalam persetujuan akhir KRS.
- Persentase angka ambang batas tingkat kehadiran untuk syarat mengakses UTS dan UAS.
- Aturan penalti atau apakah sistem akan mengizinkan unggahan jawaban tugas jika telah melewati masa keterlambatan (deadline).
- Standar batas ukuran maksimal dan tipe format dari file tugas mahasiswa.
- Kepastian apakah metode presensi menggunakan format tunggal (klik), berbasis waktu, berbasis lokasi, menggunakan validasi QR, atau kombinasi dari fungsi-fungsi tersebut.
- Apakah fitur Forum Diskusi di dalam SPADA benar-benar masuk sebagai lingkup spesifikasi di rilis pertama ini.