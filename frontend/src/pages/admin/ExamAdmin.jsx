import { useEffect, useState, useMemo, useCallback } from "react";
import api from "../../utils/api";

// --- HELPERS & PRIMITIVES ---
function Field({ label, children }) {
  return (
    <div>
      <label className="block mb-1.5 text-xs font-bold text-slate-700 uppercase tracking-wider">{label}</label>
      {children}
    </div>
  );
}

function Input({ className = "", ...props }) {
  return (
    <input
      {...props}
      className={
        "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-50 transition-all " +
        className
      }
    />
  );
}

function Select({ className = "", children, ...props }) {
  return (
    <select
      {...props}
      className={
        "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-50 transition-all " +
        className
      }
    >
      {children}
    </select>
  );
}

// --- DELETE CONFIRMATION MODAL ---
function DeleteConfirmModal({ isOpen, onClose, onConfirm, details, processing }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={processing ? undefined : onClose} />
      <div className="relative z-10 w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 shadow-xl border border-slate-100 animate-in fade-in scale-in-95 duration-200">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-600">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-4v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-slate-900">Delete Exam Profile?</h3>
            <p className="mt-1.5 text-sm text-slate-500 leading-relaxed">
              Are you sure you want to delete the schedule entry for <span className="font-semibold text-slate-800">{details?.examName || details?.name || details?.title || "this exam"}</span>? This operation removes all linked metrics from the database registries.
            </p>
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-3 border-t border-slate-50 pt-4">
          <button type="button" onClick={onClose} disabled={processing} className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition">Cancel</button>
          <button type="button" onClick={onConfirm} disabled={processing} className="rounded-xl bg-red-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-red-700 transition">
            {processing ? "Deleting..." : "Confirm Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

// --- MAIN MANAGEMENT PORTAL PAGE COMPONENT ---
export default function ExamManagementPage() {
  const [exams, setExams] = useState([]);
  const [subjects, setSubjects] = useState([]);

  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [errorFeed, setErrorFeed] = useState("");
  const [successFeed, setSuccessFeed] = useState("");

  // Target Filter Matrix Layer Scopes
  const [filterDepartment, setFilterDepartment] = useState("All");
  const [filterSemester, setFilterSemester] = useState("All");

  const [editingId, setEditingId] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, item: null });

  // Creation & Update Form State Capture
  const [form, setForm] = useState({
    examName: "",
    department: "BCA",
    semester: "1",
    subjectName: "",
    examDate: "",
    startTime: "",
    endTime: "",
    room: "",
    totalMarks: "100",
    passingMarks: "40",
  });

  // Pull records asynchronously from endpoints
  const fetchExamPortalData = useCallback(async () => {
    try {
      setLoading(true);
      setErrorFeed("");
      
      const [examRes, subjectRes] = await Promise.all([
        api.get("/api/admin/exams"),
        api.get("/api/admin/subjects"),
      ]);

      const extractedExams = examRes?.data?.data || examRes?.data?.exams || examRes?.data || [];
      const extractedSubjects = subjectRes?.data?.subjects || subjectRes?.data?.data || subjectRes?.data || [];

      setExams(Array.isArray(extractedExams) ? extractedExams : []);
      setSubjects(Array.isArray(extractedSubjects) ? extractedSubjects : []);
    } catch (err) {
      console.error("ExamAdmin fetch failed:", err);
      const status = err?.response?.status;
      if (status === 401 || status === 403) {
        setErrorFeed("Unauthorized: admin token/role missing or expired.");
      } else {
        setErrorFeed(err?.response?.data?.message || "Failed to synchronize active exam schedules matrices log files.");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchExamPortalData();
  }, [fetchExamPortalData]);

  // Dynamically filter matching course names to match the selected department/semester inside form fields
  const filteredFormSubjects = useMemo(() => {
    if (!form.department || !form.semester) return [];
    
    const containerDoc = subjects.find(s => 
      String(s?.department || "").toUpperCase() === String(form.department).toUpperCase() &&
      Number(s?.semester) === Number(form.semester)
    );
    if (!containerDoc) return [];

    const cor = Array.isArray(containerDoc.corSubjects) ? containerDoc.corSubjects : [];
    const lang = Array.isArray(containerDoc.language) ? containerDoc.language : [];
    return [...new Set([...cor, ...lang])].map(s => String(s || "").trim()).filter(Boolean).sort();
  }, [subjects, form.department, form.semester]);

  // Pre-select first available course when parameters switch
  useEffect(() => {
    if (filteredFormSubjects.length > 0 && !editingId) {
      if (!filteredFormSubjects.includes(form.subjectName)) {
        setForm(prev => ({ ...prev, subjectName: filteredFormSubjects[0] }));
      }
    } else if (filteredFormSubjects.length === 0 && !editingId) {
      setForm(prev => ({ ...prev, subjectName: "" }));
    }
  }, [filteredFormSubjects, form.subjectName, editingId]);

  // Compute dataset visible on the right-hand dashboard data table
  const displayFilteredExams = useMemo(() => {
    if (!Array.isArray(exams)) return [];
    return exams.filter((exam) => {
      if (!exam) return false;
      const matchDept = filterDepartment === "All" || String(exam.department || "").toUpperCase() === filterDepartment.toUpperCase();
      const matchSem = filterSemester === "All" || String(exam.semester || "") === String(filterSemester);
      return matchDept && matchSem;
    });
  }, [exams, filterDepartment, filterSemester]);

  const handleFormChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleClearForm = () => {
    setForm({
      examName: "",
      department: "BCA",
      semester: "1",
      subjectName: "",
      examDate: "",
      startTime: "",
      endTime: "",
      room: "",
      totalMarks: "100",
      passingMarks: "40",
    });
    setEditingId(null);
  };

  const handleTriggerEditState = (item) => {
    if (!item) return;
    setEditingId(item._id || item.id);
    
    let formattedDate = "";
    if (item.examDate) {
      formattedDate = item.examDate.split("T")[0];
    }

    setForm({
      examName: item.examName || item.name || item.title || "",
      department: item.department || "BCA",
      semester: String(item.semester || "1"),
      subjectName: item.subjectName || "",
      examDate: formattedDate,
      startTime: item.startTime || "",
      endTime: item.endTime || "",
      room: item.room || "",
      totalMarks: String(item.totalMarks !== undefined ? item.totalMarks : "100"),
      passingMarks: String(item.passingMarks !== undefined ? item.passingMarks : "40"),
    });
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setErrorFeed("");
    setSuccessFeed("");

    if (!form.examName.trim() || !form.department || !form.semester || !form.examDate) {
      setErrorFeed("Missing required exam fields: name, department, semester, exam date.");
      return;
    }

    try {
      setProcessing(true);

      const payload = {
        examName: form.examName.trim(),
        department: form.department,
        semester: Number(form.semester),
        subjectName: form.subjectName,
        examDate: form.examDate,
        startTime: form.startTime,
        endTime: form.endTime,
        room: form.room.trim(),
        totalMarks: Number(form.totalMarks),
        passingMarks: Number(form.passingMarks)
      };

      if (editingId) {
        const res = await api.put(`/api/admin/exams/${editingId}`, payload);
        if (res.data?.success || res.success) {
          setSuccessFeed("Exam parameters modified successfully.");
        }
      } else {
        const res = await api.post("/api/admin/exam", payload);
        if (res.data?.success || res.success) {
          setSuccessFeed("Staged examination event record generated successfully.");
        }
      }

      handleClearForm();
      await api.get("/api/admin/exams").then(examRes => {
        const extractedExams = examRes?.data?.data || examRes?.data?.exams || examRes?.data || [];
        setExams(Array.isArray(extractedExams) ? extractedExams : []);
      });
    } catch (err) {
      setErrorFeed(err.response?.data?.message || "Failed to finalize examination payload metrics values.");
      console.log(err.response?.data?.message );
    } finally {
      setProcessing(false);
    }
  };

  const handleRequestRemoval = (item) => {
    setDeleteModal({ isOpen: true, item });
  };

  const handleExecuteDeletion = async () => {
    const item = deleteModal.item;
    const targetId = item?._id || item?.id;
    console.log(targetId);
    if (!targetId) {
      setErrorFeed("Unable to process deletion request: missing unique identification parameters.");
      return;
    }

    try {
      setProcessing(true);
      const res = await api.delete(`/api/admin/exams/${targetId}`);
      if (res.data?.success || res.success) {
        setSuccessFeed("Exam entry cleared permanently from records.");
        setDeleteModal({ isOpen: false, item: null });
        if (editingId === targetId) handleClearForm();
        
        await api.get("/api/admin/exams").then(examRes => {
          const extractedExams = examRes?.data?.data || examRes?.data?.exams || examRes?.data || [];
          setExams(Array.isArray(extractedExams) ? extractedExams : []);
        });
      }
    } catch (err) {
      setErrorFeed(err.response?.data?.message || "Purge request operation pipeline exception encountered.");
      setDeleteModal({ isOpen: false, item: null });
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
          <p className="mt-3 text-xs font-bold text-slate-400 uppercase tracking-widest animate-pulse">Synchronizing Examination Registry...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-6">
      
      <DeleteConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, item: null })}
        onConfirm={handleExecuteDeletion}
        details={deleteModal.item}
        processing={processing}
      />

      <div className="mb-6">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Examination Framework</h1>
        <p className="mt-1 text-sm text-slate-500">Manage institutional test timetables, room settings, and score validation tiers.</p>
      </div>

      {errorFeed && <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 shadow-sm">{errorFeed}</div>}
      {successFeed && <div className="mb-4 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-semibold text-green-700 shadow-sm">{successFeed}</div>}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        
        {/* LEFT COMPONENT COLUMN PANEL: Configuration Input Wizard Form */}
        <div className="lg:col-span-4 space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between border-b border-slate-50 pb-2">
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                {editingId ? "Modify Exam Setup" : "Provision Assessment Instance"}
              </h2>
              {editingId && (
                <button type="button" onClick={handleClearForm} className="text-xs font-semibold text-blue-600 hover:text-blue-700">Clear Reset</button>
              )}
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <Field label="Assessment Title Header">
                <Input type="text" value={form.examName} onChange={(e) => handleFormChange("examName", e.target.value)} placeholder="e.g., Sessional Internal Test I" required disabled={processing} />
              </Field>

              <div className="grid grid-cols-2 gap-3">
                <Field label="Department">
                  <Select value={form.department} onChange={(e) => handleFormChange("department", e.target.value)} disabled={processing}>
                    <option value="BCA">BCA</option>
                    <option value="BBA">BBA</option>
                    <option value="BTECH">BTech</option>
                    <option value="BSC">BSc</option>
                  </Select>
                </Field>

                <Field label="Semester">
                  <Select value={form.semester} onChange={(e) => handleFormChange("semester", e.target.value)} disabled={processing}>
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(n => <option key={n} value={String(n)}>Semester {n}</option>)}
                  </Select>
                </Field>
              </div>

              <Field label="Syllabus Course Unit Target">
                <Select value={form.subjectName} onChange={(e) => handleFormChange("subjectName", e.target.value)} required disabled={processing || filteredFormSubjects.length === 0}>
                  {filteredFormSubjects.length === 0 ? (
                    <option value="">No curriculum master logs located</option>
                  ) : (
                    <>
                      <option value="">Choose Targeted Subject</option>
                      {filteredFormSubjects.map(subName => (
                        <option key={subName} value={subName}>{String(subName).toUpperCase()}</option>
                      ))}
                    </>
                  )}
                </Select>
              </Field>

              <Field label="Calendar Examination Date">
                <Input type="date" value={form.examDate} onChange={(e) => handleFormChange("examDate", e.target.value)} required disabled={processing} />
              </Field>

              <div className="grid grid-cols-2 gap-3">
                <Field label="Start Time">
                  <Input type="time" value={form.startTime} onChange={(e) => handleFormChange("startTime", e.target.value)} required disabled={processing} />
                </Field>
                <Field label="End Time">
                  <Input type="time" value={form.endTime} onChange={(e) => handleFormChange("endTime", e.target.value)} required disabled={processing} />
                </Field>
              </div>

              <Field label="Location Hall Room Number">
                <Input type="text" value={form.room} onChange={(e) => handleFormChange("room", e.target.value)} placeholder="e.g., Block B Hall 401" required disabled={processing} />
              </Field>

              <div className="grid grid-cols-2 gap-3">
                <Field label="Total Weight marks">
                  <Input type="number" value={form.totalMarks} onChange={(e) => handleFormChange("totalMarks", e.target.value)} placeholder="100" required disabled={processing} />
                </Field>
                <Field label="Passing Cutoff marks">
                  <Input type="number" value={form.passingMarks} onChange={(e) => handleFormChange("passingMarks", e.target.value)} placeholder="40" required disabled={processing} />
                </Field>
              </div>

              <button
                type="submit"
                disabled={processing || (filteredFormSubjects.length === 0 && !editingId)}
                className={`w-full rounded-xl py-3 text-sm font-bold text-white shadow-sm transition-all ${
                  editingId ? "bg-green-600 hover:bg-green-700 shadow-green-100" : "bg-blue-600 hover:bg-blue-700 shadow-blue-100"
                } disabled:opacity-50`}
              >
                {processing ? "Updating Record Layers..." : editingId ? "Commit Updates" : "Confirm Schedule Block"}
              </button>
            </form>
          </div>
        </div>

        {/* RIGHT COMPONENT COLUMN PANEL: Registry Presentation Data Sheet Table View */}
        <div className="lg:col-span-8 space-y-4">
          
          {/* Real-time filtering search bar toolbar widget */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Examination Timetables Sheets</h3>
              <p className="text-xs text-slate-400 mt-0.5">Filter master list records across departmental structures instantly.</p>
            </div>
            <div className="flex items-center gap-3">
              <select value={filterDepartment} onChange={(e) => setFilterDepartment(e.target.value)} className="text-xs rounded-xl bg-slate-50 border border-slate-200 p-2.5 text-slate-700 font-bold outline-none focus:border-blue-500">
                <option value="All">All Departments</option>
                <option value="BCA">BCA</option>
                <option value="BBA">BBA</option>
                <option value="BTECH">BTech</option>
                <option value="BSC">BSc</option>
              </select>
              <select value={filterSemester} onChange={(e) => setFilterSemester(e.target.value)} className="text-xs rounded-xl bg-slate-50 border border-slate-200 p-2.5 text-slate-700 font-bold outline-none focus:border-blue-500">
                <option value="All">All Semesters</option>
                {[1, 2, 3, 4, 5, 6, 7, 8].map(n => <option key={n} value={String(n)}>Semester {n}</option>)}
              </select>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px] border-collapse text-left text-sm">
                <thead>
                  <tr className="bg-slate-50/70 border-b border-slate-200 text-xs font-bold text-slate-400 uppercase tracking-wider">
                    <th className="p-4 w-1/4">Exam & Course</th>
                    <th className="p-4">Academic Bounds</th>
                    <th className="p-4">Timeline Blocks</th>
                    <th className="p-4">Hall Room</th>
                    <th className="p-4 text-center">Score Marks</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                  {displayFilteredExams.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-12 text-center text-xs text-slate-400 font-medium italic">
                        No active testing schedules logged matching chosen parameter criteria.
                      </td>
                    </tr>
                  ) : (
                    displayFilteredExams.map((exam) => {
                      const readableDateStr = exam?.examDate ? new Date(exam.examDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—";
                      const displayExamName = exam?.examName || exam?.name || exam?.title || "Internal Exam";
                      
                      return (
                        <tr key={exam?._id || exam?.id} className="hover:bg-slate-50/40 transition-colors">
                          <td className="p-4">
                            <div className="font-bold text-slate-900 leading-tight">{displayExamName}</div>
                            <div className="text-xs font-semibold text-blue-600 uppercase tracking-wide mt-1">{String(exam?.subjectName || "Core").toUpperCase()}</div>
                          </td>
                          <td className="p-4">
                            <div className="text-slate-900">{exam?.department || "N/A"}</div>
                            <div className="text-xs text-slate-400">Semester {exam?.semester || "N/A"}</div>
                          </td>
                          <td className="p-4">
                            <div className="text-slate-900 font-semibold">{readableDateStr}</div>
                            <div className="text-xs text-slate-400 font-mono mt-0.5">{exam?.startTime || "00:00"} - {exam?.endTime || "00:00"}</div>
                          </td>
                          <td className="p-4">
                            <span className="inline-block bg-slate-100 border border-slate-200 px-2.5 py-0.5 rounded-md text-xs text-slate-700 font-mono font-bold">
                              {exam?.room || "—"}
                            </span>
                          </td>
                          <td className="p-4 text-center">
                            <div className="text-slate-900 font-bold">{exam?.totalMarks || "100"} M</div>
                            <div className="text-[10px] text-red-500 font-bold">Cutoff: {exam?.passingMarks || "40"}M</div>
                          </td>
                          <td className="p-4 text-right">
                            <div className="inline-flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => handleTriggerEditState(exam)}
                                className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-50 transition shadow-xs"
                                title="Edit Exam"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                              </button>
                              <button
                                type="button"
                                onClick={() => handleRequestRemoval(exam)}
                                className="rounded-lg border border-red-100 p-2 text-red-600 hover:bg-red-50 transition shadow-xs"
                                title="Delete Exam"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-4v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}