import { useEffect, useState } from 'react';
import { getExams, createExam, deleteExam } from '../../api/exams.api';
import { getSubjects } from '../../api/admin.api';
import LoadingSkeleton from '../../components/ui/LoadingSkeleton';
import { toast } from 'react-toastify';

const Exams = () => {
  const [exams, setExams] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState('');

  const [form, setForm] = useState({
    examName: '',
    subjectId: '',
    semester: '',
    date: '',
  });

  useEffect(() => {
    const load = async () => {
      try {
        const [eRes, sRes] = await Promise.all([getExams(), getSubjects()]);
        setExams(eRes.data.exams || []);
        setSubjects(sRes.data.subjects || []);
      } catch {
        toast.error('Failed to load data');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleChange = (key) => (e) => {
    setForm({ ...form, [key]: e.target.value });
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const { data } = await createExam(form);
      setExams((prev) => [data.exam, ...prev]);

      setForm({ examName: '', subjectId: '', semester: '', date: '' });

      toast.success('Exam created');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteExam(id);
      setExams((prev) => prev.filter((e) => e._id !== id));
      toast.success('Deleted');
    } catch {
      toast.error('Delete failed');
    }
  };

  const filtered = exams.filter((e) =>
    `${e.examName} ${e.semester} ${e.subjectId?.subjectName}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="bg-white border rounded-3xl p-5 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900">Exam Management</h1>
        <p className="text-slate-500 text-sm mt-1">
          Create and manage exam schedules easily.
        </p>
      </div>

      {/* Create Exam Form */}
      <div className="bg-white border rounded-3xl p-5 shadow-sm">
        <h2 className="text-lg font-semibold mb-4">Create Exam</h2>

        <form onSubmit={handleCreate} className="grid gap-4 md:grid-cols-2">

          <input
            className="border rounded-2xl p-3 focus:ring-2 focus:ring-sky-400 outline-none"
            placeholder="Exam Name"
            value={form.examName}
            onChange={handleChange('examName')}
          />

          <select
            className="border rounded-2xl p-3"
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

          <input
            type="number"
            className="border rounded-2xl p-3"
            placeholder="Semester"
            value={form.semester}
            onChange={handleChange('semester')}
          />

          <input
            type="date"
            className="border rounded-2xl p-3"
            value={form.date}
            onChange={handleChange('date')}
          />

          <button
            className="md:col-span-2 bg-sky-600 hover:bg-sky-700 text-white py-3 rounded-2xl font-semibold"
            disabled={submitting}
          >
            {submitting ? 'Creating...' : 'Create Exam'}
          </button>
        </form>
      </div>

      {/* Search */}
      <input
        className="w-full border rounded-2xl p-3 focus:ring-2 focus:ring-sky-400"
        placeholder="Search exams..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* Table */}
      <div className="bg-white border rounded-3xl shadow-sm overflow-x-auto">

        {loading ? (
          <LoadingSkeleton rows={4} columns={1} />
        ) : filtered.length === 0 ? (
          <div className="p-6 text-center text-slate-500">
            No exams found
          </div>
        ) : (
          <table className="w-full text-sm">

            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="p-4 text-left">Exam</th>
                <th className="p-4 text-left">Subject</th>
                <th className="p-4 text-left">Semester</th>
                <th className="p-4 text-left">Date</th>
                <th className="p-4 text-left">Action</th>
              </tr>
            </thead>

            <tbody>
              {filtered.map((e) => (
                <tr key={e._id} className="border-t hover:bg-slate-50">

                  <td className="p-4 font-medium">{e.examName}</td>

                  <td className="p-4">
                    {e.subjectId?.subjectName}
                  </td>

                  <td className="p-4">{e.semester}</td>

                  <td className="p-4">
                    {new Date(e.date).toLocaleDateString()}
                  </td>

                  <td className="p-4">
                    <button
                      onClick={() => handleDelete(e._id)}
                      className="px-3 py-1 text-xs rounded-xl bg-rose-100 text-rose-700"
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

export default Exams;