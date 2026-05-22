import { useState, useEffect, useCallback } from 'react';
import {
    Tag, Plus, Pencil, Trash2, X, Check, Loader2, Car,
    AlertTriangle, Search, Palette
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { api } from '../../api/http';
import { useCurrency, formatPrice, getCurrencySymbol } from '../../context/CurrencyContext';

/* ─── Design tokens ─────────────────────────────────── */
const t = {
    primary: '#6366F1', primaryLight: '#EEF2FF',
    neutral50: '#F8FAFC', neutral200: '#E2E8F0',
    neutral400: '#94A3B8', neutral600: '#475569', neutral900: '#0F172A',
    dark800: '#1E293B', dark900: '#0F172A', dark700: '#334155',
    success: '#10B981', error: '#EF4444',
};

const PRESET_COLORS = [
    '#6366F1', '#8B5CF6', '#EC4899', '#EF4444',
    '#F59E0B', '#10B981', '#3B82F6', '#14B8A6',
    '#F97316', '#64748B',
];



/* ─── Sub-components ─────────────────────────────────── */
function CategoryCard({ cat, darkMode, onEdit, onDelete, currency }) {
    const cardBg = darkMode ? t.dark800 : '#fff';
    const border = darkMode ? t.dark700 : t.neutral200;
    const textPrimary = darkMode ? '#F8FAFC' : t.neutral900;
    const textSecondary = darkMode ? t.neutral400 : t.neutral600;

    return (
        <div style={{
            background: cardBg, border: `1px solid ${border}`, borderRadius: 14,
            padding: '18px 20px', display: 'flex', alignItems: 'center', gap: 14,
            transition: 'box-shadow 0.2s',
        }}
            onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.08)'}
            onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
        >
            {/* Color swatch + icon */}
            <div style={{
                width: 48, height: 48, borderRadius: 12, flexShrink: 0,
                background: `${cat.color}20`, border: `2px solid ${cat.color}`,
            }}>
            </div>

            {/* Info */}
            <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                    <span style={{ fontWeight: 700, fontSize: 15, color: textPrimary }}>
                        {cat.name}
                    </span>
                    <span style={{
                        fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 20,
                        background: `${cat.color}20`, color: cat.color,
                    }}>
                        {cat.vehicle_count} véhicule{cat.vehicle_count !== '1' ? 's' : ''}
                    </span>
                    {cat.daily_price_cents != null && (
                        <span style={{
                            fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 20,
                            background: '#DCFCE7', color: '#16A34A',
                        }}>
                            {formatPrice(cat.daily_price_cents, currency)}
                        </span>
                    )}
                </div>
                {cat.description && (
                    <p style={{ margin: 0, fontSize: 12, color: textSecondary, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {cat.description}
                    </p>
                )}
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                <button onClick={() => onEdit(cat)} style={{
                    background: darkMode ? t.dark700 : t.neutral50,
                    border: `1px solid ${border}`, borderRadius: 8,
                    padding: '7px 10px', cursor: 'pointer', color: t.primary,
                    display: 'flex', alignItems: 'center', transition: 'background 0.15s',
                }}
                    onMouseEnter={e => e.currentTarget.style.background = t.primaryLight}
                    onMouseLeave={e => e.currentTarget.style.background = darkMode ? t.dark700 : t.neutral50}
                >
                    <Pencil size={15} />
                </button>
                <button onClick={() => onDelete(cat)} style={{
                    background: darkMode ? t.dark700 : t.neutral50,
                    border: `1px solid ${border}`, borderRadius: 8,
                    padding: '7px 10px', cursor: 'pointer', color: t.error,
                    display: 'flex', alignItems: 'center', transition: 'background 0.15s',
                }}
                    onMouseEnter={e => e.currentTarget.style.background = '#FEF2F2'}
                    onMouseLeave={e => e.currentTarget.style.background = darkMode ? t.dark700 : t.neutral50}
                >
                    <Trash2 size={15} />
                </button>
            </div>
        </div>
    );
}

function CategoryModal({ cat, darkMode, onClose, onSaved, currency }) {
    const isEdit = !!cat?.id;
    const cardBg = darkMode ? t.dark800 : '#fff';
    const border = darkMode ? t.dark700 : t.neutral200;
    const inputBg = darkMode ? t.dark900 : '#fff';
    const textPrimary = darkMode ? '#F8FAFC' : t.neutral900;
    const textSecondary = darkMode ? t.neutral400 : t.neutral600;

    const [form, setForm] = useState({
        name: cat?.name || '',
        description: cat?.description || '',
        description: cat?.description || '',
        color: cat?.color || '#6366F1',
        daily_price_cents: cat?.daily_price_cents != null ? (cat.daily_price_cents / 100).toString() : '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const inputStyle = {
        width: '100%', padding: '11px 14px', borderRadius: 10, fontSize: 14,
        background: inputBg, color: textPrimary, border: `1px solid ${border}`,
        outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.2s',
    };
    const labelStyle = { fontSize: 12, fontWeight: 700, color: textSecondary, marginBottom: 6, display: 'block', textTransform: 'uppercase', letterSpacing: '0.05em' };

    async function handleSubmit(e) {
        e.preventDefault();
        setError('');
        if (!form.name.trim()) { setError('Le nom de la catégorie est requis.'); return; }
        setLoading(true);
        try {
            const payload = {
                ...form,
                daily_price_cents: form.daily_price_cents !== '' ? Math.round(parseFloat(form.daily_price_cents) * 100) : null,
            };
            let result;
            if (isEdit) {
                result = await api(`/api/categories/${cat.id}`, { method: 'PUT', body: payload });
            } else {
                result = await api('/api/categories', { method: 'POST', body: payload });
            }
            onSaved(result);
        } catch (err) {
            setError(err.message || 'Erreur lors de la sauvegarde.');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 300,
        }}>
            <div style={{
                background: cardBg, borderRadius: 20, padding: 32, width: '95%', maxWidth: 480,
                border: `1px solid ${border}`, boxShadow: '0 25px 60px rgba(0,0,0,0.3)',
                maxHeight: '90vh', overflowY: 'auto',
            }}>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 36, height: 36, borderRadius: 10, background: t.primaryLight, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Tag size={18} color={t.primary} />
                        </div>
                        <div>
                            <h2 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: textPrimary }}>
                                {isEdit ? 'Modifier la catégorie' : 'Nouvelle catégorie'}
                            </h2>
                            <p style={{ margin: 0, fontSize: 12, color: textSecondary }}>Catégorie de véhicules</p>
                        </div>
                    </div>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: textSecondary }}>
                        <X size={22} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                    {/* Preview */}
                    <div style={{ display: 'flex', justifyContent: 'center', padding: '16px 0' }}>
                        <div style={{
                            width: 72, height: 72, borderRadius: 18,
                            background: `${form.color}20`, border: `3px solid ${form.color}`,
                            transition: 'all 0.2s',
                        }}>
                        </div>
                    </div>

                    {/* Name */}
                    <div>
                        <label style={labelStyle}>Nom *</label>
                        <input
                            value={form.name}
                            onChange={e => setForm({ ...form, name: e.target.value })}
                            placeholder="ex: SUV, Citadine, Luxe…"
                            style={inputStyle}
                            onFocus={e => e.target.style.borderColor = t.primary}
                            onBlur={e => e.target.style.borderColor = border}
                            required
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <label style={labelStyle}>Description</label>
                        <textarea
                            value={form.description}
                            onChange={e => setForm({ ...form, description: e.target.value })}
                            placeholder="Description optionnelle de la catégorie…"
                            rows={3}
                            style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit' }}
                            onFocus={e => e.target.style.borderColor = t.primary}
                            onBlur={e => e.target.style.borderColor = border}
                        />
                    </div>

                    {/* Daily Price */}
                    <div>
                        <label style={labelStyle}>Tarif journalier</label>
                        <div style={{ position: 'relative' }}>
                            <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={form.daily_price_cents}
                                onChange={e => setForm({ ...form, daily_price_cents: e.target.value })}
                                placeholder="ex: 450.00"
                                style={{ ...inputStyle, paddingRight: 80 }}
                                onFocus={e => e.target.style.borderColor = t.primary}
                                onBlur={e => e.target.style.borderColor = border}
                            />
                            <div style={{
                                position: 'absolute', 
                                right: 1, 
                                top: 1, 
                                bottom: 1, 
                                background: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
                                borderLeft: `1px solid ${border}`,
                                borderRadius: '0 9px 9px 0',
                                padding: '0 12px',
                                display: 'flex',
                                alignItems: 'center',
                                fontSize: 12,
                                fontWeight: 700,
                                color: t.primary,
                                pointerEvents: 'none'
                            }}>
                                {getCurrencySymbol(currency)}/jour
                            </div>
                        </div>
                        <p style={{ margin: '6px 0 0', fontSize: 12, color: textSecondary }}>
                            💡 Ce tarif sera pré-rempli automatiquement lors de l’ajout d’un véhicule dans cette catégorie.
                        </p>
                    </div>



                    {/* Color picker */}
                    <div>
                        <label style={{ ...labelStyle, display: 'flex', alignItems: 'center', gap: 6 }}>
                            <Palette size={12} /> Couleur
                        </label>
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                            {PRESET_COLORS.map(color => (
                                <button key={color} type="button" onClick={() => setForm({ ...form, color })}
                                    style={{
                                        width: 30, height: 30, borderRadius: '50%', background: color,
                                        border: form.color === color ? `3px solid ${darkMode ? '#fff' : '#000'}` : '3px solid transparent',
                                        cursor: 'pointer', transition: 'transform 0.15s',
                                        outline: form.color === color ? `2px solid ${color}` : 'none',
                                        outlineOffset: 2,
                                    }}
                                    onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.15)'}
                                    onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                                />
                            ))}
                            {/* Custom color input */}
                            <input type="color" value={form.color}
                                onChange={e => setForm({ ...form, color: e.target.value })}
                                style={{ width: 30, height: 30, borderRadius: '50%', border: 'none', padding: 0, cursor: 'pointer', background: 'none' }}
                                title="Couleur personnalisée"
                            />
                        </div>
                    </div>

                    {error && (
                        <div style={{ padding: '10px 14px', borderRadius: 10, background: '#FEF2F2', color: '#DC2626', fontSize: 13, fontWeight: 600, border: '1px solid #FECACA', display: 'flex', gap: 8, alignItems: 'center' }}>
                            <AlertTriangle size={15} /> {error}
                        </div>
                    )}

                    <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                        <button type="submit" disabled={loading} style={{
                            flex: 1, padding: '12px 0', background: t.primary, color: '#fff',
                            border: 'none', borderRadius: 12, cursor: loading ? 'not-allowed' : 'pointer',
                            fontWeight: 700, fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                            opacity: loading ? 0.7 : 1,
                        }}>
                            {loading ? <Loader2 size={16} style={{ animation: 'spin 0.8s linear infinite' }} /> : <Check size={16} />}
                            {loading ? 'Enregistrement…' : (isEdit ? 'Mettre à jour' : 'Créer la catégorie')}
                        </button>
                        <button type="button" onClick={onClose} style={{
                            padding: '0 20px', background: 'transparent',
                            border: `1px solid ${border}`, borderRadius: 12,
                            color: textSecondary, cursor: 'pointer', fontWeight: 600, fontSize: 14,
                        }}>
                            Annuler
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

