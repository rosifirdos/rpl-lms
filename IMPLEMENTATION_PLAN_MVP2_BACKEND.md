# Implementation Plan: Backend MVP 2
**Sistem Akademik Kampus Terintegrasi (Portal, SIA, SPADA/LMS, PMB)**

Dokumen ini memuat rencana implementasi teknis sisi **Backend** untuk mencapai target **MVP 2** secara presisi, yang diselaraskan dengan spesifikasi pada [SRS.md](SRS.md) (*Bab 6.1, 6.2, 10, 12, 22, 25–28, 31, 32, 33, 35, 36, dan 38*) serta [PRD.md](PRD.md) *Bab 5 (Strategi Peluncuran Produk)*:

> **Definisi MVP 2 (SRS Bab 39 - Tabel 21 & PRD Bab 5):**
> *"KRS, persetujuan KRS, penjadwalan kuliah, kalender akademik operasional."*

Rencana ini adalah **kelanjutan langsung** dari [IMPLEMENTATION_PLAN_MVP1_BACKEND.md](IMPLEMENTATION_PLAN_MVP1_BACKEND.md) — penomoran fase diinversi lanjut (Fase 7 s/d 12) dan seluruh konvensi arsitektur MVP 1 (modular Express + Prisma + Zod DTO + `logAudit` + respons terstandar `apiResponse`) dipertahankan tanpa perubahan breaking.

---

## 1. Tujuan & Ruang Lingkup MVP 2 (Sisi Backend)

1. **Periode & Siklus Hidup KRS (SRS FR-022 s/d FR-030, UC-03, Bab 6.1, Bab 26.1)**
   - Pengelolaan **Periode KRS** per semester oleh Admin Akademik (pembukaan/penutupan periode, batas maksimum SKS) — *FR-102*.
   - Penyajian **katalog kelas yang dapat diambil** berdasarkan kurikulum prodi, `semester_paket`, penawaran semester aktif, dan kapasitas — *FR-023*.
   - Siklus draft → diajukan → disetujui/dikembalikan sebagai **state machine** eksplisit di server — *FR-024 s/d FR-030*.
   - Validasi aturan akademik saat simpan & submit: di luar periode ditolak, total SKS melebihi batas ditolak dengan alasan, bentrok jam antar kelas ditolak (*SRS Bab 33, TC-022*).
2. **Alur Persetujuan oleh Dosen Wali/PA (SRS FR-031 s/d FR-035, UC-04, Bab 31 Tabel 15)**
   - PA hanya dapat melihat & memproses KRS **mahasiswa bimbingannya sendiri** (`mahasiswa.dosen_wali_id`) — prinsip *ownership check* / least privilege.
   - Aksi `approve` dan `return` disertai catatan revisi; seluruh transisi status terekam di `audit_logs`.
   - **Catatan asumsi (SRS Bab 6.1 & PRD Bab "keputusan bisnis"):** approver = Dosen Wali/PA adalah asumsi kerja resmi SRS; keputusan final menunggu konfirmasi kebijakan kampus (butir keputusan bisnis PRD).
3. **Monitoring & kendali Admin Akademik (SRS FR-103, Bab 31)**
   - Endpoint monitor rekap status KRS per semester/prodi/PA, serta intervensi administratif (batal-ke-draft paksa) yang **selalu** ber-audit log.
4. **Penjadwalan Kuliah (SRS FR-100 s/d FR-101, Bab 6.2, Bab 31)**
   - CRUD **Jadwal Kelas** (hari, jam mulai–selesai, ruangan) per penawaran kelas oleh Admin Akademik — *FR-100*.
   - **Deteksi bentrok otomatis** saat tulis jadwal: tabrakan ruangan dan tabrakan dosen pengampu pada rentang waktu yang sama di hari yang sama — *FR-101*.
   - Tampilan jadwal **daftar & kalender** untuk Mahasiswa (dari KRS disetujui), Dosen (kelas diampu), dan PA — *FR-036 s/d FR-038*.
5. **Kalender Akademik Operasional (SRS Bab 22 — kelanjutan MVP 1)**
   - Penambahan **kategori agenda** (`KRS`, `PERKULIAHAN`, `UTS`, `UAS`, `LAINNYA`) pada `KalenderAkademik` yang sudah ada.
   - Periode KRS menjadi sumber kebenaran tunggal status "KRS buka/tutup" — menggantikan heuristik pencocokan string `"krs"` pada portal dashboard MVP 1 (`portal.service.js`).
