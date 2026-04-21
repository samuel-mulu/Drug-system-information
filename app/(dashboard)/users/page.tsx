'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUsers } from '@/features/users/hooks';
import { RoleName, User } from '@/features/users/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import DataTable, { Column } from '@/components/ui/data-table';
import { PageHeader } from '@/components/ui/page-header';
import { useDebouncedValue } from '@/lib/debounce';

export default function UsersPage() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<RoleName | ''>('');
  const [isActiveFilter, setIsActiveFilter] = useState<boolean | ''>('');
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebouncedValue(search, 300);

  const { data, isLoading } = useUsers({
    search: debouncedSearch || undefined,
    role: roleFilter || undefined,
    isActive: isActiveFilter === '' ? undefined : isActiveFilter,
    page,
    limit: 10,
  });

  const users = data?.data || [];
  const total = data?.meta?.total || 0;
  const totalPages = Math.ceil(total / 10);

  const columns: Column<User>[] = [
    { header: 'Full Name', accessor: 'fullName' },
    { header: 'Email', accessor: 'email' },
    { 
      header: 'Role', 
      accessor: (user) => (
        <span className="capitalize">{user.role.name.toLowerCase().replace('_', ' ')}</span>
      ) 
    },
    { 
      header: 'Status', 
      accessor: (user) => (
        <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
          user.isActive 
            ? 'bg-success/10 text-success' 
            : 'bg-danger/10 text-danger'
        }`}>
          {user.isActive ? 'Active' : 'Inactive'}
        </span>
      ) 
    },
    { 
      header: 'Created At', 
      accessor: (user) => new Date(user.createdAt).toLocaleDateString() 
    },
  ];

  const handleReset = () => {
    setSearch('');
    setRoleFilter('');
    setIsActiveFilter('');
    setPage(1);
  };

  return (
    <div className="space-y-6">
        <PageHeader 
          title="Users" 
          actions={
            <Button onClick={() => router.push('/users/new')}>
              Add User
            </Button>
          } 
        />

        <Card>
          <CardContent className="pt-6">
            <div className="mb-6 flex flex-wrap gap-4 items-end">
              <div className="flex-1 min-w-[200px]">
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Search</label>
                <Input
                  placeholder="Search by name or email..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              <div className="min-w-[150px]">
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Role</label>
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value as RoleName | '')}
                  className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  <option value="">All Roles</option>
                  <option value="SYSTEM_ADMIN">System Admin</option>
                  <option value="MEDICATION_MANAGER">Medication Manager</option>
                  <option value="VIEWER">Viewer</option>
                </select>
              </div>

              <div className="min-w-[150px]">
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Status</label>
                <select
                  value={isActiveFilter === '' ? '' : String(isActiveFilter)}
                  onChange={(e) => setIsActiveFilter(e.target.value === '' ? '' : e.target.value === 'true')}
                  className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  <option value="">All Status</option>
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </select>
              </div>

              <Button variant="secondary" onClick={handleReset}>
                Reset
              </Button>
            </div>

            <DataTable
              columns={columns}
              data={users}
              isLoading={isLoading}
              onRowClick={(user) => router.push(`/users/${user.id}`)}
              emptyTitle="No users found"
              emptyDescription="Try adjusting your filters or add a new user."
              actions={(user) => (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push(`/users/${user.id}`)}
                >
                  View
                </Button>
              )}
            />

            {total > 0 && (
              <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-6">
                <p className="text-sm text-slate-500">
                  Showing <span className="font-medium text-slate-900">{users.length}</span> of <span className="font-medium text-slate-900">{total}</span> users
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    Previous
                  </Button>
                  <div className="flex items-center px-4 text-sm font-medium">
                    Page {page} of {totalPages}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page >= totalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
    </div>
  );
}
