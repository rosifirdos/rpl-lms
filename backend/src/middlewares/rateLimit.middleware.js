import rateLimit from 'express-rate-limit';
import { apiResponse } from '../utils/apiResponse.js';

/**
 * Factory untuk membuat custom rate limiter dengan konfigurasi standar
 */
export function createRateLimiter(options = {}) {
  return rateLimit({
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res, next, opts) => {
      return apiResponse.error(res, {
        statusCode: 429,
        message: opts.message || 'Terlalu banyak permintaan dari IP Anda. Silakan coba lagi beberapa saat lagi.',
      });
    },
    ...options,
  });
}

/**
 * General Rate Limiter
 * Membatasi frekuensi request seluruh API untuk mencegah DoS dan abuse.
 * Optimized: 500 request/15 menit untuk UX yang lebih baik tanpa mengorbankan security.
 * Benchmark: ~33 request/menit atau ~1 request/2 detik secara berkelanjutan.
 */
export const generalLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 menit
  max: 500, // Maksimal 500 request per 15 menit (optimized dari 300)
  message: 'Terlalu banyak permintaan dari IP Anda. Silakan coba lagi beberapa saat lagi.',
  skip: (req) => process.env.NODE_ENV === 'test' && !req.headers['x-enforce-rate-limit'],
});

/**
 * Auth Rate Limiter
 * Pembatasan ketat untuk endpoint autentikasi (SRS Bab 35)
 * Mencegah serangan brute force pada kredensial login pengguna.
 * Optimized: 20 percobaan/15 menit untuk UX yang lebih baik dengan tetap aman.
 * Memungkinkan 2-3 kali typo per sesi login tanpa lockout berlebihan.
 */
export const authLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 menit
  max: 20, // Maksimal 20 percobaan per 15 menit (optimized dari 10)
  message: 'Terlalu banyak percobaan autentikasi. Untuk keamanan, akun Anda distegankan selama 15 menit.',
  skip: (req) => process.env.NODE_ENV === 'test' && !req.headers['x-enforce-rate-limit'],
  keyGenerator: (req) => {
    // Gunakan kombinasi IP + identifier untuk mencegah satu IP membatasi banyak user
    const identifier = req.body?.identifier || 'anonymous';
    return `${req.ip}-${identifier}`;
  },
});

/**
 * Admin Operations Rate Limiter
 * Pembatasan untuk operasi admin yang sensitif (create/update/delete users, reset password)
 * Lebih ketat dari general limiter untuk mencegah abuse dari akun yang dikompromi.
 * Optimized: 100 operasi/15 menit untuk workflow admin yang efisien.
 */
export const adminOperationsLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 menit
  max: 100, // Maksimal 100 operasi admin per 15 menit
  message: 'Terlalu banyak operasi administratif. Silakan tunggu beberapa saat sebelum melanjutkan.',
  skip: (req) => process.env.NODE_ENV === 'test' && !req.headers['x-enforce-rate-limit'],
});

/**
 * Audit Log Rate Limiter
 * Pembatasan khusus untuk query audit log (data sensitif, resource intensive)
 * Optimized: 50 query/15 menit untuk monitoring yang efektif tanpa overload.
 */
export const auditLogLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 menit
  max: 50, // Maksimal 50 query audit log per 15 menit
  message: 'Terlalu banyak permintaan log audit. Batasan untuk melindungi performa sistem.',
  skip: (req) => process.env.NODE_ENV === 'test' && !req.headers['x-enforce-rate-limit'],
});

/**
 * Public API Rate Limiter
 * Untuk endpoint publik yang tidak memerlukan autentikasi (health check, public info)
 * Lebih longgar untuk mendukung integrator third-party.
 */
export const publicApiLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 menit
  max: 1000, // Maksimal 1000 request per 15 menit untuk public endpoints
  message: 'Terlalu banyak permintaan ke endpoint publik. Silakan coba lagi nanti.',
  skip: (req) => process.env.NODE_ENV === 'test' && !req.headers['x-enforce-rate-limit'],
});