6. **Dasbor Portal Kontekstual MVP 2 (SRS Bab 9)**
   - Dashboard mahasiswa menampilkan: status KRS personal, sisa waktu periode, total SKS terambil, dan tautan revisi bila dikembalikan.
   - Dashboard PA menampilkan antrian KRS menunggu persetujuan.
7. **Jejak Audit & Notifikasi (SRS Bab 35, Bab 36)**
   - Setiap mutasi KRS (draft, submit, approve, return), jadwal, dan periode dicatat di `audit_logs`.
   - **Hook event** `KRS_SUBMITTED / KRS_APPROVED / KRS_RETURNED` disiapkan sebagai fungsi stub idempoten (pengiriman notifikasi penuh & enrollment SPADA masuk cakupan MVP 3/MVP 6 — lihat Batasan).

### Di Luar Ruang Lingkup (Explicitly Out of Scope)
| Item | Alasan | Ditargetkan |
|---|---|---|
| Pembentukan `Enrollment` SPADA (FR-117, TC-023) | Modul kelas SPADA belum ada | **MVP 3** (hook `onKrsApproved` sudah disiapkan di Fase 9) |
| Batas SKS berbasis IPK (Bab 6, kebijakan) | Data IPK/nilai final baru ada di MVP 5 | **MVP 5** (interim: `sks_maks` seragam per periode) |
| Pengiriman notifikasi (email/in-app, FR-125) | Modul notifikasi | **MVP 6** (event hook + tabel nanti; saat ini audit trail sebagai pengganti jejak) |
| Nilai, KHS, Transkrip, Presensi, Tugas | PRD Bab 5 (MVP 4–5) | MVP 4/5 |
| Registrasi & jadwal sidang (FR-046 s/d FR-051) | PRD Bab 5 | MVP 6 |

---

## 2. Keputusan Desain Teknis (Architecture Decisions)

1. **State machine KRS di service layer, bukan hanya di UI.** Transisi legal: `DRAFT → DIAJUKAN → { DISETUJUI | DIKEMBALIKAN }`, dan `DIKEMBALIKAN → DIAJUKAN` (resubmit). Transisi ilegal → `400/409` dengan pesan reasons. Update status memakai `updateMany` dengan guard status asal di dalam transaksi (optimistic-lock) agar aman terhadap klik ganda/konkurensi.
2. **Satu KRS per mahasiswa per semester** ditegakkan oleh constraint database `@@unique([mahasiswa_id, semester_id])`, bukan hanya validasi aplikasi.
3. **Periode KRS sebagai entitas tersendiri** (`periode_krs`), terpisah dari `kalender_akademik` yang berupa agenda informatif. `is_active` maksimum 1 terbuka serentak (pola atomic-single-active yang sudah terbukti di `semester.service.js` MVP 1).
4. **Waktu jadwal disimpan sebagai string `"HH:mm"`** (`@db.VarChar(5)`) karena Prisma tidak punya tipe `Time` native; validasi format di Zod (`/^([01]\d|2[0-3]):[0-5]\d$/`). Bentrok dihitung dengan perbandingan leksikografis `jam_mulai < jam_selesai_lain AND jam_selesai > jam_mulai_lain` pada hari yang sama.
5. **Total SKS direkomputasi server-side** pada setiap mutasi detail (rekomendasi desain: kolom `total_sks` terdenormalisasi untuk query dashboard murah; sumber kebenaran = penjumlahan `mata_kuliah.sks` dari detail aktif).
6. **Deteksi bentrok untuk mahasiswa** berjalan saat `submit` (bukan saat tambah item) — UX draft bebas mencoba, submit yang menuntut validitas penuh, sesuai *FR-025* dan Bab 33.
7. **Approver hanyalah PA** (`disetujui_oleh_id` → `dosen.id` dengan pencocokan `dosen_wali_id`). Admin Akademik dapat **monitor & intervensi administratif** tetapi jalur approval reguler tetap UC-04.
8. **Idempotensi approve**: guard transisi status membuat pemanggilan ulang approve ke KRS yang sudah `DISETUJUI` menjadi no-op berstatus `409`, sekaligus aman untuk konsumsi hook enrollment MVP 3 nanti.

