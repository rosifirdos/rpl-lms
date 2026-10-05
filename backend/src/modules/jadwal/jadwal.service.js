/**
 * Jadwal Kuliah Service (SRS FR-036 s/d FR-038, FR-100 s/d FR-101, Bab 6.2, Bab 31)
 *
 * CRUD JadwalKelas oleh Admin Akademik dengan deteksi bentrok ruangan/dosen/kelas
 * dalam transaksi, serta tampilan jadwal mahasiswa (dari KRS DISETUJUI) & dosen.
 *
 * Konvensi (mengikuti pola MVP 1/modul KRS):
 *  - `logAudit` best-effort di luar transaksi utama untuk aksi user.
 *  - `apiResponse` standar `{ success, data, message, meta }`.
 *  - Waktu "HH:mm" zero-padded 24-jam; perbandingan leksikografis aman (Bab 32.1).
 */

import prisma from '../../config/prisma.js';
import { AppError } from '../../utils/errors.js';
import { logAudit } from '../../utils/audit.js';
import { detectConflictsForSlot } from './konflik.service.js';
import { HARI_JADWAL } from '../../constants/jadwal.js';

// Include standar untuk slot jadwal lengkap (kelas + mk + dosen + ruangan + semester)
const JADWAL_FULL_INCLUDE = {
  kelas: {
    include: {
      mata_kuliah: true,
      dosen: true,
      ruangan: { include: { gedung: true } },
      semester: { include: { tahun_akademik: true } },
    },
  },
};

// Urutan hari untuk tampilan list mingguan
const URUTAN_HARI = ['SENIN', 'SELASA', 'RABU', 'KAMIS', 'JUMAT', 'SABTU'];
const HARI_INDEX = new Map(URUTAN_HARI.map((h, i) => [h, i]));

/**
 * Lock transaksi agar penulisan slot deterministik terhadap konkurensi.
 *
 * Dua lapis advisory lock Postgres:
 *  1. Per-(kelas,hari) — mencegah klik ganda pada kelas yang sama.
 *  2. Per-hari global (`jadwal:hari:{hari}`) — menserialisasi seluruh tulis slot
 *     pada hari yang sama. Ini menutup race condition deteksi bentrok lintas-kelas
 *     (dosen/ruangan sama) yang tidak ter-cover oleh READ COMMITTED: bila dua
 *     transaksi bersamaan sama-sama membaca kondisi "tidak bentrok" lalu insert,
 *     hasilnya dua slot konflik. Lock per-hari memastikan hanya satu penulisan
 *     pada satu hari yang berjalan dalam satu waktu. Frekuensi tulis jadwal rendah
 *     (operasi admin), sehingga serialisasi ini tidak menjadi bottleneck.
 */
async function lockSlotTransaction(tx, kelasId, hari) {
  await tx.$queryRaw`SELECT pg_advisory_xact_lock(hashtext(${`jadwal:${kelasId}:${hari}`}))::text AS lock_acquired`;
  await tx.$queryRaw`SELECT pg_advisory_xact_lock(hashtext(${`jadwal:hari:${hari}`}))::text AS lock_acquired`;
}

/**
 * Ambil slot jadwal + relasi lengkap. Throw 404 jika tidak ditemukan.
 */
async function getJadwalOrThrow(id, client = prisma) {
  const jadwal = await client.jadwalKelas.findUnique({
    where: { id },
    include: JADWAL_FULL_INCLUDE,
  });
  if (!jadwal) throw new AppError('Jadwal tidak ditemukan', 404);
  return jadwal;
}

/**
 * Format satu slot jadwal menjadi bentuk respons yang konsisten
 * (dipakai untuk list, kalender, dan detail).
 */
