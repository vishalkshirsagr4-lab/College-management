import { useEffect, useMemo, useState } from 'react';
import { getAttendance, getStudentProfile } from '../../api/student.api';
import LoadingSkeleton from '../../components/ui/LoadingSkeleton';

const AttendanceView = () => {
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const profileRes = await getStudentProfile();
        const studentId = profileRes.data.student?._id;
        if (!studentId) {
          setAttendance([]);
          return;
        }
        const response = await getAttendance(studentId);
        setAttendance(response.data.attendance || []);
      } catch {
        setAttendance([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const subjectOverview = useMemo(() => {
    const subjects = {};
    attendance.forEach((record) => {
      const subject = record.subjectId?.subjectName || 'Unknown';
      subjects[subject] = subjects[subject] || { present: 0, absent: 0 };
      subjects[subject][record.status.toLowerCase()] += 1;
    });
    return Object.entries(subjects).map(([subject, stats]) => ({ subject, ...stats }));
  }, [attendance]);

  return (
    <div>
      <div className="section-card">
        <div>
          <h1 className="page-title">Attendance</h1>
          <p className="page-description">Track your daily presence across subjects.</p>
        </div>
      </div>

      {loading ? (
        <LoadingSkeleton rows={2} columns={1} />
      ) : (
        <div className="section-grid columns-2">
          <article className="section-panel">
            <h2>Attendance summary</h2>
            <p className="text-muted">Review attendance totals and subject progress.</p>
            {subjectOverview.length === 0 ? (
              <div className="notice-card">No attendance records found.</div>
            ) : (
              <div className="list-card">
                {subjectOverview.map((subject) => (
                  <div key={subject.subject} className="subject-card">
                    <div>
                      <h3>{subject.subject}</h3>
                      <p className="text-muted">Present: {subject.present} | Absent: {subject.absent}</p>
                    </div>
                    <span className={`status-pill ${subject.absent > subject.present ? 'red' : 'green'}`}>
                      {subject.present + subject.absent === 0 ? 'No records' : `${Math.round((subject.present / (subject.present + subject.absent)) * 100)}%`}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </article>

          <article className="section-panel">
            <h2>Recent attendance entries</h2>
            <p className="text-muted">Latest class attendance details by date.</p>

            {attendance.length === 0 ? (
              <div className="notice-card">No attendance entries available.</div>
            ) : (
              <div className="list-card">
                {attendance.slice(0, 8).map((item) => (
                  <div key={item._id} className="event-card">
                    <div className="event-meta">
                      <span className={`status-pill ${item.status === 'Present' ? 'green' : 'red'}`}>
                        {item.status}
                      </span>
                      <span>{new Date(item.date).toLocaleDateString()}</span>
                    </div>
                    <h3>{item.subjectId?.subjectName || 'Subject'}</h3>
                  </div>
                ))}
              </div>
            )}
          </article>
        </div>
      )}
    </div>
  );
};

export default AttendanceView;
