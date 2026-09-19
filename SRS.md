# SOFTWARE REQUIREMENT SYSTEM

## LMS (Learning management system)

### PGRI University of Semarang

#### TEAM MEMBANGUN NEGERI

![Logo Brawijaya University / Team Membangun Negeri](media/image1.png)

**PORTAL • SIA • SPADA/LMS • PMB**

**Dokumen System Analysis / Software Requirements Specification (SRS)**

Mencakup kebutuhan Calon Mahasiswa, Mahasiswa, Dosen, Admin, dan pengguna sistem lainnya.

---

# 1. PENDAHULUAN

## 1.1 Latar Belakang

Sistem Akademik Kampus Terintegrasi merupakan sistem yang dirancang untuk mengelola proses akademik dan pembelajaran kampus secara terintegrasi. Sistem menyediakan satu portal utama yang menjadi pintu masuk menuju layanan akademik dan pembelajaran.

Sistem terdiri dari Portal/Dashboard, Sistem Informasi Akademik (SIA), dan SPADA sebagai Learning Management System (LMS). SIA berfokus pada administrasi dan informasi akademik, sedangkan SPADA berfokus pada kegiatan pembelajaran. Portal menghubungkan pengguna dengan aplikasi yang sesuai berdasarkan hak akses.

## 1.2 Identifikasi Masalah

- Data akademik dan pembelajaran berpotensi tersebar pada sistem berbeda tanpa integrasi.
- Mahasiswa membutuhkan satu portal untuk mengakses layanan kampus.
- Proses KRS, pembelajaran, nilai, dan administrasi sidang membutuhkan alur data yang konsisten.
- Pengumpulan tugas dan presensi membutuhkan pencatatan digital yang terstruktur.
- Admin membutuhkan pengelolaan master data dan monitoring yang terpusat.

## 1.3 Tujuan Sistem

- Menyediakan portal kampus yang terintegrasi.
- Mengelola proses akademik melalui SIA.
- Mengelola proses pembelajaran melalui SPADA.
- Menghubungkan KRS yang disetujui dengan enrollment SPADA.
- Menyediakan pengumpulan tugas berbasis file.
- Menyediakan presensi, kuis, UTS, UAS, dan pengelolaan nilai.
- Menyediakan KHS, transkrip, dan layanan sidang melalui SIA.
- Mendukung pekerjaan admin, dosen, dan mahasiswa secara terstruktur.

## 1.4 Ruang Lingkup

- Portal/Dashboard.
- PMB/Calon Mahasiswa.
- SIA: KRS, persetujuan KRS, jadwal, nilai, KHS, transkrip, sidang.
- SPADA: mata kuliah, pertemuan 1–16, materi, tugas, kuis, presensi, UTS, UAS, progress.
- Manajemen pengguna, role, master data, notifikasi, laporan, keamanan, audit, dan konfigurasi.

# 2. KONSEP DAN ARSITEKTUR SISTEM

Portal utama berfungsi sebagai pusat akses. SIA dan SPADA memiliki fungsi berbeda tetapi berbagi identitas dan data akademik yang diperlukan.

PORTAL / DASHBOARD → SIA → KRS, Jadwal, Nilai, KHS, Transkrip, Sidang

PORTAL / DASHBOARD → SPADA → Mata Kuliah, Pertemuan, Materi, Tugas, Kuis, Presensi, UTS, UAS

Alur integrasi utama: PMB → Mahasiswa Aktif → KRS → Persetujuan → Enrollment SPADA → Pembelajaran → Nilai → SIA → KHS/Transkrip → Sidang.

# 3. AKTOR DAN HAK AKSES

| Aktor | Hak/Fungsi Utama |
| --- | --- |
| User Umum / Pengguna | Pengguna yang mengakses layanan publik atau halaman awal sesuai hak akses. |
| Calon Mahasiswa | Mengakses informasi PMB, membuat akun, mengisi pendaftaran, upload dokumen, melihat status dan hasil seleksi. |
| Mahasiswa | Menggunakan SIA untuk layanan akademik dan SPADA untuk pembelajaran. |
| Dosen | Mengelola pembelajaran kelas yang diampu, tugas, kuis, presensi, dan nilai. |
| Dosen Wali/PA | Memeriksa, menyetujui, atau mengembalikan KRS mahasiswa sesuai kewenangan. |
| Admin Akademik | Mengelola data akademik, KRS, jadwal, nilai, KHS, transkrip, sidang, dan laporan. |
| Admin LMS | Mengelola konfigurasi dan monitoring SPADA/LMS. |
| Super Admin | Mengelola user, role, permission, konfigurasi sistem, dan audit. |

# 4. ALUR SISTEM BERDASARKAN AKTOR

## 4.1 Alur User Umum

1. Membuka portal.
2. Melihat informasi yang bersifat publik.
3. Memilih layanan yang tersedia.
4. Jika membutuhkan layanan terproteksi, pengguna diarahkan untuk login atau registrasi.

## 4.2 Alur Calon Mahasiswa / PMB

1. Melihat informasi PMB dan program studi.
2. Membuat akun calon mahasiswa.
3. Login.
4. Memilih jalur pendaftaran.
5. Mengisi formulir pendaftaran.
6. Mengunggah dokumen.
7. Mengajukan pendaftaran.
8. Memantau status verifikasi dan seleksi.
9. Melihat hasil seleksi.
10. Jika diterima, melakukan registrasi ulang sesuai kebijakan kampus.
11. Setelah menjadi mahasiswa aktif, data akademik dapat digunakan untuk SIA.

## 4.3 Alur Mahasiswa

1. Login ke portal.
2. Memilih SIA atau SPADA.
3. Di SIA: mengisi KRS dan mengajukan persetujuan.
4. Setelah KRS disetujui, sistem membentuk enrollment SPADA.
5. Di SPADA: mengikuti mata kuliah dan pertemuan.
6. Mengakses materi, mengunduh soal tugas, mengunggah jawaban, mengerjakan kuis, dan mengisi presensi.
7. Mengikuti UTS pada pertemuan 8 dan UAS pada pertemuan 16 jika memenuhi syarat.
8. Melihat nilai akademik, KHS, dan transkrip melalui SIA.
9. Jika tingkat akhir dan memenuhi syarat, mendaftar sidang melalui SIA.

## 4.4 Alur Dosen

1. Login.
2. Melihat mata kuliah/kelas yang diampu.
3. Membuat dan mengatur pertemuan.
4. Mengunggah materi.
5. Membuat tugas dan mengunggah file soal.
6. Memeriksa file jawaban mahasiswa dan memberikan nilai/feedback.
7. Membuat kuis dan melihat hasil.
8. Membuka dan menutup presensi.
9. Mengelola UTS/UAS pada pertemuan 8/16.
10. Mengelola nilai sesuai kewenangan.

## 4.5 Alur Admin

1. Login.
2. Mengelola data user dan role sesuai kewenangan.
3. Mengelola mahasiswa, dosen, prodi, kurikulum, mata kuliah, kelas, semester, jadwal.
4. Mengelola periode KRS dan konfigurasi akademik.
5. Memantau proses KRS, SPADA, nilai, dan sidang.
6. Mengelola laporan dan konfigurasi sistem.

# 5. STRUKTUR MODUL SISTEM

| Modul | Fungsi |
| --- | --- |
| Portal | Dashboard, profil, notifikasi, akses SIA, SPADA, dan aplikasi kampus lain. |
| PMB | Informasi penerimaan, registrasi akun, formulir, dokumen, seleksi, hasil, registrasi ulang. |
| SIA | KRS, persetujuan, jadwal, nilai, KHS, transkrip, sidang. |
| SPADA/LMS | Mata kuliah, pertemuan, materi, tugas, kuis, presensi, UTS, UAS, progress. |
| Manajemen User | Akun, role, permission, status akun. |
| Master Akademik | Prodi, kurikulum, mata kuliah, kelas, semester, tahun akademik, ruangan. |
| Notifikasi | Informasi perubahan status KRS, tugas, presensi, nilai, sidang, dan pengumuman. |
| Pelaporan | Rekap akademik, KRS, presensi, tugas, nilai, dan sidang sesuai hak akses. |
| Keamanan & Audit | Kontrol akses, validasi file, session, audit aktivitas, backup. |

# 6. ANALISIS MODUL SIA

## 6.1 KRS

Mahasiswa mengisi KRS pada periode yang ditentukan. Sistem menampilkan mata kuliah/kelas yang dapat diambil berdasarkan kurikulum, semester, dan aturan akademik. KRS dapat disimpan sebagai draft, diajukan, disetujui, atau dikembalikan untuk revisi.

Catatan: pihak resmi yang menyetujui KRS perlu dikonfirmasi dengan kebijakan kampus. Dokumen ini menggunakan Dosen Wali/PA sebagai asumsi kerja.

## 6.2 Jadwal Kuliah

Jadwal menampilkan mata kuliah, kelas, dosen, hari, waktu, dan ruangan berdasarkan data akademik dan KRS yang disetujui.

## 6.3 Nilai

Nilai akademik dikelola sesuai kewenangan. Nilai tugas, kuis, UTS, dan UAS dari SPADA dapat menjadi komponen pembentukan nilai mata kuliah sebelum data nilai final dipublikasikan ke SIA.

