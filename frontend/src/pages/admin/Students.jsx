import { useEffect, useMemo, useState } from 'react';
import { getStudents } from '../../api/admin.api';
import LoadingSkeleton from '../../components/ui/LoadingSkeleton';
import { toast } from 'react-toastify';

const Students = () => {
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const response = await getStudents();
        setStudents(response.data.students || []);
      } catch (error) {
        toast.error('Unable to fetch students.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filtered = useMemo(() => {
    const query = search.toLowerCase();
    return students.filter((student) => {
      return (
        student.usn?.toLowerCase().includes(query) ||
        student.userId?.name?.toLowerCase().includes(query) ||
        student.userId?.email?.toLowerCase().includes(query)
      );
    });
  }, [search, students]);

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div className="rounded-3xl bg-white border border-slate-200 p-6 shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-900">
          Student Management
        </h1>
        <p className="text-slate-500 mt-1">
          View student profiles and search the full student roster.
        </p>
      </div>

      {/* SEARCH + TABLE CARD */}
      <div className="rounded-3xl bg-white border border-slate-200 shadow-sm overflow-hidden">

        {/* Top Bar */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 p-5 border-b border-slate-100">
          <h2 className="text-lg font-semibold text-slate-900">
            Student Roster
          </h2>

          <input
            type="search"
            placeholder="Search by name, email or USN..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full md:w-80 px-4 py-2.5 rounded-2xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400"
          />
        </div>

        {/* CONTENT */}
        <div className="p-5">

          {loading ? (
            <LoadingSkeleton rows={5} columns={1} />
          ) : filtered.length === 0 ? (
            <div className="text-center py-10 text-slate-500">
              No students found
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-slate-100">
              <table className="w-full text-sm">

                <thead className="bg-slate-50 text-slate-600">
                  <tr>
                    <th className="text-left px-4 py-3">Name</th>
                    <th className="text-left px-4 py-3">Email</th>
                    <th className="text-left px-4 py-3">USN</th>
                    <th className="text-left px-4 py-3">Semester</th>
                    <th className="text-left px-4 py-3">Section</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {filtered.map((student) => (
                    <tr
                      key={student._id}
                      className="hover:bg-slate-50 transition"
                    >
                      <td className="px-4 py-3 font-medium text-slate-900">
                        {student.userId?.name || 'Unknown'}
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {student.userId?.email || 'Unknown'}
                      </td>
                      <td className="px-4 py-3 text-slate-700">
                        {student.usn || 'N/A'}
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-3 py-1 rounded-full bg-sky-50 text-sky-700 text-xs font-semibold">
                          {student.semester || 'N/A'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-700">
                        {student.section || 'N/A'}
                      </td>
                    </tr>
                  ))}
                </tbody>

              </table>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default Students;