import { useState, useEffect, useRef } from "react";
import api from "../../utils/api";

export default function CreateAssignmentPage() {
  // Assignment Metadata and content state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    department: "",
    semester: "",
    section: "",
    subject: "",
    dueDate: "",
  });

  const [assignmentFile, setAssignmentFile] = useState(null); // Container for local file binary
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  
  const fileInputRef = useRef(null);

  // Faculty state to extract available teaching assignments dynamically
  const [facultyAssignments, setFacultyAssignments] = useState([]);

  // Fetch faculty profile details to lock parameters down to allowed teaching scope
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

  // Handle standard controlled form variations
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // Cascading cleanups for structured relational parameters
    if (name === "department") {
      setFormData((prev) => ({ ...prev, department: value, semester: "", section: "", subject: "" }));
    } else if (name === "semester") {
      setFormData((prev) => ({ ...prev, semester: value, section: "", subject: "" }));
    } else if (name === "section") {
      setFormData((prev) => ({ ...prev, section: value, subject: "" }));
    }
  };

  // Track filesystem attachments uploaded locally
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setAssignmentFile(e.target.files[0]);
    }
  };

  // Evict the staged attachment out of component state
  const clearSelectedFile = () => {
    setAssignmentFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Process multi-part data transmission to backend matching route configurations
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Final UI Validation Safeguard
    if (!formData.title || !formData.description || !formData.department || !formData.semester || !formData.section || !formData.subject || !formData.dueDate) {
      setMessage({ type: "error", text: "Please accurately fulfill all mandatory compliance parameters." });
      return;
    }

    try {
      setSubmitting(true);
      setMessage({ type: "", text: "" });

      // Initialize FormData wrapper instance to hold textual inputs alongside file binaries
      const submissionForm = new FormData();
      submissionForm.append("title", formData.title.trim());
      submissionForm.append("description", formData.description);
      submissionForm.append("department", formData.department.trim());
      submissionForm.append("semester", Number(formData.semester));
      submissionForm.append("section", formData.section.trim());
      submissionForm.append("subject", formData.subject.trim());
      submissionForm.append("dueDate", formData.dueDate);

      // Append binary payload element if present (Matches router upload.single("file"))
      if (assignmentFile) {
        submissionForm.append("file", assignmentFile); 
      }

      // Execute content dispatch with adjusted header configurations
      const res = await api.post("/api/faculty/assignment/create", submissionForm, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (res.data?.success) {
        setMessage({ type: "success", text: "Coursework assignment dispatched and registered successfully!" });
        
        // Clear task descriptive inputs
        setFormData((prev) => ({
          ...prev,
          title: "",
          description: "",
          dueDate: "",
        }));
        clearSelectedFile();
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || "An unexpected validation or routing variance occurred.";
      setMessage({ type: "error", text: errorMsg });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 p-6 md:p-12 font-sans text-slate-700 antialiased">
      <div className="max-w-4xl mx-auto">
        
        {/* Page Heading */}
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Assignment Management</h1>
          <p className="text-slate-500 text-sm mt-1 font-medium">Issue, schedule, and route coursework records down to authenticated target sections</p>
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

        {/* Core Submission Interface */}
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Target Boundary Matrix Panel */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">Target Course Matrix</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              
              {/* Department Option Matrix */}
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

              {/* Semester Option Matrix */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Semester</label>
                <select
                  name="semester"
                  value={formData.semester}
                  onChange={handleInputChange}
                  disabled={!formData.department}
                  className="w-full px-3 py-2.5 bg-white text-slate-800 text-sm rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all disabled:opacity-50"
                >
                  <option value="">Select Sem</option>
                  {[...new Set(facultyAssignments.filter(a => a.department === formData.department).map(a => a.semester))].map(sem => (
                    <option key={sem} value={sem}>Semester {sem}</option>
                  ))}
                </select>
              </div>

              {/* Section Option Matrix */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Section</label>
                <select
                  name="section"
                  value={formData.section}
                  onChange={handleInputChange}
                  disabled={!formData.semester}
                  className="w-full px-3 py-2.5 bg-white text-slate-800 text-sm rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all disabled:opacity-50"
                >
                  <option value="">Select Sec</option>
                  {[...new Set(facultyAssignments.filter(a => a.department === formData.department && a.semester === Number(formData.semester)).map(a => a.section))].map(sec => (
                    <option key={sec} value={sec}>Section {sec}</option>
                  ))}
                </select>
              </div>

              {/* Subject Option Matrix */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Subject Course</label>
                <select
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  disabled={!formData.section}
                  className="w-full px-3 py-2.5 bg-white text-slate-800 text-sm rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all disabled:opacity-50"
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

            </div>
          </div>

          {/* Core Content Configurations Input */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 space-y-4">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-2 border-b border-slate-100 pb-2">Task Parameters</h2>
            
            {/* Title */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Assignment Title *</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="e.g., Midterm Laboratory Practical Log"
                className="w-full px-4 py-2.5 bg-white text-slate-800 text-sm rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all font-medium"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Description / Instructions *</label>
              <textarea
                name="description"
                rows="4"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Outline core submission directives, scope requirements, and systemic formatting guidelines..."
                className="w-full px-4 py-3 bg-white text-slate-800 text-sm rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all font-medium resize-none"
              ></textarea>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Due Date Calendar Picker */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Execution Due Date *</label>
                <input
                  type="datetime-local"
                  name="dueDate"
                  value={formData.dueDate}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 bg-white text-slate-800 text-sm rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all font-medium"
                />
              </div>

              {/* Integrated File Upload Component Box */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Reference Assignment File (Optional)</label>
                <div className="border border-dashed border-slate-300 rounded-xl p-2.5 bg-slate-50/50 transition-all hover:bg-slate-50 flex items-center justify-between">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                    id="assignment-file-upload"
                  />
                  {!assignmentFile ? (
                    <label
                      htmlFor="assignment-file-upload"
                      className="cursor-pointer flex items-center justify-center w-full py-1 text-sm font-semibold text-blue-600 hover:text-blue-700"
                    >
                      📎 Choose Reference File
                    </label>
                  ) : (
                    <div className="flex items-center justify-between w-full px-2 text-sm">
                      <span className="truncate text-slate-700 font-medium max-w-[200px] md:max-w-[260px]">
                        📄 {assignmentFile.name}
                      </span>
                      <button
                        type="button"
                        onClick={clearSelectedFile}
                        className="text-xs bg-rose-50 text-rose-600 hover:bg-rose-100 font-bold px-2.5 py-1 rounded-lg transition-colors ml-2"
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

          </div>

          {/* Form Action Controls Container */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={submitting || !formData.department || !formData.semester || !formData.section || !formData.subject}
              className="px-6 py-3 bg-blue-600 text-white font-bold text-sm rounded-xl hover:bg-blue-700 disabled:opacity-60 transition-colors shadow-md"
            >
              {submitting ? "Publishing Task..." : "Publish Task Record"}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}