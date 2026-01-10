import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./auth/AuthContext";
import ProtectedRoute from "./auth/ProtectedRoute";

import Login from "./pages/auth/Login";
import ResetPassword from "./pages/auth/ResetPassword";
import SuperAdminLayout from "./layouts/SuperAdminLayout";
import SuperAdminDashboard from "./pages/superadmin/Dashboard";
import Enterprises from "./pages/superadmin/Enterprises";

export default function Router() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/reset-password" element={<ResetPassword />} />

                    {/* Superadmin Routes */}
                    <Route
                        path="/superadmin"
                        element={
                            <ProtectedRoute role="superadmin">
                                <SuperAdminLayout />
                            </ProtectedRoute>
                        }
                    >
                        <Route index element={<SuperAdminDashboard />} />
                        <Route path="enterprises" element={<Enterprises />} />
                    </Route>

                    {/* Default redirect to login */}
                    <Route path="*" element={<Navigate to="/login" replace />} />
                </Routes>
            </AuthProvider>
        </BrowserRouter>
    );
}
