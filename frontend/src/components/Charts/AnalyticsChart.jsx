import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useEffect, useMemo, useState } from "react";
import api from "../../utils/api";

const formatSubjectsToChartData = (subjects = []) => {
  if (!Array.isArray(subjects)) return [];

  return subjects
    .filter((s) => s && typeof s.subject === "string")
    .map((s) => ({
      name: s.subject,
      value: Number.isFinite(Number(s.percentage))
        ? Math.round(Number(s.percentage))
        : 0,
    }));
};

const SemesterChart = ({ title, data }) => (
  <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
    <div className="mb-3">
      <h3 className="text-sm font-semibold text-slate-800">
        {title}
      </h3>
      <p className="text-xs text-slate-500">
        Subject-wise attendance percentage
      </p>
    </div>

    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="name"
            stroke="#64748b"
            fontSize={12}
          />
          <YAxis
            domain={[0, 100]}
            stroke="#64748b"
            fontSize={12}
            tickFormatter={(value) => `${value}%`}
          />
          <Tooltip
            formatter={(value) => [`${value}%`, "Attendance"]}
          />
          <Bar
            dataKey="value"
            fill="#2563eb"
            radius={[6, 6, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  </div>
);

export default function AnalyticsChart() {
  const [semesters, setSemesters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    const fetchAttendance = async () => {
      try {
        setLoading(true);
        setError("");

        // fetch semesters 1-8
        const semesterNumbers = [1, 2, 3, 4, 5, 6, 7, 8];

        const responses = await Promise.all(
          semesterNumbers.map((sem) =>
            api.get(`/api/admin/attendance/semester/${sem}`)
          )
        );

        const formatted = responses
          .map((res, index) => ({
            semester: semesterNumbers[index],
            data: formatSubjectsToChartData(
              res?.data?.data?.subjects || []
            ),
          }))
          .filter((item) => item.data.length > 0);

        if (mounted) {
          setSemesters(formatted);
        }
      } catch (err) {
        console.error(err);

        if (mounted) {
          setError(
            err?.response?.data?.message ||
              "Failed to load attendance analytics"
          );
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchAttendance();

    return () => {
      mounted = false;
    };
  }, []);

  const hasData = useMemo(() => {
    return semesters.length > 0;
  }, [semesters]);

  if (loading) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-blue-600" />
          <span className="text-sm text-slate-600">
            Loading attendance analytics...
          </span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-4">
        <p className="font-medium text-red-600">
          Error Loading Analytics
        </p>
        <p className="mt-1 text-sm text-red-500">{error}</p>
      </div>
    );
  }

  if (!hasData) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <p className="font-medium text-slate-700">
          No attendance data found
        </p>
        <p className="mt-1 text-sm text-slate-500">
          Attendance analytics will appear once attendance is recorded.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <div className="flex gap-4 min-w-max pb-2">
        {semesters.map((sem) => (
          <div
            key={sem.semester}
            className="w-[500px] flex-shrink-0"
          >
            <SemesterChart
              title={`Semester ${sem.semester} Attendance`}
              data={sem.data}
            />
          </div>
        ))}
      </div>
    </div>
  );
}