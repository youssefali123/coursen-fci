import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';

/**
 * ProtectedRoute — wraps any route that requires authentication.
 *
 * Props:
 *   children  — the route content to render when authorized
 *   role      — (optional) 'instructor' | 'student' — enforces role-based access
 */
const ProtectedRoute = ({ children, role }) => {
    const { isAuthenticated, user } = useSelector((s) => s.auth);
    const location = useLocation();

    // Not logged in → redirect to /login, preserving intended destination
    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // Logged in but wrong role → redirect to their own dashboard
    if (role && user?.role && user.role !== role) {
        const fallback = user.role === 'instructor' ? '/instructor/dashboard' : '/student/dashboard';
        return <Navigate to={fallback} replace />;
    }

    return children;
};

export default ProtectedRoute;
