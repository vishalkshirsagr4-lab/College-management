import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../utils/api";

function ProfileThumb({ src, name, onClick }) {
  return (
    <img
      src={src || "/default-avatar.png"}
      alt={name || ""}
      onClick={onClick}
      className={`h-11 w-11 rounded-full object-cover bg-slate-100 ring-1 ring-slate-200 ${
        src ? "cursor-zoom-in hover:opacity-90 transition-opacity" : ""
      }`}
      onError={(e) => {
        e.currentTarget.src = "/default-avatar.png";
      }}
    />
  );
}

// Custom Modal Component for Maximizing Profile Pictures
function ImagePreviewModal({ isOpen, src, name, onClose }) {
  if (!isOpen || !src) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop overlay blur effect */}
      <div 
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />
      
      {/* Content Container */}
      <div className="relative max-w-md w-full flex flex-col items-center z-10">
        {/* Close Button above the image */}
        <button
          type="button"
          onClick={onClose}
          className="absolute -top-12 right-0 rounded-full bg-slate-800/80 p-2 text-white hover:bg-slate-700 transition"
          title="Close Preview"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Maximized High-Resolution Profile Image */}
        <img
          src={src}
          alt={name || "Profile Preview"}
          className="w-full h-auto max-h-[75vh] object-contain rounded-2xl bg-white shadow-2xl ring-1 ring-white/10"
        />
        
        {name && (
          <div className="mt-3 rounded-full bg-slate-900/80 px-4 py-1.5 text-xs font-semibold text-white tracking-wide">
            {name}
          </div>
        )}
      </div>
    </div>
  );
}

// Custom Modal Component for Total Faculty Deletion UI/UX
function FacultyDeleteModal({ isOpen, onClose, onConfirm, facultyName, submitting }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop overlay background lock */}
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" 
        onClick={submitting ? undefined : onClose}
      />
      
      {/* Modal core window view block */}
      <div className="relative w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 shadow-xl transition-all border border-slate-100">
        <div className="flex flex-col items-center text-center">
          {/* Warning Trash Icon Indicator */}
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-600 mb-4">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-16v1a1 1 0 001 1h3M4 7h16M10 11v6" />
            </svg>
          </div>

          <h3 className="text-lg font-bold text-slate-900 mb-2">Delete Faculty Profile</h3>
          <p className="text-sm text-slate-500 mb-6">
            Are you sure you want to completely delete <span className="font-semibold text-slate-800">{facultyName}</span>? 
            This wipes their portal access account and assignments permanently.
          </p>
        </div>

        {/* Operational buttons cluster */}
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
            {submitting ? "Deleting..." : "Yes, Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="group rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md">
      <div className="flex items-center gap-3">
        <div className="h-11 w-11 animate-pulse rounded-full bg-slate-200" />
        <div className="min-w-0 flex-1">
          <div className="h-4 w-28 animate-pulse rounded bg-slate-200" />
          <div className="mt-2 h-3 w-40 animate-pulse rounded bg-slate-200" />
        </div>
      </div>
      <div className="mt-4 space-y-2">
        <div className="h-3 w-36 animate-pulse rounded bg-slate-200" />
        <div className="h-3 w-28 animate-pulse rounded bg-slate-200" />
        <div className="h-3 w-44 animate-pulse rounded bg-slate-200" />
      </div>
      <div className="mt-4 flex gap-2">
        <div className="h-9 flex-1 animate-pulse rounded-lg bg-slate-200" />
        <div className="h-9 flex-1 animate-pulse rounded-lg bg-slate-200" />
      </div>
    </div>
  );
}

function Tag({ children }) {
  return (
    <span className="inline-flex items-center rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-700">
      {children}
    </span>
  );
}

function normalize(str) {
  return String(str ?? "").trim().toLowerCase();
}

function safeTeachingAssignments(faculty) {
  const arr = Array.isArray(faculty?.teachingAssignments)
    ? faculty.teachingAssignments
    : [];
  return arr;
}

