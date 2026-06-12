import { useState, useEffect } from "react";
import api from "../../utils/api";

export default function StudentAttendancePage() {
  const [attendanceData, setAttendanceData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAttendanceRegistry = async () => {
      try {
        setLoading(true);
        setError("");

        // Invokes your backend endpoint matching /api/student/attendance/my
        const res = await api.get("/api/student/attendance/my");

        if (res.data?.success) {
          setAttendanceData(res.data.data);
        }
      } catch (err) {
        console.error("Attendance collection breakdown:", err);
        setError(err.response?.data?.message || "Operational failure parsing structural attendance sets.");
      } finally {
        setLoading(false);
      }
    };

    fetchAttendanceRegistry();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50/50 flex items-center justify-center p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-sm text-slate-400 font-bold tracking-wide uppercase">Compiling Attendance Ledger...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50/50 p-6 flex items-center justify-center">
        <div className="bg-white max-w-md w-full border border-rose-200 rounded-2xl p-6 text-center shadow-sm">
          <div className="text-3xl mb-2">⚠️</div>
          <h3 className="text-lg font-black text-slate-900">Synchronization Error</h3>
          <p className="text-slate-500 text-sm mt-1 font-medium">{error}</p>
        </div>
      </div>
    );
  }

  const { subjects = [], totalClasses = 0, attended = 0, overallPercentage = 0 } = attendanceData || {};
  
  // Dynamic color configuration helper matching compliance thresholds
  const getProgressColor = (percentage) => {
    if (percentage >= 75) return "bg-emerald-500";
    if (percentage >= 60) return "bg-amber-500";
    return "bg-rose-500";
  };

  const getTextThresholdColor = (percentage) => {
    if (percentage >= 75) return "text-emerald-600 bg-emerald-50 border-emerald-100";
    if (percentage >= 60) return "text-amber-600 bg-amber-50 border-amber-100";
    return "text-rose-600 bg-rose-50 border-rose-100";
  };

  return (
    <div className="min-h-screen bg-slate-50/50 p-4 md:p-10 font-sans text-slate-700 antialiased">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header Block */}
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Attendance Record</h1>
          <p className="text-slate-500 text-sm mt-1 font-medium">
            Monitor and evaluate structural subject-wise attendance percentages and verification parameters.
          </p>
        </div>

        {/* Global Summary Statistics Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm">
            <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Overall Ratio</span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-4xl font-black tracking-tight text-slate-900">
                {overallPercentage.toFixed(1)}%
              </span>
              <span className={`text-[10px] font-extrabold border px-2 py-0.5 rounded uppercase tracking-wide ${getTextThresholdColor(overallPercentage)}`}>
                {overallPercentage >= 75 ? "Compliant" : "Shortage"}
              </span>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full mt-4 overflow-hidden">
              <div className={`h-full transition-all duration-500 ${getProgressColor(overallPercentage)}`} style={{ width: `${Math.min(overallPercentage, 100)}%` }}></div>
            </div>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm flex flex-col justify-center">
            <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Lectures Attended</span>
            <span className="text-4xl font-black tracking-tight text-slate-900 mt-2">
              {attended} <span className="text-lg text-slate-300 font-medium">Sessions</span>
            </span>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm flex flex-col justify-center">
            <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Total Active Sessions</span>
            <span className="text-4xl font-black tracking-tight text-slate-900 mt-2">
              {totalClasses} <span className="text-lg text-slate-300 font-medium">Conducted</span>
            </span>
          </div>
        </div>

        {/* Subject wise Metrics Ledger Layout */}
        <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100 bg-slate-50/50">
            <h2 className="text-base font-bold text-slate-800">Subject Breakdown</h2>
            <p className="text-xs text-slate-400 mt-0.5">Absolute record mapping for individual track requirements.</p>
          </div>

          {subjects.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-sm italic font-medium">
              No formal track classes have been processed for your section profile.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {subjects.map((sub, index) => (
                <div key={index} className="p-5 md:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors hover:bg-slate-50/30">
                  
                  {/* Subject Name & Details */}
                  <div className="space-y-1 max-w-md w-full">
                    <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wide">
                      {sub.subject}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-slate-400 font-bold">
                      <span>Attended: {sub.attended}</span>
                      <span>/</span>
                      <span>Total: {sub.totalClasses}</span>
                    </div>
                  </div>

                  {/* Visual Progress Slider Integration */}
                  <div className="flex items-center gap-6 flex-1 sm:justify-end w-full">
                    <div className="hidden md:block w-48 bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div className={`h-full ${getProgressColor(sub.percentage)}`} style={{ width: `${Math.min(sub.percentage, 100)}%` }}></div>
                    </div>

                    {/* Percentage Display Block */}
                    <div className="text-right min-w-[70px]">
                      <span className={`text-sm font-black px-3 py-1 rounded-xl border ${getTextThresholdColor(sub.percentage)}`}>
                        {sub.percentage.toFixed(1)}%
                      </span>
                    </div>
                  </div>

                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}