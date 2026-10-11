import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const ENV = {
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  DATABASE_URL: process.env.DATABASE_URL,
  JWT: {
    ACCESS_SECRET: process.env.JWT_ACCESS_SECRET || 'default-access-secret-minimum-32-chars-long',
    ACCESS_EXPIRES_IN: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
    REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'default-refresh-secret-minimum-32-chars-long',
    REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },
  CORS_ORIGIN: (process.env.CORS_ORIGIN || 'http://localhost:3000,http://localhost:5173').split(','),
};

/**
 * Konfigurasi penyimpanan berkas terproteksi (BR-009, NFR-005)
 */
export const STORAGE = {
  // Root direktori privat — DI LUAR public web root
  UPLOAD_DIR: path.resolve(__dirname, '../../storage/private'),
  AVATAR_DIR: path.resolve(__dirname, '../../storage/private/avatars'),
  BASE_URL: path.resolve(__dirname, '../../storage'),

  // Kebijakan avatar (FR-007)
  AVATAR_MAX_SIZE: 2 * 1024 * 1024, // 2MB
  AVATAR_ALLOWED_MIMES: ['image/jpeg', 'image/png'],
  AVATAR_ALLOWED_EXTENSIONS: ['.jpg', '.jpeg', '.png'],

  // Kebijakan dokumen umum (BR-007)
  DOC_MAX_SIZE: 10 * 1024 * 1024, // 10MB
  DOC_ALLOWED_EXTENSIONS: ['.pdf', '.docx', '.xlsx', '.zip'],
};
