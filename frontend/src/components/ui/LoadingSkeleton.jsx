const LoadingSkeleton = ({ rows = 3, columns = 1 }) => {
  return (
    <div
      className="grid gap-4 sm:gap-5"
      style={{
        gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
      }}
    >
      {Array.from({ length: rows }).map((_, index) => (
        <div
          key={index}
          className="h-28 sm:h-32 md:h-36 rounded-2xl bg-gray-200 animate-pulse shadow-sm"
        >
          {/* Inner shimmer effect */}
          <div className="h-full w-full rounded-2xl bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-pulse" />
        </div>
      ))}
    </div>
  );
};

export default LoadingSkeleton;