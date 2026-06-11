import { useEffect, useState, useMemo, useCallback } from "react";
import api from "../../utils/api";

// --- SUB-COMPONENTS ---
function Field({ label, children, optional = false }) {
  return (
    <div className="w-full">
      <div className="mb-1.5 flex items-baseline justify-between gap-3">
        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">{label}</label>
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
        "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-50 disabled:text-slate-500 transition-all " +
        className
      }
    />
  );
}

function SectionCard({ title, children, icon, right }) {
  return (
    <div className="w-full rounded-2xl border border-slate-200 bg-white p-6 md:p-8 shadow-sm">
      <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-4">
        <div className="flex items-center gap-2.5">
          {icon && <div className="text-blue-600">{icon}</div>}
          <h2 className="text-base font-bold text-slate-900 uppercase tracking-wider">{title}</h2>
        </div>
        {right && <div>{right}</div>}
      </div>
      {children}
    </div>
  );
}

// --- MAIN PROFILE COMPONENT (MAXIMIZED VIEWPORT LAYOUT) ---
export default function FacultyProfilePage() {
  const [faculty, setFaculty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const [errorFeed, setErrorFeed] = useState("");
  const [successFeed, setSuccessFeed] = useState("");

  const [showImageModal, setShowImageModal] = useState(false);

  // Local state form payload capture
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    department: "",
    designation: "",
  });

  const fetchFacultyProfile = useCallback(async () => {
    try {
      setLoading(true);
      setErrorFeed("");
      
      const res = await api.get("/api/faculty/profile");
      const facDoc = res.data?.data || res.data?.faculty || res.data;
      
      if (!facDoc) throw new Error("Profile record payload empty.");
      
      setFaculty(facDoc);
      setForm({
        name: facDoc.userID?.name || "",
        email: facDoc.userID?.email || "",
        phone: facDoc.phone || "",
        department: facDoc.department || "",
        designation: facDoc.designation || "",
      });
    } catch (err) {
      console.error(err);
      setErrorFeed(err.response?.data?.message || "Failed to download your profile metrics records.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFacultyProfile();
  }, [fetchFacultyProfile]);

  const handleFieldChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setErrorFeed("");
    setSuccessFeed("");

    if (!form.name.trim() || !form.email.trim() || !form.phone.trim() || !form.department.trim()) {
      setErrorFeed("Core configuration parameters fields cannot be left empty.");
      return;
    }

    try {
      setSaving(true);

      const res = await api.put(`/api/faculty/profile`, {
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        department: form.department.trim(),
        designation: form.designation.trim(),
      });

      if (res.data?.success || res.success) {
        setSuccessFeed("Profile alterations synchronized successfully.");
        setIsEditing(false);
        await fetchFacultyProfile();
      }
    } catch (err) {
      console.error(err);
      setErrorFeed(err.response?.data?.message || "Failed to successfully commit profile metrics rewrites.");
    } finally {
      setSaving(false);
    }
  };

  const totalAssignedClasses = useMemo(() => {
    if (!faculty || !Array.isArray(faculty.teachingAssignments)) return 0;
    return faculty.teachingAssignments.length;
  }, [faculty]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
          <p className="mt-4 text-sm font-bold text-slate-400 uppercase tracking-widest animate-pulse">Syncing Profile Ledger...</p>
        </div>
      </div>
    );
  }

  const facultyDisplayName = faculty?.userID?.name || "Faculty Member";
  const avatarUrlFallback = `https://ui-avatars.com/api/?name=${encodeURIComponent(facultyDisplayName)}&background=2563eb&color=fff&bold=true`;

  return (
    <div className="w-full min-h-screen bg-slate-50 p-4 md:p-8 flex flex-col justify-start items-center">
      {/* Container stretched across a true maximum width window footprint bounds */}
      <div className="w-full max-w-full space-y-6">
        
        {/* MAXIMIZED HERO HEADER BANNER UNIT */}
        <div className="relative w-full rounded-3xl border border-slate-200 bg-white p-6 md:p-10 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 overflow-hidden">
          <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-blue-600 to-indigo-600" />
          
          <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
            <img
              src={faculty?.profileImage || avatarUrlFallback}
              alt={facultyDisplayName}
              className="h-28 w-28 rounded-full object-cover border-4 border-slate-50 shadow-md ring-1 ring-slate-100 cursor-pointer hover:scale-105 transition-transform"
              onClick={() => setShowImageModal(true)}
              onError={(e) => {
                e.currentTarget.src = avatarUrlFallback;
              }}
            />
            <div className="space-y-2">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3">
                <h1 className="text-3xl font-black text-slate-900 md:text-4xl tracking-tight leading-none">{facultyDisplayName}</h1>
                <span className="rounded-full bg-slate-100 border border-slate-200 px-3.5 py-1 text-xs font-bold text-slate-600 font-mono">
                  Login ID: {faculty?.userID?.loginID || "—"}
                </span>
              </div>
              <p className="text-base font-bold text-blue-600 uppercase tracking-wider">{form.designation || "Faculty Professor"}</p>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Primary Department Area: <span className="font-bold text-slate-700">{faculty?.department || "N/A"}</span></p>
            </div>
          </div>

          {/* Action Trigger Handlers */}
          <div className="flex items-center justify-center shrink-0">
            {!isEditing ? (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="w-full sm:w-auto rounded-xl bg-blue-600 px-8 py-3.5 text-sm font-bold text-white shadow-md hover:bg-blue-700 active:bg-blue-800 transition"
              >
                Edit Profile Details
              </button>
            ) : (
              <div className="w-full sm:w-auto flex items-center gap-3">
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => { setIsEditing(false); setErrorFeed(""); }}
                  className="w-1/2 sm:w-auto rounded-xl border border-slate-300 bg-white px-6 py-3.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={saving}
                  onClick={handleFormSubmit}
                  className="w-1/2 sm:w-auto rounded-xl bg-green-600 px-7 py-3.5 text-sm font-bold text-white shadow-sm hover:bg-green-700 active:bg-green-800 transition"
                >
                  {saving ? "Saving..." : "Commit Update"}
                </button>
              </div>
            )}
          </div>
        </div>

        {errorFeed && <div className="w-full rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 shadow-xs">{errorFeed}</div>}
        {successFeed && <div className="w-full rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-semibold text-green-700 shadow-xs">{successFeed}</div>}

        {/* FULLY EXPANDED GRID BREAKOUT SHELL CONTAINER */}
        <div className="w-full grid grid-cols-1 gap-6 xl:grid-cols-12">
          
          {/* FULL ROW SUB-FORM SECTION */}
          <div className="xl:col-span-6 space-y-6 flex flex-col h-full">
            <SectionCard 
              title="Profile Parameters Settings"
              icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>}
            >
              <form onSubmit={handleFormSubmit} className="space-y-5">
                <Field label="Full Account Name">
                  <Input
                    type="text"
                    value={form.name}
                    onChange={(e) => handleFieldChange("name", e.target.value)}
                    disabled={!isEditing || saving}
                    placeholder="Enter full display description name"
                    required
                  />
                </Field>

                <Field label="Primary Contact E-mail Link">
                  <Input
                    type="email"
                    value={form.email}
                    onChange={(e) => handleFieldChange("email", e.target.value)}
                    disabled={!isEditing || saving}
                    placeholder="e.g., faculty@college.edu"
                    required
                  />
                </Field>

                <Field label="Primary Telephone Mobile Link">
                  <Input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => handleFieldChange("phone", e.target.value)}
                    disabled={!isEditing || saving}
                    placeholder="Primary contact digits string"
                    required
                  />
                </Field>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Field label="Department Code">
                    <Input
                      type="text"
                      value={form.department}
                      onChange={(e) => handleFieldChange("department", e.target.value)}
                      disabled={!isEditing || saving}
                      placeholder="e.g., BCA"
                      required
                    />
                  </Field>

                  <Field label="Designation Title">
                    <Input
                      type="text"
                      value={form.designation}
                      onChange={(e) => handleFieldChange("designation", e.target.value)}
                      disabled={!isEditing || saving}
                      placeholder="e.g., Assistant Professor"
                      required
                    />
                  </Field>
                </div>
              </form>
            </SectionCard>
          </div>

          {/* RIGHT COMPONENT CARD: Expanded full width classroom metrics listings list layout view */}
          <div className="xl:col-span-6 flex flex-col h-full">
            <SectionCard
              title="Classroom Allocation Workloads Matrix"
              right={
                <span className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-1.5 text-xs font-bold font-mono text-slate-600 shadow-inner">
                  {totalAssignedClasses} Active Schemes
                </span>
              }
              icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>}
            >
              {!faculty?.teachingAssignments || faculty.teachingAssignments.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 p-12 text-center text-sm font-medium italic text-slate-400 my-auto">
                  No active classroom assignments mapped onto this faculty profile cluster yet.
                </div>
              ) : (
                <div className="w-full grid grid-cols-1 gap-4 max-h-[580px] overflow-y-auto pr-1">
                  {faculty.teachingAssignments.map((assignment, idx) => (
                    <div 
                      key={assignment._id || assignment.id || idx}
                      className="w-full rounded-xl border border-slate-200 bg-white p-5 shadow-2xs border-l-4 border-l-blue-600 space-y-4"
                    >
                      <div className="flex items-center justify-between border-b border-slate-50 pb-3">
                        <div>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Department Context</span>
                          <span className="text-base font-black text-slate-900 tracking-tight">{assignment.department || faculty.department || "N/A"}</span>
                        </div>
                        <div className="flex gap-2">
                          <span className="rounded-md bg-blue-50 border border-blue-100 px-3 py-1 text-xs font-bold text-blue-700 font-mono">
                            Sem {assignment.semester}
                          </span>
                          <span className="rounded-md bg-slate-100 border border-slate-200 px-3 py-1 text-xs font-bold text-slate-700 font-mono">
                            Sec {assignment.section || "A"}
                          </span>
                        </div>
                      </div>

                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">Assigned Course Units</span>
                        {Array.isArray(assignment.subjects) && assignment.subjects.length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {assignment.subjects.map((course, cIdx) => (
                              <span 
                                key={cIdx} 
                                className="inline-block rounded-lg bg-slate-50 border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-700 uppercase tracking-tight shadow-3xs"
                              >
                                {course}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-xs font-medium italic text-slate-400">— No active string tags allocated —</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </SectionCard>
          </div>

        </div>

      </div>
      {showImageModal && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
            onClick={() => setShowImageModal(false)}
          >
            <button
              className="absolute top-4 right-4 text-white text-4xl font-bold hover:text-red-400"
              onClick={() => setShowImageModal(false)}
            >
              ×
            </button>

            <img
              src={faculty?.profileImage || avatarUrlFallback}
              alt={facultyDisplayName}
              className="max-h-[90vh] max-w-[90vw] rounded-2xl shadow-2xl object-contain"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        )}
    </div>
  );
}