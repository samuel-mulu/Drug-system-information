'use client';

import { useState } from 'react';
import { useDashboardSummary, useRecentStatusChanges, useOutOfStockInsights } from '../../../features/dashboard/hooks';
import { Card, CardContent, CardHeader } from '../../../components/ui/card';
import { PageHeader } from '../../../components/ui/page-header';
import LoadingState from '../../../components/ui/loading-state';
import ErrorState from '../../../components/ui/error-state';
import { useLocations } from '../../../features/medications/hooks';
import { useCurrentUser } from '../../../features/auth/hooks/useCurrentUser';

export default function DashboardPage() {
  const [locationFilter, setLocationFilter] = useState('');
  const { data: currentUser } = useCurrentUser();
  const { data: locationsData } = useLocations();
  const isManager = currentUser?.role === 'MEDICATION_MANAGER';
  const managerDepartmentId = currentUser?.departmentId || '';
  const effectiveLocationFilter = isManager ? managerDepartmentId || undefined : locationFilter || undefined;

  const { data: summary, isLoading: summaryLoading, error: summaryError } = useDashboardSummary(effectiveLocationFilter);
  const { data: recentChanges, isLoading: changesLoading, error: changesError } =
    useRecentStatusChanges(10, effectiveLocationFilter);
  const { data: insights, isLoading: insightsLoading, error: insightsError } =
    useOutOfStockInsights(effectiveLocationFilter);
  const locations = locationsData?.data || [];

  if (summaryLoading || changesLoading || insightsLoading) {
    return <LoadingState />;
  }

  if (summaryError || changesError || insightsError) {
    return <ErrorState message="Error loading dashboard data" />;
  }

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
              disabled={isManager}
            >
              {!isManager && <option value="">All Departments</option>}
              {locations.map((location) => (
                <option key={location.id} value={location.id}>
                  {location.name}
                </option>
              ))}
            </select>
          </div>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <h3 className="text-sm font-medium text-slate-500">Total Medications</h3>
            <p className="mt-2 text-3xl font-bold text-slate-900">{summary?.totalMedications || 0}</p>
          </CardContent>
        </Card>

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
      </div>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-bold text-slate-900">Recent Status Changes</h2>
        </CardHeader>
        <CardContent>
          {recentChanges && recentChanges.length > 0 ? (
            <div className="space-y-3">
              {recentChanges.map((change) => (
                <div key={change.id} className="rounded-lg border border-slate-200 p-4 sm:p-5">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                    {change.medication.code}
                  </p>
                  <p className="mt-1 text-sm font-semibold text-slate-900">{change.medication.genericName}</p>
                  <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-600">
                    <span className="rounded-full bg-slate-100 px-2 py-1">{change.oldStatus}</span>
                    <span>to</span>
                    <span className="rounded-full bg-primary/10 px-2 py-1 text-primary">{change.newStatus}</span>
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
            <h3 className="mb-3 text-sm font-semibold text-slate-600">Currently Out of Stock</h3>
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
          </div>

          <div>
            <h3 className="mb-3 text-sm font-semibold text-slate-600">Most Frequently Out of Stock</h3>
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
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
