import { useState, useEffect, useMemo } from 'react';
import { Car, Search, RefreshCw, Plus, MoreHorizontal, Wrench, Building2, X } from 'lucide-react';
import { api } from '../../api/http';
import { useTheme } from '../../context/ThemeContext';
import { showSuccess, showError } from '../../components/CustomToasts';
import CustomSelect from '../../components/common/CustomSelect';

const token = {
    primary: '#6366F1', primaryLight: '#EEF2FF', primaryBorder: '#C7D2FE',
    success: '#22C55E', successLight: '#DCFCE7',
    warning: '#F59E0B', warningLight: '#FEF3C7',
    neutral50: '#F8FAFC', neutral100: '#F1F5F9', neutral200: '#E2E8F0',
    neutral400: '#94A3B8', neutral600: '#475569', neutral900: '#0F172A',
    dark800: '#1E293B', dark900: '#0F172A',
};

function KpiBlock({ label, value, icon: Icon, darkMode }) {
    return (
        <div style={{
            background: darkMode ? '#1E293B' : '#FFFFFF',
            border: `1px solid ${darkMode ? '#334155' : token.neutral200}`,
            borderRadius: 16, padding: '20px',
            display: 'flex', flexDirection: 'column', gap: 16
        }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 13, fontWeight: 500, color: darkMode ? token.neutral400 : token.neutral600 }}>{label}</span>
                <div style={{
                    width: 36, height: 36, borderRadius: 10,
                    background: darkMode ? '#334155' : token.primaryLight,
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                    <Icon size={18} color={token.primary} />
                </div>
            </div>
            <div style={{ fontSize: 24, fontWeight: 700, color: darkMode ? '#F8FAFC' : token.neutral900 }}>
                {value}
            </div>
        </div>
    );
}

function StatusPill({ status, isRented, darkMode }) {
    let bg, color, text;
    if (status === 'maintenance') {
        bg = darkMode ? '#78350F' : token.warningLight; color = darkMode ? '#FBBF24' : token.warning; text = 'Maintenance';
    } else if (isRented) {
        bg = darkMode ? '#1E3A8A' : '#DBEAFE'; color = darkMode ? '#60A5FA' : '#3B82F6'; text = 'En location';
    } else {
        bg = darkMode ? '#064E3B' : token.successLight; color = darkMode ? '#34D399' : token.success; text = 'Disponible';
    }

    return (
        <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '4px 10px', borderRadius: 20, background: bg, color: color,
            fontSize: 12, fontWeight: 600
        }}>
            {text}
        </span>
    );
}

