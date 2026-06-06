const LoadingSkeleton = ({ rows = 3, columns = 1 }) => (
  <div className="skeleton-grid" style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>
    {Array.from({ length: rows }).map((_, index) => (
      <div key={index} className="skeleton-card" />
    ))}
  </div>
);

export default LoadingSkeleton;
