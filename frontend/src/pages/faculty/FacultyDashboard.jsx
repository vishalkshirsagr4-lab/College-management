import { useEffect, useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../utils/api";

// --- HELPERS & PRIMITIVES ---
const WEEK_DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

function StatCard({ title, value, icon, bgClass = "bg-white text-slate-900" }) {
  return (
    <div className={`rounded-2xl border border-slate-200 p-5 shadow-sm flex items-center justify-between ${bgClass}`}>
      <div className="space-y-1">
        <span className="block text-xs font-bold uppercase tracking-wider text-slate-400">{title}</span>
        <span className="block text-2xl font-black font-mono leading-none">{value}</span>
      </div>
      <div className="p-3 rounded-xl bg-slate-50 border border-slate-100/80 text-blue-600 shrink-0">
        {icon}
      </div>
    </div>
  );
}

function ActionButton({ label, onClick, icon, colorClass = "bg-blue-600 hover:bg-blue-700" }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full flex items-center justify-between p-4 rounded-xl text-white font-bold transition-all shadow-sm group ${colorClass}`}
    >
      <div className="flex items-center gap-3">
        {icon}
        <span className="text-sm tracking-tight">{label}</span>
      </div>
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
      </svg>
    </button>
  );
}

// --- MAIN FACULTY DASHBOARD COMPONENT ---
export default function FacultyDashboardPage() {
  const navigate = useNavigate();

  // Application state data payloads
  const [profile, setProfile] = useState(null);
  const [students, setStudents] = useState([]);
  const [timetable, setTimetable] = useState([]);

  const [loading, setLoading] = useState(true);
  const [errorFeed, setErrorFeed] = useState("");

  // Determine today's textual weekday label (e.g., "monday")
  const currentDayNameStr = useMemo(() => {
    const dayIdx = new Date().getDay();
    return WEEK_DAYS[dayIdx].toLowerCase();
  }, []);

  // Fetch dashboard data sets concurrently
  const fetchDashboardWorkspaceData = useCallback(async () => {
    try {
      setLoading(true);
      setErrorFeed("");

      const [profileRes, studentsRes, timetableRes] = await Promise.all([
        api.get("/api/faculty/profile"),
        api.get("/api/faculty/students"),
        api.get("/api/faculty/timetable"),
      ]);

      setProfile(profileRes.data?.data || profileRes.data?.faculty || null);
      setStudents(studentsRes.data?.data || []);
      setTimetable(timetableRes.data?.data || []);
    } catch (err) {
      console.error("Dashboard synchronization error:", err);

      const status = err?.response?.status;
      const backendMessage = err?.response?.data?.message;
      const success = err?.response?.data?.success;

      if (status === 401) {
        setErrorFeed("Session expired. Please log in again.");
        return;
      }
      if (status === 403) {
        setErrorFeed("You don't have permission to view this faculty data.");
        return;
      }

      if (backendMessage) {
        setErrorFeed(backendMessage);
        return;
      }

      setErrorFeed(
        success === false
          ? "Request failed. Please try again."
          : "Failed to compile your faculty portal summary metrics."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardWorkspaceData();
  }, [fetchDashboardWorkspaceData]);

  // Compute total subjects assigned across teaching arrays profile definitions
  const totalAssignedSubjectsCount = useMemo(() => {
    if (!profile || !Array.isArray(profile.teachingAssignments)) return 0;
    return profile.teachingAssignments.reduce((acc, assignment) => {
      const count = Array.isArray(assignment?.subjects) ? assignment.subjects.length : 0;
      return acc + count;
    }, 0);
  }, [profile]);

  // Filter out timetable blocks matching today's weekday configuration
  const todaysScheduleList = useMemo(() => {
    if (!Array.isArray(timetable)) return [];
    return timetable
      .filter(slot => String(slot.day).toLowerCase().trim() === currentDayNameStr)
      .sort((a, b) => Number(a.periodNo) - Number(b.periodNo));
  }, [timetable, currentDayNameStr]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
          <p className="mt-3 text-xs font-bold text-slate-400 uppercase tracking-widest animate-pulse">Initializing Portal Hub...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-6 pb-12">
      <div className="mx-auto max-w-7xl space-y-6">
        
        {/* WELCOME BANNER COMPONENT CARD */}
        <div className="relative rounded-3xl border border-slate-200 bg-white p-6 md:p-8 shadow-sm overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-blue-600 to-indigo-600" />
          <div className="space-y-1">
            <h1 className="text-2xl font-black text-slate-900 md:text-3xl tracking-tight">
              Welcome Back, {profile?.userID?.name || "Professor"}
            </h1>
            <p className="text-sm text-slate-500 font-medium">
              Logged in designation: <span className="font-bold text-blue-600">{profile?.designation || "Faculty Member"}</span> • Department: <span className="font-bold text-slate-700">{profile?.department}</span>
            </p>
          </div>
          <div className="text-xs font-bold text-slate-400 bg-slate-100 border border-slate-200/60 px-4 py-2 rounded-xl h-fit self-start sm:self-center">
            {new Date().toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}
          </div>
        </div>

        {errorFeed && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
            {errorFeed}
          </div>
        )}

        {/* ANALYTICS BLOCK METRICS CARDS GRID */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Assigned Courses"
            value={totalAssignedSubjectsCount}
            icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>}
          />
          <StatCard
            title="Enrolled Student Pool"
            value={students.length}
            icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>}
          />
          <StatCard
            title="Total Weekly Periods"
            value={timetable.length}
            icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
          />
          <StatCard
            title="Today's Sessions"
            value={todaysScheduleList.length}
            icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>}
            bgClass={todaysScheduleList.length > 0 ? "bg-blue-600 text-white" : "bg-white text-slate-900"}
          />
        </div>

        {/* WORKSPACE SECTION CARD SPLITS GRID LAYOUT */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          
          {/* LEFT SUB PANEL: Today's Classroom Timeline Sessions Schedule */}
          <div className="lg:col-span-8">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm h-full flex flex-col justify-between">
              <div>
                <div className="mb-5 border-b border-slate-100 pb-3 flex items-center justify-between">
                  <h2 className="text-base font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-green-500 animate-ping" />
                    Today's Classroom Sessions Timetable
                  </h2>
                  <span className="text-xs font-bold text-slate-400 capitalize">{currentDayNameStr} Schedule</span>
                </div>

                {todaysScheduleList.length === 0 ? (
                  <div className="py-12 text-center rounded-xl bg-slate-50 border border-slate-100">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mx-auto text-slate-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                    <p className="text-sm font-semibold text-slate-500">No scheduled sessions active for today.</p>
                    <p className="text-xs text-slate-400 mt-1">Enjoy your free tracking window slot or handle administrative planning desk items.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {todaysScheduleList.map((slot) => (
                      <div key={slot._id || slot.id} className="group relative rounded-xl border border-slate-100 bg-white p-4 transition-all hover:border-slate-300 hover:shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="absolute left-0 inset-y-0 w-1 rounded-l-xl bg-blue-600" />
                        
                        <div className="flex items-center gap-4">
                          <div className="h-12 w-12 rounded-xl bg-slate-100 border border-slate-200/60 font-mono font-bold text-sm text-slate-700 flex flex-col items-center justify-center shrink-0">
                            <span className="text-[10px] uppercase text-slate-400 font-bold leading-none mb-0.5">Slot</span>
                            P{slot.periodNo}
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors uppercase">
                              {slot.subjectName}
                            </h4>
                            <div className="mt-1 flex flex-wrap gap-2 text-xs font-semibold text-slate-400">
                              <span className="text-slate-600">{slot.department} Sem {slot.semester} ({slot.section})</span>
                              <span>•</span>
                              <span className="font-mono">{slot.startTime} - {slot.endTime}</span>
                            </div>
                          </div>
                        </div>

                        <div className="sm:text-right shrink-0">
                          <span className="inline-block rounded-lg bg-slate-50 border border-slate-200 px-3 py-1 text-xs font-bold text-slate-700 font-mono">
                            {slot.room}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-medium text-slate-400">
                <span>Timetable sync integrity monitored strictly.</span>
                <span className="text-blue-600 font-bold cursor-pointer hover:underline" onClick={() => navigate("/faculty/profile")}>
                  Full Workload Profile →
                </span>
              </div>
            </div>
          </div>

          {/* RIGHT SUB PANEL: Utility Actions Shortcuts Menu Router Links Drawer */}
          <div className="lg:col-span-4 space-y-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">
              <div className="border-b border-slate-100 pb-3">
                <h2 className="text-base font-bold text-slate-900 uppercase tracking-wider">Quick Actions Portal</h2>
                <p className="text-xs text-slate-400 mt-0.5">Access faculty core tools registries shortcuts</p>
              </div>

              <div className="space-y-3">
                <ActionButton
                  label="Roll Attendance Tracking Desk"
                  onClick={() => navigate("/faculty/attendance/mark")}
                  icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>}
                  colorClass="bg-blue-600 hover:bg-blue-700 shadow-blue-100"
                />

                <ActionButton
                  label="Publish Assignment Handout"
                  onClick={() => navigate("/faculty/assignment/create")}
                  icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>}
                  colorClass="bg-indigo-600 hover:bg-indigo-700 shadow-indigo-100"
                />

                <ActionButton
                  label="Map Exam Core Subjects"
                  onClick={() => navigate("/faculty/exam/subjects")}
                  icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>}
                  colorClass="bg-slate-800 hover:bg-slate-900 shadow-slate-200"
                />

                <ActionButton
                  label="Log Test Evaluation Marks"
                  onClick={() => navigate("/faculty/exam/marks")}
                  icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                  colorClass="bg-emerald-600 hover:bg-emerald-700 shadow-emerald-100"
                />
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}