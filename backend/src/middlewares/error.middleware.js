import { ZodError } from 'zod';
import { AppError } from '../utils/errors.js';
import { apiResponse } from '../utils/apiResponse.js';
import { ENV } from '../config/env.js';

export function errorHandler(err, req, res, next) {
  // AppError (kesalahan operasional aplikasi yang diketahui)
  if (err instanceof AppError) {
    return apiResponse.error(res, {
      statusCode: err.statusCode,
      message: err.message,
      errors: err.errors,
    });
  }

  // Zod Validation Error
  if (err instanceof ZodError) {
    const formattedErrors = err.errors.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    }));
    return apiResponse.error(res, {
      statusCode: 400,
      message: 'Validasi data gagal',
      errors: formattedErrors,
    });
  }

  // JWT Errors
  if (err.name === 'JsonWebTokenError') {
    return apiResponse.error(res, {
      statusCode: 401,
      message: 'Token otentikasi tidak valid',
    });
  }

  if (err.name === 'TokenExpiredError') {
    return apiResponse.error(res, {
      statusCode: 401,
      message: 'Token otentikasi telah kedaluwarsa',
    });
  }

  // Prisma Client Errors
  if (err.code === 'P2002') {
    const target = Array.isArray(err.meta?.target) ? err.meta.target.join(', ') : err.meta?.target || 'field';
    return apiResponse.error(res, {
      statusCode: 409,
      message: `Konflik data: Nilai pada ${target} sudah terdaftar dalam sistem`,
    });
  }

  if (err.code === 'P2003') {
    return apiResponse.error(res, {
      statusCode: 409,
      message: 'Gagal memproses relasi data: Referensi entitas tidak valid atau data masih digunakan oleh entitas lain',
    });
  }

  if (err.code === 'P2025') {
    return apiResponse.error(res, {
      statusCode: 404,
      message: 'Data yang diminta tidak ditemukan di database',
    });
  }

  // Kesalahan Server Tak Terduga
  console.error('[Unhandled Error]:', err);
  return apiResponse.error(res, {
    statusCode: 500,
    message: 'Terjadi kesalahan pada server internal',
    errors: ENV.NODE_ENV === 'development' ? err.stack : undefined,
  });
}
