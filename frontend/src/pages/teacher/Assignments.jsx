import { useEffect, useState } from "react";
import { getAssignments, createAssignment } from "../../api/assignments.api";
import { getTeacherSubjects } from "../../api/teacher.api";
import { toast } from "react-toastify";

const Assignments = () => {
  const [assignments, setAssignments] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    title: "",
    description: "",
    subjectId: "",
    dueDate: "",
    file: null,
  });

  useEffect(() => {
    const load = async () => {
      try {
        const [assignmentsRes, subjectsRes] = await Promise.all([
          getAssignments(),
          getTeacherSubjects(),
        ]);

        setAssignments(assignmentsRes.data.assignments || []);
        setSubjects(subjectsRes.data.subjects || []);
      } catch (error) {
        toast.error("Unable to load data");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const handleChange = (key) => (e) => {
    const value = key === "file" ? e.target.files[0] : e.target.value;
    setForm((p) => ({ ...p, [key]: value }));
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("title", form.title);
      formData.append("description", form.description);
      formData.append("subjectId", form.subjectId);
      formData.append("dueDate", form.dueDate);

      if (form.file) formData.append("file", form.file);

      const { data } = await createAssignment(formData);

      setAssignments((prev) => [data.assignment, ...prev]);

      setForm({
        title: "",
        description: "",
        subjectId: "",
        dueDate: "",
        file: null,
      });

      toast.success("Assignment created");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to create");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="max-w-6xl mx-auto space-y-8">

        {/* HEADER */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Teacher Assignments
          </h1>
          <p className="text-gray-500 mt-1">
            Create and manage assignments for your subjects
          </p>
        </div>

        {/* CREATE FORM */}
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-5 text-gray-800">
            Create Assignment
          </h2>

          <form
            onSubmit={handleCreate}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            <input
              placeholder="Title"
              value={form.title}
              onChange={handleChange("title")}
              className="border rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none"
              required
            />

            <select
              value={form.subjectId}
              onChange={handleChange("subjectId")}
              className="border rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none"
              required
            >
              <option value="">Select Subject</option>
              {subjects.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.subjectName} (Sem {s.semester})
                </option>
              ))}
            </select>

            <input
              type="date"
              value={form.dueDate}
              onChange={handleChange("dueDate")}
              className="border rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none"
              required
            />

            <input
              type="file"
              onChange={handleChange("file")}
              className="border rounded-xl px-4 py-3 bg-white"
            />

            <textarea
              placeholder="Description"
              value={form.description}
              onChange={handleChange("description")}
              className="md:col-span-2 border rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none"
              rows={4}
            />

            <button
              type="submit"
              disabled={submitting}
              className="md:col-span-2 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-semibold transition disabled:opacity-60"
            >
              {submitting ? "Creating..." : "Create Assignment"}
            </button>
          </form>
        </div>

        {/* ASSIGNMENTS LIST */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-800">
            All Assignments
          </h2>

          {loading ? (
            <div className="bg-white border rounded-xl p-6 text-gray-500">
              Loading assignments...
            </div>
          ) : assignments.length === 0 ? (
            <div className="bg-white border rounded-xl p-6 text-gray-500">
              No assignments found
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {assignments.map((a) => (
                <div
                  key={a._id}
                  className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition"
                >
                  <h3 className="text-lg font-semibold text-gray-900">
                    {a.title}
                  </h3>

                  <p className="text-sm text-gray-600 mt-1">
                    {a.description}
                  </p>

                  <p className="text-sm text-gray-500 mt-2">
                    Subject:{" "}
                    <span className="font-medium">
                      {a.subjectId?.subjectName || "Unknown"}
                    </span>
                  </p>

                  <p className="text-sm text-gray-500">
                    Due: {new Date(a.dueDate).toLocaleDateString()}
                  </p>

                  {a.file?.url && (
                    <a
                      href={a.file.url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-block mt-4 bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded-xl text-sm"
                    >
                      Download File
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default Assignments;