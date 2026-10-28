# Panduan Pengujian QA - Frontend SPADA LMS

Dokumen ini memuat standar verifikasi, spesifikasi interaksi antarmuka, serta panduan audit aksesibilitas untuk tim Quality Assurance (QA).

---

## 1. Aksesibilitas Dialog & Modal (WAI-ARIA Compliance)
Seluruh komponen modal wajib mematuhi standar aksesibilitas:
* Menyertakan atribut `role="dialog"` dan `aria-modal="true"`.
* Memiliki hubungan label heading melalui `aria-labelledby` yang merujuk pada elemen `id` heading (`h2` atau `h3`).
* Dapat ditutup melalui tombol *Escape* pada keyboard, tombol *Close/Batal*, atau klik backdrop.

### Registri Modal & Heading Labelledby:
1. **Master Mata Kuliah (`pages/MasterMataKuliah.jsx`):**
   * Modal Tambah/Edit MK: `aria-labelledby="modal-course-heading"` (`h2`)
   * Modal Silabus 16 Pertemuan: `aria-labelledby="modal-syllabus-heading"` (`h3`)
   * Modal Konfirmasi Hapus: `aria-labelledby="modal-delete-course-heading"` (`h3`)
2. **Pembukaan Kelas (`pages/PembukaanKelas.jsx`):**
   * Modal Konfigurasi Kelas: `aria-labelledby="modal-class-heading"` (`h2`)
   * Modal Detail Kuota Enrollment: `aria-labelledby="modal-enrollment-heading"` (`h3`)
   * Modal Konfirmasi Hapus: `aria-labelledby="modal-delete-class-heading"` (`h3`)
3. **Jejak Audit (`pages/JejakAudit.jsx`):**
   * Modal Inspeksi Perubahan Data (Diff JSON): `aria-labelledby="modal-diff-inspector-heading"` (`h3`)

---

## 2. Fitur Pintasan Keyboard (Keyboard Shortcuts)
* **Pencarian Cepat Internal (`Ctrl + F` / `Cmd + F`):**
  * **Modul:** Master Mata Kuliah dan Pembukaan Kelas.
  * **Spesifikasi:** Menangkap event `Ctrl+F` / `Cmd+F` untuk memindahkan fokus langsung ke kolom pencarian filter internal tabel.
  * **Catatan QA:** Perilaku ini dirancang secara terencana demi kenyamanan operasional admin dan **bukan merupakan bug**.
* **Tombol Escape (`Esc`):**
  * Menutup semua modal dan drawer yang sedang terbuka.

---

## 3. Siklus Hidup Notifikasi Toast & Pembersihan Timer
* Toast otomatis hilang setelah 3 detik.
* Timer toast dikelola menggunakan `useRef(null)` dengan pembersihan eksplisit (`clearTimeout`) saat unmount komponen atau pemanggilan toast baru untuk menjamin tidak ada `setState` setelah unmount.

---

## 4. Sistem Routing SPA Reaktif & Dukungan Riwayat
* **Peta Rute:**
  * Dasbor Mahasiswa (Default): `/` atau `/?page=dasbor-mahasiswa`
  * Lupa Password (Standalone Auth): `/forgot-password` atau `/?page=forgot-password`
  * Master Mata Kuliah: `/master-mata-kuliah` atau `/?page=master-mata-kuliah`
  * Pembukaan Kelas: `/pembukaan-kelas` atau `/?page=pembukaan-kelas`
  * Jejak Audit: `/jejak-audit` atau `/?page=jejak-audit`
* **Konsistensi URL:** Fungsi `navigateTo` selalu menggunakan URL absolut berbasis root (`/` atau `/?page=...`) guna mencegah penumpukan path relatif.
* **Integrasi History:** Navigasi tombol *Kembali ke Beranda* memicu `history.back()` jika riwayat sesi ada, atau mengarah ke `/`.

---

## 5. Fitur Autentikasi (Lupa Password)
* **Cooldown Kirim Ulang:** Menggunakan pola chaining `setTimeout` reaktif 60 detik.
* **Anti Double-Fire Guard:** Tombol kirim ulang dicegah dari pengiriman ganda saat status `loading` atau ketika cooldown aktif (`cooldown > 0`).
* **Konsistensi Label:** Menggunakan label *"Kembali ke Beranda"* dengan target rute `/`.
