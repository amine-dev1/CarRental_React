import React, { useState, useEffect, useMemo } from 'react';
import { api } from '../../api/http';
import {
    BookOpen, Search, Clock, CheckCircle2, XCircle, Calendar,
    MapPin, Car, Plus, MoreHorizontal, X
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { showSuccess, showError } from '../../components/CustomToasts';
import CustomSelect from '../../components/common/CustomSelect';

const token = {
    primary: '#6366F1', primaryLight: '#EEF2FF',
    success: '#10B981', successLight: '#D1FAE5',
    warning: '#F59E0B',
    neutral50: '#F8FAFC', neutral100: '#F1F5F9', neutral200: '#E2E8F0',
    neutral400: '#94A3B8', neutral600: '#475569', neutral900: '#0F172A',
    dark900: '#0F172A', dark800: '#1E293B', dark700: '#334155'
};

export default function Reservations() {
    const { darkMode } = useTheme();
    const [reservations, setReservations] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [vehicles, setVehicles] = useState([]);
    const [agencies, setAgencies] = useState([]);
    
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState({ 
        customer_id: '', vehicle_id: '', pickup_agency_id: '', return_agency_id: '', 
        pickup_date: '', return_date: '', status: 'pending', quoted_total_cents: '' 
    });

    const bg = darkMode ? token.dark900 : token.neutral50;
    const cardBg = darkMode ? token.dark800 : '#FFFFFF';
    const borderColor = darkMode ? token.dark700 : token.neutral200;
    const textPrimary = darkMode ? '#F1F5F9' : token.neutral900;
    const textSecondary = darkMode ? token.neutral400 : token.neutral600;

    useEffect(() => { loadData(); }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [rData, cData, vData, aData] = await Promise.all([
                api('/api/reservations'),
                api('/api/customers'),
                api('/api/vehicles'),
                api('/api/agences').catch(()=>[])
            ]);
            setReservations(rData);
            setCustomers(cData);
            setVehicles(vData);
            setAgencies(aData);
        } catch (e) {
            console.error(e);
            showError("Erreur lors du chargement des données.");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const body = { ...form, quoted_total_cents: parseInt(form.quoted_total_cents) || 0 };
            if (form.id) {
                await api(`/api/reservations/${form.id}`, { method: 'PUT', body });
                showSuccess("Réservation modifiée avec succès !");
            } else {
                await api('/api/reservations', { method: 'POST', body });
                showSuccess("Réservation créée avec succès !");
            }
            setShowModal(false);
            loadData();
        } catch (e) {
            showError(e.message || "Erreur lors de l'enregistrement de la réservation.");
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Supprimer cette réservation ?")) return;
        try {
            await api(`/api/reservations/${id}`, { method: 'DELETE' });
            showSuccess("Réservation supprimée !");
            loadData();
        } catch (e) {
            showError(e.message || "Erreur lors de la suppression.");
        }
    };

    const openEdit = (res) => {
        setForm({
            ...res,
            pickup_date: res.pickup_date ? new Date(res.pickup_date).toISOString().split('T')[0] : '',
            return_date: res.return_date ? new Date(res.return_date).toISOString().split('T')[0] : '',
        });
        setShowModal(true);
    };

    const StatusPill = ({ status }) => {
        const styles = {
            pending: { bg: '#FEF3C7', color: '#F59E0B', label: 'En attente' },
            confirmed: { bg: '#D1FAE5', color: '#10B981', label: 'Confirmée' },
            cancelled: { bg: '#FEE2E2', color: '#EF4444', label: 'Annulée' },
        };
        const st = styles[status] || styles.pending;
        return (
            <span style={{ 
                background: darkMode ? `${st.color}20` : st.bg, 
                color: st.color, padding: '4px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600 
            }}>
                {st.label}
            </span>
        );
    };

    const StatusCard = ({ title, count, icon, color }) => (
        <div style={{ background: cardBg, border: `1px solid ${borderColor}`, borderRadius: 16, padding: '20px 24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                <span style={{ fontSize: 13, fontWeight: 500, color: textSecondary }}>{title}</span>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {icon}
                </div>
            </div>
            <div style={{ fontSize: 28, fontWeight: 700, color: textPrimary }}>{count}</div>
        </div>
    );

    const filtered = useMemo(() => {
        return reservations.filter(r => {
            if (statusFilter !== 'all' && (r.status||'').toLowerCase() !== statusFilter) return false;
            if (searchTerm) {
                const q = searchTerm.toLowerCase();
                return (r.customer_name||'').toLowerCase().includes(q) || 
                       (r.vehicle_name||'').toLowerCase().includes(q) ||
                       (r.reservation_number||'').toLowerCase().includes(q);
            }
            return true;
        });
    }, [reservations, searchTerm, statusFilter]);

    return (
        <div style={{ background: bg, minHeight: '100vh', padding: '32px 28px' }}>
            <div style={{ maxWidth: 1200, margin: '0 auto' }}>
                
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
                    <div>
                        <h1 style={{ fontSize: 24, fontWeight: 700, color: textPrimary, margin: '0 0 4px' }}>Réservations</h1>
                        <p style={{ fontSize: 14, color: textSecondary, margin: 0 }}>Gérez vos réservations multi-agences</p>
                    </div>
                    <button onClick={() => { setForm({ customer_id: '', vehicle_id: '', pickup_agency_id: '', return_agency_id: '', pickup_date: '', return_date: '', status: 'pending', quoted_total_cents: '' }); setShowModal(true); }} style={{
                        background: token.primary, color: '#fff', border: 'none', padding: '10px 16px', borderRadius: 10, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8
                    }}>
                        <Plus size={16} /> Nouvelle réservation
                    </button>
                </div>

                {/* KPI Strip */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
                    <StatusCard title="Total" count={reservations.length} icon={<BookOpen size={16} color={token.primary} />} color={token.primary} />
                    <StatusCard title="En attente" count={reservations.filter(r => r.status==='pending').length} icon={<Clock size={16} color={token.warning} />} color={token.warning} />
                    <StatusCard title="Confirmées" count={reservations.filter(r => r.status==='confirmed').length} icon={<CheckCircle2 size={16} color={token.success} />} color={token.success} />
                    <StatusCard title="Annulées" count={reservations.filter(r => r.status==='cancelled').length} icon={<XCircle size={16} color="#EF4444" />} color="#EF4444" />
                </div>

                {/* Action Bar */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, background: cardBg, padding: '16px 20px', borderRadius: 16, border: `1px solid ${borderColor}` }}>
                    <div style={{ position: 'relative', width: 300 }}>
                        <Search size={16} color={textSecondary} style={{ position: 'absolute', left: 14, top: 12 }} />
                        <input
                            placeholder="Rechercher une réservation..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{
                                width: '100%', padding: '10px 10px 10px 40px',
                                borderRadius: 10, border: 'none',
                                fontSize: 14, background: darkMode ? token.dark900 : token.neutral100, color: textPrimary,
                                outline: 'none'
                            }}
                        />
                    </div>
                    <CustomSelect
                        value={statusFilter} onChange={setStatusFilter}
                        options={[{ value: 'all', label: 'Statut' }, { value: 'pending', label: 'En attente' }, { value: 'confirmed', label: 'Confirmée' }, { value: 'cancelled', label: 'Annulée' }]}
                    />
                </div>

                {/* Data Table */}
                <div style={{ background: cardBg, borderRadius: 16, border: `1px solid ${borderColor}`, overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead style={{ background: darkMode ? token.dark700 : token.neutral50, borderBottom: `1px solid ${borderColor}` }}>
                            <tr>
                                <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: 13, fontWeight: 600, color: textSecondary }}>N° Réservation</th>
                                <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: 13, fontWeight: 600, color: textSecondary }}>Client & Véhicule</th>
                                <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: 13, fontWeight: 600, color: textSecondary }}>Départ</th>
                                <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: 13, fontWeight: 600, color: textSecondary }}>Retour</th>
                                <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: 13, fontWeight: 600, color: textSecondary }}>Statut</th>
                                <th style={{ padding: '16px 24px', textAlign: 'right', fontSize: 13, fontWeight: 600, color: textSecondary }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.length > 0 ? filtered.map((res) => (
                                <tr key={res.id} style={{ borderBottom: `1px solid ${borderColor}` }}>
                                    <td style={{ padding: '16px 24px', fontSize: 14, fontWeight: 600, color: textPrimary }}>{res.reservation_number}</td>
                                    <td style={{ padding: '16px 24px' }}>
                                        <div style={{ fontSize: 14, fontWeight: 600, color: textPrimary }}>{res.customer_name}</div>
                                        <div style={{ fontSize: 13, color: textSecondary, display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                                            <Car size={14} /> {res.vehicle_name} {res.plate ? `(${res.plate})` : ''}
                                        </div>
                                    </td>
                                    <td style={{ padding: '16px 24px' }}>
                                        <div style={{ fontSize: 14, color: textPrimary, display: 'flex', alignItems: 'center', gap: 6 }}><Calendar size={14} color={textSecondary} /> {res.pickup_date ? new Date(res.pickup_date).toLocaleDateString() : 'N/A'}</div>
                                        <div style={{ fontSize: 13, color: textSecondary, marginTop: 4, display: 'flex', alignItems: 'center', gap: 6 }}><MapPin size={14} /> {res.pickup_agency_name || 'N/A'}</div>
                                    </td>
                                    <td style={{ padding: '16px 24px' }}>
                                        <div style={{ fontSize: 14, color: textPrimary, display: 'flex', alignItems: 'center', gap: 6 }}><Calendar size={14} color={textSecondary} /> {res.return_date ? new Date(res.return_date).toLocaleDateString() : 'N/A'}</div>
                                        <div style={{ fontSize: 13, color: textSecondary, marginTop: 4, display: 'flex', alignItems: 'center', gap: 6 }}><MapPin size={14} /> {res.return_agency_name || 'N/A'}</div>
                                    </td>
                                    <td style={{ padding: '16px 24px' }}>
                                        <StatusPill status={res.status} />
                                    </td>
                                    <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                                        <button onClick={() => openEdit(res)} style={{ background: 'none', border: 'none', color: token.primary, cursor: 'pointer', fontSize: 13, fontWeight: 600, marginRight: 12 }}>Modifier</button>
                                        <button onClick={() => handleDelete(res.id)} style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>Sup.</button>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={6} style={{ padding: 40, textAlign: 'center', color: textSecondary }}>
                                        {loading ? 'Chargement...' : 'Aucune réservation trouvée.'}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Modal */}
                {showModal && (
                    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
                        <div style={{ background: cardBg, padding: 32, borderRadius: 16, width: 500, border: `1px solid ${borderColor}` }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
                                <h2 style={{ margin: 0, color: textPrimary }}>{form.id ? 'Modifier' : 'Créer'} Réservation</h2>
                                <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: textSecondary }}><X size={20}/></button>
                            </div>
                            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                                <select value={form.customer_id} onChange={e => setForm({...form, customer_id: e.target.value})} style={{ padding: 12, borderRadius: 8, background: bg, color: textPrimary, border: `1px solid ${borderColor}` }} required>
                                    <option value="">-- Client --</option>
                                    {customers.map(c => <option key={c.id} value={c.id}>{c.full_name}</option>)}
                                </select>
                                <select value={form.vehicle_id} onChange={e => setForm({...form, vehicle_id: e.target.value})} style={{ padding: 12, borderRadius: 8, background: bg, color: textPrimary, border: `1px solid ${borderColor}` }} required>
                                    <option value="">-- Véhicule --</option>
                                    {vehicles.map(v => <option key={v.id} value={v.id}>{v.name} - DH{v.daily_price_cents/100}/jour</option>)}
                                </select>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                                    <input type="date" value={form.pickup_date} onChange={e => setForm({...form, pickup_date: e.target.value})} style={{ padding: 12, borderRadius: 8, background: bg, color: textPrimary, border: `1px solid ${borderColor}` }} required title="Date de départ" />
                                    <input type="date" value={form.return_date} onChange={e => setForm({...form, return_date: e.target.value})} style={{ padding: 12, borderRadius: 8, background: bg, color: textPrimary, border: `1px solid ${borderColor}` }} required title="Date de retour" />
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                                    <select value={form.pickup_agency_id} onChange={e => setForm({...form, pickup_agency_id: e.target.value})} style={{ padding: 12, borderRadius: 8, background: bg, color: textPrimary, border: `1px solid ${borderColor}` }}>
                                        <option value="">-- Agence Départ --</option>
                                        {agencies.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                                    </select>
                                    <select value={form.return_agency_id} onChange={e => setForm({...form, return_agency_id: e.target.value})} style={{ padding: 12, borderRadius: 8, background: bg, color: textPrimary, border: `1px solid ${borderColor}` }}>
                                        <option value="">-- Agence Retour --</option>
                                        {agencies.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                                    </select>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                                    <select value={form.status} onChange={e => setForm({...form, status: e.target.value})} style={{ padding: 12, borderRadius: 8, background: bg, color: textPrimary, border: `1px solid ${borderColor}` }}>
                                        <option value="pending">En attente</option>
                                        <option value="confirmed">Confirmée</option>
                                        <option value="cancelled">Annulée</option>
                                    </select>
                                    <input type="number" value={form.quoted_total_cents} onChange={e => setForm({...form, quoted_total_cents: e.target.value})} placeholder="Prix (cents)" style={{ padding: 12, borderRadius: 8, background: bg, color: textPrimary, border: `1px solid ${borderColor}` }} required />
                                </div>

                                <button type="submit" style={{ padding: 12, background: token.primary, color: '#fff', borderRadius: 8, border: 'none', cursor: 'pointer', fontWeight: 600 }}>Enregistrer</button>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
