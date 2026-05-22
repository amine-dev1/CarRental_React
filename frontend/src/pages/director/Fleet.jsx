import { useState, useEffect, useMemo } from 'react';
import { Car, Search, RefreshCw, Plus, MoreHorizontal, Wrench, Building2, X } from 'lucide-react';
import { api } from '../../api/http';
import { useTheme } from '../../context/ThemeContext';
import { showSuccess, showError } from '../../components/CustomToasts';
import CustomSelect from '../../components/common/CustomSelect';
import { useCurrency, getCurrencySymbol } from '../../context/CurrencyContext';

const token = {
    primary: '#6366F1', primaryLight: '#EEF2FF', primaryBorder: '#C7D2FE',
    success: '#22C55E', successLight: '#DCFCE7',
    warning: '#F59E0B', warningLight: '#FEF3C7',
    neutral50: '#F8FAFC', neutral100: '#F1F5F9', neutral200: '#E2E8F0',
    neutral400: '#94A3B8', neutral600: '#475569', neutral900: '#0F172A',
    dark800: '#1E293B', dark900: '#0F172A',
};

const fadeInStyle = `
@keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
}
@keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
}
`;

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
    const { currency } = useCurrency();

    useEffect(() => {
        const style = document.createElement('style');
        style.innerHTML = fadeInStyle;
        document.head.appendChild(style);
        return () => document.head.removeChild(style);
    }, []);

    const [vehicles, setVehicles] = useState([]);
    const [agencies, setAgencies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [agencyFilter, setAgencyFilter] = useState('all');
    
    const [showModal, setShowModal] = useState(false);
    const [step, setStep] = useState(1);
    const [categories, setCategories] = useState([]);
    const [photoUploading, setPhotoUploading] = useState(false);
    const [form, setForm] = useState({ 
        name: '', plate: '', daily_price_cents: '', agency_id: '', category_id: '',
        brand: '', model: '', year: '', color: '', vin: '', fuel_type: '', 
        transmission: 'manuelle', seats: 5, doors: 4, ac: true, deposit_cents: 0,
        mileage: 0, last_service_km: 0, next_service_km: 0,
        insurance_expiry: '', last_maintenance_date: '', next_maintenance_date: '',
        photo_url: '', notes: ''
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [vData, aData, rData, cData] = await Promise.all([
                api('/api/vehicles'),
                api('/api/agences').catch(() => []),
                api('/api/rentals').catch(() => []),
                api('/api/categories').catch(() => [])
            ]);
            setAgencies(aData);
            setCategories(cData);
            
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
        if (photoUploading) {
            showError("Veuillez patienter, la photo est en cours d'envoi.");
            return;
        }
        try {
            let body = { 
                ...form, 
                daily_price_cents: parseInt(form.daily_price_cents) || 0,
                deposit_cents: parseInt(form.deposit_cents) || 0,
                year: parseInt(form.year) || null,
                seats: parseInt(form.seats) || 5,
                doors: parseInt(form.doors) || 4,
                mileage: parseInt(form.mileage) || 0,
                last_service_km: parseInt(form.last_service_km) || 0,
                next_service_km: parseInt(form.next_service_km) || 0,
            };
            if (!body.agency_id) body.agency_id = null;
            if (!body.category_id) body.category_id = null;
            
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
                    <button onClick={() => { 
                        setForm({ 
                            name: '', plate: '', daily_price_cents: '', agency_id: '', category_id: '',
                            brand: '', model: '', year: '', color: '', vin: '', fuel_type: '', 
                            transmission: 'manuelle', seats: 5, doors: 4, ac: true, deposit_cents: 0,
                            mileage: 0, last_service_km: 0, next_service_km: 0,
                            insurance_expiry: '', last_maintenance_date: '', next_maintenance_date: '',
                            photo_url: '', notes: ''
                        }); 
                        setStep(1);
                        setShowModal(true); 
                    }} style={{
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
                                        <button onClick={() => { 
                                            const vEdit = { ...v };
                                            // Format dates for input type="date" (YYYY-MM-DD)
                                            if (vEdit.insurance_expiry) vEdit.insurance_expiry = vEdit.insurance_expiry.split('T')[0];
                                            if (vEdit.last_maintenance_date) vEdit.last_maintenance_date = vEdit.last_maintenance_date.split('T')[0];
                                            if (vEdit.next_maintenance_date) vEdit.next_maintenance_date = vEdit.next_maintenance_date.split('T')[0];
                                            setForm(vEdit); 
                                            setStep(1);
                                            setShowModal(true); 
                                        }} style={{ background: 'none', border: 'none', color: token.primary, cursor: 'pointer', fontWeight: 600 }}>Modifier</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {showModal && (
                    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
                        <div style={{ background: darkMode ? token.dark800 : '#fff', padding: 32, borderRadius: 20, width: '95%', maxWidth: 700, maxHeight: '90vh', overflowY: 'auto', border: `1px solid ${darkMode ? '#334155' : token.neutral200}`, boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }}>
                            
                            {/* Modal Header */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
                                <div>
                                    <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: darkMode ? '#fff' : '#000' }}>{form.id ? 'Modifier' : 'Nouveau'} Véhicule</h2>
                                    <p style={{ margin: '4px 0 0', fontSize: 13, color: token.neutral400 }}>Étape {step} sur 3</p>
                                </div>
                                <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: token.neutral400, padding: 8, borderRadius: 8 }}><X size={24}/></button>
                            </div>

                            {/* Progress Stepper */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32 }}>
                                {[1, 2, 3].map(s => (
                                    <div key={s} style={{ flex: 1, height: 4, borderRadius: 2, background: step >= s ? token.primary : (darkMode ? token.dark700 : token.neutral100), transition: 'all 0.3s' }} />
                                ))}
                            </div>

                            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                                
                                {step === 1 && (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, animation: 'fadeIn 0.3s ease-in-out' }}>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                                <label style={{ fontSize: 13, fontWeight: 600, color: darkMode ? token.neutral400 : token.neutral600 }}>Nom commercial *</label>
                                                <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="Ex: Clio 5" style={{ padding: 12, borderRadius: 10, background: darkMode ? token.dark900 : '#fff', color: darkMode ? '#fff' : '#000', border: `1px solid ${darkMode ? '#334155' : token.neutral200}`, outline: 'none' }} required />
                                            </div>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                                <label style={{ fontSize: 13, fontWeight: 600, color: darkMode ? token.neutral400 : token.neutral600 }}>Immatriculation *</label>
                                                <input value={form.plate} onChange={e => setForm({...form, plate: e.target.value})} placeholder="Ex: 12345-A-1" style={{ padding: 12, borderRadius: 10, background: darkMode ? token.dark900 : '#fff', color: darkMode ? '#fff' : '#000', border: `1px solid ${darkMode ? '#334155' : token.neutral200}`, outline: 'none' }} required />
                                            </div>
                                        </div>

                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                                <label style={{ fontSize: 13, fontWeight: 600, color: darkMode ? token.neutral400 : token.neutral600 }}>Marque</label>
                                                <input value={form.brand} onChange={e => setForm({...form, brand: e.target.value})} placeholder="Renault" style={{ padding: 12, borderRadius: 10, background: darkMode ? token.dark900 : '#fff', color: darkMode ? '#fff' : '#000', border: `1px solid ${darkMode ? '#334155' : token.neutral200}`, outline: 'none' }} />
                                            </div>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                                <label style={{ fontSize: 13, fontWeight: 600, color: darkMode ? token.neutral400 : token.neutral600 }}>Modèle</label>
                                                <input value={form.model} onChange={e => setForm({...form, model: e.target.value})} placeholder="Clio 5 V" style={{ padding: 12, borderRadius: 10, background: darkMode ? token.dark900 : '#fff', color: darkMode ? '#fff' : '#000', border: `1px solid ${darkMode ? '#334155' : token.neutral200}`, outline: 'none' }} />
                                            </div>
                                        </div>

                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                                <label style={{ fontSize: 13, fontWeight: 600, color: darkMode ? token.neutral400 : token.neutral600 }}>Année</label>
                                                <input type="number" value={form.year} onChange={e => setForm({...form, year: e.target.value})} placeholder="2024" style={{ padding: 12, borderRadius: 10, background: darkMode ? token.dark900 : '#fff', color: darkMode ? '#fff' : '#000', border: `1px solid ${darkMode ? '#334155' : token.neutral200}`, outline: 'none' }} />
                                            </div>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                                <label style={{ fontSize: 13, fontWeight: 600, color: darkMode ? token.neutral400 : token.neutral600 }}>Prix / Jour ({getCurrencySymbol(currency)}) *</label>
                                                <div style={{ position: 'relative' }}>
                                                    <input
                                                        type="number"
                                                        value={form.daily_price_cents !== '' ? (form.daily_price_cents / 100) : ''}
                                                        onChange={e => setForm({...form, daily_price_cents: Math.round(parseFloat(e.target.value || 0) * 100)})}
                                                        placeholder="450.00"
                                                        style={{
                                                            padding: '12px 80px 12px 12px', borderRadius: 10, width: '100%', boxSizing: 'border-box',
                                                            background: darkMode ? token.dark900 : '#fff', color: darkMode ? '#fff' : '#000',
                                                            border: `1px solid ${darkMode ? '#334155' : token.neutral200}`, outline: 'none'
                                                        }}
                                                        required
                                                    />
                                                    <div style={{
                                                        position: 'absolute', 
                                                        right: 1, top: 1, bottom: 1,
                                                        background: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
                                                        borderLeft: `1px solid ${darkMode ? '#334155' : token.neutral200}`,
                                                        borderRadius: '0 9px 9px 0',
                                                        padding: '0 12px',
                                                        display: 'flex', alignItems: 'center',
                                                        fontSize: 12, fontWeight: 700, color: token.primary,
                                                        pointerEvents: 'none'
                                                    }}>
                                                        {getCurrencySymbol(currency)}/j
                                                    </div>
                                                </div>
                                                {form.category_id && categories.find(c => c.id === form.category_id)?.daily_price_cents != null && (
                                                    <p style={{ margin: 0, fontSize: 11, color: '#16A34A', fontWeight: 600 }}>💡 Tarif hérité de la catégorie sélectionnée</p>
                                                )}
                                            </div>
                                        </div>

                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                            <label style={{ fontSize: 13, fontWeight: 600, color: darkMode ? token.neutral400 : token.neutral600 }}>Photo du véhicule</label>
                                            <label style={{
                                                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                                                gap: 12, padding: 20, borderRadius: 12, cursor: 'pointer',
                                                border: `2px dashed ${form.photo_url ? token.primary : (darkMode ? '#334155' : token.neutral200)}`,
                                                background: darkMode ? token.dark900 : token.neutral50,
                                                position: 'relative', overflow: 'hidden', minHeight: 130,
                                                transition: 'border-color 0.2s'
                                            }}>
                                                {form.photo_url ? (
                                                    <>
                                                        <img src={form.photo_url} alt="Aperçu véhicule" style={{ maxHeight: 120, maxWidth: '100%', objectFit: 'contain', borderRadius: 8 }} />
                                                        <span style={{ fontSize: 12, color: token.primary, fontWeight: 600 }}>✓ Photo uploadée — Cliquer pour changer</span>
                                                    </>
                                                ) : photoUploading ? (
                                                    <>
                                                        <div style={{ width: 36, height: 36, border: `3px solid ${token.primary}`, borderTop: '3px solid transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                                                        <span style={{ fontSize: 13, color: token.neutral400 }}>Upload en cours...</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke={token.neutral400} strokeWidth="1.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                                                        <div style={{ textAlign: 'center' }}>
                                                            <div style={{ fontSize: 14, fontWeight: 600, color: darkMode ? '#fff' : '#000' }}>Cliquer ou glisser une photo</div>
                                                            <div style={{ fontSize: 12, color: token.neutral400, marginTop: 4 }}>JPEG, PNG, WebP &bull; 5 Mo max</div>
                                                        </div>
                                                    </>
                                                )}
                                                <input
                                                    type="file"
                                                    accept="image/jpeg,image/png,image/webp,image/gif"
                                                    style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }}
                                                    onChange={async (e) => {
                                                        const file = e.target.files?.[0];
                                                        if (!file) return;
                                                        setPhotoUploading(true);
                                                        try {
                                                            const fd = new FormData();
                                                            fd.append('photo', file);
                                                            const token = localStorage.getItem('token');
                                                            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000';
                                                            const res = await fetch(`${apiUrl}/api/upload/vehicle-photo`, {
                                                                method: 'POST',
                                                                headers: token ? { Authorization: `Bearer ${token}` } : {},
                                                                body: fd,
                                                            });
                                                            if (!res.ok) throw new Error((await res.json()).error || 'Upload failed');
                                                            const { url } = await res.json();
                                                            setForm(f => ({ ...f, photo_url: url }));
                                                            showSuccess('Photo uploadée !');
                                                        } catch (err) {
                                                            showError(err.message || 'Erreur lors de l\'upload');
                                                        } finally {
                                                            setPhotoUploading(false);
                                                        }
                                                    }}
                                                />
                                            </label>
                                        </div>
                                    </div>
                                )}

                                {step === 2 && (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, animation: 'fadeIn 0.3s ease-in-out' }}>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                                <label style={{ fontSize: 13, fontWeight: 600, color: darkMode ? token.neutral400 : token.neutral600 }}>Agence</label>
                                                <select value={form.agency_id || ''} onChange={e => setForm({...form, agency_id: e.target.value})} style={{ padding: 12, borderRadius: 10, background: darkMode ? token.dark900 : '#fff', color: darkMode ? '#fff' : '#000', border: `1px solid ${darkMode ? '#334155' : token.neutral200}`, outline: 'none' }}>
                                                    <option value="">-- Non affecté --</option>
                                                    {agencies.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                                                </select>
                                            </div>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                                <label style={{ fontSize: 13, fontWeight: 600, color: darkMode ? token.neutral400 : token.neutral600 }}>Catégorie</label>
                                                <select value={form.category_id || ''} onChange={e => {
                                                    const catId = e.target.value;
                                                    const cat = categories.find(c => c.id === catId);
                                                    const price = cat?.daily_price_cents != null ? cat.daily_price_cents : form.daily_price_cents;
                                                    setForm({...form, category_id: catId, daily_price_cents: price || ''});
                                                }} style={{ padding: 12, borderRadius: 10, background: darkMode ? token.dark900 : '#fff', color: darkMode ? '#fff' : '#000', border: `1px solid ${darkMode ? '#334155' : token.neutral200}`, outline: 'none' }}>
                                                    <option value="">-- Catégorie --</option>
                                                    {categories.map(c => (
                                                        <option key={c.id} value={c.id}>
                                                            {c.name}{c.daily_price_cents != null ? ` — ${(c.daily_price_cents/100).toFixed(0)} ${getCurrencySymbol(currency)}/j` : ''}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>

                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                                <label style={{ fontSize: 13, fontWeight: 600, color: darkMode ? token.neutral400 : token.neutral600 }}>Carburant</label>
                                                <select value={form.fuel_type || ''} onChange={e => setForm({...form, fuel_type: e.target.value})} style={{ padding: 12, borderRadius: 10, background: darkMode ? token.dark900 : '#fff', color: darkMode ? '#fff' : '#000', border: `1px solid ${darkMode ? '#334155' : token.neutral200}`, outline: 'none' }}>
                                                    <option value="">-- Carburant --</option>
                                                    <option value="essence">Essence</option>
                                                    <option value="diesel">Diesel</option>
                                                    <option value="hybride">Hybride</option>
                                                    <option value="electrique">Electrique</option>
                                                </select>
                                            </div>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                                <label style={{ fontSize: 13, fontWeight: 600, color: darkMode ? token.neutral400 : token.neutral600 }}>Transmission</label>
                                                <select value={form.transmission || ''} onChange={e => setForm({...form, transmission: e.target.value})} style={{ padding: 12, borderRadius: 10, background: darkMode ? token.dark900 : '#fff', color: darkMode ? '#fff' : '#000', border: `1px solid ${darkMode ? '#334155' : token.neutral200}`, outline: 'none' }}>
                                                    <option value="manuelle">Manuelle</option>
                                                    <option value="automatique">Automatique</option>
                                                </select>
                                            </div>
                                        </div>

                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                                <label style={{ fontSize: 13, fontWeight: 600, color: darkMode ? token.neutral400 : token.neutral600 }}>Nombre de sièges</label>
                                                <input type="number" value={form.seats} onChange={e => setForm({...form, seats: e.target.value})} style={{ padding: 12, borderRadius: 10, background: darkMode ? token.dark900 : '#fff', color: darkMode ? '#fff' : '#000', border: `1px solid ${darkMode ? '#334155' : token.neutral200}`, outline: 'none' }} />
                                            </div>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                                <label style={{ fontSize: 13, fontWeight: 600, color: darkMode ? token.neutral400 : token.neutral600 }}>Nombre de portes</label>
                                                <input type="number" value={form.doors} onChange={e => setForm({...form, doors: e.target.value})} style={{ padding: 12, borderRadius: 10, background: darkMode ? token.dark900 : '#fff', color: darkMode ? '#fff' : '#000', border: `1px solid ${darkMode ? '#334155' : token.neutral200}`, outline: 'none' }} />
                                            </div>
                                        </div>

                                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderRadius: 10, background: darkMode ? token.dark900 : token.neutral50, border: `1px solid ${darkMode ? '#334155' : token.neutral200}` }}>
                                            <input type="checkbox" id="ac" checked={form.ac} onChange={e => setForm({...form, ac: e.target.checked})} style={{ width: 18, height: 18, cursor: 'pointer', accentColor: token.primary }} />
                                            <label htmlFor="ac" style={{ fontSize: 14, fontWeight: 600, color: darkMode ? '#fff' : '#000', cursor: 'pointer' }}>Climatisation (A/C)</label>
                                        </div>
                                    </div>
                                )}

                                {step === 3 && (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, animation: 'fadeIn 0.3s ease-in-out' }}>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                                <label style={{ fontSize: 13, fontWeight: 600, color: darkMode ? token.neutral400 : token.neutral600 }}>VIN (N° Chassis)</label>
                                                <input value={form.vin} onChange={e => setForm({...form, vin: e.target.value})} placeholder="VIN..." style={{ padding: 12, borderRadius: 10, background: darkMode ? token.dark900 : '#fff', color: darkMode ? '#fff' : '#000', border: `1px solid ${darkMode ? '#334155' : token.neutral200}`, outline: 'none' }} />
                                            </div>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                                <label style={{ fontSize: 13, fontWeight: 600, color: darkMode ? token.neutral400 : token.neutral600 }}>Kilométrage (km)</label>
                                                <input type="number" value={form.mileage} onChange={e => setForm({...form, mileage: e.target.value})} style={{ padding: 12, borderRadius: 10, background: darkMode ? token.dark900 : '#fff', color: darkMode ? '#fff' : '#000', border: `1px solid ${darkMode ? '#334155' : token.neutral200}`, outline: 'none' }} />
                                            </div>
                                        </div>

                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                                <label style={{ fontSize: 12, fontWeight: 600, color: darkMode ? token.neutral400 : token.neutral600 }}>Assurance</label>
                                                <input type="date" value={form.insurance_expiry} onChange={e => setForm({...form, insurance_expiry: e.target.value})} style={{ padding: 10, borderRadius: 10, background: darkMode ? token.dark900 : '#fff', color: darkMode ? '#fff' : '#000', border: `1px solid ${darkMode ? '#334155' : token.neutral200}`, outline: 'none', fontSize: 13 }} />
                                            </div>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                                <label style={{ fontSize: 12, fontWeight: 600, color: darkMode ? token.neutral400 : token.neutral600 }}>Dern. Entretien</label>
                                                <input type="date" value={form.last_maintenance_date} onChange={e => setForm({...form, last_maintenance_date: e.target.value})} style={{ padding: 10, borderRadius: 10, background: darkMode ? token.dark900 : '#fff', color: darkMode ? '#fff' : '#000', border: `1px solid ${darkMode ? '#334155' : token.neutral200}`, outline: 'none', fontSize: 13 }} />
                                            </div>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                                <label style={{ fontSize: 12, fontWeight: 600, color: darkMode ? token.neutral400 : token.neutral600 }}>Proc. Entretien</label>
                                                <input type="date" value={form.next_maintenance_date} onChange={e => setForm({...form, next_maintenance_date: e.target.value})} style={{ padding: 10, borderRadius: 10, background: darkMode ? token.dark900 : '#fff', color: darkMode ? '#fff' : '#000', border: `1px solid ${darkMode ? '#334155' : token.neutral200}`, outline: 'none', fontSize: 13 }} />
                                            </div>
                                        </div>

                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                            <label style={{ fontSize: 13, fontWeight: 600, color: darkMode ? token.neutral400 : token.neutral600 }}>Caution (cents)</label>
                                            <input type="number" value={form.deposit_cents} onChange={e => setForm({...form, deposit_cents: e.target.value})} placeholder="500000" style={{ padding: 12, borderRadius: 10, background: darkMode ? token.dark900 : '#fff', color: darkMode ? '#fff' : '#000', border: `1px solid ${darkMode ? '#334155' : token.neutral200}`, outline: 'none' }} />
                                        </div>

                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                            <label style={{ fontSize: 13, fontWeight: 600, color: darkMode ? token.neutral400 : token.neutral600 }}>Notes / Observations</label>
                                            <textarea value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} placeholder="Détails supplémentaires..." rows={3} style={{ padding: 12, borderRadius: 10, background: darkMode ? token.dark900 : '#fff', color: darkMode ? '#fff' : '#000', border: `1px solid ${darkMode ? '#334155' : token.neutral200}`, outline: 'none', resize: 'none' }} />
                                        </div>
                                    </div>
                                )}

                                {/* Modal Footer Navigation */}
                                <div style={{ display: 'flex', gap: 12, marginTop: 12, borderTop: `1px solid ${darkMode ? '#334155' : token.neutral200}`, paddingTop: 24 }}>
                                    {step > 1 && (
                                        <button type="button" onClick={() => setStep(step - 1)} style={{ flex: 1, padding: 14, background: 'transparent', border: `1px solid ${darkMode ? '#334155' : token.neutral200}`, borderRadius: 12, color: darkMode ? '#fff' : '#000', cursor: 'pointer', fontWeight: 600 }}>Précédent</button>
                                    )}
                                    {step < 3 ? (
                                        <button type="button" onClick={() => {
                                            if (step === 1 && (!form.name || !form.plate || !form.daily_price_cents)) {
                                                showError("Veuillez remplir les champs obligatoires (*)");
                                                return;
                                            }
                                            setStep(step + 1);
                                        }} style={{ flex: 1, padding: 14, background: token.primary, color: '#fff', borderRadius: 12, border: 'none', cursor: 'pointer', fontWeight: 600 }}>Suivant</button>
                                    ) : (
                                        <button type="submit" style={{ flex: 1, padding: 14, background: token.primary, color: '#fff', borderRadius: 12, border: 'none', cursor: 'pointer', fontWeight: 600 }}>Enregistrer le véhicule</button>
                                    )}
                                    <button type="button" onClick={() => setShowModal(false)} style={{ padding: '0 24px', background: 'transparent', border: 'none', color: darkMode ? token.neutral400 : token.neutral600, cursor: 'pointer', fontWeight: 600 }}>Annuler</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
