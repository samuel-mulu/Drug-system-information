'use client';

import { useRouter } from 'next/navigation';
import { PageHeader } from '../../../../components/ui/page-header';
import { Button } from '../../../../components/ui/button';
import { Card, CardContent } from '../../../../components/ui/card';
import LoadingState from '../../../../components/ui/loading-state';
import UserForm from '../../../../features/users/components/user-form';
import { useCreateUser, useRoles } from '../../../../features/users/hooks';
import { useLocations } from '../../../../features/medications/hooks';

export default function CreateUserPage() {
  const router = useRouter();
  const createUser = useCreateUser();
  const { data: rolesData, isLoading: rolesLoading } = useRoles();
  const { data: locationsData, isLoading: locationsLoading } = useLocations();

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
      if (!data.password) {
        throw new Error('Password is required');
      }

      await createUser.mutateAsync({
        fullName: data.fullName,
        email: data.email,
        password: data.password,
        roleId: data.roleId,
        departmentId: data.departmentId || undefined,
      });
      router.push('/users');
    } catch (error) {
      console.error('Failed to create user:', error);
    }
  };

  if (rolesLoading || locationsLoading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Create User" actions={<Button variant="secondary" onClick={() => router.push('/users')}>Cancel</Button>} />
        <Card>
          <CardContent className="pt-6">
            <LoadingState message="Loading form data..." />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Create User"
        actions={<Button variant="secondary" onClick={() => router.push('/users')}>Cancel</Button>}
      />

      <Card>
        <CardContent className="pt-6">
          <UserForm
            mode="create"
            onSubmit={handleSubmit}
            loading={createUser.isPending}
            availableRoles={availableRoles}
            availableDepartments={availableDepartments}
          />
        </CardContent>
      </Card>
    </div>
  );
}
