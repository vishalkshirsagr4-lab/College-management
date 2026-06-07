import { useEffect, useState } from 'react';
import { createNotice, deleteNotice, getNotices } from '../../api/notices.api';
import LoadingSkeleton from '../../components/ui/LoadingSkeleton';
import { toast } from 'react-toastify';

const Notices = () => {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    title: '',
    description: '',
    attachment: null,
    targetSemester: '',
  });

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getNotices();
        setNotices(res.data.notices || []);
      } catch {
        toast.error('Unable to load notices.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleChange = (key) => (e) => {
    const value = key === 'attachment' ? e.target.files[0] : e.target.value;
    setForm((p) => ({ ...p, [key]: value }));
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const fd = new FormData();
      fd.append('title', form.title);
      fd.append('description', form.description);
      if (form.targetSemester) fd.append('targetSemester', form.targetSemester);
      if (form.attachment) fd.append('attachment', form.attachment);

      const res = await createNotice(fd);
      setNotices((prev) => [res.data.notice, ...prev]);

      setForm({ title: '', description: '', attachment: null, targetSemester: '' });
      toast.success('Notice created');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to create notice');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteNotice(id);
      setNotices((p) => p.filter((n) => n._id !== id));
      toast.success('Notice deleted');
    } catch {
      toast.error('Delete failed');
    }
  };

  const filtered = notices.filter((n) => {
    const q = search.toLowerCase();
    return (
      n.title?.toLowerCase().includes(q) ||
      n.description?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900">Notice Board</h1>
        <p className="text-sm text-slate-500 mt-1">
          Create announcements and share updates with students and teachers.
        </p>
      </div>

      {/* Create Form */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">
          Create Notice
        </h2>

        <form onSubmit={handleCreate} className="grid gap-4">
          <input
            className="w-full rounded-xl border border-slate-200 p-3 focus:outline-none focus:ring-2 focus:ring-sky-500"
            placeholder="Notice title"
            value={form.title}
            onChange={handleChange('title')}
            required
          />

          <textarea
            className="w-full rounded-xl border border-slate-200 p-3 min-h-[100px] focus:outline-none focus:ring-2 focus:ring-sky-500"
            placeholder="Description"
            value={form.description}
            onChange={handleChange('description')}
            required
          />

          <input
            type="number"
            min="1"
            placeholder="Target semester (optional)"
            className="w-full rounded-xl border border-slate-200 p-3 focus:outline-none focus:ring-2 focus:ring-sky-500"
            value={form.targetSemester}
            onChange={handleChange('targetSemester')}
          />

          <input
            type="file"
            className="text-sm"
            onChange={handleChange('attachment')}
          />

          <button
            type="submit"
            disabled={submitting}
            className="bg-sky-600 hover:bg-sky-700 text-white font-semibold py-3 rounded-xl transition disabled:opacity-60"
          >
            {submitting ? 'Creating...' : 'Create Notice'}
          </button>
        </form>
      </div>

      {/* Search */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
        <input
          type="search"
          placeholder="Search notices..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-xl border border-slate-200 p-3 focus:ring-2 focus:ring-sky-500 outline-none"
        />
      </div>

      {/* List */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
        {loading ? (
          <LoadingSkeleton rows={4} columns={1} />
        ) : filtered.length === 0 ? (
          <p className="text-slate-500 text-center py-10">
            No notices found.
          </p>
        ) : (
          <div className="grid gap-4">
            {filtered.map((notice) => (
              <div
                key={notice._id}
                className="border border-slate-200 rounded-2xl p-4 hover:shadow-md transition"
              >
                <div className="flex justify-between items-start gap-3">
                  <div>
                    <h3 className="font-semibold text-slate-900">
                      {notice.title}
                    </h3>
                    <p className="text-sm text-slate-500 mt-1">
                      {notice.description}
                    </p>
                    <p className="text-xs text-slate-400 mt-2">
                      {new Date(notice.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  <button
                    onClick={() => handleDelete(notice._id)}
                    className="text-sm px-3 py-1 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100"
                  >
                    Delete
                  </button>
                </div>

                {notice.attachment?.url && (
                  <a
                    href={notice.attachment.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-block mt-3 text-sm text-sky-600 hover:underline"
                  >
                    Open Attachment →
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Notices;