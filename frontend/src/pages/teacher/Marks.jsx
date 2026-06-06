import { useEffect, useState } from 'react';
import { getTeacherSubjects, uploadMarks } from '../../api/teacher.api';

const Marks = () => {
  const [subjects, setSubjects] = useState([]);
  const [form, setForm] = useState({ subjectId: '', studentId: '', marks: '', grade: '' });
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
      await uploadMarks(form);
      setMessage('Marks uploaded successfully.');
      setForm({ subjectId: '', studentId: '', marks: '', grade: '' });
    } catch (err) {
      setError(err?.response?.data?.message || 'Unable to upload marks.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Teacher Marks</h2>
          <p className="text-muted">Upload exam marks and grades for your students.</p>
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
          <label>Marks</label>
          <input type="number" value={form.marks} onChange={handleChange('marks')} required min="0" />
          <label>Grade</label>
          <input type="text" value={form.grade} onChange={handleChange('grade')} required />
          {error && <div className="alert-error">{error}</div>}
          {message && <div className="alert-success">{message}</div>}
          <button type="submit" className="button button-primary" disabled={loading}>
            {loading ? 'Saving...' : 'Upload Marks'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Marks;
