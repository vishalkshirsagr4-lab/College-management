import { useEffect, useState } from 'react';
import { getExams } from '../../api/exams.api';
import LoadingSkeleton from '../../components/ui/LoadingSkeleton';
import { toast } from 'react-toastify';

const TeacherExams = () => {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const response = await getExams();
        setExams(response.data.exams || []);
      } catch (error) {
        toast.error('Unable to fetch exams.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

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
          <h1 className="page-title">Exam Schedule</h1>
          <p className="page-description">Review upcoming exams and share details with your students.</p>
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
          <div className="notice-card">No exam entries found.</div>
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Subject</th>
                  <th>Type</th>
                  <th>Description</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((exam) => (
                  <tr key={exam._id}>
                    <td>{exam.subject}</td>
                    <td>{exam.examType}</td>
                    <td>{exam.description}</td>
                    <td>{new Date(exam.date).toLocaleDateString()}</td>
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

export default TeacherExams;
