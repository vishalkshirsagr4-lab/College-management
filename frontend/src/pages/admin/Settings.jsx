import { useEffect, useMemo, useState } from 'react';
import { getAllUsers, blockUser } from '../../api/admin.api';
import LoadingSkeleton from '../../components/ui/LoadingSkeleton';
import { toast } from 'react-toastify';

const Settings = () => {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [blocking, setBlocking] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getAllUsers();
        setUsers(res.data.users || []);
      } catch {
        toast.error('Unable to fetch users');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return users.filter(
      (u) =>
        u.name?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q) ||
        u.role?.toLowerCase().includes(q)
    );
  }, [search, users]);

  const handleToggleBlock = async (id) => {
    setBlocking(id);
    try {
      const res = await blockUser(id);
      toast.success(res.data.message);

      setUsers((prev) =>
        prev.map((u) =>
          u._id === id ? { ...u, isBlocked: !u.isBlocked } : u
        )
      );
    } catch {
      toast.error('Update failed');
    } finally {
      setBlocking(null);
    }
  };

  const blocked = users.filter((u) => u.isBlocked).length;
  const active = users.length - blocked;

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900">
          Admin Settings
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Manage system users and control access permissions.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

        <div className="bg-white border rounded-2xl p-5 text-center shadow-sm">
          <p className="text-slate-500 text-sm">Total Users</p>
          <h2 className="text-3xl font-bold text-sky-600">{users.length}</h2>
        </div>

        <div className="bg-white border rounded-2xl p-5 text-center shadow-sm">
          <p className="text-slate-500 text-sm">Active Users</p>
          <h2 className="text-3xl font-bold text-emerald-600">{active}</h2>
        </div>

        <div className="bg-white border rounded-2xl p-5 text-center shadow-sm">
          <p className="text-slate-500 text-sm">Blocked Users</p>
          <h2 className="text-3xl font-bold text-rose-600">{blocked}</h2>
        </div>

      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5">

        {/* Search */}
        <div className="flex flex-col md:flex-row md:items-center gap-3 mb-4">
          <h2 className="text-lg font-semibold">User Management</h2>

          <input
            type="search"
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full md:w-72 p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 outline-none"
          />
        </div>

        {/* Content */}
        {loading ? (
          <LoadingSkeleton rows={5} columns={1} />
        ) : filtered.length === 0 ? (
          <p className="text-center text-slate-500 py-10">
            No users found
          </p>
        ) : (
          <div className="overflow-x-auto">

            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b">
                  <th className="p-3">Name</th>
                  <th className="p-3">Email</th>
                  <th className="p-3">Role</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Created</th>
                  <th className="p-3">Action</th>
                </tr>
              </thead>

              <tbody>
                {filtered.map((u) => (
                  <tr
                    key={u._id}
                    className="border-b hover:bg-slate-50 transition"
                  >

                    <td className="p-3 font-medium">
                      {u.name}
                    </td>

                    <td className="p-3 text-slate-600">
                      {u.email}
                    </td>

                    <td className="p-3">
                      <span
                        className={`px-3 py-1 rounded-lg text-xs font-semibold text-white ${
                          u.role === 'admin'
                            ? 'bg-orange-500'
                            : u.role === 'teacher'
                            ? 'bg-sky-600'
                            : 'bg-emerald-600'
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>

                    <td className="p-3">
                      <span
                        className={`px-3 py-1 rounded-lg text-xs font-semibold text-white ${
                          u.isBlocked ? 'bg-rose-600' : 'bg-emerald-600'
                        }`}
                      >
                        {u.isBlocked ? 'Blocked' : 'Active'}
                      </span>
                    </td>

                    <td className="p-3 text-slate-500">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>

                    <td className="p-3">
                      <button
                        onClick={() => handleToggleBlock(u._id)}
                        disabled={blocking === u._id}
                        className={`px-3 py-1 rounded-lg text-white text-xs font-semibold transition ${
                          u.isBlocked
                            ? 'bg-sky-600 hover:bg-sky-700'
                            : 'bg-rose-600 hover:bg-rose-700'
                        } disabled:opacity-50`}
                      >
                        {blocking === u._id
                          ? 'Processing...'
                          : u.isBlocked
                          ? 'Unblock'
                          : 'Block'}
                      </button>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>

          </div>
        )}
      </div>

      {/* Info */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 text-sm text-slate-600">
        <h3 className="font-semibold text-slate-900 mb-2">
          System Notes
        </h3>
        <ul className="space-y-1 list-disc pl-5">
          <li>Blocked users cannot log in to the system</li>
          <li>User roles: Admin, Teacher, Student</li>
          <li>Use search to quickly filter users</li>
          <li>All actions are recorded in system logs</li>
        </ul>
      </div>

    </div>
  );
};

export default Settings;