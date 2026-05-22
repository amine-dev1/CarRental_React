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
    Briefcase,
    Sun,
    Moon,
    User,
    ChevronLeft,
    PanelLeftClose,
    PanelLeftOpen,
    Building2,
    BookOpen,
    Settings,
    BarChart3,
    Receipt
} from "lucide-react";
import { useTheme } from "../context/ThemeContext";

export default function DirectorLayout() {
    const { user, logout } = useAuth();
    const { darkMode, toggleDarkMode } = useTheme();
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(false);

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
            {/* Sidebar */}
            <aside className={`
                fixed inset-y-0 left-0 z-50 bg-[#0F172A] border-r border-[#1E293B] flex flex-col transition-all duration-300 lg:static lg:translate-x-0
                ${sidebarOpen ? "translate-x-0 shadow-2xl w-80 p-6" : "-translate-x-full w-80 p-6"}
                ${isCollapsed ? "lg:w-[90px] lg:px-4 lg:py-6" : "lg:w-80 lg:p-6"}
            `}>
                {/* Logo Section */}
                <div className={`flex items-center mb-12 ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#1E293B] rounded-xl flex items-center justify-center text-[#6366F1] shadow-sm flex-shrink-0 overflow-hidden">
                            {user?.enterprise_logo ? (
                                <img src={user.enterprise_logo} alt="Logo" className="w-full h-full object-cover" />
                            ) : (
                                <Briefcase size={20} strokeWidth={2.5} />
                            )}
                        </div>
                        {!isCollapsed && (
                            <div className="flex flex-col overflow-hidden whitespace-nowrap transition-all duration-300 opacity-100">
                                <span className="text-lg font-bold text-[#F8FAFC] tracking-tight truncate">
                                    {user?.enterprise_name || "Directeur"}
                                </span>
                                <span className="text-xs text-[#94A3B8] font-medium">
                                    Console de gestion
                                </span>
                            </div>
                        )}
                    </div>
                    {/* Mobile Close Button */}
                    <button
                        onClick={() => setSidebarOpen(false)}
                        className="lg:hidden p-2 text-[#94A3B8] hover:text-white hover:bg-white/10 rounded-lg transition-all"
                    >
                        <X size={20} />
                    </button>
                    {/* Desktop Collapse Button */}
                    {!isCollapsed && (
                        <button
                            onClick={() => setIsCollapsed(true)}
                            className="hidden lg:flex p-1.5 text-[#94A3B8] hover:text-white hover:bg-white/10 rounded-lg transition-all"
                            title="Réduire le menu"
                        >
                            <PanelLeftClose size={20} />
                        </button>
                    )}
                </div>

                {/* If collapsed, show open button */}
                {isCollapsed && (
                     <button
                        onClick={() => setIsCollapsed(false)}
                        className="hidden lg:flex absolute -right-3 top-8 w-6 h-6 bg-[#1E293B] border border-[#0F172A] rounded-full items-center justify-center text-[#94A3B8] hover:text-white transition-all shadow-md z-50"
                        title="Agrandir le menu"
                    >
                        <ChevronRight size={14} />
                    </button>
                )}

                {/* Main Navigation */}
                <nav className="space-y-1 flex-1">
                    {[
                        { to: "/director", label: "Tableau de bord", icon: <LayoutDashboard size={20} />, perm: null },
                        { to: "/director/fleet", label: "Gestion de la flotte", icon: <Car size={20} />, perm: "fleet.view" },
                        { to: "/director/agencies", label: "Agences", icon: <Building2 size={20} />, perm: "agencies.view" },
                        { to: "/director/customers", label: "Clients", icon: <Users size={20} />, perm: "customers.view" },
                        { to: "/director/reservations", label: "Réservations", icon: <BookOpen size={20} />, perm: "reservations.view" },
                        { to: "/director/rentals", label: "Locations", icon: <CalendarRange size={20} />, perm: "rentals.view" },
                        { to: "/director/admin/pricing", label: "Tarification", icon: <Receipt size={20} />, perm: "admin.access" },
                        { to: "/director/reports", label: "Rapports & Finances", icon: <BarChart3 size={20} />, perm: "reports.view" },
                    ].filter(item => {
                        if (!item.perm) return true;
                        return user?.role === 'director' || (user?.permissions || []).includes(item.perm);
                    }).map(({ to, label, icon }) => (
                        <NavLink
                            key={to}
                            to={to}
                            end={to === "/director"}
                            onClick={() => setSidebarOpen(false)}
                            className={({ isActive }) =>
                                `group flex items-center justify-between rounded-xl font-medium transition-all duration-200 
                                ${isCollapsed ? 'p-3 justify-center' : 'px-4 py-3'} 
                                ${isActive
                                    ? "bg-[#1E293B] text-[#F8FAFC]"
                                    : "text-[#CBD5E1] hover:bg-white/5 hover:text-[#F8FAFC]"
                                }`
                            }
                            title={isCollapsed ? label : undefined}
                        >
                            <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'}`}>
                                <div className="flex-shrink-0">{icon}</div>
                                {!isCollapsed && <span className="whitespace-nowrap transition-opacity duration-300">{label}</span>}
                            </div>
                            {!isCollapsed && (
                                <ChevronRight
                                    size={16}
                                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                                />
                            )}
                        </NavLink>
                    ))}

                    {/* Administration separator */}
                    {(user?.role === 'director' || (user?.permissions || []).includes('admin.access')) && (
                        <>
                            <div className={`pt-4 pb-1 ${isCollapsed ? 'flex justify-center' : ''}`}>
                                {!isCollapsed ? (
                                    <span className="text-xs font-semibold uppercase tracking-widest text-[#475569] px-4">
                                        Administration
                                    </span>
                                ) : (
                                    <div className="w-6 h-px bg-[#1E293B]" title="Administration" />
                                )}
                            </div>

                            <NavLink
                                to="/director/admin"
                        onClick={() => setSidebarOpen(false)}
                        className={({ isActive }) =>
                            `group flex items-center justify-between rounded-xl font-medium transition-all duration-200 
                            ${isCollapsed ? 'p-3 justify-center' : 'px-4 py-3'} 
                            ${isActive
                                ? "bg-[#1E293B] text-[#F8FAFC]"
                                : "text-[#CBD5E1] hover:bg-white/5 hover:text-[#F8FAFC]"
                            }`
                        }
                        title={isCollapsed ? "Administration" : undefined}
                    >
                        <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'}`}>
                            <div className="flex-shrink-0"><Settings size={20} /></div>
                            {!isCollapsed && <span className="whitespace-nowrap transition-opacity duration-300">Administration</span>}
                        </div>
                        {!isCollapsed && (
                            <ChevronRight
                                size={16}
                                className="opacity-0 group-hover:opacity-100 transition-opacity"
                            />
                        )}
                    </NavLink>
                        </>
                    )}
                </nav>

                {/* Logout Button */}
                <div className={`pt-4 border-t border-black/10 mt-auto ${isCollapsed ? 'flex justify-center' : ''}`}>
                    <button
                        onClick={handleLogout}
                        className={`group flex items-center justify-between rounded-xl font-medium text-[#94A3B8] hover:bg-red-500/10 hover:text-red-500 transition-all duration-250 
                        ${isCollapsed ? 'p-3 w-auto' : 'px-4 py-3.5 w-full'}`}
                        title={isCollapsed ? "Déconnexion" : undefined}
                    >
                        <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'}`}>
                            <div className="flex-shrink-0"><LogOut size={20} strokeWidth={2} /></div>
                            {!isCollapsed && <span className="whitespace-nowrap transition-opacity duration-300">Déconnexion</span>}
                        </div>
                        {!isCollapsed && (
                            <ChevronRight
                                size={16}
                                className="opacity-0 group-hover:opacity-100 transition-opacity"
                            />
                        )}
                    </button>
                </div>
            </aside>


            {/* Main Content Area */}
            <div className="flex-1 flex flex-col h-screen overflow-hidden">
                {/* Header */}
                <header className="bg-surface border-b border-border px-6 py-4 flex items-center justify-between z-30 shadow-sm">
                    <div className="lg:hidden flex items-center gap-3">
                        <div className="w-9 h-9 bg-secondary rounded-xl flex items-center justify-center text-white shadow-md overflow-hidden">
                            {user?.enterprise_logo ? (
                                <img src={user.enterprise_logo} alt="Logo" className="w-full h-full object-cover" />
                            ) : (
                                <Briefcase size={18} />
                            )}
                        </div>
                        <span className="font-bold text-text-primary tracking-tight truncate max-w-[150px]">
                            {user?.enterprise_name || "Directeur"}
                        </span>
                    </div>

                    <div className="hidden lg:block">
                        <h1 className="text-2xl font-bold text-text-primary">Vue d'ensemble</h1>
                        <p className="text-sm text-text-secondary mt-0.5">Gérez vos opérations quotidiennes</p>
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

                        <div className="hidden lg:flex items-center gap-2 px-3 py-2">
                             <div className="w-8 h-8 rounded-lg flex items-center justify-center text-text-primary text-sm font-semibold uppercase overflow-hidden">
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
                            <span className="text-sm font-medium text-text-primary">
                                {user?.full_name || "Directeur"}
                            </span>
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
