import { useEffect, useState } from "react";
import { getTeacherSubjects } from "../../api/teacher.api";
import LoadingSkeleton from "../../components/ui/LoadingSkeleton";
import { toast } from "react-toastify";

const MySubjects = () => {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const response = await getTeacherSubjects();
        setSubjects(response.data.subjects || []);
      } catch {
        toast.error("Unable to fetch assigned subjects.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* HEADER */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            My Subjects
          </h1>
          <p className="text-gray-500 mt-1">
            Subjects assigned to your teacher account
          </p>
        </div>

        {/* CONTENT */}
        {loading ? (
          <LoadingSkeleton rows={4} columns={1} />
        ) : subjects.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm p-6 text-gray-500">
            You do not have any assigned subjects yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

            {subjects.map((subject) => (
              <div
                key={subject._id}
                className="bg-white rounded-2xl shadow-sm p-6 hover:shadow-md transition"
              >
                <h3 className="text-lg font-semibold text-gray-900">
                  {subject.subjectName}
                </h3>

                <p className="text-sm text-gray-500 mt-1">
                  Code:{" "}
                  <span className="font-medium text-gray-700">
                    {subject.subjectCode}
                  </span>
                </p>

                <div className="mt-4 space-y-1 text-sm text-gray-600">
                  <p>
                    <span className="font-medium text-gray-700">
                      Semester:
                    </span>{" "}
                    {subject.semester}
                  </p>

                  <p>
                    <span className="font-medium text-gray-700">
                      Department:
                    </span>{" "}
                    {subject.department || "N/A"}
                  </p>
                </div>
              </div>
            ))}

          </div>
        )}
      </div>
    </div>
  );
};

export default MySubjects;