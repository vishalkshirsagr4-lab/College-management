import { useEffect, useState } from 'react';
import { getTeacherSubjects, markAttendance } from '../../api/teacher.api';

const Attendance = () => {
  const [subjects, setSubjects] = useState([]);
  const [form, setForm] = useState({ subjectId: '', studentId: '', status: 'Present' });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const response = await getTeacherSubjects();
        setSubjects(response.data.subjects || []);
      } catch {
        setSubjects([]);
      }
    };
    load();
  }, []);

  const handleChange = (key) => (event) => {
    setForm({ ...form, [key]: event.target.value });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage('');
    setError('');
    setLoading(true);
    try {
      await markAttendance(form);
      setMessage('Attendance marked successfully.');
      setForm({ subjectId: '', studentId: '', status: 'present' });
    } catch (err) {
      setError(err?.response?.data?.message || 'Unable to mark attendance.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Teacher Attendance</h2>
          <p className="text-muted">Mark attendance for students in your assigned subjects.</p>
        </div>
      </div>
      <div className="card card-panel">
        <form className="form-grid" onSubmit={handleSubmit}>
          <label>Subject</label>
          <select value={form.subjectId} onChange={handleChange('subjectId')} required>
            <option value="">Select subject</option>
            {subjects.map((subject) => (
              <option key={subject._id} value={subject._id}>
                {subject.subjectName}
              </option>
            ))}
          </select>
          <label>Student ID</label>
          <input type="text" value={form.studentId} onChange={handleChange('studentId')} placeholder="Enter student id" required />
          <label>Status</label>
          <select value={form.status} onChange={handleChange('status')}>
            <option value="Present">Present</option>
            <option value="Absent">Absent</option>
          </select>
          {error && <div className="alert-error">{error}</div>}
          {message && <div className="alert-success">{message}</div>}
          <button type="submit" className="button button-primary" disabled={loading}>
            {loading ? 'Saving...' : 'Submit Attendance'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Attendance;
