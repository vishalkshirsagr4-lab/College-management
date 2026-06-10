import { useEffect, useMemo, useState } from "react";
import api from "../../utils/api";

function Input({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  required,
  disabled,
  autoComplete,
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-slate-700">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        autoComplete={autoComplete}
        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:opacity-60"
      />
    </div>
  );
}

function TextArea({
  label,
  value,
  onChange,
  placeholder,
  required,
  disabled,
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-slate-700">
        {label}
      </label>
      <textarea
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        className="min-h-[90px] w-full resize-y rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:opacity-60"
      />
    </div>
  );
}

function PrimaryButton({ children, ...props }) {
  return (
    <button
      {...props}
      className={`rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60 ${
        props.className || ""
      }`}
    >
      {children}
    </button>
  );
}

function SecondaryButton({ children, ...props }) {
  return (
    <button
      {...props}
      className={`rounded-lg bg-slate-700 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60 ${
        props.className || ""
      }`}
    >
      {children}
    </button>
  );
}

function GhostButton({ children, ...props }) {
  return (
    <button
      {...props}
      className={`rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60 ${
        props.className || ""
      }`}
    >
      {children}
    </button>
  );
}

function Card({ children, className = "" }) {
  return (
    <div
      className={`rounded-2xl border border-slate-200 bg-white shadow-sm ${
        className || ""
      }`}
    >
      {children}
    </div>
  );
}

function ProfileThumb({ src, name }) {
  return (
    <img
      src={src || "/default-avatar.png"}
      alt={name || ""}
      className="h-11 w-11 rounded-full object-cover bg-slate-100"
      onError={(e) => {
        e.currentTarget.src = "/default-avatar.png";
      }}
    />
  );
}

function SemesterCheckboxGrid({
  semester,
  subjects,
  selectedNames,
  onToggle,
  showCounts,
  rightMeta,
}) {
  const selectedSet = selectedNames;

  return (
    <div className="min-w-[320px] flex-1 rounded-xl border border-slate-200 bg-white p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h3 className="text-base font-semibold text-blue-700">
          Semester {semester}
        </h3>
        <div className="flex items-center gap-2">
          {rightMeta}
          {showCounts ? (
            <span className="rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
              {subjects.length} Total
            </span>
          ) : null}
        </div>
      </div>

      <div className="space-y-2">
        {subjects.length === 0 ? (
          <div className="text-xs text-slate-400">No subjects in this semester</div>
        ) : (
          subjects.map((s) => {
            const checked = selectedSet.has(s.name);
            return (
              <label
                key={s._id}
                className={`flex items-start gap-3 rounded-lg border p-3 transition-colors ${
                  checked
                    ? "border-blue-200 bg-blue-50"
                    : "border-slate-200 bg-white hover:bg-slate-50"
                }`}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => onToggle(s.name)}
                  className="mt-1 h-4 w-4 accent-blue-600"
                />
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold text-slate-900">
                    {s.name}
                  </div>
                  <div className="mt-0.5 truncate text-xs text-slate-500">
                    {s.code} • {s.department}
                  </div>
                </div>
              </label>
            );
          })
        )}
      </div>
    </div>
  );
}

function toTeachingAssignments(semesterSubjectMap) {
  const assignments = [];
  for (const [semester, subjects] of semesterSubjectMap.entries()) {
    if (!Array.isArray(subjects) || subjects.length === 0) continue;
    assignments.push({ semester: Number(semester), subjects });
  }
  return assignments;
}

