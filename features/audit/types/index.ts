export interface AuditLog {
  id: string;
  userId: string;
  action: string;
  entityType: string;
  entityId: string;
  changes?: string;
  createdAt: string;
}

export interface AuditLogFilters {
  userId?: string;
  action?: string;
  entityType?: string;
  startDate?: string;
  endDate?: string;
}
