import { useEffect, useState } from 'react';
import { getMyMaterials } from '../../api/student.api';
import LoadingSkeleton from '../../components/ui/LoadingSkeleton';

const Materials = () => {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getMyMaterials();
        setMaterials(res.data.materials || []);
      } catch (err) {
        console.error(err);
        setMaterials([]);
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

  if (!materials.length) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6 text-slate-600 shadow-sm">
        No study materials available.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-950">Study Materials</h1>
        <p className="mt-1 text-sm text-slate-500">
          Materials uploaded by your teachers for enrolled subjects.
        </p>
      </section>

      {/* Grid */}
      <section className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {materials.map((m) => (
          <article
            key={m._id}
            className="group rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
          >
            {/* Meta */}
            <div className="mb-3 flex items-center justify-between text-xs">
              <span className="rounded-full bg-emerald-100 px-3 py-1 text-emerald-700">
                {new Date(m.createdAt).toLocaleDateString()}
              </span>

              <span className="text-slate-500">
                {m.teacherId?.userId?.name || m.teacherName || 'Teacher'}
              </span>
            </div>

            {/* Title */}
            <h3 className="text-lg font-semibold text-slate-950 group-hover:text-sky-600 transition">
              {m.title}
            </h3>

            {/* Description */}
            <p className="mt-2 text-sm text-slate-600 line-clamp-3">
              {m.description || 'No description available.'}
            </p>

            {/* Actions */}
            <div className="mt-4 flex flex-wrap gap-2">
              {m.file?.url && (
                <a
                  href={m.file.url}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-xl bg-slate-900 px-4 py-2 text-sm text-white hover:bg-slate-800 transition"
                >
                  Open File
                </a>
              )}

              {m.link && (
                <a
                  href={m.link}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-xl border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition"
                >
                  Open Link
                </a>
              )}
            </div>
          </article>
        ))}
      </section>
    </div>
  );
};

export default Materials;