'use client';

import { PageHeader } from '../../../components/ui/page-header';
import { Card, CardContent, CardHeader } from '../../../components/ui/card';
import LoadingState from '../../../components/ui/loading-state';
import ErrorState from '../../../components/ui/error-state';
import { useDashboardOverview } from '../../../features/dashboard/hooks';

export default function AnalyticsPage() {
  const { data: overview, isLoading, isFetching, error } = useDashboardOverview(undefined, 10);

  if (isLoading && !overview) {
    return <LoadingState />;
  }

  if (error && !overview) {
    return <ErrorState message="Error loading analytics data" />;
  }

  const summary = overview?.summary;
  const insights = overview?.outOfStockInsights;

  return (
    <div className="space-y-6">
      <PageHeader title="Analytics" />

      {isFetching && overview ? (
        <p className="text-sm text-slate-500">Refreshing analytics data...</p>
      ) : null}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <h3 className="text-sm font-medium text-slate-500">Available</h3>
            <p className="mt-2 text-3xl font-bold text-success">{summary?.availableCount || 0}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <h3 className="text-sm font-medium text-slate-500">NEAR STOCK OUT</h3>
            <p className="mt-2 text-3xl font-bold text-warning">{summary?.outOfStockCount || 0}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <h3 className="text-sm font-medium text-slate-500">STOCK OUT</h3>
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
          <h2 className="text-lg font-bold text-slate-900">Currently Near Stock Out</h2>
        </CardHeader>
        <CardContent>
          {insights?.currentlyOutOfStock.length ? (
            <div className="space-y-3">
              {insights.currentlyOutOfStock.map((item) => (
                <div key={item.id} className="rounded-lg border border-slate-200 p-4 sm:p-5">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{item.dosageForm}</p>
                  <p className="mt-1 text-sm font-semibold text-slate-900">{item.strength}</p>
                  <p className="mt-1 text-sm text-slate-600">{item.location.name}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-500">No medications currently near stock out</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-bold text-slate-900">Most Frequently Near Stock Out</h2>
        </CardHeader>
        <CardContent>
          {insights?.mostFrequentlyOutOfStock.length ? (
            <div className="space-y-3">
              {insights.mostFrequentlyOutOfStock.map((item) => (
                <div key={item.medicationId} className="rounded-lg border border-slate-200 p-4 sm:p-5">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{item.dosageForm}</p>
                      <p className="mt-1 text-sm font-semibold text-slate-900">{item.strength}</p>
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
