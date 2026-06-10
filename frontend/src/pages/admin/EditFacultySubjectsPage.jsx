import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../utils/api";

function Field({ label, children }) {
  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between gap-3">
        <label className="text-xs font-semibold text-slate-700">{label}</label>
      </div>
      {children}
    </div>
  );
}

function Input({ className = "", ...props }) {
  return (
    <input
      {...props}
      className={
        "w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:opacity-60 " +
        className
      }
    />
  );
}

function normalizeSubjectName(s) {
  return String(s ?? "").trim();
}

function Checkbox({ checked, onChange, label, sublabel }) {
  return (
    <label
      className={
        "flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors " +
        (checked
          ? "border-blue-200 bg-blue-50"
          : "border-slate-200 bg-white hover:bg-slate-50")
      }
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-1 h-4 w-4 accent-blue-600"
      />
      <div className="min-w-0">
        <div className="truncate text-sm font-semibold text-slate-900">{label}</div>
        {sublabel ? (
          <div className="mt-0.5 truncate text-xs text-slate-500">{sublabel}</div>
        ) : null}
      </div>
    </label>
  );
}

function uniqStrings(arr) {
  const out = [];
  const seen = new Set();
  for (const x of arr) {
    const n = normalizeSubjectName(x);
    if (!n) continue;
    if (seen.has(n)) continue;
    seen.add(n);
    out.push(n);
  }
  return out;
}

