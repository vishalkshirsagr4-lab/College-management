import { useEffect, useState } from 'react';
import { getTeacherSubjects } from '../../api/teacher.api';
import LoadingSkeleton from '../../components/ui/LoadingSkeleton';
import { toast } from 'react-toastify';

const MySubjects = () => {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const response = await getTeacherSubjects();
        setSubjects(response.data.subjects || []);
      } catch (error) {
        toast.error('Unable to fetch assigned subjects.');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  return (
    <div>
      <div className="section-card section-header">
        <div>
          <h1 className="page-title">My Subjects</h1>
          <p className="page-description">View subjects assigned to your teacher account.</p>
        </div>
      </div>

      {loading ? (
        <LoadingSkeleton rows={4} columns={1} />
      ) : subjects.length === 0 ? (
        <div className="notice-card">You do not have any assigned subjects yet.</div>
      ) : (
        <div className="grid grid-3">
          {subjects.map((subject) => (
            <article key={subject._id} className="card card-panel">
              <h3>{subject.subjectName}</h3>
              <p className="text-muted">Code: {subject.subjectCode}</p>
              <p>Semester: {subject.semester}</p>
              <p>Department: {subject.department || 'N/A'}</p>
            </article>
          ))}
        </div>
      )}
    </div>
  );
};

export default MySubjects;
