import { useEffect, useMemo, useState } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';

import {
  getStudentDashboard,
  getMyTeachers,
  getMySubjects,
  getMyAssignments,
  getMyMaterials,
  getMyAttendance,
  getMyNotices,
  getMyExams,
  getMyResults,
} from '../../api/student.api';

import LoadingSkeleton from '../../components/ui/LoadingSkeleton';
import StatCard from '../../components/ui/StatCard';

const StudentDashboard = () => {
  const [dashboard, setDashboard] = useState(null);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [exams, setExams] = useState([]);
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const dashboardRes = await getStudentDashboard();
        const dashboardData = dashboardRes.data.dashboard;

        if (!dashboardData) {
          setError('Student dashboard not available.');
          return;
        }

        const [
          teachersRes,
          subjectsRes,
          assignmentsRes,
          materialsRes,
          attendanceRes,
          noticesRes,
          examsRes,
          resultsRes,
        ] = await Promise.all([
          getMyTeachers(),
          getMySubjects(),
          getMyAssignments(),
          getMyMaterials(),
          getMyAttendance(),
          getMyNotices(),
          getMyExams(),
          getMyResults(),
        ]);

        setDashboard({
          ...dashboardData,
          teachers: teachersRes.data.teachers || [],
          subjects: subjectsRes.data.subjects || [],
          materials: materialsRes.data.materials || [],
          notices: noticesRes.data.notices || [],
          results: resultsRes.data.results || [],
        });

        setAssignments(assignmentsRes.data.assignments || []);
        setExams(examsRes.data.exams || []);

        const flatHistory = (attendanceRes.data.attendance || []).flatMap(
          (s) => s.history || []
        );
        setAttendanceRecords(flatHistory);
      } catch (err) {
        setError('Unable to load dashboard data.');
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  const attendanceSummary = useMemo(() => {
    const total = attendanceRecords.length;
    const present = attendanceRecords.filter((i) => i.status === 'Present').length;
    return {
      total,
      present,
      absent: total - present,
      rate: total ? Math.round((present / total) * 100) : 0,
    };
  }, [attendanceRecords]);

  const chartData = useMemo(() => {
    const map = {};
    attendanceRecords.forEach((item) => {
      const month = new Date(item.date).toLocaleString('default', {
        month: 'short',
      });

      if (!map[month]) map[month] = { month, Present: 0, Absent: 0 };
      map[month][item.status] += 1;
    });

    return Object.values(map).slice(0, 6);
  }, [attendanceRecords]);

  const assignmentsDue = assignments.filter(
    (a) => new Date(a.dueDate) >= new Date()
  );

  const upcomingExams = exams.filter(
    (e) => new Date(e.date) >= new Date()
  );

  const events = [
    ...assignmentsDue.slice(0, 2).map((a) => ({
      id: a._id,
      title: a.title,
      subtitle: `Due ${new Date(a.dueDate).toLocaleDateString()}`,
      when: a.dueDate,
      type: 'assignment',
    })),
    ...upcomingExams.slice(0, 3).map((e) => ({
      id: e._id,
      title: e.examName || 'Exam',
      subtitle: `Scheduled ${new Date(e.date).toLocaleDateString()}`,
      when: e.date,
      type: 'exam',
    })),
  ].sort((a, b) => new Date(a.when) - new Date(b.when));

  if (loading) return <LoadingSkeleton rows={4} columns={1} />;

  if (error)
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">
        {error}
      </div>
    );

  const { student = {} } = dashboard || {};

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8 bg-gray-50 min-h-screen">

      {/* Header */}
      <section className="rounded-3xl bg-white border border-gray-100 p-6 sm:p-8">
        <p className="text-xs tracking-widest text-blue-600 uppercase">
          Student Dashboard
        </p>

        <h1 className="mt-2 text-2xl sm:text-4xl font-bold text-gray-900">
          Welcome back, {student?.userId?.name || 'Student'}
        </h1>

        <p className="mt-2 text-gray-500 text-sm sm:text-base">
          Track attendance, assignments, exams and campus updates in one place.
        </p>
      </section>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          icon="📊"
          label="Attendance"
          value={`${attendanceSummary.rate}%`}
          detail={`${attendanceSummary.present}/${attendanceSummary.total}`}
          accent="blue"
        />
        <StatCard
          icon="📝"
          label="Assignments"
          value={assignmentsDue.length}
          detail="Pending"
          accent="amber"
        />
        <StatCard
          icon="📅"
          label="Exams"
          value={upcomingExams.length}
          detail="Upcoming"
          accent="green"
        />
        <StatCard
          icon="💰"
          label="Fees"
          value="₹0"
          detail="Demo placeholder"
          accent="red"
        />
      </div>

      {/* Chart + Notices */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* Chart */}
        <section className="bg-white rounded-3xl border border-gray-100 p-5">
          <h2 className="font-semibold text-gray-900">Attendance Trend</h2>
          <p className="text-sm text-gray-500 mb-4">
            Monthly attendance overview
          </p>

          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData.length ? chartData : [{ month: 'Jan', Present: 0, Absent: 0 }]}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="Present" stroke="#3b82f6" fill="#93c5fd" />
                <Area type="monotone" dataKey="Absent" stroke="#f97316" fill="#fed7aa" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* Notices */}
        <section className="bg-white rounded-3xl border border-gray-100 p-5">
          <h2 className="font-semibold text-gray-900">Recent Notices</h2>

          <div className="mt-4 space-y-3">
            {(dashboard?.notices || []).slice(0, 4).map((n) => (
              <div
                key={n._id}
                className="p-4 rounded-2xl bg-gray-50 border border-gray-100"
              >
                <p className="font-medium text-gray-900">{n.title}</p>
                <p className="text-sm text-gray-500 line-clamp-2">
                  {n.description}
                </p>
              </div>
            ))}

            {(!dashboard?.notices || dashboard.notices.length === 0) && (
              <p className="text-sm text-gray-500">No notices available</p>
            )}
          </div>
        </section>
      </div>

      {/* Events */}
      <section className="bg-white rounded-3xl border border-gray-100 p-5">
        <h2 className="font-semibold text-gray-900">Upcoming Events</h2>

        <div className="mt-4 space-y-3">
          {events.length === 0 ? (
            <p className="text-sm text-gray-500">No upcoming events</p>
          ) : (
            events.map((e) => (
              <div
                key={e.id}
                className="flex flex-col sm:flex-row sm:justify-between sm:items-center p-4 rounded-2xl bg-gray-50 border border-gray-100"
              >
                <div>
                  <p className="font-medium">{e.title}</p>
                  <p className="text-sm text-gray-500">{e.subtitle}</p>
                </div>

                <span className="text-xs text-gray-500 mt-2 sm:mt-0">
                  {new Date(e.when).toLocaleDateString()}
                </span>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
};

export default StudentDashboard;