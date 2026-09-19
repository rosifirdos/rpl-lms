# Product Requirements Document (PRD) - Sistem Akademik Kampus Terintegrasi

- **Nama Produk:** Portal Terintegrasi, SIA, SPADA/LMS, dan PMB Kampus
- **Target Pengguna (Aktor):** User Umum / Pengguna Publik, Calon Mahasiswa, Mahasiswa, Dosen, Dosen Wali/PA, Admin Akademik, Admin LMS, dan Super Admin

---

## 1. Latar Belakang & Tujuan Produk

Sistem Akademik Kampus Terintegrasi dirancang untuk memadukan seluruh proses administratif akademik dan kegiatan pembelajaran digital kampus ke dalam satu kesatuan sistem terpusat. Sistem menyediakan satu portal utama sebagai pintu gerbang (*single portal access*) menuju layanan Sistem Informasi Akademik (SIA), SPADA (*Learning Management System* / LMS), dan Penerimaan Mahasiswa Baru (PMB).

Integrasi ini bertujuan untuk:
- Mengeliminasi fragmentasi data akademik dan pembelajaran pada sistem yang terpisah.
- Menyediakan portal akses terpusat bagi seluruh pengguna sesuai hak akses masing-masing.
- Menghubungkan validasi akademik dengan pembelajaran secara otomatis, di mana persetujuan KRS langsung membentuk *enrollment* kelas di SPADA.
- Mengelola proses akademik lengkap melalui SIA (KRS, persetujuan, jadwal, nilai, KHS, transkrip, hingga sidang tingkat akhir).
- Mengelola proses pembelajaran digital melalui SPADA (pertemuan 1–16, materi, tugas berbasis file, kuis, presensi, UTS, UAS, dan *progress* belajar).
- Menstandarkan pencatatan digital untuk pengumpulan tugas, presensi, dan evaluasi hasil belajar.
- Menyediakan pengelolaan master data terpusat, kontrol audit, notifikasi, dan monitoring terstruktur bagi jajaran admin.

---

## 2. Ruang Lingkup Modul Sistem

Berdasarkan arsitektur pada SRS, ruang lingkup produk mencakup 9 modul inti terintegrasi serta modul pendukung kalender akademik dan forum:

1. **Modul Portal (Dashboard & Profil):** Pintu masuk utama dengan autentikasi terpadu, menampilkan profil pengguna, notifikasi, serta navigasi menuju SIA, SPADA, PMB, atau aplikasi kampus terkait sesuai hak akses peran.
2. **Modul PMB (Penerimaan Mahasiswa Baru):** Akses informasi pendaftaran publik, pembuatan akun calon mahasiswa, pengisian formulir, unggah dokumen, pemantauan seleksi, pengumuman hasil, hingga registrasi ulang.
3. **Modul SIA (Sistem Informasi Akademik):** Pengajuan dan revisi KRS, persetujuan KRS oleh Dosen Wali/PA, penjadwalan kuliah, pengelolaan nilai, penerbitan KHS, transkrip akademik, serta administrasi pendaftaran sidang tugas akhir.
4. **Modul SPADA / LMS:** Ruang kelas pembelajaran digital berbasis 16 pertemuan, distribusi materi kuliah, manajemen tugas (unggah soal & jawaban), pelaksanaan kuis, pencatatan presensi, pelaksanaan UTS/UAS, dan pemantauan capaian belajar.
5. **Modul Manajemen User & RBAC:** Pengelolaan akun, *role-based access control*, pemetaan hak akses (*permissions*), dan status keaktifan akun.
6. **Modul Master Data Akademik:** Master program studi, fakultas, kurikulum, mata kuliah, penawaran kelas, semester, tahun akademik, gedung, dan ruangan perkuliahan.
7. **Modul Kalender Akademik:** Penjadwalan periode agenda kampus (masa pengisian KRS, perkuliahan, UTS, UAS, entri nilai) yang menjadi referensi validasi pengunci otomatis sistem.
8. **Modul Notifikasi:** Pengiriman informasi pembaruan status sistem (persetujuan KRS, tugas baru, sesi presensi dibuka, rilis nilai, jadwal sidang, dan pengumuman umum).
9. **Modul Pelaporan & Monitoring:** Rekapitulasi data akademik, aktivitas pembelajaran kelas, kehadiran, nilai, monitoring pendaftaran sidang, serta ekspor data bagi pemangku kepentingan.
10. **Modul Keamanan & Audit Trail:** Pengendalian otorisasi berlapis, validasi berkas (tanpa tautan publik), manajemen sesi aman, pencatatan jejak audit (*Audit Log*), dan kesiapan pemulihan sistem.
11. **Modul Diskusi / Forum SPADA (Opsional):** Fasilitas interaksi diskusi asinkron per mata kuliah atau per pertemuan yang dapat dimoderasi oleh dosen pengampu.

---

## 3. Fitur Utama & Kebutuhan Fungsional (Epics)