function DeleteConfirmModal({ cat, darkMode, onClose, onConfirmed }) {
    const cardBg = darkMode ? t.dark800 : '#fff';
    const border = darkMode ? t.dark700 : t.neutral200;
    const textPrimary = darkMode ? '#F8FAFC' : t.neutral900;
    const textSecondary = darkMode ? t.neutral400 : t.neutral600;
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    async function handleDelete() {
        setLoading(true); setError('');
        try {
            await api(`/api/categories/${cat.id}`, { method: 'DELETE' });
            onConfirmed(cat.id);
        } catch (err) {
            setError(err.message || 'Impossible de supprimer.');
            setLoading(false);
        }
    }

    return (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 400 }}>
            <div style={{ background: cardBg, borderRadius: 20, padding: 32, width: '95%', maxWidth: 420, border: `1px solid ${border}`, boxShadow: '0 25px 60px rgba(0,0,0,0.3)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 18 }}>
                    <div style={{ width: 44, height: 44, borderRadius: 12, background: '#FEF2F2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <AlertTriangle size={22} color={t.error} />
                    </div>
                    <div>
                        <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: textPrimary }}>Supprimer la catégorie</h3>
                        <p style={{ margin: 0, fontSize: 13, color: textSecondary }}>Cette action est irréversible.</p>
                    </div>
                </div>
                <p style={{ color: textSecondary, fontSize: 14, lineHeight: 1.6, margin: '0 0 20px' }}>
                    Êtes-vous sûr de vouloir supprimer la catégorie <strong style={{ color: textPrimary }}>«{cat.name}»</strong> ?
                    Les véhicules de cette catégorie ne seront pas supprimés mais perdront leur catégorie.
                </p>
                {error && <div style={{ padding: '10px 14px', borderRadius: 10, background: '#FEF2F2', color: '#DC2626', fontSize: 13, fontWeight: 600, border: '1px solid #FECACA', marginBottom: 16 }}>{error}</div>}
                <div style={{ display: 'flex', gap: 10 }}>
                    <button onClick={handleDelete} disabled={loading} style={{
                        flex: 1, padding: '12px 0', background: t.error, color: '#fff', border: 'none',
                        borderRadius: 12, cursor: loading ? 'not-allowed' : 'pointer',
                        fontWeight: 700, fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                        opacity: loading ? 0.7 : 1,
                    }}>
                        {loading ? <Loader2 size={15} style={{ animation: 'spin 0.8s linear infinite' }} /> : <Trash2 size={15} />}
                        {loading ? 'Suppression…' : 'Supprimer'}
                    </button>
                    <button onClick={onClose} style={{ padding: '0 20px', background: 'transparent', border: `1px solid ${border}`, borderRadius: 12, color: textSecondary, cursor: 'pointer', fontWeight: 600, fontSize: 14 }}>
                        Annuler
                    </button>
                </div>
            </div>
        </div>
    );
}

