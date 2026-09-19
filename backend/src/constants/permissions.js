export const PERMISSIONS = {
  AUTH_LOGIN: 'auth:login',
  PROFILE_READ: 'profile:read',
  PROFILE_UPDATE: 'profile:update',
  PORTAL_VIEW: 'portal:view',
  USER_MANAGE: 'user:manage',
  ROLE_MANAGE: 'role:manage',
  MASTER_ACADEMIC_READ: 'master:academic:read',
  MASTER_ACADEMIC_WRITE: 'master:academic:write',
  CALENDAR_VIEW: 'calendar:view',
  CALENDAR_MANAGE: 'calendar:manage',
  AUDIT_VIEW: 'audit:view',
};

export const ALL_PERMISSIONS = Object.values(PERMISSIONS);
