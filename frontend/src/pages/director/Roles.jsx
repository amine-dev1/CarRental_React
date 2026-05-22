import { useState, useEffect, useCallback } from 'react';
import { Shield, Plus, Pencil, Trash2, X, Check, Loader2, AlertTriangle, Search, ChevronDown, ChevronUp, ArrowLeft } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useNavigate } from 'react-router-dom';
import { api } from '../../api/http';

const t = {
    primary: '#6366F1', primaryLight: '#EEF2FF',
    neutral50: '#F8FAFC', neutral200: '#E2E8F0', neutral400: '#94A3B8', neutral600: '#475569', neutral900: '#0F172A',
    dark800: '#1E293B', dark900: '#0F172A', dark700: '#334155',
    success: '#10B981', error: '#EF4444',
};

const PERM_LABELS = {
    fleet: { label: 'Flotte', icon: '🚗' },
    customers: { label: 'Clients', icon: '👥' },
    rentals: { label: 'Locations', icon: '📋' },
    reservations: { label: 'Réservations', icon: '📅' },
    agencies: { label: 'Agences', icon: '🏢' },
    categories: { label: 'Catégories', icon: '🏷️' },
    reports: { label: 'Rapports', icon: '📊' },
    admin: { label: 'Administration', icon: '⚙️' },
};

const ACTION_LABELS = { view: 'Voir', create: 'Créer', edit: 'Modifier', delete: 'Supprimer', export: 'Exporter', access: 'Accès' };

