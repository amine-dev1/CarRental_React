import React, { useEffect, useMemo, useState } from "react";
import { api } from "../../api/http";
import toast from "react-hot-toast";
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
    Sparkles
} from "lucide-react";

function StatusBadge({ status = "active" }) {
    const s = String(status).toLowerCase();
    const config =
        s === "active"
            ? {
                text: "text-accent",
                bg: "bg-accent/10",
                border: "border-accent/20",
                dot: "bg-accent"
            }
            : s === "suspended"
                ? {
                    text: "text-error",
                    bg: "bg-error/10",
                    border: "border-error/20",
                    dot: "bg-error"
                }
                : {
                    text: "text-warning",
                    bg: "bg-warning/10",
                    border: "border-warning/20",
                    dot: "bg-warning"
                };

    return (
        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold border ${config.border} ${config.bg} ${config.text} uppercase tracking-wide`}>
            <span className={`h-1.5 w-1.5 rounded-full ${config.dot} animate-pulse`} />
            {status}
        </span>
    );
}

function PlanBadge({ plan }) {
    const config =
        plan === "Enterprise"
            ? { bg: "bg-primary", text: "text-white", icon: true }
            : plan === "Pro"
                ? { bg: "bg-secondary", text: "text-white", icon: true }
                : { bg: "bg-background", text: "text-text-secondary", icon: false };

    return (
        <span className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-[10px] font-bold ${config.bg} ${config.text} uppercase tracking-wide shadow-sm`}>
            {config.icon && <Sparkles size={10} />}
            {plan}
        </span>
    );
}

