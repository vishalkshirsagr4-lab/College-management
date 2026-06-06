import { useEffect, useState } from 'react';
import { getResults, deleteResult } from '../../api/results.api';
import LoadingSkeleton from '../../components/ui/LoadingSkeleton';
import { toast } from 'react-toastify';

const Results = () => {
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

  const handleDelete = async (id) => {
    try {
      await deleteResult(id);
      setResults((prev) => prev.filter((item) => item._id !== id));
      toast.success('Result removed.');
    } catch {
      toast.error('Could not delete result.');
    }
  };

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
          <h1 className="page-title">Results Management</h1>
          <p className="page-description">Review student grades and edit exam results across subjects.</p>
        </div>
      </div>
      <article className="section-panel">
        <input
          type="search"
          placeholder="Filter by student, subject, or grade"
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
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((result) => (
                  <tr key={result._id}>
                    <td>{result.studentId?.usn || 'Unknown'}</td>
                    <td>{result.subject}</td>
                    <td>{result.score}</td>
                    <td>{result.grade}</td>
                    <td>
                      <button className="button button-secondary" onClick={() => handleDelete(result._id)}>
                        Delete
                      </button>
                    </td>
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

export default Results;
