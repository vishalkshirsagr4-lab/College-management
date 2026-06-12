import { useState, useEffect } from "react";
import api from "../../utils/api";

export default function StudentTimetablePage() {
  const [timetable, setTimetable] = useState({});
  const [activeDay, setActiveDay] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const DAYS_OF_WEEK = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];

  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        setLoading(true);
        setError("");
        
        // Hits your configured GET route: router.get("/timetable", authMiddleware, getStudentTimetable);
        const res = await api.get("/api/student/timetable");

        if (res.data?.success) {
          const scheduleData = res.data.data;
          setTimetable(scheduleData);

          // Set default viewable tab to current day, or fallback to Monday
          const currentDayName = new Date()
            .toLocaleDateString("en-US", { weekday: "long" })
            .toLowerCase();
          
          if (DAYS_OF_WEEK.includes(currentDayName) && scheduleData[currentDayName]?.length > 0) {
            setActiveDay(currentDayName);
          } else {
            // Find first day that contains periods, otherwise settle on monday
            const firstPopulatedDay = DAYS_OF_WEEK.find(day => scheduleData[day]?.length > 0);
            setActiveDay(firstPopulatedDay || "monday");
          }
        }
      } catch (err) {
        console.error("Timetable fetch sequence failed:", err);
        setError(err.response?.data?.message || "Could not retrieve your academic timeline registry.");
      } finally {
        setLoading(false);
      }
    };

    fetchSchedule();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50/50 flex items-center justify-center p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-sm text-slate-400 font-bold tracking-wide uppercase">Assembling Class Matrix...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50/50 p-6 flex items-center justify-center">
        <div className="bg-white max-w-md w-full border border-rose-200 rounded-2xl p-6 text-center shadow-sm">
          <div className="text-3xl mb-2">⚠️</div>
          <h3 className="text-lg font-black text-slate-900">Fetch Interrupted</h3>
          <p className="text-slate-500 text-sm mt-1 font-medium">{error}</p>
        </div>
      </div>
    );
  }

  // Safely extract and sort current day slots by period index
  const activeDayClasses = timetable[activeDay] || [];
  const sortedClasses = [...activeDayClasses].sort((a, b) => a.periodNo - b.periodNo);

  return (
    <div className="min-h-screen bg-slate-50/50 p-4 md:p-10 font-sans text-slate-700 antialiased">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Title Heading info */}
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Class Timetable</h1>
          <p className="text-slate-500 text-sm mt-1 font-medium">
            Manage your daily course load tracking, physical room boundaries, and lecture intervals.
          </p>
        </div>

        {/* Day Selectors Navigation Tabs Row */}
        <div className="flex flex-wrap gap-2 p-1.5 bg-slate-200/60 rounded-xl max-w-3xl">
          {DAYS_OF_WEEK.map((day) => {
            const hasClasses = timetable[day] && timetable[day].length > 0;
            const isSelected = activeDay === day;

            return (
              <button
                key={day}
                onClick={() => setActiveDay(day)}
                className={`flex-1 min-w-[100px] text-xs font-bold py-2.5 px-3 rounded-lg capitalize transition-all ${
                  isSelected
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-slate-500 hover:text-slate-800 hover:bg-white/40"
                }`}
              >
                {day}
                {hasClasses && (
                  <span className={`ml-1.5 inline-block w-1.5 h-1.5 rounded-full ${isSelected ? "bg-blue-600" : "bg-slate-400"}`} />
                )}
              </button>
            );
          })}
        </div>

        {/* Dynamic Class Cards Schedule Presentation Block */}
        <div className="space-y-4">
          {sortedClasses.length === 0 ? (
            /* Empty State for days without scheduled modules */
            <div className="bg-white border border-slate-200/80 rounded-2xl p-12 text-center shadow-sm max-w-3xl">
              <div className="text-4xl mb-3">☕</div>
              <h3 className="text-base font-bold text-slate-800 capitalize">{activeDay} is Off</h3>
              <p className="text-xs text-slate-400 max-w-xs mx-auto mt-1 font-medium">
                No academic lectures have been recorded onto your section profile for this calendar index block.
              </p>
            </div>
          ) : (
            sortedClasses.map((slot) => (
              <div 
                key={slot._id} 
                className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm hover:shadow-md/50 transition-all max-w-3xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-l-4 border-l-blue-600"
              >
                {/* Structural Identification Block */}
                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 rounded-xl bg-blue-50 border border-blue-100 flex flex-col items-center justify-center text-blue-600 shrink-0">
                    <span className="text-[10px] font-black uppercase tracking-wider leading-none">Pd</span>
                    <span className="text-lg font-black leading-none mt-0.5">{slot.periodNo}</span>
                  </div>
                  
                  <div className="space-y-0.5">
                    <h3 className="text-base font-extrabold text-slate-900 uppercase tracking-tight">
                      {slot.subjectName}
                    </h3>
                    <p className="text-xs text-slate-400 font-bold flex flex-wrap items-center gap-x-2 gap-y-0.5">
                      <span>Faculty Assignment Profile:</span>
                      <span className="text-slate-600 uppercase">
                        {slot.facultyId?.designation || "Assigned Professor"} ({slot.facultyId?.department || "Dept"})
                      </span>
                    </p>
                  </div>
                </div>

                {/* Logistics Coordinates block */}
                <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100 shrink-0">
                  <span className="text-xs font-bold text-slate-800 bg-slate-100 border border-slate-200 px-3 py-1 rounded-xl">
                    ⏱️ {slot.startTime} - {slot.endTime}
                  </span>
                  <span className="text-xs font-black text-indigo-700 bg-indigo-50 border border-indigo-100 px-3 py-1 rounded-xl">
                    🚪 Room {slot.room}
                  </span>
                </div>

              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
}