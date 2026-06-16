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

const AdminExamManager = lazy(() => import("./pages/admin/ExamAdmin"));
const AdminNotification = lazy(() => import("./pages/admin/AdminNotificationManagementPage"));
const FacultyProfile = lazy(()=> import("./pages/faculty/FacultyProfilePage"));
const FaculyStudents = lazy(()=> import("./pages/faculty/FacultyStudentsPage"));
const FacultyAttendence = lazy(()=> import("./pages/faculty/Attendence"));
const FacultyAssignment = lazy(()=> import("./pages/faculty/FacultyAssignment"));
const FacultyExam = lazy(()=> import('./pages/faculty/FacultyExamPage'));
const FacultyTimeTable = lazy(()=> import("./pages/faculty/FacultyTimetablePage"));
const FacultyNotification = lazy(()=> import("./pages/faculty/FacultyNotificationPage"));
const FacultyreadNotification = lazy(()=> import("./pages/faculty/FacultyNotificationFeed"));
const StudentAttendence = lazy(()=> import("./pages/student/Attendence"));
const StudentTimeTable = lazy(()=> import("./pages/student/StudentTimetablePage"));
const StudentProfile = lazy(()=> import("./pages/student/StudentProfilePage"));
const StudentExam = lazy(()=> import("./pages/student/Exam"));
const StudentExams = lazy(()=> import("./pages/student/StudentExams"));
const StudentResult = lazy(()=> import("./pages/student/StudentResultsPage"));  
const StudentNotification = lazy(()=> import("./pages/student/Notifications"));
const StudentAssignment = lazy(()=> import("./pages/student/Assignment"));


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

/* ================= ROLE REDIRECTOR ================= */

// This now safely maps users to their internal panels if they have a token
function RoleRedirector() {
  const { isAuthenticated, role } = useAuth();
  
  if (!isAuthenticated) return <Navigate to="/" replace />; // Fallback to public landing
  if (role === ROLES.ADMIN) return <Navigate to="/admin" replace />;
  if (role === ROLES.FACULTY) return <Navigate to="/faculty" replace />;
  if (role === ROLES.STUDENT) return <Navigate to="/student" replace />;
  return <Navigate to="/" replace />;
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
  {/* Root Route */}
  {/* <Route path="/" element={<Navigate to="/login" replace />} /> */}

    <Route path="/" element={<Navigate to="/login" replace />} />


  {/* Login */}
  <Route path="/login" element={<Login />} />

  {/* Role Redirect */}
  <Route path="/explore-gateway" element={<RoleRedirector />} />

  <Route element={<AppLayout />}>
    {/* ADMIN */}
    <Route element={<RequireAuth role={ROLES.ADMIN} />}>

      <Route path="/admin" element={<AdminDashboard />} />
      <Route path="/admin/students" element={<StudentAdmin />} />
      <Route path="/admin/subjects" element={<SubjectsPage />} />
      <Route path="/admin/faculty" element={<FacultyListPage />} />
      <Route path="/admin/faculty/create" element={<CreateFacultyPage />} />
      <Route path="/admin/faculty/:facultyId" element={<FacultyDetailsPage />} />
      <Route
        path="/admin/faculty/:facultyId/edit-subjects"
        element={<EditFacultySubjectsPage />}
      />
      <Route path="/admin/assign-faculty" element={<Placeholder title="Assign Faculty" />} />
      <Route path="/admin/exams" element={<AdminExamManager />} />
      <Route path="/admin/notifications" element={<AdminNotification />} />
      <Route path="/admin/student/create" element={<CreateStudentPage />} />
      <Route path="/admin/students/:studentId" element={<StudentDetailsPage />} />
      <Route path="/admin/timetable" element={<TimetablePage />} />
    </Route>

    {/* FACULTY */}
    <Route element={<RequireAuth role={ROLES.FACULTY} />}>
      <Route path="/faculty" element={<FacultyDashboard />} />
      <Route path="/faculty/subjects" element={<Placeholder title="My Subjects" />} />
      <Route path="/faculty/attendance" element={<FacultyAttendence />} />
      <Route path="/faculty/assignments" element={<FacultyAssignment />} />
      <Route path="/faculty/marks" element={<FacultyExam />} />
      <Route path="/faculty/exams-syllabus" element={<Placeholder title="Exams + Syllabus" />} />
      <Route path="/faculty/profile" element={<FacultyProfile />} />
      <Route path="/faculty/students" element={<FaculyStudents />} />

      {/* Fixed lowercase routes */}
      <Route path="/faculty/timetable" element={<FacultyTimeTable />} />
      <Route path="/faculty/notification" element={<FacultyNotification />} />
      <Route path="/faculty/notification/feed" element={<FacultyreadNotification />} />
    </Route>

    {/* STUDENT */}
    <Route element={<RequireAuth role={ROLES.STUDENT} />}>
      <Route path="/student" element={<StudentDashboard />} />
      <Route path="/student/attendance" element={<StudentAttendence />} />
      <Route path="/student/assignment" element={<StudentAssignment />} />
      <Route path="/student/exams" element={<StudentExams />} />
      <Route path="/student/exams/:examId" element={<StudentExam />} />
      <Route path="/student/exams/:examId/result" element={<StudentResult />} />
      <Route path="/student/results" element={<StudentResult />} />
      <Route path="/student/notifications" element={<StudentNotification />} />
      <Route path="/student/profile" element={<StudentProfile />} />

      {/* Fixed lowercase route */}
      <Route path="/student/timetable" element={<StudentTimeTable />} />
    </Route>

    {/* 404 Route - Keep Last */}
    <Route path="*" element={<Navigate to="/login" replace />} />
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
          <ToastContainer
            position="top-right"
            autoClose={3000}
            newestOnTop
            closeOnClick
            pauseOnHover
            draggable
            theme="colored"
          />
        </AppStartupAnimation>
      </BrowserRouter>
    </AuthProvider>
  );
}