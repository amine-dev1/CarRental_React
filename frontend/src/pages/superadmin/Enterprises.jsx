import React, { useEffect, useMemo, useState } from "react";
import { api } from "../../api/http";
import { createPortal } from "react-dom";
import { showSuccess, showError, showInfo } from "../../components/CustomToasts";
import {
    Search,
    RefreshCw,
    Plus,
    Building2,
    Users,
    Car,
    ChevronDown,
    ChevronUp,
    Mail,
    Crown,
    UserCircle,
    X,
    Sparkles,
    MapPin,
    MoreVertical,
    Trash2,
    Power,
    AlertTriangle
} from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../auth/AuthContext";
import CustomSelect from "../../components/common/CustomSelect";
import { CountrySelect, CitySelect } from "../../components/CountryCitySelect";

function StatusBadge({ status = "active" }) {
    const s = String(status).toLowerCase();
    const config =
        s === "active"
            ? {
                text: "text-[#10B981]",
                bg: "bg-[#10B981]/10",
                border: "border-[#10B981]/20",
                dot: "bg-[#10B981]"
            }
            : s === "suspended" || s === "inactive"
                ? {
                    text: "text-[#EF4444]",
                    bg: "bg-[#EF4444]/10",
                    border: "border-[#EF4444]/20",
                    dot: "bg-[#EF4444]"
                }
                : {
                    text: "text-[#F59E0B]",
                    bg: "bg-[#F59E0B]/10",
                    border: "border-[#F59E0B]/20",
                    dot: "bg-[#F59E0B]"
                };

    return (
        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold border ${config.border} ${config.bg} ${config.text} uppercase tracking-wide`}>
            <span className={`h-1.5 w-1.5 rounded-full ${config.dot}`} />
            {status}
        </span>
    );
}

function PlanBadge({ plan }) {
    const p = String(plan).toLowerCase();
    const config =
        p === "enterprise"
            ? { bg: "bg-[#8B5CF6]/10", border: "border-[#8B5CF6]/20", text: "text-[#8B5CF6]", icon: true }
            : p === "pro"
                ? { bg: "bg-[#6366F1]/10", border: "border-[#6366F1]/20", text: "text-[#6366F1]", icon: true }
                : { bg: "bg-[#64748B]/10", border: "border-[#64748B]/20", text: "text-[#64748B]", icon: false };

    return (
        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold border ${config.border} ${config.bg} ${config.text} uppercase tracking-wide shadow-sm`}>
            {config.icon && <Sparkles size={10} />}
            {plan}
        </span>
    );
}

