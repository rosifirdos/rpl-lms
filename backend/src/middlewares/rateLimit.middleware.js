import rateLimit from 'express-rate-limit';
import { apiResponse } from '../utils/apiResponse.js';


/**
 * General Rate Limiter
 * Membatasi frekuensi request seluruh API untuk mencegah DoS dan abuse.
 */
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 menit
  max: 300, // Maksimal 300 request per 15 menit
  message: 'Terlalu banyak permintaan dari IP Anda. Silakan coba lagi beberapa saat lagi.',
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => process.env.NODE_ENV === 'test',
  handler: (req, res, next, options) => {
    return apiResponse.error(res, {
      statusCode: 429,
      message: options.message,
    });
  },
});

/**
 * Auth Rate Limiter
 * Pembatasan ketat untuk endpoint autentikasi (SRS Chapter 35)
 * Mencegah seringan brute force pada kredensial login pengguna.
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 menit
  max: 10, // Maksimal 10 percobaan per 15 menit
  message: 'Terlalu banyak percobaan autentikasi. Untuk keamanan, akun Anda distegankan selama 15 menit.',
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => process.env.NODE_ENV === 'test',
  handler: (req, res, next, options) => {
    return apiResponse.error(res, {
      statusCode: 429,
      message: options.message,
    });
  },
});