---

## 3. Desain Skema Database Tambahan (Migrasi `add_mvp2_krs_jadwal`)

Seluruh model baru mengikuti konvensi MVP 1: `uuid`, snake_case, `@@map` tabel Indonesia, relasi eksplisit Prisma.

```prisma
// ==========================================
// MVP 2 — PERIODE KRS, KRS & JADWAL (SRS Bab 6.1, 6.2, 28.2)
// ==========================================

enum StatusKRS {
  DRAFT
  DIAJUKAN
  DISETUJUI
  DIKEMBALIKAN
}

enum HariJadwal {
  SENIN
  SELASA
  RABU
  KAMIS
  JUMAT
  SABTU
}

enum KategoriAgenda {
  KRS
  PERKULIAHAN
  UTS
  UAS
  LAINNYA
}

model PeriodeKRS {
  id              String    @id @default(uuid())
  semester_id     String    @unique // satu periode resmi per semester
  nama            String    // "Periode KRS Semester Ganjil 2026/2027"
  tanggal_mulai   DateTime
  tanggal_selesai DateTime
  sks_maks        Int       @default(24) // batas maksimal SKS (FR-102)
  is_aktif        Boolean   @default(false) // hanya 1 terbuka serentak
  created_at      DateTime  @default(now())
  updated_at      DateTime  @updatedAt

  semester Semester @relation(fields: [semester_id], references: [id])
  krs      KRS[]

  @@map("periode_krs")
}

model KRS {
  id                 String        @id @default(uuid())
  mahasiswa_id       String
  semester_id        String
  periode_krs_id     String?
  status             StatusKRS     @default(DRAFT)
  total_sks          Int           @default(0)
  catatan_dosen      String?       // alasan revisi saat DIKEMBALIKAN (FR-035)
  diajukan_at        DateTime?
  diproses_at        DateTime?
  disetujui_oleh_id  String?       // dosen PA yang memproses (FR-033/034)
  created_at         DateTime      @default(now())
  updated_at         DateTime      @updatedAt

  mahasiswa      Mahasiswa    @relation(fields: [mahasiswa_id], references: [id], onDelete: Cascade)
  semester       Semester     @relation(fields: [semester_id], references: [id])
  periode_krs    PeriodeKRS?  @relation(fields: [periode_krs_id], references: [id])
  disetujui_oleh Dosen?       @relation("DosenPemprosesKRS", fields: [disetujui_oleh_id], references: [id], onDelete: SetNull)

  detail KRSDetail[]

  @@unique([mahasiswa_id, semester_id]) // 1 KRS per mhs per semester
  @@index([status])
  @@index([mahasiswa_id])
  @@map("krs")
}

model KRSDetail {
  id         String   @id @default(uuid())
  krs_id     String
  kelas_id   String
  created_at DateTime @default(now())

  krs   KRS   @relation(fields: [krs_id], references: [id], onDelete: Cascade)
  kelas Kelas @relation(fields: [kelas_id], references: [id], onDelete: Restrict)

  @@unique([krs_id, kelas_id])
  @@map("krs_detail")
}

model JadwalKelas {
  id          String     @id @default(uuid())
  kelas_id    String
  hari        HariJadwal
  jam_mulai   String     @db.VarChar(5) // "07:30"
  jam_selesai String     @db.VarChar(5) // "09:10"
  created_at  DateTime   @default(now())
  updated_at  DateTime   @updatedAt

  kelas Kelas @relation(fields: [kelas_id], references: [id], onDelete: Cascade)

  @@unique([kelas_id, hari, jam_mulai]) // cegah entri ganda per kelas
  @@index([hari, jam_mulai])            // percepat scan bentrok ruangan/dosen
  @@map("jadwal_kelas")
}
```

**Perubahan pada model eksisting:**

