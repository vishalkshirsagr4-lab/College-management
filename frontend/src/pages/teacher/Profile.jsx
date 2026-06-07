import { useEffect, useState } from "react";
import { getTeacherProfile, updateTeacherProfile } from "../../api/teacher.api";
import LoadingSkeleton from "../../components/ui/LoadingSkeleton";
import { toast } from "react-toastify";

const TeacherProfile = () => {
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({ department: "", photo: null });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const response = await getTeacherProfile();
        const teacher = response.data.teacher || response.data.user;

        setProfile(teacher);
        setForm({ department: teacher?.department || "", photo: null });
      } catch {
        toast.error("Unable to load profile.");
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  const handleChange = (key) => (e) => {
    const value = key === "photo" ? e.target.files[0] : e.target.value;
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const formData = new FormData();
      formData.append("department", form.department);

      if (form.photo) {
        formData.append("photo", form.photo);
      }

      const response = await updateTeacherProfile(formData);
      setProfile(response.data.teacher || profile);

      toast.success("Profile updated successfully.");
      setForm((prev) => ({ ...prev, photo: null }));
    } catch (error) {
      toast.error(error?.response?.data?.message || "Unable to update profile.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Loading...
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Teacher profile not available
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="max-w-5xl mx-auto space-y-6">

        {/* HEADER */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            Teacher Profile
          </h1>
          <p className="text-gray-500 mt-1">
            Manage your account and teaching information
          </p>
        </div>

        {/* GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* PROFILE CARD */}
          <div className="bg-white rounded-2xl shadow-sm p-6 space-y-4">

            <div className="flex flex-col items-center text-center">
              {profile.photo?.url || profile.userId?.profileImage?.url ? (
                <img
                  src={profile.photo?.url || profile.userId?.profileImage?.url}
                  className="w-28 h-28 rounded-full object-cover border"
                />
              ) : (
                <div className="w-28 h-28 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                  No Photo
                </div>
              )}

              <h2 className="mt-3 text-lg font-semibold text-gray-900">
                {profile.name || profile.userId?.name}
              </h2>

              <p className="text-gray-500 text-sm">
                {profile.email || profile.userId?.email}
              </p>
            </div>

            {/* DETAILS */}
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-gray-500">Department</p>
                <p className="font-medium text-gray-800">
                  {profile.department || "N/A"}
                </p>
              </div>

              <div>
                <p className="text-gray-500">Assigned Subjects</p>
                <p className="font-medium text-gray-800">
                  {Array.isArray(profile.subjects)
                    ? profile.subjects.map((s) => s.subjectName).join(", ")
                    : profile.subjects || "Not assigned"}
                </p>
              </div>
            </div>
          </div>

          {/* UPDATE FORM */}
          <form
            onSubmit={handleSave}
            className="bg-white rounded-2xl shadow-sm p-6 space-y-4"
          >
            <h2 className="text-lg font-semibold text-gray-900">
              Update Profile
            </h2>

            <input
              value={form.department}
              onChange={handleChange("department")}
              placeholder="Department"
              className="w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none"
            />

            <input
              type="file"
              accept="image/*"
              onChange={handleChange("photo")}
              className="w-full border rounded-lg p-2"
            />

            <button
              type="submit"
              disabled={saving}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold disabled:opacity-60"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </form>

        </div>
      </div>
    </div>
  );
};

export default TeacherProfile;