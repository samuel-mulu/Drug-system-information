'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { getApiErrorMessage } from '@/lib/api-client';
import { CreateUserInput, Role } from '../types';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { Location } from '@/features/medications/types';

function getUserSchema(mode: 'create' | 'edit') {
  return z.object({
    fullName: z.string().min(1, 'Full name is required'),
    email: z.string().min(1, 'Email is required').email('Invalid email address'),
    password:
      mode === 'create'
        ? z.string().min(6, 'Password must be at least 6 characters')
        : z.string().min(6, 'Password must be at least 6 characters').optional().or(z.literal('')),
    roleId: z.string().min(1, 'Role is required'),
    departmentId: z.string().optional(),
    departmentIds: z.array(z.string()).max(2, 'Viewer can only be assigned up to 2 departments'),
  });
}

type UserFormValues = z.infer<ReturnType<typeof getUserSchema>>;

interface UserFormProps {
  mode: 'create' | 'edit';
  initialValues?: Partial<CreateUserInput>;
  onSubmit: (data: UserFormValues) => Promise<void>;
  loading?: boolean;
  availableRoles: Role[];
  availableDepartments: Location[];
}

export default function UserForm({
  mode,
  initialValues,
  onSubmit,
  loading,
  availableRoles,
  availableDepartments,
}: UserFormProps) {
  const router = useRouter();
  const [submitError, setSubmitError] = useState('');

  const {
    register,
    handleSubmit,
    watch,
    setError,
    clearErrors,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<UserFormValues>({
    resolver: zodResolver(getUserSchema(mode)),
    defaultValues: {
      fullName: initialValues?.fullName || '',
      email: initialValues?.email || '',
      password: '',
      roleId: initialValues?.roleId || '',
      departmentId: initialValues?.departmentId || '',
      departmentIds: initialValues?.departmentIds || [],
    },
  });

  const selectedRoleId = watch('roleId');
  const selectedViewerDepartmentIds = watch('departmentIds') || [];
  const selectedRole = availableRoles.find((role) => role.id === selectedRoleId);
  const isManagerRole = selectedRole?.name === 'MEDICATION_MANAGER';
  const isViewerRole = selectedRole?.name === 'VIEWER';

  useEffect(() => {
    if (!isManagerRole) {
      setValue('departmentId', '', { shouldDirty: false, shouldValidate: false });
      clearErrors('departmentId');
    }

    if (!isViewerRole) {
      setValue('departmentIds', [], { shouldDirty: false, shouldValidate: false });
      clearErrors('departmentIds');
    }
  }, [clearErrors, isManagerRole, isViewerRole, setValue]);

  const toggleViewerDepartment = (departmentId: string) => {
    const isSelected = selectedViewerDepartmentIds.includes(departmentId);

    if (isSelected) {
      setValue(
        'departmentIds',
        selectedViewerDepartmentIds.filter((id) => id !== departmentId),
        { shouldDirty: true, shouldValidate: true }
      );
      clearErrors('departmentIds');
      return;
    }

    if (selectedViewerDepartmentIds.length >= 2) {
      setError('departmentIds', { message: 'Viewer can only be assigned up to 2 departments' });
      return;
    }

    setValue('departmentIds', [...selectedViewerDepartmentIds, departmentId], {
      shouldDirty: true,
      shouldValidate: true,
    });
    clearErrors('departmentIds');
  };

  const handleFormSubmit = async (data: UserFormValues) => {
    setSubmitError('');

    if (isManagerRole && !data.departmentId) {
      setError('departmentId', { message: 'Department is required for medication manager users' });
      return;
    }

    if (isViewerRole && data.departmentIds.length === 0) {
      setError('departmentIds', { message: 'Select at least 1 department for viewer users' });
      return;
    }

    const submissionData: UserFormValues = {
      ...data,
      departmentId: isManagerRole ? data.departmentId : '',
      departmentIds: isViewerRole ? data.departmentIds : [],
    };

    if (mode === 'edit' && !submissionData.password) {
      delete submissionData.password;
    }

    try {
      await onSubmit(submissionData);
      toast.success(`User ${mode === 'create' ? 'created' : 'updated'} successfully`);
    } catch (err) {
      setSubmitError(getApiErrorMessage(err, 'Failed to save user'));
    }
  };

  const isFormLoading = loading || isSubmitting;

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          {submitError ? (
            <div className="rounded-md bg-danger/10 p-3 text-sm text-danger">
              {submitError}
            </div>
          ) : null}

          <div className="space-y-2">
            <label className="text-sm font-semibold">Full Name *</label>
            <Input
              {...register('fullName')}
              placeholder="John Doe"
              disabled={isFormLoading}
              error={!!errors.fullName}
            />
            {errors.fullName ? <p className="text-xs text-danger">{errors.fullName.message}</p> : null}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold">Email *</label>
            <Input
              {...register('email')}
              type="email"
              placeholder="john@example.com"
              disabled={isFormLoading}
              error={!!errors.email}
            />
            {errors.email ? <p className="text-xs text-danger">{errors.email.message}</p> : null}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold">
              Password {mode === 'create' ? '*' : '(Leave blank to keep current)'}
            </label>
            <Input
              {...register('password')}
              type="password"
              placeholder="********"
              disabled={isFormLoading}
              error={!!errors.password}
            />
            {errors.password ? <p className="text-xs text-danger">{errors.password.message}</p> : null}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold">Role *</label>
            <select
              {...register('roleId')}
              className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-50"
              disabled={isFormLoading}
            >
              <option value="">Select a role</option>
              {availableRoles.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.name.toLowerCase().replaceAll('_', ' ')}
                </option>
              ))}
            </select>
            {errors.roleId ? <p className="text-xs text-danger">{errors.roleId.message}</p> : null}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold">Department {isManagerRole ? '*' : '(Manager only)'}</label>
            <select
              {...register('departmentId')}
              className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-50"
              disabled={isFormLoading || !isManagerRole}
            >
              <option value="">Select a department</option>
              {availableDepartments.map((department) => (
                <option key={department.id} value={department.id}>
                  {department.name}
                </option>
              ))}
            </select>
            {errors.departmentId ? <p className="text-xs text-danger">{errors.departmentId.message}</p> : null}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between gap-3">
              <label className="text-sm font-semibold">Viewer Departments {isViewerRole ? '*' : '(Viewer only)'}</label>
              <span className="text-xs text-slate-500">{selectedViewerDepartmentIds.length}/2 selected</span>
            </div>

            <div className="grid gap-2 sm:grid-cols-2">
              {availableDepartments.map((department) => {
                const isSelected = selectedViewerDepartmentIds.includes(department.id);
                const isOptionDisabled =
                  isFormLoading || !isViewerRole || (!isSelected && selectedViewerDepartmentIds.length >= 2);

                return (
                  <label
                    key={department.id}
                    className={`flex items-start gap-3 rounded-lg border p-3 text-sm transition ${
                      isSelected
                        ? 'border-primary bg-primary/5 text-slate-900'
                        : 'border-slate-200 bg-white text-slate-700'
                    } ${isOptionDisabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer hover:border-primary/40'}`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleViewerDepartment(department.id)}
                      disabled={isOptionDisabled}
                      className="mt-1 h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary"
                    />
                    <span className="font-medium">{department.name}</span>
                  </label>
                );
              })}
            </div>

            <p className="text-xs text-slate-500">
              Viewer users can access only the 1 or 2 departments selected here.
            </p>
            {errors.departmentIds ? (
              <p className="text-xs text-danger">{errors.departmentIds.message}</p>
            ) : null}
          </div>

          <div className="flex gap-4 pt-4">
            <Button type="submit" loading={isFormLoading} className="flex-1">
              {mode === 'create' ? 'Create User' : 'Save Changes'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
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
