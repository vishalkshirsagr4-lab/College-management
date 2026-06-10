import React, { useState, useMemo, useEffect } from 'react';

// --- SVGs for Icons (No dependencies) ---
const MenuIcon = () => <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M4 6h16M4 12h16M4 18h16"/></svg>;
const UserIcon = () => <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M6 21v-2a4 4 0 014-4h4a4 4 0 014 4v2"/></svg>;

export default function KLEFacultyPortal({ initialSubjects = [] }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('assignments');
  
  // States for Assignment Manager
  const [selectedSemester, setSelectedSemester] = useState(null);
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [section, setSection] = useState("");
  const [assignments, setAssignments] = useState([]);

  // Logic
  const selectedSemesterData = useMemo(() => 
    initialSubjects.find(s => s.semester === selectedSemester), 
    [selectedSemester, initialSubjects]
  );

  const mergedSubjects = useMemo(() => {
    if (!selectedSemesterData) return [];
    return [...selectedSemesterData.corSubjects, ...selectedSemesterData.language];
  }, [selectedSemesterData]);

  const handleAddAssignment = () => {
    if (!selectedSemester || !section) return;
    setAssignments([...assignments, {
      department: selectedSemesterData.department,
      semester: selectedSemester,
      section,
      subjects: selectedSubjects
    }]);
    setSelectedSubjects([]);
    setSection("");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className={`fixed z-50 w-64 h-full bg-white border-r transition-transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
        <div className="p-6 font-bold text-xl text-blue-600">KLE Portal</div>
        <nav className="px-4 space-y-2">
          {['assignments', 'students', 'timetable'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`w-full text-left p-3 rounded-lg capitalize ${activeTab === tab ? 'bg-blue-600 text-white' : 'hover:bg-blue-50'}`}>
              {tab}
            </button>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 md:ml-64">
        <header className="bg-white p-4 flex items-center border-b">
          <button className="md:hidden mr-4" onClick={() => setSidebarOpen(!sidebarOpen)}><MenuIcon /></button>
          <h2 className="font-semibold text-lg">Faculty Dashboard</h2>
        </header>

        <main className="p-6">
          {activeTab === 'assignments' && (
            <div className="max-w-4xl mx-auto space-y-6">
              {/* Semester Selectors */}
              <div className="flex flex-wrap gap-2">
                {initialSubjects.map(s => (
                  <button key={s.semester} onClick={() => { setSelectedSemester(s.semester); setSelectedSubjects([]); }} className={`px-4 py-2 rounded ${selectedSemester === s.semester ? 'bg-blue-600 text-white' : 'bg-white border'}`}>
                    Sem {s.semester}
                  </button>
                ))}
              </div>

              {/* Subject Form */}
              {selectedSemesterData && (
                <div className="bg-white p-6 rounded-xl shadow-sm border space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <input disabled value={selectedSemesterData.department} className="p-2 border rounded bg-gray-50" />
                    <input placeholder="Enter Section (e.g. A)" value={section} onChange={e => setSection(e.target.value)} className="p-2 border rounded" />
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {mergedSubjects.map(sub => (
                      <label key={sub} className="flex items-center gap-2 p-2 border rounded hover:bg-gray-50 cursor-pointer">
                        <input type="checkbox" checked={selectedSubjects.includes(sub)} onChange={() => setSelectedSubjects(prev => prev.includes(sub) ? prev.filter(s => s !== sub) : [...prev, sub])} />
                        {sub}
                      </label>
                    ))}
                  </div>
                  <button onClick={handleAddAssignment} className="w-full bg-blue-600 text-white py-2 rounded">Add Assignment</button>
                </div>
              )}

              {/* List */}
              <div className="grid gap-3">
                {assignments.map((a, i) => (
                  <div key={i} className="bg-white p-4 rounded border flex justify-between">
                    <div><strong>{a.department} - Sem {a.semester} ({a.section})</strong><p className="text-sm text-gray-500">{a.subjects.join(', ')}</p></div>
                    <button onClick={() => setAssignments(assignments.filter((_, idx) => idx !== i))} className="text-red-500">Delete</button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}