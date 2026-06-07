import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { getMyProfile, updateMyProfile } from "../../api/teacher.api";

const TeacherProfileEdit = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    phone: "",
    address: "",
    bio: "",
    qualification: "",
    experience: "",
    photo: null,
    photoPreview: null,
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const { data } = await getMyProfile();
      const teacher = data.teacher;

      setProfile(teacher);

      setFormData((prev) => ({
        ...prev,
        phone: teacher?.phone || "",
        address: teacher?.address || "",
        bio: teacher?.bio || "",
        qualification: teacher?.qualification || "",
        experience: teacher?.experience || "",
        photoPreview: teacher?.photo?.url || null,
      }));
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
      photoPreview:
        name === "photo" && files?.[0]
          ? URL.createObjectURL(files[0])
          : prev.photoPreview,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const form = new FormData();
      form.append("phone", formData.phone);
      form.append("address", formData.address);
      form.append("bio", formData.bio);
      form.append("qualification", formData.qualification);
      form.append("experience", formData.experience);

      if (formData.photo) form.append("photo", formData.photo);

      await updateMyProfile(form);

      toast.success("Profile updated successfully!");
      fetchProfile();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Update failed");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="max-w-5xl mx-auto space-y-6">

        {/* HEADER */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            Edit Teacher Profile
          </h1>
          <p className="text-gray-500 mt-1">
            Update your professional and personal details
          </p>
        </div>

        {/* GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* LEFT CARD */}
          <div className="bg-white rounded-2xl shadow-sm p-6 space-y-6">

            {/* PHOTO */}
            <div className="flex flex-col items-center text-center">
              {formData.photoPreview ? (
                <img
                  src={formData.photoPreview}
                  className="w-28 h-28 rounded-full object-cover border"
                />
              ) : (
                <div className="w-28 h-28 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                  No Photo
                </div>
              )}

              <label className="mt-4 cursor-pointer bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm">
                Change Photo
                <input
                  type="file"
                  name="photo"
                  className="hidden"
                  onChange={handleChange}
                />
              </label>
            </div>

            {/* READ ONLY */}
            <div className="text-sm space-y-2">
              <p><span className="text-gray-500">Name:</span> {profile?.userId?.name}</p>
              <p><span className="text-gray-500">Email:</span> {profile?.userId?.email}</p>
              <p><span className="text-gray-500">Employee ID:</span> {profile?.employeeId}</p>
              <p><span className="text-gray-500">Department:</span> {profile?.department}</p>
            </div>

          </div>

          {/* RIGHT FORM */}
          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-2xl shadow-sm p-6 space-y-4"
          >
            <h2 className="text-lg font-semibold">Update Details</h2>

            <input
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Phone"
              className="w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none"
            />

            <textarea
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Address"
              className="w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none"
              rows={3}
            />

            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              placeholder="Bio"
              className="w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none"
              rows={3}
            />

            <input
              name="qualification"
              value={formData.qualification}
              onChange={handleChange}
              placeholder="Qualification"
              className="w-full border rounded-lg px-4 py-3"
            />

            <input
              type="number"
              name="experience"
              value={formData.experience}
              onChange={handleChange}
              placeholder="Experience (years)"
              className="w-full border rounded-lg px-4 py-3"
              min="0"
            />

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold disabled:opacity-60"
            >
              {submitting ? "Saving..." : "Save Changes"}
            </button>
          </form>

        </div>
      </div>
    </div>
  );
};

export default TeacherProfileEdit;