import { useEffect, useState } from "react";
import { getExams } from "../../api/exams.api";
import LoadingSkeleton from "../../components/ui/LoadingSkeleton";
import { toast } from "react-toastify";

const TeacherExams = () => {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getExams();
        setExams(res.data.exams || []);
      } catch {
        toast.error("Unable to fetch exams");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filtered = exams.filter((exam) => {
    const q = search.toLowerCase();
    return (
      exam.examName?.toLowerCase().includes(q) ||
      exam.subjectId?.subjectName?.toLowerCase().includes(q) ||
      exam.semester?.toString().includes(q)
    );
  });

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">

      {/* HEADER */}
      <div className="max-w-6xl mx-auto mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
          Exam Schedule
        </h1>
        <p className="text-gray-500">
          Review upcoming exams and share details with students
        </p>
      </div>

      {/* CONTENT CARD */}
      <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow p-6">

        {/* SEARCH */}
        <input
          type="text"
          placeholder="Search exams..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full border rounded-xl px-4 py-3 mb-6 focus:ring-2 focus:ring-blue-500 outline-none"
        />

        {/* LOADING */}
        {loading ? (
          <LoadingSkeleton rows={4} columns={1} />
        ) : filtered.length === 0 ? (
          <p className="text-gray-500">No exams found</p>
        ) : (
          <>
            {/* MOBILE CARDS */}
            <div className="grid gap-4 md:hidden">
              {filtered.map((exam) => (
                <div
                  key={exam._id}
                  className="border rounded-xl p-4 bg-white"
                >
                  <h3 className="font-semibold text-gray-900">
                    {exam.examName || "Untitled"}
                  </h3>

                  <p className="text-sm text-gray-500">
                    {exam.subjectId?.subjectName}
                  </p>

                  <div className="flex justify-between mt-2 text-sm text-gray-600">
                    <span>Sem {exam.semester}</span>
                    <span>
                      {new Date(exam.date).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* DESKTOP TABLE */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border">
                <thead className="bg-gray-100 text-gray-700">
                  <tr>
                    <th className="p-3">Exam</th>
                    <th className="p-3">Subject</th>
                    <th className="p-3">Semester</th>
                    <th className="p-3">Date</th>
                  </tr>
                </thead>

                <tbody>
                  {filtered.map((exam) => (
                    <tr
                      key={exam._id}
                      className="border-t hover:bg-gray-50"
                    >
                      <td className="p-3 font-medium">
                        {exam.examName || "Untitled"}
                      </td>
                      <td className="p-3">
                        {exam.subjectId?.subjectName || "Unknown"}
                      </td>
                      <td className="p-3">{exam.semester}</td>
                      <td className="p-3">
                        {new Date(exam.date).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default TeacherExams;