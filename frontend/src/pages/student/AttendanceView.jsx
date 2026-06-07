import { useEffect, useMemo, useState } from 'react';
import { getAttendance, getStudentProfile } from '../../api/student.api';
import LoadingSkeleton from '../../components/ui/LoadingSkeleton';

const AttendanceView = () => {
  const [attendance, setAttendance] = useState([]);
  const [studentId, setStudentId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const profileRes = await getStudentProfile();
        const currentStudentId = profileRes.data.student?._id;

        if (!currentStudentId) {
          setAttendance([]);
          return;
        }

        setStudentId(currentStudentId);

        const response = await getAttendance(currentStudentId);
        setAttendance(response.data.attendance || []);
      } catch {
        setAttendance([]);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const mappedAttendance = useMemo(() => {
    return attendance.map((record) => {
      const entry = (record.entries || []).find((item) => {
        if (!item.studentId) return false;
        if (typeof item.studentId === 'string')
          return item.studentId === studentId;
        return (
          item.studentId?._id === studentId ||
          item.studentId?.toString() === studentId
        );
      });

      return {
        ...record,
        studentStatus: entry?.status || 'absent',
      };
    });
  }, [attendance, studentId]);

  const subjectOverview = useMemo(() => {
    const map = {};

    mappedAttendance.forEach((record) => {
      const subject = record.subjectId?.subjectName || 'Unknown';

      if (!map[subject]) {
        map[subject] = { present: 0, absent: 0 };
      }

      const status = (record.studentStatus || '').toLowerCase();

      if (['present', 'late', 'approved', 'medical'].includes(status)) {
        map[subject].present += 1;
      } else {
        map[subject].absent += 1;
      }
    });

    return Object.entries(map).map(([subject, stats]) => ({
      subject,
      ...stats,
    }));
  }, [mappedAttendance]);

  const getStatusColor = (status) => {
    const s = (status || '').toLowerCase();
    return ['present', 'late', 'approved', 'medical'].includes(s)
      ? 'bg-green-100 text-green-700'
      : 'bg-red-100 text-red-700';
  };

  return (
    <div className="w-full min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
          Attendance
        </h1>
        <p className="text-gray-500 mt-1 text-sm sm:text-base">
          Track your attendance across subjects and classes
        </p>
      </div>

      {loading ? (
        <LoadingSkeleton rows={3} columns={1} />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* LEFT: Subject Summary */}
          <section className="bg-white border border-gray-100 rounded-2xl p-5 sm:p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900">
              Subject Summary
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Attendance percentage per subject
            </p>

            <div className="mt-5 space-y-3">
              {subjectOverview.length === 0 ? (
                <div className="text-gray-500 text-sm">
                  No attendance records found.
                </div>
              ) : (
                subjectOverview.map((sub) => {
                  const total = sub.present + sub.absent;
                  const rate =
                    total === 0 ? 0 : Math.round((sub.present / total) * 100);

                  return (
                    <div
                      key={sub.subject}
                      className="flex items-center justify-between p-4 rounded-xl border border-gray-100 bg-gray-50"
                    >
                      <div>
                        <h3 className="font-medium text-gray-900">
                          {sub.subject}
                        </h3>
                        <p className="text-xs text-gray-500 mt-1">
                          P: {sub.present} | A: {sub.absent}
                        </p>
                      </div>

                      <span
                        className={`text-xs font-semibold px-3 py-1 rounded-full ${
                          rate < 75
                            ? 'bg-red-100 text-red-700'
                            : 'bg-green-100 text-green-700'
                        }`}
                      >
                        {total === 0 ? 'No data' : `${rate}%`}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </section>

          {/* RIGHT: Recent Entries */}
          <section className="bg-white border border-gray-100 rounded-2xl p-5 sm:p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900">
              Recent Attendance
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Latest class attendance records
            </p>

            <div className="mt-5 space-y-3">
              {mappedAttendance.length === 0 ? (
                <div className="text-gray-500 text-sm">
                  No attendance entries available.
                </div>
              ) : (
                mappedAttendance.slice(0, 8).map((item) => (
                  <div
                    key={item._id}
                    className="p-4 rounded-xl border border-gray-100 bg-gray-50"
                  >
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span
                        className={`px-3 py-1 rounded-full font-semibold ${getStatusColor(
                          item.studentStatus
                        )}`}
                      >
                        {item.studentStatus}
                      </span>
                      <span>
                        {new Date(item.date).toLocaleDateString()}
                      </span>
                    </div>

                    <h3 className="mt-2 font-medium text-gray-900">
                      {item.subjectId?.subjectName || 'Subject'}
                    </h3>

                    <p className="text-xs text-gray-500 mt-1">
                      Section {item.section || 'N/A'} · Period{' '}
                      {item.period || '-'}
                    </p>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>
      )}
    </div>
  );
};

export default AttendanceView;