## 6.4 KHS

KHS menampilkan hasil studi untuk satu semester, termasuk mata kuliah, SKS, nilai, dan IP semester. Mahasiswa melihat KHS melalui SIA.

## 6.5 Transkrip

Transkrip menampilkan riwayat nilai seluruh semester, total SKS, dan IPK.

## 6.6 Sidang

Mahasiswa tingkat akhir dapat melihat persyaratan, mengajukan pendaftaran, mengunggah dokumen, melihat status verifikasi, dan melihat jadwal sidang. Persyaratan dibuat dapat dikonfigurasi sesuai kebijakan kampus.

# 7. ANALISIS MODUL SPADA / LMS

## 7.1 Konsep Mata Kuliah

Mata Kuliah merupakan container utama pembelajaran. Mata kuliah yang tampil kepada mahasiswa berasal dari enrollment berdasarkan KRS yang telah disetujui. Mahasiswa tidak menambahkan mata kuliah secara manual.

## 7.2 Struktur Pembelajaran

Mata Kuliah → Kelas → Pertemuan → Aktivitas.

Aktivitas pembelajaran terdiri dari Materi, Tugas, Kuis, dan Presensi. Fitur Diskusi/Forum tidak digunakan.

## 7.3 Struktur Pertemuan

- Pertemuan 1–7: pembelajaran.
- Pertemuan 8: UTS.
- Pertemuan 9–15: pembelajaran.
- Pertemuan 16: UAS.

Materi, Tugas, Kuis, dan Presensi bersifat opsional pada pertemuan pembelajaran. Aktivitas yang tidak dibuat dosen tidak ditampilkan sebagai item kosong kepada mahasiswa.

# 8. FITUR PEMBELAJARAN SPADA

## 8.1 Materi

- Dosen membuat materi pada mata kuliah/pertemuan.
- Dosen dapat mengunggah file materi.
- Mahasiswa melihat materi.
- Mahasiswa dapat mengunduh file sesuai hak akses.

## 8.2 Tugas

Dosen dapat memberikan tugas dalam bentuk instruksi dan file, umumnya PDF. Mahasiswa dapat mengunduh soal, mengerjakan, lalu mengunggah jawaban.

Alur: Dosen membuat tugas → upload soal → tentukan deadline/bobot → terbitkan → mahasiswa download → mahasiswa upload jawaban → sistem mencatat waktu → dosen memeriksa → nilai/feedback.

## 8.3 Kuis

- Dosen membuat kuis pada pertemuan.
- Dosen membuat pertanyaan dan menentukan waktu/bobot.
- Mahasiswa mengerjakan kuis.
- Sistem menyimpan jawaban dan waktu.
- Sistem dapat menghitung nilai berdasarkan konfigurasi.

## 8.4 Presensi

Dosen membuka sesi presensi terlebih dahulu. Mahasiswa hanya dapat mengisi setelah sesi dibuka. Sistem mencatat waktu dan status kehadiran. Dosen dapat menutup dan, sesuai kewenangan, mengoreksi presensi.

## 8.5 UTS dan UAS

UTS berada pada pertemuan 8 dan UAS berada pada pertemuan 16. Sebelum ujian dibuka, sistem memeriksa syarat kehadiran. Ambang minimum, misalnya 70%, sebaiknya menjadi konfigurasi akademik.

# 9. RANCANGAN DASHBOARD MAHASISWA

Dashboard utama berfungsi sebagai portal aplikasi. Contoh aplikasi: SIA dan SPADA. Aplikasi lain hanya ditampilkan jika masuk scope resmi kampus.

Setelah memilih SIA, mahasiswa melihat layanan akademik seperti KRS, Jadwal, Nilai, KHS, Transkrip, dan Sidang.

Setelah memilih SPADA, mahasiswa melihat Mata Kuliah, Pertemuan, Materi, Tugas, Kuis, Presensi, UTS, UAS, dan Progress.

Nilai akademik, KHS, dan transkrip diperiksa melalui SIA. SPADA berfokus pada proses pembelajaran.

# 10. FUNCTIONAL REQUIREMENTS

