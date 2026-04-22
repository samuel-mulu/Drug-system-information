import { MedicationStatus } from '@/features/medications/types';

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
    strength: string;
    dosageForm: string;
  };
  oldStatus: MedicationStatus;
  newStatus: MedicationStatus;
  reason: string | null;
  changedBy: {
    id: string;
    fullName: string;
  };
  changedAt: string;
}

export interface OutOfStockInsightItem {
  id: string;
  strength: string;
  dosageForm: string;
  location: {
    id: string;
    name: string;
  };
}

export interface MostFrequentlyOutOfStock {
  medicationId: string;
  strength: string;
  dosageForm: string;
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

export interface DashboardOverview {
  summary: DashboardSummary;
  recentStatusChanges: RecentStatusChange[];
  outOfStockInsights: OutOfStockInsights;
}

export interface DashboardSummaryResponse {
  data: DashboardSummary;
}

export interface DashboardOverviewResponse {
  data: DashboardOverview;
}

export interface OutOfStockInsightsResponse {
  data: OutOfStockInsights;
}

export interface RecentStatusChangesResponse {
  data: RecentStatusChange[];
}
