import { useEffect, useState } from 'react';
import { getStudentDashboard } from '../../api/student.api';

const StudentDashboard = () => {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getStudentDashboard();
        setDashboard(res.data.dashboard);
      } catch (err) {
        console.error('Error loading student dashboard data', err);
        setErrorMsg('Failed to load dashboard. Please try again.');
        setDashboard(null);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  if (loading) {
    return <div className="page-shell">Loading student dashboard...</div>;
  }

  if (errorMsg) {
    return <div className="page-shell">{errorMsg}</div>;
  }

  if (!dashboard) {
    return <div className="page-shell">Student profile not found. Please complete your profile or contact admin.</div>;
  }

  const { student, attendance, notices, results, fees, feesSummary } = dashboard;

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Student Dashboard</h2>
          <p className="text-muted">Overview of your attendance, notices, results, and fee status.</p>
        </div>
      </div>

      <div className="grid grid-3">
        <div className="card card-stats">
          <h3>Attendance Records</h3>
          <p>{attendance?.count ?? 0}</p>
        </div>
        <div className="card card-stats">
          <h3>Latest Notices</h3>
          <p>{notices?.length ?? 0}</p>
        </div>
        <div className="card card-stats">
          <h3>Recent Results</h3>
          <p>{results?.length ?? 0}</p>
        </div>
      </div>

      <div className="grid grid-2">
        <div className="card card-panel">
          <h3>Profile</h3>
          <div className="profile-card">
            <img
              src={student?.userId?.profileImage?.url || student?.photo?.url || 'https://via.placeholder.com/100'}
              alt="profile"
            />
            <div>
              <p className="text-muted">{student?.userId?.name || 'Name not set'}</p>
              <p>{student?.usn || 'USN not set'}</p>
              <p>{student?.semester ? `Semester ${student.semester}` : 'Semester not set'}</p>
            </div>
          </div>
        </div>

        <div className="card card-panel">
          <h3>Fee status</h3>
          <div className="fee-summary">
            <p className="text-muted">Total: ₹{feesSummary?.totalAmount ?? 0}</p>
            <p className="text-muted">Paid: ₹{feesSummary?.paidAmount ?? 0}</p>
            <p className="text-muted">Unpaid: ₹{feesSummary?.unpaidAmount ?? 0}</p>
          </div>

          {fees?.length > 0 ? (
            <ul className="list-muted">
              {fees.slice(0, 6).map((fee) => (
                <li key={fee._id}>
                  ₹{fee.amount ?? 0} — {fee.status}
                </li>
              ))}
            </ul>
          ) : (
            <p>No fee records available.</p>
          )}
        </div>
      </div>

      <div className="grid grid-2">
        <div className="card card-panel">
          <h3>Latest notices</h3>
          {notices?.length ? (
            <ul className="list-muted">
              {notices.map((n) => (
                <li key={n._id}>
                  <strong>{n.title}</strong>
                </li>
              ))}
            </ul>
          ) : (
            <p>No notices right now.</p>
          )}
        </div>

        <div className="card card-panel">
          <h3>Recent results</h3>
          {results?.length ? (
            <div className="results-grid">
              {results.map((r) => (
                <div key={r._id} className="result-row">
                  <div className="result-subject">{r.subjectId?.subjectName || 'Subject'}</div>
                  <div className="result-marks">{r.marks} marks</div>
                  <div className="result-grade">{r.grade}</div>
                </div>
              ))}
            </div>
          ) : (
            <p>No results available yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;