| ID | Aktor | Kebutuhan Fungsional |
| --- | --- | --- |
| FR-001 | User Umum | Sistem menampilkan portal dan informasi publik sesuai hak akses. |
| FR-002 | Calon Mahasiswa | Sistem menampilkan informasi PMB. |
| FR-003 | Calon Mahasiswa | Sistem menampilkan informasi program studi yang tersedia. |
| FR-004 | Calon Mahasiswa | Calon mahasiswa dapat membuat akun. |
| FR-005 | Calon Mahasiswa | Calon mahasiswa dapat login. |
| FR-006 | Calon Mahasiswa | Calon mahasiswa dapat memilih jalur pendaftaran. |
| FR-007 | Calon Mahasiswa | Calon mahasiswa dapat mengisi formulir pendaftaran. |
| FR-008 | Calon Mahasiswa | Calon mahasiswa dapat mengunggah dokumen pendaftaran. |
| FR-009 | Calon Mahasiswa | Calon mahasiswa dapat mengajukan formulir pendaftaran. |
| FR-010 | Calon Mahasiswa | Calon mahasiswa dapat melihat status pendaftaran. |
| FR-011 | Calon Mahasiswa | Calon mahasiswa dapat melihat hasil seleksi. |
| FR-012 | Calon Mahasiswa | Calon mahasiswa yang diterima dapat melakukan proses registrasi ulang sesuai kebijakan. |
| FR-013 | Semua Pengguna | Sistem menyediakan login. |
| FR-014 | Semua Pengguna | Sistem menyediakan logout. |
| FR-015 | Semua Pengguna | Sistem menyediakan lupa password. |
| FR-016 | Semua Pengguna | Sistem menyediakan perubahan password. |
| FR-017 | Semua Pengguna | Sistem memberikan akses berdasarkan role dan permission. |
| FR-018 | Mahasiswa | Sistem menampilkan dashboard mahasiswa. |
| FR-019 | Mahasiswa | Mahasiswa dapat mengakses SIA dari portal. |
| FR-020 | Mahasiswa | Mahasiswa dapat mengakses SPADA dari portal. |
| FR-021 | Mahasiswa | Mahasiswa dapat melihat profil dan notifikasi. |
| FR-022 | Mahasiswa | Mahasiswa dapat melihat periode KRS yang aktif. |
| FR-023 | Mahasiswa | Mahasiswa dapat melihat mata kuliah/kelas yang dapat diambil. |
| FR-024 | Mahasiswa | Mahasiswa dapat memilih mata kuliah/kelas untuk KRS. |
| FR-025 | Mahasiswa | Sistem memvalidasi KRS sebelum pengajuan. |
| FR-026 | Mahasiswa | Sistem menampilkan total SKS. |
| FR-027 | Mahasiswa | Mahasiswa dapat menyimpan KRS sebagai draft. |
| FR-028 | Mahasiswa | Mahasiswa dapat mengajukan KRS. |
| FR-029 | Mahasiswa | Mahasiswa dapat melihat status KRS. |
| FR-030 | Mahasiswa | Mahasiswa dapat memperbaiki KRS yang dikembalikan. |
| FR-031 | Dosen Wali/PA | Dosen Wali/PA dapat melihat daftar KRS mahasiswa bimbingannya. |
| FR-032 | Dosen Wali/PA | Dosen Wali/PA dapat melihat detail KRS. |
| FR-033 | Dosen Wali/PA | Dosen Wali/PA dapat menyetujui KRS. |
| FR-034 | Dosen Wali/PA | Dosen Wali/PA dapat mengembalikan KRS untuk revisi. |
| FR-035 | Dosen Wali/PA | Dosen Wali/PA dapat memberikan catatan revisi. |
| FR-036 | Mahasiswa | Sistem menampilkan jadwal berdasarkan KRS yang disetujui. |
| FR-037 | Mahasiswa | Sistem menampilkan mata kuliah, kelas, dosen, waktu, hari, dan ruangan. |
| FR-038 | Mahasiswa | Sistem menyediakan tampilan jadwal daftar/kalender. |
| FR-039 | Mahasiswa | Mahasiswa dapat melihat nilai akademik melalui SIA. |
| FR-040 | Mahasiswa | Mahasiswa dapat melihat KHS berdasarkan semester. |
| FR-041 | Mahasiswa | Sistem menampilkan IP semester. |
| FR-042 | Mahasiswa | Mahasiswa dapat melihat transkrip. |
| FR-043 | Mahasiswa | Sistem menampilkan IPK. |
| FR-044 | Mahasiswa | Mahasiswa dapat mencetak/mengunduh KHS. |
| FR-045 | Mahasiswa | Mahasiswa dapat mencetak/mengunduh transkrip. |
| FR-046 | Mahasiswa | Mahasiswa dapat melihat persyaratan sidang. |
| FR-047 | Mahasiswa | Sistem memeriksa persyaratan sidang. |
| FR-048 | Mahasiswa | Mahasiswa dapat mengajukan pendaftaran sidang. |
| FR-049 | Mahasiswa | Mahasiswa dapat mengunggah dokumen sidang. |
| FR-050 | Mahasiswa | Mahasiswa dapat melihat status pendaftaran sidang. |
| FR-051 | Mahasiswa | Mahasiswa dapat melihat jadwal sidang. |
| FR-052 | Mahasiswa | Sistem menampilkan mata kuliah SPADA berdasarkan enrollment dari KRS disetujui. |
| FR-053 | Mahasiswa | Mahasiswa dapat membuka ruang mata kuliah. |
| FR-054 | Mahasiswa | Sistem menampilkan informasi mata kuliah, kelas, dosen, SKS, dan semester. |
| FR-055 | Mahasiswa | Sistem menampilkan pertemuan 1–16. |
| FR-056 | Mahasiswa | Mahasiswa dapat melihat aktivitas yang tersedia pada pertemuan. |
| FR-057 | Mahasiswa | Mahasiswa dapat melihat dan mengunduh materi. |
| FR-058 | Mahasiswa | Mahasiswa dapat melihat tugas. |
| FR-059 | Mahasiswa | Mahasiswa dapat mengunduh file soal tugas. |
| FR-060 | Mahasiswa | Mahasiswa dapat mengunggah file jawaban tugas. |
| FR-061 | Mahasiswa | Sistem mencatat waktu pengumpulan. |
| FR-062 | Mahasiswa | Mahasiswa dapat mengganti jawaban sebelum deadline sesuai aturan. |
| FR-063 | Mahasiswa | Mahasiswa dapat mengerjakan kuis yang tersedia. |
| FR-064 | Mahasiswa | Mahasiswa dapat mengisi presensi setelah presensi dibuka. |
| FR-065 | Mahasiswa | Mahasiswa dapat melihat status presensi. |
| FR-066 | Mahasiswa | Mahasiswa yang memenuhi syarat dapat mengakses UTS. |
| FR-067 | Mahasiswa | Mahasiswa yang memenuhi syarat dapat mengakses UAS. |
| FR-068 | Mahasiswa | Mahasiswa dapat melihat progress pembelajaran. |
| FR-069 | Dosen | Dosen dapat melihat mata kuliah/kelas yang diampu. |
| FR-070 | Dosen | Dosen dapat membuat pertemuan. |
| FR-071 | Dosen | Dosen dapat menentukan judul/deskripsi pertemuan. |
| FR-072 | Dosen | Dosen dapat menentukan aktivitas yang tersedia pada pertemuan. |
| FR-073 | Dosen | Dosen dapat membuat dan mengunggah materi. |
| FR-074 | Dosen | Dosen dapat membuat tugas. |
| FR-075 | Dosen | Dosen dapat mengunggah file soal tugas. |
| FR-076 | Dosen | Dosen dapat menentukan deadline dan bobot tugas. |
| FR-077 | Dosen | Dosen dapat melihat daftar pengumpulan tugas. |
| FR-078 | Dosen | Dosen dapat melihat/mengunduh jawaban mahasiswa. |
| FR-079 | Dosen | Dosen dapat memberikan nilai dan feedback tugas. |
| FR-080 | Dosen | Dosen dapat membuat kuis. |
| FR-081 | Dosen | Dosen dapat mengelola soal kuis. |
| FR-082 | Dosen | Dosen dapat melihat hasil kuis. |
| FR-083 | Dosen | Dosen dapat membuka presensi. |
| FR-084 | Dosen | Dosen dapat melihat daftar kehadiran. |
| FR-085 | Dosen | Dosen dapat mengoreksi presensi sesuai kewenangan. |
| FR-086 | Dosen | Dosen dapat menutup presensi. |
| FR-087 | Dosen | Dosen dapat mengelola UTS pada pertemuan 8. |
| FR-088 | Dosen | Dosen dapat mengelola UAS pada pertemuan 16. |
| FR-089 | Dosen | Dosen dapat mengelola komponen nilai. |
| FR-090 | Dosen | Dosen dapat melihat rekap nilai. |
| FR-091 | Dosen | Dosen dapat memasukkan/mengoreksi nilai sesuai kewenangan. |
| FR-092 | Admin Akademik | Admin dapat mengelola data mahasiswa. |
| FR-093 | Admin Akademik | Admin dapat mengelola data dosen. |
| FR-094 | Admin Akademik | Admin dapat mengelola program studi. |
| FR-095 | Admin Akademik | Admin dapat mengelola kurikulum. |
| FR-096 | Admin Akademik | Admin dapat mengelola mata kuliah. |
| FR-097 | Admin Akademik | Admin dapat mengelola kelas. |
| FR-098 | Admin Akademik | Admin dapat mengelola semester/tahun akademik. |
| FR-099 | Admin Akademik | Admin dapat mengelola ruangan. |
| FR-100 | Admin Akademik | Admin dapat mengelola jadwal kuliah. |
| FR-101 | Admin Akademik | Sistem melakukan validasi bentrok jadwal. |
| FR-102 | Admin Akademik | Admin dapat mengelola periode KRS. |
| FR-103 | Admin Akademik | Admin dapat memonitor dan mengelola proses KRS sesuai kewenangan. |
| FR-104 | Admin Akademik | Admin dapat mengelola data nilai sesuai kewenangan. |
| FR-105 | Admin Akademik | Admin dapat mengelola persyaratan sidang. |
| FR-106 | Admin Akademik | Admin dapat memverifikasi pendaftaran sidang. |
| FR-107 | Admin Akademik | Admin dapat membuat jadwal sidang. |
| FR-108 | Admin Akademik | Admin dapat mengatur pembimbing/penguji sesuai kewenangan. |
| FR-109 | Admin LMS | Admin dapat mengelola konfigurasi SPADA. |
| FR-110 | Admin LMS | Admin dapat memonitor aktivitas pembelajaran. |
| FR-111 | Admin LMS | Admin dapat memonitor tugas, kuis, dan presensi. |
| FR-112 | Super Admin | Super Admin dapat mengelola user. |
| FR-113 | Super Admin | Super Admin dapat mengelola role. |
| FR-114 | Super Admin | Super Admin dapat mengelola permission. |
| FR-115 | Super Admin | Super Admin dapat mengelola konfigurasi sistem. |
| FR-116 | Super Admin | Super Admin dapat melihat audit aktivitas penting. |
| FR-117 | Sistem | Sistem membentuk enrollment SPADA dari KRS yang disetujui. |
| FR-118 | Sistem | Sistem memvalidasi kehadiran sebelum akses UTS. |
| FR-119 | Sistem | Sistem memvalidasi kehadiran sebelum akses UAS. |
| FR-120 | Sistem | Sistem mengunci UTS/UAS bagi mahasiswa yang tidak memenuhi syarat. |
| FR-121 | Sistem | Sistem menghitung persentase kehadiran. |
| FR-122 | Sistem | Sistem menghitung progress pembelajaran berdasarkan aktivitas yang tersedia/diwajibkan. |
| FR-123 | Sistem | Sistem menghitung nilai akhir berdasarkan komponen penilaian yang dikonfigurasi. |
| FR-124 | Sistem | Sistem mengintegrasikan nilai akhir ke modul akademik/SIA. |
| FR-125 | Sistem | Sistem mengirim notifikasi perubahan status dan aktivitas sesuai konfigurasi. |

# 11. BUSINESS RULES

| ID | Aturan |
| --- | --- |
| BR-001 | KRS hanya dapat diisi pada periode KRS yang aktif. |
| BR-002 | KRS harus diajukan dan disetujui sebelum menjadi dasar enrollment SPADA. |
| BR-003 | KRS yang dikembalikan dapat direvisi dan diajukan kembali. |
| BR-004 | Enrollment SPADA berasal dari KRS yang telah disetujui. |
| BR-005 | Mahasiswa tidak menambahkan mata kuliah SPADA secara manual. |
| BR-006 | Pertemuan 1–7 merupakan pembelajaran sebelum UTS. |
| BR-007 | Pertemuan 8 merupakan UTS. |
| BR-008 | Pertemuan 9–15 merupakan pembelajaran setelah UTS. |
| BR-009 | Pertemuan 16 merupakan UAS. |
| BR-010 | Materi, Tugas, Kuis, dan Presensi bersifat opsional pada pertemuan pembelajaran. |
| BR-011 | Aktivitas yang tidak diterbitkan dosen tidak ditampilkan kepada mahasiswa. |
| BR-012 | Presensi hanya dapat diisi setelah dosen membuka sesi. |
| BR-013 | Presensi yang ditutup tidak dapat diisi lagi oleh mahasiswa. |
| BR-014 | Akses UTS/UAS harus memeriksa persentase kehadiran. |
| BR-015 | Ambang kehadiran UTS/UAS dapat dikonfigurasi. |
| BR-016 | Nilai akademik, KHS, dan transkrip dilihat melalui SIA. |
| BR-017 | SPADA berfokus pada proses pembelajaran. |
| BR-018 | File soal tugas dapat diunduh mahasiswa. |
| BR-019 | Jawaban tugas disimpan dengan kontrol akses. |
| BR-020 | Sistem mencatat waktu pengumpulan tugas. |
| BR-021 | Aturan pengumpulan terlambat harus dapat dikonfigurasi. |
| BR-022 | Perubahan nilai penting harus dapat diaudit. |
| BR-023 | Status calon mahasiswa yang diterima dapat dikonversi menjadi mahasiswa aktif sesuai proses registrasi ulang. |

# 12. USE CASE UTAMA

