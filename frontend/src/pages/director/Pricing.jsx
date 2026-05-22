import { useState, useEffect, useCallback } from 'react';
import { Tag, Plus, Pencil, Trash2, X, Check, Loader2, AlertTriangle, Search, ArrowLeft, ToggleLeft, ToggleRight, Percent, Calendar } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useNavigate } from 'react-router-dom';
import { useCurrency } from '../../context/CurrencyContext';
import { api } from '../../api/http';

const t = { primary: '#6366F1', primaryLight: '#EEF2FF', neutral50: '#F8FAFC', neutral200: '#E2E8F0', neutral400: '#94A3B8', neutral600: '#475569', neutral900: '#0F172A', dark800: '#1E293B', dark900: '#0F172A', dark700: '#334155', success: '#10B981', error: '#EF4444', warning: '#F59E0B' };
const RULE_TYPES = [
    { value: 'seasonal', label: 'Saisonnière', icon: '☀️', desc: 'Haute/basse saison' },
    { value: 'weekly', label: 'Hebdomadaire', icon: '📅', desc: '7+ jours' },
    { value: 'monthly', label: 'Mensuelle', icon: '🗓️', desc: '30+ jours' },
    { value: 'weekend', label: 'Week-end', icon: '🌙', desc: 'Ven-Dim' },
    { value: 'long_term', label: 'Long terme', icon: '📆', desc: 'Location longue durée' },
    { value: 'custom', label: 'Personnalisée', icon: '⚙️', desc: 'Règle libre' },
];

