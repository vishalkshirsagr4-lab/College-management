import { useEffect, useState } from 'react';
import { getStudents, getTeachers, getSubjects } from '../../api/admin.api';

const AdminDashboard = () => {
  const [stats, setStats] = useState({ students: 0, teachers: 0, subjects: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [students, teachers, subjects] = await Promise.all([getStudents(), getTeachers(), getSubjects()]);
        setStats({
          students: students.data.students.length,
          teachers: teachers.data.teachers.length,
          subjects: subjects.data.subjects.length,
        });
      } catch (error) {
        setStats({ students: 0, teachers: 0, subjects: 0 });
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  return (
    <div>
      <div className="page-header">
        <div>
          <h2>Admin Dashboard</h2>
          <p className="text-muted">Manage teachers, subjects and assignments from a single console.</p>
        </div>
      </div>
      <div className="grid grid-3">
        <div className="card card-stats">
          <h3>Total Students</h3>
          <p>{loading ? 'Loading...' : stats.students}</p>
        </div>
        <div className="card card-stats">
          <h3>Total Teachers</h3>
          <p>{loading ? 'Loading...' : stats.teachers}</p>
        </div>
        <div className="card card-stats">
          <h3>Total Subjects</h3>
          <p>{loading ? 'Loading...' : stats.subjects}</p>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
