import { useEffect, useState } from 'react';
import { getStudents } from '../../api/admin.api';
import LoadingSkeleton from '../../components/ui/LoadingSkeleton';
import { toast } from 'react-toastify';

const TeacherStudents = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const response = await getStudents();
        setStudents(response.data.students || []);
      } catch (error) {
        toast.error('Unable to fetch students.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filtered = students.filter((student) => {
    const query = search.toLowerCase();
    return (
      student.userId?.name?.toLowerCase().includes(query) ||
      student.userId?.email?.toLowerCase().includes(query) ||
      student.usn?.toLowerCase().includes(query)
    );
  });

  return (
    <div>
      <div className="section-card section-header">
        <div>
          <h1 className="page-title">Student Directory</h1>
          <p className="page-description">Browse your students and quickly check their basic details.</p>
        </div>
      </div>
      <article className="section-panel">
        <input
          type="search"
          placeholder="Search students by name, email, or USN"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="form-control"
        />
        {loading ? (
          <LoadingSkeleton rows={4} columns={1} />
        ) : filtered.length === 0 ? (
          <div className="notice-card">No students found.</div>
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>USN</th>
                  <th>Semester</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((student) => (
                  <tr key={student._id}>
                    <td>{student.userId?.name}</td>
                    <td>{student.userId?.email}</td>
                    <td>{student.usn}</td>
                    <td>{student.semester}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </article>
    </div>
  );
};

export default TeacherStudents;
