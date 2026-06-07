import { useEffect, useState } from "react";
import {
  getStudentProfile,
  updateStudentProfile,
  getSubjects,
  updateStudentSubjects,
} from "../../api/student.api";
import LoadingSkeleton from "../../components/ui/LoadingSkeleton";
import { toast } from "react-toastify";

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingSubjects, setSavingSubjects] = useState(false);

  const [subjects, setSubjects] = useState([]);
  const [selectedSubjects, setSelectedSubjects] = useState([]);

  const [form, setForm] = useState({
    usn: "",
    semester: "",
    section: "",
    phone: "",
    photo: null,
  });

  useEffect(() => {
    loadProfile();
    loadSubjects();
  }, []);

  const loadProfile = async () => {
    try {
      const res = await getStudentProfile();
      const student = res.data.student;

      setProfile(student);

      setSelectedSubjects((student?.subjects || []).map((s) => s._id));

      setForm({
        usn: student?.usn || "",
        semester: student?.semester || "",
        section: student?.section || "",
        phone: student?.phone || "",
        photo: null,
      });
    } catch {
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  const loadSubjects = async () => {
    try {
      const res = await getSubjects();
      setSubjects(res.data.subjects || []);
    } catch {
      setSubjects([]);
    }
  };

  const handleChange = (key) => (e) => {
    const value = key === "photo" ? e.target.files[0] : e.target.value;
    setForm((p) => ({ ...p, [key]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!profile?._id) return toast.error("Profile not found");

    setSaving(true);

    try {
      const fd = new FormData();
      fd.append("usn", form.usn);
      fd.append("semester", form.semester);
      fd.append("section", form.section);
      fd.append("phone", form.phone);
      if (form.photo) fd.append("photo", form.photo);

      const res = await updateStudentProfile(profile._id, fd);

      setProfile(res.data.student);
      toast.success("Profile updated");
      setForm((p) => ({ ...p, photo: null }));
    } catch (err) {
      toast.error(err?.response?.data?.message || "Update failed");
    } finally {
      setSaving(false);
    }
  };

  const toggleSubject = (id) => {
    setSelectedSubjects((prev) =>
      prev.includes(id)
        ? prev.filter((s) => s !== id)
        : [...prev, id]
    );
  };

  const saveSubjects = async () => {
    if (!profile?._id) return;

    setSavingSubjects(true);

    try {
      const res = await updateStudentSubjects(
        profile._id,
        selectedSubjects
      );

      setProfile(res.data.student);
      toast.success("Subjects updated");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to update subjects");
    } finally {
      setSavingSubjects(false);
    }
  };

  if (loading) {
    return <LoadingSkeleton rows={3} columns={1} />;
  }

  if (!profile) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6 text-slate-600">
        Unable to load profile
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-950">Profile</h1>
        <p className="text-sm text-slate-500">
          Manage your personal and academic information
        </p>
      </section>

      {/* GRID */}
      <div className="grid gap-6 lg:grid-cols-3">

        {/* PROFILE CARD */}
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-1">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-950">
              {profile.userId?.name || "Student"}
            </h2>
            <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs text-emerald-700">
              {profile.userId?.role || "student"}
            </span>
          </div>

          <div className="mt-5 flex flex-col items-center">
            {profile.photo?.url ? (
              <img
                src={profile.photo.url}
                className="h-28 w-28 rounded-full object-cover border"
              />
            ) : (
              <div className="h-28 w-28 rounded-full bg-slate-200 flex items-center justify-center text-slate-500">
                No Photo
              </div>
            )}

            <p className="mt-3 text-sm text-slate-600">
              {profile.userId?.email}
            </p>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3 text-sm">
            <Info label="USN" value={profile.usn} />
            <Info label="Semester" value={profile.semester} />
            <Info label="Section" value={profile.section} />
            <Info label="Phone" value={profile.phone} />
          </div>
        </section>

        {/* EDIT + SUBJECTS */}
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2 space-y-6">

          {/* EDIT FORM */}
          <div>
            <h2 className="text-lg font-semibold text-slate-950 mb-4">
              Update Profile
            </h2>

            <form onSubmit={handleSave} className="grid gap-4 sm:grid-cols-2">

              <Input value={form.usn} onChange={handleChange("usn")} placeholder="USN" />
              <Input value={form.semester} onChange={handleChange("semester")} placeholder="Semester" />
              <Input value={form.section} onChange={handleChange("section")} placeholder="Section" />
              <Input value={form.phone} onChange={handleChange("phone")} placeholder="Phone" />

              <input type="file" onChange={handleChange("photo")} className="sm:col-span-2" />

              <button
                disabled={saving}
                className="sm:col-span-2 rounded-xl bg-sky-600 py-3 text-white font-semibold hover:bg-sky-700"
              >
                {saving ? "Updating..." : "Update Profile"}
              </button>
            </form>
          </div>

          {/* SUBJECTS */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-slate-950">Subjects</h3>
              <span className="text-xs text-slate-500">
                {selectedSubjects.length} selected
              </span>
            </div>

            <div className="max-h-64 overflow-y-auto space-y-2 border rounded-2xl p-3 bg-slate-50">
              {subjects.map((sub) => (
                <label
                  key={sub._id}
                  className="flex items-center gap-2 text-sm"
                >
                  <input
                    type="checkbox"
                    checked={selectedSubjects.includes(sub._id)}
                    onChange={() => toggleSubject(sub._id)}
                  />
                  {sub.subjectName} ({sub.subjectCode})
                </label>
              ))}
            </div>

            <button
              onClick={saveSubjects}
              disabled={savingSubjects}
              className="mt-4 w-full rounded-xl bg-emerald-600 py-2 text-white hover:bg-emerald-700"
            >
              {savingSubjects ? "Saving..." : "Save Subjects"}
            </button>
          </div>

        </section>
      </div>
    </div>
  );
};

const Info = ({ label, value }) => (
  <div>
    <p className="text-slate-500 text-xs">{label}</p>
    <p className="font-medium text-slate-900">{value || "-"}</p>
  </div>
);

const Input = (props) => (
  <input
    {...props}
    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
  />
);

export default Profile;