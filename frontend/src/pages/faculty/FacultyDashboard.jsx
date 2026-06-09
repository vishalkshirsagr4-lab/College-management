import Card from '../../components/ui/Card';

export default function FacultyDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Faculty Dashboard</h1>
        <p className="text-sm text-slate-600 mt-1">My subjects, attendance & assignments</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="p-5">
          <div className="text-sm text-slate-500">Subjects</div>
          <div className="mt-2 text-3xl font-bold text-slate-900">8</div>
          <div className="mt-3 text-sm text-slate-600">Updated today</div>
        </Card>
        <Card className="p-5">
          <div className="text-sm text-slate-500">Attendance Rate</div>
          <div className="mt-2 text-3xl font-bold text-slate-900">91%</div>
          <div className="mt-3 text-sm text-slate-600">Morning + Afternoon</div>
        </Card>
        <Card className="p-5">
          <div className="text-sm text-slate-500">Assignments</div>
          <div className="mt-2 text-3xl font-bold text-slate-900">12</div>
          <div className="mt-3 text-sm text-slate-600">Due this week</div>
        </Card>
      </div>

      <Card className="p-5">
        <div className="text-sm font-medium text-slate-900">Quick actions</div>
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[
            'Take attendance',
            'Create assignment',
            'Enter marks',
            'Publish exam details',
            'View notifications',
            'Update syllabus',
          ].map((t) => (
            <div key={t} className="rounded-lg border border-border bg-white p-4">
              <div className="text-sm text-slate-700">{t}</div>
              <div className="text-xs text-slate-500 mt-1">(placeholder)</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

