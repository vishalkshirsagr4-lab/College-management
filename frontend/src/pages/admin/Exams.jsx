import { useEffect, useState } from 'react';
import { getExams, deleteExam } from '../../api/exams.api';
import LoadingSkeleton from '../../components/ui/LoadingSkeleton';
import { toast } from 'react-toastify';

const Exams = () => {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const response = await getExams();
        setExams(response.data.exams || []);
      } catch (error) {
        toast.error('Unable to load exam details.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleDelete = async (id) => {
    try {
      await deleteExam(id);
      setExams((prev) => prev.filter((exam) => exam._id !== id));
      toast.success('Exam removed.');
    } catch {
      toast.error('Could not delete exam.');
    }
  };

  const filtered = exams.filter((exam) => {
    const query = search.toLowerCase();
    return (
      exam.subject?.toLowerCase().includes(query) ||
      exam.examType?.toLowerCase().includes(query) ||
      exam.description?.toLowerCase().includes(query)
    );
  });

  return (
    <div>
      <div className="section-card section-header">
        <div>
          <h1 className="page-title">Exam Management</h1>
          <p className="page-description">Track exam schedules and manage assessment events.</p>
        </div>
      </div>
      <article className="section-panel">
        <input
          type="search"
          placeholder="Search exams by subject or type"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="form-control"
        />
        {loading ? (
          <LoadingSkeleton rows={4} columns={1} />
        ) : filtered.length === 0 ? (
          <div className="notice-card">No exam events found.</div>
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Subject</th>
                  <th>Type</th>
                  <th>Description</th>
                  <th>Date</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((exam) => (
                  <tr key={exam._id}>
                    <td>{exam.subject}</td>
                    <td>{exam.examType}</td>
                    <td>{exam.description}</td>
                    <td>{new Date(exam.date).toLocaleDateString()}</td>
                    <td>
                      <button className="button button-secondary" onClick={() => handleDelete(exam._id)}>
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

export default Exams;