```prisma
model Kelas {
  // ... field MVP 1 tetap ...
  jadwal     JadwalKelas[]   // relasi baru
  krs_detail KRSDetail[]     // relasi baru
}

model Semester {
  // ... field MVP 1 tetap ...
  krs          KRS[]
  periode_krs  PeriodeKRS?   // relasi balik 1:1
}

model Mahasiswa {
  // ... field MVP 1 tetap ...
  krs KRS[]
}

model Dosen {
  // ... field MVP 1 tetap ...
  krs_diproses KRS[] @relation("DosenPemprosesKRS")
}

model KalenderAkademik {
  // ... field MVP 1 tetap ...
  kategori KategoriAgenda @default(LAINNYA) // kolom baru, backfill aman
}
```

> Migrasi `add_mvp2_krs_jadwal` bersifat **additive-only**; tidak ada kolom MVP 1 yang dihapus/diubah tipenya, sehingga seluruh tes `phase2`–`phase6` wajib tetap hijau tanpa sentuhan.

---

## 4. Desain Spesifikasi API Endpoints MVP 2

### 4.1. KRS Mahasiswa (`/api/v1/krs` — SRS FR-022 s/d FR-030, UC-03)
| Method | Endpoint | Fungsi | Akses |
|---|---|---|---|
| `GET` | `/api/v1/krs/periode-aktif` | Info periode KRS berjalan + sisa hari | Login |
| `GET` | `/api/v1/krs/saya` | KRS + detail milik sendiri | Mahasiswa |
| `GET` | `/api/v1/krs/tersedia` | Katalog kelas yang berhak diambil mhs tsb (kurikulum, semester paket, kapasitas) | Mahasiswa |
| `POST` | `/api/v1/krs/saya/items` | Tambah kelas ke draft | Mahasiswa |
| `DELETE` | `/api/v1/krs/saya/items/:detailId` | Hapus kelas dari draft | Mahasiswa |
| `POST` | `/api/v1/krs/saya/submit` | Ajukan KRS (jalur validasi penuh) | Mahasiswa |
| `GET` | `/api/v1/krs/:id` | Detail KRS (scoped: pemilik / PA pemilik / admin) | Scoped |

### 4.2. Persetujuan PA (`/api/v1/krs` — SRS FR-031 s/d FR-035, UC-04)
| Method | Endpoint | Fungsi | Akses |
|---|---|---|---|
| `GET` | `/api/v1/krs/pengajuan` | Daftar KRS mahasiswa bimbingan (filter status, pagination) | Dosen Wali, Super Admin |
| `POST` | `/api/v1/krs/:id/approve` | Setujui KRS (alias konseptual `/api/krs/{id}/approve`) | Dosen Wali (owner), Super Admin |
| `POST` | `/api/v1/krs/:id/return` | Kembalikan untuk revisi + `catatan` wajib terisi | Dosen Wali (owner), Super Admin |

### 4.3. Periode & Monitoring Admin Akademik (SRS FR-102 s/d FR-103)
| Method | Endpoint | Fungsi | Akses |
|---|---|---|---|
| `GET/POST` | `/api/v1/krs/admin/periode` | List & buat periode KRS | Admin Akademik, Super Admin |
| `PUT` | `/api/v1/krs/admin/periode/:id` | Ubah rentang & batas SKS | Admin Akademik |
| `PATCH` | `/api/v1/krs/admin/periode/:id/activate` | Buka periode (auto-close periode aktif lain, atomik) | Admin Akademik |
| `GET` | `/api/v1/krs/admin/monitor` | Rekap status per semester/prodi/PA + daftar pengajuan lintas PA | Admin Akademik |
| `POST` | `/api/v1/krs/admin/:id/reset-draft` | Intervensi: kembalikan paksa ke DRAFT (audit `KRS_ADMIN_RESET`) | Admin Akademik |

### 4.4. Jadwal Kuliah (`/api/v1/jadwal` — SRS FR-036 s/d FR-038, FR-100 s/d FR-101)
| Method | Endpoint | Fungsi | Akses |
|---|---|---|---|
| `GET` | `/api/v1/jadwal/saya?view=list|calendar` | Jadwal mahasiswa dari KRS **DISETUJUI** (list mingguan / range tanggal) | Mahasiswa |
| `GET` | `/api/v1/jadwal/mengajar` | Jadwal kelas yang diampu dosen | Dosen, Super Admin |
| `GET` | `/api/v1/jadwal` | List penuh + filter semester/prodi/kelas/dosen | Login (scoped admin) |
| `POST` | `/api/v1/jadwal` | Buat slot jadwal untuk kelas (deteksi bentrok run) | Admin Akademik |
| `PUT` | `/api/v1/jadwal/:id` | Ubah slot (deteksi bentrok run) | Admin Akademik |
| `DELETE` | `/api/v1/jadwal/:id` | Hapus slot | Admin Akademik |

