import { useEffect, useState } from 'react';
import { getStudents } from '../../api/admin.api';
import LoadingSkeleton from '../../components/ui/LoadingSkeleton';
import { toast } from 'react-toastify';

const TeacherStudents = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

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

  const filtered = students.filter((student) => {
    const q = search.toLowerCase();
    return (
      student.userId?.name?.toLowerCase().includes(q) ||
      student.userId?.email?.toLowerCase().includes(q) ||
      student.usn?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-6 sm:px-6 lg:px-10">

      {/* HEADER */}
      <div className="max-w-6xl mx-auto mb-6">
        <div className="bg-white rounded-2xl shadow-sm border p-5">
          <h1 className="text-2xl font-bold text-gray-900">
            Student Directory
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Browse your students and quickly check their basic details.
          </p>
        </div>
      </div>

      {/* TABLE CARD */}
      <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-sm border p-5">

        {/* SEARCH */}
        <input
          type="search"
          placeholder="Search students by name, email, or USN..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full border rounded-xl px-4 py-3 mb-5 outline-none focus:ring-2 focus:ring-blue-500"
        />

        {/* LOADING */}
        {loading ? (
          <LoadingSkeleton rows={4} columns={1} />
        ) : filtered.length === 0 ? (
          <div className="text-center text-gray-500 py-10">
            No students found.
          </div>
        ) : (
          <div className="overflow-x-auto">

            <table className="w-full text-sm text-left border-collapse">

              <thead>
                <tr className="bg-gray-100 text-gray-700">
                  <th className="p-3">Name</th>
                  <th className="p-3">Email</th>
                  <th className="p-3">USN</th>
                  <th className="p-3">Semester</th>
                </tr>
              </thead>

              <tbody>
                {filtered.map((student) => (
                  <tr
                    key={student._id}
                    className="border-b hover:bg-gray-50 transition"
                  >
                    <td className="p-3 font-medium text-gray-900">
                      {student.userId?.name || 'N/A'}
                    </td>

                    <td className="p-3 text-gray-600">
                      {student.userId?.email || 'N/A'}
                    </td>

                    <td className="p-3">
                      <span className="px-2 py-1 text-xs rounded-lg bg-blue-100 text-blue-700 font-medium">
                        {student.usn || 'N/A'}
                      </span>
                    </td>

                    <td className="p-3">
                      <span className="px-2 py-1 text-xs rounded-lg bg-green-100 text-green-700 font-medium">
                        Sem {student.semester || 'N/A'}
                      </span>
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

export default TeacherStudents;