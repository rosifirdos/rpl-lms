import { apiResponse } from '../utils/apiResponse.js';

/**
 * Middleware untuk membatasi endpoint berdasarkan satu atau lebih Role.
 * Pengguna diizinkan jika memiliki setidaknya salah satu role yang ditentukan.
 * @param  {...string|string[]} allowedRoles
 */
export function requireRole(...allowedRoles) {
  const flattenedRoles = allowedRoles.flat();

  return (req, res, next) => {
    if (!req.user) {
      return apiResponse.error(res, {
        statusCode: 401,
        message: 'Akses ditolak: Otentikasi diperlukan',
      });
    }

    const userRoles = req.user.roles || [];

    // Super Admin selalu memiliki izin bypass jika diinginkan
    if (userRoles.includes('SUPER_ADMIN')) {
      return next();
    }

    const hasAllowedRole = flattenedRoles.some((role) => userRoles.includes(role));
    if (!hasAllowedRole) {
      return apiResponse.error(res, {
        statusCode: 403,
        message: `Akses ditolak: Dibutuhkan salah satu role: [${flattenedRoles.join(', ')}]`,
      });
    }

    return next();
  };
}

/**
 * Middleware untuk membatasi endpoint berdasarkan Permission.
 * Pengguna diizinkan jika memiliki SEMUA permission yang dibutuhkan (atau Super Admin).
 * @param  {...string|string[]} requiredPermissions
 */
export function requirePermission(...requiredPermissions) {
  const flattenedPermissions = requiredPermissions.flat();

  return (req, res, next) => {
    if (!req.user) {
      return apiResponse.error(res, {
        statusCode: 401,
        message: 'Akses ditolak: Otentikasi diperlukan',
      });
    }

    const userRoles = req.user.roles || [];
    if (userRoles.includes('SUPER_ADMIN')) {
      return next();
    }

    const userPermissions = req.user.permissions || [];
    const hasAllPermissions = flattenedPermissions.every((perm) =>
      userPermissions.includes(perm)
    );

    if (!hasAllPermissions) {
      return apiResponse.error(res, {
        statusCode: 403,
        message: `Akses ditolak: Anda tidak memiliki permission yang diperlukan: [${flattenedPermissions.join(', ')}]`,
      });
    }

    return next();
  };
}

/**
 * Middleware untuk membatasi endpoint berdasarkan ANY Permission.
 * @param  {...string|string[]} permissions
 */
export function requireAnyPermission(...permissions) {
  const flattenedPermissions = permissions.flat();

  return (req, res, next) => {
    if (!req.user) {
      return apiResponse.error(res, {
        statusCode: 401,
        message: 'Akses ditolak: Otentikasi diperlukan',
      });
    }

    const userRoles = req.user.roles || [];
    if (userRoles.includes('SUPER_ADMIN')) {
      return next();
    }

    const userPermissions = req.user.permissions || [];
    const hasAnyPermission = flattenedPermissions.some((perm) =>
      userPermissions.includes(perm)
    );

    if (!hasAnyPermission) {
      return apiResponse.error(res, {
        statusCode: 403,
        message: `Akses ditolak: Dibutuhkan salah satu permission: [${flattenedPermissions.join(', ')}]`,
      });
    }

    return next();
  };
}
