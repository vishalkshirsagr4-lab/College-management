import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../utils/api";

export default function StudentsPage() {
  const navigate = useNavigate();

  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedSemester, setSelectedSemester] = useState("All");

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
  try {
    setLoading(true);

    const res = await api.get("/api/admin/students");

    console.log("Fetched students:", res.data);

    if (res.data?.success) {
      setStudents(res.data.students || []);
    } else {
      setStudents([]);
    }
  } catch (error) {
    console.error("Failed to fetch students:", error);
    setStudents([]);
  } finally {
    setLoading(false);
  }
};

  // Get all semesters dynamically
  const semesters = useMemo(() => {
  const uniqueSemesters = [
    ...new Set(
      students
        .map((student) => Number(student.semester))
        .filter(Boolean)
    ),
  ];

  return uniqueSemesters.sort((a, b) => a - b);
}, [students]);

  // Search + Semester Filter
const filteredStudents = useMemo(() => {
  return students.filter((student) => {
    const matchesSearch =
      student.userID?.name
        ?.toLowerCase()
        .includes(search.toLowerCase()) || false;

    const matchesSemester =
      selectedSemester === "All"
        ? true
        : Number(student.semester) === Number(selectedSemester);

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
        onClick={() => navigate("/admin/students/create")}
        className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-blue-700 hover:shadow-md"
    >
        <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-5 w-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
        >
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 4v16m8-8H4"
        />
        </svg>

        Create Student
    </button>
    </div>

      {/* Semester Filters */}
      <div className="mb-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="mb-3 text-sm font-semibold text-slate-700">
            Filter By Semester
        </div>

        <div className="-mx-4 overflow-x-auto px-4">
            <div className="flex min-w-max gap-2 pb-1">
            <button
                onClick={() => setSelectedSemester("All")}
                className={`whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium transition ${
                selectedSemester === "All"
                    ? "bg-blue-600 text-white"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
            >
                All Students
            </button>

            {semesters.map((sem) => (
                <button
                key={sem}
                onClick={() => setSelectedSemester(sem)}
                className={`whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium transition ${
                    selectedSemester === sem
                    ? "bg-blue-600 text-white"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
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
        Showing{" "}
        <span className="font-semibold text-slate-900">
          {filteredStudents.length}
        </span>{" "}
        students
        {selectedSemester !== "All" && (
          <span> from Semester {selectedSemester}</span>
        )}
      </div>

      {/* Loading */}
      {loading && (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[...Array(8)].map((_, index) => (
            <div
              key={index}
              className="animate-pulse rounded-xl border border-slate-200 bg-white p-5"
            >
              <div className="mx-auto h-20 w-20 rounded-full bg-slate-200"></div>

              <div className="mt-4 h-4 rounded bg-slate-200"></div>
              <div className="mt-2 h-3 rounded bg-slate-200"></div>

              <div className="mt-5 h-10 rounded bg-slate-200"></div>
            </div>
          ))}
        </div>
      )}

      {/* No Students */}
      {!loading && filteredStudents.length === 0 && (
        <div className="rounded-xl border border-slate-200 bg-white p-10 text-center shadow-sm">
          <h2 className="text-lg font-semibold text-slate-800">
            No Students Found
          </h2>
          <p className="mt-2 text-slate-500">
            Try searching with another name or semester.
          </p>
        </div>
      )}

      {/* Students Grid */}
      {!loading && filteredStudents.length > 0 && (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredStudents.map((student) => (
  <div
    key={student._id}
    className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
  >
    <div className="flex flex-col items-center">
      <img
        src={
          student.profileImage ||
          `https://ui-avatars.com/api/?name=${encodeURIComponent(
            student.userID?.name || "Student"
          )}&background=random`
        }
        alt={student.userID?.name || "Student"}
        className="h-20 w-20 rounded-full border object-cover"
      />

      <h3 className="mt-3 text-lg font-semibold text-slate-900">
        {student.userID?.name || "N/A"}
      </h3>

      <p className="text-sm text-slate-500">
        {student.userID?.email || "No Email"}
      </p>
    </div>

    <div className="mt-5 space-y-3 text-sm">
      <div className="flex justify-between">
        <span className="text-slate-500">Department</span>
        <span className="font-medium text-slate-800">
          {student.department}
        </span>
      </div>

      <div className="flex justify-between">
        <span className="text-slate-500">Semester</span>
        <span className="font-medium text-slate-800">
          {student.semester}
        </span>
      </div>

      <div className="flex justify-between">
        <span className="text-slate-500">Roll No</span>
        <span className="font-medium text-slate-800">
          {student.rollNo}
        </span>
      </div>

      <div className="flex justify-between">
        <span className="text-slate-500">Login ID</span>
        <span className="font-medium text-slate-800">
          {student.loginID}
        </span>
      </div>

      <div className="flex justify-between">
        <span className="text-slate-500">Section</span>
        <span className="font-medium text-slate-800">
          {student.section}
        </span>
      </div>
    </div>

    <button
      onClick={() => navigate(`/admin/students/${student._id}`)}
      className="mt-5 w-full rounded-lg bg-blue-600 py-2.5 text-white transition hover:bg-blue-700"
    >
      View Details
    </button>
  </div>
))}
        </div>
      )}
    </div>
  );
}