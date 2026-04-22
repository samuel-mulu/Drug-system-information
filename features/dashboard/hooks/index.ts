import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import { dashboardApi } from '../api';

export function useDashboardOverview(locationId?: string, limit: number = 10) {
  return useQuery({
    queryKey: queryKeys.dashboard.overview(locationId, limit),
    queryFn: async () => {
      const response = await dashboardApi.getOverview(locationId, limit);
      return response.data;
    },
    placeholderData: keepPreviousData,
  });
}

export function useDashboardSummary(locationId?: string) {
  return useQuery({
    queryKey: queryKeys.dashboard.summary(locationId),
    queryFn: async () => {
      const response = await dashboardApi.getSummary(locationId);
      return response.data;
    },
    placeholderData: keepPreviousData,
  });
}

export function useRecentStatusChanges(limit?: number, locationId?: string) {
  return useQuery({
    queryKey: queryKeys.dashboard.recentStatusChanges(limit, locationId),
    queryFn: async () => {
      const response = await dashboardApi.getRecentChanges(limit, locationId);
      return response.data;
    },
    placeholderData: keepPreviousData,
  });
}

export function useOutOfStockInsights(locationId?: string) {
  return useQuery({
    queryKey: queryKeys.dashboard.outOfStockInsights(locationId),
    queryFn: async () => {
      const response = await dashboardApi.getOutOfStockInsights(locationId);
      return response.data;
    },
    placeholderData: keepPreviousData,
  });
}