| Aktor | Use Case |
| --- | --- |
| User Umum | Akses portal, informasi publik, login/registrasi sesuai layanan. |
| Calon Mahasiswa | Informasi PMB, registrasi akun, pendaftaran, upload dokumen, status, hasil, registrasi ulang. |
| Mahasiswa | Portal, SIA, KRS, jadwal, KHS, transkrip, sidang, SPADA, materi, tugas, kuis, presensi, UTS, UAS. |
| Dosen | Mata kuliah, pertemuan, materi, tugas, pengumpulan, kuis, presensi, UTS/UAS, nilai. |
| Dosen Wali/PA | Pemeriksaan dan persetujuan KRS. |
| Admin Akademik | Master data, KRS, jadwal, nilai, sidang, laporan. |
| Admin LMS | Konfigurasi dan monitoring SPADA. |
| Super Admin | User, role, permission, konfigurasi, audit. |

# 13. USE CASE SPECIFICATION

## UC-01 Login

Aktor: Semua pengguna. Pre-condition: akun aktif. Alur: buka login → isi kredensial → validasi → sesi dibuat → dashboard sesuai role. Jika salah, sistem menolak dan menampilkan pesan.

## UC-02 PMB

Aktor: Calon Mahasiswa. Alur: lihat informasi → buat akun → login → pilih jalur → isi formulir → upload dokumen → submit → verifikasi → seleksi → hasil → registrasi ulang jika diterima.

## UC-03 Pengajuan KRS

Aktor: Mahasiswa. Alur: pilih semester → pilih kelas/mata kuliah → validasi SKS/aturan → simpan → ajukan → menunggu persetujuan.

## UC-04 Persetujuan KRS

Aktor: Dosen Wali/PA. Alur: buka daftar → pilih mahasiswa → periksa → setujui atau kembalikan → sistem mencatat status/catatan.

## UC-05 Enrollment SPADA

Aktor: Sistem. Trigger: KRS disetujui. Alur: sistem membaca detail KRS → membentuk enrollment → mahasiswa dapat melihat mata kuliah terkait di SPADA.

## UC-06 Pengelolaan Tugas

Aktor: Dosen. Alur: pilih mata kuliah/pertemuan → buat tugas → isi instruksi/deadline/bobot → upload soal → terbitkan.

## UC-07 Pengumpulan Tugas

Aktor: Mahasiswa. Alur: buka tugas → download PDF → kerjakan → upload jawaban → validasi → kumpulkan → waktu dicatat → dosen memeriksa.

## UC-08 Presensi

Aktor: Dosen dan Mahasiswa. Alur: dosen buka → mahasiswa isi → sistem catat → dosen tutup. Sebelum dibuka atau setelah ditutup mahasiswa tidak dapat mengisi.

## UC-09 UTS/UAS

Aktor: Mahasiswa, Dosen, Sistem. Alur: sistem cek kehadiran → jika memenuhi syarat ujian tersedia → mahasiswa mengerjakan → sistem mencatat → dosen menilai.

## UC-10 KHS

Aktor: Mahasiswa. Alur: masuk SIA → pilih KHS → pilih semester → sistem menampilkan nilai dan IP → cetak/download.

## UC-11 Sidang

Aktor: Mahasiswa dan Admin Akademik. Alur: cek syarat → isi formulir → upload dokumen → submit → admin verifikasi → penjadwalan → mahasiswa melihat jadwal.

# 14. KONSEP DATA DAN ENTITAS

| Entitas | Keterangan |
| --- | --- |
| User | Akun pengguna, kredensial, status. |
| Role / Permission | Hak akses sistem. |
| Calon Mahasiswa | Data pendaftar PMB. |
| Pendaftaran PMB | Data formulir dan status proses pendaftaran. |
| Dokumen PMB | File persyaratan pendaftaran. |
| Mahasiswa | Data identitas dan akademik mahasiswa. |
| Dosen | Data identitas dosen. |
| Program Studi | Data program studi. |
| Kurikulum | Struktur kurikulum. |
| Mata Kuliah | Data mata kuliah dan SKS. |
| Semester / Tahun Akademik | Periode akademik. |
| Kelas | Penawaran kelas mata kuliah. |
| Ruangan | Data ruang kuliah. |
| Jadwal | Jadwal kelas. |
| KRS | Header KRS mahasiswa. |
| KRS Detail | Mata kuliah/kelas dalam KRS. |
| Enrollment | Keikutsertaan mahasiswa pada kelas SPADA. |
| Pertemuan | Pertemuan 1–16. |
| Materi | Materi/file pembelajaran. |
| Tugas | Soal, instruksi, deadline, bobot. |
| Submission | Jawaban tugas dan waktu pengumpulan. |
| Kuis / Soal / Jawaban | Data kuis dan pengerjaan. |
| Presensi / Presensi Detail | Sesi dan kehadiran mahasiswa. |
| Penilaian | Komponen nilai dan nilai akhir. |
| KHS / Transkrip | Ringkasan hasil studi dan riwayat akademik. |
| Sidang / Jadwal Sidang | Pendaftaran, verifikasi, jadwal, pembimbing/penguji. |
| File | Metadata dan kontrol akses file. |

# 15. NON-FUNCTIONAL REQUIREMENTS

| ID | Kategori | Kebutuhan |
| --- | --- | --- |
| NFR-001 | Security | Password disimpan dengan hashing aman dan session dikelola secara aman. |
| NFR-002 | Authorization | Akses fungsi dan data dibatasi berdasarkan role/permission. |
| NFR-003 | File Security | Upload divalidasi tipe, ukuran, nama, dan hak akses; file jawaban tidak boleh publik tanpa otorisasi. |
| NFR-004 | Performance | Respons sistem harus wajar pada beban normal. |
| NFR-005 | Availability | Sistem tersedia sesuai target layanan kampus. |
| NFR-006 | Backup | Data penting memiliki mekanisme backup dan recovery. |
| NFR-007 | Audit | Perubahan KRS, nilai, role, dan data penting dapat dilacak. |
| NFR-008 | Usability | Antarmuka konsisten, responsif, dan mudah digunakan. |
| NFR-009 | Maintainability | Kode modular dan terdokumentasi. |
| NFR-010 | Scalability | Sistem mampu berkembang mengikuti jumlah pengguna, prodi, kelas, dan mata kuliah. |
| NFR-011 | Compatibility | Mendukung browser modern dan perangkat mobile. |
| NFR-012 | Data Integrity | Integrasi SIA-SPADA menjaga konsistensi identitas, semester, kelas, enrollment, dan nilai. |

# 16. KEBUTUHAN UI/UX

## 16.1 Portal

- Dashboard berbentuk portal aplikasi.
- SIA dan SPADA ditampilkan sebagai aplikasi terpisah.
- Profil dan notifikasi mudah ditemukan.
- Navigasi konsisten.

## 16.2 SIA

- KRS menggunakan tabel/pilihan kelas yang jelas.
- Status KRS menggunakan label yang mudah dipahami.
- Jadwal mudah dibaca.
- KHS dan transkrip memiliki format akademik yang rapi dan siap cetak.

## 16.3 SPADA

- Mata kuliah ditampilkan sebagai card/list.
- Detail mata kuliah menampilkan dosen, kelas, semester, progress, dan kehadiran.
- Pertemuan 1–16 tersusun jelas.
- Tombol download file terlihat jelas.
- Upload tugas menampilkan nama file, status, dan waktu.
- Presensi menampilkan status belum dibuka/dibuka/sudah hadir/ditutup.
- UTS/UAS menampilkan status kelayakan.

# 17. KEBUTUHAN HANDOFF UNTUK PROGRAMMER

- Gunakan role-based access control.
- Portal, SIA, dan SPADA dapat dibuat modular tetapi menggunakan identitas pengguna yang terintegrasi.
- Gunakan relasi KRS → KRS Detail → Enrollment → Kelas → Pertemuan → Aktivitas.
- Jangan membuat enrollment SPADA dari input manual mahasiswa.
- Implementasikan validasi deadline dan waktu menggunakan waktu server.
- Simpan file dengan kontrol akses; jangan mengandalkan URL publik untuk file jawaban.
- Pisahkan data nilai pembelajaran dan nilai akademik final, tetapi sediakan integrasi yang jelas.
- Jadikan semester, periode KRS, ambang kehadiran, bobot nilai, format/ukuran file, dan aturan keterlambatan sebagai konfigurasi.
- Gunakan audit trail untuk aktivitas penting.
- Jika SIA dan SPADA merupakan aplikasi berbeda, gunakan API/service integrasi yang terdokumentasi.

# 18. STRATEGI PENGUJIAN

