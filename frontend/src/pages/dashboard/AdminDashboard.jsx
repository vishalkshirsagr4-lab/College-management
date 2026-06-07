import { useEffect, useState } from 'react';
import { getStudents, getTeachers, getSubjects } from '../../api/admin.api';

const StatCard = ({ title, value, loading, color }) => {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-6 flex flex-col gap-2 hover:shadow-md transition">
      <h3 className="text-sm sm:text-base font-medium text-gray-500">{title}</h3>

      {loading ? (
        <div className="h-8 w-20 bg-gray-200 animate-pulse rounded-md"></div>
      ) : (
        <p className={`text-2xl sm:text-3xl font-bold ${color}`}>{value}</p>
      )}
    </div>
  );
};

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    students: 0,
    teachers: 0,
    subjects: 0,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [students, teachers, subjects] = await Promise.all([
          getStudents(),
          getTeachers(),
          getSubjects(),
        ]);

        setStats({
          students: students?.data?.students?.length || 0,
          teachers: teachers?.data?.teachers?.length || 0,
          subjects: subjects?.data?.subjects?.length || 0,
        });
      } catch (error) {
        setStats({ students: 0, teachers: 0, subjects: 0 });
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const cards = [
    {
      title: 'Total Students',
      value: stats.students,
      color: 'text-blue-600',
    },
    {
      title: 'Total Teachers',
      value: stats.teachers,
      color: 'text-green-600',
    },
    {
      title: 'Total Subjects',
      value: stats.subjects,
      color: 'text-purple-600',
    },
  ];

  return (
    <div className="min-h-screen w-full bg-gray-50 p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
          Admin Dashboard
        </h2>
        <p className="text-sm sm:text-base text-gray-500 mt-1">
          Manage teachers, students, and subjects from a single control panel.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {cards.map((card, index) => (
          <StatCard
            key={index}
            title={card.title}
            value={card.value}
            loading={loading}
            color={card.color}
          />
        ))}
      </div>

      {/* Optional extra section */}
      <div className="mt-6 sm:mt-8 bg-white border border-gray-100 rounded-2xl p-5 sm:p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">
          Quick Overview
        </h3>
        <p className="text-sm text-gray-500 leading-relaxed">
          This dashboard provides real-time counts of students, teachers, and subjects.
          Use the navigation menu to manage attendance, exams, timetable, and more.
        </p>
      </div>
    </div>
  );
};

export default AdminDashboard;