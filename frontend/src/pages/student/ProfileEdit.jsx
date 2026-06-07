import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import {
  getStudentProfile,
  updateMyProfile,
} from "../../api/student.api";

const StudentProfileEdit = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    phone: "",
    address: "",
    emergencyContact: "",
    emergencyContactPhone: "",
    photo: null,
    photoPreview: null,
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const { data } = await getStudentProfile();
      const student = data.student || data;

      setProfile(student);

      setFormData((prev) => ({
        ...prev,
        phone: student.phone || "",
        address: student.address || "",
        emergencyContact: student.emergencyContact || "",
        emergencyContactPhone: student.emergencyContactPhone || "",
        photoPreview: student.photo?.url || null,
      }));
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFormData((p) => ({
      ...p,
      photo: file,
      photoPreview: URL.createObjectURL(file),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const payload = new FormData();
      payload.append("phone", formData.phone);
      payload.append("address", formData.address);
      payload.append("emergencyContact", formData.emergencyContact);
      payload.append("emergencyContactPhone", formData.emergencyContactPhone);

      if (formData.photo) payload.append("photo", formData.photo);

      await updateMyProfile(payload);
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
        Loading profile...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="max-w-5xl mx-auto">

        {/* HEADER */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">
            Edit Profile
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Update your personal and contact details
          </p>
        </div>

        {/* MAIN CARD */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">

          <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-10">

            {/* PROFILE PHOTO */}
            <section>
              <h2 className="text-lg font-semibold text-gray-800 mb-4">
                Profile Photo
              </h2>

              <div className="flex flex-col sm:flex-row items-center gap-6">

                {formData.photoPreview ? (
                  <img
                    src={formData.photoPreview}
                    alt="profile"
                    className="w-28 h-28 rounded-full object-cover border shadow-sm"
                  />
                ) : (
                  <div className="w-28 h-28 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 border">
                    No Photo
                  </div>
                )}

                <label className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-xl text-sm transition">
                  {formData.photoPreview ? "Change Photo" : "Upload Photo"}

                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    className="hidden"
                  />
                </label>
              </div>
            </section>

            {/* GRID INPUTS */}
            <section>
              <h2 className="text-lg font-semibold text-gray-800 mb-4">
                Contact Information
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                <input
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="Phone number"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none"
                />

                <input
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="Address"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </section>

            {/* EMERGENCY */}
            <section>
              <h2 className="text-lg font-semibold text-gray-800 mb-4">
                Emergency Contact
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                <input
                  name="emergencyContact"
                  value={formData.emergencyContact}
                  onChange={handleInputChange}
                  placeholder="Contact name"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none"
                />

                <input
                  name="emergencyContactPhone"
                  value={formData.emergencyContactPhone}
                  onChange={handleInputChange}
                  placeholder="Contact phone"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </section>

            {/* READ ONLY */}
            <section className="bg-gray-50 border border-gray-100 rounded-xl p-5">
              <h2 className="text-lg font-semibold text-gray-800 mb-3">
                Academic Information
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-700">
                <p><span className="font-medium">Name:</span> {profile?.userId?.name}</p>
                <p><span className="font-medium">Email:</span> {profile?.userId?.email}</p>
                <p><span className="font-medium">USN:</span> {profile?.usn}</p>
                <p><span className="font-medium">Semester:</span> {profile?.semester}</p>
                <p><span className="font-medium">Section:</span> {profile?.section}</p>
              </div>
            </section>

            {/* BUTTON */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-semibold transition disabled:opacity-60"
            >
              {submitting ? "Saving..." : "Save Changes"}
            </button>

          </form>
        </div>
      </div>
    </div>
  );
};

export default StudentProfileEdit;