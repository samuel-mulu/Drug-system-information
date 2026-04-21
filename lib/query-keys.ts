interface MedicationFilters {
  search?: string;
  status?: string;
  locationId?: string;
  page?: number;
  limit?: number;
}

interface UserFilters {
  search?: string;
  role?: string;
  isActive?: boolean;
  page?: number;
  limit?: number;
}

interface AuditLogFilters {
  page?: number;
  limit?: number;
}

export const queryKeys = {
  auth: {
    me: ['auth', 'me'] as const,
  },
  dashboard: {
    summary: (locationId?: string) => ['dashboard', 'summary', locationId] as const,
    recentStatusChanges: (limit?: number, locationId?: string) =>
      ['dashboard', 'recentStatusChanges', limit, locationId] as const,
    outOfStockInsights: (locationId?: string) => ['dashboard', 'outOfStockInsights', locationId] as const,
  },
  medications: {
    all: ['medications'] as const,
    list: (filters?: MedicationFilters) => ['medications', 'list', filters] as const,
    detail: (id: string) => ['medications', 'detail', id] as const,
    statusHistory: (id: string) => ['medications', 'statusHistory', id] as const,
  },
  users: {
    all: ['users'] as const,
    list: (filters?: UserFilters) => ['users', 'list', filters] as const,
    detail: (id: string) => ['users', 'detail', id] as const,
  },
  roles: {
    all: ['roles'] as const,
  },
  auditLogs: {
    all: ['auditLogs'] as const,
    list: (filters?: AuditLogFilters) => ['auditLogs', 'list', filters] as const,
  },
};
