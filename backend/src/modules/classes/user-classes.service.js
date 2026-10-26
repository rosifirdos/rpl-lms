import prisma from '../../config/prisma.js';
import { AppError } from '../../utils/errors.js';
import { ROLES } from '../../constants/roles.js';

export class UserClassesService {
  /**
   * Helper format nama dosen bergelar
   */
  static formatLecturerName(lecturer) {
    if (!lecturer) return null;
    const fullName = lecturer.user?.profile?.full_name || 'Dosen Pengampu';
    const depan = lecturer.gelar_depan ? `${lecturer.gelar_depan} ` : '';
    const belakang = lecturer.gelar_belakang ? `, ${lecturer.gelar_belakang}` : '';
    return `${depan}${fullName}${belakang}`;
  }

  /**
   * Menghasilkan struktur 16 pertemuan terstruktur secara sistematis (BR-004)
   * Pertemuan 1â€“7: Pra-UTS
   * Pertemuan 8: Evaluasi Tengah Semester (UTS)
   * Pertemuan 9â€“15: Pasca-UTS
   * Pertemuan 16: Evaluasi Akhir Semester (UAS)
   */
  static generate16Meetings(classRecord) {
    const meetings = [];
    for (let i = 1; i <= 16; i++) {
      if (i === 8) {
        meetings.push({
          meeting_number: 8,
          title: 'Pertemuan 8: Evaluasi Tengah Semester (UTS)',
          description: `Ujian Tengah Semester untuk mata kuliah ${classRecord.course.name}`,
          type: 'UTS',
          is_exam: true,
          attendance_required_percentage: 70, // Prasyarat kehadiran â‰¥70% (BR-012)
        });
      } else if (i === 16) {
        meetings.push({
          meeting_number: 16,
          title: 'Pertemuan 16: Evaluasi Akhir Semester (UAS)',
          description: `Ujian Akhir Semester untuk mata kuliah ${classRecord.course.name}`,
          type: 'UAS',
          is_exam: true,
          attendance_required_percentage: 70, // Prasyarat kehadiran â‰¥70% (BR-012)
        });
      } else {
        meetings.push({
          meeting_number: i,
          title: `Pertemuan ${i}`,
          description: `Sesi pembelajaran perkuliahan pertemuan ke-${i}`,
          type: 'REGULAR',
          is_exam: false,
          attendance_required_percentage: null,
        });
      }
    }
    return meetings;
  }

