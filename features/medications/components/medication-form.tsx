'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { getApiErrorMessage } from '@/lib/api-client';
import { MedicationStatus, CreateMedicationInput, Location } from '../types';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { CurrentUser } from '@/features/auth/types';

const medicationSchema = z.object({
  genericName: z.string().min(1, 'Generic name is required'),
  strength: z.string().min(1, 'Strength is required'),
  dosageForm: z.string().min(1, 'Dosage form is required'),
  locationId: z.string().min(1, 'Location is required'),
  status: z.enum(['AVAILABLE', 'OUT_OF_STOCK', 'UNAVAILABLE'] as const),
});

type MedicationFormValues = z.infer<typeof medicationSchema>;

interface MedicationFormProps {
  mode: 'create' | 'edit';
  initialValues?: Partial<CreateMedicationInput>;
  onSubmit: (data: MedicationFormValues) => Promise<void>;
  loading?: boolean;
  availableLocations: Location[];
  currentUser?: CurrentUser | null;
  onCancel?: () => void;
}

export default function MedicationForm({
  mode,
  initialValues,
  onSubmit,
  loading,
  availableLocations,
  currentUser,
  onCancel,
}: MedicationFormProps) {
  const router = useRouter();
  const [submitError, setSubmitError] = useState('');

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<MedicationFormValues>({
    resolver: zodResolver(medicationSchema),
    defaultValues: {
      genericName: initialValues?.genericName || '',
      strength: initialValues?.strength || '',
      dosageForm: initialValues?.dosageForm || '',
      locationId: initialValues?.locationId || '',
      status: (initialValues?.status as any) || 'AVAILABLE',
    },
  });

  const isManager = currentUser?.role === 'MEDICATION_MANAGER';
  const managerDepartmentId = currentUser?.departmentId || '';
  const locationSelectionLocked = isManager && !!managerDepartmentId;

  useEffect(() => {
    if (locationSelectionLocked) {
      setValue('locationId', managerDepartmentId);
    }
  }, [locationSelectionLocked, managerDepartmentId, setValue]);

  const handleFormSubmit = async (data: MedicationFormValues) => {
    setSubmitError('');
    try {
      await onSubmit(data);
      toast.success(`Medication ${mode === 'create' ? 'created' : 'updated'} successfully`);
    } catch (err) {
      setSubmitError(getApiErrorMessage(err, 'Failed to save medication'));
    }
  };

  const isFormLoading = loading || isSubmitting;

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          {submitError && (
            <div className="rounded-md bg-danger/10 p-3 text-sm text-danger">
              {submitError}
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-semibold">Generic Name *</label>
              <Input
                {...register('genericName')}
                placeholder="Paracetamol"
                disabled={isFormLoading}
                error={!!errors.genericName}
              />
              {errors.genericName && <p className="text-xs text-danger">{errors.genericName.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold">Strength *</label>
              <Input
                {...register('strength')}
                placeholder="500mg"
                disabled={isFormLoading}
                error={!!errors.strength}
              />
              {errors.strength && <p className="text-xs text-danger">{errors.strength.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold">Dosage Form *</label>
              <Input
                {...register('dosageForm')}
                placeholder="Tablet"
                disabled={isFormLoading}
                error={!!errors.dosageForm}
              />
              {errors.dosageForm && <p className="text-xs text-danger">{errors.dosageForm.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold">Location *</label>
              <select
                {...register('locationId')}
                className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-50"
                disabled={isFormLoading || locationSelectionLocked}
              >
                <option value="">Select a location</option>
                {availableLocations.map((location) => (
                  <option key={location.id} value={location.id}>
                    {location.name}
                  </option>
                ))}
              </select>
              {errors.locationId && <p className="text-xs text-danger">{errors.locationId.message}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold">Status</label>
            <select
              {...register('status')}
              className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-50"
              disabled={isFormLoading}
            >
              <option value="AVAILABLE">Available</option>
              <option value="OUT_OF_STOCK">NEAR STOCK OUT</option>
              <option value="UNAVAILABLE">STOCK OUT</option>
            </select>
          </div>

          <div className="flex gap-4 pt-4">
            <Button type="submit" loading={isFormLoading} className="flex-1">
              {mode === 'create' ? 'Create Medication' : 'Save Changes'}
            </Button>
            <Button
              variant="outline"
              onClick={() => (onCancel ? onCancel() : router.back())}
              disabled={isFormLoading}
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
