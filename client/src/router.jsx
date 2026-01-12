import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./auth/AuthContext";
import ProtectedRoute from "./auth/ProtectedRoute";

import Login from "./pages/auth/Login";
import ResetPassword from "./pages/auth/ResetPassword";
import SuperAdminLayout from "./layouts/SuperAdminLayout";
import SuperAdminDashboard from "./pages/superadmin/Dashboard";
import Enterprises from "./pages/superadmin/Enterprises";
import DirectorDashboard from "./pages/director/DirectorDashboard";
import Fleet from "./pages/director/Fleet";
import Customers from "./pages/director/Customers";
import Rentals from "./pages/director/Rentals";

import DirectorLayout from "./layouts/DirectorLayout";

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

                    {/* Director Routes */}
                    <Route
                        path="/director"
                        element={
                            <ProtectedRoute role="director">
                                <DirectorLayout />
                            </ProtectedRoute>
                        }
                    >
                        <Route index element={<DirectorDashboard />} />
                        <Route path="fleet" element={<Fleet />} />
                        <Route path="customers" element={<Customers />} />
                        <Route path="rentals" element={<Rentals />} />
                    </Route>

                    {/* Default redirect to login */}
                    <Route path="*" element={<Navigate to="/login" replace />} />
                </Routes>
            </AuthProvider>
        </BrowserRouter>
    );
}
