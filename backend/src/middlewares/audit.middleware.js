import { AuditLogService } from '../modules/audit-log/audit-log.service.js';

/**
 * Ekstraksi informasi klien (IP address dan user agent)
 * @param {import('express').Request} req
 */
export function extractClientInfo(req) {
  const forwarded = req.headers['x-forwarded-for'];
  const ipAddress = forwarded
    ? (typeof forwarded === 'string' ? forwarded.split(',')[0].trim() : forwarded[0])
    : (req.ip || req.socket?.remoteAddress || null);
  const userAgent = req.headers['user-agent'] || null;

  return { ipAddress, userAgent };
}

/**
 * Middleware untuk menyematkan helper req.auditLog
 */
export function attachAuditHelper(req, res, next) {
  const { ipAddress, userAgent } = extractClientInfo(req);

  req.auditLog = (action, entity, options = {}) => {
    return AuditLogService.record({
      userId: req.user?.id || null,
      action,
      entity,
      ipAddress,
      userAgent,
      ...options,
    });
  };

  next();
}

/**
 * Interceptor otomatis untuk rute mutasi data krusial
 * @param {Object} config
 * @param {string} config.action - Nama aksi mutasi
 * @param {string} config.entity - Entitas yang dimutasi
 * @param {Function} [config.getEntityId] - fn(req, res) => string
 * @param {Function} [config.getOldValues] - fn(req) => Object
 * @param {Function} [config.getNewValues] - fn(req, res) => Object
 */
export function auditInterceptor({ action, entity, getEntityId, getOldValues, getNewValues }) {
  return (req, res, next) => {
    const { ipAddress, userAgent } = extractClientInfo(req);
    const oldValues = getOldValues ? getOldValues(req) : null;

    const originalJson = res.json;
    res.json = function (body) {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        const entityId = getEntityId ? getEntityId(req, body) : (req.params?.id || null);
        const newValues = getNewValues ? getNewValues(req, body) : (req.body || null);

        AuditLogService.record({
          userId: req.user?.id || null,
          action,
          entity,
          entityId,
          oldValues,
          newValues,
          ipAddress,
          userAgent,
        });
      }
      return originalJson.call(this, body);
    };

    next();
  };
}
