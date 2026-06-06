import { useEffect, useMemo, useState } from 'react';
import { getFees, getStudentProfile } from '../../api/student.api';
import LoadingSkeleton from '../../components/ui/LoadingSkeleton';

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

  const summary = useMemo(() => {
    return fees.reduce(
      (acc, fee) => {
        acc.total += Number(fee.amount || 0);
        if (fee.status === 'Paid') acc.paid += Number(fee.amount || 0);
        if (fee.status !== 'Paid') acc.pending += Number(fee.amount || 0);
        return acc;
      },
      { total: 0, paid: 0, pending: 0 }
    );
  }, [fees]);

  return (
    <div>
      <div className="section-card">
        <div>
          <h1 className="page-title">Fees</h1>
          <p className="page-description">Review your tuition balance and upcoming payments in one place.</p>
        </div>
      </div>

      {loading ? (
        <LoadingSkeleton rows={2} columns={1} />
      ) : fees.length === 0 ? (
        <div className="section-card">No fee records found.</div>
      ) : (
        <>
          <div className="panel-grid columns-2">
            <article className="section-panel">
              <h2>Summary</h2>
              <div className="stat-card" style={{ padding: '1.4rem' }}>
                <h3>₹{summary.total}</h3>
                <p className="text-muted">Total fees billed</p>
              </div>
              <div className="stat-card" style={{ padding: '1.4rem' }}>
                <h3>₹{summary.paid}</h3>
                <p className="text-muted">Paid amount</p>
              </div>
              <div className="stat-card" style={{ padding: '1.4rem' }}>
                <h3>₹{summary.pending}</h3>
                <p className="text-muted">Pending amount</p>
              </div>
            </article>
            <article className="section-panel">
              <h2>Next action</h2>
              <p className="text-muted">Use the button below to simulate a quick payment action.</p>
              <button className="button button-primary">Pay now</button>
            </article>
          </div>

          <div className="list-card">
            {fees.map((fee) => (
              <article key={fee._id} className="fee-card">
                <div className="assignment-card-header">
                  <h3>{fee.description || 'Tuition fee'}</h3>
                  <span className={`status-pill ${fee.status === 'Paid' ? 'green' : 'red'}`}>
                    {fee.status}
                  </span>
                </div>
                <p className="text-muted">Amount: ₹{fee.amount || 0}</p>
                <p>{fee.paymentDate ? `Paid on ${new Date(fee.paymentDate).toLocaleDateString()}` : `Recorded on ${new Date(fee.createdAt || fee.updatedAt || Date.now()).toLocaleDateString()}`}</p>
              </article>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default FeeStatus;
