import { useState, useEffect } from "react";
import api from "../../utils/api";

export default function StudentDashboard() {
  // Application state chunks
  const [profile, setProfile] = useState(null);
  const [timetable, setTimetable] = useState({});
  const [exams, setExams] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const DAYS = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];

  useEffect(() => {
    const fetchDashboardMetrics = async () => {
      try {
        setLoading(true);
        setError("");

        // Simultaneous high-speed execution block for all your endpoint queries
        const [profileRes, timetableRes, examsRes, notifyRes] = await Promise.all([
          api.get("/api/student/profile"),
          api.get("/api/student/timetable"),
          api.get("/api/student/exams"),
          api.get("/api/notification/my").catch(() => ({ data: { data: [] } })), // Fallback block if notification routing differs
        ]);
         console.log(profileRes.data.data);
        if (profileRes.data?.success) setProfile(profileRes.data.data);
        if (timetableRes.data?.success) setTimetable(timetableRes.data.data);
        if (examsRes.data?.success) setExams(examsRes.data.data);
        if (notifyRes.data?.success) setNotifications(notifyRes.data.data);

      } catch (err) {
        console.error("Dashboard ingestion error:", err);
        setError("Operational failure parsing linked academic datasets.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardMetrics();
  }, []);

  // Helper calculation tracking structural current day for micro-timetables
  const getCurrentDayTimetable = () => {
    const todayStr = new Date().toLocaleDateString("en-US", { weekday: "long" }).toLowerCase();
    return timetable[todayStr] || [];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50/50 flex items-center justify-center p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-sm text-slate-400 font-bold tracking-wide uppercase">Syncing Student Matrix...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50/50 p-6 flex items-center justify-center">
        <div className="bg-white max-w-md w-full border border-rose-200 rounded-2xl p-6 text-center shadow-sm">
          <div className="text-3xl mb-2">⚠️</div>
          <h3 className="text-lg font-black text-slate-900">Data Assembly Failure</h3>
          <p className="text-slate-500 text-sm mt-1 font-medium">{error}</p>
        </div>
      </div>
    );
  }

  const currentDayClasses = getCurrentDayTimetable();

  return (
    <div className="min-h-screen bg-slate-50/50 p-4 md:p-10 font-sans text-slate-700 antialiased">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Welcome Banner Block */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 md:p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white text-2xl font-black shadow-md border-2 border-white">
              {profile?.name?.charAt(0) || "S"}
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
                Welcome back, {profile?.name || "Academic Track"}
              </h1>
              <p className="text-slate-400 text-xs md:text-sm font-bold tracking-wide uppercase mt-0.5">
                {profile?.department} • Semester {profile?.semester} ({profile?.section || "A"})
              </p>
            </div>
          </div>

          {/* Quick Metrics Tracking Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 border-t md:border-t-0 pt-4 md:pt-0 border-slate-100">
            <div className="px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-center min-w-[100px]">
              <span className="block text-[10px] font-bold text-slate-400 uppercase">Attendance</span>
              <span className="text-base font-black text-emerald-600">{profile?.attendancePercentage || "0"}%</span>
            </div>
            <div className="px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-center min-w-[100px]">
              <span className="block text-[10px] font-bold text-slate-400 uppercase">CGPA Mark</span>
              <span className="text-base font-black text-blue-600">{profile?.cgpa || "N/A"}</span>
            </div>
            <div className="hidden sm:block px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-center min-w-[100px]">
              <span className="block text-[10px] font-bold text-slate-400 uppercase">Fee Status</span>
              <span className={`text-xs font-black px-2 py-0.5 rounded uppercase ${profile?.feeStatus?.toLowerCase() === "paid" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"}`}>
                {profile?.feeStatus || "Pending"}
              </span>
            </div>
          </div>
        </div>

        {/* Core Layout Split */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column Stack (Timetable & Examinations) */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Today's Lectures Tracking Board */}
            <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
              <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                <div>
                  <h2 className="text-base font-bold text-slate-800">Today's Class Lineup</h2>
                  <p className="text-xs text-slate-400 mt-0.5">Live monitoring of standard structural track assignments.</p>
                </div>
                <span className="bg-blue-100 text-blue-800 font-extrabold text-[10px] uppercase px-2.5 py-1 rounded-md tracking-wider">
                  Active
                </span>
              </div>

              <div className="p-5">
                {currentDayClasses.length === 0 ? (
                  <div className="text-center py-8 text-slate-400 text-sm italic font-medium">
                    No classroom sequences scheduled for today. Enjoy your free block!
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {currentDayClasses.sort((a,b) => a.periodNo - b.periodNo).map((slot) => (
                      <div key={slot._id} className="py-3.5 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
                        <div className="space-y-0.5">
                          <span className="text-xs font-black text-slate-900 uppercase tracking-wide">
                            {slot.subjectName}
                          </span>
                          <div className="flex items-center gap-2 text-[11px] text-slate-400 font-medium">
                            <span>Period {slot.periodNo}</span>
                            <span>•</span>
                            <span>{slot.startTime} - {slot.endTime}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="bg-indigo-50 text-indigo-700 border border-indigo-100 font-bold text-xs px-3 py-1 rounded-xl">
                            🚪 Room {slot.room}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Examination Status Track */}
            <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
              <div className="p-5 border-b border-slate-100 bg-slate-50/50">
                <h2 className="text-base font-bold text-slate-800">Active Examination Programs</h2>
                <p className="text-xs text-slate-400 mt-0.5">Upcoming evaluation milestones issued by administration mapping fields.</p>
              </div>
              <div className="p-5">
                {exams.length === 0 ? (
                  <div className="text-center py-8 text-slate-400 text-sm italic font-medium">
                    No administrative exams registered at this stage.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs font-medium">
                      <thead>
                        <tr className="text-slate-400 uppercase tracking-wider border-b border-slate-100">
                          <th className="pb-3 font-bold">Exam Designation</th>
                          <th className="pb-3 font-bold">Launch Date</th>
                          <th className="pb-3 font-bold text-center">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {/* Replace the exam rendering map sequence with this corrected snippet */}
                          {exams.slice(0, 4).map((ex) => (
                            <tr key={ex._id} className="hover:bg-slate-50/50 transition-colors">
                              {/* FIX: Changed ex.name to ex.examName */}
                              <td className="py-3 font-bold text-slate-900">{ex.examName || "Unnamed Assessment"}</td>
                              <td className="py-3 text-slate-500">
                                {new Date(ex.examDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                              </td>
                              <td className="py-3 text-center">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                                  ex.status === "upcoming" ? "bg-blue-100 text-blue-800" : 
                                  ex.status === "ongoing" ? "bg-amber-100 text-amber-800" : 
                                  "bg-slate-100 text-slate-500"
                                }`}>
                      {ex.status}
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

          </div>

          {/* Right Column Stack (Notification Channels Feed) */}
          <div className="space-y-6">
            
            {/* Real-time Central Notice Banner Feed */}
            <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden flex flex-col h-[525px]">
              <div className="p-5 border-b border-slate-100 bg-slate-50/50 shrink-0">
                <h2 className="text-base font-bold text-slate-800">System Notification Feed</h2>
                <p className="text-xs text-slate-400 mt-0.5">Critical system broadcasts filtered to your cohort profile.</p>
              </div>

              <div className="p-5 overflow-y-auto flex-1 space-y-4 divide-y divide-slate-50">
                {notifications.length === 0 ? (
                  <div className="text-center py-12 text-slate-300 text-xs italic font-medium">
                    No active notifications available.
                  </div>
                ) : (
                  notifications.map((note) => (
                    <div key={note._id} className="pt-3 first:pt-0 space-y-1">
                      <div className="flex justify-between items-start gap-2">
                        <span className={`text-[9px] font-black tracking-wider uppercase px-1.5 py-0.5 rounded shrink-0 ${
                          note.senderRole === "admin" ? "bg-blue-100 text-blue-800" : "bg-indigo-100 text-indigo-800"
                        }`}>
                          {note.senderRole}
                        </span>
                        <span className="text-[10px] text-slate-400 font-bold">
                          {new Date(note.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                      <h4 className="text-xs font-extrabold text-slate-900 tracking-tight">{note.title}</h4>
                      <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">{note.message}</p>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}