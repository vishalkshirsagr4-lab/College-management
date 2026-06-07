import { useEffect, useState } from "react";
import { getTeacherSubjects, uploadMarks } from "../../api/teacher.api";

const Marks = () => {
  const [subjects, setSubjects] = useState([]);
  const [form, setForm] = useState({
    subjectId: "",
    studentId: "",
    marks: "",
    grade: "",
  });

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getTeacherSubjects();
        setSubjects(res.data.subjects || []);
      } catch {
        setSubjects([]);
      } finally {
        setPageLoading(false);
      }
    };
    load();
  }, []);

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      await uploadMarks(form);
      setMessage("Marks uploaded successfully");

      setForm({
        subjectId: "",
        studentId: "",
        marks: "",
        grade: "",
      });
    } catch (err) {
      setError(err?.response?.data?.message || "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  if (pageLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">

      {/* HEADER */}
      <div className="max-w-4xl mx-auto mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
          Upload Marks
        </h1>
        <p className="text-gray-500">
          Enter exam marks and grades for students
        </p>
      </div>

      {/* CARD */}
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow p-6 md:p-8">

        <form onSubmit={handleSubmit} className="space-y-5">

          {/* SUBJECT */}
          <div>
            <label className="text-sm text-gray-600">
              Subject
            </label>
            <select
              name="subjectId"
              value={form.subjectId}
              onChange={handleChange}
              required
              className="w-full mt-1 border rounded-xl p-3 focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="">Select subject</option>
              {subjects.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.subjectName}
                </option>
              ))}
            </select>
          </div>

          {/* GRID INPUTS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

            <div>
              <label className="text-sm text-gray-600">
                Student ID
              </label>
              <input
                name="studentId"
                value={form.studentId}
                onChange={handleChange}
                className="w-full mt-1 border rounded-xl p-3 focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Enter student ID"
              />
            </div>

            <div>
              <label className="text-sm text-gray-600">
                Marks
              </label>
              <input
                name="marks"
                type="number"
                value={form.marks}
                onChange={handleChange}
                className="w-full mt-1 border rounded-xl p-3 focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="0 - 100"
              />
            </div>

            <div>
              <label className="text-sm text-gray-600">
                Grade
              </label>
              <input
                name="grade"
                value={form.grade}
                onChange={handleChange}
                className="w-full mt-1 border rounded-xl p-3 focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="A / B / C"
              />
            </div>

          </div>

          {/* ALERTS */}
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm">
              {error}
            </div>
          )}

          {message && (
            <div className="bg-green-50 text-green-600 p-3 rounded-xl text-sm">
              {message}
            </div>
          )}

          {/* BUTTON */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-semibold transition disabled:opacity-60"
          >
            {loading ? "Uploading..." : "Upload Marks"}
          </button>

        </form>
      </div>
    </div>
  );
};

export default Marks;