function formatSlot(slot) {
  return {
    id: slot.id,
    kelas_id: slot.kelas_id,
    hari: slot.hari,
    jam_mulai: slot.jam_mulai,
    jam_selesai: slot.jam_selesai,
    kelas: slot.kelas
      ? {
          id: slot.kelas.id,
          kode_kelas: slot.kelas.kode_kelas,
          kapasitas: slot.kelas.kapasitas,
          mata_kuliah: slot.kelas.mata_kuliah
            ? {
                id: slot.kelas.mata_kuliah.id,
                kode: slot.kelas.mata_kuliah.kode,
                nama: slot.kelas.mata_kuliah.nama,
                sks: slot.kelas.mata_kuliah.sks,
              }
            : null,
          dosen: slot.kelas.dosen
            ? {
                id: slot.kelas.dosen.id,
                nama: slot.kelas.dosen.nama,
                gelar_depan: slot.kelas.dosen.gelar_depan,
                gelar_belakang: slot.kelas.dosen.gelar_belakang,
              }
            : null,
          ruangan: slot.kelas.ruangan
            ? {
                id: slot.kelas.ruangan.id,
                kode: slot.kelas.ruangan.kode,
                nama: slot.kelas.ruangan.nama,
                gedung: slot.kelas.ruangan.gedung
                  ? { id: slot.kelas.ruangan.gedung.id, kode: slot.kelas.ruangan.gedung.kode, nama: slot.kelas.ruangan.gedung.nama }
                  : null,
              }
            : null,
          semester: slot.kelas.semester
            ? {
                id: slot.kelas.semester.id,
                tipe: slot.kelas.semester.tipe,
                tahun_akademik: slot.kelas.semester.tahun_akademik
                  ? { id: slot.kelas.semester.tahun_akademik.id, kode: slot.kelas.semester.tahun_akademik.kode, nama: slot.kelas.semester.tahun_akademik.nama }
                  : null,
              }
            : null,
        }
      : null,
    created_at: slot.created_at,
    updated_at: slot.updated_at,
  };
}

/**
 * Konversi enum HariJadwal + "HH:mm" menjadi tanggal konkret dalam rentang semester.
 * Dipakai untuk view=calendar: memproyeksikan jadwal mingguan ke tanggal.
 *
 * @param {Date} weekStart - Senin minggu target (00:00 lokal)
 * @param {string} hari - enum HariJadwal
 * @param {string} jam - "HH:mm"
 * @returns {Date}
 */
function projectToDateTime(weekStart, hari, jam) {
  const offset = HARI_INDEX.get(hari) ?? 0;
  const [h, m] = jam.split(':').map(Number);
  const dt = new Date(weekStart);
  dt.setDate(dt.getDate() + offset);
  dt.setHours(h, m, 0, 0);
  return dt;
}

/**
 * Hitung tanggal Senin (week start) dari suatu tanggal referensi.
 */
function getMonday(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const day = d.getDay(); // 0=Min, 1=Sen, ..., 6=Sab
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return d;
}