export default function Enterprises() {
    const { darkMode } = useTheme();
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [enterprises, setEnterprises] = useState([]);
    const [query, setQuery] = useState("");

    // UI create
    const [showCreate, setShowCreate] = useState(false);
    const [creating, setCreating] = useState(false);
    const [form, setForm] = useState({
        name: "",
        address: "",
        country: "",
        countryCode: "",
        city: "",
        plan: "Standard",
        status: "active",
    });

    // Expand users
    const [expandedId, setExpandedId] = useState(null);
    const [usersMap, setUsersMap] = useState({});
    const [usersLoadingId, setUsersLoadingId] = useState(null);

    // Action Menu State
    const [activeMenu, setActiveMenu] = useState(null);
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const [statusConfirm, setStatusConfirm] = useState(null);
    const [processing, setProcessing] = useState(null);

    useEffect(() => {
        loadEnterprises();
    }, []);

    async function loadEnterprises() {
        setLoading(true);
        setError("");
        try {
            const data = await api("/api/superadmin/enterprises");
            setEnterprises(data);
        } catch (e) {
            setError(e.message || "Erreur lors du chargement");
        } finally {
            setLoading(false);
        }
    }

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return enterprises;
        return enterprises.filter((e) => (e.name || "").toLowerCase().includes(q));
    }, [enterprises, query]);

    async function createEnterprise(e) {
        e.preventDefault();
        if (!form.name.trim()) return;

        setCreating(true);
        setError("");

        try {
            const created = await api("/api/superadmin/enterprises", {
                method: "POST",
                body: {
                    name: form.name.trim(),
                    address: form.address,
                    country: form.country || undefined,
                    city: form.city || undefined,
                    plan: form.plan,
                    status: form.status
                },
            });

            setEnterprises((prev) => [created, ...prev]);
            setForm({ name: "", address: "", country: "", countryCode: "", city: "", plan: "Standard", status: "active" });
            setShowCreate(false);

            showSuccess("L'entreprise a été créée avec succès.");

        } catch (e2) {
            setError(e2.message || "Erreur création");

            showError("Une erreur est survenue lors de la création.");

        } finally {
            setCreating(false);
        }
    }

    async function toggleUsers(entId) {
        if (expandedId === entId) {
            setExpandedId(null);
            return;
        }

        setExpandedId(entId);

        if (usersMap[entId]) return;

        setUsersLoadingId(entId);
        setError("");

        try {
            const users = await api(`/api/superadmin/enterprises/${entId}/users`);
            setUsersMap((prev) => ({ ...prev, [entId]: users }));
        } catch (e) {
            setError(e.message || "Erreur chargement utilisateurs");
            showError("Erreur lors du chargement");
        } finally {
            setUsersLoadingId(null);
        }
    }

    function directorOf(users = []) {
        return users.find((u) => u.role === "director");
    }
    function agentsOf(users = []) {
        return users.filter((u) => u.role === "agent");
    }

    const handleStatusClick = (enterprise) => {
        setStatusConfirm(enterprise);
        setActiveMenu(null);
    };

    const confirmStatusUpdate = async () => {
        if (!statusConfirm) return;
        const enterprise = statusConfirm;

        try {
            setProcessing(enterprise.id);
            const newStatus = enterprise.status === 'active' ? 'suspended' : 'active';
            await api(`/api/superadmin/enterprises/${enterprise.id}/status`, {
                method: 'PATCH',
                body: { status: newStatus }
            });

            setEnterprises(prev => prev.map(e =>
                e.id === enterprise.id ? { ...e, status: newStatus } : e
            ));

            showInfo(`L'entreprise est maintenant ${newStatus === 'active' ? 'active' : 'suspendue'}.`);

            setStatusConfirm(null);
        } catch (error) {
            console.error("Error updating status:", error);
            showError("Erreur lors de la mise à jour du statut");
        } finally {
            setProcessing(null);
        }
    };

    const handleDeleteClick = (enterprise) => {
        setDeleteConfirm(enterprise);
        setActiveMenu(null);
    };

    const confirmDelete = async () => {
        if (!deleteConfirm) return;

        try {
            setProcessing(deleteConfirm.id);
            await api(`/api/superadmin/enterprises/${deleteConfirm.id}`, {
                method: 'DELETE'
            });

            setEnterprises(prev => prev.filter(e => e.id !== deleteConfirm.id));

            showSuccess("Entreprise supprimée avec succès !");

            setDeleteConfirm(null);
        } catch (error) {
            console.error("Error deleting enterprise:", error);
            showError("Erreur lors de la suppression de l'entreprise");
        } finally {
            setProcessing(null);
        }
    };

    return (
        <div className="space-y-6 animate-fadeIn">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className={`text-3xl font-bold flex items-center gap-3 ${darkMode ? 'text-[#F1F5F9]' : 'text-[#0F172A]'}`}>
                        <div className="w-10 h-10 bg-[#4A7BDE] rounded-xl flex items-center justify-center shadow-lg shadow-[#4A7BDE]/20">
                            <Building2 className="text-white" size={20} />
                        </div>
                        Entreprises
                    </h1>
                    <p className={`text-sm mt-1 font-medium ${darkMode ? 'text-[#94A3B8]' : 'text-[#475569]'}`}>Gestion globale des commerçants et flottes</p>
                </div>
                <div className="hidden md:flex items-center gap-3 text-xs">
                    <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border shadow-sm ${darkMode ? 'bg-[#111827] border-white/5' : 'bg-white border-[#E2E8F0]'}`}>
                        <Building2 size={16} className="text-[#4A7BDE]" />
                        <span className={`font-bold ${darkMode ? 'text-[#F1F5F9]' : 'text-[#0F172A]'}`}>{filtered.length}</span>
                        <span className={`font-semibold uppercase tracking-wider text-[10px] ${darkMode ? 'text-[#94A3B8]' : 'text-[#64748B]'}`}>Entreprises</span>
                    </div>
                </div>
            </div>

            {/* Toolbar */}
            <div className={`p-4 rounded-2xl shadow-sm border backdrop-blur-sm transition-colors duration-200 ${darkMode ? 'bg-[#111827] border-white/5' : 'bg-white border-[#E2E8F0]'}`}>
                <div className="flex flex-wrap items-center gap-3">
                    <div className="flex-1 min-w-[200px] relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" size={18} />
                        <input
                            type="text"
                            placeholder="Rechercher une entreprise..."
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-[#4A7BDE]/20 focus:border-[#4A7BDE] transition-all placeholder:text-[#94A3B8] ${darkMode ? 'bg-white/5 border-white/10 text-[#F1F5F9]' : 'bg-white border-[#E2E8F0] text-[#0F172A]'
                                }`}
                        />
                    </div>
                    <button
                        onClick={loadEnterprises}
                        className={`group flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all border ${darkMode
                                ? 'text-[#94A3B8] border-white/5 hover:bg-white/5 hover:text-[#F1F5F9]'
                                : 'text-[#475569] border-[#E2E8F0] hover:bg-[#F8FAFC] hover:border-[#94A3B8]'
                            }`}
                    >
                        <RefreshCw size={16} className={`${darkMode ? 'text-[#94A3B8]' : 'text-[#64748B]'} group-hover:rotate-180 transition-transform duration-500`} />
                        <span className="hidden sm:inline">Rafraîchir</span>
                    </button>
                    <button
                        onClick={() => setShowCreate((v) => !v)}
                        className="group flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold btn-premium-gradient text-white shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98]"
                    >
                        {showCreate ? <X size={16} /> : <Plus size={16} />}
                        {showCreate ? "Fermer" : "Nouvelle Entreprise"}
                    </button>
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <div className="rounded-xl bg-error/10 border border-error/20 p-4 text-sm text-error flex items-center gap-2 animate-slideDown">
                    <div className="w-1.5 h-1.5 rounded-full bg-error animate-pulse" />
                    {error}
                </div>
            )}

            {/* Create Modal */}
            {showCreate && createPortal(
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
                    <div
                        className={`
                            relative w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden animate-scaleUp
                            ${darkMode ? 'bg-[#0F172A] border border-[#1E293B]' : 'bg-white'}
                        `}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Modal Header */}
                        <div className={`px-8 py-6 flex items-center justify-between border-b ${darkMode ? 'border-[#1E293B]' : 'border-slate-100'}`}>
                            <h3 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-slate-800'}`}>
                                Nouvelle entreprise
                            </h3>
                            <button
                                onClick={() => setShowCreate(false)}
                                className={`p-2 rounded-full transition-colors ${darkMode ? 'hover:bg-white/10 text-gray-400' : 'hover:bg-slate-100 text-slate-400'}`}
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={createEnterprise}>
                            <div className="p-8 space-y-8 max-h-[70vh] overflow-y-auto">
                                <div className="grid gap-x-8 gap-y-6 md:grid-cols-2">
                                    {/* Name Input */}
                                    <div className="space-y-2 md:col-span-2">
                                        <label className="flex text-[13px] font-semibold text-[#94A3B8] uppercase tracking-wide">
                                            Nom de l'entreprise <span className="text-[#EF4444] ml-1">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="Ex: Acme Corporation"
                                            value={form.name}
                                            onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                                            className={`
                                                w-full px-4 py-3.5 rounded-xl border text-[15px] transition-all outline-none
                                                placeholder-[#9CA3AF] text-[#0F172A]
                                                ${darkMode
                                                    ? 'bg-[#1E293B] border-[#334155] focus:border-[#3B82F6] hover:border-[#475569] text-white'
                                                    : 'bg-white border-[#E2E8F0] focus:border-[#10B981] hover:border-[#CBD5E1] focus:ring-[3px] focus:ring-[#10B981]/10'
                                                }
                                                ${form.name ? (darkMode ? 'border-[#3B82F6]' : 'border-[#10B981]') : ''}
                                            `}
                                            required
                                            autoFocus
                                        />
                                    </div>

                                    {/* Address Input */}
                                    <div className="space-y-2 md:col-span-2">
                                        <label className="flex text-[13px] font-semibold text-[#94A3B8] uppercase tracking-wide">
                                            Adresse
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="Ex: 123 Rue Principale, Casablanca"
                                            value={form.address}
                                            onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))}
                                            className={`
                                                w-full px-4 py-3.5 rounded-xl border text-[15px] transition-all outline-none
                                                placeholder-[#9CA3AF] text-[#0F172A]
                                                ${darkMode
                                                    ? 'bg-[#1E293B] border-[#334155] focus:border-[#3B82F6] hover:border-[#475569] text-white'
                                                    : 'bg-white border-[#E2E8F0] focus:border-[#3B82F6] hover:border-[#CBD5E1] focus:ring-[3px] focus:ring-blue-500/10'
                                                }
                                            `}
                                        />
                                    </div>

                                    {/* Country + City */}
                                    <div className="space-y-2">
                                        <label className="flex text-[13px] font-semibold text-[#94A3B8] uppercase tracking-wide">
                                            Pays
                                        </label>
                                        <CountrySelect
                                            value={form.country}
                                            darkMode={darkMode}
                                            onChange={(countryName, isoCode) =>
                                                setForm((p) => ({ ...p, country: countryName, countryCode: isoCode, city: "" }))
                                            }
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="flex text-[13px] font-semibold text-[#94A3B8] uppercase tracking-wide">
                                            Ville
                                        </label>
                                        <CitySelect
                                            countryCode={form.countryCode}
                                            value={form.city}
                                            darkMode={darkMode}
                                            onChange={(cityName) => setForm((p) => ({ ...p, city: cityName }))}
                                        />
                                    </div>

                                    {/* Plan Select */}
                                    <div className="space-y-2">
                                        <label className="flex text-[13px] font-semibold text-[#94A3B8] uppercase tracking-wide">
                                            Plan <span className="text-[#EF4444] ml-1">*</span>
                                        </label>
                                            <CustomSelect
                                                value={form.plan}
                                                onChange={(val) => setForm((p) => ({ ...p, plan: val }))}
                                                variant="form"
                                                options={[
                                                    { value: "Standard", label: "Standard" },
                                                    { value: "Pro", label: "Pro" },
                                                    { value: "Enterprise", label: "Enterprise" }
                                                ]}
                                            />
                                    </div>

                                    {/* Status Select */}
                                    <div className="space-y-2">
                                        <label className="flex text-[13px] font-semibold text-[#94A3B8] uppercase tracking-wide">
                                            Statut <span className="text-[#EF4444] ml-1">*</span>
                                        </label>
                                            <CustomSelect
                                                value={form.status}
                                                onChange={(val) => setForm((p) => ({ ...p, status: val }))}
                                                variant="form"
                                                options={[
                                                    { value: "active", label: "Actif" },
                                                    { value: "suspended", label: "Suspendu" }
                                                ]}
                                            />
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className={`px-8 py-6 flex justify-end gap-3 border-t ${darkMode ? 'border-[#1E293B] bg-[#0F172A]' : 'border-slate-100 bg-[#F8FAFC]'}`}>
                                <button
                                    type="button"
                                    onClick={() => setShowCreate(false)}
                                    className={`
                                        px-6 py-3 rounded-xl text-[15px] font-medium transition-all border
                                        ${darkMode
                                            ? 'border-[#334155] text-[#94A3B8] hover:bg-[#1E293B] hover:text-white hover:border-[#475569]'
                                            : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-800 hover:border-slate-300'
                                        }
                                    `}
                                >
                                    Annuler
                                </button>
                                <button
                                    type="submit"
                                    disabled={creating || !form.name}
                                    className={`
                                        px-8 py-3 rounded-xl text-[15px] font-bold text-white shadow-lg transition-all 
                                        flex items-center gap-2
                                        ${creating || !form.name
                                            ? 'bg-blue-400 opacity-50 cursor-not-allowed'
                                            : 'bg-[#3B82F6] hover:bg-[#2563EB] hover:-translate-y-[1px] shadow-blue-500/30'
                                        }
                                    `}
                                >
                                    {creating ? (
                                        <RefreshCw size={18} className="animate-spin" />
                                    ) : (
                                        <>
                                            <span>Créer l'entreprise</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>,
                document.body
            )}

            {/* Enterprises Grid/Table */}
            <div className={`rounded-2xl shadow-sm border overflow-hidden transition-colors ${darkMode ? 'bg-[#111827] border-white/5' : 'bg-white border-[#E2E8F0]'}`}>
                {loading ? (
                    <div className="py-20 flex flex-col items-center justify-center gap-4">
                        <RefreshCw size={32} className="text-blue-500 animate-spin" />
                        <p className="text-sm text-gray-500 font-medium">Chargement des entreprises...</p>
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="py-20 flex flex-col items-center justify-center gap-4">
                        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${darkMode ? 'bg-white/5' : 'bg-gray-50'}`}>
                            <Building2 size={32} className="text-gray-400" />
                        </div>
                        <div className="text-center">
                            <p className={`text-sm font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Aucune entreprise trouvée</p>
                            <p className="text-xs text-gray-500 mt-1">Commencez par créer une nouvelle entreprise</p>
                        </div>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100 dark:divide-white/5">
                        {filtered.map((ent, idx) => {
                            const isExpanded = expandedId === ent.id;
                            const users = usersMap[ent.id] || [];
                            const director = directorOf(users);
                            const agents = agentsOf(users);
                            const planLower = ent.plan?.toLowerCase();
                            const isEnterprise = planLower === 'enterprise';
                            const isPro = planLower === 'pro';

                            // Determine border color based on plan
                            const borderColor = isEnterprise ? '#8B5CF6' : isPro ? '#6366F1' : '#64748B';

                            return (
                                <div
                                    key={ent.id}
                                    className={`
                                        relative transition-all duration-200 group
                                        ${darkMode ? 'hover:bg-white/[0.02]' : 'hover:bg-slate-50'}
                                    `}
                                >
                                    {/* Left Border colored by Plan */}
                                    <div
                                        className="absolute left-0 top-0 bottom-0 w-1 transition-all duration-300 group-hover:w-1.5"
                                        style={{ backgroundColor: borderColor }}
                                    />

                                    {/* Main Row */}
                                    <div className="p-5 pl-7 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                                        {/* Enterprise Info */}
                                        <div className="lg:col-span-4 flex items-center gap-4">
                                            <div className={`
                                                w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-105
                                                ${isEnterprise ? 'bg-violet-500/10 text-violet-500' : isPro ? 'bg-indigo-500/10 text-indigo-500' : 'bg-slate-500/10 text-slate-500'}
                                            `}>
                                                <Building2 size={22} />
                                            </div>
                                            <div className="min-w-0">
                                                <h3 className={`font-bold truncate text-base ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                                                    {ent.name}
                                                </h3>
                                                <p className="text-xs truncate flex items-center gap-1.5 text-gray-500 mt-0.5">
                                                    <MapPin size={12} />
                                                    {ent.address || "Adresse non définie"}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Plan & Status */}
                                        <div className="lg:col-span-3 flex items-center gap-3">
                                            <PlanBadge plan={ent.plan} />
                                            <StatusBadge status={ent.status} />
                                        </div>

                                        {/* Stats */}
                                        <div className="lg:col-span-3 flex items-center gap-6">
                                            <div className="flex items-center gap-3 group/stat cursor-help" title="Nombre d'agents">
                                                <div className={`p-1.5 rounded-lg ${darkMode ? 'bg-indigo-500/20' : 'bg-indigo-50'}`}>
                                                    <Users size={16} className="text-indigo-500" />
                                                </div>
                                                <div>
                                                    <div className={`font-bold text-sm leading-none ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                                                        {ent.agents_count || 0}
                                                    </div>
                                                    <span className="text-[10px] uppercase text-gray-500 font-semibold">Agents</span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3 group/stat cursor-help" title="Nombre de véhicules">
                                                <div className={`p-1.5 rounded-lg ${darkMode ? 'bg-emerald-500/20' : 'bg-emerald-50'}`}>
                                                    <Car size={16} className="text-emerald-500" />
                                                </div>
                                                <div>
                                                    <div className={`font-bold text-sm leading-none ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                                                        {ent.vehicles_count || 0}
                                                    </div>
                                                    <span className="text-[10px] uppercase text-gray-500 font-semibold">Véhicules</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        {/* Actions */}
                                        <div className="lg:col-span-2 flex justify-end items-center gap-2">
                                            <button
                                                onClick={() => toggleUsers(ent.id)}
                                                className={`
                                                    flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all border
                                                    ${isExpanded
                                                        ? (darkMode ? 'bg-white text-slate-900 border-white' : 'bg-slate-800 text-white border-slate-800 shadow-md')
                                                        : (darkMode
                                                            ? 'border-white/10 text-gray-400 hover:bg-white/5 hover:text-white hover:border-white/20'
                                                            : 'border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-700 hover:border-slate-300')
                                                    }
                                                `}
                                            >
                                                <span>Équipe</span>
                                                {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                                            </button>

                                            <div className="relative">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setActiveMenu(activeMenu === ent.id ? null : ent.id);
                                                    }}
                                                    className={`p-2 rounded-lg transition-all ${activeMenu === ent.id
                                                            ? (darkMode ? 'bg-white/10 text-white' : 'bg-slate-100 text-slate-900')
                                                            : (darkMode ? 'text-gray-400 hover:text-white hover:bg-white/5' : 'text-slate-400 hover:text-slate-700 hover:bg-slate-50')
                                                        }`}
                                                >
                                                    <MoreVertical size={18} />
                                                </button>

                                                {/* Dropdown Menu */}
                                                {activeMenu === ent.id && (
                                                    <div
                                                        className={`absolute right-0 w-48 rounded-xl shadow-xl border z-[60] overflow-hidden ${idx >= filtered.length - 2
                                                                ? 'bottom-full mb-2 origin-bottom-right'
                                                                : 'mt-2 origin-top-right'
                                                            } ${darkMode ? 'bg-[#1E293B] border-[#334155]' : 'bg-white border-slate-100'
                                                            }`}
                                                        onClick={(e) => e.stopPropagation()}
                                                    >
                                                        <button
                                                            type="button"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleStatusClick(ent);
                                                            }}
                                                            className={`w-full text-left px-4 py-3 text-sm font-medium flex items-center gap-3 transition-colors cursor-pointer ${ent.status === 'active'
                                                                    ? ('text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/10')
                                                                    : ('text-green-500 hover:bg-green-50 dark:hover:bg-green-900/10')
                                                                }`}
                                                        >
                                                            <Power size={16} />
                                                            {ent.status === 'active' ? 'Suspendre' : 'Activer'}
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleDeleteClick(ent);
                                                            }}
                                                            className="w-full text-left px-4 py-3 text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 flex items-center gap-3 transition-colors cursor-pointer"
                                                        >
                                                            <Trash2 size={16} />
                                                            Supprimer
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Expanded Team Section */}
                                    {isExpanded && (
                                        <div className={`px-6 pb-6 animate-slideDown ${darkMode ? 'bg-[#0B1220]' : 'bg-[#F8FAFC]'}`}>
                                            <div className={`rounded-xl p-6 border mt-2 shadow-sm ${darkMode ? 'bg-[#111827] border-white/5' : 'bg-white border-[#E2E8F0]'}`}>
                                                <ExpandedContent
                                                    loading={usersLoadingId === ent.id}
                                                    director={director}
                                                    agents={agents}
                                                    darkMode={darkMode}
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Delete Confirmation Modal */}
            {deleteConfirm && createPortal(
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
                    <div
                        className={`
                            w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-scaleUp
                            ${darkMode ? 'bg-[#1E293B] border border-[#334155]' : 'bg-white'}
                        `}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="p-6">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                                    <AlertTriangle className="text-red-600" size={24} />
                                </div>
                                <div>
                                    <h3 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                                        Supprimer l'entreprise ?
                                    </h3>
                                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-slate-500'}`}>
                                        Cette action est irréversible.
                                    </p>
                                </div>
                            </div>

                            <p className={`text-sm mb-6 ${darkMode ? 'text-gray-300' : 'text-slate-600'}`}>
                                Êtes-vous sûr de vouloir supprimer <strong>{deleteConfirm.name}</strong> ?
                                <br /><br />
                                L'entreprise ainsi que tous les comptes associés (directeurs, agents) et leurs données seront définitivement supprimés.
                            </p>

                            <div className="flex justify-end gap-3">
                                <button
                                    onClick={() => setDeleteConfirm(null)}
                                    className={`
                                        px-4 py-2.5 rounded-xl text-sm font-medium transition-all border
                                        ${darkMode
                                            ? 'border-[#334155] text-gray-300 hover:bg-white/5'
                                            : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                                        }
                                    `}
                                >
                                    Annuler
                                </button>
                                <button
                                    onClick={confirmDelete}
                                    disabled={processing === deleteConfirm.id}
                                    className="px-4 py-2.5 rounded-xl text-sm font-bold text-white bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/20 transition-all flex items-center gap-2"
                                >
                                    {processing === deleteConfirm.id ? (
                                        <RefreshCw size={16} className="animate-spin" />
                                    ) : (
                                        <Trash2 size={16} />
                                    )}
                                    <span>Supprimer définitivement</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>,
                document.body
            )}

            {/* Status Confirmation Modal */}
            {statusConfirm && createPortal(
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
                    <div
                        className={`
                            w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-scaleUp
                            ${darkMode ? 'bg-[#1E293B] border border-[#334155]' : 'bg-white'}
                        `}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="p-6">
                            <div className="flex items-center gap-4 mb-4">
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${statusConfirm.status === 'active'
                                        ? 'bg-orange-100 text-orange-600'
                                        : 'bg-green-100 text-green-600'
                                    }`}>
                                    <Power size={24} />
                                </div>
                                <div>
                                    <h3 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                                        {statusConfirm.status === 'active' ? "Suspendre l'entreprise ?" : "Réactiver l'entreprise ?"}
                                    </h3>
                                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-slate-500'}`}>
                                        {statusConfirm.status === 'active' ? "Action de suspension" : "Action de réactivation"}
                                    </p>
                                </div>
                            </div>

                            <p className={`text-sm mb-6 ${darkMode ? 'text-gray-300' : 'text-slate-600'}`}>
                                {statusConfirm.status === 'active' ? (
                                    <>
                                        Êtes-vous sûr de vouloir suspendre <strong>{statusConfirm.name}</strong> ?
                                        <br /><br />
                                        Les comptes directeurs et agents associés ne pourront plus accéder au système tant que l'entreprise est suspendue.
                                    </>
                                ) : (
                                    <>
                                        Êtes-vous sûr de vouloir réactiver <strong>{statusConfirm.name}</strong> ?
                                        <br /><br />
                                        L'accès au système sera rétabli pour tous les comptes associés.
                                    </>
                                )}
                            </p>

                            <div className="flex justify-end gap-3">
                                <button
                                    onClick={() => setStatusConfirm(null)}
                                    className={`
                                        px-4 py-2.5 rounded-xl text-sm font-medium transition-all border
                                        ${darkMode
                                            ? 'border-[#334155] text-gray-300 hover:bg-white/5'
                                            : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                                        }
                                    `}
                                >
                                    Annuler
                                </button>
                                <button
                                    onClick={confirmStatusUpdate}
                                    disabled={processing === statusConfirm.id}
                                    className={`
                                        px-4 py-2.5 rounded-xl text-sm font-bold text-white shadow-lg transition-all flex items-center gap-2
                                        ${statusConfirm.status === 'active'
                                            ? 'bg-orange-500 hover:bg-orange-600 shadow-orange-500/20'
                                            : 'bg-green-500 hover:bg-green-600 shadow-green-500/20'
                                        }
                                    `}
                                >
                                    {processing === statusConfirm.id ? (
                                        <RefreshCw size={16} className="animate-spin" />
                                    ) : (
                                        <Power size={16} />
                                    )}
                                    <span>
                                        {statusConfirm.status === 'active' ? "Suspendre l'accès" : "Réactiver l'accès"}
                                    </span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>,
                document.body
            )}

            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes slideDown {
                    from { opacity: 0; transform: translateY(-10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fadeIn {
                    animation: fadeIn 0.4s ease-out forwards;
                }
                .animate-slideDown {
                    animation: slideDown 0.3s ease-out forwards;
                }
            `}</style>
        </div>
    );
}

function ExpandedContent({ loading, director, agents }) {
    if (loading) {
        return (
            <div className="flex items-center justify-center py-8 gap-3">
                <RefreshCw size={20} className="text-secondary animate-spin" />
                <span className="text-sm text-text-secondary font-medium">Chargement de l'équipe...</span>
            </div>
        );
    }

    return (
        <div className="grid gap-6 md:grid-cols-2">
            {/* Director */}
            <div className="space-y-3">
                <div className="flex items-center gap-2">
                    <Crown className="text-warning" size={16} />
                    <h4 className="text-xs font-bold text-text-secondary uppercase tracking-wider">Directeur</h4>
                </div>
                {director ? (
                    <div className="bg-surface rounded-xl p-4 border border-border flex items-center gap-3 hover:shadow-md transition-shadow">
                        <div className="w-10 h-10 bg-warning/10 rounded-lg flex items-center justify-center flex-shrink-0">
                            <UserCircle className="text-warning" size={20} />
                        </div>
                        <div className="min-w-0 flex-1">
                            <div className="text-sm font-bold text-text-primary truncate">{director.email}</div>
                            <div className="text-xs text-text-muted">Responsable principal</div>
                        </div>
                    </div>
                ) : (
                    <div className="bg-surface/50 rounded-xl p-4 border border-dashed border-border text-center">
                        <p className="text-xs text-text-muted">Aucun directeur assigné</p>
                    </div>
                )}
            </div>

            {/* Agents */}
            <div className="space-y-3">
                <div className="flex items-center gap-2">
                    <Users className="text-secondary" size={16} />
                    <h4 className="text-xs font-bold text-text-secondary uppercase tracking-wider">
                        Agents ({agents.length})
                    </h4>
                </div>
                <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar">
                    {agents.length > 0 ? (
                        agents.map((agent) => (
                            <div
                                key={agent.id}
                                className="bg-surface rounded-lg p-3 border border-border flex items-center gap-3 hover:shadow-md transition-all hover:scale-[1.01]"
                            >
                                <div className="w-8 h-8 bg-secondary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <Mail className="text-secondary" size={14} />
                                </div>
                                <div className="text-xs font-medium text-text-primary truncate">{agent.email}</div>
                            </div>
                        ))
                    ) : (
                        <div className="bg-surface/50 rounded-xl p-4 border border-dashed border-border text-center">
                            <p className="text-xs text-text-muted">Aucun agent dans l'équipe</p>
                        </div>
                    )}
                </div>
            </div>



            <style>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: #f1f5f9;
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #cbd5e1;
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #94a3b8;
                }
            `}</style>
        </div>
    );
}