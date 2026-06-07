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
  const [form, setForm] = useState({
    title: '',
    description: '',
    subjectId: '',
    dueDate: '',
    file: null,
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const [aRes, sRes] = await Promise.all([getAssignments(), getSubjects()]);
        setAssignments(aRes.data.assignments || []);
        setSubjects(sRes.data.subjects || []);
      } catch {
        toast.error('Unable to load data');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleChange = (key) => (e) => {
    const value = key === 'file' ? e.target.files[0] : e.target.value;
    setForm({ ...form, [key]: value });
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => v && fd.append(k, v));

      const { data } = await createAssignment(fd);
      setAssignments((prev) => [data.assignment, ...prev]);

      setForm({ title: '', description: '', subjectId: '', dueDate: '', file: null });
      toast.success('Assignment created');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteAssignment(id);
      setAssignments((prev) => prev.filter((a) => a._id !== id));
      toast.success('Deleted');
    } catch {
      toast.error('Delete failed');
    }
  };

  const filtered = assignments.filter((a) =>
    `${a.title} ${a.subject} ${a.description}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900">Assignment Management</h1>
        <p className="text-slate-500 text-sm mt-1">
          Create and manage assignments easily.
        </p>
      </div>

      {/* Create Form */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-sm">
        <h2 className="text-lg font-semibold mb-4">Create Assignment</h2>

        <form onSubmit={handleCreate} className="grid gap-4 md:grid-cols-2">

          <input
            className="w-full rounded-2xl border p-3 outline-none focus:ring-2 focus:ring-sky-400"
            placeholder="Title"
            value={form.title}
            onChange={handleChange('title')}
          />

          <select
            className="w-full rounded-2xl border p-3"
            value={form.subjectId}
            onChange={handleChange('subjectId')}
          >
            <option value="">Select Subject</option>
            {subjects.map((s) => (
              <option key={s._id} value={s._id}>
                {s.subjectName}
              </option>
            ))}
          </select>

          <textarea
            className="md:col-span-2 w-full rounded-2xl border p-3"
            placeholder="Description"
            value={form.description}
            onChange={handleChange('description')}
          />

          <input
            type="date"
            className="w-full rounded-2xl border p-3"
            value={form.dueDate}
            onChange={handleChange('dueDate')}
          />

          <input
            type="file"
            className="w-full"
            onChange={handleChange('file')}
          />

          <button
            className="md:col-span-2 bg-sky-600 hover:bg-sky-700 text-white font-semibold py-3 rounded-2xl transition"
            disabled={submitting}
          >
            {submitting ? 'Creating...' : 'Create Assignment'}
          </button>
        </form>
      </div>

      {/* Search */}
      <input
        className="w-full bg-white border rounded-2xl p-3 focus:ring-2 focus:ring-sky-400"
        placeholder="Search assignments..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* Table / List */}
      <div className="bg-white border rounded-3xl shadow-sm overflow-x-auto">

        {loading ? (
          <LoadingSkeleton rows={4} columns={1} />
        ) : filtered.length === 0 ? (
          <div className="p-6 text-center text-slate-500">
            No assignments found
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="p-4 text-left">Title</th>
                <th className="p-4 text-left">Subject</th>
                <th className="p-4 text-left">Due</th>
                <th className="p-4 text-left">Actions</th>
              </tr>
            </thead>

            <tbody>
              {filtered.map((a) => (
                <tr key={a._id} className="border-t hover:bg-slate-50">
                  <td className="p-4 font-medium">{a.title}</td>
                  <td className="p-4">{a.subject}</td>
                  <td className="p-4">
                    {new Date(a.dueDate).toLocaleDateString()}
                  </td>
                  <td className="p-4 flex gap-2">
                    {a.file?.url && (
                      <a
                        href={a.file.url}
                        target="_blank"
                        className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-xl text-xs"
                      >
                        Download
                      </a>
                    )}
                    <button
                      onClick={() => handleDelete(a._id)}
                      className="px-3 py-1 bg-rose-100 text-rose-700 rounded-xl text-xs"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Assignments;