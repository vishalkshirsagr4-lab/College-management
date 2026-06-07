import { useEffect, useState } from 'react';
import { getNotices } from '../../api/student.api';
import LoadingSkeleton from '../../components/ui/LoadingSkeleton';

const Notices = () => {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const response = await getNotices();
        setNotices(response.data.notices || []);
      } catch {
        setNotices([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="space-y-4">
        <LoadingSkeleton rows={3} columns={1} />
      </div>
    );
  }

  if (!notices.length) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6 text-slate-600 shadow-sm">
        No notices are available at the moment.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-950">Notices</h1>
        <p className="mt-1 text-sm text-slate-500">
          Stay updated with campus announcements and class alerts.
        </p>
      </section>

      {/* Grid */}
      <section className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {notices.map((notice) => (
          <article
            key={notice._id}
            className="group rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
          >
            {/* Meta */}
            <div className="mb-3 flex items-center justify-between text-xs">
              <span className="rounded-full bg-emerald-100 px-3 py-1 text-emerald-700">
                New
              </span>

              <span className="text-slate-500">
                {new Date(notice.createdAt).toLocaleDateString()}
              </span>
            </div>

            {/* Title */}
            <h3 className="text-lg font-semibold text-slate-950 group-hover:text-sky-600 transition">
              {notice.title}
            </h3>

            {/* Description */}
            <p className="mt-2 text-sm text-slate-600 line-clamp-4">
              {notice.description}
            </p>
          </article>
        ))}
      </section>
    </div>
  );
};

export default Notices;