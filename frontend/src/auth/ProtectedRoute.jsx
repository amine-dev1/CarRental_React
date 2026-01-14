import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

export default function ProtectedRoute({ children, role }) {
    const { user, loading } = useAuth();

    if (loading) return null; // Or a <Loader /> component
    if (!user) return <Navigate to="/login" />;

    // Support array of roles or single role
    if (role) {
        if (Array.isArray(role)) {
            if (!role.includes(user.role)) return <Navigate to="/login" />;
        } else {
            if (user.role !== role) return <Navigate to="/login" />;
        }
    }

    return children;
}
