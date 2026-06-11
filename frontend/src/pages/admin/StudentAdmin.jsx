import { useEffect, useMemo, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../utils/api";

export default function StudentsPage() {
  const navigate = useNavigate();

  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedSemester, setSelectedSemester] = useState("All");
  
  // Interactive UI Modal States
  const [activeImage, setActiveImage] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  
  // Custom UI Deletion Confirmation State
  const [deleteConfirmation, setDeleteConfirmation] = useState({
    isOpen: false,
    studentId: null,
    studentName: "",
  });

  const fetchStudents = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get("/api/admin/students");
      console.log("Fetched response payload:", res);

      const responseData = res.data || res; 
      
      if (responseData && (responseData.success || responseData.students)) {
        const extractedStudents = 
          responseData.students || 
          responseData.data?.students || 
          (Array.isArray(responseData) ? responseData : []);
          
        setStudents(extractedStudents);
      } else {
        setStudents([]);
      }
    } catch (error) {
      console.error("Failed to fetch students:", error);
      setStudents([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  // Triggers the custom UI overlay state rather than a browser alert window
  const requestDeleteConfig = (studentId, studentName) => {
    setDeleteConfirmation({
      isOpen: true,
      studentId,
      studentName,
    });
  };

  const closeDeleteModal = () => {
    setDeleteConfirmation({
      isOpen: false,
      studentId: null,
      studentName: "",
    });
  };

  // Execution call made from inside the customized UI overlay confirmation button
  const handleConfirmedDelete = async () => {
    const targetId = deleteConfirmation.studentId;
    if (!targetId) return;

    try {
      setDeletingId(targetId);
      closeDeleteModal(); // Instantly hide confirm modal window for positive UX responsive feedback

      const res = await api.delete(`/api/admin/student/${targetId}`);
      
      if (res.data?.success || res.success) {
        setStudents((prev) => prev.filter((s) => s._id !== targetId && s.id !== targetId));
      } else {
        alert(res.data?.message || "Failed to remove the student record.");
      }
    } catch (err) {
      console.error("Error deleting student:", err);
      alert(err.response?.data?.message || "Internal server error during deletion.");
    } finally {
      setDeletingId(null);
    }
  };

  const semesters = useMemo(() => {
    if (!Array.isArray(students)) return [];
    
    const uniqueSemesters = [
      ...new Set(
        students
          .map((student) => student?.semester ? Number(student.semester) : null)
          .filter(Boolean)
      ),
    ];

    return uniqueSemesters.sort((a, b) => a - b);
  }, [students]);

  const filteredStudents = useMemo(() => {
    if (!Array.isArray(students)) return [];

    return students.filter((student) => {
      const matchesSearch =
        student?.userID?.name
          ?.toLowerCase()
          .includes(search.toLowerCase()) || false;

      const matchesSemester =
        selectedSemester === "All"
          ? true
          : Number(student?.semester) === Number(selectedSemester);

      return matchesSearch && matchesSemester;
    });
  }, [students, search, selectedSemester]);

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-6">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Students Management
          </h1>
          <p className="mt-1 text-slate-500">
            View and manage all student records
          </p>
        </div>

        <button
          onClick={() => navigate("/admin/student/create")}
          className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-blue-700 hover:shadow-md"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Create Student
        </button>
      </div>

      {/* Semester Filters */}
      <div className="mb-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="mb-3 text-sm font-semibold text-slate-700">Filter By Semester</div>
        <div className="-mx-4 overflow-x-auto px-4">
          <div className="flex min-w-max gap-2 pb-1">
            <button
              onClick={() => setSelectedSemester("All")}
              className={`whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium transition ${
                selectedSemester === "All" ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              All Students
            </button>

            {semesters.map((sem) => (
              <button
                key={sem}
                onClick={() => setSelectedSemester(sem)}
                className={`whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium transition ${
                  selectedSemester === sem ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                Semester {sem}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="mb-6 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <input
          type="text"
          placeholder="Search students by name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-lg border border-slate-300 px-4 py-3 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Count */}
      <div className="mb-4 text-sm text-slate-500">
        Showing <span className="font-semibold text-slate-900">{filteredStudents.length}</span> students
        {selectedSemester !== "All" && <span> from Semester {selectedSemester}</span>}
      </div>

      {/* Loading Skeleton */}
      {loading && (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[...Array(8)].map((_, index) => (
            <div key={index} className="animate-pulse rounded-xl border border-slate-200 bg-white p-5">
              <div className="mx-auto h-20 w-20 rounded-full bg-slate-200"></div>
              <div className="mt-4 h-4 rounded bg-slate-200"></div>
              <div className="mt-2 h-3 rounded bg-slate-200"></div>
              <div className="mt-5 h-10 rounded bg-slate-200"></div>
            </div>
          ))}
        </div>
      )}

      {/* No Students Found State */}
      {!loading && filteredStudents.length === 0 && (
        <div className="rounded-xl border border-slate-200 bg-white p-10 text-center shadow-sm">
          <h2 className="text-lg font-semibold text-slate-800">No Students Found</h2>
          <p className="mt-2 text-slate-500">Try searching with another name or semester.</p>
        </div>
      )}

      {/* Students Grid */}
      {!loading && filteredStudents.length > 0 && (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredStudents.map((student) => {
            const currentId = student._id || student.id;
            const fallbackAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(student.userID?.name || "Student")}&background=random`;
            const imageToShow = student.profileImage || fallbackAvatar;
            const studentName = student.userID?.name || "Selected Student";

            return (
              <div
                key={currentId}
                className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
              >
                <div>
                  <div className="flex flex-col items-center">
                    {/* Interactive Profile Picture */}
                    <button 
                      onClick={() => setActiveImage({ url: imageToShow, name: studentName })}
                      title="Click to expand view"
                      className="group relative h-20 w-20 overflow-hidden rounded-full border transition active:scale-95"
                    >
                      <img
                        src={imageToShow}
                        alt={studentName}
                        className="h-full w-full object-cover transition duration-200 group-hover:brightness-75"
                      />
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
                        </svg>
                      </div>
                    </button>

                    <h3 className="mt-3 text-center text-lg font-semibold text-slate-900 line-clamp-1">
                      {studentName}
                    </h3>

                    <p className="text-sm text-slate-500 line-clamp-1">
                      {student.userID?.email || "No Email"}
                    </p>
                  </div>

                  <div className="mt-5 space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Department</span>
                      <span className="font-medium text-slate-800">{student.department || "N/A"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Semester</span>
                      <span className="font-medium text-slate-800">{student.semester || "N/A"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Roll No</span>
                      <span className="font-medium text-slate-800">{student.rollNo || "N/A"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Login ID</span>
                      <span className="font-medium text-slate-800">{student.loginID || "N/A"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Section</span>
                      <span className="font-medium text-slate-800">{student.section || "N/A"}</span>
                    </div>
                  </div>
                </div>

                {/* Actions Row */}
                <div className="mt-5 flex gap-2">
                  <button
                    onClick={() => navigate(`/admin/students/${currentId}`)}
                    className="flex-1 rounded-lg bg-blue-600 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
                  >
                    View Details
                  </button>
                  <button
                    disabled={deletingId === currentId}
                    onClick={() => requestDeleteConfig(currentId, studentName)}
                    className="rounded-lg bg-red-50 p-2 text-red-600 transition hover:bg-red-100 disabled:opacity-50"
                    title="Delete Student"
                  >
                    {deletingId === currentId ? (
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-red-600 border-t-transparent" />
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-4v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Profile Picture Maximized Modal */}
      {activeImage && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 transition-opacity duration-300"
          onClick={() => setActiveImage(null)}
        >
          <div className="relative max-w-md w-full overflow-hidden rounded-2xl bg-white p-3 shadow-2xl scale-100 transition-transform duration-300" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="font-semibold text-slate-800 text-sm">{activeImage.name}'s Profile Picture</span>
              <button 
                onClick={() => setActiveImage(null)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 4.293z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
            <div className="mt-3 flex justify-center bg-slate-50 rounded-xl overflow-hidden aspect-square">
              <img 
                src={activeImage.url} 
                alt="Profile Preview" 
                className="h-full w-full object-contain"
              />
            </div>
          </div>
        </div>
      )}

      {/* UI/UX Custom Confirmation Modal for Deletion */}
      {deleteConfirmation.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop Layer */}
          <div 
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
            onClick={closeDeleteModal}
          />
          
          {/* Alert Content Window */}
          <div className="relative z-10 w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 shadow-xl transition-all scale-100 border border-slate-100">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              
              <div className="flex-1">
                <h3 className="text-xl font-bold text-slate-900">
                  Delete Student Profile?
                </h3>
                <p className="mt-2 text-sm text-slate-500 leading-relaxed">
                  Are you sure you want to permanently remove <span className="font-semibold text-slate-800">{deleteConfirmation.studentName}</span> from the database? This will clear their user account, portal data, and S3 assets. This action is irreversible.
                </p>
              </div>
            </div>

            {/* Custom CTA Action Drawer */}
            <div className="mt-6 flex justify-end gap-3 border-t border-slate-100 pt-4">
              <button
                type="button"
                onClick={closeDeleteModal}
                className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 active:bg-slate-100 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmedDelete}
                className="rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-red-700 active:bg-red-800 transition"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}