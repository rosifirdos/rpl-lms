import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { ENV } from './config/env.js';
import { apiResponse } from './utils/apiResponse.js';
import authRoutes from './modules/auth/auth.routes.js';
import profileRoutes from './modules/profile/profile.routes.js';
import { errorHandler } from './middlewares/error.middleware.js';

const app = express();

// Keamanan HTTP Headers & CORS
app.use(helmet());
app.use(cors({ origin: ENV.CORS_ORIGIN, credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

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
      },
    },
  });
});

// Modul MVP 1 (Fase 2: Auth, RBAC & Profile)
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/profile', profileRoutes);

// Endpoint Konseptual Alias (SRS Bab 32 - Tabel 16)
// Memetakan /api/login, /api/logout, /api/profile langsung ke handler auth & profile
app.use('/api', (req, res, next) => {
  if (req.path === '/login') {
    req.url = '/login';
    return authRoutes(req, res, next);
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
