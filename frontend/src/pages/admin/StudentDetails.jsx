import { useEffect, useState, useMemo, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../utils/api";

// --- UTILITY HELPERS ---
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

// --- SUB-COMPONENTS ---
function Field({ label, children, optional = false }) {
  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between gap-3">
        <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">{label}</label>
        {optional && <span className="text-[11px] text-slate-400 lowercase">optional</span>}
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
        "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-50 disabled:opacity-70 transition-all " +
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
        "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-50 disabled:opacity-70 transition-all " +
        className
      }
    >
      {children}
    </select>
  );
}

function Checkbox({ checked, onChange, label, sublabel, disabled }) {
  return (
    <label
      className={
        `flex items-start gap-3 rounded-xl border p-3.5 transition-colors ${
          disabled ? "cursor-not-allowed opacity-80" : "cursor-pointer"
        } ${
          checked
            ? "border-blue-200 bg-blue-50/60 text-blue-900"
            : "border-slate-200 bg-white hover:bg-slate-50"
        }`
      }
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => !disabled && onChange(e.target.checked)}
        disabled={disabled}
        className="mt-1 h-4 w-4 accent-blue-600 disabled:opacity-50"
      />
      <div className="min-w-0">
        <div className="text-sm font-semibold truncate">{label}</div>
        {sublabel && <div className="mt-0.5 truncate text-xs text-slate-400">{sublabel}</div>}
      </div>
    </label>
  );
}

function SectionCard({ title, children, right }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-3">
        <h2 className="text-lg font-bold text-slate-900">{title}</h2>
        {right && <div>{right}</div>}
      </div>
      {children}
    </div>
  );
}

