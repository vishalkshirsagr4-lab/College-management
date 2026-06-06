import { useEffect, useState } from 'react';
import { getResults } from '../../api/results.api';
import LoadingSkeleton from '../../components/ui/LoadingSkeleton';
import { toast } from 'react-toastify';

const TeacherResults = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const response = await getResults();
        setResults(response.data.results || []);
      } catch (error) {
        toast.error('Unable to load results.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filtered = results.filter((item) => {
    const query = search.toLowerCase();
    return (
      item.studentId?.usn?.toLowerCase().includes(query) ||
      item.subject?.toLowerCase().includes(query) ||
      item.grade?.toLowerCase().includes(query)
    );
  });

  return (
    <div>
      <div className="section-card section-header">
        <div>
          <h1 className="page-title">Student Results</h1>
          <p className="page-description">View and verify student exam results for your assigned subjects.</p>
        </div>
      </div>
      <article className="section-panel">
        <input
          type="search"
          placeholder="Search by student, subject, or grade"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="form-control"
        />
        {loading ? (
          <LoadingSkeleton rows={4} columns={1} />
        ) : filtered.length === 0 ? (
          <div className="notice-card">No results available.</div>
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Subject</th>
                  <th>Score</th>
                  <th>Grade</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((result) => (
                  <tr key={result._id}>
                    <td>{result.studentId?.usn || 'Unknown'}</td>
                    <td>{result.subject}</td>
                    <td>{result.score}</td>
                    <td>{result.grade}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </article>
    </div>
  );
};

export default TeacherResults;
