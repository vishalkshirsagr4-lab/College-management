import { useEffect, useState } from 'react';
import { getFees, getStudentProfile } from '../../api/student.api';

const FeeStatus = () => {
  const [fees, setFees] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const profileRes = await getStudentProfile();
        const studentId = profileRes.data.student?._id;
        if (!studentId) {
          setFees([]);
          return;
        }
        const response = await getFees();
        const filtered = (response.data.fees || []).filter(
          (item) => item.studentId?.toString() === studentId.toString() || item.studentId?._id?.toString() === studentId.toString()
        );
        setFees(filtered);
      } catch {
        setFees([]);
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
          <h2>Fee Status</h2>
          <p className="text-muted">Track your payments, invoices and outstanding balance.</p>
        </div>
      </div>
      <div className="grid grid-2">
        {loading ? (
          <div className="card card-panel">Checking fee status...</div>
        ) : fees.length === 0 ? (
          <div className="card card-panel">No fee records found.</div>
        ) : (
          fees.map((fee) => (
            <div key={fee._id} className="card card-panel">
              <h3>{fee.description || 'Fee item'}</h3>
              <p>Status: {fee.status || 'Unknown'}</p>
              <p className="text-muted">Amount: {fee.amount || 'N/A'}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default FeeStatus;
