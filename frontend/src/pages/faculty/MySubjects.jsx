import { useEffect, useState } from 'react';
import { api } from '../../utils/api';
import { toast } from 'react-toastify';
import Card from '../../components/ui/Card';
import Table from '../../components/ui/Table';

export default function MySubjects() {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    
    const fetchSubjects = async () => {
      try {
        setLoading(true);
        // Ensure the path matches your backend: router.get("/subjects", ...)
        const res = await api.get('/api/faculty/subjects');
        
        // Handle common API responses (res.data.data or res.data)
        const data = res.data?.data || res.data || [];
        
        if (isMounted) setSubjects(data);
      } catch (err) {
        console.error("Subject Fetch Error:", err);
        if (isMounted) {
          toast.error("Could not load your subjects.");
          setSubjects([]); // Keep empty on error rather than showing fake placeholders
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchSubjects();
    return () => { isMounted = false; };
  }, []);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-slate-900">My Subjects</h1>
        <p className="text-sm text-slate-500">Manage courses currently assigned to you</p>
      </header>

      <Card className="overflow-hidden">
        <Table className="w-full">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="p-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Subject Name</th>
              <th className="p-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              // Skeleton Loading Rows
              [1, 2, 3].map((n) => (
                <tr key={n} className="animate-pulse">
                  <td className="p-4"><div className="h-4 bg-slate-200 rounded w-1/3"></div></td>
                  <td className="p-4"><div className="h-4 bg-slate-200 rounded w-16"></div></td>
                </tr>
              ))
            ) : subjects.length > 0 ? (
              subjects.map((s, idx) => (
                <tr key={s._id || idx} className="hover:bg-slate-50 transition-colors">
                  <td className="p-4 text-sm font-medium text-slate-800">
                    {s.name || s.subject || 'Unnamed Course'}
                  </td>
                  <td className="p-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Active
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={2} className="p-8 text-center text-slate-500 italic">
                  No subjects assigned to you at this time.
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      </Card>
    </div>
  );
}