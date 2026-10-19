import prisma from '../../config/prisma.js';
import { AppError } from '../../utils/errors.js';
import { AuditLogService } from '../audit-log/audit-log.service.js';

const classAuditValues = ({ course_id, lecturer_id, academic_year, semester, name, capacity }) => ({
  course_id,
  lecturer_id,
  academic_year,
  semester,
  name,
  capacity,
});

const classRelations = {
  course: {
    select: { id: true, code: true, name: true, credits: true, is_active: true },
  },
  lecturer: {
    select: {
      id: true,
      nidn: true,
      nip: true,
      gelar_depan: true,
      gelar_belakang: true,
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
  _count: { select: { enrollments: true } },
};

export class ClassesService {
  static async getClasses({
    page = 1,
    limit = 20,
    search,
    academic_year,
    semester,
    course_id,
    lecturer_id,
  } = {}) {
    const take = Math.min(100, Math.max(1, Number(limit) || 20));
    const currentPage = Math.max(1, Number(page) || 1);
    const where = {};

    if (academic_year) where.academic_year = academic_year;
    if (semester) where.semester = semester;
    if (course_id) where.course_id = course_id;
    if (lecturer_id) where.lecturer_id = lecturer_id;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { academic_year: { contains: search, mode: 'insensitive' } },
        { course: { code: { contains: search, mode: 'insensitive' } } },
        { course: { name: { contains: search, mode: 'insensitive' } } },
      ];
    }

    const [total, items] = await Promise.all([
      prisma.class.count({ where }),
      prisma.class.findMany({
        where,
        skip: (currentPage - 1) * take,
        take,
        orderBy: [{ academic_year: 'desc' }, { semester: 'asc' }, { name: 'asc' }],
        include: classRelations,
      }),
    ]);

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

  static async getClassById(id) {
    const classRecord = await prisma.class.findUnique({
      where: { id },
      include: classRelations,
    });
    if (!classRecord) throw new AppError('Kelas perkuliahan tidak ditemukan', 404);
    return classRecord;
  }

  static async validateReferences({ course_id, lecturer_id }) {
    if (course_id) {
      const course = await prisma.course.findUnique({
        where: { id: course_id },
        select: { id: true, is_active: true },
      });
      if (!course || !course.is_active) {
        throw new AppError('Mata kuliah tidak ditemukan atau sudah tidak aktif', 400);
      }
    }

    if (lecturer_id) {
      const lecturer = await prisma.dosen.findUnique({
        where: { id: lecturer_id },
        select: {
          id: true,
          user: { select: { role: true, status: true } },
        },
      });
      if (!lecturer || lecturer.user.role !== 'dosen') {
        throw new AppError('Dosen pengampu tidak ditemukan', 400);
      }
      if (lecturer.user.status !== 'ACTIVE') {
        throw new AppError('Dosen pengampu tidak berstatus aktif', 400);
      }
    }
  }

  static async createClass({ adminId, classData, ipAddress, userAgent }) {
    await this.validateReferences(classData);
    const classRecord = await prisma.class.create({
      data: classData,
      include: classRelations,
    });

    await AuditLogService.logClassMutation({
      userId: adminId,
      action: 'CREATE_CLASS',
      classId: classRecord.id,
      newValues: classAuditValues(classRecord),
      ipAddress,
      userAgent,
    });
    return classRecord;
  }

  static async updateClass({ adminId, classId, updateData, ipAddress, userAgent }) {
    const existing = await this.getClassById(classId);
    await this.validateReferences(updateData);

    if (updateData.capacity !== undefined) {
      const enrolledCount = await prisma.enrollment.count({
        where: { class_id: classId },
      });
      if (updateData.capacity < enrolledCount) {
        throw new AppError(
          `Kapasitas tidak boleh kurang dari jumlah mahasiswa terdaftar (${enrolledCount})`,
          409
        );
      }
    }

    const classRecord = await prisma.class.update({
      where: { id: classId },
      data: updateData,
      include: classRelations,
    });

    await AuditLogService.logClassMutation({
      userId: adminId,
      action: 'UPDATE_CLASS',
      classId: classRecord.id,
      oldValues: classAuditValues(existing),
      newValues: classAuditValues(classRecord),
      ipAddress,
      userAgent,
    });
    return classRecord;
  }

  static async deleteClass({ adminId, classId, ipAddress, userAgent }) {
    const existing = await this.getClassById(classId);
    if (existing._count.enrollments > 0) {
      throw new AppError('Kelas yang masih memiliki mahasiswa terdaftar tidak dapat dihapus', 409);
    }

    await prisma.class.delete({ where: { id: classId } });
    await AuditLogService.logClassMutation({
      userId: adminId,
      action: 'DELETE_CLASS',
      classId,
      oldValues: classAuditValues(existing),
      ipAddress,
      userAgent,
    });

    return { id: classId };
  }
}
