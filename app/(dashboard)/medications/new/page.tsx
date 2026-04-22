'use client';

import { useRouter } from 'next/navigation';
import { PageHeader } from '../../../../components/ui/page-header';
import { Button } from '../../../../components/ui/button';
import LoadingState from '../../../../components/ui/loading-state';
import MedicationForm from '../../../../features/medications/components/medication-form';
import { useCreateMedication, useLocations } from '../../../../features/medications/hooks';
import { CreateMedicationInput } from '../../../../features/medications/types';
import { useCurrentUser } from '../../../../features/auth/hooks/useCurrentUser';

export default function NewMedicationPage() {
  const router = useRouter();
  const createMedication = useCreateMedication();
  const { data: locations = [], isLoading: locationsLoading } = useLocations();
  const { data: currentUser, isLoading: userLoading } = useCurrentUser();

  const handleSubmit = async (data: CreateMedicationInput) => {
    await createMedication.mutateAsync(data);
    router.push('/medications');
  };

  if (locationsLoading || userLoading) {
    return <LoadingState message="Loading medication form..." />;
  }

  return (
    <div>
      <PageHeader
        title="Create Medication"
        actions={
          <Button variant="secondary" onClick={() => router.back()}>
            Cancel
          </Button>
        }
      />
      <MedicationForm
        mode="create"
        onSubmit={handleSubmit}
        loading={createMedication.isPending}
        availableLocations={locations}
        currentUser={currentUser}
      />
    </div>
  );
}