function PricingModal({ rule, darkMode, onClose, onSaved, vehicles, categories }) {
    const isEdit = !!rule?.id;
    const cardBg = darkMode ? t.dark800 : '#fff';
    const border = darkMode ? t.dark700 : t.neutral200;
    const inputBg = darkMode ? t.dark900 : '#fff';
    const textPrimary = darkMode ? '#F8FAFC' : t.neutral900;
    const textSecondary = darkMode ? t.neutral400 : t.neutral600;
    const iStyle = { width: '100%', padding: '11px 14px', borderRadius: 10, fontSize: 14, background: inputBg, color: textPrimary, border: `1px solid ${border}`, outline: 'none', boxSizing: 'border-box' };
    const lStyle = { fontSize: 12, fontWeight: 700, color: textSecondary, marginBottom: 6, display: 'block', textTransform: 'uppercase', letterSpacing: '0.05em' };

    const [form, setForm] = useState({
        name: rule?.name || '', description: rule?.description || '', rule_type: rule?.rule_type || 'seasonal',
        vehicle_id: rule?.vehicle_id || '', category_id: rule?.category_id || '',
        start_date: rule?.start_date?.split('T')[0] || '', end_date: rule?.end_date?.split('T')[0] || '',
        discount_percent: rule?.discount_percent ?? '', surcharge_percent: rule?.surcharge_percent ?? '',
        min_days: rule?.min_days ?? '', is_active: rule?.is_active ?? true,
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    async function handleSubmit(e) {
        e.preventDefault(); setError('');
        if (!form.name.trim()) { setError('Nom requis.'); return; }
        setLoading(true);
        const body = {
            ...form,
            vehicle_id: form.vehicle_id || null, category_id: form.category_id || null,
            start_date: form.start_date || null, end_date: form.end_date || null,
            discount_percent: form.discount_percent !== '' ? parseInt(form.discount_percent) : null,
            surcharge_percent: form.surcharge_percent !== '' ? parseInt(form.surcharge_percent) : null,
            min_days: form.min_days !== '' ? parseInt(form.min_days) : null,
        };
        try {
            const result = isEdit ? await api(`/api/pricing/${rule.id}`, { method: 'PUT', body }) : await api('/api/pricing', { method: 'POST', body });
            onSaved(result);
        } catch (err) { setError(err.message || 'Erreur.'); } finally { setLoading(false); }
    }

    return (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 300 }}>
            <div style={{ background: cardBg, borderRadius: 20, padding: 32, width: '95%', maxWidth: 520, border: `1px solid ${border}`, boxShadow: '0 25px 60px rgba(0,0,0,0.3)', maxHeight: '92vh', overflowY: 'auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                    <h2 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: textPrimary }}>{isEdit ? 'Modifier la règle' : 'Nouvelle règle tarifaire'}</h2>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: textSecondary }}><X size={22} /></button>
                </div>
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div><label style={lStyle}>Nom *</label><input value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="ex: Été 2026, Long séjour…" style={iStyle} required /></div>
                    <div><label style={lStyle}>Description</label><input value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="Description optionnelle" style={iStyle} /></div>
                    <div>
                        <label style={lStyle}>Type de règle *</label>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                            {RULE_TYPES.map(rt => (
                                <button key={rt.value} type="button" onClick={() => setForm({...form, rule_type: rt.value})} style={{ padding: '10px 8px', borderRadius: 10, border: `1.5px solid ${form.rule_type === rt.value ? t.primary : border}`, background: form.rule_type === rt.value ? t.primaryLight : 'transparent', cursor: 'pointer', textAlign: 'center', transition: 'all 0.15s' }}>
                                    <div style={{ fontSize: 18, marginBottom: 2 }}>{rt.icon}</div>
                                    <div style={{ fontSize: 12, fontWeight: 700, color: form.rule_type === rt.value ? t.primary : textPrimary }}>{rt.label}</div>
                                </button>
                            ))}
                        </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                        <div><label style={lStyle}>Catégorie</label><select value={form.category_id} onChange={e => setForm({...form, category_id: e.target.value})} style={{...iStyle, cursor:'pointer'}}><option value="">Toutes</option>{categories.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
                        <div><label style={lStyle}>Véhicule</label><select value={form.vehicle_id} onChange={e => setForm({...form, vehicle_id: e.target.value})} style={{...iStyle, cursor:'pointer'}}><option value="">Tous</option>{vehicles.map(v=><option key={v.id} value={v.id}>{v.name} ({v.plate})</option>)}</select></div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                        <div><label style={lStyle}>Date début</label><input type="date" value={form.start_date} onChange={e => setForm({...form, start_date: e.target.value})} style={iStyle} /></div>
                        <div><label style={lStyle}>Date fin</label><input type="date" value={form.end_date} onChange={e => setForm({...form, end_date: e.target.value})} style={iStyle} /></div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                        <div><label style={lStyle}>Remise %</label><input type="number" min="0" max="100" value={form.discount_percent} onChange={e => setForm({...form, discount_percent: e.target.value})} placeholder="10" style={iStyle} /></div>
                        <div><label style={lStyle}>Surcharge %</label><input type="number" min="0" max="200" value={form.surcharge_percent} onChange={e => setForm({...form, surcharge_percent: e.target.value})} placeholder="20" style={iStyle} /></div>
                        <div><label style={lStyle}>Min. jours</label><input type="number" min="1" value={form.min_days} onChange={e => setForm({...form, min_days: e.target.value})} placeholder="7" style={iStyle} /></div>
                    </div>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', padding: '8px 0' }}>
                        <input type="checkbox" checked={form.is_active} onChange={e => setForm({...form, is_active: e.target.checked})} style={{ width: 18, height: 18, accentColor: t.primary }} />
                        <span style={{ fontSize: 13, fontWeight: 600, color: textPrimary }}>Règle active</span>
                    </label>
                    {error && <div style={{ padding: '10px 14px', borderRadius: 10, background: '#FEF2F2', color: '#DC2626', fontSize: 13, fontWeight: 600, border: '1px solid #FECACA' }}>{error}</div>}
                    <div style={{ display: 'flex', gap: 10 }}>
                        <button type="submit" disabled={loading} style={{ flex: 1, padding: '12px 0', background: t.primary, color: '#fff', border: 'none', borderRadius: 12, cursor: 'pointer', fontWeight: 700, fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, opacity: loading ? 0.7 : 1 }}>{loading ? <Loader2 size={16} style={{animation:'spin 0.8s linear infinite'}}/> : <Check size={16}/>}{loading ? '…' : isEdit ? 'Mettre à jour' : 'Créer'}</button>
                        <button type="button" onClick={onClose} style={{ padding: '0 20px', background: 'transparent', border: `1px solid ${border}`, borderRadius: 12, color: textSecondary, cursor: 'pointer', fontWeight: 600, fontSize: 14 }}>Annuler</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default function Pricing() {
    const { darkMode } = useTheme();
    const navigate = useNavigate();
    const { getCurrencySymbol, currency } = useCurrency();
    const [rules, setRules] = useState([]);
    const [vehicles, setVehicles] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [modalOpen, setModalOpen] = useState(false);
    const [editRule, setEditRule] = useState(null);
    const [deleteId, setDeleteId] = useState(null);
    const [delLoading, setDelLoading] = useState(false);

    const bg = darkMode ? t.dark900 : t.neutral50;
    const textPrimary = darkMode ? '#F8FAFC' : t.neutral900;
    const textSecondary = darkMode ? t.neutral400 : t.neutral600;
    const cardBg = darkMode ? t.dark800 : '#fff';
    const border = darkMode ? t.dark700 : t.neutral200;

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const [r, v, c] = await Promise.all([api('/api/pricing'), api('/api/vehicles'), api('/api/categories')]);
            setRules(r); setVehicles(v); setCategories(c);
        } catch (e) { console.error(e); } finally { setLoading(false); }
    }, []);
    useEffect(() => { load(); }, [load]);

    async function handleToggle(rule) {
        try { const updated = await api(`/api/pricing/${rule.id}/toggle`, { method: 'PATCH' }); setRules(prev => prev.map(r => r.id === rule.id ? updated : r)); } catch (e) { console.error(e); }
    }
    async function handleDelete() {
        setDelLoading(true);
        try { await api(`/api/pricing/${deleteId}`, { method: 'DELETE' }); setRules(prev => prev.filter(r => r.id !== deleteId)); setDeleteId(null); } catch (e) { console.error(e); } finally { setDelLoading(false); }
    }

    const filtered = rules.filter(r => r.name.toLowerCase().includes(search.toLowerCase()));
    const typeInfo = v => RULE_TYPES.find(rt => rt.value === v) || RULE_TYPES[5];

    return (
        <div style={{ background: bg, minHeight: '100vh', padding: '36px 28px' }}>
            {modalOpen && <PricingModal rule={editRule} darkMode={darkMode} onClose={() => { setModalOpen(false); setEditRule(null); }} onSaved={r => { setRules(prev => { const i = prev.findIndex(x => x.id === r.id); if (i >= 0) { const n = [...prev]; n[i] = r; return n; } return [r, ...prev]; }); setModalOpen(false); setEditRule(null); load(); }} vehicles={vehicles} categories={categories} />}

            {deleteId && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 400 }}>
                    <div style={{ background: cardBg, borderRadius: 20, padding: 32, width: '95%', maxWidth: 400, border: `1px solid ${border}` }}>
                        <h3 style={{ margin: '0 0 12px', fontSize: 16, fontWeight: 800, color: textPrimary }}>Supprimer cette règle ?</h3>
                        <p style={{ color: textSecondary, fontSize: 14, margin: '0 0 20px' }}>Cette action est irréversible.</p>
                        <div style={{ display: 'flex', gap: 10 }}>
                            <button onClick={handleDelete} disabled={delLoading} style={{ flex: 1, padding: '12px 0', background: t.error, color: '#fff', border: 'none', borderRadius: 12, cursor: 'pointer', fontWeight: 700, fontSize: 14, opacity: delLoading ? 0.7 : 1 }}>{delLoading ? '…' : 'Supprimer'}</button>
                            <button onClick={() => setDeleteId(null)} style={{ padding: '0 20px', background: 'transparent', border: `1px solid ${border}`, borderRadius: 12, color: textSecondary, cursor: 'pointer', fontWeight: 600, fontSize: 14 }}>Annuler</button>
                        </div>
                    </div>
                </div>
            )}

            <div style={{ maxWidth: 900, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 28 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
                    <div>
                        <button onClick={() => navigate('/director/admin')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: t.primary, display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, fontWeight: 600, marginBottom: 8, padding: 0 }}><ArrowLeft size={15} /> Administration</button>
                        <h1 style={{ fontSize: 26, fontWeight: 800, margin: '0 0 4px', color: textPrimary }}>Tarification</h1>
                        <p style={{ fontSize: 14, color: textSecondary, margin: 0 }}>Gérez vos règles tarifaires : remises saisonnières, week-end, long terme…</p>
                    </div>
                    <button onClick={() => { setEditRule(null); setModalOpen(true); }} style={{ padding: '11px 20px', background: t.primary, color: '#fff', border: 'none', borderRadius: 12, cursor: 'pointer', fontWeight: 700, fontSize: 14, display: 'flex', alignItems: 'center', gap: 8, boxShadow: '0 4px 14px rgba(99,102,241,0.35)' }}><Plus size={17} /> Nouvelle règle</button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 14 }}>
                    {[{ label: 'Total', val: rules.length, c: t.primary }, { label: 'Actives', val: rules.filter(r => r.is_active).length, c: t.success }, { label: 'Inactives', val: rules.filter(r => !r.is_active).length, c: t.neutral400 }].map(s => (
                        <div key={s.label} style={{ background: cardBg, border: `1px solid ${border}`, borderRadius: 14, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 14 }}>
                            <div style={{ width: 40, height: 40, borderRadius: 10, background: `${s.c}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Tag size={18} color={s.c} /></div>
                            <div><div style={{ fontSize: 22, fontWeight: 800, color: textPrimary }}>{s.val}</div><div style={{ fontSize: 12, color: textSecondary }}>{s.label}</div></div>
                        </div>
                    ))}
                </div>

                <div style={{ position: 'relative' }}>
                    <Search size={16} color={textSecondary} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
                    <input placeholder="Rechercher…" value={search} onChange={e => setSearch(e.target.value)} style={{ width: '100%', padding: '11px 14px 11px 40px', borderRadius: 12, fontSize: 14, background: cardBg, color: textPrimary, border: `1px solid ${border}`, outline: 'none', boxSizing: 'border-box' }} />
                </div>

                {loading ? (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200, color: textSecondary, gap: 12 }}><Loader2 size={22} style={{ animation: 'spin 0.8s linear infinite' }} /> Chargement…</div>
                ) : filtered.length === 0 ? (
                    <div style={{ background: cardBg, border: `1px solid ${border}`, borderRadius: 16, padding: '60px 24px', textAlign: 'center', color: textSecondary }}>
                        <Tag size={40} color={border} style={{ marginBottom: 12 }} />
                        <div style={{ fontSize: 16, fontWeight: 700, color: textPrimary, marginBottom: 6 }}>Aucune règle tarifaire</div>
                        <p style={{ margin: '0 0 20px', fontSize: 14 }}>Créez votre première règle pour ajuster vos prix automatiquement.</p>
                        <button onClick={() => { setEditRule(null); setModalOpen(true); }} style={{ padding: '10px 20px', background: t.primary, color: '#fff', border: 'none', borderRadius: 10, cursor: 'pointer', fontWeight: 700, fontSize: 14, display: 'inline-flex', alignItems: 'center', gap: 8 }}><Plus size={15} /> Créer une règle</button>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {filtered.map(rule => {
                            const info = typeInfo(rule.rule_type);
                            return (
                                <div key={rule.id} style={{ background: cardBg, border: `1px solid ${border}`, borderRadius: 14, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 14, opacity: rule.is_active ? 1 : 0.6, transition: 'all 0.2s' }}>
                                    <div style={{ width: 48, height: 48, borderRadius: 12, flexShrink: 0, background: rule.is_active ? t.primaryLight : (darkMode ? t.dark700 : t.neutral50), display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>{info.icon}</div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 2 }}>
                                            <span style={{ fontWeight: 700, fontSize: 14, color: textPrimary }}>{rule.name}</span>
                                            <span style={{ fontSize: 10, fontWeight: 700, padding: '1px 8px', borderRadius: 10, background: `${t.primary}15`, color: t.primary }}>{info.label}</span>
                                            {rule.discount_percent > 0 && <span style={{ fontSize: 10, fontWeight: 700, padding: '1px 8px', borderRadius: 10, background: '#DCFCE7', color: '#16A34A' }}>-{rule.discount_percent}%</span>}
                                            {rule.surcharge_percent > 0 && <span style={{ fontSize: 10, fontWeight: 700, padding: '1px 8px', borderRadius: 10, background: '#FEF2F2', color: '#DC2626' }}>+{rule.surcharge_percent}%</span>}
                                            {rule.min_days && <span style={{ fontSize: 10, fontWeight: 700, padding: '1px 8px', borderRadius: 10, background: '#FEF3C7', color: '#D97706' }}>≥{rule.min_days}j</span>}
                                            <span style={{ fontSize: 10, fontWeight: 700, padding: '1px 8px', borderRadius: 10, background: rule.is_active ? '#DCFCE7' : '#FEF2F2', color: rule.is_active ? '#16A34A' : '#DC2626' }}>{rule.is_active ? 'Actif' : 'Inactif'}</span>
                                        </div>
                                        <p style={{ margin: 0, fontSize: 12, color: textSecondary, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                            {rule.category_name ? `Catégorie: ${rule.category_name}` : rule.vehicle_name ? `Véhicule: ${rule.vehicle_name}` : 'Tous les véhicules'}
                                            {rule.start_date ? ` · ${rule.start_date.split('T')[0]} → ${rule.end_date?.split('T')[0] || '…'}` : ''}
                                        </p>
                                    </div>
                                    <div style={{ display: 'flex', gap: 5, flexShrink: 0 }}>
                                        <button title={rule.is_active ? 'Désactiver' : 'Activer'} onClick={() => handleToggle(rule)} style={{ background: darkMode ? t.dark700 : t.neutral50, border: `1px solid ${border}`, borderRadius: 8, padding: '6px 8px', cursor: 'pointer', color: rule.is_active ? t.success : t.neutral400, display: 'flex', alignItems: 'center' }}>{rule.is_active ? <ToggleRight size={16}/> : <ToggleLeft size={16}/>}</button>
                                        <button title="Modifier" onClick={() => { setEditRule(rule); setModalOpen(true); }} style={{ background: darkMode ? t.dark700 : t.neutral50, border: `1px solid ${border}`, borderRadius: 8, padding: '6px 8px', cursor: 'pointer', color: t.primary, display: 'flex', alignItems: 'center' }}><Pencil size={14}/></button>
                                        <button title="Supprimer" onClick={() => setDeleteId(rule.id)} style={{ background: darkMode ? t.dark700 : t.neutral50, border: `1px solid ${border}`, borderRadius: 8, padding: '6px 8px', cursor: 'pointer', color: t.error, display: 'flex', alignItems: 'center' }}><Trash2 size={14}/></button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
            <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
        </div>
    );
}
