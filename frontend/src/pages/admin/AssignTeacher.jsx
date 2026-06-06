import { useEffect, useState } from 'react';
import { assignTeacher, getSubjects, getTeachers } from '../../api/admin.api';
import { searchUsers, convertUserToTeacher } from '../../api/admin.api';

const AssignTeacher = () => {
  const [teachers, setTeachers] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [form, setForm] = useState({ teacherId: '', subjectId: '' });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [userQuery, setUserQuery] = useState('');
  const [userResults, setUserResults] = useState([]);
  const [converting, setConverting] = useState(false);

  useEffect(() => {
    const fetchLists = async () => {
      try {
        const [teacherRes, subjectRes] = await Promise.all([getTeachers(), getSubjects()]);
        setTeachers(teacherRes.data.teachers || []);
        setSubjects(subjectRes.data.subjects || []);
      } catch (err) {
        setTeachers([]);
        setSubjects([]);
      }
    };
    fetchLists();
  }, []);

  const handleUserSearch = async () => {
    try {
      const res = await searchUsers(userQuery);
      setUserResults(res.data.users || []);
    } catch (err) {
      setUserResults([]);
    }
  };

  const handleConvert = async (userId) => {
    setConverting(true);
    try {
      await convertUserToTeacher({ userId });
      // refresh teacher list
      const teacherRes = await getTeachers();
      setTeachers(teacherRes.data.teachers || []);
      setUserResults((prev) => prev.filter((u) => u._id !== userId));
    } catch (err) {
      // ignore for now
    } finally {
      setConverting(false);
    }
  };

  const handleChange = (key) => (event) => {
    setForm({ ...form, [key]: event.target.value });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);
    try {
      await assignTeacher(form);
      setMessage('Teacher assigned successfully.');
    } catch (err) {
      setError(err?.response?.data?.message || 'Unable to assign teacher.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Assign Teacher</h2>
          <p className="text-muted">Link teachers to subjects and build your semester schedule.</p>
        </div>
      </div>
      <div className="card card-panel">
        <div className="section-card">
          <h3>Find existing users</h3>
          <div className="form-row">
            <input placeholder="Search by name or email" value={userQuery} onChange={(e) => setUserQuery(e.target.value)} />
            <button type="button" className="button" onClick={handleUserSearch}>Search</button>
          </div>
          <div>
            {userResults.map((u) => (
              <div key={u._id} className="list-item">
                <div>{u.name} — {u.email} ({u.role || 'user'})</div>
                {u.role !== 'teacher' && (
                  <button className="button button-secondary" onClick={() => handleConvert(u._id)} disabled={converting}>
                    {converting ? 'Converting...' : 'Make Teacher'}
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
        <form className="form-grid" onSubmit={handleSubmit}>
          <label>Teacher</label>
          <select value={form.teacherId} onChange={handleChange('teacherId')} required>
            <option value="">Select teacher</option>
            {teachers.map((teacher) => (
              <option key={teacher._id} value={teacher._id}>
                {teacher.userId?.name || teacher._id}
              </option>
            ))}
          </select>
          <label>Subject</label>
          <select value={form.subjectId} onChange={handleChange('subjectId')} required>
            <option value="">Select subject</option>
            {subjects.map((subject) => (
              <option key={subject._id} value={subject._id}>
                {subject.subjectName} ({subject.subjectCode})
              </option>
            ))}
          </select>
          {error && <div className="alert-error">{error}</div>}
          {message && <div className="alert-success">{message}</div>}
          <button type="submit" className="button button-primary" disabled={loading}>
            {loading ? 'Assigning...' : 'Assign Teacher'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AssignTeacher;
