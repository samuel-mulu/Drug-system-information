'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  useMedications,
  useLocations,
  useCreateMedication,
  useChangeMedicationStatus,
} from '@/features/medications/hooks';
import { MedicationStatus, Medication, CreateMedicationInput } from '@/features/medications/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import DataTable, { Column } from '@/components/ui/data-table';
import { PageHeader } from '@/components/ui/page-header';
import { useDebouncedValue } from '@/lib/debounce';
import { useCurrentUser } from '@/features/auth/hooks/useCurrentUser';
import MedicationForm from '@/features/medications/components/medication-form';
import ChangeStatusModal from '@/features/medications/components/change-status-modal';
import toast from 'react-hot-toast';
import { getApiErrorMessage } from '@/lib/api-client';

export default function MedicationsPage() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [page, setPage] = useState(1);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedMedication, setSelectedMedication] = useState<Medication | null>(null);
  const debouncedSearch = useDebouncedValue(search, 300);
  const { data: locationsData } = useLocations();
  const { data: currentUser } = useCurrentUser();
  const isManager = currentUser?.role === 'MEDICATION_MANAGER';
  const isViewer = currentUser?.role === 'VIEWER';
  const managerDepartmentId = currentUser?.departmentId || '';
  const createMedication = useCreateMedication();
  const changeStatus = useChangeMedicationStatus(selectedMedication?.id || '');

  const effectiveLocationFilter = isManager ? managerDepartmentId || undefined : locationFilter || undefined;

  const { data, isLoading } = useMedications({
    search: debouncedSearch || undefined,
    status: (statusFilter as MedicationStatus) || undefined,
    locationId: effectiveLocationFilter,
    page,
    limit: 10,
  });

  const medications = data?.data || [];
  const total = data?.meta?.total || 0;
  const totalPages = Math.ceil(total / 10);
  const locations = locationsData?.data || [];

  const columns: Column<Medication>[] = [
    { header: 'Code', accessor: 'code' },
    { header: 'Generic Name', accessor: 'genericName' },
    { header: 'Brand Name', accessor: 'brandName' },
    { 
      header: 'Status', 
      accessor: (med) => (
        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
          med.status === 'AVAILABLE' 
            ? 'bg-success/10 text-success' 
            : med.status === 'OUT_OF_STOCK'
            ? 'bg-warning/10 text-warning'
            : 'bg-danger/10 text-danger'
        }`}>
          {med.status.replace('_', ' ')}
        </span>
      ) 
    },
    { header: 'Location', accessor: (med) => med.location.name },
    { 
      header: 'Updated At', 
      accessor: (med) => new Date(med.updatedAt).toLocaleDateString() 
    },
  ];

  const handleReset = () => {
    setSearch('');
    setStatusFilter('');
    setLocationFilter(isManager ? managerDepartmentId : '');
    setPage(1);
  };

  const handleCreateMedication = async (data: CreateMedicationInput) => {
    try {
      await createMedication.mutateAsync(data);
      setShowCreateModal(false);
      toast.success('Medication created successfully');
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to create medication'));
    }
  };

  const handleInlineStatusChange = async (newStatus: MedicationStatus, reason: string) => {
    if (!selectedMedication) return;
    try {
      await changeStatus.mutateAsync({ newStatus, reason });
      setSelectedMedication(null);
      toast.success('Medication status updated');
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to update medication status'));
    }
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

      <Card>
        <CardContent className="pt-6">
          <div className="mb-6 flex flex-wrap gap-4 items-end">
            <div className="flex-1 min-w-[200px]">
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Search</label>
              <Input
                placeholder="Search by code, name, or brand..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="min-w-[150px]">
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <option value="">All Status</option>
                <option value="AVAILABLE">Available</option>
                <option value="OUT_OF_STOCK">Out of Stock</option>
                <option value="UNAVAILABLE">Unavailable</option>
              </select>
            </div>

            <div className="min-w-[150px]">
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Location</label>
              <select
                value={isManager ? managerDepartmentId : locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                disabled={isManager}
              >
                {!isManager && <option value="">All Locations</option>}
                {locations.map((location) => (
                  <option key={location.id} value={location.id}>
                    {location.name}
                  </option>
                ))}
              </select>
            </div>

            <Button variant="secondary" onClick={handleReset}>
              Reset
            </Button>
          </div>

          <DataTable
            columns={columns}
            data={medications}
            isLoading={isLoading}
            onRowClick={(med) => router.push(`/medications/${med.id}`)}
            emptyTitle="No medications found"
            emptyDescription="Try adjusting your filters or add a new medication."
            actions={(med) => (
              <div className="flex items-center gap-2">
                {!isViewer && (
                  <Button variant="outline" size="sm" onClick={() => setSelectedMedication(med)}>
                    Change Status
                  </Button>
                )}
                <Button variant="ghost" size="sm" onClick={() => router.push(`/medications/${med.id}`)}>
                  {isViewer ? 'View' : 'Details'}
                </Button>
              </div>
            )}
          />

          {total > 0 && (
            <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-6">
              <p className="text-sm text-slate-500">
                Showing <span className="font-medium text-slate-900">{medications.length}</span> of <span className="font-medium text-slate-900">{total}</span> medications
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  Previous
                </Button>
                <div className="flex items-center px-4 text-sm font-medium">
                  Page {page} of {totalPages}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {showCreateModal && (
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
      )}

      {selectedMedication && (
        <ChangeStatusModal
          currentStatus={selectedMedication.status}
          onSubmit={handleInlineStatusChange}
          onClose={() => setSelectedMedication(null)}
          loading={changeStatus.isPending}
        />
      )}
    </div>
  );
}
