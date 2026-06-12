import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../../utils/api";

export default function StudentAllExamsPage() {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchExams = async () => {
      try {
        setLoading(true);
        setError("");

        // Hits backend route: router.get("/exams", authMiddleware, getAllExams);
        const res = await api.get("/api/student/exams");

        if (res.data?.success) {
          setExams(res.data.data || []);
        }
      } catch (err) {
        console.error("Error fetching exams list:", err);
        setError(err.response?.data?.message || "Operational failure fetching exam schedules.");
      } finally {
        setLoading(false);
      }
    };

    fetchExams();
  }, []);

  // Format Helper for Exam Dates
  const formatDate = (dateStr) => {
    if (!dateStr) return "TBD";
    return new Date(dateStr).toLocaleDateString(undefined, {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Status Styling Dictionary
  const statusConfig = {
    upcoming: {
      badge: "bg-blue-50 text-blue-700 border-blue-200",
      dot: "bg-blue-500",
    },
    ongoing: {
      badge: "bg-amber-50 text-amber-700 border-amber-200 animate-pulse",
      dot: "bg-amber-500",
    },
    completed: {
      badge: "bg-slate-100 text-slate-600 border-slate-200",
      dot: "bg-slate-400",
    },
  };

  if (loading) {
    return (
      <div className="w-full h-96 flex items-center justify-center p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto mb-3"></div>
          <p className="text-xs text-slate-400 font-bold tracking-wider uppercase">Syncing Examination Matrix...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full p-6 flex items-center justify-center">
        <div className="bg-white max-w-md w-full border border-rose-200 rounded-2xl p-6 text-center shadow-sm">
          <div className="text-2xl mb-2">⚠️</div>
          <h3 className="text-sm font-bold text-slate-900">Sync Failure</h3>
          <p className="text-slate-500 text-xs mt-1 font-medium">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full p-4 lg:p-6 font-sans text-slate-700 antialiased box-border">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Page Header */}
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Examinations & Assessments</h1>
          <p className="text-xs text-slate-400 font-medium mt-0.5 uppercase tracking-wide">
            Track structural syllabi, operational active timelines, and finalized score distributions.
          </p>
        </div>

        {/* Exams Grid/List Layout */}
        {exams.length === 0 ? (
          <div className="text-center py-16 bg-white border border-slate-200 rounded-2xl shadow-sm">
            <span className="text-3xl block mb-2">📅</span>
            <p className="text-xs text-slate-400 font-medium italic">No structural examinations registered for your branch profiles yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {exams.map((exam) => {
              const currentStatus = statusConfig[exam.status] || { badge: "bg-slate-50 text-slate-600", dot: "bg-slate-400" };
              
              return (
                <div 
                  key={exam._id} 
                  className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between gap-4"
                >
                  {/* Top Block: Badges and Title */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <span className="text-[10px] font-mono text-slate-400 bg-slate-50 border border-slate-100 px-2 py-0.5 rounded-md">
                        Sem {exam.semester} • {exam.department}
                      </span>
                      <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full border uppercase tracking-wider flex items-center gap-1.5 ${currentStatus.badge}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${currentStatus.dot}`} />
                        {exam.status}
                      </span>
                    </div>

                    <div>
                      <h2 className="text-base font-bold text-slate-900 tracking-tight leading-snug">
                        {exam.examName}
                      </h2>
                      <p className="text-xs text-slate-400 font-medium mt-1 flex items-center gap-1.5">
                        <span>📅 Start Date:</span> 
                        <span className="text-slate-600 font-semibold">{formatDate(exam.examDate)}</span>
                      </p>
                    </div>
                  </div>

                  {/* Divider Line */}
                  <div className="border-t border-slate-100 pt-3 flex items-center justify-between gap-2">
                    
                    {/* Primary Syllabus Routing Button */}
                    <Link
                      to={`/student/exams/${exam._id}`}
                      className="text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50/50 hover:bg-blue-50 px-3 py-2 rounded-xl transition-colors flex items-center gap-1"
                    >
                      <span>📋</span> View Syllabus
                    </Link>

                    {/* Conditional Result Scorecard Link */}
                    {exam.status === "completed" ? (
                      <Link
                        to={`/student/exams/${exam._id}/result`}
                        className="text-xs font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-3 py-2 rounded-xl border border-emerald-100 transition-colors flex items-center gap-1"
                      >
                        <span>🎯</span> View Result
                      </Link>
                    ) : (
                      <span className="text-[10px] font-bold text-slate-300 bg-slate-50/50 px-3 py-2 rounded-xl cursor-not-allowed select-none border border-dashed border-slate-100">
                        Result Sealed
                      </span>
                    )}

                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
}