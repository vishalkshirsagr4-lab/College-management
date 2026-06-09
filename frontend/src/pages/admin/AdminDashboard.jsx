import { lazy, Suspense } from 'react';
import Card from '../../components/ui/Card';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

const AnalyticsChart = lazy(() => import('../../components/Charts/AnalyticsChart'));

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Admin Dashboard</h1>
        <p className="text-sm text-slate-600 mt-1">Analytics overview & quick actions</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="p-5">
          <div className="text-sm text-slate-500">Total Students</div>
          <div className="mt-2 text-3xl font-bold text-slate-900">1,284</div>
          <div className="mt-3 text-sm text-slate-600">+4.2% this month</div>
        </Card>
        <Card className="p-5">
          <div className="text-sm text-slate-500">Total Faculty</div>
          <div className="mt-2 text-3xl font-bold text-slate-900">62</div>
          <div className="mt-3 text-sm text-slate-600">Schedule updated</div>
        </Card>
        <Card className="p-5">
          <div className="text-sm text-slate-500">Pending Exams</div>
          <div className="mt-2 text-3xl font-bold text-slate-900">7</div>
          <div className="mt-3 text-sm text-slate-600">Review marks entry</div>
        </Card>
      </div>

      <Card className="p-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-sm font-medium text-slate-900">Enrollment & Attendance</div>
            <div className="text-sm text-slate-600">Sample chart (replace with API data)</div>
          </div>
          <div className="text-xs text-slate-500 border border-border rounded-full px-3 py-1 bg-white">
            Last 30 days
          </div>
        </div>

        <div className="mt-4">
          <Suspense fallback={<LoadingSpinner label="Loading chart..." />}>
            <AnalyticsChart />
          </Suspense>
        </div>
      </Card>
    </div>
  );
}

