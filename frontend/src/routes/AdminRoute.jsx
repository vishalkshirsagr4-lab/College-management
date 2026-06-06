import ProtectedRoute from '../components/ProtectedRoute';

const AdminRoute = () => <ProtectedRoute allowedRoles={['admin']} />;

export default AdminRoute;
