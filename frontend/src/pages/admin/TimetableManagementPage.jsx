import { useEffect, useState, useMemo, useCallback } from "react";
import api from "../../utils/api";

// --- HELPERS & PRIMITIVES ---
const WEEK_DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const PERIODS = [1, 2, 3, 4, 5, 6, 7, 8];

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
        "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100 disabled:text-slate-400 transition-all " +
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
        "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100 disabled:text-slate-400 transition-all " +
        className
      }
    >
      {children}
    </select>
  );
}

// --- CONFIRMATION MODAL COMPONENT ---
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
            <h3 className="text-lg font-bold text-slate-900">Remove Slot Assignment?</h3>
            <p className="mt-1.5 text-sm text-slate-500 leading-relaxed">
              Are you sure you want to delete the schedule entry for <span className="font-semibold text-slate-800">{details?.subjectName || "this subject"}</span> on {details?.day}, Period {details?.periodNo}?
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

// --- MAIN PORTAL INTERFACE ---
export default function TimetableManagementPage() {
  const [timetableEntries, setTimetableEntries] = useState([]);
  const [faculties, setFaculties] = useState([]);
  const [subjects, setSubjects] = useState([]);

  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [errorFeed, setErrorFeed] = useState("");
  const [successFeed, setSuccessFeed] = useState("");

  // Global Scope Sheet Filters (Right Grid Table Matrix)
  const [filterDepartment, setFilterDepartment] = useState("BCA");
  const [filterSemester, setFilterSemester] = useState("1");
  const [filterSection, setFilterSection] = useState("A");

  const [editingId, setEditingId] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, item: null });

  // Creation/Mutation Form Staging Payload
  const [form, setForm] = useState({
    facultyId: "",
    department: "BCA",
    semester: "",
    section: "",
    day: "Monday",
    periodNo: "1",
    startTime: "09:00",
    endTime: "10:00",
    subjectId: "", // Will hold the plain-text course code string name (e.g., "c", "cf")
    room: "",
  });

  const fetchTimetableLogs = useCallback(async () => {
    try {
      setLoading(true);
      setErrorFeed("");
      const [timetableRes, facultyRes, subjectRes] = await Promise.all([
        api.get("/api/admin/timetable"),
        api.get("/api/admin/faculty"),
        api.get("/api/admin/subjects"),
      ]);
      setTimetableEntries(timetableRes.data?.timetables || timetableRes.data?.timetable || []);
      setFaculties(facultyRes.data?.faculty || []);
      setSubjects(subjectRes.data?.subjects || []);
    } catch (err) {
      console.error(err);
      setErrorFeed("Failed to synchronize active database configurations parameters.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTimetableLogs();
  }, [fetchTimetableLogs]);

  // Find selected faculty document
  const currentSelectedFacultyDoc = useMemo(() => {
    if (!form.facultyId) return null;
    return faculties.find(f => (f._id === form.facultyId || f.id === form.facultyId));
  }, [form.facultyId, faculties]);

  // 1. Compute allowed semesters assigned to this teacher under selected department
  const facultyAllowedSemesters = useMemo(() => {
    if (!currentSelectedFacultyDoc || !Array.isArray(currentSelectedFacultyDoc.teachingAssignments)) return [];
    const sems = currentSelectedFacultyDoc.teachingAssignments
      .filter(a => String(a.department || "").trim().toUpperCase() === String(form.department || "").trim().toUpperCase())
      .map(a => Number(a.semester))
      .filter(Boolean);
    return [...new Set(sems)].sort((a, b) => a - b);
  }, [currentSelectedFacultyDoc, form.department]);

  // 2. Compute sections available based on selected faculty, department, and semester
  const facultyAllowedSections = useMemo(() => {
    if (!currentSelectedFacultyDoc || !form.semester) return [];
    const sections = currentSelectedFacultyDoc.teachingAssignments
      .filter(a => 
        String(a.department || "").trim().toUpperCase() === String(form.department || "").trim().toUpperCase() &&
        Number(a.semester) === Number(form.semester)
      )
      .map(a => String(a.section || "").trim().toUpperCase())
      .filter(Boolean);
    return [...new Set(sections)].sort();
  }, [currentSelectedFacultyDoc, form.department, form.semester]);

  // --- RE-ENGINEERED ARRAYS INTERSECTION ENGINE ---
  
  // 3 & 4. Extract individual subject elements matching criteria schemas maps
  const filteredSubjects = useMemo(() => {
    if (!form.department || !form.semester) return [];

    // Find the single master container document matching department & semester rules
    const masterContainerDoc = subjects.find(sub => 
      String(sub.department || "").trim().toUpperCase() === String(form.department).trim().toUpperCase() &&
      Number(sub.semester) === Number(form.semester)
    );

    if (!masterContainerDoc) return [];

    // Combine your custom nested string fields arrays safely into an absolute pool list
    const coreList = Array.isArray(masterContainerDoc.corSubjects) ? masterContainerDoc.corSubjects : [];
    const languageList = Array.isArray(masterContainerDoc.language) ? masterContainerDoc.language : [];
    const combinedMasterPool = [...coreList, ...languageList].map(s => String(s).trim());

    // If no faculty is selected yet, return the raw un-intersected structural curriculum pool list
    if (!currentSelectedFacultyDoc || !form.section) {
      return combinedMasterPool.map(name => ({ id: masterContainerDoc._id || masterContainerDoc.id, name }));
    }

    // Extract assignment course entries strings from active faculty document criteria
    const instructorAssignedNames = new Set();
    currentSelectedFacultyDoc.teachingAssignments.forEach(assignment => {
      if (
        String(assignment.department || "").trim().toUpperCase() === String(form.department).trim().toUpperCase() &&
        Number(assignment.semester) === Number(form.semester) &&
        String(assignment.section || "").trim().toUpperCase() === String(form.section).trim().toUpperCase()
      ) {
        if (Array.isArray(assignment.subjects)) {
          assignment.subjects.forEach(name => {
            if (name) instructorAssignedNames.add(String(name).trim().toLowerCase());
          });
        }
      }
    });

    // Intersect the unrolled elements cleanly
    return combinedMasterPool
      .filter(courseName => instructorAssignedNames.has(courseName.toLowerCase()))
      .map(courseName => ({
        id: masterContainerDoc._id || masterContainerDoc.id, // Subject document container reference _id
        name: courseName // Plain string description item name e.g. "c" or "cf"
      }));
  }, [subjects, currentSelectedFacultyDoc, form.department, form.semester, form.section]);

  // Clean form parameters when faculty switches selection
  const handleFacultyFieldChangeCleanSync = (targetFacultyId) => {
    setForm(prev => ({
      ...prev,
      facultyId: targetFacultyId,
      semester: "",
      section: "",
      subjectId: ""
    }));
  };

  // Pre-select first valid subject choice option automatically
  useEffect(() => {
    if (filteredSubjects.length > 0 && !editingId) {
      const isCurrentValid = filteredSubjects.some(s => s.name === form.subjectId);
      if (!isCurrentValid) {
        setForm(prev => ({ ...prev, subjectId: filteredSubjects[0].name }));
      }
    } else if (filteredSubjects.length === 0 && !editingId) {
      setForm(prev => ({ ...prev, subjectId: "" }));
    }
  }, [filteredSubjects, form.subjectId, editingId]);

  // Read right-side view parameters map
  const filteredGridData = useMemo(() => {
    if (!Array.isArray(timetableEntries)) return [];
    return timetableEntries.filter(item => 
      String(item.department || "").trim().toUpperCase() === filterDepartment.trim().toUpperCase() &&
      String(item.semester) === String(filterSemester) &&
      String(item.section || "").trim().toUpperCase() === filterSection.trim().toUpperCase()
    );
  }, [timetableEntries, filterDepartment, filterSemester, filterSection]);

  const matrixLookupMapping = useMemo(() => {
    const map = {};
    filteredGridData.forEach((entry) => {
      if (!entry.day) return;
      const prettyDayKey = String(entry.day).charAt(0).toUpperCase() + String(entry.day).slice(1).toLowerCase();
      const coordinateKey = `${prettyDayKey}-${entry.periodNo}`;
      map[coordinateKey] = entry;
    });
    return map;
  }, [filteredGridData]);

  // Find master document container _id matching the currently selected subject string name
  const currentSubjectParentId = useMemo(() => {
    if (!form.subjectId) return "";
    const match = filteredSubjects.find(s => s.name === form.subjectId);
    return match ? match.id : "";
  }, [form.subjectId, filteredSubjects]);

  const handleFormChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleClearForm = () => {
    setForm({
      facultyId: "",
      department: "BCA",
      semester: "",
      section: "",
      day: "Monday",
      periodNo: "1",
      startTime: "09:00",
      endTime: "10:00",
      subjectId: "",
      room: "",
    });
    setEditingId(null);
  };

  const handleTriggerEditState = (item) => {
    setEditingId(item._id || item.id);
    const matchedFacId = item.facultyId?._id || item.facultyId || "";
    
    setFilterDepartment(item.department || "BCA");
    setFilterSemester(String(item.semester || "1"));
    setFilterSection(item.section || "A");

    const prettyDayStr = String(item.day).charAt(0).toUpperCase() + String(item.day).slice(1).toLowerCase();

    setForm({
      facultyId: matchedFacId,
      department: item.department || "BCA",
      semester: String(item.semester || ""),
      section: item.section || "",
      day: prettyDayStr,
      periodNo: String(item.periodNo || "1"),
      startTime: item.startTime || "09:00",
      endTime: item.endTime || "10:00",
      subjectId: item.subjectName || item.subjectId || "",
      room: item.room || "",
    });
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setErrorFeed("");
    setSuccessFeed("");

    if (!form.facultyId || !form.semester || !form.section || !form.subjectId || !form.room.trim()) {
      setErrorFeed("Please populate all necessary verification form criteria items.");
      return;
    }

    try {
      setProcessing(true);

      const requestPayload = {
        facultyId: form.facultyId,
        department: form.department.trim().toUpperCase(),
        semester: Number(form.semester),
        section: form.section.trim().toUpperCase(),
        day: form.day.toLowerCase().trim(),
        periodNo: Number(form.periodNo),
        startTime: form.startTime,
        endTime: form.endTime,
        subjectId: currentSubjectParentId || null, // Passes matching object parent container validation reference ID
        subjectName: form.subjectId, // Passes active individual plain course string label (e.g., "c")
        room: form.room.trim(),
      };

      if (editingId) {
        await api.put(`/api/admin/timetable/${editingId}`, requestPayload);
        setSuccessFeed("Timetable sequence block adjusted successfully.");
      } else {
        await api.post("/api/admin/timetable", requestPayload);
        setSuccessFeed("Staged block committed to timetable successfully.");
      }

      handleClearForm();
      await fetchTimetableLogs();
    } catch (err) {
      console.error(err);
      setErrorFeed(err.response?.data?.message || "Time slot allocation collision or database constraint exception.");
    } finally {
      setProcessing(false);
    }
  };

  const handleRequestRemoval = (item) => {
    setDeleteModal({ isOpen: true, item });
  };

  const handleExecuteDeletion = async () => {
    const targetId = deleteModal.item?._id || deleteModal.item?.id;
    if (!targetId) return;
    try {
      setProcessing(true);
      await api.delete(`/api/admin/timetable/${targetId}`);
      setSuccessFeed("Timetable sequence grid module removed cleanly.");
      setDeleteModal({ isOpen: false, item: null });
      await fetchTimetableLogs();
    } catch (err) {
      setErrorFeed(err.response?.data?.message || "Purge process request interrupted.");
    } finally {
      setProcessing(false);
    }
  };

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
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Academic Timetable Suite</h1>
        <p className="mt-1 text-sm text-slate-500">Configure separate classroom layouts and track teacher course workloads constraints.</p>
      </div>

      {errorFeed && <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 shadow-sm">{errorFeed}</div>}
      {successFeed && <div className="mb-4 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-semibold text-green-700 shadow-sm">{successFeed}</div>}

      {/* FILTER CONTROLLER HEADER BAR */}
      <div className="mb-6 rounded-2xl border border-slate-200 bg-slate-900 p-4 shadow-md text-white flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-blue-400 animate-pulse" />
            Isolated Spreadsheet Registry View
          </h3>
          <p className="text-xs text-slate-300 mt-0.5">Toggle row controls below to inspect separate active class terms logs sheets.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Department</label>
            <select value={filterDepartment} onChange={(e) => setFilterDepartment(e.target.value.toUpperCase())} className="w-full text-xs rounded-xl bg-slate-800 border border-slate-700 p-2.5 text-white font-bold outline-none focus:border-blue-500">
              <option value="BCA">BCA</option>
              <option value="BBA">BBA</option>
              <option value="BTECH">BTech</option>
              <option value="BSC">BSc</option>
            </select>
          </div>
          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Semester Sheet</label>
            <select value={filterSemester} onChange={(e) => setFilterSemester(e.target.value)} className="w-full text-xs rounded-xl bg-slate-800 border border-slate-700 p-2.5 text-white font-bold outline-none focus:border-blue-500">
              {[1, 2, 3, 4, 5, 6, 7, 8].map(n => <option key={n} value={String(n)}>Semester Tier {n}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Class Section</label>
            <select value={filterSection} onChange={(e) => setFilterSection(e.target.value.toUpperCase())} className="w-full text-xs rounded-xl bg-slate-800 border border-slate-700 p-2.5 text-white font-bold outline-none focus:border-blue-500">
              {["A", "B", "C", "D"].map(s => <option key={s} value={s}>Section {s}</option>)}
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        
        {/* LEFT COMPONENT COLUMN FORM FIELDS */}
        <div className="lg:col-span-4 space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 border-b border-slate-50 pb-2">
              {editingId ? "Edit Allocation Properties" : "Allocate Block Entry"}
            </h2>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              
              <Field label="1. Target Department Code">
                <Select value={form.department} onChange={(e) => { handleFormChange("department", e.target.value); handleFacultyFieldChangeCleanSync(""); }} required disabled={processing}>
                  <option value="BCA">BCA</option>
                  <option value="BBA">BBA</option>
                  <option value="BTECH">BTech</option>
                  <option value="BSC">BSc</option>
                </Select>
              </Field>

              <Field label="2. Staged Instructor Faculty">
                <Select value={form.facultyId} onChange={(e) => handleFacultyFieldChangeCleanSync(e.target.value)} required disabled={processing}>
                  <option value="">Choose Instructor</option>
                  {faculties.map((f) => (
                    <option key={f._id || f.id} value={f._id || f.id}>
                      {f.userID?.name || f.name} ({f.loginID || "N/A"})
                    </option>
                  ))}
                </Select>
              </Field>

              <Field label="3. Faculty Term Semester Mapping">
                <Select 
                  value={form.semester} 
                  onChange={(e) => { handleFormChange("semester", e.target.value); handleFormChange("section", ""); handleFormChange("subjectId", ""); }} 
                  required 
                  disabled={!form.facultyId || processing || facultyAllowedSemesters.length === 0}
                >
                  <option value="">Select Target Semester</option>
                  {facultyAllowedSemesters.map(num => (
                    <option key={num} value={String(num)}>Semester {num}</option>
                  ))}
                </Select>
              </Field>

              <Field label="4. Class Section Assignment Stream">
                <Select
                  value={form.section}
                  onChange={(e) => { handleFormChange("section", e.target.value); handleFormChange("subjectId", ""); }}
                  required
                  disabled={!form.semester || processing || facultyAllowedSections.length === 0}
                >
                  <option value="">Select Target Section</option>
                  {facultyAllowedSections.map(secStr => (
                    <option key={secStr} value={secStr}>Section {secStr}</option>
                  ))}
                </Select>
              </Field>

              <Field label="5. Validated Assigned Course Unit">
                <Select value={form.subjectId} onChange={(e) => handleFormChange("subjectId", e.target.value)} required disabled={filteredSubjects.length === 0}>
                  {filteredSubjects.length === 0 ? (
                    <option value="">Select options above first to unroll subjects</option>
                  ) : (
                    <>
                      <option value="">Choose Faculty Course String</option>
                      {filteredSubjects.map(sub => (
                        <option key={sub.name} value={sub.name}>
                          {String(sub.name).toUpperCase()}
                        </option>
                      ))}
                    </>
                  )}
                </Select>
              </Field>

              <hr className="border-slate-100 my-1" />

              <div className="grid grid-cols-2 gap-3">
                <Field label="Weekday Coordinate">
                  <Select value={form.day} onChange={(e) => handleFormChange("day", e.target.value)} disabled={processing}>
                    {WEEK_DAYS.map(d => <option key={d} value={d}>{d}</option>)}
                  </Select>
                </Field>

                <Field label="Period Slot Track">
                  <Select value={form.periodNo} onChange={(e) => handleFormChange("periodNo", e.target.value)} disabled={processing}>
                    {PERIODS.map(p => <option key={p} value={String(p)}>Period {p}</option>)}
                  </Select>
                </Field>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Field label="Start Time">
                  <Input type="time" value={form.startTime} onChange={(e) => handleFormChange("startTime", e.target.value)} required disabled={processing} />
                </Field>
                <Field label="End Time">
                  <Input type="time" value={form.endTime} onChange={(e) => handleFormChange("endTime", e.target.value)} required disabled={processing} />
                </Field>
              </div>

              <Field label="Classroom / Laboratory Designation Location">
                <Input type="text" value={form.room} onChange={(e) => handleFormChange("room", e.target.value)} placeholder="e.g., Room 402, Lab Gamma" required disabled={processing} />
              </Field>

              <div className="pt-2 flex gap-2">
                <button type="submit" disabled={processing || (filteredSubjects.length === 0 && !editingId)} className={`flex-1 rounded-xl py-3 text-sm font-bold text-white shadow-sm transition-all ${editingId ? "bg-green-600 hover:bg-green-700 shadow-green-100" : "bg-blue-600 hover:bg-blue-700 shadow-blue-100"} disabled:opacity-50`}>
                  {processing ? "Saving Changes..." : editingId ? "Commit Updates" : "Save Matrix Block"}
                </button>
                {editingId && (
                  <button type="button" onClick={handleClearForm} className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50">Cancel</button>
                )}
              </div>
            </form>
          </div>
        </div>

        {/* RIGHT PANEL COLUMN MATRIX VIEW TABLE */}
        <div className="lg:col-span-8">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[780px] table-fixed border-collapse text-left">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    <th className="w-24 p-3 text-xs font-bold text-slate-400 uppercase tracking-widest">Day / Period</th>
                    {PERIODS.map(p => <th key={p} className="p-3 text-center text-xs font-bold text-slate-500 border-l border-slate-100">P{p}</th>)}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {WEEK_DAYS.map((day) => (
                    <tr key={day} className="hover:bg-slate-50/20 transition-colors">
                      <td className="p-3 text-xs font-bold text-slate-700 bg-slate-50/50">{day}</td>
                      {PERIODS.map((period) => {
                        const coordinateKey = `${day}-${period}`;
                        const cellItem = matrixLookupMapping[coordinateKey];
                        return (
                          <td key={period} className="p-2 border-l border-slate-100 align-top text-center group h-28 relative">
                            {cellItem ? (
                              <div className="h-full rounded-xl bg-blue-50/60 border border-blue-100 p-2.5 text-left flex flex-col justify-between transition-all group-hover:bg-blue-100/40">
                                <div className="min-w-0">
                                  <div className="text-xs font-bold text-blue-900 truncate" title={cellItem.subjectName}>{String(cellItem.subjectName).toUpperCase()}</div>
                                  <div className="mt-0.5 text-[10px] font-medium text-slate-500 truncate">{cellItem.facultyId?.userID?.name || cellItem.facultyId?.name || "Lecturer"}</div>
                                </div>
                                <div className="mt-2 flex items-center justify-between border-t border-blue-200/30 pt-1">
                                  <span className="text-[9px] font-bold text-blue-700 bg-blue-100/80 px-1.5 py-0.5 rounded-md">{cellItem.room}</span>
                                  <div className="hidden group-hover:flex items-center gap-1 bg-slate-50 border border-slate-200 p-0.5 rounded-lg absolute bottom-2 right-2 shadow-sm">
                                    <button type="button" onClick={() => handleTriggerEditState(cellItem)} className="p-1 rounded text-slate-600 hover:bg-white hover:text-blue-600 transition shadow-none"><svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg></button>
                                    <button type="button" onClick={() => handleRequestRemoval(cellItem)} className="p-1 rounded text-slate-400 hover:bg-white hover:text-red-600 transition shadow-none"><svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-4v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <span className="text-[10px] text-slate-300 italic select-none block mt-6 font-mono">—</span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}