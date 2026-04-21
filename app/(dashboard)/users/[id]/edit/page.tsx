'use client';

import { useRouter } from 'next/navigation';
import { PageHeader } from '../../../../../components/ui/page-header';
import { Button } from '../../../../../components/ui/button';
import { Card, CardContent } from '../../../../../components/ui/card';
import LoadingState from '../../../../../components/ui/loading-state';
import UserForm from '../../../../../features/users/components/user-form';
import { useUser, useUpdateUser, useRoles } from '../../../../../features/users/hooks';
import ErrorState from '../../../../../components/ui/error-state';
import { useLocations } from '../../../../../features/medications/hooks';

export default function EditUserPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { data: userData, isLoading, error } = useUser(params.id);
  const updateUser = useUpdateUser(params.id);
  const { data: rolesData, isLoading: rolesLoading } = useRoles();
  const { data: locationsData, isLoading: locationsLoading } = useLocations();

  const user = userData?.data;
  const availableRoles = rolesData?.data || [];
  const availableDepartments = locationsData?.data || [];

  const handleSubmit = async (data: {
    fullName: string;
    email: string;
    password?: string;
    roleId: string;
    departmentId?: string;
  }) => {
    try {
      await updateUser.mutateAsync({
        fullName: data.fullName,
        email: data.email,
        roleId: data.roleId,
        departmentId: data.departmentId || null,
      });
      router.push(`/users/${params.id}`);
    } catch (error) {
      console.error('Failed to update user:', error);
    }
  };

  if (isLoading || rolesLoading || locationsLoading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Edit User" actions={<Button variant="secondary" onClick={() => router.push(`/users/${params.id}`)}>Cancel</Button>} />
        <Card>
          <CardContent className="pt-6">
            <LoadingState message="Loading user data..." />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !user) {
    return (
      <ErrorState message="Failed to load user details" onRetry={() => router.refresh()} />
    );
  }

  const initialValues = {
    fullName: user.fullName,
    email: user.email,
    roleId: user.role.id,
    departmentId: user.departmentId || '',
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Edit ${user.fullName}`}
        actions={<Button variant="secondary" onClick={() => router.push(`/users/${params.id}`)}>Cancel</Button>}
      />

      <Card>
        <CardContent className="pt-6">
          <UserForm
            mode="edit"
            initialValues={initialValues}
            onSubmit={handleSubmit}
            loading={updateUser.isPending}
            availableRoles={availableRoles}
            availableDepartments={availableDepartments}
          />
        </CardContent>
      </Card>
    </div>
  );
}
