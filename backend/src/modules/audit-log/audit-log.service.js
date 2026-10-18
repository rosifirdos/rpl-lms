import prisma from '../../config/prisma.js';
import { AppError } from '../../utils/errors.js';

/**
 * Layanan terpusat Audit Trail Engine SPADA LMS (SRS Bab 15 & Bab 35)
 */
export class AuditLogService {
  /**
   * Catat mutasi atau kejadian sensitif ke audit log
   */
  static record({
    userId = null,
    action,
    entity,
    entityId = null,
    oldValues = null,
    newValues = null,
    ipAddress = null,
    userAgent = null,
  }) {
    const payload = {
      user_id: userId || null,
      action: String(action).toUpperCase(),
      entity: String(entity).toLowerCase(),
      entity_id: entityId ? String(entityId) : null,
      old_values: oldValues || null,
      new_values: newValues || null,
      ip_address: ipAddress || null,
      user_agent: userAgent || null,
    };

    const writePromise = prisma.auditLog
      .create({ data: payload })
      .catch((error) => {
        console.error('[AuditLogService] Gagal merekam jejak audit:', {
          action: payload.action,
          entity: payload.entity,
          error: error?.message,
        });
        return null;
      });

    return writePromise;
  }

  /**
   * Mengambil daftar jejak audit dengan filter komprehensif dan paginasi
   */
  static async findAll({
    page = 1,
    limit = 20,
    action,
    entity,
    userId,
    startDate,
    endDate,
    search,
    sortBy = 'created_at',
    sortOrder = 'desc',
  } = {}) {
    const currentPage = Math.max(1, parseInt(page, 10) || 1);
    const take = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
    const skip = (currentPage - 1) * take;

    const where = {};

    if (action) {
      where.action = { equals: action.trim().toUpperCase() };
    }

    if (entity) {
      where.entity = { contains: entity.trim().toLowerCase(), mode: 'insensitive' };
    }

    if (userId) {
      where.user_id = { equals: userId };
    }

    if (startDate || endDate) {
      where.created_at = {};
      if (startDate) {
        where.created_at.gte = new Date(startDate);
      }
      if (endDate) {
        const parsedEndDate = new Date(endDate);
        if (typeof endDate === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(endDate.trim())) {
          parsedEndDate.setUTCHours(23, 59, 59, 999);
        }
        where.created_at.lte = parsedEndDate;
      }
    }

    if (search) {
      const trimmedSearch = search.trim();
      where.OR = [
        { action: { contains: trimmedSearch, mode: 'insensitive' } },
        { entity: { contains: trimmedSearch, mode: 'insensitive' } },
        { entity_id: { contains: trimmedSearch, mode: 'insensitive' } },
        { user: { username: { contains: trimmedSearch, mode: 'insensitive' } } },
        { user: { email: { contains: trimmedSearch, mode: 'insensitive' } } },
      ];
    }

    const sortFieldMap = {
      created_at: 'created_at',
      waktu: 'created_at',
      action: 'action',
      entity: 'entity',
    };
    const resolvedSortBy = sortFieldMap[sortBy] || 'created_at';
    const resolvedSortOrder = sortOrder?.toLowerCase() === 'asc' ? 'asc' : 'desc';

    const [total, items] = await Promise.all([
      prisma.auditLog.count({ where }),
      prisma.auditLog.findMany({
        where,
        skip,
        take,
        orderBy: { [resolvedSortBy]: resolvedSortOrder },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              email: true,
              status: true,
              role: true,
              profile: {
                select: {
                  full_name: true,
                },
              },
            },
          },
        },
      }),
    ]);

    const totalPages = Math.ceil(total / take);

    return {
      items,
      meta: {
        page: currentPage,
        limit: take,
        total,
        totalPages,
        hasNextPage: currentPage < totalPages,
        hasPrevPage: currentPage > 1,
      },
    };
  }

  /**
   * Mengambil detail rekaman jejak audit berdasarkan ID
   */
  static async findById(id) {
    if (!id) {
      throw new AppError('ID jejak audit wajib diberikan', 400);
    }

    const auditLog = await prisma.auditLog.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
            status: true,
            role: true,
            profile: {
              select: {
                full_name: true,
              },
            },
          },
        },
      },
    });

    if (!auditLog) {
      throw new AppError('Catatan jejak audit tidak ditemukan', 404);
    }

    return auditLog;
  }

  /**
   * Helper audit pembuatan akun pengguna baru (SRS Bab 35, FR-044)
   */
  static async logUserCreation({ adminId, newUser, ipAddress, userAgent }) {
    return this.record({
      userId: adminId,
      action: 'CREATE_USER',
      entity: 'users',
      entityId: newUser.id,
      newValues: {
        username: newUser.username,
        email: newUser.email,
        role: newUser.role,
        status: newUser.status,
      },
      ipAddress,
      userAgent,
    });
  }

  /**
   * Helper audit status akun pengguna (SRS Bab 35, FR-044)
   */
  static async logStatusChange({
    adminId,
    targetUserId,
    oldStatus,
    newStatus,
    reason = null,
    ipAddress,
    userAgent,
  }) {
    return this.record({
      userId: adminId,
      action: 'UPDATE_USER_STATUS',
      entity: 'users',
      entityId: targetUserId,
      oldValues: { status: oldStatus },
      newValues: { status: newStatus, reason },
      ipAddress,
      userAgent,
    });
  }

  /**
   * Helper audit pembaruan profil atau peran akun (SRS Bab 35, FR-044)
   */
  static async logUserUpdate({ adminId, targetUserId, oldValues, newValues, ipAddress, userAgent }) {
    return this.record({
      userId: adminId,
      action: 'UPDATE_USER',
      entity: 'users',
      entityId: targetUserId,
      oldValues,
      newValues,
      ipAddress,
      userAgent,
    });
  }

  /**
   * Helper audit reset kata sandi pengguna oleh Admin (SRS Bab 35, FR-044)
   */
  static async logPasswordReset({ adminId, targetUserId, targetUsername, ipAddress, userAgent }) {
    return this.record({
      userId: adminId,
      action: 'RESET_PASSWORD',
      entity: 'users',
      entityId: targetUserId,
      newValues: {
        reset_by_admin: true,
        target_username: targetUsername || null,
      },
      ipAddress,
      userAgent,
    });
  }

  /**
   * Helper audit mutasi pembukaan kelas perkuliahan (Fase 4, FR-047)
   */
  static async logClassMutation({
    userId,
    action,
    classId,
    oldValues = null,
    newValues = null,
    ipAddress,
    userAgent,
  }) {
    return this.record({
      userId,
      action,
      entity: 'classes',
      entityId: classId,
      oldValues,
      newValues,
      ipAddress,
      userAgent,
    });
  }

  /**
   * Helper audit aksi enrollment mahasiswa (Fase 5, FR-048, BR-002)
   */
  static async logEnrollmentMutation({
    userId,
    action,
    enrollmentId,
    studentId,
    classId,
    oldValues = null,
    newValues = null,
    ipAddress,
    userAgent,
  }) {
    return this.record({
      userId,
      action,
      entity: 'enrollments',
      entityId: enrollmentId,
      oldValues,
      newValues: {
        student_id: studentId,
        class_id: classId,
        ...(newValues || {}),
      },
      ipAddress,
      userAgent,
    });
  }

  /**
   * Helper audit mutasi master data umum
   */
  static async logMasterDataMutation({
    userId,
    action,
    entity,
    entityId,
    oldValues = null,
    newValues = null,
    ipAddress,
    userAgent,
  }) {
    return this.record({
      userId,
      action,
      entity,
      entityId,
      oldValues,
      newValues,
      ipAddress,
      userAgent,
    });
  }
}
