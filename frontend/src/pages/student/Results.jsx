import { useEffect, useMemo, useState } from 'react';
import { getResults, getStudentProfile } from '../../api/student.api';
import LoadingSkeleton from '../../components/ui/LoadingSkeleton';

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

  const overall = useMemo(() => {
    if (results.length === 0) return { percentage: 0, average: 0 };
    const total = results.reduce((sum, item) => sum + Number(item.marks || 0), 0);
    const percentage = Math.round(total / results.length);
    return { percentage, average: total / results.length };
  }, [results]);

  return (
    <div>
      <div className="section-card">
        <div>
          <h1 className="page-title">Results</h1>
          <p className="page-description">Check your subject scores, grades, and GPA snapshot.</p>
        </div>
      </div>

      {loading ? (
        <LoadingSkeleton rows={2} columns={1} />
      ) : results.length === 0 ? (
        <div className="section-card">No result records are available yet.</div>
      ) : (
        <>
          <div className="panel-grid columns-2">
            <article className="section-panel">
              <h2>Overall performance</h2>
              <p className="text-muted">A quick summary of your results across subjects.</p>
              <div className="stat-card" style={{ padding: '1.4rem' }}>
                <h3>{overall.percentage}%</h3>
                <p className="text-muted">Average score across {results.length} subjects</p>
              </div>
            </article>
            <article className="section-panel">
              <h2>Download result</h2>
              <p className="text-muted">Download your complete result report as a ready-to-share document.</p>
              <button className="button button-primary">Download Report</button>
            </article>
          </div>

          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Subject</th>
                  <th>Marks</th>
                  <th>Grade</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {results.map((result) => {
                  const status = Number(result.marks) >= 40 ? 'Pass' : 'Fail';
                  return (
                    <tr key={result._id}>
                      <td>{result.subjectId?.subjectName || 'Subject'}</td>
                      <td>{result.marks}</td>
                      <td>{result.grade || 'N/A'}</td>
                      <td>{status}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};

export default Results;
