import { useEffect, useMemo, useState } from 'react';
import { getFees, createFee, deleteFee } from '../../api/fees.api';
import { getAllStudents } from '../../api/admin.api';
import LoadingSkeleton from '../../components/ui/LoadingSkeleton';
import { toast } from 'react-toastify';

const Fees = () => {
  const [fees, setFees] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState('');
  const [studentQuery, setStudentQuery] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);

  const [form, setForm] = useState({
    amount: '',
    semester: '',
    status: 'Unpaid',
    paymentDate: '',
    remarks: '',
  });

  useEffect(() => {
    const load = async () => {
      try {
        const [fRes, sRes] = await Promise.all([getFees(), getAllStudents()]);
        setFees(fRes.data.fees || []);
        setStudents(sRes.data.students || []);
      } catch {
        toast.error('Failed to load data');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filteredStudents = useMemo(() => {
    return students.filter((s) =>
      `${s.usn} ${s.userId?.name} ${s.userId?.email}`
        .toLowerCase()
        .includes(studentQuery.toLowerCase())
    );
  }, [studentQuery, students]);

  const handleChange = (key) => (e) => {
    setForm({ ...form, [key]: e.target.value });
  };

  const handleSelectStudent = (student) => {
    setSelectedStudent(student);
    setStudentQuery('');
  };

  const handleCreate = async () => {
    if (!selectedStudent) return toast.error('Select student first');

    setSubmitting(true);

    try {
      const { data } = await createFee({
        ...form,
        studentId: selectedStudent._id,
      });

      setFees((prev) => [data.fee, ...prev]);
      setSelectedStudent(null);
      setForm({
        amount: '',
        semester: '',
        status: 'Unpaid',
        paymentDate: '',
        remarks: '',
      });

      toast.success('Fee record created');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteFee(id);
      setFees((prev) => prev.filter((f) => f._id !== id));
      toast.success('Deleted');
    } catch {
      toast.error('Delete failed');
    }
  };

  const filtered = fees.filter((f) =>
    `${f.studentId?.usn} ${f.studentId?.userId?.name} ${f.status} ${f.semester}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="bg-white border rounded-3xl p-5 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900">Fee Management</h1>
        <p className="text-slate-500 text-sm mt-1">
          Create and manage student fee records easily.
        </p>
      </div>

      {/* Create Fee */}
      <div className="bg-white border rounded-3xl p-5 shadow-sm">

        <h2 className="text-lg font-semibold mb-4">Create Fee Record</h2>

        <div className="grid gap-4 md:grid-cols-2">

          {/* Student Search */}
          <div className="md:col-span-2 relative">
            <input
              className="w-full border rounded-2xl p-3 focus:ring-2 focus:ring-sky-400"
              placeholder="Search student (name / email / USN)"
              value={studentQuery}
              onChange={(e) => setStudentQuery(e.target.value)}
            />

            {studentQuery && filteredStudents.length > 0 && (
              <div className="absolute z-10 w-full bg-white border rounded-2xl mt-2 max-h-60 overflow-auto shadow-lg">
                {filteredStudents.slice(0, 6).map((s) => (
                  <button
                    key={s._id}
                    onClick={() => handleSelectStudent(s)}
                    className="w-full text-left px-4 py-2 hover:bg-slate-50"
                  >
                    <p className="font-medium">{s.userId?.name}</p>
                    <p className="text-xs text-slate-500">{s.usn}</p>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Selected Student */}
          <input
            className="border rounded-2xl p-3 bg-slate-50"
            value={
              selectedStudent
                ? `${selectedStudent.userId?.name} (${selectedStudent.usn})`
                : ''
            }
            placeholder="Selected student"
            readOnly
          />

          <input
            type="number"
            className="border rounded-2xl p-3"
            placeholder="Amount"
            value={form.amount}
            onChange={handleChange('amount')}
          />

          <input
            type="number"
            className="border rounded-2xl p-3"
            placeholder="Semester"
            value={form.semester}
            onChange={handleChange('semester')}
          />

          <select
            className="border rounded-2xl p-3"
            value={form.status}
            onChange={handleChange('status')}
          >
            <option>Unpaid</option>
            <option>Paid</option>
          </select>

          <input
            type="date"
            className="border rounded-2xl p-3"
            value={form.paymentDate}
            onChange={handleChange('paymentDate')}
          />

          <textarea
            className="md:col-span-2 border rounded-2xl p-3"
            placeholder="Remarks"
            value={form.remarks}
            onChange={handleChange('remarks')}
          />

          <button
            onClick={handleCreate}
            disabled={submitting}
            className="md:col-span-2 bg-sky-600 hover:bg-sky-700 text-white py-3 rounded-2xl font-semibold"
          >
            {submitting ? 'Saving...' : 'Create Fee Record'}
          </button>

        </div>
      </div>

      {/* Search */}
      <input
        className="w-full border rounded-2xl p-3"
        placeholder="Search fee records..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* Table */}
      <div className="bg-white border rounded-3xl shadow-sm overflow-x-auto">

        {loading ? (
          <LoadingSkeleton rows={4} columns={1} />
        ) : filtered.length === 0 ? (
          <div className="p-6 text-center text-slate-500">
            No fee records found
          </div>
        ) : (
          <table className="w-full text-sm">

            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="p-4 text-left">Student</th>
                <th className="p-4 text-left">Amount</th>
                <th className="p-4 text-left">Semester</th>
                <th className="p-4 text-left">Status</th>
                <th className="p-4 text-left">Remarks</th>
                <th className="p-4 text-left">Action</th>
              </tr>
            </thead>

            <tbody>
              {filtered.map((f) => (
                <tr key={f._id} className="border-t hover:bg-slate-50">

                  <td className="p-4 font-medium">
                    {f.studentId?.usn}
                  </td>

                  <td className="p-4">{f.amount}</td>
                  <td className="p-4">{f.semester}</td>

                  <td className="p-4">
                    <span
                      className={`px-2 py-1 rounded-xl text-xs ${
                        f.status === 'Paid'
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-rose-100 text-rose-700'
                      }`}
                    >
                      {f.status}
                    </span>
                  </td>

                  <td className="p-4">{f.remarks || '-'}</td>

                  <td className="p-4">
                    <button
                      onClick={() => handleDelete(f._id)}
                      className="px-3 py-1 text-xs bg-rose-100 text-rose-700 rounded-xl"
                    >
                      Delete
                    </button>
                  </td>

                </tr>
              ))}
            </tbody>

          </table>
        )}

      </div>
    </div>
  );
};

export default Fees;