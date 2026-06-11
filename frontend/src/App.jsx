import { lazy, Suspense } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import AuthProvider from "./context/AuthProvider";
import { useAuth } from "./context/AuthContext";

import "./index.css";

import AppLayout from "./layout/AppLayout";
import RequireAuth from "./components/RequireAuth";
import AppStartupAnimation from "./components/AppStartupAnimation";

import { ROLES } from "./utils/roles";

/* ================= LAZY PAGES ================= */

const Login = lazy(() => import("./pages/auth/Login"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const FacultyDashboard = lazy(() => import("./pages/faculty/FacultyDashboard"));
const StudentDashboard = lazy(() => import("./pages/student/StudentDashboard"));
const StudentAdmin = lazy(() => import("./pages/admin/StudentAdmin"));
const SubjectsPage = lazy(() => import("./pages/admin/SubjectsPage"));

const FacultyListPage = lazy(() => import("./pages/admin/FacultyListPage"));
const CreateFacultyPage = lazy(() => import("./pages/admin/CreateFacultyPage"));
const FacultyDetailsPage = lazy(() => import("./pages/admin/FacultyDetailsPage"));
const EditFacultySubjectsPage = lazy(() => import("./pages/admin/EditFacultySubjectsPage"));
const CreateStudentPage = lazy(() => import("./pages/admin/CreateStudent"));
const StudentDetailsPage = lazy(() => import("./pages/admin/StudentDetails"));
const TimetablePage = lazy(() => import("./pages/admin/TimetableManagementPage"));

// Integrated new component
const AdminExamManager = lazy(() => import("./pages/admin/ExamAdmin"));
const AdminNotification = lazy(() => import("./pages/admin/AdminNotificationManagementPage"));
const FacultyProfile = lazy(()=> import("./pages/faculty/FacultyProfilePage"));
const FaculyStudents = lazy(()=> import("./pages/faculty/FacultyStudentsPage"));

/* ================= HELPERS ================= */

const Placeholder = ({ title }) => (
  <div className="space-y-4 p-6">
    <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
    <div className="rounded-lg border bg-white p-6 text-sm text-slate-600 shadow-sm">
      Placeholder page (UI scaffold). Connect backend API here.
    </div>
  </div>
);

const NotFound = () => <div className="p-6 text-sm">404 - Page not found</div>;

/* ================= ROLE REDIRECT ================= */

function RoleRedirector() {
  const { isAuthenticated, role } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (role === ROLES.ADMIN) return <Navigate to="/admin" replace />;
  if (role === ROLES.FACULTY) return <Navigate to="/faculty" replace />;
  if (role === ROLES.STUDENT) return <Navigate to="/student" replace />;
  return <Navigate to="/login" replace />;
}

/* ================= ROUTES ================= */

function AppRoutes() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center text-gray-500">
          Loading...
        </div>
      }
    >
      <Routes>
        <Route path="/" element={<RoleRedirector />} />
        <Route path="/login" element={<Login />} />

        <Route element={<AppLayout />}>
          {/* ADMIN */}
          <Route element={<RequireAuth role={ROLES.ADMIN} />}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/students" element={<StudentAdmin />} />
            <Route path="/admin/subjects" element={<SubjectsPage />} />
            <Route path="/admin/faculty" element={<FacultyListPage />} />
            <Route path="/admin/faculty/create" element={<CreateFacultyPage />} />
            <Route path="/admin/faculty/:facultyId" element={<FacultyDetailsPage />} />
            <Route path="/admin/faculty/:facultyId/edit-subjects" element={<EditFacultySubjectsPage />} />
            <Route path="/admin/assign-faculty" element={<Placeholder title="Assign Faculty" />} />
            
            {/* Added Route */}
            <Route path="/admin/exams" element={<AdminExamManager />} />
            
            <Route
              path="/admin/notifications"
              element={<AdminNotification />}
            />
            <Route path="/admin/student/create" element={<CreateStudentPage />} />
            <Route path="/admin/students/:studentId" element={<StudentDetailsPage />} />
            <Route path="/admin/timetable" element={<TimetablePage />} />
          </Route>

          {/* FACULTY */}
          <Route element={<RequireAuth role={ROLES.FACULTY} />}>
            <Route path="/faculty" element={<FacultyDashboard />} />
            <Route path="/faculty/subjects" element={<Placeholder title="My Subjects" />} />
            <Route path="/faculty/attendance" element={<Placeholder title="Attendance" />} />
            <Route path="/faculty/assignments" element={<Placeholder title="Assignments" />} />
            <Route path="/faculty/marks" element={<Placeholder title="Marks Entry" />} />
            <Route path="/faculty/exams-syllabus" element={<Placeholder title="Exams + Syllabus" />} />
            <Route path="/faculty/notifications" element={<Placeholder title="Notifications" />} />
            <Route path="/profile" element={<FacultyProfile/>} />
            <Route path="/faculty/students" element={ <FaculyStudents/> } />
          </Route>

          {/* STUDENT */}
          <Route element={<RequireAuth role={ROLES.STUDENT} />}>
            <Route path="/student" element={<StudentDashboard />} />
            <Route path="/student/attendance" element={<Placeholder title="Attendance" />} />
            <Route path="/student/assignments" element={<Placeholder title="Assignments" />} />
            <Route path="/student/timetable" element={<Placeholder title="Timetable" />} />
            <Route path="/student/exams" element={<Placeholder title="Exams Schedule" />} />
            <Route path="/student/results" element={<Placeholder title="Results" />} />
            <Route path="/student/notifications" element={<Placeholder title="Notifications" />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </Suspense>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppStartupAnimation>
          <AppRoutes />
          <ToastContainer position="top-right" autoClose={3000} hideProgressBar />
        </AppStartupAnimation>
      </BrowserRouter>
    </AuthProvider>
  );
}