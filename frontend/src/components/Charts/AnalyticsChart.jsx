import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { useState, useEffect } from "react";
import api from "../../utils/api";

export default function AnalyticsChart() {
  const [semesters, setSemesters] = useState([]);

  // convert API → chart format
  const formatSubjects = (subjects) => {
    return subjects.map((sub) => ({
      name: sub.subject,
      value: Math.round(sub.percentage),
    }));
  };

  // fetch ALL semesters in one call
  const fetchAttendance = async () => {
    try {
      const res = await api.get(
        "/api/admin/attendance/semesters"
      );

      const data = res.data.data;

      const formatted = data.map((sem) => ({
        semester: sem.semester,
        data: formatSubjects(sem.subjects || []),
      }));

      setSemesters(formatted);
    } catch (error) {
      console.error("Error fetching attendance:", error);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, []);

  // fallback
  const sample = [
    { name: "Math", value: 80 },
    { name: "Science", value: 75 },
    { name: "CS", value: 85 },
  ];

  const ChartBox = ({ title, data }) => (
    <div className="h-64 w-full mb-6">
      <div className="text-sm font-semibold text-slate-700 mb-2">
        {title}
      </div>

      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data.length ? data : sample}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
          <YAxis stroke="#64748b" fontSize={12} />
          <Tooltip />
          <Bar dataKey="value" fill="#2563eb" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );

  return (
    <div>
      {semesters.length === 0 ? (
        <ChartBox title="Loading..." data={[]} />
      ) : (
        semesters.map((sem) => (
          <ChartBox
            key={sem.semester}
            title={`Semester ${sem.semester} Attendance`}
            data={sem.data}
          />
        ))
      )}
    </div>
  );
}