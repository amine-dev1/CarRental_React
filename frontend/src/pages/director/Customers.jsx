import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Users, Search, RefreshCw, Plus, Building2, ShieldAlert, X } from 'lucide-react';
import { api } from '../../api/http';
import { useTheme } from '../../context/ThemeContext';
import { showSuccess, showError } from '../../components/CustomToasts';
import CustomSelect from '../../components/common/CustomSelect';
import PhoneInput from '../../components/PhoneInput';

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

export default function Customers() {
    const { darkMode } = useTheme();
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [typeFilter, setTypeFilter] = useState('all');
    
    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState({ full_name: '', phone: '', phoneRaw: '', email: '', is_company: false, company_name: '', id_number: '' });
    const phoneCountryRef = useRef({ code: '+212' });

    useEffect(() => { loadData(); }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const data = await api('/api/customers');
            setCustomers(data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const fullPhone = form.phoneRaw
                ? `${phoneCountryRef.current?.code || '+212'}${form.phoneRaw}`
                : '';
            const payload = { ...form, phone: fullPhone || undefined };
            delete payload.phoneRaw;
            if (form.id) {
                await api(`/api/customers/${form.id}`, { method: 'PUT', body: payload });
                showSuccess("Client mis à jour avec succès !");
            } else {
                await api('/api/customers', { method: 'POST', body: payload });
                showSuccess("Client ajouté avec succès !");
            }
            setShowModal(false);
            loadData();
        } catch (e) {
            showError(e.message || "Erreur lors de l'enregistrement du client");
        }
    };

    const filtered = useMemo(() => {
        return customers.filter(c => {
            if (typeFilter === 'company' && !c.is_company) return false;
            if (typeFilter === 'individual' && c.is_company) return false;
            if (searchQuery) {
                const q = searchQuery.toLowerCase();
                return (c.full_name||'').toLowerCase().includes(q) || (c.company_name||'').toLowerCase().includes(q);
            }
            return true;
        });
    }, [customers, searchQuery, typeFilter]);

    const stats = {
        total: customers.length,
        companies: customers.filter(c => c.is_company).length,
        blacklisted: customers.filter(c => c.is_blacklisted).length,
    };

    const bg = darkMode ? token.dark900 : token.neutral50;

    return (
        <div style={{ background: bg, minHeight: '100vh', padding: '32px 28px' }}>
            <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 32 }}>

                <div style={{ display: 'flex', alignItems: 'center', justifyItems: 'space-between' }}>
                    <div style={{ flex: 1 }}>
                        <h1 style={{ fontSize: 24, fontWeight: 700, margin: '0 0 4px', color: darkMode ? '#F8FAFC' : token.neutral900 }}>Clients</h1>
                        <p style={{ fontSize: 14, color: darkMode ? token.neutral400 : token.neutral600, margin: 0 }}>Gérez votre base clients</p>
                    </div>
                    <button onClick={() => { setForm({ full_name: '', phone: '', phoneRaw: '', email: '', is_company: false, company_name: '', id_number: '' }); phoneCountryRef.current = { code: '+212' }; setShowModal(true); }} style={{
                        background: token.primary, color: '#fff', border: 'none', padding: '10px 16px', borderRadius: 10, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8
                    }}>
                        <Plus size={16} /> Ajouter un client
                    </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
                    <KpiBlock label="Total Clients" value={stats.total} icon={Users} color={token.primary} darkMode={darkMode} />
                    <KpiBlock label="Entreprises" value={stats.companies} icon={Building2} color={token.success} darkMode={darkMode} />
                    <KpiBlock label="Blacklistés" value={stats.blacklisted} icon={ShieldAlert} color="#EF4444" darkMode={darkMode} />
                </div>

                <div style={{
                    display: 'flex', alignItems: 'center', gap: 16, padding: 16, borderRadius: 12,
                    background: darkMode ? token.dark800 : '#fff', border: `1px solid ${darkMode ? token.dark700 : token.neutral200}`
                }}>
                    <div style={{ flex: 1, position: 'relative' }}>
                        <Search size={18} color={token.neutral400} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
                        <input
                            placeholder="Rechercher..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                            style={{ width: '100%', padding: '10px 14px 10px 42px', background: darkMode ? token.dark900 : token.neutral100, border: 'none', outline: 'none', color: darkMode ? '#fff' : '#000', borderRadius: 8 }}
                        />
                    </div>
                    <CustomSelect
                        value={typeFilter} onChange={setTypeFilter}
                        options={[{ value: 'all', label: 'Tous les types' }, { value: 'individual', label: 'Particuliers' }, { value: 'company', label: 'Entreprises' }]}
                    />
                </div>

                <div style={{ background: darkMode ? token.dark800 : '#fff', borderRadius: 16, overflow: 'hidden', border: `1px solid ${darkMode ? token.dark700 : token.neutral200}` }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead style={{ borderBottom: `1px solid ${darkMode ? token.dark700 : token.neutral200}`, background: darkMode ? token.dark700 : token.neutral50 }}>
                            <tr>
                                <th style={{ padding: '16px 24px', fontSize: 13, color: token.neutral400 }}>Client</th>
                                <th style={{ padding: '16px 24px', fontSize: 13, color: token.neutral400 }}>Contact</th>
                                <th style={{ padding: '16px 24px', fontSize: 13, color: token.neutral400 }}>Locations</th>
                                <th style={{ padding: '16px 24px', fontSize: 13, color: token.neutral400 }}>Type</th>
                                <th style={{ padding: '16px 24px', fontSize: 13, color: token.neutral400, textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map(c => (
                                <tr key={c.id} style={{ borderBottom: `1px solid ${darkMode ? token.dark700 : token.neutral200}` }}>
                                    <td style={{ padding: '16px 24px' }}>
                                        <div style={{ fontWeight: 600, color: c.is_blacklisted ? '#EF4444' : (darkMode ? '#fff' : '#000') }}>{c.full_name}</div>
                                        <div style={{ fontSize: 12, color: token.neutral400 }}>{c.is_company ? c.company_name : c.id_number}</div>
                                    </td>
                                    <td style={{ padding: '16px 24px', fontSize: 14, color: darkMode ? '#fff' : '#000' }}>
                                        {c.phone || c.email || '—'}
                                    </td>
                                    <td style={{ padding: '16px 24px', fontSize: 14, fontWeight: 600, color: darkMode ? '#fff' : '#000' }}>
                                        {c.total_rentals || 0}
                                    </td>
                                    <td style={{ padding: '16px 24px' }}>
                                        {c.is_company ? 
                                            <span style={{background: token.primaryLight, color: token.primary, padding: '4px 8px', borderRadius: 6, fontSize: 12, fontWeight: 600}}>Entreprise</span> : 
                                            <span style={{background: darkMode ? token.dark700 : token.neutral100, color: darkMode ? '#fff' : token.neutral600, padding: '4px 8px', borderRadius: 6, fontSize: 12, fontWeight: 600}}>Particulier</span>
                                        }
                                    </td>
                                    <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                                        <button onClick={() => { setForm(c); setShowModal(true); }} style={{ background: 'none', border: 'none', color: token.primary, cursor: 'pointer', fontWeight: 600 }}>Modifier</button>
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
                                <h2 style={{ margin: 0, color: darkMode ? '#fff' : '#000' }}>{form.id ? 'Edit' : 'New'} Client</h2>
                                <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: token.neutral400 }}><X size={20}/></button>
                            </div>
                            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                                <input value={form.full_name} onChange={e => setForm({...form, full_name: e.target.value})} placeholder="Nom Complet" style={{ padding: 12, borderRadius: 8, background: darkMode ? token.dark900 : '#fff', color: darkMode ? '#fff' : '#000', border: `1px solid ${darkMode ? token.dark700 : token.neutral200}` }} required />
                                <div>
                                    <PhoneInput
                                        value={form.phoneRaw || ''}
                                        onChange={(raw) => setForm({ ...form, phoneRaw: raw })}
                                        onCountryChange={(c) => { phoneCountryRef.current = c; }}
                                        placeholder="6 XX XX XX XX"
                                    />
                                </div>
                                <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="Email" style={{ padding: 12, borderRadius: 8, background: darkMode ? token.dark900 : '#fff', color: darkMode ? '#fff' : '#000', border: `1px solid ${darkMode ? token.dark700 : token.neutral200}` }} />
                                
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 8 }}>
                                    <input type="checkbox" id="iscomp" checked={form.is_company} onChange={e => setForm({...form, is_company: e.target.checked})} style={{width: 16, height: 16}} />
                                    <label htmlFor="iscomp" style={{ color: darkMode ? '#fff' : '#000' }}>Ce client est une entreprise</label>
                                </div>

                                {form.is_company ? (
                                    <input value={form.company_name} onChange={e => setForm({...form, company_name: e.target.value})} placeholder="Nom Entreprise" style={{ padding: 12, borderRadius: 8, background: darkMode ? token.dark900 : '#fff', color: darkMode ? '#fff' : '#000', border: `1px solid ${darkMode ? token.dark700 : token.neutral200}` }} required />
                                ) : (
                                    <input value={form.id_number} onChange={e => setForm({...form, id_number: e.target.value})} placeholder="Numéro CNI/Passeport" style={{ padding: 12, borderRadius: 8, background: darkMode ? token.dark900 : '#fff', color: darkMode ? '#fff' : '#000', border: `1px solid ${darkMode ? token.dark700 : token.neutral200}` }} />
                                )}

                                <button type="submit" style={{ padding: 12, background: token.primary, color: '#fff', borderRadius: 8, border: 'none', cursor: 'pointer', fontWeight: 600 }}>Enregistrer</button>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
