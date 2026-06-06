import { useState } from 'react';
import { createSubject } from '../../api/admin.api';

const SubjectManagement = () => {
  const [form, setForm] = useState({ subjectName: '', subjectCode: '', semester: '' });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (key) => (event) => {
    setForm({ ...form, [key]: event.target.value });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);
    try {
      const { data } = await createSubject(form);
      setMessage(`Subject created: ${data.subject.subjectName}`);
      setForm({ subjectName: '', subjectCode: '', semester: '' });
    } catch (err) {
      setError(err?.response?.data?.message || 'Unable to create subject.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Subject Management</h2>
          <p className="text-muted">Create subjects and map them to the curriculum.</p>
        </div>
      </div>
      <div className="card card-panel">
        <form className="form-grid" onSubmit={handleSubmit}>
          <label>Subject Name</label>
          <input type="text" value={form.subjectName} onChange={handleChange('subjectName')} required />
          <label>Subject Code</label>
          <input type="text" value={form.subjectCode} onChange={handleChange('subjectCode')} required />
          <label>Semester</label>
          <input type="text" value={form.semester} onChange={handleChange('semester')} required />
          {error && <div className="alert-error">{error}</div>}
          {message && <div className="alert-success">{message}</div>}
          <button type="submit" className="button button-primary" disabled={loading}>
            {loading ? 'Saving...' : 'Create Subject'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SubjectManagement;
