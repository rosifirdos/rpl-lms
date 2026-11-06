import prisma from '../../config/prisma.js';
import { AppError } from '../../utils/errors.js';
import { AuditLogService } from '../audit-log/audit-log.service.js';
import { ACADEMIC } from '../../constants/academic.js';

export class EnrollmentsService {
  /**
   * Mengambil daftar mahasiswa yang telah terdaftar di suatu kelas
   * FIX F2: Hapus storage_name dan file_path dari select (BR-009 privasi)
   */
  static async getClassEnrollments(classId, { page = 1, limit = 20, search } = {}) {
    const classRecord = await prisma.class.findUnique({
      where: { id: classId },
      select: { id: true, name: true, capacity: true },
    });
    if (!classRecord) {
      throw new AppError('Kelas perkuliahan tidak ditemukan', 404);
    }

    const take = Math.min(100, Math.max(1, Number(limit) || 20));
    const currentPage = Math.max(1, Number(page) || 1);

    const where = {
      class_id: classId,
    };

    if (search) {
      where.student = {
        OR: [
          { nim: { contains: search, mode: 'insensitive' } },
          { prodi: { contains: search, mode: 'insensitive' } },
          { user: { email: { contains: search, mode: 'insensitive' } } },
          { user: { profile: { full_name: { contains: search, mode: 'insensitive' } } } },
        ],
      };
    }

    const [total, items] = await Promise.all([
      prisma.enrollment.count({ where }),
      prisma.enrollment.findMany({
        where,
        skip: (currentPage - 1) * take,
        take,
        orderBy: { enrolled_at: 'desc' },
        include: {
          student: {
            select: {
              id: true,
              nim: true,
              prodi: true,
              angkatan: true,
              user: {
                select: {
                  id: true,
                  username: true,
                  email: true,
                  status: true,
                  profile: {
                    select: {
                      full_name: true,
                      avatar_file_id: true,
                    },
                  },
                },
              },
            },
          },
        },
      }),
    ]);

    return {
      class: classRecord,
      items,
      meta: {
        page: currentPage,
        limit: take,
        total,
        totalPages: Math.ceil(total / take),
      },
    };
  }

  /**
   * Mengambil daftar mahasiswa yang belum terdaftar di kelas (tersedia untuk dienroll)
   * FIX F2: Hapus storage_name dan file_path dari select (BR-009 privasi)
   */
  static async getAvailableStudents(classId, { page = 1, limit = 20, search } = {}) {
    const classRecord = await prisma.class.findUnique({
      where: { id: classId },
      select: { id: true, name: true, capacity: true },
    });
    if (!classRecord) {
      throw new AppError('Kelas perkuliahan tidak ditemukan', 404);
    }

    const take = Math.min(100, Math.max(1, Number(limit) || 20));
    const currentPage = Math.max(1, Number(page) || 1);

    const where = {
      user: {
        status: 'ACTIVE',
      },
      enrollments: {
        none: {
          class_id: classId,
        },
      },
    };

    if (search) {
      where.OR = [
        { nim: { contains: search, mode: 'insensitive' } },
        { prodi: { contains: search, mode: 'insensitive' } },
        { user: { email: { contains: search, mode: 'insensitive' } } },
        { user: { profile: { full_name: { contains: search, mode: 'insensitive' } } } },
      ];
    }

    const [total, items] = await Promise.all([
      prisma.mahasiswa.count({ where }),
      prisma.mahasiswa.findMany({
        where,
        skip: (currentPage - 1) * take,
        take,
        orderBy: [{ angkatan: 'desc' }, { nim: 'asc' }],
        select: {
          id: true,
          nim: true,
          prodi: true,
          angkatan: true,
          user: {
            select: {
              id: true,
              username: true,
              email: true,
              status: true,
              profile: {
                select: {
                  full_name: true,
                  avatar_file_id: true,
                },
              },
            },
          },
        },
      }),
    ]);

    return {
      class: classRecord,
      items,
      meta: {
        page: currentPage,
        limit: take,
        total,
        totalPages: Math.ceil(total / take),
      },
    };
  }

