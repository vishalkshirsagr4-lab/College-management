export default function EmptyState({ title = 'Nothing here yet', description }) {
  return (
    <div className="rounded-lg border border-border bg-white p-6 text-center">
      <div className="text-sm font-medium text-slate-800">{title}</div>
      {description ? <div className="mt-2 text-sm text-slate-600">{description}</div> : null}
    </div>
  );
}

