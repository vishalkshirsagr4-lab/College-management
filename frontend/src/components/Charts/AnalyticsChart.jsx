import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const semesters = [
  {
    semester: 1,
    data: [
      { name: "Programming C", value: 92 },
      { name: "Mathematics", value: 88 },
      { name: "English", value: 95 },
      { name: "Physics", value: 90 },
    ],
  },
  {
    semester: 2,
    data: [
      { name: "Java", value: 89 },
      { name: "Statistics", value: 91 },
      { name: "DBMS", value: 87 },
      { name: "Kannada", value: 94 },
    ],
  },
  {
    semester: 3,
    data: [
      { name: "Python", value: 93 },
      { name: "DSA", value: 85 },
      { name: "OS", value: 88 },
      { name: "Networking", value: 91 },
    ],
  },
  {
    semester: 4,
    data: [
      { name: "React", value: 95 },
      { name: "NodeJS", value: 90 },
      { name: "MongoDB", value: 87 },
      { name: "Cloud", value: 92 },
    ],
  },
];

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