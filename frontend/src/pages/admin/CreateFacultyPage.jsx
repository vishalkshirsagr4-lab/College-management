import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../utils/api";
import { toast } from "react-toastify";

// Helper components with fixed prop setups
function Field({ label, children }) {
  return (
    <div>
      <div className="mb-2 flex items-baseline justify-between gap-3">
        <label className="text-sm font-medium text-slate-700">{label}</label>
      </div>
      {children}
    </div>
  );
}

function Input({ className = "", ...props }) {
  return (
    <input
      className={
        "w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:opacity-60 " +
        className
      }
      {...props}
    />
  );
}

function PhoneInput({ className = "", ...props }) {
  return <Input type="text" inputMode="numeric" pattern="[0-9]*" className={className} {...props} />;
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

function normalizeSubjectName(s) {
  return String(s ?? "").trim();
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

function SectionCard({ title, children, right }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-3 flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900">{title}</h2>
        </div>
        {right ? <div>{right}</div> : null}
      </div>
      {children}
    </div>
  );
}

export default function CreateFacultyPage() {
  const navigate = useNavigate();

  const [subjects, setSubjects] = useState([]);
  const [loadingSubjects, setLoadingSubjects] = useState(true);
  const [subjectsError, setSubjectsError] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  const [form, setForm] = useState({
    name: "",
    email: "",
    loginID: "",
    password: "",
    department: "",
    designation: "",
    phone: "",
    profileImageFile: null,
  });

  const [previewUrl, setPreviewUrl] = useState("");

  // Teaching assignments builder state
  const [selectedSemester, setSelectedSemester] = useState(null); 
  const [selectedSubjects, setSelectedSubjects] = useState(new Set()); 
  const [assignments, setAssignments] = useState([]); 
  const [editingIndex, setEditingIndex] = useState(null); 

  const [sectionInput, setSectionInput] = useState("");
  const [assignmentSubjectsError, setAssignmentSubjectsError] = useState("");

  // Semesters layout logic
  const semesters = useMemo(() => {
    const set = new Set();
    const dataArray = Array.isArray(subjects) ? subjects : [];
    for (const s of dataArray) {
      const sem = Number(s?.semester);
      if (Number.isFinite(sem) && sem > 0) set.add(sem);
    }
    return Array.from(set).sort((a, b) => a - b);
  }, [subjects]);

  // Selected semester information details
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
      corSubjects: uniqStrings(cor),
      language: uniqStrings(lang),
    };
  }, [subjects, selectedSemester]);

  // Reset parameters when changing semesters
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

  // Fetch API subjects data
  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        setLoadingSubjects(true);
        setSubjectsError("");
        const res = await api.get("/api/admin/subjects");
        const fetchedData = res.data?.subjects || res.data || [];
        setSubjects(fetchedData);
      } catch (e) {
        const msg = e?.response?.data?.message || "Failed to fetch subjects.";
        setSubjectsError(msg);
        toast.error(msg);
        setSubjects([]);
      } finally {
        setLoadingSubjects(false);
      }
    };

    fetchSubjects();
  }, []);

  // Image upload rendering triggers
  useEffect(() => {
    if (!form.profileImageFile) return;
    const url = URL.createObjectURL(form.profileImageFile);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [form.profileImageFile]);

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
    if (!selectedSemesterData?.department) return { ok: false, error: "Department is required." };
    if (!selectedSemesterData?.semester || !Number.isFinite(selectedSemesterData.semester)) {
      return { ok: false, error: "Valid Semester is required." };
    }

    const section = String(sectionInput).trim();
    if (!section) return { ok: false, error: "Section is required." };

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
        setAssignmentSubjectsError(
          "Assignment for this Department/Semester/Section already exists. Use Edit instead."
        );
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
        setAssignmentSubjectsError(
          "Another assignment already exists for this Department/Semester/Section. Resolve using Delete/Change."
        );
        return prev;
      }

      return prev.map((a, i) => (i === editingIndex ? updated : a));
    });

    setEditingIndex(null);
    setSelectedSubjects(new Set());
    setSectionInput("");
  };

  const deleteAssignment = (idx) => {
    setAssignments((prev) => prev.filter((_, i) => i !== idx));
    if (editingIndex === idx) {
      setEditingIndex(null);
      clearFormForBuilder();
    }
    if (editingIndex != null && editingIndex > idx) {
      setEditingIndex((v) => (v == null ? v : v - 1));
    }
  };

  const selectedTotal = useMemo(() => {
    return assignments.reduce((acc, a) => acc + (a.subjects?.length || 0), 0);
  }, [assignments]);

  const teachingAssignments = useMemo(() => {
    return assignments.map((a) => ({
      department: String(a.department || ""),
      semester: Number(a.semester),
      section: String(a.section || ""),
      subjects: uniqStrings(a.subjects || []),
    }));
  }, [assignments]);

  // STAGE 1 & STAGE 2 IN-DEPTH COMPLETE VALIDATIONS (BLOCKS SHORT VALUES & NUMERIC OVERRIDES)
  const validatePayload = () => {
    // 1. Full Name Validations
    if (!form.name.trim()) return "Full Name is required.";
    if (form.name.trim().length < 3) return "Full Name must be at least 3 characters.";
    if (!/^[A-Za-z\s.]+$/.test(form.name.trim())) return "Full Name should contain only letters and standard spacing.";

    // 2. Email Address Validations
    if (!form.email.trim()) return "Email address is required.";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email.trim())) return "Enter a valid email address.";

    // 3. Login ID Validations
    if (!form.loginID.trim()) return "Login ID is required.";
    if (form.loginID.trim().length < 12) return "Login ID must be at least 3 characters.";

    // 4. Password Validations
    if (!form.password) return "Password is required.";
    if (form.password.length < 6) return "Password must be at least 6 characters long.";

    // 5. Department Validations
    if (!form.department.trim()) return "Department is required.";
    if (!/^[A-Za-z\s-]+$/.test(form.department.trim())) return "Department should contain only letters.";

    // 6. Designation Validations
    if (!form.designation.trim()) return "Designation is required.";
    if (form.designation.trim().length < 6) return "Designation must be at least 3 characters.";

    // 7. Phone Number Validations
    if (!form.phone.trim()) return "Phone number is required.";
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(form.phone.trim())) return "Phone number must be exactly 10 digits.";

    // 8. Teaching Assignments Setup Check
    if (!teachingAssignments.length) return "Add at least one teaching assignment card on the right panel.";

    return "";
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    const err = validatePayload();
    if (err) {
      setFormError(err);
      toast.error(err);
      return;
    }

    try {
      setSubmitting(true);

      const payload = {
        name: form.name.trim(),
        email: form.email.trim(),
        loginID: form.loginID.trim(),
        password: form.password,
        department: form.department.trim(),
        designation: form.designation.trim(),
        phone: form.phone.trim(),
        teachingAssignments,
      };

      if (form.profileImageFile) {
        const fd = new FormData();
        fd.append("profileImage", form.profileImageFile);
        fd.append("name", payload.name);
        fd.append("email", payload.email);
        fd.append("loginID", payload.loginID);
        fd.append("password", payload.password);
        fd.append("department", payload.department);
        fd.append("designation", payload.designation);
        fd.append("phone", payload.phone);
        fd.append("teachingAssignments", JSON.stringify(payload.teachingAssignments));

        await api.post("/api/admin/faculty", fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        await api.post("/api/admin/faculty", payload);
      }
      toast.success("Faculty created successfully");
      navigate("/admin/faculty");
    } catch (e) {
      const msg = e?.response?.data?.message || "Failed to create faculty.";
      setFormError(msg);
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen">
      <div className="mx-auto max-w-7xl p-4 md:p-6">

        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">Create Faculty</h1>
            <p className="mt-1 text-sm text-slate-500">
              Build one or more teaching assignments (Department, Semester, Section, Subjects) and create the faculty.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700">
              {selectedTotal} Subjects Selected
            </span>
            <button
              type="button"
              onClick={() => navigate("/admin/faculty")}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Back
            </button>
          </div>
        </div>

        {formError ? (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 font-semibold animate-pulse">
            {formError}
          </div>
        ) : null}

        {subjectsError ? (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {subjectsError}
          </div>
        ) : null}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Left panel: Account details & Submit form trigger */}
          <div className="lg:col-span-5">
            <SectionCard
              title="Faculty Details"
              right={<span className="text-xs text-slate-500">Fill profile & account</span>}
            >
              <form onSubmit={onSubmit} className="mt-4 space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Field label="Name">
                    <Input
                      value={form.name}
                      onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                      placeholder="e.g., Rahul Kumar"
                      required
                      disabled={submitting}
                    />
                  </Field>

                  <Field label="Email">
                    <Input
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                      placeholder="e.g., rahul@gmail.com"
                      required
                      disabled={submitting}
                    />
                  </Field>

                  <Field label="Login ID">
                    <Input
                      value={form.loginID}
                      onChange={(e) => setForm((p) => ({ ...p, loginID: e.target.value }))}
                      placeholder="e.g., FAC001"
                      required
                      disabled={submitting}
                    />
                  </Field>

                  <Field label="Password">
                    <Input
                      type="password"
                      value={form.password}
                      onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
                      placeholder="Set password (min 6 chars)"
                      required
                      disabled={submitting}
                    />
                  </Field>

                  <Field label="Department">
                    <Input
                      value={form.department}
                      onChange={(e) => setForm((p) => ({ ...p, department: e.target.value }))}
                      placeholder="e.g., BCA"
                      required
                      disabled={submitting}
                    />
                  </Field>

                  <Field label="Designation">
                    <Input
                      value={form.designation}
                      onChange={(e) => setForm((p) => ({ ...p, designation: e.target.value }))}
                      placeholder="e.g., Assistant Professor"
                      required
                      disabled={submitting}
                    />
                  </Field>

                  <Field label="Phone">
                    <PhoneInput
                      value={form.phone}
                      onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                      placeholder="10-digit number"
                      required
                      disabled={submitting}
                    />
                  </Field>

                  <div className="sm:col-span-2">
                    <div className="mb-2 flex items-baseline justify-between gap-3">
                      <label className="text-sm font-medium text-slate-700">Profile Image</label>
                      <span className="text-xs text-slate-500">optional</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <img
                        src={previewUrl || "/default-avatar.png"}
                        alt="profile"
                        className="h-12 w-12 rounded-full bg-slate-100 object-cover ring-1 ring-slate-200"
                        onError={(e) => {
                          e.currentTarget.src = "/default-avatar.png";
                        }}
                      />

                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files && e.target.files[0];
                          setForm((p) => ({ ...p, profileImageFile: file || null }));
                        }}
                        className="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:opacity-60"
                        disabled={submitting}
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div className="text-xs text-slate-500">You must add at least one assignment before creating.</div>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
                  >
                    {submitting ? "Creating..." : "Create Faculty"}
                  </button>
                </div>
              </form>
            </SectionCard>
          </div>

          {/* Right panel: Dynamic assignment builder */}
          <div className="lg:col-span-7">
            <SectionCard
              title="Teaching Assignments"
              right={
                <span className="rounded-xl bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-700">
                  Payload: [{"{ department, semester, section, subjects }"}]
                </span>
              }
            >
              <div className="rounded-xl border border-slate-200 bg-white p-4">
                {/* Semester selectors */}
                <div className="mb-4">
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <div>
                      <div className="text-sm font-bold text-slate-900">Select Semester</div>
                      <div className="mt-1 text-xs text-slate-500">
                        Click a semester to load its subjects.
                      </div>
                    </div>
                    <div className="text-xs font-semibold text-slate-600">
                      {selectedSemesterData ? `Sem ${selectedSemesterData.semester}` : "—"}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {semesters.length === 0 ? (
                      <div className="text-xs text-slate-400">No semesters available.</div>
                    ) : (
                      semesters.map((sem) => {
                        const active = Number(selectedSemester) === Number(sem);
                        return (
                          <button
                            key={sem}
                            type="button"
                            onClick={() => setSelectedSemester(sem)}
                            className={
                              "rounded-xl px-3 py-2 text-xs font-semibold transition-colors " +
                              (active
                                ? "bg-blue-600 text-white"
                                : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50")
                            }
                            disabled={submitting}
                          >
                            Semester {sem}
                          </button>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* Assignment dynamic parameters */}
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-xs font-semibold text-slate-600">Department</label>
                    <Input
                      value={selectedSemesterData?.department || ""}
                      placeholder="Select a semester"
                      disabled
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-xs font-semibold text-slate-600">Section</label>
                    <Input
                      value={sectionInput}
                      onChange={(e) => setSectionInput(e.target.value)}
                      placeholder="A / B / ..."
                      disabled={submitting || selectedSemester == null}
                    />
                  </div>
                </div>

                {assignmentSubjectsError ? (
                  <div className="mt-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
                    {assignmentSubjectsError}
                  </div>
                ) : null}

                {/* Subjects dynamic selector layout view */}
                <div className="mt-4">
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <div>
                      <div className="text-sm font-bold text-slate-900">Subjects</div>
                      <div className="mt-1 text-xs text-slate-500">
                        Showing merged list from <span className="font-semibold">corSubjects</span> + <span className="font-semibold">language</span>.
                      </div>
                    </div>
                    <div className="text-xs font-semibold text-slate-600">
                      {selectedSubjects.size} selected
                    </div>
                  </div>

                  {loadingSubjects ? (
                    <div className="space-y-2">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="h-12 animate-pulse rounded-lg bg-slate-100" />
                      ))}
                    </div>
                  ) : selectedSemesterData == null ? (
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-6 text-center text-xs text-slate-500">
                      Select a semester to view subjects.
                    </div>
                  ) : mergedSubjects.length === 0 ? (
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-6 text-center text-xs text-slate-500">
                      No subjects found for this semester.
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

                {/* Action Trigger control parameters */}
                <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div className="text-xs text-slate-500">Add or edit an assignment card.</div>

                  {editingIndex != null ? (
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={saveEditAssignment}
                        disabled={submitting || !canAdd}
                        className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
                      >
                        Save Assignment
                      </button>
                      <button
                        type="button"
                        onClick={cancelEdit}
                        disabled={submitting}
                        className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={addAssignment}
                      disabled={submitting || !canAdd}
                      className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
                    >
                      Add Assignment
                    </button>
                  )}
                </div>
              </div>

              {/* Assignment Stack Cards Layout View */}
              <div className="mt-5">
                {assignments.length === 0 ? (
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-6 text-center text-xs text-slate-500">
                    No teaching assignments added yet.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {assignments.map((a, idx) => (
                      <div
                        key={`${a.department}-${a.semester}-${a.section}-${idx}`}
                        className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="text-xs font-semibold text-slate-500">Department</div>
                            <div className="mt-1 text-sm font-bold text-slate-900">{a.department}</div>

                            <div className="mt-2 flex flex-wrap gap-2">
                              <span className="rounded-full bg-blue-50 px-3 py-1 text-[11px] font-semibold text-blue-700">
                                Sem {a.semester}
                              </span>
                              <span className="rounded-full bg-slate-50 px-3 py-1 text-[11px] font-semibold text-slate-700 ring-1 ring-slate-200">
                                Section {a.section}
                              </span>
                            </div>
                          </div>

                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => startEditAssignment(idx)}
                              disabled={submitting}
                              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => deleteAssignment(idx)}
                              disabled={submitting}
                              className="rounded-xl border border-red-200 bg-white px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:opacity-60"
                            >
                              Delete
                            </button>
                          </div>
                        </div>

                        <div className="mt-3">
                          <div className="text-xs font-semibold text-slate-500">Selected Subjects</div>
                          {a.subjects?.length ? (
                            <div className="mt-2 flex flex-wrap gap-2">
                              {uniqStrings(a.subjects).map((s) => (
                                <span
                                  key={s}
                                  className="rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] font-semibold text-slate-700"
                                >
                                  {s}
                                </span>
                              ))}
                            </div>
                          ) : null}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </SectionCard>
          </div>
        </div>

      </div>
    </div>
  );
}