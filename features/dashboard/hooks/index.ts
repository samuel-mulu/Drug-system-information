import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import { dashboardApi } from '../api';

export function useDashboardSummary(locationId?: string) {
  return useQuery({
    queryKey: queryKeys.dashboard.summary(locationId),
    queryFn: async () => {
      const response = await dashboardApi.getSummary(locationId);
      return response.data;
    },
  });
}

export function useRecentStatusChanges(limit?: number, locationId?: string) {
  return useQuery({
    queryKey: queryKeys.dashboard.recentStatusChanges(limit, locationId),
    queryFn: async () => {
      const response = await dashboardApi.getRecentChanges(limit, locationId);
      return response.data;
    },
  });
}

export function useOutOfStockInsights(locationId?: string) {
  return useQuery({
    queryKey: queryKeys.dashboard.outOfStockInsights(locationId),
    queryFn: async () => {
      const response = await dashboardApi.getOutOfStockInsights(locationId);
      return response.data;
    },
  });
}
