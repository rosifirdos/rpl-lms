import prisma from '../../config/prisma.js';
import { AppError } from '../../utils/errors.js';
import { AuditLogService } from '../audit-log/audit-log.service.js';

/**
 * Layanan Manajemen Role Sistem (IPM 4.6 & SRS Bab 3 & Bab 31)
 */
export class RolesService {
  /**
   * Mengambil daftar seluruh role sistem beserta permissions dan jumlah user
   */
  static async getRoles({ search } = {}) {
    const where = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const roles = await prisma.role.findMany({
      where,
      orderBy: { created_at: 'asc' },
      include: {
        role_permissions: {
          include: {
            permission: {
              select: { id: true, code: true, name: true, description: true },
            },
          },
        },
        _count: {
          select: { user_roles: true },
        },
      },
    });

    return roles.map((r) => ({
      id: r.id,
      name: r.name,
      description: r.description,
      createdAt: r.created_at,
      userCount: r._count.user_roles,
      permissions: r.role_permissions.map((rp) => rp.permission.code),
      rolePermissions: r.role_permissions.map((rp) => rp.permission),
    }));
  }

  /**
   * Mengambil detail role berdasarkan ID
   */
  static async getRoleById(id) {
    const role = await prisma.role.findUnique({
      where: { id },
      include: {
        role_permissions: {
          include: {
            permission: {
              select: { id: true, code: true, name: true, description: true },
            },
          },
        },
        _count: {
          select: { user_roles: true },
        },
      },
    });

    if (!role) {
      throw new AppError('Role tidak ditemukan', 404);
    }

    return {
      id: role.id,
      name: role.name,
      description: role.description,
      createdAt: role.created_at,
      userCount: role._count.user_roles,
      permissions: role.role_permissions.map((rp) => rp.permission.code),
      rolePermissions: role.role_permissions.map((rp) => rp.permission),
    };
  }

  /**
   * Membuat role baru di sistem (Super Admin)
   */
  static async createRole({ adminId, roleData, ipAddress, userAgent }) {
    const { name, description, permissions = [] } = roleData;

    const existing = await prisma.role.findUnique({
      where: { name },
    });
    if (existing) {
      throw new AppError(`Role dengan nama '${name}' sudah ada`, 409);
    }

    let permissionRecords = [];
    if (permissions && permissions.length > 0) {
      permissionRecords = await prisma.permission.findMany({
        where: {
          OR: [{ code: { in: permissions } }, { id: { in: permissions } }],
        },
      });

      if (permissionRecords.length !== permissions.length) {
        throw new AppError('Satu atau lebih permission tidak ditemukan di sistem', 400);
      }
    }

    const createdRole = await prisma.$transaction(async (tx) => {
      const role = await tx.role.create({
        data: {
          name,
          description: description || null,
        },
      });

      if (permissionRecords.length > 0) {
        await tx.rolePermission.createMany({
          data: permissionRecords.map((perm) => ({
            role_id: role.id,
            permission_id: perm.id,
          })),
        });
      }

      return role;
    });

    await AuditLogService.record({
      userId: adminId,
      action: 'CREATE_ROLE',
      entity: 'roles',
      entityId: createdRole.id,
      newValues: {
        name,
        description,
        permissions: permissionRecords.map((p) => p.code),
      },
      ipAddress,
      userAgent,
    });

    return this.getRoleById(createdRole.id);
  }

  /**
   * Memperbarui daftar hak akses (permissions) untuk suatu role
   */
  static async updateRolePermissions({ adminId, roleId, permissions, ipAddress, userAgent }) {
    const role = await prisma.role.findUnique({
      where: { id: roleId },
      include: {
        role_permissions: {
          include: { permission: true },
        },
      },
    });

    if (!role) {
      throw new AppError('Role tidak ditemukan', 404);
    }

    const oldPermissions = role.role_permissions.map((rp) => rp.permission.code);

    let permissionRecords = [];
    if (permissions && permissions.length > 0) {
      permissionRecords = await prisma.permission.findMany({
        where: {
          OR: [{ code: { in: permissions } }, { id: { in: permissions } }],
        },
      });

      if (permissionRecords.length !== permissions.length) {
        throw new AppError('Satu atau lebih permission tidak ditemukan di sistem', 400);
      }
    }

    await prisma.$transaction(async (tx) => {
      await tx.rolePermission.deleteMany({
        where: { role_id: roleId },
      });

      if (permissionRecords.length > 0) {
        await tx.rolePermission.createMany({
          data: permissionRecords.map((perm) => ({
            role_id: roleId,
            permission_id: perm.id,
          })),
        });
      }
    });

    await AuditLogService.record({
      userId: adminId,
      action: 'UPDATE_ROLE_PERMISSIONS',
      entity: 'role_permissions',
      entityId: roleId,
      oldValues: { permissions: oldPermissions },
      newValues: { permissions: permissionRecords.map((p) => p.code) },
      ipAddress,
      userAgent,
    });

    return this.getRoleById(roleId);
  }
}
