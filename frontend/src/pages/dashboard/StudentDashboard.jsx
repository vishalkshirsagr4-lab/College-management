import { useEffect, useState } from 'react';
import { getAttendance, getNotices, getResults, getFees, getStudentProfile } from '../../api/student.api';

const StudentDashboard = () => {
  const [profile, setProfile] = useState(null);
  const [attendanceCount, setAttendanceCount] = useState(0);
  const [notices, setNotices] = useState([]);
  const [results, setResults] = useState([]);
  const [fees, setFees] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const studentRes = await getStudentProfile();
        setProfile(studentRes.data.student);

        const studentId = studentRes.data.student?._id;
        const [attendanceRes, noticesRes, resultsRes, feesRes] = await Promise.all([
          getAttendance(studentId),
          getNotices(),
          getResults(),
          getFees(),
        ]);

        const attendanceData = attendanceRes.data.attendance || [];
        setAttendanceCount(attendanceData.length);
        setNotices(noticesRes.data.notices || []);
        setResults((resultsRes.data.results || []).filter((item) => item.studentId?.toString() === studentId.toString() || item.studentId?._id?.toString() === studentId.toString()));
        setFees((feesRes.data.fees || []).filter((item) => item.studentId?.toString() === studentId.toString() || item.studentId?._id?.toString() === studentId.toString()));
      } catch (error) {
        console.error('Error loading student dashboard data', error);
        setProfile(null);
        setNotices([]);
        setResults([]);
        setFees([]);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  if (loading) {
    return <div className="page-shell">Loading student dashboard...</div>;
  }

  if (!profile) {
    return <div className="page-shell">Student profile not found. Please complete your profile or contact admin.</div>;
  }

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
          <p>{attendanceCount}</p>
        </div>
        <div className="card card-stats">
          <h3>Notices</h3>
          <p>{notices.length}</p>
        </div>
        <div className="card card-stats">
          <h3>Results</h3>
          <p>{results.length}</p>
        </div>
      </div>
      <div className="grid grid-2">
        <div className="card card-panel">
          <h3>Profile</h3>
          <div className="profile-card">
            <img src={profile?.userId?.profileImage?.url || 'https://via.placeholder.com/100'} alt="profile" />
            <div>
              <p className="text-muted">{profile?.userId?.name || 'Name not set'}</p>
              <p>{profile?.usn || 'USN not set'}</p>
              <p>{profile?.semester ? `Semester ${profile.semester}` : 'Semester not set'}</p>
            </div>
          </div>
        </div>
        <div className="card card-panel">
          <h3>Fee status</h3>
          {fees.length > 0 ? (
            <ul className="list-muted">
              {fees.map((fee) => (
                <li key={fee._id}>{fee.description || 'Fee record'} — {fee.status || 'Unknown'}</li>
              ))}
            </ul>
          ) : (
            <p>No fee records available.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
