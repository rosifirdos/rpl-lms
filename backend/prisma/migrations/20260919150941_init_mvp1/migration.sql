-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "StatusAkademik" AS ENUM ('AKTIF', 'CUTI', 'LULUS', 'DROP_OUT');

-- CreateEnum
CREATE TYPE "StatusSeleksi" AS ENUM ('MENUNGGU', 'TERVERIFIKASI', 'LULUS', 'TIDAK_LULUS', 'TERDAFTAR_ULANG');

-- CreateEnum
CREATE TYPE "SemesterTipe" AS ENUM ('GANJIL', 'GENAP', 'ANTARA');

-- CreateEnum
CREATE TYPE "KalenderStatus" AS ENUM ('DIJADWALKAN', 'BERJALAN', 'SELESAI');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE',
    "last_login_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "roles" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "permissions" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_roles" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "role_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "role_permissions" (
    "id" TEXT NOT NULL,
    "role_id" TEXT NOT NULL,
    "permission_id" TEXT NOT NULL,

    CONSTRAINT "role_permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "refresh_tokens" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "token_hash" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "revoked_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mahasiswa" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "nim" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "prodi_id" TEXT NOT NULL,
    "angkatan" INTEGER NOT NULL,
    "status_akademik" "StatusAkademik" NOT NULL DEFAULT 'AKTIF',
    "dosen_wali_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "mahasiswa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dosen" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "nidn" TEXT,
    "nip" TEXT,
    "nama" TEXT NOT NULL,
    "gelar_depan" TEXT,
    "gelar_belakang" TEXT,
    "prodi_id" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "dosen_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "admin_profiles" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "nip" TEXT,
    "nama" TEXT NOT NULL,
    "unit_kerja" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "admin_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "calon_mahasiswa" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "no_pendaftaran" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "status_seleksi" "StatusSeleksi" NOT NULL DEFAULT 'MENUNGGU',
    "prodi_pilihan_id" TEXT,
    "jalur_pendaftaran" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "calon_mahasiswa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fakultas" (
    "id" TEXT NOT NULL,
    "kode" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "fakultas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "program_studi" (
    "id" TEXT NOT NULL,
    "fakultas_id" TEXT NOT NULL,
    "kode" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "jenjang" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "program_studi_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tahun_akademik" (
    "id" TEXT NOT NULL,
    "kode" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tahun_akademik_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "semester" (
    "id" TEXT NOT NULL,
    "tahun_akademik_id" TEXT NOT NULL,
    "tipe" "SemesterTipe" NOT NULL,
    "tanggal_mulai" TIMESTAMP(3) NOT NULL,
    "tanggal_selesai" TIMESTAMP(3) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "semester_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "kalender_akademik" (
    "id" TEXT NOT NULL,
    "semester_id" TEXT NOT NULL,
    "agenda" TEXT NOT NULL,
    "mulai" TIMESTAMP(3) NOT NULL,
    "selesai" TIMESTAMP(3) NOT NULL,
    "status" "KalenderStatus" NOT NULL DEFAULT 'DIJADWALKAN',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "kalender_akademik_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "kurikulum" (
    "id" TEXT NOT NULL,
    "prodi_id" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "tahun_mulai" INTEGER NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "kurikulum_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mata_kuliah" (
    "id" TEXT NOT NULL,
    "kurikulum_id" TEXT NOT NULL,
    "kode" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "sks" INTEGER NOT NULL,
    "sks_teori" INTEGER NOT NULL DEFAULT 0,
    "sks_praktik" INTEGER NOT NULL DEFAULT 0,
    "semester_paket" INTEGER NOT NULL DEFAULT 1,
    "is_wajib" BOOLEAN NOT NULL DEFAULT true,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "mata_kuliah_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gedung" (
    "id" TEXT NOT NULL,
    "kode" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "gedung_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ruangan" (
    "id" TEXT NOT NULL,
    "gedung_id" TEXT NOT NULL,
    "kode" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "kapasitas" INTEGER NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ruangan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "kelas" (
    "id" TEXT NOT NULL,
    "mata_kuliah_id" TEXT NOT NULL,
    "semester_id" TEXT NOT NULL,
    "dosen_id" TEXT NOT NULL,
    "ruangan_id" TEXT,
    "kode_kelas" TEXT NOT NULL,
    "kapasitas" INTEGER NOT NULL DEFAULT 40,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "kelas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "files" (
    "id" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "mime" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "owner_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "files_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "user_id" TEXT,
    "action" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "entity_id" TEXT,
    "old_values" JSONB,
    "new_values" JSONB,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "waktu" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "roles_name_key" ON "roles"("name");

-- CreateIndex
CREATE UNIQUE INDEX "permissions_code_key" ON "permissions"("code");

-- CreateIndex
CREATE UNIQUE INDEX "user_roles_user_id_role_id_key" ON "user_roles"("user_id", "role_id");

-- CreateIndex
CREATE UNIQUE INDEX "role_permissions_role_id_permission_id_key" ON "role_permissions"("role_id", "permission_id");

-- CreateIndex
CREATE UNIQUE INDEX "refresh_tokens_token_hash_key" ON "refresh_tokens"("token_hash");

-- CreateIndex
CREATE UNIQUE INDEX "mahasiswa_user_id_key" ON "mahasiswa"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "mahasiswa_nim_key" ON "mahasiswa"("nim");

-- CreateIndex
CREATE UNIQUE INDEX "dosen_user_id_key" ON "dosen"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "dosen_nidn_key" ON "dosen"("nidn");

-- CreateIndex
CREATE UNIQUE INDEX "dosen_nip_key" ON "dosen"("nip");

-- CreateIndex
CREATE UNIQUE INDEX "admin_profiles_user_id_key" ON "admin_profiles"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "calon_mahasiswa_user_id_key" ON "calon_mahasiswa"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "calon_mahasiswa_no_pendaftaran_key" ON "calon_mahasiswa"("no_pendaftaran");

-- CreateIndex
CREATE UNIQUE INDEX "fakultas_kode_key" ON "fakultas"("kode");

-- CreateIndex
CREATE UNIQUE INDEX "program_studi_kode_key" ON "program_studi"("kode");

-- CreateIndex
CREATE UNIQUE INDEX "tahun_akademik_kode_key" ON "tahun_akademik"("kode");

-- CreateIndex
CREATE UNIQUE INDEX "semester_tahun_akademik_id_tipe_key" ON "semester"("tahun_akademik_id", "tipe");

-- CreateIndex
CREATE UNIQUE INDEX "mata_kuliah_kode_key" ON "mata_kuliah"("kode");

-- CreateIndex
CREATE UNIQUE INDEX "gedung_kode_key" ON "gedung"("kode");

-- CreateIndex
CREATE UNIQUE INDEX "ruangan_kode_key" ON "ruangan"("kode");

-- CreateIndex
CREATE UNIQUE INDEX "kelas_mata_kuliah_id_semester_id_kode_kelas_key" ON "kelas"("mata_kuliah_id", "semester_id", "kode_kelas");

-- AddForeignKey
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_permission_id_fkey" FOREIGN KEY ("permission_id") REFERENCES "permissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mahasiswa" ADD CONSTRAINT "mahasiswa_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mahasiswa" ADD CONSTRAINT "mahasiswa_prodi_id_fkey" FOREIGN KEY ("prodi_id") REFERENCES "program_studi"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mahasiswa" ADD CONSTRAINT "mahasiswa_dosen_wali_id_fkey" FOREIGN KEY ("dosen_wali_id") REFERENCES "dosen"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dosen" ADD CONSTRAINT "dosen_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dosen" ADD CONSTRAINT "dosen_prodi_id_fkey" FOREIGN KEY ("prodi_id") REFERENCES "program_studi"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "admin_profiles" ADD CONSTRAINT "admin_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "calon_mahasiswa" ADD CONSTRAINT "calon_mahasiswa_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "calon_mahasiswa" ADD CONSTRAINT "calon_mahasiswa_prodi_pilihan_id_fkey" FOREIGN KEY ("prodi_pilihan_id") REFERENCES "program_studi"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "program_studi" ADD CONSTRAINT "program_studi_fakultas_id_fkey" FOREIGN KEY ("fakultas_id") REFERENCES "fakultas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "semester" ADD CONSTRAINT "semester_tahun_akademik_id_fkey" FOREIGN KEY ("tahun_akademik_id") REFERENCES "tahun_akademik"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kalender_akademik" ADD CONSTRAINT "kalender_akademik_semester_id_fkey" FOREIGN KEY ("semester_id") REFERENCES "semester"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kurikulum" ADD CONSTRAINT "kurikulum_prodi_id_fkey" FOREIGN KEY ("prodi_id") REFERENCES "program_studi"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mata_kuliah" ADD CONSTRAINT "mata_kuliah_kurikulum_id_fkey" FOREIGN KEY ("kurikulum_id") REFERENCES "kurikulum"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ruangan" ADD CONSTRAINT "ruangan_gedung_id_fkey" FOREIGN KEY ("gedung_id") REFERENCES "gedung"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kelas" ADD CONSTRAINT "kelas_mata_kuliah_id_fkey" FOREIGN KEY ("mata_kuliah_id") REFERENCES "mata_kuliah"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kelas" ADD CONSTRAINT "kelas_semester_id_fkey" FOREIGN KEY ("semester_id") REFERENCES "semester"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kelas" ADD CONSTRAINT "kelas_dosen_id_fkey" FOREIGN KEY ("dosen_id") REFERENCES "dosen"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kelas" ADD CONSTRAINT "kelas_ruangan_id_fkey" FOREIGN KEY ("ruangan_id") REFERENCES "ruangan"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "files" ADD CONSTRAINT "files_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
