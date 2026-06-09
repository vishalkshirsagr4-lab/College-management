import { lazy, Suspense, useEffect, useState } from "react";
import Card from "../../components/ui/Card";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import api from "../../utils/api";

const AnalyticsChart = lazy(() =>
  import("../../components/Charts/AnalyticsChart")
);

export default function AdminDashboard() {
  const [students, setStudents] = useState(0);
  const [faculty, setFaculty] = useState(0);
  const [exams, setExams] = useState([]);

  // ✅ Fetch all dashboard data
  const fetchData = async () => {
    try {
      const [studentsRes, facultyRes, examsRes] = await Promise.all([
        api.get("/api/admin/students"),
        api.get("/api/admin/faculty"),
        api.get("/api/admin/exams"),
      ]);

      setStudents(studentsRes.data.count || 0);
      setFaculty(facultyRes.data.count || 0);
      setExams(examsRes.data.data || []);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // ✅ Exam status logic
  const getExamStatus = (examDate) => {
    const now = new Date();
    const date = new Date(examDate);

    const isSameDay =
      date.toDateString() === now.toDateString();

    if (date > now) return "upcoming";
    if (isSameDay) return "ongoing";
    return "completed";
  };

  // ✅ Filter upcoming exams
  const upcomingExams = exams.filter(
    (e) => getExamStatus(e.examDate) === "upcoming"
  );

  // ✅ Get next exam date or 0
  const nextExam =
    upcomingExams.length > 0
      ? new Date(upcomingExams[0].examDate).toLocaleDateString()
      : 0;

  return (
    <div className="space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold text-slate-900">
          Admin Dashboard
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Overview of your system activity
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

        {/* Students */}
        <Card className="p-5 bg-white border border-slate-200 rounded-xl">
          <div className="text-sm text-slate-500">Students</div>
          <div className="mt-2 text-2xl font-semibold text-slate-900">
            {students}
          </div>
          <div className="mt-2 text-xs text-slate-500">
            Total registered students
          </div>
        </Card>

        {/* Faculty */}
        <Card className="p-5 bg-white border border-slate-200 rounded-xl">
          <div className="text-sm text-slate-500">Faculty</div>
          <div className="mt-2 text-2xl font-semibold text-slate-900">
            {faculty}
          </div>
          <div className="mt-2 text-xs text-slate-500">
            Active staff members
          </div>
        </Card>

        {/* Exams */}
        <Card className="p-5 bg-white border border-slate-200 rounded-xl">
          <div className="text-sm text-slate-500">Upcoming Exams</div>
          <div className="mt-2 text-2xl font-semibold text-slate-900">
            {nextExam}
          </div>
          <div className="mt-2 text-xs text-slate-500">
            {upcomingExams.length} pending exams
          </div>
        </Card>

      </div>

      {/* Chart */}
      <Card className="p-5 bg-white border border-slate-200 rounded-xl">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-medium text-slate-900">
              Enrollment & Attendance
            </div>
            <div className="text-xs text-slate-500">
              Last 30 days analytics
            </div>
          </div>

          <div className="text-xs text-slate-500 px-3 py-1 rounded-full bg-slate-50 border border-slate-200">
            Live data
          </div>
        </div>

        <div className="mt-5">
          <Suspense fallback={<LoadingSpinner label="Loading chart..." />}>
            <AnalyticsChart />
          </Suspense>
        </div>
      </Card>

    </div>
  );
}