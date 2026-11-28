import prisma from '../../config/prisma.js';
import { AppError } from '../../utils/errors.js';
import { AuditLogService } from '../audit-log/audit-log.service.js';
import { AUDIT_ENTITIES } from '../../constants/auditEntities.js';
import {
  CONFIG_KEYS,
  CONFIG_DEFAULTS,
  SAFE_DOCUMENT_EXTENSIONS,
  FILE_SIZE_LIMITS,
  ATTENDANCE_THRESHOLD_LIMITS,
  CONFIG_CACHE_TTL_MS,
  megabytesToBytes,
} from '../../constants/config.js';

/**
 * Layanan konfigurasi sistem (FR-049, FR-050).
 *
 * Sumber kebenaran: tabel `system_configs`. Nilai yang belum ada pada tabel
 * jatuh kembali ke `CONFIG_DEFAULTS`. Pembacaan runtime (mis. middleware
 * unggahan) memakai cache in-memory ber-TTL agar tidak menambah query DB per
 * request; cache diinvalidasi seketika setelah `updateConfig`.
 */
export class ConfigService {
  /** @type {{ values: Map<string, unknown>, loadedAt: number } | null} */
  static #cache = null;

  /**
   * Muat seluruh baris konfigurasi dari database.
   *
   * @returns {Promise<Map<string, unknown>>} peta kunci → nilai
   */
  static async #loadValues() {
    const rows = await prisma.systemConfig.findMany({
      select: { key: true, value: true },
    });
    return new Map(rows.map((row) => [row.key, row.value]));
  }

  /**
   * Ambil peta nilai efektif (database + default), memakai cache ber-TTL.
   *
   * @param {object} [options]
   * @param {boolean} [options.forceRefresh=false] lewati cache
   * @returns {Promise<Map<string, unknown>>}
   */
  static async getEffectiveValues({ forceRefresh = false } = {}) {
    if (!forceRefresh && this.#cache && Date.now() - this.#cache.loadedAt < CONFIG_CACHE_TTL_MS) {
      return this.#cache.values;
    }

    const stored = await this.#loadValues();
    const values = new Map();
    for (const [key, defaultValue] of Object.entries(CONFIG_DEFAULTS)) {
      values.set(key, stored.has(key) ? stored.get(key) : defaultValue);
    }

    this.#cache = { values, loadedAt: Date.now() };
    return values;
  }

  /**
   * Invalidasi cache in-memory. Wajib dipanggil setelah perubahan konfigurasi
   * agar request berikutnya langsung memakai nilai baru.
   */
  static invalidateCache() {
    this.#cache = null;
  }

  /**
   * Validasi sebuah nilai konfigurasi terhadap aturan keamanan.
   *
   * @param {string} key kunci konfigurasi
   * @param {unknown} value nilai baru
   * @returns {unknown} nilai ternormalisasi
   * @throws {AppError} 400 bila nilai tidak sah
   */
  static #validateValue(key, value) {
    switch (key) {
      case CONFIG_KEYS.FILE_ALLOWED_EXTENSIONS: {
        if (!Array.isArray(value) || value.length === 0) {
          throw new AppError('Daftar ekstensi berkas wajib berupa array dengan minimal satu entri', 400);
        }
        const normalized = [...new Set(value.map((ext) => String(ext).trim().toLowerCase()))];
        for (const ext of normalized) {
          if (!SAFE_DOCUMENT_EXTENSIONS.includes(ext)) {
            throw new AppError(
              `Ekstensi "${ext}" tidak diizinkan. Pilihan yang sah: ${SAFE_DOCUMENT_EXTENSIONS.join(', ')}`,
              400
            );
          }
        }
        // Pertahankan urutan hard ceiling agar pesan galat tetap stabil.
        return SAFE_DOCUMENT_EXTENSIONS.filter((ext) => normalized.includes(ext));
      }
      case CONFIG_KEYS.FILE_MAX_SIZE_MB: {
        const megabytes = Number(value);
        if (!Number.isInteger(megabytes) || megabytes < FILE_SIZE_LIMITS.MIN_MB || megabytes > FILE_SIZE_LIMITS.MAX_MB) {
          throw new AppError(
            `Ukuran maksimal berkas harus berupa bilangan bulat pada rentang ${FILE_SIZE_LIMITS.MIN_MB}–${FILE_SIZE_LIMITS.MAX_MB} MB (FR-019, BR-008)`,
            400
          );
        }
        return megabytes;
      }
      case CONFIG_KEYS.ATTENDANCE_THRESHOLD: {
        const threshold = Number(value);
        if (
          !Number.isInteger(threshold) ||
          threshold < ATTENDANCE_THRESHOLD_LIMITS.MIN ||
          threshold > ATTENDANCE_THRESHOLD_LIMITS.MAX
        ) {
          throw new AppError(
            `Ambang kehadiran harus berupa bilangan bulat pada rentang ${ATTENDANCE_THRESHOLD_LIMITS.MIN}–${ATTENDANCE_THRESHOLD_LIMITS.MAX} persen (FR-050)`,
            400
          );
        }
        return threshold;
      }
      default:
        throw new AppError(`Kunci konfigurasi tidak dikenal: ${key}`, 400);
    }
  }

  /**
   * Konfigurasi efektif untuk Admin (bentuk respons API).
   *
   * @returns {Promise<object>}
   */
  static async getConfigForAdmin() {
    const values = await this.getEffectiveValues();

    const rows = await prisma.systemConfig.findMany({
      orderBy: { updated_at: 'desc' },
      take: 1,
      select: {
        updated_at: true,
        updated_by: true,
        updater: { select: { id: true, username: true } },
      },
    });
    const lastUpdate = rows[0] || null;

    const allowedExtensions = values.get(CONFIG_KEYS.FILE_ALLOWED_EXTENSIONS);
    const maxSizeMb = values.get(CONFIG_KEYS.FILE_MAX_SIZE_MB);

    return {
      file: {
        allowed_extensions: allowedExtensions,
        max_size_mb: maxSizeMb,
        max_size_bytes: megabytesToBytes(maxSizeMb),
      },
      attendance: {
        threshold_percentage: values.get(CONFIG_KEYS.ATTENDANCE_THRESHOLD),
      },
      updated_at: lastUpdate?.updated_at ? lastUpdate.updated_at.toISOString() : null,
      updated_by: lastUpdate?.updater
        ? { id: lastUpdate.updater.id, username: lastUpdate.updater.username }
        : null,
    };
  }

  /**
   * Kebijakan unggahan dokumen untuk runtime (middleware/service).
   *
   * @returns {Promise<{allowedExtensions: string[], maxSizeMb: number, maxSizeBytes: number}>}
   */
  static async getFilePolicy() {
    const values = await this.getEffectiveValues();
    const maxSizeMb = values.get(CONFIG_KEYS.FILE_MAX_SIZE_MB);

    return {
      allowedExtensions: values.get(CONFIG_KEYS.FILE_ALLOWED_EXTENSIONS),
      maxSizeMb,
      maxSizeBytes: megabytesToBytes(maxSizeMb),
    };
  }

  /**
   * Ambang kehadiran ujian dalam persen (FR-050). Penegakan gatekeeping
   * UTS/UAS memakai nilai ini mulai MVP 5.
   *
   * @returns {Promise<number>}
   */
  static async getAttendanceThreshold() {
    const values = await this.getEffectiveValues();
    return values.get(CONFIG_KEYS.ATTENDANCE_THRESHOLD);
  }

  /**
   * Perbarui konfigurasi (Admin). Hanya kunci yang dikirim yang diubah;
   * seluruh perubahan dibungkus transaksi lalu dicatat ke audit.
   *
   * @param {object} params
   * @param {object} params.payload payload tervalidasi Zod
   * @param {string} params.adminId ID Admin pelaku
   * @param {string} [params.ipAddress]
   * @param {string} [params.userAgent]
   * @returns {Promise<object>} konfigurasi efektif terbaru
   */
  static async updateConfig({ payload, adminId, ipAddress, userAgent }) {
    const updates = [];

    if (payload.file?.allowed_extensions !== undefined) {
      updates.push({
        key: CONFIG_KEYS.FILE_ALLOWED_EXTENSIONS,
        value: this.#validateValue(CONFIG_KEYS.FILE_ALLOWED_EXTENSIONS, payload.file.allowed_extensions),
      });
    }
    if (payload.file?.max_size_mb !== undefined) {
      updates.push({
        key: CONFIG_KEYS.FILE_MAX_SIZE_MB,
        value: this.#validateValue(CONFIG_KEYS.FILE_MAX_SIZE_MB, payload.file.max_size_mb),
      });
    }
    if (payload.attendance?.threshold_percentage !== undefined) {
      updates.push({
        key: CONFIG_KEYS.ATTENDANCE_THRESHOLD,
        value: this.#validateValue(CONFIG_KEYS.ATTENDANCE_THRESHOLD, payload.attendance.threshold_percentage),
      });
    }

    if (updates.length === 0) {
      throw new AppError('Minimal satu konfigurasi harus dikirim', 400);
    }

    const oldValues = await this.getEffectiveValues({ forceRefresh: true });

    await prisma.$transaction(async (tx) => {
      for (const update of updates) {
        await tx.systemConfig.upsert({
          where: { key: update.key },
          update: { value: update.value, updated_by: adminId },
          create: { key: update.key, value: update.value, updated_by: adminId },
        });
      }
    });

    this.invalidateCache();

    await AuditLogService.record({
      userId: adminId,
      action: 'UPDATE_CONFIG',
      entity: AUDIT_ENTITIES.CONFIG,
      entityId: null,
      oldValues: Object.fromEntries(updates.map((u) => [u.key, oldValues.get(u.key)])),
      newValues: Object.fromEntries(updates.map((u) => [u.key, u.value])),
      ipAddress,
      userAgent,
    });

    return this.getConfigForAdmin();
  }
}
