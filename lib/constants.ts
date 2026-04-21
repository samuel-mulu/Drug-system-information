export const APP_NAME = 'Drug Info System';

export const ROUTES = {
  LOGIN: '/login',
  DASHBOARD: '/dashboard',
  MEDICATIONS: '/medications',
  USERS: '/users',
  ANALYTICS: '/analytics',
  AUDIT_LOGS: '/audit-logs',
} as const;

export const ROLE_NAMES = {
  SYSTEM_ADMIN: 'SYSTEM_ADMIN',
  MEDICATION_MANAGER: 'MEDICATION_MANAGER',
  VIEWER: 'VIEWER',
} as const;

export type RoleType = 'SYSTEM_ADMIN' | 'MEDICATION_MANAGER' | 'VIEWER';

export const SIDEBAR_NAV_ITEMS = [
  { label: 'Dashboard', href: ROUTES.DASHBOARD, allowedRoles: ['SYSTEM_ADMIN', 'MEDICATION_MANAGER', 'VIEWER'] as RoleType[] },
  { label: 'Medications', href: ROUTES.MEDICATIONS, allowedRoles: ['SYSTEM_ADMIN', 'MEDICATION_MANAGER'] as RoleType[] },
  { label: 'Users', href: ROUTES.USERS, allowedRoles: ['SYSTEM_ADMIN'] as RoleType[] },
  { label: 'Analytics', href: ROUTES.ANALYTICS, allowedRoles: ['SYSTEM_ADMIN', 'MEDICATION_MANAGER', 'VIEWER'] as RoleType[] },
  { label: 'Audit Logs', href: ROUTES.AUDIT_LOGS, allowedRoles: ['SYSTEM_ADMIN'] as RoleType[] },
] as const;
