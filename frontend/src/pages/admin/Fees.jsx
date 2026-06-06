import { useEffect, useState } from 'react';
import { getFees, deleteFee } from '../../api/fees.api';
import LoadingSkeleton from '../../components/ui/LoadingSkeleton';
import { toast } from 'react-toastify';

const Fees = () => {
  const [fees, setFees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const response = await getFees();
        setFees(response.data.fees || []);
      } catch (error) {
        toast.error('Unable to load fees.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleDelete = async (id) => {
    try {
      await deleteFee(id);
      setFees((prev) => prev.filter((fee) => fee._id !== id));
      toast.success('Fee record removed.');
    } catch {
      toast.error('Could not delete fee record.');
    }
  };

  const filtered = fees.filter((fee) => {
    const query = search.toLowerCase();
    return (
      fee.studentId?.usn?.toLowerCase().includes(query) ||
      fee.status?.toLowerCase().includes(query) ||
      fee.semester?.toString().includes(query)
    );
  });

  return (
    <div>
      <div className="section-card section-header">
        <div>
          <h1 className="page-title">Fee Records</h1>
          <p className="page-description">Review fee payment records and manage student billing.</p>
        </div>
      </div>
      <article className="section-panel">
        <input
          type="search"
          placeholder="Filter by student, semester or status"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="form-control"
        />
        {loading ? (
          <LoadingSkeleton rows={4} columns={1} />
        ) : filtered.length === 0 ? (
          <div className="notice-card">No fee records found.</div>
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Amount</th>
                  <th>Semester</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((fee) => (
                  <tr key={fee._id}>
                    <td>{fee.studentId?.usn || 'Unknown'}</td>
                    <td>{fee.amount}</td>
                    <td>{fee.semester}</td>
                    <td>{fee.status}</td>
                    <td>
                      <button className="button button-secondary" onClick={() => handleDelete(fee._id)}>
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

export default Fees;
