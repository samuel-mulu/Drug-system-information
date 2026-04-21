interface LoadingStateProps {
  message?: string;
}

export default function LoadingState({ message = 'Loading...' }: LoadingStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-12 space-y-4">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-primary" />
      <p className="text-sm font-medium text-slate-500">{message}</p>
    </div>
  );
}
