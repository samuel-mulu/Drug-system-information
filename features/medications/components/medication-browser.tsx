'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import toast from 'react-hot-toast';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import LoadingState from '@/components/ui/loading-state';
import ErrorState from '@/components/ui/error-state';
import EmptyState from '@/components/ui/empty-state';
import DataTable, { Column } from '@/components/ui/data-table';
import { useDebouncedValue } from '@/lib/debounce';
import { getApiErrorMessage } from '@/lib/api-client';
import { ROUTES } from '@/lib/constants';
import { useCurrentUser } from '@/features/auth/hooks/useCurrentUser';
import { useDashboardSummary } from '@/features/dashboard/hooks';
import {
  useMedications,
  useLocations,
  useCreateMedication,
  useChangeMedicationStatus,
} from '../hooks';
import {
  CreateMedicationInput,
  MedicationListItem,
  MedicationStatus,
} from '../types';
import MedicationForm from './medication-form';
import ChangeStatusModal from './change-status-modal';
import MedicationStatusBadge from './medication-status-badge';

function normalizeStatus(value: string | null): MedicationStatus | '' {
  if (value === 'AVAILABLE' || value === 'OUT_OF_STOCK' || value === 'UNAVAILABLE') {
    return value;
  }

  return '';
}

function normalizePage(value: string | null) {
  const page = Number(value);
  return Number.isInteger(page) && page > 0 ? page : 1;
}

