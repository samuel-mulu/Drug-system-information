'use client';

import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { PageHeader } from '../../../../components/ui/page-header';
import { Button } from '../../../../components/ui/button';
import { Card, CardContent, CardHeader } from '../../../../components/ui/card';
import LoadingState from '../../../../components/ui/loading-state';
import { useUser, useActivateUser, useDeactivateUser } from '../../../../features/users/hooks';
import UserStatusAction from '../../../../features/users/components/user-status-action';
import ErrorState from '../../../../components/ui/error-state';
import { getApiErrorMessage } from '@/lib/api-client';
import { UserDetail } from '@/features/users/types';

function getDepartmentDisplay(user: UserDetail) {
  if (user.departments.length > 0) {
    return user.departments.map((department) => department.name).join(', ');
  }

  if (user.department?.name) {
    return user.department.name;
  }

  return user.role.name === 'SYSTEM_ADMIN' ? '-' : 'Not assigned';
}

export default function UserDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { data: user, isLoading, error } = useUser(params.id);
  const activateUser = useActivateUser(params.id);
  const deactivateUser = useDeactivateUser(params.id);

  const handleActivate = async () => {
    try {
      await activateUser.mutateAsync();
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to activate user'));
    }
  };

  const handleDeactivate = async () => {
    try {
      await deactivateUser.mutateAsync();
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to deactivate user'));
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader title="User Details" actions={<Button variant="secondary" onClick={() => router.push('/users')}>Back</Button>} />
        <Card>
          <CardContent className="pt-6">
            <LoadingState message="Loading user details..." />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !user) {
    return <ErrorState message="Error loading user details" onRetry={() => router.refresh()} />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={user.fullName}
        actions={
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" onClick={() => router.push('/users')}>Back</Button>
            <Button onClick={() => router.push(`/users/${user.id}/edit`)}>Edit</Button>
            <UserStatusAction
              isActive={user.isActive}
              onActivate={handleActivate}
              onDeactivate={handleDeactivate}
              loading={activateUser.isPending || deactivateUser.isPending}
            />
          </div>
        }
      />

      <Card>
        <CardHeader>
          <h3 className="text-lg font-bold text-slate-900">User Information</h3>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Full Name</p>
              <p className="mt-1 text-sm font-semibold text-slate-900">{user.fullName}</p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Email</p>
              <p className="mt-1 text-sm font-semibold text-slate-900">{user.email}</p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Role</p>
              <p className="mt-1 text-sm font-semibold text-slate-900">{user.role.name.replace('_', ' ')}</p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Department / Location</p>
              <p className="mt-1 text-sm font-semibold text-slate-900">
                {getDepartmentDisplay(user)}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Status</p>
              <span
                className={`mt-1 inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                  user.isActive ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'
                }`}
              >
                {user.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h3 className="text-lg font-bold text-slate-900">Metadata</h3>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Created At</p>
              <p className="mt-1 text-sm font-semibold text-slate-900">{new Date(user.createdAt).toLocaleString()}</p>
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Updated At</p>
              <p className="mt-1 text-sm font-semibold text-slate-900">{new Date(user.updatedAt).toLocaleString()}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
