import { PrismaClient } from '@prisma/client';
import { pathToFileURL } from 'node:url';

/**
 * Housekeeping token reset kata sandi (R-14).
 *
 * Menghapus baris `password_reset_tokens` yang:
 *   - sudah terpakai (`used_at != null`), atau
 *   - kedaluwarsa lebih lama dari `RETENTION_DAYS` hari.
 *
 * Skrip ini dijalankan berkala (cron/automation) di luar request path —
 * lihat README bagian operasional. Idempoten: menjalankannya ulang pada
 * database yang sama mengembalikan 0 baris terhapus.
 */

const prisma = new PrismaClient();

/** Token kedaluwarsa dipertahankan selama 7 hari sebelum dihapus. */
const RETENTION_DAYS = 7;

/**
 * Hapus token reset yang sudah terpakai atau kedaluwarsa lebih lama dari
 * `RETENTION_DAYS` hari.
 *
 * @param {object} [client] klien Prisma (default: klien skrip ini)
 * @param {Date} [now] waktu acuan (untuk pengujian)
 * @returns {Promise<number>} jumlah baris yang terhapus
 */
export async function prunePasswordResetTokens(client = prisma, now = new Date()) {
  const retentionCutoff = new Date(now.getTime() - RETENTION_DAYS * 24 * 60 * 60 * 1000);

  const result = await client.passwordResetToken.deleteMany({
    where: {
      OR: [{ used_at: { not: null } }, { expires_at: { lt: retentionCutoff } }],
    },
  });

  return result.count;
}

async function main() {
  const deleted = await prunePasswordResetTokens();
  console.log(`Prune token reset kata sandi selesai: ${deleted} baris dihapus.`);
}

// Jalankan langsung hanya bila dieksekusi sebagai skrip, bukan saat diimpor
// oleh pengujian.
const isDirectInvocation =
  process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;

if (isDirectInvocation) {
  main()
    .catch((error) => {
      console.error('Prune token reset gagal:', error);
      process.exitCode = 1;
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
