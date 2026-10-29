import prisma from '../../config/prisma.js';
import { AppError } from '../../utils/errors.js';
import { AuditLogService } from '../audit-log/audit-log.service.js';

const courseAuditValues = ({ code, name, credits, description, is_active }) => ({
  code,
  name,
  credits,
  description,
  is_active,
});

export class CoursesService {
  static async getCourses({ page = 1, limit = 20, search, is_active } = {}) {
    const take = Math.min(100, Math.max(1, Number(limit) || 20));
    const currentPage = Math.max(1, Number(page) || 1);
    const where = {};

    if (is_active !== undefined) where.is_active = is_active;
    if (search) {
      where.OR = [
        { code: { contains: search, mode: 'insensitive' } },
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [total, items] = await Promise.all([
      prisma.course.count({ where }),
      prisma.course.findMany({
        where,
        skip: (currentPage - 1) * take,
        take,
        orderBy: [{ code: 'asc' }, { name: 'asc' }],
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

  static async getCourseById(id) {
    const course = await prisma.course.findUnique({ where: { id } });
    if (!course) throw new AppError('Mata kuliah tidak ditemukan', 404);
    return course;
  }

  static async createCourse({ adminId, courseData, ipAddress, userAgent }) {
    const course = await prisma.course.create({
      data: {
        ...courseData,
        is_active: true,
      },
    });

    await AuditLogService.logMasterDataMutation({
      userId: adminId,
      action: 'CREATE_COURSE',
      entity: 'courses',
      entityId: course.id,
      newValues: courseAuditValues(course),
      ipAddress,
      userAgent,
    });
    return course;
  }

  static async updateCourse({ adminId, courseId, updateData, ipAddress, userAgent }) {
    const existing = await this.getCourseById(courseId);
    const course = await prisma.course.update({
      where: { id: courseId },
      data: updateData,
    });

    await AuditLogService.logMasterDataMutation({
      userId: adminId,
      action: 'UPDATE_COURSE',
      entity: 'courses',
      entityId: course.id,
      oldValues: courseAuditValues(existing),
      newValues: courseAuditValues(course),
      ipAddress,
      userAgent,
    });
    return course;
  }

  static async deleteCourse({ adminId, courseId, ipAddress, userAgent }) {
    const existing = await this.getCourseById(courseId);
    if (!existing.is_active) {
      throw new AppError('Mata kuliah sudah tidak aktif', 409);
    }

    const course = await prisma.course.update({
      where: { id: courseId },
      data: { is_active: false },
    });

    await AuditLogService.logMasterDataMutation({
      userId: adminId,
      action: 'DEACTIVATE_COURSE',
      entity: 'courses',
      entityId: course.id,
      oldValues: courseAuditValues(existing),
      newValues: courseAuditValues(course),
      ipAddress,
      userAgent,
    });
    return course;
  }
}
