import { useEffect, useState } from 'react';
import { getTeacherSubjects } from '../../api/teacher.api';

const TeacherDashboard = () => {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSubjects = async () => {
      try {
        const response = await getTeacherSubjects();
        setSubjects(response.data.subjects || []);
      } catch (error) {
        setSubjects([]);
      } finally {
        setLoading(false);
      }
    };
    loadSubjects();
  }, []);

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Teacher Dashboard</h2>
          <p className="text-muted">Your current teaching workload and active subjects.</p>
        </div>
      </div>
      <div className="grid grid-3">
        {loading ? (
          <div className="card card-stats">Loading subjects...</div>
        ) : subjects.length === 0 ? (
          <div className="card card-stats">No assigned subjects yet.</div>
        ) : (
          subjects.map((subject) => (
            <div key={subject._id} className="card card-subject">
              <h3>{subject.subjectName}</h3>
              <p>{subject.subjectCode}</p>
              <p className="text-muted">Semester {subject.semester}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TeacherDashboard;
