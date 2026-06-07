import { useEffect, useMemo, useState } from "react";
import { getResults, getStudentProfile } from "../../api/student.api";
import LoadingSkeleton from "../../components/ui/LoadingSkeleton";

const Results = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const profileRes = await getStudentProfile();
        const studentId = profileRes.data.student?._id;

        if (!studentId) {
          setResults([]);
          return;
        }

        const response = await getResults();

        const filtered = (response.data.results || []).filter(
          (item) =>
            item.studentId?.toString() === studentId.toString() ||
            item.studentId?._id?.toString() === studentId.toString()
        );

        setResults(filtered);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const overall = useMemo(() => {
    if (results.length === 0) return { percentage: 0, average: 0 };

    const total = results.reduce(
      (sum, item) => sum + Number(item.marks || 0),
      0
    );

    return {
      percentage: Math.round(total / results.length),
      average: total / results.length,
    };
  }, [results]);

  if (loading) {
    return <LoadingSkeleton rows={2} columns={1} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* HEADER */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Results
          </h1>
          <p className="text-gray-500 mt-1">
            Check your subject scores, grades, and performance
          </p>
        </div>

        {results.length === 0 ? (
          <div className="bg-white border rounded-xl p-6 text-gray-600">
            No result records are available yet.
          </div>
        ) : (
          <>
            {/* SUMMARY CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

              <div className="bg-white border rounded-2xl p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-800">
                  Overall Performance
                </h2>

                <p className="text-sm text-gray-500 mt-1">
                  Average across all subjects
                </p>

                <div className="mt-4">
                  <div className="text-3xl font-bold text-blue-600">
                    {overall.percentage}%
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    Based on {results.length} subjects
                  </p>
                </div>
              </div>

              <div className="bg-white border rounded-2xl p-6 shadow-sm flex flex-col justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-800">
                    Download Report
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    Get your complete result sheet
                  </p>
                </div>

                <button className="mt-4 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-xl transition">
                  Download
                </button>
              </div>
            </div>

            {/* TABLE */}
            <div className="bg-white border rounded-2xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-100 text-gray-700">
                    <tr>
                      <th className="text-left px-6 py-3">Subject</th>
                      <th className="text-left px-6 py-3">Marks</th>
                      <th className="text-left px-6 py-3">Grade</th>
                      <th className="text-left px-6 py-3">Status</th>
                    </tr>
                  </thead>

                  <tbody>
                    {results.map((result) => {
                      const status =
                        Number(result.marks) >= 40 ? "Pass" : "Fail";

                      return (
                        <tr
                          key={result._id}
                          className="border-t hover:bg-gray-50"
                        >
                          <td className="px-6 py-4 font-medium text-gray-800">
                            {result.subjectId?.subjectName || "Subject"}
                          </td>

                          <td className="px-6 py-4 text-gray-600">
                            {result.marks}
                          </td>

                          <td className="px-6 py-4 text-gray-600">
                            {result.grade || "N/A"}
                          </td>

                          <td className="px-6 py-4">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                status === "Pass"
                                  ? "bg-green-100 text-green-700"
                                  : "bg-red-100 text-red-700"
                              }`}
                            >
                              {status}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Results;