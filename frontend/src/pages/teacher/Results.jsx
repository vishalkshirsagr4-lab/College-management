import { useEffect, useState } from 'react';
import { getResults } from '../../api/results.api';
import LoadingSkeleton from '../../components/ui/LoadingSkeleton';
import { toast } from 'react-toastify';

const TeacherResults = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const response = await getResults();
        setResults(response.data.results || []);
      } catch (error) {
        toast.error('Unable to load results.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filtered = results.filter((item) => {
    const q = search.toLowerCase();
    return (
      item.studentId?.usn?.toLowerCase().includes(q) ||
      item.studentId?.userId?.name?.toLowerCase().includes(q) ||
      item.subjectId?.subjectName?.toLowerCase().includes(q) ||
      item.grade?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-6 sm:px-6 lg:px-10">

      {/* HEADER */}
      <div className="max-w-6xl mx-auto mb-6">
        <div className="bg-white rounded-2xl shadow-sm border p-5">
          <h1 className="text-2xl font-bold text-gray-900">
            Student Results
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            View and verify student exam results for your assigned subjects.
          </p>
        </div>
      </div>

      {/* CONTENT */}
      <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-sm border p-5">

        {/* SEARCH */}
        <input
          type="search"
          placeholder="Search by student, subject, or grade..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full border rounded-xl px-4 py-3 mb-5 outline-none focus:ring-2 focus:ring-blue-500"
        />

        {/* LOADING */}
        {loading ? (
          <LoadingSkeleton rows={4} columns={1} />
        ) : filtered.length === 0 ? (
          <div className="text-center text-gray-500 py-10">
            No results available.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left border-collapse">

              <thead>
                <tr className="bg-gray-100 text-gray-700">
                  <th className="p-3">Student</th>
                  <th className="p-3">Subject</th>
                  <th className="p-3">Marks</th>
                  <th className="p-3">Grade</th>
                </tr>
              </thead>

              <tbody>
                {filtered.map((result) => (
                  <tr
                    key={result._id}
                    className="border-b hover:bg-gray-50 transition"
                  >
                    <td className="p-3">
                      {result.studentId?.usn ||
                        result.studentId?.userId?.name ||
                        'Unknown'}
                    </td>

                    <td className="p-3">
                      {result.subjectId?.subjectName || 'Unknown'}
                    </td>

                    <td className="p-3 font-medium">
                      {result.marks}
                    </td>

                    <td className="p-3">
                      <span
                        className={`px-2 py-1 rounded-lg text-xs font-semibold ${
                          result.grade === 'A'
                            ? 'bg-green-100 text-green-700'
                            : result.grade === 'B'
                            ? 'bg-blue-100 text-blue-700'
                            : result.grade === 'C'
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {result.grade || 'N/A'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>

            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeacherResults;