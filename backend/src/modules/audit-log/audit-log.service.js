import prisma from '../../config/prisma.js';
import { AppError } from '../../utils/errors.js';

/**
 * Layanan terpusat Audit Trail (SRS Bab 15 & Bab 35)
 * Mendukung pencatatan mutasi asinkron non-blocking agar tidak memperlambat latensi API.
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
    isAsync = true,
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
    sortBy = 'waktu',
    sortOrder = 'desc',
  } = {}) {
    const currentPage = Math.max(1, parseInt(page, 10) || 1);
    const take = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
    const skip = (currentPage - 1) * take;

    const where = {};

    if (action) {
      where.action = { equals: action.toUpperCase() };
    }

    if (entity) {
      where.entity = { equals: entity.toLowerCase() };
    }

    if (userId) {
      where.user_id = { equals: userId };
    }

    if (startDate || endDate) {
      where.waktu = {};
      if (startDate) {
        where.waktu.gte = new Date(startDate);
      }
      if (endDate) {
        where.waktu.lte = new Date(endDate);
      }
    }

    if (search) {
      where.OR = [
        { action: { contains: search, mode: 'insensitive' } },
        { entity: { contains: search, mode: 'insensitive' } },
        { entity_id: { contains: search, mode: 'insensitive' } },
      ];
    }

    const validSortFields = ['waktu', 'action', 'entity'];
    const resolvedSortBy = validSortFields.includes(sortBy) ? sortBy : 'waktu';
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
            user_roles: {
              include: {
                role: {
                  select: { id: true, name: true, description: true },
                },
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
   * Helper audit mutasi Role pengguna
   */
  static async logRoleChange({
    adminId,
    targetUserId,
    oldRoles,
    newRoles,
    ipAddress,
    userAgent,
  }) {
    return this.record({
      userId: adminId,
      action: 'UPDATE_USER_ROLES',
      entity: 'user_roles',
      entityId: targetUserId,
      oldValues: { roles: oldRoles },
      newValues: { roles: newRoles },
      ipAddress,
      userAgent,
    });
  }

  /**
   * Helper audit status akun
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
   * Helper audit master data
   */
  static async logMasterDataMutation({
    userId,
    action,
    entity,
    entityId,
    oldValues,
    newValues,
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
