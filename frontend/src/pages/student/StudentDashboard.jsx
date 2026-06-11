import React, { useState, useEffect } from 'react';
import { api } from '../../utils/api';
import { toast } from 'react-toastify';

export default function StudentDashboard() {
  const [activeTab, setActiveTab] = useState('Profile');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [data, setData] = useState({ Profile: null, Timetable: {}, Exams: [], Assignments: [], Attendance: null });
  const [loading, setLoading] = useState(false);

  const tabs = ['Profile', 'Timetable', 'Exams', 'Assignments', 'Attendance'];

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const endpoints = {
        'Profile': '/api/student/profile',
        'Timetable': '/api/student/timetable',
        'Exams': '/api/student/exams',
        'Assignments': '/api/student/assignment/my',
        'Attendance': '/api/student/attendance/my'
      };
      const res = await api.get(endpoints[activeTab]);
      setData(prev => ({ ...prev, [activeTab]: res.data.data }));
    } catch (err) {
      toast.error(`Could not load ${activeTab}`);
    } finally {
      setLoading(false);
    }
  };

  function DetailRow({ label, value }) {
    return (
      <div className="flex justify-between text-sm">
        <span className="text-slate-500">{label}</span>
        <span className="font-semibold text-slate-800">{value || 'N/A'}</span>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans">
      {/* MOBILE OVERLAY */}
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setIsSidebarOpen(false)} />
      )}

      {/* SIDEBAR */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-white p-6 transform transition-transform duration-300 md:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <h2 className="text-2xl font-bold mb-8 text-indigo-400">Student Portal</h2>
        <nav className="space-y-2">
          {tabs.map(tab => (
            <button key={tab} onClick={() => { setActiveTab(tab); setIsSidebarOpen(false); }}
              className={`w-full text-left p-3 rounded-lg transition-all ${activeTab === tab ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
              {tab}
            </button>
          ))}
        </nav>
      </aside>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white shadow-sm p-4 flex items-center justify-between md:hidden">
          <button onClick={() => setIsSidebarOpen(true)} className="p-2 text-2xl">☰</button>
          <h1 className="font-bold text-lg">{activeTab}</h1>
          <div className="w-8"></div>
        </header>

        <main className="p-4 md:p-8">
          {loading ? (
            <div className="text-center py-10 text-slate-500">Loading {activeTab}...</div>
          ) : (
            <div className="max-w-4xl mx-auto">
              
              {/* PROFILE */}
              {activeTab === 'Profile' && data.Profile && (
                <div className="space-y-8">
                  <div className="flex flex-col md:flex-row items-center gap-6 bg-white p-6 rounded-xl border border-slate-200">
                    <img src={data.Profile.profileImage || '/default-avatar.png'} alt="Profile" className="w-32 h-32 rounded-full object-cover border-4 border-indigo-100" />
                    <div className="text-center md:text-left">
                      <h2 className="text-2xl font-bold">{data.Profile.name}</h2>
                      <p className="text-indigo-600 font-semibold">{data.Profile.department}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                      <h3 className="font-bold mb-4 border-b pb-2">Personal Information</h3>
                      <div className="space-y-3"><DetailRow label="Login ID" value={data.Profile.loginID} /><DetailRow label="Phone" value={data.Profile.phone} /></div>
                    </div>
                  </div>
                </div>
              )}

              {/* TIMETABLE */}
              {activeTab === 'Timetable' && (
                <div className="space-y-6">
                  {Object.entries(data.Timetable || {}).map(([day, periods]) => (
                    <div key={day} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                      <div className="bg-slate-900 px-5 py-3 text-white font-bold uppercase text-sm">{day}</div>
                      <div className="divide-y divide-slate-100">
                        {periods.sort((a,b) => a.timeSlot.localeCompare(b.timeSlot)).map((cls, i) => (
                          <div key={i} className="px-5 py-4 flex gap-4">
                            <span className="bg-indigo-50 text-indigo-700 px-2 py-1 rounded text-xs font-bold">{cls.timeSlot}</span>
                            <div><p className="font-bold text-slate-800">{cls.subject}</p><p className="text-xs text-slate-500">Room: {cls.roomNumber}</p></div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* EXAMS */}
              {activeTab === 'Exams' && (
                <div className="grid gap-4">
                  {data.Exams.map((ex, i) => (
                    <div key={i} className="bg-white border rounded-xl p-5 shadow-sm">
                      <h3 className="font-bold text-lg">{ex.name}</h3>
                      <p className="text-xs text-slate-500 mb-4">{new Date(ex.examDate).toLocaleDateString()}</p>
                      <button className="w-full bg-slate-900 text-white py-2 rounded-lg text-sm">View Result</button>
                    </div>
                  ))}
                </div>
              )}

              {/* ASSIGNMENTS */}
              {activeTab === 'Assignments' && (
                <div className="grid gap-4">
                  {data.Assignments.map((a, i) => (
                    <div key={i} className="bg-white border rounded-xl p-5 shadow-sm">
                      <h3 className="font-bold text-lg">{a.title}</h3>
                      <p className="text-sm text-slate-600 mb-4">{a.description}</p>
                      <p className="text-xs text-rose-500 font-bold">Due: {new Date(a.dueDate).toLocaleDateString()}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* ATTENDANCE */}
              {activeTab === 'Attendance' && data.Attendance && (
                <div className="space-y-6">
                  <div className="bg-indigo-900 text-white p-6 rounded-2xl">
                    <p className="text-indigo-200 text-xs uppercase">Overall Attendance</p>
                    <h2 className="text-4xl font-black">{data.Attendance.percentage}%</h2>
                  </div>
                  {data.Attendance.subjects.map((sub, i) => (
                    <div key={i} className="bg-white p-5 rounded-xl border">
                      <div className="flex justify-between mb-2"><span className="font-bold">{sub.subjectName}</span><span>{sub.percentage}%</span></div>
                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden"><div className="h-full bg-emerald-500" style={{ width: `${sub.percentage}%` }}></div></div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}