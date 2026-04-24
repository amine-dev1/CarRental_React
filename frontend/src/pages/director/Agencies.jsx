import React, { useState, useEffect } from 'react';
import { api } from '../../api/http';
import {
    Building2,
    Plus,
    X,
    MapPin,
    Phone,
    Mail,
    Search,
    Car,
    AlertCircle,
    Check
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { showSuccess, showError } from '../../components/CustomToasts';

export default function Agencies() {
    const { darkMode } = useTheme();
    const [agencies, setAgencies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [form, setForm] = useState({
        name: '', code: '', address: '', city: '', phone: '', email: '', is_main: false, status: 'active'
    });

    const token = {
        primary: '#6366F1', primaryLight: '#EEF2FF',
        success: '#10B981', successLight: '#D1FAE5',
        warning: '#F59E0B',
        neutral50: '#F8FAFC', neutral100: '#F1F5F9', neutral200: '#E2E8F0',
        neutral400: '#94A3B8', neutral600: '#475569', neutral900: '#0F172A',
        dark900: '#0F172A', dark800: '#1E293B', dark700: '#334155'
    };

    const bg = darkMode ? token.dark900 : token.neutral50;
    const cardBg = darkMode ? token.dark800 : '#FFFFFF';
    const borderColor = darkMode ? token.dark700 : token.neutral200;
    const textPrimary = darkMode ? '#F1F5F9' : token.neutral900;
    const textSecondary = darkMode ? token.neutral400 : token.neutral600;

    useEffect(() => {
        fetchAgencies();
    }, []);

    const fetchAgencies = async () => {
        try {
            const data = await api('/api/agences');
            setAgencies(data || []);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (form.id) {
                await api(`/api/agences/${form.id}`, { method: 'PUT', body: form });
                showSuccess("Agence mise à jour avec succès !");
            } else {
                await api('/api/agences', { method: 'POST', body: form });
                showSuccess("Agence créée avec succès !");
            }
            setShowModal(false);
            setForm({ name: '', code: '', address: '', city: '', phone: '', email: '', is_main: false, status: 'active' });
            fetchAgencies();
        } catch (e) {
            showError(e.message || "Erreur lors de l'enregistrement");
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Supprimer cette agence ?")) return;
        try {
            await api(`/api/agences/${id}`, { method: 'DELETE' });
            showSuccess("Agence supprimée !");
            fetchAgencies();
        } catch (e) {
            showError(e.message || "Erreur lors de la suppression");
        }
    };

    const openEdit = (agency) => {
        setForm(agency);
        setShowModal(true);
    };

    const StatusPill = ({ status }) => {
        if (status === 'active') {
             return <span style={{ background: darkMode ? 'rgba(16, 185, 129, 0.1)' : token.successLight, color: token.success, padding: '4px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600 }}>Actif</span>;
        }
        return <span style={{ background: darkMode ? 'rgba(245, 158, 11, 0.1)' : '#FEF3C7', color: token.warning, padding: '4px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600 }}>Inactif</span>;
    };

    const filtered = agencies.filter(a => a.name.toLowerCase().includes(searchTerm.toLowerCase()));

    return (
        <div style={{ background: bg, minHeight: '100vh', padding: '32px 28px' }}>
            <div style={{ maxWidth: 1200, margin: '0 auto' }}>
                
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
                    <div>
                        <h1 style={{ fontSize: 24, fontWeight: 700, color: textPrimary, margin: '0 0 4px' }}>Agences</h1>
                        <p style={{ fontSize: 14, color: textSecondary, margin: 0 }}>Gérez vos points de location</p>
                    </div>
                </div>

                {/* KPI Strip */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
                    <div style={{ background: cardBg, border: `1px solid ${borderColor}`, borderRadius: 16, padding: '20px 24px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                            <span style={{ fontSize: 13, fontWeight: 500, color: textSecondary }}>Total Agences</span>
                            <div style={{ width: 32, height: 32, borderRadius: 8, background: darkMode ? token.dark700 : token.primaryLight, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Building2 size={16} color={token.primary} />
                            </div>
                        </div>
                        <div style={{ fontSize: 28, fontWeight: 700, color: textPrimary }}>{agencies.length}</div>
                    </div>
                    <div style={{ background: cardBg, border: `1px solid ${borderColor}`, borderRadius: 16, padding: '20px 24px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                            <span style={{ fontSize: 13, fontWeight: 500, color: textSecondary }}>Agence Principale</span>
                            <div style={{ width: 32, height: 32, borderRadius: 8, background: darkMode ? token.dark700 : token.successLight, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Check size={16} color={token.success} />
                            </div>
                        </div>
                        <div style={{ fontSize: 18, fontWeight: 700, color: textPrimary, marginTop: 8 }}>
                            {agencies.find(a => a.is_main)?.name || 'Aucune'}
                        </div>
                    </div>
                </div>

                {/* Action Bar */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, background: cardBg, padding: '16px 20px', borderRadius: 16, border: `1px solid ${borderColor}` }}>
                    <div style={{ position: 'relative', width: 300 }}>
                        <Search size={16} color={textSecondary} style={{ position: 'absolute', left: 14, top: 12 }} />
                        <input
                            placeholder="Rechercher une agence..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{
                                width: '100%', padding: '10px 10px 10px 40px',
                                borderRadius: 10, border: `1px solid ${borderColor}`,
                                fontSize: 14, background: bg, color: textPrimary,
                                outline: 'none'
                            }}
                        />
                    </div>
                    <button 
                        onClick={() => { setForm({ name: '', code: '', address: '', city: '', phone: '', email: '', is_main: false, status: 'active' }); setShowModal(true); }}
                        style={{
                            background: token.primary, color: '#fff', border: 'none', borderRadius: 10,
                            padding: '10px 18px', fontSize: 14, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer'
                        }}
                    >
                        <Plus size={16} /> Nouvelle Agence
                    </button>
                </div>

                {/* Data Table */}
                <div style={{ background: cardBg, borderRadius: 16, border: `1px solid ${borderColor}`, overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead style={{ background: darkMode ? token.dark700 : token.neutral50, borderBottom: `1px solid ${borderColor}` }}>
                            <tr>
                                <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: 13, fontWeight: 600, color: textSecondary }}>Nom</th>
                                <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: 13, fontWeight: 600, color: textSecondary }}>Lieu</th>
                                <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: 13, fontWeight: 600, color: textSecondary }}>Véhicules</th>
                                <th style={{ padding: '16px 24px', textAlign: 'left', fontSize: 13, fontWeight: 600, color: textSecondary }}>Statut</th>
                                <th style={{ padding: '16px 24px', textAlign: 'right', fontSize: 13, fontWeight: 600, color: textSecondary }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.length > 0 ? filtered.map((agency) => (
                                <tr key={agency.id} style={{ borderBottom: `1px solid ${borderColor}` }}>
                                    <td style={{ padding: '16px 24px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                            <div style={{ width: 40, height: 40, borderRadius: 10, background: darkMode ? token.dark700 : token.neutral100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <Building2 size={18} color={token.primary} />
                                            </div>
                                            <div>
                                                <div style={{ fontSize: 14, fontWeight: 600, color: textPrimary, display: 'flex', alignItems: 'center', gap: 8 }}>
                                                    {agency.name}
                                                    {agency.is_main && <span style={{ fontSize: 11, background: token.primaryLight, color: token.primary, padding: '2px 6px', borderRadius: 4 }}>Principale</span>}
                                                </div>
                                                <div style={{ fontSize: 13, color: textSecondary, marginTop: 2 }}>{agency.code || 'Sans code'}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td style={{ padding: '16px 24px' }}>
                                        <div style={{ fontSize: 14, color: textPrimary, display: 'flex', alignItems: 'center', gap: 6 }}><MapPin size={14} color={textSecondary} /> {agency.city || 'Non défini'}</div>
                                        {agency.phone && <div style={{ fontSize: 13, color: textSecondary, marginTop: 4, display: 'flex', alignItems: 'center', gap: 6 }}><Phone size={14} /> {agency.phone}</div>}
                                    </td>
                                    <td style={{ padding: '16px 24px' }}>
                                         <div style={{ fontSize: 14, fontWeight: 600, color: textPrimary }}>{agency.vehicle_count || 0}</div>
                                    </td>
                                    <td style={{ padding: '16px 24px' }}>
                                        <StatusPill status={agency.status} />
                                    </td>
                                    <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                                        <button onClick={() => openEdit(agency)} style={{ background: 'none', border: 'none', color: token.primary, cursor: 'pointer', fontSize: 13, fontWeight: 600, marginRight: 16 }}>Modifier</button>
                                        <button onClick={() => handleDelete(agency.id)} style={{ background: 'none', border: 'none', color: '#EF4444', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>Supprimer</button>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={5} style={{ padding: 40, textAlign: 'center', color: textSecondary }}>
                                        Aucune agence trouvée.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Modal */}
                {showModal && (
                    <div style={{ 
                        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
                        background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 
                    }}>
                        <div style={{ background: cardBg, borderRadius: 20, width: '100%', maxWidth: 500, padding: 32, border: `1px solid ${borderColor}` }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                                <h2 style={{ fontSize: 20, fontWeight: 700, color: textPrimary, margin: 0 }}>{form.id ? 'Modifier l\'agence' : 'Nouvelle agence'}</h2>
                                <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: textSecondary }}><X size={20} /></button>
                            </div>

                            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: textSecondary, marginBottom: 8 }}>Nom de l'agence *</label>
                                    <input 
                                        required value={form.name} onChange={e => setForm({...form, name: e.target.value})}
                                        style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: `1px solid ${borderColor}`, background: bg, color: textPrimary, outline: 'none' }} 
                                    />
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                                    <div>
                                        <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: textSecondary, marginBottom: 8 }}>Code Agence</label>
                                        <input 
                                            value={form.code} onChange={e => setForm({...form, code: e.target.value})}
                                            style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: `1px solid ${borderColor}`, background: bg, color: textPrimary, outline: 'none' }} 
                                        />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: textSecondary, marginBottom: 8 }}>Ville</label>
                                        <input 
                                            value={form.city} onChange={e => setForm({...form, city: e.target.value})}
                                            style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: `1px solid ${borderColor}`, background: bg, color: textPrimary, outline: 'none' }} 
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: textSecondary, marginBottom: 8 }}>Adresse complète</label>
                                    <input 
                                        value={form.address} onChange={e => setForm({...form, address: e.target.value})}
                                        style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: `1px solid ${borderColor}`, background: bg, color: textPrimary, outline: 'none' }} 
                                    />
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                                    <div>
                                        <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: textSecondary, marginBottom: 8 }}>Téléphone</label>
                                        <input 
                                            value={form.phone} onChange={e => setForm({...form, phone: e.target.value})}
                                            style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: `1px solid ${borderColor}`, background: bg, color: textPrimary, outline: 'none' }} 
                                        />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: textSecondary, marginBottom: 8 }}>Email</label>
                                        <input 
                                            type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})}
                                            style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: `1px solid ${borderColor}`, background: bg, color: textPrimary, outline: 'none' }} 
                                        />
                                    </div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 8 }}>
                                    <input 
                                        type="checkbox" checked={form.is_main} id="is_main"
                                        onChange={e => setForm({...form, is_main: e.target.checked})} 
                                        style={{ width: 16, height: 16, accentColor: token.primary }}
                                    />
                                    <label htmlFor="is_main" style={{ fontSize: 14, color: textPrimary, userSelect: 'none', cursor: 'pointer' }}>
                                        Définir comme agence principale
                                    </label>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 24 }}>
                                    <button 
                                        type="button" onClick={() => setShowModal(false)}
                                        style={{ padding: '10px 18px', background: 'transparent', border: `1px solid ${borderColor}`, borderRadius: 10, color: textPrimary, fontWeight: 600, cursor: 'pointer' }}
                                    >
                                        Annuler
                                    </button>
                                    <button 
                                        type="submit"
                                        style={{ padding: '10px 18px', background: token.primary, border: 'none', borderRadius: 10, color: '#fff', fontWeight: 600, cursor: 'pointer' }}
                                    >
                                        {form.id ? 'Mettre à jour' : 'Créer l\'agence'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
