import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./auth/AuthContext";
import ProtectedRoute from "./auth/ProtectedRoute";

import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ResetPassword from "./pages/auth/ResetPassword";
import SuperAdminLayout from "./layouts/SuperAdminLayout";
import SuperAdminDashboard from "./pages/superadmin/Dashboard";
import Enterprises from "./pages/superadmin/Enterprises";
import Reclamations from "./pages/superadmin/Reclamations";
import DirectorDashboard from "./pages/director/DirectorDashboard";
import Fleet from "./pages/director/Fleet";
import Customers from "./pages/director/Customers";
import Rentals from "./pages/director/Rentals";
import Agencies from "./pages/director/Agencies";
import Reservations from "./pages/director/Reservations";
import Administration from "./pages/director/Administration";
import EnterpriseProfile from "./pages/director/EnterpriseProfile";
import Categories from "./pages/director/Categories";
import Roles from "./pages/director/Roles";
import TeamUsers from "./pages/director/TeamUsers";
import Pricing from "./pages/director/Pricing";
import Reports from "./pages/director/Reports";

import DirectorLayout from "./layouts/DirectorLayout";
import LandingPage from "./pages/LandingPage";
import { CurrencyProvider } from "./context/CurrencyContext";

export default function Router() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <Routes>
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
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
                        <Route path="reclamations" element={<Reclamations />} />
                    </Route>

                    {/* Director Routes */}
                    <Route
                        path="/director"
                        element={
                            <ProtectedRoute role={["director", "agent"]}>
                                <CurrencyProvider>
                                    <DirectorLayout />
                                </CurrencyProvider>
                            </ProtectedRoute>
                        }
                    >
                        <Route index element={<DirectorDashboard />} />
                        <Route path="fleet" element={<ProtectedRoute permission="fleet.view"><Fleet /></ProtectedRoute>} />
                        <Route path="customers" element={<ProtectedRoute permission="customers.view"><Customers /></ProtectedRoute>} />
                        <Route path="rentals" element={<ProtectedRoute permission="rentals.view"><Rentals /></ProtectedRoute>} />
                        <Route path="agencies" element={<ProtectedRoute permission="agencies.view"><Agencies /></ProtectedRoute>} />
                        <Route path="reservations" element={<ProtectedRoute permission="reservations.view"><Reservations /></ProtectedRoute>} />
                        <Route path="admin" element={<ProtectedRoute permission="admin.access"><Administration /></ProtectedRoute>} />
                        <Route path="admin/enterprise" element={<ProtectedRoute permission="admin.access"><EnterpriseProfile /></ProtectedRoute>} />
                        <Route path="admin/categories" element={<ProtectedRoute permission="categories.view"><Categories /></ProtectedRoute>} />
                        <Route path="admin/roles" element={<ProtectedRoute permission="admin.access"><Roles /></ProtectedRoute>} />
                        <Route path="admin/team" element={<ProtectedRoute permission="admin.access"><TeamUsers /></ProtectedRoute>} />
                        <Route path="admin/pricing" element={<ProtectedRoute permission="admin.access"><Pricing /></ProtectedRoute>} />
                        <Route path="reports" element={<ProtectedRoute permission="reports.view"><Reports /></ProtectedRoute>} />
                    </Route>

                    {/* Default redirect to login */}
                    <Route path="*" element={<Navigate to="/login" replace />} />
                </Routes>
            </AuthProvider>
        </BrowserRouter>
    );
}
