import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../../utils/api";

export default function StudentResultsPage() {
  const { examId } = useParams(); // optional depending on route definition
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchExamResult = async (targetExamId) => {
      try {
        setLoading(true);
        setError("");

        // Backend route: GET /api/student/exams/:examId/result
        const res = await api.get(
          `/api/student/exams/${targetExamId}/result`
        );

        if (res.data?.success) {
          setResult(res.data.data);
        } else {
          setResult(null);
        }
      } catch (err) {
        console.error("Error fetching exam results:", err);
        // Captures backend messages like "Result not published yet" or "Student not found"
        setError(
          err.response?.data?.message ||
            "Failed to load academic transcript data."
        );
        setResult(null);
      } finally {
        setLoading(false);
      }
    };

    const bootstrap = async () => {
      // Current App.jsx route is: /student/results (no :examId)
      // so examId may be undefined. In that case, fetch exams and use the first available.
      if (examId) {
        await fetchExamResult(examId);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const examsRes = await api.get("/api/student/exams");
        const exams = examsRes.data?.data || [];

        if (!exams.length) {
          setError("No exams found for your account.");
          setResult(null);
          return;
        }

        // Prefer examId from current selection; otherwise first exam in list.
        await fetchExamResult(exams[0]._id);
      } catch (err) {
        console.error("Error fetching exams for results:", err);
        setError(
          err.response?.data?.message ||
            "Failed to load your exams to show results."
        );
        setResult(null);
        setLoading(false);
      }
    };

    bootstrap();
  }, [examId]);

  if (loading) {
    return (
      <div className="w-full h-96 flex items-center justify-center p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto mb-3"></div>
          <p className="text-xs text-slate-400 font-bold tracking-wider uppercase">Fetching Performance Data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full p-6 flex items-center justify-center">
        <div className="bg-white max-w-md w-full border border-slate-200 rounded-2xl p-6 text-center shadow-sm">
          <div className="text-3xl mb-2">📜</div>
          <h3 className="text-base font-bold text-slate-900">Result Status</h3>
          <p className="text-slate-500 text-xs mt-2 font-medium bg-slate-50 p-3 rounded-xl border border-slate-100">
            {error}
          </p>
          <Link
            to="/student/exams"
            className="mt-4 inline-block text-xs font-semibold text-blue-600 hover:underline"
          >
            ← Back to Exams Schedule
          </Link>
        </div>
      </div>
    );
  }

  const isPassed = result?.resultStatus === "PASS";

  return (
    <div className="w-full p-4 lg:p-6 font-sans text-slate-700 antialiased box-border">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Navigation Breadcrumb */}
        <div className="text-xs text-slate-400 font-medium">
          <Link to="/student" className="hover:text-slate-600">Dashboard</Link>
          <span className="mx-2">/</span>
          <Link to="/student/exams" className="hover:text-slate-600">Exams</Link>
          <span className="mx-2">/</span>
          <span className="text-slate-600 font-semibold">Report Card</span>
        </div>

        {/* Performance Overview Summary Card */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="p-6 flex flex-col md:flex-row items-center justify-between gap-6 bg-gradient-to-b from-slate-50/50 to-white border-b border-slate-100">
            <div>
              <span className="text-[10px] font-black text-blue-600 uppercase tracking-wider block">
                Academic Transcript
              </span>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight mt-0.5">
                Examination Performance Report
              </h1>
              <p className="text-xs text-slate-400 font-mono mt-1">
                Exam Node ID: {result?.examId}
              </p>
            </div>

            {/* Dynamic Pass / Fail Badge */}
            <div className="text-center shrink-0">
              <span className={`text-xs font-black tracking-widest uppercase px-4 py-1.5 rounded-full border ${
                isPassed 
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200 shadow-sm shadow-emerald-50" 
                  : "bg-rose-50 text-rose-700 border-rose-200 shadow-sm shadow-rose-50"
              }`}>
                {result?.resultStatus}
              </span>
            </div>
          </div>

          {/* Core Analytics Summary Strip */}
          <div className="grid grid-cols-3 divide-x divide-slate-100 bg-slate-50/30 text-center py-4">
            <div>
              <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Marks Obtained</span>
              <span className="text-lg font-bold text-slate-800 mt-0.5 block">
                {result?.totalObtained} <span className="text-xs text-slate-400 font-normal">/ {result?.totalMax}</span>
              </span>
            </div>
            <div>
              <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Aggregate Weight</span>
              <span className="text-lg font-bold text-indigo-600 mt-0.5 block">
                {result?.percentage}%
              </span>
            </div>
            <div>
              <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Evaluation Outcome</span>
              <span className={`text-xs font-bold mt-1.5 inline-block ${isPassed ? "text-emerald-600" : "text-rose-600"}`}>
                {isPassed ? "🎯 Requirements Met" : "⚠️ Academic Probation"}
              </span>
            </div>
          </div>
        </div>

        {/* Subject-wise Marks Breakdown Table Table Component */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-100">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              📚 Course Module Grade Matrix
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/30 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-5">Course / Subject Module</th>
                  <th className="py-3 px-5 text-center">Marks Secured</th>
                  <th className="py-3 px-5 text-center">Maximum Structural Marks</th>
                  <th className="py-3 px-5 text-right">Proportional Standing</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-medium">
                {result?.subjectWise?.map((row, idx) => {
                  const itemPercentage = ((row.marksObtained / row.totalMarks) * 100).toFixed(1);
                  return (
                    <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3.5 px-5 font-bold text-slate-800 uppercase tracking-wide">
                        📖 {row.subject}
                      </td>
                      <td className="py-3.5 px-5 text-center font-bold text-slate-900">
                        {row.marksObtained}
                      </td>
                      <td className="py-3.5 px-5 text-center text-slate-400 font-semibold">
                        {row.totalMarks}
                      </td>
                      <td className="py-3.5 px-5 text-right">
                        <span className={`inline-block text-[10px] font-extrabold px-2 py-0.5 rounded-md ${
                          parseFloat(itemPercentage) >= 35 
                            ? "bg-slate-100 text-slate-700" 
                            : "bg-rose-50 text-rose-600 border border-rose-100"
                        }`}>
                          {itemPercentage}%
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}