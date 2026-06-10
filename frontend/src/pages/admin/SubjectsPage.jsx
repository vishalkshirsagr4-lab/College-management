import { useEffect, useMemo, useState } from "react";
import api from "../../utils/api";

const chipBase =
  "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium border bg-white text-slate-700";

function Chip({ label }) {
  if (!label) return null;
  return <span className={chipBase}>{label}</span>;
}

function ChipList({ items }) {
  const safeItems = Array.isArray(items) ? items.filter(Boolean) : [];
  if (safeItems.length === 0) {
    return <span className="text-xs text-slate-400">-</span>;
  }
  return (
    <div className="flex flex-wrap gap-2">
      {safeItems.map((it, idx) => (
        <Chip key={`${it}-${idx}`} label={it} />
      ))}
    </div>
  );
}

function SkeletonChip({ w = "w-24" }) {
  return (
    <span
      className={`inline-flex h-7 ${w} animate-pulse rounded-full bg-slate-200`}
    />
  );
}

function SubjectsPage() {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [search, setSearch] = useState("");
  const [semesterFilter, setSemesterFilter] = useState("All");

  const initialForm = {
    name: "",
    code: "",
    department: "",
    semester: "",
    corSubjects: [],
    language: [],
    corSubjectDraft: "",
    languageDraft: "",
  };

  const [deleteModal, setDeleteModal] = useState({
  open: false,
  subjectId: null,
  subjectName: "",
});

  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);

  const [globalError, setGlobalError] = useState("");

  const fetchSubjects = async () => {
    try {
      setLoading(true);
      setGlobalError("");
      const res = await api.get("/api/admin/subjects");
      setSubjects(res.data?.subjects || []);
    } catch (error) {
      setGlobalError(
        error?.response?.data?.message ||
          "Failed to fetch subjects. Please try again."
      );
      setSubjects([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubjects();
  }, []);

  const semesters = useMemo(() => {
    const uniq = new Set();
    for (const s of subjects) {
      if (s?.semester !== undefined && s?.semester !== null && s.semester !== "") {
        uniq.add(Number(s.semester));
      }
    }
    return [...uniq].sort((a, b) => a - b);
  }, [subjects]);

  const normalizedSearch = search.trim().toLowerCase();

  const filteredSubjects = useMemo(() => {
    return subjects.filter((subject) => {
      const matchesSearch =
        !normalizedSearch ||
        subject?.name?.toLowerCase().includes(normalizedSearch) ||
        subject?.code?.toLowerCase().includes(normalizedSearch);

      const matchesSemester =
        semesterFilter === "All" ||
        Number(subject.semester) === Number(semesterFilter);

      return matchesSearch && matchesSemester;
    });
  }, [subjects, normalizedSearch, semesterFilter]);

  const groupedBySemester = useMemo(() => {
    const map = new Map();
    for (const s of filteredSubjects) {
      const sem = Number(s.semester);
      if (!map.has(sem)) map.set(sem, []);
      map.get(sem).push(s);
    }
    // ensure deterministic ordering by semester
    const ordered = [...map.keys()].sort((a, b) => a - b);
    return ordered.map((sem) => ({ semester: sem, items: map.get(sem) || [] }));
  }, [filteredSubjects]);

  const resetForm = () => {
    setForm(initialForm);
    setEditingId(null);
  };

  const beginEdit = (subject) => {
    setEditingId(subject._id);
    setForm({
      name: subject.name || "",
      code: subject.code || "",
      department: subject.department || "",
      semester:
        subject.semester !== undefined && subject.semester !== null
          ? String(subject.semester)
          : "",
      corSubjects: Array.isArray(subject.corSubjects) ? subject.corSubjects : [],
      language: Array.isArray(subject.language) ? subject.language : [],
      corSubjectDraft: "",
      languageDraft: "",
    });
    setGlobalError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // NOTE:
  // The previous implementation used a generic addChip/removeChip that accepted
  // arbitrary `key` values (e.g. "corSubjects" or "language").
  // This is risky because a wrong key/draftKey wiring (or a stale closure)
  // can accidentally push language values into corSubjects.
  //
  // To prevent cross-assignment entirely, we use dedicated handlers.
  const addCoreSubject = () => {
    const draft = (form.corSubjectDraft || "").trim();
    if (!draft) return;

    setForm((prev) => {
      const list = Array.isArray(prev.corSubjects) ? prev.corSubjects : [];

      const exists = list.some(
        (x) => String(x).toLowerCase() === draft.toLowerCase()
      );
      if (exists) {
        return { ...prev, corSubjectDraft: "" };
      }

      return {
        ...prev,
        corSubjects: [...list, draft],
        corSubjectDraft: "",
      };
    });
  };

  const removeCoreSubject = (value) => {
    setForm((prev) => {
      const list = Array.isArray(prev.corSubjects) ? prev.corSubjects : [];
      return { ...prev, corSubjects: list.filter((x) => x !== value) };
    });
  };

  const addLanguage = () => {
    const draft = (form.languageDraft || "").trim();
    if (!draft) return;

    setForm((prev) => {
      const list = Array.isArray(prev.language) ? prev.language : [];

      const exists = list.some(
        (x) => String(x).toLowerCase() === draft.toLowerCase()
      );
      if (exists) {
        return { ...prev, languageDraft: "" };
      }

      return {
        ...prev,
        language: [...list, draft],
        languageDraft: "",
      };
    });
  };

  const removeLanguage = (value) => {
    setForm((prev) => {
      const list = Array.isArray(prev.language) ? prev.language : [];
      return { ...prev, language: list.filter((x) => x !== value) };
    });
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    setGlobalError("");

    const payload = {
      name: form.name.trim(),
      code: form.code.trim(),
      department: form.department.trim(),
      semester: Number(form.semester),
      corSubjects: Array.isArray(form.corSubjects) ? form.corSubjects : [],
      language: Array.isArray(form.language) ? form.language : [],
    };

    // Console logs to verify payload correctness right before submit.
    // This helps confirm that language values are NOT being merged into corSubjects.
    console.log("[SubjectsPage] Submitting payload:", {
      name: payload.name,
      code: payload.code,
      department: payload.department,
      semester: payload.semester,
      corSubjects: payload.corSubjects,
      language: payload.language,
    });

    if (!payload.name || !payload.code || !payload.department || !payload.semester) {
      setGlobalError("Please fill all required fields.");
      return;
    }

    try {
      setSubmitting(true);
      if (editingId) {
        await api.put(`/api/admin/subject/${editingId}`, payload);
      } else {
        await api.post("/api/admin/subject", payload);
      }

      resetForm();
      await fetchSubjects();
    } catch (error) {
      setGlobalError(
        error?.response?.data?.message ||
          "Operation failed. Please check your input and try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

const handleDelete = async () => {
  try {
    setSubmitting(true);

    await api.delete(`/api/admin/subject/${deleteModal.subjectId}`);

    setDeleteModal({
      open: false,
      subjectId: null,
      subjectName: "",
    });

    await fetchSubjects();

    if (editingId === deleteModal.subjectId) {
      resetForm();
    }
  } catch (error) {
    setGlobalError(
      error?.response?.data?.message ||
        "Failed to delete subject."
    );
  } finally {
    setSubmitting(false);
  }
};

  const isEmpty = !loading && subjects.length === 0;
  const emptyAfterFilter =
    !loading && !isEmpty && filteredSubjects.length === 0;

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-6">
      <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Subjects Management
          </h1>
          <p className="mt-1 text-slate-500">
            Semester-wise subjects for your College ERP
          </p>
        </div>
      </div>

      {/* Semester Wise Subjects */}
      <section className="mb-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              Semester Wise Subjects
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Grouped by semester. Scroll horizontally on mobile.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="flex-1">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name or code..."
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div className="sm:w-56">
              <select
                value={semesterFilter}
                onChange={(e) => setSemesterFilter(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              >
                <option value="All">All Semesters</option>
                {semesters.map((sem) => (
                  <option key={sem} value={String(sem)}>
                    Semester {sem}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {globalError ? (
          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {globalError}
          </div>
        ) : null}

        {loading ? (
          <div className="mt-5">
            <div className="flex gap-4 overflow-x-auto pb-2">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="min-w-[320px] flex-1 rounded-xl border border-slate-200 bg-white p-4"
                >
                  <div className="mb-3 h-5 w-40 animate-pulse rounded bg-slate-200" />
                  <div className="flex flex-wrap gap-2">
                    <SkeletonChip />
                    <SkeletonChip w="w-20" />
                    <SkeletonChip w="w-28" />
                  </div>
                  <div className="mt-4 space-y-3">
                    <div className="h-10 w-full animate-pulse rounded bg-slate-200" />
                    <div className="h-10 w-full animate-pulse rounded bg-slate-200" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : isEmpty ? (
          <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-10 text-center">
            <div className="text-slate-700 font-semibold">
              No subjects available
            </div>
            <div className="mt-2 text-sm text-slate-500">
              Create your first subject below.
            </div>
          </div>
        ) : emptyAfterFilter ? (
          <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-10 text-center">
            <div className="text-slate-700 font-semibold">
              No subjects match your filters
            </div>
            <div className="mt-2 text-sm text-slate-500">
              Adjust search or semester filter.
            </div>
          </div>
        ) : (
          <div className="mt-5 overflow-x-auto pb-2">
            <div className="flex gap-4">
              {groupedBySemester.map(({ semester, items }) => (
                <div
                  key={semester}
                  className="min-w-[320px] flex-1 rounded-xl border border-slate-200 bg-white p-4"
                >
                  <div className="mb-3 flex items-center justify-between gap-2">
                    <h3 className="text-lg font-semibold text-blue-700">
                      Semester {semester}
                    </h3>
                    <span className="rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
                      {items.length} subject{items.length === 1 ? "" : "s"}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {items.map((s) => (
                      <span
                        key={s._id}
                        className="whitespace-nowrap rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700"
                        title={s.code}
                      >
                        {s.name}
                      </span>
                    ))}
                  </div>

                  <div className="mt-4 space-y-3">
                    {items.slice(0, 3).map((s) => (
                      <div
                        key={s._id}
                        className="rounded-lg border border-slate-200 bg-white p-3"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="text-sm font-semibold text-slate-900">
                              {s.name}
                            </div>
                            <div className="mt-0.5 text-xs text-slate-500">
                              {s.code} • {s.department}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => beginEdit(s)}
                              className="rounded-lg bg-yellow-500 px-3 py-1 text-xs font-medium text-white hover:bg-yellow-600 disabled:opacity-60"
                              disabled={submitting}
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                  setDeleteModal({
                                    open: true,
                                    subjectId: s._id,
                                    subjectName: s.name,
                                  })
                                }
                              className="rounded-lg bg-red-500 px-3 py-1 text-xs font-medium text-white hover:bg-red-600 disabled:opacity-60"
                              disabled={submitting}
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                        <div className="mt-2">
                          <div className="text-xs font-medium text-slate-700">
                            Core Subjects
                          </div>
                          <div className="mt-1">
                            <ChipList items={s.corSubjects} />
                          </div>
                        </div>
                        <div className="mt-2">
                          <div className="text-xs font-medium text-slate-700">
                            Languages
                          </div>
                          <div className="mt-1">
                            <ChipList items={s.language} />
                          </div>
                        </div>
                      </div>
                    ))}

                    {items.length > 3 ? (
                      <div className="text-center text-xs text-slate-500">
                        +{items.length - 3} more subject
                        {items.length - 3 === 1 ? "" : "s"}
                      </div>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Create / Update Form */}
      <section className="mb-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              {editingId ? "Edit Subject" : "Create Subject"}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Add core subjects and languages.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {/* Subject Name */}
          <div className="md:col-span-1">
            <label className="mb-2 block text-sm font-medium text-slate-700">
               Name
            </label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              required
            />
          </div>

          {/* Subject Code */}
          <div className="md:col-span-1">
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Subject Code
            </label>
            <input
              type="text"
              name="code"
              value={form.code}
              onChange={(e) => setForm((p) => ({ ...p, code: e.target.value }))}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              required
            />
          </div>

          {/* Department */}
          <div className="md:col-span-1">
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Department
            </label>
            <input
              type="text"
              name="department"
              value={form.department}
              onChange={(e) => setForm((p) => ({ ...p, department: e.target.value }))}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              required
            />
          </div>

          {/* Semester */}
          <div className="md:col-span-1">
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Semester
            </label>
            <input
              type="number"
              min={1}
              name="semester"
              value={form.semester}
              onChange={(e) => setForm((p) => ({ ...p, semester: e.target.value }))}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              required
            />
          </div>

          {/* Core Subjects dynamic */}
          <div className="lg:col-span-1 md:col-span-2">
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Core Subjects
            </label>
            <div className="flex flex-col gap-3">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={form.corSubjectDraft}
                  onChange={(e) => setForm((p) => ({ ...p, corSubjectDraft: e.target.value }))}
                  placeholder="Add core (e.g., Theory)"
                  className="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addCoreSubject();
                    }
                  }}
                />
                <button
                  type="button"
                  className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
                  onClick={addCoreSubject}
                  disabled={submitting}
                >

                  Add
                </button>
              </div>

              <div className="min-h-[38px]">
                {form.corSubjects.length === 0 ? (
                  <div className="text-xs text-slate-400">No core subjects added.</div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {form.corSubjects.map((item) => (
                      <span
                        key={item}
                        className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700"
                      >
                        {item}
                        <button
                          type="button"
                          onClick={() => removeCoreSubject(item)}
                          className="rounded-full bg-white/70 px-2 py-0.5 text-[10px] font-bold text-slate-600 hover:bg-white"
                          aria-label={`Remove ${item}`}
                          disabled={submitting}
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Languages dynamic */}
          <div className="lg:col-span-1 md:col-span-2">
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Languages
            </label>
            <div className="flex flex-col gap-3">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={form.languageDraft}
                  onChange={(e) => setForm((p) => ({ ...p, languageDraft: e.target.value }))}
                  placeholder="Add language (e.g., English)"
                  className="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addLanguage();
                    }
                  }}
                />
                <button
                  type="button"
                  className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
                  onClick={addLanguage}
                  disabled={submitting}
                >
                  Add
                </button>
              </div>

              <div className="min-h-[38px]">
                {form.language.length === 0 ? (
                  <div className="text-xs text-slate-400">No languages added.</div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {form.language.map((item) => (
                      <span
                        key={item}
                        className="inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700"
                      >
                        {item}
                        <button
                          type="button"
                          onClick={() => removeLanguage(item)}
                          className="rounded-full bg-white/70 px-2 py-0.5 text-[10px] font-bold text-slate-600 hover:bg-white"
                          aria-label={`Remove ${item}`}
                          disabled={submitting}
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-2 lg:col-span-3 md:col-span-2">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <button
                type="submit"
                disabled={submitting}
                className="rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
              >
                {submitting ? "Please wait..." : editingId ? "Update Subject" : "Create Subject"}
              </button>

              {editingId ? (
                <button
                  type="button"
                  onClick={resetForm}
                  disabled={submitting}
                  className="rounded-lg bg-slate-600 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-700 disabled:opacity-60"
                >
                  Cancel
                </button>
              ) : null}
            </div>

            <div className="text-xs text-slate-500">
              Payload sent: <span className="font-mono">corSubjects: []</span> and <span className="font-mono">language: []</span>.
            </div>
          </div>
        </form>
      </section>

      {/* Delete Confirmation Modal */}
      {deleteModal.open && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
    <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl overflow-hidden">
      
      {/* Header */}
      <div className="border-b border-slate-200 p-6">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-100">
          <svg
            className="h-7 w-7 text-red-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth="2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v4m0 4h.01M5.07 19H18.93c1.54 0 2.5-1.67 1.73-3L13.73 4c-.77-1.33-2.69-1.33-3.46 0L3.34 16c-.77 1.33.19 3 1.73 3z"
            />
          </svg>
        </div>

        <h3 className="mt-4 text-center text-xl font-bold text-slate-900">
          Delete Subject
        </h3>

        <p className="mt-2 text-center text-sm text-slate-500">
          Are you sure you want to delete
          <span className="font-semibold text-slate-900">
            {" "}
            {deleteModal.subjectName}
          </span>
          ?
        </p>

        <p className="mt-1 text-center text-xs text-red-500">
          This action cannot be undone.
        </p>
      </div>

      {/* Footer */}
      <div className="flex gap-3 p-5">
        <button
          onClick={() =>
            setDeleteModal({
              open: false,
              subjectId: null,
              subjectName: "",
            })
          }
          disabled={submitting}
          className="flex-1 rounded-xl border border-slate-300 bg-white py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          Cancel
        </button>

        <button
          onClick={handleDelete}
          disabled={submitting}
          className="flex-1 rounded-xl bg-red-600 py-3 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-60"
        >
          {submitting ? "Deleting..." : "Delete Subject"}
        </button>
      </div>
    </div>
  </div>
)}
    </div>
  );
}

export default SubjectsPage;

