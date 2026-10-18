import rateLimit from 'express-rate-limit';
import { apiResponse } from '../utils/apiResponse.js';

/**
 * Factory untuk membuat custom rate limiter
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
 */
export const generalLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 menit
  max: 300, // Maksimal 300 request per 15 menit
  message: 'Terlalu banyak permintaan dari IP Anda. Silakan coba lagi beberapa saat lagi.',
  skip: (req) => process.env.NODE_ENV === 'test' && !req.headers['x-enforce-rate-limit'],
});

/**
 * Auth Rate Limiter
 * Pembatasan ketat untuk endpoint autentikasi (SRS Bab 35)
 * Mencegah serangan brute force pada kredensial login pengguna.
 */
export const authLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 menit
  max: 10, // Maksimal 10 percobaan per 15 menit
  message: 'Terlalu banyak percobaan autentikasi. Untuk keamanan, akun Anda distegankan selama 15 menit.',
  skip: (req) => process.env.NODE_ENV === 'test' && !req.headers['x-enforce-rate-limit'],
});
