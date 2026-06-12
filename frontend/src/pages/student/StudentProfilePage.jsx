import { useState, useEffect } from "react";
import api from "../../utils/api";

export default function StudentProfilePage() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showImage, setShowImage] = useState(false);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setLoading(true);
        setError("");
        
        const res = await api.get("/api/student/profile");

        if (res.data?.success) {
          setProfile(res.data.data);
          // Debugging log to see what the server is actually sending for subjects
          console.log("Backend Student Subjects Payload:", res.data.data?.subjects);
        }
      } catch (err) {
        console.error("Profile retrieval error:", err);
        setError(err.response?.data?.message || "Operational failure parsing profile data.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, []);

  if (loading) {
    return (
      <div className="w-full h-96 flex items-center justify-center p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto mb-3"></div>
          <p className="text-xs text-slate-400 font-bold tracking-wider uppercase">Loading Profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full p-6 flex items-center justify-center">
        <div className="bg-white max-w-md w-full border border-rose-200 rounded-2xl p-6 text-center shadow-sm">
          <div className="text-2xl mb-2">⚠️</div>
          <h3 className="text-md font-bold text-slate-900">Sync Failure</h3>
          <p className="text-slate-500 text-xs mt-1 font-medium">{error}</p>
        </div>
      </div>
    );
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Safe checks for the subjects array variable formats
  const renderedSubjects = Array.isArray(profile?.subjects) ? profile.subjects : [];

  return (
    // FIX: Removed min-h-screen to prevent layout breaking/stretching inside your Dashboard Shell
    <div className="w-full p-4 lg:p-6 font-sans text-slate-700 antialiased box-border">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Top Header Card */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="h-28 bg-gradient-to-r from-blue-600 to-indigo-600 w-full"></div>
          <div className="p-6 pt-0 relative flex flex-col sm:flex-row items-center sm:items-end gap-4 -mt-12 sm:text-left text-center border-b border-slate-100">
            {profile?.profileImage ? (
              <img
                src={profile.profileImage}
                alt="Profile"
                onClick={() => setShowImage(true)}
                className="h-24 w-24 rounded-2xl object-cover border-4 border-white bg-white shadow-sm shrink-0 cursor-pointer hover:scale-105 transition"
              />
            ) : (
              <div className="h-24 w-24 rounded-2xl bg-gradient-to-tr from-slate-200 to-slate-300 border-4 border-white shadow-sm flex items-center justify-center text-slate-500 text-2xl font-black uppercase shrink-0">
                {profile?.name?.charAt(0) || "S"}
              </div>
            )}
            
            <div className="flex-1 pb-1">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 justify-between">
                <h1 className="text-xl font-bold text-slate-900 tracking-tight">{profile?.name}</h1>
                <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                  profile?.isActive ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-500"
                }`}>
                  {profile?.isActive ? "Active" : "Inactive"}
                </span>
              </div>
              <p className="text-xs font-semibold text-slate-400 mt-0.5">{profile?.email}</p>
            </div>
          </div>

          {/* Metric Dashboard Bar */}
          <div className="grid grid-cols-3 divide-x divide-slate-100 bg-slate-50/50 text-center py-3">
            <div>
              <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">CGPA</span>
              <span className="text-base font-bold text-blue-600 mt-0.5 block">{profile?.cgpa || "0.00"}</span>
            </div>
            <div>
              <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Attendance</span>
              <span className="text-base font-bold text-emerald-600 mt-0.5 block">{profile?.attendancePercentage || 0}%</span>
            </div>
            <div>
              <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Fees</span>
              <span className={`text-[10px] font-bold mt-1 inline-block px-2 py-0.5 rounded uppercase ${
                profile?.feeStatus === "Paid" ? "bg-emerald-100 text-emerald-800" :
                profile?.feeStatus === "Partial" ? "bg-amber-100 text-amber-800" : "bg-rose-100 text-rose-800"
              }`}>
                {profile?.feeStatus || "Pending"}
              </span>
            </div>
          </div>
        </div>

        {/* Info Grid Split Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          <div className="md:col-span-2 space-y-6">
            {/* Academic Section */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2">
                🎓 Academic Enrollment Details
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-slate-400 block font-bold text-[10px] uppercase">Department</span>
                  <span className="text-slate-800 font-semibold mt-0.5 block">{profile?.department || "N/A"}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-bold text-[10px] uppercase">Semester</span>
                  <span className="text-slate-800 font-semibold mt-0.5 block">Semester {profile?.semester || "N/A"}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-bold text-[10px] uppercase">Section</span>
                  <span className="text-slate-800 font-semibold mt-0.5 block">Section {profile?.section || "N/A"}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-bold text-[10px] uppercase">Roll Number</span>
                  <span className="text-slate-800 font-semibold mt-0.5 block">{profile?.rollNo || "N/A"}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-bold text-[10px] uppercase">Login ID</span>
                  <span className="text-slate-800 font-mono mt-0.5 block">{profile?.loginID || "N/A"}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-bold text-[10px] uppercase">Academic Year</span>
                  <span className="text-slate-800 font-semibold mt-0.5 block">{profile?.academicYear || "N/A"}</span>
                </div>
              </div>
            </div>

            {/* Personal Section */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2">
                👤 Personal Details
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-slate-400 block font-bold text-[10px] uppercase">Gender</span>
                  <span className="text-slate-800 font-semibold mt-0.5 block">{profile?.gender || "N/A"}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-bold text-[10px] uppercase">Date of Birth</span>
                  <span className="text-slate-800 font-semibold mt-0.5 block">{formatDate(profile?.dateOfBirth)}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-bold text-[10px] uppercase">Blood Group</span>
                  <span className="text-slate-800 font-semibold mt-0.5 block uppercase">{profile?.bloodGroup || "N/A"}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-bold text-[10px] uppercase">Phone</span>
                  <span className="text-slate-800 font-semibold mt-0.5 block">{profile?.phone || "N/A"}</span>
                </div>
                <div className="sm:col-span-2">
                  <span className="text-slate-400 block font-bold text-[10px] uppercase">Address</span>
                  <span className="text-slate-700 mt-0.5 block leading-relaxed">{profile?.address || "N/A"}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side Cards */}
          <div className="space-y-6">
            {/* Guardians Section */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2">
                🏡 Family Contacts
              </h3>
              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-slate-400 block font-bold text-[10px] uppercase">Parent Name</span>
                  <span className="text-slate-800 font-semibold block mt-0.5">{profile?.parentName || "N/A"}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-bold text-[10px] uppercase">Parent Phone</span>
                  <span className="text-slate-800 font-semibold block mt-0.5">{profile?.parentPhone || "N/A"}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-bold text-[10px] uppercase">Guardian Email</span>
                  <span className="text-slate-600 block mt-0.5 break-all">{profile?.guardianEmail || "N/A"}</span>
                </div>
              </div>
            </div>

            {/* Subjects Card */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2">
                📚 Course Modules
              </h3>
              {renderedSubjects.length === 0 ? (
                <div className="text-center py-4 bg-slate-50 border border-dashed border-slate-200 rounded-xl">
                  <p className="text-[11px] text-slate-400 italic">No registered subjects found.</p>
                </div>
              ) : (
                <div className="flex flex-col gap-1.5">
                  {renderedSubjects.map((subject, idx) => (
                    <div
                      key={idx}
                      className="bg-slate-50 border border-slate-100 text-slate-700 px-3 py-2 rounded-xl text-xs font-medium flex items-center gap-2"
                    >
                      <span>📖</span>
                      {/* Handles array if it contains string text directly, or objects safely */}
                      <span className="truncate font-semibold uppercase tracking-wide text-[10px]">
                        {typeof subject === "object" ? subject?.name || JSON.stringify(subject) : subject}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

        </div>
      </div>

      {showImage && (
          <div
            className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
            onClick={() => setShowImage(false)}
          >
            <div className="relative">
              <button
                className="absolute -top-3 -right-3 bg-white rounded-full w-8 h-8 font-bold shadow"
                onClick={() => setShowImage(false)}
              >
                ✕
              </button>

              <img
                src={profile.profileImage}
                alt="Profile"
                className="max-h-[90vh] max-w-[90vw] rounded-xl shadow-2xl"
              />
            </div>
          </div>
        )}
    </div>
  );
}

