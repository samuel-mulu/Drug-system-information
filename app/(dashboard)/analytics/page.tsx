'use client';

import { PageHeader } from '../../../components/ui/page-header';
import { Card, CardContent, CardHeader } from '../../../components/ui/card';
import LoadingState from '../../../components/ui/loading-state';
import ErrorState from '../../../components/ui/error-state';
import { useDashboardSummary, useOutOfStockInsights } from '../../../features/dashboard/hooks';

export default function AnalyticsPage() {
  const { data: summary, isLoading: summaryLoading, error: summaryError } = useDashboardSummary();
  const { data: insights, isLoading: insightsLoading } = useOutOfStockInsights();

  if (summaryLoading || insightsLoading) {
    return <LoadingState />;
  }

  if (summaryError) {
    return <ErrorState message="Error loading analytics data" />;
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Analytics" />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <h3 className="text-sm font-medium text-slate-500">Available</h3>
            <p className="mt-2 text-3xl font-bold text-success">{summary?.availableCount || 0}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <h3 className="text-sm font-medium text-slate-500">Out of Stock</h3>
            <p className="mt-2 text-3xl font-bold text-warning">{summary?.outOfStockCount || 0}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <h3 className="text-sm font-medium text-slate-500">Unavailable</h3>
            <p className="mt-2 text-3xl font-bold text-danger">{summary?.unavailableCount || 0}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <h3 className="text-sm font-medium text-slate-500">Total</h3>
            <p className="mt-2 text-3xl font-bold text-slate-900">{summary?.totalMedications || 0}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-bold text-slate-900">Currently Out of Stock</h2>
        </CardHeader>
        <CardContent>
          {insights?.currentlyOutOfStock && insights.currentlyOutOfStock.length > 0 ? (
            <div className="space-y-3">
              {insights.currentlyOutOfStock.map((item) => (
                <div key={item.id} className="rounded-lg border border-slate-200 p-4 sm:p-5">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{item.code}</p>
                  <p className="mt-1 text-sm font-semibold text-slate-900">{item.genericName}</p>
                  <p className="mt-1 text-sm text-slate-600">{item.location.name}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-500">No medications currently out of stock</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-bold text-slate-900">Most Frequently Out of Stock</h2>
        </CardHeader>
        <CardContent>
          {insights?.mostFrequentlyOutOfStock && insights.mostFrequentlyOutOfStock.length > 0 ? (
            <div className="space-y-3">
              {insights.mostFrequentlyOutOfStock.map((item) => (
                <div key={item.medicationId} className="rounded-lg border border-slate-200 p-4 sm:p-5">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{item.code}</p>
                      <p className="mt-1 text-sm font-semibold text-slate-900">{item.genericName}</p>
                    </div>
                    <span className="rounded-full bg-warning/10 px-2.5 py-1 text-xs font-medium text-warning">
                      {item.outOfStockChangeCount} times
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-500">No out-of-stock history available</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