### Epic 1: Portal, Autentikasi Terpusat, Profil & Navigasi
- Akses halaman depan publik dan portal aplikasi terintegrasi.
- Autentikasi kredensial (login, logout, lupa password, ganti password) dengan validasi role dan permissions.
- Manajemen profil mandiri bagi setiap pengguna (mahasiswa, dosen, staf admin).
- Dasbor kontekstual yang mengarahkan pengguna ke modul SIA atau SPADA sesuai wewenangnya.

### Epic 2: Penerimaan Mahasiswa Baru (PMB)
- Penyajian informasi jalur seleksi dan program studi bagi masyarakat/calon mahasiswa.
- Pembuatan akun pendaftar, pengisian formulir biodata, dan unggah dokumen persyaratan.
- Pemantauan status verifikasi berkas dan pengumuman hasil seleksi.
- Fasilitas registrasi ulang calon mahasiswa yang diterima untuk dikonversi menjadi data mahasiswa aktif (*BR-023*).

### Epic 3: Kalender Akademik & Konfigurasi Periode
- Pembuatan dan pengelolaan agenda kalender akademik oleh Admin Akademik/Super Admin (tanggal mulai dan selesai).
- Penggunaan periode kalender aktif sebagai acuan pengunci otomatis bagi sistem (pengisian KRS, pembukaan sesi presensi, akses ujian, dan penguncian entri nilai).
- Tampilan agenda kalender bagi mahasiswa dan dosen.

### Epic 4: Pengelolaan KRS & Integrasi Enrollment Otomatis
- Pengajuan draf KRS oleh mahasiswa pada rentang waktu kalender aktif.
- Validasi jadwal kuliah dan pengecekan bentrok jadwal secara otomatis.
- Evaluasi draf KRS oleh Dosen Wali/PA (persetujuan, pemberian catatan, atau pengembalian draf untuk revisi).
- **Otomatisasi Enrollment:** KRS yang telah berstatus disetujui secara langsung membentuk keikutsertaan (*enrollment*) kelas mahasiswa pada SPADA tanpa input manual (*BR-004*, *FR-117*).

### Epic 5: Pembelajaran Digital & Evaluasi di SPADA
- **Struktur Pembelajaran 16 Pertemuan:** Kelas dibagi terstruktur ke dalam 16 pertemuan, di mana pertemuan ke-8 dialokasikan untuk UTS dan pertemuan ke-16 untuk UAS (*BR-006 s/d BR-009*).
- **Materi & Tugas:** Dosen mengunggah materi serta instruksi tugas; mahasiswa mengunggah berkas jawaban dengan pencatatan stempel waktu (*timestamp*) server (*BR-018 s/d BR-020*).
- **Kuis & Evaluasi:** Pelaksanaan kuis berbasis pertemuan dengan pembatasan durasi dan kalkulasi skor.
- **Presensi Digital:** Sesi presensi hanya dapat diisi mahasiswa saat dibuka oleh dosen pengampu; sistem mengunci pengisian setelah sesi ditutup (*BR-012, BR-013*).
- **Gatekeeping Akses Ujian:** Sistem secara otomatis memvalidasi persentase ambang batas kehadiran minimum (misal 70%) sebelum mengizinkan mahasiswa mengakses tombol mulai UTS/UAS (*BR-014, BR-015*).

### Epic 6: Manajemen Nilai, KHS, Transkrip & Sidang
- Perhitungan nilai akhir berdasarkan akumulasi komponen penilaian pembelajaran di SPADA (tugas, kuis, presensi, UTS, UAS) yang diekstraksi ke SIA (*BR-016, FR-123, FR-124*).
- Penerbitan Kartu Hasil Studi (KHS) per semester dan transkrip akademik kumulatif.
- Pendaftaran sidang tingkat akhir oleh mahasiswa melalui SIA (unggah berkas prasyarat, verifikasi admin, penetapan jadwal sidang, dan tim dosen penguji).

### Epic 7: Monitoring Admin, Notifikasi & Audit Trail
- **Dasbor Admin Akademik:** Monitoring jumlah mahasiswa aktif, dosen, prodi, status KRS, jadwal, nilai, dan administrasi sidang.
- **Dasbor Admin LMS:** Monitoring kelas SPADA aktif, aktivitas pembelajaran harian, tugas, kuis, dan keaktifan presensi.
- **Dasbor Super Admin:** Manajemen akun user, penugasan role/permission, konfigurasi sistem, dan pemantauan audit log.
- **Audit Trail:** Segala perubahan data penting (manipulasi nilai, persetujuan KRS, modifikasi wewenang role, aksi admin sensitif) wajib tercatat di tabel audit log yang dapat dilacak (*BR-022, FR-116*).

### Epic 8: Forum Diskusi SPADA (Fitur Opsional)
- Fasilitas pembuatan topik diskusi oleh dosen per mata kuliah atau per pertemuan.
- Mahasiswa dapat memposting tanggapan dan membalas komentar diskusi yang dimoderasi oleh dosen.

---

