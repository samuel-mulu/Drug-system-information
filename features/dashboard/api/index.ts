import { api } from '../../../lib/api-client';
import {
  DashboardOverviewResponse,
  DashboardSummaryResponse,
  OutOfStockInsightsResponse,
  RecentStatusChangesResponse,
} from '../types';

function buildAnalyticsQuery(locationId?: string, limit?: number) {
  const params = new URLSearchParams();

  if (locationId) {
    params.set('locationId', locationId);
  }

  if (limit) {
    params.set('limit', String(limit));
  }

  const query = params.toString();
  return query ? `?${query}` : '';
}

export const dashboardApi = {
  getOverview: (locationId?: string, limit: number = 10) =>
    api.get<DashboardOverviewResponse>(
      `/api/analytics/dashboard-overview${buildAnalyticsQuery(locationId, limit)}`
    ),

  getSummary: (locationId?: string) =>
    api.get<DashboardSummaryResponse>(
      `/api/analytics/dashboard-summary${buildAnalyticsQuery(locationId)}`
    ),
  
  getOutOfStockInsights: (locationId?: string, limit?: number) =>
    api.get<OutOfStockInsightsResponse>(
      `/api/analytics/out-of-stock-insights${buildAnalyticsQuery(locationId, limit)}`
    ),
  
  getRecentChanges: (limit: number = 10, locationId?: string) =>
    api.get<RecentStatusChangesResponse>(
      `/api/analytics/recent-status-changes${buildAnalyticsQuery(locationId, limit)}`
    ),
};