function countTotals(faculty) {
  const tas = safeTeachingAssignments(faculty);
  const semestersAssigned = tas.length;
  const subjectsAssigned = tas.reduce((acc, ta) => {
    const subs = Array.isArray(ta?.subjects) ? ta.subjects : [];
    return acc + subs.length;
  }, 0);
  return { semestersAssigned, subjectsAssigned };
}

export default function FacultyListPage() {
  const navigate = useNavigate();

  const [faculties, setFaculties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [searchName, setSearchName] = useState("");
  const [searchDepartment, setSearchDepartment] = useState("");
  const [search, setSearch] = useState("");

  // Maximized image viewer state parameters
  const [previewImage, setPreviewImage] = useState(null); 
  const [previewName, setPreviewName] = useState("");

  // Faculty deletion modal targeting states
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [targetDeleteId, setTargetDeleteId] = useState(null);
  const [targetDeleteName, setTargetDeleteName] = useState("");
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);

  useEffect(() => {
    const fetchFaculties = async () => {
      try {
        setLoading(true);
        setError("");
        const res = await api.get("/api/admin/faculty");
        setFaculties(res.data?.faculty || res.data?.faculties || res.data?.data || []);
      } catch (e) {
        setError(e?.response?.data?.message || "Failed to fetch faculties.");
        setFaculties([]);
      } finally {
        setLoading(false);
      }
    };
    fetchFaculties();
  }, []);

  const departments = useMemo(() => {
    const set = new Set();
    for (const f of faculties) {
      if (f?.department) set.add(f.department);
    }
    return [...set].sort((a, b) => a.localeCompare(b));
  }, [faculties]);

  const normalizedSearchName = normalize(searchName);
  const normalizedSearchDepartment = normalize(searchDepartment);
  const normalizedSearch = normalize(search);

  const filtered = useMemo(() => {
    return faculties.filter((f) => {
      const name = normalize(f?.userID?.name);
      const email = normalize(f?.userID?.email);
      const loginID = normalize(f?.userID?.loginID);
      const phone = normalize(f?.phone);
      const dept = normalize(f?.department);

      const matchesSearch =
        !normalizedSearch ||
        name.includes(normalizedSearch) ||
        email.includes(normalizedSearch) ||
        loginID.includes(normalizedSearch) ||
        phone.includes(normalizedSearch) ||
        dept.includes(normalizedSearch);

      const matchesName =
        !normalizedSearchName || name.includes(normalizedSearchName);

      const matchesDept =
        !normalizedSearchDepartment || dept.includes(normalizedSearchDepartment);

      return matchesSearch && matchesName && matchesDept;
    });
  }, [faculties, normalizedSearch, normalizedSearchDepartment, normalizedSearchName]);

  const handleOpenPreview = (imageUrl, facultyName) => {
    if (!imageUrl) return; 
    setPreviewImage(imageUrl);
    setPreviewName(facultyName);
  };

  const handleClosePreview = () => {
    setPreviewImage(null);
    setPreviewName("");
  };

  // Launch the verification workflow panel
  const triggerDeleteFaculty = (id, name) => {
    setTargetDeleteId(id);
    setTargetDeleteName(name);
    setDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setTargetDeleteId(null);
    setTargetDeleteName("");
    setDeleteModalOpen(false);
  };

  // Safe Asynchronous execution for absolute record drops
  const handleConfirmFacultyDelete = async () => {
    if (!targetDeleteId) return;

    try {
      setDeleteSubmitting(true);
      setError("");

      await api.delete(`/api/admin/faculty/${targetDeleteId}`);

      // Instantly wipe from reactive layout UI array states wrapper
      setFaculties((prev) => prev.filter((f) => f._id !== targetDeleteId));
      closeDeleteModal();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to remove the faculty member.");
      closeDeleteModal();
    } finally {
      setDeleteSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl p-4 md:p-6">
        
        {/* Dynamic Image Maximize Overlay component portal */}
        <ImagePreviewModal
          isOpen={!!previewImage}
          src={previewImage}
          name={previewName}
          onClose={handleClosePreview}
        />

        {/* Global Faculty Document Destruction Dialog Component */}
        <FacultyDeleteModal
          isOpen={deleteModalOpen}
          onClose={closeDeleteModal}
          onConfirm={handleConfirmFacultyDelete}
          facultyName={targetDeleteName}
          submitting={deleteSubmitting}
        />

        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">Faculty Management</h1>
            <p className="mt-1 text-sm text-slate-500">Search faculty and manage semester-wise teaching subjects.</p>
          </div>

          <button
            type="button"
            onClick={() => navigate("/admin/faculty/create")}
            className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
          >
            + Add Faculty
          </button>
        </div>

        <div className="mb-5 grid grid-cols-1 gap-3 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <label className="mb-2 block text-sm font-medium text-slate-700">Search Faculty by Name</label>
            <input
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              placeholder="e.g., Rahul"
            />
          </div>

          <div className="lg:col-span-4">
            <label className="mb-2 block text-sm font-medium text-slate-700">Search Faculty by Department</label>
            <input
              value={searchDepartment}
              onChange={(e) => setSearchDepartment(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              placeholder="e.g., BCA"
              list="dept-list"
            />
            <datalist id="dept-list">
              {departments.map((d) => (
                <option value={d} key={d} />
              ))}
            </datalist>
          </div>

          <div className="lg:col-span-3">
            <label className="mb-2 block text-sm font-medium text-slate-700">Quick Search</label>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              placeholder="Name / Email / Login ID"
            />
          </div>
        </div>

        {error ? (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
        ) : null}

        {loading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center">
            <div className="text-sm font-semibold text-slate-700">No faculty found</div>
            <div className="mt-1 text-xs text-slate-500">Try clearing filters.</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((f) => {
              const { semestersAssigned, subjectsAssigned } = countTotals(f);
              const facultyName = f?.userID?.name || "—";
              return (
                <div
                  key={f?._id}
                  className="group flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md"
                >
                  <div>
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <ProfileThumb 
                          src={f?.profileImage} 
                          name={facultyName} 
                          onClick={() => handleOpenPreview(f?.profileImage, facultyName)}
                        />
                        <div className="min-w-0 flex-1">
                          <div className="truncate text-sm font-bold text-slate-900">{facultyName}</div>
                          <div className="truncate text-xs text-slate-500">{f?.userID?.email || ""}</div>
                        </div>
                      </div>
                      
                      {/* Trash action button alignment corner right block */}
                      <button
                        type="button"
                        onClick={() => triggerDeleteFaculty(f?._id, facultyName)}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 transition self-start"
                        title="Delete Faculty Account"
                      >
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-16v1a1 1 0 001 1h3M4 7h16M10 11v6" />
                        </svg>
                      </button>
                    </div>

                    <div className="mt-4 space-y-2">
                      <div className="flex flex-wrap gap-2">
                        <Tag>{f?.userID?.loginID || ""}</Tag>
                        <Tag>{f?.department || ""}</Tag>
                      </div>
                      <div className="text-sm font-semibold text-slate-800">{f?.designation || ""}</div>
                      <div className="text-xs text-slate-600">Phone: <span className="font-semibold">{f?.phone || "—"}</span></div>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-semibold text-slate-700">
                        {semestersAssigned} Semesters
                      </span>
                      <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-semibold text-slate-700">
                        {subjectsAssigned} Subjects
                      </span>
                    </div>
                  </div>

                  <div className="mt-5 grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => navigate(`/admin/faculty/${f?._id}`)}
                      className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                    >
                      View Details
                    </button>
                    <button
                      type="button"
                      onClick={() => navigate(`/admin/faculty/${f?._id}/edit-subjects`)}
                      className="rounded-xl bg-blue-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-blue-700"
                    >
                      Edit Subjects
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}