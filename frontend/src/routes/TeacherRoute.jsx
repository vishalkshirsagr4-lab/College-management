import ProtectedRoute from '../components/ProtectedRoute';

const TeacherRoute = () => <ProtectedRoute allowedRoles={['teacher']} />;

export default TeacherRoute;
