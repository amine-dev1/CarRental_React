import { useState, useEffect, useCallback } from 'react';
import { Users, Plus, Pencil, Trash2, X, Check, Loader2, AlertTriangle, Search, ArrowLeft, KeyRound, UserCheck, UserX } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import { api } from '../../api/http';

const t = { primary: '#6366F1', primaryLight: '#EEF2FF', neutral50: '#F8FAFC', neutral200: '#E2E8F0', neutral400: '#94A3B8', neutral600: '#475569', neutral900: '#0F172A', dark800: '#1E293B', dark900: '#0F172A', dark700: '#334155', success: '#10B981', error: '#EF4444' };

function UserModal({ member, darkMode, onClose, onSaved, roles }) {
    const isEdit = !!member?.id;
    const cardBg = darkMode ? t.dark800 : '#fff';
    const border = darkMode ? t.dark700 : t.neutral200;
    const inputBg = darkMode ? t.dark900 : '#fff';
    const textPrimary = darkMode ? '#F8FAFC' : t.neutral900;
    const textSecondary = darkMode ? t.neutral400 : t.neutral600;
    const [form, setForm] = useState({ full_name: member?.full_name || '', email: member?.email || '', phone: member?.phone || '', password: '', custom_role_id: member?.custom_role_id || '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const iStyle = { width: '100%', padding: '11px 14px', borderRadius: 10, fontSize: 14, background: inputBg, color: textPrimary, border: `1px solid ${border}`, outline: 'none', boxSizing: 'border-box' };
    const lStyle = { fontSize: 12, fontWeight: 700, color: textSecondary, marginBottom: 6, display: 'block', textTransform: 'uppercase', letterSpacing: '0.05em' };

    async function handleSubmit(e) {
        e.preventDefault(); setError('');
        if (!form.full_name.trim()) { setError('Nom requis.'); return; }
        if (!form.email.trim()) { setError('Email requis.'); return; }
        if (!isEdit && form.password.length < 6) { setError('Mot de passe min. 6 caractères.'); return; }
        setLoading(true);
        try {
            const body = { ...form, custom_role_id: form.custom_role_id || null };
            if (isEdit) { delete body.password; if (!body.password) delete body.password; }
            const result = isEdit ? await api(`/api/team/${member.id}`, { method: 'PUT', body }) : await api('/api/team', { method: 'POST', body });
            onSaved(result);
        } catch (err) { setError(err.message || 'Erreur.'); } finally { setLoading(false); }
    }

    return (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 300 }}>
            <div style={{ background: cardBg, borderRadius: 20, padding: 32, width: '95%', maxWidth: 480, border: `1px solid ${border}`, boxShadow: '0 25px 60px rgba(0,0,0,0.3)', maxHeight: '90vh', overflowY: 'auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                    <h2 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: textPrimary }}>{isEdit ? 'Modifier l\'utilisateur' : 'Nouvel utilisateur'}</h2>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: textSecondary }}><X size={22} /></button>
                </div>
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div><label style={lStyle}>Nom complet *</label><input value={form.full_name} onChange={e => setForm({ ...form, full_name: e.target.value })} placeholder="Jean Dupont" style={iStyle} required /></div>
                    <div><label style={lStyle}>Email *</label><input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="agent@email.com" style={iStyle} required /></div>
                    <div><label style={lStyle}>Téléphone</label><input value={form.phone || ''} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="+212 6..." style={iStyle} /></div>
                    {!isEdit && <div><label style={lStyle}>Mot de passe *</label><input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder="Min. 6 caractères" style={iStyle} required /></div>}
                    <div>
                        <label style={lStyle}>Rôle</label>
                        <select value={form.custom_role_id || ''} onChange={e => setForm({ ...form, custom_role_id: e.target.value })} style={{ ...iStyle, cursor: 'pointer' }}>
                            <option value="">— Aucun rôle assigné —</option>
                            {roles.map(r => <option key={r.id} value={r.id}>{r.name} ({(r.permissions || []).length} permissions)</option>)}
                        </select>
                    </div>
                    {error && <div style={{ padding: '10px 14px', borderRadius: 10, background: '#FEF2F2', color: '#DC2626', fontSize: 13, fontWeight: 600, border: '1px solid #FECACA' }}>{error}</div>}
                    <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                        <button type="submit" disabled={loading} style={{ flex: 1, padding: '12px 0', background: t.primary, color: '#fff', border: 'none', borderRadius: 12, cursor: loading ? 'not-allowed' : 'pointer', fontWeight: 700, fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, opacity: loading ? 0.7 : 1 }}>
                            {loading ? <Loader2 size={16} style={{ animation: 'spin 0.8s linear infinite' }} /> : <Check size={16} />}{loading ? '…' : isEdit ? 'Mettre à jour' : 'Créer'}
                        </button>
                        <button type="button" onClick={onClose} style={{ padding: '0 20px', background: 'transparent', border: `1px solid ${border}`, borderRadius: 12, color: textSecondary, cursor: 'pointer', fontWeight: 600, fontSize: 14 }}>Annuler</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

function PasswordModal({ member, darkMode, onClose }) {
    const cardBg = darkMode ? t.dark800 : '#fff';
    const border = darkMode ? t.dark700 : t.neutral200;
    const inputBg = darkMode ? t.dark900 : '#fff';
    const textPrimary = darkMode ? '#F8FAFC' : t.neutral900;
    const textSecondary = darkMode ? t.neutral400 : t.neutral600;
    const [pw, setPw] = useState('');
    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState('');
    const [err, setErr] = useState('');

    async function handleReset(e) {
        e.preventDefault(); setErr(''); setMsg('');
        if (pw.length < 6) { setErr('Min. 6 caractères'); return; }
        setLoading(true);
        try { await api(`/api/team/${member.id}/password`, { method: 'PATCH', body: { password: pw } }); setMsg('Mot de passe réinitialisé !'); setPw(''); }
        catch (error) { setErr(error.message); } finally { setLoading(false); }
    }

    return (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 350 }}>
            <div style={{ background: cardBg, borderRadius: 20, padding: 32, width: '95%', maxWidth: 400, border: `1px solid ${border}`, boxShadow: '0 25px 60px rgba(0,0,0,0.3)' }}>
                <h3 style={{ margin: '0 0 6px', fontSize: 16, fontWeight: 800, color: textPrimary }}>Réinitialiser le mot de passe</h3>
                <p style={{ margin: '0 0 18px', fontSize: 13, color: textSecondary }}>Pour <strong>{member.full_name || member.email}</strong></p>
                <form onSubmit={handleReset} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <input type="password" value={pw} onChange={e => setPw(e.target.value)} placeholder="Nouveau mot de passe" style={{ width: '100%', padding: '11px 14px', borderRadius: 10, fontSize: 14, background: inputBg, color: textPrimary, border: `1px solid ${border}`, outline: 'none', boxSizing: 'border-box' }} />
                    {err && <div style={{ padding: '8px 12px', borderRadius: 8, background: '#FEF2F2', color: '#DC2626', fontSize: 12, fontWeight: 600 }}>{err}</div>}
                    {msg && <div style={{ padding: '8px 12px', borderRadius: 8, background: '#DCFCE7', color: '#16A34A', fontSize: 12, fontWeight: 600 }}>{msg}</div>}
                    <div style={{ display: 'flex', gap: 10 }}>
                        <button type="submit" disabled={loading} style={{ flex: 1, padding: '11px 0', background: t.primary, color: '#fff', border: 'none', borderRadius: 12, cursor: 'pointer', fontWeight: 700, fontSize: 14, opacity: loading ? 0.7 : 1 }}>{loading ? '…' : 'Réinitialiser'}</button>
                        <button type="button" onClick={onClose} style={{ padding: '0 16px', background: 'transparent', border: `1px solid ${border}`, borderRadius: 12, color: textSecondary, cursor: 'pointer', fontWeight: 600, fontSize: 14 }}>Fermer</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default function TeamUsers() {
    const { darkMode } = useTheme();
    const { user: me } = useAuth();
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [modalOpen, setModalOpen] = useState(false);
    const [editUser, setEditUser] = useState(null);
    const [deleteUser, setDeleteUser] = useState(null);
    const [pwUser, setPwUser] = useState(null);
    const [delLoading, setDelLoading] = useState(false);
    const [delError, setDelError] = useState('');

    const bg = darkMode ? t.dark900 : t.neutral50;
    const textPrimary = darkMode ? '#F8FAFC' : t.neutral900;
    const textSecondary = darkMode ? t.neutral400 : t.neutral600;
    const cardBg = darkMode ? t.dark800 : '#fff';
    const border = darkMode ? t.dark700 : t.neutral200;

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const [u, r] = await Promise.all([api('/api/team'), api('/api/roles')]);
            setUsers(u); setRoles(r);
        } catch (e) { console.error(e); } finally { setLoading(false); }
    }, []);
    useEffect(() => { load(); }, [load]);

    const filtered = users.filter(u => (u.full_name || '').toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()));
    const agents = users.filter(u => u.role === 'agent');

    async function handleToggleStatus(u) {
        const newStatus = u.status === 'active' ? 'suspended' : 'active';
        try {
            const updated = await api(`/api/team/${u.id}`, { method: 'PUT', body: { status: newStatus } });
            setUsers(prev => prev.map(x => x.id === u.id ? updated : x));
        } catch (e) { console.error(e); }
    }
    async function handleDelete() {
        setDelLoading(true); setDelError('');
        try { await api(`/api/team/${deleteUser.id}`, { method: 'DELETE' }); setUsers(prev => prev.filter(u => u.id !== deleteUser.id)); setDeleteUser(null); }
        catch (e) { setDelError(e.message); setDelLoading(false); }
    }

    return (
        <div style={{ background: bg, minHeight: '100vh', padding: '36px 28px' }}>
            {modalOpen && <UserModal member={editUser} darkMode={darkMode} onClose={() => { setModalOpen(false); setEditUser(null); }} onSaved={r => { setUsers(prev => { const i = prev.findIndex(x => x.id === r.id); if (i >= 0) { const n = [...prev]; n[i] = r; return n; } return [...prev, r]; }); setModalOpen(false); setEditUser(null); }} roles={roles} />}
            {pwUser && <PasswordModal member={pwUser} darkMode={darkMode} onClose={() => setPwUser(null)} />}

            {deleteUser && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 400 }}>
                    <div style={{ background: cardBg, borderRadius: 20, padding: 32, width: '95%', maxWidth: 420, border: `1px solid ${border}`, boxShadow: '0 25px 60px rgba(0,0,0,0.3)' }}>
                        <h3 style={{ margin: '0 0 12px', fontSize: 16, fontWeight: 800, color: textPrimary }}>Supprimer l'utilisateur</h3>
                        <p style={{ color: textSecondary, fontSize: 14, margin: '0 0 20px' }}>Supprimer <strong style={{ color: textPrimary }}>{deleteUser.full_name || deleteUser.email}</strong> définitivement ?</p>
                        {delError && <div style={{ padding: '8px 12px', borderRadius: 8, background: '#FEF2F2', color: '#DC2626', fontSize: 12, marginBottom: 12 }}>{delError}</div>}
                        <div style={{ display: 'flex', gap: 10 }}>
                            <button onClick={handleDelete} disabled={delLoading} style={{ flex: 1, padding: '12px 0', background: t.error, color: '#fff', border: 'none', borderRadius: 12, cursor: 'pointer', fontWeight: 700, fontSize: 14, opacity: delLoading ? 0.7 : 1 }}>{delLoading ? '…' : 'Supprimer'}</button>
                            <button onClick={() => { setDeleteUser(null); setDelError(''); }} style={{ padding: '0 20px', background: 'transparent', border: `1px solid ${border}`, borderRadius: 12, color: textSecondary, cursor: 'pointer', fontWeight: 600, fontSize: 14 }}>Annuler</button>
                        </div>
                    </div>
                </div>
            )}

            <div style={{ maxWidth: 900, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 28 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
                    <div>
                        <button onClick={() => navigate('/director/admin')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: t.primary, display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, fontWeight: 600, marginBottom: 8, padding: 0 }}><ArrowLeft size={15} /> Administration</button>
                        <h1 style={{ fontSize: 26, fontWeight: 800, margin: '0 0 4px', color: textPrimary }}>Utilisateurs & Équipe</h1>
                        <p style={{ fontSize: 14, color: textSecondary, margin: 0 }}>Gérez les membres de votre entreprise.</p>
                    </div>
                    <button onClick={() => { setEditUser(null); setModalOpen(true); }} style={{ padding: '11px 20px', background: t.primary, color: '#fff', border: 'none', borderRadius: 12, cursor: 'pointer', fontWeight: 700, fontSize: 14, display: 'flex', alignItems: 'center', gap: 8, boxShadow: '0 4px 14px rgba(99,102,241,0.35)' }}><Plus size={17} /> Nouvel utilisateur</button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 14 }}>
                    {[{ label: 'Total', value: users.length, color: t.primary }, { label: 'Agents', value: agents.length, color: t.success }, { label: 'Suspendus', value: users.filter(u => u.status === 'suspended').length, color: t.error }].map(s => (
                        <div key={s.label} style={{ background: cardBg, border: `1px solid ${border}`, borderRadius: 14, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 14 }}>
                            <div style={{ width: 40, height: 40, borderRadius: 10, background: `${s.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Users size={18} color={s.color} /></div>
                            <div><div style={{ fontSize: 22, fontWeight: 800, color: textPrimary }}>{s.value}</div><div style={{ fontSize: 12, color: textSecondary }}>{s.label}</div></div>
                        </div>
                    ))}
                </div>

                <div style={{ position: 'relative' }}>
                    <Search size={16} color={textSecondary} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
                    <input type="text" placeholder="Rechercher…" value={search} onChange={e => setSearch(e.target.value)} style={{ width: '100%', padding: '11px 14px 11px 40px', borderRadius: 12, fontSize: 14, background: cardBg, color: textPrimary, border: `1px solid ${border}`, outline: 'none', boxSizing: 'border-box' }} />
                </div>

                {loading ? (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200, color: textSecondary, gap: 12 }}><Loader2 size={22} style={{ animation: 'spin 0.8s linear infinite' }} /> Chargement…</div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {filtered.map(u => {
                            const isMe = u.id === me?.id;
                            const isDir = u.role === 'director';
                            return (
                                <div key={u.id} style={{ background: cardBg, border: `1px solid ${border}`, borderRadius: 14, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 14, transition: 'box-shadow 0.2s' }} onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.08)'} onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}>
                                    <div style={{ width: 44, height: 44, borderRadius: 12, flexShrink: 0, background: isDir ? 'linear-gradient(135deg,#6366F1,#8B5CF6)' : (darkMode ? t.dark700 : t.neutral50), display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                                        {u.profile_photo ? <img src={u.profile_photo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ fontSize: 16, fontWeight: 800, color: isDir ? '#fff' : textSecondary }}>{(u.full_name || u.email).charAt(0).toUpperCase()}</span>}
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 2 }}>
                                            <span style={{ fontWeight: 700, fontSize: 14, color: textPrimary }}>{u.full_name || '—'}</span>
                                            {isMe && <span style={{ fontSize: 10, fontWeight: 700, padding: '1px 6px', borderRadius: 10, background: t.primaryLight, color: t.primary }}>Vous</span>}
                                            <span style={{ fontSize: 10, fontWeight: 700, padding: '1px 6px', borderRadius: 10, background: isDir ? '#EDE9FE' : '#DBEAFE', color: isDir ? '#7C3AED' : '#2563EB' }}>{isDir ? 'Directeur' : 'Agent'}</span>
                                            {u.role_name && <span style={{ fontSize: 10, fontWeight: 700, padding: '1px 6px', borderRadius: 10, background: '#FEF3C7', color: '#D97706' }}>{u.role_name}</span>}
                                            <span style={{ fontSize: 10, fontWeight: 700, padding: '1px 6px', borderRadius: 10, background: u.status === 'active' ? '#DCFCE7' : '#FEF2F2', color: u.status === 'active' ? '#16A34A' : '#DC2626' }}>{u.status === 'active' ? 'Actif' : 'Suspendu'}</span>
                                        </div>
                                        <p style={{ margin: 0, fontSize: 12, color: textSecondary }}>{u.email}{u.phone ? ` · ${u.phone}` : ''}</p>
                                    </div>
                                    {!isDir && !isMe && (
                                        <div style={{ display: 'flex', gap: 5, flexShrink: 0 }}>
                                            <button title="Modifier" onClick={() => { setEditUser(u); setModalOpen(true); }} style={{ background: darkMode ? t.dark700 : t.neutral50, border: `1px solid ${border}`, borderRadius: 8, padding: '6px 8px', cursor: 'pointer', color: t.primary, display: 'flex', alignItems: 'center' }}><Pencil size={14} /></button>
                                            <button title="Mot de passe" onClick={() => setPwUser(u)} style={{ background: darkMode ? t.dark700 : t.neutral50, border: `1px solid ${border}`, borderRadius: 8, padding: '6px 8px', cursor: 'pointer', color: '#D97706', display: 'flex', alignItems: 'center' }}><KeyRound size={14} /></button>
                                            <button title={u.status === 'active' ? 'Suspendre' : 'Activer'} onClick={() => handleToggleStatus(u)} style={{ background: darkMode ? t.dark700 : t.neutral50, border: `1px solid ${border}`, borderRadius: 8, padding: '6px 8px', cursor: 'pointer', color: u.status === 'active' ? '#D97706' : t.success, display: 'flex', alignItems: 'center' }}>{u.status === 'active' ? <UserX size={14} /> : <UserCheck size={14} />}</button>
                                            <button title="Supprimer" onClick={() => { setDeleteUser(u); setDelError(''); }} style={{ background: darkMode ? t.dark700 : t.neutral50, border: `1px solid ${border}`, borderRadius: 8, padding: '6px 8px', cursor: 'pointer', color: t.error, display: 'flex', alignItems: 'center' }}><Trash2 size={14} /></button>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                        {filtered.length === 0 && <div style={{ background: cardBg, border: `1px solid ${border}`, borderRadius: 16, padding: '60px 24px', textAlign: 'center', color: textSecondary }}><Users size={40} color={border} style={{ marginBottom: 12 }} /><div style={{ fontSize: 16, fontWeight: 700, color: textPrimary, marginBottom: 6 }}>Aucun utilisateur</div></div>}
                    </div>
                )}
            </div>
            <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
        </div>
    );
}