export default function MedicationBrowser() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { data: locations = [] } = useLocations();
  const { data: currentUser } = useCurrentUser();

  const [search, setSearch] = useState(() => searchParams.get('search') || '');
  const [statusFilter, setStatusFilter] = useState<MedicationStatus | ''>(() =>
    normalizeStatus(searchParams.get('status'))
  );
  const [locationFilter, setLocationFilter] = useState(() => searchParams.get('locationId') || '');
  const [page, setPage] = useState(() => normalizePage(searchParams.get('page')));
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedMedication, setSelectedMedication] = useState<MedicationListItem | null>(null);

  const debouncedSearch = useDebouncedValue(search, 300);
  const isManager = currentUser?.role === 'MEDICATION_MANAGER';
  const isViewer = currentUser?.role === 'VIEWER';
  const managerDepartmentId = currentUser?.departmentId || '';
  const effectiveLocationFilter = isManager ? managerDepartmentId || undefined : locationFilter || undefined;

  useEffect(() => {
    setSearch(searchParams.get('search') || '');
    setStatusFilter(normalizeStatus(searchParams.get('status')));
    setLocationFilter(searchParams.get('locationId') || '');
    setPage(normalizePage(searchParams.get('page')));
  }, [searchParams]);

  useEffect(() => {
    const params = new URLSearchParams();

    if (debouncedSearch) {
      params.set('search', debouncedSearch);
    }

    if (statusFilter) {
      params.set('status', statusFilter);
    }

    const nextLocationFilter = isManager ? managerDepartmentId : locationFilter;
    if (nextLocationFilter) {
      params.set('locationId', nextLocationFilter);
    }

    if (page > 1) {
      params.set('page', String(page));
    }

    const nextQuery = params.toString();
    const currentQuery = searchParams.toString();

    if (nextQuery !== currentQuery) {
      router.replace(`${pathname}${nextQuery ? `?${nextQuery}` : ''}`, { scroll: false });
    }
  }, [debouncedSearch, statusFilter, locationFilter, page, isManager, managerDepartmentId, pathname, router, searchParams]);

  const { data, isLoading, isFetching, error, refetch } = useMedications({
    search: debouncedSearch || undefined,
    status: statusFilter || undefined,
    locationId: effectiveLocationFilter,
    page,
    limit: 10,
  });
  const { data: summaryData } = useDashboardSummary(effectiveLocationFilter);

  const createMedication = useCreateMedication();
  const changeStatus = useChangeMedicationStatus(selectedMedication?.id || '');

  const medications = data?.data || [];
  const total = data?.meta?.total || 0;
  const totalPages = Math.max(1, Math.ceil(total / 10));
  const summaryCards = [
    { label: 'Total', value: summaryData?.totalMedications ?? 0, filter: '' as MedicationStatus | '' },
    { label: 'Available', value: summaryData?.availableCount ?? 0, filter: 'AVAILABLE' as MedicationStatus },
    { label: 'NEAR STOCK OUT', value: summaryData?.outOfStockCount ?? 0, filter: 'OUT_OF_STOCK' as MedicationStatus },
    { label: 'STOCK OUT', value: summaryData?.unavailableCount ?? 0, filter: 'UNAVAILABLE' as MedicationStatus },
  ];

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const columns: Column<MedicationListItem>[] = [
    { header: 'Generic Name', accessor: 'genericName' },
    { header: 'Strength', accessor: 'strength' },
    { header: 'Dosage Form', accessor: 'dosageForm' },
    {
      header: 'Status',
      accessor: (medication) => <MedicationStatusBadge status={medication.status} />,
    },
    { header: 'Location', accessor: (medication) => medication.location.name },
    {
      header: 'Updated At',
      accessor: (medication) => new Date(medication.updatedAt).toLocaleDateString(),
    },
  ];

  const handleReset = () => {
    setSearch('');
    setStatusFilter('');
    setLocationFilter(isManager ? managerDepartmentId : '');
    setPage(1);
  };

  const handleCreateMedication = async (input: CreateMedicationInput) => {
    try {
      await createMedication.mutateAsync(input);
      setShowCreateModal(false);
      toast.success('Medication created successfully');
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to create medication'));
    }
  };

  const handleInlineStatusChange = async (newStatus: MedicationStatus, reason: string) => {
    if (!selectedMedication) {
      return;
    }

    try {
      await changeStatus.mutateAsync({ newStatus, reason });
      setSelectedMedication(null);
      toast.success('Medication status updated');
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to update medication status'));
    }
  };

  const handleLocationFilterChange = (value: string) => {
    setLocationFilter(value);
    setPage(1);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Medications"
        actions={
          !isViewer ? (
            <Button onClick={() => setShowCreateModal(true)}>
              Add Medication
            </Button>
          ) : undefined
        }
      />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {summaryCards.map((item) => (
          <Card
            key={item.label}
            className={`border-slate-200 transition-all ${
              statusFilter === item.filter ? 'border-primary ring-2 ring-primary/20 bg-[#f5fafe]' : 'hover:border-primary/40'
            }`}
          >
            <CardContent className="p-4">
              <button
                type="button"
                onClick={() => {
                  setStatusFilter(item.filter);
                  setPage(1);
                }}
                className="w-full text-left"
              >
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">{item.label}</p>
                <p className="mt-2 text-2xl font-bold text-slate-900">{item.value}</p>
              </button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-[minmax(0,1.9fr),minmax(240px,1fr),auto]">
            <div className="sm:col-span-2 xl:col-span-1">
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Search</label>
              <Input
                placeholder="Search by generic name, strength, or dosage form..."
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setPage(1);
                }}
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Department</label>
              <select
                value={isManager ? managerDepartmentId : locationFilter}
                onChange={(event) => handleLocationFilterChange(event.target.value)}
                className="flex h-10 w-full rounded-lg border border-input bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35"
                disabled={isManager}
              >
                {!isManager ? <option value="">{isViewer ? 'Assigned Departments' : 'All Departments'}</option> : null}
                {locations.map((location) => (
                  <option key={location.id} value={location.id}>
                    {location.name}
                  </option>
                ))}
              </select>
            </div>

            <Button variant="secondary" onClick={handleReset} className="w-full xl:w-auto">
              Reset
            </Button>
          </div>

          <div className="mt-6">
            {error ? (
              <ErrorState message="Failed to load medications" onRetry={refetch} />
            ) : isLoading ? (
              <LoadingState message="Loading medications..." />
            ) : medications.length === 0 ? (
              <EmptyState
                title="No medications found"
                description="Try adjusting your filters or add a new medication."
                action={
                  !isViewer ? (
                    <Button onClick={() => setShowCreateModal(true)}>
                      Add Medication
                    </Button>
                  ) : undefined
                }
              />
            ) : (
              <>
                {isFetching ? (
                  <p className="mb-4 text-sm text-slate-600">Updating medications...</p>
                ) : null}

                <div className="space-y-3 md:hidden">
                  {medications.map((medication) => (
                    <Card key={medication.id} className="overflow-hidden border-slate-200">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <h3 className="mt-1 text-base font-semibold text-slate-900">
                              {medication.genericName}
                            </h3>
                            <p className="mt-1 text-sm text-slate-500">
                              {medication.strength} • {medication.dosageForm}
                            </p>
                          </div>
                          <MedicationStatusBadge status={medication.status} className="shrink-0" />
                        </div>

                        <div className="mt-4 space-y-3 rounded-xl bg-slate-50 p-3">
                          <div className="flex items-center justify-between gap-3 text-sm">
                            <span className="text-slate-500">Department</span>
                            <span className="text-right font-medium text-slate-900">
                              {medication.location.name}
                            </span>
                          </div>
                          <div className="flex items-center justify-between gap-3 text-sm">
                            <span className="text-slate-500">Strength</span>
                            <span className="text-right font-medium text-slate-900">
                              {medication.strength}
                            </span>
                          </div>
                          <div className="flex items-center justify-between gap-3 text-sm">
                            <span className="text-slate-500">Updated</span>
                            <span className="text-right font-medium text-slate-900">
                              {new Date(medication.updatedAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>

                        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                          {!isViewer ? (
                            <Button
                              variant="outline"
                              className="w-full sm:flex-1"
                              onClick={() => setSelectedMedication(medication)}
                            >
                              Change Status
                            </Button>
                          ) : null}
                          <Button
                            variant={isViewer ? 'primary' : 'secondary'}
                            className="w-full sm:flex-1"
                            onClick={() => router.push(`${ROUTES.MEDICATIONS}/${medication.id}`)}
                          >
                            {isViewer ? 'View Details' : 'Details'}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <div className="hidden md:block">
                  <DataTable
                    columns={columns}
                    data={medications}
                    onRowClick={(medication) => router.push(`${ROUTES.MEDICATIONS}/${medication.id}`)}
                    actions={(medication) => (
                      <div className="flex items-center justify-end gap-2">
                        {!isViewer ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedMedication(medication)}
                          >
                            Change Status
                          </Button>
                        ) : null}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => router.push(`${ROUTES.MEDICATIONS}/${medication.id}`)}
                        >
                          {isViewer ? 'View' : 'Details'}
                        </Button>
                      </div>
                    )}
                  />
                </div>

                <div className="mt-6 flex flex-col gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm text-slate-500">
                    Showing <span className="font-medium text-slate-900">{medications.length}</span> of{' '}
                    <span className="font-medium text-slate-900">{total}</span> medications
                  </p>
                  <div className="grid grid-cols-3 gap-2 sm:flex">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((currentPage) => Math.max(1, currentPage - 1))}
                      disabled={page === 1}
                    >
                      Previous
                    </Button>
                    <div className="flex items-center justify-center rounded-md border border-slate-200 px-4 text-sm font-medium text-slate-700">
                      Page {page} of {totalPages}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((currentPage) => Math.min(totalPages, currentPage + 1))}
                      disabled={page >= totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {showCreateModal ? (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-950/50 p-4 md:p-8">
          <div className="w-full max-w-4xl">
            <MedicationForm
              mode="create"
              onSubmit={handleCreateMedication}
              loading={createMedication.isPending}
              availableLocations={locations}
              currentUser={currentUser}
              onCancel={() => setShowCreateModal(false)}
            />
          </div>
        </div>
      ) : null}

      {selectedMedication ? (
        <ChangeStatusModal
          currentStatus={selectedMedication.status}
          onSubmit={handleInlineStatusChange}
          onClose={() => setSelectedMedication(null)}
          loading={changeStatus.isPending}
        />
      ) : null}
    </div>
  );
}
