import { useState, useEffect } from "react";
import api from "../../utils/api";

export default function FacultyNotificationPage() {
  // Form State
  const [formData, setFormData] = useState({
    title: "",
    message: "",
    target: "department", // Default matching valid faculty operations
    department: "",
    semester: "",
    section: "",
  });

  // UI Management State
  const [teachingAssignments, setTeachingAssignments] = useState([]);
  const [loadingAssignments, setLoadingAssignments] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [statusMsg, setStatusMsg] = useState({ type: "", text: "" });

  // Unique dynamic options parsed from faculty assignments for form select fields
  const [availableDepts, setAvailableDepts] = useState([]);
  const [availableSemesters, setAvailableSemesters] = useState([]);
  const [availableSections, setAvailableSections] = useState([]);

  // Fetch faculty profile on component mount to extract allowable targets
  useEffect(() => {
    const fetchFacultyProfile = async () => {
      try {
        setLoadingAssignments(true);
        const res = await api.get("/api/faculty/profile");
        if (res.data?.success && res.data?.data?.teachingAssignments) {
          const assignments = res.data.data.teachingAssignments;
          setTeachingAssignments(assignments);

          // Extract unique attributes to populate safe options
          const depts = [...new Set(assignments.map((a) => a.department))].filter(Boolean);
          const sems = [...new Set(assignments.map((a) => a.semester))].filter(Boolean);
          const secs = [...new Set(assignments.map((a) => a.section))].filter(Boolean);

          setAvailableDepts(depts);
          setAvailableSemesters(sems);
          setAvailableSections(secs);

          // Auto-select initial active values if available
          setFormData((prev) => ({
            ...prev,
            department: depts[0] || "",
            semester: sems[0] || "",
            section: secs[0] || "",
          }));
        }
      } catch (err) {
        console.error("Failed to parse faculty assignment boundaries:", err);
        showStatus("error", "Failed to sync your assigned teaching targets. Forms may be restricted.");
      } finally {
        setLoadingAssignments(false);
      }
    };

    fetchFacultyProfile();
  }, []);

  const showStatus = (type, text) => {
    setStatusMsg({ type, text });
    if (type === "success") {
      setTimeout(() => setStatusMsg({ type: "", text: "" }), 5000);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    showStatus("", "");

    // Structure raw values carefully matching model parsing rules
    const payload = {
      title: formData.title.trim(),
      message: formData.message.trim(),
      target: formData.target,
      department: formData.target === "all" ? "" : formData.department,
      semester: formData.target === "semester" || formData.target === "section" ? Number(formData.semester) : null,
      section: formData.target === "section" ? formData.section : "",
    };

    try {
      const res = await api.post("/api/notification/send", payload);
      if (res.data?.success) {
        showStatus("success", "Notification broadcast successfully distributed to target audience.");
        // Clear inputs except structural scope parameters
        setFormData((prev) => ({
          ...prev,
          title: "",
          message: "",
        }));
      }
    } catch (err) {
      console.error("Notification delivery breakdown:", err);
      showStatus("error", err.response?.data?.message || "Failed to dispatch communication payload.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 p-6 md:p-12 font-sans text-slate-700 antialiased">
      <div className="max-w-3xl mx-auto">
        
        {/* Header Block */}
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Notification Dispatcher</h1>
          <p className="text-slate-500 text-sm mt-1 font-medium">
            Compose and push announcements directly to your designated classes, semesters, or departments.
          </p>
        </div>

        {/* Global Notifications Feedback Panel */}
        {statusMsg.text && (
          <div
            className={`p-4 mb-6 rounded-xl border text-sm font-medium transition-all ${
              statusMsg.type === "success"
                ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                : "border-rose-200 bg-rose-50 text-rose-800"
            }`}
          >
            {statusMsg.type === "success" ? "✅" : "⚠️"} {statusMsg.text}
          </div>
        )}

        {loadingAssignments ? (
          <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center shadow-sm">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-sm text-slate-400 font-medium">Evaluating teaching scope boundaries...</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
            <div className="p-6 md:p-8 border-b border-slate-100 bg-slate-50/50">
              <h2 className="text-lg font-bold text-slate-800">Compose Broadcast Notice</h2>
              <p className="text-xs text-slate-400 mt-0.5">Faculty actions are locked strictly to assigned target branches.</p>
            </div>

            <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6">
              
              {/* Target Filtering Scope Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-2">
                  Audience Scope Target
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {["department", "semester", "section"].map((scope) => (
                    <label
                      key={scope}
                      className={`border p-3 rounded-xl flex items-center justify-center cursor-pointer font-bold text-xs uppercase tracking-wider transition-all select-none ${
                        formData.target === scope
                          ? "border-blue-600 bg-blue-50/50 text-blue-700 shadow-sm"
                          : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50"
                      }`}
                    >
                      <input
                        type="radio"
                        name="target"
                        value={scope}
                        checked={formData.target === scope}
                        onChange={handleInputChange}
                        className="sr-only"
                      />
                      {scope}
                    </label>
                  ))}
                </div>
              </div>

              {/* Dynamic Context Parameters Based on Selection Scope */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-xl bg-slate-50/50 border border-slate-100">
                {/* Department Select Group */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                    Department Target
                  </label>
                  <select
                    name="department"
                    value={formData.department}
                    onChange={handleInputChange}
                    disabled={availableDepts.length === 0}
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium focus:border-blue-500 focus:outline-none disabled:bg-slate-100 disabled:text-slate-400"
                  >
                    {availableDepts.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                {/* Semester Select Group */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                    Semester Bound
                  </label>
                  <select
                    name="semester"
                    value={formData.semester}
                    onChange={handleInputChange}
                    disabled={formData.target === "department" || availableSemesters.length === 0}
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium focus:border-blue-500 focus:outline-none disabled:bg-slate-100/70 disabled:text-slate-400"
                  >
                    {availableSemesters.map((s) => (
                      <option key={s} value={s}>Semester {s}</option>
                    ))}
                  </select>
                </div>

                {/* Section Select Group */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
                    Section Track
                  </label>
                  <select
                    name="section"
                    value={formData.section}
                    onChange={handleInputChange}
                    disabled={formData.target !== "section" || availableSections.length === 0}
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium focus:border-blue-500 focus:outline-none disabled:bg-slate-100/70 disabled:text-slate-400"
                  >
                    {availableSections.map((sec) => (
                      <option key={sec} value={sec}>Section {sec}</option>
                    ))}
                  </select>
                </div>
              </div>

              <hr className="border-slate-100" />

              {/* Title Input */}
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-1.5">
                  Announcement Title
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g., Extended Lab Submission Window"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm placeholder:text-slate-300 focus:border-blue-500 focus:outline-none transition-colors font-medium"
                />
              </div>

              {/* Message Input */}
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-1.5">
                  Notice Message Content
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  required
                  rows={5}
                  placeholder="Provide explicit operational parameters of your announcement..."
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm placeholder:text-slate-300 focus:border-blue-500 focus:outline-none transition-colors font-medium resize-none"
                />
              </div>

              {/* Action Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={submitting || availableDepts.length === 0}
                  className="w-full md:w-auto px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-sm transition-all focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? "Broadcasting Notice..." : "Dispatch Notification"}
                </button>
              </div>

            </form>
          </div>
        )}
      </div>
    </div>
  );
}