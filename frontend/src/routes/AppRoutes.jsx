import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from '../components/ProtectedRoute';
import AdminRoute from './AdminRoute';
import TeacherRoute from './TeacherRoute';
import StudentRoute from './StudentRoute';
import Layout from '../components/Layout';
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';
import VerifyOTP from '../pages/auth/VerifyOTP';
import AdminDashboard from '../pages/dashboard/AdminDashboard';
import TeacherDashboard from '../pages/dashboard/TeacherDashboard';
import StudentDashboard from '../pages/dashboard/StudentDashboard';
import TeacherManagement from '../pages/admin/TeacherManagement';
import SubjectManagement from '../pages/admin/SubjectManagement';
import AssignTeacher from '../pages/admin/AssignTeacher';
import AdminStudents from '../pages/admin/Students';
import AdminAttendance from '../pages/admin/Attendance';
import AdminAssignments from '../pages/admin/Assignments';
import AdminExams from '../pages/admin/Exams';
import AdminResults from '../pages/admin/Results';
import AdminNotices from '../pages/admin/Notices';
import AdminFees from '../pages/admin/Fees';
import TeacherAttendance from '../pages/teacher/Attendance';
import TeacherTodays from '../pages/teacher/TodaysClasses';
import TeacherTakeAttendance from '../pages/teacher/TakeAttendance';
import TeacherAssignments from '../pages/teacher/Assignments';
import TeacherMarks from '../pages/teacher/Marks';
import TeacherSubjects from '../pages/teacher/MySubjects';
import TeacherExams from '../pages/teacher/Exams';
import TeacherResults from '../pages/teacher/Results';
import TeacherStudents from '../pages/teacher/Students';
import TeacherProfile from '../pages/teacher/Profile';
import AttendanceView from '../pages/student/AttendanceView';
import AssignmentsView from '../pages/student/AssignmentsView';
import Results from '../pages/student/Results';
import FeeStatus from '../pages/student/FeeStatus';
import Subjects from '../pages/student/Subjects';
import Notices from '../pages/student/Notices';
import Profile from '../pages/student/Profile';
import NotFound from '../pages/NotFound';

const DashboardRedirect = () => {
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
  if (user.role === 'teacher') return <Navigate to="/teacher/dashboard" replace />;
  if (user.role === 'student') return <Navigate to="/student" replace />;
  return <Navigate to="/login" replace />;
};

const AppRoutes = () => (
  <Routes>
    <Route path="/login" element={<Login />} />
    <Route path="/register" element={<Register />} />
    <Route path="/verify-otp" element={<VerifyOTP />} />
    <Route element={<ProtectedRoute />}>
      <Route element={<Layout />}>
        <Route path="/" element={<DashboardRedirect />} />

        <Route element={<AdminRoute />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/teachers" element={<TeacherManagement />} />
          <Route path="/admin/students" element={<AdminStudents />} />
          <Route path="/admin/subjects" element={<SubjectManagement />} />
          <Route path="/admin/attendance" element={<AdminAttendance />} />
          <Route path="/admin/assignments" element={<AdminAssignments />} />
          <Route path="/admin/exams" element={<AdminExams />} />
          <Route path="/admin/results" element={<AdminResults />} />
          <Route path="/admin/assign-teacher" element={<AssignTeacher />} />
          <Route path="/admin/fees" element={<AdminFees />} />
          <Route path="/admin/notices" element={<AdminNotices />} />
          <Route path="/admin/settings" element={<div className="section-card"><h1>Settings</h1><p className="text-muted">Admin settings coming soon.</p></div>} />
        </Route>

        <Route element={<TeacherRoute />}>
          <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
          <Route path="/teacher/subjects" element={<TeacherSubjects />} />
          <Route path="/teacher/attendance" element={<TeacherAttendance />} />
          <Route path="/teacher/attendance/today" element={<TeacherTodays />} />
          <Route path="/teacher/attendance/take/:id" element={<TeacherTakeAttendance />} />
          <Route path="/teacher/assignments" element={<TeacherAssignments />} />
          <Route path="/teacher/exams" element={<TeacherExams />} />
          <Route path="/teacher/results" element={<TeacherResults />} />
          <Route path="/teacher/students" element={<TeacherStudents />} />
          <Route path="/teacher/profile" element={<TeacherProfile />} />
        </Route>

        <Route element={<StudentRoute />}>
          <Route path="/student" element={<StudentDashboard />} />
          <Route path="/student/subjects" element={<Subjects />} />
          <Route path="/student/attendance" element={<AttendanceView />} />
          <Route path="/student/assignments" element={<AssignmentsView />} />
          <Route path="/student/results" element={<Results />} />
          <Route path="/student/fees" element={<FeeStatus />} />
          <Route path="/student/notices" element={<Notices />} />
          <Route path="/student/profile" element={<Profile />} />
        </Route>
      </Route>
    </Route>
    <Route path="*" element={<NotFound />} />
  </Routes>
);

export default AppRoutes;
