import { useEffect, useState } from 'react';
import { createAssignment, deleteAssignment, getAssignments } from '../../api/assignments.api';
import { getSubjects } from '../../api/admin.api';
import LoadingSkeleton from '../../components/ui/LoadingSkeleton';
import { toast } from 'react-toastify';

const Assignments = () => {
  const [assignments, setAssignments] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({ title: '', description: '', subjectId: '', dueDate: '', file: null });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const [assignmentsRes, subjectsRes] = await Promise.all([getAssignments(), getSubjects()]);
        setAssignments(assignmentsRes.data.assignments || []);
        setSubjects(subjectsRes.data.subjects || []);
      } catch (error) {
        toast.error('Unable to load assignments or subjects.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleChange = (key) => (event) => {
    const value = key === 'file' ? event.target.files[0] : event.target.value;
    setForm({ ...form, [key]: value });
  };

  const handleCreate = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('title', form.title);
      formData.append('description', form.description);
      formData.append('subjectId', form.subjectId);
      formData.append('dueDate', form.dueDate);
      if (form.file) {
        formData.append('file', form.file);
      }

      const { data } = await createAssignment(formData);
      setAssignments((prev) => [data.assignment, ...prev]);
      setForm({ title: '', description: '', subjectId: '', dueDate: '', file: null });
      toast.success('Assignment created successfully.');
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Unable to create assignment.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteAssignment(id);
      setAssignments((prev) => prev.filter((assignment) => assignment._id !== id));
      toast.success('Assignment removed.');
    } catch {
      toast.error('Could not delete assignment.');
    }
  };

  const filtered = assignments.filter((item) => {
    const query = search.toLowerCase();
    return (
      item.title?.toLowerCase().includes(query) ||
      item.subject?.toLowerCase().includes(query) ||
      item.description?.toLowerCase().includes(query)
    );
  });

  return (
    <div>
      <div className="section-card section-header">
        <div>
          <h1 className="page-title">Assignment Management</h1>
          <p className="page-description">Create, manage, and upload assignment files to the backend.</p>
        </div>
      </div>

      <article className="section-panel">
        <h2>Create new assignment</h2>
        <form className="form-grid" onSubmit={handleCreate}>
          <label>Title</label>
          <input value={form.title} onChange={handleChange('title')} required />
          <label>Description</label>
          <textarea value={form.description} onChange={handleChange('description')} />
          <label>Subject</label>
          <select value={form.subjectId} onChange={handleChange('subjectId')} required>
            <option value="">Select subject</option>
            {subjects.map((subject) => (
              <option key={subject._id} value={subject._id}>
                {subject.subjectName}
              </option>
            ))}
          </select>
          <label>Due Date</label>
          <input type="date" value={form.dueDate} onChange={handleChange('dueDate')} required />
          <label>Attachment</label>
          <input type="file" onChange={handleChange('file')} />
          <button type="submit" className="button button-primary" disabled={submitting}>
            {submitting ? 'Saving...' : 'Create Assignment'}
          </button>
        </form>
      </article>

      <article className="section-panel">
        <input
          type="search"
          placeholder="Search by title, subject, or description"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="form-control"
        />

        {loading ? (
          <LoadingSkeleton rows={4} columns={1} />
        ) : filtered.length === 0 ? (
          <div className="notice-card">No assignments found.</div>
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Subject</th>
                  <th>Description</th>
                  <th>Due Date</th>
                  <th>Info</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((assignment) => (
                  <tr key={assignment._id}>
                    <td>{assignment.title}</td>
                    <td>{assignment.subject}</td>
                    <td>{assignment.description}</td>
                    <td>{new Date(assignment.dueDate).toLocaleDateString()}</td>
                    <td>
                      {assignment.file?.url && (
                        <a className="button button-secondary" href={assignment.file.url} target="_blank" rel="noreferrer">
                          Download
                        </a>
                      )}
                      <button className="button button-secondary" onClick={() => handleDelete(assignment._id)}>
                        Delete
                      </button>
                    </td>
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

export default Assignments;