| ID | Area | Skenario |
| --- | --- | --- |
| TC-001 | Login | Akun valid masuk ke dashboard sesuai role. |
| TC-002 | PMB | Calon mahasiswa dapat membuat akun dan mengajukan pendaftaran. |
| TC-003 | KRS | KRS tidak dapat diajukan di luar periode aktif. |
| TC-004 | KRS | KRS yang disetujui membentuk enrollment SPADA. |
| TC-005 | SPADA | Mahasiswa hanya melihat mata kuliah enrollment-nya. |
| TC-006 | Tugas | Mahasiswa dapat mengunduh file soal PDF. |
| TC-007 | Tugas | Mahasiswa dapat upload jawaban yang valid. |
| TC-008 | Tugas | Sistem mencatat waktu pengumpulan. |
| TC-009 | Presensi | Mahasiswa tidak dapat presensi sebelum dosen membuka. |
| TC-010 | Presensi | Mahasiswa dapat presensi saat sesi terbuka. |
| TC-011 | UTS | Mahasiswa memenuhi syarat dapat mengakses UTS. |
| TC-012 | UTS | Mahasiswa tidak memenuhi syarat tidak dapat mengakses UTS. |
| TC-013 | UAS | Validasi UAS mengikuti konfigurasi. |
| TC-014 | Nilai | Nilai pembelajaran terintegrasi sesuai aturan. |
| TC-015 | KHS | Mahasiswa melihat KHS melalui SIA. |
| TC-016 | Authorization | Mahasiswa tidak dapat membuka fungsi admin/dosen. |
| TC-017 | File Security | File jawaban tidak dapat diakses pengguna tanpa hak. |

# 19. ANALISIS DASHBOARD DAN MODUL ADMIN

Admin tidak menggunakan dashboard mahasiswa. Dashboard admin menampilkan ringkasan sesuai jenis admin dan kewenangan.

## 19.1 Admin Akademik

- Jumlah mahasiswa aktif.
- Jumlah dosen.
- Jumlah program studi.
- Status periode KRS.
- Monitoring KRS diajukan/disetujui/revisi.
- Monitoring jadwal dan kelas.
- Monitoring nilai dan sidang.
- Laporan akademik.

## 19.2 Admin LMS

- Jumlah mata kuliah/kelas aktif di SPADA.
- Aktivitas pembelajaran.
- Monitoring tugas.
- Monitoring kuis.
- Monitoring presensi.
- Monitoring penggunaan SPADA.

## 19.3 Super Admin

- Jumlah user dan status akun.
- Role dan permission.
- Konfigurasi sistem.
- Audit log.
- Status layanan/integrasi.

# 20. BUSINESS DECISIONS YANG PERLU DIKONFIRMASI

- Siapa pihak resmi yang menyetujui KRS.
- Minimum kehadiran UTS dan UAS.
- Apakah pengumpulan tugas terlambat diperbolehkan.
- Format dan ukuran maksimum file.
- Metode presensi: tombol, kode, QR, waktu, lokasi, atau kombinasi.
- Bobot tugas, kuis, UTS, dan UAS.
- Formula nilai akhir.
- Aturan perubahan nilai setelah dipublikasikan.
- Persyaratan sidang dan dokumen wajib.
- Daftar aplikasi lain pada portal mahasiswa.
- Apakah SIA dan SPADA dibuat sebagai satu aplikasi modular atau aplikasi terpisah yang terintegrasi.

# 21. KESIMPULAN

Sistem Akademik Kampus Terintegrasi dibangun dengan konsep portal yang menghubungkan layanan SIA dan SPADA. Pembagian fungsi dibuat jelas agar mahasiswa mengetahui tempat setiap layanan digunakan.

SIA menjadi pusat layanan akademik: KRS, persetujuan KRS, jadwal, nilai, KHS, transkrip, dan sidang. SPADA menjadi pusat pembelajaran: mata kuliah, pertemuan, materi, tugas, kuis, presensi, UTS, UAS, dan progress.

Calon mahasiswa menggunakan modul PMB sampai proses registrasi. Setelah menjadi mahasiswa aktif, proses akademik berjalan melalui SIA dan kegiatan pembelajaran berjalan melalui SPADA. KRS yang telah disetujui menjadi dasar enrollment mata kuliah pada SPADA.

Dokumen ini menjadi baseline System Analyst untuk diteruskan kepada UI/UX Designer, Programmer, dan Tester. Tahap berikutnya dapat berupa ERD detail, activity diagram, sequence diagram, use case diagram visual, wireframe, API specification, dan test case lengkap.

# 22. ANALISIS MODUL KALENDER AKADEMIK

Kalender Akademik menjadi modul yang mengatur periode dan agenda akademik kampus. Data kalender digunakan sebagai referensi oleh SIA, SPADA, KRS, UTS, UAS, pengisian nilai, dan kegiatan akademik lainnya.

## 22.1 Fungsi Utama

- Admin Akademik dapat membuat kalender akademik berdasarkan tahun akademik dan semester.
- Admin dapat menambahkan agenda akademik beserta tanggal mulai dan tanggal selesai.
- Admin dapat menentukan status agenda aktif, akan datang, selesai, atau dibatalkan.
- Mahasiswa dan dosen dapat melihat kalender akademik sesuai hak akses.
- Sistem menggunakan periode kalender sebagai acuan untuk fitur yang memiliki batas waktu.
- Tanggal dan waktu menggunakan waktu server agar konsisten.

## 22.2 Jenis Agenda

| Agenda | Contoh Fungsi |
| --- | --- |
| Awal Semester | Menandai dimulainya kegiatan semester. |
| Perkuliahan | Menandai periode kegiatan pembelajaran. |
| KRS | Periode pengisian KRS. |
| Revisi KRS | Periode perbaikan KRS jika diberlakukan. |
| UTS | Periode pelaksanaan UTS. |
| UAS | Periode pelaksanaan UAS. |
| Pengisian Nilai | Periode input/publikasi nilai. |
| Sidang | Periode kegiatan sidang. |
| Libur | Hari/periode libur akademik. |

## 22.3 Functional Requirements Kalender

| ID | Aktor | Kebutuhan |
| --- | --- | --- |
| FR-126 | Admin Akademik | Admin dapat membuat kalender akademik. |
| FR-127 | Admin Akademik | Admin dapat mengubah kalender akademik. |
| FR-128 | Admin Akademik | Admin dapat menghapus atau menonaktifkan agenda. |
| FR-129 | Admin Akademik | Admin dapat menentukan periode mulai dan selesai. |
| FR-130 | Mahasiswa | Mahasiswa dapat melihat kalender akademik. |
| FR-131 | Dosen | Dosen dapat melihat kalender akademik. |
| FR-132 | Sistem | Sistem dapat menggunakan periode aktif sebagai acuan validasi fitur. |

# 23. ANALISIS MODUL DISKUSI / FORUM SPADA

Pada versi awal dokumen, fitur Diskusi/Forum dinyatakan tidak digunakan. Untuk melengkapi rancangan LMS, bagian ini mendefinisikan opsi fitur Forum sebagai aktivitas pembelajaran. Implementasi akhir perlu mengikuti keputusan scope tim.

## 23.1 Konsep Forum

Forum ditempatkan pada Mata Kuliah dan dapat dikaitkan dengan Pertemuan. Dosen membuat topik diskusi, mahasiswa memberikan tanggapan, dan dosen dapat memberikan tanggapan atau moderasi.

## 23.2 Fungsi Forum

- Dosen membuat topik diskusi.
- Dosen menentukan judul, deskripsi, dan periode forum.
- Mahasiswa melihat forum yang diterbitkan.
- Mahasiswa membuat posting atau tanggapan.
- Mahasiswa dapat membalas posting sesuai aturan forum.
- Dosen dapat memberikan tanggapan.
- Dosen dapat menutup forum.
- Sistem mencatat waktu posting dan identitas pengguna.
- Notifikasi dapat diberikan untuk aktivitas forum sesuai konfigurasi.

## 23.3 Functional Requirements Forum

| ID | Aktor | Kebutuhan |
| --- | --- | --- |
| FR-133 | Dosen | Dosen dapat membuat forum pada mata kuliah/pertemuan. |
| FR-134 | Dosen | Dosen dapat menentukan judul dan deskripsi forum. |
| FR-135 | Dosen | Dosen dapat menerbitkan dan menutup forum. |
| FR-136 | Mahasiswa | Mahasiswa dapat melihat forum yang tersedia. |
| FR-137 | Mahasiswa | Mahasiswa dapat membuat posting/tanggapan. |
| FR-138 | Mahasiswa | Mahasiswa dapat membalas posting sesuai aturan. |
| FR-139 | Dosen | Dosen dapat memberikan tanggapan dan moderasi. |
| FR-140 | Sistem | Sistem mencatat pengguna dan waktu aktivitas forum. |

# 24. MODEL PROSES SISTEM

## 24.1 Context Diagram (Konseptual)

Sistem dipandang sebagai satu kesatuan yang berinteraksi dengan pengguna dan layanan internal. Entitas eksternal utama adalah User Umum, Calon Mahasiswa, Mahasiswa, Dosen, Dosen Wali/PA, Admin Akademik, Admin LMS, dan Super Admin.

Aliran utama: pengguna mengirim data/login/permintaan layanan ke sistem, sedangkan sistem mengembalikan informasi, status, hasil proses, notifikasi, dan dokumen sesuai hak akses.

## 24.2 DFD Level 0 (Konseptual)

| Proses | Input Utama | Output Utama |
| --- | --- | --- |
| P1 Portal & Authentication | Kredensial, registrasi | Sesi, dashboard, hak akses |
| P2 PMB | Data pendaftaran, dokumen | Status seleksi, hasil, registrasi |
| P3 SIA | KRS, data akademik | Jadwal, nilai, KHS, transkrip, sidang |
| P4 SPADA/LMS | Materi, tugas, kuis, presensi | Aktivitas pembelajaran, progress, nilai pembelajaran |
| P5 Management | Master data, konfigurasi | Data akademik dan konfigurasi |
| P6 Notification & Audit | Perubahan status/aktivitas | Notifikasi dan audit log |
| P7 Reporting | Data akademik/LMS | Laporan dan rekap |

