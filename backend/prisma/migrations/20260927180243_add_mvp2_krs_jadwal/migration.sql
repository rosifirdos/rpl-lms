-- CreateEnum
CREATE TYPE "StatusKRS" AS ENUM ('DRAFT', 'DIAJUKAN', 'DISETUJUI', 'DIKEMBALIKAN');

-- CreateEnum
CREATE TYPE "HariJadwal" AS ENUM ('SENIN', 'SELASA', 'RABU', 'KAMIS', 'JUMAT', 'SABTU');

-- CreateEnum
CREATE TYPE "KategoriAgenda" AS ENUM ('KRS', 'PERKULIAHAN', 'UTS', 'UAS', 'LAINNYA');

-- AlterTable
ALTER TABLE "kalender_akademik" ADD COLUMN     "kategori" "KategoriAgenda" NOT NULL DEFAULT 'LAINNYA';

-- CreateTable
CREATE TABLE "periode_krs" (
    "id" TEXT NOT NULL,
    "semester_id" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "tanggal_mulai" TIMESTAMP(3) NOT NULL,
    "tanggal_selesai" TIMESTAMP(3) NOT NULL,
    "sks_maks" INTEGER NOT NULL DEFAULT 24,
    "is_aktif" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "periode_krs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "krs" (
    "id" TEXT NOT NULL,
    "mahasiswa_id" TEXT NOT NULL,
    "semester_id" TEXT NOT NULL,
    "periode_krs_id" TEXT,
    "status" "StatusKRS" NOT NULL DEFAULT 'DRAFT',
    "total_sks" INTEGER NOT NULL DEFAULT 0,
    "catatan_dosen" TEXT,
    "diajukan_at" TIMESTAMP(3),
    "diproses_at" TIMESTAMP(3),
    "disetujui_oleh_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "krs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "krs_detail" (
    "id" TEXT NOT NULL,
    "krs_id" TEXT NOT NULL,
    "kelas_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "krs_detail_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "jadwal_kelas" (
    "id" TEXT NOT NULL,
    "kelas_id" TEXT NOT NULL,
    "hari" "HariJadwal" NOT NULL,
    "jam_mulai" VARCHAR(5) NOT NULL,
    "jam_selesai" VARCHAR(5) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "jadwal_kelas_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "periode_krs_semester_id_key" ON "periode_krs"("semester_id");

-- CreateIndex
CREATE INDEX "krs_status_idx" ON "krs"("status");

-- CreateIndex
CREATE INDEX "krs_mahasiswa_id_idx" ON "krs"("mahasiswa_id");

-- CreateIndex
CREATE UNIQUE INDEX "krs_mahasiswa_id_semester_id_key" ON "krs"("mahasiswa_id", "semester_id");

-- CreateIndex
CREATE UNIQUE INDEX "krs_detail_krs_id_kelas_id_key" ON "krs_detail"("krs_id", "kelas_id");

-- CreateIndex
CREATE INDEX "jadwal_kelas_hari_jam_mulai_idx" ON "jadwal_kelas"("hari", "jam_mulai");

-- CreateIndex
CREATE UNIQUE INDEX "jadwal_kelas_kelas_id_hari_jam_mulai_key" ON "jadwal_kelas"("kelas_id", "hari", "jam_mulai");

-- AddForeignKey
ALTER TABLE "periode_krs" ADD CONSTRAINT "periode_krs_semester_id_fkey" FOREIGN KEY ("semester_id") REFERENCES "semester"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "krs" ADD CONSTRAINT "krs_mahasiswa_id_fkey" FOREIGN KEY ("mahasiswa_id") REFERENCES "mahasiswa"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "krs" ADD CONSTRAINT "krs_semester_id_fkey" FOREIGN KEY ("semester_id") REFERENCES "semester"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "krs" ADD CONSTRAINT "krs_periode_krs_id_fkey" FOREIGN KEY ("periode_krs_id") REFERENCES "periode_krs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "krs" ADD CONSTRAINT "krs_disetujui_oleh_id_fkey" FOREIGN KEY ("disetujui_oleh_id") REFERENCES "dosen"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "krs_detail" ADD CONSTRAINT "krs_detail_krs_id_fkey" FOREIGN KEY ("krs_id") REFERENCES "krs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "krs_detail" ADD CONSTRAINT "krs_detail_kelas_id_fkey" FOREIGN KEY ("kelas_id") REFERENCES "kelas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "jadwal_kelas" ADD CONSTRAINT "jadwal_kelas_kelas_id_fkey" FOREIGN KEY ("kelas_id") REFERENCES "kelas"("id") ON DELETE CASCADE ON UPDATE CASCADE;
