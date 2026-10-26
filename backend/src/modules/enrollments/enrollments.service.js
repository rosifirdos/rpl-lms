import prisma from '../../config/prisma.js';
import { AppError } from '../../utils/errors.js';
import { AuditLogService } from '../audit-log/audit-log.service.js';

export class EnrollmentsService {
  /**
   * Mengambil daftar mahasiswa yang telah terdaftar di suatu kelas
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
                      phone: true,
                      avatar_file_id: true,
                      avatar_file: {
                        select: {
                          id: true,
                          original_name: true,
                          storage_name: true,
                          file_path: true,
                          mime_type: true,
                        },
                      },
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
                  phone: true,
                  avatar_file_id: true,
                  avatar_file: {
                    select: {
                      id: true,
                      original_name: true,
                      storage_name: true,
                      file_path: true,
                      mime_type: true,
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
   * Mendaftarkan mahasiswa ke kelas secara langsung (individual maupun batch) â€” BR-002
   */
  static async enrollStudents({ adminId, classId, studentIds, ipAddress, userAgent }) {
    // 1. Validasi keberadaan kelas dan hitung sisa kuota
    const classRecord = await prisma.class.findUnique({
      where: { id: classId },
      include: {
        course: { select: { id: true, code: true, name: true } },
        _count: { select: { enrollments: true } },
      },
    });

    if (!classRecord) {
      throw new AppError('Kelas perkuliahan tidak ditemukan', 404);
    }

    const uniqueIds = Array.from(new Set(studentIds));
    if (uniqueIds.length === 0) {
      throw new AppError('Setidaknya satu ID mahasiswa harus diberikan', 400);
    }

    // 2. Cari mahasiswa berdasarkan id Mahasiswa ATAU id User
    const foundStudents = await prisma.mahasiswa.findMany({
      where: {
        OR: [{ id: { in: uniqueIds } }, { user_id: { in: uniqueIds } }],
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

    if (foundStudents.length !== uniqueIds.length) {
      throw new AppError('Satu atau lebih data mahasiswa tidak ditemukan', 404);
    }

    // 3. Validasi status aktif akun mahasiswa
    for (const student of foundStudents) {
      if (student.user.status !== 'ACTIVE') {
        throw new AppError(
          `Mahasiswa dengan NIM ${student.nim} tidak berstatus aktif (${student.user.status})`,
          400
        );
      }
    }

    const resolvedStudentIds = foundStudents.map((s) => s.id);

    // 4. Periksa apakah sudah ada mahasiswa yang terdaftar di kelas ini
    const existingEnrollments = await prisma.enrollment.findMany({
      where: {
        class_id: classId,
        student_id: { in: resolvedStudentIds },
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

    // 5. Validasi daya tampung / kapasitas kelas (SRS Bab 4 & IMPLEMENTATION_PLAN)
    const currentEnrolled = classRecord._count.enrollments;
    const remainingQuota = classRecord.capacity - currentEnrolled;

    if (resolvedStudentIds.length > remainingQuota) {
      throw new AppError(
        `Kapasitas kelas tidak mencukupi (kapasitas: ${classRecord.capacity}, terdaftar: ${currentEnrolled}, sisa kuota: ${remainingQuota}, mencoba mendaftarkan: ${resolvedStudentIds.length})`,
        409
      );
    }

    // 6. Jalankan pendaftaran dalam transaksi
    const createdEnrollments = await prisma.$transaction(
      foundStudents.map((student) =>
        prisma.enrollment.create({
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

    // 7. Catat jejak audit untuk setiap mahasiswa yang dienroll (SRS Bab 10, FR-048)
    for (const enr of createdEnrollments) {
      await AuditLogService.logEnrollmentMutation({
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
      });
    }

    return createdEnrollments;
  }

  /**
   * Menghapus kepesertaan (*unenroll*) mahasiswa dari kelas
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
