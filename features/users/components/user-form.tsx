'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { getApiErrorMessage } from '@/lib/api-client';
import { CreateUserInput, UpdateUserInput, Role } from '../types';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
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
    formState: { errors, isSubmitting },
  } = useForm<UserFormValues>({
    resolver: zodResolver(getUserSchema(mode)),
    defaultValues: {
      fullName: initialValues?.fullName || '',
      email: initialValues?.email || '',
      password: '',
      roleId: initialValues?.roleId || '',
      departmentId: initialValues?.departmentId || '',
    },
  });

  const selectedRoleId = watch('roleId');
  const selectedRole = availableRoles.find((role) => role.id === selectedRoleId);
  const isManagerRole = selectedRole?.name === 'MEDICATION_MANAGER';

  const handleFormSubmit = async (data: UserFormValues) => {
    setSubmitError('');
    if (isManagerRole && !data.departmentId) {
      setError('departmentId', { message: 'Department is required for medication manager users' });
      return;
    }

    // For edit mode, if password is empty, remove it from the data
    const submissionData = { ...data };
    if (mode === 'edit' && !submissionData.password) {
      delete submissionData.password;
    }
    if (!isManagerRole) {
      submissionData.departmentId = '';
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
          {submitError && (
            <div className="rounded-md bg-danger/10 p-3 text-sm text-danger">
              {submitError}
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-semibold">Full Name *</label>
            <Input
              {...register('fullName')}
              placeholder="John Doe"
              disabled={isFormLoading}
              error={!!errors.fullName}
            />
            {errors.fullName && <p className="text-xs text-danger">{errors.fullName.message}</p>}
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
            {errors.email && <p className="text-xs text-danger">{errors.email.message}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold">
              Password {mode === 'create' ? '*' : '(Leave blank to keep current)'}
            </label>
            <Input
              {...register('password')}
              type="password"
              placeholder="••••••••"
              disabled={isFormLoading}
              error={!!errors.password}
            />
            {errors.password && <p className="text-xs text-danger">{errors.password.message}</p>}
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
            {errors.roleId && <p className="text-xs text-danger">{errors.roleId.message}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold">Department {isManagerRole ? '*' : '(Optional)'}</label>
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
            {errors.departmentId && <p className="text-xs text-danger">{errors.departmentId.message}</p>}
          </div>

          <div className="flex gap-4 pt-4">
            <Button type="submit" loading={isFormLoading} className="flex-1">
              {mode === 'create' ? 'Create User' : 'Save Changes'}
            </Button>
            <Button variant="outline" onClick={() => router.back()} disabled={isFormLoading} className="flex-1">
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
