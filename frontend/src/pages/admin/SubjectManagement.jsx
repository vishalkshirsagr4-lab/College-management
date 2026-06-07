import { useState } from 'react';
import { createSubject } from '../../api/admin.api';
import { toast } from 'react-toastify';

const SubjectManagement = () => {
  const [form, setForm] = useState({
    subjectName: '',
    subjectCode: '',
    semester: '',
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (key) => (event) => {
    setForm({ ...form, [key]: event.target.value });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    try {
      const { data } = await createSubject(form);
      toast.success(`Subject created: ${data.subject.subjectName}`);

      setForm({ subjectName: '', subjectCode: '', semester: '' });
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Unable to create subject.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div className="rounded-3xl bg-white border border-slate-200 p-6 shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-900">
          Subject Management
        </h1>
        <p className="text-slate-500 mt-1">
          Create subjects and map them to the curriculum structure.
        </p>
      </div>

      {/* FORM CARD */}
      <div className="rounded-3xl bg-white border border-slate-200 shadow-sm p-6">

        <h2 className="text-lg font-semibold text-slate-900 mb-5">
          Create New Subject
        </h2>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-5">

          {/* Subject Name */}
          <div>
            <label className="text-sm font-medium text-slate-700">
              Subject Name
            </label>
            <input
              type="text"
              value={form.subjectName}
              onChange={handleChange('subjectName')}
              required
              placeholder="e.g. Data Structures"
              className="mt-1 w-full px-4 py-2.5 rounded-2xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400"
            />
          </div>

          {/* Subject Code */}
          <div>
            <label className="text-sm font-medium text-slate-700">
              Subject Code
            </label>
            <input
              type="text"
              value={form.subjectCode}
              onChange={handleChange('subjectCode')}
              required
              placeholder="e.g. CS201"
              className="mt-1 w-full px-4 py-2.5 rounded-2xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400"
            />
          </div>

          {/* Semester */}
          <div>
            <label className="text-sm font-medium text-slate-700">
              Semester
            </label>
            <input
              type="number"
              value={form.semester}
              onChange={handleChange('semester')}
              required
              placeholder="e.g. 3"
              className="mt-1 w-full px-4 py-2.5 rounded-2xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400"
            />
          </div>

          {/* Submit Button */}
          <div className="md:col-span-2 flex justify-end pt-2">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-2xl bg-sky-600 text-white font-semibold text-sm hover:bg-sky-700 transition disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Create Subject'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default SubjectManagement;