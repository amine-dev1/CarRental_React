import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

export default function ProtectedRoute({ children, role, permission }) {
    const { user, loading } = useAuth();

    if (loading) return null; // Or a <Loader /> component
    if (!user) return <Navigate to="/login" />;

    // Check Role
    if (role) {
        if (Array.isArray(role)) {
            if (!role.includes(user.role)) return <Navigate to="/login" />;
        } else {
            if (user.role !== role) return <Navigate to="/login" />;
        }
    }

    // Check Permission
    if (permission && user.role !== 'director' && user.role !== 'superadmin') {
        const userPerms = user.permissions || [];
        if (!userPerms.includes(permission)) {
            // If they don't have permission, send them to the dashboard
            return <Navigate to="/director" />;
        }
    }

    return children;
}
