import prisma from '../config/prisma.js';
import { AppError } from './errors.js';
import { ROLES } from '../constants/roles.js';

/**
 * Helper terpusat pemeriksaan kepemilikan & kepesertaan kelas (BR-003, BR-004)
 *
 * Sumber kebenaran tunggal untuk otorisasi ruang kelas. Sebelum helper ini ada,
 * pola `classRecord.lecturer.user_id !== user.id` ditulis inline di
 * `modules/classes/user-classes.service.js`. MVP 2 (pertemuan, materi, presensi,
 * rekapitulasi) membutuhkan pemeriksaan yang sama, sehingga logika ini wajib
 * dipusatkan agar tidak bercabang menjadi beberapa varian yang berbeda.
 *
 * Seluruh kegagalan otorisasi dilempar sebagai `AppError` 403 (fail-closed)
 * dengan pesan yang stabil — pesan ini diuji oleh `tests/phase3.test.js`
 * (`/Akses ditolak/i`) dan `tests/phase5.test.js` (`/tidak terdaftar/i`).
 */

/**
 * Pesan galat otorisasi kelas — dipakai lintas modul agar konsisten.
 */
export const OWNERSHIP_MESSAGES = {
  STUDENT_NOT_FOUND: 'Data mahasiswa tidak ditemukan',
  LECTURER_NOT_FOUND: 'Data dosen tidak ditemukan',
  NOT_ENROLLED: 'Akses ditolak: Anda tidak terdaftar pada kelas perkuliahan ini (BR-003)',
  NOT_LECTURER: 'Akses ditolak: Anda bukan dosen pengampu untuk kelas perkuliahan ini',
  ROLE_NOT_ALLOWED:
    'Akses ditolak: endpoint ini khusus untuk Mahasiswa dan Dosen terdaftar',
};

/**
 * Mengambil record Mahasiswa milik sebuah akun pengguna.
 *
 * @param {string} userId ID `User` yang sedang login
 * @param {object} [dbClient=prisma] klien Prisma (bisa berupa klien transaksi)
 * @returns {Promise<object>} record `Mahasiswa`
 * @throws {AppError} 404 bila akun tidak memiliki data mahasiswa
 */
export async function getStudentRecordOrThrow(userId, dbClient = prisma) {
  const student = await dbClient.mahasiswa.findUnique({
    where: { user_id: userId },
  });

  if (!student) {
    throw new AppError(OWNERSHIP_MESSAGES.STUDENT_NOT_FOUND, 404);
  }

  return student;
}

/**
 * Mengambil record Dosen milik sebuah akun pengguna.
 *
 * @param {string} userId ID `User` yang sedang login
 * @param {object} [dbClient=prisma] klien Prisma (bisa berupa klien transaksi)
 * @returns {Promise<object>} record `Dosen`
 * @throws {AppError} 404 bila akun tidak memiliki data dosen
 */
export async function getLecturerRecordOrThrow(userId, dbClient = prisma) {
  const lecturer = await dbClient.dosen.findUnique({
    where: { user_id: userId },
  });

  if (!lecturer) {
    throw new AppError(OWNERSHIP_MESSAGES.LECTURER_NOT_FOUND, 404);
  }

  return lecturer;
}

/**
 * Dosen pengampu kelas? (BR-003)
 *
 * Menerima record kelas apa pun yang memiliki relasi `lecturer` dengan kolom
 * `user_id` — cocok untuk `Class` maupun `Meeting` yang menyertakan
 * `class.lecturer`.
 *
 * @param {object} classRecord record kelas (atau turunannya) yang memuat `lecturer.user_id`
 * @param {object} user pengguna terautentikasi (`req.user`)
 * @returns {boolean}
 */
export function isClassLecturer(classRecord, user) {
  return Boolean(
    user?.id && classRecord?.lecturer && classRecord.lecturer.user_id === user.id
  );
}

/**
 * Pastikan pengguna adalah dosen pengampu kelas (BR-003).
 *
 * @param {object} classRecord record kelas yang memuat `lecturer.user_id`
 * @param {object} user pengguna terautentikasi
 * @throws {AppError} 403 bila bukan dosen pengampu
 */
export function ensureClassLecturer(classRecord, user) {
  if (!isClassLecturer(classRecord, user)) {
    throw new AppError(OWNERSHIP_MESSAGES.NOT_LECTURER, 403);
  }
}

/**
 * Pastikan pengguna ter-enroll pada kelas (BR-003).
 *
 * @param {object} params
 * @param {string} params.userId ID `User` mahasiswa
 * @param {string} params.classId ID kelas perkuliahan
 * @param {object} [params.dbClient=prisma] klien Prisma (bisa berupa klien transaksi)
 * @returns {Promise<object>} record `Enrollment`
 * @throws {AppError} 403 bila tidak terdaftar pada kelas
 */
export async function ensureEnrolledInClass({ userId, classId, dbClient = prisma }) {
  const student = await getStudentRecordOrThrow(userId, dbClient);

  const enrollment = await dbClient.enrollment.findUnique({
    where: {
      class_id_student_id: {
        class_id: classId,
        student_id: student.id,
      },
    },
  });

  if (!enrollment) {
    throw new AppError(OWNERSHIP_MESSAGES.NOT_ENROLLED, 403);
  }

  return enrollment;
}