## 4. Keamanan Sistem (Non-Functional Requirements)

Mengacu pada Bab 15 dan Bab 35 SRS, sistem wajib memenuhi kriteria berikut:
- **Keamanan Kredensial:** Kata sandi disimpan menggunakan fungsi hash satu arah yang aman (*Argon2* atau *Bcrypt*).
- **Manajemen Sesi & RBAC:** Sesi dikelola secara aman dengan token kedaluwarsa; setiap akses endpoint memverifikasi role dan permissions berdasarkan prinsip *least privilege*.
- **Privasi & Proteksi Berkas:** Berkas unggahan tugas dan ujian dari mahasiswa dilarang menggunakan tautan URL publik (wajib diakses melalui otorisasi dan kontrol akses berwenang). Validasi tipe berkas (MIME), ekstensi, dan batas ukuran maksimal dilakukan ketat di sisi server.
- **Audit Trail Menyeluruh:** Setiap mutasi data sensitif (perubahan role/permission, persetujuan KRS, pengubahan nilai, konfigurasi sistem) tercatat otomatis beserta identitas pengguna, IP address, jenis aksi, dan stempel waktu server.
- **Validasi & Integritas Input:** Seluruh input pengguna divalidasi dan disanitasi di sisi server guna mencegah ancaman injeksi dan manipulasi data.
- **Ketersediaan & Keandalan:** Menjamin ketersediaan portal dan ketepatan sinkronisasi data antar modul akademik dan LMS secara konsisten.

---

## 5. Strategi Peluncuran Produk (MVP Roadmap)

Pengembangan sistem dibagi ke dalam 6 fase rilis MVP bertahap serta fase pengembangan lanjutan (*SRS Bab 39*):

- **MVP 1:** Login, role, dashboard, profil, master data dasar (kelembagaan, kalender, mata kuliah, ruangan, akun).
- **MVP 2:** KRS, persetujuan KRS, penjadwalan kuliah, kalender akademik operasional.
- **MVP 3:** Integrasi persetujuan KRS ke enrollment otomatis, kelas SPADA, pembagian 16 pertemuan, materi kuliah.
- **MVP 4:** Pengelolaan tugas, penyerahan (*submission*) tugas, kuis, dan presensi digital.
- **MVP 5:** Pelaksanaan evaluasi UTS/UAS (gatekeeping kehadiran), perhitungan nilai akhir terintegrasi, penerbitan KHS, dan pencetakan transkrip akademik.
- **MVP 6:** Layanan pendaftaran dan penjadwalan sidang tingkat akhir, modul notifikasi terstruktur, pelaporan akademik, dan audit aktivitas penuh.
- **Pengembangan Lanjutan:** Modul forum diskusi SPADA, integrasi aplikasi eksternal kampus, peningkatan otomasi monitoring dan analitik pembelajaran.

---

## 6. Keputusan Bisnis Terbuka (Open Questions)

Sebelum arsitektur dan fungsionalitas difinalisasi ke tahap produksi, 15 butir keputusan bisnis berikut (*SRS Bab 42*) perlu dikonfirmasi oleh jajaran manajemen kampus:
1. Siapa pihak resmi yang berwenang memberikan persetujuan akhir KRS (Dosen PA, Kaprodi, atau Bagian Akademik).
2. Persentase minimum angka ambang batas kehadiran untuk dapat mengakses UTS dan UAS.
3. Kebijakan mengenai apakah pengumpulan tugas melewati batas waktu (*deadline*) masih diperbolehkan dengan penalti atau ditolak otomatis.
4. Standar batas ukuran maksimal dan tipe format berkas yang diizinkan untuk tugas mahasiswa.
5. Kepastian metode presensi yang diterapkan: tombol klik sederhana, kode OTP, kode QR, batasan waktu, geolokasi, atau kombinasi fitur tersebut.
6. Penetapan bobot standar untuk komponen nilai tugas, kuis, UTS, dan UAS.
7. Formula kalkulasi nilai akhir dan skala konversi nilai mutu (A, B+, B, dst.).
8. Aturan prosedur dan batas waktu perubahan nilai setelah nilai dipublikasikan.
9. Persyaratan dokumen wajib dan prasyarat akademik untuk pendaftaran sidang tingkat akhir.
10. Daftar aplikasi kampus lain yang akan dimunculkan pada dasbor portal mahasiswa.
11. Arsitektur implementasi SIA dan SPADA: apakah disatukan sebagai aplikasi modular (*monolith/modular monolith*) atau dipisah menjadi layanan independen terintegrasi (*microservices*).
12. Kepastian apakah modul Forum Diskusi SPADA wajib diikutsertakan pada rilis awal.
13. Struktur hierarki agenda kalender akademik dan aturan penguncian fitur berdasarkan status agenda.
14. Kebijakan penyampaian notifikasi: apakah cukup melalui antarmuka web, atau memerlukan media eksternal (Email / WhatsApp).
15. Format resmi laporan akademik yang perlu diekspor atau dicetak (PDF/Excel).