import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { ROLES } from '../src/constants/roles.js';
import { AppError } from '../src/utils/errors.js';
import {
  OWNERSHIP_MESSAGES,
  authorizeClassAccess,
  canManageClass,
  canReadClass,
  ensureCanManageClass,
  ensureCanReadClass,
  ensureClassLecturer,
  ensureEnrolledInClass,
  getLecturerRecordOrThrow,
  getStudentRecordOrThrow,
  isClassLecturer,
} from '../src/utils/ownership.js';

/**
 * Fase 0 MVP 2 — Helper terpusat pemeriksaan kepemilikan kelas.
 *
 * Suite ini murni unit-test: seluruh akses database disimulasikan melalui
 * `dbClient` palsu, sehingga tidak menyentuh database uji dan tidak
 * meninggalkan sisa data yang perlu disapu `cleanupTestArtifacts()`.
 *
 * Kontrak pesan galat yang diuji di sini juga dipakai oleh suite integrasi
 * `phase3.test.js` (`/Akses ditolak/i`) dan `phase5.test.js` (`/tidak terdaftar/i`).
 */

const CLASS_ID = '11111111-1111-1111-1111-111111111111';
const LECTURER_USER_ID = '22222222-2222-2222-2222-222222222222';
const OTHER_USER_ID = '33333333-3333-3333-3333-333333333333';
const STUDENT_ID = '44444444-4444-4444-4444-444444444444';

const classRecord = {
  id: CLASS_ID,
  lecturer: { id: 'lecturer-1', user_id: LECTURER_USER_ID },
};

const admin = { id: 'admin-user', role: ROLES.ADMIN };
const lecturer = { id: LECTURER_USER_ID, role: ROLES.DOSEN };
const otherLecturer = { id: OTHER_USER_ID, role: ROLES.DOSEN };
const student = { id: STUDENT_ID, role: ROLES.MAHASISWA };

/**
 * Klien Prisma palsu minimal.
 *
 * @param {{student?: object|null, enrollment?: object|null, lecturer?: object|null}} fixtures
 */
function fakeDb({ student = null, enrollment = null, lecturer = null } = {}) {
  return {
    mahasiswa: { findUnique: async () => student },
    enrollment: { findUnique: async () => enrollment },
    dosen: { findUnique: async () => lecturer },
  };
}

