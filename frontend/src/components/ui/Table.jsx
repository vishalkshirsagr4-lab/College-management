export default function Table({ className, children }) {
  return (
    <div className={'overflow-x-auto ' + (className || '')}>
      <table className="min-w-full border-separate border-spacing-0">
        {children}
      </table>
    </div>
  );
}

