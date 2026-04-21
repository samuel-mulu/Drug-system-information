import { ReactNode } from 'react';
import { Button } from './button';

interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
}

export default function ErrorState({ title = 'Something went wrong', message, onRetry }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center">
      <div className="mb-4 rounded-full bg-danger/10 p-4">
        <svg
          className="h-8 w-8 text-danger"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
      </div>
      <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
      <p className="mt-2 text-sm text-slate-500 max-w-xs mx-auto">{message}</p>
      {onRetry && (
        <div className="mt-6">
          <Button variant="outline" onClick={onRetry}>
            Try Again
          </Button>
        </div>
      )}
    </div>
  );
}
