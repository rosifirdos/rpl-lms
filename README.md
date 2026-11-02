# SPADA LMS — Universitas PGRI Semarang
> **Sistem Pembelajaran Daring (Learning Management System)**
> **Team Membangun Negeri — RPL 2026**

---

## Tentang

SPADA LMS adalah sistem manajemen pembelajaran daring (*Learning Management System*) standalone untuk Universitas PGRI Semarang (UPGRIS). Sistem ini mendukung perkuliahan daring dan blended learning dengan fitur:

- **Profil pengguna** dengan avatar dan data identitas
- **Pengelolaan mata kuliah & kelas** oleh Admin
- **Direct Enrollment** mahasiswa ke kelas oleh Admin (tanpa proses KRS)
- **16 pertemuan terstruktur** per kelas (Pertemuan 8 = UTS, Pertemuan 16 = UAS)
- **Materi perkuliahan** dengan storage privat dan validasi file
- **Tugas & submission** dengan skor 0–100 dan feedback
- **Presensi digital** dengan state machine (OPEN/CLOSED)
- **Gatekeeping ujian** berdasarkan ambang kehadiran ≥70%
- **Audit trail** untuk seluruh mutasi data sensitif

## Arsitektur

| Layer       | Teknologi                        |
|------------|----------------------------------|
| Runtime    | Node.js v20+ (ES Modules)       |
| Framework  | Express.js                       |
| ORM        | Prisma v6+                       |
| Database   | PostgreSQL                       |
| Auth       | JWT (access + refresh token)     |
| Validasi   | Zod                             |
| Test       | Node.js native test runner       |

## Peran Pengguna

| Role         | Deskripsi |
|-------------|-----------|
| **Admin**    | Pengelola teknis & operasional (peleburan Super Admin/Admin Akademik/Admin LMS) |
| **Dosen**    | Tenaga pendidik pengampu kelas |
| **Mahasiswa**| Peserta didik yang terdaftar pada kelas SPADA |

## Quick Start

```bash
cd backend
cp .env.example .env   # Sesuaikan DATABASE_URL
npm install
npx prisma migrate dev
npx prisma db seed
npm run dev
```

## Cara Menjalankan

### Backend (Server API)
1. **Persiapan database:**
   ```bash
   cd backend
   cp .env.example .env   # Edit DATABASE_URL sesuai konfigurasi PostgreSQL Anda
   npm install
   ```

2. **Setup database:**
   ```bash
   npx prisma migrate dev    # Jalankan migrasi database
   npx prisma db seed        # Seed data awal (opsional)
   ```

3. **Jalankan server:**
   ```bash
   npm run dev              # Mode development dengan nodemon (hot reload)
   # atau
   npm start                # Mode production
   ```

   Server akan berjalan di `http://localhost:3000`

### Frontend (Aplikasi React)
1. **Instalasi dependensi:**
   ```bash
   cd frontend
   npm install
   ```

2. **Jalankan development server:**
   ```bash
   npm run dev              # Mode development dengan Vite
   ```

   Aplikasi akan berjalan di `http://localhost:5173`

3. **Build untuk production:**
   ```bash
   npm run build            # Build aplikasi untuk production
   npm run preview          # Preview build production
   ```

### Menjalankan Keduanya (Backend + Frontend)
#### Option 1: Terminal terpisah
- Buka terminal pertama:
  ```bash
  cd backend
  npm run dev
  ```
- Buka terminal kedua:
  ```bash
  cd frontend
  npm run dev
  ```

#### Option 2: Script bersamaan (bash/zsh)
```bash
# Di terminal yang sama
(cd backend && npm run dev) & (cd frontend && npm run dev)
```

### Script Berguna
```bash
# Backend
npm run dev                # Development server
npm run test              # Jalankan semua test
npm run db:migrate        # Jalankan migrasi database
npm run db:seed           # Seed data awal
npm run db:studio         # Buka Prisma Studio untuk melihat data

# Frontend
npm run dev               # Development server dengan hot reload
npm run build             # Build untuk production
npm run preview           # Preview build production
```

## API Endpoints

Semua endpoint menggunakan path flat `/api/...` (bukan `/api/v1/...`). Lihat `SRS.md` Bab 21 untuk daftar lengkap.

## Dokumen Referensi

- `SRS.md` — Software Requirements Specification (single source of truth)
- `PRD.md` — Product Requirements Document
- `IMPLEMENTATION_PLAN_MVP1_BACKEND.md` — Rencana implementasi MVP 1 backend
- `IMPLEMENTATION_PLAN_MVP2_BACKEND.md` — Rencana implementasi MVP 2 backend
- `DESIGN_SYSTEM.md` — Design system dan token
- `DESIGN_INSTRUCTIONS_MVP1_UIUX.md` — Instruksi desain UI/UX

## Tim

**Team Membangun Negeri** — Rekayasa Perangkat Lunak, Universitas PGRI Semarang (UPGRIS)
