'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import LoadingState from '@/components/ui/loading-state';
import ErrorState from '@/components/ui/error-state';
import { useMedication, useMedicationStatusHistory, useChangeMedicationStatus } from '@/features/medications/hooks';
import { useCurrentUser } from '@/features/auth/hooks/useCurrentUser';
import ChangeStatusModal from '@/features/medications/components/change-status-modal';
import { MedicationStatus } from '@/features/medications/types';
import DataTable, { Column } from '@/components/ui/data-table';
import { getApiErrorMessage } from '@/lib/api-client';
import toast from 'react-hot-toast';

export default function MedicationDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [showStatusModal, setShowStatusModal] = useState(false);
  const { data: medication, isLoading, error, refetch } = useMedication(params.id);
  const { data: statusHistory, isLoading: isLoadingHistory } = useMedicationStatusHistory(params.id);
  const { data: currentUser } = useCurrentUser();
  const changeStatus = useChangeMedicationStatus(params.id);

  const canEdit = currentUser?.role === 'SYSTEM_ADMIN' || currentUser?.role === 'MEDICATION_MANAGER';

  const getStatusColor = (status: MedicationStatus) => {
    switch (status) {
      case 'AVAILABLE': return 'bg-success/10 text-success';
      case 'OUT_OF_STOCK': return 'bg-warning/10 text-warning';
      case 'UNAVAILABLE': return 'bg-danger/10 text-danger';
      default: return 'bg-slate-100 text-slate-600';
    }
  };

  if (isLoading) {
    return <LoadingState message="Loading medication details..." />;
  }

  if (error || !medication) {
    return (
      <ErrorState 
        message="Failed to load medication details. It may have been deleted or you don't have permission." 
        onRetry={refetch}
      />
    );
  }

  const med = medication;

  const historyColumns: Column<any>[] = [
    { 
      header: 'Status Change', 
      accessor: (h) => (
        <div className="flex items-center gap-2">
          <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${getStatusColor(h.oldStatus)}`}>
            {h.oldStatus}
          </span>
          <span className="text-slate-400">→</span>
          <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${getStatusColor(h.newStatus)}`}>
            {h.newStatus}
          </span>
        </div>
      )
    },
    { header: 'Reason', accessor: (h) => h.reason || <span className="text-slate-400 italic">No reason provided</span> },
    { header: 'Changed By', accessor: (h) => h.changedBy.fullName },
    { header: 'Date', accessor: (h) => new Date(h.changedAt).toLocaleString() },
  ];

  const infoItems = [
    { label: 'Code', value: med.code },
    { label: 'Status', value: (
      <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusColor(med.status)}`}>
        {med.status.replace('_', ' ')}
      </span>
    )},
    { label: 'Generic Name', value: med.genericName },
    { label: 'Brand Name', value: med.brandName },
    { label: 'Strength', value: med.strength },
    { label: 'Dosage Form', value: med.dosageForm },
    { label: 'Category', value: med.category },
    { label: 'Manufacturer', value: med.manufacturer },
    { label: 'Location', value: med.location.name },
    { label: 'Description', value: med.description || 'N/A', fullWidth: true },
  ];

  const handleStatusChange = async (newStatus: MedicationStatus, reason: string) => {
    try {
      await changeStatus.mutateAsync({ newStatus, reason });
      toast.success('Status updated successfully');
      setShowStatusModal(false);
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to update status'));
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={`${med.code} - ${med.genericName}`}
        actions={
          <div className="flex gap-3">
            {canEdit && (
              <>
                <Button variant="outline" onClick={() => router.push(`/medications/${params.id}/edit`)}>
                  Edit Details
                </Button>
                <Button onClick={() => setShowStatusModal(true)}>
                  Change Status
                </Button>
              </>
            )}
            <Button variant="secondary" onClick={() => router.back()}>
              Back
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <h3 className="text-lg font-bold text-slate-900">Information</h3>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
              {infoItems.map((item, i) => (
                <div key={i} className={item.fullWidth ? 'sm:col-span-2' : ''}>
                  <dt className="text-sm font-medium text-slate-500">{item.label}</dt>
                  <dd className="mt-1 text-sm text-slate-900 font-semibold">{item.value}</dd>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h3 className="text-lg font-bold text-slate-900">Metadata</h3>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <dt className="text-sm font-medium text-slate-500">Created</dt>
              <dd className="mt-1 text-sm text-slate-900 font-semibold">
                {new Date(med.createdAt).toLocaleString()}
                <p className="text-xs font-normal text-slate-400">by {med.createdBy.fullName}</p>
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-slate-500">Last Updated</dt>
              <dd className="mt-1 text-sm text-slate-900 font-semibold">
                {new Date(med.updatedAt).toLocaleString()}
                <p className="text-xs font-normal text-slate-400">by {med.updatedBy.fullName}</p>
              </dd>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader>
            <h3 className="text-lg font-bold text-slate-900">Status History</h3>
          </CardHeader>
          <CardContent>
            <DataTable
              columns={historyColumns}
              data={statusHistory || []}
              isLoading={isLoadingHistory}
              emptyTitle="No status history"
              emptyDescription="This medication has not had any status changes yet."
            />
          </CardContent>
        </Card>
      </div>

      {showStatusModal && (
        <ChangeStatusModal
          currentStatus={med.status}
          onSubmit={handleStatusChange}
          onClose={() => setShowStatusModal(false)}
          loading={changeStatus.isPending}
        />
      )}
    </div>
  );
}