/**
 * Penjaga otorisasi ruang kelas pengguna (`/api/classes/*`, BR-003).
 *
 * - `mahasiswa` wajib ter-enroll pada kelas tersebut;
 * - `dosen` wajib menjadi dosen pengampu kelas tersebut;
 * - peran lain (termasuk `admin`) ditolak — Admin memakai `/api/admin/classes`.
 *
 * @param {object} params
 * @param {object} params.user pengguna terautentikasi (`req.user`)
 * @param {object} params.classRecord record kelas yang memuat `lecturer.user_id`
 * @param {string} [params.classId] ID kelas (default: `classRecord.id`)
 * @param {object} [params.dbClient=prisma] klien Prisma (bisa berupa klien transaksi)
 * @returns {Promise<void>}
 * @throws {AppError} 403/404 sesuai aturan BR-003
 */
export async function authorizeClassAccess({ user, classRecord, classId, dbClient = prisma }) {
  if (!classRecord) {
    throw new AppError('Kelas perkuliahan tidak ditemukan', 404);
  }

  if (user?.role === ROLES.MAHASISWA) {
    await ensureEnrolledInClass({
      userId: user.id,
      classId: classId || classRecord.id,
      dbClient,
    });
    return;
  }

  if (user?.role === ROLES.DOSEN) {
    ensureClassLecturer(classRecord, user);
    return;
  }

  throw new AppError(OWNERSHIP_MESSAGES.ROLE_NOT_ALLOWED, 403);
}

/**
 * Apakah pengguna boleh mengelola kelas tersebut?
 *
 * Dipakai modul MVP 2 yang mengizinkan **Dosen pengampu atau Admin** untuk
 * menulis (mis. `PUT /api/meetings/:id`, unggah/hapus materi).
 *
 * @param {object} classRecord record kelas yang memuat `lecturer.user_id`
 * @param {object} user pengguna terautentikasi
 * @returns {boolean}
 */
export function canManageClass(classRecord, user) {
  if (!user) return false;
  if (user.role === ROLES.ADMIN) return true;
  if (user.role === ROLES.DOSEN) return isClassLecturer(classRecord, user);
  return false;
}

/**
 * Pastikan pengguna boleh mengelola kelas (Dosen pengampu atau Admin).
 *
 * @param {object} classRecord record kelas yang memuat `lecturer.user_id`
 * @param {object} user pengguna terautentikasi
 * @throws {AppError} 403 bila tidak berwenang
 */
export function ensureCanManageClass(classRecord, user) {
  if (!canManageClass(classRecord, user)) {
    throw new AppError(
      'Akses ditolak: hanya dosen pengampu kelas atau Admin yang dapat melakukan tindakan ini',
      403
    );
  }
}

/**
 * Apakah pengguna boleh membaca kelas tersebut?
 *
 * Dosen pengampu, Admin, atau mahasiswa yang ter-enroll. Pemeriksaan
 * kepesertaan mahasiswa memerlukan kueri database, karena itu fungsi ini
 * **asinkron**.
 *
 * @param {object} params
 * @param {object} params.user pengguna terautentikasi
 * @param {object} params.classRecord record kelas yang memuat `lecturer.user_id`
 * @param {string} [params.classId] ID kelas (default: `classRecord.id`)
 * @param {object} [params.dbClient=prisma] klien Prisma (bisa berupa klien transaksi)
 * @returns {Promise<boolean>}
 */
export async function canReadClass({ user, classRecord, classId, dbClient = prisma }) {
  if (!user || !classRecord) return false;
  if (user.role === ROLES.ADMIN) return true;
  if (user.role === ROLES.DOSEN) return isClassLecturer(classRecord, user);

  if (user.role === ROLES.MAHASISWA) {
    const student = await dbClient.mahasiswa.findUnique({
      where: { user_id: user.id },
    });
    if (!student) return false;

    const enrollment = await dbClient.enrollment.findUnique({
      where: {
        class_id_student_id: {
          class_id: classId || classRecord.id,
          student_id: student.id,
        },
      },
      select: { id: true },
    });

    return Boolean(enrollment);
  }

  return false;
}

/**
 * Pastikan pengguna boleh membaca kelas.
 *
 * @param {object} params
 * @param {object} params.user pengguna terautentikasi
 * @param {object} params.classRecord record kelas yang memuat `lecturer.user_id`
 * @param {string} [params.classId] ID kelas (default: `classRecord.id`)
 * @param {object} [params.dbClient=prisma] klien Prisma (bisa berupa klien transaksi)
 * @throws {AppError} 403 bila tidak berwenang membaca kelas
 */
export async function ensureCanReadClass({ user, classRecord, classId, dbClient = prisma }) {
  const allowed = await canReadClass({ user, classRecord, classId, dbClient });

  if (!allowed) {
    throw new AppError(
      'Akses ditolak: Anda tidak terdaftar pada kelas perkuliahan ini (BR-003)',
      403
    );
  }
}