/* ─── Main Page ─────────────────────────────────────── */
export default function Categories() {
    const { darkMode } = useTheme();
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [modalOpen, setModalOpen] = useState(false);
    const [editCat, setEditCat] = useState(null);
    const [deleteCat, setDeleteCat] = useState(null);

    const bg = darkMode ? t.dark900 : t.neutral50;
    const textPrimary = darkMode ? '#F8FAFC' : t.neutral900;
    const textSecondary = darkMode ? t.neutral400 : t.neutral600;
    const cardBg = darkMode ? t.dark800 : '#fff';
    const border = darkMode ? t.dark700 : t.neutral200;
    const { currency } = useCurrency();

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const data = await api('/api/categories');
            setCategories(data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { load(); }, [load]);

    const filtered = categories.filter(c =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        (c.description || '').toLowerCase().includes(search.toLowerCase())
    );

    function handleEdit(cat) { setEditCat(cat); setModalOpen(true); }
    function handleDelete(cat) { setDeleteCat(cat); }
    function handleModalClose() { setModalOpen(false); setEditCat(null); }

    function handleSaved(result) {
        setCategories(prev => {
            const idx = prev.findIndex(c => c.id === result.id);
            if (idx >= 0) { const n = [...prev]; n[idx] = result; return n; }
            return [result, ...prev];
        });
        handleModalClose();
        // Reload to get updated vehicle_count
        load();
    }

    function handleDeleted(id) {
        setCategories(prev => prev.filter(c => c.id !== id));
        setDeleteCat(null);
    }

    return (
        <div style={{ background: bg, minHeight: '100vh', padding: '36px 28px' }}>
            {/* Modals */}
            {modalOpen && (
                <CategoryModal
                    cat={editCat}
                    darkMode={darkMode}
                    onClose={handleModalClose}
                    onSaved={handleSaved}
                    currency={currency}
                />
            )}
            {deleteCat && (
                <DeleteConfirmModal
                    cat={deleteCat}
                    darkMode={darkMode}
                    onClose={() => setDeleteCat(null)}
                    onConfirmed={handleDeleted}
                />
            )}

            <div style={{ maxWidth: 900, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 28 }}>
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
                    <div>
                        <h1 style={{ fontSize: 26, fontWeight: 800, margin: '0 0 4px', color: textPrimary }}>
                            Catégories de véhicules
                        </h1>
                        <p style={{ fontSize: 14, color: textSecondary, margin: 0 }}>
                            Organisez votre flotte par catégories pour une meilleure gestion.
                        </p>
                    </div>
                    <button
                        onClick={() => { setEditCat(null); setModalOpen(true); }}
                        style={{
                            padding: '11px 20px', background: t.primary, color: '#fff', border: 'none',
                            borderRadius: 12, cursor: 'pointer', fontWeight: 700, fontSize: 14,
                            display: 'flex', alignItems: 'center', gap: 8,
                            boxShadow: '0 4px 14px rgba(99,102,241,0.35)',
                            transition: 'transform 0.15s, box-shadow 0.15s',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(99,102,241,0.45)'; }}
                        onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 4px 14px rgba(99,102,241,0.35)'; }}
                    >
                        <Plus size={17} />
                        Nouvelle catégorie
                    </button>
                </div>

                {/* Stats bar */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 14 }}>
                    {[
                        { label: 'Catégories', value: categories.length, icon: Tag, color: t.primary },
                        { label: 'Véhicules classés', value: categories.reduce((s, c) => s + parseInt(c.vehicle_count || 0), 0), icon: Car, color: t.success },
                    ].map(({ label, value, icon: Icon, color }) => (
                        <div key={label} style={{
                            background: cardBg, border: `1px solid ${border}`, borderRadius: 14,
                            padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 14,
                        }}>
                            <div style={{ width: 40, height: 40, borderRadius: 10, background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Icon size={18} color={color} />
                            </div>
                            <div>
                                <div style={{ fontSize: 22, fontWeight: 800, color: textPrimary }}>{value}</div>
                                <div style={{ fontSize: 12, color: textSecondary }}>{label}</div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Search */}
                <div style={{ position: 'relative' }}>
                    <Search size={16} color={textSecondary} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
                    <input
                        type="text"
                        placeholder="Rechercher une catégorie…"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        style={{
                            width: '100%', padding: '11px 14px 11px 40px', borderRadius: 12, fontSize: 14,
                            background: cardBg, color: textPrimary, border: `1px solid ${border}`,
                            outline: 'none', boxSizing: 'border-box',
                        }}
                        onFocus={e => e.target.style.borderColor = t.primary}
                        onBlur={e => e.target.style.borderColor = border}
                    />
                </div>

                {/* Categories list */}
                {loading ? (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200, color: textSecondary, gap: 12 }}>
                        <Loader2 size={22} style={{ animation: 'spin 0.8s linear infinite' }} />
                        Chargement…
                    </div>
                ) : filtered.length === 0 ? (
                    <div style={{
                        background: cardBg, border: `1px solid ${border}`, borderRadius: 16,
                        padding: '60px 24px', textAlign: 'center', color: textSecondary,
                    }}>
                        <Tag size={40} color={border} style={{ marginBottom: 12 }} />
                        <div style={{ fontSize: 16, fontWeight: 700, color: textPrimary, marginBottom: 6 }}>
                            {search ? 'Aucun résultat' : 'Aucune catégorie'}
                        </div>
                        <p style={{ margin: '0 0 20px', fontSize: 14 }}>
                            {search ? `Aucune catégorie ne correspond à "${search}".` : 'Créez votre première catégorie pour organiser votre flotte.'}
                        </p>
                        {!search && (
                            <button onClick={() => { setEditCat(null); setModalOpen(true); }} style={{
                                padding: '10px 20px', background: t.primary, color: '#fff', border: 'none',
                                borderRadius: 10, cursor: 'pointer', fontWeight: 700, fontSize: 14,
                                display: 'inline-flex', alignItems: 'center', gap: 8,
                            }}>
                                <Plus size={15} /> Créer une catégorie
                            </button>
                        )}
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {filtered.map(cat => (
                            <CategoryCard key={cat.id} cat={cat} darkMode={darkMode} onEdit={handleEdit} onDelete={handleDelete} currency={currency} />
                        ))}
                    </div>
                )}
            </div>

            <style>{`
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                input::-webkit-outer-spin-button,
                input::-webkit-inner-spin-button {
                    -webkit-appearance: none;
                    margin: 0;
                }
                input[type=number] {
                    -moz-appearance: textfield;
                }
            `}</style>
        </div>
    );
}
