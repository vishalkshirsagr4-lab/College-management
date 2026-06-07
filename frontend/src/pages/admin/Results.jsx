import { useEffect, useState } from 'react';
import { getResults, createResult, deleteResult } from '../../api/results.api';
import { getSubjects, getStudents } from '../../api/admin.api';
import LoadingSkeleton from '../../components/ui/LoadingSkeleton';
import { toast } from 'react-toastify';

const Results = () => {
  const [results, setResults] = useState([]);
  const [students, setStudents] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState('');

  const [form, setForm] = useState({
    studentId: '',
    subjectId: '',
    marks: '',
    grade: '',
  });

  useEffect(() => {
    const load = async () => {
      try {
        const [r, s, sub] = await Promise.all([
          getResults(),
          getStudents(),
          getSubjects(),
        ]);

        setResults(r.data.results || []);
        setStudents(s.data.students || []);
        setSubjects(sub.data.subjects || []);
      } catch {
        toast.error('Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const handleChange = (key) => (e) => {
    setForm((p) => ({ ...p, [key]: e.target.value }));
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await createResult(form);
      setResults((prev) => [res.data.result, ...prev]);

      setForm({ studentId: '', subjectId: '', marks: '', grade: '' });
      toast.success('Result added');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to add result');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteResult(id);
      setResults((p) => p.filter((r) => r._id !== id));
      toast.success('Deleted');
    } catch {
      toast.error('Delete failed');
    }
  };

  const filtered = results.filter((r) => {
    const q = search.toLowerCase();
    return (
      r.studentId?.usn?.toLowerCase().includes(q) ||
      r.studentId?.userId?.name?.toLowerCase().includes(q) ||
      r.subjectId?.subjectName?.toLowerCase().includes(q) ||
      r.grade?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900">Results Management</h1>
        <p className="text-sm text-slate-500 mt-1">
          Add and manage student marks and grades.
        </p>
      </div>

      {/* Form */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
        <h2 className="text-lg font-semibold mb-4">Add Result</h2>

        <form onSubmit={handleCreate} className="grid gap-4 md:grid-cols-2">

          <select
            className="p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-sky-500 outline-none"
            value={form.studentId}
            onChange={handleChange('studentId')}
            required
          >
            <option value="">Select student</option>
            {students.map((s) => (
              <option key={s._id} value={s._id}>
                {s.userId?.name || s.usn}
              </option>
            ))}
          </select>

          <select
            className="p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-sky-500 outline-none"
            value={form.subjectId}
            onChange={handleChange('subjectId')}
            required
          >
            <option value="">Select subject</option>
            {subjects.map((s) => (
              <option key={s._id} value={s._id}>
                {s.subjectName}
              </option>
            ))}
          </select>

          <input
            type="number"
            placeholder="Marks"
            className="p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-sky-500 outline-none"
            value={form.marks}
            onChange={handleChange('marks')}
            required
          />

          <input
            placeholder="Grade (A/B/C)"
            className="p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-sky-500 outline-none"
            value={form.grade}
            onChange={handleChange('grade')}
            required
          />

          <button
            type="submit"
            disabled={submitting}
            className="md:col-span-2 bg-sky-600 hover:bg-sky-700 text-white py-3 rounded-xl font-semibold transition disabled:opacity-60"
          >
            {submitting ? 'Saving...' : 'Add Result'}
          </button>
        </form>
      </div>

      {/* Search */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
        <input
          type="search"
          placeholder="Search results..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 outline-none"
        />
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm overflow-x-auto">

        {loading ? (
          <LoadingSkeleton rows={4} columns={1} />
        ) : filtered.length === 0 ? (
          <p className="text-center text-slate-500 py-10">No results found</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b">
                <th className="p-3">Student</th>
                <th className="p-3">Subject</th>
                <th className="p-3">Marks</th>
                <th className="p-3">Grade</th>
                <th className="p-3">Action</th>
              </tr>
            </thead>

            <tbody>
              {filtered.map((r) => (
                <tr key={r._id} className="border-b hover:bg-slate-50">

                  <td className="p-3">
                    {r.studentId?.usn || r.studentId?.userId?.name}
                  </td>

                  <td className="p-3">
                    {r.subjectId?.subjectName}
                  </td>

                  <td className="p-3 font-medium">
                    {r.marks}
                  </td>

                  <td className="p-3">
                    <span className="px-3 py-1 rounded-lg bg-emerald-50 text-emerald-600">
                      {r.grade}
                    </span>
                  </td>

                  <td className="p-3">
                    <button
                      onClick={() => handleDelete(r._id)}
                      className="px-3 py-1 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100"
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

export default Results;