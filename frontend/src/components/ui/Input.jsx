export default function Input({ className, ...props }) {
  return (
    <input
      className={
        'w-full rounded-md border border-border bg-white px-3 py-2 text-sm text-slate-700 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-primary/40 ' +
        (className || '')
      }
      {...props}
    />
  );
}