export default function Enterprises() {
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
        plan: "Free",
        status: "active",
    });

    // Expand users
    const [expandedId, setExpandedId] = useState(null);
    const [usersMap, setUsersMap] = useState({});
    const [usersLoadingId, setUsersLoadingId] = useState(null);

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
                    plan: form.plan,
                    status: form.status
                },
            });

            setEnterprises((prev) => [created, ...prev]);
            setForm({ name: "", address: "", plan: "Free", status: "active" });
            setShowCreate(false);
            toast.success("Entreprise créée avec succès ✨");
        } catch (e2) {
            setError(e2.message || "Erreur création");
            toast.error("Erreur lors de la création");
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
            toast.error("Erreur lors du chargement");
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

    return (
        <div className="space-y-6 animate-fadeIn">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-text-primary flex items-center gap-3">
                        <div className="w-10 h-10 bg-secondary rounded-xl flex items-center justify-center">
                            <Building2 className="text-white" size={20} />
                        </div>
                        Entreprises
                    </h1>
                    <p className="text-sm text-text-secondary mt-1">Gestion globale des commerçants et flottes</p>
                </div>
                <div className="hidden md:flex items-center gap-3 text-xs text-text-secondary">
                    <div className="flex items-center gap-2 bg-surface px-4 py-2 rounded-xl border border-border">
                        <Building2 size={16} className="text-secondary" />
                        <span className="font-semibold text-text-primary">{filtered.length}</span> Entreprises
                    </div>
                </div>
            </div>

            {/* Toolbar */}
            <div className="bg-surface p-4 rounded-2xl shadow-sm border border-border backdrop-blur-sm">
                <div className="flex flex-wrap items-center gap-3">
                    <div className="flex-1 min-w-[200px] relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
                        <input
                            type="text"
                            placeholder="Rechercher une entreprise..."
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all bg-surface text-text-primary placeholder:text-text-muted"
                        />
                    </div>
                    <button
                        onClick={loadEnterprises}
                        className="group flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-text-secondary hover:bg-background transition-all border border-border hover:border-text-muted"
                    >
                        <RefreshCw size={16} className="group-hover:rotate-180 transition-transform duration-500" />
                        <span className="hidden sm:inline">Rafraîchir</span>
                    </button>
                    <button
                        onClick={() => setShowCreate((v) => !v)}
                        className="group flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold bg-secondary text-white shadow-lg shadow-secondary/30 hover:shadow-xl hover:shadow-secondary/40 transition-all hover:scale-[1.02] active:scale-[0.98]"
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

            {/* Create Form */}
            {showCreate && (
                <div className="bg-surface rounded-2xl shadow-lg border border-border overflow-hidden animate-slideDown">
                    <div className="bg-secondary px-6 py-4 flex items-center gap-3">
                        <div className="w-8 h-8 bg-white/20 backdrop-blur rounded-lg flex items-center justify-center">
                            <Plus className="text-white" size={18} />
                        </div>
                        <h3 className="text-lg font-bold text-white">Ajouter une nouvelle entreprise</h3>
                    </div>
                    <form onSubmit={createEnterprise} className="p-6 space-y-5">
                        <div className="grid gap-5 md:grid-cols-2">
                            <div>
                                <label className="block text-xs font-bold text-text-secondary mb-2 uppercase tracking-wide">
                                    Nom de l'entreprise *
                                </label>
                                <input
                                    type="text"
                                    placeholder="Ex: Agence Transport Casablanca"
                                    value={form.name}
                                    onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                                    className="w-full px-4 py-2.5 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all bg-surface text-text-primary"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-600 mb-2 uppercase tracking-wide">
                                    Adresse
                                </label>
                                <input
                                    type="text"
                                    placeholder="Ex: Casablanca, Maroc"
                                    value={form.address}
                                    onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))}
                                    className="w-full px-4 py-2.5 rounded-xl border border-border text-sm focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all bg-surface text-text-primary"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-600 mb-2 uppercase tracking-wide">
                                    Plan
                                </label>
                                <select
                                    className="w-full px-4 py-2.5 rounded-xl border border-border bg-surface text-sm focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all text-text-primary"
                                    value={form.plan}
                                    onChange={(e) => setForm((p) => ({ ...p, plan: e.target.value }))}
                                >
                                    <option value="Free">Free</option>
                                    <option value="Pro">Pro</option>
                                    <option value="Enterprise">Enterprise</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-600 mb-2 uppercase tracking-wide">
                                    Statut
                                </label>
                                <select
                                    className="w-full px-4 py-2.5 rounded-xl border border-border bg-surface text-sm focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all text-text-primary"
                                    value={form.status}
                                    onChange={(e) => setForm((p) => ({ ...p, status: e.target.value }))}
                                >
                                    <option value="active">Actif</option>
                                    <option value="suspended">Suspendu</option>
                                </select>
                            </div>
                        </div>
                        <div className="flex justify-end gap-3 pt-2">
                            <button
                                type="button"
                                onClick={() => setShowCreate(false)}
                                className="px-5 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-100 transition-all"
                            >
                                Annuler
                            </button>
                            <button
                                type="submit"
                                disabled={creating}
                                className="px-6 py-2.5 rounded-xl text-sm font-bold bg-secondary text-white shadow-lg shadow-secondary/30 hover:shadow-xl hover:shadow-secondary/40 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {creating ? (
                                    <span className="flex items-center gap-2">
                                        <RefreshCw size={14} className="animate-spin" />
                                        Création...
                                    </span>
                                ) : (
                                    "Créer l'entreprise"
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Enterprises Grid/Table */}
            <div className="bg-surface rounded-2xl shadow-sm border border-border overflow-hidden">
                {loading ? (
                    <div className="py-20 flex flex-col items-center justify-center gap-4">
                        <RefreshCw size={32} className="text-secondary animate-spin" />
                        <p className="text-sm text-text-muted font-medium">Chargement des entreprises...</p>
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="py-20 flex flex-col items-center justify-center gap-4">
                        <div className="w-16 h-16 bg-background rounded-2xl flex items-center justify-center">
                            <Building2 size={32} className="text-text-muted" />
                        </div>
                        <div className="text-center">
                            <p className="text-sm font-semibold text-text-secondary">Aucune entreprise trouvée</p>
                            <p className="text-xs text-text-muted mt-1">Commencez par créer une nouvelle entreprise</p>
                        </div>
                    </div>
                ) : (
                    <div className="divide-y divide-border">
                        {filtered.map((ent, idx) => {
                            const isExpanded = expandedId === ent.id;
                            const users = usersMap[ent.id] || [];
                            const director = directorOf(users);
                            const agents = agentsOf(users);

                            return (
                                <div
                                    key={ent.id}
                                    className="hover:bg-background/50 transition-all duration-200 animate-fadeIn"
                                    style={{ animationDelay: `${idx * 50}ms` }}
                                >
                                    {/* Main Row */}
                                    <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
                                        {/* Enterprise Info */}
                                        <div className="lg:col-span-4 flex items-center gap-4">
                                            <div className="w-12 h-12 bg-secondary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                                                <Building2 className="text-secondary" size={20} />
                                            </div>
                                            <div className="min-w-0">
                                                <h3 className="font-bold text-text-primary truncate">{ent.name}</h3>
                                                <p className="text-xs text-text-secondary truncate flex items-center gap-1">
                                                    {ent.address || "Adresse non définie"}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Plan & Status */}
                                        <div className="lg:col-span-3 flex items-center gap-2">
                                            <PlanBadge plan={ent.plan} />
                                            <StatusBadge status={ent.status} />
                                        </div>

                                        {/* Stats */}
                                        <div className="lg:col-span-3 flex items-center gap-4">
                                            <div className="flex items-center gap-2 text-xs">
                                                <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                                                    <Users size={14} className="text-primary" />
                                                </div>
                                                <div>
                                                    <div className="font-bold text-text-primary">{ent.agents_count || 0}</div>
                                                    <div className="text-text-muted text-[10px]">Agents</div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 text-xs">
                                                <div className="w-8 h-8 bg-accent/10 rounded-lg flex items-center justify-center">
                                                    <Car size={14} className="text-accent" />
                                                </div>
                                                <div>
                                                    <div className="font-bold text-text-primary">{ent.vehicles_count || 0}</div>
                                                    <div className="text-text-muted text-[10px]">Véhicules</div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="lg:col-span-2 flex justify-end">
                                            <button
                                                onClick={() => toggleUsers(ent.id)}
                                                className={`group flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${isExpanded
                                                        ? 'bg-primary text-white shadow-lg'
                                                        : 'bg-background text-text-secondary hover:bg-border'
                                                    }`}
                                            >
                                                <Users size={14} />
                                                <span>Équipe</span>
                                                {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Expanded Team Section */}
                                    {isExpanded && (
                                        <div className="px-6 pb-6 animate-slideDown">
                                            <div className="bg-background rounded-xl p-6 border border-border">
                                                <ExpandedContent
                                                    loading={usersLoadingId === ent.id}
                                                    director={director}
                                                    agents={agents}
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

            {/* Add custom CSS for animations */}
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