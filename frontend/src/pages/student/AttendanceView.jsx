import { useEffect, useState } from 'react';
import { getAttendance, getStudentProfile } from '../../api/student.api';

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

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Attendance</h2>
          <p className="text-muted">View your subject-wise attendance history.</p>
        </div>
      </div>
      <div className="grid grid-2">
        {loading ? (
          <div className="card card-panel">Loading attendance...</div>
        ) : attendance.length === 0 ? (
          <div className="card card-panel">No attendance data available.</div>
        ) : (
          attendance.map((item) => (
            <div key={item._id} className="card card-panel">
              <h3>{item.subjectId?.subjectName || 'Subject'}</h3>
              <p>Status: {item.status}</p>
              <p className="text-muted">{new Date(item.date).toLocaleDateString()}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AttendanceView;
