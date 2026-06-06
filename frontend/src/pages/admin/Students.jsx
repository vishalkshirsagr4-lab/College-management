import { useEffect, useMemo, useState } from 'react';
import { getStudents } from '../../api/admin.api';
import { createStudentProfile } from '../../api/student.api';
import LoadingSkeleton from '../../components/ui/LoadingSkeleton';
import { toast } from 'react-toastify';

const Students = () => {
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState({ userId: '', usn: '', semester: '', section: '', phone: '', photo: null });

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

  const filtered = useMemo(() => {
    return students.filter((student) => {
      const query = search.toLowerCase();
      return (
        student.usn?.toLowerCase().includes(query) ||
        student.userId?.name?.toLowerCase().includes(query) ||
        student.userId?.email?.toLowerCase().includes(query)
      );
    });
  }, [search, students]);

  const handleChange = (key) => (event) => {
    const value = key === 'photo' ? event.target.files[0] : event.target.value;
    setForm({ ...form, [key]: value });
  };

  const handleCreate = async (event) => {
    event.preventDefault();
    try {
      const formData = new FormData();
      formData.append('userId', form.userId);
      formData.append('usn', form.usn);
      formData.append('semester', form.semester);
      formData.append('section', form.section);
      formData.append('phone', form.phone);
      if (form.photo) {
        formData.append('photo', form.photo);
      }

      await createStudentProfile(formData);
      toast.success('Student profile created successfully.');
      setForm({ userId: '', usn: '', semester: '', section: '', phone: '', photo: null });
      setFormOpen(false);
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Unable to create student profile.');
    }
  };

  return (
    <div>
      <div className="section-card section-header">
        <div>
          <h1 className="page-title">Student Management</h1>
          <p className="page-description">View, search, and create student profiles using the college backend.</p>
        </div>
        <button className="button button-primary" onClick={() => setFormOpen((value) => !value)}>
          {formOpen ? 'Close Form' : 'Create Student Profile'}
        </button>
      </div>

      {formOpen && (
        <article className="section-panel">
          <h2>Create new student profile</h2>
          <p className="text-muted">Use an existing user ID to link the profile to an authenticated student account.</p>
          <form className="form-grid" onSubmit={handleCreate}>
            <label>User ID</label>
            <input value={form.userId} onChange={handleChange('userId')} required placeholder="Existing student user ID" />
            <label>USN</label>
            <input value={form.usn} onChange={handleChange('usn')} required placeholder="University serial number" />
            <label>Semester</label>
            <input type="number" value={form.semester} onChange={handleChange('semester')} required />
            <label>Section</label>
            <input value={form.section} onChange={handleChange('section')} required />
            <label>Phone</label>
            <input value={form.phone} onChange={handleChange('phone')} required placeholder="Phone number" />
            <label>Profile photo</label>
            <input type="file" accept="image/*" onChange={handleChange('photo')} />
            <button type="submit" className="button button-primary">
              Save profile
            </button>
          </form>
        </article>
      )}

      <article className="section-panel">
        <div className="section-header">
          <h2>Student roster</h2>
          <input
            type="search"
            placeholder="Search by name, email or USN"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="form-control"
          />
        </div>

        {loading ? (
          <LoadingSkeleton rows={4} columns={1} />
        ) : filtered.length === 0 ? (
          <div className="notice-card">No students match your search.</div>
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>USN</th>
                  <th>Semester</th>
                  <th>Section</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((student) => (
                  <tr key={student._id}>
                    <td>{student.userId?.name || 'Unknown'}</td>
                    <td>{student.userId?.email}</td>
                    <td>{student.usn}</td>
                    <td>{student.semester}</td>
                    <td>{student.section}</td>
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

export default Students;
