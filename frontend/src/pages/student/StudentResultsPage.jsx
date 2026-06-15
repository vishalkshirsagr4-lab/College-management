import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../../utils/api";

export default function StudentResultsPage() {
  const { examId } = useParams();

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
  const fetchResult = async () => {
    try {
      setLoading(true);
      setError("");

      const examsRes = await api.get("/api/student/exams");

      const exams = examsRes.data?.data || [];

      const completedExam = exams.find(
        (exam) => exam.status === "completed"
      );

      if (!completedExam) {
        setError("No completed exam found.");
        return;
      }

      const resultRes = await api.get(
        `/api/student/exams/${completedExam._id}/result`
      );

      if (resultRes.data?.success) {
        setResult(resultRes.data.data);
      } else {
        setError("Result not available.");
      }
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message ||
        "Failed to load result."
      );
    } finally {
      setLoading(false);
    }
  };

  fetchResult();
}, []);
  if (loading) {
    return (
      <div className="flex items-center justify-center h-[70vh]">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-3 text-sm font-semibold text-slate-500">
            FETCHING PERFORMANCE DATA...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-[70vh] p-4">
        <div className="bg-white border rounded-2xl p-6 shadow max-w-md w-full text-center">
          <h2 className="text-lg font-bold text-red-600 mb-2">
            Result Status
          </h2>

          <p className="text-slate-600 mb-4">{error}</p>

          <Link
            to="/student/exams"
            className="inline-block bg-blue-600 text-white px-4 py-2 rounded-lg"
          >
            Back To Exams
          </Link>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="flex items-center justify-center h-[70vh]">
        <p>No result data available.</p>
      </div>
    );
  }

  const isPassed = result.resultStatus === "PASS";

 

jsx
return (
  <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 p-4 md:p-6">
    <div className="max-w-6xl mx-auto">

      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-cyan-500 rounded-3xl shadow-xl text-white p-8 mb-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <p className="uppercase tracking-widest text-xs font-bold opacity-90">
              Academic Report
            </p>

            <h1 className="text-3xl md:text-4xl font-extrabold mt-1">
              Examination Result
            </h1>

            <p className="mt-2 text-blue-100 text-sm">
              Exam ID: {result.examId}
            </p>
          </div>

          <div>
            <span
              className={`px-6 py-3 rounded-full text-sm font-bold shadow-lg ${
                isPassed
                  ? "bg-white text-green-600"
                  : "bg-white text-red-600"
              }`}
            >
              {result.resultStatus}
            </span>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">

        <div className="bg-white rounded-3xl p-6 shadow-lg">
          <p className="text-sm text-slate-500">
            Total Marks
          </p>

          <h2 className="text-3xl font-extrabold mt-2 text-slate-800">
            {result.totalObtained}
            <span className="text-lg text-slate-400">
              /{result.totalMax}
            </span>
          </h2>
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-lg">
          <p className="text-sm text-slate-500">
            Percentage
          </p>

          <h2 className="text-3xl font-extrabold mt-2 text-blue-600">
            {result.percentage}%
          </h2>
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-lg">
          <p className="text-sm text-slate-500">
            Final Status
          </p>

          <h2
            className={`text-3xl font-extrabold mt-2 ${
              isPassed
                ? "text-green-600"
                : "text-red-600"
            }`}
          >
            {result.resultStatus}
          </h2>
        </div>

      </div>

      {/* Subject Table */}
      <div className="bg-white rounded-3xl shadow-xl overflow-hidden">

        <div className="p-5 border-b">
          <h2 className="font-bold text-lg text-slate-800">
            Subject-wise Performance
          </h2>
        </div>

        <div className="overflow-x-auto">

          <table className="w-full">

            <thead>
              <tr className="bg-slate-100 text-slate-700">
                <th className="text-left p-4">
                  Subject
                </th>

                <th className="text-center p-4">
                  Obtained
                </th>

                <th className="text-center p-4">
                  Total
                </th>

                <th className="text-center p-4">
                  Percentage
                </th>
              </tr>
            </thead>

            <tbody>

              {result.subjectWise?.map((subject, index) => {
                const percent = (
                  (subject.marksObtained /
                    subject.totalMarks) *
                  100
                ).toFixed(2);

                return (
                  <tr
                    key={index}
                    className="border-b hover:bg-blue-50 transition-colors"
                  >
                    <td className="p-4 font-medium">
                      {subject.subject}
                    </td>

                    <td className="p-4 text-center font-bold">
                      {subject.marksObtained}
                    </td>

                    <td className="p-4 text-center">
                      {subject.totalMarks}
                    </td>

                    <td className="p-4 text-center">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold ${
                          percent >= 35
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {percent}%
                      </span>
                    </td>
                  </tr>
                );
              })}

            </tbody>

          </table>

        </div>

      </div>

      <div className="mt-6">
        <Link
          to="/student/exams"
          className="inline-flex items-center px-5 py-3 rounded-2xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition"
        >
          ← Back To Exams
        </Link>
      </div>

    </div>
  </div>
);

} 