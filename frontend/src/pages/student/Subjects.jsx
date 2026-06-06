import { useEffect, useMemo, useState } from 'react';
import { getStudentProfile, getSubjects, getAttendance } from '../../api/student.api';
import LoadingSkeleton from '../../components/ui/LoadingSkeleton';

const Subjects = () => {
  const [subjects, setSubjects] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [profileRes, subjectsRes] = await Promise.all([getStudentProfile(), getSubjects()]);
        const studentId = profileRes.data.student?._id;
        const semester = profileRes.data.student?.semester;
        const rawSubjects = subjectsRes.data.subjects || [];
        if (studentId) {
          const attendanceRes = await getAttendance(studentId);
          setAttendanceRecords(attendanceRes.data.attendance || []);
        }
        setSubjects(rawSubjects.filter((subject) => subject.semester === semester));
      } catch {
        setSubjects([]);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const attendanceBySubject = useMemo(() => {
    return attendanceRecords.reduce((acc, record) => {
      const subject = record.subjectId?.subjectName || 'Unknown';
      if (!acc[subject]) acc[subject] = { present: 0, total: 0 };
      acc[subject].total += 1;
      if (record.status === 'Present') acc[subject].present += 1;
      return acc;
    }, {});
  }, [attendanceRecords]);

  return (
    <div>
      <div className="section-card">
        <div>
          <h1 className="page-title">Subjects</h1>
          <p className="page-description">Browse your current semester subjects and classroom teachers.</p>
        </div>
      </div>

      {loading ? (
        <LoadingSkeleton rows={3} columns={1} />
      ) : subjects.length === 0 ? (
        <div className="section-card">No subjects found for your semester.</div>
      ) : (
        <div className="panel-grid columns-3">
          {subjects.map((subject) => {
            const stats = attendanceBySubject[subject.subjectName] || { present: 0, total: 0 };
            const rate = stats.total ? Math.round((stats.present / stats.total) * 100) : 0;
            return (
              <article key={subject._id} className="subject-card">
                <div className="assignment-card-header">
                  <h3>{subject.subjectName}</h3>
                  <span className="chip">{subject.subjectCode}</span>
                </div>
                <p className="text-muted">Teacher: {subject.teacherId?.name || 'To be assigned'}</p>
                <p>Attendance: {rate}%</p>
                <button className="button button-secondary">View details</button>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Subjects;
