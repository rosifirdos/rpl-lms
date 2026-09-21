# Panduan Kolaborasi Git & GitHub

  Dokumen ini berisi standar alur kerja (workflow) kolaborasi tim agar kode tetap rapi, terhindar dari konflik, dan setiap perubahan melalui proses peninjauan
  (review & approval) sebelum digabungkan ke kode utama (`main`).

  ---

  ## 1. Mengetahui Kondisi Remote GitHub (`git fetch`)

  Sebelum mulai bekerja atau sebelum membuat branch baru, selalu cek kondisi terkini dari repositori GitHub.

  ### Memeriksa update tanpa mengubah file lokal
  ```bash
  git fetch origin

  ### Melihat perbedaan antara lokal dan remote

  # Cek apakah lokal tertinggal (behind) atau lebih maju (ahead)
  git status

  # Melihat commit apa saja yang baru masuk di GitHub
  git log HEAD..origin/main --oneline

  ### Memperbarui branch lokal ke versi terbaru

  git checkout main
  git pull origin main

  ———

  ## 2. Alur Kerja Fitur Baru (Feature Branch Workflow)

  > Aturan Utama: Jangan pernah melakukan commit atau push langsung ke branch main.

  ### Langkah 1: Buat dan pindah ke branch baru

  Gunakan nama branch deskriptif (contoh: feat/nama-fitur, fix/nama-bug, chore/tugas):

  git checkout -b feat/tambah-fitur-login

  ### Langkah 2: Lakukan perubahan kode dan periksa status

  git status

  ### Langkah 3: Tambahkan file ke staging area

  # Menambahkan file tertentu
  git add path/ke/file.js

  # Atau menambahkan semua perubahan
  git add .

  ### Langkah 4: Simpan commit dengan pesan yang jelas

  git commit -m "feat(auth): tambahkan validasi form login"

  ———

  ## 3. Sinkronisasi Ulang Sebelum Push

  Sebelum mengirim branch Anda ke GitHub, pastikan branch Anda sudah memuat commit terbaru dari main agar tidak terjadi konflik saat merge.

  # 1. Update branch main lokal
  git checkout main
  git pull origin main

  # 2. Kembali ke branch fitur Anda
  git checkout feat/tambah-fitur-login

  # 3. Gabungkan update terbaru dari main
  git merge main
  # (Jika ada konflik, selesaikan manual di editor, lalu commit hasil resolusinya)

  ———

  ## 4. Mengirim Branch ke GitHub (git push)

  Kirim branch kerja Anda ke repositori GitHub:

  git push -u origin feat/tambah-fitur-login

  (Parameter -u hanya diperlukan saat pertama kali push branch tersebut agar terhubung dengan remote branch).

  ———

  ## 5. Membuat Pull Request (PR) di GitHub

  1. Buka repositori di GitHub: github.com/rosifirdos/rpl-lms.
  2. GitHub biasanya akan menampilkan banner tombol Compare & pull request untuk branch yang baru di-push. Klik tombol tersebut.
  3. Pastikan konfigurasi branch:
      - base: main (tujuan)
      - compare: feat/tambah-fitur-login (branch Anda)

  4. Tulis judul dan deskripsi PR secara ringkas dan jelas:
      - Apa yang diubah/ditambahkan?
      - Cara menguji perubahannya.

  5. Tetapkan Reviewers (teman/rekan tim yang wajib meninjau).
  6. Klik Create pull request.

  ———

  ## 6. Proses Code Review & Persetujuan (Approval)

  Bagi pihak peninjau (reviewer):

  1. Buka tab Files changed pada Pull Request.
  2. Periksa baris kode yang ditambah/dihapus:
      - Berikan komentar pada baris tertentu jika ada saran perbaikan.

  3. Klik tombol Review changes:
      - Comment: Hanya memberi catatan tanpa menyetujui.
      - Request changes: Meminta perbaikan sebelum boleh di-merge.
      - Approve: Menyetujui perubahan untuk masuk ke main.

  Jika pembuat PR diminta melakukan revisi:

  1. Ubah kodenya di lokal pada branch yang sama.
  2. Commit dan push kembali:

     git add .
     git commit -m "refactor: perbaiki saran review"
     git push origin feat/tambah-fitur-login

  3. Pull Request di GitHub otomatis terbarui tanpa perlu membuat PR baru.

  ———

  ## 7. Menggabungkan (Merge) dan Membersihkan Branch

  Setelah PR disetujui (Approved):

  1. Klik tombol Merge pull request di halaman PR GitHub, lalu konfirmasi Confirm merge.
  2. Klik tombol Delete branch di GitHub untuk menjaga daftar branch tetap bersih.
  3. Di komputer lokal Anda:

     # Pindah kembali ke main dan tarik hasil merge terbaru
     git checkout main
     git pull origin main

     # Hapus branch fitur di lokal yang sudah selesai
     git branch -d feat/tambah-fitur-login

  ———

  ## 8. Mengatur Branch Protection di GitHub (Wajib Sekali Setting)

  Agar tidak ada yang bisa push langsung ke main tanpa melewati PR:

  1. Di GitHub repository, buka tab Settings.
  2. Pilih menu Branches di panel kiri.
  3. Klik Add branch protection rule.
  4. Di Branch name pattern, ketik main.
  5. Centang opsi:
      - ✅ Require a pull request before merging
      - ✅ Require approvals (isi minimal 1)

  6. Klik Create / Save changes.

  ———

  ## Rangkuman Perintah Sering Digunakan (Cheatsheet)

   Kebutuhan                        Perintah
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   Cek status dan perubahan         git status
  ───────────────────────────────  ──────────────────────────────────────
   Mengintip update remote          git fetch origin
  ───────────────────────────────  ──────────────────────────────────────
   Tarik update terbaru ke lokal    git pull origin main
  ───────────────────────────────  ──────────────────────────────────────
   Buat branch baru                 git checkout -b <nama-branch>
  ───────────────────────────────  ──────────────────────────────────────
   Pindah branch                    git checkout <nama-branch>
  ───────────────────────────────  ──────────────────────────────────────
   Simpan perubahan                 git add . lalu git commit -m "pesan"
  ───────────────────────────────  ──────────────────────────────────────
   Push branch ke GitHub            git push -u origin <nama-branch>
  ───────────────────────────────  ──────────────────────────────────────
   Hapus branch lokal               git branch -d <nama-branch>