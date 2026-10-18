import prisma from '../../config/prisma.js';
import { AppError } from '../../utils/errors.js';

/**
 * Layanan terpusat Audit Trail Engine SPADA LMS (SRS Bab 15 & Bab 35)
 */
export class AuditLogService {
  /**
   * Catat mutasi atau kejadian sensitif ke audit log
   */
  /**
   * Circuit breaker state untuk audit logging
   */
  static #circuitBreaker = {
    isOpen: false,
    failureCount: 0,
    lastFailureTime: null,
    RESET_TIMEOUT: 60000, // 1 menit
    FAILURE_THRESHOLD: 5,
  };

  /**
   * Catat mutasi atau kejadian sensitif ke audit log dengan error handling robust
   * Implementasi retry dengan exponential backoff dan circuit breaker untuk production
   */
  static async record({
    userId = null,
    action,
    entity,
    entityId = null,
    oldValues = null,
    newValues = null,
    ipAddress = null,
    userAgent = null,
  }) {
    const payload = {
      user_id: userId || null,
      action: String(action).toUpperCase(),
      entity: String(entity).toLowerCase(),
      entity_id: entityId ? String(entityId) : null,
      old_values: oldValues ? this.#sanitizeValues(oldValues) : null,
      new_values: newValues ? this.#sanitizeValues(newValues) : null,
      ip_address: ipAddress || null,
      user_agent: userAgent || null,
    };

    // Cek circuit breaker
    if (this.#circuitBreaker.isOpen) {
      const now = Date.now();
      const timeSinceFailure = now - this.#circuitBreaker.lastFailureTime;

      if (timeSinceFailure > this.#circuitBreaker.RESET_TIMEOUT) {
        // Reset circuit breaker setelah timeout
        this.#circuitBreaker.isOpen = false;
        this.#circuitBreaker.failureCount = 0;
      } else {
        // Circuit breaker masih open, gunakan fallback logging
        return this.#fallbackLog(payload);
      }
    }

    // Coba tulis ke database dengan retry mechanism
    const maxRetries = 3;
    const baseDelay = 100; // 100ms

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const result = await prisma.auditLog.create({ data: payload });

        // Reset failure count jika berhasil
        if (this.#circuitBreaker.failureCount > 0) {
          this.#circuitBreaker.failureCount = 0;
          this.#circuitBreaker.isOpen = false;
        }

        return result;
      } catch (error) {
        // Update circuit breaker state
        this.#circuitBreaker.failureCount++;
        this.#circuitBreaker.lastFailureTime = Date.now();

        if (this.#circuitBreaker.failureCount >= this.#circuitBreaker.FAILURE_THRESHOLD) {
          this.#circuitBreaker.isOpen = true;
          console.error('[AuditLogService] Circuit breaker OPEN - database mungkin down');
        }

        if (attempt === maxRetries) {
          // Final attempt failed, gunakan fallback
          console.error(`[AuditLogService] Gagal merekam jejak audit setelah ${maxRetries} percobaan:`, {
            action: payload.action,
            entity: payload.entity,
            error: error?.message,
            stack: error?.stack?.substring(0, 500),
          });

          return this.#fallbackLog(payload);
        }

        // Exponential backoff sebelum retry
        const delay = baseDelay * Math.pow(2, attempt - 1);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  /**
   * Sanitasi values untuk mencegah log injection dan size overflow
   */
  static #sanitizeValues(values) {
    if (typeof values === 'object' && values !== null) {
      // Stringify dengan batasan size
      const str = JSON.stringify(values);
      if (str.length > 10000) { // 10KB limit
        return {
          _truncated: true,
          _original_size: str.length,
          _message: 'Data terlalu besar, truncated untuk efisiensi storage'
        };
      }
      return values;
    }

    // Untuk non-object, convert ke string dengan length limit
    const str = String(values);
    return str.length > 2000 ? str.substring(0, 2000) + '... [truncated]' : str;
  }

  /**
   * Fallback logging ketika database tidak tersedia
   */
  static #fallbackLog(payload) {
    try {
      // Coba tulis ke file system sebagai fallback
      const fs = require('fs');
      const path = require('path');

      const logDir = path.join(process.cwd(), 'logs', 'audit-fallback');
      if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir, { recursive: true });
      }

      const timestamp = new Date().toISOString().replace(/:/g, '-');
      const filename = `audit-fallback-${timestamp}.json`;
      const filepath = path.join(logDir, filename);

      const logEntry = {
        ...payload,
        _fallback: true,
        _timestamp: new Date().toISOString(),
      };

      fs.appendFileSync(filepath, JSON.stringify(logEntry) + '\n');

      console.warn('[AuditLogService] Audit log ditulis ke file fallback:', {
        file: filename,
        action: payload.action,
        entity: payload.entity,
      });

      return { id: 'fallback', ...payload, _fallback: true };
    } catch (fallbackError) {
      // Ultimate fallback: console.error dengan structured data
      console.error('[AuditLogService] CRITICAL: Gagal semua metode logging:', {
        original_payload: payload,
        fallback_error: fallbackError?.message,
      });

      return null;
    }
  }

  /**
   * Mengambil daftar jejak audit dengan filter komprehensif dan paginasi
   */
  static async findAll({
    page = 1,
    limit = 20,
    action,
    entity,
    userId,
    startDate,
    endDate,
    search,
    sortBy = 'created_at',
    sortOrder = 'desc',
  } = {}) {
    const currentPage = Math.max(1, parseInt(page, 10) || 1);
    const take = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
    const skip = (currentPage - 1) * take;

    const where = {};

    if (action) {
      where.action = { equals: action.trim().toUpperCase() };
    }

    if (entity) {
      where.entity = { contains: entity.trim().toLowerCase(), mode: 'insensitive' };
    }

    if (userId) {
      where.user_id = { equals: userId };
    }

    if (startDate || endDate) {
      where.created_at = {};
      if (startDate) {
        where.created_at.gte = new Date(startDate);
      }
      if (endDate) {
        const parsedEndDate = new Date(endDate);
        if (typeof endDate === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(endDate.trim())) {
          parsedEndDate.setUTCHours(23, 59, 59, 999);
        }
        where.created_at.lte = parsedEndDate;
      }
    }

    if (search) {
      const trimmedSearch = search.trim();
      where.OR = [
        { action: { contains: trimmedSearch, mode: 'insensitive' } },
        { entity: { contains: trimmedSearch, mode: 'insensitive' } },
        { entity_id: { contains: trimmedSearch, mode: 'insensitive' } },
        { user: { username: { contains: trimmedSearch, mode: 'insensitive' } } },
        { user: { email: { contains: trimmedSearch, mode: 'insensitive' } } },
      ];
    }

    const sortFieldMap = {
      created_at: 'created_at',
      waktu: 'created_at',
      action: 'action',
      entity: 'entity',
    };
    const resolvedSortBy = sortFieldMap[sortBy] || 'created_at';
    const resolvedSortOrder = sortOrder?.toLowerCase() === 'asc' ? 'asc' : 'desc';

    const [total, items] = await Promise.all([
      prisma.auditLog.count({ where }),
      prisma.auditLog.findMany({
        where,
        skip,
        take,
        orderBy: { [resolvedSortBy]: resolvedSortOrder },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              email: true,
              status: true,
              role: true,
              profile: {
                select: {
                  full_name: true,
                },
              },
            },
          },
        },
      }),
    ]);

    const totalPages = Math.ceil(total / take);

    return {
      items,
      meta: {
        page: currentPage,
        limit: take,
        total,
        totalPages,
        hasNextPage: currentPage < totalPages,
        hasPrevPage: currentPage > 1,
      },
    };
  }

  /**
   * Mengambil detail rekaman jejak audit berdasarkan ID
   */
  static async findById(id) {
    if (!id) {
      throw new AppError('ID jejak audit wajib diberikan', 400);
    }

    const auditLog = await prisma.auditLog.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
            status: true,
            role: true,
            profile: {
              select: {
                full_name: true,
              },
            },
          },
        },
      },
    });

    if (!auditLog) {
      throw new AppError('Catatan jejak audit tidak ditemukan', 404);
    }

    return auditLog;
  }

  /**
   * Helper audit pembuatan akun pengguna baru (SRS Bab 35, FR-044)
   */
  static async logUserCreation({ adminId, newUser, ipAddress, userAgent }) {
    return this.record({
      userId: adminId,
      action: 'CREATE_USER',
      entity: 'users',
      entityId: newUser.id,
      newValues: {
        username: newUser.username,
        email: newUser.email,
        role: newUser.role,
        status: newUser.status,
      },
      ipAddress,
      userAgent,
    });
  }

  /**
   * Helper audit status akun pengguna (SRS Bab 35, FR-044)
   */
  static async logStatusChange({
    adminId,
    targetUserId,
    oldStatus,
    newStatus,
    reason = null,
    ipAddress,
    userAgent,
  }) {
    return this.record({
      userId: adminId,
      action: 'UPDATE_USER_STATUS',
      entity: 'users',
      entityId: targetUserId,
      oldValues: { status: oldStatus },
      newValues: { status: newStatus, reason },
      ipAddress,
      userAgent,
    });
  }

  /**
   * Helper audit pembaruan profil atau peran akun (SRS Bab 35, FR-044)
   */
  static async logUserUpdate({ adminId, targetUserId, oldValues, newValues, ipAddress, userAgent }) {
    return this.record({
      userId: adminId,
      action: 'UPDATE_USER',
      entity: 'users',
      entityId: targetUserId,
      oldValues,
      newValues,
      ipAddress,
      userAgent,
    });
  }

  /**
   * Helper audit reset kata sandi pengguna oleh Admin (SRS Bab 35, FR-044)
   */
  static async logPasswordReset({ adminId, targetUserId, targetUsername, ipAddress, userAgent }) {
    return this.record({
      userId: adminId,
      action: 'RESET_PASSWORD',
      entity: 'users',
      entityId: targetUserId,
      newValues: {
        reset_by_admin: true,
        target_username: targetUsername || null,
      },
      ipAddress,
      userAgent,
    });
  }

  /**
   * Helper audit mutasi pembukaan kelas perkuliahan (Fase 4, FR-047)
   */
  static async logClassMutation({
    userId,
    action,
    classId,
    oldValues = null,
    newValues = null,
    ipAddress,
    userAgent,
  }) {
    return this.record({
      userId,
      action,
      entity: 'classes',
      entityId: classId,
      oldValues,
      newValues,
      ipAddress,
      userAgent,
    });
  }

  /**
   * Helper audit aksi enrollment mahasiswa (Fase 5, FR-048, BR-002)
   */
  static async logEnrollmentMutation({
    userId,
    action,
    enrollmentId,
    studentId,
    classId,
    oldValues = null,
    newValues = null,
    ipAddress,
    userAgent,
  }) {
    return this.record({
      userId,
      action,
      entity: 'enrollments',
      entityId: enrollmentId,
      oldValues,
      newValues: {
        student_id: studentId,
        class_id: classId,
        ...(newValues || {}),
      },
      ipAddress,
      userAgent,
    });
  }

  /**
   * Helper audit mutasi master data umum
   */
  static async logMasterDataMutation({
    userId,
    action,
    entity,
    entityId,
    oldValues = null,
    newValues = null,
    ipAddress,
    userAgent,
  }) {
    return this.record({
      userId,
      action,
      entity,
      entityId,
      oldValues,
      newValues,
      ipAddress,
      userAgent,
    });
  }
}
