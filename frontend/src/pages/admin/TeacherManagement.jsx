import { useEffect, useMemo, useState } from 'react';
import {
  getTeachers,
  searchUsers,
  convertUserToTeacher,
  updateTeacherById,
} from '../../api/admin.api';
import LoadingSkeleton from '../../components/ui/LoadingSkeleton';
import { toast } from 'react-toastify';

const TeacherManagement = () => {
  const [teachers, setTeachers] = useState([]);
  const [users, setUsers] = useState([]);

  const [search, setSearch] = useState('');
  const [userSearch, setUserSearch] = useState('');

  const [loading, setLoading] = useState(true);
  const [userLoading, setUserLoading] = useState(false);
  const [converting, setConverting] = useState(false);

  const [assignModal, setAssignModal] = useState({
    open: false,
    teacher: null,
    user: null,
  });

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getTeachers();
        setTeachers(res.data.teachers || []);
      } catch {
        toast.error('Unable to fetch teachers.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  useEffect(() => {
    const delay = setTimeout(async () => {
      if (!userSearch.trim()) {
        setUsers([]);
        return;
      }

      setUserLoading(true);
      try {
        const res = await searchUsers(userSearch);
        setUsers(res.data.users || []);
      } catch {
        toast.error('Unable to search users.');
        setUsers([]);
      } finally {
        setUserLoading(false);
      }
    }, 300);

    return () => clearTimeout(delay);
  }, [userSearch]);

  const filteredTeachers = useMemo(() => {
    const q = search.toLowerCase();
    return teachers.filter((t) =>
      t.userId?.name?.toLowerCase().includes(q) ||
      t.userId?.email?.toLowerCase().includes(q) ||
      t.department?.toLowerCase().includes(q)
    );
  }, [search, teachers]);

  const handleConvert = async (userId) => {
    setConverting(true);
    try {
      await convertUserToTeacher({ userId });
      toast.success('User converted to teacher');

      const res = await getTeachers();
      setTeachers(res.data.teachers || []);

      setUsers((prev) => prev.filter((u) => u._id !== userId));
    } catch {
      toast.error('Conversion failed');
    } finally {
      setConverting(false);
    }
  };

  const handleAssign = async () => {
    if (!assignModal.teacher || !assignModal.user) {
      toast.error('Select teacher and user');
      return;
    }

    try {
      await updateTeacherById(assignModal.teacher._id, {
        userId: assignModal.user._id,
      });

      toast.success('User assigned successfully');

      const res = await getTeachers();
      setTeachers(res.data.teachers || []);

      setAssignModal({ open: false, teacher: null, user: null });
    } catch {
      toast.error('Assignment failed');
    }
  };

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-900">
          Teacher Management
        </h1>
        <p className="text-slate-500 mt-1">
          Manage teachers, assign users, and control faculty data.
        </p>
      </div>

      {/* TEACHERS */}
      <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">

        <div className="flex flex-col md:flex-row justify-between gap-3 p-5 border-b">
          <h2 className="text-lg font-semibold">Teachers</h2>

          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search teachers..."
            className="w-full md:w-80 px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-sm focus:ring-2 focus:ring-sky-400 outline-none"
          />
        </div>

        <div className="p-5">
          {loading ? (
            <LoadingSkeleton rows={5} />
          ) : filteredTeachers.length === 0 ? (
            <p className="text-slate-500 text-center py-10">
              No teachers found
            </p>
          ) : (
            <div className="overflow-x-auto border border-slate-100 rounded-2xl">
              <table className="w-full text-sm">

                <thead className="bg-slate-50 text-slate-600">
                  <tr>
                    <th className="text-left p-3">Name</th>
                    <th className="text-left p-3">Email</th>
                    <th className="text-left p-3">Dept</th>
                    <th className="text-left p-3">Subjects</th>
                    <th className="text-left p-3">Action</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {filteredTeachers.map((t) => (
                    <tr key={t._id} className="hover:bg-slate-50">
                      <td className="p-3 font-medium">
                        {t.userId?.name || 'Unassigned'}
                      </td>
                      <td className="p-3 text-slate-600">
                        {t.userId?.email || 'N/A'}
                      </td>
                      <td className="p-3">{t.department}</td>
                      <td className="p-3 text-slate-600">
                        {Array.isArray(t.subjects)
                          ? t.subjects.map((s) => s.subjectName || s).join(', ')
                          : 'None'}
                      </td>
                      <td className="p-3">
                        <button
                          onClick={() =>
                            setAssignModal({ open: true, teacher: t, user: null })
                          }
                          className="px-3 py-1.5 text-xs rounded-xl bg-sky-50 text-sky-700 font-semibold hover:bg-sky-100"
                        >
                          Reassign
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>

              </table>
            </div>
          )}
        </div>
      </div>

      {/* USERS */}
      <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">

        <div className="flex flex-col md:flex-row justify-between gap-3 p-5 border-b">
          <h2 className="text-lg font-semibold">Users</h2>

          <input
            value={userSearch}
            onChange={(e) => setUserSearch(e.target.value)}
            placeholder="Search users..."
            className="w-full md:w-80 px-4 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-sm focus:ring-2 focus:ring-sky-400 outline-none"
          />
        </div>

        <div className="p-5">
          {userLoading ? (
            <LoadingSkeleton rows={4} />
          ) : users.length === 0 ? (
            <p className="text-slate-500 text-center py-10">
              Start typing to search users
            </p>
          ) : (
            <div className="overflow-x-auto border border-slate-100 rounded-2xl">
              <table className="w-full text-sm">

                <thead className="bg-slate-50">
                  <tr>
                    <th className="p-3 text-left">Name</th>
                    <th className="p-3 text-left">Email</th>
                    <th className="p-3 text-left">Role</th>
                    <th className="p-3 text-left">Action</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {users.map((u) => (
                    <tr key={u._id}>
                      <td className="p-3">{u.name}</td>
                      <td className="p-3 text-slate-600">{u.email}</td>
                      <td className="p-3">{u.role}</td>
                      <td className="p-3">
                        {u.role !== 'teacher' ? (
                          <button
                            onClick={() => handleConvert(u._id)}
                            disabled={converting}
                            className="px-3 py-1.5 text-xs rounded-xl bg-emerald-50 text-emerald-700 font-semibold"
                          >
                            {converting ? '...' : 'Make Teacher'}
                          </button>
                        ) : (
                          <button
                            onClick={() =>
                              setAssignModal({
                                open: true,
                                teacher: assignModal.teacher,
                                user: u,
                              })
                            }
                            className="px-3 py-1.5 text-xs rounded-xl bg-sky-50 text-sky-700 font-semibold"
                          >
                            Select
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>

              </table>
            </div>
          )}
        </div>
      </div>

      {/* MODAL */}
      {assignModal.open && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-4">
            Assign User to Teacher
          </h2>

          <div className="grid md:grid-cols-2 gap-4 mb-5">

            <div className="p-4 rounded-2xl bg-slate-50">
              <p className="font-semibold">Teacher</p>
              <p>{assignModal.teacher?.userId?.name}</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50">
              <p className="font-semibold">User</p>
              <p>{assignModal.user?.name}</p>
            </div>

          </div>

          <div className="flex justify-end gap-3">
            <button
              onClick={() => setAssignModal({ open: false, teacher: null, user: null })}
              className="px-4 py-2 rounded-2xl bg-slate-100"
            >
              Cancel
            </button>

            <button
              onClick={handleAssign}
              className="px-4 py-2 rounded-2xl bg-sky-600 text-white font-semibold"
            >
              Confirm
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherManagement;