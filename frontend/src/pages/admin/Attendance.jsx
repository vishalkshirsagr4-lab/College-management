import { useEffect, useState } from 'react';
import { getAttendance, deleteAttendance } from '../../api/attendance.api';
import LoadingSkeleton from '../../components/ui/LoadingSkeleton';
import { toast } from 'react-toastify';

const Attendance = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const response = await getAttendance();
        setRecords(response.data.attendance || []);
      } catch (error) {
        toast.error('Unable to load attendance.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleDelete = async (id) => {
    try {
      await deleteAttendance(id);
      setRecords((prev) => prev.filter((item) => item._id !== id));
      toast.success('Attendance record removed.');
    } catch {
      toast.error('Could not delete attendance.');
    }
  };

  const filtered = records.filter((record) => {
    const query = filter.toLowerCase();
    return (
      record.subjectId?.subjectName?.toLowerCase().includes(query) ||
      record.status?.toLowerCase().includes(query) ||
      record.studentId?.usn?.toLowerCase().includes(query)
    );
  });

  return (
    <div>
      <div className="section-card section-header">
        <div>
          <h1 className="page-title">Attendance Management</h1>
          <p className="page-description">Review attendance history and filter records by student or subject.</p>
        </div>
      </div>
      <article className="section-panel">
        <input
          type="search"
          placeholder="Filter by student, subject or status"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="form-control"
        />
        {loading ? (
          <LoadingSkeleton rows={4} columns={1} />
        ) : filtered.length === 0 ? (
          <div className="notice-card">No attendance records found.</div>
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Subject</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((record) => (
                  <tr key={record._id}>
                    <td>{record.studentId?.usn || 'Unknown'}</td>
                    <td>{record.subjectId?.subjectName || 'Unknown'}</td>
                    <td>{record.status}</td>
                    <td>{new Date(record.date).toLocaleDateString()}</td>
                    <td>
                      <button className="button button-secondary" onClick={() => handleDelete(record._id)}>
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

export default Attendance;
