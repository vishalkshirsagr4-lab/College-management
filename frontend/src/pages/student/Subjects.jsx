import { useEffect, useMemo, useState } from "react";
import { getStudentProfile, getSubjects, getAttendance } from "../../api/student.api";
import LoadingSkeleton from "../../components/ui/LoadingSkeleton";

const Subjects = () => {
  const [subjects, setSubjects] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [profileRes, subjectsRes] = await Promise.all([
          getStudentProfile(),
          getSubjects(),
        ]);

        const studentId = profileRes.data.student?._id;
        const semester = profileRes.data.student?.semester;

        const rawSubjects = subjectsRes.data.subjects || [];

        if (studentId) {
          const attendanceRes = await getAttendance(studentId);
          setAttendanceRecords(attendanceRes.data.attendance || []);
        }

        setSubjects(
          rawSubjects.filter((sub) => sub.semester === semester)
        );
      } catch {
        setSubjects([]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const attendanceBySubject = useMemo(() => {
    return attendanceRecords.reduce((acc, record) => {
      const subject = record.subjectId?.subjectName || "Unknown";

      if (!acc[subject]) {
        acc[subject] = { present: 0, total: 0 };
      }

      acc[subject].total += 1;

      if (record.status === "Present") {
        acc[subject].present += 1;
      }

      return acc;
    }, {});
  }, [attendanceRecords]);

  if (loading) {
    return (
      <div className="p-6">
        <LoadingSkeleton rows={3} columns={1} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* HEADER */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Subjects
          </h1>
          <p className="text-gray-500 mt-1">
            Your enrolled subjects and attendance overview
          </p>
        </div>

        {subjects.length === 0 ? (
          <div className="bg-white border rounded-xl p-6 text-gray-600">
            No subjects found for your semester.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">

            {subjects.map((subject) => {
              const stats =
                attendanceBySubject[subject.subjectName] || {
                  present: 0,
                  total: 0,
                };

              const rate =
                stats.total > 0
                  ? Math.round((stats.present / stats.total) * 100)
                  : 0;

              return (
                <div
                  key={subject._id}
                  className="bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition p-5 flex flex-col justify-between"
                >
                  {/* TOP */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {subject.subjectName}
                      </h3>

                      <span className="text-xs bg-gray-100 text-gray-700 px-3 py-1 rounded-full">
                        {subject.subjectCode}
                      </span>
                    </div>

                    <p className="text-sm text-gray-600">
                      Teacher:{" "}
                      <span className="font-medium">
                        {subject.teacherId?.name || "Not assigned"}
                      </span>
                    </p>

                    {/* ATTENDANCE */}
                    <div className="mt-4">
                      <p className="text-sm text-gray-500 mb-1">
                        Attendance
                      </p>

                      <div className="w-full bg-gray-100 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            rate >= 75
                              ? "bg-green-500"
                              : rate >= 50
                              ? "bg-yellow-500"
                              : "bg-red-500"
                          }`}
                          style={{ width: `${rate}%` }}
                        />
                      </div>

                      <p className="text-sm mt-2 font-semibold text-gray-700">
                        {rate}%
                      </p>
                    </div>
                  </div>

                  {/* BUTTON */}
                  <button className="mt-5 w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-xl transition">
                    View Details
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Subjects;