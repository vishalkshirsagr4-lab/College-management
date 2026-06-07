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
        const [assignmentsRes, subjectsRes] = await Promise.all([
          getAssignments(),
          getSubjects(),
        ]);
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

  const handleChange = (key) => (e) => {
    const value = key === 'file' ? e.target.files[0] : e.target.value;
    setForm({ ...form, [key]: value });
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('title', form.title);
      formData.append('description', form.description);
      formData.append('subjectId', form.subjectId);
      formData.append('dueDate', form.dueDate);
      if (form.file) formData.append('file', form.file);

      const { data } = await createAssignment(formData);
      setAssignments((prev) => [data.assignment, ...prev]);

      setForm({
        title: '',
        description: '',
        subjectId: '',
        dueDate: '',
        file: null,
      });

      toast.success('Assignment created successfully');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to create assignment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteAssignment(id);
      setAssignments((prev) => prev.filter((a) => a._id !== id));
      toast.success('Assignment deleted');
    } catch {
      toast.error('Delete failed');
    }
  };

  const filtered = assignments.filter((item) => {
    const q = search.toLowerCase();
    return (
      item.title?.toLowerCase().includes(q) ||
      item.subject?.toLowerCase().includes(q) ||
      item.description?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-gray-900">Assignment Management</h1>
        <p className="text-gray-500 mt-1">
          Create and manage assignments easily with file uploads.
        </p>
      </div>

      {/* CREATE FORM */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Create New Assignment
        </h2>

        <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 gap-4">

          <input
            className="w-full border rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Title"
            value={form.title}
            onChange={handleChange('title')}
            required
          />

          <select
            className="w-full border rounded-xl px-4 py-2"
            value={form.subjectId}
            onChange={handleChange('subjectId')}
            required
          >
            <option value="">Select Subject</option>
            {subjects.map((s) => (
              <option key={s._id} value={s._id}>
                {s.subjectName}
              </option>
            ))}
          </select>

          <textarea
            className="w-full border rounded-xl px-4 py-2 md:col-span-2"
            placeholder="Description"
            value={form.description}
            onChange={handleChange('description')}
          />

          <input
            type="date"
            className="w-full border rounded-xl px-4 py-2"
            value={form.dueDate}
            onChange={handleChange('dueDate')}
            required
          />

          <input
            type="file"
            className="w-full border rounded-xl px-4 py-2"
            onChange={handleChange('file')}
          />

          <button
            type="submit"
            disabled={submitting}
            className="md:col-span-2 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-xl transition font-medium"
          >
            {submitting ? 'Creating...' : 'Create Assignment'}
          </button>
        </form>
      </div>

      {/* SEARCH */}
      <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
        <input
          type="search"
          placeholder="Search assignments..."
          className="w-full border rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* LIST */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">

        {loading ? (
          <div className="p-6">
            <LoadingSkeleton rows={4} columns={1} />
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-6 text-gray-500">No assignments found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">

              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="p-3">Title</th>
                  <th className="p-3">Subject</th>
                  <th className="p-3">Description</th>
                  <th className="p-3">Due Date</th>
                  <th className="p-3">Actions</th>
                </tr>
              </thead>

              <tbody>
                {filtered.map((a) => (
                  <tr key={a._id} className="border-t hover:bg-gray-50">

                    <td className="p-3 font-medium">{a.title}</td>
                    <td className="p-3">{a.subject}</td>
                    <td className="p-3 text-gray-600">
                      {a.description?.slice(0, 40)}
                    </td>
                    <td className="p-3">
                      {new Date(a.dueDate).toLocaleDateString()}
                    </td>

                    <td className="p-3 flex gap-2">
                      {a.file?.url && (
                        <a
                          href={a.file.url}
                          target="_blank"
                          className="px-3 py-1 bg-green-100 text-green-700 rounded-lg text-xs"
                        >
                          Download
                        </a>
                      )}

                      <button
                        onClick={() => handleDelete(a._id)}
                        className="px-3 py-1 bg-red-100 text-red-600 rounded-lg text-xs"
                      >
                        Delete
                      </button>
                    </td>

                  </tr>
                ))}
              </tbody>

            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Assignments;