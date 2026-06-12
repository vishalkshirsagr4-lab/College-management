import { useState, useEffect } from "react";
import api from "../../utils/api";

export default function FacultyTimetablePage() {
  const [timetableData, setTimetableData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedSlot, setSelectedSlot] = useState(null);

  // Core Days array matching standard lowercase backend schemas
  const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  
  // Mapping standard academic Period Blocks to display labels and times
  const PERIODS = [
    { number: 1, label: "Period 1", time: "09:00 AM - 10:00 AM" },
    { number: 2, label: "Period 2", time: "10:00 AM - 11:00 AM" },
    { number: 3, label: "Period 3", time: "11:00 AM - 12:00 PM" },
    { number: 4, label: "Period 4", time: "02:00 PM - 03:00 PM" },
    { number: 5, label: "Period 5", time: "03:00 PM - 04:00 PM" },
    { number: 6, label: "Period 6", time: "04:00 PM - 05:00 PM" },
  ];

  useEffect(() => {
    const fetchTimetable = async () => {
      try {
        setLoading(true);
        setError("");
        const res = await api.get("/api/faculty/timetable");
        
        if (res.data?.success) {
          setTimetableData(res.data.data);
        }
      } catch (err) {
        console.error("Timetable retrieval failure:", err);
        setError(err.response?.data?.message || "Failed to load current scheduled matrix.");
      } finally {
        setLoading(false);
      }
    };

    fetchTimetable();
  }, []);

  // FIXED: Matches backend structure directly via day tracking strings and period numbers
  const findScheduleSlot = (dayName, periodNum) => {
    return timetableData.find(
      (item) => 
        item.day?.toLowerCase().trim() === dayName.toLowerCase().trim() && 
        Number(item.periodNo) === Number(periodNum)
    );
  };

  return (
    <div className="min-h-screen bg-slate-50/50 p-6 md:p-12 font-sans text-slate-700 antialiased">
      <div className="max-w-7xl mx-auto">
        
        {/* Header Block */}
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Teaching Schedule</h1>
          <p className="text-slate-500 text-sm mt-1 font-medium">
            Monitor allocated lecture commitments, room assignments, and cohort tracks seamlessly.
          </p>
        </div>

        {/* Global Notifications Panel */}
        {error && (
          <div className="p-4 mb-6 rounded-xl border border-rose-200 bg-rose-50 text-rose-800 font-medium text-sm">
            ⚠️ {error}
          </div>
        )}

        {/* Loading Indicator View */}
        {loading ? (
          <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center shadow-sm">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-sm text-slate-400 font-medium">Syncing active administrative timetable blueprints...</p>
          </div>
        ) : timetableData.length === 0 ? (
          /* Empty State View */
          <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center shadow-sm">
            <div className="text-4xl mb-3">📅</div>
            <h3 className="text-lg font-bold text-slate-800">No Routines Assigned</h3>
            <p className="text-sm text-slate-400 max-w-sm mx-auto mt-1 font-medium">
              You are currently free from scheduled assignments, or your department management has not configured this semester block yet.
            </p>
          </div>
        ) : (
          /* Structured Table Calendar Layout Grid */
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left table-fixed min-w-[1000px]">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="p-4 text-xs font-bold uppercase tracking-wider text-slate-400 w-40 border-r border-slate-100">
                      Period / Time
                    </th>
                    {DAYS.map((day) => (
                      <th key={day} className="p-4 text-xs font-bold uppercase tracking-wider text-slate-900 text-center">
                        {day}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {PERIODS.map((period) => (
                    <tr key={period.number} className="hover:bg-slate-50/50 transition-colors group">
                      {/* Left Time Label Column */}
                      <td className="p-4 border-r border-slate-100 bg-slate-50/30 group-hover:bg-slate-50 transition-colors">
                        <div className="font-bold text-xs text-slate-800">{period.label}</div>
                        <div className="text-[11px] text-slate-400 font-medium mt-0.5">{period.time}</div>
                      </td>

                      {/* Day Cells Mapping loop */}
                      {DAYS.map((day) => {
                        const matchedClass = findScheduleSlot(day, period.number);
                        
                        return (
                          <td key={day} className="p-2 h-28 align-middle border-r border-slate-100 last:border-r-0">
                            {matchedClass ? (
                              <div
                                onClick={() => setSelectedSlot(matchedClass)}
                                className="h-full w-full p-3 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50/50 border border-blue-100 text-left transition-all hover:shadow-md hover:border-blue-300 cursor-pointer flex flex-col justify-between"
                              >
                                <div>
                                  {/* FIXED: Uses subjectName instead of subject */}
                                  <div className="font-extrabold text-slate-900 text-xs uppercase tracking-wide line-clamp-1">
                                    {matchedClass.subjectName || "Assigned Lecture"}
                                  </div>
                                  <div className="text-[10px] text-slate-400 mt-0.5 font-bold">
                                    {matchedClass.department} • Sem {matchedClass.semester}
                                  </div>
                                </div>
                                
                                <div className="flex justify-between items-center mt-2 pt-1 border-t border-blue-100/60">
                                  <span className="bg-blue-600 text-white font-extrabold text-[9px] px-1.5 py-0.5 rounded uppercase tracking-wide">
                                    Sec {matchedClass.section || "A"}
                                  </span>
                                  {/* FIXED: Uses room instead of roomNo */}
                                  <span className="text-[10px] font-bold text-indigo-600">
                                    🚪 Rm {matchedClass.room || "N/A"}
                                  </span>
                                </div>
                              </div>
                            ) : (
                              <div className="h-full w-full rounded-xl border border-dashed border-slate-100 flex items-center justify-center text-slate-300 text-[10px] font-medium italic select-none">
                                Free Slot
                              </div>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Inspections Context Details Overlay Modal */}
        {selectedSlot && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full overflow-hidden transition-all animate-in fade-in zoom-in-95 duration-200">
              <div className="p-6 border-b border-slate-100 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="bg-white/20 text-white font-bold text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-md">
                      Lecture Metadata Profile
                    </span>
                    {/* FIXED: Uses subjectName instead of subject */}
                    <h3 className="text-2xl font-black mt-1 tracking-tight uppercase">
                      {selectedSlot.subjectName}
                    </h3>
                  </div>
                  <button 
                    onClick={() => setSelectedSlot(null)}
                    className="text-white/70 hover:text-white transition-colors text-xl font-bold bg-white/10 hover:bg-white/20 h-8 w-8 rounded-full flex items-center justify-center"
                  >
                    ✕
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
                    <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide">Day Allocation</span>
                    <span className="text-sm font-bold text-slate-800 capitalize">{selectedSlot.day}</span>
                  </div>
                  <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
                    <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide">Target Venue</span>
                    {/* FIXED: Uses room instead of roomNo */}
                    <span className="text-sm font-bold text-blue-600">Room {selectedSlot.room || "N/A"}</span>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
                  <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide">Time Window (Period {selectedSlot.periodNo})</span>
                  <span className="text-sm font-bold text-slate-800">
                    {selectedSlot.startTime} - {selectedSlot.endTime}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-2 text-center">
                  <div className="p-2 border border-slate-100 rounded-lg bg-slate-50/50">
                    <div className="text-[10px] font-bold text-slate-400 uppercase">Department</div>
                    <div className="text-xs font-extrabold text-slate-700 mt-0.5">{selectedSlot.department}</div>
                  </div>
                  <div className="p-2 border border-slate-100 rounded-lg bg-slate-50/50">
                    <div className="text-[10px] font-bold text-slate-400 uppercase">Semester</div>
                    <div className="text-xs font-extrabold text-slate-700 mt-0.5">Sem {selectedSlot.semester}</div>
                  </div>
                  <div className="p-2 border border-slate-100 rounded-lg bg-slate-50/50">
                    <div className="text-[10px] font-bold text-slate-400 uppercase">Section</div>
                    <div className="text-xs font-extrabold text-slate-700 mt-0.5">Section {selectedSlot.section || "A"}</div>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
                <button
                  onClick={() => setSelectedSlot(null)}
                  className="px-4 py-2 bg-slate-200 text-slate-700 font-bold text-xs uppercase tracking-wider rounded-xl hover:bg-slate-300 transition-colors"
                >
                  Dismiss Profile View
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}