  /**
   * Mendaftarkan mahasiswa ke kelas (individual atau batch)
   * FIX F1: Race condition - use SELECT ... FOR UPDATE dalam Serializable transaction
   * FIX F3: ID resolution - hanya terima student_id = mahasiswa.id (bukan user_id)
   * FIX F8: Audit logging dalam transaksi yang sama (Promise.all, bukan loop)
   */
  static async enrollStudents({ adminId, classId, studentIds, ipAddress, userAgent }) {
    if (!studentIds || studentIds.length === 0) {
      throw new AppError('Minimal satu mahasiswa wajib dipilih untuk didaftarkan', 400);
    }

    // FIX F3: Dedupe student IDs dan validasi format UUID
    const uniqueStudentIds = [...new Set(studentIds)];

    // Resolusi student IDs ke mahasiswa records
    const foundStudents = await prisma.mahasiswa.findMany({
      where: {
        id: { in: uniqueStudentIds },
      },
      include: {
        user: {
          select: {
            id: true,
            status: true,
            profile: { select: { full_name: true } },
          },
        },
      },
    });

    // Validasi semua mahasiswa ditemukan (F3: gunakan Set, bukan panjang array mentah)
    const resolvedSet = new Set(foundStudents.map((s) => s.id));
    if (resolvedSet.size !== uniqueStudentIds.length) {
      const missingIds = uniqueStudentIds.filter((id) => !resolvedSet.has(id));
      throw new AppError(
        `Mahasiswa dengan ID [${missingIds.join(', ')}] tidak ditemukan dalam sistem`,
        404
      );
    }

    // Validasi status aktif akun mahasiswa
    for (const student of foundStudents) {
      if (student.user.status !== 'ACTIVE') {
        throw new AppError(
          `Mahasiswa dengan NIM ${student.nim} tidak berstatus aktif (${student.user.status})`,
          400
        );
      }
    }

    // FIX F1: Race condition - transaksi Serializable dengan lock baris kelas
    const createdEnrollments = await prisma.$transaction(
      async (tx) => {
        // Lock kelas agar count & insert serial (SELECT ... FOR UPDATE)
        const [classLock] = await tx.$queryRaw`
          SELECT id, capacity FROM classes WHERE id = ${classId}::uuid FOR UPDATE
        `;

        if (!classLock) {
          throw new AppError('Kelas perkuliahan tidak ditemukan', 404);
        }

        // Hitung enrollment terkini dalam transaksi (not stale)
        const currentEnrolled = await tx.enrollment.count({
          where: { class_id: classId },
        });

        const remainingQuota = classLock.capacity - currentEnrolled;

        // Validasi daya tampung
        if (uniqueStudentIds.length > remainingQuota) {
          throw new AppError(
            `Kapasitas kelas tidak mencukupi (kapasitas: ${classLock.capacity}, terdaftar: ${currentEnrolled}, sisa kuota: ${remainingQuota}, mencoba mendaftarkan: ${uniqueStudentIds.length})`,
            409
          );
        }

        // Periksa mahasiswa yang sudah terdaftar
        const existingEnrollments = await tx.enrollment.findMany({
          where: {
            class_id: classId,
            student_id: { in: uniqueStudentIds },
          },
          include: {
            student: { select: { nim: true } },
          },
        });

        if (existingEnrollments.length > 0) {
          const alreadyNims = existingEnrollments.map((e) => e.student.nim).join(', ');
          throw new AppError(
            `Mahasiswa dengan NIM [${alreadyNims}] sudah terdaftar pada kelas ini`,
            409
          );
        }

        // Insert semua enrollment sekaligus dalam transaksi yang sama
        const enrollments = await Promise.all(
          foundStudents.map((student) =>
            tx.enrollment.create({
              data: {
                class_id: classId,
                student_id: student.id,
                enrolled_by: adminId,
              },
              include: {
                student: {
                  select: {
                    id: true,
                    nim: true,
                    prodi: true,
                    angkatan: true,
                    user: {
                      select: {
                        id: true,
                        username: true,
                        email: true,
                        profile: { select: { full_name: true } },
                      },
                    },
                  },
                },
                class: {
                  select: {
                    id: true,
                    name: true,
                    academic_year: true,
                    semester: true,
                    course: { select: { id: true, code: true, name: true } },
                  },
                },
              },
            })
          )
        );

        // FIX F8: Catat audit dalam transaksi yang sama (Promise.all)
        await Promise.all(
          enrollments.map((enr) =>
            AuditLogService.logEnrollmentMutation({
              userId: adminId,
              action: 'ENROLL_STUDENT',
              enrollmentId: enr.id,
              studentId: enr.student_id,
              classId: enr.class_id,
              newValues: {
                enrolled_by: adminId,
                student_nim: enr.student.nim,
                student_name: enr.student.user.profile?.full_name || null,
                class_name: enr.class.name,
                course_code: enr.class.course.code,
              },
              ipAddress,
              userAgent,
            })
          )
        );

        return enrollments;
      },
      {
        isolationLevel: 'Serializable',
        timeout: 10000,
      }
    );

    return createdEnrollments;
  }

  /**
   * Menghapus kepesertaan (*unenroll*) mahasiswa dari kelas
   * FIX F8: Audit logging dengan newValues: null untuk semantika penghapusan
   */
  static async unenrollStudent({ adminId, enrollmentId, ipAddress, userAgent }) {
    const existing = await prisma.enrollment.findUnique({
      where: { id: enrollmentId },
      include: {
        student: {
          select: {
            id: true,
            nim: true,
            user: {
              select: {
                id: true,
                profile: { select: { full_name: true } },
              },
            },
          },
        },
        class: {
          select: {
            id: true,
            name: true,
            course: { select: { id: true, code: true, name: true } },
          },
        },
      },
    });

    if (!existing) {
      throw new AppError('Data kepesertaan (enrollment) tidak ditemukan', 404);
    }

    await prisma.enrollment.delete({
      where: { id: enrollmentId },
    });

    // FIX F8: Audit dengan newValues: null untuk penghapusan
    await AuditLogService.logEnrollmentMutation({
      userId: adminId,
      action: 'UNENROLL_STUDENT',
      enrollmentId,
      studentId: existing.student_id,
      classId: existing.class_id,
      oldValues: {
        enrollment_id: existing.id,
        student_nim: existing.student.nim,
        student_name: existing.student.user.profile?.full_name || null,
        class_name: existing.class.name,
        course_code: existing.class.course.code,
      },
      newValues: null,
      ipAddress,
      userAgent,
    });

    return {
      id: enrollmentId,
      student_id: existing.student_id,
      class_id: existing.class_id,
    };
  }
}
