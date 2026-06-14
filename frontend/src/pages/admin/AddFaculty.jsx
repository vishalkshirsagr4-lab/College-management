import { useState, useEffect } from "react";
import api from "../../utils/api";
import { toast } from "react-toastify";

export default function FacultyManagement() {
  const [faculty, setFaculty] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch from your getAllFaculty controller
    const run = async () => {
      try {
        const res = await api.get("/api/faculty");
        setFaculty(res.data.faculty || []);
        toast.success("Faculty list loaded");
      } catch (e) {
        const msg = e?.response?.data?.message || "Failed to load faculty.";
        toast.error(msg);
        setFaculty([]);
      } finally {
        setLoading(false);
      }
    };

    run();
  }, []);


  return (
    <div className="p-6 md:p-10 bg-neutral-50 min-h-screen">
      {/* Header & Stats */}
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Faculty Directory</h1>
          <p className="text-neutral-500">Manage and oversee department staff.</p>
        </div>
        <button className="bg-primary-600 hover:bg-primary-700 text-white px-5 py-2.5 rounded-xl font-medium transition-all shadow-sm">
          + Add New Faculty
        </button>
      </div>

      {/* Main Table Container */}
      <div className="bg-white border border-neutral-200 rounded-3xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-neutral-50/50 border-b border-neutral-100">
              <tr>
                <th className="p-6 text-xs font-semibold text-neutral-400 uppercase tracking-wider">Faculty</th>
                <th className="p-6 text-xs font-semibold text-neutral-400 uppercase tracking-wider">Department</th>
                <th className="p-6 text-xs font-semibold text-neutral-400 uppercase tracking-wider">Designation</th>
                <th className="p-6 text-xs font-semibold text-neutral-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {faculty.map((f) => (
                <tr key={f._id} className="hover:bg-neutral-50/80 transition-colors">
                  <td className="p-6 flex items-center gap-4">
                    <img src={f.profileImage || "/default-avatar.png"} alt="" className="w-10 h-10 rounded-full object-cover" />
                    <div>
                      <p className="font-semibold text-neutral-900">{f.userID?.name}</p>
                      <p className="text-xs text-neutral-500">{f.userID?.email}</p>
                    </div>
                  </td>
                  <td className="p-6 text-sm text-neutral-600">{f.department}</td>
                  <td className="p-6 text-sm text-neutral-600">{f.designation}</td>
                  <td className="p-6">
                    <button className="text-primary-600 hover:text-primary-800 font-medium text-sm">View Details</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}