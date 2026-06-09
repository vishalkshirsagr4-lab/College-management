export default function Card({ className, ...props }) {
  return (
    <div
      className={
        'rounded-lg border border-border bg-white shadow-sm ' + (className || '')
      }
      {...props}
    />
  );
}

