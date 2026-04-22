'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import LoadingState from '@/components/ui/loading-state';
import ErrorState from '@/components/ui/error-state';
import DataTable, { Column } from '@/components/ui/data-table';
import { useMedication, useMedicationStatusHistory, useChangeMedicationStatus } from '@/features/medications/hooks';
import { useCurrentUser } from '@/features/auth/hooks/useCurrentUser';
import ChangeStatusModal from '@/features/medications/components/change-status-modal';
import MedicationStatusBadge from '@/features/medications/components/medication-status-badge';
import { MedicationStatus, StatusHistoryRecord } from '@/features/medications/types';
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

  const historyColumns: Column<StatusHistoryRecord>[] = [
    {
      header: 'Status Change',
      accessor: (history) => (
        <div className="flex items-center gap-2">
          <MedicationStatusBadge status={history.oldStatus as MedicationStatus} className="px-2 py-0.5" />
          <span className="text-slate-400">-&gt;</span>
          <MedicationStatusBadge status={history.newStatus as MedicationStatus} className="px-2 py-0.5" />
        </div>
      ),
    },
    {
      header: 'Reason',
      accessor: (history) =>
        history.reason || <span className="text-slate-400 italic">No reason provided</span>,
    },
    { header: 'Changed By', accessor: (history) => history.changedBy.fullName },
    { header: 'Date', accessor: (history) => new Date(history.changedAt).toLocaleString() },
  ];

  const infoItems = [
    { label: 'Status', value: <MedicationStatusBadge status={med.status} /> },
    { label: 'Generic Name', value: med.genericName },
    { label: 'Strength', value: med.strength },
    { label: 'Dosage Form', value: med.dosageForm },
    { label: 'Location', value: med.location.name },
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
        title={med.genericName}
        actions={
          <div className="flex gap-3">
            {canEdit ? (
              <>
                <Button variant="outline" onClick={() => router.push(`/medications/${params.id}/edit`)}>
                  Edit Details
                </Button>
                <Button onClick={() => setShowStatusModal(true)}>
                  Change Status
                </Button>
              </>
            ) : null}
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
            <div className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
              {infoItems.map((item, index) => (
                <div key={index} className={item.fullWidth ? 'sm:col-span-2' : ''}>
                  <dt className="text-sm font-medium text-slate-500">{item.label}</dt>
                  <dd className="mt-1 text-sm font-semibold text-slate-900">{item.value}</dd>
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
              <dd className="mt-1 text-sm font-semibold text-slate-900">
                {new Date(med.createdAt).toLocaleString()}
                <p className="text-xs font-normal text-slate-400">by {med.createdBy.fullName}</p>
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-slate-500">Last Updated</dt>
              <dd className="mt-1 text-sm font-semibold text-slate-900">
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

      {showStatusModal ? (
        <ChangeStatusModal
          currentStatus={med.status}
          onSubmit={handleStatusChange}
          onClose={() => setShowStatusModal(false)}
          loading={changeStatus.isPending}
        />
      ) : null}
    </div>
  );
}