**Aturan bentrok (FR-101)** dievaluasi server-side dalam satu transaksi: (a) kelas yang sama tidak boleh dua slot pada waktu sama; (b) **ruangan** yang sama tidak boleh dipakai dua kelas pada rentang overlap di hari sama; (c) **dosen** yang sama tidak boleh mengajar dua kelas pada rentang overlap di hari sama. Gagal → `409` + payload `bentrok_dengan[]` detail.

### 4.5. Kalender Akademik — Ekstensi (SRS Bab 22)
Endpoint CRUD `/api/v1/calendar` MVP 1 **tetap kompatibel**; perubahan:
- Skema Zod & query menerima field baru `kategori` (filter `?kategori=KRS`).
- `GET /api/v1/calendar/aktif` → agenda berjalan untuk semester aktif (dipakai portal & frontend).

### 4.6. Alias Konseptual SRS Bab 32
`/api/krs` → `GET/POST /api/v1/krs/saya`, `/api/krs/{id}/approve` → endpoint 4.2, `/api/jadwal` → `/api/v1/jadwal/saya`. Mekanisme alias sudah tersedia di `app.js`; tinggal menambah pemetaan.

### 4.7. Standarisasi Respons
Tetap `{ success, data, message, meta }` (pola `apiResponse` MVP 1). Error validasi KRS memakai struktur reason terstandar:
```json
{ "success": false, "message": "Pengajuan KRS ditolak",
  "data": { "errors": [
    { "kode": "SKS_MELEBIHI_BATAS", "pesan": "Total 27 SKS > batas 24 SKS periode ini", "detail": { "total_sks": 27, "sks_maks": 24 } },
    { "kode": "JAM_BENTROK", "pesan": "Kelas TI-B (RABU 07:30-09:10) bentrok dengan Basis Data (RABU 08:00-09:40)" } ] } }
```

---

## 5. Struktur Direktori Backend (Delta terhadap MVP 1)

```text
backend/src/
├── constants/
│   ├── permissions.js            # + KRS_SUBMIT, KRS_APPROVE, KRS_MANAGE, JADWAL_VIEW, JADWAL_MANAGE
│   └── krs.js                    # (baru) STATE MACHINE transisi legal StatusKRS + error codes validasi
├── middlewares/                  # tidak berubah (authenticateToken/requireRole/requirePermission dipakai ulang)
├── modules/
│   ├── krs/                      # (baru)
│   │   ├── krs.routes.js         #   /saya, /tersedia, /pengajuan, /:id/approve, /:id/return
│   │   ├── krs.controller.js
│   │   ├── krs.service.js        #   state machine + ownership check + transaksi atomic
│   │   ├── krs.validation.js     #   Zod DTO
│   │   ├── krs-rules.service.js  #   (inti validasi) periode aktif, batas SKS, bentrok jam, kapasitas
│   │   └── periode.service.js    #   CRUD + activate periode KRS (admin)
│   ├── jadwal/                   # (baru)
│   │   ├── jadwal.routes.js / jadwal.controller.js / jadwal.service.js / jadwal.validation.js
│   │   └── konflik.service.js    #   deteksi bentrok ruangan/dosen/kelas (dipakai admin write & student submit)
│   ├── calendar/                 # (ubah) tambah filter kategori + /aktif
│   └── portal/portal.service.js  # (ubah) dashboard mhs/PA pakai PeriodeKRS nyata, hapus heuristik string 'krs'
├── utils/
│   └── events.js                 # (baru) emitter stub onKrsSubmitted/onKrsApproved/onKrsReturned → audit (+ hooks MVP3/MVP6)
└── tests/
    ├── phase7.test.js            # skema + seed + periode KRS
    ├── phase8.test.js            # lifecycle KRS mahasiswa + engine validasi
    ├── phase9.test.js            # alur PA approve/return + monitoring + concurrency
    ├── phase10.test.js           # jadwal CRUD + matriks bentrok + view mhs/dosen
    └── phase11.test.js           # kalender kategori + portal integrasi + compliance SRS
```

