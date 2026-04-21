'use client';

import Link from 'next/link';
import { ReactNode, useEffect } from 'react';
import { ChevronLeft, ChevronRight, LayoutDashboard, LogOut, Menu, X } from 'lucide-react';
import { useUIStore } from '@/stores/ui-store';
import { Button } from '@/components/ui/button';

interface NavItem {
  href: string;
  label: string;
}

interface AppShellProps {
  title: string;
  userName: string;
  navItems: NavItem[];
  currentPath: string;
  onLogout: () => void | Promise<void>;
  children: ReactNode;
}

function isActiveRoute(currentPath: string, href: string) {
  return currentPath === href || (href !== '/dashboard' && currentPath.startsWith(`${href}/`));
}

export function AppShell({ title, userName, navItems, currentPath, onLogout, children }: AppShellProps) {
  const mobileNavOpen = useUIStore((state) => state.mobileNavOpen);
  const desktopNavCollapsed = useUIStore((state) => state.desktopNavCollapsed);
  const openMobileNav = useUIStore((state) => state.openMobileNav);
  const closeMobileNav = useUIStore((state) => state.closeMobileNav);
  const toggleDesktopNav = useUIStore((state) => state.toggleDesktopNav);

  useEffect(() => {
    closeMobileNav();
  }, [currentPath, closeMobileNav]);

  const navContent = (compact: boolean) => (
    <>
      <div className={`mb-6 ${compact ? 'text-center' : ''}`}>
        <div className={`mb-2 inline-flex rounded-xl bg-primary/15 p-2 ${compact ? 'mx-auto' : ''}`}>
          <LayoutDashboard className="h-5 w-5 text-primary" />
        </div>
        {!compact && (
          <>
            <h2 className="text-lg font-bold tracking-tight text-white sm:text-xl">
              Drug Info <span className="text-primary">System</span>
            </h2>
            <p className="mt-1 text-xs text-slate-400">Mobile-first medication workspace</p>
          </>
        )}
      </div>

      <nav className="space-y-1">
        {navItems.map((item) => {
          const active = isActiveRoute(currentPath, item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`block rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                active
                  ? 'bg-primary text-white'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
              title={compact ? item.label : undefined}
            >
              <span className={compact ? 'sr-only' : ''}>{item.label}</span>
              {compact && <span aria-hidden>{item.label.slice(0, 1)}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto border-t border-slate-800 pt-5">
        {!compact ? <p className="text-xs text-slate-500">v1.0.0</p> : <p className="text-xs text-slate-500">v1</p>}
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="flex min-h-screen">
        <aside
          className={`hidden shrink-0 border-r border-slate-800 bg-slate-900 px-4 py-6 transition-all duration-200 lg:flex lg:flex-col ${
            desktopNavCollapsed ? 'w-20' : 'w-72'
          }`}
        >
          <div className="mb-3 flex justify-end">
            <button
              type="button"
              onClick={toggleDesktopNav}
              className="rounded-md p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white"
              aria-label={desktopNavCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {desktopNavCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </button>
          </div>
          {navContent(desktopNavCollapsed)}
        </aside>

        {mobileNavOpen && (
          <div className="fixed inset-0 z-40 bg-slate-950/50 lg:hidden" onClick={closeMobileNav} />
        )}

        <aside
          className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-slate-900 px-5 py-6 transition-transform lg:hidden ${
            mobileNavOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="mb-4 flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-300">Navigation</span>
            <button
              type="button"
              onClick={closeMobileNav}
              className="rounded-md p-2 text-slate-300 hover:bg-slate-800 hover:text-white"
              aria-label="Close navigation"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          {navContent(false)}
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
            <div className="flex items-center gap-3 px-4 py-4 sm:px-6">
              <button
                type="button"
                onClick={openMobileNav}
                className="rounded-md border border-slate-200 p-2 text-slate-700 lg:hidden"
                aria-label="Open navigation"
              >
                <Menu className="h-5 w-5" />
              </button>

              <div className="min-w-0 flex-1">
                <h1 className="truncate text-lg font-bold tracking-tight text-slate-900 sm:text-xl">
                  {title}
                </h1>
              </div>

              <div className="flex items-center gap-3">
                <span className="hidden rounded-md bg-slate-100 px-2 py-1 text-sm font-medium text-slate-600 sm:block">
                  {userName}
                </span>
                <Button variant="danger" size="sm" onClick={onLogout} className="gap-1.5">
                  <LogOut className="h-4 w-4" />
                  <span className="hidden sm:inline">Logout</span>
                </Button>
              </div>
            </div>
          </header>

          <main className="flex-1 px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
            <div className="mx-auto max-w-7xl">{children}</div>
          </main>
        </div>
      </div>
    </div>
  );
}
