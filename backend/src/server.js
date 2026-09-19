import app from './app.js';
import { ENV } from './config/env.js';
import prisma from './config/prisma.js';

async function startServer() {
  try {
    // Verifikasi koneksi database
    await prisma.$connect();
    console.log('✅ Terhubung ke database PostgreSQL.');

    app.listen(ENV.PORT, () => {
      console.log(`🚀 Server berjalan di http://localhost:${ENV.PORT}`);
      console.log(`📡 Health Check: http://localhost:${ENV.PORT}/health`);
    });
  } catch (error) {
    console.error('❌ Gagal memulai server:', error);
    process.exit(1);
  }
}

startServer();