import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { useState } from "react";
import { Menu, X, LayoutDashboard, Building2, LogOut, ChevronRight, Sparkles, Sun, Moon, User } from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import logo from "../assets/logo-blue.png";

export default function SuperAdminLayout() {
    const { user, logout } = useAuth();
    const { darkMode, toggleDarkMode } = useTheme();
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
                fixed inset-y-0 left-0 z-50 w-80 bg-[#0B1220] border-r border-white/5 p-6 flex flex-col transition-all duration-300 lg:static lg:translate-x-0
                ${sidebarOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"}
            `}>
                <div className="flex items-center justify-between mb-12">
                    <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl px-4 py-3 shadow-lg">
                        <div onClick={() => navigate("/")} className=" cursor-pointer flex items-center space-x-2">
                            <img src={logo} alt="logo" className="h-11 w-11" />
                            <span className="text-2xl font-bold text-white">
                                Rental<span className="text-blue-400">Car</span>
                            </span>
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
                        to="/superadmin"
                        end
                        onClick={() => setSidebarOpen(false)}
                        className={({ isActive }) =>
                            `group flex items-center justify-between rounded-xl px-4 py-3.5 font-medium transition-all duration-250 ${isActive
                                ? "bg-[#2563EB] text-white shadow-sm"
                                : "text-[#94A3B8] hover:bg-white/5 hover:text-white"
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
                        to="/superadmin/enterprises"
                        onClick={() => setSidebarOpen(false)}
                        className={({ isActive }) =>
                            `group flex items-center justify-between rounded-xl px-4 py-3.5 font-medium transition-all duration-250 ${isActive
                                ? "bg-[#2563EB] text-white shadow-sm"
                                : "text-[#94A3B8] hover:bg-white/5 hover:text-white"
                            }`
                        }
                    >
                        <div className="flex items-center gap-3">
                            <Building2 size={20} strokeWidth={2} />
                            <span>Entreprises</span>
                        </div>
                        <ChevronRight
                            size={16}
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                        />
                    </NavLink>
                    <NavLink
                        to="/superadmin/reclamations"
                        onClick={() => setSidebarOpen(false)}
                        className={({ isActive }) =>
                            `group flex items-center justify-between rounded-xl px-4 py-3.5 font-medium transition-all duration-250 ${isActive
                                ? "bg-[#2563EB] text-white shadow-sm"
                                : "text-[#94A3B8] hover:bg-white/5 hover:text-white"
                            }`
                        }
                    >
                        <div className="flex items-center gap-3">
                            <Building2 size={20} strokeWidth={2} />
                            <span>Réclamations</span>
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
                        className="group flex items-center justify-between w-full rounded-xl px-4 py-3.5 font-medium text-[#94A3B8] hover:bg-error/10 hover:text-error transition-all duration-250"
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
                            <Sparkles size={18} />
                        </div>
                        <span className="font-bold text-text-primary tracking-tight">SuperAdmin</span>
                    </div>

                    <div className="hidden lg:block">
                        <h1 className="text-2xl font-bold text-text-primary">Bon retour</h1>
                        <p className="text-sm text-text-secondary mt-0.5">Gérez vos entreprises et votre tableau de bord</p>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={toggleDarkMode}
                            className="p-2.5 text-text-secondary hover:bg-background rounded-lg transition-all"
                            title={darkMode ? "Clair" : "Sombre"}
                        >
                            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
                        </button>

                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="lg:hidden p-2.5 text-text-secondary hover:bg-background rounded-lg transition-all"
                        >
                            <Menu size={24} />
                        </button>

                        <div className="hidden lg:flex items-center gap-2 bg-[#0F172A] rounded-lg px-3 py-2 border border-white/5">
                             <div className="w-8 h-8 bg-[#2563EB] rounded-lg flex items-center justify-center text-white text-sm font-semibold uppercase overflow-hidden">
                                {user?.profile_photo ? (
                                    <img 
                                        src={user.profile_photo} 
                                        alt={user.full_name} 
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <User size={18} />
                                )}
                            </div>
                            <span className="text-sm font-medium text-[#F1F5F9]">
                                {user?.full_name || "Super Admin"}
                            </span>
                        </div>
                    </div>
                </header>

                {/* Main Content */}
                <main className="flex-1 p-4 lg:p-8 overflow-y-auto bg-background">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}