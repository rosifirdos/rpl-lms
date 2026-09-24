import prisma from '../../config/prisma.js';
import { AppError } from '../../utils/errors.js';
import { AuditLogService } from '../audit-log/audit-log.service.js';

/**
 * Layanan Manajemen Hak Akses / Permissions (IPM 4.6 & SRS Bab 3 & Bab 31)
 */
export class PermissionsService {
  /**
   * Mengambil daftar seluruh permission sistem
   */
  static async getPermissions({ search } = {}) {
    const where = {};
    if (search) {
      where.OR = [
        { code: { contains: search, mode: 'insensitive' } },
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const permissions = await prisma.permission.findMany({
      where,
      orderBy: { code: 'asc' },
      include: {
        _count: {
          select: { role_permissions: true },
        },
      },
    });

    return permissions.map((p) => ({
      id: p.id,
      code: p.code,
      name: p.name,
      description: p.description,
      createdAt: p.created_at,
      assignedRolesCount: p._count.role_permissions,
    }));
  }

  /**
   * Mengambil detail permission berdasarkan ID
   */
  static async getPermissionById(id) {
    const permission = await prisma.permission.findUnique({
      where: { id },
      include: {
        role_permissions: {
          include: {
            role: { select: { id: true, name: true, description: true } },
          },
        },
      },
    });

    if (!permission) {
      throw new AppError('Permission tidak ditemukan', 404);
    }

    return {
      id: permission.id,
      code: permission.code,
      name: permission.name,
      description: permission.description,
      createdAt: permission.created_at,
      roles: permission.role_permissions.map((rp) => rp.role),
    };
  }

  /**
   * Membuat permission baru di sistem (Super Admin)
   */
  static async createPermission({ adminId, permissionData, ipAddress, userAgent }) {
    const { code, name, description } = permissionData;

    const existing = await prisma.permission.findUnique({
      where: { code },
    });
    if (existing) {
      throw new AppError(`Permission dengan kode '${code}' sudah ada`, 409);
    }

    const permission = await prisma.permission.create({
      data: {
        code,
        name,
        description: description || null,
      },
    });

    await AuditLogService.record({
      userId: adminId,
      action: 'CREATE_PERMISSION',
      entity: 'permissions',
      entityId: permission.id,
      newValues: { code, name, description },
      ipAddress,
      userAgent,
    });

    return permission;
  }
}
