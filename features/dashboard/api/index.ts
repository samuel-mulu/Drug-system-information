import { api } from '../../../lib/api-client';
import {
  DashboardSummaryResponse,
  OutOfStockInsightsResponse,
  RecentStatusChangesResponse,
} from '../types';

export const dashboardApi = {
  getSummary: (locationId?: string) =>
    api.get<DashboardSummaryResponse>(
      `/api/analytics/dashboard-summary${locationId ? `?locationId=${locationId}` : ''}`
    ),
  
  getOutOfStockInsights: (locationId?: string) =>
    api.get<OutOfStockInsightsResponse>(
      `/api/analytics/out-of-stock-insights${locationId ? `?locationId=${locationId}` : ''}`
    ),
  
  getRecentChanges: (limit: number = 10, locationId?: string) =>
    api.get<RecentStatusChangesResponse>(
      `/api/analytics/recent-status-changes?limit=${limit}${locationId ? `&locationId=${locationId}` : ''}`
    ),
};