export default function FacultyManagement() {
  const [subjects, setSubjects] = useState([]);
  const [faculties, setFaculties] = useState([]);

  const [loadingSubjects, setLoadingSubjects] = useState(true);
  const [loadingFaculties, setLoadingFaculties] = useState(true);
  const [globalError, setGlobalError] = useState("");

  const [search, setSearch] = useState("");

  // ---- Create Faculty Form state ----
  const [createSubmitting, setCreateSubmitting] = useState(false);
  const [createError, setCreateError] = useState("");

  const [createForm, setCreateForm] = useState({
    name: "",
    email: "",
    loginID: "",
    password: "",
    department: "",
    designation: "",
    phone: "",
    profileImageFile: null,
  });

  // Map semester -> Set(subjectName)
  const [createSelectedBySemester, setCreateSelectedBySemester] = useState(new Map());

  const groupedSubjectsBySemester = useMemo(() => {
    const map = new Map();
    for (const s of subjects) {
      const sem = Number(s?.semester);
      if (!Number.isFinite(sem)) continue;
      if (!map.has(sem)) map.set(sem, []);
      map.get(sem).push(s);
    }
    const semesters = [...map.keys()].sort((a, b) => a - b);
    return semesters.map((sem) => ({ semester: sem, items: map.get(sem) || [] }));
  }, [subjects]);

  const createSemesterCounts = useMemo(() => {
    const out = new Map();
    for (const { semester } of groupedSubjectsBySemester) {
      const selected = createSelectedBySemester.get(semester);
      out.set(semester, selected ? selected.size : 0);
    }
    return out;
  }, [createSelectedBySemester, groupedSubjectsBySemester]);

  // ---- Faculty Details / Assignment Editing state ----
  const [selectedFacultyId, setSelectedFacultyId] = useState(null);
  const selectedFaculty = useMemo(() => {
    return faculties.find((f) => f?._id === selectedFacultyId) || null;
  }, [faculties, selectedFacultyId]);

  const [semesterEditSelections, setSemesterEditSelections] = useState(new Map());
  const [saveLoadingBySemester, setSaveLoadingBySemester] = useState(new Map());
  const [deleteLoadingBySemester, setDeleteLoadingBySemester] = useState(new Map());

  const [detailsError, setDetailsError] = useState("");

  const normalizedSearch = search.trim().toLowerCase();
  const filteredFaculties = useMemo(() => {
    if (!normalizedSearch) return faculties;
    return faculties.filter((f) => {
      const name = f?.userID?.name?.toLowerCase() || "";
      const email = f?.userID?.email?.toLowerCase() || "";
      const loginID = f?.userID?.loginID?.toLowerCase() || "";
      const phone = String(f?.phone || "").toLowerCase();
      return (
        name.includes(normalizedSearch) ||
        email.includes(normalizedSearch) ||
        loginID.includes(normalizedSearch) ||
        phone.includes(normalizedSearch) ||
        String(f?.department || "").toLowerCase().includes(normalizedSearch) ||
        String(f?.designation || "").toLowerCase().includes(normalizedSearch)
      );
    });
  }, [faculties, normalizedSearch]);

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        setLoadingSubjects(true);
        setGlobalError("");
        const res = await api.get("/api/admin/subjects");
        console.log(res.data?.subjects);
        setSubjects(res.data?.subjects || []);
      } catch (e) {
        setGlobalError(
          e?.response?.data?.message ||
            "Failed to fetch subjects. Please refresh and try again."
        );
        setSubjects([]);
      } finally {
        setLoadingSubjects(false);
      }
    };

    const fetchFaculties = async () => {
      try {
        setLoadingFaculties(true);
        setGlobalError("");
        const res = await api.get("/api/admin/faculty");
        // API might return { faculty } or { faculties } depending on backend.
        setFaculties(
          res.data?.faculty || res.data?.faculties || res.data?.data || []
        );
      } catch (e) {
        setGlobalError(
          e?.response?.data?.message ||
            "Failed to fetch faculties. Please refresh and try again."
        );
        setFaculties([]);
      } finally {
        setLoadingFaculties(false);
      }
    };

    fetchSubjects();
    fetchFaculties();
  }, []);

  // initialize details selections when selecting a faculty
  useEffect(() => {
    if (!selectedFaculty) {
      setSemesterEditSelections(new Map());
      return;
    }

    const map = new Map();
    const teachingAssignments = Array.isArray(selectedFaculty.teachingAssignments)
      ? selectedFaculty.teachingAssignments
      : [];

    for (const ta of teachingAssignments) {
      const sem = Number(ta?.semester);
      if (!Number.isFinite(sem)) continue;
      const subj = Array.isArray(ta?.subjects) ? ta.subjects : [];
      map.set(sem, new Set(subj));
    }

    setSemesterEditSelections(map);
    setDetailsError("");
  }, [selectedFaculty]);

  const toggleCreateSubject = (semester, subjectName) => {
    setCreateSelectedBySemester((prev) => {
      const next = new Map(prev);
      const cur = next.get(semester) || new Set();
      if (cur.has(subjectName)) cur.delete(subjectName);
      else cur.add(subjectName);
      if (cur.size === 0) next.delete(semester);
      else next.set(semester, cur);
      return next;
    });
  };

  const toggleEditSubject = (semester, subjectName) => {
    setSemesterEditSelections((prev) => {
      const next = new Map(prev);
      const cur = next.get(semester) ? new Set(next.get(semester)) : new Set();
      if (cur.has(subjectName)) cur.delete(subjectName);
      else cur.add(subjectName);
      if (cur.size === 0) next.delete(semester);
      else next.set(semester, cur);
      return next;
    });
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setCreateError("");

    if (!createForm.name.trim()) return setCreateError("Name is required");
    if (!createForm.email.trim()) return setCreateError("Email is required");
    if (!createForm.loginID.trim()) return setCreateError("Login ID is required");
    if (!createForm.password.trim()) return setCreateError("Password is required");
    if (!createForm.department.trim()) return setCreateError("Department is required");
    if (!createForm.designation.trim()) return setCreateError("Designation is required");
    if (!createForm.phone.trim()) return setCreateError("Phone is required");

    const semesterSubjectMap = new Map();
    for (const [sem, setNames] of createSelectedBySemester.entries()) {
      semesterSubjectMap.set(sem, Array.from(setNames));
    }

    const teachingAssignments = toTeachingAssignments(semesterSubjectMap);

    try {
      setCreateSubmitting(true);
      setCreateError("");

      if (createForm.profileImageFile) {
        const fd = new FormData();
        fd.append("profileImage", createForm.profileImageFile);

        fd.append("name", createForm.name.trim());
        fd.append("email", createForm.email.trim());
        fd.append("loginID", createForm.loginID.trim());
        fd.append("password", createForm.password);
        fd.append("department", createForm.department.trim());
        fd.append("designation", createForm.designation.trim());
        fd.append("phone", createForm.phone.trim());

        fd.append("teachingAssignments", JSON.stringify(teachingAssignments));

        await api.post("/api/admin/faculty", fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        const payload = {
          name: createForm.name.trim(),
          email: createForm.email.trim(),
          loginID: createForm.loginID.trim(),
          password: createForm.password,
          department: createForm.department.trim(),
          designation: createForm.designation.trim(),
          phone: createForm.phone.trim(),
          teachingAssignments,
        };

        await api.post("/api/admin/faculty", payload);
      }

      // refresh
      const res = await api.get("/api/admin/faculty");
      setFaculties(res.data?.faculty || res.data?.faculties || res.data?.data || []);

      // reset
      setCreateForm({
        name: "",
        email: "",
        loginID: "",
        password: "",
        department: "",
        designation: "",
        phone: "",
        profileImageFile: null,
      });
      setCreateSelectedBySemester(new Map());
      setCreateError("");
    } catch (e) {
      setCreateError(e?.response?.data?.message || "Failed to create faculty.");
    } finally {
      setCreateSubmitting(false);
    }
  };

  const saveSemester = async (semester) => {
    if (!selectedFaculty) return;
    const semesterNum = Number(semester);
    const selectedSet = semesterEditSelections.get(semesterNum);
    const subjectsArr = selectedSet ? Array.from(selectedSet) : [];

    try {
      setDetailsError("");
      setSaveLoadingBySemester((prev) => new Map(prev).set(semesterNum, true));

      await api.put("/api/admin/faculty/semester", {
        facultyId: selectedFaculty._id,
        semester: semesterNum,
        subjects: subjectsArr,
      });

      // refresh faculty list
      const res = await api.get("/api/admin/faculty");
      setFaculties(res.data?.faculty || res.data?.faculties || res.data?.data || []);
    } catch (e) {
      setDetailsError(e?.response?.data?.message || "Failed to save semester assignment.");
    } finally {
      setSaveLoadingBySemester((prev) => {
        const next = new Map(prev);
        next.delete(semesterNum);
        return next;
      });
    }
  };

  const deleteSemester = async (semester) => {
    if (!selectedFaculty) return;
    const semesterNum = Number(semester);
    try {
      setDetailsError("");
      setDeleteLoadingBySemester((prev) => new Map(prev).set(semesterNum, true));

      await api.delete("/api/admin/faculty/semester", {
        data: {
          facultyId: selectedFaculty._id,
          semester: semesterNum,
        },
      });

      // refresh faculty list
      const res = await api.get("/api/admin/faculty");
      setFaculties(res.data?.faculty || res.data?.faculties || res.data?.data || []);

      // also clear local selection for immediate UI consistency
      setSemesterEditSelections((prev) => {
        const next = new Map(prev);
        next.delete(semesterNum);
        return next;
      });
    } catch (e) {
      setDetailsError(e?.response?.data?.message || "Failed to delete semester assignment.");
    } finally {
      setDeleteLoadingBySemester((prev) => {
        const next = new Map(prev);
        next.delete(semesterNum);
        return next;
      });
    }
  };

  const selectedFacultyHasAssignments = useMemo(() => {
    if (!selectedFaculty) return false;
    const t = Array.isArray(selectedFaculty.teachingAssignments)
      ? selectedFaculty.teachingAssignments
      : [];
    return t.length > 0;
  }, [selectedFaculty]);

  const createSelectedTotal = useMemo(() => {
    let total = 0;
    for (const setNames of createSelectedBySemester.values()) total += setNames.size;
    return total;
  }, [createSelectedBySemester]);

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-6">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Faculty Management</h1>
          <p className="mt-1 text-sm text-slate-500">
            Create faculty, assign teaching subjects semester-wise, and manage assignments.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-700">
            {faculties.length} Faculty
          </span>
          <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-700">
            {subjects.length} Subjects
          </span>
        </div>
      </div>

      {globalError ? (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {globalError}
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        {/* Left: Create Faculty */}
        <div className="lg:col-span-5">
          <Card>
            <div className="border-b border-slate-200 p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Create Faculty</h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Fill details and select subjects (checkboxes) for each semester.
                  </p>
                </div>
                <div className="hidden sm:block">
                  <div className="rounded-xl bg-blue-50 px-3 py-2 text-center">
                    <div className="text-xs font-semibold text-blue-700">Selected</div>
                    <div className="text-lg font-bold text-blue-800">{createSelectedTotal}</div>
                  </div>
                </div>
              </div>
            </div>

            <form onSubmit={handleCreateSubmit} className="p-5">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Input
                  label="Name"
                  value={createForm.name}
                  onChange={(e) =>
                    setCreateForm((p) => ({ ...p, name: e.target.value }))
                  }
                  placeholder="Enter faculty name"
                  required
                  autoComplete="off"
                />
                <Input
                  label="Email"
                  type="email"
                  value={createForm.email}
                  onChange={(e) =>
                    setCreateForm((p) => ({ ...p, email: e.target.value }))
                  }
                  placeholder="Enter email"
                  required
                  autoComplete="off"
                />

                <Input
                  label="Login ID"
                  value={createForm.loginID}
                  onChange={(e) =>
                    setCreateForm((p) => ({ ...p, loginID: e.target.value }))
                  }
                  placeholder="e.g., FAC001"
                  required
                  autoComplete="off"
                />
                <Input
                  label="Password"
                  type="password"
                  value={createForm.password}
                  onChange={(e) =>
                    setCreateForm((p) => ({ ...p, password: e.target.value }))
                  }
                  placeholder="Set password"
                  required
                  autoComplete="new-password"
                />

                <Input
                  label="Department"
                  value={createForm.department}
                  onChange={(e) =>
                    setCreateForm((p) => ({ ...p, department: e.target.value }))
                  }
                  placeholder="e.g., BCA"
                  required
                  autoComplete="off"
                />
                <Input
                  label="Designation"
                  value={createForm.designation}
                  onChange={(e) =>
                    setCreateForm((p) => ({ ...p, designation: e.target.value }))
                  }
                  placeholder="e.g., Assistant Professor"
                  required
                  autoComplete="off"
                />

                <Input
                  label="Phone"
                  value={createForm.phone}
                  onChange={(e) =>
                    setCreateForm((p) => ({ ...p, phone: e.target.value }))
                  }
                  placeholder="9999999999"
                  required
                  autoComplete="off"
                />

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Profile Image Upload
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files && e.target.files[0];
                      setCreateForm((p) => ({ ...p, profileImageFile: file || null }));
                    }}
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                  <div className="mt-2 text-xs text-slate-500">
                    Optional. Upload is sent as <span className="font-mono">profileImage</span>.
                  </div>
                </div>
              </div>

              <div className="mt-5">
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Teaching Assignments</h3>
                    <p className="mt-1 text-xs text-slate-500">
                      Select multiple subjects per semester using checkboxes.
                    </p>
                  </div>

                  <div className="hidden sm:block">
                    <div className="text-xs font-medium text-slate-500">Selected per semester</div>
                    <div className="mt-1 flex flex-wrap gap-2">
                      {groupedSubjectsBySemester.map(({ semester }) => {
                        const count = createSemesterCounts.get(semester) || 0;
                        return (
                          <span
                            key={semester}
                            className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                              count > 0
                                ? "border-blue-200 bg-blue-50 text-blue-700"
                                : "border-slate-200 bg-white text-slate-500"
                            }`}
                          >
                            Sem {semester}: {count}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* horizontal semesters */}
                <div className="rounded-xl border border-slate-200 bg-white p-3">
                  {loadingSubjects ? (
                    <div className="flex gap-4 overflow-x-auto pb-2">
                      {[1, 2, 3].map((i) => (
                        <div
                          key={i}
                          className="min-w-[320px] flex-1 rounded-xl border border-slate-200 bg-white p-4"
                        >
                          <div className="h-6 w-32 animate-pulse rounded bg-slate-200" />
                          <div className="mt-3 space-y-2">
                            {[1, 2, 3].map((j) => (
                              <div
                                key={j}
                                className="h-12 animate-pulse rounded-lg bg-slate-200"
                              />
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : groupedSubjectsBySemester.length === 0 ? (
                    <div className="p-6 text-center text-sm text-slate-500">
                      No subjects found. Create subjects first.
                    </div>
                  ) : (
                    <div className="flex gap-4 overflow-x-auto pb-2">
                      {groupedSubjectsBySemester.map(({ semester, items }) => {
                        const selectedSet = createSelectedBySemester.get(semester) || new Set();
                        return (
                          <SemesterCheckboxGrid
                            key={semester}
                            semester={semester}
                            subjects={items}
                            selectedNames={selectedSet}
                            onToggle={(subjectName) =>
                              toggleCreateSubject(semester, subjectName)
                            }
                            showCounts={false}
                            rightMeta={
                              <span className="rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
                                {selectedSet.size} Selected
                              </span>
                            }
                          />
                        );
                      })}
                    </div>
                  )}
                </div>

                {createError ? (
                  <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {createError}
                  </div>
                ) : null}
              </div>

              <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="text-xs text-slate-500">
                  Tip: You can select subjects semester-wise before saving.
                </div>
                <div className="flex gap-2">
                  <GhostButton
                    type="button"
                    onClick={() => {
                      setCreateForm({
                        name: "",
                        email: "",
                        loginID: "",
                        password: "",
                        department: "",
                        designation: "",
                        phone: "",
                        profileImageFile: null,
                      });
                      setCreateSelectedBySemester(new Map());
                      setCreateError("");
                    }}
                    disabled={createSubmitting}
                  >
                    Reset
                  </GhostButton>
                  <PrimaryButton type="submit" disabled={createSubmitting}>
                    {createSubmitting ? "Creating..." : "Create Faculty"}
                  </PrimaryButton>
                </div>
              </div>
            </form>
          </Card>
        </div>

        {/* Middle: Faculty List */}
        <div className="lg:col-span-4">
          <Card>
            <div className="border-b border-slate-200 p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Faculty List</h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Search and select a faculty to manage teaching assignments.
                  </p>
                </div>
              </div>

              <div className="mt-4">
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search faculty by name, email, loginID, phone..."
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>
            </div>

            <div className="p-5">
              {loadingFaculties ? (
                <div className="space-y-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="h-20 animate-pulse rounded-xl border border-slate-200 bg-white"
                    />
                  ))}
                </div>
              ) : filteredFaculties.length === 0 ? (
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-8 text-center">
                  <div className="text-sm font-semibold text-slate-700">No faculty found</div>
                  <div className="mt-1 text-xs text-slate-500">Try a different search.</div>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredFaculties.map((f) => {
                    const isActive = f?._id === selectedFacultyId;
                    return (
                      <button
                        type="button"
                        key={f?._id}
                        onClick={() => setSelectedFacultyId(f?._id)}
                        className={`w-full rounded-2xl border p-4 text-left transition-colors ${
                          isActive
                            ? "border-blue-200 bg-blue-50"
                            : "border-slate-200 bg-white hover:bg-slate-50"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <ProfileThumb
                            src={f?.profileImage}
                            name={f?.userID?.name}
                          />
                          <div className="min-w-0 flex-1">
                            <div className="truncate text-sm font-bold text-slate-900">
                              {f?.userID?.name || "—"}
                            </div>
                            <div className="mt-0.5 truncate text-xs text-slate-500">
                              {f?.userID?.email || ""}
                            </div>
                            <div className="mt-2 flex flex-wrap gap-2">
                              <span className="rounded-full border border-slate-200 bg-white px-2 py-1 text-[11px] font-semibold text-slate-700">
                                {f?.department || ""}
                              </span>
                              <span className="rounded-full border border-slate-200 bg-white px-2 py-1 text-[11px] font-semibold text-slate-700">
                                {f?.designation || ""}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="mt-3 text-xs text-slate-600">
                          Phone: <span className="font-semibold">{f?.phone || "—"}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Right: Faculty Details */}
        <div className="lg:col-span-3">
          <Card>
            <div className="border-b border-slate-200 p-5">
              <h2 className="text-lg font-bold text-slate-900">Faculty Details</h2>
              <p className="mt-1 text-sm text-slate-500">
                Edit semester subject assignments with pre-selected checkboxes.
              </p>
            </div>

            <div className="p-5">
              {!selectedFaculty ? (
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-8 text-center">
                  <div className="text-sm font-semibold text-slate-700">
                    Select a faculty
                  </div>
                  <div className="mt-1 text-xs text-slate-500">
                    Choose a faculty from the list to view and edit assignments.
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-3">
                    <ProfileThumb
                      src={selectedFaculty?.profileImage}
                      name={selectedFaculty?.userID?.name}
                    />
                    <div className="min-w-0">
                      <div className="truncate text-sm font-bold text-slate-900">
                        {selectedFaculty?.userID?.name || "—"}
                      </div>
                      <div className="truncate text-xs text-slate-500">
                        {selectedFaculty?.userID?.email || ""}
                      </div>
                      <div className="mt-1 text-xs text-slate-600">
                        {selectedFaculty?.department} • {selectedFaculty?.designation}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4">
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-semibold text-slate-800">Teaching Assignments</div>
                      <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700">
                        {selectedFaculty?.teachingAssignments?.length || 0} Semesters
                      </span>
                    </div>

                    {!selectedFacultyHasAssignments ? (
                      <div className="mt-3 text-xs text-slate-500">
                        No semester assignments yet. Select subjects and save per semester.
                      </div>
                    ) : null}
                  </div>

                  {detailsError ? (
                    <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                      {detailsError}
                    </div>
                  ) : null}

                  <div className="mt-4">
                    {loadingSubjects ? null : groupedSubjectsBySemester.length === 0 ? (
                      <div className="rounded-xl border border-slate-200 bg-slate-50 p-6 text-center text-xs text-slate-500">
                        Subjects are required to assign teaching assignments.
                      </div>
                    ) : (
                      <div className="flex gap-4 overflow-x-auto pb-2">
                        {groupedSubjectsBySemester.map(({ semester, items }) => {
                          const selectedSet = semesterEditSelections.get(semester) || new Set();
                          const saveLoading = saveLoadingBySemester.get(semester);
                          const deleteLoading = deleteLoadingBySemester.get(semester);

                          return (
                            <div
                              key={semester}
                              className="min-w-[320px] flex-1 rounded-xl border border-slate-200 bg-white p-4"
                            >
                              <div className="mb-3 flex items-center justify-between gap-3">
                                <h3 className="text-base font-semibold text-blue-700">
                                  Semester {semester}
                                </h3>
                                <span className="rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
                                  {selectedSet.size} Selected
                                </span>
                              </div>

                              <div className="space-y-2">
                                {items.map((s) => {
                                  const checked = selectedSet.has(s.name);
                                  return (
                                    <label
                                      key={s._id}
                                      className={`flex items-start gap-3 rounded-lg border p-3 transition-colors ${
                                        checked
                                          ? "border-blue-200 bg-blue-50"
                                          : "border-slate-200 bg-white hover:bg-slate-50"
                                      }`}
                                    >
                                      <input
                                        type="checkbox"
                                        checked={checked}
                                        onChange={() => toggleEditSubject(semester, s.name)}
                                        className="mt-1 h-4 w-4 accent-blue-600"
                                      />
                                      <div className="min-w-0">
                                        <div className="truncate text-sm font-semibold text-slate-900">
                                          {s.name}
                                        </div>
                                        <div className="mt-0.5 truncate text-xs text-slate-500">
                                          {s.code} • {s.department}
                                        </div>
                                      </div>
                                    </label>
                                  );
                                })}
                              </div>

                              <div className="mt-4 flex gap-2">
                                <button
                                  type="button"
                                  onClick={() => saveSemester(semester)}
                                  disabled={saveLoading || deleteLoading}
                                  className="flex-1 rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
                                >
                                  {saveLoading ? "Saving..." : "Save"}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => deleteSemester(semester)}
                                  disabled={saveLoading || deleteLoading}
                                  className="flex-1 rounded-lg bg-red-600 px-3 py-2 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-60"
                                >
                                  {deleteLoading ? "Deleting..." : "Delete"}
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* Footer spacing */}
      <div className="mt-6" />
    </div>
  );
}

