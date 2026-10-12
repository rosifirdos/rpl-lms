import prisma from '../config/prisma.js';
import { verifyAccessToken } from '../utils/token.js';
import { apiResponse } from '../utils/apiResponse.js';

/**
 * Middleware untuk memverifikasi JWT Access Token.
 *
 * Revised SPADA LMS: role disimpan langsung di field `user.role` (enum),
 * bukan di tabel relasi `user_roles → role → role_permissions`.
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
        message: `Akses ditolak: Akun Anda berstatus ${user.status}. Silakan hubungi administrator.`,
      });
    }

    // Revised: role langsung dari field enum, bukan dari tabel join
    req.user = {
      id: user.id,
      username: user.username,
      email: user.email,
      status: user.status,
      role: user.role,
    };

    return next();
  } catch (error) {
    return next(error);
  }
}
