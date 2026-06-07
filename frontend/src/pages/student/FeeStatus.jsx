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
          (item) =>
            item.studentId?.toString() === studentId.toString() ||
            item.studentId?._id?.toString() === studentId.toString()
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
        const amount = Number(fee.amount || 0);

        acc.total += amount;
        if (fee.status === 'Paid') acc.paid += amount;
        else acc.pending += amount;

        return acc;
      },
      { total: 0, paid: 0, pending: 0 }
    );
  }, [fees]);

  return (
    <div className="w-full min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
          Fees
        </h1>
        <p className="text-gray-500 mt-1 text-sm sm:text-base">
          Track your payments, dues, and billing history
        </p>
      </div>

      {loading ? (
        <LoadingSkeleton rows={3} columns={1} />
      ) : fees.length === 0 ? (
        <div className="bg-white border border-gray-100 rounded-2xl p-6 text-gray-600">
          No fee records found.
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
              <p className="text-sm text-gray-500">Total Fees</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-2">
                ₹{summary.total}
              </h3>
            </div>

            <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
              <p className="text-sm text-gray-500">Paid</p>
              <h3 className="text-2xl font-bold text-green-600 mt-2">
                ₹{summary.paid}
              </h3>
            </div>

            <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
              <p className="text-sm text-gray-500">Pending</p>
              <h3 className="text-2xl font-bold text-red-600 mt-2">
                ₹{summary.pending}
              </h3>
            </div>
          </div>

          {/* Action Card */}
          <div className="bg-white border border-gray-100 rounded-2xl p-5 sm:p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900">
              Quick Payment
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Simulate a payment action for testing
            </p>

            <button className="mt-4 px-5 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition w-full sm:w-auto">
              Pay now
            </button>
          </div>

          {/* Fee List */}
          <div className="grid gap-4">
            {fees.map((fee) => (
              <div
                key={fee._id}
                className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition"
              >
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                  <h3 className="font-semibold text-gray-900">
                    {fee.description || 'Tuition fee'}
                  </h3>

                  <span
                    className={`text-xs font-semibold px-3 py-1 rounded-full w-fit ${
                      fee.status === 'Paid'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {fee.status}
                  </span>
                </div>

                {/* Info */}
                <p className="text-sm text-gray-600 mt-2">
                  Amount: ₹{fee.amount || 0}
                </p>

                <p className="text-xs text-gray-500 mt-1">
                  {fee.paymentDate
                    ? `Paid on ${new Date(
                        fee.paymentDate
                      ).toLocaleDateString()}`
                    : `Recorded on ${new Date(
                        fee.createdAt || fee.updatedAt || Date.now()
                      ).toLocaleDateString()}`}
                </p>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default FeeStatus;