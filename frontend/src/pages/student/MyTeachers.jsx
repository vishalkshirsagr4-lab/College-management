import { useEffect, useState } from 'react';
import { getMyTeachers } from '../../api/student.api';
import LoadingSkeleton from '../../components/ui/LoadingSkeleton';

const MyTeachers = () => {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getMyTeachers();
        setTeachers(res.data.teachers || []);
      } catch (err) {
        console.error(err);
        setTeachers([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="space-y-4">
        <LoadingSkeleton rows={3} columns={2} />
      </div>
    );
  }

  if (!teachers.length) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6 text-slate-600 shadow-sm">
        No teachers assigned yet.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-950">My Teachers</h1>
        <p className="mt-1 text-sm text-slate-500">
          Teachers assigned to your enrolled subjects.
        </p>
      </section>

      {/* Grid */}
      <section className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {teachers.map((t) => (
          <article
            key={t._id}
            className="group rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
          >
            {/* Top */}
            <div className="flex items-center gap-4">
              <img
                src={
                  t.photo?.url ||
                  t.userId?.photo?.url ||
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(
                    t.userId?.name || 'Teacher'
                  )}`
                }
                alt={t.userId?.name || 'Teacher'}
                className="h-14 w-14 rounded-full object-cover border border-slate-200"
              />

              <div>
                <h3 className="text-lg font-semibold text-slate-950 group-hover:text-sky-600 transition">
                  {t.userId?.name || 'Teacher'}
                </h3>
                <p className="text-sm text-slate-500">{t.department || 'Department'}</p>
              </div>
            </div>

            {/* Details */}
            <div className="mt-4 space-y-2 text-sm text-slate-600">
              <p>
                <span className="font-medium text-slate-800">Subject:</span>{' '}
                {(t.subjects && t.subjects[0]?.subjectName) ||
                  t.assignedSubjectName ||
                  '—'}
              </p>

              <p>
                <span className="font-medium text-slate-800">Email:</span>{' '}
                {t.userId?.email || '—'}
              </p>

              <p>
                <span className="font-medium text-slate-800">Phone:</span>{' '}
                {t.phone || '-'}
              </p>

              <p>
                <span className="font-medium text-slate-800">Office:</span>{' '}
                {t.officeHours || '-'}
              </p>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
};

export default MyTeachers;