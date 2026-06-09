import Card from '../../components/ui/Card';

export default function StudentDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Student Dashboard</h1>
        <p className="text-sm text-slate-600 mt-1">Attendance progress, assignments & results</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="p-5">
          <div className="text-sm text-slate-500">Attendance</div>
          <div className="mt-2 text-3xl font-bold text-slate-900">87%</div>
          <div className="mt-3 text-sm text-slate-600">This semester</div>
        </Card>
        <Card className="p-5">
          <div className="text-sm text-slate-500">Assignments</div>
          <div className="mt-2 text-3xl font-bold text-slate-900">5</div>
          <div className="mt-3 text-sm text-slate-600">Pending submissions</div>
        </Card>
        <Card className="p-5">
          <div className="text-sm text-slate-500">CGPA</div>
          <div className="mt-2 text-3xl font-bold text-slate-900">8.4</div>
          <div className="mt-3 text-sm text-slate-600">Last term</div>
        </Card>
      </div>

      <Card className="p-5">
        <div className="text-sm font-medium text-slate-900">Your next up</div>
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {['Timetable today', 'Next exam', 'Latest notification'].map((t) => (
            <div key={t} className="rounded-lg border border-border bg-white p-4">
              <div className="text-sm text-slate-700">{t}</div>
              <div className="text-xs text-slate-500 mt-1">(placeholder)</div>
            </div>
          ))}
          <div className="rounded-lg border border-border bg-white p-4 sm:col-span-2 lg:col-span-1">
            <div className="text-sm font-medium text-slate-800">Quick actions</div>
            <div className="mt-2 text-sm text-slate-600">View Attendance, Assignments, Exams, Results</div>
          </div>
        </div>
      </Card>
    </div>
  );
}

