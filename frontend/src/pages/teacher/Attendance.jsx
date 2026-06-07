import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getTeacherSubjects } from "../../api/teacher.api";
import { getTodaysClasses } from "../../api/timetable.api";

const Attendance = () => {
  const [subjects, setSubjects] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [subjectsRes, classesRes] = await Promise.all([
          getTeacherSubjects(),
          getTodaysClasses(),
        ]);

        setSubjects(subjectsRes.data.subjects || []);
        setClasses(classesRes.data.classes || []);
      } catch {
        setSubjects([]);
        setClasses([]);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">

      {/* HEADER */}
      <div className="max-w-6xl mx-auto mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
          Attendance Workflow
        </h1>
        <p className="text-gray-500">
          Use your timetable and assigned subjects to take attendance correctly
        </p>
      </div>

      {/* GRID */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* LEFT: SUBJECTS */}
        <div className="bg-white rounded-2xl shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-1">
            Assigned Subjects
          </h2>
          <p className="text-gray-500 text-sm mb-4">
            Subjects currently assigned to you
          </p>

          {loading ? (
            <p className="text-gray-500">Loading subjects...</p>
          ) : subjects.length === 0 ? (
            <p className="text-gray-500">No assigned subjects found</p>
          ) : (
            <div className="space-y-3">
              {subjects.map((subject) => (
                <div
                  key={subject._id}
                  className="border rounded-xl p-4 hover:bg-gray-50 transition"
                >
                  <h3 className="font-semibold text-gray-900">
                    {subject.subjectName}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {subject.subjectCode} · Semester {subject.semester}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* RIGHT: CLASSES */}
        <div className="bg-white rounded-2xl shadow p-6">

          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Today's Classes
              </h2>
              <p className="text-gray-500 text-sm">
                Open class to take attendance
              </p>
            </div>

            <Link
              to="/teacher/attendance/today"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm"
            >
              View Today
            </Link>
          </div>

          {loading ? (
            <p className="text-gray-500">Loading classes...</p>
          ) : classes.length === 0 ? (
            <p className="text-gray-500">No classes scheduled today</p>
          ) : (
            <div className="space-y-3">
              {classes.map((item) => (
                <div
                  key={item._id}
                  className="border rounded-xl p-4 flex items-center justify-between hover:bg-gray-50"
                >
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {item.subjectId?.subjectName || "Subject"}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {item.subjectId?.subjectCode || "Code"}
                    </p>
                    <p className="text-sm text-gray-500">
                      Semester {item.semester} · Section {item.section}
                    </p>
                  </div>

                  <Link
                    to={`/teacher/attendance/take/${item._id}`}
                    className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg text-sm"
                  >
                    Take
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Attendance;