/**
 * Global test bootstrap — dijalankan via `--import ./tests/setup.js`
 * sebelum seluruh berkas uji dimuat (lihat script "test" pada package.json).
 *
 * Tujuan (DoD B4 — Database Test Isolation):
 *   1. Memaksa seluruh suite pengujian terhubung ke database NON-OPERASIONAL
 *      (`rpl_review`), bukan ke database operasional (`rpl_lms`).
 *   2. Menghentikan proses dengan galat keras bila konfigurasi database tidak
 *      tersedia atau bila hasil resolusi tetap menunjuk ke database operasional
 *      — supaya suite tidak pernah menulis/menghapus data yang dipakai aplikasi.
 *
 * Nilai `DATABASE_URL` diturunkan dari konfigurasi yang ada (mengganti nama
 * database-nya), sehingga kredensial/host/port tetap mengikuti `.env`
 * pengembang tanpa perlu menyalin rahasia ke dalam repositori.
 */
import 'dotenv/config';

process.env.NODE_ENV = 'test';

/** Nama database khusus pengujian yang tidak dipakai oleh aplikasi berjalan. */
const TEST_DATABASE_NAME = 'rpl_review';

/** Nama database operasional yang HARUS ditolak oleh guard di bawah. */
const OPERATIONAL_DATABASE_NAMES = ['rpl_lms'];

/**
 * Mengganti nama database pada sebuah connection string PostgreSQL tanpa
 * menyentuh kredensial, host, port, maupun query parameter (mis. `?schema=public`).
 *
 * @param {string} connectionString contoh: postgresql://user:pass@localhost:5432/rpl_lms?schema=public
 * @param {string} databaseName nama database tujuan
 * @returns {string} connection string dengan nama database yang sudah diganti
 */
function withDatabaseName(connectionString, databaseName) {
  const parsed = new URL(connectionString);
  parsed.pathname = `/${databaseName}`;
  return parsed.toString();
}

/**
 * Mengambil nama database dari sebuah connection string PostgreSQL.
 *
 * @param {string} connectionString
 * @returns {string} nama database tanpa leading slash
 */
function databaseNameOf(connectionString) {
  return new URL(connectionString).pathname.replace(/^\//, '');
}

// Prioritas: DATABASE_URL_TEST (eksplisit) > DATABASE_URL (diturunkan).
const configuredUrl = process.env.DATABASE_URL_TEST || process.env.DATABASE_URL;

if (!configuredUrl) {
  throw new Error(
    '[tests/setup.js] DATABASE_URL tidak terdefinisi. ' +
      'Salin backend/.env.example menjadi backend/.env sebelum menjalankan pengujian, ' +
      `atau set DATABASE_URL_TEST ke database terisolasi "${TEST_DATABASE_NAME}".`
  );
}

const configuredDatabase = databaseNameOf(configuredUrl);

if (OPERATIONAL_DATABASE_NAMES.includes(configuredDatabase)) {
  // Amankan pengembang: database operasional otomatis dialihkan ke database uji.
  process.env.DATABASE_URL = withDatabaseName(configuredUrl, TEST_DATABASE_NAME);
  console.info(
    `[tests/setup.js] DATABASE_URL menunjuk database operasional "${configuredDatabase}"; ` +
      `dialihkan ke database uji "${TEST_DATABASE_NAME}".`
  );
} else if (configuredDatabase !== TEST_DATABASE_NAME) {
  // Konfigurasi non-standar (mis. developer memakai database uji sendiri):
  // hormati pilihannya, tetapi tetap catat agar jejaknya jelas di log pengujian.
  process.env.DATABASE_URL = configuredUrl;
  console.info(
    `[tests/setup.js] Menggunakan database uji non-standar: "${configuredDatabase}" ` +
      `(disarankan "${TEST_DATABASE_NAME}").`
  );
} else {
  process.env.DATABASE_URL = configuredUrl;
}

const resolvedDatabase = databaseNameOf(process.env.DATABASE_URL);

// Guard terakhir: apa pun yang terjadi di atas, database operasional tidak boleh lolos.
if (OPERATIONAL_DATABASE_NAMES.includes(resolvedDatabase)) {
  throw new Error(
    `[tests/setup.js] PENOLAKAN: pengujian tidak boleh berjalan pada database operasional ` +
      `"${resolvedDatabase}". Gunakan database terisolasi "${TEST_DATABASE_NAME}".`
  );
}

process.env.TEST_DATABASE_NAME = resolvedDatabase;

export const TEST_DB = {
  name: resolvedDatabase,
  operational: OPERATIONAL_DATABASE_NAMES,
};

/**
 * Prefix nama kelas yang dibuat oleh suite pengujian
 * (mis. `TEST-KUOTA-…`, `TEST-MAIN-…`, `KAP-…`).
 *
 * Dipakai sebagai jaring pengaman: bila sebuah suite gagal di tengah jalan
 * sebelum blok `finally`/`after()`-nya sempat berjalan, sisa data uji tetap
 * dapat dibersihkan pada run berikutnya.
 */
export const TEST_CLASS_PREFIXES = ['TEST-', 'KAP-'];

/**
 * Menghapus sisa data uji pada database terisolasi.
 *
 * Hanya menyentuh kelas yang namanya berawalan salah satu `TEST_CLASS_PREFIXES`
 * — data seed nyata tidak pernah ikut terhapus. Kepesertaan (enrollment)
 * ikut terhapus otomatis melalui `onDelete: Cascade`.
 *
 * @param {import('@prisma/client').PrismaClient} prismaClient klien Prisma aktif
 * @returns {Promise<{classes: number, enrollments: number}>} jumlah baris terhapus
 */
export async function cleanupTestArtifacts(prismaClient) {
  // Guard ganda: jangan pernah menyapu data pada database operasional.
  if (OPERATIONAL_DATABASE_NAMES.includes(resolvedDatabase)) {
    throw new Error(
      `[tests/setup.js] PENOLAKAN: pembersihan data uji tidak boleh dijalankan pada database operasional "${resolvedDatabase}".`
    );
  }

  const staleClasses = await prismaClient.class.findMany({
    where: { OR: TEST_CLASS_PREFIXES.map((prefix) => ({ name: { startsWith: prefix } })) },
    select: { id: true },
  });

  if (staleClasses.length === 0) {
    return { classes: 0, enrollments: 0 };
  }

  const classIds = staleClasses.map((record) => record.id);
  const { count: enrollments } = await prismaClient.enrollment.deleteMany({
    where: { class_id: { in: classIds } },
  });
  const { count: classes } = await prismaClient.class.deleteMany({
    where: { id: { in: classIds } },
  });

  return { classes, enrollments };
}