export default function Fleet() {
    const { darkMode } = useTheme();
    const [vehicles, setVehicles] = useState([]);
    const [agencies, setAgencies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [agencyFilter, setAgencyFilter] = useState('all');
    
    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState({ name: '', plate: '', daily_price_cents: '', agency_id: '', fuel_type: '', transmission: 'manuelle' });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [vData, aData, rData] = await Promise.all([
                api('/api/vehicles'),
                api('/api/agences').catch(() => []),
                api('/api/rentals').catch(() => [])
            ]);
            setAgencies(aData);
            
            const activeRentals = (rData || []).filter(r => r.status === 'active' || r.status === 'en cours');
            const rentedIds = new Set(activeRentals.map(r => r.vehicle_id));

            setVehicles(vData.map(v => ({ ...v, is_rented: rentedIds.has(v.id) })));
        } catch (e) {
            showError('Erreur chargement flotte');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            let body = { ...form, daily_price_cents: parseInt(form.daily_price_cents) };
            if (!body.agency_id) delete body.agency_id;
            
            if (form.id) {
                await api(`/api/vehicles/${form.id}`, { method: 'PUT', body });
                showSuccess("Véhicule mis à jour !");
            } else {
                await api('/api/vehicles', { method: 'POST', body });
                showSuccess("Véhicule ajouté !");
            }
            setShowModal(false);
            loadData();
        } catch (e) {
            showError(e.message || "Erreur lors de l'enregistrement du véhicule");
        }
    };

    const filteredVehicles = useMemo(() => {
        return vehicles.filter(v => {
            if (statusFilter !== 'all' && v.status !== statusFilter) return false;
            if (agencyFilter !== 'all' && v.agency_id !== agencyFilter) return false;
            if (searchQuery) {
                const q = searchQuery.toLowerCase();
                return (v.name||'').toLowerCase().includes(q) || (v.plate||'').toLowerCase().includes(q);
            }
            return true;
        });
    }, [vehicles, searchQuery, statusFilter, agencyFilter]);

    const stats = {
        total: vehicles.length,
        rented: vehicles.filter(v => v.is_rented).length,
        available: vehicles.filter(v => v.status === 'available' && !v.is_rented).length,
        unassigned: vehicles.filter(v => !v.agency_id).length,
    };

    const bg = darkMode ? token.dark900 : token.neutral50;

    return (
        <div style={{ background: bg, minHeight: '100vh', padding: '32px 28px' }}>
            <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 32 }}>

                <div style={{ display: 'flex', alignItems: 'center', justifyItems: 'space-between' }}>
                    <div style={{ flex: 1 }}>
                        <h1 style={{ fontSize: 24, fontWeight: 700, margin: '0 0 4px', color: darkMode ? '#F8FAFC' : token.neutral900 }}>Gestion de la flotte</h1>
                        <p style={{ fontSize: 14, color: darkMode ? token.neutral400 : token.neutral600, margin: 0 }}>Gérez vos véhicules v2</p>
                    </div>
                    <button onClick={() => { setForm({ name: '', plate: '', daily_price_cents: '', agency_id: '', fuel_type: '', transmission: 'manuelle' }); setShowModal(true); }} style={{
                        background: token.primary, color: '#fff', border: 'none', padding: '10px 16px', borderRadius: 10, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8
                    }}>
                        <Plus size={16} /> Ajouter
                    </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20 }}>
                    <KpiBlock label="Total véhicules" value={stats.total} icon={Car} darkMode={darkMode} />
                    <KpiBlock label="Disponibles" value={stats.available} icon={Car} darkMode={darkMode} />
                    <KpiBlock label="En location" value={stats.rented} icon={Car} darkMode={darkMode} />
                    <KpiBlock label="Non affectés" value={stats.unassigned} icon={Building2} darkMode={darkMode} />
                </div>

                <div style={{
                    display: 'flex', alignItems: 'center', gap: 16, padding: 16, borderRadius: 12,
                    background: darkMode ? '#1E293B' : '#fff', border: `1px solid ${darkMode ? '#334155' : token.neutral200}`
                }}>
                    <div style={{ flex: 1, position: 'relative' }}>
                        <Search size={18} color={token.neutral400} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
                        <input
                            placeholder="Rechercher..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                            style={{ width: '100%', padding: '10px 14px 10px 42px', background: darkMode ? '#0F172A' : token.neutral100, border: 'none', outline: 'none', color: darkMode ? '#fff' : '#000', borderRadius: 8 }}
                        />
                    </div>
                    <CustomSelect
                        value={agencyFilter} onChange={setAgencyFilter}
                        options={[{ value: 'all', label: 'Toutes les agences' }, ...agencies.map(a => ({ value: a.id, label: a.name }))]}
                    />
                    <CustomSelect
                        value={statusFilter} onChange={setStatusFilter}
                        options={[{ value: 'all', label: 'Statut' }, { value: 'available', label: 'Disponibles' }, { value: 'maintenance', label: 'En maintenance' }]}
                    />
                </div>

                <div style={{ background: darkMode ? '#1E293B' : '#fff', borderRadius: 16, overflow: 'hidden', border: `1px solid ${darkMode ? '#334155' : token.neutral200}` }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead style={{ borderBottom: `1px solid ${darkMode ? '#334155' : token.neutral200}`, background: darkMode ? token.dark700 : token.neutral50 }}>
                            <tr>
                                <th style={{ padding: '16px 24px', fontSize: 13, color: token.neutral400 }}>Véhicule</th>
                                <th style={{ padding: '16px 24px', fontSize: 13, color: token.neutral400 }}>Agence</th>
                                <th style={{ padding: '16px 24px', fontSize: 13, color: token.neutral400 }}>Statut</th>
                                <th style={{ padding: '16px 24px', fontSize: 13, color: token.neutral400 }}>Info</th>
                                <th style={{ padding: '16px 24px', fontSize: 13, color: token.neutral400, textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredVehicles.map(v => (
                                <tr key={v.id} style={{ borderBottom: `1px solid ${darkMode ? '#334155' : token.neutral200}` }}>
                                    <td style={{ padding: '16px 24px' }}>
                                        <div style={{ fontWeight: 600, color: darkMode ? '#fff' : '#000' }}>{v.name}</div>
                                        <div style={{ fontSize: 12, color: token.neutral400 }}>{v.plate}</div>
                                    </td>
                                    <td style={{ padding: '16px 24px', fontSize: 14, color: darkMode ? '#fff' : '#000' }}>
                                        {v.agency_name || <span style={{color: token.warning}}>Non affecté</span>}
                                    </td>
                                    <td style={{ padding: '16px 24px' }}>
                                        <StatusPill status={v.status} isRented={v.is_rented} darkMode={darkMode} />
                                    </td>
                                    <td style={{ padding: '16px 24px', fontSize: 13, color: token.neutral400 }}>
                                        {v.fuel_type || '—'} / {v.transmission || '—'}
                                    </td>
                                    <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                                        <button onClick={() => { setForm(v); setShowModal(true); }} style={{ background: 'none', border: 'none', color: token.primary, cursor: 'pointer', fontWeight: 600 }}>Modifier</button>
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
                                <h2 style={{ margin: 0, color: darkMode ? '#fff' : '#000' }}>{form.id ? 'Edit' : 'New'} Véhicule</h2>
                                <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: token.neutral400 }}><X size={20}/></button>
                            </div>
                            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                                <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="Nom (Ex: Clio 5)" style={{ padding: 12, borderRadius: 8, background: darkMode ? token.dark900 : '#fff', color: darkMode ? '#fff' : '#000', border: `1px solid ${darkMode ? token.dark700 : token.neutral200}` }} required />
                                <input value={form.plate} onChange={e => setForm({...form, plate: e.target.value})} placeholder="Plaque" style={{ padding: 12, borderRadius: 8, background: darkMode ? token.dark900 : '#fff', color: darkMode ? '#fff' : '#000', border: `1px solid ${darkMode ? token.dark700 : token.neutral200}` }} required />
                                <input type="number" value={form.daily_price_cents} onChange={e => setForm({...form, daily_price_cents: e.target.value})} placeholder="Prix par jour (cents)" style={{ padding: 12, borderRadius: 8, background: darkMode ? token.dark900 : '#fff', color: darkMode ? '#fff' : '#000', border: `1px solid ${darkMode ? token.dark700 : token.neutral200}` }} required />
                                <select value={form.agency_id || ''} onChange={e => setForm({...form, agency_id: e.target.value})} style={{ padding: 12, borderRadius: 8, background: darkMode ? token.dark900 : '#fff', color: darkMode ? '#fff' : '#000', border: `1px solid ${darkMode ? token.dark700 : token.neutral200}` }}>
                                    <option value="">-- Agence --</option>
                                    {agencies.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                                </select>
                                <select value={form.fuel_type || ''} onChange={e => setForm({...form, fuel_type: e.target.value})} style={{ padding: 12, borderRadius: 8, background: darkMode ? token.dark900 : '#fff', color: darkMode ? '#fff' : '#000', border: `1px solid ${darkMode ? token.dark700 : token.neutral200}` }}>
                                    <option value="">-- Carburant --</option>
                                    <option value="essence">Essence</option>
                                    <option value="diesel">Diesel</option>
                                    <option value="hybride">Hybride</option>
                                    <option value="electrique">Electrique</option>
                                </select>
                                <button type="submit" style={{ padding: 12, background: token.primary, color: '#fff', borderRadius: 8, border: 'none', cursor: 'pointer', fontWeight: 600 }}>Enregistrer</button>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
