import { useState, useEffect } from "react";
import api from "../../utils/api";

export default function FacultyNotificationFeed() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setLoading(true);
        setError("");
        
        // Faculty should fetch only their received notifications.
        // Backend route: GET /api/notification/my (role: student only)
        // So we use the shared global endpoint for faculty/Admin list.
        const res = await api.get("/api/notification/all");
        console.log(res.data.data);
        if (res.data?.success) {
          setNotifications(res.data.data);
        }
      } catch (err) {
        console.error("Error pulling notification stream:", err);
        setError(err.response?.data?.message || "Failed to download incoming notification registry.");
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50/50 p-6 md:p-12 font-sans text-slate-700 antialiased">
      <div className="max-w-4xl mx-auto">
        
        {/* Header Block */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Notice Inbox</h1>
            <p className="text-slate-500 text-sm mt-1 font-medium">
              Review systemic administrative transmissions and broadcast histories.
            </p>
          </div>
          <div className="bg-blue-50 text-blue-700 text-xs font-bold px-3 py-1.5 rounded-lg border border-blue-100 self-start md:self-auto">
            🔔 Total: {notifications.length} Records
          </div>
        </div>

        {/* Global Error Banner */}
        {error && (
          <div className="p-4 mb-6 rounded-xl border border-rose-200 bg-rose-50 text-rose-800 font-medium text-sm">
            ⚠️ {error}
          </div>
        )}

        {/* Dynamic List Rendering Layout */}
        {loading ? (
          <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center shadow-sm">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-sm text-slate-400 font-medium">Syncing official message streams...</p>
          </div>
        ) : notifications.length === 0 ? (
          /* Empty State View */
          <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center shadow-sm">
            <div className="text-4xl mb-3">📭</div>
            <h3 className="text-lg font-bold text-slate-800">Inbox is Clear</h3>
            <p className="text-sm text-slate-400 max-w-xs mx-auto mt-1 font-medium">
              No formal notices or administrative broadcasts have been flagged onto your network yet.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {notifications.map((notice) => {
              const isAdmin = notice.senderRole === "admin";
              
              return (
                <div 
                  key={notice._id} 
                  className={`bg-white rounded-2xl border transition-all p-5 md:p-6 shadow-sm flex flex-col md:flex-row gap-4 items-start ${
                    isAdmin ? "border-l-4 border-l-blue-600 border-slate-200/80" : "border-l-4 border-l-indigo-500 border-slate-200/80"
                  }`}
                >
                  {/* Badge & Meta Block */}
                  <div className="flex flex-row md:flex-col items-center md:items-start justify-between md:justify-start gap-2 w-full md:w-32 shrink-0">
                    <span 
                      className={`font-black text-[9px] uppercase tracking-wider px-2 py-0.5 rounded ${
                        isAdmin 
                          ? "bg-blue-100 text-blue-800 border border-blue-200" 
                          : "bg-indigo-100 text-indigo-800 border border-indigo-200"
                      }`}
                    >
                      {notice.senderRole}
                    </span>
                    <span className="text-[10px] text-slate-400 font-bold">
                      {new Date(notice.createdAt).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit"
                      })}
                    </span>
                  </div>

                  {/* Core Message Text Context */}
                  <div className="flex-1 space-y-1.5">
                    <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
                      {notice.title}
                    </h3>
                    <p className="text-sm text-slate-600 leading-relaxed font-medium whitespace-pre-line">
                      {notice.message}
                    </p>

                    {/* Target Scope Badges Footer */}
                    <div className="pt-3 flex flex-wrap gap-1.5 items-center">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mr-1">
                        Scope:
                      </span>
                      <span className="bg-slate-100 text-slate-600 font-extrabold text-[9px] px-2 py-0.5 rounded uppercase">
                        {notice.target}
                      </span>
                      {notice.department && (
                        <span className="bg-slate-100 text-slate-600 font-extrabold text-[9px] px-2 py-0.5 rounded uppercase">
                          Dept: {notice.department}
                        </span>
                      )}
                      {notice.semester && (
                        <span className="bg-slate-100 text-slate-600 font-extrabold text-[9px] px-2 py-0.5 rounded uppercase">
                          Sem {notice.semester}
                        </span>
                      )}
                      {notice.section && (
                        <span className="bg-slate-100 text-slate-600 font-extrabold text-[9px] px-2 py-0.5 rounded uppercase">
                          Sec {notice.section}
                        </span>
                      )}
                    </div>
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