## 24.3 Data Store Konseptual

- D1 User, Role, Permission
- D2 Data PMB
- D3 Data Mahasiswa dan Dosen
- D4 Master Akademik
- D5 KRS dan Enrollment
- D6 Data SPADA/LMS
- D7 Nilai dan KHS/Transkrip
- D8 Sidang
- D9 Notifikasi
- D10 Audit Log
- D11 File/Metadata File
- D12 Kalender Akademik

# 25. USE CASE DIAGRAM & SPECIFICATION TAMBAHAN

Use Case Diagram visual perlu dibuat berdasarkan aktor dan use case yang telah didefinisikan. Relasi utama yang perlu ditampilkan adalah autentikasi, layanan akademik, pembelajaran, administrasi, dan monitoring.

## 25.1 Daftar Use Case

| Kode | Aktor | Use Case |
| --- | --- | --- |
| UC-01 | Semua | Login |
| UC-02 | Calon Mahasiswa | PMB |
| UC-03 | Mahasiswa | Pengajuan KRS |
| UC-04 | Dosen Wali/PA | Persetujuan KRS |
| UC-05 | Sistem | Enrollment SPADA |
| UC-06 | Dosen | Pengelolaan Tugas |
| UC-07 | Mahasiswa | Pengumpulan Tugas |
| UC-08 | Dosen/Mahasiswa | Presensi |
| UC-09 | Mahasiswa/Dosen/Sistem | UTS/UAS |
| UC-10 | Mahasiswa | KHS |
| UC-11 | Mahasiswa/Admin | Sidang |
| UC-12 | Admin Akademik | Kalender Akademik |
| UC-13 | Dosen/Mahasiswa | Forum Diskusi* |

* UC-13 hanya digunakan jika Forum masuk scope final.

# 26. ACTIVITY DIAGRAM YANG PERLU DIREPRESENTASIKAN

Diagram berikut menjadi acuan untuk pembuatan activity diagram visual.

## 26.1 Activity Pengajuan KRS

1. Mahasiswa login.
2. Sistem memeriksa periode KRS.
3. Mahasiswa memilih semester.
4. Sistem menampilkan mata kuliah/kelas yang tersedia.
5. Mahasiswa memilih mata kuliah.
6. Sistem memvalidasi aturan dan total SKS.
7. Jika valid, KRS disimpan sebagai draft.
8. Mahasiswa mengajukan KRS.
9. Sistem mengubah status menjadi diajukan.
10. Dosen Wali/PA memeriksa KRS.
11. KRS disetujui atau dikembalikan untuk revisi.
12. Jika disetujui, sistem membentuk enrollment SPADA.

## 26.2 Activity Pengumpulan Tugas

1. Mahasiswa membuka mata kuliah.
2. Mahasiswa memilih pertemuan dan tugas.
3. Sistem menampilkan instruksi, deadline, dan file soal.
4. Mahasiswa mengunduh soal.
5. Mahasiswa mengunggah jawaban.
6. Sistem memvalidasi file dan deadline.
7. Sistem menyimpan submission dan waktu pengumpulan.
8. Dosen membuka daftar submission.
9. Dosen memeriksa jawaban.
10. Dosen memberikan nilai dan feedback.

## 26.3 Activity Presensi

1. Dosen membuka sesi presensi.
2. Sistem mengubah status menjadi terbuka.
3. Mahasiswa mengisi presensi.
4. Sistem mencatat waktu dan status kehadiran.
5. Dosen melihat daftar kehadiran.
6. Dosen menutup sesi.
7. Sistem menolak pengisian setelah sesi ditutup.

## 26.4 Activity UTS/UAS

1. Mahasiswa membuka halaman ujian.
2. Sistem memeriksa enrollment.
3. Sistem memeriksa persentase kehadiran.
4. Jika memenuhi syarat, ujian dibuka.
5. Jika tidak memenuhi syarat, akses ditolak.
6. Mahasiswa mengerjakan ujian.
7. Sistem mencatat jawaban dan waktu.
8. Dosen memeriksa atau sistem menghitung nilai sesuai konfigurasi.

# 27. SEQUENCE DIAGRAM UTAMA

## 27.1 Sequence Login

User → Login Page → Authentication Service → Database User → Role/Permission → Dashboard. Sistem memvalidasi kredensial, membuat sesi, membaca role/permission, lalu mengarahkan pengguna ke dashboard sesuai hak akses.

## 27.2 Sequence KRS sampai Enrollment

Mahasiswa → KRS → Validasi Akademik → Database KRS → Dosen Wali/PA → Approval → Enrollment Service → SPADA. Trigger enrollment terjadi setelah KRS disetujui.

## 27.3 Sequence Submission Tugas

Mahasiswa → Tugas → File Validation → Storage/File Metadata → Submission → Database → Dosen. Sistem mencatat waktu server dan status submission.

## 27.4 Sequence Presensi

Dosen → Presensi Session → Status Open → Mahasiswa → Presensi → Database → Dosen. Setelah ditutup, sistem menolak submission baru.

## 27.5 Sequence Nilai

Dosen/Sistem → Komponen Nilai → Perhitungan → Nilai Akhir → SIA → KHS/Transkrip. Perubahan nilai penting dicatat pada audit log.

# 28. ERD DAN DATA DICTIONARY

ERD visual perlu dibuat berdasarkan entitas pada dokumen. Relasi utama harus menjaga alur akademik dan pembelajaran.

## 28.1 Relasi Utama

- User memiliki Role/Permission.
- User dapat memiliki profil Mahasiswa atau Dosen sesuai role.
- Mahasiswa memiliki relasi dengan Program Studi.
- Program Studi memiliki Kurikulum.
- Kurikulum memiliki Mata Kuliah.
- Mata Kuliah ditawarkan melalui Kelas.
- Kelas memiliki Dosen pengampu, Jadwal, dan Ruangan.
- Mahasiswa memiliki KRS dan KRS Detail.
- KRS Detail mengacu pada Kelas.
- KRS yang disetujui membentuk Enrollment.
- Enrollment menghubungkan Mahasiswa dengan Kelas SPADA.
- Kelas memiliki Pertemuan.
- Pertemuan memiliki Materi, Tugas, Kuis, Presensi, dan Forum jika digunakan.
- Tugas memiliki Submission.
- Kuis memiliki Soal dan Jawaban/Pengerjaan.
- Presensi memiliki detail kehadiran mahasiswa.
- Aktivitas pembelajaran menghasilkan komponen Penilaian.
- Penilaian dapat membentuk Nilai Akhir dan diintegrasikan ke SIA.
- Mahasiswa memiliki KHS dan Transkrip sebagai hasil studi.
- Mahasiswa tingkat akhir memiliki data Sidang dan Jadwal Sidang.
- Kalender Akademik menjadi referensi periode akademik.

## 28.2 Data Dictionary Minimum

| Entitas | Atribut Minimum | Keterangan |
| --- | --- | --- |
| User | id, username, email, password_hash, status | Akun pengguna. |
| Role | id, name | Kelompok hak akses. |
| Permission | id, code, name | Hak akses fungsi. |
| Mahasiswa | id, user_id, nim, nama, prodi_id, angkatan | Profil mahasiswa. |
| Dosen | id, user_id, nidn, nama | Profil dosen. |
| Program Studi | id, kode, nama | Master prodi. |
| Mata Kuliah | id, kode, nama, sks | Master mata kuliah. |
| Kelas | id, mata_kuliah_id, semester_id, dosen_id | Penawaran kelas. |
| KRS | id, mahasiswa_id, semester_id, status | Header KRS. |
| KRS Detail | id, krs_id, kelas_id | Detail mata kuliah KRS. |
| Enrollment | id, mahasiswa_id, kelas_id, status | Keikutsertaan SPADA. |
| Pertemuan | id, kelas_id, nomor, judul, status | Pertemuan 1–16. |
| Materi | id, pertemuan_id, judul, file_id | Materi pembelajaran. |
| Tugas | id, pertemuan_id, judul, deadline, bobot | Tugas. |
| Submission | id, tugas_id, mahasiswa_id, file_id, submitted_at | Jawaban tugas. |
| Kuis | id, pertemuan_id, judul, waktu, bobot | Kuis. |
| Presensi | id, pertemuan_id, status, opened_at, closed_at | Sesi presensi. |
| Presensi Detail | id, presensi_id, mahasiswa_id, status, waktu | Kehadiran. |
| Penilaian | id, enrollment_id, komponen, nilai, bobot | Komponen nilai. |
| Kalender Akademik | id, semester_id, agenda, mulai, selesai, status | Agenda akademik. |
| Notifikasi | id, user_id, judul, pesan, status_baca | Notifikasi. |
| Audit Log | id, user_id, action, entity, waktu | Jejak aktivitas penting. |
| File | id, nama, path/identifier, mime, size, owner | Metadata file. |

# 29. SITEMAP DAN USER FLOW