  /**
   * Mengambil daftar kelas sesuai konteks peran pengguna (Mahasiswa: enrolled, Dosen: diampu)
   */
  static async getUserClasses(user, { page = 1, limit = 20, search, academic_year, semester } = {}) {
    const take = Math.min(100, Math.max(1, Number(limit) || 20));
    const currentPage = Math.max(1, Number(page) || 1);

    if (user.role === ROLES.MAHASISWA) {
      const student = await prisma.mahasiswa.findUnique({
        where: { user_id: user.id },
      });
      if (!student) {
        throw new AppError('Data mahasiswa tidak ditemukan', 404);
      }

      const where = {
        student_id: student.id,
      };

      if (academic_year || semester || search) {
        where.class = {};
        if (academic_year) where.class.academic_year = academic_year;
        if (semester) where.class.semester = semester;
        if (search) {
          where.class.OR = [
            { name: { contains: search, mode: 'insensitive' } },
            { course: { code: { contains: search, mode: 'insensitive' } } },
            { course: { name: { contains: search, mode: 'insensitive' } } },
          ];
        }
      }

      const [total, enrollments] = await Promise.all([
        prisma.enrollment.count({ where }),
        prisma.enrollment.findMany({
          where,
          skip: (currentPage - 1) * take,
          take,
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
                _count: { select: { enrollments: true } },
              },
            },
          },
        }),
      ]);

      const items = enrollments.map((enr) => ({
        id: enr.class.id,
        enrollment_id: enr.id,
        name: enr.class.name,
        academic_year: enr.class.academic_year,
        semester: enr.class.semester,
        capacity: enr.class.capacity,
        enrolled_count: enr.class._count.enrollments,
        total_meetings: 16,
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
        enrolled_at: enr.enrolled_at,
      }));

      return {
        items,
        meta: {
          page: currentPage,
          limit: take,
          total,
          totalPages: Math.ceil(total / take),
        },
      };
    }

    if (user.role === ROLES.DOSEN) {
      const lecturer = await prisma.dosen.findUnique({
        where: { user_id: user.id },
      });
      if (!lecturer) {
        throw new AppError('Data dosen tidak ditemukan', 404);
      }

      const where = {
        lecturer_id: lecturer.id,
      };
      if (academic_year) where.academic_year = academic_year;
      if (semester) where.semester = semester;
      if (search) {
        where.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { course: { code: { contains: search, mode: 'insensitive' } } },
          { course: { name: { contains: search, mode: 'insensitive' } } },
        ];
      }

      const [total, classes] = await Promise.all([
        prisma.class.count({ where }),
        prisma.class.findMany({
          where,
          skip: (currentPage - 1) * take,
          take,
          orderBy: [{ academic_year: 'desc' }, { semester: 'asc' }, { name: 'asc' }],
          include: {
            course: {
              select: { id: true, code: true, name: true, credits: true },
            },
            _count: { select: { enrollments: true } },
          },
        }),
      ]);

      const items = classes.map((cls) => ({
        id: cls.id,
        name: cls.name,
        academic_year: cls.academic_year,
        semester: cls.semester,
        capacity: cls.capacity,
        enrolled_count: cls._count.enrollments,
        total_meetings: 16,
        course: cls.course,
      }));

      return {
        items,
        meta: {
          page: currentPage,
          limit: take,
          total,
          totalPages: Math.ceil(total / take),
        },
      };
    }

    // Role ADMIN: Seluruh daftar kelas
    const where = {};
    if (academic_year) where.academic_year = academic_year;
    if (semester) where.semester = semester;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { course: { code: { contains: search, mode: 'insensitive' } } },
        { course: { name: { contains: search, mode: 'insensitive' } } },
      ];
    }

    const [total, classes] = await Promise.all([
      prisma.class.count({ where }),
      prisma.class.findMany({
        where,
        skip: (currentPage - 1) * take,
        take,
        orderBy: [{ academic_year: 'desc' }, { semester: 'asc' }, { name: 'asc' }],
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
          _count: { select: { enrollments: true } },
        },
      }),
    ]);

    const items = classes.map((cls) => ({
      id: cls.id,
      name: cls.name,
      academic_year: cls.academic_year,
      semester: cls.semester,
      capacity: cls.capacity,
      enrolled_count: cls._count.enrollments,
      total_meetings: 16,
      course: cls.course,
      lecturer: {
        id: cls.lecturer.id,
        nidn: cls.lecturer.nidn,
        nip: cls.lecturer.nip,
        gelar_depan: cls.lecturer.gelar_depan,
        gelar_belakang: cls.lecturer.gelar_belakang,
        full_name: cls.lecturer.user?.profile?.full_name || null,
        formatted_name: this.formatLecturerName(cls.lecturer),
      },
    }));

    return {
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
   * Mengambil detail kelas dan daftar 16 pertemuan terstruktur (BR-003, BR-004)
   */
  static async getClassDetail(user, classId) {
    const classRecord = await prisma.class.findUnique({
      where: { id: classId },
      include: {
        course: true,
        lecturer: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                profile: { select: { full_name: true } },
              },
            },
          },
        },
        _count: { select: { enrollments: true } },
      },
    });

    if (!classRecord) {
      throw new AppError('Kelas perkuliahan tidak ditemukan', 404);
    }

    // Otoritas Akses Kelas (Aturan Bisnis BR-003)
    if (user.role === ROLES.MAHASISWA) {
      const student = await prisma.mahasiswa.findUnique({
        where: { user_id: user.id },
      });
      if (!student) {
        throw new AppError('Data mahasiswa tidak ditemukan', 404);
      }

      const enrollment = await prisma.enrollment.findUnique({
        where: {
          class_id_student_id: {
            class_id: classId,
            student_id: student.id,
          },
        },
      });

      if (!enrollment) {
        throw new AppError(
          'Akses ditolak: Anda tidak terdaftar pada kelas perkuliahan ini (BR-003)',
          403
        );
      }
    } else if (user.role === ROLES.DOSEN) {
      if (classRecord.lecturer.user_id !== user.id) {
        throw new AppError(
          'Akses ditolak: Anda bukan dosen pengampu untuk kelas perkuliahan ini',
          403
        );
      }
    }

    const meetings = this.generate16Meetings(classRecord);

    return {
      id: classRecord.id,
      name: classRecord.name,
      academic_year: classRecord.academic_year,
      semester: classRecord.semester,
      capacity: classRecord.capacity,
      enrolled_count: classRecord._count.enrollments,
      course: {
        id: classRecord.course.id,
        code: classRecord.course.code,
        name: classRecord.course.name,
        credits: classRecord.course.credits,
        description: classRecord.course.description,
      },
      lecturer: {
        id: classRecord.lecturer.id,
        nidn: classRecord.lecturer.nidn,
        nip: classRecord.lecturer.nip,
        gelar_depan: classRecord.lecturer.gelar_depan,
        gelar_belakang: classRecord.lecturer.gelar_belakang,
        full_name: classRecord.lecturer.user?.profile?.full_name || null,
        formatted_name: this.formatLecturerName(classRecord.lecturer),
        email: classRecord.lecturer.user?.email,
      },
      total_meetings: 16,
      meetings,
    };
  }
}