function RoleModal({ role, darkMode, onClose, onSaved, allPermissions, permGroups }) {
    const isEdit = !!role?.id;
    const cardBg = darkMode ? t.dark800 : '#fff';
    const border = darkMode ? t.dark700 : t.neutral200;
    const inputBg = darkMode ? t.dark900 : '#fff';
    const textPrimary = darkMode ? '#F8FAFC' : t.neutral900;
    const textSecondary = darkMode ? t.neutral400 : t.neutral600;

    const [form, setForm] = useState({ name: role?.name || '', description: role?.description || '', permissions: role?.permissions || [] });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [expanded, setExpanded] = useState({});

    const inputStyle = { width: '100%', padding: '11px 14px', borderRadius: 10, fontSize: 14, background: inputBg, color: textPrimary, border: `1px solid ${border}`, outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.2s' };
    const labelStyle = { fontSize: 12, fontWeight: 700, color: textSecondary, marginBottom: 6, display: 'block', textTransform: 'uppercase', letterSpacing: '0.05em' };

    function togglePerm(p) {
        setForm(f => ({ ...f, permissions: f.permissions.includes(p) ? f.permissions.filter(x => x !== p) : [...f.permissions, p] }));
    }
    function toggleGroup(module, perms) {
        const allOn = perms.every(p => form.permissions.includes(p));
        setForm(f => ({ ...f, permissions: allOn ? f.permissions.filter(p => !perms.includes(p)) : [...new Set([...f.permissions, ...perms])] }));
    }

    async function handleSubmit(e) {
        e.preventDefault(); setError('');
        if (!form.name.trim()) { setError('Le nom du rôle est requis.'); return; }
        setLoading(true);
        try {
            const result = isEdit
                ? await api(`/api/roles/${role.id}`, { method: 'PUT', body: form })
                : await api('/api/roles', { method: 'POST', body: form });
            onSaved(result);
        } catch (err) { setError(err.message || 'Erreur.'); } finally { setLoading(false); }
    }

    return (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 300 }}>
            <div style={{ background: cardBg, borderRadius: 20, padding: 32, width: '95%', maxWidth: 540, border: `1px solid ${border}`, boxShadow: '0 25px 60px rgba(0,0,0,0.3)', maxHeight: '90vh', overflowY: 'auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 36, height: 36, borderRadius: 10, background: t.primaryLight, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Shield size={18} color={t.primary} /></div>
                        <div>
                            <h2 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: textPrimary }}>{isEdit ? 'Modifier le rôle' : 'Nouveau rôle'}</h2>
                            <p style={{ margin: 0, fontSize: 12, color: textSecondary }}>Définissez les permissions d'accès</p>
                        </div>
                    </div>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: textSecondary }}><X size={22} /></button>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                    <div>
                        <label style={labelStyle}>Nom du rôle *</label>
                        <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="ex: Manager, Comptable…" style={inputStyle} onFocus={e => e.target.style.borderColor = t.primary} onBlur={e => e.target.style.borderColor = border} required />
                    </div>
                    <div>
                        <label style={labelStyle}>Description</label>
                        <input value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Description optionnelle" style={inputStyle} onFocus={e => e.target.style.borderColor = t.primary} onBlur={e => e.target.style.borderColor = border} />
                    </div>

                    <div>
                        <label style={labelStyle}>Permissions ({form.permissions.length}/{allPermissions.length})</label>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            {Object.entries(permGroups).map(([module, perms]) => {
                                const info = PERM_LABELS[module] || { label: module, icon: '📦' };
                                const allOn = perms.every(p => form.permissions.includes(p));
                                const someOn = perms.some(p => form.permissions.includes(p));
                                const isOpen = expanded[module] !== false;
                                return (
                                    <div key={module} style={{ border: `1px solid ${border}`, borderRadius: 12, overflow: 'hidden' }}>
                                        <button type="button" onClick={() => setExpanded(e => ({ ...e, [module]: !isOpen }))} style={{ width: '100%', padding: '10px 14px', background: darkMode ? t.dark700 : t.neutral50, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10, color: textPrimary }}>
                                            <span style={{ fontSize: 16 }}>{info.icon}</span>
                                            <span style={{ flex: 1, textAlign: 'left', fontWeight: 700, fontSize: 13 }}>{info.label}</span>
                                            <button type="button" onClick={e2 => { e2.stopPropagation(); toggleGroup(module, perms); }} style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 6, border: 'none', cursor: 'pointer', background: allOn ? '#DCFCE7' : someOn ? '#FEF3C7' : (darkMode ? t.dark800 : '#f1f5f9'), color: allOn ? '#16A34A' : someOn ? '#D97706' : textSecondary }}>
                                                {allOn ? 'Tout ✓' : someOn ? 'Partiel' : 'Aucun'}
                                            </button>
                                            {isOpen ? <ChevronUp size={14} color={textSecondary} /> : <ChevronDown size={14} color={textSecondary} />}
                                        </button>
                                        {isOpen && (
                                            <div style={{ padding: '10px 14px', display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                                                {perms.map(p => {
                                                    const action = p.split('.')[1];
                                                    const active = form.permissions.includes(p);
                                                    return (
                                                        <button key={p} type="button" onClick={() => togglePerm(p)} style={{ padding: '6px 12px', borderRadius: 8, fontSize: 12, fontWeight: 600, border: `1px solid ${active ? t.primary : border}`, background: active ? t.primaryLight : 'transparent', color: active ? t.primary : textSecondary, cursor: 'pointer', transition: 'all 0.15s' }}>
                                                            {active && <Check size={12} style={{ marginRight: 4, verticalAlign: 'middle' }} />}
                                                            {ACTION_LABELS[action] || action}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {error && <div style={{ padding: '10px 14px', borderRadius: 10, background: '#FEF2F2', color: '#DC2626', fontSize: 13, fontWeight: 600, border: '1px solid #FECACA', display: 'flex', gap: 8, alignItems: 'center' }}><AlertTriangle size={15} /> {error}</div>}

                    <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                        <button type="submit" disabled={loading} style={{ flex: 1, padding: '12px 0', background: t.primary, color: '#fff', border: 'none', borderRadius: 12, cursor: loading ? 'not-allowed' : 'pointer', fontWeight: 700, fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, opacity: loading ? 0.7 : 1 }}>
                            {loading ? <Loader2 size={16} style={{ animation: 'spin 0.8s linear infinite' }} /> : <Check size={16} />}
                            {loading ? 'Enregistrement…' : (isEdit ? 'Mettre à jour' : 'Créer le rôle')}
                        </button>
                        <button type="button" onClick={onClose} style={{ padding: '0 20px', background: 'transparent', border: `1px solid ${border}`, borderRadius: 12, color: textSecondary, cursor: 'pointer', fontWeight: 600, fontSize: 14 }}>Annuler</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

function DeleteModal({ role, darkMode, onClose, onConfirmed }) {
    const cardBg = darkMode ? t.dark800 : '#fff';
    const border = darkMode ? t.dark700 : t.neutral200;
    const textPrimary = darkMode ? '#F8FAFC' : t.neutral900;
    const textSecondary = darkMode ? t.neutral400 : t.neutral600;
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    async function handleDelete() {
        setLoading(true); setError('');
        try { await api(`/api/roles/${role.id}`, { method: 'DELETE' }); onConfirmed(role.id); }
        catch (err) { setError(err.message || 'Impossible de supprimer.'); setLoading(false); }
    }

    return (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 400 }}>
            <div style={{ background: cardBg, borderRadius: 20, padding: 32, width: '95%', maxWidth: 420, border: `1px solid ${border}`, boxShadow: '0 25px 60px rgba(0,0,0,0.3)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 18 }}>
                    <div style={{ width: 44, height: 44, borderRadius: 12, background: '#FEF2F2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><AlertTriangle size={22} color={t.error} /></div>
                    <div>
                        <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: textPrimary }}>Supprimer le rôle</h3>
                        <p style={{ margin: 0, fontSize: 13, color: textSecondary }}>Cette action est irréversible.</p>
                    </div>
                </div>
                <p style={{ color: textSecondary, fontSize: 14, lineHeight: 1.6, margin: '0 0 20px' }}>
                    Supprimer <strong style={{ color: textPrimary }}>«{role.name}»</strong> ? Les utilisateurs affectés perdront ce rôle.
                </p>
                {error && <div style={{ padding: '10px 14px', borderRadius: 10, background: '#FEF2F2', color: '#DC2626', fontSize: 13, fontWeight: 600, border: '1px solid #FECACA', marginBottom: 16 }}>{error}</div>}
                <div style={{ display: 'flex', gap: 10 }}>
                    <button onClick={handleDelete} disabled={loading} style={{ flex: 1, padding: '12px 0', background: t.error, color: '#fff', border: 'none', borderRadius: 12, cursor: loading ? 'not-allowed' : 'pointer', fontWeight: 700, fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, opacity: loading ? 0.7 : 1 }}>
                        {loading ? <Loader2 size={15} style={{ animation: 'spin 0.8s linear infinite' }} /> : <Trash2 size={15} />}
                        {loading ? 'Suppression…' : 'Supprimer'}
                    </button>
                    <button onClick={onClose} style={{ padding: '0 20px', background: 'transparent', border: `1px solid ${border}`, borderRadius: 12, color: textSecondary, cursor: 'pointer', fontWeight: 600, fontSize: 14 }}>Annuler</button>
                </div>
            </div>
        </div>
    );
}

export default function Roles() {
    const { darkMode } = useTheme();
    const navigate = useNavigate();
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [modalOpen, setModalOpen] = useState(false);
    const [editRole, setEditRole] = useState(null);
    const [deleteRole, setDeleteRole] = useState(null);
    const [allPerms, setAllPerms] = useState([]);
    const [permGroups, setPermGroups] = useState({});

    const bg = darkMode ? t.dark900 : t.neutral50;
    const textPrimary = darkMode ? '#F8FAFC' : t.neutral900;
    const textSecondary = darkMode ? t.neutral400 : t.neutral600;
    const cardBg = darkMode ? t.dark800 : '#fff';
    const border = darkMode ? t.dark700 : t.neutral200;

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const [rolesData, permsData] = await Promise.all([api('/api/roles'), api('/api/roles/permissions')]);
            setRoles(rolesData);
            setAllPerms(permsData.permissions);
            setPermGroups(permsData.groups);
        } catch (e) { console.error(e); } finally { setLoading(false); }
    }, []);

    useEffect(() => { load(); }, [load]);

    const filtered = roles.filter(r => r.name.toLowerCase().includes(search.toLowerCase()) || (r.description || '').toLowerCase().includes(search.toLowerCase()));

    return (
        <div style={{ background: bg, minHeight: '100vh', padding: '36px 28px' }}>
            {modalOpen && <RoleModal role={editRole} darkMode={darkMode} onClose={() => { setModalOpen(false); setEditRole(null); }} onSaved={result => { setRoles(prev => { const idx = prev.findIndex(r => r.id === result.id); if (idx >= 0) { const n = [...prev]; n[idx] = result; return n; } return [result, ...prev]; }); setModalOpen(false); setEditRole(null); load(); }} allPermissions={allPerms} permGroups={permGroups} />}
            {deleteRole && <DeleteModal role={deleteRole} darkMode={darkMode} onClose={() => setDeleteRole(null)} onConfirmed={id => { setRoles(prev => prev.filter(r => r.id !== id)); setDeleteRole(null); }} />}

            <div style={{ maxWidth: 900, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 28 }}>
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
                    <div>
                        <button onClick={() => navigate('/director/admin')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: t.primary, display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, fontWeight: 600, marginBottom: 8, padding: 0 }}><ArrowLeft size={15} /> Administration</button>
                        <h1 style={{ fontSize: 26, fontWeight: 800, margin: '0 0 4px', color: textPrimary }}>Rôles & Permissions</h1>
                        <p style={{ fontSize: 14, color: textSecondary, margin: 0 }}>Définissez les niveaux d'accès pour chaque membre de votre équipe.</p>
                    </div>
                    <button onClick={() => { setEditRole(null); setModalOpen(true); }} style={{ padding: '11px 20px', background: t.primary, color: '#fff', border: 'none', borderRadius: 12, cursor: 'pointer', fontWeight: 700, fontSize: 14, display: 'flex', alignItems: 'center', gap: 8, boxShadow: '0 4px 14px rgba(99,102,241,0.35)', transition: 'transform 0.15s' }} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'} onMouseLeave={e => e.currentTarget.style.transform = 'none'}><Plus size={17} /> Nouveau rôle</button>
                </div>

                {/* Stats */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 14 }}>
                    <div style={{ background: cardBg, border: `1px solid ${border}`, borderRadius: 14, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 14 }}>
                        <div style={{ width: 40, height: 40, borderRadius: 10, background: `${t.primary}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Shield size={18} color={t.primary} /></div>
                        <div><div style={{ fontSize: 22, fontWeight: 800, color: textPrimary }}>{roles.length}</div><div style={{ fontSize: 12, color: textSecondary }}>Rôles</div></div>
                    </div>
                </div>

                {/* Search */}
                <div style={{ position: 'relative' }}>
                    <Search size={16} color={textSecondary} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
                    <input type="text" placeholder="Rechercher un rôle…" value={search} onChange={e => setSearch(e.target.value)} style={{ width: '100%', padding: '11px 14px 11px 40px', borderRadius: 12, fontSize: 14, background: cardBg, color: textPrimary, border: `1px solid ${border}`, outline: 'none', boxSizing: 'border-box' }} onFocus={e => e.target.style.borderColor = t.primary} onBlur={e => e.target.style.borderColor = border} />
                </div>

                {/* Roles list */}
                {loading ? (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200, color: textSecondary, gap: 12 }}><Loader2 size={22} style={{ animation: 'spin 0.8s linear infinite' }} /> Chargement…</div>
                ) : filtered.length === 0 ? (
                    <div style={{ background: cardBg, border: `1px solid ${border}`, borderRadius: 16, padding: '60px 24px', textAlign: 'center', color: textSecondary }}>
                        <Shield size={40} color={border} style={{ marginBottom: 12 }} />
                        <div style={{ fontSize: 16, fontWeight: 700, color: textPrimary, marginBottom: 6 }}>{search ? 'Aucun résultat' : 'Aucun rôle'}</div>
                        <p style={{ margin: '0 0 20px', fontSize: 14 }}>{search ? `Aucun rôle ne correspond à "${search}".` : 'Créez votre premier rôle pour organiser les permissions.'}</p>
                        {!search && <button onClick={() => { setEditRole(null); setModalOpen(true); }} style={{ padding: '10px 20px', background: t.primary, color: '#fff', border: 'none', borderRadius: 10, cursor: 'pointer', fontWeight: 700, fontSize: 14, display: 'inline-flex', alignItems: 'center', gap: 8 }}><Plus size={15} /> Créer un rôle</button>}
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {filtered.map(role => (
                            <div key={role.id} style={{ background: cardBg, border: `1px solid ${border}`, borderRadius: 14, padding: '18px 20px', display: 'flex', alignItems: 'center', gap: 14, transition: 'box-shadow 0.2s' }} onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.08)'} onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}>
                                <div style={{ width: 48, height: 48, borderRadius: 12, flexShrink: 0, background: t.primaryLight, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Shield size={22} color={t.primary} /></div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                                        <span style={{ fontWeight: 700, fontSize: 15, color: textPrimary }}>{role.name}</span>
                                        {role.is_system && <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 20, background: '#FEF3C7', color: '#D97706' }}>Système</span>}
                                        <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 20, background: `${t.primary}15`, color: t.primary }}>{(role.permissions || []).length} perm.</span>
                                        <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 20, background: '#DCFCE7', color: '#16A34A' }}>{role.user_count || 0} utilisateur{(role.user_count || 0) !== 1 ? 's' : ''}</span>
                                    </div>
                                    {role.description && <p style={{ margin: 0, fontSize: 12, color: textSecondary, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{role.description}</p>}
                                </div>
                                <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                                    <button onClick={() => { setEditRole(role); setModalOpen(true); }} style={{ background: darkMode ? t.dark700 : t.neutral50, border: `1px solid ${border}`, borderRadius: 8, padding: '7px 10px', cursor: 'pointer', color: t.primary, display: 'flex', alignItems: 'center', transition: 'background 0.15s' }} onMouseEnter={e => e.currentTarget.style.background = t.primaryLight} onMouseLeave={e => e.currentTarget.style.background = darkMode ? t.dark700 : t.neutral50}><Pencil size={15} /></button>
                                    {!role.is_system && <button onClick={() => setDeleteRole(role)} style={{ background: darkMode ? t.dark700 : t.neutral50, border: `1px solid ${border}`, borderRadius: 8, padding: '7px 10px', cursor: 'pointer', color: t.error, display: 'flex', alignItems: 'center', transition: 'background 0.15s' }} onMouseEnter={e => e.currentTarget.style.background = '#FEF2F2'} onMouseLeave={e => e.currentTarget.style.background = darkMode ? t.dark700 : t.neutral50}><Trash2 size={15} /></button>}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
        </div>
    );
}
