import prisma from '../config/prisma.js';

/**
 * Mencatat mutasi data ke tabel audit_logs
 */
export async function logAudit({
  userId = null,
  action,
  entity,
  entityId = null,
  oldValues = null,
  newValues = null,
  ipAddress = null,
  userAgent = null,
}) {
  try {
    return await prisma.auditLog.create({
      data: {
        user_id: userId,
        action,
        entity,
        entity_id: entityId ? String(entityId) : null,
        old_values: oldValues,
        new_values: newValues,
        ip_address: ipAddress || null,
        user_agent: userAgent || null,
      },
    });
  } catch (error) {
    console.error('[AuditLog Error]: Gagal menyimpan jejak audit:', error.message);
    return null;
  }
}
