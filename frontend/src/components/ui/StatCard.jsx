const accentClasses = {
  blue: "bg-sky-100 text-sky-700 ring-sky-200",
  green: "bg-emerald-100 text-emerald-700 ring-emerald-200",
  amber: "bg-amber-100 text-amber-700 ring-amber-200",
  red: "bg-rose-100 text-rose-700 ring-rose-200",
};

const StatCard = ({
  icon,
  label,
  value,
  detail,
  accent = "blue",
}) => {
  return (
    <article className="group rounded-2xl border border-gray-200 bg-white p-5 sm:p-6 shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-1">

      {/* Icon */}
      <div
        className={`flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-2xl ${accentClasses[accent]} ring-1`}
      >
        {icon}
      </div>

      {/* Content */}
      <div className="mt-4 space-y-1">
        <p className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-gray-500">
          {label}
        </p>

        <h3 className="text-2xl sm:text-3xl font-bold text-gray-900">
          {value}
        </h3>

        {detail && (
          <p className="text-xs sm:text-sm text-gray-500">
            {detail}
          </p>
        )}
      </div>

      {/* subtle hover effect */}
      <div className="mt-4 h-1 w-0 group-hover:w-full transition-all duration-300 bg-gradient-to-r from-sky-400 to-indigo-400 rounded-full" />
    </article>
  );
};

export default StatCard;