import { useEffect, useState, useMemo, useCallback } from "react";
import api from "../../utils/api";

// --- HELPERS & PRIMITIVES ---
function Field({ label, children, sublabel }) {
  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between gap-3">
        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">{label}</label>
        {sublabel && <span className="text-[11px] text-slate-400 font-medium">{sublabel}</span>}
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

function SectionCard({ title, children, right }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between border-b border-slate-50 pb-2">
        <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">{title}</h2>
        {right && <div>{right}</div>}
      </div>
      {children}
    </div>
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
            <h3 className="text-lg font-bold text-slate-900">Delete Notification?</h3>
            <p className="mt-1.5 text-sm text-slate-500 leading-relaxed">
              Are you sure you want to permanently delete <span className="font-semibold text-slate-800">{details?.title || "this notice"}</span>? This will remove it from all student streams and dashboard tracking records.
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
export default function NotificationManagementPage() {
  const [notifications, setNotifications] = useState([]);
  const [subjectsRegistry, setSubjectsRegistry] = useState([]);

  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [errorFeed, setErrorFeed] = useState("");
  const [successFeed, setSuccessFeed] = useState("");

  // History Filter State: "all" | "admin" | "faculty"
  const [filterSenderRole, setFilterSenderRole] = useState("all");

  const [deleteModal, setDeleteModal] = useState({ isOpen: false, item: null });

  // Broadcast Form State Data Payload
  const [form, setForm] = useState({
    title: "",
    message: "",
    target: "all", // Options: all, department, semester, section
    department: "",
    semester: "",
    section: "",
  });

  // Fetch initial notifications and master subjects parameters from database registries
  const fetchInitialPortalData = useCallback(async () => {
    try {
      setLoading(true);
      setErrorFeed("");
      
      const [notifRes, subjectsRes] = await Promise.all([
        api.get("/api/admin/notifications/all"), // Targeted backend router location
        api.get("/api/admin/subjects"), 
      ]);

      const responseData = notifRes?.data;
      const extractedNotifs = 
        responseData?.notifications || 
        responseData?.data || 
        (Array.isArray(responseData) ? responseData : []);

      const extractedSubjects = subjectsRes?.data?.subjects || subjectsRes?.data?.data || subjectsRes?.data || [];

      setNotifications(Array.isArray(extractedNotifs) ? extractedNotifs : []);
      setSubjectsRegistry(Array.isArray(extractedSubjects) ? extractedSubjects : []);
    } catch (err) {
      console.error("Data sync breakdown error:", err);
      setErrorFeed("Failed to retrieve system broadcast records.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInitialPortalData();
  }, [fetchInitialPortalData]);

  // --- DYNAMIC PARAMETERS EXTRACTION ENGINE ---
  const availableDepartments = useMemo(() => {
    if (!Array.isArray(subjectsRegistry)) return [];
    const depts = subjectsRegistry.map(s => String(s?.department || "").trim().toUpperCase()).filter(Boolean);
    return [...new Set(depts)].sort();
  }, [subjectsRegistry]);

  const availableSemesters = useMemo(() => {
    if (!form.department || !Array.isArray(subjectsRegistry)) return [];
    const sems = subjectsRegistry
      .filter(s => String(s?.department || "").trim().toUpperCase() === form.department.toUpperCase())
      .map(s => Number(s?.semester))
      .filter(Boolean);
    return [...new Set(sems)].sort((a, b) => a - b);
  }, [subjectsRegistry, form.department]);

  const handleTargetChangeReset = (newTarget) => {
    setForm(prev => ({
      ...prev,
      target: newTarget,
      department: newTarget === "all" ? "" : availableDepartments[0] || "",
      semester: "",
      section: "",
    }));
  };

  const handleDepartmentChangeCleanSync = (deptCode) => {
    setForm(prev => ({
      ...prev,
      department: deptCode,
      semester: "",
      section: "",
    }));
  };

  // Filter dynamically by Sender Role (Admin vs Faculty)
  const displayFilteredNotifications = useMemo(() => {
    if (!Array.isArray(notifications)) return [];
    if (filterSenderRole === "all") return notifications;
    return notifications.filter(n => String(n?.senderRole || "").toLowerCase() === filterSenderRole.toLowerCase());
  }, [notifications, filterSenderRole]);

  const handleFormChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleClearForm = () => {
    setForm({
      title: "",
      message: "",
      target: "all",
      department: "",
      semester: "",
      section: "",
    });
  };

  const handleBroadcastSubmit = async (e) => {
    e.preventDefault();
    setErrorFeed("");
    setSuccessFeed("");

    if (!form.title.trim() || !form.message.trim() || !form.target) {
      setErrorFeed("Please populate title description and notice text content values.");
      return;
    }

    if (form.target === "semester" && !form.semester) {
      setErrorFeed("Target validation semester timeline selection is required.");
      return;
    }
    if (form.target === "section" && (!form.semester || !form.section.trim())) {
      setErrorFeed("Target validation semester tier and class section key identifiers are required.");
      return;
    }

    try {
      setProcessing(true);

      const requestPayload = {
        title: form.title.trim(),
        message: form.message.trim(),
        target: form.target,
        department: form.target === "all" ? "" : form.department.toUpperCase(),
        semester: form.target === "all" || form.target === "department" ? null : Number(form.semester),
        section: form.target === "section" ? form.section.trim().toUpperCase() : "",
      };

      const res = await api.post("/api/admin/notification", requestPayload);

      if (res.data?.success || res.success) {
        setSuccessFeed("Notice broadcast safely synchronized into active system cluster databases arrays.");
        handleClearForm();
        
        const updatedRes = await api.get("/api/admin/notifications/all");
        const responseData = updatedRes?.data;
        const updatedArr = responseData?.notifications || responseData?.data || [];
        setNotifications(Array.isArray(updatedArr) ? updatedArr : []);
      }
    } catch (err) {
      console.error(err);
      setErrorFeed(err.response?.data?.message || "Failed to complete notification broadcast loop mapping.");
    } finally {
      setProcessing(false);
    }
  };

  // --- TRASH REMOVAL DELETION ENGINE ---
  const handleRequestRemoval = (item) => {
    setDeleteModal({ isOpen: true, item });
  };

  const handleExecuteDeletion = async () => {
    const item = deleteModal.item;
    const targetId = item?._id || item?.id;
    if (!targetId) {
      setErrorFeed("Missing unique parameter signatures needed to perform delete task.");
      return;
    }

    try {
      setProcessing(true);
      setErrorFeed("");
      setSuccessFeed("");

      // Dispatches request directly down to endpoint layout: DELETE /api/admin/notification/:id
      const res = await api.delete(`/api/admin/notification/${targetId}`);
      
      if (res.data?.success || res.success) {
        setSuccessFeed("Notice bulletin wiped cleanly from system archives databases rows.");
        setDeleteModal({ isOpen: false, item: null });
        
        // Dynamic localized UI layout update filter without forcing hard refresh overheads
        setNotifications(prev => prev.filter(n => n._id !== targetId && n.id !== targetId));
      }
    } catch (err) {
      console.error("Purge failure error:", err);
      setErrorFeed(err.response?.data?.message || "Failed to complete deletion stream pipeline.");
      setDeleteModal({ isOpen: false, item: null });
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
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Notice & Broadcast Desk</h1>
        <p className="mt-1 text-sm text-slate-500">Configure target constraints parameters and dispatch announcements cross institutional databases fields.</p>
      </div>

      {errorFeed && <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 shadow-sm">{errorFeed}</div>}
      {successFeed && <div className="mb-4 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-semibold text-green-700 shadow-sm">{successFeed}</div>}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        
        {/* LEFT COLUMN PANEL */}
        <div className="lg:col-span-5 space-y-6">
          <SectionCard 
            title="Compose Notice Broadcast" 
            right={<span className="text-xs font-bold px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 uppercase tracking-wider">Admin Workspace Shell</span>}
          >
            <form onSubmit={handleBroadcastSubmit} className="space-y-5">
              <Field label="Notice Header Title">
                <Input
                  type="text"
                  value={form.title}
                  onChange={(e) => handleFormChange("title", e.target.value)}
                  placeholder="e.g., Campus Placement Drive Schedule"
                  required
                  disabled={processing}
                />
              </Field>

              {/* RADIO CARD GROUP BUTTONS SELECTORS */}
              <div>
                <label className="block mb-2 text-xs font-bold text-slate-700 uppercase tracking-wider">Select Targeting Scope Profile Mode</label>
                <div className="grid grid-cols-2 gap-2.5">
                  {[
                    { key: "all", label: "Global Scope", sub: "All students" },
                    { key: "department", label: "Department", sub: "Isolate via Dept Code" },
                    { key: "semester", label: "Semester plan", sub: "Isolate via Term tier" },
                    { key: "section", label: "Class Section", sub: "Isolate via Section block" }
                  ].map((btn) => {
                    const isCheckedRadio = form.target === btn.key;
                    return (
                      <button
                        key={btn.key}
                        type="button"
                        disabled={processing}
                        onClick={() => handleTargetChangeReset(btn.key)}
                        className={`flex flex-col text-left p-3 rounded-xl border transition-all text-sm font-medium ${
                          isCheckedRadio 
                            ? "border-blue-500 bg-blue-50/60 ring-2 ring-blue-100 text-blue-900" 
                            : "border-slate-200 bg-white hover:bg-slate-50 text-slate-700"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <div className={`h-3.5 w-3.5 rounded-full border flex items-center justify-center ${isCheckedRadio ? "border-blue-600 bg-blue-600" : "border-slate-300 bg-white"}`}>
                            {isCheckedRadio && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
                          </div>
                          <span className="font-bold tracking-tight">{btn.label}</span>
                        </div>
                        <span className="mt-1 text-[11px] text-slate-400 font-medium pl-5 truncate">{btn.sub}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* DYNAMIC CASCADING SELECTIONS DRAWERS */}
              {form.target !== "all" && (
                <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
                  <Field label="Target Department Code">
                    <Select
                      value={form.department}
                      onChange={(e) => handleDepartmentChangeCleanSync(e.target.value)}
                      disabled={processing || availableDepartments.length === 0}
                    >
                      <option value="">Choose Department</option>
                      {availableDepartments.map(d => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </Select>
                  </Field>

                  {(form.target === "semester" || form.target === "section") && (
                    <Field label="Target Semester Tier Plan">
                      <Select
                        value={form.semester}
                        onChange={(e) => handleFormChange("semester", e.target.value)}
                        disabled={processing || !form.department || availableSemesters.length === 0}
                      >
                        <option value="">Choose Active Term</option>
                        {availableSemesters.map(s => (
                          <option key={s} value={String(s)}>Semester Plan {s}</option>
                        ))}
                      </Select>
                    </Field>
                  )}

                  {form.target === "section" && (
                    <Field label="Target Classroom Section stream">
                      <Select
                        value={form.section}
                        onChange={(e) => handleFormChange("section", e.target.value)}
                        disabled={processing || !form.semester}
                      >
                        <option value="">Choose Target Stream</option>
                        {["A", "B", "C", "D"].map(sec => (
                          <option key={sec} value={sec}>Section Stream {sec}</option>
                        ))}
                      </Select>
                    </Field>
                  )}
                </div>
              )}

              <Field label="Detailed Bulletin Announcement Content message">
                <textarea
                  rows={4}
                  value={form.message}
                  onChange={(e) => handleFormChange("message", e.target.value)}
                  placeholder="Enter explicit notice paragraphs description copy guidelines content here..."
                  required
                  disabled={processing}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:opacity-60 transition-all resize-none font-medium text-slate-800"
                />
              </Field>

              <button
                type="submit"
                disabled={processing}
                className="w-full rounded-xl bg-blue-600 py-3 text-sm font-bold text-white shadow-md hover:bg-blue-700 active:bg-blue-800 disabled:opacity-50 transition-all text-center"
              >
                {processing ? "Broadcasting Outbound notice..." : "Dispatch Notification Bulletin"}
              </button>
            </form>
          </SectionCard>
        </div>

        {/* RIGHT COLUMN: Sentinel History Feed Card View Displays with integrated trash icon triggers */}
        <div className="lg:col-span-7 space-y-4">
          
          {/* Section Segment Filters Row Controls */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Outbound Dispatch Registry Ledger</h3>
              <p className="text-xs text-slate-400 mt-0.5">Isolate or overview structural logs matching account permissions filters.</p>
            </div>
            
            <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button type="button" onClick={() => setFilterSenderRole("all")} className={`text-xs font-bold px-3 py-2 rounded-lg transition-all ${filterSenderRole === "all" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500 hover:text-slate-900"}`}>All Bulletins</button>
              <button type="button" onClick={() => setFilterSenderRole("admin")} className={`text-xs font-bold px-3 py-2 rounded-lg transition-all ${filterSenderRole === "admin" ? "bg-white text-blue-600 shadow-xs" : "text-slate-500 hover:text-slate-900"}`}>My BroadCasts</button>
              <button type="button" onClick={() => setFilterSenderRole("faculty")} className={`text-xs font-bold px-3 py-2 rounded-lg transition-all ${filterSenderRole === "faculty" ? "bg-white text-amber-600 shadow-xs" : "text-slate-500 hover:text-slate-900"}`}>Faculty Notices</button>
            </div>
          </div>

          {/* Cards Stack Rendering Area view */}
          <div className="space-y-4 max-h-[640px] overflow-y-auto pr-1">
            {displayFilteredNotifications.length === 0 ? (
              <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-sm font-medium italic text-slate-400">
                No active notifications found inside current database registries criteria selection.
              </div>
            ) : (
              displayFilteredNotifications.map((notice) => {
                const prettyDateStr = notice?.createdAt ? new Date(notice.createdAt).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) : "—";
                const isPushedByAdmin = String(notice?.senderRole || "").toLowerCase() === "admin";

                return (
                  <div
                    key={notice?._id || notice?.id}
                    className={`rounded-2xl border border-slate-200 bg-white p-5 shadow-xs hover:shadow-sm transition-all duration-200 border-l-4 ${
                      isPushedByAdmin ? "border-l-blue-600" : "border-l-amber-500"
                    } flex flex-col justify-between`}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-3 border-b border-slate-50 pb-2.5">
                        <div>
                          <h4 className="text-base font-bold text-slate-900 leading-tight">{notice?.title || "Untitled Notice"}</h4>
                          <p className="text-[11px] font-medium text-slate-400 mt-1">Dispatched Date: <span className="font-semibold text-slate-600 font-mono">{prettyDateStr}</span></p>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <div className="flex flex-col items-end gap-1">
                            <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                              isPushedByAdmin ? "bg-blue-50 text-blue-700 ring-1 ring-blue-100" : "bg-amber-50 text-amber-700 ring-1 ring-amber-100"
                            }`}>
                              Target: {notice?.target || "all"}
                            </span>
                            {notice?.target !== "all" && (
                              <span className="text-[10px] font-bold font-mono text-slate-600">
                                {notice?.department || "BCA"}
                                {notice?.semester ? ` • Sem ${notice.semester}` : ""}
                                {notice?.section ? ` • Sec ${notice.section}` : ""}
                              </span>
                            )}
                          </div>
                          
                          {/* Trash button controller action */}
                          <button
                            type="button"
                            onClick={() => handleRequestRemoval(notice)}
                            className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 transition"
                            title="Delete Notice Bulletin"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-4v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>

                      <div className="mt-3 text-sm text-slate-600 leading-relaxed font-medium whitespace-pre-wrap">
                        {notice?.message || "No content provided."}
                      </div>
                    </div>

                    <div className="mt-4 border-t border-slate-50 pt-2.5 flex items-center justify-between text-[11px] font-semibold text-slate-400">
                      <div className="flex items-center gap-1.5">
                        <div className={`h-2 w-2 rounded-full ${isPushedByAdmin ? "bg-blue-500" : "bg-amber-500"}`} />
                        Sender Profile Role: <span className={`font-bold capitalize ${isPushedByAdmin ? "text-blue-600" : "text-amber-600"}`}>{notice?.senderRole || "Admin"}</span>
                      </div>

                      <div className="flex items-center gap-1">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Acknowledged: <span className="font-mono text-slate-700 font-bold">{Array.isArray(notice?.readBy) ? notice.readBy.length : 0} Students</span>
                      </div>
                    </div>

                  </div>
                );
              })
            )}
          </div>

        </div>

      </div>
    </div>
  );
}