// --- MAIN PAGE COMPONENT ---
export default function StudentDetailsPage() {
  const { studentId } = useParams();
  const navigate = useNavigate();

  // Mode & Load Status
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingSubjects, setLoadingSubjects] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Masters & Data Registries
  const [allSubjects, setAllSubjects] = useState([]);
  const [student, setStudent] = useState(null);

  // Form State Values
  const [form, setForm] = useState({
    name: "",
    email: "",
    department: "",
    semester: "",
    section: "",
    rollNo: "",
    phone: "",
    address: "",
    admissionYear: "",
    gender: "",
    dateOfBirth: "",
    bloodGroup: "",
  });
  
  // Tab Builder States
  const [builderSemester, setBuilderSemester] = useState(null);
  const [selectedSubjects, setSelectedSubjects] = useState(new Set());
  const [previewUrl, setPreviewUrl] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);

  const syncFormState = useCallback((studentDoc) => {
    if (!studentDoc) return;

    const resolvedName = studentDoc.userID?.name || studentDoc.name || "";
    const resolvedEmail = studentDoc.userID?.email || studentDoc.email || "";

    setForm((prev) => ({
      name: resolvedName || prev.name || "",
      email: resolvedEmail || prev.email || "",
      department: studentDoc.department || "",
      semester: String(studentDoc.semester || ""),
      section: studentDoc.section || "",
      rollNo: studentDoc.rollNo || "",
      phone: studentDoc.phone || "",
      address: studentDoc.address || "",
      admissionYear: String(studentDoc.admissionYear || ""),
      gender: studentDoc.gender || "",
      dateOfBirth: studentDoc.dateOfBirth ? studentDoc.dateOfBirth.split("T")[0] : "",
      bloodGroup: studentDoc.bloodGroup || "",
    }));

    if (studentDoc.semester) {
      setBuilderSemester(Number(studentDoc.semester));
    }

    const hydratedSubs = Array.isArray(studentDoc.subjects) ? studentDoc.subjects : [];
    setSelectedSubjects(new Set(hydratedSubs.map(s => normalizeSubjectName(s))));
    setPreviewUrl(studentDoc.profileImage || "");
  }, []);

  const fetchInitialData = useCallback(async () => {
    try {
      setLoading(true);
      setLoadingSubjects(true);
      setErrorMessage("");

      const [subjectsRes, studentRes] = await Promise.all([
        api.get("/api/admin/subjects"),
        api.get(`/api/admin/students/${studentId}`)
      ]);

      const subjectsData = subjectsRes.data?.subjects || subjectsRes.data || [];
      setAllSubjects(subjectsData);

      const studentDoc = studentRes.data?.student || studentRes.data?.data?.student || studentRes.data;
      if (!studentDoc) throw new Error("Student profile payload structured unexpectedly.");

      setStudent(studentDoc);
      syncFormState(studentDoc);

    } catch (err) {
      console.error("Initialization error:", err);
      setErrorMessage(err.response?.data?.message || "Failed to download student records.");
    } finally {
      setLoading(false);
      setLoadingSubjects(false);
    }
  }, [studentId, syncFormState]);

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  const semesters = useMemo(() => {
    const set = new Set();
    const dataArray = Array.isArray(allSubjects) ? allSubjects : [];
    for (const s of dataArray) {
      const sem = Number(s?.semester);
      if (Number.isFinite(sem) && sem > 0) set.add(sem);
    }
    return Array.from(set).sort((a, b) => a - b);
  }, [allSubjects]);

  const builderSemesterData = useMemo(() => {
    if (!builderSemester) return null;
    const semNum = Number(builderSemester);
    const dataArray = Array.isArray(allSubjects) ? allSubjects : [];
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
  }, [allSubjects, builderSemester]);

  useEffect(() => {
    if (builderSemesterData && isEditing) {
      setForm((prev) => {
        if (Number(prev.semester) === Number(builderSemesterData.semester) && prev.department === builderSemesterData.department) {
          return prev;
        }
        setSelectedSubjects(new Set()); 
        return {
          ...prev,
          department: builderSemesterData.department,
          semester: String(builderSemesterData.semester),
        };
      });
    }
  }, [builderSemester, builderSemesterData, isEditing]);

  const handleFieldChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const toggleSubjectChecked = (subjectName) => {
    setSelectedSubjects((prev) => {
      const next = new Set(prev);
      const normalized = normalizeSubjectName(subjectName);
      if (next.has(normalized)) next.delete(normalized);
      else next.add(normalized);
      return next;
    });
  };

  const handleImageFileChange = async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    try {
      setUploadingImage(true);
      setErrorMessage("");
      setSuccessMessage("");

      const fd = new FormData();
      fd.append("profileImage", file);

      const res = await api.put(`/api/admin/student/profile-image/${studentId}`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const nextUrl = res.data?.profileImage || res.profileImage;
      setPreviewUrl(nextUrl);
      setSuccessMessage("Profile display asset altered successfully.");
    } catch (err) {
      console.error("File upload crash:", err);
      setErrorMessage(err.response?.data?.message || "Failed to upload custom avatar photo.");
    } finally {
      setUploadingImage(false);
    }
  };

  // --- STRICT FORM VALIDATION LOGIC FOR ALL FIELDS ---
  const validateFormFields = () => {
    // 1. Name validation
    if (!form.name.trim()) return "Student Name is required.";
    if (form.name.trim().length < 3) return "Student Name must be at least 3 characters long.";
    if (/^\d+$/.test(form.name.trim())) return "Student Name cannot be just numbers.";
    if (!/^[A-Za-z\s.]+$/.test(form.name.trim())) return "Name can only contain alphabets, dots, and spaces.";

    // 2. Email validation
    if (!form.email.trim()) return "Email address is required.";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email.trim())) return "Please enter a valid e-mail structure.";

    // 3. Department validation
    if (!form.department.trim()) return "Department is required. Choose a Semester upper tab option.";

    // 4. Semester validation
    if (!form.semester.trim()) return "Academic Semester mapping is required.";

    // 5. Section validation
    if (!form.section.trim()) return "Class Section Assignment Stream is required.";
    if (form.section.trim().length < 1) return "Section string cannot be blank.";

    // 6. Roll Number validation
    if (!form.rollNo.trim()) return "Institutional Roll Registry Key is required.";
    if (form.rollNo.trim().length < 2) return "Roll Number must be at least 2 characters.";

    // 7. Phone Number validation
    if (!form.phone.trim()) return "Primary Contact Phone is required.";
    const phoneClean = form.phone.trim();
    if (!/^\d{10}$/.test(phoneClean)) return "Phone number must be exactly 10 digits without text.";

    // 8. Admission Year validation
    if (!form.admissionYear.trim()) return "Year of Admission Frame is required.";
    const currentYear = new Date().getFullYear();
    const yearNum = Number(form.admissionYear);
    if (isNaN(yearNum) || yearNum < 1990 || yearNum > currentYear + 1) {
      return `Please input a realistic admission year framework (1990 - ${currentYear + 1}).`;
    }

    // 9. Course Checklist validation
    if (selectedSubjects.size === 0) return "Please enroll the student in at least one course unit block.";

    // Optional Fields Check (If typed, validate string data lengths)
    if (form.address.trim() && form.address.trim().length < 5) {
      return "Optional Permanent Address summary description must be at least 5 characters long.";
    }

    return null; // Form data clean
  };

  const handleUpdateSubmit = async (e) => {
    if (e) e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    // Trigger strict custom validations before API payload delivery runs
    const validationError = validateFormFields();
    if (validationError) {
      setErrorMessage(validationError);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    try {
      setSaving(true);

      const putPayload = {
        ...form,
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        department: form.department.trim().toUpperCase(),
        section: form.section.trim().toUpperCase(),
        semester: Number(form.semester),
        subjects: Array.from(selectedSubjects),
        admissionYear: Number(form.admissionYear),
        phone: form.phone.trim(),
        address: form.address.trim(),
      };

      const res = await api.put(`/api/admin/student/${studentId}`, putPayload);
      const responseData = res.data || res;
      const updatedData = responseData?.student;

      if (responseData?.success || res.success || updatedData) {
        setSuccessMessage("Student metrics modified successfully.");
        setIsEditing(false);
        
        if (updatedData) {
          setStudent(updatedData);
          syncFormState(updatedData);
        } else {
          fetchInitialData();
        }
      }
    } catch (err) {
      console.error("API ROUTE ERROR:", err);
      setErrorMessage(err.response?.data?.message || "Internal network error mapping server payloads.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
          <p className="mt-4 text-sm font-semibold text-slate-500">Loading student files...</p>
        </div>
      </div>
    );
  }

  const mergedSubjects = builderSemesterData?.subjects || [];

  return (
    <div className="min-h-screen bg-slate-50 pb-12">
      <div className="mx-auto max-w-7xl p-4 md:p-6">
        
        {/* Top Operational Header Navigation bar */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-5">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/admin/students")}
              className="group flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:bg-slate-50"
              title="Return to Student Registry"
              type="button"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 transition-transform group-hover:-translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-slate-900 md:text-3xl">{form.name || "Student Profile"}</h1>
                <span className="rounded-full bg-slate-200 px-3 py-1 text-xs font-semibold text-slate-700">
                  {form.rollNo || "No Roll"}
                </span>
              </div>
            </div>
          </div>

          {/* Action Trigger Handlers */}
          <div className="flex items-center gap-2">
            {!isEditing ? (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-blue-700 active:bg-blue-800 transition"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Update Profile
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => { setIsEditing(false); setErrorMessage(""); fetchInitialData(); }}
                  className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={saving}
                  onClick={handleUpdateSubmit}
                  className="rounded-xl bg-green-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-green-700 active:bg-green-800 transition"
                >
                  {saving ? "Saving Mappings..." : "Commit Update"}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Global Operational Message Feed Drawers */}
        {errorMessage && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 font-bold tracking-wide animate-pulse">
            ⚠️ {errorMessage}
          </div>
        )}
        {successMessage && (
          <div className="mb-6 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700 font-medium">
            {successMessage}
          </div>
        )}

        {/* Split Grid Layout Panels Shell */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          
          {/* LEFT COLUMN: Profiling metadata */}
          <div className="lg:col-span-5 space-y-6">
            
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm text-center relative overflow-hidden">
              <div className="absolute top-0 inset-x-0 h-20 bg-gradient-to-r from-blue-500 to-indigo-600 opacity-80" />
              <div className="relative pt-6">
                <div className="mx-auto relative h-24 w-24 rounded-full border-4 border-white bg-slate-100 shadow-md overflow-hidden group">
                  <img
                    src={previewUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(form.name || "Student")}&background=random`}
                    alt="Active Student profile preview thumbnail"
                    className="h-full w-full object-cover"
                  />
                  <label className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-[10px] text-white font-bold opacity-0 group-hover:opacity-100 cursor-pointer transition duration-200">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mb-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    </svg>
                    {uploadingImage ? "Syncing..." : "Change Image"}
                    <input type="file" accept="image/*" onChange={handleImageFileChange} disabled={uploadingImage} className="hidden" />
                  </label>
                </div>

                <h3 className="mt-3 text-xl font-bold text-slate-900">{form.name || "N/A"}</h3>
                <p className="text-sm font-medium text-slate-500">{form.email || "No connected registry address info"}</p>
                <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700 ring-1 ring-blue-600/10">
                  Account Base Access Tier: Student
                </div>
              </div>
            </div>

            {/* Account Credentials */}
            <SectionCard title="Account Credentials">
              <div className="space-y-4">
                <Field label="Display Name Account String">
                  <Input
                    type="text"
                    value={form.name}
                    onChange={(e) => handleFieldChange("name", e.target.value)}
                    disabled={!isEditing || saving}
                    placeholder="Staged name description details"
                  />
                </Field>

                <Field label="Platform Primary E-mail">
                  <Input
                    type="email"
                    value={form.email}
                    onChange={(e) => handleFieldChange("email", e.target.value)}
                    disabled={!isEditing || saving}
                    placeholder="e.g., student@college.edu"
                  />
                </Field>

                <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 space-y-2.5 text-xs text-slate-600 font-medium">
                  <div className="flex justify-between">
                    <span>Platform Assigned Login ID:</span>
                    <span className="font-mono font-bold text-slate-900">{student?.userID?.loginID || student?.loginID || "N/A"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Database Synchronize Update:</span>
                    <span className="text-slate-500">{student?.updatedAt ? new Date(student.updatedAt).toLocaleString() : "Unknown"}</span>
                  </div>
                </div>
              </div>
            </SectionCard>
          </div>

          {/* RIGHT COLUMN: Academic mapping */}
          <div className="lg:col-span-7 space-y-6">
            
            <SectionCard title="Academic Mapping Framework">
              <div className="mb-5 bg-slate-50 p-3 rounded-xl border border-slate-100">
                <label className="mb-2 block text-xs font-bold text-slate-500 uppercase tracking-wider">
                  {isEditing ? "Select Active Course Term Semester Tab" : "Current Track Semester"}
                </label>
                
                {isEditing ? (
                  <div className="flex flex-wrap gap-1.5">
                    {semesters.map((sem) => {
                      const isActiveTab = Number(builderSemester) === Number(sem);
                      return (
                        <button
                          key={sem}
                          type="button"
                          onClick={() => setBuilderSemester(sem)}
                          className={
                            "rounded-lg px-3.5 py-2 text-xs font-bold transition-all " +
                            (isActiveTab
                              ? "bg-blue-600 text-white shadow-sm"
                              : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-100")
                          }
                        >
                          Semester {sem}
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="inline-block rounded-lg bg-blue-50 border border-blue-100 px-4 py-2 text-xs font-bold text-blue-800">
                    Semester Plan Matrix: {form.semester || "Unassigned"}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 pt-2">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-500 uppercase tracking-wider">Assigned Department</label>
                  <Input
                    type="text"
                    value={form.department}
                    placeholder="Select an upper tab row parameter"
                    disabled 
                  />
                </div>

                <Field label="Institutional Roll Registry Key">
                  <Input
                    type="text"
                    value={form.rollNo}
                    onChange={(e) => handleFieldChange("rollNo", e.target.value)}
                    disabled={!isEditing || saving}
                    placeholder="e.g., ROLL_KEY_STU"
                  />
                </Field>

                <div className="sm:col-span-2">
                  <Field label="Class Section Assignment Stream">
                    <Input
                      type="text"
                      value={form.section}
                      onChange={(e) => handleFieldChange("section", e.target.value)}
                      disabled={!isEditing || saving}
                      placeholder="e.g., Section A"
                    />
                  </Field>
                </div>
              </div>
            </SectionCard>

            {/* Syllabus Assignment Checklist */}
            <SectionCard 
              title="Curriculum Course Enrollment Units"
              right={
                <span className="rounded-lg bg-blue-50 border border-blue-100 px-2.5 py-1 text-xs font-bold text-blue-700 font-mono">
                  {selectedSubjects.size} course blocks active
                </span>
              }
            >
              {loadingSubjects ? (
                <div className="space-y-2">
                  {[1, 2].map((i) => <div key={i} className="h-12 animate-pulse rounded-lg bg-slate-100" />)}
                </div>
              ) : !builderSemester ? (
                <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center text-xs text-slate-400">
                  Choose a semester parameter above to display courses.
                </div>
              ) : mergedSubjects.length === 0 ? (
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-6 text-center text-xs text-slate-400">
                  No matching database curriculums loaded for Semester {builderSemester}.
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 max-h-[260px] overflow-y-auto pr-1">
                  {mergedSubjects.map((subjectName) => {
                    const isChecked = selectedSubjects.has(normalizeSubjectName(subjectName));
                    return (
                      <Checkbox
                        key={subjectName}
                        checked={isChecked}
                        onChange={() => toggleSubjectChecked(subjectName)}
                        disabled={!isEditing || saving}
                        label={subjectName}
                        sublabel={builderSemesterData?.department ? `• ${builderSemesterData.department}` : undefined}
                      />
                    );
                  })}
                </div>
              )}
            </SectionCard>

            {/* Permanent Registry Metadata */}
            <SectionCard title="Permanent Registry Metadata">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="Primary Contact Phone">
                  <Input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => handleFieldChange("phone", e.target.value)}
                    disabled={!isEditing || saving}
                    placeholder="10-digit phone number"
                  />
                </Field>

                <Field label="Year of Admission Frame">
                  <Input
                    type="number"
                    value={form.admissionYear}
                    onChange={(e) => handleFieldChange("admissionYear", e.target.value)}
                    disabled={!isEditing || saving}
                    placeholder="e.g., 2026"
                  />
                </Field>

                <Field label="Gender Assignment" optional>
                  <Select
                    value={form.gender}
                    onChange={(e) => handleFieldChange("gender", e.target.value)}
                    disabled={!isEditing || saving}
                  >
                    <option value="">Identity Choice</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </Select>
                </Field>

                <Field label="Blood Group Classification" optional>
                  <Select
                    value={form.bloodGroup}
                    onChange={(e) => handleFieldChange("bloodGroup", e.target.value)}
                    disabled={!isEditing || saving}
                  >
                    <option value="">Unspecified Group Identity</option>
                    {["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"].map((bg) => (
                      <option key={bg} value={bg}>{bg}</option>
                    ))}
                  </Select>
                </Field>

                <div className="sm:col-span-2">
                  <Field label="Date of Birth Map" optional>
                    <Input
                      type="date"
                      value={form.dateOfBirth}
                      onChange={(e) => handleFieldChange("dateOfBirth", e.target.value)}
                      disabled={!isEditing || saving}
                    />
                  </Field>
                </div>

                <div className="sm:col-span-2">
                  <Field label="Permanent Address Registry Description" optional>
                    <textarea
                      rows={2}
                      value={form.address}
                      onChange={(e) => handleFieldChange("address", e.target.value)}
                      disabled={!isEditing || saving}
                      placeholder="Map permanent geometry address descriptors..."
                      className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-50 disabled:opacity-70 transition-all resize-none"
                    />
                  </Field>
                </div>
              </div>
            </SectionCard>

          </div>
        </div>

      </div>
    </div>
  );
}