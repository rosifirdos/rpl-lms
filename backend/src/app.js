import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { ENV } from './config/env.js';
import { apiResponse } from './utils/apiResponse.js';

const app = express();

// Middlewares
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

// Root API welcome
app.get('/api/v1', (req, res) => {
  return apiResponse.success(res, {
    message: 'Selamat datang di API Sistem Akademik Kampus Terintegrasi (Portal, SIA, SPADA, PMB)',
    data: {
      version: '1.0.0 (MVP 1)',
      status: 'active',
    },
  });
});

// 404 Handler
app.use((req, res) => {
  return apiResponse.error(res, {
    message: `Endpoint ${req.method} ${req.originalUrl} tidak ditemukan`,
    statusCode: 404,
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err);
  return apiResponse.error(res, {
    message: err.message || 'Terjadi kesalahan pada server internal',
    statusCode: err.statusCode || 500,
    errors: ENV.NODE_ENV === 'development' ? err.stack : undefined,
  });
});

export default app;