## 29.1 Sitemap Portal

- Beranda/Portal
- Informasi Kampus
- PMB
- Login/Registrasi
- Dashboard
- SIA
- SPADA/LMS
- Profil
- Notifikasi
- Kalender Akademik
- Logout

## 29.2 Sitemap Mahasiswa

- Dashboard Mahasiswa
- Profil
- Kalender Akademik
- SIA: KRS, Jadwal, Nilai, KHS, Transkrip, Sidang
- SPADA: Mata Kuliah, Pertemuan, Materi, Tugas, Kuis, Presensi, UTS, UAS, Progress
- Forum Diskusi jika scope final
- Notifikasi

## 29.3 Sitemap Dosen

- Dashboard Dosen
- Profil
- Kalender Akademik
- Mata Kuliah/Kelas Diampu
- Pertemuan
- Materi
- Tugas & Submission
- Kuis
- Presensi
- UTS/UAS
- Nilai
- Forum jika scope final
- Notifikasi

## 29.4 Sitemap Admin Akademik

- Dashboard
- Mahasiswa
- Dosen
- Program Studi
- Kurikulum
- Mata Kuliah
- Kelas
- Semester/Tahun Akademik
- Ruangan
- Jadwal
- Periode KRS
- Nilai
- Sidang
- Kalender Akademik
- Laporan

## 29.5 Sitemap Admin LMS

- Dashboard
- Kelas SPADA
- Monitoring Aktivitas
- Monitoring Tugas
- Monitoring Kuis
- Monitoring Presensi
- Konfigurasi SPADA
- Laporan LMS

## 29.6 Sitemap Super Admin

- Dashboard
- User
- Role
- Permission
- Konfigurasi Sistem
- Audit Log
- Status Integrasi/Layanan

# 30. PAGE SPECIFICATION UNTUK UI/UX & PROGRAMMER

| Halaman | Komponen Utama | Aksi | Validasi |
| --- | --- | --- | --- |
| Login | Username/email, password | Login, lupa password | Kredensial wajib dan akun aktif |
| Dashboard | Ringkasan, shortcut, notifikasi | Navigasi modul | Sesuai role |
| KRS | Tabel kelas, SKS, status | Tambah, hapus, simpan, ajukan | Periode, SKS, aturan akademik |
| Persetujuan KRS | Daftar mahasiswa, detail KRS | Setujui/kembalikan | Hanya PA/Dosen Wali berwenang |
| Mata Kuliah SPADA | Card/list kelas | Buka kelas | Hanya enrollment |
| Pertemuan | Daftar 1–16 | Buka pertemuan | Sesuai kelas |
| Materi | Judul, deskripsi, file | Upload/download | Hak akses & file validation |
| Tugas | Instruksi, file soal, deadline | Submit/grade | Deadline, format, ukuran |
| Kuis | Soal, timer, hasil | Kerjakan/kelola | Waktu dan enrollment |
| Presensi | Status sesi & daftar hadir | Buka/isi/tutup | Sesi dan waktu |
| UTS/UAS | Status kelayakan & ujian | Mulai/kelola | Kehadiran dan periode |
| Nilai | Komponen, bobot, nilai | Input/koreksi/publish | Hak akses & audit |
| KHS | Tabel nilai, IP | Lihat/cetak | Semester valid |
| Transkrip | Riwayat nilai, IPK | Lihat/cetak | Data akademik |
| Sidang | Persyaratan, dokumen, status | Daftar/upload | Persyaratan wajib |
| Kalender | Agenda & tanggal | Kelola/lihat | Tanggal valid |
| Forum* | Topik, posting, balasan | Buat/balas/tutup | Enrollment & periode |

* Jika Forum digunakan dalam scope final.

# 31. ROLE & PERMISSION MATRIX

| Fitur | Mhs | Dosen | PA | Admin Akademik | Admin LMS | Super Admin |
| --- | --- | --- | --- | --- | --- | --- |
| Login/Profile | RW | RW | RW | RW | RW | RW |
| KRS | CRUD sendiri | V | Approve/Return | Manage | - | - |
| Jadwal | V | V | V | CRUD | - | - |
| Materi | V/Download | CRUD | - | - | Monitor | - |
| Tugas | Submit | CRUD/Grade | - | - | Monitor | - |
| Kuis | Do | CRUD/Result | - | - | Monitor | - |
| Presensi | Input/View | Manage | - | - | Monitor | - |
| UTS/UAS | Do | Manage | - | - | Monitor | - |
| Nilai | View | Input | View sesuai kewenangan | Manage | - | - |
| Sidang | Daftar/View | - | - | Manage | - | - |
| Kalender | View | View | View | CRUD | View | Manage konfigurasi |
| Forum* | Post/Reply | CRUD/Moderate | - | - | Monitor | - |
| User | - | - | - | Sesuai kewenangan | - | CRUD |
| Role/Permission | - | - | - | - | - | CRUD |
| Audit Log | - | - | - | View sesuai kewenangan | View sesuai kewenangan | View |

Keterangan: V = View, R = Read, W = Write, CRUD = Create/Read/Update/Delete, Do = mengerjakan/mengisi. Hak aktual tetap mengikuti kebijakan kampus.

* Forum hanya jika diputuskan masuk scope final.

# 32. API / SERVICE REQUIREMENTS

Jika Portal, SIA, dan SPADA dibuat sebagai modul dalam satu aplikasi, API dapat digunakan sebagai service internal. Jika dibuat sebagai aplikasi terpisah, API menjadi mekanisme integrasi utama.

| Method | Endpoint Konseptual | Fungsi | Akses |
| --- | --- | --- | --- |
| POST | /api/login | Autentikasi pengguna | Publik |
| POST | /api/logout | Mengakhiri sesi | Semua pengguna |
| GET | /api/profile | Profil pengguna | Login |
| GET | /api/calendar | Kalender akademik | Login |
| GET | /api/krs | Mengambil KRS | Mahasiswa/PA/Admin |
| POST | /api/krs | Menyimpan/mengajukan KRS | Mahasiswa |
| POST | /api/krs/{id}/approve | Persetujuan KRS | PA/Admin sesuai kewenangan |
| GET | /api/enrollments | Daftar enrollment | Mahasiswa/Dosen |
| GET | /api/courses | Daftar mata kuliah | Sesuai role |
| GET | /api/meetings | Daftar pertemuan | Dosen/Mahasiswa |
| POST | /api/submissions | Upload jawaban | Mahasiswa |
| GET | /api/submissions | Daftar submission | Dosen |
| POST | /api/attendance | Mengisi presensi | Mahasiswa |
| POST | /api/attendance/open | Membuka presensi | Dosen |
| POST | /api/grades | Input nilai | Dosen/Admin sesuai kewenangan |
| GET | /api/transcript | Transkrip | Mahasiswa |
| POST | /api/thesis-registration | Pendaftaran sidang | Mahasiswa |

## 32.1 Aturan API

- Endpoint terproteksi harus memeriksa authentication dan authorization.
- Validasi input dilakukan di server.
- Waktu deadline menggunakan waktu server.
- File tidak disimpan sebagai URL publik tanpa kontrol akses.
- Respons API harus konsisten untuk sukses dan error.
- Perubahan data penting dicatat pada audit log.
- Integrasi SIA-SPADA harus menjaga konsistensi user, semester, kelas, enrollment, dan nilai.

# 33. VALIDATION & ERROR SCENARIO

| Fitur | Kondisi | Respons Sistem |
| --- | --- | --- |
| Login | Password salah | Login ditolak dan pesan kesalahan ditampilkan. |
| Login | Akun tidak aktif | Akses ditolak. |
| KRS | Di luar periode | Pengisian KRS ditolak. |
| KRS | Melebihi batas SKS | Pilihan ditolak dan alasan ditampilkan. |
| KRS | Bentrok aturan akademik | KRS tidak dapat diajukan sampai diperbaiki. |
| Tugas | File terlalu besar | Upload ditolak. |
| Tugas | Format file tidak sesuai | Upload ditolak. |
| Tugas | Deadline terlewati | Sistem mengikuti konfigurasi keterlambatan. |
| Presensi | Belum dibuka | Mahasiswa tidak dapat mengisi. |
| Presensi | Sudah ditutup | Mahasiswa tidak dapat mengisi. |
| UTS/UAS | Kehadiran tidak memenuhi syarat | Akses ujian ditolak. |
| Nilai | Pengguna tidak berwenang | Akses perubahan ditolak. |
| File | Pengguna bukan pemilik/berwenang | File tidak dapat diakses. |
| Forum* | Bukan peserta kelas | Akses forum ditolak. |

* Jika Forum digunakan.

# 34. SYSTEM ARCHITECTURE

Arsitektur konseptual terdiri dari Presentation Layer, Application/Service Layer, Data Layer, File Storage, dan Notification/Audit Service.

| Layer | Komponen | Fungsi |
| --- | --- | --- |
| Presentation | Web Portal, SIA, SPADA | Antarmuka pengguna. |
| Application | Auth, Academic, LMS, PMB, Sidang | Logika bisnis. |
| Integration | API/Service | Pertukaran data antar modul. |
| Data | Database | Penyimpanan data terstruktur. |
| File | File Storage | Penyimpanan materi, soal, jawaban, dokumen. |
| Support | Notification & Audit | Notifikasi dan pencatatan aktivitas. |

