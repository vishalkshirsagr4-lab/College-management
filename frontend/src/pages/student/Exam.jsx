import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../../utils/api";

export default function StudentExamDetailsPage() {
  const { examId } = useParams(); // Matches route path: /exams/:examId
  const [examData, setExamData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeUnitTab, setActiveUnitTab] = useState({});

  useEffect(() => {
    const fetchExamDetails = async () => {
      try {
        setLoading(true);
        setError("");
        
        // Hits backend route: router.get("/exams/:examId", authMiddleware, getExamDetails);
        // Note: Your backend route defines parameter as :examId but destructures { id } = req.params;
        // Make sure your backend maps the naming properly.
        const res = await api.get(`/api/student/exams/${examId}`);

        if (res.data?.success) {
          setExamData(res.data.data);
        }
      } catch (err) {
        console.error("Exam Details fetch error:", err);
        setError(err.response?.data?.message || "Operational failure parsing exam structural data.");
      } finally {
        setLoading(false);
      }
    };

    if (examId) fetchExamDetails();
  }, [examId]);

  // UI Toggle helper for drilling down into unit syllabus fields
  const toggleUnitDropdown = (subjectIdx, unitIdx) => {
    const key = `${subjectIdx}-${unitIdx}`;
    setActiveUnitTab((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  if (loading) {
    return (
      <div className="w-full h-96 flex items-center justify-center p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto mb-3"></div>
          <p className="text-xs text-slate-400 font-bold tracking-wider uppercase">Compiling Exam Metrics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full p-6 flex items-center justify-center">
        <div className="bg-white max-w-md w-full border border-rose-200 rounded-2xl p-6 text-center shadow-sm">
          <div className="text-2xl mb-2">⚠️</div>
          <h3 className="text-sm font-bold text-slate-900">Query Exception</h3>
          <p className="text-slate-500 text-xs mt-1 font-medium">{error}</p>
          <Link to="/student/exams" className="mt-4 inline-block text-xs font-semibold text-blue-600 hover:underline">
            ← Back to Exams
          </Link>
        </div>
      </div>
    );
  }

  const exam = examData?.exam || {};
  const subjects = examData?.subjects || [];

  // Visual utility styling logic matching backend Enum values
  const statusBadges = {
    upcoming: "bg-blue-50 text-blue-700 border-blue-200",
    ongoing: "bg-amber-50 text-amber-700 border-amber-200 animate-pulse",
    completed: "bg-slate-100 text-slate-600 border-slate-200",
  };

  return (
    <div className="w-full p-4 lg:p-6 font-sans text-slate-700 antialiased box-border">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Navigation Breadcrumbs */}
        <div className="text-xs text-slate-400 font-medium flex items-center gap-2">
          <Link to="/student" className="hover:text-slate-600">Dashboard</Link>
          <span>/</span>
          <Link to="/student/exams" className="hover:text-slate-600">Exams</Link>
          <span>/</span>
          <span className="text-slate-600 font-semibold">Blueprint Layout</span>
        </div>

        {/* Master Header Block */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                {exam.examName || "Examination Assignment"}
              </h1>
              <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase border tracking-wider ${statusBadges[exam.status] || "bg-slate-50"}`}>
                {exam.status || "Unknown State"}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1 font-medium uppercase tracking-wide">
              Course Scope: {exam.department} <span className="text-slate-200 mx-1">•</span> Semester {exam.semester}
            </p>
          </div>

          <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 text-left md:text-right w-full md:w-auto shrink-0">
            <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider">Commencement Date</span>
            <span className="text-xs font-bold text-slate-800 mt-0.5 block">
              {exam.examDate ? new Date(exam.examDate).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' }) : "Not Specified"}
            </span>
          </div>
        </div>

        <h2 className="text-xs font-black text-slate-900 uppercase tracking-widest pt-2">
          📋 Registered Course Assessment Blueprints ({subjects.length})
        </h2>

        {/* Subjects & Syllabus Pipeline Container */}
        {subjects.length === 0 ? (
          <div className="text-center py-12 bg-white border border-slate-200 rounded-2xl shadow-sm">
            <p className="text-xs text-slate-400 italic">No faculty modules or syllabi structures have been mapped to this exam block yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {subjects.map((item, subIdx) => (
              <div key={item._id || subIdx} className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col">
                
                {/* Subject Sub-header */}
                <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row justify-between gap-3 items-start sm:items-center">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide flex items-center gap-2">
                      <span>📖</span> {item.subject}
                    </h3>
                    <p className="text-[11px] text-slate-400 mt-0.5 font-medium">
                      Assigned Supervisor: <span className="text-slate-600">{item.facultyId?.designation || "Faculty Inspector"}</span> ({item.facultyId?.department || "General"})
                    </p>
                  </div>
                </div>

                {/* Syllabus Curriculum Block Layout */}
                <div className="p-5 flex-1 space-y-4">
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Curriculum Syllabus Mapping Matrix
                  </h4>

                  {!item.syllabus || item.syllabus.length === 0 ? (
                    <p className="text-xs text-slate-400 italic bg-slate-50/50 p-3 rounded-xl border border-dashed border-slate-200">
                      Syllabus curriculum contents have not been distributed for review yet.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {item.syllabus.map((section, unitIdx) => {
                        const isOpen = activeUnitTab[`${subIdx}-${unitIdx}`];
                        return (
                          <div key={section._id || unitIdx} className="border border-slate-100 rounded-xl overflow-hidden bg-white">
                            
                            {/* Accordion Toggle Action Header */}
                            <button
                              onClick={() => toggleUnitDropdown(subIdx, unitIdx)}
                              type="button"
                              className="w-full px-4 py-3 bg-slate-50/30 hover:bg-slate-50 flex items-center justify-between text-left transition-colors"
                            >
                              <span className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                                🔗 {section.unit || `Structural Unit Block ${unitIdx + 1}`}
                              </span>
                              <span className="text-xs text-slate-400">{isOpen ? "▲" : "▼"}</span>
                            </button>

                            {/* Accordion Leaf Chapter List */}
                            {isOpen && (
                              <div className="p-4 bg-white border-t border-slate-50 text-xs space-y-2.5">
                                {!section.chapters || section.chapters.length === 0 ? (
                                  <p className="text-slate-400 italic text-[11px]">No categorical chapters declared inside unit runtime.</p>
                                ) : (
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    {section.chapters.map((chapter, chapIdx) => (
                                      <div key={chapIdx} className="flex items-center gap-2 bg-slate-50/50 p-2 rounded-lg border border-slate-100">
                                        <span className="text-blue-500 font-bold">•</span>
                                        <span className="text-slate-600 font-medium text-[11px] truncate">{chapter}</span>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            )}

                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}