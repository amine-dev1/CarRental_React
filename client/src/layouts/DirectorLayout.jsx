import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { useState } from "react";
import {
    Menu,
    X,
    LayoutDashboard,
    Car,
    Users,
    CalendarRange,
    LogOut,
    ChevronRight,
    Briefcase
} from "lucide-react";

export default function DirectorLayout() {
    const { logout } = useAuth();
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    function handleLogout() {
        logout();
        navigate("/login");
    }

    return (
        <div className="flex min-h-screen bg-background relative overflow-hidden">
            {/* Mobile Overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`
                fixed inset-y-0 left-0 z-50 w-80 bg-background-sidebar p-6 flex flex-col transition-all duration-300 lg:static lg:translate-x-0
                ${sidebarOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"}
            `}>
                {/* Logo Section */}
                <div className="flex items-center justify-between mb-12">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-secondary rounded-2xl flex items-center justify-center text-white shadow-lg shadow-secondary/30">
                            <Briefcase size={24} strokeWidth={2.5} />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xl font-bold text-white tracking-tight">Directeur</span>
                            <span className="text-xs text-text-muted font-medium">Console de gestion</span>
                        </div>
                    </div>
                    <button
                        onClick={() => setSidebarOpen(false)}
                        className="lg:hidden p-2 text-text-muted hover:text-white hover:bg-white/10 rounded-lg transition-all"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Navigation */}
                <nav className="space-y-2 flex-1">
                    <NavLink
                        to="/director"
                        end
                        onClick={() => setSidebarOpen(false)}
                        className={({ isActive }) =>
                            `group flex items-center justify-between rounded-xl px-4 py-3.5 font-medium transition-all duration-200 ${isActive
                                ? "bg-secondary text-white shadow-lg shadow-secondary/30"
                                : "text-text-muted hover:bg-white/5 hover:text-white"
                            }`
                        }
                    >
                        <div className="flex items-center gap-3">
                            <LayoutDashboard size={20} strokeWidth={2} />
                            <span>Tableau de bord</span>
                        </div>
                        <ChevronRight
                            size={16}
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                        />
                    </NavLink>

                    <NavLink
                        to="/director/fleet"
                        onClick={() => setSidebarOpen(false)}
                        className={({ isActive }) =>
                            `group flex items-center justify-between rounded-xl px-4 py-3.5 font-medium transition-all duration-200 ${isActive
                                ? "bg-secondary text-white shadow-lg shadow-secondary/30"
                                : "text-text-muted hover:bg-white/5 hover:text-white"
                            }`
                        }
                    >
                        <div className="flex items-center gap-3">
                            <Car size={20} strokeWidth={2} />
                            <span>Gestion de la flotte</span>
                        </div>
                        <ChevronRight
                            size={16}
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                        />
                    </NavLink>

                    <NavLink
                        to="/director/customers"
                        onClick={() => setSidebarOpen(false)}
                        className={({ isActive }) =>
                            `group flex items-center justify-between rounded-xl px-4 py-3.5 font-medium transition-all duration-200 ${isActive
                                ? "bg-secondary text-white shadow-lg shadow-secondary/30"
                                : "text-text-muted hover:bg-white/5 hover:text-white"
                            }`
                        }
                    >
                        <div className="flex items-center gap-3">
                            <Users size={20} strokeWidth={2} />
                            <span>Clients</span>
                        </div>
                        <ChevronRight
                            size={16}
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                        />
                    </NavLink>

                    <NavLink
                        to="/director/rentals"
                        onClick={() => setSidebarOpen(false)}
                        className={({ isActive }) =>
                            `group flex items-center justify-between rounded-xl px-4 py-3.5 font-medium transition-all duration-200 ${isActive
                                ? "bg-secondary text-white shadow-lg shadow-secondary/30"
                                : "text-text-muted hover:bg-white/5 hover:text-white"
                            }`
                        }
                    >
                        <div className="flex items-center gap-3">
                            <CalendarRange size={20} strokeWidth={2} />
                            <span>Locations</span>
                        </div>
                        <ChevronRight
                            size={16}
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                        />
                    </NavLink>
                </nav>

                {/* Logout Button */}
                <div className="pt-4 border-t border-white/10">
                    <button
                        onClick={handleLogout}
                        className="group flex items-center justify-between w-full rounded-xl px-4 py-3.5 font-medium text-text-muted hover:bg-error/10 hover:text-error transition-all duration-200"
                    >
                        <div className="flex items-center gap-3">
                            <LogOut size={20} strokeWidth={2} />
                            <span>Déconnexion</span>
                        </div>
                        <ChevronRight
                            size={16}
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                        />
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col h-screen overflow-hidden">
                {/* Header */}
                <header className="bg-surface border-b border-border px-6 py-4 flex items-center justify-between z-30 shadow-sm">
                    <div className="lg:hidden flex items-center gap-3">
                        <div className="w-9 h-9 bg-secondary rounded-xl flex items-center justify-center text-white shadow-md">
                            <Briefcase size={18} />
                        </div>
                        <span className="font-bold text-text-primary tracking-tight">Directeur</span>
                    </div>

                    <div className="hidden lg:block">
                        <h1 className="text-2xl font-bold text-text-primary">Vue d'ensemble</h1>
                        <p className="text-sm text-text-secondary mt-0.5">Gérez vos opérations quotidiennes</p>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="lg:hidden p-2.5 text-text-secondary hover:bg-background rounded-lg transition-all"
                        >
                            <Menu size={24} />
                        </button>

                        <div className="hidden lg:flex items-center gap-2 bg-background rounded-lg px-3 py-2">
                            <div className="w-8 h-8 bg-secondary rounded-lg flex items-center justify-center text-white text-sm font-semibold">
                                D
                            </div>
                            <span className="text-sm font-medium text-text-primary">Directeur</span>
                        </div>
                    </div>
                </header>

                {/* Main Content */}
                <main className="flex-1 overflow-y-auto bg-background">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
