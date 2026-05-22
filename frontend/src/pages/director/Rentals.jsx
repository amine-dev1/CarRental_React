import { useState, useEffect, useMemo } from 'react';
import { CalendarRange, Search, RefreshCw, Plus, CheckCircle, Clock, FileText, CheckCircle2, DollarSign, X } from 'lucide-react';
import { api } from '../../api/http';
import { useTheme } from '../../context/ThemeContext';
import { showSuccess, showError } from '../../components/CustomToasts';
import CustomSelect from '../../components/common/CustomSelect';
import ContractTab from './Rentals/ContractTab';

const token = {
    primary: '#6366F1', primaryLight: '#EEF2FF',
    success: '#10B981', successLight: '#D1FAE5',
    warning: '#F59E0B', warningLight: '#FEF3C7',
    neutral50: '#F8FAFC', neutral100: '#F1F5F9', neutral200: '#E2E8F0',
    neutral400: '#94A3B8', neutral600: '#475569', neutral900: '#0F172A',
    dark800: '#1E293B', dark900: '#0F172A', dark700: '#334155'
};

function KpiBlock({ label, value, icon: Icon, color, darkMode }) {
    return (
        <div style={{
            background: darkMode ? token.dark800 : '#FFFFFF',
            border: `1px solid ${darkMode ? token.dark700 : token.neutral200}`,
            borderRadius: 16, padding: '20px',
            display: 'flex', flexDirection: 'column', gap: 16
        }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 13, fontWeight: 500, color: darkMode ? token.neutral400 : token.neutral600 }}>{label}</span>
                <div style={{
                    width: 36, height: 36, borderRadius: 10,
                    background: `${color}15`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                    <Icon size={18} color={color} />
                </div>
            </div>
            <div style={{ fontSize: 24, fontWeight: 700, color: darkMode ? '#F8FAFC' : token.neutral900 }}>
                {value}
            </div>
        </div>
    );
}

function StatusPill({ status }) {
    const s = (status || '').toLowerCase();
    
    if (['completed', 'terminé', 'clôturé'].includes(s)) {
        return <span style={{ background: '#DCFCE7', color: '#16A34A', padding: '4px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600 }}>Terminé</span>;
    }
    if (['active', 'en cours', 'ongoing'].includes(s)) {
        return <span style={{ background: '#DBEAFE', color: '#2563EB', padding: '4px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600 }}>En cours</span>;
    }
    if (['reserved', 'réservé', 'pending'].includes(s)) {
        return <span style={{ background: '#FEF3C7', color: '#D97706', padding: '4px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600 }}>Réservé</span>;
    }
    return <span style={{ background: token.neutral100, color: token.neutral600, padding: '4px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600 }}>{status}</span>;
}

export default function Rentals() {
    const { darkMode } = useTheme();
    const [rentals, setRentals] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [vehicles, setVehicles] = useState([]);
    const [agencies, setAgencies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    
    const [showModal, setShowModal] = useState(false);
    const [showContractModal, setShowContractModal] = useState(false);
    const [selectedRental, setSelectedRental] = useState(null);
    const [form, setForm] = useState({ customer_id: '', vehicle_id: '', planned_start_date: '', planned_end_date: '', pickup_agency_id: '', return_agency_id: '' });

    useEffect(() => { loadData(); }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [rData, cData, vData, aData] = await Promise.all([
                api('/api/rentals'),
                api('/api/customers'),
                api('/api/vehicles'),
                api('/api/agences').catch(()=>[])
            ]);
            setRentals(rData);
            setCustomers(cData);
            setVehicles(vData.filter(v => v.status === 'available'));
            setAgencies(aData);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            await api('/api/rentals', { method: 'POST', body: form });
            showSuccess("Contrat généré avec succès !");
            setShowModal(false);
            loadData();
        } catch (e) {
            showError(e.message || "Erreur lors de la génération du contrat");
        }
    };

    const filtered = useMemo(() => {
        return rentals.filter(r => {
            if (statusFilter !== 'all' && (r.status||'').toLowerCase() !== statusFilter) return false;
            if (searchQuery) {
                const q = searchQuery.toLowerCase();
                return (r.full_name||'').toLowerCase().includes(q) || 
                       (r.vehicle_name||'').toLowerCase().includes(q) ||
                       (r.contract_number||'').toLowerCase().includes(q);
            }
            return true;
        });
    }, [rentals, searchQuery, statusFilter]);

    const stats = {
        total: rentals.length,
        active: rentals.filter(r => ['active', 'en cours', 'ongoing'].includes((r.status||'').toLowerCase())).length,
        completed: rentals.filter(r => ['completed', 'terminé', 'clôturé'].includes((r.status||'').toLowerCase())).length,
        revenue: rentals.reduce((sum, r) => sum + (r.total_cents || 0), 0) / 100,
    };

    const bg = darkMode ? token.dark900 : token.neutral50;

    return (
        <div style={{ background: bg, minHeight: '100vh', padding: '32px 28px' }}>
            <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 32 }}>

                <div style={{ display: 'flex', alignItems: 'center', justifyItems: 'space-between' }}>
                    <div style={{ flex: 1 }}>
                        <h1 style={{ fontSize: 24, fontWeight: 700, margin: '0 0 4px', color: darkMode ? '#F8FAFC' : token.neutral900 }}>Locations</h1>
                        <p style={{ fontSize: 14, color: darkMode ? token.neutral400 : token.neutral600, margin: 0 }}>Gérez vos contrats de location v2</p>
                    </div>
                    <button onClick={() => { setForm({ customer_id: '', vehicle_id: '', planned_start_date: '', planned_end_date: '', pickup_agency_id: '', return_agency_id: '' }); setShowModal(true); }} style={{
                        background: token.primary, color: '#fff', border: 'none', padding: '10px 16px', borderRadius: 10, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8
                    }}>
                        <Plus size={16} /> Nouveau contrat
                    </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20 }}>
                    <KpiBlock label="Total Contrats" value={stats.total} icon={FileText} color={token.primary} darkMode={darkMode} />
                    <KpiBlock label="En cours" value={stats.active} icon={Clock} color="#3B82F6" darkMode={darkMode} />
                    <KpiBlock label="Terminés" value={stats.completed} icon={CheckCircle2} color={token.success} darkMode={darkMode} />
                    <KpiBlock label="Revenu Brut" value={`DH${stats.revenue.toLocaleString()}`} icon={DollarSign} color={token.warning} darkMode={darkMode} />
                </div>

                <div style={{
                    display: 'flex', alignItems: 'center', gap: 16, padding: 16, borderRadius: 12,
                    background: darkMode ? token.dark800 : '#fff', border: `1px solid ${darkMode ? token.dark700 : token.neutral200}`
                }}>
                    <div style={{ flex: 1, position: 'relative' }}>
                        <Search size={18} color={token.neutral400} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
                        <input
                            placeholder="Rechercher contrat, client ou véhicule..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                            style={{ width: '100%', padding: '10px 14px 10px 42px', background: darkMode ? token.dark900 : token.neutral100, border: 'none', outline: 'none', color: darkMode ? '#fff' : '#000', borderRadius: 8 }}
                        />
                    </div>
                    <CustomSelect
                        value={statusFilter} onChange={setStatusFilter}
                        options={[{ value: 'all', label: 'Statut' }, { value: 'active', label: 'En cours' }, { value: 'completed', label: 'Terminé' }, { value: 'reserved', label: 'Réservé' }]}
                    />
                </div>

                <div style={{ background: darkMode ? token.dark800 : '#fff', borderRadius: 16, overflow: 'hidden', border: `1px solid ${darkMode ? token.dark700 : token.neutral200}` }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead style={{ borderBottom: `1px solid ${darkMode ? token.dark700 : token.neutral200}`, background: darkMode ? token.dark700 : token.neutral50 }}>
                            <tr>
                                <th style={{ padding: '16px 24px', fontSize: 13, color: token.neutral400 }}>Contrat & Agence</th>
                                <th style={{ padding: '16px 24px', fontSize: 13, color: token.neutral400 }}>Client & Véhicule</th>
                                <th style={{ padding: '16px 24px', fontSize: 13, color: token.neutral400 }}>Période</th>
                                <th style={{ padding: '16px 24px', fontSize: 13, color: token.neutral400 }}>Prix Total</th>
                                <th style={{ padding: '16px 24px', fontSize: 13, color: token.neutral400 }}>Statut</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map(r => (
                                <tr 
                                    key={r.id} 
                                    onClick={() => { setSelectedRental(r); setShowContractModal(true); }}
                                    style={{ borderBottom: `1px solid ${darkMode ? token.dark700 : token.neutral200}`, cursor: 'pointer', transition: 'background 0.2s' }}
                                    onMouseEnter={e => e.currentTarget.style.background = darkMode ? token.dark700 : token.neutral100}
                                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                >
                                    <td style={{ padding: '16px 24px' }}>
                                        <div style={{ fontWeight: 600, color: darkMode ? '#fff' : '#000' }}>{r.contract_number || 'Non généré'}</div>
                                        <div style={{ fontSize: 12, color: token.neutral400 }}>{r.pickup_agency_name || '—'}</div>
                                    </td>
                                    <td style={{ padding: '16px 24px' }}>
                                        <div style={{ fontWeight: 600, color: darkMode ? '#fff' : '#000' }}>{r.full_name || '...'}</div>
                                        <div style={{ fontSize: 12, color: token.neutral400 }}>{r.vehicle_name||'...'} • {r.plate||'...'}</div>
                                    </td>
                                    <td style={{ padding: '16px 24px', fontSize: 14, color: darkMode ? '#fff' : '#000' }}>
                                        {new Date(r.planned_start_date || r.start_date || r.created_at).toLocaleDateString()} <br/>
                                        <span style={{color: token.neutral400}}>au</span> {new Date(r.planned_end_date || r.end_date || r.created_at).toLocaleDateString()}
                                    </td>
                                    <td style={{ padding: '16px 24px', fontSize: 14, fontWeight: 600, color: darkMode ? '#fff' : '#000' }}>
                                        DH{(r.total_cents ? r.total_cents / 100 : 0).toLocaleString()}
                                    </td>
                                    <td style={{ padding: '16px 24px' }}>
                                        <StatusPill status={r.status} />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {showModal && (
                    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
                        <div style={{ background: darkMode ? token.dark800 : '#fff', padding: 32, borderRadius: 16, width: 500, border: `1px solid ${darkMode ? token.dark700 : token.neutral200}` }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
                                <h2 style={{ margin: 0, color: darkMode ? '#fff' : '#000' }}>Nouveau Contrat</h2>
                                <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: token.neutral400 }}><X size={20}/></button>
                            </div>
                            <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                                <select value={form.customer_id} onChange={e => setForm({...form, customer_id: e.target.value})} style={{ padding: 12, borderRadius: 8, background: darkMode ? token.dark900 : '#fff', color: darkMode ? '#fff' : '#000', border: `1px solid ${darkMode ? token.dark700 : token.neutral200}` }} required>
                                    <option value="">-- Client --</option>
                                    {customers.map(c => <option key={c.id} value={c.id}>{c.full_name}</option>)}
                                </select>
                                <select value={form.vehicle_id} onChange={e => setForm({...form, vehicle_id: e.target.value})} style={{ padding: 12, borderRadius: 8, background: darkMode ? token.dark900 : '#fff', color: darkMode ? '#fff' : '#000', border: `1px solid ${darkMode ? token.dark700 : token.neutral200}` }} required>
                                    <option value="">-- Véhicule --</option>
                                    {vehicles.map(v => <option key={v.id} value={v.id}>{v.name} - DH{v.daily_price_cents/100}/jour</option>)}
                                </select>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                                    <input type="date" value={form.planned_start_date} onChange={e => setForm({...form, planned_start_date: e.target.value})} style={{ padding: 12, borderRadius: 8, background: darkMode ? token.dark900 : '#fff', color: darkMode ? '#fff' : '#000', border: `1px solid ${darkMode ? token.dark700 : token.neutral200}` }} required title="Date de départ" />
                                    <input type="date" value={form.planned_end_date} onChange={e => setForm({...form, planned_end_date: e.target.value})} style={{ padding: 12, borderRadius: 8, background: darkMode ? token.dark900 : '#fff', color: darkMode ? '#fff' : '#000', border: `1px solid ${darkMode ? token.dark700 : token.neutral200}` }} required title="Date de retour" />
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                                    <select value={form.pickup_agency_id} onChange={e => setForm({...form, pickup_agency_id: e.target.value})} style={{ padding: 12, borderRadius: 8, background: darkMode ? token.dark900 : '#fff', color: darkMode ? '#fff' : '#000', border: `1px solid ${darkMode ? token.dark700 : token.neutral200}` }}>
                                        <option value="">-- Agence Départ --</option>
                                        {agencies.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                                    </select>
                                    <select value={form.return_agency_id} onChange={e => setForm({...form, return_agency_id: e.target.value})} style={{ padding: 12, borderRadius: 8, background: darkMode ? token.dark900 : '#fff', color: darkMode ? '#fff' : '#000', border: `1px solid ${darkMode ? token.dark700 : token.neutral200}` }}>
                                        <option value="">-- Agence Retour --</option>
                                        {agencies.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                                    </select>
                                </div>

                                <button type="submit" style={{ padding: 12, background: token.primary, color: '#fff', borderRadius: 8, border: 'none', cursor: 'pointer', fontWeight: 600 }}>Générer Contrat</button>
                            </form>
                        </div>
                    </div>
                )}

                {showContractModal && selectedRental && (
                    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
                        <div style={{ background: darkMode ? token.dark800 : '#fff', borderRadius: 16, width: '90%', maxWidth: 900, maxHeight: '90vh', overflowY: 'auto', border: `1px solid ${darkMode ? token.dark700 : token.neutral200}`, position: 'relative' }}>
                            <div style={{ position: 'sticky', top: 0, background: darkMode ? token.dark800 : '#fff', padding: '20px 24px', borderBottom: `1px solid ${darkMode ? token.dark700 : token.neutral200}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 10 }}>
                                <h2 style={{ margin: 0, color: darkMode ? '#fff' : '#000' }}>Gestion du Contrat</h2>
                                <button onClick={() => setShowContractModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: token.neutral400 }}><X size={24}/></button>
                            </div>
                            <ContractTab 
                                rental={selectedRental} 
                                darkMode={darkMode} 
                                onUpdate={() => { loadData(); /* Refresh list after contract status change */ }} 
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
