import { useEffect, useState, useMemo, useCallback } from "react";
import { Search, Mail, User, Layers, Calendar, BookOpen, X } from "lucide-react";
import api from "../../utils/api";

const BASE_URL = "http://localhost:5000";
const getImageUrl = (path) => {
  if (!path) return "/default-avatar.png";
  if (path.startsWith("http")) return path;
  return `${BASE_URL}${path.startsWith('/') ? '' : '/'}${path}`;
};

// Polished Skeleton Component for better visual feedback
const Skeleton = () => (
  <div className="animate-pulse space-y-6">
    <div className="flex justify-between items-center mb-8">
      <div className="space-y-2">
        <div className="h-8 w-56 bg-slate-200 rounded-lg"></div>
        <div className="h-4 w-40 bg-slate-200 rounded-lg"></div>
      </div>
      <div className="h-12 w-80 bg-slate-200 rounded-xl hidden md:block"></div>
    </div>
    {[1, 2].map((group) => (
      <div key={group} className="space-y-4">
        <div className="h-6 w-32 bg-slate-200 rounded-md"></div>
        <div className="bg-white rounded-2xl border border-slate-100 p-6 space-y-4 shadow-sm">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center justify-between py-3 border-b border-slate-50 last:border-0 last:pb-0">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-slate-200 rounded-full"></div>
                <div className="space-y-2">
                  <div className="h-4 w-32 bg-slate-200 rounded"></div>
                  <div className="h-3 w-48 bg-slate-100 rounded"></div>
                </div>
              </div>
              <div className="h-6 w-16 bg-slate-100 rounded-full"></div>
            </div>
          ))}
        </div>
      </div>
    ))}
  </div>
);