Arsitektur dapat diimplementasikan sebagai satu aplikasi modular atau aplikasi terpisah yang terintegrasi. Keputusan final harus mengikuti scope tim dan kebutuhan implementasi.

# 35. SECURITY & AUDIT DETAIL

- Password disimpan menggunakan hashing aman, bukan plaintext.
- Session dikelola secara aman dan diakhiri saat logout.
- Setiap endpoint memeriksa role/permission.
- File upload memvalidasi tipe, ukuran, nama, dan akses.
- File jawaban mahasiswa tidak boleh dapat diakses tanpa otorisasi.
- Input pengguna divalidasi dan disanitasi.
- Perubahan nilai, KRS, role, permission, dan data penting dicatat.
- Aksi admin sensitif dapat dicatat dengan waktu dan identitas pengguna.
- Backup data dan recovery menjadi bagian dari operasional sistem.
- Hak akses mengikuti prinsip least privilege sesuai kewenangan.

# 36. ANALISIS NOTIFIKASI

| Event | Penerima | Isi Notifikasi |
| --- | --- | --- |
| KRS diajukan | Dosen Wali/PA | Ada KRS yang menunggu pemeriksaan. |
| KRS dikembalikan | Mahasiswa | KRS perlu direvisi beserta catatan. |
| KRS disetujui | Mahasiswa | KRS telah disetujui. |
| Tugas diterbitkan | Mahasiswa | Tugas baru tersedia. |
| Deadline tugas | Mahasiswa | Pengingat deadline sesuai konfigurasi. |
| Nilai diberikan | Mahasiswa | Nilai/feedback tersedia. |
| Presensi dibuka | Mahasiswa | Sesi presensi tersedia. |
| Sidang diverifikasi | Mahasiswa | Status pendaftaran sidang berubah. |
| Jadwal sidang | Mahasiswa | Jadwal sidang tersedia. |
| Pengumuman | Target pengguna | Informasi akademik/kampus. |

# 37. LAPORAN & EXPORT

- Laporan mahasiswa aktif.
- Laporan dosen dan pengampu mata kuliah.
- Laporan KRS berdasarkan periode/semester.
- Laporan jadwal kuliah.
- Laporan presensi.
- Laporan pengumpulan tugas.
- Laporan nilai.
- Laporan KHS dan transkrip.
- Laporan pendaftaran sidang.
- Laporan aktivitas SPADA.
- Laporan audit sesuai kewenangan.
- Data dapat ditampilkan pada halaman dan, jika dibutuhkan, disiapkan untuk cetak/download.

# 38. TEST CASE TAMBAHAN

| ID | Modul | Skenario | Expected Result |
| --- | --- | --- | --- |
| TC-018 | Login | Login dengan akun tidak aktif | Akses ditolak. |
| TC-019 | Authorization | Mahasiswa membuka URL admin | Akses ditolak. |
| TC-020 | Kalender | Admin membuat agenda valid | Agenda tersimpan dan tampil. |
| TC-021 | Kalender | Tanggal selesai lebih awal dari tanggal mulai | Validasi gagal. |
| TC-022 | KRS | Mahasiswa mengisi di luar periode | Sistem menolak. |
| TC-023 | KRS | KRS disetujui | Enrollment SPADA terbentuk. |
| TC-024 | SPADA | Mahasiswa mencoba kelas yang tidak dienroll | Akses ditolak. |
| TC-025 | Tugas | Upload file valid | Submission tersimpan. |
| TC-026 | Tugas | Upload file melebihi ukuran | Upload ditolak. |
| TC-027 | Tugas | Submit setelah deadline | Sistem mengikuti aturan keterlambatan. |
| TC-028 | Presensi | Presensi sebelum dibuka | Tidak dapat mengisi. |
| TC-029 | Presensi | Presensi saat dibuka | Kehadiran tersimpan. |
| TC-030 | UTS | Kehadiran di bawah ambang | Akses UTS ditolak. |
| TC-031 | UAS | Kehadiran memenuhi ambang | Akses UAS tersedia. |
| TC-032 | Nilai | Dosen mengubah nilai | Perubahan tercatat/audit sesuai konfigurasi. |
| TC-033 | File Security | User lain membuka file jawaban | Akses ditolak. |
| TC-034 | Forum* | Mahasiswa peserta membuat posting | Posting tersimpan. |
| TC-035 | Forum* | User bukan peserta membuka forum | Akses ditolak. |
| TC-036 | Notification | KRS dikembalikan | Notifikasi diterima mahasiswa. |

* Jika Forum digunakan.

# 39. PRIORITAS IMPLEMENTASI MVP

Agar pengerjaan website dapat dilakukan bertahap, fitur dapat dibagi menjadi MVP dan pengembangan lanjutan.

| Tahap | Fitur |
| --- | --- |
| MVP 1 | Login, role, dashboard, profil, master data dasar. |
| MVP 2 | KRS, persetujuan KRS, jadwal, kalender akademik. |
| MVP 3 | Enrollment, mata kuliah SPADA, pertemuan, materi. |
| MVP 4 | Tugas, submission, kuis, presensi. |
| MVP 5 | UTS/UAS, nilai, KHS, transkrip. |
| MVP 6 | Sidang, notifikasi, laporan, audit. |
| Pengembangan | Forum diskusi, integrasi aplikasi tambahan, peningkatan monitoring dan konfigurasi. |

# 40. PEMBAGIAN HANDOFF TIM

| Peran | Output Utama |
| --- | --- |
| System Analyst | SRS, business rules, use case, activity/sequence, ERD, data dictionary, user flow, requirement. |
| UI/UX Designer | Sitemap, information architecture, wireframe, prototype, design system, responsive design. |
| Programmer | Database, backend/API, authentication, frontend, integration, file management, deployment. |
| Tester | Test scenario, test case, validation, role testing, security/file testing, bug report, regression testing. |

## 40.1 Alur Handoff

1. System Analyst menetapkan requirement dan business rules.
2. UI/UX menerjemahkan requirement menjadi sitemap, user flow, wireframe, dan prototype.
3. Programmer menggunakan SRS, ERD, API requirement, dan desain sebagai acuan implementasi.
4. Tester membuat test case berdasarkan functional requirement dan business rules.
5. Hasil testing dikembalikan kepada programmer untuk perbaikan.
6. System Analyst memverifikasi bahwa implementasi sesuai requirement.

# 41. REQUIREMENT TRACEABILITY MATRIX

| Requirement | Desain/Modul | Testing |
| --- | --- | --- |
| Login & RBAC | Authentication + Dashboard | TC-001, TC-016, TC-019 |
| KRS | SIA + KRS | TC-003, TC-004, TC-022, TC-023 |
| Enrollment | SIA-SPADA Integration | TC-004, TC-005, TC-023, TC-024 |
| Materi | SPADA Pertemuan | TC-005 |
| Tugas | SPADA Tugas + Submission | TC-006, TC-007, TC-008, TC-025–027 |
| Presensi | SPADA Presensi | TC-009, TC-010, TC-028–029 |
| UTS/UAS | Exam Service | TC-011–013, TC-030–031 |
| Nilai | Penilaian + SIA | TC-014, TC-032 |
| KHS/Transkrip | SIA | TC-015 |
| File Security | File Storage + Authorization | TC-017, TC-033 |
| Kalender | Kalender Akademik | TC-020–021 |
| Notifikasi | Notification Service | TC-036 |
| Forum* | SPADA Forum | TC-034–035 |

* Jika Forum digunakan.

# 42. BUSINESS DECISIONS FINAL YANG PERLU DIKONFIRMASI

- Siapa pihak resmi yang menyetujui KRS.
- Minimum kehadiran UTS dan UAS.
- Apakah pengumpulan tugas terlambat diperbolehkan.
- Format dan ukuran maksimum file.
- Metode presensi: tombol, kode, QR, waktu, lokasi, atau kombinasi.
- Bobot tugas, kuis, UTS, dan UAS.
- Formula nilai akhir.
- Aturan perubahan nilai setelah dipublikasikan.
- Persyaratan sidang dan dokumen wajib.
- Daftar aplikasi lain pada portal mahasiswa.
- Apakah SIA dan SPADA satu aplikasi modular atau aplikasi terpisah.
- Apakah Forum Diskusi benar-benar masuk scope implementasi.
- Struktur Kalender Akademik dan jenis agenda yang digunakan.
- Kebijakan notifikasi dan media penyampaian.
- Format laporan yang perlu dicetak/diunduh.

# 43. KESIMPULAN PEMBARUAN

Dengan penambahan kalender akademik, forum sebagai opsi aktivitas pembelajaran, model proses, sitemap, user flow, page specification, role-permission matrix, ERD/data dictionary, API/service requirement, validation/error scenario, system architecture, security detail, notification, reporting, test case, MVP, handoff tim, dan requirement traceability, dokumen ini dapat digunakan sebagai baseline yang lebih lengkap untuk proses desain dan implementasi website.

Bagian yang masih memerlukan keputusan tim ditandai sebagai business decision agar System Analyst, UI/UX Designer, Programmer, dan Tester menggunakan aturan yang sama pada tahap berikutnya.

---

**— END OF UPDATED SRS —**
