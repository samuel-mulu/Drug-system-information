'use client';

import { useState } from 'react';
import { useDashboardOverview } from '../../../features/dashboard/hooks';
import { MedicationSummaryCards } from '../../../features/dashboard/components/medication-summary-cards';
import { Card, CardContent, CardHeader } from '../../../components/ui/card';
import { PageHeader } from '../../../components/ui/page-header';
import LoadingState from '../../../components/ui/loading-state';
import ErrorState from '../../../components/ui/error-state';
import { useLocations } from '../../../features/medications/hooks';
import { useCurrentUser } from '../../../features/auth/hooks/useCurrentUser';
import { getMedicationStatusLabel } from '../../../features/medications/components/medication-status-badge';

export default function DashboardPage() {
  const [locationFilter, setLocationFilter] = useState('');
  const { data: currentUser } = useCurrentUser();
  const { data: locations = [] } = useLocations();
  const isManager = currentUser?.role === 'MEDICATION_MANAGER';
  const isViewer = currentUser?.role === 'VIEWER';
  const managerDepartmentId = currentUser?.departmentId || '';
  const effectiveLocationFilter = isManager ? managerDepartmentId || undefined : locationFilter || undefined;

  const {
    data: overview,
    isLoading,
    isFetching,
    error,
  } = useDashboardOverview(effectiveLocationFilter, 10);

  if (isLoading && !overview) {
    return <LoadingState />;
  }

  if (error && !overview) {
    return <ErrorState message="Error loading dashboard data" />;
  }

  const summary = overview?.summary;
  const recentChanges = overview?.recentStatusChanges || [];
  const insights = overview?.outOfStockInsights;
  const hasDashboardData = !!overview;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        actions={
          <div className="min-w-[220px]">
            <label className="mb-1 block text-xs font-medium text-slate-600">Department</label>
            <select
              value={isManager ? managerDepartmentId : locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              disabled={isManager || locations.length === 0}
            >
              {!isManager && <option value="">{isViewer ? 'Assigned Departments' : 'All Departments'}</option>}
              {locations.map((location) => (
                <option key={location.id} value={location.id}>
                  {location.name}
                </option>
              ))}
            </select>
          </div>
        }
      />

      {isFetching && hasDashboardData ? (
        <p className="text-sm text-slate-500">Refreshing dashboard data...</p>
      ) : null}

      {summary ? (
        <MedicationSummaryCards
          summary={summary}
          locationId={effectiveLocationFilter}
          source="dashboard"
        />
      ) : null}

      <Card>
        <CardHeader>
          <h2 className="text-lg font-bold text-slate-900">Recent Status Changes</h2>
        </CardHeader>
        <CardContent>
          {recentChanges.length > 0 ? (
            <div className="space-y-3">
              {recentChanges.map((change) => (
                <div key={change.id} className="rounded-lg border border-slate-200 p-4 sm:p-5">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                    {change.medication.dosageForm}
                  </p>
                  <p className="mt-1 text-sm font-semibold text-slate-900">{change.medication.strength}</p>
                  <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-600">
                    <span className="rounded-full bg-slate-100 px-2 py-1">
                      {getMedicationStatusLabel(change.oldStatus)}
                    </span>
                    <span>to</span>
                    <span className="rounded-full bg-primary/10 px-2 py-1 text-primary">
                      {getMedicationStatusLabel(change.newStatus)}
                    </span>
                    <span>by {change.changedBy.fullName}</span>
                    <span>{new Date(change.changedAt).toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-500">No recent status changes</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-bold text-slate-900">Out-of-Stock Insights</h2>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="mb-3 text-sm font-semibold text-slate-600">Currently Near Stock Out</h3>
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
          </div>

          <div>
            <h3 className="mb-3 text-sm font-semibold text-slate-600">Most Frequently Near Stock Out</h3>
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
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
