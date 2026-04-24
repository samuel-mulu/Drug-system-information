'use client';

import { ReactNode, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/features/auth/store/auth-store';
import { authApi } from '@/features/auth/api';
import { AppShell } from '@/components/layout/app-shell';
import { Button } from '@/components/ui/button';
import LoadingState from '@/components/ui/loading-state';
import { ROUTES, SIDEBAR_NAV_ITEMS, RoleType } from '@/lib/constants';

const ROLE_GUARDS: Array<{ allowedRoles: RoleType[]; matches: (pathname: string) => boolean }> = [
  {
    matches: (pathname) => pathname === ROUTES.USERS || pathname.startsWith(`${ROUTES.USERS}/`),
    allowedRoles: ['SYSTEM_ADMIN'],
  },
  {
    matches: (pathname) => pathname === ROUTES.AUDIT_LOGS || pathname.startsWith(`${ROUTES.AUDIT_LOGS}/`),
    allowedRoles: ['SYSTEM_ADMIN'],
  },
  {
    matches: (pathname) =>
      pathname === `${ROUTES.MEDICATIONS}/new` || /^\/medications\/[^/]+\/edit$/.test(pathname),
    allowedRoles: ['SYSTEM_ADMIN', 'MEDICATION_MANAGER'],
  },
  {
    matches: (pathname) =>
      pathname === ROUTES.MEDICATIONS || /^\/medications\/[^/]+$/.test(pathname),
    allowedRoles: ['SYSTEM_ADMIN', 'MEDICATION_MANAGER', 'VIEWER'],
  },
  {
    matches: (pathname) => pathname === ROUTES.ANALYTICS || pathname.startsWith(`${ROUTES.ANALYTICS}/`),
    allowedRoles: ['SYSTEM_ADMIN', 'MEDICATION_MANAGER', 'VIEWER'],
  },
  {
    matches: (pathname) => pathname === ROUTES.DASHBOARD || pathname.startsWith(`${ROUTES.DASHBOARD}/`),
    allowedRoles: ['SYSTEM_ADMIN', 'MEDICATION_MANAGER', 'VIEWER'],
  },
];

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const queryClient = useQueryClient();
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const user = useAuthStore((state) => state.user);
  const hydrate = useAuthStore((state) => state.hydrate);
  const isLoading = useAuthStore((state) => state.isLoading);
  const isHydrated = useAuthStore((state) => state.isHydrated);
  const hydrateError = useAuthStore((state) => state.hydrateError);
  const needsReauth = useAuthStore((state) => state.needsReauth);
  const userRole = user?.role as RoleType | undefined;
  const currentGuard = ROLE_GUARDS.find((guard) => guard.matches(pathname));
  const isForbidden = !!currentGuard && !!userRole && !currentGuard.allowedRoles.includes(userRole);

  useEffect(() => {
    void hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (isHydrated && !isLoading && !user && !hydrateError) {
      queryClient.clear();
      router.replace(needsReauth ? '/login?reason=session-expired&reauth=1' : '/login');
    }
  }, [hydrateError, isHydrated, isLoading, needsReauth, queryClient, router, user]);

  useEffect(() => {
    if (isHydrated && !isLoading && isForbidden) {
      router.replace(ROUTES.DASHBOARD);
    }
  }, [isForbidden, isHydrated, isLoading, router]);

  if (!isHydrated || isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <LoadingState message="Loading..." />
      </div>
    );
  }

  if (!user && hydrateError) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50 px-4">
        <div className="w-full max-w-md rounded-xl border border-[#dbe7f2] bg-white p-6 text-center shadow-sm">
          <p className="text-base font-semibold text-slate-800">Session check failed</p>
          <p className="mt-2 text-sm text-slate-600">{hydrateError}</p>
          <Button className="mt-5 w-full" onClick={() => void hydrate()}>
            Retry
          </Button>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <LoadingState message="Redirecting..." />
      </div>
    );
  }

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } finally {
      clearAuth();
      queryClient.clear();
      router.replace('/login');
    }
  };

  if (isForbidden) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <LoadingState message="Redirecting..." />
      </div>
    );
  }

  const filteredNavItems = SIDEBAR_NAV_ITEMS.filter((item) => {
    if (!item.allowedRoles || !userRole) return false;
    return item.allowedRoles.includes(userRole);
  });

  const matchedNavItem = SIDEBAR_NAV_ITEMS.find(
    (item) =>
      pathname === item.href ||
      (item.href !== ROUTES.DASHBOARD && pathname.startsWith(`${item.href}/`))
  );

  return (
    <AppShell
      title={pathname === ROUTES.DASHBOARD ? 'Dashboard' : matchedNavItem?.label || 'Dashboard'}
      userName={user.fullName}
      navItems={filteredNavItems.map((item) => ({ href: item.href, label: item.label }))}
      currentPath={pathname}
      onLogout={handleLogout}
    >
      {children}
    </AppShell>
  );
}
