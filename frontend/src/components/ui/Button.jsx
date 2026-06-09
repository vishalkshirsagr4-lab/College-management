import { twMerge } from 'tailwind-merge';

export default function Button({
  variant = 'primary',
  className,
  fullWidth,
  size = 'md',
  ...props
}) {
  const base =
    'inline-flex items-center justify-center rounded-md border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 disabled:opacity-50 disabled:cursor-not-allowed';

  const variants = {
    primary:
      'bg-primary border-primary text-white hover:bg-blue-700',
    secondary:
      'bg-white border-border text-slate-700 hover:bg-slate-50',
  };

  const sizes = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-2.5 text-sm',
    lg: 'px-5 py-3 text-base',
  };

  return (
    <button
      className={twMerge(
        base,
        variants[variant],
        sizes[size],
        fullWidth && 'w-full',
        className
      )}
      {...props}
    />
  );
}

