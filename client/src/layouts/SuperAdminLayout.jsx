import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { useState } from "react";
import { Menu, X, LayoutDashboard, Building2, LogOut } from "lucide-react";

export default function SuperAdminLayout() {
    const { logout } = useAuth();
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    function handleLogout() {
        logout();
        navigate("/login");
    }

    return (
        <div className="flex min-h-screen text-slate-900 bg-slate-50 relative overflow-hidden">
            {/* Mobile Overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`
                fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-slate-200 p-6 flex flex-col transition-all lg:static lg:translate-x-0
                ${sidebarOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"}
            `}>
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center text-white">
                            <span className="font-bold text-xl">S</span>
                        </div>
                        <span className="text-xl font-bold tracking-tight">SuperAdmin</span>
                    </div>
                    <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-2 text-slate-400">
                        <X size={20} />
                    </button>
                </div>

                <nav className="space-y-1 flex-1">
                    <NavLink
                        to="/superadmin"
                        end
                        className={({ isActive }) =>
                            `flex items-center gap-3 rounded-xl px-4 py-3 font-medium transition ${isActive
                                ? "bg-blue-600 text-white shadow-lg shadow-blue-200"
                                : "text-slate-500 hover:bg-slate-50 hover:text-blue-600"
                            }`
                        }
                    >
                        <LayoutDashboard size={20} />
                        Dashboard
                    </NavLink>

                    <NavLink
                        to="/superadmin/enterprises"
                        className={({ isActive }) =>
                            `flex items-center gap-3 rounded-xl px-4 py-3 font-medium transition ${isActive
                                ? "bg-blue-600 text-white shadow-lg shadow-blue-200"
                                : "text-slate-500 hover:bg-slate-50 hover:text-blue-600"
                            }`
                        }
                    >
                        <Building2 size={20} />
                        Entreprises
                    </NavLink>
                </nav>

                <div className="mt-auto">
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 w-full rounded-xl px-4 py-3 font-medium text-slate-500 hover:bg-red-50 hover:text-red-600 transition"
                    >
                        <LogOut size={20} />
                        Sortie
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col h-screen overflow-hidden">
                {/* Header (Always Visible) */}
                <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between z-30">
                    <div className="lg:hidden flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center text-white">
                            <span className="font-bold text-sm">S</span>
                        </div>
                        <span className="font-bold tracking-tight">SuperAdmin</span>
                    </div>

                    <div className="hidden lg:block">
                        {/* Placeholder for Breadcrumbs or global search */}
                    </div>

                    <div className="flex items-center">
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="lg:hidden p-2 text-slate-600"
                        >
                            <Menu size={24} />
                        </button>
                    </div>
                </header>

                <main className="flex-1 p-4 lg:p-8 overflow-y-auto">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
