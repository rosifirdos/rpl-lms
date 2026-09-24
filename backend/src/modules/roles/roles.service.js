import prisma from '../../config/prisma.js';
import { AppError } from '../../utils/errors.js';
import { AuditLogService } from '../audit-log/audit-log.service.js';

/**
 * Layanan Manajemen Role Sistem (IPM 4.6 & SRS Bab 3 & Bab 31)
 */
export class RolesService {
  /**
   * Resolver permission: menerima array identifier (boleh berisi code ATAU id
   * UUID, boleh duplikat/campuran) dan mengembalikan daftar permission yang
   * unik & lengkap beserta mappingnya. Melempar AppError bila ada identifier
   * yang tidak cocok ke permission manapun (validasi eksplisit per elemen
   * menggantikan perbandingan panjang array yang rapuh terhadap duplikat).
   */
  static async resolvePermissions(identifiers) {
    const input = Array.from(new Set((identifiers ?? []).map((s) => String(s).trim()))).filter(
      (s) => s.length > 0
    );
    if (input.length === 0) return [];

    const records = await prisma.permission.findMany({
      where: {
        OR: [{ code: { in: input } }, { id: { in: input } }],
      },
    });

    // Bangun map code->record dan id->record, lalu validasi tiap input.
    const byCode = new Map(records.map((r) => [r.code, r]));
    const byId = new Map(records.map((r) => [r.id, r]));
    const resolved = new Map();
    const missing = [];
    for (const ident of input) {
      const rec = byCode.get(ident) ?? byId.get(ident);
      if (rec) {
        resolved.set(rec.id, rec); // dedup lagi berdasarkan id permission
      } else {
        missing.push(ident);
      }
    }
    if (missing.length > 0) {
      throw new AppError(
        `Permission tidak ditemukan di sistem: [${missing.join(', ')}]`,
        400
      );
    }
    return Array.from(resolved.values());
  }

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

    // Resolver terpusat: dedup + validasi eksplisit per elemen (code ATAU id)
    const permissionRecords = await this.resolvePermissions(permissions);

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

    // Resolver terpusat: dedup + validasi eksplisit per elemen (code ATAU id)
    const permissionRecords = await this.resolvePermissions(permissions);

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
