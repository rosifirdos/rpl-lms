import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { ENV } from './config/env.js';
import { apiResponse } from './utils/apiResponse.js';
import { AppError } from './utils/errors.js';
import authRoutes from './modules/auth/auth.routes.js';
import profileRoutes from './modules/profile/profile.routes.js';
import auditLogRoutes from './modules/audit-log/audit-log.routes.js';
import usersRoutes from './modules/users/users.routes.js';
import coursesRoutes from './modules/courses/courses.routes.js';
import classesRoutes from './modules/classes/classes.routes.js';
import { errorHandler } from './middlewares/error.middleware.js';
import { attachAuditHelper } from './middlewares/audit.middleware.js';
import { generalLimiter, authLimiter, publicApiLimiter } from './middlewares/rateLimit.middleware.js';

const app = express();

// Keamanan HTTP Headers (Helmet yang disesuaikan untuk API)
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

// Keamanan CORS Terproteksi (SRS Bab 35)
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || ENV.CORS_ORIGIN.includes(origin) || ENV.CORS_ORIGIN.includes('*')) {
        return callback(null, true);
      }
      return callback(new AppError('Akses diblokir oleh kebijakan CORS', 403));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-Enforce-Rate-Limit'],
  })
);

// Pembatasan Frekuensi Global (General Rate Limiting)
app.use(generalLimiter);

// Middleware Body Parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Middleware Interceptor Jejak Audit Klien (SRS Bab 35)
app.use(attachAuditHelper);

if (ENV.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Health check endpoint
app.get('/health', (req, res) => {
  return apiResponse.success(res, {
    message: 'SPADA LMS Backend API is operational',
    data: {
      timestamp: new Date().toISOString(),
      env: ENV.NODE_ENV,
    },
  });
});

// Root API welcome (flat /api per SRS Bab 21)
app.get('/api', (req, res) => {
  return apiResponse.success(res, {
    message: 'Selamat datang di API SPADA LMS — Universitas PGRI Semarang',
    data: {
      version: '1.0.0 (MVP 1)',
      status: 'active',
      endpoints: {
        auth: '/api/auth',
        profile: '/api/profile',
        admin_users: '/api/admin/users',
        admin_courses: '/api/admin/courses',
        admin_classes: '/api/admin/classes',
        admin_audit_logs: '/api/admin/audit-logs',
      },
    },
  });
});

// Proteksi Frekuensi Percobaan Autentikasi (Brute-force protection)
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/forgot-password', authLimiter);

// Health Check Endpoint (public, rate limited lebih longgar)
app.get('/health', publicApiLimiter, (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'SPADA LMS Backend API',
    version: '1.0.0',
  });
});

// === Modul Inti SPADA LMS (flat /api paths per SRS Bab 21) ===
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/admin/users', usersRoutes);
app.use('/api/admin/courses', coursesRoutes);
app.use('/api/admin/classes', classesRoutes);
app.use('/api/admin/audit-logs', auditLogRoutes);
app.use('/api/audit-logs', auditLogRoutes); // Alias kemudahan akses

// 404 Handler untuk rute tak terdefinisi
app.use((req, res) => {
  return apiResponse.error(res, {
    statusCode: 404,
    message: `Endpoint ${req.method} ${req.originalUrl} tidak ditemukan`,
  });
});

// Global Error Handler Terpusat
app.use(errorHandler);

export default app;
