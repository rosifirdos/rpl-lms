import prisma from '../../config/prisma.js';
import { AppError } from '../../utils/errors.js';
import { ROLES } from '../../constants/roles.js';

export class DashboardService {
  /**
   * Helper format nama dosen bergelar akademik
   */
  static formatLecturerName(lecturer) {
    if (!lecturer) return null;
    const fullName = lecturer.user?.profile?.full_name || 'Dosen Pengampu';
    const depan = lecturer.gelar_depan ? `${lecturer.gelar_depan} ` : '';
    const belakang = lecturer.gelar_belakang ? `, ${lecturer.gelar_belakang}` : '';
    return `${depan}${fullName}${belakang}`;
  }

  /**
   * Dasbor kontekstual untuk Administrator (SRS Bab 4 & IMPLEMENTATION_PLAN Bab 4.3)
   */
  static async getAdminDashboard() {
    const [
      totalStudents,
      totalLecturers,
      totalCourses,
      totalClasses,
      totalEnrollments,
      activeUsers,
      recentAuditLogs,
    ] = await Promise.all([
      prisma.mahasiswa.count(),
      prisma.dosen.count(),
      prisma.course.count({ where: { is_active: true } }),
      prisma.class.count(),
      prisma.enrollment.count(),
      prisma.user.count({ where: { status: 'ACTIVE' } }),
      prisma.auditLog.findMany({
        take: 5,
        orderBy: { created_at: 'desc' },
        include: {
          user: {
            select: {
              username: true,
              role: true,
              profile: { select: { full_name: true } },
            },
          },
        },
      }),
    ]);

    return {
      role: ROLES.ADMIN,
      metrics: {
        total_students: totalStudents,
        total_lecturers: totalLecturers,
        total_courses: totalCourses,
        total_classes: totalClasses,
        total_enrollments: totalEnrollments,
      },
      system_summary: {
        active_users: activeUsers,
        total_records: totalStudents + totalLecturers + totalCourses + totalClasses,
      },
      shortcuts: [
        { title: 'Manajemen Pengguna', path: '/admin/users' },
        { title: 'Master Mata Kuliah', path: '/admin/courses' },
        { title: 'Pembukaan Kelas', path: '/admin/classes' },
        { title: 'Direct Enrollment', path: '/admin/enrollments' },
        { title: 'Jejak Audit Sistem', path: '/admin/audit-logs' },
      ],
      recent_audit_logs: recentAuditLogs,
    };
  }

  /**
   * Dasbor kontekstual untuk Dosen (SRS Bab 4 & IMPLEMENTATION_PLAN Bab 4.3)
   */
  static async getLecturerDashboard(userId) {
    const lecturer = await prisma.dosen.findUnique({
      where: { user_id: userId },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
            status: true,
            profile: {
              include: {
                avatar_file: {
                  select: { id: true, original_name: true, storage_name: true },
                },
              },
            },
          },
        },
        classes: {
          orderBy: [{ academic_year: 'desc' }, { semester: 'asc' }, { name: 'asc' }],
          include: {
            course: {
              select: { id: true, code: true, name: true, credits: true },
            },
            _count: {
              select: { enrollments: true },
            },
          },
        },
      },
    });

    if (!lecturer) {
      throw new AppError('Data profil dosen tidak ditemukan', 404);
    }

    const formattedClasses = lecturer.classes.map((cls) => ({
      id: cls.id,
      name: cls.name,
      academic_year: cls.academic_year,
      semester: cls.semester,
      capacity: cls.capacity,
      enrolled_count: cls._count.enrollments,
      total_meetings: 16, // Sesuai aturan bisnis BR-004
      course: cls.course,
    }));

    const totalStudentsTaught = formattedClasses.reduce(
      (sum, cls) => sum + cls.enrolled_count,
      0
    );

    return {
      role: ROLES.DOSEN,
      profile: {
        id: lecturer.id,
        user_id: lecturer.user_id,
        username: lecturer.user.username,
        email: lecturer.user.email,
        full_name: lecturer.user.profile?.full_name || null,
        nidn: lecturer.nidn,
        nip: lecturer.nip,
        gelar_depan: lecturer.gelar_depan,
        gelar_belakang: lecturer.gelar_belakang,
        formatted_name: this.formatLecturerName(lecturer),
        avatar: lecturer.user.profile?.avatar_file || null,
      },
      summary: {
        total_classes: formattedClasses.length,
        total_students: totalStudentsTaught,
      },
      teaching_classes: formattedClasses,
    };
  }

  /**
   * Dasbor kontekstual untuk Mahasiswa (SRS Bab 4 & IMPLEMENTATION_PLAN Bab 4.3)
   */
  static async getStudentDashboard(userId) {
    const student = await prisma.mahasiswa.findUnique({
      where: { user_id: userId },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
            status: true,
            profile: {
              include: {
                avatar_file: {
                  select: { id: true, original_name: true, storage_name: true },
                },
              },
            },
          },
        },
        enrollments: {
          orderBy: { enrolled_at: 'desc' },
          include: {
            class: {
              include: {
                course: {
                  select: { id: true, code: true, name: true, credits: true },
                },
                lecturer: {
                  include: {
                    user: {
                      select: {
                        profile: { select: { full_name: true } },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!student) {
      throw new AppError('Data profil mahasiswa tidak ditemukan', 404);
    }

    const enrolledClasses = student.enrollments.map((enr) => ({
      enrollment_id: enr.id,
      id: enr.class.id,
      class_id: enr.class.id,
      name: enr.class.name,
      academic_year: enr.class.academic_year,
      semester: enr.class.semester,
      enrolled_at: enr.enrolled_at,
      total_meetings: 16, // Sesuai aturan bisnis BR-004
      course: enr.class.course,
      lecturer: {
        id: enr.class.lecturer.id,
        nidn: enr.class.lecturer.nidn,
        nip: enr.class.lecturer.nip,
        gelar_depan: enr.class.lecturer.gelar_depan,
        gelar_belakang: enr.class.lecturer.gelar_belakang,
        full_name: enr.class.lecturer.user?.profile?.full_name || null,
        formatted_name: this.formatLecturerName(enr.class.lecturer),
      },
    }));

    const totalCredits = enrolledClasses.reduce(
      (sum, item) => sum + (item.course?.credits || 0),
      0
    );

    return {
      role: ROLES.MAHASISWA,
      profile: {
        id: student.id,
        user_id: student.user_id,
        username: student.user.username,
        email: student.user.email,
        full_name: student.user.profile?.full_name || null,
        nim: student.nim,
        prodi: student.prodi,
        angkatan: student.angkatan,
        status: student.user.status,
        avatar: student.user.profile?.avatar_file || null,
      },
      summary: {
        total_enrolled_classes: enrolledClasses.length,
        total_credits: totalCredits,
      },
      enrolled_classes: enrolledClasses,
    };
  }

  /**
   * Pengambil dasbor utama yang mendelegasikan berdasarkan peran (RBAC)
   */
  static async getDashboard(user) {
    switch (user.role) {
      case ROLES.ADMIN:
        return this.getAdminDashboard();
      case ROLES.DOSEN:
        return this.getLecturerDashboard(user.id);
      case ROLES.MAHASISWA:
        return this.getStudentDashboard(user.id);
      default:
        throw new AppError(`Peran pengguna '${user.role}' tidak dikenali`, 403);
    }
  }
}
