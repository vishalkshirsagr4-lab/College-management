import ProtectedRoute from '../components/ProtectedRoute';

const StudentRoute = () => <ProtectedRoute allowedRoles={['student']} />;

export default StudentRoute;
