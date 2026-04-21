export interface DashboardSummary {
  totalMedications: number;
  availableCount: number;
  outOfStockCount: number;
  unavailableCount: number;
}

export interface RecentStatusChange {
  id: string;
  medication: {
    id: string;
    code: string;
    genericName: string;
  };
  oldStatus: string;
  newStatus: string;
  reason: string | null;
  changedBy: {
    id: string;
    fullName: string;
  };
  changedAt: string;
}

export interface OutOfStockInsightItem {
  id: string;
  code: string;
  genericName: string;
  location: {
    id: string;
    name: string;
  };
}

export interface MostFrequentlyOutOfStock {
  medicationId: string;
  code: string;
  genericName: string;
  outOfStockChangeCount: number;
}

export interface StatusBreakdown {
  AVAILABLE: number;
  OUT_OF_STOCK: number;
  UNAVAILABLE: number;
}

export interface OutOfStockInsights {
  currentlyOutOfStock: OutOfStockInsightItem[];
  mostFrequentlyOutOfStock: MostFrequentlyOutOfStock[];
  statusBreakdown: StatusBreakdown;
}

export interface DashboardSummaryResponse {
  data: DashboardSummary;
}

export interface OutOfStockInsightsResponse {
  data: OutOfStockInsights;
}

export interface RecentStatusChangesResponse {
  data: RecentStatusChange[];
}
