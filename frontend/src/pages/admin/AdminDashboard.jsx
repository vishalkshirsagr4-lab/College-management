import { lazy, Suspense, useEffect, useState, useMemo } from "react";
import api from "../../utils/api";
import LoadingSpinner from "../../components/ui/LoadingSpinner";

const AnalyticsChart = lazy(() => import("../../components/Charts/AnalyticsChart"));

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({ students: 0, faculty: 0, exams: [] });

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [s, f, e] = await Promise.all([
          api.get("/api/admin/students"),
          api.get("/api/admin/faculty"),
          api.get("/api/admin/exams"),
        ]);
        setData({ 
          students: s.data.count || 0, 
          faculty: f.data.count || 0, 
          exams: e.data.data || [] 
        });
      } catch (err) { 
        console.error("Dashboard error:", err); 
      } finally { 
        setLoading(false); 
      }
    };
    fetchAll();
  }, []);

  const { upcoming, nextDate } = useMemo(() => {
    const now = new Date();
    const list = data.exams
      .filter((e) => new Date(e.examDate) > now)
      .sort((a, b) => new Date(a.examDate) - new Date(b.examDate));
      
    return { 
      upcoming: list.length, 
      nextDate: list.length > 0 
        ? new Date(list[0].examDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) 
        : "No Exams" 
    };
  }, [data.exams]);

  if (loading) return <div className="flex h-screen items-center justify-center bg-neutral-50"><LoadingSpinner /></div>;

  return (
    <div className="min-h-screen bg-neutral-50 p-6 md:p-10 antialiased">
      <div className="max-w-7xl mx-auto space-y-10">
        
        {/* Header */}
        <header>
          <h1 className="text-3xl font-extrabold text-neutral-900 tracking-tight">Admin Dashboard</h1>
          <p className="text-neutral-500 mt-1 font-medium">Real-time overview of system metrics.</p>
        </header>

        {/* Stats Grid - Floating Cards */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { label: "TOTAL STUDENTS", val: data.students, sub: "Registered users" },
            { label: "ACTIVE FACULTY", val: data.faculty, sub: "Staff members" },
            { label: "NEXT EXAM", val: nextDate, sub: `${upcoming} pending exams` }
          ].map((stat, i) => (
            <div key={i} className="group bg-white p-7 rounded-3xl border border-neutral-200 shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
              <p className="text-[10px] font-bold text-neutral-400 tracking-[0.2em]">{stat.label}</p>
              <p className="text-4xl font-bold text-neutral-900 mt-3">{stat.val}</p>
              <p className="text-xs text-neutral-500 mt-2 font-medium">{stat.sub}</p>
            </div>
          ))}
        </section>

{/* Analytics Section */}
<section className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
  <div className="flex justify-between items-center mb-8">
    <div>
      <h2 className="text-xl font-bold text-slate-900">
        Analytics
      </h2>

      <p className="text-sm text-slate-500">
        Last 30 days of platform activity
      </p>
    </div>

    <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 text-blue-600 border border-blue-100 text-xs font-semibold">
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-500 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
      </span>
      LIVE DATA
    </div>
  </div>

  <div className="w-full overflow-x-auto">
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-20 text-slate-400 text-sm">
          Loading chart...
        </div>
      }
    >
      <AnalyticsChart />
    </Suspense>
  </div>
</section>

      </div>
    </div>
  );
}