describe('Fase 0: Helper Terpusat Kepemilikan Kelas (BR-003)', () => {
  describe('1. IsClassLecturer — kepemilikan kelas oleh dosen pengampu', () => {
    test('true hanya untuk dosen pengampu yang sebenarnya', () => {
      assert.equal(isClassLecturer(classRecord, lecturer), true);
    });

    test('false untuk dosen lain', () => {
      assert.equal(isClassLecturer(classRecord, otherLecturer), false);
    });

    test('false untuk Admin (Admin bukan pengampu)', () => {
      assert.equal(isClassLecturer(classRecord, admin), false);
    });

    test('false bila record kelas atau pengguna tidak lengkap', () => {
      assert.equal(isClassLecturer(null, lecturer), false);
      assert.equal(isClassLecturer(classRecord, null), false);
      assert.equal(isClassLecturer({ id: CLASS_ID }, lecturer), false);
    });

    test('ensureClassLecturer melempar 403 dengan pesan "bukan dosen pengampu"', () => {
      assert.throws(
        () => ensureClassLecturer(classRecord, otherLecturer),
        (err) => {
          assert.ok(err instanceof AppError);
          assert.equal(err.statusCode, 403);
          assert.match(err.message, /Akses ditolak/i);
          assert.match(err.message, /bukan dosen pengampu/i);
          return true;
        }
      );
    });

    test('ensureClassLecturer meloloskan dosen pengampu tanpa galat', () => {
      assert.doesNotThrow(() => ensureClassLecturer(classRecord, lecturer));
    });
  });

  describe('2. Pengambilan record Mahasiswa/Dosen', () => {
    test('getStudentRecordOrThrow mengembalikan record mahasiswa', async () => {
      const record = { id: STUDENT_ID, user_id: STUDENT_ID };
      const result = await getStudentRecordOrThrow(STUDENT_ID, fakeDb({ student: record }));
      assert.equal(result, record);
    });

    test('getStudentRecordOrThrow melempar 404 "Data mahasiswa tidak ditemukan"', async () => {
      await assert.rejects(
        () => getStudentRecordOrThrow(STUDENT_ID, fakeDb({ student: null })),
        (err) => {
          assert.equal(err.statusCode, 404);
          assert.equal(err.message, OWNERSHIP_MESSAGES.STUDENT_NOT_FOUND);
          return true;
        }
      );
    });

    test('getLecturerRecordOrThrow melempar 404 "Data dosen tidak ditemukan"', async () => {
      await assert.rejects(
        () => getLecturerRecordOrThrow(LECTURER_USER_ID, fakeDb({ lecturer: null })),
        (err) => {
          assert.equal(err.statusCode, 404);
          assert.equal(err.message, OWNERSHIP_MESSAGES.LECTURER_NOT_FOUND);
          return true;
        }
      );
    });
  });

  describe('3. EnsureEnrolledInClass — kepesertaan mahasiswa', () => {
    test('meloloskan mahasiswa yang ter-enroll dan mengembalikan record enrollment', async () => {
      const enrollment = { id: 'enrollment-1', class_id: CLASS_ID, student_id: STUDENT_ID };
      const result = await ensureEnrolledInClass({
        userId: STUDENT_ID,
        classId: CLASS_ID,
        dbClient: fakeDb({ student: { id: STUDENT_ID }, enrollment }),
      });

      assert.equal(result, enrollment);
    });

    test('menolak 403 dengan pesan "tidak terdaftar" bila belum di-enroll', async () => {
      await assert.rejects(
        () =>
          ensureEnrolledInClass({
            userId: STUDENT_ID,
            classId: CLASS_ID,
            dbClient: fakeDb({ student: { id: STUDENT_ID }, enrollment: null }),
          }),
        (err) => {
          assert.equal(err.statusCode, 403);
          assert.match(err.message, /Akses ditolak/i);
          assert.match(err.message, /tidak terdaftar/i);
          return true;
        }
      );
    });

    test('melempar 404 bila pengguna bukan mahasiswa terdaftar', async () => {
      await assert.rejects(
        () =>
          ensureEnrolledInClass({
            userId: 'bukan-mahasiswa',
            classId: CLASS_ID,
            dbClient: fakeDb({ student: null }),
          }),
        (err) => {
          assert.equal(err.statusCode, 404);
          assert.equal(err.message, OWNERSHIP_MESSAGES.STUDENT_NOT_FOUND);
          return true;
        }
      );
    });
  });

  describe('4. AuthorizeClassAccess — penjaga /api/classes/*', () => {
    test('mahasiswa ter-enroll lolos', async () => {
      await assert.doesNotReject(() =>
        authorizeClassAccess({
          user: student,
          classRecord,
          classId: CLASS_ID,
          dbClient: fakeDb({ student: { id: STUDENT_ID }, enrollment: { id: 'enrollment-1' } }),
        })
      );
    });

    test('mahasiswa belum ter-enroll ditolak 403', async () => {
      await assert.rejects(
        () =>
          authorizeClassAccess({
            user: student,
            classRecord,
            classId: CLASS_ID,
            dbClient: fakeDb({ student: { id: STUDENT_ID }, enrollment: null }),
          }),
        (err) => err.statusCode === 403 && /tidak terdaftar/i.test(err.message)
      );
    });

    test('dosen pengampu lolos, dosen lain ditolak 403', async () => {
      await assert.doesNotReject(() =>
        authorizeClassAccess({ user: lecturer, classRecord, classId: CLASS_ID })
      );

      await assert.rejects(
        () => authorizeClassAccess({ user: otherLecturer, classRecord, classId: CLASS_ID }),
        (err) => err.statusCode === 403 && /bukan dosen pengampu/i.test(err.message)
      );
    });

    test('Admin ditolak 403 (Admin memakai /api/admin/classes)', async () => {
      await assert.rejects(
        () => authorizeClassAccess({ user: admin, classRecord, classId: CLASS_ID }),
        (err) => {
          assert.equal(err.statusCode, 403);
          assert.match(err.message, /Akses ditolak/i);
          assert.match(err.message, /Mahasiswa dan Dosen/i);
          return true;
        }
      );
    });

    test('kelas tidak ditemukan → 404', async () => {
      await assert.rejects(
        () => authorizeClassAccess({ user: student, classRecord: null, classId: CLASS_ID }),
        (err) => err.statusCode === 404 && /tidak ditemukan/i.test(err.message)
      );
    });
  });

  describe('5. CanManageClass — Dosen pengampu atau Admin', () => {
    test('Admin selalu boleh mengelola', () => {
      assert.equal(canManageClass(classRecord, admin), true);
    });

    test('Dosen pengampu boleh, dosen lain tidak', () => {
      assert.equal(canManageClass(classRecord, lecturer), true);
      assert.equal(canManageClass(classRecord, otherLecturer), false);
    });

    test('Mahasiswa tidak boleh mengelola kelas', () => {
      assert.equal(canManageClass(classRecord, student), false);
    });

    test('ensureCanManageClass melempar 403 dengan pesan yang jelas', () => {
      assert.throws(
        () => ensureCanManageClass(classRecord, student),
        (err) => {
          assert.equal(err.statusCode, 403);
          assert.match(err.message, /Akses ditolak/i);
          assert.match(err.message, /dosen pengampu kelas atau Admin/i);
          return true;
        }
      );
    });

    test('ensureCanManageClass meloloskan Admin dan dosen pengampu', () => {
      assert.doesNotThrow(() => ensureCanManageClass(classRecord, admin));
      assert.doesNotThrow(() => ensureCanManageClass(classRecord, lecturer));
    });
  });

  describe('6. CanReadClass — pengampu, Admin, atau mahasiswa ter-enroll', () => {
    test('Admin dan dosen pengampu boleh membaca', async () => {
      assert.equal(await canReadClass({ user: admin, classRecord }), true);
      assert.equal(await canReadClass({ user: lecturer, classRecord }), true);
    });

    test('dosen bukan pengampu tidak boleh membaca', async () => {
      assert.equal(await canReadClass({ user: otherLecturer, classRecord }), false);
    });

    test('mahasiswa ter-enroll boleh, belum ter-enroll tidak', async () => {
      assert.equal(
        await canReadClass({
          user: student,
          classRecord,
          classId: CLASS_ID,
          dbClient: fakeDb({ student: { id: STUDENT_ID }, enrollment: { id: 'enrollment-1' } }),
        }),
        true
      );

      assert.equal(
        await canReadClass({
          user: student,
          classRecord,
          classId: CLASS_ID,
          dbClient: fakeDb({ student: { id: STUDENT_ID }, enrollment: null }),
        }),
        false
      );
    });

    test('ensureCanReadClass menolak 403 dengan pesan "tidak terdaftar"', async () => {
      await assert.rejects(
        () =>
          ensureCanReadClass({
            user: student,
            classRecord,
            classId: CLASS_ID,
            dbClient: fakeDb({ student: { id: STUDENT_ID }, enrollment: null }),
          }),
        (err) => err.statusCode === 403 && /tidak terdaftar/i.test(err.message)
      );
    });
  });
});
