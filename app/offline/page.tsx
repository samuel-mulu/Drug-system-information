import Link from 'next/link';
import { APP_SHORT_NAME } from '@/lib/constants';

export default function OfflinePage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <div className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-lg font-bold text-primary">
          {APP_SHORT_NAME.split(' ').map((part) => part[0]).join('')}
        </div>
        <h1 className="mt-5 text-2xl font-bold text-slate-900">You&apos;re offline</h1>
        <p className="mt-2 text-sm text-slate-600">
          Reconnect to continue using the Drug Information System. Once you&apos;re back online, reload the app.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex h-10 items-center justify-center rounded-lg bg-primary px-4 text-sm font-semibold text-white transition-colors hover:bg-primary/90"
        >
          Try Again
        </Link>
      </div>
    </main>
  );
}