function DeleteConfirmationModal({ isOpen, onClose, onConfirm, semesterNum, submitting }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" 
        onClick={submitting ? undefined : onClose}
      />
      <div className="relative w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 shadow-xl transition-all border border-slate-100 scale-100">
        <div className="flex flex-col items-center text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-600 mb-4">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-2">Delete Assignment</h3>
          <p className="text-sm text-slate-500 mb-6">
            Are you sure you want to completely remove all active assignments mapping configurations for{" "}
            <span className="font-semibold text-slate-800">Semester {semesterNum}</span>? This action updates the database.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            disabled={submitting}
            onClick={onClose}
            className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={submitting}
            onClick={onConfirm}
            className="flex-1 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700 shadow-sm disabled:opacity-50 flex items-center justify-center"
          >
            {submitting ? "Removing..." : "Yes, Remove"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function EditFacultySubjectsPage() {
  const { facultyId } = useParams();
  const navigate = useNavigate();

  const [faculty, setFaculty] = useState(null);
  const [loadingFaculty, setLoadingFaculty] = useState(true);

  const [subjects, setSubjects] = useState([]);
  const [loadingSubjects, setLoadingSubjects] = useState(true);

  const [error, setError] = useState("");
  const [assignmentSubjectsError, setAssignmentSubjectsError] = useState("");

  // Personal Context details form state fields
  const [profileForm, setProfileForm] = useState({
    name: "",
    email: "",
    phone: "",
    department: "",
    designation: ""
  });

  // Core configuration builder state
  const [selectedSemester, setSelectedSemester] = useState(null); 
  const [selectedSubjects, setSelectedSubjects] = useState(new Set()); 
  const [assignments, setAssignments] = useState([]); 
  const [editingIndex, setEditingIndex] = useState(null); 

  const [sectionInput, setSectionInput] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [imageSubmitting, setImageSubmitting] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [targetDeleteIndex, setTargetDeleteIndex] = useState(null);
  const [targetDeleteSemester, setTargetDeleteSemester] = useState(null);

  // Load Faculty Record
  const fetchFaculty = async () => {
    try {
      setLoadingFaculty(true);
      setError("");
      const res = await api.get(`/api/admin/faculty/${facultyId}`);
      const facData = res.data?.faculty || res.data?.data || res.data || null;
      setFaculty(facData);

      if (facData) {
        setProfileForm({
          name: facData.userID?.name || "",
          email: facData.userID?.email || "",
          phone: facData.phone || "",
          department: facData.department || "",
          designation: facData.designation || ""
        });
        if (facData.teachingAssignments) {
          setAssignments(facData.teachingAssignments);
        }
      }
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to fetch faculty data.");
      setFaculty(null);
    } finally {
      setLoadingFaculty(false);
    }
  };

  useEffect(() => {
    fetchFaculty();
  }, [facultyId]);

  // Load Subject Options
  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        setLoadingSubjects(true);
        const res = await api.get("/api/admin/subjects");
        const fetchedData = res.data?.subjects || res.data || [];
        setSubjects(fetchedData);
      } catch {
        setSubjects([]);
      } finally {
        setLoadingSubjects(false);
      }
    };
    fetchSubjects();
  }, []);

  // Derive unique selectable semester tabs
  const semesters = useMemo(() => {
    const set = new Set();
    const dataArray = Array.isArray(subjects) ? subjects : [];
    for (const s of dataArray) {
      const sem = Number(s?.semester);
      if (Number.isFinite(sem) && sem > 0) set.add(sem);
    }
    return Array.from(set).sort((a, b) => a - b);
  }, [subjects]);

  // Derive info properties for the active semester choice tab
  const selectedSemesterData = useMemo(() => {
    if (selectedSemester == null) return null;
    const semNum = Number(selectedSemester);
    const dataArray = Array.isArray(subjects) ? subjects : [];
    const doc = dataArray.find((s) => Number(s?.semester) === semNum);
    if (!doc) return null;

    const department = String(doc?.department || "").trim();
    const cor = Array.isArray(doc?.corSubjects) ? doc.corSubjects : [];
    const lang = Array.isArray(doc?.language) ? doc.language : [];
    const merged = uniqStrings([...cor, ...lang]);

    return {
      department,
      semester: semNum,
      subjects: merged,
    };
  }, [subjects, selectedSemester]);

  // Keep checks normalized when shifting through tab rows
  useEffect(() => {
    setSelectedSubjects((prev) => {
      if (!selectedSemesterData?.subjects?.length) return new Set();
      const allowed = new Set(selectedSemesterData.subjects);
      const next = new Set();
      for (const s of prev) {
        const n = normalizeSubjectName(s);
        if (allowed.has(n)) next.add(n);
      }
      return next;
    });
    setSectionInput("");
    setEditingIndex(null);
    setAssignmentSubjectsError("");
  }, [selectedSemester, selectedSemesterData]);

  const canAdd = useMemo(() => {
    const secOk = String(sectionInput).trim().length > 0;
    const subsOk = selectedSubjects.size > 0;
    const depOk = !!selectedSemesterData?.department;
    const semOk = selectedSemesterData?.semester && Number.isFinite(selectedSemesterData.semester);
    return depOk && semOk && secOk && subsOk;
  }, [sectionInput, selectedSubjects, selectedSemesterData]);

  const mergedSubjects = selectedSemesterData?.subjects || [];

  const toggleSubject = (subjectName) => {
    setSelectedSubjects((prev) => {
      const next = new Set(prev);
      const name = normalizeSubjectName(subjectName);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  };

  const clearFormForBuilder = () => {
    setSelectedSubjects(new Set());
    setSectionInput("");
    setEditingIndex(null);
    setAssignmentSubjectsError("");
  };

  const buildAssignmentFromCurrent = () => {
    if (!selectedSemesterData?.department) return { ok: false, error: "Department context missing." };
    if (!selectedSemesterData?.semester || !Number.isFinite(selectedSemesterData.semester)) {
      return { ok: false, error: "Valid target Semester selection required." };
    }

    const section = String(sectionInput).trim();
    if (!section) return { ok: false, error: "Section identifier is required." };

    const subjectsArr = uniqStrings(Array.from(selectedSubjects));
    if (!subjectsArr.length) return { ok: false, error: "Select at least one subject." };

    return {
      ok: true,
      value: {
        department: selectedSemesterData.department,
        semester: selectedSemesterData.semester,
        section,
        subjects: subjectsArr,
      },
    };
  };

  const addAssignment = () => {
    setAssignmentSubjectsError("");
    const built = buildAssignmentFromCurrent();
    if (!built.ok) {
      setAssignmentSubjectsError(built.error);
      return;
    }

    setAssignments((prev) => {
      const exists = prev.some(
        (a) =>
          a.department === built.value.department &&
          Number(a.semester) === Number(built.value.semester) &&
          a.section === built.value.section
      );
      if (exists) {
        setAssignmentSubjectsError("An assignment configuration card matching this context already exists.");
        return prev;
      }
      return [...prev, built.value];
    });

    clearFormForBuilder();
  };

  const startEditAssignment = (idx) => {
    const a = assignments[idx];
    if (!a) return;
    setEditingIndex(idx);
    setSelectedSemester(Number(a.semester));
    setSelectedSubjects(new Set(a.subjects || []));
    setSectionInput(a.section || "");
    setAssignmentSubjectsError("");
  };

  const cancelEdit = () => {
    clearFormForBuilder();
  };

  const saveEditAssignment = () => {
    if (editingIndex == null) return;

    setAssignmentSubjectsError("");
    const built = buildAssignmentFromCurrent();
    if (!built.ok) {
      setAssignmentSubjectsError(built.error);
      return;
    }

    const updated = built.value;
    setAssignments((prev) => {
      const conflictIndex = prev.findIndex((a, i) => {
        if (i === editingIndex) return false;
        return (
          a.department === updated.department &&
          Number(a.semester) === Number(updated.semester) &&
          a.section === updated.section
        );
      });

      if (conflictIndex !== -1) {
        setAssignmentSubjectsError("Another row mapping currently handles this matching structure.");
        return prev;
      }

      return prev.map((a, i) => (i === editingIndex ? updated : a));
    });

    setEditingIndex(null);
    setSelectedSubjects(new Set());
    setSectionInput("");
  };

  const deleteAssignment = (idx) => {
    const targetAssignment = assignments[idx];
    if (!targetAssignment) return;

    setTargetDeleteIndex(idx);
    setTargetDeleteSemester(Number(targetAssignment.semester));
    setModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (targetDeleteIndex == null || !targetDeleteSemester) return;

    try {
      setSubmitting(true);
      setError("");

      const res = await api.delete("/api/admin/faculty/subjects", {
        data: {
          facultyId,
          semester: targetDeleteSemester,
        },
      });

      if (res.data?.faculty?.teachingAssignments) {
        setAssignments(res.data.faculty.teachingAssignments);
      } else {
        setAssignments((prev) => prev.filter((item) => Number(item.semester) !== targetDeleteSemester));
      }

      if (editingIndex === targetDeleteIndex) {
        setEditingIndex(null);
        clearFormForBuilder();
      } else if (editingIndex != null && editingIndex > targetDeleteIndex) {
        setEditingIndex((prev) => (prev == null ? null : prev - 1));
      }

      setModalOpen(false);
      setTargetDeleteIndex(null);
      setTargetDeleteSemester(null);
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to remove backend assignment record.");
      setModalOpen(false);
    } finally {
      setSubmitting(false);
    }
  };

  const handleImageUpload = async (e) => {
    const selectedFile = e.target.files && e.target.files[0];
    if (!selectedFile) return;

    try {
      setImageSubmitting(true);
      setError("");

      const fd = new FormData();
      fd.append("facultyId", facultyId);
      fd.append("profileImage", selectedFile);

      const res = await api.put("/api/admin/faculty/profile-image", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.data?.profileImage) {
        setFaculty((prev) => (prev ? { ...prev, profileImage: res.data.profileImage } : null));
      } else {
        fetchFaculty();
      }
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to upload new profile image.");
    } finally {
      setImageSubmitting(false);
    }
  };

  const handleImageDelete = async () => {
    if (!faculty?.profileImage) return;
    
    if (window.confirm("Are you sure you want to delete this profile image?")) {
      try {
        setImageSubmitting(true);
        setError("");

        await api.delete("/api/admin/faculty/profile-image", {
          data: { facultyId },
        });

        setFaculty((prev) => (prev ? { ...prev, profileImage: "" } : null));
      } catch (err) {
        setError(err?.response?.data?.message || "Failed to delete profile image.");
      } finally {
        setImageSubmitting(false);
      }
    }
  };

  // Submit profile alterations and structural mappings uniformly
  const onUpdateSubmit = async () => {
    try {
      setSubmitting(true);
      setError("");

      // 1. Save Profile Details (Name, Email, Phone, Dept, Designation)
      await api.put(`/api/admin/faculty/details/${facultyId}`, {
        name: profileForm.name.trim(),
        email: profileForm.email.trim(),
        phone: profileForm.phone.trim(),
        department: profileForm.department.trim(),
        designation: profileForm.designation.trim()
      });

      // 2. Save structural allocations map matrix array 
      const assignmentPayload = {
        teachingAssignments: assignments.map((a) => ({
          department: String(a.department || profileForm.department || ""),
          semester: Number(a.semester),
          section: String(a.section || ""),
          subjects: uniqStrings(a.subjects || []),
        })),
      };

      await api.put(`/api/admin/faculty/${facultyId}`, assignmentPayload);
      navigate("/admin/faculty");
    } catch (e) {
      setError(e?.response?.data?.message || "Failed to complete update pipeline.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingFaculty) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-sm font-medium text-slate-500 animate-pulse">Loading Faculty Configuration Data...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl p-4 md:p-6">
        
        <DeleteConfirmationModal
          isOpen={modalOpen}
          onClose={() => {
            setModalOpen(false);
            setTargetDeleteIndex(null);
            setTargetDeleteSemester(null);
          }}
          onConfirm={handleConfirmDelete}
          semesterNum={targetDeleteSemester}
          submitting={submitting}
        />

        {/* Top Header Block Row */}
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">Edit Faculty Profile</h1>
            <p className="mt-1 text-sm text-slate-500">Update account credentials, metadata fields, and classroom mapping indices.</p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate("/admin/faculty")}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 Jacks text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Back
            </button>
            <button
              type="button"
              onClick={onUpdateSubmit}
              disabled={submitting || imageSubmitting}
              className="rounded-xl bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700 shadow-sm disabled:opacity-60"
            >
              {submitting ? "Saving Updates..." : "Save All Changes"}
            </button>
          </div>
        </div>

        {error ? (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
        ) : null}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          
          {/* LEFT COLUMN: Profile Account Credentials Form Block */}
          <div className="lg:col-span-5 space-y-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-lg font-bold text-slate-900 mb-4">Account Information</h2>
              
              {/* Profile Picture Controller Component Row */}
              <div className="mb-6 flex flex-col items-center gap-4 border-b border-slate-100 pb-5 sm:flex-row text-center sm:text-left">
                <div className="relative group h-16 w-16">
                  <img
                    src={faculty?.profileImage || "/default-avatar.png"}
                    alt="avatar"
                    className="h-16 w-16 rounded-full object-cover bg-slate-100 ring-2 ring-slate-200"
                    onError={(e) => { e.currentTarget.src = "/default-avatar.png"; }}
                  />
                  <label 
                    className={"absolute inset-0 flex items-center justify-center bg-black/40 rounded-full text-white cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity " + (imageSubmitting ? "pointer-events-none opacity-100" : "")}
                    htmlFor="profile-avatar-file-input"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  </label>
                  <input type="file" id="profile-avatar-file-input" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={imageSubmitting} />
                </div>
                <div className="flex-1">
                  <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">System Identifier</div>
                  <div className="text-sm font-mono font-bold text-slate-800">{faculty?.userID?.loginID || "—"}</div>
                  {faculty?.profileImage && (
                    <button type="button" onClick={handleImageDelete} disabled={imageSubmitting} className="mt-1 text-xs font-semibold text-red-600 hover:text-red-700 disabled:opacity-50">
                      Delete Avatar Photo
                    </button>
                  )}
                </div>
              </div>

              {/* Text Input Context Matrix Form */}
              <div className="space-y-4">
                <Field label="Full Name">
                  <Input 
                    value={profileForm.name} 
                    onChange={(e) => setProfileForm(p => ({ ...p, name: e.target.value }))}
                    placeholder="e.g., Rahul Sharma"
                    disabled={submitting}
                  />
                </Field>

                <Field label="Email Address">
                  <Input 
                    type="email"
                    value={profileForm.email} 
                    onChange={(e) => setProfileForm(p => ({ ...p, email: e.target.value }))}
                    placeholder="e.g., rahul@college.edu"
                    disabled={submitting}
                  />
                </Field>

                <Field label="Contact Phone">
                  <Input 
                    value={profileForm.phone} 
                    onChange={(e) => setProfileForm(p => ({ ...p, phone: e.target.value }))}
                    placeholder="e.g., 9876543210"
                    disabled={submitting}
                  />
                </Field>

                <Field label="Primary Department Code">
                  <Input 
                    value={profileForm.department} 
                    onChange={(e) => setProfileForm(p => ({ ...p, department: e.target.value }))}
                    placeholder="e.g., BCA"
                    disabled={submitting}
                  />
                </Field>

                <Field label="Professional Designation Title">
                  <Input 
                    value={profileForm.designation} 
                    onChange={(e) => setProfileForm(p => ({ ...p, designation: e.target.value }))}
                    placeholder="e.g., Assistant Professor"
                    disabled={submitting}
                  />
                </Field>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Assignment Matrix Grid Setup Builder Dashboard */}
          <div className="lg:col-span-7 space-y-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-4">
                <h2 className="text-lg font-bold text-slate-900">Teaching Allocations Builder</h2>
                <p className="text-xs text-slate-500 mt-0.5">Map or alter active classrooms constraints below</p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-4">
                <div>
                  <label className="mb-2 block text-xs font-bold text-slate-700 uppercase tracking-wider">Select Semester Tab</label>
                  <div className="flex flex-wrap gap-2">
                    {semesters.length === 0 ? (
                      <div className="text-xs text-slate-400">No semesters detected inside database.</div>
                    ) : (
                      semesters.map((sem) => {
                        const active = Number(selectedSemester) === Number(sem);
                        return (
                          <button
                            key={sem}
                            type="button"
                            onClick={() => setSelectedSemester(sem)}
                            className={
                              "rounded-xl px-4 py-2 text-xs font-semibold transition-colors " +
                              (active
                                ? "bg-blue-600 text-white"
                                : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50")
                            }
                          >
                            Semester {sem}
                          </button>
                        );
                      })
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-slate-600">Department Context</label>
                    <Input value={selectedSemesterData?.department || ""} placeholder="Select a semester" disabled />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-slate-600">Section Target Code</label>
                    <Input value={sectionInput} onChange={(e) => setSectionInput(e.target.value)} placeholder="e.g., A, B or C" disabled={selectedSemester == null} />
                  </div>
                </div>

                {assignmentSubjectsError ? (
                  <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">{assignmentSubjectsError}</div>
                ) : null}

                <div className="pt-2">
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Target Course Offerings</label>
                    <span className="text-xs font-medium text-slate-500">{selectedSubjects.size} selected</span>
                  </div>

                  {loadingSubjects ? (
                    <div className="space-y-2">
                      {[1, 2].map((i) => <div key={i} className="h-12 animate-pulse rounded-lg bg-slate-100" />)}
                    </div>
                  ) : selectedSemesterData == null ? (
                    <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center text-xs text-slate-400">
                      Choose an active semester tab option row above to explore catalog mappings.
                    </div>
                  ) : mergedSubjects.length === 0 ? (
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-6 text-center text-xs text-slate-400">
                      No system catalogs mapped under this criteria index.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                      {mergedSubjects.map((name) => {
                        const checked = selectedSubjects.has(normalizeSubjectName(name));
                        return (
                          <Checkbox
                            key={name}
                            checked={checked}
                            onChange={() => toggleSubject(name)}
                            label={name}
                            sublabel={selectedSemesterData?.department ? `• ${selectedSemesterData.department}` : undefined}
                          />
                        );
                      })}
                    </div>
                  )}
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  {editingIndex != null ? (
                    <>
                      <button type="button" onClick={saveEditAssignment} disabled={!canAdd || submitting} className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700 disabled:opacity-50">
                        Update Row Item
                      </button>
                      <button type="button" onClick={cancelEdit} className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50">
                        Cancel
                      </button>
                    </>
                  ) : (
                    <button type="button" onClick={addAssignment} disabled={!canAdd || submitting} className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700 disabled:opacity-50">
                      Add Assignment Card
                    </button>
                  )}
                </div>
              </div>

              {/* Grid cards display of added configurations lists */}
              <div className="mt-6 space-y-3 max-h-[440px] overflow-y-auto pr-1">
                {assignments.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center text-xs text-slate-400">
                    No active mappings staged yet. Complete builder operations parameters to fill this panel workspace.
                  </div>
                ) : (
                  assignments.map((a, idx) => (
                    <div key={`${a.department}-${a.semester}-${a.section}-${idx}`} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm hover:border-slate-300 transition-all">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Department</span>
                          <div className="text-sm font-bold text-slate-900">{a.department}</div>
                          <div className="mt-1.5 flex flex-wrap gap-1.5">
                            <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-[10px] font-semibold text-blue-700">Sem {a.semester}</span>
                            <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-semibold text-slate-700">Sec {a.section}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <button type="button" onClick={() => startEditAssignment(idx)} disabled={submitting} className="rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50">Edit</button>
                          <button type="button" onClick={() => deleteAssignment(idx)} disabled={submitting} className="rounded-lg border border-red-100 px-2.5 py-1 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50">Remove</button>
                        </div>
                      </div>
                      <div className="mt-3 border-t border-slate-100 pt-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Staged Subjects</span>
                        <div className="flex flex-wrap gap-1">
                          {uniqStrings(a.subjects || []).map((sub) => (
                            <span key={sub} className="inline-block rounded bg-slate-50 border border-slate-100 px-2 py-0.5 text-[10px] text-slate-600">{sub}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}