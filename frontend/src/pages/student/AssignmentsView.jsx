import { useEffect, useMemo, useState } from 'react';
import { getMyAssignments } from '../../api/student.api';
import LoadingSkeleton from '../../components/ui/LoadingSkeleton';

const AssignmentsView = () => {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const response = await getMyAssignments();
        setAssignments(response.data.assignments || []);
      } catch {
        setAssignments([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const sortedAssignments = useMemo(
    () =>
      assignments
        .slice()
        .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate)),
    [assignments]
  );

  const isActive = (dueDate) => new Date(dueDate) >= new Date();

  return (
    <div className="w-full min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
          Assignments
        </h1>
        <p className="text-gray-500 mt-1 text-sm sm:text-base">
          Your coursework, due dates, and downloadable materials
        </p>
      </div>

      {/* Loading */}
      {loading ? (
        <LoadingSkeleton rows={3} columns={1} />
      ) : sortedAssignments.length === 0 ? (
        <div className="bg-white border border-gray-100 rounded-2xl p-6 text-gray-600">
          No assignments are available right now.
        </div>
      ) : (
        <div className="grid gap-4 sm:gap-5">
          {sortedAssignments.map((assignment) => {
            const dueDate = new Date(assignment.dueDate);
            const active = isActive(dueDate);

            return (
              <article
                key={assignment._id}
                className="bg-white border border-gray-100 rounded-2xl p-5 sm:p-6 shadow-sm hover:shadow-md transition"
              >
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {assignment.title}
                  </h3>

                  <span
                    className={`text-xs font-semibold px-3 py-1 rounded-full w-fit ${
                      active
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {active ? 'Pending' : 'Expired'}
                  </span>
                </div>

                {/* Info */}
                <p className="text-sm text-gray-500 mt-2">
                  Due: {dueDate.toLocaleDateString()}
                </p>

                <p className="text-gray-700 mt-3 text-sm leading-6">
                  {assignment.description || 'No additional details available.'}
                </p>

                {/* Actions */}
                <div className="mt-5 flex flex-col sm:flex-row gap-3 sm:items-center">
                  <button className="px-4 py-2 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition w-full sm:w-auto">
                    Upload Answer
                  </button>

                  {assignment.file?.url && (
                    <a
                      href={assignment.file.url}
                      target="_blank"
                      rel="noreferrer"
                      className="px-4 py-2 rounded-xl bg-gray-100 text-gray-700 text-sm font-medium hover:bg-gray-200 transition text-center w-full sm:w-auto"
                    >
                      Download
                    </a>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AssignmentsView;