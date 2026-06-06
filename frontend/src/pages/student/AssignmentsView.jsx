import { useEffect, useState } from 'react';
import { getAssignments } from '../../api/student.api';

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

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Assignments</h2>
          <p className="text-muted">Download assignment materials from your teachers.</p>
        </div>
      </div>
      <div className="grid grid-2">
        {loading ? (
          <div className="card card-panel">Loading assignments...</div>
        ) : assignments.length === 0 ? (
          <div className="card card-panel">No assignments are available right now.</div>
        ) : (
          assignments.map((assignment) => (
            <div key={assignment._id} className="card card-assignment">
              <h3>{assignment.title}</h3>
              <p>{assignment.description}</p>
              <p className="text-muted">Due {new Date(assignment.dueDate).toLocaleDateString()}</p>
              {assignment.file?.url && (
                <a className="button button-secondary" href={assignment.file.url} target="_blank" rel="noreferrer">
                  Download File
                </a>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AssignmentsView;
