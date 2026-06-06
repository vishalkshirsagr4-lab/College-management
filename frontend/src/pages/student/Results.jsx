import { useEffect, useState } from 'react';
import { getResults, getStudentProfile } from '../../api/student.api';

const Results = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const profileRes = await getStudentProfile();
        const studentId = profileRes.data.student?._id;
        if (!studentId) {
          setResults([]);
          return;
        }
        const response = await getResults();
        const filtered = (response.data.results || []).filter(
          (item) => item.studentId?.toString() === studentId.toString() || item.studentId?._id?.toString() === studentId.toString()
        );
        setResults(filtered);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Results</h2>
          <p className="text-muted">Browse your subject-wise marks and grades.</p>
        </div>
      </div>
      <div className="grid grid-2">
        {loading ? (
          <div className="card card-panel">Loading results...</div>
        ) : results.length === 0 ? (
          <div className="card card-panel">No results available yet.</div>
        ) : (
          results.map((result) => (
            <div key={result._id} className="card card-panel">
              <h3>{result.subjectId?.subjectName || 'Subject'}</h3>
              <p>Marks: {result.marks}</p>
              <p>Grade: {result.grade}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Results;
