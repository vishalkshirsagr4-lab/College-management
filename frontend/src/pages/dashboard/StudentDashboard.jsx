import { useEffect, useMemo, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { getAttendance, getAssignments, getExams, getStudentDashboard } from '../../api/student.api';
import LoadingSkeleton from '../../components/ui/LoadingSkeleton';
import StatCard from '../../components/ui/StatCard';

const StudentDashboard = () => {
  const [dashboard, setDashboard] = useState(null);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [exams, setExams] = useState([]);
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

        setDashboard(dashboardData);
        const studentId = dashboardData.student?._id;

        const [attendanceRes, assignmentsRes, examsRes] = await Promise.all([
          getAttendance(studentId),
          getAssignments(),
          getExams(),
        ]);

        setAttendanceRecords(attendanceRes.data.attendance || []);
        setAssignments(assignmentsRes.data.assignments || []);
        setExams(examsRes.data.exams || []);
      } catch (err) {
        console.error(err);
        setError('Unable to load dashboard data.');
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  const attendanceSummary = useMemo(() => {
    const total = attendanceRecords.length;
    const present = attendanceRecords.filter((item) => item.status === 'Present').length;
    const absent = total - present;
    return {
      total,
      present,
      absent,
      rate: total ? Math.round((present / total) * 100) : 0,
    };
  }, [attendanceRecords]);

  const chartData = useMemo(() => {
    const monthMap = {};
    attendanceRecords.forEach((item) => {
      const month = new Date(item.date).toLocaleString('default', { month: 'short' });
      if (!monthMap[month]) monthMap[month] = { month, Present: 0, Absent: 0 };
      monthMap[month][item.status] += 1;
    });
    return Object.values(monthMap).slice(0, 6);
  }, [attendanceRecords]);

  const pendingAssignments = assignments.filter((assignment) => new Date(assignment.dueDate) >= new Date());
  const upcomingExams = exams.filter((exam) => new Date(exam.date) >= new Date());
  const events = [
    ...pendingAssignments.slice(0, 2).map((assignment) => ({
      id: assignment._id,
      title: assignment.title,
      subtitle: `Assignment due ${new Date(assignment.dueDate).toLocaleDateString()}`,
      when: assignment.dueDate,
      type: 'assignment',
    })),
    ...upcomingExams.slice(0, 3).map((exam) => ({
      id: exam._id,
      title: exam.examName || 'Exam',
      subtitle: `Exam scheduled ${new Date(exam.date).toLocaleDateString()}`,
      when: exam.date,
      type: 'exam',
    })),
  ].sort((a, b) => new Date(a.when) - new Date(b.when));

  if (loading) {
    return <LoadingSkeleton rows={3} columns={1} />;
  }

  if (error) {
    return <div className="section-card">{error}</div>;
  }

  const { student, notices, feesSummary = {} } = dashboard;

  return (
    <div>
      <div className="section-card">
        <div>
          <h1 className="page-title">Welcome back, {student.userId?.name || 'Student'} 👋</h1>
          <p className="page-description">A clean snapshot of your attendance, assignments, exams, and campus notices.</p>
        </div>
      </div>

      <div className="panel-grid columns-4">
        <StatCard icon="📌" label="Attendance" value={`${attendanceSummary.rate}%`} detail={`${attendanceSummary.present} of ${attendanceSummary.total} days present`} />
        <StatCard icon="📝" label="Pending Assignments" value={pendingAssignments.length} detail="Due assignments still open" />
        <StatCard icon="📅" label="Upcoming Exams" value={upcomingExams.length} detail="Exams scheduled soon" />
        <StatCard icon="💰" label="Fee Status" value={`₹${feesSummary.unpaidAmount || 0}`} detail={`Outstanding of ₹${feesSummary.totalAmount || 0}`} />
      </div>

      <div className="panel-grid columns-2">
        <section className="section-panel">
          <div className="section-header">
            <h2>Attendance trend</h2>
            <p className="text-muted">Monthly presence vs absence for your current active subjects.</p>
          </div>
          <div style={{ height: 320 }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData.length ? chartData : [{ month: 'Jan', Present: 0, Absent: 0 }] }>
                <defs>
                  <linearGradient id="presentGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.6} />
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.05} />
                  </linearGradient>
                  <linearGradient id="absentGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.6} />
                    <stop offset="95%" stopColor="#f97316" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="4 4" stroke="rgba(15,23,42,0.08)" />
                <XAxis dataKey="month" tick={{ fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: 20, border: '1px solid rgba(15,23,42,0.08)' }} />
                <Area type="monotone" dataKey="Present" stroke="#4f46e5" fill="url(#presentGradient)" strokeWidth={3} />
                <Area type="monotone" dataKey="Absent" stroke="#f97316" fill="url(#absentGradient)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="section-panel">
          <div className="section-header">
            <h2>Recent notices</h2>
            <p className="text-muted">Important college announcements, sorted newest first.</p>
          </div>
          <div className="list-card">
            {notices.slice(0, 4).map((notice) => (
              <article key={notice._id} className="notice-card">
                <div className="notice-meta">
                  <span className="status-pill green">{new Date(notice.createdAt).toLocaleDateString()}</span>
                  <span>{notice.createdBy?.name || 'Admin'}</span>
                </div>
                <h3>{notice.title}</h3>
                <p className="text-muted">{notice.description.slice(0, 120)}{notice.description.length > 120 ? '…' : ''}</p>
              </article>
            ))}
          </div>
        </section>
      </div>

      <section className="section-panel">
        <div className="section-header">
          <h2>Upcoming events</h2>
          <p className="text-muted">Upcoming assignments and exam dates to keep your semester on track.</p>
        </div>
        <div className="list-card">
          {events.length === 0 ? (
            <div className="notice-card">No upcoming events for now.</div>
          ) : (
            events.map((event) => (
              <article key={event.id} className="event-card">
                <div className="event-meta">
                  <span className={`status-pill ${event.type === 'exam' ? 'amber' : 'green'}`}>
                    {event.type === 'exam' ? 'Exam' : 'Assignment'}
                  </span>
                  <span>{new Date(event.when).toLocaleDateString()}</span>
                </div>
                <h3>{event.title}</h3>
                <p className="text-muted">{event.subtitle}</p>
              </article>
            ))
          )}
        </div>
      </section>
    </div>
  );
};

export default StudentDashboard;

