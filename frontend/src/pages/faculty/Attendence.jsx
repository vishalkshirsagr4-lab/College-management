import { useState, useEffect, useCallback, useMemo } from "react";
import api from "../../utils/api";

export default function MarkAttendancePage() {
  // Roster Metadata selectors
  const [formData, setFormData] = useState({
    department: "",
    semester: "",
    section: "",
    subject: "",
    session: "Morning",
  });

  const [students, setStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState(""); // <-- Search input state
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  // Faculty state to extract available teaching assignments dynamically
  const [facultyAssignments, setFacultyAssignments] = useState([]);

  // Fetch faculty profile details to match teaching permissions
  useEffect(() => {
    const fetchFacultyProfile = async () => {
      try {
        const res = await api.get("/api/faculty/profile");
        if (res.data?.success && res.data?.data?.teachingAssignments) {
          setFacultyAssignments(res.data.data.teachingAssignments);
        }
      } catch (err) {
        console.error("Failed to load configuration profile context:", err);
      }
    };
    fetchFacultyProfile();
  }, []);

  // Fetch Class Roster based on configuration parameters
  const fetchClassRoster = useCallback(async () => {
    if (!formData.semester || !formData.section || !formData.subject) return;

    try {
      setLoadingStudents(true);
      setMessage({ type: "", text: "" });
      setSearchTerm(""); // Reset search on fresh roster load

      const res = await api.get("/api/faculty/students");
      const completeRoster = Array.isArray(res.data?.data) ? res.data.data : [];

      const semesterMatch = (student) => Number(student.semester) === Number(formData.semester);
      const sectionMatch = (student) => student.section?.toLowerCase() === String(formData.section).toLowerCase();
      const subjectMatch = (student) => {
        const studentSubjects = Array.isArray(student.subjects) ? student.subjects : [];
        return studentSubjects
          .map((s) => (typeof s === "string" ? s.trim().toLowerCase() : ""))
          .filter(Boolean)
          .includes(String(formData.subject).trim().toLowerCase());
      };

      const activeClassList = completeRoster.filter(
        (student) => semesterMatch(student) && sectionMatch(student) && subjectMatch(student)
      );

      const initializedStudents = activeClassList.map((student) => ({
        studentId: student._id,
        name: student.userID?.name || "Unknown Student",
        email: student.userID?.email || "—",
        status: "Present",
      }));

      setStudents(initializedStudents);
      if (initializedStudents.length === 0) {
        setMessage({ type: "info", text: "No students registered for this subject under the selected semester/section." });
      }
    } catch (err) {
      setMessage({ type: "error", text: "Failed to retrieve student roster data." });
      console.error(err);
    } finally {
      setLoadingStudents(false);
    }
  }, [formData.semester, formData.section, formData.subject]);

  // Handle dropdown parameter updates
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Flush active roster array if structural configuration targets clear
    if (["department", "semester", "section"].includes(name)) {
      setStudents([]);
      setSearchTerm("");
    }
  };

  // Filter students dynamically based on search query
  const filteredStudents = useMemo(() => {
    if (!searchTerm.trim()) return students;
    const cleanSearch = searchTerm.toLowerCase().trim();
    return students.filter(
      (student) =>
        student.name.toLowerCase().includes(cleanSearch) ||
        student.email.toLowerCase().includes(cleanSearch)
    );
  }, [students, searchTerm]);

  // Toggle dynamic single-student record state maps
  const toggleStatus = (studentId) => {
    setStudents((prevList) =>
      prevList.map((item) =>
        item.studentId === studentId
          ? { ...item, status: item.status === "Present" ? "Absent" : "Present" }
          : item
      )
    );
  };

  // Bulk Toggle helper utilities (updates only filtered items to respect search view context)
  const setFilteredStatuses = (targetStatus) => {
    const targetIds = filteredStudents.map((s) => s.studentId);
    setStudents((prevList) =>
      prevList.map((item) =>
        targetIds.includes(item.studentId) ? { ...item, status: targetStatus } : item
      )
    );
  };

  // Handle form submission to the server
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (students.length === 0) return;

    try {
      setSubmitting(true);
      setMessage({ type: "", text: "" });

      const payload = {
        department: formData.department,
        semester: Number(formData.semester),
        section: formData.section,
        subject: formData.subject,
        session: formData.session,
        students: students.map((s) => ({
          studentId: s.studentId,
          status: s.status,
        })),
      };

      const res = await api.post("/api/faculty/attendance/mark", payload);

      if (res.data?.success) {
        setMessage({ type: "success", text: "Attendance matrix applied and logged successfully!" });
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || "An unexpected error occurred processing compliance logs.";
      setMessage({ type: "error", text: errorMsg });
    } finally {
      setSubmitting(false);
    }
  };

  // Computed status counters based on current filtered view
  const presentCount = filteredStudents.filter((s) => s.status === "Present").length;
  const absentCount = filteredStudents.filter((s) => s.status === "Absent").length;

  return (
    <div className="min-h-screen bg-slate-50/50 p-6 md:p-12 font-sans text-slate-700 antialiased">
      <div className="max-w-5xl mx-auto">
        
        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Roll Call Management</h1>
          <p className="text-slate-500 text-sm mt-1 font-medium">Configure configuration parameters to register daily active counts</p>
        </div>

        {/* Global Notifications Panel */}
        {message.text && (
          <div className={`p-4 mb-6 rounded-xl border font-medium text-sm transition-all ${
            message.type === "success" ? "bg-emerald-50 border-emerald-200 text-emerald-800" :
            message.type === "error" ? "bg-rose-50 border-rose-200 text-rose-800" :
            "bg-blue-50 border-blue-200 text-blue-800"
          }`}>
            {message.text}
          </div>
        )}

        {/* Configuration Setup Form Panel */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            
            {/* Department Input */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Department</label>
              <select
                name="department"
                value={formData.department}
                onChange={handleInputChange}
                className="w-full px-3 py-2.5 bg-white text-slate-800 text-sm rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
              >
                <option value="">Select Dept</option>
                {[...new Set(facultyAssignments.map(a => a.department))].map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>

            {/* Semester Input */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Semester</label>
              <select
                name="semester"
                value={formData.semester}
                onChange={handleInputChange}
                className="w-full px-3 py-2.5 bg-white text-slate-800 text-sm rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
              >
                <option value="">Select Sem</option>
                {[...new Set(facultyAssignments.filter(a => a.department === formData.department).map(a => a.semester))].map(sem => (
                  <option key={sem} value={sem}>Semester {sem}</option>
                ))}
              </select>
            </div>

            {/* Section Input */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Section</label>
              <select
                name="section"
                value={formData.section}
                onChange={handleInputChange}
                className="w-full px-3 py-2.5 bg-white text-slate-800 text-sm rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
              >
                <option value="">Select Sec</option>
                {[...new Set(facultyAssignments.filter(a => a.department === formData.department && a.semester === Number(formData.semester)).map(a => a.section))].map(sec => (
                  <option key={sec} value={sec}>Section {sec}</option>
                ))}
              </select>
            </div>

            {/* Subject Input */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Subject Course</label>
              <select
                name="subject"
                value={formData.subject}
                onChange={handleInputChange}
                className="w-full px-3 py-2.5 bg-white text-slate-800 text-sm rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
              >
                <option value="">Select Subject</option>
                {facultyAssignments
                  .filter(a => a.department === formData.department && a.semester === Number(formData.semester) && a.section === formData.section)
                  .flatMap(a => a.subjects)
                  .map(sub => (
                    <option key={sub} value={sub}>{sub}</option>
                  ))
                }
              </select>
            </div>

            {/* Session Type Input */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Active Session</label>
              <select
                name="session"
                value={formData.session}
                onChange={handleInputChange}
                className="w-full px-3 py-2.5 bg-white text-slate-800 text-sm rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
              >
                <option value="Morning">Morning</option>
                <option value="Afternoon">Afternoon</option>
              </select>
            </div>

          </div>

          {/* Load Grid Roster Trigger */}
          <div className="mt-5 flex justify-end">
            <button
              type="button"
              onClick={fetchClassRoster}
              disabled={!formData.department || !formData.semester || !formData.section || !formData.subject}
              className="px-5 py-2.5 bg-blue-600 text-white font-bold text-sm rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-2xs"
            >
              Load Student Roster
            </button>
          </div>
        </div>

        {/* Student Processing Interface Canvas */}
        {loadingStudents ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-slate-100 shadow-sm animate-pulse">
            <p className="text-slate-400 font-bold text-sm">Collating registered academic rosters...</p>
          </div>
        ) : students.length > 0 ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Search Sub-Utility Bar */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search student by name or identity email link..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-4 pr-10 py-2.5 bg-slate-50 text-slate-800 text-sm rounded-xl border border-slate-200 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all font-medium"
                />
                {searchTerm && (
                  <button
                    type="button"
                    onClick={() => setSearchTerm("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 font-bold text-sm"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>

            {/* Quick Action Metrics Toolbar */}
            <div className="bg-slate-100 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 border border-slate-200/40">
              <div className="flex items-center gap-6 text-sm font-bold">
                <span className="text-slate-500">
                  Visible: <strong className="text-slate-800">{filteredStudents.length}</strong>/{students.length}
                </span>
                <span className="text-emerald-600">Present: <strong>{presentCount}</strong></span>
                <span className="text-rose-600">Absent: <strong>{absentCount}</strong></span>
              </div>
              <div className="flex gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => setFilteredStatuses("Present")}
                  disabled={filteredStudents.length === 0}
                  className="flex-1 sm:flex-initial px-3 py-1.5 bg-white text-emerald-700 border border-slate-200 hover:bg-emerald-50 text-xs font-bold rounded-lg transition-colors disabled:opacity-50"
                >
                  Mark Visible Present
                </button>
                <button
                  type="button"
                  onClick={() => setFilteredStatuses("Absent")}
                  disabled={filteredStudents.length === 0}
                  className="flex-1 sm:flex-initial px-3 py-1.5 bg-white text-rose-700 border border-slate-200 hover:bg-rose-50 text-xs font-bold rounded-lg transition-colors disabled:opacity-50"
                >
                  Mark Visible Absent
                </button>
              </div>
            </div>

            {/* Roster Grid Elements Canvas */}
            <div className="bg-white rounded-2xl border border-slate-200/70 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="text-xs uppercase tracking-wider text-slate-400 bg-slate-50/50 border-b border-slate-100">
                      <th scope="col" className="px-6 py-3 font-semibold">Student Name</th>
                      <th scope="col" className="px-6 py-3 font-semibold hidden sm:table-cell">Identity Email Link</th>
                      <th scope="col" className="px-6 py-3 font-semibold text-center w-36">Attendance Log</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredStudents.length > 0 ? (
                      filteredStudents.map((student) => (
                        <tr key={student.studentId} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-6 py-4">
                            <span className="font-semibold text-slate-800 block">{student.name}</span>
                            <span className="text-xs text-slate-400 sm:hidden block mt-0.5">{student.email}</span>
                          </td>
                          <td className="px-6 py-4 text-slate-500 font-medium hidden sm:table-cell">
                            {student.email}
                          </td>
                          <td className="px-6 py-4 text-center">
                            <button
                              type="button"
                              onClick={() => toggleStatus(student.studentId)}
                              className={`w-24 py-1.5 font-bold text-xs rounded-xl border transition-all shadow-3xs tracking-wide uppercase ${
                                student.status === "Present"
                                  ? "bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100"
                                  : "bg-rose-50 border-rose-200 text-rose-700 hover:bg-rose-100"
                              }`}
                            >
                              {student.status}
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="3" className="text-center py-10 text-sm text-slate-400 font-medium">
                          No student listings match "{searchTerm}"
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Form Final Processing Confirmation Actions Footer */}
            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={submitting || students.length === 0}
                className="px-6 py-3 bg-blue-600 text-white font-bold text-sm rounded-xl hover:bg-blue-700 disabled:opacity-60 transition-colors shadow-md"
              >
                {submitting ? "Commit logs..." : "Submit Registry Logs"}
              </button>
            </div>
          </form>
        ) : null}

      </div>
    </div>
  );
}