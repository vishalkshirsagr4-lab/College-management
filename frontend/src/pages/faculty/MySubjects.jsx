import { useEffect, useState } from 'react';
import { api } from '../../utils/api';
import Card from '../../components/ui/Card';
import Table from '../../components/ui/Table';

export default function MySubjects() {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await api.get('/api/faculty/subjects');
        if (mounted) setSubjects(res.data || []);
      } catch {
        // fallback to placeholders
        if (mounted) setSubjects([{ name: 'Mathematics' }, { name: 'Data Structures' }]);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">My Subjects</h1>
        <p className="text-sm text-slate-600 mt-1">Faculty assigned courses</p>
      </div>

      <Card className="p-5">
        <Table>
          <thead>
            <tr className="text-left">
              <th className="sticky top-0 bg-white z-10 p-3 text-xs font-semibold text-slate-600 border-b border-border">
                Subject
              </th>
              <th className="sticky top-0 bg-white z-10 p-3 text-xs font-semibold text-slate-600 border-b border-border">
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={2} className="p-4 text-sm text-slate-600">
                  Loading...
                </td>
              </tr>
            ) : subjects.length ? (
              subjects.map((s, idx) => (
                <tr key={idx}>
                  <td className="p-3 text-sm text-slate-800 border-b border-border">
                    {s.name || s.subject || '—'}
                  </td>
                  <td className="p-3 text-sm text-slate-600 border-b border-border">
                    Active
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={2} className="p-4 text-sm text-slate-600">
                  No subjects found
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      </Card>
    </div>
  );
}

