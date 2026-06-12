import { useState, useEffect, useRef } from "react";
import api from "../../utils/api";

export default function FacultyExamPage() {
  const [activeTab, setActiveTab] = useState("subjects"); // "subjects" or "marks"
  const [exams, setExams] = useState([]);
  const [facultySubjects, setFacultySubjects] = useState([]);
  const [eligibleStudents, setEligibleStudents] = useState([]);
  
  // Loading status loops
  const [loadingExams, setLoadingExams] = useState(false);
  const [loadingSubjects, setLoadingSubjects] = useState(false);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  // Custom Dropdown Open state maps
  const [subDropdownOpen, setSubDropdownOpen] = useState(false);
  const [stuDropdownOpen, setStuDropdownOpen] = useState(false);
  const [subSearch, setSubSearch] = useState("");
  const [stuSearch, setStuSearch] = useState("");

  const subDropdownRef = useRef(null);
  const stuDropdownRef = useRef(null);

  // Tab 1 Form Configuration State
  const [subjectForm, setSubjectForm] = useState({ examId: "", subject: "", syllabus: "" });

  // Tab 2 Form Configuration State 
  const [marksForm, setMarksForm] = useState({ examId: "", subject: "", studentId: "", marksObtained: "" });

  // FIXED: Component Bootstrap Hook now requests endpoints correctly matching the backend mapping
  useEffect(() => {
    const bootstrapExamHub = async () => {
      try {
        setLoadingExams(true);
        setMessage({ type: "", text: "" });
        
        const res = await api.get("/api/faculty/exams");
        if (res.data?.success) {
          setExams(res.data.exams);
        }
      } catch (err) {
        console.error("Failed core setup alignment:", err);
        setMessage({ 
          type: "error", 
          text: err.response?.data?.message || "Could not fetch administrative exams framework." 
        });
      } finally {
        setLoadingExams(false);
      }
    };
    bootstrapExamHub();
  }, []);

  // Sync Assigned Subjects on Grading Hub selection
  useEffect(() => {
    if (activeTab === "marks") {
      const fetchSubjectsList = async () => {
        try {
          setLoadingSubjects(true);
          const res = await api.get("/api/faculty/exam/my-subjects");
          if (res.data?.success) setFacultySubjects(res.data.subjects);
        } catch (err) {
          console.error("Subject sync error:", err);
          setMessage({ type: "error", text: "Failed syncing assigned teaching assignments." });
        } finally {
          setLoadingSubjects(false);
        }
      };
      fetchSubjectsList();
    }
  }, [activeTab]);

  // Reactive listener dependency tracking Student dynamic lookups
  useEffect(() => {
    const cascadeFetchStudents = async () => {
      if (!marksForm.examId || !marksForm.subject) {
        setEligibleStudents([]);
        setMarksForm(prev => ({ ...prev, studentId: "" }));
        return;
      }

      try {
        setLoadingStudents(true);
        const res = await api.get(
          `/api/faculty/exam/students-for-grading?examId=${marksForm.examId}&subject=${encodeURIComponent(marksForm.subject)}`
        );
        if (res.data?.success) {
          setEligibleStudents(res.data.students);
        }
      } catch (err) {
        console.error("Student cascading load failure:", err);
        setMessage({ type: "error", text: "Failed mapping students assigned inside this course parameters." });
      } finally {
        setLoadingStudents(false);
      }
    };

    cascadeFetchStudents();
  }, [marksForm.examId, marksForm.subject]);

  // Click Away listeners to safely collapse open popovers
  useEffect(() => {
    const handleOutsideClicks = (e) => {
      if (subDropdownRef.current && !subDropdownRef.current.contains(e.target)) setSubDropdownOpen(false);
      if (stuDropdownRef.current && !stuDropdownRef.current.contains(e.target)) setStuDropdownOpen(false);
    };
    document.addEventListener("mousedown", handleOutsideClicks);
    return () => document.removeEventListener("mousedown", handleOutsideClicks);
  }, []);

  // Submit Handler: Add Subject to Admin Structure
  // Submit Handler: Add Subject to Admin Structure
  const handleSubjectSubmit = async (e) => {
    e.preventDefault();
    if (!subjectForm.examId || !subjectForm.subject || !subjectForm.syllabus) return;

    // Payload compilation
    const payload = {
      examId: subjectForm.examId,
      subject: subjectForm.subject.trim(),
      syllabus: subjectForm.syllabus.trim(),
    };

    // 🔍 Task Validation: Client Payload Inspection Log
    console.log("=========================================");
    console.log("🚀 FRONTEND AXIOS PAYLOAD INSPECTION");
    console.log("Target Destination: /api/faculty/exam/subjects");
    console.log("Payload Object:", JSON.stringify(payload, null, 2));
    console.log("=========================================");

    try {
      setSubmitting(true);
      setMessage({ type: "", text: "" });
      
      const res = await api.post("/api/faculty/exam/subjects", payload);
      
      if (res.data?.success) {
        setMessage({ type: "success", text: "Subject context attached to exam safely!" });
        setSubjectForm({ examId: "", subject: "", syllabus: "" });
      }
    } catch (err) {
      console.error("API request failed:", err);
      setMessage({ 
        type: "error", 
        text: err.response?.data?.message || "An exception occurred saving subjects." 
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Submit Handler: Post New Clean Performance Log Matric
  const handleMarksSubmit = async (e) => {
    e.preventDefault();
    const { examId, subject, studentId, marksObtained } = marksForm;
    if (!examId || !subject || !studentId || marksObtained === "") {
      setMessage({ type: "error", text: "Validation Failed: Verify all requirements are selected." });
      return;
    }

    try {
      setSubmitting(true);
      setMessage({ type: "", text: "" });
      const res = await api.post("/api/faculty/exam/marks", {
        examId,
        subject,
        studentId,
        marksObtained: Number(marksObtained),
      });
      if (res.data?.success) {
        setMessage({ type: "success", text: "Student academic grades registered efficiently!" });
        setMarksForm(prev => ({ ...prev, studentId: "", marksObtained: "" }));
        setStuSearch("");
      }
    } catch (err) {
      setMessage({ type: "error", text: err.response?.data?.message || "Error processing grades tracking data entry." });
    } finally {
      setSubmitting(false);
    }
  };

  // Filter Arrays using local typing state strings
  const filteredSubjects = facultySubjects.filter(item =>
    item.subject.toLowerCase().includes(subSearch.toLowerCase())
  );

  const filteredStudents = eligibleStudents.filter(st =>
    st.name.toLowerCase().includes(stuSearch.toLowerCase()) ||
    st.rollNumber.toLowerCase().includes(stuSearch.toLowerCase())
  );

  const activeSelectedStudent = eligibleStudents.find(s => s._id === marksForm.studentId);

  return (
    <div className="min-h-screen bg-slate-50/50 p-6 md:p-12 font-sans text-slate-700 antialiased">
      <div className="max-w-4xl mx-auto">
        
        {/* Header Block layout */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Examination Hub</h1>
            <p className="text-slate-500 text-sm mt-1 font-medium">Link subject syllabus directives and compile student marks criteria safely</p>
          </div>

          <div className="flex bg-slate-200/60 p-1 rounded-xl border border-slate-200 self-start md:self-center">
            <button
              onClick={() => { setActiveTab("subjects"); setMessage({ type: "", text: "" }); }}
              className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${
                activeTab === "subjects" ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              📚 Add Syllabus
            </button>
            <button
              onClick={() => { setActiveTab("marks"); setMessage({ type: "", text: "" }); }}
              className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${
                activeTab === "marks" ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              💯 Grading Entry
            </button>
          </div>
        </div>

        {message.text && (
          <div className={`p-4 mb-6 rounded-xl border font-medium text-sm transition-all ${
            message.type === "success" ? "bg-emerald-50 border-emerald-200 text-emerald-800" : "bg-rose-50 border-rose-200 text-rose-800"
          }`}>
            {message.type === "success" ? "🎉 " : "⚠️ "} {message.text}
          </div>
        )}

        {/* --- TAB PANEL 1: CONFIGURE EXAM SUBJECTS --- */}
        {activeTab === "subjects" && (
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 md:p-8">
            <div className="border-b border-slate-100 pb-3 mb-6">
              <h2 className="text-lg font-bold text-slate-900">Configure Subject Scope</h2>
              <p className="text-xs font-medium text-slate-400 mt-0.5">Attach specific subject pathways and active syllabus descriptions directly to pre-scheduled exams.</p>
            </div>

            <form onSubmit={handleSubjectSubmit} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Target Admin Exam Structure</label>
                  <select
                    value={subjectForm.examId}
                    onChange={(e) => setSubjectForm(p => ({ ...p, examId: e.target.value }))}
                    className="w-full px-3 py-2.5 bg-white text-slate-800 text-sm rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                  >
                    <option value="">{loadingExams ? "Loading Exams..." : "Select Exam Event"}</option>
                    {exams.map((ex) => (
                      <option key={ex._id} value={ex._id}>{ex.examName} ({ex.department} - Sem {ex.semester})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Subject Title</label>
                  <input
                    type="text"
                    value={subjectForm.subject}
                    onChange={(e) => setSubjectForm(p => ({ ...p, subject: e.target.value }))}
                    placeholder="e.g., Object Oriented Programming"
                    className="w-full px-4 py-2.5 bg-white text-slate-800 text-sm rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Detailed Syllabus Overview</label>
                <textarea
                  rows="5"
                  value={subjectForm.syllabus}
                  onChange={(e) => setSubjectForm(p => ({ ...p, syllabus: e.target.value }))}
                  placeholder="Outline topics included, core modules..."
                  className="w-full px-4 py-3 bg-white text-slate-800 text-sm rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all font-medium resize-none"
                ></textarea>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={submitting || !subjectForm.examId || !subjectForm.subject || !subjectForm.syllabus}
                  className="px-6 py-3 bg-blue-600 text-white font-bold text-sm rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-md"
                >
                  {submitting ? "Processing Matrix..." : "Link Subject to Exam"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* --- TAB PANEL 2: AUTOMATED SMART GRADING PORTAL --- */}
        {activeTab === "marks" && (
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 md:p-8">
            <div className="border-b border-slate-100 pb-3 mb-6">
              <h2 className="text-lg font-bold text-slate-900">Student Performance Portal</h2>
              <p className="text-xs font-medium text-slate-400 mt-0.5">Automated workflows fetch authorized classes based on assigned database assignments safely.</p>
            </div>

            <form onSubmit={handleMarksSubmit} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Target Exam Structure Dropdown */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Target Admin Exam Structure</label>
                  <select
                    value={marksForm.examId}
                    onChange={(e) => setMarksForm(prev => ({ ...prev, examId: e.target.value }))}
                    className="w-full px-3 py-2.5 bg-white text-slate-800 text-sm rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all font-medium"
                  >
                    <option value="">Select Exam Event</option>
                    {exams.map((ex) => (
                      <option key={ex._id} value={ex._id}>
                        {ex.examName} ({ex.department} - Sem {ex.semester})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Searchable Assigned Subject Selection */}
                <div ref={subDropdownRef} className="relative">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Assigned Subject</label>
                  <div
                    onClick={() => !loadingSubjects && setSubDropdownOpen(!subDropdownOpen)}
                    className="w-full px-4 py-2.5 bg-white text-slate-800 text-sm rounded-xl border border-slate-200 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 cursor-pointer flex justify-between items-center transition-all min-h-[42px]"
                  >
                    <span className={marksForm.subject ? "text-slate-800 font-medium" : "text-slate-400"}>
                      {marksForm.subject || (loadingSubjects ? "Syncing teaching assignments..." : "Select Assigned Subject")}
                    </span>
                    <span className="text-slate-400 text-xs">▼</span>
                  </div>

                  {subDropdownOpen && (
                    <div className="absolute z-30 w-full mt-1 bg-white border border-slate-200 shadow-xl rounded-xl p-2 max-h-60 overflow-y-auto">
                      <input
                        type="text"
                        value={subSearch}
                        onChange={(e) => setSubSearch(e.target.value)}
                        placeholder="Filter subject titles..."
                        className="w-full px-3 py-1.5 mb-2 bg-slate-50 text-xs rounded-lg border border-slate-200 outline-none focus:border-blue-400 font-medium"
                      />
                      {filteredSubjects.length === 0 ? (
                        <div className="p-2 text-xs text-slate-400 italic">No corresponding subjects located.</div>
                      ) : (
                        filteredSubjects.map((item, idx) => (
                          <div
                            key={idx}
                            onClick={() => {
                              setMarksForm(prev => ({ ...prev, subject: item.subject }));
                              setSubDropdownOpen(false);
                              setSubSearch("");
                            }}
                            className="p-2 text-sm rounded-lg hover:bg-slate-50 cursor-pointer font-medium text-slate-700 flex items-center justify-between"
                          >
                            <span>{item.subject}</span>
                            <span className="bg-slate-100 text-slate-500 font-bold text-[10px] px-1.5 py-0.5 rounded">Sem {item.semester}</span>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Searchable Student Profile Picker */}
                <div ref={stuDropdownRef} className="relative">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Student Selection</label>
                  <div
                    onClick={() => {
                      if (marksForm.examId && marksForm.subject && !loadingStudents) {
                        setStuDropdownOpen(!stuDropdownOpen);
                      }
                    }}
                    className={`w-full px-4 py-2.5 text-sm rounded-xl border flex justify-between items-center transition-all min-h-[42px] ${
                      (!marksForm.examId || !marksForm.subject) 
                        ? "bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed" 
                        : "bg-white text-slate-800 border-slate-200 cursor-pointer focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100"
                    }`}
                  >
                    <span className={activeSelectedStudent ? "text-slate-800 font-semibold" : "text-slate-400"}>
                      {loadingStudents 
                        ? "Querying matching class lists..." 
                        : activeSelectedStudent 
                          ? `${activeSelectedStudent.name} (${activeSelectedStudent.rollNumber})` 
                          : "Choose Course Enrolled Student"
                      }
                    </span>
                    <span className="text-slate-400 text-xs">▼</span>
                  </div>

                  {stuDropdownOpen && (
                    <div className="absolute z-20 w-full mt-1 bg-white border border-slate-200 shadow-xl rounded-xl p-2 max-h-60 overflow-y-auto">
                      <input
                        type="text"
                        value={stuSearch}
                        onChange={(e) => setStuSearch(e.target.value)}
                        placeholder="Search name or roll number..."
                        className="w-full px-3 py-1.5 mb-2 bg-slate-50 text-xs rounded-lg border border-slate-200 outline-none focus:border-blue-400 font-medium"
                      />
                      {filteredStudents.length === 0 ? (
                        <div className="p-2 text-xs text-slate-400 italic">No matching classroom profiles registered.</div>
                      ) : (
                        filteredStudents.map((st) => (
                          <div
                            key={st._id}
                            onClick={() => {
                              setMarksForm(prev => ({ ...prev, studentId: st._id }));
                              setStuDropdownOpen(false);
                              setStuSearch("");
                            }}
                            className="p-2 text-sm rounded-lg hover:bg-slate-50 cursor-pointer text-slate-700 flex justify-between items-center font-medium"
                          >
                            <div>
                              <div className="text-slate-900 font-bold">{st.name}</div>
                              <div className="text-xs text-slate-400">{st.rollNumber}</div>
                            </div>
                            <span className="bg-blue-50 text-blue-600 font-bold text-[10px] px-2 py-0.5 rounded-md">Sec {st.section}</span>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                  {(!marksForm.examId || !marksForm.subject) && (
                    <span className="text-[10px] font-medium text-rose-500 block mt-1">⚠️ Select an active Exam and Subject first to build selection indices.</span>
                  )}
                </div>

                {/* Marks Entry Input */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Marks Obtained</label>
                  <input
                    type="number"
                    name="marksObtained"
                    min="0"
                    max="100"
                    value={marksForm.marksObtained}
                    onChange={(e) => setMarksForm(prev => ({ ...prev, marksObtained: e.target.value }))}
                    placeholder="e.g., 85"
                    className="w-full px-4 py-2.5 bg-white text-slate-800 text-sm rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all font-medium"
                  />
                </div>
              </div>

              {/* Form Action Submitter */}
              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={submitting || !marksForm.examId || !marksForm.subject || !marksForm.studentId || marksForm.marksObtained === ""}
                  className="px-6 py-3 bg-blue-600 text-white font-bold text-sm rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-md"
                >
                  {submitting ? "Logging Grades..." : "Register Student Marks"}
                </button>
              </div>
            </form>
          </div>
        )}

      </div>
    </div>
  );
}