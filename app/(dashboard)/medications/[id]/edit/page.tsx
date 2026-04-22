'use client';

import { useRouter } from 'next/navigation';
import { PageHeader } from '../../../../../components/ui/page-header';
import { Button } from '../../../../../components/ui/button';
import LoadingState from '../../../../../components/ui/loading-state';
import MedicationForm from '../../../../../features/medications/components/medication-form';
import { useMedication, useUpdateMedication, useLocations } from '../../../../../features/medications/hooks';
import { UpdateMedicationInput } from '../../../../../features/medications/types';
import { useCurrentUser } from '../../../../../features/auth/hooks/useCurrentUser';

export default function EditMedicationPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { data: medication, isLoading } = useMedication(params.id);
  const updateMedication = useUpdateMedication(params.id);
  const { data: locations = [], isLoading: locationsLoading } = useLocations();
  const { data: currentUser, isLoading: userLoading } = useCurrentUser();

  const handleSubmit = async (data: UpdateMedicationInput) => {
    await updateMedication.mutateAsync(data);
    router.push(`/medications/${params.id}`);
  };

  if (isLoading || locationsLoading || userLoading) {
    return (
      <div>
        <PageHeader title="Edit Medication" />
        <LoadingState message="Loading medication..." />
      </div>
    );
  }

  if (!medication) {
    return (
      <div>
        <PageHeader title="Edit Medication" />
        <div style={{ padding: '16px' }}>Medication not found</div>
      </div>
    );
  }

  const med = medication;

  return (
    <div>
      <PageHeader
        title={`Edit ${med.genericName}`}
        actions={
          <Button variant="secondary" onClick={() => router.back()}>
            Cancel
          </Button>
        }
      />
      <MedicationForm
        mode="edit"
        initialValues={{
          genericName: med.genericName,
          strength: med.strength,
          dosageForm: med.dosageForm,
          locationId: med.locationId,
          status: med.status,
        }}
        onSubmit={handleSubmit}
        loading={updateMedication.isPending}
        availableLocations={locations}
        currentUser={currentUser}
      />
    </div>
  );
}
