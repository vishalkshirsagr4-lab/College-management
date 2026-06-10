import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../utils/api";

function ProfileThumb({ src, name }) {
  return (
    <img
      src={src || "/default-avatar.png"}
      alt={name || ""}
      className="h-12 w-12 rounded-full object-cover bg-slate-100 ring-1 ring-slate-200"
      onError={(e) => {
        e.currentTarget.src = "/default-avatar.png";
      }}
    />
  );
}

function Tag({ children }) {
  if (!children) return null;
  return (
    <span className="inline-flex items-center rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-700">
      {children}
    </span>
  );
}

function normalize(str) {
  return String(str ?? "").trim().toLowerCase();
}

function Chip({ children }) {
  return (
    <span className="whitespace-nowrap rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
      {children}
    </span>
  );
}

export default function FacultyDetailsPage() {
  const { facultyId } = useParams();
  const navigate = useNavigate();

  const [faculty, setFaculty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        setLoading(true);
        setError("");
        const res = await api.get(`/api/admin/faculty/${facultyId}`);
        setFaculty(res.data?.faculty || res.data?.data || res.data || null);
      } catch (e) {
        setError(e?.response?.data?.message || "Failed to fetch faculty details.");
        setFaculty(null);
      } 
       finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [facultyId]);

  // Clean data transformation block supporting granular subdocument definitions safely
  const processedAssignments = useMemo(() => {
    const tas = Array.isArray(faculty?.teachingAssignments) ? faculty.teachingAssignments : [];
    
    return tas
      .filter((x) => x && x.semester != null)
      .map((x) => ({
        department: String(x.department || faculty?.department || "BCA"),
        semester: Number(x.semester),
        section: String(x.section || "A"),
        subjects: Array.isArray(x.subjects) ? x.subjects.filter(Boolean) : [],
      }))
      .sort((a, b) => a.semester - b.semester || a.section.localeCompare(b.section));
  }, [faculty]);

  const totalSubjects = useMemo(() => {
    return processedAssignments.reduce((acc, s) => acc + (s.subjects?.length || 0), 0);
  }, [processedAssignments]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-4xl p-4 md:p-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="h-6 w-64 animate-pulse rounded bg-slate-200" />
            <div className="mt-4 flex items-center gap-3">
              <div className="h-12 w-12 animate-pulse rounded-full bg-slate-200" />
              <div className="space-y-2">
                <div className="h-4 w-56 animate-pulse rounded bg-slate-200" />
                <div className="h-3 w-64 animate-pulse rounded bg-slate-200" />
              </div>
            </div>
            <div className="mt-6 space-y-3">
              {[1, 2].map((i) => (
                <div key={i} className="h-24 animate-pulse rounded-xl bg-slate-100" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-4xl p-4 md:p-6">
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        </div>
      </div>
    );
  }

  if (!faculty) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-4xl p-4 md:p-6">
          <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-600">
            Faculty profile records not found inside the system.
          </div>
        </div>
      </div>
    );
  }

  const user = faculty?.userID || {};

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-4xl p-4 md:p-6">
        
        {/* Dynamic header row navigation */}
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">Faculty Profile Details</h1>
            <p className="mt-1 text-sm text-slate-500">Comprehensive overview and classroom allocations</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => navigate("/admin/faculty")}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Back
            </button>
            <button
              type="button"
              onClick={() => navigate(`/admin/faculty/${facultyId}/edit-subjects`)}
              className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 shadow-sm"
            >
              Edit Assignments
            </button>
          </div>
        </div>

        {/* Profile General Context Card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <ProfileThumb src={faculty?.profileImage} name={user?.name} />
              <div>
                <div className="text-lg font-bold text-slate-900">{user?.name || "—"}</div>
                <div className="mt-0.5 text-sm text-slate-500">{user?.email || ""}</div>
                <div className="mt-2 flex flex-wrap gap-2">
                  <Tag>ID: {user?.loginID || ""}</Tag>
                  <Tag>Dept: {faculty?.department || ""}</Tag>
                  <Tag>{faculty?.designation || ""}</Tag>
                </div>
              </div>
            </div>

            <div className="rounded-xl bg-slate-50 px-4 py-3">
              <div className="text-xs font-semibold text-slate-600">Total Courses Handled</div>
              <div className="mt-1 text-2xl font-bold text-slate-900">{totalSubjects} assigned</div>
            </div>
          </div>

          <div className="mt-5 border-t border-slate-100 pt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <div className="text-xs font-medium text-slate-400 uppercase tracking-wider">Contact Number</div>
              <div className="mt-1 text-sm font-semibold text-slate-800">{faculty?.phone || "—"}</div>
            </div>
            <div>
              <div className="text-xs font-medium text-slate-400 uppercase tracking-wider">System Auth Role</div>
              <div className="mt-1 text-sm font-semibold text-slate-800 capitalize">{user?.role || "—"}</div>
            </div>
          </div>
        </div>

        {/* Assignments Stack Presentation View Wrapper */}
        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-2">
            <h2 className="text-lg font-bold text-slate-900">Current Course Allocations</h2>
            <p className="text-xs text-slate-500 mt-0.5">Assigned subject codes sorted systematically by classes blocks</p>
          </div>

          {processedAssignments.length === 0 ? (
            <div className="mt-4 rounded-xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center text-xs text-slate-400">
              No active classroom allocations detected for this faculty record.
            </div>
          ) : (
            <div className="mt-4 space-y-3">
              {processedAssignments.map((sa, idx) => (
                <div key={`${sa.semester}-${sa.section}-${idx}`} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm hover:border-slate-300 transition-all">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2 mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-blue-700">Semester {sa.semester}</span>
                      <span className="h-4 w-px bg-slate-200" />
                      <span className="text-xs font-semibold text-slate-600">Section {sa.section}</span>
                    </div>
                    <span className="rounded-md bg-slate-50 border border-slate-200 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      {sa.department}
                    </span>
                  </div>
                  
                  <div className="flex flex-wrap gap-1.5">
                    {sa.subjects.length === 0 ? (
                      <div className="text-xs text-slate-400 italic">No assigned subjects configured in this block context.</div>
                    ) : (
                      sa.subjects.map((subj) => (
                        <Chip key={normalize(subj) + subj}>{subj}</Chip>
                      ))
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}