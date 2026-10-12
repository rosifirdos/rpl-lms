import { apiResponse } from '../utils/apiResponse.js';

/**
 * Middleware untuk membatasi endpoint berdasarkan satu atau lebih Role.
 *
 * Revised SPADA LMS: role adalah enum tunggal pada `req.user.role` (bukan array).
 * Tidak ada SUPER_ADMIN bypass — hanya 3 role: ADMIN, DOSEN, MAHASISWA.
 *
 * @param  {...string} allowedRoles  Daftar role yang diizinkan
 */
export function requireRole(...allowedRoles) {
  const flattenedRoles = allowedRoles.flat().map((r) => String(r).toLowerCase());

  return (req, res, next) => {
    if (!req.user) {
      return apiResponse.error(res, {
        statusCode: 401,
        message: 'Akses ditolak: Otentikasi diperlukan',
      });
    }

    const userRole = String(req.user.role || '').toLowerCase();

    if (!flattenedRoles.includes(userRole)) {
      return apiResponse.error(res, {
        statusCode: 403,
        message: `Akses ditolak: Dibutuhkan salah satu role: [${flattenedRoles.join(', ')}]`,
      });
    }

    return next();
  };
}
