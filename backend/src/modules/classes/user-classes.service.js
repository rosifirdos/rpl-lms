import prisma from '../../config/prisma.js';
import { AppError } from '../../utils/errors.js';
import { ROLES } from '../../constants/roles.js';
import { ACADEMIC } from '../../constants/academic.js';
import { formatLecturerName } from '../../utils/format.js';
import {
  authorizeClassAccess,
  getLecturerRecordOrThrow,
  getStudentRecordOrThrow,
} from '../../utils/ownership.js';

export class UserClassesService {
  /**
   * Menghasilkan struktur 16 pertemuan terstruktur secara sistematis (BR-004)
   * Menggunakan konstanta tunggal ACADEMIC (FR-050)
   */
  static generate16Meetings(classRecord) {
    const meetings = [];
    for (let i = 1; i <= ACADEMIC.TOTAL_MEETINGS; i++) {
      const isExam = !!ACADEMIC.EXAM_MEETINGS[i];
      const examType = ACADEMIC.EXAM_MEETINGS[i] || null;

      if (isExam) {
        const examName = examType === 'UTS' ? 'Evaluasi Tengah Semester (UTS)' : 'Evaluasi Akhir Semester (UAS)';
        meetings.push({
          meeting_number: i,
          title: `Pertemuan ${i}: ${examName}`,
          description: `Ujian ${examType === 'UTS' ? 'Tengah' : 'Akhir'} Semester untuk mata kuliah ${classRecord.course.name}`,
          type: examType,
          is_exam: true,
          attendance_required_percentage: ACADEMIC.DEFAULT_ATTENDANCE_THRESHOLD, // Prasyarat kehadiran (BR-012, FR-050)
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
   * Mengambil daftar kelas sesuai kontekstual peran pengguna (Mahasiswa: enrolled, Dosen: diampu)
   * FIX F5: Penanganan eksplisit role dan throw 403 pada role yang tidak diizinkan (fail-closed)
   * FIX F6: Pakai ACADEMIC.TOTAL_MEETINGS
   * FIX F7: Pakai formatLecturerName dari utils/format.js
   */
  static async getUserClasses(user, { page = 1, limit = 20, search, academic_year, semester } = {}) {
    const take = Math.min(100, Math.max(1, Number(limit) || 20));
    const currentPage = Math.max(1, Number(page) || 1);

    if (user.role === ROLES.MAHASISWA) {
      const student = await getStudentRecordOrThrow(user.id);

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
        total_meetings: ACADEMIC.TOTAL_MEETINGS,
        course: enr.class.course,
        lecturer: {
          id: enr.class.lecturer.id,
          nidn: enr.class.lecturer.nidn,
          nip: enr.class.lecturer.nip,
          gelar_depan: enr.class.lecturer.gelar_depan,
          gelar_belakang: enr.class.lecturer.gelar_belakang,
          full_name: enr.class.lecturer.user?.profile?.full_name || null,
          formatted_name: formatLecturerName(enr.class.lecturer),
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
      const lecturer = await getLecturerRecordOrThrow(user.id);

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
        total_meetings: ACADEMIC.TOTAL_MEETINGS,
        course: cls.course,
        lecturer: {
          id: cls.lecturer.id,
          nidn: cls.lecturer.nidn,
          nip: cls.lecturer.nip,
          gelar_depan: cls.lecturer.gelar_depan,
          gelar_belakang: cls.lecturer.gelar_belakang,
          full_name: cls.lecturer.user?.profile?.full_name || null,
          formatted_name: formatLecturerName(cls.lecturer),
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

    // FIX F5: Ditolak jika role bukan MAHASISWA atau DOSEN (Admin gunakan /api/admin/classes)
    throw new AppError('Akses ditolak: endpoint /api/classes hanya untuk Mahasiswa dan Dosen', 403);
  }

  /**
   * Mengambil detail kelas dan daftar 16 pertemuan terstruktur (BR-003, BR-004)
   * FIX F6: Pakai ACADEMIC.TOTAL_MEETINGS
   * FIX F7: Pakai formatLecturerName dari utils/format.js
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

    // Otoritas Akses Kelas (Aturan Bisnis BR-003) — helper terpusat Fase 0 MVP 2
    await authorizeClassAccess({ user, classRecord, classId });

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
        formatted_name: formatLecturerName(classRecord.lecturer),
        email: classRecord.lecturer.user?.email,
      },
      total_meetings: ACADEMIC.TOTAL_MEETINGS,
      meetings,
    };
  }
}