---

## 6. Tahapan Eksekusi Pengerjaan (Roadmap Backend MVP 2 — Hari 1-10)

### Fase 7: Migrasi Skema & Seed Data MVP 2 (Hari 1–2)
- Tambah model/enum di `schema.prisma` sesuai Bab 3; eksekusi `npx prisma migrate dev --name add_mvp2_krs_jadwal`.
- Perbarui `seed.js` (idempoten/upsert): 1 `PeriodeKRS` aktif untuk Semester Ganjil 2026/2027 (`sks_maks: 24`), `JadwalKelas` contoh untuk kelas RPL & Basis Data (sengaja dibuat 1 pasang bentrok untuk skenario tes), `kategori` agenda kalender (Periode KRS → `KRS`, Perkuliahan → `PERKULIAHAN`), dan 2 KRS contoh milik mahasiswa seed (1 `DISETUJUI`, 1 `DIAJUKAN`).
- Registrasi 5 permission baru + mapping role di seed: `krs:submit` (MAHASISWA), `krs:approve` (DOSEN_WALI), `krs:manage` (ADMIN_AKADEMIK), `jadwal:manage` (ADMIN_AKADEMIK), `jadwal:view` (semua role login).
- Gate: migrasi additive hijau; `npm test` suite lama 88/88 tetap lulus.

### Fase 8: Periode KRS + Siklus Draft Mahasiswa (Hari 3–5)
- `periode.service.js`: CRUD + `activate` atomik (pola `semester.service.js` — `updateMany` nonaktifkan lain, lalu aktifkan target, dalam `$transaction`).
- `krs-rules.service.js` (murni, teruji satuan): (1) cek jendela waktu periode; (2) eligibility kelas (kurikulum prodi + `semester_paket` ≤ semester berjalan + kelas semester aktif + `is_active`); (3) kapasitas vs jumlah item `DIAJUKAN/DISETUJUI`; (4) akumulasi SKS; (5) bentrok jam antar item (pakai `konflik.service.js` Fase 10 via jadwal — toleransi: jika kelas belum berjadwal, tandai `belum berjadwal` sebagai warning, bukan blocker).
- Endpoint `/saya`, `/tersedia`, tambah/hapus item (hanya saat `DRAFT` dan periode `is_aktif`), submit dengan rekap reasons (format Bab 4.7). Ownership via `mahasiswa.user_id`, bukan body param.
- Audit: `CREATE_KRS_DRAFT`, `UPDATE_KRS_ITEM`, `SUBMIT_KRS`.

### Fase 9: Alur Persetujuan PA & Monitoring Admin (Hari 5–6)
- `/pengajuan` (scoped `dosen_wali_id = dosen.id`) + `/approve` + `/return` (field `catatan` wajib).
- Transisi ber-guard: `updateMany({ where: { id, status: 'DIAJUKAN' } })` → `count === 0` = konflik konkurensi → `409`. Isi `disetujui_oleh_id`, `diproses_at`, recomputasi `total_sks` final.
- `utils/events.js`: `onKrsApproved()` mencatat event + (stub, komentar TODO MVP-3) pembentukan enrollment — dipanggil dalam transaksi yang sama agar konsisten.
- Endpoint admin: `/monitor` (group by status/prodi, pagination) + `/reset-draft` (audit `KRS_ADMIN_RESET`, old/new values penuh sesuai SRS Bab 35).

### Fase 10: Penjadwalan Kuliah (Hari 7–8)
- CRUD `/api/v1/jadwal` (Admin Akademik) dengan `konflik.service.js`: query overlap `hari = X AND jam_mulai < :selesai AND jam_selesai > :mulai AND (ruangan_id = :ruangan OR dosen via kelas)` diekskusi dalam `$transaction` + unique constraint sebagai final guard.
- `GET /jadwal/saya`: agregasi dari item KRS `DISETUJUI` → kelas → jadwal → (matakuliah, dosen, ruangan); format `view=list` (grup per hari) & `view=calendar` (proyeksi tanggal mingguan dari hari+jam terhadap rentang `tanggal_mulai`/`selesai` semester).
- `GET /jadwal/mengajar` untuk dosen. Semua respons menyertakan meta pagination/format sama dengan MVP 1.

