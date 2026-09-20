import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { ENV } from './config/env.js';
import { apiResponse } from './utils/apiResponse.js';
import authRoutes from './modules/auth/auth.routes.js';
import profileRoutes from './modules/profile/profile.routes.js';
import auditLogRoutes from './modules/audit-log/audit-log.routes.js';
import usersRoutes from './modules/users/users.routes.js';
import { errorHandler } from './middlewares/error.middleware.js';
import { attachAuditHelper } from './middlewares/audit.middleware.js';
import { generalLimiter, authLimiter } from './middlewares/rateLimit.middleware.js';

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
      return callback(new Error('Akses diblokir oleh kebijakan CORS kampus'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  })
);

// Pembatasan Frekuensi Global (General Rate Limiting - Fase 3)
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
    message: 'RPL-LMS Backend API is operational',
    data: {
      timestamp: new Date().toISOString(),
      env: ENV.NODE_ENV,
    },
  });
});

// Root API v1 welcome
app.get('/api/v1', (req, res) => {
  return apiResponse.success(res, {
    message: 'Selamat datang di API Sistem Akademik Kampus Terintegrasi (Portal, SIA, SPADA, PMB)',
    data: {
      version: '1.0.0 (MVP 1)',
      status: 'active',
      endpoints: {
        auth: '/api/v1/auth',
        profile: '/api/v1/profile',
        auditLogs: '/api/v1/audit-logs',
        users: '/api/v1/users',
      },
    },
  });
});

// Proteksi Frekuensi Percobaan Autentikasi (Brute-force protection - SRS Chapter 35)
app.use('/api/v1/auth/login', authLimiter);
app.use('/api/v1/auth/forgot-password', authLimiter);

// Modul MVP 1 (Fase 2 & Fase 3)
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/profile', profileRoutes);
app.use('/api/v1/audit-logs', auditLogRoutes);
app.use('/api/v1/users', usersRoutes);

// Endpoint Konseptual Alias (SRS Bab 32 - Tabel 16)
// Memetakan /api/login, /api/logout, /api/profile langsung ke handler auth & profile
app.use('/api', (req, res, next) => {
  if (req.path === '/login') {
    return authLimiter(req, res, () => {
      req.url = '/login';
      return authRoutes(req, res, next);
    });
  }
  if (req.path === '/logout') {
    req.url = '/logout';
    return authRoutes(req, res, next);
  }
  if (req.path === '/profile') {
    req.url = '/';
    return profileRoutes(req, res, next);
  }
  next();
});

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