export default function FacultyStudentsPage() {
  const [students, setStudents] = useState([]);
  const [faculty, setFaculty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStudent, setSelectedStudent] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [studentsRes, facultyRes] = await Promise.all([
        api.get("/api/faculty/students"),
        api.get("/api/faculty/profile")
      ]);
      setStudents(Array.isArray(studentsRes.data?.data) ? studentsRes.data.data : []);
      setFaculty(facultyRes.data?.data || null);
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAvatarError = (e) => {
    e.target.src = '/default-avatar.png';
  };

  const groupedStudents = useMemo(() => {
    if (!faculty) return {};
    const groups = {};
    const term = searchTerm.toLowerCase().trim();
    const facultySubjects = faculty.teachingAssignments?.flatMap(a => a.subjects)
        .map(s => s.toLowerCase().trim()) || [];

    const filtered = students.filter(s => 
      (s.userID?.name?.toLowerCase() || "").includes(term) || 
      (s.userID?.email?.toLowerCase() || "").includes(term)
    );

    filtered.forEach((student) => {
      const sem = `Semester ${student.semester || "Unknown"}`;
      if (!groups[sem]) groups[sem] = {};
      const relevantSubjects = (Array.isArray(student.subjects) ? student.subjects : [])
        .filter(sub => facultySubjects.includes(sub.toLowerCase().trim()));
      
      const subjectList = relevantSubjects.length > 0 ? relevantSubjects : ["General / Unassigned"];
      
      subjectList.forEach((sub) => {
        if (!groups[sem][sub]) groups[sem][sub] = [];
        if (!groups[sem][sub].find(s => s._id === student._id)) {
          groups[sem][sub].push(student);
        }
      });
    });
    return groups;
  }, [students, searchTerm, faculty]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50/50 p-6 md:p-12 animate-fade-in">
        <div className="max-w-5xl mx-auto">
          <Skeleton />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 p-6 md:p-12 font-sans text-slate-600 antialiased">
      <div className="max-w-5xl mx-auto">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Classroom Registry</h1>
            <p className="text-slate-500 text-sm mt-1 font-medium">Monitor and manage your assigned students</p>
          </div>
          <div className="relative w-full md:w-80 shadow-sm rounded-xl">
            <span className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-slate-400">
              <Search size={18} />
            </span>
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-white text-slate-800 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all placeholder:text-slate-400 text-sm"
            />
          </div>
        </div>

        {/* Dynamic Groups Layout */}
        {Object.keys(groupedStudents).length === 0 ? (
          <div className="text-center py-24 bg-white rounded-2xl border border-slate-200/60 shadow-sm max-w-xl mx-auto px-6">
            <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
              <User size={24} />
            </div>
            <h3 className="text-base font-bold text-slate-800 mb-1">No matching students found</h3>
            <p className="text-slate-400 text-sm">Try adjusting your search keywords or parameters.</p>
          </div>
        ) : (
          Object.entries(groupedStudents).map(([sem, subjectsObj]) => (
            <div key={sem} className="mb-12">
              <div className="flex items-center gap-2 mb-4">
                <Layers className="text-blue-600" size={18} />
                <h2 className="text-lg font-bold text-slate-900">{sem}</h2>
              </div>
              
              {Object.entries(subjectsObj).map(([subject, studentList]) => (
                <div key={subject} className="bg-white rounded-2xl border border-slate-200/70 mb-6 shadow-sm overflow-hidden transition-all hover:border-slate-300/80">
                  <div className="bg-slate-50/70 border-b border-slate-100 px-6 py-3 text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                    <BookOpen size={14} className="text-slate-400" />
                    {subject}
                  </div>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="text-xs uppercase tracking-wider text-slate-400 bg-slate-50/30 border-b border-slate-100">
                          <th scope="col" className="px-6 py-3 font-semibold">Student Details</th>
                          <th scope="col" className="px-6 py-3 font-semibold hidden sm:table-cell">Email Address</th>
                          <th scope="col" className="px-6 py-3 font-semibold text-center">Section</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {studentList.map((s) => (
                          <tr 
                            key={s._id} 
                            onClick={() => setSelectedStudent(s)} 
                            className="hover:bg-blue-50/40 cursor-pointer transition-colors group"
                          >
                            <td className="px-6 py-4 flex items-center gap-4">
                              <img 
                                src={getImageUrl(s.profileImage)} 
                                onError={handleAvatarError} 
                                className="w-10 h-10 rounded-full object-cover ring-2 ring-white shadow-sm bg-slate-100 flex-shrink-0" 
                                alt={`${s.userID?.name || 'Student'}'s avatar`} 
                              />
                              <div>
                                <span className="font-semibold text-slate-800 block group-hover:text-blue-600 transition-colors">
                                  {s.userID?.name || "N/A"}
                                </span>
                                <span className="text-xs text-slate-400 sm:hidden block mt-0.5">{s.userID?.email}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-slate-500 font-medium hidden sm:table-cell">
                              {s.userID?.email || "—"}
                            </td>
                            <td className="px-6 py-4 text-center">
                              <span className="inline-flex px-2.5 py-1 bg-slate-100 text-slate-700 rounded-md text-xs font-bold tracking-wide uppercase">
                                {s.section || "—"}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          ))
        )}
      </div>

      {/* Drawer Overlay Backdrop */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div 
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity" 
            onClick={() => setSelectedStudent(null)} 
          />
          
          {/* Drawer Panel */}
          <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between overflow-y-auto animate-slide-in">
            <div>
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <span className="text-xs font-bold tracking-widest text-slate-400 uppercase">Profile Details</span>
                <button 
                  onClick={() => setSelectedStudent(null)} 
                  className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 rounded-lg transition-all"
                  aria-label="Close panel"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="p-8 flex flex-col items-center text-center border-b border-slate-100">
                <img 
                  src={getImageUrl(selectedStudent.profileImage)} 
                  onError={handleAvatarError}
                  className="w-24 h-24 rounded-full ring-4 ring-slate-100 shadow-md mb-4 object-cover bg-slate-50" 
                  alt={selectedStudent.userID?.name} 
                />
                <h2 className="text-xl font-bold text-slate-900">{selectedStudent.userID?.name || "N/A"}</h2>
                <p className="text-slate-400 text-sm mt-1 flex items-center gap-1.5">
                  <Mail size={14} />
                  {selectedStudent.userID?.email || "—"}
                </p>
              </div>

              {/* Attributes Section */}
              <div className="p-6 space-y-3">
                <div className="flex justify-between items-center p-3.5 bg-slate-50/70 rounded-xl border border-slate-100">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                    <Layers size={14} /> Section
                  </span>
                  <span className="font-bold text-slate-800 text-sm bg-white px-3 py-1 rounded-md border border-slate-200 shadow-2xs">
                    {selectedStudent.section || "—"}
                  </span>
                </div>
                
                <div className="flex justify-between items-center p-3.5 bg-slate-50/70 rounded-xl border border-slate-100">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                    <Calendar size={14} /> Semester
                  </span>
                  <span className="font-bold text-slate-800 text-sm bg-white px-3 py-1 rounded-md border border-slate-200 shadow-2xs">
                    {selectedStudent.semester || "—"}
                  </span>
                </div>

                {/* Subject Badges Container */}
                <div className="mt-6 pt-4 border-t border-slate-100">
                  <p className="text-xs font-bold tracking-wider text-slate-400 uppercase mb-3 flex items-center gap-2">
                    <BookOpen size={14} /> Registered Subjects
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedStudent.subjects && selectedStudent.subjects.length > 0 ? (
                      selectedStudent.subjects.map((sub) => (
                        <span 
                          key={sub} 
                          className="px-3 py-1 bg-blue-50/60 border border-blue-100 text-blue-700 rounded-lg text-xs font-semibold"
                        >
                          {sub}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-slate-400 italic">No registered subjects found.</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100">
              <button 
                onClick={() => setSelectedStudent(null)}
                className="w-full bg-white text-slate-700 hover:bg-slate-100 font-bold text-sm py-2.5 rounded-xl border border-slate-200 transition-colors shadow-2xs"
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}