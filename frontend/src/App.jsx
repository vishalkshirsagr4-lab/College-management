import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import VerifyOTP from './pages/auth/VerifyOTP';
import AdminDashboard from './pages/dashboard/AdminDashboard';
import TeacherDashboard from './pages/dashboard/TeacherDashboard';
import StudentDashboard from './pages/dashboard/StudentDashboard';
import TeacherManagement from './pages/admin/TeacherManagement';
import SubjectManagement from './pages/admin/SubjectManagement';
import AssignTeacher from './pages/admin/AssignTeacher';
import Attendance from './pages/teacher/Attendance';
import Assignments from './pages/teacher/Assignments';
import Marks from './pages/teacher/Marks';
import AttendanceView from './pages/student/AttendanceView';
import AssignmentsView from './pages/student/AssignmentsView';
import Results from './pages/student/Results';
import FeeStatus from './pages/student/FeeStatus';
import NotFound from './pages/NotFound';

const DashboardRedirect = () => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'admin') return <Navigate to="/admin" replace />;
  if (user.role === 'teacher') return <Navigate to="/teacher" replace />;
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
        <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/teachers" element={<TeacherManagement />} />
          <Route path="/admin/subjects" element={<SubjectManagement />} />
          <Route path="/admin/assign" element={<AssignTeacher />} />
        </Route>
        <Route element={<ProtectedRoute allowedRoles={['teacher']} />}>
          <Route path="/teacher" element={<TeacherDashboard />} />
          <Route path="/teacher/attendance" element={<Attendance />} />
          <Route path="/teacher/assignments" element={<Assignments />} />
          <Route path="/teacher/marks" element={<Marks />} />
        </Route>
        <Route element={<ProtectedRoute allowedRoles={['student']} />}>
          <Route path="/student" element={<StudentDashboard />} />
          <Route path="/student/attendance" element={<AttendanceView />} />
          <Route path="/student/assignments" element={<AssignmentsView />} />
          <Route path="/student/results" element={<Results />} />
          <Route path="/student/fees" element={<FeeStatus />} />
        </Route>
      </Route>
    </Route>
    <Route path="*" element={<NotFound />} />
  </Routes>
);

const App = () => (
  <AuthProvider>
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  </AuthProvider>
);

export default App;
