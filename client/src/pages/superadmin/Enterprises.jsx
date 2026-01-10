import React, { useEffect, useMemo, useState } from "react";
import { api } from "../../api/http";
import PageHeader from "../../components/dashboard/PageHeader";
import Card from "../../components/Card";
import Button from "../../components/Button";
import Input from "../../components/Input";
import "./enterprise.css";
import toast from "react-hot-toast";

function StatusBadge({ status = "active" }) {
    const s = String(status).toLowerCase();
    const tone =
        s === "active"
            ? "text-green-600 border-green-200 bg-green-50"
            : s === "suspended"
                ? "text-red-600 border-red-200 bg-red-50"
                : "text-amber-600 border-amber-200 bg-amber-50";

    return (
        <span
            className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-[10px] font-bold border ${tone}`}
        >
            <span className={`h-1.5 w-1.5 rounded-full bg-current opacity-70`} />
            {status.toUpperCase()}
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

    // Expand users (director/agents)
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
            toast.success("Entreprise créée avec succès");
        } catch (e2) {
            setError(e2.message || "Erreur création");
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
        <div className="space-y-6">
            <PageHeader
                title="Entreprises"
                subtitle="Gestion globale des commerçants et flottes"
            />

            {/* Toolbar */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex flex-wrap items-center gap-4">
                <div className="flex-1 min-w-[200px]">
                    <Input
                        placeholder="Rechercher une agence..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={loadEnterprises}
                        className="px-4 py-2 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 transition border border-slate-200"
                    >
                        Rafraîchir
                    </button>
                    <button
                        onClick={() => setShowCreate((v) => !v)}
                        className="px-4 py-2 rounded-xl text-sm font-bold bg-blue-600 text-white shadow-sm hover:bg-blue-700 transition"
                    >
                        {showCreate ? "Fermer" : "+ Nouvelle Agence"}
                    </button>
                </div>
            </div>

            {error && (
                <div className="rounded-xl bg-red-50 p-4 text-sm text-red-600">
                    {error}
                </div>
            )}

            {showCreate && (
                <Card title="Ajouter une agence">
                    <form onSubmit={createEnterprise} className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-2">
                            <Input
                                label="Nom de l'agence"
                                placeholder="..."
                                value={form.name}
                                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                                required
                            />
                            <Input
                                label="Adresse"
                                placeholder="..."
                                value={form.address}
                                onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))}
                            />
                            <div>
                                <label className="mb-1 block text-xs font-bold text-slate-500 uppercase">Plan</label>
                                <select
                                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                    value={form.plan}
                                    onChange={(e) => setForm((p) => ({ ...p, plan: e.target.value }))}
                                >
                                    <option value="Free">Free</option>
                                    <option value="Pro">Pro</option>
                                    <option value="Enterprise">Enterprise</option>
                                </select>
                            </div>
                            <div>
                                <label className="mb-1 block text-xs font-bold text-slate-500 uppercase">Statut</label>
                                <select
                                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                    value={form.status}
                                    onChange={(e) => setForm((p) => ({ ...p, status: e.target.value }))}
                                >
                                    <option value="active">Actif</option>
                                    <option value="suspended">Suspendu</option>
                                </select>
                            </div>
                        </div>
                        <div className="flex justify-end">
                            <Button type="submit" disabled={creating}>
                                {creating ? "Création..." : "Ajouter"}
                            </Button>
                        </div>
                    </form>
                </Card>
            )}

            {/* List */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-100">
                                <th className="py-4 px-6 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Agence</th>
                                <th className="py-4 px-6 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Plan / Statut</th>
                                <th className="py-4 px-6 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Compteurs</th>
                                <th className="py-4 px-6 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading ? (
                                <tr><td colSpan={4} className="py-12 text-center text-slate-400 italic">Chargement...</td></tr>
                            ) : filtered.length === 0 ? (
                                <tr><td colSpan={4} className="py-12 text-center text-slate-400 italic">Aucune entreprise</td></tr>
                            ) : (
                                filtered.map((ent) => {
                                    const isExpanded = expandedId === ent.id;
                                    const users = usersMap[ent.id] || [];
                                    const director = directorOf(users);
                                    const agents = agentsOf(users);

                                    return (
                                        <React.Fragment key={ent.id}>
                                            <tr className="hover:bg-slate-50/50 transition-colors">
                                                <td className="py-4 px-6">
                                                    <div className="font-bold text-slate-900">{ent.name}</div>
                                                    <div className="text-xs text-slate-400">{ent.address || "No address"}</div>
                                                </td>
                                                <td className="py-4 px-6">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-500 uppercase tracking-tighter">{ent.plan}</span>
                                                        <StatusBadge status={ent.status} />
                                                    </div>
                                                </td>
                                                <td className="py-4 px-6">
                                                    <div className="text-xs text-slate-500">
                                                        Agents: <span className="font-bold text-slate-700">{ent.agents_count || 0}</span> |
                                                        Véhicules: <span className="font-bold text-slate-700">{ent.vehicles_count || 0}</span>
                                                    </div>
                                                </td>
                                                <td className="py-4 px-6 text-right">
                                                    <button
                                                        onClick={() => toggleUsers(ent.id)}
                                                        className={`text-xs font-bold px-4 py-1.5 rounded-lg transition ${isExpanded ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                                                    >
                                                        {isExpanded ? 'Fermer' : 'Équipe'}
                                                    </button>
                                                </td>
                                            </tr>

                                            {isExpanded && (
                                                <tr>
                                                    <td colSpan={4} className="py-6 px-10 bg-slate-50/30">
                                                        <ExpandedContent
                                                            loading={usersLoadingId === ent.id}
                                                            director={director}
                                                            agents={agents}
                                                        />
                                                    </td>
                                                </tr>
                                            )}
                                        </React.Fragment>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

function ExpandedContent({ loading, director, agents }) {
    if (loading) return <div className="text-center py-4 text-slate-400 text-xs italic">Chargement de l'équipe...</div>;

    return (
        <div className="grid gap-8 md:grid-cols-2">
            <div>
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Directeur</h4>
                {director ? (
                    <div className="text-sm font-bold text-slate-700">{director.email}</div>
                ) : (
                    <div className="text-xs text-slate-400">Non défini</div>
                )}
            </div>
            <div>
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Agents ({agents.length})</h4>
                <div className="space-y-1">
                    {agents.map(a => (
                        <div key={a.id} className="text-xs text-slate-600 font-medium">• {a.email}</div>
                    ))}
                    {agents.length === 0 && <div className="text-xs text-slate-400">Aucun agent</div>}
                </div>
            </div>
        </div>
    );
}
