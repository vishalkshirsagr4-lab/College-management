import { useState } from 'react';
import { createTeacher } from '../../api/admin.api';

const TeacherManagement = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '', department: '' });
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
      const { data } = await createTeacher(form);
      setMessage(`Teacher created: ${data.teacher.email}`);
      setForm({ name: '', email: '', password: '', department: '' });
    } catch (err) {
      setError(err?.response?.data?.message || 'Unable to create teacher.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Teacher Management</h2>
          <p className="text-muted">Create and manage teacher accounts from the admin portal.</p>
        </div>
      </div>
      <div className="card card-panel">
        <form className="form-grid" onSubmit={handleSubmit}>
          <label>Name</label>
          <input type="text" value={form.name} onChange={handleChange('name')} required />
          <label>Email</label>
          <input type="email" value={form.email} onChange={handleChange('email')} required />
          <label>Password</label>
          <input type="password" value={form.password} onChange={handleChange('password')} required />
          <label>Department</label>
          <input type="text" value={form.department} onChange={handleChange('department')} />
          {error && <div className="alert-error">{error}</div>}
          {message && <div className="alert-success">{message}</div>}
          <button type="submit" className="button button-primary" disabled={loading}>
            {loading ? 'Saving...' : 'Create Teacher'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default TeacherManagement;
