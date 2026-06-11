import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../utils/api";

function Field({ label, children, optional = false }) {
  return (
    <div>
      <div className="mb-2 flex items-baseline justify-between gap-3">
        <label className="text-sm font-medium text-slate-700">{label}</label>
        {optional && <span className="text-xs text-slate-400">optional</span>}
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
        "w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:opacity-60 transition-all " +
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
        "w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:opacity-60 transition-all " +
        className
      }
    >
      {children}
    </select>
  );
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
      <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between border-b border-slate-50 pb-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900">{title}</h2>
        </div>
        {right ? <div>{right}</div> : null}
      </div>
      {children}
    </div>
  );
}

export default function CreateStudentPage() {
  const navigate = useNavigate();

  // Subjects state from Database
  const [subjects, setSubjects] = useState([]);
  const [loadingSubjects, setLoadingSubjects] = useState(true);
  const [subjectsError, setSubjectsError] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");

  // Base Identity State
  const [form, setForm] = useState({
    name: "",
    email: "",
    loginID: "",
    password: "",
    department: "",
    section: "",
    rollNo: "",
    phone: "",
    address: "",
    admissionYear: new Date().getFullYear().toString(),
    gender: "",
    dateOfBirth: "",
    bloodGroup: "",
    profileImageFile: null,
  });

  // Selection state mirrors your faculty registration page
  const [selectedSemester, setSelectedSemester] = useState(null); 
  const [selectedSubjects, setSelectedSubjects] = useState(new Set()); 

  // Load subject registry arrays from API
  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        setLoadingSubjects(true);
        setSubjectsError("");
        const res = await api.get("/api/admin/subjects");
        const fetchedData = res.data?.subjects || res.data || [];
        setSubjects(fetchedData);
      } catch (e) {
        setSubjectsError(e?.response?.data?.message || "Failed to fetch subjects registry.");
        setSubjects([]);
      } finally {
        setLoadingSubjects(false);
      }
    };

    fetchSubjects();
  }, []);

  // Derive unique array of numbers for semester tabs
  const semesters = useMemo(() => {
    const set = new Set();
    const dataArray = Array.isArray(subjects) ? subjects : [];
    for (const s of dataArray) {
      const sem = Number(s?.semester);
      if (Number.isFinite(sem) && sem > 0) set.add(sem);
    }
    return Array.from(set).sort((a, b) => a - b);
  }, [subjects]);

  // Derive all options matching clicked target tab
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

  // Handle cross-department sync matching step 2 selection details automatically
  useEffect(() => {
    if (selectedSemesterData?.department) {
      setForm((prev) => ({ ...prev, department: selectedSemesterData.department, semester: selectedSemesterData.semester.toString() }));
    }
    setSelectedSubjects(new Set());
  }, [selectedSemester, selectedSemesterData]);

  // Handle local image file preview memory cycles safely
  useEffect(() => {
    if (!form.profileImageFile) {
      setPreviewUrl("");
      return;
    }
    const url = URL.createObjectURL(form.profileImageFile);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [form.profileImageFile]);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const toggleSubject = (subjectName) => {
    setSelectedSubjects((prev) => {
      const next = new Set(prev);
      const name = normalizeSubjectName(subjectName);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  };

  const validatePayload = () => {
    if (!form.name.trim()) return "Student name is required.";
    if (!form.email.trim()) return "Email address is required.";
    if (!form.loginID.trim()) return "System Login ID is required.";
    if (!form.password.trim()) return "Account password selection is required.";
    if (!form.department.trim()) return "Please select a Semester Tab to map Department details.";
    if (!form.semester.trim()) return "Current active Semester enrollment layer missing.";
    if (!form.section.trim()) return "Assigned Section context code is required.";
    if (!form.rollNo.trim()) return "Institutional Roll Number string is required.";
    if (!form.phone.trim()) return "Primary contact phone value is required.";
    return "";
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    const err = validatePayload();
    if (err) {
      setFormError(err);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    try {
      setSubmitting(true);

      const fd = new FormData();
      // Mount Core Authentication fields
      fd.append("name", form.name.trim());
      fd.append("email", form.email.trim());
      fd.append("loginID", form.loginID.trim());
      fd.append("password", form.password);
      
      // Mount Educational Parameters
      fd.append("department", form.department.trim().toUpperCase());
      fd.append("semester", form.semester);
      fd.append("section", form.section.trim().toUpperCase());
      fd.append("rollNo", form.rollNo.trim());
      fd.append("admissionYear", form.admissionYear.trim());
      
      // Mount Contact & Meta parameters
      fd.append("phone", form.phone.trim());
      fd.append("address", form.address.trim());
      fd.append("gender", form.gender);
      fd.append("dateOfBirth", form.dateOfBirth);
      fd.append("bloodGroup", form.bloodGroup);

      // Map selected subject arrays directly into payload structural target keys
      const finalSubjectsArr = uniqStrings(Array.from(selectedSubjects));
      fd.append("subjects", JSON.stringify(finalSubjectsArr));

      if (form.profileImageFile) {
        fd.append("profileImage", form.profileImageFile);
      }

      await api.post("/api/admin/student", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      navigate("/admin/students");
    } catch (e) {
      setFormError(e?.response?.data?.message || "Failed to successfully save student profile.");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setSubmitting(false);
    }
  };

  const mergedSubjects = selectedSemesterData?.subjects || [];

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl p-4 md:p-6">
        
        {/* Page Top Title Unit */}
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">Create Student</h1>
            <p className="mt-1 text-sm text-slate-500">
              Provision baseline platform configuration credentials alongside selective course module assignments.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700">
              {selectedSubjects.size} Course Units Assigned
            </span>
            <button
              type="button"
              onClick={() => navigate("/admin/students")}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition shadow-sm"
            >
              Back to Records
            </button>
          </div>
        </div>

        {/* Dynamic Warning Dialog Modules */}
        {formError && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 font-medium">
            {formError}
          </div>
        )}
        {subjectsError && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 font-medium">
            {subjectsError}
          </div>
        )}

        {/* Core Submission Block Form Wrapper */}
        <form onSubmit={onSubmit} className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          
          {/* LEFT COLUMN: System Security Profile Configuration */}
          <div className="lg:col-span-5 space-y-6">
            <SectionCard
              title="Identity & Credentials"
              right={<span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md">Step 1</span>}
            >
              <div className="space-y-4">
                <Field label="Full Name">
                  <Input
                    type="text"
                    value={form.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    placeholder="e.g., Vishal Kumar"
                    required
                    disabled={submitting}
                  />
                </Field>

                <Field label="Institutional Email Address">
                  <Input
                    type="email"
                    value={form.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    placeholder="e.g., vishal@college.edu"
                    required
                    disabled={submitting}
                  />
                </Field>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Field label="System Login ID">
                    <Input
                      type="text"
                      value={form.loginID}
                      onChange={(e) => handleChange("loginID", e.target.value)}
                      placeholder="e.g., STU202601"
                      required
                      disabled={submitting}
                    />
                  </Field>

                  <Field label="Access Password">
                    <Input
                      type="password"
                      value={form.password}
                      onChange={(e) => handleChange("password", e.target.value)}
                      placeholder="••••••••"
                      required
                      disabled={submitting}
                    />
                  </Field>
                </div>

                {/* Profile Image Asset Allocation */}
                <div>
                  <div className="mb-2">
                    <label className="text-sm font-medium text-slate-700">Avatar Image Asset</label>
                  </div>
                  <div className="flex items-center gap-4 rounded-xl border border-dashed border-slate-200 bg-slate-50/50 p-3">
                    <img
                      src={previewUrl || "https://ui-avatars.com/api/?name=Student&background=60a5fa&color=fff"}
                      alt="Avatar Preview Image"
                      className="h-14 w-14 shrink-0 rounded-full bg-slate-200 object-cover ring-2 ring-white shadow-sm"
                    />
                    <div className="flex-1 min-w-0">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files && e.target.files[0];
                          handleChange("profileImageFile", file || null);
                        }}
                        className="w-full text-xs text-slate-600 file:mr-3 file:cursor-pointer file:rounded-lg file:border-0 file:bg-blue-600 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-white file:hover:bg-blue-700 transition"
                        disabled={submitting}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </SectionCard>
            
            {/* Extended Demographics Matrix Fields Card */}
            <SectionCard title="Vital Demographics (Meta Data)" right={<span className="text-xs text-slate-400">Optional info</span>}>
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Field label="Primary Phone" required>
                    <Input
                      type="tel"
                      inputMode="numeric"
                      value={form.phone}
                      onChange={(e) => handleChange("phone", e.target.value)}
                      placeholder="9876543210"
                      required
                      disabled={submitting}
                    />
                  </Field>

                  <Field label="Year of Admission">
                    <Input
                      type="number"
                      value={form.admissionYear}
                      onChange={(e) => handleChange("admissionYear", e.target.value)}
                      placeholder="2026"
                      required
                      disabled={submitting}
                    />
                  </Field>

                  <Field label="Gender Assignment" optional>
                    <Select value={form.gender} onChange={(e) => handleChange("gender", e.target.value)} disabled={submitting}>
                      <option value="">Identity Choice</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </Select>
                  </Field>

                  <Field label="Blood Group" optional>
                    <Select value={form.bloodGroup} onChange={(e) => handleChange("bloodGroup", e.target.value)} disabled={submitting}>
                      <option value="">Choose Blood Type</option>
                      {["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"].map((bg) => (
                        <option key={bg} value={bg}>{bg}</option>
                      ))}
                    </Select>
                  </Field>
                </div>

                <Field label="Date of Birth" optional>
                  <Input type="date" value={form.dateOfBirth} onChange={(e) => handleChange("dateOfBirth", e.target.value)} disabled={submitting} />
                </Field>

                <Field label="Permanent Physical Address" optional>
                  <textarea
                    rows={2}
                    value={form.address}
                    onChange={(e) => handleChange("address", e.target.value)}
                    placeholder="Enter permanent location parameters..."
                    disabled={submitting}
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:opacity-60 transition-all resize-none"
                  />
                </Field>
              </div>
            </SectionCard>
          </div>

          {/* RIGHT COLUMN: Semester tabs matching your exact layout styles */}
          <div className="lg:col-span-7 space-y-6">
            <SectionCard
              title="Academic Mapping & Course Selection"
              right={
                <span className="rounded-xl bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700">
                  Target: Course Registration
                </span>
              }
            >
              <div className="space-y-6">
                
                {/* Semester choice buttons primitive wrapper */}
                <div>
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <div>
                      <div className="text-sm font-bold text-slate-900">Select Academic Term</div>
                      <div className="mt-1 text-xs text-slate-500">Click a semester row to dynamically initialize core subjects.</div>
                    </div>
                    <div className="text-xs font-semibold text-slate-600 bg-slate-100 px-2 py-1 rounded">
                      {selectedSemesterData ? `Sem ${selectedSemesterData.semester}` : "Unselected"}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {semesters.length === 0 ? (
                      <div className="text-xs text-slate-400 py-2">No active database semesters found.</div>
                    ) : (
                      semesters.map((sem) => {
                        const active = Number(selectedSemester) === Number(sem);
                        return (
                          <button
                            key={sem}
                            type="button"
                            onClick={() => setSelectedSemester(sem)}
                            className={
                              "rounded-xl px-4 py-2 text-xs font-semibold transition-all " +
                              (active
                                ? "bg-blue-600 text-white shadow-sm"
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

                {/* Auto-populated Institutional Parameter Streams */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-xs font-semibold text-slate-600">Assigned Department</label>
                    <Input
                      value={form.department}
                      placeholder="Select a semester tab above"
                      disabled
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-xs font-semibold text-slate-600">Class Section Code</label>
                    <Input
                      value={form.section}
                      onChange={(e) => handleChange("section", e.target.value)}
                      placeholder="e.g., A, B or Alpha"
                      disabled={submitting}
                      required
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="mb-2 block text-xs font-semibold text-slate-600">Student Roll Number</label>
                    <Input
                      value={form.rollNo}
                      onChange={(e) => handleChange("rollNo", e.target.value)}
                      placeholder="e.g., KLEBCA401"
                      disabled={submitting}
                      required
                    />
                  </div>
                </div>

                {/* Course units allocation sub-grid view */}
                <div className="border-t border-slate-100 pt-4">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <div>
                      <div className="text-sm font-bold text-slate-900">Enrolled Course Units</div>
                      <div className="mt-0.5 text-xs text-slate-400">Map standard core subjects to student academic metrics profiles.</div>
                    </div>
                    <div className="text-xs font-semibold text-slate-600">
                      {selectedSubjects.size} Units Chosen
                    </div>
                  </div>

                  {loadingSubjects ? (
                    <div className="space-y-2">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="h-12 animate-pulse rounded-lg bg-slate-100" />
                      ))}
                    </div>
                  ) : selectedSemester == null ? (
                    <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-8 text-center text-xs text-slate-400">
                      Please activate an upper semester tab block row to populate available curriculum subjects.
                    </div>
                  ) : mergedSubjects.length === 0 ? (
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-6 text-center text-xs text-slate-400">
                      No matching courses found inside database for this parameter context.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 max-h-[320px] overflow-y-auto pr-1">
                      {mergedSubjects.map((name) => {
                        const checked = selectedSubjects.has(normalizeSubjectName(name));
                        return (
                          <Checkbox
                            key={name}
                            checked={checked}
                            onChange={() => toggleSubject(name)}
                            label={name}
                            sublabel={`• ${form.department || "Academic"}`}
                          />
                        );
                      })}
                    </div>
                  )}
                </div>

              </div>
            </SectionCard>

            {/* Direct Save Action Command */}
            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="w-full sm:w-auto rounded-xl bg-blue-600 px-8 py-3 text-sm font-bold text-white shadow-md hover:bg-blue-700 active:bg-blue-800 disabled:opacity-60 transition-all text-center"
              >
                {submitting ? "Pumping Payload Sync..." : "Confirm & Save Student Profile"}
              </button>
            </div>
          </div>

        </form>
      </div>
    </div>
  );
}