export const jadwalService = {
  // ================================================================
  // Admin Akademik: GET /api/v1/jadwal  (list penuh + filter)
  // ================================================================

  async list(query = {}) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 50;
    const skip = (page - 1) * limit;

    const where = {};
    if (query.kelas_id) where.kelas_id = query.kelas_id;
    if (query.hari) where.hari = query.hari;

    const kelasWhere = {};
    if (query.semester_id) kelasWhere.semester_id = query.semester_id;
    if (query.prodi_id) kelasWhere.mata_kuliah = { kurikulum: { prodi_id: query.prodi_id } };
    if (query.dosen_id) kelasWhere.dosen_id = query.dosen_id;
    if (Object.keys(kelasWhere).length > 0) where.kelas = kelasWhere;

    const [total, items] = await Promise.all([
      prisma.jadwalKelas.count({ where }),
      prisma.jadwalKelas.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ hari: 'asc' }, { jam_mulai: 'asc' }],
        include: JADWAL_FULL_INCLUDE,
      }),
    ]);

    return {
      items: items.map(formatSlot),
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) || 1 },
    };
  },

  // ================================================================
  // Admin Akademik: POST /api/v1/jadwal  (buat slot + deteksi bentrok)
  // ================================================================

  async create({ kelas_id, hari, jam_mulai, jam_selesai }, meta = {}) {
    // Validasi awal kelas ada (di luar tx agar pesan 404/400 jelas)
    const kelas = await prisma.kelas.findUnique({
      where: { id: kelas_id },
      include: { dosen: true, ruangan: true, mata_kuliah: true, semester: { include: { tahun_akademik: true } } },
    });
    if (!kelas) throw new AppError('Kelas tidak ditemukan', 404);

    // Cek bentrok dulu di luar tx untuk pesan 409 yang informatif (FR-101)
    const conflictResult = await detectConflictsForSlot({
      kelas_id,
      hari,
      jam_mulai,
      jam_selesai,
    });
    if (!conflictResult.ok) {
      throw new AppError('Jadwal bentrok dengan slot lain', 409, {
        bentrok_dengan: conflictResult.conflicts,
      });
    }

    let created;
    try {
      created = await prisma.$transaction(async (tx) => {
        await lockSlotTransaction(tx, kelas_id, hari);

        // Re-cek bentrok dalam transaksi yang sama agar race condition ter-cover
        const liveConflict = await detectConflictsForSlot({
          kelas_id,
          hari,
          jam_mulai,
          jam_selesai,
          client: tx,
        });
        if (!liveConflict.ok) {
          throw new AppError('Jadwal bentrok dengan slot lain', 409, {
            bentrok_dengan: liveConflict.conflicts,
          });
        }

        try {
          return await tx.jadwalKelas.create({
            data: { kelas_id, hari, jam_mulai, jam_selesai },
            include: JADWAL_FULL_INCLUDE,
          });
        } catch (error) {
          // Unique constraint [kelas_id, hari, jam_mulai] → duplikat slot pada kelas sama
          if (error.code === 'P2002') {
            throw new AppError(
              'Slot jadwal dengan hari & jam mulai yang sama sudah ada pada kelas ini',
              409
            );
          }
          throw error;
        }
      });
    } catch (error) {
      // Bentrok conflict dilempar ulang dari dalam transaksi
      if (error instanceof AppError && error.statusCode === 409) throw error;
      throw error;
    }

    await logAudit({
      userId: meta.userId,
      action: 'CREATE_JADWAL',
      entity: 'jadwal_kelas',
      entityId: created.id,
      newValues: {
        kelas_id,
        hari,
        jam_mulai,
        jam_selesai,
        kode_kelas: kelas.kode_kelas,
      },
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
    });

    return formatSlot(created);
  },

  // ================================================================
  // Admin Akademik: PUT /api/v1/jadwal/:id  (ubah slot + deteksi bentrok)
  // ================================================================

  async update(id, { kelas_id, hari, jam_mulai, jam_selesai }, meta = {}) {
    const existing = await prisma.jadwalKelas.findUnique({
      where: { id },
      include: { kelas: true },
    });
    if (!existing) throw new AppError('Jadwal tidak ditemukan', 404);

    const newKelasId = kelas_id || existing.kelas_id;
    const newHari = hari || existing.hari;
    const newMulai = jam_mulai || existing.jam_mulai;
    const newSelesai = jam_selesai || existing.jam_selesai;

    if (newMulai >= newSelesai) {
      throw new AppError('jam_mulai harus lebih awal dari jam_selesai', 400);
    }

    // Ambil kelas target bila kelas_id berubah
    let kelas = existing.kelas;
    if (kelas_id && kelas_id !== existing.kelas_id) {
      kelas = await prisma.kelas.findUnique({
        where: { id: kelas_id },
        include: { dosen: true, ruangan: true, mata_kuliah: true },
      });
      if (!kelas) throw new AppError('Kelas tidak ditemukan', 404);
    }

    // Cek bentrok (skip diri sendiri via excludeJadwalId)
    const conflictResult = await detectConflictsForSlot({
      kelas_id: newKelasId,
      hari: newHari,
      jam_mulai: newMulai,
      jam_selesai: newSelesai,
      excludeJadwalId: id,
    });
    if (!conflictResult.ok) {
      throw new AppError('Jadwal bentrok dengan slot lain', 409, {
        bentrok_dengan: conflictResult.conflicts,
      });
    }

    const oldValues = {
      kelas_id: existing.kelas_id,
      hari: existing.hari,
      jam_mulai: existing.jam_mulai,
      jam_selesai: existing.jam_selesai,
    };

    let updated;
    try {
      updated = await prisma.$transaction(async (tx) => {
        await lockSlotTransaction(tx, newKelasId, newHari);

        const liveConflict = await detectConflictsForSlot({
          kelas_id: newKelasId,
          hari: newHari,
          jam_mulai: newMulai,
          jam_selesai: newSelesai,
          excludeJadwalId: id,
          client: tx,
        });
        if (!liveConflict.ok) {
          throw new AppError('Jadwal bentrok dengan slot lain', 409, {
            bentrok_dengan: liveConflict.conflicts,
          });
        }

        try {
          return await tx.jadwalKelas.update({
            where: { id },
            data: {
              kelas_id: newKelasId,
              hari: newHari,
              jam_mulai: newMulai,
              jam_selesai: newSelesai,
            },
            include: JADWAL_FULL_INCLUDE,
          });
        } catch (error) {
          if (error.code === 'P2002') {
            throw new AppError(
              'Slot jadwal dengan hari & jam mulai yang sama sudah ada pada kelas ini',
              409
            );
          }
          throw error;
        }
      });
    } catch (error) {
      if (error instanceof AppError && error.statusCode === 409) throw error;
      throw error;
    }

    await logAudit({
      userId: meta.userId,
      action: 'UPDATE_JADWAL',
      entity: 'jadwal_kelas',
      entityId: id,
      oldValues,
      newValues: {
        kelas_id: newKelasId,
        hari: newHari,
        jam_mulai: newMulai,
        jam_selesai: newSelesai,
      },
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
    });

    return formatSlot(updated);
  },

  // ================================================================
  // Admin Akademik: DELETE /api/v1/jadwal/:id
  // ================================================================

  async remove(id, meta = {}) {
    const existing = await prisma.jadwalKelas.findUnique({
      where: { id },
      include: { kelas: { include: { mata_kuliah: true } } },
    });
    if (!existing) throw new AppError('Jadwal tidak ditemukan', 404);

    const oldValues = {
      kelas_id: existing.kelas_id,
      hari: existing.hari,
      jam_mulai: existing.jam_mulai,
      jam_selesai: existing.jam_selesai,
      kode_kelas: existing.kelas?.kode_kelas,
    };

    await prisma.jadwalKelas.delete({ where: { id } });

    await logAudit({
      userId: meta.userId,
      action: 'DELETE_JADWAL',
      entity: 'jadwal_kelas',
      entityId: id,
      oldValues,
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
    });

    return { id };
  },

  // ================================================================
  // Mahasiswa: GET /api/v1/jadwal/saya  (dari KRS DISETUJUI)
  // ================================================================

  async getJadwalSaya(userId, query = {}) {
    const mhs = await prisma.mahasiswa.findUnique({ where: { user_id: userId } });
    if (!mhs) throw new AppError('Akun Anda tidak terdaftar sebagai mahasiswa', 403);

    // Tentukan semester: dari query atau semester aktif
    let semester = null;
    if (query.semester_id) {
      semester = await prisma.semester.findUnique({
        where: { id: query.semester_id },
        include: { tahun_akademik: true },
      });
      if (!semester) throw new AppError('Semester tidak ditemukan', 404);
    } else {
      semester = await prisma.semester.findFirst({
        where: { is_active: true },
        include: { tahun_akademik: true },
      });
      if (!semester) throw new AppError('Tidak ada semester aktif saat ini', 404);
    }

    // Ambil KRS DISETUJUI milik mahasiswa pada semester tersebut (sumber kebenaran view mhs)
    const krs = await prisma.kRS.findUnique({
      where: {
        mahasiswa_id_semester_id: {
          mahasiswa_id: mhs.id,
          semester_id: semester.id,
        },
      },
      include: {
        detail: {
          include: {
            kelas: {
              include: {
                mata_kuliah: true,
                dosen: true,
                ruangan: { include: { gedung: true } },
                jadwal: true,
              },
            },
          },
        },
      },
    });

    if (!krs || krs.status !== 'DISETUJUI') {
      // Tidak ada KRS disetujui → jadwal kosong
      return {
        view: query.view,
        semester: { id: semester.id, tipe: semester.tipe, tahun_akademik: semester.tahun_akademik },
        status_krs: krs?.status || null,
        total_sks: krs?.total_sks || 0,
        jadwal: query.view === 'calendar' ? [] : {},
      };
    }

    // Kumpulkan seluruh slot jadwal dari kelas pada KRS yang disetujui
    const slots = [];
    for (const detail of krs.detail) {
      for (const j of detail.kelas.jadwal) {
        slots.push({
          id: j.id,
          kelas_id: detail.kelas.id,
          hari: j.hari,
          jam_mulai: j.jam_mulai,
          jam_selesai: j.jam_selesai,
          kelas: {
            id: detail.kelas.id,
            kode_kelas: detail.kelas.kode_kelas,
            mata_kuliah: detail.kelas.mata_kuliah
              ? { id: detail.kelas.mata_kuliah.id, kode: detail.kelas.mata_kuliah.kode, nama: detail.kelas.mata_kuliah.nama, sks: detail.kelas.mata_kuliah.sks }
              : null,
            dosen: detail.kelas.dosen
              ? { id: detail.kelas.dosen.id, nama: detail.kelas.dosen.nama, gelar_depan: detail.kelas.dosen.gelar_depan, gelar_belakang: detail.kelas.dosen.gelar_belakang }
              : null,
            ruangan: detail.kelas.ruangan
              ? { id: detail.kelas.ruangan.id, kode: detail.kelas.ruangan.kode, nama: detail.kelas.ruangan.nama }
              : null,
          },
        });
      }
    }

    // Urutkan slot berdasarkan urutan hari + jam mulai
    slots.sort((a, b) => {
      const ha = HARI_INDEX.get(a.hari) ?? 99;
      const hb = HARI_INDEX.get(b.hari) ?? 99;
      if (ha !== hb) return ha - hb;
      return a.jam_mulai < b.jam_mulai ? -1 : a.jam_mulai > b.jam_mulai ? 1 : 0;
    });

    if (query.view === 'list') {
      // Grup per hari
      const byHari = {};
      for (const h of URUTAN_HARI) byHari[h] = [];
      for (const slot of slots) {
        if (!byHari[slot.hari]) byHari[slot.hari] = [];
        byHari[slot.hari].push(slot);
      }
      return {
        view: 'list',
        semester: { id: semester.id, tipe: semester.tipe, tahun_akademik: semester.tahun_akademik },
        status_krs: krs.status,
        total_sks: krs.total_sks,
        jadwal: byHari,
      };
    }

    // view=calendar: proyeksikan jadwal mingguan ke tanggal konkret dalam rentang semester
    // (atau rentang dari query mulai/selesai).
    const rentangMulai = query.mulai ? new Date(query.mulai) : new Date(semester.tanggal_mulai);
    const rentangSelesai = query.selesai ? new Date(query.selesai) : new Date(semester.tanggal_selesai);

    const events = [];
    let cursor = getMonday(rentangMulai);
    while (cursor <= rentangSelesai) {
      const nextMonday = new Date(cursor.getTime() + 7 * 24 * 60 * 60 * 1000);
      for (const slot of slots) {
        events.push({
          jadwal_id: slot.id,
          kelas_id: slot.kelas_id,
          hari: slot.hari,
          jam_mulai: slot.jam_mulai,
          jam_selesai: slot.jam_selesai,
          mulai: projectToDateTime(cursor, slot.hari, slot.jam_mulai),
          selesai: projectToDateTime(cursor, slot.hari, slot.jam_selesai),
          kelas: slot.kelas,
        });
      }
      cursor = nextMonday;
    }

    return {
      view: 'calendar',
      semester: { id: semester.id, tipe: semester.tipe, tahun_akademik: semester.tahun_akademik },
      status_krs: krs.status,
      total_sks: krs.total_sks,
      rentang: { mulai: rentangMulai.toISOString(), selesai: rentangSelesai.toISOString() },
      jadwal: events,
    };
  },

  // ================================================================
  // Dosen: GET /api/v1/jadwal/mengajar  (kelas yang diampu)
  // ================================================================

  async getJadwalMengajar(userId, query = {}) {
    const dosen = await prisma.dosen.findUnique({ where: { user_id: userId } });
    if (!dosen) throw new AppError('Akun Anda tidak terdaftar sebagai dosen', 403);

    let semesterId = query.semester_id;
    if (!semesterId) {
      const activeSem = await prisma.semester.findFirst({ where: { is_active: true } });
      if (!activeSem) throw new AppError('Tidak ada semester aktif saat ini', 404);
      semesterId = activeSem.id;
    }

    const slots = await prisma.jadwalKelas.findMany({
      where: {
        kelas: {
          dosen_id: dosen.id,
          semester_id: semesterId,
        },
      },
      include: JADWAL_FULL_INCLUDE,
      orderBy: [{ hari: 'asc' }, { jam_mulai: 'asc' }],
    });

    // Grup per hari
    const byHari = {};
    for (const h of URUTAN_HARI) byHari[h] = [];
    for (const slot of slots) {
      if (!byHari[slot.hari]) byHari[slot.hari] = [];
      byHari[slot.hari].push(formatSlot(slot));
    }

    return {
      view: 'list',
      dosen: { id: dosen.id, nama: dosen.nama },
      semester_id: semesterId,
      jadwal: byHari,
    };
  },

  // ================================================================
  // Helper: GET /api/v1/jadwal/:id (detail, scoped login)
  // ================================================================

  async getById(id) {
    const jadwal = await getJadwalOrThrow(id);
    return formatSlot(jadwal);
  },
};

export { URUTAN_HARI, HARI_INDEX, HARI_JADWAL };
