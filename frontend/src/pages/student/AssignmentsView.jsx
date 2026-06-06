import { useEffect, useMemo, useState } from 'react';
import { getAssignments } from '../../api/student.api';
import LoadingSkeleton from '../../components/ui/LoadingSkeleton';

const AssignmentsView = () => {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const response = await getAssignments();
        setAssignments(response.data.assignments || []);
      } catch {
        setAssignments([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const sortedAssignments = useMemo(
    () => assignments.slice().sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate)),
    [assignments]
  );

  return (
    <div>
      <div className="section-card">
        <div>
          <h1 className="page-title">Assignments</h1>
          <p className="page-description">Your pending coursework, due dates, and downloadable materials.</p>
        </div>
      </div>

      {loading ? (
        <LoadingSkeleton rows={3} columns={1} />
      ) : sortedAssignments.length === 0 ? (
        <div className="section-card">No assignments are available right now.</div>
      ) : (
        <div className="list-card">
          {sortedAssignments.map((assignment) => {
            const dueDate = new Date(assignment.dueDate);
            const isDue = dueDate >= new Date();
            return (
              <article key={assignment._id} className="assignment-card">
                <div className="assignment-card-header">
                  <h3>{assignment.title}</h3>
                  <span className={`status-pill ${isDue ? 'green' : 'red'}`}>
                    {isDue ? 'Pending' : 'Expired'}
                  </span>
                </div>
                <p className="text-muted">Due {dueDate.toLocaleDateString()}</p>
                <p>{assignment.description || 'No additional details available.'}</p>
                <div className="assignment-actions">
                  <button className="button button-primary">Upload Answer</button>
                  {assignment.file?.url && (
                    <a className="button button-secondary" href={assignment.file.url} target="_blank" rel="noreferrer">
                      Download
                    </a>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AssignmentsView;
