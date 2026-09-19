import prisma from '../config/prisma.js';
import { verifyAccessToken } from '../utils/token.js';
import { apiResponse } from '../utils/apiResponse.js';

/**
 * Middleware untuk memverifikasi JWT Access Token
 */
export async function authenticateToken(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return apiResponse.error(res, {
        statusCode: 401,
        message: 'Akses ditolak: Token autentikasi tidak ditemukan atau format salah (Bearer token dibutuhkan)',
      });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return apiResponse.error(res, {
        statusCode: 401,
        message: 'Akses ditolak: Token autentikasi tidak valid',
      });
    }

    let decoded;
    try {
      decoded = verifyAccessToken(token);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return apiResponse.error(res, {
          statusCode: 401,
          message: 'Sesi kedaluwarsa: Access token telah berakhir. Silakan lakukan refresh token.',
        });
      }
      return apiResponse.error(res, {
        statusCode: 401,
        message: 'Akses ditolak: Token autentikasi tidak valid',
      });
    }

    const userId = decoded.userId || decoded.sub;
    if (!userId) {
      return apiResponse.error(res, {
        statusCode: 401,
        message: 'Payload token tidak valid',
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        user_roles: {
          include: {
            role: {
              include: {
                role_permissions: {
                  include: {
                    permission: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!user) {
      return apiResponse.error(res, {
        statusCode: 401,
        message: 'Pengguna tidak ditemukan atau akun telah dihapus',
      });
    }

    if (user.status !== 'ACTIVE') {
      return apiResponse.error(res, {
        statusCode: 403,
        message: `Akses ditolak: Akun Anda berstatus ${user.status}. Silakan hubungi administrator kampus.`,
      });
    }

    const roles = user.user_roles.map((ur) => ur.role.name);
    const permissionSet = new Set();
    user.user_roles.forEach((ur) => {
      ur.role.role_permissions.forEach((rp) => {
        if (rp.permission?.code) {
          permissionSet.add(rp.permission.code);
        }
      });
    });
    const permissions = Array.from(permissionSet);

    req.user = {
      id: user.id,
      username: user.username,
      email: user.email,
      status: user.status,
      roles,
      permissions,
    };

    return next();
  } catch (error) {
    return next(error);
  }
}
