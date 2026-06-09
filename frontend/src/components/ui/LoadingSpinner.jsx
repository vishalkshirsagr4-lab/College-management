export default function LoadingSpinner({ label = 'Loading...' }) {
  return (
    <div className="flex items-center gap-3">
      <div
        className="h-5 w-5 animate-spin rounded-full border-2 border-primary/30 border-t-primary"
        aria-hidden="true"
      />
      <span className="text-sm text-slate-600">{label}</span>
    </div>
  );
}

