import { useEffect, useState } from 'react';
import {
  assignTeacher,
  getSubjects,
  getTeachers,
  searchUsers,
  convertUserToTeacher,
} from '../../api/admin.api';
import { toast } from 'react-toastify';

const AssignTeacher = () => {
  const [teachers, setTeachers] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [form, setForm] = useState({ teacherId: '', subjectId: '' });

  const [userQuery, setUserQuery] = useState('');
  const [userResults, setUserResults] = useState([]);

  const [loading, setLoading] = useState(false);
  const [converting, setConverting] = useState(false);
  const [assigning, setAssigning] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const [t, s] = await Promise.all([getTeachers(), getSubjects()]);
        setTeachers(t.data.teachers || []);
        setSubjects(s.data.subjects || []);
      } catch {
        toast.error('Failed to load data');
      }
    };
    load();
  }, []);

  const handleSearch = async () => {
    try {
      const res = await searchUsers(userQuery);
      setUserResults(res.data.users || []);
    } catch {
      toast.error('Search failed');
    }
  };

  const handleConvert = async (userId) => {
    setConverting(true);
    try {
      await convertUserToTeacher({ userId });
      const res = await getTeachers();
      setTeachers(res.data.teachers || []);
      setUserResults((prev) => prev.filter((u) => u._id !== userId));
      toast.success('User converted to teacher');
    } catch {
      toast.error('Conversion failed');
    } finally {
      setConverting(false);
    }
  };

  const handleAssign = async (e) => {
    e.preventDefault();
    setAssigning(true);

    try {
      await assignTeacher(form);
      toast.success('Teacher assigned successfully');
      setForm({ teacherId: '', subjectId: '' });
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Assignment failed');
    } finally {
      setAssigning(false);
    }
  };

  const handleChange = (key) => (e) => {
    setForm({ ...form, [key]: e.target.value });
  };

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div className="bg-white border rounded-2xl p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-gray-900">Assign Teacher</h1>
        <p className="text-gray-500 mt-1">
          Link teachers with subjects and manage academic structure.
        </p>
      </div>

      {/* SEARCH USERS */}
      <div className="bg-white border rounded-2xl p-6 shadow-sm space-y-4">
        <h2 className="text-lg font-semibold">Find Users</h2>

        <div className="flex flex-col sm:flex-row gap-3">
          <input
            className="flex-1 border rounded-xl px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="Search by name or email"
            value={userQuery}
            onChange={(e) => setUserQuery(e.target.value)}
          />

          <button
            onClick={handleSearch}
            className="bg-gray-900 text-white px-5 py-2 rounded-xl hover:bg-black"
          >
            Search
          </button>
        </div>

        {/* SEARCH RESULTS */}
        <div className="space-y-2">
          {userResults.map((u) => (
            <div
              key={u._id}
              className="flex flex-col sm:flex-row sm:items-center justify-between border rounded-xl p-3"
            >
              <div>
                <p className="font-medium">{u.name}</p>
                <p className="text-sm text-gray-500">{u.email}</p>
              </div>

              {u.role !== 'teacher' && (
                <button
                  onClick={() => handleConvert(u._id)}
                  disabled={converting}
                  className="mt-2 sm:mt-0 bg-blue-100 text-blue-700 px-4 py-1 rounded-lg hover:bg-blue-200"
                >
                  {converting ? 'Converting...' : 'Make Teacher'}
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ASSIGN FORM */}
      <div className="bg-white border rounded-2xl p-6 shadow-sm">
        <h2 className="text-lg font-semibold mb-4">Assign Teacher to Subject</h2>

        <form onSubmit={handleAssign} className="grid md:grid-cols-2 gap-4">

          <select
            className="border rounded-xl px-4 py-2"
            value={form.teacherId}
            onChange={handleChange('teacherId')}
            required
          >
            <option value="">Select Teacher</option>
            {teachers.map((t) => (
              <option key={t._id} value={t._id}>
                {t.userId?.name}
              </option>
            ))}
          </select>

          <select
            className="border rounded-xl px-4 py-2"
            value={form.subjectId}
            onChange={handleChange('subjectId')}
            required
          >
            <option value="">Select Subject</option>
            {subjects.map((s) => (
              <option key={s._id} value={s._id}>
                {s.subjectName} ({s.subjectCode})
              </option>
            ))}
          </select>

          <button
            type="submit"
            disabled={assigning}
            className="md:col-span-2 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-xl"
          >
            {assigning ? 'Assigning...' : 'Assign Teacher'}
          </button>

        </form>
      </div>

    </div>
  );
};

export default AssignTeacher;