### Fase 11: Kalender Operasional + Integrasi Portal (Hari 9)
- Ekstensi modul `calendar`: filter `kategori`, endpoint `/aktif`.
- `portal.service.js`: dashboard **Mahasiswa** ← status KRS + deadline periode; **Dosen Wali** ← `jumlah_krs_menunggu_persetujuan` (replace heuristik string lama); tetap backwards-compatible (shape `role_dashboards` lama tidak berubah, hanya bertambah field).
- Sanity: portal dashboard tes `phase5` tetap lulus (hanya field baru ditambahkan).

### Fase 12: Pengujian, Validasi Kepatuhan SRS & Handoff (Hari 10)
- Suite integrasi E2E `phase7`–`phase11` terhadap embedded-postgres (pola `tests/setup.js` MVP 1) + test satuan `krs-rules` & `konflik`.
- Matriks kepatuhan wajib lulus (SRS Bab 33/38): **TC-022** isi KRS di luar periode → 403/422; **TC-023-lite** KRS disetujui → status final + event tercatat (asserti stub); skenario bentrok SKS/jam/ruangan/dosen sesuai format errors Bab 4.7; penolakan non-PA approve (`403`, TC-019 pattern).
- Perbarui `docs/openapi.yaml` (≈20 path baru) + `npm run docs:check` → `0 undocumented`.
- Perbarui `README.md` (seksi ✅ Fase 7–12) + dokumentasi akun seed baru untuk demo.

---

## 7. Kriteria Keberhasilan (Definition of Done MVP 2 Backend)

1. **Siklus KRS penuh tervalidasi:** `DRAFT → DIAJUKAN → DISETUJUI/DIKEMBALIKAN → resubmit` berjalan dengan seluruh penolakan Bab 33 (periode, SKS, bentrok) mengembalikan reasons terstruktur; state illegal ditolak server.
2. **Kepatuhan RBAC Bab 31:** Mahasiswa hanya atas KRS sendiri; PA hanya atas bimbingan sendiri; Admin Akademik monitor/kelola; Super Admin bypass; tidak ada endpoint tanpa `authenticateToken`.
3. **Jadwal bebas bentrok terjamin database+service:** dua slot dengan ruangan/dosen sama pada rentang waktu sama mustahil tersimpan; view mahasiswa 100% bersumber dari KRS `DISETUJUI`.
4. **Kalender & portal operasional:** periode KRS tampil sebagai sumber status tunggal di `GET /api/v1/portal/dashboard`; `kategori` agenda berfungsi di CRUD & filter.
5. **Audit terverifikasi:** seluruh aksi Fase 8–11 menghasilkan baris `audit_logs` dengan `old_values`/`new_values`, IP, dan user-agent (memakai `attachAuditHelper` eksisting).
6. **Non-regresi:** 88 tes MVP 1 tetap hijau; test baru MVP 2 lulus 100%; `docs:check` melaporkan cakupan penuh endpoint baru; tidak ada perubahan breaking pada kontrak API MVP 1.

---

## 8. Risiko & Mitigasi

| Risiko | Dampak | Mitigasi |
|---|---|---|
| Kebijkan batas SKS berbasis IPK belum bisa diimplement (data nilai = MVP 5) | Gap vs kebijakan kampus riil | Konfigurasi `sks_maks` per periode sebagai solusi interim; dokumentasikan sebagai keputusan bisnis PRD yang menunggu konfirmasi |
| Approver final belum dikonfirmasi (SRS Bab 6.1) | Re-work alur | Logic approval terisolasi di `krs.service.js` + permission `krs:approve`; pemindahan approver cukup ubah grant role |
| Konkurensi submit/approve ganda | Data tidak konsisten | Transaksi ber-guard + optimistic status check; tes konkurensi di phase9 |
| Bentrok jadwal berbasis jam string zona-naif | Salah hitung DST/waktu kampus | Waktu server sebagai kebenaran (SRS Bab 32.1); validasi input server-side; kolom jam dibatasi regex + rentang jam operasional |
| Konsumsi portal dashboard berubah bagi frontend MVP 1 | Breaking UI | Hanya *additive fields*; heuristik lama diganti dengan sumber baru secara internal |
